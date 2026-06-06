import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, ArrowRight, Atom, AudioWaveform, BrainCircuit,
  CheckCircle2, ChevronDown, Compass, Eye, EyeOff, Fingerprint, Flame,
  FlaskConical, Footprints, FunctionSquare, Gauge, GitFork, Grid2x2, Grid3x3,
  HelpCircle, LibraryBig, Lightbulb, Link2, Mountain, Music, Quote, Ruler,
  Scale, Shapes, Sigma, Sparkles, Spline, Star, Triangle, Waves, Wind,
  XCircle, Zap,
} from 'lucide-react';

/* ============================================================================
   Partial Differential Equations · the field, the local rule, and the Laplacian
   THE SPINE: a PDE is a local conversation between a point and its neighbors.
   The Laplacian Δu — "the average of my neighbors, minus me" — is the grammar.
   The big three are the SAME spatial operator wired to time three ways:
     heat  uₜ = Δu   relax toward the neighbor-average → smoothing, irreversible
     wave  uₜₜ = Δu   accelerate toward it → ringing, finite speed, reversible
     Laplace Δu = 0   you ARE the neighbor-average → equilibrium, smoothest field
   Fourier diagonalizes Δ (Δ sin kx = −k² sin kx) → one ODE per mode; that single
   idea reappears as separation of variables, spectral methods, von-Neumann
   stability, and "hear the shape of a drum". Closes on reaction–diffusion:
   the smoothing operator, coupled nonlinearly, builds Turing patterns.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- KaTeX ------------------------------------------------------------------
// NB: hex colors inside macro bodies MUST double the '#' (##rrggbb), else KaTeX
// reads the digits as a macro-argument number and the equation falls back to red.

const KATEX_MACROS = {
  '\\lap': '\\textcolor{##a5b4fc}{#1}', // indigo  · Laplacian / the spine
  '\\uu':  '\\textcolor{##e0e7ff}{#1}', // pale    · the field u itself
  '\\kx':  '\\textcolor{##67e8f9}{#1}', // cyan    · space / wavenumber k
  '\\tt':  '\\textcolor{##fbbf24}{#1}', // amber   · time
  '\\src': '\\textcolor{##fb7185}{#1}', // rose    · heat / source / forcing
  '\\wv':  '\\textcolor{##7dd3fc}{#1}', // sky     · wave speed / propagation
  '\\eqm': '\\textcolor{##6ee7b7}{#1}', // emerald · equilibrium / steady state
  '\\an':  '\\textcolor{##f0abfc}{#1}', // fuchsia · anchors / frontier
};

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode, throwOnError: false, output: 'html', strict: 'ignore', macros: KATEX_MACROS,
    });
  } catch (e) {
    return `<span style="color:#f87171">${tex}</span>`;
  }
};

const Eq = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), false), [children]);
  return <span className="eq-inline" dangerouslySetInnerHTML={{ __html: html }} />;
};

const Block = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), true), [children]);
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100 keq-display">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

// --- numeric helpers --------------------------------------------------------

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const fmtN = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);
const lerp = (a, b, t) => a + (b - a) * t;

// A tiny seeded RNG so any synthetic field is deterministic across renders.
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Every Card provides this: true only while the card is near the viewport.
// useRaf reads it so off-screen sims pause — otherwise a dozen live sims run at
// once and the whole page crawls (and slow sims like Gray–Scott never converge).
const RafGate = React.createContext(true);

// requestAnimationFrame loop hook. cb receives dt (seconds, capped) per frame.
// Pauses automatically when its enclosing Card scrolls out of view.
const useRaf = (active, cb) => {
  const gate = React.useContext(RafGate);
  const cbRef = useRef(cb); cbRef.current = cb;
  useEffect(() => {
    if (!active || !gate) return;
    let raf, last = null, stop = false;
    const loop = (t) => {
      if (stop) return;
      const dt = last == null ? 0 : Math.min(0.05, (t - last) / 1000);
      last = t;
      try { cbRef.current(dt); } catch (e) { /* one bad frame must never kill the loop */ }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [active, gate]);
};

// --- colormaps --------------------------------------------------------------
// Each colormap is a function t∈[0,1] → [r,g,b]. Two flavours:
//   sequential (luminance ramp) for non-negative fields (temperature, concentration)
//   diverging (cyan ↔ dark ↔ orange) for SIGNED fields (wave displacement, Δu, modes)

const _mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const makeColormap = (stops) => (t) => {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      return _mix(c0, c1, (t - t0) / (t1 - t0 || 1));
    }
  }
  return stops[stops.length - 1][1];
};

// inferno-ish sequential — good for heat / concentration (dark → magenta → amber → cream)
const CM_INFERNO = makeColormap([
  [0.00, [6, 4, 22]], [0.18, [40, 11, 84]], [0.38, [114, 31, 109]],
  [0.58, [183, 55, 84]], [0.75, [231, 96, 40]], [0.88, [250, 176, 32]], [1.0, [252, 253, 191]],
]);
// diverging — cyan (−) through near-black (0) to orange (+); 0 at the dark middle
const CM_DIVERGING = makeColormap([
  [0.0, [34, 211, 238]], [0.28, [13, 90, 120]], [0.5, [12, 12, 22]],
  [0.72, [150, 60, 38]], [1.0, [251, 146, 60]],
]);
// indigo sequential — neutral scalar fields (relaxation, potentials)
const CM_INDIGO = makeColormap([
  [0.0, [13, 15, 38]], [0.45, [55, 48, 140]], [0.72, [99, 102, 241]], [1.0, [199, 210, 254]],
]);

// Imperative field draw — used directly by perf-critical sims (Gray–Scott, NS).
const drawField = (ctx, field, nx, ny, colormap, domain) => {
  const img = ctx.createImageData(nx, ny);
  let lo, hi;
  if (domain) { lo = domain[0]; hi = domain[1]; }
  else {
    lo = Infinity; hi = -Infinity;
    for (let i = 0; i < field.length; i++) { const v = field[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
  }
  const span = hi - lo < 1e-12 ? 1e-12 : hi - lo;
  const d = img.data;
  for (let i = 0; i < nx * ny; i++) {
    const t = (field[i] - lo) / span;
    const c = colormap(t);
    const j = i * 4;
    d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
};

/* ---- shared: 2D scalar field as a colormap (canvas) -----------------------
   field: Float32Array|number[] length nx*ny, row-major (idx = y*nx + x).
   Redraws whenever `field`, `tick`, or `domain` changes. For 60fps sims, pass a
   monotonically increasing `tick` and mutate the same array in place. */
const Heatmap2D = ({ field, nx, ny, width = 300, height = 300, colormap = CM_INFERNO,
                     domain, smooth = true, tick = 0, className = '', style }) => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    drawField(ctx, field, nx, ny, colormap, domain);
  }, [field, nx, ny, colormap, tick, domain && domain[0], domain && domain[1]]);
  return (
    <canvas ref={ref} width={nx} height={ny} className={className}
      style={{ width, height, imageRendering: smooth ? 'auto' : 'pixelated', display: 'block', borderRadius: 8, ...style }} />
  );
};

/* ---- shared: 1D field u(x) as a filled curve (SVG) ------------------------
   u: number[] sampled on a uniform grid. extra: [{u, accent, dash, width}].
   markers: [{x∈[0,1], color, label?}] vertical guides (e.g. a light-cone edge). */
const Field1D = ({ u, yRange, width = 380, height = 170, accent = '#a5b4fc', fill = true,
                   baseline = 0, extra = [], markers = [], caption, grad = false }) => {
  const uid = React.useId().replace(/:/g, '');
  const n = u.length;
  const [ymin, ymax] = yRange;
  const padL = 8, padR = 8, padT = 10, padB = caption ? 18 : 8;
  const sx = (i) => padL + (i / (n - 1)) * (width - padL - padR);
  const sy = (v) => padT + (1 - (clamp(v, ymin, ymax) - ymin) / (ymax - ymin)) * (height - padT - padB);
  // NB: loops, not Array.map — `u` may be a Float64Array, whose .map coerces
  // returned strings back to numbers (→ NaN). Explicit loops are typed-array-safe.
  const pathOf = (a) => { let s = ''; for (let i = 0; i < a.length; i++) s += `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(a[i]).toFixed(1)} `; return s.trim(); };
  const ptsOf = (a) => { let s = ''; for (let i = 0; i < a.length; i++) s += `${sx(i).toFixed(1)},${sy(a[i]).toFixed(1)} `; return s.trim(); };
  const main = pathOf(u);
  const area = `${main} L${sx(n - 1).toFixed(1)},${sy(baseline).toFixed(1)} L${sx(0).toFixed(1)},${sy(baseline).toFixed(1)} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <defs>
        <linearGradient id={`fg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line x1={padL} y1={sy(baseline)} x2={width - padR} y2={sy(baseline)} stroke="rgba(255,255,255,0.14)" />
      {markers.map((m, i) => {
        const x = padL + m.x * (width - padL - padR);
        return (
          <g key={`mk-${i}`}>
            <line x1={x} y1={padT} x2={x} y2={height - padB} stroke={m.color} strokeOpacity="0.6" strokeDasharray="4 3" strokeWidth="1" />
            {m.label && <text x={x + 3} y={padT + 9} fontSize="9" fill={m.color} fontFamily="ui-monospace, monospace">{m.label}</text>}
          </g>
        );
      })}
      {extra.map((e, i) => (
        <polyline key={`ex-${i}`} fill="none" stroke={e.accent} strokeWidth={e.width ?? 1.6}
          strokeDasharray={e.dash || undefined} strokeOpacity={e.opacity ?? 0.9}
          points={ptsOf(e.u)} />
      ))}
      {fill && <path d={area} fill={`url(#fg-${uid})`} stroke="none" />}
      <path d={main} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {caption && <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{caption}</text>}
    </svg>
  );
};

/* ---- shared: lightweight multi-line time-series plot (ported) -------------
   series: [{ pts:[[x,y],...], color, width?, dash?, label? }] */
const MultiLinePlot = ({ series, xRange, yRange, xLabel, yLabel, width = 380, height = 230,
                         hlines = [], vlines = [], dots = [], legend = true, yTicks, logy = false }) => {
  const padL = 40, padR = 14, padT = 12, padB = 26;
  const [xmin, xmax] = xRange, [ymin, ymax] = yRange;
  const sx = (x) => padL + ((x - xmin) / (xmax - xmin)) * (width - padL - padR);
  const sy = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * (height - padT - padB);
  const ticks = yTicks ?? [ymin, (ymin + ymax) / 2, ymax];
  const clampPt = ([x, y]) => `${sx(x)},${sy(clamp(y, ymin - (ymax - ymin), ymax + (ymax - ymin)))}`;
  return (
    <div>
      {legend && series.some(s => s.label) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-1 text-[10px] font-mono text-neutral-400">
          {series.filter(s => s.label).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span style={{ background: s.color }} className="inline-block w-3 h-[2px]" />{s.label}
            </span>
          ))}
        </div>
      )}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
        <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="rgba(255,255,255,0.18)" />
        <line x1={padL} y1={sy(clamp(0, ymin, ymax))} x2={width - padR} y2={sy(clamp(0, ymin, ymax))} stroke="rgba(255,255,255,0.18)" />
        {ticks.map((t, i) => (
          <g key={`yt-${i}`}>
            <line x1={padL - 3} y1={sy(t)} x2={padL} y2={sy(t)} stroke="rgba(255,255,255,0.3)" />
            <text x={padL - 5} y={sy(t) + 3} fontSize="8" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{Number.isInteger(t) ? t : t.toFixed(1)}</text>
          </g>
        ))}
        <text x={padL - 4} y={padT + 8} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{yLabel}</text>
        <text x={width - padR} y={height - 8} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{xLabel}</text>
        {hlines.map((h, i) => (
          <g key={`hl-${i}`}>
            <line x1={padL} y1={sy(h.at)} x2={width - padR} y2={sy(h.at)} stroke={h.color} strokeOpacity="0.6" strokeDasharray={h.dash ?? '4 3'} strokeWidth="1" />
            {h.label && <text x={width - padR} y={sy(h.at) - 3} fontSize="8" textAnchor="end" fill={h.color} fontFamily="ui-monospace, monospace">{h.label}</text>}
          </g>
        ))}
        {vlines.map((v, i) => (
          <g key={`vl-${i}`}>
            <line x1={sx(v.at)} y1={padT} x2={sx(v.at)} y2={height - padB} stroke={v.color} strokeOpacity="0.6" strokeDasharray={v.dash ?? '4 3'} strokeWidth="1" />
            {v.label && <text x={sx(v.at) + 3} y={padT + 9} fontSize="8" fill={v.color} fontFamily="ui-monospace, monospace">{v.label}</text>}
          </g>
        ))}
        {series.map((s, i) => (
          <polyline key={`s-${i}`} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.8}
            strokeDasharray={s.dash || undefined} strokeLinecap="round" strokeLinejoin="round"
            points={s.pts.map(clampPt).join(' ')} opacity={s.opacity ?? 1} />
        ))}
        {dots.map((d, i) => <circle key={`d-${i}`} cx={sx(d.x)} cy={sy(d.y)} r={d.r ?? 3} fill={d.color} stroke="#0a0a0a" strokeWidth="1" />)}
      </svg>
    </div>
  );
};

/* ---- shared: ping-pong field buffers + a redraw tick ----------------------
   Returns persistent Float64Array buffers (A = current, B = scratch) so live
   sims can step in place without reallocating, plus a `tick` to force canvas
   redraws. `species` = co-located fields (1 for u; 2 for Gray–Scott's u,v). */
const useField = (nx, ny, species = 1) => {
  const ref = useRef(null);
  if (!ref.current || ref.current.nx !== nx || ref.current.ny !== ny || ref.current.species !== species) {
    const mk = () => Array.from({ length: species }, () => new Float64Array(nx * ny));
    ref.current = { nx, ny, species, A: mk(), B: mk() };
  }
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => (t + 1) % 1e9);
  const swap = () => { const t = ref.current.A; ref.current.A = ref.current.B; ref.current.B = t; };
  return { fld: ref.current, tick, bump, swap };
};

/* ---- shared: Fourier mode-amplitude bars (the "equalizer") ----------------
   amps: number[] of |â_k| (or signed). highlight: index to fuchsia-tint.
   Reused by fourier (the equalizer), neuralpde (mode truncation), spectra. */
const FourierEqualizer = ({ amps: ampsIn, width = 380, height = 120, accent = '#a5b4fc',
                            highlight = -1, signed = false, max, labels = true }) => {
  const amps = Array.from(ampsIn); // tolerate Float64Array (whose .map would coerce JSX → NaN)
  const n = amps.length;
  const M = max ?? Math.max(1e-6, ...amps.map((v) => Math.abs(v)));
  const padL = 8, padR = 8, padT = 8, padB = labels ? 16 : 6;
  const bw = (width - padL - padR) / n;
  const baseY = height - padB;
  const barH = (v) => (Math.abs(v) / M) * (height - padT - padB);
  const ticks = labels ? Array.from(new Set([1, Math.ceil(n / 2), n])) : [];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <line x1={padL} y1={baseY} x2={width - padR} y2={baseY} stroke="rgba(255,255,255,0.14)" />
      {amps.map((v, k) => {
        const x = padL + k * bw;
        const bh = Math.max(0, barH(v));
        const col = k === highlight ? '#f0abfc' : signed ? (v >= 0 ? '#fb923c' : '#67e8f9') : accent;
        return <rect key={k} x={x + bw * 0.16} y={baseY - bh} width={Math.max(1, bw * 0.68)} height={bh} fill={col} opacity={k === highlight ? 1 : 0.85} rx="1" />;
      })}
      {ticks.map((k, i) => (
        <text key={i} x={padL + (k - 0.5) * bw} y={height - 4} fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">{k}</text>
      ))}
    </svg>
  );
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  indigo:  { text: 'text-indigo-400',  border: 'border-indigo-400/20',  from: 'from-indigo-500/15' },
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
  teal:    { text: 'text-teal-400',    border: 'border-teal-400/20',    from: 'from-teal-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'indigo', index, source, anchor = false, children }) => {
  const a = accentMap[accent] || accentMap.indigo;
  const secRef = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const check = () => {
      const el = secRef.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight || 800;
      setInView(r.bottom > -500 && r.top < vh + 500);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const id = setInterval(check, 1000); // self-heal in case a scroll event is ever missed
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); clearInterval(id); };
  }, []);
  return (
    <motion.section
      id={id}
      ref={secRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative rounded-2xl bg-neutral-900/60 border ${anchor ? 'border-fuchsia-400/30 ring-1 ring-fuchsia-400/10' : 'border-white/10'} backdrop-blur-sm p-6 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24`}
    >
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            {anchor && <span className="text-fuchsia-300 inline-flex items-center gap-1"><Star className="w-3 h-3 fill-fuchsia-300" /> spine</span>}
            <span className="h-px flex-1 bg-white/10" />
            {source && <span className="text-[10px] normal-case tracking-normal text-neutral-500">{source}</span>}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">
        <RafGate.Provider value={inView}>{children}</RafGate.Provider>
      </div>
    </motion.section>
  );
};

const Deeper = ({ children }) => (
  <div className="relative mt-6 pt-5 border-t border-white/10">
    <div className="absolute -top-[11px] left-0 flex items-center gap-2 bg-neutral-900/80 pr-2">
      <FlaskConical className="w-3.5 h-3.5 text-indigo-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-300">deeper</span>
    </div>
    <div className="text-sm text-neutral-300 leading-relaxed space-y-3">{children}</div>
  </div>
);

const Stat = ({ label, value, sub, color = 'text-neutral-100' }) => (
  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
    <div className={`text-2xl font-mono mt-0.5 ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
  </div>
);

const chipPalette = {
  indigo:  'bg-indigo-500/10 text-indigo-300 border-indigo-400/20',
  sky:     'bg-sky-500/10 text-sky-300 border-sky-400/20',
  violet:  'bg-violet-500/10 text-violet-300 border-violet-400/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  amber:   'bg-amber-500/10 text-amber-300 border-amber-400/20',
  orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20',
  rose:    'bg-rose-500/10 text-rose-300 border-rose-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  teal:    'bg-teal-500/10 text-teal-300 border-teal-400/20',
};
const Chip = ({ children, color = 'indigo' }) => (
  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${chipPalette[color]}`}>{children}</span>
);

// --- Floating tooltip -------------------------------------------------------

const FloatingTip = ({ hover, render, width = 280 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!hover) { setPos(null); return; }
    const el = ref.current;
    const measuredW = el ? el.offsetWidth : width;
    const measuredH = el ? el.offsetHeight : 80;
    const vw = window.innerWidth, vh = window.innerHeight;
    const margin = 10, gap = 14;
    const x = hover.mx ?? 0, y = hover.my ?? 0;
    let left = x + gap;
    if (left + measuredW > vw - margin) left = x - measuredW - gap;
    left = Math.max(margin, Math.min(left, vw - measuredW - margin));
    let top = y - 12;
    if (top + measuredH > vh - margin) top = y - measuredH - gap;
    top = Math.max(margin, Math.min(top, vh - measuredH - margin));
    setPos({ left, top });
  }, [hover, width]);
  if (!hover || typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={ref}
      className="pointer-events-none fixed z-[100] rounded-lg bg-neutral-950/95 border border-white/15 px-3 py-2 text-xs shadow-2xl backdrop-blur-sm"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, maxWidth: width, visibility: pos ? 'visible' : 'hidden' }}
    >
      {render(hover)}
    </div>,
    document.body
  );
};

// --- Glossary + Term --------------------------------------------------------

const GLOSS = {
  'PDE': 'Partial Differential Equation — an equation relating a function of SEVERAL variables (e.g. u(x,t)) to its partial derivatives. Unlike an ODE, which tracks one quantity through time, a PDE tracks an entire field — a whole shape — through space and time.',
  'field': 'A quantity defined at every point of space (and possibly time): a temperature map, a displacement, a pressure. The unknown in a PDE is a field u(x,…), not a single number.',
  'partial derivative': 'The rate of change of a multivariable function when you wiggle ONE variable and hold the rest fixed. ∂u/∂x is the slope in the x-direction at frozen t; ∂u/∂t is the slope in time at frozen x.',
  'Laplacian': 'The operator Δu = ∂²u/∂x² + ∂²u/∂y² (+ …). Locally it measures how far a point sits below the average of its immediate neighbors: Δu > 0 means you are in a valley (neighbors higher). It is the engine of diffusion, waves, and equilibrium alike.',
  'harmonic': 'A field satisfying Δu = 0 — every point exactly equals the average of its neighbors. Harmonic functions have no interior maxima, are infinitely smooth, and are the steady states of the heat equation.',
  'boundary condition': 'Data fixed on the edge of the domain. Dirichlet fixes the value of u (e.g. edge temperature); Neumann fixes its normal derivative (e.g. heat flux / an insulated wall). Elliptic problems are pinned entirely by boundary data.',
  'initial condition': 'The state of the field at t = 0. Time-dependent PDEs (heat, wave) evolve an initial condition forward; the wave equation needs both u and ∂u/∂t at t = 0.',
  'well-posed': 'Hadamard’s criterion: a solution exists, is unique, and depends continuously on the data. Forward heat is well-posed; running heat BACKWARD is ill-posed — tiny noise blows up — which is why you cannot un-blur.',
  'parabolic': 'The diffusion class (heat equation). Discriminant B²−AC = 0. Smoothing, irreversible, infinite propagation speed, governed by a maximum principle; needs initial + boundary data.',
  'hyperbolic': 'The wave class. Discriminant B²−AC > 0, two real characteristics. Finite propagation speed, energy-conserving, reversible, and it transports (does not smooth) singularities.',
  'elliptic': 'The equilibrium class (Laplace/Poisson). Discriminant B²−AC < 0, no real characteristics. No time; every interior point is coupled to the whole boundary at once; solutions are maximally smooth.',
  'characteristic': 'A curve in space-time along which a hyperbolic PDE reduces to an ODE — information travels along it. For uₜ + c uₓ = 0 the characteristics are the lines x − ct = const.',
  'maximum principle': 'For heat and for harmonic functions: the maximum (and minimum) of u over a region is attained on its boundary or in the initial data — never strictly inside. No spontaneous interior hot-spots.',
  'fundamental solution': 'The response of a linear PDE to a single point source (a Dirac δ). By linearity you superpose (convolve) point responses to solve any source — the PDE version of an impulse response.',
  'Green’s function': 'The fundamental solution for a given operator and boundary condition: G(x, x′) is the field produced at x by a unit point source at x′. The full solution is u(x) = ∫ G(x, x′) f(x′) dx′.',
  'heat kernel': 'The fundamental solution of the heat equation: a Gaussian (4πDt)^(−d/2) e^(−|x|²/4Dt) that spreads with width ∝ √t. It is exactly the probability density of a diffusing random walker.',
  'eigenfunction': 'A function the operator merely scales: Δ sin(kx) = −k² sin(kx). Sines/cosines are the eigenfunctions of the Laplacian on nice domains — which is why Fourier series diagonalize PDEs.',
  'Fourier mode': 'A single sinusoid e^{ikx} (or sin/cos) of wavenumber k. Decomposing a field into modes turns a PDE into one independent ODE per mode; high k = fine spatial detail.',
  'separation of variables': 'Seeking solutions of the form u(x,t) = X(x)T(t). The PDE splits into an ODE for X (whose boundary conditions select the Fourier modes) and an ODE for T (the per-mode time evolution).',
  'spectral method': 'A numerical method that represents the field in a global basis of eigenfunctions (Fourier, Chebyshev) and differentiates exactly in that basis — exponentially accurate for smooth solutions.',
  'finite difference': 'Approximating derivatives by neighbor differences on a grid: u_xx ≈ (u_{i+1} − 2u_i + u_{i−1})/Δx². The 5-point stencil is literally the discrete Laplacian.',
  'finite element': 'A method that tiles an arbitrary-geometry domain with small elements and represents the solution by simple basis functions on each, enforcing the equation in a weak (integrated-against-test-functions) form.',
  'CFL condition': 'Courant–Friedrichs–Lewy: an explicit scheme is stable only if its time step is small enough that the numerical domain of dependence contains the physical one. Heat: DΔt/Δx² ≤ ½. Wave: cΔt/Δx ≤ 1.',
  'von Neumann analysis': 'Stability analysis by substituting a Fourier mode e^{ikx} into the scheme and demanding the per-step growth factor satisfy |g| ≤ 1 for every k. It is the CFL condition, derived in Fourier space.',
  'dispersion': 'When different wavenumbers travel at different speeds, so a wave packet spreads out. Non-dispersive waves (the simple wave equation) keep their shape; dispersive ones (Schrödinger, water waves) do not.',
  'shock': 'A discontinuity that forms in finite time from smooth data when a nonlinear wave’s speed depends on its own amplitude, so characteristics cross. The hallmark of nonlinear hyperbolic conservation laws (Burgers).',
  'soliton': 'A solitary traveling wave that keeps its shape because nonlinearity (which steepens) is exactly balanced by dispersion (which spreads). KdV and the nonlinear Schrödinger equation support them.',
  'reaction-diffusion': 'A system of fields that both diffuse and react chemically. With two species diffusing at different rates, a uniform state can go unstable and self-organize into patterns (Turing).',
  'Turing instability': 'Alan Turing’s 1952 discovery: diffusion, normally a smoother, can DESTABILIZE a uniform steady state when a slow-diffusing activator and a fast-diffusing inhibitor are coupled — producing spots and stripes.',
  'vorticity': 'The local spin of a fluid, ω = ∇ × u. In 2D turbulence the vorticity field is advected and stretched, cascading energy across scales — a compact way to visualize Navier–Stokes.',
  'Navier-Stokes': 'The PDEs governing every Newtonian fluid: momentum balance with a nonlinear advection term (u·∇)u plus viscosity. Whether smooth 3D solutions always exist is a Clay Millennium Prize problem.',
  'operator': 'A map that takes a function to another function — like Δ, ∂/∂t, or the whole solution map "initial data ↦ solution". Modern ML methods (neural operators) try to learn that last map directly.',
};

const Term = ({ children, def }) => {
  const [hover, setHover] = useState(null);
  const key = typeof children === 'string' ? children : null;
  const definition = def ?? (key ? GLOSS[key] : null);
  if (!definition) return <>{children}</>;
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  return (
    <>
      <span
        onMouseEnter={track}
        onMouseMove={track}
        onMouseLeave={() => setHover(null)}
        className="underline decoration-dotted decoration-indigo-300/60 underline-offset-[3px] cursor-help text-neutral-100/95"
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={340}
        render={() => (
          <div className="space-y-1">
            {key && <div className="text-[10px] uppercase tracking-wider text-indigo-300">{key}</div>}
            <div className="text-neutral-200 leading-snug">{definition}</div>
          </div>
        )}
      />
    </>
  );
};

// --- Pedagogy primitives ----------------------------------------------------

const Intuition = ({ children, title = 'first, the picture' }) => (
  <div className="mt-2 mb-3 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.04] px-4 py-3">
    <div className="flex items-center gap-2 mb-2">
      <Lightbulb className="w-3.5 h-3.5 text-cyan-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{title}</span>
    </div>
    <div className="text-[14px] leading-relaxed text-neutral-200 space-y-2">{children}</div>
  </div>
);

const ReadEq = ({ children }) => (
  <div className="mt-1 mb-3 pl-3 border-l-2 border-cyan-400/40 text-[13px] text-neutral-300 leading-relaxed">
    <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300 mr-2 font-mono">read as</span>
    {children}
  </div>
);

const MinSchema = ({ children }) => (
  <div className="mt-2 mb-4 rounded-md border border-emerald-400/25 bg-emerald-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-emerald-300 shrink-0" />
    <div className="text-xs text-emerald-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300 mr-2">carry this</span>
      {children}
    </div>
  </div>
);

const WhenItMatters = ({ children }) => (
  <div className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 flex items-start gap-2">
    <Compass className="w-3.5 h-3.5 mt-[2px] text-amber-300 shrink-0" />
    <div className="text-xs text-amber-100/90 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 mr-2">when it matters</span>
      {children}
    </div>
  </div>
);

const Misconception = ({ wrong, right, because }) => (
  <div className="mt-3 rounded-md border border-rose-400/25 bg-rose-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-1">
      <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-rose-300">misconception</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-1">
      <div className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><div><strong className="text-rose-200">Common belief:</strong> {wrong}</div></div>
      <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><div><strong className="text-emerald-200">Actually:</strong> {right}</div></div>
      {because && <div className="pl-4 text-neutral-400"><em>Why:</em> {because}</div>}
    </div>
  </div>
);

const Predict = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-md border border-violet-400/25 bg-violet-400/5 overflow-hidden">
      <div className="px-3 py-2 flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 mt-[2px] text-violet-300 shrink-0" />
        <div className="flex-1 text-xs leading-snug">
          <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300 mb-1">predict first</div>
          <div className="text-neutral-200">{question}</div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="ml-2 text-[10px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2 py-1 flex items-center gap-1 shrink-0"
        >
          {open ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {open ? 'hide' : 'reveal'}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-violet-400/20 bg-violet-400/5"
          >
            <div className="px-3 py-2 text-xs text-neutral-100 leading-snug">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QA = ({ items }) => (
  <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
    <div className="px-3 py-2 flex items-center gap-2 border-b border-white/10 bg-white/[0.02]">
      <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">quick check</span>
      <span className="text-[10px] text-neutral-500">· click to reveal</span>
    </div>
    <div className="divide-y divide-white/5">
      {items.map((it, i) => <QARow key={i} q={it.q} a={it.a} />)}
    </div>
  </div>
);

const QARow = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-white/[0.03] flex items-start gap-2"
      >
        <ChevronDown className={`w-3.5 h-3.5 mt-[2px] text-neutral-500 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
        <span className="flex-1">{q}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
            <div className="px-3 pb-3 pt-0 pl-[30px] text-xs text-neutral-300 leading-snug">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CrossLink = ({ to, children, recap, external = false }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    if (external) return;
    e.preventDefault();
    const el = document.getElementById(to);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
      <a
        href={external ? to : `#${to}`}
        onClick={go}
        onMouseEnter={track}
        onMouseMove={track}
        onMouseLeave={() => setHover(null)}
        className="inline-flex items-baseline gap-1 rounded-sm border border-fuchsia-400/25 bg-fuchsia-400/5 px-1.5 py-0 text-[11px] text-fuchsia-200 hover:bg-fuchsia-400/15 transition-colors no-underline align-baseline"
      >
        <Link2 className="w-2.5 h-2.5 self-center text-fuchsia-300" />
        {children}
      </a>
      {recap && (
        <FloatingTip
          hover={hover}
          width={300}
          render={() => (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">recap · {to}</div>
              <div className="text-neutral-200 leading-snug">{recap}</div>
            </div>
          )}
        />
      )}
    </>
  );
};

const Worked = ({ title = 'Worked example', children }) => (
  <div className="mt-3 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3.5 h-3.5 text-emerald-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300">{title}</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-2">{children}</div>
  </div>
);

const NextSteps = ({ groups }) => {
  const onClick = (e, href) => {
    if (!href || !href.startsWith('#')) return;
    const el = document.getElementById(href.slice(1).replace(/^\//, ''));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  return (
    <div className="space-y-5">
      {groups.map((g, i) => (
        <div key={i}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-indigo-300">{g.title}</span>
            {g.note && <span className="text-[11px] text-neutral-500">— {g.note}</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {g.items.map((it, j) => {
              const isLink = !!it.href;
              const Tag = isLink ? 'a' : 'div';
              const props = isLink ? { href: it.href, onClick: (e) => onClick(e, it.href) } : {};
              return (
                <Tag key={j} {...props}
                  className={`block rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 ${isLink ? 'hover:bg-white/[0.05] hover:border-indigo-400/30 transition-colors' : ''}`}>
                  <div className="text-[12px] text-neutral-100 font-medium leading-snug flex items-baseline gap-1.5">
                    {isLink && <ArrowRight className="w-2.5 h-2.5 self-center text-indigo-300" />}
                    {it.label}
                  </div>
                  {it.note && <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{it.note}</div>}
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Hero -------------------------------------------------------------------
// Decorative background: overlapping circular wavefronts (a diffusing / radiating
// field), drawn statically in indigo/cyan — the "ripples from a point source" motif.

const HeroField = () => {
  const rings = useMemo(() => {
    const out = [];
    const sources = [[26, 38], [72, 30], [50, 74]];
    sources.forEach(([cx, cy], s) => {
      for (let r = 4; r < 60; r += 7) out.push({ cx, cy, r, s });
    });
    return out;
  }, []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
      {rings.map((g, i) => (
        <circle key={i} cx={g.cx} cy={g.cy} r={g.r} fill="none"
          stroke={g.s === 1 ? '#67e8f9' : g.s === 2 ? '#fb7185' : '#a5b4fc'}
          strokeWidth="0.12" opacity={Math.max(0.05, 0.5 - g.r / 130)} />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-rose-500/5" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-indigo-200/80 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-400/20">
          <Waves className="w-3.5 h-3.5" /> partial differential equations
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-indigo-100 to-cyan-200 bg-clip-text text-transparent">
          Partial Differential Equations
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">An ODE tracks a number through time. A PDE tracks a whole shape through space and time.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          A PDE is a <span className="text-indigo-300">local conversation</span> between a point and its neighbors. The
          {' '}<span className="text-indigo-300">Laplacian</span> — your neighbors’ average, minus you — is the grammar.
          {' '}Wire it to time three ways and you get <span className="text-orange-300">heat that smooths</span>,
          {' '}<span className="text-sky-300">waves that travel</span>, and <span className="text-emerald-300">equilibrium that balances</span>.
          {' '}<span className="text-cyan-300">Fourier</span> makes the conversation trivial — and at the end,
          {' '}the very same smoothing operator <span className="text-fuchsia-300">builds living patterns</span>.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-indigo-300">Laplacian · Fourier</span>
          <span className="text-orange-300">heat · diffusion</span>
          <span className="text-sky-300">waves · characteristics</span>
          <span className="text-rose-300">shocks · turbulence</span>
          <span className="text-fuchsia-300">Turing patterns</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// --- Section nav ------------------------------------------------------------

const SECTIONS = [
  { id: 'whatis',          label: 'What is a PDE?',              icon: FunctionSquare },
  { id: 'laplacian',       label: 'The Laplacian',               icon: Grid3x3, anchor: true },
  { id: 'bigthree',        label: 'One operator, three fates',   icon: GitFork, anchor: true },
  { id: 'classify',        label: 'Parabolic · hyperbolic · elliptic', icon: Shapes },
  { id: 'heat',            label: 'The heat equation',           icon: Flame },
  { id: 'heatkernel',      label: 'Heat kernel & random walk',   icon: Footprints },
  { id: 'wave',            label: 'The wave equation',           icon: Waves },
  { id: 'characteristics', label: 'Characteristics',             icon: Spline },
  { id: 'laplace',         label: 'Laplace & Poisson',           icon: Scale },
  { id: 'fourier',         label: 'Fourier: diagonalizing Δ',    icon: AudioWaveform, anchor: true },
  { id: 'greens',          label: "Green's functions",           icon: Zap },
  { id: 'stencils',        label: 'Finite differences',          icon: Grid2x2 },
  { id: 'cfl',             label: 'Stability & CFL',             icon: Gauge, anchor: true },
  { id: 'fem',             label: 'Finite elements & spectral',  icon: Triangle },
  { id: 'gallery',         label: 'Famous PDEs',                 icon: LibraryBig },
  { id: 'burgers',         label: 'Nonlinear waves & shocks',    icon: Mountain },
  { id: 'navierstokes',    label: 'Turbulence & Navier–Stokes',  icon: Wind },
  { id: 'drum',            label: 'Hear the shape of a drum',    icon: Music },
  { id: 'turing',          label: 'Reaction–diffusion · Turing', icon: Fingerprint, anchor: true },
  { id: 'neuralpde',       label: 'PINNs & neural operators',    icon: BrainCircuit },
  { id: 'trails',          label: 'Next trails',                 icon: Compass },
];

const SectionNav = () => {
  const [active, setActive] = useState(SECTIONS[0].id);
  useEffect(() => {
    const onScroll = () => {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - 120 <= 0) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <nav className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20 max-h-[88vh] overflow-y-auto">
        <ul className="space-y-1 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tracking-wide">{s.label}</span>
                  {s.anchor && <Star className="w-2.5 h-2.5 text-fuchsia-300 fill-fuchsia-300" />}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav className="xl:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/70 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-100' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>{s.label}{s.anchor && ' ★'}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   CONTENT CARDS  ·  built stage-by-stage; each is a named stub for now so the
   App export below never changes as bodies are filled in.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor, note }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor} subtitle="(coming together)">
    <div className="text-sm text-neutral-500 italic">{note || 'card under construction — the spine, the equation, and the interactive land here.'}</div>
  </Card>
);

const OdeToPde = () => {
  const NX = 64, NT = 64, Tmax = 0.06;
  const surf = useMemo(() => {
    const A = [1, 0.5, 0.35, 0.2], PH = [0, 1.1, 2.3, 0.7], nu = 0.12;
    const s = new Float64Array(NX * NT);
    for (let ti = 0; ti < NT; ti++) {
      const t = (ti / (NT - 1)) * Tmax;
      for (let xi = 0; xi < NX; xi++) {
        const x = xi / (NX - 1); let v = 0;
        for (let k = 1; k <= 4; k++) v += A[k - 1] * Math.exp(-((k * Math.PI) ** 2) * nu * t) * Math.cos(k * Math.PI * x + PH[k - 1]);
        s[ti * NX + xi] = v;
      }
    }
    return s;
  }, []);
  const at = (xi, ti) => surf[ti * NX + xi];
  const [mode, setMode] = useState('pde');
  const [playing, setPlaying] = useState(true);
  const [ti, setTi] = useState(6);
  const [x0, setX0] = useState(18);
  useRaf(playing, () => setTi((t) => (t + 1) % NT));

  const spatial = useMemo(() => { const a = new Float64Array(NX); for (let i = 0; i < NX; i++) a[i] = at(i, ti); return a; }, [ti, surf]);
  const traj = useMemo(() => { const a = new Float64Array(NT); for (let i = 0; i < NT; i++) a[i] = at(x0, i); return a; }, [x0, surf]);
  const ut = (() => { const tp = Math.min(NT - 1, ti + 1), tm = Math.max(0, ti - 1); const dt = ((tp - tm) / (NT - 1)) * Tmax; return dt > 0 ? (at(x0, tp) - at(x0, tm)) / dt : 0; })();
  const ux = (() => { const xp = Math.min(NX - 1, x0 + 1), xm = Math.max(0, x0 - 1); const dx = (xp - xm) / (NX - 1); return dx > 0 ? (at(xp, ti) - at(xm, ti)) / dx : 0; })();

  const DISP = 300;
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setX0(clamp(Math.round(((e.clientX - r.left) / r.width) * (NX - 1)), 0, NX - 1));
    if (e.buttons === 1) { setPlaying(false); setTi(clamp(Math.round(((e.clientY - r.top) / r.height) * (NT - 1)), 0, NT - 1)); }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="inline-flex rounded-md border border-white/15 overflow-hidden text-[11px] font-mono">
          {['ode', 'pde'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-2.5 py-1 ${mode === m ? 'bg-indigo-500/20 text-indigo-100' : 'text-neutral-400 hover:bg-white/5'}`}>{m === 'ode' ? 'ODE · one number' : 'PDE · a whole shape'}</button>
          ))}
        </div>
        <button onClick={() => setPlaying((p) => !p)} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-200 hover:bg-white/10">{playing ? 'pause' : '▶ play'}</button>
        <label className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">t<input type="range" min="0" max={NT - 1} value={ti} onChange={(e) => { setPlaying(false); setTi(parseInt(e.target.value)); }} className="pde-range w-24" /></label>
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{mode === 'ode' ? 'y(t) = u(x₀, ·) · one thermometer over time' : 'u(·, t) · the whole rod, right now'}</div>
          {mode === 'ode'
            ? <Field1D u={traj} yRange={[-1.2, 1.3]} accent="#fb923c" height={150} markers={[{ x: ti / (NT - 1), color: '#fbbf24', label: 'now' }]} caption="an ODE tracks one value as the clock ticks" />
            : <Field1D u={spatial} yRange={[-1.2, 1.3]} accent="#a5b4fc" height={150} markers={[{ x: x0 / (NX - 1), color: '#67e8f9', label: 'x₀' }]} caption="a PDE tracks the entire profile" />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">the surface u(x, t) · drag the crosshair</div>
          <div className="relative rounded-lg overflow-hidden border border-white/10" style={{ width: '100%', maxWidth: DISP }} onMouseMove={onMove} onMouseLeave={() => {}}>
            <Heatmap2D field={surf} nx={NX} ny={NT} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[-1.2, 1.2]} smooth style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
            <svg viewBox={`0 0 ${NX} ${NT}`} className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1={x0 + 0.5} y1={0} x2={x0 + 0.5} y2={NT} stroke="#67e8f9" strokeWidth={0.4} strokeOpacity={0.9} />
              <line x1={0} y1={ti + 0.5} x2={NX} y2={ti + 0.5} stroke="#fbbf24" strokeWidth={0.4} strokeOpacity={0.9} />
              <circle cx={x0 + 0.5} cy={ti + 0.5} r={1.1} fill="#f0abfc" stroke="#0a0a0a" strokeWidth={0.3} />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-0.5" style={{ maxWidth: DISP }}><span>x = 0</span><span>space x →</span><span>x = 1</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-md border border-cyan-400/20 bg-cyan-400/[0.04] px-3 py-2">
          <div className="text-[9px] uppercase tracking-widest text-cyan-300">uₓ · slope along the rod</div>
          <div className="font-mono text-lg text-cyan-200">{fmtN(ux, 2)}</div>
          <div className="text-[10px] text-neutral-500">wiggle x, freeze t</div>
        </div>
        <div className="rounded-md border border-amber-400/20 bg-amber-400/[0.04] px-3 py-2">
          <div className="text-[9px] uppercase tracking-widest text-amber-300">uₜ · rate of change in time</div>
          <div className="font-mono text-lg text-amber-200">{fmtN(ut, 2)}</div>
          <div className="text-[10px] text-neutral-500">wiggle t, freeze x</div>
        </div>
      </div>
    </div>
  );
};

const WhatIsCard = () => (
  <Card id="whatis" icon={FunctionSquare} title="What is a PDE?" accent="indigo" index={1}
        subtitle="Not a number through time — a whole shape through space and time">
    <p>
      An <Term>ODE</Term>{' '}follows one quantity as time passes — a dot sliding along a line. A <strong>partial</strong>{' '}
      differential equation follows an <strong>entire shape</strong>: a temperature profile, a height field, a pressure map,
      every point of it evolving at once. The unknown is no longer a number-valued <Eq>{'\\uu{y}(t)'}</Eq> but a
      {' '}<Term>field</Term> <Eq>{'\\uu{u}(\\kx{x},\\tt{t})'}</Eq> — a value at every <span className="text-cyan-300">place</span> and every <span className="text-amber-300">moment</span>.
    </p>
    <Intuition>
      A <Term>partial derivative</Term>{' '}is just “how it changes if I wiggle one variable and freeze the others.”
      {' '}<Eq>{'\\uu{u}_{\\tt{t}}'}</Eq> is how fast the value at a fixed spot rises in time; <Eq>{'\\uu{u}_{\\kx{x}}'}</Eq> is the slope along the rod at a frozen instant.
      Drag the crosshair below to read both off the same surface.
    </Intuition>
    <Block>{'\\text{ODE:}\\quad \\frac{d\\uu{y}}{d\\tt{t}}=f(\\uu{y},\\tt{t}) \\qquad\\qquad \\text{PDE:}\\quad \\uu{u}_{\\tt{t}}=f\\!\\left(\\uu{u},\\,\\uu{u}_{\\kx{x}},\\,\\uu{u}_{\\kx{xx}},\\dots\\right)'}</Block>
    <ReadEq>an ODE’s right-hand side sees only <Eq>{'\\uu{y}'}</Eq> and <Eq>{'\\tt{t}'}</Eq>; a PDE’s also sees how the field bends in <em>space</em> — its neighbors. That spatial coupling is the whole story.</ReadEq>
    <OdeToPde />
    <MinSchema>An ODE’s state is a point you push through time; a PDE’s state is a whole function, and the equation links its change in <span className="text-amber-300">time</span> to its shape in <span className="text-cyan-300">space</span>.</MinSchema>
    <Predict question="The rod starts as a wrinkly profile — a few bumps and dips. As the clock runs, does it (a) fade uniformly, (b) spread out and smooth/flatten, or (c) split and travel?">
      <strong>(b) — the wrinkles spread and smooth out</strong>, and the profile flattens. The fine, high-frequency
      wrinkles vanish far faster than the broad ones (this surface is an exact heat-equation solution). Swap that first
      time-derivative <Eq>{'\\uu{u}_{\\tt{t}}'}</Eq> for a second one <Eq>{'\\uu{u}_{\\tt{tt}}'}</Eq> and the same shape would instead
      <em> split and travel</em> — the subject of <CrossLink to="bigthree" recap="Same Δ, three time-couplings: heat smooths, wave travels, Laplace balances.">one operator, three fates</CrossLink>.
    </Predict>
    <Worked title="Read one solution two ways">
      Take <Eq>{'\\uu{u}=e^{-\\pi^2 \\tt{t}}\\kx{\\sin(\\pi x)}'}</Eq> on [0,1]. Freeze <Eq>{'x=\\tfrac12'}</Eq>: the thermometer reads
      {' '}<Eq>{'e^{-\\pi^2 \\tt{t}}'}</Eq>, a pure exponential decay — an ODE you already know. Freeze <Eq>{'\\tt{t}=0'}</Eq>: the snapshot is
      {' '}<Eq>{'\\kx{\\sin(\\pi x)}'}</Eq>, a single arch — a shape in space. And <Eq>{'\\uu{u}_{\\tt{t}}=\\uu{u}_{\\kx{xx}}=-\\pi^2 e^{-\\pi^2 \\tt{t}}\\kx{\\sin(\\pi x)}'}</Eq> — equal! You’ve just
      verified this field obeys the heat equation: its time-slope is exactly its space-curvature.
    </Worked>
    <Misconception
      wrong="A PDE is just an ODE with more variables — solve it the same way."
      right="An ODE’s state is finite-dimensional (a point in ℝⁿ) and is pinned by an initial point. A PDE’s state is an entire function (infinite-dimensional) and is not determined until you ALSO specify boundary conditions in space, not just an initial condition in time."
      because="The unknown lives in a function space, so ‘where the field is held at the edges’ is part of the problem — which is why the same operator can be an evolution problem (heat, wave) or a pure boundary-value problem (Laplace)." />
    <Deeper>
      <p>
        <strong>Vocabulary that classifies everything here.</strong> The <em>order</em> is the highest derivative present (heat
        is first in t, second in x; the wave is second in both). A PDE is <Term>linear</Term> if <Eq>{'\\uu{u}'}</Eq> and its
        derivatives appear only to the first power — then solutions <strong>superpose</strong>, which is exactly what makes
        Fourier work ({' '}<CrossLink to="fourier" recap="Decompose into modes; superposition recombines them.">fourier</CrossLink>). Nonlinear terms like
        {' '}<Eq>{'\\uu{u}\\,\\uu{u}_{\\kx{x}}'}</Eq> break superposition and can form shocks or patterns ({' '}<CrossLink to="burgers" recap="uₜ+uuₓ=0 steepens smooth data into a shock.">burgers</CrossLink>,{' '}<CrossLink to="turing" recap="Reaction + unequal diffusion builds patterns.">turing</CrossLink>).
      </p>
      <p>
        <strong>Well-posedness</strong> (Hadamard): a problem is <Term>well-posed</Term> if a solution exists, is unique, and depends
        continuously on the data. The required data differs by type — heat and wave are initial-boundary-value problems (give
        {' '}<Term>initial condition</Term> at <Eq>{'\\tt{t}=0'}</Eq> plus <Term>boundary condition</Term>s for all t); Laplace is a pure boundary-value
        problem (no time — give <Eq>{'\\uu{u}'}</Eq> on the whole boundary). Run the heat equation <em>backward</em> in time and it becomes
        ill-posed — tiny wiggles blow up ({' '}<CrossLink to="heat" recap="Backward heat amplifies high modes by e^{+k²t}.">the arrow of time</CrossLink>).
      </p>
      <p>
        Throughout, subscripts denote partial derivatives (<Eq>{'\\uu{u}_{\\tt{t}}, \\uu{u}_{\\kx{x}}, \\uu{u}_{\\kx{xx}}'}</Eq>), and
        {' '}<Eq>{'\\lap{\\Delta}\\uu{u}=\\uu{u}_{\\kx{xx}}'}</Eq> in 1D, <Eq>{'\\uu{u}_{\\kx{xx}}+\\uu{u}_{yy}'}</Eq> in 2D. We normalize physical constants to 1 where we can,
        so every displayed number stays clean.
      </p>
    </Deeper>
  </Card>
);
// 1D inset: a wiggly curve whose points are tinted by curvature (Δu) sign.
const CurvatureStrip = ({ width = 380, height = 92 }) => {
  const N = 64;
  const u = useMemo(() => Array.from({ length: N }, (_, i) => {
    const x = i / (N - 1);
    return 0.5 * Math.sin(x * Math.PI * 2) + 0.28 * Math.sin(x * Math.PI * 5 + 1) + 0.13 * Math.sin(x * Math.PI * 9 + 2);
  }), []);
  const padL = 8, padR = 8, padT = 12, padB = 12;
  const ymin = -1, ymax = 1;
  const sx = (i) => padL + (i / (N - 1)) * (width - padL - padR);
  const sy = (v) => padT + (1 - (clamp(v, ymin, ymax) - ymin) / (ymax - ymin)) * (height - padT - padB);
  const lap = (i) => (i === 0 || i === N - 1) ? 0 : u[i + 1] + u[i - 1] - 2 * u[i];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <line x1={padL} y1={sy(0)} x2={width - padR} y2={sy(0)} stroke="rgba(255,255,255,0.12)" />
      <polyline fill="none" stroke="#a5b4fc" strokeWidth="1.4" opacity="0.55" points={u.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
      {u.map((v, i) => {
        const c = lap(i);
        if (Math.abs(c) < 1e-4) return null;
        return <circle key={i} cx={sx(i)} cy={sy(v)} r="2.4" fill={c > 0 ? '#fb923c' : '#67e8f9'} />;
      })}
      <text x={padL} y={height - 2} fontSize="9" fill="#fb923c" fontFamily="ui-monospace, monospace">● valley · Δu&gt;0 (pulled up)</text>
      <text x={width - padR} y={height - 2} fontSize="9" textAnchor="end" fill="#67e8f9" fontFamily="ui-monospace, monospace">peak · Δu&lt;0 (pulled down) ●</text>
    </svg>
  );
};

const LaplacianProbe = () => {
  const NX = 48, NY = 48, N = NX * NY;
  const DISP = 340;
  const seedField = (arr, s) => {
    const rnd = mulberry32(s);
    const blobs = Array.from({ length: 5 }, () => ({ cx: 4 + rnd() * (NX - 8), cy: 4 + rnd() * (NY - 8), r: 5 + rnd() * 9, a: rnd() * 2 - 1 }));
    for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
      let v = 0;
      for (const b of blobs) { const d2 = (x - b.cx) ** 2 + (y - b.cy) ** 2; v += b.a * Math.exp(-d2 / (2 * b.r * b.r)); }
      arr[y * NX + x] = v;
    }
  };
  const A = useRef(null), B = useRef(null), seedRef = useRef(11);
  if (!A.current) { A.current = new Float64Array(N); B.current = new Float64Array(N); seedField(A.current, seedRef.current); }
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [alpha, setAlpha] = useState(0.20);
  const [hover, setHover] = useState(null);

  const reset = () => { seedRef.current = (seedRef.current * 1103515245 + 12345) >>> 0; seedField(A.current, seedRef.current); setPlaying(false); setTick((t) => t + 1); };

  const step = () => {
    const u = A.current, w = B.current;
    for (let y = 1; y < NY - 1; y++) for (let x = 1; x < NX - 1; x++) {
      const i = y * NX + x;
      w[i] = u[i] + alpha * (u[i - 1] + u[i + 1] + u[i - NX] + u[i + NX] - 4 * u[i]);
    }
    for (let x = 0; x < NX; x++) { w[x] = u[x]; w[(NY - 1) * NX + x] = u[(NY - 1) * NX + x]; }
    for (let y = 0; y < NY; y++) { w[y * NX] = u[y * NX]; w[y * NX + NX - 1] = u[y * NX + NX - 1]; }
    A.current = w; B.current = u;
  };
  useRaf(playing, () => {
    step(); step();
    let mx = 0; const u = A.current;
    for (let i = 0; i < N; i++) { const a = Math.abs(u[i]); if (a > mx) mx = a; }
    if (!isFinite(mx) || mx > 1e6) seedField(A.current, seedRef.current);
    setTick((t) => (t + 1) % 1e9);
  });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ix = clamp(Math.floor(((e.clientX - r.left) / r.width) * NX), 0, NX - 1);
    const iy = clamp(Math.floor(((e.clientY - r.top) / r.height) * NY), 0, NY - 1);
    setHover({ ix, iy });
  };

  let probe = null;
  if (hover) {
    const { ix, iy } = hover; const u = A.current;
    const get = (xx, yy) => (xx >= 0 && xx < NX && yy >= 0 && yy < NY) ? u[yy * NX + xx] : 0;
    const e = get(ix + 1, iy), w = get(ix - 1, iy), n = get(ix, iy - 1), s = get(ix, iy + 1);
    const sum = e + w + n + s, me = u[iy * NX + ix];
    probe = { me, avg: sum / 4, lap: sum - 4 * me };
  }
  const unstable = alpha >= 0.25;

  return (
    <div className="mt-3 grid md:grid-cols-[340px_1fr] gap-4 items-start">
      <div>
        <div className="relative rounded-lg overflow-hidden border border-white/10" style={{ width: '100%', maxWidth: DISP }}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <Heatmap2D field={A.current} nx={NX} ny={NY} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[-1.2, 1.2]} tick={tick} smooth style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
          <svg viewBox={`0 0 ${NX} ${NY}`} className="absolute inset-0 w-full h-full pointer-events-none">
            {hover && (
              <>
                {[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy], i) => {
                  const x = hover.ix + dx, y = hover.iy + dy;
                  if (x < 0 || x >= NX || y < 0 || y >= NY) return null;
                  return <rect key={i} x={x} y={y} width={1} height={1} fill="none" stroke="#a5b4fc" strokeWidth={0.35} />;
                })}
                <rect x={hover.ix} y={hover.iy} width={1} height={1} fill="none" stroke="#f0abfc" strokeWidth={0.45} />
              </>
            )}
          </svg>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <button onClick={() => setPlaying((p) => !p)} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-200 hover:bg-white/10">{playing ? 'pause' : '▶ relax'}</button>
          <button onClick={reset} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/10">reset blobs</button>
          <label className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
            α<input type="range" min="0.05" max="0.30" step="0.01" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className="pde-range w-20" />
            <span className={`tabular-nums ${unstable ? 'text-rose-300' : 'text-neutral-300'}`}>{alpha.toFixed(2)}</span>
          </label>
        </div>
        {unstable && <div className="text-[10px] text-rose-300 font-mono mt-1">α ≥ ¼ → the checkerboard mode erupts (it self-resets)</div>}
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 min-h-[112px]">
          {probe ? (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500">cell ({hover.ix}, {hover.iy})</div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[13px]">
                <div><div className="text-[9px] text-neutral-500">you</div><div className="text-neutral-100">{probe.me.toFixed(2)}</div></div>
                <div><div className="text-[9px] text-neutral-500">neighbor avg</div><div className="text-indigo-200">{probe.avg.toFixed(2)}</div></div>
                <div><div className="text-[9px] text-neutral-500">Δu = sum − 4u</div><div className={probe.lap > 0 ? 'text-orange-300' : 'text-cyan-300'}>{fmtN(probe.lap)}</div></div>
              </div>
              <div className="text-[11px] text-neutral-400 leading-snug pt-1">
                {probe.lap > 0
                  ? <>You sit <span className="text-orange-300">below</span> your neighbors’ average — diffusion pulls you <span className="text-orange-300">up</span>.</>
                  : probe.lap < 0
                    ? <>You sit <span className="text-cyan-300">above</span> your neighbors’ average — diffusion pulls you <span className="text-cyan-300">down</span>.</>
                    : <>You already equal your neighbors’ average — Δu = 0, nothing moves.</>}
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-neutral-500 italic h-full flex items-center">Hover a cell to read its value, its four neighbors’ average, and Δu. Then press <span className="not-italic font-mono text-neutral-300 mx-1">▶ relax</span> — every point creeps toward its neighbor-average and the field blurs to a smooth harmonic equilibrium. That single rule <em>is</em> heat (and Jacobi).</div>
          )}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 px-1">the same idea in 1D · curvature = Δu</div>
          <CurvatureStrip />
        </div>
      </div>
    </div>
  );
};

const LaplacianCard = () => (
  <Card id="laplacian" icon={Grid3x3} title="The Laplacian: your neighbors minus you" accent="indigo" index={2} anchor
        subtitle="One operator runs every PDE here — and it’s just an average">
    <p>
      Every equation in this explainer is built from one homely quantity. Strip away the symbols and the
      {' '}<Term>Laplacian</Term> <Eq>{'\\lap{\\Delta\\uu{u}}'}</Eq> is just this: <strong>the average of your immediate
      neighbors, minus you.</strong> If you sit in a valley relative to them, <Eq>{'\\lap{\\Delta\\uu{u}}>0'}</Eq> and
      they pull you up; if you’re a peak, <Eq>{'\\lap{\\Delta\\uu{u}}<0'}</Eq> and they pull you down; if you already
      equal their average, <Eq>{'\\lap{\\Delta\\uu{u}}=0'}</Eq> and nothing happens.
    </p>
    <Intuition>
      Picture a grid of temperatures. Ask each cell one question — “am I hotter or cooler than the average of the four
      cells touching me?” That comparison, repeated everywhere, is the entire grammar. Heat, waves, equilibrium, even
      Turing’s leopard spots are sentences written in it.
    </Intuition>
    <Block>{'\\lap{\\Delta\\uu{u}} \\;\\approx\\; \\overline{\\uu{u}_{\\,\\text{neighbors}}} \\;-\\; \\uu{u}'}</Block>
    <ReadEq>the Laplacian at a point = how far that point sits <span className="text-orange-300">below</span> (or <span className="text-cyan-300">above</span>) the average of its surroundings.</ReadEq>
    <Block>{'\\text{1D: } \\lap{\\Delta\\uu{u}}_i = \\uu{u}_{i+1}+\\uu{u}_{i-1}-2\\uu{u}_i \\qquad\\quad \\text{2D: } \\lap{\\Delta\\uu{u}}_{ij} = \\uu{u}_E+\\uu{u}_W+\\uu{u}_N+\\uu{u}_S-4\\uu{u}_{ij}'}</Block>
    <LaplacianProbe />
    <MinSchema>Δu measures <strong>concavity</strong> — how much you differ from your neighbors’ average. A first time-derivative reading of it gives heat; a second gives waves; setting it to zero gives equilibrium.</MinSchema>
    <Worked title="One relaxation step by hand">
      Three nodes in a row read 2, 10, 4. The middle node’s neighbor-average is <Eq>{'(2+4)/2 = 3'}</Eq>, so
      {' '}<Eq>{'\\lap{\\Delta\\uu{u}} = 2+4-2\\cdot 10 = -14'}</Eq> — a sharp peak. One relax step with <Eq>{'\\alpha=0.2'}</Eq>:
      {' '}<Eq>{'10 + 0.2\\cdot(-14) = 7.2'}</Eq>. Keep going and the middle settles to 3 (Δu = 0). You just watched a peak melt.
    </Worked>
    <Predict question="Press ▶ relax: each point creeps a little toward its neighbor-average, with the edges pinned. After many steps, what field do you get?">
      The unique <strong>smoothest</strong> field that matches the pinned edges — a <Term>harmonic</Term> function, where
      <Eq>{'\\lap{\\Delta\\uu{u}}=0'}</Eq> <em>everywhere</em>. You just watched relaxation solve Laplace’s equation
      ({' '}<CrossLink to="laplace" recap="Δu = 0: every interior point equals its neighbor-average — equilibrium.">the elliptic card</CrossLink>), and ran a single step of the heat equation in the process.
    </Predict>
    <Misconception
      wrong="The Laplacian measures how steep the field is (its slope)."
      right="Slope is the gradient ∇u — a first derivative. The Laplacian is second-order: it measures curvature, i.e. how far you differ from your surroundings’ average. A straight ramp has enormous slope but Δu = 0 everywhere."
      because="Diffusion ignores tilt and shaves off curvature. A tilted-but-flat sheet of temperature doesn’t diffuse; a bump does." />
    <Deeper>
      <p>
        The 1D stencil <Eq>{'\\uu{u}_{i+1}-2\\uu{u}_i+\\uu{u}_{i-1}'}</Eq> is the centered second difference: Taylor-expand
        and the first-derivative terms cancel, leaving <Eq>{'\\uu{u}_{xx}\\,\\Delta x^2 + \\mathcal{O}(\\Delta x^4)'}</Eq>. So the
        discrete Laplacian approximates <Eq>{'\\uu{u}_{xx}'}</Eq> to second order — the basis of every finite-difference scheme to come
        ({' '}<CrossLink to="stencils" recap="The 5-point stencil IS the discrete Laplacian.">stencils</CrossLink>).
      </p>
      <p>
        <strong>Stability of the relax sim.</strong> The explicit update <Eq>{'\\uu{u}\\leftarrow \\uu{u}+\\alpha\\,(\\text{sum}-4\\uu{u})'}</Eq>
        is the FTCS heat step in disguise. Plugging a Fourier mode <Eq>{'e^{i(px+qy)}'}</Eq> gives growth factor
        {' '}<Eq>{'g = 1 - 2\\alpha\\,(2-\\cos p-\\cos q)'}</Eq>, worst at the checkerboard <Eq>{'p=q=\\pi'}</Eq> where
        {' '}<Eq>{'g = 1-8\\alpha'}</Eq>. So <Eq>{'\\alpha\\le \\tfrac14'}</Eq> in 2D — exactly the bound that governs the heat
        equation’s timestep ({' '}<CrossLink to="cfl" recap="r = DΔt/Δx² ≤ ½ (1D), ¼ (2D); the checkerboard mode breaks first.">CFL</CrossLink>).
        Drag α past ¼ and the slider lets you watch that mode detonate.
      </p>
      <p>
        Coordinate-free, <Eq>{'\\lap{\\Delta} = \\nabla\\!\\cdot\\!\\nabla = \\operatorname{tr}(\\text{Hessian})'}</Eq>, and the continuous
        mean-value property says a harmonic <Eq>{'\\uu{u}'}</Eq> equals its average over any sphere — the reason harmonic functions have
        no interior maxima (a <Term>maximum principle</Term>). Relaxation is steepest descent on the Dirichlet energy
        {' '}<Eq>{'E=\\tfrac12\\int|\\nabla\\uu{u}|^2'}</Eq>, whose gradient is <Eq>{'-\\lap{\\Delta\\uu{u}}'}</Eq>: diffusion rolls roughness downhill.
      </p>
    </Deeper>
  </Card>
);
const ThreeFates = () => {
  const N = 121, dx = 1 / (N - 1);
  const bump = (i) => Math.exp(-(((i * dx) - 0.5) ** 2) / (2 * 0.06 * 0.06));
  const Cwave = 0.70, C2 = Cwave * Cwave;
  const lapL = 0.45, lapR = -0.45;
  const heat = useRef(null), sH = useRef(new Float64Array(N));
  const wPrev = useRef(null), wCur = useRef(null), sW = useRef(new Float64Array(N));
  const lap = useRef(null);
  const steps = useRef({ heat: 0, wave: 0, lap: 0 });
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [unstable, setUnstable] = useState(false);
  const [residual, setResidual] = useState(1);

  const init = () => {
    const h = new Float64Array(N), wc = new Float64Array(N), wp = new Float64Array(N), lp = new Float64Array(N);
    for (let i = 0; i < N; i++) { const b = bump(i); h[i] = b; wc[i] = b; lp[i] = b; }
    h[0] = h[N - 1] = 0; wc[0] = wc[N - 1] = 0;
    const u1 = new Float64Array(N);
    for (let i = 1; i < N - 1; i++) { wp[i] = wc[i]; u1[i] = wc[i] + 0.5 * C2 * (wc[i + 1] - 2 * wc[i] + wc[i - 1]); }
    lp[0] = lapL; lp[N - 1] = lapR;
    heat.current = h; wPrev.current = wp; wCur.current = u1; lap.current = lp;
    steps.current = { heat: 0, wave: 0, lap: 0 };
  };
  if (!heat.current) init();
  const reset = () => { init(); setResidual(1); setTick((t) => t + 1); };
  const rHeat = unstable ? 0.60 : 0.40;

  useRaf(playing, () => {
    // HEAT — FTCS, r ≤ ½
    { let u = heat.current, w = sH.current;
      for (let s = 0; s < 6; s++) {
        for (let i = 1; i < N - 1; i++) w[i] = u[i] + rHeat * (u[i + 1] - 2 * u[i] + u[i - 1]);
        w[0] = 0; w[N - 1] = 0; const t = u; u = w; w = t;
      }
      let mx = 0; for (let i = 0; i < N; i++) { const a = Math.abs(u[i]); if (a > mx) mx = a; }
      if (!isFinite(mx) || mx > 1e3) { for (let i = 0; i < N; i++) u[i] = bump(i); u[0] = 0; u[N - 1] = 0; }
      heat.current = u; sH.current = w; steps.current.heat += 6;
    }
    // WAVE — leapfrog, Courant C ≤ 1, correct from-rest start (baked into init)
    { let p = wPrev.current, c = wCur.current, n = sW.current;
      for (let s = 0; s < 4; s++) {
        for (let i = 1; i < N - 1; i++) n[i] = 2 * c[i] - p[i] + C2 * (c[i + 1] - 2 * c[i] + c[i - 1]);
        n[0] = 0; n[N - 1] = 0; const t = p; p = c; c = n; n = t;
      }
      wPrev.current = p; wCur.current = c; sW.current = n; steps.current.wave += 4;
    }
    // LAPLACE — Gauss-Seidel relaxation to the harmonic equilibrium (a straight line)
    { const u = lap.current; let res = 0;
      for (let s = 0; s < 24; s++) for (let i = 1; i < N - 1; i++) u[i] = 0.5 * (u[i - 1] + u[i + 1]);
      for (let i = 1; i < N - 1; i++) { const d = Math.abs(u[i + 1] + u[i - 1] - 2 * u[i]); if (d > res) res = d; }
      steps.current.lap += 24; setResidual(res);
    }
    setTick((t) => (t + 1) % 1e9);
  });

  const heatPeak = (() => { let m = 0; const u = heat.current; for (let i = 0; i < N; i++) if (u[i] > m) m = u[i]; return m; })();
  const Panel = ({ title, fate, accent, chip, chipOk, u, yRange, sub }) => (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="text-[11px] font-semibold" style={{ color: accent }}>{title}</div>
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${chipOk ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' : 'border-rose-400/40 text-rose-300 bg-rose-400/10'}`}>{chip} {chipOk ? '✓' : '✗'}</span>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{fate}</div>
      <Field1D u={u} yRange={yRange} accent={accent} height={120} />
      <div className="text-[10px] font-mono text-neutral-500 mt-1">{sub}</div>
    </div>
  );
  return (
    <div className="mt-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <Panel title="HEAT · uₜ = Δu" fate="melts to flat" accent="#fb923c" chip={`r = ${rHeat.toFixed(2)}`} chipOk={!unstable} u={heat.current} yRange={[-0.18, 1.06]} sub={`peak ${heatPeak.toFixed(2)} · relaxes`} />
        <Panel title="WAVE · uₜₜ = Δu" fate="splits & rings forever" accent="#7dd3fc" chip={`C = ${Cwave.toFixed(2)}`} chipOk u={wCur.current} yRange={[-1.1, 1.1]} sub="two ½-movers · energy conserved" />
        <Panel title="LAPLACE · Δu = 0" fate="settles to equilibrium" accent="#6ee7b7" chip="relax" chipOk u={lap.current} yRange={[-0.62, 1.06]} sub={`iter ${steps.current.lap} · residual ${residual.toExponential(1)}`} />
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button onClick={() => setPlaying((p) => !p)} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-200 hover:bg-white/10">{playing ? 'pause' : '▶ play'}</button>
        <button onClick={reset} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/10">reset bump</button>
        <button onClick={() => setUnstable((v) => !v)} className={`text-[11px] font-mono px-2.5 py-1 rounded border ${unstable ? 'border-rose-400/40 text-rose-300 bg-rose-400/10' : 'border-white/15 text-neutral-300 bg-white/[0.04]'} hover:bg-white/10`}>{unstable ? '↩ heat r = 0.40' : '⚠ push heat unstable (r = 0.60)'}</button>
      </div>
      <div className="text-[11px] text-neutral-500 mt-1.5 leading-snug">Same bump, same Laplacian. The <span className="text-orange-300">first</span> time-derivative makes it relax; the <span className="text-sky-300">second</span> makes it overshoot and ring; <span className="text-emerald-300">no</span> time-derivative is the equilibrium heat would reach at t → ∞. Laplace ignores the bump entirely — give it the two edge temperatures and it returns the unique straight-line harmonic.</div>
    </div>
  );
};

const BigThreeCard = () => (
  <Card id="bigthree" icon={GitFork} title="One operator, three fates" accent="indigo" index={3} anchor
        subtitle="Same bump, same Laplacian — wire it to time three ways, get three universes">
    <p>
      Here is the payoff of the whole subject. Take one bump, one <CrossLink to="laplacian" recap="Δu = neighbor-average − you.">Laplacian</CrossLink>,
      and change <em>only</em> how Δ meets time. A <strong>first</strong> time-derivative reads Δu as a <em>velocity</em>:
      the field relaxes toward the neighbor-average and smooths — that’s <strong>heat</strong>. A <strong>second</strong>
      reads it as an <em>acceleration</em>: the field overshoots, splits into two travelers, and rings forever — that’s the
      <strong> wave</strong>. Set Δu to <strong>zero</strong> and there is no time at all: every point already <em>is</em> the
      average — <strong>Laplace</strong>, equilibrium.
    </p>
    <Block>{'\\underbrace{\\src{\\uu{u}_{\\tt{t}}=\\lap{\\Delta}\\uu{u}}}_{\\text{heat · relax}} \\qquad \\underbrace{\\wv{\\uu{u}_{\\tt{tt}}=\\lap{\\Delta}\\uu{u}}}_{\\text{wave · accelerate}} \\qquad \\underbrace{\\eqm{\\lap{\\Delta}\\uu{u}=0}}_{\\text{Laplace · you ARE the average}}'}</Block>
    <ThreeFates />
    <MinSchema>One spatial operator, three couplings to time: <span className="text-orange-300">uₜ = Δu</span> relaxes · <span className="text-sky-300">uₜₜ = Δu</span> rings · <span className="text-emerald-300">Δu = 0</span> balances. Memorize the wiring, not three equations.</MinSchema>
    <Predict question="Match each to its destiny: (i) melts to a flat line, (ii) splits into two half-height travellers that ring, (iii) freezes into the smoothest field. Which is heat, wave, Laplace?">
      Heat = <strong>(i) melts</strong> (first-order in time → monotone relaxation). Wave = <strong>(ii) splits & rings</strong>
      (second-order → overshoot, energy conserved). Laplace = <strong>(iii) freezes</strong> (no time → equilibrium). All
      three are the same “neighbors minus you,” read as a velocity, an acceleration, or a balance.
    </Predict>
    <Worked title="The same three, in closed form">
      Start every one from <Eq>{'\\uu{u}_0=\\kx{\\sin(\\pi x)}'}</Eq> on [0,1], for which <Eq>{'\\lap{\\Delta}\\kx{\\sin(\\pi x)}=-\\pi^2\\kx{\\sin(\\pi x)}'}</Eq>.
      Heat → <Eq>{'e^{-\\pi^2 t}\\kx{\\sin(\\pi x)}'}</Eq> (after one time unit, <Eq>{'e^{-\\pi^2}\\approx 5\\times 10^{-5}'}</Eq> — gone).
      Wave → <Eq>{'\\cos(\\pi t)\\kx{\\sin(\\pi x)}'}</Eq> (rings forever, never decays). Laplace forces the amplitude to 0:
      the only equilibrium is <Eq>{'\\uu{u}\\equiv 0'}</Eq>. One eigenfunction, three fates — the seed of the
      {' '}<CrossLink to="fourier" recap="Sines are eigenfunctions of Δ: one ODE per mode.">Fourier</CrossLink> card.
    </Worked>
    <Misconception
      wrong="Heat, wave, and Laplace are three unrelated equations to memorize separately."
      right="They are the SAME operator Δ wired to uₜ, uₜₜ, or 0. That shared structure is exactly what makes Fourier work — each becomes the same family of one-mode ODEs, with the time side reading e^(−k²t), cos(kt), or frozen."
      because="Δ sin(kx) = −k² sin(kx), so in mode space all three are scalar ODEs with the same −k² and only the time-coupling differs." />
    <Deeper>
      <p>
        <strong>Finite vs infinite speed.</strong> The wave’s d’Alembert solution moves information at exactly speed c — a strict
        light cone ({' '}<CrossLink to="wave" recap="u = ½[f(x−ct)+f(x+ct)]; finite speed, a domain of dependence.">wave card</CrossLink>).
        Heat has <em>infinite</em> speed: its kernel is positive everywhere the instant t &gt; 0 ({' '}<CrossLink to="heatkernel" recap="The heat kernel is a Gaussian — strictly positive for all x, t>0.">heat kernel</CrossLink>).
        This is the parabolic/hyperbolic divide, classified next by a single discriminant ({' '}<CrossLink to="classify" recap="B²−AC sorts parabolic/hyperbolic/elliptic.">classify</CrossLink>).
      </p>
      <p>
        <strong>Energy bookkeeping.</strong> The wave conserves <Eq>{'E=\\tfrac12\\int(\\uu{u}_{\\tt{t}}^2+\\wv{c}^2\\uu{u}_{\\kx{x}}^2)'}</Eq>
        (no decay → it rings). Heat strictly dissipates the Dirichlet energy, <Eq>{'\\tfrac{d}{dt}\\int|\\nabla\\uu{u}|^2\\le 0'}</Eq>
        (a Lyapunov function → it must settle). Laplace is the minimizer of that very energy — the resting state heat is sliding toward.
      </p>
      <p>
        <strong>The numerics you’re watching.</strong> Heat uses FTCS at <Eq>{'r=0.40\\le\\tfrac12'}</Eq>; the wave uses leapfrog at
        Courant <Eq>{'\\wv{C}=0.70\\le 1'}</Eq> with the second-order from-rest first step; Laplace uses Gauss-Seidel relaxation.
        Push heat past <Eq>{'r=\\tfrac12'}</Eq> and the checkerboard mode detonates — the stability story of the
        {' '}<CrossLink to="cfl" recap="r ≤ ½ (heat), C ≤ 1 (wave): the checkerboard mode breaks first.">CFL card</CrossLink>.
      </p>
    </Deeper>
  </Card>
);
const CHAR_COLS = [
  { key: 'elliptic', name: 'Elliptic', pde: 'Laplace  Δu = 0', accent: '#6ee7b7', disc: 'B² − AC < 0',
    rows: ['equilibrium — no time', 'instant (global)', 'n/a (no evolution)', 'maximally smooth', 'boundary values', 'none (0 real)'] },
  { key: 'parabolic', name: 'Parabolic', pde: 'heat  uₜ = Δu', accent: '#fb923c', disc: 'B² − AC = 0',
    rows: ['diffusion', 'infinite', 'irreversible', 'smooths instantly', 'initial + boundary', 'one (repeated)'] },
  { key: 'hyperbolic', name: 'Hyperbolic', pde: 'wave  uₜₜ = Δu', accent: '#7dd3fc', disc: 'B² − AC > 0',
    rows: ['propagation', 'finite (speed c)', 'reversible', 'no smoothing', 'initial + boundary', 'two (real)'] },
];
const CHAR_ROWS = ['character', 'info speed', 'time', 'smoothing', 'data needed', 'characteristics'];

const DiscriminantDial = () => {
  const [s, setS] = useState(-1);
  const active = s < -0.04 ? 'elliptic' : s > 0.04 ? 'hyperbolic' : 'parabolic';
  const activeAccent = CHAR_COLS.find((c) => c.key === active).accent;
  const W = 360, trackY = 26;
  const sx = (v) => 18 + ((v + 1) / 2) * (W - 36);
  const onTrack = (e) => { const r = e.currentTarget.getBoundingClientRect(); setS(clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)); };

  const cx = 100, cy = 75, sc = 34;
  const conic = (() => {
    if (s < -0.04) { const ay = Math.min(1.6, 1 / Math.sqrt(-s)); const p = []; for (let i = 0; i <= 96; i++) { const u = (i / 96) * Math.PI * 2; p.push([cx + sc * Math.cos(u), cy - sc * ay * Math.sin(u)]); } return [p]; }
    if (s > 0.04) { const right = [], left = []; for (let i = 0; i <= 48; i++) { const yy = -2 + (i / 48) * 4; const x = Math.sqrt(1 + s * yy * yy); right.push([cx + sc * x, cy - sc * yy]); left.push([cx - sc * x, cy - sc * yy]); } return [right, left]; }
    const par = []; for (let i = 0; i <= 64; i++) { const yy = -1.7 + (i / 64) * 3.4; par.push([cx + sc * (0.5 * yy * yy - 0.85), cy - sc * yy]); } return [par];
  })();
  const shapeName = active === 'elliptic' ? 'ellipse' : active === 'parabolic' ? 'parabola' : 'hyperbola';

  return (
    <div className="mt-3 grid md:grid-cols-[1fr_210px] gap-4 items-start">
      <div>
        <svg width={W} height={52} viewBox={`0 0 ${W} 52`} className="block w-full cursor-pointer" onMouseDown={onTrack} onMouseMove={(e) => e.buttons === 1 && onTrack(e)}>
          <rect x={sx(-1)} y={trackY - 5} width={sx(-0.04) - sx(-1)} height={10} fill="#6ee7b7" opacity={active === 'elliptic' ? 0.5 : 0.18} />
          <rect x={sx(-0.04)} y={trackY - 5} width={sx(0.04) - sx(-0.04)} height={10} fill="#fb923c" opacity={active === 'parabolic' ? 0.7 : 0.3} />
          <rect x={sx(0.04)} y={trackY - 5} width={sx(1) - sx(0.04)} height={10} fill="#7dd3fc" opacity={active === 'hyperbolic' ? 0.5 : 0.18} />
          {[['Laplace', -1, '#6ee7b7'], ['heat', 0, '#fb923c'], ['wave', 1, '#7dd3fc']].map(([lbl, v, c], i) => (
            <g key={i}>
              <line x1={sx(v)} y1={trackY - 7} x2={sx(v)} y2={trackY + 7} stroke={c} strokeWidth="1.5" />
              <text x={sx(v)} y={trackY + 20} fontSize="9" textAnchor="middle" fill={c} fontFamily="ui-monospace, monospace">{lbl}</text>
              <text x={sx(v)} y={trackY - 11} fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">{v}</text>
            </g>
          ))}
          <circle cx={sx(s)} cy={trackY} r="6" fill="#f0abfc" stroke="#0a0a0a" strokeWidth="1.5" />
        </svg>
        <div className="text-[11px] font-mono text-neutral-400 mt-1">B² − AC = <span className="text-fuchsia-300">{s.toFixed(2)}</span> → <span style={{ color: activeAccent }}>{active}</span> · the conic is a {shapeName}</div>
        <div className="mt-3 overflow-x-auto">
          <div className="grid gap-px bg-white/10 rounded-lg overflow-hidden text-[10.5px]" style={{ gridTemplateColumns: '88px 1fr 1fr 1fr', minWidth: 360 }}>
            <div className="bg-neutral-900/80 p-1.5" />
            {CHAR_COLS.map((c) => (
              <div key={c.key} className={`p-1.5 text-center font-semibold ${active === c.key ? 'bg-white/[0.08]' : 'bg-neutral-900/80'}`} style={{ color: c.accent }}>{c.name}<div className="text-[9px] font-mono font-normal opacity-70">{c.disc}</div></div>
            ))}
            {CHAR_ROWS.map((rn, ri) => (
              <React.Fragment key={ri}>
                <div className="bg-neutral-900/80 p-1.5 text-neutral-500 uppercase tracking-wide text-[9px]">{rn}</div>
                {CHAR_COLS.map((c) => (
                  <div key={c.key} className={`p-1.5 text-center ${active === c.key ? 'bg-white/[0.06] text-neutral-100' : 'bg-neutral-900/60 text-neutral-400'}`}>{ri === 0 ? <span className="font-mono" style={{ color: c.accent }}>{c.pde}</span> : c.rows[ri]}</div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <svg width={200} height={150} viewBox="0 0 200 150" className="block mx-auto">
            <line x1={cx} y1={8} x2={cx} y2={142} stroke="rgba(255,255,255,0.1)" />
            <line x1={12} y1={cy} x2={188} y2={cy} stroke="rgba(255,255,255,0.1)" />
            {conic.map((branch, i) => (
              <polyline key={i} fill="none" stroke={activeAccent} strokeWidth="2"
                points={branch.map(([x, y]) => `${clamp(x, 4, 196).toFixed(1)},${clamp(y, 4, 146).toFixed(1)}`).join(' ')} />
            ))}
          </svg>
          <div className="text-[10px] text-center text-neutral-500 font-mono">x² − ({(-s).toFixed(2)}) y² = 1</div>
        </div>
      </div>
    </div>
  );
};

const ClassifyCard = () => (
  <Card id="classify" icon={Shapes} title="Parabolic, hyperbolic, elliptic" accent="violet" index={4}
        subtitle="The same names as the conic sections — for the same algebraic reason">
    <p>
      Why do PDEs share their names with <em>ellipse, parabola, hyperbola</em>? Because the classification is the same piece of
      algebra. Take the second-order part <Eq>{'A\\uu{u}_{xx}+2B\\uu{u}_{xy}+C\\uu{u}_{yy}'}</Eq> and form the discriminant
      {' '}<Eq>{'B^2-AC'}</Eq> — exactly the quantity that decides whether <Eq>{'Ax^2+2Bxy+Cy^2=1'}</Eq> is an ellipse, a parabola,
      or a hyperbola. The sign is not a mnemonic; it is how <CrossLink to="bigthree" recap="Same Δ wired to uₜ, uₜₜ, or 0.">Δ’s wiring to time</CrossLink> shows up as a single number.
    </p>
    <Block>{'\\lap{B^2-AC}\\;\\begin{cases}<0 & \\text{elliptic}\\ (\\eqm{\\text{Laplace}})\\\\[2pt]=0 & \\text{parabolic}\\ (\\src{\\text{heat}})\\\\[2pt]>0 & \\text{hyperbolic}\\ (\\wv{\\text{wave}})\\end{cases}'}</Block>
    <DiscriminantDial />
    <MinSchema>One number — the discriminant of the top-order terms — sorts every linear PDE into <span className="text-emerald-300">equilibrium</span>, <span className="text-orange-300">diffusion</span>, or <span className="text-sky-300">propagation</span>, with the matching conic and the matching behavior.</MinSchema>
    <Predict question="Heat has a FIRST time-derivative, the wave a SECOND. The classifier looks only at the highest-order part. Where does heat land — and why on the boundary (disc = 0)?">
      <strong>On the parabola, disc = 0.</strong> Classification sees only the principal (highest-order) part. Heat’s is just
      {' '}<Eq>{'\\uu{u}_{xx}'}</Eq> <Eq>{'(A=1,B=0,C=0)'}</Eq> → <Eq>{'B^2-AC=0'}</Eq>. The missing second time-derivative is literally what
      pushes heat onto the boundary between elliptic and hyperbolic — and what gives it infinite speed yet irreversibility.
    </Predict>
    <Misconception
      wrong="A PDE is one fixed type forever."
      right="Type is a property of the coefficients A, B, C, which can vary in space. Transonic flow is elliptic where the flow is subsonic and hyperbolic where it is supersonic, with a parabolic shock-line between."
      because="The discriminant is evaluated locally; where the coefficients change sign, so does the character of the equation." />
    <Deeper>
      <p>
        The principal symbol <Eq>{'A\\xi^2+2B\\xi\\eta+C\\eta^2'}</Eq> is a quadratic form, and the discriminant is its signature.
        Real <Term>characteristic</Term>s — the curves along which the PDE degenerates to an ODE — number two (hyperbolic), one
        (parabolic), or zero (elliptic). That is exactly “finite-speed propagation,” “infinite-speed-but-smoothing,” and “no
        propagation at all.” The count is coordinate-invariant, just like the conic type.
      </p>
      <p>
        In <Eq>{'n'}</Eq> dimensions the classifier is the eigenvalue signature of the coefficient matrix: all-same-sign =
        elliptic, one-flipped = hyperbolic (a Lorentzian (n−1, 1) signature — the wave operator <Eq>{'\\Box=\\partial_{tt}-\\lap{\\Delta}'}</Eq> is
        the time-flipped Laplacian), one-zero = parabolic. Type fixes which data make the problem <Term>well-posed</Term>: backward heat is
        ill-posed precisely because parabolic problems run only one way in time.
      </p>
    </Deeper>
  </Card>
);
const HeatPlate = () => {
  const N = 96, NN = N * N, r = 0.2;
  const seedBlob = (arr, cxv, cyv, amp) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) arr[y * N + x] += amp * Math.exp(-(((x - cxv) ** 2 + (y - cyv) ** 2) / 120)); };
  const interiorMax = (u) => { let m = 0; for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const v = Math.abs(u[y * N + x]); if (v > m) m = v; } return m; };
  const A = useRef(null), B = useRef(null), initMax = useRef(1);
  if (!A.current) { A.current = new Float64Array(NN); B.current = new Float64Array(NN); seedBlob(A.current, 40, 48, 1); }
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [backward, setBackward] = useState(false);
  const [noise, setNoise] = useState(0);
  const [ratio, setRatio] = useState(1);

  const reseed = () => { const a = A.current; a.fill(0); seedBlob(a, 40, 48, 1); initMax.current = 1; };
  const reset = () => { reseed(); setRatio(1); setBackward(false); setTick((t) => t + 1); };
  const step = () => {
    const u = A.current, w = B.current, sgn = backward ? -1 : 1;
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; w[i] = u[i] + sgn * r * (u[i - 1] + u[i + 1] + u[i - N] + u[i + N] - 4 * u[i]); }
    for (let x = 0; x < N; x++) { w[x] = 0; w[(N - 1) * N + x] = 0; }
    for (let y = 0; y < N; y++) { w[y * N] = 0; w[y * N + N - 1] = 0; }
    A.current = w; B.current = u;
  };
  useRaf(playing, () => {
    if (noise > 0) { const a = A.current; for (let i = 0; i < NN; i++) a[i] += noise * (Math.random() * 2 - 1); }
    for (let s = 0; s < 4; s++) step();
    const u = A.current;
    // Backward heat is genuinely unstable — clamp so it saturates into a bounded
    // checkerboard rather than running off to Infinity/NaN (which would freeze the canvas).
    if (backward) for (let i = 0; i < NN; i++) { const v = u[i]; u[i] = v !== v ? 0 : v > 60 ? 60 : v < -60 ? -60 : v; }
    let mx = interiorMax(u);
    if (!isFinite(mx)) { reseed(); mx = 1; }
    setRatio(mx / (initMax.current || 1)); setTick((t) => (t + 1) % 1e9);
  });
  const onClick = (e) => { const rc = e.currentTarget.getBoundingClientRect(); const cxv = clamp(Math.round((e.clientX - rc.left) / rc.width * N), 0, N - 1); const cyv = clamp(Math.round((e.clientY - rc.top) / rc.height * N), 0, N - 1); seedBlob(A.current, cxv, cyv, 1); initMax.current = interiorMax(A.current); setRatio(1); setTick((t) => t + 1); };
  const DISP = 300;
  return (
    <div className="mt-3 grid md:grid-cols-[300px_1fr] gap-4 items-start">
      <div>
        <div className="relative rounded-lg overflow-hidden border border-white/10 cursor-crosshair" style={{ width: '100%', maxWidth: DISP }} onClick={onClick}>
          <Heatmap2D field={A.current} nx={N} ny={N} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={backward ? [-4, 4] : [-1.05, 1.05]} smooth={!backward} tick={tick} style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
          {backward && <div className="absolute inset-x-0 top-0 bg-rose-500/30 text-rose-100 text-[10px] font-mono px-2 py-1 text-center backdrop-blur-sm">ILL-POSED · amplifying e^(+k²t)</div>}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">click the plate to drop a fresh hot spot</div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setPlaying((p) => !p)} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-200 hover:bg-white/10">{playing ? 'pause' : '▶ play'}</button>
          <button onClick={reset} className="text-[11px] font-mono px-2.5 py-1 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/10">reset</button>
          <button onClick={() => setBackward((v) => !v)} className={`text-[11px] font-mono px-2.5 py-1 rounded border ${backward ? 'border-rose-400/40 text-rose-300 bg-rose-400/10' : 'border-white/15 text-neutral-300 bg-white/[0.04]'} hover:bg-white/10`}>{backward ? '↩ forward' : '⏪ run backward'}</button>
        </div>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">noise ε<input type="range" min="0" max="0.05" step="0.005" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="pde-range w-24" /><span className="tabular-nums">{noise.toFixed(3)}</span></label>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">interior max ÷ initial max</div>
          <div className={`font-mono text-2xl mt-0.5 ${ratio <= 1.001 ? 'text-emerald-300' : 'text-rose-300'}`}>{ratio.toFixed(3)}</div>
          <div className="text-[11px] text-neutral-400 mt-1 leading-snug">
            {backward
              ? <>Backward, the ratio <span className="text-rose-300">climbs without bound</span> — high-frequency noise is amplified by e^(+k²t). You cannot un-blur.</>
              : <>Forward, it <span className="text-emerald-300">never exceeds 1</span> — the maximum principle. Heat can only shave peaks, never create them; even injected speckle is erased.</>}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeatCard = () => (
  <Card id="heat" icon={Flame} title="The heat equation up close" accent="orange" index={5}
        subtitle="Smoothing, a maximum principle, and an arrow of time you cannot rewind">
    <p>
      Heat only ever relaxes toward the neighbor-average, so it can never <em>make</em> a new peak — the interior of a cooling
      plate never gets hotter than its hottest starting point or its boundary. That single fact, the <Term>maximum principle</Term>,
      is the same thing as irreversibility. Run the equation <em>backward</em> and smoothing becomes anti-smoothing: invisible
      high-frequency ripples, amplified by <Eq>{'e^{+\\kx{k}^2 \\tt{t}}'}</Eq>, detonate. You cannot un-blur a photograph.
    </p>
    <Block>{'\\src{\\uu{u}_{\\tt{t}}}=D\\,\\lap{\\Delta\\uu{u}} \\qquad\\qquad \\max_{\\text{interior}}\\uu{u}(\\tt{t})\\;\\le\\;\\max\\uu{u}(0)'}</Block>
    <ReadEq>each point chases its neighbors’ average (left); so no interior point can ever exceed the hottest initial or boundary value (right).</ReadEq>
    <HeatPlate />
    <MinSchema>Forward heat <strong>only smooths</strong> — a strict maximum principle, hence irreversible. The reverse problem is ill-posed: the very modes heat kills fastest are the ones backward heat blows up fastest.</MinSchema>
    <Predict question="Run the exact forward update, then flip dt → −dt to step backward. Do we recover the original sharp blob?">
      <strong>No — and not merely “in practice.”</strong> Each Fourier mode decays like <Eq>{'e^{-D\\kx{k}^2 \\tt{t}}'}</Eq> forward, so
      backward it grows like <Eq>{'e^{+D\\kx{k}^2 \\tt{t}}'}</Eq>; the highest frequencies amplify fastest and without bound. Round-off at the
      grid scale is itself the fastest-growing mode, so a checkerboard swamps everything. Backward heat is <Term>ill-posed</Term> — the
      mathematical face of the arrow of time.
    </Predict>
    <Misconception
      wrong="Diffusion has a finite speed — heat takes time to reach a distant point."
      right="The heat kernel exp(−x²/4Dt)/√(4πDt) is strictly positive for every x the instant t > 0. A thermometer a kilometre away responds immediately — immeasurably faintly, but instantly."
      because="This infinite propagation speed is exactly the parabolic/hyperbolic divide: the wave equation has a strict light cone; heat does not." />
    <Deeper>
      <p>
        <strong>Maximum principle, in one line.</strong> At an interior maximum the field is concave in every direction, so
        {' '}<Eq>{'\\lap{\\Delta\\uu{u}}\\le 0'}</Eq>, hence <Eq>{'\\uu{u}_{\\tt{t}}=D\\lap{\\Delta\\uu{u}}\\le 0'}</Eq> — the hot spot can only cool. The max therefore
        lives on the parabolic boundary (the initial slice or the spatial edges). Uniqueness and continuous dependence follow.
      </p>
      <p>
        <strong>Energy decay (a Lyapunov function).</strong> <Eq>{'\\tfrac{d}{dt}\\int \\uu{u}^2 = -2D\\int|\\nabla\\uu{u}|^2 \\le 0'}</Eq>: the L²
        norm only shrinks, and the Dirichlet energy is monotone — heat is steepest descent on roughness, sliding toward the
        harmonic ({' '}<CrossLink to="laplace" recap="Δu = 0 is the steady state heat slides toward.">Laplace</CrossLink>) equilibrium. Forward smoothing is so strong it makes the
        solution instantly analytic — and that destruction of detail is precisely why information cannot be recovered.
      </p>
      <p>
        <strong>The numerics are honest.</strong> The plate uses FTCS at <Eq>{'r=D\\Delta t/\\Delta x^2=0.2\\le\\tfrac14'}</Eq> (the 2D bound).
        The backward button doesn’t “break” the solver — it faithfully integrates a genuinely ill-posed equation, which is why it
        explodes. De-blurring in practice needs <em>regularization</em> (Tikhonov), not a literal time reversal.
      </p>
    </Deeper>
  </Card>
);
const HeatKernelDemo = () => {
  const M = 4000;
  const pos = useRef(null), nRef = useRef(0);
  if (!pos.current) pos.current = new Float64Array(M);
  const [tickA, setTickA] = useState(0);
  const [playing, setPlaying] = useState(true);
  const resetWalk = () => { pos.current.fill(0); nRef.current = 0; setTickA((t) => t + 1); };
  useRaf(playing, () => {
    const S = 2, p = pos.current;
    for (let s = 0; s < S; s++) for (let i = 0; i < M; i++) p[i] += Math.random() < 0.5 ? -1 : 1;
    nRef.current += S;
    if (nRef.current >= 600) { p.fill(0); nRef.current = 0; }
    setTickA((t) => (t + 1) % 1e9);
  });
  const n = Math.max(1, nRef.current);
  const NB = 81, XR = 60;
  const hist = useMemo(() => { const h = new Float64Array(NB); const p = pos.current; for (let i = 0; i < M; i++) { const b = Math.floor((p[i] + XR) / (2 * XR) * NB); if (b >= 0 && b < NB) h[b]++; } return h; }, [tickA]);
  const sstd = useMemo(() => { const p = pos.current; let s2 = 0; for (let i = 0; i < M; i++) s2 += p[i] * p[i]; return Math.sqrt(s2 / M); }, [tickA]);
  const theoryStd = Math.sqrt(n); // √(2Dt) with D=½, Δt=1 ⇒ 2Dt = n
  const WA = 360, HA = 150, padB = 16;
  const sxA = (x) => 6 + ((x + XR) / (2 * XR)) * (WA - 12);
  const maxC = Math.max(1, ...hist);
  const syA = (c) => HA - padB - (c / maxC) * (HA - padB - 8);
  const gauss = [];
  for (let i = 0; i <= 120; i++) { const x = -XR + (i / 120) * 2 * XR; const dens = M * (2 * XR / NB) * (1 / Math.sqrt(2 * Math.PI * n)) * Math.exp(-(x * x) / (2 * n)); gauss.push([sxA(x), syA(dens)]); }

  // Panel B — convolution K * u0
  const [ic, setIc] = useState('spike');
  const [tk, setTk] = useState(0.4);
  const P = 192, xr = 6, dxB = (2 * xr) / (P - 1);
  const xB = (i) => -xr + i * dxB;
  const conv = useMemo(() => {
    const u0 = new Float64Array(P);
    if (ic === 'spike') u0[Math.floor(P / 2)] = 1 / dxB;
    else if (ic === 'double') { u0[Math.floor(P * 0.35)] = 1 / dxB; u0[Math.floor(P * 0.65)] = 1 / dxB; }
    else for (let i = 0; i < P; i++) if (Math.abs(xB(i)) < 1) u0[i] = 1;
    const u = new Float64Array(P);
    for (let i = 0; i < P; i++) { let s = 0; const xi = xB(i); for (let j = 0; j < P; j++) { const d = xi - xB(j); s += u0[j] * (1 / Math.sqrt(4 * Math.PI * tk)) * Math.exp(-(d * d) / (4 * tk)) * dxB; } u[i] = s; }
    return { u0, u };
  }, [ic, tk]);
  const widthMark = Math.sqrt(2 * tk); // √(2Dt), D=1

  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">4000 random walkers → a Gaussian</div>
          <div className="text-[10px] font-mono text-neutral-400">n = {n} steps</div>
        </div>
        <svg width={WA} height={HA} viewBox={`0 0 ${WA} ${HA}`} className="block w-full">
          <line x1={6} y1={HA - padB} x2={WA - 6} y2={HA - padB} stroke="rgba(255,255,255,0.12)" />
          {Array.from(hist).map((c, i) => { const x = sxA(-XR + (i + 0.5) / NB * 2 * XR); const bw = (WA - 12) / NB; return <rect key={i} x={x - bw / 2} y={syA(c)} width={bw * 0.9} height={Math.max(0, HA - padB - syA(c))} fill="#67e8f9" opacity="0.5" />; })}
          <polyline fill="none" stroke="#c4b5fd" strokeWidth="2" points={gauss.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
          {[-1, 1].map((s, i) => <line key={i} x1={sxA(s * theoryStd)} y1={8} x2={sxA(s * theoryStd)} y2={HA - padB} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.7" />)}
        </svg>
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono mt-1">
          <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
          <button onClick={resetWalk} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
          <span className="text-cyan-300">sample σ = {sstd.toFixed(1)}</span>
          <span className="text-amber-300">√(2Dt) = √n = {theoryStd.toFixed(1)}</span>
          <span className="text-neutral-500">— they lock</span>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">any start = a pile of point sources · u(·,t) = K * u₀</div>
        <Field1D u={conv.u} yRange={[-0.2, 2.4]} accent="#fb923c" height={140}
          extra={ic !== 'spike' ? [{ u: conv.u0, accent: '#a5b4fc', dash: '4 3', opacity: 0.5, width: 1.3 }] : []}
          markers={[{ x: 0.5 + widthMark / (2 * xr), color: '#67e8f9', label: '√2Dt' }, { x: 0.5 - widthMark / (2 * xr), color: '#67e8f9' }]} />
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono mt-1">
          <div className="inline-flex rounded border border-white/15 overflow-hidden">
            {[['spike', 'point'], ['double', 'two points'], ['tophat', 'top-hat']].map(([k, lbl]) => (
              <button key={k} onClick={() => setIc(k)} className={`px-2 py-0.5 ${ic === k ? 'bg-orange-500/20 text-orange-100' : 'text-neutral-400'}`}>{lbl}</button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-neutral-400">t<input type="range" min="0.02" max="2" step="0.02" value={tk} onChange={(e) => setTk(parseFloat(e.target.value))} className="pde-range w-24" /><span className="text-orange-200">{tk.toFixed(2)}</span></label>
        </div>
      </div>
    </div>
  );
};

const HeatKernelCard = () => (
  <Card id="heatkernel" icon={Footprints} title="The heat kernel & the random walk" accent="orange" index={6}
        subtitle="Diffusion is the Central Limit Theorem in disguise">
    <p>
      Drop a point of heat and it spreads into a Gaussian whose width grows like <Eq>{'\\sqrt{\\tt{t}}'}</Eq> — not by accident.
      Diffusion is the continuum limit of a <strong>random walk</strong>, and the bell curve is the Central Limit Theorem. That
      Gaussian, the <Term>heat kernel</Term>, is a master key: any starting field is a pile of point sources, so the future is
      just the past <em>convolved</em> with the kernel.
    </p>
    <Block>{'\\kx{K(x,\\tt{t})}=\\dfrac{1}{\\sqrt{4\\pi D\\tt{t}}}\\,e^{-x^2/4D\\tt{t}} \\qquad \\text{width}\\sim\\sqrt{2D\\tt{t}} \\qquad \\uu{u}(x,\\tt{t})=(\\kx{K}*\\uu{u}_0)(x)'}</Block>
    <HeatKernelDemo />
    <MinSchema>The fundamental solution is a spreading Gaussian; its width is <Eq>{'\\sqrt{2D\\tt{t}}'}</Eq>, and convolving with it propagates <em>any</em> initial field forward — the heat equation’s impulse response.</MinSchema>
    <Worked title="Three facts, one Gaussian">
      Normalization: <Eq>{'\\int K\\,dx = 1'}</Eq> (mass is conserved). Variance: <Eq>{'2\\sigma^2 = 4D\\tt{t}'}</Eq> so
      {' '}<Eq>{'\\sigma=\\sqrt{2D\\tt{t}}'}</Eq>. Random walk: a <Eq>{'\\pm 1'}</Eq> step each tick has variance 1, so after <Eq>{'n'}</Eq> ticks the
      position has variance <Eq>{'n'}</Eq> — matching <Eq>{'2D\\tt{t}=n'}</Eq> with <Eq>{'D=\\tfrac12'}</Eq>. That is the cyan/amber lock above.
    </Worked>
    <Predict question="Dye diffuses to a radius of 1 cm in 10 seconds. How long to reach 2 cm?">
      <strong>About 40 seconds — not 20.</strong> Width grows as <Eq>{'\\sqrt{\\tt{t}}'}</Eq>, so doubling the radius takes <em>four</em> times the
      time. That <Eq>{'\\sqrt{\\tt{t}}'}</Eq> scaling is why diffusion is wonderful across a thin membrane and hopeless across a room —
      convection beats it badly at large scales.
    </Predict>
    <Misconception
      wrong="The Gaussian shape is a special property of the heat equation."
      right="It is forced by the Central Limit Theorem. A diffusing particle's position is a sum of many independent kicks, and any such sum tends to a Gaussian — regardless of the individual kick distribution."
      because="The heat kernel is the probability density of Brownian motion; the bell curve is the universal attractor of sums of independent steps." />
    <Deeper>
      <p>
        <strong>Green’s function & superposition.</strong> <Eq>{'\\kx{K}'}</Eq> solves the heat equation with a point-source initial
        condition <Eq>{'\\kx{K}(x,0)=\\delta(x)'}</Eq>. By linearity, a general <Eq>{'\\uu{u}_0=\\int \\uu{u}_0(y)\\,\\delta(x-y)\\,dy'}</Eq> propagates to
        {' '}<Eq>{'\\uu{u}(x,\\tt{t})=\\int \\kx{K}(x-y,\\tt{t})\\,\\uu{u}_0(y)\\,dy'}</Eq> — the impulse-response / convolution view that recurs in
        {' '}<CrossLink to="greens" recap="Solve a point source once, convolve for any source.">Green’s functions</CrossLink>.
      </p>
      <p>
        <strong>Walk → PDE.</strong> The master equation for a walker, <Eq>{'p(x,t+\\Delta t)=\\tfrac12 p(x-\\Delta x)+\\tfrac12 p(x+\\Delta x)'}</Eq>,
        Taylor-expands to <Eq>{'p_{\\tt{t}}=\\tfrac{\\Delta x^2}{2\\Delta t}\\,p_{xx}'}</Eq> — the heat equation with
        {' '}<Eq>{'D=\\Delta x^2/2\\Delta t'}</Eq>. The kernel is <Term>self-similar</Term> (it depends only on <Eq>{'x/\\sqrt{\\tt{t}}'}</Eq>), it factorizes in higher
        dimensions, and its strictly positive tails are exactly the infinite propagation speed of diffusion. Donsker’s theorem makes the walk → Brownian-motion limit rigorous.
      </p>
    </Deeper>
  </Card>
);
const WaveString = () => {
  const N = 201, dx = 1 / (N - 1), C = 0.5, C2 = C * C, SUB = 4, dt = C * dx; // c = 1
  const [shape, setShape] = useState('triangle');
  const [bc, setBc] = useState('fixed');
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const [xs, setXs] = useState(0.5), [ts, setTs] = useState(0.28);
  const uPrev = useRef(null), uCur = useRef(null), scr = useRef(null), steps = useRef(0);

  const f0 = (x) => {
    if (shape === 'triangle') return Math.max(0, 1 - Math.abs(x - 0.5) / 0.1);
    if (shape === 'gaussian') return Math.exp(-(((x - 0.5) / 0.04) ** 2));
    return 0.75 * Math.exp(-(((x - 0.35) / 0.035) ** 2)) + 0.75 * Math.exp(-(((x - 0.65) / 0.035) ** 2));
  };
  const fext = (y) => { let z = y % 2; if (z < 0) z += 2; return z <= 1 ? f0(z) : (bc === 'fixed' ? -f0(2 - z) : f0(2 - z)); };

  const initWave = () => {
    const u0 = new Float64Array(N); for (let i = 0; i < N; i++) u0[i] = f0(i / (N - 1));
    if (bc === 'fixed') { u0[0] = 0; u0[N - 1] = 0; }
    const u1 = new Float64Array(N);
    for (let i = 1; i < N - 1; i++) u1[i] = u0[i] + 0.5 * C2 * (u0[i + 1] - 2 * u0[i] + u0[i - 1]);
    if (bc === 'fixed') { u1[0] = 0; u1[N - 1] = 0; } else { u1[0] = u1[1]; u1[N - 1] = u1[N - 2]; }
    uPrev.current = u0; uCur.current = u1; scr.current = new Float64Array(N); steps.current = 0;
  };
  if (!uCur.current) initWave();
  useEffect(() => { initWave(); setTick((t) => t + 1); /* eslint-disable-next-line */ }, [shape, bc]);
  const reset = () => { initWave(); setTick((t) => t + 1); };

  useRaf(playing, () => {
    let p = uPrev.current, c = uCur.current, nx = scr.current;
    for (let s = 0; s < SUB; s++) {
      for (let i = 1; i < N - 1; i++) nx[i] = 2 * c[i] - p[i] + C2 * (c[i + 1] - 2 * c[i] + c[i - 1]);
      if (bc === 'fixed') { nx[0] = 0; nx[N - 1] = 0; } else { nx[0] = nx[1]; nx[N - 1] = nx[N - 2]; }
      const t = p; p = c; c = nx; nx = t;
    }
    uPrev.current = p; uCur.current = c; scr.current = nx; steps.current += SUB;
    setTick((t) => (t + 1) % 1e9);
  });

  const t = steps.current * dt;
  const uExact = useMemo(() => { const a = new Float64Array(N); for (let i = 0; i < N; i++) { const x = i / (N - 1); a[i] = 0.5 * (fext(x - t) + fext(x + t)); } return a; }, [tick, shape, bc]);
  const dodL = clamp(xs - ts, 0, 1), dodR = clamp(xs + ts, 0, 1);

  const CW = 320, CH = 150, cpad = 14, Tmax = 0.55;
  const cx = (x) => cpad + x * (CW - 2 * cpad);
  const cy = (tt) => CH - cpad - (tt / Tmax) * (CH - 2 * cpad);
  const onCone = (e) => { const r = e.currentTarget.getBoundingClientRect(); setXs(clamp((e.clientX - r.left) / r.width, 0, 1)); setTs(clamp((1 - (e.clientY - r.top) / r.height) * Tmax, 0.01, Tmax)); };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['triangle', 'triangle'], ['gaussian', 'bump'], ['two', 'two bumps']].map(([k, l]) => <button key={k} onClick={() => setShape(k)} className={`px-2 py-0.5 ${shape === k ? 'bg-sky-500/20 text-sky-100' : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['fixed', 'fixed ends'], ['free', 'free ends']].map(([k, l]) => <button key={k} onClick={() => setBc(k)} className={`px-2 py-0.5 ${bc === k ? 'bg-sky-500/20 text-sky-100' : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
        <button onClick={reset} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">the string · solid = leapfrog, dashed = exact d’Alembert (they coincide)</div>
        <Field1D u={uCur.current} yRange={[-1.1, 1.1]} accent="#7dd3fc" height={130}
          extra={[{ u: uExact, accent: '#e0e7ff', dash: '5 4', opacity: 0.55, width: 1.4 }]}
          markers={[{ x: dodL, color: '#f0abfc' }, { x: dodR, color: '#f0abfc' }]} />
        <div className="text-[10px] text-neutral-500 mt-0.5">the shaded interval is what the point below depends on — its <span className="text-fuchsia-300">domain of dependence</span></div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">space–time · tap to pick a point (x*, t*) and see its light cone</div>
        <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} className="block w-full cursor-pointer" onMouseDown={onCone} onMouseMove={(e) => e.buttons === 1 && onCone(e)}>
          <line x1={cpad} y1={CH - cpad} x2={CW - cpad} y2={CH - cpad} stroke="rgba(255,255,255,0.18)" />
          {/* faint background characteristics */}
          {[0.2, 0.4, 0.6, 0.8].map((x0, i) => <g key={i} opacity="0.12">
            <line x1={cx(x0)} y1={cy(0)} x2={cx(clamp(x0 + Tmax, 0, 1))} y2={cy(Math.min(Tmax, 1 - x0))} stroke="#7dd3fc" />
            <line x1={cx(x0)} y1={cy(0)} x2={cx(clamp(x0 - Tmax, 0, 1))} y2={cy(Math.min(Tmax, x0))} stroke="#7dd3fc" /></g>)}
          {/* domain-of-dependence base interval */}
          <line x1={cx(dodL)} y1={CH - cpad} x2={cx(dodR)} y2={CH - cpad} stroke="#f0abfc" strokeWidth="3" />
          {/* the cone rays */}
          <line x1={cx(xs)} y1={cy(ts)} x2={cx(dodL)} y2={cy(Math.max(0, ts - (xs - dodL)))} stroke="#f0abfc" strokeWidth="1.5" />
          <line x1={cx(xs)} y1={cy(ts)} x2={cx(dodR)} y2={cy(Math.max(0, ts - (dodR - xs)))} stroke="#f0abfc" strokeWidth="1.5" />
          <circle cx={cx(xs)} cy={cy(ts)} r="4" fill="#f0abfc" stroke="#0a0a0a" strokeWidth="1" />
          <text x={cx(xs) + 6} y={cy(ts) - 4} fontSize="9" fill="#f0abfc" fontFamily="ui-monospace, monospace">(x*, t*)</text>
          <text x={cpad} y={12} fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">t ↑</text>
        </svg>
      </div>
    </div>
  );
};

const WaveCard = () => (
  <Card id="wave" icon={Waves} title="The wave equation & d’Alembert" accent="sky" index={7}
        subtitle="A right-mover plus a left-mover, at speed c, never smoothing">
    <p>
      Wire the Laplacian to a <strong>second</strong> time-derivative and the field rings instead of relaxing. d’Alembert’s
      formula says it all: any shape splits into two half-height copies — one travelling right at speed <Eq>{'\\wv{c}'}</Eq>, one
      left. The equation is simply “translate.” A kink stays a kink (no smoothing), and a point at <Eq>{'(x,\\tt{t})'}</Eq> can only feel
      data inside <Eq>{'[\\,x-\\wv{c}\\tt{t},\\ x+\\wv{c}\\tt{t}\\,]'}</Eq> — a strict speed limit.
    </p>
    <Block>{'\\uu{u}_{\\tt{tt}}=\\wv{c}^2\\,\\lap{\\Delta\\uu{u}} \\qquad \\uu{u}(x,\\tt{t})=\\tfrac12\\big[\\,\\wv{f(x-ct)}+\\wv{f(x+ct)}\\,\\big]'}</Block>
    <WaveString />
    <MinSchema>Every solution is a left-mover plus a right-mover at speed c. Finite speed ⇒ a light cone / <Term>domain of dependence</Term>; energy is conserved, so singularities travel instead of smoothing away.</MinSchema>
    <Worked title="Pluck and split (c = 1)">
      Pluck a unit triangle at <Eq>{'x=0.5'}</Eq> and release from rest. At <Eq>{'\\tt{t}=0.1'}</Eq> there are two half-triangles, at
      {' '}<Eq>{'x=0.4'}</Eq> and <Eq>{'x=0.6'}</Eq>. The point <Eq>{'(0.5,0.1)'}</Eq> depends on <Eq>{'[0.4,0.6]'}</Eq> (it remembers the peak); the point
      {' '}<Eq>{'(0.9,0.1)'}</Eq> depends on <Eq>{'[0.8,1.0]'}</Eq> — still flat, the disturbance hasn’t arrived. Finite speed, in one picture.
    </Worked>
    <Predict question="Pluck one symmetric bump and release it from rest. A moment later, what do you see?">
      <strong>Two bumps, each HALF the height, moving apart at speed c.</strong> The ½ is forced by d’Alembert with zero initial
      velocity: <Eq>{'\\uu{u}=\\tfrac12[f(x-ct)+f(x+ct)]'}</Eq>. Where the two movers later re-overlap, they momentarily add back to full
      height — energy was never lost, only split and relocated.
    </Predict>
    <Misconception
      wrong="Given enough time, the wave equation smooths the bump out, like heat."
      right="It conserves energy and never smooths — a triangular pluck stays exactly sharp, corners and all. Smoothing is a first-order-in-time effect (heat); the second time-derivative overshoots and rings instead."
      because="Same Laplacian, different wiring to time: a velocity reading relaxes, an acceleration reading oscillates." />
    <Deeper>
      <p>
        <strong>Why it factors.</strong> <Eq>{'\\partial_{\\tt{tt}}-\\wv{c}^2\\partial_{xx}=(\\partial_{\\tt{t}}-\\wv{c}\\partial_x)(\\partial_{\\tt{t}}+\\wv{c}\\partial_x)'}</Eq>, so in
        the characteristic coordinates <Eq>{'\\xi=x-\\wv{c}\\tt{t},\\ \\eta=x+\\wv{c}\\tt{t}'}</Eq> the equation is <Eq>{'\\uu{u}_{\\xi\\eta}=0'}</Eq>, giving
        {' '}<Eq>{'\\uu{u}=F(\\xi)+G(\\eta)'}</Eq>. A nonzero initial velocity adds the integral term <Eq>{'\\tfrac{1}{2c}\\int_{x-ct}^{x+ct} g'}</Eq>.
        Energy <Eq>{'E=\\tfrac12\\int(\\uu{u}_{\\tt{t}}^2+\\wv{c}^2\\uu{u}_x^2)'}</Eq> is conserved.
      </p>
      <p>
        <strong>The numerics.</strong> Leapfrog at Courant <Eq>{'\\wv{C}=c\\Delta t/\\Delta x=0.5'}</Eq> is stable; the crucial detail is the
        second-order from-rest first step <Eq>{'\\uu{u}^1_i=\\uu{u}^0_i+\\tfrac12 \\wv{C}^2(\\uu{u}^0_{i+1}-2\\uu{u}^0_i+\\uu{u}^0_{i-1})'}</Eq> — get it wrong and the
        d’Alembert overlay visibly drifts. At <Eq>{'\\wv{C}=1'}</Eq> the scheme is <em>exact</em> (the “magic step”). Reflections come from
        the method of images: fixed ends flip the sign (inverted), free ends do not (upright). In 1D and 3D the cone is sharp; in
        2D a wake fills it in (Huygens fails). Information travels along <CrossLink to="characteristics" recap="x ± ct = const: the curves along which the PDE is an ODE.">characteristics</CrossLink>.
      </p>
    </Deeper>
  </Card>
);
const CharacteristicsDemo = () => {
  const N = 200, dx = 1 / N;
  const [mode, setMode] = useState('linear');
  const [c, setC] = useState(0.6);
  const [playing, setPlaying] = useState(true);
  const u = useRef(null), scr = useRef(null), tR = useRef(0);
  const [tick, setTick] = useState(0);
  const u0fn = (x) => mode === 'linear' ? Math.exp(-(((x - 0.3) / 0.05) ** 2)) : 1 + 0.5 * Math.exp(-(((x - 0.4) / 0.08) ** 2));
  const init = () => { const a = new Float64Array(N); for (let i = 0; i < N; i++) a[i] = u0fn(i * dx); u.current = a; scr.current = new Float64Array(N); tR.current = 0; };
  if (!u.current) init();
  useEffect(() => { init(); setTick((t) => t + 1); /* eslint-disable-next-line */ }, [mode]);

  useRaf(playing, () => {
    if (mode === 'linear') {
      const nu = 0.8, dt = nu * dx / c, SUB = 3;
      for (let s = 0; s < SUB; s++) { const a = u.current, w = scr.current; for (let i = 0; i < N; i++) { const im = (i - 1 + N) % N; w[i] = a[i] - nu * (a[i] - a[im]); } u.current = w; scr.current = a; tR.current += dt; }
      if (0.3 + c * tR.current > 0.97) init();
    } else {
      const a = u.current; let mx = 1e-6; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(a[i]));
      const dt = 0.4 * dx / mx, SUB = 3;
      for (let s = 0; s < SUB; s++) { const cur = u.current, w = scr.current; const f = (v) => 0.5 * v * v; for (let i = 0; i < N; i++) { const ip = (i + 1) % N, im = (i - 1 + N) % N; const Fr = f(Math.max(cur[i], 0)) + f(Math.min(cur[ip], 0)); const Fl = f(Math.max(cur[im], 0)) + f(Math.min(cur[i], 0)); w[i] = cur[i] - (dt / dx) * (Fr - Fl); } u.current = w; scr.current = cur; tR.current += dt; }
      if (tR.current > 0.5) init();
    }
    setTick((t) => (t + 1) % 1e9);
  });

  const ghost = useMemo(() => { if (mode !== 'linear') return null; const a = new Float64Array(N); const sh = c * tR.current; for (let i = 0; i < N; i++) a[i] = u0fn(((i * dx - sh) % 1 + 1) % 1); return a; }, [tick, mode]);

  // (x,t) characteristic panel
  const PW = 340, PH = 150, pad = 14, Tmax = mode === 'linear' ? 1.0 : 0.4;
  const px = (x) => pad + x * (PW - 2 * pad);
  const py = (t) => PH - pad - (t / Tmax) * (PH - 2 * pad);
  const tStar = 0.187;
  const lines = Array.from({ length: 21 }, (_, k) => { const x0 = k / 20; const slope = mode === 'linear' ? c : u0fn(x0); return { x0, slope, h: u0fn(x0) }; });

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['linear', 'linear · uₜ+c uₓ=0'], ['burgers', 'nonlinear · uₜ+u uₓ=0']].map(([k, l]) => <button key={k} onClick={() => setMode(k)} className={`px-2 py-0.5 ${mode === k ? (k === 'linear' ? 'bg-sky-500/20 text-sky-100' : 'bg-rose-500/20 text-rose-100') : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        {mode === 'linear' && <label className="flex items-center gap-1.5 text-neutral-400">c<input type="range" min="0.2" max="0.9" step="0.05" value={c} onChange={(e) => setC(parseFloat(e.target.value))} className="pde-range w-20" /><span className="text-sky-200">{c.toFixed(2)}</span></label>}
        <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">space–time · each line is a characteristic (constant u travels along it)</div>
        <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} className="block w-full">
          <line x1={pad} y1={PH - pad} x2={PW - pad} y2={PH - pad} stroke="rgba(255,255,255,0.18)" />
          {lines.map((ln, i) => { const x1 = ln.x0, t1 = 0; let x2 = ln.x0 + ln.slope * Tmax, t2 = Tmax; if (x2 > 1) { t2 = (1 - ln.x0) / ln.slope; x2 = 1; } if (x2 < 0) { t2 = (0 - ln.x0) / ln.slope; x2 = 0; } const col = mode === 'linear' ? '#7dd3fc' : `hsl(${200 - (ln.h - 1) * 240}, 70%, 65%)`; return <line key={i} x1={px(x1)} y1={py(t1)} x2={px(clamp(x2, 0, 1))} y2={py(clamp(t2, 0, Tmax))} stroke={col} strokeWidth="1" opacity="0.75" />; })}
          {mode === 'burgers' && <>
            <line x1={pad} y1={py(tStar)} x2={PW - pad} y2={py(tStar)} stroke="#f0abfc" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PW - pad} y={py(tStar) - 3} fontSize="9" textAnchor="end" fill="#f0abfc" fontFamily="ui-monospace, monospace">t* ≈ 0.187 · shock forms</text>
          </>}
          <text x={pad} y={12} fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">t ↑</text>
        </svg>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{mode === 'linear' ? 'the profile just slides — solid = upwind, dashed = exact u₀(x−ct)' : 'each height moves at its own speed → the front steepens into a shock'}</div>
        <Field1D u={u.current} yRange={mode === 'linear' ? [-0.1, 1.2] : [0.8, 1.65]} accent={mode === 'linear' ? '#7dd3fc' : '#fb7185'} height={120}
          extra={mode === 'linear' && ghost ? [{ u: ghost, accent: '#e0e7ff', dash: '5 4', opacity: 0.5, width: 1.3 }] : []} />
      </div>
    </div>
  );
};

const CharacteristicsCard = () => (
  <Card id="characteristics" icon={Spline} title="Characteristics: PDE → ODEs along curves" accent="sky" index={8}
        subtitle="Follow the right curves and a PDE collapses into ODEs — until the curves cross">
    <p>
      The transport equation <Eq>{'\\uu{u}_{\\tt{t}}+\\wv{c}\\,\\uu{u}_{\\kx{x}}=0'}</Eq> just slides the profile along at speed
      {' '}<Eq>{'\\wv{c}'}</Eq> — because along the lines <Eq>{'x-\\wv{c}\\tt{t}=\\text{const}'}</Eq> the solution is <em>constant</em>. The PDE is a
      bundle of trivial ODEs, one per <Term>characteristic</Term>. Now let the speed depend on the solution itself,
      {' '}<Eq>{'\\wv{c}=\\uu{u}'}</Eq> (Burgers): the lines stay straight but each carries its own slope, so they <strong>fan</strong> where the
      profile spreads and <strong>cross</strong> where it steepens — and a crossing is a <Term>shock</Term>.
    </p>
    <Block>{'\\uu{u}_{\\tt{t}}+\\wv{c}\\,\\uu{u}_{\\kx{x}}=0 \\;\\Rightarrow\\; \\uu{u}\\ \\text{const along}\\ \\lap{\\tfrac{dx}{d\\tt{t}}=\\wv{c}} \\;\\Rightarrow\\; \\uu{u}(x,\\tt{t})=\\uu{u}_0(x-\\wv{c}\\tt{t})'}</Block>
    <CharacteristicsDemo />
    <MinSchema>A characteristic is a curve along which the PDE is just an ODE. Constant-speed ⇒ parallel lines (the profile translates); solution-dependent speed ⇒ lines cross ⇒ a shock from smooth data.</MinSchema>
    <Worked title="When does the shock form?">
      For the Burgers bump <Eq>{'\\uu{u}_0=1+\\tfrac12 e^{-((x-0.4)/0.08)^2}'}</Eq>, the steepest descending slope is
      {' '}<Eq>{'\\min \\uu{u}_0\' \\approx -5.36'}</Eq>, so characteristics first cross at <Eq>{'t^\\star=-1/\\min \\uu{u}_0\' \\approx 0.187'}</Eq>.
      At that instant the front goes vertical and the classical solution dies; the shock then travels at the average of the
      states it separates, <Eq>{'s=\\tfrac12(\\uu{u}_L+\\uu{u}_R)'}</Eq>.
    </Worked>
    <Predict question="Start Burgers with a perfectly smooth bump (sitting on a background of 1). What happens to its leading face?">
      <strong>It steepens into a vertical wall — a shock — in finite time.</strong> Taller fluid moves faster than shorter, so the
      crest overtakes the toe; characteristics from the crest cross those from the front at <Eq>{'t^\\star=-1/\\min \\uu{u}_0\''}</Eq> and the slope
      goes infinite. A discontinuity born from flawless smooth data — something a linear equation can never do. The trailing
      face spreads into a rarefaction fan.
    </Predict>
    <Misconception
      wrong="The method of characteristics is a toy that only handles simple transport."
      right="It is the backbone of every first-order and hyperbolic PDE — the wave equation's x ± ct, conservation laws, traffic flow, gas dynamics, and the eikonal equation of optics all live on their characteristics."
      because="Characteristics are the literal paths along which information travels; finding them reduces the PDE to ODEs you can integrate." />
    <Deeper>
      <p>
        <strong>The method.</strong> Parametrize a curve by <Eq>{'s'}</Eq> with <Eq>{'dx/ds=a,\\ d\\tt{t}/ds=b'}</Eq>; along it
        {' '}<Eq>{'d\\uu{u}/ds=0'}</Eq>, an ODE. For quasilinear Burgers the characteristics are straight with launch-dependent slope
        {' '}<Eq>{'\\uu{u}_0(x_0)'}</Eq>, crossing first at <Eq>{'t^\\star=-1/\\min \\uu{u}_0\''}</Eq>. After that, the solution is a <em>weak</em> solution:
        the shock satisfies <Term>Rankine-Hugoniot</Term> <Eq>{'s=(\\uu{u}_L+\\uu{u}_R)/2'}</Eq> and the <Term>entropy condition</Term> <Eq>{'\\uu{u}_L>\\uu{u}_R'}</Eq>.
      </p>
      <p>
        <strong>Why upwind.</strong> For <Eq>{'\\wv{c}>0'}</Eq> information comes from the <em>left</em>, so the scheme must difference
        leftward (<Term>upwind</Term>): <Eq>{'\\uu{u}_i \\leftarrow \\uu{u}_i-\\nu(\\uu{u}_i-\\uu{u}_{i-1})'}</Eq>. A centered difference uses the
        downwind point and is unconditionally unstable. Burgers needs the conservative <Term>Godunov</Term>/Engquist–Osher flux on
        {' '}<Eq>{'f=\\uu{u}^2/2'}</Eq> to get the shock <em>speed</em> right (Lax–Wendroff theorem). This sets up nonlinear waves
        ({' '}<CrossLink to="burgers" recap="Smooth data → finite-time shock; viscosity selects the entropy solution.">burgers</CrossLink>) and stability ({' '}<CrossLink to="cfl" recap="CFL: the numerical domain of dependence must contain the physical one.">cfl</CrossLink>).
      </p>
    </Deeper>
  </Card>
);
const LaplacePlate = () => {
  const G = 62, N = 60, dx = 1 / (N + 1);
  const [edges, setEdges] = useState({ top: 1, bot: 0, left: 0, right: 0 });
  const [method, setMethod] = useState('gs');
  const [poisson, setPoisson] = useState(false);
  const u = useRef(null), scr = useRef(null), src = useRef(null), iters = useRef(0);
  const [tick, setTick] = useState(0), [residual, setResidual] = useState(1), [converged, setConverged] = useState(false), [hover, setHover] = useState(null);
  const applyBC = (a) => {
    for (let x = 0; x < G; x++) { a[x] = edges.top; a[(G - 1) * G + x] = edges.bot; }
    for (let y = 0; y < G; y++) { a[y * G] = edges.left; a[y * G + G - 1] = edges.right; }
    a[0] = (edges.top + edges.left) / 2; a[G - 1] = (edges.top + edges.right) / 2; a[(G - 1) * G] = (edges.bot + edges.left) / 2; a[(G - 1) * G + G - 1] = (edges.bot + edges.right) / 2;
  };
  if (!u.current) { u.current = new Float64Array(G * G); scr.current = new Float64Array(G * G); src.current = new Float64Array(G * G); applyBC(u.current); }
  useEffect(() => { applyBC(u.current); iters.current = 0; setConverged(false); /* eslint-disable-next-line */ }, [edges, poisson]);

  useRaf(true, () => {
    if (converged) return;
    const a = u.current, s = src.current;
    const srcTerm = (i) => poisson ? 0.25 * dx * dx * s[i] : 0;
    for (let sweep = 0; sweep < 20; sweep++) {
      if (method === 'jacobi') { const w = scr.current; for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; w[i] = 0.25 * (a[i - 1] + a[i + 1] + a[i - G] + a[i + G]) + srcTerm(i); } for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; a[i] = w[i]; } }
      else { for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; a[i] = 0.25 * (a[i - 1] + a[i + 1] + a[i - G] + a[i + G]) + srcTerm(i); } }
      iters.current++;
    }
    let res = 0; for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) { const i = y * G + x; const d = Math.abs(a[i - 1] + a[i + 1] + a[i - G] + a[i + G] - 4 * a[i] + dx * dx * (poisson ? s[i] : 0)); if (d > res) res = d; }
    setResidual(res); if (res < 1e-6) setConverged(true);
    setTick((t) => (t + 1) % 1e9);
  });

  const center = u.current[31 * G + 31];
  let bMax = -9, bMin = 9; for (let x = 0; x < G; x++) { bMax = Math.max(bMax, u.current[x], u.current[(G - 1) * G + x]); bMin = Math.min(bMin, u.current[x], u.current[(G - 1) * G + x]); }
  for (let y = 0; y < G; y++) { bMax = Math.max(bMax, u.current[y * G], u.current[y * G + G - 1]); bMin = Math.min(bMin, u.current[y * G], u.current[y * G + G - 1]); }
  let iMax = -9; for (let y = 1; y < G - 1; y++) for (let x = 1; x < G - 1; x++) iMax = Math.max(iMax, u.current[y * G + x]);

  const DISP = 280;
  const cellFromEvent = (e) => { const r = e.currentTarget.getBoundingClientRect(); return [clamp(Math.floor((e.clientX - r.left) / r.width * G), 0, G - 1), clamp(Math.floor((e.clientY - r.top) / r.height * G), 0, G - 1)]; };
  const onMove = (e) => { const [x, y] = cellFromEvent(e); if (x > 0 && x < G - 1 && y > 0 && y < G - 1) { const i = y * G + x; setHover({ x, y, u: u.current[i], avg: 0.25 * (u.current[i - 1] + u.current[i + 1] + u.current[i - G] + u.current[i + G]) }); } else setHover(null); };
  const onClick = (e) => { if (!poisson) return; const [x, y] = cellFromEvent(e); if (x > 0 && x < G - 1 && y > 0 && y < G - 1) { const i = y * G + x; src.current[i] = clamp(src.current[i] + (e.shiftKey ? -2500 : 2500), -8000, 8000); iters.current = 0; setConverged(false); } };

  const setE = (k, v) => setEdges((e) => ({ ...e, [k]: v }));
  return (
    <div className="mt-3 grid md:grid-cols-[280px_1fr] gap-4 items-start">
      <div>
        <div className="flex items-center justify-center mb-1"><EdgeSlider k="top" v={edges.top} setE={setE} /></div>
        <div className="flex items-center gap-1">
          <EdgeSlider k="left" v={edges.left} setE={setE} vertical />
          <div className="relative rounded overflow-hidden border border-white/10 cursor-crosshair flex-1" onMouseMove={onMove} onMouseLeave={() => setHover(null)} onClick={onClick}>
            <Heatmap2D field={u.current} nx={G} ny={G} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={poisson ? [-1.4, 1.4] : [-1.05, 1.05]} smooth tick={tick} style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
            {hover && <svg viewBox={`0 0 ${G} ${G}`} className="absolute inset-0 w-full h-full pointer-events-none"><rect x={hover.x} y={hover.y} width={1} height={1} fill="none" stroke="#f0abfc" strokeWidth={0.5} /></svg>}
          </div>
          <EdgeSlider k="right" v={edges.right} setE={setE} vertical />
        </div>
        <div className="flex items-center justify-center mt-1"><EdgeSlider k="bot" v={edges.bot} setE={setE} /></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <div className="inline-flex rounded border border-white/15 overflow-hidden">
            {[['jacobi', 'Jacobi'], ['gs', 'Gauss–Seidel']].map(([k, l]) => <button key={k} onClick={() => { setMethod(k); iters.current = 0; setConverged(false); }} className={`px-2 py-0.5 ${method === k ? 'bg-emerald-500/20 text-emerald-100' : 'text-neutral-400'}`}>{l}</button>)}
          </div>
          <button onClick={() => { setPoisson((p) => !p); if (poisson) src.current.fill(0); }} className={`px-2 py-0.5 rounded border ${poisson ? 'border-rose-400/40 text-rose-300 bg-rose-400/10' : 'border-white/15 text-neutral-300 bg-white/[0.04]'}`}>Poisson source</button>
        </div>
        {poisson && <div className="text-[10px] text-neutral-500">click to drop +source, shift-click for −source (Δu = −f bulges the interior)</div>}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="center temp" value={center.toFixed(3)} sub={poisson ? 'with a source' : '≈ 0.242 for one hot edge'} color="text-emerald-200" />
          <Stat label={`${method === 'gs' ? 'Gauss–Seidel' : 'Jacobi'} sweeps`} value={iters.current} sub={converged ? 'converged' : `residual ${residual.toExponential(1)}`} color={converged ? 'text-emerald-300' : 'text-amber-200'} />
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 min-h-[70px]">
          {hover ? (
            <div className="text-[12px] font-mono">cell ({hover.x},{hover.y}): <span className="text-neutral-100">u = {hover.u.toFixed(3)}</span> · <span className="text-indigo-200">neighbor avg = {hover.avg.toFixed(3)}</span>
              <div className="text-[11px] text-neutral-400 mt-1">{Math.abs(hover.u - hover.avg) < 1e-3 ? 'they match — this point IS the average of its neighbors (Δu = 0).' : 'still relaxing — Δu ≠ 0 yet.'}</div></div>
          ) : (
            <div className="text-[12px] text-neutral-500 italic">{poisson ? <>No interior hotspot? Now there is one — a source breaks the maximum principle.</> : <>interior max <span className="text-emerald-300">{iMax.toFixed(3)}</span> ≤ boundary max <span className="text-neutral-300">{bMax.toFixed(2)}</span> — harmonic functions have no interior peaks. Hover a cell to check the mean-value property.</>}</div>
          )}
        </div>
      </div>
    </div>
  );
};
const EdgeSlider = ({ k, v, setE, vertical }) => (
  <label className={`flex ${vertical ? 'flex-col h-[200px]' : 'w-[200px]'} items-center gap-1 text-[9px] font-mono text-neutral-500`}>
    <span className="uppercase">{k}</span>
    <input type="range" min="-1" max="1" step="0.05" value={v} onChange={(e) => setE(k, parseFloat(e.target.value))} className="pde-range" style={vertical ? { writingMode: 'vertical-lr', direction: 'rtl', width: 4, flex: 1 } : { flex: 1 }} />
    <span className="tabular-nums text-neutral-400">{v.toFixed(1)}</span>
  </label>
);

const LaplaceCard = () => (
  <Card id="laplace" icon={Scale} title="Laplace & Poisson: equilibrium" accent="emerald" index={9}
        subtitle="When you ARE the average of your neighbors, nothing moves">
    <p>
      Set the clock to infinity and heat stops. What remains is the field where every interior point <em>exactly</em> equals the
      average of its neighbors — the <Term>mean-value</Term> property. There are no interior hot-spots (a <Term>maximum principle</Term>),
      the field is as smooth as it can be, and you reach it by iterating the <CrossLink to="laplacian" recap="Δu = neighbor-average − you; relaxation drives Δu → 0.">Laplacian’s own relax step</CrossLink>.
    </p>
    <Block>{'\\lap{\\Delta\\uu{u}}=0 \\qquad \\uu{u}(\\mathbf{x})=\\operatorname*{avg}_{\\text{neighbors}}\\uu{u} \\qquad \\lap{\\Delta\\uu{u}}=-\\src{f}\\ \\ (\\text{Poisson: sources})'}</Block>
    <LaplacePlate />
    <MinSchema>A harmonic field is the smoothest interpolation of its boundary values — every interior point is its neighbors’ average, so no interior maximum exists. Relaxation (Jacobi / Gauss–Seidel) computes it by repeated averaging.</MinSchema>
    <Predict question="One edge is hot (+1), the other three cold (0). What is the equilibrium temperature at the centre?">
      <strong>About 0.25 — not 0.5.</strong> The centre sees one hot edge and three cold ones, diluted by distance; the relaxed
      harmonic value is <Eq>{'\\approx 0.242'}</Eq> on this 60×60 grid (the smooth-domain limit is exactly <Eq>{'\\tfrac14'}</Eq>). And it can never
      exceed the hot edge — harmonic functions simply cannot have an interior peak.
    </Predict>
    <Misconception
      wrong="Laplace is a separate, static problem with nothing to do with heat."
      right="Laplace IS heat at t → ∞: Δu = 0 is exactly the condition uₜ = 0. Relaxation/Jacobi is the explicit heat update with the timestep absorbed into the averaging."
      because="The fixed point of the heat step is 'neighbor-sum = 4u', i.e. Δu = 0 — so running heat forever and solving Laplace are the same computation." />
    <Deeper>
      <p>
        <strong>Why it’s well-posed.</strong> The <Term>mean-value</Term> property forces a <Term>maximum principle</Term> (the max sits on the
        boundary), which gives uniqueness and continuous dependence — a model <Term>well-posed</Term> boundary-value problem. The harmonic
        solution also minimizes the Dirichlet energy <Eq>{'\\tfrac12\\int|\\nabla\\uu{u}|^2'}</Eq>, so it is the “tautest membrane” over the
        boundary frame.
      </p>
      <p>
        <strong>Relaxation as a linear solve.</strong> The 5-point stencil is a sparse system <Eq>{'A\\uu{u}=b'}</Eq>; Jacobi and
        Gauss–Seidel are its classical iterations. On this 60×60 plate Jacobi needs <Eq>{'\\approx 4739'}</Eq> sweeps to converge,
        Gauss–Seidel <Eq>{'\\approx 2617'}</Eq> (~1.8× faster) — but both are <Eq>{'\\mathcal{O}(N^2)'}</Eq> because the spectral radius is
        {' '}<Eq>{'\\cos(\\pi/N)\\to 1'}</Eq>. SOR and multigrid fix the <em>order</em> (multigrid is <Eq>{'\\mathcal{O}(N)'}</Eq>). Add a source and you
        solve <Term>Poisson</Term> <Eq>{'\\lap{\\Delta\\uu{u}}=-\\src{f}'}</Eq> — now an interior bulge is allowed, the source breaking the max principle.
      </p>
    </Deeper>
  </Card>
);
const FourierLab = () => {
  const P = 256, KMAX = 40;
  const [icName, setIcName] = useState('step');
  const [M, setM] = useState(10);
  const [mode, setMode] = useState('heat');
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const u0 = (x) => { if (icName === 'step') return (x > 0.25 && x < 0.75) ? 1 : 0; if (icName === 'triangle') return Math.max(0, 1 - Math.abs(x - 0.5) / 0.25); if (icName === 'spike') return Math.exp(-(((x - 0.5) / 0.03) ** 2)); return Math.exp(-(((x - 0.5) / 0.12) ** 2)); };
  const bk = useMemo(() => { const b = new Float64Array(KMAX + 1); for (let k = 1; k <= KMAX; k++) { let s = 0; for (let p = 0; p < P; p++) { const x = (p + 0.5) / P; s += u0(x) * Math.sin(k * Math.PI * x); } b[k] = 2 * s / P; } return b; }, [icName]);
  const target = useMemo(() => { const u = new Float64Array(P); for (let p = 0; p < P; p++) u[p] = u0((p + 0.5) / P); return u; }, [icName]);
  const amps = useMemo(() => { const a = new Float64Array(KMAX + 1); for (let k = 1; k <= KMAX; k++) { const w = k * Math.PI; a[k] = mode === 'heat' ? bk[k] * Math.exp(-w * w * t) : mode === 'wave' ? bk[k] * Math.cos(w * t) : bk[k]; } return a; }, [bk, mode, t]);
  const recon = useMemo(() => { const u = new Float64Array(P); for (let p = 0; p < P; p++) { const x = (p + 0.5) / P; let s = 0; for (let k = 1; k <= M; k++) s += amps[k] * Math.sin(k * Math.PI * x); u[p] = s; } return u; }, [amps, M]);
  // static t=0 truncation for the RMS / Gibbs readouts
  const recon0 = useMemo(() => { const u = new Float64Array(P); for (let p = 0; p < P; p++) { const x = (p + 0.5) / P; let s = 0; for (let k = 1; k <= M; k++) s += bk[k] * Math.sin(k * Math.PI * x); u[p] = s; } return u; }, [bk, M]);
  const rms = useMemo(() => { let s = 0; for (let p = 0; p < P; p++) s += (recon0[p] - target[p]) ** 2; return Math.sqrt(s / P); }, [recon0, target]);
  const gibbs = useMemo(() => { let mx = 0; for (let p = 0; p < P; p++) if (recon0[p] > mx) mx = recon0[p]; return mx - 1; }, [recon0]);
  useRaf(playing, () => { if (mode === 'laplace') { setT(0); return; } const dt = mode === 'heat' ? 0.0012 : 0.006; const cap = mode === 'heat' ? 0.3 : 2.1; setT((tt) => tt + dt > cap ? 0 : tt + dt); });
  const ampMax = useMemo(() => Math.max(0.05, ...Array.from(bk).map(Math.abs)), [bk]);

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['step', 'step'], ['triangle', 'triangle'], ['spike', 'spike'], ['bump', 'bump']].map(([k, l]) => <button key={k} onClick={() => setIcName(k)} className={`px-2 py-0.5 ${icName === k ? 'bg-indigo-500/20 text-indigo-100' : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['heat', 'heat'], ['wave', 'wave'], ['laplace', 'frozen']].map(([k, l]) => <button key={k} onClick={() => { setMode(k); setT(0); }} className={`px-2 py-0.5 ${mode === k ? 'bg-indigo-500/20 text-indigo-100' : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">reconstruction from {M} modes · solid = sum, dashed = the true target</div>
        <Field1D u={recon} yRange={[-0.35, 1.35]} accent="#a5b4fc" height={130}
          extra={[{ u: target, accent: '#e0e7ff', dash: '5 4', opacity: 0.45, width: 1.3 }]} />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">mode amplitudes |âₖ| · {mode === 'heat' ? 'heat damps each by e^(−k²Dt) → high pitch dies first' : mode === 'wave' ? 'wave spins each by cos(ckt) → energy conserved' : 'Laplace freezes every mode'}</div>
        <FourierEqualizer amps={Array.from(amps).slice(1, M + 1)} max={ampMax} height={110} />
      </div>
      <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono">
        <label className="flex items-center gap-1.5 text-neutral-400">modes M<input type="range" min="1" max="40" value={M} onChange={(e) => setM(parseInt(e.target.value))} className="pde-range w-28" /><span className="text-indigo-200">{M}</span></label>
        <span className="text-neutral-400">RMS error <span className="text-amber-200">{rms.toFixed(3)}</span></span>
        {icName === 'step' && <span className="text-neutral-400">Gibbs overshoot <span className="text-rose-200">{(gibbs * 100).toFixed(1)}%</span></span>}
      </div>
    </div>
  );
};

const FourierCard = () => (
  <Card id="fourier" icon={AudioWaveform} title="Fourier: diagonalizing the Laplacian" accent="indigo" index={10} anchor
        subtitle="Sines are eigenvectors of Δ — the PDE falls apart into one ODE per mode">
    <p>
      Here is the language that makes every earlier card trivial. <Eq>{'\\lap{\\Delta}\\kx{\\sin(kx)}=-\\kx{k}^2\\kx{\\sin(kx)}'}</Eq> —
      sines are the <Term>eigenfunction</Term>s of the Laplacian. Write any field as a sum of sines, and the coupled PDE
      <em> decouples</em> into independent scalar ODEs, one per <Term>Fourier mode</Term>. Heat damps each amplitude by
      {' '}<Eq>{'e^{-\\kx{k}^2D\\tt{t}}'}</Eq> (high pitch dies first → smoothing); waves spin each by <Eq>{'\\cos(\\wv{c}\\kx{k}\\tt{t})'}</Eq>; Laplace
      freezes them. Separation of variables, “hear the drum,” and spectral methods are all <em>this one move</em>.
    </p>
    <Block>{'\\lap{\\Delta}\\kx{\\sin(kx)}=-\\kx{k}^2\\kx{\\sin(kx)} \\qquad \\uu{u}(x,\\tt{t})=\\sum_k \\hat a_k(\\tt{t})\\,\\kx{\\sin(kx)}'}</Block>
    <Block>{'\\text{heat: } \\hat a_k=\\hat a_k(0)\\,e^{-\\kx{k}^2 D\\tt{t}} \\qquad \\text{wave: } \\hat a_k=\\hat a_k(0)\\cos(\\wv{c}\\kx{k}\\tt{t}) \\qquad \\text{Laplace: frozen}'}</Block>
    <FourierLab />
    <MinSchema>The Fourier basis is the coordinate system in which Δ is <strong>diagonal</strong>. In it, every linear constant-coefficient PDE becomes a list of one-variable ODEs — solved per mode, then summed back.</MinSchema>
    <Worked title="Separation of variables, in one breath">
      Seek <Eq>{'\\uu{u}(x,\\tt{t})=X(x)T(\\tt{t})'}</Eq> for <Eq>{'\\uu{u}_{\\tt{t}}=D\\uu{u}_{xx}'}</Eq>. Dividing gives
      {' '}<Eq>{'T\'/DT = X\'\'/X = -\\lambda'}</Eq> (both sides must equal a constant). The boundary conditions select
      {' '}<Eq>{'X_n=\\kx{\\sin(n\\pi x)},\\ \\lambda_n=(n\\pi)^2'}</Eq>, and then <Eq>{'T_n=e^{-D(n\\pi)^2\\tt{t}}'}</Eq>. Superpose with the
      sine coefficients <Eq>{'b_n'}</Eq> of the initial data. The PDE has become infinitely many <em>independent</em> ODEs.
    </Worked>
    <Predict question="Start heat from a tall thin spike. Which mode loses amplitude fastest — k = 1 or k = 20?">
      <strong>The highest, k = 20 — and not by a little.</strong> Decay <Eq>{'e^{-\\kx{k}^2 D\\tt{t}}'}</Eq> goes as <Eq>{'\\kx{k}^2'}</Eq>, so k = 20 fades
      {' '}<Eq>{'400\\times'}</Eq> faster than k = 1. Diffusion is a <em>low-pass filter</em> — which is exactly why heat smooths, and why
      reversing it (amplifying the high modes) is hopeless.
    </Predict>
    <Misconception
      wrong="Fourier series is just a way of curve-fitting with sine waves."
      right="The sines are the eigenfunctions of Δ, so the Fourier basis is the coordinate system where Δ is diagonal. The PDE is exactly diagonalized — not approximated — the very same move as diagonalizing a matrix."
      because="Once Δ is diagonal, applying it is just multiplying each mode by −k²; the evolution operator e^{tΔ} acts mode-by-mode." />
    <Deeper>
      <p>
        <strong>Which sinusoids?</strong> The boundary conditions pick the basis: <Eq>{'\\kx{\\sin(k\\pi x)}'}</Eq> for Dirichlet,
        {' '}<Eq>{'\\cos(k\\pi x)'}</Eq> for Neumann, <Eq>{'e^{ikx}'}</Eq> for periodic. Each is a complete orthogonal basis (Sturm–Liouville
        theory), so <Term>Parseval</Term> holds and energy splits cleanly across modes. The three big PDEs become the same family of
        per-mode ODEs — only the time-side differs.
      </p>
      <p>
        <strong>Gibbs.</strong> Truncating at <Eq>{'M'}</Eq> modes near a jump overshoots by <Eq>{'\\approx 8.95\\%'}</Eq> of the jump (the
        Wilbraham–Gibbs constant) — and it never goes away as <Eq>{'M\\to\\infty'}</Eq>; the overshoot just narrows. You can watch it on
        the step above. <strong>Spectral methods</strong> push this idea to its limit: represent the field in the Fourier basis and
        differentiate exactly (multiply by <Eq>{'-\\kx{k}^2'}</Eq>), getting exponential accuracy on smooth data
        ({' '}<CrossLink to="fem" recap="Spectral = exponential accuracy on smooth problems.">fem</CrossLink>). And the eigenvalues
        {' '}<Eq>{'\\sqrt{\\lambda_n}'}</Eq> are literally the frequencies a drum sings ({' '}<CrossLink to="drum" recap="Eigenmodes of Δ on a 2D domain = a drum's sound.">drum</CrossLink>).
        The very same modes govern numerical stability ({' '}<CrossLink to="cfl" recap="Plug a Fourier mode into the scheme; demand |g|≤1.">cfl</CrossLink>).
      </p>
    </Deeper>
  </Card>
);
const GreensDemo = () => {
  const NG = 120;
  const [sources, setSources] = useState([{ x: 0.5, y: 0.5, q: 1 }]);
  const [kernel, setKernel] = useState('newton');
  const [tk, setTk] = useState(0.04);
  const { f, amax } = useMemo(() => {
    const arr = new Float64Array(NG * NG), r0 = 1.5 / NG; let mx = 1e-6;
    for (let yy = 0; yy < NG; yy++) for (let xx = 0; xx < NG; xx++) {
      let v = 0; const px = xx / NG, py = yy / NG;
      for (const s of sources) { const r = Math.hypot(px - s.x, py - s.y); const G = kernel === 'newton' ? -(1 / (2 * Math.PI)) * Math.log(Math.max(r, r0)) : (1 / (4 * Math.PI * tk)) * Math.exp(-(r * r) / (4 * tk)); v += s.q * G; }
      arr[yy * NG + xx] = v; if (Math.abs(v) > mx) mx = Math.abs(v);
    }
    return { f: arr, amax: mx };
  }, [sources, kernel, tk]);
  const onClick = (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = clamp((e.clientX - r.left) / r.width, 0, 1), y = clamp((e.clientY - r.top) / r.height, 0, 1); setSources((s) => s.length >= 30 ? s : [...s, { x, y, q: e.shiftKey ? -1 : 1 }]); };

  // Right panel: −u'' + u = f solved by transform
  const Pt = 64;
  const [fName, setFName] = useState('two');
  const trans = useMemo(() => {
    const ff = (x) => fName === 'bump' ? Math.exp(-(((x - Math.PI) / 0.5) ** 2)) : fName === 'two' ? Math.exp(-(((x - 2) / 0.4) ** 2)) + Math.exp(-(((x - 4.3) / 0.4) ** 2)) : (x > 2.2 && x < 4.1 ? 1 : 0);
    const fA = new Float64Array(Pt); for (let p = 0; p < Pt; p++) fA[p] = ff(2 * Math.PI * p / Pt);
    const re = new Float64Array(Pt), im = new Float64Array(Pt);
    for (let k = 0; k < Pt; k++) { let r = 0, i = 0; for (let p = 0; p < Pt; p++) { const a = -2 * Math.PI * k * p / Pt; r += fA[p] * Math.cos(a); i += fA[p] * Math.sin(a); } re[k] = r / Pt; im[k] = i / Pt; }
    const ur = new Float64Array(Pt), ui = new Float64Array(Pt);
    for (let k = 0; k < Pt; k++) { const kw = k <= Pt / 2 ? k : k - Pt; const d = kw * kw + 1; ur[k] = re[k] / d; ui[k] = im[k] / d; }
    const uA = new Float64Array(Pt); for (let p = 0; p < Pt; p++) { let r = 0; for (let k = 0; k < Pt; k++) { const a = 2 * Math.PI * k * p / Pt; r += ur[k] * Math.cos(a) - ui[k] * Math.sin(a); } uA[p] = r; }
    return { fA, uA };
  }, [fName]);

  const DISP = 260;
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">click to add a point source · the field = Σ q · G(x − xₘ)</div>
        <div className="relative rounded-lg overflow-hidden border border-white/10 cursor-crosshair" style={{ width: '100%', maxWidth: DISP }} onClick={onClick}>
          <Heatmap2D field={f} nx={NG} ny={NG} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[-amax, amax]} smooth style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
          <svg viewBox="0 0 1 1" className="absolute inset-0 w-full h-full pointer-events-none">
            {sources.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={0.012} fill={s.q > 0 ? '#fb923c' : '#67e8f9'} stroke="#0a0a0a" strokeWidth={0.004} />)}
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono mt-2">
          <div className="inline-flex rounded border border-white/15 overflow-hidden">
            {[['newton', 'Newtonian (Laplace)'], ['heat', 'heat kernel']].map(([k, l]) => <button key={k} onClick={() => setKernel(k)} className={`px-2 py-0.5 ${kernel === k ? 'bg-violet-500/20 text-violet-100' : 'text-neutral-400'}`}>{l}</button>)}
          </div>
          <button onClick={() => setSources([{ x: 0.5, y: 0.5, q: 1 }])} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
          {kernel === 'heat' && <label className="flex items-center gap-1 text-neutral-400">t<input type="range" min="0.005" max="0.08" step="0.005" value={tk} onChange={(e) => setTk(parseFloat(e.target.value))} className="pde-range w-16" /></label>}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">shift-click for a −source · {kernel === 'newton' ? 'G = −(1/2π) log r' : 'G = e^(−r²/4Dt)/(4πDt)'}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">solve −u″ + u = f by transform · ∂ₓ ↦ ik makes it algebra</div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <Field1D u={trans.uA} yRange={[-0.1, 1.25]} accent="#c4b5fd" height={120}
            extra={[{ u: trans.fA, accent: '#fb7185', dash: '5 4', opacity: 0.6, width: 1.3 }]} />
          <div className="text-[10px] text-neutral-500 mt-1">dashed = source f · solid = solution u = (k² + 1)⁻¹ f̂, mode by mode</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono mt-2">
          {[['bump', 'one bump'], ['two', 'two bumps'], ['step', 'step']].map(([k, l]) => <button key={k} onClick={() => setFName(k)} className={`px-2 py-0.5 rounded border ${fName === k ? 'border-violet-400/40 text-violet-200 bg-violet-400/10' : 'border-white/15 text-neutral-400'}`}>{l}</button>)}
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">each mode just divides by (k² + 1) — high modes (sharp features) are damped most</div>
      </div>
    </div>
  );
};

const GreensCard = () => (
  <Card id="greens" icon={Zap} title="Green’s functions & transforms" accent="violet" index={11}
        subtitle="Solve for one point source, add copies to solve any source">
    <p>
      Two superpowers of linearity. <strong>First:</strong> solve once for a point source — the impulse response
      {' '}<Term>Green’s function</Term> <Eq>{'G'}</Eq> — and since any source is a pile of point sources, the answer to <em>any</em> source is
      just <Eq>{'G*\\src{f}'}</Eq>. <strong>Second:</strong> a Fourier/Laplace transform turns <Eq>{'d/dx'}</Eq> into <Eq>{'\\times ik'}</Eq>, so the
      differential equation becomes algebra. It’s the same superposition you met as the impulse response in control theory.
    </p>
    <Block>{'\\lap{\\Delta}G(\\mathbf{x},\\mathbf{x}_0)=-\\delta(\\mathbf{x}-\\mathbf{x}_0) \\qquad \\uu{u}(\\mathbf{x})=\\int G\\,\\src{f(\\mathbf{x}_0)}\\,d\\mathbf{x}_0=(G*\\src{f})(\\mathbf{x})'}</Block>
    <GreensDemo />
    <MinSchema>The Green’s function is the field of a single point source; convolving it with any source solves the whole problem. Transforms diagonalize the operator so each mode is handled by simple division.</MinSchema>
    <Predict question="You’ve already solved Δu = −δ (the Green’s function). A complicated smooth source f arrives. How much extra PDE-solving is needed?">
      <strong>None.</strong> Linearity means the response to a pile of sources is the pile of responses:
      {' '}<Eq>{'\\uu{u}(\\mathbf{x})=\\int G(\\mathbf{x}-\\mathbf{x}_0)\\,\\src{f(\\mathbf{x}_0)}\\,d\\mathbf{x}_0'}</Eq>. One impulse response plus a convolution solves every
      {' '}<Eq>{'\\src{f}'}</Eq> — exactly like a linear time-invariant system’s impulse response in <CrossLink to="control-theory" recap="An LTI system's output = input convolved with its impulse response." external>control theory</CrossLink>.
    </Predict>
    <Misconception
      wrong="A Green's function only works for the exact point source it was built from."
      right="It is the universal building block: δ is the simplest possible source, and every source is a superposition of shifted deltas. G is literally the inverse operator written as a kernel — G = L⁻¹ acting on δ, the convolution identity."
      because="Because L is linear and translation-invariant, L⁻¹ is convolution against G; applying it to any f is one integral." />
    <Deeper>
      <p>
        <strong>The fundamental solutions of the big three.</strong> Laplace/Poisson in 2D gives the Newtonian potential
        {' '}<Eq>{'G=-(1/2\\pi)\\log r'}</Eq> (in 3D, <Eq>{'1/4\\pi r'}</Eq>); heat gives the Gaussian <Term>heat kernel</Term>; the wave equation’s
        lives on the light cone (sharp in 3D, with a 2D wake). Boundaries are handled by the method of images.
      </p>
      <p>
        <strong>Transforms.</strong> Under a Fourier transform <Eq>{'\\partial/\\partial x \\mapsto ik'}</Eq>, so <Eq>{'\\lap{\\Delta}\\mapsto -|k|^2'}</Eq>
        and Poisson becomes <Eq>{'\\hat{\\uu{u}}=\\hat{\\src{f}}/|k|^2'}</Eq>, with <Eq>{'\\hat G=1/|k|^2'}</Eq> — the unbounded-domain twin of the
        {' '}<CrossLink to="fourier" recap="Diagonalize Δ; each mode evolves independently.">Fourier</CrossLink> card. The right panel solves <Eq>{'-u\'\'+u=f'}</Eq> exactly this way: divide each
        mode by <Eq>{'(k^2+1)'}</Eq> and transform back. Green’s functions win when the geometry is simple and the source is the
        unknown’s driver; otherwise relaxation, spectral methods, or FEM take over (boundary-element methods realize <Eq>{'G'}</Eq> numerically).
      </p>
    </Deeper>
  </Card>
);
const StencilSparsity = () => {
  const G = 8, n = G * G;
  const [sc, setSc] = useState(3), [sr, setSr] = useState(3);
  const row = sr * G + sc;
  const nz = useMemo(() => { const out = []; for (let r = 0; r < n; r++) { const c = r % G, rr = (r - c) / G; out.push([r, r, -4]); if (c > 0) out.push([r, r - 1, 1]); if (c < G - 1) out.push([r, r + 1, 1]); if (rr > 0) out.push([r, r - G, 1]); if (rr < G - 1) out.push([r, r + G, 1]); } return out; }, []);
  const [hh, setHh] = useState(0.2);
  const D2 = (h) => (Math.sin(1 + h) - 2 * Math.sin(1) + Math.sin(1 - h)) / (h * h);
  const D1 = (h) => (Math.sin(1 + h) - Math.sin(1)) / h;
  const e2 = (h) => Math.abs(D2(h) + Math.sin(1));
  const e1 = (h) => Math.abs(D1(h) - Math.cos(1));
  const hs = useMemo(() => { const a = []; for (let i = 0; i <= 24; i++) a.push(0.8 * Math.pow(0.01 / 0.8, i / 24)); return a; }, []);
  const L = (v) => Math.log10(Math.max(v, 1e-12));
  const curve2 = hs.map((h) => [L(h), L(e2(h))]);
  const curve1 = hs.map((h) => [L(h), L(e1(h))]);
  const gridDots = []; for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) gridDots.push([i, j]);
  const onGrid = (e) => { const r = e.currentTarget.getBoundingClientRect(); setSc(clamp(Math.round((e.clientX - r.left) / r.width * (G - 1)), 0, G - 1)); setSr(clamp(Math.round((e.clientY - r.top) / r.height * (G - 1)), 0, G - 1)); };

  return (
    <div className="mt-3 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">the 5-point stencil · drag it on the grid</div>
          <svg viewBox="-0.5 -0.5 8 8" className="block w-full max-w-[220px] mx-auto cursor-pointer" onMouseDown={onGrid} onMouseMove={(e) => e.buttons === 1 && onGrid(e)}>
            {gridDots.map(([i, j], k) => <circle key={k} cx={i} cy={j} r="0.12" fill="rgba(255,255,255,0.22)" />)}
            {[[sc, sr, '−4', '#a5b4fc'], [sc + 1, sr, '+1', '#67e8f9'], [sc - 1, sr, '+1', '#67e8f9'], [sc, sr + 1, '+1', '#67e8f9'], [sc, sr - 1, '+1', '#67e8f9']].map(([i, j, lbl, col], k) => (i >= 0 && i < G && j >= 0 && j < G) ? <g key={k}><circle cx={i} cy={j} r="0.32" fill={col} fillOpacity="0.25" stroke={col} strokeWidth="0.05" /><text x={i} y={j + 0.12} fontSize="0.34" textAnchor="middle" fill={col} fontFamily="ui-monospace, monospace">{lbl}</text></g> : null)}
          </svg>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">the 64×64 matrix · pentadiagonal (offsets 0, ±1, ±8)</div>
          <svg viewBox="0 0 64 64" className="block w-full max-w-[220px] mx-auto border border-white/10 bg-black/30">
            {nz.map(([r, c, v], k) => <rect key={k} x={c} y={r} width={1} height={1} fill={r === row ? '#f0abfc' : v < 0 ? '#a5b4fc' : '#67e8f9'} opacity={r === row ? 1 : 0.7} />)}
          </svg>
          <div className="text-[10px] text-neutral-500 mt-1 text-center">row {row} highlighted — the stencil’s equation</div>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">accuracy of d²/dx² at x₀ = 1 · log–log error vs Δx</div>
        <MultiLinePlot width={360} height={200}
          series={[{ pts: curve2, color: '#67e8f9', width: 2, label: 'central 2nd diff · slope 2' }, { pts: curve1, color: '#fbbf24', width: 2, label: 'forward 1st diff · slope 1' }]}
          xRange={[-2.1, 0]} yRange={[-7, 0.5]} xLabel="log₁₀ Δx" yLabel="err" yTicks={[-6, -3, 0]}
          vlines={[{ at: L(hh), color: '#f0abfc', label: 'Δx' }]} dots={[{ x: L(hh), y: L(e2(hh)), color: '#67e8f9' }, { x: L(hh), y: L(e1(hh)), color: '#fbbf24' }]} />
        <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono mt-1">
          <label className="flex items-center gap-1.5 text-neutral-400">Δx<input type="range" min="0.01" max="0.8" step="0.01" value={hh} onChange={(e) => setHh(parseFloat(e.target.value))} className="pde-range w-24" /><span className="text-fuchsia-200">{hh.toFixed(2)}</span></label>
          <span className="text-cyan-300">central err {e2(hh).toExponential(1)}</span>
          <span className="text-amber-300">forward err {e1(hh).toExponential(1)}</span>
        </div>
      </div>
    </div>
  );
};

const StencilsCard = () => (
  <Card id="stencils" icon={Grid2x2} title="Finite differences: the Laplacian as a stencil" accent="cyan" index={12}
        subtitle="Snap space to a grid and the Laplacian becomes a plus-sign you slide around">
    <p>
      A derivative is a limit of differences — so on a grid, stop taking the limit. The second derivative is
      {' '}<Eq>{'(\\text{left}+\\text{right}-2\\,\\text{me})/\\Delta x^2'}</Eq>, and the 2D five-point “plus sign” <em>is</em> the discrete
      {' '}<CrossLink to="laplacian" recap="Δu = neighbor-average − you.">Laplacian</CrossLink>. Every PDE then collapses to one of two shapes: a big
      sparse matrix to solve (elliptic) or a march-forward update rule (heat, wave).
    </p>
    <Block>{'\\uu{u}_{xx}\\approx\\dfrac{\\uu{u}_{i+1}-2\\uu{u}_i+\\uu{u}_{i-1}}{\\Delta x^2} \\qquad \\lap{\\Delta\\uu{u}}\\approx\\dfrac{\\uu{u}_E+\\uu{u}_W+\\uu{u}_N+\\uu{u}_S-4\\uu{u}_{ij}}{\\Delta x^2} \\qquad \\text{err}=\\mathcal{O}(\\Delta x^2)'}</Block>
    <StencilSparsity />
    <MinSchema>The 5-point stencil is the discrete Laplacian; assembling it over a grid gives a sparse, banded matrix. Central differences are second-order accurate — error ∝ Δx².</MinSchema>
    <Predict question="Halve Δx for the central second difference. The error drops by a factor of…">
      <strong>About 4 — not 2.</strong> The centered stencil is <em>second-order</em>: error <Eq>{'\\sim\\Delta x^2'}</Eq>, so halving Δx quarters
      the error (drag the slider — the cyan curve has slope 2 on the log–log plot). A one-sided forward difference is only
      first-order (slope 1, halving merely halves) because the symmetric stencil cancels the leading odd-order term.
    </Predict>
    <Misconception
      wrong="A finer grid is always strictly better — just crank the resolution."
      right="Accuracy improves as Δx², but for explicit time-stepping the stable timestep secretly tightens too: halving Δx forces the heat equation's Δt to drop by 4× (next card). Accuracy and stability are governed by different quantities."
      because="Accuracy is set by Δx² (truncation); stability is set by r = DΔt/Δx² — refining space without refining time crosses the stability ceiling." />
    <Deeper>
      <p>
        <strong>Why second order.</strong> Taylor-expanding <Eq>{'\\uu{u}_{i\\pm1}'}</Eq> and adding, the first-derivative terms cancel and you
        are left with <Eq>{'\\uu{u}_{xx}+\\tfrac{\\Delta x^2}{12}\\uu{u}_{xxxx}+\\dots'}</Eq>; the leading error is <Eq>{'\\mathcal{O}(\\Delta x^2)'}</Eq>. A forward
        difference keeps an <Eq>{'\\mathcal{O}(\\Delta x)'}</Eq> term that acts like artificial diffusion — the seed of upwind schemes
        ({' '}<CrossLink to="characteristics" recap="Upwind differencing adds numerical diffusion but is stable.">characteristics</CrossLink>).
      </p>
      <p>
        <strong>The assembled operator.</strong> On an <Eq>{'N\\times N'}</Eq> grid the Laplacian is an <Eq>{'N^2\\times N^2'}</Eq> sparse, symmetric,
        negative-definite matrix — pentadiagonal with bands at offsets <Eq>{'0,\\pm1,\\pm N'}</Eq>. Its discrete eigenvalues are
        {' '}<Eq>{'-\\tfrac{4}{\\Delta x^2}\\sin^2(\\tfrac{k\\Delta x}{2})'}</Eq>, which directly set the stability limit of explicit schemes
        ({' '}<CrossLink to="cfl" recap="Plug the discrete eigenvalue into the scheme; demand |g| ≤ 1.">cfl</CrossLink>). Boundary rows (Dirichlet vs Neumann) are where most bugs hide.
      </p>
    </Deeper>
  </Card>
);
const CflDemo = () => {
  const N = 128;
  const [mode, setMode] = useState('heat');
  const [r, setR] = useState(0.4);
  const [C, setC] = useState(0.8);
  const [playing, setPlaying] = useState(true);
  const hu = useRef(null), hs = useRef(null), wp = useRef(null), wc = useRef(null), ws = useRef(null);
  const [tick, setTick] = useState(0);
  const seedHeat = () => { const a = new Float64Array(N); for (let i = 0; i < N; i++) { const x = i / (N - 1); a[i] = Math.exp(-(((x - 0.5) / 0.08) ** 2)) + 1e-3 * (i % 2 ? -1 : 1); } a[0] = 0; a[N - 1] = 0; return a; };
  const seedWave = () => { const u0 = new Float64Array(N); for (let i = 0; i < N; i++) { const x = i / (N - 1); u0[i] = Math.exp(-(((x - 0.5) / 0.06) ** 2)); } u0[0] = 0; u0[N - 1] = 0; const u1 = new Float64Array(N), C2 = C * C; for (let i = 1; i < N - 1; i++) u1[i] = u0[i] + 0.5 * C2 * (u0[i + 1] - 2 * u0[i] + u0[i - 1]); return [u0, u1]; };
  if (!hu.current) { hu.current = seedHeat(); hs.current = new Float64Array(N); const [a, b] = seedWave(); wp.current = a; wc.current = b; ws.current = new Float64Array(N); }
  useEffect(() => { const [a, b] = seedWave(); wp.current = a; wc.current = b; /* eslint-disable-next-line */ }, [C]);
  const clampArr = (u) => { for (let i = 0; i < N; i++) { const v = u[i]; u[i] = v !== v ? 0 : v > 10 ? 10 : v < -10 ? -10 : v; } };

  useRaf(playing, () => {
    if (mode === 'heat') {
      let u = hu.current, w = hs.current;
      for (let s = 0; s < 4; s++) { for (let i = 1; i < N - 1; i++) w[i] = u[i] + r * (u[i + 1] - 2 * u[i] + u[i - 1]); w[0] = 0; w[N - 1] = 0; const t = u; u = w; w = t; }
      clampArr(u); hu.current = u; hs.current = w;
      let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(u[i])); if (mx < 0.05) hu.current = seedHeat();
    } else {
      let p = wp.current, c = wc.current, n = ws.current, C2 = C * C;
      for (let s = 0; s < 4; s++) { for (let i = 1; i < N - 1; i++) n[i] = 2 * c[i] - p[i] + C2 * (c[i + 1] - 2 * c[i] + c[i - 1]); n[0] = 0; n[N - 1] = 0; const t = p; p = c; c = n; n = t; }
      clampArr(c); wp.current = p; wc.current = c; ws.current = n;
    }
    setTick((t) => (t + 1) % 1e9);
  });

  const gmin = 1 - 4 * r;
  const stable = mode === 'heat' ? r <= 0.5 : C <= 1;
  const gk = useMemo(() => { const a = []; for (let i = 0; i <= 100; i++) { const k = (i / 100) * Math.PI; a.push([k, 1 - 4 * r * Math.sin(k / 2) ** 2]); } return a; }, [r]);

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
        <div className="inline-flex rounded border border-white/15 overflow-hidden">
          {[['heat', 'heat · r ≤ ½'], ['wave', 'wave · C ≤ 1']].map(([k, l]) => <button key={k} onClick={() => setMode(k)} className={`px-2 py-0.5 ${mode === k ? 'bg-rose-500/20 text-rose-100' : 'text-neutral-400'}`}>{l}</button>)}
        </div>
        {mode === 'heat'
          ? <label className="flex items-center gap-1.5 text-neutral-400">r<input type="range" min="0.1" max="0.75" step="0.01" value={r} onChange={(e) => setR(parseFloat(e.target.value))} className="pde-range w-28" /><span className={r > 0.5 ? 'text-rose-300' : 'text-emerald-300'}>{r.toFixed(2)}</span></label>
          : <label className="flex items-center gap-1.5 text-neutral-400">C<input type="range" min="0.5" max="1.15" step="0.01" value={C} onChange={(e) => setC(parseFloat(e.target.value))} className="pde-range w-28" /><span className={C > 1 ? 'text-rose-300' : 'text-emerald-300'}>{C.toFixed(2)}</span></label>}
        <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
        <span className={`px-2 py-0.5 rounded font-semibold ${stable ? 'text-emerald-300 bg-emerald-400/10' : 'text-rose-300 bg-rose-400/10'}`}>{stable ? 'STABLE' : 'UNSTABLE — exploding'}</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{mode === 'heat' ? 'live heat sim · below r = ½ it relaxes; above, the checkerboard erupts' : 'live wave sim · stable at C ≤ 1, explodes the instant C > 1'}</div>
        <Field1D u={mode === 'heat' ? hu.current : wc.current} yRange={[-1.5, 1.5]} accent={stable ? '#7dd3fc' : '#fb7185'} height={120} fill={false} />
      </div>
      {mode === 'heat' && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">growth factor g(k) = 1 − 4r sin²(kΔx/2) · the checkerboard (kΔx = π) breaks first</div>
          <MultiLinePlot width={360} height={180} series={[{ pts: gk, color: gmin < -1 ? '#fb7185' : '#7dd3fc', width: 2, label: 'g(k)' }]}
            xRange={[0, Math.PI]} yRange={[-3, 1.3]} xLabel="k Δx" yLabel="g" yTicks={[-3, -1, 1]}
            hlines={[{ at: 1, color: '#6ee7b7', label: '+1' }, { at: -1, color: '#fb7185', label: '−1 (stability edge)' }]}
            dots={[{ x: Math.PI, y: gmin, color: gmin < -1 ? '#fb7185' : '#7dd3fc', r: 4 }]} />
          <div className="text-[11px] font-mono mt-1">worst mode g(π) = 1 − 4r = <span className={gmin < -1 ? 'text-rose-300' : 'text-emerald-300'}>{gmin.toFixed(2)}</span> {gmin < -1 ? '→ |g| > 1, amplifies & flips each step' : '→ |g| ≤ 1, bounded'}</div>
        </div>
      )}
    </div>
  );
};

const CflCard = () => (
  <Card id="cfl" icon={Gauge} title="Stability & the CFL condition" accent="rose" index={13} anchor
        subtitle="Why your simulation exploded: explicit schemes have a speed limit, and a Fourier mode breaks first">
    <p>
      An explicit step is a gamble — guess the future from present neighbors. Step too boldly and one Fourier mode’s error
      self-multiplies into a screaming checkerboard. The test is exact: plug <Eq>{'e^{i\\kx{k}x}'}</Eq> into the scheme, read off the
      per-step growth <Eq>{'g'}</Eq>, and demand <Eq>{'|g|\\le1'}</Eq> for <em>every</em> mode. For heat the worst offender is the checkerboard
      {' '}<Eq>{'(\\kx{k}\\Delta x=\\pi)'}</Eq>, so the whole sim lives or dies on <Eq>{'r=D\\Delta t/\\Delta x^2\\le\\tfrac12'}</Eq>.
    </p>
    <Block>{'r=\\dfrac{D\\,\\Delta t}{\\Delta x^2}\\le\\tfrac12\\ \\text{(heat)} \\qquad g(\\kx{k})=1-4r\\sin^2\\!\\big(\\tfrac{\\kx{k}\\Delta x}{2}\\big) \\qquad \\wv{C}=\\dfrac{\\wv{c}\\,\\Delta t}{\\Delta x}\\le1\\ \\text{(wave)}'}</Block>
    <CflDemo />
    <MinSchema>von Neumann analysis = substitute a Fourier mode and require |g| ≤ 1. The shortest wavelength (the checkerboard) is the first to blow up; physically, the numerical domain of dependence must contain the real one.</MinSchema>
    <Worked title="The hidden tax of a finer grid">
      With <Eq>{'D=1,\\ \\Delta x=0.1'}</Eq>, stability needs <Eq>{'\\Delta t\\le\\tfrac12\\Delta x^2/D=0.005'}</Eq>. Push to <Eq>{'\\Delta t=0.0051'}</Eq>
      {' '}<Eq>{'(r=0.51)'}</Eq> and <Eq>{'g(\\pi)=-1.04'}</Eq> — the checkerboard grows 4% per step, ~1000× in 170 steps. Refine to
      {' '}<Eq>{'\\Delta x=0.05'}</Eq> and the limit drops to <Eq>{'\\Delta t\\le0.00125'}</Eq> — <strong>4× smaller</strong> for the same physical time.
    </Worked>
    <Predict question="When an explicit heat sim explodes, WHICH spatial mode blows up first?">
      <strong>The checkerboard</strong> — the shortest wavelength, <Eq>{'\\kx{k}\\Delta x=\\pi'}</Eq>, where <Eq>{'\\sin^2=1'}</Eq> so <Eq>{'g=1-4r'}</Eq>.
      The instant <Eq>{'r>\\tfrac12'}</Eq>, that <Eq>{'g<-1'}</Eq>: the mode amplifies <em>and</em> flips sign every step, painting the
      grid-scale checkerboard you see. Smooth low-k modes stay tame — instability is a short-wavelength disease.
    </Predict>
    <Misconception
      wrong="My simulation exploded because the timestep dt was too big in absolute terms."
      right="It's the dimensionless ratio r = DΔt/Δx², not dt alone. The very same dt is rock-stable on a coarse grid and explosive on a fine one — halve Δx and you must quarter Δt."
      because="Stability depends on how far information can move per step relative to the grid spacing — a ratio, not an absolute time." />
    <Deeper>
      <p>
        <strong>Von Neumann derivation.</strong> Substitute <Eq>{'\\uu{u}^n_j=g^n e^{i\\kx{k}j\\Delta x}'}</Eq> into FTCS to get
        {' '}<Eq>{'g=1-4r\\sin^2(\\kx{k}\\Delta x/2)'}</Eq>; <Eq>{'|g|\\le1\\ \\forall \\kx{k}\\iff r\\le\\tfrac12'}</Eq>. This is necessary <em>and</em> sufficient here
        (Lax equivalence: consistency + stability ⇔ convergence). The wave’s leapfrog gives a quadratic with roots of product 1, so
        {' '}<Eq>{'|g|=1'}</Eq> exactly when <Eq>{'\\wv{C}\\le1'}</Eq> — neutrally stable, which is why it rings instead of decaying.
      </p>
      <p>
        <strong>Escaping the <Eq>{'\\Delta x^2'}</Eq> tax.</strong> Implicit schemes (backward Euler <Eq>{'g=1/(1+4r\\sin^2)'}</Eq>, Crank–Nicolson)
        are unconditionally stable — you pay a linear solve per step but can take huge timesteps. In 2D the heat bound tightens to
        {' '}<Eq>{'r\\le\\tfrac14'}</Eq>; and <Eq>{'r=\\tfrac12'}</Eq> is undamped (it flickers), so practitioners use <Eq>{'r\\approx0.4'}</Eq>. The same
        Fourier mode that diagonalizes the PDE ({' '}<CrossLink to="fourier" recap="Δ sin kx = −k² sin kx; one ODE per mode.">fourier</CrossLink>) is the one that governs its numerical stability.
      </p>
    </Deeper>
  </Card>
);
const FemDemo = () => {
  const [view, setView] = useState('mesh');
  const [corner, setCorner] = useState(false);
  const [hoverTri, setHoverTri] = useState(-1);
  const mesh = useMemo(() => {
    const M = 5, NP = 18, rings = [[[0, 0]]], tris = [];
    for (let m = 1; m <= M; m++) { const r = m / M, pts = []; for (let a = 0; a < NP; a++) { const th = 2 * Math.PI * a / NP; pts.push([r * Math.cos(th), r * Math.sin(th)]); } rings.push(pts); }
    for (let a = 0; a < NP; a++) tris.push([[0, 0], rings[1][a], rings[1][(a + 1) % NP]]);
    for (let m = 1; m < M; m++) { const A = rings[m], B = rings[m + 1]; for (let a = 0; a < NP; a++) { const a2 = (a + 1) % NP; tris.push([A[a], B[a], B[a2]]); tris.push([A[a], B[a2], A[a2]]); } }
    return tris;
  }, []);
  const Ng = 12, fdCells = []; for (let j = 0; j < Ng; j++) for (let i = 0; i < Ng; i++) { const xc = -1 + (i + 0.5) * 2 / Ng, yc = -1 + (j + 0.5) * 2 / Ng; if (xc * xc + yc * yc < 1) fdCells.push([i, j]); }

  const Ns = useMemo(() => { const a = []; for (let i = 0; i <= 24; i++) a.push(4 * Math.pow(64 / 4, i / 24)); return a; }, []);
  const L = (v) => Math.log10(Math.max(v, 1e-12));
  const cFD = Ns.map((N) => [L(N), L(2.0 * Math.pow(N, -2))]);
  const cFEM = Ns.map((N) => [L(N), L(0.8 * Math.pow(N, -2))]);
  const cSpec = Ns.map((N) => [L(N), L(corner ? 0.8 * Math.pow(N, -1.5) : 0.05 * Math.exp(-0.30 * N))]);

  return (
    <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
      <div>
        <div className="flex items-center gap-2 mb-1 text-[11px] font-mono">
          <div className="inline-flex rounded border border-white/15 overflow-hidden">
            {[['grid', 'FD grid'], ['mesh', 'FEM mesh']].map(([k, l]) => <button key={k} onClick={() => setView(k)} className={`px-2 py-0.5 ${view === k ? 'bg-teal-500/20 text-teal-100' : 'text-neutral-400'}`}>{l}</button>)}
          </div>
        </div>
        <svg viewBox="-1.15 -1.15 2.3 2.3" className="block w-full max-w-[240px] mx-auto border border-white/10 rounded bg-black/30">
          {view === 'grid' ? <>
            {fdCells.map(([i, j], k) => <rect key={k} x={-1 + i * 2 / Ng} y={-1 + j * 2 / Ng} width={2 / Ng} height={2 / Ng} fill="#2dd4bf" opacity="0.18" stroke="#2dd4bf" strokeWidth="0.006" strokeOpacity="0.4" />)}
            <circle cx={0} cy={0} r={1} fill="none" stroke="#fb7185" strokeWidth="0.02" />
          </> : <>
            {mesh.map((t, k) => <polygon key={k} points={t.map(([x, y]) => `${x},${y}`).join(' ')} fill={k === hoverTri ? '#2dd4bf' : '#2dd4bf'} fillOpacity={k === hoverTri ? 0.4 : 0.06} stroke="#2dd4bf" strokeWidth="0.008" strokeOpacity="0.5" onMouseEnter={() => setHoverTri(k)} onMouseLeave={() => setHoverTri(-1)} />)}
            <circle cx={0} cy={0} r={1} fill="none" stroke="#6ee7b7" strokeWidth="0.014" />
          </>}
        </svg>
        <div className="text-[10px] text-neutral-500 mt-1 text-center">{view === 'grid' ? 'a square grid can only staircase the curved boundary' : 'triangles drape any shape — hover one to single it out'}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">error vs degrees of freedom · log–log</div>
        <MultiLinePlot width={360} height={210}
          series={[{ pts: cFD, color: '#67e8f9', width: 2, label: 'finite difference · N⁻²' }, { pts: cFEM, color: '#2dd4bf', width: 2, label: 'finite element · N⁻²' }, { pts: cSpec, color: '#a5b4fc', width: 2.4, label: corner ? 'spectral · N⁻¹·⁵ (kink!)' : 'spectral · e^(−αN)' }]}
          xRange={[0.55, 1.85]} yRange={[-9, 1]} xLabel="log₁₀ N" yLabel="err" yTicks={[-8, -4, 0]} />
        <label className="flex items-center gap-2 text-[11px] font-mono mt-2 text-neutral-300"><input type="checkbox" checked={corner} onChange={(e) => setCorner(e.target.checked)} /> the solution has a corner / shock</label>
        <div className="text-[10px] text-neutral-500 mt-1">{corner ? 'a corner kills smoothness — spectral collapses to algebraic, no better than FEM' : 'on smooth data spectral accuracy is exponential — it plummets off the chart'}</div>
      </div>
    </div>
  );
};

const FemCard = () => (
  <Card id="fem" icon={Triangle} title="Finite elements & spectral methods" accent="teal" index={14}
        subtitle="Two escapes from the rigid grid: tile any shape, or trade the grid for global waves">
    <p>
      Finite differences need a rectangular grid — useless for a turbine blade. <strong>Finite elements</strong> tile arbitrary
      geometry with triangles and ask the equation to hold only <em>on average</em> (the <Term def="Multiply the PDE by a test function and integrate (by parts); the equation then needs only one derivative on each of u and the test function, and Neumann conditions appear naturally.">weak form</Term>), buying geometric
      freedom. <strong>Spectral methods</strong> sprint the other way — one global Fourier/Chebyshev basis, so on smooth problems
      accuracy improves <em>exponentially</em> with the number of modes (the <CrossLink to="fourier" recap="Differentiate exactly in the Fourier basis.">Fourier card’s</CrossLink> principled extreme).
    </p>
    <Block>{'\\uu{u}(x)\\approx\\sum_j c_j\\,\\phi_j(x) \\qquad \\int\\nabla\\uu{u}\\cdot\\nabla v=\\int \\src{f}\\,v\\ \\ \\forall v \\qquad \\underbrace{e^{-\\alpha N}}_{\\text{spectral}}\\ \\text{vs}\\ \\underbrace{N^{-p}}_{\\text{FD/FEM}}'}</Block>
    <FemDemo />
    <MinSchema>FEM buys geometry (any domain, via the weak form); spectral buys accuracy (exponential — but only on smooth solutions over simple domains). FD/FEM converge algebraically (∼N⁻ᵖ).</MinSchema>
    <Predict question="Spectral methods get exponential accuracy — so why not use them for everything?">
      <strong>Because they need a SMOOTH solution on a SIMPLE domain.</strong> A corner, a shock, or a jagged boundary destroys
      smoothness, and the exponential convergence collapses to algebraic, with Gibbs oscillations on top (tick the box). Real
      geometry — fillets, holes, re-entrant corners — is exactly where FEM’s local elements win. Smoothness is the price of admission.
    </Predict>
    <Misconception
      wrong="FEM is just finite differences on triangles."
      right="FEM changes the QUESTION. FD enforces the PDE pointwise (the strong form); FEM enforces it on average against test functions (the weak form — multiply, integrate, integrate by parts). That integral form shares the derivatives between u and v, so it needs less smoothness and handles geometry and Neumann conditions gracefully."
      because="The weak form lowers the differentiability demanded of the solution — one derivative each on u and the test function — which is why FEM copes with kinks and complex boundaries." />
    <Deeper>
      <p>
        <strong>Galerkin.</strong> Expand <Eq>{'\\uu{u}=\\sum_j c_j\\phi_j'}</Eq> in <Term def="A 'hat' (tent) function equals 1 at one mesh node and falls linearly to 0 at its neighbors — the simplest finite-element basis; the hats sum to 1 everywhere (a partition of unity).">hat functions</Term>, require the residual orthogonal to every
        {' '}<Eq>{'\\phi_i'}</Eq>, and get a sparse symmetric-positive-definite stiffness system <Eq>{'K\\mathbf{c}=\\mathbf{b}'}</Eq> with
        {' '}<Eq>{'K_{ij}=\\int\\nabla\\phi_i\\cdot\\nabla\\phi_j'}</Eq> — the FEM cousin of the FD <CrossLink to="laplacian" recap="The discrete Laplacian.">Laplacian</CrossLink>. Error is
        {' '}<Eq>{'\\mathcal{O}(h^2)'}</Eq> for linear elements (Céa + Lax–Milgram).
      </p>
      <p>
        <strong>Spectral.</strong> A smooth function’s Fourier/Chebyshev coefficients decay faster than any power, so truncating at
        {' '}<Eq>{'N'}</Eq> modes gives error <Eq>{'\\sim e^{-\\alpha N}'}</Eq>. Use Fourier on periodic domains, Chebyshev on intervals (to dodge
        Runge’s phenomenon). Non-smoothness breaks the spell — the remedies are hp-FEM, spectral elements, and discontinuous
        Galerkin, which localize high-order accuracy where the solution is smooth. The unifying view: every method writes
        {' '}<Eq>{'\\uu{u}=\\sum_j c_j\\phi_j'}</Eq> — point values (FD), hats (FEM), or global modes (spectral).
      </p>
    </Deeper>
  </Card>
);
const CHAR_TONE = { parabolic: 'cyan', hyperbolic: 'sky', elliptic: 'emerald', nonlinear: 'fuchsia' };
const FAMOUS = [
  { id: 'ns', name: 'Navier–Stokes', eq: '\\uu{u}_{\\tt{t}}+(\\uu{u}\\!\\cdot\\!\\nabla)\\uu{u}=-\\nabla p+\\nu\\lap{\\Delta}\\uu{u}', models: 'every fluid — air, water, blood', char: 'nonlinear', why: 'the (u·∇)u term couples all scales — not a fixed type; a Millennium problem' },
  { id: 'sch', name: 'Schrödinger', eq: 'i\\hbar\\,\\psi_{\\tt{t}}=-\\tfrac{\\hbar^2}{2m}\\lap{\\Delta}\\psi+V\\psi', models: 'a quantum particle’s wavefunction', char: 'hyperbolic', why: 'heat with an i — diffusion in imaginary time, so it rings (unitary), never smooths' },
  { id: 'max', name: 'Maxwell → wave', eq: '\\Box\\mathbf{E}=0,\\quad \\wv{c}=1/\\sqrt{\\mu_0\\varepsilon_0}', models: 'light and all electromagnetism', char: 'hyperbolic', why: 'reduces to the wave equation for E and B — finite speed c' },
  { id: 'bs', name: 'Black–Scholes', eq: 'V_{\\tt{t}}+\\tfrac12\\sigma^2S^2V_{SS}+rSV_S-rV=0', models: 'the fair price of an option', char: 'parabolic', why: 'literally the heat equation in disguise — volatility is the diffusion constant' },
  { id: 'ein', name: 'Einstein field eqs', eq: 'G_{\\mu\\nu}=8\\pi G\\,T_{\\mu\\nu}', models: 'spacetime curvature — gravity', char: 'nonlinear', why: '10 coupled nonlinear PDEs — geometry sources itself' },
  { id: 'rd', name: 'Reaction–diffusion', eq: '\\partial_{\\tt{t}}\\uu{u}=D\\lap{\\Delta}\\uu{u}+R(\\uu{u})', models: 'patterns in chemistry & biology', char: 'nonlinear', why: 'diffusion plus a nonlinear reaction → Turing patterns' },
];

const BsMorph = () => {
  const N = 128, xr = 3, dx = 2 * xr / (N - 1);
  const A = useRef(null), B = useRef(null);
  const seed = () => { const a = new Float64Array(N); for (let i = 0; i < N; i++) { const x = -xr + i * dx; a[i] = clamp(x, 0, 3); } return a; };
  if (!A.current) { A.current = seed(); B.current = new Float64Array(N); }
  const [tick, setTick] = useState(0);
  useRaf(true, () => { let u = A.current, w = B.current; for (let s = 0; s < 2; s++) { for (let i = 1; i < N - 1; i++) w[i] = u[i] + 0.30 * (u[i + 1] - 2 * u[i] + u[i - 1]); w[0] = u[0]; w[N - 1] = u[N - 1]; const t = u; u = w; w = t; } A.current = u; B.current = w; let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(u[i] - clamp(-xr + i * dx, 0, 3))); if (mx > 1.2) A.current = seed(); setTick((t) => (t + 1) % 1e9); });
  return <Field1D u={A.current} yRange={[-0.3, 3.2]} accent="#fb923c" height={110} />;
};

const Gallery = () => {
  const [filter, setFilter] = useState(null);
  const [reveal, setReveal] = useState(false);
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
        <span className="text-neutral-500 uppercase tracking-widest">filter by character:</span>
        {Object.entries(CHAR_TONE).map(([k, tone]) => <button key={k} onClick={() => setFilter(filter === k ? null : k)} className={`px-1.5 py-0.5 rounded border ${filter === k ? chipPalette[tone] : 'border-white/10 text-neutral-500'}`}>{k}</button>)}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {FAMOUS.map((p) => {
          const tone = CHAR_TONE[p.char], dim = filter && filter !== p.char;
          return (
            <motion.div key={p.id} whileHover={{ scale: 1.02 }} className={`rounded-lg border p-3 transition-opacity ${dim ? 'opacity-30' : 'opacity-100'} ${filter === p.char ? chipPalette[tone] : 'border-white/10 bg-white/[0.02]'}`}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-[13px] font-semibold text-neutral-100">{p.name}</span>
                <Chip color={tone}>{p.char}</Chip>
              </div>
              <div className="text-[12px] overflow-x-auto py-1"><Eq>{p.eq}</Eq></div>
              <div className="text-[11px] text-neutral-400 mt-1">{p.models}</div>
              <div className="text-[10.5px] text-neutral-500 italic mt-1">{p.why}</div>
              {p.id === 'bs' && (
                <div className="mt-2">
                  <button onClick={() => setReveal((v) => !v)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/30 text-cyan-200 bg-cyan-400/10">{reveal ? 'hide the disguise' : 'reveal the disguise →'}</button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {reveal && (
        <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/[0.04] p-3">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Black–Scholes IS the heat equation</div>
          <div className="text-[12px] text-neutral-300 leading-relaxed mb-2">Substitute <Eq>{'x=\\ln(S/K)'}</Eq>, <Eq>{'\\tt{\\tau}=\\tfrac12\\sigma^2(T-t)'}</Eq>, and peel off <Eq>{'V=e^{\\alpha x+\\beta \\tt{\\tau}}\\uu{u}'}</Eq> with <Eq>{'\\alpha=-\\tfrac{k-1}{2},\\ \\beta=-\\tfrac{(k+1)^2}{4},\\ k=2r/\\sigma^2'}</Eq>. What remains is <Eq>{'\\lap{\\uu{u}_{\\tt{\\tau}}=\\uu{u}_{xx}}'}</Eq>. The jagged option payoff just <em>diffuses</em> into the smooth price curve:</div>
          <BsMorph />
          <div className="text-[10px] text-neutral-500 mt-1">a kinked payoff (max(S−K,0) in log-price) smoothing under heat — volatility σ playing the role of the diffusion constant</div>
        </div>
      )}
    </div>
  );
};

const GalleryCard = () => (
  <Card id="gallery" icon={LibraryBig} title="The famous PDEs across science" accent="violet" index={15}
        subtitle="Six great equations, sorted into the big three — and one secretly the heat equation">
    <p>
      Almost every PDE that runs science is one of the three characters in a costume. <span className="text-cyan-300">Parabolic</span> =
      relax (heat, diffusion, Black–Scholes). <span className="text-sky-300">Hyperbolic</span> = ring (waves, Maxwell, sound,
      Schrödinger). <span className="text-emerald-300">Elliptic</span> = settle (Laplace, electrostatics). The two hardest —
      Navier–Stokes and Einstein — are <span className="text-fuchsia-300">nonlinear</span>, which is exactly why they’re hard.
    </p>
    <Block>{'i\\hbar\\,\\psi_{\\tt{t}}=-\\tfrac{\\hbar^2}{2m}\\lap{\\Delta}\\psi+V\\psi \\qquad V=e^{\\alpha x+\\beta\\tt{\\tau}}\\,\\uu{u}(x,\\tt{\\tau})\\ \\Rightarrow\\ \\lap{\\uu{u}_{\\tt{\\tau}}=\\uu{u}_{xx}}'}</Block>
    <Gallery />
    <MinSchema>Sort any linear PDE by the discriminant of its top-order terms into relax / ring / settle. The famous nonlinear ones resist the classification — and that resistance is their difficulty.</MinSchema>
    <Predict question="Black–Scholes vs the heat equation: (a) unrelated, finance just borrowed notation, or (b) literally the same after a change of variables?">
      <strong>(b).</strong> Set <Eq>{'\\tt{\\tau}=\\tfrac12\\sigma^2(T-t)'}</Eq> (rescaled time-to-expiry — the <Eq>{'\\sigma^2/2'}</Eq> matters), <Eq>{'x=\\ln S'}</Eq>,
      and peel off <Eq>{'V=e^{\\alpha x+\\beta\\tt{\\tau}}\\uu{u}'}</Eq> with <Eq>{'\\alpha=-\\tfrac{k-1}{2},\\ \\beta=-\\tfrac{(k+1)^2}{4},\\ k=2r/\\sigma^2'}</Eq>. What’s left is
      {' '}<Eq>{'\\uu{u}_{\\tt{\\tau}}=\\uu{u}_{xx}'}</Eq>. An option price diffuses through log-price space; volatility plays the diffusion constant.
      Hit “reveal the disguise” to watch the payoff smooth.
    </Predict>
    <Misconception
      wrong="Schrödinger is the heat equation (both have Δ and a single time-derivative)."
      right="It is a heat/wave HYBRID: the factor of i means diffusion in IMAGINARY time. That i turns heat's real, decaying e^(−k²t) into the oscillating e^(−ik²t) of a wave — so Schrödinger conserves probability and rings, it never smooths."
      because="The Wick rotation t → it maps the heat semigroup to unitary (norm-preserving) evolution — decay becomes rotation." />
    <Deeper>
      <p>
        <strong>Maxwell → light.</strong> Taking the curl of Faraday’s and Ampère’s laws gives the vector wave equation
        {' '}<Eq>{'\\Box\\mathbf{E}=0'}</Eq> with <Eq>{'\\wv{c}=1/\\sqrt{\\mu_0\\varepsilon_0}'}</Eq> — electromagnetism is hyperbolic, and that constant is the
        speed of light. <strong>Schrödinger in imaginary time</strong> becomes the heat equation, which is exactly how
        ground states are found numerically (imaginary-time evolution projects onto the lowest mode).
      </p>
      <p>
        <strong>The honest caveat.</strong> Navier–Stokes and the Einstein equations are nonlinear and not classifiable by a fixed
        type — the big-three picture is the <em>linear</em> backbone of the subject. Their difficulty (turbulence, singularities,
        the {' '}<CrossLink to="navierstokes" recap="Does smooth 3D flow always stay smooth? Unknown.">Navier–Stokes Millennium problem</CrossLink>) is precisely the nonlinearity that the
        classification cannot see.
      </p>
    </Deeper>
  </Card>
);
const BurgersDemo = () => {
  const N = 200, x0 = -4, x1 = 6, dx = (x1 - x0) / (N - 1);
  const xOf = (i) => x0 + i * dx;
  const u0fn = (x) => Math.exp(-x * x / 2);
  const [nu, setNu] = useState(0);
  const [playing, setPlaying] = useState(true);
  const u = useRef(null), scr = useRef(null), tR = useRef(0);
  const [tick, setTick] = useState(0);
  const init = () => { const a = new Float64Array(N); for (let i = 0; i < N; i++) a[i] = u0fn(xOf(i)); u.current = a; scr.current = new Float64Array(N); tR.current = 0; };
  if (!u.current) init();
  const tStar = 1.649;
  useRaf(playing, () => {
    let mx = 1e-6; const a0 = u.current; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(a0[i]));
    let dt = 0.4 * dx / mx; if (nu > 0) dt = Math.min(dt, 0.24 * dx * dx / nu);
    const SUB = 4;
    for (let s = 0; s < SUB; s++) {
      const cur = u.current, w = scr.current; const fp = (v) => v > 0 ? 0.5 * v * v : 0, fm = (v) => v < 0 ? 0.5 * v * v : 0;
      for (let i = 0; i < N; i++) { const ip = Math.min(N - 1, i + 1), im = Math.max(0, i - 1); const Fr = fp(cur[i]) + fm(cur[ip]), Fl = fp(cur[im]) + fm(cur[i]); w[i] = cur[i] - (dt / dx) * (Fr - Fl) + (nu * dt / (dx * dx)) * (cur[ip] - 2 * cur[i] + cur[im]); }
      w[0] = w[1]; w[N - 1] = w[N - 2]; u.current = w; scr.current = cur; tR.current += dt;
    }
    if (tR.current > 3.4) init();
    setTick((t) => (t + 1) % 1e9);
  });

  const PW = 360, PH = 130, pad = 14, Tmax = 3.4;
  const px = (x) => pad + (x - x0) / (x1 - x0) * (PW - 2 * pad);
  const py = (t) => PH - pad - (t / Tmax) * (PH - 2 * pad);
  const lines = Array.from({ length: 29 }, (_, k) => { const xf = x0 + (k / 28) * (x1 - x0); return { xf, h: u0fn(xf) }; });

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
        <label className="flex items-center gap-1.5 text-neutral-400">viscosity ν<input type="range" min="0" max="0.04" step="0.002" value={nu} onChange={(e) => setNu(parseFloat(e.target.value))} className="pde-range w-24" /><span className={nu > 0 ? 'text-emerald-300' : 'text-rose-300'}>{nu.toFixed(3)}</span></label>
        <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
        <button onClick={init} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
        <span className="text-neutral-500">t ≈ {(tR.current).toFixed(2)} · shock at t* ≈ 1.65</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{nu > 0 ? 'with viscosity, the front is a smooth travelling wall' : 'the front leans, steepens, and snaps vertical — a shock from smooth data'}</div>
        <Field1D u={u.current} yRange={[-0.12, 1.12]} accent={nu > 0 ? '#6ee7b7' : '#fb7185'} height={120} />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">characteristics x = x₀ + u₀(x₀) t · taller points move faster, so they cross</div>
        <svg width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`} className="block w-full">
          <line x1={pad} y1={PH - pad} x2={PW - pad} y2={PH - pad} stroke="rgba(255,255,255,0.18)" />
          {lines.map((ln, i) => { const x2 = ln.xf + ln.h * Tmax; return <line key={i} x1={px(ln.xf)} y1={py(0)} x2={px(clamp(x2, x0, x1))} y2={py(x2 > x1 ? (x1 - ln.xf) / ln.h : Tmax)} stroke={`hsl(${200 - ln.h * 200}, 75%, 62%)`} strokeWidth="1" opacity="0.8" />; })}
          <line x1={pad} y1={py(tStar)} x2={PW - pad} y2={py(tStar)} stroke="#f0abfc" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PW - pad} y={py(tStar) - 3} fontSize="9" textAnchor="end" fill="#f0abfc" fontFamily="ui-monospace, monospace">t* ≈ 1.65 · first crossing</text>
          <text x={pad} y={12} fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">t ↑</text>
        </svg>
      </div>
    </div>
  );
};

const BurgersCard = () => (
  <Card id="burgers" icon={Mountain} title="Nonlinear waves & shocks" accent="rose" index={16}
        subtitle="When a wave’s speed is its own height, smooth data crashes into a wall in finite time">
    <p>
      The linear wave equation moves every point at the same speed. Burgers breaks that rule: each point travels at speed equal
      to its own height <Eq>{'\\uu{u}'}</Eq>. Tall outruns short, the crest leans forward, <CrossLink to="characteristics" recap="Curves along which u is constant; they cross when speed depends on u.">characteristics</CrossLink>
      {' '}cross, and the slope goes vertical — a <Term>shock</Term> born from perfectly smooth data at a finite time
      {' '}<Eq>{'t^\\star=-1/\\min \\uu{u}_0\''}</Eq>. Add viscosity and the wall becomes a thin smooth front.
    </p>
    <Block>{'\\lap{\\uu{u}_{\\tt{t}}+\\uu{u}\\,\\uu{u}_{\\kx{x}}=0} \\qquad x=x_0+\\uu{u}_0(x_0)\\,\\tt{t} \\qquad t^\\star=\\dfrac{-1}{\\min_x \\uu{u}_0\'(x)}'}</Block>
    <BurgersDemo />
    <MinSchema>Solution-dependent speed makes characteristics cross in finite time — a shock from smooth data. Viscosity (or the vanishing-viscosity entropy condition) selects the physical, admissible discontinuity.</MinSchema>
    <Predict question="Start Burgers with a perfectly smooth Gaussian hump. Can it stay smooth forever?">
      <strong>No.</strong> Each point moves at <Eq>{'\\uu{u}'}</Eq>, so the taller back overtakes the shorter front; the profile
      self-steepens; at <Eq>{'t^\\star=-1/\\min \\uu{u}_0\'\\approx 1.65'}</Eq> the slope goes infinite and a shock forms — a discontinuity from
      flawless smooth data, in finite time. Linear equations <em>never</em> do this. The trailing face spreads into a rarefaction fan.
    </Predict>
    <Misconception
      wrong="Viscosity is a numerical fudge; the 'real' inviscid shock is a true discontinuity."
      right="The viscous solution is the physically correct one; the inviscid shock is its vanishing-viscosity (ν → 0) limit. Viscosity selects the admissible weak solution and pins the shock speed s = (u_L + u_R)/2."
      because="The weak form alone admits many discontinuous solutions; the entropy condition (u_L > u_R), enforced by vanishing viscosity, picks the one nature uses." />
    <Deeper>
      <p>
        <strong>Breaking time.</strong> Characteristics are straight, <Eq>{'x=x_0+\\uu{u}_0(x_0)\\,\\tt{t}'}</Eq>, with launch-dependent slope;
        the first crossing is at <Eq>{'t^\\star=-1/\\min \\uu{u}_0\\,\'(x)'}</Eq>. For the Gaussian <Eq>{'\\uu{u}_0=e^{-x^2/2}'}</Eq> the steepest descent
        is <Eq>{'\\min \\uu{u}_0\'=-e^{-1/2}\\approx-0.607'}</Eq> at <Eq>{'x=1'}</Eq>, so <Eq>{'t^\\star=\\sqrt{e}\\approx1.649'}</Eq>. After that, the weak shock
        obeys <Term>Rankine-Hugoniot</Term> <Eq>{'s=(\\uu{u}_L+\\uu{u}_R)/2'}</Eq> and the Lax entropy condition.
      </p>
      <p>
        <strong>Cole–Hopf — back to heat.</strong> The substitution <Eq>{'\\uu{u}=-2\\nu\\,\\phi_{\\kx{x}}/\\phi'}</Eq> turns viscous Burgers into the
        plain heat equation for <Eq>{'\\phi'}</Eq> — the one nonlinear PDE that linearizes exactly (a callback to <CrossLink to="heat" recap="The linear, exactly-solvable heat equation.">heat</CrossLink>). Solitons
        (KdV) balance this nonlinear steepening against dispersion to make shape-preserving travelling lumps. Numerically you need
        an upwind/Godunov flux in conservation form to get the shock <em>speed</em> right; CFL is necessary but not sufficient.
        This same self-advection, in 2D/3D, is the engine of <CrossLink to="navierstokes" recap="(u·∇)u coupling a continuum of scales = turbulence.">turbulence</CrossLink>.
      </p>
    </Deeper>
  </Card>
);
// --- small radix-2 FFT (for the pseudo-spectral vorticity solver) -----------
function fft1(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ar = re[i + k], ai = im[i + k]; const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ar + br; im[i + k] = ai + bi; re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi; const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr; } }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function fft2(re, im, N, inv) {
  const tr = new Float64Array(N), ti = new Float64Array(N);
  for (let r = 0; r < N; r++) { const o = r * N; for (let i = 0; i < N; i++) { tr[i] = re[o + i]; ti[i] = im[o + i]; } fft1(tr, ti, inv); for (let i = 0; i < N; i++) { re[o + i] = tr[i]; im[o + i] = ti[i]; } }
  for (let c = 0; c < N; c++) { for (let i = 0; i < N; i++) { tr[i] = re[i * N + c]; ti[i] = im[i * N + c]; } fft1(tr, ti, inv); for (let i = 0; i < N; i++) { re[i * N + c] = tr[i]; im[i * N + c] = ti[i]; } }
}

const NavierStokes = () => {
  const N = 64, NN = N * N, h = 2 * Math.PI / N, dt = 0.02, nuHyper = 2e-4;
  const KX = useMemo(() => { const a = new Float64Array(N); for (let i = 0; i < N; i++) a[i] = i <= N / 2 ? i : i - N; return a; }, []);
  const [nu, setNu] = useState(1e-3);
  const [playing, setPlaying] = useState(true);
  const om = useRef(null), reR = useRef(null), imR = useRef(null), uR = useRef(null), vR = useRef(null);
  const spec = useRef(new Float64Array(26));
  const [tick, setTick] = useState(0);
  const seedRef = useRef(5);
  const seed = () => {
    const a = new Float64Array(NN); const rnd = mulberry32(seedRef.current);
    for (let b = 0; b < 6; b++) { const cx = rnd() * N, cy = rnd() * N, s = (rnd() < 0.5 ? -1 : 1) * (2 + rnd() * 3), r2 = 6 + rnd() * 8; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let dxp = x - cx; let dyp = y - cy; dxp = ((dxp + N / 2 + N) % N) - N / 2; dyp = ((dyp + N / 2 + N) % N) - N / 2; a[y * N + x] += s * Math.exp(-(dxp * dxp + dyp * dyp) / (2 * r2)); } }
    om.current = a;
  };
  if (!om.current) { seed(); reR.current = new Float64Array(NN); imR.current = new Float64Array(NN); uR.current = new Float64Array(NN); vR.current = new Float64Array(NN); }
  const stir = () => { seedRef.current = (seedRef.current * 1103515245 + 12345) >>> 0; seed(); spec.current.fill(0); setTick((t) => t + 1); };

  const bil = (f, xb, yb) => { xb = ((xb % N) + N) % N; yb = ((yb % N) + N) % N; const i0 = Math.floor(xb), j0 = Math.floor(yb), i1 = (i0 + 1) % N, j1 = (j0 + 1) % N, fx = xb - i0, fy = yb - j0; return f[j0 * N + i0] * (1 - fx) * (1 - fy) + f[j0 * N + i1] * fx * (1 - fy) + f[j1 * N + i0] * (1 - fx) * fy + f[j1 * N + i1] * fx * fy; };

  useRaf(playing, () => {
    const o = om.current, re = reR.current, im = imR.current, u = uR.current, v = vR.current;
    re.set(o); im.fill(0); fft2(re, im, N, false); // ω̂
    // velocity from streamfunction, plus accumulate energy spectrum
    const sh = new Float64Array(26), cnt = new Float64Array(26);
    const ur = re.slice(), ui = im.slice(); // reuse for û
    for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) {
      const i = b * N + a, kx = KX[a], ky = KX[b], k2 = kx * kx + ky * ky || 1e9; const km = Math.sqrt(kx * kx + ky * ky);
      const pr = re[i] / k2, pi = im[i] / k2; // ψ̂
      // û = i ky ψ̂ ; v̂ = −i kx ψ̂  (store û in (ur,ui), v̂ in (re,im) temporarily? use separate)
      ur[i] = -ky * pi; ui[i] = ky * pr; // û
      re[i] = kx * pi; im[i] = -kx * pr; // v̂ (overwrite ω̂ — already used)
      const kb = Math.round(km); if (kb >= 1 && kb <= 25) { sh[kb] += (re[i] * re[i] + im[i] * im[i] + ur[i] * ur[i] + ui[i] * ui[i]); cnt[kb]++; }
    }
    fft2(ur, ui, N, true); for (let i = 0; i < NN; i++) u[i] = ur[i];
    fft2(re, im, N, true); for (let i = 0; i < NN; i++) v[i] = re[i];
    // semi-Lagrangian advection
    const on = new Float64Array(NN);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; on[i] = bil(o, x - u[i] * dt / h, y - v[i] * dt / h); }
    // spectral dissipation
    re.set(on); im.fill(0); fft2(re, im, N, false);
    for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) { const i = b * N + a, kx = KX[a], ky = KX[b], k2 = kx * kx + ky * ky; const damp = Math.exp(-(nu * k2 + nuHyper * k2 * k2) * dt); re[i] *= damp; im[i] *= damp; }
    fft2(re, im, N, true);
    let bad = false; for (let i = 0; i < NN; i++) { const val = re[i]; if (val !== val || Math.abs(val) > 1e3) { bad = true; break; } om.current[i] = val; }
    if (bad) seed();
    // EMA spectrum
    for (let k = 1; k <= 25; k++) { const e = cnt[k] > 0 ? sh[k] / cnt[k] : 0; spec.current[k] = 0.92 * spec.current[k] + 0.08 * e; }
    setTick((t) => (t + 1) % 1e9);
  });

  // live spectrum (log-log)
  const L = (v) => Math.log10(Math.max(v, 1e-9));
  const liveSpec = useMemo(() => { const pts = []; for (let k = 2; k <= 22; k++) if (spec.current[k] > 0) pts.push([L(k), L(spec.current[k])]); return pts; }, [tick]);
  // idealized reference slopes (schematic — NOT a fit)
  const refK = [[L(2), 0], [L(20), -5 / 3 * (L(20) - L(2))]];
  const refE = [[L(2), -0.4], [L(20), -0.4 - 3 * (L(20) - L(2))]];
  const DISP = 240;
  const onPaint = (e) => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); const cx = (e.clientX - r.left) / r.width * N, cy = (e.clientY - r.top) / r.height * N; const o = om.current; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let dxp = ((x - cx + N / 2 + N) % N) - N / 2, dyp = ((y - cy + N / 2 + N) % N) - N / 2; o[y * N + x] += 3 * Math.exp(-(dxp * dxp + dyp * dyp) / 18); } };

  return (
    <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">vorticity ω · cyan = clockwise, orange = counter · drag to stir</div>
        <div className="rounded-lg overflow-hidden border border-white/10 cursor-crosshair" style={{ width: '100%', maxWidth: DISP }} onMouseMove={onPaint}>
          <Heatmap2D field={om.current} nx={N} ny={N} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[-4, 4]} smooth tick={tick} style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono mt-2">
          <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
          <button onClick={stir} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">stir (reseed)</button>
          <label className="flex items-center gap-1 text-neutral-400">Re ∝ 1/ν<input type="range" min="0.0002" max="0.004" step="0.0002" value={nu} onChange={(e) => setNu(parseFloat(e.target.value))} className="pde-range w-20" /></label>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">measured E(k) · 64² grid — too few decades for a clean slope</div>
          <MultiLinePlot width={340} height={150} series={[{ pts: liveSpec, color: '#67e8f9', width: 2, label: 'live spectrum' }]} xRange={[0.2, 1.4]} yRange={[-7, 1]} xLabel="log₁₀ k" yLabel="E" yTicks={[-6, -3, 0]} legend={false} />
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">idealized cascade (schematic, not a fit)</div>
          <MultiLinePlot width={340} height={110} series={[{ pts: refK, color: '#a5b4fc', width: 2, dash: '5 3', label: 'k⁻⁵ᐟ³ · 3D energy' }, { pts: refE, color: '#fb7185', width: 2, dash: '5 3', label: 'k⁻³ · 2D enstrophy' }]} xRange={[0.2, 1.4]} yRange={[-6, 0.6]} xLabel="log₁₀ k" yLabel="E" yTicks={[-4, 0]} />
        </div>
      </div>
    </div>
  );
};

const NavierStokesCard = () => (
  <Card id="navierstokes" icon={Wind} title="Turbulence & Navier–Stokes" accent="cyan" index={17}
        subtitle="The same nonlinear advection that broke Burgers, now coupling a continuum of scales">
    <p>
      Navier–Stokes is <Eq>{'F=ma'}</Eq> for a fluid parcel, plus pressure and viscosity. The villain is the same self-advection
      {' '}<Eq>{'(\\uu{u}\\!\\cdot\\!\\nabla)\\uu{u}'}</Eq> that steepened <CrossLink to="burgers" recap="A wave whose speed is its own height crashes into a shock.">Burgers</CrossLink> — now in 2D/3D, coupling every
      scale. Stir at large scales and the nonlinearity shreds big eddies into smaller ones (an energy cascade) until viscosity
      finally turns motion into heat. Whether smooth 3D solutions can ever blow up in finite time is unknown — a Millennium Prize problem.
    </p>
    <Block>{'\\uu{u}_{\\tt{t}}+(\\uu{u}\\!\\cdot\\!\\nabla)\\uu{u}=-\\nabla p+\\nu\\,\\lap{\\Delta}\\uu{u},\\quad \\nabla\\!\\cdot\\!\\uu{u}=0 \\qquad E(\\kx{k})\\sim\\varepsilon^{2/3}\\kx{k}^{-5/3}'}</Block>
    <NavierStokes />
    <MinSchema>The nonlinear advection term cascades energy across scales; viscosity dissipates it at the smallest. The idealized inertial-range slope is k⁻⁵ᐟ³ (3D) — but a tiny grid can’t show it, so the demo keeps the live spectrum and the textbook slope honestly separate.</MinSchema>
    <Predict question="Stir a 2D fluid hard at one big scale, then stop. Where does the injected energy go before viscosity eats it?">
      <strong>It cascades</strong> — <Eq>{'(\\uu{u}\\!\\cdot\\!\\nabla)\\uu{u}'}</Eq> splits each eddy into smaller eddies through an inertial range with
      little loss, until viscosity dissipates the smallest. The idealized 3D signature is <Eq>{'E(\\kx{k})\\sim \\kx{k}^{-5/3}'}</Eq>. <em>But</em> pure 2D
      turbulence is different: it inverse-cascades energy to <em>large</em> scales and enstrophy to small (<Eq>{'\\kx{k}^{-3}'}</Eq>). The demo’s 64²
      grid is a faithful toy — it shows roll-up and filamentation, but has too few decades for a clean power law, so the slopes
      are drawn separately and labelled, never fitted to the live curve.
    </Predict>
    <Misconception
      wrong="Turbulence is just randomness — noise in the flow."
      right="It is fully deterministic (no random term) yet statistically structured: a clean power law over the inertial range, with coherent vortices forming and stretching. It only looks random because a continuum of scales interacts chaotically."
      because="‘Chaotic’ and ‘robust statistics’ coexist — like a chaotic coin-flip path that still obeys P(heads)=½." />
    <Deeper>
      <p>
        <strong>What the solver does.</strong> In the vorticity–streamfunction form, <Eq>{'\\omega=\\nabla\\times\\uu{u}'}</Eq> is advected and
        the pressure drops out: incompressibility makes pressure a Lagrange multiplier solved by a <CrossLink to="laplace" recap="Δp = source: an elliptic solve every step.">Poisson equation</CrossLink>
        {' '}(here <Eq>{'\\hat\\psi=\\hat\\omega/|\\kx{k}|^2'}</Eq>, done in Fourier space). <Term def="The ratio of inertial to viscous forces, Re = UL/ν; high Re means turbulence.">Reynolds number</Term> <Eq>{'\\text{Re}=UL/\\nu'}</Eq> sets how
        turbulent it gets. Kolmogorov’s 1941 dimensional argument gives <Eq>{'E=C\\varepsilon^{2/3}\\kx{k}^{-5/3}'}</Eq> for the 3D forward cascade.
      </p>
      <p>
        <strong>The open problem.</strong> In 3D, vortex stretching can intensify gradients without obvious bound; whether that ever
        produces a finite-time singularity from smooth data is the <Term>Navier-Stokes</Term> regularity problem (Beale–Kato–Majda controls
        it via the vorticity). In 2D there is no vortex stretching, so 2D flow is provably regular — 3D remains open. A faithful
        simulation needs <Eq>{'\\sim\\text{Re}^{9/4}'}</Eq> grid points, so the 64² toy here is qualitative, not quantitative.
      </p>
    </Deeper>
  </Card>
);
// marching squares for the zero level-set (nodal lines), grid g(i,j) on NS×NS, coords in [0,1]
function marchingSquares(g, NS) {
  const segs = [], frac = (a, b) => a / (a - b);
  for (let j = 0; j < NS - 1; j++) for (let i = 0; i < NS - 1; i++) {
    const a = g(i, j), b = g(i + 1, j), c = g(i + 1, j + 1), d = g(i, j + 1);
    let idx = 0; if (a > 0) idx |= 1; if (b > 0) idx |= 2; if (c > 0) idx |= 4; if (d > 0) idx |= 8;
    const top = [i + frac(a, b), j], right = [i + 1, j + frac(b, c)], bot = [i + frac(d, c), j + 1], left = [i, j + frac(a, d)];
    const s = (p, q) => segs.push([p[0] / (NS - 1), p[1] / (NS - 1), q[0] / (NS - 1), q[1] / (NS - 1)]);
    switch (idx) { case 1: case 14: s(left, top); break; case 2: case 13: s(top, right); break; case 3: case 12: s(left, right); break; case 4: case 11: s(right, bot); break; case 5: s(left, top); s(right, bot); break; case 6: case 9: s(top, bot); break; case 7: case 8: s(left, bot); break; case 10: s(top, right); s(left, bot); break; }
  }
  return segs;
}
const ISO_SPEC = [2, 5, 5, 8, 10, 10, 13, 13, 17];

const DrumDemo = () => {
  const [m, setM] = useState(3), [n, setN] = useState(2), [mix, setMix] = useState(false), [c, setC] = useState(0.6);
  const NF = 100, NS = 56;
  const uAt = (x, y) => mix ? Math.cos(c) * Math.sin(x) * Math.sin(7 * y) + Math.sin(c) * Math.sin(5 * x) * Math.sin(5 * y) : Math.sin(m * x) * Math.sin(n * y);
  const field = useMemo(() => { const f = new Float64Array(NF * NF); for (let j = 0; j < NF; j++) for (let i = 0; i < NF; i++) f[j * NF + i] = uAt(i / (NF - 1) * Math.PI, j / (NF - 1) * Math.PI); return f; }, [m, n, mix, c]);
  const nodals = useMemo(() => marchingSquares((i, j) => uAt(i / (NS - 1) * Math.PI, j / (NS - 1) * Math.PI), NS), [m, n, mix, c]);
  const cells = []; for (let nn = 1; nn <= 6; nn++) for (let mm = 1; mm <= 6; mm++) cells.push({ m: mm, n: nn, lam: mm * mm + nn * nn });
  const lamCount = {}; cells.forEach((cc) => lamCount[cc.lam] = (lamCount[cc.lam] || 0) + 1);
  const lam = mix ? 50 : m * m + n * n;
  const DISP = 230;
  return (
    <div className="mt-3 space-y-3">
      <div className="grid md:grid-cols-[230px_1fr] gap-4 items-start">
        <div>
          <div className="relative rounded-lg overflow-hidden border border-white/10" style={{ width: '100%', maxWidth: DISP }}>
            <Heatmap2D field={field} nx={NF} ny={NF} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[-1, 1]} smooth style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
            <svg viewBox="0 0 1 1" className="absolute inset-0 w-full h-full pointer-events-none">
              {nodals.map((s, i) => <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke="rgba(255,255,255,0.85)" strokeWidth="0.006" />)}
            </svg>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-1">{mix ? <>mixed λ = 50 · c = {c.toFixed(2)}</> : <>mode ({m},{n}) · λ = {lam} · ω = √{lam} = {Math.sqrt(lam).toFixed(2)}</>}</div>
          <div className="text-[10px] text-neutral-500">white = nodal lines (where the drum doesn’t move — the sand)</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">pick a mode (m, n) · the number is λ = m² + n²</div>
          <div className="grid grid-cols-6 gap-1" style={{ maxWidth: 250 }}>
            {cells.map((cc) => { const sel = !mix && cc.m === m && cc.n === n, deg = lamCount[cc.lam] > 1; return <button key={`${cc.m}-${cc.n}`} onClick={() => { setMix(false); setM(cc.m); setN(cc.n); }} className={`text-[9px] font-mono rounded py-1 border ${sel ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-100' : deg ? 'border-fuchsia-400/25 text-fuchsia-300/80 bg-fuchsia-400/5' : 'border-white/10 text-neutral-400'}`}>{cc.lam}</button>; })}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">fuchsia λ’s are <strong>degenerate</strong> — two different modes, same pitch</div>
          <button onClick={() => setMix((v) => !v)} className={`mt-3 text-[11px] font-mono px-2.5 py-1 rounded border ${mix ? 'border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-400/10' : 'border-white/15 text-neutral-300 bg-white/[0.04]'}`}>{mix ? 'pure modes' : 'mix the λ = 50 degenerate pair (Chladni) →'}</button>
          {mix && <label className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-2">blend c<input type="range" min="0" max="1.57" step="0.02" value={c} onChange={(e) => setC(parseFloat(e.target.value))} className="pde-range w-32" /></label>}
        </div>
      </div>
      <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.03] p-3">
        <div className="text-[10px] uppercase tracking-widest text-fuchsia-300 mb-2">two different shapes · the SAME spectrum — you cannot hear the shape</div>
        <div className="grid grid-cols-2 gap-4">
          {[[[0.1, 0.5], [0.4, 0.1], [0.7, 0.3], [0.9, 0.6], [0.6, 0.9], [0.3, 0.8], [0.15, 0.85]], [[0.5, 0.1], [0.85, 0.3], [0.7, 0.7], [0.9, 0.9], [0.4, 0.95], [0.15, 0.6], [0.25, 0.25]]].map((poly, k) => (
            <div key={k}>
              <svg viewBox="0 0 1 1" className="block w-full max-w-[120px] mx-auto"><polygon points={poly.map((p) => p.join(',')).join(' ')} fill="#6ee7b7" fillOpacity="0.12" stroke="#6ee7b7" strokeWidth="0.015" /></svg>
              <div className="flex items-end justify-center gap-0.5 h-8 mt-1">{ISO_SPEC.map((e, i) => <div key={i} style={{ height: `${e / 17 * 100}%` }} className="w-1.5 bg-fuchsia-400/60" />)}</div>
              <div className="text-[9px] text-center text-neutral-500 font-mono">drum {k === 0 ? 'A' : 'B'} · identical pitches</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DrumCard = () => (
  <Card id="drum" icon={Music} title="Can you hear the shape of a drum?" accent="emerald" index={18} anchor
        subtitle="The Laplacian’s eigenmodes ARE a drum’s sound — and almost, but not quite, pin down its shape">
    <p>
      A drumhead vibrates only in the Laplacian’s <Term>eigenfunction</Term>s, and the eigenvalues are the frequencies you hear.
      Mark Kac asked: does that list of frequencies determine the shape? Astonishingly, <strong>no</strong> — isospectral drums
      with <em>different</em> shapes exist. The spine pays off here: “sines are eigenfunctions of Δ” is literally what makes sound.
    </p>
    <Block>{'\\lap{\\Delta}\\an{u}=-\\an{\\lambda}\\,\\an{u},\\quad \\an{u}_{mn}=\\kx{\\sin(mx)\\sin(ny)} \\qquad \\an{\\lambda}_{mn}=m^2+n^2 \\ \\Rightarrow\\ \\omega_{mn}=\\sqrt{m^2+n^2}'}</Block>
    <DrumDemo />
    <MinSchema>On a square, the modes are sin(mx)sin(ny) with eigenvalue m² + n² — the 2D echo of “one ODE per mode.” The spectrum fixes area, perimeter, and holes (Weyl), but not always the shape.</MinSchema>
    <Worked title="One pitch, many figures">
      <Eq>{'\\an{\\lambda}=50'}</Eq> is hit by both <Eq>{'(1,7)'}</Eq> and <Eq>{'(5,5)'}</Eq>, since <Eq>{'1+49=25+25'}</Eq>. Both
      {' '}<Eq>{'\\kx{\\sin x\\sin 7y}'}</Eq> and <Eq>{'\\kx{\\sin 5x\\sin 5y}'}</Eq> ring at <Eq>{'\\sqrt{50}\\approx7.07'}</Eq>, so <em>any</em> blend
      {' '}<Eq>{'\\cos c\\,\\an{u}_{17}+\\sin c\\,\\an{u}_{55}'}</Eq> is still a 50-eigenmode — yet its nodal set reshapes continuously as you
      drag <Eq>{'c'}</Eq>. One frequency, a whole family of Chladni figures.
    </Worked>
    <Predict question="Two drums produce the EXACT same set of frequencies. Must they have the same shape?">
      <strong>No.</strong> Gordon, Webb &amp; Wolpert (1992) built explicit isospectral, non-congruent polygonal drums. The
      spectrum fixes the area, the perimeter, and the number of holes (Weyl’s law), but <em>not</em> the outline. You can hear how
      big a drum is and how many holes it has — just not always its shape.
    </Predict>
    <Misconception
      wrong="Chladni lines are where the plate vibrates the MOST."
      right="Sand collects on the NODAL lines — where the mode equals zero and the surface does NOT move. The figure is the zero-set of the eigenfunction."
      because="Grains are shaken off the moving regions and migrate down to the stationary nodal curves, tracing them out." />
    <Deeper>
      <p>
        <strong>Why m² + n².</strong> Separation of variables on the square gives <Eq>{'\\an{u}=\\kx{\\sin(mx)\\sin(ny)}'}</Eq>, and Δ simply
        <em> adds</em> the two 1D eigenvalues: <Eq>{'\\an{\\lambda}=m^2+n^2'}</Eq>. Degeneracy is then a number-theory question — when can a sum of
        two squares be written two ways? (50, 65, 85, …) — the source of the Chladni families. The same machinery is
        diagonalizing a symmetric operator, the link to the <CrossLink to="fourier" recap="Δ sin kx = −k² sin kx — eigen-decomposition.">Fourier</CrossLink> card and to the spectral theorem in
        {' '}<CrossLink to="linear-algebra" recap="Diagonalize a symmetric matrix — same idea, finite-dimensional." external>linear algebra</CrossLink>.
      </p>
      <p>
        <strong>Weyl’s law</strong> says the count of eigenvalues below <Eq>{'\\Lambda'}</Eq> grows like <Eq>{'(\\text{Area}/4\\pi)\\,\\Lambda'}</Eq>, so the
        spectrum reveals the area — and finer asymptotics give the perimeter and the number of holes. But Gordon–Webb–Wolpert
        (building on Sunada’s method) show the shape itself can hide: the eigenvalues are a self-adjoint operator’s real, discrete,
        complete spectrum, yet they leave a residual ambiguity. You can hear a great deal — just not everything.
      </p>
    </Deeper>
  </Card>
);
const GS_PRESETS = { spots: [0.035, 0.065], stripes: [0.022, 0.051], maze: [0.029, 0.057], mitosis: [0.0367, 0.0649], coral: [0.0545, 0.062] };
const GrayScott = () => {
  const N = 96, NN = N * N, Du = 0.16, Dv = 0.08, dt = 1.0;
  const [preset, setPreset] = useState('spots');
  const [F, setF] = useState(GS_PRESETS.spots[0]), [kk, setKk] = useState(GS_PRESETS.spots[1]);
  const [rate, setRate] = useState(12);
  const [playing, setPlaying] = useState(true);
  const u = useRef(null), v = useRef(null), us = useRef(null), vs = useRef(null), step = useRef(0);
  const [tick, setTick] = useState(0);
  const seed = () => {
    const U = new Float64Array(NN), V = new Float64Array(NN); U.fill(1);
    const rnd = mulberry32(7);
    for (let y = 40; y < 56; y++) for (let x = 40; x < 56; x++) { const i = y * N + x; U[i] = 0.5 + 0.01 * (rnd() * 2 - 1); V[i] = 0.25 + 0.01 * (rnd() * 2 - 1); }
    u.current = U; v.current = V; us.current = new Float64Array(NN); vs.current = new Float64Array(NN); step.current = 0;
  };
  if (!u.current) seed();
  const applyPreset = (p) => { setPreset(p); setF(GS_PRESETS[p][0]); setKk(GS_PRESETS[p][1]); seed(); setTick((t) => t + 1); };

  useRaf(playing, () => {
    let U = u.current, V = v.current, Un = us.current, Vn = vs.current;
    for (let s = 0; s < rate; s++) {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x, xe = (x + 1) % N, xw = (x - 1 + N) % N, yn = (y + 1) % N, ys = (y - 1 + N) % N;
        const lu = U[y * N + xe] + U[y * N + xw] + U[yn * N + x] + U[ys * N + x] - 4 * U[i];
        const lv = V[y * N + xe] + V[y * N + xw] + V[yn * N + x] + V[ys * N + x] - 4 * V[i];
        const uvv = U[i] * V[i] * V[i];
        Un[i] = U[i] + dt * (Du * lu - uvv + F * (1 - U[i]));
        Vn[i] = V[i] + dt * (Dv * lv + uvv - (F + kk) * V[i]);
      }
      const tU = U; U = Un; Un = tU; const tV = V; V = Vn; Vn = tV;
    }
    u.current = U; v.current = V; us.current = Un; vs.current = Vn; step.current += rate;
    if (V[0] !== V[0]) seed();
    setTick((t) => (t + 1) % 1e9);
  });
  const DISP = 280;
  const onPaint = (e) => { if (e.buttons !== 1 && e.type !== 'click') return; const r = e.currentTarget.getBoundingClientRect(); const cx = (e.clientX - r.left) / r.width * N, cy = (e.clientY - r.top) / r.height * N; const V = v.current; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if ((x - cx) ** 2 + (y - cy) ** 2 < 16) V[y * N + x] = 0.5; } };
  const padX = (f) => (f - 0.01) / 0.05, padY = (k) => (k - 0.045) / 0.025;
  const onPad = (e) => { const r = e.currentTarget.getBoundingClientRect(); setF(clamp(0.01 + (e.clientX - r.left) / r.width * 0.05, 0.01, 0.06)); setKk(clamp(0.045 + (e.clientY - r.top) / r.height * 0.025, 0.045, 0.07)); setPreset('custom'); };

  return (
    <div className="mt-3 grid md:grid-cols-[280px_1fr] gap-4 items-start">
      <div>
        <div className="rounded-lg overflow-hidden border border-white/10 cursor-crosshair" style={{ width: '100%', maxWidth: DISP }} onMouseMove={onPaint} onClick={onPaint}>
          <Heatmap2D field={v.current} nx={N} ny={N} width={DISP} height={DISP} colormap={CM_DIVERGING} domain={[0, 0.4]} smooth tick={tick} style={{ width: '100%', height: 'auto', borderRadius: 0 }} />
        </div>
        <div className="text-[10px] font-mono text-neutral-500 mt-1">step {step.current} · drag to seed a disturbance · F = {F.toFixed(3)}, k = {kk.toFixed(3)}</div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
          {Object.keys(GS_PRESETS).map((p) => <button key={p} onClick={() => applyPreset(p)} className={`px-2 py-0.5 rounded border ${preset === p ? 'bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-100' : 'border-white/15 text-neutral-400'}`}>{p}</button>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <button onClick={() => setPlaying((p) => !p)} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-200">{playing ? 'pause' : '▶'}</button>
          <button onClick={() => { seed(); setTick((t) => t + 1); }} className="px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reseed</button>
          <label className="flex items-center gap-1 text-neutral-400">speed<input type="range" min="4" max="16" step="1" value={rate} onChange={(e) => setRate(parseInt(e.target.value))} className="pde-range w-16" /></label>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">(F, k) phase diagram · drag the pin</div>
          <svg viewBox="0 0 1 1" className="block w-full max-w-[180px] border border-white/10 rounded bg-black/30 cursor-crosshair" onMouseDown={onPad} onMouseMove={(e) => e.buttons === 1 && onPad(e)} style={{ aspectRatio: '1 / 1' }}>
            {Object.entries(GS_PRESETS).map(([p, [f, k]], i) => <circle key={i} cx={padX(f)} cy={padY(k)} r={0.02} fill="#a5b4fc" opacity="0.5" />)}
            <circle cx={clamp(padX(F), 0, 1)} cy={clamp(padY(kk), 0, 1)} r={0.035} fill="#f0abfc" stroke="#0a0a0a" strokeWidth="0.01" />
          </svg>
          <div className="flex justify-between text-[8px] font-mono text-neutral-600" style={{ maxWidth: 180 }}><span>F=.01</span><span>feed F →</span><span>F=.06</span></div>
        </div>
      </div>
    </div>
  );
};

const TuringCard = () => (
  <Card id="turing" icon={Fingerprint} title="Reaction–diffusion: when diffusion CREATES structure" accent="fuchsia" index={19} anchor
        subtitle="Two chemicals diffusing at different speeds break a uniform soup into spots, stripes and mazes — the Laplacian as builder">
    <p>
      Heat taught us that diffusion <em>destroys</em> structure. Here is Turing’s reversal: couple two diffusing species through a
      nonlinear reaction, make one diffuse faster, and the flat state goes <strong>unstable</strong>. A short-range activator
      amplifies local bumps while a long-range inhibitor suppresses them at a distance — “local activation, lateral inhibition” —
      and the medium self-organizes into a wavelength-selected pattern. The <em>same</em> Laplacian that smooths heat now sculpts
      leopard spots. The operator has no fixed personality at all.
    </p>
    <Block>{'\\partial_{\\tt{t}}\\src{u}=D_u\\lap{\\Delta}\\src{u}-\\src{u}\\kx{v}^2+F(1-\\src{u}) \\qquad \\partial_{\\tt{t}}\\kx{v}=D_v\\lap{\\Delta}\\kx{v}+\\src{u}\\kx{v}^2-(F{+}k)\\kx{v}'}</Block>
    <ReadEq>two species react (the <Eq>{'\\src{u}\\kx{v}^2'}</Eq> term) and diffuse at different rates (<Eq>{'D_u>D_v'}</Eq>); that mismatch is what destabilizes the uniform state.</ReadEq>
    <GrayScott />
    <MinSchema>Diffusion alone always smooths. But two species diffusing at <em>different</em> rates, coupled by a nonlinear reaction, make the uniform state linearly unstable to a band of wavelengths — a diffusion-driven instability that <strong>builds</strong> pattern.</MinSchema>
    <Worked title="Watch a pattern nucleate">
      Pick <em>spots</em> and wait. Around step 1000 the field still looks blank (the perturbation is tiny). The seed then
      <em> replicates</em>; by step ~4000 a regular lattice of orange spots stands on a cyan background, and it <em>holds</em> — paint a
      streak across it and the lattice scrambles, then re-heals at the <em>same</em> spacing. The wavelength is set by the equation,
      not by your poke.
    </Worked>
    <Predict question="Diffusion smooths things out — so shouldn’t two diffusing chemicals just get MORE uniform?">
      <strong>Not when they react and diffuse at different rates.</strong> A fast inhibitor plus a slow activator make a tiny bump
      grow: the activator reinforces itself locally faster than it spreads, while the inhibitor races outward and shuts down the
      neighborhood. The flat state is linearly <em>unstable</em> to a band of wavelengths — a diffusion-driven instability, the exact
      opposite of smoothing.
    </Predict>
    <Misconception
      wrong="Turing patterns prove that diffusion organizes structure all by itself."
      right="Diffusion alone always smooths. The instability needs BOTH a nonlinear amplifying reaction AND a difference in diffusion rates (Du ≠ Dv). Remove the reaction or equalize the rates and the pattern dies back to uniform."
      because="Linear stability analysis shows the uniform state only loses stability when an autocatalytic activator and a faster-diffusing inhibitor make some Fourier mode k* grow." />
    <Deeper>
      <p>
        <strong>The math behind “local activation, lateral inhibition.”</strong> Linearize about the uniform state, Fourier-transform,
        and look at the <Eq>{'2\\times2'}</Eq> Jacobian <Eq>{'J-\\kx{k}^2D'}</Eq>. A whole band of wavenumbers gets a positive growth rate
        <em> only</em> when <Eq>{'D_u\\ne D_v'}</Eq> — and the fastest-growing <Eq>{'\\kx{k}^*'}</Eq> sets the pattern’s spacing. It is the spine’s
        “one ODE per mode” ({' '}<CrossLink to="fourier" recap="Decompose into modes; here, find the fastest-growing one.">fourier</CrossLink>) run to find the winner. Nonlinearity is essential twice: the
        autocatalytic <Eq>{'\\src{u}\\kx{v}^2'}</Eq> drives growth, then saturation bounds it.
      </p>
      <p>
        <strong>Why it’s the closer.</strong> The numerics here are the same 5-point periodic Δ ({' '}<CrossLink to="stencils" recap="The discrete Laplacian.">stencils</CrossLink>), stable because
        {' '}<Eq>{'4 D_u\\,dt/dx^2=0.64<1'}</Eq> ({' '}<CrossLink to="cfl" recap="Explicit diffusion needs r ≤ ¼ in 2D.">cfl</CrossLink>). Reaction–diffusion paints animal coats, seashells, vegetation
        bands, and fingerprints. And it makes the whole explainer’s point: the Laplacian has no fixed character —
        {' '}<span className="text-orange-300">uₜ = Δu erases</span>, <span className="text-sky-300">uₜₜ = Δu rings</span>,
        {' '}<span className="text-emerald-300">Δu = 0 balances</span>, and coupled nonlinearly with unequal diffusion, it
        {' '}<span className="text-fuchsia-300">builds</span>.
      </p>
    </Deeper>
  </Card>
);
const NeuralPdeDemo = () => {
  const [physics, setPhysics] = useState(false);
  const Np = 90;
  const smooth = (x) => { const a = [1, 0.5, 0.3, 0.2]; let s = 0; for (let k = 1; k <= 4; k++) s += a[k - 1] * Math.exp(-k * k * 0.04) * Math.sin(k * x); return s; };
  const cand = useMemo(() => { const u = new Float64Array(Np); for (let i = 0; i < Np; i++) { const x = i / (Np - 1) * Math.PI; u[i] = physics ? smooth(x) : smooth(x) + 0.28 * Math.sin(11 * x) + 0.18 * Math.sin(17 * x + 1); } return u; }, [physics]);

  const Pt = 64, [K, setK] = useState(6);
  const fno = useMemo(() => {
    const ff = (x) => Math.exp(-(((x - 2) / 0.6) ** 2)) + 0.6 * Math.exp(-(((x - 4.5) / 0.5) ** 2)) + 0.15 * Math.sin(3 * x);
    const inp = new Float64Array(Pt); for (let p = 0; p < Pt; p++) inp[p] = ff(2 * Math.PI * p / Pt);
    const re = new Float64Array(Pt), im = new Float64Array(Pt);
    for (let k = 0; k < Pt; k++) { let r = 0, i = 0; for (let p = 0; p < Pt; p++) { const a = -2 * Math.PI * k * p / Pt; r += inp[p] * Math.cos(a); i += inp[p] * Math.sin(a); } re[k] = r / Pt; im[k] = i / Pt; }
    for (let k = 0; k < Pt; k++) { const kw = k <= Pt / 2 ? k : k - Pt; if (Math.abs(kw) > K) { re[k] = 0; im[k] = 0; } }
    const out = new Float64Array(Pt); for (let p = 0; p < Pt; p++) { let r = 0; for (let k = 0; k < Pt; k++) { const a = 2 * Math.PI * k * p / Pt; r += re[k] * Math.cos(a) - im[k] * Math.sin(a); } out[p] = r; }
    return { inp, out };
  }, [K]);

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between mb-1"><div className="text-[10px] uppercase tracking-widest text-sky-300">PINN · the equation goes in the loss</div>
          <button onClick={() => setPhysics((v) => !v)} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${physics ? 'border-emerald-400/40 text-emerald-200 bg-emerald-400/10' : 'border-white/15 text-neutral-300'}`}>{physics ? 'physics loss ON' : 'add physics loss →'}</button>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono mb-2">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10">(x, t)</span><ArrowRight className="w-3 h-3 text-neutral-500" />
          <span className="px-2 py-1 rounded bg-sky-500/10 border border-sky-400/20 text-sky-200">MLP&nbsp;u<sub>θ</sub></span><ArrowRight className="w-3 h-3 text-neutral-500" />
          <span className={`px-2 py-1 rounded border ${physics ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-neutral-400'}`}>data fit</span>
          <span className="text-neutral-500">+ λ</span>
          <span className={`px-2 py-1 rounded border ${physics ? 'border-emerald-400/30 text-emerald-300' : 'border-rose-400/40 text-rose-300 bg-rose-400/10'}`}>‖∂ₜuθ − Δuθ‖²</span>
        </div>
        <Field1D u={cand} yRange={[-1.4, 1.4]} accent={physics ? '#6ee7b7' : '#fb7185'} height={110} />
        <div className="text-[10px] text-neutral-500 mt-1">{physics ? 'the physics-residual term pulls the candidate onto an actual solution of uₜ = Δu — even with no data' : 'a candidate that fits scattered data but ignores the PDE wiggles wildly between points'}</div>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-1">FNO · learn the operator in Fourier space</div>
        <div className="flex items-center gap-2 text-[10px] font-mono mb-2 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">lift</span><ArrowRight className="w-3 h-3 text-neutral-500" />
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-400/20 text-indigo-200">FFT → keep {K} modes × Rθ → iFFT</span><ArrowRight className="w-3 h-3 text-neutral-500" />
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">project</span>
        </div>
        <Field1D u={fno.out} yRange={[-0.3, 1.6]} accent="#a5b4fc" height={110} extra={[{ u: fno.inp, accent: '#e0e7ff', dash: '4 3', opacity: 0.4, width: 1.2 }]} />
        <label className="flex items-center gap-2 text-[11px] font-mono mt-1 text-neutral-400">keep k ≤<input type="range" min="1" max="24" value={K} onChange={(e) => setK(parseInt(e.target.value))} className="pde-range w-28" /><span className="text-indigo-200">{K}</span></label>
        <div className="text-[10px] text-neutral-500 mt-1">dropping high modes is cheaper and blurrier — the very same low-pass filtering that makes heat smooth</div>
      </div>
    </div>
  );
};

const NeuralPdeCard = () => (
  <Card id="neuralpde" icon={BrainCircuit} title="Learning PDEs: PINNs & neural operators" accent="sky" index={20}
        subtitle="Bake the PDE into a network’s loss, or learn the whole solution operator in Fourier space">
    <p>
      If a network’s output should solve a PDE, just <em>measure</em> how badly it violates the equation and minimize that —
      automatic differentiation hands you <Eq>{'\\uu{u}_{\\tt{t}}'}</Eq> and <Eq>{'\\uu{u}_{xx}'}</Eq> for free, so the PDE residual becomes a loss term.
      That’s a <Term def="Physics-Informed Neural Network: a net whose loss includes the PDE residual evaluated by automatic differentiation, so its output is forced to (approximately) satisfy the equation — mesh-free.">PINN</Term>. The bigger idea is the <Term def="Fourier Neural Operator: a neural operator whose layers transform to Fourier space, multiply each low mode by a learned weight, and transform back — a learned, trainable version of diagonalizing the Laplacian.">Fourier Neural Operator</Term>: learn the <em>map</em> from input data to solution, doing the heavy
      lifting in Fourier space — which is “diagonalize the Laplacian” from the spine, made trainable.
    </p>
    <Block>{'\\mathcal{L}=\\underbrace{\\lVert \\uu{u}_\\theta-\\uu{u}_{\\text{data}}\\rVert^2}_{\\text{fit data}}+\\lambda\\underbrace{\\lVert\\partial_{\\tt{t}} \\uu{u}_\\theta-\\lap{\\Delta}\\uu{u}_\\theta\\rVert^2}_{\\text{obey the PDE}} \\qquad (\\mathcal{K}v)(x)=\\mathcal{F}^{-1}\\!\\big(\\an{R_\\theta}\\cdot\\mathcal{F}v\\big)(x)'}</Block>
    <NeuralPdeDemo />
    <MinSchema>A PINN puts the PDE residual in the loss (one solution, mesh-free). A neural operator learns the solution <em>map</em> in Fourier space (many inputs, one forward pass) — a learned, trainable diagonalization of Δ.</MinSchema>
    <Predict question="An FNO layer FFTs the field, multiplies each mode by a learned weight, then FFTs back. Where have you seen ‘transform to Fourier, scale each mode, transform back’?">
      <strong>Exactly how we solved heat and wave.</strong> Diagonalizing Δ turned each PDE into one ODE per mode — multiply mode
      {' '}<Eq>{'\\kx{k}'}</Eq> by <Eq>{'e^{-\\kx{k}^2\\tt{t}}'}</Eq> (heat) or <Eq>{'\\cos(\\kx{k}\\tt{t})'}</Eq> (wave), then sum back ({' '}<CrossLink to="fourier" recap="The PDE becomes one ODE per Fourier mode.">fourier</CrossLink>). The FNO keeps
      that exact skeleton but makes the per-mode multiplier <em>learned</em> instead of derived. The spine’s trick is the architecture.
    </Predict>
    <Misconception
      wrong="A network trained on one PDE has 'learned the PDE' and solves new instances for free."
      right="A vanilla PINN fits ONE solution of ONE instance — change the data and you retrain. What generalizes is a neural OPERATOR (like the FNO), trained on many (input, solution) pairs to approximate the solution map, so a new input is a single forward pass."
      because="A PINN parametrizes a single function; an operator parametrizes a map between function spaces." />
    <Deeper>
      <p>
        <strong>PINN mechanics.</strong> Sample collocation points, evaluate the residual <Eq>{'\\partial_{\\tt{t}}\\uu{u}_\\theta-\\lap{\\Delta}\\uu{u}_\\theta'}</Eq>
        by <Term def="Automatic differentiation: the chain rule applied through a program, giving exact derivatives of the network output with respect to its inputs (x, t) at machine precision — what makes the PDE residual computable.">automatic differentiation</Term>, and add it to the loss as a regularizer. Strengths: mesh-free, great for inverse
        problems and irregular domains. Weaknesses: the loss is stiff, training suffers from <Term def="The tendency of neural networks to learn low-frequency components much faster than high-frequency ones — which slows PINNs on sharp or oscillatory solutions.">spectral bias</Term> (slow on high
        frequencies), and balancing <Eq>{'\\lambda'}</Eq> is delicate.
      </p>
      <p>
        <strong>Neural operators.</strong> An FNO layer is <Eq>{'v\\mapsto\\sigma\\!\\big(Wv+\\mathcal{F}^{-1}(\\an{R_\\theta}\\cdot\\mathcal{F}v)\\big)'}</Eq> —
        a local linear map plus the learned spectral convolution. Truncating to the lowest modes both regularizes and bounds cost
        (and is the same low-pass that smooths heat). Operators are discretization-invariant and amortized: train once, evaluate
        on any new input in one pass. Honest limits: not always faster than a classical solver, they struggle on turbulence and
        shocks, and they degrade out of distribution. This is differential physics meeting <CrossLink to="fourier" recap="Diagonalizing Δ — the move the FNO learns.">the spine</CrossLink>.
      </p>
    </Deeper>
  </Card>
);
const SPINE_NODES = [
  { label: 'a local rule', to: 'whatis', tone: '#e0e7ff' },
  { label: 'the Laplacian', to: 'laplacian', tone: '#a5b4fc' },
  { label: 'Fourier', to: 'fourier', tone: '#67e8f9' },
  { label: 'three fates', to: 'bigthree', tone: '#fb923c' },
  { label: 'numerics & frontier', to: 'turing', tone: '#f0abfc' },
];
const LENSES = [
  { name: 'Geometric', tone: 'cyan', when: 'First triage: count time-derivatives and look at Δ → parabolic / hyperbolic / elliptic. Reach for characteristics, phase pictures, the maximum principle.' },
  { name: 'Analytical', tone: 'indigo', when: 'A box, disk, or sphere? Separate variables and ride Δ’s eigenfunctions (Fourier). Point source? Convolve a Green’s function / heat kernel. d’Alembert for waves.' },
  { name: 'Numerical', tone: 'rose', when: 'Otherwise discretize: the 5-point Δ, explicit vs implicit time-stepping, von Neumann to set the timestep — or FEM / spectral when geometry or accuracy demands.' },
];

const TrailsCard = () => {
  const go = (to) => { const el = document.getElementById(to); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <Card id="trails" icon={Compass} title="Next trails" accent="indigo" index={21}
          subtitle="One breath of the whole spine, a ‘which lens when’ guide, and threads to the siblings">
      <p>
        Everything here was one sentence in different clothes: a PDE is a <strong>local conversation between a point and its
        neighbors</strong>, the <strong>Laplacian</strong> is the grammar, <strong>Fourier</strong> is the language, and time wires
        the same operator into three fates. Numerics is that conversation on a grid; the frontier is letting it build structure or
        letting a network learn it.
      </p>
      <Block>{'\\lap{\\Delta\\uu{u}}=\\overline{\\text{neighbors}}-\\uu{u} \\quad\\Rightarrow\\quad \\src{\\uu{u}_{\\tt{t}}=\\lap{\\Delta}\\uu{u}}\\,\\text{(relax)}\\ \\mid\\ \\wv{\\uu{u}_{\\tt{tt}}=\\lap{\\Delta}\\uu{u}}\\,\\text{(ring)}\\ \\mid\\ \\eqm{\\lap{\\Delta}\\uu{u}=0}\\,\\text{(freeze)}'}</Block>
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">the spine, in five steps · click to jump</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SPINE_NODES.map((nd, i) => (
            <React.Fragment key={nd.to}>
              <button onClick={() => go(nd.to)} className="px-2.5 py-1.5 rounded-lg border text-[12px] font-medium hover:bg-white/5 transition-colors" style={{ borderColor: nd.tone + '55', color: nd.tone }}>{nd.label}</button>
              {i < SPINE_NODES.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-3 gap-2">
        {LENSES.map((l) => (
          <div key={l.name} className={`rounded-lg border p-3 ${chipPalette[l.tone]}`}>
            <div className="text-[12px] font-semibold mb-1">{l.name}</div>
            <div className="text-[11px] text-neutral-300 leading-snug">{l.when}</div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">the same Δ, elsewhere</div>
        <div className="flex flex-wrap gap-2 text-[12px]">
          <CrossLink to="#odes" external recap="The time-only cousin — a PDE is ∞-many coupled ODEs, one per Fourier mode.">ODEs</CrossLink>
          <CrossLink to="#quantum-mechanics" external recap="Schrödinger is the same Δ wired with an i — diffusion in imaginary time.">Quantum mechanics</CrossLink>
          <CrossLink to="#control-theory" external recap="An impulse response IS a Green’s function; distributed control of PDEs.">Control theory</CrossLink>
          <CrossLink to="#linear-algebra" external recap="‘Diagonalize Δ’ is the spectral theorem, in infinite dimensions.">Linear algebra</CrossLink>
        </div>
      </div>
      <div className="mt-6 border-l-4 border-indigo-400/50 pl-4 py-1">
        <Quote className="w-4 h-4 text-indigo-300 mb-1" />
        <p className="text-[15px] italic text-neutral-200 leading-relaxed">A differential equation does not describe the world all at once — it whispers a single local rule and lets the whole field work out the consequences. Learn to hear that whisper, and heat, light, sound, money, and leopard spots all turn out to be the same sentence.</p>
        <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-mono">the partial-differential view</div>
      </div>
      <Deeper>
        <p>
          <strong>Which lens, in 30 seconds.</strong> Step 1, geometric: count time-derivatives and read Δ’s character —
          {' '}<CrossLink to="classify" recap="B² − AC sorts the three types.">parabolic / hyperbolic / elliptic</CrossLink>. Step 2, analytical: on nice domains separate variables and ride
          Δ’s eigenfunctions ({' '}<CrossLink to="fourier" recap="One ODE per mode.">Fourier</CrossLink>), or convolve a <CrossLink to="greens" recap="Impulse response; superpose.">Green’s function</CrossLink>. Step 3, numerical: otherwise
          discretize the <CrossLink to="stencils" recap="The 5-point Δ.">5-point Δ</CrossLink>, pick explicit vs implicit, and use <CrossLink to="cfl" recap="von Neumann: |g| ≤ 1.">von Neumann</CrossLink> to set the timestep.
        </p>
        <p>
          <strong>Loose threads worth pulling.</strong> Well-posedness and Sobolev spaces (the right home for weak solutions);
          conservation laws and the full theory of shocks; adaptive FEM and spectral elements; stochastic PDEs (noise-driven
          fields); and the optimal-control / adjoint view that turns a PDE into a thing you can steer. Each is the same local
          conversation, listened to more carefully.
        </p>
      </Deeper>
    </Card>
  );
};

const Footer = () => (
  <footer className="relative border-t border-white/5 mt-10">
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="text-sm text-neutral-400 leading-relaxed">
        One idea carried the whole way: a PDE is a <span className="text-indigo-300">local rule</span> between a point and its neighbors,
        the <span className="text-indigo-300">Laplacian</span> is the grammar, and <span className="text-cyan-300">Fourier</span> is the language that makes it simple.
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-600">
        <span>local rule</span><span className="text-neutral-700">·</span>
        <span>Laplacian</span><span className="text-neutral-700">·</span>
        <span>Fourier</span><span className="text-neutral-700">·</span>
        <span>three fates</span><span className="text-neutral-700">·</span>
        <span>numerics</span><span className="text-neutral-700">·</span>
        <span>patterns</span>
      </div>
    </div>
  </footer>
);

export default function PDEsExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].pde-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].pde-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #a5b4fc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(165,180,252,0.4);
        }
        input[type=range].pde-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #a5b4fc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <WhatIsCard />
        <LaplacianCard />
        <BigThreeCard />
        <ClassifyCard />
        <HeatCard />
        <HeatKernelCard />
        <WaveCard />
        <CharacteristicsCard />
        <LaplaceCard />
        <FourierCard />
        <GreensCard />
        <StencilsCard />
        <CflCard />
        <FemCard />
        <GalleryCard />
        <BurgersCard />
        <NavierStokesCard />
        <DrumCard />
        <TuringCard />
        <NeuralPdeCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
