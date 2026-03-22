// ── Validator API ──────────────────────────────────────────────────────────────
// Real response shape:
// { okay: 0|1, error: "None"|"<message>", warnings: ["WARNING: ..."], url: "...", received: "..." }
const BASE = 'https://presentation-validator.iiif.io/validate';

export async function validateManifest(url, version = '') {
  const apiUrl = `${BASE}?url=${encodeURIComponent(url)}&version=${version}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Real response shape:
    // { okay, error: "", warnings: [],
    //   errorList: [ { title: "Error N of M.\n Message: ...", path, detail, context } ] }
    //
    // Normalised internal shape:
    //   { okay, errors: Issue[], warnings: Issue[], raw }
    // where Issue = { message: string, path?: string }

    // Extract clean message from title like "Error 1 of 2.\n Message: foo"
    const parseTitle = (title) => {
      const m = title.match(/Message:\s*(.+)/s);
      return m ? m[1].trim() : title.trim();
    };

    const errors = Array.isArray(data.errorList)
      ? data.errorList.map(e => ({
          message: parseTitle(e.title || ''),
          path: (e.path || '').trim() || undefined,
        })).filter(e => e.message)
      : [];

    // v2 flat error string fallback
    const v2Str = data.error && data.error !== 'None' ? data.error.trim() : null;
    const flatErrors = (!errors.length && v2Str) ? [{ message: v2Str }] : errors;

    const warnings = Array.isArray(data.warnings)
      ? data.warnings
          .map(w => typeof w === 'string' ? { message: w.trim() } : w)
          .filter(w => w && w.message)
      : [];

    const finalErrors = (!flatErrors.length && data.okay === 0)
      ? [{ message: 'Validation failed (no detail returned by validator)' }]
      : flatErrors;

    return { okay: data.okay, errors: finalErrors, warnings, raw: data };
  } catch (e) {
    return { okay: 0, errors: [{ message: String(e.message) }], warnings: [], raw: null };
  }
}

// ── Manifest fetcher ───────────────────────────────────────────────────────────
export async function fetchManifest(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
export function getLabel(manifest) {
  if (!manifest) return 'Untitled';
  const l = manifest.label;
  if (!l) return 'Untitled';
  if (typeof l === 'string') return l;
  if (Array.isArray(l)) return l[0] || 'Untitled';
  if (typeof l === 'object') {
    const vals = Object.values(l);
    if (vals.length) return Array.isArray(vals[0]) ? (vals[0][0] || 'Untitled') : vals[0];
  }
  return 'Untitled';
}

export function getCanvasCount(manifest) {
  if (!manifest) return 0;
  return manifest.sequences?.[0]?.canvases?.length ?? manifest.items?.length ?? 0;
}

export function getThumbnail(manifest) {
  if (!manifest) return null;
  // top-level thumbnail
  const t = manifest.thumbnail;
  if (t) {
    const item = Array.isArray(t) ? t[0] : t;
    if (typeof item === 'string') return item;
    const id = item?.['@id'] || item?.id;
    if (id) return id;
  }
  // first canvas image
  try {
    const canvas =
      manifest.sequences?.[0]?.canvases?.[0] ||
      manifest.items?.[0];
    const img =
      canvas?.images?.[0]?.resource?.['@id'] ||
      canvas?.images?.[0]?.resource?.id ||
      canvas?.items?.[0]?.items?.[0]?.body?.id;
    if (img) return img.replace(/\/full\/full\//, '/full/!200,200/');
  } catch {}
  return null;
}

// ── CSV / TSV parser ───────────────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Auto-detect delimiter: tab wins if the header row contains a tab
  const delim = lines[0].includes('\t') ? '\t' : ',';

  // Split one line, respecting quoted commas (only relevant for CSV mode)
  const splitLine = (line) => {
    if (delim === '\t') return line.split('\t').map((c) => c.trim());
    const out = []; let cur = ''; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    out.push(cur.trim());
    return out;
  };

  const headers = splitLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/^"|"$/g, '').trim()
  );
  const col = (names) => headers.findIndex((h) => names.includes(h));

  const nameIdx  = col(['name', 'title', 'label', 'item name']);
  const urlIdx   = col(['iiif_link', 'manifest', 'manifest_url', 'url', 'iiif', 'link']);
  const groupIdx = col(['parent_collection', 'collection', 'group', 'parent']);

  if (urlIdx === -1) return [];

  return lines
    .slice(1)
    .filter(Boolean)
    .map((line, i) => {
      const cols = splitLine(line).map((c) => c.replace(/^"|"$/g, '').trim());
      const url  = cols[urlIdx]?.trim();
      if (!url) return null;
      // parent_collection is optional — fall back to 'Collection' if absent or empty
      const group = groupIdx >= 0 && cols[groupIdx]?.trim()
        ? cols[groupIdx].trim()
        : 'Collection';
      return {
        id:        `item-${i}`,
        name:      nameIdx >= 0 ? (cols[nameIdx] || `Manifest ${i + 1}`) : `Manifest ${i + 1}`,
        url,
        group,
        status:    'pending',
        result:    null,
        manifest:  null,
        thumbnail: null,
      };
    })
    .filter(Boolean);
}

// ── Status helpers ─────────────────────────────────────────────────────────────
export const statusPip = {
  ok:      '●',
  err:     '●',
  warn:    '●',
  pending: '●',
  loading: '●',
};
export const statusClass = {
  ok:      'ok',
  err:     'err',
  warn:    'warn',
  pending: 'pend',
  loading: 'pend',
};
export const statusTag = {
  ok:      '[valid]',
  err:     '[error]',
  warn:    '[warn]',
  pending: '[—]',
  loading: '[…]',
};
export const statusColor = {
  ok:      'var(--ok)',
  err:     'var(--err)',
  warn:    'var(--warn)',
  pending: 'var(--ink-muted)',
  loading: 'var(--ink-muted)',
};
