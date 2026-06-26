/**
 * Keuka Studios — Project Render Gallery Scanner
 *
 * Walks a projects directory, finds render images in project folders
 * (including subfolders named renders, renderings, images, etc.),
 * generates thumbnails with Sharp, and writes a JSON index for the
 * Next.js gallery (Vercel-compatible; no SQLite on serverless).
 *
 * Usage:
 *   node scripts/scan-projects.js
 *   node scripts/scan-projects.js --root "D:\Projects" --incremental
 *
 * Options:
 *   --root PATH       Projects root directory (default: ./sample-projects)
 *   --output PATH     JSON output (default: ./data/gallery.json)
 *   --thumb-dir PATH  Thumbnail output (default: ./public/thumbnails)
 *   --incremental     Only scan project folders not yet in the index
 *   --thumb-size N    Max thumbnail dimension in px (default: 400)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const RENDER_FOLDER_NAMES = new Set([
  "renders",
  "renderings",
  "render",
  "images",
  "image",
  "visualization",
  "visualize",
  "keyshot",
  "output",
  "pics",
  "photos",
]);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const DEFAULTS = {
  root: path.join(process.cwd(), "sample-projects"),
  output: path.join(process.cwd(), "data", "gallery.json"),
  thumbDir: path.join(process.cwd(), "public", "thumbnails"),
  thumbSize: 400,
  incremental: false,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { ...DEFAULTS };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--root" && args[i + 1]) opts.root = path.resolve(args[++i]);
    else if (arg === "--output" && args[i + 1])
      opts.output = path.resolve(args[++i]);
    else if (arg === "--thumb-dir" && args[i + 1])
      opts.thumbDir = path.resolve(args[++i]);
    else if (arg === "--thumb-size" && args[i + 1])
      opts.thumbSize = parseInt(args[++i], 10);
    else if (arg === "--incremental") opts.incremental = true;
  }
  return opts;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashPath(filePath) {
  return crypto.createHash("md5").update(filePath).digest("hex").slice(0, 12);
}

function isImageFile(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isRenderSubfolder(folderName) {
  return RENDER_FOLDER_NAMES.has(folderName.toLowerCase());
}

/**
 * Discover top-level project folders under the root.
 * Each immediate child directory is treated as one project.
 */
function listProjectFolders(root) {
  if (!fs.existsSync(root)) {
    console.warn(`Projects root not found: ${root}`);
    return [];
  }
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => ({
      name: d.name,
      path: path.join(root, d.name),
    }));
}

/**
 * Collect render image paths within a project folder.
 * Searches the project root plus known render subfolders (any depth for those names).
 */
function findRenderImages(projectPath) {
  const found = new Set();

  function walk(dir, insideRenderFolder) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const dirName = path.basename(dir);
    const inRender =
      insideRenderFolder || isRenderSubfolder(dirName) || dir === projectPath;

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".")) {
          walk(full, insideRenderFolder || isRenderSubfolder(entry.name));
        }
      } else if (entry.isFile() && isImageFile(entry.name)) {
        // Include images in render subfolders, or directly in project root
        if (inRender || dir === projectPath) {
          found.add(full);
        }
      }
    }
  }

  walk(projectPath, false);
  return [...found].sort();
}

async function createThumbnail(sourcePath, destPath, maxSize) {
  await sharp(sourcePath)
    .rotate()
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(destPath);

  const meta = await sharp(destPath).metadata();
  return { width: meta.width || maxSize, height: meta.height || maxSize };
}

async function copyFullImage(sourcePath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(sourcePath, destPath);
  const meta = await sharp(destPath).metadata();
  return { width: meta.width || 0, height: meta.height || 0 };
}

async function scanProject(project, opts, publicDir) {
  const imagePaths = findRenderImages(project.path);
  const projectId = slugify(project.name);
  const images = [];
  const now = new Date().toISOString();

  for (const sourcePath of imagePaths) {
    const fileHash = hashPath(sourcePath);
    const thumbRel = `/thumbnails/${projectId}/${fileHash}.jpg`;
    const fullRel = `/thumbnails/${projectId}/${fileHash}-full${path.extname(sourcePath).toLowerCase()}`;
    const thumbAbs = path.join(opts.thumbDir, projectId, `${fileHash}.jpg`);
    const fullAbs = path.join(
      publicDir,
      "thumbnails",
      projectId,
      `${fileHash}-full${path.extname(sourcePath).toLowerCase()}`
    );

    fs.mkdirSync(path.dirname(thumbAbs), { recursive: true });

    try {
      const thumbMeta = await createThumbnail(
        sourcePath,
        thumbAbs,
        opts.thumbSize
      );
      await copyFullImage(sourcePath, fullAbs);

      images.push({
        id: `${projectId}-${fileHash}`,
        filename: path.basename(sourcePath),
        sourcePath: path.relative(opts.root, sourcePath).replace(/\\/g, "/"),
        thumbnailUrl: thumbRel,
        fullUrl: fullRel,
        width: thumbMeta.width,
        height: thumbMeta.height,
        scannedAt: now,
      });
    } catch (err) {
      console.warn(`  Skipped ${sourcePath}: ${err.message}`);
    }
  }

  return {
    id: projectId,
    name: project.name,
    folderPath: path.relative(process.cwd(), project.path).replace(/\\/g, "/"),
    coverThumbnail: images[0]?.thumbnailUrl || "",
    imageCount: images.length,
    images,
    lastScanned: now,
  };
}

async function main() {
  const opts = parseArgs();
  const publicDir = path.join(process.cwd(), "public");

  console.log("Keuka Render Gallery — Scan");
  console.log(`  Root:      ${opts.root}`);
  console.log(`  Output:    ${opts.output}`);
  console.log(`  Thumbs:    ${opts.thumbDir}`);
  console.log(`  Incremental: ${opts.incremental}`);

  let existing = { projects: [] };
  if (opts.incremental && fs.existsSync(opts.output)) {
    existing = JSON.parse(fs.readFileSync(opts.output, "utf8"));
  }

  const existingIds = new Set(existing.projects.map((p) => p.id));
  const allFolders = listProjectFolders(opts.root);
  const folders = opts.incremental
    ? allFolders.filter((f) => !existingIds.has(slugify(f.name)))
    : allFolders;

  if (opts.incremental && folders.length < allFolders.length) {
    console.log(
      `  Incremental: skipping ${allFolders.length - folders.length} known project(s)`
    );
  }

  const scanned = [];
  for (const folder of folders) {
    console.log(`Scanning: ${folder.name}`);
    const project = await scanProject(folder, opts, publicDir);
    console.log(`  Found ${project.imageCount} image(s)`);
    scanned.push(project);
  }

  const mergedProjects = opts.incremental
    ? [...existing.projects, ...scanned]
    : scanned;

  mergedProjects.sort((a, b) => a.name.localeCompare(b.name));

  const imageCount = mergedProjects.reduce((n, p) => n + p.imageCount, 0);
  const db = {
    version: 1,
    projectsRoot: path.relative(process.cwd(), opts.root).replace(/\\/g, "/"),
    lastFullScan: new Date().toISOString(),
    projectCount: mergedProjects.length,
    imageCount,
    projects: mergedProjects,
  };

  fs.mkdirSync(path.dirname(opts.output), { recursive: true });
  fs.writeFileSync(opts.output, JSON.stringify(db, null, 2), "utf8");

  console.log("\nDone.");
  console.log(`  Projects: ${db.projectCount}`);
  console.log(`  Images:   ${db.imageCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
