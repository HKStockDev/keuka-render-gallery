/**
 * Creates sample project folders with placeholder render images for demo.
 * Run: node scripts/seed-sample-projects.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(process.cwd(), "sample-projects");

const PROJECTS = [
  {
    name: "2024-River-Oaks-Stair",
    renders: [
      { file: "renders/hero-stair-v3.jpg", color: "#3d4f5f", label: "River Oaks Stair" },
      { file: "renders/railing-detail.png", color: "#5c4a3a", label: "Railing Detail" },
      { file: "renderings/night-view.jpg", color: "#1a2332", label: "Night View" },
    ],
  },
  {
    name: "2023-Lake-House-Balcony",
    renders: [
      { file: "images/balcony-overview.jpg", color: "#4a6741", label: "Balcony Overview" },
      { file: "images/glass-panel.png", color: "#6b8cae", label: "Glass Panel" },
    ],
  },
  {
    name: "2024-Downtown-Loft-Rail",
    renders: [
      { file: "renders/loft-rail-main.jpg", color: "#2b2b2b", label: "Loft Rail" },
      { file: "renders/landing-view.jpg", color: "#8b7355", label: "Landing View" },
      { file: "renders/stringer-closeup.png", color: "#4a4a4a", label: "Stringer Closeup" },
      { file: "keyshot/final-comp.jpg", color: "#c9a962", label: "Final Composite" },
    ],
  },
  {
    name: "2022-Custom-Spiral-Stair",
    renders: [
      { file: "renderings/spiral-hero.jpg", color: "#5d4037", label: "Spiral Hero" },
      { file: "renderings/tread-pattern.png", color: "#795548", label: "Tread Pattern" },
    ],
  },
  {
    name: "2024-Commercial-Atrium",
    renders: [
      { file: "renders/atrium-wide.jpg", color: "#37474f", label: "Atrium Wide" },
      { file: "renders/atrium-rail-section.png", color: "#546e7a", label: "Rail Section" },
      { file: "visualize/client-option-a.jpg", color: "#455a64", label: "Option A" },
      { file: "visualize/client-option-b.jpg", color: "#607d8b", label: "Option B" },
    ],
  },
  {
    name: "2023-Wine-Cellar-Gate",
    renders: [
      { file: "images/gate-front.jpg", color: "#3e2723", label: "Gate Front" },
    ],
  },
];

async function createPlaceholderImage(outPath, color, label, index) {
  const w = 1600;
  const h = 1000;
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="60" y="60" width="${w - 120}" height="${h - 120}" fill="none" stroke="#c9a962" stroke-width="2" opacity="0.5"/>
      <text x="80" y="140" font-family="Georgia, serif" font-size="48" fill="#f8fafc" opacity="0.95">${label}</text>
      <text x="80" y="200" font-family="Arial, sans-serif" font-size="24" fill="#c9a962" opacity="0.8">Keuka Studios — Demo Render ${index + 1}</text>
      <text x="80" y="${h - 80}" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8" opacity="0.6">KeyShot / SOLIDWORKS Visualize placeholder</text>
    </svg>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const ext = path.extname(outPath).toLowerCase();
  const pipeline = sharp(Buffer.from(svg)).resize(w, h);

  if (ext === ".png") {
    await pipeline.png().toFile(outPath);
  } else {
    await pipeline.jpeg({ quality: 90 }).toFile(outPath);
  }
}

async function main() {
  console.log("Seeding sample projects...");
  for (const project of PROJECTS) {
    const projectDir = path.join(ROOT, project.name);
    for (let i = 0; i < project.renders.length; i++) {
      const r = project.renders[i];
      const outPath = path.join(projectDir, r.file);
      await createPlaceholderImage(outPath, r.color, r.label, i);
      console.log(`  Created ${outPath}`);
    }
  }
  console.log("Done seeding sample projects.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
