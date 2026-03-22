import { useState } from 'react';
import { statusClass } from '../iiif.js';

function CollapsibleGroup({ grp, gitems, selected, onSelect, busy }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        className="tree-group-label"
        onClick={() => setOpen(v => !v)}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          fontSize: 8,
        }}>▼</span>
        {grp}
      </div>
      {open && gitems.map((item) => (
        <div
          key={item.id}
          className={`tree-item ${selected?.id === item.id ? 'sel' : ''}`}
          onClick={() => onSelect(item)}
        >
          <span className={`ti-pip ${statusClass[item.status] || 'pend'}`}>●</span>
          <span className="ti-name">{item.name}</span>
          {item.status === 'loading' && <div className="spinner" style={{ width: 8, height: 8 }} />}
        </div>
      ))}
    </div>
  );
}

export default function Sidebar({
  source, version, items, groups, selected,
  onSelect, onVersionChange, onValidateAll, busy,
  footerExtra,
}) {
  const count = items.length;

  return (
    <aside className="sidebar">
      {/* source block */}
      <div className="sb-block">
        <div className="sb-label">// source</div>
        <div className="sb-source" title={source}>{source || '—'}</div>
        <div className="sb-sync">
          <span className="sync-dot" />
          {count} manifest{count !== 1 ? 's' : ''}
        </div>
      </div>

      {/* version selector */}
      <div className="sb-block">
        <div className="sb-label">// iiif version</div>
        <select
          className="sb-select"
          value={version}
          onChange={(e) => onVersionChange(e.target.value)}
        >
          <option value="">auto-detect</option>
          <option value="1.0">Presentation API 1.0</option>
          <option value="2.0">Presentation API 2.0</option>
          <option value="2.1">Presentation API 2.1</option>
          <option value="3.0">Presentation API 3.0</option>
          <option value="4.0">Presentation API 4.0</option>
        </select>
      </div>

      {/* manifest list header */}
      <div className="sb-hdr">
        <span className="sb-hdr-l">// manifests</span>
        <span className="sb-hdr-r">[{count}]</span>
      </div>

      {/* tree */}
      <div className="tree">
        {Object.entries(groups).map(([grp, gitems]) => (
          <CollapsibleGroup
            key={grp}
            grp={grp}
            gitems={gitems}
            selected={selected}
            onSelect={onSelect}
            busy={busy}
          />
        ))}
        {count === 0 && (
          <div style={{ padding: '12px 14px', fontSize: 9, color: 'var(--ink-muted)' }}>
            No manifests loaded
          </div>
        )}
      </div>

      {/* footer */}
      <div className="sb-footer">
        {footerExtra}
        <button
          className="btn-primary"
          style={{ flex: 1, padding: '6px 0', fontSize: 10 }}
          onClick={onValidateAll}
          disabled={busy || count === 0}
        >
          {busy ? 'VALIDATING…' : 'VALIDATE ALL'}
        </button>
      </div>
    </aside>
  );
}
