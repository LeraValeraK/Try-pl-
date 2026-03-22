import { useEffect, useRef } from 'react';

const TOKENS = [
  '"@context"','"@id"','"@type"','"label"','"value"',
  '"Manifest"','"Canvas"','"Sequence"','"painting"',
  '"width"','"height"','"thumbnail"','"format"',
  '"sc:Manifest"','"oa:Annotation"','1200','800',
  '"image/jpeg"','true','"en"','"2.1"','{}','[]',
  ':',',','"service"','"license"','"motivation"',
  '"description"','"attribution"','"logo"',
];
const tok = () => TOKENS[Math.floor(Math.random() * TOKENS.length)];

export default function JsonRain() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d');

    const resize = () => {
      el.width  = el.offsetWidth;
      el.height = el.offsetHeight;
    };
    resize();

    const TRAIL = 9, COL_W = 44;
    let cols = [];
    const rebuild = () => {
      const n = Math.ceil(el.width / COL_W);
      cols = Array.from({ length: n }, (_, i) => ({
        x:     i * COL_W + 6 + Math.random() * 16,
        y:     -Math.random() * el.height,
        speed: 0.9 + Math.random() * 0.8,
        toks:  Array.from({ length: TRAIL }, tok),
      }));
    };
    rebuild();

    const ro = new ResizeObserver(() => { resize(); rebuild(); });
    ro.observe(el);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.font = '9px ui-monospace,"Courier New",monospace';
      cols.forEach((col) => {
        col.y += col.speed;
        if (col.y > el.height + TRAIL * 14) {
          col.y    = -20 - Math.random() * 80;
          col.toks = Array.from({ length: TRAIL }, tok);
        }
        col.toks.forEach((tk, i) => {
          const y = col.y - i * 13;
          if (y < -10 || y > el.height + 10) return;
          const a = i === 0 ? 0.7 : i === 1 ? 0.4 : i === 2 ? 0.24 : Math.max(0, 0.14 - i * 0.02);
          ctx.fillStyle = i === 0 ? `rgba(62,79,50,${a})` : `rgba(83,82,53,${a})`;
          ctx.fillText(tk, col.x, y);
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}
