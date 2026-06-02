import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, ArrowRight, Brain, BrainCircuit, ChevronDown, Coins,
  Compass, Crosshair, Dices, Eye, EyeOff, FlaskConical, FunctionSquare, Gauge,
  GitBranch, GitFork, Grid3x3, HelpCircle, Infinity as InfinityIcon, Layers,
  Lightbulb, Link2, LineChart, ListOrdered, Network, Quote, RefreshCw, RotateCw,
  Ruler, Scale, ShieldAlert, Sigma, Sliders, Sparkles, Split, Star, Target,
  Telescope, TrendingDown, TrendingUp, Triangle, Users, Workflow, CheckCircle2,
  XCircle, Zap,
} from 'lucide-react';

/* ============================================================================
   Decision Theory · how to choose well when the outcome isn't yours to pick
   A broad survey: preferences & utility, expected-utility theory and the vNM
   axioms, risk vs uncertainty vs ignorance, Bayesian & statistical decision
   theory, the behavioral departures (Allais, Ellsberg, prospect theory),
   multi-attribute utility, and the philosophical frontier (causal vs evidential
   decision theory, social choice, the boundary with game theory).
   Running anchor: the career bet — take the safe salaried job, or join the
   risky startup for equity? Every card re-examines that one decision.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\ut': '\\textcolor{##7dd3fc}{#1}',  // sky      · utility u(·)
  '\\eu': '\\textcolor{##6ee7b7}{#1}',  // emerald  · expected utility / chosen act
  '\\pr': '\\textcolor{##c4b5fd}{#1}',  // violet   · probability / belief p
  '\\cs': '\\textcolor{##fbbf24}{#1}',  // amber    · cost / risk premium
  '\\an': '\\textcolor{##f0abfc}{#1}',  // fuchsia  · anchors / headline
  '\\bd': '\\textcolor{##fb7185}{#1}',  // rose     · loss / regret / bad outcome
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

// --- small numeric helpers --------------------------------------------------

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const lerp = (a, b, t) => a + (b - a) * t;
const fmtN = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);
const fmt$ = (v, d = 0) => '$' + Math.round(v).toLocaleString('en-US');

// Deterministic RNG (used by any seeded sim; no Date.now / Math.random).
function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function boxMuller(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, anchor = false, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
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

const Stat = ({ label, value, sub, color = 'text-neutral-100' }) => (
  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
    <div className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</div>
    <div className={`text-2xl font-mono mt-0.5 ${color}`}>{value}</div>
    {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
  </div>
);

const chipPalette = {
  sky:     'bg-sky-500/10 text-sky-300 border-sky-400/20',
  violet:  'bg-violet-500/10 text-violet-300 border-violet-400/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  amber:   'bg-amber-500/10 text-amber-300 border-amber-400/20',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/20',
  rose:    'bg-rose-500/10 text-rose-300 border-rose-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  neutral: 'bg-white/5 text-neutral-300 border-white/15',
};
const Chip = ({ children, color = 'sky' }) => (
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
  'utility': 'A number u(x) attached to each outcome so that "prefer A to B" means u(A) > u(B). Under expected-utility theory it is cardinal: differences and expectations of utility carry meaning.',
  'expected utility': 'The probability-weighted average of utility across an act’s possible outcomes, EU = Σ p(x)·u(x). The decision rule of normative decision theory is: pick the act with the highest EU.',
  'lottery': 'A formal gamble: a list of outcomes with probabilities, e.g. (0.5: $0, 0.5: $1M). Decision theory is the study of preferences over lotteries.',
  'certainty equivalent': 'The guaranteed amount that leaves you exactly indifferent to a risky gamble. For a risk-averse person it is below the gamble’s expected value.',
  'risk premium': 'Expected value minus certainty equivalent — how much money you knowingly give up to avoid the risk. Positive for risk-averse, negative for risk-seeking.',
  'risk aversion': 'Preferring a sure thing to a gamble of equal expected value. Equivalent to a concave utility-of-wealth function.',
  'normative': 'About how an ideally rational agent should decide. Contrast descriptive (how people actually decide) and prescriptive (how to help real people decide better).',
  'expected value': 'The probability-weighted average of the monetary (not utility) outcomes, EV = Σ p(x)·x. Maximizing EV is not the same as maximizing expected utility.',
  'independence axiom': 'If you prefer lottery A to B, then a coin-flip between A and C is preferred to the same coin-flip between B and C, for any C. The load-bearing — and most-violated — vNM axiom.',
  'expected-utility theory': 'The von Neumann–Morgenstern result: if your preferences satisfy four axioms, they are exactly represented by maximizing the expectation of some utility function.',
  'Bayes risk': 'The expected loss of a decision rule, averaged over both the data and a prior on the unknown parameter. The Bayes rule minimizes it.',
  'value of information': 'How much your expected payoff rises if you could learn something before deciding. Caps what any test, trial, or due-diligence is worth.',
  'ambiguity aversion': 'Preferring known odds to unknown odds even when the implied probabilities match — the Ellsberg phenomenon. A departure from standard expected-utility theory.',
  'prospect theory': 'Kahneman & Tversky’s descriptive model: outcomes are gains/losses against a reference point, losses loom larger than gains, and probabilities are subjectively weighted.',
  'loss aversion': 'The empirical finding that a loss hurts roughly twice as much as an equal gain feels good — the kink at the reference point in prospect theory.',
  'Nash equilibrium': 'A profile of strategies where no player can do better by unilaterally changing theirs. The central solution concept of game theory.',
  'Condorcet cycle': 'When majority rule prefers A to B, B to C, and C to A — a collective preference with no top choice, even though every individual is perfectly rational.',
  'expected-utility maximization': 'The act of choosing the option with the largest probability-weighted utility. The normative core that every later card either applies, refines, or challenges.',
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
        className="underline decoration-dotted decoration-violet-300/60 underline-offset-[3px] cursor-help text-neutral-100/95"
      >
        {children}
      </span>
      <FloatingTip
        hover={hover}
        width={340}
        render={() => (
          <div className="space-y-1">
            {key && <div className="text-[10px] uppercase tracking-wider text-violet-300">{key}</div>}
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
            <span className="text-[10px] uppercase tracking-[0.22em] text-violet-300">{g.title}</span>
            {g.note && <span className="text-[11px] text-neutral-500">— {g.note}</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {g.items.map((it, j) => {
              const isLink = !!it.href;
              const Tag = isLink ? 'a' : 'div';
              const props = isLink ? { href: it.href, onClick: (e) => onClick(e, it.href) } : {};
              return (
                <Tag key={j} {...props}
                  className={`block rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 ${isLink ? 'hover:bg-white/[0.05] hover:border-violet-400/30 transition-colors' : ''}`}>
                  <div className="text-[12px] text-neutral-100 font-medium leading-snug flex items-baseline gap-1.5">
                    {isLink && <ArrowRight className="w-2.5 h-2.5 self-center text-violet-300" />}
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

// --- The running anchor: the career bet -------------------------------------
// Two acts. SAFE = a salaried job paying a sure amount. BOLD = join the startup
// for equity, whose payoff is a lottery. Numbers in $/yr-equivalent, chosen so
// EV(bold) > EV(safe) but the spread is wide. Every card reuses these.

const SAFE_SALARY = 120000;             // the sure thing
const BOLD = [                          // the startup-equity lottery
  { p: 0.10, x: 1200000, label: 'IPO / acquisition' },
  { p: 0.30, x: 200000,  label: 'modest exit' },
  { p: 0.60, x: 30000,   label: 'fizzles · token equity' },
];
const boldEV = BOLD.reduce((s, o) => s + o.p * o.x, 0);   // = $198k (0.1·1.2M + 0.3·200k + 0.6·30k)

// --- Hero -------------------------------------------------------------------

const HeroField = () => {
  const dots = useMemo(() => {
    const out = [];
    let s = 7;
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xffffffff) / 0x100000000; };
    for (let i = 0; i < 60; i++) {
      out.push({ x: r(), y: r(), rr: 0.6 + r() * 1.4, opacity: 0.08 + r() * 0.3 });
    }
    return out;
  }, []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x * 100} cy={d.y * 100} r={d.rr * 0.3} fill={i % 3 === 0 ? '#6ee7b7' : i % 3 === 1 ? '#fbbf24' : '#f0abfc'} opacity={d.opacity} />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-amber-500/5 to-transparent" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <Scale className="w-3.5 h-3.5" /> decision theory · choosing well under uncertainty
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-emerald-100 to-amber-200 bg-clip-text text-transparent">
          Decision Theory
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">The mathematics of choosing — when you control the act, but not the outcome.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          One offer is a <span className="text-emerald-300">sure {fmt$(SAFE_SALARY)}/yr</span>. The other is
          equity in a startup — a <span className="text-amber-300">lottery</span> worth{' '}
          <span className="text-amber-300">{fmt$(boldEV)}</span> on average, but mostly worth almost nothing.
          Higher expected value, so take it? <span className="text-fuchsia-300">Not so fast.</span> The whole field
          lives in the gap between <em>expected value</em> and <em>the right choice</em> — and this explainer threads
          that one decision through every lens, from the axioms of rational preference to the paradoxes that break them.
        </p>
        <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">safe job</div>
            <div className="text-2xl font-mono text-emerald-200">{fmt$(SAFE_SALARY)}<span className="text-sm text-emerald-300/70"> · sure</span></div>
          </div>
          <span className="text-neutral-600 font-mono text-sm">vs</span>
          <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-amber-300">startup equity</div>
            <div className="text-2xl font-mono text-amber-200">{fmt$(boldEV)}<span className="text-sm text-amber-300/70"> · ±</span></div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-emerald-300">utility · expected-utility · axioms</span>
          <span className="text-amber-300">risk · uncertainty · information</span>
          <span className="text-violet-300">Allais · prospect · heuristics</span>
          <span className="text-fuchsia-300">Newcomb · Arrow · games</span>
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
  { id: 'frame',        label: 'What decision theory is',  icon: Scale },
  { id: 'preferences',  label: 'Preferences & axioms',     icon: ListOrdered },
  { id: 'utility',      label: 'Where utility comes from',  icon: TrendingUp },
  { id: 'vnm',          label: 'Expected utility & vNM',    icon: Sigma, anchor: true },
  { id: 'moneypump',    label: 'Money pumps & Dutch books', icon: RotateCw },
  { id: 'eveu',         label: 'EV ≠ EU · St. Petersburg',  icon: InfinityIcon },
  { id: 'riskaversion', label: 'Risk aversion',            icon: ShieldAlert },
  { id: 'uncertainty',  label: 'Risk vs uncertainty',      icon: Dices },
  { id: 'bayes',        label: 'Bayesian decisions',       icon: RefreshCw },
  { id: 'tree',         label: 'Decision trees',           icon: GitBranch },
  { id: 'voi',          label: 'Value of information',     icon: Telescope },
  { id: 'loss',         label: 'Loss & statistical DT',    icon: Crosshair },
  { id: 'allais',       label: 'Allais & Ellsberg',        icon: Triangle },
  { id: 'prospect',     label: 'Prospect theory',          icon: LineChart },
  { id: 'heuristics',   label: 'Heuristics & biases',      icon: Brain },
  { id: 'maut',         label: 'Multi-attribute utility',  icon: Sliders },
  { id: 'cdtedt',       label: 'Causal vs evidential',     icon: Split },
  { id: 'social',       label: 'Social choice & Arrow',    icon: Users },
  { id: 'game',         label: 'The game-theory boundary', icon: Grid3x3 },
  { id: 'anchor',       label: 'Synthesis: the career bet', icon: Sparkles, anchor: true },
  { id: 'trails',       label: 'Next trails',              icon: Compass },
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
   STUB CARDS — placeholders; each is replaced with real content in stages C-J.
   The default export references these names directly, so they always resolve.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ---- Card 1 · Frame ---------------------------------------------------- */

const STATES = [
  { id: 'boom', label: 'Boom', sub: 'IPO / acquisition', p: 0.10 },
  { id: 'mid',  label: 'Mid',  sub: 'modest exit',       p: 0.30 },
  { id: 'bust', label: 'Bust', sub: 'fizzles',           p: 0.60 },
];
// outcomes ($/yr-equiv) for each act × state
const OUTCOMES = {
  safe: { boom: SAFE_SALARY, mid: SAFE_SALARY, bust: SAFE_SALARY },
  bold: { boom: 1200000,     mid: 200000,      bust: 30000 },
};

const DecisionMatrix = () => {
  const [hl, setHl] = useState(null); // {act, st}
  const cellColor = (v) => v >= 500000 ? 'text-emerald-300' : v >= 120000 ? 'text-amber-300' : 'text-rose-300';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-widest text-neutral-500 font-normal px-2 py-1">act \ state</th>
            {STATES.map(s => (
              <th key={s.id} className="px-2 py-1 text-center">
                <div className="text-[11px] text-neutral-200">{s.label}</div>
                <div className="text-[9px] text-neutral-500">{s.sub}</div>
                <div className="text-[10px] font-mono text-violet-300">p={s.p}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[['safe', 'Safe job', 'emerald'], ['bold', 'Startup equity', 'amber']].map(([act, name, ac]) => (
            <tr key={act}>
              <td className="px-2 py-1"><Chip color={ac}>{name}</Chip></td>
              {STATES.map(s => {
                const v = OUTCOMES[act][s.id];
                const on = hl && hl.act === act && hl.st === s.id;
                return (
                  <td key={s.id}
                      onMouseEnter={() => setHl({ act, st: s.id })} onMouseLeave={() => setHl(null)}
                      className={`px-2 py-2 text-center rounded-md border cursor-default transition-colors ${on ? 'border-white/30 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                    <span className={`font-mono ${cellColor(v)}`}>{fmt$(v)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="EV · safe" value={fmt$(SAFE_SALARY)} color="text-emerald-300" sub="sure thing" />
        <Stat label="EV · bold" value={fmt$(boldEV)} color="text-amber-300" sub="0.1·1.2M + 0.3·200k + 0.6·30k" />
      </div>
    </div>
  );
};

const FrameCard = () => (
  <Card id="frame" icon={Scale} title="What decision theory is" accent="emerald" index={1}
        subtitle="You pick the act. Nature picks the state. You live with the outcome.">
    <p>
      You have two offers. One is a salaried job paying a sure <strong className="text-emerald-300">{fmt$(SAFE_SALARY)}/yr</strong>.
      The other is equity in an early-stage startup: most likely worth a token amount, occasionally a
      modest exit, and — one time in ten — a life-changing payout. Run the expected value and the startup
      <em> wins</em> ({fmt$(boldEV)} vs {fmt$(SAFE_SALARY)}). So you take it. Right?
    </p>
    <Intuition>
      <p>
        Hold that instinct. Almost nobody with {fmt$(SAFE_SALARY)} of expenses and a family would actually take a
        9-in-10 shot at near-zero income, even at higher average pay. That gap — between the option with the higher
        <em> expected value</em> and the option a sane person actually picks — is the entire subject. Decision theory
        is the machinery for being precise about <em>why</em>, and for getting it right when the stakes are real and
        the intuition runs out.
      </p>
    </Intuition>
    <p>
      Strip any decision to three parts: the <strong className="text-emerald-300">acts</strong> you can choose, the
      <strong className="text-sky-300"> states</strong> of the world you can't, and the <strong>outcomes</strong> that
      result from each act–state pair. Lay them in a grid and the structure is naked: you control which <em>row</em>;
      nature draws the <em>column</em>.
    </p>
    <DecisionMatrix />
    <MinSchema>
      A decision problem = <Eq>{`\\{\\eu{\\text{acts}}\\} \\times \\{\\pr{\\text{states}}\\} \\to \\text{outcomes}`}</Eq>. You
      choose the act; a probability distribution over states is imposed on you; each cell carries a value. Everything
      later is about how to collapse that grid into a single choice.
    </MinSchema>
    <p>
      The field forks into three questions, and confusing them is the most common error in applied decision-making:
    </p>
    <div className="grid sm:grid-cols-3 gap-2">
      {[
        ['Normative', 'emerald', 'How an ideally rational agent should choose. Theorems and axioms live here.'],
        ['Descriptive', 'amber', 'How people actually choose. Experiments and the behavioral paradoxes live here.'],
        ['Prescriptive', 'sky', 'How to help a real, boundedly-rational person choose better. Decision analysis lives here.'],
      ].map(([t, c, d]) => (
        <div key={t} className={`rounded-lg border p-3 ${chipPalette[c]} bg-opacity-5`}>
          <div className="text-xs font-semibold mb-1">{t}</div>
          <div className="text-[11px] text-neutral-300 leading-snug">{d}</div>
        </div>
      ))}
    </div>
    <Predict question="The normative theory will eventually say: maximize the expected value of the right quantity. Is that quantity the dollar payoff?">
      No — it's the expected <em>utility</em>, and the difference is exactly why a risk-averse person rationally
      declines the higher-EV startup. We build utility in <CrossLink to="utility" recap="A concave utility-of-wealth function turns 'more money' into 'less extra happiness per dollar'.">card 3</CrossLink> and
      the expectation rule in <CrossLink to="vnm" recap="The vNM theorem: four axioms force expected-utility maximization.">card 4</CrossLink>.
    </Predict>
    <Misconception
      wrong="The rational choice is always the option with the highest expected dollar value."
      right="The rational choice maximizes expected utility, which can rank a lower-EV sure thing above a higher-EV gamble."
      because="Money has diminishing marginal value: the first $120k matters far more than the millionth dollar, so averaging dollars over-weights the rare jackpot." />
    <QA items={[
      { q: 'In the career bet, which part is the “act” and which is the “state”?', a: 'The act is what you choose — take the safe job or join the startup. The state is what nature draws — boom, mid, or bust — which you don’t control. The outcome is the cell where your row meets nature’s column.' },
      { q: 'Why isn’t “maximize expected value” the final answer?', a: 'Because it treats the millionth dollar as worth exactly as much as the first. Once you account for diminishing marginal utility, a sure $120k can rationally beat a gamble averaging $222k. That correction is expected-utility theory.' },
      { q: 'You insist the startup is “obviously irrational” to take. Is it?', a: 'No — that’s the descriptive/normative confusion. For someone young, with savings and no dependents, the utility curve is flatter and the gamble can be the rational pick. The framework tells you which inputs decide it, not a one-size answer.' },
    ]} />
  </Card>
);

/* ---- Card 2 · Preferences & axioms ------------------------------------- */

const PREF_OPTS = [
  { id: 'A', label: 'Safe job', color: 'emerald' },
  { id: 'B', label: 'Startup equity', color: 'amber' },
  { id: 'C', label: 'Freelance', color: 'sky' },
];
const PREF_PAIRS = [['A', 'B'], ['B', 'C'], ['A', 'C']];

const PreferenceCycle = () => {
  // winner[pairKey] = id of the preferred option in that pair
  const [winner, setWinner] = useState({ 'A-B': 'A', 'B-C': 'B', 'A-C': 'A' }); // transitive default A≻B≻C
  const wins = useMemo(() => {
    const w = { A: 0, B: 0, C: 0 };
    PREF_PAIRS.forEach(([x, y]) => { w[winner[`${x}-${y}`]]++; });
    return w;
  }, [winner]);
  const cyclic = wins.A === 1 && wins.B === 1 && wins.C === 1;
  const ranking = ['A', 'B', 'C'].slice().sort((a, b) => wins[b] - wins[a]);
  const optById = (id) => PREF_OPTS.find(o => o.id === id);
  const setCycle = () => setWinner({ 'A-B': 'A', 'B-C': 'B', 'A-C': 'C' }); // A≻B, B≻C, C≻A
  const setTrans = () => setWinner({ 'A-B': 'A', 'B-C': 'B', 'A-C': 'A' });
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">your pairwise preferences · click to flip</div>
      <div className="space-y-2">
        {PREF_PAIRS.map(([x, y]) => {
          const key = `${x}-${y}`;
          return (
            <div key={key} className="flex items-center gap-2">
              {[x, y].map(id => {
                const on = winner[key] === id;
                const o = optById(id);
                return (
                  <button key={id} onClick={() => setWinner(w => ({ ...w, [key]: id }))}
                    className={`flex-1 text-left px-3 py-1.5 rounded-md border text-xs transition-colors ${on ? `${chipPalette[o.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}>
                    {on ? '✓ ' : ''}{o.label}
                  </button>
                );
              })}
              <span className="text-[10px] text-neutral-500 w-16 text-right font-mono">{optById(winner[key]).id} ≻ {x === winner[key] ? y : x}</span>
            </div>
          );
        })}
      </div>
      <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${cyclic ? 'border-rose-400/40 bg-rose-400/5 text-rose-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
        {cyclic ? (
          <>
            <strong>Intransitive — a preference cycle.</strong> You prefer {optById(winner['A-B']).label} to one,
            that to another, and the last one back to the first. There is no “best” option, no utility function can
            represent you, and you can be turned into a <CrossLink to="moneypump" recap="Pay a fee at each step of the cycle; you return to where you started, poorer.">money pump</CrossLink>.
          </>
        ) : (
          <>
            <strong>A valid ranking:</strong>{' '}
            {ranking.map((id, i) => (
              <span key={id}>{optById(id).label}{i < 2 ? ' ≻ ' : ''}</span>
            ))}. Transitive and complete — this is a <em>rational preference ordering</em>, and a utility function exists.
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2 text-[10px] font-mono">
        <button onClick={setTrans} className="px-2 py-0.5 rounded border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10">transitive preset</button>
        <button onClick={setCycle} className="px-2 py-0.5 rounded border border-rose-400/30 text-rose-300 hover:bg-rose-400/10">cyclic preset</button>
      </div>
    </div>
  );
};

const PreferencesCard = () => (
  <Card id="preferences" icon={ListOrdered} title="Preferences, orderings & axioms" accent="sky" index={2}
        subtitle="Before any numbers: what makes a set of preferences coherent enough to act on?">
    <p>
      Decision theory doesn't start with utilities — it starts with <Term>preferences</Term>, written as a binary
      relation <Eq>{`A \\succeq B`}</Eq> (“I like A at least as much as B”). The remarkable claim of the foundations is
      that two almost-trivial-sounding conditions on this relation are enough to summon a utility function out of thin
      air. The conditions:
    </p>
    <div className="grid sm:grid-cols-2 gap-2">
      <div className="rounded-lg border border-sky-400/25 bg-sky-400/5 p-3">
        <div className="text-xs font-semibold text-sky-200 mb-1">Completeness</div>
        <div className="text-[12px] text-neutral-300 leading-snug">For any two options, <Eq>{`A \\succeq B`}</Eq> or <Eq>{`B \\succeq A`}</Eq> (or both). You can always compare — no “I genuinely cannot say”.</div>
      </div>
      <div className="rounded-lg border border-sky-400/25 bg-sky-400/5 p-3">
        <div className="text-xs font-semibold text-sky-200 mb-1">Transitivity</div>
        <div className="text-[12px] text-neutral-300 leading-snug">If <Eq>{`A \\succeq B`}</Eq> and <Eq>{`B \\succeq C`}</Eq> then <Eq>{`A \\succeq C`}</Eq>. Your preferences don't loop back on themselves.</div>
      </div>
    </div>
    <p>
      Completeness + transitivity = a <strong className="text-sky-300">rational preference ordering</strong>, and any
      such ordering over a finite set can be represented by an ordinal <Eq>{`\\ut{u}`}</Eq> with{' '}
      <Eq>{`A \\succeq B \\iff \\ut{u}(A) \\ge \\ut{u}(B)`}</Eq>. “Ordinal” means only the <em>order</em> is meaningful so
      far — the gaps between numbers don't mean anything yet. Putting <em>cardinal</em> meaning into those gaps (so that
      expectations make sense) is the job of <CrossLink to="vnm" recap="vNM adds continuity + independence; the gaps then carry real meaning and you can take expectations.">the next two cards</CrossLink>.
    </p>
    <p>
      Transitivity sounds too obvious to be worth an axiom — until you try to violate it and watch what happens.
      Set your own preferences over three career options below:
    </p>
    <PreferenceCycle />
    <WhenItMatters>
      Real intransitivity is everywhere there are multiple criteria: option A beats B on salary, B beats C on growth,
      C beats A on stability — and majority-of-criteria “wins” can cycle (exactly the <CrossLink to="social" recap="Condorcet: majority rule over 3+ options can prefer A>B>C>A with every voter perfectly rational.">Condorcet trap</CrossLink> at the group level). The axiom isn't trivially satisfied; it's a discipline you have to impose.
    </WhenItMatters>
    <Misconception
      wrong="Of course my preferences are transitive — only a fool would prefer A to B, B to C, and C to A."
      right="Intransitive preferences are common and often feel locally reasonable, especially when each pairwise comparison emphasizes a different attribute."
      because="Each comparison can be decided by whichever feature is most salient in that pair; no single comparison feels irrational, yet together they cycle." />
    <QA items={[
      { q: 'What exactly does a utility function buy you over the raw preference relation?', a: 'Compactness and computability. Instead of storing every pairwise comparison, you store one number per option and recover all comparisons by ≥. At this stage it’s only ordinal — order-preserving relabelings are allowed — so you can’t yet average it.' },
      { q: 'Why is completeness controversial?', a: 'Because genuine incommensurability exists: comparing a career you’d love against one that pays double can leave you honestly unable to rank them. Drop completeness and you get richer theories with “preferential gaps”, but you lose the clean representation theorem.' },
      { q: 'If I have a 3-cycle, what’s the concrete harm?', a: 'You have no best option to choose, and a clever counterparty can sell you a sequence of trades that returns you to your starting point minus a fee each round — the money pump in card 5. Incoherence isn’t just ugly; it’s exploitable.' },
    ]} />
  </Card>
);
/* ---- shared primitive · utility-of-wealth curve ------------------------ */
// CARA (exponential) utility over wealth normalized to [0,1]. Curvature k:
//   k>0 concave (risk-averse), k=0 linear (risk-neutral), k<0 convex (seeking).
// Optional discrete `lottery` = [{x,p},...] overlays EU/EV/CE + risk-premium.

const UtilityCurve = ({ k = 1.6, domain = [0, 1200000], lottery = null, sure = null,
  showCE = true, showOutcomes = true, width = 360, height = 250, accent = '#6ee7b7', label = 'wealth' }) => {
  const id = React.useId();
  const [wMin, wMax] = domain;
  const P = 38, Pt = 16, W = width, H = height;
  const tOf = (w) => clamp((w - wMin) / (wMax - wMin), 0, 1);
  const uN = (t) => (Math.abs(k) < 1e-6 ? t : (1 - Math.exp(-k * t)) / (1 - Math.exp(-k)));
  const uInv = (u) => (Math.abs(k) < 1e-6 ? u : -Math.log(1 - u * (1 - Math.exp(-k))) / k);
  const sx = (t) => P + t * (W - P - Pt);
  const sy = (u) => H - P - u * (H - P - Pt);
  const curve = Array.from({ length: 65 }, (_, i) => { const t = i / 64; return `${sx(t).toFixed(1)},${sy(uN(t)).toFixed(1)}`; }).join(' ');

  let ov = null;
  if (lottery) {
    const EV = lottery.reduce((s, o) => s + o.p * o.x, 0);
    const EU = lottery.reduce((s, o) => s + o.p * uN(tOf(o.x)), 0);
    const tCE = uInv(EU);
    const CE = wMin + tCE * (wMax - wMin);
    ov = { EV, EU, tCE, CE, prem: EV - CE };
  }
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ maxWidth: W }}>
        {/* axes */}
        <line x1={P} y1={H - P} x2={W - Pt} y2={H - P} stroke="rgba(255,255,255,0.25)" />
        <line x1={P} y1={H - P} x2={P} y2={Pt} stroke="rgba(255,255,255,0.25)" />
        <text x={(P + W) / 2} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.45)" textAnchor="middle" fontFamily="ui-monospace, monospace">{label} →</text>
        <text x={12} y={Pt + 6} fontSize="10" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">u</text>
        {/* curve */}
        <polyline fill="none" stroke={accent} strokeWidth="2" points={curve} />
        {/* sure-thing marker */}
        {sure != null && (() => { const t = tOf(sure); return (
          <g>
            <line x1={sx(t)} y1={H - P} x2={sx(t)} y2={sy(uN(t))} stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={sx(t)} cy={sy(uN(t))} r="3.5" fill="#6ee7b7" />
          </g>
        ); })()}
        {/* lottery overlay */}
        {ov && (
          <g>
            {/* EU horizontal line */}
            <line x1={P} y1={sy(ov.EU)} x2={sx(ov.tCE)} y2={sy(ov.EU)} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" />
            {/* EV vertical line */}
            <line x1={sx(tOf(ov.EV))} y1={H - P} x2={sx(tOf(ov.EV))} y2={Pt} stroke="#7dd3fc" strokeWidth="1" strokeDasharray="3 3" />
            {/* risk-premium band on x-axis: CE → EV */}
            {showCE && (
              <rect x={sx(ov.tCE)} y={H - P - 5} width={Math.max(0, sx(tOf(ov.EV)) - sx(ov.tCE))} height="10" fill="rgba(251,113,133,0.30)" />
            )}
            {/* CE marker */}
            {showCE && (
              <g>
                <line x1={sx(ov.tCE)} y1={H - P} x2={sx(ov.tCE)} y2={sy(ov.EU)} stroke="#fb7185" strokeWidth="1.5" />
                <circle cx={sx(ov.tCE)} cy={sy(ov.EU)} r="3.5" fill="#fb7185" />
              </g>
            )}
            {/* outcome dots */}
            {showOutcomes && lottery.map((o, i) => { const t = tOf(o.x); return (
              <circle key={i} cx={sx(t)} cy={sy(uN(t))} r={3 + 4 * o.p} fill={accent} opacity="0.85" />
            ); })}
          </g>
        )}
      </svg>
      {ov && (
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          <Stat label="E[wealth]" value={fmt$(ov.EV)} color="text-sky-300" />
          <Stat label="certainty equiv." value={fmt$(ov.CE)} color="text-rose-300" sub="u(CE)=E[u]" />
          <Stat label="risk premium" value={fmt$(ov.prem)} color="text-amber-300" sub="E[w] − CE" />
        </div>
      )}
    </div>
  );
};

/* ---- Card 3 · Where utility comes from --------------------------------- */

const UtilityCard = () => {
  const [k, setK] = useState(1.8);
  const kind = k > 0.15 ? ['risk-averse', 'emerald'] : k < -0.15 ? ['risk-seeking', 'rose'] : ['risk-neutral', 'sky'];
  return (
    <Card id="utility" icon={TrendingUp} title="Where a utility function comes from" accent="emerald" index={3}
          subtitle="Ordinal order isn't enough to average. Diminishing marginal value gives the gaps meaning.">
      <p>
        Card 2 gave us an <em>ordinal</em> utility — the numbers ranked options but their differences meant nothing.
        To take expectations (to average utility across the startup's possible outcomes) we need a <strong className="text-emerald-300">cardinal</strong> utility, where the
        <em> gaps</em> carry information. The economic content that fills those gaps is the oldest idea in the subject:
        <Term def="The extra utility from one more dollar shrinks as you get richer. The 1st $10k changes your life; the 991st $10k barely registers."> diminishing marginal utility</Term>.
      </p>
      <Intuition>
        <p>
          Going from broke to {fmt$(120000)} is transformative. Going from {fmt$(1080000)} to {fmt$(1200000)} — the same
          extra {fmt$(120000)} — is a rounding error on your life. So plot happiness against wealth and the curve
          <em> bends over</em>: always rising, but rising ever more slowly. That concavity <strong>is</strong> risk
          aversion. It's why the rare {fmt$(1200000)} jackpot, which the expected-value sum weights heavily, buys you
          far less <em>utility</em> than its dollar figure suggests.
        </p>
      </Intuition>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <UtilityCurve k={k} domain={[0, 1200000]} lottery={BOLD.map(o => ({ x: o.x, p: o.p }))} showCE={true} accent="#6ee7b7" />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">curvature</span>
          <input type="range" min={-2} max={4} step={0.1} value={k} onChange={e => setK(parseFloat(e.target.value))} className="dt-range flex-1" />
          <Chip color={kind[1]}>{kind[0]}</Chip>
        </div>
        <div className="mt-1 text-[11px] text-neutral-400">
          Drag toward more curvature: the <span className="text-rose-300">certainty equivalent</span> (rose dot) drops
          below the <span className="text-sky-300">expected wealth</span> (sky line), and the{' '}
          <span className="text-amber-300">risk premium</span> — the money you'd surrender to dodge the gamble —
          grows. At zero curvature the gap vanishes: a risk-neutral agent prices the lottery at its EV.
        </div>
      </div>
      <p>
        The curvature you just dialed is, formally, the <CrossLink to="riskaversion" recap="Arrow–Pratt: −u''/u' measures local risk aversion; here it's the constant k.">Arrow–Pratt coefficient</CrossLink>. The
        deep fact, visible on the chart, is <strong>Jensen's inequality</strong>: for a concave <Eq>{`\\ut{u}`}</Eq>,
      </p>
      <Block>{`\\eu{E[\\ut{u}(w)]} \\;\\le\\; \\ut{u}(E[w]) \\quad\\Longleftrightarrow\\quad \\text{prefer the sure } E[w] \\text{ to the gamble}`}</Block>
      <ReadEq>the utility of the average beats the average of the utilities — so a sure thing worth the gamble's mean is strictly preferred. The concavity is the whole reason.</ReadEq>
      <Misconception
        wrong="Utility is just a fancy relabeling of money — more money, more utility, same thing."
        right="Utility is a nonlinear transform of money whose curvature encodes your attitude to risk. The shape, not the level, is what matters for choosing among gambles."
        because="A linear utility reproduces expected-value maximization; only a curved one can rank a sure thing above a higher-mean gamble, which is what real decision-makers do." />
      <QA items={[
        { q: 'Why can’t we just take expectations of the ordinal utility from card 2?', a: 'Because ordinal utility is defined only up to any order-preserving relabeling. u and u³ encode the same preferences but have different expectations, so “expected ordinal utility” isn’t well-defined. You need cardinal utility, pinned down up to a positive affine transform, for expectations to be meaningful — that’s what card 4 delivers.' },
        { q: 'Does concavity alone prove I should reject the startup?', a: 'It proves you’d reject a gamble whose certainty equivalent falls below your safe option. Whether that’s the case depends on how concave your curve is and on your current wealth. The chart shows the mechanism; the verdict needs your actual parameters (card 20).' },
        { q: 'Is more curvature always “more rational”?', a: 'No. Curvature is a preference, not a virtue. Extreme concavity means pathological caution (refusing tiny favorable bets); zero means risk-neutrality. Rationality constrains the shape to be a consistent function — it doesn’t dictate how bent it is.' },
      ]} />
    </Card>
  );
};

/* ---- Card 4 · Expected utility & the vNM axioms (SPINE) ---------------- */

// independence-axiom demonstrator: A ≻ B  ⇒  αA+(1-α)C ≻ αB+(1-α)C
const MixBar = ({ segs, label }) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{label}</div>
    <div className="flex h-7 rounded overflow-hidden border border-white/10">
      {segs.filter(s => s.w > 0.001).map((s, i) => (
        <div key={i} style={{ width: `${s.w * 100}%`, background: s.c }}
             className="flex items-center justify-center text-[9px] font-mono text-black/80">
          {s.w >= 0.12 ? `${Math.round(s.w * 100)}%` : ''}
        </div>
      ))}
    </div>
  </div>
);

const VnmCard = () => {
  const [alpha, setAlpha] = useState(0.6);
  const [kk, setKk] = useState(1.8);
  // EU of the career acts under exponential utility, curvature kk over [0,1.2M]
  const uN = (w) => { const t = clamp(w / 1200000, 0, 1); return Math.abs(kk) < 1e-6 ? t : (1 - Math.exp(-kk * t)) / (1 - Math.exp(-kk)); };
  const euSafe = uN(SAFE_SALARY);
  const euBold = BOLD.reduce((s, o) => s + o.p * uN(o.x), 0);
  const boldWins = euBold > euSafe;
  // colors for mixing demo
  const cA = '#6ee7b7', cB = '#fb7185', cC = '#7dd3fc';
  return (
    <Card id="vnm" icon={Sigma} title="Expected utility & the vNM axioms" accent="fuchsia" index={4} anchor
          source="von Neumann–Morgenstern 1944"
          subtitle="The theorem that makes “maximize expected utility” not a choice but a consequence.">
      <p>
        Here is the load-bearing result of the entire field. Von Neumann and Morgenstern proved that if your
        preferences over <Term>lottery</Term>{' '}lotteries satisfy four modest axioms, then there <em>exists</em> a
        cardinal utility <Eq>{`\\ut{u}`}</Eq> such that you prefer one lottery to another <strong>exactly when</strong> it
        has higher expected utility:
      </p>
      <Block>{`A \\succeq B \\;\\iff\\; \\eu{\\sum_i p_i\\,\\ut{u}(x_i)} \\;\\ge\\; \\eu{\\sum_j q_j\\,\\ut{u}(y_j)}`}</Block>
      <ReadEq>“maximize expected utility” isn't a modeling assumption you opt into — it's <em>forced</em> on anyone whose preferences are coherent. Reject the conclusion and you must reject one of the four axioms.</ReadEq>
      <p>Two axioms we've met (<Term>completeness</Term>, transitivity). The two new ones are where the action is:</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 p-3">
          <div className="text-xs font-semibold text-fuchsia-200 mb-1">Continuity</div>
          <div className="text-[12px] text-neutral-300 leading-snug">If <Eq>{`A \\succeq B \\succeq C`}</Eq>, some probability mix of the best and worst, <Eq>{`pA+(1-p)C`}</Eq>, leaves you exactly indifferent to the middle <Eq>{`B`}</Eq>. No outcome is infinitely good or bad.</div>
        </div>
        <div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 p-3">
          <div className="text-xs font-semibold text-fuchsia-200 mb-1">Independence</div>
          <div className="text-[12px] text-neutral-300 leading-snug">If <Eq>{`A \\succeq B`}</Eq>, then mixing each with the <em>same</em> third lottery <Eq>{`C`}</Eq> at the <em>same</em> odds preserves it: <Eq>{`\\alpha A+(1-\\alpha)C \\succeq \\alpha B+(1-\\alpha)C`}</Eq>.</div>
        </div>
      </div>
      <p>
        <strong className="text-fuchsia-300">Independence</strong> is the engine — and the one most people unknowingly
        violate (card 13). It says a shared, irrelevant branch shouldn't flip your ranking. Watch it hold as you slide
        the mixing weight <Eq>{`\\alpha`}</Eq>: the common <span style={{ color: cC }}>blue</span> slice grows in both,
        but the <span style={{ color: cA }}>A</span>-vs-<span style={{ color: cB }}>B</span> comparison underneath is untouched.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <MixBar label={`α·A + (1−α)·C   ·   you keep A’s edge`} segs={[{ w: alpha, c: cA }, { w: 1 - alpha, c: cC }]} />
        <MixBar label={`α·B + (1−α)·C   ·   same common slice`} segs={[{ w: alpha, c: cB }, { w: 1 - alpha, c: cC }]} />
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-20">α (weight on A/B)</span>
          <input type="range" min={0} max={1} step={0.02} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} className="dt-range flex-1" />
          <span className="font-mono text-xs text-fuchsia-200 w-10 text-right">{alpha.toFixed(2)}</span>
        </div>
        <div className="text-[11px] text-neutral-400">
          Whatever α you pick, if A ≻ B then the top bar ≻ the bottom bar. Independence is what lets the <Eq>{`\\sum p_i \\ut{u}(x_i)`}</Eq> be
          <em> linear</em> in the probabilities — the property that makes it an honest <em>expectation</em>.
        </div>
      </div>
      <p>
        Now apply the rule to the career bet. Pick a utility curvature and read off which act actually wins on
        expected <em>utility</em> — not expected dollars:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="EU · safe job" value={euSafe.toFixed(3)} color={boldWins ? 'text-neutral-200' : 'text-emerald-300'} sub="u(120k)" />
          <Stat label="EU · startup" value={euBold.toFixed(3)} color={boldWins ? 'text-amber-300' : 'text-neutral-200'} sub="Σ pᵢ·u(xᵢ)" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">risk aversion k</span>
          <input type="range" min={0} max={5} step={0.1} value={kk} onChange={e => setKk(parseFloat(e.target.value))} className="dt-range flex-1" />
          <span className="font-mono text-xs text-fuchsia-200 w-8 text-right">{kk.toFixed(1)}</span>
        </div>
        <div className={`mt-2 rounded-md border px-3 py-1.5 text-xs ${boldWins ? 'border-amber-400/40 bg-amber-400/5 text-amber-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
          {boldWins
            ? 'At this curvature the startup still wins on expected utility — your concavity is mild enough that the jackpot carries it.'
            : 'At this curvature the safe job wins on expected utility — even though the startup has the higher expected dollar value. This is the whole point.'}
        </div>
      </div>
      <Predict question="There is a single break-even curvature k* where EU(safe) = EU(startup). Below it the startup wins; above it the safe job wins. Roughly where does it sit on the 0–5 slider?">
        Around <strong>k ≈ 1.4</strong>. Below that you're close enough to risk-neutral that the {fmt$(boldEV)} mean
        carries the startup; above it, concavity bites and the sure {fmt$(SAFE_SALARY)} wins. The exact crossover is
        what the <CrossLink to="anchor" recap="The synthesis card solves the career bet end-to-end and reports the break-even curvature + certainty-equivalent salary.">synthesis card</CrossLink> pins down.
      </Predict>
      <Deeper>
        <p>
          The utility is unique only up to a positive affine transform <Eq>{`\\ut{u} \\mapsto a\\ut{u}+b,\\ a>0`}</Eq> —
          rescaling the thermometer (Celsius vs Fahrenheit) changes no decision. What's <em>not</em> free is the
          curvature: that's pinned by your choices over gambles, and it's exactly the cardinal content the
          representation theorem extracts. vNM utility is therefore "interval-scale" — differences and expectations
          are meaningful, but there's no absolute zero and no cross-person comparison (a fact that comes back to bite
          us in <CrossLink to="social" recap="Arrow: no rule aggregates individual orderings into a group ordering without a dictator — partly because utilities aren't interpersonally comparable.">social choice</CrossLink>).
        </p>
      </Deeper>
      <QA items={[
        { q: 'Is expected-utility theory normative or descriptive?', a: 'Strictly normative: it says how a coherent agent must rank lotteries, on pain of violating an axiom. As a description of real humans it fails in predictable ways — Allais, Ellsberg, framing — which is exactly what the behavioral cards (13–15) document.' },
        { q: 'Which axiom does the startup-lover and the startup-refuser disagree on?', a: 'Neither — they can both satisfy all four axioms and simply have different utility curvatures. The axioms fix the form (maximize E[u]); they leave the shape of u to the individual. Disagreement about k is not irrationality.' },
        { q: 'Why is independence called the “engine”?', a: 'Because it’s what forces utility to be linear in probabilities, i.e. a genuine expectation. Drop independence and you get non-expected-utility theories (rank-dependent utility, prospect theory) that bend the probability weighting — the subject of cards 13–14.' },
      ]} />
    </Card>
  );
};
/* ---- Card 5 · Money pumps & Dutch books -------------------------------- */

const PUMP_CYCLE = ['A', 'B', 'C']; // A≻B≻C≻A : holder is offered the one they prefer
const PUMP_LABEL = { A: 'Safe job', B: 'Startup equity', C: 'Freelance' };
const PUMP_COLOR = { A: 'emerald', B: 'amber', C: 'sky' };

const MoneyPump = () => {
  const [hold, setHold] = useState('C');
  const [wealth, setWealth] = useState(100);
  const [laps, setLaps] = useState(0);
  const [log, setLog] = useState([]);
  const fee = 1;
  const next = (h) => h === 'A' ? 'C' : h === 'C' ? 'B' : 'A'; // you prefer next(h) to h
  const step = () => {
    const to = next(hold);
    setWealth(w => w - fee);
    setLog(l => [`traded ${PUMP_LABEL[hold]} → ${PUMP_LABEL[to]}  (−$${fee})`, ...l].slice(0, 5));
    if (to === 'C' && hold === 'A') setLaps(n => n + 1); // completed a loop back to start
    setHold(to);
  };
  const reset = () => { setHold('C'); setWealth(100); setLaps(0); setLog([]); };
  return (
    <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.03] p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">you hold</span>
          <Chip color={PUMP_COLOR[hold]}>{PUMP_LABEL[hold]}</Chip>
        </div>
        <div className="flex items-center gap-3">
          <Stat label="wallet" value={fmt$(wealth)} color={wealth < 100 ? 'text-rose-300' : 'text-neutral-200'} />
          <Stat label="full loops" value={laps} color="text-rose-300" sub="back to start, poorer" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={step} className="text-xs rounded-md border border-rose-400/40 bg-rose-400/10 hover:bg-rose-400/20 text-rose-100 px-3 py-1.5 flex items-center gap-1">
          <RotateCw className="w-3.5 h-3.5" /> trade up (you prefer the offer)
        </button>
        <button onClick={reset} className="text-xs rounded-md border border-white/15 text-neutral-300 px-3 py-1.5 hover:bg-white/5">reset</button>
      </div>
      <div className="mt-3 font-mono text-[11px] text-neutral-400 space-y-0.5 min-h-[16px]">
        {log.map((l, i) => <div key={i} className={i === 0 ? 'text-rose-300' : ''}>{l}</div>)}
      </div>
      {laps > 0 && (
        <div className="mt-2 text-xs text-rose-200">
          You've gone around {laps}× — same holding you started with, <strong>{fmt$(100 - wealth)} poorer</strong>.
          Each lap, every individual trade looked like an improvement. That's a money pump.
        </div>
      )}
    </div>
  );
};

const MoneyPumpCard = () => (
  <Card id="moneypump" icon={RotateCw} title="Money pumps & Dutch books" accent="rose" index={5}
        subtitle="Why the axioms aren't optional: violate them and you can be drained, one “improvement” at a time.">
    <p>
      The axioms of cards 2–4 can feel like bookkeeping. They aren't — each one is enforced by a concrete penalty.
      Hold the intransitive cycle from card 2 (<Eq>{`A \\succ B \\succ C \\succ A`}</Eq>) and a counterparty can run you
      in circles: at every step they offer the thing you prefer, charge a small fee for the swap, and after three
      swaps you're holding exactly what you started with — minus three fees. Repeat forever.
    </p>
    <MoneyPump />
    <p>
      This is a <strong className="text-rose-300">money pump</strong>, and it's a <em>dominance</em> argument: it
      doesn't appeal to your utilities at all, it just shows intransitive preferences hand over money for nothing.
      The probabilistic twin is the <Term def="A set of bets, each of which you accept as fair, that together guarantee you lose money no matter what happens. The hallmark of incoherent (non-additive) probabilities.">Dutch book</Term>: if
      your degrees of belief don't obey the probability axioms (e.g. <Eq>{`P(\\text{rain})+P(\\text{no rain}) \\ne 1`}</Eq>),
      a bookie can offer bets you'll each take that <em>jointly</em> lose you money for sure.
    </p>
    <MinSchema>
      Coherence theorems run <em>backwards</em>: instead of assuming you maximize expected utility, they show that
      <strong> avoiding sure loss</strong> forces transitive preferences (no money pump) and additive probabilities
      (no Dutch book). Rationality is "don't be exploitable", and EU maximization falls out.
    </MinSchema>
    <WhenItMatters>
      Real markets <em>are</em> the counterparty. Intransitive risk preferences across products (you'll pay up for
      insurance <em>and</em> for lottery tickets on the same risk), inconsistent discount rates (preferring $100 now
      to $110 next week but $110 in a year to $100 in 51 weeks), and miscalibrated probabilities all get arbitraged —
      by sportsbooks, by insurers, by your own future self.
    </WhenItMatters>
    <Misconception
      wrong="The rationality axioms are arbitrary aesthetic preferences imposed by economists."
      right="Each axiom is equivalent to immunity from a specific, constructive exploitation — a money pump (transitivity) or a Dutch book (probabilistic coherence)."
      because="The arguments are operational: violate the axiom and here is the explicit sequence of trades that drains you. That’s a consequence, not a taste." />
    <QA items={[
      { q: 'Can’t I just refuse the trades once I notice the pattern?', a: 'Refusing is admitting the preferences were never strict in the first place — you’ve revised them to be transitive. The argument’s force is exactly that: to escape the pump you must abandon the intransitive preferences, which is the conclusion. You can’t keep the cycle and dodge the cost.' },
      { q: 'Does a money pump assume I’m stupid?', a: 'No. Each individual swap is one you genuinely prefer by your own lights — locally rational every time. The irrationality is global and only visible across the loop. That’s what makes incoherence insidious: it never feels wrong step-by-step.' },
      { q: 'How is a Dutch book different from just making a bad bet?', a: 'A bad bet might lose; a Dutch book is a combination of bets you each judge fair that loses with certainty, in every state of the world. It’s the probabilistic analogue of returning to your start poorer — sure loss with no uncertainty left to blame.' },
    ]} />
  </Card>
);

/* ---- Card 6 · EV ≠ EU · St. Petersburg --------------------------------- */

const StPetersburg = () => {
  const [N, setN] = useState(20);      // casino can pay at most 2^N (finite bankroll)
  const [logU, setLogU] = useState(true);
  // EV of truncated game: Σ_{n=1..N} (1/2^n)·2^n = N/2  (each term = 1/2)
  const ev = N / 2;
  // fair price under utility u(w)=log(w) (over wealth, starting from a small stake base):
  // certainty equiv c solves u(c) = Σ p_n u(2^n). With log: Σ (1/2^n) n ln2 = 2 ln2 ⇒ c = e^{2 ln2}=4.
  const euLog = Array.from({ length: N }, (_, i) => i + 1).reduce((s, n) => s + (1 / 2 ** n) * Math.log(2 ** n), 0);
  const fairLog = Math.exp(euLog);
  const fair = logU ? fairLog : ev;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="expected $ payoff" value={logU ? `$${ev.toFixed(1)}` : `$${ev.toFixed(1)}`} color="text-amber-300" sub={`= N/2, grows ${'∞'} as N→∞`} />
        <Stat label="what you'd actually pay" value={fmt$(fair)} color="text-emerald-300" sub={logU ? 'log-utility certainty equiv ≈ $4' : 'risk-neutral = EV'} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-28">max rounds N</span>
        <input type="range" min={2} max={60} step={1} value={N} onChange={e => setN(parseInt(e.target.value))} className="dt-range flex-1" />
        <span className="font-mono text-xs text-amber-200 w-8 text-right">{N}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => setLogU(true)} className={`text-[11px] px-2 py-1 rounded border ${logU ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/15 text-neutral-400'}`}>log utility</button>
        <button onClick={() => setLogU(false)} className={`text-[11px] px-2 py-1 rounded border ${!logU ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-white/15 text-neutral-400'}`}>risk-neutral</button>
      </div>
      <div className="mt-2 text-[11px] text-neutral-400">
        The expected payoff climbs by a flat <strong>$0.50 per extra round</strong> the casino can afford — so it runs
        to infinity, but excruciatingly slowly. Under log utility the price you'd pay <em>converges</em> to ≈ {fmt$(fairLog)}
        no matter how deep the bankroll. The infinity in dollars is finite in <em>utils</em>.
      </div>
    </div>
  );
};

const EvEuCard = () => (
  <Card id="eveu" icon={InfinityIcon} title="Expected value ≠ expected utility" accent="amber" index={6}
        source="Bernoulli 1738"
        subtitle="The 285-year-old paradox that killed expected-value maximization for good.">
    <p>
      If maximizing expected <em>dollars</em> were rational, here's a game you should sell everything to play. A fair
      coin is flipped until it lands tails; if the first tails is on flip <Eq>{`n`}</Eq>, you win <Eq>{`\\$2^n`}</Eq>.
      Its expected value:
    </p>
    <Block>{`E[\\$] = \\sum_{n=1}^{\\infty} \\underbrace{\\tfrac{1}{2^n}}_{\\pr{P(n)}}\\cdot \\underbrace{2^n}_{\\text{prize}} = \\tfrac12+\\tfrac12+\\tfrac12+\\cdots = \\infty`}</Block>
    <p>
      Infinite expected value — so you should pay any finite price to play. Yet essentially nobody will pay even $20.
      Daniel Bernoulli's 1738 resolution founded the whole field: people don't maximize expected money, they maximize
      expected <strong className="text-amber-300">utility</strong>, and with a concave (e.g. logarithmic) utility the
      sum converges to a small, sane number.
    </p>
    <StPetersburg />
    <p>
      The paradox forces a second lesson: for expected utility to stay finite on <em>every</em> conceivable gamble,
      utility must be <strong>bounded</strong> (or at least grow slowly enough). An unbounded utility just relocates
      the paradox to a "super–St. Petersburg" game with even faster-growing prizes. Real preferences are bounded —
      there's a best-imaginable outcome — which is reassuring and a little sobering.
    </p>
    <Deeper>
      <p>
        Note what the career bet inherits from this. The startup's {fmt$(1200000)} jackpot is a baby St. Petersburg
        term: low probability, high payoff, contributing a big chunk of the {fmt$(boldEV)} expected value but very
        little expected <em>utility</em> once the curve bends. "The EV is dominated by a rare huge outcome" is the
        signature of a decision where EV is the wrong summary — and it describes startups, lotteries, venture
        portfolios, and catastrophe insurance alike.
      </p>
    </Deeper>
    <Misconception
      wrong="A bet with infinite expected value is always worth taking at any finite price."
      right="It’s worth only its certainty equivalent under your utility, which is finite (≈$4 under log utility) even when the dollar expectation diverges."
      because="Expectation in dollars over-weights vanishingly rare, enormous payoffs that your concave utility barely values. The expectation that governs choice is over utility, not money." />
    <QA items={[
      { q: 'Why does truncating at N rounds make the EV finite but still huge-seeming?', a: 'A real casino has a finite bankroll, so it caps the prize at 2^N. The truncated EV is exactly N/2 — it grows without bound as N→∞, but only linearly and slowly. Even a casino able to pay 2^40 (a trillion-fold) only makes the game “worth” $20 in EV. The divergence is real but anemic.' },
      { q: 'Does log utility “solve” the paradox?', a: 'It resolves the original game — the price converges to ~$4. But unbounded log utility can be defeated by a faster-growing prize schedule (the super-St.-Petersburg game). The fully general fix is bounded utility, which guarantees finite EU for any gamble.' },
      { q: 'What’s the takeaway for the career bet?', a: 'Whenever a large share of an option’s expected value rides on a single rare outcome, EV is a misleading summary and you must switch to expected utility. The startup, like St. Petersburg, hides most of its “average” in a tail you’ll probably never see.' },
    ]} />
  </Card>
);

/* ---- Card 7 · Risk aversion -------------------------------------------- */

const RiskAversionCard = () => {
  const [k, setK] = useState(2.2);
  // a symmetric ±spread gamble around a base wealth, shown on the curve
  const [spread, setSpread] = useState(400000);
  const base = 600000;
  const lo = clamp(base - spread, 0, 1200000), hi = clamp(base + spread, 0, 1200000);
  const lottery = [{ x: lo, p: 0.5 }, { x: hi, p: 0.5 }];
  return (
    <Card id="riskaversion" icon={ShieldAlert} title="Risk aversion, precisely" accent="emerald" index={7}
          source="Arrow 1965 · Pratt 1964"
          subtitle="Certainty equivalent, risk premium, and the one number that measures how bent your curve is.">
      <p>
        Three quantities make "risk aversion" exact. The <strong className="text-rose-300">certainty equivalent</strong> (CE)
        is the guaranteed sum that's exactly as good as the gamble: <Eq>{`\\ut{u}(\\text{CE}) = E[\\ut{u}]`}</Eq>. The
        <strong className="text-amber-300"> risk premium</strong> <Eq>{`\\pi = E[w]-\\text{CE}`}</Eq> is what you'll pay to
        shed the risk. And the <strong className="text-emerald-300">Arrow–Pratt coefficient</strong> measures the local
        curvature that drives both:
      </p>
      <Block>{`A(w) = -\\frac{\\ut{u}''(w)}{\\ut{u}'(w)}, \\qquad \\pi \\;\\approx\\; \\tfrac12\\,A(w)\\,\\sigma^2`}</Block>
      <ReadEq>the risk premium is (to first order) half your local curvature times the gamble's variance. Bigger curvature or bigger variance ⇒ you pay more to avoid it. A risk-neutral person (A=0) pays nothing.</ReadEq>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <UtilityCurve k={k} domain={[0, 1200000]} lottery={lottery} showCE accent="#6ee7b7" />
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">curvature k</span>
            <input type="range" min={0} max={5} step={0.1} value={k} onChange={e => setK(parseFloat(e.target.value))} className="dt-range flex-1" />
            <span className="font-mono text-xs text-emerald-200 w-8 text-right">{k.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">gamble spread</span>
            <input type="range" min={50000} max={600000} step={10000} value={spread} onChange={e => setSpread(parseInt(e.target.value))} className="dt-range flex-1" />
            <span className="font-mono text-xs text-emerald-200 w-16 text-right">±{fmt$(spread)}</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-neutral-400">
          A 50/50 gamble around {fmt$(base)}. Widen the spread (more variance) or bend the curve (more curvature) and
          the <span className="text-amber-300">risk premium</span> grows — exactly as <Eq>{`\\tfrac12 A\\sigma^2`}</Eq> predicts.
        </div>
      </div>
      <p>
        The <em>shape</em> of <Eq>{`A(w)`}</Eq> as wealth changes defines the two canonical families.
        <strong> CARA</strong> (constant absolute risk aversion, <Eq>{`A`}</Eq> flat) takes the same dollar gamble at
        any wealth — the exponential utility we've been using. <strong>CRRA</strong> (constant <em>relative</em> risk
        aversion, <Eq>{`wA(w)`}</Eq> flat) scales: a billionaire and a student refuse the same gamble as a fraction of
        wealth, not in dollars. CRRA (e.g. log utility) is the usual realistic default, and it's what justifies sizing
        bets as a fraction of bankroll — the <CrossLink to="anchor" recap="Fractional-Kelly sizing falls out of CRRA/log utility; how much of your career capital to stake on the startup is the same math." external to={"/#retail-quant"}>Kelly</CrossLink> logic in the sibling Retail-Quant explainer.
      </p>
      <Predict question="You face a 50/50 win/lose-$100 gamble. Under log utility at $10k wealth vs $1M wealth, where is the risk premium larger in dollars?">
        At $10k. Log utility is CRRA, so the <em>relative</em> premium is the same, but in <em>dollars</em> the premium
        is far larger when the $100 is a big fraction of your wealth. At $1M the same ±$100 is almost a rounding error,
        so you behave nearly risk-neutrally over it. This is why the same person buys lottery tickets and refuses to
        risk the rent.
      </Predict>
      <Misconception
        wrong="A risk-averse person should avoid all gambles."
        right="A risk-averse person accepts any gamble whose certainty equivalent exceeds their alternative — they’ll take favorable bets, just at a discount to expected value."
        because="Risk aversion discounts risky prospects by the risk premium; it doesn’t zero them out. A sufficiently favorable gamble still clears the bar, which is why insurers and investors (all risk-averse) still take risk for a price." />
      <QA items={[
        { q: 'Why is it −u″/u′ and not just u″?', a: 'Because utility is only defined up to a positive affine transform (card 4): rescaling u multiplies both u″ and u′ by the same constant, so the ratio −u″/u′ is invariant. Raw curvature u″ would change under a harmless relabeling; the Arrow–Pratt ratio is the relabeling-proof measure of risk attitude.' },
        { q: 'Is the risk premium ≈ ½Aσ² exact?', a: 'It’s a second-order Taylor approximation, excellent for small gambles relative to wealth and degrading for large ones. For the all-or-nothing career bet (a huge fraction of lifetime wealth) you must compute the certainty equivalent exactly, as the chart does, rather than trust the local formula.' },
        { q: 'CARA or CRRA for the career decision?', a: 'CRRA is the better description: people care about proportional changes in lifetime wealth. That’s why the right question isn’t “is the startup worth $X” but “what fraction of my career capital am I staking, and at what odds” — which lands us squarely on Kelly-style sizing in the synthesis.' },
      ]} />
    </Card>
  );
};
/* ---- shared primitive · payoff matrix ---------------------------------- */
// acts: [{id,label,color}]  states: [{id,label,sub?,p?}]  payoffs: {actId:{stateId:number}}
const PayoffMatrix = ({ acts, states, payoffs, highlight = null, showP = false, cellFmt = fmt$ }) => {
  const all = acts.flatMap(a => states.map(s => payoffs[a.id][s.id]));
  const lo = Math.min(...all), hi = Math.max(...all);
  const tone = (v) => {
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    if (t > 0.62) return 'text-emerald-300';
    if (t > 0.28) return 'text-amber-300';
    return 'text-rose-300';
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-[10px] uppercase tracking-widest text-neutral-500 font-normal px-2 py-1">act \ state</th>
            {states.map(s => (
              <th key={s.id} className="px-2 py-1 text-center">
                <div className="text-[11px] text-neutral-200">{s.label}</div>
                {s.sub && <div className="text-[9px] text-neutral-500">{s.sub}</div>}
                {showP && s.p != null && <div className="text-[10px] font-mono text-violet-300">p={s.p}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {acts.map(a => {
            const on = highlight === a.id;
            return (
              <tr key={a.id}>
                <td className="px-2 py-1"><Chip color={a.color}>{a.label}</Chip></td>
                {states.map(s => {
                  const v = payoffs[a.id][s.id];
                  return (
                    <td key={s.id} className={`px-2 py-2 text-center rounded-md border transition-colors ${on ? 'border-fuchsia-400/50 bg-fuchsia-400/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
                      <span className={`font-mono ${tone(v)}`}>{cellFmt(v)}</span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ---- Card 8 · Risk vs uncertainty vs ignorance ------------------------- */

const IG_ACTS = [
  { id: 'safe', label: 'Safe job', color: 'emerald' },
  { id: 'hedge', label: 'Hedge', color: 'sky' },
  { id: 'bold', label: 'Startup', color: 'amber' },
];
const IG_STATES = [
  { id: 'boom', label: 'Boom' }, { id: 'mid', label: 'Mid' }, { id: 'bust', label: 'Bust' },
];
const IG_PAY = {
  safe:  { boom: 120000, mid: 120000, bust: 120000 },
  hedge: { boom: 320000, mid: 160000, bust: 90000 },   // keep job + small angel stake
  bold:  { boom: 1200000, mid: 200000, bust: 30000 },
};

const CRITERIA = [
  { id: 'maximin', label: 'Maximin', note: 'best worst-case — pure pessimism' },
  { id: 'maximax', label: 'Maximax', note: 'best best-case — pure optimism' },
  { id: 'hurwicz', label: 'Hurwicz α', note: 'blend of best and worst' },
  { id: 'laplace', label: 'Laplace', note: 'assume equal odds, maximize mean' },
  { id: 'regret',  label: 'Minimax-regret', note: 'minimize the most you could kick yourself' },
];

const UncertaintyCard = () => {
  const [crit, setCrit] = useState('maximin');
  const [alpha, setAlpha] = useState(0.5);
  const rowVals = (a) => IG_STATES.map(s => IG_PAY[a.id][s.id]);
  const score = (a) => {
    const v = rowVals(a);
    const mn = Math.min(...v), mx = Math.max(...v);
    if (crit === 'maximin') return mn;
    if (crit === 'maximax') return mx;
    if (crit === 'hurwicz') return alpha * mx + (1 - alpha) * mn;
    if (crit === 'laplace') return v.reduce((s, x) => s + x, 0) / v.length;
    if (crit === 'regret') {
      // minimize max regret ⇒ score = −maxRegret (higher better)
      const colMax = IG_STATES.map(s => Math.max(...IG_ACTS.map(aa => IG_PAY[aa.id][s.id])));
      const maxReg = Math.max(...IG_STATES.map((s, i) => colMax[i] - IG_PAY[a.id][s.id]));
      return -maxReg;
    }
    return 0;
  };
  const winner = IG_ACTS.slice().sort((a, b) => score(b) - score(a))[0];
  const critObj = CRITERIA.find(c => c.id === crit);
  return (
    <Card id="uncertainty" icon={Dices} title="Risk vs uncertainty vs ignorance" accent="amber" index={8}
          source="Knight 1921 · Wald · Hurwicz · Savage"
          subtitle="When you don't even know the probabilities, expected utility has nothing to average.">
      <p>
        Every card so far assumed the column probabilities were <em>given</em>. Frank Knight's 1921 distinction:
        <strong className="text-emerald-300"> risk</strong> is measurable uncertainty (you know the odds — a roulette
        wheel); <strong className="text-amber-300">uncertainty</strong> proper is when you <em>don't</em> (a brand-new
        market, a one-off startup). Push it further and you reach <strong>ignorance</strong>: no probabilities at all.
        Expected-utility maximization is now silent — there's nothing to weight the columns by — so a different family
        of decision rules takes over.
      </p>
      <p>
        Reframe the career bet with no odds: just a payoff grid, plus a third <strong className="text-sky-300">hedge</strong> act
        (keep the job, take a small angel stake). Pick a criterion and watch which act it crowns:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CRITERIA.map(c => (
            <button key={c.id} onClick={() => setCrit(c.id)}
              className={`text-[11px] px-2 py-1 rounded border transition-colors ${crit === c.id ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-white/15 text-neutral-400 hover:bg-white/5'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <PayoffMatrix acts={IG_ACTS} states={IG_STATES} payoffs={IG_PAY} highlight={winner.id} />
        {crit === 'hurwicz' && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-28">α · optimism</span>
            <input type="range" min={0} max={1} step={0.02} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} className="dt-range flex-1" />
            <span className="font-mono text-xs text-amber-200 w-10 text-right">{alpha.toFixed(2)}</span>
          </div>
        )}
        <div className="mt-3 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/5 px-3 py-2 text-xs text-fuchsia-100">
          <strong>{critObj.label}</strong> picks <strong>{winner.label}</strong> — <span className="text-neutral-300">{critObj.note}</span>.
        </div>
      </div>
      <WhenItMatters>
        The criteria genuinely disagree: only the pure pessimist (maximin) hugs the <span className="text-emerald-300">safe
        job</span> for its floor — maximax, Laplace, and even minimax-regret all swing to the <span className="text-amber-300">startup</span> (its
        worst regret is merely missing the safe floor in a bust, while every other act risks missing the boom). The
        <span className="text-sky-300"> hedge</span> is the perennial compromise: rarely anyone's top pick, never a
        disaster. There's no
        meta-criterion to choose among them from inside the theory — your stance toward ambiguity is an input, not an
        output. That's the uncomfortable honesty of decision under ignorance, explored further in the sibling{' '}
        <CrossLink to="/#deep-uncertainty" external recap="Knightian uncertainty, scenario planning, robust decision-making, real options — the full toolkit for when probabilities don't apply.">Deep Uncertainty</CrossLink> explainer.
      </WhenItMatters>
      <Misconception
        wrong="If you don’t know the probabilities, just assume every state is equally likely and maximize expected value."
        right="That’s the Laplace criterion — one option among several, and a strong assumption (the “principle of indifference”) that can be wildly wrong and is sensitive to how you carve up the states."
        because="Splitting “Mid” into two near-identical sub-states would silently double its weight under Laplace. Equiprobability is a choice about ignorance, not a neutral default." />
      <QA items={[
        { q: 'Why not always use maximin to be safe?', a: 'Because pure maximin is paralyzingly pessimistic: it judges every act solely by its worst cell and ignores everything else, so it will refuse hugely favorable gambles to avoid a tiny-probability bad state. It also isn’t even defined without choosing what counts as a “state”. It’s a stance (extreme ambiguity aversion), not the rational default.' },
        { q: 'What’s the difference between minimax-regret and maximin?', a: 'Maximin minimizes your worst outcome; minimax-regret minimizes your worst regret — the gap between what you got and the best you could have gotten in that state. Regret penalizes missing the boom, so it tends to favor hedges and middle options that are never far from optimal, rather than the absolute floor.' },
        { q: 'Is Knightian uncertainty just risk we’re too lazy to quantify?', a: 'Subjective-Bayesians say yes — you can always put a (subjective) prior on the states and collapse uncertainty back to risk (card 9). Others (and Ellsberg, card 13) argue ambiguity is a real, separate thing people rationally respond to. The career startup, a genuine one-off, is where this debate bites hardest.' },
      ]} />
    </Card>
  );
};

/* ---- Card 9 · Bayesian decision theory --------------------------------- */

const BayesCard = () => {
  const [prior, setPrior] = useState(0.30);     // P(startup is a "winner type")
  const [sens, setSens] = useState(0.80);       // P(signal | winner)
  const [fpr, setFpr]   = useState(0.30);       // P(signal | not winner)
  const [signal, setSignal] = useState(true);   // did the marquee customer sign?
  // posterior via Bayes
  const lik = signal ? { w: sens, n: fpr } : { w: 1 - sens, n: 1 - fpr };
  const post = (prior * lik.w) / (prior * lik.w + (1 - prior) * lik.n);
  // EU of bold under posterior: winner-type ⇒ better odds; loser-type ⇒ worse.
  // map type → outcome distribution, then expected $ (use as decision input)
  const evBoldGivenType = (good) => good
    ? 0.30 * 1200000 + 0.45 * 200000 + 0.25 * 30000   // winner type
    : 0.03 * 1200000 + 0.20 * 200000 + 0.77 * 30000;  // loser type
  const evBold = post * evBoldGivenType(true) + (1 - post) * evBoldGivenType(false);
  const takeBold = evBold > SAFE_SALARY;
  const Bar = ({ label, v, color }) => (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5"><span className="text-neutral-400">{label}</span><span className={`font-mono ${color}`}>{(v * 100).toFixed(0)}%</span></div>
      <div className="h-2 rounded bg-white/5 overflow-hidden"><div className="h-full rounded" style={{ width: `${v * 100}%`, background: 'currentColor' }} /></div>
    </div>
  );
  return (
    <Card id="bayes" icon={RefreshCw} title="Bayesian decision theory" accent="sky" index={9}
          source="Savage 1954 · Raiffa & Schlaifer"
          subtitle="Turn ignorance into risk: put a prior on the unknown, update it with evidence, then maximize.">
      <p>
        The Bayesian answer to card 8's discomfort: don't refuse to assign probabilities — assign <em>subjective</em>
        ones, then update them with data. A prior <Eq>{`\\pr{P(\\theta)}`}</Eq> over the unknown (is this startup a
        winner-type?), a likelihood <Eq>{`\\pr{P(\\text{signal}\\mid\\theta)}`}</Eq> for evidence, and Bayes' rule fuse
        them into a posterior. Then you're back on familiar ground: maximize <strong className="text-sky-300">posterior</strong> expected utility.
      </p>
      <Block>{`\\pr{P(\\theta\\mid e)} = \\frac{\\pr{P(e\\mid\\theta)}\\,\\pr{P(\\theta)}}{\\pr{P(e)}}, \\qquad \\eu{a^\\star} = \\arg\\max_a \\sum_\\theta \\pr{P(\\theta\\mid e)}\\,\\ut{u}(a,\\theta)`}</Block>
      <ReadEq>update belief with evidence (left), then choose the act with the highest expected utility under the <em>updated</em> belief (right). Evidence enters decisions only through the posterior.</ReadEq>
      <p>
        Concretely: you think there's a <strong>{(prior * 100).toFixed(0)}%</strong> chance the startup is a real
        winner. Then a marquee customer {signal ? 'signs' : "walks away"}. Winners land such customers
        {' '}{(sens * 100).toFixed(0)}% of the time; pretenders, {(fpr * 100).toFixed(0)}%. Update:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="text-sky-300 space-y-2">
          <Bar label="prior · P(winner)" v={prior} color="text-sky-300" />
        </div>
        <div className="text-emerald-300"><Bar label={`posterior · P(winner | ${signal ? 'signed' : 'walked'})`} v={post} color="text-emerald-300" /></div>
        <div className="grid sm:grid-cols-3 gap-2 pt-1">
          <label className="text-[10px] text-neutral-400">prior P(winner)
            <input type="range" min={0.02} max={0.95} step={0.01} value={prior} onChange={e => setPrior(parseFloat(e.target.value))} className="dt-range w-full mt-1" /></label>
          <label className="text-[10px] text-neutral-400">P(signal | winner)
            <input type="range" min={0.3} max={0.99} step={0.01} value={sens} onChange={e => setSens(parseFloat(e.target.value))} className="dt-range w-full mt-1" /></label>
          <label className="text-[10px] text-neutral-400">P(signal | pretender)
            <input type="range" min={0.01} max={0.7} step={0.01} value={fpr} onChange={e => setFpr(parseFloat(e.target.value))} className="dt-range w-full mt-1" /></label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">evidence</span>
          <button onClick={() => setSignal(true)} className={`text-[11px] px-2 py-1 rounded border ${signal ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/15 text-neutral-400'}`}>customer signed</button>
          <button onClick={() => setSignal(false)} className={`text-[11px] px-2 py-1 rounded border ${!signal ? 'border-rose-400/40 bg-rose-400/10 text-rose-200' : 'border-white/15 text-neutral-400'}`}>customer walked</button>
        </div>
        <div className={`rounded-md border px-3 py-2 text-xs ${takeBold ? 'border-amber-400/40 bg-amber-400/5 text-amber-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
          Posterior-weighted E[startup] = <strong>{fmt$(evBold)}</strong> vs safe {fmt$(SAFE_SALARY)} →{' '}
          <strong>{takeBold ? 'lean startup' : 'lean safe job'}</strong>. The single customer can flip the decision by
          moving the posterior across the break-even line.
        </div>
      </div>
      <WhenItMatters>
        The same machinery is the backbone of the sibling <CrossLink to="/#superforecasting" external recap="Base rates as priors, news as likelihoods, log-odds updating — the superforecaster’s core loop.">Superforecasting</CrossLink> explainer
        (base rate → update → forecast) and of A/B testing, spam filters, medical diagnosis, and search. Anywhere a
        decision waits on uncertain evidence, the Bayesian pattern is: <em>belief in, evidence through the likelihood,
        decision out the posterior</em>.
      </WhenItMatters>
      <Misconception
        wrong="The prior is unscientific bias, so a good analysis avoids it."
        right="Every decision under uncertainty uses a prior; the Bayesian just makes it explicit and auditable. Refusing to state one doesn’t remove it — it hides it in the method’s defaults."
        because="Maximum-likelihood, equal-weighting, and “let the data speak” all encode implicit priors. Stating yours lets others challenge it and lets evidence override it transparently." />
      <QA items={[
        { q: 'How does Bayesian decision theory dissolve the risk/uncertainty distinction from card 8?', a: 'By putting a subjective prior on the unknown states, it converts Knightian uncertainty into ordinary risk, after which expected-utility maximization applies. The cost is that the prior is a genuine input — two rational Bayesians with different priors can rationally choose differently until enough evidence swamps the gap.' },
        { q: 'Why weight by the posterior rather than just acting on the most likely state?', a: 'Because the best act balances all states by their probability and their stakes, not just the modal one. A 20%-likely catastrophe can dominate the decision even though the 80% case is benign. Maximizing posterior expected utility keeps the tails in the calculation; “act on the mode” throws them away.' },
        { q: 'Where do the likelihoods come from?', a: 'From a model of how evidence is generated given each hypothesis — base rates of marquee customers among real winners vs pretenders, here. Garbage likelihoods give garbage posteriors, so the modeling honesty lives in P(e|θ) just as much as in the prior. The value of gathering that evidence at all is card 11.' },
      ]} />
    </Card>
  );
};
/* ---- shared primitive · decision tree (backward induction) ------------- */
const fmtK = (v) => v >= 1e6 ? `$${(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)}M` : v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`;

// node: {type:'leaf', value} | {type:'chance'|'decision', label?, children:[{edge,p?,node}]}
const DecisionTree = ({ root, folded, width = 540 }) => {
  const data = useMemo(() => {
    const t = JSON.parse(JSON.stringify(root));
    let leaf = 0;
    const walk = (n, depth) => {
      n.depth = depth;
      if (n.type === 'leaf') { n.y = leaf++; return; }
      n.children.forEach(c => walk(c.node, depth + 1));
      n.y = n.children.reduce((s, c) => s + c.node.y, 0) / n.children.length;
      if (n.type === 'chance') n.value = n.children.reduce((s, c) => s + c.p * c.node.value, 0);
      else { // decision: pick max
        let bi = 0; n.children.forEach((c, i) => { if (c.node.value > n.children[bi].node.value) bi = i; });
        n.value = n.children[bi].node.value; n.best = bi;
      }
    };
    walk(t, 0);
    return { t, leaves: leaf };
  }, [root]);

  const maxDepth = 4;
  const P = 14, topP = 10;
  const dx = (width - 90 - P) / maxDepth;
  const dy = 40;
  const H = data.leaves * dy + topP * 2;
  const X = (d) => P + d * dx;
  const Y = (y) => topP + y * dy + dy / 2;

  const edges = [], nodes = [];
  const draw = (n, onOpt) => {
    const x = X(n.depth), y = Y(n.y);
    if (n.type !== 'leaf') {
      n.children.forEach((c, i) => {
        const cx = X(c.node.depth), cy = Y(c.node.y);
        const optEdge = onOpt && (n.type === 'chance' || i === n.best);
        edges.push({ x1: x, y1: y, x2: cx, y2: cy, opt: optEdge,
          label: c.edge, p: c.p, lx: (x + cx) / 2, ly: (y + cy) / 2 });
        draw(c.node, optEdge);
      });
    }
    nodes.push({ ...n, x, y, onOpt });
  };
  draw(data.t, true);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${H}`} className="block" style={{ maxWidth: width }}>
      {edges.map((e, i) => (
        <g key={i}>
          <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.opt ? '#6ee7b7' : 'rgba(255,255,255,0.18)'} strokeWidth={e.opt ? 2 : 1} />
          <text x={e.lx} y={e.ly - 3} fontSize="8.5" fill={e.opt ? '#6ee7b7' : 'rgba(255,255,255,0.5)'} textAnchor="middle" fontFamily="ui-sans-serif">
            {e.label}{e.p != null ? ` ·${e.p}` : ''}
          </text>
        </g>
      ))}
      {nodes.map((n, i) => {
        const x = n.x, y = n.y;
        if (n.type === 'leaf') {
          return <text key={i} x={x + 6} y={y + 3} fontSize="11" fill="#e5e5e5" fontFamily="ui-monospace, monospace">{fmtK(n.value)}</text>;
        }
        const showV = folded && n.value != null;
        return (
          <g key={i}>
            {n.type === 'decision'
              ? <rect x={x - 7} y={y - 7} width="14" height="14" rx="2" fill="#0a0a0a" stroke={n.onOpt ? '#6ee7b7' : '#c4b5fd'} strokeWidth="1.5" />
              : <circle cx={x} cy={y} r="7" fill="#0a0a0a" stroke={n.onOpt ? '#6ee7b7' : '#7dd3fc'} strokeWidth="1.5" />}
            {showV && <text x={x} y={y - 11} fontSize="9" fill={n.type === 'decision' ? '#6ee7b7' : '#7dd3fc'} textAnchor="middle" fontFamily="ui-monospace, monospace">{fmtK(n.value)}</text>}
          </g>
        );
      })}
    </svg>
  );
};

const CAREER_TREE = {
  type: 'decision', label: 'Year 0',
  children: [
    { edge: 'Safe job', node: { type: 'leaf', value: 120000 } },
    { edge: 'Join startup', node: {
      type: 'chance', label: 'first year',
      children: [
        { p: 0.4, edge: 'goes well', node: {
          type: 'decision', label: 'Year 1',
          children: [
            { edge: 'raise A', node: { type: 'chance', children: [
              { p: 0.4, edge: 'boom', node: { type: 'leaf', value: 1200000 } },
              { p: 0.6, edge: 'mid', node: { type: 'leaf', value: 200000 } },
            ] } },
            { edge: 'stay small', node: { type: 'leaf', value: 150000 } },
          ] } },
        { p: 0.6, edge: 'goes poorly', node: {
          type: 'decision', label: 'Year 1',
          children: [
            { edge: 'pivot', node: { type: 'chance', children: [
              { p: 0.3, edge: 'recover', node: { type: 'leaf', value: 200000 } },
              { p: 0.7, edge: 'fail', node: { type: 'leaf', value: 40000 } },
            ] } },
            { edge: 'quit', node: { type: 'leaf', value: 110000 } },
          ] } },
      ] } },
  ],
};

const TreeCard = () => {
  const [folded, setFolded] = useState(false);
  return (
    <Card id="tree" icon={GitBranch} title="Decision trees & backward induction" accent="violet" index={10}
          source="Raiffa 1968"
          subtitle="Sequential decisions: don't plan the whole path, solve from the leaves backward.">
      <p>
        Most real decisions aren't one-shot. You don't just "join the startup" — you join, watch the first year,
        then decide again: raise, stay small, pivot, or quit. Lay the choices and chance events out as a tree:
        <Chip color="violet">□ decision</Chip> nodes you control, <Chip color="sky">○ chance</Chip> nodes nature
        controls, payoffs at the leaves. The temptation is to plan a full path up front. The correct method is the
        opposite — <strong className="text-violet-300">backward induction</strong>: start at the leaves and fold the
        tree inward.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <DecisionTree root={CAREER_TREE} folded={folded} />
        <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => setFolded(f => !f)}
            className="text-xs rounded-md border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-100 px-3 py-1.5 flex items-center gap-1">
            <Workflow className="w-3.5 h-3.5" /> {folded ? 'hide values' : 'fold the tree (backward induction)'}
          </button>
          {folded && <span className="text-[11px] text-emerald-300 font-mono">optimal: Join → if well, raise · if poorly, quit · EV {fmtK(306000)}</span>}
        </div>
      </div>
      <p>
        Folding rule, leaf to root: at each <Chip color="sky">○ chance</Chip> node take the <em>expectation</em> over
        its branches; at each <Chip color="violet">□ decision</Chip> node take the <em>maximum</em> over yours, and
        remember which branch won. The number that propagates to the root is the decision's value; the remembered
        branches are the optimal <em>policy</em>.
      </p>
      <Worked title="reading the fold">
        <p>The “goes poorly” decision folds to <strong>quit ({fmtK(110000)})</strong>, not pivot — pivoting averages
        only {fmtK(88000)} (0.3·200k + 0.7·40k). The “goes well” decision folds to <strong>raise ({fmtK(600000)})</strong>.
        The first-year chance node then averages 0.4·600k + 0.6·110k = <strong>{fmtK(306000)}</strong>, which beats the
        safe {fmtK(120000)} — so <strong>Join</strong>. Crucially, the value of joining <em>depends on planning to quit
        if it goes badly</em>. Evaluate “join and always push” instead and the branch looks far worse.</p>
      </Worked>
      <MinSchema>
        Backward induction = dynamic programming. The value of a node is its <CrossLink to="/#control-theory" external recap="Bellman’s equation V(x)=max_u[r + V(next)]; LQR and decision trees are the same fold in different clothes.">Bellman</CrossLink> value;
        the remembered branches are the optimal policy. Decision trees, MDPs, and optimal control are one idea —
        solve the future first, because today's best move depends on how well you'll play tomorrow.
      </MinSchema>
      <Misconception
        wrong="To evaluate joining the startup, estimate the most likely path and add up its payoffs."
        right="Fold the whole tree backward, taking expectations at chance nodes and maxima at decision nodes. The value of an early choice depends on choosing optimally at every later node."
        because="Forward 'most-likely-path' reasoning ignores your future flexibility — the option to quit, pivot, or double down — which is often the largest part of an opportunity's value." />
      <QA items={[
        { q: 'Why solve backward instead of forward?', a: 'Because the best action now depends on how well you will act later, which is only known once the later subtrees are solved. Backward induction guarantees every future decision is already optimized when you evaluate the present one. Forward planning has to guess future behavior, and usually guesses “stick with the plan”, undervaluing flexibility.' },
        { q: 'The fold used expectations (EV) at chance nodes — what about risk aversion?', a: 'Replace each leaf’s dollars with its utility and fold expected utility instead; the mechanics are identical. Tree-folding is agnostic to what you put at the leaves — money, utility, or QALYs — which is why the same algorithm serves finance, medicine, and AI planning.' },
        { q: 'How does this connect to the option to wait?', a: 'The flexibility encoded in later decision nodes is exactly real-option value. Planning to quit-if-poorly is a put option on your career; it raises the value of joining. Decision trees make that option value explicit, whereas a single expected-value number hides it.' },
      ]} />
    </Card>
  );
};

/* ---- Card 11 · Value of information ------------------------------------ */

const VoiCard = () => {
  const [prior, setPrior] = useState(0.30);   // P(winner)
  const [acc, setAcc] = useState(0.80);       // test accuracy P(correct call | type)
  const [cost, setCost] = useState(40000);    // price of the trial (time + lost wages)
  const evGood = 500000, evBad = 60000;       // E[startup | type]
  // no info: best of safe vs prior-weighted bold
  const evBoldPrior = prior * evGood + (1 - prior) * evBad;
  const noInfo = Math.max(SAFE_SALARY, evBoldPrior);
  // perfect info: learn type, act optimally in each
  const perfect = prior * Math.max(SAFE_SALARY, evGood) + (1 - prior) * Math.max(SAFE_SALARY, evBad);
  const evpi = perfect - noInfo;
  // imperfect test of accuracy `acc`: P(call=winner). Use symmetric accuracy.
  const pW = prior, pL = 1 - prior;
  const pCallW = pW * acc + pL * (1 - acc);
  const postW_callW = (pW * acc) / pCallW;            // P(winner | call winner)
  const pCallL = 1 - pCallW;
  const postW_callL = (pW * (1 - acc)) / pCallL;       // P(winner | call loser)
  const actVal = (pw) => Math.max(SAFE_SALARY, pw * evGood + (1 - pw) * evBad);
  const withTest = pCallW * actVal(postW_callW) + pCallL * actVal(postW_callL);
  const evsi = withTest - noInfo;
  const net = evsi - cost;
  return (
    <Card id="voi" icon={Telescope} title="The value of information" accent="cyan" index={11}
          source="Howard 1966"
          subtitle="How much is the trial worth? Exactly how much it would change what you do.">
      <p>
        Before committing, you could pay for information — a 3-month paid trial, a due-diligence deep-dive, a chat with
        ex-employees. What's it worth? The decisive insight: information has value <strong className="text-cyan-300">only
        if it can change your decision</strong>. If you'd join regardless of what you learn, learning it is worth
        exactly $0, however interesting.
      </p>
      <Block>{`\\text{EVPI} = \\underbrace{E_\\theta\\big[\\max_a \\ut{u}(a,\\theta)\\big]}_{\\text{act knowing }\\theta} - \\underbrace{\\max_a E_\\theta[\\ut{u}(a,\\theta)]}_{\\text{best you can do blind}}`}</Block>
      <ReadEq>the value of <em>perfect</em> information is what you'd make acting with foresight minus what you make acting on the prior. It's always ≥ 0, and it caps what <em>any</em> test can be worth.</ReadEq>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="EVPI · perfect" value={fmtK(evpi)} color="text-cyan-300" sub="the ceiling" />
          <Stat label="EVSI · this trial" value={fmtK(evsi)} color="text-sky-300" sub={`${(acc*100).toFixed(0)}% accurate`} />
          <Stat label="net of cost" value={fmtK(net)} color={net > 0 ? 'text-emerald-300' : 'text-rose-300'} sub={net > 0 ? 'run the trial' : 'skip it'} />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3"><span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">prior P(winner)</span>
            <input type="range" min={0.02} max={0.95} step={0.01} value={prior} onChange={e => setPrior(parseFloat(e.target.value))} className="dt-range flex-1" /><span className="font-mono text-xs text-cyan-200 w-10 text-right">{(prior*100).toFixed(0)}%</span></div>
          <div className="flex items-center gap-3"><span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">test accuracy</span>
            <input type="range" min={0.5} max={1} step={0.01} value={acc} onChange={e => setAcc(parseFloat(e.target.value))} className="dt-range flex-1" /><span className="font-mono text-xs text-cyan-200 w-10 text-right">{(acc*100).toFixed(0)}%</span></div>
          <div className="flex items-center gap-3"><span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">trial cost</span>
            <input type="range" min={0} max={150000} step={5000} value={cost} onChange={e => setCost(parseInt(e.target.value))} className="dt-range flex-1" /><span className="font-mono text-xs text-cyan-200 w-12 text-right">{fmtK(cost)}</span></div>
        </div>
        <div className="mt-2 text-[11px] text-neutral-400">
          Notice EVPI collapses to <strong>$0</strong> when the prior is extreme (you've already decided, so nothing
          flips you) and peaks in the <em>middle</em>, where you're genuinely on the fence. A perfectly accurate test
          can't beat EVPI; a coin-flip test (50%) is worth nothing.
        </div>
      </div>
      <WhenItMatters>
        EVSI is the right budget for any experiment: A/B test sample size, a medical screen, a pilot study, a paid
        proof-of-concept. Spend on information up to its expected value of <em>changing the decision</em>, not a penny
        more — and never gather data you'd ignore. It's the formal version of "would this actually change my mind?"
      </WhenItMatters>
      <Predict question="You're 95% sure the startup is a winner. How much is even a perfect due-diligence report worth?">
        Almost nothing. At 95% prior you'll join either way — a perfect report mostly confirms what you'd already do,
        and only the rare 5% "it's actually a dud" finding changes anything. Information is worth most exactly when
        you're torn (prior near the break-even), and worth ≈$0 once you've effectively decided.
      </Predict>
      <Misconception
        wrong="More information is always worth gathering before a big decision."
        right="Information is worth only the improvement it produces in your expected payoff by changing your action — which can be, and often is, zero."
        because="If a finding wouldn’t alter your choice, paying to learn it is pure cost. EVPI caps the value, and it’s zero whenever you’d act the same way across every possible result." />
      <QA items={[
        { q: 'Why does EVPI go to zero at extreme priors?', a: 'Because the decision is no longer in doubt: at 95% you join, at 3% you don’t, and a report rarely says enough to overturn that. Value of information is the probability that the evidence flips your action times the payoff swing when it does — both shrink to zero as you become certain.' },
        { q: 'Can the value of information ever be negative?', a: 'Not in this framework: you can always ignore the information, so its option value is ≥ 0. (Negative “value of information” effects in real life come from costs, distraction, or being forced to reveal what you learn — not from the information itself.)' },
        { q: 'How is EVSI related to EVPI?', a: 'EVPI is the special case of a perfectly informative test and upper-bounds EVSI for any real (noisy) test. The closer your test’s accuracy to perfect and the more decision-relevant its signal, the closer EVSI climbs toward EVPI — but it can never exceed it.' },
      ]} />
    </Card>
  );
};

/* ---- Card 12 · Loss functions & statistical decision theory ------------ */

const RiskCurves = ({ cs, sigma2, width = 360, height = 200 }) => {
  const P = 34, Pt = 14, W = width, H = height;
  const thetaMax = 3;
  const R = (c, th) => c * c * sigma2 + (1 - c) * (1 - c) * th * th; // MSE = var + bias²
  const rMax = Math.max(...cs.map(c => R(c, thetaMax))) * 1.05;
  const sx = (th) => P + (th / thetaMax) * (W - P - Pt);
  const sy = (r) => H - P - (r / rMax) * (H - P - Pt);
  const colors = ['#fb7185', '#fbbf24', '#6ee7b7', '#7dd3fc'];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ maxWidth: W }}>
      <line x1={P} y1={H - P} x2={W - Pt} y2={H - P} stroke="rgba(255,255,255,0.25)" />
      <line x1={P} y1={H - P} x2={P} y2={Pt} stroke="rgba(255,255,255,0.25)" />
      <text x={(P + W) / 2} y={H - 4} fontSize="9" fill="rgba(255,255,255,0.45)" textAnchor="middle" fontFamily="ui-monospace, monospace">θ (true value, σ units) →</text>
      <text x={10} y={Pt + 4} fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">R(θ)</text>
      {cs.map((c, i) => {
        const pts = Array.from({ length: 41 }, (_, k) => { const th = (k / 40) * thetaMax; return `${sx(th).toFixed(1)},${sy(R(c, th)).toFixed(1)}`; }).join(' ');
        return <polyline key={i} fill="none" stroke={colors[i % colors.length]} strokeWidth="1.8" points={pts} />;
      })}
    </svg>
  );
};

const LossCard = () => {
  const [c, setC] = useState(0.6);
  const sigma2 = 1;
  const cs = [1, c, 0]; // MLE, your shrinkage, prior-mean
  const R = (cc, th) => cc * cc * sigma2 + (1 - cc) * (1 - cc) * th * th;
  const tau2 = 1.5;
  const bayesRisk = (cc) => cc * cc * sigma2 + (1 - cc) * (1 - cc) * tau2; // E_θ[R] with E[θ²]=τ²
  const cBayes = tau2 / (tau2 + sigma2);
  return (
    <Card id="loss" icon={Crosshair} title="Loss functions & statistical decision theory" accent="emerald" index={12}
          source="Wald 1950 · Berger"
          subtitle="Estimation is a decision too: pick the act (estimate) that minimizes expected loss.">
      <p>
        Statistical decision theory folds estimation into the same frame. The unknown <Eq>{`\\theta`}</Eq> is the
        startup's true value; your data <Eq>{`x`}</Eq> is a noisy read of it; the "act" is an estimate
        <Eq>{`\\delta(x)`}</Eq>; and a <strong className="text-emerald-300">loss function</strong> <Eq>{`L(\\theta,\\delta)`}</Eq>
        scores how wrong you are. Average the loss over the data and you get the <strong>risk function</strong>:
      </p>
      <Block>{`R(\\theta,\\delta) = E_x\\big[L(\\theta,\\delta(x))\\big] \\;\\overset{\\text{sq. err}}{=}\\; \\underbrace{c^2\\sigma^2}_{\\text{variance}} + \\underbrace{(1-c)^2\\theta^2}_{\\text{bias}^2} \\quad \\text{for } \\delta=cx`}</Block>
      <ReadEq>shrinking the estimate toward zero (<Eq>{`c<1`}</Eq>) cuts variance but adds bias. The risk function trades them off — and which <Eq>{`c`}</Eq> is best <em>depends on the true</em> <Eq>{`\\theta`}</Eq>, which you don't know. That's the whole difficulty.</ReadEq>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <RiskCurves cs={cs} sigma2={sigma2} />
        <div className="flex flex-wrap gap-3 text-[10px] font-mono mb-2">
          <span className="text-rose-300">■ c=1 · MLE (no shrink)</span>
          <span className="text-amber-300">■ c={c.toFixed(2)} · yours</span>
          <span className="text-emerald-300">■ c=0 · all-prior</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">shrinkage c</span>
          <input type="range" min={0} max={1} step={0.02} value={c} onChange={e => setC(parseFloat(e.target.value))} className="dt-range flex-1" />
          <span className="font-mono text-xs text-amber-200 w-10 text-right">{c.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Stat label="Bayes risk (τ²=1.5)" value={bayesRisk(c).toFixed(3)} color="text-violet-300" sub={`minimized at c*=${cBayes.toFixed(2)}`} />
          <Stat label="minimax (worst-case)" value={'c=1 → R≡' + sigma2.toFixed(2)} color="text-rose-300" sub="flat risk, no worst θ" />
        </div>
      </div>
      <p>
        Two ways to collapse the risk function into a single ranking, because "minimize <Eq>{`R(\\theta,\\cdot)`}</Eq>"
        is ill-posed when <Eq>{`\\theta`}</Eq> is unknown — exactly the risk-vs-uncertainty fork again:
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-violet-400/25 bg-violet-400/5 p-3">
          <div className="text-xs font-semibold text-violet-200 mb-1">Bayes risk</div>
          <div className="text-[12px] text-neutral-300 leading-snug">Average <Eq>{`R`}</Eq> over a prior <Eq>{`\\pr{\\pi(\\theta)}`}</Eq> and minimize. Gives the shrinkage <Eq>{`c^\\star=\\tau^2/(\\tau^2+\\sigma^2)`}</Eq> — the Bayesian's answer, identical to the posterior mean.</div>
        </div>
        <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
          <div className="text-xs font-semibold text-rose-200 mb-1">Minimax</div>
          <div className="text-[12px] text-neutral-300 leading-snug">Minimize the <em>worst-case</em> <Eq>{`R`}</Eq> over all <Eq>{`\\theta`}</Eq>. The MLE (<Eq>{`c=1`}</Eq>) has flat risk <Eq>{`\\sigma^2`}</Eq> — no θ is especially bad — so it's the cautious choice card 8's maximin would make.</div>
        </div>
      </div>
      <Deeper>
        <p>
          A rule is <strong>admissible</strong> if no other rule has risk ≤ it for all <Eq>{`\\theta`}</Eq> with strict
          improvement somewhere — i.e. it isn't uniformly dominated. On the chart, no curve sits entirely below another:
          shrinkage wins for small <Eq>{`\\theta`}</Eq> (near the prior), the MLE wins for large <Eq>{`\\theta`}</Eq>.
          That non-domination is why there's no single "best" estimator without committing to a prior or a worst-case
          stance — and Stein's famous paradox shows that in ≥3 dimensions even the venerable MLE becomes inadmissible,
          beaten everywhere by shrinkage. Loss functions are also where asymmetry lives: over-valuing the startup's
          equity (and joining a dud) may hurt far more than under-valuing it (and missing out) — an asymmetric loss
          shifts your optimal estimate away from the mean.
        </p>
      </Deeper>
      <Misconception
        wrong="The unbiased estimate (the MLE) is the objectively correct one."
        right="“Best” depends on the loss function and on what you assume about θ. A biased, shrunken estimate can dominate the MLE in expected loss, especially in many dimensions (Stein)."
        because="Unbiasedness is one property, not the goal; minimizing expected loss is. Trading a little bias for a lot less variance often lowers total risk, which is what actually matters for the decision." />
      <QA items={[
        { q: 'How is estimating a number a “decision”?', a: 'The estimate is an act, the true value is the unknown state, and the loss function is the negative payoff. Choosing an estimator to minimize expected loss is structurally identical to choosing an act to maximize expected utility — statistical decision theory is just decision theory with L = −u and θ as the state.' },
        { q: 'Why isn’t there a single best estimator?', a: 'Because risk is a function of the unknown θ, and different estimators win for different θ (non-domination/admissibility). To get a scalar you must either average over a prior (Bayes risk) or take the worst case (minimax) — the same risk-vs-uncertainty choice from card 8, now about estimators.' },
        { q: 'What does the loss function’s shape change?', a: 'Everything downstream. Squared-error loss makes the posterior mean optimal; absolute loss makes the median optimal; an asymmetric loss (where over- and under-estimating cost differently) shifts the optimal estimate off-center entirely. Pick the loss to match real consequences, not mathematical convenience.' },
      ]} />
    </Card>
  );
};
/* ---- shared primitive · Marschak–Machina probability triangle ---------- */
// axes: x = p(worst outcome), y = p(best outcome); feasible = lower-left triangle.
// EU indifference curves are PARALLEL straight lines of slope (u2−u1)/(u3−u2).
const LotterySimplex = ({ points = [], segments = [], euSlope = 0.63, fanning = false,
  width = 320, height = 290 }) => {
  const P = 30, Pt = 14, W = width, H = height;
  const sx = (p1) => P + p1 * (W - P - Pt);
  const sy = (p3) => H - P - p3 * (H - P - Pt);
  // EU lines p3 = c + slope·p1, for several intercepts c
  const lines = [];
  if (!fanning) {
    for (let c = -0.6; c <= 1.0; c += 0.2) {
      // clip line to triangle p1∈[0,1], p3∈[0,1], p1+p3≤1
      const segPts = [];
      for (let i = 0; i <= 30; i++) {
        const p1 = i / 30, p3 = c + euSlope * p1;
        if (p3 >= -1e-6 && p3 <= 1 + 1e-6 && p1 + p3 <= 1 + 1e-6) segPts.push(`${sx(p1).toFixed(1)},${sy(p3).toFixed(1)}`);
      }
      if (segPts.length > 1) lines.push(segPts.join(' '));
    }
  } else {
    // fanning-out: lines radiate from a focus to the lower-right (steeper toward worst corner)
    const fx = 1.6, fy = -0.7;
    for (let k = 0; k <= 6; k++) {
      const tp1 = 0, tp3 = k / 6; // anchor on left edge
      const segPts = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30, p1 = tp1 + t * (fx - tp1), p3 = tp3 + t * (fy - tp3);
        if (p3 >= -1e-6 && p3 <= 1 + 1e-6 && p1 >= 0 && p1 + p3 <= 1 + 1e-6) segPts.push(`${sx(p1).toFixed(1)},${sy(p3).toFixed(1)}`);
      }
      if (segPts.length > 1) lines.push(segPts.join(' '));
    }
  }
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ maxWidth: W }}>
      {/* triangle */}
      <polygon points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(0)},${sy(1)}`} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.25)" />
      {lines.map((l, i) => <polyline key={i} fill="none" stroke={fanning ? 'rgba(244,114,182,0.5)' : 'rgba(125,211,252,0.45)'} strokeWidth="1" points={l} />)}
      {/* segments connecting paired gambles */}
      {segments.map((s, i) => (
        <line key={i} x1={sx(s.from[0])} y1={sy(s.from[1])} x2={sx(s.to[0])} y2={sy(s.to[1])}
          stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="" />
      ))}
      {/* points */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={sx(pt.p[0])} cy={sy(pt.p[1])} r="5" fill={pt.color || '#f0abfc'} stroke="#0a0a0a" strokeWidth="1" />
          <text x={sx(pt.p[0]) + (pt.p[0] > 0.5 ? -8 : 8)} y={sy(pt.p[1]) + (pt.p[1] > 0.5 ? 14 : -6)}
            fontSize="10" fill="#e5e5e5" textAnchor={pt.p[0] > 0.5 ? 'end' : 'start'} fontFamily="ui-monospace, monospace">{pt.label}</text>
        </g>
      ))}
      <text x={sx(0)} y={H - 8} fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace">p(worst) →</text>
      <text x={sx(0) - 6} y={sy(1) - 4} fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace">p(best) ↑</text>
    </svg>
  );
};

/* ---- Card 13 · Allais & Ellsberg --------------------------------------- */

// Allais points in (p_worst=$0, p_best=$5M) coords; middle outcome $1M fills the rest
const ALLAIS = {
  '1A': { p: [0.00, 0.00], label: '1A · sure $1M', color: '#6ee7b7' },
  '1B': { p: [0.01, 0.10], label: '1B · gamble',  color: '#fbbf24' },
  '2A': { p: [0.89, 0.00], label: '2A',           color: '#6ee7b7' },
  '2B': { p: [0.90, 0.10], label: '2B',           color: '#fbbf24' },
};

const EllsbergUrns = () => {
  const [bet1, setBet1] = useState('known');   // bet red: known urn or unknown
  const [bet2, setBet2] = useState('known');   // bet black: known urn or unknown
  const contradiction = bet1 === 'known' && bet2 === 'known';
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="text-sm text-neutral-300 mb-2">
        Two urns, 100 balls each. <strong className="text-sky-300">Known</strong>: exactly 50 red, 50 black.
        <strong className="text-violet-300"> Unknown</strong>: some unknown mix of red and black. You win $100 on the color you bet.
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <div className="text-[11px] text-neutral-400 mb-1">Bet on <strong className="text-rose-300">RED</strong> — which urn?</div>
          <div className="flex gap-2">
            {['known', 'unknown'].map(u => (
              <button key={u} onClick={() => setBet1(u)} className={`text-[11px] px-2 py-1 rounded border flex-1 ${bet1 === u ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-white/15 text-neutral-400'}`}>{u}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-neutral-400 mb-1">Bet on <strong className="text-neutral-200">BLACK</strong> — which urn?</div>
          <div className="flex gap-2">
            {['known', 'unknown'].map(u => (
              <button key={u} onClick={() => setBet2(u)} className={`text-[11px] px-2 py-1 rounded border flex-1 ${bet2 === u ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-white/15 text-neutral-400'}`}>{u}</button>
            ))}
          </div>
        </div>
      </div>
      <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${contradiction ? 'border-rose-400/40 bg-rose-400/5 text-rose-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
        {contradiction
          ? <>You picked the <strong>known</strong> urn for both colors — the typical choice. But that says P(red in unknown) &lt; ½ <em>and</em> P(black in unknown) &lt; ½, which sum to less than 1. No probability assignment to the unknown urn explains you: this is <strong>ambiguity aversion</strong>, a preference for known odds that expected-utility theory can't represent.</>
          : <>This pattern <em>is</em> consistent with assigning the unknown urn a 50/50 split (or any single distribution). Most people don't choose this way — they shy from the ambiguous urn on both bets, which is the paradox.</>}
      </div>
    </div>
  );
};

const AllaisCard = () => {
  const [c1, setC1] = useState('A'); // pair 1 choice
  const [c2, setC2] = useState('B'); // pair 2 choice
  const violates = c1 !== c2; // (A,B) or (B,A) breaks independence
  return (
    <Card id="allais" icon={Triangle} title="Allais & Ellsberg: where EU breaks" accent="rose" index={13}
          source="Allais 1953 · Ellsberg 1961"
          subtitle="Two experiments most people 'fail' — and they reveal real structure, not just error.">
      <p>
        Expected-utility theory is airtight as <em>normative</em> theory. As a <em>description</em> of people it fails,
        and the failures are systematic enough to have their own theories. Two classics. First, Allais. Choose in each
        pair (the popular answers are pre-filled):
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { id: 1, val: c1, set: setC1, A: 'A · a certain $1M', B: 'B · 89% $1M, 10% $5M, 1% nothing' },
          { id: 2, val: c2, set: setC2, A: 'A · 11% $1M, 89% nothing', B: 'B · 10% $5M, 90% nothing' },
        ].map(pair => (
          <div key={pair.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">choice {pair.id}</div>
            {['A', 'B'].map(opt => (
              <button key={opt} onClick={() => pair.set(opt)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded border mb-1.5 transition-colors ${pair.val === opt ? 'border-rose-400/40 bg-rose-400/10 text-rose-100' : 'border-white/10 text-neutral-400 hover:bg-white/5'}`}>
                {opt === 'A' ? pair.A : pair.B}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={`rounded-md border px-3 py-2 text-xs ${violates ? 'border-rose-400/40 bg-rose-400/5 text-rose-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
        {violates
          ? <>You chose <strong>{c1}</strong> then <strong>{c2}</strong> — the famous Allais pattern, and it <strong>violates independence</strong>. Choice 2 is choice 1 with a common 89%-chance-of-$1M branch swapped for 89%-nothing in both options. Independence says that shared swap can't flip your ranking — yet it did.</>
          : <>You chose <strong>{c1}</strong> then <strong>{c2}</strong> — internally consistent with expected utility. (Most people pick 1A then 2B, which is <em>not</em>.)</>}
      </div>
      <p>
        The geometry makes it vivid. Plot the four gambles in the <strong className="text-sky-300">probability
        triangle</strong> (x = chance of the worst outcome, y = chance of the best). EU indifference curves are
        <em> parallel straight lines</em>; the two choice-pairs are connected by <span className="text-amber-300">parallel
        segments</span>. So an EU maximizer must rank both segments the same way. The Allais choice means your real
        indifference curves <strong>fan out</strong> instead of staying parallel:
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] text-center text-sky-300 mb-1">expected utility · parallel</div>
          <LotterySimplex
            points={Object.values(ALLAIS)}
            segments={[{ from: ALLAIS['1A'].p, to: ALLAIS['1B'].p }, { from: ALLAIS['2A'].p, to: ALLAIS['2B'].p }]}
          />
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="text-[10px] text-center text-rose-300 mb-1">actual behavior · fanning out</div>
          <LotterySimplex
            points={Object.values(ALLAIS)}
            segments={[{ from: ALLAIS['1A'].p, to: ALLAIS['1B'].p }, { from: ALLAIS['2A'].p, to: ALLAIS['2B'].p }]}
            fanning
          />
        </div>
      </div>
      <p>
        The driver is the <strong className="text-rose-300">certainty effect</strong>: the jump from 99% to 100% feels
        far bigger than 89% to 90%, though both are one-percentage-point changes. People over-value certainty — which
        is exactly why the sure {fmt$(SAFE_SALARY)} salary has a grip out of proportion to its expected value.
      </p>
      <p>Second, Ellsberg — about <em>ambiguity</em> rather than risk:</p>
      <EllsbergUrns />
      <WhenItMatters>
        Ambiguity aversion is the career bet's hidden thumb on the scale. The startup's odds are genuinely unknown
        (Knightian, card 8), and people discount unknown-probability prospects <em>extra</em>, beyond what risk
        aversion alone justifies. That's often rational insurance against model error — but it also means a great
        ambiguous opportunity gets under-taken relative to a mediocre one with legible odds.
      </WhenItMatters>
      <Misconception
        wrong="People who 'fail' Allais or Ellsberg are simply making math errors."
        right="The patterns are stable, reproduce under scrutiny, and reflect coherent alternative preferences (certainty effect, ambiguity aversion) — not arithmetic slips."
        because="When the independence/uncertainty violations are explained, most people keep their choices. That persistence is why prospect theory and ambiguity models exist: to describe these preferences, not to scold them." />
      <QA items={[
        { q: 'Exactly which axiom does Allais violate?', a: 'Independence. Choice 2 is obtained from choice 1 by replacing a common 89% chance of $1M with a common 89% chance of nothing in both options. Independence says altering a shared, identical component can’t reverse a preference — but the typical 1A-then-2B pattern reverses it.' },
        { q: 'Is the certainty effect irrational?', a: 'Normatively, yes — it breaks an axiom you’d endorse on reflection. Descriptively, it’s universal and arguably adaptive: certainty has real value (no variance, no regret, easier planning). Prospect theory (card 14) builds it in via a probability-weighting function that overweights certainty and small probabilities.' },
        { q: 'How is Ellsberg different from Allais?', a: 'Allais keeps probabilities known and violates independence over risk. Ellsberg introduces unknown probabilities (ambiguity) and shows people pay to avoid them — a phenomenon outside standard EU entirely, since EU assumes a single probability for every event. It motivates maxmin-expected-utility and other ambiguity models.' },
      ]} />
    </Card>
  );
};

/* ---- Card 14 · Prospect theory & framing ------------------------------- */

const ValueFn = ({ alpha = 0.7, lambda = 2.25, width = 250, height = 200 }) => {
  const P = 8, W = width, H = height, cx = W / 2, cy = H / 2, R = 1;
  const v = (x) => x >= 0 ? Math.pow(x, alpha) : -lambda * Math.pow(-x, alpha);
  const vmax = Math.max(v(1), -v(-1));
  const sx = (x) => cx + x * (W / 2 - P);
  const sy = (val) => cy - (val / vmax) * (H / 2 - P);
  const pts = Array.from({ length: 61 }, (_, i) => { const x = -1 + (2 * i) / 60; return `${sx(x).toFixed(1)},${sy(v(x)).toFixed(1)}`; }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ maxWidth: W }}>
      <line x1={P} y1={cy} x2={W - P} y2={cy} stroke="rgba(255,255,255,0.25)" />
      <line x1={cx} y1={P} x2={cx} y2={H - P} stroke="rgba(255,255,255,0.25)" />
      <polyline fill="none" stroke="#c4b5fd" strokeWidth="2" points={pts} />
      <circle cx={cx} cy={cy} r="2.5" fill="#fff" />
      <text x={W - P} y={cy - 5} fontSize="8.5" fill="rgba(255,255,255,0.45)" textAnchor="end">gains →</text>
      <text x={P} y={cy + 12} fontSize="8.5" fill="rgba(255,255,255,0.45)">← losses</text>
      <text x={cx + 4} y={P + 8} fontSize="8.5" fill="rgba(255,255,255,0.45)">value</text>
    </svg>
  );
};

const WeightFn = ({ gamma = 0.65, width = 250, height = 200 }) => {
  const P = 24, W = width, H = height;
  const w = (p) => Math.pow(p, gamma) / Math.pow(Math.pow(p, gamma) + Math.pow(1 - p, gamma), 1 / gamma);
  const sx = (p) => P + p * (W - 2 * P);
  const sy = (val) => H - P - val * (H - 2 * P);
  const pts = Array.from({ length: 51 }, (_, i) => { const p = i / 50; return `${sx(p).toFixed(1)},${sy(w(p)).toFixed(1)}`; }).join(' ');
  const diag = `${sx(0)},${sy(0)} ${sx(1)},${sy(1)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block" style={{ maxWidth: W }}>
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="rgba(255,255,255,0.25)" />
      <line x1={P} y1={H - P} x2={P} y2={P} stroke="rgba(255,255,255,0.25)" />
      <polyline fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" points={diag} />
      <polyline fill="none" stroke="#fbbf24" strokeWidth="2" points={pts} />
      <text x={(W) / 2} y={H - 6} fontSize="8.5" fill="rgba(255,255,255,0.45)" textAnchor="middle">p →</text>
      <text x={P - 4} y={P + 4} fontSize="8.5" fill="rgba(255,255,255,0.45)" textAnchor="end">w(p)</text>
    </svg>
  );
};

const ProspectCard = () => {
  const [alpha, setAlpha] = useState(0.7);
  const [lambda, setLambda] = useState(2.25);
  const [gamma, setGamma] = useState(0.65);
  const [frame, setFrame] = useState('gain');
  return (
    <Card id="prospect" icon={LineChart} title="Prospect theory & framing" accent="violet" index={14}
          source="Kahneman & Tversky 1979"
          subtitle="The descriptive theory that won a Nobel: reference points, loss aversion, weighted probabilities.">
      <p>
        Prospect theory keeps the spirit of expected utility but bends three things to match how people actually
        choose. Outcomes are <strong className="text-violet-300">gains and losses</strong> from a reference point (not
        absolute wealth); the value function is concave for gains, convex for losses, and <strong className="text-rose-300">steeper
        for losses</strong> (loss aversion, <Eq>{`\\lambda \\approx 2.25`}</Eq>); and probabilities are run through a
        <strong className="text-amber-300"> weighting function</strong> that overweights the rare and the certain.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">value function v(x)</div>
          <ValueFn alpha={alpha} lambda={lambda} />
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2"><span className="text-[9px] text-neutral-500 w-16">curvature α</span>
              <input type="range" min={0.3} max={1} step={0.02} value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} className="dt-range flex-1" /></div>
            <div className="flex items-center gap-2"><span className="text-[9px] text-neutral-500 w-16">loss-av. λ</span>
              <input type="range" min={1} max={4} step={0.05} value={lambda} onChange={e => setLambda(parseFloat(e.target.value))} className="dt-range flex-1" /><span className="text-[10px] font-mono text-rose-300 w-8">{lambda.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">prob. weighting w(p)</div>
          <WeightFn gamma={gamma} />
          <div className="mt-2 flex items-center gap-2"><span className="text-[9px] text-neutral-500 w-16">curvature γ</span>
            <input type="range" min={0.3} max={1} step={0.02} value={gamma} onChange={e => setGamma(parseFloat(e.target.value))} className="dt-range flex-1" /></div>
          <div className="mt-1 text-[10px] text-neutral-400 leading-snug">Below the diagonal in the middle (underweight moderate odds), above it near 0 and 1 (overweight rare events and certainty). The inverse-S that makes people buy both lottery tickets and insurance.</div>
        </div>
      </div>
      <p>
        The kink at the reference point is why <strong>framing</strong> moves choices that EU says are identical.
        The same career outcome described as a gain or a loss flips preferences:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setFrame('gain')} className={`text-[11px] px-3 py-1 rounded border ${frame === 'gain' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/15 text-neutral-400'}`}>gain frame</button>
          <button onClick={() => setFrame('loss')} className={`text-[11px] px-3 py-1 rounded border ${frame === 'loss' ? 'border-rose-400/40 bg-rose-400/10 text-rose-200' : 'border-white/15 text-neutral-400'}`}>loss frame</button>
        </div>
        {frame === 'gain' ? (
          <div className="text-sm text-neutral-300">
            “Take the safe job and you <strong className="text-emerald-300">keep</strong> a guaranteed {fmt$(SAFE_SALARY)}.”
            Against a gain reference, the sure gain is concave-valued and attractive — people turn <strong>risk-averse</strong> and take the salary.
          </div>
        ) : (
          <div className="text-sm text-neutral-300">
            “Turn down the startup and you <strong className="text-rose-300">forgo</strong> the {fmt$(1200000)} upside you could have had.”
            Reframed as a loss, the convex loss region makes people <strong>risk-seeking</strong> to avoid it — and now the startup tempts. Identical facts, opposite choice.
          </div>
        )}
      </div>
      <Misconception
        wrong="Loss aversion just means people are risk-averse."
        right="Loss aversion is a kink at the reference point — losses hurt ~2× more than equal gains please — and it makes people risk-SEEKING over losses, the opposite of risk aversion."
        because="A risk-averse utility is concave everywhere; prospect theory’s value function is convex below the reference point, so people gamble to avoid a sure loss. The reference point, not the wealth level, governs the attitude." />
      <QA items={[
        { q: 'How does prospect theory relate to expected-utility theory?', a: 'It’s a descriptive generalization: replace utility-of-wealth with value-of-change-from-reference, and replace probabilities with decision weights. EU is the special case with a fixed reference, no loss-aversion kink, and w(p)=p. Prospect theory deliberately sacrifices the normative cleanliness to fit behavior.' },
        { q: 'Why do the same people buy insurance AND lottery tickets?', a: 'The probability-weighting function overweights small probabilities. A tiny chance of a huge loss (insurable) is overweighted, so insurance feels worth it; a tiny chance of a huge gain (lottery) is overweighted too, so the ticket feels worth it. One bent w(p) explains both, which EU cannot.' },
        { q: 'Can framing effects be defended as rational?', a: 'Rarely on reflection — if you’d choose differently based purely on wording of identical outcomes, you’re exploitable (a money-pump cousin). The practical lesson is prescriptive: neutralize framing by restating every option in absolute terms before deciding, which is what good decision analysis forces.' },
      ]} />
    </Card>
  );
};

/* ---- Card 15 · Heuristics, biases & bounded rationality ---------------- */

const BIASES = [
  { id: 'anchor', label: 'Anchoring', mult: 1.9, note: 'The $1.2M headline number anchors your estimate; you adjust down too little from it.' },
  { id: 'avail', label: 'Availability', mult: 1.6, note: 'A friend’s unicorn exit is vivid and recent, so you overweight how common big exits are.' },
  { id: 'baserate', label: 'Base-rate neglect', mult: 1.7, note: 'You focus on this startup’s great pitch and ignore the 60% base rate of fizzling.' },
  { id: 'overconf', label: 'Overconfidence', mult: 1.5, note: '“I’ll make it work” — you shrink the perceived variance and inflate your own effect.' },
  { id: 'sunk', label: 'Sunk cost', mult: 1.4, note: 'You already spent months advising them, so you over-value staying in to “not waste” it.' },
  { id: 'lossav', label: 'Loss aversion', mult: 0.6, note: 'Framing equity as money you could lose makes you undervalue the gamble (see card 14).' },
];

const HeuristicsCard = () => {
  const [bias, setBias] = useState('anchor');
  const b = BIASES.find(x => x.id === bias);
  const trueEV = boldEV;
  const perceived = trueEV * b.mult;
  const maxScale = trueEV * 2;
  return (
    <Card id="heuristics" icon={Brain} title="Heuristics, biases & bounded rationality" accent="amber" index={15}
          source="Tversky–Kahneman · Simon · Gigerenzer"
          subtitle="Real deciders have finite time and attention — they substitute fast rules, which bias predictably.">
      <p>
        Cards 13–14 catalog <em>where</em> EU breaks; this one explains <em>why</em>. Herbert Simon's answer:
        <strong className="text-amber-300"> bounded rationality</strong>. Real decision-makers can't enumerate every
        act, state, and probability — they <em>satisfice</em> (take the first option that's good enough) and lean on
        fast <strong>heuristics</strong>. Heuristics are often brilliant under time pressure, but they bias in
        predictable directions. Watch each one distort the perceived value of the startup:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {BIASES.map(x => (
            <button key={x.id} onClick={() => setBias(x.id)} className={`text-[11px] px-2 py-1 rounded border ${bias === x.id ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-white/15 text-neutral-400 hover:bg-white/5'}`}>{x.label}</button>
          ))}
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] mb-0.5"><span className="text-neutral-400">true E[startup]</span><span className="font-mono text-emerald-300">{fmt$(trueEV)}</span></div>
            <div className="h-3 rounded bg-white/5 overflow-hidden"><div className="h-full bg-emerald-400/60" style={{ width: `${(trueEV / maxScale) * 100}%` }} /></div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-0.5"><span className="text-neutral-400">perceived under {b.label}</span><span className={`font-mono ${b.mult > 1 ? 'text-rose-300' : 'text-sky-300'}`}>{fmt$(perceived)} · {b.mult > 1 ? '+' : ''}{Math.round((b.mult - 1) * 100)}%</span></div>
            <div className="h-3 rounded bg-white/5 overflow-hidden"><div className={`h-full ${b.mult > 1 ? 'bg-rose-400/60' : 'bg-sky-400/60'}`} style={{ width: `${clamp((perceived / maxScale) * 100, 0, 100)}%` }} /></div>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-amber-100">{b.note}</div>
      </div>
      <p>
        Note these mostly push the <em>same</em> direction (over-valuing the vivid jackpot) — biases aren't random
        noise that averages out, they're correlated distortions. That's why "just be rational" fails as advice; the
        prescriptive fix is structural: <strong>reference classes</strong> (what fraction of similar startups actually
        exited?), pre-committed checklists, and outside-view forecasting — the toolkit of the sibling{' '}
        <CrossLink to="/#superforecasting" external recap="Base rates, Fermi estimates, premortems — debiasing techniques that beat raw intuition.">Superforecasting</CrossLink> explainer.
      </p>
      <Misconception
        wrong="Heuristics are just cognitive defects we’d be better off without."
        right="Heuristics are efficient adaptations to limited time and information; they’re often near-optimal and only bias in specific, learnable situations."
        because="Under real constraints, fast-and-frugal rules (recognition, take-the-best) can match or beat full optimization. The goal isn’t to eliminate heuristics but to know the few environments where they misfire and patch those." />
      <QA items={[
        { q: 'Is bounded rationality the same as irrationality?', a: 'No. Bounded rationality is optimal-given-constraints: the best you can do with finite time, memory, and information. It explains why heuristics exist without labeling people stupid. Irrationality is a separate claim — choosing against your own considered interests even when the constraints don’t force it.' },
        { q: 'Why don’t biases cancel out across many decisions?', a: 'Because they’re systematic, not random. Anchoring, availability, and base-rate neglect mostly pull the startup’s perceived value the same way (up), so they compound rather than average to zero. Correlated error is exactly what debiasing procedures and outside-view forecasting are built to counter.' },
        { q: 'What actually debiases a decision like this?', a: 'Structure beats willpower: gather the base rate (reference class of comparable startups), state your prior explicitly (card 9), compute value of information before gathering more (card 11), and run a premortem (“it’s two years later and this failed — why?”). These force the slow, statistical view that heuristics bypass.' },
      ]} />
    </Card>
  );
};
/* ---- Card 16 · Multi-attribute utility --------------------------------- */

const MAUT_ATTRS = [
  { id: 'pay', label: 'Pay', w0: 30 },
  { id: 'upside', label: 'Upside', w0: 20 },
  { id: 'learning', label: 'Learning', w0: 20 },
  { id: 'mission', label: 'Mission', w0: 15 },
  { id: 'balance', label: 'Work–life', w0: 15 },
];
const MAUT_SCORE = {
  safe:  { pay: 80, upside: 10, learning: 40, mission: 30, balance: 80, color: 'emerald' },
  hedge: { pay: 65, upside: 45, learning: 60, mission: 55, balance: 55, color: 'sky' },
  bold:  { pay: 30, upside: 95, learning: 90, mission: 85, balance: 25, color: 'amber' },
};
const MAUT_ACTS = [['safe', 'Safe job'], ['hedge', 'Hedge'], ['bold', 'Startup']];

const InfluenceDiagram = ({ width = 360, height = 130 }) => {
  const N = (x, y, w, h, type, label, fill) => ({ x, y, w, h, type, label, fill });
  const nodes = [
    N(10, 50, 60, 30, 'dec', 'choice', '#6ee7b7'),
    N(140, 12, 64, 26, 'unc', 'market', '#7dd3fc'),
    N(140, 78, 64, 26, 'unc', 'fit', '#c4b5fd'),
    N(280, 48, 66, 34, 'val', 'utility', '#f0abfc'),
  ];
  const arrows = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3]];
  const cx = (n) => n.x + n.w / 2, cy = (n) => n.y + n.h / 2;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block" style={{ maxWidth: width }}>
      <defs>
        <marker id="idarrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.5)" />
        </marker>
      </defs>
      {arrows.map(([a, b], i) => {
        const A = nodes[a], B = nodes[b];
        return <line key={i} x1={cx(A) + A.w / 2} y1={cy(A)} x2={B.x - 3} y2={cy(B)} stroke="rgba(255,255,255,0.35)" strokeWidth="1" markerEnd="url(#idarrow)" />;
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.type === 'dec'
            ? <rect x={n.x} y={n.y} width={n.w} height={n.h} fill="#0a0a0a" stroke={n.fill} strokeWidth="1.5" />
            : n.type === 'val'
              ? <polygon points={`${n.x},${cy(n)} ${cx(n)},${n.y} ${n.x + n.w},${cy(n)} ${cx(n)},${n.y + n.h}`} fill="#0a0a0a" stroke={n.fill} strokeWidth="1.5" />
              : <ellipse cx={cx(n)} cy={cy(n)} rx={n.w / 2} ry={n.h / 2} fill="#0a0a0a" stroke={n.fill} strokeWidth="1.5" />}
          <text x={cx(n)} y={cy(n) + 3} fontSize="10" fill={n.fill} textAnchor="middle" fontFamily="ui-sans-serif">{n.label}</text>
        </g>
      ))}
      <text x={40} y={98} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">□ decision</text>
      <text x={172} y={120} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">◯ uncertainty</text>
      <text x={313} y={98} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle">◇ value</text>
    </svg>
  );
};

const MautCard = () => {
  const [w, setW] = useState(Object.fromEntries(MAUT_ATTRS.map(a => [a.id, a.w0])));
  const total = MAUT_ATTRS.reduce((s, a) => s + w[a.id], 0) || 1;
  const util = (act) => MAUT_ATTRS.reduce((s, a) => s + (w[a.id] / total) * MAUT_SCORE[act][a.id], 0);
  const scored = MAUT_ACTS.map(([id, label]) => ({ id, label, u: util(id), color: MAUT_SCORE[id].color })).sort((a, b) => b.u - a.u);
  const winner = scored[0];
  return (
    <Card id="maut" icon={Sliders} title="Multi-attribute utility" accent="sky" index={16}
          source="Keeney & Raiffa 1976"
          subtitle="The job was never only about money. Trade competing objectives with weights.">
      <p>
        Real choices have many axes. The career bet isn't just dollars — it's pay, equity upside, how much you'll
        learn, whether the mission moves you, and what it does to your life outside work. Multi-attribute utility
        theory scores each option on each attribute and combines them with weights. Under a mild independence
        condition, the combination is just a weighted sum:
      </p>
      <Block>{`U(\\text{act}) = \\sum_i \\ut{w_i}\\,\\ut{u_i}(x_i), \\qquad \\sum_i \\ut{w_i}=1`}</Block>
      <ReadEq>each attribute gets its own sub-utility and a weight; total utility is the weighted average. The weights encode <em>your</em> tradeoffs — and they're the whole ballgame.</ReadEq>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="space-y-1.5 mb-3">
          {MAUT_ATTRS.map(a => (
            <div key={a.id} className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 w-20">{a.label}</span>
              <input type="range" min={0} max={50} step={1} value={w[a.id]} onChange={e => setW(prev => ({ ...prev, [a.id]: parseInt(e.target.value) }))} className="dt-range flex-1" />
              <span className="text-[10px] font-mono text-sky-300 w-10 text-right">{Math.round((w[a.id] / total) * 100)}%</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {scored.map(s => (
            <div key={s.id}>
              <div className="flex justify-between text-[11px] mb-0.5"><Chip color={s.color}>{s.label}</Chip><span className={`font-mono ${s.id === winner.id ? 'text-fuchsia-300' : 'text-neutral-300'}`}>{s.u.toFixed(1)}{s.id === winner.id ? ' ★' : ''}</span></div>
              <div className="h-2.5 rounded bg-white/5 overflow-hidden"><div className="h-full rounded" style={{ width: `${s.u}%`, background: s.id === winner.id ? '#f0abfc' : 'rgba(255,255,255,0.25)' }} /></div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-neutral-400">Crank <strong>Pay</strong> and <strong>Work–life</strong> and the safe job wins; crank <strong>Upside</strong>, <strong>Learning</strong>, and <strong>Mission</strong> and the startup does. The decision is a statement about your weights.</div>
      </div>
      <p>
        Formalize the wiring and you get an <strong className="text-sky-300">influence diagram</strong> — a compact DAG
        of <Chip color="emerald">□ decisions</Chip>, <Chip color="sky">◯ uncertainties</Chip>, and a{' '}
        <Chip color="fuchsia">◇ value</Chip> node — which is just the <CrossLink to="tree" recap="Influence diagrams compile to decision trees; they’re the compact graph form of the same backward-induction problem.">decision tree</CrossLink> of
        card 10 in compressed, graphical form:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3"><InfluenceDiagram /></div>
      <Misconception
        wrong="A good decision tool will tell you the objectively best job."
        right="It tells you which job is best given your weights and sub-utilities. Those inputs are irreducibly personal; the method makes them explicit and consistent, not objective."
        because="Multi-attribute utility can’t manufacture a tradeoff rate between money and mission out of nowhere — it elicits yours and applies it without contradiction. Garbage weights in, garbage ranking out." />
      <QA items={[
        { q: 'When is the simple weighted sum valid?', a: 'When attributes are “preferentially independent” — your tradeoff between, say, pay and balance doesn’t depend on the learning level. When attributes interact strongly (mission only matters if pay clears a threshold), you need a multiplicative or more general multi-attribute form. The additive model is a useful, often-good approximation.' },
        { q: 'How do I get the weights without fooling myself?', a: 'Elicit them from concrete tradeoffs (“how much pay would you give up to double the learning?”), not by directly typing percentages — direct weights are notoriously unstable and sensitive to how attributes are described/split. Swing weighting and trade-off elicitation are the standard debiasing protocols.' },
        { q: 'Why bother with the influence diagram if it’s equivalent to a tree?', a: 'Compactness and communication. Trees blow up exponentially with stages; influence diagrams stay small by showing dependencies as edges, and they make conditional-independence structure (what each node actually depends on) visible at a glance. They compile down to a tree for solving.' },
      ]} />
    </Card>
  );
};

/* ---- Card 17 · Causal vs evidential decision theory -------------------- */

const NewcombDag = ({ mode, width = 340, height = 150 }) => {
  // nodes: Type (common cause), Choice, Success
  const nodes = {
    type: { x: 150, y: 14, label: 'founder type', c: '#c4b5fd' },
    choice: { x: 40, y: 100, label: 'your choice', c: '#6ee7b7' },
    succ: { x: 250, y: 100, label: 'success', c: '#fbbf24' },
  };
  const N = (k) => ({ cx: nodes[k].x + 44, cy: nodes[k].y + 14 });
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block" style={{ maxWidth: width }}>
      <defs>
        <marker id="ndag" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.55)" /></marker>
        <marker id="ndagR" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#fb7185" /></marker>
      </defs>
      {/* type → choice (common cause) */}
      <line x1={N('type').cx - 30} y1={N('type').cy + 6} x2={N('choice').cx + 10} y2={N('choice').cy - 12} stroke="rgba(196,181,253,0.7)" strokeWidth="1.3" markerEnd="url(#ndag)" />
      {/* type → success */}
      <line x1={N('type').cx + 30} y1={N('type').cy + 6} x2={N('succ').cx - 10} y2={N('succ').cy - 12} stroke="rgba(196,181,253,0.7)" strokeWidth="1.3" markerEnd="url(#ndag)" />
      {/* choice → success : present (solid) in causal view; severed (dashed/red) shows the question */}
      <line x1={N('choice').cx + 18} y1={N('choice').cy} x2={N('succ').cx - 18} y2={N('succ').cy}
        stroke={mode === 'causal' ? '#6ee7b7' : '#fb7185'} strokeWidth="1.5"
        strokeDasharray={mode === 'causal' ? '0' : '4 3'} markerEnd={mode === 'causal' ? 'url(#ndag)' : 'url(#ndagR)'} />
      {Object.entries(nodes).map(([k, n]) => (
        <g key={k}>
          <rect x={n.x} y={n.y} width="88" height="28" rx="6" fill="#0a0a0a" stroke={n.c} strokeWidth="1.5" />
          <text x={n.x + 44} y={n.y + 18} fontSize="10" fill={n.c} textAnchor="middle" fontFamily="ui-sans-serif">{n.label}</text>
        </g>
      ))}
      <text x={width / 2} y={height - 4} fontSize="9" fill="rgba(255,255,255,0.45)" textAnchor="middle">
        {mode === 'causal' ? 'does choosing bold CAUSE success?' : 'or is bold-choice just EVIDENCE of the lucky type?'}
      </text>
    </svg>
  );
};

const CdtEdtCard = () => {
  const [mode, setMode] = useState('evidential');
  return (
    <Card id="cdtedt" icon={Split} title="Causal vs evidential decision theory" accent="violet" index={17}
          source="Nozick 1969 · Newcomb’s problem"
          subtitle="The deepest open fault line: should you choose what causes good outcomes, or what predicts them?">
      <p>
        Everything so far quietly assumed your act and its consequences are linked <em>causally</em>. Newcomb's problem
        breaks that. Here's the career version. A legendary investor — the "Oracle" — is uncannily accurate at reading
        founders. Yesterday she already decided whether to pre-wire a <strong className="text-amber-300">$1M</strong> follow-on,
        based on predicting whether you'll go <strong>all-in</strong> (quit your job entirely) or <strong>hedge</strong> (keep a
        foot in both). If she predicted all-in, the $1M is already loaded into the company; if hedge, nothing.
        Now <em>you</em> choose — and her prediction is fixed and unseen.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
          <div className="text-xs font-semibold text-emerald-200 mb-1">Evidential DT (EDT)</div>
          <div className="text-[12px] text-neutral-300 leading-snug">Choose the act that's the best <em>news</em> — maximize EU conditioning on your choice. Going all-in is strong evidence she predicted all-in (the $1M is there), so <strong>go all-in</strong>.</div>
        </div>
        <div className="rounded-lg border border-sky-400/25 bg-sky-400/5 p-3">
          <div className="text-xs font-semibold text-sky-200 mb-1">Causal DT (CDT)</div>
          <div className="text-[12px] text-neutral-300 leading-snug">Choose the act that <em>causes</em> the best outcome — the wire already happened and your choice can't change it. So <strong>hedge</strong>: you pocket the salary <em>plus</em> whatever's already loaded. Hedging dominates.</div>
        </div>
      </div>
      <p>
        Both arguments are airtight; they recommend opposite acts. The crux is the diagram. There's a hidden
        <strong className="text-violet-300"> common cause</strong> — your "founder type" — that drives both your
        inclination <em>and</em> the Oracle's prediction (and arguably your success). EDT reads the choice→success
        correlation; CDT asks only whether choice <em>causes</em> success. Toggle the question:
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex gap-2 mb-2">
          <button onClick={() => setMode('evidential')} className={`text-[11px] px-3 py-1 rounded border ${mode === 'evidential' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/15 text-neutral-400'}`}>evidential view</button>
          <button onClick={() => setMode('causal')} className={`text-[11px] px-3 py-1 rounded border ${mode === 'causal' ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-white/15 text-neutral-400'}`}>causal view</button>
        </div>
        <NewcombDag mode={mode} />
      </div>
      <p>
        The same structure is the <strong>smoking lesion</strong> (and Pearl's whole point in the sibling{' '}
        <CrossLink to="/#causal-inference" external recap="The do-operator: P(Y|do(X)) cuts incoming arrows to X, isolating causation from the common-cause correlation EDT rides.">Causal Inference</CrossLink> explainer):
        a hidden "founder gene" causes both risk-taking and success. Taking the bold job is <em>evidence</em> you have
        the gene, but choosing it doesn't <em>install</em> the gene. EDT is tempted by the good news; CDT (and most
        decision theorists today) says act on causal impact — use Pearl's <Eq>{`P(Y\\mid do(X))`}</Eq>, which severs
        the common-cause arrow.
      </p>
      <Misconception
        wrong="Rational choice is whatever maximizes expected utility — and there’s only one way to compute that."
        right="There are (at least) two: conditioning on your act (evidential) vs. intervening on it (causal). They disagree whenever your choice correlates with the state through a common cause it doesn’t control."
        because="In ordinary problems the act has no common cause with the outcome, so EDT and CDT agree and the distinction is invisible. Newcomb and the smoking lesion are engineered to pull them apart — which is why they’re philosophically load-bearing." />
      <QA items={[
        { q: 'Which is correct, CDT or EDT?', a: 'Unsettled, but most decision theorists favor causal decision theory: you should act on what your choice brings about, not on what it merely indicates about an already-fixed world. Newer “functional” theories (FDT/UDT) try to get the one-boxer’s payoff in Newcomb while keeping causal discipline elsewhere — by treating your decision procedure, not just this act, as the thing being chosen.' },
        { q: 'Why does this matter outside philosophy puzzles?', a: 'Because confusing evidence with causation is the most common real decision error. “Successful people do X, so I’ll do X” is EDT reasoning that’s only valid if X causes success rather than co-occurring with a hidden type. The entire field of causal inference exists to get the do-operator right in exactly these situations.' },
        { q: 'How does it connect to the career bet?', a: 'The seductive pitch “founders who leap tend to win” is a common-cause correlation: a trait drives both leaping and winning. Before leaping for that reason, ask the causal question — would leaping improve my odds, holding my type fixed? — not the evidential one. Otherwise you’re one-boxing on your own selection effect.' },
      ]} />
    </Card>
  );
};

/* ---- Card 18 · Social choice & Arrow ----------------------------------- */

const SOCIAL_OPTS = { S: 'Safe', H: 'Hedge', B: 'Bold' };
const SOCIAL_PRESETS = {
  cycle: { you: ['S', 'H', 'B'], partner: ['H', 'B', 'S'], cofounder: ['B', 'S', 'H'] },
  agree: { you: ['H', 'S', 'B'], partner: ['H', 'B', 'S'], cofounder: ['H', 'S', 'B'] },
};

const SocialCard = () => {
  const [profile, setProfile] = useState(SOCIAL_PRESETS.cycle);
  const voters = ['you', 'partner', 'cofounder'];
  const prefers = (voter, a, b) => profile[voter].indexOf(a) < profile[voter].indexOf(b);
  const pair = (a, b) => {
    const av = voters.filter(v => prefers(v, a, b)).length;
    return av >= 2 ? a : b;
  };
  const SH = pair('S', 'H'), HB = pair('H', 'B'), SB = pair('S', 'B');
  // detect cycle: each option wins exactly one pairwise → cycle
  const winsOf = { S: 0, H: 0, B: 0 };
  [['S', 'H', SH], ['H', 'B', HB], ['S', 'B', SB]].forEach(([, , w]) => winsOf[w]++);
  const cyclic = winsOf.S === 1 && winsOf.H === 1 && winsOf.B === 1;
  const condorcet = Object.entries(winsOf).find(([, n]) => n === 2)?.[0];
  return (
    <Card id="social" icon={Users} title="Social choice & Arrow's theorem" accent="cyan" index={18}
          source="Condorcet 1785 · Arrow 1951"
          subtitle="The career bet is a household vote. Aggregating rational individuals can produce an irrational group.">
      <p>
        The decision isn't always yours alone — you, your partner, and a co-founder each have coherent preferences
        over Safe / Hedge / Bold, and you must pick <em>together</em>. Surely three rational people can be combined into
        a rational group? Condorcet's 1785 shock: <strong className="text-rose-300">no</strong>. Majority rule over
        their rankings can cycle.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setProfile(SOCIAL_PRESETS.cycle)} className="text-[11px] px-2 py-1 rounded border border-rose-400/30 text-rose-300 hover:bg-rose-400/10">cyclic profile</button>
          <button onClick={() => setProfile(SOCIAL_PRESETS.agree)} className="text-[11px] px-2 py-1 rounded border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10">consensus profile</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {voters.map(v => (
            <div key={v} className="rounded border border-white/10 bg-white/[0.02] p-2">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{v}</div>
              <div className="text-xs font-mono text-neutral-200">{profile[v].map(o => SOCIAL_OPTS[o]).join(' ≻ ')}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[['Safe vs Hedge', SH], ['Hedge vs Bold', HB], ['Safe vs Bold', SB]].map(([lbl, w], i) => (
            <div key={i} className="rounded border border-white/10 bg-white/[0.02] p-2">
              <div className="text-[9px] text-neutral-500">{lbl}</div>
              <div className="font-mono text-sky-300 mt-0.5">{SOCIAL_OPTS[w]} wins</div>
            </div>
          ))}
        </div>
        <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${cyclic ? 'border-rose-400/40 bg-rose-400/5 text-rose-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
          {cyclic
            ? <>Majority prefers <strong>{SOCIAL_OPTS[SH]}</strong> to one, that to another, and back again — a <strong>Condorcet cycle</strong>. The group has no best option, and whoever sets the agenda (which pair to vote on first) controls the outcome. Three rational people; one irrational group.</>
            : <>Majority gives a clear winner: <strong>{condorcet ? SOCIAL_OPTS[condorcet] : '—'}</strong> beats both others (a Condorcet winner). Consensus dodges the paradox — but it isn't guaranteed to exist.</>}
        </div>
      </div>
      <p>
        Maybe majority rule is just a bad method? Kenneth Arrow's 1951 theorem says the rot is fundamental.
        <strong className="text-cyan-300"> No</strong> voting rule can satisfy all of a few minimal fairness conditions
        at once, for 3+ options:
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {[
          ['Unrestricted domain', 'Works for any profile of rational individual rankings.'],
          ['Pareto', 'If everyone prefers A to B, the group does too.'],
          ['Independence of irrelevant alternatives', 'The group’s A-vs-B ranking depends only on individuals’ A-vs-B rankings, not on a third option C.'],
          ['Non-dictatorship', 'No single person’s ranking is always the group’s, ignoring everyone else.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
            <div className="text-xs font-semibold text-cyan-200 mb-1">{t}</div>
            <div className="text-[11px] text-neutral-300 leading-snug">{d}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-300">
        <strong className="text-cyan-300">Arrow's impossibility theorem:</strong> the only rule satisfying the first
        three is a dictatorship. You can have fair <em>or</em> coherent group preferences, not both — guaranteed.
      </p>
      <WhenItMatters>
        Arrow is why "let's just aggregate everyone's preferences optimally" has no clean answer — in committees, board
        votes, recommender systems, and RLHF reward aggregation alike. The escape hatches all <em>relax</em> an
        assumption: allow cardinal utilities (range voting), restrict to single-peaked preferences (median voter),
        or accept some agenda-dependence. There's no free lunch, only chosen tradeoffs.
      </WhenItMatters>
      <Misconception
        wrong="Voting paradoxes happen because voters are irrational or strategic."
        right="Condorcet cycles arise from perfectly sincere, perfectly transitive individual preferences. The incoherence is created by the aggregation, not the voters."
        because="Each person here has a clean transitive ranking; majority rule still cycles. Arrow proves it’s not a fixable bug in one method but a structural impossibility for all of them." />
      <QA items={[
        { q: 'How can three transitive voters produce an intransitive group?', a: 'Because majority rule throws away information about preference intensity and about the rest of each ranking when comparing a pair. Different majorities form on different pairs (a different two-thirds each time), and there’s no guarantee those overlapping majorities are consistent. Transitivity of individuals doesn’t transfer to the aggregate.' },
        { q: 'Does Arrow’s theorem doom democracy?', a: 'No — it shows no rule is perfect, not that all rules are equally bad. Real systems pick which axiom to relax (IIA is the usual casualty, e.g. by using utility magnitudes). It’s a warning against believing any single voting method is uniquely “correct”, and an explanation for agenda-setting power.' },
        { q: 'What’s the connection back to individual decision theory?', a: 'A single agent’s preferences must be transitive (card 2) on pain of a money pump. Arrow shows the analogous demand on groups is unsatisfiable: you can’t build a money-pump-proof collective preference from individual ones without a dictator — partly because vNM utilities aren’t interpersonally comparable (card 4).' },
      ]} />
    </Card>
  );
};

/* ---- Card 19 · The game-theory boundary -------------------------------- */

// 2x2 prisoner's-dilemma: you vs co-founder, Grind or Coast. payoff [you, them]
const GAME = {
  grind: { grind: [3, 3], coast: [0, 5] },
  coast: { grind: [5, 0], coast: [1, 1] },
};
const GameMatrix = () => {
  // your best response to each of their moves; their best response to each of yours
  const yourBR = { grind: (GAME.grind.grind[0] >= GAME.coast.grind[0] ? 'grind' : 'coast'), coast: (GAME.grind.coast[0] >= GAME.coast.coast[0] ? 'grind' : 'coast') };
  const theirBR = { grind: (GAME.grind.grind[1] >= GAME.grind.coast[1] ? 'grind' : 'coast'), coast: (GAME.coast.grind[1] >= GAME.coast.coast[1] ? 'grind' : 'coast') };
  const isNash = (me, them) => yourBR[them] === me && theirBR[me] === them;
  const moves = ['grind', 'coast'];
  return (
    <table className="text-sm border-separate border-spacing-1 mx-auto">
      <thead>
        <tr>
          <th></th>
          <th colSpan={2} className="text-[10px] uppercase tracking-widest text-neutral-500 font-normal pb-1">co-founder</th>
        </tr>
        <tr>
          <th className="text-[10px] uppercase tracking-widest text-neutral-500 font-normal">you ↓</th>
          {moves.map(m => <th key={m} className="text-[11px] text-sky-300 font-normal px-2">{m}</th>)}
        </tr>
      </thead>
      <tbody>
        {moves.map(me => (
          <tr key={me}>
            <td className="text-[11px] text-emerald-300 pr-1">{me}</td>
            {moves.map(them => {
              const [yu, th] = GAME[me][them];
              const nash = isNash(me, them);
              const yBest = yourBR[them] === me;
              const tBest = theirBR[me] === them;
              return (
                <td key={them} className={`px-3 py-2 rounded-md border text-center font-mono ${nash ? 'border-fuchsia-400/50 bg-fuchsia-400/10' : 'border-white/10 bg-white/[0.02]'}`}>
                  <span className={yBest ? 'text-emerald-300 font-bold' : 'text-neutral-400'}>{yu}</span>
                  <span className="text-neutral-600">,</span>
                  <span className={tBest ? 'text-sky-300 font-bold' : 'text-neutral-400'}>{th}</span>
                  {nash && <div className="text-[8px] text-fuchsia-300 uppercase tracking-wider mt-0.5">Nash</div>}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const GameCard = () => (
  <Card id="game" icon={Grid3x3} title="The boundary with game theory" accent="emerald" index={19}
        source="von Neumann · Nash 1950"
        subtitle="When the 'state of the world' is another mind choosing at the same time, decision theory becomes game theory.">
    <p>
      One assumption has held all along: nature draws the state <em>indifferently</em> — the dice don't care what you
      pick. Drop it. When the other "player" is a person optimizing <em>against</em> you, their choice is your state,
      and yours is theirs. That mutual dependence is <strong className="text-emerald-300">game theory</strong>, and it
      starts where single-agent decision theory ends. The career bet has these everywhere: negotiating equity with the
      founder, or splitting effort with a co-founder.
    </p>
    <Intuition>
      <p>
        The vocabulary, from scratch. A <strong>strategy</strong> is a complete plan of action (here: <em>grind</em> or
        <em> coast</em>). A <strong>payoff matrix</strong> lists what each pair of strategies pays each player —
        cell entries are (your payoff, their payoff). A <strong>best response</strong> is your payoff-maximizing move
        <em> given</em> what they do. And a <strong className="text-fuchsia-300">Nash equilibrium</strong> is a cell
        where both are simultaneously best-responding — neither can profit by unilaterally switching. It's the
        game-theory analogue of "no money left on the table".
      </p>
    </Intuition>
    <p>
      You and your co-founder each choose to <strong>grind</strong> (costly effort) or <strong>coast</strong>
      (free-ride). The startup does best if both grind, but each individually does better by coasting whatever the
      other does. Bold numbers = that player's best response:
    </p>
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <GameMatrix />
      <div className="mt-3 text-[11px] text-neutral-400 text-center">
        Coasting is a <strong>dominant strategy</strong> for both (its payoffs beat grinding in every column / row).
        So the unique <span className="text-fuchsia-300">Nash equilibrium</span> is <strong>(coast, coast) = (1, 1)</strong> —
        even though <strong>(grind, grind) = (3, 3)</strong> is better for everyone. Individual rationality lands on a
        collectively worse outcome.
      </div>
    </div>
    <p>
      This is the <strong className="text-emerald-300">prisoner's dilemma</strong>, and it's why "just both work hard"
      isn't self-enforcing: the equilibrium is the trap, not the ideal. Escaping it needs something <em>outside</em> the
      one-shot game — vesting schedules, repeated interaction (you'll play again tomorrow), reputation, or a binding
      contract. Mechanism design is the art of reshaping the payoff matrix so the Nash equilibrium <em>is</em> the
      outcome you want.
    </p>
    <MinSchema>
      Decision theory: one agent vs. indifferent nature → maximize expected utility. Game theory: many agents vs. each
      other → Nash equilibrium (mutual best response). The first is the special case of the second with a single
      player. Beyond this boundary lies the sandbox's missing sibling — a full game-theory explainer.
    </MinSchema>
    <Misconception
      wrong="A Nash equilibrium is the best outcome the players can reach."
      right="It’s the stable outcome under selfish unilateral deviation — which can be Pareto-inferior to other cells, as in the prisoner’s dilemma (1,1) vs (3,3)."
      because="Nash only requires that no one can improve by changing their own move alone. Coordinated change can help everyone, but it isn’t a unilateral deviation, so the equilibrium concept doesn’t capture it." />
    <QA items={[
      { q: 'Why can’t I treat the other player as just another uncertain “state”?', a: 'You can — but only if their move is fixed independent of yours. When they’re best-responding to their prediction of you (who is best-responding to them…), the state is endogenous to your choice. That fixed-point coupling is what Nash equilibrium solves and what a one-sided expected-utility calculation misses.' },
      { q: 'Does a Nash equilibrium always exist?', a: 'In pure strategies, not always; but Nash proved every finite game has at least one equilibrium in mixed (randomized) strategies. The prisoner’s dilemma is unusually clean — a single pure-strategy equilibrium reached by dominance, so no randomization is needed.' },
      { q: 'How do real co-founders escape the dilemma?', a: 'By changing the game. Vesting cliffs, equity that rewards joint success, repeated interaction with the threat of future retaliation, and reputation all alter the payoff matrix so that grinding becomes a best response. That’s exactly mechanism design — engineering the rules so the selfish equilibrium coincides with the cooperative outcome.' },
    ]} />
  </Card>
);
/* ---- Card 20 · Synthesis: the career bet, every lens (SPINE) ----------- */

const LENS_SCORECARD = [
  { lens: 'Expected value', to: 'frame', verdict: 'lean Bold — $198k > $120k on average', tone: 'amber' },
  { lens: 'Expected utility', to: 'vnm', verdict: 'lean Safe once your curvature k > ~1.4', tone: 'emerald' },
  { lens: 'Risk vs ignorance', to: 'uncertainty', verdict: 'split — maximin says Safe, maximax/regret say Bold', tone: 'neutral' },
  { lens: 'Bayesian update', to: 'bayes', verdict: 'a single marquee customer can flip the call', tone: 'sky' },
  { lens: 'Decision tree', to: 'tree', verdict: 'lean Bold — but only if you plan to quit-if-poorly', tone: 'violet' },
  { lens: 'Value of information', to: 'voi', verdict: 'run the paid trial only while you’re near the fence', tone: 'cyan' },
  { lens: 'Prospect / framing', to: 'prospect', verdict: 'your choice flips with the frame — restate it neutrally', tone: 'violet' },
  { lens: 'Heuristics', to: 'heuristics', verdict: 'you’re likely over-valuing the jackpot — get the base rate', tone: 'rose' },
  { lens: 'Causal vs evidential', to: 'cdtedt', verdict: 'don’t leap because “founders who leap win” (common cause)', tone: 'violet' },
  { lens: 'Game theory', to: 'game', verdict: 'co-founder effort is a prisoner’s dilemma — get vesting in writing', tone: 'emerald' },
];

const AnchorCard = () => {
  const [k, setK] = useState(2.0);
  const [guess, setGuess] = useState(120000);
  const [revealed, setRevealed] = useState(false);
  // CE of BOLD lottery under exponential utility, curvature k over [0,1.2M]
  const uN = (w) => { const t = clamp(w / 1200000, 0, 1); return Math.abs(k) < 1e-6 ? t : (1 - Math.exp(-k * t)) / (1 - Math.exp(-k)); };
  const uInv = (u) => (Math.abs(k) < 1e-6 ? u : -Math.log(1 - u * (1 - Math.exp(-k))) / k) * 1200000;
  const euBold = BOLD.reduce((s, o) => s + o.p * uN(o.x), 0);
  const ceBold = uInv(euBold);
  const takeBold = ceBold > SAFE_SALARY;
  const toneText = { emerald: 'text-emerald-300', amber: 'text-amber-300', sky: 'text-sky-300', violet: 'text-violet-300', rose: 'text-rose-300', cyan: 'text-cyan-300', neutral: 'text-neutral-300' };
  return (
    <Card id="anchor" icon={Sparkles} title="Synthesis: the career bet, every lens" accent="fuchsia" index={20} anchor
          subtitle="One decision, eleven lenses. Here is what the whole field actually says to do.">
      <p>
        We've run the same decision — <strong className="text-emerald-300">safe {fmt$(SAFE_SALARY)} salary</strong> vs.
        <strong className="text-amber-300"> startup equity</strong> averaging {fmt$(boldEV)} — through every tool in the
        field. None of them hands you a universal answer, because there isn't one: the right choice genuinely depends on
        your curvature, your wealth, your ambiguity attitude, and your read of the odds. What the field <em>does</em> give
        you is a complete, consistent account of <strong>which inputs decide it</strong> and where your intuition will
        mislead you. The scorecard:
      </p>
      <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.03] divide-y divide-white/5">
        {LENS_SCORECARD.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <CrossLink to={r.to}><span className="text-[11px]">{r.lens}</span></CrossLink>
            <span className={`flex-1 text-xs ${toneText[r.tone]}`}>{r.verdict}</span>
          </div>
        ))}
      </div>
      <p>
        The single number that collapses it all is the <strong className="text-rose-300">certainty equivalent</strong> of
        the startup: the guaranteed salary that would leave you exactly indifferent to the equity gamble. If your safe
        offer beats it, take the salary; if not, leap. Commit a guess, then reveal it for your risk attitude:
      </p>
      <div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 p-4">
        <div className="text-[11px] text-neutral-300 mb-2">At curvature k = {k.toFixed(1)}, what sure salary equals the startup equity to you?</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-neutral-500 font-mono">$</span>
          <input type="number" step="5000" value={guess} onChange={e => setGuess(parseFloat(e.target.value) || 0)}
            className="w-28 text-[13px] font-mono px-2 py-1 rounded border border-fuchsia-400/30 bg-fuchsia-400/5 text-fuchsia-100" />
          <button onClick={() => setRevealed(true)} className="text-[11px] font-mono px-3 py-1 rounded border border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-100 hover:bg-fuchsia-400/25">reveal</button>
          {revealed && (
            <span className="text-[12px] font-mono text-emerald-200">
              CE = {fmt$(ceBold)} · Δ {fmtN((guess - ceBold) / 1000, 0)}k
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 w-24">risk aversion k</span>
          <input type="range" min={0} max={5} step={0.1} value={k} onChange={e => { setK(parseFloat(e.target.value)); }} className="dt-range flex-1" />
          <span className="font-mono text-xs text-fuchsia-200 w-8 text-right">{k.toFixed(1)}</span>
        </div>
        <div className={`mt-2 rounded-md border px-3 py-2 text-xs ${takeBold ? 'border-amber-400/40 bg-amber-400/5 text-amber-200' : 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200'}`}>
          CE of the startup = <strong>{fmt$(ceBold)}</strong> {takeBold ? '>' : '<'} safe {fmt$(SAFE_SALARY)} →{' '}
          <strong>{takeBold ? 'take the startup' : 'take the safe job'}</strong>. The startup’s {fmt$(boldEV)} expected
          value is worth only {fmt$(ceBold)} in guaranteed dollars to a person this risk-averse — the entire wedge is
          the risk premium.
        </div>
      </div>
      <Predict question="Is there a curvature where the CE drops below even the $30k bust outcome?">
        No — the certainty equivalent of a gamble can never fall below its worst outcome (you’re guaranteed at least
        {' '}{fmt$(30000)}). As k → ∞ the CE approaches the {fmt$(30000)} floor: an infinitely risk-averse person values
        the startup at exactly its worst case, treating the upside as if it will never arrive. That’s the maximin agent
        of card 8, recovered as the limit of extreme concavity.
      </Predict>
      <div className="mt-4 border-l-4 border-fuchsia-400/50 pl-4 py-1">
        <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300 mb-1">the honest verdict</div>
        <p className="text-sm text-neutral-200 leading-snug">
          Decision theory will not tell you whether to take the startup. It tells you that the question is your risk
          curvature and your read of the odds — not the expected value — and it tells you exactly how to combine them,
          where your gut will lie to you, and what information is worth buying first. That’s not a cop-out; it's the
          difference between a decision you can defend and a coin you flipped while telling yourself a story.
        </p>
      </div>
      <QA items={[
        { q: 'So what should I actually do?', a: 'Estimate three things honestly: your risk curvature (would you really take a 60% chance of near-zero income?), your true odds (the base rate for startups like this, not the founder’s pitch), and your wealth buffer (how many months can you survive the bust?). Plug them in. If the certainty equivalent clears your safe offer, leap — and get the co-founder vesting and a quit-if-poorly plan in writing. If not, decline without regret.' },
        { q: 'Why did every lens give a slightly different verdict?', a: 'Because each isolates a different consideration: EV ignores risk, EU prices it, the ignorance criteria handle unknown odds, prospect theory predicts your likely mistake. They don’t contradict — they layer. The synthesis is using EU as the spine and the others as corrections: debias the inputs (heuristics, framing), get the causal direction right (CDT), value information before gathering it, and remember the co-founder is a strategic player, not weather.' },
        { q: 'What’s the one thing to carry away?', a: 'Maximize expected utility, not expected value — and treat everything else in this explainer as either a tool for getting the utility and probabilities right, or a warning about how you’ll get them wrong. The gap between $198k of expected value and what the startup is actually worth to you is the whole subject, made precise.' },
      ]} />
    </Card>
  );
};

const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" accent="cyan" index={21}>
    <p className="text-sm text-neutral-300">
      Three moves, start to finish. The <CrossLink to="frame" recap="Acts you choose, states you don’t, outcomes in the cells — and the gap between expected value and the right choice.">career bet</CrossLink> named
      the problem: a decision where expected value and the rational choice point different ways. The toolkit —
      <CrossLink to="vnm" recap="Four axioms force expected-utility maximization; the spine everything builds on."> expected utility</CrossLink>,
      risk pricing, Bayesian updating, decision trees, value of information — gave one way after another to find the
      right act. And the <CrossLink to="anchor" recap="Eleven lenses on one decision, collapsed to a certainty equivalent.">synthesis</CrossLink> held
      them all to a single number. The throughline is one object — expected utility — wearing different clothes for
      risk, uncertainty, information, and strategy.
    </p>
    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'the same lens, applied elsewhere in this sandbox',
        items: [
          { label: 'The Retail Quant’s Stack — Kelly sizing', href: '/#retail-quant',
            note: 'How much of your capital to stake follows from CRRA/log utility (card 7). The career bet is one Kelly bet on your human capital.' },
          { label: 'Superforecasting — the Bayesian core', href: '/#superforecasting',
            note: 'Base rates as priors, news as likelihoods, log-odds updating — the practical engine behind card 9, and the antidote to the biases of card 15.' },
          { label: 'Causal Inference — the do-operator', href: '/#causal-inference',
            note: 'P(Y | do X) vs P(Y | X) is exactly the causal-vs-evidential split of card 17. Pearl’s machinery for not one-boxing on a selection effect.' },
          { label: 'Control Theory — Bellman & dynamic programming', href: '/#control-theory',
            note: 'Backward induction (card 10) is the Bellman equation; LQR and decision trees are the same fold. Sequential decisions at scale.' },
          { label: 'Deep Uncertainty — when odds don’t exist', href: '/#deep-uncertainty',
            note: 'The full toolkit for Knightian uncertainty (card 8): scenario planning, robust decision-making, real options, adaptive pathways.' },
        ],
      },
      {
        title: 'Threads left loose',
        note: 'where a second pass would go deeper',
        items: [
          { label: 'A full game-theory explainer',
            note: 'Card 19 only touched the boundary. Mixed strategies, repeated games, bargaining, mechanism design, evolutionary games — the sandbox’s most obvious missing sibling.' },
          { label: 'Savage’s subjective-probability foundations',
            note: 'We took probabilities as given or subjective-by-fiat. Savage’s axioms derive both utility AND probability jointly from preferences over acts — the deepest version of the representation theorem.' },
          { label: 'Functional / updateless decision theory',
            note: 'Card 17’s frontier: choosing your decision procedure rather than this act, to capture Newcomb’s one-box payoff without abandoning causal discipline. The live research program in AI alignment.' },
          { label: 'Robust & distributionally-robust decisions',
            note: 'Minimax over a set of priors (Gilboa–Schmeidler maxmin EU) formalizes ambiguity aversion (card 13) — decisions that hedge against your own model being wrong.' },
        ],
      },
    ]} />
    <div className="mt-5 border-l-4 border-cyan-400/50 pl-4 py-1">
      <Quote className="w-4 h-4 text-cyan-300 mb-1" />
      <p className="text-sm text-neutral-200 italic leading-snug">
        A decision is a choice of act under uncertainty about the state. Rationality doesn’t tell you what to want —
        only how to want it without contradiction, and how not to be robbed for the difference.
      </p>
    </div>
  </Card>
);

/* ============================================================================
   FOOTER
   ========================================================================== */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>sources:</span>
        <span className="text-emerald-300">von Neumann–Morgenstern 1944 · Savage 1954</span>
        <span className="text-amber-300">Kahneman–Tversky 1979 · Ellsberg 1961</span>
        <span className="text-violet-300">Raiffa · Berger (statistical DT)</span>
        <span className="text-fuchsia-300">Arrow 1951 · Nozick 1969 (Newcomb)</span>
      </div>
      <p className="max-w-xl mx-auto">
        The career bet (a sure salary vs. startup-equity lottery) is a toy with numbers chosen so that
        expected value and the rational choice pull in different directions — exactly the gap the field
        is about. Sibling explainers in this sandbox: <em>Superforecasting</em>, <em>The Retail Quant’s
        Stack</em>, <em>Causal Inference</em>, <em>Control Theory</em>.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function DecisionTheoryExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].dt-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].dt-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #6ee7b7; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(110,231,183,0.4);
        }
        input[type=range].dt-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #6ee7b7; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <FrameCard />
        <PreferencesCard />
        <UtilityCard />
        <VnmCard />
        <MoneyPumpCard />
        <EvEuCard />
        <RiskAversionCard />
        <UncertaintyCard />
        <BayesCard />
        <TreeCard />
        <VoiCard />
        <LossCard />
        <AllaisCard />
        <ProspectCard />
        <HeuristicsCard />
        <MautCard />
        <CdtEdtCard />
        <SocialCard />
        <GameCard />
        <AnchorCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
