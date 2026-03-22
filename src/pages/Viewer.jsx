import { useState } from 'react';
import MiradorViewer from '../components/MiradorViewer.jsx';
import { statusClass, getCanvasCount } from '../iiif.js';

export default function Viewer({
  items, groups, current, source,
  onSelect, onOpenValidator,
}) {
  const canvases = current?.manifest ? getCanvasCount(current.manifest) : null;

  return (
    <div className="page">
      <div className="viewer-layout">
        {/* sidebar */}
        <aside className="sidebar">
          <div className="sb-block">
            <div className="sb-label">// source</div>
            <div className="sb-source" title={source}>{source || '—'}</div>
            <div className="sb-sync">
              <span className="sync-dot" />
              {items.length} manifest{items.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="sb-hdr">
            <span className="sb-hdr-l">// select manifest</span>
          </div>

          <div className="tree">
            {Object.entries(groups).map(([grp, gitems]) => (
              <CollapsibleGroup
                key={grp}
                group={grp}
                items={gitems}
                current={current}
                onSelect={onSelect}
              />
            ))}
          </div>

          <div className="sb-footer">
            <button className="btn-ghost" onClick={onOpenValidator} style={{ flex: 1 }}>
              &#9783; LIST
            </button>
          </div>
        </aside>

        {/* viewer stage */}
        <div className="viewer-stage">
          <div className="viewer-topbar">
            <span className="viewer-name">{current?.name || '—'}</span>
            {canvases !== null && (
              <span className="viewer-meta">[{canvases} canvas{canvases !== 1 ? 'es' : ''}]</span>
            )}

          </div>

          <div className="mirador-wrap">
            {current?.url ? (
              <MiradorViewer key={current.url} manifestUrl={current.url} />
            ) : (
              <div className="mirador-loading">
                <div className="mirador-loading-icon">📜</div>
                <span>Select a manifest from the sidebar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
        <div className="foot-r">
          <a href="https://projectmirador.org" target="_blank" rel="noreferrer">
            Mirador 3
          </a>
        </div>
      </footer>
    </div>
  );
}

function CollapsibleGroup({ group, items, current, onSelect }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className="tree-group-label"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          fontSize: 8,
        }}>▼</span>
        {group}
      </div>
      {open && items.map((item) => (
        <div
          key={item.id}
          className={`tree-item ${current?.id === item.id ? 'sel' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className={`ti-pip ${statusClass[item.status] || 'pend'}`}>●</span>
          <span className="ti-name">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
