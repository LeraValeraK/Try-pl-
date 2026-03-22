import { useState, useCallback } from 'react';
import JsonRain from '../components/JsonRain.jsx';

// Convert any GitHub blob URL to raw.githubusercontent.com
function toRawUrl(input) {
  try {
    const u = new URL(input.trim());
    if (u.hostname === 'github.com') {
      // https://github.com/user/repo/blob/branch/path.csv
      //   → https://raw.githubusercontent.com/user/repo/branch/path.csv
      const parts = u.pathname.split('/');
      const blobIdx = parts.indexOf('blob');
      if (blobIdx !== -1) {
        parts.splice(blobIdx, 1); // remove "blob"
        return `https://raw.githubusercontent.com${parts.join('/')}`;
      }
    }
    return input.trim();
  } catch {
    return input.trim();
  }
}

export default function Home({ onLoadCSV }) {
  const [ghUrl, setGhUrl]       = useState('');
  const [ghError, setGhError]   = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [fileName, setFileName] = useState('Drop CSV / TSV here');

  const handleGhLoad = useCallback(async () => {
    const raw = toRawUrl(ghUrl);
    setGhError('');
    setGhLoading(true);
    try {
      const res = await fetch(raw);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // derive a display name from the URL path
      const name = raw.split('/').pop() || 'registry.csv';
      onLoadCSV(text, name);
    } catch (e) {
      setGhError(`Could not fetch: ${e.message}`);
    } finally {
      setGhLoading(false);
    }
  }, [ghUrl, onLoadCSV]);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(`// ${f.name}`);
    const reader = new FileReader();
    reader.onload = (ev) => onLoadCSV(ev.target.result, f.name);
    reader.readAsText(f);
  }, [onLoadCSV]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFileName(`// ${f.name}`);
    const reader = new FileReader();
    reader.onload = (ev) => onLoadCSV(ev.target.result, f.name);
    reader.readAsText(f);
  }, [onLoadCSV]);

  return (
    <div className="page">
      <div className="home-split">
        {/* left — image + JSON rain */}
        <div className="left-panel">
          <img
            src="/venus.png"
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'left top',
              opacity: 0.5,
            }}
          />
          <JsonRain />
        </div>

        {/* right — inputs */}
        <div className="right-panel">
          <div className="rp-hero">
            <div className="rp-eyebrow">[IIIF VALIDATION + VIEWING]</div>
            <div className="rp-title">Try<span>&#123;pl&#125;</span></div>
            <div className="rp-desc">
              Validate and preview your IIIF manifests in one place. Load your GitHub spreadsheet or upload a CSV and check your entire collection at once.
            </div>
          </div>

          <div className="input-section">
            {/* GitHub CSV URL */}
            <div className="input-opt">
              <div className="opt-label">
                <span className="opt-tag">[01]</span> GitHub link
              </div>
              <div className="link-row">
                <input
                  className="link-input"
                  type="text"
                  placeholder="https://github.com/user/repo/blob/main/registry.csv"
                  value={ghUrl}
                  onChange={(e) => { setGhUrl(e.target.value); setGhError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && !ghLoading && ghUrl.trim() && handleGhLoad()}
                />
                <button
                  className="btn-primary"
                  onClick={handleGhLoad}
                  disabled={!ghUrl.trim() || ghLoading}
                >
                  {ghLoading ? '…' : 'LOAD ↗'}
                </button>
              </div>
              {ghError && (
                <div style={{ fontSize: 9, color: 'var(--err)', marginTop: 4 }}>{ghError}</div>
              )}
              <div style={{ fontSize: 9, color: 'var(--ink-muted)', marginTop: 3 }}>
                // accepts github.com blob URLs or raw.githubusercontent.com links
              </div>
            </div>

            <div className="divider-or">
              <div className="dline" />
              <div className="dlabel">// or</div>
              <div className="dline" />
            </div>

            {/* local file upload */}
            <div className="input-opt">
              <div className="opt-label">
                <span className="opt-tag">[02]</span> Upload CSV / TSV
              </div>
              <label
                className="upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input type="file" accept=".csv,.tsv,.txt" onChange={handleFile} />
                <div>
                  <div className="upload-main">{fileName}</div>
                  <div className="upload-sub">// .csv or .tsv · parent_collection, name, iiif_link</div>
                </div>
                <span className="btn-upload">BROWSE &#8594;</span>
              </label>
            </div>

            {/* CSV format hint */}
            <div className="csv-hint">
              <div className="csv-hint-label">// expected columns</div>
              <div className="csv-row head">
                <div>[NO]</div><div>[COLUMN]</div><div>[REQ]</div><div>[DESCRIPTION]</div>
              </div>
              <div className="csv-row">
                <div>[01]</div>
                <div><span className="col-code">parent_collection</span></div>
                <div><span className="tag-o">optional</span></div>
                <div style={{ color: 'var(--ink-muted)' }}>Collection grouping</div>
              </div>
              <div className="csv-row">
                <div>[02]</div>
                <div><span className="col-code">name</span></div>
                <div><span className="tag-r">required</span></div>
                <div style={{ color: 'var(--ink-muted)' }}>Display name</div>
              </div>
              <div className="csv-row">
                <div>[03]</div>
                <div><span className="col-code">iiif_link</span></div>
                <div><span className="tag-r">required</span></div>
                <div style={{ color: 'var(--ink-muted)' }}>Manifest URL</div>
              </div>
            </div>
          </div>

          {/* feature tiles */}
          <div className="rp-feats">
            <div className="feat">
              <div className="feat-n">[01]</div>
              <div className="feat-t">SPREADSHEET-DRIVEN</div>
              <div className="feat-d">
                Load your collection from a GitHub-hosted CSV or upload a file directly &mdash; validate your entire registry at once.
              </div>
            </div>
            <div className="feat">
              <div className="feat-n">[02]</div>
              <div className="feat-t">IIIF VALIDATOR</div>
              <div className="feat-d">
                Checks JSON structure and Presentation API compliance.
              </div>
            </div>
            <div className="feat">
              <div className="feat-n">[03]</div>
              <div className="feat-t">ONLINE VIEWER</div>
              <div className="feat-d">
                Preview any manifest in an embedded Mirador viewer.
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
        <div className="foot-r">
          Built with <a href="https://vercel.com">Vercel</a>
        </div>
      </footer>
    </div>
  );
}
