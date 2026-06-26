/**
 * Adds one extra sample project folder WITHOUT scanning.
 * Use to demo incremental scan: npm run demo:pending && npm run scan:incremental
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outPath = path.join(
  process.cwd(),
  "sample-projects",
  "2025-Pending-Demo-Stair",
  "renders",
  "pending-hero.jpg"
);

async function main() {
  if (fs.existsSync(outPath)) {
    console.log("Pending demo project already exists:", outPath);
    return;
  }

  const w = 1600;
  const h = 1000;
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4a5568"/>
      <text x="80" y="140" font-family="Georgia, serif" font-size="48" fill="#f8fafc">Pending Demo Stair</text>
      <text x="80" y="200" font-family="Arial, sans-serif" font-size="24" fill="#c9a962">Not yet indexed — run scan:incremental</text>
    </svg>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outPath);
  console.log("Created pending demo project:", outPath);
  console.log("Run: npm run scan:incremental");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
