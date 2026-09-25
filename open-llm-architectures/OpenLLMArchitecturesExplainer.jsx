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
const CHART_CLS = 'w-full min-w-[460px] max-w-[640px] mx-auto block';

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
// CARD 3 — Sliding windows, global layers & attention sinks
// ============================================================================

const MaskGrid = ({ mode, win, sink }) => {
  const N = 20, cell = 12, pad = 26;
  const S = pad + N * cell + 4;
  const allowed = (i, j) => {
    if (j > i) return false;
    if (mode === 'full') return true;
    if (sink && j === 0) return true;
    return i - j < win;
  };
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[260px] mx-auto block">
      <text x={pad} y={14} fontSize={10} fill="#a3a3a3">keys →</text>
      <text x={10} y={pad + 30} fontSize={10} fill="#a3a3a3" transform={`rotate(-90 10 ${pad + 30})`} textAnchor="middle">queries</text>
      {Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => {
        const on = allowed(i, j);
        const isSink = sink && mode !== 'full' && j === 0 && i - j >= win;
        return (
          <rect key={`${i}-${j}`} x={pad + j * cell} y={pad - 6 + i * cell} width={cell - 1.5} height={cell - 1.5} rx={1.5}
            fill={!on ? '#ffffff' : isSink ? '#e879f9' : mode === 'full' ? '#f97316' : '#fb923c'}
            fillOpacity={!on ? 0.03 : isSink ? 0.8 : 0.7} />
        );
      }))}
    </svg>
  );
};

const Windows = () => {
  const [mode, setMode] = useState('window');
  const [sink, setSink] = useState(true);
  const [ratio, setRatio] = useState(5);
  const [logW, setLogW] = useState(10); // 2^10 = 1024
  const [logT, setLogT] = useState(Math.log10(131072));
  const Wn = 2 ** logW, T = Math.round(10 ** logT);
  const frac = (ratio * Math.min(Wn, T) + T) / ((ratio + 1) * T);
  return (
    <Card id="c-window" icon={Scissors} title="Sliding windows, global layers & attention sinks" subtitle="Most layers only need the last thousand tokens" accent="orange" index={3} source="Gemma 2/3 · gpt-oss · StreamingLLM">
      <MinSchema>
        A <Term>sliding window</Term> layer caches only the last <Eq>W</Eq> tokens. Interleave many of them with a few full-attention "global" layers and
        the cache shrinks by roughly the local:global ratio — the global layers still see everything.
      </MinSchema>

      <div className="grid md:grid-cols-[1fr_1.3fr] gap-4 items-start">
        <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-3 space-y-2">
          <Tabs options={[{ key: 'full', label: 'full causal' }, { key: 'window', label: 'window W=5' }]} value={mode} onChange={setMode} color="orange" />
          <MaskGrid mode={mode} win={5} sink={sink} />
          <label className="flex items-center gap-2 text-[11px] text-neutral-300">
            <input type="checkbox" checked={sink} onChange={(e) => setSink(e.target.checked)} className="accent-fuchsia-400" />
            keep token 0 visible (<Term>attention sink</Term>)
          </label>
          <div className="text-[11px] text-neutral-500 leading-snug">Each row is a query; lit cells are the keys it may read. The window is a diagonal band; the pink column is the sink.</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">KV cache vs an all-global model</div>
          <Slider label="local : global layer ratio" value={ratio} min={0} max={7} onChange={setRatio} fmt={v => `${v} : 1`} color="accent-orange-400" />
          <Slider label="window W" value={logW} min={7} max={13} onChange={setLogW} fmt={() => `${fmtNum(Wn)} tokens`} color="accent-orange-400" />
          <Slider label="context length" value={logT} min={3} max={6} step={0.01} onChange={setLogT} fmt={() => `${fmtTok(T)} tokens`} color="accent-orange-400" />
          <div className="h-5 rounded bg-white/[0.05] overflow-hidden">
            <motion.div className="h-full bg-orange-400/80" animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="cache kept" value={`${(frac * 100).toFixed(1)}%`} color="text-orange-300" />
            <Stat label="saving" value={`${(1 / frac).toFixed(1)}×`} color="text-emerald-300" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { l: 'Gemma 3 (5:1, 1024)', r: 5, w: 10 },
              { l: 'gpt-oss (1:1, 128)', r: 1, w: 7 },
              { l: 'Gemma 2 (1:1, 4096)', r: 1, w: 12 },
            ].map(p => (
              <button key={p.l} onClick={() => { setRatio(p.r); setLogW(p.w); }} className="text-[10px] rounded border border-white/10 px-2 py-1 text-neutral-300 hover:bg-white/5">{p.l}</button>
            ))}
          </div>
        </div>
      </div>

      <Worked title="worked example · Gemma 3 at 128K">
        <Block>{String.raw`\frac{\num{5}\cdot \num{1024} + \num{131072}}{\num{6}\cdot \num{131072}} = \frac{136{,}192}{786{,}432} \approx \gr{17\%}\ \text{of the all-global cache}`}</Block>
        <div>Five of every six layers stop growing at 1,024 tokens. The global sixth layer is now ~96% of what's left — the next bottleneck, which is where <CrossLink to="c-sparse" recap="Sparse attention keeps full-length context but reads only the top-k most relevant tokens.">sparse</CrossLink> and <CrossLink to="c-hybrid" recap="Hybrids swap most layers for fixed-state linear attention and keep ~1 in 4 as full softmax.">hybrid</CrossLink> designs come in.</div>
      </Worked>

      <p className="text-[14px]">
        <strong className="text-fuchsia-300">Attention sinks.</strong> Softmax must put its probability <em>somewhere</em>. Trained heads learn to dump unneeded mass on the first
        token — so a naive window that evicts token 0 collapses (StreamingLLM, 2023). Fixes: keep the first few tokens forever, or give each head a learned
        "attend to nothing" logit, as gpt-oss does:
      </p>
      <Block>{String.raw`a_{ts} = \frac{e^{q_t\cdot k_s}}{\hi{e^{\,\sigma_h}} + \sum_{s'\le t} e^{q_t\cdot k_{s'}}}\qquad \text{(learned sink } \sigma_h \text{ per head — weights may sum to } {<}1)`}</Block>

      <Misconception
        wrong="A 1,024-token window means the model can't use information older than 1,024 tokens."
        right="Only that layer's direct reach is limited. Global layers read everything, and information hops forward W tokens per stacked window layer."
        because="The residual stream carries each position's accumulated summary upward; a 1K window over 40 layers has a 40K-token theoretical receptive field." />

      <WhenItMatters>Deciding whether a model's advertised 128K context is cheap to serve: count its global layers — that's where the cache lives.</WhenItMatters>

      <QA items={[
        { q: 'With a 3:1 local:global ratio and W ≪ T, roughly what fraction of the full cache remains?', a: 'About 1/4 — only the global layer in each group of four keeps a full-length cache.' },
        { q: 'Why does gpt-oss add a learned sink logit instead of just keeping token 0?', a: 'It lets each head output "nothing" explicitly (weights summing to less than 1) without hijacking a real token as a garbage bin — cleaner for windows and long contexts.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 4 — Sparse attention: DSA, NSA, MoBA
// ============================================================================

const SPARSE_N = 64;
const Sparse = () => {
  const [k, setK] = useState(8);
  const [noise, setNoise] = useState(0.6);
  const [seed, setSeed] = useState(3);
  const data = useMemo(() => {
    const rng = mulberry32(seed * 7919);
    // true logits: background + a few "needles" (relevant facts) + recency bump
    const logits = Array.from({ length: SPARSE_N }, (_, i) => gauss(rng) * 0.8 + (i > SPARSE_N - 5 ? 2 : 0));
    for (let n = 0; n < 5; n++) logits[Math.floor(rng() * (SPARSE_N - 6))] += 3.2 + rng() * 1.5;
    const mx = Math.max(...logits);
    const ex = logits.map(l => Math.exp(l - mx));
    const Z = ex.reduce((a, b) => a + b, 0);
    const w = ex.map(e => e / Z);
    const nrng = mulberry32(seed * 104729 + 1);
    const idxNoise = Array.from({ length: SPARSE_N }, () => gauss(nrng));
    return { logits, w, idxNoise };
  }, [seed]);
  const indexScore = data.logits.map((l, i) => l + noise * 1.6 * data.idxNoise[i]);
  const order = indexScore.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map(x => x[1]);
  const sel = new Set(order);
  const captured = order.reduce((a, i) => a + data.w[i], 0);
  const maxW = Math.max(...data.w);
  const W = 520, H = 170, L = 8, bw = (W - 2 * L) / SPARSE_N;
  return (
    <Card id="c-sparse" icon={Filter} title="Sparse attention: read only what matters" subtitle="A cheap scorer picks the top-k past tokens; exact attention runs on those alone" accent="rose" index={4} source="NSA (2025) · MoBA (2025) · DeepSeek-V3.2 DSA (2025)">
      <MinSchema>
        Softmax weights are extremely peaked — a handful of past tokens carry most of the mass. Sparse attention keeps the <em>whole</em> cache but has each query
        read only its top-<Eq>k</Eq> entries, picked by a tiny indexer. Attention compute drops from <Eq>O(T)</Eq> to <Eq>O(k)</Eq> per token.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">one query, 64 past tokens · bar = true softmax weight</div>
          <div className="text-[10px] text-neutral-500">illustrative simulation</div>
        </div>
        <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
          {data.w.map((w, i) => {
            const h = (w / maxW) * (H - 40);
            return (
              <g key={i}>
                <motion.rect x={L + i * bw + 1} width={bw - 2} rx={1.5}
                  initial={false} animate={{ y: H - 26 - h, height: Math.max(1, h) }} transition={{ duration: 0.3 }}
                  fill={sel.has(i) ? '#fb7185' : '#525252'} fillOpacity={sel.has(i) ? 0.95 : 0.6} />
                {sel.has(i) && <circle cx={L + i * bw + bw / 2} cy={H - 16} r={2.5} fill="#fda4af" />}
              </g>
            );
          })}
          <text x={L} y={H - 2} fontSize={11} fill="#a3a3a3">oldest</text>
          <text x={W - L} y={H - 2} fontSize={11} fill="#a3a3a3" textAnchor="end">most recent</text>
          <text x={W / 2} y={H - 2} fontSize={11} fill="#fda4af" textAnchor="middle">● picked by indexer</text>
        </svg></ChartBox>
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="top-k tokens read" value={k} min={1} max={32} onChange={setK} color="accent-rose-400" />
          <Slider label="indexer noise (cheaper indexer →)" value={noise} min={0} max={1.5} step={0.05} onChange={setNoise} fmt={v => v.toFixed(2)} color="accent-rose-400" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="attention mass kept" value={`${Math.round(captured * 100)}%`} color={captured > 0.85 ? 'text-emerald-300' : 'text-amber-300'} />
          <Stat label="tokens read" value={`${k} / ${SPARSE_N}`} color="text-rose-300" />
          <Stat label="compute" value={`${Math.round((k / SPARSE_N) * 100)}%`} sub="of dense attention" />
        </div>
        <button onClick={() => setSeed(s => s + 1)} className="text-[11px] rounded border border-white/15 px-2 py-1 text-neutral-300 hover:bg-white/5 inline-flex items-center gap-1"><RotateCcw className="w-3 h-3" />new query</button>
      </div>

      <Predict question="DeepSeek-V3.2 uses k = 2,048 regardless of context length. At a 128K-token context, what fraction of the cache does each query's main attention actually read?">
        <span className="font-mono">2,048 / 131,072 ≈ 1.6%</span>. The indexer still scans all 128K keys, but with a few small FP8 heads — so its <Eq>O(T)</Eq> term has a tiny constant. Main-attention cost becomes flat in context length.
      </Predict>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { h: 'DSA · DeepSeek-V3.2', c: 'text-rose-300', b: 'Token-level top-k. A "lightning indexer" (few heads, FP8, ReLU scores) ranks every past token; MLA then runs on the top 2,048. Trained by first distilling the indexer toward dense attention, then sparse training.' },
          { h: 'NSA · DeepSeek', c: 'text-orange-300', b: 'Three branches mixed by learned gates: compressed block summaries (coarse view), top-k selected blocks (fine detail), and a sliding window (local). Block-granular so it maps to GPU tiles.' },
          { h: 'MoBA · Moonshot', c: 'text-cyan-300', b: 'MoE applied to context: split the past into blocks, score each block by its mean-pooled key, route each query to the top-k blocks (plus its own). Switchable with full attention.' },
        ].map(x => (
          <div key={x.h} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className={`text-[11px] uppercase tracking-widest ${x.c}`}>{x.h}</div>
            <div className="mt-1 text-[12.5px] text-neutral-300 leading-snug">{x.b}</div>
          </div>
        ))}
      </div>

      <Block>{String.raw`I_{t,s} = \sum_{j=1}^{H^I} w_{t,j}\,\mathrm{ReLU}\!\big(q^{I}_{t,j}\cdot k^{I}_{s}\big)\qquad \mathcal{S}_t = \operatorname{top\text{-}k}_s\, I_{t,s}\qquad u_t = \mathrm{Attn}\big(q_t,\ \{k_s, v_s\}_{s\in\mathcal{S}_t}\big)`}</Block>

      <Misconception
        wrong="Sparse attention saves memory like a sliding window does."
        right="DSA/NSA/MoBA mostly save compute and bandwidth. The full cache still has to be stored, because any old token might be picked later."
        because="Top-k is chosen per query, per step. You can't evict what a future query might need — memory savings need latent (MLA), windows, or linear state." />

      <WhenItMatters>Long prefill and long-context decode costs (agents re-reading 100K-token histories). DeepSeek cut API prices sharply when V3.2 shipped DSA — that's this card, priced in.</WhenItMatters>

      <Deeper>
        <p>
          <strong>Why not just learn top-k end to end?</strong> Top-k is non-differentiable. DSA sidesteps it: the indexer is trained with a KL loss toward the dense attention distribution
          (summed over heads), while the main model trains only through the selected tokens. NSA instead makes selection block-level and lets gradients flow through the compressed branch
          that produces the block scores.
        </p>
        <p>
          <strong>The trend continues.</strong> DeepSeek's later designs compress the cache <em>and</em> sparsify reads — see the sibling <CrossLink to="deepseek-v4" recap="Sibling explainer: DeepSeek-V4's compressed-sparse attention (CSA/HCA), mHC residuals, Muon and FP4 training.">DeepSeek-V4 explainer</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'In the simulation, why does a noisier indexer need a larger k for the same attention mass?', a: 'Noise makes it rank some irrelevant tokens above true needles; a bigger k is the safety margin that still catches the needles.' },
        { q: 'Why do NSA and MoBA select blocks rather than individual tokens?', a: 'Contiguous blocks map to GPU memory tiles, so the gather is fast. Token-level selection (DSA) needs a carefully engineered kernel to be efficient.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// Shared associative-memory simulator (cards 5–8). Real math, tiny sizes:
// state S is d_v × d_k; write rules act on (k, v) pairs; read is S·q.
// ============================================================================

const unitVec = (rng, d) => {
  const v = Array.from({ length: d }, () => gauss(rng));
  const n = Math.hypot(...v) || 1;
  return v.map(x => x / n);
};
const readS = (S, k) => S.map(row => row.reduce((a, x, j) => a + x * k[j], 0));
const cosSim = (a, b) => {
  let s = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return s / Math.sqrt(na * nb + 1e-12);
};
// writes: [{k, v, a?}] — a = decay gate for that step (scalar or per-channel array over k-dims)
const runMemory = (rule, writes, { d = 16, beta = 1, alpha = 1 } = {}) => {
  const S = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const w of writes) {
    const a = w.a ?? alpha;
    if (Array.isArray(a)) { for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) S[i][j] *= a[j]; }
    else if (a !== 1) { for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) S[i][j] *= a; }
    if (rule === 'add') {
      for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) S[i][j] += w.v[i] * w.k[j];
    } else {
      const p = readS(S, w.k);
      for (let i = 0; i < d; i++) { const e = beta * (w.v[i] - p[i]); for (let j = 0; j < d; j++) S[i][j] += e * w.k[j]; }
    }
  }
  return S;
};
const MEM_D = 16;
const recallColor = (c) => (c >= 0.8 ? '#34d399' : c >= 0.5 ? '#fbbf24' : '#fb7185');
const meanOf = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// ============================================================================
// CARD 5 — Linear attention: the past as a fixed-size matrix
// ============================================================================

const LIN_D = 8;
const Linear = () => {
  const [ref, enterKey] = useEnterKey();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const acc = useRef(0);
  const stream = useMemo(() => {
    const rng = mulberry32(42);
    return Array.from({ length: 64 }, () => ({ k: unitVec(rng, LIN_D), v: unitVec(rng, LIN_D) }));
  }, []);
  useEffect(() => { setT(0); acc.current = 0; setPlaying(true); }, [enterKey]);
  useTicker(playing, (dt) => {
    acc.current += dt * 3 * speed;
    if (acc.current >= 1) { acc.current = 0; setT(x => (x >= 63 ? 63 : x + 1)); }
  });
  useEffect(() => { if (t >= 63) setPlaying(false); }, [t]);
  const S = useMemo(() => runMemory('add', stream.slice(0, t + 1), { d: LIN_D }), [t, stream]);
  const mx = Math.max(1e-6, ...S.flat().map(Math.abs));
  const cell = 22;
  const kvNums = 2 * 128 * (t + 1), stateNums = 128 * 128;
  return (
    <Card id="c-linear" icon={Waves} title="Linear attention: the past as a fixed-size matrix" subtitle="Drop the softmax and attention turns into an RNN" accent="cyan" index={5} source="Katharopoulos et al. 2020 · RetNet · Mamba-2">
      <MinSchema>
        Remove the softmax and the sum over the past factorizes: <Eq>{String.raw`o_t = \st{S_t}\, q_t`}</Eq> with <Eq>{String.raw`\st{S_t} = \st{S_{t-1}} + v_t k_t^{\top}`}</Eq>.
        The whole history lives in one <Eq>d\times d</Eq> matrix — constant memory and constant time per token, however long the context.
      </MinSchema>

      <Block>{String.raw`\underbrace{o_t=\sum_{s\le t}\frac{\at{e^{q_t^{\top}k_s}}}{\sum_{s'}\at{e^{q_t^{\top}k_{s'}}}}\,v_s}_{\text{softmax: keep every } k_s, v_s}
\;\;\xrightarrow{\;\text{drop } e^{(\cdot)}\;}\;\;
o_t=\sum_{s\le t}(q_t^{\top}k_s)\,v_s=\Big(\underbrace{\sum_{s\le t} v_s k_s^{\top}}_{\st{S_t}}\Big)\,q_t`}</Block>

      <div ref={ref} className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">token {t + 1} of 64 · head size shown: {LIN_D}</div>
          <PlayControls playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onReset={() => { setT(0); setPlaying(true); }} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-orange-300 mb-1.5">softmax · the KV cache grows</div>
            <div className="flex flex-wrap gap-[3px] min-h-[120px] content-start">
              {Array.from({ length: t + 1 }, (_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-6 rounded-sm bg-orange-400/70" />
              ))}
            </div>
            <div className="mt-2 text-[11px] text-neutral-400">one K and V column per token → <span className="font-mono text-orange-300">O(T)</span> memory, and every new query scans all of it</div>
          </div>
          <div>
            <div className="text-[11px] text-cyan-300 mb-1.5">linear · the state matrix <Eq>{String.raw`S_t`}</Eq> just changes</div>
            <svg viewBox={`0 0 ${LIN_D * cell} ${LIN_D * cell}`} className="w-[176px] h-[176px] block">
              {S.map((row, i) => row.map((x, j) => (
                <rect key={`${i}-${j}`} x={j * cell + 1} y={i * cell + 1} width={cell - 2} height={cell - 2} rx={2}
                  fill={x >= 0 ? '#22d3ee' : '#f472b6'} fillOpacity={0.08 + 0.85 * Math.abs(x) / mx} />
              )))}
            </svg>
            <div className="mt-2 text-[11px] text-neutral-400">each token adds one outer product <Eq>{String.raw`v_t k_t^\top`}</Eq> → <span className="font-mono text-cyan-300">O(1)</span> memory</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="KV cache · real head (d=128)" value={fmtNum(kvNums)} sub="numbers per head per layer" color="text-orange-300" />
          <Stat label="state · real head (d=128)" value={fmtNum(stateNums)} sub="fixed, forever" color="text-cyan-300" />
        </div>
      </div>

      <Predict question="With a head dimension of 128, after how many tokens does a linear-attention state (128 × 128) become smaller than that head's KV cache (2 × 128 per token)?">
        <span className="font-mono">128² ÷ (2·128) = 64 tokens.</span> Past 64 tokens the state is cheaper, and at 1M tokens it is ~16,000× smaller. The catch: the cache stored the past <em>exactly</em>; the state is a lossy superposition.
      </Predict>

      <Misconception
        wrong="Linear attention is a sliding window with extra steps — it just forgets old tokens."
        right="Plain linear attention forgets nothing: every token stays superimposed in S forever. Its failure is the opposite — interference."
        because={<>A <Eq>d\times d</Eq> matrix can hold only about <Eq>d</Eq> clean key→value associations. Beyond that, reads return blends of many stored values. The next card fixes <em>how</em> we write; the one after adds a way to forget.</>} />

      <WhenItMatters>Anyone serving 100K–1M-token contexts: a layer with a fixed-size state has no KV cache to page, shard or evict. That's why Qwen, Kimi, NVIDIA and IBM all put these layers in production models.</WhenItMatters>

      <Deeper>
        <p>
          <strong>Kernel view.</strong> Softmax attention uses the similarity <Eq>{String.raw`\exp(q^\top k)`}</Eq>; any similarity that factors as <Eq>{String.raw`\phi(q)^\top\phi(k)`}</Eq> allows the reordering above. Early work chose feature maps <Eq>\phi</Eq> (elu+1, random features); modern layers use the identity map on L2-normalized <Eq>q,k</Eq> plus a short causal convolution, and rely on gating and the delta rule for quality.
        </p>
        <p>
          <strong>Training is still parallel.</strong> A token-by-token RNN would waste GPUs. The <Term>chunkwise parallel</Term> form splits the sequence into chunks of ~64: inside a chunk it runs ordinary (masked) matrix-multiply attention; between chunks it passes <Eq>S</Eq>. Cost is <Eq>{String.raw`O(T\,C\,d + T d^2)`}</Eq> — linear in <Eq>T</Eq> and tensor-core friendly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What does it cost to generate token 1,000,001 with a linear-attention layer vs a softmax layer?', a: 'Linear: one d×d state update and one matrix-vector read — same as token 2. Softmax: a dot product against all 1,000,000 cached keys.' },
        { q: 'Plain linear attention underperforms softmax. Is it forgetting too much or too little?', a: 'Too little, in the wrong way: everything is summed into S with equal weight, so associations interfere. Gates (forgetting) and the delta rule (overwriting) are the two fixes.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 6 — The delta rule: write the error, not the value
// ============================================================================

const deltaExperiment = (N, updFrac, beta, seed) => {
  const rng = mulberry32(seed * 2654435761);
  const keys = Array.from({ length: N }, () => unitVec(rng, MEM_D));
  const first = keys.map(() => unitVec(rng, MEM_D));
  const writes = keys.map((k, i) => ({ k, v: first[i] }));
  const latest = [...first];
  const nu = Math.round(N * updFrac);
  for (let i = 0; i < nu; i++) { const nv = unitVec(rng, MEM_D); writes.push({ k: keys[i], v: nv }); latest[i] = nv; }
  const out = {};
  for (const rule of ['add', 'delta']) {
    const S = runMemory(rule, writes, { d: MEM_D, beta });
    out[rule] = keys.map((k, i) => cosSim(readS(S, k), latest[i]));
  }
  return { ...out, nu };
};

const Delta = () => {
  const [N, setN] = useState(10);
  const [upd, setUpd] = useState(0.3);
  const [beta, setBeta] = useState(1);
  const [seed, setSeed] = useState(1);
  const ex = useMemo(() => deltaExperiment(N, upd, beta, seed), [N, upd, beta, seed]);
  const sweep = useMemo(() => {
    const Ns = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32];
    return Ns.map(n => {
      const r = { n, add: 0, delta: 0 };
      for (let s = 1; s <= 6; s++) { const e = deltaExperiment(n, upd, beta, 100 + s); r.add += meanOf(e.add) / 6; r.delta += meanOf(e.delta) / 6; }
      return r;
    });
  }, [upd, beta]);
  const rows = [
    { key: 'add', label: 'additive (linear attn)', data: ex.add, c: 'text-orange-300' },
    { key: 'delta', label: 'delta rule (DeltaNet)', data: ex.delta, c: 'text-cyan-300' },
  ];
  const W = 460, H = 180, L = 40, R = 12, Tp = 12, Bm = 34;
  const sx = (n) => L + ((n - 2) / 30) * (W - L - R);
  const sy = (v) => Tp + (1 - clamp(v, 0, 1)) * (H - Tp - Bm);
  const line = (key) => 'M' + sweep.map(r => `${sx(r.n).toFixed(1)},${sy(r[key]).toFixed(1)}`).join('L');
  return (
    <Card id="c-delta" icon={Brain} title="The delta rule: write the error, not the value" subtitle="Before storing v under key k, subtract what the memory already says about k" accent="cyan" index={6} source="Widrow–Hoff 1960 · Schlag et al. 2021 · DeltaNet (Yang et al., NeurIPS 2024)">
      <MinSchema>
        Additive memory piles new values on top of old ones. The <Term>delta rule</Term> first reads the current prediction <Eq>{String.raw`\st{S}k_t`}</Eq>, then writes only the
        correction <Eq>{String.raw`\beta_t\,(v_t-\st{S}k_t)`}</Eq>. Updating a fact <em>replaces</em> it instead of averaging it with the stale version.
      </MinSchema>

      <Block>{String.raw`\st{S_t} = \st{S_{t-1}} + \beta_t\big(v_t - \st{S_{t-1}}k_t\big)k_t^{\top} \;=\; \st{S_{t-1}}\big(I-\beta_t k_t k_t^{\top}\big) + \beta_t v_t k_t^{\top}`}</Block>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">store N facts in a 16×16 memory, then update some of them · bar = recall of the latest value</div>
          <div className="text-[10px] text-neutral-500">live simulation, real vectors</div>
        </div>
        {rows.map(r => (
          <div key={r.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[11px]">
              <span className={r.c}>{r.label}</span>
              <span className="text-neutral-400">
                all facts <span className="font-mono text-neutral-100">{meanOf(r.data).toFixed(2)}</span> · updated facts{' '}
                <span className="font-mono text-neutral-100">{ex.nu ? meanOf(r.data.slice(0, ex.nu)).toFixed(2) : '—'}</span>
              </span>
            </div>
            <div className="mt-1 flex items-end gap-[3px] h-14">
              {r.data.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <motion.div className="w-full rounded-sm" style={{ background: recallColor(c) }}
                    initial={false} animate={{ height: `${Math.max(4, clamp(c, 0, 1) * 100)}%` }} transition={{ duration: 0.3 }} />
                  <div className={`mt-0.5 h-1 w-1 rounded-full ${i < ex.nu ? 'bg-fuchsia-300' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-[10px] text-neutral-500 flex flex-wrap gap-x-3">
          <span><span className="inline-block w-2 h-2 rounded-sm bg-emerald-400 mr-1" />recall ≥ 0.8</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-amber-400 mr-1" />0.5–0.8</span>
          <span><span className="inline-block w-2 h-2 rounded-sm bg-rose-400 mr-1" />&lt; 0.5</span>
          <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-fuchsia-300 mr-1" />fact was overwritten later</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Slider label="facts stored (N)" value={N} min={2} max={32} onChange={setN} />
          <Slider label="share later updated" value={upd} min={0} max={0.6} step={0.05} onChange={setUpd} fmt={v => `${Math.round(v * 100)}%`} />
          <Slider label="write strength β" value={beta} min={0.1} max={1} step={0.05} onChange={setBeta} fmt={v => v.toFixed(2)} />
        </div>
        <button onClick={() => setSeed(s => s + 1)} className="text-[11px] rounded border border-white/15 px-2 py-1 text-neutral-300 hover:bg-white/5 inline-flex items-center gap-1"><RotateCcw className="w-3 h-3" />new random facts</button>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400 mb-1">mean recall vs number of facts (avg of 6 runs)</div>
        <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
          {[0, 0.5, 1].map(v => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={sy(v)} y2={sy(v)} stroke="#fff" strokeOpacity={0.07} />
              <text x={L - 6} y={sy(v) + 4} fontSize={11} fill="#a3a3a3" textAnchor="end">{v.toFixed(1)}</text>
            </g>
          ))}
          <line x1={sx(16)} x2={sx(16)} y1={Tp} y2={H - Bm} stroke="#e879f9" strokeOpacity={0.5} strokeDasharray="4 4" />
          <text x={sx(16) + 4} y={Tp + 10} fontSize={11} fill="#f0abfc">N = d = 16</text>
          <path d={line('add')} fill="none" stroke="#fdba74" strokeWidth={2} />
          <path d={line('delta')} fill="none" stroke="#67e8f9" strokeWidth={2} />
          <line x1={sx(N)} x2={sx(N)} y1={Tp} y2={H - Bm} stroke="#fff" strokeOpacity={0.3} />
          {[2, 8, 16, 24, 32].map(n => <text key={n} x={sx(n)} y={H - Bm + 15} fontSize={11} fill="#a3a3a3" textAnchor="middle">{n}</text>)}
          <text x={(L + W - R) / 2} y={H - 4} fontSize={11} fill="#a3a3a3" textAnchor="middle">facts stored</text>
          <text x={W - R} y={sy(sweep[sweep.length - 1].add) - 6} fontSize={11} fill="#fdba74" textAnchor="end">additive</text>
          <text x={W - R} y={sy(sweep[sweep.length - 1].delta) + 14} fontSize={11} fill="#67e8f9" textAnchor="end">delta</text>
        </svg></ChartBox>
        <div className="text-[11px] text-neutral-400 mt-1">Below capacity the delta rule wins, and wins hugely on updated facts. Far past <Eq>N=d</Eq> both are saturated — the delta rule then favors the <em>newest</em> facts, additive memory blurs all of them equally.</div>
      </div>

      <Worked title="worked example · one delta step by hand">
        <div>Memory currently maps key <Eq>{String.raw`k=(1,0)`}</Eq> to <Eq>{String.raw`\st{S}k = \num{3}`}</Eq> (the old value). New fact: <Eq>{String.raw`v=\num{5}`}</Eq>, with <Eq>{String.raw`\beta=\num{1}`}</Eq>.</div>
        <Block>{String.raw`\text{error} = v - \st{S}k = \num{5}-\num{3} = \num{2} \;\Rightarrow\; \st{S}_{\text{new}}k = \num{3} + \num{1}\cdot\num{2}\cdot\underbrace{k^{\top}k}_{=1} = \gr{5}\quad\text{(additive would give } \hi{3+5=8}\text{)}`}</Block>
      </Worked>

      <Misconception
        wrong="The delta rule is a heuristic bolted onto linear attention."
        right={<>It is exactly one step of online gradient descent on the regression loss <Eq>{String.raw`\tfrac12\lVert \st{S}k_t - v_t\rVert^2`}</Eq> with learning rate <Eq>{String.raw`\beta_t`}</Eq>.</>}
        because="The gradient of that loss w.r.t. S is (Sk − v)kᵀ. Plain linear attention is the same step on a linear loss −⟨Sk, v⟩, which never says 'you already know this'. This 'memory as test-time regression' view is what unifies DeltaNet, Titans and friends." />

      <Deeper>
        <p>
          <strong>Why the Householder shape matters.</strong> <Eq>{String.raw`I-\beta_t k_tk_t^{\top}`}</Eq> is a generalized Householder transform (for <Eq>{String.raw`\beta_t=2`}</Eq>, a reflection). Products of these can be batched with the WY representation, which is what made DeltaNet trainable chunkwise on GPUs (Yang et al., 2024). With <Eq>{String.raw`\beta\in(0,2)`}</Eq> the transition is non-expansive, so the recurrence stays stable over a million steps.
        </p>
        <p>
          <strong>Keys must be normalized.</strong> The update subtracts <Eq>{String.raw`\beta\,(Sk)k^\top`}</Eq>; if <Eq>{String.raw`\lVert k\rVert`}</Eq> drifts, the effective step <Eq>{String.raw`\beta\lVert k\rVert^2`}</Eq> can overshoot. Production layers L2-normalize <Eq>q</Eq> and <Eq>k</Eq> per head and produce <Eq>{String.raw`\beta_t=\sigma(W_\beta x_t)`}</Eq>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'A fact is written twice with different values. What does additive memory return for its key?', a: 'Roughly the sum (a blend) of both values, plus interference. The delta rule returns (close to) the newer value, because its second write only adds the difference.' },
        { q: 'What does β = 0 mean for a token? And β = 1?', a: 'β = 0: skip writing this token entirely. β = 1: fully overwrite the association for this key. The model learns β per token, so it can choose what is worth remembering.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 7 — Gated DeltaNet
// ============================================================================

// Scenario B: document A (nA facts) → boundary token (gate aB) → document B (6 facts).
const switchExperiment = (rule, nA, aB, beta, seed) => {
  const rng = mulberry32(seed * 40503 + 7);
  const A = Array.from({ length: nA }, () => ({ k: unitVec(rng, MEM_D), v: unitVec(rng, MEM_D) }));
  const B = Array.from({ length: 6 }, () => ({ k: unitVec(rng, MEM_D), v: unitVec(rng, MEM_D) }));
  const writes = [...A, { ...B[0], a: aB }, ...B.slice(1)];
  const S = runMemory(rule, writes, { d: MEM_D, beta });
  return {
    newDoc: meanOf(B.map(w => cosSim(readS(S, w.k), w.v))),
    leak: meanOf(A.map(w => cosSim(readS(S, w.k), w.v))),
  };
};

const GDN_RULES = [
  { key: 'lin', label: 'Linear attention', rule: 'add', gated: false, c: 'text-neutral-300', parts: 'no gate · add' },
  { key: 'mamba', label: 'Mamba-2', rule: 'add', gated: true, c: 'text-orange-300', parts: 'gate α · add' },
  { key: 'delta', label: 'DeltaNet', rule: 'delta', gated: false, c: 'text-sky-300', parts: 'no gate · delta β' },
  { key: 'gdn', label: 'Gated DeltaNet', rule: 'delta', gated: true, c: 'text-cyan-300', parts: 'gate α · delta β' },
];

const ScoreCell = ({ v, good }) => {
  const ok = good === 'high' ? v >= 0.8 : v <= 0.15;
  const mid = good === 'high' ? v >= 0.65 : v <= 0.35;
  const cls = ok ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25' : mid ? 'bg-amber-500/10 text-amber-200 border-amber-400/20' : 'bg-rose-500/10 text-rose-200 border-rose-400/25';
  return <div className={`rounded-md border px-2 py-1.5 text-center font-mono text-[13px] ${cls}`}>{v.toFixed(2)}</div>;
};

const GateTimeline = ({ nA, aB }) => {
  const W = 480, H = 96, L = 10, R = 10, n = nA + 6 + 1;
  const x = (i) => L + (i + 0.5) * ((W - L - R) / n);
  const y = (a) => 16 + (1 - a) * 40;
  const pts = Array.from({ length: n }, (_, i) => [x(i), y(i === nA ? aB : 1)]);
  return (
    <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
      <text x={L} y={11} fontSize={11} fill="#a3a3a3">gate α_t per token</text>
      <path d={'M' + pts.map(p => p.join(',')).join('L')} fill="none" stroke="#fdba74" strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x(i) - ((W - L - R) / n) / 2 + 1} y={66} width={Math.max(2, (W - L - R) / n - 2)} height={12} rx={2}
          fill={i < nA ? '#a3a3a3' : i === nA ? '#f0abfc' : '#67e8f9'} fillOpacity={i === nA ? 0.9 : 0.45} />
      ))}
      <text x={L} y={92} fontSize={11} fill="#a3a3a3">document A · {nA} facts</text>
      <text x={W - R} y={92} fontSize={11} fill="#67e8f9" textAnchor="end">document B · 6 facts</text>
    </svg></ChartBox>
  );
};

const GDN = () => {
  const [nA, setNA] = useState(24);
  const [aB, setAB] = useState(0.05);
  const [beta, setBeta] = useState(1);
  const scores = useMemo(() => GDN_RULES.map(r => {
    const upd = [], nd = [], lk = [];
    for (let s = 1; s <= 12; s++) {
      const e = deltaExperiment(10, 0.3, beta, s);
      upd.push(...e[r.rule].slice(0, e.nu));
      const sw = switchExperiment(r.rule, nA, r.gated ? aB : 1, beta, s);
      nd.push(sw.newDoc); lk.push(sw.leak);
    }
    return { ...r, upd: meanOf(upd), newDoc: meanOf(nd), leak: meanOf(lk) };
  }), [nA, aB, beta]);
  return (
    <Card id="c-gdn" icon={Activity} title="Gated DeltaNet: forget wholesale, edit surgically" subtitle="Mamba-2's decay gate + DeltaNet's error-correcting write, in one recurrence" accent="cyan" index={7} anchor source="Yang, Kautz & Hatamizadeh · ICLR 2025 · NVIDIA">
      <MinSchema>
        Two knobs per token: <Eq>{String.raw`\gr{\alpha_t}\in(0,1)`}</Eq> shrinks the <em>whole</em> memory (clear the slate at a topic change), and <Eq>{String.raw`\beta_t`}</Eq> rewrites <em>one</em> association
        (update a fact). Gated DeltaNet is the layer inside Qwen3-Next, Qwen3.5 and Qwen3.8.
      </MinSchema>

      <Block>{String.raw`\st{S_t} = \st{S_{t-1}}\,\Big(\gr{\alpha_t}\,\big(I-\beta_t k_t k_t^{\top}\big)\Big) + \beta_t\, v_t k_t^{\top},\qquad o_t = \st{S_t}\, q_t`}</Block>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        {[
          { h: 'α_t = 1, β_t = 0', b: 'ignore this token', c: 'border-white/10' },
          { h: 'α_t ≈ 0', b: 'wipe memory (new document)', c: 'border-orange-400/25' },
          { h: 'β_t = 1', b: 'overwrite the value at k_t', c: 'border-cyan-400/25' },
          { h: 'α_t = 1 · add only', b: 'plain linear attention', c: 'border-white/10' },
        ].map(x => (
          <div key={x.h} className={`rounded-md border ${x.c} bg-white/[0.02] px-2 py-1.5`}>
            <div className="font-mono text-neutral-100">{x.h}</div>
            <div className="text-neutral-400 leading-snug">{x.b}</div>
          </div>
        ))}
      </div>

      <Predict question="Linear attention has two failure modes: it can't update a fact cleanly, and it can't drop an old document when a new one starts. Which fix — the gate α or the delta rule β — addresses which failure?">
        The <strong>delta rule</strong> fixes updates (it writes the difference, so the new value replaces the old). The <strong>gate</strong> fixes context switches (one small α wipes everything at once — the delta rule can only erase along the keys it happens to rewrite). The scorecard below measures exactly this.
      </Predict>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">ingredient scorecard · 16×16 memory · avg of 12 runs</div>
          <div className="text-[10px] text-neutral-500">live simulation</div>
        </div>
        <GateTimeline nA={nA} aB={aB} />
        <div className="overflow-x-auto">
          <div className="min-w-[440px] grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-1.5 items-center">
            <div />
            <div className="text-[10px] text-center text-neutral-400 leading-tight">recall of <br />updated facts ↑</div>
            <div className="text-[10px] text-center text-neutral-400 leading-tight">recall of <br />document B ↑</div>
            <div className="text-[10px] text-center text-neutral-400 leading-tight">leakage of <br />document A ↓</div>
            {scores.map(r => (
              <React.Fragment key={r.key}>
                <div>
                  <div className={`text-[12px] ${r.c}`}>{r.label}</div>
                  <div className="text-[10px] font-mono text-neutral-500">{r.parts}</div>
                </div>
                <ScoreCell v={r.upd} good="high" />
                <ScoreCell v={r.newDoc} good="high" />
                <ScoreCell v={r.leak} good="low" />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Slider label="facts in document A" value={nA} min={4} max={40} onChange={setNA} />
          <Slider label="gate at the boundary α" value={aB} min={0} max={1} step={0.01} onChange={setAB} fmt={v => v.toFixed(2)} color="accent-orange-400" />
          <Slider label="write strength β" value={beta} min={0.3} max={1} step={0.05} onChange={setBeta} fmt={v => v.toFixed(2)} />
        </div>
        <div className="text-[11px] text-neutral-400">Slide the boundary gate to 1 and the gated rules collapse into their ungated twins. In a real model <Eq>{String.raw`\alpha_t`}</Eq> is predicted from each token, so the network learns <em>where</em> the boundaries are.</div>
      </div>

      <Worked title="worked example · how long does a gated memory remember?">
        <div>With a steady gate <Eq>\alpha</Eq>, a write fades as <Eq>{String.raw`\alpha^{\text{age}}`}</Eq>, so its half-life is <Eq>{String.raw`\ln 0.5 / \ln\alpha`}</Eq>:</div>
        <Block>{String.raw`\alpha=\num{0.99}\Rightarrow \tfrac{\ln 0.5}{\ln 0.99}\approx \num{69}\ \text{tokens}\qquad \alpha=\num{0.9999}\Rightarrow \tfrac{\ln 0.5}{\ln 0.9999}\approx \gr{6{,}931}\ \text{tokens}`}</Block>
        <div>A memory horizon of thousands of tokens needs <Eq>\alpha</Eq> within <Eq>{String.raw`10^{-4}`}</Eq> of 1 — which is why it is parametrized in log-space, <Eq>{String.raw`\alpha_t=\exp(-e^{A}\,\mathrm{softplus}(W_\alpha x_t+b))`}</Eq>, not as a raw sigmoid.</div>
      </Worked>

      <Misconception
        wrong="The gate and the delta rule are two ways of doing the same thing — forgetting."
        right="The gate is time-based and global (everything fades). The delta rule is content-based and local (only the association at k_t changes)."
        because="GDN's paper title says it: 'Improving Mamba2 with Delta Rule'. Mamba-2 could clear but not edit; DeltaNet could edit but clears slowly. Combining them beat both on recall-heavy benchmarks at 1.3B scale." />

      <WhenItMatters>You'll meet this exact recurrence in Qwen3-Next-80B-A3B (Sep 2025: 48 layers = 12 × [3 GDN + 1 gated attention]), Qwen3.5-397B-A17B (Feb 2026) and AI2's Olmo Hybrid — in each, 3 of every 4 layers are GDN.</WhenItMatters>

      <Deeper>
        <p>
          <strong>The full production layer</strong> (Qwen3-Next style): project <Eq>q,k,v</Eq> → short causal conv1d (kernel 4) → SiLU → L2-normalize <Eq>q,k</Eq>; compute <Eq>{String.raw`\beta_t=\sigma(W_\beta x_t)`}</Eq> and log-space <Eq>{String.raw`\alpha_t`}</Eq>; run the chunkwise GDN kernel; then <Eq>{String.raw`\mathrm{RMSNorm}(o_t)\odot \mathrm{SiLU}(W_g x_t)`}</Eq> and the output projection. The conv gives cheap local token-shift; the output gate plays the same role as in <CrossLink to="c-gate" recap="Gated attention: multiply the attention output by a sigmoid gate computed from the input — removes attention sinks and stabilizes training.">gated attention</CrossLink>.
        </p>
        <p>
          <strong>Chunkwise training.</strong> The gate multiplies into the WY/UT transform as a cumulative product of <Eq>{String.raw`\alpha`}</Eq> within each chunk, so GDN keeps DeltaNet's hardware-efficient algorithm with little overhead (reference kernels in the <span className="font-mono">flash-linear-attention</span> library).
        </p>
        <p>
          <strong>Reported payoff at scale.</strong> Qwen says Qwen3.5-397B-A17B decodes 8.6× faster than Qwen3-Max at 32K context and 19× faster at 256K — the linear layers don't grow with context, and only 1 in 4 layers keeps a KV cache.
        </p>
      </Deeper>

      <QA items={[
        { q: 'In the scorecard, why does DeltaNet (no gate) still leak document A?', a: 'The delta rule only rewrites the directions of the keys it sees. Document B\'s 6 keys overwrite 6 directions; everything else from A stays in the state and can still be read out.' },
        { q: 'Why is α parametrized as exp(−e^A·softplus(·)) instead of a sigmoid?', a: 'Useful horizons need α extremely close to 1 (half-life ≈ 0.69/(1−α)). The log-space form makes those values easy to reach and keeps gradients well-scaled.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 8 — Kimi Delta Attention (channel-wise gating)
// ============================================================================

const KDA = () => {
  const [mode, setMode] = useState('kda');
  const [spread, setSpread] = useState(2.5);
  const [center, setCenter] = useState(2); // log10 of mean half-life
  const rows = 12, ages = 48;
  const halfLives = Array.from({ length: rows }, (_, i) => {
    const off = mode === 'kda' ? (i / (rows - 1) - 0.5) * spread : 0;
    return 10 ** (center + off);
  });
  const alphas = halfLives.map(h => Math.pow(0.5, 1 / h));
  const ageAt = (j) => Math.round(10 ** ((j / (ages - 1)) * 4)); // 1 .. 10,000 tokens (log)
  const cw = 9, ch = 14, L = 64, Tp = 8;
  const W = L + ages * cw + 8, H = Tp + rows * ch + 34;
  return (
    <Card id="c-kda" icon={Layers} title="Kimi Delta Attention: a forget-rate per channel" subtitle="Replace GDN's single scalar gate with a vector — each feature dimension picks its own memory horizon" accent="cyan" index={8} source="Kimi Linear (Moonshot, Oct 2025) · Kimi K3 (2026)">
      <MinSchema>
        <Term>KDA</Term> = Gated DeltaNet with <Eq>{String.raw`\gr{\alpha_t}`}</Eq> promoted from one number per head to one number per key channel. Some channels keep a topic for
        thousands of tokens while others turn over every few — one head, many timescales.
      </MinSchema>

      <Block>{String.raw`\st{S_t} = \big(I-\beta_t k_t k_t^{\top}\big)\,\mathrm{Diag}(\gr{\alpha_t})\,\st{S_{t-1}} + \beta_t\, k_t v_t^{\top},\qquad \gr{\alpha_t}\in(0,1)^{d_k}`}</Block>
      <div className="text-[11px] text-neutral-500 -mt-2">(written in the transposed <Eq>{String.raw`d_k\times d_v`}</Eq> convention Moonshot uses; GDN is the special case <Eq>{String.raw`\mathrm{Diag}(\alpha_t)=\alpha_t I`}</Eq>)</div>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">how much of a write survives, per channel, by age</div>
          <Tabs options={[{ key: 'gdn', label: 'scalar gate (GDN)' }, { key: 'kda', label: 'per-channel gate (KDA)' }]} value={mode} onChange={setMode} />
        </div>
        <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
          {alphas.map((a, i) => (
            <g key={i}>
              <text x={L - 6} y={Tp + i * ch + 10} fontSize={10} fill="#a3a3a3" textAnchor="end" fontFamily="monospace">
                {halfLives[i] >= 1000 ? `${(halfLives[i] / 1000).toFixed(1)}K` : Math.round(halfLives[i])}
              </text>
              {Array.from({ length: ages }, (_, j) => {
                const keep = Math.pow(a, ageAt(j));
                return <rect key={j} x={L + j * cw} y={Tp + i * ch} width={cw - 1} height={ch - 2} fill="#22d3ee" fillOpacity={0.04 + 0.9 * keep} />;
              })}
            </g>
          ))}
          {[1, 10, 100, 1000, 10000].map((t) => {
            const j = (Math.log10(t) / 4) * (ages - 1);
            return <text key={t} x={L + j * cw + cw / 2} y={Tp + rows * ch + 13} fontSize={10} fill="#a3a3a3" textAnchor="middle">{fmtTok(t)}</text>;
          })}
          <text x={L + (ages * cw) / 2} y={H - 3} fontSize={10} fill="#a3a3a3" textAnchor="middle">age of the write (tokens, log scale)</text>
          <text x={4} y={Tp + rows * ch + 13} fontSize={10} fill="#67e8f9">half-life</text>
        </svg></ChartBox>
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="typical half-life" value={center} min={0.5} max={3.5} step={0.05} onChange={setCenter} fmt={v => `${fmtTok(Math.round(10 ** v))} tokens`} />
          <Slider label="spread across channels (KDA only)" value={spread} min={0} max={4} step={0.1} onChange={setSpread} fmt={v => `${v.toFixed(1)} decades`} />
        </div>
        <div className="text-[11px] text-neutral-400">With one scalar gate every row fades together: pick a long horizon and the head can't refresh local detail; pick a short one and it forgets the topic. Per-channel gates let the same head do both.</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Kimi Linear" value="48B / 3B" sub="total / active · KDA : MLA = 3 : 1" color="text-cyan-300" />
        <Stat label="KV cache" value="−75%" sub="vs full MLA, at 1M context" color="text-emerald-300" />
        <Stat label="decode speed" value="6.3×" sub="time per output token vs MLA at 1M" color="text-emerald-300" />
        <Stat label="Kimi K3" value="69 : 24" sub="KDA : gated-MLA layers (93 total)" color="text-cyan-300" />
      </div>

      <Misconception
        wrong="A per-channel gate is just more parameters for a marginal gain."
        right="It changes what the recurrence can represent: a diagonal decay can act as a learned, content-dependent positional signal."
        because="Different channels decaying at different rates encode 'how long ago' the way RoPE's frequency bands encode position. Moonshot leans on this: Kimi Linear's MLA layers use no positional encoding at all and let KDA carry position." />

      <WhenItMatters>KDA is the Moonshot lineage's linear layer: Kimi Linear (48B-A3B, Oct 2025) proved it at small scale, and Kimi K3 (2.8T total / 104B active, 1M context, 2026) runs 69 KDA layers against 24 gated-MLA layers.</WhenItMatters>

      <Deeper>
        <p>
          <strong>Why not full matrix gates?</strong> A general transition <Eq>{String.raw`A_t = D_t - a_t b_t^\top`}</Eq> (diagonal-plus-low-rank, "DPLR") is more expressive but its chunkwise kernel is slower. KDA ties the low-rank part to the key itself (<Eq>{String.raw`a_t=b_t=\sqrt{\beta_t}k_t`}</Eq>) and keeps the diagonal fine-grained — a constrained DPLR that keeps the fast WY-style chunk algorithm.
        </p>
        <p>
          <strong>Where α comes from.</strong> The channel gates are produced from each token through a low-rank projection, then mapped into <Eq>(0,1)</Eq> in log-space like GDN's scalar gate — cheap to compute and stable near 1.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Set the spread to 0 in KDA mode. What do you get?', a: 'Every channel has the same α, i.e. exactly Gated DeltaNet\'s scalar gate. KDA strictly generalizes GDN.' },
        { q: 'Kimi Linear keeps 1 full-attention (MLA) layer in 4. Why roughly 75% less KV cache rather than 100%?', a: 'Only the MLA layers keep a per-token cache; the 3 KDA layers of each group hold a fixed-size state. One cache-bearing layer in four → about a quarter of the cache.' },
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
