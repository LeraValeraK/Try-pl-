import { useState, useEffect, useCallback } from 'react';
import { useItems } from './hooks/useItems.js';
import Home      from './pages/Home.jsx';
import Validator from './pages/Validator.jsx';
import Viewer    from './pages/Viewer.jsx';
import About     from './pages/About.jsx';

export default function App() {
  const [page,     setPage]     = useState('home');
  const [selected, setSelected] = useState(null);
  const [viewer,   setViewer]   = useState(null);
  const [prompt,   setPrompt]   = useState('');   // toast message

  const {
    items, groups, source, version, busy,
    setVersion, runOne, validateAll, loadCSV,
  } = useItems();

  const showPrompt = (msg) => {
    setPrompt('');
    setTimeout(() => setPrompt(msg), 10);
  };

  // ── navigation helpers ────────────────────────────────────────────────────
  const goHome      = useCallback((e) => { e?.preventDefault(); setPage('home'); },      []);
  const goValidator = useCallback((e) => {
    e?.preventDefault();
    if (!items.length) { showPrompt('// upload a CSV file first'); return; }
    setPage('validator');
  }, [items.length]);
  const goViewer    = useCallback((item) => {
    if (item && item.url) { setViewer(item); setSelected(item); }
    if (!items.length) { showPrompt('// upload a CSV file first'); return; }
    setPage('viewer');
  }, [items.length]);
  const goAbout     = useCallback((e) => { e?.preventDefault(); setPage('about'); },     []);

  const handleSelect = useCallback((item) => setSelected(item), []);

  // ── loaders ───────────────────────────────────────────────────────────────
  const handleLoadCSV = useCallback((text, name) => {
    const parsed = loadCSV(text, name);
    if (parsed?.length) {
      setSelected(parsed[0]);
      setPage('validator');
    }
  }, [loadCSV]);

  const handleValidateAll = useCallback(() => validateAll(), [validateAll]);

  // keep viewer item fresh after validation
  useEffect(() => {
    if (!viewer) return;
    const fresh = items.find((i) => i.id === viewer.id);
    if (fresh) setViewer(fresh);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="shell">
      {/* ── NAV ── */}
      <nav className="nav">
        <a href="#" className="nav-logo" onClick={goHome}>
          Try<span>&#123;pl&#125;</span>
        </a>
        <div className="nav-links">
          <a href="#" className={`nav-link ${page === 'home'      ? 'active' : ''}`} onClick={goHome}>
            [HOME]
          </a>
          <a href="#" className={`nav-link ${page === 'validator' ? 'active' : ''} ${!items.length ? 'disabled' : ''}`} onClick={goValidator}>
            [VALIDATOR]
          </a>
          <a href="#" className={`nav-link ${page === 'viewer'    ? 'active' : ''} ${!items.length ? 'disabled' : ''}`} onClick={(e) => { e.preventDefault(); goViewer(viewer || selected); }}>
            [VIEWER]
          </a>
          <a href="#" className={`nav-link ${page === 'about'     ? 'active' : ''}`} onClick={goAbout}>
            [ABOUT]
          </a>
        </div>
      </nav>

      {/* ── UPLOAD PROMPT TOAST ── */}
      {prompt && <div key={prompt} className="nav-prompt">{prompt}</div>}

      {/* ── PAGES ── */}
      {page === 'home' && <Home onLoadCSV={handleLoadCSV} />}

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
          onOpenValidator={(e) => { e?.preventDefault(); setPage('validator'); }}
        />
      )}

      {page === 'about' && <About />}
    </div>
  );
}
