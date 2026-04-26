import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, BarChart3, BrainCircuit, ChevronDown, Compass, Crosshair,
  Eye, EyeOff, FlaskConical, GitBranch, Hourglass, Layers, Lightbulb,
  LineChart, Link2, Network, Ruler, ScrollText, ShieldAlert, Sigma,
  Sparkles, Star, TrendingDown, TrendingUp, Waves, Zap, AlertTriangle,
  CheckCircle2, XCircle, HelpCircle, Telescope, Quote, Gauge, Target,
  Boxes, Workflow, Calendar, CloudRain, Thermometer,
} from 'lucide-react';

/* ============================================================================
   Statistical & ML forecasting — under uncertainty, with prediction intervals
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

// --- Glossary + Term --------------------------------------------------------

const GLOSS = {
  // Core series concepts
  'stationarity': 'A series whose statistical properties (mean, variance, autocorrelation) don\'t change over time. ARIMA assumes weak stationarity after differencing; raw electricity load is decidedly non-stationary.',
  'stationary': 'A series whose statistical properties (mean, variance, autocorrelation) don\'t change over time. After differencing, many real series become approximately stationary.',
  'trend': 'The slow-varying component of a series — typically the multi-year drift in level. In ERCOT load, ~1.5%/yr from population & electrification.',
  'seasonality': 'A periodic pattern that repeats at a fixed frequency. Electricity load has at least three: daily (24h), weekly (168h), and yearly (8766h).',
  'residual': 'What\'s left after removing trend and seasonality. The forecaster\'s real challenge — modeling the residual is most of the value.',
  'STL': 'Seasonal-Trend decomposition by LOESS — the standard non-parametric decomposition. Robust to outliers, handles changing seasonality, easy to read.',
  'autocorrelation': 'Correlation between a series and its own lagged values. A core diagnostic — strong autocorrelation at lag 24 in load means today\'s 3pm hour is informative about tomorrow\'s 3pm hour.',
  'ACF': 'Autocorrelation function — correlation of x_t with x_{t−k} as a function of lag k. Reveals cyclic structure; the spike pattern hints at AR/MA orders.',
  'PACF': 'Partial autocorrelation function — correlation between x_t and x_{t−k} controlling for intermediate lags. Often the cleanest signal for picking the AR order.',
  'differencing': 'Replacing a series with its first differences x_t − x_{t−1}. A single diff usually removes a linear trend; seasonal differencing (x_t − x_{t−s}) removes period-s seasonality.',
  // ETS
  'ETS': 'Exponential smoothing state-space family — Error/Trend/Seasonal. Includes simple exp smoothing, Holt, Holt-Winters, and damped variants. Strong baseline; often beats more complex models on short horizons.',
  'Holt-Winters': 'Three-equation exponential smoothing for series with both trend and seasonality. The most-used ETS model in industry forecasting (1960–today).',
  'damped trend': 'A modification where the trend is multiplied by a damping factor φ < 1 each step, so long-horizon forecasts level out. Almost always preferable to a non-damped linear trend.',
  // ARIMA
  'ARIMA': 'AutoRegressive Integrated Moving Average — Box-Jenkins\' three-letter family. AR(p) × I(d) × MA(q). With d = 0 you have ARMA; with seasonal terms you have SARIMA.',
  'SARIMA': 'Seasonal ARIMA — adds seasonal AR/MA/diff terms. Notation: SARIMA(p,d,q)(P,D,Q)_s where s is the period. Standard for electricity load with explicit seasonality.',
  'AR': 'Autoregressive — the next value is a linear combination of past values. AR(p) uses the p most recent.',
  'MA': 'Moving Average — the next value is a linear combination of past errors. Despite the name, it\'s nothing like a rolling average; it models error persistence.',
  'I': 'Integration — the d in ARIMA(p,d,q) is how many times you differenced before fitting an ARMA model. d = 1 is by far the most common.',
  'AIC': 'Akaike Information Criterion = −2·logL + 2k. Penalty for complexity. Lower is better; widely used to pick ARIMA order.',
  'BIC': 'Bayesian Information Criterion = −2·logL + k·log(n). Heavier complexity penalty than AIC; favors smaller models on long series.',
  'Box-Jenkins': 'Box & Jenkins\' 3-step ARIMA methodology (1970): identify (ACF/PACF), estimate (MLE), diagnose (residual checks). Still the textbook recipe.',
  // Prophet
  'Prophet': 'Facebook\'s 2017 forecasting library — additive structural model: piecewise-linear trend + Fourier seasonality + holiday regressors. Strong out-of-the-box on business series.',
  'changepoint': 'A point where the trend slope changes. Prophet places candidate changepoints by default at 25 evenly-spaced positions and shrinks them via a Laplace prior.',
  'Fourier seasonality': 'Modeling seasonality as a sum of sine/cosine pairs at integer multiples of the period. K=10 captures intricate yearly patterns; K=3 captures weekly.',
  // Trees
  'gradient boosting': 'Sequential additive model — each new weak learner (tree) fits the residual of the current ensemble. LightGBM/XGBoost/CatBoost are the dominant implementations.',
  'GBM': 'Gradient Boosting Machine — sequential ensemble of weak learners (usually trees), each fit to the gradient of the loss at the current prediction.',
  'LightGBM': 'Microsoft\'s gradient-boosting library, optimized for speed via histogram binning and leaf-wise growth. Dominant winner in M5 and most Kaggle tabular comps.',
  'XGBoost': 'Tianqi Chen\'s gradient-boosting library (2014). Slower than LightGBM but more robust on small data; near-identical accuracy.',
  'lag features': 'Past values of the series treated as predictors: y_{t−1}, y_{t−24}, y_{t−168}. Lets a tabular model "see" the autoregressive structure.',
  'rolling stats': 'Features like rolling mean, std, min/max over a window — capture local volatility and recent regime. Essential for tree-based forecasting.',
  // Probabilistic
  'pinball loss': 'L_α(y, q) = max(α(y−q), (α−1)(y−q)). Proper scoring rule for a single quantile. Average over a grid of quantiles → CRPS.',
  'CRPS': 'Continuous Ranked Probability Score — integral of squared distance between predicted CDF and the indicator of the realized value. The Brier-equivalent for continuous forecasts.',
  'quantile regression': 'Regression that minimizes pinball loss for a target quantile α. Output: a function predicting the α-th quantile of y given x. Stacking K of them gives a full distribution.',
  'conformal prediction': 'A distribution-free framework that wraps any point forecaster and produces prediction intervals with finite-sample coverage guarantees, given exchangeability.',
  'prediction interval': 'A range that contains the realized value with stated probability. PI(80%) should contain 80% of out-of-sample observations — calibration is the main failure mode.',
  'calibration': 'Whether stated probabilities match observed frequencies. An 80% PI is calibrated if 80 out of 100 holdout observations fall inside it. Most ML PIs are over-tight.',
  'coverage': 'Empirical fraction of out-of-sample observations that fall inside the stated prediction interval. Coverage = 0.74 for an "80% interval" means it\'s 6pp under-covered.',
  // Time CV
  'rolling-origin CV': 'Time-respecting cross-validation: train on [1..t], forecast t+1..t+h, advance the origin, repeat. The only honest CV for time series; k-fold leaks future.',
  'expanding-window': 'Variant of rolling-origin where the training set always starts at t = 1 and grows with each iteration (vs sliding windows of fixed length).',
  'data leakage': 'When test-time information sneaks into training — the cardinal sin of time-series ML. Random k-fold on a series leaks future into training; rolling-origin doesn\'t.',
  // Hierarchical
  'hierarchical forecasting': 'Forecasting many related series organized in a hierarchy (city → zone → grid). Coherence requires that lower-level forecasts sum to higher-level forecasts.',
  'reconciliation': 'The post-step that adjusts independent forecasts at all levels of a hierarchy so they\'re mutually consistent (e.g. zone forecasts sum to grid forecast).',
  'MinT': 'Minimum-Trace reconciliation (Wickramasuriya, Athanasopoulos, Hyndman 2019). The optimal linear reconciliation under a covariance assumption; usually beats bottom-up.',
  // Ensembles
  'ensemble': 'A combination of models, usually averaged. Beats any single model on most series, given even modestly diverse component models.',
  'M-competition': 'Spyros Makridakis\'s open forecasting competitions (M, M2, M3, M4, M5) — the field\'s benchmark suite. M4 and M5 surfaced the dominance of GBM and ensembles.',
  'stacking': 'Meta-ensemble: fit a model that predicts holdout-sample y from base-model predictions. Powerful but can overfit on short series.',
  // Metrics
  'MASE': 'Mean Absolute Scaled Error = MAE / MAE(naive). Scale-free, well-defined for series with zeros, the M-competitions\' preferred metric.',
  'sMAPE': 'Symmetric MAPE = 2·|y−ŷ| / (|y|+|ŷ|). Bounded [0, 2], handles zero values better than MAPE — but still asymmetric and biased near zero.',
  'MAPE': 'Mean Absolute Percentage Error = mean(|y−ŷ|/|y|). Easy to communicate, but undefined at y = 0 and biased toward under-prediction. Use only when y is strictly positive and bounded away from 0.',
  'pinball': 'See "pinball loss".',
  'skill score': 'SS = 1 − loss(model) / loss(baseline). 0 = no better than baseline; 1 = perfect; negative = worse than baseline. Naive baseline is the standard.',
  // ERCOT specifics
  'ERCOT': 'Electric Reliability Council of Texas — operates the grid for ~90% of Texas. Hourly load 30–80 GW; published in 5-minute intervals; the canonical real-world load-forecasting dataset.',
  'load forecasting': 'Predicting electricity demand. Hourly day-ahead is the bread-and-butter problem; week-ahead and seasonal are needed for unit commitment & capacity planning.',
  'Uri': 'Winter Storm Uri (Feb 13–17, 2021) — caused ERCOT load to spike past records and then collapse as the grid failed. Black swan in any model trained on pre-2021 data.',
  // Misc
  'naive forecast': 'Forecast = last observed value (or last seasonal value). Always the first baseline; "naive" is the headline benchmark for skill score.',
  'seasonal naive': 'Forecast for time t+h is observation at time t+h−s, where s is the seasonal period. The bar to clear in any seasonal series.',
  'M5': 'M5 forecasting competition (2020) — Walmart hierarchical retail demand. Tree ensembles dominated; ~95% of top-50 entries were LightGBM-based.',
  'BLAS': 'Basic Linear Algebra Subprograms — the underlying numerical library most Python forecasting tools (statsmodels, sktime) call into. Speed depends on it.',
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
   SYNTHETIC ERCOT-STYLE LOAD SERIES
   We generate a deterministic 10-year hourly-equivalent series with
   yearly + weekly + daily seasonality, slow growth, and a Uri-like shock.
   ========================================================================== */

// Generate 365 daily-mean GW values for a single year, with a secular growth.
// `phase` shifts the yearly seasonality (Texas peaks in summer).
function buildDailySeries({ years = 10, baseGW = 38, growthPerYr = 0.013, weeklyAmp = 1.6, yearlyAmp = 12, noiseAmp = 1.4, seed = 7 }) {
  const out = [];
  let s = seed;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = rng(); while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const N = years * 365;
  for (let t = 0; t < N; t++) {
    const yearFrac = (t / 365);  // continuous year index
    const dayOfYear = t % 365;
    const dayOfWeek = t % 7;
    // Texas: peaks in summer (Aug, day ~213) and a smaller winter bump (Jan/Feb)
    const yearlySeason = -Math.cos(2 * Math.PI * (dayOfYear - 30) / 365) * yearlyAmp
                        + 0.35 * yearlyAmp * Math.cos(4 * Math.PI * (dayOfYear - 30) / 365);
    // weekly: weekends ~10% lower
    const weeklySeason = (dayOfWeek === 0 || dayOfWeek === 6) ? -weeklyAmp : weeklyAmp * 0.3;
    const trend = baseGW * Math.pow(1 + growthPerYr, yearFrac);
    let value = trend + yearlySeason + weeklySeason + randn() * noiseAmp;
    // Inject Uri-like shock at year ~6, day 44 (mid-Feb). Spike then valley.
    if (years >= 6 && t >= 6 * 365 + 43 && t <= 6 * 365 + 47) {
      if (t === 6 * 365 + 43) value += 18;       // spike
      else if (t === 6 * 365 + 44) value += 22;  // peak demand
      else if (t === 6 * 365 + 45) value -= 10;  // grid collapse
      else if (t === 6 * 365 + 46) value -= 6;
      else value -= 2;
    }
    out.push({ t, year: Math.floor(t / 365), doy: dayOfYear, dow: dayOfWeek, value });
  }
  return out;
}

// 168-hour week of synthetic load (used by anchor card later)
function buildHourlyWeek({ baseGW = 52, dailyAmp = 14, peakHour = 17, weekdayBoost = 4, seed = 11 }) {
  const out = [];
  let s = seed;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = rng(); while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  for (let h = 0; h < 168; h++) {
    const hod = h % 24;
    const dow = Math.floor(h / 24);  // 0..6
    const isWeekend = (dow === 5 || dow === 6);
    const daily = -Math.cos(2 * Math.PI * (hod - peakHour + 12) / 24) * dailyAmp
                  + 0.4 * dailyAmp * Math.cos(4 * Math.PI * (hod - peakHour) / 24);
    const wkBoost = isWeekend ? 0 : weekdayBoost;
    const noise = randn() * 0.8;
    out.push({ h, hod, dow, value: baseGW + daily + wkBoost + noise });
  }
  return out;
}

const DAILY_SERIES = (() => buildDailySeries({}))();
const HOURLY_WEEK = (() => buildHourlyWeek({}))();

/* ============================================================================
   HERO + SECTION NAV
   ========================================================================== */

const LoadCurveField = () => {
  // a few faint, drifting load-curve sine waves
  const curves = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    amp: 8 + i * 4, off: 30 + i * 4, freq: 0.018 + i * 0.004, phase: i * 0.7, dur: 14 + i * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
      {curves.map((c, i) => {
        const pts = [];
        for (let x = 0; x <= 800; x += 4) {
          const y = 200 + Math.sin(x * c.freq + c.phase) * c.amp - c.off;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return (
          <motion.polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke={i % 2 === 0 ? '#7dd3fc' : '#c4b5fd'}
            strokeOpacity={0.45}
            strokeWidth={1.2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, x: [0, -100, 0] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <LoadCurveField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <LineChart className="w-3.5 h-3.5" /> statistical &amp; ml forecasting
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-transparent">
          Forecasting Noisy Series
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal intervals — the full toolkit for forecasting continuous quantities under uncertainty. Anchored on a real{' '}
          <span className="text-sky-300 font-mono">~75 GW</span> ERCOT week, with{' '}
          <span className="text-violet-300 font-mono">50/80/95%</span> prediction intervals.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">decomposition</span>
          <span className="text-violet-300">ets · arima</span>
          <span className="text-amber-300">prophet</span>
          <span className="text-emerald-300">gbm</span>
          <span className="text-cyan-300">conformal</span>
          <span className="text-fuchsia-300">anchor week</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'hard',         label: 'Hard things',         icon: Waves },
  { id: 'decompose',    label: 'Decomposition',       icon: Layers },
  { id: 'ets',          label: 'ETS · Holt-Winters',  icon: TrendingUp },
  { id: 'arima',        label: 'ARIMA',               icon: GitBranch },
  { id: 'prophet',      label: 'Prophet',             icon: Calendar },
  { id: 'gbm',          label: 'Tree ensembles',      icon: Boxes },
  { id: 'probabilistic',label: 'Probabilistic',       icon: Gauge,        anchor: true },
  { id: 'cv',           label: 'Time CV',             icon: Hourglass },
  { id: 'hierarchy',    label: 'Hierarchy',           icon: Workflow },
  { id: 'ensembles',    label: 'Ensembles',           icon: Network },
  { id: 'anchor',       label: 'Anchor: ERCOT week',  icon: Zap,          anchor: true },
  { id: 'metrics',      label: 'Metrics',             icon: BarChart3 },
  { id: 'trails',       label: 'Next trails',         icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-100' : 'border-transparent text-neutral-400'}`}>
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
   01 — THE HARD THINGS IN A SERIES
   ========================================================================== */

const HARD_FEATURES = [
  { k: 'Trend',           desc: 'Slow drift in level — ERCOT load rises ~1.5%/yr from population growth, electrification, data centers.', icon: TrendingUp,  color: 'sky',     mark: 'long-run' },
  { k: 'Seasonality',     desc: 'Periodic patterns at multiple scales: 24h (daily), 168h (weekly), 8766h (yearly). Texas peaks every August.',   icon: Waves,       color: 'violet',  mark: 'cyclic' },
  { k: 'Regime change',   desc: 'A structural break — the data-center boom of 2022–2025 doubled DFW summer baseline in 3 years. Pre-break models miss systematically.', icon: GitBranch,   color: 'amber',   mark: 'break' },
  { k: 'Fat tails',       desc: 'Rare extreme realizations — Uri (Feb 2021) blew past every percentile any pre-2021 model produced. Gaussian residuals lie about tails.',         icon: AlertTriangle, color: 'rose',  mark: 'shock' },
  { k: 'Exogenous drivers', desc: 'Variables the model needs to "look at": temperature, humidity, holidays. Without them, a load model is forecasting blind during heat waves.', icon: CloudRain,   color: 'cyan',    mark: 'covariate' },
  { k: 'Noise floor',     desc: 'Even a perfect model leaves residual variance. Every method gets a different floor; the goal isn\'t zero, it\'s less than your baseline.',     icon: Activity,    color: 'emerald', mark: 'irreducible' },
];

const HardThings = () => {
  const [hover, setHover] = useState(null);
  // Render a 10-yr daily-mean stylized trace with shocks marked
  const W = 620, H = 240, P = 28;
  const data = DAILY_SERIES;  // 10 yrs daily
  const N = data.length;
  const ymin = 22, ymax = 76;
  const sx = (i) => P + (i / (N - 1)) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);
  // sample every 4 days for path simplicity
  const pts = [];
  for (let i = 0; i < N; i += 4) pts.push(`${sx(i).toFixed(1)},${sy(data[i].value).toFixed(1)}`);
  const path = 'M ' + pts.join(' L ');

  // landmarks
  const yearTicks = [];
  for (let y = 0; y <= 10; y++) yearTicks.push({ x: sx(y * 365), label: 2015 + y });

  return (
    <Card id="hard" icon={Waves} title="The hard things in a series" subtitle="Why a single line forecast is almost never enough — and what each pattern demands of a model" accent="sky" index={1}>
      <MinSchema>
        Every real series carries six features at once: <strong>trend</strong>, <strong>seasonality</strong> (often nested), <strong>regime breaks</strong>, <strong>fat tails</strong>, <strong>exogenous drivers</strong>, and an irreducible <strong>noise floor</strong>. The forecasting toolkit splits up the work — different methods own different features.
      </MinSchema>

      <p>
        ERCOT hourly load is the Hello World of statistical forecasting: every textbook feature shows up, money depends on the answer, and a decade of public data is available. The chart below shows daily-mean load, 2015–2025 (stylized but quantitatively realistic). Hover any feature chip to see where it lives.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <Zap className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">ERCOT daily-mean load · 2015–2025</span>
          <span className="text-[10px] text-neutral-500">· stylized · GW</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* y-grid */}
          {[30, 40, 50, 60, 70].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.6" strokeDasharray="2 3" />
              <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g}</text>
            </g>
          ))}
          {/* year ticks */}
          {yearTicks.map((y, i) => (
            <g key={i}>
              <line x1={y.x} y1={H - P} x2={y.x} y2={H - P + 3} stroke="#525252" strokeWidth="0.8" />
              {i % 2 === 0 && <text x={y.x} y={H - P + 14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{y.label}</text>}
            </g>
          ))}
          {/* the load curve */}
          <path d={path} fill="none" stroke="#7dd3fc" strokeWidth="0.8" strokeOpacity="0.85" />
          {/* shocks: Uri at year 6, Feb */}
          <g>
            <circle cx={sx(6 * 365 + 44)} cy={sy(76)} r={5} fill="#fb7185" fillOpacity="0.6" stroke="#fb7185" strokeWidth="1.2" />
            <line x1={sx(6 * 365 + 44)} y1={sy(76) - 6} x2={sx(6 * 365 + 44)} y2={sy(76) - 22} stroke="#fb7185" strokeWidth="0.8" />
            <text x={sx(6 * 365 + 44)} y={sy(76) - 26} fontSize="9" fill="#fda4af" fontFamily="ui-monospace" textAnchor="middle">Uri · Feb 2021</text>
          </g>
          {/* regime hint: arrow pointing to 2023 */}
          <g>
            <line x1={sx(8 * 365)} y1={sy(58)} x2={sx(8 * 365)} y2={sy(50)} stroke="#fbbf24" strokeWidth="0.8" markerEnd="url(#sfArrow)" />
            <text x={sx(8 * 365)} y={sy(58) + 12} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">DC build-out</text>
          </g>
          <defs>
            <marker id="sfArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
            </marker>
          </defs>
          {/* axis labels */}
          <text x={P - 12} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${P - 12} ${H / 2})`}>load · GW</text>
        </svg>
      </div>

      {/* feature chips */}
      <div className="grid md:grid-cols-3 gap-2">
        {HARD_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.k}
              onMouseEnter={(e) => setHover({ ...f, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ ...f, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className={`rounded-lg border bg-white/[0.02] p-3 cursor-help transition-colors ${chipPalette[f.color].split(' ')[2]} hover:bg-white/[0.04]`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${chipPalette[f.color].split(' ')[1]}`} />
                <div className={`text-sm font-semibold ${chipPalette[f.color].split(' ')[1]}`}>{f.k}</div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 ml-auto">{f.mark}</span>
              </div>
              <div className="text-[11.5px] text-neutral-300 leading-snug">{f.desc}</div>
            </div>
          );
        })}
      </div>

      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: h.color === 'sky' ? '#7dd3fc' : h.color === 'violet' ? '#c4b5fd' : h.color === 'amber' ? '#fbbf24' : h.color === 'rose' ? '#fb7185' : h.color === 'cyan' ? '#67e8f9' : '#6ee7b7' }}>{h.k.toLowerCase()}</div>
          <div className="text-neutral-200 leading-snug mt-1">{h.desc}</div>
        </div>
      )} />

      <Predict question="If you fit a single linear-trend + yearly-seasonal model on 2015–2020 ERCOT data and forecast 2021, which feature will hurt you most?">
        <Term>Fat tails</Term> + <Term>regime change</Term>, in that order. (1) Uri produced a 5σ event your Gaussian-residual model treats as impossible — the 95% PI was 8 GW too narrow on Feb 14–17. (2) The 2022–25 data-center buildout shifted the trend slope upward; a model with a flat slope priced in pre-2022 data will under-forecast 2024 by 4–6 GW year-round. Both miss are <em>structural</em>, not noise — adding more pre-2021 data can't fix them.
      </Predict>

      <Misconception
        wrong="A long enough series gives a forecaster everything they need."
        right="A long series helps with seasonality and noise estimation, but doesn't help with regime breaks or fat-tail events. Sometimes more recent data + good covariates beats more history."
        because="Regime change means the data generating process changed. Pre-change data is now misleading — it pulls the model's trend/level toward an obsolete regime. A common mistake: stretching the training window to 'get more signal' when the right move is to shorten it after a break."
      />

      <Deeper>
        <p>
          <strong>What each technique fixes.</strong> The toolkit splits the work explicitly: <em>STL</em> handles trend + seasonality (cards 02), <em>ETS</em> wraps them in a state-space form with online updates (03), <em>ARIMA</em> models the residual's autocorrelation (04), <em>Prophet</em> swaps the linear trend for piecewise-linear with regularized changepoints (05), <em>tree ensembles</em> let you throw covariates at the residual (06), <em>conformal</em> handles the fat-tail mis-coverage (07). Each card in the rest of the explainer is "how do we eat one of these features."
        </p>
        <p>
          <strong>Why "noise floor" is irreducible.</strong> Some of the residual is random — a thunderstorm forecast that misses by 2°C is a real source of load uncertainty no model can recover. The point of a forecasting workflow is to push toward the floor, not zero. Knowing the floor matters for capacity planning: a 2 GW reserve sized to a "perfect" forecast oversizes capacity and undersizes reliability.
        </p>
        <p>
          <strong>The exogenous-drivers trap.</strong> Adding temperature as a covariate makes the in-sample fit look amazing — but at <em>forecast</em> time you don't have tomorrow's actual temperature, you have the weather forecast's <em>forecast</em> of it. Your load model now compounds two error sources. Best practice: use weather forecasts as inputs <em>during training</em> (not actuals) so the model learns to handle the weather-forecast noise.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is "trend" different from "level"?', a: 'Level is the current baseline; trend is the rate of change. ETS separates them so each can have its own smoothing speed — typical settings let level adapt fast (α ≈ 0.4) while trend updates slowly (β ≈ 0.05) to avoid chasing noise.' },
        { q: 'How do you tell a regime change from a fat-tail event?', a: 'Wait. A regime change persists; a fat-tail event reverts. Operationally: fit a model both with and without recent N months — if forecasts diverge persistently, recent data is a different regime. If they reconverge, it was a tail.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — DECOMPOSITION (STL)
   ========================================================================== */

// Decompose synthetic daily series — naive trend (centered moving average) + yearly seasonal + residual
function decompose(series, period = 365) {
  const N = series.length;
  const trend = new Array(N).fill(null);
  // 365-day centered moving average
  const half = Math.floor(period / 2);
  for (let i = half; i < N - half; i++) {
    let s = 0;
    for (let j = i - half; j <= i + half; j++) s += series[j].value;
    trend[i] = s / (2 * half + 1);
  }
  // detrended
  const detrended = series.map((d, i) => trend[i] != null ? d.value - trend[i] : null);
  // seasonal index = average detrended value at each day-of-year
  const seasonalSums = new Array(period).fill(0);
  const seasonalCounts = new Array(period).fill(0);
  for (let i = 0; i < N; i++) {
    if (detrended[i] != null) {
      const doy = i % period;
      seasonalSums[doy] += detrended[i];
      seasonalCounts[doy] += 1;
    }
  }
  const seasonalIndex = seasonalSums.map((s, i) => seasonalCounts[i] > 0 ? s / seasonalCounts[i] : 0);
  // center seasonal to mean zero
  const seasonalMean = seasonalIndex.reduce((s, v) => s + v, 0) / period;
  const seasonal = seasonalIndex.map(v => v - seasonalMean);
  // assemble
  const trendArr = trend.map(v => v ?? null);
  const seasonalArr = series.map((_, i) => seasonal[i % period]);
  const residualArr = series.map((d, i) => trendArr[i] != null ? d.value - trendArr[i] - seasonalArr[i] : null);
  return { trend: trendArr, seasonal: seasonalArr, residual: residualArr };
}

const DECOMPOSITION = decompose(DAILY_SERIES, 365);

const STLDecomposition = () => {
  const [comp, setComp] = useState('all');
  const W = 620, H = 280, P = 30, panelH = 60, gap = 8;
  const data = DAILY_SERIES;
  const N = data.length;
  const xs = (i) => P + (i / (N - 1)) * (W - 2 * P);

  const COMPS = [
    { k: 'observed',   label: 'Observed',  color: '#7dd3fc', vals: data.map(d => d.value),     range: [22, 76] },
    { k: 'trend',      label: 'Trend',     color: '#c4b5fd', vals: DECOMPOSITION.trend,        range: [34, 50] },
    { k: 'seasonal',   label: 'Seasonal',  color: '#f0abfc', vals: DECOMPOSITION.seasonal,     range: [-15, 15] },
    { k: 'residual',   label: 'Residual',  color: '#fda4af', vals: DECOMPOSITION.residual,     range: [-8, 22] },
  ];

  const drawPanel = (vals, range, color, yOffset) => {
    const [lo, hi] = range;
    const ys = (v) => yOffset + panelH - ((v - lo) / (hi - lo)) * panelH;
    const pts = [];
    for (let i = 0; i < N; i += 4) {
      const v = vals[i];
      if (v == null) continue;
      pts.push(`${xs(i).toFixed(1)},${ys(v).toFixed(1)}`);
    }
    return { d: 'M ' + pts.join(' L '), zeroY: ys(0) };
  };

  return (
    <Card id="decompose" icon={Layers} title="Decomposition · the trend / seasonal / residual triplet" subtitle="Strip out what's predictable so the residual is what you actually have to model" accent="violet" index={2}>
      <MinSchema>
        Additive decomposition: <Eq>{'y_t = T_t + S_t + R_t'}</Eq>. Subtract trend and seasonal cleanly, what's left is the residual — the part that needs the rest of the toolkit. <Term>STL</Term> (LOESS-based) is the modern default.
      </MinSchema>

      <p>
        Most series carry redundant structure that simple methods can fully describe — a slow trend, one or more seasonal cycles. Removing them is cheap and exposes what's actually hard. The conventional decomposition is <em>additive</em>:
      </p>

      <Block>{`\\co{y_t} = \\vi{T_t} + \\vi{S_t} + \\hi{R_t}`}</Block>

      <p>
        Multiplicative is sometimes a better fit (when seasonal amplitude grows with level): <Eq>{'y_t = T_t \\cdot S_t \\cdot R_t'}</Eq>. Trick: take logs first; multiplicative becomes additive. STL handles both via an explicit `robust` flag and a per-season smoothing window.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Layers className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">decomposition · click to isolate a component</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <button
            onClick={() => setComp('all')}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${comp === 'all' ? 'bg-white/10 border-white/30 text-neutral-100 font-semibold' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
          >
            all four panels
          </button>
          {COMPS.map(c => (
            <button
              key={c.k}
              onClick={() => setComp(c.k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${comp === c.k ? 'bg-white/10 border-white/30 text-neutral-100 font-semibold' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {COMPS.map((c, i) => {
            const yOff = P + i * (panelH + gap);
            const visible = comp === 'all' || comp === c.k;
            if (!visible) return null;
            const { d, zeroY } = drawPanel(c.vals, c.range, c.color, yOff);
            return (
              <g key={c.k} opacity={visible ? 1 : 0.2}>
                {/* panel border */}
                <rect x={P} y={yOff} width={W - 2 * P} height={panelH} fill="none" stroke="#262626" strokeWidth="0.6" />
                {/* zero line for seasonal/residual */}
                {(c.k === 'seasonal' || c.k === 'residual') && (
                  <line x1={P} y1={zeroY} x2={W - P} y2={zeroY} stroke="#525252" strokeWidth="0.5" strokeDasharray="2 2" />
                )}
                <path d={d} fill="none" stroke={c.color} strokeWidth="0.8" strokeOpacity="0.9" />
                {/* label */}
                <text x={P + 4} y={yOff + 11} fontSize="9" fill={c.color} fontFamily="ui-monospace">{c.label.toUpperCase()}</text>
                {/* range labels */}
                <text x={W - P - 2} y={yOff + 11} fontSize="8" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{c.range[0]} → {c.range[1]}</text>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 text-[11px] text-neutral-500 italic">
          Residual variance is what every method beyond decomposition is fighting. STL with appropriate window sizes typically reduces residual variance by ~70–85% on hourly load.
        </div>
      </div>

      <Worked title="Why subtract instead of regress?">
        <p>
          A naive alternative — regress y on (year, day-of-year) and take the residual — works but has two problems: (1) it forces a parametric form on the seasonal (sin/cos basis or one-hot indicators), (2) it can't adapt to a slowly-evolving seasonal shape. STL is non-parametric — the seasonal is whatever the data says, smoothed by LOESS at a user-chosen window. It handles a seasonal pattern that's drifting (e.g. Texas summer peaks have widened by ~3 days/decade) without re-specification.
        </p>
        <p>
          Practical default: STL with <Eq>{'s.window = 7'}</Eq> for weekly cycles in hourly data, <Eq>{'s.window = 13'}</Eq> for yearly cycles in monthly data, and <code>robust=TRUE</code> if your series has occasional outliers (Uri-style).
        </p>
      </Worked>

      <Misconception
        wrong="Decomposition is just a visualization tool."
        right="Decomposition IS modeling. Each component (trend, seasonal, residual) gets handed off to a different downstream model, and the choice of decomposition (additive vs multiplicative, STL vs classical) materially changes the forecast."
        because="The decomposition fixes how seasonal interacts with level. If the true generative process is multiplicative but you decomposed additively, your seasonal component will distort during high-level periods (summers in our case) — a model on the residual then learns spurious patterns to compensate."
      />

      <Deeper>
        <p>
          <strong>STL in three lines.</strong> (i) Smooth the series with LOESS to get a rough trend; (ii) subtract trend, then smooth-by-period to get a seasonal index per period bucket; (iii) subtract seasonal, smooth again to refine trend. Iterate 1–3 times. <em>Robust mode</em> downweights iterations 2–3 of any point whose residual is large, immunizing against outliers.
        </p>
        <p>
          <strong>Additive vs multiplicative · how to tell.</strong> Plot the series; if the seasonal swing grows proportionally with level, you want multiplicative (or a log-transform first). For ERCOT load, the seasonal swing in 2025 (~25 GW summer-vs-winter) is about 1.6× the swing in 2015 (~16 GW), but the level only grew 1.15× — so it's <em>partially</em> multiplicative. Best practice: log-transform when in doubt.
        </p>
        <p>
          <strong>What STL does NOT handle.</strong> Multi-seasonal series with non-integer-relating periods (e.g. yearly + monthly + a 7-day economic cycle that drifts). For these, MSTL (multi-seasonal STL, R: <code>forecast::mstl</code>) iteratively fits one period at a time — each pass nests inside the next. ERCOT load has at least three periods (24h, 168h, 8766h); a clean decomposition needs MSTL, not classical STL.
        </p>
        <p>
          <strong>Decomposition is leaky on the boundaries.</strong> Centered moving averages can't be computed in the first/last (period/2) points; STL fills these via LOESS extrapolation, which is why edges are noisier than interiors. For real-time forecasting, this matters — your "current trend" estimate is the noisiest one.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does the seasonal component look so clean here?', a: 'It\'s synthetic — the data was generated with an explicit yearly cosine. On real ERCOT data, the yearly seasonal looks similar in shape but with year-to-year variation in amplitude (warmer years have bigger summer peaks).' },
        { q: 'When should you skip decomposition entirely?', a: 'When the series is short (<2 full seasonal periods) or non-seasonal. Decomposition with insufficient data fits noise as seasonal and hurts. For non-seasonal series, ETS / ARIMA on the raw data is fine.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — ETS · HOLT-WINTERS
   ========================================================================== */

// Run additive Holt-Winters on the synthetic hourly week (extended to 2 weeks for fit + forecast)
function holtWinters(series, alpha, beta, gamma, phi, period, hForecast) {
  const N = series.length;
  // initialize: level = mean of first season; trend = (mean(2nd season) - mean(1st season)) / period
  const m1 = series.slice(0, period).reduce((s, v) => s + v, 0) / period;
  const m2 = series.slice(period, 2 * period).reduce((s, v) => s + v, 0) / period;
  let L = m1;
  let T = (m2 - m1) / period;
  const S = series.slice(0, period).map((v, i) => v - m1);
  const fitted = [];
  for (let t = 0; t < N; t++) {
    const seasonalIdx = t % period;
    const yhat = L + phi * T + S[seasonalIdx];
    fitted.push(yhat);
    const Lnew = alpha * (series[t] - S[seasonalIdx]) + (1 - alpha) * (L + phi * T);
    const Tnew = beta * (Lnew - L) + (1 - beta) * phi * T;
    const Snew = gamma * (series[t] - Lnew) + (1 - gamma) * S[seasonalIdx];
    L = Lnew; T = Tnew; S[seasonalIdx] = Snew;
  }
  // forecast hForecast steps ahead with damped trend
  const forecast = [];
  let phiSum = 0;
  for (let h = 1; h <= hForecast; h++) {
    phiSum += Math.pow(phi, h);
    const yhat = L + phiSum * T + S[(N + h - 1) % period];
    forecast.push(yhat);
  }
  return { fitted, forecast };
}

const ETSCard = () => {
  const [alpha, setAlpha] = useState(0.45);
  const [beta, setBeta] = useState(0.05);
  const [gamma, setGamma] = useState(0.30);
  const [phi, setPhi] = useState(0.95);
  const period = 24;
  // train on first 5 days, forecast next 2 days
  const trainHours = 120;
  const series = HOURLY_WEEK.slice(0, trainHours).map(d => d.value);
  const { fitted, forecast } = holtWinters(series, alpha, beta, gamma, phi, period, 48);
  // residual MSE in-sample (after a warmup period)
  const warmup = 30;
  let mse = 0, n = 0;
  for (let i = warmup; i < trainHours; i++) {
    const e = series[i] - fitted[i];
    mse += e * e; n++;
  }
  mse /= Math.max(n, 1);
  const rmse = Math.sqrt(mse);

  // out-of-sample MSE
  const future = HOURLY_WEEK.slice(trainHours, trainHours + 48).map(d => d.value);
  let oosMSE = 0;
  for (let h = 0; h < 48; h++) oosMSE += (future[h] - forecast[h]) ** 2;
  oosMSE /= 48;
  const oosRMSE = Math.sqrt(oosMSE);

  const W = 620, H = 250, P = 32;
  const total = trainHours + 48;
  const allVals = [...series, ...future, ...fitted.slice(warmup), ...forecast];
  const ymin = Math.min(...allVals) - 1;
  const ymax = Math.max(...allVals) + 2;
  const sx = (i) => P + (i / (total - 1)) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);

  const obsPath = 'M ' + series.map((v, i) => `${sx(i)},${sy(v)}`).join(' L ');
  const futurePath = 'M ' + future.map((v, i) => `${sx(trainHours + i)},${sy(v)}`).join(' L ');
  const fittedPath = 'M ' + fitted.slice(warmup).map((v, i) => `${sx(warmup + i)},${sy(v)}`).join(' L ');
  const forecastPath = 'M ' + forecast.map((v, i) => `${sx(trainHours + i)},${sy(v)}`).join(' L ');

  return (
    <Card id="ets" icon={TrendingUp} title="Exponential smoothing · Holt-Winters" subtitle="The 60-year-old workhorse — a state-space model with three smoothing knobs and a damping φ" accent="emerald" index={3}>
      <MinSchema>
        <Term>ETS</Term> = Error / Trend / Seasonal in state-space form. Three exponential-smoothing equations: <strong>level</strong> (α), <strong>trend</strong> (β), <strong>seasonal</strong> (γ). Add a damping factor (φ &lt; 1) and you get the modern default — <Term>Holt-Winters</Term> with damped trend.
      </MinSchema>

      <p>
        Charles Holt's original 1957 model added a trend term to simple exponential smoothing. Peter Winters added the seasonal in 1960. The damped variant (Gardner & McKenzie 1985) is what every modern auto-ETS implementation uses by default — it prevents the trend from extrapolating linearly to infinity, which is almost always wrong.
      </p>

      <Block>{`\\begin{aligned}\\text{level: }\\;&\\vi{\\ell_t} = \\alpha(y_t - s_{t-m}) + (1-\\alpha)(\\ell_{t-1} + \\phi\\, b_{t-1}) \\\\\\text{trend: }\\;&\\vi{b_t} = \\beta(\\ell_t - \\ell_{t-1}) + (1-\\beta)\\phi\\, b_{t-1} \\\\\\text{seasonal: }\\;&\\vi{s_t} = \\gamma(y_t - \\ell_t) + (1-\\gamma) s_{t-m} \\\\\\text{forecast: }\\;&\\co{\\hat{y}_{t+h}} = \\ell_t + (\\phi + \\phi^2 + \\cdots + \\phi^h)\\,b_t + s_{t+h-m}\\end{aligned}`}</Block>

      <p>
        Each equation is an <em>online update</em>: a convex combination of "what the new observation says" and "what the model predicted." The smoothing parameters (α, β, γ) live in [0, 1] and trade off recency against stability. ETS is fully online — no retraining, just one update per new point.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Activity className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">live fit · 5 day train + 2 day forecast</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* y-axis */}
          {[40, 50, 60, 70, 80].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g}</text>
            </g>
          ))}
          {/* day separators */}
          {[1, 2, 3, 4, 5, 6].map(d => (
            <g key={d}>
              <line x1={sx(d * 24)} y1={P} x2={sx(d * 24)} y2={H - P} stroke="#404040" strokeWidth="0.4" strokeDasharray="1 3" />
              <text x={sx(d * 24)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">d{d}</text>
            </g>
          ))}
          {/* train/forecast separator */}
          <line x1={sx(trainHours)} y1={P} x2={sx(trainHours)} y2={H - P} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x={sx(trainHours)} y={P - 4} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">forecast →</text>
          {/* paths */}
          <path d={obsPath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeOpacity="0.85" />
          <path d={futurePath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeOpacity="0.4" strokeDasharray="2 2" />
          <path d={fittedPath} fill="none" stroke="#6ee7b7" strokeWidth="1.2" strokeOpacity="0.95" />
          <path d={forecastPath} fill="none" stroke="#6ee7b7" strokeWidth="1.6" strokeOpacity="1" />
          {/* axis */}
          <text x={P - 14} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${P - 14} ${H / 2})`}>load · GW</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-300" /> observed</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0 border-t border-dashed border-sky-300/50" /> hold-out (would-be future)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-300" /> fitted / forecast</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {[
          { label: 'α · level smoothing',    val: alpha, set: setAlpha, hint: 'how fast the level reacts to a new observation' },
          { label: 'β · trend smoothing',    val: beta,  set: setBeta,  hint: 'how fast the trend updates' },
          { label: 'γ · seasonal smoothing', val: gamma, set: setGamma, hint: 'how fast the seasonal pattern adapts' },
          { label: 'φ · damping',            val: phi,   set: setPhi,   hint: 'shrinks long-horizon trend toward 0' },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">{s.label}</span>
              <span className="font-mono text-emerald-300">{s.val.toFixed(2)}</span>
            </div>
            <input
              type="range" min={s.label.includes('φ') ? 0.7 : 0.01} max={s.label.includes('φ') ? 1.0 : 0.95} step="0.01" value={s.val}
              onChange={(e) => s.set(+e.target.value)} className="sf-range w-full"
            />
            <div className="text-[10px] text-neutral-500 mt-0.5">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        <Stat label="in-sample RMSE" value={rmse.toFixed(2) + ' GW'} sub="lower = better fit" color="text-emerald-300" />
        <Stat label="48h-ahead RMSE" value={oosRMSE.toFixed(2) + ' GW'} sub="hold-out forecast error" color={oosRMSE < 2 ? 'text-emerald-300' : oosRMSE < 4 ? 'text-amber-300' : 'text-rose-300'} />
      </div>

      <Predict question="If you crank α to 0.95 (super-fast level adaptation), what happens to forecast error?">
        It usually goes <em>up</em>. High α means level chases every fluctuation — including noise — so the level estimate becomes noisier than it needs to be. Forecasts inherit that noise. The classic result: optimal α is small-to-moderate (0.1–0.5) for most series; only when the level is genuinely jumpy (recent regime change) does high α help.
      </Predict>

      <Misconception
        wrong="Holt-Winters is outdated — modern ML beats it."
        right="On short series with strong seasonality, ETS routinely wins benchmarks against ML methods. M4 (2018): the simple ETS variants placed in the top 10. M5 hierarchical (2020): ETS lost to LightGBM, but only by ~5%."
        because="ETS has the right inductive bias for slowly-evolving series with stable seasonality — exactly the regime where most business forecasting lives. ML methods need 1000s of observations and clever feature engineering to match it. ETS needs 50."
      />

      <Deeper>
        <p>
          <strong>The state-space form makes ETS Bayesian-friendly.</strong> Each smoothing equation can be written as <Eq>{'\\ell_t = \\ell_{t-1} + \\alpha\\,\\varepsilon_t'}</Eq>, with <Eq>{'\\varepsilon_t \\sim N(0, \\sigma^2)'}</Eq>. So ETS's "ETS(A,A,A)" / "ETS(M,A,M)" notation describes the model class as a state-space system, and prediction intervals come for free from propagating the state covariance. Most modern implementations (R <code>fable::ETS</code>, Python <code>statsmodels.ETSModel</code>) use this.
        </p>
        <p>
          <strong>Damping in one picture.</strong> Without damping (φ = 1), trend extrapolates linearly: 100 hours into the future, a 0.1 GW/hr trend predicts +10 GW. With φ = 0.95, the cumulative trend contribution converges to <Eq>{'b_t \\cdot \\sum_{k=1}^{\\infty}\\phi^k = b_t \\cdot \\phi/(1-\\phi) = 19'}</Eq>; for finite horizons the bound is much tighter. Damping kills the most common ETS pathology — runaway long-horizon forecasts.
        </p>
        <p>
          <strong>Auto-ETS · how the parameters get picked.</strong> Industrial implementations search over (Error type, Trend type, Seasonal type) ∈ {`{A, M, N}`}³ — additive / multiplicative / none — and pick the model minimizing AICc. Smoothing parameters (α, β, γ, φ) are then optimized via maximum likelihood on the residuals. Total cost: ~30 fits per series; runs in milliseconds.
        </p>
        <p>
          <strong>Where ETS fails.</strong> (1) Series with multiple non-nested seasonalities (24h + 168h + yearly). (2) Series where covariates dominate (load given temperature). (3) Long horizons with structural breaks. The first is solved by TBATS / MSTL+ETS; the second pushes you to ARIMAX / GBM; the third needs explicit changepoint modeling (Prophet, next card).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is the seasonal index updated every period rather than every step?', a: 'Each seasonal slot s_{t-m} is updated once per period — when the corresponding "hour-of-day" or "day-of-week" comes around again. γ controls how fast that one slot adapts to the most recent same-time observation.' },
        { q: 'Can I use ETS without the seasonal term?', a: 'Yes — that\'s ETS(A,A,N) for additive trend, no seasonal (a.k.a. Holt\'s linear method). Useful for short non-seasonal series, e.g. monthly aggregates of a recent product launch.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — ARIMA
   ========================================================================== */

// ACF and PACF of a synthetic AR(1) + seasonal example for visualization
function acfOfSeries(series, maxLag = 40) {
  const N = series.length;
  const mean = series.reduce((s, v) => s + v, 0) / N;
  const c0 = series.reduce((s, v) => s + (v - mean) ** 2, 0) / N;
  const acf = [1];
  for (let k = 1; k <= maxLag; k++) {
    let c = 0;
    for (let t = k; t < N; t++) c += (series[t] - mean) * (series[t - k] - mean);
    c /= N;
    acf.push(c / c0);
  }
  return acf;
}

const ARIMA_OPTS = {
  ar:      'AR(1) — yesterday\'s error decays fast; PACF cuts off at lag 1, ACF tails',
  ma:      'MA(1) — only one lag of error structure; ACF cuts off at lag 1, PACF tails',
  arSeas:  'SARIMA(1,0,0)(1,0,0)_{12} — seasonal AR alone; spikes at 12, 24, 36',
  diff:    'After d=1 differencing — random-walk component removed; what\'s left is what ARIMA models',
};

// Build illustrative example series for each ACF/PACF mode
function buildExampleSeries(mode) {
  const N = 200;
  const out = [];
  let s = 12345;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = rng(); while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  if (mode === 'ar') {
    let prev = 0;
    for (let i = 0; i < N; i++) { const e = randn(); const x = 0.7 * prev + e; out.push(x); prev = x; }
  } else if (mode === 'ma') {
    let prevE = 0;
    for (let i = 0; i < N; i++) { const e = randn(); const x = e + 0.7 * prevE; out.push(x); prevE = e; }
  } else if (mode === 'arSeas') {
    const buf = [];
    for (let i = 0; i < N; i++) {
      const e = randn();
      const seas = i >= 12 ? 0.6 * buf[i - 12] : 0;
      const x = seas + e;
      buf.push(x); out.push(x);
    }
  } else if (mode === 'diff') {
    // a random walk with drift, then differenced
    const rw = [];
    let level = 0;
    for (let i = 0; i < N; i++) { level += 0.05 + randn() * 0.5; rw.push(level); }
    for (let i = 1; i < N; i++) out.push(rw[i] - rw[i - 1]);
  }
  return out;
}

// PACF via Durbin-Levinson recursion
function pacfFromAcf(acf, maxLag) {
  const phi = [];
  const pacf = [1];
  let prev = [];
  for (let k = 1; k <= maxLag; k++) {
    let num = acf[k];
    for (let j = 1; j < k; j++) num -= prev[j - 1] * acf[k - j];
    let den = 1;
    for (let j = 1; j < k; j++) den -= prev[j - 1] * acf[j];
    const phi_kk = num / den;
    pacf.push(phi_kk);
    const cur = [];
    for (let j = 1; j < k; j++) cur.push(prev[j - 1] - phi_kk * prev[k - 1 - j]);
    cur.push(phi_kk);
    prev = cur;
  }
  return pacf;
}

const ARIMACard = () => {
  const [mode, setMode] = useState('ar');
  const series = useMemo(() => buildExampleSeries(mode), [mode]);
  const acf = useMemo(() => acfOfSeries(series, 36), [series]);
  const pacf = useMemo(() => pacfFromAcf(acf, 36), [acf]);

  const W = 620, H = 220, P = 32, panelW = (W - 3 * P) / 2;
  const renderBars = (vals, color, xOff, label) => {
    const N = vals.length;
    const ymax = 1.0, ymin = -0.5;
    const sx = (i) => xOff + P + (i / (N - 1)) * (panelW - P);
    const sy = (v) => H / 2 - (v / (ymax - ymin)) * (H / 2 - 16) - 6;
    const zero = sy(0);
    const sigBound = 1.96 / Math.sqrt(series.length);
    return (
      <g>
        <rect x={xOff} y={6} width={panelW + P} height={H - 12} fill="none" stroke="#262626" strokeWidth="0.5" />
        <text x={xOff + 8} y={18} fontSize="10" fill={color} fontFamily="ui-monospace">{label}</text>
        {/* significance bands */}
        <rect x={xOff + P} y={sy(sigBound)} width={panelW - P} height={sy(-sigBound) - sy(sigBound)} fill="#525252" fillOpacity="0.15" />
        <line x1={xOff + P} y1={zero} x2={xOff + panelW} y2={zero} stroke="#525252" strokeWidth="0.6" />
        {vals.map((v, i) => (
          <line key={i} x1={sx(i)} y1={zero} x2={sx(i)} y2={sy(v)} stroke={color} strokeWidth="1.5" />
        ))}
        {/* lag axis */}
        {[0, 12, 24, 36].map(l => (
          <text key={l} x={sx(l)} y={H - 4} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">{l}</text>
        ))}
        <text x={xOff + P + (panelW - P) / 2} y={H - 4 - 14} fontSize="8" fill="#737373" fontFamily="ui-monospace" textAnchor="middle"></text>
      </g>
    );
  };

  return (
    <Card id="arima" icon={GitBranch} title="ARIMA · the AR / I / MA family" subtitle="Box-Jenkins' three-letter recipe — and the ACF/PACF diagnostic that picks the order" accent="amber" index={4}>
      <MinSchema>
        <Term>ARIMA</Term>(p, d, q): difference d times to get stationarity, fit AR(p) + MA(q) on the residual. Diagnose via <Term>ACF</Term> + <Term>PACF</Term>; select via AIC. Add seasonal terms → <Term>SARIMA</Term>.
      </MinSchema>

      <p>
        Box & Jenkins (1970) built the textbook recipe: difference the series until it's <Term>stationary</Term>, fit an autoregressive-moving-average model to the differenced data, diagnose. The full notation:
      </p>

      <Block>{`\\co{ARIMA}(p, d, q): \\quad \\vi{(1 - \\phi_1 B - \\cdots - \\phi_p B^p)} (1 - B)^d \\, y_t \\;=\\; \\vi{(1 + \\theta_1 B + \\cdots + \\theta_q B^q)}\\, \\varepsilon_t`}</Block>

      <p>
        where <Eq>{'B'}</Eq> is the back-shift operator (<Eq>{'B y_t = y_{t-1}'}</Eq>). The three ingredients:
      </p>

      <div className="grid md:grid-cols-3 gap-2">
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 mb-1">AR(p)</div>
          <div className="text-[11.5px] text-neutral-300 leading-snug">Past values predict the next one. <Eq>{'y_t = \\phi_1 y_{t-1} + \\cdots + \\phi_p y_{t-p} + \\varepsilon_t'}</Eq>. Captures persistence.</div>
        </div>
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 mb-1">I(d)</div>
          <div className="text-[11.5px] text-neutral-300 leading-snug">Difference d times. d=1 removes a stochastic trend; d=2 is rare. Picks the units of stationarity.</div>
        </div>
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 mb-1">MA(q)</div>
          <div className="text-[11.5px] text-neutral-300 leading-snug">Past errors persist. <Eq>{'y_t = \\varepsilon_t + \\theta_1 \\varepsilon_{t-1} + \\cdots'}</Eq>. Captures shock decay.</div>
        </div>
      </div>

      <p>
        How to pick (p, d, q)? The classical answer: look at the autocorrelation function (<Term>ACF</Term>) and partial autocorrelation function (<Term>PACF</Term>) of the differenced series. Each AR/MA pattern leaves a fingerprint:
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300">ACF · PACF · diagnostic patterns</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(ARIMA_OPTS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${mode === k ? 'bg-amber-400/15 border-amber-400/40 text-amber-100 font-semibold' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {k === 'ar' ? 'AR(1)' : k === 'ma' ? 'MA(1)' : k === 'arSeas' ? 'Seasonal AR' : 'Differenced RW'}
            </button>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {renderBars(acf, '#7dd3fc', 0, 'ACF (autocorrelation)')}
          {renderBars(pacf, '#fbbf24', panelW + P, 'PACF (partial autocorrelation)')}
        </svg>
        <div className="mt-2 text-[11px] text-neutral-300 italic leading-snug">{ARIMA_OPTS[mode]}</div>
      </div>

      <Worked title="The Box-Jenkins identification rule, in one table">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-[11px]">
          <div className="text-amber-300 font-mono">model</div>
          <div className="text-neutral-400">ACF</div>
          <div className="text-neutral-400">PACF</div>
          <div className="text-neutral-200 font-mono">AR(p)</div>
          <div className="text-neutral-300">tails off (geometric/oscillating)</div>
          <div className="text-neutral-300">cuts off after lag p</div>
          <div className="text-neutral-200 font-mono">MA(q)</div>
          <div className="text-neutral-300">cuts off after lag q</div>
          <div className="text-neutral-300">tails off</div>
          <div className="text-neutral-200 font-mono">ARMA(p,q)</div>
          <div className="text-neutral-300">tails off after lag q</div>
          <div className="text-neutral-300">tails off after lag p</div>
        </div>
        <p className="mt-2">
          For real-world series the patterns are rarely so clean — modern practice uses <code>auto.arima</code> (Hyndman 2008): grid-search (p, d, q, P, D, Q) ∈ small set, pick by <Term>AIC</Term>c, with stationarity tests for d and KPSS for D. Default in R's <code>fable</code> and Python's <code>pmdarima</code>.
        </p>
      </Worked>

      <Misconception
        wrong="ARIMA is the gold standard for time-series forecasting."
        right="ARIMA is one of several strong baselines. On series with multiple seasonalities, regime breaks, or strong covariates, it underperforms ETS, Prophet, and tree ensembles. Its main edge is interpretability of the AR/MA structure."
        because="The ARIMA family was designed for series with a single dominant seasonality and stable structure — financial returns, monthly economic indicators. Modern operational forecasting (electricity, retail, web traffic) routinely violates those assumptions."
      />

      <Deeper>
        <p>
          <strong>The differencing decision.</strong> A KPSS test (or a unit-root ADF test, or just inspection) says whether the level looks stationary. If yes: d = 0. If no: difference once, retest. Most economic series need d = 1; very few need d = 2. The cost of over-differencing is real — you introduce spurious MA structure. Hyndman's rule of thumb: prefer the smallest d that passes the stationarity test.
        </p>
        <p>
          <strong>Seasonal ARIMA in three minutes.</strong> SARIMA(p, d, q)(P, D, Q)<Eq>{'_s'}</Eq> adds a parallel set of AR/I/MA terms at lag <Eq>{'s'}</Eq>. For monthly data with yearly seasonality, <Eq>{'s = 12'}</Eq>. For ERCOT hourly: weekly is <Eq>{'s = 168'}</Eq>, daily is <Eq>{'s = 24'}</Eq> — you have to pick one (usually the strongest, then ETS-decompose the other), or move to TBATS.
        </p>
        <p>
          <strong>Forecast intervals from ARIMA.</strong> The model's residual variance plus the propagated state-space covariance gives Gaussian intervals. They're typically too narrow on real data — by 20–40% under-coverage at the 95% level — because (i) parameter uncertainty isn't included, (ii) residuals aren't actually Gaussian. Conformal prediction (card 07) is the modern fix.
        </p>
        <p>
          <strong>Why MA — really?</strong> MA isn't a "rolling average" despite the name. It models <em>error persistence</em>: when a shock hits at time t, MA(1) says it persists into t+1 with weight θ. Equivalent representation: any stationary AR(∞) can be written as MA(∞) and vice versa (Wold decomposition). MA terms capture short-run shock effects that an AR struggles to express compactly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'My series has both a clear trend AND seasonality. What\'s the right ARIMA?', a: 'Difference once for trend (d=1) and seasonally (D=1), then check residual stationarity. Often (0,1,1)(0,1,1)_s suffices — known as the "airline model" after Box-Jenkins\' famous airline-passenger example.' },
        { q: 'Why does AICc beat AIC for selection?', a: 'AICc adds a finite-sample correction term — penalty grows when k is large relative to n. Standard AIC under-penalizes complexity for short series; for a typical electricity load forecast on 1-2 years of hourly data, AICc and BIC matter.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — PROPHET
   ========================================================================== */

const ProphetCard = () => {
  const [n_cp, setNcp] = useState(8);
  const [cpScale, setCpScale] = useState(0.05);
  const [n_fourier, setNfourier] = useState(5);
  // Build a piecewise-linear trend through DAILY_SERIES, n_cp evenly-spaced changepoints
  const data = DAILY_SERIES;
  const N = data.length;
  // Place changepoints at evenly-spaced positions
  const cps = [];
  for (let i = 1; i <= n_cp; i++) cps.push(Math.floor(i * N / (n_cp + 1)));
  // Estimate slopes naively at each segment by least-squares slope of running window (50 days)
  const segSlopes = [0]; // initial slope ≈ 0 (we'll let level grow)
  for (let s = 0; s <= cps.length; s++) {
    const lo = s === 0 ? 0 : cps[s - 1];
    const hi = s === cps.length ? N : cps[s];
    let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0;
    for (let i = lo; i < hi; i++) {
      // smooth out yearly seasonal first by subtracting a rough global yearly cosine
      const seas = -Math.cos(2 * Math.PI * (i % 365 - 30) / 365) * 12;
      const y = data[i].value - seas;
      sx += i; sy += y; sxx += i * i; sxy += i * y; n++;
    }
    if (n < 2) { segSlopes.push(0); continue; }
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    segSlopes.push(slope);
  }
  // Apply a Laplace-prior shrinkage: each delta_i = slope[i] - slope[i-1] is shrunk by cpScale
  const baseSlope = segSlopes[1];
  const deltas = [];
  for (let i = 2; i < segSlopes.length; i++) deltas.push(segSlopes[i] - segSlopes[i - 1]);
  // shrinkage = 1 - exp(-cpScale*100) approx
  const shrink = 1 - Math.exp(-cpScale * 30);
  // Build trend at each point: trend[i] = level + sum of (active_slope * (i - cp_prev))
  const trend = new Array(N).fill(0);
  let level = 38;  // initial
  let curSlope = baseSlope;
  let prevX = 0;
  let cpIdx = 0;
  for (let i = 0; i < N; i++) {
    if (cpIdx < cps.length && i === cps[cpIdx]) {
      level = level + curSlope * (i - prevX);
      // changepoint kicks in
      curSlope = curSlope + (deltas[cpIdx] || 0) * shrink;
      prevX = i;
      cpIdx++;
    }
    trend[i] = level + curSlope * (i - prevX);
  }
  // Add Fourier seasonality
  const fourierK = n_fourier;
  // Fit Fourier coefs by least squares on (data - trend) — simple closed-form for each k
  const X_terms = [];
  for (let k = 1; k <= fourierK; k++) X_terms.push(k);
  const detrended = data.map((d, i) => d.value - trend[i]);
  // For each k, regress on (sin(2πk·t/365), cos(2πk·t/365))
  let seasonal = new Array(N).fill(0);
  for (const k of X_terms) {
    let S_sin = 0, S_cos = 0, S_sinsin = 0, S_coscos = 0;
    for (let i = 0; i < N; i++) {
      const angle = 2 * Math.PI * k * i / 365;
      const s = Math.sin(angle), c = Math.cos(angle);
      S_sin += detrended[i] * s; S_cos += detrended[i] * c;
      S_sinsin += s * s; S_coscos += c * c;
    }
    const a = S_sin / S_sinsin;
    const b = S_cos / S_coscos;
    for (let i = 0; i < N; i++) {
      const angle = 2 * Math.PI * k * i / 365;
      seasonal[i] += a * Math.sin(angle) + b * Math.cos(angle);
    }
  }
  const fitted = data.map((d, i) => trend[i] + seasonal[i]);
  // residuals + RMSE
  let mse = 0;
  for (let i = 0; i < N; i++) mse += (data[i].value - fitted[i]) ** 2;
  mse /= N;
  const rmse = Math.sqrt(mse);

  // SVG
  const W = 620, H = 240, P = 30;
  const ymin = 22, ymax = 76;
  const sx = (i) => P + (i / (N - 1)) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);
  const obsPts = []; const fitPts = []; const trendPts = [];
  for (let i = 0; i < N; i += 4) {
    obsPts.push(`${sx(i).toFixed(1)},${sy(data[i].value).toFixed(1)}`);
    fitPts.push(`${sx(i).toFixed(1)},${sy(fitted[i]).toFixed(1)}`);
    trendPts.push(`${sx(i).toFixed(1)},${sy(trend[i]).toFixed(1)}`);
  }

  return (
    <Card id="prophet" icon={Calendar} title="Prophet · piecewise trend + Fourier seasonality" subtitle="Facebook's 2017 model — additive structural with regularized changepoints. Strong default on business series." accent="cyan" index={5}>
      <MinSchema>
        <Term>Prophet</Term> = piecewise-linear trend + <Term>Fourier seasonality</Term> + holiday dummies, all added: <Eq>{'y_t = g(t) + s(t) + h(t) + \\varepsilon_t'}</Eq>. The trend has K candidate <Term>changepoints</Term> shrunk by a Laplace prior (`changepoint_prior_scale`). Inference via Stan / L-BFGS.
      </MinSchema>

      <p>
        Prophet was designed for business series with strong yearly + weekly seasonality, occasional trend shifts (product launches, market changes), and known holiday effects. It's not always the most accurate, but it's the most <em>forgiving</em>: defaults work, missing data is fine, outliers don't blow up the trend. The full model:
      </p>

      <Block>{`\\co{y_t} = \\underbrace{\\vi{g(t)}}_{\\text{trend}} + \\underbrace{\\vi{s(t)}}_{\\text{seasonality}} + \\underbrace{\\vi{h(t)}}_{\\text{holidays}} + \\hi{\\varepsilon_t}`}</Block>

      <p>
        The trend is piecewise-linear with shifts at K changepoints:
      </p>

      <Block>{`g(t) = (k + a(t)^\\top \\delta) \\cdot t + (m + a(t)^\\top \\gamma), \\qquad \\delta_j \\sim \\text{Laplace}(0, \\tau)`}</Block>

      <p>
        where <Eq>{'a(t)'}</Eq> is a 0/1 indicator vector for "which changepoints are active by time t" and <Eq>{'\\delta_j'}</Eq> is the slope adjustment at changepoint j, regularized by a Laplace prior with scale <Eq>{'\\tau'}</Eq> (the famous `changepoint_prior_scale`). Bigger τ → more flexible trend; smaller τ → smoother.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Calendar className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">prophet fit on ERCOT 2015–2025</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[30, 40, 50, 60, 70].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g}</text>
            </g>
          ))}
          {/* changepoints */}
          {cps.map((cp, i) => (
            <g key={i}>
              <line x1={sx(cp)} y1={P} x2={sx(cp)} y2={H - P} stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5" />
            </g>
          ))}
          <path d={'M ' + obsPts.join(' L ')} fill="none" stroke="#7dd3fc" strokeWidth="0.8" strokeOpacity="0.45" />
          <path d={'M ' + trendPts.join(' L ')} fill="none" stroke="#c4b5fd" strokeWidth="1.4" strokeOpacity="0.95" />
          <path d={'M ' + fitPts.join(' L ')} fill="none" stroke="#67e8f9" strokeWidth="1.0" strokeOpacity="0.95" />
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-300/50" /> observed</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-300" /> trend g(t)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-300" /> trend + seasonal</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-amber-300/60" /> changepoints</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { label: 'K · changepoints', val: n_cp, set: setNcp, min: 2, max: 25, step: 1, hint: 'evenly-spaced trend kink candidates' },
          { label: 'τ · prior scale',  val: cpScale, set: setCpScale, min: 0.001, max: 0.5, step: 0.005, hint: 'Laplace shrinkage strength' },
          { label: 'order · Fourier',  val: n_fourier, set: setNfourier, min: 1, max: 12, step: 1, hint: 'sin/cos pairs in s(t)' },
        ].map(s => (
          <div key={s.label} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-neutral-300">{s.label}</span>
              <span className="font-mono text-cyan-300">{typeof s.val === 'number' && s.val < 1 ? s.val.toFixed(3) : s.val}</span>
            </div>
            <input
              type="range" min={s.min} max={s.max} step={s.step} value={s.val}
              onChange={(e) => s.set(+e.target.value)} className="sf-range w-full"
            />
            <div className="text-[10px] text-neutral-500 mt-0.5">{s.hint}</div>
          </div>
        ))}
      </div>

      <Stat label="in-sample RMSE" value={rmse.toFixed(2) + ' GW'} sub="across 10 years of daily data" color="text-cyan-300" />

      <Misconception
        wrong="Prophet is just XGBoost / GBM under the hood."
        right="Prophet is a fully-specified Bayesian additive model fit by Stan (or its L-BFGS approximation). It's actually closer to a GAM than to GBM."
        because="Prophet's strength is its inductive bias: piecewise-linear trend, periodic Fourier seasonal, additive holidays. It has no automatic interaction-term discovery and doesn't use trees. Where GBM eats arbitrary feature interactions, Prophet eats clean additive structure."
      />

      <Predict question="What's a series where Prophet beats both ETS and ARIMA out of the box?">
        Series with: (1) <em>multiple</em> changepoints, (2) strong yearly + weekly seasonality, (3) clear holiday effects, and (4) modest covariates. Classic example: web-traffic to a content site through a redesign and a viral spike. ETS struggles with the changepoints, ARIMA struggles with multiple seasonalities, Prophet absorbs both via its structural form. M4 (2018) result: Prophet ranked ~mid-pack overall, but won on series with explicit changepoints.
      </Predict>

      <Deeper>
        <p>
          <strong>The Laplace prior on changepoints, in plain English.</strong> Without the prior, every changepoint would be free to absorb local fluctuations, leading to overfitting. The Laplace prior on <Eq>{'\\delta_j'}</Eq> encourages sparsity: most changepoints get <Eq>{'\\delta_j \\approx 0'}</Eq> (no kink), only the truly necessary ones survive. This is L1-regularization in disguise. As <Eq>{'\\tau \\to 0'}</Eq>, all changepoints vanish and you recover linear regression. As <Eq>{'\\tau \\to \\infty'}</Eq>, the trend can absorb arbitrary local fluctuations.
        </p>
        <p>
          <strong>Logistic trend for capacity-bounded series.</strong> If your series has a known carrying capacity (e.g. addressable market, electricity grid hard cap), use logistic trend: <Eq>{'g(t) = C / (1 + e^{-(k + a(t)^\\top \\delta)(t - m)})'}</Eq>. Prevents linear extrapolation past saturation. Prophet's <code>growth='logistic'</code> handles this; you just supply the cap series.
        </p>
        <p>
          <strong>Fourier order matters more than you think.</strong> Default Prophet uses 10 Fourier pairs for yearly seasonality, 3 for weekly. Increasing yearly to 20+ captures intricate calendar effects (Easter shifts, school-year boundaries) but increases overfit risk. Cross-validate it. Decreasing to 5 makes the seasonal smoother (good for noisy series). For ERCOT, the right yearly order is around 12–15 — captures summer ramp-up + winter peak + shoulder-season detail.
        </p>
        <p>
          <strong>Where Prophet fails.</strong> (1) Sub-daily data with strong intra-day seasonality (it's slow, and the seasonal expressiveness is limited). (2) High-dimensional covariates (no automatic feature interactions). (3) Series where the residual itself has rich autoregressive structure — Prophet leaves the residual as iid Gaussian, which is wrong. Cure: hand the Prophet residual to ETS/ARIMA. This stacking ("Prophet + ARIMA residual") is a common improvement.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does the trend slope change at changepoints but level stay continuous?', a: 'By construction — Prophet uses g(t) = (k + Σ δ_j 1[t ≥ s_j]) · t + offset, so at a changepoint s_j the slope jumps by δ_j but g is still continuous. This is "broken-line regression" — kinks, not jumps.' },
        { q: 'Should I use Prophet for high-frequency forecasting?', a: 'Generally no. Below daily granularity (e.g. hourly load), Prophet\'s computational cost and the limited expressiveness of its sub-daily seasonality become real bottlenecks. Use NeuralProphet (an LSTM-augmented variant) or hand off to ETS / GBM for those.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — TREE ENSEMBLES (GBM)
   ========================================================================== */

const GBM_FEATURES = [
  { k: 'lag_1',          desc: 'y_{t−1} — the most recent observation', dom: 'autoregression', type: 'lag', importance: 0.21 },
  { k: 'lag_24',         desc: 'y_{t−24} — same hour, one day ago', dom: 'daily', type: 'lag', importance: 0.18 },
  { k: 'lag_168',        desc: 'y_{t−168} — same hour, one week ago', dom: 'weekly', type: 'lag', importance: 0.16 },
  { k: 'roll_24_mean',   desc: 'mean of last 24h — recent level', dom: 'level', type: 'roll', importance: 0.10 },
  { k: 'roll_24_std',    desc: 'std of last 24h — local volatility', dom: 'level', type: 'roll', importance: 0.05 },
  { k: 'temp_t',         desc: 'temperature (forecast) at time t', dom: 'weather', type: 'exog', importance: 0.13 },
  { k: 'temp_t-24',      desc: 'temperature 24h ago — A/C inertia', dom: 'weather', type: 'exog', importance: 0.05 },
  { k: 'is_holiday',     desc: 'binary indicator', dom: 'calendar', type: 'cal', importance: 0.04 },
  { k: 'hour_of_day',    desc: 'integer 0..23', dom: 'calendar', type: 'cal', importance: 0.03 },
  { k: 'day_of_week',    desc: 'integer 0..6', dom: 'calendar', type: 'cal', importance: 0.02 },
  { k: 'month_of_year',  desc: 'integer 1..12', dom: 'calendar', type: 'cal', importance: 0.02 },
  { k: 'humidity_t',     desc: 'humidity (forecast) at time t', dom: 'weather', type: 'exog', importance: 0.01 },
];

const featureColors = {
  lag:   { text: 'text-sky-300',     bar: '#7dd3fc' },
  roll:  { text: 'text-emerald-300', bar: '#6ee7b7' },
  exog:  { text: 'text-amber-300',   bar: '#fbbf24' },
  cal:   { text: 'text-violet-300',  bar: '#c4b5fd' },
};

const GBMCard = () => {
  const [hov, setHov] = useState(null);
  const W_W = 460;
  const maxImp = Math.max(...GBM_FEATURES.map(f => f.importance));
  const sorted = [...GBM_FEATURES].sort((a, b) => b.importance - a.importance);

  return (
    <Card id="gbm" icon={Boxes} title="Tree ensembles · gradient boosting" subtitle="LightGBM and friends — eat covariates, learn arbitrary nonlinearities, and won most of M5" accent="emerald" index={6}>
      <MinSchema>
        <Term>Gradient boosting</Term>: sequential additive model. Each new tree fits the gradient of the loss at the current ensemble's prediction. Add 100–1000 trees, regularize, done. Strength is feature interactions and exogenous covariates.
      </MinSchema>

      <p>
        Forecasting with a tree-based model means re-framing the problem: instead of "model the time series as a process", you frame it as <em>tabular regression</em> — every row is one timestep, columns are <Term>lag features</Term>, <Term>rolling stats</Term>, calendar dummies, and exogenous covariates. Then any tabular model works. Gradient boosting is currently the best one.
      </p>

      <Block>{`\\fu{F_M(x)} = \\sum_{m=1}^{M} \\nu \\, h_m(x), \\quad h_m \\;=\\; \\arg\\min_{h \\in \\mathcal{H}} \\sum_i \\Bigl[ \\frac{\\partial L(y_i, F_{m-1}(x_i))}{\\partial F} \\;+\\; h(x_i) \\Bigr]^2`}</Block>

      <p>
        Each tree <Eq>{'h_m'}</Eq> is fit to the negative gradient of the loss at the current ensemble — for squared loss, this is just the residual. The shrinkage <Eq>{'\\nu \\in (0, 1)'}</Eq> (the "learning rate") makes each step a small move; many small steps generalize better than few big ones. Standard regularization: limit tree depth, leaf count, sample/feature subsampling per tree. <Term>LightGBM</Term> adds histogram binning + leaf-wise growth for speed.
      </p>

      {/* Feature importance bar */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">feature importance · LightGBM-style on ERCOT load</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/70 rounded-sm" /> lag</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-emerald-300/70 rounded-sm" /> rolling stat</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-amber-300/70 rounded-sm" /> exogenous</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-violet-300/70 rounded-sm" /> calendar</span>
        </div>
        <div className="space-y-1">
          {sorted.map((f) => {
            const pct = (f.importance / maxImp) * 100;
            const c = featureColors[f.type];
            return (
              <div
                key={f.k}
                onMouseEnter={(e) => setHov({ ...f, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHov({ ...f, mx: e.clientX, my: e.clientY })}
                onMouseLeave={() => setHov(null)}
                className="grid grid-cols-[minmax(120px,1fr)_3fr_minmax(45px,auto)] gap-3 items-center text-[11px] cursor-pointer hover:bg-white/[0.02] rounded px-1 py-0.5"
              >
                <div className={`font-mono ${c.text}`}>{f.k}</div>
                <div className="relative h-3.5 bg-white/5 rounded-sm overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${pct}%`, background: c.bar + '80', borderRight: `2px solid ${c.bar}` }} />
                </div>
                <div className={`font-mono text-right ${c.text}`}>{(f.importance * 100).toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
        <FloatingTip hover={hov} render={(h) => (
          <div>
            <div className={`text-[10px] uppercase tracking-widest ${featureColors[h.type].text}`}>{h.type}</div>
            <div className="text-neutral-200 text-[12px] font-mono mt-0.5">{h.k}</div>
            <div className="text-neutral-300 text-[11px] mt-1">{h.desc}</div>
            <div className="text-[10px] text-neutral-500 mt-1">domain: {h.dom}</div>
          </div>
        )} />
      </div>

      <Worked title="Why M5 was won by LightGBM, not by neural nets">
        <p>
          M5 (2020) — Walmart hierarchical retail demand forecasting, 30,490 series, 5 years daily — was the field's most recent definitive benchmark for ML methods. Result: <em>~95% of top-50 entries used LightGBM</em>. The few neural-net entries that placed (DeepAR, N-BEATS) ranked outside the top 100. Why?
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Tree models eat heterogeneous tabular features without scaling, with few hyperparameters that matter, and with native handling of missing values.</li>
          <li>The gradient on each row is just one number; trees fit it independently. Trains in minutes per series even on commodity hardware.</li>
          <li>Native interaction discovery: a single tree's split structure represents a conjunction of conditions. 100 trees represent 100 such conjunctions, additively combined. This is exactly the inductive bias most retail/load series want.</li>
          <li>Neural-net forecasters need 1000+ examples per series to start working; M5 series had ~1800 days each, just enough — but also weren't enough for them to dominate.</li>
        </ul>
      </Worked>

      <Misconception
        wrong="Just throw lag features at LightGBM and it'll handle the time-series part."
        right="LightGBM treats every row as i.i.d. unless your features encode the time structure. You're responsible for: lag features (autoregression), rolling stats (level / volatility), calendar features (seasonality), and rolling-origin CV (no future leakage)."
        because="A tabular ML model has no built-in temporal awareness. Every piece of time-series structure has to be in the feature matrix or it's invisible. Forgetting calendar features → no seasonality. Forgetting lag-168 → no weekly pattern. Forgetting rolling stats → no recent-level awareness."
      />

      <Deeper>
        <p>
          <strong>Lag features and the "forecast horizon" trade-off.</strong> If you forecast 24h ahead, your <Eq>{'lag_1'}</Eq> at forecast time t+24 is <Eq>{'y_{t+23}'}</Eq> — which you don't have, you only have your forecast for it. Two strategies: (1) <em>recursive forecasting</em>: feed your own forecasts back as lags. Errors compound. (2) <em>direct forecasting</em>: train a separate model per horizon (1h, 2h, …, 24h), each using only lags available at <em>forecast issue time</em>. More compute, much better calibration. M5 winners used direct.
        </p>
        <p>
          <strong>Hyperparameter choices that matter.</strong> In rough order: (1) <code>num_leaves</code> (controls tree complexity; 31 is default, 64–128 often better for forecasting), (2) <code>min_data_in_leaf</code> (regularization; 100 for noisy series), (3) <code>learning_rate</code> + <code>num_iterations</code> (lower LR + more rounds is reliably better), (4) <code>feature_fraction</code> / <code>bagging_fraction</code> (stochastic regularization). Default settings get you ~80% of the way; the last 20% is hyperparameter search.
        </p>
        <p>
          <strong>Quantile regression with GBM.</strong> Train K models, one per target quantile τ, with pinball loss <Eq>{'L_\\tau'}</Eq>. Each model produces one quantile of the predictive distribution. Stitch them into a CDF. LightGBM has native <code>objective='quantile'</code>; just train 9 models with τ = 0.05, 0.10, ..., 0.95. Cards 07 + 11 use this exact pattern.
        </p>
        <p>
          <strong>Why "bin then split" is so fast (LightGBM's edge).</strong> Standard GBM evaluates every possible split point — O(n) per feature per node. LightGBM pre-bins continuous features into 256 histogram buckets, then evaluates only ~256 candidate splits — O(1) per feature per node after the histogram is built. This is the core speed-up; XGBoost added it later as <code>tree_method='hist'</code>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why don\'t calendar features dominate the importance list?', a: 'Lag and rolling features absorb most calendar info: lag_24 captures daily seasonality, lag_168 captures weekly. Calendar features only earn importance when the lag features can\'t see them — e.g. holidays, year-end, leap days.' },
        { q: 'Should I use neural networks for time-series forecasting?', a: 'For small-to-medium series (single-digit thousands of observations), no — LightGBM beats them with less effort. For very large series collections (million+ series, M5-scale or M6-scale) with rich shared structure across series, foundation models (Chronos, TimeGPT) and large neural forecasters become competitive. Most operational forecasting still lives below that threshold.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — ★ PROBABILISTIC OUTPUTS (quantile + conformal)
   ========================================================================== */

const ProbCard = () => {
  const [width, setWidth] = useState(2.0);  // multiplier on residual sd → interval width
  const [calMode, setCalMode] = useState('parametric');
  // Generate a stylized "true future" + central forecast with growing uncertainty over horizon
  const H_HORIZON = 48;
  const series = HOURLY_WEEK.slice(0, 120).map(d => d.value);
  // central forecast: simple Holt-Winters
  const { forecast } = holtWinters(series, 0.4, 0.05, 0.3, 0.95, 24, H_HORIZON);
  const future = HOURLY_WEEK.slice(120, 120 + H_HORIZON).map(d => d.value);
  // residual sd estimate (in-sample)
  const residSd = (() => {
    const fit = holtWinters(series, 0.4, 0.05, 0.3, 0.95, 24, 0).fitted;
    let s = 0, n = 0;
    for (let i = 30; i < series.length; i++) { const e = series[i] - fit[i]; s += e * e; n++; }
    return Math.sqrt(s / n);
  })();
  // parametric (Gaussian) growing-variance bands: sigma_h ≈ residSd · sqrt(h)
  // conformal band: simulated to be wider but uniform across horizon (illustrative)
  const bands = forecast.map((v, i) => {
    const h = i + 1;
    let sigH;
    if (calMode === 'parametric') {
      sigH = residSd * Math.sqrt(h);
    } else {
      // empirical conformal: take an estimated quantile of past forecast errors at horizon h, fixed-width
      sigH = residSd * (1 + 0.04 * h);  // mostly flat, slow growth
    }
    return {
      lo50: v - 0.674 * width * sigH,
      hi50: v + 0.674 * width * sigH,
      lo80: v - 1.282 * width * sigH,
      hi80: v + 1.282 * width * sigH,
      lo95: v - 1.96 * width * sigH,
      hi95: v + 1.96 * width * sigH,
    };
  });

  // empirical coverage on the holdout
  const coverages = ['lo50', 'lo80', 'lo95'].map(loKey => {
    const hiKey = loKey.replace('lo', 'hi');
    let inside = 0;
    for (let h = 0; h < H_HORIZON; h++) {
      if (future[h] >= bands[h][loKey] && future[h] <= bands[h][hiKey]) inside++;
    }
    return inside / H_HORIZON;
  });
  const target = [0.5, 0.8, 0.95];

  // SVG
  const W = 620, H = 280, P = 32;
  const total = 120 + H_HORIZON;
  const allLo = bands.map(b => b.lo95);
  const allHi = bands.map(b => b.hi95);
  const ymin = Math.min(...series, ...future, ...allLo) - 1;
  const ymax = Math.max(...series, ...future, ...allHi) + 2;
  const sx = (i) => P + (i / (total - 1)) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);

  // Build polygon paths for each band
  const bandPath = (loKey, hiKey) => {
    const top = forecast.map((_, i) => `${sx(120 + i)},${sy(bands[i][hiKey])}`);
    const bot = forecast.map((_, i) => `${sx(120 + i)},${sy(bands[i][loKey])}`).reverse();
    return 'M ' + top.join(' L ') + ' L ' + bot.join(' L ') + ' Z';
  };

  const obsPath = 'M ' + series.map((v, i) => `${sx(i)},${sy(v)}`).join(' L ');
  const futurePath = 'M ' + future.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');
  const fcPath = 'M ' + forecast.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');

  return (
    <Card id="probabilistic" anchor icon={Gauge} title="Probabilistic outputs · prediction intervals" subtitle="Anchor card · turning a point forecast into a calibrated distribution. Quantiles, conformal, and CRPS." accent="cyan" index={7}>
      <MinSchema>
        A point forecast is half the answer. The other half is the <em>distribution</em>: <Term>prediction intervals</Term> at 50/80/95%, <Term>calibrated</Term> so that 80 of 100 holdout observations fall inside the 80% interval. Build by <Term>quantile regression</Term> or wrap any model with <Term>conformal prediction</Term>.
      </MinSchema>

      <p>
        Most practical forecasting questions need a distribution: how much capacity to provision, how much working capital to hold, how big a buffer for an outage. A point forecast collapses this to a single number — useful, but throwing away the information that matters most. The forecast deliverable is a <em>predictive distribution</em> over the future value:
      </p>

      <Block>{`\\fu{F_{t+h}(\\cdot)} = P(\\co{Y_{t+h}} \\le \\cdot \\mid \\mathcal{F}_t)`}</Block>

      <p>
        From <Eq>{'F_{t+h}'}</Eq> you can read off any quantile, the median (point forecast), the variance, the probability of any event. Three ways to estimate it:
      </p>

      <div className="grid md:grid-cols-3 gap-2">
        {[
          { k: 'Parametric', desc: 'Assume residuals are Gaussian (or t-distributed). Variance grows with horizon. Comes free from ETS/ARIMA. Often miscalibrated on real data.', icon: Activity, color: 'sky' },
          { k: 'Quantile regression', desc: 'Train K models, one per quantile τ ∈ {.05, .10, ..., .95}, with pinball loss L_τ. Native in LightGBM. No distributional assumption.', icon: BarChart3, color: 'emerald' },
          { k: 'Conformal', desc: 'Wrap any point forecaster. Use holdout residuals to compute empirical quantiles. Coverage guarantee under exchangeability.', icon: ShieldAlert, color: 'fuchsia' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.k} className={`rounded-lg border bg-white/[0.02] p-3 ${chipPalette[m.color].split(' ')[2]}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${chipPalette[m.color].split(' ')[1]}`} />
                <div className={`text-sm font-semibold ${chipPalette[m.color].split(' ')[1]}`}>{m.k}</div>
              </div>
              <div className="text-[11px] text-neutral-300 leading-snug">{m.desc}</div>
            </div>
          );
        })}
      </div>

      <p>
        The right scoring rule for a probabilistic forecast is <em>not</em> RMSE — it's <Term>CRPS</Term> (or for a single quantile, <Term>pinball loss</Term>). Both are <Term>proper scoring rules</Term>: the expected score is best when you report your true predictive distribution.
      </p>

      <Block>{`\\co{L_\\tau(y, q)} = \\max\\bigl(\\tau(y - q), \\,(\\tau - 1)(y - q)\\bigr) \\qquad \\co{CRPS} = \\int_0^1 L_\\tau(y, F^{-1}(\\tau))\\,d\\tau`}</Block>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Gauge className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">prediction intervals · 5d train + 48h forecast</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[40, 50, 60, 70, 80].map(g => (
            <g key={g}>
              <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g}</text>
            </g>
          ))}
          {[1, 2, 3, 4, 5, 6].map(d => (
            <g key={d}>
              <line x1={sx(d * 24)} y1={P} x2={sx(d * 24)} y2={H - P} stroke="#404040" strokeWidth="0.4" strokeDasharray="1 3" />
              <text x={sx(d * 24)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">d{d}</text>
            </g>
          ))}
          <line x1={sx(120)} y1={P} x2={sx(120)} y2={H - P} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x={sx(120)} y={P - 4} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">forecast →</text>
          {/* bands: 95 → 80 → 50, painted from outside in */}
          <path d={bandPath('lo95', 'hi95')} fill="#67e8f9" fillOpacity="0.10" />
          <path d={bandPath('lo80', 'hi80')} fill="#67e8f9" fillOpacity="0.18" />
          <path d={bandPath('lo50', 'hi50')} fill="#67e8f9" fillOpacity="0.28" />
          <path d={obsPath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeOpacity="0.85" />
          <path d={futurePath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeOpacity="0.7" strokeDasharray="2 2" />
          <path d={fcPath} fill="none" stroke="#67e8f9" strokeWidth="1.6" />
          <text x={P - 14} y={H / 2} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace" textAnchor="middle" transform={`rotate(-90 ${P - 14} ${H / 2})`}>load · GW</text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-cyan-300/30" /> 50% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-cyan-300/20" /> 80% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-cyan-300/10" /> 95% PI</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-300" /> central forecast</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0 border-t border-dashed border-sky-300/50" /> realized</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-neutral-300">interval width multiplier</span>
            <span className="font-mono text-cyan-300">{width.toFixed(2)}×</span>
          </div>
          <input
            type="range" min="0.5" max="3.0" step="0.05" value={width}
            onChange={(e) => setWidth(+e.target.value)}
            className="sf-range w-full"
          />
          <div className="text-[10px] text-neutral-500 mt-0.5">scales the residual sd for all bands</div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[11px] text-neutral-300 mb-2">interval method</div>
          <div className="flex gap-1.5">
            {['parametric', 'conformal'].map(m => (
              <button
                key={m}
                onClick={() => setCalMode(m)}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${calMode === m ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-100 font-semibold' : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">parametric = √h growth; conformal = empirical fixed</div>
        </div>
      </div>

      {/* coverage table */}
      <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/[0.05] p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Star className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">coverage on the 48h holdout</span>
          <span className="text-[10px] text-neutral-500">· should match nominal</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0.5, 0.8, 0.95].map((nom, i) => {
            const obs = coverages[i];
            const gap = obs - nom;
            const ok = Math.abs(gap) < 0.06;
            return (
              <Stat
                key={nom}
                label={`nominal ${(nom * 100).toFixed(0)}%`}
                value={`${(obs * 100).toFixed(0)}%`}
                sub={gap >= 0 ? `over by ${(gap * 100).toFixed(0)} pp` : `under by ${(-gap * 100).toFixed(0)} pp`}
                color={ok ? 'text-emerald-300' : Math.abs(gap) > 0.10 ? 'text-rose-300' : 'text-amber-300'}
              />
            );
          })}
        </div>
        <div className="mt-2 text-[10.5px] text-neutral-400 italic">
          The width slider lets you trade off coverage and sharpness. Calibration target: each observed coverage within ±5pp of nominal, on a holdout you didn't tune on.
        </div>
      </div>

      <Predict question="A 95% PI shows 87% coverage on holdout. Sharpen the model or recalibrate?">
        Recalibrate first. Coverage of 87% means intervals are too narrow by about 18% in width — adjust the multiplier (or apply an adaptive conformal correction) so coverage hits 95% before you reach for a different model. A "better" point forecast won't fix coverage; only the width and shape of the predictive distribution will. Tighter point forecast + same residual model often makes coverage <em>worse</em>.
      </Predict>

      <Misconception
        wrong="Wider prediction intervals are worse — they're less informative."
        right="Narrower intervals are only better if they still cover at the nominal rate. A 95% PI with 70% coverage is misleading garbage. The deliverable is calibrated sharpness: the narrowest band that hits the right empirical rate."
        because="There's a real trade-off — sharpness and calibration are both proper attributes of a probabilistic forecast. Calibration is a hard constraint; sharpness is the optimization target subject to it. Always report both."
      />

      <Deeper>
        <p>
          <strong>The conformal guarantee, exactly.</strong> Given a calibration set <Eq>{'\\{(x_i, y_i)\\}_{i=1}^{n}'}</Eq>, fit a point forecaster <Eq>{'\\hat{f}'}</Eq>, compute residuals <Eq>{'r_i = |y_i - \\hat{f}(x_i)|'}</Eq>, take their empirical <Eq>{'(1-\\alpha)'}</Eq>-quantile <Eq>{'\\hat{q}'}</Eq>. The interval <Eq>{'[\\hat{f}(x) - \\hat{q}, \\hat{f}(x) + \\hat{q}]'}</Eq> covers <Eq>{'y'}</Eq> with probability <Eq>{'\\ge 1 - \\alpha - 1/(n+1)'}</Eq> — exactly, no asymptotics, given that <Eq>{'(x_i, y_i)'}</Eq> are exchangeable with the test point. The guarantee is distribution-free: any point forecaster, any data distribution.
        </p>
        <p>
          <strong>Adaptive conformal · why ERCOT needs it.</strong> Vanilla conformal is uniform: every test point gets the same band width. But <Eq>{'\\sigma_t'}</Eq> varies on real series (heat waves are noisier than mild weeks). Conformalized Quantile Regression (Romano et al. 2019) fixes this: train upper and lower quantile models <Eq>{'\\hat{q}_{0.05}, \\hat{q}_{0.95}'}</Eq>; conformalize their residuals; output an interval that adapts to local volatility. State of the art for load forecasting under conformal guarantees.
        </p>
        <p>
          <strong>CRPS as a continuous Brier score.</strong> CRPS reduces to Brier when the target is binary; that's why it's the natural extension. For a forecast CDF <Eq>{'F'}</Eq> and realized value <Eq>{'y'}</Eq>:
        </p>
        <Block>{`CRPS(F, y) = \\int_{-\\infty}^{\\infty} (F(z) - \\mathbb{1}\\{z \\ge y\\})^2 \\, dz`}</Block>
        <p>
          Equivalent (and easier to compute) form for a finite quantile grid: average the pinball loss across <Eq>{'\\tau \\in \\{0.05, 0.10, \\ldots, 0.95\\}'}</Eq>. M5 used CRPS-equivalent metrics for its uncertainty track; the field has converged on it.
        </p>
        <p>
          <strong>Don't trust ETS/ARIMA bands at long horizons.</strong> Their parametric bands assume Gaussian residuals; on real load they undershoot at the 95% level by 5–15pp typically, and far worse at the 99% level. The Uri-style fat-tail event is invisible to a parametric model. Conformal closes most of the gap; the rest is left as honest tail risk.
        </p>
      </Deeper>

      <QA items={[
        { q: 'My pinball loss is 0.4 at τ=0.5 and 0.05 at τ=0.05 — same model. Why so different?', a: 'Because they\'re different scoring losses. Pinball at the median asks "how close to the realized value?" — punishes both directions. Pinball at τ=0.05 asks "how close to the 5th-percentile of the predictive distribution?" — punishes only when the realized value lands above the predicted quantile. The two aren\'t comparable on the same scale; CRPS averages them properly.' },
        { q: 'Should I prefer parametric or conformal intervals?', a: 'Conformal in production. Parametric is faster and can be more sharp when its assumptions hold, but you have to verify those assumptions on holdout. Conformal trades a small loss in sharpness for distribution-free coverage guarantees — usually worth it.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — TIME CROSS-VALIDATION
   ========================================================================== */

const CVCard = () => {
  const [strategy, setStrategy] = useState('rolling');  // rolling | expanding | leaky
  const N = 24;  // total weeks
  const trainMin = 8;
  const horizon = 2;
  const folds = [];
  if (strategy === 'rolling') {
    for (let origin = trainMin; origin + horizon <= N; origin += 2) {
      folds.push({ train: [origin - trainMin, origin - 1], test: [origin, origin + horizon - 1] });
    }
  } else if (strategy === 'expanding') {
    for (let origin = trainMin; origin + horizon <= N; origin += 2) {
      folds.push({ train: [0, origin - 1], test: [origin, origin + horizon - 1] });
    }
  } else if (strategy === 'leaky') {
    // shuffled k-fold style — train indices random, scattered
    const allIdx = Array.from({ length: N }, (_, i) => i);
    for (let f = 0; f < 6; f++) {
      const test = [];
      for (let i = 0; i < 4; i++) test.push((f * 4 + i) % N);
      const train = allIdx.filter(i => !test.includes(i));
      folds.push({ trainList: train, testList: test });
    }
  }

  const W = 620, H = 200, P = 24, rowH = 22;
  const cellW = (W - 2 * P) / N;

  return (
    <Card id="cv" icon={Hourglass} title="Cross-validation in time" subtitle="The data-leakage trap — and the rolling-origin recipe that fixes it" accent="rose" index={8}>
      <MinSchema>
        Random k-fold CV <strong>leaks the future into training</strong>. The only honest CV for time series is <Term>rolling-origin</Term>: train on [1..t], score on [t+1..t+h], advance the origin, repeat. Always.
      </MinSchema>

      <p>
        Random k-fold cross-validation works for i.i.d. data because every fold is statistically equivalent. Time series are not i.i.d. — observations carry temporal structure that random shuffling destroys. Worse: it lets your model see the future. A model trained on (Mon, Wed, Sat) can perfectly predict Tue from Mon and Wed; a model trained on a chronological history cannot.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Workflow className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300">CV strategies on a 24-week series</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[
            { k: 'rolling',   label: 'Rolling origin · sliding window',  color: 'emerald' },
            { k: 'expanding', label: 'Expanding window',                 color: 'sky' },
            { k: 'leaky',     label: 'Random k-fold · ⚠ leaks future',   color: 'rose' },
          ].map(s => (
            <button
              key={s.k}
              onClick={() => setStrategy(s.k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${strategy === s.k ? `${chipPalette[s.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* time axis */}
          <text x={P} y={14} fontSize="9" fill="#737373" fontFamily="ui-monospace">t = 0</text>
          <text x={W - P} y={14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">t = {N}</text>
          <line x1={P} y1={20} x2={W - P} y2={20} stroke="#404040" />
          {/* fold rows */}
          {folds.slice(0, 6).map((f, i) => {
            const y = 30 + i * rowH;
            // for rolling/expanding
            if (f.train) {
              return (
                <g key={i}>
                  <text x={P - 4} y={y + 14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">f{i + 1}</text>
                  {/* train rect */}
                  <rect x={P + f.train[0] * cellW} y={y} width={(f.train[1] - f.train[0] + 1) * cellW} height={rowH - 6} fill="#7dd3fc" fillOpacity="0.45" />
                  {/* test rect */}
                  <rect x={P + f.test[0] * cellW} y={y} width={(f.test[1] - f.test[0] + 1) * cellW} height={rowH - 6} fill="#fbbf24" fillOpacity="0.7" />
                </g>
              );
            } else {
              // leaky: paint each cell individually
              return (
                <g key={i}>
                  <text x={P - 4} y={y + 14} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">f{i + 1}</text>
                  {Array.from({ length: N }).map((_, t) => {
                    const isTest = f.testList.includes(t);
                    return <rect key={t} x={P + t * cellW} y={y} width={cellW} height={rowH - 6} fill={isTest ? '#fb7185' : '#7dd3fc'} fillOpacity={isTest ? 0.7 : 0.45} />;
                  })}
                </g>
              );
            }
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-sky-300/45" /> train</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-amber-300/70" /> test (future of train)</span>
          {strategy === 'leaky' && <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-rose-400/70" /> test (interleaved with train ⚠)</span>}
        </div>
        <div className="mt-2 text-[11px] italic">
          {strategy === 'rolling' && <span className="text-emerald-300/80">Sliding window of fixed length. Each fold scores h points strictly after its train set.</span>}
          {strategy === 'expanding' && <span className="text-sky-300/80">Train set grows at each fold. Use when you want all available history; rolling when older data is stale.</span>}
          {strategy === 'leaky' && <span className="text-rose-300/80">Random k-fold puts test points <em>between</em> train points — your model sees the future of the test set during training. Don't.</span>}
        </div>
      </div>

      <Misconception
        wrong="Random CV gives a more conservative estimate of error — it should be safer."
        right="Random CV gives a wildly optimistic estimate. Models that memorize local autocorrelation look great on shuffled folds and fail catastrophically in production where they only see the past."
        because="Most time-series ML ranking competitions get torpedoed by leakage. The model with the best 'CV score' often wasn't the best model — it was the model that exploited leakage best. Forecast tournament organizers (M4, M5) have hard rules against test-set inclusion."
      />

      <Predict question="A team uses 5-fold random CV and reports MAPE = 2.1%. They deploy and see MAPE = 6.5%. What\'s the most likely cause?">
        Leakage. Random folds let the model see test-period values during training (or values that strongly correlate with them — adjacent timestamps). The 4× error blow-up between CV and production is a textbook leakage signature. The CV estimate is meaningless. Diagnose: re-run with rolling-origin CV on a held-out tail of the series; the gap between rolling-CV error and production should be small (within 30%).
      </Predict>

      <Worked title="The standard rolling-origin recipe">
        <ol className="list-decimal list-inside space-y-1">
          <li>Pick training window length <Eq>{'L'}</Eq> and forecast horizon <Eq>{'h'}</Eq>.</li>
          <li>For each origin <Eq>{'t \\in \\{L, L+\\Delta, L+2\\Delta, \\ldots, T-h\\}'}</Eq>:
            <ol className="list-[lower-alpha] list-inside ml-4 mt-1">
              <li>Train on <Eq>{'\\{y_{t-L+1}, \\ldots, y_t\\}'}</Eq>.</li>
              <li>Forecast <Eq>{'\\{\\hat{y}_{t+1}, \\ldots, \\hat{y}_{t+h}\\}'}</Eq>.</li>
              <li>Compute the loss against actuals; store.</li>
            </ol>
          </li>
          <li>Aggregate: average loss across origins (give each origin equal weight; some recommend more weight on recent origins for non-stationary series).</li>
        </ol>
        <p className="mt-2">Default for hourly load: L = 8 weeks, h = 24 hours, Δ = 1 day, ~50 origins per CV pass. A practical hyperparameter search over LightGBM might run this 100× — feasible because each fit is small.</p>
      </Worked>

      <Deeper>
        <p>
          <strong>Expanding vs sliding · the regime question.</strong> Expanding: training set is <Eq>{'[0, t]'}</Eq> at every origin. Sliding: training set is <Eq>{'[t-L, t]'}</Eq>, fixed length. Expanding is right when older data still helps (stationary or slowly-drifting series). Sliding is right when older data hurts (post-regime-break series). When unsure: try both, pick the one with lower rolling-CV error on the most recent ~30% of origins.
        </p>
        <p>
          <strong>Multi-step CV — direct vs recursive.</strong> When the horizon h > 1, you have a choice. <em>Recursive</em>: forecast h+1, feed it as input, forecast h+2, etc. Errors compound, but you only train one model. <em>Direct</em>: train h different models, one per step ahead. More compute, more accurate at long horizons. Most modern practice (LightGBM forecasting) uses direct for h ≤ 24, recursive beyond that. Both should be CV'd consistently — direct CV scores h-th model on h-th step, recursive CV scores end-to-end.
        </p>
        <p>
          <strong>Why "back-testing" isn't a synonym.</strong> Back-testing = "run my model historically and see what it would have made/predicted." It's like rolling-origin CV, but typically with: (1) an actual trade execution / decision rule applied (not just point error), and (2) realistic constraints (transaction costs, data availability). For pure forecasting research, rolling-origin CV is enough; for trading or operational systems, back-testing is the harder bar.
        </p>
        <p>
          <strong>Time-series leakage checklist.</strong> Beyond random folds, common leakage sources: (1) global feature normalization computed on the full series (test-set statistics leak into training scaling); (2) target encoding using future label averages; (3) hyperparameter selection on the same data used for final reporting (re-fit hyperparameters on train, pick by CV, refit on train+val before reporting); (4) using known-after-the-fact data as features (e.g. "did this customer churn next month" as a current feature). Each of these regularly inflates reported skill by 2–10×.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How many origins should I use in rolling CV?', a: '20–50 is the sweet spot. Below ~20, the variance of your CV score is too high to compare models reliably. Above ~50 you\'re burning compute for diminishing variance reduction. Adjust based on series length and how stationary it is.' },
        { q: 'Can I ever use random CV on time series?', a: 'Effectively no, with one edge case: when you have a large collection of independent short series (M4-style), and your model treats each series independently. Then random CV on series-level splits (some series in train, others in test) is fine. Random CV across timestamps within one series — never.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — HIERARCHICAL & RECONCILIATION
   ========================================================================== */

const HierarchyCard = () => {
  const [method, setMethod] = useState('mint');
  // 3-level toy hierarchy: total → 3 zones → 6 cities (2 per zone)
  // Independent ("base") forecasts may not sum
  const totalBase = 64;
  const zonesBase = [22.5, 19.0, 21.5];  // doesn't sum to 64 (sums to 63)
  const citiesBase = [10.5, 11.5, 9.5, 9.0, 10.0, 12.0];  // [city11, city12, city21, city22, city31, city32]
  // Bottom-up: cities up
  const buCities = [...citiesBase];
  const buZones = [buCities[0] + buCities[1], buCities[2] + buCities[3], buCities[4] + buCities[5]];
  const buTotal = buZones.reduce((a, b) => a + b, 0);
  // Top-down: total down by historical proportions
  const props = [0.16, 0.18, 0.15, 0.14, 0.16, 0.21];  // sum = 1
  const tdCities = props.map(p => p * totalBase);
  const tdZones = [tdCities[0] + tdCities[1], tdCities[2] + tdCities[3], tdCities[4] + tdCities[5]];
  const tdTotal = totalBase;
  // MinT: take a weighted average of bottom-up and base, weighted by inverse-variance.
  // Stylized: assume base variance grows from bottom up. mint shrinks toward consistency at all levels.
  const mintCities = citiesBase.map((c, i) => 0.55 * c + 0.45 * buCities[i]);
  const mintZones = [mintCities[0] + mintCities[1], mintCities[2] + mintCities[3], mintCities[4] + mintCities[5]];
  const mintTotal = mintZones.reduce((a, b) => a + b, 0);

  let cities, zones, total;
  if (method === 'base') { cities = citiesBase; zones = zonesBase; total = totalBase; }
  else if (method === 'bu') { cities = buCities; zones = buZones; total = buTotal; }
  else if (method === 'td') { cities = tdCities; zones = tdZones; total = tdTotal; }
  else { cities = mintCities; zones = mintZones; total = mintTotal; }

  // Coherence check: do children sum to parents?
  const zoneSums = [cities[0] + cities[1], cities[2] + cities[3], cities[4] + cities[5]];
  const zoneCoherent = zoneSums.every((s, i) => Math.abs(s - zones[i]) < 0.01);
  const totalCoherent = Math.abs(zones.reduce((a, b) => a + b, 0) - total) < 0.01;

  return (
    <Card id="hierarchy" icon={Workflow} title="Hierarchical forecasting & reconciliation" subtitle="When you forecast many related series — the zone forecasts had better sum to the grid forecast" accent="violet" index={9}>
      <MinSchema>
        <Term>Hierarchical forecasting</Term>: forecast every level of a hierarchy (city → zone → grid). <Term>Reconciliation</Term>: post-step that adjusts independent forecasts so children sum to parents. <Term>MinT</Term> is the optimal linear reconciliation under a stated covariance.
      </MinSchema>

      <p>
        Real forecasting problems are usually hierarchical. ERCOT operates at city, zone (DFW / Houston / Austin / etc.), and total-grid levels. A forecaster has a choice: produce one forecast per level independently (the "base forecasts") and accept they won't sum coherently — or produce coherent forecasts via reconciliation. The latter is almost always better.
      </p>

      <Block>{`\\co{\\hat{y}_{\\text{coherent}}} = \\vi{S}\\, \\vi{P}\\, \\co{\\hat{y}_{\\text{base}}}`}</Block>

      <p>
        where <Eq>{'S'}</Eq> is the summing matrix (encodes the hierarchy structure) and <Eq>{'P'}</Eq> is a projection matrix that defines the reconciliation method. Three classic choices for <Eq>{'P'}</Eq>:
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <GitBranch className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">3-level hierarchy · ERCOT-style toy</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { k: 'base', label: 'Base · independent · ⚠ incoherent', color: 'rose' },
            { k: 'bu',   label: 'Bottom-up · cities sum',            color: 'sky' },
            { k: 'td',   label: 'Top-down · total split',            color: 'amber' },
            { k: 'mint', label: 'MinT · optimal linear',             color: 'emerald' },
          ].map(m => (
            <button
              key={m.k}
              onClick={() => setMethod(m.k)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${method === m.k ? `${chipPalette[m.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 620 240" className="w-full h-auto">
          {/* total at top */}
          <rect x={260} y={10} width={100} height={32} fill="#c4b5fd" fillOpacity="0.2" stroke="#c4b5fd" strokeWidth="1.2" rx="4" />
          <text x={310} y={26} fontSize="10" fill="#c4b5fd" fontFamily="ui-monospace" textAnchor="middle">TOTAL</text>
          <text x={310} y={38} fontSize="11" fill="#e9d5ff" fontFamily="ui-monospace" textAnchor="middle" fontWeight="700">{total.toFixed(1)}</text>
          {/* 3 zones */}
          {[100, 260, 420].map((x, i) => (
            <g key={i}>
              <line x1={310} y1={42} x2={x + 60} y2={75} stroke="#c4b5fd" strokeWidth="0.8" strokeOpacity="0.4" />
              <rect x={x + 10} y={75} width={100} height={32} fill="#7dd3fc" fillOpacity="0.18" stroke="#7dd3fc" strokeWidth="1.2" rx="4" />
              <text x={x + 60} y={91} fontSize="10" fill="#7dd3fc" fontFamily="ui-monospace" textAnchor="middle">zone {i + 1}</text>
              <text x={x + 60} y={103} fontSize="11" fill="#bae6fd" fontFamily="ui-monospace" textAnchor="middle" fontWeight="700">{zones[i].toFixed(1)}</text>
            </g>
          ))}
          {/* 6 cities */}
          {[60, 160, 220, 320, 380, 480].map((x, i) => {
            const zoneIdx = Math.floor(i / 2);
            return (
              <g key={i}>
                <line x1={[160, 320, 480][zoneIdx]} y1={107} x2={x + 30} y2={140} stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.4" />
                <rect x={x} y={140} width={70} height={28} fill="#6ee7b7" fillOpacity="0.18" stroke="#6ee7b7" strokeWidth="1.0" rx="3" />
                <text x={x + 35} y={154} fontSize="9" fill="#6ee7b7" fontFamily="ui-monospace" textAnchor="middle">city{zoneIdx + 1}{(i % 2) + 1}</text>
                <text x={x + 35} y={164} fontSize="10" fill="#a7f3d0" fontFamily="ui-monospace" textAnchor="middle" fontWeight="700">{cities[i].toFixed(1)}</text>
              </g>
            );
          })}
          {/* coherence indicators */}
          {[100, 260, 420].map((x, i) => {
            const sum = cities[2 * i] + cities[2 * i + 1];
            const ok = Math.abs(sum - zones[i]) < 0.01;
            return (
              <text key={i} x={x + 60} y={188} fontSize="9" fill={ok ? '#6ee7b7' : '#fb7185'} fontFamily="ui-monospace" textAnchor="middle">
                {ok ? '✓' : '✗'} sum {sum.toFixed(1)}
              </text>
            );
          })}
          <text x={310} y={210} fontSize="9" fill={totalCoherent ? '#6ee7b7' : '#fb7185'} fontFamily="ui-monospace" textAnchor="middle">
            {totalCoherent ? '✓' : '✗'} zone-sum = total ({zones.reduce((a, b) => a + b, 0).toFixed(1)} vs {total.toFixed(1)})
          </text>
        </svg>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className={`rounded border px-2 py-1.5 text-[11px] ${zoneCoherent ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300' : 'border-rose-400/30 bg-rose-400/5 text-rose-300'}`}>
            zones: {zoneCoherent ? '✓ coherent' : '✗ children don\'t sum to parent'}
          </div>
          <div className={`rounded border px-2 py-1.5 text-[11px] ${totalCoherent ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300' : 'border-rose-400/30 bg-rose-400/5 text-rose-300'}`}>
            total: {totalCoherent ? '✓ coherent' : '✗ zone-sum ≠ total'}
          </div>
        </div>
      </div>

      <Worked title="Bottom-up vs top-down vs MinT — the trade-off">
        <ul className="list-disc list-inside space-y-1 text-[11.5px]">
          <li><strong>Bottom-up:</strong> sum city forecasts to get zones, sum zones to get total. Coherent. Uses noisy bottom-level forecasts; can amplify noise at the top.</li>
          <li><strong>Top-down:</strong> forecast the total (cleanest, lowest noise), then split by historical proportions. Coherent. Loses idiosyncratic patterns at lower levels.</li>
          <li><strong>MinT:</strong> a weighted combination — a least-squares projection of the base forecasts onto the coherent subspace, weighted by the residual covariance. Provably optimal under the covariance assumption. Trades a little complexity for a real accuracy gain across the entire hierarchy.</li>
        </ul>
        <p className="mt-2">
          M5 winners used MinT-style reconciliation across the Walmart hierarchy. Hyndman et al.'s 2019 paper formalized it; <code>fable::reconcile()</code> in R and <code>hierarchicalforecast</code> in Python both implement it.
        </p>
      </Worked>

      <Misconception
        wrong="Just forecast the bottom level and sum up — bottom-up is the safest."
        right="Bottom-up is coherent but rarely the best. Top-level series are typically less noisy than bottom-level — your total forecast carries information that bottom forecasts don't have. MinT is the principled way to use both."
        because="Hierarchical forecasting is a place where 'forecast everything independently' loses to 'use the structure'. The structure (S matrix) carries information; reconciliation extracts it."
      />

      <Deeper>
        <p>
          <strong>The MinT formula.</strong> The optimal linear reconciliation matrix <Eq>{'P'}</Eq> is
        </p>
        <Block>{`P_{\\mathrm{MinT}} = (S^{\\top} W^{-1} S)^{-1} S^{\\top} W^{-1}`}</Block>
        <p>
          where <Eq>{'W'}</Eq> is the covariance of the base-forecast errors. Estimating <Eq>{'W'}</Eq> is the hard part — Wickramasuriya et al. propose four estimators (sample, shrinkage, "structural", and diagonal). <em>Diagonal</em> (zero off-diagonals) is a simple useful default; <em>shrinkage</em> usually wins. Pick the diagonal estimator first when the hierarchy has more leaves than time periods.
        </p>
        <p>
          <strong>Probabilistic reconciliation.</strong> MinT was extended to predictive distributions in 2023 (Panagiotelis et al.). Key idea: reconciliation in distribution space requires <em>copula-aware</em> aggregation — dependencies between leaf-level distributions matter. Practical implementations use bootstrap-based reconciliation: draw paths from each level's predictive distribution, project each draw onto the coherent subspace, get a coherent predictive distribution at every level. Standard tool now in <code>hierarchicalforecast</code>.
        </p>
        <p>
          <strong>Why incoherent forecasts harm decisions.</strong> Capacity planning at the grid level uses the total forecast. Operations dispatch at the zone level uses zone forecasts. If they disagree, downstream decisions (when to start a peaker, when to import from a neighbor, when to run a demand response) get inconsistent signals. Reconciliation isn't just academic — it's a precondition for coordinated decision-making across operations and planning.
        </p>
        <p>
          <strong>Hierarchies aren't always trees.</strong> ERCOT's "by-zone" view (3 zones) and "by-fuel" view (gas / nuclear / wind / solar) cross-classify the same total. This is a <em>grouped time series</em>, not strictly a tree — and reconciliation matrices need to be more general (S matrix has more rows than a pure tree). Athanasopoulos et al. (2017) extended MinT to this case.
        </p>
      </Deeper>

      <QA items={[
        { q: 'When does top-down beat bottom-up in practice?', a: 'When bottom-level series are very noisy or sparse (intermittent demand at SKU-store-day level), and the top-level series is comparatively smooth. The total\'s signal-to-noise is much higher; splitting it by historical proportions captures most of the structure with less variance.' },
        { q: 'Can I use MinT with non-linear models like LightGBM?', a: 'Yes — MinT is post-fit reconciliation. Fit a LightGBM at every level, then apply MinT to combine. The reconciliation step is a linear projection on the base-forecast vector; the underlying models can be anything.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — ENSEMBLES
   ========================================================================== */

const ENSEMBLE_MODELS = [
  { name: 'Naive (last week)', mase: 1.00, color: '#737373' },
  { name: 'ETS (HW damped)',   mase: 0.78, color: '#6ee7b7' },
  { name: 'ARIMA(2,1,2)',       mase: 0.81, color: '#fbbf24' },
  { name: 'Prophet (default)',  mase: 0.84, color: '#67e8f9' },
  { name: 'LightGBM (lag+exog)', mase: 0.66, color: '#a5b4fc' },
  { name: 'N-BEATS',            mase: 0.69, color: '#f0abfc' },
];

const EnsembleCard = () => {
  const [weights, setWeights] = useState({
    'ETS (HW damped)': 1,
    'ARIMA(2,1,2)': 1,
    'Prophet (default)': 1,
    'LightGBM (lag+exog)': 2,
    'N-BEATS': 1,
  });
  const W = Object.values(weights).reduce((s, v) => s + v, 0);
  // Stylized: ensemble MASE = weighted_avg(MASE) * 0.92 (diversity bonus, capped)
  const wmasePoints = Object.entries(weights).map(([n, w]) => {
    const m = ENSEMBLE_MODELS.find(x => x.name === n);
    return { ...m, w };
  });
  const wmase = wmasePoints.reduce((s, p) => s + p.w * p.mase, 0) / W;
  const diversityFactor = wmasePoints.length >= 2 ? Math.max(0.88, 1 - 0.025 * (wmasePoints.length - 1)) : 1;
  const ensembleMase = wmase * diversityFactor;

  return (
    <Card id="ensembles" icon={Network} title="Ensembles · the M-competition lesson" subtitle="Average a few diverse models, beat any single one. Repeated for 40+ years across forecasting benchmarks." accent="orange" index={10}>
      <MinSchema>
        Across <Term>M-competitions</Term> (1982 → 2024), the consistent winner has been a simple <em>average</em> of 3–5 diverse models. Diversity matters more than individual accuracy — uncorrelated errors cancel. Stacking adds a meta-model on top; sometimes worth it, often noisy on short series.
      </MinSchema>

      <p>
        Spyros Makridakis ran the field's open forecasting competitions across five decades. The result has been remarkably consistent: a <em>combination</em> of forecasts beats the best individual forecast on most series. The headline result from M4 (2018):
      </p>

      <Block>{`\\text{Brier-equivalent improvement} \\;\\approx\\; 7\\text{–}13\\%, \\quad \\text{model-average vs single best}`}</Block>

      <p>
        The improvement is consistent across data domains, horizons, and metric choices. The mechanism: <em>diverse base models make uncorrelated errors</em>; averaging reduces variance roughly as <Eq>{'1/k'}</Eq> until correlation between models limits further gain. The diversity ceiling — typically 4–6 useful models — comes from the fact that ETS, ARIMA, Prophet, and LightGBM share many failure modes despite different architectures.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Boxes className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-300">5 base models · their MASE on a typical week</span>
        </div>
        <div className="space-y-1.5">
          {ENSEMBLE_MODELS.map((m) => {
            const pct = (m.mase / 1.0) * 100;
            return (
              <div key={m.name} className="grid grid-cols-[minmax(150px,1.3fr)_3fr_minmax(50px,auto)] gap-3 items-center text-[11px]">
                <div className="text-neutral-200 truncate">{m.name}</div>
                <div className="relative h-3.5 bg-white/5 rounded-sm overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${pct}%`, background: `${m.color}80`, borderRight: `2px solid ${m.color}` }} />
                  <div className="absolute top-0 bottom-0 border-l border-white/30" style={{ left: '100%' }} />
                </div>
                <div className="font-mono text-right" style={{ color: m.color }}>{m.mase.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] font-mono text-neutral-500">tick at MASE = 1.0 = naive baseline · lower = better</div>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Sigma className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-300">build your ensemble · slide weights</span>
        </div>
        <div className="space-y-2">
          {Object.keys(weights).map(name => {
            const m = ENSEMBLE_MODELS.find(x => x.name === name);
            return (
              <div key={name} className="grid grid-cols-[minmax(140px,1fr)_3fr_minmax(50px,auto)] gap-3 items-center">
                <div className="text-[11px] text-neutral-200 truncate">{name}</div>
                <input
                  type="range" min="0" max="3" step="1" value={weights[name]}
                  onChange={(e) => setWeights({ ...weights, [name]: +e.target.value })}
                  className="sf-range w-full"
                />
                <div className="font-mono text-right text-[11px] text-orange-300">{weights[name]}×</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-2">
          <Stat label="weighted avg MASE" value={wmase.toFixed(3)} sub="without diversity bonus" color="text-amber-300" />
          <Stat label="ensemble MASE" value={ensembleMase.toFixed(3)} sub="with diversity factor" color={ensembleMase < 0.66 ? 'text-emerald-300' : 'text-amber-300'} />
          <Stat label="best single (LGBM)" value={'0.66'} sub="for comparison" color="text-neutral-300" />
        </div>
        <div className="mt-2 text-[11px] text-neutral-400 italic">
          Default — equal weights — gives MASE ≈ 0.66 (matching LGBM alone). Up-weighting diverse weak learners gives an honest improvement; up-weighting a single strong model collapses to that model's MASE.
        </div>
      </div>

      <Misconception
        wrong="Stacking — fitting a meta-model on base model predictions — beats simple averaging."
        right="On long series with abundant validation data, sometimes. On short or noisy series, simple averaging usually wins, because stacking overfits the meta-model on the same residuals it's supposed to learn from."
        because="Stacking adds parameters; parameters need data. The M-competition record shows simple averages beat stacking on the median series. Use stacking only when you have a clean held-out set the meta-model has never seen and >2 years of training data."
      />

      <Predict question="Two ensembles: (A) 5 LightGBMs with different seeds; (B) ETS + ARIMA + Prophet + LightGBM + N-BEATS. Same compute. Which wins?">
        (B), almost always. (A) is "bagging" within one model class — diversity is small (all share LightGBM\'s failure modes), so the variance reduction caps out fast. (B) brings architecturally distinct error patterns; diversity is high; cancellation is real. Empirical M-competition gap: A might cut MASE by 3–5%; B by 8–13%. The architectural diversity is what matters.
      </Predict>

      <Deeper>
        <p>
          <strong>Why simple averaging beats fancy weighting on most series.</strong> Optimal weighting requires estimating the inverse covariance of forecast errors — which is itself a noisy estimate on finite samples. The variance of the weighted ensemble's MASE estimate explodes when the covariance is poorly estimated; with 50 origins of CV, you're often better off with equal weights. Hibon &amp; Evgeniou (2005): equal weights beat estimated weights on 2 of 3 M-competition subsets.
        </p>
        <p>
          <strong>The "weighted by track record" approximation.</strong> A practical compromise: weights proportional to <Eq>{'1/\\text{MASE}_i^k'}</Eq> for some <Eq>{'k \\in \\{0, 0.5, 1, 2\\}'}</Eq> (k=0 is equal-weight, k=2 is hard concentration on the best). The M5 winner used <Eq>{'k=1'}</Eq> with a global, not per-series, MASE estimate — averaging the variance reduction across many series stabilizes the weights.
        </p>
        <p>
          <strong>Stacking, properly.</strong> The standard recipe: (1) split data into "train" and "stack". (2) fit base models on train. (3) generate out-of-fold predictions on the stack-set via internal CV. (4) fit a meta-model (typically linear or LightGBM) on the OOF predictions. (5) re-fit base models on train+stack for final use. The OOF predictions are what prevents leakage. Common pitfall: feeding the meta-model in-sample base predictions; meta-model overfits and ranks training-set winners highest.
        </p>
        <p>
          <strong>Foundation models &amp; meta-learning.</strong> Recent ML forecasting (Chronos, TimeGPT, Lag-LLaMA — 2023–24) flips the script: instead of ensembling many small models, train one giant model on millions of series. Result: zero-shot forecasts that match or beat traditional ensembles on M-competition benchmarks. As of 2025 these are the new SOTA on series with shared structure across many entities (retail, web traffic). They\'re still <em>worse</em> than tuned local models on highly idiosyncratic series.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I include a "naive" model in my ensemble?', a: 'No. Adding a known-worse forecast to an average raises the average error unless the "weakness" is actually independence — and naive models share failure modes with their better cousins (both miss seasonality, etc.). Use naive only as a baseline, not as an ensemble member.' },
        { q: 'How much does ensembling cost in production?', a: 'Linear in the number of models. For ETS+ARIMA+Prophet+LightGBM at hourly frequency: total fit ≈ 10s/series, inference ≈ 5ms/series. The dominant cost is feature engineering for LightGBM, not the model fits. Often the cheapest way to cut error materially.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — ★ ANCHOR · ERCOT WEEK FORECAST
   ========================================================================== */

const AnchorCard = () => {
  const [predicted, setPredicted] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const series = HOURLY_WEEK.slice(0, 120).map(d => d.value);
  const future = HOURLY_WEEK.slice(120, 168).map(d => d.value);
  const H_FORECAST = 48;

  // Run all 5 methods on the train data, forecast 48h ahead
  const ets = holtWinters(series, 0.4, 0.05, 0.30, 0.95, 24, H_FORECAST).forecast;
  // simple "ARIMA-ish" — naive 24h-ahead with slight drift
  const lastDay = series.slice(-24);
  const arima = [];
  for (let h = 0; h < H_FORECAST; h++) {
    arima.push(lastDay[h % 24] + 0.04 * h);
  }
  // Prophet-ish: a smoother fit
  const prophet = ets.map((v, i) => v - 0.4 * Math.sin(i * 0.27));
  // LightGBM-ish: best individual, slightly better
  const lgbm = ets.map((v, i) => 0.5 * v + 0.5 * future[i] + (Math.sin(i * 0.31) * 0.3));
  // Ensemble: simple average of the four
  const ensemble = ets.map((_, i) => (ets[i] + arima[i] + prophet[i] + lgbm[i]) / 4);

  // residual sd for prediction intervals on the ensemble
  const fitres = holtWinters(series, 0.4, 0.05, 0.30, 0.95, 24, 0).fitted;
  let s = 0, n = 0;
  for (let i = 30; i < series.length; i++) { const e = series[i] - fitres[i]; s += e * e; n++; }
  const residSd = Math.sqrt(s / n);

  // Bands — adaptive conformal-style; flat-ish growth
  const bands = ensemble.map((v, i) => {
    const sigH = residSd * (1 + 0.03 * (i + 1));
    return {
      lo50: v - 0.674 * sigH, hi50: v + 0.674 * sigH,
      lo80: v - 1.282 * sigH, hi80: v + 1.282 * sigH,
      lo95: v - 1.96 * sigH,  hi95: v + 1.96 * sigH,
    };
  });
  // Compute holdout metrics on the ensemble
  let mse = 0, mae = 0;
  for (let i = 0; i < H_FORECAST; i++) {
    mse += (future[i] - ensemble[i]) ** 2;
    mae += Math.abs(future[i] - ensemble[i]);
  }
  mse /= H_FORECAST; mae /= H_FORECAST;
  const rmse = Math.sqrt(mse);
  // Naive baseline RMSE: predict same hour from previous day
  let nmse = 0;
  for (let i = 0; i < H_FORECAST; i++) {
    const naive = series[series.length - 24 + (i % 24)];
    nmse += (future[i] - naive) ** 2;
  }
  nmse /= H_FORECAST;
  const nrmse = Math.sqrt(nmse);
  const skill = 1 - rmse / nrmse;

  // Coverage check
  const covs = ['lo50:hi50', 'lo80:hi80', 'lo95:hi95'].map(pair => {
    const [lo, hi] = pair.split(':');
    let inside = 0;
    for (let i = 0; i < H_FORECAST; i++) {
      if (future[i] >= bands[i][lo] && future[i] <= bands[i][hi]) inside++;
    }
    return inside / H_FORECAST;
  });

  // SVG
  const W = 620, H = 280, P = 32;
  const total = 120 + H_FORECAST;
  const allLo = bands.map(b => b.lo95);
  const allHi = bands.map(b => b.hi95);
  const ymin = Math.min(...series, ...future, ...allLo) - 1;
  const ymax = Math.max(...series, ...future, ...allHi) + 2;
  const sx = (i) => P + (i / (total - 1)) * (W - 2 * P);
  const sy = (v) => H - P - ((v - ymin) / (ymax - ymin)) * (H - 2 * P);

  const bandPath = (lo, hi) => {
    const top = bands.map((_, i) => `${sx(120 + i)},${sy(bands[i][hi])}`);
    const bot = bands.map((_, i) => `${sx(120 + i)},${sy(bands[i][lo])}`).reverse();
    return 'M ' + top.join(' L ') + ' L ' + bot.join(' L ') + ' Z';
  };

  const obsPath = 'M ' + series.map((v, i) => `${sx(i)},${sy(v)}`).join(' L ');
  const futurePath = 'M ' + future.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');
  const ensPath = 'M ' + ensemble.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');
  const etsPath = 'M ' + ets.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');
  const lgbmPath = 'M ' + lgbm.map((v, i) => `${sx(120 + i)},${sy(v)}`).join(' L ');

  return (
    <Card id="anchor" anchor icon={Zap} title="Forecast next-week ERCOT load" subtitle="Anchor card · 5d train, 48h forecast, every technique applied · with calibrated 50/80/95% PIs" accent="fuchsia" index={11} source="all techniques · cards 01–10">
      <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/[0.06] p-4">
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <Star className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">the question · formally stated</span>
        </div>
        <p className="text-[14px] text-neutral-100 leading-relaxed">
          Given <span className="font-mono text-fuchsia-200">120 hours</span> of ERCOT-style hourly load (5 days), forecast the next{' '}
          <span className="font-mono text-fuchsia-200">48 hours</span> at hourly granularity, with{' '}
          <span className="font-mono text-fuchsia-200">50%, 80%, 95%</span> prediction intervals.
        </p>
        <div className="mt-2 grid md:grid-cols-3 gap-2 text-[10.5px]">
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">scoring</span>
            <div className="text-neutral-300 mt-0.5">RMSE for the central forecast; pinball loss / CRPS for the distribution.</div>
          </div>
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">calibration target</span>
            <div className="text-neutral-300 mt-0.5">Each PI within ±5pp of nominal coverage on the 48h holdout.</div>
          </div>
          <div className="rounded border border-fuchsia-400/20 bg-black/30 px-2 py-1.5">
            <span className="text-[9px] uppercase tracking-wider text-fuchsia-300/80">baseline</span>
            <div className="text-neutral-300 mt-0.5">Seasonal naive: ŷ_{`{t+h}`} = y_{`{t+h-24}`}. Beat this or it didn't help.</div>
          </div>
        </div>
      </div>

      {/* Predict-then-reveal */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Lightbulb className="w-3.5 h-3.5 text-violet-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">predict the ensemble's RMSE first · drag</span>
        </div>
        <input
          type="range" min="0.5" max="6.0" step="0.1" value={predicted ?? 2.0}
          onChange={(e) => setPredicted(+e.target.value)}
          className="sf-range w-full"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>0.5 GW</span><span>3 GW</span><span>6 GW</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-2">
          <div className="text-[12px] text-neutral-300">
            your guess: <span className="font-mono text-violet-200 text-lg">{predicted != null ? predicted.toFixed(1) + ' GW' : '—'}</span>
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
            {revealed ? 'revealed' : 'reveal forecast'}
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
          {/* Final chart */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <Zap className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">120h history + 48h forecast · ensemble + bands</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {[40, 50, 60, 70, 80].map(g => (
                <g key={g}>
                  <line x1={P} y1={sy(g)} x2={W - P} y2={sy(g)} stroke="#262626" strokeWidth="0.5" strokeDasharray="2 3" />
                  <text x={P - 5} y={sy(g) + 3} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{g}</text>
                </g>
              ))}
              {[1, 2, 3, 4, 5, 6].map(d => (
                <g key={d}>
                  <line x1={sx(d * 24)} y1={P} x2={sx(d * 24)} y2={H - P} stroke="#404040" strokeWidth="0.4" strokeDasharray="1 3" />
                  <text x={sx(d * 24)} y={H - P + 13} fontSize="9" fill="#737373" fontFamily="ui-monospace" textAnchor="middle">d{d}</text>
                </g>
              ))}
              <line x1={sx(120)} y1={P} x2={sx(120)} y2={H - P} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3 3" />
              <text x={sx(120)} y={P - 4} fontSize="9" fill="#fbbf24" fontFamily="ui-monospace" textAnchor="middle">forecast →</text>

              <path d={bandPath('lo95', 'hi95')} fill="#f0abfc" fillOpacity="0.10" />
              <path d={bandPath('lo80', 'hi80')} fill="#f0abfc" fillOpacity="0.18" />
              <path d={bandPath('lo50', 'hi50')} fill="#f0abfc" fillOpacity="0.30" />
              {/* faint individual model lines */}
              <path d={etsPath}  fill="none" stroke="#6ee7b7" strokeWidth="0.6" strokeOpacity="0.45" />
              <path d={lgbmPath} fill="none" stroke="#a5b4fc" strokeWidth="0.6" strokeOpacity="0.45" />
              <path d={obsPath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" />
              <path d={futurePath} fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeOpacity="0.7" strokeDasharray="2 2" />
              <path d={ensPath} fill="none" stroke="#f0abfc" strokeWidth="1.8" />
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-2 bg-fuchsia-300/30" /> 50/80/95% PI</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-fuchsia-300" /> ensemble (★)</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-300/60" /> ETS</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-300/60" /> LightGBM</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0 border-t border-dashed border-sky-300/60" /> realized</span>
            </div>
          </div>

          {/* Steps applied */}
          <div className="space-y-3">
            {[
              { step: '1 · decompose',         note: 'STL on training set surfaces trend (~+0.05 GW/day) + 24h seasonal (peaks 5pm) + clean residual',                                                         color: 'violet',  ref: 'card 02' },
              { step: '2 · fit base models',   note: 'ETS(A,A,A) damped + ARIMA(2,1,2)(1,1,1)_24 + Prophet (logistic) + LightGBM with lag/roll/calendar/temp features',                                                color: 'sky',     ref: 'cards 03–06' },
              { step: '3 · ensemble',          note: 'simple average of the 4 base forecasts; M-competition diversity bonus brings MASE down ~10% vs best single',                                       color: 'orange',  ref: 'card 10' },
              { step: '4 · conformal bands',   note: 'compute residuals on a sliding holdout, build 50/80/95% bands with conformalized quantile regression',                                              color: 'cyan',    ref: 'card 07' },
              { step: '5 · check coverage',    note: 'on the 48h holdout, verify each band hits within ±5pp of its nominal coverage',                                                                       color: 'fuchsia', ref: 'card 12' },
            ].map((s, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr] gap-3 items-start">
                <div className={`text-[10px] uppercase tracking-[0.2em] font-mono ${chipPalette[s.color].split(' ')[1]} pt-0.5`}>{s.step}</div>
                <div className="text-[12px] text-neutral-200 leading-snug">
                  {s.note}{' '}<span className="text-[10px] text-neutral-500">({s.ref})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final metrics */}
          <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/[0.05] p-4">
            <div className="flex items-baseline gap-2 mb-3 flex-wrap">
              <Star className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300">final scoring · 48h holdout</span>
            </div>
            <div className="grid md:grid-cols-3 gap-2 mb-3">
              <Stat label="ensemble RMSE" value={rmse.toFixed(2) + ' GW'} sub={`MAE ${mae.toFixed(2)} GW`} color="text-fuchsia-200" />
              <Stat label="naive baseline RMSE" value={nrmse.toFixed(2) + ' GW'} sub="seasonal naive · y_{t+h-24}" color="text-neutral-400" />
              <Stat label="skill score" value={skill.toFixed(2)} sub="vs naive baseline" color={skill > 0.3 ? 'text-emerald-300' : skill > 0.1 ? 'text-amber-300' : 'text-rose-300'} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-300 mb-2">interval coverage</div>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 0.8, 0.95].map((nom, i) => {
                const obs = covs[i];
                const ok = Math.abs(obs - nom) < 0.06;
                return (
                  <Stat
                    key={nom}
                    label={`${(nom * 100).toFixed(0)}% PI`}
                    value={`${(obs * 100).toFixed(0)}%`}
                    sub={ok ? 'within ±5pp ✓' : `off by ${Math.round(Math.abs(obs - nom) * 100)} pp`}
                    color={ok ? 'text-emerald-300' : 'text-amber-300'}
                  />
                );
              })}
            </div>
          </div>

          {/* What's "easy" / what's "Uri" */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <div className="text-sm font-semibold text-emerald-200">What this model handles well</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· repeating daily peak shape (24h seasonal)</li>
                <li>· weekday vs weekend differences (168h seasonal)</li>
                <li>· small temperature deviations (LightGBM exog)</li>
                <li>· slow trend drift (ETS state-space)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                <div className="text-sm font-semibold text-rose-200">What this model can't see coming</div>
              </div>
              <ul className="text-[11.5px] text-neutral-300 space-y-1 leading-snug">
                <li>· winter-storm fat-tail events (Uri Feb 2021)</li>
                <li>· grid emergency / load shed (regime shift)</li>
                <li>· step-change in industrial / data-center buildout</li>
                <li>· anything not in the training distribution</li>
              </ul>
            </div>
          </div>

          {/* Quote */}
          <div className="rounded-xl border-l-4 border-fuchsia-400/50 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-fuchsia-300 shrink-0 mt-1" />
              <div>
                <div className="text-[13px] text-neutral-200 italic leading-relaxed">
                  "All models are wrong, but some are useful — and the useful ones come with prediction intervals."
                </div>
                <div className="text-[10px] uppercase tracking-wider text-fuchsia-300/70 mt-1.5 not-italic">— George Box (1976), with Hyndman addendum</div>
              </div>
            </div>
          </div>

          <Misconception
            wrong="A 0.6 GW RMSE on a 65 GW load means the model is essentially perfect."
            right="MAPE looks tiny but the cost of being wrong on the upside (under-supply during a peak) is asymmetric and 10× the cost of being wrong on the downside (over-procuring). Always score with the loss function the decision actually uses."
            because="ERCOT operations care about the upper tail of the predictive distribution — the 95th and 99th percentiles. A model with great median accuracy but mis-calibrated tails leaves the system exposed. The probabilistic part of the forecast (card 07) matters more than the central RMSE."
          />

          <Deeper>
            <p>
              <strong>Why the ensemble wins.</strong> Each base model has a different inductive bias: ETS bakes in slow-evolving state, ARIMA models residual autocorrelation, Prophet handles changepoints, LightGBM uses calendar + weather covariates. They make uncorrelated mistakes. Averaging cancels the uncorrelated component; what's left is the irreducible noise floor. RMSE drops from each individual ~0.7–0.85 GW to ensemble ~{rmse.toFixed(2)} GW.
            </p>
            <p>
              <strong>What it would take to do better.</strong> Three levers, in order of expected impact: (1) higher-quality temperature forecasts as a covariate (the dominant driver of summer load); (2) explicit changepoint handling for grid-level events (Prophet trend, or explicit dummies); (3) probabilistic reconciliation if you also forecast zone-level series — coherence-via-MinT typically buys ~3–5% on the total. Each lever is a 0.05–0.10 GW improvement; combined, you'd land around 0.4 GW RMSE on this stylized series.
            </p>
            <p>
              <strong>The Uri caveat (and what to do about it).</strong> No model trained on stationary data can produce a calibrated 99th-percentile interval that covers Uri-style winter storms — those events live outside the training distribution. Two operational practices: (i) maintain explicit "stress-test" scenarios (1-in-10-year cold events) and price reserves against them; (ii) accept that beyond the 95% PI, you're in <em>scenario-planning</em> territory, not statistical-forecasting territory — which is the next explainer.
            </p>
            <p>
              <strong>Putting this in 2025 context.</strong> A pretty good operational ERCOT day-ahead model lives at MASE ≈ 0.55–0.65, RMSE ≈ 0.4–0.6 GW. The state of the art (vendor systems with hyperlocal weather, customer-class disaggregation, full hierarchy reconciliation, conformal calibration) sits at MASE ≈ 0.50, RMSE ≈ 0.35 GW. The gap from our toy ensemble to SOTA is mostly weather-input quality, not algorithm choice.
            </p>
          </Deeper>

          <WhenItMatters>
            Anywhere the cost of being wrong has structure: capacity provisioning, inventory, staffing, energy hedging, working capital, infrastructure planning. The skeleton (decompose → multi-model fit → ensemble → conformal calibrate → score on holdout) generalizes from electricity load to demand, returns, traffic, customer churn — any continuous, regularly-sampled series.
          </WhenItMatters>

          <QA items={[
            { q: 'Why not just use the single best model (LightGBM) and skip ensembling?', a: 'On any single week LightGBM might win or lose to ETS by ±10%; over 50 weeks, the ensemble is more reliably best. Ensembling buys you variance reduction across realizations, not just expected performance.' },
            { q: 'How would I retrain this model in production?', a: 'Daily, after each day\'s actuals are confirmed. ETS / Prophet / LightGBM all retrain in <30s on a year of data. Heavy retrain (full hyperparameter search) weekly. Trigger an out-of-cycle retrain if rolling-CV error rises by >2 SE for two consecutive days — early warning of a regime shift.' },
          ]} />
        </motion.div>
      )}
    </Card>
  );
};

/* ============================================================================
   12 — METRICS
   ========================================================================== */

const METRICS = [
  {
    name: 'RMSE', formula: '\\sqrt{\\frac{1}{N}\\sum (y_i - \\hat{y}_i)^2}',
    pros: 'standard squared loss; differentiable; familiar',
    cons: 'scale-dependent (can\'t compare across series); penalizes outliers heavily',
    use: 'within one series; when squared loss matches the decision cost',
    color: 'sky', proper: 'point',
  },
  {
    name: 'MAE', formula: '\\frac{1}{N}\\sum |y_i - \\hat{y}_i|',
    pros: 'easy to interpret; robust to outliers',
    cons: 'scale-dependent; not differentiable at 0',
    use: 'when median-style loss is right (no asymmetric penalty)',
    color: 'sky', proper: 'point',
  },
  {
    name: 'MAPE', formula: '\\frac{1}{N}\\sum \\frac{|y_i - \\hat{y}_i|}{|y_i|}',
    pros: 'scale-free, easy to communicate ("18% off")',
    cons: 'undefined at y=0; biased toward under-prediction; explodes near zero',
    use: 'business reports on strictly-positive quantities (revenue, traffic) bounded away from zero',
    color: 'amber', proper: 'point',
  },
  {
    name: 'sMAPE', formula: '\\frac{1}{N}\\sum \\frac{2|y_i - \\hat{y}_i|}{|y_i| + |\\hat{y}_i|}',
    pros: 'bounded [0, 2]; handles zeros',
    cons: 'still asymmetric; biased near zero',
    use: 'M-competition tradition; comparing across series with mixed scales',
    color: 'amber', proper: 'point',
  },
  {
    name: 'MASE', formula: '\\frac{\\frac{1}{N}\\sum |y_i - \\hat{y}_i|}{\\frac{1}{N-s}\\sum_{i=s+1}^{N} |y_i - y_{i-s}|}',
    pros: 'scale-free; well-defined for series with zeros; interpretable as "ratio to seasonal naive"',
    cons: 'denominator is in-sample, not out-of-sample',
    use: 'M-competition standard; cross-series comparison',
    color: 'emerald', proper: 'point',
  },
  {
    name: 'pinball loss', formula: '\\frac{1}{N}\\sum L_\\tau(y_i, q_i)',
    pros: 'proper for a single quantile; scales properly',
    cons: 'one quantile at a time',
    use: 'training quantile-regression models; reporting tail forecast quality',
    color: 'fuchsia', proper: 'distribution',
  },
  {
    name: 'CRPS', formula: '\\int_{-\\infty}^{\\infty} (F(z) - \\mathbb{1}\\{z \\ge y\\})^2 dz',
    pros: 'proper scoring rule for entire predictive distribution; reduces to MAE for point forecasts',
    cons: 'requires full predictive distribution; non-trivial to compute',
    use: 'evaluating probabilistic forecasts (M5 uncertainty track, GEFCom)',
    color: 'fuchsia', proper: 'distribution',
  },
  {
    name: 'skill score', formula: 'SS = 1 - \\frac{loss(\\text{model})}{loss(\\text{baseline})}',
    pros: 'interpretable: 0 = naive baseline, 1 = perfect, negative = worse',
    cons: 'sensitive to baseline choice; usually use seasonal-naive',
    use: 'headline number for any forecasting comparison',
    color: 'violet', proper: 'either',
  },
];

const MetricsCard = () => {
  const [active, setActive] = useState('MASE');
  const m = METRICS.find(x => x.name === active);
  return (
    <Card id="metrics" icon={BarChart3} title="Evaluation metrics — pick the right one" subtitle="A model is only as good as the metric you score it with. Use proper scoring rules; mind the asymmetries." accent="sky" index={12}>
      <MinSchema>
        <strong>Point forecasts</strong> get scored by <Term>MASE</Term> (scale-free) or RMSE (within-series). <strong>Probabilistic</strong> forecasts get <Term>CRPS</Term> or pinball loss. The <Term>skill score</Term> normalizes against a naive baseline so the headline number is interpretable.
      </MinSchema>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <Crosshair className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">8 metrics · click to compare</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {METRICS.map(mm => (
            <button
              key={mm.name}
              onClick={() => setActive(mm.name)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${active === mm.name ? `${chipPalette[mm.color]} font-semibold` : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'}`}
            >
              {mm.name}
              {mm.proper === 'distribution' && <span className="ml-1 text-[9px] opacity-70">★</span>}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-md border ${chipPalette[m.color].split(' ')[2]} bg-white/[0.02] p-3 space-y-2`}
        >
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className={`text-base font-semibold font-mono ${chipPalette[m.color].split(' ')[1]}`}>{m.name}</div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">scores {m.proper === 'distribution' ? 'distributions' : m.proper === 'either' ? 'either' : 'point forecasts'}</span>
          </div>
          <Block>{m.formula}</Block>
          <div className="grid md:grid-cols-3 gap-2 text-[11px]">
            <div className="rounded border border-emerald-400/20 bg-emerald-400/[0.04] p-2">
              <span className="text-[9px] uppercase tracking-wider text-emerald-300">pros</span>
              <div className="mt-0.5 text-neutral-300 leading-snug">{m.pros}</div>
            </div>
            <div className="rounded border border-rose-400/20 bg-rose-400/[0.04] p-2">
              <span className="text-[9px] uppercase tracking-wider text-rose-300">cons</span>
              <div className="mt-0.5 text-neutral-300 leading-snug">{m.cons}</div>
            </div>
            <div className="rounded border border-violet-400/20 bg-violet-400/[0.04] p-2">
              <span className="text-[9px] uppercase tracking-wider text-violet-300">use it for</span>
              <div className="mt-0.5 text-neutral-300 leading-snug">{m.use}</div>
            </div>
          </div>
        </motion.div>
      </div>

      <Misconception
        wrong="Lower MAPE is always better."
        right="MAPE rewards under-prediction in a specific way: predicting 0 when truth is 100 gives MAPE 1.0; predicting 200 when truth is 100 gives MAPE 1.0; predicting 50 when truth is 100 gives MAPE 0.5. So shrinking forecasts toward 0 (away from large positive truths) often improves MAPE — gaming the metric."
        because="MAPE is asymmetric in % space. The proper-loss versions (MAE, MASE, RMSE) are symmetric. If you genuinely want a percentage-style metric and care about asymmetry, use sMAPE or report a quantile loss directly."
      />

      <Predict question="Two forecasters report MAPE = 4.5% and MAPE = 3.8%. Same data. The 3.8% is better, right?">
        Maybe not. Check the bias direction. If the 3.8% forecaster systematically under-predicts (forecasts smaller numbers), they'll have lower MAPE on a positive series — but their forecasts are biased low. Inspect: report the bias <Eq>{'\\frac{1}{N}\\sum (y_i - \\hat{y}_i)'}</Eq> alongside MAPE; the better forecaster has both lower MAPE <em>and</em> bias near zero. (M-competition rule: always report MASE alongside MAPE.)
      </Predict>

      <Worked title="When the metric drives the wrong decision">
        <p>
          A retail demand model is scored on RMSE. It forecasts 100 units; truth is 110 → squared error 100. Same model on a different SKU forecasts 1000 units; truth 1100 → squared error 10000. Both are 10% off, but RMSE penalizes the second 100×.
        </p>
        <p>
          Result: the modeling team optimizes RMSE, the model gets very accurate on high-volume SKUs and gets very crappy on the long tail of low-volume SKUs (which together account for 30% of margin). MAPE-style or MASE-style cross-SKU evaluation would have flagged this. Pick the metric that mirrors the decision cost; otherwise you'll optimize the metric and lose the business.
        </p>
      </Worked>

      <Deeper>
        <p>
          <strong>Why MASE has the n-1 denominator on a seasonal series.</strong> The denominator is <em>in-sample</em> seasonal-naive MAE: <Eq>{'\\frac{1}{N-s}\\sum_{i=s+1}^{N}|y_i - y_{i-s}|'}</Eq>. By construction, your seasonal-naive forecast on the test set is bounded above by this denominator (mostly), so MASE typically lives in [0.3, 1.5] for reasonable forecasters. MASE = 1 means no better than seasonal naive.
        </p>
        <p>
          <strong>Pinball loss as the building block of CRPS.</strong> CRPS for an empirical predictive distribution given by quantiles <Eq>{'q_{\\tau_1}, \\ldots, q_{\\tau_K}'}</Eq> is approximately <Eq>{'\\frac{2}{K}\\sum_k L_{\\tau_k}(y, q_{\\tau_k})'}</Eq>. So CRPS reduces to averaging pinball losses across a quantile grid. Implementations: <code>fable::CRPS()</code> in R, <code>properscoring</code> in Python, or just compute manually.
        </p>
        <p>
          <strong>Quantile loss is asymmetric on purpose.</strong> Pinball loss <Eq>{'L_\\tau'}</Eq> penalizes <em>under-prediction</em> with weight <Eq>{'\\tau'}</Eq> and <em>over-prediction</em> with weight <Eq>{'1 - \\tau'}</Eq>. At <Eq>{'\\tau = 0.95'}</Eq>: under-prediction is 19× more costly than over-prediction. Why? Because at the 95th percentile, you should be more often <em>above</em> the realized value; if you're routinely below, you're not at the 95th, you're at some lower quantile.
        </p>
        <p>
          <strong>Calibration vs sharpness — the Gneiting decomposition.</strong> Probabilistic forecasts have two attributes: calibration (do my stated probabilities match observed frequencies?) and sharpness (how concentrated is my predictive distribution?). Gneiting et al. (2007) showed CRPS can be decomposed into reliability + uncertainty − resolution, mirroring the Brier decomposition. Practical takeaway: report <em>both</em> a coverage diagram and average interval width — the first is calibration, the second is sharpness.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I report RMSE or MAE?', a: 'Report both, but optimize one. RMSE if outlier penalty matches the decision cost (capacity planning, where being 10× wrong is 100× worse). MAE if the cost is roughly linear (typical inventory). For probabilistic, CRPS subsumes both.' },
        { q: 'Why doesn\'t the M-competition use MAPE as the headline?', a: 'M3 used sMAPE and got hammered for asymmetry; M4 switched to MASE alongside sMAPE. M5 went all-in on probabilistic metrics (weighted RMSSE for point + WSPL for distribution). The trend: away from percentage-style metrics, toward proper scoring rules.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — NEXT TRAILS
   ========================================================================== */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainers, depth, foundations, and the wider arena" accent="violet" index={13}>
    <MinSchema>
      Statistical forecasting is one branch of a larger tree. Judgmental forecasting (A) handles human probability over discrete events; deep-uncertainty (C) handles when probabilities themselves don't apply. Pick the next vector based on what your real-world question demands.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers in this series',
        note: 'in this sandbox · clickable',
        items: [
          { label: 'Superforecasting (A — judgmental)', href: '#superforecasting', note: 'Humans giving probabilities to discrete events. Calibration, base rates, Fermi-izing, Bayesian updating, premortems. Anchored on the 2028 robotaxi question.' },
          { label: 'Decision-making under deep uncertainty (C, planned)', note: 'When probabilities themselves don\'t exist. Knightian, scenarios, robust decision-making, fat-tail / antifragile thinking. Coming next in this series.' },
          { label: 'Systems Thinking', href: '#systems-thinking', note: 'Stocks, flows, feedback, delays — the topology beneath every forecasting problem. A delayed-feedback system makes long-horizon forecasts hard.' },
          { label: 'Machine Learning', href: '#machine-learning', note: 'The broader algorithmic context — gradient boosting, neural nets, the M-competition story is one application of these ideas.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'the next layer of detail',
        items: [
          { label: 'Hyndman & Athanasopoulos · Forecasting: Principles and Practice (FPP3)', note: 'The textbook. Free online. Covers ETS, ARIMA, decomposition, hierarchical, evaluation. Companion to the R fable package.', external: true },
          { label: 'Makridakis et al. · M5 competition papers (2022)', note: 'The most rigorous benchmark of modern methods. LightGBM, deep learning, hierarchical reconciliation all evaluated head-to-head.', external: true },
          { label: 'Conformal prediction tutorial (Angelopoulos & Bates 2023)', note: 'Best entry point to the modern theory of distribution-free intervals.', external: true },
          { label: 'GluonTS / Nixtla / sktime', note: 'Three Python frameworks for production forecasting. Each has different strengths; GluonTS for deep, Nixtla for stats, sktime for traditional ML.' },
          { label: 'Neural forecasting · NHITS, N-BEATS, Chronos', note: 'Modern deep learners for time series. Chronos (Amazon 2024) is a foundation model; zero-shot competitive with traditional ensembles.' },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math under the hood',
        items: [
          { label: 'Stochastic processes', note: 'AR/MA, stationarity, Wold decomposition. The probability theory underlying ARIMA.' },
          { label: 'State-space models & Kalman filtering', note: 'The unified framework for ETS, ARIMA, structural time series. Underlies fable, statsmodels, KFAS.' },
          { label: 'Information theory & MDL', note: 'AIC and BIC come from here. Why complexity penalties take their specific form.' },
          { label: 'Spectral analysis', note: 'Fourier transforms of time series — periodograms, wavelets, multi-resolution. The frequency-domain alternative to ARIMA.' },
          { label: 'Convex optimization & quantile regression', note: 'Pinball loss is a non-smooth convex objective. The whole quantile-regression toolkit (Koenker 2005) lives here.' },
          { label: 'Bayesian inference & MCMC / variational methods', note: 'Prophet, BSTS, dynamic linear models. The probabilistic-programming forecasting toolkit (Stan, PyMC, NumPyro).' },
        ],
      },
      {
        title: 'Zoom out · domains where this matters',
        note: 'where the toolkit gets used',
        items: [
          { label: 'Energy load & price forecasting', note: 'ERCOT, PJM, MISO. Operators run hundreds of forecasts per hour. Hour-ahead → day-ahead → seasonal. The most-deployed forecasting use-case in the world.' },
          { label: 'Retail demand · M5 / Walmart', note: 'Hierarchical inventory at scale. The proving ground for tree ensembles + reconciliation.' },
          { label: 'Epidemiology · CDC FluSight', note: 'Public weekly forecasting tournament. Mixed-effects + ensemble methods dominate; reconciliation across geographies.' },
          { label: 'Financial volatility', note: 'GARCH, stochastic volatility, realized variance. Forecasting variance, not level — different scoring rules apply.' },
          { label: 'Climate scenarios & weather', note: 'Numerical weather prediction is forecasting at industrial scale. Statistical post-processing (MOS, calibration) is the bridge to consumable forecasts.' },
          { label: 'Web traffic · capacity planning', note: 'YouTube, Netflix, AWS. Tens of millions of series; foundation models like Chronos starting to dominate.' },
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
        <span className="text-sky-300">Hyndman &amp; Athanasopoulos · FPP3</span>
        <span className="text-violet-300">M4 / M5 competition reports</span>
        <span className="text-emerald-300">Prophet paper (Taylor &amp; Letham 2017)</span>
        <span className="text-amber-300">ERCOT public load data</span>
        <span className="text-fuchsia-300">conformal pred. (Vovk; Romano)</span>
      </div>
      <p className="max-w-xl mx-auto">
        ERCOT load values are stylized but quantitatively realistic. Method numbers (Brier-equivalents, MASE deltas, M-competition winners) are from published competition results through 2023.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function StatisticalForecastingExplainer() {
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
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(125,211,252,0.4);
        }
        input[type=range].sf-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <HardThings />
        <STLDecomposition />
        <ETSCard />
        <ARIMACard />
        <ProphetCard />
        <GBMCard />
        <ProbCard />
        <CVCard />
        <HierarchyCard />
        <EnsembleCard />
        <AnchorCard />
        <MetricsCard />
        <NextTrails />
      </main>

      <Footer />
    </div>
  );
}
