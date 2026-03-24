import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { statusClass, statusTag } from '../iiif.js';

export default function Validator({
  items, groups, source, version, busy,
  selected, onSelect, onVersionChange,
  onValidateAll, onRunOne, onOpenViewer,
}) {
  const [showLog, setShowLog] = useState(false);

  const okCnt   = items.filter((i) => i.status === 'ok').length;
  const errCnt  = items.filter((i) => i.status === 'err').length;
  const warnCnt = items.filter((i) => i.status === 'warn').length;

  // Build full error log across all validated items
  const logLines = items.flatMap((item) => {
    const errors   = item.result?.errors   || [];
    const warnings = item.result?.warnings || [];
    if (!errors.length && !warnings.length) return [];
    const lines = [`// ${item.name}`];
    errors.forEach((e)   => {
      lines.push(`  ERROR   ${e.message}`);
      if (e.path) lines.push(`          path: ${e.path}`);
    });
    warnings.forEach((w) => {
      lines.push(`  WARNING ${w.message}`);
      if (w.path) lines.push(`          path: ${w.path}`);
    });
    return lines;
  });

  const handleDownloadLog = () => {
    const text = logLines.length
      ? logLines.join('\n')
      : '// No issues found.';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'validation-log.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="page">
      <div className="tool-layout">
        <Sidebar
          source={source}
          version={version}
          items={items}
          groups={groups}
          selected={selected}
          onSelect={onSelect}
          onVersionChange={onVersionChange}
          onValidateAll={onValidateAll}
          busy={busy}
        />

        <div className="results-panel">
          {/* banner */}
          <div className="results-banner">
            <span className="r-title">// results</span>
            <span className="chip chip-total">[{items.length}]</span>
            {okCnt   > 0 && <span className="chip chip-ok">[{okCnt} ok]</span>}
            {errCnt  > 0 && <span className="chip chip-err">[{errCnt} err]</span>}
            {warnCnt > 0 && <span className="chip chip-warn">[{warnCnt} warn]</span>}
            <div className="r-actions">
              {items.some(i => i.result) && (
                <>
                  <button className="btn-ghost bright" onClick={() => setShowLog(v => !v)}>
                    {showLog ? 'HIDE LOG' : 'LOG'}
                  </button>
                  <button className="btn-ghost bright" onClick={handleDownloadLog}>
                    ↓ TXT
                  </button>
                </>
              )}
              {selected && (
                <button
                  className="btn-ghost bright green"
                  onClick={() => onOpenViewer(selected)}
                >
                  VIEWER &#8594;
                </button>
              )}
            </div>
          </div>

          {/* inline log panel */}
          {showLog && (
            <div style={{
              borderBottom: '1px dashed var(--bd)',
              padding: '10px 16px',
              background: 'rgba(26,26,24,0.02)',
              maxHeight: 200,
              overflowY: 'auto',
              flexShrink: 0,
            }}>
              {logLines.length === 0
                ? <div style={{ fontSize: 9, color: 'var(--ok)' }}>// No issues found.</div>
                : logLines.map((line, i) => (
                  <div key={i} style={{
                    fontSize: 9,
                    fontFamily: 'var(--mono)',
                    color: line.startsWith('  ERROR') ? 'var(--err)'
                         : line.startsWith('  WARNING') ? 'var(--warn)'
                         : 'var(--ink-muted)',
                    lineHeight: 1.7,
                    whiteSpace: 'pre',
                  }}>{line}</div>
                ))
              }
            </div>
          )}

          {/* results list */}
          <div className="results-area">
            {items.length === 0 && (
              <div className="empty">
                <div className="empty-icon">📋</div>
                Load a CSV to begin
              </div>
            )}
            {Object.entries(groups).map(([grp, gitems]) => (
              <GroupBlock
                key={grp}
                group={grp}
                items={gitems}
                selected={selected}
                onSelect={onSelect}
                onRunOne={onRunOne}
                onOpenViewer={onOpenViewer}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="foot-l">&copy; 2026 Try&#123;pl&#125;</div>
      </footer>
    </div>
  );
}

// ── collapsible group block ────────────────────────────────────────────────────
function GroupBlock({ group, items, selected, onSelect, onRunOne, onOpenViewer }) {
  const [open, setOpen] = useState(true);

  const errCnt  = items.filter((i) => i.status === 'err').length;
  const warnCnt = items.filter((i) => i.status === 'warn').length;
  const okAll   = items.every((i) => i.status === 'ok');

  const tagClass = errCnt ? 'err' : warnCnt ? 'warn' : okAll ? 'ok' : 'pend';
  const tagText  = errCnt
    ? `[${errCnt} error${errCnt > 1 ? 's' : ''}]`
    : warnCnt
    ? `[${warnCnt} warning${warnCnt > 1 ? 's' : ''}]`
    : okAll ? '[all valid]' : '[pending]';

  return (
    <div className="rgroup">
      <div
        className="rg-hdr"
        onClick={() => setOpen(v => !v)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{
          fontSize: 8,
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          marginRight: 6,
        }}>▼</span>
        <span className="rg-name">{group}</span>
        <span className={`rg-tag ${tagClass}`}>{tagText}</span>
      </div>
      {open && items.map((item) => (
        <ResultCard
          key={item.id}
          item={item}
          selected={selected?.id === item.id}
          onSelect={() => onSelect(item)}
          onRunOne={() => onRunOne(item)}
          onOpenViewer={() => onOpenViewer(item)}
        />
      ))}
    </div>
  );
}

// ── single result card ─────────────────────────────────────────────────────────
function ResultCard({ item, selected, onSelect, onRunOne, onOpenViewer }) {
  const [open, setOpen] = useState(false);
  const errors   = item.result?.errors   || [];
  const warnings = item.result?.warnings || [];
  const total    = errors.length + warnings.length;
  // each is { message, path? }

  return (
    <div className="rcard">
      <div
        className="rc-row"
        onClick={() => { onSelect(); setOpen((v) => !v); }}
      >
        <span className={`rc-pip ${statusClass[item.status] || 'pend'}`}>●</span>
        <span className="rc-name" title={item.url}>{item.name}</span>
        <span className={`rc-tag ${statusClass[item.status] || 'pend'}`}>
          {statusTag[item.status] || '[—]'}
        </span>
        <span className="rc-issues">
          {total > 0 ? `${total} issue${total > 1 ? 's' : ''}` : ''}
          {item.status === 'loading' && (
            <span className="spinner" style={{ width: 8, height: 8, display: 'inline-block', marginLeft: 4 }} />
          )}
        </span>
        <div className="rc-btns">
          {item.status === 'pending' && (
            <button
              className="btn-ghost"
              onClick={(e) => { e.stopPropagation(); onRunOne(); }}
            >
              VALIDATE
            </button>
          )}
          <button
            className="btn-ghost green"
            onClick={(e) => { e.stopPropagation(); onOpenViewer(); }}
          >
            VIEWER &#8594;
          </button>
        </div>
      </div>

      {open && (errors.length > 0 || warnings.length > 0) && (
        <div className="rc-body">
          {errors.map((e, i)   => <IssueRow key={`e${i}`} code="ERROR"   issue={e} cls="e-code" />)}
          {warnings.map((w, i) => <IssueRow key={`w${i}`} code="WARNING" issue={w} cls="e-code-warn" />)}
        </div>
      )}
    </div>
  );
}

function IssueRow({ code, issue, cls }) {
  return (
    <div className="erow" style={{ flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <span className={cls} style={{ flexShrink: 0 }}>{code}</span>
        <span>{issue.message}</span>
      </div>
      {issue.path && (
        <div style={{ paddingLeft: 60, fontSize: 9, color: 'var(--ink-muted)', fontFamily: 'var(--mono)' }}>
          path: {issue.path}
        </div>
      )}
    </div>
  );
}
