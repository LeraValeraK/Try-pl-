import { useEffect, useRef } from 'react';

const MIRADOR_JS  = 'https://cdn.jsdelivr.net/npm/mirador@3/dist/mirador.min.js';
const MIRADOR_CSS = 'https://cdn.jsdelivr.net/npm/mirador@3/dist/mirador.min.css';

let cssLoaded = false;
function ensureCSS() {
  if (cssLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = MIRADOR_CSS;
  document.head.appendChild(link);
  cssLoaded = true;
}

function loadMiradorScript() {
  return new Promise((resolve) => {
    if (window.Mirador) return resolve();
    const s = document.createElement('script');
    s.src = MIRADOR_JS;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

export default function MiradorViewer({ manifestUrl }) {
  const wrapRef     = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!manifestUrl || !wrapRef.current) return;
    let mounted = true;

    ensureCSS();

    loadMiradorScript().then(() => {
      if (!mounted || !wrapRef.current) return;
      if (instanceRef.current) {
        try { instanceRef.current = null; } catch {}
        wrapRef.current.innerHTML = '';
      }
      const id  = `mirador-${Date.now()}`;
      const div = document.createElement('div');
      div.id = id;
      wrapRef.current.appendChild(div);

      try {
        instanceRef.current = window.Mirador.viewer({ id, windows: [{ manifestId: manifestUrl }] });
      } catch (e) {
        console.error('[MiradorViewer]', e);
      }
    });

    return () => {
      mounted = false;
      try { instanceRef.current = null; } catch {}
      if (wrapRef.current) wrapRef.current.innerHTML = '';
    };
  }, [manifestUrl]);

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <div className="mirador-loading">
        <div className="mirador-loading-icon">📜</div>
        <span>// loading Mirador</span>
        <div className="spinner" />
      </div>
    </div>
  );
}
