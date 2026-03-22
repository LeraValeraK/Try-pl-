import Sidebar from '../components/Sidebar.jsx';
import { statusColor, getCanvasCount } from '../iiif.js';

export default function Gallery({
  items, groups, source, version, busy,
  selected, onSelect, onVersionChange,
  onValidateAll, onOpenViewer, onOpenValidator,
}) {
  const pendCnt = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="page">
      <div className="tool-layout">
        <Sidebar
          source={source}
          version={version}
          items={items}
          groups={groups}
          selected={selected}
          onSelect={(item) => { onSelect(item); onOpenViewer(item); }}
          onVersionChange={onVersionChange}
          onValidateAll={onValidateAll}
          busy={busy}
        />

        {/* gallery main */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="gallery-header">
            <span className="gallery-header-title">// gallery</span>
            <span style={{ fontSize: 9, color: 'var(--ink-muted)' }}>
              [{items.length} manifest{items.length !== 1 ? 's' : ''}]
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {pendCnt > 0 && (
                <button
                  className="btn-ghost"
                  onClick={onValidateAll}
                  disabled={busy}
                >
                  {busy ? 'VALIDATING…' : `VALIDATE ${pendCnt} PENDING`}
                </button>
              )}
              <button className="btn-ghost" onClick={onOpenValidator}>
                &#9783; LIST
              </button>
            </div>
          </div>

          <div className="gallery-main">
            {items.length === 0 && (
              <div className="empty">
                <div className="empty-icon">🖼</div>
                No manifests loaded
              </div>
            )}
            {Object.entries(groups).map(([grp, gitems]) => (
              <div className="gallery-group" key={grp}>
                <div className="gallery-group-label">
                  // {grp} [{gitems.length}]
                </div>
                <div className="gallery-grid">
                  {gitems.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onClick={() => onOpenViewer(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
        <div className="foot-r">IIIF Gallery</div>
      </footer>
    </div>
  );
}

function GalleryCard({ item, onClick }) {
  const canvases = item.manifest ? getCanvasCount(item.manifest) : null;

  return (
    <div className="gallery-card" onClick={onClick} title={item.url}>
      <div className="gallery-thumb">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="gallery-placeholder">
            {item.status === 'loading' ? <div className="spinner" /> : '📜'}
          </div>
        )}
        <div
          className="gallery-status-dot"
          style={{ background: statusColor[item.status] || 'var(--ink-muted)' }}
        />
      </div>
      <div className="gallery-info">
        <div className="gallery-name">{item.name}</div>
        <div className="gallery-meta">
          {canvases !== null
            ? `${canvases} canvas${canvases !== 1 ? 'es' : ''}`
            : item.status === 'pending'
            ? 'not validated'
            : item.status === 'loading'
            ? 'loading…'
            : 'no manifest data'}
        </div>
      </div>
    </div>
  );
}
