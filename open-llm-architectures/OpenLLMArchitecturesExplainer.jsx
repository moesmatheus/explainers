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
// CARD 9 — Hybrid stacks
// ============================================================================

// Layer kinds → color + whether the layer keeps a per-token cache (and if capped, the cap).
const LAYER_KIND = {
  gdn:   { label: 'Gated DeltaNet', color: '#22d3ee', cache: 'state' },
  kda:   { label: 'KDA', color: '#2dd4bf', cache: 'state' },
  light: { label: 'Lightning (linear)', color: '#38bdf8', cache: 'state' },
  mamba: { label: 'Mamba-2', color: '#60a5fa', cache: 'state' },
  full:  { label: 'Full softmax (GQA / MLA)', color: '#fb923c', cache: 'full' },
  swa:   { label: 'Sliding window', color: '#fcd34d', cache: 'window' },
};
const rep = (pattern, n) => Array.from({ length: n }, () => pattern).flat();
const spread = (nA, a, nB, b) => { // evenly interleave nB b-layers among nA a-layers (schematic)
  const out = []; let bi = 0;
  for (let i = 0; i < nA + nB; i++) { const want = Math.round(((i + 1) * nB) / (nA + nB)); if (want > bi) { out.push(b); bi++; } else out.push(a); }
  return out;
};
const HYBRIDS = [
  { key: 'q3n', name: 'Qwen3-Next-80B-A3B', lab: 'Qwen · Sep 2025', layers: rep(['gdn', 'gdn', 'gdn', 'full'], 12), note: '48 layers = 12 × (3 GDN + 1 gated attention)' },
  { key: 'q35', name: 'Qwen3.5-397B-A17B', lab: 'Qwen · Feb 2026', layers: rep(['gdn', 'gdn', 'gdn', 'full'], 15), note: '60 layers = 15 × (3 GDN + 1 gated attention)' },
  { key: 'k3', name: 'Kimi K3', lab: 'Moonshot · 2026', layers: [...rep(['kda', 'kda', 'kda', 'full'], 23), 'full'], note: '93 layers: 69 KDA + 24 gated MLA (order schematic)' },
  { key: 'mm1', name: 'MiniMax-M1', lab: 'MiniMax · Jun 2025', layers: rep(['light', 'light', 'light', 'light', 'light', 'light', 'light', 'full'], 10), note: '80 layers: 7 lightning-attention : 1 softmax' },
  { key: 'nem', name: 'Nemotron 3 Nano 30B-A3B', lab: 'NVIDIA · Dec 2025', layers: spread(23, 'mamba', 6, 'full'), note: '23 Mamba-2 + 6 attention mixers (+ 23 MoE layers; order schematic)' },
  { key: 'g3', name: 'Gemma 3 27B', lab: 'Google · Mar 2025', layers: [...rep(['swa', 'swa', 'swa', 'swa', 'swa', 'full'], 10), 'swa', 'swa'], note: '62 layers: 5 sliding-window (1,024) : 1 global' },
  { key: 'oss', name: 'gpt-oss-120b', lab: 'OpenAI · Aug 2025', layers: rep(['swa', 'full'], 18), note: '36 layers alternating 128-token window and full attention' },
  { key: 'mm2', name: 'MiniMax-M2', lab: 'MiniMax · Oct 2025', layers: rep(['full'], 62), note: '62 layers, all full GQA — a deliberate step back' },
];

const cacheBytesRel = (layers, T, win) => {
  // relative to an all-full-attention model of the same depth (same per-layer cache width)
  let s = 0;
  for (const l of layers) {
    const c = LAYER_KIND[l].cache;
    s += c === 'full' ? T : c === 'window' ? Math.min(T, win) : 0;
  }
  return s / (layers.length * T);
};

const Hybrid = () => {
  const [sel, setSel] = useState('q35');
  const [logT, setLogT] = useState(Math.log10(262144));
  const T = Math.round(10 ** logT);
  return (
    <Card id="c-hybrid" icon={Network} title="Hybrid stacks: mostly linear, a little softmax" subtitle="Cheap fixed-state layers do the bulk mixing; a few full-attention layers do exact look-ups" accent="sky" index={9} source="Qwen3-Next · Qwen3.5 · Kimi Linear/K3 · MiniMax · Nemotron">
      <MinSchema>
        No flagship uses <em>only</em> linear layers. The 2025–26 consensus is about <strong>3 linear : 1 full-attention</strong>: the fixed-state layers carry local and
        summary information cheaply, and the minority of <Term>softmax attention</Term> layers keep an exact, searchable copy of the context.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-400 pb-1">
          {Object.entries(LAYER_KIND).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: v.color }} />{v.label}</span>
          ))}
        </div>
        {HYBRIDS.map(m => {
          const rel = cacheBytesRel(m.layers, T, m.key === 'oss' ? 128 : 1024);
          const on = sel === m.key;
          return (
            <button key={m.key} onClick={() => setSel(m.key)} className={`w-full text-left rounded-lg border px-2.5 py-2 transition-colors ${on ? 'border-sky-400/40 bg-sky-500/[0.06]' : 'border-transparent hover:bg-white/[0.03]'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className={`text-[12px] ${on ? 'text-neutral-50' : 'text-neutral-300'}`}>{m.name} <span className="text-[10px] text-neutral-500">· {m.lab}</span></span>
                <span className="text-[11px] font-mono text-neutral-300">cache {(rel * 100).toFixed(rel < 0.1 ? 1 : 0)}%</span>
              </div>
              <div className="mt-1 flex gap-[1.5px] h-3">
                {m.layers.map((l, i) => (
                  <motion.div key={i} className="flex-1 rounded-[1px]" style={{ background: LAYER_KIND[l].color }}
                    initial={{ opacity: 0.2 }} animate={{ opacity: on ? 0.95 : 0.55 }} transition={{ duration: 0.3, delay: on ? i * 0.004 : 0 }} />
                ))}
              </div>
              {on && <div className="mt-1 text-[11px] text-neutral-400">{m.note}</div>}
            </button>
          );
        })}
        <Slider label="context length (for the cache column)" value={logT} min={3} max={6} step={0.01} onChange={setLogT} fmt={() => `${fmtTok(T)} tokens`} color="accent-sky-400" />
        <div className="text-[11px] text-neutral-500">"cache" = KV memory relative to the same model with full attention in every layer. Linear/SSM layers count as zero here — their fixed state is negligible at long context.</div>
      </div>

      <Predict question="If linear layers are so cheap, why does every production hybrid still keep ~25% full-attention layers?">
        Information theory. A head's state holds <Eq>{String.raw`d^2`}</Eq> numbers; a 1M-token context holds far more than that. Tasks that need an <em>exact</em> earlier token — copying code, quoting a document, multi-hop look-ups — need something that stores the past verbatim. A few full (or sparse) layers are that verbatim store; the linear layers do everything else at O(1).
      </Predict>

      <div className="rounded-lg border border-amber-400/25 bg-amber-400/[0.04] p-3 space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">the counterexample · MiniMax</div>
        <div className="text-[12.5px] text-neutral-300 leading-snug">
          MiniMax-M1 shipped 7:1 lightning-attention at 456B. Its successor <strong>M2 went back to full attention in all 62 layers</strong>. Their published reasons:
          hybrids matched on small public benchmarks but fell behind on multi-hop reasoning, retrieval and in-context learning at scale (worse beyond 32K after fine-tuning);
          retrieval/induction heads form early and can't all be hand-placed; and the serving stack (low-precision state, prefix caching, speculative decoding) was immature for linear layers.
          Their 2026 follow-up turned to <CrossLink to="c-sparse" recap="Sparse attention keeps the full cache but reads only top-k blocks per query.">sparse</CrossLink> attention rather than linear.
        </div>
      </div>

      <Misconception
        wrong="Hybrid models are a stopgap until linear attention gets good enough to replace softmax everywhere."
        right="The mix itself is the design point: the ratio is tuned like depth or width. Qwen, Moonshot, AI2 and NVIDIA independently converged on a small minority of full layers."
        because="The two layer types fail differently — linear layers can't store the past verbatim, softmax layers are expensive at length. Interleaving gets exact retrieval where needed and O(1) mixing elsewhere." />

      <WhenItMatters>Serving 256K–1M contexts or many concurrent agent sessions: a 3:1 hybrid carries roughly a quarter of the KV cache and far fewer attention FLOPs. For short chats the difference is small — the MoE FFNs dominate cost.</WhenItMatters>

      <Deeper>
        <p>
          <strong>Where to put the full layers.</strong> Most designs interleave them uniformly (every 4th layer), so every depth has access to exact retrieval. NVIDIA's Nemotron hybrids spread a handful of attention layers through a mostly-Mamba stack; IBM's Granite 4.0 runs roughly 9 Mamba-2 layers per attention layer with no positional encoding.
        </p>
        <p>
          <strong>Positional encoding moves too.</strong> Once recurrent layers exist, they already know token order. Kimi Linear drops RoPE from its MLA layers entirely (<CrossLink to="c-kda" recap="KDA: per-channel decay gates act as a learned positional signal.">KDA</CrossLink> carries position), which also removes RoPE-scaling headaches when extending context.
        </p>
      </Deeper>

      <QA items={[
        { q: 'A 60-layer 3:1 hybrid at 256K context: roughly what share of an all-full model\'s KV cache does it keep?', a: '15 of 60 layers keep a per-token cache → about 25%. The 45 GDN layers each keep a fixed state that doesn\'t grow.' },
        { q: 'Name two non-quality reasons MiniMax gave for leaving linear attention.', a: 'Linear/compressed states are sensitive to low-precision numerics, and serving features like prefix caching and speculative decoding were not mature for them.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 10 — Gated attention and the attention sink
// ============================================================================

const GatedAttn = () => {
  const [gated, setGated] = useState(false);
  const [idle, setIdle] = useState(0.5);
  const N = 14;
  const data = useMemo(() => {
    const rng = mulberry32(99);
    return Array.from({ length: N }, (_, i) => {
      // does this query have anything relevant to look up? (deterministic per row)
      const r = rng();
      const target = i > 1 ? 1 + Math.floor(rng() * i) : 0;
      return { r, target, noise: Array.from({ length: N }, () => rng()) };
    });
  }, []);
  const rows = data.map((d, i) => {
    const hasTarget = i > 1 && d.r > idle;
    const logits = Array.from({ length: N }, (_, j) => {
      if (j > i) return -Infinity;
      let l = d.noise[j] * 0.8;
      if (hasTarget && j === d.target) l += 4;
      // without a gate, idle queries learn to dump mass on token 0 (the sink)
      if (!gated && !hasTarget && j === 0) l += 4.5;
      if (!gated && j === 0) l += 1.2;
      return l;
    });
    const mx = Math.max(...logits.filter(isFinite));
    const ex = logits.map(l => (isFinite(l) ? Math.exp(l - mx) : 0));
    const Z = ex.reduce((a, b) => a + b, 0);
    const gate = gated ? (hasTarget ? 0.92 : 0.06) : 1;
    return { p: ex.map(e => e / Z), hasTarget, gate };
  });
  const sinkMass = meanOf(rows.slice(1).map(r => r.p[0]));
  const cell = 17, L = 8, Tp = 18;
  const W = L + N * cell + 82, H = Tp + N * cell + 8;
  return (
    <Card id="c-gate" icon={Eye} title="Gated attention and the end of the attention sink" subtitle="Multiply each head's output by a sigmoid gate — heads can finally say 'nothing here'" accent="orange" index={10} source="Qiu et al. (Qwen) · NeurIPS 2025 best paper · Qwen3-Next/3.5/3.8 · Kimi K3">
      <MinSchema>
        Softmax weights must sum to 1, so a head with nothing to look up still has to attend <em>somewhere</em> — it learns to park that mass on token 0 (the <Term>attention sink</Term>).
        A per-head sigmoid gate on the output, <Eq>{String.raw`Y = \mathrm{SDPA}(Q,K,V)\odot\gr{\sigma(XW_g)}`}</Eq>, lets the head switch itself off instead.
      </MinSchema>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4 items-start">
        <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-3 space-y-2">
          <Tabs options={[{ key: 'plain', label: 'standard attention' }, { key: 'gated', label: 'gated attention' }]} value={gated ? 'gated' : 'plain'} onChange={(k) => setGated(k === 'gated')} color="orange" />
          <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[300px] max-w-[380px] mx-auto block">
            <text x={L} y={12} fontSize={10} fill="#a3a3a3">keys → (token 0 at left)</text>
            <text x={L + N * cell + 8} y={12} fontSize={10} fill="#86efac">gate</text>
            {rows.map((r, i) => (
              <g key={i}>
                {r.p.map((p, j) => (
                  <rect key={j} x={L + j * cell} y={Tp + i * cell} width={cell - 2} height={cell - 2} rx={2}
                    fill={j > i ? '#ffffff' : j === 0 && !gated ? '#e879f9' : '#fb923c'} fillOpacity={j > i ? 0.02 : 0.06 + 0.9 * p} />
                ))}
                <rect x={L + N * cell + 8} y={Tp + i * cell + 3} width={44 * r.gate} height={cell - 8} rx={2} fill="#4ade80" fillOpacity={gated ? 0.8 : 0.25} />
                {!r.hasTarget && i > 0 && <text x={L + N * cell + 56} y={Tp + i * cell + 12} fontSize={9} fill="#a3a3a3">idle</text>}
              </g>
            ))}
          </svg></ChartBox>
          <Slider label="share of queries with nothing to look up" value={idle} min={0} max={1} step={0.05} onChange={setIdle} fmt={v => `${Math.round(v * 100)}%`} color="accent-orange-400" />
          <div className="text-[10px] text-neutral-500">illustrative head · rows are queries · pink = mass parked on token 0</div>
        </div>
        <div className="space-y-2">
          <Stat label="avg. attention on token 0" value={`${Math.round(sinkMass * 100)}%`} color={sinkMass > 0.3 ? 'text-fuchsia-300' : 'text-emerald-300'} sub={gated ? 'no sink needed — the gate zeroes idle outputs' : 'the sink: a real token hijacked as a trash can'} />
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[12.5px] text-neutral-300 leading-snug space-y-1.5">
            <div><span className="text-emerald-300">What the gate buys</span> (per the paper's 15B MoE / 1.7B dense ablations):</div>
            <ul className="list-disc pl-4 space-y-0.5 text-neutral-400">
              <li>attention sinks and "massive activations" disappear</li>
              <li>training tolerates larger learning rates with fewer loss spikes</li>
              <li>better long-context extrapolation</li>
              <li>non-linearity between the low-rank <Eq>{String.raw`W_V W_O`}</Eq> maps</li>
            </ul>
          </div>
        </div>
      </div>

      <Block>{String.raw`o_{t,h} = \Big(\sum_{s\le t}\mathrm{softmax}_s\big(\tfrac{q_{t,h}^{\top}k_{s,h}}{\sqrt{d}}\big)\,v_{s,h}\Big)\odot \gr{\sigma\!\big(x_t W_{g,h}\big)},\qquad y_t = W_O\,[o_{t,1};\dots;o_{t,H}]`}</Block>

      <Misconception
        wrong="Attention sinks are harmless quirks — the model works fine with them."
        right="They cost real things: huge activations on the sink token break low-precision (FP8/FP4) quantization, and windowed caches that evict token 0 collapse."
        because="Sinks exist because softmax can't output zero. Gated attention (Qwen) and gpt-oss's learned sink logit are two cures; both let a head legitimately do nothing." />

      <WhenItMatters>Anyone quantizing or serving with windowed caches, and anyone reading architecture diagrams: "gated attention" in Qwen3-Next/3.5/3.8 and "gated MLA" in Kimi K3 are this one sigmoid.</WhenItMatters>

      <Deeper>
        <p>
          <strong>Where exactly the gate goes.</strong> The paper tried gating at many positions (after Q, K, V, after the output projection…). The winner is element-wise (or head-wise) gating right after scaled-dot-product attention, before <Eq>{String.raw`W_O`}</Eq>, with the gate computed from the layer input <Eq>x_t</Eq> — i.e. query-dependent. It adds ~1–2% parameters per attention layer.
        </p>
        <p>
          <strong>Same trick, other layers.</strong> The GDN layer ends in <Eq>{String.raw`\mathrm{RMSNorm}(o_t)\odot\mathrm{SiLU}(W_g x_t)`}</Eq> — an output gate of the same family. And the LSTM had output gates in 1997: modern architectures keep rediscovering that multiplicative gates are cheap and stabilizing.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why can\'t a standard softmax head output exactly zero?', a: 'Its output is a convex combination of value vectors — weights are positive and sum to 1. The best it can do is attend to a token with a near-zero value vector, which is what the sink becomes.' },
        { q: 'How does the gate help FP8/FP4 quantization?', a: 'Without sinks there are no giant "massive activations" on a few tokens, so tensors have a narrower dynamic range and quantize with less error.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 11 — Fine-grained MoE
// ============================================================================

// total / active in billions; experts = routed, k = active routed, sh = shared; rep = reported via secondary sources
const MOE_MODELS = [
  { n: 'DeepSeek-V3', lab: 'DeepSeek', d: 'Dec 2024', t: 671, a: 37, experts: 256, k: 8, sh: 1 },
  { n: 'Qwen3-235B-A22B', lab: 'Qwen', d: 'Apr 2025', t: 235, a: 22, experts: 128, k: 8, sh: 0 },
  { n: 'Llama 4 Maverick', lab: 'Meta', d: 'Apr 2025', t: 400, a: 17, experts: 128, k: 1, sh: 1 },
  { n: 'Kimi K2', lab: 'Moonshot', d: 'Jul 2025', t: 1000, a: 32, experts: 384, k: 8, sh: 1 },
  { n: 'GLM-4.5', lab: 'Z.ai', d: 'Jul 2025', t: 355, a: 32, experts: 160, k: 8, sh: 1 },
  { n: 'gpt-oss-120b', lab: 'OpenAI', d: 'Aug 2025', t: 117, a: 5.1, experts: 128, k: 4, sh: 0 },
  { n: 'Qwen3-Next-80B', lab: 'Qwen', d: 'Sep 2025', t: 80, a: 3, experts: 512, k: 10, sh: 1 },
  { n: 'MiniMax-M2', lab: 'MiniMax', d: 'Oct 2025', t: 230, a: 10, experts: 256, k: 8, sh: 0 },
  { n: 'Nemotron 3 Nano', lab: 'NVIDIA', d: 'Dec 2025', t: 30, a: 3, experts: 128, k: 6, sh: 2, rep: true },
  { n: 'GLM-5', lab: 'Z.ai', d: 'Feb 2026', t: 744, a: 40, experts: 256, k: 8, sh: 1, rep: true },
  { n: 'Qwen3.5-397B', lab: 'Qwen', d: 'Feb 2026', t: 397, a: 17, experts: 512, k: 10, sh: 1, rep: true },
  { n: 'DeepSeek-V4-Pro', lab: 'DeepSeek', d: 'Apr 2026', t: 1600, a: 49, rep: true },
  { n: 'DeepSeek-V4-Flash', lab: 'DeepSeek', d: 'Apr 2026', t: 284, a: 13, experts: 256, k: 6, sh: 1, rep: true },
  { n: 'Kimi K3', lab: 'Moonshot', d: '2026', t: 2800, a: 104, experts: 896, k: 16, sh: 2 },
  { n: 'Qwen3.8-2.4T', lab: 'Qwen', d: 'Aug 2026', t: 2400, a: 95, experts: 512, k: 10, sh: 1, rep: true },
];

const MoEScatter = ({ selected, onSelect }) => {
  const [hover, setHover] = useState(null);
  const W = 520, H = 300, L = 46, R = 16, Tp = 14, Bm = 40;
  const lx = (t) => L + ((Math.log10(t) - 1) / (Math.log10(4000) - 1)) * (W - L - R); // 10B..4T
  const ly = (a) => Tp + (1 - (Math.log10(a) - 0) / (Math.log10(200) - 0)) * (H - Tp - Bm); // 1B..200B
  const ratios = [{ r: 1 / 5, l: '20% active' }, { r: 1 / 20, l: '5%' }, { r: 1 / 50, l: '2%' }];
  // label placement: [dx, dy, anchor] — hand-tuned so neighbours don't collide (detector 1)
  const labelled = {
    'DeepSeek-V3': [-9, -7, 'end'], 'Kimi K2': [0, 17, 'middle'], 'Kimi K3': [-9, -8, 'end'], 'Qwen3.8-2.4T': [-9, 5, 'end'],
    'gpt-oss-120b': [9, 4, 'start'], 'Qwen3-Next-80B': [9, 4, 'start'], 'MiniMax-M2': [9, 4, 'start'],
    'Nemotron 3 Nano': [9, -10, 'start'], 'DeepSeek-V4-Pro': [0, -11, 'middle'],
  };
  return (
    <>
      <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
        {[10, 100, 1000].map(t => (
          <g key={t}>
            <line x1={lx(t)} x2={lx(t)} y1={Tp} y2={H - Bm} stroke="#fff" strokeOpacity={0.06} />
            <text x={lx(t)} y={H - Bm + 15} fontSize={11} fill="#a3a3a3" textAnchor="middle">{t >= 1000 ? `${t / 1000}T` : `${t}B`}</text>
          </g>
        ))}
        {[1, 10, 100].map(a => (
          <g key={a}>
            <line x1={L} x2={W - R} y1={ly(a)} y2={ly(a)} stroke="#fff" strokeOpacity={0.06} />
            <text x={L - 6} y={ly(a) + 4} fontSize={11} fill="#a3a3a3" textAnchor="end">{a}B</text>
          </g>
        ))}
        {ratios.map(({ r, l }) => {
          const t0 = 10, t1 = 4000;
          const p0 = [lx(t0), ly(Math.max(1, t0 * r))], p1 = [lx(t1), ly(Math.min(200, t1 * r))];
          const tStart = Math.max(t0, 1 / r);
          return (
            <g key={l}>
              <line x1={lx(tStart)} y1={ly(tStart * r)} x2={p1[0]} y2={p1[1]} stroke="#c4b5fd" strokeOpacity={0.25} strokeDasharray="4 4" />
              <text x={lx(tStart) + 4} y={ly(tStart * r) - 4} fontSize={10} fill="#a78bfa">{l}</text>
            </g>
          );
        })}
        <text x={(L + W - R) / 2} y={H - 6} fontSize={11} fill="#a3a3a3" textAnchor="middle">total parameters (log)</text>
        <text x={12} y={(Tp + H - Bm) / 2} fontSize={11} fill="#a3a3a3" textAnchor="middle" transform={`rotate(-90 12 ${(Tp + H - Bm) / 2})`}>active per token (log)</text>
        {MOE_MODELS.map(m => {
          const on = selected === m.n;
          return (
            <g key={m.n} onClick={() => onSelect(m.n)} style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => setHover({ m, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ m, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}>
              <circle cx={lx(m.t)} cy={ly(m.a)} r={on ? 7 : 5} fill="#8b5cf6" fillOpacity={on ? 1 : 0.7} stroke={on ? '#f5f3ff' : '#c4b5fd'} strokeWidth={on ? 2 : 1} />
              {(labelled[m.n] || on) && (() => {
                const [dx, dy, anchor] = labelled[m.n] || (m.t > 1500 ? [-9, 4, 'end'] : [9, 4, 'start']);
                return <text x={lx(m.t) + dx} y={ly(m.a) + dy} fontSize={10.5} fill={on ? '#f5f3ff' : '#ddd6fe'} textAnchor={anchor}>{m.n}</text>;
              })()}
            </g>
          );
        })}
      </svg></ChartBox>
      <FloatingTip hover={hover} width={260} render={({ m }) => (
        <div className="space-y-0.5">
          <div className="text-violet-200 font-medium">{m.n} <span className="text-neutral-500 text-[10px]">· {m.lab} · {m.d}</span></div>
          <div className="font-mono text-neutral-200">{m.t >= 1000 ? `${m.t / 1000}T` : `${m.t}B`} total · {m.a}B active · {((m.a / m.t) * 100).toFixed(1)}%</div>
          {m.experts && <div className="text-neutral-400">{m.experts} routed experts, top-{m.k}{m.sh ? ` + ${m.sh} shared` : ''}</div>}
          {m.rep && <div className="text-[10px] text-amber-300/80">config as reported; spot-check the model card</div>}
        </div>
      )} />
    </>
  );
};

const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
const fmtBig = (x) => (x >= 1e12 ? `${(x / 1e12).toFixed(1)} trillion` : x >= 1e9 ? `${(x / 1e9).toFixed(1)} billion` : x >= 1e6 ? `${(x / 1e6).toFixed(1)} million` : fmtNum(Math.round(x)));

const MoE = () => {
  const [selected, setSelected] = useState('Kimi K2');
  const [split, setSplit] = useState(4);
  const m = MOE_MODELS.find(x => x.n === selected);
  const baseN = 16, baseK = 2;
  const N = baseN * split, K = baseK * split;
  return (
    <Card id="c-moe" icon={Boxes} title="Fine-grained MoE: 1T parameters, 32B per token" subtitle="Knowledge scales with total parameters; cost scales with active ones" accent="violet" index={11} source="DeepSeekMoE (2024) · every flagship since">
      <MinSchema>
        Replace each FFN with hundreds of small experts plus one always-on <Term>shared expert</Term>; a <Term>router</Term> sends each token to its top-<Eq>k</Eq>. Open flagships now
        run <strong>~3–5% of their weights per token</strong> — Kimi K2 touches 32B of 1T.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">total vs active parameters · open MoE models 2024–26</div>
          <div className="text-[10px] text-neutral-500">hover or click a dot</div>
        </div>
        <MoEScatter selected={selected} onSelect={setSelected} />
        {m && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label={m.n} value={`${((m.a / m.t) * 100).toFixed(1)}%`} sub="of weights used per token" color="text-violet-300" />
            <Stat label="experts" value={m.experts ? `${m.k}/${m.experts}` : '—'} sub={m.sh ? `routed, + ${m.sh} shared` : 'routed'} color="text-violet-300" />
            <Stat label="BF16 weights" value={fmtBytes(m.t * 2e9)} sub="must all sit in memory" color="text-rose-300" />
            <Stat label="compute like a" value={`${m.a}B`} sub="dense model, per token" color="text-emerald-300" />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400">fine-graining · same compute, many more expert combinations</div>
        <div className="flex flex-wrap gap-[3px]">
          {Array.from({ length: N }, (_, i) => {
            const on = (i * 7 + 3) % N < K;
            return <div key={`${split}-${i}`} className="rounded-sm" style={{ width: Math.max(6, 64 / split), height: 18, background: on ? '#8b5cf6' : '#ffffff10', opacity: on ? 0.9 : 1 }} />;
          })}
        </div>
        <Slider label="split each of 16 experts into m smaller ones (k scales with m)" value={split} min={1} max={16} onChange={setSplit} fmt={v => `m = ${v}`} color="accent-violet-400" />
        <div className="grid grid-cols-3 gap-2">
          <Stat label="experts" value={`${N}`} sub={`each 1/${split} the size`} color="text-violet-300" />
          <Stat label="active per token" value={`${K}`} sub="same FLOPs as top-2 of 16" />
          <Stat label="possible combinations" value={fmtBig(choose(N, K))} sub={`C(${N}, ${K}) vs C(16, 2) = 120`} color="text-emerald-300" />
        </div>
      </div>

      <Worked title="worked example · Kimi K2's sparsity">
        <Block>{String.raw`\frac{\text{active}}{\text{total}} = \frac{\num{32}\text{B}}{\num{1000}\text{B}} = \mo{3.2\%}\qquad \text{experts: } \tfrac{\num{8}+\num{1}}{\num{384}+\num{1}}\ \text{per MoE layer}`}</Block>
        <div>Per token it computes like a 32B dense model <Grounding>4× a Llama-3-8B forward pass</Grounding> — but it must hold 1T weights (<span className="font-mono">~2 TB</span> in BF16) somewhere. MoE trades memory for compute.</div>
      </Worked>

      <Misconception
        wrong="Experts specialize by topic — a math expert, a French expert, a code expert."
        right="Routing mostly specializes on token-level and syntactic patterns (punctuation, word pieces, positions in a phrase); topic structure is weak and distributed."
        because="The router decides per token, per layer, from the hidden state. Nothing in the loss asks for human-legible topics — fine-grained experts make this even more true." />

      <WhenItMatters>Picking hardware: MoE is great when you serve many users on a multi-GPU node (compute per token is small, weights amortize), and awkward on one consumer GPU (you still need every expert in memory — hence MXFP4 checkpoints like gpt-oss).</WhenItMatters>

      <Deeper>
        <p>
          <strong>DeepSeekMoE's two moves.</strong> (1) <em>Fine-grained segmentation</em>: split experts <Eq>m</Eq> ways and activate <Eq>mk</Eq> — same FLOPs, far more combinations, so each token gets a more tailored mixture. (2) <em>Shared expert isolation</em>: a few always-on experts absorb common knowledge, so routed experts don't all redundantly relearn it.
        </p>
        <p>
          <strong>Router details.</strong> DeepSeek-V3 scores experts with a sigmoid, <Eq>{String.raw`s_{i}=\sigma(u^\top e_i)`}</Eq>, and normalizes the gate weights among the selected top-<Eq>k</Eq> only. Variants since: LongCat-Flash adds "zero-computation" identity experts so easy tokens use fewer FLOPs (18.6–31.3B active); NVIDIA's LatentMoE routes and computes experts in a compressed latent space to afford more of them.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Two 1T-parameter models: one dense, one MoE with 32B active. Which needs more GPU memory for weights? Which is faster per token?', a: 'Same memory (both hold 1T parameters). The MoE is ~30× cheaper in FLOPs per token and much faster to decode.' },
        { q: 'Why does fine-graining (more, smaller experts) help at the same compute?', a: 'More possible combinations of experts per token — C(64,8) ≈ 4.4 billion vs C(16,2) = 120 — so each token can be served by a more specific mixture of knowledge.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 12 — Load balancing without the auxiliary loss
// ============================================================================

const NB_E = 16, NB_K = 2, NB_TOK = 256;
const Balance = () => {
  const [ref, enterKey] = useEnterKey();
  const [method, setMethod] = useState('bias');
  const [gamma, setGamma] = useState(0.02);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [state, setState] = useState(() => ({ step: 0, bias: new Array(NB_E).fill(0), load: new Array(NB_E).fill(0), hist: [] }));
  const pop = useMemo(() => { const r = mulberry32(5); return Array.from({ length: NB_E }, (_, i) => 1.2 * Math.exp(-i / 4) + 0.2 * gauss(r)); }, []);
  const reset = () => setState({ step: 0, bias: new Array(NB_E).fill(0), load: new Array(NB_E).fill(0), hist: [] });
  useEffect(() => { reset(); setPlaying(true); }, [enterKey, method]); // eslint-disable-line react-hooks/exhaustive-deps
  const acc = useRef(0);
  useTicker(playing, (dt) => {
    acc.current += dt * 8 * speed;
    if (acc.current < 1) return;
    acc.current = 0;
    setState(s => {
      if (s.step >= 120) return s;
      const rng = mulberry32(1000 + s.step);
      const load = new Array(NB_E).fill(0);
      for (let t = 0; t < NB_TOK; t++) {
        const sc = pop.map((p, j) => p + 0.9 * gauss(rng) + (method === 'bias' ? s.bias[j] : 0));
        const top = sc.map((v, j) => [v, j]).sort((a, b) => b[0] - a[0]).slice(0, NB_K);
        top.forEach(([, j]) => { load[j] += 1; });
      }
      const mean = (NB_TOK * NB_K) / NB_E;
      const bias = method === 'bias' ? s.bias.map((b, j) => b + gamma * Math.sign(mean - load[j])) : s.bias;
      const imb = Math.max(...load) / mean;
      return { step: s.step + 1, bias, load, hist: [...s.hist, imb] };
    });
  });
  useEffect(() => { if (state.step >= 120) setPlaying(false); }, [state.step]);
  const mean = (NB_TOK * NB_K) / NB_E;
  const maxLoad = Math.max(mean * 4, ...state.load);
  const W = 460, H = 120, L = 34, R = 10, Tp = 10, Bm = 22;
  const hx = (i) => L + (i / 120) * (W - L - R);
  const hy = (v) => Tp + (1 - clamp((v - 1) / 5, 0, 1)) * (H - Tp - Bm);
  return (
    <Card id="c-balance" icon={Scale} title="Load balancing without the auxiliary loss" subtitle="Nudge a per-expert bias instead of fighting the language-model loss" accent="violet" index={12} source="DeepSeek-V3 (2024) · adopted widely since">
      <MinSchema>
        Left alone, routers collapse onto a few favorite experts (idle GPUs, dropped tokens). DeepSeek-V3's fix: add a bias <Eq>{String.raw`b_i`}</Eq> to each expert's score <em>for selection only</em>,
        and after every step raise it for under-loaded experts and lower it for overloaded ones. No gradient, no loss term to trade off.
      </MinSchema>

      <Block>{String.raw`\text{select: } \operatorname{top\text{-}k}_i\,\big(s_{t,i} + \mo{b_i}\big)\qquad \text{weight: } g_{t,i}=\frac{s_{t,i}}{\sum_{j\in\text{top-}k} s_{t,j}}\qquad \mo{b_i} \leftarrow \mo{b_i} + \gamma\,\operatorname{sign}\big(\bar{c} - c_i\big)`}</Block>

      <div ref={ref} className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs options={[{ key: 'none', label: 'no balancing' }, { key: 'bias', label: 'bias update (aux-loss-free)' }]} value={method} onChange={setMethod} color="violet" />
          <PlayControls playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed} onReset={() => { reset(); setPlaying(true); }} />
        </div>
        <div className="text-[11px] text-neutral-400">16 experts · top-2 · 256 tokens per step · step <span className="font-mono text-neutral-100">{state.step}</span>/120 · experts sorted by innate popularity</div>
        <div className="flex items-end gap-1 h-28 relative">
          <div className="absolute left-0 right-0 border-t border-dashed border-emerald-400/50" style={{ bottom: `${(mean / maxLoad) * 100}%` }} />
          {state.load.map((l, j) => (
            <div key={j} className="flex-1 h-full flex items-end">
              <motion.div className="w-full rounded-t-sm" style={{ background: l > mean * 1.5 ? '#fb7185' : '#8b5cf6' }}
                initial={false} animate={{ height: `${(l / maxLoad) * 100}%` }} transition={{ duration: 0.12 }} />
            </div>
          ))}
        </div>
        <div className="text-[10px] text-emerald-300/80">dashed line = perfectly even load ({mean} tokens per expert)</div>
        <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
          <text x={L} y={Tp - 1} fontSize={10} fill="#a3a3a3">busiest expert ÷ average load</text>
          {[1, 2, 4, 6].map(v => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={hy(v)} y2={hy(v)} stroke="#fff" strokeOpacity={0.07} />
              <text x={L - 5} y={hy(v) + 4} fontSize={10} fill="#a3a3a3" textAnchor="end">{v}×</text>
            </g>
          ))}
          {state.hist.length > 1 && <path d={'M' + state.hist.map((v, i) => `${hx(i).toFixed(1)},${hy(v).toFixed(1)}`).join('L')} fill="none" stroke={method === 'bias' ? '#a78bfa' : '#fb7185'} strokeWidth={2} />}
          <text x={W - R} y={H - 6} fontSize={10} fill="#a3a3a3" textAnchor="end">training steps →</text>
        </svg></ChartBox>
        <Slider label="bias update speed γ" value={gamma} min={0.005} max={0.08} step={0.005} onChange={setGamma} fmt={v => v.toFixed(3)} color="accent-violet-400" />
      </div>

      <Predict question="The classic fix is an auxiliary loss that penalizes uneven routing. Why might a bias that bypasses the gradient work better?">
        The auxiliary loss's gradient flows into the router and the hidden states, pulling them toward "be balanced" and away from "predict the next token well" — a tuning trade-off (too weak: collapse; too strong: worse model). The bias only changes <em>which</em> experts are chosen, never the gate weights or the LM gradient, so balance comes almost for free. DeepSeek-V3 kept only a tiny sequence-level auxiliary term as a safety net.
      </Predict>

      <Misconception
        wrong="Perfect balance is the goal."
        right="Balance is an infrastructure constraint, not a quality objective. You want 'balanced enough' that no GPU becomes the straggler — without forcing tokens onto experts that don't suit them."
        because="In expert parallelism every expert lives on some GPU; the step waits for the busiest one. Mild imbalance is fine; 4× imbalance means 75% of the cluster idles." />

      <WhenItMatters>Training or fine-tuning MoE models at scale — and debugging "why is my MoE fine-tune slow": check per-expert load before blaming kernels.</WhenItMatters>

      <QA items={[
        { q: 'Does the bias b_i change the output mixture for a token?', a: 'No — it only affects which experts make the top-k. The gate weights use the raw scores s_{t,i}, so the model\'s function is not distorted by the balancing term.' },
        { q: 'What happens in the simulation if γ is too large?', a: 'Biases overshoot: popular experts get pushed below average, then back up — the imbalance line oscillates instead of settling. Too small and it converges slowly.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 13 — Training tricks: Muon/MuonClip · FP8/MXFP4 · MTP
// ============================================================================

// Muon's quintic Newton–Schulz coefficients (Keller Jordan's reference implementation).
const NS = [3.4445, -4.7750, 2.0315];
const nsStep = (x) => NS[0] * x + NS[1] * x ** 3 + NS[2] * x ** 5;
const FP4_GRID = [0, 0.5, 1, 1.5, 2, 3, 4, 6];
const toFP4 = (x) => { const a = Math.abs(x); let best = 0; for (const g of FP4_GRID) if (Math.abs(g - a) < Math.abs(best - a)) best = g; return Math.sign(x) * best; };
const quantize = (xs, block) => {
  const out = new Array(xs.length);
  for (let s = 0; s < xs.length; s += block) {
    const chunk = xs.slice(s, s + block);
    const mx = Math.max(...chunk.map(Math.abs)) || 1;
    const scale = 2 ** Math.ceil(Math.log2(mx / 6)); // power-of-two (E8M0) scale, as in MXFP4
    chunk.forEach((x, i) => { out[s + i] = toFP4(x / scale) * scale; });
  }
  return out;
};

const MuonPanel = () => {
  const [iters, setIters] = useState(0);
  const sv0 = useMemo(() => {
    const raw = Array.from({ length: 16 }, (_, i) => 1 / (i + 1) ** 1.3);
    const fro = Math.hypot(...raw);
    return raw.map(x => x / fro);
  }, []);
  const sv = sv0.map(x => { let y = x; for (let i = 0; i < iters; i++) y = nsStep(y); return y; });
  const mx = 1.3;
  return (
    <div className="space-y-3">
      <p className="text-[14px]">
        AdamW scales each weight's step separately. <Term>Muon</Term> treats a weight matrix as a matrix: it takes the momentum <Eq>M</Eq> and replaces it with the nearest
        orthogonal matrix <Eq>{String.raw`UV^{\top}`}</Eq> (from <Eq>{String.raw`M=U\Sigma V^{\top}`}</Eq>) — every singular direction gets the same step size, so rare directions aren't drowned by dominant ones.
        It never computes an SVD: a few Newton–Schulz polynomial iterations push all singular values toward 1.
      </p>
      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400">singular values of the update · after {iters} Newton–Schulz step{iters === 1 ? '' : 's'}</div>
        <div className="flex items-end gap-1 h-28">
          {sv.map((v, i) => (
            <div key={i} className="flex-1 h-full flex items-end">
              <motion.div className="w-full rounded-t-sm bg-emerald-400/80" initial={false} animate={{ height: `${clamp(v / mx, 0, 1) * 100}%` }} transition={{ duration: 0.35 }} />
            </div>
          ))}
        </div>
        <Slider label="Newton–Schulz iterations" value={iters} min={0} max={5} onChange={setIters} color="accent-emerald-400" />
        <div className="text-[11px] text-neutral-400">
          largest/smallest singular value: <span className="font-mono text-emerald-300">{(Math.max(...sv) / Math.max(1e-6, Math.min(...sv))).toFixed(1)}×</span>
          {' '}· Muon uses 5 steps of <Eq>{String.raw`x\mapsto \num{3.4445}x \num{-4.775}x^3 + \num{2.0315}x^5`}</Eq> applied as <Eq>{String.raw`X\mapsto aX+b(XX^\top)X+c(XX^\top)^2X`}</Eq>. The coefficients are tuned for speed, not exactness: values land in a ~0.7–1.2 band rather than exactly 1, which works just as well.
        </div>
      </div>
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3 text-[12.5px] text-neutral-300 leading-snug">
        <span className="text-emerald-300 font-medium">MuonClip (Kimi K2).</span> At trillion scale Muon let attention logits grow until training spiked. QK-Clip caps them: after each step, any head whose largest logit <Eq>{String.raw`S^h_{\max}`}</Eq> exceeds <Eq>\tau</Eq> gets
        <Eq>{String.raw`W_q^h \leftarrow W_q^h\sqrt{\tau/S^h_{\max}},\ W_k^h \leftarrow W_k^h\sqrt{\tau/S^h_{\max}}`}</Eq>. Kimi K2 pre-trained on 15.5T tokens with zero loss spikes. Muon or a variant now trains Kimi K2/K3, GLM-4.5, DeepSeek-V4 and Qwen3.8-Flash-Next.
      </div>
    </div>
  );
};

const PrecisionPanel = () => {
  const [outlier, setOutlier] = useState(20);
  const xs = useMemo(() => { const r = mulberry32(11); return Array.from({ length: 128 }, () => gauss(r)); }, []);
  const vals = xs.map((x, i) => (i === 37 ? outlier : x));
  const err = (q) => Math.sqrt(meanOf(vals.map((v, i) => (i === 37 ? 0 : (v - q[i]) ** 2)))) / Math.sqrt(meanOf(vals.map((v, i) => (i === 37 ? 0 : v * v))));
  const zeros = (q) => q.filter((v, i) => i !== 37 && v === 0).length / 127;
  const schemes = [
    { l: 'per-tensor scale', q: quantize(vals, 128), c: 'text-rose-300' },
    { l: 'per-block of 32 (MXFP4)', q: quantize(vals, 32), c: 'text-amber-300' },
    { l: 'per-block of 16 (NVFP4-style)', q: quantize(vals, 16), c: 'text-emerald-300' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[14px]">
        Fewer bits per number = more math per second and fewer bytes to move. DeepSeek-V3 trained mostly in <Term>FP8</Term> with fine-grained (tile/block) scaling; gpt-oss ships its experts in <Term>MXFP4</Term> so the 120B model fits one 80 GB GPU; Kimi K3 trains with MXFP4 weights (quantization-aware) and NVIDIA pre-trains Nemotron 3 in NVFP4.
        FP4 (E2M1) has only 8 magnitudes — <span className="font-mono">0, 0.5, 1, 1.5, 2, 3, 4, 6</span> — so the trick is the <em>scale</em>: one outlier ruins a shared scale.
      </p>
      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400">quantize 128 Gaussian activations + one outlier to FP4</div>
        <Slider label="outlier magnitude (× a typical value)" value={outlier} min={1} max={200} onChange={setOutlier} fmt={v => `${v}×`} color="accent-emerald-400" />
        {schemes.map(s => {
          const e = err(s.q), z = zeros(s.q);
          return (
            <div key={s.l} className="flex items-center gap-3 text-[12px]">
              <div className={`w-44 shrink-0 ${s.c}`}>{s.l}</div>
              <div className="flex-1 h-3 rounded bg-white/[0.05] overflow-hidden">
                <motion.div className="h-full bg-rose-400/70" initial={false} animate={{ width: `${clamp(e, 0, 1) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
              <div className="w-40 shrink-0 text-right font-mono text-neutral-300 text-[11px]">err {(e * 100).toFixed(0)}% · {(z * 100).toFixed(0)}% → 0</div>
            </div>
          );
        })}
        <div className="text-[11px] text-neutral-400">Small blocks confine the outlier's damage to its own 16–32 neighbours. This is also why <CrossLink to="c-gate" recap="Gated attention removes attention sinks and the 'massive activations' that come with them.">removing massive activations</CrossLink> matters for low-precision training.</div>
      </div>
    </div>
  );
};

const MTPPanel = () => {
  const [p, setP] = useState(0.85);
  const [n, setN] = useState(1);
  const expected = (1 - p ** (n + 1)) / (1 - p);
  return (
    <div className="space-y-3">
      <p className="text-[14px]">
        <Term>MTP</Term> adds small modules that predict token <Eq>t+2</Eq> (and beyond) from the main model's hidden state. In training it densifies the signal ("plan a bit ahead");
        at inference the same modules become a free draft model for <Term>speculative decoding</Term>. DeepSeek-V3 reported 85–90% acceptance for its one extra token, ≈1.8× decode speed; Qwen3-Next and GLM-4.5+ ship MTP layers too.
      </p>
      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-2">
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider label="acceptance rate per drafted token" value={p} min={0.3} max={0.98} step={0.01} onChange={setP} fmt={v => `${Math.round(v * 100)}%`} color="accent-emerald-400" />
          <Slider label="tokens drafted per step" value={n} min={1} max={6} onChange={setN} color="accent-emerald-400" />
        </div>
        <Block>{String.raw`\mathbb{E}[\text{tokens per big-model step}] = \sum_{i=0}^{n} p^{i} = \frac{1-p^{\,n+1}}{1-p} = \frac{1-\num{${p.toFixed(2)}}^{${n + 1}}}{1-\num{${p.toFixed(2)}}} = \gr{${expected.toFixed(2)}}`}</Block>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: n + 1 }, (_, i) => (
            <div key={i} className="rounded px-2 py-1 text-[11px] font-mono border border-emerald-400/30" style={{ background: `rgba(52,211,153,${0.08 + 0.5 * p ** i})` }}>
              {i === 0 ? 'verified' : `draft ${i}: ${Math.round(p ** i * 100)}%`}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-neutral-400">The first token is always produced by the big model; each drafted token survives only if all earlier drafts did. Long drafts pay off only when acceptance is high.</div>
      </div>
    </div>
  );
};

const Train = () => {
  const [tab, setTab] = useState('muon');
  return (
    <Card id="c-train" icon={Rocket} title="Training tricks: Muon, FP8/MXFP4, multi-token prediction" subtitle="Bill ③ — the cost of learning — attacked from three sides" accent="emerald" index={13} source="Moonshot · DeepSeek · OpenAI · NVIDIA">
      <MinSchema>
        Three independent levers: a better <em>direction</em> per step (Muon orthogonalizes updates — about 2× token-efficiency vs AdamW in Moonshot's tests), cheaper <em>arithmetic</em> per step
        (8- and 4-bit formats with block scales), and more <em>signal</em> per token (predict several tokens ahead — which later doubles as speculative decoding).
      </MinSchema>
      <Tabs options={[{ key: 'muon', label: 'Muon & MuonClip' }, { key: 'prec', label: 'FP8 · MXFP4' }, { key: 'mtp', label: 'Multi-token prediction' }]} value={tab} onChange={setTab} color="emerald" />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'muon' && <MuonPanel />}
          {tab === 'prec' && <PrecisionPanel />}
          {tab === 'mtp' && <MTPPanel />}
        </motion.div>
      </AnimatePresence>

      <Misconception
        wrong="Low-precision training is just 'use smaller numbers' — a free 2× once the hardware supports it."
        right="The format is the easy part; the scaling scheme is the hard part. FP8/FP4 training works only with fine-grained block scales, high-precision accumulation, and care for outliers."
        because="A handful of huge values (sink tokens, massive activations, spiky gradients) otherwise set the scale for everything else, and most numbers round to zero — as the FP8 · MXFP4 tab shows." />

      <WhenItMatters>Bill ③ is paid once but decides who can afford to train at all: DeepSeek-V3's full run was 2.788M H800 GPU-hours (≈ $5.6M at $2/hr) thanks to FP8 + MoE + MTP.</WhenItMatters>

      <QA items={[
        { q: 'Why does Muon apply only to 2-D hidden weight matrices, not embeddings or norms?', a: 'Orthogonalization is a matrix operation — it needs a matrix. Embeddings, output heads, biases and norm gains are still trained with AdamW in Muon setups.' },
        { q: 'With 90% acceptance, what does drafting 3 tokens buy vs 1?', a: '(1−0.9⁴)/(1−0.9) ≈ 3.44 tokens per step vs 1.9 — worth it only if the drafts are cheap, which MTP heads are.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 14 — Spec sheets (anchor)
// ============================================================================

const TECHS = [
  { key: 'linear', label: 'linear / SSM hybrid', to: 'c-hybrid' },
  { key: 'mla', label: 'MLA', to: 'c-kv' },
  { key: 'sparse', label: 'sparse attention', to: 'c-sparse' },
  { key: 'swa', label: 'sliding window', to: 'c-window' },
  { key: 'gated', label: 'gated attention', to: 'c-gate' },
  { key: 'moe', label: 'fine-grained MoE', to: 'c-moe' },
  { key: 'muon', label: 'Muon', to: 'c-train' },
  { key: 'lowp', label: 'FP8 / FP4', to: 'c-train' },
  { key: 'mtp', label: 'MTP', to: 'c-train' },
];

const LINEUP = [
  { m: 'DeepSeek-V3', lab: 'DeepSeek', d: 'Dec 2024', p: '671B / 37B', attn: 'MLA, all layers', moe: '256 top-8 + 1 shared', ctx: '128K', t: ['mla', 'moe', 'lowp', 'mtp'], why: 'The template: MLA + fine-grained MoE + aux-loss-free balancing + FP8 training + MTP, at ~$5.6M of GPU time.' },
  { m: 'DeepSeek-V3.2', lab: 'DeepSeek', d: 'Sep–Dec 2025', p: '671B / 37B', attn: 'MLA + DSA (top-2,048)', moe: '256 top-8 + 1 shared', ctx: '128K', t: ['mla', 'sparse', 'moe', 'lowp', 'mtp'], why: 'Same weights shape, but a lightning indexer makes long-context attention cost flat in context length.' },
  { m: 'DeepSeek-V4-Pro', lab: 'DeepSeek', d: 'Apr 2026', p: '1.6T / 49B', attn: 'compressed-sparse (CSA/HCA) + window', moe: 'DeepSeekMoE', ctx: '1M', t: ['sparse', 'swa', 'moe', 'muon', 'lowp', 'mtp'], why: 'Compress the cache and sparsify reads: 10% of V3.2\'s KV and 27% of its FLOPs at 1M context. See the sibling explainer.', rep: true },
  { m: 'Kimi K2', lab: 'Moonshot', d: 'Jul 2025', p: '1T / 32B', attn: 'MLA (64 heads)', moe: '384 top-8 + 1 shared', ctx: '128K', t: ['mla', 'moe', 'muon'], why: 'First open 1T model; MuonClip kept a 15.5T-token run spike-free.' },
  { m: 'Kimi K3', lab: 'Moonshot', d: '2026', p: '2.8T / 104B', attn: '69 KDA + 24 gated MLA', moe: '896 top-16 + 2 shared', ctx: '1M', t: ['linear', 'mla', 'gated', 'moe', 'lowp'], why: 'KDA hybrid at frontier scale, with MXFP4 quantization-aware training and Attention Residuals.' },
  { m: 'Qwen3-Next-80B-A3B', lab: 'Qwen', d: 'Sep 2025', p: '80B / 3B', attn: '3 GDN : 1 gated attn', moe: '512 top-10 + 1 shared', ctx: '262K', t: ['linear', 'gated', 'moe', 'mtp'], why: 'The GDN hybrid prototype: extreme sparsity (3.75% active) plus 3:1 linear layers.' },
  { m: 'Qwen3.5-397B-A17B', lab: 'Qwen', d: 'Feb 2026', p: '397B / 17B', attn: '3 GDN : 1 gated attn', moe: '512 top-10 + 1 shared', ctx: '262K', t: ['linear', 'gated', 'moe'], why: 'Qwen-reported 8.6× (32K) and 19× (256K) faster decoding than Qwen3-Max.', rep: true },
  { m: 'Qwen3.8-2.4T-A95B', lab: 'Qwen', d: 'Aug 2026', p: '2.4T / 95B', attn: '69 GDN + 23 gated attn', moe: '512 top-10 + 1 shared', ctx: '262K', t: ['linear', 'gated', 'moe'], why: 'The GDN hybrid recipe scaled to a Max-class open model.', rep: true },
  { m: 'MiniMax-M2', lab: 'MiniMax', d: 'Oct 2025', p: '230B / 10B', attn: 'full GQA, all 62 layers', moe: '256 top-8', ctx: '196K', t: ['moe'], why: 'The deliberate counterexample: dropped M1\'s linear attention for quality on reasoning and retrieval.' },
  { m: 'MiniMax-M3', lab: 'MiniMax', d: 'Jun 2026', p: '~428B / ~23B', attn: 'GQA + block-sparse (indexer)', moe: 'MoE', ctx: '1M', t: ['sparse', 'moe'], why: 'Came back to efficiency via sparse, not linear, attention.', rep: true },
  { m: 'GLM-5', lab: 'Z.ai', d: 'Feb 2026', p: '744B / 40B', attn: 'MLA + DSA', moe: '256 top-8 + 1 shared', ctx: '200K', t: ['mla', 'sparse', 'moe'], why: 'Adopted DeepSeek\'s sparse attention wholesale; later versions share one indexer across layers.', rep: true },
  { m: 'gpt-oss-120b', lab: 'OpenAI', d: 'Aug 2025', p: '117B / 5.1B', attn: 'alternating 128-window / full, sinks', moe: '128 top-4', ctx: '131K', t: ['swa', 'moe', 'lowp'], why: 'MXFP4 experts so it fits one 80 GB GPU; learned attention-sink logits.' },
  { m: 'Gemma 3 27B', lab: 'Google', d: 'Mar 2025', p: '27B dense', attn: '5 window (1,024) : 1 global', moe: '— (dense)', ctx: '128K', t: ['swa'], why: 'The cleanest demo of local:global interleaving — ~6× less KV at long context.' },
  { m: 'Nemotron 3 Nano', lab: 'NVIDIA', d: 'Dec 2025', p: '30B / ~3B', attn: '23 Mamba-2 + 6 attention', moe: '128 top-6 + 2 shared', ctx: '—', t: ['linear', 'moe'], why: 'Mostly-Mamba hybrid tuned for throughput on NVIDIA hardware.', rep: true },
];

const Lineup = () => {
  const [filter, setFilter] = useState(null);
  const [open, setOpen] = useState('Kimi K3');
  const counts = Object.fromEntries(TECHS.map(t => [t.key, LINEUP.filter(r => r.t.includes(t.key)).length]));
  return (
    <Card id="c-lineup" icon={Table2} title="Spec sheets: the flagship open models, decoded" subtitle="Every row is a combination of the cards above — filter by technique to see who bet on what" accent="fuchsia" index={14} anchor>
      <MinSchema>
        Read any model card as three choices: <span className="text-orange-300">how it remembers</span> (attention scheme), <span className="text-violet-300">how sparse it is</span> (experts, active %), and
        <span className="text-emerald-300"> how it was trained</span> (optimizer, precision). The rest is scale.
      </MinSchema>

      <Predict question="Of the 2026 releases in this table (V4-Pro, K3, Qwen3.5, Qwen3.8, MiniMax-M3, GLM-5), how many use plain full attention in every layer? And what's the highest active-parameter share among them?">
        <strong>None.</strong> Every 2026 flagship here uses linear hybrids, sparse attention, or compressed-sparse attention. And all are extremely sparse MoEs: active share ranges from ~3.1% (V4-Pro) to ~5.4% (GLM-5, M3). The 2023 "dense model with full attention" is gone from the open frontier.
      </Predict>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter(null)} className={`px-2 py-1 rounded-md border text-[11px] ${filter === null ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100' : 'border-white/10 text-neutral-400 hover:text-neutral-100'}`}>all</button>
        {TECHS.map(t => (
          <button key={t.key} onClick={() => setFilter(f => (f === t.key ? null : t.key))}
            className={`px-2 py-1 rounded-md border text-[11px] ${filter === t.key ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100' : 'border-white/10 text-neutral-400 hover:text-neutral-100'}`}>
            {t.label} <span className="font-mono text-neutral-500">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/10">
              <th className="px-3 py-2 font-normal">model</th>
              <th className="px-3 py-2 font-normal">total / active</th>
              <th className="px-3 py-2 font-normal text-orange-300/80">attention</th>
              <th className="px-3 py-2 font-normal text-violet-300/80">experts</th>
              <th className="px-3 py-2 font-normal">context</th>
            </tr>
          </thead>
          <tbody>
            {LINEUP.map(r => {
              const dim = filter && !r.t.includes(filter);
              const isOpen = open === r.m;
              return (
                <React.Fragment key={r.m}>
                  <tr onClick={() => setOpen(o => (o === r.m ? null : r.m))}
                    className={`border-b border-white/5 cursor-pointer transition-opacity ${dim ? 'opacity-25' : 'opacity-100'} ${isOpen ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}`}>
                    <td className="px-3 py-2">
                      <div className="text-neutral-100">{r.m}{r.rep && <span className="ml-1 text-[9px] text-amber-300/80 align-top" title="configuration as reported">†</span>}</div>
                      <div className="text-[10px] text-neutral-500">{r.lab} · {r.d}</div>
                    </td>
                    <td className="px-3 py-2 font-mono text-neutral-200 whitespace-nowrap">{r.p}</td>
                    <td className="px-3 py-2 text-neutral-300">{r.attn}</td>
                    <td className="px-3 py-2 text-neutral-300">{r.moe}</td>
                    <td className="px-3 py-2 font-mono text-neutral-300">{r.ctx}</td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <td colSpan={5} className="px-3 py-2">
                        <div className="text-[12px] text-neutral-300 leading-snug">{r.why}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.t.map(k => { const t = TECHS.find(x => x.key === k); return <CrossLink key={k} to={t.to}>{t.label}</CrossLink>; })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-neutral-500">† configuration taken from lab announcements and third-party summaries of the model card; the others are from the labs' own reports or repositories. Click a row for the one-line "why".</div>

      <WhenItMatters>Choosing an open model to self-host: the attention column predicts long-context memory, the experts column predicts GPU count vs speed, and a † is a cue to read the model card before sizing hardware.</WhenItMatters>

      <QA items={[
        { q: 'Which two labs converged on "3 linear : 1 full" with different linear layers?', a: 'Qwen (Gated DeltaNet + gated attention: Qwen3-Next, 3.5, 3.8) and Moonshot (KDA + MLA: Kimi Linear, K3).' },
        { q: 'Which rows attack bill ① without any linear layers?', a: 'DeepSeek-V3.2 / V4 and GLM-5 (sparse or compressed-sparse attention), MiniMax-M3 (block-sparse), gpt-oss and Gemma 3 (sliding windows).' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 15 — Where it's going (timeline + 2026 trends)
// ============================================================================

const KIND_COLOR = { linear: '#22d3ee', attn: '#fb923c', moe: '#a78bfa', train: '#34d399', resid: '#f472b6' };
const LANES = ['DeepSeek', 'Qwen', 'Moonshot', 'MiniMax', 'Z.ai', 'others'];
const EVENTS = [
  { lane: 'DeepSeek', y: 2024.37, k: 'attn', t: 'DeepSeek-V2', d: 'May 2024 · introduces MLA and DeepSeekMoE at scale' },
  { lane: 'DeepSeek', y: 2024.96, k: 'train', t: 'DeepSeek-V3', d: 'Dec 2024 · FP8 training, MTP, aux-loss-free balancing' },
  { lane: 'DeepSeek', y: 2025.13, k: 'attn', t: 'NSA paper', d: 'Feb 2025 · Native Sparse Attention (ACL 2025 best paper)' },
  { lane: 'DeepSeek', y: 2025.71, k: 'attn', t: 'V3.2-Exp · DSA', d: 'Sep 2025 · lightning indexer + top-2,048 sparse attention' },
  { lane: 'DeepSeek', y: 2025.99, k: 'resid', t: 'mHC', d: 'Dec 2025 · manifold-constrained hyper-connections (doubly-stochastic residual mixing)' },
  { lane: 'DeepSeek', y: 2026.07, k: 'moe', t: 'Engram', d: 'Jan 2026 · hashed N-gram lookup memory as a new sparsity axis' },
  { lane: 'DeepSeek', y: 2026.31, k: 'attn', t: 'DeepSeek-V4 (preview)', d: 'Apr 2026 · compressed-sparse attention, 1M context, Muon, mHC †' },
  { lane: 'Qwen', y: 2025.3, k: 'moe', t: 'Qwen3', d: 'Apr 2025 · 235B-A22B, 128 experts, QK-norm' },
  { lane: 'Qwen', y: 2025.69, k: 'linear', t: 'Qwen3-Next', d: 'Sep 2025 · 3 GDN : 1 gated attention, 512 experts, 80B-A3B' },
  { lane: 'Qwen', y: 2025.92, k: 'attn', t: 'Gated attention', d: 'Dec 2025 · NeurIPS 2025 best paper' },
  { lane: 'Qwen', y: 2026.12, k: 'linear', t: 'Qwen3.5', d: 'Feb 2026 · GDN hybrid at 397B-A17B' },
  { lane: 'Qwen', y: 2026.61, k: 'linear', t: 'Qwen3.8', d: 'Aug 2026 · 2.4T-A95B; Flash-Next pairs GDN with sparse attention and a 4-branch gated residual †' },
  { lane: 'Moonshot', y: 2025.13, k: 'attn', t: 'MoBA', d: 'Feb 2025 · mixture of block attention' },
  { lane: 'Moonshot', y: 2025.53, k: 'train', t: 'Kimi K2', d: 'Jul 2025 · 1T-A32B, MuonClip, 15.5T tokens without loss spikes' },
  { lane: 'Moonshot', y: 2025.83, k: 'linear', t: 'Kimi Linear', d: 'Oct 2025 · KDA : MLA = 3 : 1, 75% less KV, 6.3× decode at 1M' },
  { lane: 'Moonshot', y: 2026.21, k: 'resid', t: 'Attention Residuals', d: 'Mar 2026 · layers attend over earlier layers\' outputs instead of summing them' },
  { lane: 'Moonshot', y: 2026.55, k: 'linear', t: 'Kimi K3', d: '2026 · 2.8T-A104B, 69 KDA + 24 gated MLA, MXFP4 QAT' },
  { lane: 'MiniMax', y: 2025.04, k: 'linear', t: 'MiniMax-01', d: 'Jan 2025 · lightning (linear) attention, 7 : 1' },
  { lane: 'MiniMax', y: 2025.46, k: 'linear', t: 'MiniMax-M1', d: 'Jun 2025 · 456B reasoning model on the same hybrid' },
  { lane: 'MiniMax', y: 2025.82, k: 'attn', t: 'MiniMax-M2', d: 'Oct 2025 · back to full attention in all layers' },
  { lane: 'MiniMax', y: 2026.42, k: 'attn', t: 'MiniMax-M3', d: 'Jun 2026 · block-sparse attention with an indexer, 1M context †' },
  { lane: 'Z.ai', y: 2025.55, k: 'moe', t: 'GLM-4.5', d: 'Jul 2025 · 355B-A32B, Muon, MTP' },
  { lane: 'Z.ai', y: 2026.1, k: 'attn', t: 'GLM-5', d: 'Feb 2026 · 744B-A40B with DeepSeek Sparse Attention' },
  { lane: 'Z.ai', y: 2026.65, k: 'linear', t: 'GLM-5.3-Flash', d: 'Aug 2026 · hybrid of linear and sparse attention †' },
  { lane: 'others', y: 2025.2, k: 'attn', t: 'Gemma 3', d: 'Mar 2025 · 5 local : 1 global, window 1,024' },
  { lane: 'others', y: 2025.59, k: 'train', t: 'gpt-oss', d: 'Aug 2025 · MXFP4 experts, attention sinks, alternating windows' },
  { lane: 'others', y: 2025.95, k: 'linear', t: 'Nemotron 3 Nano', d: 'Dec 2025 · Mamba-2 hybrid MoE' },
  { lane: 'others', y: 2026.18, k: 'linear', t: 'Olmo Hybrid', d: 'Mar 2026 · fully open 3 GDN : 1 attention testbed' },
];

const Timeline = () => {
  const [hover, setHover] = useState(null);
  const [sel, setSel] = useState(EVENTS.find(e => e.t === 'Kimi K3'));
  const W = 520, L = 74, R = 12, Tp = 22, lane = 30;
  const H = Tp + LANES.length * lane + 22;
  const x = (y) => L + ((y - 2024.25) / (2026.85 - 2024.25)) * (W - L - R);
  return (
    <>
      <ChartBox><svg viewBox={`0 0 ${W} ${H}`} className={CHART_CLS}>
        {[2025, 2026].map(y => (
          <g key={y}>
            <line x1={x(y)} x2={x(y)} y1={Tp - 6} y2={H - 20} stroke="#fff" strokeOpacity={0.12} />
            <text x={x(y)} y={H - 6} fontSize={11} fill="#a3a3a3" textAnchor="middle">{y}</text>
          </g>
        ))}
        <text x={x(2026.73)} y={H - 6} fontSize={11} fill="#a3a3a3" textAnchor="middle">now</text>
        {LANES.map((ln, i) => (
          <g key={ln}>
            <line x1={L} x2={W - R} y1={Tp + i * lane + lane / 2} y2={Tp + i * lane + lane / 2} stroke="#fff" strokeOpacity={0.05} />
            <text x={L - 8} y={Tp + i * lane + lane / 2 + 4} fontSize={11} fill="#d4d4d4" textAnchor="end">{ln}</text>
          </g>
        ))}
        {EVENTS.map(e => {
          const cy = Tp + LANES.indexOf(e.lane) * lane + lane / 2;
          const on = sel && sel.t === e.t;
          return (
            <motion.circle key={e.t} cx={x(e.y)} cy={cy} r={on ? 7.5 : 5.5} fill={KIND_COLOR[e.k]} fillOpacity={on ? 1 : 0.8}
              stroke={on ? '#fff' : 'none'} strokeWidth={2} style={{ cursor: 'pointer' }}
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: (e.y - 2024.3) * 0.4 }}
              onClick={() => setSel(e)}
              onMouseEnter={(ev) => setHover({ e, mx: ev.clientX, my: ev.clientY })}
              onMouseMove={(ev) => setHover({ e, mx: ev.clientX, my: ev.clientY })}
              onMouseLeave={() => setHover(null)} />
          );
        })}
      </svg></ChartBox>
      <FloatingTip hover={hover} width={260} render={({ e }) => (
        <div><div className="font-medium" style={{ color: KIND_COLOR[e.k] }}>{e.t}</div><div className="text-neutral-300 mt-0.5">{e.d}</div></div>
      )} />
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-400">
        {[['linear', 'linear / hybrid layers'], ['attn', 'attention: latent · sparse · window · gated'], ['moe', 'MoE / sparsity'], ['train', 'training & precision'], ['resid', 'residual stream']].map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />{l}</span>
        ))}
      </div>
      {sel && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12.5px]">
          <span className="font-medium" style={{ color: KIND_COLOR[sel.k] }}>{sel.t}</span> <span className="text-neutral-500">· {sel.lane}</span>
          <div className="text-neutral-300">{sel.d}</div>
        </div>
      )}
    </>
  );
};

const Future = () => (
  <Card id="c-future" icon={Telescope} title="Where it's going — and what got walked back" subtitle="Two years of open releases, and the four threads the 2026 models are pulling on" accent="amber" index={15}>
    <MinSchema>
      2025 settled the recipe (latent or hybrid attention + very sparse MoE + Muon/low precision). 2026 pushes on four fronts: make even the "full" layers sparse, redesign the
      residual stream, add capacity through lookup tables, and go to 4-bit everywhere.
    </MinSchema>

    <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400">architecture releases by lab · 2024 → Sep 2026</div>
        <div className="text-[10px] text-neutral-500">hover or click a dot · † = details from announcements / summaries</div>
      </div>
      <Timeline />
    </div>

    <div className="grid md:grid-cols-2 gap-3">
      {[
        { h: '① The last full layers go sparse', c: 'text-orange-300', b: 'Hybrids kept 1 full-attention layer in 4 — now those become sparse too: GLM-5 adopted DSA and later shared one indexer across 4 layers; Qwen3.8-Flash-Next pairs GDN with a block-level sparse attention; MiniMax-M3 and DeepSeek-V4 use indexer-driven block/compressed sparsity. †' },
        { h: '② The residual stream gets redesigned', c: 'text-pink-300', b: 'The one part of the 2017 transformer nobody touched. DeepSeek\'s mHC widens it into 4 mixed streams (kept stable by doubly-stochastic mixing); Kimi\'s Attention Residuals let each layer softmax-attend over earlier layers\' outputs; Qwen\'s Gated Residual uses 4 gated branches.' },
        { h: '③ Capacity through lookup tables', c: 'text-violet-300', b: 'After experts, the next sparse axis is memory you index rather than compute: DeepSeek\'s Engram (hashed N-gram lookup), and N-gram embedding tables holding ~46% of LongCat-Flash-Lite\'s parameters and 51B of Qwen3.8-Flash-Next\'s — kept off the accelerator. †' },
        { h: '④ 4-bit becomes the training format', c: 'text-emerald-300', b: 'MXFP4 quantization-aware training (Kimi K3), NVFP4 pre-training (NVIDIA Nemotron 3 Super/Ultra), FP4 expert weights (DeepSeek-V4). The cure for outliers — gates, clipping, fine-grained scales — is what makes this possible.' },
      ].map(x => (
        <div key={x.h} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className={`text-[12px] font-medium ${x.c}`}>{x.h}</div>
          <div className="mt-1 text-[12.5px] text-neutral-300 leading-snug">{x.b}</div>
        </div>
      ))}
    </div>

    <Block>{String.raw`\text{Attention Residuals:}\quad h_{l} = \sum_{i<l} \underbrace{\mathrm{softmax}_i\big(w_l^{\top}\,\mathrm{RMSNorm}(v_i)\big)}_{\text{learned per-layer pseudo-query } w_l}\; v_i \qquad\text{vs. standard}\quad h_l = \sum_{i<l} v_i`}</Block>

    <Misconception
      wrong="Architecture progress is a straight line: each release strictly supersedes the last."
      right="Labs walk things back. MiniMax went linear → full → sparse in 18 months; DeepSeek moved from MLA to compressed-sparse attention in V4; Qwen and Moonshot kept softmax layers in every hybrid."
      because="Small-scale benchmarks miss failure modes (multi-hop retrieval, long-context after fine-tuning) and serving stacks lag new layers. What survives is what works at scale and is cheap to serve." />

    <WhenItMatters>Planning inference infrastructure for 2027: expect KV caches to shrink (hybrids, compressed-sparse), models to grow in total parameters while active stays ~3–5%, and FP4 to be the default checkpoint format.</WhenItMatters>

    <QA items={[
      { q: 'Why is the residual stream a natural next target after attention and FFNs?', a: 'It\'s the one remaining untouched component: a fixed sum where every layer\'s output gets equal weight. At 90+ layers early contributions get diluted, and learned, input-dependent mixing (mHC, AttnRes, gated residuals) buys quality for a few percent of compute.' },
      { q: 'N-gram lookup tables add parameters without FLOPs. What resource do they spend instead?', a: 'Memory capacity and bandwidth — but for tables accessed sparsely by hashed keys, they can live in cheaper host memory and be prefetched, unlike experts.' },
    ]} />
  </Card>
);

// ============================================================================
// CARD 16 — Next trails
// ============================================================================

const Trails = () => (
  <Card id="c-trails" icon={MapIcon} title="Next trails" subtitle="Where to go from here" accent="violet" index={16}>
    <NextSteps groups={[
      { title: 'sibling explainers', note: 'in this repo', items: [
        { label: 'DeepSeek-V4 · million-token context', href: '#deepseek-v4', note: 'One model in depth: compressed-sparse attention, mHC, Muon and FP4 — cards 4, 13 and 15 zoomed in.' },
        { label: 'Machine Learning · least-squares to transformers', href: '#machine-learning', note: 'The baseline transformer every card here modifies.' },
        { label: 'Linear Algebra', href: '#linear-algebra', note: 'Outer products, low rank, Householder transforms, SVD — the math of MLA, DeltaNet and Muon.' },
        { label: 'Optimization', href: '#optimization', note: 'Gradient descent, momentum and conditioning — what Muon is improving on.' },
        { label: 'Data Centers · v2', href: '#data-centers-v2', note: 'The memory-bandwidth-bound hardware that makes bill ① bite.' },
        { label: 'Control Theory', href: '#control-theory', note: 'State-space models — the lineage Mamba and linear attention come from.' },
      ] },
      { title: 'deepen inside the topic', items: [
        { label: 'Gated Delta Networks (Yang, Kautz, Hatamizadeh)', href: 'https://arxiv.org/abs/2412.06464', note: 'The GDN paper — ablations of gate vs delta, hybrid variants.' },
        { label: 'Parallelizing Linear Transformers with the Delta Rule', href: 'https://arxiv.org/abs/2406.06484', note: 'The WY-representation trick that makes DeltaNet trainable at scale.' },
        { label: 'Kimi Linear tech report', href: 'https://arxiv.org/abs/2510.26692', note: 'KDA, the 3:1 hybrid, NoPE for MLA layers.' },
        { label: 'flash-linear-attention', href: 'https://github.com/fla-org/flash-linear-attention', note: 'Reference Triton kernels for GDN, KDA, Mamba-2 and friends.' },
        { label: 'Gated Attention for LLMs (code + paper)', href: 'https://github.com/qiuzh20/gated_attention', note: 'NeurIPS 2025 best paper — the sigmoid output gate.' },
        { label: 'DeepSeek-V3 technical report', href: 'https://arxiv.org/abs/2412.19437', note: 'MLA, aux-loss-free balancing, FP8, MTP in one place.' },
        { label: 'Native Sparse Attention', href: 'https://arxiv.org/abs/2502.11089', note: 'Compressed + selected + sliding branches.' },
        { label: 'Kimi K2 tech report', href: 'https://arxiv.org/abs/2507.20534', note: 'MuonClip and QK-clip at 1T parameters.' },
        { label: 'Muon (Keller Jordan)', href: 'https://kellerjordan.github.io/posts/muon/', note: 'The original write-up with the Newton–Schulz coefficients.' },
        { label: 'Kimi K3 repository', href: 'https://github.com/MoonshotAI/Kimi-K3', note: 'Model card and tech report for the 69 KDA + 24 gated MLA flagship.' },
      ] },
      { title: 'upstream foundations', items: [
        { label: 'Fast weights & associative memory', note: 'Schmidhuber (1992) and Hopfield: linear attention is a fast-weight memory.' },
        { label: 'Widrow–Hoff / LMS adaptive filters', note: 'The 1960 origin of the delta rule — online least squares.' },
        { label: 'Numerical linear algebra', note: 'Newton–Schulz iterations, WY/UT representations of Householder products.' },
        { label: 'Floating-point formats', note: 'E4M3, E2M1, shared exponents — why block scaling works.' },
      ] },
      { title: 'zoom out', items: [
        { label: 'Inference economics', note: 'PagedAttention/vLLM, prefix caching, disaggregated prefill/decode — where KV-cache savings turn into price cuts.' },
        { label: 'The open-weight ecosystem', note: 'Why Chinese labs lead open architecture work, and how licenses (MIT, Apache-2.0, modified MIT) shape adoption.' },
      ] },
    ]} />
  </Card>
);

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
