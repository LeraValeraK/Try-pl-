import { useState, useEffect, useCallback } from 'react';
import { globalCSS } from './styles.js';
import { useItems } from './hooks/useItems.js';
import Home      from './pages/Home.jsx';
import Validator from './pages/Validator.jsx';
import Viewer    from './pages/Viewer.jsx';
import About     from './pages/About.jsx';

// Inject global styles once
const styleEl = document.createElement('style');
styleEl.textContent = globalCSS;
document.head.appendChild(styleEl);

export default function App() {
  const [page,     setPage]     = useState('home');    // home | validator | gallery | viewer
  const [selected, setSelected] = useState(null);      // item in sidebar
  const [viewer,   setViewer]   = useState(null);      // item open in Mirador

  const {
    items, groups, source, version, busy,
    setVersion, runOne, validateAll, loadUrl, loadCSV,
  } = useItems();

  // ── navigation helpers ─────────────────────────────────────────────────────
  const goHome      = useCallback(() => setPage('home'),      []);
  const goValidator = useCallback(() => setPage('validator'), []);
  const goAbout     = useCallback(() => setPage('about'),     []);
  const goViewer    = useCallback((item) => {
    if (item) { setViewer(item); setSelected(item); }
    setPage('viewer');
  }, []);

  // Sync selected → viewer when user clicks sidebar
  const handleSelect = useCallback((item) => setSelected(item), []);

  // ── loaders ────────────────────────────────────────────────────────────────
  const handleLoadUrl = useCallback((url) => {
    const item = loadUrl(url);
    setSelected(item);
    setPage('validator');
  }, [loadUrl]);

  const handleLoadCSV = useCallback((text, name) => {
    const parsed = loadCSV(text, name);
    if (parsed?.length) {
      setSelected(parsed[0]);
      setPage('validator');
    }
  }, [loadCSV]);

  // ── validate helpers ───────────────────────────────────────────────────────
  const handleValidateAll = useCallback(() => validateAll(), [validateAll]);

  // keep viewer item fresh when items array updates (e.g. after validation)
  useEffect(() => {
    if (!viewer) return;
    const fresh = items.find((i) => i.id === viewer.id);
    if (fresh) setViewer(fresh);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  // nav disabled states
  const hasItems = items.length > 0;

  return (
    <div className="shell">
      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-logo">Try<span>&#123;pl&#125;</span></div>
        <div className="nav-links">
          <button className={`nav-btn ${page === 'home'      ? 'active' : ''}`} onClick={goHome}>
            [HOME]
          </button>
          <button
            className={`nav-btn ${page === 'validator' ? 'active' : ''}`}
            onClick={goValidator}
            disabled={!hasItems}
          >
            [VALIDATOR]
          </button>
          <button
            className={`nav-btn ${page === 'viewer'    ? 'active' : ''}`}
            onClick={() => goViewer(viewer || selected)}
            disabled={!hasItems}
          >
            [VIEWER]
          </button>
          <button
            className={`nav-btn ${page === 'about'     ? 'active' : ''}`}
            onClick={goAbout}
          >
            [ABOUT]
          </button>
        </div>
      </nav>

      {/* ── PAGES ── */}
      {page === 'home' && (
        <Home
          onLoadCSV={handleLoadCSV}
        />
      )}

      {page === 'validator' && (
        <Validator
          items={items}
          groups={groups}
          source={source}
          version={version}
          busy={busy}
          selected={selected}
          onSelect={handleSelect}
          onVersionChange={setVersion}
          onValidateAll={handleValidateAll}
          onRunOne={runOne}
          onOpenViewer={goViewer}
        />
      )}


      {page === 'viewer' && (
        <Viewer
          items={items}
          groups={groups}
          source={source}
          current={viewer || selected}
          onSelect={(item) => { setViewer(item); setSelected(item); }}
          onOpenValidator={goValidator}
        />
      )}
      {page === 'about' && <About />}
    </div>
  );
}
