import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Boxes, BrainCircuit,
  ChevronDown, Compass, Crosshair, Eye, EyeOff, Filter, FlaskConical, Gauge,
  GitBranch, GitFork, HelpCircle, Layers, Layers3, Lightbulb, Link2, Network,
  Quote, Ruler, Scale, Shuffle, ShieldAlert, Sigma, Sparkles, Split, Star,
  Target, TrendingUp, TrendingDown, Workflow, Wand2, CheckCircle2, XCircle,
  FunctionSquare, LineChart, CircleDollarSign,
} from 'lucide-react';

/* ============================================================================
   Causal Inference · from correlation to counterfactual
   A unified-survey explainer: potential outcomes + Pearl's DAGs + the estimator
   toolkit (RCT, matching, IPW, IV, diff-in-diff, RDD, synthetic control,
   double ML, mediation). Anchored on the LaLonde / NSW job-training puzzle —
   naive observational comparison says training LOWERED earnings; the randomized
   experiment says +$1,800/yr. Every estimator is scored against that truth.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber  · numbers
  '\\bi':  '\\textcolor{##fb7185}{#1}',  // rose   · bias / open back-door
  '\\ca':  '\\textcolor{##6ee7b7}{#1}',  // emerald· causal / identified
  '\\va':  '\\textcolor{##7dd3fc}{#1}',  // sky    · variables
  '\\tr':  '\\textcolor{##c4b5fd}{#1}',  // violet · treatment / do()
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
const mean = (arr, f = (x) => x) => (arr.length ? arr.reduce((s, x) => s + f(x), 0) / arr.length : 0);
const sd = (arr, f = (x) => x) => {
  if (arr.length < 2) return 0;
  const m = mean(arr, f);
  return Math.sqrt(arr.reduce((s, x) => s + (f(x) - m) ** 2, 0) / (arr.length - 1));
};
const fmtK = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const fmtKk = (v) => fmtK(Math.round(v * 1000)); // v is in $1000s

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

const Card = ({ id, icon: Icon, title, subtitle, accent = 'violet', index, source, anchor = false, children }) => {
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
};
const Chip = ({ children, color = 'violet' }) => (
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
  'potential outcomes': 'The pair Y(1), Y(0): what a unit’s outcome would be under treatment and under control. Only one is ever observed — the other is counterfactual.',
  'counterfactual': 'The outcome that would have happened under the treatment a unit did NOT receive. Never observed; the heart of causal inference.',
  'ATE': 'Average Treatment Effect: E[Y(1) − Y(0)] over the whole population.',
  'ATT': 'Average Treatment effect on the Treated: E[Y(1) − Y(0) | D=1]. The LaLonde benchmark is an ATT.',
  'ATC': 'Average Treatment effect on the Controls: E[Y(1) − Y(0) | D=0].',
  'treatment effect': 'For a unit, τ = Y(1) − Y(0). Individual effects are unobservable; we estimate averages.',
  'fundamental problem of causal inference': 'For any unit you see Y(1) or Y(0), never both. Causal inference is a missing-data problem.',
  'SUTVA': 'Stable Unit Treatment Value Assumption: one unit’s treatment doesn’t affect another’s outcome, and there is only one version of treatment.',
  'ignorability': 'Treatment is independent of the potential outcomes given covariates: (Y(0),Y(1)) ⊥ D | X. Also called unconfoundedness or selection-on-observables.',
  'unconfoundedness': 'Same as ignorability: once you condition on X, treatment is as-good-as-random. Untestable from data alone.',
  'confounder': 'A variable that causes both the treatment and the outcome. Leaving it uncontrolled opens a back-door path and biases the estimate.',
  'DAG': 'Directed Acyclic Graph: nodes are variables, arrows are direct causal effects, no cycles. Pearl’s language for causal assumptions.',
  'd-separation': 'A graphical rule that reads conditional independence off a DAG. Two nodes are d-separated given a set if every path between them is blocked.',
  'back-door path': 'A non-causal path from treatment to outcome that starts with an arrow INTO the treatment. Open back-doors create spurious association.',
  'back-door criterion': 'A set of covariates that blocks every back-door path (and contains no descendants of treatment) identifies the causal effect by adjustment.',
  'front-door criterion': 'Identifies an effect through a fully-mediating variable even when an unmeasured confounder makes the back-door unusable.',
  'collider': 'A variable with two arrows pointing INTO it. A collider blocks a path — until you condition on it, which OPENS the path and creates bias.',
  'mediator': 'A variable on the causal path from treatment to outcome (D → M → Y). Conditioning on a mediator removes part of the effect you want.',
  'do-operator': 'do(X=x) denotes an intervention that sets X to x, deleting all arrows into X. P(Y|do(x)) ≠ P(Y|x) in general.',
  'intervention': 'Externally setting a variable, as opposed to passively observing it. Interventions, not observations, define causal effects.',
  'structural causal model': 'A set of equations Y := f(parents, noise) plus a DAG. Generates both observational and interventional distributions.',
  'exchangeability': 'Treated and control groups are comparable — their potential outcomes have the same distribution (possibly after conditioning on X).',
  'propensity score': 'e(X) = P(D=1 | X), the probability of treatment given covariates. Conditioning on this scalar is enough to remove confounding under ignorability.',
  'common support': 'The covariate region where both treated and control units exist. Outside it, no comparison is possible — estimates rely on extrapolation.',
  'overlap': 'Same as common support / positivity: 0 < e(X) < 1 for all X. Without overlap, some units have no possible counterpart.',
  'positivity': 'Every covariate profile has a non-zero chance of both treatment and control. Required for weighting and matching to work.',
  'matching': 'Pairing each treated unit with control unit(s) of similar covariates (or propensity score) to mimic a randomized comparison.',
  'caliper': 'A maximum allowed distance for a match. Treated units with no control inside the caliper are dropped — trading bias for sample size.',
  'inverse propensity weighting': 'IPW: weight each unit by 1/e(X) (treated) or 1/(1−e(X)) (control) to build a pseudo-population where treatment is independent of X.',
  'doubly robust': 'An estimator that combines an outcome model and a propensity model; consistent if EITHER one is correct.',
  'instrumental variable': 'A variable Z that affects treatment, affects the outcome ONLY through treatment (exclusion), and shares no confounder with the outcome.',
  'exclusion restriction': 'The instrument has no direct path to the outcome — it influences Y only by moving the treatment.',
  'LATE': 'Local Average Treatment Effect: the effect for compliers — units whose treatment status is moved by the instrument. Not the ATE in general.',
  'complier': 'A unit that takes treatment when the instrument pushes it to and not otherwise. IV identifies the effect for this subgroup only.',
  'monotonicity': 'No defiers: the instrument moves everyone’s treatment in the same direction. Needed for the IV estimand to be the LATE.',
  'difference-in-differences': 'DiD: compares the before→after change in a treated group to the change in a control group, differencing out fixed gaps and common trends.',
  'parallel trends': 'The key DiD assumption: absent treatment, treated and control groups would have changed by the same amount. Untestable for the post period.',
  'regression discontinuity': 'RDD: when treatment switches at a cutoff of a running variable, units just above vs just below the cutoff are as-good-as-randomized.',
  'running variable': 'The continuous variable whose cutoff assigns treatment in an RDD (e.g. a test score, an income threshold).',
  'synthetic control': 'Builds a counterfactual for one treated unit as a weighted average of untreated “donor” units that match its pre-treatment path.',
  'donor pool': 'The set of untreated units a synthetic control is built from. Weights are chosen so the weighted donors track the treated unit pre-treatment.',
  'CATE': 'Conditional Average Treatment Effect: τ(x) = E[Y(1)−Y(0) | X=x]. The effect as a function of covariates — heterogeneity.',
  'double machine learning': 'Uses ML to flexibly model the outcome and the propensity, then orthogonalizes so the treatment-effect estimate is robust to ML errors.',
  'causal forest': 'A random-forest variant that estimates CATE — splitting to maximize treatment-effect heterogeneity rather than outcome prediction.',
  'mediation analysis': 'Decomposes a total effect into a direct effect and an indirect effect that flows through a mediator.',
  'E-value': 'The minimum strength of association an unmeasured confounder would need (with both treatment and outcome) to fully explain away an observed effect.',
  'sensitivity analysis': 'Asks how much a violated assumption (usually unconfoundedness) would have to bite before the conclusion flips.',
  'selection bias': 'Bias from comparing groups that differ systematically before treatment — the reason the naive NSW comparison is negative.',
  'omitted variable bias': 'Bias in a regression coefficient from leaving out a confounder that belongs in the model.',
  'post-treatment bias': 'Bias from controlling for a variable affected BY the treatment (a mediator or collider) — it removes or distorts the effect.',
  'natural experiment': 'A real-world situation where treatment is assigned by something as-good-as-random (a lottery, a cutoff, a policy border).',
  'randomized controlled trial': 'RCT: treatment assigned by a coin flip. Randomization makes treated and control groups comparable on everything, measured or not.',
  'NSW': 'National Supported Work: a 1970s US program giving subsidized work experience to severely disadvantaged workers. The LaLonde study used it.',
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

// --- Seeded RNG + Gaussian sampler ------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
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

/* ============================================================================
   THE LaLonde / NSW DATASET  (synthetic, seeded)
   Three groups:
     - nswTreated : disadvantaged workers who received training (D=1)
     - nswControl : disadvantaged workers randomized OUT of training (D=0)
     - cps        : a general-population comparison group, never treated (D=0)
   Earnings are in $1000s of 1978 dollars.
   The experiment compares nswTreated vs nswControl  -> recovers the true ATT.
   Observational analysis compares nswTreated vs cps  -> naive estimate is
   strongly NEGATIVE because the CPS group was never disadvantaged.
   ========================================================================== */

const COVARS = [
  { key: 'age',      label: 'Age',           unit: 'yrs' },
  { key: 'educ',     label: 'Education',     unit: 'yrs' },
  { key: 're74',     label: 'Earnings ’74', unit: '$k' },
  { key: 're75',     label: 'Earnings ’75', unit: '$k' },
  { key: 'black',    label: 'Black',         unit: '0/1' },
  { key: 'hisp',     label: 'Hispanic',      unit: '0/1' },
  { key: 'married',  label: 'Married',       unit: '0/1' },
  { key: 'nodegree', label: 'No HS degree',  unit: '0/1' },
];

// the disadvantage index — the single confounder. It drives BOTH who enrols
// AND what they would earn untreated, so unconfoundedness genuinely holds and
// every adjustment estimator has a real target to recover.
const dIndex = (u) =>
  -0.030 * u.re74 - 0.034 * u.re75 - 0.10 * (u.educ - 11)
  + 0.55 * u.black + 0.30 * u.hisp - 0.50 * u.married - 0.020 * (u.age - 27);

function buildNSW() {
  const rand = mulberry32(0x0CA05A1);
  const rn = (m, s) => m + s * boxMuller(rand);
  const rb = (p) => (rand() < p ? 1 : 0);

  // baseline 1978 earnings WITHOUT treatment ($1000s) — monotone in disadvantage
  const baseline = (u) => 6.8 - 5.87 * dIndex(u);

  const mkDisadv = () => {
    const educ = Math.round(clamp(rn(10.3, 1.9), 4, 16));
    return {
      age: Math.round(clamp(rn(25.0, 7.0), 17, 55)),
      educ,
      black: rb(0.80),
      hisp: rb(0.11),
      married: rb(0.17),
      nodegree: educ < 12 ? 1 : 0,
      re74: Math.max(0, rn(0.9, 3.1)),
      re75: Math.max(0, rn(1.0, 3.0)),
      pop: 'nsw',
    };
  };
  const mkCPS = () => {
    const educ = Math.round(clamp(rn(12.1, 2.8), 4, 18));
    return {
      age: Math.round(clamp(rn(33.0, 11.0), 17, 55)),
      educ,
      black: rb(0.24),
      hisp: rb(0.05),
      married: rb(0.55),
      nodegree: educ < 12 ? 1 : 0,
      re74: Math.max(0, rn(14.0, 9.5)),
      re75: Math.max(0, rn(13.5, 9.3)),
      pop: 'cps',
    };
  };

  let serial = 0;
  const finalize = (u, treated) => {
    const y0 = Math.max(0, baseline(u) + rn(0, 1.8));
    // heterogeneous effect: larger for low prior earnings (used by the CATE card)
    const tau = clamp(1.8 + 0.10 * (1.5 - Math.min(9, u.re75)) + rn(0, 0.55), -1.0, 6.0);
    const y1 = Math.max(0, y0 + tau);
    return { id: serial++, ...u, y0, y1, tau, d: treated ? 1 : 0, y: treated ? y1 : y0 };
  };

  const nswTreated = Array.from({ length: 185 }, () => finalize(mkDisadv(), true));
  const nswControl = Array.from({ length: 240 }, () => finalize(mkDisadv(), false));
  const cps        = Array.from({ length: 2500 }, () => finalize(mkCPS(), false));

  const obs = [...nswTreated, ...cps];           // observational sample
  const exp = [...nswTreated, ...nswControl];    // experimental sample

  const truthATT  = mean(nswTreated, (u) => u.tau);
  const expEst    = mean(nswTreated, (u) => u.y) - mean(nswControl, (u) => u.y);
  const naiveObs  = mean(nswTreated, (u) => u.y) - mean(cps, (u) => u.y);

  return { nswTreated, nswControl, cps, obs, exp, truthATT, expEst, naiveObs };
}

const NSW = buildNSW();

/* ============================================================================
   HERO + SECTION NAV
   ========================================================================== */

const CausalField = () => {
  const nodes = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 22 }, () => ({
      x: 40 + rand() * 720, y: 30 + rand() * 340, r: 2 + rand() * 3, d: 3 + rand() * 5,
    }));
  }, []);
  const edges = useMemo(() => {
    const out = [];
    for (let i = 0; i < nodes.length - 1; i += 2) out.push([nodes[i], nodes[i + 1]]);
    return out;
  }, [nodes]);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-[0.28]" preserveAspectRatio="none" viewBox="0 0 800 400">
      {edges.map(([a, b], i) => (
        <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={i % 2 ? '#6ee7b7' : '#c4b5fd'} strokeWidth="1" strokeOpacity="0.5" />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={`n${i}`} cx={n.x} cy={n.y} r={n.r}
          fill={i % 3 === 0 ? '#fb7185' : i % 3 === 1 ? '#7dd3fc' : '#c4b5fd'}
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: n.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-emerald-500/5 to-transparent" />
    <CausalField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <GitFork className="w-3.5 h-3.5" /> causal inference · correlation to counterfactual
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-emerald-200 bg-clip-text text-transparent">
          Causal Inference
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">Two frameworks, a toolkit of estimators, and one job-training puzzle to score them all.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          In 1976 the <span className="text-violet-300">National Supported Work</span> program gave
          subsidized jobs to severely disadvantaged workers. Did it raise their earnings? Compare
          trainees to the general workforce and training looks{' '}
          <span className="text-rose-300">harmful</span>. The randomized experiment says it added{' '}
          <span className="text-emerald-300">about $1,800 a year</span>. This explainer is the bridge
          between those two numbers.
        </p>
        <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
          <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-rose-300">naive comparison</div>
            <div className="text-2xl font-mono text-rose-200">{fmtKk(NSW.naiveObs)}<span className="text-sm text-rose-300/70">/yr</span></div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-600" />
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">experimental truth</div>
            <div className="text-2xl font-mono text-emerald-200">+{fmtKk(NSW.truthATT)}<span className="text-sm text-emerald-300/70">/yr</span></div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-violet-300">potential outcomes · DAGs</span>
          <span className="text-emerald-300">RCT · matching · IPW</span>
          <span className="text-amber-300">IV · diff-in-diff · RDD</span>
          <span className="text-cyan-300">synthetic control · double ML</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'ladder',      label: 'Ladder of causation',     icon: Layers3,        anchor: true },
  { id: 'potential',   label: 'Potential outcomes',      icon: GitFork },
  { id: 'confounding', label: 'Confounding & DAGs',      icon: Network },
  { id: 'dooperator',  label: 'The do-operator',         icon: Wand2 },
  { id: 'backdoor',    label: 'Back-door & colliders',   icon: Workflow },
  { id: 'rct',         label: 'Randomization (RCT)',     icon: Shuffle },
  { id: 'selection',   label: 'Selection bias',          icon: Filter },
  { id: 'matching',    label: 'Matching & propensity',   icon: Scale },
  { id: 'regression',  label: 'Regression & bad controls', icon: FunctionSquare },
  { id: 'ipw',         label: 'Inverse propensity wt.',  icon: Gauge },
  { id: 'iv',          label: 'Instrumental variables',  icon: Crosshair },
  { id: 'did',         label: 'Difference-in-differences', icon: TrendingUp },
  { id: 'rdd',         label: 'Regression discontinuity', icon: LineChart },
  { id: 'synth',       label: 'Synthetic control',       icon: Boxes },
  { id: 'doubleml',    label: 'Double ML & forests',     icon: BrainCircuit },
  { id: 'mediation',   label: 'Mediation analysis',      icon: Split },
  { id: 'sensitivity', label: 'Sensitivity analysis',    icon: ShieldAlert },
  { id: 'anchor',      label: 'Anchor: LaLonde scorecard', icon: Target,       anchor: true },
  { id: 'trails',      label: 'Next trails',             icon: Compass },
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
   STUB CARDS — placeholders; each is replaced with real content in stages C-L.
   The default export references these names directly, so they always resolve.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ---- 01 · Ladder of causation (spine) ---- */

const RUNG_COLORS = {
  emerald: { text: 'text-emerald-300', border: 'border-emerald-400/40', bg: 'bg-emerald-500/10' },
  violet:  { text: 'text-violet-300',  border: 'border-violet-400/40',  bg: 'bg-violet-500/10' },
  sky:     { text: 'text-sky-300',     border: 'border-sky-400/40',     bg: 'bg-sky-500/10' },
};

const LADDER = [
  {
    rung: 3, key: 'r3', label: 'Counterfactuals', verb: 'Imagining', color: 'emerald',
    q: 'What would these trainees have earned had they NOT trained?',
    tex: "P(\\ca{Y_x} \\mid X{=}x',\\, Y{=}y')",
    tools: 'Structural causal models · what-if reasoning · attribution & regret',
    nsw: 'The quantity we ultimately want — the ATT — is a rung-3 contrast: each trainee’s real earnings against a world that never happened.',
    cards: [{ id: 'potential', label: 'Potential outcomes' }, { id: 'mediation', label: 'Mediation' }, { id: 'anchor', label: 'Anchor' }],
  },
  {
    rung: 2, key: 'r2', label: 'Intervention', verb: 'Doing', color: 'violet',
    q: 'If we assigned training at random, what would earnings be?',
    tex: 'P(\\va{Y} \\mid \\tr{do(X{=}x)})',
    tools: 'Randomized trials · the do-operator · back-door adjustment · the estimator toolkit',
    nsw: 'The randomized NSW experiment lives here: it sets training by a coin flip, so its answer is genuinely causal.',
    cards: [{ id: 'dooperator', label: 'do-operator' }, { id: 'rct', label: 'Randomization' }, { id: 'backdoor', label: 'Back-door' }],
  },
  {
    rung: 1, key: 'r1', label: 'Association', verb: 'Seeing', color: 'sky',
    q: 'Do trainees earn more or less than non-trainees?',
    tex: 'P(\\va{Y} \\mid \\va{X}{=}x)',
    tools: 'Correlation · regression · prediction · most of machine learning',
    nsw: 'Pure observation. Trainees earn far LESS than the general workforce — a true correlation that is causally meaningless.',
    cards: [{ id: 'confounding', label: 'Confounding' }, { id: 'selection', label: 'Selection bias' }],
  },
];

const LadderCard = () => {
  const [active, setActive] = useState('r2');
  return (
    <Card id="ladder" icon={Layers3} title="The ladder of causation" accent="violet" index={1} anchor
      source="Pearl · The Book of Why (2018)"
      subtitle="Three rungs — seeing, doing, imagining. Each asks a strictly harder question than the rung below, and no amount of rung-1 data can answer a rung-2 question.">
      <MinSchema>
        Causal questions sit on three rungs: <b className="text-sky-300">association</b>{' '}
        <Eq>{'P(Y\\mid X)'}</Eq>, <b className="text-violet-300">intervention</b>{' '}
        <Eq>{'P(Y\\mid \\tr{do(X)})'}</Eq>, and <b className="text-emerald-300">counterfactuals</b>{' '}
        <Eq>{"P(Y_x\\mid X',Y')"}</Eq>. Climbing a rung needs an assumption — never just more data.
      </MinSchema>

      <p>
        Every method in this explainer is a way to climb. A predictive model that flags which
        workers will be poor is rung 1: it <Term>sees</Term>. Asking what a training program{' '}
        <em>does</em> to earnings is rung 2: it requires <Term def={GLOSS['intervention']}>doing</Term>.
        And asking what a specific trainee would have earned in the life they didn&apos;t live is
        rung 3 — a <Term>counterfactual</Term>. Click a rung to see its query, its tools, and the
        cards in this explainer that live there.
      </p>

      <div className="mt-4 space-y-2">
        {LADDER.map((L) => {
          const c = RUNG_COLORS[L.color];
          const on = active === L.key;
          return (
            <div key={L.key} style={{ marginLeft: `${(L.rung - 1) * 18}px` }}>
              <button onClick={() => setActive(L.key)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 flex items-center gap-3 transition-colors ${on ? `${c.border} ${c.bg}` : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center border ${on ? `${c.bg} ${c.border}` : 'bg-white/5 border-white/10'}`}>
                  <span className={`font-mono text-sm ${on ? c.text : 'text-neutral-500'}`}>{L.rung}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${on ? c.text : 'text-neutral-200'}`}>{L.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{L.verb}</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">{L.q}</div>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${on ? `rotate-180 ${c.text}` : '-rotate-90 text-neutral-600'}`} />
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="mt-1.5 ml-12 rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-500">query</span>
                        <Eq>{L.tex}</Eq>
                      </div>
                      <div className="text-xs text-neutral-300"><span className="text-neutral-500">tools — </span>{L.tools}</div>
                      <div className={`text-xs ${c.text}`}>{L.nsw}</div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-500 mr-1">cards here</span>
                        {L.cards.map((cd) => <CrossLink key={cd.id} to={cd.id}>{cd.label}</CrossLink>)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Predict question="Trainees in the raw data earn far less than the general workforce. Which rung is that fact on — and does it show training is harmful?">
        Rung 1, association. It is a <em>true</em> correlation and causally empty: the people who
        enrolled in NSW were severely disadvantaged long before the program. The negative gap
        reflects <strong className="text-rose-200">who enrolled</strong>, not what training did.
        &ldquo;Is it harmful?&rdquo; is a rung-2 question — and answering it is the whole job ahead.
      </Predict>

      <Block>{"\\begin{aligned} \\textbf{rung 1} \\;&:\\; P(\\va{Y}\\mid \\va{X}) &&\\text{seeing — what the data shows} \\\\ \\textbf{rung 2} \\;&:\\; P(\\va{Y}\\mid \\tr{do(X)}) &&\\text{doing — what an intervention causes} \\\\ \\textbf{rung 3} \\;&:\\; P(\\ca{Y_x}\\mid X{=}x',Y{=}y') &&\\text{imagining — what would have been} \\end{aligned}"}</Block>

      <Misconception
        wrong="With a big enough dataset and a flexible enough model, you can learn cause from correlation."
        right="No rung-1 distribution identifies a rung-2 quantity. You need an assumption — randomization, an instrument, a credible DAG — that data alone cannot supply."
        because="Many different causal models produce the exact same observational distribution while disagreeing completely about do(X). Data pins down rung 1; only an assumption picks the rung-2 answer."
      />

      <QA items={[
        { q: 'A churn model hits 0.95 AUC using "number of support tickets" as a feature. Can you cut churn by suppressing support tickets?',
          a: 'No. "Tickets correlate with churn" is a rung-1 fact. Suppressing tickets is a rung-2 intervention the model says nothing about — angry customers file tickets AND churn; the ticket is a symptom, not a cause.' },
        { q: 'Why can’t more data alone move you from rung 1 to rung 2?',
          a: 'Infinitely many causal structures generate identical observational data yet disagree about interventions. Data fixes the joint distribution; climbing the ladder requires an extra, untestable assumption.' },
        { q: 'Where does a randomized experiment sit?',
          a: 'Rung 2. Randomization is a physical intervention — it executes do(X) — which is why an RCT answers causal questions directly while observational data needs heavy assumptions to get there.' },
      ]} />

      <Deeper>
        <p>
          The hierarchy is <em>strict</em>: interventional facts are underdetermined by
          observational ones, and counterfactual facts are underdetermined by interventional ones.
          A <Term>structural causal model</Term> — a set of equations <Eq>{'Y := f(\\text{pa}(Y), U)'}</Eq>{' '}
          plus a graph — is the one object that generates all three rungs at once, which is why
          Pearl&apos;s DAGs recur throughout this explainer.
        </p>
        <p>
          That strictness sets up the central trade-off. <strong className="text-emerald-200">Randomization</strong>{' '}
          buys a rung-2 answer with almost no assumptions, but costs money, time, and ethical
          headroom. <strong className="text-amber-200">Observational methods</strong> — matching,
          weighting, instruments, diff-in-diff, discontinuities — are cheap and use data you
          already have, but each one purchases the climb with a <em>specific untestable
          assumption</em>. The rest of this explainer is a tour of those assumptions: what each
          one buys, and what happens to the NSW estimate when it fails.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 02 · Potential outcomes ---- */

const POSAMPLE = [
  NSW.nswTreated[2], NSW.nswTreated[44], NSW.nswTreated[121],
  NSW.nswControl[8], NSW.nswControl[97], NSW.nswControl[201],
].map((u, i) => ({ ...u, pid: 'P' + (i + 1) }));

const sgn = (v) => (v >= 0 ? '+' : '') + fmtKk(v);

const PotentialCard = () => {
  const [oracle, setOracle] = useState(false);
  const att = mean(NSW.nswTreated, (u) => u.tau);
  const ate = mean(NSW.obs, (u) => u.tau);
  return (
    <Card id="potential" icon={GitFork} title="Potential outcomes" accent="sky" index={2}
      source="Neyman 1923 · Rubin 1974"
      subtitle="Every unit carries two outcomes — one if treated, one if not. You only ever see one. Causal inference is the science of the missing one.">
      <MinSchema>
        Each unit has potential outcomes <Eq>{'\\ca{Y_i(1)}'}</Eq> and <Eq>{'\\ca{Y_i(0)}'}</Eq>.
        The effect is <Eq>{'\\tau_i = Y_i(1)-Y_i(0)'}</Eq> — but you observe only{' '}
        <Eq>{'Y_i = D_i Y_i(1) + (1{-}D_i) Y_i(0)'}</Eq>. The other outcome is counterfactual.
      </MinSchema>

      <p>
        Picture every NSW applicant holding two sealed envelopes: their 1978 earnings{' '}
        <span className="text-violet-300">if they train</span> and{' '}
        <span className="text-sky-300">if they don&apos;t</span>. Assigning treatment opens exactly
        one envelope and burns the other. The <Term>fundamental problem of causal inference</Term>{' '}
        is that <strong className="text-rose-200">no unit ever reveals both</strong> — so an
        individual effect <Eq>{'\\tau_i'}</Eq> is not estimable, only averaged.
      </p>

      <Block>{'\\tau_i = \\ca{Y_i(1)} - \\ca{Y_i(0)} \\qquad\\quad Y_i^{\\,\\text{obs}} = D_i\\,\\ca{Y_i(1)} + (1-D_i)\\,\\ca{Y_i(0)}'}</Block>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">view</span>
          {[['observed', 'What you observe'], ['oracle', 'Oracle · god’s-eye']].map(([k, lbl]) => (
            <button key={k} onClick={() => setOracle(k === 'oracle')}
              className={`text-[11px] rounded border px-2 py-1 transition-colors ${(oracle ? 'oracle' : 'observed') === k ? 'border-sky-400/40 bg-sky-500/10 text-sky-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
              {lbl}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-neutral-500">
                <th className="px-2 py-1.5 text-left font-medium">unit</th>
                <th className="px-2 py-1.5 text-left font-medium">profile</th>
                <th className="px-2 py-1.5 text-center font-medium">Y(0) · untrained</th>
                <th className="px-2 py-1.5 text-center font-medium">Y(1) · trained</th>
                <th className="px-2 py-1.5 text-center font-medium">τᵢ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {POSAMPLE.map((u) => {
                const treated = u.d === 1;
                const show0 = treated ? oracle : true;
                const show1 = treated ? true : oracle;
                return (
                  <tr key={u.pid} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-1.5 font-mono text-neutral-300">{u.pid}</td>
                    <td className="px-2 py-1.5">
                      <span className={`mr-1.5 ${treated ? 'text-violet-300' : 'text-neutral-400'}`}>{treated ? 'trained' : 'control'}</span>
                      <span className="text-neutral-500">{u.age}y · ed {u.educ} · &apos;75 {fmtKk(u.re75)}</span>
                    </td>
                    <td className={`px-2 py-1.5 text-center font-mono ${!treated ? 'text-emerald-200' : show0 ? 'text-rose-300/80' : 'text-neutral-700'}`}>
                      {show0 ? fmtKk(u.y0) : '?'}
                    </td>
                    <td className={`px-2 py-1.5 text-center font-mono ${treated ? 'text-emerald-200' : show1 ? 'text-rose-300/80' : 'text-neutral-700'}`}>
                      {show1 ? fmtKk(u.y1) : '?'}
                    </td>
                    <td className={`px-2 py-1.5 text-center font-mono ${oracle ? 'text-sky-200' : 'text-neutral-700'}`}>
                      {oracle ? sgn(u.tau) : '?'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-1.5 text-[11px] text-neutral-500 leading-snug">
          <span className="text-emerald-300">green</span> = the outcome actually observed ·{' '}
          <span className="text-rose-300/80">rose</span> = the counterfactual, revealed only in the
          oracle view · <Eq>{'\\tau_i'}</Eq> needs both cells, so reality never shows it.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label="ATT · the treated" value={sgn(att)} color="text-emerald-300" sub="effect on the 185 trainees" />
        <Stat label="ATE · everyone" value={sgn(ate)} color="text-sky-300" sub="effect averaged over all units" />
        <Stat label="τᵢ ever observed" value="0%" color="text-rose-300" sub="individual effects, in principle" />
      </div>

      <Predict question="P1 is a trainee who shows real 1978 earnings on the table. How much of that did the program cause for P1 specifically?">
        Unknowable for P1 alone — we never see P1&apos;s untrained earnings. Causal inference only
        delivers <em>averages</em>: across all 185 trainees the program added about{' '}
        <strong className="text-emerald-200">{sgn(att)}</strong> each. Flip to the oracle view and
        the counterfactual appears — but that column is a simulation privilege, not something any
        real study can read.
      </Predict>

      <Misconception
        wrong="With enough data and a good model, you can estimate the treatment effect for each individual."
        right="The individual effect τᵢ is never identified — each unit reveals only one of its two potential outcomes. Even infinite data gives you averages (ATE, ATT, CATE), not τᵢ."
        because="It is a missing-data problem by construction: Dᵢ selects which envelope opens. CATE narrows the average to a covariate cell, but within that cell it is still an average."
      />

      <Block>{'\\text{ATE}=\\mathbb{E}[\\tau_i] \\qquad \\text{ATT}=\\mathbb{E}[\\tau_i\\mid D_i{=}1] \\qquad \\text{ATC}=\\mathbb{E}[\\tau_i\\mid D_i{=}0]'}</Block>

      <QA items={[
        { q: 'Why is the ATT the right target for the NSW study?',
          a: 'Policy cares about the people who actually enrol. The ATT — the effect on the treated — answers "did the program help its participants?" The ATE would average in the general workforce, who would respond differently.' },
        { q: `Here the ATT (${sgn(att)}) is larger than the ATE (${sgn(ate)}). Why?`,
          a: 'The effect is heterogeneous — larger for workers with low prior earnings. Trainees were drawn from exactly that low-earning group, so the average over the treated exceeds the average over everyone.' },
        { q: 'If τᵢ is never observed, what is randomization actually doing?',
          a: 'It does not recover τᵢ. It makes the treated and control groups exchangeable, so the observed mean of Y among controls is a valid stand-in for the unobserved mean of Y(0) among the treated.' },
      ]} />

      <Deeper>
        <p>
          Two assumptions make the notation meaningful. <Term>SUTVA</Term> requires no
          interference — one worker&apos;s training does not change another&apos;s earnings — and a
          single version of treatment. <em>Consistency</em> ties the math to reality:{' '}
          <Eq>{'Y_i^{\\text{obs}} = Y_i(D_i)'}</Eq>, the observed outcome equals the potential
          outcome for the treatment actually received. Both can fail — a large jobs program could
          shift the local labor market and break SUTVA — and when they do, the estimand itself,
          not just the estimate, is in question.
        </p>
        <p>
          Seeing causal inference as <strong className="text-sky-200">missing data</strong> is the
          single most useful reframe here. Half of the <Eq>{'\\{Y(0),Y(1)\\}'}</Eq> grid is
          missing by design, and <Eq>{'D_i'}</Eq> decides which half. Every method ahead is a
          different model for that missingness: an RCT makes it <em>missing completely at
          random</em>; matching and weighting assume it is <em>missing at random given X</em>;
          instruments and discontinuities exploit a sliver of as-good-as-random variation. Get the
          missingness model wrong and the estimate is wrong — which is exactly the NSW trap the{' '}
          <CrossLink to="selection" recap="The naive observational comparison is negative because the comparison group was never disadvantaged.">selection-bias card</CrossLink>{' '}
          makes concrete.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- shared causal-graph primitive ---- */

const DAG_TONES = {
  violet: '#c4b5fd', sky: '#7dd3fc', rose: '#fb7185', emerald: '#6ee7b7',
  amber: '#fbbf24', grey: '#6b7280', cyan: '#67e8f9',
};

const CausalDAG = ({ nodes, edges, width = 460, height = 215 }) => {
  const uid = React.useId().replace(/:/g, '');
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height + 10 }}>
      <defs>
        {Object.entries(DAG_TONES).map(([k, col]) => (
          <marker key={k} id={`${uid}-ah-${k}`} markerWidth="9" markerHeight="9" refX="7.5" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={col} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) return null;
        const tone = e.tone || 'grey';
        const col = DAG_TONES[tone];
        const r = 23;
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const x1 = a.x + ux * r, y1 = a.y + uy * r;
        const x2 = b.x - ux * r, y2 = b.y - uy * r;
        const cv = e.curve || 0;
        const mx = (x1 + x2) / 2 + -uy * cv;
        const my = (y1 + y2) / 2 + ux * cv;
        const common = {
          stroke: col, strokeWidth: e.w || 2,
          strokeDasharray: e.dashed ? '5 4' : undefined,
          markerEnd: `url(#${uid}-ah-${tone})`,
          opacity: e.dim ? 0.4 : 1,
        };
        return (
          <g key={i}>
            {cv
              ? <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" {...common} />
              : <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} />}
            {e.label && (
              <text x={cv ? mx : (x1 + x2) / 2} y={(cv ? my : (y1 + y2) / 2) - 5}
                textAnchor="middle" fontSize="9" fill={col} stroke="#0a0a0a" strokeWidth="3"
                paintOrder="stroke" opacity={e.dim ? 0.5 : 1}>{e.label}</text>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const col = DAG_TONES[n.tone] || DAG_TONES.grey;
        return (
          <g key={n.id} opacity={n.dim ? 0.45 : 1}>
            {n.ring && <circle cx={n.x} cy={n.y} r={30} fill="none" stroke={col} strokeWidth="1.4" strokeDasharray="3 3" />}
            <circle cx={n.x} cy={n.y} r={23} fill="#0c0c0e" stroke={col} strokeWidth={n.bold ? 3 : 1.8} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
              fontSize="15" fontFamily="ui-monospace, monospace" fill={col}>{n.label}</text>
            {n.sub && (
              <text x={n.x} y={n.y + 37} textAnchor="middle" fontSize="9.5" fill="#9ca3af">{n.sub}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ---- 03 · Confounding & causal graphs ---- */

const CONFOUNDERS = [
  { id: 'pe', label: 'X₁', name: 'Prior earnings', sub: 'earnings ’74–’75', frac: 0.74,
    why: 'The people who enrolled earned almost nothing beforehand — and past earnings are the strongest predictor of future earnings.' },
  { id: 'ed', label: 'X₂', name: 'Education', sub: 'years of schooling', frac: 0.14,
    why: 'Trainees had less schooling, and schooling raises earnings on its own — independent of the program.' },
  { id: 'dm', label: 'X₃', name: 'Demographics', sub: 'age · race · marriage', frac: 0.12,
    why: 'Trainees were younger, more often unmarried, more often from disadvantaged groups — each shifts baseline earnings.' },
];

const ConfoundingCard = () => {
  const truth = NSW.truthATT;
  const totalBias = NSW.naiveObs - truth; // strongly negative
  const [ctrl, setCtrl] = useState({ pe: false, ed: false, dm: false });
  const openBias = CONFOUNDERS.reduce((s, c) => s + (ctrl[c.id] ? 0 : c.frac * totalBias), 0);
  const observed = truth + openBias;
  const allOpen = CONFOUNDERS.every((c) => !ctrl[c.id]);
  const allCtrl = CONFOUNDERS.every((c) => ctrl[c.id]);

  const nodes = [
    { id: 'D', x: 95, y: 158, label: 'D', sub: 'trained', tone: 'violet', bold: true },
    { id: 'Y', x: 375, y: 158, label: 'Y', sub: 'earnings ’78', tone: 'sky', bold: true },
    { id: 'pe', x: 140, y: 50, label: 'X₁', sub: 'prior earnings', tone: ctrl.pe ? 'grey' : 'rose' },
    { id: 'ed', x: 235, y: 38, label: 'X₂', sub: 'education', tone: ctrl.ed ? 'grey' : 'rose' },
    { id: 'dm', x: 330, y: 50, label: 'X₃', sub: 'demographics', tone: ctrl.dm ? 'grey' : 'rose' },
  ];
  const cEdge = (id, to) => ({
    from: id, to, tone: ctrl[id] ? 'grey' : 'rose', dashed: ctrl[id], dim: ctrl[id], w: 1.9,
  });
  const edges = [
    { from: 'D', to: 'Y', tone: 'emerald', w: 2.8, label: 'causal effect' },
    cEdge('pe', 'D'), cEdge('pe', 'Y'),
    cEdge('ed', 'D'), cEdge('ed', 'Y'),
    cEdge('dm', 'D'), cEdge('dm', 'Y'),
  ];

  return (
    <Card id="confounding" icon={Network} title="Confounding & causal graphs" accent="rose" index={3}
      source="Pearl 1995 · directed acyclic graphs"
      subtitle="A confounder causes both the treatment and the outcome. It opens a back-door path — a non-causal route from D to Y that fakes association the intervention never produced.">
      <MinSchema>
        A <Term>confounder</Term> <Eq>{'\\bi{X}'}</Eq> with arrows <Eq>{'X\\to D'}</Eq> and{' '}
        <Eq>{'X\\to Y'}</Eq> opens a <Term>back-door path</Term> <Eq>{'D\\leftarrow X\\to Y'}</Eq>.
        Until every back-door is blocked, the observed <Eq>{'D'}</Eq>–<Eq>{'Y'}</Eq> association
        mixes the real effect with bias.
      </MinSchema>

      <p>
        A <Term>DAG</Term> draws your causal assumptions as arrows. The one edge you care about is{' '}
        <Eq>{'\\ca{D\\to Y}'}</Eq> — training&apos;s real effect on earnings. Every other route from{' '}
        <Eq>{'D'}</Eq> to <Eq>{'Y'}</Eq> is a back-door that leaks spurious association. Toggle a
        confounder below to <em>control</em> for it — that blocks its path — and watch the observed
        estimate crawl back toward the truth.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <CausalDAG nodes={nodes} edges={edges} />
        <div className="mt-1 text-[11px] text-neutral-500 text-center">
          <span className="text-emerald-300">emerald</span> = the causal effect ·{' '}
          <span className="text-rose-300">rose</span> = an open back-door ·{' '}
          <span className="text-neutral-400">grey dashed</span> = a path you have blocked by controlling
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 self-center mr-1">presets</span>
        <button onClick={() => setCtrl({ pe: false, ed: false, dm: false })}
          className={`text-[11px] rounded border px-2 py-1 ${allOpen ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
          open all back-doors
        </button>
        <button onClick={() => setCtrl({ pe: true, ed: true, dm: true })}
          className={`text-[11px] rounded border px-2 py-1 ${allCtrl ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
          control everything
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
        {CONFOUNDERS.map((c) => {
          const on = ctrl[c.id];
          return (
            <div key={c.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-mono text-neutral-400 mr-1.5">{c.label}</span>
                  <span className="text-neutral-100">{c.name}</span>
                </div>
                <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{c.why}</div>
              </div>
              <button onClick={() => setCtrl((s) => ({ ...s, [c.id]: !s[c.id] }))}
                className={`shrink-0 self-center text-[11px] rounded border px-2 py-1 flex items-center gap-1 ${on ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/40 bg-rose-500/10 text-rose-200'}`}>
                {on ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {on ? 'controlled' : 'back-door open'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="true effect · ATT" value={sgn(truth)} color="text-emerald-300" sub="what training really did" />
        <Stat label="bias · open back-doors" value={sgn(openBias)} color="text-rose-300" sub="leaked by confounders" />
        <Stat label="observed estimate" value={sgn(observed)}
          color={Math.abs(observed - truth) < 0.4 ? 'text-emerald-300' : 'text-rose-300'}
          sub={Math.abs(observed - truth) < 0.4 ? 'matches the truth' : 'confounded — do not trust'} />
      </div>

      <Predict question="With all three back-doors open, the observed estimate sits far from +$1,800. Above or below the truth — and roughly where?">
        Far <strong className="text-rose-200">below</strong> — around {sgn(NSW.naiveObs)}. Prior
        earnings dominates: trainees earned almost nothing before NSW, so even with a real{' '}
        {sgn(truth)} boost they still trail a comparison group that was never disadvantaged. The
        confounder, not the program, drives the headline.
      </Predict>

      <Block>{'\\underbrace{\\mathbb{E}[Y|D{=}1]-\\mathbb{E}[Y|D{=}0]}_{\\text{naive contrast}} = \\underbrace{\\ca{\\text{ATT}}}_{\\text{causal effect}} + \\underbrace{\\bi{\\mathbb{E}[Y(0)|D{=}1]-\\mathbb{E}[Y(0)|D{=}0]}}_{\\text{selection bias}}'}</Block>

      <Misconception
        wrong="To be safe, control for every variable you have — more controls always means less bias."
        right="Control for confounders, but NOT for colliders or mediators. Conditioning on the wrong variable opens a path that was closed and adds bias."
        because="The back-door criterion tells you which variables to adjust for. ‘Throw everything in’ can condition on a collider and manufacture a spurious effect — the next two cards show exactly how."
      />

      <QA items={[
        { q: 'A back-door path D ← X → Y has an arrow pointing INTO D. Why does that matter?',
          a: 'Any path into D is non-causal — it cannot carry training’s effect. It still transmits association, so leaving it open contaminates the D–Y relationship with the confounder’s signal.' },
        { q: 'You control for prior earnings but it barely moves the estimate. What might be wrong?',
          a: 'Either prior earnings was measured with error (a noisy proxy under-adjusts), or another confounder is still open. Adjustment only removes bias from the back-doors you actually block, with the variables you actually measured.' },
        { q: 'Why is unmeasured confounding the permanent worry?',
          a: 'You can only block a back-door through a variable you observed. A confounder you did not measure — motivation, health, family support — keeps its path open no matter how many controls you add.' },
      ]} />

      <Deeper>
        <p>
          The selection-bias term is the engine of <Term>omitted variable bias</Term>: its size is
          how different the treated and control groups would have been <em>without any
          treatment</em>. In NSW that difference is enormous and negative — the comparison group
          out-earned trainees by roughly {fmtKk(Math.abs(NSW.naiveObs) + truth)} in the
          counterfactual no-program world — which is why the naive number is not just biased but
          flips sign. A confounder strong enough can make a helpful program look harmful.
        </p>
        <p>
          DAGs are valuable precisely because they force the bias to be <em>visible</em>. Adjustment
          — matching, weighting, regression — can close every back-door you have drawn, but the
          graph is an assumption, not a measurement. Its honesty is in what it admits you have not
          measured. That residual is what randomization sidesteps entirely and what the{' '}
          <CrossLink to="sensitivity" recap="Sensitivity analysis asks how strong an unmeasured confounder would need to be to overturn the result.">sensitivity card</CrossLink>{' '}
          tries to bound.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 04 · The do-operator ---- */

const DoOperatorCard = () => {
  const [mode, setMode] = useState('observe');
  const isDo = mode === 'do';
  const truth = NSW.truthATT;

  // P(prior-earnings tier): marginal vs conditional-on-trained
  const tierOf = (re75) => (re75 < 1 ? 0 : re75 < 8 ? 1 : 2);
  const dist = useMemo(() => {
    const pc = [0, 0, 0], px = [0, 0, 0];
    NSW.obs.forEach((u) => { pc[tierOf(u.re75)]++; });
    NSW.nswTreated.forEach((u) => { px[tierOf(u.re75)]++; });
    const norm = (a) => { const s = a.reduce((x, y) => x + y, 0) || 1; return a.map((x) => x / s); };
    return { marg: norm(pc), cond: norm(px) };
  }, []);
  const TIERS = [
    { lab: '≈ $0', color: 'bg-rose-400/70' },
    { lab: '$1–8k', color: 'bg-amber-400/70' },
    { lab: '$8k +', color: 'bg-emerald-400/70' },
  ];

  const nodes = [
    { id: 'C', x: 235, y: 48, label: 'C', sub: 'prior earnings', tone: 'rose' },
    { id: 'X', x: 110, y: 158, label: 'X', sub: isDo ? 'set by do(X)' : 'trained · self-selected', tone: 'violet', bold: true },
    { id: 'Y', x: 365, y: 158, label: 'Y', sub: 'earnings ’78', tone: 'sky', bold: true },
  ];
  const edges = [
    { from: 'X', to: 'Y', tone: 'emerald', w: 2.8, label: 'causal effect' },
    { from: 'C', to: 'Y', tone: 'rose', w: 1.9 },
    { from: 'C', to: 'X', tone: isDo ? 'grey' : 'rose', w: 1.9, dashed: isDo, dim: isDo,
      label: isDo ? '✂ cut by do(X)' : '' },
  ];

  return (
    <Card id="dooperator" icon={Wand2} title="The do-operator" accent="violet" index={4}
      source="Pearl · graph surgery"
      subtitle="Observing X and setting X are different acts. do(X) wipes out every arrow into X — so P(Y | do(X)) keeps the population’s natural mix while P(Y | X) inherits the confounded one.">
      <MinSchema>
        Conditioning asks <Eq>{'P(Y\\mid \\va{X})'}</Eq> — &ldquo;among those who happen to have{' '}
        <Eq>{'X'}</Eq>.&rdquo; Intervening asks <Eq>{'P(Y\\mid \\tr{do(X)})'}</Eq> — &ldquo;if we{' '}
        <em>set</em> <Eq>{'X'}</Eq> for everyone.&rdquo; The do-operator deletes all arrows into{' '}
        <Eq>{'X'}</Eq>; the two agree only when no back-door was open.
      </MinSchema>

      <p>
        Switch the toggle and watch the graph. In <span className="text-violet-300">observe</span>{' '}
        mode the arrow <Eq>{'C\\to X'}</Eq> is live: who trains is decided by prior earnings.
        In <span className="text-violet-300">do(X)</span> mode that arrow is{' '}
        <strong className="text-rose-200">severed</strong> — training is assigned by us, so it no
        longer depends on <Eq>{'C'}</Eq>. Same diagram, one cut edge, completely different answer.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">mode</span>
        {[['observe', 'Observe · P(Y | X)'], ['do', 'Intervene · P(Y | do X)']].map(([k, lbl]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`text-[11px] rounded border px-2.5 py-1 transition-colors ${mode === k ? 'border-violet-400/40 bg-violet-500/10 text-violet-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <CausalDAG nodes={nodes} edges={edges} height={210} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={`rounded-lg border p-3 ${!isDo ? 'border-rose-400/40 bg-rose-500/[0.07]' : 'border-white/10 bg-white/[0.02]'}`}>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">P(Y | X=1) − P(Y | X=0)</div>
          <div className="text-2xl font-mono mt-0.5 text-rose-300">{sgn(NSW.naiveObs)}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">observational — confounded by C</div>
        </div>
        <div className={`rounded-lg border p-3 ${isDo ? 'border-emerald-400/40 bg-emerald-500/[0.07]' : 'border-white/10 bg-white/[0.02]'}`}>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">P(Y | do X=1) − P(Y | do X=0)</div>
          <div className="text-2xl font-mono mt-0.5 text-emerald-300">{sgn(truth)}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">interventional — the causal effect</div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[11px] text-neutral-400 mb-2">
          Why the gap: the confounder mix differs between the two questions.
        </div>
        {[
          { lab: 'P(C) — the whole population', arr: dist.marg, tag: 'used by do(X)', tagColor: 'text-emerald-300' },
          { lab: 'P(C | X=1) — only the trained', arr: dist.cond, tag: 'used by conditioning', tagColor: 'text-rose-300' },
        ].map((row) => (
          <div key={row.lab} className="mb-2 last:mb-0">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-neutral-400">{row.lab}</span>
              <span className={row.tagColor}>{row.tag}</span>
            </div>
            <div className="flex h-5 rounded overflow-hidden border border-white/10">
              {row.arr.map((p, i) => (
                <div key={i} className={`${TIERS[i].color} flex items-center justify-center`} style={{ width: `${p * 100}%` }}>
                  {p > 0.12 && <span className="text-[9px] text-neutral-950 font-mono">{Math.round(p * 100)}%</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-3 mt-1.5 text-[10px] text-neutral-500">
          {TIERS.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-sm ${t.color}`} />prior earnings {t.lab}
            </span>
          ))}
        </div>
      </div>

      <Predict question="In observe mode the trained group looks poor. Flip to do(X) and the same X=1 yields a higher Y. Where did the extra earnings come from?">
        Nowhere new — it is a re-weighting. Conditioning on <Eq>{'X{=}1'}</Eq> selects the
        disadvantaged (their <Eq>{'P(C\\mid X)'}</Eq> is almost all the <span className="text-rose-300">≈ $0</span>{' '}
        tier). <Eq>{'do(X{=}1)'}</Eq> keeps the population&apos;s natural <Eq>{'P(C)'}</Eq> and only
        switches training on, so the average is not dragged down by who self-selects.
      </Predict>

      <Block>{'P(Y\\mid \\va{X}) = \\sum_c P(Y\\mid X,c)\\,P(\\bi{c\\mid X}) \\qquad\\quad P(Y\\mid \\tr{do(X)}) = \\sum_c P(Y\\mid X,c)\\,P(\\ca{c})'}</Block>

      <Misconception
        wrong="P(Y | do(X)) is just P(Y | X) dressed up in heavier notation — they are the same thing."
        right="They coincide only when no back-door path is open — for instance after randomization. With an open confounder they can differ enough to flip the sign, as in NSW."
        because="Conditioning re-weights covariates by P(c | X), the confounded mix among the selected. do() re-weights by the marginal P(c). Different weights, different answer."
      />

      <QA items={[
        { q: 'What does "graph surgery" mean physically?',
          a: 'do(X=x) replaces X’s structural equation with the constant X:=x. Every arrow into X is deleted because X no longer responds to its old causes — it responds only to your intervention.' },
        { q: 'Why does a randomized trial implement do(X) for free?',
          a: 'A coin flip is, literally, an external assignment with no causal parents. Randomizing treatment is a physical execution of do(X): it deletes C → X, which is why an RCT needs no adjustment.' },
        { q: 'If the back-door adjustment formula needs P(Y | X, c), why bother with do() notation?',
          a: 'do() defines the target; adjustment is one way to compute it. The notation also lets do-calculus prove when an effect is identifiable at all — including through front-doors when no valid adjustment set exists.' },
      ]} />

      <Deeper>
        <p>
          The interventional distribution comes from the <em>truncated factorization</em>: take the
          observational joint <Eq>{'P(v) = \\prod_i P(v_i\\mid \\text{pa}_i)'}</Eq>, delete the factor
          for <Eq>{'X'}</Eq>, and set <Eq>{'X{=}x'}</Eq> in the rest. That single deletion is the
          whole content of do() — and it is why an unconfounded graph gives{' '}
          <Eq>{'P(Y\\mid do(x)) = P(Y\\mid x)'}</Eq>, while a confounded one does not.
        </p>
        <p>
          do-calculus is three rewrite rules that turn an interventional expression into an
          observational one you can estimate from data — or prove that no such expression exists.
          When the <CrossLink to="backdoor" recap="The back-door criterion picks an adjustment set that blocks every spurious path; the front-door identifies effects through a mediator.">back-door</CrossLink>{' '}
          fails because a confounder is unmeasured, the front-door rule can still rescue
          identification through a fully-mediating variable. Identification first, estimation
          second — the do-operator is what makes that order precise.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 05 · Back-door, front-door & colliders ---- */

const ROLES = {
  confounder: {
    label: 'Confounder', node: 'X',
    desc: 'A common cause of treatment and outcome — prior earnings in NSW.',
    adjGood: true,
    ruleNo: 'Its back-door path is open — the estimate is confounded.',
    ruleYes: 'Adjusting blocks the back-door. This is exactly what you should do.',
  },
  mediator: {
    label: 'Mediator', node: 'M',
    desc: 'A link on the causal chain — e.g. the job skills the training builds.',
    adjGood: false,
    ruleNo: 'Leave it alone: the unadjusted contrast is the full causal effect.',
    ruleYes: 'Adjusting blocks part of the real effect — classic over-control bias.',
  },
  collider: {
    label: 'Collider', node: 'Z',
    desc: 'A shared effect of treatment and outcome — e.g. who stays in the sample.',
    adjGood: false,
    ruleNo: 'Leave it alone: a collider blocks its own path by default.',
    ruleYes: 'Adjusting OPENS a spurious path that was closed — collider bias.',
  },
};

const BackdoorCard = () => {
  const [role, setRole] = useState('confounder');
  const [adjust, setAdjust] = useState(false);
  const truth = NSW.truthATT;
  const EST = {
    confounder: { no: NSW.naiveObs, yes: truth },
    mediator: { no: truth, yes: 0.35 },
    collider: { no: truth, yes: -0.95 },
  };
  const est = EST[role][adjust ? 'yes' : 'no'];
  const good = Math.abs(est - truth) < 0.4;
  const R = ROLES[role];

  const dag = (() => {
    if (role === 'confounder') return {
      nodes: [
        { id: 'D', x: 95, y: 152, label: 'D', sub: 'trained', tone: 'violet', bold: true },
        { id: 'Y', x: 365, y: 152, label: 'Y', sub: 'earnings', tone: 'sky', bold: true },
        { id: 'X', x: 230, y: 48, label: 'X', sub: 'confounder', tone: adjust ? 'grey' : 'rose', ring: adjust },
      ],
      edges: [
        { from: 'D', to: 'Y', tone: 'emerald', w: 2.8, label: 'effect' },
        { from: 'X', to: 'D', tone: adjust ? 'grey' : 'rose', dashed: adjust, dim: adjust },
        { from: 'X', to: 'Y', tone: adjust ? 'grey' : 'rose', dashed: adjust, dim: adjust },
      ],
    };
    if (role === 'mediator') return {
      nodes: [
        { id: 'D', x: 95, y: 152, label: 'D', sub: 'trained', tone: 'violet', bold: true },
        { id: 'Y', x: 365, y: 152, label: 'Y', sub: 'earnings', tone: 'sky', bold: true },
        { id: 'M', x: 230, y: 48, label: 'M', sub: 'mediator', tone: adjust ? 'grey' : 'emerald', ring: adjust },
      ],
      edges: [
        { from: 'D', to: 'Y', tone: 'emerald', w: 2.4, label: 'direct' },
        { from: 'D', to: 'M', tone: adjust ? 'grey' : 'emerald', dashed: adjust, dim: adjust },
        { from: 'M', to: 'Y', tone: adjust ? 'grey' : 'emerald', dashed: adjust, dim: adjust },
      ],
    };
    return {
      nodes: [
        { id: 'D', x: 95, y: 62, label: 'D', sub: 'trained', tone: 'violet', bold: true },
        { id: 'Y', x: 365, y: 62, label: 'Y', sub: 'earnings', tone: 'sky', bold: true },
        { id: 'Z', x: 230, y: 168, label: 'Z', sub: 'collider', tone: adjust ? 'rose' : 'grey', ring: adjust },
      ],
      edges: [
        { from: 'D', to: 'Y', tone: 'emerald', w: 2.8, label: 'effect' },
        { from: 'D', to: 'Z', tone: 'sky', w: 1.9 },
        { from: 'Y', to: 'Z', tone: 'sky', w: 1.9 },
        ...(adjust ? [{ from: 'D', to: 'Y', tone: 'rose', w: 1.9, dashed: true, curve: 52, label: 'spurious — opened' }] : []),
      ],
    };
  })();

  return (
    <Card id="backdoor" icon={Workflow} title="Back-door, front-door & colliders" accent="emerald" index={5}
      source="Pearl · d-separation"
      subtitle="Whether to control for a variable depends entirely on its role. Confounders must be adjusted; mediators and colliders must not. Get it backwards and you add bias instead of removing it.">
      <MinSchema>
        Three path shapes. A <b className="text-rose-300">fork</b> <Eq>{'D\\leftarrow X\\to Y'}</Eq>{' '}
        and <b className="text-emerald-300">chain</b> <Eq>{'D\\to M\\to Y'}</Eq> are open until you
        condition on the middle node. A <b className="text-sky-300">collider</b>{' '}
        <Eq>{'D\\to Z\\leftarrow Y'}</Eq> is the reverse — closed until you condition on it.
      </MinSchema>

      <p>
        &ldquo;Control for more variables&rdquo; is not a strategy — it is a coin flip. The same
        action that removes bias from a <Term>confounder</Term> manufactures it from a{' '}
        <Term>collider</Term>. Pick a role for the middle variable, toggle whether you adjust for
        it, and watch the estimate move toward or away from the {sgn(truth)} truth.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 mr-1">middle variable is a</span>
        {Object.keys(ROLES).map((k) => (
          <button key={k} onClick={() => setRole(k)}
            className={`text-[11px] rounded border px-2 py-1 transition-colors ${role === k ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
            {ROLES[k].label}
          </button>
        ))}
        <button onClick={() => setAdjust((v) => !v)}
          className={`ml-2 text-[11px] rounded border px-2 py-1 flex items-center gap-1 transition-colors ${adjust ? 'border-amber-400/40 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
          {adjust ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {adjust ? 'adjusting for it' : 'not adjusting'}
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <CausalDAG nodes={dag.nodes} edges={dag.edges} />
        <div className="mt-1 text-[11px] text-neutral-500 text-center">{R.desc}</div>
      </div>

      <div className={`mt-3 rounded-lg border p-3 ${good ? 'border-emerald-400/30 bg-emerald-500/[0.06]' : 'border-rose-400/30 bg-rose-500/[0.06]'}`}>
        <div className="flex items-center gap-2">
          {good ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertTriangle className="w-4 h-4 text-rose-300" />}
          <span className={`text-sm font-semibold ${good ? 'text-emerald-200' : 'text-rose-200'}`}>
            estimate {sgn(est)}{good ? ' — matches the truth' : ' — biased'}
          </span>
        </div>
        <div className="text-xs text-neutral-300 mt-1">{adjust ? R.ruleYes : R.ruleNo}</div>
      </div>

      <div className="mt-3 space-y-1">
        {[
          { n: 'Chain', tex: 'D\\to M\\to Y', rule: 'open; conditioning on M blocks it', tone: 'text-emerald-300' },
          { n: 'Fork', tex: 'D\\leftarrow X\\to Y', rule: 'open; conditioning on X blocks it', tone: 'text-rose-300' },
          { n: 'Collider', tex: 'D\\to Z\\leftarrow Y', rule: 'blocked; conditioning on Z OPENS it', tone: 'text-sky-300' },
        ].map((r) => (
          <div key={r.n} className="flex items-center gap-3 rounded border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs">
            <span className={`font-semibold w-16 ${r.tone}`}>{r.n}</span>
            <Eq>{r.tex}</Eq>
            <span className="text-neutral-400">{r.rule}</span>
          </div>
        ))}
      </div>

      <Predict question="A collider sits below D and Y. You did nothing wrong upstream — but you ran your analysis only on workers you could still survey in 1978. What happens?">
        You conditioned on a collider (&ldquo;still in the sample&rdquo; is caused by many things,
        including D and earnings). That opens the path <Eq>{'D\\to Z\\leftarrow Y'}</Eq> and breeds a{' '}
        <strong className="text-rose-200">spurious</strong> association — here a fake negative one —
        even though training&apos;s real effect never changed. Sample selection IS conditioning.
      </Predict>

      <Block>{'\\text{back-door criterion: a set }S\\text{ identifies }P(Y\\mid \\tr{do(D)}) = \\sum_{s} P(Y\\mid D,s)\\,P(s)'}</Block>
      <p className="text-sm text-neutral-400">
        ...provided <Eq>{'S'}</Eq> blocks every back-door path from <Eq>{'D'}</Eq> to{' '}
        <Eq>{'Y'}</Eq> and contains <em>no descendant</em> of <Eq>{'D'}</Eq> — that second clause
        is what rules out mediators and colliders.
      </p>

      <Misconception
        wrong="Adding a control variable can only help — at worst it does nothing."
        right="Adjusting for a collider or a mediator actively injects bias. More controls is not safer; the right controls is safer."
        because="Conditioning on a collider opens a path that was closed; conditioning on a mediator closes a path that carried the effect. Both move the estimate away from the truth."
      />

      <QA items={[
        { q: 'Why must an adjustment set contain no descendant of D?',
          a: 'A descendant of D is downstream of treatment — it is a mediator or a collider. Conditioning on a mediator removes part of the effect; on a collider it opens a spurious path. Either way the back-door criterion fails.' },
        { q: 'Your DAG has an unmeasured confounder, so no back-door set exists. Is the effect lost?',
          a: 'Not necessarily. If a measured variable fully mediates D → Y and is itself unconfounded with Y, the front-door criterion identifies the effect without ever adjusting for the hidden confounder.' },
        { q: 'How is restricting your sample the same as "controlling for" a variable?',
          a: 'Both fix a variable to a value. If that variable is a collider, restriction induces collider bias exactly as a regression control would — selection bias and bad-control bias are the same mechanism.' },
      ]} />

      <Deeper>
        <p>
          The front-door criterion is the elegant escape hatch. Suppose an unmeasured confounder
          links <Eq>{'D'}</Eq> and <Eq>{'Y'}</Eq>, but a measured mediator <Eq>{'M'}</Eq> carries{' '}
          <em>all</em> of D&apos;s effect and is not itself confounded with <Eq>{'Y'}</Eq>. Then{' '}
          <Eq>{"P(Y\\mid do(D)) = \\sum_m P(m\\mid D)\\sum_{d'} P(Y\\mid m,d')P(d')"}</Eq> — two
          back-door-style adjustments chained through <Eq>{'M'}</Eq>. The famous illustration is
          smoking → tar → cancer with an unmeasured genetic confounder.
        </p>
        <p>
          The subtle trap is <em>M-bias</em>: a variable that is a pure collider — caused by two
          hidden factors, one tied to <Eq>{'D'}</Eq> and one to <Eq>{'Y'}</Eq> — looks like a
          harmless pre-treatment covariate, yet adjusting for it opens a path. &ldquo;It happened
          before treatment&rdquo; does not make a variable safe to control for. Only the graph
          tells you, which is why the <CrossLink to="confounding" recap="A DAG draws your causal assumptions as arrows so the bias is visible.">DAG</CrossLink>{' '}
          has to come before the regression.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 06 · Randomization (RCT) ---- */

const RCT_COVARS = [
  { k: 'age', label: 'Age', kind: 'num' },
  { k: 'educ', label: 'Education', kind: 'num' },
  { k: 're74', label: 'Earnings ’74', kind: 'cash' },
  { k: 're75', label: 'Earnings ’75', kind: 'cash' },
  { k: 'black', label: 'Black', kind: 'rate' },
  { k: 'married', label: 'Married', kind: 'rate' },
];
const fmtCov = (kind, v) => (kind === 'cash' ? fmtKk(v) : kind === 'rate' ? `${Math.round(v * 100)}%` : v.toFixed(1));

const RctCard = () => {
  const [mode, setMode] = useState('select');
  const [seed, setSeed] = useState(1);
  const isRct = mode === 'rct';

  const split = useMemo(() => {
    if (!isRct) return { t: NSW.nswTreated, c: NSW.cps, est: NSW.naiveObs };
    const rand = mulberry32((seed * 2654435761) >>> 0);
    const t = [], c = [];
    NSW.exp.forEach((u) => { (rand() < 0.435 ? t : c).push(u); });
    return { t, c, est: mean(t, (u) => u.y1) - mean(c, (u) => u.y0) };
  }, [isRct, seed]);

  const bal = RCT_COVARS.map((cv) => {
    const mt = mean(split.t, (u) => u[cv.k]);
    const mc = mean(split.c, (u) => u[cv.k]);
    const sp = Math.sqrt((sd(split.t, (u) => u[cv.k]) ** 2 + sd(split.c, (u) => u[cv.k]) ** 2) / 2) || 1;
    return { ...cv, mt, mc, std: (mt - mc) / sp };
  });
  const maxImb = Math.max(...bal.map((b) => Math.abs(b.std)));

  return (
    <Card id="rct" icon={Shuffle} title="Randomization: the gold standard" accent="emerald" index={6}
      source="Fisher 1935 · the randomized experiment"
      subtitle="A coin flip severs every back-door path at once — for confounders you measured and, crucially, for the ones you never thought of. That is the whole magic of an RCT.">
      <MinSchema>
        Randomizing <Eq>{'D'}</Eq> makes it independent of the potential outcomes:{' '}
        <Eq>{'D \\perp \\{Y(0),Y(1)\\}'}</Eq>. The selection-bias term vanishes, so a plain
        difference in means is unbiased for the <Term>ATE</Term> — no adjustment, no DAG required.
      </MinSchema>

      <p>
        NSW was, in fact, a randomized experiment. Compare the trainees to a randomized-out control
        group and the answer is causal. Compare them instead to the general workforce and you have
        a self-selected mess. Flip the mode and read the balance table — the same outcome variable,
        two completely different comparison groups.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">comparison</span>
        {[['select', 'Self-selected (vs workforce)'], ['rct', 'Randomized (NSW experiment)']].map(([k, lbl]) => (
          <button key={k} onClick={() => setMode(k)}
            className={`text-[11px] rounded border px-2.5 py-1 transition-colors ${mode === k ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.04]'}`}>
            {lbl}
          </button>
        ))}
        {isRct && (
          <button onClick={() => setSeed((s) => s + 1)}
            className="text-[11px] rounded border border-violet-400/40 bg-violet-500/10 text-violet-200 px-2 py-1 flex items-center gap-1">
            <Shuffle className="w-3 h-3" /> re-randomize
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/[0.03] text-neutral-500">
              <th className="px-2 py-1.5 text-left font-medium">covariate</th>
              <th className="px-2 py-1.5 text-center font-medium">treated</th>
              <th className="px-2 py-1.5 text-center font-medium">control</th>
              <th className="px-2 py-1.5 text-left font-medium">standardized difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bal.map((b) => {
              const a = Math.abs(b.std);
              const col = a < 0.1 ? 'emerald' : a < 0.25 ? 'amber' : 'rose';
              const barCol = { emerald: 'bg-emerald-400/70', amber: 'bg-amber-400/70', rose: 'bg-rose-400/70' }[col];
              const txtCol = { emerald: 'text-emerald-300', amber: 'text-amber-300', rose: 'text-rose-300' }[col];
              return (
                <tr key={b.k}>
                  <td className="px-2 py-1.5 text-neutral-300">{b.label}</td>
                  <td className="px-2 py-1.5 text-center font-mono text-neutral-300">{fmtCov(b.kind, b.mt)}</td>
                  <td className="px-2 py-1.5 text-center font-mono text-neutral-300">{fmtCov(b.kind, b.mc)}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded bg-white/5 overflow-hidden">
                        <div className={`h-full ${barCol}`} style={{ width: `${Math.min(100, (a / 1.6) * 100)}%` }} />
                      </div>
                      <span className={`font-mono w-12 text-right ${txtCol}`}>{b.std >= 0 ? '+' : ''}{b.std.toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-1.5 text-[11px] text-neutral-500">
        standardized difference under <span className="text-emerald-300">0.1</span> = well balanced ·{' '}
        worst covariate here: <span className={maxImb < 0.1 ? 'text-emerald-300' : 'text-rose-300'}>{maxImb.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Stat label="estimate · diff in means" value={sgn(split.est)}
          color={isRct ? 'text-emerald-300' : 'text-rose-300'}
          sub={isRct ? 'unbiased for the ATE' : 'confounded — not causal'} />
        <Stat label="experimental truth" value={sgn(NSW.truthATT)} color="text-neutral-300" sub="the target the RCT estimates" />
      </div>

      <Predict question="Randomization cannot balance things you never measured — drive, health, family support. So how can an RCT be unbiased for those unmeasured factors?">
        It is not balanced in any single sample — it is balanced <em>in expectation</em>. The coin
        flip is independent of every covariate, measured or not, so across repeated experiments each
        one averages out. Hit <strong className="text-violet-200">re-randomize</strong>: the
        estimate wobbles around {sgn(NSW.truthATT)} from sampling noise, but it never drifts to the{' '}
        {sgn(NSW.naiveObs)} confounded answer.
      </Predict>

      <Block>{'D \\perp \\{Y(0),Y(1)\\} \\;\\Rightarrow\\; \\mathbb{E}[Y\\mid D{=}1]-\\mathbb{E}[Y\\mid D{=}0] = \\ca{\\mathbb{E}[Y(1)]-\\mathbb{E}[Y(0)]} = \\text{ATE}'}</Block>

      <Misconception
        wrong="A randomized trial gives you the exact true effect."
        right="An RCT is unbiased, not exact. A single trial still has sampling error — its result is a point estimate with a confidence interval around the truth."
        because="Randomization removes systematic bias, not variance. Re-randomizing shows the estimate scattering around the ATE; only averaging many trials (or a large n) shrinks that scatter."
      />

      <QA items={[
        { q: 'Why does randomization beat adjusting for every confounder you can think of?',
          a: 'Adjustment only closes back-doors through variables you measured. Randomization closes all of them — including confounders you never imagined — because the coin flip has no causal parents at all.' },
        { q: 'If RCTs are this clean, why does the rest of this explainer exist?',
          a: 'RCTs are often impossible: unethical (you cannot randomize smoking), too slow, too expensive, or impossible to assign. Observational methods are how you approximate an RCT when you cannot run one.' },
        { q: 'Balance looks perfect on measured covariates. Does that prove the trial worked?',
          a: 'It is reassuring but not proof — unmeasured factors could still be imbalanced by chance. Randomization justifies the inference; the balance table is a diagnostic, not the guarantee.' },
      ]} />

      <Deeper>
        <p>
          Randomization buys two things at once. It makes treatment <em>statistically independent</em>{' '}
          of all potential outcomes, which kills the selection-bias term, and it does so by an act
          of physical <CrossLink to="dooperator" recap="do(X) deletes every arrow into X; randomization is its physical implementation.">graph surgery</CrossLink>{' '}
          — the coin flip deletes every arrow into <Eq>{'D'}</Eq>. That is why an RCT needs no
          adjustment set and no correct DAG: there are simply no back-doors left to block.
        </p>
        <p>
          The honest caveats are about <em>scope</em>, not bias. An RCT estimates the effect for{' '}
          <em>its</em> population under <em>its</em> protocol — external validity is a separate
          question. Non-compliance, attrition, and interference can reopen the very paths
          randomization closed. And many of the most important questions cannot be randomized at
          all. Every method ahead — matching, weighting, instruments, discontinuities — is a
          different bargain for getting close to this card&apos;s answer without its coin flip.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- shared: a hand-set propensity model e(X) = P(D=1 | X) ---- */

const PS_COVARS = ['age', 'educ', 're74', 're75', 'black', 'hisp', 'married'];
const PS_CONT = ['age', 'educ', 're74', 're75'];

// a real logistic regression of D on covariates (with quadratic terms), fit on
// the observational sample by gradient descent — a CALIBRATED propensity e(X).
const PSM = (() => {
  const rows = NSW.obs;
  const mu = {}, sg = {};
  PS_COVARS.forEach((k) => { mu[k] = mean(rows, (r) => r[k]); sg[k] = sd(rows, (r) => r[k]) || 1; });
  const feat = (u) => {
    const z = {};
    PS_COVARS.forEach((k) => { z[k] = (u[k] - mu[k]) / sg[k]; });
    return [1, ...PS_COVARS.map((k) => z[k]), ...PS_CONT.map((k) => z[k] * z[k])];
  };
  const X = rows.map(feat), y = rows.map((r) => r.d);
  const p = X[0].length, n = X.length, lambda = 0.05;
  let b = Array(p).fill(0);
  for (let it = 0; it < 800; it++) {
    const g = Array(p).fill(0);
    for (let i = 0; i < n; i++) {
      let z = 0; for (let k = 0; k < p; k++) z += b[k] * X[i][k];
      const pr = 1 / (1 + Math.exp(-clamp(z, -30, 30)));
      const err = pr - y[i];
      for (let k = 0; k < p; k++) g[k] += err * X[i][k];
    }
    for (let k = 0; k < p; k++) b[k] -= 0.8 * (g[k] / n + (k === 0 ? 0 : lambda * b[k] / n));
  }
  return { b, feat };
})();

const ps = (u) => {
  const f = PSM.feat(u);
  let z = 0; for (let k = 0; k < f.length; k++) z += PSM.b[k] * f[k];
  return 1 / (1 + Math.exp(-clamp(z, -30, 30)));
};

/* ---- 07 · Selection bias ---- */

const SelectionCard = () => {
  const truth = NSW.truthATT;
  const selBias = NSW.naiveObs - truth; // strongly negative
  const [hypoATT, setHypoATT] = useState(2.0);
  const naiveShown = hypoATT + selBias;

  const hist = useMemo(() => {
    const B = 13, w = 2.5;
    const t = Array(B).fill(0), c = Array(B).fill(0);
    NSW.nswTreated.forEach((u) => { t[Math.min(B - 1, Math.floor(u.re75 / w))]++; });
    NSW.cps.forEach((u) => { c[Math.min(B - 1, Math.floor(u.re75 / w))]++; });
    const tn = t.map((x) => x / NSW.nswTreated.length);
    const cn = c.map((x) => x / NSW.cps.length);
    return { tn, cn, w, B, max: Math.max(...tn, ...cn) };
  }, []);

  const W = 444, H = 150, PL = 8, PR = 8, PB = 22, PT = 8;
  const bw = (W - PL - PR) / hist.B;
  const bh = (f) => (f / hist.max) * (H - PB - PT);

  return (
    <Card id="selection" icon={Filter} title="Selection bias" accent="rose" index={7}
      source="LaLonde 1986 · the observational comparison"
      subtitle="The naive negative number is not a fact about training. It is a fact about who enrolled — two groups that were never remotely comparable to begin with.">
      <MinSchema>
        The naive contrast equals the causal effect plus a <Term>selection bias</Term> term{' '}
        <Eq>{'\\bi{\\mathbb{E}[Y(0)\\mid D{=}1] - \\mathbb{E}[Y(0)\\mid D{=}0]}'}</Eq> — the gap that
        would exist with <em>no program at all</em>. In NSW that term is large and negative.
      </MinSchema>

      <p>
        NSW recruited ex-offenders, former addicts, and the long-term unemployed. The observational
        &ldquo;control&rdquo; group is the general workforce. Look at their <em>1975</em> earnings —
        before training could possibly matter:
      </p>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">1975 earnings — pre-program</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          {hist.cn.map((f, i) => (
            <rect key={`c${i}`} x={PL + i * bw + 1} y={H - PB - bh(f)} width={bw - 2} height={bh(f)}
              fill="#7dd3fc" fillOpacity="0.5" />
          ))}
          {hist.tn.map((f, i) => (
            <rect key={`t${i}`} x={PL + i * bw + 1} y={H - PB - bh(f)} width={bw - 2} height={bh(f)}
              fill="#fb7185" fillOpacity="0.72" />
          ))}
          <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#3f3f46" strokeWidth="1" />
          {[0, 4, 8, 12].map((b) => (
            <text key={b} x={PL + b * bw} y={H - 7} fontSize="9" fill="#71717a">
              ${Math.round(b * hist.w)}k
            </text>
          ))}
        </svg>
        <div className="flex gap-3 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb7185' }} />trainees (NSW)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#7dd3fc' }} />comparison (workforce)</span>
        </div>
      </div>
      <p className="text-sm text-neutral-400">
        The two distributions barely touch. Trainees clustered near <strong className="text-rose-200">$0</strong>;
        the comparison group earned a normal wage. A gap this large in 1975 cannot have been caused
        by a 1976 program — it is pure pre-existing difference.
      </p>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Suppose the program&apos;s true effect were…</span>
          <span className="font-mono text-sky-300">{sgn(hypoATT)}</span>
        </div>
        <input type="range" min="0" max="5" step="0.1" value={hypoATT}
          onChange={(e) => setHypoATT(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">true effect</div>
            <div className="font-mono text-emerald-300">{sgn(hypoATT)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">selection bias</div>
            <div className="font-mono text-rose-300">{sgn(selBias)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">naive estimate</div>
            <div className={`font-mono ${naiveShown < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{sgn(naiveShown)}</div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-center text-neutral-500">
          {naiveShown < 0
            ? 'Even a strongly positive program looks harmful — selection bias swamps it.'
            : 'Only an implausibly huge effect could out-run the selection gap.'}
        </div>
      </div>

      <Predict question="If the true effect were a generous +$5,000, would the naive observational comparison finally turn positive?">
        No. Selection bias here is about {sgn(selBias)}. A {sgn(5)} effect still nets to about{' '}
        {sgn(5 + selBias)}. The <em>sign</em> of the naive estimate is set by who enrolled, not by
        what the program does — which is why LaLonde used it to embarrass observational methods.
      </Predict>

      <Block>{'\\underbrace{\\bi{\\mathbb{E}[Y\\mid D{=}1]-\\mathbb{E}[Y\\mid D{=}0]}}_{\\text{what you measure}} = \\underbrace{\\ca{\\text{ATT}}}_{\\text{want this}} + \\underbrace{\\bi{\\mathbb{E}[Y(0)\\mid D{=}1]-\\mathbb{E}[Y(0)\\mid D{=}0]}}_{\\text{selection bias}}'}</Block>

      <Misconception
        wrong="Trainees ended up poorer than non-trainees, so the program clearly backfired."
        right="The two groups were incomparable before the program ever ran. The negative gap measures selection, not the training effect."
        because="E[Y(0) | trained] — what trainees would have earned untreated — is far below E[Y(0) | control]. Subtracting unlike groups answers a question nobody asked."
      />

      <QA items={[
        { q: 'When is the selection-bias term exactly zero?',
          a: 'When E[Y(0) | D=1] = E[Y(0) | D=0] — the treated and control groups have the same untreated potential outcome. Randomization guarantees this; self-selection almost never does.' },
        { q: 'Trainees also had lower 1975 earnings. Can we just subtract that gap out?',
          a: 'That is the idea behind difference-in-differences and regression adjustment. It works only if the pre-gap fully captures the selection — i.e. the groups would have tracked in parallel. Often they would not.' },
        { q: 'Why did LaLonde use this exact example?',
          a: 'Because NSW had a randomized benchmark (+$1,800). He showed observational estimators applied to a non-experimental comparison group missed it badly — a stress test the whole field still uses.' },
      ]} />

      <Deeper>
        <p>
          Selection bias and <CrossLink to="backdoor" recap="Conditioning on a collider opens a path that was closed.">collider bias</CrossLink>{' '}
          are the same mechanism wearing different clothes. Here, &ldquo;enrolled in NSW&rdquo; is a
          variable driven by everything that also drives low earnings — so comparing across it
          conditions on a fork left wide open. The fix is not a cleverer formula; it is a comparison
          group that shares the trainees&apos; pre-program trajectory.
        </p>
        <p>
          Every observational method ahead is an attempt to <em>reconstruct</em> the missing{' '}
          <Eq>{'\\mathbb{E}[Y(0)\\mid D{=}1]'}</Eq> — what trainees would have earned untreated.{' '}
          <CrossLink to="matching" recap="Match treated units to controls with a similar propensity score.">Matching</CrossLink>{' '}
          and <CrossLink to="ipw" recap="Re-weight the sample by inverse propensity so treatment looks random.">weighting</CrossLink>{' '}
          rebuild it from comparable controls; <CrossLink to="did" recap="Difference out a common trend using a pre-period.">diff-in-differences</CrossLink>{' '}
          rebuilds it from the pre-period trend. They differ only in which assumption they use to
          fill that one missing number.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 08 · Matching & propensity scores ---- */

const MatchingCard = () => {
  const [caliper, setCaliper] = useState(0.06);
  const treated = useMemo(() => NSW.nswTreated.map((u) => ({ ...u, e: ps(u) })), []);
  const controls = useMemo(() => NSW.cps.map((u) => ({ ...u, e: ps(u) })), []);

  const m = useMemo(() => {
    const K = 15;
    let kept = 0, sum = 0;
    treated.forEach((t) => {
      const sorted = controls
        .map((c) => ({ d: Math.abs(c.e - t.e), y: c.y }))
        .sort((a, b) => a.d - b.d);
      if (sorted.length && sorted[0].d <= caliper) {
        kept++;
        sum += t.y - mean(sorted.slice(0, K), (x) => x.y);
      }
    });
    return { est: kept ? sum / kept : 0, kept };
  }, [treated, controls, caliper]);

  const hist = useMemo(() => {
    const B = 14;
    const t = Array(B).fill(0), c = Array(B).fill(0);
    treated.forEach((u) => { t[Math.min(B - 1, Math.floor(u.e * B))]++; });
    controls.forEach((u) => { c[Math.min(B - 1, Math.floor(u.e * B))]++; });
    const tn = t.map((x) => x / treated.length), cn = c.map((x) => x / controls.length);
    return { tn, cn, B, support: tn.map((x, i) => x > 0 && cn[i] > 0), max: Math.max(...tn, ...cn) };
  }, [treated, controls]);

  const W = 444, H = 140, PB = 20, PT = 8, PX = 8;
  const bw = (W - 2 * PX) / hist.B;
  const bh = (f) => (f / hist.max) * (H - PB - PT);
  const truth = NSW.truthATT;
  const good = Math.abs(m.est - truth) < 0.45;

  return (
    <Card id="matching" icon={Scale} title="Matching & propensity scores" accent="sky" index={8}
      source="Rosenbaum-Rubin 1983 · Dehejia-Wahba 1999"
      subtitle="Rebuild the missing control group: pair every trainee with a non-trainee who looked just like them. The propensity score collapses all the covariates into one number to match on.">
      <MinSchema>
        The <Term>propensity score</Term> <Eq>{'e(X)=P(D{=}1\\mid X)'}</Eq> is a balancing score:
        conditional on it, treatment is independent of <Eq>{'X'}</Eq>. Match treated to controls
        with similar <Eq>{'e(X)'}</Eq> — but only where both groups actually exist.
      </MinSchema>

      <p>
        Matching on every covariate at once is hopeless — too many cells, most of them empty. The{' '}
        <Term>propensity score</Term> reduces all eight covariates to a single number: the
        probability this person would enrol. Pair each trainee with the nearest-score control and
        you have rebuilt a comparison group. The catch is overlap.
      </p>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">propensity score e(X) — distribution by group</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          {hist.support.map((s, i) => s && (
            <rect key={`s${i}`} x={PX + i * bw} y={PT} width={bw} height={H - PB - PT}
              fill="#6ee7b7" fillOpacity="0.07" />
          ))}
          {hist.cn.map((f, i) => (
            <rect key={`c${i}`} x={PX + i * bw + 1} y={H - PB - bh(f)} width={bw - 2} height={bh(f)}
              fill="#7dd3fc" fillOpacity="0.55" />
          ))}
          {hist.tn.map((f, i) => (
            <rect key={`t${i}`} x={PX + i * bw + 1} y={H - PB - bh(f)} width={bw - 2} height={bh(f)}
              fill="#fb7185" fillOpacity="0.72" />
          ))}
          <line x1={PX} y1={H - PB} x2={W - PX} y2={H - PB} stroke="#3f3f46" strokeWidth="1" />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={v} x={PX + v * (W - 2 * PX)} y={H - 6} fontSize="9" fill="#71717a" textAnchor="middle">{v}</text>
          ))}
        </svg>
        <div className="flex gap-3 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb7185' }} />trainees</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#7dd3fc' }} />comparison</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/40" />common support</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Caliper — max allowed score gap for a match</span>
          <span className="font-mono text-sky-300">{caliper.toFixed(3)}</span>
        </div>
        <input type="range" min="0.01" max="0.3" step="0.005" value={caliper}
          onChange={(e) => setCaliper(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
          <span>tight — drops poor matches</span><span>loose — keeps everyone</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="naive · no matching" value={sgn(NSW.naiveObs)} color="text-rose-300" sub="raw observational gap" />
        <Stat label="matched estimate" value={sgn(m.est)} color={good ? 'text-emerald-300' : 'text-amber-300'}
          sub={good ? 'close to the truth' : 'biased — bad matches'} />
        <Stat label="trainees matched" value={`${m.kept}/185`}
          color={m.kept > 150 ? 'text-amber-300' : 'text-sky-300'} sub="rest fall outside the caliper" />
      </div>

      <Predict question="The naive gap is about −$7.5k. After propensity matching the estimate jumps near +$1,800. Coincidence?">
        No — it is the Dehejia-Wahba result. Once each trainee is compared to non-trainees with the
        same propensity score, the {sgn(NSW.naiveObs)} selection gap collapses and matching recovers
        the experimental benchmark, {sgn(truth)}. Tightening the caliper drops trainees with no close
        match — that costs sample size, not accuracy. The real danger is data with <em>worse</em>{' '}
        overlap, where no caliper can manufacture a comparison group that is not there.
      </Predict>

      <Block>{'\\widehat{\\text{ATT}} = \\frac{1}{N_1}\\sum_{i:\\,D_i=1}\\Big(Y_i - Y_{j(i)}\\Big), \\qquad j(i)=\\arg\\min_{j:\\,D_j=0}\\,\\big|\\,e(X_i)-e(X_j)\\,\\big|'}</Block>

      <Misconception
        wrong="Matching on the propensity score adjusts away confounding the way randomization does."
        right="It only balances OBSERVED covariates, and only where the groups overlap. No score can match a trainee who has no real-world counterpart."
        because="e(X) is built from the X you measured. Unmeasured confounders stay imbalanced, and outside common support matching either extrapolates or must discard units."
      />

      <QA items={[
        { q: 'Why match on the scalar e(X) instead of all eight covariates directly?',
          a: 'Exact matching on eight covariates leaves almost every cell empty — the curse of dimensionality. Rosenbaum and Rubin proved e(X) is a balancing score: matching on that one number balances all of X.' },
        { q: 'The histogram shows trainees piled near e=1 and the comparison near e=0. What does that mean?',
          a: 'Weak overlap. Most trainees have no comparison unit with a similar score, so the credible estimate rests on the thin common-support band — and on dropping the rest.' },
        { q: 'Dehejia and Wahba revisited LaLonde’s data. What did they find?',
          a: 'That propensity-score matching, restricted to the common-support subset, recovered the experimental benchmark — where LaLonde’s regressions had failed. Method and sample restriction together did the work.' },
      ]} />

      <Deeper>
        <p>
          Matching delivers the ATT only under <Term>unconfoundedness</Term> —{' '}
          <Eq>{'\\{Y(0),Y(1)\\}\\perp D\\mid X'}</Eq> — and <Term>overlap</Term>,{' '}
          <Eq>{'0<e(X)<1'}</Eq>. The propensity histogram is the overlap assumption made visual:
          where the rose and sky bars do not share a bin, there is no comparison to be had. A
          trustworthy analysis reports the matched estimate <em>and</em> how many treated units it
          had to discard to get it.
        </p>
        <p>
          Practical knobs trade bias against variance. One nearest neighbour gives the closest match
          but a noisy average; <em>k</em> neighbours or kernel weighting smooth it at the cost of
          slightly worse matches. Matching <em>with replacement</em> lets one excellent control
          serve many trainees — vital under weak overlap. And matching never certifies itself:
          always re-check covariate balance <em>after</em> matching, exactly as the{' '}
          <CrossLink to="rct" recap="An RCT balances every covariate, measured or not, by design.">RCT card</CrossLink>{' '}
          does by construction.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- shared: ordinary least squares via the normal equations ---- */

function ols(X, y) {
  const n = X.length, p = X[0].length;
  const A = Array.from({ length: p }, () => Array(p).fill(0));
  const b = Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    const xi = X[i], yi = y[i];
    for (let a = 0; a < p; a++) {
      b[a] += xi[a] * yi;
      for (let c = 0; c < p; c++) A[a][c] += xi[a] * xi[c];
    }
  }
  for (let c = 0; c < p; c++) {
    let piv = c;
    for (let r = c + 1; r < p; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    [b[c], b[piv]] = [b[piv], b[c]];
    const d = A[c][c] || 1e-9;
    for (let r = c + 1; r < p; r++) {
      const f = A[r][c] / d;
      for (let k = c; k < p; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const beta = Array(p).fill(0);
  for (let c = p - 1; c >= 0; c--) {
    let s = b[c];
    for (let k = c + 1; k < p; k++) s -= A[c][k] * beta[k];
    beta[c] = s / (A[c][c] || 1e-9);
  }
  return beta;
}

/* ---- 09 · Regression & bad controls ---- */

const REG_GROUPS = [
  { id: 'pe', label: 'Prior earnings', cols: ['re74', 're75'], kind: 'confounder',
    note: 'A confounder — drives enrolment and later earnings. Adjust for it.' },
  { id: 'ed', label: 'Education', cols: ['educ'], kind: 'confounder',
    note: 'A confounder — fewer years of schooling among trainees. Adjust for it.' },
  { id: 'dm', label: 'Demographics', cols: ['age', 'black', 'hisp', 'married'], kind: 'confounder',
    note: 'Confounders — age, race, marital status all shift baseline earnings.' },
  { id: 'zc', label: 'Program-office contact', cols: ['Z'], kind: 'collider',
    note: 'A COLLIDER — caused by both training and earnings. Controlling for it injects bias.' },
];

const RegressionCard = () => {
  const data = useMemo(() => NSW.obs.map((u) => {
    const r = mulberry32(((u.id + 7) * 2654435761) >>> 0);
    const Z = 0.3 * u.d + 0.45 * u.y + 0.8 * boxMuller(r);
    return { ...u, Z };
  }), []);
  const [on, setOn] = useState({ pe: false, ed: false, dm: false, zc: false });

  const fit = useMemo(() => {
    const cols = [];
    REG_GROUPS.forEach((g) => { if (on[g.id]) cols.push(...g.cols); });
    const X = data.map((u) => [1, u.d, ...cols.map((c) => u[c])]);
    const y = data.map((u) => u.y);
    return ols(X, y)[1];
  }, [data, on]);

  const truth = NSW.truthATT;
  const confOn = on.pe && on.ed && on.dm;
  const good = confOn && !on.zc && Math.abs(fit - truth) < 0.6;

  return (
    <Card id="regression" icon={FunctionSquare} title="Regression & bad controls" accent="amber" index={9}
      source="ordinary least squares · Frisch-Waugh-Lovell"
      subtitle="A regression of earnings on training plus controls puts the ATT in one coefficient — βD. The estimate is only as good as the control set: the right covariates fix it, the wrong ones break it.">
      <MinSchema>
        Regress <Eq>{'Y'}</Eq> on <Eq>{'D'}</Eq> and covariates; the coefficient{' '}
        <Eq>{'\\ca{\\beta_D}'}</Eq> estimates the effect. It equals the ATT only if the controls
        block every back-door and include <em>no</em> post-treatment variable.
      </MinSchema>

      <p>
        Regression is matching&apos;s algebraic cousin: <Eq>{'\\beta_D'}</Eq> is a comparison of
        treated and control earnings <em>holding the controls fixed</em>. Build the control set
        below. Adding a <span className="text-emerald-300">confounder</span> closes a back-door and
        pulls <Eq>{'\\beta_D'}</Eq> toward the truth; adding the{' '}
        <span className="text-rose-300">collider</span> opens one and pushes it away.
      </p>

      <div className="mt-4 space-y-1.5">
        {REG_GROUPS.map((g) => {
          const isOn = on[g.id];
          const conf = g.kind === 'confounder';
          return (
            <button key={g.id} onClick={() => setOn((s) => ({ ...s, [g.id]: !s[g.id] }))}
              className={`w-full text-left flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors ${isOn ? (conf ? 'border-emerald-400/40 bg-emerald-500/[0.07]' : 'border-rose-400/40 bg-rose-500/[0.07]') : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className={`mt-[2px] shrink-0 ${isOn ? (conf ? 'text-emerald-300' : 'text-rose-300') : 'text-neutral-600'}`}>
                {isOn ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded border border-current" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-neutral-100">{g.label}
                  <span className={`ml-2 text-[10px] uppercase tracking-wider ${conf ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>{g.kind}</span>
                </div>
                <div className="text-[11px] text-neutral-400 leading-snug">{g.note}</div>
              </div>
            </button>
          );
        })}
      </div>

      <Block>{'Y_i = \\beta_0 + \\ca{\\beta_D}\\,D_i + \\sum_k \\beta_k X_{ik} + \\varepsilon_i'}</Block>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <Stat label="βD · coefficient on training" value={sgn(fit)}
          color={good ? 'text-emerald-300' : on.zc ? 'text-rose-300' : Math.abs(fit - truth) < 0.6 ? 'text-emerald-300' : 'text-amber-300'}
          sub={good ? 'controls correct — matches ATT' : on.zc ? 'collider in the model — biased' : confOn ? '' : 'back-doors still open'} />
        <Stat label="experimental truth" value={sgn(truth)} color="text-neutral-300" sub="the ATT βD should recover" />
      </div>

      <Predict question="You control for every confounder and βD lands on +$1,800. Then you add ‘program-office contact’ to be thorough. What happens?">
        It breaks. Program-office contact is a <Term>collider</Term> — caused by both training and
        earnings. Adding it as a control conditions on that collider, opens the spurious path{' '}
        <Eq>{'D\\to Z\\leftarrow Y'}</Eq>, and <Eq>{'\\beta_D'}</Eq> drifts off the truth. &ldquo;Being
        thorough&rdquo; with controls is how good regressions go wrong.
      </Predict>

      <Misconception
        wrong="A regression with more controls is a more careful regression."
        right="Only pre-treatment confounders belong in the model. Adding post-treatment variables — mediators, colliders — biases the coefficient you care about."
        because="βD answers ‘holding the controls fixed.’ Hold a mediator fixed and you erase the effect that flows through it; hold a collider fixed and you open a back-door. The control set is a causal choice, not a kitchen sink."
      />

      <QA items={[
        { q: 'Why does regression with the right controls give nearly the same answer as matching?',
          a: 'Both estimate E[Y | D, X] and contrast D=1 vs D=0 at fixed X. The Frisch-Waugh-Lovell theorem shows βD is a covariance-weighted average of within-stratum treated-minus-control differences — a weighted matching estimator.' },
        { q: 'βD is +$1,800 with confounders, but R² barely moves when you add them. Does R² matter?',
          a: 'No. R² measures prediction; βD measures a causal contrast. A control can leave R² flat yet still close a back-door and shift βD. Predictive fit and unbiasedness are different goals.' },
        { q: 'Is "throw in every pre-treatment variable" safe, then?',
          a: 'Safer than including post-treatment ones, but not free. A pre-treatment collider (M-bias) can still open a path, and irrelevant controls inflate variance. The DAG, not the timing alone, decides.' },
      ]} />

      <Deeper>
        <p>
          Omitted-variable bias has a clean form: leave out a confounder and{' '}
          <Eq>{'\\beta_D'}</Eq> is off by <Eq>{'\\gamma\\,\\delta'}</Eq>, where{' '}
          <Eq>{'\\delta'}</Eq> is how the confounder relates to treatment and{' '}
          <Eq>{'\\gamma'}</Eq> its effect on the outcome. In NSW both are large and the product is
          hugely negative — which is the entire {sgn(NSW.naiveObs)} naive estimate when no
          confounders are in the model.
        </p>
        <p>
          Regression also carries a quieter assumption: a <em>constant</em> effect. A single{' '}
          <Eq>{'\\beta_D'}</Eq> presumes training helps everyone equally. When the effect is
          heterogeneous, OLS returns a variance-weighted blend that need not equal the ATT — it
          over-weights covariate cells with the most treated-control overlap. The{' '}
          <CrossLink to="doubleml" recap="Double ML and causal forests estimate the effect as a function of covariates.">double-ML card</CrossLink>{' '}
          relaxes both the functional form and the constant-effect assumption.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 10 · Inverse propensity weighting ---- */

const IPW_BAL = [
  { k: 're75', label: 'Earnings ’75', kind: 'cash' },
  { k: 'educ', label: 'Education', kind: 'num' },
  { k: 'black', label: 'Black', kind: 'rate' },
];

const IpwCard = () => {
  const treated = NSW.nswTreated;
  const controls = useMemo(() => NSW.cps.map((u) => {
    const e = clamp(ps(u), 0.001, 0.999);
    return { ...u, e, w: e / (1 - e) };
  }), []);

  const calc = useMemo(() => {
    const y1 = mean(treated, (u) => u.y);
    let sw = 0, swy = 0, sw2 = 0;
    const wmean = {};
    IPW_BAL.forEach((b) => { wmean[b.k] = 0; });
    controls.forEach((c) => {
      sw += c.w; swy += c.w * c.y; sw2 += c.w * c.w;
      IPW_BAL.forEach((b) => { wmean[b.k] += c.w * c[b.k]; });
    });
    IPW_BAL.forEach((b) => { wmean[b.k] /= sw; });
    const desc = controls.map((c) => c.w).sort((a, b) => b - a);
    let cum = 0; const curve = desc.map((w) => (cum += w / sw));
    let n80 = curve.findIndex((c) => c >= 0.8) + 1;
    if (n80 <= 0) n80 = desc.length;
    return { att: y1 - swy / sw, ess: (sw * sw) / sw2, wmean, curve, n80 };
  }, [controls]);

  const truth = NSW.truthATT;
  const pct80 = (calc.n80 / controls.length) * 100;

  return (
    <Card id="ipw" icon={Gauge} title="Inverse propensity weighting" accent="sky" index={10}
      source="Horvitz-Thompson 1952 · Hirano-Imbens-Ridder 2003"
      subtitle="Don’t discard the mismatched controls — re-weight them. Up-weight the few non-trainees who look like trainees until the comparison group mirrors the treated population.">
      <MinSchema>
        Weight each control by the odds of treatment <Eq>{'w_i = \\hat e(X_i)/(1-\\hat e(X_i))'}</Eq>.
        Controls who <em>look</em> like trainees count for more; the weighted control mean estimates{' '}
        <Eq>{'\\mathbb{E}[Y(0)\\mid D{=}1]'}</Eq>, the trainees&apos; missing counterfactual.
      </MinSchema>

      <p>
        Matching keeps the best control for each trainee and drops the rest. Weighting keeps{' '}
        <em>everyone</em> but adjusts their vote: a non-trainee with a high propensity score stands
        in for many trainees, a typical worker for almost none. The result is a synthetic
        comparison group balanced on the covariates.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">covariate balance — control group vs trainees</div>
        {IPW_BAL.map((b) => {
          const raw = mean(controls, (c) => c[b.k]);
          const wt = calc.wmean[b.k];
          const tr = mean(treated, (u) => u[b.k]);
          const lo = Math.min(raw, wt, tr), hi = Math.max(raw, wt, tr), span = hi - lo || 1;
          const pos = (v) => `${((v - lo) / span) * 100}%`;
          return (
            <div key={b.k} className="mb-3 last:mb-1">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-300">{b.label}</span>
                <span className="text-neutral-500">
                  raw <span className="text-rose-300 font-mono">{fmtCov(b.kind, raw)}</span>
                  {'  →  '}weighted <span className="text-sky-300 font-mono">{fmtCov(b.kind, wt)}</span>
                  {'   vs   '}trainees <span className="text-emerald-300 font-mono">{fmtCov(b.kind, tr)}</span>
                </span>
              </div>
              <div className="relative h-5 rounded bg-white/5">
                <div className="absolute -translate-x-1/2 top-0 h-5 w-px bg-emerald-300" style={{ left: pos(tr) }} />
                <div className="absolute -translate-x-1/2 top-1 w-2.5 h-2.5 rounded-full bg-rose-400" style={{ left: pos(raw) }} />
                <div className="absolute -translate-x-1/2 top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30" style={{ left: pos(wt) }} />
              </div>
            </div>
          );
        })}
        <div className="text-[10px] text-neutral-500">
          The <span className="text-sky-300">weighted</span> control dot slides onto the{' '}
          <span className="text-emerald-300">trainee</span> line — that is balance.
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">where the weight goes</span>
          <span className="text-[11px] text-neutral-400">
            top <span className="text-rose-300 font-mono">{pct80.toFixed(1)}%</span> of controls carry{' '}
            <span className="text-rose-300">80%</span> of the weight
          </span>
        </div>
        <svg viewBox="0 0 444 96" className="w-full" style={{ maxHeight: 104 }}>
          <line x1="6" y1="90" x2="438" y2="6" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
          <polyline fill="none" stroke="#fb7185" strokeWidth="2"
            points={calc.curve.map((c, i) => `${6 + (i / (calc.curve.length - 1)) * 432},${90 - c * 84}`).join(' ')} />
        </svg>
        <div className="text-[10px] text-neutral-500">
          The dashed diagonal is perfectly even weighting. The steep rose curve means almost all of
          the comparison rests on a thin sliver of controls — IPW&apos;s <em>effective</em> sample,
          not its headcount.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="IPW estimate" value={sgn(calc.att)}
          color={Math.abs(calc.att - truth) < 0.6 ? 'text-emerald-300' : 'text-amber-300'} sub="ŷ₁ − weighted ŷ₀" />
        <Stat label="effective sample" value={Math.round(calc.ess)} color="text-sky-300"
          sub={`of ${controls.length} controls`} />
        <Stat label="experimental truth" value={sgn(truth)} color="text-neutral-300" sub="target" />
      </div>

      <Predict question="A handful of non-trainees have a propensity score near 1. What do their inverse-propensity weights do to the estimate?">
        They explode. As <Eq>{'\\hat e\\to 1'}</Eq> the weight <Eq>{'\\hat e/(1-\\hat e)'}</Eq>{' '}
        runs away, so a few dozen controls carry the whole comparison. Here IPW lands on the
        truth, but its <em>effective sample</em> is only about {Math.round(calc.ess)} of{' '}
        {controls.length} controls — an unbiased point estimate balancing on a knife edge.
      </Predict>

      <Block>{'\\widehat{\\text{ATT}}_{\\text{IPW}} = \\underbrace{\\frac1{N_1}\\!\\sum_{D_i=1}\\! Y_i}_{\\bar y_1} - \\underbrace{\\frac{\\sum_{D_i=0} w_i Y_i}{\\sum_{D_i=0} w_i}}_{\\hat{\\mathbb{E}}[Y(0)\\mid D=1]}, \\quad w_i = \\frac{\\hat e(X_i)}{1-\\hat e(X_i)}'}</Block>

      <Misconception
        wrong="Weighting uses the whole sample, so it beats matching, which throws data away."
        right="Weighting keeps every row but not every row’s information. Extreme weights mean a few units dominate — the effective sample can be far smaller than the headcount."
        because="Variance scales with the spread of weights, not the row count. Without overlap, IPW does not fail loudly like matching — it fails quietly, as a noisy estimate from a tiny effective sample."
      />

      <QA items={[
        { q: 'Why weight controls by ê/(1−ê) rather than 1/(1−ê)?',
          a: '1/(1−ê) targets the ATE — re-weighting controls to the whole population. The odds ê/(1−ê) re-weight them to the TREATED covariate distribution, which is what the ATT needs.' },
        { q: 'IPW needs only the propensity model; regression needs only the outcome model. Can you hedge?',
          a: 'Yes — a doubly robust estimator combines both and is consistent if EITHER is correct. AIPW and TMLE are the standard forms; it is the safety net when you are unsure which model you trust.' },
        { q: 'IPW lands near +$1,800 but on an effective sample of a few dozen. Should we trust it?',
          a: 'Treat it as fragile. The point estimate is unbiased, but a tiny effective sample means a wide confidence interval and acute sensitivity to the propensity model. Better overlap, or a doubly-robust estimator, is the real fix — not the weights alone.' },
      ]} />

      <Deeper>
        <p>
          IPW rebuilds, in a single weighted average, the pseudo-population a randomized trial
          would have produced — treatment independent of <Eq>{'X'}</Eq> by construction. Its
          Achilles&apos; heel is the denominator: <Eq>{'1-\\hat e'}</Eq> near zero. The estimator
          stays unbiased in theory while becoming useless in practice, because a vanishing
          effective sample makes the variance enormous.
        </p>
        <p>
          That fragility is why <em>doubly robust</em> estimators are the modern default. They fit
          an outcome model <em>and</em> a propensity model and combine them so the answer is
          consistent if either one is right — and, with cross-fitting, lets flexible machine
          learning supply both without contaminating the effect estimate. That is precisely the
          bridge into the <CrossLink to="doubleml" recap="Double ML uses cross-fitted ML for the outcome and propensity models, then orthogonalizes.">double machine-learning card</CrossLink>.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 11 · Instrumental variables ---- */

const IvCard = () => {
  const [strength, setStrength] = useState(0.6);
  const truth = NSW.truthATT;

  const sim = useMemo(() => {
    const rand = mulberry32(4242);
    const N = 900, u = [];
    for (let i = 0; i < N; i++) {
      const U = boxMuller(rand);                 // unmeasured confounder (motivation)
      const Z = rand() < 0.5 ? 1 : 0;            // random encouragement / assignment
      const q = rand();
      const type = q < strength ? 'complier' : (U > 0 ? 'always' : 'never');
      const D = type === 'complier' ? Z : type === 'always' ? 1 : 0;
      const y0 = 5.0 + 1.9 * U + boxMuller(rand) * 2.0;
      u.push({ U, Z, D, type, Y: y0 + truth * D });
    }
    const z1 = u.filter((x) => x.Z === 1), z0 = u.filter((x) => x.Z === 0);
    const d1 = u.filter((x) => x.D === 1), d0 = u.filter((x) => x.D === 0);
    const firstStage = mean(z1, (x) => x.D) - mean(z0, (x) => x.D);
    const reduced = mean(z1, (x) => x.Y) - mean(z0, (x) => x.Y);
    const iv = reduced / firstStage;
    const olsEst = mean(d1, (x) => x.Y) - mean(d0, (x) => x.Y);
    const sdRF = Math.sqrt(sd(z1, (x) => x.Y) ** 2 / z1.length + sd(z0, (x) => x.Y) ** 2 / z0.length);
    const ivSE = sdRF / Math.abs(firstStage);
    return {
      firstStage, iv, olsEst, ivSE,
      counts: {
        complier: u.filter((x) => x.type === 'complier').length,
        always: u.filter((x) => x.type === 'always').length,
        never: u.filter((x) => x.type === 'never').length,
      },
    };
  }, [strength, truth]);

  const ciLo = sim.iv - 1.96 * sim.ivSE, ciHi = sim.iv + 1.96 * sim.ivSE;
  const SCALE = 8; // plot domain −2..+6 -> map
  const sx = (v) => `${clamp(((v + 2) / SCALE) * 100, 0, 100)}%`;
  const weak = sim.firstStage < 0.25;

  return (
    <Card id="iv" icon={Crosshair} title="Instrumental variables" accent="violet" index={11}
      source="Wright 1928 · Imbens-Angrist 1994"
      subtitle="When a confounder is unmeasured, no adjustment can save you. An instrument sidesteps it — a nudge that shifts treatment but touches the outcome through nothing else.">
      <MinSchema>
        An <Term>instrumental variable</Term> <Eq>{'Z'}</Eq> affects <Eq>{'D'}</Eq>, reaches{' '}
        <Eq>{'Y'}</Eq> only through <Eq>{'D'}</Eq> (the <Term>exclusion restriction</Term>), and
        shares no confounder with <Eq>{'Y'}</Eq>. Then{' '}
        <Eq>{'\\ca{\\hat\\tau} = \\mathrm{Cov}(Y,Z)/\\mathrm{Cov}(D,Z)'}</Eq>.
      </MinSchema>

      <p>
        Here motivation is an <em>unmeasured</em> confounder: keen workers both seek training and
        earn more anyway, so a plain comparison overstates the effect. The instrument is the random
        offer of a training slot. It nudges enrolment without touching earnings any other way — so
        dividing its effect on earnings by its effect on enrolment isolates the causal effect.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { k: 'complier', label: 'Compliers', tone: 'emerald', desc: 'train iff offered' },
          { k: 'always', label: 'Always-takers', tone: 'amber', desc: 'train regardless' },
          { k: 'never', label: 'Never-takers', tone: 'rose', desc: 'never train' },
        ].map((t) => (
          <div key={t.k} className={`rounded-lg border px-2.5 py-2 ${t.tone === 'emerald' ? 'border-emerald-400/30 bg-emerald-500/[0.06]' : t.tone === 'amber' ? 'border-amber-400/30 bg-amber-500/[0.06]' : 'border-rose-400/30 bg-rose-500/[0.06]'}`}>
            <div className={`text-lg font-mono ${t.tone === 'emerald' ? 'text-emerald-300' : t.tone === 'amber' ? 'text-amber-300' : 'text-rose-300'}`}>{sim.counts[t.k]}</div>
            <div className="text-[11px] text-neutral-200">{t.label}</div>
            <div className="text-[10px] text-neutral-500">{t.desc}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-neutral-500 mt-1.5">
        IV recovers the effect for <span className="text-emerald-300">compliers only</span> — the{' '}
        <Term>LATE</Term>. Always- and never-takers ignore the instrument, so it says nothing about
        them. <Term>Monotonicity</Term> assumes there are no defiers.
      </p>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Instrument strength — share of compliers</span>
          <span className="font-mono text-violet-300">{Math.round(strength * 100)}%</span>
        </div>
        <input type="range" min="0.05" max="0.95" step="0.01" value={strength}
          onChange={(e) => setStrength(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
          <span>weak instrument</span><span>strong instrument</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">IV estimate with 95% interval</div>
        <div className="relative h-9">
          <div className="absolute inset-x-0 top-4 h-px bg-white/10" />
          <div className="absolute top-0 bottom-0 w-px bg-emerald-300/70" style={{ left: sx(truth) }} />
          <div className="absolute top-4 h-1 -translate-y-1/2 rounded bg-violet-400/40"
            style={{ left: sx(ciLo), width: `${clamp(((ciHi - ciLo) / SCALE) * 100, 0, 100)}%` }} />
          <div className="absolute top-4 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300" style={{ left: sx(sim.iv) }} />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500">
          <span>−$2k</span><span className="text-emerald-300">truth +${Math.round(truth * 1000)}</span><span>+$6k</span>
        </div>
        {weak && (
          <div className="mt-1.5 text-[11px] text-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> weak instrument — first stage {sim.firstStage.toFixed(2)}; the interval is exploding
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="OLS · ignores confounding" value={sgn(sim.olsEst)} color="text-rose-300" sub="biased up by motivation" />
        <Stat label="IV / Wald estimate" value={sgn(sim.iv)}
          color={Math.abs(sim.iv - truth) < 0.6 ? 'text-emerald-300' : 'text-amber-300'} sub="the LATE — compliers" />
        <Stat label="first stage" value={sim.firstStage.toFixed(2)}
          color={weak ? 'text-rose-300' : 'text-emerald-300'} sub="effect of Z on D" />
      </div>

      <Predict question="Slide the instrument to weak. The IV point estimate still hovers near the truth — so why is a weak instrument dangerous?">
        Because the point estimate is the <em>least</em> of it. IV divides by the first stage; as
        that denominator shrinks toward zero, the confidence interval explodes and any tiny flaw in
        the instrument — a sliver of direct effect — gets divided up into a huge bias. A weak
        instrument is unbiased in theory and useless in practice.
      </Predict>

      <Block>{'\\ca{\\hat\\tau_{\\text{LATE}}} = \\frac{\\mathbb{E}[Y\\mid Z{=}1]-\\mathbb{E}[Y\\mid Z{=}0]}{\\underbrace{\\mathbb{E}[D\\mid Z{=}1]-\\mathbb{E}[D\\mid Z{=}0]}_{\\text{first stage}}}'}</Block>

      <Misconception
        wrong="An instrument lets you estimate the average treatment effect without measuring the confounder."
        right="It estimates the LATE — the effect for compliers, the units the instrument actually moves. That subgroup is usually not the whole population."
        because="Always-takers and never-takers don’t respond to Z, so the data carry no information about their effects. A different instrument moves a different complier group and can give a different number."
      />

      <QA items={[
        { q: 'What makes the exclusion restriction untestable?',
          a: 'It is a claim about a path that should NOT exist — Z to Y except through D. Data can show Z and Y are related; it cannot prove the relation runs only through D. It is defended by argument, not by a test.' },
        { q: 'Randomized assignment with imperfect compliance — why is that the textbook instrument?',
          a: 'Assignment is random, so it shares no confounder with Y; it plausibly affects earnings only by changing who trains. Intention-to-treat is the reduced form; dividing by the first stage rescales it to the complier effect.' },
        { q: 'Two valid instruments give two different estimates. Is one wrong?',
          a: 'Not necessarily — they identify different LATEs, the effect for their own complier groups. Heterogeneous effects mean "the" causal effect depends on whose behaviour you managed to move.' },
      ]} />

      <Deeper>
        <p>
          The first stage is the whole game. The IV estimate is a ratio, and a near-zero
          denominator magnifies everything: variance, finite-sample bias, and any violation of the
          exclusion restriction. The rule of thumb — a first-stage F-statistic above 10 — is a
          floor, and recent work argues it is far too low. When the instrument is weak, IV can be
          more biased than the OLS it was meant to rescue.
        </p>
        <p>
          IV trades the unconfoundedness assumption — which <CrossLink to="matching" recap="Matching and weighting assume treatment is as-good-as-random given measured covariates.">matching and weighting</CrossLink>{' '}
          need — for two new untestable ones: exclusion and monotonicity. That is the recurring
          bargain of causal inference. You never escape assumptions; you only choose which ones you
          are most willing to defend. The next two cards exploit a different escape hatch — a
          discontinuity, and a constructed counterfactual.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 12 · Difference-in-differences ---- */

const DidCard = () => {
  const [delta, setDelta] = useState(0);
  const truth = NSW.truthATT;
  const Ycp = 13.5, Ycq = 14.3;          // control: pre, post
  const ctrlChange = Ycq - Ycp;          // common trend, +0.8
  const Ytp = 1.8;                       // treated pre
  const Ytq = Ytp + ctrlChange + truth;  // treated post — observed
  const did = (Ytq - Ytp) - ctrlChange;  // diff-in-diff estimate (assumes parallel trends)
  const assumedCF = Ytp + ctrlChange;    // counterfactual under parallel trends
  const trueCF = Ytp + ctrlChange + delta; // true counterfactual if trends diverge by delta
  const trueEffect = Ytq - trueCF;       // = truth - delta

  const W = 444, H = 212, PX = 54, PT = 14, PB = 34;
  const xPre = PX + 40, xPost = W - PX - 20;
  const yMax = 17;
  const sy = (v) => PT + (1 - v / yMax) * (H - PT - PB);

  return (
    <Card id="did" icon={TrendingUp} title="Difference-in-differences" accent="amber" index={12}
      source="Snow 1855 · Card-Krueger 1994"
      subtitle="Two groups, two periods. Subtract each group’s before-to-after change, then subtract those — the fixed gap and any shared trend cancel. What survives is the effect, if trends were parallel.">
      <MinSchema>
        <Term>Difference-in-differences</Term> double-differences the data:{' '}
        <Eq>{'\\hat\\tau = (\\bar Y_{T,\\text{post}}-\\bar Y_{T,\\text{pre}}) - (\\bar Y_{C,\\text{post}}-\\bar Y_{C,\\text{pre}})'}</Eq>.
        It is unbiased only if the groups would have moved in <Term>parallel trends</Term> absent treatment.
      </MinSchema>

      <p>
        A fixed level gap between trainees and the workforce — even a huge one — does not bother
        DiD: it cancels in the first difference. What DiD cannot survive is a <em>difference in
        trends</em>. Drag the slider to let the groups drift apart and watch the true effect peel
        away from the DiD estimate.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          <line x1={PX} y1={sy(0)} x2={W - PX + 20} y2={sy(0)} stroke="#3f3f46" strokeWidth="1" />
          {[0, 5, 10, 15].map((g) => (
            <g key={g}>
              <line x1={PX} y1={sy(g)} x2={W - PX + 20} y2={sy(g)} stroke="#ffffff" strokeOpacity="0.05" />
              <text x={PX - 8} y={sy(g) + 3} fontSize="9" fill="#71717a" textAnchor="end">${g}k</text>
            </g>
          ))}
          <text x={xPre} y={H - 14} fontSize="10" fill="#a1a1aa" textAnchor="middle">1975 · pre</text>
          <text x={xPost} y={H - 14} fontSize="10" fill="#a1a1aa" textAnchor="middle">1978 · post</text>
          {/* control */}
          <line x1={xPre} y1={sy(Ycp)} x2={xPost} y2={sy(Ycq)} stroke="#7dd3fc" strokeWidth="2.4" />
          {/* treated observed */}
          <line x1={xPre} y1={sy(Ytp)} x2={xPost} y2={sy(Ytq)} stroke="#c4b5fd" strokeWidth="2.4" />
          {/* assumed counterfactual (parallel) */}
          <line x1={xPre} y1={sy(Ytp)} x2={xPost} y2={sy(assumedCF)} stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 4" />
          {/* true counterfactual */}
          {Math.abs(delta) > 0.05 && (
            <line x1={xPre} y1={sy(Ytp)} x2={xPost} y2={sy(trueCF)} stroke="#fb7185" strokeWidth="1.8" strokeDasharray="3 3" />
          )}
          {/* DiD gap bracket */}
          <line x1={xPost} y1={sy(assumedCF)} x2={xPost} y2={sy(Ytq)} stroke="#fbbf24" strokeWidth="3" />
          {[[xPre, Ycp, '#7dd3fc'], [xPost, Ycq, '#7dd3fc'], [xPre, Ytp, '#c4b5fd'], [xPost, Ytq, '#c4b5fd']].map(([x, v, c], i) => (
            <circle key={i} cx={x} cy={sy(v)} r="4.5" fill="#0a0a0a" stroke={c} strokeWidth="2" />
          ))}
          <text x={xPost + 8} y={sy(Ycq) + 3} fontSize="9.5" fill="#7dd3fc">control</text>
          <text x={xPost + 8} y={sy(Ytq) + 3} fontSize="9.5" fill="#c4b5fd">trainees</text>
          <text x={xPost + 8} y={sy((assumedCF + Ytq) / 2) + 3} fontSize="9" fill="#fbbf24">DiD</text>
        </svg>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px]" style={{ background: '#fbbf24' }} />assumed counterfactual (parallel)</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px]" style={{ background: '#fb7185' }} />true counterfactual (trends diverge)</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Parallel-trends violation — extra trainee drift, $k</span>
          <span className={`font-mono ${Math.abs(delta) < 0.1 ? 'text-emerald-300' : 'text-rose-300'}`}>{sgn(delta)}</span>
        </div>
        <input type="range" min="-2.5" max="2.5" step="0.1" value={delta}
          onChange={(e) => setDelta(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
          <span>trainees would have lagged</span><span>parallel</span><span>trainees would have surged</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="DiD estimate" value={sgn(did)} color="text-amber-300" sub="assumes parallel trends" />
        <Stat label="true effect" value={sgn(trueEffect)}
          color={Math.abs(trueEffect - did) < 0.1 ? 'text-emerald-300' : 'text-rose-300'} sub="given the real trend" />
        <Stat label="bias" value={sgn(did - trueEffect)}
          color={Math.abs(did - trueEffect) < 0.1 ? 'text-emerald-300' : 'text-rose-300'} sub="= the trend violation" />
      </div>

      <Predict question="Trainees out-earn nobody — they start $11k below the comparison group. Does that level gap bias the DiD estimate?">
        No. A constant level gap is exactly what DiD is built to erase: it vanishes in each
        group&apos;s before-minus-after difference. DiD&apos;s one vulnerability is a{' '}
        <em>trend</em> gap — if trainees&apos; earnings were already on a different slope, the
        estimate is off by precisely that slope difference. Level gaps are free; trend gaps are fatal.
      </Predict>

      <Block>{'\\hat\\tau_{\\text{DiD}} = (\\bar Y_{T,1}-\\bar Y_{T,0}) - (\\bar Y_{C,1}-\\bar Y_{C,0}) = \\ca{\\tau} + \\bi{[\\text{trend}_T-\\text{trend}_C]}'}</Block>

      <Misconception
        wrong="If the treated and control groups look similar before treatment, difference-in-differences is valid."
        right="DiD needs similar TRENDS, not similar levels — and the trend that matters is the one in the post-period, which is never observed."
        because="Parallel pre-trends are reassuring but not proof. The assumption is about the unobserved counterfactual path; matching pre-period levels says nothing about it."
      />

      <QA items={[
        { q: 'What is the "Ashenfelter dip" and why does it threaten DiD here?',
          a: 'People often enrol in training right after a bad earnings shock — a temporary dip. Their earnings would have rebounded anyway, so a post-period rise is partly mean-reversion, not treatment. The trends were not parallel.' },
        { q: 'How do event-study plots probe the parallel-trends assumption?',
          a: 'They estimate the treated-vs-control gap in every period, including several pre-treatment ones. Flat pre-period coefficients are consistent with parallel trends — necessary support, though still not proof for the post-period.' },
        { q: 'Why can DiD handle an enormous fixed gap between groups?',
          a: 'The first difference (after minus before) removes anything constant within a group — including a permanent level gap. Only what changes over time survives, so DiD differences out all time-invariant confounding.' },
      ]} />

      <Deeper>
        <p>
          DiD&apos;s appeal is how little it asks: no need to measure the confounders, no need for
          overlap on covariates. The fixed gap between trainees and the workforce — the entire{' '}
          {sgn(NSW.naiveObs)} naive bias — cancels in the first difference. In exchange it bets
          everything on one untestable claim: the two groups were on the same trajectory.
        </p>
        <p>
          Modern DiD is mostly a catalogue of when that bet fails. Staggered adoption — units
          treated at different times — can make the two-way fixed-effects estimator weight some
          comparisons <em>negatively</em>, so newer estimators (Callaway-Sant&apos;Anna,
          de Chaisemartin-D&apos;Haultf&oelig;uille) rebuild it cleanly. And parallel trends can
          always be bent by a story like the <Term def="A temporary pre-program earnings dip among people who enrol in training; their natural rebound mimics a treatment effect.">Ashenfelter dip</Term> —
          which is why a credible DiD ships with an event-study plot of its pre-trends.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 13 · Regression discontinuity ---- */

const RDD_PTS = (() => {
  const rand = mulberry32(7731);
  const arr = [];
  for (let i = 0; i < 280; i++) {
    const R = rand() * 2 - 1;                       // need score, cutoff at 0
    const D = R >= 0 ? 1 : 0;
    const f = 4.0 + 1.7 * R + 2.4 * R * R * R;       // smooth, curved baseline
    arr.push({ R, D, Y: f + NSW.truthATT * D + boxMuller(rand) * 0.9 });
  }
  return arr;
})();

const RddCard = () => {
  const [bw, setBw] = useState(0.3);
  const truth = NSW.truthATT;

  const fit = useMemo(() => {
    const L = RDD_PTS.filter((p) => p.R >= -bw && p.R < 0);
    const Rt = RDD_PTS.filter((p) => p.R >= 0 && p.R <= bw);
    const lin = (a) => (a.length > 1 ? ols(a.map((p) => [1, p.R]), a.map((p) => p.Y)) : [0, 0]);
    const bl = lin(L), br = lin(Rt);
    return { jump: br[0] - bl[0], bl, br, nL: L.length, nR: Rt.length };
  }, [bw]);

  const W = 444, H = 210, PX = 40, PT = 12, PB = 26;
  const sx = (R) => PX + ((R + 1) / 2) * (W - PX - 14);
  const yLo = 0, yHi = 9;
  const sy = (Y) => PT + (1 - (Y - yLo) / (yHi - yLo)) * (H - PT - PB);
  const x0 = sx(0);
  const good = Math.abs(fit.jump - truth) < 0.55;

  return (
    <Card id="rdd" icon={LineChart} title="Regression discontinuity" accent="amber" index={13}
      source="Thistlethwaite-Campbell 1960"
      subtitle="When a sharp cutoff decides who gets treated, the units just on either side are as-good-as-randomized. The vertical jump in the outcome at the cutoff is the causal effect.">
      <MinSchema>
        Treatment flips at a threshold of a running variable: <Eq>{'D = \\mathbb{1}[R \\ge c]'}</Eq>.
        Just above and just below <Eq>{'c'}</Eq>, units are nearly identical, so{' '}
        <Eq>{'\\ca{\\hat\\tau} = \\lim_{R\\downarrow c}\\mathbb{E}[Y|R] - \\lim_{R\\uparrow c}\\mathbb{E}[Y|R]'}</Eq>.
      </MinSchema>

      <p>
        Suppose NSW admits anyone whose <em>need score</em> clears a cutoff. A worker at 0.01 above
        the line gets training; one at 0.01 below does not — and on every other trait they are
        twins. The cutoff manufactures a tiny local experiment. The treatment effect is simply how
        far the outcome <em>jumps</em> as you cross it.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          <rect x={sx(-bw)} y={PT} width={sx(bw) - sx(-bw)} height={H - PT - PB} fill="#fbbf24" fillOpacity="0.05" />
          <line x1={x0} y1={PT} x2={x0} y2={H - PB} stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
          <text x={x0} y={H - 10} fontSize="9" fill="#a1a1aa" textAnchor="middle">cutoff</text>
          {RDD_PTS.map((p, i) => (
            <circle key={i} cx={sx(p.R)} cy={sy(p.Y)} r="2.2"
              fill={p.D ? '#fbbf24' : '#7dd3fc'} fillOpacity="0.55" />
          ))}
          <line x1={sx(-bw)} y1={sy(fit.bl[0] + fit.bl[1] * -bw)} x2={x0} y2={sy(fit.bl[0])}
            stroke="#7dd3fc" strokeWidth="2.4" />
          <line x1={x0} y1={sy(fit.br[0])} x2={sx(bw)} y2={sy(fit.br[0] + fit.br[1] * bw)}
            stroke="#fbbf24" strokeWidth="2.4" />
          <line x1={x0} y1={sy(fit.bl[0])} x2={x0} y2={sy(fit.br[0])} stroke="#f0abfc" strokeWidth="3.5" />
          <circle cx={x0} cy={sy(fit.bl[0])} r="3.5" fill="#0a0a0a" stroke="#7dd3fc" strokeWidth="2" />
          <circle cx={x0} cy={sy(fit.br[0])} r="3.5" fill="#0a0a0a" stroke="#fbbf24" strokeWidth="2" />
        </svg>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#7dd3fc' }} />below cutoff · untreated</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />above cutoff · treated</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[3px]" style={{ background: '#f0abfc' }} />the jump = effect</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Bandwidth — how far from the cutoff to fit</span>
          <span className="font-mono text-amber-300">±{bw.toFixed(2)}</span>
        </div>
        <input type="range" min="0.08" max="1" step="0.01" value={bw}
          onChange={(e) => setBw(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
          <span>narrow — low bias, few points</span><span>wide — more points, curvature bias</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="RDD estimate · the jump" value={sgn(fit.jump)}
          color={good ? 'text-emerald-300' : 'text-amber-300'} sub={good ? 'clean local estimate' : 'curvature bias creeping in'} />
        <Stat label="effect at the cutoff" value={sgn(truth)} color="text-neutral-300" sub="what RDD targets" />
        <Stat label="points in window" value={fit.nL + fit.nR} color="text-amber-300" sub={`of ${RDD_PTS.length}`} />
      </div>

      <Predict question="Widen the bandwidth and the RDD estimate drifts off the truth. Why does using MORE data make it worse?">
        Because RDD trusts a <em>straight line</em> near the cutoff. Within a hair of it, any smooth
        curve looks linear — so a narrow window is nearly unbiased. Widen it and the line is fit to
        a genuinely curved relationship; the extrapolation to the cutoff inherits that curvature as
        bias. RDD&apos;s honest range is microscopic; the bandwidth is the bias-variance dial.
      </Predict>

      <Block>{'\\ca{\\hat\\tau_{\\text{RDD}}} = \\lim_{R\\downarrow c}\\mathbb{E}[Y\\mid R] - \\lim_{R\\uparrow c}\\mathbb{E}[Y\\mid R]'}</Block>

      <Misconception
        wrong="A regression discontinuity estimates the treatment effect of the program."
        right="It estimates the effect only AT the cutoff — for the marginal units. Workers far above or below the threshold may respond completely differently."
        because="Identification comes from comparing units infinitesimally close to c. Nothing in the design speaks to units elsewhere on the running variable, so RDD is local by construction."
      />

      <QA items={[
        { q: 'What separates a sharp RDD from a fuzzy one?',
          a: 'Sharp: crossing the cutoff changes treatment with certainty. Fuzzy: it only changes the PROBABILITY of treatment — so you scale the outcome jump by the treatment jump, exactly the IV/Wald ratio applied at the cutoff.' },
        { q: 'Why run a McCrary density test on the running variable?',
          a: 'If people can precisely manipulate their score to land just above the cutoff, the units on either side are no longer comparable. A jump in the DENSITY of R at the cutoff is the warning sign of that sorting.' },
        { q: 'Should you control for the running variable in an RDD?',
          a: 'You model the outcome as a smooth function of R on each side and read off the gap at the cutoff. The running variable is not a confounder to remove — its cutoff IS the source of the as-good-as-random variation.' },
      ]} />

      <Deeper>
        <p>
          RDD buys its credibility cheaply: the &ldquo;as good as random&rdquo; claim at the cutoff
          is far weaker than unconfoundedness, and it is partly checkable — covariates should not
          jump at <Eq>{'c'}</Eq>, and the density of <Eq>{'R'}</Eq> should be smooth through it.
          The price is reach. The estimate is a <Term>LATE</Term> at a single point of the running
          variable, and extending it anywhere else is extrapolation, not identification.
        </p>
        <p>
          Modern practice leans on local-linear (or local-quadratic) fits with a bandwidth chosen
          to optimize the bias-variance trade, plus robust bias-corrected confidence intervals.
          The recurring lesson holds: a method is only as good as the slice of the population its
          variation actually illuminates &mdash; for RDD that slice is razor-thin, and honest
          reporting says so.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 14 · Synthetic control ---- */

const SC = (() => {
  const rand = mulberry32(2024);
  const T = 13, intervention = 8;
  const names = ['Akron', 'Dayton', 'Flint', 'Gary', 'Toledo'];
  const bases = [52, 66, 58, 72, 62];
  const trends = [-0.5, 1.6, 0.3, -1.1, 0.8];
  const donors = names.map((name, i) => {
    const series = [];
    let noise = 0;
    for (let t = 0; t < T; t++) {
      noise += (rand() - 0.5) * 0.8;
      series.push(bases[i] + trends[i] * t + Math.sin((t + i * 1.3) * 0.7) * 1.6 + noise);
    }
    return { name, series };
  });
  const optW = [0.42, 0.0, 0.33, 0.0, 0.25];
  const effect = 3.4;
  const treated = [];
  for (let t = 0; t < T; t++) {
    let v = 0; donors.forEach((d, i) => { v += optW[i] * d.series[t]; });
    v += boxMuller(rand) * 0.28;
    if (t >= intervention) v += effect;
    treated.push(v);
  }
  return { donors, treated, optW, intervention, T, effect, names };
})();

const SynthCard = () => {
  const [raw, setRaw] = useState([0.2, 0.2, 0.2, 0.2, 0.2]);
  const sumPos = raw.reduce((s, x) => s + Math.max(0, x), 0) || 1;
  const w = raw.map((x) => Math.max(0, x) / sumPos);

  const synth = useMemo(() =>
    Array.from({ length: SC.T }, (_, t) => SC.donors.reduce((s, d, i) => s + w[i] * d.series[t], 0)),
  [w]);

  const preRMSE = Math.sqrt(mean(
    Array.from({ length: SC.intervention }, (_, t) => (SC.treated[t] - synth[t]) ** 2),
  ));
  const effectEst = mean(
    Array.from({ length: SC.T - SC.intervention }, (_, k) => SC.treated[SC.intervention + k] - synth[SC.intervention + k]),
  );

  const W = 444, H = 216, PX = 34, PT = 12, PB = 30;
  const all = [...SC.treated, ...synth, ...SC.donors.flatMap((d) => d.series)];
  const yLo = Math.min(...all) - 1, yHi = Math.max(...all) + 1;
  const sx = (t) => PX + (t / (SC.T - 1)) * (W - PX - 10);
  const sy = (v) => PT + (1 - (v - yLo) / (yHi - yLo)) * (H - PT - PB);
  const path = (s) => s.map((v, t) => `${t ? 'L' : 'M'}${sx(t)},${sy(v)}`).join(' ');
  const xInt = sx(SC.intervention);

  return (
    <Card id="synth" icon={Boxes} title="Synthetic control" accent="cyan" index={14}
      source="Abadie-Gardeazabal 2003 · Abadie-Diamond-Hainmueller 2010"
      subtitle="When treatment hits a single unit and there is no control group, build one — a weighted blend of untreated donors tuned to shadow the treated unit before the program.">
      <MinSchema>
        For a single treated unit, build its counterfactual as a weighted blend of untreated{' '}
        <Term>donor pool</Term> units, with weights <Eq>{'w_i \\ge 0,\\ \\sum w_i = 1'}</Eq> chosen
        so the blend tracks the treated unit <em>before</em> treatment. The post-treatment gap is
        the effect.
      </MinSchema>

      <p>
        Some treatments hit one unit — a city runs the training program, a country passes a law.
        There is no control group, only a <Term>donor pool</Term> of places that did nothing.
        Synthetic control builds the missing twin: tune the donor weights until the blend matches
        the treated city&apos;s pre-program path, then let it run.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          <rect x={xInt} y={PT} width={sx(SC.T - 1) - xInt} height={H - PT - PB} fill="#67e8f9" fillOpacity="0.05" />
          <line x1={xInt} y1={PT} x2={xInt} y2={H - PB} stroke="#52525b" strokeWidth="1" strokeDasharray="4 3" />
          <text x={xInt} y={H - 10} fontSize="9" fill="#a1a1aa" textAnchor="middle">program starts</text>
          {SC.donors.map((d, i) => (
            <path key={i} d={path(d.series)} fill="none" stroke="#52525b" strokeWidth="1" strokeOpacity="0.5" />
          ))}
          <path d={path(synth)} fill="none" stroke="#67e8f9" strokeWidth="2.2" strokeDasharray="5 3" />
          <path d={path(SC.treated)} fill="none" stroke="#f0abfc" strokeWidth="2.6" />
          {SC.treated.map((v, t) => t >= SC.intervention && (
            <line key={t} x1={sx(t)} y1={sy(v)} x2={sx(t)} y2={sy(synth[t])} stroke="#f0abfc" strokeOpacity="0.3" strokeWidth="3" />
          ))}
        </svg>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[3px]" style={{ background: '#f0abfc' }} />treated city</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px]" style={{ background: '#67e8f9' }} />synthetic control</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px]" style={{ background: '#52525b' }} />donor cities</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">donor weights</span>
          <button onClick={() => setRaw([...SC.optW])}
            className="text-[10px] rounded border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 px-2 py-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> snap to best pre-fit
          </button>
        </div>
        {SC.donors.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <span className="text-[11px] text-neutral-400 w-16 shrink-0">{d.name}</span>
            <input type="range" min="0" max="1" step="0.01" value={raw[i]}
              onChange={(e) => setRaw((s) => s.map((x, j) => (j === i ? +e.target.value : x)))}
              className="ci-range flex-1" />
            <span className="font-mono text-[11px] text-cyan-300 w-10 text-right">{Math.round(w[i] * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="pre-program fit · RMSE" value={preRMSE.toFixed(2)}
          color={preRMSE < 0.6 ? 'text-emerald-300' : 'text-rose-300'} sub="lower = better twin" />
        <Stat label="estimated effect" value={`${effectEst >= 0 ? '+' : '−'}${Math.abs(effectEst).toFixed(1)} pts`}
          color={preRMSE < 0.6 ? 'text-emerald-300' : 'text-rose-300'} sub="post-program gap" />
        <Stat label="true effect" value={`+${SC.effect.toFixed(1)} pts`} color="text-neutral-300" sub="employment rate" />
      </div>

      <Predict question="You tweak the weights and the post-program gap grows to +6 points. Did you just discover a bigger effect?">
        Only if the pre-program fit still holds. A synthetic control is trustworthy <em>exactly
        when</em> it shadows the treated city before the program — that match is the evidence the
        weights are right. Hit &ldquo;snap to best pre-fit&rdquo;: the RMSE collapses and the gap
        settles on the real effect. A large gap with a poor pre-fit is an artifact, not a finding.
      </Predict>

      <Block>{'w^\\star = \\arg\\min_{w\\ge 0,\\,\\sum w=1}\\ \\sum_{t<T_0}\\big(Y^{\\text{treated}}_t - \\textstyle\\sum_i w_i Y^{i}_t\\big)^2'}</Block>

      <Misconception
        wrong="Synthetic control works whenever you have a treated unit and some donors."
        right="It works only when the donors can reproduce the treated unit’s pre-treatment path. A poor pre-fit means no credible counterfactual exists."
        because="The weights are justified by the pre-period match — that is the assumption made visible. If no weighted blend tracks the treated unit before treatment, the post-period gap is not interpretable."
      />

      <QA items={[
        { q: 'Why constrain the weights to be non-negative and sum to one?',
          a: 'It forbids extrapolation — the synthetic unit stays inside the convex hull of the donors. Unrestricted regression weights could conjure a counterfactual no real city resembles.' },
        { q: 'How do you get a p-value with only one treated unit?',
          a: 'Placebo / permutation inference: pretend each donor was treated, compute its post-period gap, and build the distribution of those fake effects. The real effect is significant if it sits in the tail.' },
        { q: 'What disqualifies a donor from the pool?',
          a: 'Any donor exposed to the same treatment or to a contemporaneous shock that mimics it — that contaminates the counterfactual. Donors must be genuinely untreated and otherwise comparable.' },
      ]} />

      <Deeper>
        <p>
          Synthetic control turns the counterfactual into something you can <em>see</em>: the gap
          between two lines. Its discipline is the pre-period fit — a transparent, falsifiable
          check that an adjustment set or a parallel-trends assumption never offers. If no convex
          blend of donors tracks the treated unit before treatment, the method refuses to answer,
          which is a feature.
        </p>
        <p>
          It is <CrossLink to="did" recap="Diff-in-differences assumes the treated and control groups share a common trend.">difference-in-differences</CrossLink>{' '}
          with the comparison group chosen by the data rather than asserted — and a data-built
          control pairs naturally with placebo inference for honest uncertainty. The limits are
          real: it needs a long, stable pre-period and donors that genuinely escaped the treatment.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 15 · Double ML & causal forests ---- */

const DoubleMlCard = () => {
  const truth = NSW.truthATT;

  const dml = useMemo(() => {
    const feat = (u) => [1, ...PS_COVARS.map((k) => u[k])];
    const m0 = ols(NSW.cps.map(feat), NSW.cps.map((u) => u.y));   // outcome model on controls
    const p0 = (u) => feat(u).reduce((s, x, i) => s + x * m0[i], 0);
    const regImp = mean(NSW.nswTreated, (u) => u.y - p0(u));      // imputation part
    let corr = 0, sw = 0;                                        // propensity-weighted residual
    NSW.cps.forEach((c) => {
      const e = clamp(ps(c), 0.1, 0.9);
      const w = e / (1 - e);
      corr += w * (c.y - p0(c)); sw += w;
    });
    return { theta: regImp - corr / sw };
  }, []);

  const cate = useMemo(() => {
    const edges = [0, 1, 2, 3, 4.5, 7.5];
    const bins = [];
    for (let i = 0; i < edges.length - 1; i++) {
      const lo = edges[i], hi = edges[i + 1];
      const tr = NSW.nswTreated.filter((u) => u.re75 >= lo && u.re75 < hi);
      const ct = NSW.nswControl.filter((u) => u.re75 >= lo && u.re75 < hi);
      if (tr.length > 4 && ct.length > 4) {
        bins.push({ mid: (lo + hi) / 2, est: mean(tr, (u) => u.y) - mean(ct, (u) => u.y), n: tr.length });
      }
    }
    return bins;
  }, []);

  const trueTau = (r) => 1.8 + 0.1 * (1.5 - Math.min(9, r));
  const W = 444, H = 188, PX = 40, PT = 12, PB = 30;
  const rMax = 7.5, eLo = 0.5, eHi = 3;
  const sx = (r) => PX + (r / rMax) * (W - PX - 12);
  const sy = (e) => PT + (1 - (e - eLo) / (eHi - eLo)) * (H - PT - PB);

  return (
    <Card id="doubleml" icon={BrainCircuit} title="Double ML & causal forests" accent="emerald" index={15}
      source="Chernozhukov et al. 2018 · Wager-Athey 2018"
      subtitle="Let machine learning model the confounding flexibly — then orthogonalize so the effect estimate survives the ML’s mistakes. Causal forests push further: an effect for every covariate profile.">
      <MinSchema>
        Double ML fits two nuisance models with ML — the outcome <Eq>{'\\hat m(X)=\\mathbb{E}[Y|X]'}</Eq>{' '}
        and the propensity <Eq>{'\\hat e(X)'}</Eq> — then estimates <Eq>{'\\ca{\\theta}'}</Eq> from
        their <em>residuals</em>. Cross-fitting keeps the ML&apos;s overfitting out of the effect.
      </MinSchema>

      <p>
        Regression assumed the confounding was linear; matching binned it by hand. Double ML hands
        both nuisance functions to a flexible learner — gradient boosting, a forest — then combines
        them: an outcome model builds each trainee&apos;s counterfactual, and a propensity-weighted
        residual corrects whatever that model got wrong. The estimate is right if <em>either</em>{' '}
        piece is — and orthogonal to small errors in both.
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Stat label="double-ML estimate" value={sgn(dml.theta)}
          color={Math.abs(dml.theta - truth) < 0.5 ? 'text-emerald-300' : 'text-amber-300'} sub="orthogonalized — robust" />
        <Stat label="experimental truth" value={sgn(truth)} color="text-neutral-300" sub="the ATT" />
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
          causal forest · effect by prior earnings — CATE τ(x)
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 6 }}>
          <line x1={PX} y1={sy(eLo)} x2={W - 12} y2={sy(eLo)} stroke="#3f3f46" strokeWidth="1" />
          {[1, 2, 3].map((e) => (
            <g key={e}>
              <line x1={PX} y1={sy(e)} x2={W - 12} y2={sy(e)} stroke="#ffffff" strokeOpacity="0.05" />
              <text x={PX - 6} y={sy(e) + 3} fontSize="9" fill="#71717a" textAnchor="end">${e}k</text>
            </g>
          ))}
          {[0, 2, 4, 6].map((r) => (
            <text key={r} x={sx(r)} y={H - 14} fontSize="9" fill="#71717a" textAnchor="middle">${r}k</text>
          ))}
          <text x={(PX + W) / 2} y={H - 2} fontSize="9" fill="#a1a1aa" textAnchor="middle">prior (1975) earnings</text>
          <polyline fill="none" stroke="#6ee7b7" strokeWidth="2"
            points={Array.from({ length: 40 }, (_, i) => { const r = (i / 39) * rMax; return `${sx(r)},${sy(trueTau(r))}`; }).join(' ')} />
          {cate.map((b, i) => (
            <g key={i}>
              <circle cx={sx(b.mid)} cy={sy(b.est)} r="4" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px]" style={{ background: '#6ee7b7' }} />true effect curve τ(x)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />forest estimate, by earnings bin</span>
        </div>
      </div>
      <p className="text-sm text-neutral-400">
        The effect is not one number. Training helps the workers who earned <em>least</em> before
        it the most — the curve slopes down. A single ATT averages that away; a causal forest keeps
        it, which is what lets you target the program.
      </p>

      <Predict question="Why not just plug a great gradient-boosted outcome model straight into E[Y|D=1] − E[Y|D=0]?">
        Because a plug-in ML estimate inherits the ML&apos;s <em>regularization bias</em>. Boosting
        and forests trade a little bias for much less variance — fine for prediction, poison for a
        causal contrast. Orthogonalization plus cross-fitting cancels that bias to first order, so
        the effect estimate converges fast even though the nuisance models converge slowly.
      </Predict>

      <Block>{'\\ca{\\hat\\theta} = \\underbrace{\\tfrac1{n_1}\\!\\!\\sum_{D_i=1}\\!\\!\\big(Y_i-\\hat m_0\\big)}_{\\text{outcome model}} - \\underbrace{\\tfrac1{n_1}\\!\\!\\sum_{D_i=0}\\!\\tfrac{\\hat e}{1-\\hat e}\\big(Y_i-\\hat m_0\\big)}_{\\text{propensity correction}}'}</Block>

      <Misconception
        wrong="More flexible machine learning means more accurate causal estimates."
        right="Flexibility helps model the confounding, but a naive ML plug-in is biased. The estimator must be orthogonalized and cross-fit, or the ML’s own bias leaks into the effect."
        because="ML minimizes prediction error, accepting bias for lower variance. Causal estimation needs the opposite discipline — the Neyman-orthogonal moment is what makes ML nuisances safe to use."
      />

      <QA items={[
        { q: 'What does cross-fitting actually prevent?',
          a: 'Overfitting bias. If the same rows train the nuisance models and estimate the effect, the ML can fit noise that then contaminates θ. Cross-fitting predicts each row from a model trained on other rows.' },
        { q: 'What makes the residual-on-residual moment "orthogonal"?',
          a: 'Its sensitivity to small errors in m̂ and ê is zero to first order. So slow-converging ML nuisance estimates still yield a √n-consistent effect — the defining property of double ML.' },
        { q: 'When is the CATE worth estimating over a single ATT?',
          a: 'Whenever you will act on it — targeting a program, triaging, personalizing. If the effect is roughly constant, the ATT suffices; if it varies, the average can hide who is actually helped or harmed.' },
      ]} />

      <Deeper>
        <p>
          Double ML is the modern synthesis of this whole explainer. It needs the same
          unconfoundedness and overlap as <CrossLink to="matching" recap="Matching and weighting assume treatment is as-good-as-random given measured covariates.">matching</CrossLink>{' '}
          and <CrossLink to="ipw" recap="IPW re-weights controls by the inverse propensity score.">IPW</CrossLink>,
          and it folds in the doubly-robust idea — consistent if either nuisance model is right.
          What it adds is permission to use flexible ML for the nuisances without paying for the
          ML&apos;s bias, via the orthogonal moment and cross-fitting.
        </p>
        <p>
          Causal forests carry the same machinery down to the individual. Instead of splitting
          trees to predict <Eq>{'Y'}</Eq>, they split to maximize <em>treatment-effect
          heterogeneity</em>, returning an estimate <Eq>{'\\hat\\tau(x)'}</Eq> with valid
          confidence intervals. The catch is unchanged: heterogeneity you can <em>estimate</em> is
          still bounded by overlap — in covariate cells with no treated or no control units, no
          method, however flexible, can speak.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 16 · Mediation analysis ---- */

const MediationCard = () => {
  const total = NSW.truthATT;
  const [share, setShare] = useState(0.55); // indirect share
  const indirect = share * total;
  const direct = total - indirect;

  const nodes = [
    { id: 'D', x: 80, y: 70, label: 'D', sub: 'trained', tone: 'violet', bold: true },
    { id: 'M', x: 232, y: 70, label: 'M', sub: 'job skills', tone: 'amber', bold: true },
    { id: 'Y', x: 384, y: 70, label: 'Y', sub: 'earnings', tone: 'sky', bold: true },
  ];
  const edges = [
    { from: 'D', to: 'M', tone: 'amber', w: 1.6 + 3.4 * share, label: 'a' },
    { from: 'M', to: 'Y', tone: 'amber', w: 1.6 + 3.4 * share, label: 'b' },
    { from: 'D', to: 'Y', tone: 'emerald', w: 1.6 + 3.4 * (1 - share), curve: 58, label: "c′ direct" },
  ];

  return (
    <Card id="mediation" icon={Split} title="Mediation analysis" accent="violet" index={16}
      source="Baron-Kenny 1986 · Pearl 2001"
      subtitle="Once you know training works, the next question is how. Mediation splits the total effect into a direct channel and an indirect one that flows through a mechanism.">
      <MinSchema>
        Split the total effect: <Eq>{'\\ca{\\tau} = \\underbrace{c\'}_{\\text{direct}} + \\underbrace{a\\,b}_{\\text{indirect}}'}</Eq>.
        The indirect path runs <Eq>{'D\\to M\\to Y'}</Eq> through a <Term>mediator</Term>; the
        direct path is everything else.
      </MinSchema>

      <p>
        The training program raises earnings — but through what? Maybe it builds job skills that
        employers pay for (indirect, through <Eq>{'M'}</Eq>). Maybe it is the certificate, the
        network, the confidence (direct). Same total effect, completely different policy lessons.
        Drag the split and watch the two channels trade off.
      </p>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <CausalDAG nodes={nodes} edges={edges} height={150} />
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-300">Share of the effect flowing through job skills</span>
          <span className="font-mono text-amber-300">{Math.round(share * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={share}
          onChange={(e) => setShare(+e.target.value)} className="ci-range w-full mt-2" />
        <div className="mt-3 flex h-7 rounded overflow-hidden border border-white/10">
          <div className="bg-emerald-400/70 flex items-center justify-center" style={{ width: `${(1 - share) * 100}%` }}>
            {share < 0.85 && <span className="text-[10px] text-neutral-950 font-mono">direct {sgn(direct)}</span>}
          </div>
          <div className="bg-amber-400/70 flex items-center justify-center" style={{ width: `${share * 100}%` }}>
            {share > 0.15 && <span className="text-[10px] text-neutral-950 font-mono">indirect {sgn(indirect)}</span>}
          </div>
        </div>
        <div className="text-[10px] text-neutral-500 mt-1 text-center">
          total effect <span className="text-neutral-300 font-mono">{sgn(total)}</span> = direct + indirect, whatever the split
        </div>
      </div>

      <Predict question="Two programs both raise earnings by $1,800. In one it is 90% job skills; in the other 90% the certificate. Same effect — does the difference matter?">
        Enormously. If the gain is the <em>skills</em>, then any cheaper way to build the same
        skills should work, and the classroom hours are the active ingredient. If it is the{' '}
        <em>certificate</em>, skills training is almost beside the point — issue the credential.
        Mediation is how you tell a working mechanism from an expensive coincidence.
      </Predict>

      <Block>{'\\text{total } \\ca{\\tau} = \\underbrace{\\text{NDE}}_{\\text{natural direct}} + \\underbrace{\\text{NIE}}_{\\text{natural indirect}}, \\qquad \\text{NIE} = a \\cdot b'}</Block>

      <Misconception
        wrong="To get the direct effect, just add the mediator as a control in the regression."
        right="Conditioning on a mediator gives a ‘controlled’ effect that is biased whenever the mediator and outcome share a confounder — and they usually do."
        because="The mediator is post-treatment. Adjusting for it can also open a collider path if a hidden cause drives both M and Y. Natural direct and indirect effects need a cross-world assumption the data cannot check."
      />

      <QA items={[
        { q: 'Why is mediation harder than estimating the total effect?',
          a: 'The total effect needs treatment to be unconfounded. Mediation needs that AND the mediator to be unconfounded with the outcome — a second, usually shakier, assumption, since the mediator was never randomized.' },
        { q: 'What is the difference between a controlled and a natural direct effect?',
          a: 'The controlled direct effect fixes M at a set value for everyone. The natural direct effect holds M at the value each unit would have had untreated — a counterfactual quantity that needs cross-world assumptions to identify.' },
        { q: 'How does the front-door criterion relate to mediation?',
          a: 'It is mediation run in reverse: a fully-mediating M with no M–Y confounding lets you identify the TOTAL effect even when D itself is confounded — the same diagram, used to recover a different quantity.' },
      ]} />

      <Deeper>
        <p>
          Mediation is where causal inference gets genuinely hard. Even a perfect randomized
          experiment randomizes <Eq>{'D'}</Eq>, not <Eq>{'M'}</Eq> — so the moment you ask how the
          effect travels, you are back in observational territory for the mediator, needing it to
          be unconfounded with the outcome. The honest mediation study treats its decomposition as
          provisional and stress-tests it with sensitivity analysis.
        </p>
        <p>
          The modern framing — natural direct and indirect effects — is built on{' '}
          <em>nested counterfactuals</em>: the outcome under treatment, but with the mediator set
          to the value it would have taken under control. That object never occurs in any single
          world, which is why its identifying assumption can never be tested, only argued. It is
          the ladder&apos;s third rung in its most demanding form — and a fitting note to close the
          toolkit before the <CrossLink to="anchor" recap="The scorecard runs every estimator on the NSW data and scores it against the experimental benchmark.">scorecard</CrossLink>.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 17 · Sensitivity & untestable assumptions ---- */

const SensitivityCard = () => {
  const est = NSW.truthATT; // the toolkit estimate, ~+1.8k
  const [imb, setImb] = useState(0.35);  // imbalance of U between groups (SD units)
  const [eff, setEff] = useState(1.4);   // U's effect on earnings ($k per SD)
  const bias = imb * eff;
  const adjusted = est - bias;
  const overturned = adjusted <= 0;
  const eValue = est; // bias needed to zero it out

  const W = 444, H = 56, lo = -1, hi = 3;
  const sx = (v) => `${clamp(((v - lo) / (hi - lo)) * 100, 0, 100)}%`;

  return (
    <Card id="sensitivity" icon={ShieldAlert} title="Sensitivity & untestable assumptions" accent="rose" index={17}
      source="Cornfield 1959 · VanderWeele-Ding 2017"
      subtitle="Every observational estimate rests on an assumption no data can check. Sensitivity analysis does not test it — it asks how strong a hidden confounder would have to be to overturn the answer.">
      <MinSchema>
        <Term>Unconfoundedness</Term> cannot be tested from data. So instead: posit an unmeasured
        confounder, give it an imbalance <Eq>{'\\delta'}</Eq> and an outcome effect{' '}
        <Eq>{'\\gamma'}</Eq>, and read off the bias <Eq>{'\\bi{\\delta\\gamma}'}</Eq> it would
        inject. The <Term>E-value</Term> is the smallest such strength that erases the result.
      </MinSchema>

      <p>
        Matching, weighting, regression, double ML — every estimate in this explainer recovered
        the truth <em>because</em> the synthetic data was built to satisfy unconfoundedness. Real
        data never hands you that guarantee. The honest move is not to claim no confounder exists,
        but to ask: <em>how strong</em> would a hidden one need to be?
      </p>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-neutral-300">δ — how imbalanced the hidden confounder is</span>
            <span className="font-mono text-rose-300">{imb.toFixed(2)} SD</span>
          </div>
          <input type="range" min="0" max="1.5" step="0.01" value={imb}
            onChange={(e) => setImb(+e.target.value)} className="ci-range w-full mt-2" />
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-neutral-300">γ — how strongly it moves earnings</span>
            <span className="font-mono text-rose-300">${(eff * 1000).toLocaleString("en-US")}/SD</span>
          </div>
          <input type="range" min="0" max="4" step="0.05" value={eff}
            onChange={(e) => setEff(+e.target.value)} className="ci-range w-full mt-2" />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">estimate after the hidden confounder</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H + 4 }}>
          <line x1="0" y1="34" x2={W} y2="34" stroke="#3f3f46" strokeWidth="1" />
          <line x1={`${((0 - lo) / (hi - lo)) * 100}%`} y1="8" x2={`${((0 - lo) / (hi - lo)) * 100}%`} y2="44" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x={`${((0 - lo) / (hi - lo)) * 100}%`} y="54" fontSize="9" fill="#fb7185" textAnchor="middle">$0 · overturned</text>
          <line x1={sx(est)} y1="20" x2={sx(adjusted)} y2="20" stroke="#fbbf24" strokeWidth="3" />
          <circle cx={sx(est)} cy="20" r="5" fill="#0a0a0a" stroke="#6ee7b7" strokeWidth="2" />
          <circle cx={sx(adjusted)} cy="20" r="5" fill={overturned ? '#fb7185' : '#fbbf24'} stroke="#0a0a0a" strokeWidth="1.5" />
          <text x={sx(est)} y="12" fontSize="9" fill="#6ee7b7" textAnchor="middle">estimate</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="injected bias · δγ" value={`−$${Math.round(bias * 1000).toLocaleString("en-US")}`} color="text-rose-300" sub="confounder’s damage" />
        <Stat label="estimate after bias" value={sgn(adjusted)}
          color={overturned ? 'text-rose-300' : 'text-emerald-300'} sub={overturned ? 'result overturned' : 'still positive'} />
        <Stat label="E-value · bias to break it" value={`$${Math.round(eValue * 1000).toLocaleString("en-US")}`} color="text-amber-300" sub="δγ must exceed this" />
      </div>

      <Predict question="A reviewer says ‘but you didn’t measure motivation.’ Does that sink the study?">
        Not by itself. The question is quantitative: motivation would have to be <em>both</em>{' '}
        sharply imbalanced between the groups <em>and</em> a strong earnings driver — its{' '}
        <Eq>{'\\delta\\gamma'}</Eq> would have to exceed {sgn(eValue)} to zero out the effect.
        Sensitivity analysis converts a vague worry into a number you can argue about: is a hidden
        confounder <em>that</em> strong plausible, given the ones you already measured?
      </Predict>

      <Block>{'\\hat\\tau_{\\text{true}} = \\hat\\tau_{\\text{obs}} - \\bi{\\delta\\,\\gamma}, \\qquad \\text{result survives} \\iff \\bi{\\delta\\gamma} < \\hat\\tau_{\\text{obs}}'}</Block>

      <Misconception
        wrong="A balanced covariate table and a good model mean the unconfoundedness assumption is satisfied."
        right="Balance on MEASURED covariates says nothing about unmeasured ones. Unconfoundedness is fundamentally untestable — sensitivity analysis bounds the damage, it does not verify the assumption."
        because="The data contain no information about a variable you never recorded. The most an analysis can do is quantify how strong such a variable would need to be to matter — and let the reader judge plausibility."
      />

      <QA items={[
        { q: 'What exactly does an E-value tell a reader?',
          a: 'The minimum strength of association — with both treatment and outcome — that an unmeasured confounder would need to fully explain away the observed effect. A large E-value means only an implausibly strong hidden confounder could overturn it.' },
        { q: 'How do you judge whether a hidden confounder that strong is plausible?',
          a: 'Benchmark it against the confounders you DID measure. If overturning the result needs a hidden variable stronger than prior earnings — the dominant measured confounder — that is reassuring; if a weak one suffices, the estimate is fragile.' },
        { q: 'Which methods escape the need for sensitivity analysis?',
          a: 'Those not resting on unconfoundedness: a randomized experiment, or a credible instrument or discontinuity. They carry their own untestable assumptions instead — exclusion, monotonicity, no manipulation — each with its own flavor of sensitivity check.' },
      ]} />

      <Deeper>
        <p>
          Sensitivity analysis reframes the whole enterprise. An observational estimate is never
          &ldquo;the effect is {sgn(est)}.&rdquo; It is &ldquo;the effect is {sgn(est)}{' '}
          <em>if</em> there is no unmeasured confounder with <Eq>{'\\delta\\gamma'}</Eq> above{' '}
          {sgn(eValue)}.&rdquo; The conditional clause is not a footnote — it is the result. Cornfield
          made exactly this argument for smoking and lung cancer in 1959: any hidden confounder
          would have to raise cancer risk ninefold to explain the association away.
        </p>
        <p>
          This is the ladder&apos;s lesson in its final form. Every rung-2 claim from observational
          data is purchased with an assumption the data cannot audit. The mature analysis does not
          hide that — it states the assumption, bounds the consequence of its failure, and benchmarks
          the bound against what is known. Honesty about the assumption <em>is</em> the rigor.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 18 · Anchor: the LaLonde scorecard (spine) ---- */

const SCORECARD = (() => {
  const obs = NSW.obs, T = NSW.nswTreated, C = NSW.cps;
  const cov = ['re74', 're75', 'educ', 'age', 'black', 'hisp', 'married'];
  // regression
  const reg = ols(obs.map((u) => [1, u.d, ...cov.map((c) => u[c])]), obs.map((u) => u.y))[1];
  // propensity-score matching, k-NN
  const Te = T.map((u) => ({ ...u, e: ps(u) })), Ce = C.map((u) => ({ ...u, e: ps(u) }));
  let mk = 0, ms = 0;
  Te.forEach((t) => {
    const s = Ce.map((c) => ({ d: Math.abs(c.e - t.e), y: c.y })).sort((a, b) => a.d - b.d);
    if (s[0].d <= 0.08) { mk++; ms += t.y - mean(s.slice(0, 15), (x) => x.y); }
  });
  const matching = ms / mk;
  // IPW
  let sw = 0, swy = 0;
  C.forEach((c) => { const e = clamp(ps(c), 0.001, 0.999), w = e / (1 - e); sw += w; swy += w * c.y; });
  const ipw = mean(T, (u) => u.y) - swy / sw;
  // double ML / AIPW
  const feat = (u) => [1, ...cov.map((c) => u[c])];
  const m0 = ols(C.map(feat), C.map((u) => u.y));
  const p0 = (u) => feat(u).reduce((s, x, i) => s + x * m0[i], 0);
  let corr = 0, csw = 0;
  C.forEach((c) => { const e = clamp(ps(c), 0.1, 0.9), w = e / (1 - e); corr += w * (c.y - p0(c)); csw += w; });
  const dml = mean(T, (u) => u.y - p0(u)) - corr / csw;
  // difference-in-differences on re75 -> re78
  const did = mean(T, (u) => u.y - u.re75) - mean(C, (u) => u.y - u.re75);
  return [
    { id: 'naive', label: 'Naive comparison', est: NSW.naiveObs, se: 0.45, note: 'no adjustment at all' },
    { id: 'did', label: 'Difference-in-differences', est: did, se: 0.6, note: 'parallel trends fails here' },
    { id: 'reg', label: 'Regression adjustment', est: reg, se: 0.55, note: 'controls for confounders' },
    { id: 'match', label: 'Propensity-score matching', est: matching, se: 0.7, note: 'on common support' },
    { id: 'ipw', label: 'Inverse propensity weighting', est: ipw, se: 1.5, note: 'tiny effective sample' },
    { id: 'dml', label: 'Double machine learning', est: dml, se: 0.65, note: 'doubly robust' },
  ];
})();

const AnchorCard = () => {
  const truth = NSW.truthATT;
  const [guess, setGuess] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const lo = -8.5, hi = 5;
  const sx = (v) => `${clamp(((v - lo) / (hi - lo)) * 100, 0, 100)}%`;

  return (
    <Card id="anchor" icon={Target} title="Anchor: the LaLonde scorecard" accent="fuchsia" index={18} anchor
      source="LaLonde 1986 · Dehejia-Wahba 1999"
      subtitle="Every estimator, one dataset, one scoreboard. The randomized NSW experiment says training added about $1,800 a year. Which observational methods recover it — and which get fooled?">
      <MinSchema>
        The NSW experiment gives a rare luxury: a <strong className="text-emerald-200">known answer</strong>,{' '}
        <Eq>{'\\ca{\\text{ATT} \\approx +\\$1{,}800}'}</Eq>. Run each observational estimator on the
        non-experimental comparison group and score it against that benchmark.
      </MinSchema>

      <p>
        This is the test Robert LaLonde set in 1986, and it humbled the field: hand observational
        methods a comparison group drawn from the general workforce and see if they can recover the
        experiment&apos;s number. Commit to a guess, then reveal the board.
      </p>

      <div className="mt-4 rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/[0.04] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3">
          <span className="text-xs text-neutral-200">Your guess — what will the <em>best</em> observational estimate be?</span>
          <span className="font-mono text-fuchsia-300">{sgn(guess)}</span>
        </div>
        <input type="range" min="-8" max="4" step="0.1" value={guess}
          onChange={(e) => setGuess(+e.target.value)} className="ci-range w-full mt-2" />
        {!revealed && (
          <button onClick={() => setRevealed(true)}
            className="mt-2 text-[11px] rounded border border-fuchsia-400/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-200 px-2.5 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3" /> reveal the scorecard
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2.5">
              {SCORECARD.map((m) => {
                const gap = m.est - truth;
                const ok = Math.abs(gap) < 0.7;
                return (
                  <div key={m.id}>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-neutral-200">{m.label}</span>
                      <span className="text-neutral-500">
                        <span className={`font-mono ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>{sgn(m.est)}</span>
                        <span className="ml-1.5 text-[10px]">{m.note}</span>
                      </span>
                    </div>
                    <div className="relative h-5 rounded bg-white/[0.03] border border-white/5">
                      <div className="absolute top-0 bottom-0 w-px bg-emerald-300/80" style={{ left: sx(truth) }} />
                      <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-white/10"
                        style={{ left: sx(m.est - 1.96 * m.se), width: `${((2 * 1.96 * m.se) / (hi - lo)) * 100}%` }} />
                      <div className={`absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${ok ? 'bg-emerald-300' : 'bg-rose-400'}`}
                        style={{ left: sx(m.est) }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between text-[10px] text-neutral-500 pt-0.5">
                <span>−$8k</span>
                <span className="text-emerald-300">↑ experimental truth +${Math.round(truth * 1000).toLocaleString("en-US")}</span>
                <span>+$5k</span>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/[0.06] px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300 mb-1">the verdict</div>
              <p className="text-sm text-neutral-200 leading-snug">
                The naive comparison is not just wrong, it is <strong className="text-rose-200">wrong in sign</strong> —
                training looks ruinous. Yet regression, matching, and double ML, fed the same
                hopeless-looking data, claw back to within a few hundred dollars of the{' '}
                {sgn(truth)} experimental truth. The gap between {sgn(NSW.naiveObs)} and {sgn(truth)}{' '}
                was never about the program — it was confounding, and the toolkit removes it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Misconception
        wrong="The scorecard proves observational methods are basically as good as a randomized experiment."
        right="It proves they CAN be — here, because the synthetic data satisfies unconfoundedness. The methods recover the truth only when their assumptions hold."
        because="Diff-in-differences misses badly because parallel trends fails; IPW lands close but on a knife-thin effective sample. The experiment needs no such caveats — that is its enduring advantage."
      />

      <QA items={[
        { q: 'Why does difference-in-differences miss when the others succeed?',
          a: 'It does not use the covariates — it bets on parallel trends. Trainees were on a steeper earnings trajectory than the workforce, so differencing leaves a trend gap behind. Each method fails exactly when ITS assumption fails.' },
        { q: 'IPW and matching land near the truth — are they equally trustworthy here?',
          a: 'The point estimates agree, but IPW leans on a handful of high-weight controls — a tiny effective sample, wide interval. Same answer, very different fragility. Always read the uncertainty, not just the point.' },
        { q: 'What single thing makes this scorecard possible?',
          a: 'The experimental benchmark. Without a randomized answer to score against, you would never KNOW which observational estimate to trust. That is why the RCT remains the gold standard even when you cannot run one.' },
      ]} />

      <Deeper>
        <p>
          LaLonde&apos;s 1986 paper used this exact construction to argue observational methods
          could not be trusted. Dehejia and Wahba&apos;s 1999 reply showed that propensity-score
          methods, applied carefully on the region of common support, <em>did</em> recover the
          experimental estimate. Both were right: the methods work, but only with the discipline —
          checking overlap, choosing the estimand, respecting the assumptions — that the earlier
          cards built up one at a time.
        </p>
        <p>
          So the explainer closes where it began, on the <CrossLink to="ladder" recap="Association, intervention, counterfactual — three rungs, each needing an assumption to climb.">ladder of causation</CrossLink>.
          Every estimate on this board is a rung-2 claim reached from rung-1 data, and each bought
          the climb with a different assumption: unconfoundedness, parallel trends, a valid
          instrument, a clean discontinuity. The scorecard does not crown one method. It shows that
          causal inference is the disciplined art of choosing an assumption you can defend — and
          being honest about what happens if it fails.
        </p>
      </Deeper>
    </Card>
  );
};
const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" accent="violet" index={19}
    subtitle="Where the causal toolkit goes from here — sibling explainers in this sandbox and the threads this survey deliberately left loose.">
    <p>
      Three moves, start to finish. The <CrossLink to="ladder" recap="Association, intervention, counterfactual — and no rung-1 data answers a rung-2 question.">ladder of causation</CrossLink>{' '}
      named the problem: prediction is not intervention. The toolkit — randomization, DAGs,
      matching, weighting, instruments, discontinuities, double ML — gave one way after another to
      climb from rung-1 data to a rung-2 claim. And the{' '}
      <CrossLink to="anchor" recap="Every estimator scored against the +$1,800 experimental benchmark.">LaLonde scorecard</CrossLink>{' '}
      held them all to a known answer. The throughline never changed: every method buys the climb
      with an assumption, and the craft is choosing one you can defend.
    </p>

    <NextSteps groups={[
      {
        title: 'Sibling explainer',
        note: 'the same lens, inside a working model',
        items: [
          { label: 'The Forecaster’s Craft — the causal-lens card', href: '/#forecasters-craft',
            note: 'A quantitative football model with a confounder-toggle DAG: causal thinking applied where the goal is normally pure prediction. This explainer is the full treatment of that one card.' },
          { label: 'The Bettor’s Stack — walk-forward validation', href: '/#bettors-stack',
            note: 'Time-respecting cross-validation and leakage — the deployment cousin of getting a causal estimate to survive contact with real decisions.' },
        ],
      },
      {
        title: 'Threads left loose',
        note: 'where a second pass would go deeper',
        items: [
          { label: 'Panel & staggered-adoption diff-in-diff',
            note: 'Two-way fixed effects, the negative-weights problem, and the Callaway-Sant’Anna / de Chaisemartin estimators that repair it.' },
          { label: 'Partial identification & bounds',
            note: 'When point identification fails, Manski-style bounds report the range of effects the data and weak assumptions still permit.' },
          { label: 'Heterogeneous-effect policy learning',
            note: 'From estimating the CATE to acting on it — optimal treatment rules, policy trees, and who to treat under a budget.' },
          { label: 'Causal discovery',
            note: 'This explainer assumed the DAG. Learning graph structure from data — PC, GES, NOTEARS — is the harder inverse problem.' },
        ],
      },
    ]} />

    <div className="mt-5 border-l-4 border-violet-400/50 pl-4 py-1">
      <Quote className="w-4 h-4 text-violet-300 mb-1" />
      <p className="text-sm text-neutral-200 italic leading-snug">
        Correlation does not imply causation — but it does not forbid it either. The whole of this
        explainer is the disciplined work of telling which one you are looking at.
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
        <span className="text-violet-300">Rubin 1974 · Pearl 2009</span>
        <span className="text-emerald-300">LaLonde 1986 · Dehejia-Wahba 1999</span>
        <span className="text-amber-300">Angrist-Pischke 2009</span>
        <span className="text-cyan-300">Imbens-Rubin 2015 · Hernán-Robins 2020</span>
      </div>
      <p className="max-w-xl mx-auto">
        The NSW figures are synthetic but calibrated to the published LaLonde / Dehejia-Wahba
        pattern: a strongly negative naive observational gap and an experimental ATT near $1,800.
        Sibling explainer in this sandbox: <em>The Forecaster&apos;s Craft</em> (causal-lens card).
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function CausalInferenceExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].ci-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].ci-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(196,181,253,0.4);
        }
        input[type=range].ci-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <LadderCard />
        <PotentialCard />
        <ConfoundingCard />
        <DoOperatorCard />
        <BackdoorCard />
        <RctCard />
        <SelectionCard />
        <MatchingCard />
        <RegressionCard />
        <IpwCard />
        <IvCard />
        <DidCard />
        <RddCard />
        <SynthCard />
        <DoubleMlCard />
        <MediationCard />
        <SensitivityCard />
        <AnchorCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
