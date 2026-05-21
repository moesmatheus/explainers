# Causal Inference — explainer design

**Date:** 2026-05-21
**Slug:** `causal-inference`
**Language:** English

## Concept

A unified-survey explainer on causal inference: both formal frameworks
(potential outcomes + Pearl's DAGs) *and* the practical estimator toolkit
(RCT, matching/propensity, IPW, IV, diff-in-diff, RDD, synthetic control,
double ML, mediation).

**Anchor question:** *Did the National Supported Work (NSW) job-training
program actually raise participants' earnings — and by how much?* The hook
is a contradiction: a naive observational comparison says trainees earned
**less** than non-trainees (they were selected from disadvantaged
populations — ex-addicts, ex-offenders, the long-term unemployed), while the
randomized experiment says **+$1,800/yr**. The explainer is the bridge
between those two numbers. This is the LaLonde (1986) / Dehejia–Wahba (1999)
setup — valuable because an experimental benchmark exists, so every
observational estimator can be *scored* against ground truth.

## Spine (two anchor cards)

- **★ Ladder of Causation** — early frame card. Pearl's three rungs
  (association → intervention → counterfactual); each later card tagged to
  its rung.
- **★ Anchor: the LaLonde scorecard** — closing synthesis. A leaderboard of
  every estimator with estimate, error bar, and signed gap vs the +$1,800
  experimental truth. Predict-then-reveal on the headline.

Both carry `anchor` → fuchsia ring in the side-nav.

## Visual identity

Violet (conceptual spine) + emerald (back-door *closed* / effect identified)
+ rose (back-door *open* / confounded / biased). Semantically load-bearing:
DAG edges and estimates turn rose when a path is open, emerald when blocked.

## Card lineup (~20 cards)

1. **Hero / The question** — NSW program, two contradictory answers.
2. **★ Ladder of Causation** (spine) — three rungs.
3. **Potential outcomes** — Y(1), Y(0), the fundamental problem, ATE vs ATT.
4. **Confounding & DAGs** — interactive DAG; back-door paths; selection.
5. **The do-operator** — P(Y∣do(X)) vs P(Y∣X); intervention ≠ observation.
6. **Back-door, front-door & the collider trap** — d-separation; adjustment.
7. **Randomization (RCT)** — random assignment severs all back-doors.
8. **Selection bias** — the naive estimate and why it comes out negative.
9. **Matching & propensity scores** — overlap / common support; balance.
10. **Regression & bad controls** — post-treatment bias; controlling wrong.
11. **Inverse propensity weighting** — pseudo-population; doubly robust.
12. **Instrumental variables** — unmeasured confounder; exclusion; LATE.
13. **Difference-in-differences** — parallel-trends assumption.
14. **Regression discontinuity** — cutoff-based natural experiment.
15. **Synthetic control** — counterfactual from a weighted donor pool.
16. **Double ML & causal forests** — CATE / heterogeneous effects.
17. **Mediation analysis** — direct vs indirect effects; front-door applied.
18. **Sensitivity & untestable assumptions** — E-values; what breaks each.
19. **★ Anchor: the LaLonde scorecard** (spine) — estimator leaderboard.
20. **NextTrails** — cross-link to `forecasters-craft/Causal`; future trails.

## Signature interactives

**The DAG family** (cards 4–6, 10) shares one `CausalDAG` primitive: SVG
nodes, edges that turn rose when a back-door path is open / emerald when
blocked, a live `true β / bias / observed β` readout. Reused four ways:
confounder toggles; a `do(X)` button that deletes incoming edges and
resamples; the collider trap (conditioning creates a spurious edge); bad
controls (chip per covariate, confounder drops bias, collider/mediator
raises it).

**Estimator demos** — one focused interactive each: propensity-score overlap
histogram + caliper slider (matching); re-weighted pseudo-population bars
(IPW); weak-instrument variance blow-up + complier 2×2 (IV); 2×2
parallel-trends plot with a "violate parallel trends" slider (DiD);
cutoff-jump scatter + bandwidth slider (RDD); donor-pool weight construction
(synthetic control); CATE heatmap across a covariate (double ML).

**Anchor scorecard** — estimator leaderboard, each a bar with estimate + CI
against the +$1,800 dashed truth line; emerald if CI covers truth, rose if
not. Predict-then-reveal slider on the headline.

**Sensitivity card** — E-value slider: how strong must an unmeasured
confounder be to drag the estimate's CI across zero?

## Build mechanics

- **Synthetic data:** seeded module-scope `buildNSW()` generates ~500 units
  (age, education, pre-program earnings ×2, race, marital status) with a
  strong selection-on-observables assignment model; potential outcomes
  calibrated so the experimental ATT ≈ +$1,800 and the naive observational
  contrast is negative. Helpers `mulberry32`, `boxMuller` at module scope.
- **Primitives** (Stage A): `Card`, `SectionNav`, `Hero`, `Predict`,
  `Misconception`, `QA`, `Worked`, `Stat`, `CrossLink`, `FloatingTip`,
  `Term` + `GLOSS` glossary, and the reused `CausalDAG`.
- **Process:** strict stage-by-stage build (PREFERENCES.md hard rule).
  Stage A scaffolding → Stage B register in `src/explainers.js` → Stages
  C–L add 2 cards each (`npx vite build` + `preview_eval` after each) →
  Stage M QA detector sweep → Stage N update PREFERENCES.md.
- **Registry entry:** `{ slug: 'causal-inference', title: 'Causal
  Inference', blurb: 'From correlation to counterfactual — the LaLonde
  job-training puzzle', tags: ['statistics','methods','econometrics'],
  component }`.

## Excluded (YAGNI)

Nothing major excluded — the user opted in to a deliberately broad survey
including double ML, causal forests, and mediation. RDD and synthetic
control are kept as full toolkit cards even though they are not applied to
the NSW anchor (no running-variable cutoff / single treated unit in NSW).
