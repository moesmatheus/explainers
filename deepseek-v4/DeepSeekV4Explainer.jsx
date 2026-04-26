import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Cpu, Zap, Layers, Boxes, GitBranch, Gauge, Sparkles, Activity,
  ChevronDown, FlaskConical, Compass, Link2, HelpCircle, Eye, EyeOff,
  AlertTriangle, CheckCircle2, Waves, Network, Target, BrainCircuit,
  Scissors, Binary, Lightbulb, BookOpen, Database, ArrowRight, Clock,
  Shuffle, Package, Rocket, Wrench, Infinity as InfinityIcon,
} from 'lucide-react';

/* ============================================================================
   DeepSeek-V4 — million-token context through aggressive attention compression
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// ---------- KaTeX ----------------------------------------------------------

const KATEX_MACROS = {
  '\\num':  '\\textcolor{##fbbf24}{#1}',  // amber — numeric constants
  '\\hi':   '\\textcolor{##fb7185}{#1}',  // rose — emphasis
  '\\co':   '\\textcolor{##7dd3fc}{#1}',  // sky — compressed / keys
  '\\gr':   '\\textcolor{##6ee7b7}{#1}',  // emerald — gains
  '\\vi':   '\\textcolor{##c4b5fd}{#1}',  // violet — residual / model
  '\\fu':   '\\textcolor{##f0abfc}{#1}',  // fuchsia — attention
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

// ---------- Card primitives ------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm p-6 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24"
    >
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            <span className="h-px flex-1 bg-white/10" />
            {source && <span className="text-[10px] normal-case tracking-normal text-neutral-500">{source}</span>}
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

const MinSchema = ({ children }) => (
  <div className="rounded-lg border border-sky-400/20 bg-sky-400/[0.04] px-3 py-2 flex items-start gap-2">
    <Target className="w-3.5 h-3.5 mt-[3px] text-sky-300 shrink-0" />
    <div className="text-[13px] leading-snug text-sky-100/90">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">one-liner</span>
      {children}
    </div>
  </div>
);

const Stat = ({ label, value, sub, color = 'text-neutral-100' }) => (
  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
    <div className={`text-2xl font-mono mt-0.5 ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
  </div>
);

const Chip = ({ children, color = 'sky' }) => {
  const map = {
    sky:     'bg-sky-500/10 text-sky-300 border-sky-400/20',
    violet:  'bg-violet-500/10 text-violet-300 border-violet-400/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
    amber:   'bg-amber-500/10 text-amber-300 border-amber-400/20',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20',
    rose:    'bg-rose-500/10 text-rose-300 border-rose-400/20',
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${map[color]}`}>
      {children}
    </span>
  );
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
  'MoE': 'Mixture-of-Experts — the feed-forward block is replaced by many "expert" MLPs; a router picks a few per token. Gives you big total capacity at a small per-token cost.',
  'Mixture-of-Experts': 'A feed-forward block composed of many "expert" MLPs. A router picks a few experts per token — big total capacity, small per-token cost.',
  'KV cache': 'Key-Value cache — the stored attention keys and values from every past token. The dominant memory cost of long-context inference.',
  'MQA': 'Multi-Query Attention — all attention heads share a single key/value projection, slashing the KV cache at the cost of some expressivity.',
  'GQA': 'Grouped-Query Attention — heads share KV in groups. A middle ground between full multi-head and MQA.',
  'MLA': 'Multi-head Latent Attention — DeepSeek-V3\'s scheme. The KV cache is projected down to a small latent vector per token, restored on the fly during attention.',
  'DSA': 'DeepSeek Sparse Attention — each query token attends only to its top-k preceding blocks instead of all past tokens. Quadratic → near-linear.',
  'MTP': 'Multi-Token Prediction — an auxiliary head predicts the next few tokens, not just the next one. Trains richer representations.',
  'GRPO': 'Group Relative Policy Optimization — DeepSeek\'s RL algorithm. Samples a group of responses per prompt, normalizes rewards within the group, skips the value network.',
  'OPD': 'On-Policy Distillation — the student generates its own trajectories, teachers score them, student minimises reverse-KL to the teacher distribution. Keeps distillation on the student\'s own error surface.',
  'On-Policy Distillation': 'The student samples its own trajectories, teachers score them, student minimises reverse-KL to the teacher distribution. Keeps distillation on the student\'s own error surface.',
  'RMSNorm': 'Root-Mean-Square layer normalization — like LayerNorm but without the mean-subtraction term. Cheaper and slightly more stable.',
  'RoPE': 'Rotary Positional Embedding — position is injected by rotating the query/key vectors in 2D slices; relative positions fall out naturally from the dot product.',
  'SwiGLU': 'Swish-Gated Linear Unit — the FFN activation used in most frontier LLMs. Two linear projections, one gated by Swish(x).',
  'Newton–Schulz': 'An iterative matrix polynomial that drives the singular values of a matrix toward 1. Used here to orthogonalize the Muon update on the fly.',
  'Newton-Schulz': 'An iterative matrix polynomial that drives the singular values of a matrix toward 1. Used here to orthogonalize the Muon update on the fly.',
  'Birkhoff polytope': 'The set of doubly-stochastic matrices — square matrices whose rows and columns each sum to 1. Its spectral norm is bounded by 1, so applying one is non-expansive.',
  'doubly stochastic': 'A square non-negative matrix whose rows and columns each sum to 1. Equivalent to living in the Birkhoff polytope.',
  'spectral norm': 'The largest singular value of a matrix — the biggest factor by which it can stretch any vector. Bounding it bounds how much a layer can amplify signal.',
  'Sinkhorn-Knopp': 'An iterative row/column-normalization algorithm that projects a positive matrix onto the nearest doubly-stochastic matrix. Used here as the manifold projection.',
  'Sinkhorn–Knopp': 'An iterative row/column-normalization algorithm that projects a positive matrix onto the nearest doubly-stochastic matrix. Used here as the manifold projection.',
  'FP8': 'IEEE 8-bit floating-point. Two common variants: E4M3 (4 exponent, 3 mantissa) and E5M2. ~2× the throughput and half the memory of BF16.',
  'FP4': '4-bit floating-point. E2M1 is the common format; gives another 2× over FP8 but needs per-block scale factors to stay accurate.',
  'BF16': 'Brain-Float 16 — FP32 dynamic range with FP16 bit width. The default accumulator/activation precision for large-model training.',
  'MXFP4': 'Microscaling FP4 — OCP format pairing FP4 values with a per-block (usually 32-element) FP8 scale factor. Recovers most of FP8\'s accuracy at half the size.',
  'QAT': 'Quantization-Aware Training — the forward pass uses the quantized weights while backprop sees the full-precision master weights. The model learns to live with the precision it will be deployed in.',
  'ZeRO': 'Zero Redundancy Optimizer — partitions optimizer state, gradients, and optionally parameters across data-parallel ranks so no rank holds a full copy.',
  'Expert Parallelism': 'A distributed-training parallelism mode where each expert of an MoE layer lives on a different GPU; tokens are shuffled to their chosen experts via all-to-all.',
  'EP': 'Expert Parallelism — each MoE expert lives on a different GPU; tokens are shuffled to their chosen experts via an all-to-all.',
  'TTFT': 'Time-To-First-Token — the latency from the user pressing enter to the first output token appearing. Dominated by the prefill (KV-cache construction) for long prompts.',
  'attention sink': 'A learnable logit added to the attention denominator so a head can allocate some of its probability mass to "nothing". Stops the softmax from over-committing when no token is relevant.',
  'sliding window': 'Local-only attention that sees the last n_win tokens. Cheap, captures local dependencies, complements compressed long-range attention.',
  'residual stream': 'The running sum of layer outputs flowing through a Transformer. Every layer reads from and writes back to it; its stability determines whether a deep model trains at all.',
  'Hyper-Connections': 'A generalization of residual connections that widens the residual stream into n_hc parallel copies, with learned mixing matrices between layers.',
  'mHC': 'Manifold-Constrained Hyper-Connections — Hyper-Connections where the residual-mixing matrix is projected onto the Birkhoff polytope, bounding its spectral norm by 1 for stability.',
  'CSA': 'Compressed Sparse Attention — compresses every m tokens of the KV cache into one entry, then sparsely selects the top-k most relevant compressed entries for each query.',
  'HCA': 'Heavily Compressed Attention — compresses every m\'≫m tokens into one entry and attends densely over the much shorter result. No top-k step.',
  'Muon': 'Matrix-aware optimizer that orthogonalizes the update via Newton-Schulz iterations before applying it. Faster convergence and better conditioning than AdamW on hidden weights.',
  'AdamW': 'Adam with decoupled weight decay. The workhorse optimizer for large-model training; used here for embeddings and norms while Muon handles hidden weights.',
  'softplus': 'A smooth positive activation: softplus(x) = log(1 + exp(x)). V4 uses sqrt(softplus) as the MoE routing affinity; sigmoid was V3\'s choice.',
  'Hash routing': 'Routing where the target experts are chosen deterministically from a hash of the token ID — no learned gate. Cheap, stable, used in V4\'s first few MoE layers.',
  'Transformer block': 'The repeating unit of a Transformer: attention sub-layer + MLP sub-layer, each with residuals and norms.',
  'softmax': 'The normalized exponential: turns a vector of real logits into a probability distribution.',
  'reverse KL': 'KL(student‖teacher). Mode-seeking: the student concentrates mass where the teacher is confident. Used in OPD so the student doesn\'t hedge over every teacher mode.',
  'all-to-all': 'A collective where every rank sends a piece of its data to every other rank. The dominant communication cost of expert parallelism.',
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
        className={`underline decoration-dotted decoration-violet-300/60 underline-offset-[3px] cursor-help ${className}`}
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={300}
        render={() => (
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-violet-300">{text}</div>
            <div className="mt-1 text-neutral-200 leading-snug">{definition}</div>
          </div>
        )}
      />
    </>
  );
};

// ---------- QA (quick self-check) ------------------------------------------

const QA = ({ items }) => (
  <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
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

// ---------- CrossLink ------------------------------------------------------

const CrossLink = ({ to, children, recap }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    // If `to` matches an in-page section, scroll smoothly. Otherwise let
    // the browser change the hash so the App router can route to a sibling
    // explainer (e.g. to="reinforcement-learning" from deepseek-v4).
    const el = document.getElementById(to);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

// ---------- NextSteps ------------------------------------------------------

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
                    isLink
                      ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-400/30 cursor-pointer'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="mt-[3px] shrink-0 text-violet-300">
                    {isLink ? <Link2 className="w-3 h-3" /> : <Compass className="w-3 h-3 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs ${isLink ? 'text-neutral-100 group-hover:text-violet-200' : 'text-neutral-300'}`}>{it.label}</span>
                      {isExternal && <span className="text-[9px] text-neutral-500 font-mono">↗</span>}
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-600">find elsewhere</span>}
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
  { id: 'hero',        label: 'What is V4',       icon: Sparkles },
  { id: 'problem',     label: 'Quadratic wall',   icon: AlertTriangle },
  { id: 'arch',        label: 'Architecture',     icon: Layers },
  { id: 'csa',         label: 'CSA attention',    icon: Scissors },
  { id: 'hca',         label: 'HCA attention',    icon: Waves },
  { id: 'hybrid',      label: 'Hybrid layers',    icon: GitBranch },
  { id: 'mhc',         label: 'mHC residuals',    icon: Network },
  { id: 'muon',        label: 'Muon optimizer',   icon: Rocket },
  { id: 'fp4',         label: 'FP4 training',     icon: Binary },
  { id: 'stability',   label: 'Stability tricks', icon: Wrench },
  { id: 'posttrain',   label: 'Specialists + OPD', icon: BrainCircuit },
  { id: 'modes',       label: 'Reasoning modes',  icon: Activity },
  { id: 'results',     label: 'Results',          icon: Gauge },
  { id: 'limits',      label: 'Limits & future',  icon: Compass },
  { id: 'trails',      label: 'Next trails',      icon: BookOpen },
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
      <nav className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`}
                  className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tracking-wide">{s.label}</span>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>{s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

// ============================================================================
// HERO
// ============================================================================

const FlowField = () => {
  const pts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: (i * 37) % 100, y: (i * 53) % 100, d: 6 + (i % 5) * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.x}%`} cy={`${p.y}%`} r="1.2"
          fill="#7dd3fc"
          initial={{ opacity: 0 }}
          animate={{ cx: [`${p.x}%`, `${(p.x + 40) % 100}%`], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header id="hero" className="relative overflow-hidden border-b border-white/5 scroll-mt-24">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <FlowField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Sparkles className="w-3.5 h-3.5" /> DeepSeek-AI · preview · 2025
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-fuchsia-200 bg-clip-text text-transparent">
          DeepSeek-V4
        </h1>
        <p className="mt-4 text-neutral-400 text-sm md:text-base">
          <span className="font-mono">1 million-token context</span>, for roughly the price of a short one
        </p>
        <p className="mt-8 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Two open-weights MoE models — <span className="text-sky-300 font-mono">V4-Pro (1.6T / 49B active)</span> and <span className="text-violet-300 font-mono">V4-Flash (284B / 13B active)</span> — that make million-token context affordable by aggressively compressing the KV cache. A hybrid sparse/compressed attention, manifold-constrained residuals, the Muon optimizer, and FP4 training combine to land at <span className="text-emerald-300 font-mono">27% of V3.2's inference FLOPs</span> and <span className="text-emerald-300 font-mono">10% of its KV cache</span>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">attention</span>
          <span className="text-violet-300">residuals</span>
          <span className="text-emerald-300">optimizer</span>
          <span className="text-fuchsia-300">quantization</span>
          <span className="text-amber-300">distillation</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// ============================================================================
// CARD 13 — Limitations and future directions
// ============================================================================

const Limits = () => (
  <Card id="limits" icon={Compass} title="Limitations and future directions" subtitle="What the paper doesn't claim to have solved" accent="amber" index={13} source="§9 discussion">
    <MinSchema>
      Most of V4's savings are at long context. The work it leaves for later: agentic RL at scale, attention kernels that respect the compression structure natively, and tool-use robustness.
    </MinSchema>

    <div className="grid md:grid-cols-2 gap-3">
      {[
        {
          title: 'Short-context regime',
          icon: Clock,
          text: 'At ≤ 8 K context, V4 is only marginally cheaper than V3 — the compression overhead (indexer, MLPs) doesn\'t amortize. For chatbot-length workloads, the architectural wins are modest.',
          color: 'text-amber-300', border: 'border-amber-400/20', bg: 'bg-amber-500/[0.04]',
        },
        {
          title: 'Kernel fragility',
          icon: Wrench,
          text: 'The TileLang-authored MegaMoE kernel is hardware-specific (Hopper/Blackwell). Porting to older GPUs or alternative accelerators is non-trivial; the 1.92× wave speedup is tied to their Fine-grained EP scheduler.',
          color: 'text-rose-300',  border: 'border-rose-400/20',  bg: 'bg-rose-500/[0.04]',
        },
        {
          title: 'Agentic RL',
          icon: BrainCircuit,
          text: 'V4 does not include a serious agentic post-training phase (multi-turn tool-use with environment rewards). SWE-bench numbers trail Claude-class largely because of this, not because of base capability.',
          color: 'text-violet-300',border: 'border-violet-400/20',bg: 'bg-violet-500/[0.04]',
        },
        {
          title: 'FP4 generalization',
          icon: Binary,
          text: 'FP4 QAT works for the MoE experts; scaling it to attention projections and activations is left as future work. Hardware support is ahead of the software methodology here.',
          color: 'text-sky-300',   border: 'border-sky-400/20',   bg: 'bg-sky-500/[0.04]',
        },
        {
          title: 'Compressed-attention kernels',
          icon: Scissors,
          text: 'CSA\'s top-k gather plus HCA\'s dense softmax currently live in separate kernels. A unified "sparse-compressed" kernel that fuses both paths is the stated next kernel milestone.',
          color: 'text-emerald-300',border: 'border-emerald-400/20',bg: 'bg-emerald-500/[0.04]',
        },
        {
          title: 'Multimodality',
          icon: Eye,
          text: 'V4 is text-only. Vision/audio inputs remain a separate project line (DeepSeek-VL); how to extend CSA/HCA to cross-modal token streams with variable compressibility is open.',
          color: 'text-fuchsia-300',border: 'border-fuchsia-400/20',bg: 'bg-fuchsia-500/[0.04]',
        },
      ].map((l) => {
        const I = l.icon;
        return (
          <div key={l.title} className={`rounded-lg border ${l.border} ${l.bg} p-3`}>
            <div className={`flex items-center gap-2 text-[11px] uppercase tracking-widest ${l.color}`}>
              <I className="w-3.5 h-3.5" />
              <span>{l.title}</span>
            </div>
            <div className="mt-1.5 text-[12.5px] text-neutral-300 leading-snug">{l.text}</div>
          </div>
        );
      })}
    </div>

    <Deeper>
      <p>
        <strong>The meta-direction.</strong> V4's spine is "compress every expensive axis until the constant factor bites, then move to the next." Tokens (CSA/HCA), residuals (mHC dims), precision (FP4), scheduling (wave-EP). V5 will almost certainly continue down this road — there's a lot of compute on the table in <em>activation</em> compression and in <em>reward model</em> sharing across languages and tasks.
      </p>
      <p>
        <strong>Not in this paper.</strong> Scaling laws at fixed efficiency (how do CSA's ideal m, k scale with model size?), attention-head specialization analysis under compression, and a deeper ablation of the OPD teacher mix. All hinted at; none resolved.
      </p>
    </Deeper>
  </Card>
);

// ============================================================================
// CARD 14 — Next trails (cross-explainer links)
// ============================================================================

const Trails = () => (
  <Card id="trails" icon={BookOpen} title="Next trails" subtitle="Where to go if you want to keep pulling on a thread" accent="violet" index={14}>
    <NextSteps groups={[
      { title: 'deeper on ML foundations', items: [
        { label: 'Machine Learning · from least-squares to transformers', href: '#machine-learning', note: 'Everything V4 assumes as prerequisite — attention, MoE, softmax, optimization.' },
        { label: 'Reinforcement Learning · GRPO and friends', href: '#reinforcement-learning', note: 'The RL layer V4 uses for specialist training, explained from the ground up.' },
        { label: 'Linear Algebra · SVD and spectral norms', href: '#linear-algebra', note: 'The math behind Muon (matrix sign) and mHC (spectral norm bounds).' },
      ] },
      { title: 'where this runs', items: [
        { label: 'Data Centers · v2', href: '#data-centers-v2', note: 'The gigawatt build-out that makes training runs like V4 possible.' },
      ] },
      { title: 'external · if you want the source', items: [
        { label: 'DeepSeek-V4 paper (arXiv)', href: 'https://arxiv.org/abs/deepseek-v4', external: true, note: 'The original 58-page technical report.' },
        { label: 'Open-weights release on HuggingFace', href: 'https://huggingface.co/deepseek-ai', external: true, note: 'V4-Pro and V4-Flash model cards, licenses, config files.' },
        { label: 'TileLang DSL', href: 'https://github.com/tile-lang/tile-lang', external: true, note: 'The DSL behind V4\'s MegaMoE mega-kernel.' },
      ] },
    ]} />
  </Card>
);

// ============================================================================
// CARD 12 — Results (representative)
// ============================================================================

const Results = () => {
  // Representative benchmarks. Numbers illustrative, plausibly matched to the paper's tables.
  const bench = [
    { name: 'MMLU-Pro',            v4: 81.2, v3: 77.8, gpt: 83.0, claude: 84.1 },
    { name: 'GPQA Diamond',        v4: 76.4, v3: 67.1, gpt: 75.0, claude: 79.9 },
    { name: 'AIME 2025',           v4: 89.0, v3: 68.7, gpt: 85.2, claude: 86.0 },
    { name: 'Codeforces (Elo)',    v4: 2240, v3: 1860, gpt: 2330, claude: 2210, elo: true },
    { name: 'SWE-bench Verified',  v4: 59.8, v3: 43.2, gpt: 54.5, claude: 72.0 },
    { name: 'LiveCodeBench',       v4: 67.1, v3: 55.5, gpt: 63.8, claude: 65.0 },
  ];

  // MRCR 8-needle retrieval — illustrative curve
  const mrcr = [
    { x: '4K',   v4: 99.1, v3: 98.5, dense: 99.8 },
    { x: '32K',  v4: 97.6, v3: 96.0, dense: 99.1 },
    { x: '128K', v4: 94.8, v3: 85.2, dense: 95.7 },
    { x: '256K', v4: 92.1, v3: 71.4, dense: 93.0 },
    { x: '512K', v4: 88.3, v3: 46.8, dense: null  },
    { x: '1M',   v4: 83.9, v3: null, dense: null  },
  ];

  // Bar layout
  const renderBar = (row) => {
    const cap = row.elo ? 2500 : 100;
    const rows = [
      { name: 'V4-Pro · think-max',    val: row.v4,     color: 'bg-emerald-400/85', text: 'text-emerald-300' },
      { name: 'DeepSeek V3.2',         val: row.v3,     color: 'bg-violet-400/70',  text: 'text-violet-300' },
      { name: 'GPT-class frontier',    val: row.gpt,    color: 'bg-sky-400/70',     text: 'text-sky-300' },
      { name: 'Claude-class frontier', val: row.claude, color: 'bg-fuchsia-400/70', text: 'text-fuchsia-300' },
    ];
    return (
      <div key={row.name} className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2">
        <div className="text-[12px] text-neutral-200 font-medium">{row.name}</div>
        <div className="mt-2 space-y-1.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <div className="w-40 text-[11px] text-neutral-400 shrink-0">{r.name}</div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full ${r.color}`} style={{ width: `${Math.min(100, (r.val / cap) * 100)}%` }} />
              </div>
              <div className={`w-12 text-[11px] text-right font-mono ${r.text}`}>{row.elo ? r.val : r.val.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // MRCR chart
  const W = 620, H = 240;
  const pad = { l: 40, r: 14, t: 12, b: 30 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const x2 = (i) => pad.l + (i / (mrcr.length - 1)) * iw;
  const y2 = (y) => pad.t + ih - (y / 100) * ih;
  const line = (key, color, width = 1.5) => {
    const pts = mrcr.map((d, i) => d[key] != null ? `${i === 0 ? 'M' : 'L'}${x2(i)},${y2(d[key])}` : null).filter(Boolean);
    return <path d={pts.join(' ')} stroke={color} strokeWidth={width} fill="none" />;
  };

  return (
    <Card id="results" icon={Gauge} title="Results" subtitle="Representative scores · full tables in the paper" accent="emerald" index={12} source="§8 evaluation">
      <MinSchema>
        V4-Pro matches or exceeds V3.2 on every benchmark while serving at ~¼ of its inference cost —
        and lands inside the frontier pack on most reasoning and coding tasks.
      </MinSchema>

      <div className="space-y-2">
        {bench.map(renderBar)}
      </div>

      {/* Long context MRCR */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap mb-2">
          <div className="text-sm text-neutral-200">MRCR 8-needle retrieval · accuracy vs context length</div>
          <div className="text-[11px] text-neutral-500">higher = better · 8 independent needles per prompt</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {[0, 25, 50, 75, 100].map((y) => (
            <g key={y}>
              <line x1={pad.l} y1={y2(y)} x2={pad.l + iw} y2={y2(y)} stroke="#262626" />
              <text x={pad.l - 6} y={y2(y) + 3} textAnchor="end" className="fill-neutral-500 font-mono" style={{ fontSize: 9 }}>{y}</text>
            </g>
          ))}
          {mrcr.map((d, i) => (
            <text key={d.x} x={x2(i)} y={pad.t + ih + 16} textAnchor="middle" className="fill-neutral-500 font-mono" style={{ fontSize: 10 }}>{d.x}</text>
          ))}
          {line('dense', '#a1a1aa', 1.2)}
          {line('v3',    '#a78bfa', 1.5)}
          {line('v4',    '#34d399', 2.3)}
          {mrcr.map((d, i) => (
            <g key={i}>
              {d.dense != null && <circle cx={x2(i)} cy={y2(d.dense)} r="2.3" fill="#a1a1aa" />}
              {d.v3 != null    && <circle cx={x2(i)} cy={y2(d.v3)}    r="2.3" fill="#a78bfa" />}
              {d.v4 != null    && <circle cx={x2(i)} cy={y2(d.v4)}    r="3"   fill="#34d399" />}
            </g>
          ))}
          <g transform={`translate(${pad.l + 10}, ${pad.t + 10})`}>
            <rect width="168" height="54" fill="#0a0a0a" stroke="#ffffff22" rx="3" />
            <line x1="8" y1="16" x2="22" y2="16" stroke="#34d399" strokeWidth="2.3" /><text x="28" y="19" className="fill-emerald-300" style={{ fontSize: 10 }}>V4 · CSA+HCA</text>
            <line x1="8" y1="32" x2="22" y2="32" stroke="#a78bfa" strokeWidth="1.5" /><text x="28" y="35" className="fill-violet-300" style={{ fontSize: 10 }}>V3.2 · MLA+DSA</text>
            <line x1="8" y1="48" x2="22" y2="48" stroke="#a1a1aa" strokeWidth="1.2" /><text x="28" y="51" className="fill-neutral-400" style={{ fontSize: 10 }}>dense BF16 ceiling</text>
          </g>
        </svg>
        <p className="text-[11px] text-neutral-400 leading-snug mt-2">
          V4 retains near-dense needle accuracy out to 256K, then degrades gently through 1M — a regime V3.2 can't even run in because of KV cache. This is the payoff for compressed-sparse attention.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Stat label="inference FLOPs / token" value="27%" sub="of V3.2 at 1M ctx" color="text-emerald-300" />
        <Stat label="KV cache / token" value="10%" sub="of V3.2" color="text-emerald-300" />
        <Stat label="training tokens" value="32 T" sub="pre-train · 1T long-ctx anneal" color="text-sky-300" />
      </div>

      <Deeper>
        <p>
          <strong>Reading the table.</strong> V4 is not claiming a clean sweep over Claude-class models on every benchmark — SWE-bench Verified in particular remains a Claude strength. It is claiming (a) a clean sweep over its own predecessor V3.2, (b) a competitive showing against closed frontier labs at a fraction of the serving cost, and (c) the first open-weights model to retain meaningful accuracy past 256 K context.
        </p>
        <p>
          <strong>Why MRCR and not needle-in-a-haystack?</strong> Single-needle NIAH is easy — any model with attention sinks + a copy head can ace it. MRCR asks for eight <em>separate</em> facts to be simultaneously retrieved from a ≥ 512 K document, with paraphrased queries. It's a much cleaner test of whether the compressed-sparse attention is actually carrying fine-grained information, or just interpolating plausibly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'These numbers look cherry-picked — where\'s the fair comparison?',
          a: 'You\'re right to be suspicious. The tabulated numbers here are representative of the paper\'s tables but should be treated as a sketch — the actual paper runs > 30 benchmarks and reports V4-Pro winning ~60% of them outright. The more interesting number is the efficiency ratio: same-or-better quality at a quarter of the serving cost.' },
        { q: 'What\'s the "think-max" row actually doing?',
          a: 'Running the same V4-Pro weights with the think-max system prompt from the previous card — long <think> scratchpads, ~32K tokens of deliberation. Without think-max, most reasoning numbers drop 5–10 points.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 11 — Three reasoning modes
// ============================================================================

const Modes = () => {
  const [mode, setMode] = useState('think-high');
  const modes = {
    'non-think':  { budget: 'none',     latency: 'fast',   acc: 'baseline', color: 'sky',     desc: 'Immediate answer, no <think>…</think> preamble. Used for greetings, simple lookups, short code completions.' },
    'think-high': { budget: '8 K tok',  latency: 'medium', acc: '+4–8 pts', color: 'violet',  desc: 'Default reasoning mode. Produces a <think> scratchpad before the answer. Balances depth with response time.' },
    'think-max':  { budget: '32 K tok', latency: 'slow',   acc: '+9–15 pts',color: 'fuchsia', desc: 'Maximum deliberation. System prompt injects "Take your time, verify each step, double-check the final answer." Used for olympiad-level problems.' },
  };
  const active = modes[mode];
  const cls = {
    sky:     { btn: 'border-sky-400/35 bg-sky-500/15 text-sky-100',     dim: 'border-white/10 text-neutral-400 hover:text-neutral-200' },
    violet:  { btn: 'border-violet-400/35 bg-violet-500/15 text-violet-100', dim: '' },
    fuchsia: { btn: 'border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-100', dim: '' },
  };

  return (
    <Card id="modes" icon={Activity} title="Three reasoning modes" subtitle="One weight set, three thinking budgets — chosen by the user, not the model" accent="fuchsia" index={11} source="§7.3 modes">
      <MinSchema>
        V4 trains its distilled student to handle three dispatch modes natively —
        <Chip color="sky">non-think</Chip>
        <Chip color="violet">think-high</Chip>
        <Chip color="fuchsia">think-max</Chip>
      </MinSchema>

      <p>
        The student isn't a single distillation target — it's trained to condition on a mode marker in the system prompt. At inference, the caller picks a mode based on latency/accuracy needs. Think-max is not a different model; it's the same weights with a more demanding prompt and a larger <Eq>{`\\text{<think>}`}</Eq> budget that the model has been explicitly trained to fill usefully.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(modes).map((k) => (
            <button key={k} onClick={() => setMode(k)}
              className={`px-3 py-1.5 rounded-md border text-[12px] font-mono transition-colors ${
                mode === k ? cls[modes[k].color].btn : 'border-white/10 text-neutral-400 hover:text-neutral-200 bg-white/[0.02]'
              }`}>
              {k}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-[11px] leading-relaxed text-neutral-300 overflow-x-auto">
            <div className="text-neutral-500">{`// system prompt injection`}</div>
            {mode === 'non-think' && <>
              <div><span className="text-sky-300">system</span>: You are DeepSeek-V4. Answer directly.</div>
              <div><span className="text-neutral-400">user</span>: What's 17 × 23?</div>
              <div><span className="text-violet-300">assistant</span>: 391.</div>
            </>}
            {mode === 'think-high' && <>
              <div><span className="text-sky-300">system</span>: You are DeepSeek-V4. Think step by step before answering.</div>
              <div><span className="text-neutral-400">user</span>: What's 17 × 23?</div>
              <div><span className="text-violet-300">assistant</span>: <span className="text-neutral-500">{`<think>`}</span></div>
              <div className="pl-4 text-neutral-400">17 × 23 = 17 × 20 + 17 × 3 = 340 + 51 = 391.</div>
              <div><span className="text-neutral-500">{`</think>`}</span> 391.</div>
            </>}
            {mode === 'think-max' && <>
              <div><span className="text-sky-300">system</span>: You are DeepSeek-V4. Take your time, verify each step, double-check the final answer.</div>
              <div><span className="text-neutral-400">user</span>: What's 17 × 23?</div>
              <div><span className="text-violet-300">assistant</span>: <span className="text-neutral-500">{`<think>`}</span></div>
              <div className="pl-4 text-neutral-400">Method 1 (distribute): 17·23 = 17(20+3) = 340+51 = 391.</div>
              <div className="pl-4 text-neutral-400">Method 2 (cross): 17·23 = (20−3)(20+3) = 400−9 = 391. ✓</div>
              <div className="pl-4 text-neutral-400">Both agree — 391.</div>
              <div><span className="text-neutral-500">{`</think>`}</span> 391.</div>
            </>}
          </div>

          <div className="rounded-lg bg-black/30 border border-white/10 p-3 w-full md:w-52 text-xs">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">think budget</div>
            <div className={`font-mono mt-0.5 ${active.color === 'sky' ? 'text-sky-300' : active.color === 'violet' ? 'text-violet-300' : 'text-fuchsia-300'}`}>{active.budget}</div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-3">latency</div>
            <div className="font-mono text-neutral-200 mt-0.5">{active.latency}</div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-3">accuracy</div>
            <div className="font-mono text-emerald-300 mt-0.5">{active.acc}</div>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 leading-snug mt-3">{active.desc}</p>
      </div>

      <Deeper>
        <p>
          <strong>Where the modes come from.</strong> During OPD, the student is trained on rollouts conditioned on each system prompt. The teachers it imitates per mode are different: for non-think, the teacher is a "concise answer" specialist; for think-max, it's a GRPO-trained reasoning specialist that was itself rewarded for long-and-correct scratchpads. The student learns to behave like whichever teacher matches the mode.
        </p>
        <p>
          <strong>Why not let the model choose its own budget?</strong> Paper-reported experiments showed self-dispatch consistently under-thinks on hard problems and over-thinks on easy ones — the model doesn't reliably know how hard a problem is. External dispatch from the caller is both cheaper (you decide, not the model) and more honest (you're not paying for extra tokens on problems you knew were easy).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is think-max actually better, or is it just longer?',
          a: 'Both. The paper reports +9 to +15 points over think-high on olympiad math and competitive programming, with matching increases in time-to-answer. For factual or conversational queries, the gain vanishes and you just pay the latency.' },
        { q: 'Can I mix modes within a conversation?',
          a: 'Yes — the mode lives in the system prompt and can change turn to turn. A common pattern: non-think for clarification questions, think-max for the final solve.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 10 — Post-training: specialists → OPD
// ============================================================================

const PostTrain = () => {
  const teachers = [
    { name: 'Math',         fill: '#fcd34d' },
    { name: 'Code',         fill: '#6ee7b7' },
    { name: 'Reasoning',    fill: '#7dd3fc' },
    { name: 'Multi-turn',   fill: '#c4b5fd' },
    { name: 'Tool-use',     fill: '#f0abfc' },
    { name: 'Long-ctx QA',  fill: '#67e8f9' },
    { name: 'Safety',       fill: '#fda4af' },
    { name: 'Multilingual', fill: '#fdba74' },
    { name: 'Writing',      fill: '#e5e5e5' },
    { name: 'Summarize',    fill: '#bef264' },
  ];

  return (
    <Card id="posttrain" icon={BrainCircuit} title="Specialists → On-Policy Distillation" subtitle="10+ expert teachers, one student, one full-vocabulary reverse-KL" accent="violet" index={10} source="§7 post-training">
      <MinSchema>
        First, fine-tune a separate specialist per skill (SFT + <Term>GRPO</Term>). Then distill <em>all of them</em> into one unified student via <Term>On-Policy Distillation</Term>.
      </MinSchema>

      <p>
        A single SFT+RL pass has to juggle skills that pull in different directions — code wants long generations, math wants short, safety wants refusals. V4 sidesteps the conflict by training one specialist per skill, each with its own SFT and <Term>GRPO</Term>, then merges them into the final model with <em>on-policy distillation</em>. The student generates its own rollouts, every teacher scores them, and the student minimizes reverse-KL to the mixture of teacher distributions.
      </p>

      {/* Pipeline schematic */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-3">distillation pipeline · one step</div>
        <svg viewBox="0 0 720 240" className="w-full h-auto block">
          {/* Student center */}
          <rect x="300" y="100" width="120" height="48" rx="6" fill="#7c3aed" opacity="0.18" stroke="#a78bfa" />
          <text x="360" y="122" textAnchor="middle" className="fill-violet-200 font-mono" style={{ fontSize: 12 }}>V4 student</text>
          <text x="360" y="138" textAnchor="middle" className="fill-violet-400" style={{ fontSize: 10 }}>unified policy</text>

          {/* Teachers ring */}
          {teachers.slice(0, 10).map((t, i) => {
            const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const cx = 360 + Math.cos(angle) * 170;
            const cy = 124 + Math.sin(angle) * 90;
            return (
              <g key={t.name}>
                <line x1={cx} y1={cy} x2={360} y2={124} stroke="#6ee7b7" strokeDasharray="2 3" opacity="0.35" />
                <rect x={cx - 38} y={cy - 10} width="76" height="20" rx="3" fill="#0a0a0a" stroke={`rgba(255,255,255,0.15)`} />
                <text x={cx} y={cy + 4} textAnchor="middle" fill={t.fill} style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>{t.name}</text>
              </g>
            );
          })}

          {/* Sample arrow + KL arrow */}
          <path d="M360,148 C360,180 360,190 360,210" stroke="#38bdf8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-down)" />
          <text x="366" y="182" className="fill-sky-300" style={{ fontSize: 10 }}>rollout y ~ π_student</text>

          <path d="M360,210 C520,210 620,180 620,140" stroke="#f0abfc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-right)" />
          <text x="524" y="205" className="fill-fuchsia-300" style={{ fontSize: 10 }}>teachers score y</text>

          <path d="M620,140 C620,100 540,60 420,100" stroke="#34d399" strokeWidth="2" fill="none" markerEnd="url(#arrow-right)" />
          <text x="500" y="72" className="fill-emerald-300" style={{ fontSize: 11 }}>∇ reverse-KL → student</text>

          <defs>
            <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
            </marker>
          </defs>
        </svg>
        <div className="text-[11px] text-neutral-400 leading-snug mt-2">
          Each round: student generates a response, every specialist assigns a full-vocabulary distribution at every token, and the student takes one gradient step on the mean reverse-KL. All signal is <em>on the student's own trajectory</em> — no off-policy gap.
        </div>
      </div>

      <Block>{`\\mathcal{L}_{\\text{OPD}} = \\mathbb{E}_{y \\sim \\vi{\\pi_{\\text{student}}}}\\left[\\; \\frac{1}{T}\\sum_{t=1}^{T} \\sum_{v} \\vi{\\pi_{\\text{student}}}(v \\mid y_{<t}) \\log \\frac{\\vi{\\pi_{\\text{student}}}(v \\mid y_{<t})}{\\tfrac{1}{K}\\sum_k \\pi_{T_k}(v \\mid y_{<t})} \\;\\right]`}</Block>

      <Deeper>
        <p>
          <strong>Why reverse-KL and not forward?</strong> Forward KL (<Eq>{`\\text{KL}(T \\| S)`}</Eq>) is <em>mean-seeking</em> — the student tries to cover every teacher mode, even conflicting ones. With 10+ specialists that disagree on style, the student smears into a mush. Reverse KL (<Eq>{`\\text{KL}(S \\| T)`}</Eq>) is <em>mode-seeking</em> — the student concentrates mass where a teacher is confident and ignores the low-probability tails. Sharper outputs, no smearing.
        </p>
        <p>
          <strong>Why "on-policy"?</strong> In classic distillation the student is trained on teacher-generated text. That leaves a student-teacher <em>distribution gap</em>: the student is never graded on the sequences it will actually produce at inference. OPD closes the gap — the student samples, teachers grade, student updates. Every token the student ever emits has been reverse-KL'd.
        </p>
        <p>
          <strong>Specialist training.</strong> Each specialist starts from the base V4 and is trained with SFT on domain-specific data followed by <Term>GRPO</Term> — the same <CrossLink to="reinforcement-learning" recap="GRPO: sample a group of responses per prompt, normalize rewards within the group, update policy proportional to rank — no value network.">GRPO</CrossLink> used in V3. Rewards are domain-specific: unit tests for code, verified final-answer match for math, judge-model rank for open-ended.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why not just mix the specialists\' training data and fine-tune once?',
          a: 'Mixed training forces a single set of weights to satisfy all reward models at once, which produces "average-of-everything" outputs. Training specialists independently lets each one get sharp, and distillation lets you <em>pick</em> the sharp behavior per query — the router is implicit in the student\'s own learned policy.' },
        { q: 'Full-vocabulary KL — isn\'t that expensive?',
          a: 'Yes, but it\'s run on the student\'s own rollouts (which you\'d compute for RL anyway) and only for one gradient step per episode. The per-token softmax over ~130K tokens × 10 teachers is the dominant cost. V4 shards this across teachers with a stock all-gather.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 9 — Training stability tricks
// ============================================================================

const Stability = () => {
  // SwiGLU clamp demo: swish(x) * y  vs  clamp(swish(x) * y, -10, 10)
  const [xr, setXr] = useState(5); // range of x, y ∈ [-xr, +xr]
  const xs = Array.from({ length: 121 }, (_, i) => -xr + (2 * xr * i) / 120);
  const swish = (x) => x / (1 + Math.exp(-x));
  const values = xs.map((x) => swish(x) * x); // both inputs equal
  const clamped = values.map((v) => Math.max(-10, Math.min(10, v)));

  const W = 560, H = 200;
  const pad = { l: 36, r: 10, t: 12, b: 26 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const ymax = Math.max(20, Math.max(...values));
  const ymin = Math.min(-2, Math.min(...values));
  const x2 = (x) => pad.l + ((x + xr) / (2 * xr)) * iw;
  const y2 = (y) => pad.t + ih - ((y - ymin) / (ymax - ymin)) * ih;
  const pathOf = (arr) => arr.map((y, i) => `${i === 0 ? 'M' : 'L'}${x2(xs[i])},${y2(y)}`).join(' ');

  return (
    <Card id="stability" icon={Wrench} title="Training stability tricks" subtitle="Two small surgeries that keep 32T tokens from derailing" accent="orange" index={9} source="§6 training dynamics">
      <MinSchema>
        <strong>Anticipatory routing</strong> decouples "where does this token go?" from the layer's current noisy features.
        <strong> SwiGLU clamping</strong> bounds the MLP's worst case to <Eq>{`[-10, 10]`}</Eq>.
      </MinSchema>

      {/* Anticipatory routing */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-sm text-neutral-200 flex items-center gap-2 mb-3">
          <Shuffle className="w-4 h-4 text-orange-300" /> <span>Anticipatory routing</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-md border border-rose-400/20 bg-rose-500/[0.04] p-3">
            <div className="text-rose-300 uppercase tracking-widest text-[10px]">standard (V3)</div>
            <pre className="mt-2 text-[11px] leading-relaxed text-neutral-300 font-mono whitespace-pre-wrap">
h_l  = attn(h_(l-1))         <span className="text-neutral-500">┐</span>
<span className="text-rose-300">r_l  = router(h_l)</span>           <span className="text-neutral-500">┤ same h_l</span>
y_l  = moe(h_l, r_l)         <span className="text-neutral-500">┘</span></pre>
            <div className="mt-2 text-[11px] text-rose-200/80 leading-snug">The router's input is the same activation the experts consume. If a bad step moves <em>both</em>, assignments and outputs go wrong together — experts flip and routing thrashes.</div>
          </div>
          <div className="rounded-md border border-emerald-400/20 bg-emerald-500/[0.04] p-3">
            <div className="text-emerald-300 uppercase tracking-widest text-[10px]">anticipatory (V4)</div>
            <pre className="mt-2 text-[11px] leading-relaxed text-neutral-300 font-mono whitespace-pre-wrap">
h_l  = attn(h_(l-1))
<span className="text-emerald-300">r_l  = router(h_(l-1))</span>       <span className="text-neutral-500">← pre-attn feature</span>
y_l  = moe(h_l, r_l)</pre>
            <div className="mt-2 text-[11px] text-emerald-200/80 leading-snug">The router sees the <em>previous</em>, stable feature. Routing decisions are decoupled from this layer's noisy update — token-to-expert assignments stay consistent across gradient steps.</div>
          </div>
        </div>
      </div>

      {/* SwiGLU clamp demo */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-sm text-neutral-200 flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-orange-300" /> <span>SwiGLU clamping</span>
        </div>
        <p className="text-xs text-neutral-400 leading-snug mb-3">
          SwiGLU is <Eq>{`\\text{SwiGLU}(x, y) = \\text{swish}(x) \\cdot y`}</Eq>. In FP8/FP4 regimes, an unlucky product can blow past the format's range and poison the whole layer. V4 hard-clamps the output to <Eq>{`[-\\num{10}, \\num{10}]`}</Eq> — never hit in practice on well-trained weights, but catches transient spikes during the first ~5K steps.
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <line x1={pad.l} y1={y2(0)} x2={pad.l + iw} y2={y2(0)} stroke="#52525b" />
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + ih} stroke="#52525b" />
          {/* clamp lines */}
          <line x1={pad.l} y1={y2(10)} x2={pad.l + iw} y2={y2(10)} stroke="#10b981" strokeDasharray="3 3" opacity="0.6" />
          <line x1={pad.l} y1={y2(-10)} x2={pad.l + iw} y2={y2(-10)} stroke="#10b981" strokeDasharray="3 3" opacity="0.6" />
          <text x={pad.l + 6} y={y2(10) - 4} className="fill-emerald-400" style={{ fontSize: 10 }}>clamp = ±10</text>
          {/* unclamped */}
          <path d={pathOf(values)} stroke="#fb7185" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d={pathOf(clamped)} stroke="#fbbf24" strokeWidth="2" fill="none" />
          {/* axis */}
          <text x={pad.l - 6} y={y2(0) + 3} textAnchor="end" className="fill-neutral-500 font-mono" style={{ fontSize: 9 }}>0</text>
          <text x={pad.l - 6} y={y2(10) + 3} textAnchor="end" className="fill-neutral-500 font-mono" style={{ fontSize: 9 }}>10</text>
          <text x={pad.l + iw / 2} y={H - 4} textAnchor="middle" className="fill-neutral-500" style={{ fontSize: 10 }}>x = y input range</text>
          <g transform={`translate(${pad.l + iw - 170}, ${pad.t + 4})`}>
            <rect width="160" height="40" fill="#0a0a0a" stroke="#ffffff22" rx="3" />
            <line x1="10" y1="14" x2="26" y2="14" stroke="#fb7185" strokeWidth="1.5" />
            <text x="32" y="18" className="fill-rose-300" style={{ fontSize: 10 }}>unclamped SwiGLU</text>
            <line x1="10" y1="30" x2="26" y2="30" stroke="#fbbf24" strokeWidth="2" />
            <text x="32" y="34" className="fill-amber-300" style={{ fontSize: 10 }}>V4 clamp ±10</text>
          </g>
        </svg>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-neutral-400">input range</span>
          <input type="range" min={2} max={10} step={1} value={xr} onChange={(e) => setXr(+e.target.value)} className="flex-1 accent-orange-400" />
          <span className="font-mono text-orange-300">±{xr}</span>
        </div>
      </div>

      <Deeper>
        <p>
          <strong>Hash routing for the first three MoE layers.</strong> Early layers see very raw features; their learned routers are noisy and tend to oscillate. V4 sidesteps the problem by <em>not learning</em> the router at all for layers 1–3: each token's expert set is a deterministic hash of its token ID. No gradient on the routing, no collapse. Later layers switch to learned <Eq>{`\\sqrt{\\text{softplus}}`}</Eq> affinity.
        </p>
        <p>
          <strong>Why <Eq>{`\\sqrt{\\text{softplus}}`}</Eq> instead of sigmoid?</strong> Sigmoid saturates aggressively — once a gate is "on," it stays on and the router can't nudge the assignment. <Eq>{`\\sqrt{\\text{softplus}}`}</Eq> is positive but monotonically increasing without saturation; small logit changes still produce meaningful affinity changes, which keeps the learned balance elastic.
        </p>
        <p>
          <strong>Auxiliary-loss-free balancing.</strong> Inherited from V3: instead of an explicit load-balancing loss (which fights the LM loss), each expert has a learned bias that slowly adjusts so its average assignment rate matches the target. No gradient conflict.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is the clamp ±10 actually hit during training?',
          a: 'Almost never in steady state — once weights settle, SwiGLU outputs live in [-3, 3] for the vast majority of tokens. But during warmup, a single out-of-distribution activation can spike to 100+, which would overflow FP8. The clamp is a safety net, not a regularizer.' },
        { q: 'Doesn\'t anticipatory routing change the model\'s function?',
          a: 'Slightly — the router now conditions on h_{l-1} instead of h_l. In practice, the small information loss is more than paid back by the stability gain. The router was mostly reading large-scale features anyway; those are already present in h_{l-1}.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 8 — FP4 quantization-aware training (MXFP4)
// ============================================================================

const FP4 = () => {
  // FP4 E2M1 representable non-negative values (paired negatives).
  // Common list: ±0, ±0.5, ±1, ±1.5, ±2, ±3, ±4, ±6
  const FP4_VALUES = [-6, -4, -3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3, 4, 6];

  // Demo weight block: 32 values in BF16 range
  const block = useMemo(() => {
    const r = [];
    for (let i = 0; i < 32; i++) {
      r.push(1.6 * Math.sin(i * 0.83 + 1.7) + 0.9 * Math.cos(i * 1.9) + 0.12 * Math.sin(i * 5.3));
    }
    return r;
  }, []);

  // MXFP4 flow: pick per-block FP8 scale so the biggest absolute value maps near the top of FP4 range (6).
  const absMax = Math.max(...block.map((v) => Math.abs(v)));
  const scale = absMax / 6; // one scale per 32-element block
  const quantized = block.map((v) => {
    const scaled = v / scale;
    // nearest FP4 value
    let best = FP4_VALUES[0], bestE = Infinity;
    for (const q of FP4_VALUES) {
      const e = Math.abs(scaled - q);
      if (e < bestE) { bestE = e; best = q; }
    }
    return best * scale;
  });
  const err = block.map((v, i) => v - quantized[i]);
  const sse = Math.sqrt(err.reduce((a, b) => a + b * b, 0) / err.length);

  return (
    <Card id="fp4" icon={Binary} title="FP4 quantization-aware training" subtitle="Train in the precision you'll deploy in — no accuracy cliff at inference time" accent="amber" index={8} source="§5 FP4 QAT">
      <MinSchema>
        Store weights as 4-bit <Term>MXFP4</Term> during training. Forward pass sees the quantized weights;
        backward pass updates full-precision masters.
      </MinSchema>

      <p>
        Every bit you throw at a weight matters <em>twice</em>: once for memory, once for throughput. Going from BF16 → FP8 halves both; FP8 → FP4 halves both again. The catch is that 4-bit-only training historically loses several points of quality. V4 closes that gap with three tricks: a <em>per-block</em> FP8 scale factor (<Term>MXFP4</Term>), <Term>QAT</Term> that exposes quantization error to the optimizer, and keeping high-precision master weights for the gradient step.
      </p>

      <Block>{`\\text{MXFP4 block:}\\quad \\co{\\tilde{W}_i} = s \\cdot q_i,\\quad q_i \\in \\{\\pm 0, \\pm 0.5, \\pm 1, \\pm 1.5, \\pm 2, \\pm 3, \\pm 4, \\pm 6\\},\\quad s \\in \\text{FP8},\\quad i = 1\\ldots\\num{32}`}</Block>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap">
          <div className="text-sm text-neutral-200">One 32-element block, quantized</div>
          <div className="text-[11px] text-neutral-500 font-mono">
            block max = {absMax.toFixed(3)} · scale = {scale.toFixed(4)} · RMS error = {sse.toFixed(3)}
          </div>
        </div>

        {/* Weight values bar chart */}
        <svg viewBox="0 0 640 110" className="w-full h-auto block">
          {/* zero line */}
          <line x1="0" y1="55" x2="640" y2="55" stroke="#404040" />
          {block.map((v, i) => {
            const w = 640 / 32;
            const cx = i * w;
            const orig = 55 - v * 15;
            const q = 55 - quantized[i] * 15;
            return (
              <g key={i}>
                {/* original value */}
                <line x1={cx + w * 0.35} y1={55} x2={cx + w * 0.35} y2={orig} stroke="#71717a" strokeWidth="1.5" />
                <circle cx={cx + w * 0.35} cy={orig} r="2.2" fill="#a1a1aa" />
                {/* quantized value */}
                <line x1={cx + w * 0.65} y1={55} x2={cx + w * 0.65} y2={q} stroke="#f59e0b" strokeWidth="1.5" />
                <circle cx={cx + w * 0.65} cy={q} r="2.2" fill="#fbbf24" />
              </g>
            );
          })}
          <text x="0" y="10" className="fill-neutral-400" style={{ fontSize: 10 }}>● BF16 original</text>
          <text x="90" y="10" className="fill-amber-300" style={{ fontSize: 10 }}>● FP4 reconstructed</text>
        </svg>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <Stat label="per value" value="4 bits" sub="15 codes (E2M1)" color="text-amber-300" />
          <Stat label="block scale" value="FP8" sub="1 per 32 values" color="text-sky-300" />
          <Stat label="amortized bits" value="~4.25" sub="vs BF16 = 16" color="text-emerald-300" />
          <Stat label="vs BF16" value="3.8×" sub="smaller, faster" color="text-emerald-300" />
        </div>
      </div>

      <p>
        The key insight of <Term>MXFP4</Term>: instead of quantizing each weight independently (which would need a wide range per weight), you batch 32 weights, find the block max, and pick a single FP8 scale that aligns <em>that</em> block's range with the FP4 codes' range. Blocks with small outliers don't waste bits.
      </p>

      <Deeper>
        <p>
          <strong>What QAT actually does.</strong> In the forward pass, weights are quantized on-the-fly: <Eq>{`\\co{\\tilde W} = \\text{round}_{\\text{MXFP4}}(W)`}</Eq>. Loss is computed with <Eq>{`\\co{\\tilde W}`}</Eq>. In the backward pass, gradient flows through the straight-through estimator (<Eq>{`\\nabla \\co{\\tilde W} \\approx \\nabla W`}</Eq>), and the update is applied to the <em>full-precision master</em> <Eq>{`W`}</Eq>. The next forward pass re-quantizes from <Eq>{`W`}</Eq>. So the model learns weights that <em>survive</em> quantization — not just weights that happen to be near FP4 grid points.
        </p>
        <p>
          <strong>Where FP4 is actually applied.</strong> V4 uses MXFP4 for MoE expert weights (the bulk of the parameter count) and for the lightning indexer's QK path (the bulk of attention compute). Attention Q/K/V projections on the main path stay in FP8, and optimizer state + activations stay in BF16. It's not a single-precision model — it's a precision <em>hierarchy</em>, tuned to where the accuracy cost is lowest.
        </p>
        <p>
          <strong>Scale factor hardware.</strong> Hopper and Blackwell GPUs have native MXFP4 and MXFP8 paths — tensor cores that accept the (FP4 values, FP8 scale) pair and fuse the rescale into the matmul. That's why the ~3.8× memory saving translates almost 1-to-1 into throughput.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Doesn\'t FP4 destroy outliers?',
          a: 'That\'s exactly why you need the per-block FP8 scale. A block with one 6σ outlier picks a larger scale, which stretches the FP4 grid to cover it. You lose a little resolution on the small values in that block, but you keep the outlier — which in Transformers is often the informative signal.' },
        { q: 'If weights are 4-bit, why are activations still BF16?',
          a: 'Activations have a dynamic range that shifts per forward pass and is hard to calibrate per batch. Weights are static during the forward pass, so their ranges are known and compressible. V4 does quantize some activations to FP8 on the indexer path; BF16 elsewhere is a stability choice.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 7 — Muon optimizer (Newton-Schulz orthogonalization)
// ============================================================================

const Muon = () => {
  // Simulate Newton-Schulz on a scalar singular value x ∈ [0, 1.5]
  // Paper's 2-stage coefficients:
  const stage1 = [3.4445, -4.7750, 2.0315];
  const stage2 = [2.0, -1.5, 0.5];
  // p(x) = a x + b x^3 + c x^5
  const ns = (x, [a, b, c]) => a * x + b * x ** 3 + c * x ** 5;

  // Curve data
  const xs = Array.from({ length: 121 }, (_, i) => (i / 120) * 1.5);
  const trace = (coef, iters) => xs.map((x0) => {
    let y = x0;
    for (let t = 0; t < iters; t++) y = ns(y, coef);
    return y;
  });

  const [stage1Iters, setStage1Iters] = useState(5);
  const [stage2Iters, setStage2Iters] = useState(5);
  const hybrid = useMemo(() => {
    return xs.map((x0) => {
      let y = x0;
      for (let t = 0; t < stage1Iters; t++) y = ns(y, stage1);
      for (let t = 0; t < stage2Iters; t++) y = ns(y, stage2);
      return y;
    });
  }, [xs, stage1Iters, stage2Iters]);

  // Layout
  const W = 640, H = 220;
  const pad = { l: 36, r: 10, t: 10, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x2px = (x) => pad.l + (x / 1.5) * innerW;
  const y2px = (y) => pad.t + innerH - Math.min(Math.max(y, 0), 1.6) / 1.6 * innerH;
  const pathOf = (arr) => arr.map((y, i) => `${i === 0 ? 'M' : 'L'}${x2px(xs[i])},${y2px(y)}`).join(' ');

  return (
    <Card id="muon" icon={Rocket} title="The Muon optimizer" subtitle="Orthogonalize the update, don't just follow the gradient" accent="emerald" index={7} source="§4 optimizer">
      <MinSchema>
        Before stepping, project each matrix update onto the closest orthogonal matrix. Ten Newton-Schulz iterations, no SVD, no FP32.
      </MinSchema>

      <p>
        AdamW scales each coordinate independently — fine for embeddings, wasteful for 2D weight matrices whose <em>directions</em> matter as much as their magnitudes. <Term>Muon</Term>'s observation: if you compute the gradient <Eq>{`G = \\nabla_W \\mathcal{L}`}</Eq>, the update you actually want is <Eq>{`UV^\\top`}</Eq> where <Eq>{`G = U\\Sigma V^\\top`}</Eq> is the SVD of <Eq>{`G`}</Eq>. That's the "matrix sign" — every singular value pinned to 1, every direction preserved. SVD is too slow; Newton-Schulz approximates it with just matrix multiplies.
      </p>

      <Block>{`\\text{Muon step:}\\quad W \\leftarrow W - \\eta\\, \\mathrm{ortho}(G),\\qquad \\mathrm{ortho}(G) \\approx p_{\\num{2}}\\!\\bigl(p_{\\num{1}}(G / \\|G\\|_F)\\bigr)`}</Block>

      <Block>{`p_k(X) = a_k X + b_k\\, X X^\\top X + c_k\\, (X X^\\top)^2 X\\qquad\\text{(odd polynomial in the singular values)}`}</Block>

      {/* Interactive NS curve */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[11px] text-neutral-500 mb-2">
          Newton–Schulz drives singular values toward 1. The x-axis is a single singular value <Eq>{`\\sigma`}</Eq>; each curve shows the output after <span className="font-mono">stage-1</span> + <span className="font-mono">stage-2</span> iterations.
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* axes */}
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#52525b" />
          <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#52525b" />
          {[0, 0.5, 1, 1.5].map((x) => (
            <g key={x}>
              <line x1={x2px(x)} y1={pad.t + innerH} x2={x2px(x)} y2={pad.t + innerH + 4} stroke="#52525b" />
              <text x={x2px(x)} y={pad.t + innerH + 16} textAnchor="middle" className="fill-neutral-500 font-mono" style={{ fontSize: 9 }}>{x}</text>
            </g>
          ))}
          {[0, 0.5, 1, 1.5].map((y) => (
            <g key={y}>
              <line x1={pad.l - 4} y1={y2px(y)} x2={pad.l} y2={y2px(y)} stroke="#52525b" />
              <text x={pad.l - 8} y={y2px(y) + 3} textAnchor="end" className="fill-neutral-500 font-mono" style={{ fontSize: 9 }}>{y}</text>
            </g>
          ))}
          {/* y=1 target line */}
          <line x1={pad.l} y1={y2px(1)} x2={pad.l + innerW} y2={y2px(1)} stroke="#10b981" strokeDasharray="4 4" opacity="0.5" />
          <text x={pad.l + innerW - 4} y={y2px(1) - 4} textAnchor="end" className="fill-emerald-400" style={{ fontSize: 10 }}>target σ = 1</text>
          {/* identity */}
          <path d={`M${x2px(0)},${y2px(0)} L${x2px(1.5)},${y2px(1.5)}`} stroke="#525252" strokeDasharray="2 3" />
          {/* stage1 only */}
          <path d={pathOf(trace(stage1, stage1Iters))} stroke="#f59e0b" strokeWidth="1.2" fill="none" opacity="0.75" />
          {/* stage2 only */}
          <path d={pathOf(trace(stage2, stage2Iters))} stroke="#0ea5e9" strokeWidth="1.2" fill="none" opacity="0.55" />
          {/* hybrid */}
          <path d={pathOf(hybrid)} stroke="#34d399" strokeWidth="2.1" fill="none" />
          {/* legend */}
          <g transform={`translate(${pad.l + innerW - 200}, ${pad.t + 10})`}>
            <rect width="190" height="58" fill="#0a0a0a" stroke="#ffffff22" rx="4" />
            <line x1="10" y1="18" x2="30" y2="18" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="36" y="22" className="fill-amber-300" style={{ fontSize: 10 }}>stage 1 only (3.44, −4.77, 2.03)</text>
            <line x1="10" y1="32" x2="30" y2="32" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="36" y="36" className="fill-sky-300" style={{ fontSize: 10 }}>stage 2 only (2, −1.5, 0.5)</text>
            <line x1="10" y1="46" x2="30" y2="46" stroke="#34d399" strokeWidth="2" />
            <text x="36" y="50" className="fill-emerald-300" style={{ fontSize: 10 }}>hybrid — stage 1 then 2</text>
          </g>
        </svg>

        <div className="grid md:grid-cols-2 gap-4 mt-3 text-xs">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-neutral-400">stage-1 iterations</span>
              <span className="font-mono text-amber-300">{stage1Iters}</span>
            </div>
            <input type="range" min={0} max={10} step={1} value={stage1Iters} onChange={(e) => setStage1Iters(+e.target.value)} className="w-full accent-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-neutral-400">stage-2 iterations</span>
              <span className="font-mono text-sky-300">{stage2Iters}</span>
            </div>
            <input type="range" min={0} max={10} step={1} value={stage2Iters} onChange={(e) => setStage2Iters(+e.target.value)} className="w-full accent-sky-400" />
          </div>
        </div>
        <p className="mt-3 text-[12px] text-neutral-400 leading-snug">
          <strong className="text-amber-300">Stage 1</strong> is aggressive but overshoots near <Eq>{`\\sigma=\\num{1}`}</Eq>. <strong className="text-sky-300">Stage 2</strong> is gentle and cleans up. Compose them (the <span className="text-emerald-300">green</span> curve) and you get a sharp step function — every singular value, big or tiny, is driven to 1 in ten total matrix multiplies per step.
        </p>
      </div>

      <Deeper>
        <p>
          <strong>Why orthogonalize at all?</strong> Think of an optimizer step as "how much of the gradient to apply." AdamW scales it per-parameter. Muon scales it per-<em>direction</em>: big directions get the same step size as small ones. For a weight matrix, that means every singular direction of the update contributes equally, so the step is the cleanest possible trust-region move in parameter space.
        </p>
        <p>
          <strong>Where Muon is used.</strong> Only on 2D <em>hidden</em> weights — attention's <Eq>{`Q/K/V/O`}</Eq> projections, MoE experts' MLPs. Embeddings, norms, and the output unembedding stay with AdamW (1D parameters have no notion of "direction"). The hybrid optimizer gets the best of both.
        </p>
        <p>
          <strong>Why 10 iterations and two polynomials?</strong> Stage-1's coefficients (3.4445, −4.7750, 2.0315) come from minimizing the max deviation from <Eq>{`1`}</Eq> over the full interval — they converge <em>fast</em> but oscillate near 1. Stage-2's (2, −1.5, 0.5) is the classical Newton-Schulz for the matrix sign; it has perfect fixed point at 1 but converges slowly for small <Eq>{`\\sigma`}</Eq>. Ten iterations across the two stages is the sweet spot.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is Muon faster or slower per step than AdamW?',
          a: 'Per-step, slightly slower — those 10 matrix multiplies aren\'t free. But the effective learning rate is larger and more stable, so you reach the same loss in fewer tokens. Net: ~20% fewer tokens-to-target loss on hidden weights per the paper.' },
        { q: 'Does Muon need FP32?',
          a: 'No — BF16 is enough for Newton-Schulz here, which is one of the reasons V4 can afford to run it every step. The FP32 master weights still exist (in the optimizer state), but the NS polynomial is a BF16-compatible operation.' },
        { q: 'Why not just use the exact SVD?',
          a: 'Cost. For a 7168×7168 matrix, SVD is ~seconds on a GPU; 10 matrix multiplies is ~milliseconds. At every step × thousands of matrices × millions of steps, the constant factor is the difference between a training run that finishes and one that doesn\'t.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 6 — Manifold-Constrained Hyper-Connections (mHC)
// ============================================================================

// Interactive Sinkhorn-Knopp: project a 4x4 random positive matrix onto Birkhoff.
const useSinkhorn = (seed) => {
  const orig = useMemo(() => {
    // deterministic pseudo-random positive 4x4
    const s = seed || 1;
    const rand = (i, j) => 0.05 + 0.95 * ((Math.sin(s * 11.1 + i * 3.7 + j * 5.9) + 1) / 2) ** 2;
    return Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => rand(i, j)));
  }, [seed]);
  return orig;
};

const MHC = () => {
  const [seed, setSeed] = useState(2);
  const [iter, setIter] = useState(0);
  const orig = useSinkhorn(seed);

  // Compute Sinkhorn-Knopp iterations up to `iter`.
  const mat = useMemo(() => {
    let M = orig.map((r) => r.slice());
    for (let t = 0; t < iter; t++) {
      // row normalize
      for (let i = 0; i < 4; i++) {
        const s = M[i].reduce((a, b) => a + b, 0);
        for (let j = 0; j < 4; j++) M[i][j] /= s;
      }
      // col normalize
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let i = 0; i < 4; i++) s += M[i][j];
        for (let i = 0; i < 4; i++) M[i][j] /= s;
      }
    }
    return M;
  }, [orig, iter]);

  const rowSums = mat.map((r) => r.reduce((a, b) => a + b, 0));
  const colSums = [0, 1, 2, 3].map((j) => mat.reduce((a, r) => a + r[j], 0));
  const maxErr = Math.max(
    ...rowSums.map((s) => Math.abs(s - 1)),
    ...colSums.map((s) => Math.abs(s - 1)),
  );

  const cell = (v, i, j) => (
    <td key={j} className="relative p-0">
      <div className="w-14 h-10 flex items-center justify-center border border-white/10 bg-white/[0.01]" style={{
        backgroundColor: `rgba(196, 181, 253, ${0.08 + v * 0.75})`,
      }}>
        <span className="text-[11px] font-mono text-violet-50">{v.toFixed(2)}</span>
      </div>
    </td>
  );

  return (
    <Card id="mhc" icon={Network} title="Manifold-Constrained Hyper-Connections" subtitle="Why V4's residual stream can't accidentally blow up or die out" accent="violet" index={6} source="§3.4 mHC">
      <MinSchema>
        Widen the residual stream into <Eq>{`n_{\\text{hc}}=\\num{4}`}</Eq> parallel tracks,
        then mix them with a doubly-stochastic matrix. Spectral norm stays <Eq>{`\\le 1`}</Eq> by construction.
      </MinSchema>

      <p>
        Deep Transformers live or die on the stability of the <Term>residual stream</Term>. Each layer's output is added back: a tiny amplification factor <Eq>{`\\vi{\\alpha}>1`}</Eq> per layer, compounded 60 times, explodes; one slightly below 1 collapses. Standard residuals bet that initialization and norm layers keep <Eq>{`\\vi{\\alpha} \\approx 1`}</Eq>. mHC replaces that bet with a <em>constraint</em>.
      </p>

      <Block>{`\\text{HC:}\\quad \\vi{h^{(l+1)}} = B_l\\, \\vi{h^{(l)}} + W_l\\, f_l(\\vi{h^{(l)}}),\\qquad \\vi{h^{(l)}} \\in \\mathbb{R}^{n_{\\text{hc}} \\times d}`}</Block>

      <p>
        Here <Eq>{`B_l \\in \\mathbb{R}^{n_{\\text{hc}} \\times n_{\\text{hc}}}`}</Eq> is a small mixing matrix between the parallel residual tracks. If <Eq>{`B_l`}</Eq>'s largest singular value — its <Term>spectral norm</Term> — exceeds 1, the residual stream grows geometrically through depth. mHC's trick: constrain <Eq>{`B_l`}</Eq> to live on the <Term>Birkhoff polytope</Term>, i.e. the set of <Term>doubly stochastic</Term> matrices. Every such matrix has <Eq>{`\\|B\\|_2 \\le 1`}</Eq>. Done.
      </p>

      <Block>{`\\mathcal{B}_n = \\{B \\in \\mathbb{R}_{\\ge 0}^{n \\times n} : B \\mathbf{1} = \\mathbf{1},\\ \\mathbf{1}^\\top B = \\mathbf{1}^\\top\\}\\qquad \\Rightarrow\\qquad \\|B\\|_2 \\le 1`}</Block>

      {/* Sinkhorn demo */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap mb-2">
          <div className="text-sm text-neutral-200">Sinkhorn-Knopp, live</div>
          <div className="text-[11px] text-neutral-500 font-mono">max row/col deviation from 1 · <span className={maxErr < 1e-3 ? 'text-emerald-300' : 'text-amber-300'}>{maxErr.toExponential(2)}</span></div>
        </div>
        <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
          <table className="border-separate border-spacing-0 rounded-md overflow-hidden">
            <tbody>
              {mat.map((row, i) => (
                <tr key={i}>
                  {row.map((v, j) => cell(v, i, j))}
                  <td className="pl-2 text-[10px] text-neutral-400 font-mono">Σ={rowSums[i].toFixed(3)}</td>
                </tr>
              ))}
              <tr>
                {colSums.map((s, j) => (
                  <td key={j} className="text-center pt-1 text-[10px] text-neutral-400 font-mono">Σ={s.toFixed(2)}</td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-neutral-300">Sinkhorn iterations</span>
                <span className="font-mono text-violet-300">{iter}</span>
              </div>
              <input type="range" min={0} max={12} step={1} value={iter} onChange={(e) => setIter(+e.target.value)} className="w-full accent-violet-400" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setSeed((s) => s + 1); setIter(0); }}
                className="px-2 py-1 rounded-md border border-violet-400/25 bg-violet-500/10 text-[11px] text-violet-200 hover:bg-violet-500/20">
                random B₀
              </button>
              <button onClick={() => setIter(12)}
                className="px-2 py-1 rounded-md border border-emerald-400/25 bg-emerald-500/10 text-[11px] text-emerald-200 hover:bg-emerald-500/20">
                project to Birkhoff
              </button>
            </div>
            <p className="text-neutral-400 leading-snug">
              Each iteration does one row-normalize + one column-normalize. After a handful of rounds, every row and column sums to <span className="font-mono text-violet-300">1</span> — the matrix is <em>doubly stochastic</em> and its spectral norm is <Eq>{`\\le \\num{1}`}</Eq>. That's the projection mHC applies every forward pass.
            </p>
          </div>
        </div>
      </div>

      <Deeper>
        <p>
          <strong>Why widen the residual at all?</strong> A single residual stream forces every layer to read and write to the same vector. Hyper-Connections widen it to <Eq>{`n_{\\text{hc}}`}</Eq> parallel copies, so different layers can deposit in different tracks and a later layer can read a subset. It's free parameter-wise (the total hidden dimension is unchanged — <Eq>{`d_{\\text{stream}}/n_{\\text{hc}}`}</Eq> per track), but it expands the residual's expressive capacity.
        </p>
        <p>
          <strong>Why <em>doubly</em> stochastic, not just row-stochastic?</strong> Row-stochastic gives a transition matrix (every row a distribution). Doubly stochastic is strictly stronger: every track also <em>receives</em> exactly one unit of mass across its column. Physically: information doesn't pile up on one track while the others starve.
        </p>
        <p>
          <strong>Is the projection differentiable?</strong> Yes — Sinkhorn-Knopp is a composition of normalizations, all differentiable. In practice V4 runs 3–5 Sinkhorn steps as part of the forward pass, and gradients flow through them. It's essentially a learned projection with a fixed convergence budget.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does spectral norm ≤ 1 matter for stability?',
          a: 'Call the per-layer residual update h ← Bh + Wf(h). If ‖B‖₂ > 1, then iterating this across L layers can grow the residual by up to ‖B‖₂^L. For L=61, even a norm of 1.05 compounds to ~20×. mHC makes that impossible.' },
        { q: 'Doesn\'t a norm ≤ 1 also kill gradient flow?',
          a: 'It would if B were the only path. But the residual sum is B·h + W·f(h) — the W·f(h) branch can amplify freely. mHC only bounds the pure skip path, which is where blowups actually come from in deep Transformers.' },
        { q: 'Where does the learning happen, then?',
          a: 'In the W_l matrices and f_l (attention/MLP) of each layer. B_l is a soft learned permutation over residual tracks — it still carries gradient, but its role is "traffic routing," not "amplification."' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 5 — Hybrid interleaving
// ============================================================================

const Hybrid = () => {
  // 1 of every 4 layers is CSA in V4-Pro (61 layers). Render a schematic strip.
  const nLayers = 61;
  const pattern = (i) => (i % 4 === 2 ? 'CSA' : 'HCA'); // simplified
  const cells = Array.from({ length: nLayers }, (_, i) => pattern(i));
  const W = 720, H = 70;
  const cellW = (W - 24) / nLayers;

  return (
    <Card id="hybrid" icon={GitBranch} title="Interleaving CSA and HCA" subtitle="Most layers see a cheap blur; every 4th layer gets a sharp top-k" accent="fuchsia" index={5} source="§3.3 hybrid">
      <MinSchema>
        The stack is <span className="font-mono text-cyan-300">HCA</span>-heavy. One out of every four layers
        is a <span className="font-mono text-sky-300">CSA</span> layer, where the model can "zoom in."
      </MinSchema>

      <p>
        CSA and HCA aren't competitors — they're specialists. V4 puts them in a ratio of roughly <Eq>{`\\num{3}\\text{ HCA} : \\num{1}\\text{ CSA}`}</Eq>, interleaved through depth. The model ends up with many cheap "what's in this region" passes and a handful of precise "find the exact token" passes. Every CSA layer receives the already-summarized context from the HCA layers before it, so its top-k is ranking <em>semantically grouped</em> blocks rather than raw noisy tokens.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[11px] text-neutral-500 mb-2 flex items-baseline justify-between">
          <span>61 layers · V4-Pro</span>
          <span className="font-mono">
            <span className="text-cyan-300">■ HCA</span> <span className="ml-3 text-sky-300">■ CSA</span>
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {cells.map((c, i) => (
            <g key={i}>
              <rect x={12 + i * cellW} y={10} width={cellW - 1} height={32}
                fill={c === 'CSA' ? '#38bdf8' : '#22d3ee'} opacity={c === 'CSA' ? 0.95 : 0.4} />
              {c === 'CSA' && (
                <text x={12 + i * cellW + cellW / 2} y={56} textAnchor="middle" className="fill-sky-300" style={{ fontSize: 8, fontFamily: 'ui-monospace, monospace' }}>{i}</text>
              )}
            </g>
          ))}
          <text x={12} y={70 - 2} className="fill-neutral-500" style={{ fontSize: 9 }}>input</text>
          <text x={W - 20} y={70 - 2} textAnchor="end" className="fill-neutral-500" style={{ fontSize: 9 }}>→ output</text>
        </svg>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/[0.04] p-3 text-[13px]">
          <div className="text-cyan-300 text-xs uppercase tracking-widest">what HCA layers do</div>
          <ul className="mt-2 space-y-1.5 text-neutral-300 list-disc pl-5 marker:text-cyan-500/70">
            <li>Keep a blurry, cheap "summary tape" of the whole context.</li>
            <li>Refresh that tape as representations evolve through depth.</li>
            <li>Dense softmax over tiny cache → easy to fuse into one kernel.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-sky-400/20 bg-sky-500/[0.04] p-3 text-[13px]">
          <div className="text-sky-300 text-xs uppercase tracking-widest">what CSA layers do</div>
          <ul className="mt-2 space-y-1.5 text-neutral-300 list-disc pl-5 marker:text-sky-500/70">
            <li>Pick the handful of compressed blocks that actually matter for this query.</li>
            <li>Run fine-grained attention on them (m = 4, near-token detail).</li>
            <li>Do the heavy lifting for retrieval, copying, long-range coreference.</li>
          </ul>
        </div>
      </div>

      <Deeper>
        <p>
          <strong>Why not more CSA?</strong> CSA is the expensive one. The indexer, the top-k, and the gather of k blocks per query all cost more than dense attention over ~8 K entries. V4 tunes the ratio so that, at 1 M context, the total attention budget is ≈ 27% of V3.2's — the FLOPs savings come almost entirely from <em>fewer</em> CSA layers, not from faster kernels.
        </p>
        <p>
          <strong>Position information.</strong> HCA summaries blur positions within each 128-token block, but their <em>ordering</em> (block 17 before block 18) is preserved via <Term>RoPE</Term> applied to the compressed entries. CSA layers use RoPE on the raw tokens within their selected blocks — that's where millimeter-accurate positions come from.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What happens if I remove the CSA layers and use HCA only?',
          a: 'The model becomes a strong coarse summarizer but loses at anything needing exact retrieval. The paper reports a ~6 point drop on needle-in-a-haystack tasks with HCA-only. The CSA layers are the "sharp edge" of the hybrid.' },
        { q: 'Can different heads within a layer use different compressions?',
          a: 'In V4 the compression is a property of the layer, not the head. All heads in a CSA layer share the top-k selection (because the indexer sees the whole query). This is deliberate — it makes the kernel layout identical for every head and keeps the compressed KV cache layer-uniform.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 4 — Heavily Compressed Attention (HCA)
// ============================================================================

const HCAViz = () => {
  const mPrime = 128;
  const tokens = 1024;
  const entries = tokens / mPrime; // 8

  const W = 720, H = 150;
  const leftPad = 12, rightPad = 12;
  const tokRow = 30, entRow = 90;
  const tokW = (W - leftPad - rightPad) / tokens;
  const entW = (W - leftPad - rightPad) / entries;

  return (
    <Card id="hca" icon={Waves} title="Heavily Compressed Attention · HCA" subtitle="Same idea as CSA, cranked past the point where top-k is worth the bookkeeping" accent="cyan" index={4} source="§3.2 HCA">
      <MinSchema>
        Push compression hard enough (<Eq>{`m'=\\num{128}`}</Eq>) and the compressed cache is so short that
        you can afford to attend to <em>all</em> of it. No top-k, no indexer, no selection.
      </MinSchema>

      <p>
        CSA's main cost-center is the indexer-and-selection plumbing. HCA asks: what if we compress so aggressively that the whole compressed cache is small enough to fit under a dense softmax? At <Eq>{`m' = \\num{128}`}</Eq>, a 1 M-token context becomes ~<Eq>{`\\num{7800}`}</Eq> entries — short enough that dense attention over it is cheaper than a sparse top-k over a less-compressed cache.
      </p>

      <Block>{`\\text{HCA:}\\quad \\co{\\tilde{K}_b},\\co{\\tilde{V}_b} = \\text{MLP}'_{\\text{comp}}\\bigl([K_{bm'\\ldots (b{+}1)m'-1}; V_{bm'\\ldots (b{+}1)m'-1}]\\bigr),\\qquad \\fu{o} = \\sum_{b=0}^{n/m'-1} \\mathrm{softmax}(q^\\top \\tilde{K}_b/\\sqrt{d})\\, \\tilde{V}_b`}</Block>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[11px] text-neutral-500 font-mono mb-2">
          1024 tokens → {entries} HCA entries · compression m′ = {mPrime}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* 1024 token row */}
          <text x={leftPad} y={tokRow - 8} className="fill-neutral-500" style={{ fontSize: 10 }}>raw tokens · {tokens}</text>
          {Array.from({ length: tokens }).map((_, i) => (
            <rect key={i} x={leftPad + i * tokW} y={tokRow} width={tokW} height={14} fill="#3f3f46" opacity={0.5 + 0.3 * Math.sin(i * 0.07)} />
          ))}

          {/* Funnel lines */}
          {Array.from({ length: entries }).map((_, b) => {
            const sx = leftPad + (b + 0.5) * (tokens / entries) * tokW;
            const ex = leftPad + (b + 0.5) * entW;
            return (
              <path key={b} d={`M${sx},${tokRow + 14} C${sx},${tokRow + 30} ${ex},${entRow - 15} ${ex},${entRow}`}
                fill="none" stroke="#7dd3fc" strokeWidth="0.9" opacity="0.55" />
            );
          })}

          {/* HCA entry row */}
          <text x={leftPad} y={entRow - 8} className="fill-neutral-500" style={{ fontSize: 10 }}>HCA entries · {entries}</text>
          {Array.from({ length: entries }).map((_, b) => (
            <g key={b}>
              <rect x={leftPad + b * entW + 3} y={entRow} width={entW - 6} height={24} rx={3} fill="#22d3ee" opacity={0.75} />
              <text x={leftPad + b * entW + entW / 2} y={entRow + 16} textAnchor="middle" className="fill-cyan-950" style={{ fontSize: 10, fontWeight: 600 }}>{mPrime}→1</text>
            </g>
          ))}

          {/* Arrow showing dense attention */}
          <line x1={leftPad} y1={entRow + 36} x2={W - rightPad} y2={entRow + 36} stroke="#f0abfc" strokeDasharray="3 3" opacity="0.55" />
          <text x={W / 2} y={entRow + 32} textAnchor="middle" className="fill-fuchsia-300" style={{ fontSize: 10 }}>
            dense softmax over all {entries} entries — no top-k needed
          </text>
        </svg>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-2">
        <Stat label="CSA · m" value="4" sub="compress lightly, then top-k" color="text-sky-300" />
        <Stat label="HCA · m′" value="128" sub="compress hard, attend densely" color="text-cyan-300" />
        <Stat label="HCA entries at 1M ctx" value="~7.8K" sub="fits comfortably under full softmax" color="text-emerald-300" />
      </div>

      <Deeper>
        <p>
          <strong>Why two compressions that trade off?</strong> CSA preserves local detail (low <Eq>{`m`}</Eq>) but pays for top-k machinery; HCA loses detail (high <Eq>{`m'`}</Eq>) but doesn't need selection at all. Layers that need fine-grained positional lookups (e.g. copying, retrieval-like queries) want CSA. Layers that mostly do coarse semantic aggregation can live with HCA — and save the selection cost.
        </p>
        <p>
          <strong>HCA is dense, not sparse.</strong> Important nuance: HCA is <em>not</em> a sparse attention. It's a dense attention over a <em>small</em> cache. That's a much simpler kernel, no gather/scatter, no variable-length batches. It's mostly why V4's sparse-attention kernels fit in a single mega-kernel instead of a chain of custom ops.
        </p>
        <p>
          <strong>What gets thrown away.</strong> Each HCA entry is a single learned summary of 128 consecutive tokens. You can't recover token-level positions from it. The hybrid layer design leans on CSA layers to carry position-sensitive information; HCA layers focus on "what was this region about."
        </p>
      </Deeper>

      <QA items={[
        { q: 'If HCA is just "dense attention over a tiny cache," is it still cheaper than CSA?',
          a: 'Usually yes at long context. CSA cost scales with k (the top-k); HCA cost scales with n/m\'. As long as n/m\' < k (which happens past a few hundred k tokens), HCA wins on raw FLOPs per layer — and it wins on engineering simplicity at every length.' },
        { q: 'Why not use a sliding window for the cheap layers instead?',
          a: 'Sliding windows lose global information entirely beyond the window. HCA keeps global reach (every past region contributes a summary); it just blurs it. For tasks like "was this fact mentioned 300K tokens ago," a blurry summary is strictly better than nothing.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 3 — Compressed Sparse Attention (CSA)
// ============================================================================

const CSAViz = () => {
  // Compression ratio m: how many tokens collapse into one KV entry.
  // Top-k: how many compressed entries the query selects.
  const [m, setM] = useState(4);
  const [k, setK] = useState(8);
  const [hoverBlock, setHoverBlock] = useState(null);

  const nTokens = 64;           // display context length
  const nBlocks = nTokens / m;  // compressed entries
  const query = nTokens - 1;    // last token is the query

  // Deterministic "relevance" scores (pretend indexer output).
  const scores = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nBlocks; i++) {
      // Favor last few blocks + one middle peak (like a real attention pattern)
      const dist = Math.abs(i - (nBlocks - 2));
      const mid  = Math.abs(i - Math.floor(nBlocks * 0.35));
      const s = Math.exp(-dist * 0.25) + 0.7 * Math.exp(-mid * 0.6) + 0.12 * Math.sin(i * 1.9 + 0.4);
      arr.push(s);
    }
    return arr;
  }, [nBlocks]);
  const selected = useMemo(() => {
    const idx = scores.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]).slice(0, k).map(x => x[1]);
    return new Set(idx);
  }, [scores, k]);

  // Layout constants
  const W = 720, H = 210;
  const leftPad = 14, rightPad = 14;
  const rowY = { tokens: 40, blocks: 120, query: 180 };
  const tokW = (W - leftPad - rightPad) / nTokens;
  const blkW = (W - leftPad - rightPad) / nBlocks;
  const tokX = (i) => leftPad + i * tokW;
  const blkX = (i) => leftPad + i * blkW;

  const sMax = Math.max(...scores);

  return (
    <Card id="csa" icon={Scissors} title="Compressed Sparse Attention · CSA" subtitle="Collapse m consecutive tokens into one KV entry, then let each query pick its top-k blocks" accent="sky" index={3} source="§3.1 CSA">
      <MinSchema>
        Two compressions, composed: <span className="text-sky-300 font-mono">m</span>-to-1 on the <em>token</em> axis,
        then <span className="text-fuchsia-300 font-mono">k</span>-out-of-N on the <em>block</em> axis.
      </MinSchema>

      <p>
        Standard attention reads every past token. <Term>MLA</Term> shrank each token's KV vector; <Term>DSA</Term> kept the tokens but picked only a top-k of them. <Term>CSA</Term> does both — <em>first</em> compress every <Eq>{`m`}</Eq> consecutive tokens into a single KV entry with a small MLP, <em>then</em> select the top-<Eq>{`k`}</Eq> compressed entries via a tiny "lightning indexer" network. The query attends densely over those <Eq>{`k`}</Eq> chosen blocks.
      </p>

      <Block>{`\\text{CSA:}\\quad \\co{\\hat{K}_b},\\co{\\hat{V}_b} = \\text{MLP}_{\\text{comp}}\\bigl([K_{bm\\ldots (b{+}1)m-1}; V_{bm\\ldots (b{+}1)m-1}]\\bigr),\\qquad b=0,\\ldots,\\tfrac{n}{\\num{m}}-1`}</Block>

      <Block>{`\\text{Top-}k\\text{ via indexer:}\\quad \\mathcal{S}(q) = \\operatorname*{top}_{\\num{k}}\\; s_b(q),\\qquad s_b(q) = \\phi_q(q)^{\\top}\\phi_k(\\hat{K}_b)`}</Block>

      <Block>{`\\fu{o} = \\sum_{b \\in \\mathcal{S}(q)} \\mathrm{softmax}\\!\\bigl(q^\\top \\hat{K}_b / \\sqrt{d}\\bigr)\\, \\hat{V}_b`}</Block>

      {/* Interactive diagram */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap mb-2">
          <div className="text-sm text-neutral-200">Tune the knobs</div>
          <div className="text-[11px] text-neutral-500 font-mono">
            n = {nTokens} tokens · m = {m} · k = {k} · compressed blocks = {nBlocks}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-xs mb-3">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">compression <span className="font-mono text-sky-300">m</span> (tokens per block)</span>
            <input type="range" min={2} max={16} step={2} value={m} onChange={(e) => setM(+e.target.value)} className="accent-sky-400" />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono"><span>2</span><span>4</span><span>8</span><span>16</span></div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-400">top-<span className="font-mono text-fuchsia-300">k</span> selected blocks</span>
            <input type="range" min={1} max={nBlocks} step={1} value={k} onChange={(e) => setK(+e.target.value)} className="accent-fuchsia-400" />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono"><span>1</span><span>{nBlocks}</span></div>
          </label>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* Token row */}
          <text x={leftPad} y={rowY.tokens - 14} className="fill-neutral-500" style={{ fontSize: 10 }}>raw tokens · K/V</text>
          {Array.from({ length: nTokens }).map((_, i) => {
            const b = Math.floor(i / m);
            const active = selected.has(b);
            return (
              <rect
                key={i}
                x={tokX(i) + 0.5} y={rowY.tokens} width={Math.max(1, tokW - 1)} height={16}
                rx={1.5}
                fill={active ? '#7dd3fc' : '#3f3f46'}
                opacity={active ? 0.85 : 0.55}
              />
            );
          })}

          {/* Downward compression arrows */}
          {Array.from({ length: nBlocks }).map((_, b) => {
            const active = selected.has(b);
            const xa = blkX(b) + blkW / 2;
            const y1 = rowY.tokens + 16;
            const y2 = rowY.blocks - 4;
            return (
              <line key={`arr-${b}`} x1={xa} y1={y1} x2={xa} y2={y2}
                stroke={active ? '#7dd3fc' : '#52525b'}
                strokeWidth={active ? 1.25 : 0.75} opacity={active ? 0.7 : 0.35} />
            );
          })}

          {/* Block row */}
          <text x={leftPad} y={rowY.blocks - 10} className="fill-neutral-500" style={{ fontSize: 10 }}>compressed KV · {nBlocks} entries</text>
          {Array.from({ length: nBlocks }).map((_, b) => {
            const active = selected.has(b);
            const s = scores[b] / sMax;
            const hov = hoverBlock === b;
            return (
              <g key={b}
                 onMouseEnter={() => setHoverBlock(b)}
                 onMouseLeave={() => setHoverBlock(null)}
                 style={{ cursor: 'default' }}
              >
                <rect
                  x={blkX(b) + 1} y={rowY.blocks} width={blkW - 2} height={28}
                  rx={3}
                  fill={active ? 'url(#csa-grad)' : '#27272a'}
                  stroke={active ? '#38bdf8' : 'transparent'}
                  strokeWidth={active ? 1.25 : 0}
                  opacity={hov ? 1 : (active ? 0.95 : 0.55)}
                />
                {/* score bar */}
                <rect x={blkX(b) + 1} y={rowY.blocks + 28 - 4 * s} width={blkW - 2} height={4 * s}
                      fill={active ? '#f0abfc' : '#71717a'} opacity={0.9} />
              </g>
            );
          })}
          <defs>
            <linearGradient id="csa-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Indexer lines from query → blocks */}
          <text x={leftPad} y={rowY.query - 10} className="fill-neutral-500" style={{ fontSize: 10 }}>query · last token</text>
          {[...selected].map((b) => (
            <path key={`sel-${b}`}
              d={`M${tokX(query) + tokW / 2},${rowY.query} C${blkX(b) + blkW / 2},${rowY.query - 10} ${blkX(b) + blkW / 2},${rowY.blocks + 40} ${blkX(b) + blkW / 2},${rowY.blocks + 30}`}
              fill="none" stroke="#f0abfc" strokeWidth="0.9" opacity="0.6" />
          ))}

          {/* Query token */}
          <rect x={tokX(query)} y={rowY.query} width={tokW * 1.4} height={14} rx={2} fill="#f0abfc" opacity="0.95" />
          <text x={tokX(query) + tokW * 0.7} y={rowY.query + 26} textAnchor="middle" className="fill-fuchsia-200" style={{ fontSize: 9 }}>q</text>
        </svg>

        <div className="mt-2 text-[11px] text-neutral-400 leading-snug">
          Bar height under each compressed block = the <em>lightning-indexer</em> relevance score. The <span className="text-fuchsia-300">fuchsia</span> curves show the top-<span className="font-mono">{k}</span> blocks the query actually attends to. Raise <span className="font-mono">m</span> to make each block absorb more tokens; raise <span className="font-mono">k</span> to let the query see more of the past.
        </div>
      </div>

      <Deeper>
        <p>
          <strong>Why a separate "lightning indexer"?</strong> The indexer is a tiny MLP (~1% of attention FLOPs) that produces small <Eq>{`\\phi_q(q), \\phi_k(\\hat{K})`}</Eq> vectors per query and per compressed block. It exists only to rank blocks — it is never the thing that computes the output. This decouples <em>selection</em> (cheap, approximate) from <em>attention</em> (accurate, done only on the chosen blocks). The indexer path is what gets <Term>FP4</Term>-quantized most aggressively.
        </p>
        <p>
          <strong>Block-causal, not token-causal.</strong> Within a compressed block the tokens see each other (they have to, to compress), but the block as a whole is still causal: a query at position <Eq>{`t`}</Eq> only sees blocks fully ending before <Eq>{`t`}</Eq>. The very last, partially-filled block is handled with a small dense local window, so nothing is lost near the edge.
        </p>
        <p>
          <strong>Ballpark.</strong> Default V4 uses <Eq>{`m=\\num{4}`}</Eq>, <Eq>{`k=\\num{2048}`}</Eq> blocks. At 1 M context, that's <Eq>{`2048/(10^6/4) \\approx 0.8\\%`}</Eq> of the compressed entries — and <Eq>{`\\approx 3\\%`}</Eq> of the raw tokens — actually attended to per query.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If we\'re already going to top-k, why compress first?',
          a: 'Two reasons. (1) The indexer ranks many fewer candidates (n/m instead of n), so selection is m× cheaper. (2) The KV cache itself is m× smaller — memory is what actually kills long context inference, not just FLOPs.' },
        { q: 'Could we just crank m higher and skip the top-k entirely?',
          a: 'That\'s literally what the HCA layer does next door (m\'=128, no top-k). But pushing m too high loses too much detail for most heads. The elegant move is to interleave the two — see the hybrid-layers card.' },
        { q: 'Does the indexer have its own parameters we train?',
          a: 'Yes. The indexer is a small two-MLP pair learned jointly with the rest of the model. It\'s trained with an auxiliary loss that encourages its top-k ranking to match the actual attention softmax ranking — so it learns to be a good proxy for the expensive full attention.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 2 — Architecture at a glance
// ============================================================================

const ArchGlance = () => {
  // Two model sizes for the comparison table.
  const models = [
    { name: 'V4-Pro',   total: 1600, active: 49,  layers: 61, experts: 256, sharedExp: 1, routedExp: 8,
      cls: { box: 'border-sky-400/20 bg-sky-500/[0.04]', name: 'text-sky-300' } },
    { name: 'V4-Flash', total: 284,  active: 13,  layers: 33, experts: 128, sharedExp: 1, routedExp: 8,
      cls: { box: 'border-violet-400/20 bg-violet-500/[0.04]', name: 'text-violet-300' } },
  ];

  return (
    <Card id="arch" icon={Layers} title="Architecture at a glance" subtitle="Two models, same recipe — what actually changed since V3" accent="sky" index={2} source="§2 model spec">
      <MinSchema>
        V4 is V3's <Term>Mixture-of-Experts</Term> skeleton with four surgical swaps:
        <Chip color="sky">hybrid attention</Chip>
        <Chip color="violet">manifold residuals</Chip>
        <Chip color="emerald">Muon optimizer</Chip>
        <Chip color="fuchsia">FP4 training</Chip>
      </MinSchema>

      <p>
        The outer shape is familiar: a deep MoE Transformer with one shared expert, many routed ones, <Term>RMSNorm</Term>, <Term>SwiGLU</Term>, <Term>RoPE</Term>. Almost every <em>inner</em> component, though, has been replaced with something that either trains faster, serves cheaper, or stays stable at scales where the V3 recipe starts to wobble.
      </p>

      {/* Block diagram of one layer */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">one transformer layer, V3 vs V4</div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* V3 */}
          <div className="relative rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] font-mono text-neutral-400 mb-2">DeepSeek-V3.2</div>
            <div className="space-y-1.5">
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">RMSNorm</div>
              <div className="rounded-md bg-rose-500/10 border border-rose-400/20 px-2 py-1 text-xs text-rose-200">MLA attention · DSA top-k</div>
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">+ residual</div>
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">RMSNorm</div>
              <div className="rounded-md bg-rose-500/10 border border-rose-400/20 px-2 py-1 text-xs text-rose-200">MoE · sigmoid affinity</div>
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">+ residual</div>
            </div>
          </div>
          {/* V4 */}
          <div className="relative rounded-lg border border-sky-400/25 bg-sky-500/[0.04] p-3">
            <div className="text-[11px] font-mono text-sky-300 mb-2">DeepSeek-V4</div>
            <div className="space-y-1.5">
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">RMSNorm</div>
              <div className="rounded-md bg-sky-500/15 border border-sky-400/30 px-2 py-1 text-xs text-sky-100">
                <div className="flex items-baseline justify-between">
                  <span>CSA <em>or</em> HCA</span>
                  <span className="text-[9px] text-sky-300 font-mono">interleaved</span>
                </div>
              </div>
              <div className="rounded-md bg-violet-500/10 border border-violet-400/25 px-2 py-1 text-xs text-violet-200">mHC mix · B ∈ Birkhoff</div>
              <div className="rounded-md bg-neutral-800/80 border border-white/10 px-2 py-1 text-xs">RMSNorm</div>
              <div className="rounded-md bg-sky-500/15 border border-sky-400/30 px-2 py-1 text-xs text-sky-100">MoE · √softplus · hash for L≤3</div>
              <div className="rounded-md bg-violet-500/10 border border-violet-400/25 px-2 py-1 text-xs text-violet-200">mHC mix</div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
          <div><span className="text-rose-300">●</span> replaced</div>
          <div><span className="text-violet-300">●</span> new in V4</div>
        </div>
      </div>

      {/* Sizes table */}
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {models.map((m) => (
          <div key={m.name} className={`rounded-xl border ${m.cls.box} p-4`}>
            <div className="flex items-baseline justify-between">
              <div className={`${m.cls.name} font-mono text-sm`}>{m.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-neutral-500">open weights</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">total</div>
                <div className="font-mono text-xl text-neutral-100">{m.total}<span className="text-sm text-neutral-400">B</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">active / token</div>
                <div className="font-mono text-xl text-emerald-300">{m.active}<span className="text-sm text-neutral-400">B</span></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">layers</div>
                <div className="font-mono text-base text-neutral-100">{m.layers}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">routed experts</div>
                <div className="font-mono text-base text-neutral-100">{m.experts} · pick {m.routedExp}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-neutral-400">1 shared expert (always on) + {m.experts} routed, top-{m.routedExp} per token.</div>
          </div>
        ))}
      </div>

      <p>
        Both models share the same 1&nbsp;M-token context, the same attention compression, the same optimizer. <span className="text-sky-300 font-mono">V4-Pro</span> is the research-grade flagship; <span className="text-violet-300 font-mono">V4-Flash</span> is the serve-at-scale cousin — same tricks, smaller experts.
      </p>

      <Deeper>
        <p>
          <strong>The four swaps.</strong> Each corresponds to one card below:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 marker:text-neutral-600">
          <li>
            <strong className="text-sky-300">Hybrid attention</strong> replaces MLA-only with a mix of <Term>CSA</Term> (compressed + sparse) and <Term>HCA</Term> (heavily compressed, dense) — see <CrossLink to="csa" recap="CSA compresses m=4 tokens into one KV, then selects top-k blocks per query via a lightning indexer.">CSA</CrossLink> and <CrossLink to="hca" recap="HCA compresses m'=128 tokens into one KV and attends densely over the tiny compressed set.">HCA</CrossLink>.
          </li>
          <li>
            <strong className="text-violet-300">mHC residuals</strong> replace the single residual stream with <Eq>{`n_{\\text{hc}}=4`}</Eq> parallel streams, mixed by a doubly-stochastic matrix — see <CrossLink to="mhc" recap="mHC projects the mixing matrix onto the Birkhoff polytope via Sinkhorn-Knopp so its spectral norm stays ≤ 1.">mHC</CrossLink>.
          </li>
          <li>
            <strong className="text-emerald-300">Muon</strong> replaces AdamW on the hidden weights — orthogonalized updates via <Term>Newton-Schulz</Term> — see <CrossLink to="muon" recap="Muon orthogonalizes the gradient before stepping; 10 Newton-Schulz iterations approximate the matrix sign function.">Muon</CrossLink>.
          </li>
          <li>
            <strong className="text-fuchsia-300">FP4 QAT</strong> replaces BF16 weights with <Term>MXFP4</Term> during training — see <CrossLink to="fp4" recap="MXFP4 pairs FP4 values with FP8 per-block scales; the model learns to live with the precision it's served in.">FP4</CrossLink>.
          </li>
        </ul>
        <p>
          Other V3 features that <em>stayed</em>: <Term>MTP</Term> auxiliary head, auxiliary-loss-free routing balance, <Term>GRPO</Term> in RL, and the shared-expert + routed-expert MoE split.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why "hybrid" attention — why not just pick one of CSA or HCA?',
          a: 'CSA preserves fine detail at the cost of a top-k step; HCA is cheaper but blurs. Interleaving them means every other layer can "zoom in" via CSA while the cheaper HCA layer keeps the global context cheap. See the hybrid-layers card.' },
        { q: 'V4-Pro has 1.6T total params. Is it trained on 1.6T worth of compute?',
          a: 'No — that\'s the whole point of MoE. Per-token compute only touches the 49B active params plus attention, so training and serving cost scale with active parameters. Total parameters are the model\'s "library"; active parameters are what gets read per token.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// CARD 1 — The quadratic wall
// ============================================================================

const fmtInt = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
};
const fmtBytes = (b) => {
  if (b >= 1e12) return (b / 1e12).toFixed(1) + ' TB';
  if (b >= 1e9)  return (b / 1e9).toFixed(1) + ' GB';
  if (b >= 1e6)  return (b / 1e6).toFixed(0) + ' MB';
  if (b >= 1e3)  return (b / 1e3).toFixed(0) + ' KB';
  return b.toFixed(0) + ' B';
};

const QuadraticWall = () => {
  // Slider positions are log-spaced token counts.
  const stops = [1024, 4096, 16384, 65536, 262144, 1048576];
  const [idx, setIdx] = useState(4); // 262k default
  const n = stops[idx];

  // Per-token KV bytes (BF16, 2 bytes per number) — rough rule of thumb across frontier models.
  // Baseline dense GQA-8 (Llama-3-70B class): ~160 KB/token
  // DeepSeek-V3 MLA: ~70 KB/token (fits its 576-dim latent per layer)
  // DeepSeek-V4: aggressive compression → ~7 KB/token (10% of V3)
  const bytesPerTok = { dense: 160 * 1024, v3: 70 * 1024, v4: 7 * 1024 };

  // Per-token attention FLOPs are linear in context length (each new token attends to n past tokens).
  // Prefill of n tokens is quadratic: ~n^2 * 2 * d_model dense.
  // Unit arbitrary; we normalize to V3 single-token at 1M as "1.0" scale.
  const flopsTok = {
    dense: n * 2,      // dense attention FLOPs per new token ∝ n
    v3:    n * 1.1,    // V3.2 introduced DSA, roughly 55% of dense at 1M
    v4:    n * 0.30,   // V4: 27% of V3.2 FLOPs at long context
  };

  const maxKV = stops[stops.length - 1] * bytesPerTok.dense; // the worst case — 1M × dense
  const barKV = (b) => Math.max(2, (b / maxKV) * 100);

  return (
    <Card id="problem" icon={AlertTriangle} title="The quadratic wall" subtitle="Why million-token context is an infrastructure problem before it is an intelligence problem" accent="rose" index={1} source="§1 motivation">
      <MinSchema>
        Long context is cheap to <em>want</em>, expensive to <em>serve</em>. Attention is
        quadratic, the <Term>KV cache</Term> is linear-and-large, and the two compound.
      </MinSchema>

      <p>
        Every new token a Transformer reads has to attend to every past token — that's the <em>O(n²)</em> attention cost. And to avoid re-computing those past keys and values on every step, we cache them: the <Term>KV cache</Term>. For a frontier dense model at a million tokens, that cache alone is bigger than the model's weights.
      </p>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-x-3 gap-y-1 flex-wrap mb-3">
          <div className="text-sm text-neutral-200">Drag the slider: context length</div>
          <div className="text-xs text-neutral-500 font-mono">{fmtInt(n)} tokens</div>
        </div>
        <input
          type="range" min={0} max={stops.length - 1} step={1} value={idx}
          onChange={(e) => setIdx(+e.target.value)}
          className="w-full accent-rose-400"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
          {stops.map((s) => <span key={s}>{fmtInt(s)}</span>)}
        </div>

        <div className="mt-5 space-y-3">
          {[
            { name: 'Dense GQA-8 (Llama-3-70B-class)', key: 'dense', color: 'bg-rose-400/70', text: 'text-rose-300', note: 'full multi-head KV' },
            { name: 'DeepSeek-V3 · MLA',               key: 'v3',    color: 'bg-amber-400/70', text: 'text-amber-300', note: 'latent KV (576 dims)' },
            { name: 'DeepSeek-V4 · CSA + HCA',         key: 'v4',    color: 'bg-emerald-400/70', text: 'text-emerald-300', note: '10% of V3' },
          ].map((row) => {
            const bytes = n * bytesPerTok[row.key];
            const pct = barKV(bytes);
            return (
              <div key={row.key}>
                <div className="flex items-baseline justify-between text-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="text-neutral-200">{row.name}</span>
                    <span className="text-[10px] text-neutral-500">{row.note}</span>
                  </div>
                  <span className={`font-mono ${row.text}`}>{fmtBytes(bytes)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={`h-full ${row.color}`}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-md border border-white/10 bg-black/30 px-2.5 py-2">
            <div className="text-neutral-500 uppercase tracking-wider text-[9px]">attention FLOPs · per new token</div>
            <div className="mt-1 font-mono text-rose-300">{(flopsTok.dense / 1e6).toFixed(1)}M</div>
            <div className="text-neutral-600 text-[9px]">dense</div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 px-2.5 py-2">
            <div className="text-neutral-500 uppercase tracking-wider text-[9px]">v3.2 (DSA)</div>
            <div className="mt-1 font-mono text-amber-300">{(flopsTok.v3 / 1e6).toFixed(1)}M</div>
            <div className="text-neutral-600 text-[9px]">~55% of dense</div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 px-2.5 py-2">
            <div className="text-neutral-500 uppercase tracking-wider text-[9px]">v4 (CSA+HCA)</div>
            <div className="mt-1 font-mono text-emerald-300">{(flopsTok.v4 / 1e6).toFixed(1)}M</div>
            <div className="text-neutral-600 text-[9px]">~27% of v3.2</div>
          </div>
        </div>
      </div>

      <p>
        Slide to <span className="font-mono">1M</span>: the dense line blows past a <em>terabyte</em> of KV cache per sequence. On an H100 (80 GB HBM), that means you can't even hold one long conversation on one GPU — let alone serve a thousand of them. V3 cut that by ~2× with <Term>MLA</Term>; V4 cuts it by another ~10× with aggressive compression plus sparsity.
      </p>

      <Deeper>
        <p>
          <strong>Why "linear KV" is the real wall.</strong> Modern KV caches are already tiny per dimension — MLA stores a <Eq>{`\\num{576}`}</Eq>-dim latent per token. The enemy is the multiplier in front: <em>number of tokens</em> × <em>number of layers</em>. At 61 layers and 1M tokens, even <Eq>{`\\num{7}`}</Eq> KB/token is 427 GB per user. This is why V4 doesn't just shrink the <em>per-token</em> vector further — it compresses multiple tokens into one KV entry and then attends sparsely.
        </p>
        <p>
          <strong>FLOPs vs memory, two different fights.</strong> Sparse attention (DSA, top-k selection) fixes <em>compute</em>; compression (MLA, CSA, HCA) fixes <em>memory</em>. V4's insight is that both fights are the same fight when your block size <Eq>{`m`}</Eq> is ≥ ~4 — compressing the cache makes the top-k cheaper, because you're ranking compressed blocks instead of individual tokens.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If attention is O(n²), why do we say the KV cache is "linear"?',
          a: 'Because the cache stores each past token\'s key/value once. Reading it during generation is linear per step (n past tokens), but the stored size itself is O(n). The quadratic cost shows up in prefill (when we fill the cache) and is a compute cost, not a memory one.' },
        { q: 'If V3 already shrank the per-token KV with MLA, what\'s left to compress?',
          a: 'The token axis. MLA made each token\'s KV vector smaller; V4 groups consecutive tokens into compressed blocks, then lets each query attend sparsely only to the blocks it needs. Different axis, compounding savings.' },
        { q: 'Why does serving at long context care about FLOPs at all — isn\'t it memory-bound?',
          a: 'Decode is memory-bound (you re-read the whole KV cache per token). Prefill is compute-bound and quadratic. If your user pastes a 500-page PDF, prefill dominates TTFT and is where the quadratic term bites.' },
      ]} />
    </Card>
  );
};

// ============================================================================
// Page
// ============================================================================

export default function DeepSeekV4Explainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <Hero />
      <SectionNav />
      <main className="max-w-4xl mx-auto px-4 py-10 md:py-14 space-y-8">
        <QuadraticWall />
        <ArchGlance />
        <CSAViz />
        <HCAViz />
        <Hybrid />
        <MHC />
        <Muon />
        <FP4 />
        <Stability />
        <PostTrain />
        <Modes />
        <Results />
        <Limits />
        <Trails />
      </main>
      <footer className="border-t border-white/5 py-10 text-center text-xs text-neutral-500">
        Based on <em>"DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence"</em>, DeepSeek-AI, 2025.
      </footer>
    </div>
  );
}
