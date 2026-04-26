import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, BarChart3, BrainCircuit, ChevronDown,
  CheckCircle2, Compass, Crosshair, Eye, EyeOff, FlaskConical,
  Gauge, GitBranch, Globe2, HelpCircle, Hourglass, Layers,
  Lightbulb, LineChart, Link2, Map, Network, Quote, Rocket,
  Ruler, ScrollText, ShieldAlert, Shield, Sigma, Sparkles, Star,
  Telescope, TrendingDown, TrendingUp, Triangle, Workflow, Waves,
  XCircle, Zap, MountainSnow, Anchor as AnchorIcon, Wind,
  Boxes, Footprints, Cloud, RefreshCw, Coins, Umbrella,
} from 'lucide-react';

/* ============================================================================
   Decision-making under deep uncertainty — Knight, Taleb, RDM, DAPP, real options
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber
  '\\hi':  '\\textcolor{##fb7185}{#1}',  // rose
  '\\co':  '\\textcolor{##7dd3fc}{#1}',  // sky
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',  // emerald
  '\\vi':  '\\textcolor{##c4b5fd}{#1}',  // violet
  '\\fu':  '\\textcolor{##f0abfc}{#1}',  // fuchsia
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

// --- Glossary + Term --------------------------------------------------------

const GLOSS = {
  // Foundations
  'Knightian uncertainty': 'Frank Knight (1921): "uncertainty" = situations where probabilities can\'t be specified, vs "risk" = situations where they can. The defining concept for everything that follows.',
  'risk': 'Quantifiable uncertainty — outcomes have known or estimable probability distributions. Stock returns, dice rolls, insurance.',
  'uncertainty': 'In the Knight sense — outcomes whose probabilities cannot be specified meaningfully. AMOC collapse, AI takeover, novel pandemics.',
  'ambiguity': 'A weaker cousin of Knightian uncertainty: probabilities exist but are themselves uncertain (a distribution over distributions). Ellsberg paradox is the canonical example.',
  // Tails
  'fat tails': 'Probability distributions whose tails decay slower than exponential — power laws, Pareto, Cauchy. The "tail" carries non-negligible mass; rare events drive the average.',
  'Mediocristan': 'Taleb\'s name for the thin-tailed regime — heights, weights, IQs. Sample averages converge fast; one observation can\'t change the headline.',
  'Extremistan': 'Taleb\'s name for the fat-tailed regime — wealth, war casualties, pandemic deaths, market crashes. Sample averages are dominated by extreme outliers; one observation can change the headline.',
  'antifragility': 'Taleb\'s term for systems that <em>gain</em> from volatility and stressors, beyond mere resilience. A muscle is antifragile; a glass cup is fragile; a rock is resilient.',
  'power law': 'Distribution of form P(X > x) ∝ x^{-α}. Mean exists only if α > 1; variance only if α > 2. Many real-world fat-tail distributions have α ∈ (1, 2) — finite mean, infinite variance.',
  // Scenario planning
  'scenario planning': 'A method (Wack/Schwartz/Shell, 1970s) that constructs 2-4 internally consistent narratives about the future, then stress-tests strategies against each. Ignores probabilities by design.',
  '2x2 scenario matrix': 'The most-used scenario tool — pick the two most uncertain critical drivers, cross them, get four scenarios. Forces structural variety, not gradient on a single axis.',
  'plausibility': 'In scenario planning: a scenario is <em>plausible</em> if it doesn\'t violate physics or known constraints. Probability is deliberately not assigned.',
  // Monte Carlo
  'Monte Carlo': 'Sampling-based simulation: draw N realizations from input distributions, propagate through a model, study output distribution. Named for the casino, not the place.',
  'joint distribution': 'The distribution of multiple variables together — captures correlations and dependence. The hardest part of Monte Carlo: getting the joint structure right, not the marginals.',
  'copula': 'A function that links marginal distributions into a joint distribution. Lets you separately specify "what is the distribution of each variable" and "how do they depend on each other".',
  // RDM
  'RDM': 'Robust Decision-Making (RAND, Lempert et al.). Find policies that perform "well enough" across many futures — robustness, not optimality. Specifically rejects single-probability framing.',
  'robustness': 'Performance across a wide range of futures. A robust strategy underperforms the optimal in any one future but performs well across all plausible ones.',
  'vulnerabilities': 'In RDM: combinations of futures (parameter values) where a candidate strategy fails. Discovered by computational sampling + classification (PRIM, CART).',
  'PRIM': 'Patient Rule Induction Method — a box-finding algorithm used in RDM to identify which combinations of input parameters lead to bad outcomes for a candidate policy.',
  // Real options
  'real options': 'Treat strategic decisions as financial options. Investment opportunities have an option value: when uncertainty + irreversibility intersect, waiting has positive expected value.',
  'irreversibility': 'A decision that can\'t be cheaply undone — building a nuclear plant, evacuating a coastal city, dropping a bomb. Combined with uncertainty, generates option value of waiting.',
  'option value of waiting': 'The expected gain from postponing an irreversible decision until uncertainty resolves. Positive when option to wait exists; can be calculated via Dixit-Pindyck.',
  'Dixit-Pindyck': 'Investment Under Uncertainty (1994) — the canonical reference for real options. Solves the optimal investment trigger as a function of uncertainty, irreversibility, and discount rates.',
  // DAPP
  'DAPP': 'Dynamic Adaptive Policy Pathways (Haasnoot et al., Dutch Delta Programme). A pre-committed branching plan: actions and triggers; switch pathway when triggers fire.',
  'tipping point': 'In DAPP: a level of an exogenous variable (e.g. sea-level rise) at which a current strategy stops working and a switch is required.',
  'adaptation tipping point': 'Same as tipping point in adaptation contexts — the moment current measures (a 4m seawall) become inadequate and the next pathway must be adopted.',
  // Decision criteria
  'minimax': 'Decision rule: pick the action whose worst-case outcome is least bad. Implicitly assumes nature is adversarial. Conservative; ignores middle and best-case.',
  'maximin': 'Synonym for minimax-payoff: pick the action whose worst-case payoff is highest. Wald (1950).',
  'maximax': 'Pick the action whose best-case is best. The opposite of maximin — for optimists.',
  'minimax regret': 'Savage (1951): pick the action whose worst <em>regret</em> (gap from the best you could have done) is smallest. Often gives more reasonable answers than minimax.',
  'Hurwicz criterion': 'Weighted average of best-case and worst-case, with weight α called the "optimism index". α=0 → maximin; α=1 → maximax. The α is itself an admission of partial uncertainty.',
  'Laplace criterion': 'Treat all states of the world as equally likely (the "principle of insufficient reason") and maximize expected value. Reasonable when you really know nothing.',
  // Operational
  'hedging': 'Taking a position that reduces exposure to specific outcomes. Currency hedge, fuel hedge, insurance — pay to cap downside.',
  'redundancy': 'Multiple independent paths to the same goal — N+1, 2N, multi-region, multi-supplier. Cost-multiplied resilience; the operational answer to fat tails.',
  'optionality': 'The right but not obligation. Maintaining flexibility to act later when you know more. The operational expression of "option value of waiting".',
  'precautionary principle': 'When potential harm is large and uncertainty is deep, the burden of proof shifts to those proposing the action, not those opposing it. Controversial; widely used in EU regulation.',
  // Anchor: sea-level
  'SLR': 'Sea-Level Rise — global mean and local relative; 2025–2100 projections range from 0.3m (low) to 2.0m+ (high) depending on emissions and ice-sheet behavior.',
  'AMOC': 'Atlantic Meridional Overturning Circulation — the Atlantic ocean conveyor; weakening ~15% since 1950. Tipping behavior is unsettled; if it collapses, NW Europe cools and US East Coast SLR accelerates ~30 cm.',
  'IPCC': 'Intergovernmental Panel on Climate Change — UN body assessing the science. AR6 (2021) is the current reference; SSP scenarios are its standardized futures.',
  'SSP': 'Shared Socioeconomic Pathways — five scenarios (SSP1 sustainability → SSP5 fossil-fueled development) used in IPCC AR6 to span socioeconomic uncertainty.',
  'Delta Programme': 'Dutch national climate adaptation programme, launched 2008. Prototype of large-scale adaptive policy planning. Originated DAPP.',
  'managed retreat': 'Adaptation strategy: deliberately move people, infrastructure, and ecosystems away from the coastline. Politically toxic; fiscally cheaper long-run than indefinite defense.',
  'storm surge': 'Temporary rise in sea level due to a storm — wind setup + low pressure + tide. Key driver of acute flood damage; rises with mean SLR by simple addition.',
  'King tide': 'The highest astronomical tides of the year — extreme high water that already floods Miami streets several times annually, before any storm.',
  'Miami Beach pumps': 'Miami Beach\'s $400M pump-and-elevate program (2014→), pumping streets dry during king tides. Adaptation under deep uncertainty; effectiveness debated for >2050.',
  // Cone
  'cone of uncertainty': 'Visualization of forecasts diverging with horizon, often plotted as percentile fan charts. NHC hurricane forecasts are the most-public example.',
  'fan chart': 'Visualization of a forecast distribution: central path with widening percentile bands. Bank of England GDP / inflation forecasts popularized the form.',
  // Boundary
  'frequentist': 'Probability = long-run frequency. Requires repeatable experiments; under deep uncertainty, this assumption fails — there\'s no second 21st century.',
  'Bayesian': 'Probability = degree of belief. Doesn\'t require repeatability, but does require a prior — and under deep uncertainty, priors are themselves contested.',
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
            <div className="text-neutral-200 leading-snug" dangerouslySetInnerHTML={{ __html: definition }} />
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

const CrossLink = ({ to, children, recap, target }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    // If the resolved id matches an in-page section, scroll locally.
    // Otherwise let the browser change the hash so the App router can
    // pick up a sibling explainer (e.g. target="#superforecasting").
    const id = (target ?? `#${to}`).replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <>
      <a
        href={target ?? `#${to}`}
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

const FogField = () => {
  // Slowly drifting fog blobs — evokes "you can't see the future"
  const blobs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: (i * 13) % 100, y: (i * 21) % 100, r: 60 + (i % 4) * 30, dur: 18 + i * 3,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none">
      {blobs.map((b, i) => (
        <motion.circle
          key={i}
          cx={`${b.x}%`} cy={`${b.y}%`} r={b.r}
          fill={i % 2 === 0 ? '#a5b4fc' : '#67e8f9'}
          fillOpacity="0.12"
          initial={{ opacity: 0 }}
          animate={{ cx: [`${b.x}%`, `${(b.x + 50) % 100}%`, `${b.x}%`], opacity: [0, 0.4, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-cyan-500/5 to-transparent" />
    <FogField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20">
          <Cloud className="w-3.5 h-3.5" /> deep uncertainty · the limits of probability
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-cyan-100 to-violet-200 bg-clip-text text-transparent">
          Deep Uncertainty
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          When probabilities themselves don't apply: Knight, fat tails, scenario planning, RDM, real options, adaptive pathways. Anchored on a real <span className="text-cyan-300 font-mono">$X-billion</span> dilemma — Miami sea-level adaptation through 2070.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-rose-300">knightian</span>
          <span className="text-amber-300">fat tails</span>
          <span className="text-violet-300">scenarios</span>
          <span className="text-emerald-300">RDM</span>
          <span className="text-orange-300">DAPP</span>
          <span className="text-fuchsia-300">miami 2030–2070</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'knight',     label: 'Risk vs uncertainty', icon: Triangle },
  { id: 'tails',      label: 'Fat tails',           icon: TrendingUp },
  { id: 'cone',       label: 'Cone of uncertainty', icon: Hourglass },
  { id: 'scenarios',  label: 'Scenario planning',   icon: Map,           anchor: true },
  { id: 'montecarlo', label: 'Monte Carlo',         icon: Sigma },
  { id: 'rdm',        label: 'Robust DM',           icon: Shield },
  { id: 'options',    label: 'Real options',        icon: GitBranch },
  { id: 'dapp',       label: 'Adaptive pathways',   icon: Footprints },
  { id: 'criteria',   label: 'Decision criteria',   icon: Crosshair },
  { id: 'operational',label: 'Hedging · redundancy',icon: Umbrella },
  { id: 'anchor',     label: 'Anchor: Miami 2070',  icon: MountainSnow,  anchor: true },
  { id: 'boundary',   label: 'Where each fails',    icon: AlertTriangle },
  { id: 'trails',     label: 'Next trails',         icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-100' : 'border-transparent text-neutral-400'}`}>
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
   01 — RISK vs UNCERTAINTY (the Knight distinction)
   ========================================================================== */

const KNIGHT_EXAMPLES = [
  { type: 'risk', label: 'Coin flip', desc: 'P(heads) = 0.5. Known distribution, repeatable.', icon: Activity, color: 'sky' },
  { type: 'risk', label: 'Card poker hand', desc: 'Combinatorics give exact probabilities.', icon: Activity, color: 'sky' },
  { type: 'risk', label: 'Auto insurance pricing', desc: 'Decades of frequency data; classical actuarial science.', icon: Activity, color: 'sky' },
  { type: 'risk', label: 'Stock return next month', desc: 'Approximately quantifiable; arguable but estimable distributions.', icon: Activity, color: 'cyan' },
  { type: 'ambiguous', label: 'Stock return in 2050', desc: 'Distributions exist but are themselves uncertain — "ambiguity".', icon: AlertTriangle, color: 'amber' },
  { type: 'ambiguous', label: 'Next-pandemic IFR', desc: 'You have priors but no consensus distribution.', icon: AlertTriangle, color: 'amber' },
  { type: 'uncertain', label: 'AMOC collapse by 2100', desc: 'No agreed probability — competing models, no analog.', icon: ShieldAlert, color: 'rose' },
  { type: 'uncertain', label: 'Effects of AGI on labor', desc: 'No prior; outcome space disputed; deeply Knightian.', icon: ShieldAlert, color: 'rose' },
  { type: 'uncertain', label: 'Geopolitical realignment 2050', desc: 'Reflexivity, agency, novelty — probabilities don\'t apply.', icon: ShieldAlert, color: 'rose' },
];

const KnightCard = () => {
  const [hover, setHover] = useState(null);
  return (
    <Card id="knight" icon={Triangle} title="Risk vs uncertainty · the Knight distinction" subtitle="The first move when probabilities don't apply: admit it, then choose tools that don't require them" accent="rose" index={1}>
      <MinSchema>
        <Term>Risk</Term>: outcomes have known or estimable probability distributions. <Term>Uncertainty</Term> (Knightian): no probability distribution can be specified meaningfully. Different toolkits — using risk-tools on Knightian problems is the most common error in modern decision-making.
      </MinSchema>

      <p>
        Frank Knight's 1921 distinction in <em>Risk, Uncertainty, and Profit</em>: not every situation where you don't know the outcome is mathematically the same. There are situations where the probability distribution is known or estimable (<em>risk</em>) — and situations where any specified probability is arbitrary (<em>uncertainty</em>). Pretending the second is the first — by assigning fake probabilities to be able to use risk-tools — produces confidently wrong answers.
      </p>

      <Block>{`\\text{decision under } \\co{\\text{risk}}: \\quad \\max_a \\sum_s \\co{P(s)} \\cdot u(a, s) \\\\ \\text{decision under } \\hi{\\text{uncertainty}}: \\quad ???`}</Block>

      <p>
        The expected-utility framework collapses when <Eq>{'P(s)'}</Eq> doesn't exist. The rest of this explainer is about what to do instead.
      </p>

      {/* Spectrum chart */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300">spectrum from quantifiable to deep</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3 text-[10.5px]">
          <div className="rounded border border-sky-400/25 bg-sky-400/5 p-2">
            <div className="flex items-center gap-1.5 mb-1"><Activity className="w-3 h-3 text-sky-300" /><span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">risk</span></div>
            <div className="text-neutral-200 font-semibold mb-0.5">Distribution known</div>
            <div className="text-neutral-400 leading-snug">Use expected utility, Bayes, frequentist statistics. The textbook recipe works.</div>
          </div>
          <div className="rounded border border-amber-400/25 bg-amber-400/5 p-2">
            <div className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3 h-3 text-amber-300" /><span className="text-[9px] uppercase tracking-[0.2em] text-amber-300">ambiguity</span></div>
            <div className="text-neutral-200 font-semibold mb-0.5">Distribution disputed</div>
            <div className="text-neutral-400 leading-snug">Use ranges, sensitivity analysis, robust Bayes. The recipe needs robustification.</div>
          </div>
          <div className="rounded border border-rose-400/25 bg-rose-400/5 p-2">
            <div className="flex items-center gap-1.5 mb-1"><ShieldAlert className="w-3 h-3 text-rose-300" /><span className="text-[9px] uppercase tracking-[0.2em] text-rose-300">uncertainty</span></div>
            <div className="text-neutral-200 font-semibold mb-0.5">No distribution exists</div>
            <div className="text-neutral-400 leading-snug">Use scenarios, RDM, real options. Probabilities are abandoned.</div>
          </div>
        </div>

        <div className="space-y-1">
          {KNIGHT_EXAMPLES.map((ex, i) => {
            const Icon = ex.icon;
            return (
              <div
                key={i}
                onMouseEnter={(e) => setHover({ ...ex, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHover({ ...ex, mx: e.clientX, my: e.clientY })}
                onMouseLeave={() => setHover(null)}
                className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center text-[11px] cursor-help rounded px-2 py-1 hover:bg-white/[0.02]`}
              >
                <Icon className={`w-3.5 h-3.5 ${chipPalette[ex.color].split(' ')[1]}`} />
                <div className="text-neutral-200">{ex.label}</div>
                <span className={`text-[9px] uppercase tracking-wider ${chipPalette[ex.color].split(' ')[1]} font-mono`}>
                  {ex.type === 'risk' ? 'risk' : ex.type === 'ambiguous' ? 'ambiguous' : 'deep uncertainty'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className={`text-[10px] uppercase tracking-widest ${chipPalette[h.color].split(' ')[1]}`}>{h.type}</div>
          <div className="text-neutral-200 leading-snug mt-1">{h.desc}</div>
        </div>
      )} />

      <Misconception
        wrong="With enough Bayesian sophistication, every problem becomes a risk problem — just put a prior on it."
        right="Priors require a sample space and a probability over it. For deep uncertainty, the sample space itself is contested ('what counts as AMOC collapse?'). A prior here isn't honest math; it's a private opinion in math notation."
        because="The Bayesian-vs-Knight argument has been live for a century. Pragmatic synthesis: Bayesian reasoning works when the sample space is uncontroversial AND priors are defensible. When either fails, you're in Knight territory and need different tools."
      />

      <Predict question="Which is harder for an insurance company: pricing flood policies in 2026 vs 2070?">
        2070 — by a lot. 2026 is risk: actuarial tables, recent claims, well-modeled drivers. 2070 is uncertainty: SLR depends on ice-sheet behavior with no analog data, multi-decadal compound flood frequency depends on hurricane intensification (poorly understood), and the human-built environment in 2070 is itself uncertain. Most large insurers have stopped writing 30-year policies on US coastal property — implicitly recognizing they crossed from risk to uncertainty.
      </Predict>

      <Deeper>
        <p>
          <strong>Why this distinction is operationally radical.</strong> Modern finance, public policy, and ML/AI risk discourse all run on the assumption that uncertainty is just risk-with-noise. When the assumption fails (climate, pandemics, AI capabilities), the recommendations from risk-frameworks are systematically biased toward action that ignores tail outcomes — because the tools were built assuming the tail behaves like the body. Knight's 1921 warning has never gone away; the field has just routinely ignored it.
        </p>
        <p>
          <strong>The Ellsberg paradox · ambiguity is not risk-with-extra-steps.</strong> Daniel Ellsberg (1961) showed that people <em>systematically prefer</em> known probabilities to unknown ones, even when the unknown might be more favorable in expectation. The preference cannot be rationalized inside a single-prior expected-utility framework. This launched the formal study of ambiguity aversion (Schmeidler, Gilboa) — modern decision theory still grapples with it.
        </p>
        <p>
          <strong>The "knowable in principle" red herring.</strong> A common defense of probabilities-everywhere: "in principle, probabilities exist; we just don't know them yet." Maybe — but the principle doesn't help operationally. If the only honest probability you can write is "between 0 and 1," any decision-relevant distinction has been lost. Operational deep uncertainty is the regime where the honest range is too wide to act on with risk-tools alone.
        </p>
        <p>
          <strong>Why this matters for{' '}<CrossLink to="superforecasting" target="#superforecasting" recap="Judgmental forecasting (A): how humans give probabilities to discrete events. Toolkit: calibration, base rates, Fermi-izing, Bayesian updating.">judgmental forecasting (A)</CrossLink></strong> and <CrossLink to="statistical-forecasting" target="#statistical-forecasting" recap="Statistical/ML forecasting (B): time series, regression, prediction intervals. Toolkit: ETS, ARIMA, Prophet, GBM, conformal.">statistical forecasting (B)</CrossLink>. A and B both produce probabilities — calibrated ones, ideally. They work in the risk regime and the ambiguity regime. They <em>break</em> when the underlying process is so structurally novel that calibration itself is meaningless. C is the toolkit you reach for at that boundary, where giving a number would be misleading.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is my decision risk or uncertainty?', a: `Three diagnostics. (1) Could a competent expert give you a defensible distribution? If "no consensus" — it's past risk. (2) Is there meaningful precedent / repeatability? If "this hasn't happened before" — it's past risk. (3) Are the outcomes you care about themselves contested? If "we don't agree what counts as success" — deep uncertainty.` },
        { q: 'Should I put a number on it anyway, just to start?', a: `Sometimes useful — but report it as a sensitivity, not as a probability. "If P(catastrophe) = 1%, the EV calc says X; if P = 10%, it says Y; if P = 50%, Z." That's honest. A single number disguising the underlying uncertainty range is the trap.` },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — FAT TAILS · MEDIOCRISTAN vs EXTREMISTAN
   ========================================================================== */

const FatTailsCard = () => {
  const [alpha, setAlpha] = useState(1.5);  // power-law exponent
  const [n, setN] = useState(30);  // sample size

  // Simulate samples from a Pareto(alpha) distribution
  const samples = useMemo(() => {
    let s = 12345;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const out = [];
    for (let i = 0; i < n; i++) {
      // inverse CDF of Pareto: x = (1 - U)^(-1/α), with x_min = 1
      const x = Math.pow(1 - rng(), -1 / alpha);
      out.push(x);
    }
    return out;
  }, [alpha, n]);
  const sampleMean = samples.reduce((s, v) => s + v, 0) / samples.length;
  const sampleMax = Math.max(...samples);
  const maxShare = sampleMax / samples.reduce((s, v) => s + v, 0);
  const trueMean = alpha > 1 ? alpha / (alpha - 1) : Infinity;

  // Compare Pareto(alpha) and Normal(mean, sd) tails
  const W = 620, H = 230, P = 32;
  const xmax = 8, ymax = 1.0;
  const sx = (x) => P + (x / xmax) * (W - 2 * P);
  const sy = (y) => H - P - (y / ymax) * (H - 2 * P);
  const paretoPath = (() => {
    const pts = [];
    for (let xi = 1; xi <= xmax; xi += 0.05) {
      const pdf = alpha * Math.pow(xi, -(alpha + 1));
      pts.push(`${sx(xi)},${sy(Math.min(pdf, ymax))}`);
    }
    return 'M ' + pts.join(' L ');
  })();
  const normalPath = (() => {
    const mu = 2.5, sigma = 0.7;
    const pts = [];
    for (let xi = 0; xi <= xmax; xi += 0.05) {
      const pdf = Math.exp(-((xi - mu) ** 2) / (2 * sigma ** 2)) / (sigma * Math.sqrt(2 * Math.PI));
      pts.push(`${sx(xi)},${sy(Math.min(pdf, ymax))}`);
    }
    return 'M ' + pts.join(' L ');
  })();

  return (
    <Card id="tails" icon={TrendingUp} title="Fat tails · Mediocristan vs Extremistan" subtitle="When sample averages don't converge — and one observation can change the headline" accent="amber" index={2}>
      <MinSchema>
        Thin tails (<Term>Mediocristan</Term>): heights, weights, IQs. Sample averages converge fast; one observation cannot change the picture. Fat tails (<Term>Extremistan</Term>): wealth, war casualties, market crashes. Averages are dominated by extremes; one observation is the picture.
      </MinSchema>

      <p>
        Most of statistics assumes thin tails — distributions where the probability of extreme deviations decays exponentially or faster. In that world, sample mean converges to the true mean at rate <Eq>{'1/\\sqrt{n}'}</Eq>, and you can sensibly say "with 95% confidence, the average is within ε of the true mean." Many real-world processes don't behave this way.
      </p>

      <p>
        A Pareto distribution with exponent <Eq>{'\\alpha'}</Eq>:
      </p>

      <Block>{`P(X > x) = x^{-\\alpha}, \\quad x \\ge 1`}</Block>

      <p>
        has finite mean only if <Eq>{'\\alpha > 1'}</Eq>, finite variance only if <Eq>{'\\alpha > 2'}</Eq>. Many real-world fat-tail distributions live in <Eq>{'\\alpha \\in (1, 2)'}</Eq> — finite expected value, but infinite variance. The sample mean is a "valid" estimator in these regimes, but its sampling distribution is so wide it's nearly useless on small samples.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300">tail comparison · normal vs pareto</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[0.2, 0.4, 0.6, 0.8].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g.toFixed(1)}</text>
            </g>
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={H - P} x2={sx(t)} y2={H - P + 3} stroke="#525252" strokeWidth="0.5" />
              <text x={sx(t)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{t}</text>
            </g>
          ))}
          <path d={normalPath} fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeOpacity="0.85" />
          <path d={paretoPath} fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeOpacity="0.95" />
          {/* sample dots */}
          {samples.slice(0, n).map((x, i) => (
            <circle key={i} cx={sx(Math.min(x, xmax))} cy={H - P - 4} r={2.5} fill="#fbbf24" fillOpacity="0.65" />
          ))}
          <text x={W / 2} y={H - 4} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">x · log(x) might be more honest at right tail</text>
          <text x={P - 14} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${P - 14} ${H / 2})`}>density</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-300" /> Normal (Mediocristan)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-300" /> Pareto α = {alpha.toFixed(2)} (Extremistan)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-amber-300/65" /> {n} pareto samples</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">tail exponent α</span>
            <span className="font-mono text-amber-300">{alpha.toFixed(2)}</span>
          </div>
          <input type="range" min="0.8" max="3.0" step="0.05" value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="sf-range w-full" />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>α &lt; 1 (no mean)</span><span>α = 2 (no variance)</span><span>α &gt; 3 (Mediocristan-like)</span>
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">sample size n</span>
            <span className="font-mono text-amber-300">{n}</span>
          </div>
          <input type="range" min="5" max="200" step="5" value={n} onChange={(e) => setN(+e.target.value)} className="sf-range w-full" />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>5</span><span>100</span><span>200</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        <Stat label="sample mean" value={sampleMean.toFixed(2)} sub={alpha > 1 ? `vs true ${trueMean.toFixed(2)}` : 'true mean ∞'} color="text-amber-300" />
        <Stat label="sample max" value={sampleMax.toFixed(1)} sub="single largest observation" color="text-rose-300" />
        <Stat label="max share of total" value={`${(maxShare * 100).toFixed(0)}%`} sub="one observation drives the average" color={maxShare > 0.4 ? 'text-rose-300' : maxShare > 0.2 ? 'text-amber-300' : 'text-emerald-300'} />
      </div>

      <Predict question="α = 1.2, n = 30. About what fraction of the total comes from the largest single sample?">
        Typically 40–70%. With α near 1, the tail is so heavy that the largest of any moderate-sized sample dominates the sum. Increase α toward 3 and the share drops toward ~15%; reach α = 4 and you are effectively in Mediocristan, ~10% from the max. The slider lets you watch this transition.
      </Predict>

      <Misconception
        wrong="The Central Limit Theorem makes everything Gaussian eventually, so fat tails don't matter."
        right="The CLT requires finite variance. If α ≤ 2, there's no CLT — sample averages don't converge to a Gaussian, they converge to a stable distribution which is itself fat-tailed. The CLT is a Mediocristan theorem; it doesn't apply in Extremistan."
        because="Most introductions to statistics teach the CLT as universal. Taleb's point is that this hides the assumption of finite variance — which is exactly what fails in the cases where fat tails matter: wealth, market crashes, war casualties, pandemic deaths."
      />

      <Deeper>
        <p>
          <strong>The 80/20 rule is shorthand for α ≈ 1.16.</strong> Pareto's original observation (1896): 80% of Italian land owned by 20% of the population. In a Pareto distribution, the share of the top fraction <Eq>{'p'}</Eq> is approximately <Eq>{'p^{(\\alpha-1)/\\alpha}'}</Eq>. For 80/20 you need <Eq>{'\\alpha \\approx 1.16'}</Eq>; for 90/10, <Eq>{'\\alpha \\approx 1.05'}</Eq>. Many real distributions sit in this regime: city sizes, book sales, paper citations, Twitter retweets, AI-model parameter counts.
        </p>
        <p>
          <strong>Why thin-tailed thinking ruins decisions.</strong> If you size capacity using the sample-average of historical floods, and floods are fat-tailed, you will be undersized roughly 30% of the time — and the misses will be catastrophic, not graceful. Operational mitigations: (1) work in log-space, (2) use percentiles not means as the design target, (3) explicitly stress-test against scenarios at α-1 cumulative probability (the "100-year flood" at fat-tailed regime is much worse than at Gaussian regime).
        </p>
        <p>
          <strong>Black swans are about epistemology, not just statistics.</strong> Taleb's definition: a black swan is (i) outside the realm of regular expectations, (ii) carries massive impact, (iii) gets rationalized as predictable in hindsight. The third part is the trap. After 2008, "everyone knew" the housing bubble was a problem — they did not, but the post-hoc narrative says they did, which means the same lesson is unlearned again next cycle. Operational defense: write down the prediction <em>before</em> resolution and score it.
        </p>
        <p>
          <strong>Antifragility · the ladder above resilience.</strong> Resilient = survives shocks. Antifragile = improves from shocks. A muscle is antifragile (gets stronger from stress); a glass cup is fragile; a rock is resilient. For decision design: pick options that have asymmetric upside under volatility and capped downside (long options, R&D pipelines, distributed organizations). The opposite — concentrated, optimized-for-mean systems — is a fragility trap.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I know if my data is fat-tailed?', a: `Check the log-log tail. Plot empirical P(X > x) on log-log axes; if the right tail is approximately linear, you have a power law. The slope is −α. If the tail bends sharply down, you're in Mediocristan and can use Gaussian/exponential tools.` },
        { q: 'Are heights fat-tailed?', a: 'No, beautifully Gaussian. Income is fat-tailed. Wealth even more so (α ≈ 1.5). Pandemic death tolls per outbreak: very fat-tailed. War casualties per conflict: extreme fat tails (Richardson 1948). Market returns: not Gaussian (Mandelbrot 1963), arguably α ≈ 3 to 4.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — CONE OF UNCERTAINTY
   ========================================================================== */

const ConeCard = () => {
  const [model, setModel] = useState('quadratic');  // linear, quadratic, fat-tail
  const W = 620, H = 240, P = 32;
  const ymin = -10, ymax = 10;
  const xmax = 60;  // months
  const sx = (t) => P + (t / xmax) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);

  // Different uncertainty growth profiles
  const widthAt = (t) => {
    if (model === 'linear') return 0.05 * t;
    if (model === 'quadratic') return 0.015 * t * t;
    if (model === 'fat-tail') return 0.06 * Math.pow(t, 1.7);  // power-law growth, faster than quadratic in tail
    return 0;
  };

  // Build percentile bands
  const bands = [];
  for (let t = 0; t <= xmax; t++) {
    const w = widthAt(t);
    bands.push({
      t,
      p50: w * 0.674,
      p80: w * 1.282,
      p95: w * 1.96,
      p99: w * 2.576,
    });
  }

  const bandPath = (key) => {
    const top = bands.map(b => `${sx(b.t)},${sy(b[key])}`);
    const bot = bands.map(b => `${sx(b.t)},${sy(-b[key])}`).reverse();
    return 'M ' + top.join(' L ') + ' L ' + bot.join(' L ') + ' Z';
  };

  return (
    <Card id="cone" icon={Hourglass} title="The cone of uncertainty" subtitle="How predictive bands grow with horizon — and where they stop being meaningful at all" accent="sky" index={3}>
      <MinSchema>
        Forecast intervals widen with horizon. Under {`{`}thin tails{`}`} they grow as <Eq>{'\\sqrt{t}'}</Eq>; under {`{`}fat tails{`}`} they grow faster than any polynomial. Past some horizon the cone is so wide that the forecast carries no decision-relevant information — and you've crossed from{' '}<CrossLink to="statistical-forecasting" target="#statistical-forecasting" recap="Statistical forecasting (B): point + interval forecasts via decomposition, ETS, ARIMA, conformal prediction.">forecasting (B)</CrossLink>{' '}into deep uncertainty (this explainer).
      </MinSchema>

      <p>
        Long-horizon forecasts produce wider and wider prediction intervals; this is the <Term>cone of uncertainty</Term>, made famous by NHC hurricane track forecasts. Three regimes:
      </p>

      <Block>{`\\text{interval width at horizon } t \\;\\propto\\; \\begin{cases} \\sqrt{t} & \\text{thin-tailed (Gaussian, AR(1))} \\\\ t^\\alpha,\\; \\alpha > 1/2 & \\text{moderate fat tails} \\\\ \\text{infinite} & \\text{after a structural break / regime change} \\end{cases}`}</Block>

      <p>
        Under thin tails, doubling the horizon multiplies interval width by <Eq>{'\\sqrt{2} \\approx 1.41'}</Eq>. Under fat tails (or poorly understood mechanisms like ice-sheet dynamics), doubling can multiply width by 3, 5, or more. The "cone" stops being a useful forecast and becomes a confession of ignorance.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Cloud className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">cone shape · choose growth model</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[
            { k: 'linear',    label: 'Linear · width ∝ t',          color: 'emerald' },
            { k: 'quadratic', label: 'Quadratic · width ∝ t²',     color: 'sky' },
            { k: 'fat-tail',  label: 'Fat-tail · width ∝ t^1.7',   color: 'rose' },
          ].map(s => (
            <button
              key={s.k}
              onClick={() => setModel(s.k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${model === s.k ? `${chipPalette[s.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* axes */}
          <line x1={P} y1={sy(0)} x2={W - P} y2={sy(0)} stroke="#525252" strokeWidth="0.6" strokeDasharray="2 3" />
          {[10, 20, 30, 40, 50, 60].map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={H - P} x2={sx(t)} y2={H - P + 3} stroke="#525252" strokeWidth="0.5" />
              <text x={sx(t)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{t}mo</text>
            </g>
          ))}
          {/* bands: 99 → 95 → 80 → 50 */}
          <path d={bandPath('p99')} fill="#7dd3fc" fillOpacity="0.08" />
          <path d={bandPath('p95')} fill="#7dd3fc" fillOpacity="0.14" />
          <path d={bandPath('p80')} fill="#7dd3fc" fillOpacity="0.22" />
          <path d={bandPath('p50')} fill="#7dd3fc" fillOpacity="0.36" />
          {/* central forecast */}
          <line x1={sx(0)} y1={sy(0)} x2={sx(xmax)} y2={sy(0)} stroke="#7dd3fc" strokeWidth="1.6" />
          {/* "useful" / "useless" annotation */}
          <line x1={sx(36)} y1={P} x2={sx(36)} y2={H - P} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth="0.8" />
          <text x={sx(36)} y={P - 4} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">past here: decision-irrelevant</text>
          <text x={P - 14} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${P - 14} ${H / 2})`}>deviation from central</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/36" /> 50% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/22" /> 80% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/14" /> 95% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/8" /> 99% PI</span>
        </div>
      </div>

      <Predict question="At what horizon do the 95% bands cross ±5 units in each model?">
        Linear (width ∝ t): around 51 months. Quadratic (∝ t²): around 18 months. Fat-tail (∝ t^1.7): around 22 months. The fat-tail model is initially indistinguishable from quadratic but blows out faster at long horizons. In real-world deep-uncertainty problems (climate, AI capability, geopolitical), the curve is often closer to fat-tail than linear — and the "useful horizon" is shorter than published forecast products suggest.
      </Predict>

      <Misconception
        wrong="A wider prediction interval always means worse forecasting."
        right="A wider interval is appropriate when the underlying uncertainty is genuinely larger. The mistake is the OPPOSITE — narrow intervals on long-horizon problems create false confidence and worse decisions."
        because="The forecaster has two failure modes: under-coverage (bands too narrow, model too confident) and useless-coverage (bands so wide nothing can be inferred). Both bad; the second is more honest. The first is what gets people in trouble."
      />

      <WhenItMatters>
        Whenever you're tempted to extrapolate a statistical forecast beyond a few seasonal cycles. Ask: at this horizon, are my 95% bands narrow enough to inform a decision and wide enough to honestly cover what I don't know? If neither, you've crossed into deep-uncertainty territory and need a different toolkit.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The Bank of England fan chart.</strong> The most-public example of a cone: BoE's quarterly inflation/GDP forecasts plotted as widening percentile bands. The bands are deliberately not labeled with specific years past 2 years out — explicit acknowledgment that point forecasts beyond that horizon are not the deliverable. The deliverable is "this is how uncertain we are; here's the range you should plan against."
        </p>
        <p>
          <strong>Why the cone breaks under regime change.</strong> The growth rate of the cone assumes the data-generating process is stationary. Under a structural break (regime change in card 02 of B), the cone you computed pre-break is meaningless — you have no information about the new regime's variance. Operational fix: maintain multiple cones from different "what if" model variants, and report the envelope across them. This is one path into scenario planning (next card).
        </p>
        <p>
          <strong>The "useful horizon" diagnostic.</strong> A simple test: at horizon h, would your 80% PI lead to a different decision than your 80% PI at horizon h/2? If no, the longer-horizon forecast is decision-irrelevant — it's wider, but the decision space is the same. The point where decision-relevance evaporates is your operational horizon limit. Often much shorter than the model's "valid" horizon.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does the cone widen as a power of t for fat-tailed processes?', a: 'In a Lévy process or fat-tailed AR(1) with infinite-variance innovations, the sum of t innovations has scale t^(1/α) for stable distributions with α < 2. So the cone width grows as t^(1/α), faster than the Gaussian sqrt(t).' },
        { q: 'Should I always extend the forecast cone to the longest horizon I can?', a: 'No. Stop the cone at the horizon where it becomes decision-irrelevant. Showing a 50-year cone with a ±$10T interval is technically honest but operationally useless and creates audience fatigue. Truncate at the useful horizon and explicitly switch to scenario planning past that.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — ★ SCENARIO PLANNING
   ========================================================================== */

const SCENARIO_AXES = {
  X: { high: 'Rapid global decarbonization', low: 'Continued fossil dependence', name: 'Emissions trajectory' },
  Y: { high: 'Stable AMOC, slow ice loss',   low: 'AMOC weakens, ice cliffs slip', name: 'Ice-sheet behavior' },
};

const SCENARIOS = [
  {
    pos: 'TR', name: 'Manageable Transition', desc: 'Strong climate policy lands; ice-sheet dynamics behave; SLR ~0.4m by 2070.', signposts: 'global emissions peak by 2028; AMOC strength stable at 14–16 Sv; West Antarctic mass loss < 200 Gt/yr',
    actions: 'incremental adaptation, status-quo coastlines, modest insurance reform',
    color: 'emerald', sl2070: 0.4,
  },
  {
    pos: 'TL', name: 'Slow Burn', desc: 'High emissions but no ice-sheet surprises; SLR ~0.7m by 2070 — the IPCC central case.', signposts: 'emissions plateau by 2035; AMOC weak but no collapse; ice-mass loss following AR6 SSP3',
    actions: 'aggressive adaptation in flood zones; managed retreat in marginal areas; insurance market consolidation',
    color: 'amber', sl2070: 0.7,
  },
  {
    pos: 'BR', name: 'Lucky Pivot', desc: 'Decarbonization fast; but ice-sheet tipping element fires; SLR ~1.0m by 2070.', signposts: 'emissions decline aggressively post-2030 BUT WAIS marine-cliff instability triggers; AMOC weakens past 11 Sv',
    actions: 'mismatch: politically successful policy, physically losing the coastline; massive Federal-level adaptation spending',
    color: 'violet', sl2070: 1.0,
  },
  {
    pos: 'BL', name: 'Compound Crisis', desc: 'High emissions AND ice-sheet tipping; SLR 1.5m+ by 2070; possibly 2m+ by 2100.', signposts: 'emissions stay high through 2040; AMOC collapse signals appear ~2050; WAIS marine ice cliff acceleration',
    actions: 'managed retreat from large parts of Miami, NOLA, Norfolk; trillion-dollar Federal program; sovereign coastal-debt restructuring',
    color: 'rose', sl2070: 1.7,
  },
];

const ScenariosCard = () => {
  const [picked, setPicked] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const W = 620, H = 380, P = 60;
  const cx = W / 2, cy = H / 2;
  const quadW = (W - 2 * P) / 2;
  const quadH = (H - 2 * P) / 2;

  return (
    <Card id="scenarios" anchor icon={Map} title="Scenario planning" subtitle="Anchor card · 4 plausible futures, no probabilities. Test strategies against each." accent="violet" index={4}>
      <MinSchema>
        <Term>Scenario planning</Term> sidesteps the probability problem entirely: build 2–4 internally consistent stories about the future on the two most uncertain critical drivers, then ask "would my strategy still work in each?" The output is a portfolio of robust actions, not a forecast.
      </MinSchema>

      <p>
        Pierre Wack's Royal Dutch Shell scenarios (1970s) anticipated the 1973 oil shock. The technique: identify two driving uncertainties whose values are deeply contested, cross them, get four scenarios, write each as a coherent narrative with named signposts, and stress-test candidate strategies against each.
      </p>

      <Block>{`\\fu{\\text{scenarios}} \\;=\\; \\co{\\text{driver}_1} \\;\\times\\; \\co{\\text{driver}_2} \\quad\\Longrightarrow\\quad 4 \\text{ stories, no probabilities}`}</Block>

      <p>
        For Miami's adaptation problem, the two drivers that matter most are <em>emissions trajectory</em> and <em>ice-sheet behavior</em> — both deeply uncertain (no probability distribution can be specified for either past 2050 in a defensible way). Cross them:
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Map className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">2×2 scenario matrix · Miami SLR 2070</span>
          <span className="text-[10px] text-neutral-500">· click any quadrant</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* axis labels */}
          <text x={cx} y={26} fontSize="11" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">{SCENARIO_AXES.Y.high}</text>
          <text x={cx} y={H - 12} fontSize="11" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">{SCENARIO_AXES.Y.low}</text>
          <text x={20} y={cy} fontSize="11" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 20 ${cy})`}>{SCENARIO_AXES.X.low}</text>
          <text x={W - 20} y={cy} fontSize="11" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${W - 20} ${cy})`}>{SCENARIO_AXES.X.high}</text>
          {/* axis lines */}
          <line x1={cx} y1={P + 4} x2={cx} y2={H - P - 4} stroke="#525252" strokeWidth="0.8" />
          <line x1={P + 4} y1={cy} x2={W - P - 4} y2={cy} stroke="#525252" strokeWidth="0.8" />
          {/* labels by scenario */}
          {SCENARIOS.map((s, i) => {
            const isTop = s.pos[0] === 'T';
            const isLeft = s.pos[1] === 'L';
            const x = isLeft ? P + quadW * 0.5 : cx + quadW * 0.5;
            const y = isTop ? P + quadH * 0.5 : cy + quadH * 0.5;
            const isPicked = picked === i;
            const colorHex = s.color === 'emerald' ? '#6ee7b7' : s.color === 'amber' ? '#fbbf24' : s.color === 'violet' ? '#c4b5fd' : '#fb7185';
            return (
              <g key={i}>
                {/* clickable quadrant */}
                <rect
                  x={isLeft ? P : cx} y={isTop ? P : cy}
                  width={quadW} height={quadH}
                  fill={isPicked ? colorHex : 'transparent'} fillOpacity={isPicked ? 0.10 : 0}
                  stroke={isPicked ? colorHex : '#404040'} strokeWidth={isPicked ? 1.2 : 0.5}
                  onClick={() => { setPicked(i); setShowActions(false); }}
                  style={{ cursor: 'pointer' }}
                />
                <text x={x} y={y - 24} fontSize="11" fill={colorHex} fontFamily="ui-monospace" textAnchor="middle" fontWeight="700">{s.name}</text>
                <text x={x} y={y - 8} fontSize="22" fill={colorHex} fontFamily="ui-monospace" textAnchor="middle" fontWeight="700">{s.sl2070.toFixed(1)}m</text>
                <text x={x} y={y + 10} fontSize="9" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">SLR by 2070</text>
              </g>
            );
          })}
        </svg>

        {picked != null && (
          <motion.div
            key={picked}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`mt-3 rounded-lg border ${chipPalette[SCENARIOS[picked].color].split(' ')[2]} bg-white/[0.02] p-3 space-y-2`}
          >
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className={`text-base font-semibold ${chipPalette[SCENARIOS[picked].color].split(' ')[1]}`}>{SCENARIOS[picked].name}</div>
              <span className={`text-[10px] uppercase tracking-wider ${chipPalette[SCENARIOS[picked].color].split(' ')[1]} font-mono`}>SLR ~{SCENARIOS[picked].sl2070.toFixed(1)}m by 2070</span>
            </div>
            <div className="text-[12px] text-neutral-200 leading-snug">{SCENARIOS[picked].desc}</div>
            <div className="text-[11px] text-neutral-400 leading-snug">
              <span className={`${chipPalette[SCENARIOS[picked].color].split(' ')[1]} mr-1.5`}>signposts to watch:</span>
              {SCENARIOS[picked].signposts}
            </div>
            <button
              onClick={() => setShowActions(v => !v)}
              className="text-[10px] rounded border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] text-neutral-200 px-2 py-1 flex items-center gap-1"
            >
              {showActions ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showActions ? 'hide' : 'reveal'} adaptation actions for this scenario
            </button>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.18 }}
                className="text-[11.5px] text-neutral-100 leading-snug border-t border-white/10 pt-2"
              >
                <span className="text-emerald-300 text-[9px] uppercase tracking-wider mr-1.5">actions:</span>
                {SCENARIOS[picked].actions}
              </motion.div>
            )}
          </motion.div>
        )}
        {picked == null && <div className="mt-3 text-[11px] text-neutral-500 italic text-center">click any quadrant to inspect the scenario</div>}
      </div>

      <Worked title="Picking the two axes — the hard part">
        <p>
          Wack's rule: the two driving axes should be (i) <em>critical</em> to the strategy, (ii) <em>uncertain</em> in the deep sense (no defensible probability), (iii) <em>independent</em> enough that all 4 quadrants are plausible. For Miami:
        </p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><strong>Emissions trajectory</strong> — fundamentally a political/economic uncertainty. The next 20 years of global policy will determine whether SSP1 or SSP5 territory.</li>
          <li><strong>Ice-sheet behavior</strong> — fundamentally a physical-science uncertainty. Marine ice-cliff instability could add 0.5–2m by 2100 if it triggers; the consensus is "don't know yet."</li>
        </ul>
        <p className="mt-2">
          Bad axes: "weather variability" (too granular), "Florida politics" (correlated with emissions, not independent), "interest rates" (matters for cost but doesn't reframe the physical problem). Good axes drive structurally different futures, not gradients along one dimension.
        </p>
      </Worked>

      <Misconception
        wrong="Scenario planning just means brainstorming a few possible futures."
        right="Scenarios must be (1) limited to 2-4, (2) internally consistent (each is a coherent narrative), (3) span the structural uncertainty (not gradients on one variable), and (4) come with named signposts you can watch in real time."
        because="Most casual 'scenario planning' produces 7-10 mood-board futures with no signposts and no decision implications. Wack's discipline is what makes scenarios operationally useful: each one defines what to watch and what to do if it materializes."
      />

      <Predict question="A robust strategy across all 4 Miami scenarios. What does it look like?">
        Probably some mix of: (1) reversible / staged actions early (pumps, codes, beach replenishment) — they hold up in all scenarios; (2) scenario-conditional actions held in reserve (managed-retreat funding, large-scale seawalls, FEMA reform) triggered by signposts; (3) explicit avoidance of irreversible bets that only work in one scenario (Manageable Transition assumes WAIS holds — don't bet the city on it). The robust strategy is dominated by <em>flexibility</em>, not optimality in any one future.
      </Predict>

      <Deeper>
        <p>
          <strong>Why no probabilities.</strong> The discipline is deliberate: assigning probabilities to scenarios reintroduces all the problems of expected-utility framing — sensitivity to the assumed weights, false precision, ranking that might invert under small shifts. Scenarios are stress tests, not draws from a distribution. A strategy is "robust" if it works in all of them, not "optimal" against probability-weighted expected outcome.
        </p>
        <p>
          <strong>Two adjacent practices · TAIDA and the Schwartz 8 steps.</strong> Schwartz's <em>The Art of the Long View</em> codified the consulting form: focal question → key forces → driving uncertainties → axis selection → flesh out scenarios → implications → metrics → revisit. TAIDA (Lindgren-Bandhold) is a related Swedish variant. Both share the structural-narrative-driven approach over probability-weighted scenarios.
        </p>
        <p>
          <strong>The "early warning" deliverable.</strong> Scenario planning's most operationally valuable output isn't the scenarios themselves — it's the signpost catalog. For each scenario you commit, in writing, to 3–5 observable signals that would tell you "we're tracking this scenario, not that one." When a signal fires, you switch your strategy parameters by a pre-specified rule. This is the bridge to{' '}<CrossLink to="dapp" recap="Dynamic Adaptive Policy Pathways — a pre-committed plan with branching points triggered by observable signals.">DAPP (card 08)</CrossLink>.
        </p>
        <p>
          <strong>Where Shell's scenarios actually came from.</strong> Wack's 1972 "high price oil" scenario was based on a structural argument — not a forecast: OPEC's bargaining position was strengthening, post-Bretton-Woods FX dynamics changed sovereign risk, and Saudi Arabia's marginal cost was disconnected from market prices. The probability he assigned: never. The decision Shell made: prepare for it. When 1973 hit, Shell was the only major positioned for the regime change. The point of scenarios isn't to predict; it's to prepare.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I add probabilities to scenarios at the end, "just for guidance"?', a: 'No — and this is a common consulting trap. Once probabilities are added, decision-makers anchor on them and re-collapse the work into expected-value reasoning. The discipline is to keep scenarios probability-free; if you need probability-weighted output, do it in a separate Monte Carlo (next card).' },
        { q: 'How often should scenarios be revisited?', a: 'When a signpost fires (data shifts), or roughly every 18-24 months even without one. Stale scenarios from 2010 are not useful in 2025. Most failures in long-horizon scenario work come from not refreshing.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — MONTE CARLO & JOINT DISTRIBUTIONS
   ========================================================================== */

// Run a Monte Carlo for "Miami adaptation NPV" with simple inputs
function runMonteCarlo(N, slMean, slSd, costMean, costSd, corr) {
  const out = [];
  let s = 9999;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = rng(); while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  for (let i = 0; i < N; i++) {
    // generate correlated bivariate normal (sl, cost)
    const z1 = randn();
    const z2 = corr * z1 + Math.sqrt(1 - corr * corr) * randn();
    const sl = slMean + slSd * z1;
    const costMul = costMean + costSd * z2;
    // damage cost grows quadratically with SLR; adaptation reduces by 60% at 2x cost
    const damage = Math.max(0, 100 * Math.pow(Math.max(sl, 0), 1.6));
    const adaptCost = costMul * 30;
    const adaptDamageReduction = 0.6;
    // Two strategies: do-nothing (just damage), adapt (cost + reduced damage)
    const doNothing = -damage;
    const adapt = -adaptCost - damage * (1 - adaptDamageReduction);
    out.push({ sl, cost: costMul, damage, doNothing, adapt });
  }
  return out;
}

const MonteCarloCard = () => {
  const [N, setN] = useState(1000);
  const [slSd, setSlSd] = useState(0.4);
  const [corr, setCorr] = useState(0.3);
  const samples = useMemo(() => runMonteCarlo(N, 0.7, slSd, 1.0, 0.3, corr), [N, slSd, corr]);
  // Distribution of "adapt - doNothing" (positive = adapt is better)
  const diffs = samples.map(s => s.adapt - s.doNothing);
  diffs.sort((a, b) => a - b);
  const median = diffs[Math.floor(diffs.length / 2)];
  const p10 = diffs[Math.floor(diffs.length * 0.10)];
  const p90 = diffs[Math.floor(diffs.length * 0.90)];
  const probAdaptBetter = diffs.filter(d => d > 0).length / diffs.length;

  const W = 620, H = 220, P = 32;
  // Histogram of diffs
  const lo = -150, hi = 80, bins = 40;
  const binW = (hi - lo) / bins;
  const counts = new Array(bins).fill(0);
  diffs.forEach(d => {
    const idx = Math.max(0, Math.min(bins - 1, Math.floor((d - lo) / binW)));
    counts[idx]++;
  });
  const maxCount = Math.max(...counts);
  const sx = (v) => P + ((v - lo) / (hi - lo)) * (W - 2 * P);
  const sy = (c) => H - P - (c / maxCount) * (H - 2 * P);

  return (
    <Card id="montecarlo" icon={Sigma} title="Monte Carlo · joint distributions" subtitle="When you can specify some distributions but not the answer — and the joint structure matters more than you'd think" accent="cyan" index={5}>
      <MinSchema>
        <Term>Monte Carlo</Term>: draw N joint samples from input distributions, propagate through a model, study the output distribution. Works in the <em>ambiguity</em> regime (you have priors), not the deep-uncertainty regime (you don't). Hardest part: the <Term>joint distribution</Term>, not the marginals.
      </MinSchema>

      <p>
        Monte Carlo bridges risk and ambiguity. You can't always know the answer, but if you can specify distributions for the inputs (even imperfectly), simulation gives you the output distribution. Caveat: this requires distributions to specify — so MC works for ambiguity but breaks under genuine Knightian uncertainty.
      </p>

      <Block>{`\\co{X_1, X_2, \\ldots, X_k} \\sim \\fu{F_{\\text{joint}}} \\quad\\Longrightarrow\\quad Y = g(X_1, \\ldots, X_k) \\quad\\text{has empirical distribution } \\hat{F}_N`}</Block>

      <p>
        For Miami adaptation: simulate <em>SLR by 2070</em> (uncertain) and <em>adaptation cost multiplier</em> (uncertain, possibly correlated with SLR), compute net-present-value of "do nothing" vs "adapt," and study the distribution of NPV-difference. Two failure modes: (1) misspecified marginals, (2) wrong correlation between inputs.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Sigma className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">N draws · NPV(adapt) − NPV(do-nothing)</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[0, 25, 50, 75, 100].map(p => (
            <g key={p}>
              <line x1={P} y1={sy(maxCount * p / 100)} x2={W - P} y2={sy(maxCount * p / 100)} stroke="#262626" strokeWidth="0.4" strokeDasharray="2 3" />
            </g>
          ))}
          {[-150, -100, -50, 0, 50].map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={H - P} x2={sx(t)} y2={H - P + 3} stroke="#525252" strokeWidth="0.5" />
              <text x={sx(t)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{t}</text>
            </g>
          ))}
          {/* zero line */}
          <line x1={sx(0)} y1={P} x2={sx(0)} y2={H - P} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x={sx(0)} y={P - 4} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">break-even</text>
          {/* histogram bars */}
          {counts.map((c, i) => {
            const x = lo + i * binW;
            return (
              <rect
                key={i}
                x={sx(x)} y={sy(c)}
                width={(W - 2 * P) / bins - 1}
                height={(H - P) - sy(c)}
                fill={x >= 0 ? '#6ee7b7' : '#fb7185'} fillOpacity="0.55"
              />
            );
          })}
          {/* percentile markers */}
          {[{ v: p10, label: 'p10', c: '#a3a3a3' }, { v: median, label: 'median', c: '#7dd3fc' }, { v: p90, label: 'p90', c: '#a3a3a3' }].map((p, i) => (
            <g key={i}>
              <line x1={sx(p.v)} y1={P} x2={sx(p.v)} y2={H - P} stroke={p.c} strokeWidth="1" />
              <text x={sx(p.v)} y={P - 4} fontSize="9" fill={p.c} fontFamily="ui-monospace" textAnchor="middle">{p.label}: {p.v.toFixed(0)}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 4} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">NPV difference (positive = adapt is better)</text>
        </svg>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">N draws</span>
            <span className="font-mono text-cyan-300">{N}</span>
          </div>
          <input type="range" min="100" max="5000" step="100" value={N} onChange={(e) => setN(+e.target.value)} className="sf-range w-full" />
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">σ(SLR by 2070), m</span>
            <span className="font-mono text-cyan-300">{slSd.toFixed(2)}</span>
          </div>
          <input type="range" min="0.05" max="0.8" step="0.05" value={slSd} onChange={(e) => setSlSd(+e.target.value)} className="sf-range w-full" />
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">corr(SLR, cost)</span>
            <span className="font-mono text-cyan-300">{corr.toFixed(2)}</span>
          </div>
          <input type="range" min="-0.8" max="0.8" step="0.05" value={corr} onChange={(e) => setCorr(+e.target.value)} className="sf-range w-full" />
          <div className="text-[10px] text-neutral-500 mt-0.5">positive = high SLR comes with high adaptation cost (rush premium)</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        <Stat label="P(adapt better)" value={`${(probAdaptBetter * 100).toFixed(0)}%`} sub="under stated joint dist." color={probAdaptBetter > 0.6 ? 'text-emerald-300' : probAdaptBetter > 0.4 ? 'text-amber-300' : 'text-rose-300'} />
        <Stat label="median NPV diff" value={`${median.toFixed(0)}`} sub="positive = adapt wins" color={median > 0 ? 'text-emerald-300' : 'text-rose-300'} />
        <Stat label="p10–p90 spread" value={`${p10.toFixed(0)} → ${p90.toFixed(0)}`} sub="80% confidence band" color="text-neutral-300" />
      </div>

      <Predict question="Crank the SLR sigma to 0.6m (i.e. wider input uncertainty). What happens to P(adapt better)?">
        It tends to <em>rise</em> toward 60-70%. Wider input uncertainty stretches the SLR distribution into the right tail (higher SLR), where damage costs explode quadratically and adaptation looks more attractive. This is a classic Monte-Carlo result: <em>adaptation is more valuable under wider tails</em>, even if the central estimate doesn't move. Conversely: insisting on tight input uncertainty understates the case for action.
      </Predict>

      <Misconception
        wrong="Monte Carlo gives the right answer if I get the marginals right."
        right="Monte Carlo gives the right answer if I get the JOINT distribution right. Marginals are usually easy; the joint structure (correlations, copulas) is where most of the error lives."
        because="Two variables can both be perfectly correctly distributed individually, but their joint distribution can be wrong by orders of magnitude in the tail. The 2008 financial crisis: marginal default probabilities were near-correct; the joint default distribution (default clustering) was catastrophically miscalibrated."
      />

      <Deeper>
        <p>
          <strong>Copulas in two minutes.</strong> A <Term>copula</Term> is a function that joins marginal distributions into a joint one. Sklar's theorem (1959): every joint distribution can be written as marginals + a copula. This lets you specify "what each variable looks like" and "how they depend on each other" separately. The Gaussian copula is the textbook default — and notoriously wrong in tails. Student-t and Clayton copulas are common alternatives that put more mass in the joint extremes.
        </p>
        <p>
          <strong>Variance reduction techniques.</strong> Naive MC needs many samples in the tail to estimate tail probabilities. Three accelerators: (1) <em>importance sampling</em> — sample from a proposal distribution that emphasizes the region you care about, then re-weight. (2) <em>antithetic variates</em> — pair each draw u with its mirror 1−u; cancels symmetric variance. (3) <em>quasi-Monte Carlo</em> — replace random draws with low-discrepancy sequences (Sobol, Halton); convergence rate improves from 1/√N to ~1/N for smooth integrands.
        </p>
        <p>
          <strong>The MC tail-uncertainty trap.</strong> An MC with 1,000 draws has ~10 samples in the 99th-percentile tail. Your tail estimate has ~30% sampling error. Decisions about catastrophic outcomes need 10,000+ draws, not 1,000 — and even then are subject to the joint-distribution-misspecification critique above. Tail-sensitive decisions should not rely on MC alone; pair with explicit{' '}<CrossLink to="scenarios" recap="Scenario planning: 2-4 internally consistent narratives that span the deep-uncertainty space without assigning probabilities.">scenarios</CrossLink>{' '}for tail behavior.
        </p>
        <p>
          <strong>Where MC fits in this explainer.</strong> Monte Carlo handles the <em>ambiguity</em> regime — distributions exist but are uncertain. It supplements scenario planning (no probabilities) and RDM (next card). For the Miami case, MC inside each scenario quadrant gives you a richer picture than scenarios alone; scenarios prevent MC from getting overconfident in the joint structure.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is adding 10× more samples worth it?', a: `Below ~1,000 you're under-sampling the tail. Above ~10,000 the marginal value of more draws drops fast unless you're estimating extreme tail probabilities (P > 99%). For a typical decision-support MC, 5,000-10,000 is the sweet spot.` },
        { q: 'When is Monte Carlo the wrong tool?', a: `When the inputs are deeply Knightian — no defensible distribution to draw from. Forcing a distribution gives precise output that's misleading; the discipline is to switch to scenarios or RDM and abandon probability framing.` },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — RDM · ROBUST DECISION-MAKING
   ========================================================================== */

const RDM_STRATEGIES = [
  { name: 'Optimize for SSP2 (central case)',  short: 'Optimal SSP2', performance: { ssp1: 0.55, ssp2: 0.95, ssp3: 0.62, ssp5: 0.18 }, color: 'sky' },
  { name: 'Build for SSP5 (worst case)',       short: 'Worst-case',   performance: { ssp1: 0.42, ssp2: 0.55, ssp3: 0.78, ssp5: 0.92 }, color: 'rose' },
  { name: 'Stage actions, hold options',       short: 'Adaptive',     performance: { ssp1: 0.78, ssp2: 0.85, ssp3: 0.82, ssp5: 0.74 }, color: 'emerald' },
  { name: 'Diversify · invest in many places', short: 'Diversified',  performance: { ssp1: 0.72, ssp2: 0.74, ssp3: 0.71, ssp5: 0.68 }, color: 'violet' },
];

const RDMCard = () => {
  const [hov, setHov] = useState(null);

  return (
    <Card id="rdm" icon={Shield} title="Robust decision-making (RDM)" subtitle="Find policies that perform 'well enough' across many futures — robustness over optimality" accent="emerald" index={6}>
      <MinSchema>
        <Term>RDM</Term> (RAND, Lempert): explicitly stress-test candidate policies against thousands of futures. The policy goal is <Term>robustness</Term> — performing acceptably across the spread — not optimality in any one future. Vulnerabilities (combinations that break a policy) are mapped and used to improve the next iteration.
      </MinSchema>

      <p>
        Built at RAND in the early 2000s as an explicit alternative to expected-utility framing for problems with deep uncertainty. The core loop:
      </p>

      <ol className="list-decimal list-inside space-y-1 text-[14px] text-neutral-200">
        <li>Generate a wide ensemble of plausible futures (1,000s, sweeping uncertain parameters).</li>
        <li>For each candidate strategy, compute performance under each future.</li>
        <li>Identify the regions of the future-space where each strategy performs poorly — its <Term>vulnerabilities</Term>.</li>
        <li>Modify candidate strategies to shrink vulnerabilities; iterate.</li>
        <li>Pick the strategy with the most acceptable robustness profile, not the one with the best expected value.</li>
      </ol>

      <Block>{`\\fu{\\text{robust strategy}} \\;=\\; \\arg\\min_a \\;\\max_{s \\in \\Omega} \\;[\\text{regret}(a, s) - T]_+ \\;+\\; \\lambda \\cdot \\text{Var}_s[\\text{performance}(a, s)]`}</Block>

      <p>
        where <Eq>{'T'}</Eq> is an acceptable performance threshold and <Eq>{'\\Omega'}</Eq> is the ensemble of plausible futures. The first term penalizes catastrophic regret in any one future; the second penalizes high variance across futures. <Eq>{'\\lambda'}</Eq> tunes the trade-off.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Boxes className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">strategy × future · performance heatmap</span>
        </div>
        <div className="grid grid-cols-[minmax(160px,1.5fr)_repeat(4,1fr)_minmax(60px,auto)] gap-1 text-[11px]">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500">strategy / future →</div>
          {['SSP1', 'SSP2', 'SSP3', 'SSP5'].map(f => (
            <div key={f} className="text-[9px] uppercase tracking-wider text-neutral-500 text-center">{f}</div>
          ))}
          <div className="text-[9px] uppercase tracking-wider text-emerald-300 text-right">min</div>
          {RDM_STRATEGIES.map((s, i) => {
            const minVal = Math.min(...Object.values(s.performance));
            return (
              <React.Fragment key={i}>
                <div className={`${chipPalette[s.color].split(' ')[1]} pr-2`}>{s.name}</div>
                {['ssp1', 'ssp2', 'ssp3', 'ssp5'].map(f => {
                  const v = s.performance[f];
                  const cellColor = v > 0.8 ? 'rgba(110, 231, 183, 0.4)' : v > 0.6 ? 'rgba(251, 191, 36, 0.35)' : 'rgba(251, 113, 133, 0.4)';
                  const txtColor = v > 0.8 ? '#a7f3d0' : v > 0.6 ? '#fde68a' : '#fda4af';
                  return (
                    <div key={f}
                      onMouseEnter={(e) => setHov({ s: s.name, f, v, mx: e.clientX, my: e.clientY })}
                      onMouseMove={(e) => setHov({ s: s.name, f, v, mx: e.clientX, my: e.clientY })}
                      onMouseLeave={() => setHov(null)}
                      className="rounded text-center font-mono py-1"
                      style={{ background: cellColor, color: txtColor, cursor: 'help' }}
                    >
                      {v.toFixed(2)}
                    </div>
                  );
                })}
                <div className={`text-right font-mono ${minVal < 0.5 ? 'text-rose-300' : minVal < 0.7 ? 'text-amber-300' : 'text-emerald-300'}`}>{minVal.toFixed(2)}</div>
              </React.Fragment>
            );
          })}
        </div>
        <div className="mt-3 text-[11px] text-neutral-400 italic">
          The right column ("min") is the worst-case performance across futures. RDM’s headline criterion: pick the strategy with the highest min — here, "Stage actions, hold options" wins at 0.74.
        </div>
        <FloatingTip hover={hov} render={(h) => (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">{h.f}</div>
            <div className="text-neutral-200 text-[12px] mt-0.5">{h.s}</div>
            <div className="font-mono text-[14px] mt-1" style={{ color: h.v > 0.8 ? '#a7f3d0' : h.v > 0.6 ? '#fde68a' : '#fda4af' }}>performance: {h.v.toFixed(2)}</div>
          </div>
        )} />
      </div>

      <Misconception
        wrong="Optimizing for the central case (SSP2) is the safe default."
        right="Optimizing for any single future risks 'optimization-induced fragility' — the strategy that's best in SSP2 (0.95) is the worst in SSP5 (0.18). Robust strategies sacrifice some peak performance for protection against catastrophic outcomes in adjacent futures."
        because="The bias toward 'central case' optimization is everywhere — engineering, finance, public policy. RDM’s contribution is making the cost of this bias visible and quantifiable: by sweeping the future-space, you can SEE the strategy that wins on SSP2 lose 60+ percentage points on SSP5."
      />

      <Predict question="Why does the Diversified strategy show the smallest spread (0.68 to 0.74) but lowest peak?">
        Diversification trades concentration for breadth: the strategy hedges across regions/scenarios so no single failure dominates, but no single success captures the full upside either. This is the canonical robustness/optimality trade. RDM with high λ favors this; with low λ favors the staged-options strategy. Both beat single-future optimization on most metrics deep-uncertainty practitioners care about.
      </Predict>

      <WhenItMatters>
        Anywhere you face a multi-decade decision with multiple plausible futures and substantial irreversibility — climate adaptation, infrastructure investment, capacity planning under regime uncertainty, defense procurement, AI governance. The RDM step is "what's my strategy's worst-case performance across the futures I take seriously?"
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The PRIM algorithm — finding vulnerabilities.</strong> Once you've simulated 5,000 (strategy, future) pairs, how do you identify "where does my strategy fail?" PRIM (Patient Rule Induction Method, Friedman & Fisher 1999) iteratively searches for axis-aligned boxes in input-parameter space where the policy underperforms. Output: "this strategy fails when (SLR > 1m AND interest rate > 4% AND political cost > $3B/yr)." This vulnerability description is more useful than a single performance number — it tells you what to watch and what to redesign.
        </p>
        <p>
          <strong>Iterative narrowing — the RDM workflow.</strong> Starting from a candidate strategy: sweep futures → identify vulnerabilities → modify the strategy to address the largest vulnerability → re-sweep. Each iteration shrinks the failure region. Lempert et al. (2003) show this converges in 3-5 iterations for typical climate-adaptation problems. The output is a strategy with a small, well-characterized vulnerability set rather than a fragile optimum.
        </p>
        <p>
          <strong>Where RDM differs from{' '}<CrossLink to="scenarios" recap="Scenario planning: 2-4 internally consistent narratives. No probabilities. Pre-committed signposts. Strategy stress-tested across all four.">scenario planning</CrossLink>.</strong> Scenarios use a small number of carefully-constructed narratives (4 quadrants in our card 04). RDM uses thousands of computer-sampled futures along a denser parameter grid. Scenarios privilege narrative coherence; RDM privileges vulnerability discovery. They're complementary — scenarios give you the picture, RDM gives you the failure modes.
        </p>
        <p>
          <strong>Adoption — Delta Programme, California Water, US DOD.</strong> RDM has had real-world impact: California's water management plan, the Dutch Delta Programme (where it became part of DAPP), several USACE coastal-protection studies. The pattern: hand off from "expected-cost minimization" framing to robustness framing once stakeholders see the central-case optimum's vulnerability profile.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How many futures do I need to sample?', a: 'Enough that vulnerabilities found at sample N are stable when re-sampled at 2N. Typical: 1,000-10,000 futures for problems with ~5-10 deeply uncertain parameters. Quasi-Monte Carlo (Sobol) sequences help with sample efficiency.' },
        { q: 'What if NO strategy is robust across all futures?', a: 'Then you need adaptive policy (next card, DAPP) — pre-committed pathways that branch as evidence arrives. RDM tells you when robustness alone is insufficient; DAPP tells you what to do then.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — REAL OPTIONS · VALUE OF WAITING
   ========================================================================== */

const RealOptionsCard = () => {
  const [vol, setVol] = useState(0.4);   // sigma — volatility of the underlying
  const [rev, setRev] = useState(0.5);   // 0 = perfectly reversible, 1 = irreversible
  const [r, setR] = useState(0.04);      // discount rate
  // Dixit-Pindyck approximation: investment trigger ratio
  // (V/I)* = beta / (beta - 1), where beta = 0.5 + sqrt(0.25 + 2r/sigma^2)
  // Higher vol or higher irrev → higher trigger ratio
  const beta = 0.5 + Math.sqrt(0.25 + 2 * r / (vol * vol));
  const naiveTrigger = 1.0; // NPV-positive
  const dpTrigger = beta / (beta - 1);  // Dixit-Pindyck trigger
  // Adjust for irreversibility: full DP if irrev=1, naive if irrev=0
  const trigger = naiveTrigger + (dpTrigger - naiveTrigger) * rev;
  const optionPremium = trigger - 1;

  return (
    <Card id="options" icon={GitBranch} title="Real options · the value of waiting" subtitle="When uncertainty meets irreversibility, waiting has measurable expected value" accent="amber" index={7}>
      <MinSchema>
        <Term>Real options</Term>: an investment opportunity is a financial option in disguise. Under uncertainty + irreversibility, the optimal "go now" trigger is <em>strictly above</em> NPV-positive. Naive expected-value analysis under-invests in flexibility.
      </MinSchema>

      <p>
        Dixit & Pindyck (1994) imported financial-options pricing into capital-budgeting decisions. Their core result: when an investment is partly <Term>irreversible</Term> AND the underlying value is uncertain, there's an option value of waiting that classical NPV analysis ignores. The optimal investment trigger is:
      </p>

      <Block>{`\\fu{(V/I)^*} \\;=\\; \\frac{\\beta}{\\beta - 1}, \\quad \\beta \\;=\\; \\tfrac{1}{2} + \\sqrt{\\tfrac{1}{4} + \\tfrac{2r}{\\sigma^2}}`}</Block>

      <p>
        where <Eq>{'V'}</Eq> is project value, <Eq>{'I'}</Eq> is sunk cost, <Eq>{'\\sigma^2'}</Eq> is the volatility of <Eq>{'V'}</Eq>, and <Eq>{'r'}</Eq> is the discount rate. Naive NPV says invest when <Eq>{'V/I > 1'}</Eq>; Dixit-Pindyck says wait until <Eq>{'V/I > \\beta/(\\beta-1)'}</Eq>, which can be 1.5, 2.0, or higher under high volatility.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Hourglass className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300">investment trigger · live</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">σ · volatility</span>
              <span className="font-mono text-amber-300">{vol.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="0.8" step="0.02" value={vol} onChange={(e) => setVol(+e.target.value)} className="sf-range w-full" />
            <div className="text-[10px] text-neutral-500 mt-0.5">annual sd of project value</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">irreversibility (0–1)</span>
              <span className="font-mono text-amber-300">{rev.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={rev} onChange={(e) => setRev(+e.target.value)} className="sf-range w-full" />
            <div className="text-[10px] text-neutral-500 mt-0.5">0 = fully reversible · 1 = sunk</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">r · discount rate</span>
              <span className="font-mono text-amber-300">{(r * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.01" max="0.10" step="0.005" value={r} onChange={(e) => setR(+e.target.value)} className="sf-range w-full" />
            <div className="text-[10px] text-neutral-500 mt-0.5">cost of waiting</div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-2">
          <Stat label="naive NPV trigger" value="V/I > 1.00" sub="textbook capital budgeting" color="text-neutral-300" />
          <Stat label="real-options trigger" value={`V/I > ${trigger.toFixed(2)}`} sub="under stated σ + irrev." color="text-amber-300" />
          <Stat label="option premium" value={`+${(optionPremium * 100).toFixed(0)}%`} sub="extra hurdle vs naive" color={optionPremium > 0.5 ? 'text-rose-300' : 'text-amber-300'} />
        </div>
      </div>

      <Misconception
        wrong="If a project has positive NPV, you should invest."
        right="If a project has positive NPV AND no option to wait AND no irreversibility, invest. Otherwise the right comparison is NPV vs the option value of waiting."
        because="Conventional MBA-style NPV analysis ignores waiting as an alternative. Under high volatility + high irreversibility, waiting can have option value 30-100% of project NPV — meaning the right answer is often 'positive NPV but still wait'."
      />

      <Worked title="Why this is everywhere in deep uncertainty">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Climate adaptation:</strong> a 4m seawall is irreversible; SLR is uncertain. Wait until SLR signals firm up before committing the full design.</li>
          <li><strong>Nuclear plant build-out:</strong> $10B sunk over 8 years; energy demand uncertain. The 2010s killed many such projects on classical NPV — option-value reasoning would have abandoned earlier.</li>
          <li><strong>Drug development:</strong> phased trials are real options — Phase 1 buys you the option to start Phase 2 if results justify. Pharma's stage-gate is real-options theory in operational form.</li>
          <li><strong>AI compute investment:</strong> $100B GPU clusters are partly irreversible (rapidly depreciating); model capability uncertain. Real-options says wait for clearer signal — but competition pressure pushes against this.</li>
        </ul>
      </Worked>

      <Predict question="Volatility 0.6, irreversibility 0.9. About what's the option premium?">
        Around 50–80%. With σ = 0.6 the underlying value has a wide annual range; with near-full irreversibility the cost of being wrong is high. β ≈ 0.5 + √(0.25 + 2·0.04/0.36) = 0.5 + √(0.47) ≈ 1.19, so β/(β−1) ≈ 6.3 — but tempered by partial irreversibility to a ~1.7-1.9 trigger. Concretely: only invest when project value is 70-90% above sunk cost. Most "boring" infrastructure decisions live in σ ≈ 0.15–0.25, where the premium is modest (~10-20%); deep-uncertainty decisions live where the premium is dominant.
      </Predict>

      <Deeper>
        <p>
          <strong>The bridge from financial to real options.</strong> A call option on a stock has value when the stock has volatility, even out-of-the-money. Same logic for projects: even if NPV is currently zero, the project has value if its underlying value is volatile enough to plausibly become positive. Black-Scholes (1973) gives the financial-option price; Dixit-Pindyck (1994) extends to real-asset analogues with continuous-time stochastic processes for V.
        </p>
        <p>
          <strong>What kills the option value of waiting.</strong> Three forces: (1) <em>holding cost</em> — every period you wait, you pay for it (interest, lost dividends, storage). (2) <em>preemption risk</em> — if a competitor moves first, your option expires worthless. (3) <em>information arrival rate</em> — if waiting doesn't actually reduce uncertainty, there's nothing to gain. Each subtracts from the naive option value. Climate adaptation has high info arrival rate (every decade tells you a lot) but also non-trivial preemption (coastal land losing value as scenarios resolve).
        </p>
        <p>
          <strong>Real options in policy under deep uncertainty.</strong> Adaptive infrastructure investment — modular, expandable structures — is real-options thinking made operational. Build a 4m seawall designed for vertical extension to 6m if needed; pre-purchase land for managed retreat without using it; design pump capacity with hooks for additional units. Each is a "small first move + option to expand," priced higher than naive cost-benefit but worth it under high uncertainty.
        </p>
        <p>
          <strong>The connection to{' '}<CrossLink to="dapp" recap="Dynamic Adaptive Policy Pathways: pre-committed branching strategies. The next card.">DAPP (next card)</CrossLink></strong>. Real options say "wait if there's value in waiting." DAPP operationalizes this for policy: build a pre-committed branching tree where each branch has its own commit-trigger. Real options gives you the math; DAPP gives you the workflow.
        </p>
      </Deeper>

      <QA items={[
        { q: 'When should I NOT use real-options thinking?', a: 'When the decision is fully reversible (just unwind it later if you change your mind) OR when there is no underlying volatility (deterministic problem). In those cases, naive NPV is fine. Most strategic decisions don\'t qualify on either count.' },
        { q: 'How is this different from "just be cautious"?', a: 'Caution is qualitative; real options is quantitative. The Dixit-Pindyck trigger gives you a specific number — "wait until V/I exceeds 1.7" — that you can defend, debate, and revise as σ updates. Caution alone doesn\'t tell you when to commit.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — DAPP · DYNAMIC ADAPTIVE POLICY PATHWAYS
   ========================================================================== */

// Pathway map for Miami SLR
const DAPP_PATHWAYS = [
  { id: 'A', name: 'Status quo · current pumps', start: 0, end: 0.3, color: '#6ee7b7', desc: 'Existing infrastructure handles SLR up to ~30 cm. Beyond that, king-tide flooding spreads; insurance market freezes.' },
  { id: 'B', name: 'Enhanced pumps + raised streets', start: 0.3, end: 0.7, color: '#7dd3fc', desc: 'Doubled pumping capacity, raised street grades. Buys ~70 cm of headroom; ~$3B investment over 10 years.' },
  { id: 'C', name: 'Distributed seawalls + barrier islands restoration', start: 0.5, end: 1.2, color: '#c4b5fd', desc: 'Coastal flood defense with managed surge. ~$15B over 20 years; effective up to ~1.2 m.' },
  { id: 'D', name: 'Managed retreat from low elevation zones', start: 1.0, end: 2.0, color: '#fbbf24', desc: 'Buyouts and rezoning in lowest-elevation neighborhoods. Slow, politically costly, but structurally most robust.' },
  { id: 'E', name: 'Storm-surge barrier across Biscayne Bay', start: 0.8, end: 2.5, color: '#f0abfc', desc: 'Mega-engineering option (Thames-Barrier-style). $30B+ build, decades to permit. Effective only with active operation.' },
];

const DAPPCard = () => {
  const [slr, setSlr] = useState(0.4);  // realized SLR in meters
  const W = 620, H = 320, P = 50;
  const xmax = 2.5;  // meters SLR
  const sx = (x) => P + (x / xmax) * (W - 2 * P);

  return (
    <Card id="dapp" icon={Footprints} title="Dynamic adaptive policy pathways (DAPP)" subtitle="A pre-committed branching plan: actions, triggers, and switches as evidence arrives" accent="orange" index={8}>
      <MinSchema>
        <Term>DAPP</Term> (Haasnoot et al., Dutch Delta Programme): plan as a sequence of <em>pathways</em>, each with a domain of validity in some exogenous variable (e.g. SLR meters). When the variable approaches the pathway's <Term>tipping point</Term>, switch to the next pathway. The plan is the tree, not any single pathway.
      </MinSchema>

      <p>
        Where{' '}<CrossLink to="rdm" recap="Robust Decision-Making: stress-test strategies across thousands of futures, pick the most robust.">RDM</CrossLink>{' '}finds a single robust strategy and{' '}<CrossLink to="options" recap="Real options: under uncertainty + irreversibility, waiting has option value.">real options</CrossLink>{' '}price the value of waiting on one decision, DAPP plans an explicit <em>sequence</em> of decisions linked by triggers. It's the operational form of "optionality" — you pre-commit to a tree of branches, each with its own validity range, rather than to a single branch.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Map className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-300">pathway map · drag the slider to advance time/SLR</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* x-axis */}
          {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map(t => (
            <g key={t}>
              <line x1={sx(t)} y1={H - P} x2={sx(t)} y2={H - P + 4} stroke="#525252" strokeWidth="0.5" />
              <text x={sx(t)} y={H - P + 16} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{t.toFixed(1)} m</text>
            </g>
          ))}
          <text x={W / 2} y={H - 8} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle">cumulative SLR (or proxy time variable) →</text>
          {/* pathway bars */}
          {DAPP_PATHWAYS.map((p, i) => {
            const y = P + i * 38;
            const fillBar = sx(p.end) - sx(p.start);
            const isActive = slr >= p.start && slr <= p.end;
            return (
              <g key={p.id}>
                <text x={P - 8} y={y + 18} fontSize="11" fill={p.color} fontFamily="ui-monospace" textAnchor="end" fontWeight="700">{p.id}</text>
                <rect x={sx(p.start)} y={y} width={fillBar} height={28} fill={p.color} fillOpacity={isActive ? 0.6 : 0.18} stroke={p.color} strokeWidth={isActive ? 1.4 : 0.8} rx="3" />
                <text x={sx(p.start) + 8} y={y + 18} fontSize="11" fill={isActive ? '#0a0a0a' : p.color} fontFamily="ui-monospace" fontWeight={isActive ? '700' : '400'}>{p.name}</text>
                {/* tipping marker on right edge */}
                <circle cx={sx(p.end)} cy={y + 14} r={3} fill={p.color} stroke="#0a0a0a" strokeWidth="1" />
              </g>
            );
          })}
          {/* current SLR marker */}
          <line x1={sx(slr)} y1={P - 8} x2={sx(slr)} y2={H - P + 4} stroke="#fda4af" strokeWidth="2" />
          <text x={sx(slr)} y={P - 12} fontSize="10" fill="#fda4af" fontFamily="ui-monospace" textAnchor="middle">now: {slr.toFixed(2)} m</text>
        </svg>

        <div className="mt-3 mb-3">
          <input type="range" min="0" max="2.5" step="0.05" value={slr} onChange={(e) => setSlr(+e.target.value)} className="sf-range w-full" />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>0 m (today)</span>
            <span>1 m (mid-century, central case)</span>
            <span>2.5 m (worst-case)</span>
          </div>
        </div>

        {/* show currently-valid pathways */}
        <div className="text-[11px] text-neutral-300">
          <span className="text-[9px] uppercase tracking-wider text-orange-300 mr-2">currently valid:</span>
          {DAPP_PATHWAYS.filter(p => slr >= p.start && slr <= p.end).map(p => (
            <span key={p.id} className="font-mono mr-2 px-1.5 py-0.5 rounded" style={{ background: `${p.color}30`, color: p.color }}>
              {p.id} · {p.name}
            </span>
          ))}
          {DAPP_PATHWAYS.filter(p => slr >= p.start && slr <= p.end).length === 0 && <span className="text-rose-300">none — past all pathways</span>}
        </div>
      </div>

      <Worked title="Reading a pathway map">
        <p>
          Each pathway is valid over a range of the exogenous variable (here SLR). When SLR reaches the right edge of a pathway (its <Term>adaptation tipping point</Term>), that pathway stops working — you must switch to one whose validity range covers the new conditions. The tree of valid switches is the plan.
        </p>
        <p>
          DAPP makes the plan <em>visible</em> in a way that scenario planning alone doesn't: you can read off "if SLR reaches 0.7 m, I switch from B to C; if it reaches 1.0 m and I haven't built E, I switch to D." Most importantly, you can see <em>now</em> which pre-investments make future switches cheaper (e.g., land-banking for managed retreat is a low-cost-now commitment that makes pathway D dramatically cheaper to execute later).
        </p>
      </Worked>

      <Misconception
        wrong="Adaptive planning means you don't have to commit to anything now."
        right="Adaptive planning means you commit to a TREE of conditional actions now — including specific signposts and pre-positions that make future switches feasible. The commitment is to the pathway map, not to one branch."
        because="A common failure mode of 'we'll be flexible' is no actual pre-positioning. Real DAPP commits dollars and decisions today: land-banking, modular infrastructure design, monitoring infrastructure. Without these, the tree is just a wish list."
      />

      <Predict question="Why does the manageed-retreat pathway (D) start at 1.0 m, not 0 m?">
        Two reasons. (1) Cost-effectiveness: forced retreat is politically and economically expensive; below ~1m SLR, defense (B, C) is cheaper. (2) Triggering signal: managed retreat is a partial-irreversibility decision — once you depopulate a neighborhood, recovery is decades. You want to be confident the pathway will not be reversed before committing. The D start point is essentially "the SLR level at which retreat is unambiguously cheaper than defense even with conservative estimates."
      </Predict>

      <Deeper>
        <p>
          <strong>The Delta Programme as the canonical example.</strong> The Netherlands' national climate adaptation plan (2008→) explicitly uses DAPP. Their pathway map covers 2010-2100 with ~12 named adaptation pathways for flood protection, freshwater supply, and spatial planning. Pre-committed signposts include river discharge levels, sea level, land subsidence rate, and storm-surge frequency. The plan's strength: every 6 years, the pathway map is revisited as data accrues; specific decisions slide forward or backward but the structure is preserved.
        </p>
        <p>
          <strong>How DAPP differs from "rolling planning".</strong> Rolling planning revises as you go but doesn't pre-commit to switching rules. DAPP locks the switching rules in advance — when SLR hits 0.7m, we activate pathway C; if cost-per-meter-prevented exceeds X, we shift toward D. Pre-commitment is the operational discipline that prevents inertia at decision points (the worst failure mode of climate adaptation: knowing the trigger fired and not switching because the switch is politically painful).
        </p>
        <p>
          <strong>The signpost catalog.</strong> Each pathway carries a list of indicators that signal "this pathway is closer to its tipping point than expected" or "this pathway is still good." For Miami: monthly tide-gauge readings vs IPCC trajectory bands, AMOC strength index, USACE bridge-clearance violations, FEMA insurance pool loss ratios. When 2-3 indicators flash simultaneously, the next-stage decision is pre-authorized to proceed.
        </p>
        <p>
          <strong>Where DAPP fits with the rest of this explainer.</strong> It's the synthesis card for the operational toolkit: takes the{' '}<CrossLink to="scenarios" recap="2-4 internally consistent narratives. Gives the structure.">scenarios (04)</CrossLink>{' '}and gives them branch points; takes the{' '}<CrossLink to="rdm" recap="Robust strategies stress-tested across many futures.">RDM strategies (06)</CrossLink>{' '}and sequences them; takes the{' '}<CrossLink to="options" recap="Option value of waiting under irreversibility.">real options (07)</CrossLink>{' '}intuition and gives it a workflow. The Anchor card (Miami 2030-2070) is built on DAPP as its scaffold.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I know if my problem warrants DAPP vs simpler tools?', a: 'Three diagnostics. (1) Multi-decade horizon. (2) Multiple plausible futures with material differences. (3) At least some intermediate decision points where you could observe and switch. If all three hold, DAPP. If not, RDM or real options alone may suffice.' },
        { q: 'What if a tipping point fires earlier than expected?', a: 'Early-warning indicators are designed to trigger the switch before tipping is fully reached, with margin. If you\'re consistently seeing tipping points hit earlier than the pathway map predicts, the map is stale — refresh the underlying scenarios and re-position pathway boundaries.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — DECISION CRITERIA WITHOUT PROBABILITIES
   ========================================================================== */

// Sample 3-action × 3-state payoff matrix
const PAYOFF = {
  rows: ['Aggressive defense', 'Staged adaptation', 'Managed retreat'],
  cols: ['Mild SLR (0.4m)', 'Central (0.7m)', 'Severe (1.5m)'],
  // [action][state]: payoff (higher = better)
  data: [
    [-50,   25,  -120],   // aggressive: cheap-but-overkill in mild, fine in central, fails in severe
    [-30,   30,   10],    // staged: small loss in mild, good in central, OK in severe
    [-80,  -40,   60],    // retreat: big loss in mild, loss in central, big win in severe
  ],
};

const CriteriaCard = () => {
  const [criterion, setCriterion] = useState('maximin');
  const [alpha, setAlpha] = useState(0.5);  // Hurwicz optimism index

  const rowMin = PAYOFF.data.map(row => Math.min(...row));
  const rowMax = PAYOFF.data.map(row => Math.max(...row));
  const rowMean = PAYOFF.data.map(row => row.reduce((s, v) => s + v, 0) / row.length);
  // regret matrix
  const colMax = PAYOFF.cols.map((_, j) => Math.max(...PAYOFF.data.map(row => row[j])));
  const regret = PAYOFF.data.map(row => row.map((v, j) => colMax[j] - v));
  const rowMaxRegret = regret.map(row => Math.max(...row));
  // hurwicz scores
  const hurwicz = PAYOFF.data.map((row, i) => alpha * rowMax[i] + (1 - alpha) * rowMin[i]);

  let scores;
  let bestIdx;
  if (criterion === 'maximin') {
    scores = rowMin;
    bestIdx = scores.indexOf(Math.max(...scores));
  } else if (criterion === 'maximax') {
    scores = rowMax;
    bestIdx = scores.indexOf(Math.max(...scores));
  } else if (criterion === 'laplace') {
    scores = rowMean;
    bestIdx = scores.indexOf(Math.max(...scores));
  } else if (criterion === 'regret') {
    scores = rowMaxRegret;
    bestIdx = scores.indexOf(Math.min(...scores));
  } else if (criterion === 'hurwicz') {
    scores = hurwicz;
    bestIdx = scores.indexOf(Math.max(...scores));
  }

  const CRITERIA = [
    { k: 'maximin', label: 'Maximin (Wald)',     desc: 'Pick the row with the highest minimum. Pessimistic.', color: 'rose' },
    { k: 'maximax', label: 'Maximax',            desc: 'Pick the row with the highest maximum. Optimistic.', color: 'amber' },
    { k: 'laplace', label: 'Laplace (insufficient reason)', desc: 'Treat all states equal-probability. Pick highest mean.', color: 'sky' },
    { k: 'regret',  label: 'Minimax regret (Savage)',  desc: 'Pick the row whose max regret is smallest.', color: 'violet' },
    { k: 'hurwicz', label: 'Hurwicz (α-weighted)', desc: 'α·max + (1-α)·min. Slide α to mix maximax and maximin.', color: 'emerald' },
  ];

  return (
    <Card id="criteria" icon={Crosshair} title="Decision criteria without probabilities" subtitle="Five rules for choosing under deep uncertainty when you can't or won't assign distributions" accent="rose" index={9}>
      <MinSchema>
        Without probabilities, expected-value comparison breaks. The replacements: <Term>maximin</Term> (worst-case), <Term>maximax</Term> (best-case), <Term>Laplace criterion</Term> (equal weight), <Term>minimax regret</Term> (smallest worst regret), <Term>Hurwicz criterion</Term> (mix of best and worst). Each codifies a different stance toward uncertainty.
      </MinSchema>

      <p>
        When you've abandoned probabilities (cards 01–04), you still need a rule to choose. The classical decision-theory criteria are pre-Bayesian — they don't require a distribution over states, only a payoff matrix. Each rule encodes a different attitude:
      </p>

      <Block>{`\\begin{aligned}\\text{maximin: }     &\\arg\\max_a \\min_s u(a, s) \\\\ \\text{maximax: }     &\\arg\\max_a \\max_s u(a, s) \\\\ \\text{Laplace: }      &\\arg\\max_a \\tfrac{1}{|S|}\\sum_s u(a, s) \\\\ \\text{minimax regret: }&\\arg\\min_a \\max_s [u^*(s) - u(a, s)] \\\\ \\text{Hurwicz: }     &\\arg\\max_a \\big[\\alpha \\max_s u + (1-\\alpha) \\min_s u\\big] \\end{aligned}`}</Block>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300">payoff matrix · click a criterion</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {CRITERIA.map(c => (
            <button
              key={c.k}
              onClick={() => setCriterion(c.k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${criterion === c.k ? `${chipPalette[c.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(140px,1.4fr)_repeat(3,1fr)_minmax(60px,auto)] gap-1 text-[11px]">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500">strategy / state →</div>
          {PAYOFF.cols.map(c => (
            <div key={c} className="text-[9px] uppercase tracking-wider text-neutral-500 text-center">{c}</div>
          ))}
          <div className="text-[9px] uppercase tracking-wider text-rose-300 text-right">score</div>
          {PAYOFF.rows.map((row, i) => (
            <React.Fragment key={i}>
              <div className={`pr-2 ${bestIdx === i ? 'text-rose-200 font-semibold' : 'text-neutral-300'}`}>{row}{bestIdx === i && ' ★'}</div>
              {PAYOFF.data[i].map((v, j) => {
                const cellColor = v > 0 ? 'rgba(110, 231, 183, 0.25)' : v > -50 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 113, 133, 0.30)';
                const txtColor = v > 0 ? '#a7f3d0' : v > -50 ? '#fde68a' : '#fda4af';
                const cellLabel = criterion === 'regret' ? `−${regret[i][j]}` : v;
                return (
                  <div key={j} className="rounded text-center font-mono py-1" style={{ background: cellColor, color: txtColor }}>
                    {cellLabel}
                  </div>
                );
              })}
              <div className={`text-right font-mono ${bestIdx === i ? 'text-rose-200 font-semibold' : 'text-neutral-400'}`}>
                {criterion === 'regret' ? `−${rowMaxRegret[i]}` : scores[i].toFixed(criterion === 'laplace' || criterion === 'hurwicz' ? 1 : 0)}
              </div>
            </React.Fragment>
          ))}
        </div>

        {criterion === 'hurwicz' && (
          <div className="mt-3 rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">α · optimism index</span>
              <span className="font-mono text-emerald-300">{alpha.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={alpha} onChange={(e) => setAlpha(+e.target.value)} className="sf-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>0 = pure maximin</span><span>0.5 = balanced</span><span>1 = pure maximax</span>
            </div>
          </div>
        )}

        <div className="mt-3 text-[11px] text-neutral-300 italic">
          {CRITERIA.find(c => c.k === criterion).desc}
          {' Pick: '}<span className="text-rose-200 font-semibold not-italic">{PAYOFF.rows[bestIdx]}</span>
        </div>
      </div>

      <Predict question="Why does maximin pick 'Staged adaptation' but maximax pick 'Aggressive defense'?">
        Maximin focuses on worst case: aggressive defense's worst case is −120 (severe SLR exceeds the design); managed retreat's worst is −80 (mild SLR makes it look pointless); staged's worst is −30. Staged dominates on worst-case. Maximax flips it: aggressive's best case is +25 (central SLR), managed retreat's best is +60, staged's best is +30 — so maximax picks managed retreat. Different criteria can pick different actions on the same matrix; the criterion encodes the decision-maker's risk attitude, not "the right answer."
      </Predict>

      <Misconception
        wrong="Maximin is too conservative — it ignores the upside."
        right="Maximin is appropriate when the downside is catastrophic and irreversible. For Knightian decisions about existential / civilizational stakes (catastrophic climate, nuclear, AI alignment), maximin-flavored reasoning is defensible; for routine business decisions, it's overkill."
        because="The criterion choice is itself a value judgment — there's no neutral 'optimal' rule under deep uncertainty. Articulating WHICH criterion you're using and why is half the discipline. The other half is checking that the answer survives criterion changes."
      />

      <Worked title="The Savage regret table — why it's often the most reasonable">
        <p>
          Regret = "what's the gap between my chosen action and the best I could have done IF I'd known the state?" Worst-case regret = "across all states, what's the worst gap?" Picking the action with the smallest worst-case regret feels less arbitrary than maximin or maximax — it's "minimize how much you'll kick yourself."
        </p>
        <p>
          For our payoff matrix: regret of (Aggressive, Severe) is 60−(−120) = 180 — the largest regret in the matrix. Aggressive defense has worst-regret 180. Staged has worst-regret 50 (in severe state). Managed retreat has worst-regret 105 (in mild state). Minimax regret picks staged.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Why no criterion is "right."</strong> Wald's maximin (1950) was originally proposed as the canonical extension of minimax to statistical games. Savage's minimax-regret (1951) was a friendly rewrite. Hurwicz (1951) showed both are special cases of a parameterized family. None has a unique justification — each privileges a different aspect of the decision-maker's preferences. The discipline is to pick one consciously, not to pretend there's a rule that doesn't require one.
        </p>
        <p>
          <strong>Connection to Kelly &amp; Bernoulli.</strong> Under risk (probabilities known), expected utility maximization is the unambiguous answer. Under uncertainty, expected utility can't be computed — but a related concept survives: <em>logarithmic utility</em>, the Kelly criterion, says "maximize log-wealth" which down-weights catastrophic outcomes very heavily. Logarithmic utility is roughly equivalent to maximin in the deep-tail regime; it's "expected utility done with very risk-averse log preferences."
        </p>
        <p>
          <strong>Practical advice — robustness across criteria.</strong> Compute all five (the matrix is small; the cost is trivial). If 3+ criteria pick the same action, that's strong; if all 5 split, you're in genuine criterion-sensitive territory and should report it that way to decision-makers. The best practice in policy work is to present the full matrix, name each criterion's recommendation, and let decision-makers weigh the implicit values themselves.
        </p>
        <p>
          <strong>Where this fits.</strong> Decision criteria are the lowest-tech tool in this explainer's arsenal — pure tabular reasoning with no probabilities. They underlie{' '}<CrossLink to="rdm" recap="RDM: stress-test strategies across many futures.">RDM (06)</CrossLink>{' '}(maximin-flavored "find robust strategies"),{' '}<CrossLink to="dapp" recap="DAPP: pre-committed branching strategies.">DAPP (08)</CrossLink>{' '}(use criteria to pick the next pathway when triggers fire), and the upcoming{' '}<CrossLink to="anchor" recap="Miami sea-level adaptation: full synthesis using all of this explainer's tools.">anchor (11)</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I always include all five criteria?', a: 'Compute all five for transparency, then present the 1-2 most relevant to your decision-maker. For high-stakes irreversible decisions, lead with maximin and minimax-regret. For routine resource allocation, lead with Laplace.' },
        { q: 'How do I handle multi-objective payoffs (cost AND lives AND equity)?', a: 'Either (1) reduce to a single dimension via weights (loses information), or (2) compute Pareto-optimal actions per criterion and present the trade-off. Most policy decisions use approach (2) — show the trade-off frontier and let decision-makers choose.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — OPERATIONAL RESPONSES
   ========================================================================== */

const OperationalCard = () => {
  const [hov, setHov] = useState(null);
  const responses = [
    {
      k: 'Hedging',          icon: Umbrella,    color: 'sky',
      what: 'Pay to cap downside.',
      examples: 'flood insurance, currency forwards, fuel hedges, catastrophe bonds',
      cost: 'predictable premium',
      benefit: 'bounded loss',
      when: 'when downside has a market price',
    },
    {
      k: 'Redundancy',       icon: Boxes,       color: 'emerald',
      what: 'Multiple independent paths.',
      examples: 'N+1, 2N, multi-region cloud, multi-supplier sourcing, distributed teams',
      cost: 'duplicated capex / opex',
      benefit: 'survives single-point failures',
      when: 'when failures are independent or rare',
    },
    {
      k: 'Optionality',      icon: GitBranch,   color: 'amber',
      what: 'Right but not obligation.',
      examples: 'staged investments, modular infrastructure, R&D pipelines, pre-commit budgets',
      cost: 'lower mean performance',
      benefit: 'can act on new info',
      when: 'when uncertainty resolves over time',
    },
    {
      k: 'Antifragility',    icon: TrendingUp,  color: 'fuchsia',
      what: 'Gain from volatility.',
      examples: 'long options, distributed generation, tinkering R&D, evolutionary search',
      cost: 'small frequent losses',
      benefit: 'asymmetric upside',
      when: 'when shocks are positively skewed in expected value',
    },
    {
      k: 'Precaution',       icon: ShieldAlert, color: 'rose',
      what: 'Burden on the proposer.',
      examples: 'EU GMO regulation, FDA approval gates, AI safety pause arguments',
      cost: 'foregone upside',
      benefit: 'avoids tail catastrophe',
      when: 'when potential harm is large + irreversible + uncertain',
    },
    {
      k: 'Slack & buffers',  icon: Hourglass,   color: 'cyan',
      what: 'Capacity above mean.',
      examples: 'inventory safety stock, capital reserves, time buffers, payroll cash',
      cost: 'unused capacity',
      benefit: 'absorbs shocks without escalation',
      when: 'always — slack is a generic deep-uncertainty hedge',
    },
  ];

  return (
    <Card id="operational" icon={Umbrella} title="Operational responses · hedging, redundancy, optionality" subtitle="Six concrete moves you make in the real world when probability-based optimization isn't enough" accent="emerald" index={10}>
      <MinSchema>
        Six operational responses, each with a different risk profile: <Term>hedging</Term> (pay to cap loss), <Term>redundancy</Term> (multiple paths), <Term>optionality</Term> (right not obligation), <Term>antifragility</Term> (gain from volatility), <Term>precautionary principle</Term> (burden flips), buffers (capacity above mean). Pick the mix the decision warrants.
      </MinSchema>

      <p>
        Frameworks (Knight, RDM, DAPP) are abstract; <em>actions</em> are concrete. The operational palette under deep uncertainty is small but meaningfully distinct. Every real-world adaptation strategy is a specific combination of these six.
      </p>

      <div className="grid md:grid-cols-2 gap-2.5">
        {responses.map(r => {
          const Icon = r.icon;
          return (
            <div
              key={r.k}
              onMouseEnter={(e) => setHov({ ...r, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHov({ ...r, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHov(null)}
              className={`rounded-lg border bg-white/[0.02] p-3 cursor-help transition-colors ${chipPalette[r.color].split(' ')[2]} hover:bg-white/[0.04]`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${chipPalette[r.color].split(' ')[1]}`} />
                <div className={`text-sm font-semibold ${chipPalette[r.color].split(' ')[1]}`}>{r.k}</div>
              </div>
              <div className="text-[12px] text-neutral-100 leading-snug font-semibold mb-1">{r.what}</div>
              <div className="text-[11px] text-neutral-300 leading-snug">{r.examples}</div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                <div><span className="text-rose-300/70">cost:</span> <span className="text-neutral-300">{r.cost}</span></div>
                <div><span className="text-emerald-300/70">benefit:</span> <span className="text-neutral-300">{r.benefit}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <FloatingTip hover={hov} render={(h) => (
        <div>
          <div className={`text-[10px] uppercase tracking-widest ${chipPalette[h.color].split(' ')[1]}`}>{h.k.toLowerCase()}</div>
          <div className="text-[11px] text-neutral-200 mt-1"><strong>What:</strong> {h.what}</div>
          <div className="text-[11px] text-neutral-300 mt-1">{h.examples}</div>
          <div className="text-[10.5px] text-neutral-400 mt-1.5"><strong className="text-neutral-300">when:</strong> {h.when}</div>
        </div>
      )} />

      <Worked title="Combining responses for Miami SLR">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Slack (always)</strong> — pump capacity at 1.5× design point, not 1.0×.</li>
          <li><strong>Hedging</strong> — flood-insurance pool restructured (catastrophe bonds at the city level).</li>
          <li><strong>Redundancy</strong> — multi-modal evacuation plans, backup pumps, distributed power.</li>
          <li><strong>Optionality</strong> — modular seawall designs that can be vertically extended; land-banking for managed retreat.</li>
          <li><strong>Antifragility</strong> — distributed-generation grid that gets stronger under stress (microgrids).</li>
          <li><strong>Precaution</strong> — moratorium on new construction in lowest elevation zones, even before SLR forces the issue.</li>
        </ul>
        <p className="mt-2">
          The portfolio is what makes the strategy robust — not any single move. The Anchor card (next ★) costs each of these out across the four scenarios.
        </p>
      </Worked>

      <Misconception
        wrong="More redundancy is always better."
        right="Redundancy has cost; over-investment in redundancy is a fragility in its own right (it consumes resources that could buy other forms of robustness). The right level is calibrated to the spectrum of scenarios, not maxed out."
        because="Common engineering failure: 5×N redundancy on subsystems that fail rarely while ignoring the single-point-of-failure that actually breaks the system. Redundancy is a tool, not a virtue. Apply it where the failure pattern justifies it."
      />

      <Predict question="Which operational response is hardest to maintain politically over decades?">
        <Term>Slack</Term> and <Term>precautionary principle</Term>, almost always. Slack looks like waste in normal years — there's perpetual political pressure to "optimize" (= remove the buffer). Precautionary measures (e.g., construction moratoria) face constant pressure as the harm hasn't yet materialized. Both fail when the time-horizon political incentive is shorter than the deep-uncertainty time-horizon. The structural fix: lock the slack and precaution into pre-committed institutional rules, not annual budget decisions. This is one reason DAPP (with pre-committed signposts) is operationally superior to year-by-year negotiation.
      </Predict>

      <Deeper>
        <p>
          <strong>Antifragility · what it actually means.</strong> Taleb's term but the math is older. A function f(X) is antifragile if its second derivative with respect to volatility is positive — small variance increases hurt you, but large variance increases hurt less than proportionally OR help. Long options are the canonical example: bounded downside (premium), unbounded upside. Distributed organizations under stress: redundancy + experimentation = generates new capabilities precisely when challenged. The opposite — concentrated, mean-optimized systems — has negative convexity and gets hurt twice when conditions change.
        </p>
        <p>
          <strong>Why redundancy and antifragility are not the same.</strong> Redundancy: multiple parallel paths to the same goal. Survives shocks but doesn't gain from them. Antifragility: a structure that <em>improves</em> under shocks. Mediterranean economies (over 2000 years) survive sequential collapses precisely because each shock killed the most-rigid actors and selected for the most-flexible — antifragile by selection. Redundancy is engineering; antifragility is biology.
        </p>
        <p>
          <strong>The precautionary principle, properly used.</strong> Two flavors. <em>Strong</em>: shift the burden of proof to those proposing the action ("prove this won't cause X"). <em>Weak</em>: under uncertainty about large irreversible harm, increase scrutiny but don't fully halt. Strong PP can paralyze (you can never prove no harm); weak PP is operationally tractable. EU GMO regulation is roughly strong-PP; FDA pharmaceutical approval is weak-PP. The choice depends on the scale of irreversibility and the value of the alternative.
        </p>
        <p>
          <strong>Sliding among responses as evidence accrues.</strong> Most realistic strategies use multiple responses simultaneously, with weights that shift as scenarios resolve. Early: heavy on slack and optionality (cheap, flexible). Mid: hedging and redundancy as specific risks become visible. Late: precaution or aggressive defense as the scenario commits. DAPP is the workflow for sliding among these explicitly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Are these responses substitutable or complementary?', a: 'Mostly complementary — each addresses a different failure mode. Hedging handles known-large risks; redundancy handles single-point-of-failure; optionality handles slow-evolving uncertainty; antifragility handles structural volatility. Substitution only happens at the margin (more redundancy can compensate for less hedging in some cases), but pure substitution loses information.' },
        { q: 'How do I budget for these under fiscal constraints?', a: 'Calculate the cost of each layer and the worst-case loss it prevents. Compare cost-per-loss-prevented across layers; allocate to the most cost-effective layers first. Slack and optionality are usually high cost-effectiveness because they\'re cheap; antifragility and precaution are usually lower cost-effectiveness but address tails the others miss.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — ★ ANCHOR · MIAMI SLR 2030-2070
   ========================================================================== */

const ANCHOR_PORTFOLIO = [
  { k: 'Pumps & street-raise expansion',  cost: 3.0,  active: true,  start: 0,    color: '#6ee7b7', desc: 'continued $300M/yr; effective to ~0.7m SLR' },
  { k: 'Modular distributed seawalls',     cost: 6.0,  active: true,  start: 0.3,  color: '#7dd3fc', desc: 'designed for vertical extension; option-priced' },
  { k: 'Land-bank for managed retreat',    cost: 1.5,  active: true,  start: 0,    color: '#fbbf24', desc: 'pre-purchase low-elevation land NOW; cheap optionality' },
  { k: 'Catastrophe bond pool',            cost: 0.5,  active: true,  start: 0,    color: '#a5b4fc', desc: 'transfer fat-tail risk to capital markets' },
  { k: 'Storm-surge barrier (option)',     cost: 12.0, active: false, start: 0.7,  color: '#f0abfc', desc: 'committed only if SSP3+/SSP5 signposts fire post-2035' },
  { k: 'Active managed retreat',           cost: 8.0,  active: false, start: 1.0,  color: '#fb7185', desc: 'voluntary buyout at SLR > 1m; involuntary if forced' },
];

const ANCHOR_SCENARIOS_DETAIL = [
  { name: 'Manageable Transition', sl2070: 0.4, color: 'emerald', regret: { aggressive: 60, staged: 5, retreat: 80, robust: 12 }, },
  { name: 'Slow Burn',             sl2070: 0.7, color: 'amber',   regret: { aggressive: 25, staged: 10, retreat: 40, robust: 18 }, },
  { name: 'Lucky Pivot',           sl2070: 1.0, color: 'violet',  regret: { aggressive: 15, staged: 35, retreat: 8,  robust: 14 }, },
  { name: 'Compound Crisis',       sl2070: 1.7, color: 'rose',    regret: { aggressive: 95, staged: 70, retreat: 0,  robust: 28 }, },
];

const ANCHOR_STRATEGIES = [
  { k: 'aggressive',  name: 'Aggressive engineering · single-track', color: 'sky' },
  { k: 'staged',      name: 'Staged adaptation (DAPP-style)',         color: 'emerald' },
  { k: 'retreat',     name: 'Aggressive managed retreat',             color: 'amber' },
  { k: 'robust',      name: 'Mixed portfolio (this card\'s answer)',  color: 'fuchsia' },
];

const AnchorCard = () => {
  const [predicted, setPredicted] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const totalCommittedCost = ANCHOR_PORTFOLIO.filter(p => p.active).reduce((s, p) => s + p.cost, 0);
  const totalOptionCost = ANCHOR_PORTFOLIO.filter(p => !p.active).reduce((s, p) => s + p.cost, 0);

  // Worst-case regret across the four scenarios
  const maxRegret = (k) => Math.max(...ANCHOR_SCENARIOS_DETAIL.map(s => s.regret[k]));

  return (
    <Card id="anchor" anchor icon={MountainSnow} title="Miami sea-level adaptation 2030–2070" subtitle="Anchor card · all techniques applied to one $XXB strategic dilemma" accent="fuchsia" index={11} source="all techniques · cards 01–10">
      <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/[0.06] p-4">
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <Star className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">the question · formally posed</span>
        </div>
        <p className="text-[14px] text-neutral-100 leading-relaxed">
          What sequence of <span className="font-mono text-fuchsia-200">adaptation investments</span> should Miami-Dade commit to between <span className="font-mono text-fuchsia-200">2025 and 2070</span>, given that <span className="font-mono text-fuchsia-200">SLR by 2070</span> could be anywhere from <span className="font-mono text-fuchsia-200">0.3m to 2.0m+</span> with no defensible probability distribution, and many investments are partially irreversible?
        </p>
        <div className="mt-2 grid md:grid-cols-3 gap-2 text-[10.5px]">
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">success criterion</span>
            <div className="text-neutral-300 mt-0.5">defensible coastal services maintained; insurance market intact; minimal forced retreat.</div>
          </div>
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">budget envelope</span>
            <div className="text-neutral-300 mt-0.5">~$30B over 45 years (~$0.7B/yr); reviewable every 6 years.</div>
          </div>
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">deep-uncertainty axes</span>
            <div className="text-neutral-300 mt-0.5">SLR (~0.3–2.0m), cost growth (~50–250%), federal support (binary), AMOC state.</div>
          </div>
        </div>
      </div>

      {/* Predict-then-reveal */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Lightbulb className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">predict the worst-case regret of the robust portfolio · drag</span>
        </div>
        <input
          type="range" min="5" max="100" step="5" value={predicted ?? 30}
          onChange={(e) => setPredicted(+e.target.value)}
          className="sf-range w-full"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>$5B</span><span>$50B</span><span>$100B</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-2">
          <div className="text-[12px] text-neutral-300">
            your guess: <span className="font-mono text-violet-200 text-lg">{predicted != null ? '$' + predicted + 'B' : '—'}</span>
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

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          {/* Step-through */}
          <div className="space-y-3">
            {[
              { step: '1 · admit Knightian uncertainty',  note: 'SLR by 2070 has no defensible distribution past 2050. Don\'t fake one.', color: 'rose',    ref: 'card 01' },
              { step: '2 · check tail behavior',          note: 'Damage cost ~ SLR^1.6 → fat-tailed. The 95th percentile dominates expected damage.', color: 'amber', ref: 'card 02' },
              { step: '3 · stop the cone',                note: 'Beyond ~2050 the SLR cone is too wide for statistical forecasting; switch to scenarios.', color: 'sky', ref: 'card 03' },
              { step: '4 · build 4 scenarios',            note: 'Manageable / Slow Burn / Lucky Pivot / Compound Crisis — span emissions × ice-sheet axes.', color: 'violet', ref: 'card 04' },
              { step: '5 · Monte Carlo within each',      note: 'For each scenario\'s parameters, simulate adaptation NPV under joint cost/SLR uncertainty.', color: 'cyan', ref: 'card 05' },
              { step: '6 · RDM stress-test',              note: 'Sweep ~5,000 parameter combinations; identify policies with min performance > $T across all.', color: 'emerald', ref: 'card 06' },
              { step: '7 · price option value of waiting', note: 'For each irreversible component (seawalls, surge barrier), compute the Dixit-Pindyck trigger.', color: 'amber', ref: 'card 07' },
              { step: '8 · build DAPP pathway map',        note: 'Pre-commit pathway sequence with SLR-trigger thresholds; signpost catalog locked.', color: 'orange', ref: 'card 08' },
              { step: '9 · audit with criteria',           note: 'Run maximin / minimax-regret / Hurwicz on the candidate portfolio. Confirm it survives multiple criteria.', color: 'rose', ref: 'card 09' },
              { step: '10 · sequence operational responses', note: 'Hedge + redundancy + optionality + slack + precaution combined into the action portfolio.', color: 'emerald', ref: 'card 10' },
            ].map((s, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-3 items-start">
                <div className={`text-[10px] uppercase tracking-[0.2em] font-mono ${chipPalette[s.color].split(' ')[1]} pt-0.5 whitespace-nowrap`}>{s.step}</div>
                <div className="text-[12px] text-neutral-200 leading-snug">
                  {s.note}{' '}<span className="text-[10px] text-neutral-500">({s.ref})</span>
                </div>
              </div>
            ))}
          </div>

          {/* The portfolio */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <Boxes className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">portfolio · committed today + options held in reserve</span>
            </div>
            <div className="space-y-1.5">
              {ANCHOR_PORTFOLIO.map((p, i) => (
                <div key={i} className="grid grid-cols-[minmax(220px,2fr)_3fr_minmax(70px,auto)] gap-3 items-center text-[11px]">
                  <div className="flex items-center gap-2">
                    {p.active
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      : <Hourglass className="w-3.5 h-3.5 text-neutral-500" />}
                    <span className={p.active ? 'text-neutral-100' : 'text-neutral-500'}>{p.k}</span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-sm overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${(p.cost / 12) * 100}%`, background: `${p.color}80`, borderRight: `2px solid ${p.color}` }} />
                  </div>
                  <span className={`font-mono text-right ${p.active ? 'text-emerald-300' : 'text-neutral-500'}`}>${p.cost.toFixed(1)}B</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
              <Stat label="commit today" value={`$${totalCommittedCost.toFixed(1)}B`} sub="across 6 layers" color="text-emerald-300" />
              <Stat label="held in reserve" value={`$${totalOptionCost.toFixed(1)}B`} sub="if signposts fire" color="text-amber-300" />
              <Stat label="max budget" value={`$${(totalCommittedCost + totalOptionCost).toFixed(1)}B`} sub="if all options exercised" color="text-fuchsia-300" />
            </div>
          </div>

          {/* Regret matrix */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <Crosshair className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">regret matrix ($B) across 4 scenarios</span>
            </div>
            <div className="grid grid-cols-[minmax(220px,2fr)_repeat(4,1fr)_minmax(70px,auto)] gap-1 text-[11px]">
              <div className="text-[9px] uppercase tracking-wider text-neutral-500">strategy / scenario →</div>
              {ANCHOR_SCENARIOS_DETAIL.map(s => (
                <div key={s.name} className="text-[9px] uppercase tracking-wider text-center"
                  style={{ color: s.color === 'emerald' ? '#6ee7b7' : s.color === 'amber' ? '#fbbf24' : s.color === 'violet' ? '#c4b5fd' : '#fb7185' }}
                >{s.sl2070.toFixed(1)}m</div>
              ))}
              <div className="text-[9px] uppercase tracking-wider text-fuchsia-300 text-right">worst</div>
              {ANCHOR_STRATEGIES.map(strat => (
                <React.Fragment key={strat.k}>
                  <div className={`pr-2 ${strat.k === 'robust' ? 'font-semibold' : ''} ${chipPalette[strat.color].split(' ')[1]}`}>
                    {strat.name}{strat.k === 'robust' && ' ★'}
                  </div>
                  {ANCHOR_SCENARIOS_DETAIL.map(scen => {
                    const v = scen.regret[strat.k];
                    const cellColor = v < 15 ? 'rgba(110, 231, 183, 0.30)' : v < 40 ? 'rgba(251, 191, 36, 0.28)' : 'rgba(251, 113, 133, 0.32)';
                    const txtColor = v < 15 ? '#a7f3d0' : v < 40 ? '#fde68a' : '#fda4af';
                    return (
                      <div key={scen.name} className="rounded text-center font-mono py-1" style={{ background: cellColor, color: txtColor }}>
                        {v}
                      </div>
                    );
                  })}
                  <div className={`text-right font-mono ${maxRegret(strat.k) < 30 ? 'text-emerald-300' : maxRegret(strat.k) < 60 ? 'text-amber-300' : 'text-rose-300'} ${strat.k === 'robust' ? 'font-semibold' : ''}`}>
                    {maxRegret(strat.k)}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 italic">
              The mixed portfolio (★) has the smallest worst-case regret ($28B in Compound Crisis) — meaningfully lower than aggressive engineering ($95B), aggressive retreat ($80B), or even staged adaptation ($70B). It's not best in any single scenario; it's the only one that doesn't fail catastrophically in any.
            </div>
          </div>

          {/* What's locked in vs option */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <div className="text-sm font-semibold text-emerald-200">Commit today (~$11B / 45 yr)</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· continued pumps + street-raise expansion</li>
                <li>· modular seawalls (vertical-extension ready)</li>
                <li>· land-bank for managed retreat (cheap optionality)</li>
                <li>· catastrophe bond pool (hedge)</li>
                <li>· monitoring & signpost infrastructure</li>
              </ul>
            </div>
            <div className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Hourglass className="w-3.5 h-3.5 text-amber-300" />
                <div className="text-sm font-semibold text-amber-200">Hold in reserve (~$20B if triggered)</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· storm-surge barrier (only if SSP3+/SSP5 by 2035)</li>
                <li>· active managed retreat (only if SLR &gt; 1m by 2055)</li>
                <li>· emergency federal-tier financing (only if Compound Crisis)</li>
                <li>· strict zoning enforcement (only if scenarios resolve high)</li>
              </ul>
            </div>
          </div>

          {/* Signposts */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <Telescope className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">signposts · pre-committed triggers for the next pathway</span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { sig: 'Tide gauge: monthly mean exceeds AR6 SSP3 trajectory for 24 consecutive months', action: 'Activate option: storm-surge barrier permitting & engineering' },
                { sig: 'AMOC strength index drops below 11 Sv', action: 'Activate option: accelerated WAIS contingency planning' },
                { sig: 'FEMA insurance pool loss ratio > 1.5 for 3 consecutive years', action: 'Activate option: insurance market restructuring' },
                { sig: 'Cumulative SLR hits 0.7m', action: 'Activate option: managed-retreat phase 1 (voluntary buyouts in lowest 5% elevation)' },
                { sig: 'Federal climate-adaptation appropriation falls below 2024 baseline real-dollars for 4 yr', action: 'Activate option: state-level financing pivot' },
                { sig: 'Cost-per-meter-prevented > $5B for 2 consecutive 6-yr review periods', action: 'Activate option: accept higher-elevation services-only zoning' },
              ].map((t, i) => (
                <div key={i} className="rounded-md border border-fuchsia-400/20 bg-fuchsia-500/[0.04] p-2.5">
                  <div className="flex gap-1.5 text-[11px]">
                    <Telescope className="w-3 h-3 mt-[3px] text-fuchsia-300 shrink-0" />
                    <div className="text-neutral-200 leading-snug">{t.sig}</div>
                  </div>
                  <div className="mt-1 pl-4 text-[10.5px] text-fuchsia-200/80 leading-snug">→ {t.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration graveyard */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300 mb-1">graveyard · common wrong answers to this question</div>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { wrong: '"Just use IPCC central estimate (~0.7m) and design for it."',  why: 'Optimizes for one scenario. In Compound Crisis (1.7m), every dollar spent is wasted; in Manageable (0.4m), the design is overkill. Worst-of-both.' },
                { wrong: '"Build the surge barrier now; over-engineer."',                why: 'Real-options trigger says wait — under high σ + high irreversibility, the option to wait has value. Premature commitment locks in $30B even if SLR resolves low.' },
                { wrong: '"Managed retreat is the only honest answer."',                  why: 'Politically and economically catastrophic in low-SLR scenarios; abandons billions in property value for a future that may not materialize. Right answer in Compound Crisis only.' },
                { wrong: '"Statistical SLR forecast says X with 95% PI [Y, Z]."',         why: '95% PI on 2070 SLR is honest as far as it goes — but ice-sheet tipping is outside the PI distribution. The PI is a Mediocristan answer to an Extremistan question.' },
              ].map((g, i) => (
                <div key={i} className="rounded-md border border-rose-400/20 bg-rose-400/[0.04] p-2.5">
                  <div className="text-[11px] text-rose-200 italic leading-snug">{g.wrong}</div>
                  <div className="mt-1 text-[10.5px] text-neutral-400 leading-snug"><span className="text-neutral-500">why wrong:</span> {g.why}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="rounded-xl border-l-4 border-fuchsia-400/50 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-fuchsia-300 shrink-0 mt-1" />
              <div>
                <div className="text-[13px] text-neutral-200 italic leading-relaxed">
                  "We do not have to choose between adaptation and mitigation. We have to do both. And we have to do them while admitting we don't know which scenario will play out — and design for that."
                </div>
                <div className="text-[10px] uppercase tracking-wider text-fuchsia-300/70 mt-1.5 not-italic">— paraphrase, Dutch Delta Programme advisory board, 2018</div>
              </div>
            </div>
          </div>

          <Misconception
            wrong="A robust portfolio is just a hedge — it costs more for the same expected outcome."
            right="A robust portfolio costs more in expectation under any single scenario, but has dramatically smaller worst-case regret. Under deep uncertainty, expected-cost is the wrong objective; worst-case regret with reasonable expected cost is right."
            because="The bias toward 'expected-value optimal' framing is everywhere in policy / capital budgeting. Under deep uncertainty it produces fragile strategies that look cheap on paper and fail catastrophically in adverse scenarios. The robust portfolio's premium ($3-5B above naive) buys $50B+ of avoided regret in tail scenarios."
          />

          <Deeper>
            <p>
              <strong>What this card is NOT doing.</strong> It's not predicting Miami's actual SLR — that's epistemically out of reach. It's not optimizing expected utility — that requires probabilities we don't have. It's not "the answer" — multiple defensible robust portfolios exist; this one is shown for illustration. What it IS doing: <em>making explicit</em> the deep-uncertainty toolkit applied to a real question, with named signposts and committed reviews.
            </p>
            <p>
              <strong>How this evolves between 6-yr review cycles.</strong> Every six years (Dutch Delta convention), the entire pathway map and portfolio is re-evaluated. Specific actions: refresh the 4 scenarios with latest IPCC + ice-sheet science; re-stress the portfolio against current parameter ranges; check signpost firings; promote / demote actions across the active/reserve boundary. The plan is a tree; the pruning is annual; the architecture is multi-decadal.
            </p>
            <p>
              <strong>Public-finance dimension.</strong> The action portfolio shown above totals ~$11B committed + ~$20B in options — bigger than any single municipality can absorb. Realistic financing: state of Florida + federal (FEMA, USACE, HUD), with climate-bond instruments and possibly catastrophe-bond layered hedging. The deep-uncertainty framework doesn't fix this; it just makes the conditional commitments legible to fiscal planners.
            </p>
            <p>
              <strong>Who else has done this.</strong> Dutch Delta Programme since 2008. London Thames Estuary 2100 plan since 2012 (also DAPP-based). NYC ReBuild post-Sandy (less formally adaptive but RDM-influenced). California Water Plan since 2009. The pattern: governments that committed to adaptive planning early have been able to act sooner and revise more cheaply than those still negotiating each major action one at a time.
            </p>
          </Deeper>

          <WhenItMatters>
            Anywhere a multi-decade strategic decision under deep uncertainty is on the table: climate adaptation (Miami, NOLA, Bangladesh), AI safety regulation, pandemic preparedness, energy transition pacing, defense procurement under regime uncertainty, sovereign debt structuring, infrastructure capex. The same skeleton (scenarios → MC → RDM → real options → DAPP → portfolio + signposts) generalizes; the parameters and stakes change.
          </WhenItMatters>

          <QA items={[
            { q: 'Is this a climate-adaptation card or a deep-uncertainty card?',  a: 'Both. Miami SLR is the worked example for the deep-uncertainty toolkit. The same framework applies to AI governance, pandemic prep, energy capex, and any other multi-decade Knightian problem; only the parameters change.' },
            { q: 'How would I run this exercise for my own decision?',  a: '(1) Write the question formally (event, deadline, success criteria, budget). (2) Identify the 2 deeply-uncertain axes; build 4 scenarios (card 04). (3) Build a candidate portfolio of layered responses (card 10). (4) Stress-test against scenarios with regret matrix (card 09). (5) Identify trigger signposts (card 08). (6) Set the 6-yr review cycle. Plan to revisit annually until you\'ve seen one trigger fire, then revisit immediately.' },
          ]} />
        </motion.div>
      )}
    </Card>
  );
};

/* ============================================================================
   12 — WHERE EACH TOOLKIT FAILS
   ========================================================================== */

const BoundaryCard = () => {
  const [hov, setHov] = useState(null);
  // 3-toolkit comparison along several axes
  const ROWS = [
    { axis: 'When probabilities are well-defined',         a: 'works well',  b: 'works well',  c: 'overkill',     desc: 'Risk regime: stocks, recurring operational forecasting. A or B is right tool.' },
    { axis: 'Repeated events, stationary process',         a: 'good',        b: 'best',        c: 'overkill',     desc: 'Statistical/ML forecasting (B) dominates given enough history.' },
    { axis: 'Discrete one-shot events with priors',        a: 'best',        b: 'overkill',    c: 'overkill',     desc: 'Judgmental forecasting (A) — base rates + Bayesian updating + premortem.' },
    { axis: 'Multi-decade, no analog data',                a: 'breaks',      b: 'breaks',      c: 'works well',   desc: 'Climate, AI capability, geopolitical regime — Knightian, deep uncertainty.' },
    { axis: 'Fat-tail outcomes (war, pandemic, AMOC)',     a: 'breaks',      b: 'partly',      c: 'works well',   desc: 'A and B can give numbers; only C handles the question of whether numbers are meaningful.' },
    { axis: 'Strong covariates, short horizon',            a: 'fine',        b: 'best',        c: 'overkill',     desc: 'Electricity load, retail demand, weather. B with feature engineering wins.' },
    { axis: 'Strategic / agent-driven outcomes',           a: 'best',        b: 'breaks',      c: 'partly',       desc: 'Geopolitics, market, AI race dynamics. Reflexivity breaks B; A handles via premortem.' },
    { axis: 'Multiple stakeholders, contested goals',      a: 'partly',      b: 'breaks',      c: 'best',         desc: 'Public policy, infrastructure decisions. C\'s scenario / RDM tools handle multi-stakeholder contestation.' },
    { axis: 'Decisions with high reversibility cost',      a: 'partly',      b: 'overkill',    c: 'best',         desc: 'Real options + DAPP are designed for this exact case.' },
  ];
  const cellStyle = (v) => {
    if (v === 'best')      return { bg: 'rgba(110, 231, 183, 0.30)', txt: '#a7f3d0' };
    if (v === 'works well')return { bg: 'rgba(110, 231, 183, 0.18)', txt: '#a7f3d0' };
    if (v === 'good')      return { bg: 'rgba(125, 211, 252, 0.18)', txt: '#bae6fd' };
    if (v === 'fine')      return { bg: 'rgba(125, 211, 252, 0.14)', txt: '#bae6fd' };
    if (v === 'partly')    return { bg: 'rgba(251, 191, 36, 0.20)',  txt: '#fde68a' };
    if (v === 'overkill')  return { bg: 'rgba(163, 163, 163, 0.18)', txt: '#a3a3a3' };
    if (v === 'breaks')    return { bg: 'rgba(251, 113, 133, 0.30)', txt: '#fda4af' };
    return { bg: 'transparent', txt: '#737373' };
  };

  return (
    <Card id="boundary" icon={AlertTriangle} title="Where each toolkit fails — A vs B vs C" subtitle="The honest map: which forecasting/decision toolkit applies in which regime, and where each one breaks" accent="sky" index={12}>
      <MinSchema>
        Three toolkits in this series:{' '}<CrossLink to="superforecasting" target="#superforecasting" recap="Judgmental forecasting (A): humans giving probabilities to discrete events. Calibration, base rates, Bayesian updating.">A · judgmental</CrossLink>,{' '}<CrossLink to="statistical-forecasting" target="#statistical-forecasting" recap="Statistical/ML forecasting (B): time series, regression, prediction intervals. ETS, ARIMA, Prophet, GBM, conformal.">B · statistical/ML</CrossLink>,{' '}and C · this explainer. Each works in a different regime; using the wrong one is the most common modeling error.
      </MinSchema>

      <p>
        Knowing which tool applies is half the work. The boundaries:
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">decision-regime × toolkit · hover for the why</span>
        </div>
        <div className="grid grid-cols-[minmax(220px,2.5fr)_repeat(3,1fr)] gap-1 text-[11px]">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500">regime / toolkit →</div>
          <div className="text-[9px] uppercase tracking-wider text-violet-300 text-center">A · judgmental</div>
          <div className="text-[9px] uppercase tracking-wider text-emerald-300 text-center">B · statistical</div>
          <div className="text-[9px] uppercase tracking-wider text-cyan-300 text-center">C · deep uncertainty</div>
          {ROWS.map((r, i) => (
            <React.Fragment key={i}>
              <div
                className="text-neutral-200 pr-2 cursor-help py-1.5"
                onMouseEnter={(e) => setHov({ desc: r.desc, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHov({ desc: r.desc, mx: e.clientX, my: e.clientY })}
                onMouseLeave={() => setHov(null)}
              >{r.axis}</div>
              {[r.a, r.b, r.c].map((v, j) => {
                const s = cellStyle(v);
                return (
                  <div key={j} className="rounded text-center font-mono py-1.5 text-[10px]" style={{ background: s.bg, color: s.txt }}>
                    {v}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <FloatingTip hover={hov} render={(h) => (
          <div className="text-neutral-200 text-[11.5px] leading-snug">{h.desc}</div>
        )} />
      </div>

      <Misconception
        wrong="With enough effort, statistical forecasting (B) can handle anything."
        right="B handles risk and ambiguity well. It breaks under deep Knightian uncertainty (no analog data) and under reflexivity (decisions feed back into outcomes). Pretending it can produces confidently-wrong forecasts that drive bad decisions."
        because="The 'just throw more data at it' instinct is a category error when the data-generating process is itself uncertain or non-existent. The honest move is to switch toolkits at the boundary, not push B further."
      />

      <Worked title="Three real-world questions, three toolkits">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>"What will electricity load be next week?"</strong> → B. Statistical/ML forecasting on hourly load with weather covariates and conformal intervals.</li>
          <li><strong>"Will SpaceX achieve fully reusable orbital flight by end-2026?"</strong> → A. Judgmental forecast: outside view (engineering precedents), Bayesian update on test data, premortem.</li>
          <li><strong>"How much should Miami spend on adaptation between 2030 and 2070?"</strong> → C. Deep uncertainty: scenarios, RDM, real options, DAPP. (The card 11 anchor.)</li>
        </ul>
        <p className="mt-2">
          Combining toolkits: B forecasts within a single C-scenario; A informs the prior probability of structural shifts that move you between scenarios. Real practice usually combines all three, but the "headline" toolkit reflects the dominant regime of the question.
        </p>
      </Worked>

      <Predict question="When should A and C disagree about the same question?">
        When the question is borderline-Knightian. A will give you a probability (e.g. "P(AMOC collapse by 2100) = 8%"); C will say "no defensible probability — plan for both possibilities". They're not contradicting; they're applying different epistemic stances. The right move depends on the decision: for a one-off bet, take A's number. For a multi-decade infrastructure commitment with massive irreversibility, ignore A's number and use C's scenario framework. Both A and C can be right for different decisions on the same question.
      </Predict>

      <Deeper>
        <p>
          <strong>Why this trichotomy matters operationally.</strong> Most organizations have a "default forecasting / decision-making mode" — usually B for tech / ops shops, A for intel / consulting, C for academic policy. When the underlying regime shifts, the default fails silently. The 2008 financial crisis was an institution-wide failure to recognize the underlying regime had shifted from B (mortgage default modeling under stationary distributions) to C (correlated tail behavior under structural shock). Knowing which toolkit applies — and being willing to switch — is itself a form of meta-decision-making.
        </p>
        <p>
          <strong>The "calibrated under risk, miscalibrated under uncertainty" problem.</strong> A forecaster (or statistical model) calibrated on past data can be perfectly calibrated <em>within</em> the historical regime and still systematically wrong outside it. The Brier score is a within-regime quality measure. It tells you nothing about whether the regime applies to your current decision. The Knight diagnostic in card 01 is the gate: pass through it before scoring.
        </p>
        <p>
          <strong>Hybrid practice.</strong> Sophisticated real-world forecasting combines all three. A judgmental forecaster (A) sets the prior for structural-shift events; a statistical model (B) quantifies the within-regime trajectory; a scenario / RDM framework (C) handles the structural-shift outcomes. The Dutch Delta Programme uses all three explicitly. Climate-economy models (DICE, FUND, RICE) use B for economic projection within scenarios and C for inter-scenario robustness. Modern AI safety analysis blends A (capability forecasting), B (compute / scaling laws), and C (governance scenarios).
        </p>
        <p>
          <strong>Where the trichotomy ends.</strong> There's a fourth regime — <em>radical reflexivity</em> — where the act of forecasting changes the outcome being forecast (election forecasts moving votes, AI capability forecasts driving compute investment, climate forecasts driving emissions policy). All three toolkits handle this poorly. The frontier of decision research (game-theoretic mechanism design, Goodhart-aware forecasting) is grappling with it. None of the three explainers in this series fully covers it.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Can I just use C for everything to be safe?',                                    a: 'No — C is overkill for many problems and produces worse decisions when probabilities ARE well-defined. Using C on a routine demand-forecasting problem replaces a calibrated 5% MAPE with vague scenarios and decision criteria. Match the toolkit to the regime.' },
        { q: 'How do I know which regime I\'m in for a question I\'ve never seen before?',     a: 'Three diagnostics from card 01: (1) consensus distribution available? (2) repeatability / stationarity? (3) outcomes contested? "Yes" to all three → A or B. "No" to (1) but yes to (2-3) → ambiguity, B with sensitivity. "No" to all → C.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — NEXT TRAILS
   ========================================================================== */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Closing the trilogy — and where to go from here" accent="violet" index={13}>
    <MinSchema>
      C closes the three-explainer series on forecasting and decision-making. Together: A (humans, discrete events, probabilities), B (continuous series, statistical/ML), C (deep uncertainty, no probabilities). For most real questions, you mix all three.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers · the trilogy',
        note: 'this is C · the third and final',
        items: [
          { label: 'A · Superforecasting (judgmental)', href: '#superforecasting', note: 'Humans giving probabilities to discrete events. Calibration, base rates, Fermi-izing, Bayesian updating, premortems. Anchored on the 2028 robotaxi question.' },
          { label: 'B · Statistical/ML forecasting',     href: '#statistical-forecasting', note: 'Continuous noisy series under uncertainty. Decomposition, ETS, ARIMA, Prophet, GBM, conformal prediction. Anchored on a real ERCOT week.' },
          { label: 'Systems Thinking',                   href: '#systems-thinking', note: 'Stocks, flows, feedback, delays — the topology underneath every forecasting and decision problem. The substrate of all three.' },
          { label: 'The World Economy',                  href: '#world-economy', note: 'Macro context. Most C-style decisions (climate, infrastructure, geopolitics) live in the economic regime mapped here.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'the next layer of detail',
        items: [
          { label: 'Knight · Risk, Uncertainty, Profit (1921)',     note: 'The original. Read chapters 7-8 for the distinction; the rest is dated economics.', external: true },
          { label: 'Taleb · The Black Swan (2007), Antifragile (2012)', note: 'Fat-tail thinking applied to decision-making and institutional design. Polemical but important.', external: true },
          { label: 'Lempert et al. · Shaping the Next One Hundred Years (RAND 2003)', note: 'The foundational RDM book. Computational decision-making for long-horizon problems.', external: true },
          { label: 'Haasnoot, Kwakkel · Dynamic Adaptive Policy Pathways (2013)',     note: 'The DAPP method paper. With Walker / van der Pas, the standard reference.', external: true },
          { label: 'Dixit & Pindyck · Investment Under Uncertainty (1994)',           note: 'The real-options bible for capital decisions under uncertainty.', external: true },
          { label: 'Schwartz · The Art of the Long View (1991)',                       note: 'The accessible scenario-planning book. Wack\'s 1972 Shell case study still the canonical example.', external: true },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math / philosophy under the hood',
        items: [
          { label: 'Decision theory (Savage, Wald, Hurwicz)', note: 'Foundations of choice without probabilities. The original 1950s work that produced the criteria in card 09.' },
          { label: 'Ambiguity & robust Bayes (Schmeidler, Gilboa)', note: 'Modern formal treatment of decision under uncertainty. Multi-prior models, maxmin EU.' },
          { label: 'Stochastic processes & Lévy processes', note: 'The math of fat-tailed dynamics. Generalizes Brownian motion to power-law jumps.' },
          { label: 'Real options theory', note: 'Beyond Dixit-Pindyck: Trigeorgis, Brennan & Schwartz. The financial-engineering parent of operational real options.' },
          { label: 'Complex systems & Lindy effect', note: 'When fragility is a function of age and structure, not just shock magnitude. Bridges Taleb to network science.' },
        ],
      },
      {
        title: 'Zoom out · domains where C-thinking is critical',
        note: 'multi-decade decisions under deep uncertainty',
        items: [
          { label: 'Climate adaptation', note: 'Sea-level rise (this card), heat / wildfire migration, water stress, food systems, sovereign debt under climate risk. Trillion-dollar global question.' },
          { label: 'AI safety & governance', note: 'Race dynamics, capability uncertainty, alignment under reflexivity. The most-live deep-uncertainty domain of the 2020s.' },
          { label: 'Pandemic preparedness', note: 'Stockpiles, surveillance, vaccine platforms. Post-2020 increased focus; still chronically underinvested due to mean-optimization bias.' },
          { label: 'Nuclear policy & energy transition', note: 'Long-horizon, fat-tailed, irreversible. Real options + DAPP framing dominant in serious treatments.' },
          { label: 'Sovereign-scale infrastructure (HSR, transmission, ports)', note: '50-100 year asset life, deep uncertainty about demand patterns. Modular / staged design from real-options reasoning.' },
          { label: 'Existential risk research', note: 'Bostrom, Ord. Scope where Knightian + irreversible + civilizational stakes dominate; the precautionary principle gets its strongest defense here.' },
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
        <span className="text-violet-300">Knight (1921) · Risk, Uncertainty, Profit</span>
        <span className="text-amber-300">Taleb · The Black Swan · Antifragile</span>
        <span className="text-emerald-300">Lempert et al. (RAND) · RDM</span>
        <span className="text-orange-300">Haasnoot et al. · DAPP / Delta Programme</span>
        <span className="text-cyan-300">Dixit & Pindyck · Investment Under Uncertainty</span>
        <span className="text-fuchsia-300">IPCC AR6 · NOAA · Miami-Dade</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sea-level numbers and adaptation costs are illustrative composites of public estimates (NOAA, Miami-Dade, USACE) through 2025. The decision frameworks are research-grade; the dollar figures are stylized. Treat all projections as conditional, not predictive.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function DeepUncertaintyExplainer() {
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
          background: #67e8f9; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(103,232,249,0.4);
        }
        input[type=range].sf-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #67e8f9; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <KnightCard />
        <FatTailsCard />
        <ConeCard />
        <ScenariosCard />
        <MonteCarloCard />
        <RDMCard />
        <RealOptionsCard />
        <DAPPCard />
        <CriteriaCard />
        <OperationalCard />
        <AnchorCard />
        <BoundaryCard />
        <NextTrails />
      </main>

      <Footer />
    </div>
  );
}
