# Try{pl} — IIIF Validator & Gallery

A browser tool for validating and previewing IIIF manifests. Load a single URL or a CSV registry, validate against the IIIF Presentation API, browse your collection as a gallery, and open any manifest in Mirador 3.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 5 |
| Viewer | Mirador 3 (CDN) |
| Validator | [presentation-validator.iiif.io](https://presentation-validator.iiif.io) |
| Hosting | Vercel |

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite; no extra config needed beyond `vercel.json` (already included).

### Option B — GitHub + Vercel dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

---

## CSV format

```csv
parent_collection,name,iiif_link
Medieval Manuscripts,Book of Hours,https://example.org/boh/manifest.json
Medieval Manuscripts,Psalter,https://example.org/psalter/manifest.json
Maps,World Map 1540,https://example.org/maps/manifest.json
```

Supported column aliases:

| Field | Accepted names |
|-------|----------------|
| Name | `name`, `title`, `label`, `item name` |
| URL | `iiif_link`, `manifest`, `manifest_url`, `url`, `iiif`, `link` |
| Group | `parent_collection`, `collection`, `group`, `parent` |

---

## Project structure

```
trypl/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── JsonRain.jsx      # animated left panel
│   │   ├── MiradorViewer.jsx # Mirador 3 wrapper
│   │   └── Sidebar.jsx       # shared manifest tree sidebar
│   ├── hooks/
│   │   └── useItems.js       # central state: items, validate, load
│   ├── pages/
│   │   ├── Home.jsx          # landing + input
│   │   ├── Validator.jsx     # results list
│   │   ├── Gallery.jsx       # thumbnail grid
│   │   └── Viewer.jsx        # Mirador viewer
│   ├── App.jsx               # router + nav
│   ├── iiif.js               # IIIF utils + CSV parser
│   ├── styles.js             # all CSS as a JS string
│   ├── index.css             # minimal reset
│   └── main.jsx              # entry point
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Notes

- The IIIF Validator API is a public service; no API key required.
- Mirador 3 is loaded from jsDelivr CDN at runtime (not bundled).
- All state is in-memory; nothing is persisted between sessions.

