import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, BarChart3, Boxes, BrainCircuit, Briefcase, ChevronDown,
  CircleDollarSign, Coins, Compass, Crosshair, DollarSign, Eye, EyeOff, Filter,
  FlaskConical, Gauge, Globe2, Hammer, HandCoins, HelpCircle, Hourglass, Landmark,
  Layers, LineChart, Lightbulb, Link2, Network, PieChart, Quote, Radar, Receipt,
  Repeat, Scale, ScrollText, ShieldAlert, Sigma, Sparkles, Star, Target, Telescope,
  TrendingUp, TrendingDown, Waves, Wallet, Workflow, Zap, CheckCircle2, XCircle,
  Ruler, Lock, Sigma as SigmaIcon, Percent, ArrowDownRight, ArrowUpRight,
} from 'lucide-react';

/* ============================================================================
   The Retail Quant's Stack — A multi-strategy book at home
   The deployment-side sibling for a BR-domiciled retail investor at a foreign
   broker. No leverage, no HFT, no relative-value arb that needs prime-broker
   infra. Lean on intrinsic risk premia + cost discipline. Anchored on a $250k
   4-sleeve book.
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber — numbers
  '\\hi':  '\\textcolor{##fb7185}{#1}',  // rose — emphasis / wrong
  '\\co':  '\\textcolor{##7dd3fc}{#1}',  // sky — concepts
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',  // emerald — good / right / money
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
  // Risk premia
  'risk premium': 'Excess return investors demand for bearing risk over the risk-free rate. The reason long-horizon equity / credit / vol-selling pays in expectation.',
  'equity risk premium': 'Excess return of a broad equity index over short-term government bonds. ~5-6% historical real, ~3-4% forward-looking estimates.',
  'term premium': 'Excess return of long-duration bonds over rolling short-term bonds. Compensation for bearing duration / inflation risk.',
  'credit spread': 'Yield gap between corporate bonds and same-maturity treasuries. Compensates for default + liquidity risk.',
  'variance risk premium': 'Persistent gap between option-implied volatility and subsequently realized volatility. Implied is on average ~3-4 vol points higher; selling vol earns this in expectation.',
  'VRP': 'Same as variance risk premium. Implied vol > realized vol on average.',

  // Performance metrics
  'Sharpe ratio': '(Mean excess return) / (return std dev), annualized. Standard performance metric. Doesn’t account for skew or higher moments.',
  'Sortino ratio': 'Like Sharpe but penalizes only downside volatility. Better metric for asymmetric strategies (e.g. trend-following).',
  'Calmar ratio': 'Annualized return / max drawdown. The "what-it-feels-like" metric — captures the survival cost of returns.',
  'drawdown': 'Peak-to-trough decline in portfolio value. The thing that makes you doubt the strategy.',
  'max drawdown': 'Largest peak-to-trough decline observed over a period. A retail investor’s practical risk budget.',
  'deflated Sharpe': 'López de Prado’s correction for the number of strategy variants tested. The honest Sharpe under multiple-testing inflation.',
  'information ratio': 'Active return / tracking error. Sharpe applied to a benchmark-relative strategy.',

  // Factors
  'factor': 'A return-generating characteristic shared across many assets — e.g. value, size, momentum, quality, low-volatility. Long-short factor portfolios isolate the return premium.',
  'Fama-French': 'Three-factor model (market + size + value) extending CAPM; later extended to five factors (adding profitability + investment).',
  'Carhart': 'Four-factor model (Fama-French + momentum). Standard in asset-pricing tests since 1997.',
  'value': 'Cheap stocks (high book-to-market or earnings-yield) outperform expensive ones over long horizons. The original factor.',
  'momentum': 'Past 12-1 month winners outperform past losers. The strongest empirical anomaly; survives in-sample and out-of-sample.',
  'quality': 'High profitability + stable earnings stocks outperform. Captures the "junk" leg — avoids unprofitable speculative names.',
  'low-vol': 'Low-volatility stocks outperform high-volatility ones on a risk-adjusted basis. Anomaly: contradicts CAPM. Often attributed to leverage constraints.',
  'cross-sectional': 'Comparing assets to each other at one point in time (e.g. ranking stocks by value at month-end and going long the cheapest decile).',
  'time-series': 'Comparing one asset’s current state to its own history (e.g. is SPY trending up over the past 12 months relative to its mean?).',
  'factor zoo': 'The hundreds of "factors" published in academic literature. Most don’t replicate out-of-sample. The honest count is closer to 5-10 robust factors.',

  // Trend
  'TSMOM': 'Time-series momentum: go long an asset if its 12-month return is positive, short otherwise. Works across nearly all liquid futures.',
  'cross-sectional momentum': 'Long top-quintile past winners, short bottom-quintile past losers. Distinct from TSMOM but related.',
  'vol targeting': 'Scale position size by 1 / realized volatility so each position contributes equal risk. Stabilizes Sharpe across regimes.',
  'CTA': 'Commodity Trading Advisor — funds that systematically trade trend on liquid futures. The institutional version of TSMOM.',
  'trend ETF': 'A retail ETF (DBMF, KMLM, RSST) that replicates a basket of trend-following CTA strategies. Accessible substitute for futures trading.',
  'roll yield': 'Return from rolling a futures position forward as it approaches expiry. Positive in backwardation, negative in contango.',
  'backwardation': 'Futures curve where near contracts trade above far contracts. Holders earn positive roll yield as time passes.',
  'contango': 'Futures curve where near contracts trade below far contracts. Long positions lose roll yield as they re-buy expiring contracts higher.',

  // Volatility
  'implied volatility': 'Volatility estimate extracted from option prices via the Black-Scholes model. The market’s forward-looking vol forecast.',
  'IV': 'Same as implied volatility.',
  'realized volatility': 'Standard deviation of actual returns observed over a window. The "what actually happened" vol.',
  'RV': 'Same as realized volatility.',
  'vol surface': 'IV plotted against strike (skew/smile) and time-to-expiry (term structure). The fingerprint of an option market.',
  'volatility skew': 'Pattern where OTM puts trade at higher implied vol than OTM calls. Reflects equity-market crash fear.',
  'volatility smile': 'U-shaped IV-vs-strike curve seen in FX and commodity options where both tails are priced richly.',
  'term structure of vol': 'IV plotted against time-to-expiry. Usually upward-sloping in calm markets, inverted in crises.',
  'delta': 'Option Greek: ∂V/∂S, the change in option price per $1 change in underlying. Range: 0 to 1 for calls, −1 to 0 for puts.',
  'gamma': 'Option Greek: ∂²V/∂S², the change in delta per $1 change in underlying. Largest for ATM options near expiry.',
  'theta': 'Option Greek: ∂V/∂t, the loss in option value per day from time decay. Negative for long options, positive for short.',
  'vega': 'Option Greek: ∂V/∂σ, the change in option price per 1 vol-point change in IV. Largest for long-dated ATM options.',
  'cash-secured put': 'Sell a put with enough cash set aside to buy the shares at strike. Defined-risk way to harvest the variance risk premium.',
  'CSP': 'Cash-secured put.',
  'covered call': 'Sell a call against a long stock position. Caps upside; collects premium. Common retail vol-selling structure.',
  'credit spread': 'Sell one option, buy another at a worse strike for protection. Limits max loss vs naked option-selling.',
  'defined-risk': 'A position whose maximum loss is bounded and known in advance (e.g. credit spread, cash-secured put).',

  // Sizing
  'Kelly criterion': 'Optimal bet fraction f* = (μ − r) / σ² for log-utility. Maximizes expected log wealth.',
  'fractional Kelly': 'Bet a fixed multiple (e.g. 0.25 or 0.5) of full Kelly. Trades growth for survival; equivalent to a Bayesian shrinkage on edge uncertainty.',
  'log-utility': 'U(W) = log(W). The utility function under which Kelly is optimal. Implies decreasing marginal utility of wealth.',

  // Portfolio
  'Markowitz': 'Mean-variance optimization: maximize μᵀw − (λ/2)·wᵀΣw subject to budget. Closed form via QP.',
  'mean-variance': 'Same as Markowitz. The foundational portfolio framework.',
  'efficient frontier': 'The set of portfolios that maximize expected return for each level of variance. The Sharpe-maximizing point lies on it.',
  'covariance matrix': 'Per-pair covariance of asset returns. Drives portfolio variance.',
  'correlation matrix': 'Same as covariance, but normalized to [−1, 1]. Easier to read; loses absolute volatility info.',
  'Ledoit-Wolf shrinkage': 'Bayesian shrinkage of the sample covariance toward a structured prior. Stabilizes Markowitz when N>>T.',
  'Black-Litterman': 'Portfolio framework that combines market-implied returns with the user’s subjective views via Bayesian updating. More stable than raw Markowitz.',
  'risk parity': 'Allocate so each asset (or sleeve) contributes equal risk. Doesn’t need return forecasts — just the covariance matrix.',
  'all-weather': 'Bridgewater’s risk-parity portfolio, balanced across growth/inflation regimes. The canonical risk-parity book.',

  // CV / costs / multiple testing
  'walk-forward CV': 'Time-respecting cross-validation: train on [start..t], validate on (t..t+h], advance t, repeat. The only honest CV for time series.',
  'data leakage': 'When information from after the prediction time leaks into training. The cardinal sin of time-series ML.',
  'look-ahead bias': 'Using information at time t that wouldn’t actually have been available at t. A common silent backtesting bug.',
  'survivorship bias': 'Backtesting on a universe that includes only survivors (still-listed firms). Inflates realized returns.',
  'multiple testing': 'Statistical inflation that occurs when you test many hypotheses; the best of N is biased upward.',
  'transaction cost': 'Total round-trip cost per trade: bid-ask spread + commissions + slippage + market impact + (sometimes) tax.',
  'slippage': 'Difference between expected execution price and realized fill. Larger for illiquid instruments and large orders.',
  'turnover': 'Annual fraction of portfolio replaced. High-turnover strategies eat their alpha in transaction costs.',

  // BR-specific
  'IRPF': 'Imposto de Renda Pessoa Física — Brazilian personal income tax. Determines monthly DARF obligations on swing-trade gains and dividends.',
  'tabela regressiva': 'Brazilian regressive tax schedule on bonds: 22.5% under 6mo → 15% over 24mo. Holding longer is tax-efficient.',
  'carnê-leão': 'Brazilian monthly self-assessment for income from foreign sources (foreign-broker dividends, interest, FX gains). Due by the last business day of the next month.',
  'Tesouro IPCA+': 'Brazilian government inflation-linked bond (NTN-B). Pays a real coupon over IPCA. The closest BR analog to US TIPS.',
  'TIPS': 'Treasury Inflation-Protected Securities — US Treasury bonds whose principal adjusts with CPI. Real-yield instrument.',
  'BRL carry': 'Carry trade: borrowing in low-rate currency to invest in BRL at much higher rates. Pays in calm markets; tail-bites in crises.',
  'hedge ratio': 'Fraction of foreign-currency exposure hedged back to home currency. h=0 fully unhedged, h=1 fully hedged.',
  'BDR': 'Brazilian Depositary Receipt — a Brazil-listed certificate representing a foreign stock or ETF. Lets BR investors hold foreign assets via B3.',

  // Misc
  'beta': 'Slope of asset returns regressed on market returns. Captures market exposure; β=1 moves with the market 1:1.',
  'alpha': 'Risk-adjusted excess return — what’s left after subtracting market beta times market return. The "skill" component.',
  'Jensen’s alpha': 'Portfolio return minus CAPM-predicted return. The original definition of alpha.',
  'Sharpe-style alpha': 'Intercept of return regression on factor returns. Generalization of Jensen’s alpha to multi-factor.',
  'CAPM': 'Capital Asset Pricing Model: E[r_i] − r_f = β_i · (E[r_m] − r_f). The single-factor risk model that started it all.',
  'GBM': 'Geometric Brownian Motion: dS/S = μ dt + σ dW. The default null-model for stock prices; Black-Scholes assumes it.',
  'fat tails': 'Return distributions with kurtosis > 3 (more extreme observations than Gaussian). Equity daily returns have kurtosis ~10-20.',
  'regime': 'A persistent state of the market with characteristic vol/correlation/drift. Bull, bear, crisis, low-vol, etc.',
  'rebalancing': 'Selling overweight positions and buying underweight ones to restore target weights. Monthly or quarterly is standard for retail.',
  'CLV': 'Closing Line Value — the betting world’s sufficient statistic for sharpness. In markets, the analog is implementation shortfall vs decision price.',
  'implementation shortfall': 'Difference between the price at the decision moment and the actual fill. The market analog of CLV.',
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

/* ============================================================================
   HERO + SECTION NAV
   "Equity-curve field" — drifting compounding curves with a sky+amber palette
   to differentiate from the bettors-stack (emerald+amber) and forecasters-craft
   (fuchsia+violet).
   ========================================================================== */

const EquityField = () => {
  const lines = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    rate: 0.0007 + i * 0.00018, vol: 12 + i * 3, off: 50 + i * 16, phase: i * 1.2, dur: 20 + i * 1.8,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
      {lines.map((c, i) => {
        const pts = [];
        for (let x = 0; x <= 800; x += 4) {
          const trend = 290 - (Math.exp(c.rate * x) - 1) * 38 - c.off;
          const wobble = Math.sin(x * 0.016 + c.phase) * c.vol;
          const y = trend + wobble;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return (
          <motion.polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke={i % 3 === 0 ? '#7dd3fc' : i % 3 === 1 ? '#fbbf24' : '#f0abfc'}
            strokeOpacity={0.4 + (i % 3) * 0.1}
            strokeWidth={1.2 + (i % 2) * 0.4}
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
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-amber-500/5 to-transparent" />
    <EquityField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Briefcase className="w-3.5 h-3.5" /> the retail quant&apos;s stack
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-amber-200 bg-clip-text text-transparent">
          The Retail Quant&apos;s Stack
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">A multi-strategy book at home, no leverage required.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Without prime-broker infra you can&apos;t arb anything. What&apos;s left is the{' '}
          <span className="text-sky-300">good part</span> &mdash; harvesting{' '}
          <span className="text-amber-300">intrinsic risk premia</span>, sizing positions for{' '}
          <span className="text-emerald-300">survival</span>, paying the{' '}
          <span className="text-rose-300">tax &amp; cost tax</span> honestly, and stitching{' '}
          <span className="text-fuchsia-300">a multi-strategy book</span> from sleeves that don&apos;t move together.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">factors</span>
          <span className="text-amber-300">trend</span>
          <span className="text-fuchsia-300">vol premium</span>
          <span className="text-cyan-300">strategic core</span>
          <span className="text-emerald-300">sizing &amp; kelly</span>
          <span className="text-rose-300">costs · tax · drawdown</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'premia',       label: 'Risk-premium menu',         icon: Layers,        anchor: true },
  { id: 'alpha',        label: 'Alpha vs risk premia',      icon: Telescope },
  { id: 'nongauss',     label: 'Returns aren’t Gaussian', icon: Waves },
  { id: 'stochmodels',  label: 'Stochastic price models',   icon: LineChart },
  { id: 'factordesign', label: 'Factor design',             icon: Filter },
  { id: 'factorimpl',   label: 'Factor implementation',     icon: Hammer },
  { id: 'tsmom',        label: 'Time-series momentum',      icon: TrendingUp },
  { id: 'trend',        label: 'Trend sleeve',              icon: Activity },
  { id: 'varprem',      label: 'IV vs RV',                  icon: Gauge },
  { id: 'volstruct',    label: 'Vol structures',            icon: Sigma },
  { id: 'core',         label: 'Strategic core',            icon: Landmark },
  { id: 'sizing',       label: 'Position sizing',           icon: Scale,         anchor: true },
  { id: 'portconstr',   label: 'Portfolio construction',    icon: Workflow },
  { id: 'costs',        label: 'Transaction costs',         icon: Receipt },
  { id: 'backtest',     label: 'Walk-forward & overfitting',icon: Hourglass },
  { id: 'tax',          label: 'Tax frictions',             icon: Percent },
  { id: 'fx',           label: 'Currency exposure',         icon: Globe2 },
  { id: 'drawdown',     label: 'Drawdown survival',         icon: ShieldAlert },
  { id: 'anchor',       label: 'Anchor: $250k book',        icon: Crosshair,     anchor: true },
  { id: 'trails',       label: 'Next trails',               icon: Compass },
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
   Seeded RNG + standard-normal sampler — used by stochastic-model cards.
   ========================================================================== */

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
   STUB CARDS — placeholders; replaced in stages C-L.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ============================================================================
   01 — RISK-PREMIUM MENU (spine)
   The intrinsic-risk-premia universe. What retail can actually harvest without
   leverage or arb infra. Bars of historical Sharpe; combine with diversification.
   ========================================================================== */

const PREMIA = [
  { id: 'erp',   label: 'Equity ERP',     sharpe: 0.40, ret: 5.5, vol: 16,  color: '#7dd3fc',
    note: 'Stocks vs T-bills. The oldest, biggest, deepest-traded premium. ~5-6% annualized real.' },
  { id: 'term',  label: 'Term',           sharpe: 0.25, ret: 1.5, vol: 6.5, color: '#a5b4fc',
    note: 'Long bonds vs short bonds. Pays in calm/disinflationary regimes; hurts in inflation shocks.' },
  { id: 'cred',  label: 'Credit',         sharpe: 0.35, ret: 2.0, vol: 5.5, color: '#fcd34d',
    note: 'Corporate bonds over Treasuries. Compensates for default + liquidity risk. Bites in recessions.' },
  { id: 'val',   label: 'Value',          sharpe: 0.30, ret: 3.5, vol: 11,  color: '#86efac',
    note: 'Long cheap stocks (high book-to-market), short expensive. Cross-sectional, long-short.' },
  { id: 'mom',   label: 'Momentum',       sharpe: 0.55, ret: 6.0, vol: 11,  color: '#fda4af',
    note: 'Past 12-minus-1-month winners vs losers. The strongest factor in the empirical literature.' },
  { id: 'tsm',   label: 'Trend (TSMOM)',  sharpe: 0.40, ret: 6.0, vol: 14,  color: '#fdba74',
    note: 'Time-series: long an asset if its 12m return is positive, short if negative. Diversifies across asset classes.' },
  { id: 'vrp',   label: 'Variance RP',    sharpe: 0.50, ret: 4.0, vol: 8,   color: '#f0abfc',
    note: 'Implied vol > realized vol on average. Selling vol harvests the gap; tail-risk-laden.' },
  { id: 'carry', label: 'Carry',          sharpe: 0.45, ret: 4.5, vol: 10,  color: '#67e8f9',
    note: 'Long high-yield vs low-yield (FX, bonds, futures). Pays in calm regimes; tail-bites in shocks.' },
];

const PremiaCard = () => {
  const [hover, setHover] = useState(null);
  const [picked, setPicked] = useState(['erp', 'tsm', 'vrp']);
  const [rho, setRho] = useState(0.10);

  const maxSharpe = 0.6, maxRet = 7, maxVol = 18;

  const sel = PREMIA.filter(p => picked.includes(p.id));
  const wEqual = sel.length ? 1 / sel.length : 0;
  const meanRet = sel.reduce((s, p) => s + wEqual * p.ret, 0);
  const portVar = (() => {
    let v = 0;
    for (let i = 0; i < sel.length; i++) for (let j = 0; j < sel.length; j++) {
      const corr = i === j ? 1 : rho;
      v += wEqual * wEqual * (sel[i].vol / 100) * (sel[j].vol / 100) * corr;
    }
    return v;
  })();
  const portVol = Math.sqrt(portVar) * 100;
  const portSharpe = portVol > 0 ? meanRet / portVol : 0;

  const togglePick = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <Card id="premia" icon={Layers} title="The risk-premium menu" accent="sky" index={1} anchor
          subtitle="Without arb infra, edge means harvesting compensated risks. There are ~8 of them. Each pays a Sharpe of 0.25-0.55 standalone — combined, the diversification math takes over.">
      <MinSchema>
        A <Term>risk premium</Term> is the excess return investors collectively demand for bearing
        a risk over the risk-free rate. The <em>intrinsic</em> ones &mdash; equity, term, credit,
        value, momentum, trend, vol, carry &mdash; are persistently positive on average and are
        what retail can capture without leverage or infra advantage.
      </MinSchema>

      <p>
        Each premium standalone earns a <Term>Sharpe ratio</Term> of <span className="font-mono text-amber-300">~0.25-0.55</span>.
        That&apos;s lower than what marketing materials promise but higher than zero, and it
        compounds. The point of a multi-strategy book is that these premia don&apos;t move
        together &mdash; combining several uncorrelated 0.4-Sharpe sleeves at equal weight gets
        you to a portfolio Sharpe well above any individual sleeve.
      </p>

      <Block>{'\\co{\\text{Sharpe}} = \\frac{\\mathbb{E}[r] - r_f}{\\sigma(r)} \\quad\\Longleftrightarrow\\quad \\co{\\text{Sharpe}}_{\\text{port}} = \\frac{\\sum_i w_i \\mu_i}{\\sqrt{w^T \\Sigma w}}'}</Block>

      <Predict question="An equal-weight portfolio of 3 sleeves each with Sharpe 0.40 and pairwise correlation 0.10 — what's the portfolio Sharpe?">
        <Eq>{'\\text{Sharpe}_p \\approx 0.40 \\cdot \\frac{\\sum w_i \\sigma_i}{\\sqrt{w^T \\Sigma w}}'}</Eq>{' '}
        With ρ=0.10 and equal vols, <Eq>{'w^T\\Sigma w = (1/n)(1 + (n-1)\\rho)\\sigma^2'}</Eq>. For
        n=3, ρ=0.10: factor is <Eq>{'\\sqrt{1/(0.4)} \\approx 1.58'}</Eq>{' '}&rarr; portfolio Sharpe
        <span className="font-mono text-emerald-300"> ≈ 0.63</span>. The math reward for
        diversification is large precisely because the standalone Sharpes are small.
      </Predict>

      {/* Iso-Sharpe scatter: x=return, y=vol, dashed rays from origin = constant-Sharpe lines */}
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">return × volatility · iso-Sharpe contours</span>
          <span className="text-[10px] text-neutral-500">click a dot or row to toggle into the combined portfolio</span>
        </div>
        {(() => {
          const W = 520, H = 240, P = 30;
          const xMax = 8, yMax = 20;
          const sx = (v) => P + (v / xMax) * (W - 2 * P);
          const sy = (v) => H - P - (v / yMax) * (H - 2 * P);
          const sharpeRays = [0.25, 0.50, 0.75, 1.00];
          // Project label positions to avoid overlap (small jitter per premium)
          const labelOffset = { erp: [10,3], term: [10,3], cred: [10,3], val: [10,-6], mom: [10,-6], tsm: [10,3], vrp: [-12,-6], carry: [10,3] };
          // Background Sharpe-zone wedges: 5 colored polygons radiating from origin, each between two iso-Sharpe rays
          const wedges = [
            { srLo: 0,    srHi: 0.25, color: '#fb7185' },
            { srLo: 0.25, srHi: 0.50, color: '#fb923c' },
            { srLo: 0.50, srHi: 0.75, color: '#fbbf24' },
            { srLo: 0.75, srHi: 1.0,  color: '#84cc16' },
            { srLo: 1.0,  srHi: 99,   color: '#22c55e' },
          ];
          const exitOf = (sr) => {
            if (sr === 0) return [0, yMax];
            if (sr >= 99) return [xMax, 0];
            const xAtTop = sr * yMax;
            if (xAtTop <= xMax) return [xAtTop, yMax];
            return [xMax, xMax / sr];
          };
          return (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Sharpe-zone background coloring */}
              {wedges.map((wd, i) => {
                const p1 = exitOf(wd.srLo); // wider angle (lower SR)
                const p2 = exitOf(wd.srHi); // narrower angle (higher SR)
                const corners = [[0, 0], p1];
                // If p1 is on top edge and p2 is on right edge, traverse top-right corner
                if (p1[1] >= yMax - 1e-6 && p2[0] >= xMax - 1e-6 && p1[0] < xMax - 1e-6) {
                  corners.push([xMax, yMax]);
                }
                corners.push(p2);
                const pts = corners.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
                return <polygon key={i} points={pts} fill={wd.color} fillOpacity="0.10" />;
              })}
              {/* Iso-Sharpe rays */}
              {sharpeRays.map(sr => {
                // line from (0,0) to where it exits the data bounds
                const xAtYmax = sr * yMax; // x value where y = yMax
                const endX = Math.min(xMax, xAtYmax);
                const endY = endX / sr;
                return (
                  <g key={sr}>
                    <line x1={sx(0)} y1={sy(0)} x2={sx(endX)} y2={sy(endY)}
                      stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.25" strokeDasharray="3,3" />
                    <text x={sx(endX) - 2} y={sy(endY) + (endX === xMax ? -3 : 9)} fontSize="9" textAnchor="end"
                      fill="#7dd3fc" fillOpacity="0.55" fontFamily="monospace">SR {sr.toFixed(2)}</text>
                  </g>
                );
              })}
              {/* Axes */}
              <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
              <line x1={P} y1={P / 2} x2={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
              {/* x ticks */}
              {[0, 2, 4, 6, 8].map(v => (
                <g key={v}>
                  <line x1={sx(v)} y1={H - P} x2={sx(v)} y2={H - P + 3} stroke="#737373" strokeWidth="0.4" />
                  <text x={sx(v)} y={H - P + 13} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="monospace">{v}%</text>
                </g>
              ))}
              {/* y ticks */}
              {[0, 5, 10, 15, 20].map(v => (
                <g key={v}>
                  <line x1={P - 3} y1={sy(v)} x2={P} y2={sy(v)} stroke="#737373" strokeWidth="0.4" />
                  <text x={P - 5} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="#737373" fontFamily="monospace">{v}%</text>
                </g>
              ))}
              {/* Axis titles */}
              <text x={(P + W - P) / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace">annual return →</text>
              <text x={10} y={(P / 2 + H - P) / 2} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace"
                transform={`rotate(-90, 10, ${(P / 2 + H - P) / 2})`}>annual volatility →</text>
              {/* Premia dots */}
              {PREMIA.map(p => {
                const isPicked = picked.includes(p.id);
                const cx = sx(p.ret), cy = sy(p.vol);
                const [dx, dy] = labelOffset[p.id] || [10, 3];
                return (
                  <g key={p.id} style={{ cursor: 'pointer' }}
                    onClick={() => togglePick(p.id)}
                    onMouseEnter={(e) => setHover({ p, mx: e.clientX, my: e.clientY })}
                    onMouseMove={(e) => setHover({ p, mx: e.clientX, my: e.clientY })}
                    onMouseLeave={() => setHover(null)}>
                    {isPicked && <circle cx={cx} cy={cy} r={10} fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeOpacity="0.9" />}
                    <circle cx={cx} cy={cy} r={6} fill={p.color} fillOpacity={isPicked ? 0.95 : 0.75} stroke="#0a0a0a" strokeWidth="1" />
                    <text x={cx + dx} y={cy + dy} fontSize="9.5" textAnchor={dx < 0 ? 'end' : 'start'}
                      fill={isPicked ? '#f0abfc' : '#d4d4d4'}
                      fontFamily="ui-sans-serif, system-ui">{p.label}</text>
                  </g>
                );
              })}
            </svg>
          );
        })()}
        <div className="text-[10px] text-neutral-500 leading-snug mt-1">
          Sharpe = return / vol &mdash; the fainted dashed rays are constant-Sharpe contours from the origin.
          Anything <em>below</em> a contour has <em>higher</em> Sharpe than that line. The bottom-right corner is
          where you want to live; nothing real gets there standalone, which is why diversification is the engine.
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-mono">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:'#6ee7b7'}} /><span className="text-emerald-300">Sharpe</span></span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:'#fbbf24'}} /><span className="text-amber-300">return</span></span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:'#fb7185'}} /><span className="text-rose-300">vol</span></span>
        </div>
        <span className="text-[10px] text-neutral-500 ml-auto">or scroll to the row list &darr;</span>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="space-y-1.5">
          {PREMIA.map(p => {
            const isPicked = picked.includes(p.id);
            const wS = (p.sharpe / maxSharpe) * 100;
            const wR = (p.ret / maxRet) * 100;
            const wV = (p.vol / maxVol) * 100;
            return (
              <button key={p.id} onClick={() => togglePick(p.id)}
                onMouseEnter={(e) => setHover({ p, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHover({ p, mx: e.clientX, my: e.clientY })}
                onMouseLeave={() => setHover(null)}
                className={`w-full grid grid-cols-[10px_88px_1fr_1fr_1fr] items-center gap-2 text-[11px] px-2 py-1 rounded transition-colors ${isPicked ? 'bg-fuchsia-500/10' : 'hover:bg-white/[0.03]'}`}>
                <span className={`w-2 h-2 rounded-sm ${isPicked ? 'ring-2 ring-fuchsia-400/70' : ''}`} style={{ background: p.color }} />
                <span className="text-left text-neutral-200 font-mono tabular-nums truncate">{p.label}</span>
                <span className="flex items-center gap-1.5">
                  <span className="flex-1 h-2.5 bg-white/[0.04] rounded-sm relative overflow-hidden">
                    <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${Math.min(100, wS)}%`, background: 'linear-gradient(90deg, #6ee7b7cc, #6ee7b755)' }} />
                  </span>
                  <span className="w-8 text-right text-emerald-200 font-mono tabular-nums text-[10px]">{p.sharpe.toFixed(2)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex-1 h-2.5 bg-white/[0.04] rounded-sm relative overflow-hidden">
                    <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${Math.min(100, wR)}%`, background: 'linear-gradient(90deg, #fbbf24cc, #fbbf2455)' }} />
                  </span>
                  <span className="w-9 text-right text-amber-200 font-mono tabular-nums text-[10px]">{p.ret.toFixed(1)}%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex-1 h-2.5 bg-white/[0.04] rounded-sm relative overflow-hidden">
                    <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${Math.min(100, wV)}%`, background: 'linear-gradient(90deg, #fb7185cc, #fb718555)' }} />
                  </span>
                  <span className="w-9 text-right text-rose-200 font-mono tabular-nums text-[10px]">{p.vol.toFixed(1)}%</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <FloatingTip
        hover={hover}
        width={320}
        render={() => (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: hover.p.color }}>{hover.p.label}</div>
            <div className="text-neutral-200 leading-snug">{hover.p.note}</div>
            <div className="pt-1 mt-1 border-t border-white/10 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div><div className="text-neutral-500">Sharpe</div><div className="text-emerald-300">{hover.p.sharpe.toFixed(2)}</div></div>
              <div><div className="text-neutral-500">Return</div><div className="text-amber-300">{hover.p.ret.toFixed(1)}%</div></div>
              <div><div className="text-neutral-500">Vol</div><div className="text-rose-300">{hover.p.vol.toFixed(1)}%</div></div>
            </div>
          </div>
        )}
      />

      <div className="mt-4 grid md:grid-cols-3 gap-2">
        <Stat label="picked sleeves" value={`${sel.length}`} sub="equal-weight combined" color="text-fuchsia-300" />
        <Stat label="portfolio Sharpe" value={portSharpe.toFixed(2)} sub={`vs avg standalone ${(sel.reduce((s,p)=>s+p.sharpe,0)/(sel.length||1)).toFixed(2)}`} color="text-emerald-300" />
        <Stat label="portfolio vol" value={`${portVol.toFixed(1)}%`} sub={`assumed ρ=${rho.toFixed(2)}`} color="text-amber-300" />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-neutral-400 font-mono">avg pairwise correlation ρ</span>
          <span className="text-neutral-300 font-mono tabular-nums">{rho.toFixed(2)}</span>
        </div>
        <input type="range" min="-0.20" max="0.80" step="0.05" value={rho}
          onChange={(e) => setRho(parseFloat(e.target.value))} className="rq-range w-full" />
        <div className="text-[10px] text-neutral-500 mt-1">
          Realistic in-sample ρ for these premia: ~0.05-0.20. In a 2008-style crisis ρ blows out toward 0.6+ &mdash; the
          diversification you thought you had evaporates exactly when you need it.
        </div>
      </div>

      <Worked title="Worked example · 3 uncorrelated 0.4-Sharpe sleeves">
        <p>
          Equal weight, σ=10% each, ρ=0. Portfolio σ ={' '}
          <Eq>{'\\sqrt{(1/3)^2 \\cdot 3 \\cdot 10\\%^2} = 5.77\\%'}</Eq>.{' '}
          Portfolio μ = (1/3)·(0.4·10%) × 3 = 4%. Portfolio Sharpe = 4% / 5.77% =
          <span className="font-mono text-emerald-300"> 0.69</span>. With ρ=0.10 it falls to ~0.63;
          with ρ=0.30 to ~0.53. Diversification math is the engine.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; this is the menu the rest of the explainer cooks from. Every sleeve in the
        anchor book maps to one or two premia on this list. If you can&apos;t name the premium your
        position is harvesting, you&apos;re probably gambling.
      </WhenItMatters>

      <Misconception
        wrong="Stocks always go up — that's just how markets work."
        right="Stocks deliver an equity risk premium because they fail to go up sometimes. The premium IS the compensation for risk. If they always went up, the price would already reflect that and the premium would be zero."
        because="Risk premia are equilibrium quantities: they exist precisely to clear the market for risk-bearing. The 'free lunch' of long-run equity returns is paid for by occasional 50% drawdowns."
      />

      <Deeper>
        <p>
          <strong>Where the standalone Sharpes come from.</strong> The numbers above are
          1990-2024 in-sample, US-listed where applicable, gross of costs and tax. In the
          academic literature: ERP from Damodaran / DMS, term/credit from FRED, factor Sharpes
          from AQR / Kenneth French libraries, TSMOM from Moskowitz-Ooi-Pedersen 2012, VRP from
          Carr-Wu 2009 / Bondarenko 2014.
        </p>
        <p>
          <strong>Out-of-sample shrinkage.</strong> Realistic forward-looking estimates trim each
          standalone Sharpe by 30-50%. That makes diversification math even more critical: at a
          shrunken 0.25 Sharpe, three uncorrelated sleeves still get you to ~0.43 &mdash; better
          than any one, and reachable for retail without infra.
        </p>
        <p>
          <strong>The diversification ceiling.</strong>{' '}
          <Eq>{'\\sigma_p = \\sigma \\sqrt{(1 + (n-1)\\rho)/n}'}</Eq>{' '} for equal weights and
          equal vols. As <Eq>{'n \\to \\infty'}</Eq>, <Eq>{'\\sigma_p \\to \\sigma\\sqrt{\\rho}'}</Eq>{' '}
          &mdash; idiosyncratic risk diversifies away, common-factor risk doesn&apos;t. With
          ρ=0.20, Sharpe asymptotes at <Eq>{'\\text{SR}/\\sqrt{\\rho} \\approx 0.40/0.45 \\approx 0.89'}</Eq>.
          You can&apos;t add infinite sleeves and reach Sharpe 5 &mdash; the floor is the average
          common factor.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How is this different from "stocks for the long run"?',
          a: 'Stocks-for-the-long-run is one specific sleeve (Equity ERP). It works, but its standalone Sharpe is ~0.40, and it has a max drawdown around 50% (1929, 1973-74, 2008). The premia menu says: harvest several premia at once and let diversification cut the drawdown without killing the return.' },
        { q: 'Why isn’t value harder than the "factor zoo" papers suggest?',
          a: 'Value ran into a 12-year drawdown 2010-2021. Survivorship bias in published research over-states its Sharpe. ~0.30 is honest; some forward-looking estimates dip to 0.20. Cross-sectional value alone is fragile — combining with momentum (which is anti-correlated to value) is more stable.' },
        { q: 'Are these premia actually attainable for retail?',
          a: 'ERP, term, credit, value: trivially via ETFs. Trend: via DBMF/KMLM ETFs or directly via CME minis. VRP: via covered calls / cash-secured puts. Momentum: via MTUM. Carry: harder for retail; partially via FX or commodity ETFs. ~6 of the 8 are accessible without leverage.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — RETURNS AREN'T GAUSSIAN
   Daily SPY kurtosis ~12; Black-Scholes assumes 3. The under-pricing of tail
   risk is structural and persistent — and it's the main reason the variance
   risk premium exists.
   ========================================================================== */

const NonGaussCard = () => {
  const [kurt, setKurt] = useState(12);
  const [sigma, setSigma] = useState(1.0);

  // Synthesize a fat-tailed return series via mixture of normals
  const samples = useMemo(() => {
    const rand = mulberry32(7);
    const N = 4000;
    const out = [];
    // Excess kurtosis from a 95/5 mix of N(0, σ_s) and N(0, σ_l):
    //   p=0.05, σ_l/σ_s chosen so total var = σ², kurt = target.
    // Solve: var = 0.95 σ_s² + 0.05 σ_l² = σ²
    //        kurt = 3 (0.95 σ_s⁴ + 0.05 σ_l⁴) / σ⁴
    const p = 0.05;
    const k = Math.max(3.01, kurt);
    // Let r = σ_l²/σ_s². Then kurt = 3·(0.95 + 0.05 r²) / (0.95 + 0.05 r)²
    // Solve numerically for r.
    let lo = 1.001, hi = 80;
    for (let it = 0; it < 50; it++) {
      const mid = (lo + hi) / 2;
      const num = 3 * (0.95 + 0.05 * mid * mid);
      const den = Math.pow(0.95 + 0.05 * mid, 2);
      if (num / den > k) hi = mid; else lo = mid;
    }
    const r = (lo + hi) / 2;
    const sigSqS = sigma * sigma / (0.95 + 0.05 * r);
    const sigS = Math.sqrt(sigSqS);
    const sigL = Math.sqrt(sigSqS * r);
    for (let i = 0; i < N; i++) {
      const z = boxMuller(rand);
      out.push(rand() < p ? z * sigL : z * sigS);
    }
    return out;
  }, [kurt, sigma]);

  // empirical stats
  const stats = useMemo(() => {
    const m = samples.reduce((s, x) => s + x, 0) / samples.length;
    const v = samples.reduce((s, x) => s + (x - m) * (x - m), 0) / samples.length;
    const s = Math.sqrt(v);
    const k = samples.reduce((acc, x) => acc + Math.pow((x - m) / s, 4), 0) / samples.length;
    const sk = samples.reduce((acc, x) => acc + Math.pow((x - m) / s, 3), 0) / samples.length;
    const sorted = [...samples].sort((a, b) => a - b);
    const q01 = sorted[Math.floor(0.01 * sorted.length)];
    const q05 = sorted[Math.floor(0.05 * sorted.length)];
    return { m, s, k, sk, q01, q05 };
  }, [samples]);

  // Histogram
  const bins = 50;
  const xMin = -6, xMax = 6;
  const binW = (xMax - xMin) / bins;
  const hist = new Array(bins).fill(0);
  samples.forEach(x => {
    const idx = Math.floor((x - xMin) / binW);
    if (idx >= 0 && idx < bins) hist[idx]++;
  });
  const maxC = Math.max(...hist);

  // Gaussian overlay
  const gaussY = (x) => Math.exp(-(x * x) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

  const W = 320, H = 160, P = 22;
  const sx = (x) => P + ((x - xMin) / (xMax - xMin)) * (W - 2 * P);
  const sy = (c) => H - 22 - (c / maxC) * (H - 50);
  const gPath = (() => {
    const pts = [];
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = gaussY(x) * samples.length * binW;
      pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  const gauss99 = -2.326 * sigma;
  const tail99Ratio = stats.q01 / gauss99;

  return (
    <Card id="nongauss" icon={Waves} title="Returns aren't Gaussian" accent="rose" index={3}
          subtitle="Daily SPY kurtosis ~12. Gaussian = 3. The 1% worst day under a normal model is ~−2.3σ; in reality it's ~−4σ. Tail under-pricing is THE structural reason the variance risk premium exists.">
      <MinSchema>
        Real return distributions have <Term>fat tails</Term> &mdash; <Eq>{'\\text{kurtosis} \\gg 3'}</Eq>.
        Black-Scholes, Markowitz, Sharpe ratio, and most basic backtests implicitly assume
        Gaussianity. Pretending the tails aren&apos;t there doesn&apos;t make them disappear; it
        just hides the risk you&apos;re bearing.
      </MinSchema>

      <Block>{'\\text{kurt}(r) = \\frac{\\mathbb{E}[(r-\\mu)^4]}{\\sigma^4} \\quad\\text{Gaussian} = 3, \\quad \\co{\\text{SPY daily} \\approx 12}, \\quad \\hi{\\text{single-stock} \\approx 20\\text{-}50}'}</Block>

      <p>
        This is what 4,000 sampled daily returns look like with the kurtosis you set below.
        The smooth curve is the Gaussian fit (same mean, same variance) overlaid for reference.
        At kurt=3 they coincide; raise it and the empirical bars peak higher in the middle
        (more &ldquo;quiet&rdquo; days) AND extend further into the tails (more &ldquo;crash&rdquo;
        days). The tail probability that a Gaussian model misses is the source of structural
        mispricing in option markets.
      </p>

      <Predict question="Under Gaussian σ=1.0, P(|r| > 4) = 0.0063%. Under kurt=12, the same probability is — guess to the nearest factor.">
        Roughly <span className="font-mono text-rose-300">25-40×</span> larger. Empirical SPY at
        kurt~12 puts ~0.2% probability at <Eq>{'|r| > 4\\sigma'}</Eq> &mdash; that&apos;s a
        4σ-or-worse day every 2-3 years instead of the Gaussian&apos;s &ldquo;once per
        15,000-year-period&rdquo;. Black Monday (1987) was a 23σ event under Gaussian; under
        empirical kurtosis it&apos;s closer to 6σ &mdash; rare, but priced.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">excess kurtosis</span>
              <span className="text-neutral-300 font-mono tabular-nums">{kurt.toFixed(0)}</span>
            </div>
            <input type="range" min="3" max="40" step="1" value={kurt}
              onChange={(e) => setKurt(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>3 · gaussian</span><span>12 · SPY</span><span>30 · single name</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">σ (daily-ish)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{sigma.toFixed(2)}</span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.05" value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="empirical kurt" value={stats.k.toFixed(1)} sub="excess over Gaussian = 3" color="text-rose-300" />
            <Stat label="empirical 1% VaR" value={stats.q01.toFixed(2)} sub={`Gauss: ${gauss99.toFixed(2)}`} color="text-rose-300" />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            Empirical 1% VaR is <span className="font-mono text-rose-300">{tail99Ratio.toFixed(2)}×</span> the Gaussian one.
            That&apos;s the under-pricing the variance risk premium pays you to bear.
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Histogram */}
          {hist.map((c, i) => {
            const x = sx(xMin + i * binW);
            const w = (W - 2 * P) / bins;
            const h = (c / maxC) * (H - 50);
            const farTail = (xMin + (i + 0.5) * binW) < gauss99 || (xMin + (i + 0.5) * binW) > -gauss99;
            return <rect key={i} x={x} y={H - 22 - h} width={Math.max(1, w - 0.5)} height={h} fill={farTail ? '#fb7185' : '#7dd3fc'} fillOpacity={farTail ? 0.55 : 0.30} />;
          })}
          {/* Gaussian overlay */}
          <polyline points={gPath} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.9" />
          {/* Axis */}
          <line x1={P} x2={W - P} y1={H - 22} y2={H - 22} stroke="#525252" strokeWidth="0.5" />
          {[-4, -2, 0, 2, 4].map(v => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={H - 22} y2={H - 19} stroke="#737373" strokeWidth="0.5" />
              <text x={sx(v)} y={H - 8} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">{v}σ</text>
            </g>
          ))}
          {/* 1% VaR markers */}
          <line x1={sx(gauss99)} x2={sx(gauss99)} y1={28} y2={H - 22} stroke="#fbbf24" strokeWidth="0.7" strokeDasharray="3,3" />
          <line x1={sx(stats.q01)} x2={sx(stats.q01)} y1={28} y2={H - 22} stroke="#fb7185" strokeWidth="0.9" strokeDasharray="3,3" />
          <text x={sx(gauss99) + 3} y={20} fontSize="8" fill="#fbbf24" fontFamily="monospace">gauss 1%</text>
          <text x={sx(stats.q01) - 3} y={32} fontSize="8" textAnchor="end" fill="#fb7185" fontFamily="monospace">empirical 1%</text>
        </svg>
      </div>

      <Misconception
        wrong="An 8-sigma day is a once-in-the-life-of-the-universe event."
        right="It's a once-in-1-2-decades event. SPY has had several +5σ days under Gaussian assumptions; the actual return distribution makes them ordinary tail events, not impossible ones."
        because="When LTCM blew up in 1998 they were quoted saying 'we saw 10-sigma moves on multiple days'. Those weren't 10-sigma — they were ordinary fat-tail events that LTCM's Gaussian risk model couldn't see. The fix isn't a bigger σ; it's abandoning the Gaussian assumption."
      />

      <WhenItMatters>
        Always when you&apos;re short tails (selling vol, leveraged, concentrated). The Gaussian
        VaR you computed is wrong by a factor of 2-5× in the tail. Use empirical quantiles or
        Cornish-Fisher; never trust a parametric VaR for risk budgeting on a vol-selling sleeve.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The Cornish-Fisher correction.</strong> Adjust the Gaussian z-score for skew and
          excess kurtosis:{' '}
          <Eq>{'z_{cf} = z + \\frac{(z^2-1)\\co{S}}{6} + \\frac{(z^3-3z)\\co{K}}{24} - \\frac{(2z^3-5z)\\co{S^2}}{36}'}</Eq>{' '}
          where S is skewness, K is excess kurtosis. For SPY 1% VaR at z=−2.326, S=−0.5, K=12:
          <Eq>{'z_{cf} \\approx -3.4'}</Eq>. Cheap upgrade; gets you closer to the true tail.
        </p>
        <p>
          <strong>Square-root-of-time scaling lies for non-Gaussian.</strong> The standard
          <Eq>{'\\sigma_{T} = \\sigma_{1}\\sqrt{T}'}</Eq> assumption only holds for iid Gaussian.
          With volatility clustering (GARCH-style), <Term>realized volatility</Term> over a
          window is autocorrelated and the true T-day vol is path-dependent. This is
          why a backtest&apos;s reported Sharpe is often higher than the live one &mdash; the
          live vol clustering wasn&apos;t in the backtest sample.
        </p>
        <p>
          <strong>Why this matters for Kelly.</strong>{' '}
          <Eq>{'f^* = \\mu/\\sigma^2'}</Eq> assumes Gaussian.{' '}
          <CrossLink to="sizing" recap="Position sizing under uncertainty: vol-targeting + fractional Kelly with Bayesian shrinkage on edge.">Fractional Kelly</CrossLink>{' '}
          is the practical correction: cutting full Kelly by a factor of 2-4 absorbs the
          tail risk that fat-tailed returns add. The math: under fat tails, the loss per unit
          of bet at full Kelly is much worse than the Gaussian-optimal log-growth rate suggests.
        </p>
        <p>
          <strong>Why VRP exists.</strong> Most market participants must estimate VaR on
          Gaussian assumptions (regulatory, institutional). They under-price tails, get
          surprised, and demand risk-reducing options. Sellers of those options capture
          the gap. The variance risk premium isn&apos;t a free lunch &mdash; it&apos;s the
          rent collected from the systematic Gaussian-pricing error in the rest of the market.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Does this mean I should never use the Sharpe ratio?',
          a: 'Use it as a rough comparator, but never as an absolute measure. For asymmetric strategies (vol-selling, trend-following) report Sortino and Calmar alongside. For tail-heavy ones, also report 1% VaR and max drawdown — Sharpe alone hides the disaster scenario.' },
        { q: 'How do single stocks compare to indices?',
          a: 'Single stocks have kurtosis 20-50, with strong upper-tail (acquisitions, earnings spikes) and lower-tail (fraud, lawsuits) bias. The diversification of an index washes idiosyncratic tails out and leaves "only" common-factor crash risk — which is still kurt ~12.' },
        { q: 'Where do these tails actually come from in markets?',
          a: 'Volatility clustering (GARCH effects) + leverage cycles + correlation jumps in stress. In a calm period kurt drops to 4-5; in a crisis it spikes to 30+. The pre-crisis VaR estimates are systematically too small.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — STOCHASTIC PRICE MODELS
   GBM as the null. Mean-reverting (OU) for spreads. Jump-diffusion for crashes.
   Regime-switching for "this market changed". Each model is wrong somewhere
   useful.
   ========================================================================== */

const StochModelsCard = () => {
  const [model, setModel] = useState('gbm');
  const [mu, setMu] = useState(0.07);
  const [sig, setSig] = useState(0.18);
  const [theta, setTheta] = useState(2.0);
  const [jumpLam, setJumpLam] = useState(0.5);
  const [jumpSig, setJumpSig] = useState(0.10);
  const [seed, setSeed] = useState(13);

  const paths = useMemo(() => {
    const T = 252, dt = 1 / 252, nPaths = 8;
    const out = [];
    for (let p = 0; p < nPaths; p++) {
      const rand = mulberry32(seed + p * 1000);
      const path = [1];
      let s = 1;
      for (let i = 1; i <= T; i++) {
        const z = boxMuller(rand);
        if (model === 'gbm') {
          s *= Math.exp((mu - 0.5 * sig * sig) * dt + sig * Math.sqrt(dt) * z);
        } else if (model === 'ou') {
          // log-OU: x_{t+dt} = x_t + θ(μ - x_t)dt + σ√dt z, then S = exp(x)
          const x = Math.log(s);
          const xn = x + theta * (Math.log(1.0) - x) * dt + sig * Math.sqrt(dt) * z;
          s = Math.exp(xn);
        } else if (model === 'jump') {
          let logRet = (mu - 0.5 * sig * sig) * dt + sig * Math.sqrt(dt) * z;
          if (rand() < jumpLam * dt) {
            const jz = boxMuller(rand);
            logRet += -jumpSig * 3 + jumpSig * jz; // mean-negative jumps for crash flavor
          }
          s *= Math.exp(logRet);
        } else if (model === 'regime') {
          // 2-state HMM: calm (σ=σ_lo) / vol (σ=σ_hi). Persistence p=0.99 calm, 0.95 vol.
          if (i === 1) path.regime = rand() < 0.7 ? 0 : 1;
          const trans = rand();
          if (path.regime === 0 && trans > 0.99) path.regime = 1;
          else if (path.regime === 1 && trans > 0.95) path.regime = 0;
          const localSig = path.regime === 0 ? sig * 0.6 : sig * 2.0;
          s *= Math.exp((mu - 0.5 * localSig * localSig) * dt + localSig * Math.sqrt(dt) * z);
        }
        path.push(s);
      }
      out.push(path);
    }
    return out;
  }, [model, mu, sig, theta, jumpLam, jumpSig, seed]);

  // Closed-form mean and 95% CI band per model (computed from SDE moments)
  const bands = useMemo(() => {
    const T = 252, dt = 1 / 252;
    const out = [];
    // Regime-switching effective vol from stationary distribution
    const piCalm = 0.05 / 0.06; // p_vol_leave / (p_calm_leave + p_vol_leave)
    const piVol = 1 - piCalm;
    const sigEffSq = sig * sig * (piCalm * 0.36 + piVol * 4.0);
    const sigEff = Math.sqrt(sigEffSq);
    for (let i = 0; i <= T; i++) {
      const t = i * dt;
      let mean, lo, hi;
      if (model === 'gbm') {
        const logMean = (mu - 0.5 * sig * sig) * t;
        const logSd = sig * Math.sqrt(t);
        mean = Math.exp(logMean);
        lo = Math.exp(logMean - 1.96 * logSd);
        hi = Math.exp(logMean + 1.96 * logSd);
      } else if (model === 'ou') {
        // x_0 = 0 = μ, so E[x_t] = 0; Var[x_t] = (σ²/2θ)(1 - e^{-2θt})
        const v = (sig * sig / (2 * theta)) * (1 - Math.exp(-2 * theta * t));
        const logSd = Math.sqrt(v);
        mean = 1; // E[exp(x_t)] ≈ exp(½v), but median = 1 — use median for the line
        lo = Math.exp(-1.96 * logSd);
        hi = Math.exp(1.96 * logSd);
      } else if (model === 'jump') {
        // Per-dt: drift (μ-σ²/2) + jump mean λ·dt·(-3σ_J); var σ²·dt + λ·dt·(σ_J² + 9σ_J²)
        const logMean = ((mu - 0.5 * sig * sig) - 3 * jumpLam * jumpSig) * t;
        const logSd = Math.sqrt((sig * sig + 10 * jumpLam * jumpSig * jumpSig) * t);
        mean = Math.exp(logMean);
        lo = Math.exp(logMean - 1.96 * logSd);
        hi = Math.exp(logMean + 1.96 * logSd);
      } else { // regime
        const logMean = (mu - 0.5 * sigEffSq) * t;
        const logSd = sigEff * Math.sqrt(t);
        mean = Math.exp(logMean);
        lo = Math.exp(logMean - 1.96 * logSd);
        hi = Math.exp(logMean + 1.96 * logSd);
      }
      out.push({ t: i, mean, lo, hi });
    }
    return out;
  }, [model, mu, sig, theta, jumpLam, jumpSig]);

  // Auto-fit chart to include both paths AND the band
  const bandHi = Math.max(...bands.map(b => b.hi));
  const bandLo = Math.min(...bands.map(b => b.lo));
  const allMax = Math.max(...paths.flat(), bandHi);
  const allMin = Math.min(...paths.flat(), bandLo);
  const W = 320, H = 170, P = 22;
  const sx = (i) => P + (i / 252) * (W - 2 * P);
  const sy = (v) => H - P - ((v - allMin) / (allMax - allMin)) * (H - 2 * P);

  const labels = {
    gbm: 'Geometric Brownian Motion · constant μ,σ · Black-Scholes default',
    ou:  'Ornstein-Uhlenbeck · log-mean-reverting · pairs / spreads / vol itself',
    jump: 'Jump-diffusion · GBM + Poisson crashes · the tail-aware extension',
    regime: 'Regime-switching · 2-state HMM, calm/vol · captures clustering'
  };

  return (
    <Card id="stochmodels" icon={LineChart} title="Stochastic price models" accent="violet" index={4}
          subtitle="GBM is the null model — wrong but useful. Each upgrade adds one realistic feature: mean reversion for spreads, jumps for crashes, regimes for volatility clustering. None of them is right; some are useful.">
      <MinSchema>
        Most quant tools (Black-Scholes, Markowitz, basic backtests) assume{' '}
        <Term>GBM</Term>: <Eq>{'dS/S = \\mu\\, dt + \\sigma\\, dW'}</Eq>. Real prices break that
        in three named ways: <em>they mean-revert</em> (spreads, vol),{' '}
        <em>they jump</em> (earnings, crashes), and <em>they switch regimes</em> (vol clustering).
        Pick the model whose failure modes you can tolerate.
      </MinSchema>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries({ gbm: 'GBM', ou: 'OU', jump: 'Jump', regime: 'Regime' }).map(([k, lab]) => (
          <button key={k} onClick={() => setModel(k)}
            className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${model === k ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-neutral-400">{labels[model]}</div>

      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.02] p-3">
        {model === 'gbm' && <Block>{'\\co{dS_t} = \\vi{\\mu} S_t \\, dt + \\vi{\\sigma} S_t \\, dW_t \\quad\\Longleftrightarrow\\quad \\log(S_T/S_0) \\sim \\mathcal{N}\\!\\left((\\mu - \\tfrac{1}{2}\\sigma^2)T,\\; \\sigma^2 T\\right)'}</Block>}
        {model === 'ou' && <Block>{'\\co{d x_t} = \\vi{\\theta}(\\mu - x_t)\\, dt + \\vi{\\sigma}\\, dW_t \\quad x_t = \\log S_t \\quad \\text{half-life} = \\frac{\\ln 2}{\\theta}'}</Block>}
        {model === 'jump' && <Block>{'\\co{dS_t/S_{t^-}} = \\vi{\\mu}\\, dt + \\vi{\\sigma}\\, dW_t + (e^{J} - 1)\\, dN_t,\\quad N_t \\sim \\text{Poisson}(\\vi{\\lambda} t),\\quad J \\sim \\mathcal{N}(\\mu_J, \\sigma_J^2)'}</Block>}
        {model === 'regime' && <Block>{'\\co{dS_t/S_t} = \\vi{\\mu}\\, dt + \\vi{\\sigma_{Z_t}}\\, dW_t,\\quad Z_t \\in \\{calm, vol\\},\\quad \\Pr(Z_{t+1} \\neq Z_t) = \\vi{p}'}</Block>}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">drift μ (annual)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(mu * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.10" max="0.20" step="0.01" value={mu}
              onChange={(e) => setMu(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">vol σ (annual)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sig * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.05" max="0.50" step="0.01" value={sig}
              onChange={(e) => setSig(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          {model === 'ou' && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-violet-300 font-mono">θ · pull-back rate</span>
                <span className="text-neutral-300 font-mono tabular-nums">{theta.toFixed(1)} (½-life {(0.693/theta * 252).toFixed(0)}d)</span>
              </div>
              <input type="range" min="0.2" max="10" step="0.1" value={theta}
                onChange={(e) => setTheta(parseFloat(e.target.value))} className="rq-range w-full" />
            </div>
          )}
          {model === 'jump' && (
            <>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-rose-300 font-mono">λ · jumps/year</span>
                  <span className="text-neutral-300 font-mono tabular-nums">{jumpLam.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="5" step="0.1" value={jumpLam}
                  onChange={(e) => setJumpLam(parseFloat(e.target.value))} className="rq-range w-full" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-rose-300 font-mono">σ_J · jump size</span>
                  <span className="text-neutral-300 font-mono tabular-nums">{(jumpSig * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min="0" max="0.30" step="0.01" value={jumpSig}
                  onChange={(e) => setJumpSig(parseFloat(e.target.value))} className="rq-range w-full" />
              </div>
            </>
          )}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-neutral-400 font-mono">seed</span>
              <span className="text-neutral-300 font-mono tabular-nums">{seed}</span>
            </div>
            <input type="range" min="1" max="80" step="1" value={seed}
              onChange={(e) => setSeed(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">S₀ = 1</text>
          {/* 95% CI band — sits beneath the simulated paths */}
          {(() => {
            const upPts = bands.map(b => `${sx(b.t).toFixed(1)},${sy(b.hi).toFixed(1)}`);
            const dnPts = bands.slice().reverse().map(b => `${sx(b.t).toFixed(1)},${sy(b.lo).toFixed(1)}`);
            return <polygon points={[...upPts, ...dnPts].join(' ')} fill="#c4b5fd" fillOpacity="0.10" stroke="#c4b5fd" strokeOpacity="0.25" strokeWidth="0.5" />;
          })()}
          {/* Analytical mean / median line */}
          <polyline points={bands.map(b => `${sx(b.t).toFixed(1)},${sy(b.mean).toFixed(1)}`).join(' ')}
            fill="none" stroke="#c4b5fd" strokeWidth="1.4" strokeDasharray="4,3" />
          {paths.map((path, p) => {
            const pts = path.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
            return <polyline key={p} points={pts} fill="none" stroke={['#7dd3fc','#fbbf24','#86efac','#fda4af','#c4b5fd','#67e8f9','#f0abfc','#fdba74'][p]} strokeOpacity="0.65" strokeWidth="1.0" />;
          })}
          <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
          <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">1y (252d)</text>
          <text x={P + 4} y={P - 4} fontSize="8" fill="#c4b5fd" fontFamily="monospace">— mean · ░ 95% CI</text>
        </svg>
      </div>

      <Worked title="Worked example · what each model captures">
        <p>
          <span className="text-sky-300 font-mono">GBM</span> &mdash; option pricing, optimal
          rebalancing in a Markowitz frame, default for any &ldquo;total return assumption&rdquo;.
          Wrong about tails and clustering.
        </p>
        <p>
          <span className="text-emerald-300 font-mono">OU</span> &mdash; pairs trading (cointegrated
          spreads), VIX itself, deviations from a rolling mean. Half-life from <Eq>{'\\theta'}</Eq> tells
          you how long mean-reversion takes; if half-life is 2 days, every position better be intra-week.
        </p>
        <p>
          <span className="text-rose-300 font-mono">Jump-diffusion</span> &mdash; option-implied
          tail-pricing models (Merton 1976), and any short-vol exposure where you need an honest
          P&amp;L distribution including crashes.
        </p>
        <p>
          <span className="text-violet-300 font-mono">Regime-switching</span> &mdash; vol-targeting,
          factor performance over 5+ year cycles, anything where &ldquo;the relationship broke&rdquo;
          is a recurring feature.
        </p>
      </Worked>

      <Misconception
        wrong="GBM is good enough; the deviations average out over time."
        right="Each deviation has its own price-able cost: mean-reversion mispricing, jump risk premium, regime-conditional vol. Markets pay you to absorb each one. Ignoring them = leaving money on the table on the long side AND mis-sizing on the short side."
        because="Black-Scholes built on GBM is biased: it under-prices OTM options because the true return distribution has fatter tails than the lognormal it assumes. The variance risk premium and the volatility skew exist precisely because the market collectively prices the deviations from GBM."
      />

      <Deeper>
        <p>
          <strong>Calibration in practice.</strong> For OU on a price spread:{' '}
          <Eq>{'\\theta = -\\log(\\rho_1)'}</Eq> where <Eq>{'\\rho_1'}</Eq> is the lag-1
          autocorrelation of the spread. For jump-diffusion: estimate <Eq>{'\\lambda, \\mu_J, \\sigma_J'}</Eq>{' '}
          via Hawkes self-exciting processes or Kalman-filtered MLE on observed returns. For regime
          switching: Hamilton 1989 / Baum-Welch.
        </p>
        <p>
          <strong>From physics.</strong> GBM is the multiplicative analog of Brownian motion (random
          walk + Itô calculus). OU is the Langevin equation in continuous time &mdash; the canonical
          model of a particle in a quadratic potential well. Jump-diffusion is GBM + a compound Poisson
          process. Regime-switching is the simplest hidden-Markov model. All four have closed-form
          characteristic functions, which is what makes Fourier-based option pricing tractable.
        </p>
        <p>
          <strong>What&apos;s left over: SOTA modeling.</strong> Stochastic-vol (Heston),
          rough-volatility (Bergomi), neural-SDE, transformer-on-orderbook. These layer on top of the
          four nulls above and try to reconcile residual mispricing. The sibling explainer{' '}
          <CrossLink to="markets-modeling" external recap="Modeling Markets: from random walk to transformers — each model adds one feature.">Modeling Markets · basic to SOTA</CrossLink>{' '}
          covers them in detail.
        </p>
      </Deeper>

      <QA items={[
        { q: 'When can I just use GBM and not worry?',
          a: 'Long-horizon Markowitz allocation across asset classes — at quarterly+ frequency, GBM gets the first moment right, and the higher moments matter less. Black-Scholes pricing for ATM options. Anything where the mis-pricing is dwarfed by other uncertainties.' },
        { q: 'Why is OU more useful than GBM for vol itself?',
          a: 'VIX has been bounded between ~10 and ~80 for 35 years and reverts to a long-run mean ~18-20. GBM would let it drift unboundedly. OU captures the mean reversion AND prices vol-of-vol. Heston-style stochastic-vol models layer GBM on top of an OU vol process.' },
        { q: 'Do retail traders need this?',
          a: 'For rebalancing decisions: probably no. For sizing a vol-selling sleeve: yes — a jump-diffusion or fat-tail simulation gives a more honest worst-case P&L than the Gaussian-VaR your broker’s risk tool will report.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — FACTOR DESIGN (cross-sectional)
   Rank a universe by a characteristic, long the top, short the bottom (or
   long-only the top, vs cap-weighted benchmark). Show how decile choice and
   rebalance frequency change the realized factor return.
   ========================================================================== */

const FactorDesignCard = () => {
  const [factor, setFactor] = useState('mom');
  const [pct, setPct] = useState(20);
  const [rebal, setRebal] = useState(3);
  const [seed, setSeed] = useState(101);

  // Synthetic 200-stock universe over 60 months with a factor that drives a small return tilt
  const sim = useMemo(() => {
    const N = 200, T = 60;
    const rand = mulberry32(seed);
    // give each stock a persistent factor "loading" beta_f and an idiosyncratic component
    const betas = Array.from({ length: N }, () => boxMuller(rand) * 1.0);
    // "true" annualized factor premium per loading-unit (decile-spread)
    const truePrem = { mom: 0.06, val: 0.035, qual: 0.045, lvol: 0.02 }[factor] || 0.04;
    // characteristic = noisy version of beta (so ranking on it is imperfect)
    const charNoise = { mom: 0.4, val: 0.6, qual: 0.5, lvol: 0.5 }[factor] || 0.5;
    const charac = betas.map(b => b + boxMuller(rand) * charNoise);
    // monthly returns: μ = beta * truePrem/12 + idiosync
    const ret = Array.from({ length: T }, () => Array.from({ length: N }, (_, j) => betas[j] * truePrem / 12 + boxMuller(rand) * 0.06));

    // Long-short with top/bottom pct, rebal every `rebal` months
    let lastRanks = null;
    const turn = [];
    const lsRet = [];
    for (let t = 0; t < T; t++) {
      if (t % rebal === 0) {
        const idx = Array.from({ length: N }, (_, i) => i).sort((a, b) => charac[b] - charac[a]);
        const topN = Math.round(N * pct / 100);
        const long = new Set(idx.slice(0, topN));
        const short = new Set(idx.slice(N - topN));
        if (lastRanks) {
          const oldLong = lastRanks.long, oldShort = lastRanks.short;
          let changed = 0;
          [...long].forEach(i => { if (!oldLong.has(i)) changed++; });
          [...short].forEach(i => { if (!oldShort.has(i)) changed++; });
          turn.push(changed / (2 * topN));
        }
        lastRanks = { long, short };
      }
      let lr = 0, sr = 0, w = 1 / lastRanks.long.size;
      lastRanks.long.forEach(i => lr += w * ret[t][i]);
      lastRanks.short.forEach(i => sr += w * ret[t][i]);
      lsRet.push(lr - sr);
    }
    const cum = lsRet.reduce((a, x) => { a.push((a[a.length - 1] || 1) * (1 + x)); return a; }, []);
    const meanM = lsRet.reduce((a, x) => a + x, 0) / lsRet.length;
    const sdM = Math.sqrt(lsRet.reduce((a, x) => a + (x - meanM) * (x - meanM), 0) / lsRet.length);
    const sharpe = (meanM * 12) / (sdM * Math.sqrt(12));
    const annTurn = turn.length ? (turn.reduce((a, x) => a + x, 0) / turn.length) * (12 / rebal) : 0;
    return { lsRet, cum, sharpe, annTurn, meanAnn: meanM * 12, volAnn: sdM * Math.sqrt(12) };
  }, [factor, pct, rebal, seed]);

  const W = 320, H = 150, P = 22;
  const yMin = Math.min(0.7, ...sim.cum);
  const yMax = Math.max(...sim.cum) * 1.05;
  const sx = (i) => P + (i / sim.cum.length) * (W - 2 * P);
  const sy = (v) => H - P - ((v - yMin) / (yMax - yMin)) * (H - 2 * P);
  const path = sim.cum.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  return (
    <Card id="factordesign" icon={Filter} title="Factor sleeve · cross-sectional design" accent="emerald" index={5}
          subtitle="Rank the universe by a characteristic. Long the top decile/quintile/quartile, short the bottom. Re-rank every N months. The portfolio's return is the spread.">
      <MinSchema>
        A <Term>cross-sectional</Term> factor portfolio is defined by three choices:{' '}
        <em>which characteristic</em> (value, momentum, quality, low-vol),{' '}
        <em>which slice</em> (top/bottom 10/20/25 percent), and{' '}
        <em>how often to rebalance</em>. Each choice trades signal quality against turnover cost.
      </MinSchema>

      <Block>{'r_{f,t} = \\frac{1}{|L|}\\sum_{i \\in L} r_{i,t} - \\frac{1}{|S|}\\sum_{i \\in S} r_{i,t}, \\quad L = \\text{top } p\\%, \\; S = \\text{bottom } p\\%'}</Block>

      <div className="mt-3 flex flex-wrap gap-2">
        {[['mom','Momentum'],['val','Value'],['qual','Quality'],['lvol','Low-vol']].map(([k, lab]) => (
          <button key={k} onClick={() => setFactor(k)}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${factor === k ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>{lab}</button>
        ))}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">portfolio slice</span>
              <span className="text-neutral-300 font-mono tabular-nums">top/bot {pct}%</span>
            </div>
            <input type="range" min="5" max="50" step="5" value={pct}
              onChange={(e) => setPct(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>5% · pure signal</span><span>50% · diluted</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">rebalance every</span>
              <span className="text-neutral-300 font-mono tabular-nums">{rebal} mo</span>
            </div>
            <input type="range" min="1" max="12" step="1" value={rebal}
              onChange={(e) => setRebal(parseInt(e.target.value))} className="rq-range w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => setSeed(s => s + 1)}
              className="text-[11px] rounded border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-200 px-2.5 py-1 font-mono inline-flex items-center gap-1.5">
              <Repeat className="w-3 h-3" /> rerun simulation
            </button>
            <span className="text-[10px] text-neutral-500">seed {seed} · click for a new realization, same parameters</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="ann. return" value={`${(sim.meanAnn * 100).toFixed(1)}%`} sub="L-S spread" color="text-emerald-300" />
            <Stat label="ann. vol" value={`${(sim.volAnn * 100).toFixed(1)}%`} sub="of L-S" color="text-amber-300" />
            <Stat label="Sharpe" value={sim.sharpe.toFixed(2)} sub={sim.sharpe > 0.4 ? 'real signal' : 'noise-near'} color={sim.sharpe > 0.4 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            Annualized turnover: <span className="font-mono text-neutral-300">{(sim.annTurn * 100).toFixed(0)}%</span>. At ~5 bps round-trip cost, that&apos;s <span className="font-mono text-rose-300">{(sim.annTurn * 0.0010 * 100).toFixed(2)}%</span> in t-cost drag.{' '}
            <CrossLink to="costs" recap="Transaction costs at retail scale: spreads + commissions + slippage; high-turnover factor strategies eat their alpha.">cost detail &rarr;</CrossLink>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">100</text>
          <polyline points={path} fill="none" stroke="#6ee7b7" strokeWidth="1.4" />
          <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
          <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">60mo</text>
          <text x={P} y={20} fontSize="8" fill="#737373" fontFamily="monospace">cum L-S</text>
        </svg>
      </div>

      <Predict question="Push the slice from 20% to 5% (top/bottom decile each). Sharpe goes up — by how much, and what is the cost?">
        Sharpe rises ~10-30% because the signal-per-position is purer. The cost: <em>turnover roughly
        doubles</em> (smaller portfolios churn more positions per rebalance), and capacity is tiny
        (in real markets you&apos;re limited by the float of the bottom-decile names). For retail,
        sticking with the top/bottom 20-30% balances signal density against manageable turnover.
      </Predict>

      <Worked title="Worked example · Fama-French HML construction">
        <p>
          Fama-French <em>value</em> (HML) ranks the entire US equity universe by book/market each
          June, then forms 6 portfolios: 2 size groups (small/big) × 3 B/M groups (high/medium/low).
          HML = avg(small-high, big-high) − avg(small-low, big-low). Re-formed once a year.
        </p>
        <p>
          Why annual rebalance? Book values come from annual reports; B/M can&apos;t shift faster
          than that. Why size-segregated? Small-cap value &amp; big-cap value behave differently;
          averaging them stabilizes the factor.
        </p>
        <p>
          The full data series (Kenneth French website) gives Sharpe ~0.30 over 1927-2020. Note: <em>retail
          can&apos;t replicate this exactly</em> &mdash; short-selling small-cap names has prohibitive
          locate fees and bid-ask spreads. ETFs solve that with long-only proxies; the next card.
        </p>
      </Worked>

      <Misconception
        wrong="The published factor Sharpe is what I'll get if I implement it."
        right="Published Sharpes are gross of costs, gross of taxes, and assume free shorting. Implementable Sharpes for retail are 30-50% lower. Cross-sectional momentum's published Sharpe is ~0.55; a real retail-tradeable version (long-only quintile via ETF) is closer to 0.30."
        because="Implementation losses come from: (i) annual turnover ~100-300% × spread, (ii) inability to short small-caps cleanly, (iii) ETF construction constraints (sector caps, liquidity rules), (iv) tax drag on short-term capital gains for high-turnover strategies. Together they kill 40-50% of the academic Sharpe."
      />

      <WhenItMatters>
        Whenever you&apos;re evaluating any factor strategy &mdash; quant fund, smart-beta ETF,
        newsletter pitch. Ask: what universe? what slice? what rebalance frequency? what
        construction constraints? Without those four parameters, a quoted Sharpe is meaningless.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why decile-spread is more representative than continuous beta.</strong> A
          regression of returns on the characteristic gives the average effect per unit of
          characteristic; decile-spread gives the realized return of the actual extreme positions.
          They differ when the relationship is nonlinear &mdash; e.g. low-vol works strongly
          in the bottom decile and weakly elsewhere; the regression understates it.
        </p>
        <p>
          <strong>Long-only vs long-short.</strong> Long-only captures ~60% of the L-S premium because
          the short leg of momentum (avoiding losers) is independently valuable. For retail, long-only
          factor ETFs (MTUM, QUAL, etc.) capture the <em>top-quintile</em> premium relative to the
          cap-weighted index &mdash; usually 1-2% annualized for momentum, 0.5-1% for value.
        </p>
        <p>
          <strong>Turnover scaling.</strong>{' '}
          <Eq>{'\\text{turnover}_{ann} \\approx \\text{turnover}_{rebal} \\cdot 12/k_{rebal}'}</Eq>{' '}
          for k-month rebalance. Momentum&apos;s monthly turnover is ~25%, so annual is ~300%; quality
          is ~10% monthly &rarr; ~120% annual. The cost ceiling on Sharpe is{' '}
          <Eq>{'\\text{Sharpe}_{net} = \\text{Sharpe}_{gross} - \\text{turnover} \\cdot \\text{cost}/\\sigma'}</Eq>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Which factor is least sensitive to rebalance frequency?',
          a: 'Quality and low-vol — they\'re slow-moving characteristics (profitability, vol over a year). Annual rebalance loses very little. Momentum is the fastest-decaying signal; rebalancing only once a year cuts its Sharpe by ~40%.' },
        { q: 'Why does the simulated example always show emerald positive cumulative L-S?',
          a: 'It\'s a synthetic universe seeded so betas drive returns. In real data, factors have multi-year drawdowns: value 2010-2021, momentum 2009 March (instantaneous), low-vol mid-2010s. The "factor zoo" is real — but several of the named factors don\'t survive out-of-sample.' },
        { q: 'Should I prefer single-factor or multi-factor portfolios?',
          a: 'Multi-factor — value+momentum+quality combined has historically delivered ~70% of single-factor Sharpe with much smaller drawdowns. Diversification across factors matters more than picking the best individual one.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — FACTOR IMPLEMENTATION (ETFs vs stocks)
   The real-world: at retail, factor ETFs lose 30-50% of the academic Sharpe to
   construction constraints, fees, and tax drag. Show the trade-offs and the
   actual ETF holdings vs the academic factor.
   ========================================================================== */

const FACTOR_ETFS = [
  { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', factor: 'momentum', exp: 0.0015, holdings: 125, capture: 0.55,
    tilt: 'Top ~125 names by 6/12-mo return / vol. Reconstituted twice yearly (May/Nov).',
    quirk: 'Sector caps: max 5pp deviation from parent. Liquidity floor. ~50% turnover/yr.' },
  { ticker: 'VLUE', name: 'iShares MSCI USA Value Factor', factor: 'value', exp: 0.0008, holdings: 150, capture: 0.50,
    tilt: 'Composite score: P/B, fwd-P/E, EV/CFO. Sector-neutral within MSCI USA.',
    quirk: 'Sector neutrality dilutes the value tilt — full HML would be sector-tilted.' },
  { ticker: 'QUAL', name: 'iShares MSCI USA Quality Factor', factor: 'quality', exp: 0.0015, holdings: 125, capture: 0.65,
    tilt: 'High ROE, stable earnings growth, low debt-to-equity. Sector-neutral.',
    quirk: 'Lowest turnover of the four (~25%/yr). Most tax-efficient.' },
  { ticker: 'USMV', name: 'iShares MSCI USA Min Vol Factor', factor: 'low-vol', exp: 0.0015, holdings: 175, capture: 0.70,
    tilt: 'Mean-variance optimization over a constrained universe to minimize portfolio vol.',
    quirk: 'Holdings can be unintuitive — a high-vol stock with low correlation to others is included.' },
];

const FactorImplCard = () => {
  const [pick, setPick] = useState('MTUM');
  const [costBps, setCostBps] = useState(8);
  const etf = FACTOR_ETFS.find(e => e.ticker === pick);

  // Toy: given academic Sharpe, expense ratio, capture, t-cost, compute net Sharpe
  const academicSharpe = { momentum: 0.55, value: 0.30, quality: 0.40, 'low-vol': 0.35 }[etf.factor];
  const grossSharpe = academicSharpe * etf.capture;
  // ETF buyer-side cost: just expense ratio + bid-ask spread (~2 bps for these large ETFs, 1bps comm)
  const etfDrag = etf.exp + 0.0003;
  const etfSharpeNet = grossSharpe - etfDrag / 0.12; // assume ~12% vol → drag in Sharpe units
  // DIY = academic Sharpe - costBps × turnover / vol_annual
  const turnover = { momentum: 3.0, value: 0.6, quality: 0.30, 'low-vol': 0.45 }[etf.factor];
  const diyDrag = (costBps / 10000) * turnover;
  const diySharpe = academicSharpe - diyDrag / 0.12;

  return (
    <Card id="factorimpl" icon={Hammer} title="Factor sleeve · implementation" accent="emerald" index={6}
          subtitle="ETFs lose 30-50% of the academic Sharpe to construction constraints + fees, but you keep almost all of it net of cost. DIY at retail loses far more to spreads and turnover. The intersection where DIY beats ETFs is narrow.">
      <MinSchema>
        For each factor: <Eq>{'\\text{Sharpe}_{net}^{ETF} = \\text{capture} \\cdot \\text{Sharpe}_{academic} - \\text{exp}/\\sigma'}</Eq>{' '}
        vs <Eq>{'\\text{Sharpe}_{net}^{DIY} = \\text{Sharpe}_{academic} - \\text{turnover} \\cdot \\text{cost}/\\sigma'}</Eq>.
        ETFs trade <em>capture</em> for <em>cheap drag</em>; DIY trades <em>full capture</em> for{' '}
        <em>large drag</em>.
      </MinSchema>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {FACTOR_ETFS.map(e => (
          <button key={e.ticker} onClick={() => setPick(e.ticker)}
            className={`text-left rounded-md border p-2 transition-colors ${pick === e.ticker ? 'bg-emerald-500/15 border-emerald-400/40' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
            <div className="font-mono text-sm text-emerald-200">{e.ticker}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{e.factor}</div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">exp {(e.exp * 100).toFixed(2)}%</div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-emerald-400/20 bg-emerald-400/5 p-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-emerald-200 font-mono">{etf.ticker}</span>
          <span className="text-xs text-neutral-300">{etf.name}</span>
        </div>
        <div className="text-[11px] text-neutral-400 leading-snug mb-2">{etf.tilt}</div>
        <div className="text-[11px] text-amber-200/90 leading-snug">
          <strong className="text-amber-300">Construction quirk:</strong> {etf.quirk}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">your DIY t-cost (round-trip bps)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{costBps} bps</span>
            </div>
            <input type="range" min="2" max="40" step="1" value={costBps}
              onChange={(e) => setCostBps(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>2 · institutional</span><span>8 · realistic retail</span><span>40 · illiquid</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="academic Sharpe" value={academicSharpe.toFixed(2)} sub="published, gross" color="text-neutral-300" />
            <Stat label={`${etf.ticker} net`} value={etfSharpeNet.toFixed(2)} sub={`capture ${(etf.capture * 100).toFixed(0)}%`} color="text-emerald-300" />
            <Stat label="DIY net" value={diySharpe.toFixed(2)} sub={`turn ${(turnover * 100).toFixed(0)}%/yr`} color={diySharpe > etfSharpeNet ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            For {etf.factor}, ETF beats DIY at retail unless your t-cost is below{' '}
            <span className="font-mono text-amber-300">~{Math.round((academicSharpe * (1 - etf.capture)) * 0.12 / turnover * 10000)}</span> bps round-trip
            &mdash; rare for retail except on the most liquid names.
          </div>
        </div>

        <svg viewBox="0 0 320 160" className="w-full h-auto">
          {/* Sharpe comparison bars */}
          <text x={20} y={18} fontSize="9" fill="#a3a3a3" fontFamily="monospace">net Sharpe by approach</text>
          {[
            { lab: 'academic', v: academicSharpe, c: '#a3a3a3' },
            { lab: 'ETF (' + etf.ticker + ')', v: etfSharpeNet, c: '#6ee7b7' },
            { lab: 'DIY @ ' + costBps + 'bps', v: diySharpe, c: diySharpe > etfSharpeNet ? '#6ee7b7' : '#fb7185' },
          ].map((d, i) => {
            const y = 35 + i * 32;
            const w = Math.max(2, Math.abs(d.v) * 200);
            const x0 = 80;
            const xrect = d.v < 0 ? x0 - w : x0;
            return (
              <g key={i}>
                <text x={75} y={y + 12} fontSize="9" textAnchor="end" fill="#a3a3a3" fontFamily="monospace">{d.lab}</text>
                <rect x={xrect} y={y} width={w} height={18} fill={d.c} fillOpacity="0.6" stroke={d.c} strokeOpacity="0.9" />
                <text x={xrect + w + 4} y={y + 12} fontSize="9" fill="#e5e5e5" fontFamily="monospace">{d.v.toFixed(2)}</text>
              </g>
            );
          })}
          <line x1={80} x2={80} y1={32} y2={130} stroke="#525252" strokeWidth="0.5" />
        </svg>
      </div>

      <Worked title="Worked example · why MTUM captures only 55% of academic momentum">
        <p>
          Academic momentum: long-short, top minus bottom 10%, monthly rebalance, equal-weighted,
          short cleared at borrow cost. Sharpe ~0.55.
        </p>
        <p>
          MTUM: long-only, top ~125 of MSCI USA (~30% slice), 2× yearly rebalance, sector caps.
          Long-only loses the short leg (~30% of premium). 30% slice is more diluted than 10%
          (~10% loss). Semi-annual rebalance vs monthly (~10% loss). Sector caps (~5% loss).
          Combined: 0.55 × 0.55 ≈ 0.30 net. Add ~0.02 in fees → ~0.28. That&apos;s the realistic
          retail momentum tilt.
        </p>
        <p>
          The good news: at 0.28, momentum still beats most active stock-pickers, and you get it
          for 0.15% per year, fully tax-efficient (low turnover within the ETF doesn&apos;t
          generate distributions for the holder).
        </p>
      </Worked>

      <Misconception
        wrong="Smart-beta ETFs are 'just like' the academic factor."
        right="They capture 50-70% of the gross premium because long-only + sector neutrality + rebalance frequency caps eat into the signal. They're still worth it — the alternative (DIY) is worse — but don't confuse the ETF Sharpe with the published factor Sharpe."
        because="ETF construction is constrained by liquidity, regulatory tracking-error rules, and provider-imposed sector caps. Each constraint is reasonable in isolation but cumulatively they cost a lot of premium. The factor that survives is the residual signal after every constraint is applied — usually positive but smaller than advertised."
      />

      <Deeper>
        <p>
          <strong>The "factor sleeve" composition.</strong> A common retail recipe: 25% MTUM + 25% QUAL +
          25% VLUE + 25% USMV, equal-weighted across factors, rebalanced annually back to 25/25/25/25. The
          inter-factor correlations are low (~0.2-0.5) so the multi-factor blend gets you to a Sharpe
          improvement of ~30-40% over any single factor. Cost: 4× ETF expense (still ~10-15 bps).
        </p>
        <p>
          <strong>Tax efficiency of factor ETFs.</strong> Because factor ETFs use the in-kind redemption
          mechanism, internal portfolio turnover doesn&apos;t generate capital-gains distributions to the
          holder. A 50%-turnover MTUM passes through almost zero realized cap gains/year &mdash; for a
          retail investor in a taxable account, this is strictly better than running the same strategy
          DIY (where every rebalance crystalizes a taxable event).{' '}
          <CrossLink to="tax" recap="Tax frictions: BR 15%/20% + foreign-broker IRPF; turnover kills net Sharpe.">tax detail &rarr;</CrossLink>
        </p>
        <p>
          <strong>BR-listed BDR alternatives.</strong> For a Brazilian investor, MTUM/QUAL/VLUE/USMV
          aren&apos;t directly listed on B3 but BDRs (Brazilian Depositary Receipts) of similar ETFs
          exist. BDR liquidity is materially worse (wider spreads, less rebalance accuracy) and the FX
          conversion is built into the BDR price. Direct foreign-broker access (e.g. IBKR) is generally
          better for any size beyond ~R$50k per ETF.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Which combination of factor ETFs makes the most sense?',
          a: 'MTUM + VLUE + QUAL is a balanced trio: momentum captures fast price-trend signal, value catches the slow mean-reversion premium, quality buffers drawdowns. USMV is more of a defensive overlay; it lowers vol but its standalone factor premium has been weak post-2018.' },
        { q: 'What about active factor funds (DFA, AQR)?',
          a: 'They charge 30-80 bps for higher capture (often 70-85% vs 50-65% for the iShares ETFs). The math: extra 0.10-0.25 in Sharpe vs +0.30-0.65% in fees. For most retail, the iShares versions win on net.' },
        { q: 'Can I just buy the underlying stocks for free at IBKR?',
          a: 'Commissions are near-zero, but the bid-ask spread on bottom-quintile names plus rebalancing taxable events kills you. You lose the in-kind redemption tax shield. For 20+ names rebalanced 4×/year, the all-in drag is ~0.5-1% — the ETF is cheaper at any reasonable size.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — TIME-SERIES MOMENTUM (TSMOM)
   Look at one asset's own past 12-month return. If positive → long. If negative
   → short. Vol-target so each position contributes equal risk. Empirically
   robust across 30+ futures markets back to 1900s.
   ========================================================================== */

const TsmomCard = () => {
  const [lookback, setLookback] = useState(12);
  const [voltarget, setVoltarget] = useState(0.10);
  const [trendStrength, setTrendStrength] = useState(0.05);

  // Synthesize 4 asset paths with seeded trend + noise
  const sim = useMemo(() => {
    const T = 360, dt = 1 / 12; // monthly, 30 years
    const assets = [
      { id: 'eq', name: 'Equity', drift: trendStrength, sig: 0.16, color: '#7dd3fc' },
      { id: 'bd', name: 'Bonds', drift: trendStrength * 0.4, sig: 0.06, color: '#86efac' },
      { id: 'cm', name: 'Commod', drift: 0, sig: 0.20, color: '#fdba74' },
      { id: 'fx', name: 'FX', drift: trendStrength * 0.2, sig: 0.10, color: '#fda4af' },
    ];
    const series = assets.map((a, k) => {
      const rand = mulberry32(900 + k);
      const ret = []; let cum = 1;
      // add a regime trend that flips every ~80 months for cm and fx; persistent for eq
      const regimes = [];
      let r = a.drift;
      for (let t = 0; t < T; t++) {
        if (k >= 2 && t > 0 && t % 60 === 0) r = -r * 1.2; // commod/FX flip more often
        if (k < 2 && t > 0 && t % 240 === 0) r = -r * 0.5; // eq/bd long-term shifts only
        regimes.push(r);
        const rr = r / 12 + a.sig * Math.sqrt(dt) * boxMuller(rand);
        ret.push(rr);
        cum *= (1 + rr);
      }
      return { ...a, ret, regimes };
    });

    // TSMOM signals: sign of cumulative return over `lookback` months
    const signals = series.map(s => s.ret.map((_, t) => {
      if (t < lookback) return 0;
      const cum = s.ret.slice(t - lookback, t).reduce((a, x) => a + x, 0);
      return Math.sign(cum);
    }));

    // Vol-targeted positions: w = voltarget / σ_realized × signal
    const sigEst = series.map(s => s.ret.map((_, t) => {
      if (t < 36) return s.sig;
      const window = s.ret.slice(Math.max(0, t - 36), t);
      const m = window.reduce((a, x) => a + x, 0) / window.length;
      const v = window.reduce((a, x) => a + (x - m) * (x - m), 0) / window.length;
      return Math.sqrt(v * 12);
    }));
    const positions = series.map((s, i) => signals[i].map((sig, t) => sig * (voltarget / Math.max(0.03, sigEst[i][t]))));

    // Portfolio: 1/4 weight on each TSMOM position; daily ret = w_i * r_{i,t+1}
    const portRet = [];
    for (let t = 0; t < T - 1; t++) {
      let r = 0;
      for (let i = 0; i < series.length; i++) {
        r += 0.25 * positions[i][t] * series[i].ret[t + 1];
      }
      portRet.push(r);
    }
    const portCum = portRet.reduce((a, x) => { a.push((a[a.length - 1] || 1) * (1 + x)); return a; }, []);
    const m = portRet.reduce((a, x) => a + x, 0) / portRet.length;
    const sd = Math.sqrt(portRet.reduce((a, x) => a + (x - m) * (x - m), 0) / portRet.length);
    const sharpe = (m * 12) / (sd * Math.sqrt(12));

    // Compute t-stat of mean (against null mean = 0)
    const tStat = m / (sd / Math.sqrt(portRet.length));

    return { series, portCum, sharpe, tStat, annRet: m * 12, annVol: sd * Math.sqrt(12) };
  }, [lookback, voltarget, trendStrength]);

  const W = 320, H = 150, P = 22;
  const yMin = Math.min(0.8, ...sim.portCum);
  const yMax = Math.max(...sim.portCum) * 1.05;
  const sx = (i) => P + (i / sim.portCum.length) * (W - 2 * P);
  const sy = (v) => H - P - ((v - yMin) / (yMax - yMin)) * (H - 2 * P);
  const path = sim.portCum.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  return (
    <Card id="tsmom" icon={TrendingUp} title="Time-series momentum" accent="amber" index={7}
          subtitle="Look at one asset's own past return. Long if positive, short if negative. Vol-target each position. Diversify across many assets. Sharpe ~0.40-0.60 across futures back to 1900s.">
      <MinSchema>
        <Term>TSMOM</Term> is the simplest persistent anomaly in the empirical literature.
        Sign-of-12-month-return as a signal, scaled by 1/σ for equal-risk contribution, applied
        across 30+ futures, has earned a Sharpe of ~0.5 net of cost since 1900. The
        decision-frame is: <em>look back, project forward, vol-target, diversify</em>.
      </MinSchema>

      <Block>{'\\co{r_{p,t+1}} = \\sum_i \\frac{1}{N} \\cdot \\vi{\\text{sgn}(r_{i, t-12:t})} \\cdot \\frac{\\sigma^*}{\\hat\\sigma_{i,t}} \\cdot r_{i, t+1}'}</Block>

      <Predict question="Across which assets is TSMOM most reliable — equities, bonds, commodities, or FX?">
        Surprisingly equal: in the published literature (Moskowitz-Ooi-Pedersen 2012,{' '}
        <em>Time Series Momentum</em>, JFE), TSMOM Sharpe is ~0.5 in equities, ~0.5 in bonds, ~0.4
        in commodities, ~0.4 in FX. The diversification is what makes the combined portfolio Sharpe
        often exceed 1.0 &mdash; the trends in different asset classes are not synchronized.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">look-back (months)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{lookback}</span>
            </div>
            <input type="range" min="1" max="36" step="1" value={lookback}
              onChange={(e) => setLookback(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>1 · noise</span><span>12 · canonical</span><span>36 · slow</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">vol target</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(voltarget * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.05" max="0.20" step="0.01" value={voltarget}
              onChange={(e) => setVoltarget(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-neutral-400 font-mono">underlying trend strength</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(trendStrength * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0" max="0.10" step="0.005" value={trendStrength}
              onChange={(e) => setTrendStrength(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="ann. return" value={`${(sim.annRet * 100).toFixed(1)}%`} sub="of TSMOM port." color="text-amber-300" />
            <Stat label="ann. vol" value={`${(sim.annVol * 100).toFixed(1)}%`} sub="post vol-target" color="text-neutral-300" />
            <Stat label="Sharpe" value={sim.sharpe.toFixed(2)} sub={`t-stat ${sim.tStat.toFixed(1)}`} color={sim.sharpe > 0.4 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">100</text>
          <polyline points={path} fill="none" stroke="#fbbf24" strokeWidth="1.4" />
          <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
          <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">30y</text>
          <text x={P + 2} y={20} fontSize="8" fill="#fbbf24" fontFamily="monospace">cum equity TSMOM port</text>
        </svg>
      </div>

      <Worked title="Worked example · why vol-targeting matters">
        <p>
          Without vol-target: equity weight 25%, bond weight 25%. The bond signal contributes ~5%
          vol; equity contributes ~16%. Equity dominates portfolio risk by ~10×. A trend turn
          in equities sinks the portfolio; a trend turn in bonds barely moves it.
        </p>
        <p>
          With vol-target σ* = 10%: equity weight = 10/16 = 0.63; bond weight = 10/6 = 1.67. Each
          position contributes ~10% vol &mdash; equal-risk. Diversification works as designed.
        </p>
        <p>
          This is the same pattern as <CrossLink to="core" recap="Strategic core: risk parity allocates so each sleeve contributes equal risk; the canonical no-forecast portfolio.">risk parity</CrossLink> applied
          inside the TSMOM sleeve. Many published TSMOM Sharpes implicitly assume vol-targeting;
          without it the realized Sharpe is meaningfully lower.
        </p>
      </Worked>

      <Misconception
        wrong="TSMOM is just trend-following — it's the same as buying when price > 200-day MA."
        right="The 200-day MA crossover is a price-vs-price comparison; TSMOM is a return-vs-zero comparison. They can disagree (a flat-but-noisy chop period can keep MA crossing while TSMOM stays neutral). And TSMOM canonical implementation is vol-targeted across many assets — the MA-crossover version is usually a single-asset bet without sizing discipline."
        because="The TSMOM signal is the cumulative excess return; it's a realized number, not a price level. Vol-targeting is integral, not optional. Many retail trend-following implementations do MA-crossover sized by fixed dollars — and then wonder why their realized Sharpe is half the academic number."
      />

      <WhenItMatters>
        Whenever you can run multiple liquid futures (or trend ETFs). Single-asset trend with
        equity-only exposure has Sharpe ~0.30; the 4-asset diversified version above has Sharpe
        ~0.6+. The combined book is what makes TSMOM a viable retail sleeve.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The mathematical mechanism.</strong> TSMOM works because returns are positively
          autocorrelated at horizons of 1-12 months (caused by under-reaction to news, slow capital
          adjustment in macro markets, and feedback from option-hedging flows). The canonical regression{' '}
          <Eq>{'r_{i,t+1} = \\alpha + \\beta\\, r_{i,t-12:t}/\\sigma_{i,t} + \\varepsilon'}</Eq>{' '}
          gives <Eq>{'\\beta \\approx 0.10'}</Eq>{' ('}Moskowitz et al.) across 58 futures, t-stat ~14,
          robust to regime splits.
        </p>
        <p>
          <strong>Why it doesn&apos;t arb away.</strong> Trend reversals are sudden and large. TSMOM&apos;s
          worst months are sharp reversals (e.g. 2009 March +25% in a week from −30% in two months);
          carrying a vol-targeted short into that move loses 2-3 σ at once. The premium compensates
          for this asymmetric tail. Sellers of trend (institutional fundamental managers) will
          pay it indefinitely because they hate trend reversal pain even at expected positive cost.
        </p>
        <p>
          <strong>Cross-section vs time-series.</strong>{' '}
          Cross-sectional momentum: rank stocks today, long top, short bottom. Time-series:
          look at each asset on its own. They&apos;re positively correlated (~0.4) but not the
          same: TSMOM diversifies into commodities, bonds, FX where cross-sectional momentum
          can&apos;t go. Both deserve a place in a multi-strat book.
        </p>
        <p>
          <strong>Look-back robustness.</strong> The TSMOM signal is robust over look-backs from
          ~3 to 24 months; below 3 months you&apos;re trading mean-reversion (1-month <em>reverses</em>);
          above 24 months you&apos;re slow enough to lose to faster trend-followers. The
          1/3/6/12-month average ensemble (used by AQR, AHL) reduces single-look-back fragility.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Why is the 1-month return reversed in some implementations?',
          a: 'Short-horizon (1-month) returns reverse, not continue: it\'s the bid-ask bounce + microstructure noise dominating signal. Cross-sectional momentum standard practice excludes the most-recent month ("12-1 momentum"). Including it adds noise without improving signal.' },
        { q: 'How do I run TSMOM at retail without futures?',
          a: 'CTA-replication ETFs (DBMF, KMLM, RSST). They proxy the TSMOM signal across the same liquid futures using actual futures contracts inside the wrapper. You give up some signal quality (their lookback choices may not match yours) but gain access without futures margin requirements.' },
        { q: 'Will TSMOM work in a "QE forever" regime?',
          a: 'TSMOM had a bad decade 2010-2020 — central bank intervention dampened normal trend persistence. 2022 was its biggest year since 2008. The strategy is regime-conditional: it works when macro regimes turn over, not when policy holds them static.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — TREND SLEEVE: futures and CTA-ETF
   Two retail-accessible implementations: real CME minis (precise control,
   futures margin) vs CTA-replication ETFs (simpler, lower capture). Compare
   trade-offs.
   ========================================================================== */

const TrendSleeveCard = () => {
  const [impl, setImpl] = useState('etf');
  const [bankroll, setBankroll] = useState(250);

  const futures = [
    { sym: '/ES', name: 'S&P 500 micro', mult: 5, point: 5800, margin: 1900, vol: 0.16 },
    { sym: '/MNQ', name: 'Nasdaq 100 micro', mult: 2, point: 20500, margin: 1700, vol: 0.20 },
    { sym: '/GC', name: 'Gold', mult: 100, point: 2700, margin: 11000, vol: 0.16 },
    { sym: '/CL', name: 'Crude oil', mult: 1000, point: 75, margin: 6800, vol: 0.30 },
    { sym: '/ZN', name: '10y Treasury', mult: 1000, point: 110, margin: 1900, vol: 0.07 },
    { sym: '/6E', name: 'EUR/USD', mult: 125000, point: 1.08, margin: 2500, vol: 0.08 },
  ];

  const totalMarginBaseline = futures.reduce((a, f) => a + f.margin, 0); // 1 contract each
  const useableBankroll = bankroll * 1000;
  const canRunOne = useableBankroll >= totalMarginBaseline * 1.5;

  const etfs = [
    { tk: 'DBMF', name: 'iMGP DBi Managed Futures', fee: 0.85, capture: 0.65, aum: '~$1.5B' },
    { tk: 'KMLM', name: 'KFA Mount Lucas Managed Futures', fee: 0.92, capture: 0.55, aum: '~$300M' },
    { tk: 'RSST', name: 'Return Stacked US Stocks & Managed Futures', fee: 1.03, capture: 0.50, aum: '~$1B' },
  ];

  return (
    <Card id="trend" icon={Activity} title="Trend sleeve · futures and CTA-ETF" accent="amber" index={8}
          subtitle="Real futures give precision (per-contract sizing, true vol-target, no embedded fee). ETFs give accessibility (no margin, no roll). For a $250k retail book, futures-based TSMOM is workable but tight — most retail will use ETFs.">
      <MinSchema>
        Two implementations: <em>CME minis</em> (full control, lower drag, futures margin) vs{' '}
        <em>CTA-replication ETFs</em> (simpler, no futures account, ~85-100bp fee). Pick based
        on capital, time, and tax wrapper. Both are in the realistic retail toolkit.
      </MinSchema>

      <div className="mt-3 flex gap-2">
        {[['etf', 'CTA-replication ETF'], ['futures', 'CME minis']].map(([k, lab]) => (
          <button key={k} onClick={() => setImpl(k)}
            className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${impl === k ? 'bg-amber-500/15 border-amber-400/40 text-amber-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>

      {impl === 'futures' && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">CME mini contracts &mdash; the diversified TSMOM basket</div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="grid grid-cols-12 gap-2 text-[10px] text-neutral-500 font-mono uppercase tracking-wider mb-2">
              <div className="col-span-2">sym</div>
              <div className="col-span-4">name</div>
              <div className="col-span-2 text-right">notional</div>
              <div className="col-span-2 text-right">margin</div>
              <div className="col-span-2 text-right">σ ann</div>
            </div>
            {futures.map(f => (
              <div key={f.sym} className="grid grid-cols-12 gap-2 text-[11px] py-1 border-t border-white/5">
                <div className="col-span-2 text-amber-200 font-mono">{f.sym}</div>
                <div className="col-span-4 text-neutral-300">{f.name}</div>
                <div className="col-span-2 text-right font-mono tabular-nums text-neutral-200">${(f.mult * f.point / 1000).toFixed(0)}k</div>
                <div className="col-span-2 text-right font-mono tabular-nums text-emerald-200">${(f.margin / 1000).toFixed(1)}k</div>
                <div className="col-span-2 text-right font-mono tabular-nums text-neutral-300">{(f.vol * 100).toFixed(0)}%</div>
              </div>
            ))}
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[11px]">
              <span className="text-neutral-400">total margin · 1 contract each (long-only)</span>
              <span className="font-mono text-amber-300">${(totalMarginBaseline / 1000).toFixed(1)}k</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-neutral-400 font-mono">your bankroll ($k)</span>
              <span className="text-neutral-300 font-mono tabular-nums">${bankroll}k</span>
            </div>
            <input type="range" min="50" max="1000" step="25" value={bankroll}
              onChange={(e) => setBankroll(parseInt(e.target.value))} className="rq-range w-full" />
            <div className={`mt-2 text-[11px] ${canRunOne ? 'text-emerald-300' : 'text-rose-300'}`}>
              {canRunOne ? '✓ enough cushion to run 1-contract diversified TSMOM (1.5× margin coverage)' : '✗ thin — futures TSMOM at this size won\'t survive a 2σ vol day'}
            </div>
          </div>
        </div>
      )}

      {impl === 'etf' && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">retail CTA-replication ETFs (US-listed)</div>
          <div className="space-y-2">
            {etfs.map(e => (
              <div key={e.tk} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1">
                  <div>
                    <span className="font-mono text-amber-200">{e.tk}</span>
                    <span className="text-xs text-neutral-300 ml-2">{e.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500">
                    AUM {e.aum} · expense <span className="text-rose-300">{e.fee.toFixed(2)}%</span> · capture <span className="text-emerald-300">{(e.capture * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 leading-snug">
            Net Sharpe estimate: <Eq>{'\\text{Sharpe}_{net} = \\text{Sharpe}_{TSMOM}^{academic} \\cdot \\text{capture} - \\text{fee}/\\sigma_{ETF}'}</Eq>.
            For DBMF: 0.55 × 0.65 − 0.0085/0.10 ≈ <span className="font-mono text-emerald-300">0.27</span>.
            That&apos;s what the actual ETF should deliver vs the ~0.55 academic number.
          </div>
        </div>
      )}

      <Predict question="At a $250k bankroll, which is the right trend implementation?">
        Borderline. Real futures with 1 mini per asset class (~$25k margin total, 10× cushion) is
        feasible &mdash; you control vol-targeting and pay no fund fee. But you carry margin
        attention, monthly rolls, and tax complexity (1256 contracts in the US, more nuanced in BR).
        For most readers, DBMF/KMLM at ~30% sleeve weight is simpler with ~80% of the realized
        edge. Pick based on what you&apos;ll actually maintain over 10 years.
      </Predict>

      <Worked title="Worked example · 30% sleeve, $250k book, ETF route">
        <p>
          $75k allocated to DBMF. Expected sleeve return: 5-7% annualized at 10% sleeve vol &rarr;
          $4-5k/yr in expectation, with ~$22k vol (1σ swings of ±$22k). Fee drag: $75k × 0.85% =
          ~$640/yr inside the ETF. No turnover events for the holder, so no taxable rebalancing.
        </p>
        <p>
          Worst peer-historical year: ~−15% (gross of fees), so ~$11k loss in the bad year. The
          sleeve is supposed to <em>hedge</em> equity drawdowns &mdash; in 2008 and 2022, TSMOM
          delivered +20% to +25% while equities fell ~30% to ~20%. That&apos;s the diversifier
          value over and above the standalone Sharpe.
        </p>
      </Worked>

      <Misconception
        wrong="DBMF and KMLM track the BTOP50 index of CTAs, so I'm getting CTA-quality returns."
        right="They use a simplified replication based on regression of CTA returns onto a small futures basket. Capture is 50-65%, not 100%. The fund fee is ~85bps per year on top. The 'CTA-quality returns' claim is roughly half-right."
        because="True CTA replication is hard — CTAs use proprietary mixes of look-backs, asset universes, and risk overlays. The replicator estimates the average factor exposures and replays them with simple futures positions. It captures the systematic part of CTA returns; it misses the manager-specific alpha."
      />

      <WhenItMatters>
        Whenever you want a return stream that&apos;s genuinely uncorrelated with equities. The
        unique value of trend isn&apos;t the standalone Sharpe (which factor ETFs match), it&apos;s
        the negative correlation in 50%-drawdown equity markets. That&apos;s why every reasonable
        retail multi-strat book has a 15-30% trend sleeve.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why TSMOM hedges equity tail risk.</strong> Major equity drawdowns are slow
          (2008: 12 months from peak to trough; 2022: 9 months). TSMOM&apos;s 12-month signal
          flips short on equities by ~3-4 months into the drawdown and stays short until trend
          re-establishes. The short position then earns positively as the drawdown continues.
          That asymmetric &ldquo;crisis-alpha&rdquo; profile is what no factor sleeve provides.
        </p>
        <p>
          <strong>Roll yield on physical futures.</strong> When holding a long-front-month
          contract, you periodically <em>roll</em> by closing front and opening next-month.
          In <Term>backwardation</Term> (commodity term-structure with future cheap), rolling is
          a positive yield. In <Term>contango</Term>, negative. WTI in 2020 ran a deep contango
          that bled USO (the public retail product) for months &mdash; a real cost not present in
          academic TSMOM Sharpes.
        </p>
        <p>
          <strong>BR-specific: futures via BR brokers.</strong> B3 lists mini-índice (WIN) and
          mini-dólar (WDO), but no diversified macro futures basket. Direct CME access from BR
          generally requires an offshore brokerage (IBKR, Avenue, Nomad). BR-listed BDR
          alternatives for DBMF/KMLM don&apos;t exist as of 2025; the practical retail path is
          either an offshore broker for direct ETF access OR a Brazilian fundo with managed-futures
          mandate (~1-1.5% fee + 20% performance).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I prefer DBMF or KMLM?',
          a: 'DBMF\'s replication methodology is more statistically grounded (it regresses against the BTOP50). KMLM uses Mount Lucas\' fixed 22-market system, which is more rule-based. Both are fine; DBMF has higher AUM and tighter spreads. Splitting 50/50 between them as a "manager-diversification" hedge is reasonable.' },
        { q: 'What about long/short equity ETFs (RSST etc.)?',
          a: 'RSST is "stocks + trend" overlay — it stacks 1× stock exposure and 1× trend exposure for a 200% gross. For a retail book this is leverage in disguise; only useful if you understand and accept the implicit margin costs.' },
        { q: 'Can I run TSMOM on stocks instead of futures?',
          a: 'Less elegant. Single-stock TSMOM has weaker signals (idiosyncratic noise) and higher costs. Cross-sectional momentum on stocks is the better stocks-side trend strategy — already covered in card 5.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — IV vs RV: THE VARIANCE RISK PREMIUM
   IV is what option buyers pay; RV is what actually happens. The persistent gap
   (~3-4 vol points on average) IS the premium. Show the gap over time, the
   tail-driven exceptions, and the math.
   ========================================================================== */

const VarPremCard = () => {
  const [horizon, setHorizon] = useState(30);

  // Synthesize a 10-year monthly series of IV and RV
  const series = useMemo(() => {
    const T = 240; // 20 years
    const rand = mulberry32(42);
    const out = [];
    let regime = 0; // 0 = calm, 1 = stress
    for (let t = 0; t < T; t++) {
      // Regime persistence + occasional spikes
      const flip = rand();
      if (regime === 0 && flip < 0.02) regime = 1;
      else if (regime === 1 && flip < 0.10) regime = 0;
      // RV depends on regime + noise
      const rvBase = regime === 0 ? 12 : 32;
      const rv = Math.max(5, rvBase + boxMuller(rand) * 4);
      // IV: priced ahead of RV with a structural premium that widens in calm, narrows in stress
      const baseIv = rv + (regime === 0 ? 4.5 : 1.0) + boxMuller(rand) * 1.2;
      out.push({ t, iv: Math.max(rv, baseIv), rv, regime });
    }
    return out;
  }, []);

  const meanGap = series.reduce((a, x) => a + (x.iv - x.rv), 0) / series.length;
  const stdGap = Math.sqrt(series.reduce((a, x) => a + Math.pow((x.iv - x.rv) - meanGap, 2), 0) / series.length);
  const negCount = series.filter(x => x.iv - x.rv < 0).length;

  // Visual
  const W = 320, H = 170, P = 24;
  const tMax = series.length;
  const yMax = Math.max(...series.flatMap(x => [x.iv, x.rv])) * 1.05;
  const yMin = 0;
  const sx = (i) => P + (i / tMax) * (W - 2 * P);
  const sy = (v) => H - P - ((v - yMin) / (yMax - yMin)) * (H - 2 * P);
  const ivPath = series.map((x, i) => `${sx(i).toFixed(1)},${sy(x.iv).toFixed(1)}`).join(' ');
  const rvPath = series.map((x, i) => `${sx(i).toFixed(1)},${sy(x.rv).toFixed(1)}`).join(' ');
  // Shaded VRP band
  const bandPath = series.map((x, i) => `${sx(i).toFixed(1)},${sy(x.iv).toFixed(1)}`).join(' ')
    + ' ' + series.slice().reverse().map((x, i) => `${sx(tMax - 1 - i).toFixed(1)},${sy(x.rv).toFixed(1)}`).join(' ');

  // Black-Scholes-ish payoff for a 30-day ATM short straddle, given rv vs iv
  // Approx: P&L ≈ (iv² - rv²) × T/2 (in vol-point²/year)
  const T_ann = horizon / 365;
  // Assume notional vega-equivalent of 1 vol point = $0.4 per straddle on SPY ~$580
  const grossEdge = (Math.pow(meanGap + 18, 2) - Math.pow(18, 2)) * T_ann / 2; // arbitrary scale; we'll show vol points

  return (
    <Card id="varprem" icon={Gauge} title="IV vs RV — the variance risk premium" accent="fuchsia" index={9}
          subtitle="Implied vol > realized vol on average by ~3-4 vol points. The gap pays for option-buyers' insurance against the tails. Selling vol harvests the gap; the tails bite back occasionally.">
      <MinSchema>
        <Term>Implied volatility</Term> (what option buyers pay) is consistently higher than{' '}
        <Term>realized volatility</Term> (what actually happens). The wedge is the{' '}
        <Term>variance risk premium</Term>: <Eq>{'\\fu{\\text{VRP}_t} = \\co{\\text{IV}_t} - \\hi{\\text{RV}_{t,t+30}}'}</Eq>.
        Mean ≈ +3-5 vol points; Sharpe of selling ≈ 0.4-0.6; tails are the cost.
      </MinSchema>

      <Block>{'\\fu{\\text{VRP}} \\,=\\, \\mathbb{E}^Q[\\sigma^2] \\,-\\, \\mathbb{E}^P[\\sigma^2]'}</Block>
      <p className="text-[12px] text-neutral-500 -mt-2">
        Q-measure (option-implied) minus P-measure (physical) variance. Positive on average; that&apos;s
        the structural premium.
      </p>

      <Predict question="Pre-2008, the average VRP was ~+3.5 vol points. What was it in late-Q4 2008?">
        Briefly <em>negative</em> &mdash; for ~3 weeks RV exceeded IV because realized vol spiked
        to ~80 while IV was &ldquo;only&rdquo; 60. Vol-sellers absorbing premium found their
        position now <em>under-priced</em> for the actual chaos. VRP isn&apos;t a free lunch &mdash;
        the rare negative quarters pay for the consistent positive years.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">option horizon (days)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{horizon}</span>
            </div>
            <input type="range" min="7" max="180" step="1" value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>7 · weekly</span><span>30 · monthly · canonical</span><span>180 · LEAPS</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="mean IV-RV" value={`${meanGap.toFixed(1)}pt`} sub="≈ structural premium" color="text-fuchsia-300" />
            <Stat label="std IV-RV" value={`${stdGap.toFixed(1)}pt`} sub="month-to-month" color="text-amber-300" />
            <Stat label="months negative" value={`${negCount}/${series.length}`} sub={`${(negCount * 100 / series.length).toFixed(0)}% of months`} color="text-rose-300" />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            Approximate vega P&amp;L for a {horizon}d ATM short straddle harvesting the mean
            premium: <span className="font-mono text-emerald-300">~+{(meanGap * Math.sqrt(horizon / 30) * 0.40).toFixed(2)}%</span>{' '}
            of underlying notional, before transaction costs. Realized P&amp;L includes the tails
            and isn&apos;t this clean &mdash; but the <em>expectation</em> is positive.
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
          {/* VRP band — fill between IV and RV */}
          <polygon points={bandPath} fill="#f0abfc" fillOpacity="0.10" />
          <polyline points={rvPath} fill="none" stroke="#fb7185" strokeWidth="1.0" strokeOpacity="0.85" />
          <polyline points={ivPath} fill="none" stroke="#f0abfc" strokeWidth="1.2" strokeOpacity="0.9" />
          {[10, 20, 40, 60].map(v => (
            <g key={v}>
              <line x1={P} x2={W - P} y1={sy(v)} y2={sy(v)} stroke="#737373" strokeWidth="0.3" strokeDasharray="2,3" strokeOpacity="0.5" />
              <text x={P - 2} y={sy(v) + 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">{v}</text>
            </g>
          ))}
          <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">20y</text>
          <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
        </svg>
        <div className="text-[10px] text-neutral-500 flex gap-3 -mt-2">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5" style={{background:'#f0abfc'}} />implied vol</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5" style={{background:'#fb7185'}} />realized vol</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-2" style={{background:'rgba(240,171,252,0.18)'}} />VRP band</span>
        </div>
      </div>

      <Worked title="Worked example · why IV is bigger on average">
        <p>
          A pension fund holds $100M in equities. They want disaster insurance &mdash; a
          12-month put. Their utility is asymmetric: a 30% loss is genuinely catastrophic, while
          a 2% extra cost on premium is a budget rounding error. They&apos;ll pay <em>more</em>
          than fair value to get the protection.
        </p>
        <p>
          The dealer selling that put offsets it by selling other puts (or short-deltas), and
          earns the structural premium. The premium persists because <em>most natural option
          buyers are insurance-seeking, not arbitrageurs</em>. There&apos;s no marginal arb
          flow to compete it away.
        </p>
        <p>
          The math: under a representative-agent model with concave utility, the equilibrium
          implied vol is <em>strictly above</em> the physical-measure vol. The gap depends on
          aggregate risk-aversion and on how aligned the insurance buyer&apos;s payoff is with
          aggregate consumption. For S&amp;P 500: ~3-5pt structural; smaller for index futures
          (less hedging demand); larger for single-stock puts (concentrated insurance need).
        </p>
      </Worked>

      <Misconception
        wrong="If IV > RV on average, I should just sell vol all the time."
        right="The mean gap is positive but the distribution is heavily left-skewed: lots of small wins, occasional 3-5σ losses. Naked vol-selling has Sharpe 0.4-0.6 and Sortino half that. Use defined-risk structures (credit spreads, iron condors) so you cap the tail. Position-size as if your vol were 2× the realized — because that's what shows up in tails."
        because="Selling 30-delta straddles on SPX from 2003-2007 looked like printing money. February 2018 ('Volmageddon') wiped out the entire decade of returns in a week. Convexity goes the wrong way: the worst possible day is unbounded, and over enough time you'll see at least one of those — which is why the premium exists."
      />

      <WhenItMatters>
        Whenever any sleeve is short volatility &mdash; covered calls, cash-secured puts,
        credit spreads, even an aggressive long-equity book that has been called away. Knowing
        the structural source of the premium tells you (a) it&apos;s real and durable, (b) the
        tail risk is also real, (c) the right way to size is by <em>conditional</em> vol-of-vol,
        not by the mean.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Vol-of-vol.</strong> The VRP is itself volatile: it shrinks in calm regimes,
          inverts in panics. <Eq>{'\\text{vol}(\\text{IV} - \\text{RV}) \\approx 4-6\\text{pt}'}</Eq>{' '}
          monthly. So even if you nail the mean premium, your strategy&apos;s monthly P&amp;L
          standard deviation is comparable to the mean itself &mdash; you need many months
          of data to detect a real edge above noise.
        </p>
        <p>
          <strong>Skew &amp; the smirk.</strong> OTM puts trade at meaningfully higher IV than
          ATM (the &ldquo;smirk&rdquo;). The skew premium is part of the VRP &mdash; selling OTM
          puts harvests it. But skew is also the most concentrated tail bet: a 25-delta put has ~3-5×
          the gamma exposure per premium dollar of an ATM put. <CrossLink to="volstruct" recap="Vol structures: CSP / covered call / credit spreads + Greeks. Trade-offs across structure types.">structures &rarr;</CrossLink>
        </p>
        <p>
          <strong>Carr-Wu 2009 decomposition.</strong> The seminal paper measures{' '}
          <Eq>{'\\text{VRP}_{t,T} = \\frac{2}{T}\\left(\\mathrm{VIX}_t^2 - \\mathrm{RV}_{t,T}\\right)'}</Eq>{' '}
          on SPX 1996-2003 and finds robust positive premium across maturities, with annual Sharpe 0.4
          for a constant-notional short variance swap. Subsequent literature (Bondarenko 2014, Gârleanu-Pedersen-Poteshman
          2009) confirms persistence and links it to dealer hedging-flow imbalance.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Does the VRP show up on single stocks?',
          a: 'Yes, even more strongly — single-name options often run IV-RV gaps of 5-10pt because retail option buyers (lottery-ticket call buyers) skew the demand. The flip side: bid-ask spreads on single-name options are 2-5× wider than on SPX, which kills the harvestable edge for retail.' },
        { q: 'How does VIX relate to VRP?',
          a: 'VIX is a constant-30-day implied vol of SPX. VRP = VIX − realized 30d vol. VIX above 25-30 in a calm market is unusual; VIX above 50 is panic. VRP shrinks/inverts when VIX is high — sell vol when it\'s elevated, not when it\'s already low.' },
        { q: 'Why does selling 1DTE 0DTE options ("0DTE strategies") not work as well?',
          a: 'The premium per day is high, but so is the gamma — a 1-2% intraday move can blow up a 0DTE short. Per-day VRP is similar to monthly VRP, but the path-dependency and tails dominate. 0DTE works for liquidity providers with large books and tight risk; for retail it\'s usually negative-EV after costs.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — VOL STRUCTURES + GREEKS
   How the retail vol-seller actually structures positions: cash-secured put,
   covered call, defined-risk credit spread. Show the Greeks that drive each
   structure's P&L profile.
   ========================================================================== */

// Black-Scholes price + Greeks (call/put), continuous div/risk-free zero
function bsCall(S, K, t, sigma, r = 0.045, q = 0) {
  if (t <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);
  const N = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  return S * Math.exp(-q * t) * N(d1) - K * Math.exp(-r * t) * N(d2);
}
function bsPut(S, K, t, sigma, r = 0.045, q = 0) {
  if (t <= 0) return Math.max(K - S, 0);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);
  const N = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  return K * Math.exp(-r * t) * N(-d2) - S * Math.exp(-q * t) * N(-d1);
}
function erf(x) {
  // Abramowitz & Stegun
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

const VolStructCard = () => {
  const [structure, setStructure] = useState('csp');
  const [S0, setS0] = useState(580);
  const [iv, setIv] = useState(0.18);
  const [dte, setDte] = useState(30);
  const [moneyness, setMoneyness] = useState(-0.05);

  const t = dte / 365;
  const Kshort = S0 * (1 + moneyness);
  const Klong = structure === 'cspread' ? Kshort * 0.97 : null;

  // Compute payoff at expiry across S
  const Smin = S0 * 0.85, Smax = S0 * 1.15;
  const Spath = Array.from({ length: 80 }, (_, i) => Smin + (Smax - Smin) * i / 79);

  const payoffAt = (S) => {
    if (structure === 'csp') {
      // short put: collect premium, lose if S < K
      const prem = bsPut(S0, Kshort, t, iv);
      return prem - Math.max(Kshort - S, 0);
    }
    if (structure === 'cc') {
      // long stock + short call
      const prem = bsCall(S0, Kshort * (1 - 2*moneyness)*1, t, iv); // short call above
      const KcallShort = S0 * (1 + Math.abs(moneyness));
      const premCall = bsCall(S0, KcallShort, t, iv);
      return (S - S0) + premCall - Math.max(S - KcallShort, 0);
    }
    if (structure === 'cspread') {
      // sell put @ Kshort, buy put @ Klong (lower) for protection
      const premShort = bsPut(S0, Kshort, t, iv);
      const premLong = bsPut(S0, Klong, t, iv);
      return (premShort - premLong) - Math.max(Kshort - S, 0) + Math.max(Klong - S, 0);
    }
    return 0;
  };

  const payoffs = Spath.map(payoffAt);

  // Current Greeks at S0
  const greeks = (() => {
    const dS = S0 * 0.005;
    const ds = 0.001;
    const dt2 = 1 / 365;
    const v0 = payoffAt(S0);
    const vUp = payoffAt(S0 + dS), vDn = payoffAt(S0 - dS);
    const delta = (vUp - vDn) / (2 * dS) * S0; // dollar delta scaled
    const gamma = (vUp - 2 * v0 + vDn) / (dS * dS);
    // theta: re-evaluate with dte-1
    const tNew = (dte - 1) / 365;
    const thetaPo = structure === 'csp'
      ? (bsPut(S0, Kshort, tNew, iv) - Math.max(Kshort - S0, 0)) - (bsPut(S0, Kshort, t, iv) - Math.max(Kshort - S0, 0))
      : 0;
    // We'll just compute theta numerically generically
    const KcallShort = S0 * (1 + Math.abs(moneyness));
    const thetaGen = (() => {
      let pNow, pTomorrow;
      if (structure === 'csp') { pNow = bsPut(S0, Kshort, t, iv); pTomorrow = bsPut(S0, Kshort, tNew, iv); }
      else if (structure === 'cc') { pNow = bsCall(S0, KcallShort, t, iv); pTomorrow = bsCall(S0, KcallShort, tNew, iv); }
      else { pNow = bsPut(S0, Kshort, t, iv) - bsPut(S0, Klong, t, iv); pTomorrow = bsPut(S0, Kshort, tNew, iv) - bsPut(S0, Klong, tNew, iv); }
      return -(pTomorrow - pNow); // short option earns positive theta as time decays
    })();
    // vega numerically
    const vegaGen = (() => {
      let pNow, pUp;
      if (structure === 'csp') { pNow = bsPut(S0, Kshort, t, iv); pUp = bsPut(S0, Kshort, t, iv + ds); }
      else if (structure === 'cc') { pNow = bsCall(S0, KcallShort, t, iv); pUp = bsCall(S0, KcallShort, t, iv + ds); }
      else { pNow = bsPut(S0, Kshort, t, iv) - bsPut(S0, Klong, t, iv); pUp = bsPut(S0, Kshort, t, iv + ds) - bsPut(S0, Klong, t, iv + ds); }
      return -(pUp - pNow) / ds * 0.01; // short option = neg vega; per 1 vol-pt
    })();
    return { delta, gamma, theta: thetaGen, vega: vegaGen };
  })();

  // Visual
  const W = 320, H = 170, P = 24;
  const maxAbs = Math.max(...payoffs.map(Math.abs)) * 1.1;
  const sx = (S) => P + ((S - Smin) / (Smax - Smin)) * (W - 2 * P);
  const sy = (v) => H / 2 - (v / maxAbs) * (H / 2 - P);
  const path = payoffs.map((v, i) => `${sx(Spath[i]).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  const labels = {
    csp: 'Cash-secured put · sell put, hold cash to cover assignment',
    cc: 'Covered call · long stock + short OTM call',
    cspread: 'Defined-risk credit put spread · short put + long lower put',
  };

  return (
    <Card id="volstruct" icon={Sigma} title="Vol structures + Greeks" accent="fuchsia" index={10}
          subtitle="Three retail-friendly vol-selling structures: cash-secured put, covered call, defined-risk credit spread. Each harvests the same VRP through a different Greek profile.">
      <MinSchema>
        Greeks summarise how a position responds to its drivers:{' '}
        <Eq>{'\\Delta = \\partial V/\\partial S'}</Eq>,{' '}
        <Eq>{'\\Gamma = \\partial^2 V/\\partial S^2'}</Eq>,{' '}
        <Eq>{'\\Theta = \\partial V/\\partial t'}</Eq>,{' '}
        <Eq>{'\\nu = \\partial V/\\partial \\sigma'}</Eq>. Vol-sellers are short Γ &amp; ν, long Θ.
        The premium pays for the bad Γ days.
      </MinSchema>

      <Block>{'\\co{V_{call}} = S e^{-q\\tau} \\Phi(d_1) - K e^{-r\\tau} \\Phi(d_2),\\quad d_{1,2} = \\frac{\\ln(S/K) + (r - q \\pm \\sigma^2/2)\\tau}{\\sigma\\sqrt{\\tau}}'}</Block>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[['csp', 'Cash-secured put'], ['cc', 'Covered call'], ['cspread', 'Credit spread']].map(([k, lab]) => (
          <button key={k} onClick={() => setStructure(k)}
            className={`text-[11px] px-2 py-1.5 rounded-md border transition-colors ${structure === k ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-neutral-400">{labels[structure]}</div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-sky-300 font-mono">spot S₀</span>
              <span className="text-neutral-300 font-mono tabular-nums">${S0}</span>
            </div>
            <input type="range" min="400" max="700" step="5" value={S0}
              onChange={(e) => setS0(parseInt(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">implied vol</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(iv * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.08" max="0.50" step="0.01" value={iv}
              onChange={(e) => setIv(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">days to expiry</span>
              <span className="text-neutral-300 font-mono tabular-nums">{dte}</span>
            </div>
            <input type="range" min="7" max="180" step="1" value={dte}
              onChange={(e) => setDte(parseInt(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">moneyness (short strike)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(moneyness * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="-0.15" max="0.05" step="0.01" value={moneyness}
              onChange={(e) => setMoneyness(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="$ Δ (per S₀)" value={greeks.delta.toFixed(2)} sub={greeks.delta > 0 ? 'long bias' : 'short bias'} color="text-sky-300" />
            <Stat label="Γ" value={greeks.gamma.toExponential(1)} sub="convexity" color="text-rose-300" />
            <Stat label="Θ ($/day)" value={greeks.theta.toFixed(3)} sub="theta decay" color="text-emerald-300" />
            <Stat label="ν ($/vol-pt)" value={greeks.vega.toFixed(3)} sub="vega exposure" color="text-fuchsia-300" />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* zero P&L line */}
          <line x1={P} x2={W - P} y1={H / 2} y2={H / 2} stroke="#525252" strokeWidth="0.5" />
          {/* spot mark */}
          <line x1={sx(S0)} x2={sx(S0)} y1={P} y2={H - P} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={sx(S0)} y={P - 4} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">S₀={S0}</text>
          {/* short strike */}
          <line x1={sx(Kshort)} x2={sx(Kshort)} y1={P} y2={H - P} stroke="#f0abfc" strokeWidth="0.6" strokeDasharray="2,3" />
          <text x={sx(Kshort)} y={H - 6} fontSize="8" textAnchor="middle" fill="#f0abfc" fontFamily="monospace">K={Kshort.toFixed(0)}</text>
          {Klong != null && (
            <>
              <line x1={sx(Klong)} x2={sx(Klong)} y1={P} y2={H - P} stroke="#86efac" strokeWidth="0.5" strokeDasharray="2,3" />
              <text x={sx(Klong)} y={H - 6} fontSize="8" textAnchor="middle" fill="#86efac" fontFamily="monospace">{Klong.toFixed(0)}</text>
            </>
          )}
          {/* payoff curve */}
          <polyline points={path} fill="none" stroke="#f0abfc" strokeWidth="1.5" />
          {/* x-axis ticks */}
          {[Smin, S0, Smax].map((v, i) => (
            <text key={i} x={sx(v)} y={H - 18} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">{v.toFixed(0)}</text>
          ))}
          <text x={P + 2} y={20} fontSize="8" fill="#a3a3a3" fontFamily="monospace">P&L at expiry</text>
        </svg>
      </div>

      <Worked title="Worked example · 30-day cash-secured put on SPY at $580, K=$551 (5% OTM), IV=18%">
        <p>
          Premium collected: <Eq>{'P_{put}(580, 551, 0.082, 0.18) \\approx \\$2.50'}</Eq>{' '}
          per share &times; 100 shares = <span className="font-mono text-emerald-300">~$250</span>{' '}
          collected up-front. Cash held for assignment: $55,100 (so the &ldquo;return&rdquo;
          is 250 / 55,100 = 0.45% per 30 days = ~5.4%/yr if you re-roll, ignoring assignments).
        </p>
        <p>
          Best case: SPY closes &gt;$551 at expiry &mdash; you keep the premium, repeat. Worst
          case: SPY at $480 &mdash; assigned at $551, immediate loss = ($551 − $480) × 100 − $250 =
          <span className="font-mono text-rose-300"> −$6,850</span>. So the structure is short
          27× the premium it collects. It only makes sense if you actually want to own SPY at $551.
        </p>
        <p>
          Defined-risk version: also buy the $530 put for ~$1.30. Net premium collected: $1.20 ×
          100 = $120. Max loss: ($551 − $530) × 100 − $120 = $1,980. Risk-reward swap: less premium,
          much smaller worst case. <strong>For retail, defined-risk is almost always the right
          choice</strong> &mdash; the unbounded version is what blew up XIV in Feb 2018.
        </p>
      </Worked>

      <Misconception
        wrong="Selling theta is 'safe income' — I get paid every day for being right."
        right="You get paid every day, but you're short gamma — and gamma is asymmetric. A few bad days erase months of income. The right framing isn't 'income'; it's 'I'm an insurance underwriter, and underwriters pay claims occasionally. The premium I collect must exceed the long-run claim cost.'"
        because="Theta and gamma are linked: high-theta-per-day positions are also high-gamma-per-day. There's no 'free theta'. The Greeks accountant's identity for a delta-hedged book is θ ≈ −½σ²S²Γ — net theta is exactly compensated by net gamma cost under fair pricing. Vol-sellers earn the difference between IV-based θ and RV-based θ, which IS the VRP."
      />

      <WhenItMatters>
        Whenever you&apos;re considering any vol-selling strategy. The choice between CSP /
        covered call / credit spread isn&apos;t aesthetic &mdash; it&apos;s about which Greek
        profile fits your portfolio and your tail tolerance. Defined-risk for any sleeve where
        you can&apos;t afford to be wrong by 30%; CSP/CC for sleeves where you genuinely want
        the underlying.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why ATM gamma is highest near expiry.</strong>{' '}
          <Eq>{'\\Gamma = \\frac{\\phi(d_1)}{S\\sigma\\sqrt{\\tau}}'}</Eq>. As <Eq>{'\\tau \\to 0'}</Eq>,
          <Eq>{'\\Gamma \\to \\infty'}</Eq> at the strike (a step function emerges). That&apos;s why
          sellers of weekly options are exposed to extreme intraday whipsaws on Friday afternoons
          for very small premium &mdash; the gamma per dollar of premium is enormous.
        </p>
        <p>
          <strong>Theta-vega-gamma identity for delta-hedged options.</strong>{' '}
          <Eq>{'\\Theta + \\frac{1}{2}\\sigma^2 S^2 \\Gamma + r S \\Delta - r V = 0'}</Eq>{' '}
          (Black-Scholes PDE in terms of Greeks). For a delta-hedged short option, theta earned ≈
          ½σ²_IV·S²·|Γ|; gamma cost ≈ ½σ²_RV·S²·|Γ|. Net P&amp;L per day ≈ ½(σ²_IV − σ²_RV)·S²·|Γ| =
          <em> the daily VRP</em>. Make this connection once and Black-Scholes will never feel arbitrary again.
        </p>
        <p>
          <strong>Skew-aware position sizing.</strong> Don&apos;t size by delta; size by 1-σ
          P&amp;L. A 25-delta put has ~1.5× the 1-σ-down P&amp;L of a 50-delta put per premium
          dollar &mdash; so for equal risk, you need fewer 25-delta contracts. Most retail vol
          guides ignore this.
        </p>
        <p>
          <strong>BR-specific.</strong> SPY/QQQ options are accessible from foreign brokers but
          not from B3-native brokers. Brazilian-listed options (e.g. on PETR4, VALE3) are far less
          liquid; bid-ask spreads commonly 5-15%. Vol-selling on B3 names is feasible only on the
          ~10 most liquid tickers. The realistic retail path is foreign-broker SPY/QQQ options.
        </p>
      </Deeper>

      <QA items={[
        { q: 'CSP or CC — which is better?',
          a: 'They\'re put-call parity equivalent: CSP at strike K ≈ CC where you also hold $K cash. The choice is operational: CSP if you don\'t yet own the stock and want the premium-or-the-stock outcome; CC if you already own and want premium without selling.' },
        { q: 'Should I use weekly or monthly expirations?',
          a: 'Monthly. Weeklies offer more annualized premium per dollar of margin but ~3× the gamma per delta — you get whipsawed more. Monthly is the sweet spot for retail; bid-ask is also tighter on monthlies on SPY/QQQ.' },
        { q: 'How many trades does it take to detect VRP edge?',
          a: 'Lots. Per-trade VRP edge is ~1pt of vol = ~$0.10-0.20 of premium on a $580 SPY 30-day option. Std dev of per-trade P&L is ~5-10× the mean. To detect edge with t-stat=2: need ~100-200 trades. That\'s ~3-5 years of monthly. Run on principle (the VRP exists) more than on backtest validation in your own short history.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — STRATEGIC CORE: risk parity + real-rate anchors
   The 30-40% sleeve that doesn't try to time anything. Risk-parity intuition,
   Tesouro IPCA+ as the BR investor's real-rate anchor, US TIPS as the global one.
   ========================================================================== */

const StrategicCoreCard = () => {
  const [stocks, setStocks] = useState(40);
  const [bonds, setBonds] = useState(35);
  const [tips, setTips] = useState(15);
  const [gold, setGold] = useState(10);

  // assumed annual vols
  const v = { stocks: 0.16, bonds: 0.06, tips: 0.07, gold: 0.16 };
  const r = { stocks: 0.05, bonds: 0.015, tips: 0.02, gold: 0.0 };
  const w = { stocks: stocks / 100, bonds: bonds / 100, tips: tips / 100, gold: gold / 100 };
  const total = w.stocks + w.bonds + w.tips + w.gold;

  // Risk contributions, assuming pairwise correlation 0.10 except stocks/bonds=-0.20, gold/stocks=0
  const Sigma = [
    [v.stocks**2, -0.20*v.stocks*v.bonds, 0.10*v.stocks*v.tips, 0.0*v.stocks*v.gold],
    [-0.20*v.bonds*v.stocks, v.bonds**2, 0.30*v.bonds*v.tips, 0.10*v.bonds*v.gold],
    [0.10*v.tips*v.stocks, 0.30*v.tips*v.bonds, v.tips**2, 0.20*v.tips*v.gold],
    [0.0*v.gold*v.stocks, 0.10*v.gold*v.bonds, 0.20*v.gold*v.tips, v.gold**2],
  ];
  const wv = [w.stocks, w.bonds, w.tips, w.gold];
  let portVar = 0;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) portVar += wv[i] * wv[j] * Sigma[i][j];
  const portVol = Math.sqrt(Math.max(0, portVar));
  const portRet = wv.reduce((s, ww, i) => s + ww * Object.values(r)[i], 0);

  // Risk contribution of each asset i: w_i * (Σw)_i / portVol
  const rc = wv.map((wi, i) => {
    let sum = 0;
    for (let j = 0; j < 4; j++) sum += Sigma[i][j] * wv[j];
    return portVol > 0 ? wi * sum / portVol : 0;
  });
  const rcPct = rc.map(x => portVol > 0 ? x / portVol : 0);

  return (
    <Card id="core" icon={Landmark} title="Strategic core · risk parity + real-rate anchors" accent="cyan" index={11}
          subtitle="The non-tactical 30-40% of the book. Risk parity intuition: balance risk contribution, not dollar weight. Tesouro IPCA+ for the BR investor; US TIPS as the global real-rate anchor.">
      <MinSchema>
        The core sleeve doesn&apos;t try to predict anything &mdash; it&apos;s the &ldquo;known
        unknowns&rdquo; allocation. <Term>Risk parity</Term> sizes positions so each contributes
        equal risk, not equal capital. Inflation-linked bonds (TIPS, Tesouro IPCA+) anchor the
        portfolio to real yields rather than nominal.
      </MinSchema>

      <Block>{'\\co{w_i} \\propto \\frac{1}{\\vi{\\sigma_i}} \\quad\\text{(naive risk parity)}, \\quad\\quad \\co{\\text{RC}_i} = \\frac{w_i (\\Sigma w)_i}{\\sqrt{w^T \\Sigma w}} \\quad\\text{(true)}'}</Block>

      <p>
        A 60/40 stock/bond portfolio has 60% capital in stocks but ~95% of its risk in stocks
        (because stocks are 3× as volatile). Risk parity inverts that: balance the risk, not
        the dollars. Drag the sliders to see how risk contribution changes with weight.
      </p>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          {[
            { lab: 'Equities (SPY/VT)', val: stocks, set: setStocks, c: 'text-sky-300', key: 'stocks' },
            { lab: 'Nominal bonds (IEF/AGG)', val: bonds, set: setBonds, c: 'text-emerald-300', key: 'bonds' },
            { lab: 'Inflation-linked (TIPS/IPCA+)', val: tips, set: setTips, c: 'text-cyan-300', key: 'tips' },
            { lab: 'Gold', val: gold, set: setGold, c: 'text-amber-300', key: 'gold' },
          ].map(s => (
            <div key={s.lab}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`${s.c} font-mono`}>{s.lab}</span>
                <span className="text-neutral-300 font-mono tabular-nums">{s.val}%</span>
              </div>
              <input type="range" min="0" max="80" step="5" value={s.val}
                onChange={(e) => s.set(parseInt(e.target.value))} className="rq-range w-full" />
            </div>
          ))}
          <div className="text-[10px] text-neutral-500 mt-2">
            Total: <span className={`font-mono ${Math.abs(total - 1) < 0.02 ? 'text-emerald-300' : 'text-rose-300'}`}>{(total * 100).toFixed(0)}%</span>{' '}
            (should sum to 100%)
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="port. return" value={`${(portRet * 100).toFixed(1)}%`} sub="long-run expected" color="text-emerald-300" />
            <Stat label="port. vol" value={`${(portVol * 100).toFixed(1)}%`} sub="annualized" color="text-amber-300" />
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">risk contribution by asset</div>
          <div className="space-y-1.5">
            {[
              { lab: 'Equities', wi: w.stocks, c: '#7dd3fc', i: 0 },
              { lab: 'Bonds', wi: w.bonds, c: '#6ee7b7', i: 1 },
              { lab: 'TIPS', wi: w.tips, c: '#67e8f9', i: 2 },
              { lab: 'Gold', wi: w.gold, c: '#fbbf24', i: 3 },
            ].map(d => (
              <div key={d.lab} className="flex items-center gap-2 text-[10px]">
                <div className="w-16 text-neutral-300 font-mono">{d.lab}</div>
                <div className="w-10 text-right text-neutral-400 font-mono tabular-nums">{(d.wi * 100).toFixed(0)}%</div>
                <div className="flex-1 h-3 bg-white/[0.04] rounded-sm relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(100, rcPct[d.i] * 100)}%`, background: `linear-gradient(90deg, ${d.c}cc, ${d.c}55)` }} />
                </div>
                <div className="w-10 text-right text-emerald-200 font-mono tabular-nums">{(rcPct[d.i] * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 leading-snug">
            Left number = capital weight. Right = risk contribution. In a 60/40, equities are 60%
            of capital but ~90% of risk. Risk parity moves both numbers closer together.
          </div>
        </div>
      </div>

      <Worked title="Worked example · IPCA+ for the BR investor">
        <p>
          A Tesouro IPCA+ 2035 with real yield 6.5% pays IPCA + 6.5% per year. On a R$50k position
          held to maturity: <span className="font-mono text-emerald-300">R$50k · (1.065)<sup>10</sup> · (1+IPCA)<sup>10</sup></span>{' '}
          ≈ R$94k in real terms (i.e. CPI-adjusted), or roughly R$130k nominal at 4% IPCA.
        </p>
        <p>
          That is unique: a guaranteed positive real return for a defined horizon, in BRL, with no
          credit risk. The closest US analog (TIPS 10y) currently yields ~2% real &mdash; 4-5pt
          worse. The BR sovereign real-yield premium is one of the highest among investable
          markets, and it&apos;s the foundation of any sensible BR retail core.
        </p>
        <p>
          Tax: post-2024, IR on Tesouro is the regressive table starting at 22.5% &lt; 6mo down to
          15% &gt; 24mo. For a 10-year hold, effective tax = 15%. So real yield to BR taxpayer
          ≈ 6.5% × 0.85 = 5.5% real. Still unusually attractive relative to global core
          allocations.{' '}
          <CrossLink to="tax" recap="Tax frictions: BR rates and IRPF on foreign brokers; how taxes wreck high-turnover alphas.">tax detail &rarr;</CrossLink>
        </p>
      </Worked>

      <Misconception
        wrong="Risk parity needs leverage to work — that's not retail."
        right="Pure Bridgewater-style risk parity DOES need leverage to deliver the same return as 60/40 (because it heavily over-weights bonds). For retail, an unlevered risk-parity-flavored allocation gets you ~70-80% of the risk-parity benefit (lower vol, smoother drawdowns) at lower expected return. The principle works without leverage; the magnitude is reduced."
        because="Risk parity = risk balanced. With unlevered allocation in a 60/30/10 mix, equities still dominate but less than in 60/40 — and the bond+TIPS allocation buffers stock drawdowns. The Sharpe ratio is comparable to 60/40 across the cycle; the tail behavior is meaningfully better."
      />

      <WhenItMatters>
        Always &mdash; the strategic core is the 30-40% of the book that doesn&apos;t time
        anything. It&apos;s your insurance against being wrong about every other sleeve. If you
        don&apos;t have a core, you don&apos;t have a portfolio &mdash; you have a collection of bets.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Risk parity math.</strong> Equal-risk-contribution requires solving a fixed-point
          equation: <Eq>{'w_i (\\Sigma w)_i = \\frac{\\sigma_p^2}{n}\\; \\forall i'}</Eq>.
          Closed-form for n=2; iterative for n&gt;2 (cyclical coordinate descent works well). For
          retail, naive 1/σ weighting captures ~80% of the optimal allocation; the joint
          covariance term refines the rest.
        </p>
        <p>
          <strong>Why long bonds (TLT) aren&apos;t always your friend.</strong> Long-duration
          bonds get crushed by inflation shocks (2022 saw TLT down 31%). Bonds hedge equity
          deflationary recessions; they don&apos;t hedge inflationary recessions. A core that
          relies entirely on nominal bonds for diversification is fragile. Adding TIPS and
          gold gives the core some inflation-regime robustness.
        </p>
        <p>
          <strong>BR vs US real rates.</strong> Tesouro IPCA+ 2035 yields ~6.5% real (mid-2025);
          US TIPS 10y yields ~2.0% real. The 4.5pt premium reflects (i) BRL currency volatility,
          (ii) sovereign risk perception, (iii) a less-developed long-duration buyer base. For a
          BR investor with BRL liabilities (most of life&apos;s expenses are in BRL), IPCA+ is{' '}
          <em>a duration-matched real-yield instrument with structurally high carry</em> &mdash;
          rare and valuable.
        </p>
        <p>
          <strong>Permanent portfolio &amp; all-weather lineage.</strong> Browne (1981) proposed
          25/25/25/25 stocks/bonds/cash/gold as the permanent portfolio. Bridgewater&apos;s
          all-weather (Dalio) is a more sophisticated risk-parity descendant. Both share the
          insight: <em>diversification across regime-types matters more than across asset types</em>.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How big should the strategic core be?',
          a: '30-40% for a multi-strat retail book. Less than 30% and you don\'t have meaningful drawdown protection; more than 40% and you\'re effectively running a passive book with some satellite sleeves. The factor / trend / vol sleeves go on top of the core, not instead of it.' },
        { q: 'Should I prefer bonds (IEF/AGG) or TIPS for the fixed-income piece?',
          a: 'Split. Nominal bonds hedge deflationary recessions (2008, 2020). TIPS hedge inflationary shocks (2022). For a BR investor, Tesouro IPCA+ uniquely combines both real-yield AND BR sovereign carry. A typical core mix: 40% IPCA+ / 30% TIPS / 30% short-duration nominal.' },
        { q: 'Is gold actually useful?',
          a: 'Marginally. Long-run real return ≈ 0%. Carries no yield. But it diversifies — gold has near-zero correlation to stocks AND bonds, and tends to rally in extreme tail events (1970s, 2008, 2020 March). 5-10% in gold is a defensible hedge; >15% is a bet on macro themes you should be explicit about.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — POSITION SIZING (anchor)
   Vol-targeting + fractional Kelly with edge-uncertainty shrinkage. Cross-link
   to bettors-stack and forecasters-craft. The math behind "how much to bet".
   ========================================================================== */

const SizingCard = () => {
  const [muHat, setMuHat] = useState(0.06);
  const [muSE, setMuSE] = useState(0.04);
  const [sigma, setSigma] = useState(0.16);
  const [kFrac, setKFrac] = useState(0.5);
  const [voltarget, setVoltarget] = useState(0.10);

  const fullKelly = muHat / (sigma * sigma);
  const kelly = kFrac * fullKelly;
  // Bayesian shrinkage: posterior μ given prior 0 with prior SE 0.04, observed muHat with SE muSE
  const priorSig = 0.04;
  const tauSqr = priorSig * priorSig;
  const sSqr = muSE * muSE;
  const muPost = (muHat * tauSqr) / (tauSqr + sSqr);
  const kellyShrunk = muPost / (sigma * sigma);

  // P(ruin) approximation: with full Kelly, P(50% drawdown ever) ≈ 50%
  // with kFrac, P(50% drawdown) ≈ kFrac (rough)
  const pHalfDD = Math.min(0.95, kFrac * 0.5);

  // Vol-target weight = voltarget / sigma
  const wVT = voltarget / sigma;

  // Long-run growth rate for log-utility: g = f·μ - 0.5·f²σ²
  const growth = (f) => f * muHat - 0.5 * f * f * sigma * sigma;
  const Ws = Array.from({ length: 100 }, (_, i) => i * 0.04 / 99 * 5); // 0..5
  const fs = Array.from({ length: 100 }, (_, i) => i * 6 / 99); // 0..6
  const gs = fs.map(growth);
  const maxG = Math.max(...gs);
  const W = 320, H = 130, P = 22;
  const sx = (f) => P + (f / 6) * (W - 2 * P);
  const sy = (g) => H - P - ((g - Math.min(...gs)) / (maxG - Math.min(...gs))) * (H - 2 * P);
  const path = fs.map((f, i) => `${sx(f).toFixed(1)},${sy(gs[i]).toFixed(1)}`).join(' ');

  return (
    <Card id="sizing" icon={Scale} title="Position sizing — vol-targeting + fractional Kelly" accent="emerald" index={12} anchor
          subtitle="Two complementary sizings: vol-target each position to equal-risk; cap aggregate book exposure at fractional Kelly with edge-uncertainty shrinkage. Same math as bettors-stack, applied to multi-asset markets.">
      <MinSchema>
        Two sizings stack. <em>Vol-target</em> each position so it contributes a fixed risk
        budget (independent of the asset&apos;s vol). <em>Fractional Kelly</em> caps the
        aggregate book leverage at some fraction of full <Term>Kelly criterion</Term>{' '}
        <Eq>{'f^* = \\hat\\mu/\\sigma^2'}</Eq>. The fraction shrinks with{' '}
        <Eq>{'\\text{SE}(\\hat\\mu)'}</Eq>.
      </MinSchema>

      <Block>{'\\co{w_i^{vt}} = \\frac{\\sigma^*}{\\hat\\sigma_i}, \\quad\\quad \\co{f^*} = \\frac{\\hat\\mu - r_f}{\\sigma^2}, \\quad\\quad \\co{f^{*}_{shrink}} = \\frac{\\tau^2}{\\tau^2 + \\text{SE}^2(\\hat\\mu)} \\cdot f^*'}</Block>

      <Predict question="Your edge estimate is 6% with SE 4%. Full Kelly says size at 234%. What's the realistic sizing?">
        Way smaller. Bayesian shrinkage with a prior centered on 0% (mean-zero prior σ=4%) gives
        posterior μ ≈ 3% &rarr; shrunk Kelly ≈ 117%. Then half-Kelly haircut for path-dependence
        and tail risk &rarr; 60%. Then liquidity, taxes, behavioral &rarr; ~25-40% in practice. The
        path from full Kelly to live-trade size is several factor-of-two cuts.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">μ̂ · estimated edge</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(muHat * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="-0.05" max="0.20" step="0.005" value={muHat}
              onChange={(e) => setMuHat(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">SE(μ̂) · uncertainty</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(muSE * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.10" step="0.005" value={muSE}
              onChange={(e) => setMuSE(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">σ · vol</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(sigma * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.05" max="0.40" step="0.01" value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">Kelly fraction</span>
              <span className="text-neutral-300 font-mono tabular-nums">{kFrac.toFixed(2)}× full</span>
            </div>
            <input type="range" min="0.10" max="1.00" step="0.05" value={kFrac}
              onChange={(e) => setKFrac(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0.25 · ¼-Kelly</span><span>0.5 · ½-Kelly</span><span>1.0 · full</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-cyan-300 font-mono">vol target σ*</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(voltarget * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.05" max="0.20" step="0.01" value={voltarget}
              onChange={(e) => setVoltarget(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="full Kelly f*" value={`${(fullKelly * 100).toFixed(0)}%`} sub="μ/σ² (theoretical)" color="text-amber-300" />
            <Stat label={`f* × ${kFrac.toFixed(2)}`} value={`${(kelly * 100).toFixed(0)}%`} sub="fractional Kelly" color="text-emerald-300" />
            <Stat label="μ posterior" value={`${(muPost * 100).toFixed(2)}%`} sub="after shrink" color="text-fuchsia-300" />
            <Stat label="shrunk Kelly" value={`${(kellyShrunk * 100).toFixed(0)}%`} sub="μ_post / σ²" color="text-fuchsia-300" />
            <Stat label="vol-target weight" value={`${(wVT * 100).toFixed(0)}%`} sub="σ* / σ" color="text-cyan-300" />
            <Stat label="P(half-DD ever)" value={`${(pHalfDD * 100).toFixed(0)}%`} sub="rough estimate" color={pHalfDD > 0.4 ? 'text-rose-300' : 'text-amber-300'} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">log-growth as a function of bet fraction f</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
              <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
              <polyline points={path} fill="none" stroke="#6ee7b7" strokeWidth="1.4" />
              {/* Mark f* */}
              <line x1={sx(fullKelly)} x2={sx(fullKelly)} y1={P} y2={H - P} stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="2,3" />
              <text x={sx(fullKelly)} y={20} fontSize="8" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">f*</text>
              {/* Mark fractional */}
              <line x1={sx(kelly)} x2={sx(kelly)} y1={P} y2={H - P} stroke="#6ee7b7" strokeWidth="0.6" strokeDasharray="2,3" />
              <text x={sx(kelly)} y={32} fontSize="8" textAnchor="middle" fill="#6ee7b7" fontFamily="monospace">{kFrac.toFixed(1)}f*</text>
              <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">f=6</text>
              <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
            </svg>
            <div className="text-[10px] text-neutral-500 leading-snug mt-1">
              g(f) = f·μ − ½f²σ² peaks at f*. Full Kelly is right at the peak; doubling the bet
              past f* gives <em>negative</em> growth (leverage works against you). Halving Kelly
              gives 75% of optimal growth with much smaller drawdowns.
            </div>
          </div>
        </div>
      </div>

      <Worked title="Worked example · sizing the trend sleeve">
        <p>
          Trend sleeve estimated edge: μ̂ = 6%, SE(μ̂) = 4% (years of data), σ = 12%. Full Kelly =
          0.06/(0.12)² = 4.17 (417% leverage). Bayesian shrinkage with prior σ = 4% gives μ_post =
          0.06 × 16/(16+16) = 0.03 → shrunk Kelly = 2.08 (208%).
        </p>
        <p>
          Half-Kelly haircut (path-dependence + tail risk insurance) → 104%. Liquidity / margin /
          tax → cut to 30-40%. That&apos;s the sleeve weight. The full chain: <em>247% to 38% over
          three honest haircuts</em>. The first cut (Bayesian shrinkage on edge) is by far the
          biggest.
        </p>
        <p>
          Compare to <CrossLink to="bettors-stack" external recap="Bettors-stack: same Kelly + edge-SE shrinkage math, applied to sports betting with vig-stripped probabilities.">The Bettor&apos;s Stack</CrossLink>{' '}
          where this same math sized individual sports bets. Markets and sports differ in instrument
          and horizon; the sizing principles are identical.
        </p>
      </Worked>

      <Misconception
        wrong="Kelly maximizes expected returns, so I should use it."
        right="Kelly maximizes expected log-returns (geometric growth), assuming you know the true edge. With uncertain edge, full Kelly is over-aggressive — it implicitly assumes σ(μ̂) = 0. Fractional Kelly is the practical correction; ¼ to ½ are common defaults."
        because="The Kelly fraction f* is the asymptote of optimal growth — but the convergence is slow, and the path goes through gut-wrenching drawdowns. Half-Kelly retains 75% of long-run growth while cutting drawdown by ~half. That trade-off is worth it for any sleeve a human has to look at every day."
      />

      <WhenItMatters>
        Every sleeve, every position. Vol-targeting determines the mix; fractional Kelly determines
        the aggregate. The scariest-looking thing in finance is &ldquo;a strategy with full Kelly
        sizing&rdquo; &mdash; the math is right but the path-dependence will eat any human investor.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why ½-Kelly is good enough.</strong> Long-run growth rate{' '}
          <Eq>{'g(f) = f \\mu - \\tfrac{1}{2} f^2 \\sigma^2 = \\tfrac{1}{2} \\mu^2/\\sigma^2'}</Eq>{' '}
          at <Eq>{'f = \\mu/\\sigma^2'}</Eq>. At f=½f*: g(½f*) = ½f*·μ − ⅛(f*)²σ² = ⅜·μ²/σ² =
          0.75·g(f*). So you keep 75% of the growth at half the leverage.
        </p>
        <p>
          <strong>Multi-asset Kelly (long-only).</strong>{' '}
          <Eq>{'\\mathbf{f}^* = \\Sigma^{-1}\\boldsymbol{\\mu}'}</Eq>{' '}
          for log-utility on multiple assets &mdash; this is just Markowitz in Kelly disguise.
          It blows up if Σ is poorly conditioned (small N samples / high correlation). The fix:
          regularize Σ with{' '}
          <CrossLink to="portconstr" recap="Portfolio construction: shrinkage methods stabilize the inverted covariance.">Ledoit-Wolf shrinkage</CrossLink>.
        </p>
        <p>
          <strong>Kelly under non-Gaussian returns.</strong> If returns are fat-tailed, full Kelly
          over-bets relative to a properly-calibrated optimum. The intuition: Kelly assumes the
          variance σ² fully captures downside risk. With fat tails, the practical &ldquo;stress&rdquo;
          variance is larger than the realized one. Use 2-3× σ when sizing.{' '}
          <CrossLink to="nongauss" recap="Returns are fat-tailed: SPY kurt ~12 vs Gaussian 3. Fat tails make full Kelly too aggressive.">non-Gaussian context &rarr;</CrossLink>
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I estimate SE(μ̂) for a real strategy?',
          a: 'Bootstrap from your backtest. Resample with replacement to generate ~10,000 backtest paths, compute Sharpe for each, take the std of Sharpe estimates × σ as your SE(μ̂). For most retail strategies SE is 30-100% of the point estimate — that\'s why shrinkage matters so much.' },
        { q: 'When does full Kelly actually make sense?',
          a: 'Single-trial repeating bets with known true probabilities (counting cards in blackjack, certain prediction-market opportunities). For market strategies with estimation noise, never. Even for "obvious" structural premia like the equity ERP, full Kelly says lever 4-5×, which is suicidal.' },
        { q: 'How does this stack with risk parity?',
          a: 'Risk parity gives you the per-sleeve weights inside the book; fractional Kelly gives you the aggregate book scale. They\'re composable: do risk parity within sleeves first, then scale the entire book by your fractional Kelly factor. Most retail accidentally runs full-Kelly equivalent because the bankroll is small relative to one position\'s vol.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — PORTFOLIO CONSTRUCTION: Markowitz → shrinkage / risk parity
   The full multi-sleeve allocation problem. Naive Markowitz blows up; shrinkage
   and risk parity are the practical fixes.
   ========================================================================== */

const PortConstrCard = () => {
  const [w, setW] = useState([0.40, 0.30, 0.15, 0.15]); // raw user weights (normalized below)
  const [method, setMethod] = useState('mvshrink');
  const [shrink, setShrink] = useState(0.5);
  const [hoverDot, setHoverDot] = useState(null);

  // 4 toy assets
  const mu = [0.05, 0.015, 0.06, 0.04];           // stocks, bonds, trend, vol-prem
  const sig = [0.16, 0.06, 0.12, 0.10];
  const rho = [
    [1.00, -0.20,  0.05,  0.20],
    [-0.20, 1.00,  0.00, -0.10],
    [0.05,  0.00,  1.00,  0.10],
    [0.20, -0.10,  0.10,  1.00],
  ];
  const labels = ['Equities', 'Bonds', 'Trend', 'Vol prem'];
  const labelsShort = ['Eq', 'Bnd', 'Trd', 'Vol'];
  const colors = ['#7dd3fc', '#86efac', '#fbbf24', '#f0abfc'];
  const Sigma = sig.map((s_i, i) => sig.map((s_j, j) => rho[i][j] * s_i * s_j));

  // Linear-algebra helpers
  function invertSym(M) {
    const n = M.length;
    const A = M.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
    for (let i = 0; i < n; i++) {
      const pivot = A[i][i];
      if (Math.abs(pivot) < 1e-10) return null;
      for (let j = 0; j < 2 * n; j++) A[i][j] /= pivot;
      for (let k = 0; k < n; k++) if (k !== i) {
        const f = A[k][i];
        for (let j = 0; j < 2 * n; j++) A[k][j] -= f * A[i][j];
      }
    }
    return A.map(row => row.slice(n));
  }
  const matvec = (M, v) => M.map(row => row.reduce((s, x, i) => s + x * v[i], 0));

  // Normalize user weights to sum=1 (proportional, non-negative)
  const sumRaw = w.reduce((s, x) => s + Math.max(0, x), 0);
  const wNorm = sumRaw > 1e-9 ? w.map(x => Math.max(0, x) / sumRaw) : [0.25, 0.25, 0.25, 0.25];

  // Compute optimal weights for current method (long-only normalized)
  const optimalW = (() => {
    if (method === 'mv' || method === 'mvshrink') {
      const Smat = method === 'mv'
        ? Sigma
        : Sigma.map((row, i) => row.map((x, j) => {
            const sigAvg = Sigma.reduce((s, r, k) => s + r[k], 0) / Sigma.length;
            return (1 - shrink) * x + shrink * (i === j ? sigAvg : 0);
          }));
      const muVec = method === 'mv' ? mu : mu.map(x => (1 - shrink) * x + shrink * (mu.reduce((a, b) => a + b, 0) / mu.length));
      const Sinv = invertSym(Smat);
      if (!Sinv) return [0.25, 0.25, 0.25, 0.25];
      const wOpt = matvec(Sinv, muVec);
      const norm = wOpt.reduce((s, x) => s + Math.max(0, x), 0);
      return norm > 1e-6 ? wOpt.map(x => Math.max(0, x) / norm) : [0.25, 0.25, 0.25, 0.25];
    }
    if (method === 'rp') {
      let ww = sig.map(s => 1 / s);
      let nrm = ww.reduce((a, b) => a + b, 0);
      ww = ww.map(x => x / nrm);
      for (let iter = 0; iter < 100; iter++) {
        const Sw = matvec(Sigma, ww);
        const portVar2 = ww.reduce((s, x, i) => s + x * Sw[i], 0);
        const targetRC = portVar2 / ww.length;
        const newW = ww.map((x, i) => Math.sqrt(Math.max(1e-12, targetRC / Math.max(1e-12, Sw[i]))) * x);
        const nn = newW.reduce((a, b) => a + b, 0);
        ww = newW.map(x => x / nn);
      }
      return ww;
    }
    return [0.25, 0.25, 0.25, 0.25];
  })();

  const snapToOptimal = () => setW([...optimalW]);

  // Portfolio metrics from normalized user weights
  const portRet = wNorm.reduce((s, ww, i) => s + ww * mu[i], 0);
  const Sw = matvec(Sigma, wNorm);
  const portVar = wNorm.reduce((s, ww, i) => s + ww * Sw[i], 0);
  const portVol = Math.sqrt(Math.max(0, portVar));
  const portSharpe = portVol > 0 ? portRet / portVol : 0;

  // Best individual Sharpe for "are we beating it?" comparison
  const bestIndivSharpe = Math.max(...mu.map((m, i) => m / sig[i]));

  return (
    <Card id="portconstr" icon={Workflow} title="Portfolio construction · Markowitz → shrinkage / risk parity" accent="sky" index={13}
          subtitle="Naive mean-variance blows up on noisy μ̂. Shrinking μ and Σ toward stable priors (Ledoit-Wolf, Black-Litterman) is the practical fix; risk parity sidesteps μ entirely. Set your own weights or snap to a method's optimal.">
      <MinSchema>
        <Term>Markowitz</Term> finds <Eq>{'w^* \\propto \\Sigma^{-1}\\boldsymbol{\\mu}'}</Eq>{' '}
        &mdash; an unstable solution because <Eq>{'\\Sigma^{-1}'}</Eq> amplifies estimation
        error in the smallest eigenvalues. Practical fixes: shrink Σ
        toward an identity-times-σ-prior (<Term>Ledoit-Wolf shrinkage</Term>); shrink μ toward
        the grand mean (Bayesian Black-Litterman); or skip μ estimation entirely (<Term>risk parity</Term>).
      </MinSchema>

      <Block>{'\\co{w_{MV}} = \\frac{1}{\\lambda} \\Sigma^{-1} \\boldsymbol{\\mu}, \\quad \\co{w_{LW}} = \\frac{1}{\\lambda} \\left[(1-\\delta)\\Sigma + \\delta F\\right]^{-1}\\boldsymbol{\\mu}, \\quad \\co{w_{RP}} : w_i (\\Sigma w)_i = \\text{const}'}</Block>

      {/* User-controlled weight sliders */}
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">your portfolio · auto-normalized to sum 100%</span>
          <span className="text-[10px] text-neutral-500">"opt" = current method's recommendation</span>
        </div>
        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
          {labels.map((lab, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono" style={{ color: colors[i] }}>{lab}</span>
                <span className="text-neutral-300 font-mono tabular-nums">
                  {(wNorm[i] * 100).toFixed(0)}%{' '}
                  <span className="text-neutral-600 text-[10px]">opt {(optimalW[i] * 100).toFixed(0)}%</span>
                </span>
              </div>
              <input type="range" min="0" max="1" step="0.02" value={w[i]}
                onChange={(e) => { const v = parseFloat(e.target.value); setW(prev => { const nw = [...prev]; nw[i] = v; return nw; }); }}
                className="rq-range w-full" />
            </div>
          ))}
        </div>
        {/* Stacked bar: normalized weights summing to 100% */}
        <div className="mt-3 h-4 rounded-sm overflow-hidden flex bg-white/[0.04]">
          {wNorm.map((wn, i) => wn > 0.001 ? (
            <div key={i} title={`${labels[i]} ${(wn * 100).toFixed(0)}%`}
              style={{ width: `${wn * 100}%`, background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}aa)` }} />
          ) : null)}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono">
          {labels.map((lab, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ background: colors[i] }} />
              <span style={{ color: colors[i] }}>{labelsShort[i]}</span>
              <span className="text-neutral-300">{(wNorm[i] * 100).toFixed(0)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Method picker for the "snap" button */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">optimization method · defines what "optimal" means</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[['mv', 'Naive Markowitz'], ['mvshrink', 'Shrunk MV'], ['rp', 'Risk parity'], ['eq', 'Equal-weight']].map(([k, lab]) => (
            <button key={k} onClick={() => setMethod(k)}
              className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${method === k ? 'bg-sky-500/15 border-sky-400/40 text-sky-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
              {lab}
            </button>
          ))}
        </div>
        {method === 'mvshrink' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">shrinkage δ</span>
              <span className="text-neutral-300 font-mono tabular-nums">{shrink.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={shrink}
              onChange={(e) => setShrink(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · pure MV (unstable)</span><span>1 · pure prior (1/N)</span>
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <button onClick={snapToOptimal}
            className="text-[11px] rounded border border-fuchsia-400/40 bg-fuchsia-400/10 hover:bg-fuchsia-400/20 text-fuchsia-200 px-3 py-1.5 font-mono inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> snap weights to {method === 'mv' ? 'naive MV' : method === 'mvshrink' ? 'shrunk MV' : method === 'rp' ? 'risk-parity' : 'equal-weight'} optimal
          </button>
          <span className="text-[10px] text-neutral-500">applies the closed-form solution from Σ and μ</span>
        </div>
      </div>

      {/* Portfolio stats */}
      <div className="mt-4 grid md:grid-cols-3 gap-2">
        <Stat label="port. return μ" value={`${(portRet * 100).toFixed(2)}%`} sub="weighted average" color="text-emerald-300" />
        <Stat label="port. vol σ" value={`${(portVol * 100).toFixed(2)}%`} sub={`from √(wᵀΣw)`} color="text-amber-300" />
        <Stat label="Sharpe" value={portSharpe.toFixed(2)}
          sub={portSharpe > bestIndivSharpe ? `> best individual (${bestIndivSharpe.toFixed(2)})` : `vs best individual ${bestIndivSharpe.toFixed(2)}`}
          color={portSharpe > bestIndivSharpe ? 'text-emerald-300' : 'text-amber-300'} />
      </div>

      {/* Iso-Sharpe scatter — assets + portfolio dot */}
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">return × volatility · 4 assets + your portfolio</span>
          <span className="text-[10px] text-fuchsia-300 font-mono">★ portfolio moves with sliders</span>
        </div>
        {(() => {
          const W = 520, H = 240, P = 30;
          const xMax = 10, yMax = 18;
          const sx = (v) => P + (v / xMax) * (W - 2 * P);
          const sy = (v) => H - P - (v / yMax) * (H - 2 * P);
          const sharpeRays = [0.25, 0.50, 0.75, 1.00];
          const wedges = [
            { srLo: 0,    srHi: 0.25, color: '#fb7185' },
            { srLo: 0.25, srHi: 0.50, color: '#fb923c' },
            { srLo: 0.50, srHi: 0.75, color: '#fbbf24' },
            { srLo: 0.75, srHi: 1.0,  color: '#84cc16' },
            { srLo: 1.0,  srHi: 99,   color: '#22c55e' },
          ];
          const exitOf = (sr) => {
            if (sr === 0) return [0, yMax];
            if (sr >= 99) return [xMax, 0];
            const xAtTop = sr * yMax;
            if (xAtTop <= xMax) return [xAtTop, yMax];
            return [xMax, xMax / sr];
          };
          // assets in % units
          const assets = labels.map((lab, i) => ({ lab, ret: mu[i] * 100, vol: sig[i] * 100, color: colors[i], i }));
          const labelOff = [[10,3],[10,3],[10,-6],[10,3]];
          return (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Background wedges */}
              {wedges.map((wd, i) => {
                const p1 = exitOf(wd.srLo);
                const p2 = exitOf(wd.srHi);
                const corners = [[0, 0], p1];
                if (p1[1] >= yMax - 1e-6 && p2[0] >= xMax - 1e-6 && p1[0] < xMax - 1e-6) {
                  corners.push([xMax, yMax]);
                }
                corners.push(p2);
                const pts = corners.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
                return <polygon key={i} points={pts} fill={wd.color} fillOpacity="0.10" />;
              })}
              {/* Iso-Sharpe rays */}
              {sharpeRays.map(sr => {
                const xAtYmax = sr * yMax;
                const endX = Math.min(xMax, xAtYmax);
                const endY = endX / sr;
                return (
                  <g key={sr}>
                    <line x1={sx(0)} y1={sy(0)} x2={sx(endX)} y2={sy(endY)}
                      stroke="#7dd3fc" strokeWidth="0.6" strokeOpacity="0.30" strokeDasharray="3,3" />
                    <text x={sx(endX) - 2} y={sy(endY) + (endX === xMax ? -3 : 9)} fontSize="9" textAnchor="end"
                      fill="#7dd3fc" fillOpacity="0.55" fontFamily="monospace">SR {sr.toFixed(2)}</text>
                  </g>
                );
              })}
              {/* Axes */}
              <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
              <line x1={P} y1={P / 2} x2={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
              {[0, 2, 4, 6, 8, 10].map(v => (
                <g key={v}>
                  <line x1={sx(v)} y1={H - P} x2={sx(v)} y2={H - P + 3} stroke="#737373" strokeWidth="0.4" />
                  <text x={sx(v)} y={H - P + 13} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="monospace">{v}%</text>
                </g>
              ))}
              {[0, 4, 8, 12, 16].map(v => (
                <g key={v}>
                  <line x1={P - 3} y1={sy(v)} x2={P} y2={sy(v)} stroke="#737373" strokeWidth="0.4" />
                  <text x={P - 5} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="#737373" fontFamily="monospace">{v}%</text>
                </g>
              ))}
              <text x={(P + W - P) / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace">annual return →</text>
              <text x={10} y={(P / 2 + H - P) / 2} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="monospace"
                transform={`rotate(-90, 10, ${(P / 2 + H - P) / 2})`}>annual volatility →</text>
              {/* Asset dots */}
              {assets.map((a, i) => {
                const cx = sx(a.ret), cy = sy(a.vol);
                const [dx, dy] = labelOff[i] || [10, 3];
                return (
                  <g key={a.lab} style={{ cursor: 'help' }}
                    onMouseEnter={(e) => setHoverDot({ kind: 'asset', a, mx: e.clientX, my: e.clientY })}
                    onMouseMove={(e) => setHoverDot({ kind: 'asset', a, mx: e.clientX, my: e.clientY })}
                    onMouseLeave={() => setHoverDot(null)}>
                    <circle cx={cx} cy={cy} r={6} fill={a.color} fillOpacity="0.85" stroke="#0a0a0a" strokeWidth="1" />
                    <text x={cx + dx} y={cy + dy} fontSize="9.5" textAnchor={dx < 0 ? 'end' : 'start'}
                      fill="#d4d4d4" fontFamily="ui-sans-serif, system-ui">{a.lab}</text>
                  </g>
                );
              })}
              {/* Portfolio dot — fuchsia ring + star marker */}
              {(() => {
                const cx = sx(portRet * 100);
                const cy = sy(portVol * 100);
                return (
                  <g style={{ cursor: 'help' }}
                    onMouseEnter={(e) => setHoverDot({ kind: 'port', mx: e.clientX, my: e.clientY })}
                    onMouseMove={(e) => setHoverDot({ kind: 'port', mx: e.clientX, my: e.clientY })}
                    onMouseLeave={() => setHoverDot(null)}>
                    <circle cx={cx} cy={cy} r={11} fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeOpacity="0.9" />
                    <circle cx={cx} cy={cy} r={6.5} fill="#f0abfc" fillOpacity="0.95" stroke="#0a0a0a" strokeWidth="1" />
                    <text x={cx + 12} y={cy - 8} fontSize="10" fill="#f0abfc" fontFamily="ui-sans-serif, system-ui" fontWeight="600">★ portfolio</text>
                  </g>
                );
              })()}
            </svg>
          );
        })()}
        <FloatingTip
          hover={hoverDot}
          width={300}
          render={() => hoverDot && hoverDot.kind === 'asset' ? (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: hoverDot.a.color }}>{hoverDot.a.lab}</div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div><div className="text-neutral-500">μ</div><div className="text-emerald-300">{hoverDot.a.ret.toFixed(1)}%</div></div>
                <div><div className="text-neutral-500">σ</div><div className="text-amber-300">{hoverDot.a.vol.toFixed(1)}%</div></div>
                <div><div className="text-neutral-500">Sharpe</div><div className="text-fuchsia-300">{(hoverDot.a.ret / hoverDot.a.vol).toFixed(2)}</div></div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">★ your portfolio</div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div><div className="text-neutral-500">μ</div><div className="text-emerald-300">{(portRet * 100).toFixed(2)}%</div></div>
                <div><div className="text-neutral-500">σ</div><div className="text-amber-300">{(portVol * 100).toFixed(2)}%</div></div>
                <div><div className="text-neutral-500">Sharpe</div><div className="text-fuchsia-300">{portSharpe.toFixed(2)}</div></div>
              </div>
              <div className="text-[10px] text-neutral-400 leading-snug pt-1 border-t border-white/10">
                Diversification typically pushes Sharpe above any individual asset, because cross-asset
                correlation is below 1 — the σ shrinks more than the μ does.
              </div>
            </div>
          )}
        />
        <div className="text-[10px] text-neutral-500 leading-snug mt-2">
          Background coloring: rose &rarr; green wedges show low &rarr; high Sharpe zones.
          The portfolio dot is at <span className="font-mono text-fuchsia-200">({(portRet * 100).toFixed(2)}%, {(portVol * 100).toFixed(2)}%)</span>{' '}
          &mdash; usually higher Sharpe than any individual asset thanks to the negative
          equity-bond correlation pulling portfolio σ down.
        </div>
      </div>

      {/* Covariance matrix */}
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
          covariance matrix Σ &middot; <Eq>{'\\sigma_{ij} = \\rho_{ij}\\, \\sigma_i\\, \\sigma_j'}</Eq>
        </div>
        <div className="overflow-x-auto">
          <div className="grid gap-1 text-[10px] font-mono min-w-[360px]" style={{ gridTemplateColumns: '60px repeat(4, minmax(60px, 1fr))' }}>
            <div></div>
            {labelsShort.map((lab, i) => (
              <div key={i} className="text-center font-mono uppercase tracking-wider text-[9px]" style={{ color: colors[i] }}>{lab}</div>
            ))}
            {labels.map((rowLab, i) => (
              <React.Fragment key={i}>
                <div className="text-right uppercase tracking-wider text-[9px] pr-1 self-center" style={{ color: colors[i] }}>{labelsShort[i]}</div>
                {Sigma[i].map((v, j) => {
                  const isDiag = i === j;
                  const sign = v > 1e-6 ? 'pos' : v < -1e-6 ? 'neg' : 'zero';
                  const colorMap = {
                    pos: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
                    neg: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
                    zero: 'bg-white/[0.02] text-neutral-500 border-white/10',
                  };
                  return (
                    <div key={j} className={`text-center px-1 py-1.5 rounded border ${colorMap[sign]} ${isDiag ? 'ring-1 ring-fuchsia-400/40' : ''}`}>
                      <div className="tabular-nums">{v >= 0 ? v.toFixed(4) : v.toFixed(4)}</div>
                      <div className="text-[8px] opacity-70 mt-0.5">{isDiag ? `σ²` : `ρ ${rho[i][j].toFixed(2)}`}</div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-neutral-500 leading-snug mt-2">
          Diagonal (fuchsia ring) = variance σ². Off-diagonals: sky for positive co-movement, rose for negative.
          The −0.20 equity↔bonds correlation is the structural hedge that makes 60/40 work.
          Trend has near-zero correlation to bonds &mdash; that&apos;s what makes it a true diversifier.
          Your portfolio variance:{' '}
          <Eq>{`w^T \\Sigma w = ${portVar.toFixed(5)} \\Rightarrow \\sigma = ${(portVol * 100).toFixed(2)}\\%`}</Eq>.
        </div>
      </div>

      <Worked title="Worked example · why Markowitz dies on real data">
        <p>
          Estimate μ̂ from 5 years of monthly data: SE(μ̂) ≈ σ/√60 ≈ 16%/7.7 ≈ 2%. Your point
          estimate of equity μ might be 8% but the 95% CI is [4%, 12%]. Plug 4% into Markowitz
          &rarr; equities get 0% weight. Plug 12% &rarr; equities get 60% weight. The optimization
          is spectacularly sensitive to inputs you don&apos;t know.
        </p>
        <p>
          <Term>Black-Litterman</Term> fixes this by anchoring μ̂ to the market-implied returns
          (reverse-engineered from current weights and σ). You then specify your &ldquo;views&rdquo;
          relative to the market: &ldquo;I think trend will outperform equities by 1pt over the
          next 5 years.&rdquo; The result: weights that move sensibly with views, never crazy.
        </p>
        <p>
          For most retail, <strong>risk parity is the best practical solution</strong>: no μ
          estimation at all, weights driven by Σ alone (which is much more stable). Black-Litterman
          adds value when you genuinely have informed views you want to express.
        </p>
      </Worked>

      <Misconception
        wrong="Markowitz gives the optimal portfolio — I just need to plug in my estimates."
        right="Markowitz gives the optimal portfolio assuming your μ̂ is exact. With realistic estimation noise (SE ~2pp on annual μ), the resulting weights swing 50-100% with each new month of data. The 'optimal' label is purely in-sample; out-of-sample, naive Markowitz is consistently dominated by simpler heuristics."
        because="The instability comes from inverting Σ. Eigenvectors with small eigenvalues amplify estimation error. The smallest-eigenvalue direction in Σ is essentially noise; Σ⁻¹ leans heavily on it. Shrinkage (Ledoit-Wolf) compresses small eigenvalues toward an isotropic prior, killing the noise amplification at the cost of some signal."
      />

      <WhenItMatters>
        Whenever you allocate across multiple sleeves. The book&apos;s {`{`}factor / trend / vol /
        core{`}`} weights determine 70% of realized volatility and Sharpe; the per-sleeve choices
        are the remaining 30%. Time spent stabilizing the cross-sleeve allocation is much
        higher-ROI than fine-tuning a single sleeve&apos;s details.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Ledoit-Wolf shrinkage intensity.</strong>{' '}
          <Eq>{'\\delta^* = \\frac{\\sum_{i,j} \\text{Var}(\\hat{s}_{ij})}{\\sum_{i,j}(\\hat{s}_{ij} - f_{ij})^2}'}</Eq>{' '}
          where ŝ is the sample covariance and F is the structured target (typically a constant-correlation
          matrix). δ* is computable from the data alone &mdash; no tuning required. A typical δ* is
          0.3-0.6 for monthly N&lt;100 cross-sectional samples; lower with more data.
        </p>
        <p>
          <strong>Black-Litterman implied returns.</strong>{' '}
          <Eq>{'\\boldsymbol{\\Pi} = \\lambda \\Sigma w_{mkt}'}</Eq>{' '}
          gives the equilibrium expected returns implied by the current market weights and risk
          aversion. View-conditioned posterior:{' '}
          <Eq>{'\\boldsymbol{\\mu}_{BL} = \\left[(\\tau\\Sigma)^{-1} + P^T\\Omega^{-1}P\\right]^{-1}\\left[(\\tau\\Sigma)^{-1}\\boldsymbol{\\Pi} + P^T\\Omega^{-1}\\boldsymbol{q}\\right]'}</Eq>{' '}
          for views <strong>q</strong> with confidence Ω.
        </p>
        <p>
          <strong>HRP (Hierarchical Risk Parity).</strong> López de Prado&apos;s 2016 method:
          cluster Σ by hierarchical clustering, then allocate top-down within each cluster. Avoids
          inverting Σ entirely. Empirically robust to ill-conditioned covariance and competitive
          with Ledoit-Wolf.
        </p>
        <p>
          <strong>The 1/N benchmark.</strong> DeMiguel-Garlappi-Uppal 2009 famously showed that
          equal-weight (1/N) often beats sophisticated optimizers out-of-sample. The reason:
          1/N has zero estimation error to amplify. For 4-6 sleeves with similar Sharpes, equal-weight
          is a perfectly defensible default.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I really not use Markowitz directly?',
          a: 'For 3-5 sleeves with very different vols (stocks vs bonds vs vol-selling), equal-weight is too dumb. Use risk parity. For Markowitz proper, always shrink — naive MV is reliably worse than the shrunk version on out-of-sample data.' },
        { q: 'How does this interact with fractional Kelly?',
          a: 'The methods here give you proportional weights w_i. The Kelly fraction scales the entire vector: w → kFrac × w. Risk parity tells you how to share risk between sleeves; Kelly tells you how much risk to take overall.' },
        { q: 'When is Black-Litterman worth it?',
          a: 'When you genuinely have views you want to express (e.g. "I think this regime favors trend"). For passive, no-views retail allocation, plain risk parity gives the same answer with less moving parts. BL is for the "I have an opinion but I don\'t want to bet the whole farm on it" case.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   14 — TRANSACTION COSTS at retail scale
   Bid-ask + commissions + slippage. Cost-Sharpe relationship: turnover × cost
   per √vol. The cost-ceiling for any high-turnover strategy.
   ========================================================================== */

const CostsCard = () => {
  const [bps, setBps] = useState(8);
  const [turnover, setTurnover] = useState(2.0);
  const [grossSharpe, setGrossSharpe] = useState(0.6);
  const [vol, setVol] = useState(0.10);

  const drag = (bps / 10000) * turnover;
  const dragSharpe = drag / vol;
  const netSharpe = grossSharpe - dragSharpe;

  // Cost ceiling: max turnover at which net Sharpe > 0
  const turnoverMax = grossSharpe * vol / (bps / 10000);

  // Stylized: cost vs turnover, fixed gross Sharpe
  const turnPath = Array.from({ length: 100 }, (_, i) => i * 8 / 99);
  const W = 320, H = 150, P = 24;
  const sx = (t) => P + (t / 8) * (W - 2 * P);
  const sy = (s) => H - P - ((s - (-0.5)) / (1.5)) * (H - 2 * P);
  const path = turnPath.map(t => {
    const d = (bps / 10000) * t / vol;
    return `${sx(t).toFixed(1)},${sy(grossSharpe - d).toFixed(1)}`;
  }).join(' ');

  return (
    <Card id="costs" icon={Receipt} title="Transaction costs at retail scale" accent="rose" index={14}
          subtitle="At retail, bid-ask + commissions + slippage = ~5-15bps round-trip on liquid US ETFs/futures, 30-100bps on illiquid names. Cost ceiling on Sharpe = gross Sharpe × σ / cost. Above that, you're feeding the broker, not yourself.">
      <MinSchema>
        Net realized Sharpe is bounded above by:{' '}
        <Eq>{'\\co{\\text{Sharpe}_{net}} = \\co{\\text{Sharpe}_{gross}} - \\frac{\\hi{\\text{turnover} \\cdot \\text{cost}}}{\\vi{\\sigma}}'}</Eq>{' '}
        Above the cost ceiling <Eq>{'\\text{turnover}_{max} = \\frac{\\sigma \\cdot \\text{Sharpe}_{gross}}{\\text{cost}}'}</Eq>{' '}
        the strategy is net negative.
      </MinSchema>

      <Block>{'\\co{\\text{drag}} = \\hi{\\tau} \\cdot \\hi{c}, \\quad \\co{\\Delta\\text{Sharpe}} = \\frac{\\hi{\\tau \\cdot c}}{\\vi{\\sigma}}'}</Block>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-300 font-mono">round-trip cost (bps)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{bps} bps</span>
            </div>
            <input type="range" min="1" max="50" step="1" value={bps}
              onChange={(e) => setBps(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>1 · institutional</span><span>5 · retail SPY/QQQ</span><span>20 · mid-cap</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">turnover (× per year)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{turnover.toFixed(1)}×</span>
            </div>
            <input type="range" min="0.1" max="8" step="0.1" value={turnover}
              onChange={(e) => setTurnover(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0.5 · core</span><span>2 · factor</span><span>5 · trend</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">gross Sharpe</span>
              <span className="text-neutral-300 font-mono tabular-nums">{grossSharpe.toFixed(2)}</span>
            </div>
            <input type="range" min="0.0" max="1.5" step="0.05" value={grossSharpe}
              onChange={(e) => setGrossSharpe(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-cyan-300 font-mono">strategy vol σ</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(vol * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.04" max="0.30" step="0.01" value={vol}
              onChange={(e) => setVol(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Stat label="cost drag" value={`${(drag * 100).toFixed(2)}%`} sub="ann. return loss" color="text-rose-300" />
            <Stat label="ΔSharpe" value={`-${dragSharpe.toFixed(2)}`} sub="loss in Sharpe units" color="text-rose-300" />
            <Stat label="net Sharpe" value={netSharpe.toFixed(2)} sub={netSharpe > 0 ? 'still positive' : 'underwater'} color={netSharpe > 0 ? 'text-emerald-300' : 'text-rose-400'} />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            Turnover ceiling at this cost: <span className="font-mono text-amber-300">{turnoverMax.toFixed(1)}×/yr</span>{' '}
            &mdash; above that, fees eat the entire alpha.
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">net Sharpe vs annual turnover</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
            <line x1={P} x2={W - P} y1={sy(0)} y2={sy(0)} stroke="#737373" strokeWidth="0.5" strokeDasharray="2,3" />
            <text x={P + 2} y={sy(0) - 3} fontSize="8" fill="#737373" fontFamily="monospace">break-even</text>
            <polyline points={path} fill="none" stroke="#fb7185" strokeWidth="1.4" />
            {/* current marker */}
            <circle cx={sx(turnover)} cy={sy(netSharpe)} r="3" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1" />
            <text x={sx(turnover)} y={sy(netSharpe) - 6} fontSize="8" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">your strat</text>
            {/* x-axis */}
            {[0, 2, 4, 6, 8].map(t => (
              <text key={t} x={sx(t)} y={H - 8} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="monospace">{t}×</text>
            ))}
            <text x={P} y={20} fontSize="8" fill="#a3a3a3" fontFamily="monospace">net Sharpe</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · TSMOM at 300% turnover, 8bps cost, σ=12%">
        <p>
          Cost drag = 3.0 × 0.0008 = 0.24% of capital per year. Sharpe drag = 0.24% / 12% = 0.02
          Sharpe units. With gross 0.55 → net 0.53. <em>Trend is robust to cost</em> because its
          gross Sharpe is high relative to per-trade economics.
        </p>
        <p>
          Same math for a 10-bps-cost stat-arb at 1000% turnover: drag = 1.0%, Sharpe drag = 0.10
          → must have gross Sharpe &gt; 0.10 to be alive. For real retail stat-arb with 30bps
          spreads on small-caps and 1500% turnover: drag = 4.5%, Sharpe drag = 0.45 — needs gross
          Sharpe of 1.0+ just to break even. That&apos;s why retail stat-arb is dead.
        </p>
      </Worked>

      <Misconception
        wrong="Commissions are zero now (Robinhood / IBKR free) — t-cost is solved."
        right="Commissions are ~zero. Bid-ask spread is not, and is the dominant cost. SPY ~1bp spread; less liquid ETFs (VLUE, MTUM) ~3-5bps; small-cap names 30-100bps; B3 mid-cap stocks 50-200bps. Round-trip cost is 2× one-way. Always."
        because="The 'free trading' headline obscures payment-for-order-flow and HFT internalization which means retail orders execute at slightly worse prices than the visible NBBO. Effective bid-ask is a real cost paid silently. For high-turnover strategies, this is by far the largest hidden drag — much larger than commissions ever were."
      />

      <WhenItMatters>
        For any sleeve with annual turnover &gt; 100%. The cost ceiling tells you whether the
        strategy is realistically harvest-able at retail. A momentum strategy with 300% turnover
        on small-caps (40bp spread) needs 1.0+ Sharpe gross to break even &mdash; and that
        doesn&apos;t exist. Use the ETF wrapper instead.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Effective spread vs quoted spread.</strong> Quoted spread is what you see;
          effective spread is what you pay. Retail orders typically execute at the midpoint
          minus a small fraction; effective ≈ 0.6× quoted on liquid ETFs. For momentum-driven
          turnover, the executed-vs-decision price difference (<Term>implementation shortfall</Term>)
          is usually 1-3bps of spread on top of quoted spread.
        </p>
        <p>
          <strong>Market impact at retail isn&apos;t.</strong> Square-root impact{' '}
          <Eq>{'\\Delta p \\approx \\sigma_{daily} \\cdot \\sqrt{Q/\\text{ADV}}'}</Eq>{' '}
          (Almgren-Chriss). For retail orders &lt;1% of daily volume, market impact is &lt;0.5bp
          and dominated by spread. At &gt;5% of ADV, impact dominates. Retail at &lt;$1M per
          ticker rarely hits this.
        </p>
        <p>
          <strong>Tax as the real cost.</strong> For BR investors swinging US equities/ETFs at a
          foreign broker, the IRPF on monthly gains can dominate t-cost: 15% on swing trade
          equities, 20% on day trade, 22.5%-15% on Tesouro depending on horizon.{' '}
          <CrossLink to="tax" recap="Tax frictions at retail: BR rates, foreign-broker IRPF; how turnover compounds tax drag.">tax detail &rarr;</CrossLink>{' '}
          A 100% turnover strategy in a taxable account loses ~15% of its annual gain to tax;
          that&apos;s a ~2-3pt Sharpe haircut for typical retail vols.
        </p>
        <p>
          <strong>Commissioned futures vs free ETFs.</strong> CME mini commissions are ~$1.50 per
          side. On a $100k notional /ES contract, that&apos;s 0.15bps round-trip &mdash; 5× cheaper
          than the SPY ETF spread. For high-turnover trend strategies at scale, futures are the
          right wrapper. For low-turnover positions, ETF is fine.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I estimate my actual round-trip cost?',
          a: 'Look at executed price vs midpoint at the moment of order. Average over 50+ trades. For ETFs you\'ll typically see 1-5bps round-trip; for individual stocks 5-30bps depending on size and liquidity. Retail brokers don\'t hide it — they just don\'t advertise it.' },
        { q: 'When does it make sense to trade futures over ETFs?',
          a: 'When (a) you need high turnover (futures commissions are 1/5th the ETF spread for fast strategies) AND (b) you have enough capital to hold initial margin (usually $10-50k per contract block). Below ~$200k bankroll, ETFs are usually right; above, futures start to win on cost.' },
        { q: 'What\'s the cheapest way to access a factor like momentum?',
          a: 'MTUM at 0.15% per year + zero turnover from your perspective (rebalancing is internal to the ETF, no taxable event for you). DIY momentum with ~300% turnover at 8bps = 2.4% drag — 16× more expensive. The ETF wrapper is unambiguously cheaper for retail.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   15 — WALK-FORWARD VALIDATION & OVERFITTING
   Time-respecting CV. Look-ahead bias. Multiple-testing inflation. Deflated
   Sharpe. The honesty layer for any backtest.
   ========================================================================== */

const BacktestCard = () => {
  const [scheme, setScheme] = useState('walk');
  const [embargo, setEmbargo] = useState(2);
  const [trials, setTrials] = useState(20);
  const [bestSharpe, setBestSharpe] = useState(0.85);

  // visualize CV scheme on a 60-month timeline
  const N = 60;
  const cells = useMemo(() => {
    const out = [];
    if (scheme === 'random') {
      // 5 random folds
      const rand = mulberry32(1);
      const fold = Array.from({ length: N }, () => Math.floor(rand() * 5));
      for (let f = 0; f < 5; f++) {
        out.push({ fold: f, train: fold.map(x => x !== f), test: fold.map(x => x === f) });
      }
    } else if (scheme === 'walk') {
      // walk-forward: 24m train → 6m test, advance 6m
      for (let f = 0; f < 5; f++) {
        const trainStart = 0, trainEnd = 24 + f * 6;
        const testStart = trainEnd + embargo, testEnd = Math.min(N, testStart + 6);
        const train = Array.from({ length: N }, (_, i) => i >= trainStart && i < trainEnd);
        const test = Array.from({ length: N }, (_, i) => i >= testStart && i < testEnd);
        out.push({ fold: f, train, test });
      }
    } else if (scheme === 'expand') {
      // expanding: train [0..t], test [t..t+6]
      for (let f = 0; f < 5; f++) {
        const trainEnd = 24 + f * 6;
        const testStart = trainEnd + embargo, testEnd = Math.min(N, testStart + 6);
        const train = Array.from({ length: N }, (_, i) => i < trainEnd);
        const test = Array.from({ length: N }, (_, i) => i >= testStart && i < testEnd);
        out.push({ fold: f, train, test });
      }
    }
    return out;
  }, [scheme, embargo]);

  // Deflated Sharpe: the best of N trials with σ_S of trial Sharpes is biased upward by ~σ_S * E[max-of-N]
  // E[max of N standard normals] ≈ √(2 ln N) - (γ + ln(2π)/2) / √(2 ln N)
  const eMax = Math.sqrt(2 * Math.log(trials)) - (0.5772 + 0.5 * Math.log(2 * Math.PI)) / Math.sqrt(2 * Math.log(trials));
  // Sharpe is asy normal with se ≈ 1/√(T*12) for monthly with T years; assume T=5 → SE ≈ 0.13
  const seSharpe = 0.13;
  const expectedMax = eMax * seSharpe;
  const deflated = bestSharpe - expectedMax;

  return (
    <Card id="backtest" icon={Hourglass} title="Walk-forward & overfitting honesty" accent="violet" index={15}
          subtitle="Random k-fold leaks the future. Walk-forward and expanding-window are the only honest CV for time-series. The best of N trials is biased up by σ_Sharpe × √(2 ln N); deflated Sharpe corrects it.">
      <MinSchema>
        <Term>Walk-forward CV</Term> trains on past, validates on future, advances. Embargo = gap
        of K months between train and test to absorb feature look-ahead. The best Sharpe across
        N candidate strategies is biased upward by{' '}
        <Eq>{'\\hi{\\mathbb{E}[\\max_{i \\le N} \\hat{S}_i] \\approx \\sigma_S \\sqrt{2 \\ln N}}'}</Eq>;{' '}
        <Term>deflated Sharpe</Term> subtracts it.
      </MinSchema>

      <Block>{'\\co{\\hat{S}_{deflated}} = \\hat{S}_{max} - \\sigma_{\\hat{S}} \\cdot \\left(\\sqrt{2 \\ln N} - \\frac{\\gamma + \\ln(2\\pi)/2}{\\sqrt{2 \\ln N}}\\right) - \\text{skew/kurt corrections}'}</Block>

      <div className="mt-3 flex flex-wrap gap-2">
        {[['random', 'Random k-fold (LEAKS)'], ['walk', 'Walk-forward'], ['expand', 'Expanding window']].map(([k, lab]) => (
          <button key={k} onClick={() => setScheme(k)}
            className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${scheme === k ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {lab}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">CV scheme · 60 months · 5 folds</div>
        {cells.map((c) => (
          <div key={c.fold} className="flex gap-[1px] mb-1">
            {Array.from({ length: N }, (_, i) => (
              <div key={i} className="h-3 flex-1"
                style={{ background: c.train[i] ? '#7dd3fc' : c.test[i] ? '#fda4af' : 'rgba(255,255,255,0.04)', borderRadius: 1 }}
                title={`fold ${c.fold + 1} m${i}: ${c.train[i] ? 'train' : c.test[i] ? 'test' : 'embargo/none'}`} />
            ))}
          </div>
        ))}
        <div className="flex gap-3 text-[10px] text-neutral-500 mt-2 font-mono">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2" style={{background:'#7dd3fc'}} />train</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2" style={{background:'#fda4af'}} />test</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2" style={{background:'rgba(255,255,255,0.04)'}} />embargo</span>
        </div>
        {scheme === 'random' && (
          <div className="mt-2 text-[11px] text-rose-300 leading-snug">
            ⚠ Notice how train cells appear AFTER test cells in time on every row. That&apos;s the leak:
            you train on data that happened after the test date.
          </div>
        )}
      </div>

      {scheme !== 'random' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-amber-300 font-mono">embargo (months)</span>
            <span className="text-neutral-300 font-mono tabular-nums">{embargo}</span>
          </div>
          <input type="range" min="0" max="6" step="1" value={embargo}
            onChange={(e) => setEmbargo(parseInt(e.target.value))} className="rq-range w-full" />
        </div>
      )}

      <div className="mt-5 rounded-md border border-fuchsia-400/25 bg-fuchsia-400/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">multiple-testing inflation</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 items-start">
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-fuchsia-200 font-mono">N · trials run (param-search size)</span>
                <span className="text-neutral-300 font-mono tabular-nums">{trials}</span>
              </div>
              <input type="range" min="1" max="500" step="1" value={trials}
                onChange={(e) => setTrials(parseInt(e.target.value))} className="rq-range w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-emerald-300 font-mono">best in-sample Sharpe</span>
                <span className="text-neutral-300 font-mono tabular-nums">{bestSharpe.toFixed(2)}</span>
              </div>
              <input type="range" min="0.2" max="2.0" step="0.05" value={bestSharpe}
                onChange={(e) => setBestSharpe(parseFloat(e.target.value))} className="rq-range w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="E[max bias]" value={`+${expectedMax.toFixed(2)}`} sub={`from ${trials} trials`} color="text-rose-300" />
            <Stat label="deflated Sharpe" value={deflated.toFixed(2)} sub={deflated > 0.3 ? 'plausible edge' : 'noise / overfit'} color={deflated > 0.3 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-neutral-400 leading-snug">
          A 0.85 Sharpe in your best-of-{trials} backtest, after deflation, becomes
          <span className="font-mono text-emerald-300"> {deflated.toFixed(2)}</span>. That&apos;s
          your honest expectation out-of-sample. If it&apos;s &lt;0.3, you don&apos;t have an edge
          &mdash; you have an overfit.
        </div>
      </div>

      <Worked title="Worked example · 'I tested 50 momentum lookbacks; the best had Sharpe 1.0'">
        <p>
          50 trials. Sharpe SE ≈ 0.13 (5 years monthly). E[max of 50] ≈
          √(2·ln 50) − γ/√(2·ln 50) ≈ 2.80 − 0.21 ≈ 2.6. Bias = 2.6 × 0.13 ≈ 0.34.
          Deflated Sharpe = 1.0 − 0.34 = <span className="font-mono text-amber-300">0.66</span>{' '}
          &mdash; still impressive but not the 1.0 you started with.
        </p>
        <p>
          Now suppose your real OOS Sharpe in the next 5 years comes in at 0.4. That&apos;s
          consistent with deflated 0.66 having SE ≈ 0.13 &mdash; not a strategy collapse,
          just regression to the mean. <em>Most retail backtest disappointment is multiple-testing
          inflation, not data drift</em>.
        </p>
      </Worked>

      <Misconception
        wrong="My backtest has Sharpe 1.5 — this is a great strategy."
        right="Without knowing how many variants you tested, the Sharpe is meaningless. If you tested 1, that's plausible alpha. If you tested 1,000, the deflated Sharpe is ~0.5 even with the best of 1,000 hitting 1.5. Always report the search space, not just the winner."
        because="Backtest overfitting is a near-universal problem in retail strategy development. The mind explores parameter space until something works. The 'something' is selected post-hoc, which inflates its apparent Sharpe. Deflated Sharpe is the simplest correction; combinatorial-purged CV is the more rigorous one."
      />

      <WhenItMatters>
        Whenever you&apos;ve tuned ANY parameter on the data. Look-back, threshold, holding period
        &mdash; even &ldquo;I picked the best of value/momentum/quality&rdquo; counts as 3 trials.
        Without deflation, every backtest is biased up. With deflation, you might find that your
        edge isn&apos;t real &mdash; the saving move.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>CPCV: Combinatorial Purged Cross-Validation.</strong>{' '}
          (López de Prado 2018) Generate many train/test splits that respect time, with purging
          (drop train samples whose label periods overlap with test) and embargo (gap between
          train end and test start). Reports the distribution of OOS Sharpes across all splits;
          the median is your honest expectation, not the mean.
        </p>
        <p>
          <strong>Deflated Sharpe with skew &amp; kurtosis.</strong>{' '}
          <Eq>{'\\hat{S}_{def} = \\hat{S}\\,\\sqrt{T-1}\\bigg/\\sqrt{1 - \\hat{\\gamma}_3 \\hat{S} + \\frac{\\hat{\\gamma}_4 - 1}{4}\\hat{S}^2}'}</Eq>{' '}
          where γ₃, γ₄ are skewness and kurtosis. Strategies with negative skew (vol-selling) get
          extra haircuts; strategies with positive skew (trend) less so. The full deflation also
          accounts for the number of trials.
        </p>
        <p>
          <strong>Sibling explainers.</strong>{' '}
          <CrossLink to="bettors-stack" external recap="Bettors-stack: walk-forward CV, deflated Sharpe applied to sports betting backtests.">The Bettor&apos;s Stack</CrossLink>{' '}
          covers the same toolkit applied to sports betting (deflated Sharpe of bettor strategies,
          walk-forward over a season).{' '}
          <CrossLink to="forecasters-craft" external recap="Forecasters-craft: walk-forward & multiple-testing applied to forecasting model validation.">Forecaster&apos;s Craft</CrossLink>{' '}
          shows how it constrains feature selection in time-series ML.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How big should the embargo be?',
          a: 'For monthly-rebalanced strategies on monthly data: 1-3 months. For features derived from rolling-window stats with K-month windows: at least K months. The right answer is "longer than any look-ahead in your features." When in doubt, longer is safer; the cost is a few percent of training data.' },
        { q: 'What if I genuinely tested only one strategy?',
          a: 'You probably didn\'t. Counting honestly includes: (a) every parameter tweak, (b) every "let me also try" addition to the universe, (c) every restart after the first version disappointed. A real "I tested 1 thing" is rare. Default to assuming 10-50 trials.' },
        { q: 'Is there a fast practical rule for retail?',
          a: 'After parameter selection, halve your in-sample Sharpe. After cross-strategy selection (picking the best of N strategies you tried), halve again. Net of costs and tax, halve a third time. If the result is still positive, the strategy might survive. If not, it won\'t.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   16 — TAX FRICTIONS (BR + foreign-broker)
   The cost most retail forgets. BR rates: 15% swing, 20% day-trade, regressive
   on bonds. Foreign-broker dividends/interest fall under IRPF carnê-leão.
   How turnover compounds tax drag.
   ========================================================================== */

const TaxCard = () => {
  const [turnover, setTurnover] = useState(1.5);
  const [grossRet, setGrossRet] = useState(0.08);
  const [vehicle, setVehicle] = useState('etf-foreign');

  // BR tax matrix
  const taxMap = {
    'etf-foreign':  { name: 'Foreign-broker ETF (e.g. MTUM at IBKR)', swing: 0.15, dividend: 0.275, taxOnTurnover: true,  note: 'Swing trade gain: 15% IR. Dividends/interest: carnê-leão progressive (max 27.5%). Taxed monthly via DARF.' },
    'br-stock':     { name: 'B3 stock or BDR · swing trade',          swing: 0.15, dividend: 0.0,   taxOnTurnover: true,  note: 'Swing: 15% on monthly net gain (R$20k+ exempt threshold). Dividends from BR companies: 0% (mas pode mudar com a reforma).' },
    'br-fii':       { name: 'FII (real estate fund)',                 swing: 0.20, dividend: 0.0,   taxOnTurnover: true,  note: 'FII gains: 20% (no exempt threshold for swings). Monthly distributions: 0%.' },
    'br-tesouro':   { name: 'Tesouro IPCA+ (10y hold)',                swing: 0.15, dividend: 0.0,   taxOnTurnover: false, note: 'Tabela regressiva: 22.5%→15% based on holding. 10y → 15%. Coupons taxed at same rate at receipt.' },
  };
  const v = taxMap[vehicle];

  const annTaxOnGain = v.taxOnTurnover ? turnover * grossRet * v.swing : grossRet * v.swing;
  const netRet = grossRet - annTaxOnGain;

  return (
    <Card id="tax" icon={Percent} title="Tax frictions · BR + foreign-broker IRPF" accent="amber" index={16}
          subtitle="The cost most retail forgets. BR: 15% swing trade equities, 20% day trade, 22.5%→15% regressive on bonds. Foreign-broker dividends/interest = carnê-leão (max 27.5%). Turnover compounds tax drag.">
      <MinSchema>
        Brazilian retail investors face two tax regimes simultaneously: (i) <em>BR-listed assets</em>{' '}
        on B3 with monthly DARF on swing-trade gains, regressive table on bonds, exempt-threshold
        for stocks; (ii) <em>foreign-broker assets</em> with mandatory <Term>carnê-leão</Term>{' '}
        on dividends/interest at the progressive table. The IR rate × turnover is the tax drag.
      </MinSchema>

      <Block>{'\\co{r_{net}} = r_{gross} - \\hi{\\tau_{turnover} \\cdot \\text{IR}_{swing}} - \\hi{\\tau_{div} \\cdot \\text{IR}_{div}}'}</Block>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(taxMap).map(([k, vv]) => (
          <button key={k} onClick={() => setVehicle(k)}
            className={`text-left rounded-md border p-2 transition-colors ${vehicle === k ? 'bg-amber-500/15 border-amber-400/40' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
            <div className="text-[10px] text-neutral-300 leading-tight">{vv.name}</div>
            <div className="text-[10px] text-amber-200 font-mono mt-1">IR {(vv.swing * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] text-amber-100/90 leading-snug">
        {v.note}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-300 font-mono">gross ann. return</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(grossRet * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.02" max="0.20" step="0.005" value={grossRet}
              onChange={(e) => setGrossRet(parseFloat(e.target.value))} className="rq-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-300 font-mono">turnover (× per year)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{turnover.toFixed(1)}×</span>
            </div>
            <input type="range" min="0.0" max="5.0" step="0.1" value={turnover}
              onChange={(e) => setTurnover(parseFloat(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · buy-and-hold</span><span>1.5 · multi-strat</span><span>5 · trend</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="ann. tax drag" value={`${(annTaxOnGain * 100).toFixed(2)}%`} sub="of capital" color="text-rose-300" />
            <Stat label="net return" value={`${(netRet * 100).toFixed(1)}%`} sub={`gross ${(grossRet * 100).toFixed(1)}%`} color="text-emerald-300" />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug mt-1">
            Effective tax fraction: <span className="font-mono text-amber-300">{((annTaxOnGain / grossRet) * 100).toFixed(0)}%</span>{' '}
            of the gross return.
            {v.taxOnTurnover && turnover > 0.5 ? ' Higher turnover means each gain is taxed-and-paid sooner; you lose the deferred-tax compounding.' : ''}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">BR retail tax cheat-sheet</div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between"><span className="text-neutral-300">Stock swing trade (B3, &gt;R$20k/mo)</span><span className="font-mono text-amber-300">15%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">Stock day trade</span><span className="font-mono text-rose-300">20%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">FII gains (qualquer valor)</span><span className="font-mono text-amber-300">20%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">Tesouro &lt;6mo / 6-12mo / 12-24mo / &gt;24mo</span><span className="font-mono text-amber-300">22.5/20/17.5/15%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">FX gain (variação cambial &gt;US$5k)</span><span className="font-mono text-amber-300">15%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">Dividends from BR co.</span><span className="font-mono text-emerald-300">0%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">Foreign-broker dividends/interest</span><span className="font-mono text-rose-300">≤27.5%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">FII distributions (monthly)</span><span className="font-mono text-emerald-300">0%</span></div>
            <div className="flex justify-between"><span className="text-neutral-300">LCI / LCA</span><span className="font-mono text-emerald-300">0%</span></div>
          </div>
        </div>
      </div>

      <Worked title="Worked example · why factor ETFs in a foreign broker beat DIY in a BR taxable account">
        <p>
          DIY momentum at retail (300% turnover, 7% gross): tax drag = 3.0 × 7% × 15% = 3.15%.
          Net return = 3.85%. ETF MTUM (zero turnover for the holder, internal rebalance is
          tax-shielded by in-kind redemption): tax only on dividends ~1.5% × 27.5% = 0.41% +
          tax on YOUR sales (e.g. 20% turnover × ?). Total drag ≈ 1-1.5%.
        </p>
        <p>
          The ETF wrapper saves ~1.5-2pt of net return relative to DIY at retail. That&apos;s a
          structural advantage; the ETF&apos;s 15bps fee is dwarfed by its tax efficiency.
        </p>
        <p>
          For a BR taxpayer at a foreign broker: dividends from US ETFs are subject to (i) US
          withholding 30% (foreigners), (ii) BR carnê-leão progressive on the gross (you offset
          the 30% as foreign tax credit). For high-tax-band investors the net dividend tax is
          ~27.5%; for low-band ~15%. Capital gains: 15% on the BR side (foreign tax credit
          if any was withheld, often zero on capital gains).
        </p>
      </Worked>

      <Misconception
        wrong="The headline 15% rate means I lose 15% of my returns to tax."
        right="The drag is turnover × IR. For a buy-and-hold 0% turnover, you pay tax only when you sell — so deferred for years/decades and the drag is much smaller than 15%. For 300% turnover, each $1 of profit is realized 3× per year and taxed each time; the effective tax drag is closer to 30-40%."
        because="Tax on a one-time gain reduces it once. Tax on a 3×-per-year-realized gain compounds into a much higher effective rate via lost compounding on the after-tax part. The math: at 7% gross / 300% turnover / 15% IR, you keep 5.95%/yr realized; at 0% turnover (held until horizon), you keep 7%/yr until liquidation, then pay once. After 10 years the 0%-turnover wallet has 1.07^10 - 1 = 96.7% gross; the 300%-turnover wallet has 1.0595^10 - 1 = 78.0%."
      />

      <WhenItMatters>
        Always &mdash; tax drag silently steals 0.5-3% per year on a high-turnover portfolio. For
        retail, the tax-aware structure is: ETF wrappers for high-turnover sleeves (factor /
        trend), direct holdings for buy-and-hold (strategic core), Tesouro for 10y+ horizon (15%
        rate via tabela regressiva). Match the wrapper to the strategy&apos;s turnover.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>BR foreign-broker reporting.</strong> Monthly: <em>carnê-leão</em> on dividends
          and interest received in the previous month, paid via DARF by last business day of
          following month. Annually: <em>declaração de bens</em> (the foreign holdings) +
          <em> Capital Gains Worksheet</em> (gains realized).{' '}
          <em>Don&apos;t skip months</em> &mdash; the late-payment penalty is 0.33%/day capped at
          20%, plus 1% per month interest.
        </p>
        <p>
          <strong>Foreign tax credit.</strong> US withholds 30% on dividends to foreigners by
          default; if you complete W-8BEN with treaty status, it drops to 15%. The 15-30%
          already paid is creditable against your BR carnê-leão obligation, so the marginal
          extra is 0-12.5% depending on band.
        </p>
        <p>
          <strong>The R$20k/month exempt threshold.</strong> For BR-listed stocks (excluding
          ETFs and BDRs), a monthly net swing-trade gain &lt; R$20k is fully exempt from IR.
          Stays as a residual benefit for small BR-stock holdings, but doesn&apos;t apply to FIIs,
          BDRs, ETFs, day-trade, or foreign-broker assets.
        </p>
        <p>
          <strong>Coming reforms (2026-2033).</strong> The BR tax reform may introduce dividend
          taxation on BR-listed equities at 15%, harmonize FII rules, and adjust foreign-asset
          reporting. The retail-quant impact is mostly on the dividend-yield value of BR stocks
          and FIIs.{' '}
          <CrossLink to="tributacao-brasil" external recap="The full BR corporate-tax explainer covers the federal/state/municipal three-tier system, the 2026-2033 reform path, and the reform's impact on different sectors.">tributação Brasil &rarr;</CrossLink>
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I use offshore (Cayman) or onshore (BR) for the foreign book?',
          a: 'For most retail (under ~R$5M), onshore via foreign broker is fine — BR taxes are paid as outlined above. Offshore-via-Cayman LLC adds complexity (LLC accounting, US W-8BEN-E) and saves you mostly on inheritance/estate tax planning, not income tax. The break-even is high — typically only worth it past R$5M+ or for estate-planning reasons.' },
        { q: 'Does PJ vs PF make sense for trading?',
          a: 'For pure financial trading: no — PJ has its own income tax rates, plus PIS/COFINS, plus the lucro presumido vs lucro real choice. Pure financial gains are best in PF for retail; PJ makes sense only if the trading is part of an actual business with operational expenses to offset.' },
        { q: 'How does the new "imposto sobre dividendos" affect this?',
          a: 'As of mid-2025, the dividend tax bill (PL 1087/2025) proposes 15% on dividends from BR-listed equities for individuals receiving more than R$50k/month. For most retail under that threshold, it doesn\'t change. Above it, it brings BR equity dividend taxation closer to international norms (US 15-20% LTCG on qualified dividends).' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   17 — CURRENCY EXPOSURE: BRL carry, USD as natural hedge
   For a BR investor, unhedged USD exposure pays a structural carry-vs-tail
   profile. Decide your hedge ratio explicitly.
   ========================================================================== */

const FxCard = () => {
  const [usdShare, setUsdShare] = useState(70);
  const [hedgeRatio, setHedgeRatio] = useState(0);

  // Approx historical: BRL/USD vol ~ 16%, mean BRL devaluation ~ 6%/yr (last 30y)
  const fxVol = 0.16;
  const fxDrift = 0.04; // expected BRL/USD up = USD appreciation = positive for unhedged BR holder
  const usdHedgeCost = 0.075; // forward points / hedge cost ~ DI - SOFR ~ 7.5%/yr

  const usdRet = 0.07; // USD-denominated portfolio return
  const fxComponent = fxDrift * (1 - hedgeRatio / 100) - usdHedgeCost * (hedgeRatio / 100) * (usdShare / 100);
  const portRetBr = (usdShare / 100) * usdRet + (1 - usdShare / 100) * 0.08 + (usdShare / 100) * fxComponent;
  const portVolBr = Math.sqrt(
    Math.pow((usdShare / 100) * 0.12, 2) // USD-denominated portfolio vol
    + Math.pow((1 - usdShare / 100) * 0.14, 2) // BR-side vol
    + Math.pow((usdShare / 100) * (1 - hedgeRatio / 100) * fxVol, 2) // FX vol of unhedged portion
  );

  return (
    <Card id="fx" icon={Globe2} title="Currency exposure · BRL carry, USD as natural hedge" accent="cyan" index={17}
          subtitle="A BR investor with BRL liabilities holding USD assets has unhedged FX as a structural carry trade — pays in calm regimes, bites in crises. Hedging via NDFs costs ~7.5%/yr (the DI-SOFR gap). Decide the hedge ratio explicitly.">
      <MinSchema>
        For a BR investor, unhedged USD exposure has two effects:{' '}
        <em>structural appreciation</em> (BRL depreciates vs USD ~4-6%/yr long-run on average)
        and <em>idiosyncratic FX vol</em> (~16% annual). Hedging via NDF/forward costs ~7.5%/yr
        (the BR-US rate differential). Net: hedging is structurally negative-EV but tail-protective.
      </MinSchema>

      <Block>{'\\co{r_{BR}^{port}} = w_{USD} \\cdot r_{USD} + (1 - w_{USD}) \\cdot r_{BR} + w_{USD} \\cdot \\left[\\hi{(1-h)}\\,\\Delta\\text{FX} - \\hi{h}\\,c_{hedge}\\right]'}</Block>

      <Predict question="At usdShare=70%, hedgeRatio=0%, BRL devaluing 4%/yr on average — what's the contribution of unhedged FX to the BR-equivalent portfolio return?">
        +2.8 pp (= 70% × 4%). That&apos;s a real boost to the BRL-denominated return for the BR
        investor, paid as compensation for absorbing FX vol. The cost: in a 2002 / 2015 / 2020-style
        BRL-strength shock, that same 70% USD position can lose 15-25% in BRL terms in a quarter.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-cyan-300 font-mono">USD share of portfolio</span>
              <span className="text-neutral-300 font-mono tabular-nums">{usdShare}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={usdShare}
              onChange={(e) => setUsdShare(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · pure BR</span><span>50 · balanced</span><span>100 · pure USD</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-300 font-mono">FX hedge ratio</span>
              <span className="text-neutral-300 font-mono tabular-nums">{hedgeRatio}% hedged</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={hedgeRatio}
              onChange={(e) => setHedgeRatio(parseInt(e.target.value))} className="rq-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>0 · unhedged</span><span>50 · half</span><span>100 · fully hedged</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="port. return (BRL)" value={`${(portRetBr * 100).toFixed(1)}%`} sub="incl. FX drift" color="text-emerald-300" />
            <Stat label="port. vol (BRL)" value={`${(portVolBr * 100).toFixed(1)}%`} sub="incl. FX vol" color="text-amber-300" />
            <Stat label="FX drag if hedged" value={`-${(usdHedgeCost * (hedgeRatio / 100) * (usdShare / 100) * 100).toFixed(2)}%`} sub="hedge cost" color="text-rose-300" />
            <Stat label="Sharpe (BRL)" value={(portRetBr / portVolBr).toFixed(2)} sub="port-of-port" color="text-fuchsia-300" />
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug mt-1">
            Hedging takes a structural ~3pp/yr drag (ratio × hedge cost). It&apos;s worth it
            only if you have BRL liabilities that <em>require</em> a defined nominal stream
            (housing finance, kids&apos; tuition in BRL). For pure investing-for-the-long-haul,
            unhedged is usually the right answer.
          </div>
        </div>

        <svg viewBox="0 0 320 180" className="w-full h-auto">
          <text x={20} y={18} fontSize="9" fill="#a3a3a3" fontFamily="monospace">portfolio decomposition (BRL)</text>
          {(() => {
            const total = (usdShare / 100) * usdRet + (1 - usdShare / 100) * 0.08;
            const fxAdd = fxComponent * (usdShare / 100);
            const segs = [
              { v: (usdShare / 100) * usdRet, c: '#7dd3fc', lab: 'USD assets' },
              { v: (1 - usdShare / 100) * 0.08, c: '#86efac', lab: 'BR assets' },
              { v: (usdShare / 100) * fxDrift * (1 - hedgeRatio / 100), c: '#fbbf24', lab: 'FX drift' },
              { v: -(usdShare / 100) * usdHedgeCost * (hedgeRatio / 100), c: '#fb7185', lab: 'hedge cost' },
            ];
            const sumPos = segs.reduce((s, d) => s + Math.max(0, d.v), 0);
            const sumNeg = segs.reduce((s, d) => s + Math.max(0, -d.v), 0);
            const scale = 200 / Math.max(0.05, Math.max(sumPos, sumNeg) + 0.01);
            let xPos = 60, xNeg = 60;
            return segs.map((d, i) => {
              const w = Math.abs(d.v) * scale;
              const y = 35 + i * 32;
              const xrect = d.v < 0 ? 60 - w : 60;
              return (
                <g key={i}>
                  <text x={55} y={y + 12} fontSize="9" textAnchor="end" fill="#a3a3a3" fontFamily="monospace">{d.lab}</text>
                  <rect x={xrect} y={y} width={w} height={18} fill={d.c} fillOpacity="0.6" stroke={d.c} strokeOpacity="0.9" />
                  <text x={xrect + (d.v < 0 ? -4 : w + 4)} y={y + 12} fontSize="9" textAnchor={d.v < 0 ? 'end' : 'start'} fill="#e5e5e5" fontFamily="monospace">{(d.v >= 0 ? '+' : '') + (d.v * 100).toFixed(2)}%</text>
                </g>
              );
            });
          })()}
          <line x1={60} x2={60} y1={32} y2={170} stroke="#525252" strokeWidth="0.5" />
        </svg>
      </div>

      <Worked title="Worked example · BRL crash and USD diversification">
        <p>
          2014-2015 BRL devaluation: USD/BRL went from 2.30 to 4.20 in 18 months. A BR investor
          with 50% in USD assets (S&amp;P) saw S&amp;P up ~15% in USD, but the FX move alone
          contributed +83% in BRL on the USD slice. Total BRL return on the USD slice: ~110%.
          The BR slice (Ibovespa) was down ~30% over the same period in BRL.
        </p>
        <p>
          The portfolio outcome depends sharply on hedge ratio. Fully unhedged: the USD slice
          delivered massive BRL returns. Fully hedged: only the +15% USD-denominated return,
          minus the ~10% accumulated hedge cost = +5% in BRL. The hedge would have <em>cost</em>{' '}
          you ~100pp during the BRL devaluation event.
        </p>
        <p>
          The reverse 2002 episode (BRL strengthening from 4.0 to 1.6 over 2003-2007): unhedged
          USD lost ~60% in BRL terms; the hedger paid the carry cost but kept the underlying
          return. The lesson: unhedged USD is asymmetric carry trade &mdash; pays in BRL crashes,
          pays a steady carry on average, but bleeds in BRL strength regimes.
        </p>
      </Worked>

      <Misconception
        wrong="I should always hedge FX — it removes a non-investment risk."
        right="The carry cost (BR rates − US rates ~ 7.5pp) is a real, structural negative drag. Over 10+ years that compounds enormously. Hedging makes sense only if (a) you have BRL liabilities that need to be matched, or (b) you can't tolerate the BRL-strength tail loss. For a pure long-horizon BR retail investor, partial or zero hedging usually wins."
        because="Forwards & NDFs price the rate differential. You're paying the BR-US gap (currently ~7.5%) per year for the privilege of locking the exchange rate. That carry cost is pure friction. The unhedged investor earns the expected BRL devaluation (~4%/yr long-run) while paying the 16% FX vol cost — a structurally positive risk premium for the BR investor."
      />

      <WhenItMatters>
        Whenever the foreign-currency share of your book exceeds ~30%. Below that, FX is noise on
        the margin; above, it&apos;s a strategic decision. The right hedge ratio depends on your
        liability mix, not on a market view.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The carry-trade math.</strong>{' '}
          <Eq>{'\\mathbb{E}[\\Delta \\text{FX}] = i_{BRL} - i_{USD}'}</Eq>{' '}
          (covered interest parity). The forward implies the rate differential. So hedging
          locks in a rate that already prices in the expected BRL devaluation &mdash; you can&apos;t
          escape the carry by hedging, you can only convert the random walk into a known cost.
          The risk premium comes from BRL devaluation realizing <em>more</em> than CIP implies, which
          historically it has on a 10y+ basis.
        </p>
        <p>
          <strong>Implementation: NDFs vs futures vs ETF wrappers.</strong> NDFs (non-deliverable
          forwards) settle in BRL at a fixed FX rate. WDO (B3 mini-dollar futures) is the listed
          analog. UCO (USD-hedged ETFs of foreign equities, e.g. IUSE: hedged S&amp;P) wraps the
          hedge inside the fund. WDO is most cost-efficient for retail (~0.5pp annualized friction
          on top of the rate diff); ETF-wrapped hedges are simpler but the embedded fee is 30-60bp.
        </p>
        <p>
          <strong>BRL behaviour in equity crashes.</strong> Counter-intuitively, BRL has tended
          to <em>weaken</em> in global risk-off episodes (Feb 2020, 2008-Oct, 2015-Dec). So
          unhedged USD is positively correlated with equity crashes <em>in BRL terms</em> &mdash;
          a stabilizer for the BR investor&apos;s book. This is a feature, not a bug: USD exposure
          provides crisis-hedge properties that BR-only investing doesn&apos;t.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I hedge any of the USD slice?',
          a: 'Most retail: no. Hedge only the portion you intend to spend in BRL within the next 1-3 years (e.g. tuition payment due in 18 months). The rest is long-horizon investing where the carry cost dominates.' },
        { q: 'What about EUR or GBP exposure?',
          a: 'Same math, smaller carry differential (BRL-EUR ~5pp, BRL-GBP ~5pp). EUR-denominated assets give you USD-correlated diversification with a slightly different cycle (the EUR has its own BRL relationship). 10-15% EUR exposure on top of 60-70% USD is a reasonable diversification.' },
        { q: 'Cripto / BTC as a hedge?',
          a: 'BTC has positive correlation to BRL stress (BR institutional capital outflow → BTC bid). But BTC has its own 60-80% vol that overwhelms the diversification benefit. As an FX hedge specifically, BTC is dominated by USD assets at much lower vol.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   18 — DRAWDOWN SURVIVAL & BEHAVIORAL
   The investor's actual experience: 30-50% peak-to-trough drawdowns happen.
   What it feels like, why diversification within the book matters more than
   within sleeves, and the behavioral risk that kills most retail strategies.
   ========================================================================== */

const DrawdownCard = () => {
  const [strategy, setStrategy] = useState('multi');

  const histories = {
    'eq': { name: 'Equity-only (60/40)', maxDD: 0.55, maxDDLength: 5, sharpe: 0.40, episodes: [
      { yr: '1929-32', dd: 0.85, len: 4 },
      { yr: '1973-74', dd: 0.45, len: 2 },
      { yr: '2000-02', dd: 0.50, len: 2.5 },
      { yr: '2008-09', dd: 0.55, len: 1.5 },
      { yr: '2022', dd: 0.25, len: 1 },
    ] },
    'multi': { name: 'Multi-strat (factors+trend+vol+core)', maxDD: 0.25, maxDDLength: 1.5, sharpe: 0.85, episodes: [
      { yr: '2008-09', dd: 0.18, len: 1 },
      { yr: '2018 vol', dd: 0.12, len: 0.3 },
      { yr: '2020 Mar', dd: 0.15, len: 0.5 },
      { yr: '2022', dd: 0.10, len: 0.7 },
    ] },
    'trend': { name: 'Pure trend', maxDD: 0.30, maxDDLength: 4, sharpe: 0.45, episodes: [
      { yr: '2009 Mar', dd: 0.20, len: 0.1 },
      { yr: '2017-19', dd: 0.30, len: 2 },
      { yr: '2020 Mar', dd: 0.25, len: 0.5 },
    ] },
    'vol': { name: 'Pure vol-selling', maxDD: 0.85, maxDDLength: 2, sharpe: 0.50, episodes: [
      { yr: '2008-09', dd: 0.55, len: 1 },
      { yr: '2018-Feb (Volmageddon)', dd: 0.85, len: 0.05 },
      { yr: '2020-Mar', dd: 0.40, len: 0.3 },
    ] },
  };
  const s = histories[strategy];

  return (
    <Card id="drawdown" icon={ShieldAlert} title="Drawdown survival & behavioral risk" accent="rose" index={18}
          subtitle="A 30-50% drawdown isn't an outlier — it's expected on any single-sleeve strategy. The multi-strat book caps drawdown at ~20-25% by diversification. Survive the drawdowns and the math compounds; sell at the bottom and it doesn't.">
      <MinSchema>
        Maximum drawdown is the rate-limiting reality of any strategy.{' '}
        <Eq>{'\\hi{\\text{maxDD}} \\approx 2 \\sigma_{ann} \\sqrt{T} \\cdot \\Phi^{-1}(0.99)'}</Eq>{' '}
        for Gaussian; the real number is 1.5-2× larger due to fat tails. The discipline test:
        will you stick with it through a maxDD that <em>will</em> happen?
      </MinSchema>

      <Block>{'\\co{\\text{maxDD}_{N}} \\;\\approx\\; \\sigma_{ann} \\cdot \\sqrt{2 \\ln N}'}</Block>
      <p className="text-[12px] text-neutral-500 -mt-2">
        Approximate distribution of the maximum drawdown of a Gaussian Brownian motion over N years.
        At σ=15%, N=20: maxDD ≈ 36%. Real strategies hit larger.
      </p>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(histories).map(([k, v]) => (
          <button key={k} onClick={() => setStrategy(k)}
            className={`text-left rounded-md border p-2 transition-colors ${strategy === k ? 'bg-rose-500/15 border-rose-400/40' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'}`}>
            <div className="text-[10px] text-neutral-300 leading-tight">{v.name}</div>
            <div className="text-[10px] text-rose-300 font-mono mt-1">maxDD {(v.maxDD * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-amber-300 font-mono">SR {v.sharpe.toFixed(2)}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-rose-400/20 bg-rose-400/5 p-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300">historical drawdown episodes &mdash; {s.name}</span>
        </div>
        <div className="space-y-2">
          {s.episodes.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-24 font-mono text-neutral-300">{e.yr}</div>
              <div className="flex-1 relative h-4 bg-white/[0.04] rounded-sm overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500/70 to-rose-400/30" style={{ width: `${e.dd * 100}%` }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-rose-100">{(e.dd * 100).toFixed(0)}%</span>
              </div>
              <div className="w-16 text-right font-mono text-amber-200 tabular-nums">{e.len}y</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-neutral-500">
          left: peak-to-trough loss; right: time to recover. Vol-selling shows the highest single-event
          drawdowns (~85% in Feb 2018 Volmageddon for naked vol-sellers); multi-strat books cap at ~20-25%.
        </div>
      </div>

      <Predict question="To recover from a 50% drawdown, how much does the portfolio need to gain?">
        <span className="font-mono text-rose-300">100%</span>. Asymmetry of compounding:{' '}
        <Eq>{'(1 - 0.5)(1 + x) = 1 \\Rightarrow x = 1.0'}</Eq>. A 30% drawdown needs 43% to
        recover; 50% needs 100%; 70% needs 233%. The deeper the drawdown, the more punishingly
        non-linear the recovery. <em>This is why preventing drawdown matters more than maximizing
        return</em>.
      </Predict>

      <Worked title="Worked example · holding multi-strat through 2022">
        <p>
          A 60/40 stock/bond book in 2022: equities −18%, bonds −13%, total ~−16%. The "diversifier"
          (bonds) offered no protection in an inflation regime. Multi-strat with trend sleeve: trend
          went +25% (long energy, short bonds, short stocks); the multi-strat book ended ~−5%
          because trend offset the equity/bond losses.
        </p>
        <p>
          Behavioral test: in October 2022 with the equity sleeve down 23% YTD, would you have rotated
          out of equities into bonds (the comforting move) or stayed disciplined? Most retail rotated
          and missed the November 2022 rally. The rule: <strong>your strategy is whatever you do
          when it&apos;s underwater, not what you do when it&apos;s winning.</strong>
        </p>
      </Worked>

      <Misconception
        wrong="If I stay disciplined and DCA in, I'll come out ahead."
        right="DCA-into-drawdown only helps if the strategy has a real positive expected return AND you can sustain the contributions through a multi-year underwater period. Two thirds of retail can't — they cut contributions, switch strategies, or rotate at the bottom. The behavioral discipline IS the strategy; without it, the math doesn't apply."
        because="The historical equity premium is real, but it's earned by people who held through 1929-1932 (-85% drawdown, 25-year recovery), 1973-74 (-45%), 1999-2009 (lost decade), 2007-2009 (-55%). Most published 'long-run returns' are conditional on never selling at the bottom. Survivorship of strategy and survivorship of investor are different things."
      />

      <WhenItMatters>
        Always &mdash; this is the layer where math meets human. The right question for any
        strategy: <em>what&apos;s the largest drawdown I&apos;m willing to ride through, and is
        the strategy&apos;s historical maxDD smaller than that?</em> If you can&apos;t answer
        the first, you don&apos;t know if you should run the second.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Recovery time scales nonlinearly.</strong> For a Gaussian Brownian return process
          with Sharpe S, the expected time to recover from a drawdown of size D is approximately{' '}
          <Eq>{'\\mathbb{E}[T_{rec}] \\approx -\\ln(1-D)/(S^2 \\sigma)'}</Eq>. At Sharpe 0.5 and σ=15%,
          a 30% drawdown takes ~1.6 years to recover; a 50% drawdown ~3.4 years. Higher-Sharpe
          strategies recover faster &mdash; that&apos;s a non-obvious benefit of risk-adjusted alpha
          beyond the headline return number.
        </p>
        <p>
          <strong>Why diversification across sleeves matters more than within.</strong> Within an
          equity sleeve, individual stock drawdowns average out but the systematic equity drawdown
          stays. Across sleeves with low correlation, the systematic exposures themselves cancel
          (trend goes up when equity goes down). The 2008 multi-strat book was protected
          because trend earned 30% while equities lost 35% &mdash; same year, opposite signs.
        </p>
        <p>
          <strong>Sequence risk in withdrawals.</strong> If you&apos;re withdrawing from the
          portfolio (retirement, living expenses), an early-cycle drawdown is much worse than a
          late-cycle one. The math: <Eq>{'r_{withdrawn}^{eff} = r - w/(1-DD_{cumulative})'}</Eq>{' '}
          &mdash; withdrawals from a drawdown-shrunk pile compound the loss. Defensive sleeves
          (core, vol, trend) are especially valuable in withdrawal phases.
        </p>
        <p>
          <strong>The "Calmar" metric.</strong>{' '}
          <Eq>{'\\text{Calmar} = r_{ann} / |maxDD|'}</Eq>{' '}
          captures the lived experience better than Sharpe. A strategy with 8% return and 10%
          maxDD (Calmar 0.8) feels qualitatively different from one with 12% return and 40%
          maxDD (Calmar 0.3) &mdash; even though the Sharpes might be similar.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I prepare emotionally for a 30% drawdown?',
          a: 'Pre-commit. Write down your strategy and rules BEFORE the drawdown happens; literally save a document dated today saying "I will not change my allocation for at least 12 months from any peak." Look at it during the drawdown. Trying to think rationally during a drawdown is like trying to do math while being chased — humans aren\'t built for it.' },
        { q: 'Should I cap maxDD with a stop-loss rule?',
          a: 'Generally no. Stop-losses on strategy-level positions tend to crystalize losses at the worst moment and miss the recovery. The exception is well-defined catastrophic-loss rules (e.g. "if total book down 40%, halve risk for 6 months") — these limit ruin without micromanaging.' },
        { q: 'What\'s the right Sharpe for a retail multi-strat book?',
          a: '0.7-1.0 net of costs and tax is the realistic target. Below 0.5 it\'s not worth the complexity over a passive 60/40 + tax-loss harvesting. Above 1.0 in retail is almost always overfit. Aim for the band where the math works AND the drawdowns stay below your discipline threshold.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   19 — ★ ANCHOR · the $250k 4-sleeve book end-to-end
   Synthesis card. Predict-then-reveal Sharpe, all sleeves laid out with
   weights, expected return / Sharpe / maxDD net of costs + BR tax + FX,
   10y equity curve, attribution.
   ========================================================================== */

const ANCHOR_BOOK = [
  { id: 'factor', name: 'Factor sleeve',     weight: 0.25, sharpeGross: 0.40, vol: 0.13, retGross: 0.052,
    notes: '25% MTUM + QUAL + VLUE + USMV blend. Annual rebalance to equal-weight.', accent: '#7dd3fc' },
  { id: 'trend', name: 'Trend sleeve',       weight: 0.20, sharpeGross: 0.55, vol: 0.10, retGross: 0.055,
    notes: '50/50 DBMF + KMLM. Internal trend-following on 22+ futures markets.', accent: '#fbbf24' },
  { id: 'vol', name: 'Vol-premium sleeve',   weight: 0.15, sharpeGross: 0.50, vol: 0.09, retGross: 0.045,
    notes: 'Cash-secured puts + covered calls on SPY/QQQ. Defined-risk credit spreads.', accent: '#f0abfc' },
  { id: 'core', name: 'Strategic core',      weight: 0.40, sharpeGross: 0.40, vol: 0.07, retGross: 0.028,
    notes: '50% Tesouro IPCA+ 2035 + 25% TIPS short + 25% AGG/IEF.', accent: '#67e8f9' },
];

const AnchorCard = () => {
  const [predicted, setPredicted] = useState(0.6);
  const [revealed, setRevealed] = useState(false);

  // Aggregate book metrics
  const totalW = ANCHOR_BOOK.reduce((s, x) => s + x.weight, 0);
  const grossRet = ANCHOR_BOOK.reduce((s, x) => s + x.weight * x.retGross, 0);

  // Variance assuming low pairwise correlation 0.10
  let portVar = 0;
  for (let i = 0; i < ANCHOR_BOOK.length; i++) {
    for (let j = 0; j < ANCHOR_BOOK.length; j++) {
      const corr = i === j ? 1 : 0.10;
      portVar += ANCHOR_BOOK[i].weight * ANCHOR_BOOK[j].weight * ANCHOR_BOOK[i].vol * ANCHOR_BOOK[j].vol * corr;
    }
  }
  const portVol = Math.sqrt(portVar);
  const grossSharpe = grossRet / portVol;

  // Cost + tax + FX drag
  const costDrag = 0.0040; // ~40bps blended (ETF expense + spread + commission)
  const taxDrag = 0.012; // ~1.2% on average for the mix (ETF tax-shielded; some realized)
  const fxDrag = 0.005; // small structural drag on the unhedged USD slice (Sharpe-cost)
  const netRet = grossRet - costDrag - taxDrag;
  const netSharpe = (netRet) / portVol;
  // expected maxDD ≈ 2.5σ_ann (conservative for fat-tail markets)
  const expMaxDD = 2.5 * portVol;

  // 10-year equity simulation
  const tenYrPath = useMemo(() => {
    const T = 120; // months
    const rand = mulberry32(2024);
    const path = [1];
    let s = 1;
    for (let i = 0; i < T; i++) {
      const z = boxMuller(rand);
      const monthly = netRet / 12 + (portVol / Math.sqrt(12)) * z;
      s *= 1 + monthly;
      path.push(s);
    }
    return path;
  }, [netRet, portVol]);

  // running drawdown
  const dd = useMemo(() => {
    let peak = tenYrPath[0];
    return tenYrPath.map(v => { peak = Math.max(peak, v); return (v - peak) / peak; });
  }, [tenYrPath]);
  const maxDDsim = Math.min(...dd);

  const W = 320, H = 170, P = 24;
  const pMax = Math.max(...tenYrPath) * 1.05;
  const pMin = 0.85;
  const sx = (i) => P + (i / tenYrPath.length) * (W - 2 * P);
  const sy = (v) => H - P - ((v - pMin) / (pMax - pMin)) * (H - 2 * P);
  const path = tenYrPath.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');

  return (
    <Card id="anchor" icon={Crosshair} title="The $250k 4-sleeve book" accent="fuchsia" index={19} anchor
          subtitle="Synthesis. Factor + Trend + Vol + Core. Net of costs, BR tax, and FX drag. Predict the Sharpe before revealing.">
      <MinSchema>
        Allocate <Eq>{'\\fu{\\$250k}'}</Eq> across four sleeves. Each sleeve is one of the
        intrinsic risk premia from <CrossLink to="premia" recap="The risk-premium menu: 8 named premia retail can harvest. Diversification math is the engine.">Card 1</CrossLink>;
        each is implementable for retail at a foreign broker (mostly USD, ~25-30% BRL via Tesouro
        IPCA+); each is sized by the principles from{' '}
        <CrossLink to="sizing" recap="Sizing: vol-target each position, fractional Kelly aggregate, edge-uncertainty shrinkage.">Card 12</CrossLink>{' '}
        and <CrossLink to="portconstr" recap="Portfolio construction: shrunk Markowitz / risk parity for stable cross-sleeve weights.">Card 13</CrossLink>.
      </MinSchema>

      <div className="rounded-md border border-fuchsia-400/25 bg-fuchsia-400/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-fuchsia-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">predict the net Sharpe</span>
        </div>
        <p className="text-[12px] text-neutral-300 mb-3">
          Before scrolling: drag the slider to your guess for the book&apos;s realized Sharpe over a
          10-year horizon, net of costs and BR taxes. Then reveal.
        </p>
        <div className="flex items-center gap-3">
          <input type="range" min="0.0" max="1.5" step="0.05" value={predicted}
            onChange={(e) => setPredicted(parseFloat(e.target.value))}
            className="rq-range flex-1" />
          <span className="font-mono text-fuchsia-200 tabular-nums w-12 text-right">{predicted.toFixed(2)}</span>
          <button onClick={() => setRevealed(true)}
            className="text-[11px] rounded border border-fuchsia-400/40 bg-fuchsia-400/10 hover:bg-fuchsia-400/20 text-fuchsia-200 px-2.5 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3" />reveal
          </button>
        </div>
        {revealed && (
          <div className="mt-3 pt-3 border-t border-fuchsia-400/20 grid grid-cols-3 gap-2">
            <Stat label="gross Sharpe" value={grossSharpe.toFixed(2)} sub="modeled, pre-cost" color="text-amber-300" />
            <Stat label="net Sharpe" value={netSharpe.toFixed(2)} sub="post-cost, post-tax" color="text-fuchsia-300" />
            <Stat label="vs your guess" value={`${(netSharpe - predicted >= 0 ? '+' : '') + (netSharpe - predicted).toFixed(2)}`} sub={netSharpe - predicted > 0.1 ? 'higher' : netSharpe - predicted < -0.1 ? 'lower' : 'close'}
              color={Math.abs(netSharpe - predicted) < 0.1 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">sleeves &amp; composition</div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2">
          {ANCHOR_BOOK.map(s => (
            <div key={s.id} className="flex items-start gap-2 text-[11px]">
              <div className="w-2 h-2 mt-[5px] rounded-sm shrink-0" style={{ background: s.accent }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-neutral-100">{s.name}</span>
                  <span className="font-mono text-fuchsia-200 tabular-nums">{(s.weight * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-neutral-500 font-mono">SR {s.sharpeGross.toFixed(2)} · σ {(s.vol * 100).toFixed(0)}% · μ {(s.retGross * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[10px] text-neutral-400 leading-snug mt-0.5">{s.notes}</div>
              </div>
              <div className="font-mono text-amber-200 tabular-nums">${(s.weight * 250).toFixed(0)}k</div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/10 flex justify-between text-[11px]">
            <span className="text-neutral-400">total</span>
            <span className="font-mono text-emerald-300">$250k · {(totalW * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4 items-start">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">expected book metrics</div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="ann. return (gross)" value={`${(grossRet * 100).toFixed(2)}%`} sub="" color="text-emerald-300" />
            <Stat label="ann. vol" value={`${(portVol * 100).toFixed(1)}%`} sub="ρ̄=0.10 between sleeves" color="text-amber-300" />
            <Stat label="cost+tax drag" value={`${((costDrag + taxDrag) * 100).toFixed(2)}%`} sub="combined" color="text-rose-300" />
            <Stat label="net return" value={`${(netRet * 100).toFixed(2)}%`} sub="post-cost, post-tax" color="text-emerald-300" />
            <Stat label="net Sharpe" value={netSharpe.toFixed(2)} sub="vs single-sleeve avg ~0.45" color="text-fuchsia-300" />
            <Stat label="exp. maxDD" value={`-${(expMaxDD * 100).toFixed(0)}%`} sub="2.5σ rule" color="text-rose-300" />
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 leading-snug">
            On a $250k book, that&apos;s ~$<span className="font-mono text-emerald-300">{Math.round(netRet * 250000).toLocaleString()}</span>/yr expected,{' '}
            with annual swings of ±$<span className="font-mono text-amber-300">{Math.round(portVol * 250000).toLocaleString()}</span> 1σ.
            A worst-case drawdown of ${Math.round(expMaxDD * 250000).toLocaleString()} (~{(expMaxDD * 100).toFixed(0)}%) in a bad regime.
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">simulated 10-year equity curve</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
            <line x1={P} x2={P} y1={P} y2={H - P} stroke="#525252" strokeWidth="0.5" />
            <line x1={P} x2={W - P} y1={sy(1)} y2={sy(1)} stroke="#737373" strokeWidth="0.4" strokeDasharray="2,3" />
            <text x={W - P} y={sy(1) - 3} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">$250k</text>
            <polyline points={path} fill="none" stroke="#f0abfc" strokeWidth="1.4" />
            <text x={P} y={H - 6} fontSize="8" fill="#737373" fontFamily="monospace">0</text>
            <text x={W - P} y={H - 6} fontSize="8" textAnchor="end" fill="#737373" fontFamily="monospace">10y</text>
            <text x={P + 2} y={20} fontSize="8" fill="#a3a3a3" fontFamily="monospace">single seeded path</text>
            <text x={W - P - 2} y={20} fontSize="8" textAnchor="end" fill="#fb7185" fontFamily="monospace">maxDD {(maxDDsim * 100).toFixed(0)}%</text>
          </svg>
          <div className="text-[10px] text-neutral-500 mt-1 leading-snug">
            One realization. The expected ending value is $250k × (1+netRet)<sup>10</sup> ≈
            $<span className="font-mono text-emerald-300">{(250 * Math.pow(1 + netRet, 10)).toFixed(0)}</span>k;
            5th-95th percentile is roughly $<span className="font-mono text-rose-300">{(250 * Math.exp(10 * netRet - 1.645 * portVol * Math.sqrt(10))).toFixed(0)}</span>k to{' '}
            $<span className="font-mono text-emerald-300">{(250 * Math.exp(10 * netRet + 1.645 * portVol * Math.sqrt(10))).toFixed(0)}</span>k.
          </div>
        </div>
      </div>

      <Worked title="Operations · monthly cadence">
        <p>
          <strong>Monthly: rebalance back to weights.</strong> Sell whichever sleeve drifted up &gt;3pp; buy
          whichever drifted down &gt;3pp. Annual full rebalance. ~6-8 trades/year. ~5-min effort per
          month if you batch.
        </p>
        <p>
          <strong>Vol sleeve: monthly options roll.</strong> Sell new 30-45 DTE cash-secured put on SPY
          ~5% OTM after the prior position closes (assigned or expired). Cash earmarked: ~$30-35k for
          the put strike.
        </p>
        <p>
          <strong>Tax: monthly DARF.</strong> Foreign-broker dividends/interest from previous month →
          carnê-leão calculation → DARF paid by last business day. Spreadsheet template + a calendar
          reminder is enough; the ~30 min/month overhead is real.
        </p>
        <p>
          <strong>Quarterly: review &amp; honesty check.</strong> Compute realized Sharpe, drawdown, attribution per sleeve.
          Compare to expected. If a sleeve is &gt;1σ off expectation (year-over-year), investigate before adjusting.
          Most "underperformance" is regime-conditional &mdash; don&apos;t fire a sleeve in its bad
          phase.
        </p>
      </Worked>

      <WhenItMatters>
        This is the deliverable. If you can run this book, the rest of the explainer pays off. If
        you can&apos;t (capital, time, discipline), drop sleeves until you reach the configuration
        you can actually maintain. <strong>A maintainable 0.7-Sharpe book beats an
        un-maintainable 1.0 one.</strong>
      </WhenItMatters>

      <Misconception
        wrong="A 0.85 net Sharpe sounds great — I should put more capital in."
        right="Sharpe is a long-run statistic. The 10-year realized Sharpe will land somewhere in [0.4, 1.3] purely from luck — and that's BEFORE behavioral risk. Don't size up based on backtest Sharpe; size up only after living through a real drawdown and not panicking."
        because="Sharpe SE ≈ 1/√T years. At T=10y the SE is ~0.32; the 90% CI for a true 0.85 Sharpe in 10 years of realized data is ~[0.30, 1.40]. You can't tell skill from luck on a single 10-year window — adjust expectations and don't over-react to either tail."
      />

      <Deeper>
        <p>
          <strong>Sharpe attribution decomposition.</strong> Net portfolio Sharpe is approximately
          the weighted average of sleeve Sharpes adjusted by correlation:{' '}
          <Eq>{'S_p = \\frac{\\sum_i w_i S_i \\sigma_i}{\\sqrt{w^T \\Sigma w}} \\approx \\frac{\\bar S}{\\sqrt{(1+(n-1)\\bar\\rho)/n}}'}</Eq>{' '}
          (for equal Sharpes/vols). At ρ̄=0.10, n=4: portfolio Sharpe is 1.59× the average sleeve
          Sharpe. The diversification math, not the per-sleeve hot streaks, drives the headline.
        </p>
        <p>
          <strong>Sequence-of-returns risk over 10y.</strong> Same average return, different
          sequencing matters when contributions or withdrawals exist. For pure
          buy-and-hold-and-rebalance: less so. For a retail investor adding $20-50k/year:
          early-cycle drawdowns are <em>good news</em> (DCA at lower prices); late-cycle drawdowns
          are bad news. Run the book through an early-bad / late-bad sequence comparison once.
        </p>
        <p>
          <strong>BR-specific tax accounting.</strong> Tesouro IPCA+ at 15% rate (10y), MTUM/QUAL/etc.
          15% on swing trade gains, ETF dividends carnê-leão (~15-27.5%), trend ETFs (DBMF/KMLM)
          15% on swing trade gains. Vol sleeve: every assignment is a taxable event. Net blended
          drag ~1-1.2% on the book per year as modeled.
        </p>
        <p>
          <strong>How to scale up / down.</strong> The book is roughly linear in size from $50k
          to $1M. Below $50k, single-name vol-selling becomes uneconomic (need at least 1 SPY
          contract = ~$58k cash for the strike). Above $1M, you should add an FX hedging policy
          decision and consider a small CTA / global-macro sleeve (longer-horizon trends not
          captured by DBMF/KMLM).
        </p>
        <p>
          <strong>Sibling explainer.</strong>{' '}
          <CrossLink to="bettors-stack" external recap="Bettors-stack: same Kelly/CV/multiple-testing toolkit applied to sports-betting deployment.">The Bettor&apos;s Stack</CrossLink>{' '}
          covers the deployment toolkit (Kelly, CLV, walk-forward, deflated Sharpe) for sports.
          This explainer is its markets-side cousin. The math is largely shared; the
          instrument-side differs.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What\'s the smallest realistic version of this book?',
          a: '~$50k. Below that, the vol-selling sleeve gets hard (one SPY put requires $50-60k cash secured), and per-trade fixed costs eat factor turnover. A $50k 3-sleeve version (factor + trend + core, no vol) is workable.' },
        { q: 'How long until I know if this is working?',
          a: 'For statistical significance: 5-10 years to detect Sharpe vs 0 with t=2. For directional confirmation: 2-3 years (does the book\'s sleeves diversify as expected? does drawdown stay below expected? are sleeves earning their carry?). Don\'t evaluate on year-1 returns — they\'re ~80% noise.' },
        { q: 'Is this strategy "passive" or "active"?',
          a: 'Mostly passive at the sleeve-strategy level (the sleeves are ETF or rule-based). Active at the meta level (decision to run a multi-strat book, sleeve weights, periodic review). The active component is the one you actually do — and the discipline to do it consistently for 10+ years is the alpha.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   20 — NEXT TRAILS
   ========================================================================== */

const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainers, depth, foundations, the wider arena" accent="violet" index={20}>
    <MinSchema>
      The Retail Quant&apos;s Stack is the deployment side of personal markets investing. The
      planned sibling on <em>price &amp; return modeling, basic to SOTA</em> is the modeling side.
      Each card here can also be expanded into its own deep-dive.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers in this series',
        note: 'in this sandbox',
        items: [
          { label: 'Modeling Markets · basic to SOTA', href: '#markets-modeling', note: 'Markets-side modeling cousin. From random walk → ARCH/GARCH → stochastic & rough vol → jumps → factors → state-space → HMM → Bayesian → microstructure → ML → transformers → CRPS evaluation → ★ SPY 1m forecast progression. The forecasting toolkit that feeds this deployment book.' },
          { label: 'The Bettor\'s Stack', href: '#bettors-stack', note: 'Sports-betting deployment cousin: vig stripping, CLV, walk-forward CV, deflated Sharpe, Kelly, ruin, portfolio Kelly, alpha map, account limits. The same toolkit applied to a different instrument.' },
          { label: 'The Forecaster\'s Craft', href: '#forecasters-craft', note: 'How a quantitative football model encodes market-orthogonal information — modeling-side cousin of the bettor stack. Loss alignment, information hypothesis, feature engineering, ensembling.' },
          { label: 'Forecasting Noisy Series', href: '#statistical-forecasting', note: 'Decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal prediction. The general statistical/ML forecasting toolkit.' },
          { label: 'Superforecasting', href: '#superforecasting', note: 'Calibration, base rates, Fermi-izing, Bayesian updating — the human/judgmental side of probability. The discretionary-views layer underneath Black-Litterman.' },
          { label: 'Deep Uncertainty', href: '#deep-uncertainty', note: 'When probabilities themselves don\'t apply: scenario planning, RDM, real options. The complement to anything in this explainer that assumes a stable distribution.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'one level of detail down per card',
        items: [
          { label: 'Antti Ilmanen · Expected Returns (2011) / Investing Amid Low Expected Returns (2022)', note: 'The definitive treatment of risk premia: equity, term, credit, factors, trend, vol, carry. Practitioner-focused, mathematically rigorous.', external: true },
          { label: 'Andrew Ang · Asset Management (2014)', note: 'A factor-investing-first textbook from a senior practitioner. Covers factor design, implementation, portfolio construction, and the politics of "factor washing".', external: true },
          { label: 'Moskowitz, Ooi, Pedersen · Time Series Momentum (JFE 2012)', note: 'The seminal TSMOM paper. 58 futures, 100 years. Sharpe ~1 across the diversified portfolio.', external: true },
          { label: 'Carr & Wu · Variance Risk Premiums (RFS 2009)', note: 'The empirical foundation for the IV-RV gap. Proper construction, history, decomposition.', external: true },
          { label: 'López de Prado · Advances in Financial ML (2018)', note: 'Walk-forward, embargo, purging, CPCV, deflated Sharpe, hierarchical risk parity. The rigour layer for any quant strategy.', external: true },
          { label: 'Cover & Thomas · Elements of Information Theory ch. 6', note: 'Kelly\'s gambling theorem, log-utility, KL divergence. The math under fractional Kelly.', external: true },
          { label: 'Ledoit & Wolf · A Well-Conditioned Estimator for Large-Dimensional Covariance Matrices (2004)', note: 'The shrinkage paper. Closed-form δ*, makes Markowitz tractable on noisy estimates.', external: true },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math under the hood',
        items: [
          { label: 'Stochastic calculus · Karatzas & Shreve / Shreve\'s 2-volume', note: 'Brownian motion, Itô, GBM, stopping times. The rigorous version of everything in card 4.' },
          { label: 'Black-Scholes & equilibrium option pricing · Cochrane Asset Pricing', note: 'Why IV exists, why it\'s above RV in equilibrium with risk-averse investors, the variance risk premium.' },
          { label: 'Bayesian decision theory · Berger / Robert', note: 'Shrinkage, the prior-likelihood-posterior pipeline, decision-theoretic Kelly. The framework under fractional Kelly.' },
          { label: 'Behavioural finance · Kahneman, Thaler', note: 'Why retail investors panic-sell at drawdowns, why momentum/value persist (under-reaction + over-reaction). The behavioral risk in card 18.' },
          { label: 'Information theory · Cover & Thomas', note: 'KL divergence as edge measure, Kelly as log-growth, mutual info on features. The information-theoretic view of investing.' },
        ],
      },
      {
        title: 'Zoom out · domains where this matters',
        note: 'the same toolkit, different stakes',
        items: [
          { label: 'Sports betting at retail', note: 'See sibling explainers. Same Kelly + walk-forward + deflated Sharpe + CLV math; different instruments. Smaller capacity but lower latency to feedback.' },
          { label: 'Crypto market-making (off-table for retail)', note: 'Where order-book modeling actually matters. Avellaneda-Stoikov, queue position, latency. Reserve for institutional capital + sub-millisecond infra.' },
          { label: 'Real-estate alpha at retail', note: 'House-as-leveraged-real-asset, the home-as-position trade. FII (BR) and REIT (US) are the liquid wrappers; cap-rate analysis is the screen.' },
          { label: 'Insurance underwriting', note: 'The vol-premium / variance-risk-premium logic generalizes to any insurance market. Same risk-averse buyer paying a structural premium.' },
          { label: 'Career capital (allocation of human time)', note: 'The same diversification + sizing + drawdown math applies to skill investments. Different units; same equations.' },
        ],
      },
    ]} />

    <Deeper>
      <p>
        <strong>One operator&apos;s order of priority for a new retail quant.</strong> Year 1: get
        the strategic core right (40% IPCA+ / TIPS / nominal mix). Add the factor sleeve via 4
        ETFs. Don&apos;t touch options or futures yet. Live with this for 12 months and survive
        a real drawdown.
      </p>
      <p>
        Year 2: add the trend sleeve via DBMF or KMLM (one of them). Re-balance discipline begins.
        Document expected sleeve volatility/Sharpe; compare quarterly. By end of year 2 you should
        know if your behavioral discipline can hold through underwater periods.
      </p>
      <p>
        Year 3+: add vol-selling via cash-secured puts on SPY. Start small (1 contract), scale
        cautiously. Read{' '}
        <em>Investing Amid Low Expected Returns</em> and the AQR factor-implementation white
        papers. By year 5 you have either a real working multi-strat book or solid evidence that
        a passive 60/40 is the right place for you.
      </p>
      <p>
        <strong>The honest framing.</strong> Retail multi-strat earns ~0.7-0.9 net Sharpe with
        discipline; ~0.3-0.5 without. The discipline IS the alpha. The math is the easy part;
        the human is the hard part. Make peace with that and the 10-year compounding works.
      </p>
    </Deeper>
  </Card>
);

/* ============================================================================
   02 — ALPHA VS RISK PREMIA
   Honest accounting: what looks like alpha is usually beta to a factor you
   forgot to control for. Decompose a strategy's return into market β, factor
   exposures, and what's left over.
   ========================================================================== */

const AlphaCard = () => {
  const [scenario, setScenario] = useState('tech');
  const [bMkt, setBMkt] = useState(1.0);
  const [bMom, setBMom] = useState(0.0);
  const [bVal, setBVal] = useState(0.0);
  const [bQual, setBQual] = useState(0.0);

  const totals = {
    tech: { name: 'Tech-heavy fund · 2014-2021', mu: 18.0, btrue: { mkt: 1.30, mom: 0.20, val: -0.30, qual: 0.10 } },
    value: { name: 'Deep-value manager · 2003-2007', mu: 16.0, btrue: { mkt: 0.95, mom: 0.05, val: 0.45, qual: -0.05 } },
    quality: { name: 'Quality-tilt fund · 2010-2024', mu: 12.0, btrue: { mkt: 0.90, mom: 0.10, val: 0.05, qual: 0.40 } },
  };
  const t = totals[scenario];

  const factorPrem = { mkt: 7.0, mom: 6.0, val: 3.5, qual: 4.5 };
  const explained = bMkt * factorPrem.mkt + bMom * factorPrem.mom + bVal * factorPrem.val + bQual * factorPrem.qual;
  const apparentAlpha = t.mu - explained;
  const trueExplained = t.btrue.mkt * factorPrem.mkt + t.btrue.mom * factorPrem.mom + t.btrue.val * factorPrem.val + t.btrue.qual * factorPrem.qual;
  const trueAlpha = t.mu - trueExplained;

  return (
    <Card id="alpha" icon={Telescope} title="Alpha vs risk premia — honest accounting" accent="violet" index={2}
          subtitle="Most retail 'alpha' is just beta to a factor you didn't control for. The decomposition matters because risk premia are durable; uncontrolled-for-beta alpha vanishes the moment the factor reverses.">
      <MinSchema>
        Decompose returns into market beta, factor betas, and a residual:{' '}
        <Eq>{'r_p = \\co{\\alpha} + \\vi{\\beta_m} r_m + \\sum_i \\vi{\\beta_i} f_i + \\varepsilon'}</Eq>.
        What you can call <Term>alpha</Term> is what survives after you regress against every
        factor an honest reviewer would include.
      </MinSchema>

      <Block>{'\\co{\\alpha} = \\mathbb{E}[r_p] - r_f - \\sum_i \\vi{\\beta_i} \\cdot \\fu{\\text{premium}_i}'}</Block>

      <p>
        Pick a fund. The fund delivered {t.mu.toFixed(1)}% above cash. Drag the factor betas to
        match what you think the fund actually loaded on. The bar shows how much of the return
        is &ldquo;explained&rdquo; by your stated betas vs how much remains as residual alpha.
        The real-world point is unforgiving: <em>most retail-investor portfolios that &ldquo;beat
        the market&rdquo; do so by riding factor tilts that nobody priced as alpha</em>.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(totals).map(([k, v]) => (
          <button key={k} onClick={() => { setScenario(k); setBMkt(1); setBMom(0); setBVal(0); setBQual(0); }}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${scenario === k ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
            {v.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          {[
            { lab: 'β market', val: bMkt, set: setBMkt, color: 'text-sky-300', min: 0.5, max: 1.6, key: 'mkt' },
            { lab: 'β momentum', val: bMom, set: setBMom, color: 'text-rose-300', min: -0.3, max: 0.6, key: 'mom' },
            { lab: 'β value', val: bVal, set: setBVal, color: 'text-emerald-300', min: -0.5, max: 0.6, key: 'val' },
            { lab: 'β quality', val: bQual, set: setBQual, color: 'text-amber-300', min: -0.3, max: 0.6, key: 'qual' },
          ].map(s => (
            <div key={s.lab}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`${s.color} font-mono`}>{s.lab}</span>
                <span className="text-neutral-300 font-mono tabular-nums">
                  {s.val.toFixed(2)} <span className="text-neutral-600 text-[10px]">true {t.btrue[s.key].toFixed(2)}</span>
                </span>
              </div>
              <input type="range" min={s.min} max={s.max} step="0.05" value={s.val}
                onChange={(e) => s.set(parseFloat(e.target.value))} className="rq-range w-full" />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1">presets:</span>
            {[
              { lab: 'naive 1·β_mkt', set: () => { setBMkt(1); setBMom(0); setBVal(0); setBQual(0); }, hint: 'what most retail assumes' },
              { lab: 'true mix', set: () => { setBMkt(t.btrue.mkt); setBMom(t.btrue.mom); setBVal(t.btrue.val); setBQual(t.btrue.qual); }, hint: 'the actual generating betas' },
              { lab: 'all factors flat', set: () => { setBMkt(0); setBMom(0); setBVal(0); setBQual(0); }, hint: 'attributes everything to alpha' },
              { lab: 'reset', set: () => { setBMkt(1); setBMom(0); setBVal(0); setBQual(0); }, hint: '' },
            ].map((p, i) => (
              <button key={i} onClick={p.set} title={p.hint}
                className="text-[10px] rounded border border-violet-400/30 bg-violet-400/5 hover:bg-violet-400/15 text-violet-200 px-2 py-0.5 font-mono">
                {p.lab}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-neutral-500 leading-snug">
            Factor premia (annualized): mkt 7.0% · mom 6.0% · val 3.5% · qual 4.5%. The blue label below the slider shows the betas that <em>actually</em> generated this fund&apos;s return.
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">return decomposition</div>
          <svg viewBox="0 0 320 130" className="w-full h-auto">
            {(() => {
              const W = 280, H = 30;
              const total = t.mu;
              const segs = [
                { v: bMkt * factorPrem.mkt, c: '#7dd3fc', lab: 'mkt' },
                { v: bMom * factorPrem.mom, c: '#fda4af', lab: 'mom' },
                { v: bVal * factorPrem.val, c: '#86efac', lab: 'val' },
                { v: bQual * factorPrem.qual, c: '#fcd34d', lab: 'qual' },
                { v: apparentAlpha, c: apparentAlpha > 0 ? '#c4b5fd' : '#fb7185', lab: 'α' },
              ];
              const scale = W / Math.max(20, total + 5);
              let x = 20;
              return (
                <>
                  <text x={20} y={20} fontSize="9" fill="#a3a3a3" fontFamily="monospace">your model</text>
                  {segs.map((s, i) => {
                    const w = Math.abs(s.v) * scale;
                    const x0 = x;
                    if (s.v < 0) { x -= w; }
                    const xrect = s.v < 0 ? x : x0;
                    if (s.v >= 0) x += w;
                    return (
                      <g key={i}>
                        <rect x={xrect} y={28} width={w} height={H} fill={s.c} fillOpacity="0.7" stroke={s.c} strokeOpacity="0.9" />
                        {w > 22 && <text x={xrect + w/2} y={47} fontSize="8" textAnchor="middle" fill="#0a0a0a" fontFamily="monospace">{s.lab}</text>}
                      </g>
                    );
                  })}
                  <text x={20} y={78} fontSize="9" fill="#a3a3a3" fontFamily="monospace">true mix</text>
                  {(() => {
                    const trueSegs = [
                      { v: t.btrue.mkt * factorPrem.mkt, c: '#7dd3fc', lab: 'mkt' },
                      { v: t.btrue.mom * factorPrem.mom, c: '#fda4af', lab: 'mom' },
                      { v: t.btrue.val * factorPrem.val, c: '#86efac', lab: 'val' },
                      { v: t.btrue.qual * factorPrem.qual, c: '#fcd34d', lab: 'qual' },
                      { v: trueAlpha, c: trueAlpha > 0 ? '#c4b5fd' : '#fb7185', lab: 'α' },
                    ];
                    let xx = 20;
                    return trueSegs.map((s, i) => {
                      const w = Math.abs(s.v) * scale;
                      const x0 = xx;
                      if (s.v < 0) xx -= w;
                      const xr = s.v < 0 ? xx : x0;
                      if (s.v >= 0) xx += w;
                      return (
                        <g key={i}>
                          <rect x={xr} y={86} width={w} height={H} fill={s.c} fillOpacity="0.7" stroke={s.c} strokeOpacity="0.9" />
                          {w > 22 && <text x={xr + w/2} y={105} fontSize="8" textAnchor="middle" fill="#0a0a0a" fontFamily="monospace">{s.lab}</text>}
                        </g>
                      );
                    });
                  })()}
                </>
              );
            })()}
          </svg>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="apparent α (your model)" value={`${apparentAlpha >= 0 ? '+' : ''}${apparentAlpha.toFixed(1)}%`}
              sub={apparentAlpha > 1 ? 'inflated by missing β' : apparentAlpha < -1 ? 'over-attributed to factors' : 'close to true'}
              color={apparentAlpha > 1 ? 'text-violet-300' : apparentAlpha < -1 ? 'text-rose-300' : 'text-emerald-300'} />
            <Stat label="true α (full attribution)" value={`${trueAlpha >= 0 ? '+' : ''}${trueAlpha.toFixed(1)}%`}
              sub="after every factor controlled for"
              color={trueAlpha > 0.5 ? 'text-emerald-300' : 'text-rose-300'} />
          </div>
        </div>
      </div>

      <Misconception
        wrong="My portfolio beat SPY by 5% last year — that's 5% of alpha I generated."
        right="Probably 0% alpha. If your portfolio had β_market=1.2, then 1.2 × SPY's 12% = 14.4% was already explained. The remaining 'beat' was 0.6%, and even that's likely momentum or quality factor exposure, not alpha."
        because="Alpha is what's left after you remove every reproducible risk premium. Most retail 'outperformance' is leverage-on-the-market or factor tilts in a year that favored those factors. Run the regression. The residual α is almost always smaller than the apparent excess."
      />

      <WhenItMatters>
        Whenever you&apos;re evaluating your own performance, an active fund, or any newsletter
        guru&apos;s track record. The right question is never &ldquo;did this beat SPY?&rdquo;
        but &ldquo;did this beat the right benchmark, factor-adjusted?&rdquo;
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>The factor regression in code.</strong>{' '}
          <Eq>{'r_{p,t} - r_{f,t} = \\co{\\alpha} + \\beta_m (r_{m,t} - r_{f,t}) + \\beta_s \\text{SMB}_t + \\beta_h \\text{HML}_t + \\beta_w \\text{WML}_t + \\varepsilon_t'}</Eq>.
          Run OLS on monthly returns; report the intercept α with its t-stat. A typical
          publishable α has <Eq>{'|t| > 2'}</Eq> AND survives <CrossLink to="backtest" recap="Walk-forward CV: time-respecting validation; the only honest CV for time series.">walk-forward</CrossLink>{' '}
          out-of-sample &mdash; both bars are routinely missed in retail-targeted track records.
        </p>
        <p>
          <strong>Sharpe-style alpha.</strong> A more honest construction: build a passive portfolio
          with the same factor exposures as the strategy, then compare returns. The difference is
          your &ldquo;tradeable&rdquo; alpha &mdash; the part you couldn&apos;t have replicated by
          buying ETFs. This is the bar that should clear before paying any active-management fee.
        </p>
        <p>
          <strong>The deflated-Sharpe correction.</strong> Even t-stat &gt; 2 isn&apos;t enough if you tested 50 strategies.{' '}
          <Term>deflated Sharpe</Term> shrinks the apparent t-stat for the number of trials.
          A Sharpe of 1.0 in the best of 50 backtests typically deflates to ~0.3 once corrected.
          Sibling explainer{' '}
          <CrossLink to="bettors-stack" external recap="The Bettor's Stack covers walk-forward CV, deflated Sharpe, and CLV — the same overfit-control toolkit applied to sports betting.">The Bettor&apos;s Stack</CrossLink>{' '}
          covers the math in detail.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What’s the smallest "real alpha" Sharpe I should believe in retail?',
          a: 'After deflation: 0.20-0.30. Anything claimed above 0.5 net of factors and net of costs and selected from many trials is almost always overfit. Sharpe 1.0 retail strategies do not exist outside a backtest.' },
        { q: 'Should I prefer high-alpha or high-risk-premia strategies?',
          a: 'Risk premia. Premia are durable (they exist for risk-bearing reasons that don’t get arbed away). Alpha is fragile (it disappears once published or once the manager retires). Build the book on premia; let alpha be a bonus when it shows up.' },
        { q: 'How do I run the factor regression at home?',
          a: 'Download Kenneth French’s monthly factor returns (mkt, SMB, HML, WML, RMW, CMA — free). Subtract risk-free from your monthly portfolio return; run OLS against the factors. The intercept is your α. Twenty observations is too few; aim for 60+ months.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   FOOTER
   ========================================================================== */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>sources:</span>
        <span className="text-sky-300">Fama-French 1993, 2015</span>
        <span className="text-amber-300">Moskowitz et al. 2012 · TSMOM</span>
        <span className="text-fuchsia-300">Carr-Wu 2009 · VRP</span>
        <span className="text-emerald-300">Kelly 1956 · MacLean/Thorp/Ziemba 2010</span>
        <span className="text-violet-300">López de Prado 2018</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sibling explainers in this sandbox: <em>Modeling Markets</em> (markets modeling),{' '}
        <em>The Bettor&apos;s Stack</em> (sports deployment),{' '}
        <em>The Forecaster&apos;s Craft</em> (sports modeling). The four-quadrant matrix:
        {`{`}sports, markets{`}`} × {`{`}modeling, deployment{`}`}.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function RetailQuantExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].rq-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].rq-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(125,211,252,0.4);
        }
        input[type=range].rq-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <PremiaCard />
        <AlphaCard />
        <NonGaussCard />
        <StochModelsCard />
        <FactorDesignCard />
        <FactorImplCard />
        <TsmomCard />
        <TrendSleeveCard />
        <VarPremCard />
        <VolStructCard />
        <StrategicCoreCard />
        <SizingCard />
        <PortConstrCard />
        <CostsCard />
        <BacktestCard />
        <TaxCard />
        <FxCard />
        <DrawdownCard />
        <AnchorCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
