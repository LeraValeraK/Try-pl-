import { useState, useCallback } from 'react';
import JsonRain from '../components/JsonRain.jsx';

const MAX_MB   = 25;
const MAX_SIZE = MAX_MB * 1024 * 1024;

function toRawUrl(input) {
  try {
    const u = new URL(input.trim());
    if (u.hostname === 'github.com') {
      const parts = u.pathname.split('/');
      const blobIdx = parts.indexOf('blob');
      if (blobIdx !== -1) { parts.splice(blobIdx, 1); return `https://raw.githubusercontent.com${parts.join('/')}`; }
    }
    return input.trim();
  } catch { return input.trim(); }
}

function validateColumns(text) {
  const firstLine = text.trim().split(/\r?\n/)[0] || '';
  const delim = firstLine.includes('\t') ? '\t' : ',';
  const headers = firstLine.split(delim).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const hasUrl  = headers.some(h => ['iiif_link','manifest','manifest_url','url','iiif','link'].includes(h));
  const hasName = headers.some(h => ['name','title','label','item name'].includes(h));
  if (!hasUrl && !hasName) return 'Missing required columns: name and iiif_link';
  if (!hasUrl)  return 'Missing required column: iiif_link (manifest URL)';
  if (!hasName) return 'Missing required column: name';
  return null;
}

export default function Home({ onLoadCSV }) {
  const [ghUrl,     setGhUrl]     = useState('');
  const [ghError,   setGhError]   = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [fileName,  setFileName]  = useState('Drop CSV / TSV here');
  const [csvError,  setCsvError]  = useState('');

  const handleGhLoad = useCallback(async () => {
    const raw = toRawUrl(ghUrl);
    setGhError(''); setGhLoading(true);
    try {
      const res = await fetch(raw);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (blob.size > MAX_SIZE) throw new Error(`File exceeds ${MAX_MB} MB limit`);
      const text = await blob.text();
      const colErr = validateColumns(text);
      if (colErr) { setGhError(colErr); return; }
      onLoadCSV(text, raw.split('/').pop() || 'registry.csv');
    } catch (e) {
      setGhError(`Could not fetch: ${e.message}`);
    } finally { setGhLoading(false); }
  }, [ghUrl, onLoadCSV]);

  const processFile = useCallback((f, onError) => {
    if (!f) return;
    if (f.size > MAX_SIZE) { onError(`File exceeds ${MAX_MB} MB limit`); return; }
    setFileName(`// ${f.name}`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const err = validateColumns(ev.target.result);
      if (err) { onError(err); return; }
      onError('');
      onLoadCSV(ev.target.result, f.name);
    };
    reader.readAsText(f);
  }, [onLoadCSV]);

  const handleFile = useCallback((e) => {
    processFile(e.target.files?.[0], setCsvError);
  }, [processFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    processFile(e.dataTransfer.files?.[0], setCsvError);
  }, [processFile]);

  return (
    <div className="page">
      <div className="home-split">
        <div className="left-panel">
          <img src="/venus.png" alt="" className="venus-img" />
          <JsonRain />
        </div>

        <div className="right-panel">
          <div className="rp-hero">
            <div className="rp-eyebrow">[IIIF VALIDATION + VIEWING]</div>
            <div className="rp-title">Try<span>&#123;pl&#125;</span></div>
            <div className="rp-desc">
              Validate and preview your IIIF manifests in one place. Load your GitHub spreadsheet or upload a CSV and check your entire collection at once.
            </div>
          </div>

          <div className="input-section">
            <div className="input-opt">
              <div className="opt-label"><span className="opt-tag">[01]</span> GitHub link</div>
              <div className="link-row">
                <input
                  className="link-input"
                  type="text"
                  placeholder="https://github.com/user/repo/blob/main/registry.csv"
                  value={ghUrl}
                  onChange={(e) => { setGhUrl(e.target.value); setGhError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && !ghLoading && ghUrl.trim() && handleGhLoad()}
                />
                <button className="btn-primary" onClick={handleGhLoad} disabled={!ghUrl.trim() || ghLoading}>
                  {ghLoading ? '…' : 'LOAD ↗'}
                </button>
              </div>
              {ghError && <div className="input-error">{ghError}</div>}
              <div className="input-hint">// accepts github.com blob URLs or raw.githubusercontent.com links</div>
            </div>

            <div className="divider-or">
              <div className="dline" />
              <div className="dlabel">// or</div>
              <div className="dline" />
            </div>

            <div className="input-opt">
              <div className="opt-label"><span className="opt-tag">[02]</span> Upload CSV / TSV</div>
              <label className="upload-zone" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <input type="file" accept=".csv,.tsv,.txt" onChange={handleFile} />
                <div>
                  <div className="upload-main">{fileName}</div>
                  <div className="upload-sub">// .csv or .tsv · max {MAX_MB} MB</div>
                </div>
                <span className="btn-upload">BROWSE &#8594;</span>
              </label>
              {csvError && <div className="input-error">{csvError}</div>}
            </div>

            <div className="csv-hint">
              <div className="csv-hint-label">// expected columns</div>
              <div className="csv-row head">
                <div>[NO]</div><div>[COLUMN]</div><div>[REQ]</div><div>[DESCRIPTION]</div>
              </div>
              <div className="csv-row">
                <div>[01]</div><div><span className="col-code">parent_collection</span></div>
                <div><span className="tag-o">optional</span></div><div>Collection grouping</div>
              </div>
              <div className="csv-row">
                <div>[02]</div><div><span className="col-code">name</span></div>
                <div><span className="tag-r">required</span></div><div>Display name</div>
              </div>
              <div className="csv-row">
                <div>[03]</div><div><span className="col-code">iiif_link</span></div>
                <div><span className="tag-r">required</span></div><div>Manifest URL</div>
              </div>
            </div>
          </div>

          <div className="rp-feats">
            <div className="feat">
              <div className="feat-n">[01]</div>
              <div className="feat-t">SPREADSHEET-DRIVEN</div>
              <div className="feat-d">Load your collection from a GitHub-hosted CSV or upload a file directly — validate your entire registry at once.</div>
            </div>
            <div className="feat">
              <div className="feat-n">[02]</div>
              <div className="feat-t">IIIF VALIDATOR</div>
              <div className="feat-d">Checks JSON structure and Presentation API compliance for versions 1.0 – 4.0.</div>
            </div>
            <div className="feat">
              <div className="feat-n">[03]</div>
              <div className="feat-t">ONLINE VIEWER</div>
              <div className="feat-d">Preview any manifest in an embedded Mirador viewer.</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
      </footer>
    </div>
  );
}
