# markets-modeling — design

**Slug:** `markets-modeling`
**Title:** Modeling Markets · basic to SOTA
**Tags:** `quant`, `markets`, `modeling`, `interactive`, `equations`
**Sibling pair:**
- `forecasters-craft` (sports modeling) ↔ `markets-modeling` (markets modeling) — modeling side
- `bettors-stack` (sports deployment) ↔ `retail-quant` (markets deployment) — deployment side

## Frame

The modeling-side companion to retail-quant. Walks from the random-walk null up
to transformer-on-orderbook SOTA. Each card adds ONE realistic feature to the
prior model and shows the math + a worked simulation.

## Anchor

★ **SPY next-month return forecast — progressive model comparison.**

Five model levels:
1. Gaussian iid (null) — μ + σ·Z
2. ARMA-GARCH — autocorrelation + vol clustering
3. SVJD — stochastic-vol-with-jumps
4. Gradient boosting on engineered features (vol regime, momentum, term spread, vix term)
5. Ensemble of all four

Display: predicted distribution PDFs side-by-side with realized return marker;
metrics table (MSE, log-likelihood, CRPS, reliability). Predict-then-reveal:
guess the SOTA's CRPS improvement over the null.

## Card lineup (20)

| # | id | title | accent | anchor |
|---|---|---|---|---|
| 01 | targets | What we model — returns, vol, co-movement, regimes, order flow | violet | ★ |
| 02 | null | The null model — random walk / GBM / EMH baseline | cyan | |
| 03 | styfacts | Stylized facts of returns | rose | |
| 04 | arma | AR / MA / ARMA / ARIMA | violet | |
| 05 | coint | Mean reversion · cointegration · VAR / VECM | emerald | |
| 06 | garch | ARCH / GARCH | amber | |
| 07 | heston | Stochastic volatility (Heston / SABR) | fuchsia | |
| 08 | roughvol | Rough volatility (Bergomi / Gatheral) | fuchsia | |
| 09 | jumps | Jumps & Lévy processes | rose | |
| 10 | factors | CAPM → Fama-French → APT → Fama-MacBeth | sky | |
| 11 | statespace | State-space & Kalman filter | violet | |
| 12 | regime | Regime-switching / HMM | amber | |
| 13 | bayes | Bayesian inference (Black-Litterman as Bayes) | violet | |
| 14 | micro | Microstructure · Hawkes · order book | cyan | |
| 15 | ml | ML for finance — boosted trees | emerald | |
| 16 | sequence | Sequence models — LSTM / GRU / attention | violet | |
| 17 | transformers | Transformers / SOTA — orderbook & news | fuchsia | |
| 18 | eval | Forecast evaluation — CRPS, log-loss, calibration | emerald | ★ |
| 19 | anchor | Worked SPY 1-month forecast — null → SOTA progression | fuchsia | ★ |
| 20 | trails | Next trails | violet | |

## Math style

- Heavy. KaTeX inline + sliders that move the math.
- Color macros: `\num` amber, `\hi` rose, `\co` sky, `\gr` emerald, `\vi` violet, `\fu` fuchsia.
- Featured equations: GBM SDE, AR(p)/MA(q) Wold representation, ARCH/GARCH variance recursion,
  Heston SDE pair, fractional BM Hurst exponent, Lévy-Khintchine, CAPM/Fama-French regression,
  Kalman filter equations, EM forward-backward for HMM, Black-Litterman posterior, Hawkes
  intensity, gradient-boosted residual update, attention softmax, CRPS integral.

## Build process (PREFERENCES — stage-by-stage, MANDATORY)

- A: scaffolding only. `npx vite build` → eval → confirm load.
- B: register in `src/explainers.js`. Verify all 20 SECTIONS render.
- C–L: 2 cards per stage. After each: build + eval + confirm zero KaTeX errors.
- M: full QA detector sweep (10 detectors per AGENTS.md).
- N: update PREFERENCES with new patterns; cross-link to siblings via NextSteps in BOTH directions.

## Sibling cross-linking

After building, ensure:
- `markets-modeling/Trails` links to retail-quant, bettors-stack, forecasters-craft.
- `retail-quant/Trails` already links to markets-modeling (planned) — update once built.
- `forecasters-craft/NextSteps` should mention markets-modeling as the markets-side cousin.
