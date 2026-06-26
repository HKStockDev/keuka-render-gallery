# Keuka Studios — Project Render Gallery

A Next.js web gallery for browsing architectural render images across hundreds of project folders. Built as a **Vercel-deployable demo** of the Python/Streamlit tool described in the Keuka Studios brief.

## What it does

- **Scans** a projects directory and finds JPG/PNG renders (including subfolders like `renders`, `renderings`, `images`, `keyshot`, etc.)
- **Generates thumbnails** with Sharp (Node.js equivalent of Pillow)
- **Stores an index** in `data/gallery.json` (Vercel-friendly; no SQLite on serverless)
- **Gallery UI** grouped by project with search/filter and lightbox viewer
- **Incremental re-scan** — index only new project folders
- **Optional password auth** — protect the gallery with a shared password

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

## Incremental re-scan (new projects only)

When new project folders are added to your server, scan **only the new ones**:

```bash
# Preview which projects would be scanned (no files written)
npm run scan:preview

# Scan only projects not already in the index
npm run scan:incremental
```

Or use the **Admin page** at [/admin](http://localhost:3000/admin) when running locally — it shows new vs indexed projects and can trigger scans from the browser.

After scanning, restart the dev server (or commit + redeploy on Vercel):

```bash
git add data/gallery.json public/thumbnails
git push
```

### Scan options (CLI)

| Option | Default | Description |
|--------|---------|-------------|
| `--root PATH` | `./sample-projects` | Top-level projects directory |
| `--output PATH` | `./data/gallery.json` | Gallery index output |
| `--thumb-dir PATH` | `./public/thumbnails` | Thumbnail storage |
| `--thumb-size N` | `400` | Max thumbnail dimension (px) |
| `--incremental` | off | Skip projects already in index |
| `--dry-run` | off | List new projects without scanning |
| `--json` | off | Output machine-readable JSON |

## Optional password authentication

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set a password:

```env
GALLERY_PASSWORD=your-team-password
```

When `GALLERY_PASSWORD` is set, all pages require login. Leave it empty to disable auth (default for demo).

On Vercel, add the same env var in **Project Settings → Environment Variables**.

## Scan your own projects folder

```bash
# Full scan (Windows example)
node scripts/scan-projects.js --root "D:\Projects\Completed"

# Incremental — only new projects not already in the index
node scripts/scan-projects.js --root "D:\Projects\Completed" --incremental
```

After scanning, commit `data/gallery.json` and `public/thumbnails/` (or run scan in CI before deploy).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Default settings work (`npm run build`)
4. Ensure `data/gallery.json` and thumbnails are committed before deploy
5. Optionally set `GALLERY_PASSWORD` in Vercel env vars

```bash
npm run seed    # or scan your real folder locally first
git add data/gallery.json public/thumbnails sample-projects
git commit -m "Add gallery data"
git push
```

> **Note:** The scan script runs **locally** (or in CI), not on Vercel. Your team re-scans when new projects are added, then redeploys or commits updated JSON + thumbnails. The `/admin` page shows pending new projects and CLI commands on Vercel.

## Project structure

```
├── app/
│   ├── admin/              # Scan admin UI
│   ├── login/              # Password login
│   └── api/scan/           # Scan preview + trigger (local only)
├── components/
├── data/gallery.json       # Scan index (loaded at build time)
├── public/thumbnails/      # Generated thumbnails
├── sample-projects/        # Demo project folders
├── scripts/
│   ├── scan-projects.js    # Directory crawler + thumbnail generator
│   └── seed-sample-projects.js
├── middleware.ts           # Optional password protection
└── lib/
```

## Mapping to original requirements

| Requirement | Implementation |
|-------------|----------------|
| Walk directories | `scripts/scan-projects.js` |
| Thumbnails | Sharp (Pillow equivalent) |
| Database | `data/gallery.json` |
| Web gallery | Next.js grid/search/lightbox |
| Search by project | Client-side filter |
| Windows Server | Node.js scan script + `ENABLE_SCAN_API=true` |
| Incremental scan | `--incremental`, `/admin`, `npm run scan:incremental` |
| Basic authentication | `GALLERY_PASSWORD` + middleware |
| Well-commented code | Comments in scan script + this README |

## Production notes for Keuka

For the full internal deployment on Windows Server with live network paths:

- Run `scan-projects.js` on a schedule (Task Scheduler) with `--incremental`
- Set `ENABLE_SCAN_API=true` to allow scans from `/admin` on the local server
- Set `GALLERY_PASSWORD` for team-only access
- Or deploy the viewer to Vercel and run scans locally before each push

---

**Keuka Studios** · Custom Architectural Metal Fabrication · Western New York
