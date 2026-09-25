import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Sparkles, ChevronDown, FlaskConical, Compass, Link2, HelpCircle, Eye, EyeOff,
  AlertTriangle, CheckCircle2, XCircle, Target, Lightbulb, Activity, BookOpen,
  Layers, Database, Waves, Scissors, Brain, Network, Boxes, Scale, Rocket,
  Gauge, Telescope, Play, Pause, RotateCcw, Filter, Table2, Map as MapIcon,
} from 'lucide-react';

/* ============================================================================
   Open-Weight LLM Architectures — what changed inside the transformer, 2024→2026
   Gated DeltaNet, Kimi Delta Attention, hybrids, MLA, sparse attention, gated
   attention, fine-grained MoE, aux-loss-free balancing, Muon, FP8/MXFP4, MTP.
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   Palette: cyan = recurrent/linear state · orange = softmax attention ·
            violet = MoE / FFN · emerald = gains / training · rose = cost / sparse ·
            fuchsia = cross-links.
   ========================================================================== */

// ---------- KaTeX ----------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}', // amber — plugged-in numbers
  '\\hi':  '\\textcolor{##fb7185}{#1}', // rose — cost / emphasis
  '\\st':  '\\textcolor{##67e8f9}{#1}', // cyan — recurrent state
  '\\at':  '\\textcolor{##fdba74}{#1}', // orange — softmax attention
  '\\mo':  '\\textcolor{##c4b5fd}{#1}', // violet — MoE / FFN
  '\\gr':  '\\textcolor{##6ee7b7}{#1}', // emerald — gains / gates
};

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode, throwOnError: false, output: 'html', strict: 'ignore', macros: KATEX_MACROS,
    });
  } catch {
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
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100 text-[15px]">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

// ---------- formatting helpers ---------------------------------------------

const fmtBytes = (b) => {
  if (b >= 1e12) return `${(b / 1e12).toFixed(b >= 1e13 ? 0 : 1)} TB`;
  if (b >= 1e9) return `${(b / 1e9).toFixed(b >= 1e10 ? 0 : 1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(b >= 1e7 ? 0 : 1)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(b >= 1e4 ? 0 : 1)} KB`;
  return `${Math.round(b)} B`;
};
const fmtTok = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`);
const fmtNum = (n) => n.toLocaleString('en-US');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Chart shell: on phones the SVG keeps a readable min-width and the box scrolls sideways
// (AGENTS.md detector 11), instead of shrinking 11px labels to 5px.
const ChartBox = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>{children}</div>
);
const CHART_CLS = 'w-full min-w-[460px]';

// deterministic RNG for any simulation
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (rng) => {
  const u = Math.max(rng(), 1e-9), v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ---------- Card primitives ------------------------------------------------

const accentMap = {
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'cyan', index, source, anchor, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative rounded-2xl bg-neutral-900/60 border ${anchor ? 'border-fuchsia-400/30 ring-1 ring-fuchsia-400/10' : 'border-white/10'} backdrop-blur-sm p-5 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24`}
    >
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            {anchor && <span className="text-[10px] text-fuchsia-300 tracking-[0.2em]">★ anchor</span>}
            <span className="h-px flex-1 bg-white/10" />
            {source && <span className="text-[10px] normal-case tracking-normal text-neutral-500 text-right">{source}</span>}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </motion.section>
  );
};

const Deeper = ({ children }) => (
  <div className="relative mt-6 pt-5 border-t border-white/10">
    <div className="absolute -top-[11px] left-0 flex items-center gap-2 bg-neutral-900/80 pr-2">
      <FlaskConical className="w-3.5 h-3.5 text-violet-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">deeper</span>
    </div>
    <div className="text-sm text-neutral-300 leading-relaxed space-y-3">{children}</div>
  </div>
);

// 5. Minimum-viable schema: the one sentence to be able to redraw from memory.
const MinSchema = ({ children }) => (
  <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] px-3 py-2 flex items-start gap-2">
    <Target className="w-3.5 h-3.5 mt-[3px] text-cyan-300 shrink-0" />
    <div className="text-[13px] leading-snug text-cyan-50/90">
      <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-300 mr-2">carry this</span>
      {children}
    </div>
  </div>
);

// 6. When does this matter.
const WhenItMatters = ({ children }) => (
  <div className="rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 flex items-start gap-2">
    <Compass className="w-3.5 h-3.5 mt-[2px] text-amber-300 shrink-0" />
    <div className="text-xs text-amber-50/90 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 mr-2">when it matters</span>
      {children}
    </div>
  </div>
);

// 4. "Equivalent to" grounding chip.
const Grounding = ({ children }) => (
  <span className="inline-flex items-baseline gap-1 rounded-sm border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0 text-[11px] text-emerald-200 align-baseline">
    <span className="text-[9px] uppercase tracking-wider text-emerald-400">≈</span>
    {children}
  </span>
);

// 8. Misconception box.
const Misconception = ({ wrong, right, because }) => (
  <div className="rounded-md border border-rose-400/25 bg-rose-400/5 px-3 py-2">
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

// 1. Predict-before-reveal.
const Predict = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-violet-400/25 bg-violet-400/5 overflow-hidden">
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

// 2. Worked numeric example shell.
const Worked = ({ title = 'worked example', children }) => (
  <div className="rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">{title}</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-2">{children}</div>
  </div>
);

const Stat = ({ label, value, sub, color = 'text-neutral-100' }) => (
  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3 min-w-0">
    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
    <div className={`text-xl md:text-2xl font-mono mt-0.5 ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{sub}</div>}
  </div>
);

const Chip = ({ children, color = 'cyan' }) => {
  const map = {
    cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
    orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
    violet:  'bg-violet-500/10 text-violet-300 border-violet-400/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
    amber:   'bg-amber-500/10 text-amber-300 border-amber-400/20',
    rose:    'bg-rose-500/10 text-rose-300 border-rose-400/20',
    sky:     'bg-sky-500/10 text-sky-300 border-sky-400/20',
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${map[color]}`}>
      {children}
    </span>
  );
};

// Labeled range slider used by every interactive.
const Slider = ({ label, value, min, max, step = 1, onChange, fmt = (v) => v, color = 'accent-cyan-400' }) => (
  <label className="block min-w-0">
    <div className="flex items-baseline justify-between gap-2 text-[11px]">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{fmt(value)}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full ${color}`}
    />
  </label>
);

// Tab / segmented control.
const Tabs = ({ options, value, onChange, color = 'cyan' }) => {
  const on = {
    cyan: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100',
    orange: 'bg-orange-500/15 border-orange-400/40 text-orange-100',
    violet: 'bg-violet-500/15 border-violet-400/40 text-violet-100',
    emerald: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100',
    rose: 'bg-rose-500/15 border-rose-400/40 text-rose-100',
  }[color];
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const k = typeof o === 'string' ? o : o.key;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <button key={k} onClick={() => onChange(k)}
            className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors ${value === k ? on : 'border-white/10 text-neutral-400 hover:text-neutral-100 hover:bg-white/5'}`}>
            {l}
          </button>
        );
      })}
    </div>
  );
};

// Play / pause / speed / reset controls for any animated panel.
const PlayControls = ({ playing, setPlaying, speed, setSpeed, onReset }) => (
  <div className="flex flex-wrap items-center gap-2 text-[11px]">
    <button onClick={() => setPlaying(p => !p)} className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-2 py-1 text-neutral-200">
      {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}{playing ? 'pause' : 'play'}
    </button>
    {onReset && (
      <button onClick={onReset} className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-2 py-1 text-neutral-200">
        <RotateCcw className="w-3 h-3" />reset
      </button>
    )}
    <span className="text-neutral-500 ml-1">speed</span>
    {[0.5, 1, 2].map(s => (
      <button key={s} onClick={() => setSpeed(s)}
        className={`rounded border px-1.5 py-0.5 font-mono ${speed === s ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100' : 'border-white/10 text-neutral-400 hover:text-neutral-100'}`}>
        {s}×
      </button>
    ))}
  </div>
);

// Restart a card's animation when it scrolls into view (so it isn't over by the time you arrive).
const useEnterKey = () => {
  const ref = useRef(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let wasIn = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !wasIn) setKey(k => k + 1);
      wasIn = e.isIntersecting;
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, key];
};

// Simple rAF ticker: calls step(dtSeconds) while `playing`.
const useTicker = (playing, step) => {
  const stepRef = useRef(step); stepRef.current = step;
  useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      stepRef.current(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
};

// ---------- FloatingTip (portal) -------------------------------------------

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

// ---------- Glossary + Term ------------------------------------------------

const GLOSS = {
  'KV cache': 'The stored keys and values of every past token, per layer. Softmax attention must re-read all of it for each new token — the dominant memory cost of long-context inference.',
  'softmax attention': 'Standard attention: each query scores every past key, softmax-normalizes the scores, and averages the values. Exact recall of anything in context, at O(T) memory and O(T²) total compute.',
  'MHA': 'Multi-Head Attention — every head has its own keys and values. Maximum expressivity, maximum KV cache.',
  'GQA': 'Grouped-Query Attention — groups of query heads share one K/V head (e.g. 64 query heads, 8 KV heads). The 2023–2025 default: 8× smaller cache, little quality loss.',
  'MQA': 'Multi-Query Attention — all query heads share a single K/V head. Smallest cache among head-sharing schemes, some quality loss.',
  'MLA': 'Multi-head Latent Attention (DeepSeek-V2/V3, Kimi K2) — cache one small latent vector per token and re-expand it into per-head keys/values on the fly. Heads stay distinct; the cache shrinks.',
  'linear attention': 'Attention without the softmax: the past is folded into a fixed-size state matrix S = Σ vₜkₜᵀ, so each new token costs O(1) memory and time regardless of context length. An RNN in disguise.',
  'delta rule': 'The Widrow–Hoff error-correcting update: before writing v under key k, subtract what the memory currently returns for k. Writes the difference, so old associations get replaced instead of piled on.',
  'DeltaNet': 'Linear attention whose state update is the delta rule: S ← S(I − βkkᵀ) + βvkᵀ. Parallelized for GPUs by Yang et al. (2024).',
  'Gated DeltaNet': 'DeltaNet plus a data-dependent decay gate α ∈ (0,1): S ← α·S(I − βkkᵀ) + βvkᵀ. The gate forgets wholesale; the delta rule edits surgically. Used in Qwen3-Next and Qwen3.5.',
  'KDA': 'Kimi Delta Attention (Kimi Linear, Moonshot 2025) — Gated DeltaNet with a per-channel (diagonal) decay gate instead of one scalar per head, so each feature dimension forgets at its own rate.',
  'Mamba': 'A selective state-space model: a linear recurrence whose decay and input matrices depend on the current token. Mamba-2 reframed it as a form of gated linear attention.',
  'SSM': 'State-Space Model — a sequence layer defined by a linear recurrence hₜ = Aₜhₜ₋₁ + Bₜxₜ, yₜ = Cₜhₜ. Fixed-size state, linear time.',
  'hybrid': 'A model that interleaves cheap fixed-state layers (linear attention / SSM) with a minority of full softmax-attention layers, e.g. 3 : 1.',
  'sliding window': 'Local attention that only sees the last W tokens. Its KV cache is capped at W entries per layer no matter how long the context grows.',
  'attention sink': 'The tendency of softmax heads to dump excess probability on the first token(s) when nothing is relevant. Also: an explicit learned "attend to nothing" logit (gpt-oss).',
  'gated attention': 'Softmax attention whose output is multiplied elementwise by a sigmoid gate computed from the input (Qwen, NeurIPS 2025). Adds non-linearity and lets heads output ≈0, removing the attention-sink hack.',
  'DSA': 'DeepSeek Sparse Attention (V3.2) — a tiny "lightning indexer" scores all past tokens cheaply, and full attention runs only on the top-k (2,048) of them.',
  'NSA': 'Native Sparse Attention (DeepSeek, ACL 2025 best paper) — three branches: compressed block summaries, top-k selected blocks, and a sliding window, mixed by learned gates.',
  'MoBA': 'Mixture of Block Attention (Moonshot) — the context is split into blocks and each query is routed to its top-k blocks, MoE-style.',
  'RoPE': 'Rotary Position Embedding — rotates query/key 2-D slices by an angle proportional to position, so dot products depend on relative offset.',
  'NoPE': 'No Positional Encoding — a layer with no explicit position signal. Causal masking alone leaks order; some models (Llama 4, SmolLM3) interleave NoPE layers to generalize to longer contexts.',
  'QK-norm': 'RMS-normalizing queries and keys before the dot product, capping attention logits. A cheap guard against logit blow-ups during training.',
  'MoE': 'Mixture-of-Experts — the FFN is split into many expert MLPs and a router picks a few per token. Total parameters (knowledge) decouple from active parameters (per-token compute).',
  'router': 'A small linear layer that scores every expert for a token; the top-k experts process it, weighted by their (softmax or sigmoid) scores.',
  'shared expert': 'An expert that every token always visits, alongside its routed experts. Absorbs common knowledge so routed experts can specialize.',
  'aux-loss-free': 'DeepSeek-V3 load balancing: instead of an auxiliary loss, a per-expert bias is added to routing scores (for selection only) and nudged up for under-used experts, down for overloaded ones.',
  'MTP': 'Multi-Token Prediction — extra lightweight heads predict tokens t+2, t+3… during training (denser signal) and double as a built-in draft model for speculative decoding.',
  'speculative decoding': 'A cheap drafter proposes several tokens; the big model verifies them in one forward pass and keeps the longest correct prefix. Same outputs, fewer expensive steps.',
  'Muon': 'An optimizer that orthogonalizes each weight matrix\'s momentum update (via Newton–Schulz iterations) before applying it — every direction gets an equal-sized step. ~2× token-efficiency vs AdamW in Moonshot\'s tests.',
  'MuonClip': 'Kimi K2\'s Muon variant with QK-Clip: after each step, any head whose max attention logit exceeds a threshold τ gets its W_q, W_k rescaled down. Kept a 15.5T-token run free of loss spikes.',
  'AdamW': 'Adam with decoupled weight decay — per-parameter adaptive step sizes. The default LLM optimizer since 2019.',
  'FP8': '8-bit floating point (E4M3 / E5M2). DeepSeek-V3 was the first frontier-scale open model trained mostly in FP8, with fine-grained per-tile scaling.',
  'MXFP4': 'Microscaling FP4 — 4-bit floats sharing one 8-bit scale per 32-value block. gpt-oss ships its MoE weights in MXFP4 so the 120B model fits one 80 GB GPU.',
  'active parameters': 'The parameters actually used for one token (attention + shared parts + the chosen experts). Sets per-token FLOPs and decode speed.',
  'total parameters': 'Every parameter in the checkpoint. Sets memory footprint and (roughly) knowledge capacity.',
  'prefill': 'Processing the whole prompt in parallel before generating. Compute-bound; softmax attention makes it quadratic in prompt length.',
  'decode': 'Generating one token at a time. Memory-bandwidth-bound: each step re-reads the weights plus the whole KV cache.',
  'chunkwise parallel': 'Training trick for linear RNNs: split the sequence into chunks, run exact matrix-multiply attention inside each chunk, and pass the recurrent state between chunks. Tensor-core friendly.',
  'associative memory': 'A store that maps keys to values by superposition: write M += v kᵀ, read v̂ = M k. Linear attention\'s state is exactly this.',
};

const Term = ({ children, def, className = '' }) => {
  const [hover, setHover] = useState(null);
  const text = typeof children === 'string' ? children : '';
  const definition = def || GLOSS[text];
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  if (!definition) return <>{children}</>;
  return (
    <>
      <span
        onMouseEnter={track}
        onMouseMove={track}
        onMouseLeave={() => setHover(null)}
        className={`underline decoration-dotted decoration-cyan-300/60 underline-offset-[3px] cursor-help ${className}`}
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={300}
        render={() => (
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">{text}</div>
            <div className="mt-1 text-neutral-200 leading-snug">{definition}</div>
          </div>
        )}
      />
    </>
  );
};

// ---------- QA (quick self-check) ------------------------------------------

const QA = ({ items }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
    <div className="px-3 py-2 flex items-center gap-2 border-b border-white/10 bg-white/[0.02]">
      <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">quick check</span>
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

// ---------- CrossLink (3) --------------------------------------------------

const CrossLink = ({ to, children, recap }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    // In-page card → smooth scroll. Otherwise let the hash change route to a sibling explainer.
    const el = document.getElementById(to);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
        <FloatingTip hover={hover} width={300} render={() => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">recap · {to}</div>
            <div className="text-neutral-200 leading-snug">{recap}</div>
          </div>
        )} />
      )}
    </>
  );
};

// ---------- NextSteps (9) --------------------------------------------------

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
          <div className="flex flex-wrap items-baseline gap-x-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-violet-300">{g.title}</span>
            {g.note && <span className="text-[11px] text-neutral-500">— {g.note}</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {g.items.map((it, j) => {
              const isLink = !!it.href;
              const isExternal = it.external || (isLink && !it.href.startsWith('#') && !it.href.startsWith('/#'));
              const Tag = isLink ? 'a' : 'div';
              const props = isLink ? {
                href: it.href,
                onClick: (e) => onClick(e, it.href),
                target: isExternal ? '_blank' : undefined,
                rel: isExternal ? 'noopener noreferrer' : undefined,
              } : {};
              return (
                <Tag key={j} {...props}
                  className={`group rounded-md border px-3 py-2 flex items-start gap-2 transition-colors no-underline ${
                    isLink ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-400/30' : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="mt-[3px] shrink-0 text-violet-300">
                    {isLink ? <Link2 className="w-3 h-3" /> : <Compass className="w-3 h-3 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs ${isLink ? 'text-neutral-100 group-hover:text-violet-200' : 'text-neutral-300'}`}>{it.label}</span>
                      {isExternal && <span className="text-[9px] text-neutral-500 font-mono">↗</span>}
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-500">find elsewhere</span>}
                    </div>
                    {it.note && <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{it.note}</div>}
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- Section nav ----------------------------------------------------

const SECTIONS = [
  { id: 'hero',      label: 'Overview',           icon: Sparkles },
  { id: 'c-costs',   label: 'Three bills',        icon: Gauge },
  { id: 'c-kv',      label: 'KV diet: GQA → MLA', icon: Database },
  { id: 'c-window',  label: 'Windows & sinks',    icon: Scissors },
  { id: 'c-sparse',  label: 'Sparse attention',   icon: Filter },
  { id: 'c-linear',  label: 'Linear attention',   icon: Waves },
  { id: 'c-delta',   label: 'The delta rule',     icon: Brain },
  { id: 'c-gdn',     label: 'Gated DeltaNet',     icon: Activity },
  { id: 'c-kda',     label: 'Kimi Delta Attn',    icon: Layers },
  { id: 'c-hybrid',  label: 'Hybrid stacks',      icon: Network },
  { id: 'c-gate',    label: 'Gated attention',    icon: Eye },
  { id: 'c-moe',     label: 'Fine-grained MoE',   icon: Boxes },
  { id: 'c-balance', label: 'Load balancing',     icon: Scale },
  { id: 'c-train',   label: 'Training tricks',    icon: Rocket },
  { id: 'c-lineup',  label: 'Model spec sheets',  icon: Table2 },
  { id: 'c-future',  label: 'Where it’s going', icon: Telescope },
  { id: 'c-trails',  label: 'Next trails',        icon: BookOpen },
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
  const go = (e, id) => {
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  return (
    <>
      <nav className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-20 max-h-[90vh] overflow-y-auto">
        <ul className="space-y-0.5 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => go(e, s.id)}
                  className={`group flex items-center gap-2 py-1 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i).padStart(2, '0')}</span>
                  <span className="tracking-wide">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav className="xl:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/80 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={(e) => go(e, s.id)} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i).padStart(2, '0')}</span>{s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

// ============================================================================
// HERO — a live hybrid layer stack: 3 linear (cyan) : 1 full attention (orange),
// every block followed by a sparse MoE (violet). Tokens stream through.
// ============================================================================

const HeroStack = () => {
  const layers = 8;
  const W = 520, H = 170, x0 = 40, lw = (W - 80) / layers;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl mx-auto" aria-hidden>
      {Array.from({ length: layers }, (_, i) => {
        const full = i % 4 === 3;
        const x = x0 + i * lw;
        return (
          <g key={i}>
            <rect x={x + 4} y={30} width={lw - 8} height={50} rx={6}
              fill={full ? '#f97316' : '#06b6d4'} fillOpacity={0.14}
              stroke={full ? '#fdba74' : '#67e8f9'} strokeOpacity={0.6} />
            <text x={x + lw / 2} y={60} textAnchor="middle" fontSize={11} fill={full ? '#fdba74' : '#67e8f9'} fontFamily="monospace">
              {full ? 'attn' : 'GDN'}
            </text>
            {Array.from({ length: 4 }, (_, e) => (
              <motion.rect key={e} x={x + 6 + e * ((lw - 12) / 4)} y={92} width={(lw - 12) / 4 - 3} height={26} rx={3}
                fill="#8b5cf6"
                initial={{ fillOpacity: 0.1 }}
                animate={{ fillOpacity: [0.1, (e + i) % 3 === 0 ? 0.75 : 0.1, 0.1] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 + e * 0.1 }} />
            ))}
          </g>
        );
      })}
      <text x={W / 2} y={18} textAnchor="middle" fontSize={11} fill="#a3a3a3">one hybrid stack · 3 linear : 1 full attention · sparse MoE under every block</text>
      <text x={W / 2} y={140} textAnchor="middle" fontSize={11} fill="#c4b5fd">MoE experts — only a few light up per token</text>
      {Array.from({ length: 6 }, (_, k) => (
        <motion.circle key={k} r={3} cy={86} fill="#f5f5f5"
          initial={{ cx: 20, opacity: 0 }}
          animate={{ cx: [20, W - 20], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: k, ease: 'linear' }} />
      ))}
      <text x={20} y={160} fontSize={11} fill="#a3a3a3">token in</text>
      <text x={W - 20} y={160} fontSize={11} fill="#a3a3a3" textAnchor="end">next token</text>
    </svg>
  );
};

const Hero = () => (
  <header id="hero" className="relative overflow-hidden border-b border-white/5 scroll-mt-24">
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-violet-500/5 to-transparent" />
    <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20">
          <Sparkles className="w-3.5 h-3.5" /> Qwen · DeepSeek · Kimi · MiniMax · GLM · gpt-oss · Gemma · Nemotron
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-cyan-100 to-violet-200 bg-clip-text text-transparent">
          Inside the New Open LLMs
        </h1>
        <p className="mt-4 text-neutral-400 text-sm md:text-base">
          Gated DeltaNet, latent &amp; sparse attention, fine-grained MoE — the transformer, rebuilt one bottleneck at a time
        </p>
        <p className="mt-8 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          The 2023 recipe was one block — softmax attention + a dense MLP — stacked 80 times. The open labs have since
          attacked every expensive part of it: the <span className="text-orange-300">memory of the past</span>,
          the <span className="text-violet-300">cost of knowing things</span>, and the <span className="text-emerald-300">cost of training</span>.
          This page walks each idea from its one-line intuition to the equation — with a slider on every number.
        </p>
      </motion.div>
      <div className="mt-10"><HeroStack /></div>
      <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-6 flex justify-center text-neutral-500">
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </div>
  </header>
);

// ============================================================================
// CARDS (stubs — filled stage by stage)
// ============================================================================

const Stub = ({ id, icon, title, index, accent }) => (
  <Card id={id} icon={icon} title={title} index={index} accent={accent}>
    <p className="text-neutral-500 text-sm">Coming in the next build stage.</p>
  </Card>
);

const Windows = () => <Stub id="c-window" icon={Scissors} title="Sliding windows, global layers & attention sinks" index={3} accent="orange" />;
const Sparse = () => <Stub id="c-sparse" icon={Filter} title="Sparse attention: read only what matters" index={4} accent="rose" />;
const Linear = () => <Stub id="c-linear" icon={Waves} title="Linear attention: the past as a fixed-size matrix" index={5} accent="cyan" />;
const Delta = () => <Stub id="c-delta" icon={Brain} title="The delta rule: write the error, not the value" index={6} accent="cyan" />;
const GDN = () => <Stub id="c-gdn" icon={Activity} title="Gated DeltaNet: forget wholesale, edit surgically" index={7} accent="cyan" />;
const KDA = () => <Stub id="c-kda" icon={Layers} title="Kimi Delta Attention: a forget-rate per channel" index={8} accent="cyan" />;
const Hybrid = () => <Stub id="c-hybrid" icon={Network} title="Hybrid stacks: mostly linear, a little softmax" index={9} accent="sky" />;
const GatedAttn = () => <Stub id="c-gate" icon={Eye} title="Gated attention and the end of the attention sink" index={10} accent="orange" />;
const MoE = () => <Stub id="c-moe" icon={Boxes} title="Fine-grained MoE: 1T parameters, 32B per token" index={11} accent="violet" />;
const Balance = () => <Stub id="c-balance" icon={Scale} title="Load balancing without the auxiliary loss" index={12} accent="violet" />;
const Train = () => <Stub id="c-train" icon={Rocket} title="Training tricks: Muon, FP8/MXFP4, multi-token prediction" index={13} accent="emerald" />;
const Lineup = () => <Stub id="c-lineup" icon={Table2} title="Spec sheets: the flagship open models, decoded" index={14} accent="fuchsia" />;
const Future = () => <Stub id="c-future" icon={Telescope} title="Where it's going — and what got walked back" index={15} accent="amber" />;
const Trails = () => <Stub id="c-trails" icon={MapIcon} title="Next trails" index={16} accent="violet" />;

// ============================================================================
// CARD 1 — The three bills (spine)
// ============================================================================

// Llama-3-70B-shaped dense GQA baseline: 80 layers, 8 KV heads × 128 dims, BF16.
const BASE = { params: 70e9, layers: 80, kvHeads: 8, dHead: 128, bytes: 2 };
const KV_PER_TOKEN = 2 * BASE.layers * BASE.kvHeads * BASE.dHead * BASE.bytes; // 327,680 B
const WEIGHT_BYTES = BASE.params * BASE.bytes; // 140 GB

const kvShare = (T, B) => (B * T * KV_PER_TOKEN) / (WEIGHT_BYTES + B * T * KV_PER_TOKEN);

const ShareChart = ({ T, B }) => {
  const W = 520, H = 250, L = 46, R = 14, Tp = 14, Bm = 40;
  const lx = (t) => L + ((Math.log10(t) - 3) / 3) * (W - L - R); // 1K..1M
  const ly = (s) => Tp + (1 - s) * (H - Tp - Bm);
  const batches = [
    { b: 1, c: '#67e8f9' }, { b: 8, c: '#fdba74' }, { b: 64, c: '#fb7185' },
  ];
  const path = (b) => {
    const pts = [];
    for (let i = 0; i <= 90; i++) { const t = 10 ** (3 + (3 * i) / 90); pts.push(`${lx(t).toFixed(1)},${ly(kvShare(t, b)).toFixed(1)}`); }
    return 'M' + pts.join('L');
  };
  return (
    <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
      {[0, 0.25, 0.5, 0.75, 1].map(s => (
        <g key={s}>
          <line x1={L} x2={W - R} y1={ly(s)} y2={ly(s)} stroke="#ffffff" strokeOpacity={s === 0.5 ? 0.25 : 0.07} strokeDasharray={s === 0.5 ? '4 4' : undefined} />
          <text x={L - 6} y={ly(s) + 4} textAnchor="end" fontSize={11} fill="#a3a3a3">{Math.round(s * 100)}%</text>
        </g>
      ))}
      {[1e3, 1e4, 1e5, 1e6].map(t => (
        <text key={t} x={lx(t)} y={H - Bm + 16} textAnchor="middle" fontSize={11} fill="#a3a3a3">{fmtTok(t)}</text>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#a3a3a3">context length (tokens, log scale)</text>
      {batches.map(({ b, c }) => (
        <path key={b} d={path(b)} fill="none" stroke={c} strokeWidth={b === B ? 3 : 1.5} strokeOpacity={b === B ? 1 : 0.45} />
      ))}
      {batches.map(({ b, c }, i) => (
        <text key={b} x={L + 8} y={Tp + 14 + i * 15} fontSize={11} fill={c}>batch {b}</text>
      ))}
      {[1, 8, 64].includes(B) ? null : (
        <path d={path(B)} fill="none" stroke="#e5e5e5" strokeWidth={2.5} />
      )}
      <line x1={lx(T)} x2={lx(T)} y1={Tp} y2={H - Bm} stroke="#f5f5f5" strokeOpacity={0.35} />
      <circle cx={lx(T)} cy={ly(kvShare(T, B))} r={5} fill="#f5f5f5" />
    </svg></ChartBox>
  );
};

const Costs = () => {
  const [logT, setLogT] = useState(Math.log10(32768));
  const [B, setB] = useState(8);
  const T = Math.round(10 ** logT);
  const kvSeq = T * KV_PER_TOKEN;
  const share = kvShare(T, B);
  const crossover = WEIGHT_BYTES / (B * KV_PER_TOKEN);
  return (
    <Card id="c-costs" icon={Gauge} title="The three bills every LLM pays" subtitle="Every idea on this page cuts one of them" accent="rose" index={1} anchor>
      <MinSchema>
        Each generated token pays for <span className="text-orange-300">reading the past</span> (the <Term>KV cache</Term>, grows with context),
        for <span className="text-violet-300">touching the weights</span> (<Term>active parameters</Term>), and — once, up front — for <span className="text-emerald-300">training</span>.
        Linear/sparse/latent attention cut bill 1; MoE cuts bill 2; Muon/FP8/MTP cut bill 3.
      </MinSchema>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { c: 'border-orange-400/25 bg-orange-400/[0.04]', t: 'text-orange-300', h: '① memory of the past', b: 'Softmax attention keeps every past key & value. Cache grows O(T); total attention compute grows O(T²).', f: 'cards 2–10' },
          { c: 'border-violet-400/25 bg-violet-400/[0.04]', t: 'text-violet-300', h: '② cost of knowing', b: 'A dense model runs every weight for every token. Knowledge and per-token compute are welded together.', f: 'cards 11–12' },
          { c: 'border-emerald-400/25 bg-emerald-400/[0.04]', t: 'text-emerald-300', h: '③ cost of learning', b: 'Trillions of tokens × billions of weights. Every % of optimizer or number-format efficiency is millions of dollars.', f: 'card 13' },
        ].map(x => (
          <div key={x.h} className={`rounded-lg border ${x.c} p-3`}>
            <div className={`text-[11px] uppercase tracking-widest ${x.t}`}>{x.h}</div>
            <div className="mt-1 text-[12.5px] text-neutral-300 leading-snug">{x.b}</div>
            <div className="mt-1.5 text-[10px] font-mono text-neutral-500">{x.f}</div>
          </div>
        ))}
      </div>

      <p>
        Why bill ① became the obsession: during <Term>decode</Term>, a GPU is starved for memory bandwidth, not math. Each step it must stream
        the weights <em>once</em> for the whole batch — but the KV cache <em>once per sequence</em>. Batching amortizes weights; it multiplies the cache.
      </p>

      <Predict question={<>A Llama-3-70B-shaped model (GQA, BF16) stores <span className="font-mono">320 KB</span> of KV per token and has <span className="font-mono">140 GB</span> of weights. Serving one user, how long must the context get before each decode step reads as many bytes of cache as of weights? And with 64 users batched?</>}>
        <span className="font-mono">140 GB ÷ 320 KB ≈ 430K tokens</span> for one user — comfortably past most chats. But at batch 64 the cache is read 64×, so the crossover drops to <span className="font-mono">≈ 6.7K tokens</span>. In real serving, the KV cache — not the weights — is the bottleneck almost immediately. That's why every lab is attacking it.
      </Predict>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">share of each decode step's memory traffic spent on the KV cache</div>
          <div className="text-[10px] text-neutral-500">70B dense GQA · BF16</div>
        </div>
        <ShareChart T={T} B={B} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="context length" value={logT} min={3} max={6} step={0.01} onChange={setLogT} fmt={() => `${fmtTok(T)} tokens`} />
          <Slider label="concurrent sequences (batch)" value={B} min={1} max={64} onChange={setB} color="accent-orange-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="KV / sequence" value={fmtBytes(kvSeq)} color="text-orange-300" sub={`${fmtTok(T)} × 320 KB`} />
          <Stat label="KV / step" value={fmtBytes(kvSeq * B)} color="text-rose-300" sub={`× ${B} sequences`} />
          <Stat label="KV share" value={`${Math.round(share * 100)}%`} color={share > 0.5 ? 'text-rose-300' : 'text-cyan-300'} sub="of bytes streamed per step" />
          <Stat label="crossover" value={fmtTok(Math.round(crossover))} color="text-amber-300" sub="context where KV = weights" />
        </div>
      </div>

      <Worked title="worked example · where 320 KB per token comes from">
        <Block>{String.raw`\underbrace{\num{2}}_{K,V}\times\underbrace{\num{80}}_{\text{layers}}\times\underbrace{\num{8}}_{\text{KV heads}}\times\underbrace{\num{128}}_{d_{\text{head}}}\times\underbrace{\num{2}\,\text{B}}_{\text{BF16}} = \hi{327{,}680\ \text{B}}\approx 320\ \text{KB/token}`}</Block>
        <div>At the current slider, one {fmtTok(T)}-token session holds <span className="font-mono text-orange-300">{fmtBytes(kvSeq)}</span> <Grounding>{(kvSeq / 80e9).toFixed(kvSeq > 8e10 ? 1 : 2)} × an 80 GB H100</Grounding> of cache — before you store a single weight.</div>
      </Worked>

      <WhenItMatters>
        Choosing a model for long agent sessions, RAG over big documents, or high-concurrency serving: cache size per token decides how many users fit on a GPU. For short chats at batch 1 it barely matters.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Compute, not just memory.</strong> Attention scores cost about <Eq>{String.raw`4\,L\,d_{\text{attn}}\,T`}</Eq> FLOPs per token versus
          <Eq>{String.raw`2N`}</Eq> for the weight matmuls. For the 70B baseline (<Eq>{String.raw`L=80,\ d_{\text{attn}}=8192`}</Eq>) they are equal at
          <Eq>{String.raw`T = \tfrac{2\cdot 70\text{B}}{4\cdot 80\cdot 8192}\approx \num{53\text{K}}`}</Eq>. Past that, <Term>prefill</Term> of a long prompt is dominated by the quadratic term — which is what <CrossLink to="c-sparse" recap="Sparse attention: a cheap indexer picks the top-k past tokens; full attention runs only on those.">sparse attention</CrossLink> and <CrossLink to="c-linear" recap="Linear attention folds the past into a fixed-size matrix: O(1) per token, no growing cache.">linear attention</CrossLink> go after.
        </p>
        <p>
          <strong>Bill ③ in numbers.</strong> DeepSeek-V3 (671B total / 37B active) reported 2.788M H800 GPU-hours for its full training run — about $5.6M at $2/GPU-hour, excluding research and failed runs. That figure was only possible because of bills ② (MoE) and ③ (FP8) being cut at the same time.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does batching make the KV cache worse relative to the weights?', a: 'Weights are shared by every sequence in the batch, so they are streamed once per step. Each sequence has its own KV cache, so cache traffic scales with batch × context.' },
        { q: 'Which bill does a Mixture-of-Experts model cut, and which does it leave alone?', a: 'It cuts bill ② (per-token weight compute) by activating only a few experts. It does nothing for bill ① — the attention KV cache is unchanged.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 2 — The KV-cache diet: MHA → GQA → MQA → MLA
// ============================================================================

// DeepSeek-V3 shape: 61 layers, 128 query heads × 128 dims; MLA latent 512 + decoupled RoPE key 64.
const KV_SCHEMES = [
  { key: 'mha', label: 'MHA', elems: 2 * 128 * 128, color: '#fb7185', note: 'every head its own K and V' },
  { key: 'gqa', label: 'GQA-8', elems: 2 * 8 * 128, color: '#fdba74', note: '16 query heads share each K/V head' },
  { key: 'mqa', label: 'MQA', elems: 2 * 1 * 128, color: '#fcd34d', note: 'all 128 heads share one K/V' },
  { key: 'mla', label: 'MLA', elems: 512 + 64, color: '#67e8f9', note: 'one 512-d latent + 64-d RoPE key' },
];

const HeadDiagram = ({ scheme }) => {
  const W = 500, H = 190, nQ = 8;
  const qx = (i) => 40 + i * ((W - 80) / (nQ - 1));
  const groups = scheme === 'mha' ? 8 : scheme === 'gqa' ? 2 : 1;
  const kvx = (g) => groups === 1 ? W / 2 : 40 + g * ((W - 80) / (groups - 1));
  return (
    <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={`${CHART_CLS} max-w-[560px] mx-auto block`}>
      <text x={10} y={22} fontSize={11} fill="#fdba74">query heads</text>
      {Array.from({ length: nQ }, (_, i) => (
        <rect key={i} x={qx(i) - 14} y={30} width={28} height={22} rx={4} fill="#f97316" fillOpacity={0.2} stroke="#fdba74" strokeOpacity={0.7} />
      ))}
      {scheme !== 'mla' && Array.from({ length: nQ }, (_, i) => {
        const g = Math.floor(i / (nQ / groups));
        return <motion.line key={`${scheme}-${i}`} x1={qx(i)} y1={52} x2={kvx(g)} y2={118} stroke="#a3a3a3" strokeOpacity={0.4}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: i * 0.03 }} />;
      })}
      {scheme !== 'mla' && Array.from({ length: groups }, (_, g) => (
        <motion.g key={`${scheme}-g${g}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <rect x={kvx(g) - 18} y={118} width={36} height={30} rx={4} fill="#fb7185" fillOpacity={0.22} stroke="#fda4af" />
          <text x={kvx(g)} y={137} textAnchor="middle" fontSize={11} fill="#fecdd3">K V</text>
        </motion.g>
      ))}
      {scheme === 'mla' && (
        <g>
          {Array.from({ length: nQ }, (_, i) => (
            <motion.line key={`mla-${i}`} x1={qx(i)} y1={52} x2={W / 2} y2={118} stroke="#67e8f9" strokeOpacity={0.45} strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: i * 0.03 }} />
          ))}
          <text x={W - 6} y={92} textAnchor="end" fontSize={11} fill="#a5f3fc">W_UK, W_UV re-expand per head</text>
          <motion.rect initial={{ scaleX: 0.3 }} animate={{ scaleX: 1 }} style={{ transformOrigin: `${W / 2}px 133px` }}
            x={W / 2 - 95} y={118} width={190} height={30} rx={6} fill="#06b6d4" fillOpacity={0.22} stroke="#67e8f9" />
          <text x={W / 2} y={137} textAnchor="middle" fontSize={11} fill="#cffafe">latent c (512) + k_rope (64)</text>
        </g>
      )}
      <text x={10} y={176} fontSize={11} fill="#a3a3a3">cached per token, per layer</text>
      <text x={W - 10} y={176} textAnchor="end" fontSize={11} fill="#e5e5e5" fontFamily="monospace">
        {fmtNum(KV_SCHEMES.find(s => s.key === scheme).elems)} numbers
      </text>
    </svg></ChartBox>
  );
};

const KVDiet = () => {
  const [scheme, setScheme] = useState('mla');
  const [logT, setLogT] = useState(Math.log10(131072));
  const [fp8, setFp8] = useState(false);
  const T = Math.round(10 ** logT);
  const layers = 61, bpe = fp8 ? 1 : 2;
  const perTok = (s) => s.elems * layers * bpe;
  const maxB = perTok(KV_SCHEMES[0]) * T;
  return (
    <Card id="c-kv" icon={Database} title="The KV-cache diet: MHA → GQA → MLA" subtitle="Cache fewer numbers per token without making the heads identical" accent="orange" index={2} source="DeepSeek-V2 (2024) · V3 (2024) · Kimi K2 (2025)">
      <MinSchema>
        GQA shrinks the cache by making heads <em>share</em> keys and values. <Term>MLA</Term> shrinks it by caching one small <em>latent</em> per token and
        re-expanding it into distinct per-head K/V at compute time — cache like MQA, expressivity close to MHA.
      </MinSchema>

      <Tabs options={KV_SCHEMES.map(s => ({ key: s.key, label: s.label }))} value={scheme} onChange={setScheme} color="orange" />
      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-3">
        <HeadDiagram scheme={scheme} />
        <div className="text-[12px] text-neutral-400 px-1">{KV_SCHEMES.find(s => s.key === scheme).note}</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">KV cache for one sequence · DeepSeek-V3 shape (61 layers, 128 heads × 128)</div>
        </div>
        {KV_SCHEMES.map(s => {
          const b = perTok(s) * T;
          return (
            <button key={s.key} onClick={() => setScheme(s.key)} className="w-full text-left">
              <div className="flex items-center gap-3">
                <div className={`w-14 shrink-0 text-[12px] font-mono ${scheme === s.key ? 'text-neutral-50' : 'text-neutral-400'}`}>{s.label}</div>
                <div className="flex-1 h-5 rounded bg-white/[0.04] overflow-hidden">
                  <motion.div className="h-full rounded" style={{ background: s.color, opacity: scheme === s.key ? 0.9 : 0.5 }}
                    initial={{ width: 0 }} animate={{ width: `${Math.max(0.6, (b / maxB) * 100)}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="w-20 shrink-0 text-right text-[12px] font-mono text-neutral-200">{fmtBytes(b)}</div>
              </div>
            </button>
          );
        })}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <Slider label="context length" value={logT} min={3} max={6} step={0.01} onChange={setLogT} fmt={() => `${fmtTok(T)} tokens`} color="accent-orange-400" />
          <label className="flex items-center gap-2 text-[12px] text-neutral-300">
            <input type="checkbox" checked={fp8} onChange={(e) => setFp8(e.target.checked)} className="accent-orange-400" />
            store the cache in FP8 (1 byte / number) instead of BF16
          </label>
        </div>
        <div className="text-[12px] text-neutral-400">
          MLA vs MHA: <span className="font-mono text-cyan-300">{(KV_SCHEMES[0].elems / KV_SCHEMES[3].elems).toFixed(0)}× smaller</span> ·
          MLA vs GQA-8: <span className="font-mono text-cyan-300">{(KV_SCHEMES[1].elems / KV_SCHEMES[3].elems).toFixed(1)}× smaller</span>
        </div>
      </div>

      <Worked title="worked example · the MLA trick in three lines">
        <Block>{String.raw`\st{c_t} = W^{DKV} h_t \in \mathbb{R}^{\num{512}} \qquad k_{t,i} = W^{UK}_i\, \st{c_t} \qquad v_{t,i} = W^{UV}_i\, \st{c_t}`}</Block>
        <div>Only <Eq>{String.raw`\st{c_t}`}</Eq> is cached. At attention time the up-projection folds into the query (<em>weight absorption</em>), so keys are never materialized:</div>
        <Block>{String.raw`q_{t,i}^{\top} k_{s,i} = q_{t,i}^{\top} W^{UK}_i \st{c_s} = \big(\underbrace{W^{UK\top}_i q_{t,i}}_{\text{computed once per query}}\big)^{\top} \st{c_s}`}</Block>
      </Worked>

      <Misconception
        wrong="MLA is lossy compression, so it must trade quality for memory like MQA does."
        right="DeepSeek-V2's ablations had MLA matching or beating full MHA, while GQA and MQA lost quality."
        because="The latent is low-rank but each head still gets its own learned up-projection, so heads stay different. MQA forces them to literally share one K and V." />

      <WhenItMatters>
        MLA is now the default in the DeepSeek lineage and its descendants (Kimi K2 reuses it). If you serve long contexts, a 4–7× smaller cache than GQA means 4–7× more concurrent users per GPU.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why a separate RoPE key?</strong> <Term>RoPE</Term> rotates keys by a position-dependent matrix <Eq>{String.raw`R_s`}</Eq>. That rotation would sit between <Eq>{String.raw`W^{UK}`}</Eq> and <Eq>{String.raw`\st{c_s}`}</Eq> and break the absorption above
          (<Eq>{String.raw`q^\top R_{t-s} W^{UK} c_s`}</Eq> can't be precomputed). So MLA keeps the latent position-free and adds a small <Eq>{String.raw`\num{64}`}</Eq>-dim key <Eq>{String.raw`k^R_s`}</Eq>, shared by all heads, that carries RoPE — hence 512 + 64 = 576 cached numbers per layer.
        </p>
        <p>
          <strong>Training vs inference.</strong> During training MLA behaves like ordinary MHA with 128-dim heads (keys are materialized, fully parallel). The absorption trick is an inference-time re-association — same math, different order of matmuls. Low-rank query compression (<Eq>{String.raw`d_c' = 1536`}</Eq> in V3) is a separate, activation-memory saving.
        </p>
      </Deeper>

      <QA items={[
        { q: 'GQA-8 on a 128-head model caches how many K/V numbers per token per layer (head dim 128)?', a: '2 × 8 × 128 = 2,048. MLA caches 576 — about 3.6× fewer, while keeping 128 distinct heads.' },
        { q: 'Why can\'t MLA just apply RoPE to the latent c?', a: 'RoPE is position-dependent, so it would sit between W_UK and c and block folding W_UK into the query. The decoupled 64-dim RoPE key avoids that.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// Page
// ============================================================================

export default function OpenLLMArchitecturesExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <Hero />
      <SectionNav />
      <main className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-8">
        <Costs />
        <KVDiet />
        <Windows />
        <Sparse />
        <Linear />
        <Delta />
        <GDN />
        <KDA />
        <Hybrid />
        <GatedAttn />
        <MoE />
        <Balance />
        <Train />
        <Lineup />
        <Future />
        <Trails />
      </main>
      <footer className="border-t border-white/5 py-10 px-4 text-center text-xs text-neutral-500">
        Synthesized from the public technical reports and model cards of Qwen, DeepSeek, Moonshot, MiniMax, Z.ai, OpenAI, Google, NVIDIA and others.
        Figures are as published; illustrative simulations are labeled as such.
      </footer>
    </div>
  );
}
