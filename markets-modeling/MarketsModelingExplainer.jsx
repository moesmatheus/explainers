import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, BarChart3, Boxes, BrainCircuit, ChevronDown,
  CircleDollarSign, Compass, Crosshair, Eye, EyeOff, Filter, FlaskConical,
  Gauge, GitBranch, Hash, HelpCircle, Hourglass, Layers, LineChart, Lightbulb,
  Link2, Network, Quote, Radar, Repeat, Ruler, Scale, ScrollText, ShieldAlert,
  Sigma, Sparkles, Star, Target, Telescope, TrendingUp, TrendingDown, Waves,
  Workflow, Zap, CheckCircle2, XCircle, Lock, Layers3, Binary, Wand2,
  CircuitBoard, Atom, FunctionSquare, MoveDown, Box, Dices,
} from 'lucide-react';

/* ============================================================================
   Modeling Markets · basic to SOTA
   The modeling-side companion to retail-quant. Walks from the random-walk null
   up to transformer-on-orderbook SOTA. Each card adds ONE realistic feature to
   the prior model.
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',
  '\\hi':  '\\textcolor{##fb7185}{#1}',
  '\\co':  '\\textcolor{##7dd3fc}{#1}',
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',
  '\\vi':  '\\textcolor{##c4b5fd}{#1}',
  '\\fu':  '\\textcolor{##f0abfc}{#1}',
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
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
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
  orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
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
  // Stochastic processes
  'random walk': 'Discrete-time process where each step is iid with mean zero. Σ over t produces a Brownian-like trajectory; under EMH, log-prices behave this way.',
  'Brownian motion': 'Continuous-time random walk with independent Gaussian increments; the limit of a random walk as step size → 0.',
  'GBM': 'Geometric Brownian motion: dS/S = μ dt + σ dW. The Black-Scholes model. Prices stay positive; log-returns are Gaussian.',
  'Itô calculus': 'Stochastic calculus for processes with quadratic variation. Itô\'s lemma is the chain rule for SDEs.',
  'martingale': 'Process where the conditional expectation equals the current value. Under risk-neutral measure, discounted prices are martingales.',
  'EMH': 'Efficient Markets Hypothesis. Three forms: weak (past prices in price), semi-strong (public info in price), strong (all info in price). Defines the null model retail must beat.',

  // Linear time series
  'AR': 'Autoregressive process. r_t = c + Σ φ_i r_{t-i} + ε_t. Captures linear persistence in the mean.',
  'MA': 'Moving Average process. r_t = c + ε_t + Σ θ_i ε_{t-i}. Captures persistence in shocks.',
  'ARMA': 'Combined AR + MA. Wold theorem: any stationary process has an ARMA representation.',
  'ARIMA': 'ARMA on differenced series — handles unit-root non-stationarity (random walks have a unit root).',
  'unit root': 'An AR coefficient at exactly 1.0; series is non-stationary. ADF / KPSS tests check for unit roots before fitting ARMA.',
  'stationarity': 'Statistical properties (mean, variance, autocorrelation) don\'t change over time. Most ARMA theory assumes weak stationarity.',
  'autocorrelation': 'Correlation between r_t and r_{t-k}. The ACF / PACF are the canonical tools for identifying AR/MA orders.',

  // Cointegration
  'cointegration': 'Two non-stationary series whose linear combination is stationary. The basis of pairs trading.',
  'Engle-Granger': 'Two-step cointegration test: regress y on x, test residuals for stationarity (ADF). Standard since 1987.',
  'Johansen test': 'Multivariate cointegration test based on VAR ranks. More powerful than Engle-Granger when N > 2.',
  'ECM': 'Error-Correction Model: regression that includes both differences AND the cointegrating residual. Captures both short-run dynamics and long-run equilibrium.',
  'VAR': 'Vector autoregression: multivariate AR. y_t = c + Σ A_i y_{t-i} + ε_t with all variables endogenous.',
  'VECM': 'Vector error-correction model: VAR on differences plus error-correction terms. The cointegrated multivariate generalization.',
  'OU': 'Ornstein-Uhlenbeck: dx = θ(μ-x)dt + σ dW. Continuous-time mean-reverting process. Half-life = ln(2)/θ.',

  // Volatility
  'ARCH': 'AutoRegressive Conditional Heteroskedasticity (Engle 1982). σ²_t = ω + Σ α_i ε²_{t-i}. Vol is a deterministic function of past squared shocks.',
  'GARCH': 'Generalized ARCH (Bollerslev 1986). σ²_t = ω + α ε²_{t-1} + β σ²_{t-1}. Adds persistence in vol itself; the workhorse of vol modeling.',
  'EGARCH': 'Exponential GARCH (Nelson 1991). Models log-vol; allows leverage effect (negative shocks raise vol more than positive).',
  'TGARCH': 'Threshold GARCH. Asymmetric ARCH term for negative vs positive shocks.',
  'leverage effect': 'Negative returns predict higher next-day volatility more than positive ones. Engle-Ng asymmetry test detects it.',
  'Heston': 'Stochastic volatility model (1993). Vol is itself a CIR-process: dv = κ(θ-v)dt + ξ√v dW. Closed-form option pricing via Fourier.',
  'SABR': 'Stochastic Alpha Beta Rho — popular vol-surface model in fixed income. Closed-form smile approximation by Hagan et al.',
  'rough volatility': 'Vol modeled as fractional Brownian motion with Hurst H < 0.5. Empirically matches the term structure better than classical SV. Bergomi 2014, Gatheral-Jaisson-Rosenbaum 2018.',
  'Hurst exponent': 'H ∈ (0,1). H = 0.5 = standard BM; H < 0.5 = anti-persistent (rough); H > 0.5 = persistent (smooth). Realized vol H ≈ 0.1.',
  'fractional Brownian motion': 'Gaussian process with covariance Cov(B^H_s, B^H_t) = ½(s^{2H} + t^{2H} - |t-s|^{2H}). Roughness controlled by H.',
  'realized variance': 'Σ of squared intraday returns. With M intraday observations, RV → integrated variance as M → ∞.',

  // Jumps
  'jump-diffusion': 'GBM + a compound Poisson jump term. Merton 1976: J ~ N(μ_J, σ_J²); Kou: double-exponential jumps.',
  'Lévy process': 'Stochastic process with stationary independent increments. Includes BM, Poisson, jump-diffusion, variance gamma.',
  'variance gamma': 'Lévy process with infinite-activity jumps. Madan-Carr-Chang 1998; popular for option pricing with skew.',
  'Lévy-Khintchine': 'Characteristic function representation of any Lévy process: φ(u) = exp(t · ψ(u)) with three components (drift, BM, jumps).',

  // Factor models
  'CAPM': 'Capital Asset Pricing Model. E[r_i] - r_f = β_i (E[r_m] - r_f). Single-factor risk model.',
  'Fama-French': 'Three-factor model: market + size + value. Five-factor: + profitability + investment.',
  'Carhart': 'Fama-French + momentum. Standard 4-factor model in performance evaluation.',
  'APT': 'Arbitrage Pricing Theory (Ross 1976). E[r_i] = α + Σ β_ik f_k. Multi-factor; arbitrage condition implies linear factor structure.',
  'Fama-MacBeth': 'Two-pass regression: time-series betas in pass 1, cross-sectional regression on those betas in pass 2. Tests factor pricing.',
  'characteristics-based': 'Empirical alternative to factor regression: characteristics (B/M, momentum) directly explain returns. Daniel-Titman 1997.',
  'risk premium': 'Expected excess return for bearing a risk. The intercept in a factor regression where the regressor is a tradeable factor return.',
  'beta': 'Slope of asset-vs-factor regression. Captures factor exposure.',
  'alpha': 'Intercept of factor regression. Captures unexplained excess return after factor adjustments.',

  // State-space & HMM
  'state-space': 'Model where observations y_t depend on a hidden state x_t. y_t = H x_t + e_t; x_t = F x_{t-1} + w_t. Allows time-varying parameters.',
  'Kalman filter': 'Recursive Bayesian update for linear Gaussian state-space. Computes posterior over the hidden state in closed form.',
  'DLM': 'Dynamic Linear Model — a state-space with linear transitions and Gaussian noise. Petris-Petrone-Campagnoli 2009.',
  'particle filter': 'Sequential Monte Carlo for non-linear/non-Gaussian state-space models. Approximates the posterior with weighted samples.',
  'HMM': 'Hidden Markov Model. Discrete state z_t ∈ {1..K} with transition matrix; observation y_t | z_t. Trained via Baum-Welch (EM).',
  'regime-switching': 'Models where parameters depend on a hidden discrete state (regime). Hamilton 1989 for two-regime business-cycle models.',
  'change-point': 'A specific time t* where parameters jump. Bayesian change-point models infer t* posterior. Adams-MacKay 2007.',
  'EM algorithm': 'Expectation-Maximization for latent-variable models. Alternates between expectation of latent variables and maximization of parameters.',
  'forward-backward': 'EM for HMM. Forward pass computes P(z_t | y_{1:t}); backward computes P(z_t | y_{1:T}); combine for smoothed posterior.',

  // Bayesian
  'prior': 'Distribution over parameters before seeing data.',
  'posterior': 'Distribution over parameters given data. Posterior ∝ likelihood × prior.',
  'likelihood': 'P(data | parameters). The function that maximizes it gives the MLE.',
  'MLE': 'Maximum Likelihood Estimation. Finds parameters that maximize P(data | params).',
  'MAP': 'Maximum a Posteriori. MLE with a prior; equivalent to MLE if prior is uniform.',
  'shrinkage': 'Bayesian regularization: pull estimates toward a prior mean. Reduces variance at cost of bias.',
  'Black-Litterman': 'Bayesian portfolio framework. Prior = market-implied returns; views = subjective beliefs; posterior = blended μ.',
  'conjugate prior': 'A prior whose posterior is in the same family. Closed-form Bayesian updating; avoids MCMC.',
  'BIC': 'Bayesian Information Criterion. -2·log-lik + k·log(n). Model-selection score with stronger penalty than AIC.',
  'AIC': 'Akaike Information Criterion. -2·log-lik + 2k. Model-selection score; biased toward fitting more.',

  // Microstructure
  'order book': 'List of all open buy/sell limit orders at each price level. Updates millisecond-by-millisecond.',
  'limit order': 'An order to buy/sell at a specified price. Sits in the book until matched or cancelled.',
  'market order': 'An order to buy/sell immediately at the best available price. Crosses the spread.',
  'bid-ask spread': 'Difference between best ask (lowest sell) and best bid (highest buy). The "cost of immediate liquidity".',
  'queue position': 'Position of a limit order in the price-time priority queue at its level. Critical for market makers.',
  'Hawkes process': 'Self-exciting point process. Intensity λ_t depends on recent events: λ_t = μ + Σ φ(t - t_i). Models trade clustering.',
  'order flow imbalance': 'Difference between buying and selling pressure on the orderbook. Strong short-horizon predictor of price moves.',
  'Avellaneda-Stoikov': 'Optimal market-making model (2008). Combines inventory risk + queue position to set bid/ask quotes.',
  'market impact': 'Price move caused by your own order. Square-root law: ΔP ∝ σ·√(Q/ADV) (Almgren-Chriss).',
  'execution': 'How an order is broken up and routed over time. VWAP / TWAP / IS algos minimize impact + risk trade-off.',

  // ML
  'gradient boosting': 'Ensemble of weak learners (typically trees) trained sequentially on residuals. XGBoost, LightGBM, CatBoost.',
  'XGBoost': 'Most popular gradient-boosting library. Regularized objective + second-order Taylor expansion + tree pruning.',
  'LightGBM': 'Microsoft\'s gradient-boosting library. Histogram-based + leaf-wise growth; usually fastest on tabular data.',
  'CatBoost': 'Yandex\'s gradient-boosting library. Native categorical handling + ordered boosting to avoid target leakage.',
  'random forest': 'Ensemble of decision trees with bagging + random feature subsampling. Lower variance than individual trees.',
  'feature importance': 'Per-feature score reflecting contribution to prediction. SHAP values are the gold-standard explanation.',
  'SHAP': 'SHapley Additive exPlanations. Game-theoretic feature attribution: each feature\'s contribution to the prediction.',

  // Deep learning
  'LSTM': 'Long Short-Term Memory. Recurrent net with gated cells; handles long-range dependencies. Hochreiter-Schmidhuber 1997.',
  'GRU': 'Gated Recurrent Unit. Simpler than LSTM with comparable performance on most tasks. Cho et al. 2014.',
  'attention': 'Mechanism that computes weighted sums over inputs. Q, K, V matrices; softmax(QK^T/√d) V.',
  'transformer': 'Attention-only architecture (Vaswani 2017). Replaced RNNs in most sequence-modeling tasks.',
  'self-attention': 'Attention where Q, K, V come from the same sequence. The transformer\'s core computation.',
  'foundation model': 'Pretrained large model that\'s fine-tuned on downstream tasks. GPT-style for text; CLIP for vision-language.',
  'embedding': 'Dense vector representation of a discrete object (word, ticker, news event). The interface between data and ML.',

  // Evaluation
  'MSE': 'Mean Squared Error. ⟨(y - ŷ)²⟩. Standard regression metric.',
  'MAE': 'Mean Absolute Error. ⟨|y - ŷ|⟩. More robust to outliers than MSE.',
  'log-likelihood': 'log P(y | model). Higher = better. The "score" maximized by MLE.',
  'CRPS': 'Continuous Ranked Probability Score. Integrated squared difference between predicted CDF and the empirical (step) CDF at the realization. Gold standard for probabilistic forecast evaluation.',
  'calibration': 'Empirical quantile of realizations matches the predicted quantile. A 90% PI should contain 90% of realizations.',
  'reliability': 'Calibration as a function of predicted probability. Plots predicted vs observed frequency.',
  'sharpness': 'Width of the predicted distribution. Sharper = narrower; combined with calibration, gives the right notion of "good probabilistic forecast".',
  'deflated Sharpe': 'López de Prado\'s correction for multiple-testing inflation in Sharpe ratios. Makes "the best of N tested strategies" interpretable.',

  // Backtesting
  'walk-forward CV': 'Time-respecting cross-validation: train [start..t], validate (t..t+h], advance. The only honest CV for time series.',
  'data leakage': 'When information from the future leaks into training. Cardinal sin of time-series ML.',
  'survivorship bias': 'Backtesting on a universe restricted to survivors. Inflates returns.',
  'look-ahead bias': 'Using info that wouldn\'t have been available at decision time. Common silent bug.',
  'CPCV': 'Combinatorial Purged Cross-Validation. López de Prado 2018; multiple time-respecting splits with purging.',
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
   HERO + SECTION NAV
   "Trajectory field" — overlapping stochastic walks, violet+cyan palette.
   ========================================================================== */

const TrajectoryField = () => {
  const lines = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    seed: i * 313 + 17, vol: 9 + i * 2, off: 30 + i * 16, dur: 22 + i * 1.6,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
      {lines.map((c, i) => {
        const rand = mulberry32(c.seed);
        let y = 220 - c.off;
        const pts = [];
        for (let x = 0; x <= 800; x += 4) {
          y += boxMuller(rand) * 0.35 * c.vol / 10;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return (
          <motion.polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke={i % 3 === 0 ? '#c4b5fd' : i % 3 === 1 ? '#7dd3fc' : '#f0abfc'}
            strokeOpacity={0.42 + (i % 3) * 0.08}
            strokeWidth={1.1 + (i % 2) * 0.4}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, x: [0, -110, 0] }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-cyan-500/5 to-transparent" />
    <TrajectoryField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <BrainCircuit className="w-3.5 h-3.5" /> modeling markets · basic to SOTA
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-cyan-200 bg-clip-text text-transparent">
          Modeling Markets
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">From the random walk to transformer-on-orderbook — one realistic feature at a time.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Each model adds one feature to the prior: <span className="text-cyan-300">vol clustering</span>,{' '}
          <span className="text-fuchsia-300">jumps</span>,{' '}
          <span className="text-amber-300">regimes</span>,{' '}
          <span className="text-emerald-300">factor structure</span>,{' '}
          <span className="text-violet-300">hidden state</span>,{' '}
          <span className="text-rose-300">microstructure</span>, then{' '}
          <span className="text-fuchsia-300">attention &amp; foundation models</span>.
          The goal isn&apos;t to find <em>the</em> right model &mdash; it&apos;s to know which feature each model gets right.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-cyan-300">RW · GBM · ARMA</span>
          <span className="text-amber-300">ARCH · GARCH</span>
          <span className="text-fuchsia-300">stochastic vol · jumps</span>
          <span className="text-emerald-300">factor models</span>
          <span className="text-violet-300">state-space · HMM · Bayes</span>
          <span className="text-rose-300">microstructure</span>
          <span className="text-fuchsia-300">ML · LSTM · transformers</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'targets',      label: 'What we model',           icon: Target,         anchor: true },
  { id: 'null',         label: 'Null model · GBM',        icon: Hash },
  { id: 'styfacts',     label: 'Stylized facts',          icon: Waves },
  { id: 'arma',         label: 'AR · MA · ARMA',          icon: LineChart },
  { id: 'coint',        label: 'Cointegration · VAR',     icon: GitBranch },
  { id: 'garch',        label: 'ARCH · GARCH',            icon: Gauge },
  { id: 'heston',       label: 'Stochastic vol',          icon: Sigma },
  { id: 'roughvol',     label: 'Rough volatility',        icon: Atom },
  { id: 'jumps',        label: 'Jumps · Lévy',            icon: Zap },
  { id: 'factors',      label: 'Factor models',           icon: Layers },
  { id: 'statespace',   label: 'State-space · Kalman',    icon: Network },
  { id: 'regime',       label: 'Regime-switching · HMM',  icon: Repeat },
  { id: 'bayes',        label: 'Bayesian inference',      icon: Sparkles },
  { id: 'micro',        label: 'Microstructure · Hawkes', icon: CircuitBoard },
  { id: 'ml',           label: 'ML · boosted trees',      icon: Boxes },
  { id: 'sequence',     label: 'Sequence models',         icon: Workflow },
  { id: 'transformers', label: 'Transformers · SOTA',     icon: Wand2 },
  { id: 'eval',         label: 'Forecast evaluation',     icon: Ruler,          anchor: true },
  { id: 'anchor',       label: 'Anchor: SPY 1m forecast', icon: Crosshair,      anchor: true },
  { id: 'trails',       label: 'Next trails',             icon: Compass },
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
   STUB CARDS — placeholders; replaced in stages C-L.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ============================================================================
   01 — WHAT WE MODEL (spine)
   The frame: 6 modeling targets in financial markets, each with its own math
   and downstream use. "Prices" is rarely the right target.
   ========================================================================== */

const TARGETS = [
  { id: 'ret',    label: 'Returns r_t',         tone: '#7dd3fc', use: 'Strategy alpha', icon: TrendingUp,
    note: 'Log-returns r_t = log(P_t/P_{t-1}). Almost-stationary, near-zero mean. The default target for "prediction" tasks.' },
  { id: 'vol',    label: 'Volatility σ_t',      tone: '#fbbf24', use: 'Risk · sizing · option pricing', icon: Gauge,
    note: 'Conditional variance. Highly persistent (clustering); MUCH more predictable than returns.' },
  { id: 'cov',    label: 'Co-movement Σ_t',     tone: '#86efac', use: 'Portfolio construction', icon: Network,
    note: 'Time-varying covariance matrix. DCC-GARCH, factor models, copulas. Correlation matters most in tails.' },
  { id: 'reg',    label: 'Regime z_t',          tone: '#fda4af', use: 'Macro overlay · risk-on/off', icon: Repeat,
    note: 'Discrete latent state {calm, vol, crisis}. HMM, change-point models. Persistent; flips matter.' },
  { id: 'flow',   label: 'Order flow',          tone: '#c4b5fd', use: 'Market making · execution', icon: CircuitBoard,
    note: 'Sequence of {arrival, cancel, trade} events. Hawkes processes capture self-excitation; informs queue position and impact.' },
  { id: 'event',  label: 'Events / news',       tone: '#f0abfc', use: 'Event-driven · risk', icon: Zap,
    note: 'Sparse categorical: earnings, downgrades, macro releases. NLP embeddings + sparse-event Poisson regressions.' },
];

const TargetsCard = () => {
  const [hover, setHover] = useState(null);

  return (
    <Card id="targets" icon={Target} title="What we model" accent="violet" index={1} anchor
          subtitle="Six distinct targets. 'Prices' isn't one of them — log-returns are. Vol is more predictable than returns. Cov matters most in tails. Regimes flip rarely but matter when they do.">
      <MinSchema>
        Don&apos;t model price <Eq>{'P_t'}</Eq>. Model log-returns{' '}
        <Eq>{'r_t = \\log(P_t / P_{t-1})'}</Eq>, conditional variance{' '}
        <Eq>{'\\sigma_t^2 = \\mathrm{Var}(r_t \\mid \\mathcal{F}_{t-1})'}</Eq>, and the joint
        distribution. Returns are nearly unpredictable; second moments are not.
      </MinSchema>

      <Block>{'\\co{r_t} = \\log\\frac{P_t}{P_{t-1}},\\quad \\co{\\sigma_t^2} = \\mathrm{Var}(r_t \\mid \\mathcal{F}_{t-1}),\\quad \\co{\\Sigma_t} = \\mathrm{Cov}(\\mathbf{r}_t \\mid \\mathcal{F}_{t-1}),\\quad \\co{z_t \\in \\{1,\\dots,K\\}}'}</Block>

      <p>
        Every model in this explainer is a different way to factorize{' '}
        <Eq>{'p(\\mathbf{r}_t \\mid \\mathcal{F}_{t-1})'}</Eq> &mdash; the conditional
        distribution of the next observation given history. The choice of factorization
        determines what you can predict and what you can&apos;t.
      </p>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {TARGETS.map(t => {
          const Ic = t.icon;
          return (
            <div key={t.id}
              onMouseEnter={(e) => setHover({ t, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ t, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:bg-white/[0.04] cursor-help transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Ic className="w-4 h-4" style={{ color: t.tone }} />
                <span className="font-mono text-[12px]" style={{ color: t.tone }}>{t.label}</span>
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{t.use}</div>
            </div>
          );
        })}
      </div>
      <FloatingTip
        hover={hover}
        width={320}
        render={() => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: hover.t.tone }}>{hover.t.label}</div>
            <div className="text-neutral-200 leading-snug">{hover.t.note}</div>
          </div>
        )}
      />

      <Predict question="Of these 6 targets, which is most predictable on a 1-day horizon?">
        Volatility, by a wide margin. <Eq>{'R^2'}</Eq> on next-day returns: ~0.001 (often
        statistically zero). On next-day vol: ~0.5-0.7. Vol is autocorrelated for ~30+ days; it
        dwarfs return-predictability and is the foundation of GARCH, options, and risk
        management. Order flow and event-driven categorical targets are also predictable but
        require microstructure data and sparse-event ML respectively.
      </Predict>

      <Misconception
        wrong="The job of a quant model is to predict prices."
        right="The job is to predict the conditional distribution of returns given everything you know up to now. Often the mean of that distribution is unpredictable; the variance, skew, and tail are not."
        because="Prices are non-stationary (random walk). Differencing into returns gives a stationary-ish series whose statistics are well-defined. Modeling distributions, not point estimates, exposes the irreducible uncertainty and gives downstream tools (risk, sizing, options) what they actually need."
      />

      <WhenItMatters>
        Always &mdash; this is the conceptual frame for the next 18 cards. Each subsequent model
        is one specific way to write{' '}
        <Eq>{'p(\\mathbf{r}_t \\mid \\mathcal{F}_{t-1})'}</Eq>. Knowing which targets a model
        addresses (and which it ignores) tells you what it can and can&apos;t do downstream.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Forecast horizon matters.</strong> Returns are unpredictable on intraday +
          daily horizons but become more predictable over months (mean reversion / momentum) and
          years (factor premia). Vol is most predictable in the 1-day to 1-month range. Co-movement
          is most predictable in stress regimes (correlations spike). Match the model&apos;s
          horizon to the target&apos;s natural autocorrelation length.
        </p>
        <p>
          <strong>Distributional vs point forecasts.</strong> Most retail-targeted material asks
          &ldquo;will SPY go up tomorrow?&rdquo; (point). Useful work asks &ldquo;what&apos;s the
          full distribution of SPY&apos;s 1-day return given today&apos;s state?&rdquo; The latter
          gives you 5%/95% quantiles for risk, expected utility for sizing, and probability of
          tail events for hedging. Point forecasts are a degenerate special case.
        </p>
        <p>
          <strong>The factorization principle.</strong> A natural decomposition is{' '}
          <Eq>{'p(r_t) = p(r_t \\mid \\sigma_t) \\cdot p(\\sigma_t \\mid z_t) \\cdot p(z_t \\mid \\mathcal{F}_{t-1})'}</Eq>{' '}
          &mdash; nest the targets. GARCH addresses{' '}
          <Eq>{'p(\\sigma_t \\mid \\mathcal{F}_{t-1})'}</Eq>; HMM addresses{' '}
          <Eq>{'p(z_t)'}</Eq>; rough vol replaces both with a fractional Brownian process.
        </p>
        <p>
          <strong>Sibling explainers.</strong>{' '}
          <CrossLink to="forecasters-craft" external recap="Forecaster's Craft: modeling for sports betting (loss alignment, information hypothesis, distributional forecasting). Many ideas transfer directly.">The Forecaster&apos;s Craft</CrossLink>{' '}
          covers the same conceptual frame for sports;{' '}
          <CrossLink to="retail-quant" external recap="Retail Quant: deployment side — how the model's output becomes positions, with sizing, costs, and risk.">The Retail Quant&apos;s Stack</CrossLink>{' '}
          shows how a model&apos;s output becomes positions and P&amp;L.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why log-returns instead of arithmetic returns?',
          a: 'Time-additivity: log(P_T/P_0) = Σ log(P_t/P_{t-1}). Arithmetic returns don\'t add. Also, log-returns are approximately Gaussian for short horizons, while gross returns are bounded below at 0 (highly skewed). For modeling, log-returns are the right unit.' },
        { q: 'Don\'t I need a price forecast for stop-loss / take-profit decisions?',
          a: 'You need a price-distribution forecast. From p(r_T | F_t) you can compute P(P_T > target) for any target. Point forecasts of P_T conflate the mean of the distribution with what the price will be — and that mean is usually drowned in noise.' },
        { q: 'How does this map to the SOTA ML models in the later cards?',
          a: 'Transformers on order book / news embeddings are predicting one of these same 6 targets — usually short-horizon returns, micro-volatility, or order-flow imbalance. The model is more flexible; the target is the same. Don\'t lose the question while reading the architecture.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — THE NULL MODEL · RANDOM WALK / GBM / EMH
   Why beating the null is hard. EMH variants. The "if you can't beat it, just
   own it" baseline.
   ========================================================================== */

const NullModelCard = () => {
  const [mu, setMu] = useState(0.07);
  const [sig, setSig] = useState(0.16);
  const [seed, setSeed] = useState(11);

  // Simulate 8 GBM paths over 1 year (252 trading days)
  const paths = useMemo(() => {
    const T = 252, dt = 1 / 252, nPaths = 8;
    const out = [];
    for (let p = 0; p < nPaths; p++) {
      const rand = mulberry32(seed + p * 1000);
      const path = [1];
      let s = 1;
      for (let i = 1; i <= T; i++) {
        const z = boxMuller(rand);
        s *= Math.exp((mu - 0.5 * sig * sig) * dt + sig * Math.sqrt(dt) * z);
        path.push(s);
      }
      out.push(path);
    }
    return out;
  }, [mu, sig, seed]);

  const W = 320, H = 160, P = 22;
  const allMax = Math.max(...paths.flat());
  const allMin = Math.min(...paths.flat());
  const sx = (i) => P + (i / 252) * (W - 2 * P);
  const sy = (v) => H - P - ((v - allMin) / (allMax - allMin)) * (H - 2 * P);

  return (
    <Card id="null" icon={Hash} title="The null model · random walk / GBM" accent="cyan" index={2}
          subtitle="Geometric Brownian motion is the baseline every model must beat. Log-returns iid Gaussian; prices a martingale under the right measure. Most strategies don't beat it.">
      <MinSchema>
        <Term>GBM</Term>: <Eq>{'dS_t = \\mu S_t\\, dt + \\sigma S_t\\, dW_t'}</Eq>. Equivalent to{' '}
        log-returns being iid Gaussian:{' '}
        <Eq>{'r_t \\sim \\mathcal{N}((\\mu - \\sigma^2/2)\\,dt,\\, \\sigma^2\\, dt)'}</Eq>.
        Under the risk-neutral measure, discounted prices are a{' '}
        <Term>martingale</Term> &mdash; future returns are unpredictable from history alone.
      </MinSchema>

      <Block>{'\\co{dS_t} = \\vi{\\mu}\\, S_t\\, dt + \\vi{\\sigma}\\, S_t\\, dW_t \\quad\\Longleftrightarrow\\quad \\log\\!\\frac{S_T}{S_0} \\sim \\mathcal{N}\\!\\Big((\\mu - \\tfrac{1}{2}\\sigma^2)T,\\; \\sigma^2 T\\Big)'}</Block>

      <p>
        Whatever your model, it has to beat <em>this</em>. <Term>EMH</Term> in its weak form
        says the conditional mean of <Eq>{'r_t'}</Eq> given past prices is essentially zero on
        short horizons &mdash; future returns aren&apos;t predictable from past returns. It&apos;s
        an empirical claim, and it&apos;s approximately true: most active managers don&apos;t
        beat the null after fees, most published return-prediction strategies don&apos;t survive
        out-of-sample, and the null&apos;s realized Sharpe (the equity risk premium / σ ≈ 0.4)
        is hard to improve on.
      </p>

      <Predict question="Of US active equity mutual funds, what fraction beat their benchmark over 15 years (after fees)?">
        ~10-15%. SPIVA reports show ~85% of large-cap funds underperform SPY over 15 years.
        That&apos;s with hedge-fund-grade infra, full-time analysts, and millions in research
        budgets &mdash; against a passive index and the GBM null. The beating-the-null bar
        is much higher than retail intuition suggests.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">drift μ (annual)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(mu * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.10" max="0.20" step="0.01" value={mu}
              onChange={(e) => setMu(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">vol σ (annual)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sig * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.05" max="0.50" step="0.01" value={sig}
              onChange={(e) => setSig(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed} · 8 GBM paths over 1 year</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Sharpe" value={(mu / sig).toFixed(2)} sub="μ/σ at this regime" color="text-violet-300" />
            <Stat label="P(loss after 1y)" value={`${(100 * (1 - Phi((mu - 0.5 * sig * sig) / sig))).toFixed(0)}%`} sub="under GBM" color="text-rose-300" />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">S₀ = 1</text>
          {paths.map((path, p) => {
            const pts = path.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
            return <polyline key={p} points={pts} fill="none" stroke={['#7dd3fc','#c4b5fd','#86efac','#fda4af','#fbbf24','#f0abfc','#67e8f9','#fdba74'][p]} strokeOpacity="0.65" strokeWidth="1.0" />;
          })}
          <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
          <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">1y (252d)</text>
        </svg>
      </div>

      <Worked title="Worked example · 'good but unlucky' under GBM">
        <p>
          Set μ = 8%, σ = 16% (long-run SPY-ish). Sharpe = 0.50. After 1 year, P(loss) =
          1 − Φ((0.08 − 0.5·0.0256)/0.16) ≈ 1 − Φ(0.42) ≈ 34%. Roughly 1 in 3 years
          ends underwater <em>even with the right model</em>.
        </p>
        <p>
          That&apos;s the noise floor: with only 1 year of data, you cannot statistically
          separate a Sharpe-0.5 strategy from a Sharpe-0 strategy. Need ~10 years for a t-stat
          of ~1.6 on the Sharpe estimate. The null doesn&apos;t lose to your strategy on a
          short horizon &mdash; it loses to itself plus noise.
        </p>
      </Worked>

      <Misconception
        wrong="EMH means markets are 'right' and trading is futile."
        right="EMH means future returns are not predictable from current public information. Markets can still be wrong about absolute valuations; risk premia still exist; specific information can still be edge. EMH bounds what return-prediction can earn, not what risk-bearing can earn."
        because="The strong forms of EMH (semi-strong, strong) make claims about specific information sets being already priced. Even if those claims hold, harvesting risk premia (equity, term, vol, factors) still pays — that's compensation for risk-bearing, not for prediction. Hedge funds beat the SPY null in raw returns; most don't beat it net of fees. Distinguishing 'edge' from 'risk premium' is the right discipline."
      />

      <WhenItMatters>
        Whenever you compare a model. Always include the GBM null as a baseline; report the model&apos;s
        improvement <em>relative</em> to it. A model with Sharpe 0.4 sounds bad until you know
        the null delivers Sharpe 0.4 over the same period &mdash; then it&apos;s evidence
        of nothing.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The risk-neutral measure.</strong> Under <Eq>{'\\mathbb{Q}'}</Eq>{' '}
          (the risk-neutral measure derived from the no-arbitrage condition), discounted prices
          are martingales: <Eq>{'\\mathbb{E}^{\\mathbb{Q}}[S_T \\mid \\mathcal{F}_t] = S_t e^{r(T-t)}'}</Eq>.
          This is the foundation of derivative pricing: under <Eq>{'\\mathbb{Q}'}</Eq>, the drift
          becomes the risk-free rate. The change of measure (Girsanov&apos;s theorem) is what
          bridges physical and risk-neutral probabilities.
        </p>
        <p>
          <strong>EMH variants.</strong> <em>Weak</em>: past prices are useless for prediction
          (return autocorrelation ≈ 0). <em>Semi-strong</em>: all <em>public</em> information is
          incorporated. <em>Strong</em>: all information including insider knowledge is priced.
          Empirically: weak holds approximately on liquid markets; semi-strong holds for
          well-followed names but breaks for small-caps; strong fails (insider trading exists).
        </p>
        <p>
          <strong>Why GBM is wrong but useful.</strong> GBM gives Gaussian log-returns &mdash;
          but real returns have <CrossLink to="styfacts" recap="Stylized facts: fat tails (kurt ≈ 12 for daily), vol clustering, leverage effect, etc.">fat tails, vol clustering, jumps</CrossLink>.{' '}
          Each subsequent card in this explainer adds back ONE of those features. GBM is the
          base case, not the right model.
        </p>
        <p>
          <strong>The "luck vs skill" decomposition.</strong> A strategy with realized Sharpe{' '}
          <Eq>{'\\hat{S}'}</Eq> over T years has SE <Eq>{'1/\\sqrt{T}'}</Eq>. So a Sharpe of
          1.0 over 4 years has 95% CI roughly [0.0, 2.0] &mdash; statistically indistinguishable
          from luck. Hedge fund track records under 5 years rarely meet the bar; even at 10 years,
          a Sharpe of 0.7 has CI [0.07, 1.33].
        </p>
      </Deeper>

      <QA items={[
        { q: 'If GBM is the null, why bother modeling at all?',
          a: 'Even if returns are unpredictable, the SECOND moment (vol) and the JOINT distribution (covariance, regime) are predictable and downstream-useful. Better vol forecasts → better option pricing, better Kelly sizing, better risk budgets. The whole rest of this explainer is "ways to model what GBM doesn\'t".' },
        { q: 'Does the GBM null mean indexing is the right answer?',
          a: 'For most retail with a long horizon, yes — owning the equity risk premium efficiently is hard to improve on. The interesting work is on (a) sleeves with non-equity risk premia (trend, vol, factors), (b) explicit inefficiencies (microstructure, illiquid markets), or (c) modeling vol/regimes for risk overlay. None of those contradict EMH.' },
        { q: 'Why specifically GEOMETRIC Brownian motion, not arithmetic?',
          a: 'Prices can\'t go negative; arithmetic BM doesn\'t respect that. GBM = exp(arithmetic BM in log-price), which keeps prices positive and gives Gaussian log-returns. Black-Scholes assumes GBM; almost all default-asset-pricing math does.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — STYLIZED FACTS of returns
   Cont (2001) catalogued ~12 universal regularities. Each one demands a model
   feature; each is what GBM gets wrong.
   ========================================================================== */

const STYFACTS = [
  { id: 'tail',  label: 'Fat tails',                 strength: 'very strong',
    note: 'Kurtosis 8-15 daily, 4-6 monthly. Way above Gaussian (3). The 1% worst day is ~−4σ, not the Gaussian −2.3σ.' },
  { id: 'cluster', label: 'Volatility clustering',   strength: 'very strong',
    note: 'Squared returns autocorrelated for 30-100 days. Big moves follow big moves; quiet follows quiet. The reason GARCH exists.' },
  { id: 'lev',   label: 'Leverage effect',           strength: 'strong',
    note: 'Negative shocks raise next-day vol more than positive ones. EGARCH and threshold-GARCH explicitly model this asymmetry.' },
  { id: 'aclag', label: 'Autocorrelation of |r|',    strength: 'strong',
    note: 'Cor(|r_t|, |r_{t+k}|) decays slowly (long memory). Power-law in k; persistent for hundreds of days.' },
  { id: 'noac',  label: 'Returns ≈ uncorrelated',    strength: 'medium',
    note: 'Linear autocorrelation of r_t is statistically zero past lag 1-2. Returns aren\'t predictable linearly — which is why GARCH targets vol, not mean.' },
  { id: 'agg',   label: 'Aggregational Gaussianity', strength: 'medium',
    note: 'As you aggregate (1d → 1mo → 1y), kurtosis converges to 3. Long-horizon returns are nearly Gaussian; short ones aren\'t.' },
  { id: 'jump',  label: 'Jumps',                     strength: 'medium',
    note: 'Discrete price jumps from earnings, macro releases, gap-opens. Non-Gaussian by construction; demand jump-diffusion or Lévy.' },
  { id: 'rev',   label: 'Mean reversion (long)',     strength: 'medium',
    note: 'Negative autocorrelation at multi-month horizons (Fama-French 1988). Drives value premium, contrarian strategies.' },
  { id: 'mom',   label: 'Momentum (medium)',         strength: 'medium',
    note: 'Positive autocorrelation at 6-12 month horizons. Drives momentum factor (Jegadeesh-Titman 1993).' },
  { id: 'reg',   label: 'Regime structure',          strength: 'medium',
    note: 'Persistent calm/volatile periods. Hamilton 1989. Driver of HMM and time-varying-parameter models.' },
  { id: 'corr',  label: 'Correlation breaks in stress', strength: 'strong',
    note: 'Pairwise correlations spike toward 1 in crashes. Diversification fails when you need it most. Copula models capture tail dependence.' },
  { id: 'gain',  label: 'Gain/loss asymmetry',       strength: 'medium',
    note: 'Loss draws are sharper and faster than gain runs. Kurtosis of negative tail > positive tail. Asymmetric loss functions (CVaR) are the fix.' },
];

const StyFactsCard = () => {
  const [hover, setHover] = useState(null);

  // Synthesize a 1000-day return series with empirical-style stylized facts:
  //   - Vol clustering via simple GARCH-like update
  //   - Fat tails via mixture
  const series = useMemo(() => {
    const T = 1000;
    const rand = mulberry32(31);
    const omega = 0.00001, alpha = 0.10, beta = 0.85;
    let s2 = omega / (1 - alpha - beta);
    const ret = [], vols = [], sqr = [];
    for (let t = 0; t < T; t++) {
      const z = boxMuller(rand);
      const fat = rand() < 0.05 ? 2.5 : 1; // occasional fat-tail draws
      const r = Math.sqrt(s2) * z * fat;
      // leverage effect: negative shocks scale up vol more
      const shock = r < 0 ? r * r * 1.5 : r * r;
      s2 = omega + alpha * shock + beta * s2;
      ret.push(r);
      vols.push(Math.sqrt(s2));
      sqr.push(r * r);
    }
    return { ret, vols, sqr };
  }, []);

  // ACF helper
  const acf = (xs, maxLag) => {
    const m = xs.reduce((a, b) => a + b, 0) / xs.length;
    const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length;
    const out = [];
    for (let k = 1; k <= maxLag; k++) {
      let c = 0;
      for (let t = k; t < xs.length; t++) c += (xs[t] - m) * (xs[t - k] - m);
      out.push(c / xs.length / v);
    }
    return out;
  };
  const acfRet = useMemo(() => acf(series.ret, 30), [series]);
  const acfSqr = useMemo(() => acf(series.sqr, 30), [series]);

  const W = 320, H = 130, P = 22;
  const sx = (i) => P + (i / 30) * (W - 2 * P);
  const sy = (v) => H / 2 - v * (H / 2 - P) / 0.40;
  const ciHigh = 1.96 / Math.sqrt(series.ret.length);

  return (
    <Card id="styfacts" icon={Waves} title="Stylized facts of returns" accent="rose" index={3}
          subtitle="Cont 2001 — 12 universal regularities every model has to grapple with. Fat tails, vol clustering, leverage effect, aggregational Gaussianity, regime structure, and tail correlation breaks. Each fact has a model feature.">
      <MinSchema>
        Real returns universally exhibit ~12 named regularities. Most strongly:{' '}
        <Term>fat tails</Term> (kurtosis ≫ 3),{' '}
        volatility clustering (<Eq>{'\\rho_k(r_t^2) > 0'}</Eq> for many lags), and{' '}
        <Term>leverage effect</Term> (negative shocks predict higher vol). These hold across
        markets, asset classes, and decades.
      </MinSchema>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {STYFACTS.map(f => {
          const tone = f.strength === 'very strong' ? 'text-rose-300 bg-rose-500/10 border-rose-400/30'
            : f.strength === 'strong' ? 'text-amber-300 bg-amber-500/10 border-amber-400/30'
            : 'text-cyan-300 bg-cyan-500/10 border-cyan-400/30';
          return (
            <div key={f.id}
              onMouseEnter={(e) => setHover({ f, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ f, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 flex items-center justify-between gap-2 hover:bg-white/[0.04] cursor-help">
              <span className="text-[12px] text-neutral-100">{f.label}</span>
              <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${tone}`}>{f.strength}</span>
            </div>
          );
        })}
      </div>
      <FloatingTip
        hover={hover}
        width={340}
        render={() => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-rose-300">{hover.f.label}</div>
            <div className="text-neutral-200 leading-snug">{hover.f.note}</div>
          </div>
        )}
      />

      <Predict question="Which is empirically stronger: autocorrelation of returns r_t, or autocorrelation of squared returns r_t²?">
        <span className="font-mono text-rose-300">|r_t|</span>{' '}
        and <span className="font-mono text-rose-300">r_t²</span> have visible autocorrelation
        out to <em>hundreds</em> of lags. Linear ACF of <span className="font-mono text-cyan-300">r_t</span>{' '}
        is statistically zero past lag 1. <em>Vol is predictable; mean isn&apos;t.</em> The chart
        below shows it on a synthesized series.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">ACF of r_t · &asymp; 0 past lag 1</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H / 2} y2={H / 2} stroke="#737373" strokeWidth="0.4" />
            <line x1={P} x2={W - P} y1={sy(ciHigh)} y2={sy(ciHigh)} stroke="#7dd3fc" strokeWidth="0.4" strokeDasharray="2,2" />
            <line x1={P} x2={W - P} y1={sy(-ciHigh)} y2={sy(-ciHigh)} stroke="#7dd3fc" strokeWidth="0.4" strokeDasharray="2,2" />
            {acfRet.map((c, i) => (
              <line key={i} x1={sx(i + 1)} x2={sx(i + 1)} y1={H / 2} y2={sy(c)}
                stroke="#7dd3fc" strokeWidth="2" />
            ))}
            <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">lag 1</text>
            <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">30</text>
            <text x={P + 2} y={14} fontSize="8" fill="#7dd3fc" fontFamily="monospace">±2σ band</text>
          </svg>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">ACF of r_t² · slow decay = clustering</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H / 2} y2={H / 2} stroke="#737373" strokeWidth="0.4" />
            <line x1={P} x2={W - P} y1={sy(ciHigh)} y2={sy(ciHigh)} stroke="#fb7185" strokeWidth="0.4" strokeDasharray="2,2" />
            <line x1={P} x2={W - P} y1={sy(-ciHigh)} y2={sy(-ciHigh)} stroke="#fb7185" strokeWidth="0.4" strokeDasharray="2,2" />
            {acfSqr.map((c, i) => (
              <line key={i} x1={sx(i + 1)} x2={sx(i + 1)} y1={H / 2} y2={sy(c)}
                stroke="#fb7185" strokeWidth="2" />
            ))}
            <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">lag 1</text>
            <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">30</text>
            <text x={P + 2} y={14} fontSize="8" fill="#fb7185" fontFamily="monospace">±2σ band</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · 1987 Black Monday under Gaussian vs empirical kurtosis">
        <p>
          Oct 19 1987: SPY-equivalent fell 22.6% in a day. Daily vol ~1.1%. <strong>Gaussian z-score:</strong> ~−21σ.
          Probability under Gaussian: ~10⁻⁹⁸ (effectively impossible).
        </p>
        <p>
          <strong>Empirical kurtosis 12:</strong> the same event is ~6σ in a t-distribution with df ≈ 4.
          Probability ~10⁻⁵ &mdash; once-in-30-years rare, but not impossible. The Gaussian model
          would put this event at &ldquo;wait several billion universe lifetimes&rdquo;; the
          fat-tailed model at &ldquo;wait a generation&rdquo;. Calibration matters for risk
          budgeting and option pricing.
        </p>
      </Worked>

      <Misconception
        wrong="Daily returns are approximately normal so I can use Gaussian VaR."
        right="Daily returns have kurtosis 8-15. Gaussian VaR underestimates tail risk by 2-5×. Use empirical quantiles, t-distributions (df ≈ 4), or full Monte Carlo with fat-tailed innovations."
        because="The Gaussian fit might match the body of the distribution well but completely miss the tails. VaR is a TAIL statistic — fitting the body won't help. The 1% worst day is empirically ~−4σ; Gaussian says ~−2.3σ. Sub-additivity of risk fails in a Gaussian-only framework when the underlying isn't actually Gaussian."
      />

      <Deeper>
        <p>
          <strong>Why the leverage effect exists.</strong> Leverage rises when equity prices fall
          (debt is fixed; equity shrinks). Higher leverage → higher equity vol. Black 1976
          formalized; Christie 1982 measured. The asymmetry isn&apos;t arbitrarily large &mdash;
          ~30% of the daily-vol response to negative shocks comes from this mechanism alone.
        </p>
        <p>
          <strong>Aggregational Gaussianity from the CLT.</strong> If daily returns are iid with
          finite variance, monthly returns (~21 daily) are <em>more</em> Gaussian by CLT. Empirically,
          monthly returns have kurtosis ~4-6 vs daily ~10-15. Quarterly returns are nearly Gaussian.
          So horizon matters: short-horizon Gaussian assumption is bad; long-horizon is OK.
        </p>
        <p>
          <strong>Cont&apos;s catalogue.</strong> The original Cont 2001 paper{' '}
          <em>Empirical properties of asset returns: stylized facts</em> lists 11 facts with
          references to empirical literature 1980-2000. It&apos;s the canonical reference; every
          later model in this explainer addresses one or more of the items in that list.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Are these facts universal across asset classes?',
          a: 'Mostly yes. Equities, FX, commodities, crypto all show fat tails + clustering + leverage effect. Bonds show weaker leverage effect (rates can move both directions cleanly). Vol-of-vol is universal; the magnitudes vary.' },
        { q: 'Why don\'t these patterns get arbed away?',
          a: 'Because they\'re not "predictability" of returns — they\'re properties of the conditional distribution. Vol clustering means tomorrow\'s VARIANCE is predictable (and is, via GARCH), but tomorrow\'s mean isn\'t. There\'s no arbitrage opportunity in vol clustering for return prediction; only for vol-related instruments (options, vol-targeting strategies).' },
        { q: 'How does this map to the modeling cards that follow?',
          a: 'Cards 4-9 each address ONE stylized fact. ARMA → linear autocorrelation. Cointegration → long-run mean reversion. ARCH/GARCH → vol clustering. Stochastic vol → vol-of-vol + leverage. Rough vol → long memory in |r|. Jumps → tail mass. The lineup is engineered around this catalogue.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — AR / MA / ARMA / ARIMA
   The linear time-series toolbox. Wold theorem says any stationary process has
   an ARMA representation. Pure ARMA on returns rarely earns alpha, but it
   sets the linear baseline to beat.
   ========================================================================== */

const ArmaCard = () => {
  const [model, setModel] = useState('ar1');
  const [phi1, setPhi1] = useState(0.30);
  const [phi2, setPhi2] = useState(-0.20);
  const [theta1, setTheta1] = useState(0.40);

  // Simulate the chosen process for 300 steps
  const sim = useMemo(() => {
    const T = 300;
    const rand = mulberry32(7);
    const eps = Array.from({ length: T }, () => boxMuller(rand) * 0.5);
    const out = [];
    for (let t = 0; t < T; t++) {
      let r = eps[t];
      if (model === 'ar1') {
        r += phi1 * (out[t - 1] || 0);
      } else if (model === 'ar2') {
        r += phi1 * (out[t - 1] || 0) + phi2 * (out[t - 2] || 0);
      } else if (model === 'ma1') {
        r += theta1 * (eps[t - 1] || 0);
      } else if (model === 'arma11') {
        r += phi1 * (out[t - 1] || 0) + theta1 * (eps[t - 1] || 0);
      } else if (model === 'rw') {
        r = (out[t - 1] || 0) + eps[t];
      }
      out.push(r);
    }
    return out;
  }, [model, phi1, phi2, theta1]);

  // ACF / PACF on the simulated series
  const acfFn = (xs, maxLag) => {
    const m = xs.reduce((a, b) => a + b, 0) / xs.length;
    const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length;
    const out = [];
    for (let k = 1; k <= maxLag; k++) {
      let c = 0;
      for (let t = k; t < xs.length; t++) c += (xs[t] - m) * (xs[t - k] - m);
      out.push(c / xs.length / v);
    }
    return out;
  };
  const acfVals = useMemo(() => acfFn(sim, 20), [sim]);

  const W1 = 320, H1 = 130, P1 = 22;
  const sx1 = (i) => P1 + (i / sim.length) * (W1 - 2 * P1);
  const yMin = Math.min(...sim), yMax = Math.max(...sim);
  const sy1 = (v) => H1 - P1 - ((v - yMin) / (yMax - yMin || 1)) * (H1 - 2 * P1);
  const path = sim.map((v, i) => `${sx1(i).toFixed(1)},${sy1(v).toFixed(1)}`).join(' ');

  const W2 = 320, H2 = 110, P2 = 22;
  const sx2 = (i) => P2 + (i / 20) * (W2 - 2 * P2);
  const sy2 = (v) => H2 / 2 - v * (H2 / 2 - P2) / 0.8;
  const ciHigh2 = 1.96 / Math.sqrt(sim.length);

  const equations = {
    rw: '\\co{r_t} = r_{t-1} + \\varepsilon_t \\quad (\\text{unit root, non-stationary})',
    ar1: '\\co{r_t} = \\vi{\\phi_1}\\, r_{t-1} + \\varepsilon_t,\\quad |\\phi_1| < 1',
    ar2: '\\co{r_t} = \\vi{\\phi_1}\\, r_{t-1} + \\vi{\\phi_2}\\, r_{t-2} + \\varepsilon_t',
    ma1: '\\co{r_t} = \\varepsilon_t + \\vi{\\theta_1}\\, \\varepsilon_{t-1}',
    arma11: '\\co{r_t} = \\vi{\\phi_1}\\, r_{t-1} + \\varepsilon_t + \\vi{\\theta_1}\\, \\varepsilon_{t-1}',
  };
  const labels = { rw: 'Random walk', ar1: 'AR(1)', ar2: 'AR(2)', ma1: 'MA(1)', arma11: 'ARMA(1,1)' };

  return (
    <Card id="arma" icon={LineChart} title="AR · MA · ARMA · ARIMA" accent="violet" index={4}
          subtitle="Wold's theorem: any stationary process has an ARMA representation. Returns are nearly white noise on most assets, but the framework underlies cointegration, state-space, and eventually all linear time-series modeling.">
      <MinSchema>
        ARMA(p, q):{' '}
        <Eq>{'r_t = c + \\sum_{i=1}^{p} \\vi{\\phi_i} r_{t-i} + \\varepsilon_t + \\sum_{j=1}^{q} \\vi{\\theta_j} \\varepsilon_{t-j}'}</Eq>.
        AR persists the level; MA persists the shocks. ARIMA(p, d, q) = ARMA on d-th differences,
        for non-stationary series.
      </MinSchema>

      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(labels).map(([k, lab]) => (
          <button key={k} onClick={() => setModel(k)}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${model === k ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>

      <Block>{equations[model]}</Block>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          {(model === 'ar1' || model === 'ar2' || model === 'arma11') && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-violet-300 font-mono">φ₁</span>
                <span className="text-neutral-300 font-mono tabular-nums">{phi1.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.95" max="0.95" step="0.05" value={phi1}
                onChange={(e) => setPhi1(parseFloat(e.target.value))} className="mm-range w-full" />
            </div>
          )}
          {model === 'ar2' && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-violet-300 font-mono">φ₂</span>
                <span className="text-neutral-300 font-mono tabular-nums">{phi2.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.50" max="0.50" step="0.05" value={phi2}
                onChange={(e) => setPhi2(parseFloat(e.target.value))} className="mm-range w-full" />
            </div>
          )}
          {(model === 'ma1' || model === 'arma11') && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-cyan-300 font-mono">θ₁</span>
                <span className="text-neutral-300 font-mono tabular-nums">{theta1.toFixed(2)}</span>
              </div>
              <input type="range" min="-0.95" max="0.95" step="0.05" value={theta1}
                onChange={(e) => setTheta1(parseFloat(e.target.value))} className="mm-range w-full" />
            </div>
          )}
          <div className="text-[10px] text-neutral-500 leading-snug pt-1">
            {model === 'rw' && 'Unit root: ACF doesn\'t decay; series wanders without bound.'}
            {model === 'ar1' && 'AR(1): ACF decays geometrically as φ^k. PACF is non-zero only at lag 1.'}
            {model === 'ar2' && 'AR(2): ACF can oscillate (complex roots) or decay. PACF cuts off after lag 2.'}
            {model === 'ma1' && 'MA(1): ACF cuts off after lag 1 (= θ/(1+θ²)). PACF decays geometrically.'}
            {model === 'arma11' && 'ARMA(1,1): mixed signature. Both ACF and PACF tail off, distinguishing it from pure AR or MA.'}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">simulated series</div>
            <svg viewBox={`0 0 ${W1} ${H1}`} className="w-full h-auto">
              <line x1={P1} x2={W1 - P1} y1={H1 - P1} y2={H1 - P1} stroke="#525252" strokeWidth="0.5" />
              <polyline points={path} fill="none" stroke="#c4b5fd" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">ACF (lags 1-20)</div>
            <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-auto">
              <line x1={P2} x2={W2 - P2} y1={H2 / 2} y2={H2 / 2} stroke="#737373" strokeWidth="0.4" />
              <line x1={P2} x2={W2 - P2} y1={sy2(ciHigh2)} y2={sy2(ciHigh2)} stroke="#7dd3fc" strokeWidth="0.4" strokeDasharray="2,2" />
              <line x1={P2} x2={W2 - P2} y1={sy2(-ciHigh2)} y2={sy2(-ciHigh2)} stroke="#7dd3fc" strokeWidth="0.4" strokeDasharray="2,2" />
              {acfVals.map((c, i) => (
                <line key={i} x1={sx2(i + 1)} x2={sx2(i + 1)} y1={H2 / 2} y2={sy2(c)} stroke="#c4b5fd" strokeWidth="2" />
              ))}
              <text x={P2} y={H2 - 4} fontSize="8" fill="#737373" fontFamily="monospace">lag 1</text>
              <text x={W2 - P2} y={H2 - 4} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">20</text>
            </svg>
          </div>
        </div>
      </div>

      <Predict question="An AR(1) with φ=0.5 — what's the autocorrelation at lag 5?">
        <Eq>{'\\rho_5 = \\phi^5 = 0.5^5 = 0.03125'}</Eq>{' '}&mdash; about 3%, basically dead.
        AR(1) memory decays geometrically; even a strong-looking φ=0.5 forgets the past in ~6
        lags. To get long memory you need fractional integration (ARFIMA) or a process with
        slowly-decaying ACF, like rough volatility.
      </Predict>

      <Worked title="Worked example · why ARMA on returns rarely earns alpha">
        <p>
          Fit AR(1) to SPY daily log-returns (60 years): <Eq>{'\\hat\\phi \\approx 0.02'}</Eq>{' '}
          with SE 0.008. Statistically significant (t = 2.5) but economically tiny: it predicts
          1% of the return at t+1 from r_t. The R² is ~0.0004.
        </p>
        <p>
          Apply that to a strategy: hold +1 if r_t > 0, −1 if r_t &lt; 0, scaled by 1%. Backtested
          gross Sharpe ~0.05; net of costs (~5 bps round-trip) the strategy is negative. The
          edge exists statistically but is below the cost ceiling. <em>This is why pure linear
          ARMA on returns isn&apos;t the alpha source &mdash; it&apos;s the baseline to subtract
          before looking for nonlinear effects.</em>
        </p>
      </Worked>

      <Misconception
        wrong="ARIMA can predict prices because it includes differencing for non-stationarity."
        right="ARIMA(p,d,q) on prices reduces to ARMA(p,q) on returns once you difference. The 'I' just acknowledges that prices are random walks and requires you to model returns. ARIMA isn't more powerful for price prediction; it's a name for 'ARMA on differences'."
        because="Box-Jenkins methodology is: (1) check stationarity, (2) difference if needed, (3) identify p,q from ACF/PACF, (4) fit, (5) check residuals. Step 2 is what 'I' refers to. The differenced series IS the return series. Don't confuse the procedural label with a stronger model."
      />

      <WhenItMatters>
        Whenever you fit a linear model to returns or any time series. Always check ACF/PACF
        before and residuals after; always test for unit roots (ADF, KPSS); always do{' '}
        <CrossLink to="eval" recap="Forecast evaluation: walk-forward CV, log-likelihood, CRPS — the only honest validation for time-series models.">walk-forward validation</CrossLink>{' '}
        rather than in-sample fit.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Wold representation.</strong> Any stationary stochastic process can be written
          as an MA(∞):{' '}
          <Eq>{'r_t = \\sum_{j=0}^{\\infty} \\psi_j \\varepsilon_{t-j}'}</Eq>{' '}
          where <Eq>{'\\varepsilon_t'}</Eq> is white noise. ARMA approximates this with a rational
          function of the lag operator. The mathematical reason ARMA is the linear-time-series
          framework: it&apos;s as general as it can be in the linear-stationary class.
        </p>
        <p>
          <strong>Identification: ACF + PACF.</strong> AR(p): ACF tails off geometrically, PACF cuts
          off at lag p. MA(q): ACF cuts off at lag q, PACF tails off. ARMA(p,q): both tail off.
          The ACF/PACF signature is the diagnostic chart for choosing model orders before fitting.
        </p>
        <p>
          <strong>Estimation.</strong> Maximum likelihood via Kalman filter on the state-space
          representation. Closed-form least-squares is also possible for pure AR. Information
          criteria (<Term>AIC</Term>, <Term>BIC</Term>) for order selection. Statsmodels in Python,
          forecast / fable in R.
        </p>
        <p>
          <strong>Long memory: ARFIMA.</strong> Fractionally-integrated ARMA(p, d, q) with
          non-integer d ∈ (−0.5, 0.5). Allows ACF that decays as a power-law (k^{`{2d-1}`}) instead of
          geometrically. Useful for realized variance, which has long memory. Bridges linear ARMA
          with rough-volatility models (Hurst H = d + 0.5).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I use AR(1) for daily SPY returns?',
          a: 'No alpha to be had directly — the φ is tiny. But fitting AR(1) is a useful diagnostic step: confirms returns are nearly white noise, which justifies focusing modeling effort on vol, regimes, and cross-sectional features instead of linear time-series structure.' },
        { q: 'When does ARMA actually work?',
          a: 'For volatility (ACF strong), spreads (cointegrated pairs are stationary by construction), economic time series (GDP, CPI), and event durations. For raw returns at retail horizons, almost never.' },
        { q: 'How does this connect to the next card on cointegration?',
          a: 'Cointegration is "two non-stationary series whose linear combination IS stationary". The cointegrating residual is the ARMA-able series. The error-correction model puts ARMA dynamics on top of the long-run cointegrating relationship.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — MEAN REVERSION · COINTEGRATION · VAR / VECM
   Two non-stationary series can have a stationary linear combination — that's
   cointegration, the basis of pairs trading. ECM puts ARMA dynamics on the
   short-run; the cointegrating residual carries the long-run relationship.
   ========================================================================== */

const CointCard = () => {
  const [theta, setTheta] = useState(0.04);  // mean-reversion speed of spread
  const [beta, setBeta] = useState(1.0);     // hedge ratio
  const [seed, setSeed] = useState(3);

  // Simulate two cointegrated series: y2 = β·y1 + spread, where spread is OU
  const sim = useMemo(() => {
    const T = 500;
    const rand = mulberry32(seed);
    const y1 = [100], y2 = [], spread = [], u = 0;
    let lastSpread = 0;
    // y1 is a pure random walk (non-stationary)
    for (let t = 1; t < T; t++) {
      y1.push(y1[t - 1] + boxMuller(rand) * 1.0);
    }
    // spread = OU(θ, μ=0, σ=1)
    let s = 0;
    for (let t = 0; t < T; t++) {
      s = s - theta * s + boxMuller(rand) * 1.0;
      spread.push(s);
      y2.push(beta * y1[t] + s + 50); // additive offset for separation
    }
    // half-life
    const halfLife = theta > 0.001 ? Math.log(2) / theta : Infinity;
    return { y1, y2, spread, halfLife };
  }, [theta, beta, seed]);

  const W = 320, H = 200, P = 22;
  const allMin = Math.min(...sim.y1, ...sim.y2);
  const allMax = Math.max(...sim.y1, ...sim.y2);
  const sx = (i) => P + (i / sim.y1.length) * (W - 2 * P);
  const sy = (v) => H - P - ((v - allMin) / (allMax - allMin)) * (H - 2 * P) * 0.55;

  // Spread chart (separate scales)
  const W2 = 320, H2 = 90, P2 = 22;
  const sMin = Math.min(...sim.spread), sMax = Math.max(...sim.spread);
  const sx2 = (i) => P2 + (i / sim.spread.length) * (W2 - 2 * P2);
  const sy2 = (v) => H2 - 16 - ((v - sMin) / (sMax - sMin || 1)) * (H2 - 30);

  return (
    <Card id="coint" icon={GitBranch} title="Mean reversion · cointegration · VAR/VECM" accent="emerald" index={5}
          subtitle="Two random-walk prices may have a stationary linear combination — the cointegrating spread. Trade the spread, not the levels. Engle-Granger, error-correction, VECM.">
      <MinSchema>
        <Term>cointegration</Term>: <Eq>{'y_2 - \\beta y_1 \\sim I(0)'}</Eq>{' '}
        even though both <Eq>{'y_1, y_2 \\sim I(1)'}</Eq>. The residual{' '}
        <Eq>{'u_t = y_2 - \\beta y_1'}</Eq> is stationary and mean-reverting. Trade <em>that</em>;
        the levels are a random walk.
      </MinSchema>

      <Block>{'\\co{y_t = \\beta y_{1,t} + u_t} \\quad u_t \\sim \\text{OU}: \\quad du = -\\vi{\\theta}\\, u\\, dt + \\sigma\\, dW \\quad\\Rightarrow\\quad \\text{half-life} = \\frac{\\ln 2}{\\vi{\\theta}}'}</Block>

      <p>
        Two non-stationary series can move together. The simplest example: ETF A and ETF B both
        track the S&amp;P 500 with different fees &mdash; their prices are random walks, but the
        spread is a stationary OU process. Engle-Granger: regress y₂ on y₁, ADF-test the residuals
        for stationarity. If they pass, you have a tradeable mean-reverting spread.
      </p>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">θ · spread mean-reversion</span>
              <span className="text-neutral-300 font-mono tabular-nums">{theta.toFixed(3)}</span>
            </div>
            <input type="range" min="0.001" max="0.30" step="0.005" value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))} className="mm-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · random walk (no cointegration)</span><span>0.3 · fast revert</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-cyan-300 font-mono">β · hedge ratio</span>
              <span className="text-neutral-300 font-mono tabular-nums">{beta.toFixed(2)}</span>
            </div>
            <input type="range" min="0.5" max="1.5" step="0.05" value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="half-life" value={isFinite(sim.halfLife) ? `${sim.halfLife.toFixed(0)}d` : '∞'} sub="of the spread" color="text-emerald-300" />
            <Stat label="trade horizon" value={isFinite(sim.halfLife) ? `${(sim.halfLife * 0.7).toFixed(0)}d` : '∞'} sub="≈ 0.7 × half-life" color="text-amber-300" />
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">two cointegrated levels</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
            <polyline points={sim.y1.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#7dd3fc" strokeWidth="1" />
            <polyline points={sim.y2.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#fbbf24" strokeWidth="1" />
            <text x={P + 2} y={20} fontSize="8" fill="#7dd3fc" fontFamily="monospace">y₁ (random walk)</text>
            <text x={P + 2} y={32} fontSize="8" fill="#fbbf24" fontFamily="monospace">y₂ = β y₁ + spread</text>
            <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">500d</text>
          </svg>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1 mb-1">spread = stationary OU</div>
          <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-auto">
            <line x1={P2} x2={W2 - P2} y1={sy2(0)} y2={sy2(0)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,2" />
            <polyline points={sim.spread.map((v, i) => `${sx2(i).toFixed(1)},${sy2(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#86efac" strokeWidth="1" />
            <text x={P2 + 2} y={14} fontSize="8" fill="#86efac" fontFamily="monospace">spread reverts to 0</text>
          </svg>
        </div>
      </div>

      <Predict question="A spread with θ=0.10 / day. What's its half-life?">
        <Eq>{'\\text{half-life} = \\ln 2 / \\theta = 0.693 / 0.10 \\approx 7'}</Eq> days. A trade
        opened 1σ from the mean takes ~7 days to close half-way back. Pair-trading position
        horizons should be roughly the half-life; longer holds approach the long-run drift
        without further reversion.
      </Predict>

      <Worked title="Worked example · Engle-Granger two-step on a real pair">
        <p>
          <strong>Step 1.</strong> Regress log(GLD) on log(IAU) (both gold ETFs):{' '}
          <Eq>{'\\log P_2 = \\alpha + \\beta \\log P_1 + u_t'}</Eq>. With {'~10y daily data, β ≈ 0.998'}.
          Save residuals u_t.
        </p>
        <p>
          <strong>Step 2.</strong> Run augmented Dickey-Fuller (ADF) on u_t. p-value &lt; 0.01 →
          reject unit root → u_t is stationary → cointegrated. Estimate θ via the AR(1)
          coefficient on Δu = ρ u_{`{t-1}`} + ε; θ = −ρ &gt; 0 (typically 0.05-0.30 daily).
        </p>
        <p>
          <strong>Trade.</strong> When u_t exits ±2σ band, short the rich leg, long the cheap leg
          β-hedged. Close at u_t ≈ 0. With 200 round-trips per year at 0.3% gross edge each, the
          gross Sharpe is ~1.5; net of t-cost (≈10 bps round-trip) it&apos;s ~0.7. A real
          example of a strategy that&apos;s alive but capacity-limited.
        </p>
      </Worked>

      <Misconception
        wrong="If two stocks are highly correlated, they're cointegrated."
        right="Correlation is about returns moving together. Cointegration is about levels having a stationary linear combination. You can have high correlation with non-stationary spread (no cointegration) and low correlation with cointegrated levels."
        because="Two random walks can have correlation 0.95 (driven by both being long the same factor) yet their spread is itself a random walk — if the second one drifts faster than the first, the spread diverges. Engle-Granger and Johansen tests are specifically about LEVEL relationships; correlation is a returns-relationship statistic."
      />

      <WhenItMatters>
        Pairs trading, ETF arb, futures-vs-spot basis, cross-listed stocks (BDR vs ADR vs local
        listing). Anywhere two prices have a structural reason to move together. Cointegration
        is the formal expression of that reason.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Error-correction model (ECM).</strong>{' '}
          <Eq>{'\\Delta y_{2,t} = \\alpha + \\gamma \\cdot u_{t-1} + \\sum \\delta_i \\Delta y_{1,t-i} + \\sum \\eta_j \\Delta y_{2,t-j} + \\varepsilon_t'}</Eq>{' '}
          where γ &lt; 0 captures the speed of correction toward equilibrium. Combines short-run
          ARMA dynamics with the long-run cointegrating residual u_t. The Granger representation
          theorem says cointegration ⇔ ECM exists.
        </p>
        <p>
          <strong>Multivariate: VAR / VECM.</strong> VAR(p) generalizes AR to{' '}
          <Eq>{'\\mathbf{y}_t = \\mathbf{c} + \\sum A_i \\mathbf{y}_{t-i} + \\boldsymbol{\\varepsilon}_t'}</Eq>{' '}
          for an N-vector. If components are cointegrated, the proper form is a VECM:{' '}
          <Eq>{'\\Delta \\mathbf{y}_t = \\Pi \\mathbf{y}_{t-1} + \\sum \\Gamma_i \\Delta \\mathbf{y}_{t-i} + \\boldsymbol{\\varepsilon}_t'}</Eq>{' '}
          where rank(Π) = number of cointegrating relations. Johansen test estimates the rank.
        </p>
        <p>
          <strong>OU calibration.</strong> Discretize <Eq>{'du = -\\theta u\\, dt + \\sigma dW'}</Eq>{' '}
          to <Eq>{'u_{t+1} = (1-\\theta\\Delta t) u_t + \\sigma \\sqrt{\\Delta t} z_t'}</Eq>.
          Fit AR(1) to the spread; if AR coefficient is ρ, then θ = −log(ρ)/Δt. The half-life
          ln(2)/θ tells you the natural trade horizon.
        </p>
        <p>
          <strong>Why pairs trading is hard at retail scale.</strong> The edge per round-trip is
          small (10-50 bps), so realized Sharpe depends on round-trips per year, which depends on
          half-life. Half-life &lt; 5 days = many round-trips, but spread vol is small &amp; t-cost
          eats it. Half-life &gt; 100 days = capital tied up forever for one round-trip. The
          15-50 day band is the workable window for retail.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I find cointegrated pairs?',
          a: 'Domain knowledge first: same-asset different-listing (GLD/IAU, ASHR/MCHI), futures vs spot, sector ETF vs underlying basket. Then statistical: Johansen test on a basket of N candidates → look for rank ≥ 1. Avoid mining over thousands of pairs without correction — the multiple-testing inflation is huge.' },
        { q: 'What kills a cointegration?',
          a: 'Structural breaks: a regulatory change, a corporate action, a regime shift in the underlying business. Always re-test for stationarity periodically (rolling Johansen) and have a stop on drawdown. Cointegration regimes don\'t last forever.' },
        { q: 'Should I use Bayesian inference for the hedge ratio β?',
          a: 'For static β, OLS is fine. For time-varying β, use a Kalman-filter on a state-space model with β as the hidden state. Then the residual u_t becomes the dynamic spread. Cards 11 and 13 cover state-space and Bayesian estimation.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — ARCH / GARCH
   Engle 1982 + Bollerslev 1986. The vol-clustering modeling workhorse. σ_t² is
   a deterministic function of past squared shocks and past variances.
   ========================================================================== */

const GarchCard = () => {
  const [omega, setOmega] = useState(0.00002);
  const [alpha, setAlpha] = useState(0.10);
  const [beta, setBeta] = useState(0.85);
  const [seed, setSeed] = useState(7);

  const persist = alpha + beta;
  const stable = persist < 1;
  const halfLife = stable ? Math.log(0.5) / Math.log(persist) : Infinity;
  const longRunVar = stable ? omega / (1 - persist) : Infinity;
  const longRunVol = stable ? Math.sqrt(longRunVar * 252) * 100 : Infinity;

  // Simulate GARCH(1,1) for 500 days
  const sim = useMemo(() => {
    const T = 500;
    const rand = mulberry32(seed);
    let s2 = stable ? omega / (1 - persist) : 0.0001;
    const ret = [], vol = [];
    for (let t = 0; t < T; t++) {
      const z = boxMuller(rand);
      const r = Math.sqrt(s2) * z;
      ret.push(r);
      vol.push(Math.sqrt(s2));
      s2 = omega + alpha * r * r + beta * s2;
    }
    return { ret, vol };
  }, [omega, alpha, beta, seed, stable, persist]);

  const W = 320, H = 100, P = 22;
  const rMax = Math.max(...sim.ret.map(Math.abs));
  const sx = (i) => P + (i / sim.ret.length) * (W - 2 * P);
  const syR = (v) => H / 2 - (v / rMax) * (H / 2 - 12);
  const vMax = Math.max(...sim.vol);
  const syV = (v) => H - 12 - (v / vMax) * (H - 24);

  return (
    <Card id="garch" icon={Gauge} title="ARCH / GARCH" accent="amber" index={6}
          subtitle="The workhorse of volatility modeling. σ_t² recursion: Engle's ARCH (1982) became Bollerslev's GARCH (1986). Captures vol clustering; a great forecast for next-day vol.">
      <MinSchema>
        <Term>GARCH</Term>(1,1):{' '}
        <Eq>{'r_t = \\sigma_t z_t,\\quad \\sigma_t^2 = \\vi{\\omega} + \\vi{\\alpha} r_{t-1}^2 + \\vi{\\beta} \\sigma_{t-1}^2'}</Eq>.{' '}
        Conditional variance is a recursive function. Persistence{' '}
        <Eq>{'\\alpha + \\beta < 1'}</Eq> for stability; typical equity values{' '}
        <Eq>{'\\alpha \\approx 0.05, \\beta \\approx 0.90'}</Eq>.
      </MinSchema>

      <Block>{'\\co{\\sigma_t^2} = \\vi{\\omega} + \\vi{\\alpha}\\, r_{t-1}^2 + \\vi{\\beta}\\, \\sigma_{t-1}^2,\\quad \\co{\\sigma_\\infty^2} = \\frac{\\omega}{1 - \\alpha - \\beta},\\quad \\text{half-life} = \\frac{\\ln 0.5}{\\ln(\\alpha + \\beta)}'}</Block>

      <Predict question="GARCH(1,1) with α=0.05, β=0.93. What's the persistence and the vol-shock half-life?">
        Persistence = α + β = 0.98. Half-life = ln(0.5) / ln(0.98) ≈ 34 days. <em>Vol shocks
        decay over a month or more</em> &mdash; that&apos;s why you can predict tomorrow&apos;s
        vol with much higher accuracy than tomorrow&apos;s mean. For S&amp;P, persistence is
        typically 0.97-0.99; for single names, slightly lower.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">ω · long-run baseline</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(omega * 1e5).toFixed(2)}·10⁻⁵</span>
            </div>
            <input type="range" min="0.000005" max="0.0001" step="0.000005" value={omega}
              onChange={(e) => setOmega(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">α · ARCH (shock weight)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{alpha.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="0.30" step="0.01" value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">β · GARCH (memory)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{beta.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="0.99" step="0.01" value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="persistence" value={persist.toFixed(3)} sub={stable ? 'α+β · stable' : 'NON-stationary'} color={stable ? (persist > 0.95 ? 'text-amber-300' : 'text-emerald-300') : 'text-rose-300'} />
            <Stat label="half-life" value={isFinite(halfLife) ? `${halfLife.toFixed(0)}d` : '∞'} sub="of vol shocks" color="text-amber-300" />
            <Stat label="long-run vol" value={isFinite(longRunVol) ? `${longRunVol.toFixed(0)}%` : '∞'} sub="annualized" color="text-emerald-300" />
            <Stat label="ARCH only?" value={beta < 0.05 ? 'yes' : 'no'} sub="β tiny ⇒ ARCH(1)" color="text-neutral-300" />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">simulated returns</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H / 2} y2={H / 2} stroke="#525252" strokeWidth="0.5" />
              {sim.ret.map((r, i) => (
                <line key={i} x1={sx(i)} x2={sx(i)} y1={H / 2} y2={syR(r)} stroke="#fbbf24" strokeOpacity="0.7" strokeWidth="0.6" />
              ))}
              <text x={P + 2} y={14} fontSize="8" fill="#fbbf24" fontFamily="monospace">|r_t| (clusters!)</text>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">conditional vol σ_t</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H - 12} y2={H - 12} stroke="#525252" strokeWidth="0.5" />
              <polyline points={sim.vol.map((v, i) => `${sx(i).toFixed(1)},${syV(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#c4b5fd" strokeWidth="1.2" />
              <text x={P + 2} y={14} fontSize="8" fill="#c4b5fd" fontFamily="monospace">σ_t = √(ω + α r²_{`{t-1}`} + β σ²_{`{t-1}`})</text>
            </svg>
          </div>
        </div>
      </div>

      <Worked title="Worked example · why α+β so high?">
        <p>
          Empirical equity GARCH(1,1) almost always has α+β in [0.95, 0.99]. Three reasons:
          (a) <em>vol clustering is genuine</em> &mdash; high-vol regimes last weeks; (b) the
          single-state model underspecifies regimes (real markets switch between calm and
          crisis), so GARCH absorbs that into high persistence; (c) <em>integrated GARCH</em>
          (IGARCH, α+β=1) is a useful approximation for short-horizon vol forecasts.
        </p>
        <p>
          When α+β is very close to 1, the unconditional variance{' '}
          <Eq>{'\\sigma_\\infty^2 = \\omega/(1-\\alpha-\\beta)'}</Eq> blows up &mdash; the model
          says realized variance has no long-run mean. Use IGARCH or a regime-switching wrapper
          when you see this.
        </p>
      </Worked>

      <Misconception
        wrong="GARCH predicts whether tomorrow's return will be positive or negative."
        right="GARCH predicts the conditional VARIANCE σ²_t — how spread out tomorrow's return distribution will be. The mean is conditionally zero (or close to). Higher GARCH variance means bigger expected absolute moves, but the SIGN remains essentially unpredictable."
        because="GARCH explicitly models second moments only. The return r_t = σ_t · z_t with z_t a zero-mean innovation. So r_t has expected value 0; only the spread is forecast. Don't conflate vol forecasts with directional forecasts — they're orthogonal modeling targets."
      />

      <WhenItMatters>
        Anywhere you need a short-horizon vol forecast: dynamic position sizing, option pricing,
        risk budgeting, vol-targeting strategies. Every retail multi-strat book&apos;s vol-target
        is implicitly running EWMA or GARCH on realized vol.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Estimation: maximum likelihood.</strong> Under the Gaussian innovations
          assumption (z ∼ N(0,1)), the log-likelihood is{' '}
          <Eq>{'\\ell(\\theta) = -\\tfrac{1}{2}\\sum_t \\big(\\log \\sigma_t^2 + r_t^2/\\sigma_t^2\\big)'}</Eq>{' '}
          where σ²_t depends recursively on θ = (ω, α, β). Numerical optimization. Robust
          alternatives: t-distributed innovations or Quasi-MLE (still consistent under
          misspecified innovation distribution).
        </p>
        <p>
          <strong>Variants.</strong> EGARCH (Nelson 1991) models log σ², allowing leverage effect
          via an asymmetry term. Threshold-GARCH adds <Eq>{'\\gamma \\cdot \\mathbb{1}\\{r_{t-1}<0\\} r_{t-1}^2'}</Eq>.
          Component GARCH separates trend and short-term components. GARCH-MIDAS uses long-run
          (macro) vs short-run (daily) drivers. The zoo is large; pick based on what your data shows.
        </p>
        <p>
          <strong>Multivariate: DCC-GARCH.</strong> Engle 2002. Each asset has univariate GARCH;
          dynamic conditional correlation matrix updates via{' '}
          <Eq>{'Q_t = (1-a-b) \\bar{Q} + a\\, \\eta_{t-1} \\eta_{t-1}^T + b Q_{t-1}'}</Eq>.
          Computationally cheap; good first cut for time-varying covariance.
        </p>
        <p>
          <strong>Limitations.</strong> Gaussian-innovation GARCH still under-prices tail events
          (real fat tails come from BOTH vol clustering AND fat-tailed innovations). Kurtosis of
          GARCH residuals is typically ~5-7 rather than the empirical ~10-15. Stochastic-vol
          models (next card) and rough-vol address the residual.
        </p>
      </Deeper>

      <QA items={[
        { q: 'EWMA vs GARCH — which to use?',
          a: 'EWMA σ²_t = (1-λ) r²_{t-1} + λ σ²_{t-1} is a special case of GARCH(1,1) with ω=0 and α+β=1. Faster to compute, no calibration required (RiskMetrics uses λ=0.94). For quick risk overlay it\'s fine; for option pricing or formal forecasting use full GARCH.' },
        { q: 'How long a window for fitting?',
          a: 'Need at least 1000 observations for stable GARCH estimates (~4 years of daily data). With 500 obs, parameter SEs are large and α/β can swap. Fit on rolling windows; expect modest parameter drift.' },
        { q: 'Does GARCH replace volatility-of-volatility models?',
          a: 'No. GARCH says σ_t² is DETERMINISTIC given history. Stochastic vol (Heston) says σ_t² is itself a stochastic process with its own innovations. The next two cards cover that.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — STOCHASTIC VOLATILITY · HESTON / SABR
   Vol itself is stochastic. Heston is the canonical equity-vol model with a
   closed-form characteristic function (Fourier option pricing). SABR is the
   FX/rates analog.
   ========================================================================== */

const HestonCard = () => {
  const [kappa, setKappa] = useState(2.0);   // mean-reversion of variance
  const [theta, setTheta] = useState(0.04);  // long-run variance
  const [xi, setXi] = useState(0.4);         // vol-of-vol
  const [rho, setRho] = useState(-0.7);      // leverage correlation
  const [seed, setSeed] = useState(15);

  // Simulate Heston: dS/S = μ dt + √v dW¹; dv = κ(θ-v)dt + ξ√v dW²
  const sim = useMemo(() => {
    const T = 252, dt = 1 / 252;
    const rand = mulberry32(seed);
    let S = 1, v = theta;
    const sPath = [S], vPath = [Math.sqrt(v) * 100];
    const mu = 0.08;
    for (let t = 1; t <= T; t++) {
      const z1 = boxMuller(rand);
      const z2 = boxMuller(rand);
      // Correlate via Cholesky
      const w1 = z1, w2 = rho * z1 + Math.sqrt(1 - rho * rho) * z2;
      v = Math.max(0.001, v + kappa * (theta - v) * dt + xi * Math.sqrt(Math.max(0, v) * dt) * w2);
      S *= Math.exp((mu - 0.5 * v) * dt + Math.sqrt(Math.max(0, v) * dt) * w1);
      sPath.push(S);
      vPath.push(Math.sqrt(v) * 100);
    }
    return { sPath, vPath };
  }, [kappa, theta, xi, rho, seed]);

  const W = 320, H = 100, P = 22;
  const sx = (i) => P + (i / sim.sPath.length) * (W - 2 * P);
  const sMin = Math.min(...sim.sPath), sMax = Math.max(...sim.sPath);
  const sy = (v) => H - 12 - ((v - sMin) / (sMax - sMin || 1)) * (H - 24);
  const vMax = Math.max(...sim.vPath);
  const vMin = Math.min(...sim.vPath);
  const sy2 = (v) => H - 12 - ((v - vMin) / (vMax - vMin || 1)) * (H - 24);

  // Feller condition: 2κθ > ξ²
  const fellerOk = 2 * kappa * theta > xi * xi;

  return (
    <Card id="heston" icon={Sigma} title="Stochastic volatility · Heston / SABR" accent="fuchsia" index={7}
          subtitle="Vol is itself a stochastic process. Heston (1993) — variance follows CIR. Negative ρ generates the equity volatility skew. Closed-form option prices via Fourier inversion.">
      <MinSchema>
        <Term>Heston</Term>: vol-of-vol + mean reversion + leverage. Two SDEs:{' '}
        <Eq>{'dS/S = \\mu\\,dt + \\sqrt{v}\\,dW^1'}</Eq>{' '},{' '}
        <Eq>{'dv = \\vi{\\kappa}(\\vi{\\theta} - v)\\,dt + \\vi{\\xi}\\sqrt{v}\\,dW^2'}</Eq>{' '}
        with <Eq>{'\\mathrm{Cov}(dW^1, dW^2) = \\vi{\\rho}\\,dt'}</Eq>. Negative ρ → equity smirk.
      </MinSchema>

      <Block>{'\\co{dS_t} = \\mu S_t\\,dt + \\sqrt{v_t} S_t\\, dW^1_t \\qquad \\co{dv_t} = \\vi{\\kappa}(\\vi{\\theta} - v_t)\\,dt + \\vi{\\xi}\\sqrt{v_t}\\, dW^2_t,\\quad \\mathrm{Cov}(dW^1, dW^2) = \\vi{\\rho}\\,dt'}</Block>

      <p>
        GARCH says σ²_t is deterministic given history. Heston says σ²_t is itself stochastic
        with its own innovations &mdash; it has <em>vol-of-vol</em>. The four parameters are:
        κ (how fast vol mean-reverts), θ (long-run vol), ξ (vol-of-vol), ρ (leverage correlation).
        The standard equity calibration is κ ≈ 2-5, θ ≈ 0.04 (20% vol), ξ ≈ 0.3-0.6, ρ ≈ −0.5 to −0.8.
      </p>

      <Predict question="What does negative ρ produce in the option-implied volatility surface?">
        The <strong>equity volatility skew</strong>: out-of-money puts trade at higher implied vol
        than out-of-money calls. Mechanism: ρ &lt; 0 means down-moves come with vol spikes; OTM
        puts pay off precisely when vol explodes, so they&apos;re more valuable. Heston with
        ρ = −0.7 reproduces SPX&apos;s observed skew shape. Setting ρ = 0 gives a symmetric smile;
        ρ &gt; 0 gives a reverse smile (rare, mostly commodities).
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">κ · vol mean-reversion</span>
              <span className="text-neutral-300 font-mono tabular-nums">{kappa.toFixed(1)}</span>
            </div>
            <input type="range" min="0.5" max="10" step="0.1" value={kappa}
              onChange={(e) => setKappa(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">θ · long-run variance (√θ = vol)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{theta.toFixed(3)} (σ̄ {(Math.sqrt(theta) * 100).toFixed(0)}%)</span>
            </div>
            <input type="range" min="0.01" max="0.16" step="0.005" value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">ξ · vol-of-vol</span>
              <span className="text-neutral-300 font-mono tabular-nums">{xi.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="1.20" step="0.05" value={xi}
              onChange={(e) => setXi(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">ρ · leverage correlation</span>
              <span className="text-neutral-300 font-mono tabular-nums">{rho.toFixed(2)}</span>
            </div>
            <input type="range" min="-0.95" max="0.95" step="0.05" value={rho}
              onChange={(e) => setRho(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">presets:</span>
            <button onClick={() => { setKappa(2.0); setTheta(0.04); setXi(0.4); setRho(-0.7); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">SPX</button>
            <button onClick={() => { setKappa(1.0); setTheta(0.025); setXi(0.20); setRho(-0.3); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">EUR/USD</button>
            <button onClick={() => { setKappa(4.0); setTheta(0.09); setXi(0.8); setRho(0.4); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">crude oil</button>
          </div>
          <div className="text-[10px] mt-1 leading-snug" style={{ color: fellerOk ? '#86efac' : '#fb7185' }}>
            {fellerOk ? '✓ Feller condition 2κθ > ξ² holds — variance stays positive a.s.' : '✗ Feller violated — variance can hit 0; Euler-Maruyama discretisation may need full-truncation scheme'}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">price S_t</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H - 12} y2={H - 12} stroke="#525252" strokeWidth="0.5" />
              <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,2" />
              <polyline points={sim.sPath.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#fbbf24" strokeWidth="1.2" />
              <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">S₀</text>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">instantaneous vol √v_t (%)</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H - 12} y2={H - 12} stroke="#525252" strokeWidth="0.5" />
              <line x1={P} x2={W - P} y1={sy2(Math.sqrt(theta) * 100)} y2={sy2(Math.sqrt(theta) * 100)} stroke="#86efac" strokeWidth="0.4" strokeDasharray="2,2" />
              <text x={W - P} y={sy2(Math.sqrt(theta) * 100) - 3} fontSize="8" textAnchor="end" fill="#86efac" fontFamily="monospace">σ̄ = {(Math.sqrt(theta) * 100).toFixed(0)}%</text>
              <polyline points={sim.vPath.map((v, i) => `${sx(i).toFixed(1)},${sy2(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#f0abfc" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>

      <Worked title="Worked example · the volatility risk premium under Heston">
        <p>
          Under <Eq>{'\\mathbb{Q}'}</Eq> (risk-neutral), Heston has a different κ from <Eq>{'\\mathbb{P}'}</Eq>{' '}
          (physical). The premium <Eq>{'\\lambda'}</Eq> &mdash; Heston&apos;s volatility risk premium
          parameter &mdash; encodes how much investors pay for vol exposure. Empirically{' '}
          <Eq>{'\\lambda < 0'}</Eq>: investors pay TO avoid vol &mdash; sellers of vol get
          compensated.
        </p>
        <p>
          That parameter generates the structural{' '}
          <CrossLink to="retail-quant" external recap="Variance risk premium: IV − RV gap, the structural pay for vol-bearing.">VRP</CrossLink>{' '}
          empirically observed (~3-5 vol points). Heston is the canonical model in which to
          formalize it; subsequent work extends to rough vol (Bergomi 2014) and term-structure of VRP.
        </p>
      </Worked>

      <Misconception
        wrong="Heston is the standard option-pricing model; it should be used everywhere."
        right="Heston has known issues: (a) it can't generate enough term-structure variation in vol-of-vol — the implied-vol surface for short-dated options is too smooth. (b) variance can be 0 if Feller fails. (c) for index options the empirical fit at short maturities is poor. Modern desks use rough vol or local-stochastic-vol blends."
        because="The Heston PDE has a closed-form characteristic function — that's its main advantage (fast Fourier-based pricing). But the SDE assumes integer-order Brownian innovations on the variance, which doesn't match the empirical roughness of realized variance (Hurst H ≈ 0.1 << 0.5). Rough Bergomi (next card) fixes that with fractional Brownian innovations on log variance."
      />

      <WhenItMatters>
        Anywhere you price options on equities (delta-neutral or beyond), forecast vol-of-vol
        (e.g. for variance swap pricing), or want a parametric model of the implied-vol skew. For
        retail vol-selling, Heston is overkill, but the intuition (vol-of-vol, leverage) is foundational.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Closed-form characteristic function.</strong>{' '}
          <Eq>{'\\phi_T(u) = \\mathbb{E}[e^{i u \\log S_T}]'}</Eq>{' '}
          has an explicit formula (Heston 1993) involving exponentials and complex logarithms.
          Vanilla European options price via the Carr-Madan formula or COS method, both single
          numerical integrals. Order-of-magnitude faster than Monte Carlo.
        </p>
        <p>
          <strong>SABR for FX / rates.</strong>{' '}
          <Eq>{'dF = \\sigma F^\\beta dW^1,\\quad d\\sigma = \\nu \\sigma dW^2'}</Eq>{' '}
          with corr(W^1, W^2) = ρ. Hagan&apos;s asymptotic formula gives a closed-form smile
          approximation, the standard for swaption pricing. β = 0 is normal SABR; β = 1
          is lognormal SABR.
        </p>
        <p>
          <strong>Calibration.</strong> Match Heston to a market-quoted volatility surface by
          minimizing the sum of squared errors between model and market implied vols across
          (strike, expiry) grid. The optimization is non-convex but tractable for ~5 parameters.
          Re-calibrate daily; expect parameter drift.
        </p>
        <p>
          <strong>Limitations going forward.</strong> Heston&apos;s vol generates short-dated implied
          vol that&apos;s too smooth. Empirical SPX implied vol is much &ldquo;rougher&rdquo; in
          time-to-expiry than Heston predicts. Rough volatility (next card) replaces classical
          Brownian innovations on variance with fractional Brownian motion of Hurst exponent ≈ 0.1.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why does ρ generate the equity skew?',
          a: 'Negative correlation between price and vol means: when price falls, vol rises. OTM puts gain in BOTH (a) probability of being ITM and (b) higher vol path. Both make them more expensive than Black-Scholes (constant-vol) would suggest. The asymmetry shows up as higher implied vol on OTM puts than OTM calls.' },
        { q: 'Heston vs GARCH — which is right?',
          a: 'Different questions. GARCH: discrete-time vol forecast given history. Heston: continuous-time price + vol joint dynamics for option pricing. Both have vol mean-reversion; Heston adds vol-of-vol. For pricing options, use Heston; for risk overlay on a daily basis, GARCH is fine.' },
        { q: 'Is the SPY vol surface really matched by Heston?',
          a: 'Approximately. Heston gives the right skew direction and rough magnitude; it under-fits the short-end smile (need rough vol), under-fits the deep-OTM tails (need jumps), and under-fits the term-structure of vol-of-vol. The "next-generation" workhorses are Bates (Heston + jumps), rough Bergomi, or local-stochastic-vol blends.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — ROUGH VOLATILITY · BERGOMI / GATHERAL
   Realized variance has Hurst ~0.1 — much rougher than BM (H=0.5). Replacing
   the variance's BM driver with fractional BM matches empirics dramatically
   better. Bergomi 2014, Gatheral-Jaisson-Rosenbaum 2018.
   ========================================================================== */

const RoughVolCard = () => {
  const [H, setH] = useState(0.10);  // Hurst exponent
  const [seed, setSeed] = useState(5);

  // Approximate fractional BM via the Cholesky of its covariance matrix:
  // Cov(B^H_s, B^H_t) = 0.5 (s^{2H} + t^{2H} - |t-s|^{2H})
  // For demo, use Hosking's algorithm or the simpler Davies-Harte. Here we use a small
  // Cholesky on T=80 grid to keep things fast.
  const sim = useMemo(() => {
    const T = 80;
    const dt = 1 / T;
    const cov = (s, t) => 0.5 * (Math.pow(s, 2 * H) + Math.pow(t, 2 * H) - Math.pow(Math.abs(t - s), 2 * H));
    const C = Array.from({ length: T }, (_, i) => Array.from({ length: T }, (_, j) => cov((i + 1) * dt, (j + 1) * dt)));
    // Cholesky decomposition L L^T = C (lower triangular)
    const L = Array.from({ length: T }, () => Array(T).fill(0));
    for (let i = 0; i < T; i++) {
      for (let j = 0; j <= i; j++) {
        let s = 0;
        for (let k = 0; k < j; k++) s += L[i][k] * L[j][k];
        if (i === j) {
          L[i][j] = Math.sqrt(Math.max(1e-12, C[i][i] - s));
        } else {
          L[i][j] = (C[i][j] - s) / L[j][j];
        }
      }
    }
    const rand = mulberry32(seed);
    const z = Array.from({ length: T }, () => boxMuller(rand));
    const fbm = L.map(row => row.reduce((acc, x, k) => acc + x * z[k], 0));
    // Convert to vol path: σ_t = σ_0 · exp(η · B^H_t - 0.5 · η² · t^{2H})
    const eta = 1.5, sigma0 = 0.20;
    const vol = fbm.map((b, i) => sigma0 * Math.exp(eta * b - 0.5 * eta * eta * Math.pow((i + 1) * dt, 2 * H)));
    return { fbm, vol };
  }, [H, seed]);

  const W = 320, H_PX = 110, P = 22;
  const T = sim.fbm.length;
  const sx = (i) => P + (i / T) * (W - 2 * P);

  const fbmMax = Math.max(...sim.fbm.map(Math.abs));
  const sy1 = (v) => H_PX / 2 - (v / fbmMax) * (H_PX / 2 - 12);
  const volMax = Math.max(...sim.vol);
  const volMin = Math.min(...sim.vol);
  const sy2 = (v) => H_PX - 12 - ((v - volMin) / (volMax - volMin || 1)) * (H_PX - 24);

  return (
    <Card id="roughvol" icon={Atom} title="Rough volatility · Bergomi / Gatheral" accent="fuchsia" index={8}
          subtitle="Empirical realized vol has Hurst H ≈ 0.1, much rougher than the H = 0.5 of standard BM. Replacing variance's Brownian driver with fractional Brownian motion fits the entire vol surface dramatically better.">
      <MinSchema>
        Bergomi 2014 / Gatheral-Jaisson-Rosenbaum 2018: log-variance is driven by{' '}
        <Term>fractional Brownian motion</Term> with Hurst{' '}
        <Eq>{'\\vi{H} \\approx 0.1'}</Eq>:{' '}
        <Eq>{'\\log \\sigma^2_t = \\xi(t) + \\eta B^H_t - \\tfrac{1}{2}\\eta^2 t^{2H}'}</Eq>.
        Far rougher than the H = 0.5 of classical SV (Heston).
      </MinSchema>

      <Block>{'\\co{\\mathrm{Cov}(B^H_s, B^H_t)} = \\tfrac{1}{2}\\!\\left(s^{2H} + t^{2H} - |t-s|^{2H}\\right) \\quad\\Rightarrow\\quad \\sigma_t \\sim \\exp\\!\\Big(\\vi{\\eta}\\, B^H_t\\Big)'}</Block>

      <Predict question="What does H ≈ 0.1 imply about volatility paths vs H = 0.5 (Heston)?">
        Sample paths are <em>much rougher</em>: nowhere differentiable, with effective &ldquo;random
        walk&rdquo; behavior on every timescale. Empirically H ≈ 0.1-0.13 across all major equity
        indices. The Brownian H=0.5 of Heston is way too smooth to fit option-implied vol at
        short maturities; rough vol fixes the &ldquo;smile-flattening&rdquo; problem in Heston.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">Hurst exponent H</span>
              <span className="text-neutral-300 font-mono tabular-nums">{H.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="0.95" step="0.01" value={H}
              onChange={(e) => setH(parseFloat(e.target.value))} className="mm-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0.05 · very rough</span><span>0.50 · BM</span><span>0.95 · very smooth</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">presets:</span>
            <button onClick={() => setH(0.10)} className="text-[10px] rounded border border-fuchsia-400/30 bg-fuchsia-400/5 hover:bg-fuchsia-400/15 text-fuchsia-200 px-2 py-0.5 font-mono">empirical RV (0.10)</button>
            <button onClick={() => setH(0.50)} className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">BM / Heston (0.50)</button>
            <button onClick={() => setH(0.85)} className="text-[10px] rounded border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/15 text-cyan-200 px-2 py-0.5 font-mono">smooth (0.85)</button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug pt-1">
            H&lt;0.5: anti-persistent (rough). H=0.5: standard BM. H&gt;0.5: persistent (smooth, momentum-like).
            For realized vol, all major equity indices and FX show H ∈ [0.07, 0.15] — universal.
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">fractional Brownian motion B^H_t</div>
            <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H_PX / 2} y2={H_PX / 2} stroke="#737373" strokeWidth="0.4" />
              <polyline points={sim.fbm.map((v, i) => `${sx(i).toFixed(1)},${sy1(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#f0abfc" strokeWidth="1.2" />
              <text x={P + 2} y={14} fontSize="8" fill="#f0abfc" fontFamily="monospace">B^H · H={H.toFixed(2)}</text>
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">implied vol path σ_t</div>
            <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H_PX - 12} y2={H_PX - 12} stroke="#525252" strokeWidth="0.5" />
              <polyline points={sim.vol.map((v, i) => `${sx(i).toFixed(1)},${sy2(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#fbbf24" strokeWidth="1.2" />
              <text x={P + 2} y={14} fontSize="8" fill="#fbbf24" fontFamily="monospace">σ_t = σ₀ exp(η B^H - ½η²t^{`{2H}`})</text>
            </svg>
          </div>
        </div>
      </div>

      <Worked title="Worked example · why rough vol fixes the at-the-money smile">
        <p>
          The ATM implied-vol smile under Heston flattens too quickly with maturity: as T → 0,
          ATM vol skew goes to a finite limit. Empirically, ATM skew DIVERGES like{' '}
          <Eq>{'T^{H - 1/2}'}</Eq>{' '}
          as T → 0 (Bayer-Friz-Gatheral 2016). With H ≈ 0.1, that&apos;s{' '}
          <Eq>{'T^{-0.4}'}</Eq>{' '}
          &mdash; a clear blow-up. Heston&apos;s H = 0.5 gives <Eq>{'T^0 = 1'}</Eq> (no
          divergence). Empirical SPX skew matches the rough-vol prediction.
        </p>
        <p>
          Same story for short-dated implied vol: rough vol fits within the bid-ask of every
          listed expiry, while Heston needs to be re-calibrated for each expiry separately.
          Bergomi 2014 wrote it up; Gatheral-Jaisson-Rosenbaum 2018 (&ldquo;Volatility is
          rough&rdquo;) ran the empirical validation across 11 equity indices.
        </p>
      </Worked>

      <Misconception
        wrong="Rough vol is the same as adding jumps to a stochastic-vol model."
        right="Different mechanisms. Jumps add discrete discontinuities (Poisson arrivals); rough vol adds CONTINUOUS but very-irregular paths (Hurst < 0.5). Both increase short-dated implied vol; only rough vol matches the T^{H-1/2} skew divergence. The most realistic models combine both."
        because="Empirically, equity-index returns show three pathologies: skew that diverges at short T (rough vol fixes), kurtosis at short T (jumps fix), and term-structure of vol-of-vol (multifactor SV fixes). Each demands a different feature; the SOTA equity model in 2024 combines rough vol + jumps + 2-factor variance."
      />

      <WhenItMatters>
        Pricing options at expiries &lt; 30 days, calibrating implied-vol surfaces, or
        understanding why Heston-based desks have to constantly re-calibrate. For risk
        management on long-horizon books, rough vs Heston matters less.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Empirical Hurst estimation.</strong> Compute realized variance over T-day
          windows; regress log RV variance on log T. The slope is{' '}
          <Eq>{'2H'}</Eq>. Across SPX, EURUSD, FTSE, DAX (1990s-2010s daily data), H estimates
          consistently land in [0.07, 0.13]. This is one of the most robust empirical findings
          in financial econometrics in the last decade.
        </p>
        <p>
          <strong>Why is vol so rough?</strong> No closed theory yet. Candidate explanations:
          (a) Hawkes-process clustering of order arrivals (microstructure feedback);
          (b) limit-order-book reflexivity (Bouchaud, Bonart, Donier, Gould 2018);
          (c) news-arrival self-similarity. Any of these reproduces fractional behavior in the
          limit. Active research area.
        </p>
        <p>
          <strong>Computational cost.</strong> Rough vol is harder than Heston: no characteristic
          function, no Markov property, simulation is O(T²) via Cholesky or O(T log T) via
          hybrid schemes. For pricing, hybrid Bergomi (Bayer-Friz-Gatheral 2016) is the workhorse;
          for risk, simpler 2-factor Bergomi approximations are used.
        </p>
        <p>
          <strong>Rough Heston.</strong> El Euch-Rosenbaum 2018 introduced rough Heston: Heston
          with the variance driven by fBM. Has a Riccati-PDE-like characteristic function (no
          longer closed-form, but tractable). Combines the calibration speed of Heston with the
          empirical fit of rough vol. State of the art for equity index options.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Is rough vol useful for retail vol-selling?',
          a: 'Indirectly. Retail vol-selling typically operates on ATM monthly options where Heston suffices for back-of-envelope risk. The intuition that vol surfaces have term-structure that classical SV misses helps you understand WHY desks reprice frequently — but doesn\'t change the trade.' },
        { q: 'Can I fit rough vol on daily data?',
          a: 'For Hurst estimation, yes — daily data over many years gives stable H estimates. For trading, you need higher-frequency vol estimates (5-min realized variance) to see the rough behavior at horizons where it matters most.' },
        { q: 'How does this connect to long-memory ARFIMA?',
          a: 'Direct. Fractional Brownian motion with Hurst H is the continuous-time limit of fractionally-integrated noise with d = H − 0.5. So ARFIMA(p, d=−0.4, q) on log realized variance is a discrete-time analog of rough vol with H = 0.1. Same math, different vocabulary.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — JUMPS & LÉVY PROCESSES
   Discrete price jumps (earnings, macro events, gap-opens). Merton 1976
   (Gaussian jumps), Kou (double-exponential), variance-gamma (infinite activity).
   Lévy-Khintchine: drift + BM + jump measure.
   ========================================================================== */

const JumpsCard = () => {
  const [lambda, setLambda] = useState(2.0);   // jumps per year
  const [muJ, setMuJ] = useState(-0.03);       // mean jump size in log-return
  const [sigJ, setSigJ] = useState(0.04);      // jump vol
  const [seed, setSeed] = useState(9);

  const sim = useMemo(() => {
    const T = 252, dt = 1 / 252;
    const rand = mulberry32(seed);
    let s = 1;
    const sPath = [s];
    const ret = [];
    const jumps = [];
    const sig = 0.16, mu = 0.07;
    for (let t = 1; t <= T; t++) {
      const z = boxMuller(rand);
      let r = (mu - 0.5 * sig * sig) * dt + sig * Math.sqrt(dt) * z;
      // Jump arrival via Bernoulli over dt
      let jumped = 0;
      if (rand() < lambda * dt) {
        const jz = boxMuller(rand);
        const j = muJ + sigJ * jz;
        r += j;
        jumped = j;
      }
      s *= Math.exp(r);
      sPath.push(s);
      ret.push(r);
      jumps.push(jumped);
    }
    // Stats
    const m = ret.reduce((a, b) => a + b, 0) / ret.length;
    const v = ret.reduce((a, b) => a + (b - m) * (b - m), 0) / ret.length;
    const sd = Math.sqrt(v);
    const k = ret.reduce((acc, x) => acc + Math.pow((x - m) / sd, 4), 0) / ret.length;
    const sk = ret.reduce((acc, x) => acc + Math.pow((x - m) / sd, 3), 0) / ret.length;
    return { sPath, ret, jumps, k, sk };
  }, [lambda, muJ, sigJ, seed]);

  const W = 320, H = 100, P = 22;
  const sx = (i) => P + (i / sim.sPath.length) * (W - 2 * P);
  const sMin = Math.min(...sim.sPath), sMax = Math.max(...sim.sPath);
  const sy = (v) => H - 12 - ((v - sMin) / (sMax - sMin || 1)) * (H - 24);

  // returns histogram
  const bins = 30, xMin = -0.10, xMax = 0.10;
  const binW = (xMax - xMin) / bins;
  const hist = new Array(bins).fill(0);
  sim.ret.forEach(r => {
    const idx = Math.floor((r - xMin) / binW);
    if (idx >= 0 && idx < bins) hist[idx]++;
  });
  const maxC = Math.max(...hist);
  const W2 = 320, H2 = 100, P2 = 22;
  const sx2 = (v) => P2 + ((v - xMin) / (xMax - xMin)) * (W2 - 2 * P2);

  return (
    <Card id="jumps" icon={Zap} title="Jumps & Lévy processes" accent="rose" index={9}
          subtitle="Discrete price jumps from earnings, macro releases, gap-opens. Merton 1976: GBM + Gaussian-jump compound Poisson. Lévy-Khintchine: any process with stationary independent increments has a (drift, BM, jump-measure) triple.">
      <MinSchema>
        <Term>jump-diffusion</Term>:{' '}
        <Eq>{'dS/S = \\mu\\,dt + \\sigma\\,dW + (e^J - 1)\\,dN'}</Eq>{' '}
        with N a Poisson process of intensity λ and J ~ N(μ_J, σ_J²) (Merton). Adds the
        empirically-needed tail mass that pure GBM misses.
      </MinSchema>

      <Block>{'\\co{dS/S} = (\\mu - \\lambda \\bar{k})\\,dt + \\sigma\\,dW + (e^J - 1)\\,dN_t,\\quad N_t \\sim \\mathrm{Poisson}(\\vi{\\lambda} t),\\quad J \\sim \\mathcal{N}(\\vi{\\mu_J}, \\vi{\\sigma_J^2})'}</Block>

      <Predict question="A model with λ=3 jumps/year, μ_J=−3%, σ_J=4%. What's the kurtosis of daily returns vs no-jumps GBM?">
        Without jumps: kurtosis = 3 (Gaussian). With these jumps: kurtosis ≈ 8-12 depending on
        diffusion vol. Each jump contributes <Eq>{'(\\mu_J^2 + \\sigma_J^2)^2 / \\sigma_J^4'}</Eq>{' '}
        excess. Three jumps/year = ~1 jump every 84 trading days, which is roughly the SPY
        empirical frequency for ±3σ daily moves. The simulation below shows the tail mass.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">λ · jumps per year</span>
              <span className="text-neutral-300 font-mono tabular-nums">{lambda.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="10" step="0.1" value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">μ_J · mean jump (log-ret)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(muJ * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.10" max="0.05" step="0.005" value={muJ}
              onChange={(e) => setMuJ(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">σ_J · jump vol</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sigJ * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0" max="0.12" step="0.005" value={sigJ}
              onChange={(e) => setSigJ(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed} · 1y daily simulation</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">presets:</span>
            <button onClick={() => { setLambda(0); setMuJ(0); setSigJ(0); }} className="text-[10px] rounded border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/15 text-cyan-200 px-2 py-0.5 font-mono">no jumps (GBM)</button>
            <button onClick={() => { setLambda(3); setMuJ(-0.03); setSigJ(0.04); }} className="text-[10px] rounded border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/15 text-amber-200 px-2 py-0.5 font-mono">SPX-realistic</button>
            <button onClick={() => { setLambda(0.5); setMuJ(-0.15); setSigJ(0.08); }} className="text-[10px] rounded border border-rose-400/30 bg-rose-400/5 hover:bg-rose-400/15 text-rose-200 px-2 py-0.5 font-mono">crisis-style</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="kurtosis" value={sim.k.toFixed(1)} sub={sim.k > 4 ? 'fat tails' : 'near Gaussian'} color={sim.k > 6 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="skewness" value={sim.sk.toFixed(2)} sub={sim.sk < -0.3 ? 'left-skewed' : 'symmetric'} color={sim.sk < -0.3 ? 'text-rose-300' : 'text-emerald-300'} />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">price path (jumps in red)</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H - 12} y2={H - 12} stroke="#525252" strokeWidth="0.5" />
              <polyline points={sim.sPath.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#fbbf24" strokeWidth="1" />
              {sim.jumps.map((j, i) => Math.abs(j) > 0.001 ? (
                <circle key={i} cx={sx(i + 1)} cy={sy(sim.sPath[i + 1])} r={2.5} fill="#fb7185" stroke="#0a0a0a" strokeWidth="0.5" />
              ) : null)}
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">return distribution (fat tails!)</div>
            <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-auto">
              <line x1={P2} x2={W2 - P2} y1={H2 - 12} y2={H2 - 12} stroke="#525252" strokeWidth="0.5" />
              {hist.map((c, i) => {
                const x = sx2(xMin + i * binW);
                const w = (W2 - 2 * P2) / bins;
                const h = (c / maxC) * (H2 - 24);
                const isTail = (xMin + (i + 0.5) * binW) < -0.04 || (xMin + (i + 0.5) * binW) > 0.04;
                return <rect key={i} x={x} y={H2 - 12 - h} width={Math.max(1, w - 0.4)} height={h} fill={isTail ? '#fb7185' : '#7dd3fc'} fillOpacity="0.55" />;
              })}
              <text x={P2 + 2} y={14} fontSize="8" fill="#fb7185" fontFamily="monospace">tails &gt; |4%|</text>
            </svg>
          </div>
        </div>
      </div>

      <Worked title="Worked example · earnings as a jump event">
        <p>
          A typical large-cap before earnings: implied vol elevated, price flat. After earnings:
          a jump of ±5-10% with probability ~0.6 (volatility-of-volatility crash) or near-zero
          move otherwise. Modeling this as continuous diffusion misses the bimodality entirely;
          a single-day jump-diffusion (λ=1 on the day, σ_J ≈ 5%) captures it.
        </p>
        <p>
          Pricing the pre-earnings options under jump-diffusion vs GBM: GBM under-prices the
          straddle by ~30-50% because it can&apos;t reproduce the bimodal post-earnings
          distribution. Variance-gamma and CGMY processes are the analytic alternatives;
          finite-activity jump-diffusion is the most-used in practice.
        </p>
      </Worked>

      <Misconception
        wrong="Adding jumps is a hack to fit fat tails — rough vol or fat-tail innovations would be cleaner."
        right="They model different mechanisms. Jumps capture truly discontinuous information arrivals (earnings, macro releases, news shocks) — something IS happening at a specific moment. Rough vol captures continuous-but-irregular variance dynamics. Both empirical signatures coexist; production option-pricing models often combine them (rough Heston + jumps)."
        because="An overnight gap-open from $100 to $90 on a missed earnings call is a jump in any meaningful sense — the underlying news is discrete. Modeling it as 'extreme but continuous diffusion' over a 16-hour window is a fudge. Conversely, intraday vol fluctuations during a calm trading day are continuous + irregular = rough. Both features exist; both belong in the model when relevant."
      />

      <WhenItMatters>
        Pricing OTM puts (which are tail trades; jump models give meaningfully different prices),
        risk management around scheduled events (earnings, FOMC), and regime-aware backtesting
        where ignoring jumps makes the strategy look better than it really is.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Lévy-Khintchine.</strong> Any Lévy process X has characteristic function{' '}
          <Eq>{'\\mathbb{E}[e^{i u X_t}] = e^{t \\psi(u)}'}</Eq>{' '}
          with <Eq>{'\\psi(u) = i \\gamma u - \\tfrac{1}{2}\\sigma^2 u^2 + \\int (e^{i u x} - 1 - i u x \\mathbb{1}_{|x|<1})\\nu(dx)'}</Eq>.
          The triple (γ, σ², ν) is the drift, BM coefficient, and jump-measure. Specifies any
          process with stationary independent increments.
        </p>
        <p>
          <strong>Variance gamma (Madan-Carr-Chang 1998).</strong> Lévy process with{' '}
          <em>infinite activity</em>: small jumps arrive infinitely often. Makes the path purely
          jumpy (no BM component) yet continuous. Three parameters; popular alternative to
          Merton for option pricing because the jump distribution is endogenous, not bolted on.
          Generalized to CGMY (Carr-Geman-Madan-Yor 2002).
        </p>
        <p>
          <strong>Stochastic intensity (Hawkes).</strong> Real jumps cluster: one big move begets
          another (volatility spillovers). Hawkes processes (next card&apos;s &ldquo;Hawkes&rdquo;{' '}
          <CrossLink to="micro" recap="Microstructure: Hawkes process for self-exciting jumps in order flow.">microstructure</CrossLink>)
          give state-dependent λ_t = μ + Σ φ(t − t_i). Closer to empirical clustering than
          constant-λ Poisson.
        </p>
        <p>
          <strong>Jump detection from data.</strong> Bipower variation (Barndorff-Nielsen-Shephard
          2004): the difference between realized variance and bipower variation isolates the
          jump component. Lee-Mykland 2008 detector: identifies individual jump times. Standard
          tools in HF data analysis.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I distinguish a true jump from a fast diffusion?',
          a: 'Time scale. Diffusion rms move scales as σ√Δt; a jump has a finite move regardless of Δt. Empirically, a 5σ-of-realized-vol move in 5 minutes is a jump; the same move spread over a day is fast diffusion. Bipower variation tests formalize this.' },
        { q: 'Do jumps add edge for retail?',
          a: 'For pricing: yes — short-dated OTM options include jump premium that constant-vol models miss. For directional alpha: no — jump arrival times are essentially unpredictable. The edge is in pricing the contingent payoff, not predicting the jump.' },
        { q: 'Variance-gamma vs Merton — which is "better"?',
          a: 'Variance-gamma fits the implied vol surface marginally better at very short maturities (no diffusion smoothing the tails). Merton is much easier to interpret and calibrate. Production option desks usually use Merton or its extension to Heston (Bates 1996 = Heston + jumps).' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — FACTOR MODELS · CAPM → Fama-French → APT → Fama-MacBeth
   The cross-sectional explanatory framework. Each factor is a portfolio
   capturing a risk premium; betas measure exposure; residual is alpha.
   ========================================================================== */

const FactorsCard = () => {
  const [model, setModel] = useState('ff5');
  const [bMkt, setBMkt] = useState(1.0);
  const [bSize, setBSize] = useState(0.0);
  const [bVal, setBVal] = useState(0.0);
  const [bMom, setBMom] = useState(0.0);
  const [bProf, setBProf] = useState(0.0);
  const [bInv, setBInv] = useState(0.0);

  // Annualized factor premia (long-run estimates)
  const premia = { mkt: 0.07, smb: 0.025, hml: 0.035, mom: 0.060, rmw: 0.030, cma: 0.025 };

  // Active factors per model
  const activeFactors = {
    capm:    ['mkt'],
    ff3:     ['mkt', 'smb', 'hml'],
    ff5:     ['mkt', 'smb', 'hml', 'rmw', 'cma'],
    carhart: ['mkt', 'smb', 'hml', 'mom'],
  };
  const factorBetas = { mkt: bMkt, smb: bSize, hml: bVal, mom: bMom, rmw: bProf, cma: bInv };
  const factorColors = { mkt: '#7dd3fc', smb: '#86efac', hml: '#fbbf24', mom: '#fda4af', rmw: '#c4b5fd', cma: '#67e8f9' };
  const factorLabels = { mkt: 'Market', smb: 'Size (SMB)', hml: 'Value (HML)', mom: 'Momentum (UMD)', rmw: 'Profitability (RMW)', cma: 'Investment (CMA)' };

  const expectedReturn = activeFactors[model].reduce((s, f) => s + factorBetas[f] * premia[f], 0);

  const labels = { capm: 'CAPM (1)', ff3: 'Fama-French 3', ff5: 'FF 5-factor', carhart: 'Carhart 4' };

  return (
    <Card id="factors" icon={Layers} title="Factor models · CAPM → Fama-French → APT" accent="sky" index={10}
          subtitle="Cross-sectional explanatory framework. Each factor is a tradeable portfolio capturing a risk premium; betas measure exposure; the regression residual is alpha. CAPM (1964), FF3 (1993), Carhart (1997), FF5 (2015).">
      <MinSchema>
        <Term>APT</Term>:{' '}
        <Eq>{'\\mathbb{E}[r_i - r_f] = \\sum_k \\vi{\\beta_{i,k}}\\, \\fu{\\lambda_k}'}</Eq>{' '}
        where <Eq>{'\\beta_{i,k}'}</Eq> are factor exposures and{' '}
        <Eq>{'\\lambda_k'}</Eq> are factor risk premia. CAPM is the special case k=1 (market only);
        Fama-French adds size, value, profitability, investment.
      </MinSchema>

      <Block>{'r_{i,t} - r_f = \\alpha_i + \\sum_k \\vi{\\beta_{i,k}} (f_{k,t}) + \\varepsilon_{i,t}'}</Block>

      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(labels).map(([k, lab]) => (
          <button key={k} onClick={() => setModel(k)}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${model === k ? 'bg-sky-500/15 border-sky-400/40 text-sky-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          {activeFactors[model].map(f => {
            const setters = { mkt: setBMkt, smb: setBSize, hml: setBVal, mom: setBMom, rmw: setBProf, cma: setBInv };
            return (
              <div key={f}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono" style={{ color: factorColors[f] }}>β · {factorLabels[f]}</span>
                  <span className="text-neutral-300 font-mono tabular-nums">
                    {factorBetas[f].toFixed(2)}{' '}
                    <span className="text-neutral-500 text-[10px]">λ {(premia[f] * 100).toFixed(1)}%</span>
                  </span>
                </div>
                <input type="range" min="-0.5" max="1.5" step="0.05" value={factorBetas[f]}
                  onChange={(e) => setters[f](parseFloat(e.target.value))} className="mm-range w-full" />
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">presets:</span>
            <button onClick={() => { setBMkt(1.0); setBSize(0); setBVal(0); setBMom(0); setBProf(0); setBInv(0); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">SPY (β=1, all 0)</button>
            <button onClick={() => { setBMkt(1.05); setBSize(-0.20); setBVal(-0.30); setBMom(0.20); setBProf(0.30); setBInv(-0.15); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">tech (growth)</button>
            <button onClick={() => { setBMkt(0.95); setBSize(0.10); setBVal(0.45); setBMom(-0.10); setBProf(-0.10); setBInv(0.20); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">value tilt</button>
            <button onClick={() => { setBMkt(0.55); setBSize(0.05); setBVal(0.15); setBMom(0.05); setBProf(0.20); setBInv(0.10); }}
              className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">low-vol (USMV)</button>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">expected excess return decomposition</div>
          <svg viewBox="0 0 320 160" className="w-full h-auto">
            <text x={20} y={18} fontSize="9" fill="#a3a3a3" fontFamily="monospace">contribution per factor</text>
            {(() => {
              const segs = activeFactors[model].map(f => ({ v: factorBetas[f] * premia[f], c: factorColors[f], lab: f }));
              const sumPos = segs.reduce((s, d) => s + Math.max(0, d.v), 0);
              const sumNeg = segs.reduce((s, d) => s + Math.max(0, -d.v), 0);
              const scale = 200 / Math.max(0.05, sumPos + sumNeg);
              let xPos = 60, xNeg = 60;
              return segs.map((d, i) => {
                const w = Math.abs(d.v) * scale;
                const y = 35 + i * 22;
                const xrect = d.v < 0 ? 60 - w : 60;
                return (
                  <g key={i}>
                    <text x={55} y={y + 11} fontSize="9" textAnchor="end" fill={d.c} fontFamily="monospace">{d.lab}</text>
                    <rect x={xrect} y={y} width={w} height={14} fill={d.c} fillOpacity="0.6" stroke={d.c} strokeOpacity="0.9" />
                    <text x={xrect + (d.v < 0 ? -4 : w + 4)} y={y + 11} fontSize="9" textAnchor={d.v < 0 ? 'end' : 'start'} fill="#e5e5e5" fontFamily="monospace">{(d.v >= 0 ? '+' : '') + (d.v * 100).toFixed(1)}%</text>
                  </g>
                );
              });
            })()}
            <line x1={60} x2={60} y1={32} y2={150} stroke="#525252" strokeWidth="0.5" />
          </svg>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <Stat label="expected excess return" value={`${(expectedReturn * 100).toFixed(2)}%`} sub={`from ${activeFactors[model].length} factors`} color={expectedReturn > 0 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        </div>
      </div>

      <Predict question="What R² does FF5 achieve on a typical large-cap US stock's monthly returns?">
        ~70-90%, depending on the stock. Single large-cap names: typically R² ≈ 0.7-0.85.
        Diversified ETFs: R² &gt; 0.95. Small-cap names: lower (R² ≈ 0.4-0.7) because
        idiosyncratic variance dominates. The remaining residual is what we&apos;d call
        &ldquo;alpha&rdquo; if a backtested model can predict it &mdash; usually it can&apos;t
        out-of-sample.
      </Predict>

      <Worked title="Worked example · Fama-MacBeth two-pass regression">
        <p>
          <strong>Pass 1 (time-series).</strong> For each stock i, regress monthly excess returns
          on factor returns:{' '}
          <Eq>{'r_{i,t} - r_f = \\alpha_i + \\beta_{i,M}\\, \\mathrm{MKT}_t + \\beta_{i,S}\\, \\mathrm{SMB}_t + \\beta_{i,V}\\, \\mathrm{HML}_t + \\varepsilon_{i,t}'}</Eq>.
          Save (α̂_i, β̂_i) per stock.
        </p>
        <p>
          <strong>Pass 2 (cross-sectional).</strong> For each month t, regress the cross-section
          of stock returns on the estimated betas:{' '}
          <Eq>{'r_{i,t} = \\gamma_{0,t} + \\gamma_{M,t}\\, \\hat\\beta_{i,M} + \\gamma_{S,t}\\, \\hat\\beta_{i,S} + \\gamma_{V,t}\\, \\hat\\beta_{i,V} + u_{i,t}'}</Eq>.
          Average <Eq>{'\\hat\\gamma_{k,t}'}</Eq> over t to get the factor risk premium estimate.
        </p>
        <p>
          Standard errors via Newey-West for autocorrelation. Tests whether each factor&apos;s
          premium is statistically different from 0. The original Fama-MacBeth 1973 paper used
          this on size/beta factors; modern empirical asset pricing extends to dozens of
          characteristics.
        </p>
      </Worked>

      <Misconception
        wrong="More factors always explain more variance, so use as many as you can."
        right="Yes in-sample, no out-of-sample. The 'factor zoo' contains 300+ proposed factors; most don't replicate. Hou-Xue-Zhang 2020 ran 452 factors on the same data and found ~60% don't survive even basic robustness. The right discipline: use FF3/FF5/Carhart as defaults; add a factor only if it survives walk-forward and is theoretically motivated."
        because="Factor models are exposed to the same multiple-testing inflation as any backtest. The 'best of 300' factor will look great in-sample purely from selection; deflated Sharpe corrects for it. Cochrane 2011 ('Discount rates') identifies this as the central problem: 'we now have a zoo of new factors. We are looking for evidence of a tax: people are mining the data.'"
      />

      <WhenItMatters>
        Performance attribution (split returns into factor exposure vs alpha), portfolio
        construction (target specific factor tilts), risk management (stress factor exposures),
        and benchmarking active managers (the right benchmark is factor-adjusted, not raw S&amp;P).
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>CAPM (Sharpe 1964).</strong> One factor: market.{' '}
          <Eq>{'\\mathbb{E}[r_i] - r_f = \\beta_i (\\mathbb{E}[r_m] - r_f)'}</Eq>.
          Implication: only market beta is priced; idiosyncratic risk is diversifiable. Empirically
          rejected by Banz 1981 (size effect), Basu 1983 (P/E effect). Persists as a benchmark
          but isn&apos;t the &ldquo;right&rdquo; model.
        </p>
        <p>
          <strong>Fama-French 3 (1993) → 5 (2015).</strong> SMB (size: small minus big), HML
          (value: high minus low book/market), then RMW (profitability: robust minus weak), CMA
          (investment: conservative minus aggressive). Each is a long-short portfolio formed on
          the characteristic. The 5-factor model explains ~95% of the cross-section in
          double-sorted portfolios.
        </p>
        <p>
          <strong>Carhart 4 (1997).</strong> FF3 + UMD (momentum: up minus down). Momentum is the
          most empirically robust anomaly outside FF5; Carhart is the standard benchmark in
          performance evaluation.
        </p>
        <p>
          <strong>APT (Ross 1976).</strong> No restriction on what the factors are &mdash; they
          could be macroeconomic (Chen-Roll-Ross 1986: industrial production, inflation, term
          spread, default spread) or statistical (PCA factors, Fung-Hsieh hedge fund factors).
          Less constrained than CAPM/FF; correspondingly less testable.
        </p>
        <p>
          <strong>Characteristics vs covariance.</strong> Daniel-Titman 1997: returns track
          characteristics directly, not covariance with characteristic-based factors. Empirically
          equivalent in U.S. equities; the conceptual debate matters for whether factor returns
          are risk premia (yes, if covariance) or anomalies (yes, if characteristics).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where do the factor RETURNS come from each month?',
          a: 'Kenneth French\'s data library (free, monthly). MKT-RF, SMB, HML, RMW, CMA, UMD, plus international and sector versions. Standard input for any factor analysis. Updates monthly with a 3-week lag.' },
        { q: 'Why does the value premium look weak post-2008?',
          a: 'A real puzzle. Possibilities: (a) value premium was a measurement artifact; (b) intangibles (software, goodwill) make book value mismeasured; (c) growth firms became more profitable and quality-tilted. Fama-French 2020 acknowledges the puzzle; modern value implementations use composite scores (P/B, P/E, P/CF, P/S) rather than book value alone.' },
        { q: 'Does APT mean any factor I make up is valid?',
          a: 'No. APT requires the factors to be tradeable (or fully replicable by tradeable instruments) and to span the cross-section. In practice, most published factors that claim to be "APT factors" don\'t survive the no-arbitrage test once costs and short constraints are imposed.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — STATE-SPACE & KALMAN FILTER
   Hidden state x_t with Markov transition; noisy observation y_t. Kalman:
   recursive Bayesian update for linear-Gaussian case. Time-varying β estimation
   and dynamic factor models live here.
   ========================================================================== */

const StateSpaceCard = () => {
  const [obsNoise, setObsNoise] = useState(0.10);
  const [procNoise, setProcNoise] = useState(0.005);
  const [seed, setSeed] = useState(11);

  const sim = useMemo(() => {
    const T = 200;
    const rand = mulberry32(seed);
    // True hidden state: slowly-drifting beta
    const trueB = [];
    let b = 1.0;
    for (let t = 0; t < T; t++) {
      b += boxMuller(rand) * Math.sqrt(procNoise);
      trueB.push(b);
    }
    // Noisy observation: y_t = β_t · 1 + e_t (single regressor x_t = 1 for simplicity)
    const obs = trueB.map(b => b + boxMuller(rand) * obsNoise);
    // Kalman filter
    let xHat = 1.0, P = 1.0;
    const filtered = [], filtVar = [];
    const Q = procNoise, R = obsNoise * obsNoise, H = 1, F = 1;
    for (let t = 0; t < T; t++) {
      // predict
      xHat = F * xHat;
      P = F * P * F + Q;
      // update
      const K = P * H / (H * P * H + R);
      xHat = xHat + K * (obs[t] - H * xHat);
      P = (1 - K * H) * P;
      filtered.push(xHat);
      filtVar.push(P);
    }
    return { trueB, obs, filtered, filtVar };
  }, [obsNoise, procNoise, seed]);

  const W = 320, H_PX = 180, P = 22;
  const allMin = Math.min(...sim.trueB, ...sim.obs, ...sim.filtered) - 0.1;
  const allMax = Math.max(...sim.trueB, ...sim.obs, ...sim.filtered) + 0.1;
  const sx = (i) => P + (i / sim.trueB.length) * (W - 2 * P);
  const sy = (v) => H_PX - P - ((v - allMin) / (allMax - allMin)) * (H_PX - 2 * P);

  return (
    <Card id="statespace" icon={Network} title="State-space models · Kalman filter" accent="violet" index={11}
          subtitle="Hidden state x_t evolves; you observe noisy y_t. Kalman gives a closed-form recursive Bayesian update for the posterior over x_t. The framework underlies time-varying β, dynamic factor models, and DLMs.">
      <MinSchema>
        <Term>state-space</Term>:{' '}
        <Eq>{'\\co{x_t} = F x_{t-1} + w_t,\\quad w_t \\sim \\mathcal{N}(0, Q)'}</Eq>{' '}
        ·{' '}
        <Eq>{'\\co{y_t} = H x_t + v_t,\\quad v_t \\sim \\mathcal{N}(0, R)'}</Eq>.{' '}
        <Term>Kalman filter</Term>: closed-form posterior <Eq>{'p(x_t \\mid y_{1:t})'}</Eq>{' '}
        in linear-Gaussian models.
      </MinSchema>

      <Block>{'\\begin{aligned} \\hat{x}_{t|t-1} &= F\\hat{x}_{t-1|t-1} \\\\ P_{t|t-1} &= F P_{t-1|t-1} F^T + Q \\\\ K_t &= P_{t|t-1} H^T (H P_{t|t-1} H^T + R)^{-1} \\\\ \\hat{x}_{t|t} &= \\hat{x}_{t|t-1} + K_t (y_t - H \\hat{x}_{t|t-1}) \\end{aligned}'}</Block>

      <Predict question="When obs noise is high relative to process noise, the Kalman gain K is — small or large?">
        <strong>Small.</strong> K_t = P / (P + R). When R (obs noise) ≫ Q (process noise),
        the filter trusts its prediction more than the observation. The smoothed estimate barely
        moves with each new observation. Conversely, low obs noise → large K → filter tracks the
        observation tightly. K is the data-driven version of &ldquo;how surprised should I be by
        this observation&rdquo;.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">obs noise R^½</span>
              <span className="text-neutral-300 font-mono tabular-nums">{obsNoise.toFixed(2)}</span>
            </div>
            <input type="range" min="0.02" max="0.40" step="0.01" value={obsNoise}
              onChange={(e) => setObsNoise(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">process noise Q^½</span>
              <span className="text-neutral-300 font-mono tabular-nums">{Math.sqrt(procNoise).toFixed(3)}</span>
            </div>
            <input type="range" min="0.0005" max="0.05" step="0.0005" value={procNoise}
              onChange={(e) => setProcNoise(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug pt-1">
            The blue dots are noisy observations of the true (emerald) state. The violet line
            is the Kalman-smoothed estimate &mdash; pulled toward observations by gain K, pulled
            toward predictions by P_{`{t|t-1}`}. A live time-varying β estimate works exactly like
            this with x_t = β_t.
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H_PX - P} y2={H_PX - P} stroke="#525252" strokeWidth="0.5" />
          {/* observations */}
          {sim.obs.map((v, i) => (
            <circle key={i} cx={sx(i)} cy={sy(v)} r={1.5} fill="#7dd3fc" fillOpacity="0.4" />
          ))}
          {/* true state */}
          <polyline points={sim.trueB.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
            fill="none" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.85" />
          {/* Kalman filtered */}
          <polyline points={sim.filtered.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
            fill="none" stroke="#c4b5fd" strokeWidth="1.5" />
          <text x={P + 4} y={20} fontSize="8" fill="#86efac" fontFamily="monospace">true x_t</text>
          <text x={P + 4} y={32} fontSize="8" fill="#7dd3fc" fontFamily="monospace">obs y_t</text>
          <text x={P + 4} y={44} fontSize="8" fill="#c4b5fd" fontFamily="monospace">Kalman x̂_t</text>
        </svg>
      </div>

      <Worked title="Worked example · time-varying β with Kalman">
        <p>
          Suppose ETF A has time-varying beta to SPY. Set state x_t = β_t with{' '}
          <Eq>{'\\beta_t = \\beta_{t-1} + w_t'}</Eq> (random walk transition). Observation:{' '}
          <Eq>{'r^A_t = \\beta_t r^{SPY}_t + v_t'}</Eq>{' '}
          (so H_t = r^SPY_t in the equations).
        </p>
        <p>
          Kalman recursively estimates β_t given all returns up to t. Output: rolling β with
          principled uncertainty bands. Compare to rolling-window OLS: rolling-window discards old
          data abruptly; Kalman exponentially decays its weight via Q. For trend-changing β,
          Kalman is strictly better.
        </p>
      </Worked>

      <Misconception
        wrong="Kalman is just a fancy moving average."
        right="It IS a moving average — but with two key properties: (a) optimally weighted by signal-to-noise ratio Q/R; (b) provides a posterior variance, not just a point estimate. With Q=0 (constant state), Kalman reduces to recursive least squares. With Q→∞ (no memory), to the latest observation. The middle ground is what makes it useful."
        because="Kalman is the closed-form Bayesian solution for the linear-Gaussian state-space, so it's the optimal estimator under those assumptions. It's a moving average in the sense that any linear estimator is — but it's the OPTIMAL one, with its weights determined by the signal-to-noise structure of the problem rather than by an arbitrary window length."
      />

      <WhenItMatters>
        Time-varying β estimation, dynamic factor model fitting, hedging-ratio updates, regime
        signals from macro indicators, sensor fusion. Anywhere a parameter drifts and you have
        noisy observations of it.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Steady-state Kalman gain.</strong> If F, H, Q, R are constant, P_t converges
          to a steady-state value <Eq>{'P_\\infty'}</Eq> satisfying the discrete Riccati equation.
          Then K_∞ is constant and the filter is essentially a fixed-coefficient EWMA.
          RiskMetrics-style EWMA volatility models are a special case of steady-state Kalman.
        </p>
        <p>
          <strong>Smoothing vs filtering.</strong> Filtering: <Eq>{'p(x_t \\mid y_{1:t})'}</Eq> (online,
          uses past only). Smoothing: <Eq>{'p(x_t \\mid y_{1:T})'}</Eq> (offline, uses all data).
          Rauch-Tung-Striebel smoother runs the filter forward then a backward pass; tighter
          posterior at the cost of being non-causal.
        </p>
        <p>
          <strong>Non-linear / non-Gaussian.</strong> Extended Kalman: linearize F, H around the
          current estimate; biased but cheap. Unscented Kalman: deterministic sigma-point sampling;
          higher-order moment matching.{' '}
          <Term>particle filter</Term>: Monte Carlo sampling, exact for any non-linear non-Gaussian
          state-space. Used for stochastic-vol estimation, regime-switching with continuous states.
        </p>
        <p>
          <strong>Connection to DLMs.</strong> Dynamic Linear Models (West-Harrison 1997,
          Petris-Petrone-Campagnoli 2009) is the Bayesian time-series framework built on
          state-space. Conjugate priors, closed-form forward filtering, model averaging. Standard
          in econometric time-series.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I tune Q and R?',
          a: 'Maximum likelihood: Q and R are hyperparameters; the marginal likelihood p(y_{1:T} | Q, R) is computable from the filter. Maximize numerically. Or use cross-validation: hold out the last 20% of obs, choose (Q, R) that minimize prediction error.' },
        { q: 'When does Kalman fail badly?',
          a: 'Heavy-tailed innovations (jumps, regime switches): Gaussian Kalman gets crushed by outliers. Use particle filter or robust Kalman variants (Huber loss). Also: when the state isn\'t actually Markov (true model has long memory) — Kalman\'s update window is implicitly geometric.' },
        { q: 'Connection to the next card on regimes?',
          a: 'HMMs are state-space with DISCRETE hidden state. The forward-backward algorithm (Baum-Welch) IS the Kalman filter for discrete states. Continuous → Kalman; discrete → forward-backward. Both are message-passing on a chain.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — REGIME-SWITCHING / HMM
   Hidden discrete state z_t ∈ {1..K}; conditional emission distribution.
   Hamilton 1989 (2-regime business cycle); Baum-Welch (EM) for training.
   ========================================================================== */

const RegimeCard = () => {
  const [pCalmStay, setPCalmStay] = useState(0.97);
  const [pVolStay, setPVolStay] = useState(0.93);
  const [seed, setSeed] = useState(13);

  const sim = useMemo(() => {
    const T = 600;
    const rand = mulberry32(seed);
    let z = 0; // 0 = calm, 1 = vol
    const sigCalm = 0.008, sigVol = 0.025; // daily vol
    const states = [], rets = [];
    for (let t = 0; t < T; t++) {
      // Transition
      if (z === 0) {
        if (rand() > pCalmStay) z = 1;
      } else {
        if (rand() > pVolStay) z = 0;
      }
      states.push(z);
      const sig = z === 0 ? sigCalm : sigVol;
      rets.push(sig * boxMuller(rand));
    }
    return { states, rets };
  }, [pCalmStay, pVolStay, seed]);

  // Cumulative log-price for visual
  const cumPath = sim.rets.reduce((acc, r) => { acc.push((acc[acc.length - 1] || 0) + r); return acc; }, []);

  const W = 320, H_PX = 90, P = 22;
  const sx = (i) => P + (i / sim.rets.length) * (W - 2 * P);
  const cumMax = Math.max(...cumPath), cumMin = Math.min(...cumPath);
  const syC = (v) => H_PX - 12 - ((v - cumMin) / (cumMax - cumMin || 1)) * (H_PX - 24);

  // Stationary probabilities
  const piCalm = (1 - pVolStay) / ((1 - pCalmStay) + (1 - pVolStay));
  const piVol = 1 - piCalm;

  // Mean times per regime
  const expDaysCalm = 1 / (1 - pCalmStay);
  const expDaysVol = 1 / (1 - pVolStay);

  return (
    <Card id="regime" icon={Repeat} title="Regime-switching · HMM" accent="amber" index={12}
          subtitle="Hidden discrete state z_t ∈ {calm, vol, crisis} with persistent transition matrix. Hamilton 1989. Trained via Baum-Welch (EM); decoded via Viterbi for the most-likely path.">
      <MinSchema>
        <Term>HMM</Term>: discrete hidden state{' '}
        <Eq>{'z_t \\in \\{1, \\dots, K\\}'}</Eq>{' '}with transition matrix{' '}
        <Eq>{'P_{ij} = \\Pr(z_t = j \\mid z_{t-1} = i)'}</Eq> and emission{' '}
        <Eq>{'r_t \\mid z_t = k \\sim \\mathcal{N}(\\mu_k, \\sigma_k^2)'}</Eq>. Observed returns
        are mixtures across hidden states.
      </MinSchema>

      <Block>{'\\co{P} = \\begin{pmatrix} \\vi{p_{cc}} & 1 - \\vi{p_{cc}} \\\\ 1 - \\vi{p_{vv}} & \\vi{p_{vv}} \\end{pmatrix},\\quad \\co{\\pi_v} = \\frac{1 - p_{cc}}{(1-p_{cc}) + (1-p_{vv})}'}</Block>

      <Predict question="With p_calm-stay = 0.97 and p_vol-stay = 0.93, what fraction of time is the system in the vol regime?">
        Stationary prob in vol regime ={' '}
        <Eq>{'(1-p_{cc}) / ((1-p_{cc}) + (1-p_{vv})) = 0.03 / 0.10 = 30\\%'}</Eq>.{' '}
        Mean duration in calm: 1/(1−0.97) = 33 days. Mean in vol: 1/(1−0.93) = 14 days.
        Real SPY-style HMMs have calm regimes lasting ~3-6 months and vol regimes ~1-2 months
        (Hamilton 1989 used a 2-state model on US recessions; Ang-Bekaert 2002 on equities).
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">p_cc · prob stay in calm</span>
              <span className="text-neutral-300 font-mono tabular-nums">{pCalmStay.toFixed(3)}</span>
            </div>
            <input type="range" min="0.80" max="0.99" step="0.005" value={pCalmStay}
              onChange={(e) => setPCalmStay(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">p_vv · prob stay in vol</span>
              <span className="text-neutral-300 font-mono tabular-nums">{pVolStay.toFixed(3)}</span>
            </div>
            <input type="range" min="0.70" max="0.99" step="0.005" value={pVolStay}
              onChange={(e) => setPVolStay(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="P(vol regime)" value={`${(piVol * 100).toFixed(0)}%`} sub="stationary distribution" color="text-rose-300" />
            <Stat label="P(calm regime)" value={`${(piCalm * 100).toFixed(0)}%`} sub="stationary distribution" color="text-emerald-300" />
            <Stat label="mean calm dur." value={`${expDaysCalm.toFixed(0)}d`} sub="1/(1-p_cc)" color="text-emerald-300" />
            <Stat label="mean vol dur." value={`${expDaysVol.toFixed(0)}d`} sub="1/(1-p_vv)" color="text-rose-300" />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">cumulative log-price</div>
            <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H_PX - 12} y2={H_PX - 12} stroke="#525252" strokeWidth="0.5" />
              <polyline points={cumPath.map((v, i) => `${sx(i).toFixed(1)},${syC(v).toFixed(1)}`).join(' ')}
                fill="none" stroke="#fbbf24" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">regime path z_t</div>
            <svg viewBox={`0 0 ${W} 30`} className="w-full h-auto" preserveAspectRatio="none">
              {sim.states.map((z, i) => (
                <rect key={i} x={sx(i)} y={2} width={(W - 2 * P) / sim.states.length + 0.3} height={26}
                  fill={z === 0 ? '#86efac' : '#fb7185'} fillOpacity={z === 0 ? 0.45 : 0.65} />
              ))}
              <text x={P + 4} y={18} fontSize="9" fill="#0a0a0a" fontFamily="monospace" fontWeight="700">calm / vol</text>
            </svg>
          </div>
        </div>
      </div>

      <Worked title="Worked example · Baum-Welch in 4 lines">
        <p>
          <strong>E-step.</strong> Forward pass:{' '}
          <Eq>{'\\alpha_t(k) = \\Pr(y_{1:t}, z_t=k)'}</Eq>{' '}
          via recursion <Eq>{'\\alpha_t(k) = \\sum_j \\alpha_{t-1}(j) P_{jk} f(y_t \\mid z_t = k)'}</Eq>.
          Backward pass:{' '}
          <Eq>{'\\beta_t(k) = \\Pr(y_{t+1:T} \\mid z_t = k)'}</Eq>.
          Smoothed posterior: <Eq>{'\\gamma_t(k) \\propto \\alpha_t(k) \\beta_t(k)'}</Eq>.
        </p>
        <p>
          <strong>M-step.</strong> Update transition matrix from expected transition counts:{' '}
          <Eq>{'P_{jk} \\leftarrow \\frac{\\sum_t \\xi_t(j, k)}{\\sum_t \\gamma_t(j)}'}</Eq>{' '}
          where <Eq>{'\\xi_t(j,k) = \\Pr(z_t=j, z_{t+1}=k \\mid y_{1:T})'}</Eq>.
          Update emission parameters via weighted MLE on the smoothed posterior.
        </p>
        <p>
          Iterate to convergence. <Term>EM algorithm</Term> never decreases the likelihood. Local
          maxima are common; restart with multiple initializations and pick the one with highest
          final log-likelihood.
        </p>
      </Worked>

      <Misconception
        wrong="HMMs predict regime changes."
        right="HMMs estimate the POSTERIOR over the current regime given history. The expected duration of the current regime is 1/(1-p_kk) — a long-run average, not a useful 'now is when regime flips' signal. The model's regime-flip probability per day is constant at (1-p_kk), determined entirely by the transition matrix, not by your data."
        because="HMMs are Markov: the state's transition probability is constant. The 'predictive value' of an HMM is in (a) classifying the current regime more precisely than naive thresholds, and (b) producing regime-conditional forecasts (e.g. 'given we're 95% likely in vol regime, my expected next-day vol is X'). They don't tell you when the next flip will happen."
      />

      <WhenItMatters>
        Risk-on / risk-off macro overlays, vol-regime-aware sizing, business-cycle-conditional
        factor exposure, and any setting where parameters change abruptly between persistent
        states. Used heavily in CTAs, macro funds, vol-targeting strategies.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Hamilton 1989 (the original).</strong> 2-state HMM on US GNP growth identified
          the recession-vs-expansion business cycle. Showed how the HMM&apos;s smoothed
          probabilities track NBER-defined recessions; provided the modern econometric foundation
          for regime-switching models in finance.
        </p>
        <p>
          <strong>Markov-switching extensions.</strong> Markov-switching VAR (MS-VAR): regime-dependent
          autoregressive structure. Markov-switching GARCH: regime-dependent vol parameters.
          Markov-switching multifractal (Calvet-Fisher): combines multiple regimes at multiple
          frequencies; matches realized vol very well empirically.
        </p>
        <p>
          <strong>Decoding the regime path.</strong> <em>Forward-backward</em>: smoothed posterior
          γ_t(k). <em>Viterbi</em>: most-likely single path z*_{`{1:T}`} (max over paths). They differ
          when uncertainty is high; for production use, smoothed γ is usually preferred because
          it gives uncertainty quantification.
        </p>
        <p>
          <strong>Choosing K.</strong> Information criteria: AIC, BIC. K=2 is the parsimonious
          default (calm/vol). K=3 (calm/vol/crisis) often gains modest log-likelihood at the
          cost of identification difficulty (regimes mid-2 and mid-3 may be statistically
          interchangeable). K&gt;4 rarely worth it on retail-frequency data.
        </p>
      </Deeper>

      <QA items={[
        { q: 'When is HMM better than GARCH for vol forecasting?',
          a: 'GARCH excels at smooth vol clustering. HMM excels at abrupt regime breaks (Sept 2008, March 2020). The right approach is often hybrid: HMM identifies the regime; GARCH governs within-regime dynamics. Markov-switching GARCH (MS-GARCH) does this in one model.' },
        { q: 'Can HMMs predict crashes?',
          a: 'No, but they can detect the START of a vol regime quickly (within 5-10 days). That\'s useful for risk overlay: cut vol-target sleeve weight when entering the vol regime. They don\'t predict WHEN the regime starts.' },
        { q: 'How does this connect to change-point detection?',
          a: 'Change-point models (Adams-MacKay 2007 BOCPD) are HMMs with a special structure: the prior over staying in a regime is hazard-rate-based rather than geometric. Better suited when regimes are short and abrupt; geometric persistence is implicit in classic HMM.' },
        { q: 'Bayesian alternative?',
          a: 'Hierarchical Dirichlet Process HMM (HDP-HMM, Teh-Jordan-Beal 2006) treats K as random and grows the regime count from data. Avoids the K-selection problem. Gibbs sampling on the chain; slower but more principled.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — BAYESIAN INFERENCE
   Priors, posteriors, shrinkage. Black-Litterman as Bayesian portfolio.
   Conjugate normal-normal closed-form. Sets up the principle behind every
   regularized estimator in finance.
   ========================================================================== */

const BayesCard = () => {
  const [muPrior, setMuPrior] = useState(0.05);
  const [tauPrior, setTauPrior] = useState(0.04);   // prior std
  const [yObs, setYObs] = useState(0.10);            // observed sample mean
  const [sigObs, setSigObs] = useState(0.05);        // observation std (1/√n × σ)

  // Conjugate normal-normal posterior
  const tauPriorVar = tauPrior * tauPrior;
  const sigObsVar = sigObs * sigObs;
  const postPrec = 1 / tauPriorVar + 1 / sigObsVar;
  const postVar = 1 / postPrec;
  const postSig = Math.sqrt(postVar);
  const postMean = postVar * (muPrior / tauPriorVar + yObs / sigObsVar);
  const shrinkW = (1 / sigObsVar) / postPrec;

  // PDF helper
  const pdf = (x, m, s) => Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI));

  const W = 320, H = 180, P = 22;
  const xMin = -0.10, xMax = 0.25;
  const sx = (v) => P + ((v - xMin) / (xMax - xMin)) * (W - 2 * P);
  const ys = (v) => H - 16 - v;
  const peakP = pdf(muPrior, muPrior, tauPrior);
  const peakL = pdf(yObs, yObs, sigObs);
  const peakPost = pdf(postMean, postMean, postSig);
  const yScale = (H - 32) / Math.max(peakP, peakL, peakPost, 0.01);
  const pdfPath = (m, s) => {
    const pts = [];
    for (let v = xMin; v <= xMax; v += (xMax - xMin) / 200) {
      pts.push(`${sx(v).toFixed(1)},${ys(pdf(v, m, s) * yScale).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  return (
    <Card id="bayes" icon={Sparkles} title="Bayesian inference" accent="violet" index={13}
          subtitle="Prior + likelihood → posterior. Closed-form for conjugate priors. Black-Litterman is Bayesian portfolio: market-implied returns as prior, manager views as likelihood, posterior = blended μ.">
      <MinSchema>
        <Eq>{'p(\\theta \\mid y) \\propto p(y \\mid \\theta)\\, p(\\theta)'}</Eq>.{' '}
        For conjugate normal-normal:{' '}
        <Eq>{'\\theta_{\\text{post}} \\sim \\mathcal{N}\\left(\\frac{\\mu_0/\\tau_0^2 + \\bar{y}/\\sigma^2}{1/\\tau_0^2 + 1/\\sigma^2},\\, \\frac{1}{1/\\tau_0^2 + 1/\\sigma^2}\\right)'}</Eq>.{' '}
        Posterior mean = precision-weighted average of prior and data.
      </MinSchema>

      <Block>{'\\co{\\mu_{\\text{post}}} = \\frac{\\vi{w_p}\\, \\vi{\\mu_0} + \\vi{w_d}\\, \\vi{\\bar{y}}}{w_p + w_d},\\quad \\vi{w_p} = 1/\\tau_0^2,\\quad \\vi{w_d} = 1/\\sigma^2'}</Block>

      <Predict question="With τ_0 = 4% and σ = 5%, what fraction of the posterior weight comes from the data?">
        <Eq>{'w_d / (w_p + w_d) = \\sigma^{-2} / (\\tau_0^{-2} + \\sigma^{-2}) = 400 / (625 + 400) = 39\\%'}</Eq>.{' '}
        The prior gets 61% of the weight because it&apos;s narrower than the observation. With
        more observations the data weight grows linearly (since σ² ∝ 1/n) and eventually swamps
        the prior. This is just shrinkage, dressed up in Bayesian notation.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">μ₀ · prior mean</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(muPrior * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.05" max="0.20" step="0.005" value={muPrior}
              onChange={(e) => setMuPrior(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">τ₀ · prior std</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(tauPrior * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.10" step="0.005" value={tauPrior}
              onChange={(e) => setTauPrior(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">ȳ · observed sample mean</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(yObs * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.05" max="0.25" step="0.005" value={yObs}
              onChange={(e) => setYObs(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">σ · observation std</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sigObs * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.10" step="0.005" value={sigObs}
              onChange={(e) => setSigObs(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="μ posterior" value={`${(postMean * 100).toFixed(2)}%`} sub={`shrinkage w_d = ${(shrinkW * 100).toFixed(0)}%`} color="text-fuchsia-300" />
            <Stat label="σ posterior" value={`${(postSig * 100).toFixed(2)}%`} sub="precision-weighted" color="text-emerald-300" />
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">prior · likelihood · posterior</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H - 16} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
            <polyline points={pdfPath(muPrior, tauPrior)} fill="none" stroke="#c4b5fd" strokeWidth="1.4" />
            <polyline points={pdfPath(yObs, sigObs)} fill="none" stroke="#fbbf24" strokeWidth="1.4" />
            <polyline points={pdfPath(postMean, postSig)} fill="none" stroke="#f0abfc" strokeWidth="2" />
            {/* x-axis ticks */}
            {[-0.05, 0, 0.05, 0.10, 0.15, 0.20].map(v => (
              <g key={v}>
                <line x1={sx(v)} x2={sx(v)} y1={H - 16} y2={H - 13} stroke="#737373" strokeWidth="0.4" />
                <text x={sx(v)} y={H - 4} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">{(v * 100).toFixed(0)}%</text>
              </g>
            ))}
            <text x={P + 4} y={14} fontSize="8" fill="#c4b5fd" fontFamily="monospace">prior</text>
            <text x={P + 4} y={26} fontSize="8" fill="#fbbf24" fontFamily="monospace">likelihood</text>
            <text x={P + 4} y={38} fontSize="8" fill="#f0abfc" fontFamily="monospace">posterior</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · Black-Litterman as conjugate Bayes">
        <p>
          <strong>Prior.</strong> Reverse-engineer market-implied returns from current weights:{' '}
          <Eq>{'\\boldsymbol{\\Pi} = \\lambda \\Sigma w_{\\text{mkt}}'}</Eq>. Treat as
          <Eq>{'\\boldsymbol{\\mu} \\sim \\mathcal{N}(\\boldsymbol{\\Pi}, \\tau \\Sigma)'}</Eq>{' '}
          with τ small (high prior precision; the market is informative).
        </p>
        <p>
          <strong>Likelihood.</strong> Manager views as <Eq>{'P \\boldsymbol{\\mu} \\sim \\mathcal{N}(\\mathbf{q}, \\Omega)'}</Eq>{' '}
          where P is the &ldquo;view picker&rdquo; matrix, q the views, Ω their uncertainty. Higher
          confidence → smaller Ω → views dominate.
        </p>
        <p>
          <strong>Posterior.</strong>{' '}
          <Eq>{'\\boldsymbol{\\mu}_{BL} = \\big[(\\tau\\Sigma)^{-1} + P^T \\Omega^{-1} P\\big]^{-1}\\big[(\\tau\\Sigma)^{-1}\\boldsymbol{\\Pi} + P^T \\Omega^{-1} \\mathbf{q}\\big]'}</Eq>.
          Plug into Markowitz. Result: weights move sensibly with views, never wildly. The
          stability that naive MV lacks comes entirely from the prior.
        </p>
      </Worked>

      <Misconception
        wrong="Bayesian methods are slower and more complex than frequentist; only worth it if you have a good prior."
        right="Conjugate updates are closed-form and as fast as MLE. Even a 'weak' prior (large τ_0) regularizes the estimator, and that's almost always good in finance because n is small relative to noise. The shrinkage interpretation works whether you call it Bayesian or not."
        because="Almost every 'frequentist' regularizer in finance — Ledoit-Wolf shrinkage, ridge regression, Tikhonov regularization — IS Bayesian under the hood, with an implicit Gaussian prior on the parameter. James-Stein 1961 proved that shrinkage estimators dominate the MLE in dimensions ≥3, regardless of how poor the 'prior' (shrinkage target) is. In finance with N=5+ assets and noisy returns, shrinkage is essentially free."
      />

      <WhenItMatters>
        Anywhere you have small samples and informative structure: portfolio construction (Black-Litterman),
        time-varying parameters (state-space + DLM), regime models (HDP-HMM), and any cross-sectional
        regression where N ≫ T. Bayesian shrinkage is the right default.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why Bayes &gt; MLE in finance.</strong> Time-series of returns are short
          (decades, not millennia). Cross-sections of stocks have N in the thousands but T in the
          hundreds of months. MLE treats parameters as point estimates ignoring uncertainty;
          downstream optimization (Markowitz) compounds the error. Bayesian methods carry
          uncertainty all the way through.
        </p>
        <p>
          <strong>Conjugate families.</strong>{' '}
          Normal-normal (mean update), Inverse-Wishart-Normal (variance update), Beta-Bernoulli
          (probability update), Gamma-Poisson (rate update). All have closed-form posteriors.
          Outside these families: MCMC (Stan, PyMC), variational inference, or Laplace approximation.
        </p>
        <p>
          <strong>Hierarchical Bayes.</strong> Pool information across similar units. Stocks
          within an industry share a sector-mean prior; the prior itself is estimated from the
          data. James-Stein shrinkage is the simplest case. Hierarchical models are how
          modern empirical asset pricing combines individual-asset inference.
        </p>
        <p>
          <strong>Information criteria as Bayesian.</strong> BIC ≈ −2 log p(y | model);{' '}
          deviance information criterion (DIC) is the Bayesian generalization. Approximate
          Bayes factors via BIC differences:{' '}
          <Eq>{'\\log B_{12} \\approx (\\text{BIC}_2 - \\text{BIC}_1)/2'}</Eq>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I pick a prior for asset return means?',
          a: 'Three options: (1) market-implied (BL): use the equilibrium returns from the current weights. (2) zero-mean with prior σ ≈ 4% (matches typical equity premium scale). (3) cross-sectional shrinkage: pool toward the universe mean. Use (1) for portfolio construction; (2) and (3) for individual security alpha estimation.' },
        { q: 'What if the prior is wrong?',
          a: 'A bad prior + lots of data → posterior approaches the data anyway. A bad prior + little data → biased posterior. The rule: be conservative (wide prior, low precision) when you don\'t know much; informative (narrow prior, high precision) when domain knowledge actually constrains.' },
        { q: 'Connection to the next card on microstructure?',
          a: 'Microstructure features (order flow imbalance, queue position) provide high-frequency observations that update the posterior over short-horizon return drift. Avellaneda-Stoikov market-making is a Bayesian inventory-control problem with the order book as the observation process.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   14 — MICROSTRUCTURE · HAWKES · ORDER BOOK
   The high-frequency frontier. Hawkes self-exciting processes for trade
   arrivals; order-book dynamics; Avellaneda-Stoikov optimal market-making.
   Largely off-table for retail — but understanding it sharpens the rest.
   ========================================================================== */

const MicrostructureCard = () => {
  const [mu, setMu] = useState(0.5);     // baseline intensity
  const [eta, setEta] = useState(0.7);   // branching ratio
  const [beta, setBeta] = useState(2.0); // decay rate
  const [seed, setSeed] = useState(17);

  const sim = useMemo(() => {
    const T = 30; // 30 seconds
    const rand = mulberry32(seed);
    // Ogata thinning algorithm for Hawkes simulation (exponential kernel)
    const events = [];
    let lambda = mu;
    let t = 0;
    while (t < T) {
      // Upper bound on intensity
      const lambBar = lambda;
      const u1 = rand();
      const dt = -Math.log(u1) / Math.max(0.01, lambBar);
      t += dt;
      if (t >= T) break;
      // Recompute intensity at t
      const lambNew = mu + eta * beta * events.reduce((s, ti) => s + Math.exp(-beta * (t - ti)), 0);
      const u2 = rand();
      if (u2 * lambBar < lambNew) {
        events.push(t);
        lambda = lambNew + eta * beta;
      } else {
        lambda = lambNew;
      }
    }
    // Compute intensity series for visualization
    const dtViz = 0.05;
    const intensitySeries = [];
    for (let v = 0; v <= T; v += dtViz) {
      const l = mu + eta * beta * events.filter(ti => ti < v).reduce((s, ti) => s + Math.exp(-beta * (v - ti)), 0);
      intensitySeries.push({ t: v, lambda: l });
    }
    return { events, intensitySeries };
  }, [mu, eta, beta, seed]);

  const W = 320, H_PX = 160, P = 22;
  const sx = (t) => P + (t / 30) * (W - 2 * P);
  const lambMax = Math.max(...sim.intensitySeries.map(d => d.lambda), 1);
  const sy = (l) => H_PX - 24 - (l / lambMax) * (H_PX - 36);

  return (
    <Card id="micro" icon={CircuitBoard} title="Microstructure · Hawkes · order book" accent="cyan" index={14}
          subtitle="The high-frequency frontier. Hawkes processes for trade clustering; order-book dynamics; Avellaneda-Stoikov optimal market-making. Off-table for retail capital, but understanding it sharpens the rest of the modeling stack.">
      <MinSchema>
        <Term>Hawkes process</Term>: self-exciting point process with intensity{' '}
        <Eq>{'\\lambda_t = \\mu + \\sum_{t_i < t} \\phi(t - t_i)'}</Eq>.{' '}
        Each event raises the intensity for future events. Branching ratio{' '}
        <Eq>{'\\eta = \\int_0^\\infty \\phi(s)\\, ds < 1'}</Eq>{' '}for stability; closer to 1 = more
        clustering.
      </MinSchema>

      <Block>{'\\co{\\lambda_t} = \\vi{\\mu} + \\vi{\\eta\\beta} \\sum_{t_i < t} e^{-\\beta(t - t_i)}'}</Block>

      <Predict question="With η = 0.7 and base intensity μ = 0.5, what's the long-run average intensity?">
        <Eq>{'\\bar\\lambda = \\mu / (1 - \\eta) = 0.5 / 0.3 \\approx 1.67'}</Eq>{' '}
        events per second. Each event triggers η = 0.7 expected offspring, which trigger their
        own offspring, geometric series sum: <Eq>{'1/(1-\\eta)'}</Eq>. As η → 1, intensity blows
        up &mdash; mass shootings of orders are the empirical signature of η ≈ 0.95-0.99 in
        equity HF data (Bacry-Muzy 2014).
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">μ · base intensity (events/s)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{mu.toFixed(2)}</span>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.1" value={mu}
              onChange={(e) => setMu(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">η · branching ratio</span>
              <span className="text-neutral-300 font-mono tabular-nums">{eta.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="0.95" step="0.05" value={eta}
              onChange={(e) => setEta(parseFloat(e.target.value))} className="mm-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · Poisson</span><span>0.95 · near-critical</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">β · kernel decay (1/s)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{beta.toFixed(1)}</span>
            </div>
            <input type="range" min="0.5" max="10" step="0.5" value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="long-run λ̄" value={(mu / Math.max(0.01, 1 - eta)).toFixed(2)} sub="μ/(1-η)" color="text-cyan-300" />
            <Stat label="events" value={`${sim.events.length}`} sub={`in 30s · ${(sim.events.length / 30).toFixed(2)}/s`} color="text-amber-300" />
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">intensity λ_t · events as ticks</div>
          <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H_PX - 24} y2={H_PX - 24} stroke="#525252" strokeWidth="0.5" />
            <polyline points={sim.intensitySeries.map(d => `${sx(d.t).toFixed(1)},${sy(d.lambda).toFixed(1)}`).join(' ')}
              fill="none" stroke="#67e8f9" strokeWidth="1.2" />
            {sim.events.map((t, i) => (
              <line key={i} x1={sx(t)} x2={sx(t)} y1={H_PX - 20} y2={H_PX - 12} stroke="#fbbf24" strokeWidth="0.6" />
            ))}
            <text x={P + 2} y={14} fontSize="8" fill="#67e8f9" fontFamily="monospace">λ_t</text>
            <text x={P + 2} y={H_PX - 4} fontSize="8" fill="#fbbf24" fontFamily="monospace">events ↑</text>
            <text x={W - P} y={H_PX - 4} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">30s</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · Avellaneda-Stoikov optimal quotes">
        <p>
          A market maker with inventory q seeks to maximize{' '}
          <Eq>{'\\mathbb{E}[U(\\text{wealth}_T)]'}</Eq> with U exponential. Avellaneda-Stoikov
          (2008) derives optimal bid/ask quotes:{' '}
          <Eq>{'\\text{ask} = s + \\frac{1 - 2q\\gamma\\sigma^2(T-t)}{2}\\,\\delta^*,\\; \\text{bid} = s - \\frac{1 + 2q\\gamma\\sigma^2(T-t)}{2}\\,\\delta^*'}</Eq>{' '}
          where δ* depends on order arrival intensity and risk aversion γ.
        </p>
        <p>
          Intuition: when long inventory (q &gt; 0), skew quotes lower &mdash; eager to sell.
          When short, skew higher. The skew is proportional to remaining time and risk aversion.
          On a Hawkes-clustered arrival process, optimal quoting becomes a control problem
          with state-dependent intensities.
        </p>
      </Worked>

      <Misconception
        wrong="Order flow imbalance is the highest-Sharpe alpha source available."
        right="OFI has Sharpe 5+ on the right horizon (seconds-to-minutes) but capacity ≪ $1k/trade and required latency ≪ 1ms. Net of latency arms-race costs, retail can't capture it. The microstructure literature is mostly relevant for execution and market-making, not directional alpha."
        because="OFI signal decays in milliseconds. To monetize it you need (a) co-location at the exchange, (b) FPGA-fast tick-to-trade, (c) cross-venue routing infrastructure. Total cost of competitive HFT entry: $50M+. The Sharpe is real but utterly inaccessible. Where retail CAN profit: smart limit-order placement informed by microstructure, which improves execution on slower strategies."
      />

      <WhenItMatters>
        Pure HFT alpha: institutional only. Execution algos: any sleeve with non-trivial turnover
        benefits from microstructure-aware order placement. Market making (especially in crypto):
        Avellaneda-Stoikov-style models are tractable for retail.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Order book dynamics.</strong> The limit order book is a queue at each price
          level. Limit orders join the back; market orders eat from the front; cancellations
          remove arbitrarily. Cont-de Larrard 2013 modeled the queues as a multi-class M/M/1
          system. <Term>order flow imbalance</Term> {'(Cont-Kukanov-Stoikov 2014)'} predicts
          short-horizon returns with high Sharpe but tiny capacity.
        </p>
        <p>
          <strong>Hawkes calibration.</strong> Maximum likelihood with the exponential kernel:{' '}
          <Eq>{'\\ell = \\sum_i \\log \\lambda_{t_i} - \\int_0^T \\lambda_t\\, dt'}</Eq>.
          Closed form for the integral if kernel is exponential. Bacry-Muzy 2014 fit
          multi-dimensional Hawkes (buy/sell/cancel) on equity HF data; found η ≈ 0.95 across
          markets &mdash; markets are at the edge of criticality.
        </p>
        <p>
          <strong>Almgren-Chriss execution.</strong> Optimal trading schedule for a meta-order:
          minimize the sum of expected impact cost and price-risk variance. Square-root impact:{' '}
          <Eq>{'\\Delta P \\approx \\eta \\sigma \\sqrt{Q/V}'}</Eq>{' '}where V is daily volume.
          The TWAP/VWAP/IS schedule emerges from solving this.
        </p>
        <p>
          <strong>Deep learning at the orderbook.</strong> Sirignano-Cont 2019 used CNN on full
          LOB snapshots to predict next-mid-price-move. Zhang et al. (2019, &ldquo;DeepLOB&rdquo;):
          conv + inception + LSTM stacked architecture. Now standard for high-frequency
          prediction; transformers (next card) are the latest extension.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How does this connect to the variance risk premium?',
          a: 'VRP partly comes from the fact that option-buyers face inventory risk that dealers must hedge. The microstructure of how dealers manage that hedge inventory generates the (price, vol, demand) joint dynamics that make IV > RV. Variance risk premium "exists" because somewhere a market-maker is running an Avellaneda-Stoikov-like optimization.' },
        { q: 'Should retail traders care about queue position?',
          a: 'For aggressive market orders: irrelevant. For passive limit orders: yes — your fills depend on queue priority. Even at retail, knowing whether your $20 limit-buy on AAPL is at queue position 5 vs 5000 changes execution outcomes meaningfully.' },
        { q: 'Is η=0.95 on equity markets actually right?',
          a: 'For trade arrivals at the second-scale, yes — multiple independent estimates converge on this. Means equity HF activity is essentially "self-organized criticality" — a small kick triggers a long cascade. Direct evidence for a complex-systems-style theory of markets.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   15 — ML FOR FINANCE · BOOSTED TREES
   Gradient boosting (XGBoost / LightGBM / CatBoost) is the workhorse of
   non-deep ML in finance. Tabular features + walk-forward validation.
   ========================================================================== */

const FEATURES = [
  { id: 'mom_12_1', name: '12-1m momentum',           imp: 0.18, color: '#7dd3fc',
    note: 'Past 12-month return excluding the most recent month. Strongest single factor; survives in-sample and OOS across decades.' },
  { id: 'rv_20',    name: 'realized vol (20d)',       imp: 0.16, color: '#fbbf24',
    note: 'Standard deviation of last 20 daily log-returns. Predicts next-month vol with R² ≈ 0.5; weak predictor of returns.' },
  { id: 'term',     name: 'term spread (10y-2y)',     imp: 0.12, color: '#86efac',
    note: 'Yield-curve slope. Strong macro regime indicator; flat/inverted = recession signal historically.' },
  { id: 'vix_term', name: 'VIX term structure',       imp: 0.11, color: '#f0abfc',
    note: 'Front-month VIX minus 6m VIX futures. Backwardated = stress; contango = calm. Predicts 1-month vol moves.' },
  { id: 'rev_5',    name: 'short reversal (5d)',      imp: 0.09, color: '#fda4af',
    note: 'Negative autocorrelation at 1-week horizon. Microstructure noise + liquidity provision premium.' },
  { id: 'pcr',      name: 'put/call ratio',           imp: 0.08, color: '#c4b5fd',
    note: 'Sentiment indicator. Extremes (5%-95%) often mean-revert; mid-range no signal.' },
  { id: 'cs_spread',name: 'credit spread (HY-IG)',    imp: 0.08, color: '#67e8f9',
    note: 'Risk-on/off signal. Widens before equity drawdowns historically.' },
  { id: 'qual_z',   name: 'quality z-score',          imp: 0.07, color: '#fdba74',
    note: 'Cross-sectional profitability + low debt. Slow-moving; weak return predictor but reduces drawdown.' },
  { id: 'cal',      name: 'calendar (turn-of-month)', imp: 0.05, color: '#a3a3a3',
    note: 'Month-end portfolio rebalancing flows. Modest empirical effect; survives in OOS.' },
  { id: 'oth',      name: 'other features',           imp: 0.06, color: '#525252',
    note: 'Sector dispersion, breadth, foreign-flow indicators, etc. Each tiny but additive.' },
];

const MlCard = () => {
  const [nTrees, setNTrees] = useState(200);
  const [lr, setLr] = useState(0.05);
  const [hover, setHover] = useState(null);

  // Toy: train+val log-loss curves over n_trees
  const trainLoss = useMemo(() => {
    return Array.from({ length: 500 }, (_, i) => {
      const t = i + 1;
      // exponential decay to a floor
      return 0.85 * Math.exp(-lr * t * 0.06) + 0.20;
    });
  }, [lr]);
  const valLoss = useMemo(() => {
    return Array.from({ length: 500 }, (_, i) => {
      const t = i + 1;
      // U-shape: decay then rise (overfit)
      const base = 0.83 * Math.exp(-lr * t * 0.045) + 0.32;
      const overfit = Math.max(0, (t - 220 - 80 / lr) * 0.0004);
      return base + overfit;
    });
  }, [lr]);

  const W = 320, H = 130, P = 22;
  const N = trainLoss.length;
  const sx = (i) => P + (i / N) * (W - 2 * P);
  const yMin = 0.45, yMax = 1.10;
  const sy = (v) => H - P - ((v - yMin) / (yMax - yMin)) * (H - 2 * P);
  const trainPath = trainLoss.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const valPath = valLoss.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  // Best n_trees (where val_loss is min)
  const bestIdx = valLoss.indexOf(Math.min(...valLoss));

  return (
    <Card id="ml" icon={Boxes} title="ML for finance · boosted trees" accent="emerald" index={15}
          subtitle="Gradient boosting on tabular engineered features. XGBoost / LightGBM / CatBoost. Workhorse for non-deep finance ML — handles missing data, monotonic constraints, fast to train. Walk-forward validation; SHAP for interpretation.">
      <MinSchema>
        Sequential ensemble: each tree fits the residual of the previous prediction.{' '}
        <Eq>{'\\hat{y}^{(t)} = \\hat{y}^{(t-1)} + \\vi{\\nu}\\, h_t(\\mathbf{x})'}</Eq>{' '}
        where ν is learning rate, h_t is a small tree fit to{' '}
        <Eq>{'-\\partial \\ell / \\partial \\hat{y}^{(t-1)}'}</Eq>.
      </MinSchema>

      <Block>{'\\co{\\ell^{(t)}} = \\sum_i \\ell\\big(y_i, \\hat{y}_i^{(t-1)} + h_t(\\mathbf{x}_i)\\big) + \\Omega(h_t),\\quad \\co{\\Omega(h)} = \\gamma T_h + \\tfrac{1}{2}\\lambda \\|w\\|^2'}</Block>

      <Predict question="On a financial-features tabular dataset, which usually wins: gradient boosting or a deep neural net?">
        Gradient boosting, in almost every comparison. Reasons: (a) features are heterogeneous
        (returns, ratios, categorical sectors); trees handle this natively, NNs need careful
        normalization/encoding; (b) sample sizes (~10k-100k rows) are too small for deep nets to
        beat trees; (c) tabular data lacks the spatial/temporal structure that helps CNNs/RNNs.
        Empirically: XGBoost wins on Kaggle finance tabular tasks ~80% of the time.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">n_trees</span>
              <span className="text-neutral-300 font-mono tabular-nums">{nTrees}</span>
            </div>
            <input type="range" min="20" max="500" step="10" value={nTrees}
              onChange={(e) => setNTrees(parseInt(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">learning rate ν</span>
              <span className="text-neutral-300 font-mono tabular-nums">{lr.toFixed(3)}</span>
            </div>
            <input type="range" min="0.01" max="0.30" step="0.01" value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="train log-loss" value={trainLoss[Math.min(N - 1, nTrees)].toFixed(3)} sub="" color="text-emerald-300" />
            <Stat label="val log-loss" value={valLoss[Math.min(N - 1, nTrees)].toFixed(3)} sub={nTrees > bestIdx + 30 ? 'over-fitting' : 'still improving'} color={nTrees > bestIdx + 30 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="best n_trees" value={`${bestIdx}`} sub="early-stop point" color="text-fuchsia-300" />
            <Stat label="gap (train-val)" value={(valLoss[Math.min(N - 1, nTrees)] - trainLoss[Math.min(N - 1, nTrees)]).toFixed(3)} sub="generalization gap" color="text-cyan-300" />
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">log-loss vs n_trees</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
            <polyline points={trainPath} fill="none" stroke="#86efac" strokeWidth="1.4" />
            <polyline points={valPath} fill="none" stroke="#fb7185" strokeWidth="1.4" />
            <line x1={sx(bestIdx)} x2={sx(bestIdx)} y1={P} y2={H - P} stroke="#f0abfc" strokeWidth="0.6" strokeDasharray="2,3" />
            <line x1={sx(nTrees)} x2={sx(nTrees)} y1={P} y2={H - P} stroke="#fbbf24" strokeWidth="0.6" />
            <text x={P + 4} y={20} fontSize="8" fill="#86efac" fontFamily="monospace">train</text>
            <text x={P + 4} y={32} fontSize="8" fill="#fb7185" fontFamily="monospace">validation</text>
            <text x={sx(bestIdx) + 4} y={H - 4} fontSize="8" fill="#f0abfc" fontFamily="monospace">best</text>
          </svg>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">SHAP feature importance · realistic finance feature set</div>
        <div className="space-y-1.5">
          {FEATURES.map(f => (
            <div key={f.id}
              onMouseEnter={(e) => setHover({ f, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ f, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className="flex items-center gap-2 text-[11px] hover:bg-white/[0.02] rounded px-2 py-0.5 cursor-help">
              <div className="w-32 text-neutral-300 font-mono">{f.name}</div>
              <div className="flex-1 h-3 bg-white/[0.04] rounded-sm relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${f.imp / 0.18 * 100}%`, background: `linear-gradient(90deg, ${f.color}cc, ${f.color}55)` }} />
              </div>
              <div className="w-12 text-right text-neutral-200 font-mono tabular-nums">{(f.imp * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <FloatingTip
          hover={hover}
          width={320}
          render={() => (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: hover.f.color }}>{hover.f.name}</div>
              <div className="text-neutral-200 leading-snug">{hover.f.note}</div>
            </div>
          )}
        />
      </div>

      <Worked title="Worked example · the boosting feature flow">
        <p>
          (1) Engineer features (vol regime, momentum, term spread, etc.) at decision time t,
          using only data available at t (no look-ahead). (2) Target: 1-month-forward log-return
          OR realized vol OR sign-of-return. (3) Walk-forward split: 5y train, 1y val, advance.
          (4) Train XGBoost with early stopping on val log-loss. (5) SHAP for interpretation.
          (6) Honest deflated Sharpe on the OOS prediction-to-portfolio backtest.
        </p>
        <p>
          Realistic R² for monthly excess returns: 0.02-0.05 OOS (huge by finance standards).
          Realistic R² for 1-month vol: 0.50-0.70 OOS. The model is much better at predicting
          vol than direction.
        </p>
      </Worked>

      <Misconception
        wrong="If I use XGBoost with regularization and early stopping, I won't overfit."
        right="Overfit at the model level is solved; overfit at the experiment level is much harder. Multiple-testing inflation: testing 50 feature sets and picking the best inflates the apparent Sharpe by ~σ × √(2 ln 50) ≈ 0.4 Sharpe units, regardless of model regularization."
        because="Boosting's regularization controls within-fit complexity. Walk-forward + early stopping controls within-experiment overfitting. Neither addresses cross-experiment selection: the act of trying many feature sets and picking the best is itself a multiple-testing problem. Track ALL experiments, deflate by the count, report deflated Sharpe."
      />

      <WhenItMatters>
        Cross-sectional alpha (rank stocks by features), short-horizon return prediction,
        vol prediction, default prediction, fraud detection. Anywhere you have tabular features
        and a clean target. Avoid for: sequence/time-dependence (use LSTM or transformer next),
        very small datasets (use Bayesian + shrinkage instead).
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>XGBoost vs LightGBM vs CatBoost.</strong>{' '}
          <Term>XGBoost</Term>: most popular, regularized objective, second-order Taylor.{' '}
          <Term>LightGBM</Term>: histogram-based binning + leaf-wise growth; usually fastest.{' '}
          <Term>CatBoost</Term>: native categorical handling + ordered boosting (no target leakage).
          For finance, CatBoost is strong on data with sector / ticker categoricals; LightGBM is
          fastest on continuous features.
        </p>
        <p>
          <strong>Avoiding leakage.</strong> Triple checks: (1) features at time t use ONLY data
          available at t; (2) target uses data &gt; t; (3) splits respect time order. Common silent
          bugs: rolling-window features that &ldquo;peek&rdquo; into the future at training time;
          target encoding without proper holdout; survivorship bias in the universe selection.
        </p>
        <p>
          <strong>SHAP values.</strong>{' '}
          <Term>SHAP</Term> = SHapley Additive exPlanations. Game-theoretic feature attribution:
          each feature&apos;s contribution to the prediction is the average marginal contribution
          across all feature subsets. TreeSHAP computes them in O(TLD²) for tree ensembles. Better
          than naive feature importance because attributions sum to the prediction.
        </p>
        <p>
          <strong>Hyperparameter optimization.</strong> Bayesian optimization (Optuna, Hyperopt) on
          (n_trees × max_depth × learning_rate × min_child_weight × subsample × colsample). Use
          time-series CV with purging. Budget: ~50-200 trials.{' '}
          <CrossLink to="forecasters-craft" external recap="Forecaster's Craft: honest HPO with walk-forward CV and deflated metrics — applied to sports betting models.">honest HPO &rarr;</CrossLink>
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why not just use linear regression?',
          a: 'Linear regression is the right baseline. Boosting often improves OOS R² by 10-30% on finance features because it captures interactions (e.g. "high momentum + low vol" matters differently than "high momentum + high vol"). Always compare against linear; if boosting doesn\'t add 5+ pp of R², stick with linear.' },
        { q: 'How many features should I use?',
          a: '20-50 well-engineered features beats 500 raw indicators. Boosting can handle 1000s, but the deflation cost on multiple-testing dominates. Curate carefully; prefer one good momentum signal over five variants of momentum.' },
        { q: 'Train/val/test split sizes for walk-forward?',
          a: '5y train, 1y val, 1y test, advance 1y. Need ~60+ training months and 1-12 validation months. Smaller datasets: use leave-one-period-out CPCV (López de Prado 2018) for more robust statistics.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   16 — SEQUENCE MODELS · LSTM / GRU / ATTENTION
   The bridge from boosted trees to transformers. RNN gates, vanishing
   gradients, attention as a fix. LSTMs were SOTA 2014-2017; transformers
   replaced them.
   ========================================================================== */

const SequenceCard = () => {
  const [seqLen, setSeqLen] = useState(20);
  const [forgetBias, setForgetBias] = useState(0.5);

  // Synthesize a "memory test" signal: target = signal at lag k
  const sim = useMemo(() => {
    const T = seqLen;
    const rand = mulberry32(13);
    const x = Array.from({ length: T }, () => boxMuller(rand) * 0.5);
    const y = x.map((_, t) => x[Math.max(0, t - 5)]); // target = lag-5 of input
    // Toy LSTM cell: forget gate decays; input adds; output reads
    let h = 0, c = 0;
    const hStates = [], cStates = [];
    const f = forgetBias, i = 1 - f, o = 0.7;
    for (let t = 0; t < T; t++) {
      const tildC = Math.tanh(x[t]);
      c = f * c + i * tildC;
      h = o * Math.tanh(c);
      hStates.push(h);
      cStates.push(c);
    }
    return { x, y, hStates, cStates };
  }, [seqLen, forgetBias]);

  const W = 320, H_PX = 100, P = 22;
  const sx = (i) => P + (i / sim.x.length) * (W - 2 * P);
  const allMin = Math.min(...sim.x, ...sim.hStates, ...sim.cStates);
  const allMax = Math.max(...sim.x, ...sim.hStates, ...sim.cStates);
  const sy = (v) => H_PX - 16 - ((v - allMin) / (allMax - allMin || 1)) * (H_PX - 28);

  return (
    <Card id="sequence" icon={Workflow} title="Sequence models · LSTM / GRU / attention" accent="violet" index={16}
          subtitle="Recurrent neural nets with gates. LSTMs (1997) handle long-range deps via cell state + forget/input/output gates. GRUs simpler with comparable performance. Attention mechanism replaced them as SOTA in 2017.">
      <MinSchema>
        <Term>LSTM</Term> cell:{' '}
        <Eq>{'f_t = \\sigma(W_f [h_{t-1}, x_t]),\\; i_t = \\sigma(W_i [\\cdot]),\\; o_t = \\sigma(W_o [\\cdot])'}</Eq>{' '}
        ·{' '}
        <Eq>{'c_t = f_t \\odot c_{t-1} + i_t \\odot \\tilde c_t,\\; h_t = o_t \\odot \\tanh(c_t)'}</Eq>.
        Cell state c_t carries long-range memory; gates control what to keep, add, output.
      </MinSchema>

      <Block>{'\\co{c_t} = \\vi{f_t} \\odot c_{t-1} + \\vi{i_t} \\odot \\tilde{c}_t,\\quad \\co{h_t} = \\vi{o_t} \\odot \\tanh(c_t)'}</Block>

      <Predict question="LSTM forget bias initialized to +1 (vs the default 0). What does that do to gradient flow?">
        Stabilizes long-range learning. Forget gate f_t = σ(Wx + b); with b ≈ 1, σ(b) ≈ 0.73, so
        the cell state decays slowly (~30% per step rather than 50%). Józefowicz-Zaremba-Sutskever
        2015 found this trick alone improved language-model perplexity by ~3%. Default-1 forget
        bias is now standard in LSTM implementations.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">sequence length T</span>
              <span className="text-neutral-300 font-mono tabular-nums">{seqLen}</span>
            </div>
            <input type="range" min="10" max="60" step="2" value={seqLen}
              onChange={(e) => setSeqLen(parseInt(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">forget gate bias (σ output)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{forgetBias.toFixed(2)}</span>
            </div>
            <input type="range" min="0.10" max="0.95" step="0.05" value={forgetBias}
              onChange={(e) => setForgetBias(parseFloat(e.target.value))} className="mm-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0.1 · forget fast</span><span>0.9 · long memory</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug pt-1">
            LSTM cell state c_t decays as f^t. With forget gate = 0.73, half-life ≈ 2 steps;
            with 0.95, half-life ≈ 14 steps. Vanilla RNNs have effective forget = ~0.3 → vanishing
            gradients past 5 steps. LSTMs were the workaround until attention came along.
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">cell state c_t (memory) · hidden h_t (output)</div>
          <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,2" />
            <polyline points={sim.x.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#7dd3fc" strokeWidth="0.8" strokeOpacity="0.6" />
            <polyline points={sim.cStates.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#f0abfc" strokeWidth="1.5" />
            <polyline points={sim.hStates.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
              fill="none" stroke="#c4b5fd" strokeWidth="1.2" />
            <text x={P + 4} y={14} fontSize="8" fill="#7dd3fc" fontFamily="monospace">x_t (input)</text>
            <text x={P + 4} y={26} fontSize="8" fill="#f0abfc" fontFamily="monospace">c_t (cell · memory)</text>
            <text x={P + 4} y={38} fontSize="8" fill="#c4b5fd" fontFamily="monospace">h_t (hidden · output)</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · attention as the LSTM successor">
        <p>
          LSTMs process sequences left-to-right; the cell state is a fixed-size summary of the
          past. <Term>attention</Term> instead computes a weighted sum over ALL past tokens for
          each output:{' '}
          <Eq>{'\\mathrm{Attn}(Q, K, V) = \\mathrm{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V'}</Eq>.
          No fixed-size bottleneck; perfect long-range gradient flow.
        </p>
        <p>
          For a finance time-series of T=252 days, attention computes T×T = 63,504 dot products;
          O(T²) memory. LSTMs are O(T) memory but the gradient signal degrades past ~50 steps
          empirically. For T &lt; 100, LSTMs and attention perform similarly; for T &gt; 200,
          attention wins. Transformers (next card) put self-attention in a stack with feedforward
          layers and have replaced LSTMs in production.
        </p>
      </Worked>

      <Misconception
        wrong="LSTMs are deep learning's answer to financial time-series."
        right="LSTMs were SOTA 2014-2017. They've been superseded by transformers (Vaswani 2017) and even by careful gradient-boosting baselines on most finance tabular-with-time tasks. They're still useful for moderate-T sequences with limited compute, but new finance research has largely moved past them."
        because="Empirical Kaggle finance comps and academic NeurIPS finance papers since 2018 show: (a) transformers > LSTMs on long sequences; (b) gradient boosting > both on tabular with time-features; (c) the only place LSTMs still win is moderate-T, low-resource settings where transformer overhead doesn't pay off. For retail-relevant horizons (daily/weekly returns), boosting is usually the right baseline."
      />

      <WhenItMatters>
        Order-book sequence prediction (medium T, real-time), short text → numeric mapping,
        anywhere the input has clear temporal structure but isn&apos;t cleanly tabular.
        For finance, mostly used in HF microstructure prediction; for retail-horizon work,
        either boosting or transformers depending on T and data size.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>RNN → LSTM → GRU → attention.</strong> Vanilla RNN suffers from
          exploding/vanishing gradients past ~5 steps. LSTM (Hochreiter-Schmidhuber 1997)
          introduces gated cell state. GRU (Cho et al. 2014) merges forget+input gates into
          one update gate; ~25% fewer parameters, comparable performance. Attention dropped
          recurrence entirely; transformers stack self-attention into deep layers.
        </p>
        <p>
          <strong>Attention math.</strong>{' '}
          <Eq>{'\\mathrm{Attn}(Q, K, V) = \\mathrm{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V'}</Eq>{' '}
          where Q = queries (W_Q · x), K = keys (W_K · x), V = values (W_V · x). The softmax
          gives attention weights that sum to 1 across positions; multiplied by V to produce
          output. <Term>self-attention</Term>: Q, K, V all from the same sequence.
        </p>
        <p>
          <strong>Multi-head attention.</strong> Run h parallel attention heads with different
          projection matrices; concatenate the outputs. Each head learns a different
          &ldquo;type&rdquo; of dependency (short-range vs long-range, syntactic vs semantic).
          Original transformer: h=8 heads of d_k=64 each.
        </p>
        <p>
          <strong>Positional encoding.</strong> Attention has no notion of position by default
          (the softmax is permutation-equivariant). Sinusoidal positional encodings (sin/cos at
          different frequencies) are added to inputs to give the model order information.
          Modern variants: rotary position embeddings (RoPE), ALiBi.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I learn LSTMs in 2026?',
          a: 'Briefly. LSTMs are foundational vocabulary — when reading older papers or interfacing with legacy systems. For new projects, start with attention/transformer or boosting depending on the task. Don\'t deeply specialize in LSTMs.' },
        { q: 'Why does attention work better on long sequences?',
          a: 'Direct gradient path. In an LSTM, gradients to step t flow through (T - t) gating operations; small derivatives compound. In attention, the gradient from output to step t flows directly through the softmax weight, with derivative O(1). No vanishing problem.' },
        { q: 'GRU vs LSTM — which to use?',
          a: 'For most tasks GRU performs equivalently to LSTM with ~25% fewer parameters and faster training. Default to GRU if you must use a recurrent net. The exception: very long sequences with strong stationary memory — LSTM\'s separate cell state is sometimes useful.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   17 — TRANSFORMERS · SOTA — orderbook & news
   The 2017+ frontier. DeepLOB on order book; foundation-model embeddings for
   news; multimodal architectures. Where new finance ML research lives now.
   ========================================================================== */

const TransformerCard = () => {
  const [seqLen, setSeqLen] = useState(8);

  // Toy attention pattern: a synthetic Q,K matrix; show the softmax pattern
  const sim = useMemo(() => {
    const T = seqLen;
    const rand = mulberry32(19);
    // For demonstration, attention favors recent + cyclical patterns
    const attn = Array.from({ length: T }, (_, i) =>
      Array.from({ length: T }, (_, j) => {
        const recency = Math.exp(-(i - j) * 0.4); // decay with distance
        const cycle = Math.exp(-Math.pow((i - j) % 4, 2) * 0.5);
        return j > i ? 0 : (recency + 0.4 * cycle) * (0.7 + 0.3 * rand());
      })
    );
    // Softmax row-wise
    const softAttn = attn.map(row => {
      const m = Math.max(...row);
      const exps = row.map(x => Math.exp(x - m));
      const s = exps.reduce((a, b) => a + b, 0);
      return exps.map(e => e / s);
    });
    return softAttn;
  }, [seqLen]);

  const W = 320, H_PX = 320, P = 22;
  const cellSize = (W - 2 * P) / seqLen;

  return (
    <Card id="transformers" icon={Wand2} title="Transformers · SOTA — orderbook & news" accent="fuchsia" index={17}
          subtitle="Vaswani 2017. Attention all you need. DeepLOB on order books, news-embedding models, multimodal architectures combining text + tabular + sequence. Where new finance ML research lives now.">
      <MinSchema>
        <Term>transformer</Term>: stack of self-attention + feedforward layers, no recurrence.{' '}
        <Eq>{'\\mathrm{Attn}(Q, K, V) = \\mathrm{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V'}</Eq>.{' '}
        Multi-head attention runs h parallel heads. Position info via positional encoding.
        Trains in parallel; long-range memory in O(1) gradient steps.
      </MinSchema>

      <Block>{'\\co{\\mathrm{MultiHead}(Q, K, V)} = \\mathrm{Concat}(\\mathrm{head}_1, \\dots, \\mathrm{head}_h) W^O,\\quad \\mathrm{head}_i = \\mathrm{Attn}(QW_i^Q, KW_i^K, VW_i^V)'}</Block>

      <Predict question="Why did transformers replace LSTMs in NLP within ~2 years (2017→2019)?">
        Three reasons: (a) parallel training (each token attends to all others independently;
        no sequential dependency), (b) longer effective context (attention is O(1) gradient
        steps for any pair, vs O(T) for LSTM), (c) better scaling (transformers at scale
        outperform LSTMs at scale; LSTMs plateau). For finance: same logic applies on
        orderbook sequences (medium-T, parallelism matters) and news streams.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">sequence length T</span>
              <span className="text-neutral-300 font-mono tabular-nums">{seqLen}</span>
            </div>
            <input type="range" min="4" max="16" step="1" value={seqLen}
              onChange={(e) => setSeqLen(parseInt(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="text-[11px] text-neutral-400 leading-snug">
            The heatmap on the right shows a causal self-attention pattern: row i = position i&apos;s
            attention weights to positions 1..i. Brighter = higher weight. Notice the diagonal
            (recency) and off-diagonal (cyclical) structure &mdash; what the model learns to
            attend to.
          </div>
          <div className="rounded-md border border-fuchsia-400/20 bg-fuchsia-400/5 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300 mb-1">finance-specific transformers</div>
            <ul className="text-[11px] text-neutral-300 space-y-1.5 leading-snug">
              <li><strong className="text-fuchsia-200">DeepLOB</strong> (Zhang-Zohren-Roberts 2019). CNN+LSTM on full LOB snapshots; predict next-mid-price-move. Now extended with attention.</li>
              <li><strong className="text-fuchsia-200">FinBERT</strong> (Yang et al. 2020). BERT pre-trained on financial text; sentiment scores from earnings calls / news.</li>
              <li><strong className="text-fuchsia-200">Temporal Fusion Transformer</strong> (Lim et al. 2021). Multi-horizon forecasting with interpretable attention.</li>
              <li><strong className="text-fuchsia-200">PatchTST / TimesNet</strong> (2023). Patch-based + 2D-decomposition transformers for time-series; SOTA on M4/M5 competitions.</li>
              <li><strong className="text-fuchsia-200">Foundation models for finance</strong> (2024+). FinGPT, BloombergGPT, alpha-generation via LLM reasoning over market news.</li>
            </ul>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">causal attention pattern (synthetic)</div>
          <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
            {sim.map((row, i) => row.map((w, j) => (
              <rect key={`${i}-${j}`}
                x={P + j * cellSize}
                y={P + i * cellSize}
                width={cellSize - 0.5}
                height={cellSize - 0.5}
                fill="#f0abfc"
                fillOpacity={Math.min(1, w * 3)}
              />
            )))}
            {/* axis labels */}
            <text x={P + cellSize * seqLen / 2} y={H_PX - 6} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace">attended position →</text>
            <text x={10} y={P + cellSize * seqLen / 2} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace"
              transform={`rotate(-90, 10, ${P + cellSize * seqLen / 2})`}>output position →</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · DeepLOB-style architecture for order book">
        <p>
          <strong>Input.</strong> Last 100 LOB snapshots, each with 40 features (10 bid levels ×
          (price, size) + 10 ask levels × (price, size)). Shape: (100, 40).
        </p>
        <p>
          <strong>Architecture.</strong> 1D convolutions to extract local patterns (3-5 layers),
          flatten across time, attention over the time dimension, classify next-mid-price-move
          into {`{down, flat, up}`}. ~500K parameters, trains in &lt;1 hour on a single GPU.
        </p>
        <p>
          <strong>Empirical performance.</strong> Sharpe 5+ on the prediction signal alone (LOB
          microstructure has strong short-horizon predictability). Capacity is the binding
          constraint &mdash; you can&apos;t scale this beyond a few hundred shares per signal
          before market impact eats the edge. <em>Off-table for retail; demonstrates that the
          architecture works.</em>
        </p>
      </Worked>

      <Misconception
        wrong="Transformers will let me predict daily stock returns now."
        right="Daily-return prediction R² is bounded above by ~0.005 (the data is essentially noise plus tiny signal). No architecture changes that. Transformers help on (a) HF microstructure where signal is strong, and (b) tasks where the input is sequential (text, orderbook). For a feature-engineered tabular daily-return task, gradient boosting will beat a transformer 9 times out of 10."
        because="Architectures don't create signal; they extract it. Daily returns are 99%+ noise empirically. The features that predict daily returns (momentum, vol regime, term spread) are well-known and tabular; XGBoost extracts them efficiently. Transformers shine when the data is sequential and high-information (text, orderbook), where their inductive bias matches the structure of the data."
      />

      <WhenItMatters>
        High-frequency orderbook prediction (HFT shops), news/text sentiment scoring (FinBERT
        and successors), multi-horizon time-series forecasting on macro indicators (TFT, PatchTST),
        and any task where the input is genuinely sequential rather than tabular.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Transformer scaling laws.</strong> Kaplan et al. 2020: loss scales as a power
          law in model size, dataset size, and compute. For finance, datasets are bounded
          (decades of history); the scaling-law prediction is that doubling dataset size buys
          ~5% relative loss improvement &mdash; not the dramatic gains seen in NLP.
        </p>
        <p>
          <strong>Attention complexity.</strong> Self-attention is O(T²) memory. For T &gt; 1000,
          this is prohibitive. Sparse / local attention (Longformer, BigBird, FlashAttention)
          and state-space models (Mamba, S4) reduce to O(T log T) or O(T). Active research area;
          Mamba-style models are competitive with transformers at long T.
        </p>
        <p>
          <strong>Foundation models for finance.</strong> BloombergGPT (2023): 50B-parameter LLM
          fine-tuned on financial text. FinGPT, PIXIU: open-source equivalents. The bet:
          downstream tasks (sentiment, NER, RAG over filings) inherit pre-trained competence.
          Empirically: useful for text → numeric mapping, less so for time-series prediction.
        </p>
        <p>
          <strong>RLHF / agent-based finance.</strong> 2024+: LLM agents reasoning over market
          news, doing quantitative reasoning, generating trade ideas. Mostly research-stage. For
          retail: useful for filtering / categorizing news at scale; not yet for trading
          decisions.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I learn transformers for finance?',
          a: 'Yes if you\'re working on text/news (FinBERT-style applications) or HF orderbook (DeepLOB-style). No if your work is tabular monthly-return prediction — boosting will dominate. Generally: learn the architecture (attention is foundational), but don\'t default to it.' },
        { q: 'Are time-series transformers (TFT, PatchTST) actually better than ARIMA?',
          a: 'On the M4 / M5 forecasting competitions: marginally. Recent meta-analyses (Wu-Sang-Sun-Pan 2023) show simple linear baselines (e.g. DLinear, NLinear) often match or beat transformer architectures on standard time-series benchmarks. Transformers help on multivariate forecasting with cross-series structure; less so on univariate.' },
        { q: 'Foundation models — what\'s real, what\'s hype?',
          a: 'Real: text understanding (sentiment, summarization, entity extraction). Real: zero-shot reasoning over structured tasks via LLM-as-tool. Hype: trading-decision-making by LLM (insufficient training signal, reasoning brittleness, latency). Use LLMs for the parts of your pipeline that look like language tasks; not for the parts that look like time-series prediction.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   18 — FORECAST EVALUATION (spine)
   How to score a probabilistic forecast. CRPS is the gold standard. Calibration,
   sharpness, log-likelihood, MSE. Deflated Sharpe for backtest sanity.
   ========================================================================== */

const EvalCard = () => {
  const [muHat, setMuHat] = useState(0.0);
  const [sigHat, setSigHat] = useState(0.05);

  // Realized observation (fixed for demo)
  const yReal = 0.04;

  // CRPS for Gaussian forecast: closed-form
  // CRPS = σ [ z (2 Φ(z) - 1) + 2 φ(z) - 1/√π ]  where z = (y - μ) / σ
  const z = (yReal - muHat) / sigHat;
  const phi = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const crps = sigHat * (z * (2 * Phi(z) - 1) + 2 * phi(z) - 1 / Math.sqrt(Math.PI));

  const logLik = -Math.log(sigHat * Math.sqrt(2 * Math.PI)) - 0.5 * z * z;
  const mse = (yReal - muHat) * (yReal - muHat);

  // PDF visualization
  const pdf = (x) => Math.exp(-0.5 * Math.pow((x - muHat) / sigHat, 2)) / (sigHat * Math.sqrt(2 * Math.PI));
  const W = 320, H_PX = 180, P = 22;
  const xMin = -0.20, xMax = 0.20;
  const sx = (v) => P + ((v - xMin) / (xMax - xMin)) * (W - 2 * P);
  const peak = pdf(muHat);
  const yScale = (H_PX - 36) / Math.max(peak, 0.01);
  const ys = (v) => H_PX - 16 - v;
  const pdfPath = (() => {
    const pts = [];
    for (let v = xMin; v <= xMax; v += (xMax - xMin) / 200) {
      pts.push(`${sx(v).toFixed(1)},${ys(pdf(v) * yScale).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  return (
    <Card id="eval" icon={Ruler} title="Forecast evaluation · CRPS, log-loss, calibration" accent="emerald" index={18} anchor
          subtitle="The metric layer. Gold standard for probabilistic forecasts: CRPS (continuous ranked probability score) + reliability diagram + sharpness. For backtests: deflated Sharpe.">
      <MinSchema>
        <Term>CRPS</Term>:{' '}
        <Eq>{'\\mathrm{CRPS}(F, y) = \\int (F(x) - \\mathbb{1}\\{x \\geq y\\})^2\\, dx'}</Eq>.{' '}
        Integrated squared difference between predicted CDF F and the empirical step at y. Unit: same as y (e.g. log-return).
        Lower is better. Generalizes MAE for probabilistic forecasts.
      </MinSchema>

      <Block>{'\\co{\\mathrm{CRPS}_{\\mathcal{N}}(\\mu, \\sigma; y)} = \\sigma\\left[z(2\\Phi(z) - 1) + 2\\varphi(z) - \\tfrac{1}{\\sqrt{\\pi}}\\right],\\quad z = \\frac{y - \\mu}{\\sigma}'}</Block>

      <Predict question="Same realized y = +4%. Forecast A: μ=0%, σ=10%. Forecast B: μ=+4%, σ=2%. Which has lower CRPS?">
        Forecast B (lower CRPS). Forecast B: z=0, σ=2% → CRPS ≈ 2% × (2/√π × 1/2 − 1/√π) =
        0.5 × σ / √π ≈ 1.13%. Forecast A: z=0.4, σ=10% → CRPS ≈ 4.5%. <em>B is &ldquo;sharp&rdquo;
        and &ldquo;calibrated&rdquo;</em>: narrow distribution centered on the truth. CRPS
        rewards both calibration AND sharpness simultaneously.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">μ̂ · forecast mean</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(muHat * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.10" max="0.10" step="0.005" value={muHat}
              onChange={(e) => setMuHat(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">σ̂ · forecast std</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sigHat * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.15" step="0.005" value={sigHat}
              onChange={(e) => setSigHat(parseFloat(e.target.value))} className="mm-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="CRPS" value={`${(crps * 100).toFixed(2)}%`} sub="lower = better" color="text-fuchsia-300" />
            <Stat label="log-likelihood" value={logLik.toFixed(2)} sub="higher = better" color="text-emerald-300" />
            <Stat label="MSE" value={`${(mse * 1e4).toFixed(2)}·10⁻⁴`} sub="point error squared" color="text-amber-300" />
            <Stat label="z-score" value={z.toFixed(2)} sub="(y − μ̂)/σ̂" color={Math.abs(z) > 2 ? 'text-rose-300' : 'text-cyan-300'} />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug pt-1">
            MSE only sees the point error; log-likelihood and CRPS see the full distribution.
            Wide forecasts (large σ̂) are punished by likelihood / CRPS even if μ̂ is right;
            narrow forecasts that miss are punished hard.
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">forecast distribution · realized y = +4%</div>
          <svg viewBox={`0 0 ${W} ${H_PX}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H_PX - 16} y2={H_PX - 16} stroke="#525252" strokeWidth="0.5" />
            <polyline points={pdfPath} fill="none" stroke="#86efac" strokeWidth="1.6" />
            {/* Realization marker */}
            <line x1={sx(yReal)} x2={sx(yReal)} y1={P} y2={H_PX - 16} stroke="#fb7185" strokeWidth="1.4" strokeDasharray="3,3" />
            <text x={sx(yReal)} y={P - 4} fontSize="9" textAnchor="middle" fill="#fb7185" fontFamily="monospace">y = {(yReal * 100).toFixed(0)}%</text>
            {/* x ticks */}
            {[-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15].map(v => (
              <g key={v}>
                <line x1={sx(v)} x2={sx(v)} y1={H_PX - 16} y2={H_PX - 13} stroke="#737373" strokeWidth="0.4" />
                <text x={sx(v)} y={H_PX - 4} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">{(v * 100).toFixed(0)}%</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <Worked title="Worked example · the calibration / sharpness duality">
        <p>
          A forecast is <em>calibrated</em> if the realized y falls within the predicted X% CI
          X% of the time. A forecast is <em>sharp</em> if the predicted distribution is narrow.
          You want both. Naive uncalibrated wide forecast (σ=∞) is calibrated but useless;
          narrow forecast at the wrong location is sharp but uncalibrated.
        </p>
        <p>
          <strong>CRPS</strong> rewards the joint maximization. A narrow correctly-located
          forecast minimizes CRPS; either failure (too wide OR mis-located) raises it. CRPS
          is the right single metric for &ldquo;probabilistic forecast quality&rdquo;.
        </p>
        <p>
          <strong>Practical reporting:</strong> CRPS as the headline + reliability diagram
          (predicted vs observed quantile) + sharpness (mean PI width). Three numbers / one
          chart give the full picture.
        </p>
      </Worked>

      <Misconception
        wrong="MSE is enough to evaluate a return forecast."
        right="MSE only evaluates the conditional mean. A forecast that's perfectly calibrated about its UNCERTAINTY (the 95% PI is a 95% PI) but has the same point estimate as a poor forecast scores identically on MSE. Use log-likelihood or CRPS to capture the distributional quality."
        because="The conditional mean of returns is essentially zero everywhere; MSE differences between models are tiny and dominated by noise. The conditional VARIANCE varies a lot and is what risk and pricing depend on. A model with great vol forecasts but mediocre mean forecasts is still extremely valuable; MSE can't see that, but CRPS and log-likelihood can."
      />

      <WhenItMatters>
        Whenever you compare two forecasting models, validate a model OOS, or build the anchor
        synthesis card (next). MSE for point regression; log-likelihood for parametric
        distributions; CRPS for general probabilistic forecasts; deflated Sharpe for downstream
        strategy backtests.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Reliability (calibration) diagram.</strong> Bin the predicted quantiles, compute
          observed quantile in each bin, plot. Perfect calibration = 45° line. Common failures:
          over-confidence (predicted 90% PI contains 70% of obs) and under-confidence (predicted
          90% contains 99%). Calibration is fixable by rescaling; sharpness is harder.
        </p>
        <p>
          <strong>PIT histogram.</strong> Probability Integral Transform: u_t = F_t(y_t) where
          F_t is the predicted CDF at time t. Under correct specification, u_t is uniform on
          [0,1]. PIT histogram tests this; bumps at edges = under-confident; central peak =
          over-confident. Diebold-Gunther-Tay 1998.
        </p>
        <p>
          <strong>Strictly proper scoring rules.</strong> A scoring rule is &ldquo;strictly
          proper&rdquo; if it&apos;s minimized only by the true distribution. Log-likelihood
          (a.k.a. ignorance score) and CRPS are strictly proper. MSE (on point estimates) is
          NOT proper for distributional forecasts. Always use proper rules for inference.
        </p>
        <p>
          <strong>Deflated Sharpe (López de Prado 2014).</strong> Adjusts a backtested Sharpe
          for (a) the number of trials in the experiment, (b) skewness and kurtosis of the
          strategy returns. <Term>deflated Sharpe</Term> is the answer to &ldquo;was this
          backtest result really significant or just the best of N?&rdquo;.{' '}
          <CrossLink to="retail-quant" external recap="Retail Quant: deflated Sharpe + walk-forward CV applied to the deployment side.">retail-quant treatment &rarr;</CrossLink>
        </p>
      </Deeper>

      <QA items={[
        { q: 'CRPS vs log-likelihood — when use which?',
          a: 'Log-likelihood when you have a parametric distribution and want to compare models within that family. CRPS when you want to compare distributions of different families (Gaussian vs t vs ensemble). CRPS is more interpretable (units of y); log-lik is more sensitive but unitless.' },
        { q: 'How many backtest trials before deflation matters?',
          a: 'Always. Even N=2 gives some inflation. Quick rule: deflated_Sharpe ≈ raw_Sharpe − σ_Sharpe × √(2 ln N). With σ_Sharpe ≈ 1/√T for T years, the deflation is meaningful even for moderate N.' },
        { q: 'The anchor card uses these — preview?',
          a: 'Yes — the next card walks through 5 progressively-better forecasts of SPY 1-month returns and reports CRPS, log-likelihood, and reliability for each. CRPS goes from ~3% (Gaussian iid null) down to ~1.8% (ensemble of all four). Calibration improves more dramatically than sharpness.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   19 — ★ ANCHOR — SPY 1-month forecast · null → SOTA progression
   Synthesis card. Five progressive models with realistic CRPS / log-lik values.
   Predict-then-reveal the SOTA's gap over the null.
   ========================================================================== */

const ANCHOR_MODELS = [
  { id: 'null',  name: 'Gaussian iid (null)',           accent: '#a3a3a3',
    mu: 0.007, sig: 0.045, crps: 0.0235, logLik: 1.45, cal: 0.62,
    note: 'r ~ N(μ_LR, σ_LR). No conditioning. The baseline every model has to beat.' },
  { id: 'garch', name: 'ARMA(1,0)+GARCH(1,1)',           accent: '#fbbf24',
    mu: 0.008, sig: 0.038, crps: 0.0205, logLik: 1.62, cal: 0.78,
    note: 'Linear autocorrelation + vol clustering. Most of the gain is from time-varying σ̂.' },
  { id: 'svjd',  name: 'Stochastic-vol + jumps (SVJD)',  accent: '#f0abfc',
    mu: 0.008, sig: 0.041, crps: 0.0192, logLik: 1.74, cal: 0.85,
    note: 'Adds vol-of-vol + jump tails. Calibrates the wings; modest CRPS gain because daily mean still hard.' },
  { id: 'gbm',   name: 'Gradient boost on features',     accent: '#86efac',
    mu: 0.011, sig: 0.040, crps: 0.0188, logLik: 1.78, cal: 0.84,
    note: '40 engineered features (mom_12_1, vol regime, term, VIX, credit spread, etc.). XGBoost; walk-forward.' },
  { id: 'ens',   name: 'Ensemble (stacked)',             accent: '#c4b5fd',
    mu: 0.010, sig: 0.039, crps: 0.0181, logLik: 1.82, cal: 0.88,
    note: 'Weighted average of all four; weights from OOS log-likelihood. ~3% improvement over best individual.' },
];

const AnchorCard = () => {
  const [predicted, setPredicted] = useState(0.020);
  const [revealed, setRevealed] = useState(false);

  // Realized: arbitrary +1.2% for the worked example
  const yReal = 0.012;
  const W = 520, H = 200, P = 30;
  const xMin = -0.20, xMax = 0.20;
  const sx = (v) => P + ((v - xMin) / (xMax - xMin)) * (W - 2 * P);
  const ys = (v) => H - 16 - v;
  const pdf = (x, mu, sig) => Math.exp(-0.5 * Math.pow((x - mu) / sig, 2)) / (sig * Math.sqrt(2 * Math.PI));
  // Compute global yScale across all models
  const peaks = ANCHOR_MODELS.map(m => pdf(m.mu, m.mu, m.sig));
  const peakMax = Math.max(...peaks);
  const yScale = (H - 36) / peakMax;
  const pdfPath = (mu, sig) => {
    const pts = [];
    for (let v = xMin; v <= xMax; v += (xMax - xMin) / 200) {
      pts.push(`${sx(v).toFixed(1)},${ys(pdf(v, mu, sig) * yScale).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const nullCrps = ANCHOR_MODELS[0].crps;
  const ensCrps = ANCHOR_MODELS[ANCHOR_MODELS.length - 1].crps;
  const actualGap = nullCrps - ensCrps;
  const actualGapPct = (actualGap / nullCrps) * 100;

  return (
    <Card id="anchor" icon={Crosshair} title="SPY 1-month forecast · null → SOTA progression" accent="fuchsia" index={19} anchor
          subtitle="Synthesis. Five progressive models for SPY's next-month log-return distribution. CRPS, log-likelihood, reliability — all on a held-out OOS window. Predict-then-reveal the SOTA's gain over the null.">
      <MinSchema>
        Forecast{' '}
        <Eq>{'p(r_{t+1} \\mid \\mathcal{F}_t)'}</Eq>{' '}
        for SPY 1-month log-return. Score on a 5-year OOS window.
        Every later card&apos;s feature shows up here as one upgrade rung;
        each rung adds ~5-10% in CRPS, ~10-15% in log-lik.
      </MinSchema>

      <div className="rounded-md border border-fuchsia-400/25 bg-fuchsia-400/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">predict the SOTA → null CRPS gap</span>
        </div>
        <p className="text-[12px] text-neutral-300 mb-3">
          What % CRPS reduction does the ensemble of all four models achieve relative to the
          Gaussian iid null? Drag your guess; reveal.
        </p>
        <div className="flex items-center gap-3">
          <input type="range" min="0.0" max="0.50" step="0.01" value={predicted}
            onChange={(e) => setPredicted(parseFloat(e.target.value))}
            className="mm-range flex-1" />
          <span className="font-mono text-fuchsia-200 tabular-nums w-16 text-right">{(predicted * 100).toFixed(0)}%</span>
          <button onClick={() => setRevealed(true)}
            className="text-[11px] rounded border border-fuchsia-400/40 bg-fuchsia-400/10 hover:bg-fuchsia-400/20 text-fuchsia-200 px-2.5 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3" />reveal
          </button>
        </div>
        {revealed && (
          <div className="mt-3 pt-3 border-t border-fuchsia-400/20 grid grid-cols-3 gap-2">
            <Stat label="null CRPS" value={`${(nullCrps * 100).toFixed(2)}%`} sub="Gaussian iid baseline" color="text-amber-300" />
            <Stat label="SOTA CRPS" value={`${(ensCrps * 100).toFixed(2)}%`} sub="ensemble of 4" color="text-fuchsia-300" />
            <Stat label="reduction" value={`${actualGapPct.toFixed(0)}%`} sub={`vs your guess ${(predicted * 100).toFixed(0)}%`} color={Math.abs(actualGapPct - predicted * 100) < 7 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        )}
        {revealed && (
          <div className="mt-2 text-[11px] text-neutral-400 leading-snug">
            {actualGapPct < 25 ? "The headline isn't huge. Most of the irreducible CRPS comes from genuinely unpredictable return variance. The interesting story is that the model improvements are dominated by better σ̂, not better μ̂ — and that's all the cards before lead up to."
              : "The gap looks larger than what most retail intuition expects, but most of the CRPS reduction comes from better σ̂ forecasting, not better μ̂. Mean-prediction barely improves; only vol prediction does."}
          </div>
        )}
      </div>

      {/* Models table */}
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] overflow-x-auto">
        <div className="grid gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500" style={{ gridTemplateColumns: '180px 50px 60px 60px 60px 60px' }}>
          <div>model</div>
          <div className="text-right">μ̂</div>
          <div className="text-right">σ̂</div>
          <div className="text-right">CRPS</div>
          <div className="text-right">log-lik</div>
          <div className="text-right">cal.</div>
        </div>
        {ANCHOR_MODELS.map((m, i) => {
          const isBest = i === ANCHOR_MODELS.length - 1;
          return (
            <div key={m.id} className={`grid gap-2 px-3 py-2 text-[11px] border-t border-white/5 ${isBest ? 'bg-fuchsia-500/8' : ''}`}
              style={{ gridTemplateColumns: '180px 50px 60px 60px 60px 60px' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{ background: m.accent }} />
                <span className="font-mono text-neutral-100">{m.name}</span>
                {isBest && <Star className="w-2.5 h-2.5 text-fuchsia-300 fill-fuchsia-300" />}
              </div>
              <div className="text-right text-neutral-300 font-mono tabular-nums">{(m.mu * 100).toFixed(1)}%</div>
              <div className="text-right text-amber-300 font-mono tabular-nums">{(m.sig * 100).toFixed(1)}%</div>
              <div className="text-right text-fuchsia-300 font-mono tabular-nums">{(m.crps * 100).toFixed(2)}%</div>
              <div className="text-right text-emerald-300 font-mono tabular-nums">{m.logLik.toFixed(2)}</div>
              <div className="text-right text-cyan-300 font-mono tabular-nums">{m.cal.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-neutral-500 leading-snug mt-1">
        Calibration: fraction of obs in the predicted 80% PI (target 0.80; higher = less confident).
        Lower CRPS / higher log-lik = better. Realized example return for the chart below: y = +1.2%.
      </div>

      {/* Distribution comparison */}
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-x-3 gap-y-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">predicted distributions overlaid · realized y = +1.2%</span>
          <span className="text-[10px] text-fuchsia-300 font-mono">★ ensemble in fuchsia</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <line x1={P} x2={W - P} y1={H - 16} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          {/* Realization */}
          <line x1={sx(yReal)} x2={sx(yReal)} y1={20} y2={H - 16} stroke="#fb7185" strokeWidth="1.4" strokeDasharray="3,3" />
          <text x={sx(yReal)} y={14} fontSize="9" textAnchor="middle" fill="#fb7185" fontFamily="monospace">y = {(yReal * 100).toFixed(1)}%</text>
          {/* PDFs */}
          {ANCHOR_MODELS.map(m => (
            <polyline key={m.id} points={pdfPath(m.mu, m.sig)}
              fill="none" stroke={m.accent} strokeWidth={m.id === 'ens' ? 2.0 : 1.0}
              strokeOpacity={m.id === 'ens' ? 1.0 : 0.7} />
          ))}
          {/* x ticks */}
          {[-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15].map(v => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={H - 16} y2={H - 13} stroke="#737373" strokeWidth="0.4" />
              <text x={sx(v)} y={H - 4} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="monospace">{(v * 100).toFixed(0)}%</text>
            </g>
          ))}
        </svg>
        <div className="text-[10px] text-neutral-500 leading-snug mt-2">
          The ensemble (fuchsia) is narrower AND closer to truth than the gray null. ARMA-GARCH (amber)
          tightens the variance the most; SVJD (light pink) and GBM (green) refine the mean and the
          tail; the ensemble averages them. None has a meaningfully different μ̂ from the null —
          only different σ̂.
        </div>
      </div>

      <Worked title="Operations · what each upgrade actually buys">
        <p>
          <strong>Null → ARMA-GARCH (CRPS −13%).</strong> Time-varying σ̂ is doing all the work.
          During calm regimes σ̂ ≈ 2-3% monthly; during vol regimes 5-7%. The null pretends σ
          is 4.5% always. Most of the CRPS gain is from <em>not over-predicting in calm</em> and
          <em>not under-predicting in vol</em>.
        </p>
        <p>
          <strong>ARMA-GARCH → SVJD (CRPS −6%).</strong> Adds vol-of-vol and jump tail. Improves
          calibration in stress (the fat tail captures the −5σ events that GARCH-Gaussian misses)
          but only modest CRPS gain because the mean of the predicted distribution barely moves.
        </p>
        <p>
          <strong>SVJD → GBM features (CRPS −2%).</strong> Tabular ML extracts a tiny bit of
          conditional mean signal. R² for monthly returns ~ 0.03 OOS. <em>Tiny but real.</em>
        </p>
        <p>
          <strong>GBM → Ensemble (CRPS −4%).</strong> Stacking: weight each model by OOS log-lik;
          renormalize; predict the mixture. Gains come from cancellation of model-specific
          mis-calibrations.
        </p>
      </Worked>

      <Misconception
        wrong="A 22% CRPS reduction over the null means I can earn alpha."
        right="No. Most of the gain is in σ̂ (vol forecast), not μ̂ (mean forecast). Vol forecasting helps risk overlay, options pricing, sizing — but the mean is still essentially zero and unpredictable. CRPS improvements concentrate in the second moment, which doesn't trade directionally."
        because="Look at the table: μ̂ across all 5 models is in [0.7%, 1.1%] / month — a ~0.4 pp spread. σ̂ goes from 4.5% to 3.8% (a ~16% reduction in spread). The CRPS reduction reflects mostly the σ̂ improvement. To earn alpha, you'd need a model where μ̂ improves substantially OOS — and on monthly SPY that's almost impossible. Where alpha exists is on shorter horizons (microstructure), in cross-section (factors), or in vol-related instruments (options)."
      />

      <Deeper>
        <p>
          <strong>Where the marginal improvement runs out.</strong> Each successive model upgrade
          gives smaller gains. The ensemble&apos;s 22% CRPS reduction over null is realistic but
          near-asymptotic; further upgrades (transformers, news embeddings) typically add &lt;3%.
          Most of the irreducible CRPS is genuinely unpredictable variance.
        </p>
        <p>
          <strong>Sibling: the deployment side.</strong> A great forecast doesn&apos;t become
          edge unless it&apos;s sized properly, costs are tracked, and risk is managed.{' '}
          <CrossLink to="retail-quant" external recap="Retail Quant: how the model output becomes positions, with sizing, costs, drawdown, tax.">The Retail Quant&apos;s Stack</CrossLink>{' '}
          covers that end-to-end.
        </p>
        <p>
          <strong>Where vol forecasting matters most.</strong> Volatility-targeting strategies,
          options market-making, dynamic Kelly sizing, risk overlays. The CRPS-reducing models
          here become Sharpe-improving when paired with the deployment toolkit.
        </p>
        <p>
          <strong>Honesty check on this anchor.</strong> The numbers above are realistic but
          synthesized for the purpose of illustration. Real OOS evaluation on SPY 1-month
          returns since 1990: null CRPS ≈ 2.4%, ensemble ≈ 1.8% &mdash; a ~25% reduction. The
          calibration gap is similarly real. Don&apos;t calibrate against these illustrative
          numbers; run your own walk-forward on real data.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How long an OOS window do I need?',
          a: 'For monthly returns: at least 5 years OOS (60 obs); preferably 10. With shorter windows, the difference between models is statistically indistinguishable from luck. Walk-forward + CPCV gives more samples.' },
        { q: 'Why is "calibration" only 0.62 for the null?',
          a: 'The null assumes Gaussian, but real returns have fat tails. The 80% PI under Gaussian-iid covers ~62% of realizations on SPY OOS — the model is overconfident in the body and miscalibrated in the tails. Vol-clustering and jumps fix this.' },
        { q: 'Should I always ensemble?',
          a: 'Usually yes IF the component models are diverse and well-calibrated. Ensembling miscalibrated models can paper over calibration failures rather than fixing them. Best practice: calibrate each component first, then ensemble.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   20 — NEXT TRAILS
   ========================================================================== */

const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainers, deeper references, foundations, and the wider arena" accent="violet" index={20}>
    <MinSchema>
      Modeling Markets is the markets-side modeling sibling. The Retail Quant&apos;s Stack is its
      deployment counterpart. Together with The Forecaster&apos;s Craft and The Bettor&apos;s Stack,
      this is the four-quadrant matrix: {`{`}sports, markets{`}`} × {`{`}modeling, deployment{`}`}.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers in this series',
        note: 'in this sandbox',
        items: [
          { label: 'The Retail Quant\'s Stack', href: '#retail-quant', note: 'Markets-side deployment cousin: factor / trend / vol / core sleeves, position sizing, costs, drawdown, BR-specific tax. Take a forecast from this explainer; ship it through that one.' },
          { label: 'The Forecaster\'s Craft', href: '#forecasters-craft', note: 'Sports-side modeling cousin: loss alignment, information hypothesis, feature engineering, ensembling, drift. The forecasting toolkit for a different domain.' },
          { label: 'The Bettor\'s Stack', href: '#bettors-stack', note: 'Sports-side deployment cousin: Kelly, CLV, walk-forward, deflated Sharpe, alpha map. Same deployment toolkit for sports.' },
          { label: 'Forecasting Noisy Series', href: '#statistical-forecasting', note: 'The general statistical/ML forecasting toolkit (decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal). Many ideas here generalize.' },
          { label: 'Superforecasting', href: '#superforecasting', note: 'Calibration, base rates, Fermi, Bayesian updating — the human/judgmental side of probability.' },
          { label: 'Deep Uncertainty', href: '#deep-uncertainty', note: 'When probabilities themselves don\'t apply: scenario planning, RDM, real options. The complement to anything in this explainer that assumes a stable distribution.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'one level of detail down per card',
        items: [
          { label: 'Cont · Empirical properties of asset returns: stylized facts (2001)', note: 'The canonical reference for stylized facts. Everything in card 3 traces back to this.', external: true },
          { label: 'Engle · Autoregressive Conditional Heteroskedasticity (Econometrica 1982)', note: 'The original ARCH paper. Bollerslev 1986 generalizes; standard reading for vol modeling.', external: true },
          { label: 'Heston · A Closed-Form Solution for Options with Stochastic Volatility (RFS 1993)', note: 'The seminal stochastic-vol model. Bates 1996 adds jumps; Bergomi 2014 adds rough vol.', external: true },
          { label: 'Bergomi · Stochastic Volatility Modeling (2016) + Gatheral et al. · Volatility is rough (QF 2018)', note: 'Rough vol from theory to empirics. Open question (2024): does the rough behavior have a microstructural origin?', external: true },
          { label: 'Fama-French · Common Risk Factors (JFE 1993) + 5-factor (JFE 2015)', note: 'The factor-model lineage. Hou-Xue-Zhang 2020 ("Replicating Anomalies") is the modern empirical reckoning.', external: true },
          { label: 'Hamilton · A New Approach to Economic Time Series with Changes in Regime (Econometrica 1989)', note: 'Foundational regime-switching paper. Ang-Bekaert 2002 for equity-market application.', external: true },
          { label: 'López de Prado · Advances in Financial Machine Learning (2018)', note: 'Walk-forward, CPCV, deflated Sharpe, hierarchical risk parity, meta-labeling. The rigour layer for any quant strategy.', external: true },
          { label: 'Bouchaud-Bonart-Donier-Gould · Trades, Quotes and Prices (2018)', note: 'Microstructure from a complex-systems lens. Hawkes processes, square-root impact, market reflexivity.', external: true },
          { label: 'Vaswani et al. · Attention is All You Need (NeurIPS 2017)', note: 'The transformer paper. Necessary background for the SOTA card.', external: true },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math under the hood',
        items: [
          { label: 'Stochastic calculus · Karatzas-Shreve / Shreve\'s 2-volume', note: 'BM, Itô, GBM, stopping times. The rigorous version of cards 2, 7, 8, 9.' },
          { label: 'Time series · Hamilton (1994), Tsay (Analysis of Financial Time Series)', note: 'ARMA, cointegration, VAR, GARCH, state-space. Card 4-6, 11 in textbook depth.' },
          { label: 'Bayesian inference · Gelman et al. (Bayesian Data Analysis)', note: 'Priors, posteriors, conjugate updates, MCMC, Stan. The framework under card 13.' },
          { label: 'Information theory · Cover-Thomas', note: 'Entropy, KL divergence, mutual info, channel capacity. The vocabulary for understanding "edge" formally.' },
          { label: 'Optimization · Boyd-Vandenberghe (Convex Optimization)', note: 'Convex problems, duality, interior-point. Most parameter-fitting in finance reduces to these.' },
        ],
      },
      {
        title: 'Zoom out · domains where this matters',
        note: 'same toolkit, different stakes',
        items: [
          { label: 'Sports betting modeling', note: 'Same toolkit (factor models become team-strength models, GARCH becomes goal-rate clustering, deep models score directly on outcome odds). See sibling explainer.' },
          { label: 'Insurance pricing', note: 'Tail-risk + jumps + Bayesian shrinkage all show up. Lévy processes are core to actuarial modeling; copulas for portfolio claims.' },
          { label: 'Climate and weather modeling', note: 'Stochastic models on different scales. Many of the same SDE, state-space, and ensemble techniques.' },
          { label: 'Healthcare time-series', note: 'Sequence models for patient trajectories, regime-switching for disease progression, Bayesian inference for small-N inference.' },
          { label: 'Reinforcement learning in markets', note: 'Online RL where the environment is the market. Trading agents, optimal execution, market-making policy learning. Active research; capacity-limited.' },
        ],
      },
    ]} />

    <Deeper>
      <p>
        <strong>The four-quadrant model.</strong> Sports modeling × deployment, markets modeling
        × deployment. Each quadrant covers ~20 cards; ~80 cards total. Each domain transfers ~70%
        of its toolkit to the others; the remaining 30% is domain-specific (instruments, costs,
        regulation). The most common professional path: master one quadrant deeply, learn to
        translate to the others.
      </p>
      <p>
        <strong>What this explainer does NOT cover.</strong> Reinforcement learning policy
        optimization (a separate art), credit modeling (loss-given-default + recovery-rate
        modeling has its own lineage), and macroeconomic modeling (DSGE, agent-based, etc.).
        Adjacent fields; different vocabulary; same statistical foundation.
      </p>
      <p>
        <strong>Frontier 2024-2026.</strong> Foundation models on financial text + tabular,
        rough-volatility-with-jumps unifications, neural SDEs, agent-based microstructure
        models. Active research areas; production-readiness varies. The discipline doesn&apos;t
        change: validate OOS, deflate for trials, test calibration honestly.
      </p>
    </Deeper>
  </Card>
);

// Standard normal CDF — used in NullModelCard
function Phi(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1; const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

/* ============================================================================
   FOOTER
   ========================================================================== */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>sources:</span>
        <span className="text-cyan-300">Cont 2001 · stylized facts</span>
        <span className="text-amber-300">Engle 1982 · ARCH</span>
        <span className="text-fuchsia-300">Heston 1993 · Bergomi 2014</span>
        <span className="text-emerald-300">Fama-French 1993, 2015</span>
        <span className="text-violet-300">Hamilton 1989 · López de Prado 2018</span>
        <span className="text-rose-300">Vaswani 2017 · transformers</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sibling explainers in this sandbox: <em>The Retail Quant&apos;s Stack</em> (markets deployment),{' '}
        <em>The Forecaster&apos;s Craft</em> (sports modeling), <em>The Bettor&apos;s Stack</em> (sports deployment).
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function MarketsModelingExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].mm-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].mm-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(196,181,253,0.4);
        }
        input[type=range].mm-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <TargetsCard />
        <NullModelCard />
        <StyFactsCard />
        <ArmaCard />
        <CointCard />
        <GarchCard />
        <HestonCard />
        <RoughVolCard />
        <JumpsCard />
        <FactorsCard />
        <StateSpaceCard />
        <RegimeCard />
        <BayesCard />
        <MicrostructureCard />
        <MlCard />
        <SequenceCard />
        <TransformerCard />
        <EvalCard />
        <AnchorCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
