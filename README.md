# Keuka Studios — Project Render Gallery

A Next.js web gallery for browsing architectural render images across hundreds of project folders. Built as a **Vercel-deployable demo** of the Python/Streamlit tool described in the Keuka Studios brief.

## What it does

- **Scans** a projects directory and finds JPG/PNG renders (including subfolders like `renders`, `renderings`, `images`, `keyshot`, etc.)
- **Generates thumbnails** with Sharp (Node.js equivalent of Pillow)
- **Stores an index** in `data/gallery.json` (Vercel-friendly; no SQLite on serverless)
- **Gallery UI** grouped by project with search/filter and lightbox viewer

## Quick start (local demo)

```bash
# 1. Install dependencies
npm install

# 2. Create sample project folders + scan them
npm run seed

# 3. Start the gallery
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scan your own projects folder

```bash
# Full scan (Windows example)
node scripts/scan-projects.js --root "D:\Projects\Completed"

# Incremental — only new projects not already in the index
node scripts/scan-projects.js --root "D:\Projects\Completed" --incremental
```

After scanning, commit `data/gallery.json` and `public/thumbnails/` (or run scan in CI before deploy).

### Scan options

| Option | Default | Description |
|--------|---------|-------------|
| `--root PATH` | `./sample-projects` | Top-level projects directory |
| `--output PATH` | `./data/gallery.json` | Gallery index output |
| `--thumb-dir PATH` | `./public/thumbnails` | Thumbnail storage |
| `--thumb-size N` | `400` | Max thumbnail dimension (px) |
| `--incremental` | off | Skip projects already in index |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Default settings work (`npm run build`)
4. Ensure `data/gallery.json` and thumbnails are committed before deploy

```bash
npm run seed    # or scan your real folder locally first
git add data/gallery.json public/thumbnails sample-projects
git commit -m "Add gallery data"
git push
```

> **Note:** The scan script runs **locally** (or in CI), not on Vercel. Your team re-scans when new projects are added, then redeploys or commits updated JSON + thumbnails.

## Project structure

```
├── app/                    # Next.js pages
├── components/             # Gallery UI
├── data/gallery.json       # Scan index (loaded at build time)
├── public/thumbnails/      # Generated thumbnails + full copies for demo
├── sample-projects/          # Demo project folders
├── scripts/
│   ├── scan-projects.js    # Directory crawler + thumbnail generator
│   └── seed-sample-projects.js
└── lib/                    # Types + data helpers
```

## Mapping to original requirements

| Requirement | Implementation |
|-------------|----------------|
| Walk directories | `scripts/scan-projects.js` (os.walk equivalent) |
| Thumbnails | Sharp (Pillow equivalent) |
| Database | `data/gallery.json` (SQLite replaced for Vercel) |
| Web gallery | Next.js + Streamlit-style grid/search |
| Search by project | Client-side filter on project name |
| Windows Server | Node.js scan script runs on Windows |
| Incremental scan | `--incremental` flag |
| Well-commented code | Comments in scan script + this README |

## Production notes for Keuka

For the full internal deployment on Windows Server with live network paths:

- Run `scan-projects.js` on a schedule (Task Scheduler) pointing at the server share
- Optionally swap JSON for SQLite + a small Python FastAPI backend if not using Vercel
- Add basic auth via Vercel Password Protection or Next.js middleware

---

**Keuka Studios** · Custom Architectural Metal Fabrication · Western New York
