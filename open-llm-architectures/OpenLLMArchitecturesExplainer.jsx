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
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100">
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

const Costs = () => <Stub id="c-costs" icon={Gauge} title="The three bills every LLM pays" index={1} accent="rose" />;
const KVDiet = () => <Stub id="c-kv" icon={Database} title="The KV-cache diet: MHA → GQA → MLA" index={2} accent="orange" />;
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
