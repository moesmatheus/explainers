# retail-quant — design

**Slug:** `retail-quant`
**Title:** The Retail Quant's Stack
**Tags:** `quant`, `markets`, `interactive`, `equations`
**Sibling:** queued — `markets-modeling` (basic → SOTA price/return modeling)

## Frame

A multi-strategy book for a sophisticated BR-domiciled retail investor at a foreign broker.
No leverage. No HFT. No relative-value arbitrage that requires prime-broker infra. The
explainer leans on **intrinsic risk premia + cost discipline** instead of access alpha.

## Anchor

★ **$250k 4-sleeve book** at a foreign broker (mostly USD, ~25-30% in BRL via Tesouro):

- Factor sleeve (US factor ETFs: VLUE / MTUM / QUAL / USMV)
- Trend sleeve (CME minis OR DBMF/KMLM as accessible substitute)
- Vol-premium sleeve (cash-secured puts + covered calls, defined-risk)
- Strategic core (Tesouro IPCA+ + short-duration US TIPS, risk-parity-ish weights)

## Card lineup (20)

| # | id | title | accent | anchor |
|---|---|---|---|---|
| 01 | premia | The risk-premium menu | sky | ★ |
| 02 | alpha | Alpha vs risk premia — honest accounting | violet | |
| 03 | nongauss | Returns aren't Gaussian — fat tails, jumps, regimes | rose | |
| 04 | stochmodels | Stochastic price models — GBM, mean-reversion, regimes | violet | |
| 05 | factordesign | Factor sleeve I — cross-sectional design | emerald | |
| 06 | factorimpl | Factor sleeve II — implementation (ETFs vs stocks) | emerald | |
| 07 | tsmom | Time-series momentum — why trend works | amber | |
| 08 | trend | Trend sleeve — futures and CTA-ETF | amber | |
| 09 | varprem | IV vs RV — the variance risk premium | fuchsia | |
| 10 | volstruct | Vol structures — CSP, CC, credit spreads + Greeks | fuchsia | |
| 11 | core | Strategic core — risk parity, IPCA+, TIPS | cyan | |
| 12 | sizing | Position sizing — vol-targeting + fractional Kelly | emerald | ★ |
| 13 | portconstr | Portfolio construction — Markowitz → shrinkage / risk parity | sky | |
| 14 | costs | Transaction costs at retail scale — the cost-Sharpe ceiling | rose | |
| 15 | backtest | Backtesting & walk-forward — overfitting, look-ahead | violet | |
| 16 | tax | Tax frictions — BR + foreign-broker IRPF | amber | |
| 17 | fx | Currency exposure — BRL carry, USD as natural hedge | cyan | |
| 18 | drawdown | Drawdown survival — 2008/2020/2022 + behavioral | rose | |
| 19 | anchor | ★ Anchor — the $250k book end-to-end | fuchsia | ★ |
| 20 | trails | Next trails — siblings, depth, foundations | violet | |

## Pedagogical primitives (reused per AGENTS.md)

`Predict`, `Worked`, `CrossLink`, `MinSchema`, `WhenItMatters`, `QA`, `Misconception`,
`NextSteps`, `Term` glossary tooltip, `FloatingTip`, `Stat`, `Chip`, `Deeper`.

## Math style

- Heavy: KaTeX inline + sliders that move the math.
- Color macros: `\num` amber, `\hi` rose, `\co` sky, `\gr` emerald, `\vi` violet, `\fu` fuchsia.
- Formulas to feature: log-returns + GBM, Fama-French 3/5-factor decomposition, Sharpe
  decomposition, Black-Scholes Greeks (Δ Γ Θ ν), Kelly fraction with edge-SE shrinkage,
  Markowitz QP, deflated Sharpe, time-series momentum t-stat, vol-targeting scaling,
  ledoit-wolf shrinkage intensity, currency-hedged-Sharpe.

## Build process (PREFERENCES — stage-by-stage, MANDATORY)

- A: scaffolding only (primitives + Hero + SectionNav + GLOSS + stub default export). Verify it loads.
- B: register in `src/explainers.js`. Verify scaffolding renders. SECTIONS array placeholder for all 20 cards.
- C–L: 2 cards per stage. After each stage: `npx vite build` → eval → confirm card IDs and KaTeX errors=0.
- M: full QA detector sweep (10 detectors per AGENTS.md) → fix until 0.
- N: update PREFERENCES.md with new patterns.

## BR sidebar content (woven, not separate cards)

- Card 11 (core) — Tesouro IPCA+ as the BR real-rates anchor; how its post-tax yield interacts with US TIPS.
- Card 16 (tax) — full BR card: 15% swing / 20% day-trade equity / IRPF carnê-leão on foreign-broker dividends + interest / monthly DARF.
- Card 17 (fx) — BRL carry, hedge ratio for a BR investor with BRL liabilities, structural USD diversification.
- Card 19 (anchor) — net Sharpe computed AFTER costs + BR tax + FX drag.
