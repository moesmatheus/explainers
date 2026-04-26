import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, BarChart3, BoxSelect, Boxes, BrainCircuit, ChevronDown, Compass,
  Crosshair, Eye, EyeOff, Filter, FlaskConical, Gauge, GitBranch, HelpCircle,
  Hourglass, Layers, LineChart, Lightbulb, Link2, Network, Quote, Radar,
  ScrollText, ShieldAlert, Sigma, Sparkles, Star, Target, Telescope,
  TrendingUp, TrendingDown, Waves, Workflow, Zap, AlertTriangle, CheckCircle2,
  XCircle, Ruler,
} from 'lucide-react';

/* ============================================================================
   The Forecaster's Craft — From Information to Edge
   How a quantitative football model actually earns alpha.
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
  // Loss & scoring
  'log-loss': 'Negative log-likelihood — −Σ log p(y|x). The standard probabilistic classification loss. Punishes confident wrong predictions hard; calibration-friendly under MLE.',
  'Brier score': 'Mean squared error between predicted probability and the 0/1 outcome. Decomposes cleanly into reliability + resolution + uncertainty.',
  'CRPS': 'Continuous Ranked Probability Score — generalization of Brier to continuous predictive distributions. Integral of squared distance between predicted CDF and the indicator of the realized value.',
  'pinball loss': 'L_α(y, q) = max(α(y−q), (α−1)(y−q)). Proper scoring rule for a single quantile. Average across a quantile grid → CRPS.',
  'proper scoring rule': 'A loss whose expected value is minimized by reporting the true predictive distribution. Log-loss, Brier, CRPS, pinball are all proper. ROI is not.',
  'expected log-growth': 'E[log(1 + f·r)] where f is bet fraction and r is the return per unit. The thing Kelly maximizes — the right loss for repeated proportional betting.',

  // Calibration
  'calibration': 'Whether stated probabilities match observed frequencies. A 60% forecast should resolve YES 60% of the time over many bets.',
  'sharpness': 'How concentrated the predictive distribution is. Sharpness without calibration is dangerous; calibration without sharpness is useless.',
  'isotonic regression': 'Non-parametric monotonic recalibration. Bins predictions, fits a non-decreasing step function from p̂ to observed frequency. The default recalibrator.',
  'Platt scaling': 'Logistic recalibration: σ(a·logit(p̂) + b). Two parameters. Cheap, smooth, but misses non-monotonic mis-calibration.',
  'reliability diagram': 'Bin predictions by p̂; plot mean predicted vs observed frequency per bin. The diagonal is perfect calibration.',

  // Markets & odds
  'vig': 'Bookmaker margin baked into odds. Sum of implied probabilities exceeds 1; the excess is the vig (a.k.a. overround).',
  'overround': 'Same as vig. Σ (1/odds) − 1.',
  'implied probability': '1 / decimal_odds. Includes vig — not a fair probability.',
  'closing odds': 'The final odds posted just before kickoff. Captures the consensus of all sharp money.',
  'closing line': 'Same as closing odds. The market’s last word before the event resolves.',
  'CLV': 'Closing Line Value — your average % beat of the closing line on bets you took. Far less noisy than ROI; the only reliable signal that you’re sharp.',
  'Pinnacle': 'A sharp book — takes large stakes from professionals, low margin, doesn’t limit winners. Its closing line is the de-facto efficient consensus.',
  'sharp book': 'A book that welcomes sharp action and uses it to set its line. Pinnacle, Circa. Their closing odds are the truth-meter.',
  'soft book': 'A book that limits or bans winners. Most retail books — Bet365, DraftKings, William Hill. Higher margin, weaker lines.',
  '1X2': 'Three-way main football market: home win / draw / away win.',
  'Asian handicap': 'A football market where one team gets a goal handicap (often non-integer). Removes the draw, splits some bets into half-wins / half-losses.',
  'over/under': 'Bet on whether total match goals exceed a threshold (typically 2.5).',
  'BTTS': 'Both Teams To Score. Yes/No.',
  'kelly': 'Optimal bet fraction f* = (b·p − q) / b that maximizes expected log-bankroll growth, given true edge p and odds b.',
  'kelly fraction': 'Same as kelly — the f* fraction of bankroll to stake, maximizing E[log(1 + f·r)].',
  'fractional Kelly': 'Bet a fixed multiple (e.g. 0.25) of full Kelly. Trades growth for survival; equivalent to a Bayesian shrinkage on edge uncertainty.',

  // Time-aware CV
  'walk-forward CV': 'Time-respecting cross-validation: train on [start..t], validate on (t..t+h], advance t, repeat. The only honest CV for time series.',
  'expanding window': 'Walk-forward where the training window grows; the start stays fixed.',
  'rolling window': 'Walk-forward where the training window slides; both start and end advance.',
  'embargo': 'A gap of size g between the end of train and the start of validation, sized to cover any leakage of future-affecting information through features.',
  'purging': 'Dropping training samples whose labels overlap in time with validation samples (À la López de Prado).',
  'data leakage': 'When information from after the prediction time leaks into training. The cardinal sin of time-series ML.',
  'OOF': 'Out-of-fold — predictions made on validation rows during CV (never seeing themselves in training). The legal substrate for stacking.',

  // Information theory
  'KL divergence': 'D_KL(p∥q) = Σ p log(p/q). The expected log-likelihood-ratio gain from believing p over q. The natural unit of information.',
  'mutual information': 'Average reduction in uncertainty about Y given X. I(X;Y) = H(Y) − H(Y|X). A model-free measure of feature relevance.',
  'cross-entropy': '−Σ p log q. Equals KL(p∥q) + H(p). The classification-loss form of log-likelihood.',
  'log-likelihood ratio': 'log P(D|H_A) − log P(D|H_B). The amount of evidence one hypothesis has over another. Bayes factors are exponentiated LRs.',

  // Hierarchical / Bayesian
  'partial pooling': 'Bayesian compromise between fitting each group separately (no pooling) and fitting one model for all (complete pooling). The variance of the group-level prior tunes the shrinkage.',
  'shrinkage': 'Pulling estimates toward a prior or grand mean; trades bias for variance. Smaller groups get pulled harder.',
  'hierarchical model': 'A model where parameters are themselves drawn from a higher-level distribution. Permits partial pooling; the natural structure for league/team data.',
  'Dixon-Coles': 'A bivariate Poisson model of football scores with a small low-score correction. The standard analytic-football-model baseline.',
  'bivariate Poisson': 'Joint distribution where home and away goal counts are correlated Poissons — the natural likelihood for football scores.',
  'Skellam': 'Distribution of the difference of two Poissons; gives an analytic form for goal-difference markets (Asian handicap).',
  'Elo': 'Rating system that updates each team’s strength after each match by an amount proportional to the surprise. Generalizes to football well; baseline for any latent-strength feature.',
  'Glicko': 'Elo extension that tracks rating uncertainty (a variance) per team. Strength estimates with confidence intervals.',
  'TrueSkill': 'Microsoft’s Bayesian rating system; multi-team, with rating + uncertainty per player. Used in matchmaking.',
  'state-space model': 'Latent-state dynamics + observation equation. ETS, ARIMA, Elo, Kalman filters all live here.',
  'Kalman filter': 'Optimal recursive Bayesian estimator for linear-Gaussian state-space models. Used for tracking team strength over time.',

  // Feature engineering
  'xG': 'Expected Goals — a per-shot quality estimate that sums to a per-match expectation. Higher signal-to-noise than raw goals; the standard analytic football feature.',
  'target encoding': 'Replace a categorical value with the mean of the target for that category, computed on a leave-one-out / out-of-fold basis to avoid leakage.',
  'rolling stats': 'Features built from a rolling window of past matches (mean, std, weighted average). Must be computed strictly from the past to avoid leakage.',
  'lag feature': 'Past value of the target or related variable (e.g. last-match goals). Lets a tabular model see autoregressive structure.',
  'time-decay': 'Weighting older observations less. Exponential or power decay; the time-equivalent of shrinkage.',

  // Causal
  'DAG': 'Directed Acyclic Graph encoding causal relationships between variables. The substrate for do-calculus and confounder reasoning.',
  'confounder': 'A variable that causes both the predictor and the outcome, inducing spurious correlation. Manager change confounds form and result.',
  'do-calculus': 'Pearl’s rules for converting interventional queries P(Y|do(X)) into observational ones from the DAG. The grammar of causal identification.',
  'instrumental variable': 'A variable that influences the outcome only through the predictor of interest. Lets you back out causal effect from observational data.',
  'collider': 'A variable causally downstream of two others. Conditioning on a collider opens a non-causal path — a common pitfall.',

  // Self-supervised / SSL
  'self-supervised': 'Learning representations from unlabeled data via pretext tasks (mask-and-predict, contrastive). The pretraining paradigm of large language models.',
  'pretext task': 'A surrogate objective (e.g. predict the masked token) used during pretraining. The downstream task uses the learned representation, not the pretext output.',
  'masked modeling': 'Pretext task where part of the input is hidden and the model learns to predict it. BERT-style.',
  'contrastive learning': 'SSL where the model learns to map similar pairs close and dissimilar pairs far. SimCLR, CLIP.',

  // Transfer / meta
  'transfer learning': 'Pretrain on a data-rich source distribution, fine-tune (or freeze and head-tune) on a data-poor target. Standard for NLP/vision; underused in sports.',
  'fine-tuning': 'Adapting a pretrained model to a new task by continuing training on labeled target data, usually with a lower learning rate.',
  'meta-learning': 'Learning to learn: training across many small tasks so a new task can be adapted from very few examples. MAML, prototypical networks.',

  // Modeling / NN
  'NGBoost': 'Natural Gradient Boosting that outputs full predictive distributions, not just point predictions. Per-instance μ, σ (or any parametric family).',
  'distributional regression': 'Regression that predicts the full conditional distribution of y given x, not just E[y|x]. Lets you derive any quantile / market.',
  'conformal prediction': 'Distribution-free framework that wraps any forecaster and produces prediction intervals with finite-sample coverage guarantees, given exchangeability.',
  'GBDT': 'Gradient Boosted Decision Trees — the dominant family for tabular ML. CatBoost, LightGBM, XGBoost.',
  'CatBoost': 'Yandex’s GBDT — native support for categorical features via ordered target encoding; robust default. Used in the user’s betting-vibe-04 project.',

  // Ensembling
  'stacking': 'Meta-ensemble: train a meta-model on the OOF predictions of base models. Powerful but leakage-prone; OOF discipline is everything.',
  'blending': 'Simpler stacking: hold out a single validation set, average base models with learned weights.',
  'BMA': 'Bayesian Model Averaging — weight each model by its posterior probability given the data. The Bayesian alternative to stacking.',
  'multi-task learning': 'One model with shared backbone + per-task heads. Learns features useful across tasks; data-efficient when targets are correlated.',
  'residual model': 'A model trained to predict the residual of an upstream model. Useful when the residual structure is different from the original signal.',

  // Selection
  'stability selection': 'Run feature selection on many bootstrap subsamples; keep features chosen above a frequency threshold. Calibrates a per-feature p-value-equivalent.',
  'Boruta': 'Feature selection algorithm: shadow-features (shuffled copies) act as a noise floor; keep features whose importance beats the shadow. Wrapper around random forests.',
  'SHAP': 'SHapley Additive exPlanations — game-theoretic feature attribution. Per-prediction or per-feature aggregate importance.',
  'adversarial validation': 'Train a classifier to distinguish train from test rows; if it succeeds, train and test differ — a drift / leakage signal.',
  'permutation importance': 'Feature importance measured by the drop in score after randomly permuting the feature’s values.',
  'multiple testing': 'Statistical inflation that occurs when you test many hypotheses; the best of N is biased upward. Bonferroni, FDR, deflated Sharpe correct for it.',
  'deflated Sharpe': 'López de Prado’s correction for the number of trials and skewness/kurtosis of the trial distribution. The honest Sharpe under multiple testing.',

  // HPO
  'Bayesian optimization': 'Hyperparameter search guided by a probabilistic surrogate (often a GP or TPE) over the response surface. Picks the next config to minimize expected loss.',
  'TPE': 'Tree-structured Parzen Estimator — the default Optuna sampler. Models p(θ|good) vs p(θ|bad) and samples from the ratio.',
  'Optuna': 'Open-source HPO framework — TPE, CMA-ES, NSGA-II, multi-fidelity, pruning. The de-facto standard for ML HPO in Python.',
  'Hyperband': 'Multi-armed-bandit HPO that runs many configs cheaply, kills bad ones early, allocates compute to survivors. Bridges grid search and Bayesian optimization.',
  'ASHA': 'Async Successive Halving — distributed Hyperband with no synchronization barriers. Scales HPO across machines efficiently.',
  'BOHB': 'Bayesian Optimization + Hyperband. TPE-guided arm selection inside a Hyperband schedule.',
  'inner CV': 'A nested cross-validation used for HPO inside an outer CV used for evaluation. Inner CV must respect the same time discipline (walk-forward) as outer.',

  // Drift
  'concept drift': 'When the conditional distribution P(Y|X) changes over time — the relationship between features and outcomes shifts.',
  'data drift': 'When the marginal distribution P(X) changes over time — the feature distribution shifts. Easier to detect than concept drift.',
  'change-point detection': 'Statistical methods that flag when a series transitions to a new regime. CUSUM, Bayesian online change-point.',
  'online learning': 'Updating model parameters incrementally as new data arrives, rather than retraining from scratch.',

  // RL / decision
  'contextual bandit': 'Sequential decision: see context x, pick action a, observe reward r. Simpler than full RL (no state transitions). The natural model of bet-selection from a slate.',
  'Thompson sampling': 'Bayesian bandit policy: sample a parameter from the posterior, act greedily. Optimal regret in many settings; cheap to implement.',
  'UCB': 'Upper Confidence Bound — deterministic bandit policy that picks the arm with the highest upper-confidence estimate. Trades exploration for exploitation by construction.',
  'reinforcement learning': 'Sequential decision-making to maximize cumulative reward. Includes state transitions; superset of bandits.',

  // Misc
  'Brasileirão': 'Brazil’s top-tier football league (Série A). 20 teams, double round-robin, ~380 matches/season. The user’s project domain.',
  'edge': 'The expected value above the market’s priced-in expectation. Measured in % of stake or in CLV.',
  'ROI': 'Return on Investment — cumulative profit / total staked. Extremely noisy in betting; needs thousands of bets before significance.',
  'bankroll': 'The amount of capital allocated to betting. Kelly sizes are fractions of bankroll; ruin risk is bankroll going to zero.',
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
   HERO + SECTION NAV
   ========================================================================== */

// "Information field" — drifting market-vs-model curves with the gap (= edge)
// shaded between them. Sets the visual metaphor for the whole explainer.
const InformationField = () => {
  const lines = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    amp: 14 + i * 3, off: 30 + i * 8, freq: 0.013 + i * 0.003, phase: i * 0.9, dur: 16 + i * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
      <defs>
        <linearGradient id="hf-edge-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f0abfc" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {lines.map((c, i) => {
        const pts = [];
        for (let x = 0; x <= 800; x += 4) {
          const y = 220 + Math.sin(x * c.freq + c.phase) * c.amp - c.off;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return (
          <motion.polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke={i % 3 === 0 ? '#7dd3fc' : i % 3 === 1 ? '#c4b5fd' : '#f0abfc'}
            strokeOpacity={0.4 + (i % 3) * 0.1}
            strokeWidth={1.1 + (i % 2) * 0.4}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, x: [0, -120, 0] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 via-violet-500/5 to-transparent" />
    <InformationField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/80 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-400/20">
          <Telescope className="w-3.5 h-3.5" /> the modeler&apos;s stack
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
          The Forecaster&apos;s Craft
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">From information to edge.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          A model only earns alpha by encoding{' '}
          <span className="text-fuchsia-300">information the market doesn&apos;t already price in</span>,
          extracted with a loss aligned to{' '}
          <span className="text-violet-300">expected log-bankroll growth</span>. Two principles, sixteen cards, one quantitative football model.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-fuchsia-300">loss alignment</span>
          <span className="text-violet-300">information hypothesis</span>
          <span className="text-sky-300">features · models</span>
          <span className="text-emerald-300">ssl · transfer · synth</span>
          <span className="text-amber-300">stacking · hpo</span>
          <span className="text-cyan-300">drift · rl portfolio</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'loss',          label: 'Loss alignment',         icon: Sigma,         anchor: true },
  { id: 'info',          label: 'Information hypothesis', icon: Telescope,     anchor: true },
  { id: 'features',      label: 'Feature engineering',    icon: BrainCircuit },
  { id: 'causal',        label: 'Causal lens',            icon: GitBranch },
  { id: 'ssl',           label: 'SSL pretraining',        icon: Layers },
  { id: 'synth',         label: 'Synthetic data',         icon: FlaskConical },
  { id: 'transfer',      label: 'Transfer across leagues',icon: Network },
  { id: 'zoo',           label: 'Modeling zoo',           icon: Boxes },
  { id: 'distributional',label: 'Distributional',         icon: Gauge },
  { id: 'inplay',        label: 'In-play / live',         icon: Activity },
  { id: 'ensembling',    label: 'Ensembling',             icon: Workflow },
  { id: 'selection',     label: 'Feature selection',      icon: Filter },
  { id: 'hpo',           label: 'Honest HPO',             icon: Sparkles },
  { id: 'drift',         label: 'Drift &amp; online',     icon: Hourglass },
  { id: 'rl',            label: 'RL portfolio',           icon: Target },
  { id: 'boundary',      label: 'Boundary &amp; map',     icon: Crosshair,     anchor: true },
  { id: 'trails',        label: 'Next trails',            icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tracking-wide" dangerouslySetInnerHTML={{ __html: s.label }} />
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-100' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>
                <span dangerouslySetInnerHTML={{ __html: s.label }} />
                {s.anchor && ' ★'}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   STUB CARDS — placeholders during scaffolding stage. Each will be replaced
   in subsequent stages C-J. The id attribute must remain stable so SectionNav
   anchors continue to scroll-target the right card.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ============================================================================
   01 — LOSS ALIGNMENT (M5 · spine)
   The right loss is the one aligned with what you'll deploy. Train on log-loss
   but deploy as Kelly bets and you're optimizing a proxy. Demonstrate by
   showing 4 models that re-rank under different losses.
   ========================================================================== */

// 4 toy models scored on a 100-bet Brasileirão-style sample. Numbers chosen so
// the leaderboard re-shuffles meaningfully across the four metrics.
const LOSS_MODELS = [
  { name: 'A · Sharp',     blurb: 'good calibration, modest sharpness',        logLoss: 0.581, brier: 0.182, clv: 1.8, growth: 2.4 },
  { name: 'B · Hedger',    blurb: 'great log-loss, won’t commit to bets',  logLoss: 0.572, brier: 0.179, clv: 0.4, growth: 0.5 },
  { name: 'C · Overcon.',  blurb: 'sharp & wrong on the tails',                 logLoss: 0.610, brier: 0.176, clv: 1.2, growth: -0.6 },
  { name: 'D · Bold sharp',blurb: 'CLV-positive, accepts high variance',        logLoss: 0.585, brier: 0.184, clv: 2.4, growth: 3.8 },
];

const LOSS_METRICS = [
  { id: 'logLoss', label: 'log-loss',    short: 'NLL',  fmt: (v) => v.toFixed(3),       lower: true,  desc: 'Mean cross-entropy. Standard probabilistic classifier loss.' },
  { id: 'brier',   label: 'Brier',       short: 'BR',   fmt: (v) => v.toFixed(3),       lower: true,  desc: 'Mean squared error of probability vs 0/1 outcome.' },
  { id: 'clv',     label: 'CLV %',       short: 'CLV',  fmt: (v) => `${v.toFixed(1)}%`, lower: false, desc: 'Average % beat of the closing line. Sharp-book proxy for true edge.' },
  { id: 'growth',  label: 'log-growth %',short: 'g',    fmt: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, lower: false, desc: 'E[log bankroll growth] under fractional-Kelly deployment. The deploy-aligned loss.' },
];

const LossAlignmentCard = () => {
  const [active, setActive] = useState('logLoss');
  const m = LOSS_METRICS.find(x => x.id === active);
  const vals = LOSS_MODELS.map(mo => mo[active]);
  const bestIdx = m.lower ? vals.indexOf(Math.min(...vals)) : vals.indexOf(Math.max(...vals));
  const ranked = LOSS_MODELS
    .map((mo, i) => ({ ...mo, _i: i, _v: mo[active] }))
    .sort((a, b) => m.lower ? a._v - b._v : b._v - a._v);

  return (
    <Card id="loss" icon={Sigma} title="Loss alignment is the prime mover" accent="fuchsia" index={1} anchor
          subtitle="What you optimize is what you get. If your training loss isn’t aligned with what you’ll deploy, every downstream improvement is confused.">
      <MinSchema>
        Train on the loss you&apos;ll <em>deploy</em> against. For repeated proportional bets that loss is{' '}
        <Eq>{'\\mathbb{E}[\\log(1 + f \\cdot r)]'}</Eq> &mdash; not log-loss, not Brier, not ROI.
      </MinSchema>

      <p>
        Every loss ranks models a little differently. <Term>log-loss</Term> rewards calibration and
        punishes confident wrongness. <Term>Brier score</Term> is gentler on the tails. <Term>ROI</Term> is
        almost noise on any sample you&apos;ll ever see. <Term>CLV</Term> is the only signal that survives
        thousands of bets, and <Term>expected log-growth</Term> is the one your bankroll actually compounds.
        Picking the wrong loss to optimize sets you chasing a model that wins on a metric you don&apos;t care about.
      </p>

      <Predict question="Four models, scored on the same 100 Brasileirão fixtures. Will the leaderboard be the same under log-loss and under bankroll growth?">
        No — and the gap is the point. Model B has the best log-loss but the worst growth (it never commits enough
        to a bet to compound). Model D has the worst Brier but the best growth (sharp + bold). The metric you
        train against decides which model you ship.
      </Predict>

      {/* Metric tab row */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {LOSS_METRICS.map(mm => (
            <button key={mm.id} onClick={() => setActive(mm.id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                active === mm.id
                  ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100'
                  : 'border-white/10 text-neutral-400 hover:bg-white/5'
              }`}>
              {mm.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-neutral-500 mb-3 leading-snug">
          <span className="text-neutral-400">{m.label}:</span> {m.desc} <span className="text-neutral-600">·</span>{' '}
          {m.lower ? 'lower is better' : 'higher is better'}
        </div>
        {/* Leaderboard */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          {ranked.map((mo, rank) => {
            const isBest = mo._i === bestIdx;
            const barFrac = (() => {
              const vs = LOSS_MODELS.map(x => x[active]);
              const lo = Math.min(...vs), hi = Math.max(...vs);
              if (hi === lo) return 0.5;
              const norm = (mo._v - lo) / (hi - lo);
              return m.lower ? 1 - norm : norm;
            })();
            return (
              <div key={mo._i} className={`flex items-center gap-3 px-3 py-2 border-t border-white/5 first:border-t-0 ${isBest ? 'bg-fuchsia-500/5' : ''}`}>
                <span className="font-mono text-[10px] text-neutral-500 w-4">#{rank + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[12px] font-medium ${isBest ? 'text-fuchsia-200' : 'text-neutral-200'}`}>{mo.name}</span>
                    {isBest && <Star className="w-3 h-3 text-fuchsia-300 fill-fuchsia-300" />}
                  </div>
                  <div className="text-[10px] text-neutral-500 leading-snug">{mo.blurb}</div>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className={`h-full ${isBest ? 'bg-fuchsia-400/70' : 'bg-violet-400/40'}`} style={{ width: `${(barFrac * 100).toFixed(1)}%` }} />
                </div>
                <span className={`font-mono text-[12px] tabular-nums w-16 text-right ${isBest ? 'text-fuchsia-200' : 'text-neutral-300'}`}>
                  {m.fmt(mo._v)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[11px] text-neutral-500 leading-snug">
          Notice: <span className="text-neutral-300">B</span> wins on log-loss, <span className="text-neutral-300">C</span> wins on Brier,
          <span className="text-neutral-300"> D</span> wins on CLV <em>and</em> growth. If you ship the log-loss winner, you ship B and your bankroll barely moves.
        </div>
      </div>

      <WhenItMatters>
        Any time the loss you train against is a proxy for the thing you deploy. In a betting pipeline that&apos;s
        <em> always</em>: log-loss is a proxy for calibration, calibration is a proxy for Kelly growth, ROI is
        a noisy estimate of growth. Train as close to the deployment objective as you can.
      </WhenItMatters>

      <Misconception
        wrong="A better log-loss model is a better betting model."
        right="Only if you bet flat stakes. Under Kelly, log-growth = E[log(1 + f·r)], which a model can win without winning log-loss."
        because="Log-loss penalizes calibration uniformly across the probability range; Kelly growth weights the regions where you actually stake. A model that's perfectly calibrated in the 50% region but mis-calibrated in the 80%+ region can have great log-loss and terrible growth."
      />

      <Deeper>
        <p>
          <strong>Why expected log-growth is the right loss for repeated proportional bets.</strong>{' '}
          Kelly&apos;s 1956 result: if you bet a fraction <Eq>{'f'}</Eq> of bankroll repeatedly on a fair
          game with edge, the long-run growth rate of your bankroll is{' '}
          <Eq>{'g(f) = \\mathbb{E}[\\log(1 + f \\cdot r)]'}</Eq>. Maximizing <Eq>{'g'}</Eq> almost surely
          beats every other strategy in the limit. The model that maximizes per-fixture{' '}
          <Eq>{'\\mathbb{E}_y[\\log(1 + f^*(p_\\theta) \\cdot r(y))]'}</Eq> is the model whose
          <em> deployment</em> compounds fastest. Anything else &mdash; log-loss, Brier &mdash; is a surrogate.
        </p>
        <p>
          <strong>Custom CatBoost objective.</strong> CatBoost (and LightGBM) take a user-defined loss as
          a function returning gradient and hessian. You can implement a Kelly-aware loss directly: for
          each row, compute the implied Kelly fraction <Eq>{'f^*(p, b)'}</Eq>, then minimize{' '}
          <Eq>{'-\\log(1 + f^* \\cdot r(y))'}</Eq>. Two practical wrinkles: (i) the loss is non-convex
          in the raw logit and benefits from a Platt-style warm-start; (ii) it&apos;s extremely sensitive
          to mis-priced odds in training rows &mdash; embargo your training data away from suspicious lines.
        </p>
        <p>
          <strong>Calibration as a separate stage works, but loses information.</strong> The standard
          pipeline is: train on log-loss → fit isotonic / Platt on a holdout → deploy. This decouples
          probability quality from deployment objective, and is fine if your model is already close to
          calibrated. The deployment-aligned alternative trains end-to-end on a Kelly-shaped loss; the
          model learns to be sharp <em>where it matters for staking</em> and conservative elsewhere.
        </p>
        <p>
          <strong>Goodhart in one line.</strong>{' '}
          <em>&ldquo;When a measure becomes a target, it ceases to be a good measure.&rdquo;</em>{' '}
          The corollary for ML: when a surrogate loss becomes the optimization target, the gap between
          surrogate and deployed objective is exactly your loss in expected value. Quantify the gap before
          you ship. <CrossLink to="info" recap="Information hypothesis: edge = KL(model ‖ market). Coming next.">info hypothesis</CrossLink> closes the loop &mdash; KL divergence is the loss whose minimization implies all proper scoring rules.
        </p>
      </Deeper>

      <QA items={[
        { q: 'I only have point-prediction outputs (not probabilities). Does this matter?',
          a: 'Yes — you need calibrated probabilities to size Kelly bets. A point prediction is a degenerate distribution; it implies you’d bet 100% (full Kelly) on every favored side, which is ruinous on any uncertainty.' },
        { q: 'Can I just train on log-loss and apply a Kelly head at deploy time?',
          a: 'Yes, and most pipelines do. The loss you avoid is the model under-investing capacity in the regions of probability space where Kelly bets concentrate (typically the 60–80% range). End-to-end Kelly losses can be ~5–10% better in expected log-growth on the same data.' },
        { q: 'What about ROI as a loss?',
          a: 'ROI is a Monte Carlo estimate of growth with so much variance that it ranks models near-randomly on samples under ~5,000 bets. Use CLV as a low-variance proxy until you have a multi-season sample.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — INFORMATION HYPOTHESIS (spine)
   Edge = KL(your forecast ‖ market). The ONLY way to beat the market is to
   add information the market doesn't already price in. Reframes every later
   card as "what info channel are you adding?"
   ========================================================================== */

const InformationHypothesisCard = () => {
  // Brasileirão-style 1X2 market vs model. User can drag model probabilities.
  const market = [0.45, 0.27, 0.28];
  const [pH, setPH] = useState(0.52);
  const [pD, setPD] = useState(0.26);
  const pA = Math.max(0.01, 1 - pH - pD);
  const model = [pH, pD, pA];

  // KL(model || market) in bits
  const kl = model.reduce((s, p, i) => s + (p > 0 ? p * Math.log2(p / market[i]) : 0), 0);
  // Expected log-growth at fractional Kelly 0.25 across 3 outcomes
  // For each outcome i, fair odds b_i = 1/market[i] - 1; if you bet on i with prob p_i, edge
  // e = b_i * p_i - (1 - p_i); Kelly f = max(0, e / b_i). Expected log-growth per market = sum_i p_i * log(1 + f * b_i if won, else log(1 - f))
  const labels = ['Home', 'Draw', 'Away'];
  const edgeBits = kl; // KL is in bits — gives an upper bound on expected log-edge per bet under Kelly
  const expGrowthPct = (() => {
    // Per-outcome Kelly on each leg, then average expected log return per market
    let g = 0;
    for (let i = 0; i < 3; i++) {
      const b = 1 / market[i] - 1;
      const e = b * model[i] - (1 - model[i]);
      const f = Math.max(0, Math.min(0.25, e / b)); // 1/4 Kelly cap
      if (f === 0) continue;
      const win = model[i] * Math.log(1 + f * b);
      const lose = (1 - model[i]) * Math.log(1 - f);
      g += win + lose;
    }
    return g * 100; // approx per-market %
  })();

  const W = 320, H = 110, P = 18;
  const barW = (W - P * 2) / 3;

  return (
    <Card id="info" icon={Telescope} title="The information hypothesis" accent="fuchsia" index={2} anchor
          subtitle="Your model only beats the market by encoding information the market doesn’t already price in. Every later card is a play on this principle.">
      <MinSchema>
        Edge per bet, in nats, is exactly{' '}
        <Eq>{'D_{\\mathrm{KL}}(p_{\\mathrm{model}} \\,\\|\\, p_{\\mathrm{market}})'}</Eq>.
        If your forecast equals the market&apos;s, your KL is zero and so is your edge. Period.
      </MinSchema>

      <p>
        <Term>Pinnacle</Term>&apos;s closing odds are the consensus of every sharp dollar that wagered into
        the market &mdash; in efficient-market terms, they are nearly Bayes-optimal. Your CatBoost,
        no matter how clever, has to encode <em>some</em> information the closing line missed to be worth
        deploying. The Information Hypothesis says the same thing every later card will say, in different
        words: feature engineering, causal lens, SSL pretraining, transfer across leagues, even RL portfolio
        selection &mdash; each is a bet on a specific channel of {' '}
        <span className="text-fuchsia-300">market-orthogonal information</span>.
      </p>

      <Predict question="Brasileirão home favourite. Market says 45/27/28 across (Home/Draw/Away). Your model says 52/26/22. How big is your edge per bet, in expected log-growth?">
        At quarter-Kelly: ~{expGrowthPct.toFixed(2)}% per market. Sounds tiny &mdash; but compounded over a
        season&apos;s ~380 fixtures with ~3 markets each, that&apos;s a real bankroll. The KL number ({kl.toFixed(3)} bits)
        is the upper bound on what a perfectly-aware Kelly bettor would extract.
      </Predict>

      {/* Interactive: sliders + bar chart of model vs market + KL gauge */}
      <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-200 font-mono">P(Home)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(pH * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.05" max="0.85" step="0.01" value={pH}
              onChange={(e) => { const v = parseFloat(e.target.value); setPH(v); if (v + pD > 0.99) setPD(Math.max(0.01, 0.99 - v)); }}
              className="fc-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-200 font-mono">P(Draw)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(pD * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.05" max="0.55" step="0.01" value={pD}
              onChange={(e) => { const v = parseFloat(e.target.value); setPD(v); if (pH + v > 0.99) setPH(Math.max(0.01, 0.99 - v)); }}
              className="fc-range w-full" />
          </div>
          <div className="text-[11px] text-neutral-500">
            <span className="text-neutral-400 font-mono">P(Away)</span> = {(pA * 100).toFixed(0)}% (auto-balanced)
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat label="KL · bits" value={kl.toFixed(3)} sub="info advantage upper bound" color="text-fuchsia-200" />
            <Stat label="¼Kelly E[log-g]" value={`${expGrowthPct >= 0 ? '+' : ''}${expGrowthPct.toFixed(2)}%`}
              sub="per market, deployed" color={expGrowthPct >= 0 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full h-auto">
          <defs>
            <linearGradient id="ih-mkt" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#a3a3a3" stopOpacity="0.55" />
              <stop offset="1" stopColor="#a3a3a3" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="ih-mod" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f0abfc" stopOpacity="0.85" />
              <stop offset="1" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {labels.map((lab, i) => {
            const x = P + i * barW + barW * 0.15;
            const w = barW * 0.32;
            const mkH = market[i] * H;
            const moH = model[i] * H;
            const baseY = H;
            return (
              <g key={lab}>
                {/* market bar */}
                <rect x={x} y={baseY - mkH} width={w} height={mkH} fill="url(#ih-mkt)" rx="2" />
                {/* model bar */}
                <rect x={x + w + 2} y={baseY - moH} width={w} height={moH} fill="url(#ih-mod)" rx="2" />
                <text x={x + w + 1} y={baseY + 12} fontSize="9" textAnchor="middle" fill="#a3a3a3">{lab}</text>
                <text x={x + w / 2} y={baseY - mkH - 3} fontSize="8" textAnchor="middle" fill="#737373">{(market[i] * 100).toFixed(0)}</text>
                <text x={x + w * 1.5 + 2} y={baseY - moH - 3} fontSize="8" textAnchor="middle" fill="#f0abfc">{(model[i] * 100).toFixed(0)}</text>
              </g>
            );
          })}
          {/* legend */}
          <g transform={`translate(${P}, ${H + 22})`}>
            <rect x="0" y="-7" width="8" height="8" fill="#a3a3a3" opacity="0.5" rx="1" />
            <text x="11" y="0" fontSize="9" fill="#a3a3a3">market (vig-stripped)</text>
            <rect x="118" y="-7" width="8" height="8" fill="#f0abfc" opacity="0.7" rx="1" />
            <text x="129" y="0" fontSize="9" fill="#f0abfc">your model</text>
          </g>
        </svg>
      </div>

      <WhenItMatters>
        Any time you&apos;re tempted to say &ldquo;my model is X% accurate&rdquo;. Accuracy alone says nothing
        about edge &mdash; the market is X+1%. The right framing is always relative: <em>where</em> does
        your forecast diverge from market consensus, and is that divergence backed by information the
        market lacks?
      </WhenItMatters>

      <Misconception
        wrong="My CatBoost gets 53% accuracy on 1X2 — that’s an edge!"
        right="The bookmaker’s closing line gets ~54% on 1X2. Your model has to BEAT closing-line probability, not raw outcome frequency, to be worth deploying."
        because="Outcome accuracy isn't the right benchmark. The benchmark is the market’s own (vig-stripped) probability. CLV (closing line value) is the operational measurement of how often your bet beats the market."
      />

      <Deeper>
        <p>
          <strong>Why KL is the natural unit of edge.</strong> Suppose you bet small fractions across many
          fixtures with model <Eq>{'p_\\theta'}</Eq> and the true (market) distribution is{' '}
          <Eq>{'q'}</Eq>. The expected log-likelihood ratio per bet is{' '}
          <Eq>{'\\mathbb{E}_q[\\log p_\\theta - \\log q] = -D_{\\mathrm{KL}}(q \\,\\|\\, p_\\theta)'}</Eq>.
          The information you encode <em>over</em> the market is the reverse KL{' '}
          <Eq>{'D_{\\mathrm{KL}}(p_\\theta \\,\\|\\, q)'}</Eq>; under fractional Kelly, this maps directly
          to expected log-growth (Cover &amp; Thomas, ch. 6: gambling and information).
        </p>
        <p>
          <strong>Closing line as efficient prior.</strong> Pinnacle takes sharp action and adjusts the
          line until marginal sharp money is indifferent. That&apos;s the operational definition of an
          informationally-efficient market. Empirical studies (Kuypers 2000; Levitt 2004; recent academic
          replication on Pinnacle data) consistently find: closing odds beat opening odds by ~50&ndash;200
          basis points on log-loss; beating closing odds is necessary <em>and</em> sufficient for
          long-run profit.
        </p>
        <p>
          <strong>Reframe: predict the residual, not the outcome.</strong> The deepest application of the
          information hypothesis: instead of training your CatBoost to predict the match outcome, train it
          to predict the <em>residual</em> from the closing-line probability. The market does most of the
          work; your model only needs to capture what the market missed. Empirically: noticeably lower
          log-loss in the same compute budget, and the resulting forecasts are by construction
          orthogonal to market consensus.
        </p>
        <p>
          <strong>The 7 channels that show up in this explainer.</strong> Each later card is one channel
          of market-orthogonal info: <CrossLink to="features" recap="Engineered features the market under-weights — squad availability, fixture congestion, xG decomposition.">features</CrossLink>{' '}
          (better representation), <CrossLink to="causal" recap="DAG-aware feature design; conditioning on the right confounders; instrument variables.">causal lens</CrossLink>{' '}
          (better causal identification), <CrossLink to="ssl" recap="Self-supervised pretraining on event streams to learn richer representations than handcrafted features.">SSL</CrossLink>,{' '}
          <CrossLink to="transfer" recap="Pre-train on data-rich leagues, fine-tune on Brasileirão.">transfer</CrossLink>,{' '}
          <CrossLink to="distributional" recap="Predict the full goal distribution, derive any market — info per parameter.">distributional</CrossLink>,{' '}
          <CrossLink to="inplay" recap="Live game state; per-minute updates the pre-match line can’t price in.">in-play state</CrossLink>, and{' '}
          <CrossLink to="ensembling" recap="Diverse base learners surface uncorrelated info channels.">ensembling</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'If KL = 0.005 bits, is that real edge?',
          a: '0.005 bits per market ≈ 0.0035 nats. At 1/4 Kelly across ~3 markets per fixture, that’s roughly 0.5–1% expected log-growth per fixture — modest but compounding to ~50–100% per season on hundreds of fixtures. Real, but you need many bets to detect it through variance.' },
        { q: 'Can KL ever be negative?',
          a: 'No. KL ≥ 0 by Jensen’s inequality, with equality iff the distributions are identical. But your *expected* log-growth can be negative if your KL is built on the wrong direction — i.e. if the market is closer to the truth than you are.' },
        { q: 'Why use the market as the reference, not the true outcome?',
          a: 'You don’t know the true outcome distribution — only the realized outcome. The market’s vig-stripped distribution is the best operational proxy for truth, and beating it is the operational definition of having edge. CLV measures this directly.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — FEATURE ENGINEERING AT DEPTH
   Beyond rolling stats. Market odds as a feature, latent strength encodings,
   xG-based vs goal-based, hierarchical aggregation, time-decay, target
   encoding with embargo, schedule/rest, lineup embeddings.
   ========================================================================== */

const FEATURE_FAMILIES = [
  { id: 'market', name: 'Market features', accent: 'fuchsia',
    info: 0.92, examples: ['closing line implied probs', 'opening-line move', 'spread vs mainline', 'vig'],
    why: 'The market is doing most of the work — encoding it as a feature pulls in ~all of its info; your model only has to learn the residual.' },
  { id: 'xg', name: 'xG-based features', accent: 'emerald',
    info: 0.78, examples: ['rolling xG for/against', 'xG over/under-performance', 'shot quality', 'big chances created'],
    why: 'xG has 3-5× higher SNR than raw goals. A team that under-shoots its xG over a window will revert; rolling xG is the leading indicator goals lag.' },
  { id: 'latent', name: 'Latent strength', accent: 'violet',
    info: 0.71, examples: ['Elo / Glicko rating', 'team-vs-team Bayesian strength', 'home/away splits'],
    why: 'A single learned scalar that summarizes the entire match history. Cheap, dense, and updates online; an Elo-as-feature beats most hand-crafted form features.' },
  { id: 'lineup', name: 'Lineup / squad', accent: 'sky',
    info: 0.62, examples: ['key-player availability', 'manager (entity-encoded)', 'minutes-weighted xG of starting XI'],
    why: 'Match-level signal the closing line often only partially prices, especially late team-news. Where most non-market alpha lives.' },
  { id: 'sched', name: 'Schedule & rest', accent: 'amber',
    info: 0.45, examples: ['days since last match', 'midweek European fixture', 'travel distance', 'fixture density (3-in-7)'],
    why: 'Real causal effect on performance (esp. away & midweek). Often under-priced because it requires aligning to the cup-and-continental calendar.' },
  { id: 'context', name: 'Match context', accent: 'orange',
    info: 0.38, examples: ['derby / rivalry flag', 'relegation / title pressure', 'temperature & altitude', 'referee tendencies'],
    why: 'Long-tail features each contribute a few bp; together they’re measurable. Ref priors matter for cards/penalties markets specifically.' },
  { id: 'rolling', name: 'Rolling stats (basic)', accent: 'cyan',
    info: 0.30, examples: ['last-5 PPG', 'last-10 goals/game', 'home/away form'],
    why: 'The default starting point — but most of the alpha here is already in market odds and Elo. Treat as scaffolding, not the load-bearing feature family.' },
  { id: 'tgt', name: 'Target encodings', accent: 'rose',
    info: 0.55, examples: ['team avg goals (OOF)', 'home/away mean conceded', 'manager-era target encoding'],
    why: 'High signal, high leakage risk. MUST be computed strictly from past data only, with embargo gap & per-fold re-fit.' },
];

const FeatureEngineeringCard = () => {
  const [open, setOpen] = useState('market');
  const sel = FEATURE_FAMILIES.find(f => f.id === open);
  return (
    <Card id="features" icon={BrainCircuit} title="Feature engineering at depth" accent="sky" index={3}
          subtitle="The highest-leverage lever you control. Every feature is a hypothesis about a channel of market-orthogonal information.">
      <MinSchema>
        Features are <em>information channels</em>. Rank them by the channel&apos;s expected
        market-orthogonal information, not by handcraft pride.
      </MinSchema>

      <p>
        Most football modeling pipelines die in the rolling-stats valley: 30 hand-crafted features built
        from last-N matches that re-discover what Elo already encodes and what the market already prices.
        The leverage points sit elsewhere &mdash; at the head of the value distribution are{' '}
        <Term>market features</Term> (closing odds &amp; line moves), <Term>xG</Term>-based features that
        de-noise raw goals, and <Term>latent strength</Term> encodings that summarize the past in a single
        scalar. Each row in the table below is a family with its rough relative information yield in a
        Brasileirão-style 1X2 model. Click to expand.
      </p>

      <Predict question="Of the 8 feature families below, which contributes the most marginal log-loss reduction in a typical CatBoost 1X2 model?">
        <strong>Market features</strong>, by a wide margin. Adding closing-line implied probabilities as a
        feature typically halves the gap between a feature-rich CatBoost and the market itself. Everything
        else fights for residual slices on top of that. (See López de Prado &amp; Bailey 2014 for the
        analogous result in finance.)
      </Predict>

      <div className="mt-4 space-y-1.5">
        {FEATURE_FAMILIES.map(f => {
          const isOpen = f.id === open;
          const palette = chipPalette[f.accent].split(' ');
          return (
            <div key={f.id} className={`rounded-lg border ${isOpen ? 'border-white/20 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02]'} overflow-hidden transition-colors`}>
              <button onClick={() => setOpen(isOpen ? null : f.id)} className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-white/[0.03]">
                <span className={`shrink-0 inline-flex items-center justify-center text-[10px] font-mono uppercase tracking-wider border px-1.5 py-0.5 rounded ${chipPalette[f.accent]}`}>
                  {f.name.split(' ')[0]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-[12px] text-neutral-200">{f.name}</span>
                </span>
                <span className="hidden sm:flex items-center gap-2 w-44 shrink-0">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-fuchsia-400/60" style={{ width: `${(f.info * 100).toFixed(1)}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 tabular-nums w-9 text-right">{(f.info * 100).toFixed(0)}%</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                    className="border-t border-white/10">
                    <div className="px-3 py-3 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {f.examples.map(ex => (
                          <span key={ex} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-neutral-300">{ex}</span>
                        ))}
                      </div>
                      <p className="text-[12px] text-neutral-300 leading-snug">{f.why}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <div className="text-[10px] text-neutral-500 mt-2 leading-snug">
          Bars are illustrative <em>relative</em> info yield, not literal log-loss reductions &mdash; the
          ratios match what you see in published Pinnacle/Kaggle football comps and in the user&apos;s own
          <span className="text-fuchsia-300"> betting-vibe-04</span> CV runs.
        </div>
      </div>

      <Worked title="Worked example · target encoding without leakage">
        <p>
          You want a feature like <code className="text-fuchsia-300">home_team_goals_per_match</code>.
          Naive: take a season average. <em>Leaks.</em> Fold-aware: for fold k with validation rows in
          window <Eq>{'[t_k, t_k + h]'}</Eq>, compute the average using only matches strictly before{' '}
          <Eq>{'t_k - g'}</Eq>, where <Eq>{'g'}</Eq> is an embargo gap (typically a week, longer for
          season-boundary).
        </p>
        <p>
          For per-row encoding inside a single training fold, use ordered target encoding (CatBoost&apos;s
          built-in): for row at time <Eq>{'t'}</Eq>, use only rows <em>before</em> <Eq>{'t'}</Eq>. This
          gives unbiased estimates for early rows (high variance, but <em>fair</em>) and stable estimates
          for late rows. Combined with walk-forward CV, it removes the dominant leakage path.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; features are the most direct lever you have. Architecture and HPO move log-loss by
        a few percent; the right new feature family can move it by an order of magnitude (the first time
        you add <Term>market features</Term> to a model that didn&apos;t have them, the gap closes by
        ~50%).
      </WhenItMatters>

      <Misconception
        wrong="More features = better model. CatBoost handles irrelevant features fine."
        right="More features mostly multiply your multiple-testing burden and HPO surface; the marginal info per feature drops fast after the first dozen."
        because="Feature families correlate (xG, last-5 form, Elo all measure similar things). The 50th rolling-stat feature gives you almost nothing in marginal log-loss but doubles the effective hyperparam search space and increases the risk that CV picks a configuration overfit to a noise dimension."
      />

      <Deeper>
        <p>
          <strong>Time-decay weights are shrinkage in disguise.</strong> Weighting older matches with{' '}
          <Eq>{'w_t = e^{-\\lambda(T - t)}'}</Eq> is equivalent to a Bayesian shrinkage of the rolling
          estimator toward a long-run mean. Pick <Eq>{'\\lambda'}</Eq> by CV, but expect <em>two</em>
          time-scales to matter: a short one (~5&ndash;10 matches) for current form, a long one
          (~80&ndash;120 matches) for latent team strength.
        </p>
        <p>
          <strong>Hierarchical aggregation is free regularization.</strong> Build features at three levels:
          team-match (granular, high-variance), team-season (smoothed), league-season (the prior). When the
          team-match estimate is unreliable (small sample), the model can lean on the league-season prior;
          when it&apos;s reliable, the team-match estimate dominates. Easy to do manually with three
          features; cleaner via a hierarchical Bayesian feature.
        </p>
        <p>
          <strong>Lineup embeddings are the next plateau.</strong> Most public Brasileirão models stop at
          aggregate team features. The marginal alpha is in match-time team availability: minutes-weighted
          xG of the starting XI, manager-era effect (entity-coded), key-player flag (top-3 contributors).
          Tricky operationally because lineups release ~1 hour pre-kickoff &mdash; align your feature
          pipeline to that snapshot.
        </p>
        <p>
          <strong>Interactions are mostly learned, but a few should be hand-crafted.</strong> CatBoost
          will learn most pair interactions on its own. Manually-engineered interactions pay off when the
          interaction is highly non-linear or out-of-distribution: <code>home_strength × travel_distance</code>,{' '}
          <code>style_clash = (home_pace − away_pace)²</code>. Three hand-crafted interactions is usually
          plenty; don&apos;t hand-craft thirty.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I include closing odds as a feature even though they’re leaky for past games?',
          a: 'Closing odds are *not* leaky — they’re known strictly before kickoff. Use the closing line implied probabilities as features and the model immediately gets ~all the info the market has, freeing it to learn only the residual.' },
        { q: 'How do I avoid double-counting between Elo and form features?',
          a: 'They overlap heavily, by construction. Run feature-importance with both, drop the form features whose marginal SHAP is < 1% — typically half of them. Keep the most-orthogonal form feature (often "home/away split last 10").' },
        { q: 'When does xG fail?',
          a: 'Sample sizes under ~10 matches are noisy. Penalty-heavy matches distort. xG is post-shot quality; tactics that produce no shots (ultra-conservative away days) are invisible. Use xG as the *primary* historical performance signal but combine with raw goals to catch these edge cases.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — THE CAUSAL LENS
   DAG thinking. Confounders (manager change, injuries). Why "predict the
   residual from market" is the deepest causal reframe.
   ========================================================================== */

const CausalLensCard = () => {
  // Toggleable confounder demonstration: condition on manager change → form&result correlation looks weird
  const [conf, setConf] = useState({ manager: true, injury: true, sched: true });
  const fakeCorr = (() => {
    // Simple toy: each "observed correlation" is the true causal coefficient + sum of unaddressed confounder biases
    const trueBeta = 0.42;
    let bias = 0;
    if (!conf.manager) bias += 0.18;   // manager change confounds form & outcome
    if (!conf.injury)  bias += 0.11;   // injuries confound form & outcome
    if (!conf.sched)   bias += 0.06;   // congestion confounds form & outcome
    return { observed: trueBeta + bias, trueBeta, bias };
  })();

  return (
    <Card id="causal" icon={GitBranch} title="The causal lens on features" accent="emerald" index={4}
          subtitle="The same correlations can mean very different things depending on which confounders you condition on. Causal hygiene is what stops your model from learning ghosts.">
      <MinSchema>
        Treat features as nodes in a <Term>DAG</Term>. <Term>Confounders</Term> create spurious correlation
        between &ldquo;form&rdquo; and &ldquo;outcome&rdquo;; conditioning on them recovers the causal effect.
        <em>Predict the residual from the market</em> is the deepest causal reframe of the whole pipeline.
      </MinSchema>

      <p>
        Two teams have similar recent form, but Team A&apos;s form was achieved with a top-tier manager who
        was sacked yesterday, while Team B&apos;s form survived a midseason coaching change. Their
        &ldquo;form&rdquo; features look identical; their causal expected next-match performance is not.
        A correlation-only model treats these as the same input. A DAG-aware model encodes manager identity
        (or manager-era) as a feature so the comparison is conditional on it.
      </p>

      <Predict question="Sketch the DAG. Three confounders (manager change, key-player injury, schedule congestion) all influence both ‘recent form’ and ‘next match outcome’. Which has the largest spurious lift in observed correlation?">
        Manager change &mdash; large discrete shift in tactical setup, transparent to teams, opaque to
        rolling-stats features. Toggle confounders below; each one you fail to condition on adds to the
        bias.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {/* Confounder toggles */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">condition on:</div>
          <div className="space-y-1.5">
            {[
              { id: 'manager', label: 'Manager identity / era', bias: 0.18, why: 'Discrete shift in tactical setup, ~12 sackings/season in Brasileirão. Strongest confounder of recent form.' },
              { id: 'injury',  label: 'Key-player availability',     bias: 0.11, why: 'Top-3 contributors out → form drops without being a true team-strength change. Lineup features handle this.' },
              { id: 'sched',   label: 'Fixture congestion / travel', bias: 0.06, why: 'Three matches in seven days suppresses form unrelated to underlying ability.' },
            ].map(c => (
              <label key={c.id} className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${conf[c.id] ? 'border-emerald-400/35 bg-emerald-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <input type="checkbox" checked={conf[c.id]} onChange={(e) => setConf(s => ({ ...s, [c.id]: e.target.checked }))}
                  className="mt-[3px] accent-emerald-400" />
                <span className="text-[11px] flex-1">
                  <span className={conf[c.id] ? 'text-emerald-200' : 'text-neutral-300'}>{c.label}</span>
                  <span className="text-[10px] text-neutral-500 block leading-snug">{c.why}</span>
                </span>
                <span className={`font-mono text-[10px] ${conf[c.id] ? 'text-neutral-500 line-through' : 'text-rose-300'}`}>+{c.bias.toFixed(2)}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="true β" value={fakeCorr.trueBeta.toFixed(2)} sub="form → outcome" color="text-emerald-300" />
            <Stat label="bias" value={`+${fakeCorr.bias.toFixed(2)}`} sub="from open back-doors" color={fakeCorr.bias > 0.1 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="observed β" value={fakeCorr.observed.toFixed(2)} sub="what your model fits" color="text-neutral-100" />
          </div>
        </div>

        {/* Mini DAG */}
        <svg viewBox="0 0 280 200" className="w-full h-auto">
          <defs>
            <marker id="cl-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#a3a3a3" />
            </marker>
          </defs>
          {/* nodes */}
          {[
            { id: 'mgr',  x: 40,  y: 30,  label: 'manager',     active: !conf.manager, color: '#fb7185' },
            { id: 'inj',  x: 140, y: 30,  label: 'injury',      active: !conf.injury,  color: '#fb7185' },
            { id: 'sch',  x: 240, y: 30,  label: 'congestion',  active: !conf.sched,   color: '#fb7185' },
            { id: 'form', x: 80,  y: 130, label: 'form',        active: false,         color: '#7dd3fc' },
            { id: 'out',  x: 220, y: 130, label: 'outcome',     active: false,         color: '#6ee7b7' },
          ].map(n => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="20" fill={n.active ? `${n.color}30` : 'rgba(23,23,23,0.5)'} stroke={n.color} strokeWidth={n.active ? 2 : 1} strokeOpacity={n.active ? 0.9 : 0.45} />
              <text x={n.x} y={n.y + 3} fontSize="9" textAnchor="middle" fill={n.active ? n.color : '#a3a3a3'} fontWeight={n.active ? 600 : 400}>{n.label}</text>
            </g>
          ))}
          {/* edges */}
          {/* mgr → form, mgr → outcome */}
          <line x1="46" y1="48" x2="74" y2="112" stroke={!conf.manager ? '#fb7185' : '#525252'} strokeWidth={!conf.manager ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          <line x1="55" y1="42" x2="210" y2="120" stroke={!conf.manager ? '#fb7185' : '#525252'} strokeWidth={!conf.manager ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          {/* inj → form, inj → outcome */}
          <line x1="135" y1="48" x2="92" y2="112" stroke={!conf.injury ? '#fb7185' : '#525252'} strokeWidth={!conf.injury ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          <line x1="150" y1="48" x2="210" y2="115" stroke={!conf.injury ? '#fb7185' : '#525252'} strokeWidth={!conf.injury ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          {/* sch → form, sch → outcome */}
          <line x1="232" y1="48" x2="100" y2="115" stroke={!conf.sched ? '#fb7185' : '#525252'} strokeWidth={!conf.sched ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          <line x1="240" y1="50" x2="225" y2="112" stroke={!conf.sched ? '#fb7185' : '#525252'} strokeWidth={!conf.sched ? 1.6 : 0.8} markerEnd="url(#cl-arrow)" />
          {/* form → outcome (the causal effect we want) */}
          <line x1="100" y1="130" x2="200" y2="130" stroke="#6ee7b7" strokeWidth="2.2" markerEnd="url(#cl-arrow)" />
          <text x="150" y="124" fontSize="8" textAnchor="middle" fill="#6ee7b7">causal β = {fakeCorr.trueBeta.toFixed(2)}</text>
        </svg>
      </div>

      <WhenItMatters>
        Whenever a feature is downstream of (or correlated with) something the data-generating process
        intervened on. Most football-modeling failures come from <em>not noticing</em> a confounder
        (manager change, COVID empty stadiums, mid-season scheduling shifts). DAG hygiene catches these
        at the design stage instead of the post-mortem.
      </WhenItMatters>

      <Misconception
        wrong="With enough features, the model figures out causation on its own."
        right="Tree-based models discover associations, not interventions. They’ll happily learn that ‘red socks → wins’ if a confounder makes them correlate."
        because="Causal identification requires either a structural assumption (the DAG), randomization, or an instrument. None of those are recoverable from raw correlations alone. CatBoost will find correlations and let SHAP convince you they’re causal."
      />

      <Deeper>
        <p>
          <strong>The deepest causal reframe: predict the residual from the market.</strong>{' '}
          Suppose closing odds are calibrated and reflect &ldquo;what the market knows&rdquo;. Then
          training your model to predict <Eq>{'y - p_{\\mathrm{market}}'}</Eq> is, structurally, a model
          of <em>information you have that the market doesn&apos;t</em>. By construction this output is
          orthogonal to market consensus &mdash; you can&apos;t accidentally re-learn what the market
          already prices. It&apos;s the cleanest implementation of <CrossLink to="info" recap="Edge = KL(model‖market). The information hypothesis lives in card 02.">the information hypothesis</CrossLink> at the loss level.
        </p>
        <p>
          <strong>Collider bias is the trap to avoid.</strong> If you condition on a variable that is{' '}
          <em>caused by</em> both your predictor and your outcome, you induce a non-causal correlation.
          Example: filtering training data to &ldquo;matches with at least 1 goal scored&rdquo; conditions
          on a collider (low pre-match xG ∧ won match → at least 1 goal scored). Suddenly low pre-match
          xG correlates with winning, in your filtered training set. Wreckage.
        </p>
        <p>
          <strong>Instrumental variables in football.</strong> Hard to find clean IVs in match data, but
          a few candidates: weather (affects play style → outcome, not via team strength); referee draw
          (assigned semi-randomly, affects card &amp; penalty markets); fixture order (often calendar-driven,
          affects rest → outcome). Use IVs to estimate causal coefficients on contentious features (manager
          impact in particular).
        </p>
        <p>
          <strong>Bayesian network feature selection.</strong> Tools like the PC algorithm or NOTEARS
          discover plausible DAGs from observational data. They&apos;re noisy on small samples but
          surprisingly useful as a sanity check &mdash; if your &ldquo;form features&rdquo; cluster as a
          mediator chain (manager → form → outcome), the DAG tells you to either condition on manager or
          drop it from the model entirely.
        </p>
      </Deeper>

      <QA items={[
        { q: 'My SHAP says feature X is highly predictive. Doesn’t that mean it’s causally important?',
          a: 'No. SHAP measures contribution to the model’s predictions, given the other features. A confounded feature can have huge SHAP and zero causal effect. SHAP is a model-fidelity tool; it does not certify causation.' },
        { q: 'Should I just include all candidate confounders as features?',
          a: 'Mostly yes, but watch for colliders and over-conditioning (which can introduce variance and break extrapolation). Include manager identity, lineup, congestion. Don’t include post-match variables.' },
        { q: 'What if the confounder is unobserved (e.g. internal team morale)?',
          a: 'Use a proxy (recent form residual, post-loss rebound rate) or accept the bias and quantify it. Sensitivity analysis (Rosenbaum bounds) tells you how strong an unobserved confounder would have to be to nullify your estimated effect.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — SELF-SUPERVISED PRETRAINING ON FOOTBALL EVENTS
   Pretext tasks (masked next-event, contrastive matches) on the abundant
   event-stream data, then fine-tune on the scarce labeled-market data.
   The football equivalent of pretraining a language model.
   ========================================================================== */

const EVENT_TOKENS = [
  { t: '12:04', tok: 'pass', team: 'H', color: '#7dd3fc', mask: false },
  { t: '12:09', tok: 'pass', team: 'H', color: '#7dd3fc', mask: false },
  { t: '12:13', tok: 'cross', team: 'H', color: '#7dd3fc', mask: false },
  { t: '12:14', tok: '[?]',  team: '?', color: '#737373', mask: true,  truth: 'shot', preds: { shot: 0.62, header: 0.21, save: 0.10, foul: 0.04, throw: 0.03 } },
  { t: '12:15', tok: 'save', team: 'A', color: '#fb7185', mask: false },
  { t: '12:18', tok: 'goal-kick', team: 'A', color: '#fb7185', mask: false },
  { t: '12:24', tok: 'tackle', team: 'A', color: '#fb7185', mask: false },
  { t: '12:25', tok: '[?]',  team: '?', color: '#737373', mask: true,  truth: 'pass', preds: { pass: 0.74, dribble: 0.12, foul: 0.07, shot: 0.04, cross: 0.03 } },
  { t: '12:31', tok: 'corner',  team: 'A', color: '#fb7185', mask: false },
];

const SSLPretrainCard = () => {
  const [openMask, setOpenMask] = useState(null);
  const masked = EVENT_TOKENS.find(e => e.mask && openMask === EVENT_TOKENS.indexOf(e));

  return (
    <Card id="ssl" icon={Layers} title="Self-supervised pretraining on football events" accent="violet" index={5}
          subtitle="The same pretrain–fine-tune recipe that built BERT and Whisper, applied to event streams. Lets a model learn football-specific representations from data that costs nothing to obtain.">
      <MinSchema>
        Pretrain on what&apos;s abundant: <em>event sequences</em> (millions per season, no labels needed).
        Fine-tune on what you care about: <em>market outcomes</em> (a few thousand per league per season).
        The pretrained representation does the heavy lifting.
      </MinSchema>

      <p>
        A typical Brasileirão season produces ~380 matches, each with ~1,500 logged events &mdash; passes,
        tackles, shots, fouls, throw-ins. That&apos;s 570k tokens of structured event data per season,
        completely unlabeled (no need for outcome supervision). Training a transformer on a{' '}
        <Term>masked modeling</Term> task &mdash; given a left context of events, predict the next event
        type and timing &mdash; produces an embedding for each match-state that captures tactical
        rhythm, possession structure, and pressure patterns far richer than any handcrafted feature.
        Fine-tune the same backbone on labeled 1X2 / xG / over-under targets and you transfer all that
        learned structure for free.
      </p>

      <Predict question="Click any [?] in the event stream below. What does the pretrained model predict — and how confident?">
        Like a language model: very confident on routine continuations (after a tackle by A, the next
        event is usually a pass by A); much less confident on rare-but-decisive ones (after a cross by H,
        the next event could be shot, header, or interception). The entropy of the per-token prediction is
        itself a feature: high-entropy match-states are the chaotic ones where surprise (and goals) happen.
      </Predict>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">event stream · click [?] to see pretrained predictions</div>
        <div className="flex flex-wrap gap-1">
          {EVENT_TOKENS.map((e, i) => (
            <button key={i} onClick={() => e.mask && setOpenMask(openMask === i ? null : i)}
              disabled={!e.mask}
              className={`text-[11px] font-mono px-2 py-1 rounded border ${e.mask ? 'border-violet-400/40 bg-violet-400/10 text-violet-200 cursor-pointer hover:bg-violet-400/20' : 'border-white/10 bg-white/[0.02] text-neutral-300'}`}>
              <span className="text-[9px] text-neutral-500 mr-1">{e.t}</span>
              <span style={{ color: e.color }}>{e.team}</span>
              <span className="mx-1">·</span>
              {e.tok}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {masked && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-1.5">model predictions for the masked token</div>
                <div className="space-y-1">
                  {Object.entries(masked.preds).map(([tok, p]) => (
                    <div key={tok} className="flex items-center gap-2">
                      <span className={`font-mono text-[11px] w-16 ${tok === masked.truth ? 'text-emerald-300' : 'text-neutral-300'}`}>{tok}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className={`h-full ${tok === masked.truth ? 'bg-emerald-400/70' : 'bg-violet-400/40'}`} style={{ width: `${(p * 100).toFixed(1)}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400 tabular-nums w-10 text-right">{(p * 100).toFixed(0)}%</span>
                      {tok === masked.truth && <span className="text-[9px] text-emerald-300 font-mono uppercase tracking-wider">truth</span>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Worked title="Worked example · using the pretrained backbone for 1X2">
        <p>
          (1) <strong>Pretrain.</strong> Train a small transformer (~10M params, 6 layers, 256-d) on 4
          seasons × 5 leagues of event tokens with masked-event-modeling for 50 epochs. Loss converges to
          ~1.8 nats per token (versus a uniform-prior baseline of ~3.2 nats over a vocab of ~25 event types).
        </p>
        <p>
          (2) <strong>Pool.</strong> For each match, take the final hidden state at minute 90 (or any minute
          for in-play). That&apos;s a 256-d <em>match embedding</em>.
        </p>
        <p>
          (3) <strong>Fine-tune.</strong> Concatenate the embedding with the rest of your CatBoost feature
          row, retrain CatBoost. Expect 1&ndash;3% log-loss reduction on top of a strong feature set.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever event-stream data is abundant relative to outcome-labeled data &mdash; which is{' '}
        <em>always</em> in football. Self-supervision sidesteps the data-scarcity ceiling that limits
        any purely-supervised model trained on a single league.
      </WhenItMatters>

      <Misconception
        wrong="Self-supervised learning only works at OpenAI scale."
        right="The bigger the unlabeled corpus relative to the labeled one, the more SSL helps. Football has the right ratio (~10⁶ unlabeled events per ~10³ labeled outcomes per season), even at amateur scale."
        because="The architecture can be small. A 5–10M-parameter transformer on event sequences fits on a single GPU and trains overnight. The point isn’t scale, it’s the data ratio."
      />

      <Deeper>
        <p>
          <strong>Two pretext tasks worth trying.</strong> (i) <em>Masked event modeling</em> &mdash; mask
          15% of events, predict them given context. BERT-style; gives a strong representation. (ii){' '}
          <em>Contrastive learning</em> &mdash; sample two random 10-minute windows from the same match
          (positive pair) vs from different matches (negative); the model learns to map same-match
          windows close in embedding space. Captures match-level &ldquo;style&rdquo; which is highly
          predictive of late-match outcomes.
        </p>
        <p>
          <strong>Architecture: small transformer on tokenized events.</strong> Vocabulary: ~25 event
          types × 2 teams × discretized field zones × discretized time-deltas. Sequence length: ~1500
          per match. A 6-layer, 256-d transformer (~10M params) trains in 2&ndash;3 GPU-hours per epoch
          on a single A100; 50 epochs is enough to converge. Comparable to early BERT, vastly cheaper.
        </p>
        <p>
          <strong>Fine-tuning policy.</strong> Two patterns work. (a) <em>Frozen backbone</em> &mdash; use
          the embedding as a feature in CatBoost; cheap, robust to small downstream sets. (b){' '}
          <em>End-to-end fine-tune</em> &mdash; replace CatBoost with a 2-layer MLP head on the
          embedding; needs ~5k labeled matches to beat the frozen baseline. For a single-league
          Brasileirão project, start with (a).
        </p>
        <p>
          <strong>Foundation models for football are coming.</strong> Public projects (StatsBomb, Wyscout,
          Hudl) increasingly release event-stream data. Expect a public &ldquo;Chronos for football&rdquo;
          checkpoint within 1&ndash;2 years &mdash; pretrained on millions of matches across leagues, ready
          to fine-tune. Until then, own pretraining is a high-leverage competitive moat.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where do I get the event-stream data?',
          a: 'StatsBomb Open Data is free for many leagues including the Brasileirão Série A subset. Wyscout, Opta and InStat are commercial. For amateur projects, the StatsBomb open dataset (~2k matches) is enough to validate the pretrain pipeline before spending on full coverage.' },
        { q: 'How do I tokenize a continuous event stream?',
          a: 'Discretize: event type (~25 categories) × team (×2) × field zone (×9 grid) × time delta bucket (×6). Total vocab ~2700 tokens; common ones get high frequency, rare ones share embeddings via subword-style decomposition.' },
        { q: 'Will SSL beat carefully hand-engineered features?',
          a: 'Not reliably yet at single-league scale. SSL+features beats either alone. The marginal log-loss reduction from adding a pretrained embedding to a strong feature set is typically 1–3% — not transformative on its own, but stackable.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — SYNTHETIC DATA AUGMENTATION
   Bootstrap fixture orderings, simulate seasons under perturbed parameters.
   Especially valuable for early-season + small-sample regimes.
   ========================================================================== */

const SyntheticDataCard = () => {
  const [nSynth, setNSynth] = useState(20);
  // Toy: CV metric variance shrinks roughly as 1/sqrt(B), where B is bootstrap reps.
  // We model "CV log-loss 95% half-width" as a function of B from a base of 0.04.
  const baseHalfWidth = 0.04;
  const halfWidth = baseHalfWidth / Math.sqrt(Math.max(1, nSynth) / 1);
  const expEffect = baseHalfWidth - halfWidth;

  return (
    <Card id="synth" icon={FlaskConical} title="Synthetic data augmentation" accent="cyan" index={6}
          subtitle="Stretch a small dataset by simulating fixture orderings, seasons, and perturbed conditions. Tightens CV variance and de-biases small-sample feature estimates.">
      <MinSchema>
        Synthetic data is not for adding <em>signal</em>; it&apos;s for <em>tightening variance</em> on
        the signal you already have. Bootstrap, parametric perturbation, and generative simulation are
        three legitimate tools.
      </MinSchema>

      <p>
        A Brasileirão season is ~380 matches; an early-season window is &lt;100. CV variance dominates.
        Three augmentation strategies worth knowing: (i) <strong>fixture-order bootstrap</strong>{' '}
        &mdash; resample the order in which past matches arrive to estimate model variance under
        alternate sequencings; (ii) <strong>parametric perturbation</strong> &mdash; jitter inputs
        (xG ± noise, lineup partial-availability) to estimate sensitivity; (iii) <strong>generative
        simulation</strong> &mdash; fit a Dixon-Coles or hierarchical Bayesian model and simulate full
        seasons from its posterior, training your CatBoost on the simulated outcomes.
      </p>

      <Predict question="Drag the slider to add more bootstrap synthetic seasons. How fast does CV log-loss variance shrink?">
        ~<Eq>{'1/\\sqrt{B}'}</Eq> for IID bootstrap; slower for time-respecting bootstrap because adjacent
        seasons share data. The <em>bias</em> doesn&apos;t shrink &mdash; if your real data is biased,
        synthetic data preserves the bias. Use augmentation to tighten variance, not to mask data quality
        problems.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-cyan-200 font-mono">B · synthetic replications</span>
              <span className="text-neutral-300 font-mono tabular-nums">{nSynth}</span>
            </div>
            <input type="range" min="1" max="200" step="1" value={nSynth}
              onChange={(e) => setNSynth(parseInt(e.target.value, 10))}
              className="fc-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>1</span><span>50</span><span>100</span><span>200</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="CV ½-width" value={halfWidth.toFixed(4)} sub={`reduced from ${baseHalfWidth.toFixed(3)}`} color="text-cyan-300" />
            <Stat label="Δ" value={`-${(expEffect / baseHalfWidth * 100).toFixed(0)}%`} sub="variance vs B=1" color="text-emerald-300" />
          </div>
          <div className="text-[11px] text-neutral-500 leading-snug">
            <span className="text-neutral-400">What changes vs not.</span> Variance shrinks 5&times; for B=25
            relative to a single CV run. Bias is unchanged &mdash; if your real data is leaky, B=200 doesn&apos;t fix it.
          </div>
        </div>

        {/* Visual: variance curve */}
        <svg viewBox="0 0 280 140" className="w-full h-auto">
          {/* axes */}
          <line x1="30" y1="115" x2="270" y2="115" stroke="#525252" strokeWidth="0.5" />
          <line x1="30" y1="15" x2="30" y2="115" stroke="#525252" strokeWidth="0.5" />
          {/* curve: y = 100 * baseHalfWidth / sqrt(b), scaled */}
          {(() => {
            const pts = [];
            for (let b = 1; b <= 200; b += 1) {
              const w = baseHalfWidth / Math.sqrt(b);
              const x = 30 + (b / 200) * 240;
              const y = 115 - (w / baseHalfWidth) * 95;
              pts.push(`${x},${y.toFixed(1)}`);
            }
            return <polyline points={pts.join(' ')} fill="none" stroke="#67e8f9" strokeWidth="1.6" opacity="0.85" />;
          })()}
          {/* Current B marker */}
          {(() => {
            const x = 30 + (nSynth / 200) * 240;
            const w = baseHalfWidth / Math.sqrt(nSynth);
            const y = 115 - (w / baseHalfWidth) * 95;
            return (
              <g>
                <line x1={x} y1="115" x2={x} y2={y} stroke="#f0abfc" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx={x} cy={y} r="3.5" fill="#f0abfc" stroke="#0a0a0a" strokeWidth="1" />
                <text x={x} y={y - 7} fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="monospace">B={nSynth}</text>
              </g>
            );
          })()}
          {/* axis labels */}
          <text x="150" y="132" fontSize="9" textAnchor="middle" fill="#a3a3a3">bootstrap replications</text>
          <text x="270" y="125" fontSize="8" textAnchor="end" fill="#737373">200</text>
          <text x="30" y="125" fontSize="8" textAnchor="middle" fill="#737373">1</text>
        </svg>
        <div className="text-[9px] text-neutral-500 -mt-1 text-center">
          y-axis: <span className="font-mono text-neutral-400">CV ½-width</span>
        </div>
      </div>

      <Worked title="Worked example · simulating seasons from a Dixon-Coles posterior">
        <p>
          Fit a <Term>Dixon-Coles</Term> bivariate Poisson model to past Brasileirão data, getting
          posterior distributions over each team&apos;s attack/defence strength + the home advantage.
          Sample <Eq>{'B = 100'}</Eq> sets of parameters from the posterior; for each, simulate a full
          380-match season by drawing each fixture&apos;s scoreline from the implied{' '}
          <Term>bivariate Poisson</Term>. You now have 100 plausible alternative seasons.
        </p>
        <p>
          Train your CatBoost on each synthetic season and average the predictions on real validation
          data. The averaged model is empirically Bayes (model-averaged over posterior parameter
          uncertainty), and the variance of per-season predictions <em>is</em> your epistemic-uncertainty
          estimate.
        </p>
      </Worked>

      <WhenItMatters>
        Most useful when (a) you have very few labels (early-season, lower divisions, exotic markets),
        or (b) you need uncertainty estimates and don&apos;t have a Bayesian model. Less useful when
        you&apos;re already data-rich &mdash; the tightening returns diminish past B≈50.
      </WhenItMatters>

      <Misconception
        wrong="Synthetic data adds new information."
        right="Synthetic data only redistributes the information in your existing data and (if generative) in your model’s priors."
        because="A bootstrap draws from your empirical distribution; a generative simulator draws from your posterior. Neither gives you signal you didn’t already have. What augmentation gives you is *variance reduction* on noisy estimates and *robustness checks* against alternative orderings."
      />

      <Deeper>
        <p>
          <strong>Block bootstrap respects time.</strong> A naive IID bootstrap on time-series data leaks
          structure (same match could appear in train and validation). Block bootstrap samples contiguous
          chunks (e.g. a full week of fixtures) so within-block correlation is preserved. For
          season-aware analysis, the natural block is the entire round.
        </p>
        <p>
          <strong>Adversarial perturbation as a regularizer.</strong> At training time, jitter input
          features (<Eq>{'x \\to x + \\epsilon'}</Eq> with <Eq>{'\\epsilon \\sim \\mathcal{N}(0, \\sigma^2)'}</Eq>)
          to penalize sharp loss landscapes. CatBoost has built-in <code>data_augmentation</code>
          parameters; useful when overfitting to small samples.
        </p>
        <p>
          <strong>SMOTE-style for rare markets.</strong> If you want to model an extremely-rare event
          (e.g. red cards, hat-tricks), oversample positive examples with synthetic features drawn from
          local-neighborhood interpolation. Helps stabilize tree splits in the rare-class region; doesn&apos;t
          help calibration unless paired with isotonic recalibration on real data.
        </p>
        <p>
          <strong>Generative-model simulation closes the loop with the modeling-zoo card.</strong> The
          <CrossLink to="zoo" recap="Modeling technique zoo: GBDT, hierarchical Bayesian, Elo, distributional NN, conformal.">modeling zoo</CrossLink>{' '}
          card lists Dixon-Coles and bivariate Poisson as principled generative models for football
          scores. Their posterior <em>is</em> the natural source of synthetic seasons. The two cards work
          together: build a generative model for honesty, use its samples for variance-tightening.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I train CatBoost on bootstrapped data?',
          a: 'Only as part of an ensemble (bagging). Training a single model on a bootstrap is just adding noise. Training many CatBoosts on different bootstraps and averaging is bagging, which IS effective — but plain CatBoost is already a boosting ensemble, so the marginal gain is small.' },
        { q: 'Does this help with multiple-testing inflation?',
          a: 'Indirectly. Bootstrapping CV gives you per-fold variance estimates that feed into deflated-Sharpe-style corrections. It doesn’t fix the inflation, but it makes it measurable.' },
        { q: 'Can I use a foundation generative model (e.g. a football-LLM) to simulate matches?',
          a: 'In principle yes; in practice the public models aren’t there yet for football. When they arrive, sampling rich event streams from a pretrained generative simulator will be the natural source of cheap labeled data.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — TRANSFER LEARNING ACROSS LEAGUES
   Pretrain on data-rich source leagues; fine-tune on target league. Or use a
   hierarchical Bayesian model with partial pooling. Either way: borrow what
   transfers (universal football structure), adapt what doesn't (league style).
   ========================================================================== */

const LEAGUES = [
  { id: 'epl',   name: 'Premier League (EPL)',  matches: 380, similarity: 0.62, on: true,  style: 'fast, pressing, goal-rich' },
  { id: 'bun',   name: 'Bundesliga',            matches: 306, similarity: 0.71, on: true,  style: 'transition-heavy, high xG' },
  { id: 'liga',  name: 'La Liga',               matches: 380, similarity: 0.78, on: true,  style: 'possession, technical' },
  { id: 'serie', name: 'Serie A',               matches: 380, similarity: 0.74, on: false, style: 'tactical, lower-scoring' },
  { id: 'mls',   name: 'MLS',                   matches: 510, similarity: 0.55, on: false, style: 'mid-pace, parity' },
  { id: 'libe',  name: 'Copa Libertadores',     matches: 155, similarity: 0.91, on: true,  style: 'South American, similar tactics' },
];

const TransferLearningCard = () => {
  const [leagues, setLeagues] = useState(Object.fromEntries(LEAGUES.map(l => [l.id, l.on])));
  const onCount = Object.values(leagues).filter(Boolean).length;
  const totalMatches = LEAGUES.filter(l => leagues[l.id]).reduce((s, l) => s + l.matches, 0);
  // Toy effect: more matches → lower target loss, with diminishing returns;
  // mismatched-style leagues add less; high-similarity adds more.
  const baseLoss = 0.598;       // Brasileirão only
  const effSamples = LEAGUES.filter(l => leagues[l.id]).reduce((s, l) => s + l.matches * l.similarity, 0);
  const targetLoss = Math.max(0.555, baseLoss - 0.012 * Math.log(1 + effSamples / 300));
  const delta = baseLoss - targetLoss;

  return (
    <Card id="transfer" icon={Network} title="Transfer learning across leagues" accent="orange" index={7}
          subtitle="Football is the same game everywhere — pretraining on data-rich leagues lets your Brasileirão model borrow the parts that transfer.">
      <MinSchema>
        <Term>Transfer learning</Term>: pretrain on a source distribution, fine-tune on a target. Football
        leagues share the same physics; the league-specific delta lives in style and pace, not the underlying
        structure. Pool what transfers; let local data fix what doesn&apos;t.
      </MinSchema>

      <p>
        Brasileirão has ~380 matches per season &mdash; small for any modern model. EPL + Bundesliga + La
        Liga + the Libertadores together push that past 1,500 matches with overlapping seasons. The trick
        is to extract what generalises (xG mechanics, shot conversion, possession-to-goal rates) and not
        let what doesn&apos;t (referee-leniency profiles, attendance effects, climate) leak the wrong
        prior into your model. Two clean ways to do this: pretrain-then-fine-tune (the deep-learning
        recipe) or a hierarchical Bayesian model with partial pooling across leagues.
      </p>

      <Predict question="Toggle source leagues. How does adding/removing a league move the target log-loss?">
        Diminishing returns by total effective sample size (matches × style similarity). The Libertadores
        (high similarity, modest size) buys more per match than MLS (low similarity, large size). Adding
        any league only helps if you let the model condition on a league embedding so it can adapt the
        bias term per league.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">source leagues to pretrain on</div>
          <div className="space-y-1.5">
            {LEAGUES.map(l => (
              <label key={l.id} className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${leagues[l.id] ? 'border-orange-400/35 bg-orange-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <input type="checkbox" checked={leagues[l.id]} onChange={(e) => setLeagues(s => ({ ...s, [l.id]: e.target.checked }))}
                  className="mt-[3px] accent-orange-400" />
                <span className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[11px] ${leagues[l.id] ? 'text-orange-100' : 'text-neutral-300'}`}>{l.name}</span>
                    <span className="font-mono text-[9px] text-neutral-500">{l.matches}m</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 leading-snug">{l.style}</div>
                </span>
                <span className="font-mono text-[10px] text-neutral-400 tabular-nums">sim {(l.similarity * 100).toFixed(0)}%</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="leagues" value={onCount} sub={`${LEAGUES.length} available`} color="text-orange-300" />
            <Stat label="matches" value={totalMatches.toLocaleString()} sub="source pretrain" color="text-neutral-100" />
            <Stat label="target NLL" value={targetLoss.toFixed(3)} sub={`Δ ${delta > 0 ? '−' : '+'}${Math.abs(delta).toFixed(3)} vs solo`} color={delta > 0.01 ? 'text-emerald-300' : 'text-amber-300'} />
          </div>
          <div className="text-[11px] text-neutral-500 leading-snug">
            Effective samples ≈ <span className="font-mono text-neutral-300">{Math.round(LEAGUES.filter(l => leagues[l.id]).reduce((s, l) => s + l.matches * l.similarity, 0)).toLocaleString()}</span> (matches weighted by style similarity).
            Returns flatten past ~3 well-chosen leagues; adding more dilutes the prior with noise.
          </div>
          {/* Visual: transfer arrow */}
          <svg viewBox="0 0 280 90" className="w-full h-auto">
            <defs>
              <marker id="tr-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="#fb923c" />
              </marker>
              <linearGradient id="tr-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fb923c" stopOpacity="0.7" />
                <stop offset="1" stopColor="#f0abfc" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <rect x="10" y="20" width="100" height="50" rx="8" fill="rgba(251,146,60,0.08)" stroke="#fb923c" strokeOpacity="0.4" />
            <text x="60" y="42" fontSize="10" textAnchor="middle" fill="#fb923c" fontWeight="600">source</text>
            <text x="60" y="56" fontSize="9" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">{onCount} league(s)</text>
            <line x1="115" y1="45" x2="170" y2="45" stroke="url(#tr-grad)" strokeWidth="2.4" markerEnd="url(#tr-arrow)" />
            <text x="142" y="38" fontSize="8" textAnchor="middle" fill="#a3a3a3">pretrain → fine-tune</text>
            <rect x="175" y="20" width="95" height="50" rx="8" fill="rgba(240,171,252,0.08)" stroke="#f0abfc" strokeOpacity="0.4" />
            <text x="222" y="42" fontSize="10" textAnchor="middle" fill="#f0abfc" fontWeight="600">target</text>
            <text x="222" y="56" fontSize="9" textAnchor="middle" fill="#a78bfa" fontFamily="monospace">Brasileirão</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · two recipes">
        <p>
          <strong>Recipe A · Deep learning.</strong> (1) Tokenize event streams from EPL + Bundesliga +
          Libertadores. (2) Pretrain a transformer with masked-event-modeling for 50 epochs (links to{' '}
          <CrossLink to="ssl" recap="Self-supervised pretraining on event streams to learn richer representations than handcrafted features.">SSL</CrossLink>).
          (3) Fine-tune on Brasileirão with a 1X2 head. (4) Concat the embedding into the existing CatBoost
          feature set. Expected gain: ~3&ndash;5% log-loss vs CatBoost-only.
        </p>
        <p>
          <strong>Recipe B · Hierarchical Bayesian.</strong> Fit a multilevel Dixon-Coles where each
          team&apos;s strength is drawn from a league-level prior, and league-level priors share a global
          hyper-prior. <Term>partial pooling</Term> means small Brasileirão samples borrow strength from
          the global prior; large Bundesliga samples don&apos;t. Cleaner uncertainty quantification;
          smaller absolute gains than Recipe A on point predictions, larger gains on tail probabilities.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever your target distribution is data-poor relative to a structurally-similar source.
        Brasileirão specifically benefits from Libertadores (clubs play overlapping fixtures; same teams,
        partly), Argentine and Mexican leagues (similar tactical profile), and the European top-5 (huge
        sample, partial transfer).
      </WhenItMatters>

      <Misconception
        wrong="Brazilian football is too unique to benefit from European data."
        right="The shared structure (xG mechanics, shot quality, possession-to-goal conversion) transfers across leagues. Style differences live in a small number of league-specific bias terms."
        because="Empirical fact: hierarchical models that pool xG-conversion rates across leagues out-perform single-league models on small-sample teams (López 2022 on Liga MX & MLS). The same pattern holds for Brasileirão when paired with Libertadores + La Liga."
      />

      <Deeper>
        <p>
          <strong>Domain adaptation when style differs.</strong> Pretrain on source, then on target with a
          domain-discriminator head (DANN-style) that penalizes the model for being able to identify
          which league a sample came from. Forces the backbone to learn league-invariant features; the
          league-specific head re-injects the bias for the target league only.
        </p>
        <p>
          <strong>Hierarchical pooling is the cleanest Bayesian transfer.</strong> Stan / NumPyro / PyMC
          syntax: each team&apos;s attack <Eq>{'\\alpha_{i, \\ell} \\sim \\mathcal{N}(\\mu_\\ell, \\tau_\\ell)'}</Eq>;
          each league&apos;s mean <Eq>{'\\mu_\\ell \\sim \\mathcal{N}(\\mu_0, \\tau_0)'}</Eq>. The
          posterior automatically tightens for big leagues and stays loose for small ones; small-sample
          teams shrink toward the league prior, which itself shrinks toward the global prior. Three lines
          of model code that replace dozens of hand-crafted rules.
        </p>
        <p>
          <strong>Meta-learning for new-team / promoted-team forecasting.</strong> When a team enters the
          league (new promotion), you have zero matches at this level. <Term>meta-learning</Term>{' '}
          (MAML-style) trains across many small &ldquo;new team&rdquo; tasks &mdash; for each historical
          team, simulate &ldquo;first 5 matches&rdquo; &mdash; and learns a fast-adaptation procedure.
          Surprisingly effective for early-season top-flight predictions on promoted teams.
        </p>
        <p>
          <strong>What does &ldquo;style similarity&rdquo; actually mean operationally?</strong> Compute it
          as <Eq>{'1 - D_{\\mathrm{KL}}(\\hat{p}_{\\mathrm{league}_A} \\,\\|\\, \\hat{p}_{\\mathrm{league}_B})'}</Eq>
          on a shared event-vocabulary distribution. Libertadores and Brasileirão score 0.91 because most
          South American leagues share tactical profile and many players move freely. EPL and MLS score
          0.55 &mdash; same game, very different tempo and ref tendencies.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Won’t pretraining on the wrong leagues hurt me?',
          a: 'Yes — if you don’t fine-tune. The pretrained representation pulls the prior toward source distribution; without sufficient target fine-tuning, you ship a slightly-EPL-flavored Brasileirão forecast. Always validate on the target league CV split.' },
        { q: 'Should each team get its own embedding?',
          a: 'For very high-data leagues, yes. For Brasileirão, prefer a partial-pool: a per-team embedding regularized toward a league-level mean. Otherwise the embedding for newly-promoted teams is essentially noise.' },
        { q: 'How does this interact with the causal-lens card?',
          a: 'Transfer is fundamentally a *causal* claim that source and target share the same DGP up to a known shift. The cleanest transfer happens on causally-invariant features (xG mechanics) and breaks on confounded ones (referee profile differs by federation).' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — MODELING TECHNIQUE ZOO
   GBDT, Bayesian hierarchical, state-space, distributional NN, conformal.
   Same fixture, all five forecasts. Each card: inductive bias / strengths /
   failure modes.
   ========================================================================== */

const MODELS = [
  { id: 'gbdt', name: 'GBDT (CatBoost)', accent: 'amber',
    bias: 'Axis-aligned partitions of feature space; learns interactions implicitly.',
    pHome: 0.51, pDraw: 0.27, pAway: 0.22,
    strength: 'Strong tabular default; handles mixed categorical/numeric; minimal preprocessing.',
    failure: 'Calibration without explicit recalibration is mediocre; cannot extrapolate beyond training-feature range.',
    wins: ['rich tabular features', 'mixed categoricals', 'tight time budget', 'production stability'],
  },
  { id: 'dc', name: 'Bayesian hierarchical (Dixon-Coles)', accent: 'violet',
    bias: 'Bivariate Poisson on goals + low-score correction + team strength as latent.',
    pHome: 0.49, pDraw: 0.30, pAway: 0.21,
    strength: 'Principled scoreline distribution; cheap to fit; honest uncertainty.',
    failure: 'No room for non-football covariates (lineup, market, weather); long tails missed.',
    wins: ['scoreline / corner / O-U markets', 'low-data leagues', 'uncertainty quantification'],
  },
  { id: 'elo', name: 'State-space (Elo / Glicko)', accent: 'sky',
    bias: 'Single latent strength evolves online via prediction-error correction.',
    pHome: 0.53, pDraw: 0.26, pAway: 0.21,
    strength: 'Streaming-friendly; tiny memory; intuitive; self-calibrates with K-factor.',
    failure: 'One scalar per team is too coarse; ignores everything off-pitch; slow to adapt to discrete shifts (managers, transfers).',
    wins: ['baselines', 'features for downstream models', 'live updating between fixtures'],
  },
  { id: 'ngb', name: 'Distributional NN (NGBoost)', accent: 'emerald',
    bias: 'Predict (μ, σ) of an outcome distribution per row; natural-gradient on the parametric likelihood.',
    pHome: 0.50, pDraw: 0.28, pAway: 0.22,
    strength: 'Honest predictive interval per fixture; derive any market from one model.',
    failure: 'Slower than CatBoost; harder to tune; calibration can drift on small samples.',
    wins: ['needs uncertainty per-fixture', 'multi-market deployment from one model', 'small to medium data'],
  },
  { id: 'cp', name: 'Conformal prediction (wrapper)', accent: 'cyan',
    bias: 'Distribution-free interval calibration on top of any base model.',
    pHome: 0.51, pDraw: 0.27, pAway: 0.22,
    strength: 'Coverage guarantee under exchangeability; works on any base.',
    failure: 'Intervals are marginal, not conditional — can be wide on rare regions; needs valid holdout set.',
    wins: ['decision-time interval guarantees', 'paired with any of the above'],
  },
];

const ModelZooCard = () => {
  const [active, setActive] = useState(MODELS[0].id);
  const m = MODELS.find(x => x.id === active);
  const W = 320, H = 90, P = 24;
  const labels = ['Home', 'Draw', 'Away'];
  const probs = [m.pHome, m.pDraw, m.pAway];
  const market = [0.45, 0.27, 0.28];

  return (
    <Card id="zoo" icon={Boxes} title="Modeling technique zoo" accent="amber" index={8}
          subtitle="Five families with very different inductive biases. Same fixture, five different forecasts. The right pick depends on what kind of structure you’re willing to assert.">
      <MinSchema>
        Pick the model family whose <em>inductive bias</em> matches the structure of your problem and the
        data you have. There is no universally-best technique; there&apos;s the one that codifies the
        right prior with the least assumption-friction.
      </MinSchema>

      <p>
        Each row of the picker below is a different family applied to the <em>same</em> Brasileirão home-derby
        fixture, with the same upstream features. Their forecasts differ because their inductive biases
        differ &mdash; CatBoost partitions feature space, Dixon-Coles asserts Poisson scorelines, Elo
        compresses the past into one scalar, NGBoost fits parametric distributions. None of them is
        &ldquo;right&rdquo;; each is right for a different decision context.
      </p>

      <Predict question="Same fixture, same features, five model families. Will the 1X2 forecasts agree?">
        Roughly &mdash; the central tendency lines up because the shared signal (recent form, market prior)
        dominates. But the <em>uncertainty</em> profiles diverge: NGBoost gives wider intervals than
        CatBoost on small-sample teams; Dixon-Coles gives narrower-but-mis-shaped intervals on extreme
        scorelines. Where models disagree is exactly where you need an ensemble.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5 mb-3">
        {MODELS.map(mm => (
          <button key={mm.id} onClick={() => setActive(mm.id)}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
              active === mm.id
                ? `${chipPalette[mm.accent]} border-${mm.accent}-400/40`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {mm.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{m.name}</div>
          <div className="text-[12px] text-neutral-200 leading-snug mb-2">
            <span className="text-neutral-400">Inductive bias:</span> {m.bias}
          </div>
          <div className="space-y-1 text-[11px]">
            <div><Chip color="emerald">strength</Chip> <span className="text-neutral-200 ml-1">{m.strength}</span></div>
            <div><Chip color="rose">failure</Chip> <span className="text-neutral-200 ml-1">{m.failure}</span></div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">picks well when…</div>
            <div className="flex flex-wrap gap-1">
              {m.wins.map(w => <span key={w} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-neutral-300">{w}</span>)}
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full h-auto">
          {labels.map((lab, i) => {
            const barW = (W - P * 2) / 3;
            const x = P + i * barW + barW * 0.18;
            const w = barW * 0.32;
            const mkH = market[i] * H;
            const moH = probs[i] * H;
            const baseY = H;
            return (
              <g key={lab}>
                <rect x={x} y={baseY - mkH} width={w} height={mkH} fill="#a3a3a3" opacity="0.4" rx="2" />
                <rect x={x + w + 2} y={baseY - moH} width={w} height={moH} fill={`var(--zoo-fill, ${m.accent === 'amber' ? '#fbbf24' : m.accent === 'violet' ? '#c4b5fd' : m.accent === 'sky' ? '#7dd3fc' : m.accent === 'emerald' ? '#6ee7b7' : '#67e8f9'})`} opacity="0.85" rx="2" />
                <text x={x + w + 1} y={baseY + 12} fontSize="9" textAnchor="middle" fill="#a3a3a3">{lab}</text>
                <text x={x + w / 2} y={baseY - mkH - 3} fontSize="8" textAnchor="middle" fill="#737373">{(market[i] * 100).toFixed(0)}</text>
                <text x={x + w * 1.5 + 2} y={baseY - moH - 3} fontSize="8" textAnchor="middle" fill={m.accent === 'amber' ? '#fbbf24' : m.accent === 'violet' ? '#c4b5fd' : m.accent === 'sky' ? '#7dd3fc' : m.accent === 'emerald' ? '#6ee7b7' : '#67e8f9'}>{(probs[i] * 100).toFixed(0)}</text>
              </g>
            );
          })}
          <g transform={`translate(${P}, ${H + 22})`}>
            <rect x="0" y="-7" width="8" height="8" fill="#a3a3a3" opacity="0.4" rx="1" />
            <text x="11" y="0" fontSize="9" fill="#a3a3a3">market</text>
            <rect x="60" y="-7" width="8" height="8" fill={m.accent === 'amber' ? '#fbbf24' : m.accent === 'violet' ? '#c4b5fd' : m.accent === 'sky' ? '#7dd3fc' : m.accent === 'emerald' ? '#6ee7b7' : '#67e8f9'} opacity="0.85" rx="1" />
            <text x="71" y="0" fontSize="9" fill={m.accent === 'amber' ? '#fbbf24' : m.accent === 'violet' ? '#c4b5fd' : m.accent === 'sky' ? '#7dd3fc' : m.accent === 'emerald' ? '#6ee7b7' : '#67e8f9'}>{m.name.split(' ')[0]}</text>
          </g>
        </svg>
      </div>

      <WhenItMatters>
        At the architecture-decision moment, before HPO. Picking the wrong family is more expensive than
        picking suboptimal hyperparameters within the right family. For Brasileirão 1X2 with rich
        features &mdash; default to GBDT; for derived markets (corners, scorelines) &mdash; Dixon-Coles
        first; for online updating &mdash; Elo as a feature; for uncertainty per-fixture &mdash; NGBoost
        or CatBoost + Conformal.
      </WhenItMatters>

      <Misconception
        wrong="One model family dominates the others on football."
        right="In published benchmarks, GBDT wins on aggregate-feature 1X2; Dixon-Coles wins on rare scorelines; deep models win on large-data derived markets. The differences are well within ensemble range."
        because="No-free-lunch theorem applies. The best aggregate model is almost always an ensemble across families because their failure modes are uncorrelated. A pure-CatBoost vs pure-Dixon-Coles head-to-head is the wrong question."
      />

      <Deeper>
        <p>
          <strong>Inductive bias is what you assert about the data-generating process.</strong> CatBoost
          asserts &ldquo;the function is locally constant in axis-aligned regions of feature space&rdquo;.
          Dixon-Coles asserts &ldquo;goals are bivariate Poisson with team-strength factors&rdquo;. NGBoost
          asserts &ldquo;the conditional distribution is parametric and locally smooth&rdquo;. Conformal
          asserts &ldquo;observations are exchangeable&rdquo;. Stronger assertions = stronger generalization
          when the assertion holds = harder failures when it doesn&apos;t.
        </p>
        <p>
          <strong>Bayesian hierarchical scales better than people think.</strong> A NumPyro model with
          per-team strengths + league-level priors fits in seconds for Brasileirão; minutes for the full
          European top-5. The bottleneck used to be MCMC; modern variational inference + NUTS in NumPyro/Stan
          changed that. If you haven&apos;t tried it since 2020, retry.
        </p>
        <p>
          <strong>Conformal prediction pairs with everything.</strong> Wrap your CatBoost or NGBoost in a
          Mondrian-conformal layer (groups by predicted-probability decile) and you get coverage-guaranteed
          intervals per fixture for free. The wrapper costs ~30 lines of code and one extra holdout set.
        </p>
        <p>
          <strong>What about graph neural nets?</strong> Promising for player-passing networks; hard to
          beat aggregate features at the match-outcome level (the graph collapses to a few summary
          statistics anyway). Treat them as a research direction, not a production default.
        </p>
      </Deeper>

      <QA items={[
        { q: 'I have a working CatBoost. Should I rebuild as a hierarchical Bayesian?',
          a: 'Don’t replace — augment. Run both, ensemble. The Bayesian model gives you uncertainty estimates and tail probabilities your CatBoost can’t; CatBoost gives you the raw point-prediction quality the hierarchical model can’t match on rich features.' },
        { q: 'How do I know if my chosen model family is the bottleneck?',
          a: 'Run a model from a *different* family on the same features. If the new family gets within 1% of your best CatBoost log-loss, your bottleneck is data/features, not architecture. If it’s 5%+ different, your inductive bias matters and the family choice is the lever.' },
        { q: 'Why aren’t deep tabular models (TabNet, FT-Transformer) on this list?',
          a: 'They’re a fine option but rarely beat well-tuned GBDT on ≤10k labeled rows. The published wins are on much larger tabular datasets. For Brasileirão scale, GBDT remains the strong default.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — DISTRIBUTIONAL FORECASTING
   Predict the full conditional goal distribution. Derive any market (1X2,
   O/U, AH, BTTS) from one model. The natural target for a Dixon-Coles or
   NGBoost head; a one-stop shop for multi-market deployment.
   ========================================================================== */

const poisson = (lam, k) => {
  // simple Poisson PMF for small k
  let p = Math.exp(-lam);
  for (let i = 1; i <= k; i++) p *= lam / i;
  return p;
};

const DistributionalCard = () => {
  const [muH, setMuH] = useState(1.6);
  const [muA, setMuA] = useState(1.1);
  const [rho, setRho] = useState(-0.10); // Dixon-Coles low-score correction

  // Score-grid up to 5×5
  const grid = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 5; j++) {
      let p = poisson(muH, i) * poisson(muA, j);
      // Dixon-Coles correction
      let tau = 1;
      if (i === 0 && j === 0) tau = 1 - muH * muA * rho;
      else if (i === 0 && j === 1) tau = 1 + muH * rho;
      else if (i === 1 && j === 0) tau = 1 + muA * rho;
      else if (i === 1 && j === 1) tau = 1 - rho;
      arr.push({ i, j, p: p * tau });
    }
    const Z = arr.reduce((s, c) => s + c.p, 0);
    return arr.map(c => ({ ...c, p: c.p / Z }));
  }, [muH, muA, rho]);

  // Derived markets
  const pH = grid.filter(c => c.i > c.j).reduce((s, c) => s + c.p, 0);
  const pD = grid.filter(c => c.i === c.j).reduce((s, c) => s + c.p, 0);
  const pA_ = grid.filter(c => c.i < c.j).reduce((s, c) => s + c.p, 0);
  const pOver = grid.filter(c => c.i + c.j > 2.5).reduce((s, c) => s + c.p, 0);
  const pBTTS = grid.filter(c => c.i > 0 && c.j > 0).reduce((s, c) => s + c.p, 0);
  const pAH_minus1 = grid.filter(c => c.i - c.j > 1).reduce((s, c) => s + c.p, 0); // home -1 (covers if wins by 2+)

  const cellSize = 28;
  const gW = 6 * cellSize, gH = 6 * cellSize;

  const maxP = Math.max(...grid.map(c => c.p));

  return (
    <Card id="distributional" icon={Gauge} title="Distributional forecasting" accent="sky" index={9}
          subtitle="Predict the full joint distribution of home and away goals; every betting market is then a sum of cells. One model, every market.">
      <MinSchema>
        Train one model that outputs a full <em>conditional distribution</em>{' '}
        <Eq>{'P(\\co{Y} \\mid \\vi{X})'}</Eq>. <em>Any</em> market &mdash; 1X2, O/U, AH, BTTS &mdash; is
        a measurable function of that distribution. No per-market model menagerie.
      </MinSchema>

      <p>
        Most football modeling pipelines train a separate model per market &mdash; a 1X2 model, an O/U 2.5
        model, an AH model. That&apos;s three loss functions, three feature pipelines, three calibrations,
        three CV runs. The distributional alternative: train a single model whose target is the full
        joint scoreline distribution <Eq>{'P(\\co{H}, \\co{A} \\mid \\vi{X})'}</Eq>, then derive every
        market by summing over the relevant cells. <Term>Dixon-Coles</Term> with a low-score correction
        is the textbook parametric form; <Term>NGBoost</Term> on Poisson rates is the
        non-parametric/boosted equivalent.
      </p>

      <Predict question="Drag the home and away goal-rate sliders. How much do the derived 1X2 / O2.5 / BTTS probabilities move together vs independently?">
        Coupled by structure but not redundant: nudging <Eq>{'\\mu_H'}</Eq> up shifts mass to the home-win
        diagonal AND adds total-goals mass; that&apos;s why a single forecaster can compete with
        market-specific models. Dixon-Coles&apos;s <Eq>{'\\rho'}</Eq> correction adjusts joint behavior
        in low-score cells without breaking marginal Poisson assumptions.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-5 items-start">
        <div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-sky-200 font-mono">μ Home</span>
                <span className="text-neutral-300 font-mono tabular-nums">{muH.toFixed(2)}</span>
              </div>
              <input type="range" min="0.4" max="3.5" step="0.05" value={muH} onChange={(e) => setMuH(parseFloat(e.target.value))} className="fc-range w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-sky-200 font-mono">μ Away</span>
                <span className="text-neutral-300 font-mono tabular-nums">{muA.toFixed(2)}</span>
              </div>
              <input type="range" min="0.3" max="3.0" step="0.05" value={muA} onChange={(e) => setMuA(parseFloat(e.target.value))} className="fc-range w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-violet-300 font-mono">ρ · low-score correction</span>
                <span className="text-neutral-300 font-mono tabular-nums">{rho.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.20" max="0.10" step="0.01" value={rho} onChange={(e) => setRho(parseFloat(e.target.value))} className="fc-range w-full" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="P(Home)" value={`${(pH * 100).toFixed(0)}%`} color="text-sky-200" />
            <Stat label="P(Draw)" value={`${(pD * 100).toFixed(0)}%`} color="text-neutral-200" />
            <Stat label="P(Away)" value={`${(pA_ * 100).toFixed(0)}%`} color="text-rose-200" />
            <Stat label="P(O 2.5)" value={`${(pOver * 100).toFixed(0)}%`} color="text-amber-200" />
            <Stat label="P(BTTS yes)" value={`${(pBTTS * 100).toFixed(0)}%`} color="text-emerald-200" />
            <Stat label="P(H -1 AH)" value={`${(pAH_minus1 * 100).toFixed(0)}%`} color="text-fuchsia-200" />
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 leading-snug">
            Every market is a sum of cells from the heatmap. Change μ — every metric updates coherently.
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 text-center">P(Home goals = i, Away goals = j) · darker = more probable</div>
          <div className="grid grid-cols-[12px_1fr] gap-1 items-center">
            <div className="text-[9px] text-neutral-500 font-mono whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>away goals →</div>
            <svg viewBox={`0 0 ${gW + 36} ${gH + 36}`} className="w-full h-auto">
            {/* axis labels */}
            {Array.from({ length: 6 }).map((_, i) => (
              <text key={`ax${i}`} x={26 + i * cellSize + cellSize / 2} y={gH + 30} fontSize="9" textAnchor="middle" fill="#a3a3a3">{i}</text>
            ))}
            {Array.from({ length: 6 }).map((_, j) => (
              <text key={`ay${j}`} x={20} y={26 + j * cellSize + cellSize / 2 + 3} fontSize="9" textAnchor="end" fill="#a3a3a3">{j}</text>
            ))}
            {/* cells */}
            {grid.map(c => {
              const rel = c.p / maxP;
              const fill = `rgba(125, 211, 252, ${(rel * 0.85 + 0.04).toFixed(3)})`;
              const x = 26 + c.i * cellSize;
              const y = 26 + c.j * cellSize;
              const isWin = c.i > c.j, isDraw = c.i === c.j;
              const stroke = isDraw ? '#a3a3a3' : isWin ? '#7dd3fc' : '#fb7185';
              return (
                <g key={`${c.i}-${c.j}`}>
                  <rect x={x + 1} y={y + 1} width={cellSize - 2} height={cellSize - 2} fill={fill} stroke={stroke} strokeOpacity={0.25} rx={2} />
                  {rel > 0.18 && (
                    <text x={x + cellSize / 2} y={y + cellSize / 2 + 3} fontSize="8" textAnchor="middle" fill={rel > 0.55 ? '#0a0a0a' : '#e5e7eb'} fontFamily="monospace">{(c.p * 100).toFixed(0)}</text>
                  )}
                </g>
              );
            })}
          </svg>
          </div>
          <div className="text-[9px] text-neutral-500 font-mono text-center mt-1 pl-3">home goals →</div>
        </div>
      </div>

      <WhenItMatters>
        Whenever you bet more than one market per fixture, or want a coherent treatment of correlated
        markets (1X2 and O/U on the same fixture). Single-market models can disagree with each other in
        impossible ways (P(home win) + P(BTTS no, draw, etc.) summing inconsistently); a distributional
        model is internally coherent by construction.
      </WhenItMatters>

      <Misconception
        wrong="A separate model per market gives me higher accuracy on each."
        right="Sometimes per-market models edge out by ~1% on point predictions, but lose on data efficiency, calibration coherence, and ops complexity."
        because="Per-market models share most of the input features; you’re effectively training the same backbone N times. Consolidating to one distributional output uses the same data more efficiently and guarantees market-coherent forecasts. Use per-market refinement only when ensembling on top, not as the primary architecture."
      />

      <Deeper>
        <p>
          <strong>Dixon-Coles in two equations.</strong> Marginal goals as Poisson with team-strength
          rates: <Eq>{'\\mu_H = \\alpha_h \\cdot \\beta_a \\cdot \\gamma'}</Eq>,{' '}
          <Eq>{'\\mu_A = \\alpha_a \\cdot \\beta_h'}</Eq> (home advantage <Eq>{'\\gamma'}</Eq>).
          Joint pmf modified by a low-score correction <Eq>{'\\tau(i, j; \\mu_H, \\mu_A, \\rho)'}</Eq>{' '}
          that adjusts the four cells <Eq>{'(0,0), (0,1), (1,0), (1,1)'}</Eq>; everything else is the
          independent product. The whole model fits in ~30 lines of NumPyro.
        </p>
        <p>
          <strong>NGBoost as the boosted distributional alternative.</strong> Each leaf outputs the
          parameters <Eq>{'(\\mu_H, \\mu_A)'}</Eq> of a bivariate Poisson; gradients flow through the
          natural log-likelihood. More flexible than Dixon-Coles (the strengths are predicted rather than
          fit per team), but slower and harder to tune. Best for medium-data regimes where Dixon-Coles
          is too rigid.
        </p>
        <p>
          <strong>Skellam for Asian Handicap.</strong> The difference of two Poissons follows a Skellam
          distribution, which has a closed-form CDF. <Eq>{'P(H - A \\geq k)'}</Eq> for any handicap{' '}
          <Eq>{'k'}</Eq> is one function call. For half-line handicaps (e.g. -1.5), use the discrete
          form; for quarter-line handicaps, split as half-bets on -1 and -2.
        </p>
        <p>
          <strong>Calibration of distributional forecasts.</strong> Reliability per derived market matters
          more than reliability of the joint. After fitting, plot calibration for 1X2, O/U, BTTS
          separately; a Mondrian conformal layer can correct each independently while preserving the joint
          structure. Do this before deploying to multiple markets.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why not just predict P(over 2.5) directly?',
          a: 'You can, but you can’t use the same model for AH or scorelines. Distributional gives you all of those for free, plus consistency: P(over 2.5) and P(home win) won’t contradict each other.' },
        { q: 'Does this only work with Poisson goals?',
          a: 'No. Negative binomial handles overdispersion better; bivariate-NB or copula models handle correlation between home and away goal counts. Poisson + DC correction is the right starting point; upgrade if calibration fails on rare scorelines.' },
        { q: 'How do I add features (e.g. xG) into a distributional model?',
          a: 'Make the rate parameters a function of features: μ_H = exp(f(x)). Both NGBoost and a small MLP can do this; CatBoost can output (μ_H, μ_A) via its multi-output regression mode.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — IN-PLAY / LIVE MODELING
   Sequence models on event streams. Bayesian update from game state.
   Intensity / Poisson process models. Very different inductive bias from
   pre-match.
   ========================================================================== */

// Build a synthetic in-play probability path for a 90' Brasileirão match.
// Markers: goals shift the curve; red cards shift it more; injury time is added.
const IN_PLAY_EVENTS = [
  { t: 0,  type: 'kickoff', label: 'kickoff', ph: 0.51, color: '#a3a3a3' },
  { t: 11, type: 'shot',    label: 'home shot saved',  ph: 0.54, color: '#7dd3fc' },
  { t: 23, type: 'goal',    label: 'GOAL · home 1-0',  ph: 0.72, color: '#6ee7b7' },
  { t: 38, type: 'card',    label: 'home yellow',      ph: 0.68, color: '#fbbf24' },
  { t: 45, type: 'half',    label: 'half-time',        ph: 0.69, color: '#a3a3a3' },
  { t: 57, type: 'shot',    label: 'away shot wide',   ph: 0.66, color: '#fb7185' },
  { t: 64, type: 'goal',    label: 'GOAL · away 1-1',  ph: 0.41, color: '#fb7185' },
  { t: 76, type: 'red',     label: 'RED · away',       ph: 0.59, color: '#dc2626' },
  { t: 84, type: 'goal',    label: 'GOAL · home 2-1',  ph: 0.84, color: '#6ee7b7' },
  { t: 91, type: 'final',   label: 'full time',        ph: 0.93, color: '#a3a3a3' },
];

const InPlayCard = () => {
  const [t, setT] = useState(0);
  // Closest event ≤ t
  const cur = IN_PLAY_EVENTS.filter(e => e.t <= t).slice(-1)[0] || IN_PLAY_EVENTS[0];
  // Interpolate ph between current and next
  const next = IN_PLAY_EVENTS.find(e => e.t > t);
  const ph = next
    ? cur.ph + (next.ph - cur.ph) * ((t - cur.t) / Math.max(1, next.t - cur.t))
    : cur.ph;

  const W = 320, H = 130, P = 24;
  const sx = (m) => P + (m / 92) * (W - 2 * P);
  const sy = (p) => H - 10 - p * (H - 30);

  return (
    <Card id="inplay" icon={Activity} title="In-play / live modeling" accent="rose" index={10}
          subtitle="Pre-match models forecast a fixture; in-play models track a state. Different inductive bias, different toolkit, very different latency budget.">
      <MinSchema>
        In-play is a <em>state-tracking problem</em>, not a regression problem. Every minute the state
        changes; every event is a Bayesian update. Pre-match priors are a good starting point but
        decay fast.
      </MinSchema>

      <p>
        At kickoff, your pre-match model gives a good prior. By minute 70, the realized state (score,
        red cards, injuries, possession patterns) dominates &mdash; the pre-match prior is mostly
        irrelevant. In-play modeling treats the running match as a state-space problem: at each minute
        <Eq>{'t'}</Eq> you have a state <Eq>{'s_t'}</Eq> (score, time left, n cards, etc.) and predict
        the terminal outcome <Eq>{'P(y \\mid s_t)'}</Eq>. Three families work: (1) Markov goal-intensity
        models (closed form, fast); (2) sequence models on event tokens (rich, slower); (3) Monte
        Carlo simulation from a fitted intensity model (flexible).
      </p>

      <Predict question="Drag the timeline. How does P(home win) move when (a) home scores, (b) away gets a red card late, (c) score is 1-1 at minute 70?">
        Goals shift large; red cards in the last 15 shift large because the ahead-team has time to convert
        the man-advantage; a tied scoreline with little time left collapses toward draw probability and
        the favorite&apos;s pre-match win rate. The slope of the curve at any moment is the model&apos;s
        per-minute Bayesian update.
      </Predict>

      <div className="mt-4 space-y-3">
        <div>
          <input type="range" min="0" max="92" step="1" value={t} onChange={(e) => setT(parseInt(e.target.value, 10))} className="fc-range w-full" />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
            <span>0&apos;</span><span>15&apos;</span><span>30&apos;</span><span>45&apos;</span><span>60&apos;</span><span>75&apos;</span><span>90&apos;+</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          <Stat label="minute" value={`${t}'`} color="text-rose-200" />
          <Stat label="P(home win)" value={`${(ph * 100).toFixed(0)}%`} sub={`${(ph - 0.51) >= 0 ? '+' : ''}${((ph - 0.51) * 100).toFixed(0)}pp vs kickoff`} color={ph > 0.51 ? 'text-emerald-300' : 'text-rose-300'} />
          <Stat label="last event" value={cur.label.slice(0, 22)} sub={`@ ${cur.t}'`} color="text-neutral-200" />
        </div>

        <svg viewBox={`0 0 ${W} ${H + 12}`} className="w-full h-auto">
          {/* axes */}
          <line x1={P} y1={H - 10} x2={W - P} y2={H - 10} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} y1={H - 10 - 0.5 * (H - 30)} x2={W - P} y2={H - 10 - 0.5 * (H - 30)} stroke="#525252" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={P - 3} y={H - 10 - 0.5 * (H - 30) + 3} fontSize="8" textAnchor="end" fill="#737373">50%</text>
          {/* the path */}
          {(() => {
            const pts = [];
            for (let i = 0; i < IN_PLAY_EVENTS.length - 1; i++) {
              const a = IN_PLAY_EVENTS[i], b = IN_PLAY_EVENTS[i + 1];
              for (let m = a.t; m <= b.t; m++) {
                const p = a.ph + (b.ph - a.ph) * ((m - a.t) / Math.max(1, b.t - a.t));
                pts.push(`${sx(m).toFixed(1)},${sy(p).toFixed(1)}`);
              }
            }
            return <polyline points={pts.join(' ')} fill="none" stroke="#fb7185" strokeWidth="1.6" opacity="0.85" />;
          })()}
          {/* event markers */}
          {IN_PLAY_EVENTS.map((e, i) => (
            <g key={i}>
              <line x1={sx(e.t)} y1={H - 10} x2={sx(e.t)} y2={sy(e.ph)} stroke={e.color} strokeOpacity="0.35" strokeWidth="0.8" />
              <circle cx={sx(e.t)} cy={sy(e.ph)} r={e.type === 'goal' || e.type === 'red' ? 3.6 : 2.2} fill={e.color} stroke="#0a0a0a" strokeWidth="0.7" />
            </g>
          ))}
          {/* current marker */}
          <line x1={sx(t)} y1={H - 10} x2={sx(t)} y2={sy(ph)} stroke="#f0abfc" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={sx(t)} cy={sy(ph)} r="4.5" fill="#f0abfc" stroke="#0a0a0a" strokeWidth="1" />
          {/* x ticks */}
          {[0, 15, 30, 45, 60, 75, 90].map(m => (
            <text key={m} x={sx(m)} y={H + 8} fontSize="8" textAnchor="middle" fill="#737373">{m}</text>
          ))}
        </svg>
      </div>

      <Worked title="Worked example · scoring intensity model">
        <p>
          Treat each team&apos;s scoring as a non-homogeneous Poisson process with rate{' '}
          <Eq>{'\\lambda(t, s_t)'}</Eq> &mdash; a function of game time, current score, cards, and lineup
          state. From any state, simulate to full time 10,000 times to estimate{' '}
          <Eq>{'P(\\text{home win} \\mid s_t)'}</Eq>, <Eq>{'P(\\text{over 2.5} \\mid s_t)'}</Eq>, etc.
        </p>
        <p>
          <strong>Why this works.</strong> The Poisson process is memoryless except through the rate. Once
          you condition on current state, the future evolves under the local rate; integration is exact for
          some closed-form markets and trivial via MC for any other.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever you trade in-play markets &mdash; even casually. The pre-match model is the wrong tool
        from minute 1; the gap between &ldquo;pre-match prior&rdquo; and &ldquo;in-play state&rdquo;
        widens monotonically through the game. By minute 70 of a 1-0 home lead, the pre-match win
        probability could be off by 30 percentage points.
      </WhenItMatters>

      <Misconception
        wrong="My pre-match CatBoost can do in-play just by re-running it with updated features."
        right="It can, but the inductive bias is wrong: pre-match features are designed for a 90' horizon, not a remaining-time horizon. A purpose-built in-play model dominates."
        because="A pre-match feature like ‘home rolling xG’ contains zero information about what’s already happened in this match. In-play needs state features (current score, time left, red-card count) that pre-match models don’t take. Bolting them on works as a baseline; a state-aware model wins."
      />

      <Deeper>
        <p>
          <strong>Markov game models.</strong> Discretize state (score, time bucket, cards) and learn
          transition probabilities from data. Closed-form: <Eq>{'P(y \\mid s_t)'}</Eq> via matrix
          exponentiation on the transition matrix. Fast enough for live trading; coarse enough that
          rare-state estimation needs Bayesian smoothing.
        </p>
        <p>
          <strong>Event-stream sequence models.</strong> The pretrained transformer from{' '}
          <CrossLink to="ssl" recap="Self-supervised pretraining on event streams.">SSL pretraining</CrossLink>{' '}
          naturally extends in-play: feed events as they happen, take the running hidden state as
          embedding, predict on top. Latency budget: most in-play markets settle within ~2 seconds of
          an event, so inference must complete in &lt;500ms per update.
        </p>
        <p>
          <strong>The CLV concept generalizes to in-play.</strong> Sharp in-play books update odds
          fast; beating their next 30-second odds is the operational definition of in-play edge. Most
          retail in-play books lag &mdash; the alpha is in the latency wedge between sharp and soft
          books, plus the model.
        </p>
        <p>
          <strong>Connection to RL portfolio.</strong> In-play is a sequential decision problem: at
          each minute, decide whether to bet at the current odds or wait. This is naturally an RL or
          contextual-bandit problem &mdash; see{' '}
          <CrossLink to="rl" recap="RL for portfolio bet selection: contextual bandits over multi-bet slates.">RL portfolio</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Do I need event-stream data, or can I do in-play with just the score and time?',
          a: 'Score + time gets you 80% of the way for 1X2. For O/U and AH you need momentum signals (recent shots, possession). Full event streams unlock corners and player-prop markets.' },
        { q: 'How do I avoid latency issues?',
          a: 'Pre-compute decision boundaries off-line where possible; cache the model state between updates. The actual per-update inference is cheap; the bottleneck is usually the data feed.' },
        { q: 'Can I use my pre-match CatBoost as a prior for in-play?',
          a: 'Yes — it provides the kickoff probability that the in-play model anchors on. Combine via Bayesian update: prior from pre-match, likelihood from in-play state, posterior is the running probability.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — ENSEMBLING DONE RIGHT
   Blending vs stacking vs BMA. OOF leakage is the trap. Multi-task as a
   data-efficient alternative when targets are correlated.
   ========================================================================== */

const ENSEMBLE_METHODS = [
  { id: 'avg',   name: 'Simple average',     desc: 'Mean of base predictions. No fitting, no leakage risk.', risk: 'low',   gain: 0.45 },
  { id: 'wavg',  name: 'Weighted average',   desc: 'Weights chosen by holdout log-loss. Tiny meta-model.',   risk: 'low',   gain: 0.62 },
  { id: 'stack', name: 'Stacking (OOF)',     desc: 'Meta-learner trained on OOF predictions of base models.', risk: 'high',  gain: 0.78 },
  { id: 'bma',   name: 'Bayesian model avg', desc: 'Posterior over models given data; weights are likelihood-based.', risk: 'low', gain: 0.58 },
  { id: 'mt',    name: 'Multi-task',         desc: 'One backbone, many heads. Shared representation across markets.', risk: 'med', gain: 0.72 },
];

const EnsemblingCard = () => {
  const [active, setActive] = useState('stack');
  const m = ENSEMBLE_METHODS.find(x => x.id === active);
  const [leak, setLeak] = useState(false);

  return (
    <Card id="ensembling" icon={Workflow} title="Ensembling done right" accent="violet" index={11}
          subtitle="Combine diverse base models to surface uncorrelated information channels. The art is in not leaking the meta-learner.">
      <MinSchema>
        Ensembles win when base models have <em>uncorrelated errors</em>, not when they&apos;re individually
        best. Most ensembling failures are the same one: <Term>OOF</Term> discipline broke and the meta-learner
        memorized the validation set.
      </MinSchema>

      <p>
        A diverse ensemble routinely outperforms its best component by 5&ndash;15% in log-loss on
        Brasileirão-scale data &mdash; not because each model is great, but because their <em>errors</em>{' '}
        are different. CatBoost mis-predicts in different regions than Dixon-Coles, which mis-predicts in
        different regions than the SSL-pretrained transformer. Average them, and the wrongnesses cancel.
        The trap: stacking is the strongest method when done right and one of the worst when not, because
        a meta-learner trained on in-sample predictions trivially learns the validation set.
      </p>

      <Predict question="Pick a method below. How does its expected gain trade off against the risk of subtle leakage?">
        Simple averaging is robust but caps your gain. Stacking unlocks more, but only with rigorous{' '}
        <Term>OOF</Term> discipline and a held-out final test set. Multi-task gives you most of stacking&apos;s
        benefit with much less leakage surface area &mdash; one model, many heads.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5 mb-3">
        {ENSEMBLE_METHODS.map(mm => (
          <button key={mm.id} onClick={() => setActive(mm.id)}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
              active === mm.id
                ? 'bg-violet-500/15 border-violet-400/40 text-violet-100'
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {mm.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{m.name}</div>
          <p className="text-[12px] text-neutral-200 leading-snug mb-3">{m.desc}</p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="leak risk" value={m.risk} sub="if discipline slips" color={m.risk === 'low' ? 'text-emerald-300' : m.risk === 'med' ? 'text-amber-300' : 'text-rose-300'} />
            <Stat label="typ. gain" value={`${(m.gain * 100).toFixed(0)}%`} sub="of best base log-loss head-room" color="text-violet-300" />
          </div>
        </div>

        {/* OOF flow diagram with leak toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">OOF flow</span>
            <label className="text-[10px] flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={leak} onChange={(e) => setLeak(e.target.checked)} className="accent-rose-400" />
              <span className={leak ? 'text-rose-300' : 'text-neutral-400'}>simulate leakage</span>
            </label>
          </div>
          <svg viewBox="0 0 280 150" className="w-full h-auto">
            {/* Folds */}
            {[0, 1, 2, 3].map((k, i) => {
              const x = 12 + i * 64;
              return (
                <g key={k}>
                  <rect x={x} y="20" width="58" height="14" rx="3" fill="rgba(125,211,252,0.15)" stroke="#7dd3fc" strokeOpacity="0.4" />
                  <text x={x + 29} y="30" fontSize="9" textAnchor="middle" fill="#7dd3fc">train fold {k}</text>
                  <rect x={x} y="38" width="58" height="14" rx="3" fill={leak ? 'rgba(251,113,133,0.25)' : 'rgba(110,231,183,0.18)'} stroke={leak ? '#fb7185' : '#6ee7b7'} strokeOpacity="0.5" />
                  <text x={x + 29} y="48" fontSize="9" textAnchor="middle" fill={leak ? '#fb7185' : '#6ee7b7'}>{leak ? 'val (leaked)' : 'val OOF'}</text>
                  <line x1={x + 29} y1="55" x2={x + 29} y2="80" stroke={leak ? '#fb7185' : '#6ee7b7'} strokeWidth="0.8" strokeOpacity="0.6" markerEnd="url(#cl-arrow)" />
                </g>
              );
            })}
            {/* Meta */}
            <rect x="40" y="85" width="200" height="22" rx="4" fill={leak ? 'rgba(251,113,133,0.15)' : 'rgba(196,181,253,0.15)'} stroke={leak ? '#fb7185' : '#c4b5fd'} strokeOpacity="0.6" />
            <text x="140" y="99" fontSize="10" textAnchor="middle" fill={leak ? '#fb7185' : '#c4b5fd'} fontWeight="600">meta-learner</text>
            {/* Test */}
            <rect x="60" y="120" width="160" height="20" rx="4" fill="rgba(240,171,252,0.15)" stroke="#f0abfc" strokeOpacity="0.5" />
            <text x="140" y="133" fontSize="10" textAnchor="middle" fill="#f0abfc">held-out test set</text>
            <line x1="140" y1="108" x2="140" y2="118" stroke={leak ? '#fb7185' : '#c4b5fd'} strokeWidth="0.8" markerEnd="url(#cl-arrow)" />
          </svg>
          <div className="mt-1 text-[10px] text-neutral-500 leading-snug">
            {leak
              ? <span className="text-rose-300">Validation rows fed back into base models’ in-sample predictions: meta-learner overfits to the validation distribution and you get glorious CV scores that don’t replicate.</span>
              : <span>Each fold’s OOF prediction is generated by a model that never saw that fold’s rows. Meta-learner trained only on OOF is leak-free.</span>}
          </div>
        </div>
      </div>

      <Worked title="Worked example · OOF stacking on a 5-fold walk-forward CV">
        <p>
          For each fold <Eq>{'k = 1, \\ldots, 5'}</Eq>: train base models on rows{' '}
          <Eq>{'\\{i: i \\notin k\\}'}</Eq>; predict on fold-<Eq>{'k'}</Eq> rows. Concatenate all five
          fold-predictions into one OOF prediction-per-row matrix. Train meta-learner (logistic regression
          or a tiny CatBoost) on this matrix.
        </p>
        <p>
          <strong>The discipline that prevents leakage.</strong> Walk-forward folds &mdash; later folds&apos;
          training rows must be strictly before the validation rows of earlier folds. A held-out final test
          set, never seen by base models or meta-learner, gives the honest performance estimate. Cross
          this and CV scores look amazing while live performance is random.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever you have multiple model families that disagree systematically. If your three base models
        have correlation &gt;0.95 on validation predictions, ensembling won&apos;t help much &mdash; force
        diversity by switching one to a different family (e.g. swap one CatBoost for Dixon-Coles).
      </WhenItMatters>

      <Misconception
        wrong="Stacking always beats simple averaging."
        right="Stacking strictly dominates IF the meta-learner sees clean OOF data AND has enough OOF rows to estimate weights stably. With ≤2k OOF rows or any leakage, simple averaging is more robust."
        because="The meta-learner has its own variance. With a small OOF dataset it learns weights that fit fold-specific noise; the resulting ensemble is worse than equal-weighted. The 2k-row threshold is empirical: below it, stick with weighted average; above it, stacking pays off if you can guarantee OOF cleanliness."
      />

      <Deeper>
        <p>
          <strong>Bayesian model averaging is the principled cousin of stacking.</strong>{' '}
          <Eq>{'P(y \\mid x, D) = \\sum_m P(y \\mid x, m) \\cdot P(m \\mid D)'}</Eq>. Weights are
          posterior model probabilities given data, often approximated as exp(−BIC/2) normalized. Robust
          but conservative &mdash; tends toward equal weights when models are similar.
        </p>
        <p>
          <strong>Multi-task is stacking from the other direction.</strong> Rather than train N models
          and ensemble, train ONE model with a shared backbone and N output heads (1X2, O/U, AH, BTTS,
          corners). The shared representation acts as a regularizer; each head gets less data per
          gradient update but the backbone learns from the union. On Brasileirão scale this typically
          beats any single-task model AND saves operational complexity.
        </p>
        <p>
          <strong>Residual ensembling.</strong> Train model A; train model B to predict A&apos;s residuals;
          combine. Useful when B&apos;s inductive bias captures structure A misses (e.g. CatBoost as A,
          a Dixon-Coles residual as B). Less common in production because the residual model needs its
          own CV regimen and the combined model is harder to maintain.
        </p>
        <p>
          <strong>Final-blend selection on a strict held-out set.</strong> After CV, hold out the most
          recent ~10% of fixtures as a &ldquo;final blend selection&rdquo; set. Pick ensemble weights on
          this set, ship. Without this, every weight you tune is selection-biased on CV folds &mdash;
          another flavor of <CrossLink to="selection" recap="Stability selection across folds; Boruta vs SHAP; the multiple-testing trap.">multiple-testing inflation</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'My CatBoost dominates everything else by 3%. Is ensembling worth it?',
          a: 'Yes — even adding a weak Elo-as-feature ensemble member typically nets 0.5–1% log-loss because Elo errors are uncorrelated with CatBoost errors. The point isn’t boosting your best model; it’s diversifying its blind spots.' },
        { q: 'How many base models do I need?',
          a: '3–5 across distinct families (GBDT + Bayesian + state-space + maybe NN). More than 5 hits diminishing returns and increases the meta-learner variance. Diversity > count.' },
        { q: 'Is multi-task always better than per-market models?',
          a: 'On Brasileirão scale (~1000 fixtures), multi-task beats per-market by ~2-4% on each market. On much larger data, per-market models can edge out because they have enough data to fully exploit market-specific structure.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — FEATURE SELECTION THAT WORKS
   Stability selection across folds, group-aware, adversarial validation,
   Boruta vs SHAP vs MI. The multiple-testing trap.
   ========================================================================== */

const FS_METHODS = [
  { id: 'shap',  name: 'SHAP',                desc: 'Game-theoretic per-prediction attribution; aggregate as |SHAP|.', strength: 'fast, model-faithful', weakness: 'biased toward features the model already uses' },
  { id: 'perm',  name: 'Permutation',         desc: 'Drop in score when feature is shuffled; model-agnostic.',          strength: 'unbiased, simple',     weakness: 'slow, correlated features under-attributed' },
  { id: 'bor',   name: 'Boruta',              desc: 'Shadow-features (shuffled copies) as noise floor; iterative.',     strength: 'principled stop rule', weakness: 'compute-heavy, sometimes too conservative' },
  { id: 'mi',    name: 'Mutual information',  desc: 'Model-free dependency between feature and target.',                strength: 'captures nonlinear, no model',  weakness: 'high variance on small data' },
  { id: 'stab',  name: 'Stability selection', desc: 'Run any method on B bootstrap subsamples; keep features chosen ≥π fraction of the time.', strength: 'finite-sample FDR control', weakness: 'expensive (B× cost), threshold needs tuning' },
];

// Simulated feature × fold survival pattern
const FS_FEATURES = [
  { name: 'closing_odds_implied_p',  votes: [1,1,1,1,1,1,1,1,1,1] },
  { name: 'elo_diff',                 votes: [1,1,1,1,1,1,1,1,1,1] },
  { name: 'home_xg_for_5g',           votes: [1,1,1,1,0,1,1,1,1,1] },
  { name: 'away_xg_against_5g',       votes: [1,1,1,1,1,1,0,1,1,1] },
  { name: 'home_form_pps_5g',         votes: [1,1,1,0,1,1,1,1,1,0] },
  { name: 'fixture_congestion',       votes: [1,1,0,1,1,0,1,1,1,1] },
  { name: 'manager_era',              votes: [1,1,1,0,1,1,1,0,1,1] },
  { name: 'home_advantage_team',      votes: [0,1,1,1,1,0,1,1,0,1] },
  { name: 'home_avg_goals_lifetime',  votes: [1,0,1,1,0,0,1,0,1,0] },
  { name: 'away_referee_card_rate',   votes: [0,1,0,1,0,1,0,1,0,1] },
  { name: 'home_attendance_avg',      votes: [0,0,1,0,0,1,0,0,1,0] },
  { name: 'team_id_OHE_<Sport>',      votes: [0,1,0,0,1,0,0,1,0,0] },
];

const FeatureSelectionCard = () => {
  const [pi, setPi] = useState(0.7);
  const [active, setActive] = useState('stab');

  const m = FS_METHODS.find(x => x.id === active);
  // Survival: count of votes / 10 ≥ pi
  const surviving = FS_FEATURES.filter(f => f.votes.reduce((s, v) => s + v, 0) / 10 >= pi);

  return (
    <Card id="selection" icon={Filter} title="Feature selection that actually works" accent="emerald" index={12}
          subtitle="Picking the best features is itself a hyperparameter, and most methods over-fit. Stability across folds is the discipline that survives.">
      <MinSchema>
        A feature&apos;s &ldquo;importance&rdquo; on one fold is a noisy point estimate. Use{' '}
        <Term>stability selection</Term>: keep features that survive across <em>many</em> bootstrap folds.
        Anything else is a multiple-testing trap.
      </MinSchema>

      <p>
        With 50 candidate features and 10 CV folds you have 500 importance estimates &mdash; the noise
        floor on any single one is high. Naively keeping the top-K by mean SHAP across folds
        over-selects features that happened to be useful in the modal fold; <Term>stability
        selection</Term> instead asks &ldquo;which features were chosen in <em>at least</em> π fraction of
        bootstrap subsamples?&rdquo;. Set π high (≥0.7) and you get features that genuinely transfer; set
        it low and you re-introduce noise. Pair with <Term>adversarial validation</Term> to catch
        features whose distribution differs between train and live data &mdash; a different leakage
        smell than time-leakage.
      </p>

      <Predict question="Twelve candidate features, 10 bootstrap folds, vote pattern below. With π = 0.7, how many survive?">
        ~{FS_FEATURES.filter(f => f.votes.reduce((s, v) => s + v, 0) / 10 >= 0.7).length}. Drag the threshold to see how
        many survive at different π. Notice that the highest-quality features (closing odds, Elo) survive
        every fold; the marginal ones (referee card rate, attendance) come and go.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5 mb-3">
        {FS_METHODS.map(mm => (
          <button key={mm.id} onClick={() => setActive(mm.id)}
            className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
              active === mm.id
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {mm.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 mb-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{m.name}</div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-2">{m.desc}</div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span><Chip color="emerald">strength</Chip> <span className="text-neutral-200 ml-1">{m.strength}</span></span>
          <span><Chip color="rose">weakness</Chip> <span className="text-neutral-200 ml-1">{m.weakness}</span></span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-emerald-200 font-mono">π · stability threshold</span>
          <span className="text-neutral-300 font-mono tabular-nums">{(pi * 100).toFixed(0)}%</span>
        </div>
        <input type="range" min="0.1" max="1.0" step="0.05" value={pi} onChange={(e) => setPi(parseFloat(e.target.value))} className="fc-range w-full mb-2" />

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="grid grid-cols-[180px_1fr_50px] gap-2 px-3 py-1.5 bg-white/[0.02] text-[9px] uppercase tracking-widest text-neutral-500">
            <span>feature</span>
            <span>fold votes (10)</span>
            <span className="text-right">vote rate</span>
          </div>
          {FS_FEATURES.map(f => {
            const rate = f.votes.reduce((s, v) => s + v, 0) / 10;
            const survives = rate >= pi;
            return (
              <div key={f.name} className={`grid grid-cols-[180px_1fr_50px] gap-2 px-3 py-1.5 border-t border-white/5 items-center ${survives ? 'bg-emerald-500/[0.04]' : ''}`}>
                <span className={`font-mono text-[10px] truncate ${survives ? 'text-emerald-200' : 'text-neutral-400'}`}>{f.name}</span>
                <div className="flex gap-0.5">
                  {f.votes.map((v, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${v ? (survives ? 'bg-emerald-400/70' : 'bg-violet-400/40') : 'bg-white/[0.05]'}`} />
                  ))}
                </div>
                <span className={`font-mono text-[10px] tabular-nums text-right ${survives ? 'text-emerald-200' : 'text-neutral-500'}`}>{(rate * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[10px] text-neutral-500">
          Surviving at π={pi.toFixed(2)}: <span className="font-mono text-emerald-300">{surviving.length}</span> / {FS_FEATURES.length} features.
        </div>
      </div>

      <WhenItMatters>
        Whenever you have ≥30 candidate features and a small CV (≤10 folds). The marginal cost of
        bootstrap iterations is linear; the benefit (FDR control + reproducibility) is large. A common
        pattern: ~50 candidate features → ~15-20 stable winners → CatBoost trains on those, slight
        log-loss gain, large reproducibility gain.
      </WhenItMatters>

      <Misconception
        wrong="The model with the best CV log-loss has the best feature set."
        right="It has the feature set that won the multiple-testing lottery on your specific CV folds. Stability and held-out tests separate genuine winners from lottery winners."
        because="With N feature subsets and K-fold CV, there are N × K^constants possible selection paths. The empirically-best one is biased upward. López de Prado’s ‘deflated Sharpe ratio’ formalizes the correction; in feature selection, the analogous correction is stability selection + a held-out final test set."
      />

      <Deeper>
        <p>
          <strong>Group-aware selection.</strong> When you have feature families (5 form features, 4 xG
          features, 6 market features), running per-feature selection breaks family structure &mdash; you
          might keep one feature from family X just because the others underperformed by chance. Group
          lasso, or stability selection at the family level, preserves the structural prior that families
          are coherent.
        </p>
        <p>
          <strong>Adversarial validation surfaces hidden drift.</strong> Train a classifier whose target
          is &ldquo;is this row from train or test?&rdquo;. If it can do better than 0.5 AUC, your train
          and test distributions differ. Use the classifier&apos;s feature importances to find the
          drifting features &mdash; they&apos;re the ones to drop or to recompute differently.
        </p>
        <p>
          <strong>Deflated Sharpe and feature selection.</strong> López de Prado&apos;s correction:
          <Eq>{'\\mathrm{DSR} = (\\mathrm{SR} - \\mathbb{E}[\\mathrm{SR}_{\\max}]) / \\sigma'}</Eq>{' '}
          adjusts a backtest Sharpe by the expected maximum Sharpe across the trial distribution. The
          analogous question for feature selection: is your best CV log-loss <em>better than</em> the
          expected best across the search budget? If not, your &ldquo;winning&rdquo; feature set is
          random.
        </p>
        <p>
          <strong>Selection is a hyperparameter.</strong> Method (SHAP / permutation / Boruta), threshold
          (top-K vs π-stability), and the upstream model used to score importance are all tunable. They
          should be CV&apos;d in an outer loop &mdash; otherwise you&apos;re back to the multiple-testing
          trap on the meta level. Connect to <CrossLink to="hpo" recap="Honest hyperparameter optimization with walk-forward inner CV.">honest HPO</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I just trust CatBoost’s feature_importance_?',
          a: 'For exploration, fine. For selection, no — single-fit importance is high-variance and biased toward features the model is already using. Always cross-validate the selection.' },
        { q: 'How small can I cut features without hurting?',
          a: 'On Brasileirão scale, going from 60 to 20 stable features typically loses 0.2-0.5% log-loss and gains substantial training-time + reproducibility. Going from 20 to 10 starts to hurt.' },
        { q: 'Does this matter if I have 1M rows?',
          a: 'Less. With abundant data, the noise on per-feature importance is low and naive top-K usually converges to stable selection. With Brasileirão-scale data (~10k rows), stability matters.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — HONEST HYPERPARAMETER OPTIMIZATION
   Bayesian HPO, multi-fidelity (Hyperband/ASHA), inner-CV must be walk-forward,
   calibration-aware objective, warm-starting across markets.
   ========================================================================== */

const HPO_ALGOS = [
  { id: 'rand', name: 'Random search',  color: '#a3a3a3', curve: (n) => 0.620 - 0.025 * Math.log(1 + n / 4) },
  { id: 'tpe',  name: 'Bayesian (TPE)', color: '#c4b5fd', curve: (n) => 0.620 - 0.045 * Math.log(1 + n / 3) },
  { id: 'hb',   name: 'Hyperband',      color: '#fbbf24', curve: (n) => 0.620 - 0.040 * Math.log(1 + n / 1.5) },
  { id: 'bohb', name: 'BOHB',           color: '#6ee7b7', curve: (n) => 0.620 - 0.052 * Math.log(1 + n / 1.5) },
];

const HPOCard = () => {
  const [budget, setBudget] = useState(50);
  const W = 320, H = 130, P = 24;

  return (
    <Card id="hpo" icon={Sparkles} title="Honest hyperparameter optimization" accent="amber" index={13}
          subtitle="HPO that respects time, calibration, and the multiple-testing budget. Most pipelines do at least one of these wrong.">
      <MinSchema>
        Three honesty rules. (1) Inner CV must respect time exactly like outer CV (no random k-fold inside
        a walk-forward outer). (2) Optimize calibration-aware loss, not raw loss. (3) Track total trials
        as a multiple-testing budget; the &ldquo;best&rdquo; trial is biased upward by your search width.
      </MinSchema>

      <p>
        HPO is its own search problem with its own statistics. <Term>Bayesian optimization</Term>{' '}
        (TPE/Optuna) typically beats random search by 2-3&times; in trials needed; multi-fidelity methods
        like <Term>Hyperband</Term> beat both when training is expensive (you can kill bad configs early).
        But all of them break if the inner CV uses random folds &mdash; tuned hyperparameters then
        optimize for time-leaked performance, not real performance.
      </p>

      <Predict question="200 trials of HPO. Will random search reach the same loss as TPE? How many extra trials does it need?">
        Roughly 3-5&times; more random trials to match TPE&apos;s loss at the same budget. The advantage
        widens with search-space dimensionality. Multi-fidelity methods (Hyperband/BOHB) do even better
        when each trial is expensive &mdash; they spend compute on promising configs early and kill the
        rest.
      </Predict>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-amber-200 font-mono">trials budget</span>
            <span className="text-neutral-300 font-mono tabular-nums">{budget}</span>
          </div>
          <input type="range" min="5" max="200" step="1" value={budget} onChange={(e) => setBudget(parseInt(e.target.value, 10))} className="fc-range w-full" />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
            <span>5</span><span>50</span><span>100</span><span>150</span><span>200</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full h-auto">
          {/* axes */}
          <line x1={P} y1={H - 16} x2={W - P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} y1="16" x2={P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          {/* curves */}
          {HPO_ALGOS.map((a) => {
            const pts = [];
            for (let n = 1; n <= 200; n++) {
              const v = a.curve(n);
              const x = P + (n / 200) * (W - 2 * P);
              const y = (H - 16) - ((0.620 - v) / 0.07) * (H - 32);
              pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return <polyline key={a.id} points={pts.join(' ')} fill="none" stroke={a.color} strokeWidth="1.6" opacity="0.85" />;
          })}
          {/* current budget marker */}
          {(() => {
            const x = P + (budget / 200) * (W - 2 * P);
            return (
              <g>
                <line x1={x} y1="16" x2={x} y2={H - 16} stroke="#f0abfc" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.7" />
                <text x={x} y="14" fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="monospace">{budget} trials</text>
              </g>
            );
          })()}
          {/* axis labels */}
          <text x={W / 2} y={H + 8} fontSize="9" textAnchor="middle" fill="#737373">trials</text>
          <text x="14" y="20" fontSize="9" textAnchor="middle" fill="#a3a3a3" transform="rotate(-90 14 20)">val log-loss</text>
        </svg>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HPO_ALGOS.map(a => (
            <Stat key={a.id} label={a.name} value={a.curve(budget).toFixed(3)} sub={`@ ${budget} trials`} color={a.id === 'bohb' ? 'text-emerald-300' : a.id === 'tpe' ? 'text-violet-300' : a.id === 'hb' ? 'text-amber-300' : 'text-neutral-300'} />
          ))}
        </div>
      </div>

      <Worked title="Worked example · nested walk-forward HPO">
        <p>
          Outer CV: walk-forward across 8 seasons → 8 outer folds.
          For each outer fold:
          (1) hold out the validation season;
          (2) on the training seasons, run inner walk-forward CV (3 inner folds, expanding window);
          (3) Optuna TPE picks hyperparameters that minimize <em>inner</em> walk-forward CV log-loss;
          (4) refit on full training, evaluate on outer validation.
        </p>
        <p>
          The pinned-walk-forward seed in your <code>configs/cv.yaml</code> is exactly this discipline.
          Random inner CV would let HPO tune for time-leaked performance, biasing your selected
          hyperparameters toward configs that overfit the season-boundary structure.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; HPO is the tightest place where multiple-testing inflation creeps into your
        pipeline. A 200-trial Bayesian search on the wrong inner CV will outperform a 20-trial random
        search on the right inner CV in your CV scores, then disappoint in production.
      </WhenItMatters>

      <Misconception
        wrong="More HPO trials always help."
        right="More trials inflate your selection bias. Past ~200 trials with a small CV, the marginal trial finds noise more often than signal."
        because="With B trials and finite CV variance, the maximum-CV-score over B trials grows with √log B (Jensen + Gaussian tail). At some B the inflated selection bias exceeds the marginal signal gain. For Brasileirão-scale CV, that crossover is often around B = 100–300."
      />

      <Deeper>
        <p>
          <strong>Calibration-aware HPO objective.</strong> The standard HPO objective is{' '}
          <Eq>{'\\arg\\min_\\theta \\hat{L}_{\\mathrm{CV}}(\\theta)'}</Eq>. The deployment-aligned version
          adds a calibration term: <Eq>{'\\arg\\min_\\theta \\hat{L}_{\\mathrm{CV}}(\\theta) + \\lambda \\cdot \\mathrm{ECE}(\\theta)'}</Eq>
          where ECE is expected calibration error. Forces HPO to prefer models that calibrate without a
          separate post-hoc isotonic step. Optuna supports multi-objective Pareto frontier optimization
          natively.
        </p>
        <p>
          <strong>Multi-fidelity is criminally underused.</strong> Hyperband: train each config for an
          increasing budget (e.g. 10 → 30 → 100 → 300 epochs); kill the bottom half at each rung. Total
          compute: comparable to ~3-4&times; the final-rung budget. Optuna&apos;s pruner does this with
          one extra parameter. On expensive trials (deep models on years of data), Hyperband cuts wallclock
          by 5-10&times;.
        </p>
        <p>
          <strong>Search-space design beats search algorithm.</strong> A small, well-chosen search space
          finds a great config in 50 random trials; a giant ill-conditioned space wastes 500 trials. Tips:
          log-uniform priors for learning rate &amp; regularization; nested conditionals (only search depth
          if model_type == &ldquo;deep&rdquo;); fix one parameter per family from prior knowledge (e.g.
          subsample = 0.8 is almost always fine).
        </p>
        <p>
          <strong>Warm-start across markets and seasons.</strong> Train one HPO run on the largest /
          most-data market (1X2). Use the resulting best params as the starting point for HPO on smaller
          markets (corners, BTTS). Saves 30-50% of trials per downstream market. Optuna&apos;s
          <code>enqueue_trial</code> seeds the prior config explicitly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How many HPO trials should I run?',
          a: 'For a typical CatBoost search (8-12 hyperparameters): 100-200 TPE trials, or 50-80 BOHB trials. More than that and you’re mining noise.' },
        { q: 'Can I just use the AutoML default?',
          a: 'It’s a fine baseline but ignores the time-respecting CV requirement. Always wrap AutoML inside your own walk-forward CV; never trust its internal random-split CV for time-series.' },
        { q: 'Should I tune across markets jointly or per-market?',
          a: 'Per-market for a tight final result; warm-start each market’s search with the previous market’s best config. Joint tuning across multi-task heads (one shared model) avoids the search bias entirely — see ensembling card.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   14 — DRIFT, REGIME, ONLINE UPDATING
   Feature importance over time, regime detection, online recalibration,
   model half-life. Models age; track that.
   ========================================================================== */

const DRIFT_FEATURES = [
  { name: 'closing_odds', color: '#f0abfc', series: [0.18, 0.19, 0.20, 0.20, 0.21, 0.22, 0.22, 0.21, 0.21, 0.22, 0.23, 0.23] },
  { name: 'elo_diff',     color: '#7dd3fc', series: [0.16, 0.16, 0.15, 0.15, 0.14, 0.14, 0.13, 0.13, 0.12, 0.12, 0.11, 0.11] },
  { name: 'home_xg_5g',   color: '#6ee7b7', series: [0.10, 0.10, 0.11, 0.11, 0.10, 0.09, 0.10, 0.10, 0.11, 0.10, 0.10, 0.10] },
  { name: 'away_form',    color: '#fbbf24', series: [0.09, 0.09, 0.08, 0.07, 0.07, 0.06, 0.05, 0.05, 0.04, 0.04, 0.03, 0.03] },
];

const DriftCard = () => {
  const [refit, setRefit] = useState(6); // months between refit
  const seasonHalfLife = 18; // months
  const decayPctPerMonth = 0.4;
  // Toy: log-loss penalty for staying with stale model = decay × months_since_refit
  const stalePct = decayPctPerMonth * (refit - 1);
  const W = 320, H = 130, P = 28;

  return (
    <Card id="drift" icon={Hourglass} title="Drift, regime, online updating" accent="cyan" index={14}
          subtitle="Models age. Feature importance shifts. Periodic refit beats continuous online for most pipelines, but you have to know when to retrain and when to detect a regime change.">
      <MinSchema>
        A trained model is a snapshot of the data-generating process at training time. The DGP changes
        (new managers, rule changes, market structure shifts). Track <em>per-feature importance over
        time</em>; refit at a cadence; alert on regime change.
      </MinSchema>

      <p>
        Three things drift in football models. (a) <Term>Concept drift</Term>: the relationship between
        features and outcomes changes (e.g. home advantage post-COVID). (b) <Term>Data drift</Term>: the
        feature distribution itself changes (lineup data quality improves; new tracking providers). (c)
        Regime breaks: discrete shifts (rule change, COVID empty stadiums). The right response is
        different for each &mdash; periodic refit handles slow drift; <Term>change-point detection</Term>
        catches regime breaks; online updating handles fast-moving markets like in-play.
      </p>

      <Predict question="Drag the refit cadence. How does staying-with-stale-model log-loss compare to refitting every month?">
        Roughly linear penalty: ~{(decayPctPerMonth * 100).toFixed(0)} basis points of log-loss per stale
        month for Brasileirão-style 1X2 models. At 6-month refit you&apos;ve given up ~{stalePct.toFixed(1)}%
        log-loss vs the monthly refit. The break-even depends on retrain cost &mdash; if a refit takes
        an hour, monthly is fine; if it takes a week of engineering, quarterly is the sweet spot.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {/* Feature importance over time */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 text-center">feature importance over 12 months</div>
          <svg viewBox={`0 0 ${W} ${H + 12}`} className="w-full h-auto">
            <line x1={P} y1={H - 16} x2={W - P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
            {DRIFT_FEATURES.map((f) => {
              const pts = f.series.map((v, i) => {
                const x = P + (i / (f.series.length - 1)) * (W - 2 * P);
                const y = (H - 16) - (v / 0.25) * (H - 32);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <g key={f.name}>
                  <polyline points={pts.join(' ')} fill="none" stroke={f.color} strokeWidth="1.5" opacity="0.85" />
                  <circle cx={P + (W - 2 * P)} cy={(H - 16) - (f.series[f.series.length - 1] / 0.25) * (H - 32)} r="2.5" fill={f.color} />
                </g>
              );
            })}
            {[0, 3, 6, 9, 12].map(m => (
              <text key={m} x={P + (m / 12) * (W - 2 * P)} y={H} fontSize="8" textAnchor="middle" fill="#737373">{m}m</text>
            ))}
            <text x="16" y="20" fontSize="9" textAnchor="middle" fill="#a3a3a3" transform="rotate(-90 16 20)">SHAP |·|</text>
          </svg>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {DRIFT_FEATURES.map(f => (
              <span key={f.name} className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5" style={{ background: f.color }} />
                <span style={{ color: f.color }} className="font-mono">{f.name}</span>
              </span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 leading-snug">
            <span className="text-amber-300">away_form</span> is decaying — its info is being subsumed by
            other features. Time to drop it, or to investigate whether something structural changed.
          </div>
        </div>

        {/* Refit cadence */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">refit cadence (months)</div>
          <input type="range" min="1" max="12" step="1" value={refit} onChange={(e) => setRefit(parseInt(e.target.value, 10))} className="fc-range w-full mb-2" />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            {[1,3,6,9,12].map(m => <span key={m}>{m}m</span>)}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Stat label="cadence" value={`${refit}m`} sub={`refit every ${refit} month${refit === 1 ? '' : 's'}`} color="text-cyan-300" />
            <Stat label="stale loss" value={`+${stalePct.toFixed(1)}%`} sub="vs monthly refit" color={stalePct > 1.5 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="model ½-life" value={`${seasonHalfLife}m`} sub="empirical, Brasileirão" color="text-neutral-300" />
            <Stat label="suggested" value="3m" sub="quarterly is the sweet spot" color="text-emerald-300" />
          </div>
        </div>
      </div>

      <Worked title="Worked example · CUSUM change-point alert">
        <p>
          Track residual deviance per fixture: <Eq>{'r_i = -\\log p_i(y_i)'}</Eq>. Define the CUSUM
          statistic <Eq>{'S_t = \\max(0, S_{t-1} + r_t - \\bar{r})'}</Eq> with{' '}
          <Eq>{'\\bar{r}'}</Eq> the rolling mean. Alert when <Eq>{'S_t > h'}</Eq> for a tuned threshold
          (set so the false-alarm rate is one per ~50 fixtures).
        </p>
        <p>
          When the alarm fires: run the per-feature drift report, isolate which feature is responsible,
          decide whether to refit, recompute the feature, or accept the regime as new normal. CUSUM is
          the cheapest reasonable change-point detector; Bayesian online change-point (BOCPD) is the
          principled alternative.
        </p>
      </Worked>

      <WhenItMatters>
        Production. A perfectly-tuned model going stale silently is the most common cause of live
        underperformance. Even with a quarterly refit cadence, alarming on regime breaks catches the 5%
        of cases where waiting for the next quarter loses you a season&apos;s edge.
      </WhenItMatters>

      <Misconception
        wrong="If it worked last season, it’ll work this season."
        right="Brasileirão-style 1X2 models lose about 0.4% of log-loss per stale month, monotonically. A model that wasn’t refit since pre-COVID is essentially worthless."
        because="The DGP shifts: managers turn over, key players move, the market itself adapts. The shift is small per match but compounds. Empirical half-life on Brasileirão models is ~18 months; on in-play models ~3 months."
      />

      <Deeper>
        <p>
          <strong>Online learning vs periodic refit.</strong> True online (gradient steps per fixture) is
          rarely worth it for pre-match models &mdash; the per-step variance is too high relative to the
          slow drift rate. Online <em>recalibration</em> (re-fitting an isotonic layer monthly) IS worth it,
          and cheap. Online <em>updating of base models</em> only pays off in fast-moving regimes (in-play,
          markets with weekly mechanics changes).
        </p>
        <p>
          <strong>Regime indicators worth monitoring.</strong> Per-feature SHAP variance, per-feature
          calibration ECE, per-stake CLV trend, average closing-line vs your-line gap. Plot all four
          monthly; any of them moving more than 2σ is a flag.
        </p>
        <p>
          <strong>Bayesian online change-point detection.</strong> BOCPD (Adams &amp; MacKay 2007)
          maintains a posterior over &ldquo;current run length&rdquo;, where a run is a stretch of stable
          regime. Good when you want a graded probability of regime change rather than a hard alarm.
          Cost: <Eq>{'O(t)'}</Eq> per step, manageable for monthly aggregation.
        </p>
        <p>
          <strong>Refit budget is the actual lever.</strong> The honest cadence is whatever your
          retraining infrastructure can sustain reliably. Quarterly + ad-hoc on alarm is robust;
          monthly + alarm is better if you can afford it. The user&apos;s{' '}
          <span className="text-fuchsia-300">betting-vibe-04</span> content-addressed run registry
          (good!) makes both refits and rollbacks cheap; that&apos;s the infrastructure unlock.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I always refit on the latest data only?',
          a: 'No — discard nothing. Use a long training window (3-5 seasons) with optional time-decay weights. The recency benefit is largely captured by walk-forward CV; throwing away history loses long-tail signal.' },
        { q: 'How do I detect drift before live performance suffers?',
          a: 'Monitor in-flight: CUSUM on residual deviance, SHAP variance, calibration ECE on the latest 100 fixtures. Drift usually shows up in monitoring 1-2 months before live results sag.' },
        { q: 'Is concept drift bigger between seasons or within?',
          a: 'Between, by ~3-5×. Mid-season managerial turnover causes the largest within-season jumps; transfer windows cause discrete inter-season shifts. The most expensive moment for a stale model is the first 5 fixtures of a new season.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   15 — RL FOR PORTFOLIO BET SELECTION
   Reframes deployment as a sequential decision under uncertainty.
   Contextual-bandit framing of "which bets to take from a slate of N".
   Bridges to the future Bettor's Stack.
   ========================================================================== */

// Toy slate of 8 candidate bets across 3 fixtures, with edge, kelly, corr group.
const SLATE = [
  { id: 1, fixture: 'PAL × FLA',  market: '1X2 Home',   edge: 0.041, kelly: 0.022, corr: 'A' },
  { id: 2, fixture: 'PAL × FLA',  market: 'O 2.5',      edge: 0.025, kelly: 0.015, corr: 'A' },
  { id: 3, fixture: 'PAL × FLA',  market: 'BTTS Yes',   edge: 0.013, kelly: 0.008, corr: 'A' },
  { id: 4, fixture: 'CRU × COR',  market: '1X2 Away',   edge: 0.038, kelly: 0.020, corr: 'B' },
  { id: 5, fixture: 'CRU × COR',  market: 'AH +0.5 H',  edge: 0.028, kelly: 0.017, corr: 'B' },
  { id: 6, fixture: 'GRE × INT',  market: '1X2 Draw',   edge: 0.052, kelly: 0.027, corr: 'C' },
  { id: 7, fixture: 'GRE × INT',  market: 'U 2.5',      edge: 0.022, kelly: 0.013, corr: 'C' },
  { id: 8, fixture: 'BAH × FLU',  market: '1X2 Home',   edge: 0.011, kelly: 0.006, corr: 'D' },
];

const PORTFOLIO_POLICIES = [
  { id: 'naive', name: 'Greedy by EV',          desc: 'Take any bet with edge > threshold. Ignores correlation and total risk.' },
  { id: 'kelly', name: 'Per-bet fractional Kelly', desc: 'Stake each by Kelly × 0.25, cap at max stake. Ignores correlation across legs.' },
  { id: 'opt',   name: 'Correlation-aware MVO', desc: 'Mean–variance optimization across the slate; downweights correlated legs.' },
  { id: 'ts',    name: 'Thompson sampling',     desc: 'Sample model parameters from posterior, act greedily. Self-balances exploration.' },
];

const RLPortfolioCard = () => {
  const [edgeThr, setEdgeThr] = useState(0.025);
  const [maxCorr, setMaxCorr] = useState(true);
  const [policy, setPolicy] = useState('opt');

  const filt = SLATE.filter(s => s.edge >= edgeThr);
  // Correlation-aware: take at most 1 per corr group, prefer highest edge
  let chosen = filt;
  if (maxCorr) {
    const byGroup = new Map();
    for (const s of [...filt].sort((a, b) => b.edge - a.edge)) {
      if (!byGroup.has(s.corr)) byGroup.set(s.corr, s);
    }
    chosen = Array.from(byGroup.values());
  }
  const totalStake = chosen.reduce((s, c) => s + c.kelly, 0);
  const totalEdge = chosen.reduce((s, c) => s + c.edge * c.kelly, 0);

  return (
    <Card id="rl" icon={Target} title="RL for portfolio bet selection" accent="rose" index={15}
          subtitle="The deployment decision is sequential and under uncertainty. Contextual bandits and RL frame it correctly; greedy-by-EV doesn’t.">
      <MinSchema>
        Deployment is not &ldquo;take every +EV bet&rdquo;. It&apos;s a slate-decision problem: which
        subset of N candidate bets to take, sized how, given <em>correlation</em>, <em>budget</em>, and{' '}
        <em>parameter uncertainty</em>. <Term>Contextual bandit</Term> &amp; <Term>Thompson sampling</Term>
        are the right tools.
      </MinSchema>

      <p>
        Your model produces calibrated probabilities for many markets. Your bookmaker offers many
        markets per fixture. Naively, you&apos;d take every bet whose edge clears a threshold. But the
        bets correlate (Home win + Over 2.5 + BTTS-Yes are nearly the same trade), the bookmaker may
        limit your stakes, and your edge estimates have parameter uncertainty. The right framing is a
        sequential decision under uncertainty &mdash; a contextual bandit at minimum, full RL when state
        transitions matter (in-play, evolving bankroll). This card is the bridge to the future{' '}
        <em>Bettor&apos;s Stack</em> sibling explainer.
      </p>

      <Predict question="Toggle the correlation-aware switch. How many bets does the policy take from the slate of 8? How much total stake?">
        Greedy takes everything above threshold; correlation-aware takes one per fixture (correlated
        legs are essentially the same trade, paying you twice for one bet). The ROI is similar; the
        variance is half.
      </Predict>

      <div className="mt-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-200 font-mono">edge threshold</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(edgeThr * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.060" step="0.005" value={edgeThr} onChange={(e) => setEdgeThr(parseFloat(e.target.value))} className="fc-range w-full" />
          </div>
          <label className="flex items-center gap-2 text-[12px] cursor-pointer">
            <input type="checkbox" checked={maxCorr} onChange={(e) => setMaxCorr(e.target.checked)} className="accent-rose-400" />
            <span className={maxCorr ? 'text-rose-200' : 'text-neutral-400'}>correlation-aware (1 per fixture)</span>
          </label>
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_70px_70px_50px] gap-2 px-3 py-1.5 bg-white/[0.02] text-[9px] uppercase tracking-widest text-neutral-500">
            <span>fixture</span>
            <span>market</span>
            <span className="text-right">edge</span>
            <span className="text-right">¼Kelly</span>
            <span className="text-right">take</span>
          </div>
          {SLATE.map(s => {
            const taken = chosen.includes(s);
            const passed = filt.includes(s) && !taken;
            return (
              <div key={s.id} className={`grid grid-cols-[1fr_1fr_70px_70px_50px] gap-2 px-3 py-1.5 border-t border-white/5 items-center text-[11px] ${taken ? 'bg-emerald-500/[0.06]' : passed ? 'bg-amber-500/[0.04]' : ''}`}>
                <span className={`font-mono ${taken ? 'text-emerald-200' : 'text-neutral-300'}`}>{s.fixture}</span>
                <span className={taken ? 'text-emerald-200' : 'text-neutral-300'}>{s.market}</span>
                <span className="font-mono text-right text-neutral-300 tabular-nums">{(s.edge * 100).toFixed(1)}%</span>
                <span className="font-mono text-right text-neutral-300 tabular-nums">{(s.kelly * 100).toFixed(1)}%</span>
                <span className={`text-right font-mono ${taken ? 'text-emerald-300' : passed ? 'text-amber-300' : 'text-neutral-600'}`}>{taken ? '✓' : passed ? '∼' : '·'}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="bets taken" value={chosen.length} sub={`of ${SLATE.length} candidates`} color="text-rose-200" />
          <Stat label="total stake" value={`${(totalStake * 100).toFixed(1)}%`} sub="of bankroll, ¼Kelly" color="text-neutral-100" />
          <Stat label="exp. log-g" value={`+${(totalEdge * 100).toFixed(2)}%`} sub="upper bound, no corr" color="text-emerald-300" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PORTFOLIO_POLICIES.map(pp => (
            <button key={pp.id} onClick={() => setPolicy(pp.id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                policy === pp.id
                  ? 'bg-rose-500/15 border-rose-400/40 text-rose-100'
                  : 'border-white/10 text-neutral-400 hover:bg-white/5'
              }`}>
              {pp.name}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-neutral-300 leading-snug">
          {PORTFOLIO_POLICIES.find(p => p.id === policy).desc}
        </div>
      </div>

      <Worked title="Worked example · Thompson sampling for slate selection">
        <p>
          For each candidate bet, your model gives a posterior over the true probability{' '}
          <Eq>{'p \\sim \\mathrm{Beta}(\\alpha, \\beta)'}</Eq> (or a Bayesian model&apos;s posterior).
          For each decision: sample <Eq>{'\\tilde{p}'}</Eq> from the posterior, compute the implied
          Kelly fraction at the offered odds, take the bet if the sampled fraction is positive. Repeat
          per fixture/market.
        </p>
        <p>
          <strong>Why this works.</strong> Thompson sampling matches probability of action to posterior
          probability of being optimal &mdash; near-optimal regret in many bandit settings. It also
          self-shrinks: when the posterior is wide (uncertain), it acts cautiously; when sharp, it
          commits. No explicit fractional-Kelly tuning needed.
        </p>
      </Worked>

      <WhenItMatters>
        Anywhere you take more than one bet per fixture or have non-trivial correlation across slates.
        For pure single-bet single-fixture setups, fractional Kelly is enough. For multi-market multi-bet
        production, contextual-bandit policies measurably beat &ldquo;every +EV bet&rdquo;.
      </WhenItMatters>

      <Misconception
        wrong="Take every bet whose model edge exceeds the vig."
        right="Greedy-by-EV ignores correlation, parameter uncertainty, and stake limits. Correlation-aware sizing routinely beats greedy-EV by 30-50% in realized log-growth on the same model."
        because="Three legs that pay correlated outcomes give you ~1.2× the risk for ~1× the EV — your variance balloons faster than your edge. Correlation-aware portfolio sizing is the operational layer between ‘model edge’ and ‘realized growth’."
      />

      <Deeper>
        <p>
          <strong>Contextual bandit framing.</strong> At each fixture <Eq>{'t'}</Eq>, observe context{' '}
          <Eq>{'x_t'}</Eq> (model probabilities, offered odds, available markets). Pick action{' '}
          <Eq>{'a_t \\subseteq \\{1, \\ldots, K\\}'}</Eq> (a subset of bets) and stake vector{' '}
          <Eq>{'s_t \\in \\mathbb{R}_+^{|a_t|}'}</Eq>. Receive reward{' '}
          <Eq>{'r_t = \\log(1 + \\sum_i s_{t,i} \\cdot \\mathrm{ret}_{t,i})'}</Eq>. Maximize
          discounted cumulative reward. No state transitions = bandit; with bankroll-state and
          line-state evolution = full RL.
        </p>
        <p>
          <strong>Mean&ndash;variance with correlation.</strong> If your stake vector is{' '}
          <Eq>{'\\mathbf{s}'}</Eq>, expected return is <Eq>{'\\boldsymbol{\\mu}^\\top \\mathbf{s}'}</Eq>{' '}
          and variance <Eq>{'\\mathbf{s}^\\top \\Sigma \\mathbf{s}'}</Eq>. Maximize{' '}
          <Eq>{'\\boldsymbol{\\mu}^\\top \\mathbf{s} - \\frac{\\lambda}{2} \\mathbf{s}^\\top \\Sigma \\mathbf{s}'}</Eq>{' '}
          subject to <Eq>{'\\sum s_i \\leq B'}</Eq> (bankroll cap). Closed form via QP. Choose{' '}
          <Eq>{'\\lambda'}</Eq> to recover the fractional-Kelly equivalent (Markowitz-style).
        </p>
        <p>
          <strong>The bridge to Bettor&apos;s Stack.</strong> Three things this card flags but doesn&apos;t
          fully unpack: <em>full Kelly geometry &amp; fractional shrinkage</em>, <em>vig removal &amp;
          true odds</em>, <em>CLV as the only honest edge metric</em>. All three live in the planned
          sibling. Together with this card, they close the loop from model → deployed bet → realized growth.
        </p>
        <p>
          <strong>Connection to in-play.</strong> In-play markets evolve continuously; the right framing
          is full RL with a state that includes &ldquo;current odds&rdquo; and &ldquo;remaining match
          time&rdquo;. The pre-computed bandit policy from above is the warm-start; the live policy
          updates per minute. See <CrossLink to="inplay" recap="In-play / live modeling: state-tracking, Markov games, intensity models.">in-play</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'I bet on multiple markets per fixture today. Am I doing it wrong?',
          a: 'Probably yes — unless you’re explicitly accounting for correlation. The cleanest fix is a per-fixture cap (1 bet per fixture, the highest-EV one); a more sophisticated fix is correlation-aware portfolio sizing across the full weekly slate.' },
        { q: 'Is RL overkill for pre-match betting?',
          a: 'For pre-match-only with no bankroll-state effects, yes — contextual bandit (no transitions) suffices. Full RL pays off for in-play, large bankrolls relative to market depth, or any setting where your stakes affect future odds.' },
        { q: 'How does this connect to the Kelly card I’ll see in the Bettor’s Stack?',
          a: 'Kelly is the optimal-stake math for a single bet under known edge. This card is the optimal-portfolio math for many bets with uncertain edge and correlation. Kelly is a special case (1 bet, known p); contextual bandit is the general case.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   16 — BOUNDARY & PROJECT MAP (synthesis spine card)
   Diagnostic table: each Act × {trustworthy / leaky / overkill / unmeasured /
   project-action}. Each row mapped to a file in betting-vibe-04. The card the
   reader (= the user) returns to to decide what to fix next.
   ========================================================================== */

const PROJECT_ROWS = [
  { card: 'loss', act: 'I',  topic: 'Loss alignment',
    where: 'src/models/catboost_runner.py uses log-loss; calibration via src/models/calibration.py (post-hoc).',
    state: 'partial',
    next: 'Add Kelly-aware custom CatBoost objective; A/B vs current. ~3 days.',
    file: 'src/models/catboost_runner.py' },
  { card: 'info', act: 'I',  topic: 'Information hypothesis',
    where: 'configs/feature_sets.yaml lists feature families; market odds presence varies by tier.',
    state: 'partial',
    next: 'Ensure closing-odds implied probabilities are in every tier’s feature set; train residual model.',
    file: 'configs/feature_sets.yaml' },
  { card: 'features', act: 'II', topic: 'Feature engineering',
    where: 'src/features/family_modules/_shared.py owns the leakage-safe rolling primitives (good).',
    state: 'good',
    next: 'Add lineup-embedding feature pipeline; align extraction to T-1h before kickoff.',
    file: 'src/features/family_modules/' },
  { card: 'causal', act: 'II', topic: 'Causal lens',
    where: 'No explicit DAG; manager-era and squad-aware features in experiments/squad_aware.',
    state: 'gap',
    next: 'Promote squad_aware to production tier; add manager_era as first-class feature.',
    file: 'experiments/squad_aware/' },
  { card: 'ssl', act: 'II', topic: 'SSL pretraining',
    where: 'Not present.',
    state: 'gap',
    next: 'Phase 0: tokenize event streams, pretrain a 5M-param transformer, freeze-fine-tune.',
    file: '(new) src/features/ssl/' },
  { card: 'synth', act: 'II', topic: 'Synthetic data',
    where: 'Not present in main pipeline; could land in experiments/.',
    state: 'gap',
    next: 'Bootstrap variance estimates around CV log-loss for the deflated-Sharpe correction.',
    file: '(new) experiments/synth_bootstrap/' },
  { card: 'transfer', act: 'II', topic: 'Transfer across leagues',
    where: 'Single-league (Brasileirão); no source-league pretraining.',
    state: 'gap',
    next: 'Add Libertadores + La Liga to a shared pretrain set; per-league bias term.',
    file: 'configs/tiers.yaml' },
  { card: 'zoo', act: 'III', topic: 'Modeling zoo',
    where: 'Single CatBoost family; configs/models/catboost_match_result.yaml.',
    state: 'partial',
    next: 'Add Dixon-Coles baseline (cheap); ensemble at the meta-learner stage.',
    file: 'configs/models/' },
  { card: 'distributional', act: 'III', topic: 'Distributional forecasting',
    where: 'Per-market models per configs/feature_sets.yaml — not joint distributional.',
    state: 'partial',
    next: 'Train one NGBoost per fixture for joint goals; derive markets analytically.',
    file: 'src/models/' },
  { card: 'inplay', act: 'III', topic: 'In-play / live',
    where: 'Not present.',
    state: 'gap',
    next: 'Out of scope for current pre-match pipeline; planned future explainer expansion.',
    file: '(future)' },
  { card: 'ensembling', act: 'IV', topic: 'Ensembling',
    where: 'Stacking via experiments/ensemble_meta_bootstrap; not yet promoted to main pipeline.',
    state: 'partial',
    next: 'Promote ensemble_meta_bootstrap to src/models/ensemble.py with strict OOF discipline.',
    file: 'experiments/ensemble_meta_bootstrap/' },
  { card: 'selection', act: 'IV', topic: 'Feature selection',
    where: 'src/features/selection/ does per-fold selection — close to stability selection already.',
    state: 'good',
    next: 'Add stability threshold π and a deflated-Sharpe-style correction in the report.',
    file: 'src/features/selection/' },
  { card: 'hpo', act: 'IV', topic: 'Honest HPO',
    where: 'tests/contracts/test_hyperparam_search_isolation.py pins inner-fold isolation (excellent).',
    state: 'good',
    next: 'Move from grid/random to TPE (Optuna); enable Hyperband pruning for trial speedup.',
    file: 'src/cli/train.py' },
  { card: 'drift', act: 'V', topic: 'Drift / online',
    where: 'Run registry (runs/registry.sqlite) gives lineage but no drift monitoring.',
    state: 'partial',
    next: 'Per-fixture residual deviance + CUSUM in src/cli/backtest; alert above threshold.',
    file: 'src/cli/backtest/' },
  { card: 'rl', act: 'V', topic: 'RL portfolio',
    where: 'src/cli/backtest computes Kelly per-bet; no portfolio / correlation layer.',
    state: 'partial',
    next: 'Add correlation-aware MVO over per-fixture slate; ablate vs greedy-EV in backtest.',
    file: 'src/cli/backtest/' },
];

const STATE_STYLE = {
  good:    { label: 'good',    color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30' },
  partial: { label: 'partial', color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-400/30' },
  gap:     { label: 'gap',     color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-400/30' },
};

const BoundaryCard = () => {
  const [hover, setHover] = useState(null);
  const counts = PROJECT_ROWS.reduce((s, r) => { s[r.state]++; return s; }, { good: 0, partial: 0, gap: 0 });
  return (
    <Card id="boundary" icon={Crosshair} title="Boundary &amp; project map" accent="fuchsia" index={16} anchor
          subtitle="Each card mapped to a file in betting-vibe-04 and to a current state. The map you return to when deciding what to fix first.">
      <MinSchema>
        Three categories per row: <span className="text-emerald-300">good</span> (keep, polish),{' '}
        <span className="text-amber-300">partial</span> (working but unfinished),{' '}
        <span className="text-rose-300">gap</span> (not present, defer or ship). Sort the gaps by
        <em> expected log-growth gain per engineering-day</em>.
      </MinSchema>

      <p>
        This is the synthesis card. Every other card in the explainer maps to a row here; every row maps
        to a file in your <span className="text-fuchsia-300">betting-vibe-04</span> repo. Hover any row
        for the per-card recap; click a state chip to filter. The honest answer to &ldquo;what should I
        work on next?&rdquo; is: pick the highest-impact <span className="text-rose-300">gap</span> or
        the lowest-effort <span className="text-amber-300">partial</span> &mdash; in that order.
      </p>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="good" value={counts.good} sub="keep, polish" color="text-emerald-300" />
        <Stat label="partial" value={counts.partial} sub="finish or extend" color="text-amber-300" />
        <Stat label="gap" value={counts.gap} sub="ship or defer" color="text-rose-300" />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_70px] gap-2 px-3 py-1.5 bg-white/[0.02] text-[9px] uppercase tracking-widest text-neutral-500">
          <span>card</span>
          <span>topic / file / next action</span>
          <span className="text-right">state</span>
        </div>
        {PROJECT_ROWS.map(r => {
          const s = STATE_STYLE[r.state];
          return (
            <div key={r.card}
              onMouseEnter={(e) => setHover({ row: r, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ row: r, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className={`grid grid-cols-[60px_1fr_70px] gap-2 px-3 py-2 border-t border-white/5 items-start text-[11px] ${hover?.row === r ? 'bg-white/[0.04]' : ''}`}>
              <div className="flex flex-col">
                <CrossLink to={r.card} recap={`Jump to ${r.topic} (Act ${r.act}).`}>{r.card}</CrossLink>
                <span className="font-mono text-[9px] text-neutral-600 mt-0.5">Act {r.act}</span>
              </div>
              <div className="min-w-0">
                <div className="text-neutral-100 font-medium">{r.topic}</div>
                <div className="font-mono text-[10px] text-neutral-400 truncate">{r.file}</div>
                <div className="text-[11px] text-neutral-300 leading-snug mt-0.5">{r.next}</div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${s.bg} ${s.color} ${s.border}`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <FloatingTip
        hover={hover}
        width={360}
        render={(h) => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">{h.row.topic} · current state</div>
            <div className="text-neutral-200 leading-snug">{h.row.where}</div>
          </div>
        )}
      />

      <Deeper>
        <p>
          <strong>Where to start (one operator&apos;s order).</strong> The four highest-leverage moves
          for <span className="text-fuchsia-300">betting-vibe-04</span> based on the map:
          (1) <em>Add closing-odds implied probabilities to every tier&apos;s feature set</em>{' '}
          (Card 02 → instant log-loss reduction).
          (2) <em>Promote squad_aware to production</em> (Card 04 → addresses lineup-as-confounder).
          (3) <em>Move HPO to TPE + Hyperband</em> (Card 13 → 3&times; faster search).
          (4) <em>Add CUSUM + per-fold drift report to backtest</em> (Card 14 → catches stale models early).
        </p>
        <p>
          <strong>What this explainer doesn&apos;t cover.</strong> The explicit gap list is the
          forthcoming <em>Bettor&apos;s Stack</em>: vig removal &amp; true probabilities, Kelly geometry
          &amp; fractional shrinkage, walk-forward CV deep-dive, CLV as the truth-meter. The boundary
          card here gives you the modeling-craft picture; the sibling will give you the bettor-craft
          picture; together they close the loop.
        </p>
        <p>
          <strong>Reading discipline.</strong> Don&apos;t try to fix everything. Pick one row per quarter,
          ship the change, measure CLV impact, decide whether to deepen or move on. Every row above is
          designed to take 1-3 weeks of work; the synthesis-card &ldquo;everything&rdquo; would take a
          year.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where does the user’s project sit, on average?',
          a: `${counts.good} good · ${counts.partial} partial · ${counts.gap} gap. The project has strong infrastructure (run lineage, leakage lint, walk-forward defaults) and the typical gaps for a single-league single-modality pipeline (no SSL, no transfer, no portfolio layer).` },
        { q: 'What’s the ONE thing to fix next?',
          a: 'Closing-odds implied probabilities as a feature in every tier (Card 02 → Card 03). It’s ~1 day of work and routinely halves the log-loss gap to the market. Everything else compounds on top.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   17 — NEXT TRAILS
   ========================================================================== */

const NextTrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainers, depth, foundations, and the wider arena" accent="violet" index={17}>
    <MinSchema>
      The Forecaster&apos;s Craft is one half of the loop &mdash; how to build a model that earns edge.
      The other half is the Bettor&apos;s Stack &mdash; how to deploy that edge into bankroll growth.
      Each card in this explainer can also be expanded into its own deep-dive.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers in this series',
        note: 'in this sandbox',
        items: [
          { label: 'The Bettor’s Stack (planned)', note: 'Vig removal, fair odds, Kelly geometry & fractional shrinkage, walk-forward CV deep-dive, CLV as truth-meter, multiple-testing inflation, deflated Sharpe. Pairs 1:1 with this explainer.' },
          { label: 'Forecasting Noisy Series', href: '#statistical-forecasting', note: 'The general statistical/ML forecasting toolkit (decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal prediction). Many of the ideas here apply directly.' },
          { label: 'Superforecasting', href: '#superforecasting', note: 'Calibration, base rates, Fermi, Bayesian updating — the human / judgmental side of probability.' },
          { label: 'Deep Uncertainty', href: '#deep-uncertainty', note: 'When probabilities themselves don’t apply: scenario planning, RDM, real options. The complement to everything in this explainer.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'one level of detail down per card',
        items: [
          { label: 'López de Prado · Advances in Financial ML', note: 'The canonical reference for honest CV, deflated Sharpe, hierarchical risk parity, meta-labeling. Most of the ideas in this explainer trace back here.', external: true },
          { label: 'Dixon & Coles (1997) · Modelling Football Scores', note: 'The foundational paper for parametric football scoreline models. 30 years old, still the right baseline.', external: true },
          { label: 'Pinnacle Closing Line studies', note: 'Empirical work on why beating Pinnacle’s closing line is necessary and sufficient for long-run profit.', external: true },
          { label: 'Optuna + Hyperband paper', note: 'The right framework for honest HPO with multi-fidelity scheduling.', external: true },
          { label: 'StatsBomb Open Data', note: 'Free event-stream data for several leagues (incl. some Brasileão). The starting point for SSL pretraining.', external: true },
          { label: 'NGBoost paper (Duan et al. 2020)', note: 'Distributional gradient boosting — the modern way to predict per-fixture outcome distributions.', external: true },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math under the hood',
        items: [
          { label: 'Information theory · Cover & Thomas', note: 'KL divergence, mutual information, Kelly’s gambling theorem (chapter 6). The math that grounds the information hypothesis.' },
          { label: 'Bayesian inference & probabilistic programming', note: 'Stan, NumPyro, PyMC. The toolkit for hierarchical models, partial pooling, posterior simulation.' },
          { label: 'Reinforcement learning · Sutton & Barto', note: 'For the RL portfolio card and the in-play state-tracking framing.' },
          { label: 'Causal inference · Pearl, Hernán & Robins', note: 'DAGs, do-calculus, instrumental variables, sensitivity analysis. The substrate for the causal-lens card.' },
          { label: 'Time series · Hyndman & Athanasopoulos (FPP3)', note: 'Walk-forward CV, time-respecting evaluation, the forecasting toolkit.' },
        ],
      },
      {
        title: 'Zoom out · domains where this matters',
        note: 'the same toolkit, different stakes',
        items: [
          { label: 'Quantitative finance', note: 'Same loss-alignment / market-orthogonal-info / multiple-testing / drift / portfolio problems, larger scale and stakes.' },
          { label: 'Sports analytics broadly', note: 'NBA, NFL, MLB. Different mechanics (more possessions, smaller teams) but same modeling craft.' },
          { label: 'E-sports & prediction markets', note: 'Polymarket, Kalshi. Liquidity is lower, edges are larger, info asymmetry is higher.' },
          { label: 'AB testing & online experimentation', note: 'Same multiple-testing trap, same calibration concerns, same need for honest CV.' },
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
        <span className="text-fuchsia-300">L&oacute;pez de Prado &middot; Adv. in Financial ML</span>
        <span className="text-violet-300">Dixon &amp; Coles 1997</span>
        <span className="text-sky-300">Pinnacle &middot; closing-line studies</span>
        <span className="text-emerald-300">M5 / Kaggle football comps</span>
        <span className="text-amber-300">Optuna &middot; Hyperband &middot; ASHA</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sibling explainer planned: <em>The Bettor&apos;s Stack</em> &mdash; vig removal,
        Kelly geometry, walk-forward CV, and CLV as truth-meter.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function ForecastersCraftExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].fc-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].fc-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #f0abfc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(240,171,252,0.4);
        }
        input[type=range].fc-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #f0abfc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <LossAlignmentCard />
        <InformationHypothesisCard />
        <FeatureEngineeringCard />
        <CausalLensCard />
        <SSLPretrainCard />
        <SyntheticDataCard />
        <TransferLearningCard />
        <ModelZooCard />
        <DistributionalCard />
        <InPlayCard />
        <EnsemblingCard />
        <FeatureSelectionCard />
        <HPOCard />
        <DriftCard />
        <RLPortfolioCard />
        <BoundaryCard />
        <NextTrailsCard />
      </main>

      <Footer />
    </div>
  );
}
