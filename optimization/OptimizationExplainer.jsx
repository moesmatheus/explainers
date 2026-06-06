import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Target, Compass, TrendingDown, Spline, Rocket, GitFork, Crosshair, Split,
  Link2, ListChecks, Scale, Hexagon, GitBranch, Grid3x3, Network, Dices,
  Mountain, Globe, Coffee, Workflow, Route, Star, Ruler, ChevronDown, Eye,
  EyeOff, Lightbulb, HelpCircle, AlertTriangle, XCircle, CheckCircle2, ArrowRight,
  FlaskConical, Quote, Sparkles, Gauge, Sliders, Layers, Activity, Sigma,
} from 'lucide-react';

/* ============================================================================
   Optimization · the search for the bottom of a landscape
   A practitioner's full-panorama survey. Spine = three questions:
     (1) Which way is down?      gradient · step size · momentum · Newton
     (2) Am I at the bottom?     convexity · optimality · Lagrange/KKT · duality
     (3) When the landscape fights back?  stochastic · non-convex · discrete · global
   Anchor = "The Roastery": one resource-allocation problem re-solved every way;
   the multiplier reads as a literal shadow price ($/unit of relaxed constraint).
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- KaTeX ------------------------------------------------------------------

const KATEX_MACROS = {
  '\\obj':  '\\textcolor{##6ee7b7}{#1}',  // emerald · objective f / the descent
  '\\dir':  '\\textcolor{##a5b4fc}{#1}',  // indigo  · gradient / step direction
  '\\con':  '\\textcolor{##fbbf24}{#1}',  // amber   · constraints / multipliers / prices
  '\\inf':  '\\textcolor{##fb7185}{#1}',  // rose    · infeasible / divergence / traps
  '\\dual': '\\textcolor{##c4b5fd}{#1}',  // violet  · dual
  '\\an':   '\\textcolor{##f0abfc}{#1}',  // fuchsia · anchor (the roastery)
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
const lerp = (a, b, t) => a + (b - a) * t;
const fmtN = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);
const fmt$ = (v) => '$' + Math.round(v).toLocaleString('en-US');
const fmt$1 = (v) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// 2×2 linear algebra — gradients, Hessians, constraint intersections live here.
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
const matVec2 = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
const solve2 = (M, b) => {           // solve M x = b for 2×2 M
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  if (Math.abs(det) < 1e-12) return null;
  return [(b[0] * M[1][1] - b[1] * M[0][1]) / det, (M[0][0] * b[1] - M[1][0] * b[0]) / det];
};
// eigenvalues of a symmetric 2×2 [[a,b],[b,c]] — used for condition numbers.
const eigSym2 = (a, b, c) => {
  const tr = a + c, d = Math.sqrt(Math.max(0, (a - c) * (a - c) + 4 * b * b));
  return [(tr + d) / 2, (tr - d) / 2];
};

/* --- The Roastery · the running anchor (frozen, Node-verified constants) -----
   profit(x) = aᵀx − ½ xᵀQ x   (a MAXIMIZE problem). We descend f = −profit, so
   "downhill = more profit" stays the consistent verb across the whole explainer.
   Every number below was solved + adversarially re-checked in hand-rolled Node;
   see docs/plans/2026-06-06-optimization-verified-numerics.md. */
const Q = [[0.03, 0.01], [0.01, 0.36]];   // curvature; SPD, κ = 12.13, tilted ellipses
const A_MARGIN = [9, 7];                    // concave base margins $/kg (Espresso, Filter)
const C_LP = [9, 7];                        // LP fixed margins $/kg
const X_STAR = [16.364, 7.273];             // concave-constrained optimum (on the roaster wall)
const WALLS = [
  { key: 'beans',   a: [1.2, 1.0],  b: 27, label: 'green beans',     short: 'beans',   unit: 'kg/day', color: '#fbbf24' },
  { key: 'roaster', a: [0.20, 0.10], b: 4,  label: 'roaster-hours',   short: 'roaster', unit: 'h/day',  color: '#fb923c' },
  { key: 'labor',   a: [0.10, 0.15], b: 4,  label: 'labor / packing', short: 'labor',   unit: 'h/day',  color: '#f59e0b' },
];
const ROAST = {
  uncMax:  [296.26, 11.21],                                          // Q⁻¹a — infeasible (beans 366.73 ≫ 27)
  lp:      { x: [16.25, 7.5], value: 198.75, bind: ['beans', 'roaster'], slack: ['labor'] },
  conc:    { x: X_STAR, profit: 183.45, active: 'roaster', mu: 42.18, gradAtOpt: [8.4364, 4.2182] },
  intOpt:  { x: [15, 9], profit: 198 },
  roundLP: { x: [16, 8], beansUse: 27.2, feasible: false },
  shadow:  { beans: 6.25, roaster: 7.50, labor: 0 },
  kappa: 12.13, L: 0.360303, lmin: 0.029697,
};
// concave profit + its gradient (∇profit = a − Qx)
const roastProfit = (x1, x2) =>
  A_MARGIN[0] * x1 - 0.5 * Q[0][0] * x1 * x1 + A_MARGIN[1] * x2 - 0.5 * Q[1][1] * x2 * x2 - Q[0][1] * x1 * x2;
const roastGrad = (x1, x2) =>
  [A_MARGIN[0] - Q[0][0] * x1 - Q[0][1] * x2, A_MARGIN[1] - Q[1][1] * x2 - Q[0][1] * x1];
const feasibleAt = (x1, x2) => x1 >= 0 && x2 >= 0 && WALLS.every((w) => w.a[0] * x1 + w.a[1] * x2 <= w.b + 1e-9);

// shared demo bowl (cards 2–5): f = ½(x−x*)ᵀQ(x−x*), min 0 at the concave optimum.
// Same Q as the anchor, so κ, L and the step-size thresholds ARE the roastery's curvature.
const fBowl = (x1, x2) => {
  const d0 = x1 - X_STAR[0], d1 = x2 - X_STAR[1];
  return 0.5 * (Q[0][0] * d0 * d0 + 2 * Q[0][1] * d0 * d1 + Q[1][1] * d1 * d1);
};
const gradBowl = (x1, x2) => {
  const d0 = x1 - X_STAR[0], d1 = x2 - X_STAR[1];
  return [Q[0][0] * d0 + Q[0][1] * d1, Q[1][0] * d0 + Q[1][1] * d1];
};

// centered demo bowl for the Newton/momentum cards: g(u,v)=½(λ_min u² + λ_max v²),
// SAME eigenvalues (hence κ) as the anchor Q, but axis-aligned and origin-centered.
const LMIN = 0.029697, LMAX = 0.360303;           // eigenvalues of Q
const gBowlF = (lmax) => (u, v) => 0.5 * (LMIN * u * u + lmax * v * v);
const gGradF = (lmax) => (u, v) => [LMIN * u, lmax * v];

// Linear-program solver for the roastery (max c·x s.t. resource walls, x≥0) by
// vertex enumeration — exact for 2 vars. Reused by the KKT, duality & LP cards.
const solveLP = (G, T, L, c = C_LP) => {
  const rows = [[1.2, 1.0, G], [0.2, 0.1, T], [0.1, 0.15, L], [1, 0, 0], [0, 1, 0]]; // last two: x1=0, x2=0
  const feas = (x) => x[0] >= -1e-7 && x[1] >= -1e-7 && 1.2 * x[0] + 1.0 * x[1] <= G + 1e-6 && 0.2 * x[0] + 0.1 * x[1] <= T + 1e-6 && 0.1 * x[0] + 0.15 * x[1] <= L + 1e-6;
  let best = { x: [0, 0], value: 0 };
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    const x = solve2([[rows[i][0], rows[i][1]], [rows[j][0], rows[j][1]]], [rows[i][2], rows[j][2]]);
    if (!x || !feas(x)) continue;
    const v = c[0] * x[0] + c[1] * x[1];
    if (v > best.value + 1e-9) best = { x, value: v };
  }
  return best;
};
const lpShadow = (G, T, L) => {
  const e = 1e-3, base = solveLP(G, T, L).value;
  return {
    beans: (solveLP(G + e, T, L).value - solveLP(G - e, T, L).value) / (2 * e),
    roaster: (solveLP(G, T + e, L).value - solveLP(G, T - e, L).value) / (2 * e),
    labor: (solveLP(G, T, L + e).value - solveLP(G, T, L - e).value) / (2 * e),
  };
};

// seeded RNG + Gaussian sample — reproducible noise so SGD/SA demos replay identically.
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const randn = (rng) => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
// small dense linear solve (Gaussian elimination, partial pivot) — used by the GP.
const solveLin = (A, b) => {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    const d = M[i][i] || 1e-9;
    for (let r = 0; r < n; r++) { if (r === i) continue; const f = M[r][i] / d; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
  }
  return M.map((r, i) => r[n] / (M[i][i] || 1e-9));
};
// frozen demo functions for cards 17 / 18 (non-convex & black-box)
const f2crit = [
  { x: -1.0356, f: -0.305, eig: [8.87, 2], kind: 'min A (global)', color: '#6ee7b7' },
  { x: 0.9602, f: 0.294, eig: [7.06, 2], kind: 'min B', color: '#67e8f9' },
  { x: 0.0754, f: 1.011, eig: [-3.93, 2], kind: 'saddle', color: '#fb7185' },
];
const f2 = (x, y) => (x * x - 1) ** 2 + y * y + 0.3 * x;
const f2grad = (x, y) => [4 * x * x * x - 4 * x + 0.3, 2 * y];
const fbb = (x) => Math.sin(3 * x) + 0.5 * x;

const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const normCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
const normPdf = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
// Gaussian-process posterior (RBF kernel, unit prior variance) over a grid.
const gpPosterior = (X, Y, grid, l = 1) => {
  const n = X.length, k = (a, b) => Math.exp(-((a - b) ** 2) / (2 * l * l));
  const K = X.map((xi, i) => X.map((xj, j) => k(xi, xj) + (i === j ? 1e-6 : 0)));
  const Ki = []; for (let c = 0; c < n; c++) { const e = Array(n).fill(0); e[c] = 1; Ki.push(solveLin(K, e)); }
  const Kifull = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => Ki[c][r]));
  const alpha = solveLin(K, Y);
  return grid.map((xs) => {
    const ks = X.map((xi) => k(xs, xi));
    let mean = 0; for (let i = 0; i < n; i++) mean += ks[i] * alpha[i];
    const Kiks = Kifull.map((row) => row.reduce((s, v, j) => s + v * ks[j], 0));
    let q = 0; for (let i = 0; i < n; i++) q += ks[i] * Kiks[i];
    return { x: xs, mean, sd: Math.sqrt(Math.max(1e-9, 1 - q)) };
  });
};

// dev-only sanity checks — guard the P0/P1 numerical claims at build time.
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  const [lmax, lmin] = eigSym2(Q[0][0], Q[0][1], Q[1][1]);
  const g = roastGrad(X_STAR[0], X_STAR[1]);
  const warn = (c, m) => { if (!c) console.error('[anchor-assert]', m); };
  warn(Math.abs(lmax / lmin - 12.13) < 0.05, `κ=${(lmax / lmin).toFixed(3)} ≠ 12.13`);
  warn(1.2 * 16 + 1.0 * 8 > 27, 'round(LP)=(16,8) must be infeasible (beans>27)');
  warn(feasibleAt(15, 9), 'integer optimum (15,9) must be feasible');
  warn(Math.abs(g[0] - 8.4364) < 0.02 && Math.abs(g[1] - 4.2182) < 0.02, `∇f at concave opt = (${g[0].toFixed(3)},${g[1].toFixed(3)})`);
  warn(Math.abs(42.18 * 0.20 - g[0]) < 0.02, 'KKT ∇f = μ·∇g_roaster mismatch');
}

// --- viewport gating (port of the PDE RafGate) ------------------------------
// Every Card provides { active, enterKey }: `active` is true only while the card
// is near the viewport (so useRaf pauses off-screen sims); `enterKey` increments
// each time the card re-enters view, so auto-playing demos restart fresh.
const RafGate = React.createContext({ active: true, enterKey: 0 });

const useRaf = (active, cb) => {
  const gate = React.useContext(RafGate);
  const cbRef = useRef(cb); cbRef.current = cb;
  useEffect(() => {
    if (!active || !gate.active) return;
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
  }, [active, gate.active]);
};

const useReplayOnEnter = (reset) => {
  const { enterKey } = React.useContext(RafGate);
  const ref = useRef(reset); ref.current = reset;
  useEffect(() => { if (ref.current) ref.current(); }, [enterKey]);
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  indigo:  { text: 'text-indigo-400',  border: 'border-indigo-400/20',  from: 'from-indigo-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
  teal:    { text: 'text-teal-400',    border: 'border-teal-400/20',    from: 'from-teal-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'emerald', index, source, anchor = false, children }) => {
  const a = accentMap[accent] || accentMap.emerald;
  const secRef = useRef(null);
  const [gate, setGate] = useState({ active: true, enterKey: 0 });
  useEffect(() => {
    const check = () => {
      const el = secRef.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight || 800;
      const v = r.bottom > 40 && r.top < vh - 40; // "is the card actually on screen"
      setGate((prev) => v === prev.active ? prev : (v ? { active: true, enterKey: prev.enterKey + 1 } : { active: false, enterKey: prev.enterKey }));
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    const iv = setInterval(check, 1000); // self-heal in case a scroll event is ever missed
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); clearInterval(iv); };
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
        <RafGate.Provider value={gate}>{children}</RafGate.Provider>
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
  sky:     'bg-sky-500/10 text-sky-300 border-sky-400/20',
  indigo:  'bg-indigo-500/10 text-indigo-300 border-indigo-400/20',
  violet:  'bg-violet-500/10 text-violet-300 border-violet-400/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  amber:   'bg-amber-500/10 text-amber-300 border-amber-400/20',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20',
  rose:    'bg-rose-500/10 text-rose-300 border-rose-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
};
const Chip = ({ children, color = 'emerald' }) => (
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
      style={{
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        maxWidth: width,
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {render(hover)}
    </div>,
    document.body
  );
};

// --- Glossary + Term --------------------------------------------------------

const GLOSS = {
  'objective': 'The function f(x) you are trying to make as small (or large) as possible. Also called the cost, loss, or — when maximizing — the utility/profit. "Optimization" means finding the input that drives it to its best value.',
  'decision variable': 'The quantity you get to choose, written x (often a vector). The optimizer searches over all allowed values of x. In the roastery, x = (kg of espresso, kg of filter).',
  'feasible set': 'The set of all x that satisfy every constraint. Optimization happens inside this set; points outside it are infeasible. For linear constraints it is a polytope (a flat-faced region).',
  'constraint': 'A rule the solution must obey, written g(x) ≤ 0 (inequality) or h(x) = 0 (equality). Each constraint is a "wall" that can block descent. The roastery is constrained by limited beans, roaster-hours, and labor.',
  'global minimum': 'The lowest value of f over the entire feasible set — the true best. Contrast a local minimum, which is only lowest within a neighborhood. Convexity is what makes every local minimum global.',
  'local minimum': 'A point lower than all its near neighbors, but possibly not the lowest overall. Non-convex landscapes have many; gradient methods can get stuck in one.',
  'gradient': 'The vector ∇f of partial derivatives. It points in the direction of steepest ASCENT, and its negative −∇f points steepest downhill. It is perpendicular to the contour (level) lines of f.',
  'Hessian': 'The matrix of second partial derivatives, ∇²f. It encodes curvature: positive-definite means a local bowl (minimum), indefinite means a saddle. Newton’s method uses it to size and steer the step.',
  'directional derivative': 'The rate of change of f as you move in a chosen unit direction u: ∇f·u. It is largest when u aligns with the gradient — which is why the gradient is the steepest direction.',
  'step size': 'How far you move along the chosen direction each iteration, η (the "learning rate" in ML). Too small crawls; too big overshoots and can diverge. Choosing it well is the central practical art of descent.',
  'line search': 'Picking the step size by actually probing the function along the search direction — e.g. backtracking until the Armijo condition (enough decrease) holds. Replaces guessing η with a principled choice.',
  'condition number': 'The ratio κ = λ_max/λ_min of the Hessian’s eigenvalues — how elongated the bowl is. Large κ (an ill-conditioned valley) makes plain gradient descent zigzag slowly; Newton and momentum fix it.',
  'convex set': 'A set where the straight segment between any two members stays entirely inside. Disks and polytopes are convex; a crescent is not. Optimizing over convex sets is tractable.',
  'convex function': 'A function whose graph lies below every chord (f(½a+½b) ≤ ½f(a)+½f(b)). Bowl-shaped, no false bottoms: any local minimum is the global minimum. The single property that separates easy optimization from hard.',
  'strong convexity': 'Convexity with a guaranteed minimum curvature (f − ½m‖x‖² still convex, m>0). It pins the minimum uniquely and gives fast (linear) convergence rates for gradient methods.',
  'stationary point': 'A point where the gradient vanishes, ∇f = 0 — flat in every direction. It can be a minimum, a maximum, or a saddle; the Hessian tells which. "Necessary but not sufficient" for a minimum.',
  'saddle point': 'A stationary point that goes up in some directions and down in others (Hessian indefinite). In high dimensions saddles vastly outnumber local minima and are the real obstacle for descent.',
  'subgradient': 'A generalization of the gradient for functions with kinks (like |x| or ReLU): any slope that stays below the function. At a kink there is a whole set of them (the subdifferential).',
  'proximal operator': 'The map prox_{tg}(v) = argmin_x [ g(x) + 1/(2t)‖x−v‖² ] — a "denoising" step that handles a non-smooth piece g exactly. For g = |·| it is soft-thresholding, the engine behind L1/lasso.',
  'Lagrangian': 'The combined function L(x,λ) = f(x) + Σλᵢgᵢ(x) that folds constraints into the objective with multipliers λ. Stationarity of L reproduces the "gradients balance" optimality condition.',
  'Lagrange multiplier': 'The scalar λ attached to a constraint in the Lagrangian. At the optimum it equals the shadow price — how much the best objective value would improve per unit of relaxing that constraint.',
  'KKT conditions': 'Karush–Kuhn–Tucker: the master first-order optimality test for constrained problems — stationarity, primal feasibility, dual feasibility (λ ≥ 0), and complementary slackness. For convex problems they are sufficient.',
  'complementary slackness': 'A KKT condition: λᵢgᵢ(x) = 0 for every inequality. Either a constraint is active (binding, gᵢ=0) and may carry a price, or it is slack (unused) and its multiplier is zero. "Unused walls are free."',
  'shadow price': 'The marginal value of a resource: how many more dollars of optimal profit you’d get from one more unit of a binding constraint. Equals that constraint’s optimal Lagrange multiplier / dual variable.',
  'dual problem': 'A companion optimization built from the Lagrangian. The dual maximizes a lower bound on the primal minimum; under convexity (and Slater’s condition) the two values meet exactly — strong duality.',
  'weak duality': 'The dual optimum is always ≤ the primal optimum (any feasible dual value bounds the primal). The gap between them is the duality gap.',
  'strong duality': 'When the primal and dual optimal values are equal (zero gap). Holds for convex problems satisfying a constraint qualification like Slater’s condition. It is why shadow prices are exact.',
  'linear program': 'An optimization with a linear objective and linear constraints (LP). Its feasible set is a polytope and the optimum sits at a vertex — the basis for the simplex method.',
  'polytope': 'The flat-faced feasible region carved out by linear inequalities. In 2-D a polygon. LP optima always occur at a corner (vertex) of it.',
  'simplex method': 'Dantzig’s algorithm for LP: start at a feasible vertex and walk along edges to adjacent vertices, each move improving the objective, until no neighbor is better. Exponential worst case, fast in practice.',
  'integer program': 'An optimization where some variables must be whole numbers (ILP). Far harder than its LP relaxation — generally NP-hard — because the feasible points are isolated, not a smooth region.',
  'relaxation': 'A looser problem obtained by dropping hard requirements (e.g. allowing fractional values in an integer program). Its optimum bounds the true one and guides search — the bound in branch-and-bound.',
  'branch and bound': 'Solving an integer program by recursively splitting on a fractional variable (branch) and using the relaxation’s value to prune subtrees that can’t beat the best known solution (bound).',
  'dynamic programming': 'Solving a problem by combining solutions to overlapping subproblems, each solved once and cached. Works when the problem has optimal substructure — Bellman’s principle of optimality.',
  'Bellman equation': 'The recursion at the heart of dynamic programming: the value of a state equals the best immediate payoff plus the value of where you land next. Also the backbone of optimal control and RL.',
  'greedy algorithm': 'A method that makes the locally best choice at each step and never reconsiders. Provably optimal only for special structures (matroids); elsewhere it can be arbitrarily bad.',
  'matroid': 'An abstract structure capturing exactly when the greedy algorithm is guaranteed optimal (e.g. spanning trees). If your problem is a matroid, greedy wins; if not, suspect it.',
  'stochastic gradient descent': 'Gradient descent that uses a cheap, noisy estimate of the gradient (from one sample or a mini-batch) instead of the exact one. Standard for large-scale/ML training; the noise both slows final convergence and helps escape saddles.',
  'momentum': 'Accumulating a velocity from past gradients so the optimizer keeps rolling through small bumps and along narrow valleys, instead of zigzagging. Heavy-ball and Nesterov are the classic forms.',
  'Adam': 'A popular adaptive optimizer that keeps per-coordinate running averages of the gradient (momentum) and its square (to scale each step), with bias correction. Robust default for deep learning.',
  'learning rate': 'The step size η in gradient methods. Its schedule (constant, decaying, warmup) strongly affects whether training converges and how fast.',
  'simulated annealing': 'A global search that sometimes accepts worse points with probability e^(−Δ/T), with the "temperature" T cooled over time. Early randomness explores; late cooling settles into a good basin.',
  'Bayesian optimization': 'Optimizing an expensive black-box function by fitting a cheap surrogate (often a Gaussian process) and choosing the next probe by an acquisition function that balances exploring and exploiting.',
  'acquisition function': 'In Bayesian optimization, the rule (Expected Improvement, UCB, …) that scores candidate points by combining the surrogate’s prediction and its uncertainty — where to sample next.',
  'automatic differentiation': 'Computing exact derivatives of a program by applying the chain rule to its elementary operations. Reverse-mode autodiff gives the full gradient for about the cost of one function evaluation.',
  'backpropagation': 'Reverse-mode automatic differentiation applied to a neural network: one forward pass computes the loss, one backward pass computes the gradient w.r.t. every parameter. The engine of deep learning.',
  'Lipschitz': 'A function has Lipschitz gradient with constant L if the gradient never changes faster than L. Then gradient descent with step η < 2/L is guaranteed to converge — L sets the safe step.',
  'quadratic convergence': "Error roughly squares each step (‖e_{k+1}‖ ≲ ‖e_k‖²), so the number of correct digits doubles per iteration — Newton's behavior near a minimum, far faster than the fixed-fraction shrinkage of gradient descent.",
  'positive definite': 'A symmetric matrix with all eigenvalues > 0 (written ≻ 0). A positive-definite Hessian means the surface curves strictly up in every direction — a genuine bowl, hence a strict local minimum.',
  'critical damping': 'The friction setting at which an oscillator returns to rest fastest without overshooting. The optimal momentum β is the critical-damping choice for the slowest mode of the landscape.',
  'Nesterov acceleration': "Momentum that evaluates the gradient at the look-ahead point x + βv rather than at x. It attains the provably optimal first-order rate (√κ−1)/(√κ+1) for smooth strongly-convex problems.",
  'epigraph': "The set of points on or above a function's graph. A function is convex if and only if its epigraph is a convex set — the geometric definition behind the chord test.",
  "Jensen's inequality": 'For a convex f, f(of a blend of inputs) ≤ the blend of the f-values: f(θx+(1−θ)y) ≤ θf(x)+(1−θ)f(y). Generalized to averages/expectations, f(E[X]) ≤ E[f(X)]. This is the chord-above-graph statement.',
  'strictly convex': 'Convex with the chord strictly above the curve between any two distinct points (Hessian ≻ 0). Guarantees at most one minimizer — no flat valleys, no ties.',
  'subdifferential': 'The set of all subgradients at a point — a single number at smooth points, an interval at kinks. For |x| at 0 it is the whole interval [−1, 1]. Optimality becomes 0 ∈ ∂f.',
  'soft-thresholding': 'The operator sign(v)·max(|v|−t, 0): shrink v toward zero by t and clamp anything within t to exactly zero. It is the proximal operator of the L1 norm and the engine of sparsity (ISTA/Lasso).',
  'Lasso': 'Least-squares with an L1 penalty (λ‖x‖₁). The L1 ball is a diamond whose corners sit on the axes, so the solution snaps weak coefficients to exactly zero — feature selection for free.',
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
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
        href={`#${to}`}
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

/* ---- shared: lightweight multi-line time-series plot ----------------------
   series: [{ pts:[[x,y],...], color, width?, dash?, label?, opacity? }]
   hlines/vlines: [{ at, color, label?, dash? }]   dots: [{ x, y, color, r? }] */
const MultiLinePlot = ({ series, xRange, yRange, xLabel, yLabel, width = 380, height = 240,
                         hlines = [], vlines = [], dots = [], legend = true, yTicks }) => {
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
          <line key={`vl-${i}`} x1={sx(v.at)} y1={padT} x2={sx(v.at)} y2={height - padB} stroke={v.color} strokeOpacity="0.6" strokeDasharray={v.dash ?? '4 3'} strokeWidth="1" />
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

/* ---- shared: the landscape — ContourPlot ----------------------------------
   THE signature visual: an objective f(x,y) as a filled emerald field + contour
   lines, with optional feasible-region shading (linear constraints a·x ≤ b),
   gradient/descent arrows at a point, a descent trajectory, and markers. Reused
   by the gradient, descent, convexity, optimality, Lagrange, KKT and non-convex
   cards — each just composes data. Lower f = darker = the basin you descend to. */

const _mix3 = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t),
];
const makeColormap = (stops) => (t) => {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return _mix3(c0, c1, (t - t0) / (t1 - t0 || 1)); }
  }
  return stops[stops.length - 1][1];
};
// objective field — deep teal/green basin (low) → pale emerald (high)
const CM_OBJ = makeColormap([
  [0.0, [7, 22, 19]], [0.32, [9, 55, 47]], [0.6, [15, 102, 82]], [0.82, [45, 158, 116]], [1.0, [167, 243, 208]],
]);

// marching-squares contour segments (in [0,1]² grid coords, y DOWN) for f=level.
const contourSegs = (sample, NS, level) => {
  const segs = [], frac = (a, b) => a / (a - b);
  for (let j = 0; j < NS - 1; j++) for (let i = 0; i < NS - 1; i++) {
    const a = sample(i, j) - level, b = sample(i + 1, j) - level, c = sample(i + 1, j + 1) - level, d = sample(i, j + 1) - level;
    let idx = 0; if (a > 0) idx |= 1; if (b > 0) idx |= 2; if (c > 0) idx |= 4; if (d > 0) idx |= 8;
    const top = [i + frac(a, b), j], right = [i + 1, j + frac(b, c)], bot = [i + frac(d, c), j + 1], left = [i, j + frac(a, d)];
    const s = (p, q) => segs.push([p[0] / (NS - 1), p[1] / (NS - 1), q[0] / (NS - 1), q[1] / (NS - 1)]);
    switch (idx) { case 1: case 14: s(left, top); break; case 2: case 13: s(top, right); break; case 3: case 12: s(left, right); break; case 4: case 11: s(right, bot); break; case 5: s(left, top); s(right, bot); break; case 6: case 9: s(top, bot); break; case 7: case 8: s(left, bot); break; case 10: s(top, right); s(left, bot); break; }
  }
  return segs;
};

// Sutherland–Hodgman: clip a polygon (array of [x,y]) by the half-plane a·x ≤ b.
const clipHalfplane = (poly, a, b) => {
  if (!poly.length) return poly;
  const out = [], val = (p) => a[0] * p[0] + a[1] * p[1] - b;
  const cut = (p, q) => { const dp = val(p), dq = val(q), t = dp / (dp - dq); return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]; };
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
    const ci = val(cur) <= 1e-9, pi = val(prev) <= 1e-9;
    if (ci) { if (!pi) out.push(cut(prev, cur)); out.push(cur); }
    else if (pi) out.push(cut(prev, cur));
  }
  return out;
};

const ContourPlot = ({
  f, grad, xRange, yRange, width = 360, height = 300, NF = 110, NS = 64,
  nLevels = 11, levels, colormap = CM_OBJ, maximize = false,
  point, showArrows = false, arrowScale = 0.5, trajectory, trajColor = '#a5b4fc', head, paths = [],
  extraVectors = [], constraints = [], feasibleFill = 'rgba(251,191,36,0.12)', feasibleStroke = 'rgba(251,191,36,0.5)',
  markers = [], onPick, xLabel = 'x₁', yLabel = 'x₂', caption, legend,
}) => {
  const uid = React.useId().replace(/:/g, '');
  const [xmin, xmax] = xRange, [ymin, ymax] = yRange;
  const cref = useRef(null);
  // grid-node coords: i→x (left→right), j→y (top→bottom, so j=0 is ymax)
  const gx = (i, n) => xmin + (i / (n - 1)) * (xmax - xmin);
  const gy = (j, n) => ymax - (j / (n - 1)) * (ymax - ymin);
  const sx = (x) => ((x - xmin) / (xmax - xmin)) * width;
  const sy = (y) => ((ymax - y) / (ymax - ymin)) * height;

  const { field, lo, hi } = useMemo(() => {
    const fld = new Float64Array(NF * NF); let lo = Infinity, hi = -Infinity;
    for (let j = 0; j < NF; j++) for (let i = 0; i < NF; i++) {
      const v = f(gx(i, NF), gy(j, NF)); fld[j * NF + i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
    }
    return { field: fld, lo, hi };
  }, [f, NF, xmin, xmax, ymin, ymax]);

  useEffect(() => {
    const cv = cref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); const img = ctx.createImageData(NF, NF); const d = img.data;
    const span = hi - lo < 1e-12 ? 1e-12 : hi - lo;
    for (let k = 0; k < NF * NF; k++) {
      let t = (field[k] - lo) / span; if (maximize) t = 1 - t; // basin (best) → dark either way
      const c = colormap(t); const o = k * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [field, lo, hi, NF, colormap, maximize]);

  const lv = useMemo(() => {
    if (levels) return levels;
    const out = []; for (let i = 1; i <= nLevels; i++) out.push(lo + (hi - lo) * (i / (nLevels + 1)));
    return out;
  }, [levels, lo, hi, nLevels]);

  const sampleGrid = useMemo(() => {
    const g = new Float64Array(NS * NS);
    for (let j = 0; j < NS; j++) for (let i = 0; i < NS; i++) g[j * NS + i] = f(gx(i, NS), gy(j, NS));
    return g;
  }, [f, NS, xmin, xmax, ymin, ymax]);
  const sampleAt = (i, j) => sampleGrid[j * NS + i];

  const contourPaths = useMemo(() => lv.map((L) => {
    const segs = contourSegs(sampleAt, NS, L); let dpath = '';
    for (let s = 0; s < segs.length; s++) { const [x1, y1, x2, y2] = segs[s]; dpath += `M${(x1 * width).toFixed(1)},${(y1 * height).toFixed(1)}L${(x2 * width).toFixed(1)},${(y2 * height).toFixed(1)} `; }
    return dpath.trim();
  }), [lv, sampleGrid, NS, width, height]);

  // feasible region = view rectangle clipped by every constraint half-plane
  const feasPoly = useMemo(() => {
    if (!constraints.length) return null;
    let poly = [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax]];
    for (const c of constraints) poly = clipHalfplane(poly, c.a, c.b);
    return poly;
  }, [constraints, xmin, xmax, ymin, ymax]);

  // gradient (analytic if given, else central finite difference)
  const gradAt = (x, y) => {
    if (grad) return grad(x, y);
    const h = (xmax - xmin) * 1e-4;
    return [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
  };

  const dragRef = useRef(false);
  const pick = (e) => {
    if (!onPick) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    onPick([clamp(xmin + (px / width) * (xmax - xmin), xmin, xmax), clamp(ymax - (py / height) * (ymax - ymin), ymin, ymax)]);
  };
  const onDown = (e) => { if (!onPick) return; dragRef.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} pick(e); };
  const onMove = (e) => { if (dragRef.current) pick(e); };
  const onUp = () => { dragRef.current = false; };

  // an arrow from data point (x,y) along data vector (vx,vy), length in px
  const arrowTo = (x, y, vx, vy, px) => {
    const m = Math.hypot(vx, vy) || 1; const ux = vx / m, uy = vy / m;
    return { x1: sx(x), y1: sy(y), x2: sx(x) + ux * px, y2: sy(y) - uy * px };
  };
  const g0 = point ? gradAt(point.x, point.y) : null;

  return (
    <div>
      {legend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-1.5 text-[10px] font-mono text-neutral-400">{legend}</div>
      )}
      <div className="relative rounded-lg overflow-hidden border border-white/10" style={{ width, height }}>
        <canvas ref={cref} width={NF} height={NF}
          style={{ width, height, display: 'block', imageRendering: 'auto', opacity: 0.95 }} />
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0"
          style={{ cursor: onPick ? 'crosshair' : 'default', touchAction: onPick ? 'none' : 'auto' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <defs>
            <marker id={`cp-up-${uid}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#a5b4fc" /></marker>
            <marker id={`cp-dn-${uid}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#6ee7b7" /></marker>
            <marker id={`cp-tr-${uid}`} markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={trajColor} /></marker>
          </defs>
          {/* contour lines */}
          {contourPaths.map((d, i) => (
            <path key={`c-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={i % 2 === 0 ? 0.9 : 0.55} />
          ))}
          {/* feasible region */}
          {feasPoly && feasPoly.length > 2 && (
            <polygon points={feasPoly.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')}
              fill={feasibleFill} stroke={feasibleStroke} strokeWidth="1.5" />
          )}
          {/* constraint boundary lines + labels */}
          {constraints.map((c, i) => {
            // draw the line a·x = b across the view box
            const [ax, ay] = c.a; const pts = [];
            if (Math.abs(ay) > Math.abs(ax)) { pts.push([xmin, (c.b - ax * xmin) / ay], [xmax, (c.b - ax * xmax) / ay]); }
            else { pts.push([(c.b - ay * ymin) / ax, ymin], [(c.b - ay * ymax) / ax, ymax]); }
            return <line key={`cl-${i}`} x1={sx(pts[0][0])} y1={sy(pts[0][1])} x2={sx(pts[1][0])} y2={sy(pts[1][1])}
              stroke={c.color || feasibleStroke} strokeWidth="1.5" strokeDasharray={c.dash || undefined} opacity="0.9" />;
          })}
          {/* descent trajectory */}
          {trajectory && trajectory.length > 1 && (
            <polyline fill="none" stroke={trajColor} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
              markerEnd={head ? undefined : `url(#cp-tr-${uid})`}
              points={trajectory.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')} />
          )}
          {trajectory && trajectory.map((p, i) => (
            <circle key={`tp-${i}`} cx={sx(p[0])} cy={sy(p[1])} r={1.7} fill={trajColor} opacity="0.7" />
          ))}
          {head && <circle cx={sx(head[0])} cy={sy(head[1])} r={4} fill={trajColor} stroke="#0a0a0a" strokeWidth="1.5" />}
          {/* multiple labelled paths (Newton vs GD, GD vs momentum, full-grad vs SGD …) */}
          {paths.map((pth, pi) => (
            <g key={`p-${pi}`}>
              <polyline fill="none" stroke={pth.color} strokeWidth={pth.width ?? 1.8} strokeDasharray={pth.dash || undefined}
                strokeLinejoin="round" strokeLinecap="round" opacity={pth.opacity ?? 1} markerEnd={pth.arrow ? `url(#cp-tr-${uid})` : undefined}
                points={pth.pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')} />
              {pth.dots && pth.pts.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={1.6} fill={pth.color} opacity="0.65" />)}
              {pth.head && <circle cx={sx(pth.head[0])} cy={sy(pth.head[1])} r={4} fill={pth.color} stroke="#0a0a0a" strokeWidth="1.5" />}
            </g>
          ))}
          {/* gradient + steepest-descent arrows at the point */}
          {point && showArrows && g0 && (() => {
            const len = clamp(Math.hypot(g0[0], g0[1]) * arrowScale * (width / (xmax - xmin)), 14, 64);
            const up = arrowTo(point.x, point.y, g0[0], g0[1], len);
            const dn = arrowTo(point.x, point.y, -g0[0], -g0[1], len);
            return (<g>
              <line x1={dn.x1} y1={dn.y1} x2={dn.x2} y2={dn.y2} stroke="#6ee7b7" strokeWidth="2" markerEnd={`url(#cp-dn-${uid})`} />
              <line x1={up.x1} y1={up.y1} x2={up.x2} y2={up.y2} stroke="#a5b4fc" strokeWidth="2" markerEnd={`url(#cp-up-${uid})`} />
            </g>);
          })()}
          {/* extra vectors from the point (e.g. the directional-derivative u, contour tangent) */}
          {point && extraVectors.map((ev, i) => {
            const a = arrowTo(point.x, point.y, ev.vec[0], ev.vec[1], ev.lenPx ?? 36);
            const mk = ev.marker ? `url(#cp-${ev.marker}-${uid})` : undefined;
            return <line key={`ev-${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={ev.color || '#6ee7b7'}
              strokeWidth={ev.width ?? 2} strokeDasharray={ev.dash || undefined} markerEnd={mk} opacity={ev.opacity ?? 1} />;
          })}
          {point && <circle cx={sx(point.x)} cy={sy(point.y)} r={4} fill="#fde68a" stroke="#0a0a0a" strokeWidth="1.5" />}
          {/* markers (e.g. the optimum) */}
          {markers.map((m, i) => (
            <g key={`m-${i}`}>
              <circle cx={sx(m.x)} cy={sy(m.y)} r={m.r ?? 5} fill={m.color || '#f0abfc'} stroke="#0a0a0a" strokeWidth="1.5" />
              {m.label && <text x={sx(m.x) + 7} y={sy(m.y) - 6} fontSize="9" fill={m.color || '#f0abfc'} fontFamily="ui-monospace, monospace">{m.label}</text>}
            </g>
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-1 text-[9px] font-mono text-neutral-500">
        <span>{xLabel} →</span>
        <span>↑ {yLabel}</span>
      </div>
      {caption && <div className="mt-0.5 text-[11px] text-neutral-500 leading-snug">{caption}</div>}
    </div>
  );
};

// --- Hero -------------------------------------------------------------------

const HeroField = () => {
  // a faint decorative "descent on a contour map" background: concentric blobs
  // with little downhill arrows pointing toward the basin.
  const { rings, arrows } = useMemo(() => {
    const cx = 62, cy = 48;
    const rings = [10, 20, 31, 43, 56];
    const arrows = [];
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 9; j++) {
        const x = (i + 0.5) / 16 * 100, y = (j + 0.5) / 9 * 100;
        const dx = cx - x, dy = cy - y, m = Math.hypot(dx, dy) || 1;
        arrows.push({ x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI });
      }
    }
    return { rings, arrows };
  }, []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      {rings.map((r, i) => (
        <ellipse key={i} cx="62" cy="48" rx={r} ry={r * 0.62} fill="none" stroke="#6ee7b7" strokeWidth="0.12" opacity={0.5 - i * 0.06} />
      ))}
      {arrows.map((a, i) => (
        <line key={i} x1={a.x} y1={a.y}
          x2={a.x + 2.2 * Math.cos((a.ang * Math.PI) / 180)}
          y2={a.y + 2.2 * Math.sin((a.ang * Math.PI) / 180)}
          stroke="#a5b4fc" strokeWidth="0.16" opacity="0.45" />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-indigo-500/5 to-transparent" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <TrendingDown className="w-3.5 h-3.5" /> optimization
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-emerald-100 to-indigo-200 bg-clip-text text-transparent">
          Optimization
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">A zoo of methods, one idea: follow the slope downhill as far as you trust it — until every way down is blocked.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          You are standing on a <span className="text-emerald-300">landscape</span>. The{' '}
          <span className="text-indigo-300">gradient</span> is your compass; the only questions are{' '}
          <em>which way is down</em>, <em>how do I know I’ve hit bottom</em>, and{' '}
          <em>what happens when the landscape fights back</em> — when a{' '}
          <span className="text-amber-300">wall</span> blocks you, the floor goes{' '}
          <span className="text-rose-300">bumpy</span>, or it shatters into discrete points.
          One coffee roaster carries the whole story.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-indigo-300">gradient · Newton · momentum</span>
          <span className="text-emerald-300">convexity · optimality</span>
          <span className="text-amber-300">Lagrange · KKT · duality</span>
          <span className="text-rose-300">simplex · branch &amp; bound · SGD · annealing</span>
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
  { id: 'whatis',     label: 'What is optimization?',      icon: Target },
  { id: 'gradient',   label: 'The gradient is a compass',  icon: Compass, anchor: true },
  { id: 'descent',    label: 'Gradient descent & step size', icon: TrendingDown },
  { id: 'newton',     label: 'Curvature & Newton',         icon: Spline },
  { id: 'momentum',   label: 'Momentum & acceleration',    icon: Rocket },
  { id: 'convexity',  label: 'Convexity — the watershed',  icon: GitFork, anchor: true },
  { id: 'optimality', label: 'Optimality conditions',      icon: Crosshair },
  { id: 'subgrad',    label: 'Non-smooth & subgradients',  icon: Split },
  { id: 'lagrange',   label: 'Lagrange multipliers',       icon: Link2, anchor: true },
  { id: 'kkt',        label: 'The KKT conditions',         icon: ListChecks },
  { id: 'duality',    label: 'Duality & shadow prices',    icon: Scale, anchor: true },
  { id: 'lp',         label: 'Linear programming & simplex', icon: Hexagon },
  { id: 'ilp',        label: 'Integer programming & B&B',  icon: GitBranch },
  { id: 'dp',         label: 'Dynamic programming',        icon: Grid3x3 },
  { id: 'flows',      label: 'Network flows & greedy',     icon: Network },
  { id: 'sgd',        label: 'Stochastic optimization & SGD', icon: Dices },
  { id: 'nonconvex',  label: 'Non-convexity & saddles',    icon: Mountain },
  { id: 'global',     label: 'Global & black-box',         icon: Globe },
  { id: 'anchor',     label: 'The roastery, solved every way', icon: Coffee, anchor: true },
  { id: 'autodiff',   label: 'Where gradients come from',  icon: Workflow },
  { id: 'trails',     label: 'Next trails',                icon: Route },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100' : 'border-transparent text-neutral-400'}`}>
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
   CONTENT CARDS — defined as named stubs in the scaffold; each card's body is
   filled in stage by stage. The default export below never changes, so there is
   never a dangling reference (the causal-inference build lesson).
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="— under construction —">
    <p className="text-neutral-500 text-sm">This card is being built. Content arrives in a later stage.</p>
  </Card>
);

const WhatIsCard = () => {
  const [feasOn, setFeasOn] = useState(false);
  const [optOn, setOptOn] = useState(false);
  const [mode, setMode] = useState('max'); // 'max' profit | 'min' −profit
  const Toggle = ({ on, set, color, children }) => (
    <button onClick={() => set((v) => !v)}
      className={`px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${on ? `${chipPalette[color]}` : 'border-white/10 text-neutral-500 hover:text-neutral-300'}`}>{children}</button>
  );
  return (
    <Card id="whatis" icon={Target} title="What is optimization?" accent="emerald" index={1}
          source="Boyd & Vandenberghe §1" subtitle="The knob, the score, and the fence">
      <Intuition>
        <p>
          Every optimization problem is the same sentence: <em>of all the choices I'm allowed to make, which one
          is best?</em> Make that precise and three nouns fall out — a <strong>knob you can turn</strong> (the{' '}
          <Term>decision variable</Term>), a <strong>score you want to push to its best value</strong> (the{' '}
          <Term>objective</Term>), and a <strong>set of choices that are actually allowed</strong> (the{' '}
          <Term>feasible set</Term>). Picture the score as the height of a landscape over the space of choices:
          optimizing is walking that terrain to its lowest point without stepping outside the fenced-in region.
          The whole explainer is that one picture, returned to again and again as the terrain curves, grows
          walls, blurs, and finally shatters into stepping-stones.
        </p>
      </Intuition>

      <Block>{'\\min_{\\dir{x}\\,\\in\\,\\con{\\mathcal{X}}}\\ \\obj{f(x)} \\qquad \\dir{x^\\star}=\\operatorname*{arg\\,min}_{\\dir{x}\\,\\in\\,\\con{\\mathcal{X}}}\\ \\obj{f(x)}'}</Block>
      <ReadEq>
        over every allowed choice <Eq>{'\\dir{x}'}</Eq> in the feasible set <Eq>{'\\con{\\mathcal{X}}'}</Eq>{' '}
        (the rules), make the objective <Eq>{'\\obj{f}'}</Eq> (the score) as small as possible. The{' '}
        <strong>min</strong> is the best <em>value</em> you reach; the <strong>argmin</strong> is the{' '}
        <em>choice</em> that reaches it — usually the choice is what you care about, not the number.
      </ReadEq>
      <Block>{'\\operatorname*{arg\\,max}_{\\dir{x}}\\ \\obj{f(x)} \\;=\\; \\operatorname*{arg\\,min}_{\\dir{x}}\\ \\bigl(-\\obj{f(x)}\\bigr)'}</Block>
      <ReadEq>
        maximizing is minimizing the flipped score — so we only ever need to teach <em>downhill</em>. The
        roastery maximizes profit; we'll quietly descend <Eq>{'\\obj{f} = -\\text{profit}'}</Eq> and call it the
        same thing.
      </ReadEq>

      <p className="text-sm text-neutral-300">
        Meet the running example. A micro <strong className="text-emerald-300">coffee roaster</strong> chooses
        kilograms per day of two blends — <Eq>{'\\dir{x_1}'}</Eq> Espresso and <Eq>{'\\dir{x_2}'}</Eq> Filter — to
        maximize profit. Here is its profit landscape; switch on the fence and the best feasible mix.
      </p>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Toggle on={feasOn} set={setFeasOn} color="amber">feasible set</Toggle>
          <Toggle on={optOn} set={setOptOn} color="fuchsia">the optimum</Toggle>
          <span className="flex-1" />
          <label className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
            objective
            <select value={mode} onChange={(e) => setMode(e.target.value)}
              className="bg-neutral-800 border border-white/15 rounded px-1.5 py-0.5 text-[10px] text-neutral-200">
              <option value="max">Profit (maximize)</option>
              <option value="min">−Profit (minimize)</option>
            </select>
          </label>
        </div>
        <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
          <ContourPlot
            f={roastProfit} xRange={[0, 30]} yRange={[0, 22]} width={360} height={290}
            maximize={mode === 'min'} nLevels={9}
            constraints={feasOn ? WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color })) : []}
            markers={optOn ? [{ x: X_STAR[0], y: X_STAR[1], label: 'best mix', color: '#f0abfc' }] : []}
            xLabel="x₁ espresso (kg/day)" yLabel="x₂ filter (kg/day)"
            caption={mode === 'max'
              ? 'bright = higher profit; the peak lies far off-window (296 kg espresso)'
              : 'same surface, painted as −profit: maximizing profit = descending into this basin'} />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500">the three nouns</div>
              <div><span className="text-indigo-300 font-mono">x = (x₁, x₂)</span> — the <strong>knob</strong>: kg/day of each blend</div>
              <div><span className="text-emerald-300 font-mono">profit(x)</span> — the <strong>score</strong>: $/day, diminishing returns</div>
              <div><span className="text-amber-300 font-mono">𝒳</span> — the <strong>fence</strong>: beans, roaster, labor limits</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">min vs argmin</div>
              <div className="font-mono text-[13px]">
                <div><span className="text-fuchsia-300">{mode === 'max' ? 'argmax' : 'argmin'} x⋆</span> = (16.36, 7.27) kg <span className="text-neutral-500">— the choice</span></div>
                <div><span className="text-emerald-300">{mode === 'max' ? 'max profit' : 'min (−profit)'}</span> = {mode === 'max' ? '$183.45' : '−$183.45'}/day <span className="text-neutral-500">— the value</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        Three nouns and you've framed any optimization: the <strong>knob</strong> (decision variable <Eq>{'\\dir{x}'}</Eq>),
        the <strong>score</strong> (objective <Eq>{'\\obj{f}'}</Eq>), the <strong>fence</strong> (feasible set{' '}
        <Eq>{'\\con{\\mathcal{X}}'}</Eq>). <Eq>{'\\min'}</Eq> is the best <em>value</em>; <Eq>{'\\arg\\min'}</Eq> is
        the <em>choice</em> that achieves it — and maximizing is just minimizing the negative, so we only ever learn
        to go <em>downhill</em>.
      </MinSchema>

      <Predict question="The roastery's profit keeps rising as you make more espresso (its margin starts at $9/kg). So why isn't the best plan 'make as much espresso as physically possible'?">
        Because the <strong>fence</strong> bites first. The unconstrained peak is at <strong>296 kg</strong> of
        espresso — but that needs <strong>367 kg of green beans a day</strong> and you have 27. The optimum is forced
        onto a <strong>wall</strong>, not the hilltop. Almost every real optimum lives on the boundary of the feasible
        set — which is why constraints (cards 9–11) carry half this explainer.
      </Predict>

      <Misconception
        wrong="Optimization means finding where the derivative is zero."
        right="That finds stationary points of an unconstrained smooth f — but the answer is often on a constraint boundary (where ∇f ≠ 0), or at a kink where no derivative exists, or it's a max/saddle rather than a min."
        because="∇f = 0 is necessary only for an interior minimum of a smooth objective. The roastery's optimum sits on a resource wall with ∇f pointing straight into it — gradient nonzero, yet optimal." />

      <Deeper>
        <p>The general program is</p>
        <Block>{'\\min_{\\dir{x}\\in\\mathbb{R}^n}\\ \\obj{f(x)} \\quad\\text{s.t.}\\quad \\con{g_i(x)\\le 0},\\ \\con{h_j(x)=0}'}</Block>
        <p>
          Four classes, sorted by <em>structure</em>: <strong>unconstrained smooth</strong> (gradient methods,
          cards 3–5); <strong>convex constrained</strong> (KKT-solvable, cards 6–11);{' '}
          <strong>combinatorial / discrete</strong> (<Eq>{'\\con{\\mathcal{X}}'}</Eq> is a finite set of points,
          cards 12–15); <strong>black-box / noisy</strong> (no usable gradient, cards 16–18).
        </p>
        <p>
          The single fact that decides how hard your problem is isn't its size — it's whether the landscape is{' '}
          <Term>convex function</Term> (one bowl, <Term>local minimum</Term> = <Term>global minimum</Term>, card 6)
          or not (many basins, NP-hardness, global search). A million-variable convex problem is routine; a
          forty-variable non-convex integer problem can be hopeless. <strong>Structure, not dimension, is destiny.</strong>
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is min f the same thing as argmin f?', a: 'No. min f is the lowest value (a number — e.g. −$183.45 once negated); argmin f is the input that achieves it (the mix (16.36, 7.27) kg). You almost always want the argmin — the decision — and report the min as the score it earns.' },
        { q: 'We want to maximize profit but the spine keeps saying downhill. Contradiction?', a: 'No — argmax f = argmin(−f). We descend −profit. Every downhill method in this explainer is a profit-maximizer wearing a minus sign.' },
        { q: "What's the difference between a local and a global minimum?", a: 'A local min is lower than everything nearby; a global min is lower than everything period. On a convex bowl they coincide (card 6); on a bumpy landscape (card 17) a method can get trapped in a local min far from best.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="gradient" recap="The gradient ∇f is the compass that tells you which way is downhill on this landscape — the next card.">which way is down?</CrossLink>
        <CrossLink to="convexity" recap="Convexity is the property that makes a local bottom the global bottom — the line between easy and hard optimization.">convex = easy</CrossLink>
        <CrossLink to="anchor" recap="The roastery is solved by every method in the explainer; here it's just introduced as the running example.">the roastery, solved every way</CrossLink>
      </div>
    </Card>
  );
};
const GradientCard = () => {
  const [p, setP] = useState([6, 14]);
  const [ang, setAng] = useState(70);
  const [showUp, setShowUp] = useState(true);
  const [showTan, setShowTan] = useState(true);
  const [scaleByMag, setScaleByMag] = useState(true);
  const g = gradBowl(p[0], p[1]);                       // ∇f (uphill)
  const mag = Math.hypot(g[0], g[1]);
  const u = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
  const Duf = g[0] * u[0] + g[1] * u[1];
  const tan = [-g[1], g[0]];                             // rot90(∇f) = contour tangent
  const lenDown = scaleByMag ? clamp(mag * 15, 12, 58) : 38;
  const extra = [
    { vec: [-g[0], -g[1]], color: '#a5b4fc', marker: 'up', lenPx: lenDown, width: 2.4 }, // −∇f downhill (solid indigo)
  ];
  if (showUp) extra.push({ vec: [g[0], g[1]], color: '#a5b4fc', marker: 'up', dash: '4 3', opacity: 0.45, lenPx: lenDown });
  if (showTan) extra.push({ vec: tan, color: 'rgba(255,255,255,0.55)', dash: '2 3', lenPx: 30, width: 1.4 });
  extra.push({ vec: u, color: '#6ee7b7', marker: 'dn', lenPx: 34, width: 2.4 }); // chosen direction u (emerald)
  const Toggle = ({ on, set, children }) => (
    <button onClick={() => set((v) => !v)}
      className={`px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-colors ${on ? chipPalette.indigo : 'border-white/10 text-neutral-500 hover:text-neutral-300'}`}>{children}</button>
  );
  return (
    <Card id="gradient" icon={Compass} title="The gradient is a compass" accent="indigo" index={2} anchor
          source="Boyd & Vandenberghe §2.1" subtitle="∇f points steepest uphill; −∇f is your downhill compass">
      <Intuition>
        <p>
          Stand anywhere on the landscape and ask: <em>if I take one small step, which direction climbs fastest?</em>{' '}
          That single steepest-uphill direction, packaged as a vector, is the <Term>gradient</Term> <Eq>{'\\dir{\\nabla f}'}</Eq>.
          Its negative is steepest <em>downhill</em> — your compass for descent. Two facts make it a compass and not
          just an arrow: it always points <strong>perpendicular to the contour lines</strong>, and its{' '}
          <strong>length</strong> is the steepness — long arrows on a cliff, vanishing arrows on a plateau. Every
          optimizer here is, at heart, a rule for <em>how far and how often to follow this arrow.</em>
        </p>
      </Intuition>

      <Block>{'\\dir{\\nabla f(x)}=\\Bigl(\\tfrac{\\partial \\obj{f}}{\\partial x_1},\\,\\tfrac{\\partial \\obj{f}}{\\partial x_2}\\Bigr)\\ \\text{points steepest up};\\qquad -\\dir{\\nabla f(x)}\\ \\text{steepest down}'}</Block>
      <Block>{'D_{\\dir{u}}\\,\\obj{f}(x)=\\dir{\\nabla f(x)}\\cdot \\dir{u}=\\lVert\\dir{\\nabla f}\\rVert\\,\\lVert\\dir{u}\\rVert\\cos\\theta'}</Block>
      <ReadEq>
        the slope you <em>feel</em> walking in direction <Eq>{'\\dir{u}'}</Eq> is the gradient <em>projected onto</em>{' '}
        <Eq>{'\\dir{u}'}</Eq> — <Eq>{'\\lVert\\nabla f\\rVert\\cos\\theta'}</Eq>. Biggest straight up the gradient
        (<Eq>{'\\theta=0'}</Eq>), <strong>zero along a contour</strong> (<Eq>{'\\theta=90°'}</Eq> — you stay at the
        same height), most negative straight downhill. That <Eq>{'\\cos\\theta'}</Eq> is <em>why</em> the gradient is
        the steepest direction.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px]">
          <Toggle on={showUp} set={setShowUp}>show uphill ∇f</Toggle>
          <Toggle on={showTan} set={setShowTan}>contour tangent</Toggle>
          <Toggle on={scaleByMag} set={setScaleByMag}>length = |∇f|</Toggle>
          <span className="text-neutral-500 ml-1">drag the point ·</span>
          <span className="inline-flex items-center gap-1 text-neutral-400"><span className="w-3 h-[2px] bg-indigo-300 inline-block" />−∇f down</span>
          <span className="inline-flex items-center gap-1 text-neutral-400"><span className="w-3 h-[2px] bg-emerald-300 inline-block" />your u</span>
        </div>
        <div className="grid md:grid-cols-[380px_1fr] gap-4 items-start">
          <ContourPlot
            f={fBowl} grad={gradBowl} xRange={[0, 30]} yRange={[0, 22]} width={380} height={300}
            nLevels={10} point={{ x: p[0], y: p[1] }} extraVectors={extra} onPick={setP}
            markers={[{ x: X_STAR[0], y: X_STAR[1], label: 'min ∇f=0', color: '#f0abfc' }]}
            xLabel="x₁" yLabel="x₂"
            caption="contours bunch where steep, spread where flat — spacing ∝ 1/|∇f|" />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-1 font-mono text-[12px]">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-sans">at the point</div>
              <div>p = ({p[0].toFixed(1)}, {p[1].toFixed(1)})</div>
              <div className="text-indigo-300">∇f = ({g[0].toFixed(3)}, {g[1].toFixed(3)})</div>
              <div className="text-indigo-300">|∇f| = {mag.toFixed(3)} <span className="text-neutral-500 font-sans">steepness</span></div>
              <div className="text-neutral-400">∇f · tangent = {(g[0] * tan[0] + g[1] * tan[1]).toFixed(3)} <span className="text-neutral-500 font-sans">(⟂)</span></div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                <span>directional derivative</span><span className="text-emerald-300 font-mono">Dᵤf = {Duf.toFixed(3)}</span>
              </div>
              <input type="range" min="0" max="360" step="1" value={ang} onChange={(e) => setAng(+e.target.value)} className="opt-range w-full" />
              <div className="mt-2 relative h-2 rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-300"
                  style={{ left: `${clamp(50 + 50 * (mag > 0 ? Duf / mag : 0), 2, 98)}%`, marginLeft: -4 }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-0.5">
                <span>−|∇f|</span><span>along contour: 0</span><span>+|∇f|</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">sweep <Eq>{'\\dir{u}'}</Eq>: the slope traces a cosine — peak uphill, zero along the contour, trough downhill.</div>
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <Eq>{'\\dir{\\nabla f}'}</Eq> points steepest <strong>uphill</strong>; <Eq>{'-\\dir{\\nabla f}'}</Eq> is your
        downhill compass. It is always <strong>perpendicular to the contour lines</strong>, and its{' '}
        <strong>length is the steepness</strong> — long on cliffs, zero at the bottom. The slope in any direction is
        the projection <Eq>{'\\dir{\\nabla f}\\cdot\\dir{u}=\\lVert\\nabla f\\rVert\\cos\\theta'}</Eq>, which is why
        nothing beats walking straight down the gradient.
      </MinSchema>

      <Predict question="You're on a steep hillside and want to lose altitude as slowly as possible while still going down. Which way do you walk, relative to the gradient arrow?">
        Almost <strong>perpendicular</strong> to it — just barely tilted downhill. Walking exactly along the contour
        keeps altitude constant (<Eq>{'\\nabla f\\cdot u = 0'}</Eq>); tilt a few degrees and you descend at rate{' '}
        <Eq>{'\\lVert\\nabla f\\rVert\\cos\\theta'}</Eq>, tiny near <Eq>{'\\theta=90°'}</Eq>. Steepest descent
        (straight down <Eq>{'-\\nabla f'}</Eq>) is the <em>fastest</em> altitude loss, not the only one — exactly the
        freedom momentum and Newton exploit later.
      </Predict>

      <Misconception
        wrong="The gradient points toward the minimum."
        right="The gradient points in the direction of steepest increase — away from a minimum — and only locally. Following −∇f heads downhill, but it aims at the bottom only on a perfectly round bowl."
        because="On the tilted, elongated contours here (κ=12), −∇f mostly points across the valley rather than at x*; that mismatch is the zigzag that plagues gradient descent (card 3) and that Newton fixes (card 4)." />

      <Worked title="Reading the compass at (6, 14)">
        <p>
          <Eq>{'\\nabla f = Q(p-x^\\star)'}</Eq> with <Eq>{'p-x^\\star=(-10.364,\\,6.727)'}</Eq>. Then{' '}
          <Eq>{'\\nabla f_1 = 0.03(-10.364)+0.01(6.727) = -0.244'}</Eq>,{' '}
          <Eq>{'\\nabla f_2 = 0.01(-10.364)+0.36(6.727) = 2.318'}</Eq>. Downhill is the flip{' '}
          <Eq>{'(+0.244,\\,-2.318)'}</Eq> — <em>mostly straight down in</em> <Eq>{'x_2'}</Eq>, because the bowl is far
          steeper along <Eq>{'x_2'}</Eq> (<Eq>{'q_{22}=0.36'}</Eq>) than <Eq>{'x_1'}</Eq> (<Eq>{'q_{11}=0.03'}</Eq>).
          Steepness <Eq>{'\\lVert\\nabla f\\rVert = 2.331'}</Eq>. Step along the tangent <Eq>{'(-2.318,-0.244)'}</Eq>{' '}
          instead and height doesn't change: <Eq>{'\\nabla f\\cdot\\text{tan} = 0'}</Eq>.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Why perpendicular to the level set?</strong> Move along a contour, where <Eq>{'\\obj{f}'}</Eq> is
          constant. The chain rule gives <Eq>{'\\tfrac{d}{dt}f(x(t)) = \\nabla f\\cdot\\dot x = 0'}</Eq>, and{' '}
          <Eq>{'\\dot x'}</Eq> is the tangent — so <Eq>{'\\nabla f'}</Eq> is the <strong>normal</strong> to the level
          set. <strong>Why steepest?</strong> Among unit <Eq>{'u'}</Eq>, <Eq>{'\\nabla f\\cdot u=\\lVert\\nabla f\\rVert\\cos\\theta'}</Eq>{' '}
          is maximal at <Eq>{'\\theta=0'}</Eq>.
        </p>
        <p>
          <strong>Tradeoff:</strong> steepest <em>locally</em> is not fastest <em>globally</em>. The gradient knows
          only the infinitesimal picture; on anisotropic landscapes (large <Term>condition number</Term> κ) repeatedly
          choosing the locally-steepest direction makes you zigzag, and the <Term>Hessian</Term> (card 4) buys a far
          better direction. The gradient is a perfect compass and a mediocre map.
        </p>
      </Deeper>

      <QA items={[
        { q: "If I'm at a minimum, what does the compass do?", a: 'It vanishes — ∇f = 0, zero-length arrow. That is the first-order optimality condition (card 7). Drag the point to (16.36, 7.27) and the arrows disappear.' },
        { q: 'Does a longer gradient arrow mean I am closer to the minimum?', a: 'Usually the opposite — long arrows mean steep, which is typically far from a flat bottom. As you approach x⋆ the slope flattens and |∇f|→0. (On a non-quadratic surface this is only a rule of thumb.)' },
        { q: 'Why are the contour ellipses tilted, not axis-aligned?', a: 'Because of the cross term q₁₂ = 0.01 in Q — the off-diagonal couples x₁ and x₂. Zero off-diagonal gives axis-aligned ellipses; here the principal axes are the eigenvectors of Q, slightly rotated.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="descent" recap="Gradient descent just repeats x ← x − η∇f: step down the compass, re-read, repeat.">follow the compass: gradient descent</CrossLink>
        <CrossLink to="newton" recap="Newton rescales the step by curvature (the Hessian) so it points at the bottom of an elongated valley instead of zigzagging across it.">fixing the zigzag: Newton</CrossLink>
        <CrossLink to="optimality" recap="∇f = 0 — a vanishing compass — is the first-order test for a stationary point: minimum, maximum, or saddle.">when the arrow vanishes</CrossLink>
      </div>
    </Card>
  );
};
// run gradient descent on the demo bowl; returns clamped draw-path + true distances.
const runGD = (eta, N, lineSearch) => {
  const draw = [[2, 18]]; const dist = [Math.hypot(2 - X_STAR[0], 18 - X_STAR[1])];
  let x = [2, 18], blew = false;
  for (let k = 0; k < N; k++) {
    const grd = gradBowl(x[0], x[1]);
    let step = eta;
    if (lineSearch) {
      step = 6; const fx = fBowl(x[0], x[1]); const gn = grd[0] * grd[0] + grd[1] * grd[1];
      while (step > 1e-6) { const nx = [x[0] - step * grd[0], x[1] - step * grd[1]]; if (fBowl(nx[0], nx[1]) <= fx - 1e-4 * step * gn) break; step *= 0.5; }
    }
    x = [x[0] - step * grd[0], x[1] - step * grd[1]];
    const d = Math.hypot(x[0] - X_STAR[0], x[1] - X_STAR[1]);
    dist.push(d);
    draw.push([clamp(x[0], -25, 55), clamp(x[1], -20, 42)]);
    if (!isFinite(d) || d > 1e4) { blew = true; for (let j = draw.length; j <= N; j++) { draw.push(draw[draw.length - 1]); dist.push(Infinity); } break; }
  }
  return { draw, dist, blew };
};
const itersToTol = (dist, tol = 0.01) => { for (let i = 0; i < dist.length; i++) if (dist[i] < tol) return i; return '>' + (dist.length - 1); };

const DescentCard = () => {
  const [eta, setEta] = useState(2.0);
  const [ls, setLs] = useState(false);
  const N = 60;
  const { draw, dist } = useMemo(() => runGD(eta, N, ls), [eta, ls]);
  const ghosts = useMemo(() => ({ slow: runGD(0.5, N, false).dist, fast: runGD(5.4, N, false).dist }), []);
  const [hi, setHi] = useState(0);
  useEffect(() => { setHi(0); }, [eta, ls]);
  useReplayOnEnter(() => setHi(0));
  const acc = useRef(0);
  useRaf(hi < draw.length - 1, (dt) => { acc.current += dt; if (acc.current > 0.05) { acc.current = 0; setHi((h) => Math.min(draw.length - 1, h + 1)); } });

  const regime = ls ? 'line search' : eta < 2.7754 ? (eta < 1.0 ? 'crawl' : 'monotone') : eta < 5.5509 ? 'oscillating' : 'diverging';
  const regimeColor = ls || regime === 'monotone' || regime === 'crawl' ? '#6ee7b7' : regime === 'oscillating' ? '#fbbf24' : '#fb7185';
  const regChip = ls ? 'emerald' : eta < 2.7754 ? 'emerald' : eta < 5.5509 ? 'amber' : 'rose';
  const toTol = itersToTol(dist);
  const series = [
    { pts: ghosts.slow.map((d, i) => [i, d]), color: 'rgba(255,255,255,0.18)', width: 1, label: 'η=0.5 (crawl)' },
    { pts: ghosts.fast.map((d, i) => [i, d]), color: 'rgba(255,255,255,0.18)', width: 1, dash: '3 3', label: 'η=5.4' },
    { pts: dist.map((d, i) => [i, d]), color: regimeColor, width: 2.2, label: `‖x−x⋆‖ @ η=${ls ? 'auto' : eta.toFixed(1)}` },
  ];
  return (
    <Card id="descent" icon={TrendingDown} title="Gradient descent & step size" accent="emerald" index={3}
          source="Nocedal & Wright §3" subtitle="x ← x − η∇f, and the one judgment call: how big a step?">
      <Intuition>
        <p>
          The compass tells you which way is down; <strong>gradient descent</strong> is the obvious follow-through —
          step that way, re-read the compass, step again. The only knob is the <Term>step size</Term> η (the{' '}
          <Term>learning rate</Term>): <em>how far you trust the downhill direction before re-checking.</em> Too timid
          and you crawl down in a thousand baby steps; too bold and you overshoot the bottom, ricochet up the far wall,
          and — past a hard threshold — blow up entirely. Everything fancier (momentum, Newton, Adam) is a smarter
          answer to this one question: <em>how big a step, in what direction, dare I take?</em>
        </p>
      </Intuition>

      <Block>{'\\dir{x_{k+1}} \\;=\\; \\dir{x_k} \\;-\\; \\eta\\,\\dir{\\nabla f(x_k)}'}</Block>
      <Block>{'0 \\;<\\; \\eta \\;<\\; \\frac{2}{L},\\qquad L=\\lambda_{\\max}(\\nabla^2 \\obj{f}) \\quad\\Longrightarrow\\quad \\dir{x_k}\\to \\dir{x^\\star}'}</Block>
      <ReadEq>
        there's a hard speed limit set by the <em>curvature</em>. <Eq>{'L'}</Eq> is the steepest curvature (largest
        Hessian eigenvalue). Step shorter than <Eq>{'2/L'}</Eq> and you're guaranteed to converge; longer and each
        move overshoots more than the last — you diverge. Below <Eq>{'1/L'}</Eq> you slide in <em>monotonically</em>;
        between <Eq>{'1/L'}</Eq> and <Eq>{'2/L'}</Eq> you converge but <em>oscillate</em>.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500">η</span>
            <input type="range" min="0.1" max="6" step="0.1" value={eta} disabled={ls}
              onChange={(e) => setEta(+e.target.value)} className="opt-range w-44" style={{ opacity: ls ? 0.4 : 1 }} />
            <span className="font-mono text-sm text-neutral-200 tabular-nums w-10">{eta.toFixed(1)}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${chipPalette[regChip]}`}>{regime}</span>
          <button onClick={() => setLs((v) => !v)}
            className={`px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider ${ls ? chipPalette.emerald : 'border-white/10 text-neutral-500 hover:text-neutral-300'}`}>Armijo line search</button>
          <span className="text-[10px] font-mono text-neutral-500 ml-auto">iters to ‖·‖&lt;0.01: <span className="text-neutral-200">{toTol}</span></span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <ContourPlot
            f={fBowl} grad={gradBowl} xRange={[0, 30]} yRange={[0, 22]} width={360} height={280}
            nLevels={10} trajectory={draw.slice(0, hi + 1)} head={draw[hi]} trajColor={regimeColor}
            markers={[{ x: X_STAR[0], y: X_STAR[1], label: 'x⋆', color: '#f0abfc' }]}
            xLabel="x₁" yLabel="x₂" caption={`from x₀=(2,18) · ${ls ? 'line search picks η each step' : `fixed η=${eta.toFixed(1)}`}`} />
          <div>
            <MultiLinePlot series={series} xRange={[0, N]} yRange={[0, 22]} xLabel="iteration k" yLabel="err"
              width={360} height={250} yTicks={[0, 11, 22]} />
            <div className="mt-1 text-[11px] text-neutral-500 leading-snug">
              distance to the optimum vs iteration. Tick marks on the η track:{' '}
              <span className="text-emerald-300">1/L=2.78</span> (monotone edge),{' '}
              <span className="text-emerald-300">η⋆=5.13</span> (fastest),{' '}
              <span className="text-rose-300">2/L=5.55</span> (divergence).
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        Gradient descent is one line — <Eq>{'\\dir{x \\leftarrow x - \\eta\\nabla f}'}</Eq> — and one judgment call,
        the step <Eq>{'\\eta'}</Eq>. Curvature sets a hard limit <Eq>{'\\eta < 2/L'}</Eq> (here 5.55); below{' '}
        <Eq>{'1/L'}</Eq> (2.78) you slide straight in, between them you converge while <em>oscillating</em>, above it
        you <Eq>{'\\inf{\\text{diverge}}'}</Eq>. Even the best fixed step <em>zigzags</em> on an elongated valley.
      </MinSchema>

      <Predict question="If a small step converges and a slightly bigger one converges faster, will making it bigger and bigger keep speeding things up?">
        No — there's a cliff. Speed improves up to <Eq>{'\\eta^\\star = 2/(\\lambda_{\\max}+\\lambda_{\\min}) = 5.13'}</Eq>,
        then <em>degrades</em>, and at <Eq>{'\\eta = 2/L = 5.55'}</Eq> it stops converging at all; beyond that each
        step overshoots more than the last and the iterate explodes. "Bigger is faster" holds only until you cross the
        curvature's speed limit — then it's catastrophic. This is exactly why a learning rate slightly too high in deep
        learning shows up as a loss that spikes to NaN.
      </Predict>

      <Misconception
        wrong="A diverging optimizer just means you started too far from the answer."
        right="Divergence is a step-size failure, not a starting-point failure. Past η = 2/L the method blows up from any start; below it, it converges from any start (for a convex quadratic)."
        because="The error obeys e_{k+1}=(I−ηQ)e_k, so it shrinks iff every |1−ηλᵢ|<1. The worst eigenvalue is λ_max=L, giving η<2/L=5.55 independent of where you start — the start sets only how far, never whether." />

      <Worked title="Where the thresholds come from (this exact bowl)">
        <p>
          The Hessian is <Eq>{'Q'}</Eq>, eigenvalues <Eq>{'\\lambda_{\\max}=0.3603'}</Eq>,{' '}
          <Eq>{'\\lambda_{\\min}=0.0297'}</Eq> (<Eq>{'\\kappa=12.13'}</Eq>). In the eigenbasis each error coordinate
          scales by <Eq>{'(1-\\eta\\lambda)'}</Eq>. <strong>Monotone</strong> needs <Eq>{'1-\\eta\\lambda_{\\max}>0'}</Eq>,
          i.e. <Eq>{'\\eta<1/\\lambda_{\\max}=2.775'}</Eq>. <strong>Convergent</strong> needs{' '}
          <Eq>{'|1-\\eta\\lambda_{\\max}|<1'}</Eq>, i.e. <Eq>{'\\eta<2/\\lambda_{\\max}=5.551'}</Eq>. The fastest step{' '}
          <Eq>{'\\eta^\\star=2/(\\lambda_{\\max}+\\lambda_{\\min})=5.128'}</Eq> leaves contraction{' '}
          <Eq>{'\\rho^\\star=(\\kappa-1)/(\\kappa+1)=0.848'}</Eq> per step — even tuned perfectly, this κ=12 valley loses
          only ~15% of its error each step. That sluggishness is the whole motivation for Newton and momentum.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Gradient descent is forward Euler.</strong> Shrink the step toward zero and{' '}
          <Eq>{'\\dir{x_{k+1}}=\\dir{x_k}-\\eta\\nabla f'}</Eq> becomes the ODE <Eq>{'\\dot x = -\\dir{\\nabla f(x)}'}</Eq> —{' '}
          <em>gradient flow</em>, the continuous downhill trajectory. GD is exactly <strong>forward Euler</strong> with
          time-step <Eq>{'h=\\eta'}</Eq> (verified: identical iterates to machine precision). The step-size limit is
          then a numerical-stability limit — forward Euler on <Eq>{'\\dot x=-Qx'}</Eq> is stable only for{' '}
          <Eq>{'h<2/\\lambda_{\\max}'}</Eq>, the same <Eq>{'2/L'}</Eq>.
        </p>
        <p>
          <strong>Tradeoff:</strong> the continuous flow never overshoots; all the pathology is an artifact of
          discretizing with too large a step. Implicit (backward) Euler is unconditionally stable but needs a solve
          each step — the same explicit-vs-implicit tension you meet in stiff ODEs and PDE time-stepping.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What is L, concretely, and how would I find it for my own problem?', a: 'L is the largest eigenvalue of the Hessian — the steepest curvature anywhere relevant. Here L = λ_max(Q) = 0.360. For a general f it is the Lipschitz constant of the gradient; in practice you estimate it (power iteration) or just use line search and never compute it.' },
        { q: 'If I never want to think about η, what do I do?', a: 'Use line search — e.g. Armijo backtracking: start generous and halve η until f actually decreases enough. It re-picks a safe step every iteration. Toggle it on and watch the path descend without touching the slider.' },
        { q: 'Why does the path zigzag instead of heading straight at the minimum?', a: 'Because the valley is elongated (κ=12). −∇f points across the valley more than along it, so each step overshoots the narrow direction and barely advances the long one. Newton (card 4) reshapes the step; momentum (card 5) cancels the back-and-forth.' },
        { q: 'Is η = 2/L the step I should use?', a: 'No — that is the divergence threshold, the worst safe step. The fastest fixed step is η⋆ = 2/(λ_max+λ_min) = 5.13 here; 2/L = 5.55 is the edge of the cliff. Aim well inside the safe region or use line search.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="gradient" recap="−∇f is the downhill compass; gradient descent just steps along it repeatedly.">the compass we're following</CrossLink>
        <CrossLink to="newton" recap="Newton multiplies the gradient by the inverse Hessian, jumping to the bottom of the local quadratic in one step — no zigzag, no κ-dependence.">kill the zigzag: Newton</CrossLink>
        <CrossLink to="momentum" recap="Momentum accumulates a velocity from past gradients, canceling the cross-valley oscillation.">smooth the zigzag: momentum</CrossLink>
        <CrossLink to="sgd" recap="SGD is gradient descent with a noisy gradient estimate from a mini-batch — same step, blurred compass.">the noisy cousin: SGD</CrossLink>
        <CrossLink to="odes" external recap="ẋ = −∇f is gradient flow; GD is forward-Euler integration of it, and the step-size limit is its numerical-stability limit.">GD = forward Euler on gradient flow</CrossLink>
      </div>
    </Card>
  );
};
const NewtonCard = () => {
  const [eta, setEta] = useState(5.128);
  const [kappa, setKappa] = useState(12.13);
  const [showNewton, setShowNewton] = useState(true);
  const lmax = kappa * LMIN;
  const gB = useMemo(() => gBowlF(lmax), [lmax]);
  const gG = useMemo(() => gGradF(lmax), [lmax]);
  const d0 = Math.hypot(10, 1);
  const gdPath = useMemo(() => {
    const pts = [[10, 1]]; let x = [10, 1];
    for (let k = 0; k < 40; k++) { const g = gG(x[0], x[1]); x = [x[0] - eta * g[0], x[1] - eta * g[1]]; pts.push([clamp(x[0], -14, 14), clamp(x[1], -6, 6)]); if (Math.hypot(x[0], x[1]) > 1e3) { for (let j = pts.length; j <= 40; j++) pts.push(pts[pts.length - 1]); break; } }
    return pts;
  }, [eta, lmax, gG]);
  const gdSteps = useMemo(() => { let x = [10, 1]; for (let k = 1; k <= 400; k++) { const g = gG(x[0], x[1]); x = [x[0] - eta * g[0], x[1] - eta * g[1]]; if (Math.hypot(x[0], x[1]) < 0.01 * d0) return k; if (Math.hypot(x[0], x[1]) > 1e4) return '∞'; } return '>400'; }, [eta, lmax, gG, d0]);
  const [hi, setHi] = useState(0);
  useEffect(() => { setHi(0); }, [eta, kappa]);
  useReplayOnEnter(() => setHi(0));
  const acc = useRef(0);
  useRaf(hi < gdPath.length - 1, (dt) => { acc.current += dt; if (acc.current > 0.07) { acc.current = 0; setHi((h) => Math.min(gdPath.length - 1, h + 1)); } });
  const etaMax = 2 / lmax, diverge = eta > etaMax;
  const paths = [{ pts: gdPath.slice(0, hi + 1), color: diverge ? '#fb7185' : '#a5b4fc', dots: true, head: gdPath[hi], width: 1.8 }];
  if (showNewton) paths.push({ pts: [[10, 1], [0, 0]], color: '#67e8f9', width: 2.4, arrow: true, head: [0, 0] });
  return (
    <Card id="newton" icon={Spline} title="Curvature & Newton's method" accent="cyan" index={4}
          source="Nocedal & Wright Ch. 3" subtitle="The gradient picks the direction; curvature picks the distance">
      <Intuition>
        <p>
          Gradient descent is a hiker who can only feel the slope underfoot — it knows the downhill direction but has
          no idea whether the valley floor is one metre away or a kilometre. <strong>Curvature is the missing
          information.</strong> If you also know how the slope is <em>bending</em> — sharply curved means the bottom is
          near, gently curved means far — you can stop guessing the step and <em>compute</em> it. Newton's method fits
          a parabola to the surface where you stand and walks straight to <em>its</em> bottom. When the real surface{' '}
          <em>is</em> a bowl, the parabola is exact and you land on the true minimum in one move.
        </p>
      </Intuition>

      <Block>{'\\obj{f}(x) \\approx \\obj{f}(x_k) + \\dir{\\nabla f(x_k)}^{\\!\\top}(x-x_k) + \\tfrac12 (x-x_k)^{\\!\\top} \\mathbf{H}(x_k)(x-x_k)'}</Block>
      <Block>{'x_{k+1} = x_k - \\mathbf{H}(x_k)^{-1}\\,\\dir{\\nabla f(x_k)}'}</Block>
      <ReadEq>
        the next point is the current point minus the <strong>inverse Hessian</strong> times the gradient. Gradient
        descent uses <Eq>{'-\\eta\\nabla f'}</Eq> — one scalar step for every direction. Newton replaces that single
        knob with <Eq>{'\\mathbf{H}^{-1}'}</Eq>, a <em>per-direction</em> step that stretches the move long in flat
        directions and short in steep ones. On a quadratic, <Eq>{'\\mathbf{H}'}</Eq> is constant and the model is
        exact — one shot.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-[10px] font-mono text-neutral-400">
          <label className="flex items-center gap-1">η <input type="range" min="0.1" max="6" step="0.05" value={eta} onChange={(e) => setEta(+e.target.value)} className="opt-range w-28" /><span className="tabular-nums w-9 text-neutral-200">{eta.toFixed(2)}</span></label>
          <label className="flex items-center gap-1">κ <input type="range" min="1" max="30" step="0.5" value={kappa} onChange={(e) => setKappa(+e.target.value)} className="opt-range w-28" /><span className="tabular-nums w-9 text-neutral-200">{kappa.toFixed(1)}</span></label>
          <button onClick={() => setShowNewton((v) => !v)} className={`px-2 py-1 rounded border ${showNewton ? chipPalette.cyan : 'border-white/10 text-neutral-500'}`}>Newton step</button>
        </div>
        <div className="grid md:grid-cols-[400px_1fr] gap-4 items-start">
          <ContourPlot f={gB} xRange={[-12, 12]} yRange={[-4, 4]} width={400} height={220} nLevels={7}
            paths={paths} markers={[{ x: 0, y: 0, label: 'min', color: '#f0abfc' }]}
            xLabel="u (flat axis)" yLabel="v (steep axis)"
            caption="same bowl shape as the Roastery's profit hill (κ≈12), recentred so we can watch the methods walk" />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-1 font-mono text-[12px]">
              <div className="flex items-center gap-2"><span className="w-3 h-[2px] bg-cyan-300 inline-block" /><span className="text-cyan-200">Newton:</span> <span className="text-neutral-200">1 step</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-[2px] bg-indigo-300 inline-block" /><span className="text-indigo-200">GD:</span> <span className="text-neutral-200">{gdSteps} steps to 1%</span></div>
              <div className="text-neutral-400">contraction |1−η·λ_max| = {Math.abs(1 - eta * lmax).toFixed(3)}</div>
              {diverge && <div className="text-rose-300">η &gt; 2/λ_max = {etaMax.toFixed(2)} → diverging</div>}
              {Math.abs(kappa - 1) < 0.6 && <div className="text-emerald-300">κ≈1: round bowl — GD reaches it in one step too!</div>}
            </div>
            <div className="text-[11px] text-neutral-500 leading-snug">
              Drag κ to 1 and the bowl becomes circular — GD goes straight in, exactly like Newton. The whole penalty
              is the <strong>anisotropy</strong> κ, not the size of the problem. Crank κ to 30 and watch the zigzag turn brutal.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>The gradient picks the direction; curvature picks the distance.</strong> Newton multiplies the
        gradient by <Eq>{'\\mathbf{H}^{-1}'}</Eq> to get a per-direction step — exact in one move on a quadratic. On
        the Roastery's smooth profit bowl it lands on the true unconstrained max <Eq>{'\\an{x^\\star=(296,11)}'}</Eq>{' '}
        from <em>any</em> start, in a single step.
      </MinSchema>

      <Predict question="A round bowl (κ=1) vs an elongated one (κ=12). On which does plain gradient descent with its best step size reach the bottom faster — and by how much?">
        On the <strong>round</strong> bowl GD reaches the bottom in <strong>one step</strong> — same as Newton —
        because every direction has identical curvature, so a single scalar step is already the perfect per-direction
        step. On the κ=12 bowl GD's error shrinks by only <Eq>{'(\\kappa-1)/(\\kappa+1)=0.848'}</Eq> per step, needing{' '}
        <strong>~28 steps</strong> to do what Newton does in 1. The penalty is entirely the anisotropy κ — not the
        dimension or size of the problem.
      </Predict>

      <Misconception
        wrong="Newton's method always converges faster than gradient descent."
        right="Newton converges in one step on a quadratic and quadratically near any minimum — but each step costs solving an n×n system (≈ n³ work) and forming the n² Hessian; on a million-parameter model that's hopeless, and far from a minimum H⁻¹ can point uphill."
        because="Newton's speed is per-iteration (in steps), not per-second (in compute). At scale we use the cheap gradient and approximate curvature — exactly the story of momentum, quasi-Newton (L-BFGS), and Adam's per-coordinate scaling." />

      <Worked title="Newton lands on the Roastery's true max in one step">
        <p>
          Minimize <Eq>{'g(x)=\\tfrac12 x^\\top Q x - a^\\top x'}</Eq> (negative profit), <Eq>{'\\nabla g=Qx-a'}</Eq>,{' '}
          <Eq>{'\\mathbf{H}=Q'}</Eq> (constant). From <em>any</em> start{' '}
          <Eq>{'x_1 = x_0 - Q^{-1}(Qx_0-a) = Q^{-1}a'}</Eq>. With{' '}
          <Eq>{'Q^{-1}=\\begin{pmatrix}33.64 & -0.93\\\\ -0.93 & 2.80\\end{pmatrix}'}</Eq>,{' '}
          <Eq>{'x^\\star=Q^{-1}a=(296.26,\\,11.21)'}</Eq>. One step, any start, exact. The honest footnote: that point
          needs <Eq>{'1.2(296.26)+11.21=366.7'}</Eq> kg of beans against a budget of 27 — wildly{' '}
          <Eq>{'\\inf{\\text{infeasible}}'}</Eq>, which is precisely why the constraint cards exist.
        </p>
      </Worked>

      <Deeper>
        <p>
          Near a minimum with positive-definite <Term>Hessian</Term>, Newton converges{' '}
          <Term>quadratic convergence</Term>: <Eq>{'\\lVert x_{k+1}-x^\\star\\rVert \\le C\\lVert x_k-x^\\star\\rVert^2'}</Eq> —
          correct digits roughly <em>double</em> each step, versus the fixed-fraction <Eq>{'(\\kappa-1)/(\\kappa+1)'}</Eq>{' '}
          shrinkage of best-step GD. Geometrically <Eq>{'\\mathbf{H}^{-1}'}</Eq> <em>whitens</em> the bowl into a circle
          where every direction has curvature 1.
        </p>
        <p>
          <strong>Tradeoff:</strong> the cost is <Eq>{'O(n^3)'}</Eq> per step to solve <Eq>{'\\mathbf{H}\\Delta=-\\nabla f'}</Eq>{' '}
          and <Eq>{'O(n^2)'}</Eq> memory. Three failure modes: far from a min <Term>positive definite</Term>-ness fails
          and <Eq>{'-\\mathbf{H}^{-1}\\nabla f'}</Eq> may point <em>uphill</em> (fix: line search / trust region); on
          non-quadratics like <strong>Rosenbrock</strong> <Eq>{'(1-x)^2+100(y-x^2)^2'}</Eq> (a separate ill-conditioned
          banana, κ≈2508) the one-step magic is gone — <strong>pure Newton from (−1.2, 1) takes ~6 iterations</strong>{' '}
          (a safeguarded line-search Newton ~8), against ~8,500 for plain GD; and at scale you cannot even form{' '}
          <Eq>{'\\mathbf{H}'}</Eq>. The modern toolkit (L-BFGS, Adam) is "approximate Newton on a budget."
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where does the Hessian come from on a loss with a million parameters?', a: 'You almost never form it. Reverse-mode autodiff (backprop) gives the gradient cheaply; the full n×n Hessian you cannot store. Practitioners use Hessian–vector products (one extra backprop) or skip curvature and approximate it — momentum and Adam. See the autodiff card.' },
        { q: "Newton needs the inverse Hessian — isn't inverting a matrix slow and unstable?", a: 'You never invert it; you solve the system H·Δ = −∇f (Cholesky if H is PD). For n=2 it is trivial; for n=10⁶ it is the bottleneck — the whole reason for quasi-Newton and first-order methods.' },
        { q: "If Newton is one step on a quadratic, why isn't every optimizer Newton?", a: "Because real objectives aren't quadratic and n is huge. The one-step result is the ideal that every cheaper method is trying to approximate." },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="descent" recap="GD uses one scalar step η for all directions; Newton replaces it with H⁻¹.">back to gradient descent</CrossLink>
        <CrossLink to="momentum" recap="If H⁻¹ is too expensive, momentum recovers most of the speedup with only gradients.">on to momentum</CrossLink>
        <CrossLink to="linear-algebra" external recap="Eigenvalues of the Hessian are the curvatures along the principal axes; κ is their ratio.">linear-algebra · eigenvalues & conditioning</CrossLink>
        <CrossLink to="lagrange" recap="Newton's unconstrained max (296, 11) needs 367 kg of beans vs a 27 kg budget — infeasible, which forces the constrained story.">forward to constraints & Lagrange</CrossLink>
      </div>
    </Card>
  );
};
const MomentumCard = () => {
  const [beta, setBeta] = useState(0.307);
  const [alpha, setAlpha] = useState(6.70);
  const [nesterov, setNesterov] = useState(false);
  const N = 40;
  const gdPath = useMemo(() => { const gg = gGradF(LMAX); const pts = [[10, 1]]; let x = [10, 1]; for (let k = 0; k < N; k++) { const g = gg(x[0], x[1]); x = [x[0] - 5.128 * g[0], x[1] - 5.128 * g[1]]; pts.push([clamp(x[0], -14, 14), clamp(x[1], -6, 6)]); } return pts; }, []);
  const momRun = useMemo(() => {
    const gg = gGradF(LMAX); const pts = [[10, 1]]; let x = [10, 1], v = [0, 0]; let blew = false;
    for (let k = 0; k < N; k++) {
      const gp = nesterov ? gg(x[0] + beta * v[0], x[1] + beta * v[1]) : gg(x[0], x[1]);
      v = [beta * v[0] - alpha * gp[0], beta * v[1] - alpha * gp[1]];
      x = [x[0] + v[0], x[1] + v[1]];
      pts.push([clamp(x[0], -14, 14), clamp(x[1], -6, 6)]);
      if (Math.hypot(x[0], x[1]) > 1e3) { blew = true; for (let j = pts.length; j <= N; j++) pts.push(pts[pts.length - 1]); break; }
    }
    return { pts, blew };
  }, [beta, alpha, nesterov]);
  const momSteps = useMemo(() => {
    const gg = gGradF(LMAX); let x = [10, 1], v = [0, 0]; const d0 = Math.hypot(10, 1);
    for (let k = 1; k <= 300; k++) { const gp = nesterov ? gg(x[0] + beta * v[0], x[1] + beta * v[1]) : gg(x[0], x[1]); v = [beta * v[0] - alpha * gp[0], beta * v[1] - alpha * gp[1]]; x = [x[0] + v[0], x[1] + v[1]]; if (Math.hypot(x[0], x[1]) < 0.01 * d0) return k; if (Math.hypot(x[0], x[1]) > 1e4) return '∞'; }
    return '>300';
  }, [beta, alpha, nesterov]);
  const [hi, setHi] = useState(0);
  useEffect(() => { setHi(0); }, [beta, alpha, nesterov]);
  useReplayOnEnter(() => setHi(0));
  const acc = useRef(0);
  useRaf(hi < N, (dt) => { acc.current += dt; if (acc.current > 0.07) { acc.current = 0; setHi((h) => Math.min(N, h + 1)); } });
  const momColor = momRun.blew ? '#fb7185' : '#a5b4fc';
  const paths = [
    { pts: gdPath.slice(0, hi + 1), color: 'rgba(148,163,184,0.7)', dots: true, head: gdPath[Math.min(hi, gdPath.length - 1)], width: 1.5 },
    { pts: momRun.pts.slice(0, hi + 1), color: momColor, dots: true, head: momRun.pts[Math.min(hi, momRun.pts.length - 1)], width: 2.2 },
  ];
  return (
    <Card id="momentum" icon={Rocket} title="Momentum & acceleration" accent="indigo" index={5}
          source="Goh, distill.pub 2017" subtitle="Trade the Hessian for memory: give the iterate inertia">
      <Intuition>
        <p>
          Drop a marble into a long, narrow ravine and it doesn't zigzag wall-to-wall the way gradient descent does —
          it builds speed and rolls down the length of the valley, its sideways wobble averaging out.{' '}
          <strong>Momentum gives the optimizer that same inertia.</strong> Plain GD reacts only to the gradient
          underfoot, so on a stretched bowl it bounces across the steep walls while barely creeping along the flat
          floor. Momentum keeps a running average of recent steps: the back-and-forth cancels, the consistent
          down-the-valley component reinforces, and the marble rolls. The astonishing part — this cheap fix, only
          gradients and no Hessian, recovers most of Newton's speedup.
        </p>
      </Intuition>

      <Block>{'\\dir{v_{k+1}} = \\beta\\,\\dir{v_k} - \\alpha\\,\\dir{\\nabla f(x_k)}, \\qquad x_{k+1} = x_k + \\dir{v_{k+1}}'}</Block>
      <Block>{'\\underbrace{\\tfrac{\\kappa-1}{\\kappa+1} = 0.848}_{\\text{plain GD}} \\;\\longrightarrow\\; \\underbrace{\\tfrac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1} = 0.554}_{\\text{momentum}}'}</Block>
      <ReadEq>
        the velocity <Eq>{'\\dir{v}'}</Eq> is the gradient <em>with memory</em>: keep fraction <Eq>{'\\beta'}</Eq> of
        last step's velocity, then nudge by the new gradient. Across a ravine consecutive gradients point opposite
        ways, so the memory <strong>cancels</strong> them; along the valley they agree and <strong>accumulate</strong>.
        The net effect: the slow <Eq>{'(\\kappa-1)/(\\kappa+1)'}</Eq> rate becomes <Eq>{'(\\sqrt\\kappa-1)/(\\sqrt\\kappa+1)'}</Eq> —{' '}
        <Eq>{'\\kappa'}</Eq> becomes <Eq>{'\\sqrt\\kappa'}</Eq>.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-[10px] font-mono text-neutral-400">
          <label className="flex items-center gap-1">β <input type="range" min="0" max="0.98" step="0.01" value={beta} onChange={(e) => setBeta(+e.target.value)} className="opt-range w-28" /><span className="tabular-nums w-10 text-neutral-200">{beta.toFixed(2)}</span></label>
          <label className="flex items-center gap-1">α <input type="range" min="0.5" max="10" step="0.1" value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="opt-range w-24" /><span className="tabular-nums w-9 text-neutral-200">{alpha.toFixed(1)}</span></label>
          <button onClick={() => setNesterov((v) => !v)} className={`px-2 py-1 rounded border ${nesterov ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>Nesterov look-ahead</button>
        </div>
        <div className="grid md:grid-cols-[400px_1fr] gap-4 items-start">
          <ContourPlot f={gBowlF(LMAX)} xRange={[-12, 12]} yRange={[-4, 4]} width={400} height={220} nLevels={7}
            paths={paths} markers={[{ x: 0, y: 0, label: 'min', color: '#f0abfc' }]}
            xLabel="u (flat axis)" yLabel="v (steep axis)"
            caption="same κ=12 bowl as the Newton card · grey = plain GD · indigo = momentum" />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-1 font-mono text-[12px]">
              <div className="flex items-center gap-2"><span className="w-3 h-[2px] inline-block" style={{ background: 'rgba(148,163,184,0.9)' }} /><span className="text-neutral-300">plain GD:</span> 28 steps</div>
              <div className="flex items-center gap-2"><span className="w-3 h-[2px] bg-indigo-300 inline-block" /><span className="text-indigo-200">{nesterov ? 'Nesterov' : 'momentum'}:</span> {momSteps} steps</div>
              <div className="text-neutral-400">rate: 0.848 → <span className="text-indigo-200">0.554</span></div>
              {momRun.blew && <div className="text-rose-300">β/α too high → overshooting, unstable</div>}
              {Math.abs(beta - 0.307) < 0.03 && !momRun.blew && <div className="text-emerald-300">β≈0.307: critically damped — fastest settle</div>}
            </div>
            <div className="text-[11px] text-neutral-500 leading-snug">
              Momentum is a damped oscillator. Around <strong>β≈0.31</strong> it critically damps the slow mode; push β
              higher and the marble overshoots and <em>rings</em> around the minimum.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>Momentum trades the Hessian for memory.</strong> Averaging past gradients cancels the across-ravine
        zigzag and rolls along the valley, upgrading the rate from <Eq>{'(\\kappa-1)/(\\kappa+1)'}</Eq> to{' '}
        <Eq>{'(\\sqrt\\kappa-1)/(\\sqrt\\kappa+1)'}</Eq>. On the κ=12 bowl that is <strong>28 steps → 11</strong> — and
        the worse the conditioning, the bigger the win, for the cost of one stored velocity vector.
      </MinSchema>

      <Predict question="Plain GD's error shrinks by 0.848 per step here; momentum's by 0.554. Roughly how many fewer steps to cut the error 10×?">
        Cutting error 10× needs <Eq>{'\\log(0.1)/\\log(\\text{rate})'}</Eq> steps: GD ≈ 14, momentum ≈ 3.9 — about a{' '}
        <strong>3.5× speedup</strong>. And it grows with κ: because the rate depends on <Eq>{'\\sqrt\\kappa'}</Eq>{' '}
        instead of <Eq>{'\\kappa'}</Eq>, the worse the conditioning the larger the multiplier. That{' '}
        <Eq>{'\\kappa\\to\\sqrt\\kappa'}</Eq> is the entire content of "acceleration."
      </Predict>

      <Misconception
        wrong="More momentum (bigger β) always converges faster."
        right="There is an optimal β ≈ 0.31 for this bowl; below it you under-use inertia, above it the marble overshoots and rings around the minimum (underdamped), and high enough it destabilizes."
        because="Momentum is a damped oscillator. The optimal β critically damps the slow mode; too much turns useful inertia into oscillation — the same tradeoff you tune on a physical spring, and why learning rate × momentum must be tuned together." />

      <Worked title="Why the zigzag cancels — gradients of opposite sign">
        <p>
          With <Eq>{'\\eta_{\\text{opt}}'}</Eq> the steep coordinate of plain GD flips sign every step:{' '}
          <Eq>{'+1 \\to -0.848 \\to +0.719 \\to -0.609 \\to\\dots'}</Eq> (each <Eq>{'v'}</Eq>-gradient opposes the last),
          so GD bounces. Momentum forms <Eq>{'v_{k+1}=\\beta v_k - \\alpha\\nabla g'}</Eq>: the term{' '}
          <Eq>{'\\beta v_k'}</Eq> carries the previous, opposite-signed step, which <strong>partially cancels</strong>{' '}
          the new across-ravine gradient — the wobble shrinks. Meanwhile the flat coordinate's gradient keeps the same
          sign every step, so <Eq>{'\\beta v_k'}</Eq> <strong>reinforces</strong> it and speed compounds down the
          valley. Cancel the noise, compound the signal.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Momentum is a damped oscillator.</strong> Heavy-ball discretizes the second-order ODE{' '}
          <Eq>{'\\ddot x + \\gamma\\dot x + \\nabla f(x) = 0'}</Eq> — a mass on a spring with friction. The gradient is
          the restoring force; <Eq>{'\\gamma'}</Eq> (set by <Eq>{'\\beta'}</Eq>) is friction. Too little → it
          oscillates forever (overshoot); too much → it crawls (back to over-damped GD);{' '}
          <Term>critical damping</Term> settles fastest, and <Eq>{'\\beta=((\\sqrt\\kappa-1)/(\\sqrt\\kappa+1))^2\\approx0.307'}</Eq>{' '}
          is exactly that for the slow mode. Plain GD discretizes the <em>first</em>-order flow{' '}
          <Eq>{'\\dot x=-\\nabla f'}</Eq> — no inertia.
        </p>
        <p>
          <strong>Tradeoff:</strong> the <Term>Nesterov acceleration</Term> rate <Eq>{'(\\sqrt\\kappa-1)/(\\sqrt\\kappa+1)'}</Eq>{' '}
          is provably <em>optimal</em> for any first-order method on smooth strongly-convex problems — you cannot do
          better with gradients alone. Costs: a second hyperparameter coupled to the step; on noisy gradients inertia
          can amplify noise (one motivation for Adam's adaptive version); and on non-convex landscapes the clean rate
          guarantee is gone, though momentum still helps roll through bumps and saddles.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How does this relate to Adam and the optimizers I actually use?', a: 'Adam = momentum (a running mean of gradients, the β₁ term) plus a cheap per-coordinate curvature estimate (a running mean of squared gradients, the β₂ term that rescales each axis like a diagonal H⁻¹). So Adam is momentum and a stripped-down Newton bolted together. See the SGD/Adam card.' },
        { q: 'Heavy-ball vs Nesterov — does the difference matter in practice?', a: "Both hit the same (√κ−1)/(√κ+1) order. Nesterov's look-ahead damps overshoot and has cleaner guarantees; on smooth convex problems it's the better default. On noisy deep-learning gradients the distinction blurs." },
        { q: 'If momentum is nearly as fast and far cheaper than Newton, why ever use Newton?', a: 'Momentum only recovers the √κ rate; Newton (when affordable) gets quadratic convergence — digits doubling — independent of κ. For small/medium problems where the Hessian is cheap, Newton wins outright.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="newton" recap="Newton fixes anisotropy exactly with H⁻¹; momentum approximates the same fix using only gradients.">back to curvature & Newton</CrossLink>
        <CrossLink to="descent" recap="Momentum adds an inertia term to the plain x ← x − η∇f update.">back to gradient descent</CrossLink>
        <CrossLink to="odes" external recap="Heavy-ball momentum discretizes the damped-oscillator ODE ẍ + γẋ + ∇f = 0; plain GD discretizes ẋ = −∇f.">odes · the damped-oscillator analogy</CrossLink>
        <CrossLink to="sgd" recap="Adam = momentum (running mean of gradients) + a diagonal curvature estimate (running mean of squared gradients).">forward to SGD & Adam</CrossLink>
      </div>
    </Card>
  );
};
const CVX_FNS = {
  sq:  { f: (x) => x * x, label: 'x²', tag: 'convex' },
  neg: { f: (x) => -x * x, label: '−x²', tag: 'concave' },
  wig: { f: (x) => 0.4 * Math.sin(2 * x) + 0.15 * x * x, label: '0.4 sin 2x + 0.15x²', tag: 'non-convex' },
};
const ConvexityCard = () => {
  const [theta, setTheta] = useState(0.5);
  const [fn, setFn] = useState('sq');
  const [ends, setEnds] = useState([-1.5, 3.5]);
  const { f, label, tag } = CVX_FNS[fn];
  const [ax, bx] = ends;
  const xT = theta * ax + (1 - theta) * bx;
  const curveY = f(xT), chordY = theta * f(ax) + (1 - theta) * f(bx);
  const gap = chordY - curveY;
  const W = 360, H = 230, padL = 30, padR = 12, padT = 12, padB = 22;
  const xR = [-2.2, 4.2], yR = [-13, 13];
  const sx = (x) => padL + ((x - xR[0]) / (xR[1] - xR[0])) * (W - padL - padR);
  const sy = (y) => padT + (1 - (y - yR[0]) / (yR[1] - yR[0])) * (H - padT - padB);
  const curvePath = useMemo(() => {
    let d = ''; const n = 120;
    for (let i = 0; i <= n; i++) { const x = xR[0] + (i / n) * (xR[1] - xR[0]); const y = clamp(f(x), yR[0], yR[1]); d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `; }
    return d.trim();
  }, [fn]);
  return (
    <Card id="convexity" icon={GitFork} title="Convexity — the great watershed" accent="emerald" index={6} anchor
          source="Boyd & Vandenberghe §3" subtitle="The one property that decides easy vs. research-problem">
      <Intuition>
        <p>
          Tip marbles onto two surfaces. The first is a single smooth bowl: wherever a marble lands, it rolls to the{' '}
          <em>same</em> bottom. The second is an egg-carton of dips and ridges: where it settles depends entirely on
          where you dropped it. <strong>Convexity is exactly the property that makes the first picture true</strong> —
          every local low point is <em>the</em> low point. It is the watershed splitting optimization into "press solve
          and trust the answer" and "press solve and pray."
        </p>
      </Intuition>

      <Block>{'\\dir{x},\\dir{y}\\in C \\;\\Rightarrow\\; \\theta\\dir{x}+(1-\\theta)\\dir{y}\\in C,\\quad \\forall\\,\\theta\\in[0,1]'}</Block>
      <Block>{'\\obj{f}\\!\\left(\\theta x+(1-\\theta)y\\right)\\;\\le\\;\\theta\\,\\obj{f}(x)+(1-\\theta)\\,\\obj{f}(y)'}</Block>
      <ReadEq>
        pick any two points on the graph and stretch a straight line between them. For a convex function the{' '}
        <em>curve never pokes above that chord</em> — the value at a blended input is at most the same blend of the two
        heights. The gap between chord and curve is how convex it is. (Second-order: <Eq>{'\\nabla^2\\obj{f}\\succeq 0'}</Eq>.)
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          {Object.entries(CVX_FNS).map(([k, v]) => (
            <button key={k} onClick={() => setFn(k)} className={`px-2 py-1 rounded border ${fn === k ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>{v.label}</button>
          ))}
          <button onClick={() => { const r = () => Math.round((Math.random() * 6 - 2.2) * 10) / 10; let a = r(), b = r(); if (Math.abs(a - b) < 1.5) b = a + 2; setEnds([a, b]); }}
            className="px-2 py-1 rounded border border-white/10 text-neutral-400 hover:text-neutral-200">random chord</button>
        </div>
        <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
          <div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-lg border border-white/10 bg-black/20">
              <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.15)" />
              <line x1={sx(0)} y1={padT} x2={sx(0)} y2={H - padB} stroke="rgba(255,255,255,0.15)" />
              <path d={curvePath} fill="none" stroke="#6ee7b7" strokeWidth="2" />
              <line x1={sx(ax)} y1={sy(clamp(f(ax), yR[0], yR[1]))} x2={sx(bx)} y2={sy(clamp(f(bx), yR[0], yR[1]))} stroke="#a5b4fc" strokeWidth="1.6" strokeDasharray="5 3" />
              <circle cx={sx(ax)} cy={sy(clamp(f(ax), yR[0], yR[1]))} r="3" fill="#a5b4fc" />
              <circle cx={sx(bx)} cy={sy(clamp(f(bx), yR[0], yR[1]))} r="3" fill="#a5b4fc" />
              {/* gap bracket */}
              <line x1={sx(xT)} y1={sy(clamp(curveY, yR[0], yR[1]))} x2={sx(xT)} y2={sy(clamp(chordY, yR[0], yR[1]))}
                stroke={gap >= -1e-9 ? '#fbbf24' : '#fb7185'} strokeWidth="3" />
              <circle cx={sx(xT)} cy={sy(clamp(curveY, yR[0], yR[1]))} r="3.5" fill="#6ee7b7" stroke="#0a0a0a" />
              <circle cx={sx(xT)} cy={sy(clamp(chordY, yR[0], yR[1]))} r="3.5" fill="#a5b4fc" stroke="#0a0a0a" />
            </svg>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-neutral-500">θ</span>
              <input type="range" min="0" max="1" step="0.01" value={theta} onChange={(e) => setTheta(+e.target.value)} className="opt-range flex-1" />
              <span className="font-mono text-[11px] text-neutral-300 tabular-nums">{theta.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Stat label="convexity gap" value={gap.toFixed(2)} sub="chord − curve" color={gap >= -1e-9 ? 'text-amber-300' : 'text-rose-300'} />
            <div className={`rounded-lg border px-3 py-2 text-xs ${gap >= -1e-9 ? 'border-emerald-400/25 bg-emerald-400/5 text-emerald-100' : 'border-rose-400/25 bg-rose-400/5 text-rose-100'}`}>
              {gap >= -1e-9
                ? <>chord sits <strong>above</strong> the curve here — consistent with convexity. This is <strong>{label}</strong> ({tag}).</>
                : <>chord dips <strong>below</strong> the curve → <strong>not convex</strong> here. <strong>{label}</strong> is {tag}.</>}
            </div>
            <div className="text-[11px] text-neutral-500 leading-snug">
              For <Eq>{'x^2'}</Eq> the gap is positive for every chord and every θ. For <Eq>{'-x^2'}</Eq> it's always
              negative (concave). For the wiggle, hit <em>random chord</em> a few times — some land a chord that dips
              below, proving non-convexity in one picture.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>Convex = chord never dips below the curve.</strong> The payoff is one line: on a convex function over a
        convex set, <em>any</em> point where you can't go lower is the <Term>global minimum</Term>. No restarts, no luck.
      </MinSchema>

      <Predict question="On a strictly convex function, how many local minima can there be?">
        <strong>Exactly one</strong> (if a minimizer exists). <Term>strictly convex</Term> rules out flat valleys and
        multiple basins — the bottom is a single point. Our minimization anchor (<Eq>{'-\\text{profit}'}</Eq>, Hessian{' '}
        <Eq>{'+Q'}</Eq> SPD) is strictly convex, so its constrained optimum is unique.
      </Predict>

      <Misconception
        wrong="A bowl-shaped-looking loss curve means my problem is convex."
        right="Looks are not a proof; the chord / Hessian test is. A neural-net loss can look smooth in a 1-D slice and still be wildly non-convex in full dimension."
        because="Convexity is a global statement over all pairs of points (or ∇²f ⪰ 0 everywhere). A single 1-D cross-section can hide saddles and extra basins living in the other directions." />

      <Deeper>
        <p>Operations that <strong>preserve</strong> convexity — the reason you can <em>build</em> convex problems with confidence:</p>
        <ol className="list-decimal ml-5 space-y-0.5">
          <li>Nonnegative weighted sum: <Eq>{'\\alpha f + \\beta g'}</Eq> convex for <Eq>{'\\alpha,\\beta\\ge0'}</Eq>.</li>
          <li>Pointwise <strong>max</strong> of convex functions is convex — the <strong>min</strong> is <em>not</em>: min(x²,(x−2)²) dips to 0 at x=0 and x=2 with a cusp peak between, so the chord test fails.</li>
          <li>Affine precomposition <Eq>{'f(Ax+b)'}</Eq>; composition <Eq>{'h(g(x))'}</Eq> with <Eq>{'h'}</Eq> convex nondecreasing, <Eq>{'g'}</Eq> convex.</li>
        </ol>
        <p>
          The roastery cost <Eq>{'-\\text{profit}=\\tfrac12 x^\\top Q x - a^\\top x'}</Eq> is convex because <Eq>{'Q'}</Eq>{' '}
          is SPD; the resource walls are affine ⇒ convex constraints; their intersection (the feasible polygon) is a
          convex set. So the whole constrained problem is convex — which is <em>why</em> every method here lands on the
          same point. <strong>Tradeoff:</strong> insisting on convexity buys a global guarantee but costs modeling
          freedom — fixed setup costs or run-this-line switches (card 13) shatter convexity and you pay in NP-hardness.
          A twice-differentiable <Eq>{'f'}</Eq> is convex <strong>iff</strong> <Eq>{'\\nabla^2 f\\succeq0'}</Eq> everywhere;{' '}
          <Term>strictly convex</Term> if <Eq>{'\\nabla^2 f\\succ0'}</Eq>.
        </p>
      </Deeper>

      <Worked title="Is the roastery's cost convex?">
        <p>
          We minimize <Eq>{'-\\text{profit}'}</Eq>; its Hessian is the constant <Eq>{'Q=[[0.03,0.01],[0.01,0.36]]'}</Eq>.
          Check PD: leading minor <Eq>{'Q_{11}=0.03>0'}</Eq> and <Eq>{'\\det Q = 0.03\\cdot0.36-0.01^2 = 0.0107>0'}</Eq>,
          so <Eq>{'Q\\succ0'}</Eq> (eigenvalues 0.0297 and 0.3603, both positive). Hessian{' '}
          <Term>positive definite</Term> everywhere ⇒ <Eq>{'-\\text{profit}'}</Eq> is <strong>strictly convex</strong> ⇒
          the constrained optimum is unique. The original profit (Hessian <Eq>{'-Q'}</Eq>) is strictly{' '}
          <em>concave</em> — maximizing it is the same easy problem, mirror-imaged.
        </p>
      </Worked>

      <QA items={[
        { q: 'Convex set vs convex function — what is the difference?', a: 'A convex set contains the whole segment between any two members (no dents). A convex function has its region-above-the-graph (epigraph) be a convex set. The feasible region is a set question; the objective is a function question — you need both for an easy problem.' },
        { q: 'Is the feasible region of the roastery convex?', a: 'Yes. Each limit aᵀx ≤ b is a half-plane (convex); x ≥ 0 are half-planes; the feasible polygon is their intersection, and intersections of convex sets are convex.' },
        { q: "Why do we keep saying 'local = global'?", a: "On a convex function over a convex set, if no nearby direction lowers f, then no direction anywhere does — convexity forbids a lower point existing elsewhere. That's the entire reason gradient descent's stopping point can be trusted." },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="optimality" recap="Convexity is what upgrades ∇f=0 from 'flat' to 'global best'.">next: when is flat actually the bottom?</CrossLink>
        <CrossLink to="descent" recap="GD's stopping point is trustworthy only because the bowl is convex.">why GD can be trusted here</CrossLink>
        <CrossLink to="nonconvex" recap="Drop convexity and one bowl becomes an egg-carton of basins.">the egg-carton world</CrossLink>
        <CrossLink to="lp" recap="Linear objective + linear walls is the simplest convex program — the optimum sits at a polytope vertex.">convex + linear = LP</CrossLink>
      </div>
    </Card>
  );
};
const CRIT = {
  min:    { f: (x, y) => x * x + y * y,    grad: (x, y) => [2 * x, 2 * y],   H: [2, 2],  eig: [2, 2],   verdict: 'MINIMUM', chip: 'emerald' },
  saddle: { f: (x, y) => x * x - y * y,    grad: (x, y) => [2 * x, -2 * y],  H: [2, -2], eig: [2, -2],  verdict: 'SADDLE',  chip: 'rose' },
  max:    { f: (x, y) => -(x * x + y * y), grad: (x, y) => [-2 * x, -2 * y], H: [-2, -2],eig: [-2, -2], verdict: 'MAXIMUM', chip: 'amber' },
  trough: { f: (x, y) => x * x,            grad: (x, y) => [2 * x, 0],       H: [2, 0],  eig: [2, 0],   verdict: 'INCONCLUSIVE', chip: 'cyan' },
};
const OptimalityCard = () => {
  const [surf, setSurf] = useState('saddle');
  const [start, setStart] = useState([1.3, 0.7]);
  const [ang, setAng] = useState(35);
  const S = CRIT[surf];
  const path = useMemo(() => {
    const pts = [start.slice()]; let x = start.slice();
    for (let k = 0; k < 70; k++) { const g = S.grad(x[0], x[1]); x = [x[0] - 0.09 * g[0], x[1] - 0.09 * g[1]]; pts.push([clamp(x[0], -3, 3), clamp(x[1], -3, 3)]); if (Math.hypot(x[0], x[1]) > 8) { for (let j = pts.length; j <= 70; j++) pts.push(pts[pts.length - 1]); break; } }
    return pts;
  }, [surf, start]);
  const [hi, setHi] = useState(0);
  useEffect(() => { setHi(0); }, [surf, start]);
  useReplayOnEnter(() => setHi(0));
  const acc = useRef(0);
  useRaf(hi < path.length - 1, (dt) => { acc.current += dt; if (acc.current > 0.05) { acc.current = 0; setHi((h) => Math.min(path.length - 1, h + 1)); } });
  const d = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
  const dHd = S.H[0] * d[0] * d[0] + S.H[1] * d[1] * d[1];
  return (
    <Card id="optimality" icon={Crosshair} title="Optimality conditions" accent="cyan" index={7}
          source="Nocedal & Wright §2" subtitle="Flat is necessary, not sufficient — the Hessian convicts">
      <Intuition>
        <p>
          A ball sitting still tells you the ground is <strong>flat underfoot</strong> — <Eq>{'\\dir{\\nabla f}=0'}</Eq> —
          but flat is not the same as lowest. You could be at the bottom of a bowl, the top of a dome, or straddling a
          mountain pass that falls away on one side while climbing on the other. To tell them apart you must feel the{' '}
          <em>curvature</em> in every direction: bowl-up everywhere is a minimum, bowl-down a maximum, and{' '}
          <strong>mixed</strong> is the famous <Term>saddle point</Term> — the point that dominates high-dimensional
          landscapes and fools naive descent.
        </p>
      </Intuition>

      <Block>{'\\dir{\\nabla f(x^\\star)}=0 \\quad\\text{(stationarity, necessary)}'}</Block>
      <Block>{'\\dir{\\nabla f(x^\\star)}=0 \\;\\text{and}\\; \\nabla^2\\obj{f}(x^\\star)\\succ 0 \\;\\Rightarrow\\; x^\\star \\text{ a strict local min}'}</Block>
      <ReadEq>
        set the gradient to zero to find every <em>candidate</em> — the flat spots. Then read the <Term>Hessian</Term>'s
        eigenvalues like a curvature report card: all positive ⇒ curves up in every direction (a true minimum); a
        single negative eigenvalue ⇒ there's an escape route downhill (saddle or max), so the flat spot is a fake bottom.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          {Object.entries(CRIT).map(([k, v]) => (
            <button key={k} onClick={() => setSurf(k)} className={`px-2 py-1 rounded border ${surf === k ? chipPalette[v.chip] : 'border-white/10 text-neutral-500'}`}>
              {k === 'min' ? 'x²+y²' : k === 'saddle' ? 'x²−y²' : k === 'max' ? '−(x²+y²)' : 'x²'}
            </button>
          ))}
          <button onClick={() => setStart([+(Math.random() * 3 - 1.5).toFixed(2), +(Math.random() * 3 - 1.5).toFixed(2)])}
            className="px-2 py-1 rounded border border-white/10 text-neutral-400 hover:text-neutral-200">drop marble</button>
        </div>
        <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">
          <ContourPlot f={S.f} xRange={[-2, 2]} yRange={[-2, 2]} width={300} height={300} nLevels={9}
            point={{ x: 0, y: 0 }} extraVectors={[{ vec: d, color: dHd >= 0 ? '#6ee7b7' : '#fb7185', marker: dHd >= 0 ? 'dn' : 'tr', lenPx: 40, width: 2.4 }]}
            trajectory={path.slice(0, hi + 1)} head={path[hi]} trajColor="#fde68a"
            markers={[{ x: 0, y: 0, label: '∇f=0', color: '#f0abfc' }]}
            xLabel="x" yLabel="y" caption="yellow = a dropped marble running gradient descent" />
          <div className="space-y-2 text-xs">
            <div className={`rounded-lg border px-3 py-2 ${chipPalette[S.chip]}`}>
              <span className="text-[10px] uppercase tracking-widest opacity-70">verdict</span>
              <div className="text-lg font-semibold">{S.verdict}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-[12px] space-y-1">
              <div className="text-neutral-400">Hessian (constant)</div>
              <div>∇²f = [[{S.H[0]}, 0], [0, {S.H[1]}]]</div>
              <div>eigenvalues: <span className="text-cyan-200">{S.eig[0]}, {S.eig[1]}</span></div>
              <div className="text-neutral-400 pt-1">all &gt;0 → min · all &lt;0 → max · mixed → saddle · a 0 → inconclusive</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                <span>direction dial · dᵀ∇²f d</span>
                <span className={`font-mono ${dHd >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{dHd.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="360" step="1" value={ang} onChange={(e) => setAng(+e.target.value)} className="opt-range w-full" />
              <div className="text-[11px] text-neutral-500 mt-1">
                {surf === 'saddle' ? 'rotate the dial — it flips sign: up along x (+2), down along y (−2). That sign change IS the saddle.' : 'the curvature along the chosen direction; on a min it stays positive, on a max negative.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>Flat is necessary, not sufficient.</strong> <Eq>{'\\dir{\\nabla f}=0'}</Eq> only finds candidates; the
        Hessian's eigenvalues convict. All-positive = minimum, any-negative = there's a way down (saddle or max). In
        high dimensions saddles vastly outnumber minima — flatness alone is a trap.
      </MinSchema>

      <Predict question="In a 50-dimensional landscape, a randomly found stationary point is most likely a…">
        <strong>Saddle.</strong> For a random point to be a minimum <em>all</em> 50 Hessian eigenvalues must be
        positive; one negative makes it a saddle. As dimension grows, the odds of all-same-sign collapse, so saddles
        dominate. This is exactly why SGD's noise (card 17) earns its keep — it jiggles training out of saddles.
      </Predict>

      <Misconception
        wrong="Gradient descent gets permanently stuck at saddle points."
        right="Plain GD slows to a near-crawl near a saddle but generically slides off the unstable direction eventually; what truly stalls it is a long near-zero-gradient plateau or a genuine local min."
        because="A saddle has a strictly-downhill escape direction (the negative-eigenvalue axis). Any tiny component along it grows; the danger is the plateau where ∇f≈0 makes steps microscopic, not permanent capture." />

      <Worked title="Classify the saddle f = x² − y²">
        <p>
          Gradient <Eq>{'\\nabla f=(2x,-2y)'}</Eq>; zero only at <Eq>{'(0,0)'}</Eq>. Hessian <Eq>{'[[2,0],[0,-2]]'}</Eq>,
          eigenvalues <Eq>{'+2'}</Eq> and <Eq>{'-2'}</Eq>. Mixed signs ⇒ <strong>saddle</strong>. Walk along{' '}
          <Eq>{'x'}</Eq> and <Eq>{'f'}</Eq> curves up (<Eq>{'d^\\top H d=+2'}</Eq>); along <Eq>{'y'}</Eq> it curves down
          (<Eq>{'-2'}</Eq>). Flat at the origin, yet neither a min nor a max — drop a marble and it escapes down the{' '}
          <Eq>{'y'}</Eq>-axis.
        </p>
      </Worked>

      <Deeper>
        <p>
          On a <strong>convex</strong> function the second-order test is free: <Eq>{'\\nabla^2 f\\succeq0'}</Eq>{' '}
          everywhere by definition, so the only candidates are minima — <Eq>{'\\nabla f=0'}</Eq> alone certifies a{' '}
          <em>global</em> optimum (the bridge back to convexity). Off the convex menu, <Eq>{'\\nabla f=0'}</Eq> plus{' '}
          <Eq>{'\\nabla^2 f\\succ0'}</Eq> is only <em>sufficient and local</em>. The boundary case — a zero eigenvalue
          (the <Eq>{'x^2'}</Eq>-trough, or <Eq>{'x^4'}</Eq> whose Hessian vanishes at 0) — is genuinely inconclusive;
          you must look at higher-order terms.
        </p>
        <p>
          <strong>Tradeoff:</strong> a full Hessian is <Eq>{'O(n^2)'}</Eq> storage and <Eq>{'O(n^3)'}</Eq> to
          eigendecompose — infeasible for million-parameter models. So training relies on <em>first-order</em> signals
          plus stochastic noise rather than literal eigenvalue checks.
        </p>
      </Deeper>

      <QA items={[
        { q: "Why isn't ∇f=0 enough?", a: "It's satisfied by minima, maxima, and saddles alike — all the flat spots. You need curvature (the Hessian) to tell which kind." },
        { q: 'What does a PSD-but-not-PD Hessian mean?', a: 'A zero eigenvalue: the surface is flat along at least one direction. The second-order test is inconclusive — could be a min (x² along y), or could hide a higher-order saddle. You must inspect further.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="convexity" recap="Convexity makes ∇f=0 sufficient — no Hessian check needed.">why convexity makes this test free</CrossLink>
        <CrossLink to="newton" recap="Newton uses the same Hessian to jump to the model's min — but blindly steps toward saddles too.">Newton uses this Hessian</CrossLink>
        <CrossLink to="lagrange" recap="With constraints, ∇f=0 is replaced by ∇f balanced against the active walls — the Lagrange/KKT condition.">the constrained version: Lagrange</CrossLink>
        <CrossLink to="nonconvex" recap="Saddles dominate high-D landscapes; this is where the trap bites.">saddles in real loss landscapes</CrossLink>
      </div>
    </Card>
  );
};
// project v onto the L1 ball {‖x‖₁ ≤ τ} (Duchi et al. simplex projection).
const projL1 = (v, tau) => {
  const a = v.map(Math.abs);
  if (a[0] + a[1] <= tau) return v.slice();
  const u = a.slice().sort((p, q) => q - p);
  let css = 0, theta = 0;
  for (let i = 0; i < u.length; i++) { css += u[i]; const t = (css - tau) / (i + 1); if (u[i] - t > 0) theta = t; }
  return v.map((x) => Math.sign(x) * Math.max(Math.abs(x) - theta, 0));
};
const SubgradCard = () => {
  const [x0, setX0] = useState(0);
  const [ball, setBall] = useState('l1');
  const [tau, setTau] = useState(1.0);
  const b = [2.2, 0.6];
  const sol = useMemo(() => {
    if (ball === 'l1') return projL1(b, tau);
    const nb = Math.hypot(b[0], b[1]); return nb <= tau ? b.slice() : [b[0] * tau / nb, b[1] * tau / nb];
  }, [ball, tau]);
  const sparse = Math.abs(sol[0]) < 1e-6 || Math.abs(sol[1]) < 1e-6;
  // Panel A geometry — |x| over [-2,2]
  const WA = 300, HA = 200, pA = 26;
  const axS = (x) => pA + ((x + 2) / 4) * (WA - 2 * pA);
  const ayS = (y) => HA - pA - (y / 2.2) * (HA - 2 * pA);
  const atKink = Math.abs(x0) < 0.06;
  // Panel B geometry — [-1.6,1.6]²
  const WB = 280, HB = 280, pB = 16;
  const bxS = (x) => pB + ((x + 1.6) / 3.2) * (WB - 2 * pB);
  const byS = (y) => HB - pB - ((y + 1.6) / 3.2) * (HB - 2 * pB);
  const rSol = Math.hypot(sol[0] - b[0], sol[1] - b[1]);
  return (
    <Card id="subgrad" icon={Split} title="Non-smooth & subgradients" accent="indigo" index={8}
          source="Boyd EE364a; Beck & Teboulle (ISTA)" subtitle="The kink is a feature: it's what makes things sparse">
      <Intuition>
        <p>
          Many of the most useful objectives have <strong>corners</strong> — the absolute value <Eq>{'|x|'}</Eq>, the
          ReLU <Eq>{'\\max(0,x)'}</Eq>, the hinge loss of an SVM. At a corner there's no single tangent line, so the
          gradient is undefined. The fix is generous, not restrictive: instead of one slope, allow the <em>whole fan</em>{' '}
          of lines that stay below the function — the <Term>subdifferential</Term>. Those corners aren't a nuisance to
          smooth away; they're the feature. The corner of the L1 penalty is precisely what snaps weak coefficients to{' '}
          <strong>exactly zero</strong>.
        </p>
      </Intuition>

      <Block>{'\\partial |x| = \\begin{cases} \\{+1\\} & x>0 \\\\ [-1,\\,1] & x=0 \\\\ \\{-1\\} & x<0\\end{cases} \\qquad \\operatorname{prox}_{t|\\cdot|}(v)=\\operatorname{sign}(v)\\,\\max(|v|-t,\\,0)'}</Block>
      <ReadEq>
        a <Term>subgradient</Term> is any slope whose tangent line at <Eq>{'x_0'}</Eq> stays <em>under</em> the whole
        convex function. At a smooth point there's exactly one (the gradient); at a kink there's an interval — for{' '}
        <Eq>{'|x|'}</Eq> at 0, any slope from <Eq>{'-1'}</Eq> to <Eq>{'+1'}</Eq>. Optimality becomes{' '}
        <Eq>{'0\\in\\partial f'}</Eq>: zero is an admissible slope.
      </ReadEq>

      <div className="my-3 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">the kink & its subgradient fan</div>
          <svg width={WA} height={HA} viewBox={`0 0 ${WA} ${HA}`} className="block w-full">
            <line x1={pA} y1={ayS(0)} x2={WA - pA} y2={ayS(0)} stroke="rgba(255,255,255,0.15)" />
            <line x1={axS(0)} y1={pA - 8} x2={axS(0)} y2={HA - pA} stroke="rgba(255,255,255,0.15)" />
            <path d={`M${axS(-2)},${ayS(2)} L${axS(0)},${ayS(0)} L${axS(2)},${ayS(2)}`} fill="none" stroke="#6ee7b7" strokeWidth="2" />
            {atKink
              ? [-1, -0.6, -0.2, 0.2, 0.6, 1].map((m, i) => (
                  <line key={i} x1={axS(-1.6)} y1={ayS(-1.6 * m)} x2={axS(1.6)} y2={ayS(1.6 * m)} stroke="#a5b4fc" strokeWidth="1" opacity="0.4" />
                ))
              : (() => { const m = Math.sign(x0); return <line x1={axS(x0 - 1.6)} y1={ayS(Math.abs(x0) + m * (-1.6))} x2={axS(x0 + 1.6)} y2={ayS(Math.abs(x0) + m * (1.6))} stroke="#a5b4fc" strokeWidth="1.6" />; })()}
            <circle cx={axS(x0)} cy={ayS(Math.abs(x0))} r="4" fill="#fde68a" stroke="#0a0a0a" strokeWidth="1.5" />
          </svg>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-neutral-500">x₀</span>
            <input type="range" min="-2" max="2" step="0.02" value={x0} onChange={(e) => setX0(+e.target.value)} className="opt-range flex-1" />
            <span className={`font-mono text-[11px] ${atKink ? 'text-indigo-300' : 'text-neutral-300'}`}>{atKink ? '∂|x|=[−1,1]' : `slope ${Math.sign(x0) > 0 ? '+1' : '−1'}`}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">ball geometry → sparsity</div>
            <div className="flex gap-1">
              <button onClick={() => setBall('l1')} className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${ball === 'l1' ? chipPalette.amber : 'border-white/10 text-neutral-500'}`}>L1</button>
              <button onClick={() => setBall('l2')} className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${ball === 'l2' ? chipPalette.indigo : 'border-white/10 text-neutral-500'}`}>L2</button>
            </div>
          </div>
          <svg width={WB} height={HB} viewBox={`0 0 ${WB} ${HB}`} className="block w-full">
            <line x1={pB} y1={byS(0)} x2={WB - pB} y2={byS(0)} stroke="rgba(255,255,255,0.12)" />
            <line x1={bxS(0)} y1={pB} x2={bxS(0)} y2={HB - pB} stroke="rgba(255,255,255,0.12)" />
            {/* objective contour (first touch) */}
            <circle cx={bxS(b[0])} cy={byS(b[1])} r={Math.abs(bxS(b[0]) - bxS(b[0] - rSol))} fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            {ball === 'l1'
              ? <polygon points={`${bxS(tau)},${byS(0)} ${bxS(0)},${byS(tau)} ${bxS(-tau)},${byS(0)} ${bxS(0)},${byS(-tau)}`} fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="1.6" />
              : <circle cx={bxS(0)} cy={byS(0)} r={Math.abs(bxS(tau) - bxS(0))} fill="rgba(165,180,252,0.10)" stroke="#a5b4fc" strokeWidth="1.6" />}
            <line x1={bxS(sol[0])} y1={byS(sol[1])} x2={bxS(Math.min(b[0], 1.5))} y2={byS(b[1])} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 3" />
            <circle cx={bxS(sol[0])} cy={byS(sol[1])} r="5" fill={sparse ? '#fbbf24' : '#a5b4fc'} stroke="#0a0a0a" strokeWidth="1.5" />
            <text x={bxS(1.5)} y={byS(b[1]) - 4} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="ui-monospace">→ target b</text>
          </svg>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-neutral-500">τ</span>
            <input type="range" min="0.3" max="1.4" step="0.05" value={tau} onChange={(e) => setTau(+e.target.value)} className="opt-range flex-1" />
            <span className="font-mono text-[11px] text-neutral-300">({sol[0].toFixed(2)}, {sol[1].toFixed(2)})</span>
            {sparse && <span className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-amber-500/10 text-amber-300 border-amber-400/20">sparse!</span>}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-neutral-500 leading-snug -mt-1">
        With <Eq>{'b=(2.2,0.6)'}</Eq>, <Eq>{'\\tau=1'}</Eq>: the <strong className="text-amber-300">L1</strong> diamond's
        corner gives <Eq>{'(1,0)'}</Eq> — <Eq>{'x_2'}</Eq> snapped to <em>exactly</em> zero; the{' '}
        <strong className="text-indigo-300">L2</strong> disk gives <Eq>{'(0.96,0.26)'}</Eq> — both alive. The corner does the work.
      </p>

      <MinSchema>
        <strong>A corner is a set of slopes, and that's a feature.</strong> At a kink the gradient becomes the{' '}
        <Term>subdifferential</Term> — an interval of supporting slopes — and optimality is <Eq>{'0\\in\\partial f'}</Eq>.
        The L1 corner forces coordinates to <em>exactly</em> zero; <Term>soft-thresholding</Term>{' '}
        <Eq>{'\\operatorname{sign}(v)\\max(|v|-t,0)'}</Eq> is the one-line operator that performs the shrink.
      </MinSchema>

      <Predict question="Lasso (L1) and ridge (L2) both shrink coefficients. Which produces exactly-zero coefficients?">
        <strong>L1 (<Term>Lasso</Term>).</strong> Its constraint ball is a diamond whose sharp corners sit <em>on the
        axes</em> — the objective contour almost always first touches a corner, zeroing a coordinate. The L2 ball is a
        smooth sphere: contours touch a face, shrinking every coefficient but zeroing none. Here:{' '}
        L1 → <Eq>{'(1,0)'}</Eq>; L2 → <Eq>{'(0.96,0.26)'}</Eq>.
      </Predict>

      <Misconception
        wrong="A non-differentiable objective like |x| can't be optimized by gradient methods."
        right="It can — use any subgradient, or better, a proximal/projected step that handles the kink in closed form."
        because="The subdifferential supplies a valid descent direction everywhere, and the prox operator solves the non-smooth piece exactly each iteration. ISTA = a smooth gradient step followed by a soft-threshold; it converges fine despite the kink." />

      <Worked title="One ISTA step on a 1-D lasso">
        <p>
          Minimize <Eq>{'\\tfrac12(x-3)^2 + 1\\cdot|x|'}</Eq>. Smooth-part gradient at <Eq>{'x'}</Eq> is{' '}
          <Eq>{'(x-3)'}</Eq>. Step <Eq>{'t=1'}</Eq> from <Eq>{'x=0'}</Eq>: gradient step gives{' '}
          <Eq>{'0-(0-3)=3'}</Eq>. Apply prox: <Eq>{'\\operatorname{prox}_1(3)=\\operatorname{sign}(3)\\max(3-1,0)=2'}</Eq>.
          So <Eq>{'x=2'}</Eq> — the exact minimizer. The L1 toll of 1 pulled the smooth answer 3 down by exactly{' '}
          <Eq>{'t\\lambda=1'}</Eq>. Had the target been 0.4, the prox would return <strong>0</strong> — shrunk all the way to sparse.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Proximal-gradient (ISTA).</strong> Split <Eq>{'\\min f(x)+g(x)'}</Eq> into smooth <Eq>{'f'}</Eq>{' '}
          (gradient step) plus non-smooth <Eq>{'g'}</Eq> (its <Term>proximal operator</Term>):{' '}
          <Eq>{'x^+ = \\operatorname{prox}_{t g}\\!\\big(x - t\\nabla f(x)\\big)'}</Eq>. For <Eq>{'g=\\lambda\\lVert x\\rVert_1'}</Eq>{' '}
          the prox is coordinate-wise soft-thresholding (verified <Eq>{'\\operatorname{prox}_2(5)=3'}</Eq>,{' '}
          <Eq>{'\\operatorname{prox}_{0.5}(1.2)=0.7'}</Eq>): shrink toward zero, then clamp. The threshold <Eq>{'t\\lambda'}</Eq>{' '}
          is a <em>toll</em> — only features earning more than the toll stay nonzero; bigger <Eq>{'\\lambda'}</Eq> → sparser, at the cost of bias.
        </p>
        <p>
          <strong>Why not just smooth the kink</strong> (use <Eq>{'\\sqrt{x^2+\\epsilon}'}</Eq>)? You'd restore
          differentiability but <em>lose exact zeros</em> — coefficients hover near but never <em>at</em> zero,
          defeating feature selection. The corner is doing real work.
        </p>
      </Deeper>

      <QA items={[
        { q: "What's the subgradient at a smooth point?", a: 'Just the ordinary gradient — the subdifferential is the singleton {∇f}. Subgradients only fan out at kinks.' },
        { q: "Why does L1 zero things but L2 doesn't?", a: "Geometry of the constraint ball. L1's diamond has corners on the axes (a coordinate is zero there); contours touch corners first. L2's sphere is smooth — no corners, no exact zeros." },
        { q: 'Is 0 ∈ ∂f(x) the optimality condition?', a: 'Yes — the non-smooth generalization of ∇f = 0. It says some supporting line at x is flat, so no direction strictly lowers f. For convex f it certifies a global minimum.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="optimality" recap="0 ∈ ∂f generalizes ∇f = 0 to corners.">the smooth version of this test</CrossLink>
        <CrossLink to="descent" recap="ISTA = a gradient step then a soft-threshold; same descent idea, kink handled.">proximal step = GD + a clamp</CrossLink>
        <CrossLink to="convexity" recap="Subgradients exist and certify global optima only because |x| is convex.">why subgradients certify the global min</CrossLink>
        <CrossLink to="machine-learning" external recap="L1 sparsity is feature selection; the corner does the work.">where sparsity shows up: Lasso</CrossLink>
      </div>
    </Card>
  );
};
const LagrangeCard = () => {
  const [x1, setX1] = useState(20);
  const [allWalls, setAllWalls] = useState(false);
  const x2 = clamp(40 - 2 * x1, 0, 40);            // on the roaster wall 0.2x₁+0.1x₂=4
  const g = roastGrad(x1, x2);
  const n = [0.2, 0.1], nn = Math.hypot(n[0], n[1]);
  const gdotn = (g[0] * n[0] + g[1] * n[1]) / (nn * nn);
  const tangential = [g[0] - gdotn * n[0], g[1] - gdotn * n[1]];
  const tanMag = Math.hypot(tangential[0], tangential[1]);
  const mu = g[0] / n[0];
  const snapRef = useRef(null);
  const snap = () => { let v = x1; clearInterval(snapRef.current); snapRef.current = setInterval(() => { v += (16.364 - v) * 0.25; if (Math.abs(v - 16.364) < 0.01) { v = 16.364; clearInterval(snapRef.current); } setX1(v); }, 30); };
  useEffect(() => () => clearInterval(snapRef.current), []);
  const walls = (allWalls ? WALLS : WALLS.filter((w) => w.key === 'roaster')).map((w) => ({ a: w.a, b: w.b, color: w.color, dash: w.key === 'roaster' ? undefined : '4 3' }));
  const atOpt = Math.abs(x1 - 16.364) < 0.05;
  return (
    <Card id="lagrange" icon={Link2} title="Constraints & Lagrange multipliers" accent="amber" index={9} anchor
          source="Boyd & Vandenberghe §5" subtitle="The wall that pushes back — and its price">
      <Intuition>
        <p>
          Without limits, the Roastery would roast 296 kg of Espresso a day — the unconstrained profit peak. But you
          have only 27 kg of green beans and 4 roaster-hours. So you slide uphill on the profit surface until you hit a
          wall and can climb no further <em>along it</em>. There something clean happens: the direction you still want
          to go (the profit gradient) points straight <strong>into</strong> the wall, opposed by the wall's normal.
          Your urge to climb is exactly canceled by the wall's push-back. The number measuring how hard the wall pushes
          is the <Term>Lagrange multiplier</Term> — and it turns out to be a price.
        </p>
      </Intuition>

      <Block>{'\\nabla \\obj{f(x^\\star)} \\;=\\; \\con{\\lambda}\\,\\nabla \\con{g(x^\\star)} \\qquad \\mathcal{L}(x,\\con{\\lambda}) = \\obj{f(x)} - \\con{\\lambda}\\,(\\con{g(x)} - \\con{b})'}</Block>
      <ReadEq>
        at the best feasible point, the profit gradient (indigo) is a scalar multiple of the constraint gradient
        (amber) — they're <strong>parallel</strong>. That scalar is <Eq>{'\\con{\\lambda}'}</Eq>. Read it as: the
        profit contour is <em>tangent</em> to the wall. If they weren't parallel you could still slide along the wall
        to a higher contour.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={snap} className="px-2 py-1 rounded border border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200">snap to optimum</button>
          <button onClick={() => setAllWalls((v) => !v)} className={`px-2 py-1 rounded border ${allWalls ? chipPalette.amber : 'border-white/10 text-neutral-500'}`}>{allWalls ? 'all 3 walls' : 'roaster only'}</button>
          {atOpt && <span className="px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-400/20">TANGENT · ∇f = 42.18 ∇g</span>}
        </div>
        <div className="grid md:grid-cols-[340px_1fr] gap-4 items-start">
          <ContourPlot f={roastProfit} grad={roastGrad} xRange={[0, 24]} yRange={[0, 24]} width={340} height={300} nLevels={9}
            constraints={walls} point={{ x: x1, y: x2 }}
            extraVectors={[
              { vec: g, color: '#a5b4fc', marker: 'up', lenPx: clamp(Math.hypot(g[0], g[1]) * 5, 18, 56), width: 2.4 },
              { vec: n, color: '#fbbf24', marker: 'dn', lenPx: 34, width: 2.2 },
            ]}
            markers={[{ x: 16.364, y: 7.273, label: 'x⋆', color: '#f0abfc' }]}
            xLabel="x₁ espresso" yLabel="x₂ filter" caption="indigo = ∇profit · amber = roaster-wall normal ∇g · slide to the kiss" />
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500">slide along roaster wall</span>
            </div>
            <input type="range" min="8" max="20" step="0.05" value={x1} onChange={(e) => setX1(+e.target.value)} className="opt-range w-full" />
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-[12px] space-y-1">
              <div>mix = ({x1.toFixed(2)}, {x2.toFixed(2)}) kg</div>
              <div className="text-emerald-300">profit = ${roastProfit(x1, x2).toFixed(2)}/day</div>
              <div className={tanMag < 0.05 ? 'text-emerald-300' : 'text-rose-300'}>‖∇f along wall‖ = {tanMag.toFixed(3)} {tanMag < 0.05 ? '→ tangent!' : '→ still climbable'}</div>
              <div className="text-amber-300">μ = |∇f|/|∇g| ratio → {atOpt ? '42.18' : (mu).toFixed(1)}</div>
            </div>
            <div className="text-[11px] text-neutral-500 leading-snug">
              As you slide toward <Eq>{'x^\\star'}</Eq> the indigo arrow rotates until it's parallel to the amber
              normal — the tangential ("still-climbable") component drops to zero. That alignment <em>is</em> optimality.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        At a constrained optimum, <strong>profit's gradient and the active wall's normal are parallel.</strong> The
        proportionality constant <Eq>{'\\con{\\lambda}'}</Eq> is the multiplier — geometrically "how steeply profit
        still wants to climb, per unit of wall," and (next card) economically the <Term>shadow price</Term> of that resource.
      </MinSchema>

      <Predict question="The unconstrained profit peak is at (296, 11). Once we add the 27 kg bean limit and 4 roaster-hour limit, where does the optimum land — interior, or pinned on a wall?">
        <strong>Pinned on the roaster wall</strong>, at (16.36, 7.27), profit $183.45/day — a ~98% cut from the runaway
        unconstrained mix, which would need 367 kg of beans (13× your supply). The interior peak is wildly infeasible,
        so the optimum is forced to a boundary. That tangency is exactly what Lagrange multipliers describe.
      </Predict>

      <Misconception
        wrong="The multiplier λ just tells you whether a constraint is active (1) or not (0)."
        right="λ is a continuous magnitude — μ_roaster = 42.18 here. It measures how hard the wall pushes: how much profit you'd gain per unit of relaxed limit."
        because="λ scales the gradient (∇f = λ∇g). A barely-binding wall has small λ; a wall throttling a steep profit climb has large λ. Active/inactive is a separate yes/no fact (card 10's complementary slackness)." />

      <Worked title="Reading μ off the gradient">
        <p>
          At <Eq>{'x^\\star=(16.364,7.273)'}</Eq>: <Eq>{'\\nabla f=(9-0.03\\cdot16.36-0.01\\cdot7.27,\\ 7-0.36\\cdot7.27-0.01\\cdot16.36)=(8.4364,4.2182)'}</Eq>.
          The roaster normal is <Eq>{'\\nabla g=(0.20,0.10)'}</Eq>. Solve <Eq>{'\\nabla f=\\mu\\nabla g'}</Eq>
          component-wise: <Eq>{'\\mu = 8.4364/0.20 = 42.18'}</Eq> <strong>and</strong> <Eq>{'4.2182/0.10 = 42.18'}</Eq> —
          the same value from both components, which is exactly the consistency check that the point is a genuine
          tangency. If the ratios disagreed, the gradients wouldn't be parallel and you could still climb.
        </p>
      </Worked>

      <Deeper>
        <p>
          Form <Eq>{'\\mathcal{L}(x,\\lambda)=f(x)-\\lambda(g(x)-b)'}</Eq>, set <Eq>{'\\nabla_x\\mathcal{L}=0'}</Eq>{' '}
          and <Eq>{'\\partial\\mathcal{L}/\\partial\\lambda=0'}</Eq>. The first gives <Eq>{'\\nabla f=\\lambda\\nabla g'}</Eq>;
          the second just restates <Eq>{'g(x)=b'}</Eq>. <strong>Why parallel?</strong> Along the wall, any feasible move
          is tangent to the constraint (⟂ to ∇g). At an optimum f can't increase along any feasible move, so the
          component of ∇f tangent to the wall must vanish — ∇f has only a normal component — ∇f ∥ ∇g.
        </p>
        <p>
          <strong>Tradeoff:</strong> this is the <em>equality</em> story (you sit exactly on the wall). Real limits are
          inequalities (≤) — you might not touch a wall at all. Promoting = to ≤ forces the sign condition λ≥0 and the
          complementary-slackness bookkeeping of the next card. The unconstrained peak <Eq>{'Q^{-1}a=(296,11)'}</Eq> is
          the true global max only because Q is SPD — the same convexity guarantees this constrained tangency is global.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is the optimum on the roaster wall and not the beans wall?', a: 'At the concave optimum the roaster constraint is the only one binding — beans has 0.09 kg of slack and labor has 1.27 h of slack. The profit surface pushes the mix into the roaster wall first. (In the LP version, beans AND roaster both bind — card 12.)' },
        { q: 'What does a negative λ mean?', a: "For a ≤ constraint at a maximization optimum, λ must be ≥ 0 — relaxing a binding limit can only help. A negative value would say 'I'd pay to have less of this resource,' which can't happen at an optimum; it means you misidentified which side is feasible." },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="gradient" recap="∇f points steepest-uphill and ⟂ to contour lines — which is why the tangency picture works.">the gradient is a compass</CrossLink>
        <CrossLink to="kkt" recap="Inequality walls add λ≥0 and complementary slackness.">the KKT conditions</CrossLink>
        <CrossLink to="convexity" recap="For a convex problem a local tangency optimum is the global one.">convexity — the watershed</CrossLink>
      </div>
    </Card>
  );
};
const KKTCard = () => {
  const [mode, setMode] = useState('concave');
  const opt = mode === 'concave' ? [16.364, 7.273] : [16.25, 7.5];
  const muOf = mode === 'concave' ? { beans: 0, roaster: 42.18, labor: 0 } : { beans: 6.25, roaster: 7.5, labor: 0 };
  const [pt, setPt] = useState(opt);
  useEffect(() => { setPt(opt); }, [mode]);
  const atOpt = Math.hypot(pt[0] - opt[0], pt[1] - opt[1]) < 0.12;
  const fLin = (x1, x2) => 9 * x1 + 7 * x2;
  const surf = mode === 'concave' ? roastProfit : fLin;
  const rows = WALLS.map((w) => {
    const usage = w.a[0] * pt[0] + w.a[1] * pt[1];
    const slack = w.b - usage;
    const mu = atOpt ? muOf[w.key] : null;
    return { ...w, usage, slack, mu };
  });
  const feasible = rows.every((r) => r.slack >= -1e-6) && pt[0] >= -1e-6 && pt[1] >= -1e-6;
  return (
    <Card id="kkt" icon={ListChecks} title="The KKT conditions" accent="amber" index={10}
          source="Boyd & Vandenberghe §5.5" subtitle="The master optimality test — and 'idle capacity is free'">
      <Intuition>
        <p>
          Real limits are inequalities: <Eq>{'\\text{beans}\\le27'}</Eq>, not <Eq>{'=27'}</Eq>. So before you optimize
          you don't know <em>which</em> walls you'll touch. KKT is the bookkeeping that handles this honestly: at the
          optimum every wall is either <strong>pressed against</strong> (it binds, positive price) or has{' '}
          <strong>slack</strong> (off the wall, price exactly zero). Never both. That last clause —{' '}
          <Term>complementary slackness</Term> — is the whole game: <em>idle capacity is worthless.</em>
        </p>
      </Intuition>

      <Block>{'\\begin{aligned} &\\text{stationarity:} & \\nabla \\obj{f} &= \\textstyle\\sum_i \\con{\\mu_i}\\,\\nabla \\con{g_i} \\\\ &\\text{primal feasibility:} & \\con{g_i(x)} &\\le \\con{b_i} \\\\ &\\text{dual feasibility:} & \\con{\\mu_i} &\\ge 0 \\\\ &\\text{complementary slackness:}\\;\\; & \\con{\\mu_i}\\bigl(\\con{b_i}-\\con{g_i(x)}\\bigr) &= 0 \\end{aligned}'}</Block>
      <ReadEq>
        four clauses. (1) Profit's gradient is a non-negative combination of the <em>active</em> wall normals. (2)
        You're inside every wall. (3) Prices can't be negative. (4) The killer — for each wall, <em>either</em> its
        slack is zero (you're on it) <em>or</em> its multiplier is zero (it's free). Multiply slack × price and you get
        zero, every wall.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={() => setPt(opt)} className="px-2 py-1 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">snap to optimum</button>
          <button onClick={() => setMode('concave')} className={`px-2 py-1 rounded border ${mode === 'concave' ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>concave profit</button>
          <button onClick={() => setMode('lp')} className={`px-2 py-1 rounded border ${mode === 'lp' ? chipPalette.amber : 'border-white/10 text-neutral-500'}`}>LP objective</button>
          <span className="text-neutral-500">drag the point freely</span>
        </div>
        <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">
          <ContourPlot f={surf} xRange={[0, 24]} yRange={[0, 24]} width={300} height={300} nLevels={mode === 'lp' ? 8 : 9}
            constraints={WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color }))} point={{ x: pt[0], y: pt[1] }} onPick={setPt}
            markers={[{ x: opt[0], y: opt[1], label: 'opt', color: '#f0abfc' }]}
            xLabel="x₁ espresso" yLabel="x₂ filter" caption={mode === 'lp' ? 'linear contours (parallel lines)' : 'concave profit contours'} />
          <div className="space-y-2">
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-white/[0.04] text-neutral-400 text-[10px] uppercase">
                  <tr><th className="text-left px-2 py-1">wall</th><th className="px-1">usage</th><th className="px-1">limit</th><th className="px-1">slack</th><th className="px-1">μ</th><th className="px-1">μ·slack</th></tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const binds = Math.abs(r.slack) < 0.02;
                    return (
                      <tr key={r.key} className={binds ? 'bg-emerald-500/5' : ''}>
                        <td className="px-2 py-1 text-neutral-300">{r.short}</td>
                        <td className="px-1 text-center text-neutral-300">{r.usage.toFixed(2)}</td>
                        <td className="px-1 text-center text-neutral-500">{r.b}</td>
                        <td className={`px-1 text-center ${r.slack < -1e-3 ? 'text-rose-400' : binds ? 'text-emerald-300' : 'text-neutral-400'}`}>{r.slack.toFixed(2)}</td>
                        <td className="px-1 text-center text-amber-300">{r.mu == null ? '—' : r.mu.toFixed(2)}</td>
                        <td className="px-1 text-center text-neutral-400">{r.mu == null ? '—' : (r.mu * r.slack).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {atOpt && feasible
              ? <div className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">All four KKT conditions satisfied — <strong>certified optimum</strong>. μ·slack = 0 on every row.</div>
              : !feasible
                ? <div className="rounded-md border border-rose-400/25 bg-rose-400/5 px-3 py-2 text-xs text-rose-200">Infeasible — a slack went negative. Drag back inside the polygon.</div>
                : <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-neutral-400">Not the optimum — you can still climb. Hit <em>snap to optimum</em> to certify (μ appears only there).</div>}
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>KKT = stationarity + feasibility + λ≥0 + complementary slackness.</strong> The one to remember:{' '}
        <Term>complementary slackness</Term> — for every resource, <em>price × slack = 0</em>. A wall you're pressed
        against has a positive price; a wall with room to spare is free. That single equation tells you which
        constraints actually matter.
      </MinSchema>

      <Predict question="Labor has 1.27 hours of unused capacity at the Roastery's optimum. What is one extra labor-hour worth?">
        <strong>Exactly $0.00.</strong> Labor isn't the bottleneck — you're already leaving 1.27 h idle, so a 25th hour
        just sits there. Complementary slackness in one line: <Eq>{'\\mu_{\\text{labor}}\\times\\text{slack}=0'}</Eq>,
        and since slack ≠ 0, the price <em>must</em> be 0. At this concave optimum the roaster is the lone binding
        bottleneck (μ=42.18); beans (0.09 kg slack) and labor are both off their walls, so both price $0. (Switch to
        the LP objective and beans+roaster bind at $6.25/$7.50 — card 11.)
      </Predict>

      <Misconception
        wrong="More constraints always means a worse optimum, so every constraint costs you profit."
        right="Only BINDING constraints (slack=0, μ>0) cost you. The slack labor constraint costs nothing — μ_labor=0. Adding a constraint the optimum already satisfies with room to spare changes nothing."
        because="Complementary slackness: a constraint with positive slack has zero multiplier, so it drops out of the stationarity sum ∇f=Σμᵢ∇gᵢ entirely. The optimum literally doesn't feel it." />

      <Deeper>
        <p>
          KKT is the first-order <strong>necessary</strong> condition for a constrained optimum (under a constraint
          qualification like Slater). For a <strong>convex</strong> problem — the Roastery is, since −profit is convex
          and the walls are linear — KKT is also <strong>sufficient</strong>: any point satisfying all four conditions
          is a global optimum, no second-order check. That's why we can certify (16.36, 7.27) just by reading the
          ledger.
        </p>
        <p>
          <strong>Tradeoff:</strong> Lagrange (card 9) is the special case where you've already guessed the active set.
          KKT's real work is figuring out <em>which</em> walls are active — combinatorially there are <Eq>{'2^3=8'}</Eq>{' '}
          possible active sets here; the simplex/interior-point machinery of the discrete wing is all about searching
          that choice efficiently. The <Eq>{'\\mu_i\\ge0'}</Eq> (dual feasibility) condition is what distinguishes a
          constrained maximum pressed against a wall from a saddle.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What if two of the three ratios for μ disagree?', a: "Then the point isn't stationary for that active set — ∇f isn't in the cone spanned by the active normals, so there's a nonzero residual and you can still improve." },
        { q: 'Does complementary slackness mean a binding constraint always has μ>0?', a: "Generically yes. The knife-edge μ=0 AND slack=0 (a 'degenerate' constraint) is allowed but unstable. At the concave optimum only the roaster binds (μ=42.18, strictly off the knife-edge); beans and labor are slack with μ=0. (Switch to the LP objective and beans+roaster bind at 6.25/7.50.)" },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="lagrange" recap="∇f=λ∇g at a single active wall — KKT generalizes this to inequalities.">constraints & Lagrange</CrossLink>
        <CrossLink to="duality" recap="The binding multipliers 6.25 / 7.50 are the resources' shadow prices.">duality & shadow prices</CrossLink>
        <CrossLink to="lp" recap="The simplex method searches active sets vertex by vertex.">LP & the simplex</CrossLink>
      </div>
    </Card>
  );
};
const DUAL_FOCUS = {
  beans:   { idx: 0, range: [25, 29], label: 'green beans (kg)', base: 27 },
  roaster: { idx: 1, range: [3.2, 4.6], label: 'roaster-hours', base: 4 },
  labor:   { idx: 2, range: [2.2, 5], label: 'labor-hours', base: 4 },
};
const DualityCard = () => {
  const [budget, setBudget] = useState([27, 4, 4]);
  const [focus, setFocus] = useState('roaster');
  const [G, T, L] = budget;
  const opt = solveLP(G, T, L);
  const shadow = lpShadow(G, T, L);
  const set = (i, v) => setBudget((b) => { const c = b.slice(); c[i] = v; return c; });
  const F = DUAL_FOCUS[focus];
  const vCurve = useMemo(() => {
    const pts = []; const [lo, hi] = F.range;
    for (let i = 0; i <= 48; i++) { const x = lo + (i / 48) * (hi - lo); const bb = budget.slice(); bb[F.idx] = x; pts.push([x, solveLP(bb[0], bb[1], bb[2]).value]); }
    return pts;
  }, [budget, focus]);
  const slope = focus === 'beans' ? shadow.beans : focus === 'roaster' ? shadow.roaster : shadow.labor;
  const bFocus = budget[F.idx];
  const vFocus = opt.value;
  const tangent = [[F.range[0], vFocus + slope * (F.range[0] - bFocus)], [F.range[1], vFocus + slope * (F.range[1] - bFocus)]];
  const vMin = Math.min(...vCurve.map((p) => p[1])), vMax = Math.max(...vCurve.map((p) => p[1]));
  return (
    <Card id="duality" icon={Scale} title="Duality & shadow prices" accent="violet" index={11} anchor
          source="Boyd & Vandenberghe §5; Bertsimas & Tsitsiklis Ch.4" subtitle="What your resources are worth — priced from the other side">
      <Intuition>
        <p>
          There are two ways to value the Roastery. The <strong>primal</strong> view: pick the best blend mix, read off
          the profit — $198.75/day in the LP. The <strong>dual</strong> view: forget blends and ask <em>what is each
          resource worth at the margin?</em> Price the beans, roaster-hours, and labor so no blend could beat its
          ingredient cost, then minimize the total value of your stock. <Term>strong duality</Term> is the remarkable
          fact that these two numbers <strong>meet exactly</strong> — and the prices that achieve it are the KKT
          multipliers: the <Term>shadow price</Term>s.
        </p>
      </Intuition>

      <Block>{'\\con{\\mu_i^\\star} = \\frac{\\partial\\, \\obj{V^\\star}}{\\partial\\, \\con{b_i}} \\qquad \\underbrace{\\max_{x\\in\\mathcal{F}} \\obj{f(x)}}_{\\text{primal}} = \\underbrace{\\min_{\\boldsymbol{\\mu}\\ge 0}\\, \\dual{g(\\boldsymbol{\\mu})}}_{\\text{dual}} = \\obj{198.75}'}</Block>
      <ReadEq>
        the dual relaxes the walls into <em>priced penalties</em>; for any prices <Eq>{'\\con{\\mu}\\ge0'}</Eq> it gives
        an upper bound on profit (walls only cost you). Minimizing that bound squeezes it down — and for a convex
        problem it touches the true optimum exactly: no gap. Each optimal price is literally the <em>derivative of
        optimal profit with respect to that budget.</em>
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div>
            <ContourPlot f={(x1, x2) => 9 * x1 + 7 * x2} xRange={[0, 24]} yRange={[0, 24]} width={320} height={260} nLevels={7}
              constraints={WALLS.map((w, i) => ({ a: w.a, b: budget[i], color: w.color }))}
              markers={[{ x: opt.x[0], y: opt.x[1], label: 'LP opt', color: '#f0abfc' }]}
              xLabel="x₁ espresso" yLabel="x₂ filter" caption="move a budget slider → the wall translates, the optimum slides" />
            <div className="mt-2 space-y-1.5">
              {Object.entries(DUAL_FOCUS).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-[10px] font-mono">
                  <button onClick={() => setFocus(k)} className={`w-16 text-left px-1 rounded ${focus === k ? 'text-violet-200' : 'text-neutral-500'}`}>{k}</button>
                  <input type="range" min={k === 'beans' ? 25 : k === 'roaster' ? 3.2 : 2.2} max={k === 'beans' ? 29 : k === 'roaster' ? 4.6 : 5}
                    step="0.05" value={budget[v.idx]} onChange={(e) => { set(v.idx, +e.target.value); setFocus(k); }} className="opt-range flex-1" />
                  <span className="tabular-nums w-9 text-neutral-300">{budget[v.idx].toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">value function V⋆ vs {focus} budget</div>
            <MultiLinePlot
              series={[
                { pts: tangent, color: 'rgba(244,114,182,0.6)', width: 1, dash: '4 3', label: `slope = $${slope.toFixed(2)}` },
                { pts: vCurve, color: '#c4b5fd', width: 2.2, label: 'V⋆(budget)' },
              ]}
              xRange={F.range} yRange={[Math.floor(vMin - 4), Math.ceil(vMax + 4)]} xLabel={focus} yLabel="V⋆"
              width={320} height={220} vlines={[{ at: bFocus, color: '#f0abfc' }]}
              yTicks={[Math.floor(vMin - 4), Math.round((vMin + vMax) / 2), Math.ceil(vMax + 4)]} />
            <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-[12px] space-y-1">
              <div className="text-emerald-300">optimal margin V⋆ = ${opt.value.toFixed(2)}/day</div>
              <div className="text-amber-300">shadow prices: beans ${shadow.beans.toFixed(2)} · roaster ${shadow.roaster.toFixed(2)} · labor ${shadow.labor.toFixed(2)}</div>
              <div className="text-neutral-400">∂V⋆/∂{focus} = <span className="text-violet-300">${slope.toFixed(2)}</span> (the slope, by finite difference)</div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 leading-snug mt-2">
          The slope of <Eq>{'V^\\star'}</Eq> <em>is</em> the shadow price — verified live by central finite difference.
          The beans ramp is a clean straight line (slope $6.25); the roaster ramp <strong>kinks</strong> at T≈4.5 where
          the binding set changes and the marginal value drops. Shadow prices are <em>local</em> — they expire when the active set shifts.
        </p>
      </div>

      <MinSchema>
        The multiplier is a <strong>price</strong>: <Eq>{'\\con{\\lambda^\\star} = \\partial \\obj{V^\\star}/\\partial \\con{b}'}</Eq>.
        Beans are worth <strong>$6.25/kg</strong>, roaster-time <strong>$7.50/hour</strong>, labor <strong>$0</strong> (slack)
        — at the margin. Strong duality says the cheapest consistent set of these prices, valued against your stock,{' '}
        <em>equals</em> your maximum profit. The dual prices your constraints and tells you where to spend to grow.
      </MinSchema>

      <Predict question="You can buy ONE more unit of exactly one resource for the same cost. Beans, roaster-hours, or labor — which buys the most extra profit?">
        <strong>Roaster-hours</strong>, at a <em>marginal</em> <strong>+$7.50/hour</strong> (vs +$6.25/kg beans, +$0
        labor). Shadow prices rank your bottlenecks directly. The fine print: that $7.50 rate holds only to T≈4.5, where
        roaster capacity saturates (x₂→0) and the marginal value drops to <strong>$0</strong>. So a whole +1-hour step
        from T=4 nets just <strong>+$3.75</strong> — the rate expires mid-step. Shadow prices are local; they vanish
        when the active set shifts.
      </Predict>

      <Misconception
        wrong="The shadow price is what you'd save in bulk — so 10 more roaster-hours is worth 10 × $7.50 = $75."
        right="$7.50 is the MARGINAL value, valid only while the same constraints bind. Here it holds to T≈4.5 h; the very next discrete +1 roaster-hour gains only $3.75 because at T=4.5 the mix hits x₂=0 and the binding set changes."
        because="The value function V⋆(b) is piecewise-linear: its slope is the shadow price, but it kinks every time the optimal vertex switches. Beyond a kink a different rate applies. λ = dV/db is a derivative — true only within the basis-stable interval." />

      <Worked title="Strong duality, both directions">
        <p>
          <strong>Primal:</strong> max <Eq>{'9x_1+7x_2'}</Eq> over the polygon → vertex (16.25, 7.5), margin{' '}
          <Eq>{'9(16.25)+7(7.5)=198.75'}</Eq>. <strong>Dual:</strong> min <Eq>{'27y_1+4y_2+4y_3'}</Eq> s.t.{' '}
          <Eq>{'1.2y_1+0.2y_2+0.1y_3\\ge9'}</Eq> and <Eq>{'y_1+0.1y_2+0.15y_3\\ge7'}</Eq>, <Eq>{'y\\ge0'}</Eq>.
          Optimal prices <Eq>{'y^\\star=(6.25,7.50,0)'}</Eq> make both product constraints tight and cost{' '}
          <Eq>{'27(6.25)+4(7.5)+0=198.75'}</Eq>. The two numbers meet — zero gap. A feasible but non-optimal price{' '}
          <Eq>{'y=(7.5,0,0)'}</Eq> still bounds it (cost 202.50 ≥ 198.75): that's weak duality, gap 3.75.
        </p>
      </Worked>

      <Deeper>
        <p>
          The Lagrangian turns hard constraints into soft penalties. For any fixed <Eq>{'\\mu\\ge0'}</Eq>, the dual
          value is an <strong>upper bound</strong> on profit (<Term>weak duality</Term>, always true, even non-convex).
          The dual minimizes that bound. <Term>strong duality</Term> (gap 0) holds when the primal is convex and{' '}
          <Term>Slater's condition</Term> is met (a strictly-feasible interior point exists — the polygon has interior,
          so it does). For the concave Roastery the dual <Eq>{'g(\\mu)'}</Eq> is convex with minimum 183.45 at{' '}
          <Eq>{'\\mu=42.18'}</Eq>.
        </p>
        <p>
          <strong>Why it matters:</strong> duality (1) gives a <em>certificate</em> — any feasible dual value bounds how
          good the primal can get, so you can stop early with a guarantee; (2) is what every solver's "optimality gap"
          reports; (3) reverses hard problems into easier ones. The economic punchline is sharpest:{' '}
          <Eq>{'\\lambda^\\star=\\partial V^\\star/\\partial b'}</Eq> — which is why a manager reads multipliers straight
          off a solver as "buy more of <em>this</em> first."
        </p>
      </Deeper>

      <QA items={[
        { q: "Why is labor's shadow price exactly zero?", a: "Complementary slackness. At the optimum labor has 1.25 h of slack, so it isn't binding — relaxing a non-binding limit changes nothing, so ∂V⋆/∂L = 0. Idle capacity has no marginal value." },
        { q: 'Is the duality gap ever nonzero here?', a: 'Not at the optimum — the Roastery is convex with a feasible interior (Slater holds), so strong duality gives gap 0. Gaps appear for non-convex problems — e.g. the integer version in card 13, where the LP relaxation leaves an integrality gap.' },
        { q: 'How is the LP shadow price related to the concave multiplier from card 10?', a: 'Same object — a multiplier IS a shadow price. They differ in value because the objectives differ: the linear objective binds {beans, roaster} with prices (6.25, 7.50); the concave objective binds only {roaster} with μ=42.18. Both equal ∂V⋆/∂(their budget).' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="kkt" recap="The binding multipliers 6.25 / 7.50 are exactly these shadow prices.">the KKT conditions</CrossLink>
        <CrossLink to="lp" recap="LP duality gives the same shadow prices, read off the optimal tableau.">LP & the simplex</CrossLink>
        <CrossLink to="ilp" recap="The integer version opens a duality gap the LP relaxation can't close.">integer programming & B&B</CrossLink>
        <CrossLink to="anchor" recap="The scorecard reports these three prices as the shop's bottom line.">the roastery, solved every way</CrossLink>
        <CrossLink to="retail-quant" external recap="Portfolio QPs read risk-budget shadow prices the same way.">retail-quant</CrossLink>
      </div>
    </Card>
  );
};
const VERTS = {
  O: { x: [0, 0], obj: 0 }, A: { x: [20, 0], obj: 180 }, B: { x: [16.25, 7.5], obj: 198.75 },
  C: { x: [0.625, 26.25], obj: 189.375 }, D: { x: [0, 80 / 3], obj: 560 / 3 },
};
const DANTZIG = ['O', 'A', 'B'], ALT = ['O', 'D', 'C', 'B'];
const LPCard = () => {
  const [mode, setMode] = useState('dantzig');
  const route = mode === 'dantzig' ? DANTZIG : ALT;
  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); }, [mode]);
  useReplayOnEnter(() => setStep(0));
  const acc = useRef(0);
  useRaf(step < route.length - 1, (dt) => { acc.current += dt; if (acc.current > 1.1) { acc.current = 0; setStep((s) => Math.min(route.length - 1, s + 1)); } });
  const walk = route.slice(0, step + 1).map((id) => VERTS[id].x);
  const cur = VERTS[route[step]];
  const markers = Object.entries(VERTS).map(([id, v]) => ({ x: v.x[0], y: v.x[1], label: id === 'B' ? 'B★ $198.75' : id, color: id === 'B' ? '#f0abfc' : '#67e8f9', r: id === 'B' ? 6 : 4 }));
  return (
    <Card id="lp" icon={Hexagon} title="Linear programming & the simplex" accent="amber" index={12}
          source="Dantzig 1947; Bertsimas & Tsitsiklis" subtitle="When the landscape is flat, the answer hides in a corner">
      <Intuition>
        <p>
          Drop the diminishing-returns curve and pretend every kilo sells for a fixed margin — $9 Espresso, $7 Filter,
          forever. The profit hills flatten into a family of <strong>parallel straight lines</strong>. A flat ramp has
          no summit <em>inside</em> a room, so the best point is pinned against a corner. Push the profit line outward
          as far as it'll go while still touching the feasible region — the last point it touches is always a{' '}
          <Term>vertex</Term>, the meeting of two walls. That single fact is the whole of linear programming: stop
          searching the interior, just visit the corners.
        </p>
      </Intuition>

      <Block>{'\\max_{x\\ge 0}\\ \\obj{c^{\\mathsf T}x}\\quad\\text{s.t.}\\quad \\con{Ax\\le b},\\quad c=\\begin{bmatrix}9\\\\7\\end{bmatrix},\\ A=\\begin{bmatrix}1.2&1.0\\\\0.2&0.1\\\\0.1&0.15\\end{bmatrix},\\ b=\\begin{bmatrix}27\\\\4\\\\4\\end{bmatrix}'}</Block>
      <ReadEq>
        choose non-negative kilos of each blend to <strong>maximize</strong> <Eq>{'9x_1+7x_2'}</Eq>, subject to three
        resource walls. Set the curvature <Eq>{'Q\\to0'}</Eq> in the cards 9–11 objective and you get exactly this — the
        Roastery's <em>linear shadow</em>.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={() => setMode('dantzig')} className={`px-2 py-1 rounded border ${mode === 'dantzig' ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>Dantzig: O→A→B</button>
          <button onClick={() => setMode('alt')} className={`px-2 py-1 rounded border ${mode === 'alt' ? chipPalette.amber : 'border-white/10 text-neutral-500'}`}>alt rule: O→D→C→B</button>
          <button onClick={() => setStep((s) => (s + 1) % route.length)} className="px-2 py-1 rounded border border-white/10 text-neutral-300">step</button>
          <button onClick={() => setStep(0)} className="px-2 py-1 rounded border border-white/10 text-neutral-400">reset</button>
        </div>
        <div className="grid md:grid-cols-[340px_1fr] gap-4 items-start">
          <ContourPlot f={(x1, x2) => 9 * x1 + 7 * x2} xRange={[0, 24]} yRange={[0, 30]} width={340} height={300} nLevels={8}
            constraints={WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color }))} markers={markers}
            paths={[{ pts: walk, color: '#6ee7b7', width: 2.4, dots: true, head: cur.x }]}
            xLabel="x₁ espresso" yLabel="x₂ filter" caption="emerald contours are iso-profit lines (slope −9/7) · token walks the corners" />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-[12px] space-y-1">
              <div>vertex <span className="text-cyan-200">{route[step]}</span> = ({cur.x[0].toFixed(2)}, {cur.x[1].toFixed(2)})</div>
              <div className="text-emerald-300">objective = ${cur.obj.toFixed(2)}/day</div>
              {step === route.length - 1
                ? <div className="text-fuchsia-300">no neighbor is higher → STOP. Optimum.</div>
                : <div className="text-neutral-400">a higher neighbor exists → pivot</div>}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">ratio test from O (enter x₁)</div>
              roaster 4/0.20 = <span className="text-emerald-300">20 (binds)</span> · beans 27/1.2 = 22.5 · labor 4/0.10 = 40 → move to A=(20,0), then bring in x₂ along the roaster wall until beans binds at B.
            </div>
            <div className="rounded-lg border border-violet-400/20 bg-violet-400/5 p-3 text-[11px]">
              <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-1">dual at B (same as card 11)</div>
              <span className="font-mono text-amber-300">beans $6.25 · roaster $7.50 · labor $0</span> → dual obj 27·6.25 + 4·7.5 = <span className="text-emerald-300">$198.75</span> = primal. Gap 0.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        A linear objective over linear constraints never settles in the interior — the best point is always a{' '}
        <Term>vertex</Term>. The LP optimum is <strong>(16.25, 7.5) for $198.75/day</strong>, where the beans and
        roaster walls cross; <strong>labor sits idle (1.25 h)</strong>. The <Term>simplex method</Term> walks corner to
        corner, climbing, and stops when no neighbor is higher — and its dual prices are the <em>same</em> shadow prices
        from card 11. Same answer, two languages.
      </MinSchema>

      <Predict question="The smooth concave optimum was (16.36, 7.27). What does the LINEAR version do — land near it, or somewhere different?">
        It lands at <strong>(16.25, 7.5)</strong> — close in <Eq>{'x_1'}</Eq>, but Filter jumps to 7.5 and the point
        snaps to a <em>corner</em> (beans + roaster both bind). The curved optimum was a smooth tangency on the roaster
        wall alone (beans had 0.09 kg slack); flattening the objective drags the solution along the roaster edge until
        it hits the beans wall too. <strong>Linear objectives don't do interiors or single-wall tangencies — they go
        all the way to a vertex.</strong>
      </Predict>

      <Misconception
        wrong="The optimum could be anywhere on the best edge, or in the middle if profit is highest there."
        right="For a linear objective an optimum always occurs at a vertex. (It can tie along a whole edge — but only if the objective line is exactly parallel to that edge.)"
        because="cᵀx is linear, so along any line through the region it strictly increases in one direction unless flat. The iso-profit slope −9/7 ≈ −1.286 is strictly between the beans wall (−1.2) and roaster wall (−2.0), parallel to neither — so the optimum is the unique corner B." />

      <Worked title="The dual: pricing the resources from the other side">
        <p>
          <strong>Primal:</strong> make blends, maximize profit → $198.75 at (16.25, 7.5).{' '}
          <strong>Dual:</strong> price each resource <Eq>{'y\\ge0'}</Eq> so no blend beats its ingredient cost, then
          minimize <Eq>{'27y_b+4y_r+4y_\\ell'}</Eq>. Complementary slackness: labor is idle → <Eq>{'y_\\ell=0'}</Eq>.
          The two product constraints then bind: <Eq>{'1.2y_b+0.2y_r=9'}</Eq>, <Eq>{'y_b+0.1y_r=7'}</Eq> →{' '}
          <Eq>{'y_b=6.25,\\ y_r=7.50'}</Eq>. Dual objective <Eq>{'27(6.25)+4(7.5)=198.75'}</Eq> — identical to the
          primal. Zero gap, and exactly card 11's shadow prices.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Why vertices (the fundamental theorem of LP).</strong> The feasible set is a convex polyhedron; a
          linear function attains its max at an <Term>vertex</Term> (extreme point), because any interior/edge point is
          a convex combination of vertices and a linear function on a blend can't exceed its largest component. Vertices
          are where <Eq>{'n'}</Eq> independent constraints bind (here <Eq>{'n=2'}</Eq>). With <Eq>{'m'}</Eq> constraints
          there are at most <Eq>{'\\binom{m}{n}'}</Eq> candidates — finite, so enumeration works in principle.
        </p>
        <p>
          <strong>Why simplex, not enumeration.</strong> <Eq>{'\\binom{m}{n}'}</Eq> explodes for real LPs. Simplex is
          smart enumeration: start at a vertex, <Term>pivot</Term> to a better neighbor, stop when none improves. Worst
          case is exponential (Klee–Minty), but in practice it's a small multiple of <Eq>{'m'}</Eq> pivots.{' '}
          <strong>Tradeoff vs interior-point:</strong> simplex hops along the boundary (great for warm-starts);{' '}
          <Term>strong duality</Term> is automatic for LP (no Slater needed) — primal optimum = dual optimum whenever
          both are feasible and bounded.
        </p>
      </Deeper>

      <QA items={[
        { q: "Why can't the best mix be in the middle of the feasible region?", a: 'Because the objective is a flat ramp. From any interior point you can step in the +gradient direction (9,7) and earn more, until a wall stops you. You only run out of "up" at a corner.' },
        { q: "What's a 'pivot' in plain terms?", a: 'Swapping which wall you press against. At a corner two walls bind; a pivot releases one and slides along the other edge to the next corner, choosing the move that increases profit.' },
        { q: 'Does simplex always find the global optimum?', a: 'For an LP, yes. The feasible set is convex and the objective linear, so any vertex with no improving neighbor is globally optimal — no local traps. (Integer programming, next card, breaks this.)' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="duality" recap="Duality prices your resources; λ* = ∂(optimal value)/∂budget.">we met these shadow prices on the curved Roastery</CrossLink>
        <CrossLink to="kkt" recap="Stationarity + feasibility + λ≥0 + complementary slackness.">LP duality is just KKT with straight walls</CrossLink>
        <CrossLink to="ilp" recap="Whole bags only; LP relaxation as a bound; branch, bound, prune.">next: force whole bags and the corner stops being the answer</CrossLink>
        <CrossLink to="convexity" recap="Convex set + linear objective ⇒ every local optimum is global.">why simplex never gets trapped</CrossLink>
      </div>
    </Card>
  );
};
const BNB = [
  { id: 0, cut: 'root', x: [16.25, 7.5], z: 198.75, kind: 'branch', px: 0.5, py: 0.1 },
  { id: 1, cut: 'x₂≤7', x: [16.5, 7], z: 197.5, kind: 'branch', px: 0.27, py: 0.42, parent: 0 },
  { id: 2, cut: 'x₁≤16', x: [16, 7], z: 193, kind: 'int', px: 0.12, py: 0.8, parent: 1 },
  { id: 3, cut: 'x₁≥17', x: [17, 6], z: 195, kind: 'int', px: 0.4, py: 0.8, parent: 1 },
  { id: 4, cut: 'x₂≥8', x: [15.83, 8], z: 198.5, kind: 'branch', px: 0.74, py: 0.42, parent: 0 },
  { id: 5, cut: 'x₁≤15', x: [15, 9], z: 198, kind: 'opt', px: 0.61, py: 0.8, parent: 4 },
  { id: 6, cut: 'x₁≥16', x: null, z: null, kind: 'prune', px: 0.89, py: 0.8, parent: 4 },
];
const BNB_KIND = { branch: { c: '#a5b4fc', t: 'branch' }, int: { c: '#67e8f9', t: 'integer' }, opt: { c: '#6ee7b7', t: 'optimal' }, prune: { c: '#fb7185', t: 'prune' } };
const ILPCard = () => {
  const [step, setStep] = useState(0);
  useReplayOnEnter(() => setStep(0));
  const acc = useRef(0);
  useRaf(step < BNB.length - 1, (dt) => { acc.current += dt; if (acc.current > 1.0) { acc.current = 0; setStep((s) => Math.min(BNB.length - 1, s + 1)); } });
  const lattice = useMemo(() => { const m = []; for (let i = 0; i <= 20; i++) for (let j = 0; j <= 27; j++) if (feasibleAt(i, j)) m.push({ x: i, y: j, color: 'rgba(103,232,249,0.45)', r: 1.6 }); return m; }, []);
  const cur = BNB[step];
  const markers = [...lattice,
    { x: 16, y: 8, label: '✗ round(LP)', color: '#fb7185', r: 4 },
    { x: 15, y: 9, label: '✓ (15,9)', color: '#6ee7b7', r: 5 }];
  if (cur.x) markers.push({ x: cur.x[0], y: cur.x[1], label: `node ${cur.id}`, color: '#f0abfc', r: 5 });
  const W = 340, H = 250;
  const px = (f) => 20 + f * (W - 40), py = (f) => 24 + f * (H - 48);
  return (
    <Card id="ilp" icon={GitBranch} title="Integer programming & branch-and-bound" accent="amber" index={13} anchor
          source="Land–Doig 1960" subtitle="Whole bags only — why you can't just round, and how to bound & prune">
      <Intuition>
        <p>
          The LP says make 16.25 kg of Espresso and 7.5 kg of Filter. But you sell whole bags. The lazy fix is to round
          to 16 and 8 — which spends 27.2 kg of green beans against a stock of 27. It's <em>infeasible</em>. Integrality
          isn't a rounding nuisance; it <strong>shatters</strong> the smooth feasible polygon into a scatter of lattice
          points, and the best one can sit a surprising distance from where the LP pointed.
        </p>
      </Intuition>

      <Block>{'\\max\\, \\obj{9x_1+7x_2}\\ \\text{s.t.}\\ \\con{Ax\\le b},\\ \\ x_1,x_2 \\in \\mathbb{Z}_{\\ge 0} \\qquad \\obj{z_{\\text{LP}}} \\ge \\obj{z_{\\text{ILP}}}'}</Block>
      <ReadEq>
        relax the integers, solve the easy LP, get <strong>198.75</strong> — an <em>upper bound</em> on any integer
        solution (you can only do better without the integrality requirement). The true integer best is{' '}
        <strong>198</strong>; the gap of <strong>0.75</strong> is the room the tree searches.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={() => setStep((s) => (s + 1) % BNB.length)} className="px-2 py-1 rounded border border-white/10 text-neutral-300">step</button>
          <button onClick={() => setStep(0)} className="px-2 py-1 rounded border border-white/10 text-neutral-400">reset</button>
          <span className="text-neutral-500">node {cur.id}: {cur.cut} · bound {cur.z == null ? '— pruned' : '$' + cur.z}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <ContourPlot f={(x1, x2) => 9 * x1 + 7 * x2} xRange={[0, 20]} yRange={[0, 14]} width={320} height={250} nLevels={6}
            constraints={WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color }))} markers={markers}
            xLabel="x₁ espresso (bags)" yLabel="x₂ filter (bags)" caption="cyan dots = feasible integer plans · ✗ rounding overshoots the bean wall" />
          <div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-lg border border-white/10 bg-black/20">
              {BNB.map((nd) => nd.parent != null && nd.id <= step && (
                <line key={`e-${nd.id}`} x1={px(BNB[nd.parent].px)} y1={py(BNB[nd.parent].py) + 8} x2={px(nd.px)} y2={py(nd.py) - 8} stroke="rgba(255,255,255,0.2)" />
              ))}
              {BNB.filter((nd) => nd.id <= step).map((nd) => {
                const k = BNB_KIND[nd.kind];
                return (
                  <g key={nd.id} transform={`translate(${px(nd.px)},${py(nd.py)})`}>
                    <rect x={-34} y={-13} width={68} height={26} rx={5} fill="rgba(10,10,12,0.9)" stroke={k.c} strokeWidth={nd.id === step ? 1.8 : 1} />
                    <text x={0} y={-3} fontSize="8" textAnchor="middle" fill="#cbd5e1" fontFamily="ui-monospace">{nd.cut}</text>
                    <text x={0} y={7} fontSize="8" textAnchor="middle" fill={k.c} fontFamily="ui-monospace">{nd.z == null ? '∅ prune' : (nd.x[0] % 1 === 0 && nd.x[1] % 1 === 0 ? `int $${nd.z}` : `$${nd.z}`)}</text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-1 text-[11px] text-neutral-500 leading-snug">
              branch on the <strong>most-fractional</strong> variable (x₂=7.5 beats x₁=16.25); a node dies if its
              sub-box is empty or its bound can't beat the incumbent. Node 5 finds the optimum <strong>(15,9) $198</strong>;
              node 6 is pruned on sight (27.2 kg beans).
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>The LP relaxation is a bound, not an answer.</strong> Branch-and-bound brackets the integer optimum
        between a relaxed upper bound and the best integer solution found so far, then kills any branch whose bound
        can't beat what you already have.
      </MinSchema>

      <Predict question="The LP optimum is (16.25, 7.5). Round to the nearest whole bags — is (16, 8) a valid production plan?">
        <strong>No.</strong> (16, 8) needs <Eq>{'1.2(16)+8=27.2'}</Eq> kg of green beans, but you stock <strong>27</strong>.
        Rounding overshot a binding wall. The true integer optimum is <strong>(15, 9)</strong>, profit{' '}
        <strong>$198</strong> — found two branches deep, not by rounding.
      </Predict>

      <Misconception
        wrong="Just solve the LP and round to the nearest integers."
        right="Rounding can land outside the feasible region or miss the optimum entirely — you must search the lattice."
        because="The optimum lives at a polygon vertex; the nearest lattice point may violate a constraint (27.2 > 27 kg beans) or be beaten by a farther one. (15,9) beats round(16,8) and is feasible; (16,8) isn't." />

      <Worked title="Why node 6 dies on sight">
        <p>
          On the branch <Eq>{'x_2\\ge8'}</Eq> <strong>and</strong> <Eq>{'x_1\\ge16'}</Eq>, the beans wall demands{' '}
          <Eq>{'1.2(16)+8=27.2>27'}</Eq> — impossible. No LP needed; the sub-box is empty, so we prune without computing
          anything. Its sibling node 5 (<Eq>{'x_2\\ge8,\\ x_1\\le15'}</Eq>) yields the integer point (15, 9) at profit
          198, matching the parent bound 198.5 closely enough that no open node can beat it — search terminates.
        </p>
      </Worked>

      <Deeper>
        <p>
          LP is polynomial-time (simplex is fast; interior-point provably polynomial). Adding <Eq>{'x\\in\\mathbb{Z}'}</Eq>{' '}
          makes the problem <strong>NP-hard</strong> in general — no known polynomial algorithm, and B&B's tree can blow
          up exponentially. The lever is <strong>bound quality</strong>: tighter relaxations (<em>cutting planes</em>{' '}
          that shave fractional vertices without removing lattice points) prune harder — which is why modern solvers are
          "branch-and-<em>cut</em>." Here the gap is only 0.75 and the tree has 7 nodes, but 100 binary "run this line?"
          variables means <Eq>{'2^{100}'}</Eq> candidate points — only good bounds keep the search finite.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What does the LP relaxation actually give you?', a: 'An upper bound (for a max problem) on the best achievable integer objective — 198.75 here — plus a fractional point to branch on.' },
        { q: 'How do you know (15,9) is optimal and not just feasible?', a: 'Every other open branch has a bound ≤ 198 once the incumbent reaches 198, so nothing unexplored can beat it. Brute force confirms (15,9) at 198 is the unique integer optimum.' },
        { q: 'Why branch on x₂ first?', a: 'Most-fractional rule: x₂=7.5 is 0.5 from an integer, x₁=16.25 only 0.25. Branching on the more-fractional variable tends to tighten the bound faster.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="lp" recap="The LP optimum (16.25, 7.5) at the beans∩roaster vertex — each B&B node is one LP solve.">the simplex card</CrossLink>
        <CrossLink to="dp" recap="Another way to crack a hard discrete problem — optimal substructure.">dynamic programming</CrossLink>
        <CrossLink to="anchor" recap="The integer twist on the scorecard.">the Roastery scorecard</CrossLink>
      </div>
    </Card>
  );
};
const DP_ROWS = [
  { label: 'none', row: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { label: '+A(5,60)', row: [0, 0, 0, 0, 0, 60, 60, 60, 60, 60, 60] },
  { label: '+B(3,30)', row: [0, 0, 0, 30, 30, 60, 60, 60, 90, 90, 90] },
  { label: '+C(4,50)', row: [0, 0, 0, 30, 50, 60, 60, 80, 90, 110, 110] },
  { label: '+D(2,20)', row: [0, 0, 20, 30, 50, 60, 70, 80, 90, 110, 110] },
  { label: '+E(5,55)', row: [0, 0, 20, 30, 50, 60, 70, 80, 90, 110, 115] },
];
const DPCard = () => {
  const TOT = 6 * 11;
  const [fill, setFill] = useState(TOT);
  useReplayOnEnter(() => setFill(0));
  const acc = useRef(0);
  useRaf(fill < TOT, (dt) => { acc.current += dt; if (acc.current > 0.05) { acc.current = 0; setFill((f) => Math.min(TOT, f + 2)); } });
  return (
    <Card id="dp" icon={Grid3x3} title="Dynamic programming" accent="emerald" index={14}
          source="Bellman 1957" subtitle="Solve each subproblem once — the knapsack table where greedy loses">
      <Intuition>
        <p>
          Five regular cafes each want a standing weekly order. You have only 10 roaster-hours to commit. Each order
          costs some hours and earns some profit — accept which ones? The "obvious" move is to rank by
          profit-per-hour and take the best until you run out. That greedy instinct is <em>wrong</em> here, and dynamic
          programming shows exactly why: the best use of 10 hours is built from the best use of fewer hours, computed
          once and remembered.
        </p>
      </Intuition>

      <Block>{'\\obj{V(i, c)} = \\max\\Big(\\underbrace{\\obj{V(i{-}1, c)}}_{\\text{skip } i},\\ \\underbrace{\\obj{V(i{-}1, c - w_i)} + v_i}_{\\text{accept } i}\\Big)'}</Block>
      <ReadEq>
        the best value using the first <Eq>{'i'}</Eq> orders with <Eq>{'c'}</Eq> hours left is the better of two
        worlds: pretend order <Eq>{'i'}</Eq> doesn't exist, or accept it — pay its <Eq>{'w_i'}</Eq> hours, bank its{' '}
        <Eq>{'v_i'}</Eq> profit, then ask the same question of the orders before it. The whole table is this one line.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={() => setFill(0)} className="px-2 py-1 rounded border border-white/10 text-neutral-300">replay fill</button>
          <button onClick={() => setFill(TOT)} className="px-2 py-1 rounded border border-white/10 text-neutral-400">fill all</button>
          <span className="text-neutral-500">capacity C = 10 roaster-hours · 6 rows × 11 cols = 66 cells</span>
        </div>
        <div className="overflow-x-auto">
          <table className="text-[11px] font-mono border-collapse">
            <thead>
              <tr className="text-neutral-500"><th className="px-1 py-0.5 text-right">order \ c</th>{Array.from({ length: 11 }, (_, c) => <th key={c} className="px-1.5 py-0.5 text-center w-7">{c}</th>)}</tr>
            </thead>
            <tbody>
              {DP_ROWS.map((r, ri) => (
                <tr key={ri}>
                  <td className="px-1 py-0.5 text-right text-neutral-400 whitespace-nowrap">{r.label}</td>
                  {r.row.map((v, c) => {
                    const shown = ri * 11 + c < fill;
                    const isAns = ri === 5 && c === 10;
                    return (
                      <td key={c} className={`px-1.5 py-0.5 text-center border border-white/5 ${isAns && shown ? 'bg-emerald-500/25 text-emerald-200 font-bold' : shown ? (v > 0 ? 'text-emerald-300/90' : 'text-neutral-600') : 'text-neutral-800'}`}>
                        {shown ? v : '·'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3 text-xs">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1">DP optimum</div>
            <div className="font-mono">V(5,10) = max(110, 60+55) = <span className="text-emerald-300 text-base">$115</span></div>
            <div className="text-neutral-400 mt-1">set <strong>{'{A, E}'}</strong> · 5+5 = 10 h, all used</div>
          </div>
          <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3 text-xs">
            <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-1">greedy by ratio</div>
            <div className="font-mono">C(12.5) → A(12.0) = <span className="text-rose-300 text-base">$110</span>, then stalls</div>
            <div className="text-neutral-400 mt-1">leftover 1 h fits nothing → <strong>$5 left on the table</strong></div>
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>Solve each subproblem once, store it, reuse it.</strong> When a problem has <Term>optimal substructure</Term>{' '}
        and <Term>overlapping subproblems</Term>, a table beats both brute force (polynomial, not exponential) and greedy
        (it's <em>correct</em> — greedy here loses $5 by grabbing the best ratio first).
      </MinSchema>

      <Predict question="Orders by profit-per-hour: C(12.5), A(12.0), E(11.0). With 10 hours, greedy takes C then A. What total, and is it optimal?">
        Greedy banks <strong>$110</strong> (C+A, 9 hours) then stalls — every remaining order overflows the last hour.
        But accepting <strong>A + E</strong> (rejecting C) earns <strong>$115</strong> using all 10 hours. Greedy's
        first grab of the best <em>ratio</em> locked it out of the better <em>combination</em>.
      </Predict>

      <Misconception
        wrong="Take the highest value-per-weight items first — that maximizes the knapsack."
        right="Ratio-greedy is optimal for the FRACTIONAL knapsack, but 0/1 (whole orders) needs DP."
        because="When you can't split an order, a high-ratio item can crowd out a pair that fits the capacity exactly. C(ratio 12.5)+A leaves 1 idle hour at $110, while A+E fills all 10 at $115." />

      <Worked title="Reading one cell">
        <p>
          <Eq>{'V(3,7)'}</Eq> = best of the first three orders (A,B,C) with 7 hours. Skip C → <Eq>{'V(2,7)=60'}</Eq>{' '}
          (just A). Accept C → <Eq>{'V(2,3)+50=30+50=80'}</Eq>. Max is <strong>80</strong>. Notice it reuses{' '}
          <Eq>{'V(2,3)=30'}</Eq>, already computed for an earlier column — that <em>reuse</em> is the whole point of
          memoization.
        </p>
      </Worked>

      <Deeper>
        <p>
          The recurrence is the discrete cousin of the <strong>Hamilton–Jacobi–Bellman</strong> equation in control —
          value functions and the principle of optimality are the same idea. Cost: the table is <Eq>{'O(nC)'}</Eq> = 5·11
          = 55 non-trivial fills, each <Eq>{'O(1)'}</Eq> — vastly better than <Eq>{'2^5=32'}</Eq> brute-force subsets
          here, and the gap explodes with size.
        </p>
        <p>
          <strong>Catch:</strong> <Eq>{'O(nC)'}</Eq> is <em>pseudo-polynomial</em> — it scales with the numeric{' '}
          <em>value</em> of the capacity, not its bit-length, so a capacity of <Eq>{'10^9'}</Eq> makes the table
          astronomically tall even with few items. 0/1 knapsack is NP-hard; DP is fast only when capacities are modest.
          DP trades memory (the whole table) for never recomputing.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What makes a problem suitable for DP?', a: 'Optimal substructure (the optimum decomposes into sub-optima) plus overlapping subproblems (the same sub-question recurs, so you store answers instead of recomputing).' },
        { q: 'When IS greedy-by-ratio optimal?', a: 'For the FRACTIONAL knapsack, where you can take part of an order — then filling by descending ratio is provably optimal. The 0/1 (all-or-nothing) version breaks it.' },
        { q: 'Why is the optimal set {A,E} and not {C,A}?', a: '{A,E} uses all 10 hours for $115; {C,A} uses 9 and can fit nothing more, banking only $110. The DP backtrack from V(5,10) recovers {A,E}.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="control-theory" external recap="Bellman's principle in continuous time = the HJB equation.">control theory</CrossLink>
        <CrossLink to="reinforcement-learning" external recap="Value iteration is this recurrence on states.">reinforcement learning</CrossLink>
        <CrossLink to="flows" recap="When greedy actually IS provably optimal — matroids.">flows, matching & greedy</CrossLink>
      </div>
    </Card>
  );
};
const FLOW_NODES = { R: [40, 110], N: [165, 52], S: [165, 168], C: [285, 110] };
const FLOW_EDGES = [
  { k: 'RN', a: 'R', b: 'N', cap: 12 }, { k: 'RS', a: 'R', b: 'S', cap: 8 },
  { k: 'NS', a: 'N', b: 'S', cap: 3 }, { k: 'NC', a: 'N', b: 'C', cap: 6 }, { k: 'SC', a: 'S', b: 'C', cap: 9 },
];
const flowAt = (step) => { const f = { RN: 0, RS: 0, NS: 0, NC: 0, SC: 0 }; if (step >= 1) { f.RN += 6; f.NC += 6; } if (step >= 2) { f.RS += 8; f.SC += 8; } if (step >= 3) { f.RN += 1; f.NS += 1; f.SC += 1; } return f; };
const ASSIGN = { rows: ['Espresso', 'Filter', 'Decaf'], cols: ['North', 'Central', 'South'], cost: [[2, 6, 9], [7, 3, 8], [5, 1, 4]], opt: [[0], [1], [2]], greedy: { Decaf: 'Central', Espresso: 'North', Filter: 'South' } };
const FlowsCard = () => {
  const [step, setStep] = useState(0);
  const [showCut, setShowCut] = useState(false);
  const [assignMode, setAssignMode] = useState('optimal');
  useReplayOnEnter(() => setStep(0));
  const acc = useRef(0);
  useRaf(step < 3, (dt) => { acc.current += dt; if (acc.current > 1.1) { acc.current = 0; setStep((s) => Math.min(3, s + 1)); } });
  const f = flowAt(step);
  const total = [0, 6, 14, 15][step];
  const optCells = { 0: 0, 1: 1, 2: 2 };               // row→col optimal (E→N, F→C, D→S)
  const greedyCells = { 2: 1, 0: 0, 1: 2 };             // Decaf→Central, Espresso→North, Filter→South
  const active = assignMode === 'optimal' ? optCells : greedyCells;
  const sum = assignMode === 'optimal' ? 9 : 11;
  return (
    <Card id="flows" icon={Network} title="Network flows, matching & greedy" accent="indigo" index={15}
          source="Ford–Fulkerson; Edmonds (matroids)" subtitle="When the LP rounds for free, and when greedy is provably right">
      <Intuition>
        <p>
          Some discrete problems are secretly easy. Route deliveries through your hubs, match each roast batch to a van,
          push flow through a network — and the linear program, with <em>no integer constraints at all</em>,
          spontaneously returns whole-number answers. No branch-and-bound needed; the structure does the rounding for
          you. The flip side: greedy is gloriously correct on a <Term>matroid</Term> and quietly wrong on an assignment.
        </p>
      </Intuition>

      <Block>{'\\obj{\\max_{\\text{flow}}\\ |f|} \\;=\\; \\con{\\min_{\\text{cut}}\\ \\text{cap}(S, \\bar S)}'}</Block>
      <ReadEq>
        the most you can push from source to sink equals the cheapest set of pipes whose removal disconnects them. The
        bottleneck <em>is</em> the answer — flow and cut are primal and dual, and they meet exactly.
      </ReadEq>

      <div className="my-3 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">max-flow · Roastery → City</div>
            <div className="flex gap-1 text-[10px] font-mono">
              <button onClick={() => setStep((s) => (s + 1) % 4)} className="px-1.5 py-0.5 rounded border border-white/10 text-neutral-300">step</button>
              <button onClick={() => setShowCut((v) => !v)} className={`px-1.5 py-0.5 rounded border ${showCut ? chipPalette.rose : 'border-white/10 text-neutral-500'}`}>min-cut</button>
            </div>
          </div>
          <svg width={320} height={220} viewBox="0 0 320 220" className="block w-full">
            {FLOW_EDGES.map((e) => {
              const [ax, ay] = FLOW_NODES[e.a], [bx, by] = FLOW_NODES[e.b];
              const fl = f[e.k]; const isCut = showCut && (e.k === 'NC' || e.k === 'SC');
              return (
                <g key={e.k}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={isCut ? '#fb7185' : 'rgba(148,163,184,0.5)'} strokeWidth={isCut ? 3 : 1.5} />
                  {fl > 0 && <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#6ee7b7" strokeWidth={Math.max(2, fl * 0.7)} opacity="0.8" strokeLinecap="round" />}
                  <text x={(ax + bx) / 2} y={(ay + by) / 2 - 4} fontSize="9" textAnchor="middle" fill={fl > 0 ? '#6ee7b7' : '#94a3b8'} fontFamily="ui-monospace">{fl}/{e.cap}</text>
                </g>
              );
            })}
            {Object.entries(FLOW_NODES).map(([k, [x, y]]) => (
              <g key={k}>
                <circle cx={x} cy={y} r={14} fill="rgba(10,10,12,0.95)" stroke={k === 'R' || k === 'C' ? '#a5b4fc' : '#fbbf24'} strokeWidth="1.5" />
                <text x={x} y={y + 3} fontSize="9" textAnchor="middle" fill="#e2e8f0" fontFamily="ui-monospace">{k}</text>
              </g>
            ))}
            {showCut && <line x1={235} y1={20} x2={235} y2={200} stroke="#fb7185" strokeDasharray="4 3" strokeWidth="1" />}
          </svg>
          <div className="text-[11px] font-mono text-neutral-400">
            total flow = <span className="text-emerald-300">{total}</span>{step === 3 && ' = max'} · {showCut && <span className="text-rose-300">min-cut = 6+9 = 15 (the last mile, not the 20-unit supply)</span>}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">min-cost assignment</div>
            <div className="flex gap-1 text-[10px] font-mono">
              <button onClick={() => setAssignMode('optimal')} className={`px-1.5 py-0.5 rounded border ${assignMode === 'optimal' ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>optimal $9</button>
              <button onClick={() => setAssignMode('greedy')} className={`px-1.5 py-0.5 rounded border ${assignMode === 'greedy' ? chipPalette.rose : 'border-white/10 text-neutral-500'}`}>greedy $11</button>
            </div>
          </div>
          <table className="text-[11px] font-mono border-collapse mx-auto">
            <thead><tr className="text-neutral-500"><th className="px-1.5 py-0.5"></th>{ASSIGN.cols.map((c) => <th key={c} className="px-2 py-0.5">{c}</th>)}</tr></thead>
            <tbody>
              {ASSIGN.rows.map((r, ri) => (
                <tr key={r}>
                  <td className="px-1.5 py-0.5 text-right text-neutral-400">{r}</td>
                  {ASSIGN.cost[ri].map((v, ci) => {
                    const on = active[ri] === ci;
                    return <td key={ci} className={`px-2 py-0.5 text-center border border-white/5 ${on ? (assignMode === 'optimal' ? 'bg-emerald-500/25 text-emerald-200 font-bold' : 'bg-rose-500/25 text-rose-200 font-bold') : 'text-neutral-500'}`}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[11px] font-mono text-neutral-400 mt-2 text-center">
            {assignMode === 'optimal' ? <>E→N + F→C + D→S = <span className="text-emerald-300">$9</span> (optimal, unique)</> : <>greedy grabs $1 cell first → forced into <span className="text-rose-300">$11</span> ($2 worse)</>}
          </div>
        </div>
      </div>

      <MinSchema>
        <strong>Structure decides difficulty.</strong> Network-flow and matching LPs return integers automatically
        (<Term>totally unimodular</Term> / Birkhoff) — no B&B needed. Greedy is <em>provably</em> optimal on a{' '}
        <Term>matroid</Term> (e.g. minimum spanning tree) and <em>provably fallible</em> elsewhere (the assignment
        above: greedy $11, optimal $9).
      </MinSchema>

      <Predict question="Greedy grabs the cheapest cell first: Decaf→Central at $1. Can it reach the $9 optimum?">
        <strong>No.</strong> Taking the $1 cell forces Espresso→North ($2) and Filter→South ($8) — total{' '}
        <strong>$11</strong>. The optimum routes Decaf→South ($4) instead, freeing Filter→Central ($3): total{' '}
        <strong>$9</strong>. The locally cheapest first move was a $2 mistake.
      </Predict>

      <Misconception
        wrong="Greedy is a heuristic that's usually close but never guaranteed."
        right="On a matroid, greedy is EXACTLY optimal — provably. Off a matroid (like assignment), it can fail by any margin."
        because="The matroid exchange property guarantees locally-best choices stay globally compatible — that's why Kruskal's MST greedy is optimal. Assignment constraints are not a matroid, so greedy-cheapest-cell breaks ($11 vs $9)." />

      <Worked title="Greedy MST — where greedy is law">
        <p>
          A tiny network — warehouse W and cafes 1,2,3 — with link costs W–1=1, 1–2=2, 2–3=3, W–2=4, W–3=5, 1–3=6.
          Kruskal's greedy: sort edges ascending, add the cheapest that doesn't form a cycle → take W–1, 1–2, 2–3; skip
          the rest. Total = <strong>6</strong>, and brute force over all spanning trees confirms 6 is optimal. Spanning
          trees form a <Term>matroid</Term>, so greedy here isn't lucky — it's guaranteed.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Why flow/assignment LPs give integers for free:</strong> their constraint matrices are{' '}
          <Term>totally unimodular</Term> (every square submatrix has determinant 0, ±1); with integer right-hand
          sides, every polytope vertex is integral, so the LP optimum is automatically integer. The assignment polytope
          (doubly-stochastic matrices) has exactly the <strong>permutation matrices</strong> as vertices (Birkhoff–von
          Neumann), so an LP relaxation never returns a fractional matching.
        </p>
        <p>
          <strong>Greedy's guarantee:</strong> greedy maximizes a weight over independent sets <em>if and only if</em>{' '}
          the structure is a matroid (Rado–Edmonds). Forests are a matroid → MST greedy works; assignments are not → it
          fails. Recognizing the structure is the whole game — spotting that your problem is a flow or a matroid lets
          you skip the exponential search and trust a polynomial algorithm.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does the assignment LP give integers without integer constraints?', a: 'Its constraint matrix is totally unimodular and the RHS is integral, so every polytope vertex is integral. The assignment polytope vertices are exactly permutation matrices (Birkhoff).' },
        { q: "What's the min-cut and why does it equal the max-flow?", a: 'Here the min-cut is {HubN→City (6), HubS→City (9)} = 15, equal to max-flow 15. By LP duality (max-flow/min-cut) the cheapest disconnecting cut always equals the maximum flow.' },
        { q: 'When can I trust greedy?', a: 'When the feasible structure is a matroid (e.g. spanning forests → Kruskal MST). Then greedy is provably optimal. Off a matroid, like assignment, greedy can be strictly worse ($11 vs $9).' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="lp" recap="Flow/matching are LPs whose vertices happen to be integral.">linear programming</CrossLink>
        <CrossLink to="ilp" recap="Contrast — general integer programs DON'T round for free, hence B&B.">branch-and-bound</CrossLink>
        <CrossLink to="dp" recap="Another polynomial conqueror of a discrete problem.">dynamic programming</CrossLink>
        <CrossLink to="duality" recap="Max-flow/min-cut IS LP duality wearing a network costume.">duality & shadow prices</CrossLink>
      </div>
    </Card>
  );
};
const SGDCard = () => {
  const [eta, setEta] = useState(0.1);
  const [sigma, setSigma] = useState(0.6);
  const [show, setShow] = useState({ sgd: true, mom: true, adam: true });
  // optimizer race on the ill-conditioned bowl f=½(10x²+y²), start (1,1), shared seeded noise
  const traces = useMemo(() => {
    const grad = (x, y) => [10 * x, y];
    const N = 80;
    const sgd = [[1, 1]], mom = [[1, 1]], adam = [[1, 1]];
    let xs = [1, 1], xm = [1, 1], vm = [0, 0], xa = [1, 1], ma = [0, 0], va = [0, 0];
    const rng = mulberry32(12345);
    for (let t = 1; t <= N; t++) {
      const nz = [sigma * randn(rng), sigma * randn(rng)];
      let g = grad(xs[0], xs[1]); xs = [clamp(xs[0] - eta * (g[0] + nz[0]), -2, 2), clamp(xs[1] - eta * (g[1] + nz[1]), -2, 2)]; sgd.push(xs);
      g = grad(xm[0], xm[1]); vm = [0.9 * vm[0] - eta * (g[0] + nz[0]), 0.9 * vm[1] - eta * (g[1] + nz[1])]; xm = [clamp(xm[0] + vm[0], -2, 2), clamp(xm[1] + vm[1], -2, 2)]; mom.push(xm);
      g = grad(xa[0], xa[1]); const gg = [g[0] + nz[0], g[1] + nz[1]];
      ma = [0.9 * ma[0] + 0.1 * gg[0], 0.9 * ma[1] + 0.1 * gg[1]];
      va = [0.999 * va[0] + 0.001 * gg[0] * gg[0], 0.999 * va[1] + 0.001 * gg[1] * gg[1]];
      const mh = [ma[0] / (1 - 0.9 ** t), ma[1] / (1 - 0.9 ** t)], vh = [va[0] / (1 - 0.999 ** t), va[1] / (1 - 0.999 ** t)];
      xa = [clamp(xa[0] - eta * mh[0] / (Math.sqrt(vh[0]) + 1e-8), -2, 2), clamp(xa[1] - eta * mh[1] / (Math.sqrt(vh[1]) + 1e-8), -2, 2)]; adam.push(xa);
    }
    return { sgd, mom, adam };
  }, [eta, sigma]);
  const ballRadius = Math.sqrt(eta * sigma * sigma / (2 * 1));
  const paths = [];
  if (show.sgd) paths.push({ pts: traces.sgd, color: '#fb7185', width: 1.5, head: traces.sgd[traces.sgd.length - 1] });
  if (show.mom) paths.push({ pts: traces.mom, color: '#a5b4fc', width: 1.5, head: traces.mom[traces.mom.length - 1] });
  if (show.adam) paths.push({ pts: traces.adam, color: '#6ee7b7', width: 2, head: traces.adam[traces.adam.length - 1] });
  const Toggle = ({ k, label, color }) => (
    <button onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))} className={`px-2 py-1 rounded border text-[10px] font-mono ${show[k] ? chipPalette[color] : 'border-white/10 text-neutral-500'}`}>{label}</button>
  );
  return (
    <Card id="sgd" icon={Dices} title="Stochastic optimization & SGD" accent="indigo" index={16}
          source="Ruder 2016; Kingma & Ba (Adam)" subtitle="A blurred compass — and the optimizers that thrive on it">
      <Intuition>
        <p>
          Until now the compass pointed <em>exactly</em> downhill. But suppose you can only read it on a foggy day — each
          glance gives the true direction plus a random kick. That's machine learning: you never see the gradient of the{' '}
          <em>whole</em> dataset, only a noisy sample from one mini-batch. Descent becomes a tipsy walk — it drifts
          toward the valley but near the bottom can't sit still, rattling around a small <Term>noise ball</Term> whose
          radius is set by the learning rate. Surprisingly, that jitter is often a feature.
        </p>
      </Intuition>

      <Block>{'\\dir{x_{t+1}} = \\dir{x_t} - \\eta\\,\\obj{\\hat g_t}, \\quad \\obj{\\hat g_t} = \\nabla f(\\dir{x_t}) + \\inf{\\xi_t}, \\ \\mathbb{E}[\\inf{\\xi_t}]=0,\\ \\operatorname{Var}=\\sigma^2'}</Block>
      <Block>{'\\dir{m_t} = \\beta_1 \\dir{m_{t-1}} + (1{-}\\beta_1)\\obj{\\hat g_t}, \\quad \\dir{v_t} = \\beta_2 \\dir{v_{t-1}} + (1{-}\\beta_2)\\obj{\\hat g_t}^{2}, \\quad \\dir{x_{t+1}} = \\dir{x_t} - \\eta\\,\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\varepsilon}'}</Block>
      <ReadEq>
        <Eq>{'m'}</Eq> is an EMA of the gradient (momentum); <Eq>{'v'}</Eq> is an EMA of the <em>squared</em> gradient
        (each coordinate's scale). Divide mean by root-scale: big-gradient coordinates get <em>shrunk</em>,
        small-gradient ones <em>boosted</em> — every coordinate ends up stepping ≈η. (<Eq>{'\\beta_1{=}0.9,\\ \\beta_2{=}0.999'}</Eq>.)
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-[10px] font-mono text-neutral-400">
          <label className="flex items-center gap-1">η <input type="range" min="0.01" max="0.25" step="0.01" value={eta} onChange={(e) => setEta(+e.target.value)} className="opt-range w-24" /><span className="w-8 text-neutral-200">{eta.toFixed(2)}</span></label>
          <label className="flex items-center gap-1">σ <input type="range" min="0" max="2" step="0.1" value={sigma} onChange={(e) => setSigma(+e.target.value)} className="opt-range w-24" /><span className="w-8 text-neutral-200">{sigma.toFixed(1)}</span></label>
          <Toggle k="sgd" label="SGD" color="rose" /><Toggle k="mom" label="+momentum" color="indigo" /><Toggle k="adam" label="Adam" color="emerald" />
        </div>
        <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
          <ContourPlot f={(x, y) => 0.5 * (10 * x * x + y * y)} xRange={[-1.6, 1.6]} yRange={[-1.6, 1.6]} width={360} height={260} nLevels={8}
            paths={paths} markers={[{ x: 0, y: 0, label: 'min', color: '#f0abfc' }]}
            xLabel="x (stiff, curv 10)" yLabel="y (soft, curv 1)" caption="ill-conditioned 10:1 bowl, shared seeded noise · SGD crawls the soft axis, Adam equalizes" />
          <div className="space-y-2 text-xs">
            <Stat label="noise-ball radius" value={`∝ √η = ${ballRadius.toFixed(3)}`} sub="halve η → ×0.71 radius" color="text-amber-300" />
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug">
              Under shared η, the <strong>stiff</strong> x-axis (curvature 10) collapses in ~1 step while the{' '}
              <strong>soft</strong> y-axis (curvature 1) shrinks 0.9×/step — plain SGD <span className="text-rose-300">crawls along y</span>.{' '}
              <span className="text-emerald-300">Adam</span> divides each axis by its own gradient scale, so both descend
              at ≈η — it reaches near-diagonal points like (−0.005, −0.005). Past <Eq>{'\\eta>2/10=0.2'}</Eq> the stiff axis diverges.
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        A noisy gradient turns descent into a random walk that <strong>drifts down but never stops</strong> — it settles
        into a noise ball of radius <Eq>{'\\propto\\sqrt\\eta'}</Eq> (at fixed noise σ). To land on a point, <strong>shrink η over time.</strong>{' '}
        <Term>Adam</Term> keeps a per-coordinate running scale (EMA of g²) and divides by it, so every coordinate
        self-tunes to a step ≈η — why it just works on wildly anisotropic losses.
      </MinSchema>

      <Predict question="On the convex bowl, you halve the learning rate η. What happens to the radius of the noise ball SGD settles into?">
        It shrinks, but <strong>not</strong> by half — by <strong>1/√2 ≈ 0.71</strong>. The stationary variance scales
        like η, so the <em>radius</em> (a standard deviation) scales like √η. This is exactly why learning-rate{' '}
        <em>decay</em> works: each halving tightens the orbit ~30%, slowly squeezing the iterate onto the minimum.
      </Predict>

      <Misconception
        wrong="Adam adapts the learning rate, so I never have to tune it."
        right="Adam adapts the per-coordinate scaling of a single global step η; you still choose η (and it still matters)."
        because="The v̂ term equalizes the relative step across coordinates by dividing out each coordinate's gradient magnitude. But the base η is global — too large still diverges, too small still crawls. Adam removes per-coordinate tuning, not η tuning." />

      <Worked title="One Adam step by hand">
        <p>
          Minimize <Eq>{'\\tfrac12x^2'}</Eq> (so <Eq>{'g=x'}</Eq>) from <Eq>{'x_0=1'}</Eq>,{' '}
          <Eq>{'\\eta{=}0.1'}</Eq>. Step 1: <Eq>{'g=1'}</Eq>. <Eq>{'m_1=0.1,\\ v_1=0.001'}</Eq>. Bias-correct:{' '}
          <Eq>{'\\hat m=0.1/0.1=1,\\ \\hat v=0.001/0.001=1'}</Eq>. Update <Eq>{'x_1=1-0.1\\cdot(1/\\sqrt1)=0.9'}</Eq>.
          The step has magnitude ≈η <em>regardless of the gradient's size</em>, because{' '}
          <Eq>{'\\hat m/\\sqrt{\\hat v}=g/\\sqrt{g^2}=\\text{sign}(g)'}</Eq>. That self-normalization is the whole point.
          (Continuing: 0.800, 0.702, 0.604, 0.508.)
        </p>
      </Worked>

      <Deeper>
        <p>
          SGD discretizes a <em>stochastic</em> gradient flow <Eq>{'dx = -\\nabla f\\,dt + \\sqrt{\\eta}\\,dW'}</Eq> — a
          Langevin SDE. The noise term is what stops the iterate sitting exactly at a minimum; its stationary spread is{' '}
          <Eq>{'\\propto\\sqrt\\eta'}</Eq>. <strong>Why a little noise helps:</strong> the same jitter lets you{' '}
          <em>escape</em> shallow traps and saddles (card 17) — large η early = basin-hopping exploration, small η late =
          fine convergence. Full-batch GD converges to a point but gets stuck in the first basin; mini-batch noise buys
          basin-hopping for free. Too much noise (huge η, tiny batch) and the ball swallows the minimum.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why divide by √v̂ and not v̂?', a: 'v̂ estimates E[g²], so √v̂ is the scale (std) of the gradient. Dividing the mean by its scale gives a unit-free ≈O(1) step — a per-coordinate z-score. Dividing by v̂ itself would overcorrect and shrink the step as the square of the gradient.' },
        { q: 'What does bias-correction fix?', a: 'm and v start at 0, so early EMAs are biased toward zero. Dividing by (1−βᵗ) rescales to unbiased estimates — a 1000× correction for v at t=1, fading to 1 as t grows.' },
        { q: 'Mini-batch size vs noise?', a: 'Gradient-estimate variance scales like σ²/B for batch size B. Bigger batch = less noise = smaller ball but more compute per step. Some noise is desirable for escaping saddles.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="momentum" recap="Heavy-ball momentum averages past gradients to power through ravines.">momentum (card 5)</CrossLink>
        <CrossLink to="newton" recap="Adam fakes per-axis curvature scaling without a Hessian — diagonal H⁻¹.">conditioning & Newton</CrossLink>
        <CrossLink to="nonconvex" recap="The noise that stops SGD sitting still is what lets it escape saddles.">non-convexity & saddles</CrossLink>
        <CrossLink to="machine-learning" external recap="Training a neural net IS minimizing a noisy loss with SGD/Adam.">machine-learning explainer</CrossLink>
      </div>
    </Card>
  );
};
const NonconvexCard = () => {
  const [start, setStart] = useState([0.08, 0.05]);
  const [sigma, setSigma] = useState(0.12);
  const [dim, setDim] = useState(50);
  const traces = useMemo(() => {
    const gd = [start.slice()], sg = [start.slice()];
    let xg = start.slice(), xs = start.slice(); const rng = mulberry32(7);
    for (let k = 0; k < 160; k++) {
      let g = f2grad(xg[0], xg[1]); xg = [clamp(xg[0] - 0.02 * g[0], -2, 2), clamp(xg[1] - 0.02 * g[1], -1.5, 1.5)]; gd.push(xg);
      g = f2grad(xs[0], xs[1]); xs = [clamp(xs[0] - 0.02 * (g[0] + sigma * randn(rng)), -2, 2), clamp(xs[1] - 0.02 * (g[1] + sigma * randn(rng)), -1.5, 1.5)]; sg.push(xs);
    }
    return { gd, sg };
  }, [start, sigma]);
  const prev = useMemo(() => {
    const pmin = [], psad = [];
    for (let n = 1; n <= 30; n++) { pmin.push([n, Math.pow(0.5, n)]); psad.push([n, 1 - 2 * Math.pow(0.5, n)]); }
    return { pmin, psad };
  }, []);
  const pSaddle = 1 - 2 * Math.pow(0.5, dim);
  return (
    <Card id="nonconvex" icon={Mountain} title="Non-convexity & saddle points" accent="rose" index={17}
          source="Dauphin et al. 2014" subtitle="Many valleys, and a sea of saddles">
      <Intuition>
        <p>
          Convexity was the magic that made <em>downhill until blocked</em> equal <em>globally best</em>. Strip it away
          and the landscape grows multiple valleys, ridges between them, and — the real story in high dimensions — vast
          numbers of <Term>saddle point</Term>s: a minimum along some directions, a maximum along others, like a
          mountain pass. Your 2-D intuition fears getting stuck in a shallow valley; in a million-dimensional loss,
          almost every flat point is a <em>saddle</em>, not a trap — and a saddle is escapable if you can find even one
          downhill direction.
        </p>
      </Intuition>

      <Block>{'\\nabla f(\\dir{x^\\star})=0,\\ H=\\nabla^2 f: \\begin{cases} \\text{all } \\lambda_i>0 & \\Rightarrow \\obj{\\text{min}} \\\\ \\text{all } \\lambda_i<0 & \\Rightarrow \\text{max} \\\\ \\text{mixed} & \\Rightarrow \\inf{\\text{saddle}} \\end{cases} \\qquad \\mathbb{P}(\\obj{\\text{min}})=\\Big(\\tfrac12\\Big)^{n}\\xrightarrow{n\\to\\infty}0'}</Block>
      <ReadEq>
        at a flat point, read the Hessian's eigenvalues — the curvatures along its axes. All positive: a bowl
        (minimum); mixed signs: a saddle. If each axis is equally likely to curve up or down, the chance <em>all</em>{' '}
        <Eq>{'n'}</Eq> curve up is <Eq>{'(1/2)^n'}</Eq> — vanishing as dimension grows. Almost everything flat is a saddle.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-[10px] font-mono text-neutral-400">
          <button onClick={() => setStart([0.08, 0.05])} className="px-2 py-1 rounded border border-white/10 text-neutral-300">drop on ridge</button>
          <button onClick={() => setStart([(Math.random() * 3.6 - 1.8), (Math.random() * 2.4 - 1.2)])} className="px-2 py-1 rounded border border-white/10 text-neutral-300">drop random</button>
          <label className="flex items-center gap-1">SGD σ <input type="range" min="0" max="0.5" step="0.02" value={sigma} onChange={(e) => setSigma(+e.target.value)} className="opt-range w-24" /><span className="w-8 text-neutral-200">{sigma.toFixed(2)}</span></label>
          <span className="text-neutral-500">click the plot to drop a ball</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <ContourPlot f={f2} xRange={[-2, 2]} yRange={[-1.5, 1.5]} width={340} height={260} nLevels={9} onPick={setStart}
            point={{ x: start[0], y: start[1] }}
            paths={[{ pts: traces.gd, color: '#fb7185', width: 1.6, head: traces.gd[traces.gd.length - 1] }, { pts: traces.sg, color: '#a5b4fc', width: 1.6, head: traces.sg[traces.sg.length - 1] }]}
            markers={f2crit.map((c) => ({ x: c.x, y: 0, label: c.kind.split(' ')[0], color: c.color }))}
            xLabel="x" yLabel="y" caption="rose = plain GD · indigo = SGD · drop near the saddle: GD stalls, SGD's jitter kicks it into a basin" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">P(local min) = (½)ⁿ — saddles dominate</div>
            <MultiLinePlot
              series={[
                { pts: prev.psad, color: '#fb7185', width: 2, label: 'P(saddle)' },
                { pts: prev.pmin, color: '#6ee7b7', width: 2, label: 'P(min) = (½)ⁿ' },
              ]}
              xRange={[1, 30]} yRange={[0, 1]} xLabel="dimension n" yLabel="P" width={340} height={200}
              yTicks={[0, 0.5, 1]} vlines={[{ at: dim, color: '#f0abfc' }]} />
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
              <span className="text-neutral-500">n</span>
              <input type="range" min="1" max="100" step="1" value={dim} onChange={(e) => setDim(+e.target.value)} className="opt-range flex-1" />
              <span className="text-rose-300">P(saddle) @ n={dim} = {(pSaddle * 100).toFixed(dim > 12 ? 6 : 2)}%</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">In 50 dimensions, fewer than 1 in 10¹⁵ flat points is a minimum.</div>
          </div>
        </div>
      </div>

      <MinSchema>
        Without convexity, <strong>local-blocked ≠ globally-best</strong>: many valleys, ridges between. The 2-D fear is
        a shallow trap; the high-D reality is a <em>sea of saddles</em> — <Eq>{'(1/2)^n'}</Eq> of flat points are minima,
        so almost none are. Saddles need only <strong>one</strong> downhill direction to escape, and a little stochastic
        noise finds it. That's why SGD trains networks that "shouldn't" be optimizable.
      </MinSchema>

      <Predict question="A 100-dimensional loss has many points where the gradient is zero. Roughly what fraction are local minima (vs saddles)?">
        Essentially <strong>none</strong> — about <Eq>{'(1/2)^{100}\\approx 8\\times10^{-31}'}</Eq>. Over 99.99…% are
        saddles. The naive worry ("I'll get trapped in a bad local minimum") has it backwards: in high dimensions you
        almost never <em>hit</em> a minimum by accident; you spend your time near escapable saddles. The minima you do
        reach tend to be nearly as good as the global one.
      </Predict>

      <Misconception
        wrong="Deep learning works despite getting stuck in bad local minima."
        right="In high dimensions, bad local minima are exponentially rare; the real obstacle is slowdown near saddles, which noise escapes."
        because="For a critical point to be a poor local minimum, every eigenvalue must be positive AND the value high — doubly unlikely in high-D. Most flat regions are saddles where a descent direction still exists; plain GD crawls, SGD's noise slides off." />

      <Worked title="Classifying the critical points of the double-well">
        <p>
          For <Eq>{'f=(x^2-1)^2+y^2+0.3x'}</Eq>: <Eq>{'\\partial_x f=4x^3-4x+0.3'}</Eq>, <Eq>{'\\partial_y f=2y'}</Eq>.
          Stationary ⇒ y=0 and three roots x = −1.036, +0.075, +0.960. Hessian is diagonal:{' '}
          <Eq>{'\\partial_{xx}=12x^2-4,\\ \\partial_{yy}=2'}</Eq>. At −1.036: eigs (8.87, 2) → <strong>min</strong>{' '}
          (deepest, f=−0.305). At +0.960: (7.06, 2) → <strong>min</strong>. At +0.075: (−3.93, 2) — mixed →{' '}
          <strong>saddle</strong>. The +0.3x tilt makes the left well deeper, so there's a unique global min.
        </p>
      </Worked>

      <Deeper>
        <p>
          Two minima with the same value can differ in <em>curvature</em>: a <Term>sharp/flat minimum</Term> sits in a
          narrow / wide basin. <strong>Flat minima are believed to generalize better</strong> — a small data or
          parameter shift barely changes the loss. SGD's noise has a built-in bias toward them: the noise ball of radius{' '}
          <Eq>{'\\propto\\sqrt\\eta'}</Eq> can't sit in a basin narrower than itself, so large-step SGD is repelled from
          sharp minima. This is one story for why small-batch SGD often generalizes better than huge batches (less noise
          → smaller ball → settles into sharper, worse minima). Eigenvalue <em>signs</em> (saddles) and{' '}
          <em>magnitudes</em> (sharp/flat) are the two halves of reading a Hessian.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is a 1-D function ever a saddle?', a: "Not strictly — with one variable a stationary point is a min, a max, or an inflection. 'Saddle' needs ≥2 dimensions to curve up one way and down another." },
        { q: 'Why is escaping a saddle easier than escaping a minimum?', a: 'A saddle has a direction of negative curvature — a downhill escape route. A local minimum has no descent direction; noise that wouldn\'t budge you from a minimum will eventually push you along a saddle\'s downhill axis.' },
        { q: 'Does momentum help with saddles?', a: 'Yes — momentum carries velocity through the near-zero-gradient flat region instead of grinding to a halt. Momentum + noise is a strong saddle-escape combo.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="convexity" recap="Convexity guarantees one bowl so local=global; this card is what happens when that guarantee is gone.">convexity (card 6)</CrossLink>
        <CrossLink to="optimality" recap="∇f=0 plus the Hessian's eigenvalue signs is the min/max/saddle test.">optimality conditions</CrossLink>
        <CrossLink to="sgd" recap="SGD's √η noise ball is precisely what kicks the iterate off a saddle.">SGD noise (card 16)</CrossLink>
        <CrossLink to="global" recap="When there are many basins and no gradient, you need global search.">global search (card 18)</CrossLink>
      </div>
    </Card>
  );
};
const GRID18 = Array.from({ length: 121 }, (_, i) => i * 5 / 120);
const GlobalCard = () => {
  const [tab, setTab] = useState('sa');
  // --- SA ---
  const [T0, setT0] = useState(10), [alpha, setAlpha] = useState(0.95);
  const saPath = useMemo(() => {
    const rng = mulberry32(99); let x = 4.3, fx = fbb(x), T = T0; const path = [{ x, T }];
    for (let i = 0; i < 300; i++) { const xp = clamp(x + 0.4 * randn(rng), 0, 5); const fp = fbb(xp); const d = fp - fx; if (d <= 0 || rng() < Math.exp(-d / T)) { x = xp; fx = fp; } if (i % 5 === 4) T *= alpha; path.push({ x, T }); }
    return path;
  }, [T0, alpha]);
  const [si, setSi] = useState(0);
  useEffect(() => { setSi(0); }, [T0, alpha, tab]);
  useReplayOnEnter(() => setSi(0));
  const accSa = useRef(0);
  useRaf(tab === 'sa' && si < saPath.length - 1, (dt) => { accSa.current += dt; if (accSa.current > 0.03) { accSa.current = 0; setSi((s) => Math.min(saPath.length - 1, s + 2)); } });
  const saCur = saPath[Math.min(si, saPath.length - 1)];
  // --- BayesOpt ---
  const [obs, setObs] = useState({ X: [1, 4], Y: [fbb(1), fbb(4)] });
  const [acqMode, setAcqMode] = useState('ei'), [kappa, setKappa] = useState(2);
  const post = useMemo(() => gpPosterior(obs.X, obs.Y, GRID18, 1), [obs]);
  const fPlus = Math.min(...obs.Y);
  const acq = useMemo(() => post.map((p) => {
    if (acqMode === 'ei') { const z = (fPlus - p.mean) / (p.sd + 1e-9); return Math.max(0, (fPlus - p.mean) * normCdf(z) + p.sd * normPdf(z)); }
    return -(p.mean - kappa * p.sd); // higher = better (we minimize, so probe argmax of −LCB)
  }), [post, acqMode, kappa, fPlus]);
  const probe = () => { let bi = 0; for (let i = 1; i < acq.length; i++) if (acq[i] > acq[bi]) bi = i; const nx = GRID18[bi]; setObs((o) => ({ X: [...o.X, nx], Y: [...o.Y, fbb(nx)] })); };
  // plot helpers (shared frame)
  const W = 360, H = 220, padL = 30, padR = 12, padT = 10, padB = 22;
  const xR = [0, 5], yR = [-0.6, 3.4];
  const sx = (x) => padL + ((x - xR[0]) / (xR[1] - xR[0])) * (W - padL - padR);
  const sy = (y) => padT + (1 - (y - yR[0]) / (yR[1] - yR[0])) * (H - padT - padB);
  const fbbPath = GRID18.map((x) => `${sx(x).toFixed(1)},${sy(fbb(x)).toFixed(1)}`).join(' ');
  const aMax = Math.max(...acq, 1e-9);
  return (
    <Card id="global" icon={Globe} title="Global & black-box optimization" accent="violet" index={18}
          source="Kirkpatrick 1983; Shahriari et al." subtitle="No gradient, many basins — search smart, not steep">
      <Intuition>
        <p>
          Sometimes the landscape gives you nothing to grab: no formula, no gradient, just a box you feed an input and
          read an output — a simulation, an experiment, a hyperparameter sweep that takes an hour per run. Steepest
          descent is useless, and with many basins any greedy method dives into the nearest valley and stops. The escape
          is counterintuitive: sometimes accept a step that goes <em>uphill</em>. <Term>simulated annealing</Term> does
          this with a temperature that cools; <Term>Bayesian optimization</Term> models the box and spends each probe
          where the payoff-or-information is highest.
        </p>
      </Intuition>

      <Block>{'P(\\text{accept}) = \\begin{cases} 1 & \\Delta \\le 0 \\\\ e^{-\\Delta / T} & \\Delta > 0\\,(\\inf{\\text{uphill}}) \\end{cases},\\ T\\leftarrow\\alpha T \\qquad \\text{EI}(x) = (\\obj{f^{+}}{-}\\mu)\\Phi(z) + \\sigma\\phi(z)'}</Block>
      <ReadEq>
        <strong>SA:</strong> always take downhill; for an uphill move of size <Eq>{'\\Delta'}</Eq>, accept with
        probability <Eq>{'e^{-\\Delta/T}'}</Eq> — hot T lets big jumps through, cooling settles the search.{' '}
        <strong>EI:</strong> weigh how much better than the best-so-far <Eq>{'f^+'}</Eq> you <em>expect</em> (exploit)
        against how <em>uncertain</em> you are (explore, the <Eq>{'\\sigma\\phi'}</Eq> term).
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setTab('sa')} className={`px-3 py-1 rounded border text-[11px] font-mono ${tab === 'sa' ? chipPalette.rose : 'border-white/10 text-neutral-500'}`}>simulated annealing</button>
          <button onClick={() => setTab('bo')} className={`px-3 py-1 rounded border text-[11px] font-mono ${tab === 'bo' ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>Bayesian optimization</button>
        </div>
        {tab === 'sa' ? (
          <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-lg border border-white/10 bg-black/20">
              <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.12)" />
              <polyline fill="none" stroke="#94a3b8" strokeWidth="1.5" points={fbbPath} />
              <circle cx={sx(saCur.x)} cy={sy(fbb(saCur.x))} r="5" fill="#fb7185" stroke="#0a0a0a" strokeWidth="1.5" />
              <text x={W - padR} y={padT + 8} fontSize="9" textAnchor="end" fill="#fbbf24" fontFamily="ui-monospace">T = {saCur.T.toFixed(2)}</text>
            </svg>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400"><span>T₀</span><input type="range" min="1" max="20" step="1" value={T0} onChange={(e) => setT0(+e.target.value)} className="opt-range w-28" /><span className="text-neutral-200">{T0}</span></div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400"><span>α</span><input type="range" min="0.8" max="0.99" step="0.01" value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="opt-range w-28" /><span className="text-neutral-200">{alpha.toFixed(2)}</span></div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug">
                accept an uphill <Eq>{'\\Delta{=}1'}</Eq> move: at <span className="text-rose-300">T=10 → 90%</span>, T=1 → 37%, T=0.25 → <span className="text-neutral-300">1.8%</span>. Cool too fast (α≈0.8) and it freezes in the nearest local min; α≈0.99 explores longer and finds the global basin near x≈1.5.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
            <div>
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-lg border border-white/10 bg-black/20">
                <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.1)" />
                <polygon points={`${post.map((p) => `${sx(p.x).toFixed(1)},${sy(p.mean + 2 * p.sd).toFixed(1)}`).join(' ')} ${post.slice().reverse().map((p) => `${sx(p.x).toFixed(1)},${sy(p.mean - 2 * p.sd).toFixed(1)}`).join(' ')}`} fill="rgba(110,231,208,0.12)" />
                <polyline fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1" strokeDasharray="3 3" points={fbbPath} />
                <polyline fill="none" stroke="#6ee7b7" strokeWidth="2" points={post.map((p) => `${sx(p.x).toFixed(1)},${sy(p.mean).toFixed(1)}`).join(' ')} />
                {obs.X.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(obs.Y[i])} r="3.5" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1" />)}
                {/* acquisition curve, scaled into a strip at the bottom */}
                <polyline fill="none" stroke="#a5b4fc" strokeWidth="1.5" points={acq.map((a, i) => `${sx(GRID18[i]).toFixed(1)},${(H - padB - (a / aMax) * 30).toFixed(1)}`).join(' ')} />
              </svg>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">gray dash = hidden truth · emerald = GP mean ±2σ · amber = probes · indigo = acquisition</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button onClick={() => setAcqMode('ei')} className={`px-2 py-1 rounded border ${acqMode === 'ei' ? chipPalette.emerald : 'border-white/10 text-neutral-500'}`}>EI</button>
                <button onClick={() => setAcqMode('lcb')} className={`px-2 py-1 rounded border ${acqMode === 'lcb' ? chipPalette.indigo : 'border-white/10 text-neutral-500'}`}>LCB</button>
                {acqMode === 'lcb' && <label className="flex items-center gap-1 text-neutral-400">κ<input type="range" min="0" max="3" step="0.5" value={kappa} onChange={(e) => setKappa(+e.target.value)} className="opt-range w-16" />{kappa}</label>}
              </div>
              <div className="flex gap-2">
                <button onClick={probe} className="px-2 py-1 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 text-[11px] font-mono">probe next</button>
                <button onClick={() => setObs({ X: [1, 4], Y: [fbb(1), fbb(4)] })} className="px-2 py-1 rounded border border-white/10 text-neutral-400 text-[11px] font-mono">reset</button>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug">
                {obs.X.length} probes · best so far <span className="text-emerald-300 font-mono">{fPlus.toFixed(3)}</span>. The
                first probe lands in the <strong>wide-uncertainty gap</strong> near x≈2.5 (sd≈0.89) — exploration — not at
                the current best. Keep probing: the GP homes in on the global basin.
              </div>
            </div>
          </div>
        )}
      </div>

      <MinSchema>
        When the box has no gradient and many basins, <strong>don't be greedy.</strong> Simulated annealing accepts
        uphill moves with probability <Eq>{'e^{-\\Delta/T}'}</Eq> and <em>cools</em> — hot = explore, cold = settle.
        Bayesian optimization models the box and probes where an <Term>acquisition function</Term> (EI / LCB) balances{' '}
        <em>exploit</em> against <em>explore</em>. Both formally answer: where is it worth looking next?
      </MinSchema>

      <Predict question="In SA with an uphill move Δ=1, you cool from T=1 to T=0.25. By roughly what factor does the chance of accepting it drop?">
        From <Eq>{'e^{-1/1}=0.368'}</Eq> to <Eq>{'e^{-1/0.25}=e^{-4}=0.018'}</Eq> — about <strong>20×</strong>. That's the
        mechanism: as T falls, the same uphill move goes from "often accepted" to "almost never," so the search
        transitions from exploring the whole landscape to committing to one basin. Cool too fast and you freeze before
        finding the deep valley.
      </Predict>

      <Misconception
        wrong="Bayesian optimization just picks the point with the best predicted value."
        right="It picks the point with the best acquisition score, which deliberately rewards uncertainty, not just a low mean."
        because="Pure exploitation gets stuck refining one basin. EI adds the σ·φ term and LCB subtracts κσ — a high-uncertainty point stays competitive even with a mediocre mean. A worse-mean (μ=1.1 vs 0.8) but more-uncertain (σ=0.8 vs 0.5) point is ranked HIGHER once we maximize the acquisition −LCB: its score is 0.50 vs 0.20 (raw LCB −0.50 vs −0.20 — we prefer the lower, more-optimistic LCB). That's exploration, by design." />

      <Worked title="One Expected-Improvement evaluation">
        <p>
          Best observed <Eq>{'f^+=1.0'}</Eq>. A candidate has <Eq>{'\\mu=0.8,\\ \\sigma=0.5,\\ \\xi=0'}</Eq>. Standardized
          improvement <Eq>{'z=(1.0-0.8)/0.5=0.4'}</Eq>. With <Eq>{'\\Phi(0.4)=0.655,\\ \\phi(0.4)=0.368'}</Eq>:{' '}
          <Eq>{'\\text{EI}=0.2(0.655)+0.5(0.368)=0.315'}</Eq>. First term = exploitation, second = exploration. A point
          with worse mean μ=1.1 but bigger σ=0.8 still earns EI=0.272 — uncertainty alone is valuable.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>SA convergence:</strong> with an impossibly-slow logarithmic schedule <Eq>{'T_k\\propto c/\\log k'}</Eq>{' '}
          SA provably finds the global optimum — real SA uses fast geometric cooling and accepts being a good heuristic.{' '}
          <strong>BayesOpt cost:</strong> fitting a GP is <Eq>{'O(m^3)'}</Eq> for m observations (kernel-matrix inverse),
          so it only pays off when each black-box evaluation is far more expensive than that overhead (a training run, a
          wet-lab experiment). For cheap boxes, random search or SA wins.
        </p>
        <p>
          <strong>The dial:</strong> κ (LCB) and ξ (EI) set the explore/exploit balance. No method dodges the{' '}
          <strong>no-free-lunch</strong> theorem: averaged over <em>all</em> objectives every search is equal — these
          win only because real objectives have structure (smoothness, few basins) to exploit.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why accept uphill moves at all?', a: 'To escape local minima. A purely downhill search dives into the first valley and stays. Occasionally climbing out — more freely when hot — lets the search reach a deeper valley it would otherwise never find.' },
        { q: 'EI vs LCB — when to use which?', a: 'Both balance explore/exploit; LCB exposes the dial explicitly via κ, while EI auto-balances. EI can be too greedy when σ is small everywhere; large-κ LCB is more aggressively exploratory. In practice they perform similarly; EI is the common default.' },
        { q: 'Where does this show up for a practitioner?', a: 'Hyperparameter tuning (learning rate, depth, regularization) is the canonical black box: each evaluation is a full training run, the objective is noisy, and there is no gradient w.r.t. hyperparameters — exactly the BayesOpt regime.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="nonconvex" recap="Many basins with no gradient is the regime that forces global search.">non-convexity (card 17)</CrossLink>
        <CrossLink to="ilp" recap="Branch-and-bound is exact global search for discrete problems; SA/BayesOpt are heuristics for continuous black boxes.">branch-and-bound</CrossLink>
        <CrossLink to="forecasters-craft" external recap="Hyperparameter optimization is the canonical Bayesian-optimization use case.">forecaster's craft (HPO)</CrossLink>
        <CrossLink to="anchor" recap="The 'which method when?' guide keys off problem structure.">the anchor scorecard</CrossLink>
      </div>
    </Card>
  );
};
const LENS_LIST = [
  { k: 'unc', label: 'unconstrained', verdict: "Ignore the walls and you'd roast 366.7 kg of beans you don't have." },
  { k: 'lp', label: 'LP / simplex', verdict: 'Linear profit ⇒ optimum is a corner; simplex walks edges to (16.25, 7.5), $198.75.' },
  { k: 'kkt', label: 'KKT', verdict: 'Smooth profit ⇒ tangency on one wall (roaster) at (16.36, 7.27); beans & labor slack.' },
  { k: 'dual', label: 'dual / prices', verdict: 'Resources priced from the other side sum to the same $198.75 — strong duality.' },
  { k: 'int', label: 'integer / B&B', verdict: 'Whole bags ⇒ round(LP)=(16,8) is infeasible; B&B finds (15, 9), $198.' },
  { k: 'sgd', label: 'stochastic', verdict: 'Noisy demand ⇒ noisy gradient; SGD orbits the optimum in a noise ball.' },
];
const GUIDE = [
  ['smooth + unconstrained', 'gradient descent / Newton', 'descent'],
  ['smooth convex, equality constraint', 'Lagrange multipliers', 'lagrange'],
  ['smooth convex, inequality constraints', 'KKT / interior-point', 'kkt'],
  ['linear objective + linear constraints', 'simplex / LP', 'lp'],
  ['LP + integer variables', 'branch-and-bound', 'ilp'],
  ['sequential / staged decisions', 'dynamic programming', 'dp'],
  ['noisy / large-data gradient', 'SGD / Adam', 'sgd'],
  ['many basins, no gradient', 'simulated annealing / Bayesian opt', 'global'],
];
const AnchorCard = () => {
  const [lens, setLens] = useState('kkt');
  const sgdPath = useMemo(() => {
    const rng = mulberry32(3); const pts = [[11, 12]]; let x = [11, 12];
    for (let k = 0; k < 70; k++) { const g = gradBowl(x[0], x[1]); x = [clamp(x[0] - 0.6 * (g[0] + 0.25 * randn(rng)), 0, 22), clamp(x[1] - 0.6 * (g[1] + 0.25 * randn(rng)), 0, 14)]; pts.push(x); }
    return pts;
  }, []);
  const cur = LENS_LIST.find((l) => l.k === lens);
  const props = { f: roastProfit, xRange: [0, 22], yRange: [0, 14], width: 360, height: 280, nLevels: 8, xLabel: 'x₁ espresso (kg/day)', yLabel: 'x₂ filter (kg/day)' };
  if (lens === 'unc') props.markers = [{ x: 21, y: 12.5, label: 'peak (296,11) ↗', color: '#fb7185' }];
  if (lens === 'lp') { props.constraints = WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color })); props.paths = [{ pts: [[0, 0], [20, 0], [16.25, 7.5]], color: '#6ee7b7', width: 2.2, dots: true, head: [16.25, 7.5] }]; props.markers = [{ x: 16.25, y: 7.5, label: 'LP $198.75', color: '#f0abfc' }]; }
  if (lens === 'kkt') { props.grad = roastGrad; props.constraints = [{ a: WALLS[1].a, b: WALLS[1].b, color: WALLS[1].color }]; props.point = { x: 16.364, y: 7.273 }; props.extraVectors = [{ vec: [8.4364, 4.2182], color: '#a5b4fc', marker: 'up', lenPx: 40 }, { vec: [0.2, 0.1], color: '#fbbf24', marker: 'dn', lenPx: 34 }]; props.markers = [{ x: 16.364, y: 7.273, label: 'μ=42.18', color: '#f0abfc' }]; }
  if (lens === 'dual') props.constraints = WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color }));
  if (lens === 'int') { props.constraints = WALLS.map((w) => ({ a: w.a, b: w.b, color: w.color })); const lat = []; for (let i = 0; i <= 22; i++) for (let j = 0; j <= 14; j++) if (feasibleAt(i, j)) lat.push({ x: i, y: j, color: 'rgba(103,232,249,0.4)', r: 1.5 }); props.markers = [...lat, { x: 16, y: 8, label: '✗ (16,8)', color: '#fb7185', r: 4 }, { x: 15, y: 9, label: '✓ (15,9) $198', color: '#f0abfc', r: 5 }]; }
  if (lens === 'sgd') { props.paths = [{ pts: sgdPath, color: '#fb7185', width: 1.5, head: sgdPath[sgdPath.length - 1] }]; props.markers = [{ x: 16.364, y: 7.273, label: 'optimum', color: '#f0abfc' }]; }
  return (
    <Card id="anchor" icon={Coffee} title="The Roastery, solved every way" accent="fuchsia" index={19} anchor
          source="synthesis" subtitle="One shop, one stationarity picture — six lenses">
      <Intuition>
        <p>
          One coffee shop. One 2-D plot of (Espresso <Eq>{'x_1'}</Eq>, Filter <Eq>{'x_2'}</Eq>) in kg/day. Every method
          you've met is a different question asked of <em>this same picture</em>: "where's the peak if nothing stops
          me?", "where's the peak inside the walls?", "what is one more roaster-hour worth?", "what if I can only make
          whole bags?", "what if tomorrow's demand is a guess?" The shop never changes — only the lens does.
        </p>
      </Intuition>

      <Block>{'\\nabla \\obj{f}(x^\\star) = \\sum_i \\con{\\mu_i}\\,\\nabla \\con{g_i}(x^\\star), \\qquad \\con{\\mu_i}\\,\\con{g_i}(x^\\star)=0,\\ \\con{\\mu_i}\\ge 0'}</Block>
      <ReadEq>
        at the best mix, your pull uphill on profit is exactly balanced by the walls pushing back; each wall's push{' '}
        <Eq>{'\\con{\\mu_i}'}</Eq> is its shadow price; any wall you're not leaning on pushes with zero force. Every
        lens below is a special case of this one equation.
      </ReadEq>

      <div className="my-3 rounded-xl border border-fuchsia-400/20 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px] font-mono">
          {LENS_LIST.map((l) => (
            <button key={l.k} onClick={() => setLens(l.k)} className={`px-2 py-1 rounded border ${lens === l.k ? chipPalette.fuchsia : 'border-white/10 text-neutral-500'}`}>{l.label}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
          <ContourPlot {...props} caption="same profit surface; the lens changes the overlay" />
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 p-3 text-[12px] text-fuchsia-100 leading-snug">
              <span className="text-[10px] uppercase tracking-widest text-fuchsia-300">{cur.label}</span>
              <div className="mt-1">{cur.verdict}</div>
            </div>
            {lens === 'dual' && (
              <table className="w-full text-[11px] font-mono border border-white/10 rounded overflow-hidden">
                <tbody>
                  <tr className="border-b border-white/5"><td className="px-2 py-1 text-neutral-400">beans</td><td className="px-2 py-1 text-right text-amber-300">$6.25/kg</td></tr>
                  <tr className="border-b border-white/5"><td className="px-2 py-1 text-neutral-400">roaster</td><td className="px-2 py-1 text-right text-amber-300">$7.50/h</td></tr>
                  <tr><td className="px-2 py-1 text-neutral-400">labor</td><td className="px-2 py-1 text-right text-neutral-500">$0.00 (idle 1.25h)</td></tr>
                </tbody>
              </table>
            )}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-snug text-neutral-400">
              <strong className="text-neutral-200">which method when?</strong>
              <div className="mt-1 space-y-0.5">
                {GUIDE.map((g, i) => (
                  <div key={i} className="flex items-baseline gap-1">
                    <span className="text-neutral-500">{g[0]} →</span>
                    <CrossLink to={g[2]} recap={`jump to ${g[1]}`}>{g[1]}</CrossLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        One shop, one stationarity picture (<Eq>{'\\nabla f = \\sum\\mu_i\\nabla g_i'}</Eq>). Smooth → tangency, linear →
        corner, discrete → lattice, noisy → noise-ball. <strong>The method is dictated by the shape of the landscape,
        not by taste.</strong>
      </MinSchema>

      <Predict question="Before any solve: where's the profit-max blend, and what's an extra roaster-hour worth?">
        <strong>Optimal mix ≈ (16.25, 7.5) kg</strong> at $198.75/day (LP), or <strong>(16.36, 7.27)</strong> at
        $183.45/day (smooth-concave). An extra <strong>roaster-hour is worth $7.50</strong>, an extra <strong>kg of beans
        $6.25</strong>, and an extra <strong>labor-hour is worth $0.00</strong> — you already have 1.25 idle labor-hours.
        Did you guess labor was valuable? It isn't — that surprise is complementary slackness.
      </Predict>

      <Misconception
        wrong="More of every resource always raises profit, so every shadow price is positive."
        right="Labor's shadow price here is exactly $0.00 — you only use 2.75 of 4 hours."
        because="Complementary slackness: a constraint that isn't binding has multiplier zero. You can't profit from relieving a wall you aren't pressed against." />

      <Worked title="Why round(LP) fails">
        <p>
          LP says (16.25, 7.5). Round to (16, 8). Beans: <Eq>{'1.2(16)+8=27.2>27'}</Eq> — <strong>infeasible</strong>.
          The true integer optimum is (15, 9): beans <Eq>{'1.2(15)+9=27.0'}</Eq> (tight), roaster{' '}
          <Eq>{'0.2(15)+0.1(9)=3.9\\le4'}</Eq>, profit <Eq>{'9(15)+7(9)=198'}</Eq>. Naive rounding overshot a wall;
          branch-and-bound has to actually search.
        </p>
      </Worked>

      <Deeper>
        <p>
          Primal: <Eq>{'\\max c^\\top x'}</Eq> s.t. <Eq>{'Ax\\le b,\\ x\\ge0'}</Eq>. Dual:{' '}
          <Eq>{'\\min b^\\top y'}</Eq> s.t. <Eq>{'A^\\top y\\ge c,\\ y\\ge0'}</Eq>. With <Eq>{'c=(9,7),\\ b=(27,4,4)'}</Eq>,
          strong duality gives <Eq>{'c^\\top x^\\star = b^\\top y^\\star = 198.75'}</Eq>. The dual reframes "how much to
          produce" as "what is each resource worth," and the two must agree at the optimum (zero gap). The shadow price{' '}
          <Eq>{'y_i^\\star=\\partial(\\text{profit})/\\partial b_i'}</Eq> is the single most actionable number a manager
          gets out of optimization: it ranks exactly which wall to loosen first.
        </p>
      </Deeper>

      <QA items={[
        { q: 'The smooth optimum (16.36, 7.27) and the LP optimum (16.25, 7.5) disagree — which is right?', a: 'Both, for different objectives. LP uses fixed margins (9,7)/kg; the concave model lets margin soften as you flood the market, pulling the mix slightly toward Espresso and stopping earlier ($183.45 vs $198.75). Same shop, different profit model.' },
        { q: 'Why does the unconstrained peak sit at (296, 11)?', a: "With no walls the concave max is Q⁻¹a. It needs 366.7 kg of beans — you have 27. The walls make this an interesting problem; the peak is a fantasy." },
        { q: 'Is the integer gap big?', a: '$198 (integer) vs $198.75 (LP relaxation) — a 0.4% gap, but the rounded point is infeasible. Small gap, hard feasibility — that\'s the real lesson.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="descent" recap="η = how far you trust the local picture.">step size</CrossLink>
        <CrossLink to="duality" recap="λ* = ∂(optimal value)/∂budget.">shadow prices</CrossLink>
        <CrossLink to="ilp" recap="round(LP) was infeasible — B&B searches.">branch & bound</CrossLink>
        <CrossLink to="autodiff" recap="Where the gradients in every smooth lens came from.">autodiff (next)</CrossLink>
      </div>
    </Card>
  );
};
const AutodiffCard = () => {
  const [mode, setMode] = useState('reverse');
  const [seed, setSeed] = useState('x1');
  const [x1, setX1] = useState(2), [x2, setX2] = useState(3);
  const v1 = x1 * x2, v2 = Math.sin(x1), v3 = v1 + v2, cx = Math.cos(x1);
  const dfx1 = x2 + cx, dfx2 = x1;
  // forward tangents
  const sx1 = seed === 'x1' ? 1 : 0, sx2 = seed === 'x2' ? 1 : 0;
  const vd1 = sx1 * x2 + x1 * sx2, vd2 = cx * sx1, vd3 = vd1 + vd2;
  // reverse adjoints: vbar3=1, vbar1=1, vbar2=1, xbar2=x1, xbar1=x2+cos x1
  const fd1 = (((x1 + 1e-6) * x2 + Math.sin(x1 + 1e-6)) - ((x1 - 1e-6) * x2 + Math.sin(x1 - 1e-6))) / 2e-6;
  const fd2 = ((x1 * (x2 + 1e-6) + Math.sin(x1)) - (x1 * (x2 - 1e-6) + Math.sin(x1))) / 2e-6;
  const W = 360, H = 210;
  const nodes = {
    x1: { x: 45, y: 55, t: 'x₁', val: x1, d: mode === 'forward' ? vd1 * 0 + (seed === 'x1' ? 1 : 0) : dfx1 },
    x2: { x: 45, y: 155, t: 'x₂', val: x2, d: mode === 'forward' ? (seed === 'x2' ? 1 : 0) : dfx2 },
    v1: { x: 165, y: 55, t: '×', val: v1, d: mode === 'forward' ? vd1 : 1 },
    v2: { x: 165, y: 155, t: 'sin', val: v2, d: mode === 'forward' ? vd2 : 1 },
    v3: { x: 280, y: 100, t: '+', val: v3, d: mode === 'forward' ? vd3 : 1 },
  };
  const edges = [['x1', 'v1'], ['x2', 'v1'], ['x1', 'v2'], ['v1', 'v3'], ['v2', 'v3']];
  const uid = React.useId().replace(/:/g, '');
  return (
    <Card id="autodiff" icon={Workflow} title="Where do gradients come from? (autodiff)" accent="cyan" index={20}
          source="Baydin et al. 2018" subtitle="The engine under every smooth method — forward vs reverse, one sweep">
      <Intuition>
        <p>
          Every method here asked for <Eq>{'\\dir{\\nabla f}'}</Eq> and assumed it was free. It isn't — someone computes
          it. Three options: nudge each input and watch <Eq>{'f'}</Eq> move (<strong>finite differences</strong> —{' '}
          <Eq>{'n{+}1'}</Eq> evaluations and roundoff noise), expand the derivative into one giant formula
          (<strong>symbolic</strong> — explodes for deep compositions), or do what frameworks do: walk the computation
          graph <strong>once forward for values, once backward for every partial.</strong> That backward walk, on a
          neural net, <em>is</em> backpropagation.
        </p>
      </Intuition>

      <Block>{'\\dir{\\bar v_i} = \\sum_{j:\\,i\\to j} \\dir{\\bar v_j}\\,\\frac{\\partial v_j}{\\partial v_i}, \\qquad \\dir{\\bar v_{\\text{out}}}=1'}</Block>
      <ReadEq>
        each node's <em>adjoint</em> <Eq>{'\\dir{\\bar v_i}'}</Eq> — how much the output changes per unit change in this
        node — is the sum, over every child it feeds, of the child's adjoint times the local derivative on that edge.
        Seed the output adjoint at 1, sweep backward, and every input's gradient falls out in one pass.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-mono">
          <button onClick={() => setMode('forward')} className={`px-2 py-1 rounded border ${mode === 'forward' ? chipPalette.indigo : 'border-white/10 text-neutral-500'}`}>forward mode</button>
          <button onClick={() => setMode('reverse')} className={`px-2 py-1 rounded border ${mode === 'reverse' ? chipPalette.cyan : 'border-white/10 text-neutral-500'}`}>reverse (backprop)</button>
          {mode === 'forward' && <span className="text-neutral-500">seed: <button onClick={() => setSeed('x1')} className={seed === 'x1' ? 'text-indigo-300' : 'text-neutral-500'}>x₁</button> / <button onClick={() => setSeed('x2')} className={seed === 'x2' ? 'text-indigo-300' : 'text-neutral-500'}>x₂</button></span>}
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-lg border border-white/10 bg-black/20">
          <defs><marker id={`ad-${uid}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={mode === 'reverse' ? '#67e8f9' : '#a5b4fc'} /></marker></defs>
          {edges.map(([a, b], i) => {
            const A = nodes[a], B = nodes[b];
            const fwd = mode === 'forward';
            return <line key={i} x1={fwd ? A.x + 18 : B.x - 18} y1={fwd ? A.y : B.y} x2={fwd ? B.x - 18 : A.x + 18} y2={fwd ? B.y : A.y} stroke={fwd ? '#a5b4fc' : '#67e8f9'} strokeWidth="1.4" opacity="0.6" markerEnd={`url(#ad-${uid})`} />;
          })}
          {Object.values(nodes).map((nd, i) => (
            <g key={i}>
              <circle cx={nd.x} cy={nd.y} r="17" fill="rgba(10,10,12,0.95)" stroke="#475569" strokeWidth="1.4" />
              <text x={nd.x} y={nd.y - 2} fontSize="9" textAnchor="middle" fill="#e2e8f0" fontFamily="ui-monospace">{nd.t}</text>
              <text x={nd.x} y={nd.y + 8} fontSize="7.5" textAnchor="middle" fill="#94a3b8" fontFamily="ui-monospace">{nd.val.toFixed(2)}</text>
              <text x={nd.x} y={nd.y + 30} fontSize="8" textAnchor="middle" fill={mode === 'reverse' ? '#67e8f9' : '#a5b4fc'} fontFamily="ui-monospace">{mode === 'reverse' ? 'v̄=' : 'v̇='}{nd.d.toFixed(2)}</text>
            </g>
          ))}
        </svg>
        <div className="grid sm:grid-cols-2 gap-2 mt-2 text-[11px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2 font-mono">
            <div className="text-neutral-400">autodiff result</div>
            <div className="text-cyan-300">∂f/∂x₁ = {dfx1.toFixed(6)}</div>
            <div className="text-cyan-300">∂f/∂x₂ = {dfx2.toFixed(6)}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2 font-mono">
            <div className="text-neutral-400">finite-diff check (h=1e-6)</div>
            <div className="text-emerald-300">{fd1.toFixed(6)} ✓ {fd2.toFixed(6)} ✓</div>
            <div className="text-neutral-500 text-[10px]">FD needs n+1 evals; reverse needs 1</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400">
          <label className="flex items-center gap-1">x₁ <input type="range" min="-3" max="3" step="0.1" value={x1} onChange={(e) => setX1(+e.target.value)} className="opt-range w-24" />{x1.toFixed(1)}</label>
          <label className="flex items-center gap-1">x₂ <input type="range" min="-3" max="3" step="0.1" value={x2} onChange={(e) => setX2(+e.target.value)} className="opt-range w-24" />{x2.toFixed(1)}</label>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1 leading-snug">
          {mode === 'forward'
            ? 'forward mode gives ONE column of the Jacobian per sweep — two inputs ⇒ two sweeps (toggle the seed).'
            : 'reverse mode gives the WHOLE gradient in ONE sweep — n inputs, one output: this is why we backprop.'}
        </div>
      </div>

      <MinSchema>
        <strong>Forward mode:</strong> derivatives ride along with values, one input per pass — cheap when inputs ≪
        outputs. <strong>Reverse mode (= backprop):</strong> seed the output at 1, sweep <Term>adjoint</Term>s backward,
        get <em>all</em> n input gradients in one pass — cheap when outputs ≪ inputs. A scalar loss over a million
        parameters is the second case, every time.
      </MinSchema>

      <Predict question="A loss is one number computed from 1,000,000 parameters. How many backward sweeps to get the full gradient?">
        <strong>One.</strong> Reverse mode computes the gradient of a scalar output w.r.t. <em>all</em> inputs in a
        single backward pass, at ~1–3× the cost of the forward evaluation — independent of the parameter count. Forward
        mode would need a million passes (one per parameter). That asymmetry is why deep learning is even possible.
      </Predict>

      <Misconception
        wrong="Autodiff is just numerical / finite differences under the hood."
        right="Autodiff is exact (to floating-point) — it applies the chain rule to the recorded operations, not difference quotients."
        because="Finite differences approximate f' with (f(x+h)−f(x))/h and trade truncation against roundoff (best ~1e-8 accuracy). Autodiff carries analytic local derivatives (d/dx sin = cos) through the graph, so ∂f/∂x₁ is correct to full machine precision." />

      <Worked title="Reverse mode by hand on f = x₁x₂ + sin x₁ at (2,3)">
        <p>
          Forward: <Eq>{'v_1=6,\\ v_2=\\sin2=0.9093,\\ f=6.9093'}</Eq>. Backward: <Eq>{'\\bar v_3=1'}</Eq> →{' '}
          <Eq>{'\\bar v_1=1,\\ \\bar v_2=1'}</Eq> → <Eq>{'\\bar x_2=\\bar v_1\\,x_1=2'}</Eq>,{' '}
          <Eq>{'\\bar x_1=\\bar v_1 x_2+\\bar v_2\\cos2=3-0.4161=2.5839'}</Eq>. Confirm analytically{' '}
          <Eq>{'\\partial f/\\partial x_1=x_2+\\cos x_1'}</Eq>, <Eq>{'\\partial f/\\partial x_2=x_1'}</Eq>. ✓
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>The cheap-gradient principle</strong> (Baur–Strassen): reverse mode computes the gradient of a scalar{' '}
          <Eq>{'f:\\mathbb{R}^n\\to\\mathbb{R}'}</Eq> for ≤ ~3–4× the cost of one function evaluation, at the price of
          storing all intermediate values (the <Term>tape</Term>) — memory <Eq>{'O(\\#\\text{ops})'}</Eq>, hence
          activation checkpointing in big nets. Forward mode costs <Eq>{'O(n)'}</Eq> for the full gradient but{' '}
          <Eq>{'O(1)'}</Eq> memory and is right for <Eq>{'f:\\mathbb{R}\\to\\mathbb{R}^m'}</Eq>.
        </p>
        <p>
          Forward computes Jacobian-<em>vector</em> products (push-forward), reverse computes <em>vector</em>-Jacobian
          products (pull-back). The rule: <strong>forward when inputs ≪ outputs, reverse when outputs ≪ inputs.</strong>{' '}
          Training picks reverse — the loss is one scalar, the parameters are many.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is symbolic differentiation a bad idea for deep nets?', a: 'The symbolic derivative of a deeply nested function expands combinatorially (expression swell) — repeated subexpressions get re-derived. Autodiff reuses computed intermediates instead of re-expanding.' },
        { q: 'Is backprop the same as gradient descent?', a: 'No — backprop computes the gradient (reverse-mode autodiff over the net\'s graph); gradient descent / Adam uses that gradient to update weights. Different jobs.' },
        { q: 'Why does forward mode still exist?', a: 'Memory and shape. Forward needs no tape (O(1) memory) and wins when you have few inputs and many outputs — Jacobian-vector products, directional derivatives.' },
      ]} />

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="descent" recap="x ← x − η∇f assumed ∇f was free; this is where it comes from.">gradient descent</CrossLink>
        <CrossLink to="anchor" recap="Every smooth lens of the roastery needed a gradient.">the roastery</CrossLink>
        <CrossLink to="machine-learning" external recap="Training = backprop + SGD on a non-convex loss.">machine-learning</CrossLink>
      </div>
    </Card>
  );
};
const SPOKES = [
  { slug: 'machine-learning', label: 'machine learning', color: '#a5b4fc', text: 'Training IS optimization: minimize average loss over data by SGD/Adam; the loss is non-convex, the gradient comes from backprop (card 20). Regularization (L1/L2) = a penalty term = a soft constraint.' },
  { slug: 'control-theory', label: 'control theory', color: '#67e8f9', text: 'LQR is a quadratic program over a trajectory; its optimal feedback gain solves the Riccati equation. MPC = re-solving a constrained optimization every timestep. Bellman (card 14) is the discrete cousin of the HJB equation.' },
  { slug: 'decision-theory', label: 'decision theory', color: '#6ee7b7', text: 'Choosing an action = maximizing expected utility, argmaxₐ E[u(a)] — optimization under a probability measure. Bayesian decisions minimize expected loss.' },
  { slug: 'retail-quant', label: 'retail quant', color: '#fbbf24', text: 'Markowitz mean-variance portfolio = a convex QP (minimize variance wᵀΣw s.t. a target return). Kelly sizing = maximizing expected log-growth, a concave program.' },
  { slug: 'reinforcement-learning', label: 'reinforcement learning', color: '#f0abfc', text: 'Policy optimization = maximizing expected return over policy parameters (policy gradient = SGD with a sampled-return gradient estimator). Value iteration = a dynamic program (card 14).' },
  { slug: 'odes', label: 'ODEs', color: '#fb7185', text: 'Gradient descent is the forward-Euler discretization of the gradient-flow ODE ẋ = −∇f; momentum is a damped second-order ODE. Step size = time step.' },
];
const TrailsCard = () => {
  const [active, setActive] = useState(0);
  const W = 360, H = 250, cx = W / 2, cy = H / 2, R = 92;
  const pos = (i) => [cx + R * Math.cos((i * 60 - 90) * Math.PI / 180), cy + R * Math.sin((i * 60 - 90) * Math.PI / 180)];
  return (
    <Card id="trails" icon={Route} title="Next trails" accent="fuchsia" index={21}
          subtitle="Optimization is the engine room under half this library">
      <Intuition>
        <p>
          Optimization isn't a topic — it's the engine room under half this library. Training a model is descent on a
          loss. Steering a controller is optimization over a trajectory. Sizing a portfolio is a quadratic program.
          Picking an action is maximizing expected utility. Once you can read a problem as <em>"a landscape with
          walls,"</em> you'll see the same <Eq>{'\\nabla f = \\sum\\mu_i\\nabla g_i'}</Eq> everywhere.
        </p>
      </Intuition>

      <Block>{'\\text{training: }\\min_\\theta \\tfrac1N\\textstyle\\sum_i \\obj{\\ell}(f_\\theta(x_i),y_i) \\quad\\text{LQR: }\\min_{u}\\textstyle\\sum_t (x_t^\\top Qx_t+u_t^\\top Ru_t) \\quad\\text{Markowitz: }\\min_w w^\\top\\Sigma w'}</Block>
      <ReadEq>
        same skeleton each time — an objective you push down, constraints that wall you in, a multiplier that prices
        each wall. Machine learning, control, and finance are this one picture with different letters.
      </ReadEq>

      <div className="my-3 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="grid md:grid-cols-[360px_1fr] gap-4 items-start">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full">
            {SPOKES.map((s, i) => { const [x, y] = pos(i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={i === active ? s.color : 'rgba(255,255,255,0.15)'} strokeWidth={i === active ? 2.4 : 1.2} />; })}
            <circle cx={cx} cy={cy} r="30" fill="rgba(240,171,252,0.12)" stroke="#f0abfc" strokeWidth="1.6" />
            <text x={cx} y={cy - 2} fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="ui-monospace">optim-</text>
            <text x={cx} y={cy + 8} fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="ui-monospace">ization</text>
            {SPOKES.map((s, i) => {
              const [x, y] = pos(i);
              return (
                <g key={i} onClick={() => setActive(i)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r="22" fill="rgba(10,10,12,0.95)" stroke={s.color} strokeWidth={i === active ? 2 : 1.2} />
                  <text x={x} y={y + 3} fontSize="7" textAnchor="middle" fill={i === active ? s.color : '#cbd5e1'} fontFamily="ui-monospace">{s.label.split(' ')[0]}</text>
                </g>
              );
            })}
          </svg>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {SPOKES.map((s, i) => <button key={i} onClick={() => setActive(i)} className={`px-2 py-1 rounded border text-[10px] font-mono ${i === active ? chipPalette.fuchsia : 'border-white/10 text-neutral-500'}`}>{s.label}</button>)}
            </div>
            <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/5 p-3 text-xs text-neutral-200 leading-snug" style={{ minHeight: 96 }}>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: SPOKES[active].color }}>{SPOKES[active].label}</span>
              <div className="mt-1">{SPOKES[active].text}</div>
              <a href={`#${SPOKES[active].slug}`} className="inline-block mt-2 text-[11px] text-fuchsia-300 hover:text-fuchsia-200">open the {SPOKES[active].label} explainer →</a>
            </div>
          </div>
        </div>
      </div>

      <MinSchema>
        If you can write it as <strong>minimize an objective subject to constraints</strong>, the whole machine in this
        explainer is yours: read the geometry, pick the method by the structure, price the walls with the multipliers.
        That's most of applied math wearing one costume.
      </MinSchema>

      <Misconception
        wrong="Each of these fields needs its own bespoke solver theory."
        right="They mostly reduce to a handful of canonical forms — LP, QP, convex program, MILP — that off-the-shelf solvers already handle."
        because="The skill that transfers isn't a new algorithm per field; it's modeling — recognizing that LQR is a QP, Markowitz is a QP, training is unconstrained smooth minimization. Get the form right and the solver is a library call." />

      <Deeper>
        <p>What we skipped — honest gaps, one line each:</p>
        <ul className="list-disc ml-5 space-y-0.5 text-neutral-300">
          <li><strong>conic / semidefinite programming (SDP)</strong> — optimizing over cones (PSD matrices); powers relaxations of hard combinatorial problems and robust control.</li>
          <li><strong>multi-objective / <Term>Pareto front</Term>s</strong> — no single optimum when objectives conflict; you trace a frontier of non-dominated trade-offs.</li>
          <li><strong>online / bandit optimization</strong> — decide before you see the data; <Term>regret</Term> minimization rather than a fixed optimum.</li>
          <li><strong>mixed-integer nonlinear (MINLP)</strong> — discrete <em>and</em> curved at once — the hard union of branch-and-bound and nonlinear solvers.</li>
          <li><strong>distributed / federated optimization</strong> — split across machines that can't share raw data (ADMM, federated averaging).</li>
        </ul>
      </Deeper>

      <QA items={[
        { q: 'If training is just optimization, why is it so hard?', a: 'Non-convexity (many minima, saddles — card 17), scale (millions of parameters → reverse-mode autodiff is mandatory — card 20), and noise (stochastic gradients — card 16). The idea is descent; the engineering is everything else.' },
        { q: "What's the single most transferable skill from this explainer?", a: 'Reading a problem\'s structure — smooth? convex? constrained? discrete? noisy? — and mapping it to the right canonical form and method (the card-19 decision guide).' },
      ]} />

      <div className="mt-5">
        <NextSteps groups={[
          { title: 'Optimization in action', items: [
            { label: 'Machine learning', href: '#machine-learning', note: 'training = SGD/Adam on a non-convex loss; gradients from backprop' },
            { label: 'Control theory', href: '#control-theory', note: 'LQR is a QP over a trajectory; MPC re-solves it each step' },
            { label: 'Reinforcement learning', href: '#reinforcement-learning', note: 'policy gradient = SGD on expected return; value iteration = DP' },
          ] },
          { title: 'Optimization in money & choice', items: [
            { label: 'The Retail Quant', href: '#retail-quant', note: 'Markowitz = convex QP; Kelly = concave log-growth' },
            { label: 'Decision theory', href: '#decision-theory', note: 'choose = argmax expected utility' },
          ] },
          { title: 'The continuous limit', items: [
            { label: 'Differential equations', href: '#odes', note: 'GD = forward Euler on gradient flow ẋ = −∇f' },
          ] },
        ]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CrossLink to="autodiff" recap="The gradient engine under every training loop.">autodiff</CrossLink>
        <CrossLink to="anchor" recap="The which-method-when guide that keys structure to method.">the decision guide</CrossLink>
        <CrossLink to="gradient" recap="Where it all started — ∇f is the compass.">the gradient compass</CrossLink>
      </div>
    </Card>
  );
};

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-600">
      <p className="flex items-center justify-center gap-2">
        <TrendingDown className="w-3.5 h-3.5 text-emerald-400/60" />
        Optimization · follow the slope downhill as far as you trust it, until every way down is blocked.
      </p>
      <p className="mt-2">Interactive explainer · single-file React · all math computed live in the browser.</p>
    </div>
  </footer>
);

/* ============================================================================ */

export default function OptimizationExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].opt-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].opt-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #a5b4fc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(165,180,252,0.4);
        }
        input[type=range].opt-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #a5b4fc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <WhatIsCard />
        <GradientCard />
        <DescentCard />
        <NewtonCard />
        <MomentumCard />
        <ConvexityCard />
        <OptimalityCard />
        <SubgradCard />
        <LagrangeCard />
        <KKTCard />
        <DualityCard />
        <LPCard />
        <ILPCard />
        <DPCard />
        <FlowsCard />
        <SGDCard />
        <NonconvexCard />
        <GlobalCard />
        <AnchorCard />
        <AutodiffCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
