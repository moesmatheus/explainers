import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, BarChart3, Boxes, BrainCircuit, ChevronDown,
  CircleDollarSign, Coins, Compass, Crosshair, Eye, EyeOff, Filter,
  FlaskConical, Gauge, GitBranch, HandCoins, HelpCircle, Hourglass,
  Layers, LineChart, Lightbulb, Link2, Network, Quote, Radar, Receipt,
  Repeat, Scale, ScrollText, ShieldAlert, Sigma, Sparkles, Star, Target,
  Telescope, TrendingUp, TrendingDown, Waves, Wallet, Workflow, Zap,
  CheckCircle2, XCircle, Ruler, Lock,
} from 'lucide-react';

/* ============================================================================
   The Bettor's Stack — From Edge to Bankroll Growth
   The deployment-side sibling of "The Forecaster's Craft". Vig, CLV,
   walk-forward CV, multiple testing, Kelly, ruin, correlation, alpha map.
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

const Card = ({ id, icon: Icon, title, subtitle, accent = 'emerald', index, source, anchor = false, children }) => {
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
const Chip = ({ children, color = 'emerald' }) => (
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
  // Odds & vig
  'decimal odds': 'European odds format: payout multiplier including stake. 2.10 → bet 1, win 2.10 (profit 1.10).',
  'American odds': 'US format: positive number = profit on $100 stake; negative = stake needed to win $100. +110 = bet $100, win $110.',
  'fractional odds': 'UK format: profit/stake ratio. 11/10 = bet 10, win 11.',
  'vig': 'Bookmaker margin baked into odds. Sum of implied probabilities exceeds 1; the excess is the vig.',
  'overround': 'Same as vig. Σ(1/odds) − 1, expressed as a percentage.',
  'implied probability': 'Naive 1 / decimal_odds. Includes vig — not a fair probability.',
  'fair odds': 'Odds with vig stripped out. Probabilities sum to 1.',
  'true probability': 'The model-implied or vig-stripped probability of an outcome. The bookmaker’s estimate of true probability is what you’re competing against.',
  'power method': 'Vig-removal method that takes implied probabilities to a power k chosen so they sum to 1. Simple, biased toward favourites.',
  'Shin method': 'Vig-removal model that assumes a fraction z of bettors are insiders; solves for z so the resulting probabilities sum to 1. Less favourite-biased than power.',
  'log-multinomial': 'Vig removal that fits multinomial logit weights to make probabilities sum to 1 while preserving relative odds. Cleanest option.',
  'favorite-longshot bias': 'Empirical observation: longshots are over-priced (high vig); favourites are slightly under-priced. The vig-removal method matters because methods bias differently across this curve.',

  // Closing line / CLV
  'closing odds': 'The final odds posted just before kickoff/event start. The consensus of all sharp money.',
  'closing line': 'Same as closing odds. The de-facto efficient consensus.',
  'opening line': 'The first odds offered when a market opens. Often less informed; sharp action moves it toward the close.',
  'CLV': 'Closing Line Value — your average % beat of the closing line on bets you took. Far less noisy than ROI; the only reliable signal that you’re sharp.',
  'line shopping': 'Comparing odds across multiple books and taking the best. Adds free EV; necessary discipline at any scale.',
  'Pinnacle': 'A sharp book — takes large stakes from professionals, low margin (~2-3% vig), doesn’t limit winners. Its closing line is the operational reference for sharpness.',
  'sharp book': 'A book that welcomes sharp action and uses it to set its line. Pinnacle, Circa Sports. Its closing odds are the truth-meter.',
  'soft book': 'A book that limits or bans winners. Most retail books — Bet365, DraftKings, William Hill. Higher margin, weaker lines.',

  // Markets
  '1X2': 'Three-way main football market: home win / draw / away win.',
  'Asian handicap': 'A football market where one team gets a goal handicap (often non-integer). Removes the draw, splits some bets into half-wins / half-losses.',
  'over/under': 'Bet on whether total match goals exceed a threshold (typically 2.5).',
  'BTTS': 'Both Teams To Score. Yes/No.',

  // CV / leakage
  'walk-forward CV': 'Time-respecting cross-validation: train on [start..t], validate on (t..t+h], advance t, repeat. The only honest CV for time series.',
  'expanding window': 'Walk-forward where the training window grows; the start stays fixed.',
  'rolling window': 'Walk-forward where the training window slides; both start and end advance.',
  'embargo': 'A gap of size g between the end of train and the start of validation, sized to cover any leakage of future-affecting information through features.',
  'purging': 'Dropping training samples whose labels overlap in time with validation samples (López de Prado).',
  'CPCV': 'Combinatorial Purged Cross-Validation — generates many train/test splits that respect time, with purging and embargoing built in. The state-of-the-art for backtesting.',
  'data leakage': 'When information from after the prediction time leaks into training. The cardinal sin of time-series ML.',

  // Multiple testing
  'multiple testing': 'Statistical inflation that occurs when you test many hypotheses; the best of N is biased upward. Bonferroni, FDR, deflated Sharpe correct for it.',
  'family-wise error': 'Probability of at least one false positive across a family of N tests.',
  'FDR': 'False Discovery Rate — expected fraction of declared positives that are actually false. Benjamini-Hochberg controls FDR rather than family-wise error.',
  'Bonferroni': 'Conservative correction that divides α by N. Easy, often too strict for correlated tests.',
  'deflated Sharpe': 'López de Prado’s correction for the number of trials and skewness/kurtosis of the trial distribution. The honest Sharpe under multiple testing.',
  'backtest overfitting': 'When a strategy looks good on backtest because it was selected (over many candidates) on the backtest. The deflated Sharpe quantifies the inflation.',

  // Kelly & sizing
  'Kelly criterion': 'Optimal bet fraction f* = (b·p − q) / b that maximizes expected log-bankroll growth, given true edge p and odds b.',
  'kelly fraction': 'Same as kelly — the f* fraction of bankroll to stake, maximizing E[log(1 + f·r)].',
  'fractional Kelly': 'Bet a fixed multiple (e.g. 0.25) of full Kelly. Trades growth for survival; equivalent to a Bayesian shrinkage on edge uncertainty.',
  'expected log-growth': 'E[log(1 + f·r)] where f is bet fraction and r is the return per unit. The thing Kelly maximizes — the right loss for repeated proportional betting.',
  'growth rate': 'Long-run compounding rate of bankroll. Maximized by full Kelly in the limit; reduced by under-betting OR over-betting.',
  'log-utility': 'Utility function U(W) = log(W). Kelly is the bet sizing that maximizes log-utility; under it, marginal value of money decreases as bankroll grows.',

  // Risk
  'risk of ruin': 'Probability that bankroll hits zero (or below a chosen threshold) before reaching a target.',
  'drawdown': 'Peak-to-trough decline in bankroll. Investment industry monitors max drawdown closely.',
  'max drawdown': 'Largest peak-to-trough decline observed over a period. Rough proxy for "worst case in this run".',
  'Sharpe ratio': '(Mean return − risk-free rate) / std dev of return. Standard performance metric; doesn’t account for skew or higher moments.',
  'Sortino ratio': 'Like Sharpe but only penalizes downside volatility. Better metric for asymmetric strategies.',
  'Calmar ratio': 'Annualized return / max drawdown. Captures the survival cost of returns.',
  'arithmetic vs geometric': 'Arithmetic mean of returns assumes you re-bet the original stake each time; geometric mean assumes you re-bet the current bankroll. The geometric is what your wallet sees.',

  // Markets & operational
  'arbitrage': 'Bets across books that lock in a profit regardless of outcome. Real but capacity-limited and rapidly closed.',
  'dutching': 'Betting multiple outcomes of the same event in proportions that lock in EV. Used when no single bet has enough edge.',
  'hedging': 'Reducing exposure on an existing bet by taking the opposite side at adjusted odds.',
  'bankroll': 'The amount of capital allocated to betting. Kelly sizes are fractions of bankroll; ruin risk is bankroll going to zero.',
  'unit': 'Standard stake size, often 1% of bankroll. Soft-betting industry uses "units" as a normalisation.',
  'limit': 'Maximum stake a book will accept on a market. Limits tighten on winners; effectively caps real-world Kelly sizes.',
  'KYC': 'Know-Your-Customer checks. Books require ID/proof-of-address; trigger faster on accounts that win.',
  'closing price': 'Same as closing odds.',

  // Edge sources
  'predictive edge': 'Edge from a forecasting model whose probabilities beat the market’s.',
  'structural edge': 'Edge from non-modeling sources: arbitrage, promotions, boosted markets, freerolls.',
  'promo edge': 'Edge from book promotions: deposit bonuses, risk-free bets, profit boosts. Often the largest single source for retail bettors.',
  'syndicate': 'Coordinated group of bettors that share data, models, and capital across many accounts. The institutional-scale operation.',
  'capacity': 'How much money you can deploy at edge before moving the line / hitting limits. Capacity scales with sharp-book limits, NOT with model quality.',

  // Portfolio
  'mean-variance optimization': 'Markowitz portfolio framework: maximize μ·s − (λ/2)·sᵀΣs subject to budget. Closed form via QP.',
  'correlation matrix': 'Per-pair correlation of asset (or bet) returns. Drives portfolio variance.',
  'portfolio Kelly': 'Multi-bet generalization of Kelly using the inverse covariance matrix to stake-weight. f* = Σ⁻¹ μ for log-utility.',
  'simultaneous bets': 'Multiple bets settling at the same time (or with overlapping risk). Correlation matters more than for sequential bets.',

  // Misc
  'Brasileirão': 'Brazil’s top-tier football league (Série A). 20 teams, double round-robin, ~380 matches/season.',
  'edge': 'The expected value above the market’s priced-in expectation. Measured in % of stake or in CLV.',
  'ROI': 'Return on Investment — cumulative profit / total staked. Extremely noisy in betting; needs thousands of bets before significance.',
  'expected value': 'EV = Σ p_i · payoff_i. The mean outcome of a bet under model probabilities.',
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
   "Bankroll growth field" — drifting compounding curves with drawdown bands.
   Lean emerald + amber palette to differentiate from the modeler's stack
   (which leaned fuchsia + violet).
   ========================================================================== */

const BankrollField = () => {
  const lines = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    rate: 0.0009 + i * 0.00025, vol: 14 + i * 3, off: 60 + i * 18, phase: i * 1.4, dur: 18 + i * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
      {lines.map((c, i) => {
        const pts = [];
        for (let x = 0; x <= 800; x += 4) {
          // exponential growth + sine drawdown
          const trend = 280 - (Math.exp(c.rate * x) - 1) * 35 - c.off;
          const wobble = Math.sin(x * 0.018 + c.phase) * c.vol;
          const y = trend + wobble;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return (
          <motion.polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke={i % 3 === 0 ? '#6ee7b7' : i % 3 === 1 ? '#fbbf24' : '#f0abfc'}
            strokeOpacity={0.4 + (i % 3) * 0.1}
            strokeWidth={1.2 + (i % 2) * 0.4}
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
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-amber-500/5 to-transparent" />
    <BankrollField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <Wallet className="w-3.5 h-3.5" /> the bettor&apos;s stack
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-emerald-100 to-amber-200 bg-clip-text text-transparent">
          The Bettor&apos;s Stack
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">From edge to bankroll growth.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          A model with edge is not enough. <span className="text-emerald-300">Strip the vig</span>,{' '}
          <span className="text-amber-300">measure with CLV</span>, evaluate{' '}
          <span className="text-violet-300">honestly</span>, size by{' '}
          <span className="text-emerald-300">Kelly</span>, survive the{' '}
          <span className="text-rose-300">drawdowns</span> &mdash; and know{' '}
          <span className="text-fuchsia-300">where edge actually lives</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-emerald-300">vig &amp; fair odds</span>
          <span className="text-fuchsia-300">CLV truth-meter</span>
          <span className="text-violet-300">walk-forward · deflated sharpe</span>
          <span className="text-amber-300">kelly geometry</span>
          <span className="text-rose-300">ruin · drawdown</span>
          <span className="text-cyan-300">where edge lives</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'vig',      label: 'Vig & true probabilities', icon: Scale,           anchor: true },
  { id: 'clv',      label: 'CLV · truth-meter',        icon: Target,          anchor: true },
  { id: 'walkfwd',  label: 'Walk-forward CV',          icon: Hourglass },
  { id: 'multest',  label: 'Multiple testing',         icon: Filter },
  { id: 'kelly',    label: 'Kelly geometry',           icon: Sigma },
  { id: 'frackelly',label: 'Fractional Kelly',         icon: Repeat },
  { id: 'ruin',     label: 'Bankroll & ruin',          icon: ShieldAlert },
  { id: 'corr',     label: 'Portfolio Kelly',          icon: Workflow },
  { id: 'alpha',    label: 'Where edge lives',         icon: Telescope },
  { id: 'limits',   label: 'Limits & account life',    icon: Lock },
  { id: 'boundary', label: 'Boundary & map',           icon: Crosshair,       anchor: true },
  { id: 'trails',   label: 'Next trails',              icon: Compass },
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
   STUB CARDS — placeholders; replaced in stages C-H.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ============================================================================
   01 — VIG & TRUE PROBABILITIES (spine)
   The first thing to do with any market: strip the vig. Three methods (power,
   Shin, log-multinomial) bias differently. The choice isn't decorative —
   it sets the entire downstream EV calculation.
   ========================================================================== */

// Strip vig three ways from a 3-way market (decimal odds)
function stripVig(odds) {
  const raw = odds.map(o => 1 / o);
  const overround = raw.reduce((s, x) => s + x, 0);
  // 1) Power method: find k such that sum(p_i^k) = 1, with p_i = (1/odds_i) / overround
  const norm = raw.map(x => x / overround);
  let lo = 0.5, hi = 2.0;
  for (let it = 0; it < 50; it++) {
    const mid = (lo + hi) / 2;
    const s = norm.reduce((a, x) => a + Math.pow(x, mid), 0);
    if (s > 1) lo = mid; else hi = mid;
  }
  const k = (lo + hi) / 2;
  const power = norm.map(x => Math.pow(x, k));
  const Z = power.reduce((a, x) => a + x, 0);
  const powerNorm = power.map(x => x / Z);
  // 2) Shin: solve for z such that p_i = ((sqrt(z^2 + 4(1-z)*pi_raw_i^2 / overround) - z) / (2(1-z)))
  let zLo = 0, zHi = 0.5;
  for (let it = 0; it < 50; it++) {
    const z = (zLo + zHi) / 2;
    const denom = 2 * (1 - z);
    const ps = raw.map(piRaw => {
      const v = z * z + 4 * (1 - z) * (piRaw * piRaw) / overround;
      return (Math.sqrt(v) - z) / denom;
    });
    const sumPs = ps.reduce((a, x) => a + x, 0);
    if (sumPs > 1) zHi = z; else zLo = z;
  }
  const zFinal = (zLo + zHi) / 2;
  const denom = 2 * (1 - zFinal);
  const shin = raw.map(piRaw => {
    const v = zFinal * zFinal + 4 * (1 - zFinal) * (piRaw * piRaw) / overround;
    return (Math.sqrt(v) - zFinal) / denom;
  });
  const shinZ = shin.reduce((a, x) => a + x, 0);
  const shinNorm = shin.map(x => x / shinZ);
  // 3) Log-multinomial: just normalize raw probs by overround
  const logmn = raw.map(x => x / overround);
  return { overround: (overround - 1) * 100, power: powerNorm, shin: shinNorm, logmn, shinZ: zFinal };
}

const VigCard = () => {
  const [oH, setOH] = useState(1.95);
  const [oD, setOD] = useState(3.60);
  const [oA, setOA] = useState(4.20);
  const labels = ['Home', 'Draw', 'Away'];
  const out = stripVig([oH, oD, oA]);
  const naive = [1/oH, 1/oD, 1/oA];

  return (
    <Card id="vig" icon={Scale} title="Vig & true probabilities" accent="fuchsia" index={1} anchor
          subtitle="Strip the vig before you compute anything. The method you pick biases your fair odds — and therefore every EV decision downstream.">
      <MinSchema>
        Bookmaker decimal odds are vig-padded: <Eq>{'\\sum_i 1/o_i > 1'}</Eq>. Three standard methods to
        strip the vig &mdash; <Term>power method</Term>, <Term>Shin method</Term>,
        <Term>log-multinomial</Term> &mdash; bias differently across favourites and longshots. Pick one
        intentionally; never use raw <Eq>{'1/o'}</Eq> as the bookmaker&apos;s probability.
      </MinSchema>

      <p>
        At odds <Eq>{'(1.95, 3.60, 4.20)'}</Eq> the implied probabilities sum to{' '}
        <span className="text-amber-300 font-mono">{(naive.reduce((s, x) => s + x, 0) * 100).toFixed(1)}%</span>{' '}
        &mdash; the excess <span className="text-rose-300 font-mono">{out.overround.toFixed(2)}%</span>{' '}
        is the bookmaker&apos;s margin. To get the bookmaker&apos;s estimate of true probability, you have
        to redistribute that margin across outcomes &mdash; and the choice of how to redistribute is more
        consequential than people realize. Power scales each prob proportionally; Shin assumes a fraction
        of bettors are insiders; log-multinomial just divides by the overround. They give different
        answers, and the wrong choice systematically biases your edge estimates against favourites or
        against longshots.
      </p>

      <Predict question="Drag the odds to (2.10, 3.30, 3.80). Which vig-removal method gives the highest favourite probability — power, Shin, or log-multinomial? Which gives the lowest?">
        Log-multinomial gives the highest favourite probability (it just divides everyone by the
        overround). Shin pulls favourite probability <em>down</em> slightly (insiders are more likely to
        bet on real value — favourites). Power is between. The difference is 0.5&ndash;2 percentage points
        on the favourite, which translates to a 5&ndash;15% relative error in EV calculations.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          {[
            { label: 'Home odds', val: oH, set: setOH, min: 1.30, max: 6.00, color: 'text-emerald-200' },
            { label: 'Draw odds', val: oD, set: setOD, min: 2.50, max: 6.50, color: 'text-amber-200' },
            { label: 'Away odds', val: oA, set: setOA, min: 1.30, max: 9.00, color: 'text-rose-200' },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`${s.color} font-mono`}>{s.label}</span>
                <span className="text-neutral-300 font-mono tabular-nums">{s.val.toFixed(2)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step="0.05" value={s.val}
                onChange={(e) => s.set(parseFloat(e.target.value))} className="bs-range w-full" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <Stat label="overround" value={`${out.overround.toFixed(2)}%`} sub="vig in this market" color={out.overround > 6 ? 'text-rose-300' : out.overround > 3 ? 'text-amber-300' : 'text-emerald-300'} />
            <Stat label="Shin z" value={`${(out.shinZ * 100).toFixed(1)}%`} sub="implied insider fraction" color="text-violet-300" />
          </div>
          <div className="text-[11px] text-neutral-500 leading-snug">
            Pinnacle: ~2-3% overround. Bet365 main markets: ~5-7%. Soft-book props: 10-20%+.
            Higher overround → larger gap between methods.
          </div>
        </div>

        {/* Comparison bar chart: naive vs power vs Shin vs logmn */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 text-center">implied probability per method</div>
          <svg viewBox="0 0 320 180" className="w-full h-auto">
            <defs>
              <linearGradient id="vg-naive" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a3a3a3" stopOpacity="0.55" /><stop offset="1" stopColor="#a3a3a3" stopOpacity="0.18" /></linearGradient>
              <linearGradient id="vg-power" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7dd3fc" stopOpacity="0.85" /><stop offset="1" stopColor="#0ea5e9" stopOpacity="0.30" /></linearGradient>
              <linearGradient id="vg-shin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c4b5fd" stopOpacity="0.85" /><stop offset="1" stopColor="#7c3aed" stopOpacity="0.30" /></linearGradient>
              <linearGradient id="vg-logmn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f0abfc" stopOpacity="0.85" /><stop offset="1" stopColor="#d946ef" stopOpacity="0.30" /></linearGradient>
            </defs>
            {labels.map((lab, i) => {
              const groupX = 30 + i * 90;
              const barW = 18;
              const baseY = 140;
              const scale = 100;
              return (
                <g key={lab}>
                  {[
                    { p: naive[i], fill: 'url(#vg-naive)', label: 'naive' },
                    { p: out.power[i], fill: 'url(#vg-power)', label: 'pow' },
                    { p: out.shin[i], fill: 'url(#vg-shin)', label: 'shin' },
                    { p: out.logmn[i], fill: 'url(#vg-logmn)', label: 'lmn' },
                  ].map((d, j) => {
                    const x = groupX + j * (barW + 1);
                    const h = d.p * scale;
                    return (
                      <g key={j}>
                        <rect x={x} y={baseY - h} width={barW} height={h} fill={d.fill} rx="2" />
                        <text x={x + barW / 2} y={baseY - h - 3} fontSize="7" textAnchor="middle" fill="#a3a3a3">{(d.p * 100).toFixed(0)}</text>
                      </g>
                    );
                  })}
                  <text x={groupX + 38} y={baseY + 12} fontSize="9" textAnchor="middle" fill="#a3a3a3">{lab}</text>
                </g>
              );
            })}
            <line x1={20} y1={140} x2={300} y2={140} stroke="#525252" strokeWidth="0.5" />
            <line x1={20} y1={40} x2={300} y2={40} stroke="#525252" strokeWidth="0.4" strokeDasharray="2,3" />
            <text x={18} y={43} fontSize="8" textAnchor="start" fill="#737373">100%</text>
            {/* legend */}
            <g transform="translate(30, 165)">
              <rect x="0" y="-6" width="6" height="6" fill="url(#vg-naive)" rx="1" /><text x="9" y="0" fontSize="8" fill="#a3a3a3">naive 1/o</text>
              <rect x="60" y="-6" width="6" height="6" fill="url(#vg-power)" rx="1" /><text x="69" y="0" fontSize="8" fill="#7dd3fc">power</text>
              <rect x="115" y="-6" width="6" height="6" fill="url(#vg-shin)" rx="1" /><text x="124" y="0" fontSize="8" fill="#c4b5fd">Shin</text>
              <rect x="160" y="-6" width="6" height="6" fill="url(#vg-logmn)" rx="1" /><text x="169" y="0" fontSize="8" fill="#f0abfc">log-mn</text>
            </g>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · favourite-longshot bias">
        <p>
          Brasileirão derby with odds <Eq>{'(1.50, 4.20, 6.50)'}</Eq>. Naive sum =
          <span className="font-mono text-amber-300"> {(1/1.5 + 1/4.2 + 1/6.5).toFixed(3)}</span>{' '}
          &rarr; overround ~7.4%. After vig-stripping:
          <br />
          • <strong>Power</strong>: (66.2%, 22.8%, 14.4%) &mdash; raises favourite by ~1.5pp.
          <br />
          • <strong>Shin</strong>: (65.1%, 23.0%, 14.9%) &mdash; raises longshot slightly more.
          <br />
          • <strong>Log-mn</strong>: (66.7%, 23.5%, 14.5%) &mdash; raises favourite the most.
        </p>
        <p>
          On a 10% edge bet, the difference between Power (66.2%) and Log-mn (66.7%) might seem trivial,
          but at <Term>fractional Kelly</Term> 0.25 your stake fraction differs by ~5%, which compounds
          materially over a season.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; before <em>any</em> EV calculation. The most common (and silent) source of betting
        bugs: using <Eq>{'1/o'}</Eq> as the &ldquo;bookmaker&apos;s true probability&rdquo; in your edge
        formula. That over-states your edge by exactly the overround on every bet.
      </WhenItMatters>

      <Misconception
        wrong="1/odds is the bookmaker’s estimate of the true probability."
        right="It’s the implied probability after the bookmaker’s margin is added. The actual estimate sits below 1/odds, by an amount that depends on which vig-removal method you use."
        because="The book quotes odds = (vig-padded payout). To recover its model of true p, you have to undo the padding, and there’s no canonical way to do that — you have to choose. Use the same method consistently across all your CLV / EV calculations or you’ll mix biases."
      />

      <Deeper>
        <p>
          <strong>Shin&apos;s insider model.</strong> Shin (1993) postulates a fraction <Eq>{'z'}</Eq> of
          bettors hold inside information; the bookmaker hedges against them by widening odds on
          favourites (which insiders prefer). Solving the implied equilibrium gives:{' '}
          <Eq>{'p_i = \\frac{\\sqrt{z^2 + 4(1-z)\\pi_i^2/\\Pi} - z}{2(1-z)}'}</Eq>{' '}
          where <Eq>{'\\pi_i = 1/o_i'}</Eq> and <Eq>{'\\Pi'}</Eq> is the overround. Implementations:
          <code className="text-xs"> scipy.optimize.brentq</code> on the constraint <Eq>{'\\sum_i p_i = 1'}</Eq>.
          Empirically, Shin matches Pinnacle CLV studies most closely.
        </p>
        <p>
          <strong>Log-multinomial vs softmax-on-log-odds.</strong> Log-mn (basic <Eq>{'\\pi/\\Pi'}</Eq>) is
          the cheapest method and treats overround as multiplicative. A more general form fits multinomial
          logit weights to make probabilities sum to 1 while preserving the relative log-odds structure
          across outcomes. For 2-way markets (over/under, AH) the two collapse to the same thing; for 3+
          they diverge slightly.
        </p>
        <p>
          <strong>Favorite-longshot bias is real.</strong> Across many sports + bookmakers + decades,
          longshots empirically lose more money than their odds imply (overpriced). The bias is small
          (1-3% on extreme longshots) but consistent. Vig-stripping that <em>doesn&apos;t</em> account for
          it gives systematically wrong probabilities at the tails. Shin partially corrects; <em>basic</em>
          power method does not. For modeling under/over/exotic markets where you may bet longshots, this
          matters.
        </p>
        <p>
          <strong>Connection to the modeler&apos;s stack.</strong> In{' '}
          <CrossLink to="forecasters-craft" recap="Sibling explainer: how the model encodes market-orthogonal information." external>The Forecaster&apos;s Craft</CrossLink>{' '}
          we said &ldquo;include closing-line implied probabilities as a feature&rdquo;. The vig-stripped
          version is what you actually want as the feature &mdash; raw <Eq>{'1/o'}</Eq> mixes signal with
          margin and trains the model to learn the bookmaker&apos;s vig structure rather than its true
          beliefs.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Which method should I use for Brasileirão 1X2?',
          a: 'Shin if you have time — it matches Pinnacle CLV studies best. Power as a fast default. Log-mn only when speed matters. The most important thing is consistency: pick one, use it everywhere.' },
        { q: 'Does this matter for 2-way markets like over/under?',
          a: 'Less — the three methods nearly agree on 2-way markets because there’s less freedom. Still: never use 1/o as the prob; always strip first.' },
        { q: 'How do I handle AH lines that are not at 0?',
          a: 'AH is essentially 2-way. Strip vig the same way; the resulting probability is for the side covering the handicap. Quarter-line handicaps split into two half-bets and you strip vig on each independently.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   02 — CLV: THE TRUTH-METER (spine)
   The only metric that survives variance. ROI is too noisy to detect edge in
   any sample size you'll have. CLV is a sufficient statistic for sharpness
   long before P&L converges.
   ========================================================================== */

const ClvCard = () => {
  const [nBets, setNBets] = useState(200);
  const [trueEdge, setTrueEdge] = useState(0.025);
  // Toy: ROI std per bet ~ 0.85 (decimal-odds dependent), CLV std per bet ~ 0.05.
  // 95% half-width on each: 1.96 * sigma / sqrt(N).
  const roiHalfWidth = 1.96 * 0.85 / Math.sqrt(nBets);
  const clvHalfWidth = 1.96 * 0.05 / Math.sqrt(nBets);
  // Probability ROI estimate is within X of trueEdge given variance:
  // We'll show: how many bets needed for ROI 95%-CI to be ±1pp.
  const roiNeedsForOnePp = Math.ceil(Math.pow(1.96 * 0.85 / 0.01, 2));
  const clvNeedsForOnePp = Math.ceil(Math.pow(1.96 * 0.05 / 0.01, 2));

  return (
    <Card id="clv" icon={Target} title="CLV is the only honest edge metric" accent="fuchsia" index={2} anchor
          subtitle="ROI takes years to detect edge through betting variance. CLV detects it in weeks. If you only track one number, track CLV.">
      <MinSchema>
        Closing Line Value is a <em>sufficient statistic</em> for sharpness. ROI is a noisy realization
        of CLV plus enormous variance. Track CLV per bet, average per week, and let P&amp;L lag.
      </MinSchema>

      <p>
        Imagine a bettor with a real 2.5% edge. After 200 bets, their ROI 95% confidence interval is{' '}
        <span className="font-mono text-rose-300">±{(roiHalfWidth * 100).toFixed(1)}pp</span> &mdash; wider
        than the edge itself. They have no way to know whether they&apos;re sharp or lucky. The same 200
        bets give a CLV 95% CI of <span className="font-mono text-emerald-300">±{(clvHalfWidth * 100).toFixed(2)}pp</span>{' '}
        &mdash; tight enough to call. CLV is so much less noisy than ROI because it removes outcome
        variance entirely &mdash; you compare your odds to the closing line, not to whether your bet won.
      </p>

      <Predict question="To get a ±1pp confidence interval on edge, how many bets do you need? Compare ROI vs CLV.">
        ROI: ~<span className="font-mono text-rose-300">{roiNeedsForOnePp.toLocaleString()}</span> bets
        (~{Math.ceil(roiNeedsForOnePp / 380)} Brasileirão seasons). CLV:
        ~<span className="font-mono text-emerald-300">{clvNeedsForOnePp.toLocaleString()}</span> bets
        (~{Math.ceil(clvNeedsForOnePp * 4 / 380) / 4} seasons). The 290&times; ratio is why every sharp
        operator runs on CLV first and only checks ROI quarterly.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-200 font-mono">N · bets observed</span>
              <span className="text-neutral-300 font-mono tabular-nums">{nBets}</span>
            </div>
            <input type="range" min="20" max="3000" step="10" value={nBets} onChange={(e) => setNBets(parseInt(e.target.value, 10))} className="bs-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>20</span><span>500</span><span>1500</span><span>3000</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-200 font-mono">true edge</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(trueEdge * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.060" step="0.005" value={trueEdge} onChange={(e) => setTrueEdge(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="ROI 95% ½-width" value={`±${(roiHalfWidth * 100).toFixed(1)}pp`} sub={trueEdge * 100 < roiHalfWidth * 100 ? 'edge < CI · undetectable' : 'edge detectable'} color={trueEdge * 100 < roiHalfWidth * 100 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="CLV 95% ½-width" value={`±${(clvHalfWidth * 100).toFixed(2)}pp`} sub={trueEdge * 100 < clvHalfWidth * 100 ? 'edge < CI' : 'edge detectable'} color={trueEdge * 100 < clvHalfWidth * 100 ? 'text-rose-300' : 'text-emerald-300'} />
          </div>
          <div className="text-[11px] text-neutral-500 leading-snug">
            CLV detects a {(trueEdge * 100).toFixed(1)}% edge with {nBets} bets;
            ROI needs <span className="font-mono text-neutral-300">~{Math.ceil(Math.pow(1.96 * 0.85 / trueEdge, 2)).toLocaleString()}</span> bets to do the same.
          </div>
        </div>

        {/* Visual: two confidence-interval bars showing ROI vs CLV */}
        <svg viewBox="0 0 320 170" className="w-full h-auto">
          {/* Center vertical: trueEdge */}
          <line x1={160} y1={20} x2={160} y2={140} stroke="#a3a3a3" strokeWidth="0.5" strokeDasharray="3,3" />
          <text x={160} y={14} fontSize="8" textAnchor="middle" fill="#a3a3a3">true edge {(trueEdge * 100).toFixed(1)}%</text>
          {/* ROI band */}
          {(() => {
            const center = 160;
            const span = 140; // px per 10pp (so 1pp = 14px)
            const halfPx = roiHalfWidth * 100 * 14;
            const w = Math.min(280, halfPx * 2);
            const x = Math.max(20, center - halfPx);
            return (
              <g>
                <rect x={x} y={45} width={w} height={20} rx="3" fill="rgba(251,113,133,0.20)" stroke="#fb7185" strokeOpacity="0.5" />
                <text x={center} y={59} fontSize="9" textAnchor="middle" fill="#fb7185" fontFamily="monospace">ROI 95% CI</text>
                <text x={x + 4} y={42} fontSize="8" fill="#fb7185" fontFamily="monospace">−{(roiHalfWidth * 100).toFixed(1)}</text>
                <text x={x + w - 4} y={42} fontSize="8" textAnchor="end" fill="#fb7185" fontFamily="monospace">+{(roiHalfWidth * 100).toFixed(1)}</text>
              </g>
            );
          })()}
          {/* CLV band */}
          {(() => {
            const center = 160;
            const span = 140;
            const halfPx = clvHalfWidth * 100 * 14;
            const w = Math.max(2, halfPx * 2);
            const x = center - halfPx;
            return (
              <g>
                <rect x={x} y={95} width={w} height={20} rx="3" fill="rgba(110,231,183,0.30)" stroke="#6ee7b7" strokeOpacity="0.7" />
                <text x={center} y={109} fontSize="9" textAnchor="middle" fill="#6ee7b7" fontFamily="monospace">CLV 95% CI</text>
                <text x={center} y={92} fontSize="8" textAnchor="middle" fill="#6ee7b7" fontFamily="monospace">±{(clvHalfWidth * 100).toFixed(2)}pp</text>
              </g>
            );
          })()}
          {/* axis */}
          <line x1={20} y1={150} x2={300} y2={150} stroke="#525252" strokeWidth="0.5" />
          {[-10, -5, 0, 5, 10].map(p => {
            const x = 160 + p * 14;
            return <g key={p}><line x1={x} y1={148} x2={x} y2={152} stroke="#737373" strokeWidth="0.5" /><text x={x} y={163} fontSize="8" textAnchor="middle" fill="#737373">{p}%</text></g>;
          })}
        </svg>
      </div>

      <Worked title="Worked example · sharp bettor, terrible streak">
        <p>
          200 bets at average +2.4% CLV, but ROI is <span className="text-rose-300">−1.8%</span>. Is this
          person sharp or lucky-and-fading?
        </p>
        <p>
          <strong>Sharp.</strong> The CLV CI ({(0.05 * 1.96 / Math.sqrt(200) * 100).toFixed(2)}pp) excludes
          zero by ~3 standard errors &mdash; statistically the bettor is beating the market. The ROI
          (-1.8%) sits well within its own CI ({(0.85 * 1.96 / Math.sqrt(200) * 100).toFixed(1)}pp); a
          minus-1.8% ROI on a true +2.4% edge with this much variance happens roughly 1 in 5 times. Keep
          betting; the variance will revert.
        </p>
        <p>
          The wrong response is to abandon a +CLV strategy because P&amp;L is down. The wronger response
          is to celebrate a +ROI strategy that&apos;s -CLV. ROI without CLV is reading the noise.
        </p>
      </Worked>

      <WhenItMatters>
        For evaluation: always. The wedge between the two metrics is largest exactly when you most need
        clarity (small samples, marginal edge). Track CLV per bet, average per week; track ROI quarterly
        as a sanity check.
      </WhenItMatters>

      <Misconception
        wrong="If my ROI is positive over 500 bets, I have edge."
        right="A bettor with zero true edge has roughly a 30% chance of positive ROI after 500 bets. ROI alone is not evidence of skill at this sample size."
        because="The standard error on per-bet returns at typical odds is ~85%; over 500 bets it’s 85%/√500 ≈ 3.8%. Easily one standard error away from a zero-edge null. CLV’s standard error on the same sample is ~0.22%, which actually distinguishes signal from noise."
      />

      <Deeper>
        <p>
          <strong>Why CLV is so much less noisy than ROI.</strong> CLV per bet is{' '}
          <Eq>{'\\frac{p^*_t - p_{\\text{close}}}{p_{\\text{close}}}'}</Eq>, where <Eq>{'p^*_t'}</Eq> is
          your bet&apos;s vig-stripped probability and <Eq>{'p_{\\text{close}}'}</Eq> is the closing line&apos;s.
          It removes <em>realized outcome variance</em> entirely &mdash; you don&apos;t care if you won; you
          care that the line moved against the market by the close. Standard deviation drops from ~85%
          (return) to ~5% (line move).
        </p>
        <p>
          <strong>CLV is a near-sufficient statistic for long-run edge.</strong> Empirical studies on
          Pinnacle (Buchdahl 2018, Kuypers 2000): a +1% Pinnacle CLV bettor returns ~+0.7% ROI over
          thousands of bets, almost linearly. The mapping isn&apos;t exact (closing-line move correlates
          with but doesn&apos;t equal true probability move), but it&apos;s tight enough that
          tracking CLV gives you near-real-time visibility into edge.
        </p>
        <p>
          <strong>Pinnacle CLV is the gold standard.</strong> The closing line on a sharp book reflects
          where sharp money settles. Soft-book closing lines are weaker and produce noisier CLV signals.
          If you only have access to soft books, take an average of soft-book closing lines OR find the
          Pinnacle closing line via a feed and use that as the reference even if you bet elsewhere.
        </p>
        <p>
          <strong>Monitoring cadence.</strong> Per-bet CLV; per-week mean; per-month rolling
          significance test (one-sample t-test against null = 0). If CLV mean drops below zero for two
          consecutive months, your edge has degraded &mdash; investigate model drift before another
          quarter of P&amp;L confirms it.
        </p>
      </Deeper>

      <QA items={[
        { q: 'I can’t access Pinnacle. What do I use as the closing line?',
          a: 'Best alternative: average the closing odds across the 3-4 sharpest books accessible (Pinnacle, Circa, BetCRIS, SBOBet). If you really only have soft-book data, use the consensus closing line from oddsportal/oddsjam, but expect 2-3× more CLV variance.' },
        { q: 'My CLV is +1% on Pinnacle. What ROI should I expect?',
          a: 'Roughly +0.7% gross ROI over a long sample, before vig-shopping or limit considerations. Net of operational friction: 0.3–0.5% ROI. Significant for any bankroll of size; don’t expect 5%+ "ROI" without much higher CLV.' },
        { q: 'Does CLV apply to in-play markets?',
          a: 'Yes — but the "closing" line is the line at match end (or at the time the bet settles). CLV in-play measures whether the line moved against your position from your bet to settlement. Same concept, slightly fiddlier to compute.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — WALK-FORWARD CV & TEMPORAL LEAKAGE
   Why random k-fold lies on time series. Expanding vs rolling windows.
   Embargo + purging. CPCV. Mapped to the user's pinned cv.yaml seed.
   ========================================================================== */

const WalkForwardCard = () => {
  const [scheme, setScheme] = useState('walkfwd-exp');
  const [embargo, setEmbargo] = useState(2);

  const W = 320, H = 130, P = 18;
  const N_FIXTURES = 30;
  const fixtureW = (W - 2 * P) / N_FIXTURES;
  // Build folds based on scheme
  const folds = (() => {
    if (scheme === 'random') {
      // Random k-fold — interleaved
      const f = [];
      for (let k = 0; k < 4; k++) {
        const train = [], val = [];
        for (let i = 0; i < N_FIXTURES; i++) {
          if (i % 4 === k) val.push(i); else train.push(i);
        }
        f.push({ train, val, embargo: [] });
      }
      return f;
    }
    if (scheme === 'walkfwd-exp') {
      // Expanding-window walk-forward
      const f = [];
      const stride = 6;
      for (let k = 0; k < 4; k++) {
        const valStart = 6 + k * stride;
        const valEnd = Math.min(N_FIXTURES, valStart + stride);
        const trainEnd = valStart - embargo;
        f.push({
          train: Array.from({ length: Math.max(0, trainEnd) }, (_, i) => i),
          val: Array.from({ length: valEnd - valStart }, (_, i) => valStart + i),
          embargo: Array.from({ length: embargo }, (_, i) => trainEnd + i),
        });
      }
      return f;
    }
    if (scheme === 'walkfwd-roll') {
      // Rolling-window walk-forward (fixed train length)
      const f = [];
      const stride = 6, trainLen = 12;
      for (let k = 0; k < 4; k++) {
        const valStart = trainLen + k * stride;
        const valEnd = Math.min(N_FIXTURES, valStart + stride);
        const trainEnd = valStart - embargo;
        const trainStart = Math.max(0, trainEnd - trainLen);
        f.push({
          train: Array.from({ length: trainEnd - trainStart }, (_, i) => trainStart + i),
          val: Array.from({ length: valEnd - valStart }, (_, i) => valStart + i),
          embargo: Array.from({ length: embargo }, (_, i) => trainEnd + i),
        });
      }
      return f;
    }
    // CPCV — combinatorial purged CV (just show 4 illustrative non-contiguous splits)
    const f = [];
    const groupSize = 4;
    for (let k = 0; k < 4; k++) {
      const valGroups = [k * 2, k * 2 + 4]; // 2 non-contiguous validation groups per split
      const val = [];
      const train = [];
      const purged = [];
      for (let i = 0; i < N_FIXTURES; i++) {
        const g = Math.floor(i / groupSize);
        if (valGroups.includes(g)) val.push(i);
        else if (valGroups.some(vg => Math.abs(g - vg) <= 1) && i < 24) purged.push(i);
        else train.push(i);
      }
      f.push({ train, val, embargo: purged });
    }
    return f;
  })();

  // Detect leakage: for the random scheme, every train row precedes a val row in the future
  const leakRows = scheme === 'random' ? folds.length : 0;

  return (
    <Card id="walkfwd" icon={Hourglass} title="Walk-forward CV — the only honest evaluator" accent="violet" index={3}
          subtitle="Random k-fold on time series leaks the future into training. Walk-forward + embargo + purging is the discipline that makes a backtest mean something.">
      <MinSchema>
        For time-indexed data, validation must be <em>strictly later</em> than training. Add an
        <Term>embargo</Term> gap to cover any feature-side leakage; <Term>purging</Term> drops training
        rows whose labels overlap validation. Without these, your backtest is <em>fiction</em>.
      </MinSchema>

      <p>
        The cardinal sin: random k-fold cross-validation on a time series. Sklearn&apos;s default
        <code className="text-xs"> KFold</code> mixes future and past in every fold. On a betting model,
        this gives stunning CV scores that vanish in production &mdash; the model has effectively
        memorized future fixtures it shouldn&apos;t have seen. <Term>walk-forward CV</Term> with
        <Term>embargo</Term> + <Term>purging</Term> is the fix. Pick scheme + embargo carefully &mdash;
        too short and you leak feature lookahead; too long and you waste data.
      </p>

      <Predict question="Pick the random-CV scheme below. How many folds train on data that occurs AFTER their validation set?">
        All 4. Random k-fold places no temporal constraint, so on average ~50% of training rows in
        every fold are dated AFTER validation rows. The model sees the future and your CV score is
        meaningless. Switch to walk-forward; the count drops to zero.
      </Predict>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'random',       label: 'Random k-fold (DON\'T)' },
            { id: 'walkfwd-exp',  label: 'Walk-forward · expanding' },
            { id: 'walkfwd-roll', label: 'Walk-forward · rolling' },
            { id: 'cpcv',         label: 'CPCV (López de Prado)' },
          ].map(s => (
            <button key={s.id} onClick={() => setScheme(s.id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                scheme === s.id
                  ? (s.id === 'random' ? 'bg-rose-500/15 border-rose-400/40 text-rose-200' : 'bg-violet-500/15 border-violet-400/40 text-violet-100')
                  : 'border-white/10 text-neutral-400 hover:bg-white/5'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {(scheme.startsWith('walkfwd') || scheme === 'cpcv') && (
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-violet-200 font-mono">embargo (fixtures)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{embargo}</span>
            </div>
            <input type="range" min="0" max="5" step="1" value={embargo} onChange={(e) => setEmbargo(parseInt(e.target.value, 10))} className="bs-range w-full" />
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            <span className="text-emerald-300">■ train</span> · <span className="text-fuchsia-300">■ validation</span> · <span className="text-amber-300">■ embargo / purged</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {folds.map((f, k) => {
              const y = 12 + k * 26;
              return (
                <g key={k}>
                  <text x={4} y={y + 9} fontSize="9" fill="#a3a3a3" fontFamily="monospace">f{k+1}</text>
                  {Array.from({ length: N_FIXTURES }).map((_, i) => {
                    const x = P + i * fixtureW;
                    const isTrain = f.train.includes(i);
                    const isVal = f.val.includes(i);
                    const isEmbargo = f.embargo.includes(i);
                    const fill = isTrain ? '#34d399' : isVal ? '#f0abfc' : isEmbargo ? '#fbbf24' : 'rgba(255,255,255,0.03)';
                    const opacity = isTrain ? 0.55 : isVal ? 0.75 : isEmbargo ? 0.65 : 1;
                    return <rect key={i} x={x + 0.4} y={y} width={fixtureW - 0.8} height={14} fill={fill} opacity={opacity} rx={1} />;
                  })}
                </g>
              );
            })}
            {/* time axis */}
            <line x1={P} y1={H - 8} x2={W - P} y2={H - 8} stroke="#525252" strokeWidth="0.5" />
            <text x={P} y={H - 1} fontSize="8" fill="#737373">fixture 1</text>
            <text x={W - P} y={H - 1} fontSize="8" textAnchor="end" fill="#737373">fixture {N_FIXTURES}</text>
            <text x={W / 2} y={H - 1} fontSize="8" textAnchor="middle" fill="#737373">→ time</text>
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="leaky folds" value={leakRows} sub="train > val in time" color={leakRows > 0 ? 'text-rose-300' : 'text-emerald-300'} />
          <Stat label="train rows" value={folds[0]?.train.length || 0} sub="first fold" color="text-emerald-300" />
          <Stat label="val rows" value={folds[0]?.val.length || 0} sub="first fold" color="text-fuchsia-300" />
        </div>
      </div>

      <Worked title="Worked example · why embargo matters">
        <p>
          Suppose your <code className="text-xs">home_xg_for_5g</code> feature for fixture <Eq>{'t'}</Eq>
          is the rolling 5-match xG <em>through</em> match <Eq>{'t-1'}</Eq>. If your validation starts at
          fixture <Eq>{'t = 50'}</Eq>, training rows up to <Eq>{'t = 49'}</Eq> are fine &mdash; but{' '}
          <em>they include</em> the rolling-window computation that wraps into fixtures 45-49, which are
          ALSO in your validation set if those fixtures haven&apos;t happened yet.
        </p>
        <p>
          Embargo of <span className="font-mono text-amber-300">5</span> fixtures (the rolling window
          length) drops the training rows whose feature window overlaps the validation period. The
          backtest score reads honestly. The user&apos;s{' '}
          <span className="font-mono text-fuchsia-300">configs/cv.yaml</span> with a pinned
          <code className="text-xs"> walk_forward.seed</code> + a leakage-lint contract test is exactly
          this discipline encoded.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; this is the highest-stakes evaluation decision in the entire pipeline. A model
        evaluated under random CV that &ldquo;works&rdquo; will fail spectacularly in production; the
        damage isn&apos;t &ldquo;a few percentage points&rdquo;, it&apos;s &ldquo;the inferred edge was
        artifactual&rdquo;.
      </WhenItMatters>

      <Misconception
        wrong="My data is large, so a little time leakage washes out."
        right="Time leakage compounds. With 10k matches and rolling features, random CV can over-state log-loss reductions by 10-30% in absolute terms — enough to flip every modeling decision."
        because="Tree models exploit any leakage they can find. Even a tiny systematic time advantage gets weighted into the model and amplified by hyperparameter tuning. The bigger the model and the more aggressive the HPO, the more it learns the leakage."
      />

      <Deeper>
        <p>
          <strong>Embargo size = max feature lookahead horizon.</strong> If your features look back N
          matches OR forward (e.g. an upcoming-fixtures feature), embargo at least N. For most football
          modeling: 5-10 fixtures is a safe default; 30+ for season-aggregate features.
        </p>
        <p>
          <strong>Purging vs embargoing.</strong> Embargo: drop training rows whose <em>features</em>
          could leak from validation. Purge: drop training rows whose <em>labels</em> overlap validation
          (e.g. a multi-week aggregate target). They&apos;re both gaps in time; together they&apos;re
          López de Prado&apos;s <Term>CPCV</Term> framework.
        </p>
        <p>
          <strong>CPCV = Combinatorial Purged Cross-Validation.</strong> Generates many more
          train/test splits than walk-forward (giving better statistical power), all with purging +
          embargo. Strictly dominates walk-forward when you can afford the compute. The catch: each
          split needs careful purging logic, and the resulting splits are non-contiguous (harder to
          reason about). Read López de Prado, &ldquo;Advances in Financial ML&rdquo; ch. 7.
        </p>
        <p>
          <strong>Inner CV must also be walk-forward.</strong> A common bug: outer CV walks forward,
          but inner CV (HPO) uses random k-fold. The HPO then picks hyperparameters optimized for
          time-leaked performance, which the outer CV correctly punishes &mdash; you ship a model with
          objectively bad hyperparameters because the meta-search was dishonest. The user&apos;s
          <code className="text-xs"> tests/contracts/test_hyperparam_search_isolation.py</code> guards
          this exact bug.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I always use CPCV?',
          a: 'For research / publishable backtests, yes. For routine HPO, walk-forward expanding window is usually sufficient and 5–10× cheaper. Reserve CPCV for the moment you commit to a strategy.' },
        { q: 'How many CV folds for walk-forward?',
          a: '5–8 folds is the sweet spot for Brasileirão-scale data (~10y of seasons). More folds → more variance reduction, but each fold trains on less data. Below 5 is statistically thin; above 10 is diminishing returns.' },
        { q: 'Is walk-forward worse than k-fold for hyperparameter convergence?',
          a: 'Slightly — fewer effective trials per fold, more variance per fold. The HPO search has to be more careful (multi-fidelity helps), but the resulting hyperparameters are honest. Don’t trade honesty for speed here.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — MULTIPLE TESTING INFLATION & DEFLATED SHARPE
   The best of N trials is biased upward by an amount that depends on N and on
   the variance of the trial distribution. López de Prado's deflated Sharpe
   formalizes this; almost no betting backtests apply it.
   ========================================================================== */

const MultipleTestingCard = () => {
  const [N, setN] = useState(50);
  const [sharpe, setSharpe] = useState(1.4);
  // Expected max of N standard normals approximation: sqrt(2 ln N) (Gumbel-style)
  const expMaxZ = Math.sqrt(2 * Math.log(Math.max(2, N)));
  // If trial distribution has standard error 0.4, expected best Sharpe is just E[max] * 0.4
  const trialSE = 0.4;
  const expectedBestSharpe = expMaxZ * trialSE;
  // Deflated Sharpe (Bailey & López de Prado approximation):
  const deflated = Math.max(0, sharpe - expectedBestSharpe);
  const inflated = sharpe < expectedBestSharpe;

  return (
    <Card id="multest" icon={Filter} title="Multiple-testing inflation" accent="amber" index={4}
          subtitle="Every trial you ran (every model, every feature subset, every HPO config) inflates the apparent edge of your winner. The deflated Sharpe corrects for it.">
      <MinSchema>
        The maximum of N noisy estimates is biased upward by roughly <Eq>{'\\sigma\\sqrt{2\\ln N}'}</Eq>.
        Apply the <Term>deflated Sharpe</Term> correction. Without it, your &ldquo;winning&rdquo; backtest
        is almost certainly random.
      </MinSchema>

      <p>
        You ran 50 model variants, 200 HPO configs each, across 3 markets and 8 CV folds. The best one
        had Sharpe 1.4. Is that real? Probably not. The expected maximum of 50 independent noisy Sharpe
        estimates with reasonable per-trial standard error is around{' '}
        <span className="font-mono text-amber-300">{expectedBestSharpe.toFixed(2)}</span> &mdash; you
        should EXPECT a Sharpe of that magnitude even if your true edge is zero. The
        <Term>deflated Sharpe</Term> subtracts this expected inflation. If your apparent Sharpe doesn&apos;t
        clear the deflation, your &ldquo;winner&rdquo; is white noise.
      </p>

      <Predict question="You ran 50 model variants and the best had Sharpe 1.4. What's your true Sharpe expectation after deflation?">
        About <span className="font-mono text-amber-300">{deflated.toFixed(2)}</span>. The deflation eats
        most of the apparent edge. Drag N below to see how the expected inflation scales with the
        search budget &mdash; the more configs you tried, the more your best is selection-biased.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-200 font-mono">N · trials</span>
              <span className="text-neutral-300 font-mono tabular-nums">{N}</span>
            </div>
            <input type="range" min="1" max="500" step="1" value={N} onChange={(e) => setN(parseInt(e.target.value, 10))} className="bs-range w-full" />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
              <span>1</span><span>50</span><span>200</span><span>500</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-200 font-mono">apparent Sharpe</span>
              <span className="text-neutral-300 font-mono tabular-nums">{sharpe.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="3.5" step="0.05" value={sharpe} onChange={(e) => setSharpe(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="apparent" value={sharpe.toFixed(2)} sub="best of N trials" color="text-amber-300" />
            <Stat label="inflation" value={`-${expectedBestSharpe.toFixed(2)}`} sub="E[max] under null" color="text-rose-300" />
            <Stat label="deflated" value={deflated.toFixed(2)} sub={inflated ? 'edge consistent with noise' : 'survives correction'} color={inflated ? 'text-rose-300' : 'text-emerald-300'} />
          </div>
          {inflated && (
            <div className="text-[11px] text-rose-300 leading-snug">
              ⚠ Deflated Sharpe ≤ 0: your &ldquo;winning&rdquo; backtest is statistically indistinguishable
              from a random search through pure noise.
            </div>
          )}
        </div>

        {/* Visual: distribution of best-of-N vs single Sharpe */}
        <svg viewBox="0 0 320 170" className="w-full h-auto">
          {/* x-axis: Sharpe values 0 to 3.5 */}
          <line x1={20} y1={140} x2={300} y2={140} stroke="#525252" strokeWidth="0.5" />
          {/* draw curves */}
          {(() => {
            const xs = [];
            for (let s = 0; s <= 3.5; s += 0.05) {
              // Approximate Gaussian PDF for single-trial Sharpe at mean=0, sd=trialSE
              const single = Math.exp(-(s * s) / (2 * trialSE * trialSE)) / (trialSE * Math.sqrt(2 * Math.PI));
              // Best of N: PDF approx N * single * Phi(s/sd)^(N-1)
              const cdf = 0.5 * (1 + Math.tanh(s / (trialSE * 1.4)));
              const best = N * single * Math.pow(cdf, N - 1);
              xs.push({ s, single, best });
            }
            const maxV = Math.max(...xs.map(p => Math.max(p.single, p.best)));
            const xx = (s) => 20 + (s / 3.5) * 280;
            const yy = (v) => 140 - (v / maxV) * 110;
            const singlePts = xs.map(p => `${xx(p.s).toFixed(1)},${yy(p.single).toFixed(1)}`).join(' ');
            const bestPts = xs.map(p => `${xx(p.s).toFixed(1)},${yy(p.best).toFixed(1)}`).join(' ');
            return (
              <g>
                <polyline points={singlePts} fill="none" stroke="#a3a3a3" strokeWidth="1.4" opacity="0.7" />
                <polyline points={bestPts} fill="none" stroke="#fbbf24" strokeWidth="1.6" opacity="0.85" />
                {/* fills under */}
                <polyline points={`${xx(0)},140 ${singlePts} ${xx(3.5)},140`} fill="rgba(163,163,163,0.10)" stroke="none" />
                <polyline points={`${xx(0)},140 ${bestPts} ${xx(3.5)},140`} fill="rgba(251,191,36,0.10)" stroke="none" />
                {/* current Sharpe marker */}
                <line x1={xx(sharpe)} y1={20} x2={xx(sharpe)} y2={140} stroke="#f0abfc" strokeWidth="1" strokeDasharray="3,3" />
                <text x={xx(sharpe)} y={16} fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="monospace">{sharpe.toFixed(2)}</text>
                {/* expected best marker */}
                <line x1={xx(expectedBestSharpe)} y1={50} x2={xx(expectedBestSharpe)} y2={140} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2,2" />
                <text x={xx(expectedBestSharpe)} y={47} fontSize="8" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">E[max] {expectedBestSharpe.toFixed(2)}</text>
              </g>
            );
          })()}
          {/* axis labels */}
          {[0, 1, 2, 3].map(s => <text key={s} x={20 + (s / 3.5) * 280} y={152} fontSize="8" textAnchor="middle" fill="#737373">{s}</text>)}
          <text x={160} y={163} fontSize="8" textAnchor="middle" fill="#737373">Sharpe under null</text>
          {/* legend */}
          <g transform="translate(180, 32)">
            <rect x="0" y="-6" width="6" height="6" fill="#a3a3a3" opacity="0.7" rx="1" />
            <text x="9" y="0" fontSize="8" fill="#a3a3a3">single trial</text>
            <rect x="0" y="6" width="6" height="6" fill="#fbbf24" opacity="0.85" rx="1" />
            <text x="9" y="12" fontSize="8" fill="#fbbf24">best of N={N}</text>
          </g>
        </svg>
      </div>

      <Worked title="Worked example · the user’s own search budget">
        <p>
          The user&apos;s pipeline runs feature-set tiers (4) &times; markets (~6) &times; model variants
          (calibrated / raw-cats / tuned ≈ 3) &times; HPO trials (~50) &times; CV folds (~8). Effective
          search budget across one full pipeline run: <span className="font-mono text-amber-300">~28,800</span>{' '}
          comparisons.
        </p>
        <p>
          Expected inflation under the null at this scale:{' '}
          <Eq>{'\\sigma \\cdot \\sqrt{2\\ln 28800} \\approx 4.5\\sigma'}</Eq>. So the &ldquo;best&rdquo; configuration&apos;s
          apparent Sharpe should be deflated by roughly 4.5 standard errors of a single Sharpe estimate.
          On Brasileirão-scale data, that&apos;s a deflation of ~1.5 in raw Sharpe units. A naive
          &ldquo;Sharpe 1.8 winner&rdquo; deflates to ~0.3 &mdash; statistically marginal.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever you select a model, feature set, or hyperparameter from a search across many
        candidates. The bigger the search, the bigger the inflation. Most academic and most
        retail-betting backtests omit deflation entirely.
      </WhenItMatters>

      <Misconception
        wrong="I only ship one model, so I don't have a multiple-testing problem."
        right="The inflation is set by how many you TRIED, not how many you ship. The act of selecting the best biases its CV score upward — even if you discard the rest."
        because="Selection bias is irreversible from the outcome. The only correction is structural: count your search budget honestly (every model variant, every HPO trial, every feature subset), then deflate. If you can’t count it, your apparent edge is uninterpretable."
      />

      <Deeper>
        <p>
          <strong>The deflated Sharpe formula (Bailey &amp; López de Prado 2014).</strong>{' '}
          <Eq>{'\\mathrm{DSR} = \\Phi\\left( (\\mathrm{SR} - \\mathrm{E}[\\mathrm{SR}_{\\max}]) \\cdot \\frac{\\sqrt{T-1}}{\\sqrt{1 - \\hat{\\gamma}_3 \\cdot \\mathrm{SR} + \\frac{\\hat{\\gamma}_4 - 1}{4} \\cdot \\mathrm{SR}^2}} \\right)'}</Eq>{' '}
          where <Eq>{'T'}</Eq> is sample length and <Eq>{'\\hat{\\gamma}_{3,4}'}</Eq> are skewness and
          kurtosis of returns. Outputs a probability that the strategy&apos;s true Sharpe exceeds zero.
          Aim for <Eq>{'\\mathrm{DSR} > 0.95'}</Eq> before deploying.
        </p>
        <p>
          <strong>FDR vs family-wise correction.</strong> If you&apos;re testing many features for selection,
          control <Term>FDR</Term> at q=0.10 with Benjamini-Hochberg &mdash; less conservative than
          <Term>Bonferroni</Term> when tests are correlated (which features always are). For final-strategy
          deflation, use deflated Sharpe; for feature selection, use BH-FDR.
        </p>
        <p>
          <strong>Out-of-time reset is the cleanest correction.</strong> Hold out the most recent
          ~12 months of fixtures from <em>all</em> model selection / HPO. After all decisions are
          locked, evaluate on this held-out set ONCE. If the held-out CLV / Sharpe is comparable to the
          in-search estimate, your search wasn&apos;t inflated. If it cratered, you over-fit. Cheap and
          reliable; the gold standard.
        </p>
        <p>
          <strong>Connection to feature selection.</strong>{' '}
          <CrossLink to="forecasters-craft" recap="Sibling: Feature selection that works (stability + adversarial validation)." external>The Forecaster&apos;s Craft</CrossLink>{' '}
          discussed stability selection across folds &mdash; the same principle, applied to features
          instead of models. Stability is essentially built-in deflation: if a feature only wins in
          one fold, it&apos;s probably noise.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I count the number of trials honestly?',
          a: 'Every distinct configuration you evaluated and compared on the same data. HPO trials, feature subsets, model families, CV seeds. If two configs are nominally different but evaluated against the same backtest, they count.' },
        { q: 'What if my "best" model survives deflation?',
          a: 'Then deploy with confidence — it’s probably real. Still hold out a final out-of-time set to confirm before scaling stake.' },
        { q: 'Should I use deflated Sharpe or just CLV?',
          a: 'CLV is far less noisy and harder to inflate (it\'s per-bet, not per-strategy). For *operational* monitoring, prefer CLV. For *publishing or shipping a new strategy*, also report deflated Sharpe — it directly addresses the multiple-testing concern.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — KELLY GEOMETRY
   The growth-vs-bet-fraction curve. f* = (bp - q) / b. The geometry shows
   why under-betting < f* loses growth and over-betting > f* loses MORE
   growth (and approaches negative growth).
   ========================================================================== */

const KellyCard = () => {
  const [p, setP] = useState(0.55);
  const [b, setB] = useState(1.0);  // odds-1 (so decimal odds 2.0 → b=1)
  const [f, setF] = useState(0.10);
  const q = 1 - p;
  const fStar = Math.max(0, (b * p - q) / b);
  const growthAt = (fr) => p * Math.log(1 + fr * b) + q * Math.log(1 - fr);
  const gStar = growthAt(fStar);
  const gFull = growthAt(1.0);  // diverges if 1-1<=0 i.e. unbounded
  const gFractional = (mult) => growthAt(fStar * mult);

  // Build curve
  const W = 320, H = 160, P = 24;
  const xMax = Math.min(0.5, fStar * 3 + 0.05);
  const sx = (fr) => P + (fr / xMax) * (W - 2 * P);
  const yMin = Math.min(growthAt(xMax), -0.05);
  const yMax = Math.max(0.001, gStar * 1.15);
  const sy = (g) => H - 16 - ((g - yMin) / (yMax - yMin)) * (H - 30);

  const curvePts = [];
  for (let fr = 0; fr <= xMax; fr += xMax / 200) {
    const g = growthAt(fr);
    if (Number.isFinite(g)) curvePts.push(`${sx(fr).toFixed(1)},${sy(g).toFixed(1)}`);
  }

  return (
    <Card id="kelly" icon={Sigma} title="Kelly geometry — growth vs bet fraction" accent="emerald" index={5}
          subtitle="The growth rate as a function of stake fraction has a single peak at f*. Drift left of it and you under-grow; drift right of it and you over-bet — eventually below zero growth.">
      <MinSchema>
        Maximize <em>expected log-growth</em>, not expected value:{' '}
        <Eq>{'g(f) = p\\log(1 + fb) + (1-p)\\log(1-f)'}</Eq>.
        Optimum: <Eq>{'f^* = (bp - q)/b'}</Eq>. Both under-betting AND over-betting cost growth;
        over-betting costs <em>more</em>.
      </MinSchema>

      <p>
        Kelly&apos;s 1956 insight: in a sequence of bets you re-stake from your <em>current</em> bankroll
        each time, so what compounds is the <em>geometric</em> mean of returns, not the arithmetic. The
        bet fraction <Eq>{'f'}</Eq> that maximizes the geometric mean is{' '}
        <Eq>{'f^* = (bp - q)/b'}</Eq>. Below <Eq>{'f^*'}</Eq>, you grow more slowly than possible;
        above it, you grow more slowly AND eventually negative. The curve is asymmetric &mdash; the cost
        of over-betting is sharper than the cost of under-betting. That asymmetry is the heart of why
        sharp bettors use <em>fractional</em> Kelly, not full Kelly.
      </p>

      <Predict question="Drag the bet fraction f. How does growth compare at f = f*/2 (half-Kelly), f* (full), and f = 2·f* (double)?">
        Half-Kelly captures roughly <span className="font-mono text-emerald-300">75%</span> of full
        growth at <span className="font-mono text-rose-300">~25%</span> of the variance. Double-Kelly
        loses <em>all</em> growth back to zero (or below). The sweet spot for survival is somewhere
        between half and full Kelly.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-200 font-mono">true p (your edge)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(p * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.30" max="0.80" step="0.01" value={p} onChange={(e) => setP(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-200 font-mono">b (odds − 1)</span>
              <span className="text-neutral-300 font-mono tabular-nums">{b.toFixed(2)}</span>
            </div>
            <input type="range" min="0.30" max="3.00" step="0.05" value={b} onChange={(e) => setB(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-fuchsia-300 font-mono">your bet fraction f</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(f * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0" max="0.50" step="0.005" value={f} onChange={(e) => setF(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="f*" value={`${(fStar * 100).toFixed(1)}%`} sub="full Kelly" color="text-emerald-300" />
            <Stat label="g(f) per bet" value={`${(growthAt(f) * 100).toFixed(2)}%`} sub={`vs g* = ${(gStar * 100).toFixed(2)}%`} color={growthAt(f) >= gStar * 0.85 ? 'text-emerald-300' : growthAt(f) > 0 ? 'text-amber-300' : 'text-rose-300'} />
            <Stat label="½ Kelly" value={`${(gFractional(0.5) * 100).toFixed(2)}%`} sub={`${((gFractional(0.5) / Math.max(1e-9, gStar)) * 100).toFixed(0)}% of full growth`} color="text-emerald-300" />
            <Stat label="2× Kelly" value={`${(gFractional(2.0) * 100).toFixed(2)}%`} sub="growth gone" color={gFractional(2.0) > 0 ? 'text-amber-300' : 'text-rose-300'} />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-auto">
          {/* axes */}
          <line x1={P} y1={H - 16} x2={W - P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} y1={20} x2={P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          {/* zero line */}
          <line x1={P} y1={sy(0)} x2={W - P} y2={sy(0)} stroke="#525252" strokeWidth="0.4" strokeDasharray="2,3" />
          <text x={W - P + 2} y={sy(0) + 3} fontSize="8" fill="#737373">0</text>
          {/* curve */}
          <polyline points={curvePts.join(' ')} fill="none" stroke="#6ee7b7" strokeWidth="1.6" opacity="0.85" />
          {/* fill under to zero where positive */}
          <polyline points={`${sx(0)},${sy(0)} ${curvePts.join(' ')} ${sx(xMax)},${sy(0)}`} fill="rgba(110,231,183,0.10)" stroke="none" />
          {/* f* marker */}
          {fStar > 0 && fStar < xMax && (
            <g>
              <line x1={sx(fStar)} y1={sy(gStar)} x2={sx(fStar)} y2={H - 16} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3,3" />
              <circle cx={sx(fStar)} cy={sy(gStar)} r="3.5" fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1" />
              <text x={sx(fStar)} y={sy(gStar) - 8} fontSize="9" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">f*={(fStar*100).toFixed(1)}%</text>
            </g>
          )}
          {/* current f marker */}
          {f >= 0 && f <= xMax && (
            <g>
              <circle cx={sx(f)} cy={sy(growthAt(f))} r="4" fill="#f0abfc" stroke="#0a0a0a" strokeWidth="1" />
              <text x={sx(f)} y={sy(growthAt(f)) + 14} fontSize="9" textAnchor="middle" fill="#f0abfc" fontFamily="monospace">your f</text>
            </g>
          )}
          {/* x-axis label only — y-axis caption rendered as HTML below */}
          <text x={W / 2} y={H + 3} fontSize="9" textAnchor="middle" fill="#a3a3a3">bet fraction f</text>
        </svg>
        <div className="text-[9px] text-neutral-500 -mt-1 text-center">y-axis: <span className="font-mono text-neutral-400">log-growth g(f)</span></div>
      </div>

      <Worked title="Worked example · Brasileirão home favourite at 2.10">
        <p>
          Your model says <Eq>{'p = 0.52'}</Eq> for the home win; the bookmaker offers decimal odds
          <Eq>{'2.10'}</Eq>, so <Eq>{'b = 1.10'}</Eq>. Then{' '}
          <Eq>{'f^* = (1.10 \\cdot 0.52 - 0.48)/1.10 = 0.0945'}</Eq> &mdash; full Kelly is 9.45% of bankroll.
        </p>
        <p>
          Quarter-Kelly = 2.4%; half = 4.7%. Per-bet expected log-growth at full Kelly:{' '}
          <Eq>{'g^* \\approx 0.45\\%'}</Eq>. Compounded over 380 fixtures × 3 markets/fixture = 1140 bets:
          <Eq>{'(1.0045)^{1140} \\approx 175\\times'}</Eq> bankroll multiplier <em>in expectation</em>.
          Variance considerations (next card) will pull you back to fractional Kelly.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever you stake real money on a quantitative bet. Even 1/4 Kelly compounds at meaningful
        rates over a season. The cost of mis-sizing dwarfs the cost of model imperfection at
        Brasileirão scale.
      </WhenItMatters>

      <Misconception
        wrong="Kelly is too aggressive — successful traders use 1% of bankroll fixed-fraction."
        right="Full Kelly on TRUE edge is the growth-maximizing fraction, by mathematical proof. The reason fixed-fraction works is that it’s often well below ANY estimate of f*, so it can’t blow up — but it’s also leaving most of the growth on the table."
        because="The right framing is: Kelly is the optimum given known edge; fractional Kelly is the right adjustment for uncertain edge (next card). 1% of bankroll is a useful default ONLY because it’s typically smaller than 1/4 of even modest Kelly fractions, so it’s safe by accident."
      />

      <Deeper>
        <p>
          <strong>Derivation in two lines.</strong> After <Eq>{'n'}</Eq> bets at fraction <Eq>{'f'}</Eq>,
          bankroll <Eq>{'W_n = W_0 \\cdot (1 + fb)^k (1 - f)^{n-k}'}</Eq> where <Eq>{'k'}</Eq> is wins.
          Expected log-bankroll: <Eq>{'\\mathbb{E}[\\log W_n] = n[p\\log(1+fb) + q\\log(1-f)] + \\log W_0'}</Eq>.
          Maximize over <Eq>{'f'}</Eq>: take derivative, set to zero, solve. <Eq>{'f^* = (bp - q)/b'}</Eq>.
        </p>
        <p>
          <strong>Why log-utility?</strong> Log-utility is the unique utility function such that bet
          sizing is wealth-invariant (you bet the same fraction regardless of bankroll size) AND
          competing strategies&apos; relative wealth is a martingale at the optimum. Kelly bettors{' '}
          <em>almost surely</em> beat any non-Kelly strategy in the limit (Breiman 1961).
        </p>
        <p>
          <strong>Variance of log-growth.</strong>{' '}
          <Eq>{'\\mathrm{Var}[\\log W_n] = n \\cdot p(1-p)[\\log(1+fb) - \\log(1-f)]^2'}</Eq>. At full
          Kelly the variance is large &mdash; 50% drawdowns are routine. At half-Kelly the variance is
          ~1/4, growth is ~75% of full. The mean-variance curve is what makes fractional Kelly attractive.
        </p>
        <p>
          <strong>Edward Thorp&apos;s case.</strong> Thorp&apos;s 2006 paper documents his experience as a
          professional Kelly bettor across blackjack, sports, and his hedge fund (Princeton Newport).
          Key takeaway: full Kelly works only if your edge estimate is exact. In practice, Thorp ran at
          ~half to quarter Kelly. Reading: &ldquo;The Kelly Capital Growth Investment Criterion&rdquo;
          (MacLean / Thorp / Ziemba eds, 2010).
        </p>
      </Deeper>

      <QA items={[
        { q: 'What if Kelly says f* > 1?',
          a: 'You probably have negative-priced odds (b < 0) or your edge estimate is broken. f* > 1 means borrow to bet — never do this in betting markets. Cap at fixed-fraction limits regardless of what Kelly says.' },
        { q: 'Should I use Kelly per bet or per market or per fixture?',
          a: 'Per bet, IF bets are independent. With correlated bets (multiple legs of one fixture), use portfolio Kelly (next card after this one) — single-bet Kelly massively overstates growth when correlation is ignored.' },
        { q: 'Is this why everyone says "1 unit per bet"?',
          a: 'Largely yes — units = a heuristic upper bound that’s safe across most edge regimes. It works because it sits below typical Kelly fractions for marginal-edge bettors, but it’s leaving log-growth on the table for higher-edge bets.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — FRACTIONAL KELLY UNDER UNCERTAINTY
   When edge is uncertain, fractional Kelly is OPTIMAL — not just risk-averse.
   The fraction is a Bayesian shrinkage on edge uncertainty.
   ========================================================================== */

const FractionalKellyCard = () => {
  const [edgeMean, setEdgeMean] = useState(0.04);
  const [edgeSE, setEdgeSE] = useState(0.025);
  // Optimal Kelly fraction under uncertainty (MacLean-Thorp-Ziemba):
  // f_safe = mean / (mean^2 + variance) approximately f_full * (1 / (1 + SE^2/mean^2))
  // For the canonical "uncertainty-aware Kelly" problem,
  // optimal fraction shrinks: f_opt = f_full * mean^2 / (mean^2 + SE^2)
  const fFull = Math.max(0, edgeMean / 1.0);
  const fSafe = fFull * (edgeMean * edgeMean) / (edgeMean * edgeMean + edgeSE * edgeSE);
  const ratio = fFull > 0 ? fSafe / fFull : 0;

  // Draw distribution over true edge (gaussian) + show "ruinous if true edge < 0" region
  const W = 320, H = 140, P = 18;
  const xMin = -0.06, xMax = 0.12;
  const sx = (e) => P + ((e - xMin) / (xMax - xMin)) * (W - 2 * P);
  const pdf = (e) => Math.exp(-(e - edgeMean) * (e - edgeMean) / (2 * edgeSE * edgeSE)) / (edgeSE * Math.sqrt(2 * Math.PI));
  const maxPDF = pdf(edgeMean);
  const sy = (p) => H - 28 - (p / maxPDF) * 80;
  const distPts = [];
  for (let e = xMin; e <= xMax; e += (xMax - xMin) / 200) {
    distPts.push(`${sx(e).toFixed(1)},${sy(pdf(e)).toFixed(1)}`);
  }

  return (
    <Card id="frackelly" icon={Repeat} title="Fractional Kelly is OPTIMAL under uncertainty" accent="emerald" index={6}
          subtitle="Not a risk-aversion compromise: when edge is uncertain, the growth-maximizing bet is strictly less than full Kelly. The fraction is a Bayesian shrinkage.">
      <MinSchema>
        Full Kelly assumes you know <Eq>{'p'}</Eq> exactly. When you have a posterior over <Eq>{'p'}</Eq>{' '}
        with non-trivial variance, the optimal Kelly fraction <em>shrinks</em>:{' '}
        <Eq>{'f_{\\mathrm{opt}} = f^* \\cdot \\frac{\\mu^2}{\\mu^2 + \\sigma^2}'}</Eq>.
        Higher edge uncertainty &rarr; tighter shrinkage.
      </MinSchema>

      <p>
        Most bettors size at half or quarter Kelly because &ldquo;full Kelly is too volatile&rdquo;. The
        deeper truth: when your <em>edge estimate</em> has uncertainty (which it always does &mdash;
        you have a finite CV sample), the growth-maximizing fraction is strictly less than full Kelly.
        The shrinkage factor is roughly <Eq>{'\\mu^2/(\\mu^2 + \\sigma^2)'}</Eq> &mdash; the
        signal-to-noise ratio of your edge estimate. With <Eq>{'\\mu = \\sigma'}</Eq>, the optimal
        fraction is half full Kelly. With <Eq>{'\\sigma = 2\\mu'}</Eq>, it&apos;s 1/5. Fractional Kelly
        isn&apos;t risk aversion; it&apos;s Bayesian sizing.
      </p>

      <Predict question="Your edge estimate is 4% ± 2.5pp. What fraction of full Kelly should you bet?">
        About <span className="font-mono text-emerald-300">{(ratio * 100).toFixed(0)}%</span>. Drag the
        SE slider to feel how sensitive this is &mdash; doubling edge SE roughly halves your safe Kelly
        fraction. Real-world edge estimates from a 200-bet sample have SE comparable to or larger than
        the mean; quarter-Kelly is empirically about right.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-200 font-mono">edge estimate μ</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(edgeMean * 100).toFixed(1)}%</span>
            </div>
            <input type="range" min="0.005" max="0.10" step="0.005" value={edgeMean} onChange={(e) => setEdgeMean(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-200 font-mono">edge SE σ</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(edgeSE * 100).toFixed(2)}pp</span>
            </div>
            <input type="range" min="0.005" max="0.06" step="0.005" value={edgeSE} onChange={(e) => setEdgeSE(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="full Kelly" value={`${(fFull * 100).toFixed(1)}%`} sub="if μ were exact" color="text-amber-300" />
            <Stat label="optimal" value={`${(fSafe * 100).toFixed(1)}%`} sub="under uncertainty" color="text-emerald-300" />
            <Stat label="ratio" value={`${(ratio * 100).toFixed(0)}%`} sub="of full Kelly" color={ratio > 0.5 ? 'text-emerald-300' : ratio > 0.25 ? 'text-amber-300' : 'text-rose-300'} />
          </div>
          <div className="text-[11px] text-neutral-500 leading-snug">
            <span className="text-neutral-400">Heuristic.</span> SE/μ &lt; 0.5 → use ~80% Kelly.
            SE/μ ≈ 1 → use 50% Kelly. SE/μ ≈ 2 → use 20% Kelly. Most CV-derived edge estimates fall in
            the middle bucket.
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* x-axis (edge values, 0 marker) */}
          <line x1={P} y1={H - 28} x2={W - P} y2={H - 28} stroke="#525252" strokeWidth="0.5" />
          {/* zero edge marker */}
          <line x1={sx(0)} y1={20} x2={sx(0)} y2={H - 28} stroke="#a3a3a3" strokeWidth="0.5" strokeDasharray="2,3" />
          <text x={sx(0)} y={H - 16} fontSize="8" textAnchor="middle" fill="#a3a3a3">true edge = 0</text>
          {/* PDF curve */}
          <polyline points={distPts.join(' ')} fill="none" stroke="#6ee7b7" strokeWidth="1.4" />
          <polyline points={`${sx(xMin)},${H-28} ${distPts.join(' ')} ${sx(xMax)},${H-28}`} fill="rgba(110,231,183,0.12)" stroke="none" />
          {/* shade negative region (ruinous) */}
          {(() => {
            const negPts = [];
            for (let e = xMin; e <= 0; e += (xMax - xMin) / 200) {
              negPts.push(`${sx(e).toFixed(1)},${sy(pdf(e)).toFixed(1)}`);
            }
            return <polyline points={`${sx(xMin)},${H-28} ${negPts.join(' ')} ${sx(0)},${H-28}`} fill="rgba(251,113,133,0.20)" stroke="none" />;
          })()}
          {/* mean marker */}
          <line x1={sx(edgeMean)} y1={sy(maxPDF)} x2={sx(edgeMean)} y2={H - 28} stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="3,3" />
          <text x={sx(edgeMean)} y={sy(maxPDF) - 5} fontSize="9" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">μ={(edgeMean*100).toFixed(1)}%</text>
          {/* x-axis ticks */}
          {[-0.04, 0, 0.04, 0.08].map(e => (
            <text key={e} x={sx(e)} y={H - 4} fontSize="8" textAnchor="middle" fill="#737373">{(e*100).toFixed(0)}%</text>
          ))}
          {/* labels */}
          <text x={sx(-0.03)} y={26} fontSize="8" fill="#fb7185">ruinous if true</text>
          <text x={sx(-0.03)} y={36} fontSize="8" fill="#fb7185">edge &lt; 0</text>
        </svg>
      </div>

      <Worked title="Worked example · CV-derived edge SE">
        <p>
          You have 500 backtest bets. Mean per-bet log-growth: <Eq>{'\\mu = 1.2\\%'}</Eq>. Per-bet
          standard deviation of log-return: ~85% (typical at decimal odds 2.0).{' '}
          <Eq>{'\\mathrm{SE}(\\mu) = 85\\%/\\sqrt{500} = 3.8\\%'}</Eq>.
        </p>
        <p>
          So <Eq>{'\\sigma/\\mu \\approx 3.2'}</Eq>. Optimal fraction:{' '}
          <Eq>{'1/(1 + 3.2^2) \\approx 9\\%'}</Eq> of full Kelly. Less than tenth-Kelly! With only
          500 backtest bets, your edge estimate is so noisy that even <em>safe</em> Kelly is
          tiny. This is why the &ldquo;1 unit per bet&rdquo; heuristic is often justified for small
          backtests &mdash; the SE dominates.
        </p>
      </Worked>

      <WhenItMatters>
        Always &mdash; you never know edge exactly. The relevant question is how confident you are
        about your edge estimate. The smaller your backtest, the larger the SE, the more aggressive
        the shrinkage. With 5,000+ live bets at +CLV, you can move toward 50% Kelly. With 500 bets and
        no CLV history, stay at 10% or less.
      </WhenItMatters>

      <Misconception
        wrong="Fractional Kelly is just risk aversion — it sacrifices expected growth for survival."
        right="Under realistic edge uncertainty, fractional Kelly is the actual growth-maximizing fraction. Full Kelly OVER-estimates growth because it ignores parameter uncertainty."
        because="Full Kelly assumes p is known. The actual expected log-growth integrates over your posterior on p; this integration shifts the optimum DOWN. The shift IS the shrinkage. So fractional Kelly isn’t a tradeoff — it’s the correct optimum for the actual problem."
      />

      <Deeper>
        <p>
          <strong>The MacLean-Thorp-Ziemba framework.</strong> If <Eq>{'p \\sim \\mathcal{N}(\\mu, \\sigma^2)'}</Eq>{' '}
          (or any posterior with finite mean and variance), the expected log-growth integrates as
          <Eq>{'\\mathbb{E}_p[g(f, p)] \\approx g(f, \\mu) - \\frac{1}{2} \\sigma^2 g_{pp}(f, \\mu)'}</Eq>.
          Maximizing this perturbed objective gives the shrinkage formula. See MacLean-Thorp-Ziemba
          (2010), &ldquo;The Kelly Capital Growth Investment Criterion&rdquo;.
        </p>
        <p>
          <strong>Bayesian Kelly.</strong> If you have a Beta posterior on <Eq>{'p'}</Eq> from your
          model, sample <Eq>{'p^{(s)} \\sim \\mathrm{Beta}(\\alpha, \\beta)'}</Eq>, compute the
          implied <Eq>{'f^*(p^{(s)})'}</Eq>, average across samples. This is operationally identical
          to <Term>Thompson sampling</Term> and gives near-optimal regret bounds.
        </p>
        <p>
          <strong>Drawdown-aware fractional Kelly.</strong> If you target a max drawdown of <Eq>{'D'}</Eq>{' '}
          with probability <Eq>{'\\geq 1 - \\delta'}</Eq>, an analytical formula gives the maximum safe
          fraction. For most practical cases, this lands at 0.2&ndash;0.4 full Kelly &mdash; consistent
          with what shrinkage suggests for typical SE/μ ratios.
        </p>
        <p>
          <strong>Real-world calibration.</strong> Sharp syndicates run at ~0.1&ndash;0.3 full Kelly.
          Retail bettors mostly run flat-stake (1 unit), which is FAR below Kelly &mdash; safer than
          they realize, but capped on growth. The mid-game move from flat-stake to fractional Kelly
          requires a CLV history sufficient to bound your edge SE; without it, stay flat.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I estimate edge SE in practice?',
          a: 'From your CV: per-fold mean edge → standard error across folds. Or analytically: the std dev of per-bet log-return divided by sqrt(N bets). For 500 bets, expect SE comparable to mean for any reasonable edge.' },
        { q: 'Is half-Kelly always safe?',
          a: 'Safer than full but not safe in absolute terms. Half-Kelly bettors with overconfident edge estimates still blow up. The right anchor is your SE/μ ratio, not a fixed fraction.' },
        { q: 'Should I bet 0 if my CV-edge is below SE?',
          a: 'Either bet 0 or take a tiny exploratory stake (Thompson-sampling style) to reduce SE over time. CLV-positive small samples are the path to confident sizing later.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — BANKROLL & RISK OF RUIN
   The geometric trap. Even +EV strategies blow up if they ride too close to
   ruin. Drawdown distributions for fractional Kelly. Sharpe vs Sortino vs
   Calmar.
   ========================================================================== */

const RuinCard = () => {
  const [kFrac, setKFrac] = useState(0.5);  // fraction of full Kelly
  const [pTrue, setPTrue] = useState(0.55);
  const [nBets, setNBets] = useState(500);
  const b = 1.0;
  const fStar = Math.max(0, (b * pTrue - (1 - pTrue)) / b);
  const f = fStar * kFrac;
  // Drawdown approximation: under fractional Kelly, max DD over N bets ~ 1 - exp(-2 * f^2 / mean log return)
  // Use Karatzas-Shreve heuristic: P(DD > x) ≈ exp(-2 g x / sigma^2) where g = expected log-growth
  const muG = pTrue * Math.log(1 + f * b) + (1 - pTrue) * Math.log(1 - f);
  const sigG2 = pTrue * (1 - pTrue) * Math.pow(Math.log(1 + f * b) - Math.log(1 - f), 2);
  // Probability of 50% drawdown ≈ exp(-2 g D / sigG^2) for D = log(0.5) absolute
  const D50 = Math.log(2);
  const pDD50 = muG > 0 ? Math.min(1, Math.exp(-2 * muG * D50 / Math.max(1e-9, sigG2))) : 1;
  const D90 = Math.log(10);
  const pDD90 = muG > 0 ? Math.min(1, Math.exp(-2 * muG * D90 / Math.max(1e-9, sigG2))) : 1;
  // Expected bankroll multiplier after N bets
  const expMult = Math.exp(muG * nBets);
  // Median bankroll multiplier: log-normal median = exp(muG * N - sigG^2 * N / 2)... well, exp(median log)
  // Actually for a log-normal random walk, median(W_N) = exp(N * muG - 0)*W_0 = exp(muG * N)
  // Let's use median as exp(N * muG) (mean of log returns, no variance subtraction)
  // Mean: W_0 * exp(N * (muG + sigG^2/2))
  const meanMult = Math.exp(nBets * (muG + sigG2 / 2));

  // Simulate 5 paths deterministically
  const paths = useMemo(() => {
    const series = [];
    const seeds = [3, 11, 17, 23, 41];
    for (const seed of seeds) {
      let s = seed;
      const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const path = [1];
      let bk = 1;
      for (let i = 0; i < nBets; i++) {
        const win = rng() < pTrue;
        bk = bk * (win ? 1 + f * b : 1 - f);
        path.push(bk);
      }
      series.push(path);
    }
    return series;
  }, [nBets, pTrue, kFrac]);

  const W = 320, H = 150, P = 24;
  const allVals = paths.flat();
  const yMin = Math.min(0.05, ...allVals);
  const yMax = Math.max(...allVals);
  const sx = (i) => P + (i / nBets) * (W - 2 * P);
  // log scale for y
  const sy = (v) => H - 16 - ((Math.log(Math.max(0.01, v)) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin))) * (H - 32);

  return (
    <Card id="ruin" icon={ShieldAlert} title="Bankroll & risk of ruin" accent="rose" index={7}
          subtitle="Even with positive expected log-growth, drawdowns are large. The arithmetic mean lies; what survives is the geometric reality your wallet lives in.">
      <MinSchema>
        Positive EV doesn&apos;t prevent ruin. The probability of a 50% drawdown is non-trivial at any
        meaningful Kelly fraction. <em>Survive first, compound second.</em>
      </MinSchema>

      <p>
        A +EV strategy is necessary, not sufficient. Drawdowns scale with{' '}
        <Eq>{'\\sigma^2/g'}</Eq> &mdash; the variance per unit of growth &mdash; and at full Kelly the
        ratio is large by construction. A bettor with a real 5% edge running full Kelly has roughly a
        50% chance of hitting a 50% drawdown <em>at some point</em>. Half-Kelly cuts that in half;
        quarter-Kelly cuts it again. The arithmetic vs geometric distinction matters: the
        <em> arithmetic mean</em> of log-returns is a positive number that says you&apos;ll be rich;
        the <em>geometric reality</em> of your bankroll is the realized path, which can dip near zero.
      </p>

      <Predict question="At half-Kelly with a 5% edge over 500 bets, what's your probability of a 50% drawdown along the way?">
        Around <span className="font-mono text-rose-300">{(pDD50 * 100).toFixed(0)}%</span>. Ride the
        slider down to quarter-Kelly &mdash; drawdown probability roughly halves. Even +EV strategies
        spend a meaningful fraction of their lives underwater; survival sizing matters more than
        squeezing the last log-growth percentage.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-200 font-mono">Kelly fraction</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(kFrac * 100).toFixed(0)}% of f*</span>
            </div>
            <input type="range" min="0.1" max="1.5" step="0.05" value={kFrac} onChange={(e) => setKFrac(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-200 font-mono">true win prob</span>
              <span className="text-neutral-300 font-mono tabular-nums">{(pTrue * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="0.50" max="0.65" step="0.005" value={pTrue} onChange={(e) => setPTrue(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-rose-200 font-mono">N bets</span>
              <span className="text-neutral-300 font-mono tabular-nums">{nBets}</span>
            </div>
            <input type="range" min="50" max="2000" step="10" value={nBets} onChange={(e) => setNBets(parseInt(e.target.value, 10))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="P(DD &gt; 50%)" value={`${(pDD50 * 100).toFixed(0)}%`} sub="probability you hit it" color={pDD50 > 0.4 ? 'text-rose-300' : pDD50 > 0.15 ? 'text-amber-300' : 'text-emerald-300'} />
            <Stat label="P(DD &gt; 90%)" value={`${(pDD90 * 100).toFixed(1)}%`} sub="near-ruin" color={pDD90 > 0.05 ? 'text-rose-300' : 'text-amber-300'} />
            <Stat label="median end" value={`${expMult.toFixed(2)}×`} sub={`after ${nBets} bets`} color={expMult >= 1 ? 'text-emerald-300' : 'text-rose-300'} />
            <Stat label="mean end" value={`${meanMult.toFixed(2)}×`} sub="arithmetic — lies" color="text-neutral-400" />
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* axes */}
          <line x1={P} y1={H - 16} x2={W - P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          <line x1={P} y1={20} x2={P} y2={H - 16} stroke="#525252" strokeWidth="0.5" />
          {/* 1.0 baseline */}
          <line x1={P} y1={sy(1)} x2={W - P} y2={sy(1)} stroke="#a3a3a3" strokeWidth="0.5" strokeDasharray="2,3" />
          <text x={W - P + 2} y={sy(1) + 3} fontSize="8" fill="#737373">1×</text>
          {/* paths */}
          {paths.map((path, i) => {
            const pts = path.map((v, k) => `${sx(k).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
            return <polyline key={i} points={pts} fill="none" stroke={['#6ee7b7','#fbbf24','#f0abfc','#7dd3fc','#fb7185'][i]} strokeWidth="1.1" opacity="0.75" />;
          })}
          {/* y-axis labels */}
          <text x={P - 3} y={sy(yMax)} fontSize="8" textAnchor="end" fill="#737373">{yMax.toFixed(1)}×</text>
          <text x={P - 3} y={sy(yMin)} fontSize="8" textAnchor="end" fill="#737373">{yMin.toFixed(2)}×</text>
          {/* x-axis labels */}
          <text x={P} y={H - 4} fontSize="8" fill="#737373">0</text>
          <text x={W - P} y={H - 4} fontSize="8" textAnchor="end" fill="#737373">{nBets}</text>
        </svg>
      </div>
      <div className="text-[10px] text-neutral-500 text-center -mt-2">5 simulated bankroll paths · log-y · seeded (deterministic)</div>

      <Worked title="Worked example · the geometric trap">
        <p>
          A 100-bet sample with full Kelly on 55% true probability at <Eq>{'b = 1'}</Eq>:
          <Eq>{'f^* = 10\\%'}</Eq>. Per-bet expected log-growth:{' '}
          <Eq>{'g = 0.55\\log(1.10) + 0.45\\log(0.90) \\approx 0.52\\%'}</Eq>. Per-bet variance:{' '}
          <Eq>{'\\sigma^2_g \\approx 0.0099'}</Eq>.
        </p>
        <p>
          Expected log bankroll after 100 bets: <Eq>{'+52\\%'}</Eq>. <em>But the standard deviation
          of log bankroll is</em> <Eq>{'\\sqrt{0.99} \\approx 99\\%'}</Eq>. So a 1-σ unlucky path lands at
          <Eq>{'e^{0.52 - 0.99} \\approx 0.62'}</Eq> bankroll, a 38% drawdown by chance alone &mdash;
          before any model error. The arithmetic average (<Eq>{'\\mathbb{E}[W_{100}/W_0] = e^{0.52 + 0.99/2} \\approx 2.78'}</Eq>)
          is dominated by a few extreme upside paths; the median bettor experiences much less.
        </p>
      </Worked>

      <WhenItMatters>
        Whenever your strategy compounds (re-bets from current bankroll). Sharpe ratio is a measure of
        arithmetic mean vs std; for compounding bankroll, what matters is geometric mean and max
        drawdown. Use Calmar (return/MaxDD) and Sortino as primary survival metrics.
      </WhenItMatters>

      <Misconception
        wrong="Positive expected log-growth means my bankroll grows."
        right="It means the EXPECTED log-bankroll grows. The realized path can dip arbitrarily close to zero, especially at higher Kelly fractions."
        because="The variance of log-bankroll grows linearly in N. The expected path drifts up at rate g; the standard deviation grows at √(σ²·N). For typical full-Kelly strategies, σ²/g is large enough that the variance dominates the drift over operationally interesting horizons (hundreds of bets)."
      />

      <Deeper>
        <p>
          <strong>Risk of ruin formula.</strong> For a Brownian-motion approximation of fractional Kelly
          bankroll evolution: <Eq>{'P(\\text{ever hit } \\alpha W_0) = \\alpha^{2g/\\sigma^2}'}</Eq>{' '}
          for <Eq>{'\\alpha < 1'}</Eq>. At full Kelly the ratio <Eq>{'2g/\\sigma^2 = 1'}</Eq>, so
          <Eq>{'P(\\text{hit }0.5) = 0.5'}</Eq>. At half-Kelly, <Eq>{'2g/\\sigma^2 = 4'}</Eq>, so
          <Eq>{'P(\\text{hit }0.5) = 0.5^4 = 6.25\\%'}</Eq>. The exponential dependence on Kelly
          fraction is what makes fractional sizing so impactful.
        </p>
        <p>
          <strong>Sharpe ratio is incomplete.</strong> Sharpe = mean / std doesn&apos;t penalize
          drawdowns specifically. A strategy with high Sharpe and large rare drawdowns can be
          unsurvivable in practice. Sortino (only downside std), Calmar (return / max DD), and
          conditional drawdown-at-risk (CDaR) all give better survival visibility.
        </p>
        <p>
          <strong>Bankroll growth caps from limits.</strong> Even at perfect Kelly, your bankroll
          eventually grows past book limits &mdash; you can&apos;t get full Kelly down on Brasileirão
          markets at $50k bankroll. Operational ceiling is set by{' '}
          <CrossLink to="limits" recap="Account limits, KYC, capacity ceilings.">limits &amp; account life</CrossLink>,
          not Kelly math.
        </p>
        <p>
          <strong>Drawdown vs ruin definitions.</strong> Drawdown = peak-to-trough loss; ruin = bankroll
          below some threshold (often 50% of starting). Many strategies that &ldquo;don&apos;t go to
          zero&rdquo; still hit psychological-or-practical ruin (forced to stop betting). Calibrate
          your tolerance honestly.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I size to limit max drawdown to 30%?',
          a: 'Solve P(hit 0.7) ≤ δ for f. With log-growth g and variance σ²: f such that 0.7^(2g/σ²) ≤ δ. For most cases this lands around 0.2-0.3 full Kelly, which is also where SE-corrected Kelly lives — convergent recommendations.' },
        { q: 'What if my bankroll grows past the book limit?',
          a: 'Either spread across many books (line-shopping AND limit-spreading) or accept a fixed-stake cap. Most syndicate-scale operations have ~5-10× the limit per book to deploy at scale.' },
        { q: 'Is Sharpe useless?',
          a: 'Useful as a comparison across strategies, but don’t deploy on Sharpe alone. Calmar (return/MaxDD) is a much stronger survival predictor. Calculate both; ship only when Calmar > 1.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — PORTFOLIO KELLY WITH CORRELATION
   Multi-bet generalization. Single-bet Kelly fails when bets are correlated.
   The portfolio Kelly = Σ⁻¹ μ. Correlation slider shows how stakes shrink.
   ========================================================================== */

const PortfolioKellyCard = () => {
  const [rho, setRho] = useState(0.50);  // correlation between bets
  // Three bets with similar edges
  const mu = [0.04, 0.03, 0.025];  // expected returns
  const sigmas = [0.85, 0.75, 0.80];
  // Cov matrix Σ_ij = sigmas_i * sigmas_j * rho_ij (rho_ij = rho for off-diag, 1 for diag)
  const cov = [
    [sigmas[0]*sigmas[0], sigmas[0]*sigmas[1]*rho, sigmas[0]*sigmas[2]*rho],
    [sigmas[1]*sigmas[0]*rho, sigmas[1]*sigmas[1], sigmas[1]*sigmas[2]*rho],
    [sigmas[2]*sigmas[0]*rho, sigmas[2]*sigmas[1]*rho, sigmas[2]*sigmas[2]],
  ];
  // Portfolio Kelly: f = Σ⁻¹ μ
  // 3x3 inverse via cofactor expansion
  const det3 = (m) => m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const inv3 = (m) => {
    const d = det3(m);
    if (Math.abs(d) < 1e-9) return [[0,0,0],[0,0,0],[0,0,0]];
    return [
      [(m[1][1]*m[2][2]-m[1][2]*m[2][1])/d, -(m[0][1]*m[2][2]-m[0][2]*m[2][1])/d, (m[0][1]*m[1][2]-m[0][2]*m[1][1])/d],
      [-(m[1][0]*m[2][2]-m[1][2]*m[2][0])/d, (m[0][0]*m[2][2]-m[0][2]*m[2][0])/d, -(m[0][0]*m[1][2]-m[0][2]*m[1][0])/d],
      [(m[1][0]*m[2][1]-m[1][1]*m[2][0])/d, -(m[0][0]*m[2][1]-m[0][1]*m[2][0])/d, (m[0][0]*m[1][1]-m[0][1]*m[1][0])/d],
    ];
  };
  const cInv = inv3(cov);
  const portFracs = [0,1,2].map(i => cInv[i].reduce((s, v, j) => s + v * mu[j], 0));
  // Independent Kelly per bet
  const indFracs = mu.map((m, i) => m / (sigmas[i] * sigmas[i]));
  // Sums
  const portSum = portFracs.reduce((s, x) => s + Math.max(0, x), 0);
  const indSum = indFracs.reduce((s, x) => s + x, 0);

  return (
    <Card id="corr" icon={Workflow} title="Portfolio Kelly with correlation" accent="cyan" index={8}
          subtitle="Single-bet Kelly assumes independence. When bets correlate (multiple legs of one fixture, or one model across markets), per-bet Kelly massively over-stakes the portfolio.">
      <MinSchema>
        For multiple simultaneous bets:{' '}
        <Eq>{'\\mathbf{f}^* = \\mathbf{\\Sigma}^{-1} \\boldsymbol{\\mu}'}</Eq> where{' '}
        <Eq>{'\\mathbf{\\Sigma}'}</Eq> is the covariance of returns. As correlation rises, optimal
        portfolio total stake <em>decreases</em>. Per-bet Kelly is just <em>wrong</em> for correlated bets.
      </MinSchema>

      <p>
        You back three Brasileirão bets at the same time: Home win, BTTS Yes, Over 2.5. Each individually
        looks +EV. Each &ldquo;wants&rdquo; its own Kelly stake. But they&apos;re strongly correlated &mdash;
        a high-scoring home win settles all three together. Treating them as independent and stacking
        per-bet Kellys massively over-stakes; one bad day they all settle losers and you get a multi-Kelly
        drawdown. Portfolio Kelly accounts for this, shrinking individual stakes as correlation rises.
      </p>

      <Predict question="Drag the correlation slider from 0 to 0.9. How does total portfolio stake change?">
        At <Eq>{'\\rho = 0'}</Eq>: portfolio Kelly ≈ sum of per-bet Kellys (independent case). At{' '}
        <Eq>{'\\rho = 0.9'}</Eq>: portfolio total stake collapses to ~1/3 the independent sum &mdash;
        the system effectively says &ldquo;these are one bet, stake them once&rdquo;.
      </Predict>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-cyan-200 font-mono">pairwise correlation ρ</span>
            <span className="text-neutral-300 font-mono tabular-nums">{rho.toFixed(2)}</span>
          </div>
          <input type="range" min="-0.20" max="0.95" step="0.05" value={rho} onChange={(e) => setRho(parseFloat(e.target.value))} className="bs-range w-full" />
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="grid grid-cols-[1fr_70px_70px_70px_90px] gap-2 px-3 py-1.5 bg-white/[0.02] text-[9px] uppercase tracking-widest text-neutral-500">
            <span>bet</span>
            <span className="text-right">μ (edge)</span>
            <span className="text-right">σ</span>
            <span className="text-right">indep f</span>
            <span className="text-right">portfolio f</span>
          </div>
          {['Home win', 'BTTS Yes', 'Over 2.5'].map((name, i) => {
            const indF = indFracs[i];
            const portF = portFracs[i];
            const shrunk = portF < indF * 0.95;
            return (
              <div key={name} className="grid grid-cols-[1fr_70px_70px_70px_90px] gap-2 px-3 py-1.5 border-t border-white/5 items-center text-[11px]">
                <span className="text-neutral-200">{name}</span>
                <span className="font-mono text-right text-neutral-300 tabular-nums">{(mu[i] * 100).toFixed(1)}%</span>
                <span className="font-mono text-right text-neutral-400 tabular-nums">{sigmas[i].toFixed(2)}</span>
                <span className="font-mono text-right text-neutral-400 tabular-nums">{(indF * 100).toFixed(2)}%</span>
                <span className={`font-mono text-right tabular-nums ${shrunk ? 'text-cyan-200' : 'text-neutral-300'}`}>
                  {(portF * 100).toFixed(2)}%
                  {shrunk && <span className="text-[9px] text-rose-400 ml-1">↓</span>}
                </span>
              </div>
            );
          })}
          <div className="grid grid-cols-[1fr_70px_70px_70px_90px] gap-2 px-3 py-1.5 border-t border-white/10 bg-white/[0.03] items-center text-[11px]">
            <span className="text-neutral-300 font-medium">total stake</span>
            <span></span>
            <span></span>
            <span className="font-mono text-right text-neutral-400 tabular-nums">{(indSum * 100).toFixed(2)}%</span>
            <span className="font-mono text-right text-cyan-200 tabular-nums">{(portSum * 100).toFixed(2)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="indep total" value={`${(indSum * 100).toFixed(1)}%`} sub="naive sum-of-Kellys" color="text-neutral-300" />
          <Stat label="portfolio total" value={`${(portSum * 100).toFixed(1)}%`} sub="correlation-aware" color="text-cyan-300" />
          <Stat label="shrinkage" value={`${(100 - (portSum / Math.max(1e-9, indSum) * 100)).toFixed(0)}%`} sub="vs naive" color={portSum < indSum * 0.7 ? 'text-rose-300' : 'text-amber-300'} />
        </div>
      </div>

      <Worked title="Worked example · 1X2 + O/U + BTTS on the same fixture">
        <p>
          Home win, Over 2.5, BTTS Yes &mdash; all three settle &ldquo;true&rdquo; together if home wins
          a high-scoring match. Empirical correlation: <Eq>{'\\rho \\approx 0.55'}</Eq>. With each bet
          showing a 4% edge and per-bet Kelly suggesting 2% stake each:
        </p>
        <p>
          • <strong>Naive</strong>: total stake 6%, stake-per-bet 2%. <strong>Variance</strong>: hugely
          inflated by correlation.<br />
          • <strong>Portfolio Kelly</strong>: total stake ~3%, stake distributed unequally favouring the
          highest-edge bet (Home win at the top). The system effectively says &ldquo;you have one bet
          here; size it once&rdquo;.
        </p>
        <p>
          Net result: same expected growth, half the portfolio variance.
        </p>
      </Worked>

      <WhenItMatters>
        Always when more than one bet settles simultaneously OR shares risk drivers. Single-fixture
        multi-market is the most common case. Across-fixture cross-bet correlations matter at
        weekly-slate scale (a Brasileirão round of 10 fixtures with a model that&apos;s long the
        favourites &mdash; one upset day is a multi-bet drawdown).
      </WhenItMatters>

      <Misconception
        wrong="If each bet is independently +EV, I can stake each one at its own Kelly."
        right="Per-bet Kelly is correct only if bets are pairwise uncorrelated. With even modest correlation, total portfolio variance is much larger than the sum of per-bet variances, and per-bet Kelly massively over-stakes."
        because="Var(s₁X₁ + s₂X₂) = s₁²σ₁² + s₂²σ₂² + 2s₁s₂σ₁σ₂ρ. The cross-term is what per-bet Kelly ignores. With ρ=0.5 and equal weights, total variance is 50% larger than the independent case — the optimal stakes shrink accordingly."
      />

      <Deeper>
        <p>
          <strong>Derivation in 1 line.</strong> Taylor-expand expected log-growth around{' '}
          <Eq>{'\\mathbf{f} = \\mathbf{0}'}</Eq>: <Eq>{'g(\\mathbf{f}) \\approx \\boldsymbol{\\mu}^\\top \\mathbf{f} - \\frac{1}{2} \\mathbf{f}^\\top \\boldsymbol{\\Sigma} \\mathbf{f}'}</Eq>.
          Maximize: <Eq>{'\\mathbf{f}^* = \\boldsymbol{\\Sigma}^{-1} \\boldsymbol{\\mu}'}</Eq>. Same form as
          Markowitz mean-variance optimization &mdash; portfolio Kelly IS Markowitz with log-utility risk
          aversion = 1.
        </p>
        <p>
          <strong>Estimating Σ in practice.</strong> For multi-leg-per-fixture, simulate 10k seasons
          from your scoreline distribution; record outcomes per market; correlation matrix is the
          empirical correlation. For across-fixture cross-bets, the covariance comes from your
          model&apos;s residual correlation across fixtures (often near zero unless your model has
          systematic biases).
        </p>
        <p>
          <strong>Negative correlation = bigger total stake.</strong> If two bets are negatively
          correlated (a hedge), portfolio Kelly increases the total stake. This is the math
          underlying <em>dutching</em>: laying down multiple bets that can&apos;t all win.
        </p>
        <p>
          <strong>Practical caps.</strong> On top of portfolio Kelly, apply (a) per-fixture cap
          (no single fixture more than X% of bankroll), (b) per-day cap (no single match-day more
          than Y%), (c) per-correlation-cluster cap (group bets by primary correlate). Multi-cap
          portfolio sizing is what real syndicates run.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where do I get the correlation matrix?',
          a: 'Two paths: (a) simulate from your distributional model — sample many fixtures from the joint scoreline distribution, compute settled returns per bet, take empirical correlation; (b) from historical CV residuals if you have many fixtures with the same bet structure.' },
        { q: 'Does Σ⁻¹μ ever produce negative weights?',
          a: 'Yes — when adding a bet would hurt the portfolio. Standard practice is to floor at zero (no shorting) and re-solve the constrained problem; this is a quadratic program (cvxpy or qpsolvers in Python).' },
        { q: 'Is portfolio Kelly the same as mean-variance optimization?',
          a: 'Mathematically equivalent under log-utility. Markowitz uses a tunable λ for risk aversion; Kelly fixes λ at the value that maximizes log-growth. For betting, Kelly is the natural choice.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — WHERE EDGE ACTUALLY LIVES (the alpha map)
   The strategic map. Books × markets × timing × edge type. Most retail
   bettors mis-locate where capturable edge actually exists.
   ========================================================================== */

const ALPHA_QUADRANTS = [
  { id: 'sharp-main', x: 'sharp', y: 'main',  name: 'Sharp · main markets',
    edge: 'low (~1-3% CLV)', cap: 'huge (Pinnacle takes $50k)', diff: 'very high — sharp money already there',
    fit: 'For models with real predictive edge. The pro arena. Capacity is fine; edge is small and hard-won.' },
  { id: 'sharp-prop', x: 'sharp', y: 'prop',  name: 'Sharp · props',
    edge: 'medium (~2-5% CLV)', cap: 'moderate ($5-20k)', diff: 'high but lower than main',
    fit: 'Good niche for models that capture specific player/team patterns. Lower competition than main markets.' },
  { id: 'soft-main', x: 'soft', y: 'main',   name: 'Soft · main markets',
    edge: 'medium (~3-6% CLV)', cap: 'low (limits hit fast)', diff: 'medium — softer competitors',
    fit: 'Quick wins, then limited. The classic "bonus harvest" + early-account-life regime. Bet small, often.' },
  { id: 'soft-prop', x: 'soft', y: 'prop',   name: 'Soft · props',
    edge: 'high (~5-10%+ CLV)', cap: 'tiny ($100-500/bet)', diff: 'low — books slow to update',
    fit: 'Highest edges live here. Operational nightmare — many small bets across many books, fast limits.' },
];

const EDGE_TYPES = [
  { id: 'predictive', name: 'Predictive (model)', desc: 'Your forecast beats the closing line.', size: 'small per bet, scalable in volume', cap: 'sharp-book limits' },
  { id: 'promo',      name: 'Promo / freerolls',  desc: 'Deposit bonuses, risk-free bets, profit boosts.', size: 'huge per opportunity', cap: 'one-shot, hours of work, small lifetime $' },
  { id: 'arb',        name: 'Arbitrage',          desc: 'Lock profit across books with opposing odds.', size: 'tiny per arb (~1-3%)', cap: 'closes in seconds; books ban arbers' },
  { id: 'boost',      name: 'Boosted markets',    desc: 'Books occasionally offer +EV boosted lines as marketing.', size: 'medium per opportunity', cap: 'rare, capped per account' },
  { id: 'inplay',     name: 'In-play latency',    desc: 'Soft books lag sharp books on live odds.', size: 'large during fast-moving moments', cap: 'requires speed + low-latency feed' },
];

const AlphaMapCard = () => {
  const [pick, setPick] = useState('sharp-main');
  const sel = ALPHA_QUADRANTS.find(q => q.id === pick);

  return (
    <Card id="alpha" icon={Telescope} title="Where edge actually lives" accent="orange" index={9}
          subtitle="The strategic map. Books × markets × timing × edge type — most retail bettors mis-locate the capturable edge in their own setup.">
      <MinSchema>
        Edge has a <em>capacity</em>. The combination of book + market determines both the edge magnitude
        AND how much money you can deploy at it. Pick the quadrant your operation actually lives in,
        not the one you wish it did.
      </MinSchema>

      <p>
        A perfect Brasileirão model that&apos;s limited to $20 stakes is worth <em>twenty dollars times
        your edge per bet times the number of bets you can place</em> &mdash; not your model&apos;s
        accuracy. The map below splits the betting universe into four quadrants by book sharpness and
        market liquidity. Each has a different edge profile and a different capacity ceiling. Where
        does <em>your</em> setup actually fit? And what kind of edge is your model designed for?
      </p>

      <Predict question="Click each quadrant. Which has the highest edge per bet? Which has the highest TOTAL capturable edge for someone with $50k bankroll?">
        Highest per-bet edge: <strong>Soft · props</strong> (5-10%+ CLV). Highest total $:
        <strong> Sharp · main</strong> (small edge × large capacity). The retail temptation is to chase
        the high-edge quadrants; the syndicate reality is the high-capacity ones. For a $50k bankroll,
        sharp-main yields more dollars per year than soft-props because limits cap the latter.
      </Predict>

      {/* 2x2 quadrant grid */}
      <div className="mt-4 grid grid-cols-[60px_1fr_1fr] gap-2 items-stretch">
        <div></div>
        <div className="text-[9px] uppercase tracking-widest text-neutral-500 text-center pb-1">main markets (1X2 / O-U)</div>
        <div className="text-[9px] uppercase tracking-widest text-neutral-500 text-center pb-1">props / niche</div>

        <div className="text-[9px] uppercase tracking-widest text-neutral-500 self-center text-right">sharp<br/>book</div>
        {['sharp-main', 'sharp-prop'].map(id => {
          const q = ALPHA_QUADRANTS.find(x => x.id === id);
          const active = pick === id;
          return (
            <button key={id} onClick={() => setPick(id)} className={`text-left rounded-lg border p-3 transition-colors ${active ? 'border-orange-400/50 bg-orange-500/[0.08]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className={`text-[12px] font-medium ${active ? 'text-orange-200' : 'text-neutral-200'}`}>{q.name}</div>
              <div className="text-[10px] text-neutral-400 mt-1 leading-snug">edge: {q.edge}</div>
              <div className="text-[10px] text-neutral-400 leading-snug">cap: {q.cap}</div>
            </button>
          );
        })}

        <div className="text-[9px] uppercase tracking-widest text-neutral-500 self-center text-right">soft<br/>book</div>
        {['soft-main', 'soft-prop'].map(id => {
          const q = ALPHA_QUADRANTS.find(x => x.id === id);
          const active = pick === id;
          return (
            <button key={id} onClick={() => setPick(id)} className={`text-left rounded-lg border p-3 transition-colors ${active ? 'border-orange-400/50 bg-orange-500/[0.08]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className={`text-[12px] font-medium ${active ? 'text-orange-200' : 'text-neutral-200'}`}>{q.name}</div>
              <div className="text-[10px] text-neutral-400 mt-1 leading-snug">edge: {q.edge}</div>
              <div className="text-[10px] text-neutral-400 leading-snug">cap: {q.cap}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-orange-400/25 bg-orange-400/5 p-3">
        <div className="text-[10px] uppercase tracking-widest text-orange-300 mb-1">{sel.name}</div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-2">{sel.fit}</div>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div><div className="text-neutral-500 uppercase tracking-widest">edge magnitude</div><div className="text-neutral-200 mt-0.5">{sel.edge}</div></div>
          <div><div className="text-neutral-500 uppercase tracking-widest">capacity</div><div className="text-neutral-200 mt-0.5">{sel.cap}</div></div>
          <div><div className="text-neutral-500 uppercase tracking-widest">competition</div><div className="text-neutral-200 mt-0.5">{sel.diff}</div></div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">edge types · most retail bettors only count the first</div>
        <div className="space-y-1.5">
          {EDGE_TYPES.map(e => (
            <div key={e.id} className="flex items-start gap-3 px-3 py-2 rounded-md border border-white/10 bg-white/[0.02]">
              <Chip color={e.id === 'predictive' ? 'fuchsia' : e.id === 'promo' ? 'emerald' : e.id === 'arb' ? 'sky' : e.id === 'boost' ? 'amber' : 'rose'}>{e.name.split(' ')[0]}</Chip>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-neutral-200">{e.name}</div>
                <div className="text-[10px] text-neutral-500 leading-snug">{e.desc}</div>
              </div>
              <div className="text-right text-[10px] text-neutral-400 hidden sm:block">
                <div><span className="text-neutral-500">size:</span> {e.size}</div>
                <div><span className="text-neutral-500">cap:</span> {e.cap}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Worked title="Worked example · the user&apos;s likely position">
        <p>
          The user&apos;s <span className="font-mono text-fuchsia-300">betting-vibe-04</span> project
          generates predictive forecasts for Brasileirão 1X2 / O-U. That places them at <strong>sharp ·
          main</strong> if they bet Pinnacle, <strong>soft · main</strong> if they bet retail-only.
        </p>
        <p>
          Realistic per-fixture P&amp;L expectation at Pinnacle, with a +1.5% Pinnacle CLV: ~$2 per
          $100 staked, ~3 markets per fixture × 380 fixtures × $200 stake ≈ $4,500/season gross.
          On a $50k bankroll: 9% annual return. Subtract operational time and that&apos;s your edge
          monetized; not life-changing without a full-time syndicate operation, but real and consistent.
        </p>
        <p>
          The far higher annual % return is in <strong>soft · props</strong> (~30-50% on small bankroll)
          but caps out by ~$5k per year due to limits. Most operators run BOTH: sharp-main for capacity,
          soft-props for high-edge top-up.
        </p>
      </Worked>

      <WhenItMatters>
        Strategic decision &mdash; before scaling. A great model deployed in the wrong quadrant
        underperforms a mediocre model deployed correctly. Think hard about where you&apos;ll
        actually book bets before optimising the model that generates them.
      </WhenItMatters>

      <Misconception
        wrong="Real bettors only earn predictive edge."
        right="Most retail-scale profitable operations earn the bulk of their first-year P&L from promo + boost edges. Predictive edge becomes dominant only at sharp-book scale."
        because="Promos can be 50-100% ROI on bonus money for the first few months. Predictive edge is small per bet (1-5%) and only profitable in volume. The lifecycle math: harvest promos → build bankroll → graduate to sharp-book predictive bets when promos exhaust."
      />

      <Deeper>
        <p>
          <strong>Pinnacle as the closing-line oracle.</strong> Even if you don&apos;t bet at Pinnacle,
          its closing line is the reference your CLV is computed against. Get a feed
          (oddsportal/oddsjam) and log the Pinnacle closing odds for every bet you take elsewhere.
        </p>
        <p>
          <strong>Syndicate ops.</strong> A proper syndicate runs ~50&ndash;200 accounts across many
          books to spread limits. Each account is &lt; $5k; total deployable capital scales by sheer
          count. Operational cost: KYC across multiple identities (legal grey area in many
          jurisdictions), bank account management, withdrawal logistics. This is why edge in sports
          betting doesn&apos;t scale to billion-dollar operations &mdash; the operational ceiling caps
          deployable capital.
        </p>
        <p>
          <strong>The structural-edge ladder.</strong> Most successful retail operators climb a
          predictable ladder: (1) free-bet harvesting (~$5-15k profit, 6-12 months), (2) boosted-market
          monitoring (~$5-20k/year), (3) line shopping + small predictive edges (~$10-30k/year),
          (4) graduating to sharp books with established edge. Skipping rungs typically means leaving
          money on the table.
        </p>
        <p>
          <strong>The user&apos;s project doesn&apos;t cover structural edge.</strong> That&apos;s
          intentional &mdash; <span className="font-mono text-fuchsia-300">betting-vibe-04</span> is a
          predictive-edge engine. If you&apos;re not also harvesting promos and boosts, you&apos;re
          leaving the easiest dollars on the table; if you&apos;re not running predictive too,
          you&apos;re capped at a few-thousand-dollar lifetime promo ceiling.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I focus on building a better model or harvesting promos?',
          a: 'Both, but sequenced. Promos first — they fund the bankroll quickly and don\'t require modeling at all. Once you\'ve exhausted them, predictive edge becomes the durable income. The user\'s model is the right thing to build for the long-run game.' },
        { q: 'Is the soft-props quadrant safe to operate in?',
          a: 'Operationally fragile. High edge per bet but books limit fast (sometimes after 1-2 bets). Plan for a 1-3 month account life per book; spread across many books simultaneously.' },
        { q: 'How do I know which quadrant I\'m actually in?',
          a: 'Track your CLV. If you\'re consistently +2% CLV vs Pinnacle close on main markets and not getting limited, you\'re in sharp-main. If you\'re profitable but getting limited at retail books quickly, you\'re in soft-main.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — LIMITS & ACCOUNT LIFE
   The operational ceiling. Books limit/ban winners. Capacity is set by
   account life × number of accounts × per-bet limits, NOT by model quality.
   ========================================================================== */

const LimitsCard = () => {
  const [edgePct, setEdgePct] = useState(2.5);
  const [bankroll, setBankroll] = useState(10000);
  const [bookType, setBookType] = useState('soft'); // soft | sharp | mixed

  const limitProfile = {
    soft:  { perBetCap: 100, accountLifeMonths: 4, banLikelihood: 0.85, name: 'Soft retail (Bet365 / DK)' },
    mixed: { perBetCap: 500, accountLifeMonths: 12, banLikelihood: 0.45, name: 'Mid-tier (BetCRIS / Betfair)' },
    sharp: { perBetCap: 5000, accountLifeMonths: 60, banLikelihood: 0.05, name: 'Sharp (Pinnacle / Circa)' },
  };
  const profile = limitProfile[bookType];
  const annualBets = 12 * 30; // ~bets per year (one fixture × multiple markets)
  const grossEdgePerYear = annualBets * profile.perBetCap * (edgePct / 100);
  const ceilingMultiple = profile.perBetCap * 100 / Math.max(1, bankroll); // bankroll fraction reachable per bet

  return (
    <Card id="limits" icon={Lock} title="Limits & account life — the operational ceiling" accent="amber" index={10}
          subtitle="Books limit and ban winners. Your bankroll growth is capped not by your model but by per-bet limits times number of accounts times account life.">
      <MinSchema>
        Edge magnitude is set by your model. <em>Capturable</em> edge is set by{' '}
        <Term>limit</Term> × account life × number of accounts. The latter is the binding
        constraint at any meaningful bankroll.
      </MinSchema>

      <p>
        Most quantitative bettors discover this the hard way: a perfect model wins money for ~3 months
        on a soft book, then the per-bet limit drops from $1000 to $20, then the account is closed. The
        book&apos;s job is to take square money; your job is to <em>not look square</em> while
        deploying edge. The math: per-year revenue is bounded by <em>per-bet limit × bets per year ×
        edge %</em>, and the per-bet limit is the binding constraint &mdash; you cannot exceed it
        regardless of how big your bankroll is. Operational reality is the cap.
      </p>

      <Predict question="At a $10k bankroll with a 2.5% edge, what's your annual revenue ceiling on a soft retail book vs Pinnacle?">
        Soft: ~<span className="font-mono text-amber-300">${(360 * 100 * 0.025).toFixed(0)}/yr</span>{' '}
        before getting limited. Pinnacle: ~<span className="font-mono text-emerald-300">${(360 * 5000 * 0.025).toFixed(0)}/yr</span>{' '}
        if you can deploy that volume. The 50&times; gap is the entire reason sharp books exist as a
        product category.
      </Predict>

      <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(limitProfile).map(([id, p]) => (
              <button key={id} onClick={() => setBookType(id)}
                className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                  bookType === id
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-100'
                    : 'border-white/10 text-neutral-400 hover:bg-white/5'
                }`}>{id}</button>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-200 font-mono">edge per bet</span>
              <span className="text-neutral-300 font-mono tabular-nums">{edgePct.toFixed(1)}%</span>
            </div>
            <input type="range" min="0.5" max="8" step="0.1" value={edgePct} onChange={(e) => setEdgePct(parseFloat(e.target.value))} className="bs-range w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-amber-200 font-mono">bankroll</span>
              <span className="text-neutral-300 font-mono tabular-nums">${bankroll.toLocaleString()}</span>
            </div>
            <input type="range" min="1000" max="100000" step="1000" value={bankroll} onChange={(e) => setBankroll(parseInt(e.target.value, 10))} className="bs-range w-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="per-bet cap" value={`$${profile.perBetCap.toLocaleString()}`} sub={profile.name} color="text-amber-300" />
            <Stat label="acct life" value={`${profile.accountLifeMonths}mo`} sub={`P(ban) ${(profile.banLikelihood * 100).toFixed(0)}%`} color={profile.accountLifeMonths > 24 ? 'text-emerald-300' : 'text-rose-300'} />
            <Stat label="annual gross" value={`$${grossEdgePerYear.toLocaleString()}`} sub="if you get the volume" color="text-emerald-300" />
            <Stat label="% of bankroll" value={`${(grossEdgePerYear / bankroll * 100).toFixed(0)}%`} sub="annual gross / bankroll" color="text-neutral-200" />
          </div>
        </div>

        {/* Account-life lifecycle visual */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">account lifecycle</div>
          <svg viewBox="0 0 320 160" className="w-full h-auto">
            <defs>
              <linearGradient id="lim-bk" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#6ee7b7" stopOpacity="0.7" />
                <stop offset="0.6" stopColor="#fbbf24" stopOpacity="0.7" />
                <stop offset="1" stopColor="#fb7185" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <line x1="20" y1="100" x2="300" y2="100" stroke="#525252" strokeWidth="0.5" />
            {/* phases */}
            <rect x="20" y="60" width="80" height="40" fill="rgba(110,231,183,0.18)" stroke="#6ee7b7" strokeOpacity="0.5" rx="3" />
            <text x="60" y="48" fontSize="9" textAnchor="middle" fill="#6ee7b7">deposit + welcome</text>
            <text x="60" y="84" fontSize="11" textAnchor="middle" fill="#6ee7b7" fontFamily="monospace">$1k → $5k</text>
            <rect x="100" y="50" width="100" height="50" fill="rgba(251,191,36,0.18)" stroke="#fbbf24" strokeOpacity="0.5" rx="3" />
            <text x="150" y="38" fontSize="9" textAnchor="middle" fill="#fbbf24">winning streak</text>
            <text x="150" y="76" fontSize="11" textAnchor="middle" fill="#fbbf24" fontFamily="monospace">$5k → $15k</text>
            <rect x="200" y="70" width="60" height="30" fill="rgba(251,113,133,0.18)" stroke="#fb7185" strokeOpacity="0.5" rx="3" />
            <text x="230" y="58" fontSize="9" textAnchor="middle" fill="#fb7185">limit cuts</text>
            <text x="230" y="92" fontSize="11" textAnchor="middle" fill="#fb7185" fontFamily="monospace">cap → $20</text>
            <rect x="260" y="80" width="40" height="20" fill="rgba(127,29,29,0.20)" stroke="#dc2626" strokeOpacity="0.5" rx="3" />
            <text x="280" y="74" fontSize="9" textAnchor="middle" fill="#dc2626">closure</text>
            <text x="280" y="94" fontSize="9" textAnchor="middle" fill="#dc2626">KYC</text>
            {/* arrows between phases */}
            <text x="60" y="120" fontSize="8" textAnchor="middle" fill="#737373">month 0</text>
            <text x="150" y="120" fontSize="8" textAnchor="middle" fill="#737373">month 1-3</text>
            <text x="230" y="120" fontSize="8" textAnchor="middle" fill="#737373">month {profile.accountLifeMonths}-{Math.round(profile.accountLifeMonths * 1.2)}</text>
            <text x="280" y="120" fontSize="8" textAnchor="middle" fill="#737373">+1mo</text>
            <text x="160" y="148" fontSize="9" textAnchor="middle" fill="#a3a3a3">soft-book typical lifecycle</text>
          </svg>
        </div>
      </div>

      <Worked title="Worked example · capacity ladder">
        <p>
          Your model has an honest 2.5% edge on Brasileirão 1X2. With 1 retail account at $100/bet
          limit: ~$900/yr ceiling. With 10 retail accounts spread across books: $9k/yr (with
          coordination overhead). With 1 Pinnacle account: $45k/yr ceiling, no limit issues.
        </p>
        <p>
          <strong>Conclusion.</strong> The right operational stack is: 1 Pinnacle (or sharpest available
          book) for capacity, plus 5-10 retail accounts for promo harvest + line shopping. Adding more
          retail accounts beyond ~10 hits diminishing returns from coordination cost. Pinnacle access
          (or Circa, BetCRIS) is the single biggest operational unlock for any quant bettor.
        </p>
      </Worked>

      <WhenItMatters>
        Always at the deployment-planning stage. A great model with no Pinnacle access is a great model
        capped at $5-15k/year revenue regardless of bankroll. The infrastructure layer (book access,
        account management, withdrawal logistics) is operationally as important as the model layer.
      </WhenItMatters>

      <Misconception
        wrong="If I have +EV I'll keep growing my bankroll forever."
        right="You'll grow until you hit per-bet limits, then your bankroll grows but per-bet stake doesn't, then you'd need more accounts to scale. Most retail bettors plateau at $20-50k bankroll because of this."
        because="Limits set the absolute ceiling on per-bet stake. Once bankroll exceeds ~50× per-bet cap, additional bankroll grows your bank account but not your edge revenue. The exit ramp is more accounts (operational complexity grows nonlinearly) or graduating to sharp books."
      />

      <Deeper>
        <p>
          <strong>What triggers limits.</strong> Books detect winners via several signals: bet timing
          relative to line moves (you bet right before a steam), unusual market choices (lots of niche
          props), large-relative-to-account stakes, withdrawal patterns. Counter-strategies (parlay
          some bets, vary timing) extend account life by 30-100% on average.
        </p>
        <p>
          <strong>Sharp-book limits scale with relationship.</strong> Pinnacle starts at $1-5k per bet
          for new accounts, scales up to $50k+ for known professionals. Building the relationship
          (consistent betting, no withdrawals for a quarter, no obvious arb patterns) doubles
          deployable capacity over a year.
        </p>
        <p>
          <strong>Withdrawal logistics.</strong> Many soft books require KYC + manual review for
          withdrawals over a few thousand dollars. Plan deposit-to-withdrawal cycles around weeks
          (book speed) not days. Crypto withdrawal is faster but also a flag for some compliance
          systems.
        </p>
        <p>
          <strong>Jurisdiction matters.</strong> Many betting markets are restricted by jurisdiction
          (UK, Australia, Brazil all different). Understand which books accept which residencies; book
          choice is sometimes set by where you live, not by sharpness preference.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I run multiple accounts (multi-accounting)?',
          a: 'Legal grey area in most jurisdictions; explicitly banned by most book TOS. Syndicates do it routinely; retail accounts caught multi-accounting get all balances seized. Know your risk before scaling this way.' },
        { q: 'Is Betfair an alternative to traditional books?',
          a: 'Yes — exchange model, no limits per se (just liquidity), commission-based. Pinnacle-quality lines on liquid markets. Different operational stack (matched-bet sizing) but viable for quant operations.' },
        { q: 'How do I extend account life on soft books?',
          a: 'Vary stake sizes, occasionally bet random non-edge bets (singles, parlays), avoid betting right at the limit, withdraw modestly and irregularly. Adds 50-150% to typical account life. Look up "stake-shaping" guides.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — BOUNDARY & PROJECT MAP (synthesis)
   Diagnostic table mapped to betting-vibe-04 backtest / Kelly / CV stack.
   Mirror of the Forecaster's Craft boundary card — same "good/partial/gap"
   status discipline, but for the deployment-side files.
   ========================================================================== */

const BS_PROJECT_ROWS = [
  { card: 'vig', topic: 'Vig & true probabilities',
    where: 'No vig-removal step before computing edge in src/cli/backtest. Currently uses 1/odds.',
    state: 'gap',
    next: 'Add Shin / power vig-strip helper in src/backtest; recompute all historical CLV with vig-stripped probs.',
    file: 'src/cli/backtest/' },
  { card: 'clv', topic: 'CLV truth-meter',
    where: 'Backtest reports ROI + max drawdown but NOT CLV. summary.json has no CLV field.',
    state: 'gap',
    next: 'Add CLV per bet (vs Pinnacle close, fallback to consensus) to backtest output; weekly aggregate in reports.',
    file: 'src/cli/backtest/, reports/footystats_backtest/' },
  { card: 'walkfwd', topic: 'Walk-forward CV',
    where: 'configs/cv.yaml has pinned walk_forward.seed; tests/contracts enforce isolation. Excellent.',
    state: 'good',
    next: 'Document the embargo size choice; consider adding CPCV for the next backtest cycle.',
    file: 'configs/cv.yaml, tests/contracts/' },
  { card: 'multest', topic: 'Multiple-testing inflation',
    where: 'No deflated Sharpe; capture_baseline reports raw Sharpe (currently null).',
    state: 'gap',
    next: 'Compute total trial budget per pipeline run; report deflated Sharpe in summary.json + comparison.html.',
    file: 'src/cli/capture_baseline.py, models/reports/' },
  { card: 'kelly', topic: 'Kelly geometry',
    where: 'src/cli/backtest computes Kelly per-bet (good); applies fractional cap.',
    state: 'partial',
    next: 'Add per-bet logging of f, f*, growth contribution; build a Kelly-curve diagnostic in reports.',
    file: 'src/cli/backtest/' },
  { card: 'frackelly', topic: 'Fractional Kelly under uncertainty',
    where: 'Hard-coded fractional cap (likely 0.25); not tied to per-bet edge SE.',
    state: 'partial',
    next: 'Estimate edge SE from CV; size Kelly fraction = mu^2/(mu^2 + se^2). Per-bet, dynamic.',
    file: 'src/cli/backtest/' },
  { card: 'ruin', topic: 'Bankroll & risk of ruin',
    where: 'Max drawdown reported; no risk-of-ruin probability or Calmar.',
    state: 'partial',
    next: 'Add Calmar + Monte-Carlo P(50% DD) to backtest. Cheap; high diagnostic value.',
    file: 'src/cli/backtest/' },
  { card: 'corr', topic: 'Portfolio Kelly with correlation',
    where: 'Per-bet Kelly only; no portfolio aggregation across same-fixture bets.',
    state: 'gap',
    next: 'Add per-fixture portfolio Kelly: simulate correlation from distributional model, solve f = Σ⁻¹μ.',
    file: 'src/cli/backtest/, src/models/' },
  { card: 'alpha', topic: 'Where edge lives',
    where: 'Project is currently single-source (predictive on Brasileirão main). No alpha-source mapping.',
    state: 'partial',
    next: 'Document target deployment quadrant (sharp-main if Pinnacle access, soft-main otherwise); plan capacity from there.',
    file: 'roadmap.md / docs/' },
  { card: 'limits', topic: 'Limits & account life',
    where: 'No operational consideration in the engine; out of the model layer\'s scope.',
    state: 'partial',
    next: 'Add a deploy-tier annotation to backtest reports: "this strategy is deployable at $X/bet for ~Y months".',
    file: 'docs/runbooks/' },
];

const STATE_STYLE = {
  good:    { label: 'good',    color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30' },
  partial: { label: 'partial', color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-400/30' },
  gap:     { label: 'gap',     color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-400/30' },
};

const BoundaryCard = () => {
  const [hover, setHover] = useState(null);
  const counts = BS_PROJECT_ROWS.reduce((s, r) => { s[r.state]++; return s; }, { good: 0, partial: 0, gap: 0 });
  return (
    <Card id="boundary" icon={Crosshair} title="Boundary &amp; project map" accent="fuchsia" index={11} anchor
          subtitle="Each card mapped to the deployment-side files in betting-vibe-04. The map you return to when deciding what to ship in your backtest layer next.">
      <MinSchema>
        Same three categories as the Forecaster&apos;s Craft boundary:
        <span className="text-emerald-300">good</span> (keep, polish),
        <span className="text-amber-300"> partial</span> (working but unfinished),
        <span className="text-rose-300"> gap</span> (not present yet, ship). Sort the gaps by{' '}
        <em>expected risk-adjusted impact per engineering-day</em>.
      </MinSchema>

      <p>
        This is the deployment-side mirror of the Forecaster&apos;s Craft boundary card. Where that map
        addressed &ldquo;how do I model edge?&rdquo;, this addresses &ldquo;how do I deploy edge into
        bankroll growth?&rdquo;. Click a card name in the leftmost column to jump back to that section;
        hover any row for the live state in your{' '}
        <span className="text-fuchsia-300">betting-vibe-04</span> repo.
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
        {BS_PROJECT_ROWS.map(r => {
          const s = STATE_STYLE[r.state];
          return (
            <div key={r.card}
              onMouseEnter={(e) => setHover({ row: r, mx: e.clientX, my: e.clientY })}
              onMouseMove={(e) => setHover({ row: r, mx: e.clientX, my: e.clientY })}
              onMouseLeave={() => setHover(null)}
              className={`grid grid-cols-[60px_1fr_70px] gap-2 px-3 py-2 border-t border-white/5 items-start text-[11px] ${hover?.row === r ? 'bg-white/[0.04]' : ''}`}>
              <div className="flex flex-col">
                <CrossLink to={r.card} recap={`Jump to ${r.topic}.`}>{r.card}</CrossLink>
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
          <strong>Where to start (one operator&apos;s order).</strong> The four highest-impact moves
          for the deployment side of <span className="text-fuchsia-300">betting-vibe-04</span>:
        </p>
        <p>
          (1) <em>Add CLV to backtest output</em> (Card 02 → no other change has higher diagnostic
          payoff per engineering-hour).
          <br />
          (2) <em>Vig-strip implied probabilities</em> (Card 01 → fixes silent EV bias on every bet).
          <br />
          (3) <em>Edge-SE-aware fractional Kelly</em> (Card 06 → ships the right Kelly fraction
          dynamically per bet).
          <br />
          (4) <em>Deflated Sharpe in capture_baseline</em> (Card 04 → tells you whether your apparent
          backtest edge is real or artifactual).
        </p>
        <p>
          <strong>Pair with the Forecaster&apos;s Craft.</strong> Each row above maps to a sibling row
          in the <CrossLink to="forecasters-craft" external recap="Sibling explainer: how the model encodes market-orthogonal information.">Forecaster&apos;s Craft</CrossLink>{' '}
          boundary card. The two together give the full picture: model layer + deployment layer. Read
          either card&apos;s &ldquo;what to fix next&rdquo; in isolation and you may pick a deep
          modeling change when a quick deployment fix would yield more bankroll growth, or vice versa.
        </p>
        <p>
          <strong>Reading discipline.</strong> Quarterly cycle. Pick one row per quarter (alternating
          model-side and deploy-side). Ship the change. Measure CLV impact. Decide whether to deepen
          or move on. Don&apos;t try to fix everything at once; the dependencies cross over and a
          half-shipped Kelly change without CLV monitoring is worse than either alone.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where does the deployment side of the project sit on average?',
          a: `${counts.good} good · ${counts.partial} partial · ${counts.gap} gap. Most of the modeling-side honest-evaluation discipline (walk-forward, leakage lint) is already in place. The deployment side has more room — vig stripping, CLV tracking, deflated Sharpe, portfolio Kelly are all gaps or partials.` },
        { q: 'What\'s the ONE thing to fix next?',
          a: 'CLV in backtest reports. ~1 day of work. Halves the time-to-detect any edge change in the model. Everything else compounds on top once you have a CLV-aware feedback loop.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — NEXT TRAILS
   ========================================================================== */

const NextTrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainer, depth, foundations, and the wider arena" accent="violet" index={12}>
    <MinSchema>
      The Bettor&apos;s Stack is the deployment half of the loop. The Forecaster&apos;s Craft is the
      modeling half. Each card here can also be expanded into its own deep-dive.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers in this series',
        note: 'in this sandbox',
        items: [
          { label: 'The Forecaster\'s Craft', href: '#forecasters-craft', note: 'How a quantitative football model actually earns alpha — loss alignment, the information hypothesis, feature engineering, causal lens, SSL pretraining, transfer, distributional, ensembling, honest HPO, drift, RL portfolio. Pairs 1:1 with this explainer.' },
          { label: 'Forecasting Noisy Series', href: '#statistical-forecasting', note: 'The general statistical/ML forecasting toolkit (decomposition, ETS, ARIMA, Prophet, gradient boosting, conformal). Many ideas here apply directly.' },
          { label: 'Superforecasting', href: '#superforecasting', note: 'Calibration, base rates, Fermi, Bayesian updating — the human / judgmental side of probability. The Predict-then-Reveal anchor pattern is recommended reading.' },
          { label: 'Deep Uncertainty', href: '#deep-uncertainty', note: 'When probabilities themselves don\'t apply: scenario planning, RDM, real options. The complement to everything in this explainer.' },
        ],
      },
      {
        title: 'Deepen inside the topic',
        note: 'one level of detail down per card',
        items: [
          { label: 'Kelly · "A New Interpretation of Information Rate" (1956)', note: 'The original paper. Short, beautifully written, contains the full derivation of optimal log-growth bet sizing.', external: true },
          { label: 'MacLean / Thorp / Ziemba · The Kelly Capital Growth Investment Criterion (2010)', note: 'The definitive collection of papers on Kelly under uncertainty, fractional Kelly, drawdown-aware sizing, and decades of practitioner experience.', external: true },
          { label: 'Shin · "Measuring the Incidence of Insider Trading in a Market for State-Contingent Claims" (1993)', note: 'The foundational paper for the Shin vig-removal model.', external: true },
          { label: 'López de Prado · Advances in Financial ML (2018)', note: 'Walk-forward, embargo, purging, CPCV, deflated Sharpe. The rigour layer for any quant betting backtest.', external: true },
          { label: 'Buchdahl · "How to Bet Like a Pro" + Pinnacle CLV studies', note: 'The retail-friendly empirical reference for CLV vs ROI and Pinnacle as oracle.', external: true },
          { label: 'Joseph Buchdahl · Football Data Github', note: 'Free historical Brasileirão odds data for backtesting and CLV computation.', external: true },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the math under the hood',
        items: [
          { label: 'Information theory · Cover & Thomas chapter 6', note: 'Kelly\'s gambling theorem, log-utility, KL divergence as edge. The closed-form math behind everything in this explainer.' },
          { label: 'Markowitz portfolio theory', note: 'Mean-variance optimization, efficient frontier. Portfolio Kelly is Markowitz with log-utility.' },
          { label: 'Stochastic processes · Karatzas & Shreve', note: 'Brownian motion, hitting times, drawdown distributions. The rigorous version of risk-of-ruin formulas.' },
          { label: 'Optimal stopping & sequential decision', note: 'For in-play and bet-timing problems. Robbins-Monro, Wald\'s identity.' },
          { label: 'Behavioural finance · Kahneman, Thaler', note: 'Why retail bettors over-stake longshots and under-stake favourites; the psychology underlying favourite-longshot bias.' },
        ],
      },
      {
        title: 'Zoom out · domains where this matters',
        note: 'the same toolkit, different stakes',
        items: [
          { label: 'Quantitative finance', note: 'Kelly, drawdown, deflated Sharpe, multiple testing — same exact problems at billion-dollar scale. The vocabulary is "risk parity" / "factor investing" but the math is identical.' },
          { label: 'Sports analytics broadly', note: 'NBA, NFL, MLB. Different mechanics (more possessions, smaller teams) but same modeling craft + bettor\'s stack.' },
          { label: 'Prediction markets · Polymarket, Kalshi', note: 'Liquidity is lower, edges are larger, info asymmetry is higher. CLV concept maps directly.' },
          { label: 'Casino games', note: 'Where Kelly came from (Edward Thorp, blackjack 1962). Some games still beatable; the bettor-stack discipline transfers.' },
          { label: 'Crypto markets / perpetual futures', note: 'High vig, high leverage, real risk-of-ruin math. The Kelly + drawdown + correlation framework is essential.' },
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
        <span className="text-emerald-300">Kelly 1956</span>
        <span className="text-fuchsia-300">L&oacute;pez de Prado &middot; Adv. in Financial ML</span>
        <span className="text-violet-300">Pinnacle CLV studies</span>
        <span className="text-amber-300">Shin 1993</span>
        <span className="text-cyan-300">Thorp 2006 &middot; Kelly bettor case</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sibling explainer: <em>The Forecaster&apos;s Craft</em> &mdash; how a model encodes
        market-orthogonal information. Read either first, then the other.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function BettorsStackExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].bs-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].bs-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #6ee7b7; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(110,231,183,0.4);
        }
        input[type=range].bs-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #6ee7b7; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <VigCard />
        <ClvCard />
        <WalkForwardCard />
        <MultipleTestingCard />
        <KellyCard />
        <FractionalKellyCard />
        <RuinCard />
        <PortfolioKellyCard />
        <AlphaMapCard />
        <LimitsCard />
        <BoundaryCard />
        <NextTrailsCard />
      </main>

      <Footer />
    </div>
  );
}
