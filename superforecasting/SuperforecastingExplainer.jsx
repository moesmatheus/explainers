import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Target, Crosshair, Scale, ListChecks, Compass, FlaskConical,
  HelpCircle, Eye, EyeOff, Lightbulb, Link2, Ruler, Activity,
  AlertTriangle, CheckCircle2, XCircle, ChevronDown, BarChart3,
  Sigma, Layers, GitBranch, ShieldAlert, Telescope, Hourglass,
  Rocket, Quote, ArrowRight, Sparkles, BookOpen, Brain, Network,
  TrendingUp, TrendingDown, Dice5, ScrollText, Gauge, Star,
} from 'lucide-react';

/* ============================================================================
   Superforecasting — judgmental forecasting under uncertainty & ambiguity
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

// Note: hex colors inside macros must double the '#' (KaTeX uses '#' for params).
const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber — numbers
  '\\hi':  '\\textcolor{##fb7185}{#1}',  // rose — emphasis / wrong
  '\\co':  '\\textcolor{##7dd3fc}{#1}',  // sky — concepts
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',  // emerald — good / right
  '\\vi':  '\\textcolor{##c4b5fd}{#1}',  // violet — operators
  '\\fu':  '\\textcolor{##f0abfc}{#1}',  // fuchsia — anchor / synthesis
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

// --- card primitives --------------------------------------------------------

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
            {anchor && <span className="text-fuchsia-300 inline-flex items-center gap-1"><Star className="w-3 h-3 fill-fuchsia-300" /> anchor</span>}
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
  orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
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

// --- Glossary + Term (hover-to-define) -------------------------------------

const GLOSS = {
  // Scoring
  'Brier score': 'Mean squared error of probabilistic forecasts: B = (1/N)·Σ(pᵢ−oᵢ)². 0 = perfect, 0.25 = always-50%, 1 = maximally wrong. The standard scoring rule for binary forecasts.',
  'Brier': 'Mean squared error of probabilistic forecasts: B = (1/N)·Σ(pᵢ−oᵢ)². 0 = perfect, 0.25 = always-50%, 1 = maximally wrong.',
  'calibration': 'Whether your stated probabilities match observed frequencies. If you say 70% on 100 questions, ~70 should resolve YES.',
  'resolution': 'How much your forecasts deviate from the base rate. High-resolution forecasts are confidently correct on YES vs NO; low-resolution forecasters always say "around 50%".',
  'reliability': 'Calibration component of the Brier decomposition — squared distance between stated probability and observed frequency, averaged over forecast bins.',
  'log score': 'Proper scoring rule: −log(p_o), where p_o is the probability you assigned to the outcome that actually happened. Penalizes confident mistakes much harder than Brier.',
  'CRPS': 'Continuous Ranked Probability Score — the Brier-equivalent for forecasts of continuous quantities. Integrates squared distance between predicted CDF and the indicator of the realized outcome.',
  'proper scoring rule': 'A scoring rule under which your expected score is best when you report your true beliefs. Brier and log are proper; "0/1 accuracy" is not.',
  'skill score': 'Normalized score: SS = 1 − B/B_climatology. 0 = no better than always-base-rate; 1 = perfect; negative = worse than base rate.',
  // Reference classes
  'base rate': 'The frequency of the outcome in some reference population, before considering the specifics of this case.',
  'reference class': 'The set of past cases your question is "a member of" — the group whose base rate you adopt as your prior.',
  'outside view': 'Forecasting by treating your case as a draw from a reference class, rather than reasoning forward from internal details.',
  'inside view': 'Forecasting by reasoning forward from the case-specific story, ignoring the reference-class statistics.',
  'reference class problem': "Hempel's observation: every case belongs to many reference classes, and there's no canonical choice. Picking one is itself a forecasting decision.",
  // Bayes
  'prior': 'Your probability for the claim before incorporating a piece of evidence.',
  'posterior': 'Your probability for the claim after incorporating a piece of evidence: P(H|E) = P(E|H)·P(H)/P(E).',
  'likelihood ratio': 'LR = P(E|H) / P(E|¬H). How many times more likely the evidence is if the claim is true vs if it is false. Bayesian update strength.',
  'log-odds': 'logit(p) = log(p/(1−p)). Bayesian updates become additive in log-odds: logit(post) = logit(prior) + log(LR).',
  'logit': 'logit(p) = log(p/(1−p)). The natural scale on which Bayesian updates add up.',
  "Cromwell's rule": 'Never assign probability exactly 0 or 1 — those values are infinitely confident and no evidence can move them. Always leave a sliver.',
  // Fermi
  'Fermi estimation': 'Decomposing a fat unknown into a chain of multiplied/added small estimates, each guessable to within an order of magnitude. Named after Enrico Fermi.',
  'geometric mean': 'The n-th root of a product of n numbers — equivalently, the antilog of the average of logs. The "right" central tendency for multiplicative chains.',
  // Mindset
  'fox': "Tetlock's high-performing forecaster archetype: knows many small things, integrates conflicting evidence, comfortable saying 'it depends'.",
  'hedgehog': "Tetlock's lower-performing archetype: organizes everything around one big idea, makes confident extrapolations from it. Better on TV, worse at forecasting.",
  'AOM': 'Active Open-Mindedness — the disposition to actively seek and weigh evidence against your current view. Mellers/Tetlock found AOM strongly predicts forecasting accuracy.',
  'scout mindset': 'Julia Galef\'s framing: caring more about being right than feeling right. Contrast with "soldier mindset" — defending pre-existing beliefs.',
  // Premortem
  'premortem': 'Klein\'s technique: assume the prediction has already failed and ask why. Surfaces failure modes that prospective worry misses.',
  'tripwire': 'A pre-committed observation that, if it occurs, requires you to revise your forecast. Operationalizes "what would change my mind?".',
  // Aggregation
  'extremizing': 'Aggregation step that pushes the consensus probability further from 0.5, on the grounds that pooled forecasts are systematically conservative.',
  'wisdom of crowds': 'The empirical observation that averaging many forecasts beats most individual forecasters, because uncorrelated errors cancel.',
  // Horizons
  'horizon': 'How far in the future the forecast resolves. Brier scores rise (forecasts get worse) roughly geometrically with horizon.',
  'epistemic shelf life': 'Informal: how long today\'s evidence remains predictively useful before being washed out by new shocks.',
  'calibration decay': 'The empirical pattern that long-horizon forecasts grow less calibrated than short-horizon ones — even after restricting to forecasters who do well at short horizons.',
  // Tournament terms
  'GJP': 'Good Judgment Project — Philip Tetlock\'s IARPA-funded forecasting tournament (2011–2015) that identified "superforecasters", a group consistently in the top 2% by Brier score.',
  'IARPA': 'Intelligence Advanced Research Projects Activity — the US intel-community research arm that funded the multi-year forecasting tournament that produced the GJP.',
  'superforecaster': 'A forecaster who scored in the top 2% of the GJP tournament. Notable for foxlike traits, AOM, and granular probability judgments (e.g. distinguishing 60% from 65%).',
  'Goodhart': "Goodhart's law: when a measure becomes a target, it ceases to be a good measure. Resolution criteria that can be gamed lose their epistemic value.",
  'conjunction fallacy': 'Treating P(A and B) as larger than P(A) — usually because the conjunction tells a more vivid story. The Linda problem.',
  // Misc
  'Murphy decomposition': 'Brier = Reliability − Resolution + Uncertainty. Splits a forecaster\'s score into miscalibration, sharpness, and irreducible variance.',
  'reliability diagram': 'Plot of empirical frequency (y) vs stated probability (x), bin by bin. Diagonal = perfectly calibrated; flatter than diagonal = overconfident; steeper = underconfident.',
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

const MinSchema = ({ children }) => (
  <div className="mt-2 mb-4 rounded-md border border-sky-400/25 bg-sky-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
    <div className="text-xs text-sky-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">carry this</span>
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

const Grounding = ({ children }) => (
  <span className="inline-flex items-baseline gap-1 rounded-sm border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0 text-[11px] text-emerald-200 align-baseline">
    <span className="text-[9px] uppercase tracking-wider text-emerald-400">≈</span>
    {children}
  </span>
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

const CrossLink = ({ to, children, recap }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
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
  <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">{title}</span>
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
              const isExternal = it.external || (isLink && !it.href.startsWith('#') && !it.href.startsWith('/#'));
              const Tag = isLink ? 'a' : 'div';
              const props = isLink
                ? {
                    href: it.href,
                    onClick: (e) => onClick(e, it.href),
                    target: isExternal ? '_blank' : undefined,
                    rel: isExternal ? 'noopener noreferrer' : undefined,
                  }
                : {};
              return (
                <Tag
                  key={j}
                  {...props}
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

/* ============================================================================
   HERO + SECTION NAV
   ========================================================================== */

const ScatterField = () => {
  // probability dots drifting upward — "noise of forecasts"
  const pts = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    x: (i * 41) % 100, y: (i * 67) % 100, d: 7 + (i % 6) * 1.5,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.x}%`} cy={`${p.y}%`} r="1.3"
          fill={i % 3 === 0 ? '#c4b5fd' : i % 3 === 1 ? '#7dd3fc' : '#f0abfc'}
          initial={{ opacity: 0 }}
          animate={{ cy: [`${p.y}%`, `${(p.y + 60) % 100}%`], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.18, ease: 'linear' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-fuchsia-500/5 to-transparent" />
    <ScatterField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <Crosshair className="w-3.5 h-3.5" /> judgmental forecasting · the craft
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
          Superforecasting
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          How a small group of amateurs beat CIA analysts at predicting world events — and the toolkit they used. Eleven techniques, one real anchor question, and the math under each. <span className="text-fuchsia-300 font-mono">Brier &lt; 0.20</span> is the bar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-violet-300">calibration</span>
          <span className="text-sky-300">base rates</span>
          <span className="text-amber-300">fermi</span>
          <span className="text-cyan-300">bayes</span>
          <span className="text-emerald-300">aggregation</span>
          <span className="text-fuchsia-300">anchor case</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'traps',       label: 'Four traps',         icon: AlertTriangle },
  { id: 'operationalize', label: 'Operationalize',  icon: Target,        anchor: true },
  { id: 'calibration', label: 'Calibration',        icon: Scale },
  { id: 'refclass',    label: 'Reference classes',  icon: Layers },
  { id: 'fermi',       label: 'Fermi',              icon: Sigma },
  { id: 'bayes',       label: 'Bayes',              icon: GitBranch },
  { id: 'mindset',     label: 'Fox vs hedgehog',    icon: Brain },
  { id: 'premortem',   label: 'Premortem',          icon: ShieldAlert },
  { id: 'aggregate',   label: 'Aggregate',          icon: Network },
  { id: 'horizons',    label: 'Time horizons',      icon: Hourglass },
  { id: 'anchor',      label: 'Anchor: robotaxis',  icon: Rocket,        anchor: true },
  { id: 'trackrecord', label: 'Track record',       icon: BarChart3 },
  { id: 'trails',      label: 'Next trails',        icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-100' : 'border-transparent text-neutral-400'}`}>
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
   01 — FOUR TRAPS
   ========================================================================== */

const TRAPS = [
  {
    name: 'Vague language',
    bad: '"AI will probably reshape the economy soon."',
    good: '"By Dec-31-2028, US labor productivity (BLS-measured) will exceed its 2010-19 trend by ≥ 1.5 pp on a 4-quarter average."',
    why: 'Words like "probably", "soon", "reshape" can\'t be checked against reality. Specific numbers, dates, and sources can.',
    icon: ScrollText,
  },
  {
    name: 'Unresolvable framing',
    bad: '"Will AI become conscious?"',
    good: '"Will any frontier lab publish a peer-reviewed paper claiming a passed Turing-test variant by 2030, with no retraction within 12 months?"',
    why: 'You can\'t score a claim that has no agreed-upon resolution mechanism. A good question names the arbiter and the evidence.',
    icon: ListChecks,
  },
  {
    name: 'Overconfidence',
    bad: '"It will definitely happen / never happen."',
    good: '"My probability is 0.72; I\'d update to ≥ 0.85 if X were true, to ≤ 0.50 if Y."',
    why: 'Stating an extreme probability without evidence loses big when wrong. Granular, hedged forecasts (and stated tripwires) are scored more kindly.',
    icon: AlertTriangle,
  },
  {
    name: 'No track record',
    bad: '"Trust me, I called the last one."',
    good: 'Logged 142 forecasts since 2022. Brier 0.18, calibration slope 0.96, reliability diagram on file.',
    why: 'Forecasts without a written log are unfalsifiable. Memory is selective; the score isn\'t.',
    icon: BarChart3,
  },
];

const Traps = () => (
  <Card id="traps" icon={AlertTriangle} title="The four traps" subtitle="Why most predictions can't be scored — and how to fix the framing before you forecast" accent="rose" index={1}>
    <MinSchema>
      A useful forecast names <strong>what</strong> (a precise event), <strong>when</strong> (a date), <strong>who</strong> (the arbiter), and <strong>how confident</strong> (a probability). Anything missing → not a forecast, just an opinion.
    </MinSchema>

    <p>
      Most public predictions fail not because the forecaster was unlucky but because the prediction couldn't be scored at all. Before any technique, the bar to clear is: <em>could a stranger, two years from now, look at this and say YES or NO without arguing?</em>
    </p>

    <div className="grid md:grid-cols-2 gap-3">
      {TRAPS.map((t) => {
        const Icon = t.icon;
        return (
          <div key={t.name} className="rounded-lg bg-white/[0.02] border border-white/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-rose-300" />
              <div className="text-sm font-semibold text-rose-200">{t.name}</div>
            </div>
            <div className="space-y-1.5 text-[11.5px] leading-snug">
              <div className="flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" />
                <div className="text-neutral-300"><span className="text-rose-300/80 italic">bad: </span>{t.bad}</div>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" />
                <div className="text-neutral-100"><span className="text-emerald-300/80 italic">good: </span>{t.good}</div>
              </div>
              <div className="text-[10.5px] text-neutral-500 pl-4 italic">{t.why}</div>
            </div>
          </div>
        );
      })}
    </div>

    <Misconception
      wrong="A confident, decisive prediction shows expertise."
      right="A confident prediction with no track record, no resolution criteria, and no probability is the cheapest signal an expert can give. Calibrated uncertainty is harder to fake."
      because="Pundits are selected and rewarded for vividness, not for Brier scores. Tetlock's 20-year tournament showed that the most-cited experts were no better than chance — and worse than non-experts willing to say 'around 50%'."
    />

    <WhenItMatters>
      Anything you'd want to bet money on, plan capex around, or use to argue with your team. If your prediction can't be scored, it can't update either of you.
    </WhenItMatters>

    <Deeper>
      <p>
        <strong>Goodhart and the unscoreable claim.</strong> Vague predictions persist in part because they're <em>safer</em>: you can't be wrong if there's no test. Pundit incentives select for this — the "maybe yes, maybe no" hedge dominates explicit probability over a long career, even though it scores worse on every <Term>proper scoring rule</Term>. Naming this trap is the first move; the rest of the explainer is about how to climb out of it.
      </p>
      <p>
        <strong>Three behavioral biases that keep us in the trap.</strong> (1) The <em>conjunction fallacy</em>: we rate "Linda is a feminist bank teller" higher than "Linda is a bank teller" because the story is more vivid (Tversky-Kahneman 1983). (2) <em>Anchoring</em>: a probability you saw five minutes ago anchors your own, even when irrelevant. (3) <em>Availability</em>: vivid recent examples crowd out base rates. Each will be confronted by a specific tool later in this explainer — base rates kill availability, Bayesian updating disciplines anchoring, decomposition kills conjunction effects.
      </p>
    </Deeper>

    <QA items={[
      { q: 'Why is "AI will reshape the economy" not a forecast?', a: 'Three reasons: (1) "reshape" has no operational definition, (2) no date, (3) no probability. A neutral arbiter can\'t tell us in 2030 whether it happened.' },
      { q: 'A friend says "I\'m 99% sure". Is that good or bad calibration?', a: 'Could be either — depends on track record. "99%" claims should be wrong < 1 in 100 over the long run. Most people who say "99%" are wrong 5–15% of the time. Without a logged history, the number is meaningless.' },
    ]} />
  </Card>
);

/* ============================================================================
   02 — OPERATIONALIZATION ★
   ========================================================================== */

// A vague question and 3 progressively-resolvable rewrites of it.
const OPS_LAYERS = [
  {
    label: 'Layer 0 · vague',
    q: 'Will robotaxis be a big deal by 2028?',
    flaws: ['"big deal" — undefined', '"robotaxis" — fleet size? technology? geography?', 'no arbiter', 'no concrete date'],
    color: 'rose',
  },
  {
    label: 'Layer 1 · concrete event',
    q: 'Will any US city see ≥ 1,000,000 paid driverless robotaxi rides per day by Dec-31-2028?',
    flaws: ['"driverless" still ambiguous (safety driver? remote teleop?)', 'no source authority', '"per day" — single day? rolling 7-day avg?', '"paid" — must exclude employee shuttles'],
    color: 'amber',
  },
  {
    label: 'Layer 2 · resolution criteria',
    q: 'Will any single US Metropolitan Statistical Area record a daily-rate of ≥ 1,000,000 paid public-facing fully-autonomous (no in-vehicle safety driver, no continuous remote teleoperation) robotaxi rides on at least one calendar day before Jan-1-2029?',
    flaws: ['who counts the rides?', 'what if the operator stops publishing data?', 'what about a merger that retroactively reframes services?'],
    color: 'sky',
  },
  {
    label: 'Layer 3 · arbiter + defaults',
    q: '… resolved YES if either (a) the operator (Waymo, Tesla, Zoox, or new entrant) publicly reports such a day, with the report verifiable via SEC filing or an audited dashboard, OR (b) a US DOT / NHTSA quarterly report confirms it. Defaults: silent operator → NO. Mergers preserve continuous operation. Service paused mid-day for ≥ 1 hr disqualifies that calendar day.',
    flaws: [],
    color: 'emerald',
  },
];

const Operationalize = () => {
  const [layer, setLayer] = useState(0);
  return (
    <Card id="operationalize" icon={Target} anchor title="Operationalize" subtitle="Make the question resolvable before you forecast it. Anchor card · the ambiguity-killer." accent="violet" index={2}>
      <MinSchema>
        Every forecastable claim has four parts: <strong>event</strong> (precise enough to YES/NO),{' '}
        <strong>deadline</strong> (a calendar date), <strong>arbiter</strong> (a named source of truth), and{' '}
        <strong>defaults</strong> (what happens in edge cases — silence, mergers, redefinitions). Missing any one and there's a "ghost in the prediction" — a way for the forecast to never resolve.
      </MinSchema>

      <p>
        Of the four traps, the most consequential for hard real-world questions is <em>unresolvable framing</em>. Real-world topics — geopolitics, technology, climate — come pre-loaded with vague language ("AI agents", "energy transition", "decoupling"). Every word you don't operationalize is a place where you can't be wrong, and therefore can't learn. The first move is always: <em>strip the question down and rebuild it</em>.
      </p>

      {/* Layered rewrite walkthrough */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">walk the ladder</span>
          <span className="text-[10px] text-neutral-500">· same question, four levels of resolvability</span>
        </div>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          {OPS_LAYERS.map((l, i) => (
            <button
              key={i}
              onClick={() => setLayer(i)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                layer === i
                  ? `${chipPalette[l.color]} font-semibold`
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <motion.div
          key={layer}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-lg border ${chipPalette[OPS_LAYERS[layer].color]} bg-white/[0.02] p-3`}
        >
          <div className="text-[15px] text-neutral-100 leading-relaxed">{OPS_LAYERS[layer].q}</div>
          {OPS_LAYERS[layer].flaws.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[9px] uppercase tracking-[0.2em] text-rose-300 mb-1.5">remaining ambiguity</div>
              <ul className="text-[11.5px] text-neutral-300 space-y-0.5">
                {OPS_LAYERS[layer].flaws.map((f, i) => (
                  <li key={i} className="flex gap-1.5"><span className="text-rose-400">·</span><span>{f}</span></li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-emerald-400/20 flex items-center gap-2 text-emerald-200 text-[11.5px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolvable. Edge cases have defaults. A neutral arbiter can score this.
            </div>
          )}
        </motion.div>
      </div>

      {/* The four-piece anatomy */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { k: 'event',     desc: 'A condition over real-world state that a stranger can YES/NO without negotiating.', icon: Target,    color: 'violet' },
          { k: 'deadline',  desc: 'A calendar date — not "by 2028" but Dec-31-2028 23:59 in a stated time zone.',  icon: Hourglass, color: 'sky' },
          { k: 'arbiter',   desc: 'A named source whose report is binding (operator filing, DOT report, court ruling).', icon: ScrollText, color: 'amber' },
          { k: 'defaults',  desc: 'What happens if data is missing, the entity merges, or a redefinition is attempted.', icon: ShieldAlert, color: 'emerald' },
        ].map((x) => {
          const Icon = x.icon;
          return (
            <div key={x.k} className={`rounded-lg border bg-white/[0.02] p-3 ${chipPalette[x.color].split(' ')[2]}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${chipPalette[x.color].split(' ')[1]}`} />
                <span className={`text-[10px] uppercase tracking-[0.18em] ${chipPalette[x.color].split(' ')[1]}`}>{x.k}</span>
              </div>
              <div className="text-[11px] text-neutral-300 leading-snug">{x.desc}</div>
            </div>
          );
        })}
      </div>

      <Misconception
        wrong="If I make the question too specific, I'll miss the spirit of what I really care about."
        right="If you don't make it specific, you can't update on the world. The spirit lives in the choice of operationalization — and that choice is itself the most useful part of forecasting."
        because="Most disagreements about forecasts dissolve once both parties write down resolution criteria. The disagreement is usually about which referent matters, not about the future."
      />

      <Predict question="A common pitfall: 'will fusion produce net-positive energy by 2030?'. Where's the ghost in this prediction?">
        Three ghosts, ranked by severity. (1) <em>net-positive over what boundary?</em> A reactor produced "Q&gt;1" at the plasma in 2022 (NIF), but the wall-plug efficiency was &lt; 1%. Different boundaries, same words. (2) <em>"produce" vs "deliver to a grid"</em> — a pulsed lab demo isn't a power plant. (3) <em>arbiter</em> — DOE? a peer-reviewed paper? a press release? Without naming one, every operator has incentive to claim victory under their own definition (<Term>Goodhart</Term>).
      </Predict>

      <Deeper>
        <p>
          <strong>The "ghost in the prediction" diagnostic.</strong> Before forecasting, run this thought experiment: imagine the date has passed. Now imagine three news stories that you'd read with conflicting takes ("they did it!" / "they almost did it" / "different metric, missed by a lot"). If you can imagine those three stories, the question isn't operationalized yet. The exercise is borrowed from forecasting tournament practice — Good Judgment Open requires this before any question goes live, and even then ~10% of resolved questions still have community disputes.
        </p>
        <p>
          <strong>Anti-Goodhart framing.</strong> When the metric becomes a target, it stops measuring what you cared about. Two defenses: (i) <em>compose multiple thresholds</em> ("≥ 1 M rides AND from ≥ 2 distinct operators AND no city-wide service pause" — composition raises the cost of gaming proportionally), and (ii) <em>commit to the arbiter before the data is available</em>, so any later switch is on the record. Both come from the public-prediction tournament literature; the GJP found that questions with composite criteria had ~30% lower dispute rates.
        </p>
        <p>
          <strong>What to do with truly fuzzy concepts.</strong> Some real-world targets — "consciousness", "AGI", "decoupling" — resist operationalization. Two moves: (a) <em>forecast the marker</em> instead — a benchmark, an institution's declaration, a regulatory action; or (b) <em>fan out</em> into a portfolio of 5–10 narrow questions whose joint pattern would convince you. Each is a smaller, cheaper bet; the joint distribution is what you really wanted.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does the resolution criterion need an arbiter named in advance?', a: 'Because at resolution time, every party has incentive to pick the source that favors their forecast. Naming the arbiter up front converts the dispute from "who decides" to "what does the arbiter say" — a much narrower, cheaper question.' },
        { q: 'A question reads "by 2028, will autonomous vehicles be safe?". Three problems?', a: '(1) "autonomous vehicles" — full-stack AV? L2 features? Industry-wide? (2) "safe" — fewer crashes than human drivers? Insurance claims? Fatalities? (3) No arbiter — NHTSA? individual operators? a court? Replace with a metric (e.g. "MSA crash rate < 1.0 per 1M miles, NHTSA-confirmed").' },
        { q: 'What\'s the cheapest way to test if your question is operationalized?', a: 'Ask three people independently to draft what would resolve YES. If they write three different things, the question isn\'t operationalized. (Tournament practice; routinely catches ambiguity that the original author missed.)' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — CALIBRATION VS RESOLUTION
   ========================================================================== */

// Pre-baked "track records" for three forecaster archetypes.
// Each one is { binCenter, n_in_bin, observed_freq } across the 10 deciles.
const FORECASTER_PROFILES = {
  super: {
    name: 'Superforecaster',
    color: '#6ee7b7',
    desc: 'Calibrated and resolves — close to the diagonal AND uses the full 0–1 range.',
    bins: [
      { p: 0.05, n: 38, o: 0.04 },
      { p: 0.15, n: 32, o: 0.13 },
      { p: 0.25, n: 28, o: 0.27 },
      { p: 0.35, n: 24, o: 0.33 },
      { p: 0.45, n: 22, o: 0.46 },
      { p: 0.55, n: 24, o: 0.55 },
      { p: 0.65, n: 28, o: 0.62 },
      { p: 0.75, n: 32, o: 0.78 },
      { p: 0.85, n: 36, o: 0.86 },
      { p: 0.95, n: 36, o: 0.96 },
    ],
  },
  pundit: {
    name: 'Overconfident pundit',
    color: '#fb7185',
    desc: 'Overshoots both extremes — says 90% but only ~70% come true.',
    bins: [
      { p: 0.05, n: 14, o: 0.18 },
      { p: 0.15, n: 12, o: 0.22 },
      { p: 0.25, n: 14, o: 0.32 },
      { p: 0.35, n: 18, o: 0.42 },
      { p: 0.45, n: 22, o: 0.48 },
      { p: 0.55, n: 28, o: 0.52 },
      { p: 0.65, n: 36, o: 0.55 },
      { p: 0.75, n: 48, o: 0.62 },
      { p: 0.85, n: 56, o: 0.68 },
      { p: 0.95, n: 52, o: 0.72 },
    ],
  },
  hedger: {
    name: 'Cautious hedger',
    color: '#7dd3fc',
    desc: 'Calibrated near 50% but never sharpens — low resolution = always-50 score.',
    bins: [
      { p: 0.05, n: 0,  o: 0.0  },
      { p: 0.15, n: 2,  o: 0.30 },
      { p: 0.25, n: 6,  o: 0.40 },
      { p: 0.35, n: 32, o: 0.45 },
      { p: 0.45, n: 76, o: 0.49 },
      { p: 0.55, n: 80, o: 0.51 },
      { p: 0.65, n: 38, o: 0.55 },
      { p: 0.75, n: 8,  o: 0.62 },
      { p: 0.85, n: 4,  o: 0.65 },
      { p: 0.95, n: 0,  o: 0.0  },
    ],
  },
};

// Reliability diagram + Brier decomposition for a forecaster profile.
const ReliabilityDiagram = ({ profile }) => {
  const W = 460, H = 320, P = 38;
  const pf = FORECASTER_PROFILES[profile];
  const bins = pf.bins.filter(b => b.n > 0);
  const N = bins.reduce((s, b) => s + b.n, 0);
  const obar = bins.reduce((s, b) => s + b.n * b.o, 0) / N;
  const REL = bins.reduce((s, b) => s + b.n * (b.p - b.o) ** 2, 0) / N;
  const RES = bins.reduce((s, b) => s + b.n * (b.o - obar) ** 2, 0) / N;
  const UNC = obar * (1 - obar);
  const B = REL - RES + UNC;
  const SS = 1 - B / UNC;

  const sx = (p) => P + p * (W - 2 * P);
  const sy = (o) => H - P - o * (H - 2 * P);
  const maxN = Math.max(...bins.map(b => b.n));

  const [hover, setHover] = useState(null);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-x-3">
        <div className="text-xs uppercase tracking-widest text-neutral-500">Reliability diagram · {pf.name}</div>
        <div className="text-[10px] text-neutral-500 font-mono">N = {N} forecasts</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
        {/* axes */}
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#404040" strokeWidth="1" />
        <line x1={P} y1={P}     x2={P}     y2={H - P} stroke="#404040" strokeWidth="1" />
        {/* gridlines */}
        {[0.2, 0.4, 0.6, 0.8].map(g => (
          <g key={g}>
            <line x1={sx(g)} y1={P} x2={sx(g)} y2={H - P} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
            <line x1={P}     y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
            <text x={sx(g)} y={H - P + 14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{g.toFixed(1)}</text>
            <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g.toFixed(1)}</text>
          </g>
        ))}
        {/* perfect-calibration diagonal */}
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="#a3a3a3" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
        <text x={sx(0.83)} y={sy(0.83) - 6} fontSize="9" fill="#737373" fontFamily="ui-monospace">y = x</text>
        {/* base-rate line */}
        <line x1={sx(0)} y1={sy(obar)} x2={sx(1)} y2={sy(obar)} stroke="#525252" strokeWidth="0.8" strokeDasharray="1 2" />
        <text x={W - P + 4} y={sy(obar) + 3} fontSize="8" fill="#737373" fontFamily="ui-monospace">ō={obar.toFixed(2)}</text>
        {/* points */}
        {bins.map((b, i) => {
          const r = 4 + 8 * Math.sqrt(b.n / maxN);
          return (
            <g key={i}>
              <line x1={sx(b.p)} y1={sy(b.p)} x2={sx(b.p)} y2={sy(b.o)} stroke={pf.color} strokeWidth="0.8" opacity="0.4" />
              <circle
                cx={sx(b.p)} cy={sy(b.o)} r={r}
                fill={pf.color} fillOpacity="0.25" stroke={pf.color} strokeWidth="1.5"
                onMouseEnter={(e) => setHover({ ...b, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHover({ ...b, mx: e.clientX, my: e.clientY })}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}
        {/* axis labels */}
        <text x={W / 2} y={H - 4} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">stated probability p̄ →</text>
        <text x={10} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 10 ${H / 2})`}>empirical frequency ō</text>
      </svg>

      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-1">forecast bin</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-neutral-500">stated p̄</span><span className="text-right font-mono">{h.p.toFixed(2)}</span>
            <span className="text-neutral-500">observed ō</span><span className="text-right font-mono">{h.o.toFixed(2)}</span>
            <span className="text-neutral-500">n in bin</span><span className="text-right font-mono">{h.n}</span>
            <span className="text-neutral-500">miscal²</span><span className="text-right font-mono" style={{color: pf.color}}>{((h.p - h.o) ** 2).toFixed(3)}</span>
          </div>
        </div>
      )} />

      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        <Stat label="Brier B" value={B.toFixed(3)} sub="lower = better" color={B < 0.18 ? 'text-emerald-300' : B < 0.25 ? 'text-amber-300' : 'text-rose-300'} />
        <Stat label="Reliability" value={REL.toFixed(3)} sub="miscal., ↓ better" color="text-rose-300" />
        <Stat label="Resolution" value={RES.toFixed(3)} sub="sharpness, ↑ better" color="text-emerald-300" />
        <Stat label="Uncertainty" value={UNC.toFixed(3)} sub="ō(1−ō), irreducible" color="text-neutral-300" />
        <Stat label="Skill 1−B/U" value={SS.toFixed(2)} sub="vs always-base-rate" color={SS > 0 ? 'text-emerald-300' : 'text-rose-300'} />
      </div>
    </div>
  );
};

const Calibration = () => {
  const [profile, setProfile] = useState('super');
  return (
    <Card id="calibration" icon={Scale} title="Calibration vs resolution" subtitle="A Brier score has two parts. Knowing which one is hurting you tells you what to fix." accent="sky" index={3}>
      <MinSchema>
        Brier = Reliability − Resolution + Uncertainty. <em>Reliability</em> is "are my probabilities honest?". <em>Resolution</em> is "do I separate YES from NO instead of always saying 50%?". You need both.
      </MinSchema>

      <p>
        The <Term>Brier score</Term> is the standard scoring rule for binary forecasts: the mean squared distance between your stated probability and the realized outcome. Lower is better. But two forecasters can have the same Brier for very different reasons — and they need different fixes.
      </p>

      <Block>{`B = \\frac{1}{N}\\sum_{i=1}^{N}(\\co{p_i} - \\num{o_i})^2`}</Block>

      <p>
        The <Term>Murphy decomposition</Term> splits the score into three pieces, computed by binning forecasts into deciles (or fewer):
      </p>

      <Block>{`B = \\underbrace{\\hi{\\textstyle\\sum_b \\tfrac{n_b}{N}(\\bar{p}_b - \\bar{o}_b)^2}}_{\\text{REL · miscalibration}} - \\underbrace{\\gr{\\textstyle\\sum_b \\tfrac{n_b}{N}(\\bar{o}_b - \\bar{o})^2}}_{\\text{RES · sharpness}} + \\underbrace{\\co{\\bar{o}(1-\\bar{o})}}_{\\text{UNC · irreducible}}`}</Block>

      <Predict question="Two forecasters: A has Brier 0.22, B has Brier 0.22. Same skill?">
        Not necessarily. A might be calibrated but cautious (high REL=0, low RES=0.03, dominated by UNC=0.25), making her score look like the climatology. B might be miscalibrated but bold (REL=0.05, RES=0.08, UNC=0.25). Same headline, different fixes: A needs to be sharper, B needs to be more honest. The decomposition is what separates them.
      </Predict>

      {/* Profile picker + reliability diagram */}
      <div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(FORECASTER_PROFILES).map(([k, p]) => (
            <button
              key={k}
              onClick={() => setProfile(k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                profile === k
                  ? 'bg-white/10 border-white/30 text-neutral-100 font-semibold'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
        <ReliabilityDiagram profile={profile} />
        <div className="mt-2 text-[11px] text-neutral-400 italic px-1">
          {FORECASTER_PROFILES[profile].desc}
        </div>
      </div>

      <Misconception
        wrong="Better forecasters get more questions right."
        right="Better forecasters assign higher probabilities to the things that happen and lower probabilities to the things that don't — calibrated AND sharp. Forecasting is about distributions, not yes/no calls."
        because="If you only judge accuracy on the ≥ 50% threshold, you're throwing away the magnitude information. A 70% forecast that resolves YES is not 'right' — it's been informative. A 95% forecast that resolves NO is not 'wrong' — it's been very wrong (miscal² = 0.90)."
      />

      <Deeper>
        <p>
          <strong>Why the decomposition is exact.</strong> The terms come from expanding the squared error within each forecast bin. Within bin <Eq>{'b'}</Eq>, every forecast has the same stated probability <Eq>{'\\bar{p}_b'}</Eq>; the average squared error is <Eq>{'(\\bar{p}_b - \\bar{o}_b)^2 + \\bar{o}_b(1-\\bar{o}_b)'}</Eq>. Aggregate over bins, then add and subtract the global outcome variance <Eq>{'\\bar{o}(1-\\bar{o})'}</Eq>; the algebra collapses to REL − RES + UNC. The key insight is that UNC is a property of the <em>question set</em>, not the forecaster — both REL and RES are individual.
        </p>
        <p>
          <strong>Skill score.</strong> The headline number forecasters watch isn't B itself but the <Term>skill score</Term>:
        </p>
        <Block>{`\\co{SS} = 1 - \\frac{B}{B_{\\text{climatology}}} = 1 - \\frac{B}{\\bar{o}(1-\\bar{o})}`}</Block>
        <p>
          <Eq>{'SS=0'}</Eq> means you're no better than always reporting the base rate; <Eq>{'SS=1'}</Eq> is perfect; negative is worse than the base rate. GJP <Term>superforecaster</Term>s ran SS ≈ 0.30–0.45 across years; "regular" intelligent forecasters ran ≈ 0.10–0.20.
        </p>
        <p>
          <strong>Other proper scoring rules.</strong> Brier penalizes squared error; the <Term>log score</Term> <Eq>{'-\\log p_o'}</Eq> penalizes confident mistakes much harder (it's −∞ if you say 0% on something that happens — Cromwell's rule has bite here). For continuous quantities (rainfall, GDP, cost), the <Term>CRPS</Term> integrates the squared distance between predicted CDF and the indicator of the realized value. All three are <Term>proper scoring rules</Term> — your expected score is best when you report your true beliefs; cheating by hedging away from your beliefs makes the score worse on average.
        </p>
      </Deeper>

      <QA items={[
        { q: 'A forecaster says "50%" on every question. What\'s their Brier?', a: 'B = 0.25 exactly (the always-50% baseline). REL = 0 (perfectly honest about being unsure), RES = 0 (no sharpness at all), UNC = 0.25 if base rate is 0.5. Skill score = 0 — no better than the climatology.' },
        { q: 'How do you fix high reliability (i.e. miscalibration)?', a: 'Recalibrate: train on past forecasts where you said 70% and check what fraction resolved YES. If only 55% did, shift your future "70%" forecasts down. The literal arithmetic operation is called "isotonic regression" or "Platt scaling".' },
        { q: 'How do you fix low resolution?', a: 'Stop hedging to 50%. Use base rates and reference classes (next card) to commit to differentiated probabilities — 0.10 here, 0.85 there, instead of "everything\'s around 0.5".' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — REFERENCE CLASSES & BASE RATES
   ========================================================================== */

const REF_CLASSES = [
  {
    label: 'All AV programs since 2010',
    n: 28,
    yes: 1,
    desc: 'Cruise, Argo, Aurora, Zoox, May Mobility, Embark, Tu Simple, Pony, Motional, etc. — programs that targeted full driverless commercial operation in some city.',
    why: 'Generous base rate, but most companies were going for >0 driverless rides, not 1M/day.',
    color: 'sky',
  },
  {
    label: 'Ride-hailing services that hit ≥1M rides/day in any single US city',
    n: 4,
    yes: 1,
    desc: 'Uber NYC (2014), Uber LA (2015), Lyft NYC (2017). Each took 4–5 years from first ride. Driverless: 0 of 4 cities.',
    why: 'Tighter class — rules out tiny pilots. But it conditions on having a viable business model, which AV may not yet.',
    color: 'amber',
  },
  {
    label: 'New transportation modes (cars 1908, planes 1939, ride-hailing 2009) reaching 1M+ daily users in their dominant city',
    n: 5,
    yes: 4,
    desc: 'Cars (NYC, ~1925, ~17 yr); commercial flights; ride-hailing (NYC ~2014); e-scooters (LA ~2018); driverless: still pending.',
    why: 'Wide angle, but the time-to-1M is wildly different per mode. Information about the curve, not the destination.',
    color: 'emerald',
  },
  {
    label: 'AI-product timelines from technical breakthrough to commercial 1M-DAU',
    n: 7,
    yes: 5,
    desc: 'GPT-4 → ChatGPT (2 mo to 1M users), GitHub Copilot (~6 mo), Midjourney (~3 mo), Anthropic Claude, Stable Diffusion. AV-distinct mode: physical capex, regulatory, geographic.',
    why: 'AVs are not pure software — physical fleet + permit + insurance + city deal. Class is conceptually attractive but mechanism mismatches.',
    color: 'fuchsia',
  },
];

const ReferenceClasses = () => {
  const [pick, setPick] = useState(0);
  const c = REF_CLASSES[pick];
  const baseRate = c.yes / c.n;

  return (
    <Card id="refclass" icon={Layers} title="Reference classes & base rates" subtitle="The outside view — pick the right reference population, and your prior is half-done" accent="emerald" index={4}>
      <MinSchema>
        Don't reason about <em>this case</em> first. Find the population it belongs to, take the historical base rate, and use that as your prior. Inside-view stories about why "it's different this time" then have to fight gravity, not act as gravity.
      </MinSchema>

      <p>
        Kahneman, Tversky, and Lovallo formalized this as the <Term>outside view</Term> vs the <Term>inside view</Term>. Inside view: "we're talented, our roadmap is solid, this looks doable." Outside view: "of comparable projects, what fraction shipped on time?". Inside almost always says higher; outside almost always wins on accuracy.
      </p>

      <Block>{`P(\\fu{H}) \\;=\\; \\co{P(H \\mid \\text{class}_k)} \\;\\approx\\; \\frac{\\#\\text{YES in class}_k}{\\#\\text{class}_k}`}</Block>

      <p>
        For our anchor question — <em>≥ 1M robotaxi rides/day in any US city by 2028</em> — there's no canonical reference class. So you pick several, see the spread, and treat that as <em>part of the answer</em>. Disagreement across reference classes is information about your uncertainty.
      </p>

      {/* Reference class picker */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 flex-wrap mb-3">
          <Layers className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">pick a class · see the implied prior</span>
        </div>
        <div className="grid gap-1.5">
          {REF_CLASSES.map((r, i) => (
            <button
              key={i}
              onClick={() => setPick(i)}
              className={`text-left text-[11.5px] px-3 py-2 rounded border transition-colors ${
                pick === i
                  ? `${chipPalette[r.color]} font-semibold`
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span>{r.label}</span>
                <span className="font-mono text-[11px] tabular-nums">{r.yes}/{r.n}  ≈  {(100 * r.yes / r.n).toFixed(0)}%</span>
              </div>
            </button>
          ))}
        </div>

        <motion.div
          key={pick}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 grid md:grid-cols-[1fr_auto] gap-4 items-center"
        >
          <div>
            <div className="text-xs text-neutral-300 leading-snug">{c.desc}</div>
            <div className="mt-1.5 text-[11px] text-neutral-500 italic">
              <span className="text-neutral-400 not-italic mr-1.5">why this class might be wrong:</span>{c.why}
            </div>
          </div>

          {/* prior gauge */}
          <div className="md:w-48">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">implied prior</div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 * baseRate}%` }}
                transition={{ duration: 0.4 }}
                className="h-full"
                style={{ background: c.color === 'sky' ? '#7dd3fc' : c.color === 'amber' ? '#fbbf24' : c.color === 'emerald' ? '#6ee7b7' : '#f0abfc' }}
              />
            </div>
            <div className="mt-1 text-2xl font-mono" style={{ color: c.color === 'sky' ? '#7dd3fc' : c.color === 'amber' ? '#fbbf24' : c.color === 'emerald' ? '#6ee7b7' : '#f0abfc' }}>
              P ≈ {(100 * baseRate).toFixed(0)}%
            </div>
          </div>
        </motion.div>
      </div>

      <Worked title="Putting the four priors side-by-side">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {REF_CLASSES.map((r) => (
            <div key={r.label} className={`rounded border ${chipPalette[r.color].split(' ')[2]} bg-white/[0.02] px-2 py-1.5`}>
              <div className={`text-[10px] uppercase tracking-wider ${chipPalette[r.color].split(' ')[1]}`}>{(100*r.yes/r.n).toFixed(0)}%</div>
              <div className="text-[10.5px] text-neutral-300 leading-snug mt-0.5">{r.label.split(' ').slice(0,5).join(' ')}…</div>
            </div>
          ))}
        </div>
        <p className="mt-2">
          The four implied priors span ~3% to ~80%. That spread <em>is</em> the answer. A defensible synthesis takes a weighted geometric mean (next card) of priors whose mechanisms most match the case — typically the wide angle plus the tightest matched-mechanism class.
        </p>
      </Worked>

      <Misconception
        wrong="If I pick the right reference class, the base rate is the answer."
        right="The base rate is your prior — the starting point you'll update with case-specific evidence. If the case has strong evidence (deployment data, partnerships, regulation), the posterior should move from the prior. The base rate's job is to keep you honest, not finish the job."
        because="The 'inside view' isn't always wrong — it's just systematically over-weighted when used alone. Outside view first, then update."
      />

      <Deeper>
        <p>
          <strong>The reference class problem.</strong> Hempel observed that every event belongs to many reference classes, and there's no canonical choice. Is a particular AV launch a "tech rollout" (fast curve), a "transportation mode" (slow curve), or a "venture-backed startup with regulatory exposure" (low survival)? Each gives a different base rate. The honest move is to pick 3–4, report the spread, and treat the spread as part of the uncertainty.
        </p>
        <p>
          <strong>Aggregating multiple priors.</strong> If you trust each class equally, the geometric mean of probabilities is the right combiner (it preserves the same average log-odds). Concretely, with priors {`{0.04, 0.25, 0.80, 0.71}`}: arithmetic mean ≈ 0.45; <Term>geometric mean</Term> ≈ 0.27. The geometric mean is more cautious about high-prior outliers, which is usually what you want when your classes disagree about scale.
        </p>
        <p>
          <strong>Mechanism matching beats sample size.</strong> A reference class with n=4 but the right mechanism (driverless ride-hailing) is more informative than n=200 from a class whose mechanism doesn't apply (cars in 1908 had no software stack, no LiDAR cost curve, no 911 liability). Tournament forecasters routinely down-weight large-n classes when the mechanism is wrong; this is a deliberate violation of "more data = better" and it works.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why prefer outside view first, even when you know a lot about the inside?', a: 'Because inside-view stories are systematically optimistic — your knowledge of internal details makes the case feel exceptional. Anchoring on the base rate first creates a gravitational pull that inside details have to overcome with evidence, not just narrative.' },
        { q: 'When should you pick a tighter (smaller-n) reference class over a wider one?', a: 'When the tight class shares the dominant mechanism — same physical constraints, same regulatory regime, same business model. Sample size is a tiebreaker, not the primary criterion.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — FERMI-IZING
   ========================================================================== */

// Fermi calculator: 1M robotaxi rides/day = cities × fleet × utilization × hours × duty cycle
const FermiCalc = () => {
  // log10 sliders — each input has a low/median/high tied to the slider position 0..1
  const factors = [
    { k: 'cities',   label: 'Eligible US cities w/ active service', low: 1,    med: 4,    high: 12,  unit: 'cities' },
    { k: 'fleet',    label: 'Vehicles per city (avg)',              low: 200,  med: 1500, high: 8000, unit: 'AVs' },
    { k: 'rides',    label: 'Rides per AV per day',                  low: 6,    med: 18,   high: 35,  unit: 'rides/AV/day' },
  ];
  const [vals, setVals] = useState(factors.map(() => 0.5));

  const compute = (i, t) => {
    const f = factors[i];
    // log-linear interpolation through (low, med, high) at t in 0, 0.5, 1
    if (t <= 0.5) return f.low * Math.pow(f.med / f.low, t * 2);
    return f.med * Math.pow(f.high / f.med, (t - 0.5) * 2);
  };
  const point = factors.map((_, i) => compute(i, vals[i]));
  const pointDaily = point.reduce((a, b) => a * b, 1);

  // log-error propagation: stdev of log(prod) = sqrt(sum stdev_logs²)
  // approximate per-factor σ_log ≈ (log(high) − log(low)) / 4 (i.e. ±2σ spans range)
  const sigmaLog = factors.reduce((s, f) => {
    const sl = (Math.log(f.high) - Math.log(f.low)) / 4;
    return s + sl * sl;
  }, 0);
  const sigma = Math.sqrt(sigmaLog);
  const lo = pointDaily * Math.exp(-1.96 * sigma);
  const hi = pointDaily * Math.exp(1.96 * sigma);

  const fmt = (v) => v >= 1e6 ? `${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `${(v/1e3).toFixed(1)}K` : v.toFixed(0);
  const TARGET = 1e6;
  const hitsTarget = pointDaily >= TARGET;
  // probability point estimate ≥ target ≈ Φ((logE − logT) / σ)
  const z = (Math.log(pointDaily) - Math.log(TARGET)) / sigma;
  const ndf = (x) => 0.5 * (1 + Math.tanh(0.7978845 * x * (1 + 0.044715 * x * x)));  // approx Φ(x)
  const Pgte = ndf(z);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <Sigma className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300">multiplicative chain</span>
        <span className="text-[10px] text-neutral-500">· slide each factor between low / median / high</span>
      </div>

      <div className="space-y-3">
        {factors.map((f, i) => (
          <div key={f.k}>
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">{f.label}</span>
              <span className="font-mono text-amber-300">{fmt(point[i])} <span className="text-neutral-500">{f.unit}</span></span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={vals[i]}
              onChange={(e) => setVals(vals.map((v, j) => j === i ? +e.target.value : v))}
              className="sf-range w-full"
            />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>low: {fmt(f.low)}</span>
              <span>med: {fmt(f.med)}</span>
              <span>high: {fmt(f.high)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-2">
          <Stat label="point estimate" value={fmt(pointDaily) + ' / day'} sub="product of medians at slider" color={hitsTarget ? 'text-emerald-300' : 'text-amber-300'} />
          <Stat label="95% range" value={`${fmt(lo)} – ${fmt(hi)}`} sub="log-error propagation" color="text-neutral-300" />
          <Stat label="P(≥ 1M / day)" value={`${(100 * Pgte).toFixed(0)}%`} sub="from this chain alone" color={Pgte > 0.5 ? 'text-emerald-300' : Pgte > 0.2 ? 'text-amber-300' : 'text-rose-300'} />
        </div>
      </div>
    </div>
  );
};

const Fermi = () => (
  <Card id="fermi" icon={Sigma} title="Fermi-izing" subtitle="Decompose a fat unknown into a chain of small, individually-guessable estimates" accent="amber" index={5}>
    <MinSchema>
      <Term>Fermi estimation</Term>: never estimate a big number directly. Multiply small ones. Each multiplicand needs only an order-of-magnitude guess; the errors partly cancel. Reasoning becomes auditable per-step.
    </MinSchema>

    <p>
      Named after Enrico Fermi, who famously estimated the Trinity blast yield by dropping confetti and watching the displacement. The mechanic is universal: <em>for any quantity X, find a multiplicative decomposition X = a · b · c · …, estimate each factor independently, multiply</em>. Why it works: an order-of-magnitude error in one term is a 0.3 dex error in the log; uncorrelated 0.3-dex errors of opposite sign partly cancel.
    </p>

    <Block>{`\\co{X} \\;=\\; \\prod_{i=1}^{k} x_i \\quad\\Longleftrightarrow\\quad \\log \\co{X} \\;=\\; \\sum_{i=1}^{k} \\log x_i`}</Block>

    <p>
      Working in log-space is the trick. Sums of independent error terms have well-behaved variances. For our anchor question we want <em>1M rides per day</em> in some city. Decompose:
    </p>

    <Block>{`\\fu{\\text{rides/day, US peak city}} \\;=\\; \\co{\\text{cities active}} \\;\\times\\; \\co{\\text{vehicles/city}} \\;\\times\\; \\co{\\text{rides/vehicle/day}}`}</Block>

    <FermiCalc />

    <Predict question="Slider all three to medians. What's the implied daily-rides number? And does the chain alone clear 1M?">
      Medians 4 cities × 1500 AVs × 18 rides ≈ 108K rides/day for the dominant city. Even at high settings (12 × 8000 × 35 ≈ 3.4M) the chain only clears 1M about ~25% of the time once you account for log-uncertainty. The chain says: by 2028, the median of the most plausible scenarios is well below 1M. The forecast under this decomposition <em>alone</em> is ~10–25% YES.
    </Predict>

    <Misconception
      wrong="Fermi estimates are too rough — for serious questions you need real data."
      right="Fermi estimates set the goalpost. Your data work tells you how far each factor is from your guess. Without the chain, you can't tell which input matters most."
      because="Sensitivity comes free with the decomposition: the factor with the largest log-range dominates the output's uncertainty. That's where to put modeling effort."
    />

    <Deeper>
      <p>
        <strong>Why log-space.</strong> If <Eq>{'X = \\prod x_i'}</Eq> and each <Eq>{'\\log x_i'}</Eq> has variance <Eq>{'\\sigma_i^2'}</Eq>, then assuming independence:
      </p>
      <Block>{`\\mathrm{Var}(\\log X) \\;=\\; \\sum_{i=1}^{k} \\sigma_i^2`}</Block>
      <p>
        So the multiplicative output is approximately log-normal with median <Eq>{'\\prod \\mathrm{median}(x_i)'}</Eq> (the geometric mean of the factors) and a 95% interval given by ±1.96·σ in log-space. This is why the central tendency for products is the <Term>geometric mean</Term>, not the arithmetic mean — and why a single very-uncertain factor can dominate the entire output, regardless of how many cleanly-known factors you stack with it.
      </p>
      <p>
        <strong>Anti-conjunction-fallacy property.</strong> Decomposing into k factors makes you confront <em>each</em> probability separately. People routinely overestimate P(A ∧ B ∧ C) because the conjunction tells a vivid story; the same people, shown the factors one-by-one and asked to multiply, give much more conservative (and more accurate) outputs. This is the operational defense against the <Term>conjunction fallacy</Term>.
      </p>
      <p>
        <strong>When Fermi is wrong.</strong> Two failure modes. (1) <em>Correlated factors</em>: if "vehicles/city" and "rides/vehicle/day" co-move with the same hidden driver (e.g. demand density), the variance assumption is broken; in that case the joint distribution has heavier tails than the log-normal suggests. (2) <em>Threshold non-linearities</em>: the chain answers "what's the median," but if there's a regulatory cliff at 4 cities and you're around 4, the median is misleading. For both, augment with explicit scenarios (next: Bayesian updating).
      </p>
    </Deeper>

    <QA items={[
      { q: 'Why use orders of magnitude (× 10) rather than precise estimates?', a: 'Because order-of-magnitude bands are easier to commit to, harder to get catastrophically wrong, and survive log-space addition cleanly. The cost of false precision is anchoring on a number that doesn\'t reflect your real uncertainty.' },
      { q: 'Which factor in the chain matters most?', a: 'The one with the widest log-range (highest σ_log). For our chain, "vehicles/city" spans 200–8000 (σ_log ≈ 0.92), the largest contributor to total output uncertainty. That\'s where modeling effort pays off.' },
    ]} />
  </Card>
);

/* ============================================================================
   06 — BAYESIAN UPDATING
   ========================================================================== */

// log-odds form: logit(post) = logit(prior) + sum_i log(LR_i)
const BayesUpdater = () => {
  const [prior, setPrior] = useState(0.20);
  const [evidence, setEvidence] = useState([
    { id: 'waymo',  label: 'Waymo announces 5 new metros by Q4-2027',                 lr: 3.2,  on: true },
    { id: 'cruise', label: 'A second large-city operator (≥ Cruise-scale) shuts down', lr: 0.4,  on: true },
    { id: 'permit', label: 'A US-DOT national framework is enacted before 2027',       lr: 1.8,  on: false },
  ]);
  const logitP = (p) => Math.log(p / (1 - p));
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const lrLog = evidence.filter(e => e.on).reduce((s, e) => s + Math.log(e.lr), 0);
  const post = sigmoid(logitP(prior) + lrLog);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <GitBranch className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">log-odds slider · live update</span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between text-[11px] mb-1">
          <span className="text-neutral-300">Prior P(YES)</span>
          <span className="font-mono text-cyan-300">{(prior*100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0.01" max="0.99" step="0.01" value={prior}
          onChange={(e) => setPrior(+e.target.value)}
          className="sf-range w-full"
        />
        <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
          <span>1%</span><span>50%</span><span>99%</span>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500">Evidence (toggle on/off; slide LR)</div>
        {evidence.map((e, i) => (
          <div key={e.id} className={`rounded-md border p-2.5 transition-colors ${e.on ? 'border-cyan-400/30 bg-cyan-400/[0.04]' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => setEvidence(evidence.map((x, j) => j === i ? { ...x, on: !x.on } : x))}
                className={`w-4 h-4 rounded border flex items-center justify-center ${e.on ? 'bg-cyan-400/30 border-cyan-400/60' : 'border-white/20'}`}
              >
                {e.on && <CheckCircle2 className="w-3 h-3 text-cyan-200" />}
              </button>
              <div className="text-[11.5px] text-neutral-200 flex-1">{e.label}</div>
              <span className={`text-[10px] font-mono tabular-nums ${e.lr > 1 ? 'text-emerald-300' : 'text-rose-300'}`}>LR = {e.lr.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0.1" max="10" step="0.05" value={e.lr}
              onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, lr: +ev.target.value } : x))}
              className="sf-range w-full"
            />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>0.1 (against)</span><span>1 (neutral)</span><span>10 (strong for)</span>
            </div>
          </div>
        ))}
      </div>

      {/* posterior gauge */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-baseline justify-between text-[11px] mb-1">
          <span className="text-neutral-400">Posterior P(YES)</span>
          <span className="font-mono text-2xl text-cyan-200">{(post*100).toFixed(0)}%</span>
        </div>
        <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
          <div className="absolute inset-y-0" style={{ left: `${prior*100}%`, width: '2px', background: '#525252' }} />
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/70 to-cyan-300/70"
            initial={{ width: 0 }}
            animate={{ width: `${post*100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[9px] mt-1 text-neutral-500 font-mono">
          <span>0%</span>
          <span style={{ color: '#737373' }}>prior was {(prior*100).toFixed(0)}%</span>
          <span>100%</span>
        </div>
        <div className="mt-2 text-[10.5px] text-neutral-400 leading-snug">
          log-odds shift = <span className="font-mono text-cyan-200">{lrLog >= 0 ? '+' : ''}{lrLog.toFixed(2)}</span> ·{' '}
          {lrLog > 0 ? 'evidence net favors YES' : lrLog < 0 ? 'evidence net favors NO' : 'evidence neutral'}
        </div>
      </div>
    </div>
  );
};

const Bayes = () => (
  <Card id="bayes" icon={GitBranch} title="Bayesian updating" subtitle="Convert evidence into log-odds, then add. The math of changing your mind." accent="cyan" index={6}>
    <MinSchema>
      Bayesian updating: <strong>posterior odds = prior odds × likelihood ratio</strong>. In log-space, multiplication becomes addition — every piece of evidence is just a number you add to your running log-odds.
    </MinSchema>

    <p>
      A <Term>prior</Term> turns into a <Term>posterior</Term> when you see evidence. The full rule:
    </p>

    <Block>{`P(\\fu{H} \\mid \\co{E}) \\;=\\; \\frac{P(\\co{E} \\mid \\fu{H}) \\, P(\\fu{H})}{P(\\co{E})}`}</Block>

    <p>
      For binary updating, the practical form drops the denominator and uses odds. The <Term>likelihood ratio</Term> is how many times more likely you'd see evidence E if H were true vs if it weren't:
    </p>

    <Block>{`\\co{LR} \\;=\\; \\frac{P(E \\mid H)}{P(E \\mid \\neg H)} \\qquad \\Longrightarrow \\qquad \\fu{\\text{odds}_{\\text{post}}} \\;=\\; \\co{LR} \\,\\cdot\\, \\fu{\\text{odds}_{\\text{prior}}}`}</Block>

    <p>
      In <Term>log-odds</Term> (logit) space, multiplication becomes addition — and additions stack across evidence pieces:
    </p>

    <Block>{`\\fu{\\mathrm{logit}(P_{\\text{post}})} \\;=\\; \\fu{\\mathrm{logit}(P_{\\text{prior}})} \\;+\\; \\sum_{i} \\co{\\log \\mathrm{LR}_i}`}</Block>

    <BayesUpdater />

    <Predict question="Prior 20%, then you hear: Waymo announces 5 new metros (LR ~ 3) AND a competitor shuts down (LR ~ 0.4). Posterior?">
      Log-odds(20%) = log(0.25) ≈ −1.39. Add log(3) + log(0.4) = +1.10 − 0.92 = +0.18. New log-odds = −1.21, posterior ≈ 23%. The two pieces of evidence partly cancel. Net: tiny upward nudge from 20% to ~23% — much smaller than naive intuition would suggest, because the bear evidence eats most of the bull move.
    </Predict>

    <Misconception
      wrong="One striking piece of evidence should move my forecast a lot."
      right="It moves your forecast by exactly log(LR), no more. Vivid stories that don't separate H from ¬H (i.e. equally consistent with both) have LR ≈ 1, so log(LR) ≈ 0 — they shouldn't move you at all."
      because="The trap is mistaking emotional salience for diagnosticity. 'Cruise had a recall' is striking, but if it's roughly as expected under both scenarios (industry-wide AV growth still possible / not possible), its LR is near 1. Ask: how much more likely is this story under YES than under NO?"
    />

    <Deeper>
      <p>
        <strong>Cromwell's rule.</strong> Never assign <Eq>{'P=0'}</Eq> or <Eq>{'P=1'}</Eq>. In log-odds those are <Eq>{'\\pm\\infty'}</Eq>; no finite evidence can move you. Tournament practice: clamp probabilities to <Eq>{'[0.01, 0.99]'}</Eq> minimum.
        Named after Cromwell's 1650 "I beseech you, in the bowels of Christ, think it possible you may be mistaken."
      </p>
      <p>
        <strong>Chained updates with conditional independence.</strong> The "add log-LR" rule assumes evidence pieces are conditionally independent given H. They almost never fully are — Waymo's announcements and Cruise's failures partly come from the same underlying market reality. The fix is to either (i) model only one piece of correlated evidence and ignore redundancies, or (ii) shrink the LRs of correlated pieces (e.g. multiply each by 0.6 if you suspect ~50% redundancy). Tournament forecasters lean conservative — they generally under-update rather than risk double-counting.
      </p>
      <p>
        <strong>Strength of evidence reference table.</strong> Calibrating LRs is itself a skill. Jeffreys (1961) suggested:
      </p>
      <Block>{`\\begin{array}{l|l} |\\log_{10}(\\mathrm{LR})| & \\text{evidence is} \\\\ \\hline 0 - 0.5 & \\text{barely worth mentioning} \\\\ 0.5 - 1 & \\text{substantial} \\\\ 1 - 1.5 & \\text{strong} \\\\ 1.5 - 2 & \\text{very strong} \\\\ > 2 & \\text{decisive (rare)} \\end{array}`}</Block>
      <p>
        Most pieces of real-world political/economic news live in the 0–0.5 dex range. People consistently over-rate their LR — calibrating against this table reduces over-updating.
      </p>
    </Deeper>

    <QA items={[
      { q: 'Why log-odds rather than just multiplying odds?', a: 'Same math, but additive form is much easier to reason about: each piece of evidence is one number, you can mentally compose 4–5 in your head, and the sign tells you direction. Multiplying odds across 5 pieces invites arithmetic errors; adding logs doesn\'t.' },
      { q: 'A friend says "this changes everything!". What\'s your first question?', a: '"What\'s the LR? How much more likely is this if I\'m right vs if I\'m wrong?" If the answer is "well… both sides could spin it," LR ≈ 1, change nothing.' },
    ]} />
  </Card>
);

/* ============================================================================
   07 — FOX vs HEDGEHOG + ACTIVE OPEN-MINDEDNESS
   ========================================================================== */

// AOM self-check questions, Tetlock/Mellers-style
const AOM_QUESTIONS = [
  { q: 'Beliefs should be revised in proportion to the evidence.',                                 reverse: false },
  { q: 'Changing your mind is a sign of weakness.',                                                 reverse: true },
  { q: 'I would rather be confident and wrong than uncertain and right.',                          reverse: true },
  { q: 'I actively seek out evidence against my current views.',                                    reverse: false },
  { q: 'When I disagree, I try to find the strongest version of the other side’s argument.',   reverse: false },
  { q: 'Smart people in my field already know the answer; the rest is detail.',                    reverse: true },
];

const AOMSelfCheck = () => {
  const [scores, setScores] = useState(AOM_QUESTIONS.map(() => null));
  const answered = scores.filter(s => s !== null).length;
  const total = AOM_QUESTIONS.length;
  // each item scored 1 (low AOM) to 5 (high AOM); reversed items flipped before averaging
  const aom = answered === 0
    ? null
    : scores.reduce((s, v, i) => {
        if (v === null) return s;
        const adj = AOM_QUESTIONS[i].reverse ? 6 - v : v;
        return s + adj;
      }, 0) / answered;

  const band = aom == null ? null : aom >= 4.2 ? 'high' : aom >= 3.4 ? 'medium' : 'low';
  const bandColor = band === 'high' ? 'text-emerald-300' : band === 'medium' ? 'text-amber-300' : band === 'low' ? 'text-rose-300' : 'text-neutral-400';

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <Brain className="w-3.5 h-3.5 text-fuchsia-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">AOM self-check</span>
        <span className="text-[10px] text-neutral-500">· 1 = strongly disagree · 5 = strongly agree</span>
      </div>
      <div className="space-y-2">
        {AOM_QUESTIONS.map((qq, i) => (
          <div key={i} className="rounded-md border border-white/10 bg-white/[0.02] p-2.5">
            <div className="text-[12px] text-neutral-200 leading-snug mb-1.5">
              <span className="text-neutral-500 font-mono mr-1.5">{i+1}.</span>{qq.q}
              {qq.reverse && <span className="ml-2 text-[9px] uppercase tracking-wider text-rose-300/70">reverse-scored</span>}
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(v => (
                <button
                  key={v}
                  onClick={() => setScores(scores.map((x, j) => j === i ? v : x))}
                  className={`w-7 h-7 text-[11px] rounded border font-mono transition-colors ${
                    scores[i] === v
                      ? 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-100 font-bold'
                      : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {answered > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-3 gap-2">
          <Stat label="answered" value={`${answered} / ${total}`} sub="all 6 for valid score" color="text-neutral-200" />
          <Stat label="AOM avg" value={aom.toFixed(2)} sub="1 (low) → 5 (high)" color={bandColor} />
          <Stat label="band" value={band ? band.toUpperCase() : '—'} sub="high ≈ superforecaster" color={bandColor} />
        </div>
      )}
    </div>
  );
};

const FOX_HEDGEHOG_BARS = [
  { name: 'Hedgehog (one-big-idea)',       brier: 0.36, color: '#fb7185', desc: 'TV-friendly, confident extrapolations from a single framework. Worse than chance on long-horizon political forecasts.' },
  { name: 'Average expert (mixed)',         brier: 0.29, color: '#fbbf24', desc: 'A working analyst who reads broadly but has a "house view".' },
  { name: 'Fox (many small ideas)',         brier: 0.22, color: '#7dd3fc', desc: 'Comfortable saying "it depends", weights conflicting evidence, eclectic toolbox.' },
  { name: 'Superforecaster (top 2% of GJP)', brier: 0.18, color: '#6ee7b7', desc: 'Foxlike + high AOM + granular probabilities + active recalibration after every resolved question.' },
];

const Mindset = () => (
  <Card id="mindset" icon={Brain} title="Fox vs hedgehog · active open-mindedness" subtitle="The mindset layer: which forecaster types beat which, and the trait that predicts accuracy" accent="fuchsia" index={7}>
    <MinSchema>
      <Term>Fox</Term>es beat <Term>hedgehog</Term>s. Within foxes, <Term>AOM</Term> (active open-mindedness) is the strongest single predictor of accuracy. The mindset is: care more about being right than feeling right.
    </MinSchema>

    <p>
      Tetlock's 20-year "Expert Political Judgment" tournament collected ~28,000 forecasts from 284 named experts. The headline result: experts performed about as well as chance (i.e., dart-throwing chimps). The deeper result: <em>within</em> the expert pool, foxes — Berlin's eclectic-thinker archetype — consistently beat hedgehogs.
    </p>

    {/* Brier comparison bars */}
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <BarChart3 className="w-3.5 h-3.5 text-fuchsia-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">Brier scores by archetype</span>
        <span className="text-[10px] text-neutral-500">· lower is better · climatology baseline = 0.25</span>
      </div>
      <div className="space-y-1.5">
        {FOX_HEDGEHOG_BARS.map((b) => {
          const pct = (b.brier / 0.40) * 100;
          return (
            <div key={b.name} className="grid grid-cols-[minmax(170px,1.5fr)_3fr_minmax(50px,auto)] gap-3 items-center text-[11px]">
              <div className="text-neutral-200 truncate" title={b.desc}>{b.name}</div>
              <div className="relative h-4 bg-white/5 rounded-sm overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${pct}%`, background: `${b.color}80`, borderRight: `2px solid ${b.color}` }} />
                {/* climatology benchmark line */}
                <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: `${(0.25/0.40)*100}%` }} title="always-50% baseline">
                  <span className="absolute -top-0.5 left-0.5 text-[8px] text-neutral-500 font-mono">0.25</span>
                </div>
              </div>
              <div className="font-mono text-right" style={{ color: b.color }}>{b.brier.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-neutral-400 leading-snug">
        Source: Tetlock <em>EPJ</em> (2005), Mellers et al. <em>JEP</em> (2014, 2015) for GJP-era numbers.
        Superforecasters' Brier ≈ 0.18 was ~30–40% better than the broader "regular" forecaster pool, sustained across 4 tournament years.
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-3">
      <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-rose-300">🦔</span>
          <div className="text-sm font-semibold text-rose-200">Hedgehog</div>
        </div>
        <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
          <li>· organizes everything around one big theory</li>
          <li>· makes confident extrapolations</li>
          <li>· tells coherent stories — vivid, memorable</li>
          <li>· dismisses contradicting evidence as noise</li>
          <li>· prized by media, predicts poorly</li>
        </ul>
      </div>
      <div className="rounded-lg border border-sky-400/25 bg-sky-400/5 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sky-300">🦊</span>
          <div className="text-sm font-semibold text-sky-200">Fox</div>
        </div>
        <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
          <li>· integrates many small frameworks</li>
          <li>· comfortable saying "it depends"</li>
          <li>· revises eagerly when evidence shifts</li>
          <li>· weights base rates over narrative</li>
          <li>· dull on TV, accurate over time</li>
        </ul>
      </div>
    </div>

    <p>
      The trait that <em>predicts</em> foxlike behavior on a survey instrument is <Term>AOM</Term> — active open-mindedness. Mellers et al. found AOM was the single strongest individual-difference predictor of forecasting accuracy in the GJP cohort, ahead of fluid intelligence, training, and topic-area expertise.
    </p>

    <AOMSelfCheck />

    <Misconception
      wrong="Smart, knowledgeable people make the best forecasters."
      right="Smart people who actively look for reasons they're wrong make the best forecasters. Smart people who use their intelligence to defend pre-existing views often score below average."
      because="Knowledge inflates confidence; AOM converts confidence into calibration. The interaction between knowledge and AOM matters more than either alone — without AOM, more knowledge can mean more confidently-wrong forecasts."
    />

    <Deeper>
      <p>
        <strong>The scout vs soldier framing.</strong> Julia Galef recasts AOM as <Term>scout mindset</Term> — caring more about an accurate map than a defended position — versus "soldier mindset" — defending pre-existing beliefs. The two are different motivational styles applied to the same evidence; scouts converge on accuracy, soldiers converge on consistency.
      </p>
      <p>
        <strong>Why AOM is rare.</strong> Three forces push against it: (i) social — defending positions is rewarded in groups, especially professional ones; (ii) emotional — admitting wrongness is identity-costly; (iii) cognitive — confirmation bias is automatic, AOM is effortful. The countermoves all involve <em>making belief revision cheap</em>: short forecasts (so each is a small bet, not your reputation), explicit tripwires (so revision happens by rule, not by face-saving), and a track record (so being wrong sometimes is just normal, not catastrophic).
      </p>
      <p>
        <strong>Tournament-tuned habits.</strong> GJP superforecasters self-reported the following routines, in rough decreasing order of impact: (1) using granular probabilities (not 50/60/70/80/90 but 47/53/68 — see card 12), (2) breaking questions into sub-questions (Fermi), (3) seeking out one piece of disconfirming evidence per forecast, (4) writing brief justifications (forces clarity), (5) updating immediately on news, (6) post-resolution review of every forecast. Each single habit is small; together they account for most of the Brier delta.
      </p>
    </Deeper>

    <QA items={[
      { q: 'Why are hedgehogs over-represented in media?', a: 'Their forecasts are more confident, more memorable, and tell better stories. None of those correlate with accuracy. Media incentives select for vividness; forecasting tournaments select for calibration. They\'re different selection pressures and they pick different people.' },
      { q: 'You scored medium AOM. What\'s a cheap way to move toward high?', a: 'Pick one belief you hold strongly. Write the strongest case you can find against it (steelmanning). If you can\'t produce a serious counter-case, that\'s the practice gap. Repeat weekly.' },
    ]} />
  </Card>
);

/* ============================================================================
   08 — PREMORTEM & TRIPWIRES
   ========================================================================== */

// Klein-style premortem: 4 prompts to surface failure modes
const PREMORTEM_PROMPTS = [
  {
    prompt: '“It’s January 2029. The robotaxi target was missed by an order of magnitude. What were the top 3 reasons?”',
    answers: [
      'Power: utility interconnect for the supercharger fleet got delayed in the dominant city.',
      'Regulatory: a high-profile fatality triggered city-level moratoria mid-2027.',
      'Unit-economics: cost-per-mile floor remained ~2× human rideshare; demand never crossed the indifference threshold.',
    ],
  },
  {
    prompt: '“It’s January 2029. The robotaxi target was hit a year EARLY. What surprises got us there?”',
    answers: [
      'A merger (e.g. Waymo + Uber) collapsed two demand pools into one geography overnight.',
      'A breakthrough in remote-teleoperation safety case let regulators authorize lighter-touch operation.',
      'A second operator scaled in parallel; competition compressed prices below human-rideshare.',
    ],
  },
  {
    prompt: '“What is the single piece of evidence I’d most want to know NOW that would resolve much of the uncertainty?”',
    answers: [
      'Cost-per-mile (fully-loaded, not just COGS) at the largest driverless operator, audited.',
      'Daily active fleet utilization in the densest corridor of the leading city, tracked monthly.',
      'Whether DOT\'s NHTSA framework will preempt or delegate state-level approval.',
    ],
  },
];

const Premortem = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <Card id="premortem" icon={ShieldAlert} title="Premortem & belief tripwires" subtitle="Operationalize 'what would change my mind?' before it has to" accent="orange" index={8}>
      <MinSchema>
        <Term>Premortem</Term>: assume the prediction has already failed and ask why. <Term>Tripwire</Term>: a pre-committed observation that, if it occurs, requires a forecast revision. Both convert vague worry into actionable rule.
      </MinSchema>

      <p>
        Gary Klein's premortem flips the planning fallacy: instead of asking "what could go wrong?", you assume the project failed and reason backward. The technique consistently surfaces failure modes that prospective worry misses, because prospective worry is filtered through optimism. Pair this with explicit tripwires — pre-committed observation thresholds that, once crossed, force revision — and you've operationalized AOM.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Telescope className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-300">premortem · click each prompt</span>
        </div>
        <div className="space-y-2">
          {PREMORTEM_PROMPTS.map((p, i) => (
            <div key={i} className="rounded-md border border-orange-400/20 bg-orange-400/[0.04]">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-orange-400/[0.06]"
              >
                <ChevronDown className={`w-3.5 h-3.5 mt-[3px] text-orange-300 shrink-0 transition-transform ${openIdx === i ? 'rotate-0' : '-rotate-90'}`} />
                <div className="text-[12px] text-neutral-100 leading-snug italic">{p.prompt}</div>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="px-3 pb-3 pl-9 text-[11.5px] space-y-1.5">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-orange-300/80 mb-1">surfaced reasons</div>
                      {p.answers.map((a, j) => (
                        <div key={j} className="flex gap-1.5 text-neutral-300 leading-snug">
                          <span className="text-orange-400 shrink-0">→</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Tripwire builder */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-300">tripwires for the robotaxi forecast</span>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            { dir: 'down', label: 'A US driverless ride fatality sustains political pressure for &gt;90 days.', delta: '−15 pp' },
            { dir: 'down', label: 'Waymo or Tesla pause expansion in any single market for &gt;2 quarters.',  delta: '−10 pp' },
            { dir: 'up',   label: 'A second operator hits 100K rides/week in any US city.',                    delta: '+12 pp' },
            { dir: 'up',   label: 'NHTSA issues a national framework that pre-empts state approvals.',         delta: '+8 pp' },
            { dir: 'down', label: 'Insurance rates rise &gt;3× for AV operators in any major state.',          delta: '−10 pp' },
            { dir: 'up',   label: 'Cost-per-mile at scale hits parity with human rideshare (audited).',        delta: '+15 pp' },
          ].map((t, i) => (
            <div key={i} className={`rounded-md border p-2.5 flex items-start gap-2 ${
              t.dir === 'up' ? 'border-emerald-400/25 bg-emerald-400/[0.04]' : 'border-rose-400/25 bg-rose-400/[0.04]'
            }`}>
              {t.dir === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="text-[11.5px] text-neutral-200 leading-snug" dangerouslySetInnerHTML={{ __html: t.label }} />
                <div className={`text-[10px] font-mono mt-1 ${t.dir === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>if observed → {t.delta}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-neutral-500 italic">
          Each tripwire is pre-committed in writing. When it fires, you have a rule to apply, not a face-saving negotiation. The probability shifts above are illustrative — calibrate them as evidence accumulates.
        </div>
      </div>

      <Misconception
        wrong="If I can't change my mind without strong proof, I'm being rigorous."
        right="If you can't say in advance what would change your mind, you can't be moved by anything — that's not rigor, that's irrefutability. The discipline is naming the tripwire BEFORE the evidence arrives."
        because="A tripwire defined post-hoc is gerrymandered to spare your ego. A tripwire defined in advance is a Ulysses contract — you tie yourself to the mast so the future-you, motivated to stay consistent, has to update."
      />

      <Deeper>
        <p>
          <strong>Why premortems beat prospective worry.</strong> Klein's research showed that "what could go wrong?" produces ~30% fewer surface failure modes than "imagine it failed; why?". The mechanism is <em>fluent retrieval</em>: assuming failure flips your mental model so the failure-related associations become primed and accessible. The same effect, smaller, applies in reverse — assuming success and asking "what surprises got us there?" surfaces upside scenarios that conservative models miss.
        </p>
        <p>
          <strong>The tripwire-as-Ulysses-contract.</strong> Pre-committing a revision rule defeats the dominant ex-post bias: explaining away contradicting evidence ("yes, but that case is different because..."). With a written tripwire, the evidence either fires the rule or it doesn't; you don't get to renegotiate at the moment of pain. Tournament-experienced forecasters typically maintain 3–5 tripwires per long-horizon question; the GJP found that explicit tripwires correlated with faster, larger updates to incoming evidence — a key driver of low Brier on long-horizon questions.
        </p>
        <p>
          <strong>The "red team" practice.</strong> A heavier version: assign someone (or your future self, on a different day) the task of arguing the opposite. Their goal is to make the strongest case against your current view, with full access to your evidence. If their case is weak, your view is robust; if their case is strong, you over-weighted a specific narrative. This is why intelligence agencies institutionalize "Team B" reviews — the mechanism scales the cognitive benefit of AOM beyond what one person can do alone.
        </p>
      </Deeper>

      <QA items={[
        { q: 'A tripwire fires but feels wrong. What\'s the right move?', a: 'Update first, then question. The rule was written when you were epistemically clearer; the discomfort is a tax for ex-post rationalization. Re-examine the rule in your post-mortem (card 12), but apply it now.' },
        { q: 'How many tripwires per forecast?', a: '3–5. Fewer than 3 and you\'ve under-specified; more than 5 and they\'ll start firing on noise. Spread them across causes — political, economic, technical, operational — so they\'re not all flagged by the same underlying event.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — AGGREGATION & EXTREMIZING
   ========================================================================== */

const AGG_FORECASTERS = [
  { name: 'A',  p: 0.18, w: 1.0, color: '#7dd3fc' },
  { name: 'B',  p: 0.22, w: 0.8, color: '#a5b4fc' },
  { name: 'C',  p: 0.35, w: 1.2, color: '#c4b5fd' },
  { name: 'D',  p: 0.40, w: 0.9, color: '#f0abfc' },
  { name: 'E',  p: 0.55, w: 1.1, color: '#fda4af' },
];

const Aggregation = () => {
  const [a, setA] = useState(1.5);  // extremizing exponent
  const [useWeights, setUseWeights] = useState(false);

  const ws = useWeights ? AGG_FORECASTERS.map(f => f.w) : AGG_FORECASTERS.map(() => 1);
  const W = ws.reduce((s, x) => s + x, 0);
  const wAvg = AGG_FORECASTERS.reduce((s, f, i) => s + f.p * ws[i], 0) / W;
  // extremizing: f(p) = p^a / (p^a + (1-p)^a)
  const extremize = (p, exp) => Math.pow(p, exp) / (Math.pow(p, exp) + Math.pow(1 - p, exp));
  const aggregated = extremize(wAvg, a);

  const W_W = 460, H = 110;
  const sx = (p) => 30 + p * (W_W - 60);

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <Network className="w-3.5 h-3.5 text-emerald-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">5 forecasters → one number</span>
      </div>

      {/* probability number line */}
      <svg viewBox={`0 0 ${W_W} ${H}`} className="w-full h-auto">
        <line x1={sx(0)} y1={H/2} x2={sx(1)} y2={H/2} stroke="#404040" strokeWidth="1" />
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <g key={t}>
            <line x1={sx(t)} y1={H/2 - 4} x2={sx(t)} y2={H/2 + 4} stroke="#525252" strokeWidth="0.8" />
            <text x={sx(t)} y={H/2 + 18} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{(t*100).toFixed(0)}%</text>
          </g>
        ))}
        {/* individual forecasts */}
        {AGG_FORECASTERS.map((f) => (
          <g key={f.name}>
            <circle cx={sx(f.p)} cy={H/2} r={5} fill={f.color} fillOpacity="0.3" stroke={f.color} strokeWidth="1.5" />
            <text x={sx(f.p)} y={H/2 - 12} fontSize="9" fill={f.color} fontFamily="ui-monospace" textAnchor="middle">{f.name}</text>
          </g>
        ))}
        {/* weighted average marker */}
        <line x1={sx(wAvg)} y1={H/2 - 22} x2={sx(wAvg)} y2={H/2 + 22} stroke="#a3a3a3" strokeWidth="1" strokeDasharray="2 2" />
        <text x={sx(wAvg)} y={H - 6} fontSize="9" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">avg = {(wAvg*100).toFixed(0)}%</text>
        {/* aggregated (extremized) marker — plain SVG with CSS transition */}
        <circle
          cx={sx(aggregated)} cy={H/2} r={9}
          fill="#6ee7b7" fillOpacity="0.35" stroke="#6ee7b7" strokeWidth="2"
          style={{ transition: 'cx 0.25s ease' }}
        />
        <text
          x={sx(aggregated)} y={H/2 + 3.5}
          fontSize="11" fill="#022c22" fontFamily="ui-monospace" textAnchor="middle" fontWeight="700"
          style={{ transition: 'x 0.25s ease' }}
        >★</text>
      </svg>

      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">Extremizing exponent <Eq>{'a'}</Eq></span>
            <span className="font-mono text-emerald-300">{a.toFixed(2)}</span>
          </div>
          <input
            type="range" min="1" max="3" step="0.05" value={a}
            onChange={(e) => setA(+e.target.value)}
            className="sf-range w-full"
          />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>1.0 (no extremizing)</span><span>2.0 (typical)</span><span>3.0 (aggressive)</span>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
            <input
              type="checkbox" checked={useWeights}
              onChange={(e) => setUseWeights(e.target.checked)}
              className="accent-emerald-400"
            />
            weight by track record (Brier-derived)
          </label>
          <div className="text-[10px] text-neutral-500 mt-1">unweighted avg = {(AGG_FORECASTERS.reduce((s,f)=>s+f.p,0)/AGG_FORECASTERS.length*100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="mt-3 grid md:grid-cols-3 gap-2">
        <Stat label="weighted avg" value={`${(wAvg*100).toFixed(0)}%`} sub="before extremizing" color="text-neutral-300" />
        <Stat label="extremized" value={`${(aggregated*100).toFixed(0)}%`} sub={`a = ${a.toFixed(2)}`} color="text-emerald-300" />
        <Stat label="shift from avg" value={`${aggregated > wAvg ? '+' : ''}${((aggregated-wAvg)*100).toFixed(1)} pp`} sub="pushed away from 0.5" color={aggregated > wAvg ? 'text-emerald-300' : 'text-rose-300'} />
      </div>
    </div>
  );
};

const Aggregate = () => (
  <Card id="aggregate" icon={Network} title="Aggregation & extremizing" subtitle="Why the crowd beats the individual — and why you push the crowd's number further from 50%" accent="emerald" index={9}>
    <MinSchema>
      Average ≥ 4 forecasters and you'll usually beat any single one. Then <Term>extremize</Term> the average — push it away from 50% — because individual forecasters under-share information and the average is systematically conservative.
    </MinSchema>

    <p>
      The <Term>wisdom of crowds</Term>: independent errors cancel under averaging, so a mean of N forecasts has lower expected variance than any individual. But there's a subtle correction. Each forecaster sees a fraction of the available information; their forecasts are individually conservative because they hedge against what they don't know. Averaging preserves that conservatism — so the consensus is biased <em>toward 50%</em> relative to the "ideal" forecaster who saw everything. Extremizing corrects this.
    </p>

    <Block>{`\\fu{p_{\\text{ext}}} \\;=\\; \\frac{\\co{p_{\\text{avg}}}^{\\,a}}{\\co{p_{\\text{avg}}}^{\\,a} + (1 - \\co{p_{\\text{avg}}})^{\\,a}}, \\qquad a > 1`}</Block>

    <p>
      Equivalently, in log-odds: <Eq>{'\\mathrm{logit}(p_{\\text{ext}}) = a \\cdot \\mathrm{logit}(p_{\\text{avg}})'}</Eq>. The exponent <Eq>{'a'}</Eq> stretches the log-odds away from 0 (which is 50%). Mellers et al. found <Eq>{'a \\approx 1.5\\text{–}2.5'}</Eq> empirically optimal in the GJP, dependent on how much information overlap there was among forecasters.
    </p>

    <Aggregation />

    <Predict question="Five forecasters' average is 30%. Extremize with a = 2. New probability?">
      logit(0.30) = log(0.30 / 0.70) ≈ −0.847. Multiply by 2 → −1.694. Sigmoid → ≈ 15.5%. The average gets pushed further toward 0 because the consensus believes NO; extremizing makes that belief sharper. Note: if the average was 50%, no extremizing would happen — extremizing only reinforces the direction of consensus, never creates one.
    </Predict>

    <div className="grid md:grid-cols-2 gap-3">
      <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <div className="text-sm font-semibold text-emerald-200">When extremizing helps</div>
        </div>
        <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
          <li>· forecasters are roughly independent (low information overlap)</li>
          <li>· each one is individually well-calibrated</li>
          <li>· consensus is far from 50%</li>
          <li>· the question has been "thought about hard" by each forecaster</li>
        </ul>
      </div>
      <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-300" />
          <div className="text-sm font-semibold text-rose-200">When extremizing hurts</div>
        </div>
        <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
          <li>· forecasters share sources / talked to each other (groupthink risk)</li>
          <li>· any individual is poorly calibrated</li>
          <li>· consensus is near 50% (extremizing has no effect — and risks adding noise)</li>
          <li>· crowd is small (fewer than ~4 voices)</li>
        </ul>
      </div>
    </div>

    <Misconception
      wrong="The wisdom of crowds means the crowd is always wise."
      right="The crowd is wise when forecasters are diverse and independent. When they read the same news, talk to each other, and share priors, the crowd is just one big correlated forecaster wearing N name tags."
      because="Galton's ox-weight crowd worked because each guesser brought independent information — visual estimation cues, livestock experience, etc. Modern social-media crowds can be the opposite: amplifying a single anchor across many voices, producing an apparent consensus that's just one belief copy-pasted."
    />

    <Deeper>
      <p>
        <strong>Why extremize?</strong> If two independent forecasters each see partial evidence and integrate it into a probability, their average reflects only their <em>shared</em> information; their <em>independent</em> information is lost in the mean. An idealized observer who saw everything would have a sharper distribution. Extremizing approximates this idealized observer by stretching the log-odds — formally, by scaling each forecaster's information contribution as if it were less correlated with the others'.
      </p>
      <p>
        <strong>Track-record weighting.</strong> Beyond simple averaging, weight forecasters by their inverse-variance (proportional to <Eq>{'1/B_i'}</Eq> or similar). The GJP found "elite teams" — top 60 forecasters — with track-record-weighted aggregation outperformed even the unrestricted prediction-market baseline by ~10% in Brier. Two big caveats: track records are noisy on small samples, and weighting too aggressively replicates the "single forecaster" failure mode.
      </p>
      <p>
        <strong>Prediction markets as a special aggregation.</strong> A market price is an aggregator with skin-in-the-game weights — well-calibrated participants buy in, poorly-calibrated ones get bankrupt and stop participating. Markets typically don't need extra extremizing because the price-formation mechanism already has it built in (informed traders move prices; uninformed traders absorb spread). The downside: thin markets are dominated by single large bettors, which reverses the wisdom property entirely.
      </p>
      <p>
        <strong>Mean of probabilities vs mean of log-odds.</strong> The arithmetic mean of probabilities and the geometric mean (which is the inverse-logit of the mean log-odds) give different answers. The GJP literature mostly uses arithmetic-mean-then-extremize because it's simpler and competitive; some recent work (Satopää 2014; logarithmic pooling) finds geometric-mean of probabilities slightly outperforms when forecasters are highly correlated.
      </p>
    </Deeper>

    <QA items={[
      { q: 'When does the crowd beat the best individual?', a: 'When errors are uncorrelated AND the crowd has at least 4–5 members AND each is roughly calibrated. With fewer than ~4 or with correlated errors, "the crowd" is just one or two voices in disguise.' },
      { q: 'Should I extremize my own forecasts?', a: 'No — extremizing compensates for the conservatism of an averaging step that smooths out independent information. If you\'re a single forecaster, you\'ve already used everything you know. Extremizing your own number just amounts to unwarranted confidence.' },
    ]} />
  </Card>
);

/* ============================================================================
   10 — TIME HORIZONS & CALIBRATION DECAY
   ========================================================================== */

// empirical-style calibration decay: Brier score vs horizon (months)
// Numbers approximate Mellers/Tetlock GJP analyses
const HORIZON_DATA = [
  { m: 1,   super: 0.10, regular: 0.16, dart: 0.25 },
  { m: 3,   super: 0.13, regular: 0.20, dart: 0.25 },
  { m: 6,   super: 0.16, regular: 0.24, dart: 0.25 },
  { m: 12,  super: 0.19, regular: 0.27, dart: 0.25 },
  { m: 18,  super: 0.21, regular: 0.30, dart: 0.25 },
  { m: 24,  super: 0.22, regular: 0.32, dart: 0.25 },
  { m: 36,  super: 0.24, regular: 0.34, dart: 0.25 },
];

const Horizons = () => {
  const [hover, setHover] = useState(null);
  const [horizon, setHorizon] = useState(24);  // months
  const W = 460, H = 230, P = 36;
  const sx = (m) => P + (Math.log(m) / Math.log(36)) * (W - 2*P);
  const sy = (b) => H - P - (b / 0.40) * (H - 2*P);

  // halflife of evidence: assume usefulness decays e^{-t/τ}, τ=18mo
  const tau = 18;
  const useful = Math.exp(-horizon / tau);

  return (
    <Card id="horizons" icon={Hourglass} title="Time horizons & calibration decay" subtitle="Forecasts get worse with horizon. The 'epistemic shelf life' of today's evidence is finite." accent="violet" index={10}>
      <MinSchema>
        Brier scores rise (forecasts worsen) roughly geometrically with <Term>horizon</Term>. The epistemic shelf life of any piece of evidence is finite — typically months, not years. Long-horizon questions need <em>process</em>, not heroic single calls.
      </MinSchema>

      <p>
        Three patterns emerge from tournament data on <Term>calibration decay</Term>: (1) Brier scores grow with horizon, (2) the gap between superforecasters and the rest also grows (compounding small advantages), and (3) past about 2 years, even the best forecasters are noticeably above the always-50% baseline. The implication: long-horizon forecasts need more frequent re-pricing, more tripwires, and more humility — not fewer.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <BarChart3 className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">Brier vs horizon</span>
          <span className="text-[10px] text-neutral-500">· GJP-style empirical curves</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-300" />superforecaster</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-300" />regular forecaster</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-rose-300" />always-50% baseline</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
          {/* axes */}
          <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#404040" />
          <line x1={P} y1={P} x2={P} y2={H-P} stroke="#404040" />
          {/* gridlines */}
          {[0.1, 0.2, 0.3].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W-P} y2={sy(g)} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
              <text x={P-5} y={sy(g)+3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g.toFixed(1)}</text>
            </g>
          ))}
          {[1,3,6,12,24,36].map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={P} x2={sx(t)} y2={H-P} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
              <text x={sx(t)} y={H-P+14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{t}{t<=12?'mo':'mo'}</text>
            </g>
          ))}
          {/* lines */}
          {[
            { k: 'super', color: '#6ee7b7', label: 'superforecaster' },
            { k: 'regular', color: '#a5b4fc', label: 'regular forecaster' },
            { k: 'dart', color: '#fb7185', label: 'always-50% baseline' },
          ].map(s => (
            <g key={s.k}>
              <path
                d={HORIZON_DATA.map((d, i) => `${i===0?'M':'L'} ${sx(d.m)} ${sy(d[s.k])}`).join(' ')}
                fill="none" stroke={s.color} strokeWidth="2"
                strokeDasharray={s.k === 'dart' ? '4 3' : 'none'}
              />
              {HORIZON_DATA.map((d, i) => (
                <circle
                  key={i} cx={sx(d.m)} cy={sy(d[s.k])} r={3.5}
                  fill={s.color}
                  onMouseEnter={(e) => setHover({ s, d, mx: e.clientX, my: e.clientY })}
                  onMouseMove={(e) => setHover({ s, d, mx: e.clientX, my: e.clientY })}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          ))}
          {/* axis labels */}
          <text x={W/2} y={H-3} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">forecast horizon (log scale, months) →</text>
          <text x={10} y={H/2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 10 ${H/2})`}>Brier score</text>
        </svg>
        <FloatingTip hover={hover} render={(h) => (
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{color: h.s.color}}>{h.s.label}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] mt-1">
              <span className="text-neutral-500">horizon</span><span className="text-right font-mono">{h.d.m} months</span>
              <span className="text-neutral-500">Brier</span><span className="text-right font-mono" style={{color: h.s.color}}>{h.d[h.s.k].toFixed(2)}</span>
            </div>
          </div>
        )} />
      </div>

      {/* Halflife of evidence */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Hourglass className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">epistemic shelf life</span>
          <span className="text-[10px] text-neutral-500">· τ = 18 months · pure illustration</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">horizon</span>
              <span className="font-mono text-violet-300">{horizon} months</span>
            </div>
            <input
              type="range" min="1" max="60" step="1" value={horizon}
              onChange={(e) => setHorizon(+e.target.value)}
              className="sf-range w-full"
            />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>1mo</span><span>30mo</span><span>5yr</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">today's evidence still useful</div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${useful*100}%` }}
                transition={{ duration: 0.25 }}
                className="h-full bg-gradient-to-r from-violet-500/70 to-fuchsia-400/70"
              />
            </div>
            <div className="mt-1 text-2xl font-mono text-violet-200">{(useful*100).toFixed(0)}%</div>
            <div className="text-[10px] text-neutral-500">model: <Eq>{'\\mathrm{useful}(t) = e^{-t/\\tau}'}</Eq></div>
          </div>
        </div>
      </div>

      <Misconception
        wrong="A long-horizon forecast just needs more analysis."
        right="A long-horizon forecast needs a process — repeated re-pricing as time passes, explicit tripwires, more reference classes, less reliance on any single piece of evidence. Effort scales worse than linearly with horizon."
        because="At long horizons, today's evidence has decayed below the noise floor. The 'best forecast' becomes a series of progressively-tightened bets as time passes, not one heroic call made today."
      />

      <Deeper>
        <p>
          <strong>An AR(1) model of decay.</strong> One way to formalize calibration decay: at each time step, an exogenous shock with variance <Eq>{'\\sigma^2'}</Eq> hits the underlying state. After <Eq>{'t'}</Eq> steps, the variance of the prediction error grows as
        </p>
        <Block>{`\\mathrm{Var}(\\hat{x}_t - x_t) \\;=\\; \\sigma^2 \\, \\frac{1 - \\rho^{2t}}{1 - \\rho^2}`}</Block>
        <p>
          where <Eq>{'\\rho \\in (0, 1)'}</Eq> is the persistence of the underlying state. With <Eq>{'\\rho \\approx 0.96'}</Eq> per month (typical for slow-moving political/macro questions), the variance roughly doubles every ~17 months. The Brier score follows the variance — hence the geometric rise.
        </p>
        <p>
          <strong>The decay is asymmetric.</strong> Calibration (REL) decays faster than resolution (RES). In practice this means: long-horizon forecasters can still <em>sort</em> outcomes (they keep some information), but their stated probabilities drift away from frequencies. The fix is recurring recalibration audits, not abandoning forecasts.
        </p>
        <p>
          <strong>Sweet-spot horizons for tournament practice.</strong> The GJP found 3–12 month questions hit the best ratio of (information available) to (decay). Below 3mo, questions are usually about already-public news (low resolution potential); above 12mo, decay swamps signal. Most public predictions in business/policy live in the 18–36 month range — exactly where the Brier curves are bending up sharply. This is partly why public forecasts perform poorly: they're harvested at horizons where calibration is structurally hard.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is the always-50% baseline flat across horizons?', a: 'Because it ignores the question entirely; it has no calibration to lose. As real forecasters\' Brier rises with horizon, eventually they cross 0.25 and become worse than the no-skill baseline. Top forecasters cross around 36 months in our data; pundits sometimes cross at 6–12.' },
        { q: 'How should a 5-year forecast be made differently from a 6-month one?', a: 'Three changes. (1) Decompose more aggressively — break it into year-1, year-2-given-year-1, etc. (2) Build explicit tripwires that fire monthly. (3) Plan to update at least quarterly; the "5-year forecast" is really 20 quarterly forecasts in a trench coat.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — ★ ANCHOR · THE ROBOTAXI QUESTION
   ========================================================================== */

const ANCHOR_REF_PRIORS = [
  { name: 'AV programs since 2010',                    yes: 1, n: 28, p: 0.04 },
  { name: 'Ride-hailing services to 1M/day in 1 city', yes: 1, n: 4,  p: 0.25 },
  { name: 'New transport modes to dominant 1M/day',    yes: 4, n: 5,  p: 0.80 },
];

// Bayesian update inputs the anchor card uses
const ANCHOR_EVIDENCE = [
  { id: 'wgrow', label: 'Waymo public weekly rides growing ~3× per year (250K → 750K → 2M projected by 2027)',     lr: 2.4, dir: 'bull' },
  { id: 'cost',  label: 'Per-mile fully-loaded cost still ~2× human rideshare; no public audit of below-parity yet', lr: 0.55, dir: 'bear' },
  { id: 'nat',   label: 'No NHTSA national framework; state-by-state approval continues to fragment',                lr: 0.7,  dir: 'bear' },
  { id: 'incu',  label: 'Tesla, Zoox, Pony.ai are credible second/third entrants but each years from 1M-class scale', lr: 0.85, dir: 'bear' },
  { id: 'cap',   label: 'Hyperscale capital available (Alphabet, SoftBank, sovereign funds)',                        lr: 1.5,  dir: 'bull' },
];

const Anchor = () => {
  const [predicted, setPredicted] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Final synthesis math
  // 1. Outside-view prior: geometric mean of three reference classes
  const priors = ANCHOR_REF_PRIORS.map(r => r.p);
  const gmean = Math.exp(priors.reduce((s, p) => s + Math.log(p), 0) / priors.length);
  // 2. Apply evidence in log-odds
  const logitP = (p) => Math.log(p / (1 - p));
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const logShift = ANCHOR_EVIDENCE.reduce((s, e) => s + Math.log(e.lr), 0);
  const posterior = sigmoid(logitP(gmean) + logShift);
  // 3. From the Fermi chain (median scenario), point gives ~10–25% based on previous card
  const fermiP = 0.18;
  // 4. Aggregate posterior + Fermi as two "voices"
  const voiceMean = 0.5 * posterior + 0.5 * fermiP;
  // 5. Mild extremize (a=1.4 — uncertain question, only 2 voices)
  const extremize = (p, a) => Math.pow(p, a) / (Math.pow(p, a) + Math.pow(1 - p, a));
  const final = extremize(voiceMean, 1.4);

  return (
    <Card
      id="anchor"
      icon={Rocket}
      title="The robotaxi question — synthesis"
      subtitle="Anchor card · the entire toolkit applied to one concrete forecast"
      accent="fuchsia"
      index={11}
      anchor
      source="all techniques · cards 01–10"
    >
      {/* The question, formally stated */}
      <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/[0.06] p-4">
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <Star className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">the question · formally stated</span>
        </div>
        <p className="text-[14px] text-neutral-100 leading-relaxed">
          By <span className="font-mono text-fuchsia-200">Dec-31-2028</span>, will any single US Metropolitan Statistical Area record at least <span className="font-mono text-fuchsia-200">1,000,000</span> paid public-facing fully-autonomous (no in-vehicle safety driver, no continuous remote teleoperation) robotaxi rides on at least one calendar day?
        </p>
        <div className="mt-2 grid md:grid-cols-2 gap-2 text-[10.5px]">
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">arbiter</span>
            <div className="text-neutral-300 mt-0.5">SEC filing, audited operator dashboard, or NHTSA quarterly report.</div>
          </div>
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">defaults</span>
            <div className="text-neutral-300 mt-0.5">Silence → NO. Mergers preserve continuity. ≥ 1 hr service pause disqualifies that day.</div>
          </div>
        </div>
      </div>

      {/* Predict-then-reveal slider */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Lightbulb className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">predict first · drag</span>
        </div>
        <div className="space-y-2">
          <input
            type="range" min="1" max="99" step="1" value={predicted ?? 30}
            onChange={(e) => setPredicted(+e.target.value)}
            className="sf-range w-full"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1%</span><span>50%</span><span>99%</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="text-[12px] text-neutral-300">
              your guess: <span className="font-mono text-violet-200 text-lg">{predicted ?? '—'}{predicted != null ? '%' : ''}</span>
            </div>
            <button
              disabled={predicted == null}
              onClick={() => setRevealed(true)}
              className={`text-[11px] rounded border px-3 py-1.5 flex items-center gap-1.5 ${
                predicted == null
                  ? 'border-white/10 text-neutral-600 cursor-not-allowed'
                  : 'border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200'
              }`}
            >
              {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {revealed ? 'revealed' : 'reveal synthesis'}
            </button>
          </div>
        </div>
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          {/* Step 1: outside view */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 mb-1">step 1 · outside view <span className="text-neutral-500">(card 04)</span></div>
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3 space-y-2">
              {ANCHOR_REF_PRIORS.map((r) => (
                <div key={r.name} className="grid grid-cols-[1fr_auto_60px] gap-2 items-center text-[11.5px]">
                  <span className="text-neutral-200">{r.name}</span>
                  <span className="text-neutral-500 font-mono">{r.yes}/{r.n}</span>
                  <span className="font-mono text-right text-emerald-300">{(r.p*100).toFixed(0)}%</span>
                </div>
              ))}
              <div className="pt-2 border-t border-emerald-400/15 grid grid-cols-[1fr_auto_60px] gap-2 items-center text-[11.5px]">
                <span className="text-emerald-200 font-semibold">geometric mean (combined prior)</span>
                <span></span>
                <span className="font-mono text-right text-emerald-200 text-base">{(gmean*100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Step 2: Fermi */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-1">step 2 · fermi chain <span className="text-neutral-500">(card 05)</span></div>
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-3">
              <div className="text-[11.5px] text-neutral-200 leading-snug">
                <span className="font-mono text-amber-300">4 cities</span> × <span className="font-mono text-amber-300">1500 AVs/city</span> × <span className="font-mono text-amber-300">18 rides/AV/day</span> ≈{' '}
                <span className="font-mono text-amber-200">108K rides/day</span> at the median scenario; the chain hits the 1M target only ~{(fermiP*100).toFixed(0)}% of the time once log-uncertainty is propagated.
              </div>
              <div className="mt-2 text-[11px] font-mono text-amber-200 text-right">P(Fermi ≥ 1M) ≈ {(fermiP*100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Step 3: Bayes */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 mb-1">step 3 · evidence (Bayesian update) <span className="text-neutral-500">(card 06)</span></div>
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] p-3 space-y-1.5">
              {ANCHOR_EVIDENCE.map((e) => (
                <div key={e.id} className="grid grid-cols-[1fr_auto_60px] gap-2 items-center text-[11px]">
                  {e.dir === 'bull'
                    ? <TrendingUp className="w-3 h-3 text-emerald-300" />
                    : <TrendingDown className="w-3 h-3 text-rose-300" />}
                  <span className="text-neutral-200 leading-snug">{e.label}</span>
                  <span className={`font-mono text-right ${e.lr > 1 ? 'text-emerald-300' : 'text-rose-300'}`}>LR {e.lr.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-cyan-400/15 text-[11.5px] flex items-center justify-between gap-2 flex-wrap">
                <span className="text-neutral-300">Σ log(LR) = <span className="font-mono text-cyan-200">{logShift.toFixed(2)}</span></span>
                <span className="text-cyan-200">prior {(gmean*100).toFixed(0)}% → posterior <span className="text-base font-mono">{(posterior*100).toFixed(0)}%</span></span>
              </div>
            </div>
          </div>

          {/* Step 4: aggregate + extremize */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300 mb-1">step 4 · aggregate two voices <span className="text-neutral-500">(card 09)</span></div>
            <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/[0.06] p-3">
              <div className="grid md:grid-cols-3 gap-2 mb-3">
                <Stat label="Bayes posterior" value={`${(posterior*100).toFixed(0)}%`} sub="prior + 5 evidence pieces" color="text-cyan-300" />
                <Stat label="Fermi P(≥1M)" value={`${(fermiP*100).toFixed(0)}%`} sub="multiplicative chain" color="text-amber-300" />
                <Stat label="50/50 average" value={`${(voiceMean*100).toFixed(0)}%`} sub="before extremizing" color="text-neutral-300" />
              </div>
              <div className="rounded-md bg-fuchsia-500/10 border border-fuchsia-400/30 p-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300 mb-1">final forecast (a = 1.4)</div>
                <div className="text-4xl font-mono text-fuchsia-100 font-semibold">{(final*100).toFixed(0)}%</div>
                <div className="mt-1 text-[10.5px] text-fuchsia-200/70">
                  Range under perturbed inputs: <span className="font-mono">{Math.round(final*100*0.65)}% – {Math.round(Math.min(99, final*100*1.5))}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calibration graveyard */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300 mb-1">calibration graveyard · common wrong intuitions</div>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { wrong: '"It will obviously happen — Waymo is exploding."',  why: 'Anchors on growth rate without converting to absolute scale. 750K rides/week ≠ 1M rides/day; it\'s ~7× short.' },
                { wrong: '"It\'s impossible — every AV company has failed."', why: 'Reference-class too tight. Earlier failures included different physical/regulatory bets; doesn\'t bind current-generation operators.' },
                { wrong: '"50–50, who knows."',                              why: 'Hedge to the climatology. Throws away every base rate and every piece of evidence; Brier-equivalent to forecasting nothing.' },
                { wrong: '"Look at the latest data point."',                why: 'Availability bias. A single press release rarely has LR > 2; you need to integrate across many small signals over time.' },
              ].map((g, i) => (
                <div key={i} className="rounded-md border border-rose-400/20 bg-rose-400/[0.04] p-2.5">
                  <div className="text-[11px] text-rose-200 italic leading-snug">{g.wrong}</div>
                  <div className="mt-1 text-[10.5px] text-neutral-400 leading-snug"><span className="text-neutral-500">why wrong:</span> {g.why}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bull / Bear cases side by side */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <div className="text-sm font-semibold text-emerald-200">Bull case · signs to watch</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· Waymo announces ≥ 5 new metros simultaneously</li>
                <li>· A peer operator (Tesla/Zoox) hits 100K rides/week in any city</li>
                <li>· Fully-loaded cost-per-mile crosses human-rideshare parity (audited)</li>
                <li>· NHTSA pre-empts state approval with national framework</li>
                <li>· Insurance cost trend reverses (claims data)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-300" />
                <div className="text-sm font-semibold text-rose-200">Bear case · signs to watch</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· A high-profile fatality with sustained &gt; 90 days of political pressure</li>
                <li>· Any operator pauses expansion ≥ 2 quarters in a major market</li>
                <li>· Insurance rates rise &gt; 3× in any major state</li>
                <li>· State-level AV moratoria spread to a top-10 metro</li>
                <li>· Charging/utility interconnect delays in dominant city</li>
              </ul>
            </div>
          </div>

          {/* Quote */}
          <div className="rounded-xl border-l-4 border-fuchsia-400/50 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-fuchsia-300 shrink-0 mt-1" />
              <div>
                <div className="text-[13px] text-neutral-200 italic leading-relaxed">
                  "The future is not some place we are going, but one we are creating. The paths are not to be found, but made. And the activity of making them changes both the maker and the destination."
                </div>
                <div className="text-[10px] uppercase tracking-wider text-fuchsia-300/70 mt-1.5 not-italic">— John Schaar · paraphrased and used by GJP for long-horizon questions</div>
              </div>
            </div>
          </div>

          <Misconception
            wrong="A 30% forecast is 'pessimistic' on the robotaxi question."
            right="A 30% forecast is informationally rich. It says: more likely NO than YES, but the YES outcome is taken seriously enough to plan for. The Brier-optimal forecast on a question this uncertain at this horizon is rarely above 50%."
            because="At 36-month horizon, even superforecasters hit Brier ≈ 0.24 — meaningfully above the 0.18 they achieve at 12 months. The honest answer to 'will this happen?' three years out is usually some intermediate probability, not a bold call. Hedgehogs sound certain; foxes sound 30–40%."
          />

          <Deeper>
            <p>
              <strong>Why the forecast is what it is.</strong> Three forces pull in opposite directions: (1) reference classes anchor the prior <em>low</em> — the dominant historical pattern is "AV programs underperform." (2) Recent Waymo growth pulls evidence <em>high</em> — but Bayesian-discounted because per-mile economics haven't visibly inflected yet. (3) Fermi-decomposition pulls <em>low</em> — the median scenario is well short of 1M, with high-end tails barely reaching it. The synthesis (~30%) reflects the resulting tension. Anyone reporting &gt; 60% or &lt; 10% on this question is implicitly disagreeing with one of those three forces; they should say which.
            </p>
            <p>
              <strong>What would resolve this early.</strong> Two observations would substantially lower the variance of this forecast: (1) any single operator publishing audited fully-loaded cost-per-mile for ≥ 6 months at parity with human rideshare, or (2) a sustained step-up in Waymo's weekly rides above 5M (currently ~750K). Either event would shift the posterior by 15–25 percentage points — the size of update worth pre-committing to as a tripwire (card 08).
            </p>
            <p>
              <strong>What this card is NOT doing.</strong> It is not a confident prediction; it is a transparent reasoning chain. The output is ~{(final*100).toFixed(0)}%, but the more important deliverable is the <em>structure</em> — anyone who disagrees can point to which step they'd compute differently. That's the deliverable forecasting tournaments evaluate; a single number with no chain is an opinion, not a forecast.
            </p>
          </Deeper>
        </motion.div>
      )}

      <WhenItMatters>
        Anywhere you have to bet capital, plan capacity, or argue strategy across uncertain technology timelines: AV, fusion, autonomous shipping, drug-pipeline rollouts, satellite constellations, AI capability milestones. The synthesis pattern (outside view → Fermi → Bayes → aggregate → extremize) is the reusable skeleton.
      </WhenItMatters>

      <QA items={[
        { q: 'Two forecasters disagree: 22% vs 45%. Where should the conversation focus?', a: 'On the step where they diverge most. Often it\'s the LR they assign to one piece of evidence, or the choice of reference class. The chain makes that disagreement locatable; without the chain, the conversation degenerates into "I just feel it\'s higher".' },
        { q: 'Is it cheating to keep updating the forecast as the date approaches?', a: 'It\'s the opposite. Holding a single forecast frozen ignores the 2-year decay of evidence. Tournament practice is to update freely and score the time-weighted average — your forecast at any moment is what you believed then.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — TRACK RECORD & POST-MORTEM
   ========================================================================== */

// hypothetical "your" track record — a stylized log of 142 forecasts
const YOUR_TRACK = [
  { p: 0.05, n: 18, o: 0.06 },
  { p: 0.15, n: 22, o: 0.20 },
  { p: 0.25, n: 18, o: 0.24 },
  { p: 0.35, n: 16, o: 0.31 },
  { p: 0.45, n: 14, o: 0.42 },
  { p: 0.55, n: 14, o: 0.55 },
  { p: 0.65, n: 12, o: 0.69 },
  { p: 0.75, n: 12, o: 0.78 },
  { p: 0.85, n: 10, o: 0.81 },
  { p: 0.95, n: 6,  o: 0.92 },
];

// 4-step post-mortem template
const POST_MORTEM_STEPS = [
  {
    step: '1 · classify the miss',
    body: 'Was the miss in calibration (probability too high/low) or in resolution (you saw this as 50/50, evidence said otherwise)? The Brier delta tells you which.',
  },
  {
    step: '2 · find the bin',
    body: 'In which bin did the miss happen? If you said 80% on a NO outcome, that bin contributed (0.8 − 0)² = 0.64 to your Brier — much heavier than a 60%→NO miss (0.36).',
  },
  {
    step: '3 · trace the chain backward',
    body: 'Walk the original reasoning chain. Was the prior wrong (reference class)? An LR mis-set (Bayes)? A factor in the Fermi chain? Localizing the error matters more than its size.',
  },
  {
    step: '4 · update the playbook',
    body: 'Convert the lesson into a rule for future forecasts: "I systematically over-rate LR for [evidence type] — discount by 30%". The post-mortem closes the loop only when it changes future behavior.',
  },
];

const TrackRecord = () => {
  const [stepOpen, setStepOpen] = useState(null);
  const [hover, setHover] = useState(null);
  const W = 460, H = 280, P = 38;
  const N = YOUR_TRACK.reduce((s, b) => s + b.n, 0);
  const obar = YOUR_TRACK.reduce((s, b) => s + b.n * b.o, 0) / N;
  const REL = YOUR_TRACK.reduce((s, b) => s + b.n * (b.p - b.o) ** 2, 0) / N;
  const RES = YOUR_TRACK.reduce((s, b) => s + b.n * (b.o - obar) ** 2, 0) / N;
  const UNC = obar * (1 - obar);
  const B = REL - RES + UNC;
  const SS = 1 - B / UNC;
  // Brier standard error (Bröcker–Smith): SE ≈ sqrt(Var(Brier)/N) for binary forecasts;
  // approximated by sqrt((1/N)·Σ((p−o)² − B)² / N) — use simple approx σ_B ≈ 2*sqrt(B*(1-B)/N)
  const seB = 2 * Math.sqrt(B * (1 - B) / N);

  const sx = (p) => P + p * (W - 2*P);
  const sy = (o) => H - P - o * (H - 2*P);
  const maxN = Math.max(...YOUR_TRACK.map(b => b.n));

  return (
    <Card id="trackrecord" icon={BarChart3} title="Track record & post-mortem" subtitle="The last technique: log every forecast, score it, and learn the lessons that compound" accent="sky" index={12}>
      <MinSchema>
        Forecasts without a written log don't compound — memory is selective and self-flattering. The discipline is: log every probability, score it post-resolution, and run a structured post-mortem on misses.
      </MinSchema>

      <p>
        A track record is the only way to know whether you're improving. Two forecasters with the same Brier-this-year can have very different trajectories — one is bumping along, the other is correcting systematic errors. The post-mortem is what produces the second.
      </p>

      {/* Reliability diagram of "your" track */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-x-3">
          <div className="text-xs uppercase tracking-widest text-neutral-500">Your reliability diagram · 142 forecasts (illustrative)</div>
          <div className="text-[10px] text-neutral-500 font-mono">B = {B.toFixed(3)} ± {seB.toFixed(3)}</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
          <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#404040" />
          <line x1={P} y1={P} x2={P} y2={H-P} stroke="#404040" />
          {[0.2, 0.4, 0.6, 0.8].map(g => (
            <g key={g}>
              <line x1={sx(g)} y1={P} x2={sx(g)} y2={H-P} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
              <line x1={P} y1={sy(g)} x2={W-P} y2={sy(g)} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
              <text x={sx(g)} y={H-P+14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{g.toFixed(1)}</text>
              <text x={P-5} y={sy(g)+3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g.toFixed(1)}</text>
            </g>
          ))}
          <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="#a3a3a3" strokeDasharray="3 3" opacity="0.6" />
          <text x={sx(0.83)} y={sy(0.83)-6} fontSize="9" fill="#737373" fontFamily="ui-monospace">y = x</text>
          {YOUR_TRACK.map((b, i) => {
            const r = 4 + 8 * Math.sqrt(b.n / maxN);
            return (
              <g key={i}>
                <line x1={sx(b.p)} y1={sy(b.p)} x2={sx(b.p)} y2={sy(b.o)} stroke="#7dd3fc" strokeWidth="0.8" opacity="0.4" />
                <circle cx={sx(b.p)} cy={sy(b.o)} r={r}
                  fill="#7dd3fc" fillOpacity="0.25" stroke="#7dd3fc" strokeWidth="1.5"
                  onMouseEnter={(e) => setHover({ ...b, mx: e.clientX, my: e.clientY })}
                  onMouseMove={(e) => setHover({ ...b, mx: e.clientX, my: e.clientY })}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
          <text x={W/2} y={H-4} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">stated probability →</text>
          <text x={10} y={H/2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 10 ${H/2})`}>empirical frequency</text>
        </svg>
        <FloatingTip hover={hover} render={(h) => (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-1">bin</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <span className="text-neutral-500">stated p̄</span><span className="text-right font-mono">{h.p.toFixed(2)}</span>
              <span className="text-neutral-500">observed ō</span><span className="text-right font-mono">{h.o.toFixed(2)}</span>
              <span className="text-neutral-500">forecasts</span><span className="text-right font-mono">{h.n}</span>
              <span className="text-neutral-500">|p̄−ō|</span><span className="text-right font-mono text-rose-300">{Math.abs(h.p-h.o).toFixed(2)}</span>
            </div>
          </div>
        )} />
        <div className="mt-3 grid md:grid-cols-5 gap-2">
          <Stat label="N" value={N} sub="forecasts logged" color="text-neutral-200" />
          <Stat label="Brier" value={B.toFixed(3)} sub={`SE ≈ ${seB.toFixed(3)}`} color={B < 0.20 ? 'text-emerald-300' : 'text-amber-300'} />
          <Stat label="Reliability" value={REL.toFixed(3)} sub="lower → calibrated" color="text-rose-300" />
          <Stat label="Resolution" value={RES.toFixed(3)} sub="higher → sharp" color="text-emerald-300" />
          <Stat label="Skill 1−B/U" value={SS.toFixed(2)} sub="vs always-base-rate" color={SS > 0 ? 'text-emerald-300' : 'text-rose-300'} />
        </div>
      </div>

      {/* Post-mortem template */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <ScrollText className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">post-mortem template · click each step</span>
        </div>
        <div className="space-y-2">
          {POST_MORTEM_STEPS.map((s, i) => (
            <div key={i} className="rounded-md border border-sky-400/20 bg-sky-400/[0.04]">
              <button
                onClick={() => setStepOpen(stepOpen === i ? null : i)}
                className="w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-sky-400/[0.06]"
              >
                <ChevronDown className={`w-3.5 h-3.5 mt-[3px] text-sky-300 shrink-0 transition-transform ${stepOpen === i ? 'rotate-0' : '-rotate-90'}`} />
                <div className="text-[11.5px] text-neutral-100 font-mono uppercase tracking-wide">{s.step}</div>
              </button>
              <AnimatePresence initial={false}>
                {stepOpen === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="px-3 pb-3 pl-9 text-[11.5px] text-neutral-300 leading-snug">{s.body}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <Misconception
        wrong="One bad forecast means I should rethink everything."
        right="One bad forecast is one data point; with N = 1 the standard error of your Brier is enormous. Look at the pattern across many forecasts — particularly bin-by-bin in your reliability diagram — to see what's signal."
        because="Forecasting is variance-heavy. Even Brier 0.18 forecasters miss often. The discipline is to detect <em>systematic</em> error patterns (e.g. 'I'm 5pp too high in 70–80% bin') rather than over-correcting on individual cases."
      />

      <Deeper>
        <p>
          <strong>Brier's standard error.</strong> A rough estimate of how stable your Brier number is:
        </p>
        <Block>{`\\mathrm{SE}(B) \\;\\approx\\; \\sqrt{\\frac{\\mathrm{Var}((p_i-o_i)^2)}{N}} \\;\\lesssim\\; 2\\sqrt{\\frac{B(1-B)}{N}}`}</Block>
        <p>
          With N = 142 and B = 0.20, SE ≈ 0.07 — so a "0.20 vs 0.18" comparison between two forecasters needs ≥ 200 forecasts each to be statistically meaningful. The implication: <em>year-to-year track-record changes need to be large to be real</em>. Don't rebuild your process on one quarter's noise.
        </p>
        <p>
          <strong>Paired comparison test.</strong> When comparing two forecasters on the same questions, the right test is on the per-question Brier <em>difference</em>. Each question contributes one paired observation; a t-test or Wilcoxon on the differences has much more power than comparing two independent means. The GJP literature uses this for elite-team vs market comparisons.
        </p>
        <p>
          <strong>The reliability diagram is the headline diagnostic.</strong> Brier is a scalar; the diagram is its full picture. A diagram that's flat (slope &lt; 1) means you're under-confident; steep (slope &gt; 1) means over-confident; bendy means calibrated in some regions and not others. The "fix" is bin-specific: if your 80% bin sits at 65%, scale your future "80%" forecasts to 70% until calibrated.
        </p>
        <p>
          <strong>Habits of forecasters who improve over time.</strong> Across the GJP, the trait that best predicted year-over-year improvement was not raw intelligence or topic expertise — it was <em>structured post-mortem habit</em>: writing forecast justifications up-front, scoring them on resolution, and explicitly naming a lesson per miss. Forecasters who skipped the post-mortem step plateaued at their year-1 Brier. Forecasters who did it improved by ~0.02–0.04 Brier per year for 2–3 years before plateauing.
        </p>
      </Deeper>

      <QA items={[
        { q: 'My Brier is 0.22 this year, 0.20 last year. Am I improving?', a: 'Probably noise. With N≈100, SE(B) ≈ 0.04 — a 0.02 swing is well within sampling variation. You\'re only meaningfully better when the gap exceeds ~2 SE for two consecutive years (roughly).' },
        { q: 'How many forecasts before a track record means anything?', a: '~50 to start seeing your reliability diagram\'s shape; ~150–200 before Brier stabilizes within 0.03 of the true value. Below 50, treat scores as suggestive only.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — NEXT TRAILS
   ========================================================================== */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling ideas, depth, foundations, and the wider arena" accent="violet" index={13}>
    <MinSchema>
      Judgmental forecasting is one branch of a wider tree. Statistical forecasting (time series, ML), decision-making under deep uncertainty (Knightian, scenarios), and prediction markets are the natural neighbors. Pick the vector that most expands your model.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'in this sandbox · clickable',
        items: [
          { label: 'Systems Thinking', href: '#systems-thinking', note: 'Stocks, flows, feedback, delays — the topology underneath every forecasting question. A delayed-feedback system is what makes long-horizon forecasts hard.' },
          { label: 'Machine Learning', href: '#machine-learning', note: 'The statistical-forecasting cousin: gradient-boosted trees and time-series models for noisy data with a ground truth.' },
          { label: 'Reinforcement Learning', href: '#reinforcement-learning', note: 'Decision-theoretic forecasting under your own actions — the Bellman equation is Bayesian updating with consequences.' },
          { label: 'The World Economy', href: '#world-economy', note: 'Where macro forecasts meet real numbers — capital flows, sectoral balances, the dollar regime.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'the next layer of detail on the techniques here',
        items: [
          { label: 'Tetlock & Gardner — Superforecasting (2015)', note: 'The book-length introduction. The "ten commandments" appendix is itself a useful checklist.' },
          { label: 'Mellers et al. — JEP 2014/2015 papers', note: 'The empirical bedrock — Brier deltas, AOM scale, training effects. Open access.' },
          { label: 'Good Judgment Open · gjopen.com', note: 'Free practice tournaments. Submit forecasts, see your Brier next to a calibrated peer pool.' },
          { label: 'Metaculus · metaculus.com', note: 'Larger public tournament with track-record-weighted aggregation and serious resolution rigor.' },
          { label: 'Galef — The Scout Mindset (2021)', note: 'AOM as a habit, not a personality trait. Practical exercises for soldier-to-scout migration.' },
          { label: 'Klein — Sources of Power (1998)', note: 'Where the premortem comes from. Naturalistic decision-making under stress.' },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math/science underneath',
        items: [
          { label: 'Probability theory & Bayes', note: 'Cox\'s theorem, conjugate priors, hierarchical models. Jaynes\' Probability Theory: The Logic of Science.' },
          { label: 'Decision theory', note: 'Expected utility, Savage axioms, ambiguity aversion. Where probabilities turn into actions.' },
          { label: 'Information theory', note: 'KL divergence and proper scoring rules — why the log score is "natural" and how it relates to entropy reduction.' },
          { label: 'Statistical learning', note: 'Calibration in ML classifiers, isotonic regression, conformal prediction — the algorithmic side of "make probabilities honest".' },
          { label: 'Behavioral economics', note: 'Kahneman/Tversky, anchoring, conjunction fallacy, base-rate neglect. The cognitive errors the toolkit defends against.' },
        ],
      },
      {
        title: 'Zoom out',
        note: 'where forecasting fits in the wider world',
        items: [
          { label: 'Statistical forecasting (B)', note: 'Time-series, probabilistic ML, quantile regression. Sibling explainer planned in this sandbox.' },
          { label: 'Decision-making under deep uncertainty (C)', note: 'Knightian uncertainty, scenarios, robust decision-making, Taleb\'s antifragile / fat-tails. Sibling explainer planned.' },
          { label: 'Prediction markets', note: 'Manifold, Polymarket, Kalshi. Skin-in-the-game aggregation with built-in extremizing — and its market-microstructure failure modes.' },
          { label: 'Election & policy forecasting', note: 'Silver / 538, Economist model, NowCast. Hybrid statistical + judgmental, well-instrumented for post-mortems.' },
          { label: 'AI capability forecasting', note: 'METR, Epoch, AI Impacts. New domain where reference classes barely exist; the techniques here are still load-bearing.' },
          { label: 'Climate scenarios', note: 'IPCC SSPs, IEA ETP. Long-horizon forecasting wrapped around scenarios because point forecasts are useless at 80-year horizons.' },
        ],
      },
    ]} />
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
        <span className="text-violet-300">Tetlock & Gardner · Superforecasting (2015)</span>
        <span className="text-sky-300">GJP papers</span>
        <span className="text-emerald-300">Mellers et al.</span>
        <span className="text-amber-300">Klein · premortem</span>
        <span className="text-fuchsia-300">Galef · Scout Mindset</span>
      </div>
      <p className="max-w-xl mx-auto">
        Numbers and Brier deltas are from published GJP analyses (Mellers, Tetlock, Atanasov, Karvetski). The robotaxi anchor uses public Waymo/Cruise/Uber operating data through Q1 2026; treat all forward numbers as probabilistic, not predictive.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function SuperforecastingExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].sf-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].sf-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(196,181,253,0.4);
        }
        input[type=range].sf-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <Traps />
        <Operationalize />
        <Calibration />
        <ReferenceClasses />
        <Fermi />
        <Bayes />
        <Mindset />
        <Premortem />
        <Aggregate />
        <Horizons />
        <Anchor />
        <TrackRecord />
        <NextTrails />
      </main>

      <Footer />
    </div>
  );
}
