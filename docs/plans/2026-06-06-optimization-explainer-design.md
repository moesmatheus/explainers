I have the contract. Now I'll synthesize the integrative front-matter. Let me adjudicate the corrections and assemble the build doc.

One quick adjudication check on the DP table correction before I write: 6 rows × 11 columns. With n=5 orders the table has rows i=0..5 (6 rows), and a capacity axis of 0..10 (11 columns). 6×11 = 66. The "55" figure was wrong; the correction to 66 is right. The Newton iteration correction (pure ~6 vs safeguarded ~8) is also sound. I'll register both.

# Optimization explainer — build-ready spec

This is the integrative front-matter for the Optimization explainer (working title: *The Roastery*). It freezes the spine, visual identity, shared viz primitives, numerical-risk register, build-stage order, and cross-link graph that the per-card specs (appended below this document) build against. Every number traces to the frozen Anchor Register; this doc is the single source of truth for everything *between* cards. The contract lives in `/Users/matheus/Documents/GitHub/explainers-claude/optimization/ALIGNMENT.md`.

---

## Spine & reading order

The reader's mental table-of-contents is **three questions**. Every card routes back to exactly one. The governing picture: *you are standing on a landscape; descend until every direction down is blocked; convexity makes "locally blocked" mean "globally best"; a constraint is a wall and its multiplier `λ` is how hard the wall pushes back — the shadow price.*

- **Q1 · Which way is down?** — the gradient compass, step size as trust, momentum, curvature/Newton, conditioning.
- **Q2 · Am I at the bottom?** — stationarity, convexity as the watershed, constrained optimality (Lagrange → KKT), duality & shadow prices.
- **Q3 · What if the landscape fights back?** — it blurs (stochastic), shatters into points (discrete LP→ILP→DP→flows), goes bumpy (non-convex, global).

Final card order (N = 21). Accent = the dominant KaTeX/UI accent for that card's hero. ★ = spine/anchor card.

| # | Short title | Spine | Accent |
|---|---|---|---|
| **I — Frame** | | | |
| 1 | What is optimization? | Q1 setup | emerald |
| 2 ★ | The gradient is a compass | Q1 | indigo |
| **II — Which way is down?** | | | |
| 3 | Gradient descent & step size | Q1 | indigo |
| 4 | Curvature & Newton | Q1 | cyan |
| 5 | Momentum & acceleration | Q1 | indigo |
| **III — Am I at the bottom?** | | | |
| 6 ★ | Convexity — the watershed | Q2 | emerald |
| 7 | Optimality conditions | Q2 | cyan |
| 8 | Non-smooth & subgradients | Q2 | indigo |
| 9 ★ | Constraints & Lagrange multipliers | Q2 | amber |
| 10 | The KKT conditions | Q2 | amber |
| 11 ★ | Duality & shadow prices | Q2 | violet (dual) |
| **IV — When the landscape shatters (discrete)** | | | |
| 12 | Linear programming & the simplex | Q3 | amber |
| 13 | Integer programming & branch-and-bound | Q3 | amber/rose |
| 14 | Dynamic programming | Q3 | cyan |
| 15 | Network flows, matching & greedy | Q3 | emerald |
| **V — When the landscape fights back** | | | |
| 16 | Stochastic optimization & SGD/Adam | Q3 | indigo |
| 17 | Non-convexity & saddle points | Q3 | rose |
| 18 | Global & black-box optimization | Q3 | rose/fuchsia |
| **VI — Synthesis** | | | |
| 19 ★ | The Roastery, solved every way | all three | fuchsia (anchor) |
| 20 | Where gradients come from (autodiff) | Q1 callback | cyan |
| 21 | Next trails | — | fuchsia |

Primary spines to foreground in nav/progress: **#2 (the compass)** and **#19 (the anchor)**. Secondary anchors: **#6 convexity, #9 Lagrange, #11 duality**.

---

## Visual identity & KaTeX macros

Distinct from neighbors (decision = emerald/amber/fuchsia; control = sky/emerald; pde = indigo/cyan/orange; ode = violet/cyan/amber). The optimization signature is **emerald + indigo + amber**, with cyan/rose/violet/fuchsia as role accents.

### Palette → role mapping
| Tailwind | Role | Used for |
|---|---|---|
| **emerald** | objective / the descent / downhill | objective contours, profit surface, "minimize = maximize the negative" |
| **indigo** | gradient & descent direction | `∇f` arrows, GD/SGD steps, momentum velocity |
| **amber** | constraints / walls / multipliers / prices | resource walls, `λ`/`μ`, shadow prices, LP polytope edges |
| **rose** | infeasible / divergence / non-convex traps | infeasible region, diverging step, saddles, bad basins |
| **cyan** | curvature / Newton / Hessian | quadratic model, Hessian, DP grid, autodiff graph |
| **violet** | the dual | dual function curve, dual lower bound, duality gap |
| **fuchsia** | spine / anchor / cross-links | anchor callbacks, CrossLink chips, the synthesis scorecard |

Hero gradient (module-level): `from-emerald-500/5 via-indigo-500/5 to-transparent`.

### KaTeX color macros (freeze in the shared macro object; hex doubled `##` inside macro bodies)
| Macro | Color | Wraps |
|---|---|---|
| `\obj{}` | emerald | objective / profit / `f` |
| `\dir{}` | indigo | gradient `∇f`, step `η∇f`, descent direction |
| `\con{}` | amber | constraints `g`, multipliers `λ`/`μ`, shadow prices |
| `\inf{}` | rose | infeasible / divergence terms |
| `\dual{}` | violet | dual variables, dual function `g(λ)` |
| `\an{}` | fuchsia | anchor quantities (the frozen Roastery numbers) |

Builder note: define these once and reuse verbatim across all cards — do NOT redefine per-card. The constrained-optimum multiplier on the roaster wall renders `\con{\mu_{\text{roaster}}} = 42.18` and the shadow prices render `\con{\$6.25}`, `\con{\$7.50}`, `\con{\$0}`.

### Shared viz primitives (build these once, parameterize per card)

| Primitive | What it draws | Cards that reuse it |
|---|---|---|
| **`ContourPlot`** | the `(x₁,x₂)` landscape: filled/line contours of the concave profit, draggable point, optional `∇f` arrow, optional overlaid constraint walls + feasible polygon + marked optima | **1, 2, 3, 4, 5, 6, 7, 9, 10, 16, 17** (the spine workhorse — every continuous card is a re-skin of this) |
| **`TrajectoryOverlay`** | iterate path (polyline + step markers) layered on a `ContourPlot`; supports two paths side-by-side for contrast | 3 (GD), 4 (GD-zigzag vs Newton-straight), 5 (heavy-ball vs GD), 16 (full-grad vs SGD jitter) |
| **`MultiLinePlot`** | generic time-series / 1-D function plot (iteration vs value, η-sweep, cooling schedule, loss curves) | 3 (η phase diagram), 5 (convergence vs κ), 8 (`\|x\|`/ReLU/hinge kinks + subgradient fan), 16 (LR schedule, noise ball radius), 18 (SA accept-prob vs T, cooling) |
| **`PolytopePlot`** | LP feasible polygon, objective sweep line, vertex highlight, simplex edge-walk animation | 11 (dual geometry inset), **12** (primary), 13 (LP relaxation region + integer lattice) |
| **`BnBTree`** | branch-and-bound tree: nodes with LP-bound labels, branch edges, pruned subtrees greyed | **13** |
| **`DPGrid`** | knapsack/Bellman memo table filling cell-by-cell, with the back-pointer path | **14**, 15 (shortest-path relaxation variant) |
| **`FlowGraph`** | bipartite matching / min-cost-flow node-edge diagram with augmenting structure | **15** |
| **`DualCurvePlot`** | primal value vs dual lower-bound curve, the duality gap shaded, `λ*` tangent | **11** |
| **`ComputeGraph`** | autodiff DAG with forward (values) and reverse (adjoints) sweeps animated | **20** |
| **`Scorecard`** | the synthesis table: same shop run through LP/KKT/dual/integer/stochastic lenses, one verdict each + "which method when?" decision guide | **19** |

Gating: all auto-playing sims wrap in `RafGate` + `useReplayOnEnter` (repo house rule). `ContourPlot` is the single most reused component — build and harden it first.

---

## Prioritized numerical-risk register (P0/P1/P2)

Synthesized from the two cluster corrections plus editorial judgment over the anchor register. **P0** = if built wrong the card teaches something *false*; **P1** = subtle, easy to get wrong, undermines the lesson; **P2** = worth a double-check.

### P0 — teaches something false if wrong

- **P0-a · Naive rounding of the LP optimum must be shown INFEASIBLE.** This is the entire reason branch-and-bound "earns its place" (P4 in the register).
  - Verified: LP optimum (16.25, 7.5); `round(LP) = (16, 8)` consumes `1.2·16 + 1.0·8 = 27.2 kg` beans > `G = 27` → **infeasible**. Integer optimum is **(15, 9)**, profit **198**, unique.
  - Guard: builder must render (16,8) crossing the bean wall (rose/infeasible), NOT sitting inside the polygon, and label its bean use as 27.2 > 27. The integer optimum is (15,9), not the rounded point.

- **P0-b · The LP optimum binds exactly TWO walls (beans + roaster); labor is slack.** This is the structural fact behind the complementary-slackness demo.
  - Verified: optimum (16.25, 7.5); beans bind, roaster binds, **labor slack by 1.25 h**.
  - Guard: at the marked LP vertex, beans and roaster lines must both pass through it; labor line must sit strictly outside. Do not draw three lines through one point.

- **P0-c · The slack resource's shadow price is exactly \$0 (complementary slackness).** The textbook punchline of cards 11/12.
  - Verified: shadow prices — beans **\$6.25**, roaster **\$7.50**, labor **\$0.00**.
  - Guard: labor price renders `\con{\$0}`, narrated as "unused resource is worth nothing." The two binding prices are positive and round.

- **P0-d · The unconstrained concave max is INFEASIBLE → boundary optimum is forced.** Justifies why Lagrange/KKT are non-trivial here (P1 in register).
  - Verified: `x* = Q⁻¹a = (296.26, 11.21)`; bean demand `1.2·296.26 + 11.21 = 366.73 kg ≫ 27`. (Register prose says "beans by 339.73 kg" in one line and "366.73" in another — these are consistent: `366.73 − 27 = 339.73 kg over budget`. Both true; use 366.73 needed / 339.73 over.)
  - Guard: card 9/19 must show `(296.26, 11.21)` far off-plot, not inside the feasible polygon.

### P1 — subtle / easy to get wrong

- **P1-a · Newton iteration count on Rosenbrock. [CORRECTED — correction upheld.]** Original spec said "~8 iterations." Adversarial review: **pure Newton from (−1.2, 1) converges in ~6 (5–6 by tolerance); the ~8 figure is the safeguarded / line-search / Hessian-modified Newton** that the spec text itself invokes ("Newton with the modifications above"). The correction is sound — pure and damped Newton are genuinely different counts.
  - Build text: "**~6 iterations (pure Newton); a safeguarded / line-search Newton takes ~8**." Either way the contrast with GD's thousands holds.
  - Guard: if the card shows *modified* Newton (line search), label it ~8 and say so; if it shows pure Newton, label it ~6. Do not cite "8" for a path drawn as pure Newton.

- **P1-b · DP memo-table cell count. [CORRECTED — correction upheld.]** Original spec said "6 rows × 11 columns = 55 cells." That is arithmetically wrong: **6 × 11 = 66**. The "55" was a different count (`5 × 11 = n·C` with n=5 orders, used elsewhere in the Deeper block) conflated with the table size. The full table including the `i=0` "none" row is **6 rows → 66 cells**.
  - Build text: "**6 rows × 11 columns = 66 cells**" for the table; reserve `5·11 = 55` only if explicitly counting non-trivial fills (n=5 rows) in a Deeper aside, and label it as such to avoid re-introducing the error.
  - Guard: the rendered `DPGrid` must have 6 row-labels (i = 0..5) and 11 column-labels (capacity 0..10); `2^5 = 32`-subset brute force confirms optimum **115** (this part was correct).

- **P1-c · Concave-constrained optimum is a SINGLE-wall tangency on the roaster, distinct from the LP vertex.** Easy to accidentally snap it to the LP corner.
  - Verified: concave optimum **(16.364, 7.273)**, tangent to **roaster alone**; beans slack 0.0909, labor slack; `μ_roaster = 42.18`; KKT stationarity `∇f = μ∇g = (8.4364, 4.2182)` exact. Profit **\$183.45**.
  - Guard: card 9/19 marks (16.364, 7.273) on the roaster wall only — not the (16.25, 7.5) LP vertex. The two optima are deliberately close but different; show both distinctly.

- **P1-d · Condition number κ(Q) = 12.13 drives the GD-zigzag vs Newton-straight contrast.** If Q is mistyped the whole "dramatic anisotropy" payoff collapses.
  - Verified: `Q = [[0.03, 0.01],[0.01, 0.36]]`, SPD, `det = 0.0107`, `λ_max = 0.360303`, `λ_min = 0.029697`, **κ = 12.13**. (Note: this is the *hardened* Q; it differs from the ALIGNMENT.md *candidate* `[[0.04,0.01],[0.01,0.20]]`. Use the register's `[[0.03,0.01],[0.01,0.36]]` — it is the frozen, verified value.)
  - Guard: freeze `Q` at module scope from the register, not from ALIGNMENT.md's candidate. Verify κ ≈ 12.1 in a unit check before drawing trajectories.

### P2 — nice to double-check

- **P2-a · LP optimal margin = \$198.75/day** (`cᵀx` at (16.25, 7.5)). Note the near-collision with the *integer* profit **198** — these are different quantities (LP \$198.75 vs ILP profit 198). Guard: do not let the UI imply the integer solution recovers the LP value; the integer optimum is strictly below the LP bound.
- **P2-b · KKT stationarity vector (8.4364, 4.2182)** = `∇f` at the concave optimum = `μ·∇g_roaster` with `∇g_roaster = (0.20, 0.10)` and `μ = 42.18`: `42.18·0.20 = 8.436`, `42.18·0.10 = 4.218` ✓. Guard: if the card prints the gradient, it must equal `μ·(0.20,0.10)`.
- **P2-c · Profit-function sign convention.** Objective is a *maximize* (`profit`), but the descent story is *minimize*. Guard: every "descend/downhill" visual must minimize `−profit`; state "minimize = maximize the negative" once (card 1) and keep the sign consistent across all `ContourPlot` instances.

No correction in the supplied set was found to be itself wrong; both P1-a and P1-b corrections are upheld.

---

## Build-stage order

Matches the repo's mandated stage-by-stage rule (scaffold + primitives → frozen register → cards in small batches → QA). Each stage is independently runnable; do not start a stage until the prior one renders clean.

- **Stage 0 — Scaffold & visual identity.** Single-file React explainer skeleton, Tailwind, dark mode, lucide-react, framer-motion, `RafGate` + `useReplayOnEnter`, the hero gradient, and the six KaTeX color macros (`\obj \dir \con \inf \dual \an`). No content cards yet. Read `PREFERENCES.md` first.
- **Stage 1 — Shared viz primitives.** Build and unit-smoke `ContourPlot`, `TrajectoryOverlay`, `MultiLinePlot` first (they unblock the most cards), then `PolytopePlot`, `BnBTree`, `DPGrid`, `FlowGraph`, `DualCurvePlot`, `ComputeGraph`, `Scorecard`. Harden `ContourPlot` hardest — 11 cards depend on it.
- **Stage 2 — Frozen anchor register.** Transcribe the Anchor Register into a module-scope constants block (`Q`, `a`, `c`, walls `G/T/L`, all frozen solutions, shadow prices). Add a dev-only assertion block that recomputes κ ≈ 12.13, `det = 0.0107`, the (16,8) infeasibility (27.2 > 27), and KKT `∇f = μ∇g`. These guard P0/P1 at build time.
- **Stage 3 — cards 1–2** (Frame: `card-1-what-is-optimization`, `card-2-gradient-compass`). Establishes `ContourPlot` in anger + the sign convention (P2-c).
- **Stage 4 — cards 3–4** (`card-3-gd-stepsize`, `card-4-curvature-newton`). Wires `TrajectoryOverlay` + `MultiLinePlot`; enforce P1-a Newton-count labeling and P1-d κ.
- **Stage 5 — card 5** (`card-5-momentum`).
- **Stage 6 — cards 6–7** (`card-6-convexity`, `card-7-optimality-conditions`).
- **Stage 7 — card 8** (`card-8-nonsmooth-subgradients`).
- **Stage 8 — cards 9–10** (`card-9-lagrange`, `card-10-kkt`). The anchor's heart; enforce P0-b/P0-d/P1-c (two-wall LP vertex vs single-wall concave tangency, infeasible unconstrained max).
- **Stage 9 — card 11** (`card-11-duality-shadow-prices`). `DualCurvePlot`; enforce P0-c (labor \$0).
- **Stage 10 — card 12** (`card-12-lp-simplex`). `PolytopePlot`; enforce P0-b shadow-price reuse.
- **Stage 11 — card 13** (`card-13-ilp-branch-bound`). `BnBTree`; enforce **P0-a** (rounding infeasible, integer optimum (15,9)).
- **Stage 12 — cards 14–15** (`card-14-dynamic-programming`, `card-15-flows-matching-greedy`). `DPGrid` + `FlowGraph`; enforce P1-b (66 cells, optimum 115).
- **Stage 13 — card 16** (`card-16-stochastic-sgd-adam`).
- **Stage 14 — cards 17–18** (`card-17-nonconvexity-saddles`, `card-18-global-blackbox`).
- **Stage 15 — card 19** (`card-19-anchor-solved-every-way`). `Scorecard`; consumes every frozen number — must reconcile LP \$198.75 vs ILP 198 vs concave \$183.45 (P2-a).
- **Stage 16 — cards 20–21** (`card-20-autodiff`, `card-21-next-trails`).
- **Stage 17 — QA pass.** Full-doc read-through; verify all P0/P1 guards visually; confirm every CrossLink target (below) exists; replay every gated sim from a cold viewport.

---

## Cross-link graph

Every `CrossLink` the cards emit, as `(from-card → target)`. Internal targets are other cards in this explainer (must exist before QA passes); external targets are sibling explainers in the repo. The builder must ensure internal targets resolve and external slugs match the repo's neighbor explainers.

**Internal (within this explainer):**
- card 3 → card 16 (GD → SGD as the noisy cousin)
- card 4 → card 5 (Newton/curvature → momentum on the same ill-conditioned bowl)
- card 6 → card 9, card 12 (convexity → why constrained convex problems and LP are tractable)
- card 7 → card 9 (stationarity → constrained stationarity / Lagrange)
- card 9 → card 10 → card 11 (Lagrange → KKT → duality, the optimality chain)
- card 11 → card 12 (LP duality = the same shadow prices)
- card 12 → card 13 (LP relaxation → ILP / branch-and-bound bound)
- card 13 → card 14 (B&B subproblems → DP / optimal substructure)
- card 17 → card 16 (saddles → what SGD's noise buys you)
- card 19 → cards 9, 11, 12, 13, 16 (the scorecard back-links each lens to its card)
- card 20 → card 3 (autodiff → where the gradient in `x ← x − η∇f` actually comes from)

**External (sibling explainers — verify slugs exist in repo):**
- card 3 → `odes` (GD = forward-Euler on gradient-flow `ẋ = −∇f`)
- card 4 → `linear-algebra` (Hessian, condition number)
- card 5 → `odes` (damped-oscillator analogy for momentum)
- card 14 → `control-theory` (Bellman = HJB), `reinforcement-learning`
- card 16 → `machine-learning` (training is optimization)
- card 17 → `machine-learning` (loss landscape of a net)
- card 18 → `forecasters-craft` (hyperparameter optimization)
- card 20 → `machine-learning` (reverse-mode = backprop)
- card 21 → `machine-learning`, `control-theory` (LQR/MPC, Riccati ODE), `decision-theory` (max expected utility), `retail-quant` (Markowitz QP, Kelly), `reinforcement-learning` (policy optimization), `odes` (gradient flow)

Builder action at QA: card 21's "next trails" set is the superset of external targets — confirm each named sibling explainer exists; for any that does not, render the chip as a non-link "planned" label rather than a dead CrossLink.

# ====================== ANCHOR REGISTER ======================

## Anchor register — The Roastery (frozen constants)

All numbers below are produced by hand-rolled Node (vertex/KKT/box enumeration, no solver libs) and independently verified (adversarial recompute) to satisfy all five pedagogical properties. Freeze these at module scope.

### Decision variables
| Symbol | Meaning | Units |
|---|---|---|
| `x₁` | Espresso blend produced | kg/day |
| `x₂` | Filter blend produced | kg/day |
| — | constraint `x₁, x₂ ≥ 0` | — |

### Concave (true) objective — diminishing returns
`profit(x₁,x₂) = a₁x₁ − ½q₁₁x₁² + a₂x₂ − ½q₂₂x₂² − q₁₂x₁x₂`   ($/day)

| Constant | Value | Units | Interpretation |
|---|---|---|---|
| `a₁` | 9 | $/kg | base margin on Espresso (price at zero volume) |
| `a₂` | 7 | $/kg | base margin on Filter |
| `q₁₁` | 0.03 | $/kg² | self-softening of Espresso margin (own price-flooding) |
| `q₂₂` | 0.36 | $/kg² | self-softening of Filter margin (steeper — Filter floods fast) |
| `q₁₂` | 0.01 | $/kg² | cross-cannibalization between blends (tilts the contours) |

`Q = [[0.03, 0.01],[0.01, 0.36]]` is SPD (`Q₁₁ > 0`, `det = 0.0107 > 0`). Eigenvalues `λ_max = 0.360303`, `λ_min = 0.029697` → **condition number κ(Q) = 12.13** (anisotropic enough for a dramatic GD-zigzag vs Newton contrast; tilted elliptical contours since `q₁₂ > 0`).

### Linear (LP) shadow objective — fixed price/kg
Maximize `c₁x₁ + c₂x₂` with `c = (9, 7)` $/kg.

### Resource walls
| Resource | Constraint | Limit | Units |
|---|---|---|---|
| Green beans | `1.2 x₁ + 1.0 x₂ ≤ G` | `G = 27` | kg green beans/day |
| Roaster-hours | `0.20 x₁ + 0.10 x₂ ≤ T` | `T = 4` | roaster-hours/day |
| Labor / packing | `0.10 x₁ + 0.15 x₂ ≤ L` | `L = 4` | labor-hours/day |

### Frozen solutions
| Quantity | Value | Notes |
|---|---|---|
| Unconstrained concave max `x* = Q⁻¹a` | (296.26, 11.21) kg | **infeasible** — beans needed 366.73 ≫ 27 → boundary optimum forced (P1) |
| **LP optimum** | (16.25, 7.5) kg | vertex where **beans + roaster** bind; **labor slack by 1.25 h** (P2) |
| LP optimal margin `cᵀx` | $198.75/day | — |
| **Concave-constrained optimum** | (16.364, 7.273) kg | clean tangency on the **roaster wall alone** (beans slack 0.0909, labor slack); multiplier μ_roaster = 42.18 (P5) |
| Concave optimal profit | $183.45/day | — |
| **Integer optimum** | (15, 9) bags | profit 198 (unique); round(LP)=(16,8) is **infeasible** (uses 4.0 roaster-h but 27.2 kg beans > 27) → naive rounding fails, B&B earns its place (P4) |

### Shadow prices (LP dual) — what one more unit of each resource is worth
| Resource | Shadow price | Reads as |
|---|---|---|
| Green beans | **$6.25** | "$6.25 of extra profit per additional kg of green beans" — $/kg-green-beans |
| Roaster-hours | **$7.50** | "$7.50 of extra profit per additional roaster-hour" — $/roaster-hour |
| Labor / packing | **$0.00** | labor is not fully used (1.25 h idle) → complementary slackness: an unused resource is worth nothing |

Both binding shadow prices are strictly positive and round (P3). The zero labor price is the textbook complementary-slackness demo.

### Property checklist (all independently verified in Node)
1. PASS — unconstrained concave max (296.26, 11.21) infeasible (violates beans by 339.73 kg; Q is SPD so this is the true global concave max).
2. PASS — LP optimum (16.25, 7.5) at the intersection of exactly two binding walls (beans, roaster); labor strictly slack (1.25 h).
3. PASS — binding shadow prices positive and round ($6.25, $7.50); slack-resource (labor) price = 0.
4. PASS — integer optimum (15, 9) is unique at profit 198, ≠ round(LP) (16, 8), and the rounded point is infeasible (27.2 kg beans > 27).
5. PASS — concave-constrained optimum (16.364, 7.273) is a clean single-wall tangency on the roaster constraint; KKT stationarity `∇f = μ∇g` = (8.4364, 4.2182) verified exactly, μ = 42.18 ≥ 0.

<details><summary>anchor solver params (JSON) + verify node output</summary>

```json
{
  "chosen": {
    "G": 27,
    "T": 4,
    "L": 4
  },
  "objectiveParams": {
    "a1": 9,
    "a2": 7,
    "Q11": 0.03,
    "Q12": 0.01,
    "Q22": 0.36,
    "c1": 9,
    "c2": 7,
    "beansCoef": [
      1.2,
      1
    ],
    "roasterCoef": [
      0.2,
      0.1
    ],
    "laborCoef": [
      0.1,
      0.15
    ]
  },
  "lp": {
    "x1": 16.25,
    "x2": 7.5,
    "profit": 198.75,
    "shadowBeans": 6.25,
    "shadowRoaster": 7.5,
    "shadowLabor": 0,
    "bindingNames": [
      "beans",
      "roaster"
    ],
    "slackNames": [
      "labor"
    ]
  },
  "qp": {
    "uncX1": 296.2616822429906,
    "uncX2": 11.214953271028035,
    "uncFeasible": false,
    "conX1": 16.363636363636363,
    "conX2": 7.272727272727271,
    "conProfit": 183.45454545454544,
    "activeNames": [
      "roaster"
    ],
    "multipliers": [
      42.18181818181819
    ]
  },
  "integer": {
    "x1": 15,
    "x2": 9,
    "profit": 198,
    "roundedX1": 16,
    "roundedX2": 8,
    "roundedFeasible": false,
    "differsFromRound": true
  },
  "conditionNumber": 12.132530233063973,
  "allPropertiesHold": true,
  "registerMarkdown": "## Anchor register — The Roastery (frozen constants)\n\nAll numbers below are produced by hand-rolled Node (vertex/KKT/box enumeration, no solver libs) and verified to satisfy all five pedagogical properties. Freeze these at module scope.\n\n### Decision variables\n| Symbol | Meaning | Units |\n|---|---|---|\n| `x₁` | Espresso blend produced | kg/day |\n| `x₂` | Filter blend produced | kg/day |\n| — | constraint `x₁, x₂ ≥ 0` | — |\n\n### Concave (true) objective — diminishing returns\n`profit(x₁,x₂) = a₁x₁ − ½q₁₁x₁² + a₂x₂ − ½q₂₂x₂² − q₁₂x₁x₂`   ($/day)\n\n| Constant | Value | Units | Interpretation |\n|---|---|---|---|\n| `a₁` | 9 | $/kg | base margin on Espresso (price at zero volume) |\n| `a₂` | 7 | $/kg | base margin on Filter |\n| `q₁₁` | 0.03 | $/kg² | self-softening of Espresso margin (own price-flooding) |\n| `q₂₂` | 0.36 | $/kg² | self-softening of Filter margin (steeper — Filter floods fast) |\n| `q₁₂` | 0.01 | $/kg² | cross-cannibalization between blends (tilts the contours) |\n\n`Q = [[0.03, 0.01],[0.01, 0.36]]` is SPD. Eigenvalues `λ_max = 0.360303`, `λ_min = 0.029697` → **condition number κ(Q) = 12.13** (anisotropic enough for a dramatic GD-zigzag vs Newton contrast; tilted elliptical contours since `q₁₂ > 0`).\n\n### Linear (LP) shadow objective — fixed price/kg\nMaximize `c₁x₁ + c₂x₂` with `c = (9, 7)` $/kg.\n\n### Resource walls\n| Resource | Constraint | Limit | Units |\n|---|---|---|---|\n| Green beans | `1.2 x₁ + 1.0 x₂ ≤ G` | `G = 27` | kg green beans/day |\n| Roaster-hours | `0.20 x₁ + 0.10 x₂ ≤ T` | `T = 4` | roaster-hours/day |\n| Labor / packing | `0.10 x₁ + 0.15 x₂ ≤ L` | `L = 4` | labor-hours/day |\n\n### Frozen solutions\n| Quantity | Value | Notes |\n|---|---|---|\n| Unconstrained concave max `x* = Q⁻¹a` | (296.26, 11.21) kg | **infeasible** — beans needed 366.7 ≫ 27 → boundary optimum forced (P1) |\n| **LP optimum** | (16.25, 7.5) kg | vertex where **beans + roaster** bind; **labor slack by 1.25 h** (P2) |\n| LP optimal margin `cᵀx` | $198.75/day | — |\n| **Concave-constrained optimum** | (16.364, 7.273) kg | clean tangency on the **roaster wall alone** (beans slack 0.09); multiplier μ_roaster = 42.18 (P5) |\n| Concave optimal profit | $183.45/day | — |\n| **Integer optimum** | (15, 9) bags | profit 198; round(LP)=(16,8) is **infeasible** (uses 4.0 roaster-h but 27.2 kg beans > 27) → naive rounding fails, B&B earns its place (P4) |\n\n### Shadow prices (LP dual) — what one more unit of each resource is worth\n| Resource | Shadow price | Reads as |\n|---|---|---|\n| Green beans | **$6.25** | \"$6.25 of extra profit per additional kg of green beans\" — $/kg-green-beans |\n| Roaster-hours | **$7.50** | \"$7.50 of extra profit per additional roaster-hour\" — $/roaster-hour |\n| Labor / packing | **$0.00** | labor is not fully used (1.25 h idle) → complementary slackness: an unused resource is worth nothing |\n\nBoth binding shadow prices are strictly positive and round (P3). The zero labor price is the textbook complementary-slackness demo.\n\n### Property checklist (all verified in Node)\n1. PASS — unconstrained concave max infeasible (violates beans by 339.7 kg).\n2. PASS — LP optimum at the intersection of exactly two binding walls (beans, roaster); labor strictly slack.\n3. PASS — binding shadow prices positive and round ($6.25, $7.50); slack-resource price = 0.\n4. PASS — integer optimum (15,9) ≠ round(LP) (16,8), and the rounded point is infeasible.\n5. PASS — concave-constrained optimum is a clean single-wall tangency on the roaster constraint (KKT stationarity `∇f = μ∇g` verified exactly).",
  "nodeScript": "// ================= ROASTERY ANCHOR — FROZEN PARAMETERS =================\n// Hand-rolled solver, no external libraries. 2-var LP/QP by vertex/KKT enumeration;\n// integer optimum by feasible-box enumeration.\n\nconst P = {\n  // Concave objective: profit = a1 x1 - 0.5 Q11 x1^2 + a2 x2 - 0.5 Q22 x2^2 - Q12 x1 x2\n  a1: 9, a2: 7,\n  Q11: 0.03, Q12: 0.01, Q22: 0.36,   // SPD, tilted contours, kappa ~ 12\n  // Linear (LP) shadow margins: maximize c1 x1 + c2 x2\n  c1: 9, c2: 7,\n  // Resource walls\n  b1: 1.2, b2: 1.0,    // green beans   : b1 x1 + b2 x2 <= G\n  r1: 0.20, r2: 0.10,  // roaster-hours : r1 x1 + r2 x2 <= T\n  l1: 0.10, l2: 0.15,  // labor/packing : l1 x1 + l2 x2 <= L\n  G: 27, T: 4, L: 4,\n};\n\n// ---------- linear algebra helpers ----------\nconst solve2 = (a,b,c,d,e,f) => { const det=a*d-b*c; if(Math.abs(det)<1e-12) return null; return [(e*d-b*f)/det,(a*f-e*c)/det]; };\nconst inv2   = (a,b,c,d) => { const det=a*d-b*c; return [[d/det,-b/det],[-c/det,a/det]]; };\nconst eigSym2 = (A,B,C) => { const tr=A+C,det=A*C-B*B; const disc=Math.sqrt(Math.max(0,tr*tr/4-det)); return [tr/2+disc,tr/2-disc]; };\nfunction solve3(M,b){ const A=M.map((r,i)=>[...r,b[i]]);\n  for(let col=0;col<3;col++){ let piv=col; for(let r=col+1;r<3;r++) if(Math.abs(A[r][col])>Math.abs(A[piv][col])) piv=r;\n    if(Math.abs(A[piv][col])<1e-12) return null; [A[col],A[piv]]=[A[piv],A[col]];\n    for(let r=0;r<3;r++){ if(r===col) continue; const f=A[r][col]/A[col][col]; for(let k=col;k<4;k++) A[r][k]-=f*A[col][k]; } }\n  return [A[0][3]/A[0][0],A[1][3]/A[1][1],A[2][3]/A[2][2]]; }\n\nconst profit = (x1,x2)=> P.a1*x1 - 0.5*P.Q11*x1*x1 + P.a2*x2 - 0.5*P.Q22*x2*x2 - P.Q12*x1*x2;\nconst cons = () => ([\n  {name:'beans',   a:P.b1, b:P.b2, rhs:P.G},\n  {name:'roaster', a:P.r1, b:P.r2, rhs:P.T},\n  {name:'labor',   a:P.l1, b:P.l2, rhs:P.L},\n  {name:'x1>=0',   a:-1,   b:0,    rhs:0},\n  {name:'x2>=0',   a:0,    b:-1,   rhs:0},\n]);\nconst feasible = (x1,x2,tol=1e-7) => cons().every(c=> c.a*x1+c.b*x2 <= c.rhs+tol);\n\n// ---------- 1. unconstrained concave max  x* = Q^{-1} a ----------\nfunction uncMax(){ const Qi=inv2(P.Q11,P.Q12,P.Q12,P.Q22);\n  const x1=Qi[0][0]*P.a1+Qi[0][1]*P.a2, x2=Qi[1][0]*P.a1+Qi[1][1]*P.a2;\n  return {x1,x2,feasible:feasible(x1,x2)}; }\n\n// ---------- 2&3. LP: max c^T x  (vertex enumeration + dual shadow prices) ----------\nfunction solveLP(){ const C=cons(); let best=null;\n  for(let i=0;i<C.length;i++) for(let j=i+1;j<C.length;j++){\n    const A=C[i],B=C[j]; const s=solve2(A.a,A.b,B.a,B.b,A.rhs,B.rhs); if(!s) continue;\n    const [x1,x2]=s; if(!feasible(x1,x2)) continue; const obj=P.c1*x1+P.c2*x2;\n    if(!best||obj>best.obj+1e-9) best={x1,x2,obj}; }\n  const res=C.slice(0,3); const binding=[],slack=[];\n  for(const c of res){ const u=c.a*best.x1+c.b*best.x2; (Math.abs(u-c.rhs)<1e-6?binding:slack).push(c.name); }\n  const shadow={beans:0,roaster:0,labor:0};\n  const bres=res.filter(c=>Math.abs(c.a*best.x1+c.b*best.x2-c.rhs)<1e-6);\n  if(bres.length===2){ const g1=bres[0],g2=bres[1];\n    const y=solve2(g1.a,g2.a,g1.b,g2.b,P.c1,P.c2); if(y){shadow[g1.name]=y[0];shadow[g2.name]=y[1];} }\n  return {...best,binding,slack,shadow}; }\n\n// ---------- 5. concave constrained max via KKT (active-set enumeration) ----------\nfunction solveQP(){ const C=cons(); const Q=[[P.Q11,P.Q12],[P.Q12,P.Q22]]; const a=[P.a1,P.a2];\n  const idx=[0,1,2,3,4]; const subs=[[]]; for(const i of idx) subs.push([i]);\n  for(let i=0;i<idx.length;i++) for(let j=i+1;j<idx.length;j++) subs.push([idx[i],idx[j]]);\n  let best=null;\n  for(const S of subs){ let x1,x2,mus;\n    if(S.length===0){ const Qi=inv2(Q[0][0],Q[0][1],Q[1][0],Q[1][1]);\n      x1=Qi[0][0]*a[0]+Qi[0][1]*a[1]; x2=Qi[1][0]*a[0]+Qi[1][1]*a[1]; mus=[]; }\n    else if(S.length===1){ const c=C[S[0]];\n      const M=[[Q[0][0],Q[0][1],c.a],[Q[1][0],Q[1][1],c.b],[c.a,c.b,0]];\n      const sol=solve3(M,[a[0],a[1],c.rhs]); if(!sol) continue; x1=sol[0];x2=sol[1];mus=[sol[2]]; }\n    else { const c1=C[S[0]],c2=C[S[1]]; const xx=solve2(c1.a,c1.b,c2.a,c2.b,c1.rhs,c2.rhs); if(!xx) continue;\n      x1=xx[0];x2=xx[1]; const g=[a[0]-(Q[0][0]*x1+Q[0][1]*x2),a[1]-(Q[1][0]*x1+Q[1][1]*x2)];\n      const mm=solve2(c1.a,c2.a,c1.b,c2.b,g[0],g[1]); if(!mm) continue; mus=[mm[0],mm[1]]; }\n    if(!feasible(x1,x2)) continue; if(mus.some(m=>m<-1e-7)) continue;\n    const f=profit(x1,x2); if(!best||f>best.f+1e-9) best={x1,x2,f,active:S.map(i=>C[i].name),mus}; }\n  return best; }\n\n// ---------- 4. integer optimum (feasible-box enumeration of LP objective) ----------\nfunction solveInt(lp){\n  const X1=Math.min(Math.floor(P.G/P.b1),Math.floor(P.T/P.r1),Math.floor(P.L/P.l1))+1;\n  const X2=Math.min(Math.floor(P.G/P.b2),Math.floor(P.T/P.r2),Math.floor(P.L/P.l2))+1;\n  let best=null;\n  for(let i=0;i<=X1;i++) for(let j=0;j<=X2;j++){ if(!feasible(i,j)) continue;\n    const obj=P.c1*i+P.c2*j; if(!best||obj>best.obj) best={x1:i,x2:j,obj}; }\n  const rx1=Math.round(lp.x1), rx2=Math.round(lp.x2);\n  return {...best, roundedX1:rx1, roundedX2:rx2, roundedFeasible:feasible(rx1,rx2),\n          differsFromRound:!(best.x1===rx1&&best.x2===rx2)}; }\n\n// ================= RUN & VERIFY =================\nconst unc=uncMax(), lp=solveLP(), qp=solveQP(), ip=solveInt(lp);\nconst [e1,e2]=eigSym2(P.Q11,P.Q12,P.Q22); const kappa=Math.max(e1,e2)/Math.min(e1,e2);\n\nconst P1 = !unc.feasible;\nconst P2 = lp.binding.length===2 && lp.slack.length===1;\nconst bindPrices = lp.binding.map(n=>lp.shadow[n]);\nconst P3 = bindPrices.every(v=>v>1e-6) && lp.slack.every(n=>Math.abs(lp.shadow[n])<1e-9);\nconst P4 = ip.differsFromRound;\nconst P5 = qp && qp.active.length>=1 && qp.mus.every(m=>m>=-1e-7) &&\n           qp.active.some(n=>['beans','roaster','labor'].includes(n));\nconst ALL = P1&&P2&&P3&&P4&&P5;\n\nconsole.log(\"===== FROZEN PARAMETERS =====\");\nconsole.log(\"a =\", [P.a1,P.a2], \" Q =\", [[P.Q11,P.Q12],[P.Q12,P.Q22]], \" c =\", [P.c1,P.c2]);\nconsole.log(\"beans:\", [P.b1,P.b2], \"<= G=\"+P.G, \" roaster:\", [P.r1,P.r2], \"<= T=\"+P.T, \" labor:\", [P.l1,P.l2], \"<= L=\"+P.L);\nconsole.log(\"Q eigenvalues:\", e1.toFixed(6), e2.toFixed(6), \" kappa(Q) =\", kappa.toFixed(4));\nconsole.log(\"\\n----- Property 1: unconstrained max infeasible -----\");\nconsole.log(\"x* = Q^-1 a =\", [unc.x1.toFixed(4),unc.x2.toFixed(4)], \" feasible?\", unc.feasible, \"=> P1\", P1?\"PASS\":\"FAIL\");\nconst beansUseUnc=P.b1*unc.x1+P.b2*unc.x2;\nconsole.log(\"   beans use at x* =\", beansUseUnc.toFixed(2), \"vs G=\"+P.G, \"(violated by \"+(beansUseUnc-P.G).toFixed(2)+\")\");\nconsole.log(\"\\n----- Property 2: LP optimum = vertex of EXACTLY 2 binding, 3rd slack -----\");\nconsole.log(\"LP x* =\", [lp.x1.toFixed(6),lp.x2.toFixed(6)], \" profit(cTx) =\", lp.obj.toFixed(4));\nconsole.log(\"binding:\", lp.binding, \" slack:\", lp.slack, \"=> P2\", P2?\"PASS\":\"FAIL\");\nfor(const c of cons().slice(0,3)){ const u=c.a*lp.x1+c.b*lp.x2; console.log(\"   \"+c.name+\" use =\", u.toFixed(4), \"/ rhs =\", c.rhs, \"slack =\", (c.rhs-u).toFixed(4)); }\nconsole.log(\"\\n----- Property 3: binding shadow prices positive & round, slack=0 -----\");\nconsole.log(\"shadow: beans =\", lp.shadow.beans, \" roaster =\", lp.shadow.roaster, \" labor =\", lp.shadow.labor, \"=> P3\", P3?\"PASS\":\"FAIL\");\nconsole.log(\"\\n----- Property 4: integer optimum != round(LP) -----\");\nconsole.log(\"INT x* =\", [ip.x1,ip.x2], \" profit =\", ip.obj, \"  round(LP) =\", [ip.roundedX1,ip.roundedX2], \" feasible?\", ip.roundedFeasible);\nconsole.log(\"differsFromRound?\", ip.differsFromRound, \"=> P4\", P4?\"PASS\":\"FAIL\");\nconsole.log(\"   round(LP) cTx =\", (P.c1*ip.roundedX1+P.c2*ip.roundedX2), \"(infeasible)\" );\nconsole.log(\"\\n----- Property 5: concave constrained optimum = clean tangency -----\");\nconsole.log(\"QP x* =\", [qp.x1.toFixed(6),qp.x2.toFixed(6)], \" profit =\", qp.f.toFixed(4));\nconsole.log(\"active wall(s):\", qp.active, \" multipliers:\", qp.mus.map(m=>m.toFixed(6)), \"=> P5\", P5?\"PASS\":\"FAIL\");\n{ const gx1=P.a1-(P.Q11*qp.x1+P.Q12*qp.x2), gx2=P.a2-(P.Q12*qp.x1+P.Q22*qp.x2);\n  const cc=cons(); let rhs1=0,rhs2=0; qp.active.forEach((n,k)=>{const c=cc.find(x=>x.name===n); rhs1+=qp.mus[k]*c.a; rhs2+=qp.mus[k]*c.b;});\n  console.log(\"   KKT stationarity grad f =\", [gx1.toFixed(4),gx2.toFixed(4)], \" = sum mu*grad_g =\", [rhs1.toFixed(4),rhs2.toFixed(4)]); }\nconsole.log(\"\\n===== allPropertiesHold:\", ALL, \"=====\");",
  "nodeOutput": "===== FROZEN PARAMETERS =====\na = [ 9, 7 ]  Q = [ [ 0.03, 0.01 ], [ 0.01, 0.36 ] ]  c = [ 9, 7 ]\nbeans: [ 1.2, 1 ] <= G=27  roaster: [ 0.2, 0.1 ] <= T=4  labor: [ 0.1, 0.15 ] <= L=4\nQ eigenvalues: 0.360303 0.029697  kappa(Q) = 12.1325\n\n----- Property 1: unconstrained max infeasible -----\nx* = Q^-1 a = [ '296.2617', '11.2150' ]  feasible? false => P1 PASS\n   beans use at x* = 366.73 vs G=27 (violated by 339.73)\n\n----- Property 2: LP optimum = vertex of EXACTLY 2 binding, 3rd slack -----\nLP x* = [ '16.250000', '7.500000' ]  profit(cTx) = 198.7500\nbinding: [ 'beans', 'roaster' ]  slack: [ 'labor' ] => P2 PASS\n   beans use = 27.0000 / rhs = 27 slack = 0.0000\n   roaster use = 4.0000 / rhs = 4 slack = 0.0000\n   labor use = 2.7500 / rhs = 4 slack = 1.2500\n\n----- Property 3: binding shadow prices positive & round, slack=0 -----\nshadow: beans = 6.25  roaster = 7.499999999999994  labor = 0 => P3 PASS\n\n----- Property 4: integer optimum != round(LP) -----\nINT x* = [ 15, 9 ]  profit = 198   round(LP) = [ 16, 8 ]  feasible? false\ndiffersFromRound? true => P4 PASS\n   round(LP) cTx = 200 (infeasible)\n\n----- Property 5: concave constrained optimum = clean tangency -----\nQP x* = [ '16.363636', '7.272727' ]  profit = 183.4545\nactive wall(s): [ 'roaster' ]  multipliers: [ '42.181818' ] => P5 PASS\n   KKT stationarity grad f = [ '8.4364', '4.2182' ]  = sum mu*grad_g = [ '8.4364', '4.2182' ]\n\n===== allPropertiesHold: true ====="
}
```

Verify node output:
```
===== ADVERSARIAL RECOMPUTE =====
Q eigenvalues: 0.360303 0.029697  kappa = 12.132530

P1 unconstrained max  x*=Q^-1 a = [ '296.261682', '11.214953' ] feasible? false
   beans use at x* = 366.7290 vs G= 27 (violated by 339.7290)
   => P1 PASS

P2/LP optimum x* = [ '16.250000', '7.500000' ]  cTx = 198.750000
   binding: [ 'beans', 'roaster' ]  slack: [ 'labor' ]
   beans use= 27.000000 rhs= 27 slack= 0.000000
   roaster use= 4.000000 rhs= 4 slack= 0.000000
   labor use= 2.750000 rhs= 4 slack= 1.250000
   => P2 PASS
   all feasible vertices found: 5

P3 shadow prices: beans= 6.25  roaster= 7.499999999999994  labor= 0
   => P3 PASS

P5/QP constrained optimum x* = [ '16.363636', '7.272727' ]  profit = 183.454545
   active: [ 'roaster' ]  multipliers: [ '42.181818' ]
   KKT: grad f = [ '8.436364', '4.218182' ]  sum mu*grad_g = [ '8.436364', '4.218182' ]
   beans slack at QP = 0.090909
   => P5 PASS

P4 integer optimum x* = [ 15, 9 ]  cTx = 198
   round(LP) = [ 16, 8 ]  feasible? false  round cTx = 200
   beans at round(LP) = 27.2000  roaster = 4.0000
   differsFromRound? true => P4 PASS

===== allPropertiesHold: true =====

--- extra adversarial cross-checks ---
integer points achieving 198: [[15,9]]   (unique)
integer max obj: 198 at [ 15, 9 ]
LP exact x1,x2: 16.25 7.5  cTx: 198.75
dual yB,yR: 6.25 7.5
QP roaster use: 4 (=T)  beans use: 26.909... (<27, slack 0.0909)
QP profit: 183.45454545454544
Q SPD? Q11>0: true  det>0: true
```
</details>


# ====================== PER-CARD SPECIFICATIONS ======================


---

## Cluster: frame-gradient-gd — cards 1 (What is optimization?), 2 (The gradient is a compass), 3 (Gradient descent & step size)
_verification: ALL CONFIRMED_

# Cluster 1 — Frame the field & the load-bearing visual (Cards 1–3)

**Shared design decisions that bind these three cards (read first):**

- **The demo bowl.** Cards 2 and 3 share one quadratic so the geometry threads from "which way is down" into "how far do I step." Freeze at module scope:
  ```
  const Q = [[0.03, 0.01],[0.01, 0.36]];            // SAME Q as the anchor → κ, L, thresholds all carry over
  const X_STAR_DEMO = [16.364, 7.273];               // parked at the concave-constrained optimum (P5)
  const fDemo  = (x) => { const d=[x[0]-X_STAR_DEMO[0], x[1]-X_STAR_DEMO[1]];
                          return 0.5*(Q[0][0]*d[0]*d[0] + 2*Q[0][1]*d[0]*d[1] + Q[1][1]*d[1]*d[1]); };
  const gradDemo = (x) => [Q[0][0]*(x[0]-X_STAR_DEMO[0]) + Q[0][1]*(x[1]-X_STAR_DEMO[1]),
                           Q[1][0]*(x[0]-X_STAR_DEMO[0]) + Q[1][1]*(x[1]-X_STAR_DEMO[1])];
  ```
  This is a clean centered convex bowl `f(x)=½(x−x*)ᵀQ(x−x*)`, minimum 0 at `x* = (16.364, 7.273)`. Using the anchor's own `Q` means κ(Q)=12.13, L=λ_max(Q)=0.3603 and the step-size thresholds below are literally the roastery's curvature — not a toy. Parking the minimum at the frozen concave-constrained optimum lets card 3 cross-link the anchor honestly ("this bowl IS the roastery's profit hill, near its constrained peak"). We descend `f = −profit` so "downhill = more profit" stays the consistent verb across the whole explainer.
- **Plot window** for both 2 and 3: `x₁ ∈ [0, 30]`, `x₂ ∈ [0, 22]` (kg/day), so `x*=(16.364,7.273)` sits comfortably interior and the standard start `x0=(2,18)` (upper-left) is visible.
- **Verified eigen-facts (Node, recompute):** `det(Q)=0.0107`, `λ_max=0.360303`, `λ_min=0.029697`, `κ=12.1325`. Step-size thresholds for descending this bowl: monotone if `η < 1/L = 2.7754`; converges (possibly oscillating) if `0 < η < 2/L = 5.5509`; diverges if `η > 5.5509`; fastest constant step `η* = 2/(λ_max+λ_min) = 5.1282` with asymptotic contraction `ρ* = (κ−1)/(κ+1) = 0.8477` per step.

---

## CARD 1 — What is optimization?

**(a) Frame.** `id="whatis"` · icon `Target` (lucide) · accent **emerald** · `index={1}` · **not** anchor-flagged (`anchor={false}`) · `source="Boyd & Vandenberghe §1"`.
One-line purpose: install the four nouns (objective, decision variables, feasible set, optimum), the min/argmin distinction, the "minimize = maximize the negative" trick, local-vs-global, and the standing-on-a-landscape picture — then introduce the Roastery.

**(b) Intuition opener** (`<Intuition>` default title "first, the picture"):
> Every optimization problem is the same sentence: *of all the choices I'm allowed to make, which one is best?* Make that precise and three nouns fall out — a **knob you can turn** (the decision variable), a **score you want to push to its best value** (the objective), and a **set of choices that are actually allowed** (the feasible set). Picture the score as the height of a landscape over the space of choices: optimizing is walking that terrain to its lowest point without stepping outside the fenced-in region. The whole explainer is that one picture, returned to again and again as the terrain curves, grows walls, blurs, and finally shatters into stepping-stones.

**(c) Headline equation(s)** (use `<Block>`):
- Primary:
  ```
  \min_{\dir{x}\,\in\,\con{\mathcal{X}}}\ \obj{f(x)}
  \qquad
  \dir{x^\star}=\operatorname*{arg\,min}_{\dir{x}\,\in\,\con{\mathcal{X}}}\ \obj{f(x)}
  ```
- The negation identity (inline `<Eq>` inside prose is fine, but give it as a small `<Block>`):
  ```
  \operatorname*{arg\,max}_{\dir{x}}\ \obj{f(x)} \;=\; \operatorname*{arg\,min}_{\dir{x}}\ \bigl(-\obj{f(x)}\bigr)
  ```
- `<ReadEq>` for the primary: "Over every allowed choice **x** in the feasible set **𝒳** (amber — the rules), make the objective **f** (emerald — the score) as small as possible. The **min** is the best *value* you reach; the **argmin** is the *choice* that reaches it — usually it's the choice you care about, not the number."
- `<ReadEq>` for the identity (place right after it): "Maximizing is minimizing the flipped score — so we only ever need to teach *downhill*. The roastery maximizes profit; we'll quietly descend `f = −profit` and call it the same thing."

**(d) LIVE INTERACTIVE — "the landscape, three readings"** (bespoke SVG, one shared 2-D `(x₁,x₂)` panel, ~360×300):
- **What's plotted.** The Roastery profit surface as **filled contour bands** over `x₁∈[0,30]` (Espresso, kg/day) on the horizontal axis, `x₂∈[0,22]` (Filter, kg/day) vertical. Use the **true concave profit** `profit(x₁,x₂)=9x₁ − ½·0.03·x₁² + 7x₂ − ½·0.36·x₂² − 0.01·x₁x₂` (the anchor's frozen formula) so the very first surface the reader sees is the real anchor. Render ~8 contour levels via marching-squares on a 80×60 sample grid; warmer (emerald-bright) = higher profit. The unconstrained peak is far off-screen at (296.26, 11.21), so within this window the surface reads as a smoothly-rising ridge climbing to the right — honest, and motivates "why we need walls" in later cards.
- **Three overlay toggles** (HTML chips ABOVE the svg, framer-motion fade):
  1. **`feasible set`** — draw the three resource walls as straight lines and shade the feasible polygon (amber, 12% fill): `1.2x₁+1.0x₂≤27` (beans), `0.20x₁+0.10x₂≤4` (roaster), `0.10x₁+0.15x₂≤4` (labor), plus `x₁,x₂≥0`. Label each line. This visually defines `𝒳`.
  2. **`the optimum`** — drop a fuchsia dot at the **concave-constrained optimum (16.364, 7.273)**, profit **\$183.45/day**, with a callout "best feasible mix." When `feasible set` is also on, the dot sits exactly on the roaster wall (tangency) — a teaser for card 9.
  3. **`min vs argmin`** — a small readout panel: `argmin/argmax x* = (16.36, 7.27) kg` (the *choice*) vs `max profit = $183.45/day` (the *value*), to nail the distinction.
- **One control:** a `<select>` "**objective**" with options *Profit (maximize)* / *−Profit (minimize)*. Flipping it inverts the colormap (high becomes low) and swaps the readout label max↔min and the dot caption — the live demonstration of the negation identity. No iteration here; this card is static-geometry + toggles.
- **Verified demo constants (freeze):** concave-constrained optimum `(16.364, 7.273)`, profit `$183.45/day`; unconstrained peak `(296.26, 11.21)` (off-window, mention only); feasible polygon vertices are computed in card 12 — here just shade by testing the 80×60 grid against the three inequalities.

**(e) Carry-this** (`<MinSchema>`): "Three nouns and you've framed any optimization: the **knob** (decision variable `x`), the **score** (objective `f`), the **fence** (feasible set `𝒳`). `min` is the best *value*; `argmin` is the *choice* that achieves it — and maximizing is just minimizing the negative, so we only ever learn to go *downhill*."

**(f) Earned extras.**
- **`<Predict>`** — question: "The roastery's profit keeps rising as you make *more* espresso (its margin starts at \$9/kg). So why isn't the best plan 'make as much espresso as physically possible'?" Reveal: "Because the *fence* bites first. The unconstrained peak is at 296 kg of espresso — but that needs 367 kg of green beans a day and you have 27. The optimum is forced onto a **wall**, not the hilltop. Almost every real optimum lives on the boundary of the feasible set — which is why constraints (cards 9–11) carry half this explainer."
- **`<Misconception>`** — wrong: "Optimization means finding where the derivative is zero." right: "That finds *stationary points* of an unconstrained smooth f — but the answer is often on a constraint boundary (where ∇f ≠ 0), or at a kink where no derivative exists, or it's a max/saddle rather than a min." because: "∇f = 0 is necessary only for an *interior* minimum of a *smooth* objective. The roastery's optimum sits on a resource wall with ∇f pointing straight into it — gradient nonzero, yet optimal."
- **`<Deeper>`** — formalism + tradeoff: State the general program `minimize f(x) s.t. gᵢ(x)≤0, hⱼ(x)=0, x∈ℝⁿ`, and name the four classes by structure: *unconstrained smooth* (gradient methods, cards 3–5), *convex constrained* (KKT solvable, cards 6–11), *combinatorial/discrete* (𝒳 is a finite set of points, cards 12–15), *black-box/noisy* (no usable gradient, cards 16–18). Tradeoff paragraph: "The single fact that decides how hard your problem is isn't its size — it's whether the landscape is **convex** (one bowl, local=global, card 6) or not (many basins, NP-hardness, global search). A million-variable convex problem is routine; a forty-variable non-convex integer problem can be hopeless. Structure, not dimension, is destiny."
- **`<QA>`** items:
  - q: "Is `min f` the same thing as `argmin f`?" a: "No. `min f` is the lowest *value* (a number, e.g. profit −\$183.45 once negated); `argmin f` is the *input* that achieves it (the mix (16.36, 7.27) kg). You almost always want the argmin — the decision — and report the min as the score it earns."
  - q: "We want to *maximize* profit but the spine keeps saying *downhill*. Contradiction?" a: "No — `argmax f = argmin(−f)`. We descend `−profit`. Every downhill method in this explainer is a profit-maximizer wearing a minus sign."
  - q: "What's the difference between a local and a global minimum?" a: "A local min is lower than everything *nearby*; a global min is lower than everything *period*. On a convex bowl they coincide (card 6); on a bumpy landscape (card 17) a method can get trapped in a local min that's far from best."
- **Glossary `<Term>`s** (all already in the scaffold's `GLOSS` map — just wrap the words on first use): `objective`, `decision variable`, `feasible set`, `constraint`, `global minimum`, `local minimum`.
- **`<CrossLink>`s:**
  - to `gradient` recap="The gradient ∇f is the compass that tells you which way is downhill on this landscape — the next card." label: "which way is down?"
  - to `convexity` recap="Convexity is the property that makes a *local* bottom the *global* bottom — the line between easy and hard optimization." label: "convex = easy"
  - to `anchor` recap="The roastery is solved by every method in the explainer; here it's just being introduced as the running example." label: "the roastery, solved every way"

---

## CARD 2 — The gradient is a compass

**(a) Frame.** `id="gradient"` · icon `Compass` (lucide) · accent **indigo** · `index={2}` · **anchor-flagged** (`anchor={true}` — the scaffold's `SECTIONS` and `GradientCard` both mark it `anchor`; it's the primary "gradient compass" spine) · `source="Boyd & Vandenberghe §2.1; directional derivative"`.
One-line purpose: ∇f points steepest *uphill*, −∇f steepest *downhill*, the gradient is *perpendicular to the contour lines*, and the directional derivative `∇f·u` measures slope in any direction — *the* load-bearing visual of the whole explainer: drag a point, watch the arrow.

**(b) Intuition opener** (`<Intuition>`):
> Stand anywhere on the landscape and ask: *if I take one small step, which direction climbs fastest?* That single steepest-uphill direction, packaged as a vector, is the **gradient** ∇f. Its negative is steepest *downhill* — your compass for descent. Two facts make it a compass and not just an arrow: it always points **perpendicular to the contour lines** (the level curves of equal height), and its **length** tells you how steep the slope is — long arrows on a cliff, vanishing arrows on a plateau. Every optimizer in this explainer is, at heart, a rule for *how far and how often to follow this arrow.*

**(c) Headline equation(s)** (`<Block>`):
- Gradient + the perpendicularity + steepest-descent direction:
  ```
  \dir{\nabla f(x)}=\Bigl(\tfrac{\partial \obj{f}}{\partial x_1},\,\tfrac{\partial \obj{f}}{\partial x_2}\Bigr)
  \quad\text{points steepest \emph{up};}\qquad
  -\dir{\nabla f(x)}\ \text{steepest \emph{down}}
  ```
- Directional derivative (the "in any direction" law):
  ```
  D_{\dir{u}}\,\obj{f}(x)=\dir{\nabla f(x)}\cdot \dir{u}=\lVert\dir{\nabla f}\rVert\,\lVert\dir{u}\rVert\cos\theta
  ```
- `<ReadEq>` for the gradient: "Stack the partial derivatives into a vector. That vector aims in the direction the score rises fastest; flip its sign and you're pointing downhill, the direction descent will actually move."
- `<ReadEq>` for the directional derivative: "The slope you *feel* walking in direction **u** is the gradient *projected onto* **u** — `|∇f|cosθ`. It's biggest (=`|∇f|`) when you walk straight up the gradient (θ=0), zero when you walk **along a contour** (θ=90°, you stay at the same height), and most negative when you walk straight downhill. That cos θ is *why* the gradient is the steepest direction — no other direction gets a bigger projection."

**(d) LIVE INTERACTIVE — "drag the point, read the compass"** (bespoke SVG, ~380×300; the explainer's hero interactive):
- **What's plotted.** The shared demo bowl `fDemo` (above) as **contour ellipses** over `x₁∈[0,30]`, `x₂∈[0,22]`, centered at `x*=(16.364,7.273)`. Draw ~9 nested ellipse contours at level values `f = {0.5, 1.5, 3, 5, 8, 12, 18, 26, 36}` (each is the ellipse `½(x−x*)ᵀQ(x−x*)=c`; render by sampling θ∈[0,2π) and solving the quadratic radius, or marching-squares on the grid). Tint by height (indigo→neutral). The contours visibly **bunch where the surface is steep and spread where it's flat**, because spacing ∝ 1/|∇f|.
- **The draggable probe.** A point `p` the user drags anywhere in the window (default `p=(6,14)`). At `p`, draw **two arrows from the same tail**:
  - **−∇f (downhill)** solid indigo, the headline compass. At `p=(6,14)`: `∇f=(−0.2437, 2.3181)`, so `−∇f=(+0.2437, −2.3181)`, `|∇f|=2.3308` (verified). Arrow length scales as `min(40, 18·|∇f|)` px so plateaus give stubby arrows, cliffs give long ones.
  - **+∇f (uphill)** faint dashed indigo (half opacity), the mirror.
  - Optionally a **contour-tangent** dotted line through `p` (rotate ∇f by 90°: tangent `=(−∇f_y, ∇f_x)`), to *show* perpendicularity. At `p=(6,14)` tangent `=(−2.3181,−0.2437)`, and `∇f·tangent = 0` exactly (verified) — annotate "⟂".
- **The directional-derivative dial.** A second draggable handle sets a **unit direction `u`** (angle slider 0–360°, default 70°). Draw `u` as a short emerald arrow at `p` and live-print the readout `Dᵤf = ∇f·u`. At `p=(6,14)`, `u` at 70°: `∇f·u = 2.095` (verified `|∇f|cosθ`, θ between u and ∇f, ∇f at 96.0°). As the user sweeps `u`, the readout traces a cosine: **max +2.331 along uphill, 0 along the contour tangent, −2.331 straight downhill**. A tiny inline gauge bar (−|∇f| … +|∇f|) visualizes the value.
- **Controls:**
  - drag `p` (mouse/touch) — recomputes both arrows + readouts live.
  - `u` angle slider (`.opt-range`, 0–360°) — drives `Dᵤf`.
  - toggle chips (above svg): `show uphill ∇f`, `show contour tangent`, `show |∇f| as arrow length`.
- **No animation loop needed** (pure on-drag recompute), so no `RafGate`/`useReplayOnEnter` required — but if you add a subtle "pulse the downhill arrow on entry," gate it. Use `useId()` for the arrowhead `<marker>` ids (two markers: solid + dashed).
- **Verified ground-truth (freeze as a test fixture / sanity dots):**
  | p | −∇f (downhill) | \|∇f\| |
  |---|---|---|
  | (2, 18) | (+0.324, −3.718) | 3.732 |
  | (6, 14) | (+0.244, −2.318) | 2.331 |
  | (10, 10) | (+0.164, −0.918) | 0.933 |
  | (16.364, 7.273) | (0, 0) | 0 |
  | (20, 12) | (−0.156, −1.738) | 1.745 |
  | (25, 2) | (−0.206, +1.812) | 1.824 |

  At the minimum the arrow **vanishes** (`|∇f|=0`) — the visual definition of a stationary point, teeing up cards 3 and 7.

**(e) Carry-this** (`<MinSchema>`): "The gradient ∇f points steepest **uphill**; **−∇f** is your downhill compass. It's always **perpendicular to the contour lines**, and its **length is the steepness** — long on cliffs, zero at the bottom. The slope in any direction **u** is just the projection `∇f·u = |∇f|cosθ`, which is why nothing beats walking straight down the gradient."

**(f) Earned extras.**
- **`<Predict>`** — question: "You're standing on a steep hillside and want to *lose altitude as slowly as possible while still going down* — say, to traverse gently. Which way do you walk relative to the gradient arrow?" Reveal: "Almost perpendicular to it — just barely tilted downhill. Walking *exactly* perpendicular (along the contour) keeps your altitude constant (`∇f·u=0`); tilt a few degrees off and you descend at rate `|∇f|cosθ`, which is tiny near θ=90°. Steepest descent (straight down −∇f) is the *fastest* altitude loss, not the only one — which is exactly the freedom that momentum and Newton exploit later."
- **`<Misconception>`** — wrong: "The gradient points toward the minimum." right: "The gradient points in the direction of steepest *increase* — *away* from a minimum — and only *locally*. Following −∇f heads downhill, but it points at the *bottom* only on a perfectly round bowl." because: "On the tilted, elongated contours here (κ=12), −∇f at most points cut *across* the valley rather than straight at x*; that mismatch is precisely the zigzag that plagues gradient descent (card 3) and that Newton fixes (card 4)."
- **`<Worked>`** title "Reading the compass at (6, 14)": Walk it numerically. "∇f = Q(p−x*) with p−x* = (6−16.364, 14−7.273) = (−10.364, 6.727). Then ∇f₁ = 0.03·(−10.364)+0.01·(6.727) = −0.2437, ∇f₂ = 0.01·(−10.364)+0.36·(6.727) = 2.3181. Downhill is the flip: (+0.244, −2.318) — *mostly straight down in x₂*, because the bowl is far steeper along x₂ (q₂₂=0.36) than x₁ (q₁₁=0.03). Steepness |∇f| = √(0.244²+2.318²) = 2.331. Step a hair along the contour tangent (−2.318, −0.244) instead and your height doesn't change at all: ∇f·tangent = (−0.244)(−2.318)+(2.318)(−0.244) = 0."
- **`<Deeper>`** — formalism + tradeoff: "Why is the gradient perpendicular to its level set? Move along a contour, where `f` is constant. By the chain rule `d/dt f(x(t)) = ∇f·ẋ = 0`, and `ẋ` is the contour's tangent — so ∇f ⟂ tangent, i.e. ∇f is the **normal** to the level set. And why is it the *steepest* direction? Among all unit `u`, `∇f·u = |∇f|cosθ` is maximized at θ=0, i.e. `u = ∇f/|∇f|`, with value `|∇f|`. Tradeoff: steepest *locally* is not fastest *globally*. The gradient only knows the infinitesimal picture; on anisotropic landscapes (large condition number κ) repeatedly choosing the locally-steepest direction makes you zigzag, and second-order information (the Hessian, card 4) buys a far better direction. The gradient is a perfect compass and a mediocre map."
- **`<QA>`** items:
  - q: "If I'm at a minimum, what does the compass do?" a: "It vanishes — `∇f = 0`, the arrow has zero length. That's the first-order optimality condition (card 7). On the demo bowl, drag the point to (16.36, 7.27) and the arrow disappears."
  - q: "Does a longer gradient arrow mean I'm closer to the minimum?" a: "Usually the opposite — long arrows mean *steep*, which is typically *far* from a flat bottom. As you approach x* the slope flattens and |∇f|→0. (On a non-quadratic surface this is only a rule of thumb.)"
  - q: "Why are the contour ellipses tilted, not axis-aligned?" a: "Because of the cross term `q₁₂=0.01` in Q — the off-diagonal couples x₁ and x₂. Zero off-diagonal would give axis-aligned ellipses; here the principal axes are the eigenvectors of Q, slightly rotated from the x₁/x₂ axes."
- **Glossary `<Term>`s** (in scaffold `GLOSS`): `gradient`, `directional derivative`, `condition number` (mentioned in Deeper/Misconception). Optionally `Hessian` where Deeper points to card 4.
- **`<CrossLink>`s:**
  - to `descent` recap="Gradient descent just repeats x ← x − η∇f: take a step down the compass, re-read, repeat. The next card." label: "follow the compass: gradient descent"
  - to `newton` recap="Newton rescales the step by curvature (the Hessian) so it points at the bottom of an elongated valley instead of zigzagging across it." label: "fixing the zigzag: Newton"
  - to `optimality` recap="∇f = 0 — a vanishing compass — is the first-order test for a stationary point: minimum, maximum, or saddle." label: "when the arrow vanishes"

---

## CARD 3 — Gradient descent & step size

**(a) Frame.** `id="descent"` · icon `TrendingDown` (lucide) · accent **emerald** · `index={3}` · **not** anchor-flagged · `source="Nocedal & Wright §3 (line search, Armijo); gradient flow"`.
One-line purpose: the update `x ← x − η∇f`; the four step-size regimes (crawl / converge / oscillate / diverge) as η grows; the safe step `η < 2/L`; line search & Armijo as the principled fix; and the "trust" theme — η is *how far you trust the local linear picture*.

**(b) Intuition opener** (`<Intuition>`):
> The compass tells you which way is down; **gradient descent** is the obvious follow-through — take a step that way, re-read the compass, step again. The only knob is the **step size** η (the "learning rate"): *how far you trust the downhill direction before re-checking.* Too timid and you crawl down the hill in a thousand baby steps; too bold and you overshoot the bottom, ricochet up the far wall, and — past a hard threshold — blow up entirely. There's a sweet spot, and on an elongated valley even the *best* fixed step is forced to zigzag. Everything fancier — momentum, Newton, Adam — is a smarter answer to this one question: *how big a step, in what direction, dare I take?*

**(c) Headline equation(s)** (`<Block>`):
- The update:
  ```
  \dir{x_{k+1}} \;=\; \dir{x_k} \;-\; \eta\,\dir{\nabla f(x_k)}
  ```
- The safe-step / convergence condition (for an L-smooth / quadratic f):
  ```
  0 \;<\; \eta \;<\; \frac{2}{L},\qquad L=\lambda_{\max}(\nabla^2 \obj{f})
  \quad\Longrightarrow\quad \dir{x_k}\to \dir{x^\star}
  ```
- `<ReadEq>` for the update: "New point = old point minus η times the gradient. The `−∇f` sets the *direction* (downhill); η sets the *distance*. One arrow, one step, repeat."
- `<ReadEq>` for the condition: "There's a hard speed limit set by the *curvature*. L is the steepest curvature (largest Hessian eigenvalue). Step shorter than `2/L` and you're guaranteed to converge; step longer and each move overshoots more than the last — you diverge. Below `1/L` you slide in *monotonically*; between `1/L` and `2/L` you converge but *oscillate* across the valley."

**(d) LIVE INTERACTIVE — "the step-size dial: crawl → converge → oscillate → diverge"** (bespoke SVG; this is the canonical *GD step-size phase diagram* from the ALIGNMENT illustration list). Two linked panels side by side (stack on mobile):
- **Panel A — the trajectory on the bowl** (~360×280). The shared demo bowl `fDemo` with the same tilted contours as card 2, window `x₁∈[0,30]`, `x₂∈[0,22]`, minimum marked at `x*=(16.364,7.273)` (fuchsia dot). From fixed start **`x0=(2,18)`**, run gradient descent `x_{k+1}=x_k − η·gradDemo(x_k)` for **N=60** iterations and draw the iterate path as a polyline with small dots at each iterate; animate the dots appearing one per ~60ms (gate with `RafGate`, restart via `useReplayOnEnter` on re-entry). Color the path by regime: **emerald** when converging monotonically, **amber** when oscillating-but-converging, **rose** when diverging (clamp drawn points to the window so a divergent run shoots to the edge and stops).
- **Panel B — distance-to-optimum vs iteration** (use the existing `<MultiLinePlot>`): plot `‖x_k − x*‖` (log-friendly linear y is fine, range auto) against k=0..60 for the *current* η, with faint ghost curves for a couple of reference η's. Draw `hlines` at 0. This makes "crawl = slow decay," "converge = fast decay," "oscillate = sawtooth decay," "diverge = explosion" legible as curves.
- **The one control that matters:** a prominent **η slider** (`.opt-range`) from **0.1 to 6.0**, default **2.0**. Above it, a live **regime badge** computed from the verified thresholds:
  - `η < 2.7754` → badge **"monotone"** (emerald) — also show "crawl" sub-label if `η < ~1.0`.
  - `2.7754 ≤ η < 5.5509` → badge **"oscillating, converging"** (amber).
  - `η ≥ 5.5509` → badge **"DIVERGING"** (rose).
  Mark the slider track with three tick annotations at **η=1/L=2.78**, **η*=2/(λ_max+λ_min)=5.13** (label "fastest"), and **η=2/L=5.55** (label "divergence threshold").
- **Verified regime behavior at x0=(2,18), N=60 (recomputed in Node — freeze as expected fixture):**
  | η | regime | ‖x₂₀−x*‖ | ‖x₆₀−x*‖ |
  |---|---|---|---|
  | 0.5 | crawl (monotone) | 10.9 | 5.98 |
  | 2.0 (default) | converge (monotone) | 4.31 | 0.373 |
  | 4.0 | converge (oscillating in steep axis) | 1.17 | 0.0074 |
  | 5.128 (η*) | fastest | 0.658 | 8.9e-4 |
  | 5.4 | oscillating, still converging | 3.39 | 0.360 |
  | 5.7 | **diverges** | 29.3 | 238 (→∞) |
- **Iterations-to-tolerance readout** (live): "iters to ‖x−x*‖<0.01: **crawl η=0.5 → 488**, default η=2.0 → 120, fastest η=5.13 → 46" (verified). Show the count for the *current* η.
- **Exact early iterates for η=2.0 (builder ground-truth / unit-test fixture):**
  ```
  k=0 (2.0000, 18.0000)   k=1 (2.6473, 10.5638)   k=2 (3.4045, 8.4688)
  k=3 (4.1581, 7.8670)    k=4 (4.8786, 7.6834)    k=5 (5.5595, 7.6176)
  k=6 (6.2009, 7.5856)
  ```
  (Note how x₂ snaps to ≈7.3 almost immediately while x₁ crawls in — the visible signature of κ=12 anisotropy: the steep axis converges fast, the shallow axis drags. This is the zigzag motivation handed to cards 4–5.)
- **Optional second toggle:** `line search (Armijo backtracking)` — when on, ignore the η slider and at each step backtrack `η ← βη` (β=0.5) from η₀=6.0 until the **Armijo condition** `f(x−η∇f) ≤ f(x) − c₁η‖∇f‖²` holds (c₁=1e-4). This auto-picks a safe step every iteration and the path descends monotonically without the user tuning η — the "principled fix" payoff. Show the accepted η per step as a faint number.

**(e) Carry-this** (`<MinSchema>`): "Gradient descent is one line — `x ← x − η∇f` — and one judgment call: the step **η**. Curvature sets a hard speed limit `η < 2/L` (here 2/L = 5.55); below `1/L` (=2.78) you slide straight in, between them you converge while *oscillating*, above it you **diverge**. Even the best fixed step zigzags on an elongated valley — η is *how far you trust the local linear picture*, and getting it right (or letting line search pick it) is the central art of descent."

**(f) Earned extras.**
- **`<Predict>`** — question: "If a small step size converges and a slightly bigger one converges *faster*, will making the step bigger and bigger keep speeding things up?" Reveal: "No — there's a cliff. Speed improves up to η* = 2/(λ_max+λ_min) = 5.13, then *degrades*, and at η = 2/L = 5.55 it stops converging at all; beyond that each step overshoots more than the last and the iterate explodes. 'A bigger step is faster' holds only until you cross the curvature's speed limit — then it's catastrophic. This is exactly why a learning rate that's slightly too high in deep learning shows up as a loss that spikes to NaN."
- **`<Misconception>`** — wrong: "A diverging optimizer just means you started too far from the answer." right: "Divergence is a *step-size* failure, not a *starting-point* failure. Past η = 2/L the method blows up from *any* start; below it, it converges from *any* start (for a convex quadratic)." because: "On `f=½(x−x*)ᵀQ(x−x*)`, the error obeys `e_{k+1}=(I−ηQ)e_k`, so it shrinks iff every `|1−ηλᵢ|<1`. The worst eigenvalue is λ_max=L, giving the threshold η<2/L=5.55 independent of where you start — the starting point only sets *how far*, never *whether*."
- **`<Worked>`** title "Where the thresholds come from (this exact bowl)": "The Hessian is Q, with eigenvalues λ_max = 0.3603 and λ_min = 0.0297 (κ = 12.13). In the eigenbasis each error coordinate updates by the factor `(1−ηλ)`. **Monotone** (no sign flip) needs `1−ηλ_max > 0`, i.e. η < 1/λ_max = **2.775**. **Convergent** needs `|1−ηλ_max| < 1`, i.e. η < 2/λ_max = **5.551**. The fastest constant step balances the two extreme eigenvalues: `η* = 2/(λ_max+λ_min) = 5.128`, leaving contraction `ρ* = (κ−1)/(κ+1) = 0.848` per step — so even tuned perfectly, this κ=12 valley loses only ~15% of its error each step. That sluggishness is the whole motivation for Newton (card 4) and momentum (card 5)."
- **`<Deeper>`** — *gradient flow / forward-Euler* (the ALIGNMENT-required link) + tradeoff: "Shrink the step toward zero and the iteration `x_{k+1}=x_k − η∇f` becomes the ODE **`ẋ = −∇f(x)`** — *gradient flow*, the continuous trajectory that always moves downhill. Gradient descent is exactly **forward Euler** integrating that ODE with time-step `h = η`: `x_{k+1} = x_k + h·(−∇f) `. *(Verified: GD and forward-Euler on `ẋ=−∇f` produce identical iterates to machine precision.)* That reframes the step-size limit as a numerical-stability limit — forward Euler on a linear ODE `ẋ=−Qx` is stable only for `h < 2/λ_max`, the *same* `2/L`. **Tradeoff:** the continuous flow never overshoots or diverges; all the pathology is an artifact of *discretizing* with too large a step. Implicit/backward Euler (`x_{k+1}=x_k − η∇f(x_{k+1})`) is unconditionally stable but needs a solve each step — the same explicit-vs-implicit tension you meet in PDE time-stepping." Add `<CrossLink to="odes" external recap="...">` if the `odes` explainer is a sibling slug — the gradient-flow ODE `ẋ=−∇f` is the bridge.
- **`<QA>`** items:
  - q: "What is L, concretely, and how would I find it for my own problem?" a: "L is the largest eigenvalue of the Hessian — the steepest curvature anywhere relevant. Here L = λ_max(Q) = 0.360. For a general f it's the Lipschitz constant of the gradient; in practice you estimate it (e.g. power iteration on the Hessian) or just use line search and never compute it."
  - q: "If I never want to think about η, what do I do?" a: "Use line search — e.g. Armijo backtracking: start with a generous η and halve it until the function actually decreases enough (`f(x−η∇f) ≤ f(x) − c₁η‖∇f‖²`). It re-picks a safe step every iteration. Toggle it on in the interactive and watch the path descend without you touching the slider."
  - q: "Why does the path zigzag instead of heading straight at the minimum?" a: "Because the valley is elongated (κ=12). −∇f points across the valley more than along it, so each step overshoots the narrow direction and barely advances the long one. Newton (card 4) reshapes the step by curvature to point straight at the bottom; momentum (card 5) cancels the back-and-forth."
  - q: "Is η = 2/L the step I should use?" a: "No — that's the *divergence threshold*, the worst safe step. The fastest fixed step is η* = 2/(λ_max+λ_min) = 5.13 here; 2/L = 5.55 is the edge of the cliff. In practice aim well inside the safe region or use line search."
- **Glossary `<Term>`s** (in scaffold `GLOSS`): `step size`, `learning rate`, `line search`, `condition number`, `Lipschitz`.
- **`<CrossLink>`s:**
  - to `gradient` recap="−∇f is the downhill compass; gradient descent just steps along it repeatedly." label: "the compass we're following"
  - to `newton` recap="Newton multiplies the gradient by the inverse Hessian, jumping to the bottom of the local quadratic in one step — no zigzag, no κ-dependence." label: "kill the zigzag: Newton"
  - to `momentum` recap="Momentum accumulates a velocity from past gradients, canceling the cross-valley oscillation and accelerating along the floor." label: "smooth the zigzag: momentum"
  - to `odes` (external sibling slug) recap="ẋ = −∇f is gradient flow; gradient descent is forward-Euler integration of it, and the step-size limit is its numerical-stability limit." label: "GD = forward Euler on gradient flow"
  - to `anchor` recap="This demo bowl is the roastery's own profit surface (same Q), parked at its concave-constrained optimum (16.36, 7.27)." label: "this bowl is the roastery"

### Verified constants — frame-gradient-gd
## Verified constants — Cluster 1 (Frame + Gradient + GD step size)

All values below independently recomputed in hand-rolled Node (no solver libs). Builder may hardcode/trust these.

### Demo bowl / eigen-facts (Q = [[0.03,0.01],[0.01,0.36]], x* = (16.364, 7.273))
| Quantity | Verified value |
|---|---|
| det(Q) | **0.0107** |
| λ_max (= L) | **0.360303** (display 0.3603) |
| λ_min | **0.029697** |
| κ(Q) = λ_max/λ_min | **12.1325** (display 12.13) |
| monotone threshold 1/L | **2.7754** |
| convergence threshold 2/L | **5.5509** (GD diverges for η > 5.5509; verified L = λ_max = 0.360303) |
| fastest step η* = 2/(λ_max+λ_min) | **5.1282** |
| asymptotic contraction ρ* = (κ−1)/(κ+1) | **0.8477** per step |

### Roastery anchor solutions (match frozen register)
| Quantity | Verified value |
|---|---|
| Unconstrained concave max x* = Q⁻¹a, a=(9,7) | **(296.26, 11.21)** |
| beans required at unconstrained max | **366.73 kg** (full precision; ≫ G=27, infeasible). NOTE: arithmetic on rounded display values 1.2·296.26+1.0·11.21 = 366.72; spec's stated 366.73 (full precision) is correct. |
| Concave-constrained optimum | **(16.364, 7.273) kg**, profit **$183.45/day**, μ_roaster = 42.18, on roaster wall (0.2x₁+0.1x₂≈4) |
| LP optimum | **(16.25, 7.5) kg**, margin **$198.75/day**, beans+roaster bind, labor slack 1.25 h |
| Shadow prices | beans **$6.25/kg**, roaster **$7.50/hr**, labor **$0.00** (complementary slackness) |

### Gradient compass fixtures (gradDemo(x)=Q(x−x*), -grad = downhill)
| p | grad f | −∇f (downhill) | \|∇f\| |
|---|---|---|---|
| (2,18) | — | (+0.324, −3.718) | **3.732** |
| (6,14) | (−0.2437, 2.3181) | (+0.2437, −2.3181) | **2.3308** (≈2.331) |
| (10,10) | — | (+0.164, −0.918) | **0.933** |
| (16.364,7.273) | (0,0) | (0,0) | **0** |
| (20,12) | — | (−0.156, −1.738) | **1.745** |
| (25,2) | — | (−0.206, +1.812) | **1.824** |

At p=(6,14): contour tangent = rot90(grad) = **(−2.3181, −0.2437)**, ∇f·tangent = **0** (exact perpendicularity); grad angle = **96.0°**; directional derivative for u at 70° = **2.0949** (≈2.095); level value f(6,14) = **9.06** (9.0595).

### GD regime table (x0=(2,18), N=60) — exact fixtures
| η | regime | ‖x₂₀−x*‖ | ‖x₆₀−x*‖ |
|---|---|---|---|
| 0.5 | crawl (monotone) | **10.89** | **5.98** |
| 2.0 (default) | converge (monotone) | **4.31** | **0.373** |
| 4.0 | converge (oscillating steep axis) | **1.17** | **0.0074** |
| 5.128 (η*) | fastest | **0.658** | **8.9e-4** |
| 5.4 | oscillating, converging | **3.39** | **0.360** |
| 5.7 | diverges | **29.3** | **237.7** (→∞) |

Iterations to ‖x−x*‖<0.01 from x0=(2,18): η=0.5 → **488**, η=2.0 → **120**, η=5.128 → **46**.

Exact early iterates (η=2.0, x0=(2,18)): k1=(2.6473,10.5638), k2=(3.4045,8.4688), k3=(4.1581,7.8670), k4=(4.8786,7.6834), k5=(5.5595,7.6176), k6=(6.2009,7.5856).

### Theory identities (verified to machine precision)
- GD ≡ forward-Euler of ẋ=−∇f with h=η: **iterates identical (max diff = 0 over 40 steps)**.
- Forward Euler on ẋ=−Qx stable iff **h < 2/λ_max = 5.5509** (empirically: h=5.6 diverges, h=5.5508 stable) — same 2/L threshold as GD.
- Quadratic error recursion **e_{k+1}=(I−ηQ)e_k** holds exactly (max diff 1.78e-15 over 20 steps); contracts iff |1−ηλ_i|<1 for both eigenvalues.


---

## Cluster: newton-momentum — cards 4 (Curvature & Newton), 5 (Momentum & acceleration)
_verification: corrections applied — see register_

## Cluster: Which way is down? — Curvature & Acceleration (Cards 4–5)

> **Shared design note for the builder (read first).** The true anchor concave max is `x* = Q⁻¹a = (296.26, 11.21)` — far off any sensible 2-D viewport and wildly anisotropic in raw `(x₁,x₂)` units. So both cards run their LIVE interactives on a **clean, axis-aligned, origin-centered DEMO bowl with the *same* condition number κ = 12.13 as the anchor Q** — `g(u,v) = ½(λ_min·u² + λ_max·v²)` with `λ_min = 0.029697`, `λ_max = 0.360303` (these are the exact eigenvalues of the frozen anchor `Q=[[0.03,0.01],[0.01,0.36]]`). The visual gets a tidy centered ellipse with axis ratio `√κ = 3.483`; the *numbers* (κ, all convergence rates, Newton's one-step) stay rigorously tied to the real anchor. Tell the reader this explicitly in a one-line caption: *"Same bowl shape as the Roastery's profit hill (κ ≈ 12), recentered so we can watch the methods walk."* Reserve the literal `(296.26, 11.21)` for the Newton "lands on the true max in one step" callout, which is exact for the anchor itself.

---

## Card 4 — Curvature & Newton's method

**(a) Frame**
- **id:** `curvature-newton`
- **icon:** `Gauge` (lucide) — a curvature/dial motif; alternative `Sigma` if `Gauge` reads as a controller. Use `Gauge`.
- **accent:** `cyan` (curvature / Newton / the Hessian — per the visual-identity register).
- **anchor:** `false` (uses the anchor bowl's shape and the exact `x*`, but is a method card, not a spine card).
- **source:** `"Nocedal & Wright, Numerical Optimization 2e (Ch. 3, Newton & line search)"`
- **one-line purpose:** Gradient tells you *which way* is down; **curvature** tells you *how far* — Newton builds a local quadratic model and jumps to its minimum, which on a true quadratic is the exact answer in a single step.

**(b) Intuition opener** — `<Intuition title="first, the picture">`
> Gradient descent is a hiker who can only feel the slope under their feet — it knows the downhill direction but has no idea whether the valley floor is one meter away or a kilometer. **Curvature is the missing information.** If you also know how the slope is *bending* — steeply curved means the bottom is near, gently curved means it is far — you can stop guessing the step size and instead compute it. Newton's method does exactly this: it fits a parabola (a bowl) to the surface right where you stand and walks straight to that bowl's bottom. When the real surface *is* a bowl, the parabola is exact and you land on the true minimum in one move.

**(c) Headline equations** (exact KaTeX, color macros; remember `\dir`=indigo gradient/step, `\obj`=emerald objective, cyan is the card accent but there is no dedicated cyan macro — use plain for the Hessian or wrap in `\mathbf`):

Local quadratic (Taylor) model around `x_k`:
```
<Block>{'\\obj{f}(x) \\;\\approx\\; \\obj{f}(x_k) + \\dir{\\nabla f(x_k)}^{\\!\\top}(x-x_k) + \\tfrac12 (x-x_k)^{\\!\\top} \\mathbf{H}(x_k)\\,(x-x_k)'}</Block>
```
The Newton step (minimize that model — set its gradient to zero):
```
<Block>{'x_{k+1} \\;=\\; x_k - \\mathbf{H}(x_k)^{-1}\\,\\dir{\\nabla f(x_k)}'}</Block>
```
Condition number of the Hessian (the anisotropy that punishes gradient descent):
```
<Block>{'\\kappa(\\mathbf{H}) \\;=\\; \\frac{\\lambda_{\\max}(\\mathbf{H})}{\\lambda_{\\min}(\\mathbf{H})} \\;=\\; \\frac{0.3603}{0.02970} \\;\\approx\\; 12.13'}</Block>
```

**read-as** (`<ReadEq>`): *"The next point equals the current point, minus the inverse Hessian times the gradient. Gradient descent uses `−η∇f`: one scalar step `η` for every direction. Newton replaces that single knob with `H⁻¹` — a per-direction step size that stretches the move long in flat directions and short in steep ones. On a quadratic, `H` is constant and the model is exact, so this lands on the minimum in one shot."*

**(d) LIVE INTERACTIVE — "One step vs. a hundred"**
- **What is plotted:** the centered demo bowl `g(u,v) = ½(λ_min·u² + λ_max·v²)`, `λ_min = 0.029697`, `λ_max = 0.360303`. Draw contour ellipses (level sets) over the window `u ∈ [−12, 12]`, `v ∈ [−4, 4]` (aspect chosen so the `√κ = 3.483` axis ratio reads as a genuinely elongated ellipse; keep SVG aspect square and let the ranges do the stretching, or set equal pixel scale and accept the wide box — pick the wide box, it is more honest). Level sets at `g ∈ {0.2, 0.8, 1.8, 3.2, 5.0}` (i.e. equal increments in `√g`).
- **Two trajectories from a shared start** `(u₀,v₀) = (10, 1)`:
  - **Newton (cyan):** one segment from `(10,1)` straight to `(0,0)`. Compute as `x_{k+1} = x_k − H⁻¹∇g`, `H = diag(λ_min,λ_max)`, `∇g = (λ_min·u, λ_max·v)`. Verified: `(10,1) − diag(1/λ_min,1/λ_max)·(λ_min·10, λ_max·1) = (0, 0)` exactly (one step). Render as a single arrow; on replay, draw it landing on the optimum dot.
  - **Gradient descent (indigo):** `x_{k+1} = x_k − η·∇g`, with `η = η_opt = 2/(λ_min+λ_max) = 5.1282`. Iterate ~30 visible steps. Verified path (round to plot): `(10,1) → (8.477,−0.848) → (7.186,0.719) → (6.092,−0.609) → (5.164,0.516) → (4.378,−0.438) → …`. Render as a zig-zag polyline; the `v` (steep) coordinate **flips sign every step** (factor `1−η·λ_max = −0.8477`) while `u` (flat) **crawls monotonically** (factor `1−η·λ_min = +0.8477`). This is the canonical zigzag.
- **Controls:**
  1. **Step-size slider `η`** for the GD path, range `[0, 5.55]`, default `5.128`. Annotate three zones live: `η < 2/λ_min ≈ 67` is irrelevant here; the *meaningful* breakpoints are `η_opt = 5.128` (fastest, perfect zigzag) and `η_max = 2/λ_max = 5.551` (stability edge — beyond it GD **diverges**; show the path spiraling outward and a rose "diverging" chip when `η > 5.551`).
  2. **Toggle "show Newton step"** (on by default) — overlays the cyan one-shot arrow.
  3. **Slider "κ of the bowl"** (advanced; range `1 → 30`, default `12.13`) — rescales `λ_max` to `κ·λ_min` keeping `λ_min` fixed, redrawing contours and both paths live. At `κ = 1` the bowl is circular: GD goes straight to the bottom in one step too (the demo's punchline — *GD is only slow because of anisotropy*). At `κ = 30` the zigzag is brutal.
  4. **Button "step once"** — advances the GD path one iteration so the reader watches each corner appear.
  - **Live readout (HTML chips above the SVG):** "GD steps to within 1% of the optimum: **28**" (verified at η_opt, κ=12.13, start `(10,1)`); "Newton steps: **1**"; current `η`, current `κ`, and the per-step GD contraction `|1−η·λ_max|`.
- **Verified demo constants to freeze:** `λ_min=0.029697247`, `λ_max=0.360302753`, `κ=12.1325`, `η_opt=5.128205`, `η_max=5.550887`, `√κ=3.48318`, GD-steps-to-1%=28, Newton-steps=1.

**(e) Carry-this** — `<MinSchema>`
> **The gradient picks the direction; curvature picks the distance.** Newton multiplies the gradient by `H⁻¹` to get a per-direction step — exact in one move on a quadratic, and on the Roastery's smooth profit bowl it lands on the true unconstrained max `x* = (296.26, 11.21)` from *any* starting point in a single step.

**(f) Supporting elements**

- **`<Predict question="A perfectly round bowl (κ=1) vs. an elongated one (κ=12). On which does plain gradient descent with its best step size reach the bottom faster — and by how much?">`**
  reveal-body: *"On the round bowl, GD reaches the bottom in **one step** — same as Newton — because every direction has identical curvature, so a single scalar step size is already the perfect per-direction step. On the κ=12 bowl, GD's error shrinks by only `(κ−1)/(κ+1) = 0.848` per step, needing **~28 steps** to do what Newton does in 1. The penalty is entirely the anisotropy κ, not the dimension or the size of the problem."*

- **`<Misconception wrong="Newton's method always converges faster than gradient descent." right="Newton converges in one step on a quadratic and quadratically near any minimum, but each step costs solving an n×n linear system (≈ n³ work) and forming the Hessian (n² entries); on a million-parameter model that is hopeless, and far from a minimum H⁻¹ can point uphill." because="Newton's speed is per-iteration (in steps), not per-second (in compute). For large or non-convex problems we use the cheap gradient and *approximate* the curvature — that is exactly the story of momentum (next card), quasi-Newton (L-BFGS), and Adam's per-coordinate scaling.">`**

- **`<Worked title="Newton lands on the Roastery's true max in one step">`**
  Content: minimize `g(x) = ½xᵀQx − aᵀx` (the negative of profit), with `Q=[[0.03,0.01],[0.01,0.36]]`, `a=(9,7)`. `∇g = Qx − a`, `H = Q` (constant). From *any* start `x₀`,
  `x₁ = x₀ − Q⁻¹(Qx₀ − a) = x₀ − x₀ + Q⁻¹a = Q⁻¹a`.
  Compute `Q⁻¹ = [[33.6449, −0.9346],[−0.9346, 2.8037]]` (det Q = 0.0107), so `x* = Q⁻¹a = (296.26, 11.21)`. **One step, any start, exact** — that is what "the quadratic model is the truth" buys you. (Then the honest footnote: this point needs `1.2·296.26 + 1·11.21 = 366.7 kg` of green beans against a budget of 27 — wildly **infeasible**, which is precisely why the constraint cards exist. Cross-link forward.)

- **`<Deeper title="Why H⁻¹ is the right rescaling — and when it bites back">`**
  - **Formalism:** Newton's step is the exact minimizer of the second-order Taylor model. Near a minimum `x*` with positive-definite Hessian, Newton converges **quadratically**: `‖x_{k+1} − x*‖ ≤ C‖x_k − x*‖²` — the number of correct digits roughly *doubles* each step, versus the *fixed-fraction* (linear) shrinkage `(κ−1)/(κ+1)` of best-step GD. Geometrically, `H⁻¹` performs the change of coordinates that turns the elongated bowl into a perfect circle (whitening); in those coordinates every direction has curvature 1 and the gradient points straight at the bottom.
  - **Why / tradeoff:** the cost is `O(n³)` per step to solve `H·Δ = −∇f` and `O(n²)` memory to store `H`. Three failure modes: (1) far from a minimum, `H` may be indefinite and `−H⁻¹∇f` can point *uphill* — fixes are line search, trust regions, or modifying `H` to be PD; (2) on non-quadratic surfaces like Rosenbrock the one-step magic is gone — see the note below; (3) at scale you cannot even form `H`. The entire modern toolkit (L-BFGS builds a low-rank `H⁻¹` from gradient history; Adam keeps a cheap diagonal curvature proxy) is "approximate Newton on a budget."
  - **Rosenbrock note (a SEPARATE illustrative function — do NOT conflate with the convex anchor bowl):** the banana valley `f(x,y) = (1−x)² + 100(y−x²)²`, global min at `(1,1)` with `f=0`. It is **non-convex** and famously ill-conditioned: its Hessian at the minimum is `[[802,−400],[−400,200]]` with eigenvalues `≈ 1001.6` and `0.399`, so `κ ≈ 2508` — twenty thousand times the wiggle of the anchor bowl, all packed into a curved banana-shaped trough. From the standard start `(−1.2, 1)`: **Newton (with the modifications above) reaches `(1,1)` in ~8 iterations**, whereas plain GD with `η = 2×10⁻³` needs **~8,500 iterations**. Lesson transferred: curvature-awareness is worth orders of magnitude, but on a curved valley even Newton must iterate because the quadratic model is only locally true.

- **`<QA items={[ ... ]}/>`**
  - `q:` "Where does the Hessian come from on a real loss with a million parameters?" `a:` "You almost never form it. Reverse-mode autodiff (backprop) gives the *gradient* cheaply; the full Hessian is an `n×n` object you cannot store. Practitioners use Hessian-*vector* products (one extra backprop), or skip curvature and approximate it — momentum and Adam are the workhorses. See the autodiff card."
  - `q:` "Newton needs the inverse Hessian — isn't inverting a matrix slow and unstable?" `a:` "You never invert it; you *solve* the linear system `H·Δ = −∇f` (Cholesky if `H` is PD). For `n=2` it is trivial; for `n=10⁶` it is the bottleneck, which is the whole reason for quasi-Newton and first-order methods."
  - `q:` "If Newton is one step on a quadratic, why isn't every optimizer Newton?" `a:` "Because real objectives aren't quadratic and `n` is huge. The one-step result is the *ideal* that every cheaper method is trying to approximate."

- **Glossary `<Term>` entries (add to GLOSS):**
  - **Hessian** — "the matrix of second derivatives `H_{ij} = ∂²f/∂xᵢ∂xⱼ`; it encodes the local curvature — how the gradient itself changes as you move."
  - **condition number** — "`κ = λ_max/λ_min` of the Hessian; the ratio of steepest to gentlest curvature. κ=1 is a perfect bowl; large κ is a stretched ravine that makes gradient descent zigzag. The anchor bowl has κ ≈ 12."
  - **quadratic convergence** — "error squares each step (`‖e_{k+1}‖ ≲ ‖e_k‖²`) so correct digits roughly double per iteration — Newton's behavior near a minimum."
  - **positive definite** — "a symmetric matrix with all eigenvalues > 0; the Hessian being PD means the surface curves up in every direction (a genuine bowl, a minimum)."

- **CrossLinks:**
  - `<CrossLink to="gradient-descent-step-size" recap="GD uses one scalar step η for all directions; Newton replaces it with H⁻¹.">back to gradient descent & step size</CrossLink>`
  - `<CrossLink to="momentum-acceleration" recap="If H⁻¹ is too expensive, momentum recovers most of the speedup with only gradients.">on to momentum & acceleration</CrossLink>`
  - `<CrossLink to="linear-algebra" recap="Eigenvalues of the Hessian are the curvatures along the principal axes; κ is their ratio.">linear-algebra · eigenvalues & conditioning</CrossLink>`
  - `<CrossLink to="constraints-lagrange" recap="Newton's unconstrained max (296.26, 11.21) needs 366.7 kg of beans vs a 27 kg budget — infeasible, which forces the constrained story.">forward to constraints & Lagrange</CrossLink>`

---

## Card 5 — Momentum & acceleration

**(a) Frame**
- **id:** `momentum-acceleration`
- **icon:** `Waves` (lucide) — the oscillation/ravine motif; alternative `TrendingDown`. Use `Waves`.
- **accent:** `indigo` (this is a *descent-direction* method built from gradients — indigo is the gradient/step color; reserve cyan for the curvature/Newton card so the two read as distinct).
- **anchor:** `false`.
- **source:** `"Goh, 'Why Momentum Really Works' (distill.pub, 2017); Sutskever et al. on Nesterov momentum"`
- **one-line purpose:** When you can't afford the Hessian, give the iterate **inertia** — averaging past gradients cancels the wasteful zigzag across a ravine and accelerates along it, turning GD's `(κ−1)/(κ+1)` crawl into the `(√κ−1)/(√κ+1)` sprint.

**(b) Intuition opener** — `<Intuition title="first, the picture">`
> Drop a marble into a long, narrow ravine and it doesn't zigzag wall-to-wall the way gradient descent does — it builds up speed and rolls down the length of the valley, its sideways wobble averaging out. **Momentum gives the optimizer that same inertia.** Plain GD reacts only to the gradient under its feet, so on a stretched bowl it bounces across the steep walls while barely creeping along the flat floor. Momentum keeps a running average of recent steps: the back-and-forth components cancel, the consistent down-the-valley component reinforces, and the marble rolls. The astonishing part is that this cheap fix — only gradients, no Hessian — recovers most of Newton's speedup.

**(c) Headline equations** (exact KaTeX):

Heavy-ball (Polyak) momentum:
```
<Block>{'\\dir{v_{k+1}} = \\beta\\,\\dir{v_k} - \\alpha\\,\\dir{\\nabla f(x_k)}, \\qquad x_{k+1} = x_k + \\dir{v_{k+1}}'}</Block>
```
Nesterov accelerated gradient (look-ahead form):
```
<Block>{'\\dir{v_{k+1}} = \\beta\\,\\dir{v_k} - \\alpha\\,\\dir{\\nabla f\\!\\left(x_k + \\beta\\,v_k\\right)}, \\qquad x_{k+1} = x_k + \\dir{v_{k+1}}'}</Block>
```
The payoff — accelerated vs plain rate (both for the anchor bowl, κ=12.13):
```
<Block>{'\\underbrace{\\frac{\\kappa-1}{\\kappa+1} = 0.848}_{\\text{plain GD}} \\quad\\longrightarrow\\quad \\underbrace{\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1} = 0.554}_{\\text{momentum}}'}</Block>
```

**read-as** (`<ReadEq>`): *"The velocity `v` is the gradient with memory: keep fraction `β` of last step's velocity, then nudge it by the new gradient scaled by `α`. The update is the velocity, not the raw gradient. Because consecutive gradients across a ravine point in opposite directions, the `β·v` memory cancels them; along the valley they agree and accumulate. Nesterov's twist is to *measure the gradient where the momentum is about to carry you* — a look-ahead that damps overshoot. The net effect: the slow `(κ−1)/(κ+1)` rate is replaced by `(√κ−1)/(√κ+1)` — `κ` becomes `√κ`."*

**(d) LIVE INTERACTIVE — "The marble in the ravine"**
- **What is plotted:** the **same centered demo bowl** as Card 4 (`g = ½(λ_min·u² + λ_max·v²)`, `λ_min=0.029697`, `λ_max=0.360303`, κ=12.13), same window `u∈[−12,12]`, `v∈[−4,4]`, same contour ellipses. Continuity with Card 4 is intentional — the reader recognizes the bowl.
- **Three trajectories from the shared start `(10, 1)`:**
  - **Plain GD (slate/muted):** `x_{k+1} = x_k − η∇g`, `η = η_opt = 5.1282`. Same zigzag polyline as Card 4 (factor `−0.8477` in `v`, `+0.8477` in `u`).
  - **Heavy-ball (indigo):** `v_{k+1} = β·v_k − α·∇g(x_k)`, `x_{k+1} = x_k + v_{k+1}`, with the optimal constants `α = (2/(√λ_min+√λ_max))² = 6.7015` and `β = ((√κ−1)/(√κ+1))² = 0.30679`. Verified path (round to plot): `(10,1) → (8.01,−1.415) → (5.805,1.260) → (3.973,−0.962) → (2.621,0.679) → (1.684,−0.457) → …`. It overshoots once then spirals in fast.
  - **Nesterov (fuchsia or emerald — pick emerald to stay in palette):** look-ahead form above; same `α,β`. Slightly less overshoot than heavy-ball; render as a third polyline.
- **Controls:**
  1. **Momentum slider `β`**, range `[0, 0.98]`, default `0.30679`. Live behavior: `β=0` collapses heavy-ball onto plain GD (show the two paths merging); raising `β` toward ~0.31 gives the fastest spiral; pushing `β` too high (e.g. > 0.6 with this `α`) makes it **overshoot and oscillate** — show the path ringing around the optimum and a rose "underdamped / overshooting" chip. This is the damped-oscillator story made visible.
  2. **Step-size slider `α`**, range `[0, 10]`, default `6.7015`.
  3. **Toggle "Nesterov look-ahead"** — switches the indigo path between heavy-ball and the Nesterov update so the reader sees the reduced overshoot.
  4. **Button "step once"** and **"replay"** (gated via RafGate / useReplayOnEnter on viewport entry).
  - **Live readout chips (above SVG):** "Steps to within 1% of optimum — GD: **28** · momentum: **11**" (both verified, start `(10,1)`, κ=12.13); current `β`, current `α`; per-step rate comparison `0.848 (GD) vs 0.554 (momentum)`.
- **Verified demo constants to freeze:** plain-GD rate `(κ−1)/(κ+1)=0.847706`; accelerated rate `(√κ−1)/(√κ+1)=0.553888`; heavy-ball `α=6.701496`, `β=0.306792`; Nesterov coeff (alt look-ahead form) `(√κ−1)/(√κ+1)=0.553888`; GD-steps-to-1% = 28, momentum-steps-to-1% = 11; steps-to-cut-error-10× — GD: 13.9, momentum: 3.9.

**(e) Carry-this** — `<MinSchema>`
> **Momentum trades the Hessian for memory.** By averaging past gradients it cancels the across-ravine zigzag and rolls along the valley, upgrading gradient descent's convergence rate from `(κ−1)/(κ+1)` to `(√κ−1)/(√κ+1)`. On the κ=12 anchor bowl that is **28 steps → 11**; the harder the conditioning, the bigger the win — and it costs nothing but one stored velocity vector.

**(f) Supporting elements**

- **`<Predict question="Plain GD's error shrinks by 0.848 per step on the κ=12 bowl. Momentum's by 0.554. Roughly how many fewer steps to cut the error by 10×?">`**
  reveal-body: *"Cutting error 10× needs `log(0.1)/log(rate)` steps: GD needs `log(0.1)/log(0.848) ≈ 14` steps, momentum needs `log(0.1)/log(0.554) ≈ 3.9` — about **a 3.5× speedup**. And it grows with κ: because the rate depends on `√κ` instead of `κ`, the worse-conditioned the problem, the larger the multiplier. That `κ → √κ` is the entire content of 'acceleration.'"*

- **`<Misconception wrong="More momentum (bigger β) always converges faster." right="There is an optimal β ≈ 0.307 for this bowl; below it you under-use inertia, above it the marble overshoots and rings around the minimum (underdamped), and high enough it can destabilize." because="Momentum is a damped oscillator. The optimal β critically damps the slow mode; too much turns useful inertia into oscillation. This is the same critical-vs-under-damping tradeoff you tune in a physical spring, and why learning-rate × momentum must be tuned together.">`**

- **`<Worked title="Why the zigzag cancels — gradients of opposite sign">`**
  On the demo bowl with `η_opt`, the steep `v`-coordinate of plain GD flips sign every step: `+1 → −0.848 → +0.719 → −0.609 → …` (each `v`-gradient points opposite to the last). Plain GD honors each one fully, so it bounces. Momentum forms `v_{k+1} = β·v_k − α·∇g`: the term `β·v_k` carries the *previous* (opposite-signed) step, which **partially cancels** the new across-ravine gradient — the wobble shrinks. Meanwhile the flat `u`-gradient keeps the same sign every step (`u: 10 → 8.477 → 7.186 → …`, all positive gradient), so `β·v_k` **reinforces** it — momentum accumulates speed down the valley. Cancel the noise, compound the signal: that is momentum in one sentence.

- **`<Deeper title="Momentum as a damped oscillator, and the ODE connection">`**
  - **Formalism:** the heavy-ball recursion is a discretization of the second-order ODE `ẍ + γẋ + ∇f(x) = 0` — a *mass on a spring with friction*. The gradient `∇f` is the restoring force pulling toward the minimum; `γ` (set by `β`) is the friction. Too little friction → the mass oscillates forever (overshoot); too much → it crawls (back to over-damped GD); **critical damping** is the sweet spot where it settles fastest, and `β = ((√κ−1)/(√κ+1))² ≈ 0.307` is exactly the critical-damping choice for the slow mode of the κ=12 bowl. Compare plain GD, which discretizes the *first*-order gradient-flow ODE `ẋ = −∇f` (no inertia term) — see the gradient-descent card's Deeper fold.
  - **Why / tradeoff:** Nesterov's `(√κ−1)/(√κ+1)` rate is provably **optimal** for any first-order method on smooth strongly-convex functions (it matches the lower bound) — you cannot do better using only gradients, which is why "accelerated gradient" is a named milestone. Tradeoffs: momentum introduces a second hyperparameter (`β`) coupled to the step size; on noisy/stochastic gradients the inertia can amplify noise unless damped — which is one motivation for Adam's adaptive, per-coordinate version. And acceleration assumes (strong) convexity; on non-convex landscapes momentum still helps roll through small bumps and saddles but the clean rate guarantee is gone.

- **`<QA items={[ ... ]}/>`**
  - `q:` "How does this relate to Adam and the optimizers I actually use?" `a:` "Adam = momentum (a running average of gradients, the `β₁` term) **plus** a cheap per-coordinate curvature estimate (a running average of squared gradients, the `β₂` term that rescales each axis like a diagonal `H⁻¹`). So Adam is momentum and a stripped-down Newton bolted together. See the SGD/Adam card."
  - `q:` "Heavy-ball vs Nesterov — does the difference matter in practice?" `a:` "Both hit the same `(√κ−1)/(√κ+1)` order. Nesterov's look-ahead (sampling the gradient where momentum is about to land) damps overshoot and has cleaner worst-case guarantees; on smooth convex problems it is usually the better default. On noisy deep-learning gradients the distinction blurs and 'momentum' usually means the heavy-ball-ish form."
  - `q:` "If momentum is nearly as fast and far cheaper than Newton, why ever use Newton?" `a:` "Momentum only recovers the `√κ` rate; Newton (when affordable) gets *quadratic* convergence — digits doubling — independent of κ. For small or medium problems where the Hessian is cheap, Newton wins outright. Momentum is what you reach for when n is huge."

- **Glossary `<Term>` entries (add to GLOSS):**
  - **momentum / heavy-ball** — "an update that keeps a velocity `v` — a decaying average of past gradients — so the iterate has inertia: `v ← βv − α∇f`, `x ← x + v`."
  - **Nesterov acceleration** — "momentum that evaluates the gradient at the look-ahead point `x + βv` rather than at `x`; provably optimal first-order rate `(√κ−1)/(√κ+1)`."
  - **ravine / ill-conditioned valley** — "a region where the surface curves far more steeply in one direction than another (large κ); plain gradient descent zigzags across it."
  - **critical damping** — "the friction setting at which an oscillator returns to rest fastest without overshooting; the optimal momentum `β` is the critical-damping choice for the slowest mode."

- **CrossLinks:**
  - `<CrossLink to="curvature-newton" recap="Newton fixes anisotropy exactly with H⁻¹; momentum approximates the same fix using only gradients.">back to curvature & Newton</CrossLink>`
  - `<CrossLink to="gradient-descent-step-size" recap="Momentum adds an inertia term to the plain x ← x − η∇f update.">back to gradient descent & step size</CrossLink>`
  - `<CrossLink to="odes" recap="Heavy-ball momentum discretizes the damped-oscillator ODE ẍ + γẋ + ∇f = 0; plain GD discretizes ẋ = −∇f.">odes · the damped-oscillator analogy</CrossLink>`
  - `<CrossLink to="stochastic-sgd" recap="Adam = momentum (running mean of gradients) + a diagonal curvature estimate (running mean of squared gradients).">forward to stochastic optimization & Adam</CrossLink>`

### Verified constants — newton-momentum
## Verified constants — Curvature & Acceleration cluster (Cards 4-5)

All produced by hand-rolled Node (no solver libs), adversarially recomputed.

### Anchor Q and its spectrum (exact, full precision)
| Constant | Value (use this) | Display |
|---|---|---|
| `det Q` | 0.0107 | 0.0107 |
| `lambda_min` | 0.029697247451834607 | 0.029697 |
| `lambda_max` | 0.3603027525481654 | 0.360303 |
| `kappa` | 12.132530233063973 | 12.13 / 12.1325 |
| `sqrt(kappa)` | 3.4831781799190193 | 3.4832 / 3.483 |
| `Q^{-1}` | `[[33.64485981, -0.93457944],[-0.93457944, 2.80373832]]` | [[33.6449,-0.9346],[-0.9346,2.8037]] |
| `x* = Q^{-1}a`, a=(9,7) | (296.2616822, 11.2149533) | (296.26, 11.21) |
| green beans at x* | 366.72897196 kg (vs G=27) — INFEASIBLE | 366.7 |

Newton on the anchor quadratic lands on `x*` in EXACTLY one step from ANY start (verified algebraically and numerically).

### Demo bowl convergence (g = ½(λ_min u² + λ_max v²), start (10,1))
| Constant | Verified value | Display |
|---|---|---|
| `eta_opt = 2/(λ_min+λ_max)` | 5.128205128 | 5.1282 |
| `eta_max = 2/λ_max` (GD diverges for eta > this) | 5.550887374 | 5.5509 |
| GD error rate `(κ-1)/(κ+1)` | 0.8477064233 | 0.8477 |
| GD objective-gap rate `[(κ-1)/(κ+1)]²` | 0.7186061801 | 0.7186 |
| steep factor `1-eta_opt·λ_max` | -0.8477064233 (sign-flip zigzag) | -0.8477 |
| flat factor `1-eta_opt·λ_min` | +0.8477064233 (monotone) | +0.8477 |
| accelerated rate `(√κ-1)/(√κ+1)` | 0.5538879073 | 0.5539 |
| heavy-ball `alpha = (2/(√λ_min+√λ_max))²` | 6.701496481 | 6.7015 |
| heavy-ball `beta = ((√κ-1)/(√κ+1))²` | 0.3067918138 | 0.30679 |
| contour axis ratio `√κ` | 3.4831781799 | 3.483 |

GD divergence note: **GD diverges for eta > eta_max = 5.5509** (verified; |1-eta·λ_max|>1 there).

### Step counts (start (10,1), 1%-of-initial-distance criterion)
| Quantity | Verified |
|---|---|
| GD steps to within 1% (eta_opt) | **28** |
| Heavy-ball steps to within 1% | **11** |
| Steps to cut error 10x — GD `log0.1/log0.8477` | 13.94 (~14) |
| Steps to cut error 10x — momentum `log0.1/log0.5539` | 3.90 (~3.9) |

### Verified demo paths (round to plot)
- GD (eta_opt): (10,1) → (8.477,-0.848) → (7.186,0.719) → (6.092,-0.609) → (5.164,0.516) → (4.378,-0.438)
- Heavy-ball: (10,1) → (8.010,-1.415) → (5.805,1.260) → (3.973,-0.962) → (2.621,0.679) → (1.684,-0.457)
- Newton: (10,1) → (0,0) in one step (exact)
- Round bowl κ=1: GD with eta_opt=1/L reaches (0,0) in one step (factor 1-eta·L = 0), same as Newton.

### Rosenbrock f=(1-x)²+100(y-x²)² (separate illustrative function)
| Quantity | Verified |
|---|---|
| global min | (1,1), f=0, grad=(0,0) |
| Hessian at (1,1) | [[802,-400],[-400,200]] |
| eigenvalues | 1001.6006, 0.3994 |
| kappa | 2508.01 (~2508) |
| **Pure Newton iters from (-1.2,1)** | **~6** (5-6 by tolerance) — NOT 8 |
| Modified/line-search Newton | ~8 (spec's '~8' fits the safeguarded variant it describes) |
| Plain GD (eta=2e-3) to dist<1e-3 of (1,1) | **8500** (exact for this criterion; tol-sensitive: 1e-2→5624, 1e-4→11381) |

### Newton cost
- Solve `H·Δ = -∇f`: **O(n³)** (dense Cholesky/LU); store H: **O(n²)**. Confirmed.

### One wording fix for the builder
- **Rosenbrock Newton iteration count:** the spec's '~8 iterations' is correct ONLY for a safeguarded/line-search/trust-region Newton (which the Deeper-fold text does invoke via 'with the modifications above'). Pure undamped Newton converges in **~6**. If the callout means plain Newton, change '~8' to '~6'; if it means modified Newton, the '~8' stands but should keep the 'with the modifications' qualifier explicit.


---

## Cluster: convexity-optimality-subgrad — cards 6 (Convexity — the watershed), 7 (Optimality conditions), 8 (Non-smooth & subgradients)
_verification: ALL CONFIRMED_

# Cards 6–8 build-ready spec — Optimization explainer

Verified-in-Node constants used below (freeze at module scope alongside the anchor register):
- `Q = [[0.03,0.01],[0.01,0.36]]`, `det Q = 0.0107`, `λ_min = 0.0296972`, `λ_max = 0.3603028`, `κ(Q) = 12.1325`.
- Hessian of `profit` = `−Q`, eigenvalues `(−0.3603, −0.0297)` → strictly **concave**. Minimizing `−profit` has Hessian `+Q` (SPD) → strictly **convex**.
- Soft-threshold `prox_{t|·|}(v)=sign(v)·max(|v|−t,0)`: `prox₁(3)=2`, `prox₁(0.4)=0`, `prox₁(−2.5)=−1.5`, `prox₂(5)=3`, `prox₀.₅(1.2)=0.7`.
- Concave-constrained optimum `(16.3636, 7.2727)`, `profit=183.4545`, `∇f=(8.4364,4.2182)`, `μ_roaster=42.1818`, roaster binds (=4), beans slack 0.0909, labor slack 1.2727.

---

## Card 6 — Convexity: the great watershed ★

**(a) Header.** `id="convexity"`, icon `Layers` (lucide), `accent="indigo"`, `anchor={true}` (secondary anchor), `index={6}`, `source="Boyd & Vandenberghe §2–3"`, `title="Convexity — the great watershed"`, `subtitle="the one property that decides easy vs. research-problem"`.
One-line purpose: establish convex set + convex function (chord-above-graph / Jensen), the calculus that preserves convexity, and the punchline **local minimum = global minimum**.

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> Tip marbles onto two surfaces. The first is a single smooth bowl: wherever a marble lands, it rolls to the *same* bottom — there is nowhere else to go. The second is an egg-carton of dips and ridges: where it settles depends entirely on where you dropped it. **Convexity is exactly the property that makes the first picture true** — every local low point is *the* low point. It is the watershed that splits optimization into "press solve and trust the answer" and "press solve and pray."

**(c) Headline equations + read-as.**
- Convex set (`<Block>`): `\dir{x},\dir{y}\in C \;\Rightarrow\; \theta\dir{x}+(1-\theta)\dir{y}\in C,\quad \forall\,\theta\in[0,1]`
- Convex function / chord test (`<Block>`): `\obj{f}\!\left(\theta x+(1-\theta)y\right)\;\le\;\theta\,\obj{f}(x)+(1-\theta)\,\obj{f}(y)`
- Second-order test inline (`<Eq>`): `\nabla^2 \obj{f}(x)\succeq 0` (Hessian PSD everywhere).

`<ReadEq>` for the chord inequality: "Pick any two points on the graph and stretch a straight line between them. For a convex function the *curve never pokes above that chord* — the function value at a blended input (`θx+(1−θ)y`) is at most the same blend of the two output heights. The gap between chord and curve is how convex it is."

**(d) LIVE INTERACTIVE — "The chord test."**
- **Plot.** One SVG, `f(x)=x²` drawn over `x∈[−2, 4]`, `y∈[0, 13]`. Axes labeled. Curve in emerald (`\obj`).
- **Fixed endpoints** `A=(−1.5, 2.25)` and `B=(3.5, 12.25)`; draw the chord `A→B` as a dashed indigo line.
- **Control 1 — `θ` slider** `[0,1]`, step `0.01`, default `0.5`. A vertical drop-line at `x(θ)=θ·(−1.5)+(1−θ)·3.5` shows two dots: the **curve point** `(x, x²)` (emerald) and the **chord point** `(x, θ·2.25+(1−θ)·12.25)` (indigo). A vertical amber bracket between them is the **convexity gap**, with a live `<Stat label="gap" value=… sub="chord − curve" color="amber"/>`. Verified gaps: `θ=0.25→4.688`, `θ=0.5→6.250`, `θ=0.75→4.688`, endpoints `→0`.
- **Control 2 — function toggle** (segmented): `x²` (convex) · `−x²` (concave, chord *below*) · `0.4·sin(2x)+0.15x²` (non-convex — chord crosses curve, some θ give negative gap). The gap stat turns **rose** and flips sign label to "chord BELOW curve → not convex here" whenever gap `<0`.
- **Control 3 — "draw a random chord" button**: picks two random x in range, redraws A/B, re-runs. On the non-convex setting it will sometimes land a chord that dips below → visually proves the failure.
- Everything computed live in JS (`f`, chord interpolation, gap). Gate with `RafGate`; no autoplay needed (static until user drags), but `useReplayOnEnter` resets `θ=0.5` and function`=x²` when scrolled into view.

**(e) Carry-this** (`<MinSchema>`): "**Convex = chord never dips below the curve.** The payoff is one line: on a convex function over a convex set, *any* point where you can't go lower is the global minimum. No restarts, no luck."

**(f) Supporting blocks.**

- **`<Predict question="On a strictly convex function, how many local minima can there be?">`** reveal: "**Exactly one** (if a minimizer exists). Strict convexity rules out flat valleys and multiple basins — the bottom is a single point. Our minimization anchor (`−profit`, Hessian `+Q` SPD) is strictly convex, so its constrained optimum is unique."

- **`<Misconception wrong="A bowl-shaped-looking loss curve means my problem is convex." right="Looks are not a proof; the chord/Hessian test is. A neural-net loss can look smooth in a 1-D slice and still be wildly non-convex in full dimension." because="Convexity is a global statement over all pairs of points (or ∇²f⪰0 everywhere). A single 1-D cross-section can hide saddles and extra basins living in the other directions." />`**

- **`<Deeper title="The calculus of convexity — why it composes">`**
  Operations that **preserve** convexity (state as a list, with the anchor tie-in):
  1. Nonnegative weighted sum: `α f + β g` convex for `α,β ≥ 0`.
  2. Pointwise **max** of convex functions is convex (verified: `max(x², (x−2)²)` stays convex; the `min` does **not** — at `x=0` min`=0`, at `x=1` min`=1`, at `x=2` min`=0`, a non-convex dip).
  3. Affine precomposition: `f(Ax+b)` convex if `f` convex.
  4. Composition `h(g(x))` convex if `h` convex & nondecreasing and `g` convex.
  Why it matters paragraph: "These rules are the reason you can *build* convex problems with confidence. The roastery cost `−profit(x)=½xᵀQx − aᵀx` is convex because `Q` is SPD (sum of a convex quadratic and an affine term); the resource walls are affine, hence convex constraints; their intersection — the feasible polygon — is a convex set (intersection of half-spaces). So the whole constrained problem is convex, which is *why* every method in this explainer lands on the same point. The tradeoff: insisting on convexity buys you a global guarantee but costs modeling freedom — fixed setup costs or 'run-this-line-or-not' switches (Card 13) shatter convexity and you pay in NP-hardness."
  Second-order fact: a twice-differentiable `f` is convex **iff** `∇²f(x)⪰0` for all `x`; **strictly** convex if `∇²f≻0`.

- **`<Worked title="Is the roastery's cost convex?">`** "We minimize `−profit`. Its Hessian is the constant matrix `Q=[[0.03,0.01],[0.01,0.36]]`. Check PSD: leading minor `Q₁₁=0.03>0` and `det Q = 0.03·0.36 − 0.01² = 0.0107 > 0`, so `Q≻0` (both eigenvalues `0.0297` and `0.3603` positive). Hessian positive **definite** everywhere ⇒ `−profit` is **strictly convex** ⇒ the constrained optimum is unique. The original `profit` (Hessian `−Q`, eigenvalues both negative) is strictly **concave** — maximizing it is the same easy problem mirror-imaged."

- **`<QA items=[…]>`**:
  - q: "Convex set vs convex function — what's the difference?" a: "A convex *set* contains the whole segment between any two of its members (no dents, no holes). A convex *function* has its region-above-the-graph (epigraph) be a convex set. The feasible region is a set question; the objective is a function question; you need both for an easy problem."
  - q: "Is the feasible region of the roastery convex?" a: "Yes. Each resource limit `aᵀx ≤ b` is a half-plane (convex); `x≥0` are half-planes; the feasible polygon is their intersection, and intersections of convex sets are convex."
  - q: "Why do we keep saying 'local = global'?" a: "On a convex function over a convex set, if no nearby direction lowers `f`, then *no* direction anywhere does — convexity forbids a lower point existing elsewhere. That's the entire reason gradient descent's stopping point can be trusted."

- **Glossary `<Term>`s (add to GLOSS):**
  - *convex set*: "a set where the straight segment joining any two members lies entirely inside it."
  - *epigraph*: "the set of points on or above a function's graph; `f` is convex iff its epigraph is a convex set."
  - *Jensen's inequality*: "f(blend of inputs) ≤ blend of f-values, for convex f — the chord-above-graph statement, generalized to averages and expectations."
  - *strictly convex*: "convex with the chord strictly above the curve between distinct points ⇒ at most one minimizer."

- **CrossLinks:**
  - `<CrossLink to="optimality" recap="convexity is what upgrades ∇f=0 from 'flat' to 'global best'">next: when is flat actually the bottom?</CrossLink>`
  - `<CrossLink to="gradient-descent" recap="GD's stopping point is trustworthy only because the bowl is convex">why GD can be trusted here</CrossLink>`
  - `<CrossLink to="non-convexity" recap="drop convexity and one bowl becomes an egg-carton of basins">the egg-carton world (non-convex)</CrossLink>`

---

## Card 7 — Optimality conditions

**(a) Header.** `id="optimality"`, icon `Crosshair` (lucide), `accent="cyan"`, `anchor={false}`, `index={7}`, `source="Nocedal & Wright §2"`, `title="Am I at the bottom?"`, `subtitle="first-order flatness, second-order curvature, and the saddle trap"`.
One-line purpose: `∇f=0` (stationarity) is necessary but not sufficient; the **Hessian's eigenvalues** decide min vs max vs saddle; "flat" alone is a trap.

**(b) Intuition opener:**
> A ball sitting still tells you the ground is **flat underfoot** — `∇f=0` — but flat is not the same as lowest. You could be at the bottom of a bowl, the top of a dome, or straddling a mountain pass that falls away on one side while it climbs on the other. To tell them apart you must feel the *curvature* in every direction: bowl-up everywhere is a minimum, bowl-down everywhere a maximum, and **mixed** is the famous saddle — the point that dominates high-dimensional landscapes and fools naive descent.

**(c) Headline equations + read-as.**
- First-order necessary (`<Block>`): `\nabla \obj{f}(x^\star)=0` — *stationarity*.
- Second-order sufficient (`<Block>`): `\nabla \obj{f}(x^\star)=0 \;\text{and}\; \nabla^2\obj{f}(x^\star)\succ 0 \;\Rightarrow\; x^\star \text{ is a strict local minimum}`
- Classification rule (inline `<Eq>`): eigenvalues of `\nabla^2\obj{f}` all `>0` ⇒ min; all `<0` ⇒ max; **mixed signs** ⇒ saddle; a zero eigenvalue ⇒ test inconclusive.

`<ReadEq>`: "Set the gradient to zero to find every *candidate* — the flat spots. Then read the Hessian's eigenvalues like a curvature report card: all positive means the surface curves up in every direction (a true minimum); a single negative eigenvalue means there's an escape route downhill (a saddle or maximum), so the flat spot is a fake bottom."

**(d) LIVE INTERACTIVE — "Probe the critical point."**
- **Plot.** A single contour plot over `(x,y)∈[−2,2]×[−2,2]` of a selectable surface, with critical point marked at the origin. Contours emerald; gradient arrow (indigo) drawn at a draggable probe point; downhill direction shown.
- **Control 1 — surface toggle** (segmented), each with its true Hessian shown live as a 2×2 matrix and its eigenvalues:
  - `f=x²+y²` → Hessian `[[2,0],[0,2]]`, eig `(2,2)` → **MINIMUM** badge (emerald).
  - `f=x²−y²` → Hessian `[[2,0],[0,−2]]`, eig `(2,−2)` → **SADDLE** badge (rose). Contours are hyperbolic.
  - `f=−(x²+y²)` → Hessian `[[−2,0],[0,−2]]`, eig `(−2,−2)` → **MAXIMUM** badge (amber).
  - `f=x²` (trough) → Hessian `[[2,0],[0,0]]`, eig `(2,0)` → **INCONCLUSIVE** badge (slate): a flat valley, PSD with a zero eigenvalue.
- **Control 2 — "drop a marble" button**: spawns a marble at a random point and animates **gradient descent** `x ← x − 0.08·∇f`, 60 steps. On the bowl it converges to origin; on the saddle it slides off to `±∞` along the `−y²` axis (escapes), making the saddle viscerally not-a-min; on the dome it diverges. Trajectory drawn as a fading polyline. Gate to viewport (`RafGate`), replay on entry.
- **Control 3 — "direction dial"** (angle slider `0–360°`): draws a unit direction `d`; shows the **directional second derivative** `dᵀ∇²f d` live as a `<Stat>`. On the saddle, rotating the dial flips this number positive↔negative, literally pointing out the uphill vs downhill axes (e.g. `d=(1,0)→ +2`, `d=(0,1)→ −2`).
- All Hessians constant here, eigenvalues precomputed per surface; descent integrated live in JS.

**(e) Carry-this** (`<MinSchema>`): "**Flat is necessary, not sufficient.** `∇f=0` only finds candidates; the Hessian's eigenvalues convict. All-positive = minimum, any-negative = there's a way down (saddle or max). In high dimensions saddles vastly outnumber minima — flatness alone is a trap."

**(f) Supporting blocks.**

- **`<Predict question="In a 50-dimensional landscape, a randomly found stationary point is most likely a…">`** reveal: "**Saddle.** For a random point to be a minimum *all* 50 Hessian eigenvalues must be positive; one negative eigenvalue makes it a saddle. As dimension grows, the odds of all-same-sign collapse, so saddles dominate. This is exactly why SGD's noise (Card 17) earns its keep — it jiggles training out of saddles."

- **`<Misconception wrong="Gradient descent gets stuck at saddle points." right="Plain GD slows to a near-crawl near a saddle but generically slides off the unstable direction eventually; what truly stalls it is a near-zero gradient region or a genuine local min." because="A saddle has a strictly-downhill escape direction (the negative-eigenvalue axis). Any tiny component along it grows; the danger is the long plateau where ∇f≈0 makes the steps microscopic, not permanent capture." />`**

- **`<Deeper title="Convex shortcut, and what the test misses">`** "On a **convex** function the second-order test is free: `∇²f⪰0` everywhere by definition, so the *only* candidates are minima — `∇f=0` alone certifies a global optimum (this is the bridge back to Card 6). Off the convex menu, `∇f=0` plus `∇²f≻0` is only **sufficient and local**: it certifies a strict local min but says nothing global. The boundary case — a zero eigenvalue (`∇²f⪰0` but not `≻0`, e.g. `f=x²` along `y`, or `f=x⁴` whose Hessian vanishes at 0) — is genuinely *inconclusive*; you must look at higher-order terms. Tradeoff for practitioners: computing a full Hessian is `O(n²)` storage and `O(n³)` to eigendecompose, infeasible for million-parameter models — which is why training relies on *first-order* signals plus stochastic noise rather than literal eigenvalue checks."

- **`<Worked title="Classify the saddle f = x² − y²">`** "Gradient `∇f=(2x, −2y)`; setting it to zero gives the single critical point `(0,0)`. Hessian `[[2,0],[0,−2]]` is constant; eigenvalues `+2` and `−2`. Mixed signs ⇒ **saddle**. Concretely: walk along `x` (direction `(1,0)`) and `f` curves up (`dᵀHd=+2`); walk along `y` (`(0,1)`) and it curves down (`−2`). Flat at the origin, yet not a min and not a max."

- **`<QA items=[…]>`:**
  - q: "Why isn't `∇f=0` enough?" a: "It's satisfied by minima, maxima, *and* saddles alike — all the flat spots. You need curvature (the Hessian) to tell which kind."
  - q: "What does a PSD-but-not-PD Hessian mean?" a: "A zero eigenvalue: the surface is flat along at least one direction. The second-order test is inconclusive — could be a min (`x²` along y), or could hide a higher-order saddle. You must inspect further."

- **Glossary `<Term>`s:**
  - *stationary point*: "a point where the gradient vanishes — a flat spot; could be a min, max, or saddle."
  - *Hessian*: "the matrix of second partial derivatives ∇²f; its eigenvalues encode curvature in each principal direction."
  - *saddle point*: "a stationary point that curves up in some directions and down in others — neither a min nor a max."
  - *positive definite (≻0)*: "all eigenvalues strictly positive; the surface curves strictly up in every direction."

- **CrossLinks:**
  - `<CrossLink to="convexity" recap="convexity makes ∇f=0 sufficient — no Hessian check needed">why convexity makes this test free</CrossLink>`
  - `<CrossLink to="newton" recap="Newton uses the same Hessian to jump to the model's min — but blindly steps toward saddles too">Newton uses this Hessian</CrossLink>`
  - `<CrossLink to="non-convexity" recap="saddles dominate high-D landscapes; this is where the trap bites">saddles in real loss landscapes</CrossLink>`

---

## Card 8 — Non-smooth & subgradients

**(a) Header.** `id="subgradients"`, icon `Spline` (lucide; alt `CornerDownRight`), `accent="indigo"`, `anchor={false}`, `index={8}`, `source="Boyd EE364a; Beck & Teboulle (ISTA)"`, `title="When the gradient has a kink"`, `subtitle="subgradients, the L1 corner, and the prox step that yields sparsity"`.
One-line purpose: at kinks (`|x|`, ReLU, hinge) the gradient doesn't exist; the **subdifferential** is a *set* of valid slopes; the L1 ball's corners drive coordinates to exactly zero (sparsity), and the **soft-threshold prox** is the workhorse step that does it.

**(b) Intuition opener:**
> Many of the most useful objectives have **corners** — the absolute value `|x|`, the ReLU `max(0,x)`, the hinge loss of an SVM. At a corner there is no single tangent line, so the gradient is undefined. The fix is generous, not restrictive: instead of one slope, allow the *whole fan* of lines that stay below the function — the **subdifferential**. Those corners are not a nuisance to smooth away; they are the feature. The corner of the L1 penalty is precisely what snaps weak coefficients to **exactly zero**, which is how Lasso does feature selection.

**(c) Headline equations + read-as.**
- Subdifferential of `|x|` (`<Block>`): `\partial |x| = \begin{cases} \{+1\} & x>0 \\ [-1,\,1] & x=0 \\ \{-1\} & x<0\end{cases}`
- Subgradient inequality / definition (`<Block>`): `g\in\partial \obj{f}(x_0)\iff \obj{f}(x)\ge \obj{f}(x_0)+g^{\top}(x-x_0)\ \ \forall x`
- Soft-threshold prox (`<Block>`): `\operatorname{prox}_{t|\cdot|}(v)=\operatorname{sign}(v)\,\max(|v|-t,\,0)`

`<ReadEq>` for the subgradient inequality: "A subgradient `g` is any slope whose tangent line at `x₀` stays *under* the whole convex function — a global supporting line. At a smooth point there's exactly one such slope (the gradient). At a kink there's a whole interval of them; for `|x|` at zero, any slope from `−1` to `+1` works. Optimality becomes `0 ∈ ∂f` — zero is an admissible slope, i.e. *some* supporting line is flat."

**(d) LIVE INTERACTIVE — "The L1 corner makes things sparse" (two linked panels).**
- **Panel A — the kink & its subgradient fan.** Plot `f(x)=|x|` over `x∈[−2,2]`. A draggable probe `x₀` slider. At `x₀≠0` draw the single tangent (slope ±1). At `x₀=0` (snap zone `|x₀|<0.05`) draw a **fan of supporting lines** sweeping slopes `−1…+1` (indigo, low opacity), with a live `<Stat label="∂|x| at 0" value="[−1, 1]" color="indigo"/>`. This makes "a set of slopes" literal.
- **Panel B — ball geometry → sparsity.** A 2-D plot over `[−1.5,1.5]²`. Draw the **L1 ball** `|x₁|+|x₂|≤τ` (diamond, vertices `(±τ,0),(0,±τ)`) OR the **L2 ball** `‖x‖₂≤τ` (circle), toggled. Draw concentric elliptical objective contours of `‖x−b‖²` centered at the unconstrained target `b=(2.2, 0.6)` (outside the ball). Animate the contour *shrinking* until it first touches the ball; mark the touch point.
  - **Verified outcome:** with `τ=1`, the **L1** (diamond) solution is `(1, 0)` — a **corner, x₂ snapped to exactly 0** (sparse). The **L2** (disk) solution is `(0.9648, 0.2631)` — touches a smooth face, **both coordinates nonzero**. Display the solved point with a `<Stat>` and a "sparse!" amber chip when any coordinate is `0`.
- **Control — `τ` slider** `[0.3, 1.4]`, step `0.05`, default `1.0`: shrinks/grows the ball; with L1 the solution stays pinned to the `x₁`-axis corner across a wide `τ` range (sparsity is *robust*, not a knife-edge), then transitions — narrate via the chip.
- **Control — ball toggle** L1 ⟷ L2 (the headline comparison).
- L1-ball projection computed live via the Duchi et al. simplex-projection routine; L2 by simple radial scaling. Both verified above. `RafGate` + replay-on-enter (resets to L1, `τ=1`, re-runs the shrink animation).

**(e) Carry-this** (`<MinSchema>`): "**A corner is a set of slopes, and that's a feature.** At a kink the gradient becomes the subdifferential — an interval of supporting slopes — and optimality is `0∈∂f`. The L1 corner is what forces coordinates to *exactly* zero; the soft-threshold `sign(v)·max(|v|−t,0)` is the one-line operator that performs the shrink."

**(f) Supporting blocks.**

- **`<Predict question="Lasso (L1) and ridge (L2) both shrink coefficients. Which produces exactly-zero coefficients?">`** reveal: "**L1 (Lasso).** Its constraint ball is a diamond whose sharp corners sit *on the axes* — the objective contour almost always first touches a corner, zeroing a coordinate. The L2 ball is a smooth sphere: contours touch a face, shrinking every coefficient but zeroing none. In our demo (`b=(2.2,0.6)`, `τ=1`): L1 → `(1, 0)` (x₂ exactly 0); L2 → `(0.965, 0.263)` (both alive)."

- **`<Misconception wrong="A non-differentiable objective like |x| can't be optimized by gradient methods." right="It can — you use any subgradient, or better, a proximal/projected step that handles the kink in closed form." because="The subdifferential supplies a valid descent direction everywhere, and the prox operator solves the non-smooth piece exactly each iteration. ISTA = a smooth gradient step followed by a soft-threshold; it converges fine despite the kink." />`**

- **`<Deeper title="Proximal-gradient (ISTA) — why the kink is solved, not fought">`** "Split `min f(x)+g(x)` into smooth `f` (gradient step) plus non-smooth `g` (handled by its prox). The proximal-gradient / ISTA iteration is `x⁺ = prox_{t·g}(x − t∇f(x))`. For `g=λ‖x‖₁` the prox is **coordinate-wise soft-thresholding**, `prox_{tλ|·|}(v)=sign(v)max(|v|−tλ,0)` — verified `prox₂(5)=3`, `prox₀.₅(1.2)=0.7`. It is a *shrink-toward-zero, then clamp* operation: anything within `t λ` of zero is killed outright, which is the engine of sparsity. The economic/tradeoff read: the threshold `t λ` is a toll — coefficients must 'pay' it to stay nonzero, so only features earning more than the toll survive. Larger `λ` → higher toll → sparser model, at the cost of bias. Why not just smooth the kink (use `√(x²+ε)`)? You'd restore differentiability but **lose exact zeros** — coefficients hover near but never *at* zero, defeating feature selection. The corner is doing real work."

- **`<Worked title="One ISTA step on a 1-D lasso">`** "Minimize `½(x−3)² + 1·|x|`. Smooth part gradient at `x`: `(x−3)`. Take step `t=1` from `x=0`: gradient step gives `x − t(x−3) = 0 − (0−3) = 3`. Apply prox: `prox₁(3)=sign(3)·max(|3|−1,0)=2`. So `x=2` — and it's the exact minimizer (subsequent steps don't move). Compare the smooth-only minimizer `x=3`: the L1 toll of `1` has pulled it down by exactly `t λ = 1`. Had the target been `0.4`, the prox would return `0` — shrunk all the way to sparse."

- **`<QA items=[…]>`:**
  - q: "What's the subgradient at a smooth point?" a: "Just the ordinary gradient — the subdifferential is the singleton `{∇f}`. Subgradients only fan out at kinks."
  - q: "Why does L1 zero things but L2 doesn't?" a: "Geometry of the constraint ball. L1's diamond has corners on the axes (a coordinate is zero there); contours touch corners first. L2's sphere is smooth — no corners, no exact zeros."
  - q: "Is `0∈∂f(x)` the optimality condition?" a: "Yes — the non-smooth generalization of `∇f=0`. It says some supporting line at `x` is flat, so no direction strictly lowers `f`. For convex `f` it certifies a global minimum."

- **Glossary `<Term>`s:**
  - *subgradient*: "any slope g whose supporting line at x₀ stays below the whole convex function: f(x) ≥ f(x₀)+gᵀ(x−x₀)."
  - *subdifferential*: "the set of all subgradients at a point; a single number at smooth points, an interval at kinks (∂|x| at 0 = [−1,1])."
  - *proximal operator*: "prox_{t·g}(v) = argmin_x [ g(x) + (1/2t)‖x−v‖² ] — a regularized step that solves the non-smooth piece exactly; for g=|·| it's soft-thresholding."
  - *soft-thresholding*: "sign(v)·max(|v|−t,0) — shrink v toward zero by t and clamp small values to exactly zero; the prox of the L1 norm."
  - *Lasso*: "least-squares with an L1 penalty; its corner geometry yields sparse (many-zero) solutions."

- **CrossLinks:**
  - `<CrossLink to="optimality" recap="0∈∂f generalizes ∇f=0 to corners">the smooth version of this test</CrossLink>`
  - `<CrossLink to="gradient-descent" recap="ISTA = a gradient step then a soft-threshold; same descent idea, kink handled">proximal step = GD + a clamp</CrossLink>`
  - `<CrossLink to="convexity" recap="subgradients exist and certify global optima only because |x| is convex">why subgradients certify the global min</CrossLink>`
  - `<CrossLink to="machine-learning" recap="L1 sparsity is feature selection; the corner does the work">where sparsity shows up: Lasso & feature selection</CrossLink>` (sibling-slug cross-link)

---

### Cross-cluster note for the builder
These three cards form the "Am I at the bottom?" arc: Card 6 supplies the *guarantee* (convex ⇒ local=global), Card 7 supplies the *test* (∇f=0 + Hessian eigenvalues, with the saddle caveat), Card 8 *extends the test to corners* (0∈∂f, prox). Keep the color discipline: emerald objective surfaces, indigo gradients/subgradient fans, amber for the convexity-gap bracket and constraint balls / sparsity chips, rose for non-convex/saddle failure states, cyan reserved for the Hessian/curvature framing in Card 7.

### Verified constants — convexity-optimality-subgrad
## Verified constants — Cards 6-8 (Convexity / Optimality / Subgradients)

All values below independently recomputed in hand-rolled Node (no solver libs). Every claim confirmed as-is; nothing required correction.

### Q matrix & spectrum (anchor-consistent)
- `Q = [[0.03, 0.01],[0.01, 0.36]]`
- `det Q = 0.0107` (= 0.03·0.36 − 0.01² = 0.0108 − 0.0001)
- `λ_min = 0.0296972`, `λ_max = 0.3603028` (full precision 0.02969724745, 0.3603027525)
- `κ(Q) = 12.1325` (12.13253023)
- Hessian of `profit = −Q`: eigenvalues `(−0.3603028, −0.0296972)`, both **negative → strictly concave**
- Hessian of `−profit = Q`: eigenvalues `(0.0296972, 0.3603028)`, both **positive → strictly convex (SPD)**
- PSD/PD check: leading minor `Q₁₁ = 0.03 > 0`, `det Q = 0.0107 > 0`

### Roastery solutions (match frozen anchor register)
- Unconstrained concave max `x* = Q⁻¹a = (296.2617, 11.2150)` — **infeasible** (beans needed 366.73, overage 339.73 vs limit 27)
- Concave-constrained optimum `(16.3636, 7.2727)` = exact `(180/11, 80/11)`
- Profit at optimum = **183.4545** (exact 183.4545455; rounding the input to 4 dp gives 183.4541 — use the exact value)
- `∇profit at optimum = (8.4364, 4.2182)`
- `μ_roaster = 42.1818` (consistent from BOTH gradient components: 8.4364/0.2 and 4.2182/0.1)
- Roaster usage `0.2·x₁ + 0.1·x₂ = 4.0` exactly (binding)
- Beans slack = `27 − 26.9091 = 0.0909`
- Labor usage = `2.7273`, slack = `1.2727`

### Soft-threshold / prox (`prox_{t|·|}(v) = sign(v)·max(|v|−t, 0)`)
- `prox₁(3) = 2`, `prox₁(0.4) = 0`, `prox₁(−2.5) = −1.5`, `prox₂(5) = 3`, `prox₀.₅(1.2) = 0.7`

### Jensen chord demo — `f(x)=x²`, `A=(−1.5, 2.25)`, `B=(3.5, 12.25)`
NOTE the parametrization: `x(θ) = θ·A_x + (1−θ)·B_x`, `chord(θ) = θ·A_y + (1−θ)·B_y`.
- `θ=0.5`: x=1.0, f=1.0, chord=7.25, **gap=6.25**
- `θ=0.25`: x=2.25, **gap=4.6875**
- `θ=0.75`: x=−0.25, **gap=4.6875**
- endpoints `θ=0` and `θ=1`: gap = 0

### Critical-point classification (constant Hessians)
- `f=x²+y²` → H=[[2,0],[0,2]], eig (2,2) → **MINIMUM**
- `f=x²−y²` → H=[[2,0],[0,−2]], eig (2,−2), ∇=0 at origin → **SADDLE**; directional 2nd-deriv dᵀHd: d=(1,0)→+2, d=(0,1)→−2
- `f=−(x²+y²)` → H=[[−2,0],[0,−2]], eig (−2,−2) → **MAXIMUM**
- `f=x²` (trough) → H=[[2,0],[0,0]], eig (2,0) → **INCONCLUSIVE** (one zero eigenvalue)

### Subdifferential of |x|
`∂|x| = {+1}` (x>0), `[−1,1]` (x=0), `{−1}` (x<0)

### Sparsity geometry — target `b=(2.2, 0.6)` (||b||=2.2804)
- L1 ball projection (τ=1): **(1, 0)** — x₂ exactly zero (sparse). Confirmed both via Duchi simplex routine and brute-force constrained min of ‖x−b‖².
- L2 ball projection (radius 1): **(0.9648, 0.2631)** — both coordinates nonzero (radial scaling 1/‖b‖).

### 1-D lasso / one ISTA step — `min ½(x−3)² + 1·|x|`
- Minimizer = `soft(3,1) = 2` (brute-force scan confirms x=2.0, obj=2.5)
- ISTA from x=0, t=1: gradient step `0 − (0−3) = 3`, then `prox₁(3) = 2` → exact minimizer in one step
- L1 toll t·λ=1 pulls smooth minimizer 3 down to 2

### Convexity-preserving ops demo — `x²` vs `(x−2)²`
- `max(x², (x−2)²)`: values at x=−1,0,1,2,3 = (9,4,1,4,9); **convex** (random-chord test passes)
- `min(x², (x−2)²)`: values = (1,0,1,0,1); **non-convex** (random-chord test fails)


---

## Cluster: lagrange-kkt-duality — cards 9 (Lagrange multipliers), 10 (KKT), 11 (Duality & shadow prices)
_verification: ALL CONFIRMED_

# Cards 9–11 — Constraints, KKT, Duality (the anchor heart)

All numbers below are verified in Node against the frozen anchor register (adversarial recompute, no solver libs). Freeze these at module scope as a shared `ROASTERY` object so cards 9/10/11/12/13/19 all read from one source. Color macros: `\obj` (emerald, profit/objective), `\dir` (indigo, gradient/step), `\con` (amber, constraints/multipliers/prices), `\inf` (rose, infeasible), `\dual` (violet, dual), `\an` (fuchsia, anchor).

**Shared frozen constants (module scope):**
```
a = [9, 7]            // base margins $/kg
Q = [[0.03,0.01],[0.01,0.36]]   // SPD curvature; det=0.0107, κ=12.13
G=27 (beans), T=4 (roaster-h), L=4 (labor-h)
beans:   1.2 x1 + 1.0 x2 ≤ 27
roaster: 0.20 x1 + 0.10 x2 ≤ 4
labor:   0.10 x1 + 0.15 x2 ≤ 4
profit(x1,x2) = 9x1 − 0.015x1² + 7x2 − 0.18x2² − 0.01 x1 x2
gradf(x1,x2) = [9 − 0.03 x1 − 0.01 x2,  7 − 0.36 x2 − 0.01 x1]
Frozen solutions:
  x_unconstrained = (296.26, 11.21)  [infeasible: needs 366.73 kg beans, 339.73 over]
  x_concave*       = (16.364, 7.273) = (180/11, 80/11);  profit 183.45;  μ_roaster = 42.18
  x_LP*            = (16.25, 7.50);  margin 198.75
  x_integer*       = (15, 9);  profit 198  (round(LP)=(16,8) INFEASIBLE: 27.2 kg beans)
  shadow prices    = beans 6.25, roaster 7.50, labor 0.00
```

---

## CARD 9 — Constraints & Lagrange multipliers ★ (anchor)

**(a) Header.** `id="lagrange"`, `icon={Lock}` (lucide), `accent="amber"`, `anchor={true}`, `index={9}`, `source="Boyd & Vandenberghe §5; Nocedal & Wright §12"`. Subtitle: "the wall that pushes back". One-line purpose: at a constrained optimum the objective contour *kisses* the active wall — gradients line up, and the multiplier λ that scales them *is* the wall's price.

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> Without limits, the Roastery would roast 296 kg of Espresso a day — the unconstrained profit peak. But you only have 27 kg of green beans and 4 roaster-hours. So you slide uphill on the profit surface until you hit a wall and can climb no further *along it*. At that spot something clean happens: the direction you still want to go (the profit gradient) points straight **into** the wall, perfectly opposed by the wall's normal. Your urge to climb is exactly canceled by the wall's push-back. The number that measures how hard the wall pushes is the **Lagrange multiplier** — and it turns out to be a price.

**(c) Headline equation + read-as.**
`<Block>` (stationarity at a tangency, equality form):
```
\nabla \obj{f(\mathbf{x}^\*)} \;=\; \con{\lambda}\,\nabla \con{g(\mathbf{x}^\*)}
```
`<Block>` (the Lagrangian whose stationary point this is):
```
\mathcal{L}(\mathbf{x},\con{\lambda}) \;=\; \obj{f(\mathbf{x})} \;-\; \con{\lambda}\,\bigl(\con{g(\mathbf{x})} - \con{b}\bigr)
```
`<ReadEq>`: "At the best feasible point, the profit gradient (indigo arrow) is a scalar multiple of the constraint gradient (amber arrow) — they're **parallel**. That scalar is lambda. Read it as: *the contour of profit is tangent to the wall.* If they weren't parallel, you could still slide along the wall to a higher contour."
Annotate with the concrete Roastery instance (small caption under the block, using verified numbers): at `x* = (16.364, 7.273)`, `∇f = (8.4364, 4.2182)` and the roaster-wall normal is `∇g = (0.20, 0.10)`, so `∇f = 42.18 · ∇g` componentwise: `42.18×0.20 = 8.4364`, `42.18×0.10 = 4.2182`. The multiplier is `μ_roaster = 42.18`.

**(d) LIVE INTERACTIVE — "The kiss" (tangency explorer).**
- **Plot.** A single 2-D contour plot in `(x₁, x₂)` space. Axes: x₁ ∈ [0, 24], x₂ ∈ [0, 24] (so the feasible polygon and the tangency are comfortably framed). Render ~8 profit contour ellipses (emerald) of `profit(x1,x2)` at levels evenly spaced from ~120 to ~183.45; the contours are tilted ellipses (because q₁₂>0) centered far off-plot at (296,11). Draw the three resource walls as straight lines (beans, roaster, labor) and shade the feasible polygon. The feasible polygon vertices (computed live): (0,0), (20,0), (16.25,7.5), (≈9.47,15.79)… — but for THIS card emphasize only the **roaster wall** as the active equality constraint; render beans/labor faint/dashed.
- **Mechanic.** A draggable point **constrained to slide along the roaster line** `0.20 x₁ + 0.10 x₂ = 4` (i.e. user drags, point snaps onto the line, parameterize by x₁∈[0,20], x₂=40−2x₁ clamped to feasibility). At the point, draw two arrows from it: the **profit gradient** `∇f` (indigo, length ∝ |∇f|, scaled to fit) and the **wall normal** `∇g=(0.2,0.1)` (amber). Compute and display live: the angle between them, and the projection of `∇f` onto the wall direction (the "still-climbable" component, rose when nonzero).
- **The reveal.** As the user slides toward `x*=(16.364,7.273)`, the indigo arrow rotates until it is **exactly antiparallel/parallel** to the amber normal (tangential component → 0). Snap-highlight at that point: badge "TANGENT — ∇f = 42.18 ∇g", profit reads 183.45. A small live readout panel shows: profit, tangential gradient component (→0 at optimum), and current μ = |∇f|/|∇g| ratio (→42.18).
- **Controls.** (1) A toggle "show all 3 walls" vs "roaster only". (2) A button "snap to optimum" that animates the point to x*. (3) Optional slider for roaster-hours T ∈ [3.0, 4.5] — as T moves the wall translates and the tangency point + profit + μ recompute live (μ stays ≈42.18-ish only near T=4; this previews sensitivity, card 11's job). Use `useReplayOnEnter` to animate the point from (20,0) sliding to x* on viewport entry; gate auto-play with `RafGate`.
- **Verified demo constants for the readout.** At x*: profit 183.45, ∇f=(8.4364,4.2182), μ=42.18, beans-slack 0.0909, labor-slack 1.2727 (both non-binding here → only roaster is active).

**(e) Carry-this** (`<MinSchema>`):
> At a constrained optimum, **profit's gradient and the active wall's normal are parallel.** The proportionality constant λ is the multiplier — geometrically "how steeply profit still wants to climb, per unit of wall," and (next card) economically the **shadow price** of that resource.

**(f) Supporting elements.**

`<Predict question="The unconstrained profit peak is at x*=(296, 11). Once we add the 27 kg bean limit and 4 roaster-hour limit, where does the optimum land — interior, or pinned on a wall?">` Reveal: **Pinned on the roaster wall**, at (16.364, 7.273), profit $183.45/day — a ~98% cut from the runaway unconstrained mix, which would have needed 367 kg of beans (13× your supply). The interior peak is wildly infeasible, so the optimum is forced to a boundary. That boundary tangency is exactly what Lagrange multipliers describe.

`<Misconception wrong="The multiplier λ just tells you whether a constraint is active (1) or not (0)." right="λ is a continuous magnitude: μ_roaster = 42.18 here. It measures how hard the wall pushes — equivalently, how much profit you'd gain per unit of relaxed limit." because="λ scales the gradient (∇f = λ∇g). A barely-binding wall has small λ; a wall throttling a steep profit climb has large λ. Active/inactive is a separate yes/no fact (card 10's complementary slackness).">`

`<Worked title="Reading μ off the gradient">` At x*=(16.364, 7.273): ∇f = (9 − 0.03·16.364 − 0.01·7.273, 7 − 0.36·7.273 − 0.01·16.364) = (8.4364, 4.2182). The roaster normal is ∇g=(0.20, 0.10). Solve ∇f = μ∇g component-wise: μ = 8.4364/0.20 = 42.18 **and** 4.2182/0.10 = 42.18 — the same value from both components, which is exactly the consistency check that the point is a genuine tangency (if the two ratios disagreed, the gradients wouldn't be parallel and you could still climb along the wall).

`<Deeper>` Lagrange's recipe and *why it works*: form `L(x,λ)=f(x)−λ(g(x)−b)`, set `∇ₓL=0` and `∂L/∂λ=0`. The first gives `∇f=λ∇g`; the second just restates the constraint `g(x)=b`. The deep reason the gradients must be parallel: along the wall, any feasible move is tangent to the constraint surface (orthogonal to ∇g). At an optimum, f can't increase along any feasible move, so the component of ∇f tangent to the wall must vanish — i.e. ∇f has *only* a normal component, i.e. ∇f ∥ ∇g. **Why/tradeoff:** this is an *equality*-constraint story (you sit exactly on the wall). Real resource limits are *inequalities* (`≤`) — you might not touch the wall at all. Promoting `=` to `≤` is what forces the sign condition λ≥0 and the complementary-slackness bookkeeping of the next card. Note the unconstrained peak `x*=Q⁻¹a=(296.26, 11.21)` exists and is the *true* global max only because Q is SPD (positive curvature in every direction) — that same convexity is what guarantees the constrained tangency is global, not just local.

`<QA items={[`
- `{q:"Why is the optimum on the roaster wall and not the beans wall?", a:"At the concave optimum the roaster constraint is the only one that binds — beans has 0.09 kg of slack and labor has 1.27 h of slack. The profit surface's natural climb direction pushes the mix into the roaster wall first; the others have room to spare. (In the LP version, beans AND roaster both bind — card 12.)"}`
- `{q:"What does a negative λ mean?", a:"For a ≤ constraint at a maximization optimum, λ must be ≥0 — a binding resource limit can only help, never hurt, to relax. A negative value would say 'I'd pay to have less of this resource,' which can't happen at an optimum; it signals you misidentified which side of the wall is feasible."}`
`]}/>`

Glossary `<Term>`s: **Lagrange multiplier** ("the scalar λ in ∇f=λ∇g; how hard an active constraint pushes back, in profit-per-unit-of-limit"), **active/binding constraint** ("a wall the optimum sits exactly on; g(x)=b"), **tangency** ("where the objective contour just touches the constraint with no crossing — gradients parallel").

CrossLinks: `<CrossLink to="gradient-compass" recap="∇f points steepest-uphill and ⟂ to contour lines">the gradient is a compass</CrossLink>` (motivate why ∇f⟂contour makes the tangency picture work); `<CrossLink to="kkt" recap="inequality walls add λ≥0 and complementary slackness">the KKT conditions</CrossLink>` (forward pointer); `<CrossLink to="convexity" recap="for a convex problem a local tangency optimum is the global one">convexity — the great watershed</CrossLink>`.

---

## CARD 10 — The KKT conditions

**(a) Header.** `id="kkt"`, `icon={CheckSquare}` (lucide; alt `ClipboardCheck`), `accent="amber"`, `anchor={false}` (uses the anchor but isn't a primary anchor card), `index={10}`, `source="Boyd & Vandenberghe §5.5; Nocedal & Wright §12.3"`. Subtitle: "the master optimality test". Purpose: upgrade Lagrange from equality to inequality constraints — four conditions that together certify a constrained optimum, with **complementary slackness** as the star ("a resource you don't fully use is worth nothing").

**(b) Intuition opener:**
> Real limits are inequalities: `beans ≤ 27`, not `beans = 27`. So before you optimize you don't know *which* walls you'll end up touching. KKT is the bookkeeping that handles this honestly. It says: at the optimum, every wall is in one of two states — you're **pressed against it** (it binds, and it has a positive price), or you have **slack** (you're off the wall, and its price is exactly zero). You can never have both a slack wall and a nonzero price. That last clause — **complementary slackness** — is the whole game: idle capacity is worthless.

**(c) Headline equations + read-as.** Show the four KKT conditions as one stacked `<Block>` (use aligned array):
```
\begin{aligned}
&\text{stationarity:} & \nabla \obj{f} &= \textstyle\sum_i \con{\mu_i}\,\nabla \con{g_i} \\
&\text{primal feasibility:} & \con{g_i(\mathbf{x})} &\le \con{b_i} \\
&\text{dual feasibility:} & \con{\mu_i} &\ge 0 \\
&\text{complementary slackness:}\;\; & \con{\mu_i}\bigl(\con{b_i}-\con{g_i(\mathbf{x})}\bigr) &= 0
\end{aligned}
```
`<ReadEq>`: "Four clauses. (1) Profit's gradient is a non-negative combination of the *active* wall normals. (2) You're inside every wall. (3) Prices can't be negative. (4) The killer — for each wall, *either* its slack is zero (you're on it) *or* its multiplier is zero (it's free). Multiply slack × price and you must get zero, every wall."
Concrete caption (verified): at the Roastery concave optimum (16.364, 7.273): roaster binds (slack 0) → `μ_roaster=42.18>0`; beans has slack 0.0909 → `μ_beans=0`; labor has slack 1.2727 → `μ_labor=0`. Stationarity then reads `∇f = 42.18·(0.20,0.10) = (8.4364, 4.2182)` ✓ — only the active wall appears in the sum.

**(d) LIVE INTERACTIVE — "KKT ledger" (active-set & slackness board).**
- **Plot (left).** Same `(x₁,x₂)` contour-plot frame as card 9 (x₁∈[0,24], x₂∈[0,24]), but now **all three walls are first-class** and the feasible polygon is shaded. A draggable point that moves *freely inside* the polygon (clamped to feasibility). For each of the 3 walls, draw its normal arrow scaled by the multiplier μᵢ that *would be required* — but more cleanly: highlight each wall green when the point is on it (|slack|<ε), gray when slack.
- **Ledger (right).** A live HTML table, one row per constraint (beans / roaster / labor), columns: **usage** (gᵢ(x)), **limit** (bᵢ), **slack** (bᵢ−gᵢ), **μᵢ**, **μᵢ·slack**. The μᵢ are computed by solving the active-set stationarity system at the current point: take the set of currently-active walls, solve `∇f(x)=Σ μᵢ∇gᵢ` in least-squares; if the point isn't a true KKT point the residual is shown (rose) as "not stationary — you can still climb." The final column `μᵢ·slackᵢ` must read ~0 for every row when (and only when) the point is the optimum — render it green-zero at x*, rose-nonzero elsewhere.
- **The payoff.** A "snap to KKT optimum" button animates the point to (16.364,7.273). On arrival: roaster row turns green (slack 0, μ=42.18), beans row shows slack 0.0909 / μ=0, labor row shows slack 1.2727 / μ=0; the `μ·slack` column is all zeros; a banner reads "All four KKT conditions satisfied — certified optimum." Use `useReplayOnEnter`.
- **Controls.** (1) "snap to optimum" button. (2) A toggle "LP objective vs concave objective" — switching to the linear objective `c=(9,7)` moves the certified point to the LP optimum (16.25,7.5) where **beans AND roaster both bind** (slack 0,0) and labor stays slack (1.25 h, μ=0) — a vivid contrast showing the active set *changes* with the objective even though the polygon is identical. LP multipliers in the ledger then read beans 6.25, roaster 7.50, labor 0 (the shadow prices — sets up card 11). (3) Optional: click a wall to "toggle active" and watch the stationarity residual.
- **Verified demo constants.** Concave optimum: roaster slack 0, μ=42.18; beans slack 0.0909, μ=0; labor slack 1.2727, μ=0. LP optimum: beans slack 0 (μ=6.25), roaster slack 0 (μ=7.50), labor slack 1.25 (μ=0). Both satisfy μᵢ·slackᵢ=0 ∀i.

**(e) Carry-this** (`<MinSchema>`):
> **KKT = stationarity + feasibility + λ≥0 + complementary slackness.** The one to remember: **complementary slackness** — for every resource, *price × slack = 0*. A wall you're pressed against has a positive price; a wall with room to spare is free. That single equation tells you which constraints actually matter.

**(f) Supporting elements.**

`<Predict question="Labor has 1.27 hours of unused capacity at the Roastery's optimum. What is one extra labor-hour worth?">` Reveal: **Exactly $0.00.** Labor isn't the bottleneck — you're already leaving 1.27 h idle, so a 25th hour just sits there too. Complementary slackness in one line: `μ_labor × slack_labor = 0`, and since slack ≠ 0, the price *must* be 0. Beans ($6.25) and roaster-hours ($7.50) are the binding bottlenecks; those are where money would move.

`<Misconception wrong="More constraints always means a worse optimum, so every constraint costs you profit." right="Only BINDING constraints (slack=0, μ>0) cost you. The slack labor constraint costs nothing — μ_labor=0. Adding a constraint the optimum already satisfies with room to spare changes nothing." because="Complementary slackness: a constraint with positive slack has zero multiplier, so it drops out of the stationarity sum ∇f=Σμᵢ∇gᵢ entirely. The optimum literally doesn't feel it.">`

`<Deeper>` KKT is the first-order **necessary** condition for a constrained optimum (under a constraint qualification like LICQ or Slater). For a **convex** problem — which the Roastery is, since −profit is convex (Q is SPD) and the constraints are linear — KKT is also **sufficient**: any point satisfying all four conditions is a global optimum, no second-order check needed. That's why we can *certify* (16.364,7.273) as optimal just by checking the ledger reads all-zeros. **Why/tradeoff:** the equality-constrained Lagrange recipe of card 9 is the special case where you've already guessed the active set correctly. KKT's real work is figuring out *which* walls are active — combinatorially there are 2³=8 possible active sets here; the active-set/simplex/interior-point methods of the discrete wing are all machinery for searching that combinatorial choice efficiently. Sign matters: the `μᵢ≥0` (dual feasibility) condition is what distinguishes a constrained *maximum* pressed against a wall from a saddle — drop it and you'd accept points where relaxing the wall would *lower* profit.

`<QA items={[`
- `{q:"What if two of the three ratios for μ disagree?", a:"Then the point isn't stationary for that active set — ∇f isn't in the cone spanned by the active normals, so the least-squares residual is nonzero and you can still improve. The ledger shows this in rose."}`
- `{q:"Does complementary slackness mean a binding constraint always has μ>0?", a:"Almost — generically yes. The knife-edge case μ=0 AND slack=0 (a 'degenerate' or weakly-active constraint) is allowed by the equation but unstable; it signals the optimum sits exactly where a wall just barely touches. The Roastery's three multipliers (42.18 / 6.25 / 7.50 binding, 0 slack) are all strictly off that knife-edge."}`
`]}/>`

Glossary `<Term>`s: **complementary slackness** ("μᵢ(bᵢ−gᵢ)=0: for each constraint, either it binds or its multiplier is zero — never both nonzero"), **active set** ("the subset of constraints that bind at the optimum, slack=0"), **dual feasibility** ("μ≥0 for ≤ constraints — prices can't be negative"), **constraint qualification** ("a regularity condition, e.g. Slater/LICQ, that makes KKT a valid optimality test").

CrossLinks: `<CrossLink to="lagrange" recap="∇f=λ∇g at a single active wall — KKT generalizes this to inequalities">constraints & Lagrange multipliers</CrossLink>`; `<CrossLink to="duality" recap="the binding multipliers 6.25 / 7.50 are the resources' shadow prices">duality & shadow prices</CrossLink>`; `<CrossLink to="simplex" recap="the simplex method searches active sets vertex by vertex">LP & the simplex</CrossLink>`.

---

## CARD 11 — Duality & shadow prices ★ (anchor)

**(a) Header.** `id="duality"`, `icon={Scale}` (lucide; the balance scale — pricing from the other side), `accent="amber"` with `\dual` violet used inside equations for the dual object, `anchor={true}`, `index={11}`, `source="Boyd & Vandenberghe §5; Bertsimas & Tsitsiklis Ch.4"`. Subtitle: "what your resources are worth". Purpose: the multiplier is a **price**. Build the Lagrangian → dual function (an upper bound for max problems / lower bound for min), show weak vs strong duality and the zero gap under Slater, and nail the killer identity `λ* = ∂(optimal value)/∂(budget)` by finite-differencing the value function.

**(b) Intuition opener:**
> There are two ways to value the Roastery. The **primal** view: pick the best blend mix, read off the profit — $198.75/day in the LP. The **dual** view: forget blends, and instead ask *what is each resource worth at the margin?* Price the 27 kg of beans, the 4 roaster-hours, the 4 labor-hours so that no blend could ever beat its ingredient cost — then minimize the total value of your stock. Strong duality is the remarkable fact that these two numbers **meet exactly**: the cheapest consistent resource valuation equals the maximum achievable profit. And the prices that achieve it are the multipliers from KKT — the **shadow prices**.

**(c) Headline equations + read-as.**
`<Block>` (Lagrangian / dual function — using max-problem convention):
```
\dual{g(\boldsymbol{\mu})} \;=\; \max_{\mathbf{x}\ge 0}\;\Bigl[\,\obj{f(\mathbf{x})} \;-\; \textstyle\sum_i \con{\mu_i}\bigl(\con{g_i(\mathbf{x})} - \con{b_i}\bigr)\Bigr]
```
`<Block>` (the shadow-price identity — the killer):
```
\con{\mu_i^\*} \;=\; \frac{\partial\, \obj{V^\*}}{\partial\, \con{b_i}}
```
`<Block>` (strong duality / zero gap):
```
\underbrace{\max_{\mathbf{x}\in\mathcal{F}} \obj{f(\mathbf{x})}}_{\text{primal}} \;=\; \underbrace{\min_{\boldsymbol{\mu}\ge 0}\, \dual{g(\boldsymbol{\mu})}}_{\text{dual}} \;=\; \obj{198.75}
```
`<ReadEq>`: "The dual function relaxes the walls into *penalties* priced at μ, then optimizes freely. For any prices μ≥0 it gives an **upper bound** on the best profit (you can only do worse when walls cost money). Minimizing that bound over all price vectors squeezes it down — and for a convex problem it touches the true optimum exactly: no gap. The prices that achieve the touch are the shadow prices, and each one is literally the *derivative of optimal profit with respect to that budget.*"
Concrete caption (verified): LP shadow prices μ* = (beans 6.25, roaster 7.50, labor 0.00). Dual objective `b·μ = 27·6.25 + 4·7.50 + 4·0 = 198.75` = primal margin. Identity check: bump beans by ε, profit rises at rate 6.25; bump labor, rate 0.

**(d) LIVE INTERACTIVE — "The shadow-price till" (perturb-a-budget sensitivity demo).**
This is the killer demo. Two synchronized panels.
- **Panel A — the polytope (left).** The LP feasible polygon in `(x₁,x₂)`, x₁∈[0,24], x₂∈[0,24], with the three walls and the objective direction `c=(9,7)` drawn as a sweeping iso-profit line. The LP optimum vertex (16.25, 7.5) is marked. Three sliders move the three budgets: **G ∈ [25, 29]**, **T ∈ [3.0, 4.5]**, **L ∈ [3.0, 5.0]**. As a slider moves, the corresponding wall **translates**, the polygon reshapes, the optimal vertex slides along, and the optimal margin recomputes live (vertex enumeration in JS — 5 lines, choose-2, keep feasible, argmax c·x).
- **Panel B — the value function (right).** A live line plot of optimal margin `V*` vs the budget of the *currently-focused* slider (the one last touched). Overlay the tangent line whose slope is the shadow price. **The reveal:** the slope of `V*(G)` is a constant **6.25** over G∈[25,29] (a clean straight ramp — verified); the slope of `V*(T)` is **7.50** but only up to **T≈4.5**, where it **kinks down to 3.75 then 0** (because x₂ hits its floor and the binding set changes); the slope of `V*(L)` is **flat 0** until L drops below ~2.75, where labor *starts* to bind and the slope jumps positive. A numeric readout: "1 more kg beans → +$6.25", "1 more roaster-h → +$7.50 (up to T=4.5)", "1 more labor-h → +$0.00 (you have 1.25 h idle)."
- **The finite-difference badge.** A button "verify the identity" computes `(V(b+ε) − V(b−ε))/(2ε)` with ε=1e-3 for each budget live and shows it equals the displayed shadow price to 4 decimals (6.2500 / 7.5000 / 0.0000) — i.e. the multiplier *is* the derivative of the value function, demonstrated numerically on screen.
- **Controls.** Three budget sliders (G, T, L), the "verify the identity" button, and a toggle "concave objective" — switching to the concave profit moves the active wall to roaster-only and the focused sensitivity becomes `∂(profit)/∂T = μ_roaster = 42.18` (also finite-difference-verified: dV/dT = 42.1818). Default focus slider = roaster (most dramatic kink).
- **Verified demo constants.** LP: V*(27,4,4)=198.75; V*(28,4,4)=205.00 (+6.25); V*(27,5,4)=202.50 — note the *discrete* +1 roaster step gains only +3.75 because the binding set changes at T=4.5; the marginal rate is 7.50, valid for T∈[~3.0, 4.5]. Concave: V*(T=4)=183.45, dV/dT=42.18 (finite-diff matches μ exactly).

**(e) Carry-this** (`<MinSchema>`):
> The multiplier is a **price**: `λ* = ∂(optimal value)/∂(budget)`. Beans are worth **$6.25/kg**, roaster-time **$7.50/hour**, labor **$0** (you have slack) — at the margin. Strong duality says the cheapest consistent set of these prices, valued against your whole stock, **equals** your maximum profit. The dual is your problem priced from the other side, and the prices tell you exactly where to spend to grow.

**(f) Supporting elements.**

`<Predict question="You can buy ONE more unit of exactly one resource for the same cost. Beans, roaster-hours, or labor — which buys the most extra profit?">` Reveal: **Roaster-hours**, at **+$7.50** for the next hour (vs +$6.25/kg beans, +$0 labor). The shadow prices rank your bottlenecks directly. But watch the fine print: that $7.50 is the *marginal* rate. It holds for the next ~0.5 roaster-hour; past T=4.5 the rate drops to $3.75 and then $0 as the binding constraint set changes and the second wall stops helping. Shadow prices are local — they expire when the active set shifts.

`<Misconception wrong="The shadow price is what you'd save by buying a big batch more of the resource — so 10 more roaster-hours is worth 10 × $7.50 = $75." right="$7.50 is the MARGINAL value, valid only while the same constraints bind. Here it holds up to T≈4.5 h; the very next discrete +1 roaster-hour actually gains only $3.75 because at T=4.5 the mix hits x₂=0 and the binding set changes." because="The value function V*(b) is piecewise-linear: its slope is the shadow price, but it kinks every time the optimal vertex switches. Beyond the kink a different (cheaper) marginal rate applies. λ = dV/db is a derivative — true only in the limit / within the basis-stable interval.">`

`<Worked title="Strong duality, both directions">` **Primal:** maximize 9x₁+7x₂ over the polygon → vertex (16.25, 7.5), margin = 9·16.25 + 7·7.5 = 146.25 + 52.5 = **198.75**. **Dual:** minimize 27y₁+4y₂+4y₃ subject to 1.2y₁+0.2y₂+0.1y₃ ≥ 9 (Espresso must not be underpriced) and 1.0y₁+0.1y₂+0.15y₃ ≥ 7 (Filter), y≥0. The optimal prices y*=(6.25, 7.50, 0) make *both* product constraints tight (1.2·6.25+0.2·7.50 = 9 ✓; 1.0·6.25+0.1·7.50 = 7 ✓) and cost 27·6.25 + 4·7.50 + 4·0 = 168.75 + 30 + 0 = **198.75**. The two numbers meet — zero duality gap. A *non-optimal* but feasible price vector like y=(7.5, 0, 0) is still a valid **upper bound** (cost 202.50 ≥ 198.75): that's weak duality, and the gap 202.50−198.75=3.75 shrinks to zero only at the optimal prices.

`<Deeper>` The Lagrangian `L(x,μ)=f(x)−Σμᵢ(gᵢ−bᵢ)` turns hard constraints into soft penalties. For *any* fixed μ≥0, maximizing L over x ignores the walls but charges μᵢ per unit of violation, so `max_x L ≥ f(x*)` for the true optimum — every dual value is an **upper bound** (weak duality, always true, even non-convex). The dual problem `min_{μ≥0} g(μ)` finds the tightest bound. **Strong duality** — gap = 0 — holds when the primal is convex and **Slater's condition** is met (a strictly-feasible interior point exists; the Roastery's polygon has interior, so it does). For the concave Roastery the dual `g(μ)` is a convex function of μ with minimum 183.45 at μ=42.18 — verified: g(0)=1372, g(20)=512, g(42.18)=183.45 (the floor), g(60)=396 (rises again). **Why/tradeoff:** duality isn't just bookkeeping — it (1) gives a *certificate* (any feasible dual value bounds how good the primal can get, so you can stop early with a guarantee), (2) is what every solver's "optimality gap" reports, and (3) reverses hard problems into easier ones (the dual of a constrained max can have far fewer variables). The economic punchline is the sharpest: **the dual prices your constraints, and the price of each is precisely how much optimal profit moves when you relax that constraint by one unit** — `λ*=∂V*/∂b`. That is why a manager reads multipliers straight off a solver as "buy more of *this* resource first."

`<QA items={[`
- `{q:"Why is labor's shadow price exactly zero?", a:"Complementary slackness. At the optimum labor has 1.25 h of slack (uses 2.75 of 4), so it isn't binding — relaxing a non-binding limit changes nothing, so ∂V*/∂L = 0. Idle capacity has no marginal value."}`
- `{q:"Is the duality gap ever nonzero here?", a:"Not at the optimum — the Roastery is convex with a feasible interior (Slater holds), so strong duality gives gap = 0. Gaps appear for non-convex problems (e.g. the integer version in card 13, where the LP relaxation's dual leaves an integrality gap)."}`
- `{q:"How is the LP shadow price related to the concave multiplier from card 10?", a:"Same object — a multiplier IS a shadow price. They differ in value because the objectives differ: the linear objective's binding set is {beans, roaster} with prices (6.25, 7.50); the concave objective binds only {roaster} with μ=42.18. Both equal ∂V*/∂(their budget)."}`
`]}/>`

Glossary `<Term>`s: **shadow price** ("the marginal value of one more unit of a resource = ∂(optimal value)/∂(budget) = the constraint's multiplier"), **dual function** ("g(μ): the constrained problem with walls relaxed into priced penalties; bounds the primal for every μ≥0"), **weak duality** ("every dual value bounds the primal — always true"), **strong duality** ("primal optimum = dual optimum, gap = 0; holds for convex problems under Slater"), **Slater's condition** ("a strictly-feasible interior point exists — the qualification that guarantees zero gap"), **duality gap** ("primal-minus-dual at the best of each; zero for convex Roastery, positive for the integer version").

CrossLinks: `<CrossLink to="kkt" recap="the binding multipliers 6.25 / 7.50 are exactly these shadow prices">the KKT conditions</CrossLink>`; `<CrossLink to="simplex" recap="LP duality gives the same shadow prices, read off the optimal tableau">LP & the simplex</CrossLink>`; `<CrossLink to="branch-and-bound" recap="the integer version opens a duality gap the LP relaxation can't close">integer programming & branch-and-bound</CrossLink>`; `<CrossLink to="anchor" recap="the scorecard reports these three prices as the shop's bottom line">the roastery, solved every way</CrossLink>`. Optional sibling-slug crosslink: `<CrossLink to="retail-quant" recap="portfolio QPs read risk-budget shadow prices the same way">retail-quant</CrossLink>`.

---

### Build notes (apply to all three cards)
- One shared `ROASTERY` module-scope object holds a, Q, G/T/L, the profit & grad closures, and the frozen solutions. Cards 9/10/11 import the same object — never re-type a constant inline.
- The contour-plot frame (axes x₁,x₂∈[0,24], wall lines, feasible-polygon shading, ellipse contours of profit) is the same reusable `<RoasteryPlot>` component across 9/10/11 (and reusable in 12/13/19); pass props for which walls are emphasized, which objective (linear vs concave), and the overlay (single drag-point / free drag-point / budget-sliders).
- Legends are HTML chips ABOVE each SVG (emerald = profit contours, indigo = ∇f, amber = walls/normals, rose = infeasible/non-stationary, violet = dual). `useId()` on every arrowhead `<marker>`.
- KaTeX strings above use `\*` for the star superscript and doubled `##` only inside macro *bodies* (not needed in card-level tex here). No apostrophes inside single-quoted tex — all the tex above is apostrophe-free.

### Verified constants — lagrange-kkt-duality
## Verified constants — Cards 9-11 (Lagrange / KKT / Duality)

All values independently recomputed in hand-rolled Node (no solver libs). Builder may hardcode these.

### Curvature matrix
- `Q = [[0.03, 0.01],[0.01, 0.36]]`, **det(Q) = 0.0107** (exact), SPD (Q11>0, det>0).
- Eigenvalues: **λ_min = 0.0296972**, **λ_max = 0.3603028** → **κ(Q) = 12.1325 ≈ 12.13**.

### Objective / gradient closures
- `profit(x1,x2) = 9x1 − 0.015x1² + 7x2 − 0.18x2² − 0.01 x1 x2`
- `gradf(x1,x2) = [9 − 0.03x1 − 0.01x2, 7 − 0.36x2 − 0.01x1]`

### Frozen solutions
| Quantity | Verified value |
|---|---|
| Unconstrained max `Q⁻¹a` | **(296.26, 11.21)** (296.2617, 11.2150) |
| Beans needed at unconstrained | **366.73 kg** → overage **339.73 kg** over 27 |
| Concave-constrained optimum | **(16.364, 7.273) = (180/11, 80/11)** exactly |
| Concave optimal profit | **183.45** ($/day) |
| `∇f` at concave optimum | **(8.4364, 4.2182)** |
| `μ_roaster` | **42.18** (= 42.1818; both gradient ratios agree exactly) |
| Beans slack at concave opt | **0.0909** kg → μ_beans = 0 |
| Labor slack at concave opt | **1.2727** h → μ_labor = 0 |
| Roaster usage at concave opt | **4.0000** (binds exactly) |
| **LP optimum** | **(16.25, 7.50)**, binding = beans + roaster |
| LP margin `c·x` | **198.75** |
| LP labor usage / slack | 2.75 / **1.25 h** |
| LP shadow prices | beans **6.25**, roaster **7.50**, labor **0.00** |
| **Integer optimum** | **(15, 9)**, profit **198**, UNIQUE (next best 196) |
| round(LP) = (16,8) | INFEASIBLE: 27.2 kg beans > 27 |

### Sensitivity / duality
- Concave `dV/dT` (FD ε=1e-4) = **42.1818** = μ_roaster.
- LP FD shadow prices (ε=1e-3): dV/dG = **6.2500**, dV/dT = **7.5000**, dV/dL = **0.0000**.
- LP strong duality: primal 198.75 = dual `27·6.25 + 4·7.50 + 4·0` = **198.75**.
- LP discrete +1 steps from base 198.75: +1 beans → **205.00** (+6.25); +1 roaster → **202.50** (+3.75, NOT +7.50, binding set changes at T=4.5); +1 labor → **198.75** (+0.00).
- LP optimum: G=28 → **(15,10)**; T=5 → **(22.5,0)**; T=4.5 → **(22.5,0)**.
- Roaster shadow $7.50 stable for **T ∈ [3.0, 4.5]**; at T=4.5 hits (22.5,0); above 4.5 slope = 0 (the discrete 4→5 step averages 3.75 because it crosses the kink). Beans shadow $6.25 stable for **G ∈ [25, 29]** (slope exactly 6.25).
- Weak duality: y=(7.5,0,0) feasible (1.2·7.5=9≥9, 1.0·7.5=7.5≥7), dual obj = **202.50**, gap **3.75**.
- Optimal dual y*=(6.25,7.50,0) makes both product constraints tight: 1.2·6.25+0.2·7.5 = 9, 1.0·6.25+0.1·7.5 = 7.

### Concave dual function g(μ) — IMPORTANT formulation note
The listed samples **g(0)=1372.43, g(10)=875.51, g(20)=512.24, g(30)=282.62, g(42.18)=183.45, g(50)=224.30, g(60)=395.61, g(80)=1139.16** are all reproduced — BUT only when the inner maximization is taken over **x ∈ ℝ² (unbounded / x free)**, not over x ≥ 0 as the headline tex `max_{x≥0}` literally writes. Beyond μ ≈ 46 the free-x maximizer drives x1 negative; if you genuinely clamp x ≥ 0 the high-μ samples become g(50)=205.56, g(60)=241.39, g(80)=320.00. All samples up through the minimizer **μ=42.18 (g=183.45, the bowl floor)** are identical in both conventions, so the dual-bowl shape, its minimizer, and strong-duality match are robust. Builder: keep the listed sample numbers, but either (a) drop the `x≥0` subscript in the dual-function tex for that demo, or (b) only plot/sample g(μ) up to μ≈42-46 where the two agree, to avoid a tex-vs-number mismatch.


---

## Cluster: lp-simplex — cards 12 (Linear programming & the simplex)
_verification: ALL CONFIRMED_

## Card 12 — Linear Programming & the Simplex

> **Cluster note for the builder:** this is the first card of the discrete wing (Section IV). It converts the *curved* Roastery into its *linear shadow* (fixed price/kg, no diminishing returns), so all curvature vanishes and the optimum is forced onto a corner of the feasible polygon. Everything is one 2-D plot in `(x₁, x₂)` space — the same plot as cards 9–11, but now the objective contours are straight parallel lines instead of ellipses. Freeze all numbers below at module scope; they are independently verified in Node (vertex enumeration + dual recompute, gap = 0 exactly).

---

### (a) Card shell

```jsx
<Card
  id="lp-simplex"
  icon={Spline}            // lucide: a polygon/vertex feel; alternatives: Hexagon, Waypoints, Network
  title="Linear programming & the simplex"
  subtitle="When the landscape is flat, the answer hides in a corner"
  accent="amber"           // constraints/walls are the star here
  index={12}
  source="Dantzig 1947; Bertsimas & Tsitsiklis, Intro to Linear Optimization; Boyd & Vandenberghe §4.3"
  anchor={true}            // this IS the Roastery, re-solved
>
```

- **Icon:** `Waypoints` (preferred — reads as "walking vertex to vertex") or `Spline`/`Hexagon`.
- **Accent:** `amber` (walls/constraints are the protagonist; the optimum is a wall-intersection).
- **anchor flag:** `true`.
- **One-line purpose:** Show that a *linear* objective over linear constraints always optimizes at a **vertex** of the feasible polytope, that the **simplex** method walks edge-to-edge to that vertex climbing the objective, and that **LP duality** reproduces the exact same shadow prices we met in card 11.

---

### (b) Intuition opener

```jsx
<Intuition title="first, the picture">
```

> Drop the diminishing-returns curve from the Roastery and pretend every kilo sells for the same fixed margin — \$9 on Espresso, \$7 on Filter, forever. The profit "hills" flatten into a family of **parallel straight lines**, all tilted the same way. There's no interior peak to settle into anymore: a flat ramp has no summit *inside* a room, so the best point is pinned against a corner. Push the profit line outward as far as it'll go while still touching the feasible region, and the last point it touches is always a **vertex** — the meeting of two resource walls. That single fact is the whole of linear programming: stop searching the interior, just visit the corners.

---

### (c) Headline equations + read-as

**The LP in standard form (maximize):**

```jsx
<Block>{String.raw`\max_{x_1,x_2\ge 0}\ \ \obj{9\,x_1 + 7\,x_2}\quad\text{s.t.}\quad \con{\begin{aligned}1.2\,x_1 + 1.0\,x_2 &\le 27\\[-1pt] 0.20\,x_1 + 0.10\,x_2 &\le 4\\[-1pt] 0.10\,x_1 + 0.15\,x_2 &\le 4\end{aligned}}`}</Block>
```

**Compact matrix form (for the Deeper fold and to introduce the dual):**

```jsx
<Block>{String.raw`\max_{x\ge 0}\ \obj{c^{\mathsf T}x}\quad\text{s.t.}\quad \con{Ax\le b},\qquad c=\begin{bmatrix}9\\7\end{bmatrix},\ \ A=\begin{bmatrix}1.2&1.0\\0.20&0.10\\0.10&0.15\end{bmatrix},\ \ b=\begin{bmatrix}27\\4\\4\end{bmatrix}`}</Block>
```

**Read-as** (use `<ReadEq>`):
> "Choose non-negative kilos of Espresso and Filter to **maximize** nine-times-Espresso plus seven-times-Filter, *subject to* three resource walls: green beans (1.2 and 1.0 kg per kilo of each blend, capped at 27), roaster-hours (0.20 and 0.10, capped at 4), and labor (0.10 and 0.15, capped at 4). The objective `cᵀx` is the profit ramp; each row of `Ax ≤ b` is a wall the ramp can't cross."

Note the contrast to card 9–11: there the objective was `\obj{a^{\mathsf T}x - \tfrac12 x^{\mathsf T}Q x}` (curved). Here `Q = 0` — pure linear. The build should literally state "set `Q → 0` and you get this card."

---

### (d) LIVE INTERACTIVE — "Walk the polygon"

A single SVG panel in `(x₁, x₂)` space. This is the visual centerpiece; everything is computed live in JS from the frozen constants (no solver lib needed — it's a 2-variable LP, enumerate the 5 vertices).

**Plot / axes**
- x-axis = `x₁` (Espresso, kg/day), range **0 → 24**.
- y-axis = `x₂` (Filter, kg/day), range **0 → 30**.
- Draw the three constraint lines as **amber** walls (full lines across the plotting box), each labeled with its resource name; shade each infeasible half-plane very faintly (`fill amber-500/5`).
- Shade the **feasible polygon** interior `emerald-500/8`. The polygon is the pentagon with vertices, in order:
  | Vertex | Coords (x₁, x₂) | Binding walls | Objective `9x₁+7x₂` |
  |---|---|---|---|
  | **O** | (0, 0) | x₁=0, x₂=0 | **\$0.00** |
  | **A** | (20, 0) | roaster, x₂=0 | **\$180.00** |
  | **B** ★ | (16.25, 7.5) | **beans + roaster** | **\$198.75** ← optimum |
  | **C** | (0.625, 26.25) | beans + labor | **\$189.375** |
  | **D** | (0, 26.6667) | labor, x₁=0 | **\$186.667** |

  (Plot each as a dot; label B with a star/halo. These coordinates and objective values are verified exactly in Node — freeze them.)
- Draw the **iso-profit line** `9x₁ + 7x₂ = k` as a moving **emerald** dashed line. Its slope is `−9/7 ≈ −1.2857`, which lies strictly *between* the beans-wall slope (`−1.2`) and the roaster-wall slope (`−2.0`) — this is *why* B is the unique optimum (the ramp is steeper than beans, shallower than roaster, so it pivots to rest exactly on their corner). Show the current `k` value as a chip.

**Controls**
1. **Mode toggle: `Sweep` / `Simplex`.**
   - **Sweep mode:** a slider `k` from `0 → 220`. Drag it and the emerald iso-profit line `9x₁+7x₂=k` translates outward. A live readout reports "touches feasible region: yes/no" and, when the line is tangent, snaps a marker to the last-touched vertex. As `k` passes **198.75** the line lifts off the polygon entirely at vertex **B** — the visual "aha": the optimum is the largest `k` whose line still kisses the region. (Auto-play: animate `k` ramping 0→210→back, gated by `RafGate`, replay on entry.)
   - **Simplex mode:** a **Step / Reset** button pair. Animate a glowing token walking the polygon **edge by edge**, objective monotonically increasing, pausing at each vertex with a callout of its objective value:
     - **Default (Dantzig) path: O → A → B** (2 pivots). Objectives: \$0 → \$180 → \$198.75. ✓ monotone increasing, verified.
     - At each step show the **ratio test** in a side panel. From **O**, the entering variable is `x₁` (largest objective coefficient, 9 > 7). Holding `x₂=0`, the min-ratio test is: roaster `4/0.20 = 20`, beans `27/1.2 = 22.5`, labor `4/0.10 = 40` → **min = 20 (roaster binds)** → move to **A=(20,0)**. Then the next pivot brings in `x₂`, sliding along the roaster wall until beans binds → **B=(16.25, 7.5)**. At B, both adjacent edges *decrease* the objective (toward A: −\$18.75; toward C: −\$9.375), so simplex stops. (Both deltas verified.)
2. **Pivot-rule toggle (optional, in Simplex mode): `Dantzig` / `alt`.** The `alt` rule enters `x₂` first and produces the longer path **O → D → C → B** (3 pivots): \$0 → \$186.667 → \$189.375 → \$198.75, also monotone increasing (verified). Teaching point: *different pivot rules walk different edges but reach the same optimum* — the corner doesn't depend on the route.
3. **"Show duality" toggle** (wires into the carry-this / Deeper): overlays a small inset table of shadow prices at B (see Worked example).

**Numerical scheme to generate everything (no external solver):**
- Build the 5 constraint lines as `{a, b, r}` for `a·x₁ + b·x₂ ≤ r`, including `x₁≥0` (`−x₁≤0`) and `x₂≥0` (`−x₂≤0`).
- Enumerate all `C(5,2)=10` pairwise intersections; keep those satisfying *all* five constraints (tolerance `1e-7`); dedupe. This yields exactly the 5 feasible vertices above.
- Objective at each = `9x₁ + 7x₂`; the max is **B**.
- Order vertices into a polygon by angle around the centroid for drawing.
- Iso-profit line for a given `k`: solve `9x₁+7x₂=k` for two box-edge endpoints and clip to the plot box.

**Verified demo constants (freeze at module scope):**
```js
const C_LP = [9, 7];                       // $/kg margins
const A_LP = [[1.2,1.0],[0.20,0.10],[0.10,0.15]];
const B_LP = [27, 4, 4];                   // beans, roaster, labor
const VERTS = [                            // feasible polygon (pentagon), verified
  {id:'O', x:[0,0],        obj:0,       bind:['x1=0','x2=0']},
  {id:'A', x:[20,0],       obj:180,     bind:['roaster','x2=0']},
  {id:'B', x:[16.25,7.5],  obj:198.75,  bind:['beans','roaster']},   // optimum
  {id:'C', x:[0.625,26.25],obj:189.375, bind:['beans','labor']},
  {id:'D', x:[0,80/3],     obj:560/3,   bind:['labor','x1=0']},      // 80/3=26.6667, 560/3=186.6667
];
const LP_OPT = {x:[16.25,7.5], obj:198.75, binding:['beans','roaster']};
const SLACK_AT_OPT = {beans:0, roaster:0, labor:1.25};   // labor 2.75 of 4 used
const SHADOW = {beans:6.25, roaster:7.50, labor:0.00};   // dual = primal, gap 0
const DANTZIG_PATH = ['O','A','B'];        // 2 pivots, $0→$180→$198.75
const ALT_PATH = ['O','D','C','B'];        // 3 pivots, $0→$186.667→$189.375→$198.75
const ISO_SLOPE = -9/7;                    // -1.2857; between beans(-1.2) & roaster(-2.0)
```

---

### (e) Carry-this takeaway

```jsx
<MinSchema>
```

> A **linear** objective over linear constraints never settles in the interior — it's a flat ramp, so the best point is always a **vertex** of the feasible polygon. The Roastery's LP optimum is **(16.25 kg Espresso, 7.5 kg Filter) for \$198.75/day**, sitting where the **beans** and **roaster** walls cross; **labor sits idle (1.25 h slack)**. Simplex doesn't search the inside — it **walks corner to corner along edges, climbing the objective**, and stops when no neighboring corner is higher. And the dual prices it spits out — **\$6.25/kg beans, \$7.50/roaster-hour, \$0 labor** — are the *exact same shadow prices* from card 11. Same answer, two languages.

---

### (f) Supporting elements

**Predict → reveal**
```jsx
<Predict question="The naive move: just round the curved-Roastery optimum. The smooth concave optimum was (16.36, 7.27). What does the LINEAR version do — land somewhere near it, or somewhere different?">
```
> Reveal: It lands at **(16.25, 7.5)** — close in `x₁`, but Filter jumps from 7.27 to **7.5** and the point snaps to a *corner* (beans + roaster both bind). The curved optimum was a smooth *tangency* on the roaster wall alone (beans had 0.09 kg slack); flattening the objective drags the solution along the roaster edge until it hits the beans wall too. **Linear objectives don't do interiors or single-wall tangencies — they go all the way to a vertex.** (Cross-link to card 9/10 for the curved tangency.)

**Misconception**
```jsx
<Misconception
  wrong="The optimum could be anywhere on the best edge, or somewhere in the middle of the feasible region if that's where profit is highest."
  right="For a linear objective, an optimum always occurs at a vertex. (It can also tie along a whole edge — but only if the objective line is exactly parallel to that edge.)"
  because="The objective cᵀx is linear, so along any straight line through the region it strictly increases in one direction unless it's flat. Inside the region you can always nudge toward higher c·x; you only get stuck at a corner. Here the iso-profit slope is −9/7 ≈ −1.286, strictly between the beans wall (−1.2) and the roaster wall (−2.0), so it's parallel to neither — the optimum is the unique corner B, not an edge of ties." />
```

**Worked example — LP duality reproduces the shadow prices**
```jsx
<Worked title="The dual: pricing the resources from the other side">
```
> **Primal** (the shop's view): make blends, maximize profit → \$198.75 at (16.25, 7.5).
>
> **Dual** (a buyer's view): someone offers to buy out your whole resource stock. Set a price per unit on each resource — `y_beans, y_roaster, y_labor ≥ 0` — cheap enough that you'd never rather *make* a blend than *sell* the resources it needs:
> $$\min_{y\ge0}\ \dual{27\,y_{\text{beans}} + 4\,y_{\text{roaster}} + 4\,y_{\text{labor}}}\quad\text{s.t.}\quad\con{\begin{aligned}1.2\,y_{\text{beans}}+0.20\,y_{\text{roaster}}+0.10\,y_{\text{labor}}&\ge 9\\ 1.0\,y_{\text{beans}}+0.10\,y_{\text{roaster}}+0.15\,y_{\text{labor}}&\ge 7\end{aligned}}$$
> **Complementary slackness** does the bookkeeping: labor is *not fully used* (1.25 h idle) → its price must be **\$0**. With `y_labor = 0`, the two remaining inequalities bind:
> $$1.2\,y_{\text{beans}}+0.20\,y_{\text{roaster}}=9,\qquad 1.0\,y_{\text{beans}}+0.10\,y_{\text{roaster}}=7$$
> Solving: **`y_beans = $6.25`, `y_roaster = $7.50`**. Dual objective `= 27(6.25) + 4(7.50) + 4(0) = 168.75 + 30 = $198.75` — **identical to the primal**. Zero duality gap (LP strong duality always holds when both sides are feasible). And these are *exactly* the shadow prices from card 11. (All arithmetic verified in Node: gap = 0 exactly.)

**Deeper fold**
```jsx
<Deeper>
```
> **Why vertices, formally (the fundamental theorem of LP).** The feasible set `{x ≥ 0 : Ax ≤ b}` is a convex polyhedron. A linear function attains its max over a bounded polyhedron at an **extreme point** (a vertex) — because any interior or edge-interior point can be written as a convex combination of vertices, and a linear function evaluated on a convex combination is a weighted average, which can't exceed its largest component. So you never lose by going to a corner. Vertices are exactly the points where `n` linearly independent constraints bind (here `n=2`, so each vertex is the intersection of 2 walls). With `m` constraints in `n` dims there are at most `C(m,n)` candidate vertices — finite, so enumeration *works* in principle.
>
> **Why simplex instead of enumeration.** `C(m,n)` explodes (here just 5, but real LPs have millions). Simplex is *smart enumeration*: start at a vertex, repeatedly swap one binding constraint for a better neighbor (a **pivot**) so the objective strictly climbs, stop when no neighbor improves. Each pivot is one linear solve. Worst case it can visit exponentially many vertices (Klee–Minty cubes), but on real problems it's famously fast — typically a small multiple of `m` pivots. The **tradeoff vs interior-point methods**: simplex hops along the *boundary* (combinatorial, exact-arithmetic-friendly, great for warm-starts and re-solves); **interior-point** methods cut *through the interior* following a central path, with provable polynomial-time guarantees and better worst-case behavior on huge sparse problems — which is why modern solvers ship both and pick per instance.
>
> **Where the dual comes from.** The dual variables `y` are precisely the **Lagrange/KKT multipliers** on `Ax ≤ b`. Stationarity of the Lagrangian gives `c = Aᵀy` on the binding rows; dual feasibility is `y ≥ 0`; complementary slackness is `yᵢ(b−Ax)ᵢ = 0` — a slack constraint forces its price to zero (labor here). That's the same `∇f = Σλᵢ∇gᵢ` picture from the spine, now with straight walls. LP is the one case where **strong duality is automatic** (no Slater condition needed): primal optimum = dual optimum, always, when both are feasible and bounded.

**QA**
```jsx
<QA items={[
  {q:"Why can't the best mix be in the middle of the feasible region?",
   a:"Because the objective is a flat ramp (9x₁+7x₂). From any interior point you can always step in the +gradient direction (9,7) and earn more, until a wall stops you. You only run out of 'up' at a corner. Interiors are never optimal for a strictly-tilted linear objective."},
  {q:"What's a 'pivot' in plain terms?",
   a:"Swapping which constraint you're pressed against. At a corner two walls bind; a pivot releases one wall and slides along the other edge to the next corner, choosing the move that increases profit. Simplex is a sequence of pivots."},
  {q:"The optimum uses beans and roaster fully but leaves 1.25 labor-hours idle. Is that wasteful?",
   a:"No — it's optimal. Labor isn't the bottleneck here; beans and roaster are. That's exactly why labor's shadow price is $0: an extra labor-hour buys you nothing because you'd still be blocked by beans and roaster. Spend your money loosening a binding wall, not a slack one."},
  {q:"Does simplex always find the global optimum?",
   a:"For an LP, yes. The feasible set is convex and the objective is linear, so any vertex with no improving neighbor is globally optimal — there are no local traps. (Contrast integer programming in the next card, where this breaks.)"},
  {q:"Why is the optimum a unique corner and not a whole edge?",
   a:"A whole edge of optima happens only when the objective line is exactly parallel to a wall. Here the iso-profit slope is −9/7 ≈ −1.286, which is parallel to none of the walls (−1.2, −2.0, −0.667), so the optimum is the single corner B."}
]}/>
```

**Glossary `<Term>` entries (add to GLOSS map)**
- **polytope / polyhedron** — the feasible region carved out by linear inequalities; in 2-D a polygon. Its corners are vertices, its sides are edges.
- **vertex (extreme point)** — a corner of the feasible region; a point where (in `n` dimensions) `n` linearly independent constraints bind simultaneously. Optimum of any LP lives here.
- **pivot** — one step of simplex: swap one binding constraint for another, moving along an edge to an adjacent vertex while improving the objective.
- **simplex method** — Dantzig's vertex-walking LP algorithm: start at a vertex, pivot to better neighbors, stop when none improves.
- **ratio test** — the rule that decides how far you can move along an entering edge before a constraint binds: minimum of `rhsᵢ / coefᵢ` over rows with positive coefficient. Picks which wall you hit first.
- **shadow price (dual variable)** — the marginal value of relaxing a constraint by one unit; `\$6.25/kg` beans, `\$7.50/roaster-hr` here. Zero for any slack (non-binding) resource.
- **complementary slackness** — primal slack × dual price = 0 for every constraint: a non-binding resource has price 0; a positively-priced resource is fully used.
- **strong duality** — primal optimum equals dual optimum (zero gap). Automatic for any feasible, bounded LP.
- **interior-point method** — an alternative LP/convex solver that cuts through the region's interior along a central path, with polynomial-time guarantees; complements simplex's boundary walk.

**CrossLinks**
```jsx
<CrossLink to="duality-shadow-prices" recap="duality prices your resources from the other side; λ* = ∂(optimal value)/∂budget">
  We met these shadow prices on the curved Roastery
</CrossLink>
<CrossLink to="kkt-conditions" recap="stationarity + primal feasibility + dual feasibility (λ≥0) + complementary slackness">
  LP duality is just KKT with straight walls
</CrossLink>
<CrossLink to="constraints-lagrange" recap="∇f = λ∇g at the tangency where the objective contour kisses the wall">
  The same wall-push-back picture, now linear
</CrossLink>
<CrossLink to="integer-bnb" recap="whole bags only; LP relaxation as a bound; branch, bound, prune">
  Next: force whole bags and the corner stops being the answer
</CrossLink>
<CrossLink to="convexity-watershed" recap="convex set + linear objective ⇒ every local optimum is global">
  Why simplex never gets trapped: the feasible set is convex
</CrossLink>
```

**Tease forward to card 13 (one sentence in the carry-this or a `<Chip>`):** "Now demand whole bags only: `x` must be integer. The LP optimum (16.25, 7.5) isn't integer, and naive rounding to (16, 8) is *infeasible* — that's where branch-and-bound earns its keep." (The integer optimum (15, 9) at profit 198 is card 13's payload; mention only the hook here.)


### Verified constants — lp-simplex
## Verified constants — Card 12 (LP & Simplex), The Roastery

All independently recomputed in hand-rolled Node (vertex enumeration over C(5,2)=10 pairwise line intersections + dual solve, no solver libs). Duality gap = 0 to machine precision (~2.8e-14). Every spec number is correct as written — freeze as-is.

### Problem
- Maximize `9·x1 + 7·x2`, `c = (9, 7)` $/kg
- `A = [[1.2,1.0],[0.20,0.10],[0.10,0.15]]`, `b = (27, 4, 4)` (beans, roaster, labor), `x ≥ 0`

### Feasible polygon — exactly 5 vertices (pentagon)
| Vertex | (x1, x2) | obj `9x1+7x2` | binding walls |
|---|---|---|---|
| O | (0, 0) | $0.00 | x1=0, x2=0 |
| A | (20, 0) | $180.00 | roaster, x2=0 |
| **B ★** | (16.25, 7.5) | **$198.75** | **beans + roaster** (LP optimum) |
| C | (0.625, 26.25) | $189.375 | beans + labor |
| D | (0, 80/3 = 26.6667) | 560/3 = $186.667 | labor, x1=0 |

### LP optimum & slack
- `LP_OPT = {x: [16.25, 7.5], obj: 198.75, binding: ['beans','roaster']}`
- Slack at optimum: beans = 0, roaster = 0, labor = 1.25 (2.75 of 4 labor-h used)

### Shadow prices (dual) — gap = 0
- `SHADOW = {beans: 6.25, roaster: 7.50, labor: 0.00}` ($/kg, $/roaster-h, $/labor-h)
- Dual obj = 27·6.25 + 4·7.50 + 4·0 = 168.75 + 30 = $198.75 = primal (zero gap, verified)
- Dual binding system (y_labor=0): `1.2·y_beans + 0.20·y_roaster = 9`, `1.0·y_beans + 0.10·y_roaster = 7` → y_beans=6.25, y_roaster=7.50

### Slopes (dx2/dx1)
- iso-profit `-9/7 = -1.2857`; beans `-1.2`; roaster `-2.0`; labor `-0.10/0.15 = -0.6667`
- iso slope strictly between beans (-1.2) and roaster (-2.0); parallel to none → unique vertex B

### Simplex
- Dantzig path `O → A → B` (2 pivots): $0 → $180 → $198.75 (monotone ↑)
- Alt path `O → D → C → B` (3 pivots): $0 → $186.667 → $189.375 → $198.75 (monotone ↑)
- Ratio test from O entering x1 (x2=0): roaster 4/0.20=20, beans 27/1.2=22.5, labor 4/0.10=40 → min 20 → A=(20,0)
- From B: ΔB→A = -$18.75, ΔB→C = -$9.375 (both decrease → stop)

### Integer / rounding tease (card 13 hook)
- round(LP)=(16,8) is **INFEASIBLE**: beans = 27.2 > 27 (roaster 4.0 ok, labor 2.8 ok)
- Integer optimum = **(15, 9), profit 198, UNIQUE** (brute force over x1∈[0,25], x2∈[0,30], single maximizer)

### Predict comparison
- Smooth concave-constrained optimum ≈ (16.36, 7.27): roaster binds (4.0001), beans slack ≈ 0.0902 — distinct from LP corner B which binds both beans and roaster.


---

## Cluster: discrete-ilp-dp-flows — cards 13 (Integer programming & branch-and-bound), 14 (Dynamic programming), 15 (Network flows, matching & greedy)
_verification: corrections applied — see register_

## Cluster: The Discrete Wing — Cards 13–15

All numbers below were recomputed and brute-force–verified in Node (hand-rolled vertex-enumeration LP, recursive B&B, full DP table, permutation/Kruskal/Ford–Fulkerson brute force). Freeze the constants at module scope. Accent palette per the identity register: discrete wing leans **amber** (walls/constraints/integers) with **rose** for infeasible/prune and **fuchsia** for anchor/cross-links.

---

### Card 13 — Integer programming & branch-and-bound

**(a) Header**
- `id="ilp"`, `icon={GitBranch}` (lucide), `accent="amber"`, `anchor={true}` (it re-solves the Roastery), `index={13}`.
- `source`: "Land–Doig (1960), branch and bound; Bertsimas & Tsitsiklis ch. 11."
- One-line purpose: *Whole bags only — why you can't just round the LP answer, and how a tree of LP relaxations finds the true integer optimum by bounding and pruning.*

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> The LP says make 16.25 kg of Espresso and 7.5 kg of Filter. But you sell whole bags — fractions are meaningless. The lazy fix is to round: 16 and 8. That point spends 27.2 kg of green beans, and you only have 27 — it's *infeasible*. Integrality isn't a rounding nuisance; it shatters the smooth feasible polygon into a scatter of lattice points, and the best one can sit a surprising distance from where the LP pointed.

**(c) Headline equations** (KaTeX with color macros):
- The integer program (display `<Block>`):
  `\max\; \obj{9x_1 + 7x_2}\quad\text{s.t.}\quad \con{1.2x_1 + x_2 \le 27},\;\; \con{0.2x_1 + 0.1x_2 \le 4},\;\; \con{0.1x_1 + 0.15x_2 \le 4},\quad x_1,x_2 \in \mathbb{Z}_{\ge 0}`
- The bounding principle (inline `<Eq>`, the heart of B&B):
  `\obj{z_{\text{LP}}} \;\ge\; \obj{z_{\text{ILP}}}`
  with read-as: "drop the integer requirement and you can only do *better* — so the LP relaxation's value is an upper bound on the best integer value. If that bound is already worse than an integer solution you've banked, the whole branch is dead."
- `<ReadEq>`: "Relax the integers, solve the easy LP, get **198.75**. The true integer best is **198**. The gap of **0.75** is the room the tree has to search; every node shrinks it."

**(d) LIVE INTERACTIVE — "The branch-and-bound tree, animated over the polygon"**

Two linked panels, side by side, replaying on viewport entry (`useReplayOnEnter` + `RafGate`).

*Left panel — the feasible polygon (reuse the LP card's geometry).* Axes: `x₁` (Espresso) on x, range [0, 20]; `x₂` (Filter) on y, range [0, 14]. Draw the three constraint walls as amber lines, the feasible polygon shaded, and the **integer lattice** as small dots at every (integer, integer) feasible point. As the tree animation steps, shade the *current node's sub-box* (the added `x₁≤k` / `x₂≥k` cut) and mark the node's LP-relaxation optimum with a ring; color the ring emerald when it lands on a lattice point (integer-feasible), rose when the sub-box is empty (infeasible).

*Right panel — the tree itself.* Nodes laid out top-down. Animate node-by-node in **creation (DFS) order**. Each node shows its LP optimum `(x₁,x₂)`, its bound `z`, and a one-word verdict badge. The **exact verified tree** (freeze this array; do NOT re-derive in the component — the live "solve" is just replaying these 7 nodes):

| # | Added cuts | LP relax. optimum | Bound z | Action |
|---|---|---|---|---|
| 0 | (root) | (16.25, 7.5) | **198.75** | fractional → **branch on x₂** (frac .5) |
| 1 | x₂ ≤ 7 | (16.5, 7) | 197.5 | fractional → **branch on x₁** (frac .5) |
| 2 | x₂ ≤ 7, x₁ ≤ 16 | (16, 7) | 193 | integer → **incumbent = 193** |
| 3 | x₂ ≤ 7, x₁ ≥ 17 | (17, 6) | 195 | integer → **incumbent = 195** |
| 4 | x₂ ≥ 8 | (15.833, 8) | 198.5 | 198.5 > 195 → fractional → **branch on x₁** (frac .833) |
| 5 | x₂ ≥ 8, x₁ ≤ 15 | (15, 9) | **198** | integer → **incumbent = 198** (optimal) |
| 6 | x₂ ≥ 8, x₁ ≥ 16 | — empty — | — | **infeasible → prune** (1.2·16+8 = 27.2 > 27) |

Branching rule to state in a caption: *most-fractional variable* (the var whose LP value is farthest from an integer); at the root x₂=7.5 (distance 0.5) beats x₁=16.25 (distance 0.25), so we branch x₂ first. Pruning rule: a node dies if (i) its sub-box is empty, or (ii) its bound `z ≤ incumbent`.

*Controls:*
- **Step / Play / Reset** buttons to walk the 7 nodes (default auto-plays once on entry).
- A toggle **"show naive rounding"** that drops a rose ✗ marker on (16, 8) in the left panel with a tooltip "27.2 kg beans needed > 27 available — infeasible," and a green ✓ on the true optimum (15, 9).
- A toggle **"prune on/off"**: with pruning off, narrate that node #4's bound 198.5 still beats the incumbent 195 so it *must* be explored; there is nothing to prune in this tiny tree except the infeasible node #6, which makes the honest point that pruning power grows with problem size.

Verified demo constants to freeze: root bound 198.75; node bounds [198.75, 197.5, 193, 195, 198.5, 198, ∞-pruned]; integer optimum (15,9) profit 198; rounded LP (16,8) infeasible at 27.2 kg beans.

**(e) Carry-this** (`<MinSchema>`):
> **The LP relaxation is a bound, not an answer.** Branch-and-bound brackets the integer optimum between a relaxed upper bound and the best integer solution found so far, then kills any branch whose bound can't beat what you already have.

**(f) Supporting blocks**

- `<Predict question="The LP optimum is (16.25, 7.5). Round to the nearest whole bags — is (16, 8) a valid production plan?">` reveal: *No. (16, 8) needs 1.2·16 + 8 = **27.2 kg** of green beans, but you only stock **27**. Rounding overshot a binding wall. The true integer optimum is (15, 9), profit **$198** — found two branches deep, not by rounding.*

- `<Misconception wrong="Just solve the LP and round to the nearest integers." right="Rounding can land outside the feasible region or miss the optimum entirely — you must search the lattice." because="The optimum lives at a polygon vertex; the nearest lattice point to that vertex may violate a constraint (here 27.2 > 27 kg beans) or simply be beaten by a farther-away point. (15,9) beats round(16,8) and is feasible; (16,8) is not.">`

- `<Worked title="Why node #6 dies on sight">`: On the branch x₂ ≥ 8 **and** x₁ ≥ 16, the beans wall demands 1.2·16 + 1·8 = 27.2 kg ≤ 27 — impossible. No LP needed; the sub-box is empty, so we prune without computing anything. Meanwhile its sibling node #5 (x₂ ≥ 8, x₁ ≤ 15) yields the integer point (15, 9) at profit 198, which matches the parent bound 198.5 closely enough that no remaining open node can beat it — search terminates.

- `<Deeper title="Why integrality jumps from easy to NP-hard">`: LP is solvable in polynomial time (simplex is fast in practice; interior-point is provably polynomial). Adding `x ∈ ℤ` makes the problem **NP-hard** in general — there is no known polynomial algorithm, and B&B's tree can blow up exponentially. The tradeoff lever is the **bound quality**: tighter relaxations (adding *cutting planes* that shave off fractional vertices without removing lattice points) prune more aggressively, which is why modern solvers are "branch-and-*cut*." Here the relaxation is already tight — the gap is only 0.75 and the tree has 7 nodes — but a problem with 100 binary "run this line?" variables has 2¹⁰⁰ candidate points, and only good bounds keep the search finite. *Why/tradeoff:* spend more per node sharpening the bound, or branch more and bound cheaply — every MIP solver tunes this balance.

- `<QA items={[
  {q:"What does the LP relaxation actually give you?", a:"An upper bound (for a max problem) on the best achievable integer objective — 198.75 here — plus a fractional point to branch on."},
  {q:"How do you know (15,9) is optimal and not just feasible?", a:"Every other open branch has a bound ≤ 198 once the incumbent reaches 198, so nothing unexplored can beat it. Brute force confirms (15,9) at 198 is the unique integer optimum."},
  {q:"Why branch on x₂ first?", a:"Most-fractional rule: x₂=7.5 is 0.5 from an integer, x₁=16.25 is only 0.25. Branching on the more-fractional variable tends to tighten the bound faster."}
]}/>`

- Glossary `<Term>`s: **LP relaxation** = "drop the integer constraints, solve the resulting continuous LP; its optimum bounds the integer optimum." **Bound** = "a provable limit on how good any solution in a subtree can be." **Prune** = "discard a subtree without exploring it, because its bound can't beat the incumbent or its region is empty." **Incumbent** = "the best integer-feasible solution found so far."

- CrossLinks: `<CrossLink to="lp" recap="the LP optimum (16.25, 7.5) at the beans∩roaster vertex">the simplex card</CrossLink>` (each B&B node is one LP solve); `<CrossLink to="dp" recap="another way to crack a hard discrete problem">dynamic programming</CrossLink>`; `<CrossLink to="anchor" recap="the integer twist on the scorecard">the Roastery scorecard</CrossLink>`.

---

### Card 14 — Dynamic programming

**(a) Header**
- `id="dp"`, `icon={Table2}` (lucide; alternative `Grid3x3`), `accent="amber"`, `anchor={false}` (uses a Roastery-flavored side problem, not the core polygon), `index={14}`.
- `source`: "Bellman (1957), principle of optimality."
- One-line purpose: *Break a hard discrete choice into overlapping subproblems, solve each once, and store the answer — the knapsack table, where greedy-by-ratio provably loses.*

**(b) Intuition opener:**
> Five regular cafes each want a standing weekly order. You only have 10 roaster-hours to commit. Each order costs some hours and earns some profit — accept which ones? The "obvious" move is to rank by profit-per-hour and take the best until you run out. That greedy instinct is *wrong* here, and dynamic programming shows exactly why: the best use of 10 hours is built from the best use of fewer hours, computed once and remembered.

**(c) Headline equations:**
- Bellman recurrence for 0/1 knapsack (`<Block>`):
  `\obj{V(i, c)} = \max\Big(\;\underbrace{\obj{V(i{-}1,\, c)}}_{\text{skip order } i},\;\; \underbrace{\obj{V(i{-}1,\, c - w_i)} + v_i}_{\text{accept order } i}\;\Big)`
- `<ReadEq>`: "The best value using the first `i` orders with `c` hours left is the better of two worlds: pretend order `i` doesn't exist, or accept it — pay its `wᵢ` hours and bank its `vᵢ` profit, then ask the same question about the orders before it. The whole table is this one line, filled left-to-right, top-to-bottom."
- `<MinSchema>`-adjacent note on the two structural conditions: **optimal substructure** (the optimum contains optima of subproblems) + **overlapping subproblems** (the same `V(i,c)` is needed many times → memoize).

**(d) LIVE INTERACTIVE — "Watch the knapsack table fill, and watch greedy stall"**

*The fixed instance (freeze).* Capacity **C = 10** roaster-hours. Five orders:

| Order | Cafe | Hours wᵢ | Profit vᵢ | Ratio vᵢ/wᵢ |
|---|---|---|---|---|
| A | Cafe Aurora | 5 | 60 | 12.0 |
| B | Bean Bros | 3 | 30 | 10.0 |
| C | Corner Cup | 4 | 50 | **12.5** |
| D | Daily Grind | 2 | 20 | 10.0 |
| E | Espresso Lab | 5 | 55 | 11.0 |

*Panel 1 — the DP grid.* A 6-row × 11-column table (rows i = 0…5 for "first i orders," columns c = 0…10 for capacity). Cells animate in fill order (row by row, left to right). Each cell highlights its two source cells when computed: `V(i-1,c)` (directly above) and `V(i-1, c-wᵢ)` (above and `wᵢ` to the left) with a small arrow; the winning argument flashes. **Verified final table** (freeze; rows labeled by the order just considered):

```
        c:  0  1  2  3  4  5  6  7  8  9 10
none:       0  0  0  0  0  0  0  0  0  0  0
+A(5,60):   0  0  0  0  0 60 60 60 60 60 60
+B(3,30):   0  0  0 30 30 60 60 60 90 90 90
+C(4,50):   0  0  0 30 50 60 60 80 90 110 110
+D(2,20):   0  0 20 30 50 60 70 80 90 110 110
+E(5,55):   0  0 20 30 50 60 70 80 90 110 115
```

The answer cell `V(5,10) = 115` glows. Backtracking arrows (toggle) trace the optimal set: **{A, E}**, profit **115**, hours 5+5 = 10. The decisive step to narrate: `V(5,10) = max(V(4,10)=110, V(4,5)+55 = 60+55 = 115) = 115` — accepting E (Espresso Lab) by displacing the greedy pick.

*Panel 2 — greedy race.* A small bar/queue showing greedy-by-ratio picking in order **C (12.5) → A (12.0)**, accumulating weight 4 → 9, value 50 → 110, then **stalling**: E, B, D each overflow the remaining 1 hour. Big readout: **Greedy = $110**, **DP optimal = $115**, a rose "greedy leaves $5 on the table" badge.

*Controls:*
- **Play / Step / Reset** for the table fill.
- **Toggle "show backtrack"** (draws the {A,E} recovery path).
- **Toggle "greedy vs DP"** to run/replay the greedy race beside the table.
- (Optional) a **capacity slider C ∈ [6,12]**: it re-runs the DP live (cheap — 6×13 table). State that at C=10 greedy=110 < DP=115; the slider lets the reader find where greedy happens to tie (e.g., very large C fits everything). Keep C=10 as the frozen headline.

Verified demo constants: DP optimum 115 = {A,E}; greedy-by-ratio 110 = {C,A}; gap 5; ratio order C(12.5) > A(12.0) > E(11.0) > B(10.0) > D(10.0).

**(e) Carry-this** (`<MinSchema>`):
> **Solve each subproblem once, store it, reuse it.** When a problem has optimal substructure and overlapping subproblems, a table beats both brute force (it's polynomial, not exponential) and greedy (it's *correct* — greedy here loses $5 by grabbing the best ratio first).

**(f) Supporting blocks**

- `<Predict question="Orders ranked by profit-per-hour: C(12.5), A(12.0), E(11.0). With 10 hours, greedy takes C then A. What total profit, and is it optimal?">` reveal: *Greedy banks **$110** (C+A, 9 hours) then stalls — every remaining order overflows the last hour. But accepting **A + E** instead (Espresso Lab over Corner Cup) earns **$115** using all 10 hours. Greedy's first grab of the best *ratio* locked it out of the better *combination*.*

- `<Misconception wrong="Take the highest value-per-weight items first — that maximizes the knapsack." right="Ratio-greedy is optimal for the *fractional* knapsack, but 0/1 (whole orders) needs DP." because="When you can't split an order, a high-ratio item can crowd out a pair that fits the capacity exactly. Here C(ratio 12.5)+A leaves 1 idle hour at $110, while A+E fills all 10 at $115.">`

- `<Worked title="Reading one cell">`: `V(3,7)` = best of first three orders (A,B,C) with 7 hours. Skip C → `V(2,7) = 60` (just A). Accept C → `V(2, 7-4=3) + 50 = 30 + 50 = 80`. Max is **80** — that's the table's cell. Notice it reuses `V(2,3)=30`, already computed for an earlier column: that *reuse* is the whole point of memoization.

- `<Deeper title="Bellman, complexity, and the pseudo-polynomial catch">`: The recurrence is the discrete cousin of the **Hamilton–Jacobi–Bellman** equation in control — value functions and the principle of optimality are the same idea (cross-link control-theory). Cost: the table is `O(n·C)` = 5·11 = 55 cells, each O(1) — vastly better than 2⁵ = 32 brute-force subsets here, and the gap explodes with size. **Catch:** `O(nC)` is *pseudo-polynomial* — it scales with the *numeric value* of the capacity, not its bit-length, so a capacity of 10⁹ makes the table astronomically tall even with few items. 0/1 knapsack is NP-hard; DP is fast only when capacities are modest. *Why/tradeoff:* DP trades memory (the whole table) for never recomputing — pay `O(nC)` storage to buy a polynomial-in-value runtime.

- `<QA items={[
  {q:"What makes a problem suitable for DP?", a:"Optimal substructure (the optimum decomposes into sub-optima) plus overlapping subproblems (the same sub-question recurs, so you store answers instead of recomputing)."},
  {q:"When IS greedy-by-ratio optimal?", a:"For the FRACTIONAL knapsack, where you can take part of an order — then filling by descending ratio is provably optimal. The 0/1 (all-or-nothing) version breaks it."},
  {q:"Why is the optimal set {A,E} and not {C,A}?", a:"{A,E} uses all 10 hours for $115; {C,A} uses 9 and can fit nothing more, banking only $110. The DP backtrack from V(5,10) recovers {A,E}."}
]}/>`

- Glossary `<Term>`s: **Optimal substructure** = "the optimal solution is composed of optimal solutions to subproblems." **Overlapping subproblems** = "the same subproblem is solved many times in a naive recursion — memoizing it is the speedup." **Memoization** = "store each subproblem's answer the first time you compute it." **Bellman equation** = "the recurrence expressing a value as the best immediate choice plus the value of the resulting subproblem."

- CrossLinks: `<CrossLink to="control-theory" recap="Bellman's principle in continuous time = the HJB equation">control theory</CrossLink>`; `<CrossLink to="reinforcement-learning" recap="value iteration is this recurrence on states">reinforcement learning</CrossLink>`; `<CrossLink to="flows" recap="when greedy actually IS provably optimal">flows, matching & greedy</CrossLink>`.

---

### Card 15 — Network flows, matching & greedy

**(a) Header**
- `id="flows"`, `icon={Workflow}` (lucide; alternative `Share2` / `Network`), `accent="amber"`, `anchor={false}` (Roastery delivery routing flavor), `index={15}`.
- `source`: "Ford–Fulkerson max-flow/min-cut; Birkhoff–von Neumann integrality; Edmonds, matroids & greedy."
- One-line purpose: *Routing, matching, and the question that ties the whole discrete wing together — when does the LP hand you integers for free, and when is plain greedy provably optimal?*

**(b) Intuition opener:**
> Some discrete problems are secretly easy. Route deliveries through your hubs to the city, match each roast batch to a van, push flow through a network — and the linear program, with no integer constraints at all, *spontaneously* returns whole-number answers. No branch-and-bound needed. The structure (a network, a bipartite match, a matroid) is doing the rounding for you. The flip side: greedy is gloriously correct on a matroid and quietly wrong on an assignment.

**(c) Headline equations:**
- Max-flow / min-cut duality (`<Block>`):
  `\obj{\max_{\text{flow}}\; |f|} \;=\; \con{\min_{\text{cut}}\; \text{cap}(S, \bar S)}`
- `<ReadEq>`: "The most you can push from source to sink equals the cheapest set of pipes whose removal disconnects them. The bottleneck *is* the answer — flow and cut are primal and dual, and they meet exactly (strong duality, integral version)."
- Assignment / min-cost matching (`<Block>`):
  `\min \sum_{i,j} \obj{c_{ij}}\, x_{ij}\quad \text{s.t.}\;\; \sum_j x_{ij}=1,\;\; \sum_i x_{ij}=1,\;\; x_{ij}\in\{0,1\}`
  with the magic noted inline: `x_{ij}\in\{0,1\}` can be relaxed to `x_{ij}\ge 0` and the LP optimum is **still integral** (the assignment polytope's vertices are permutation matrices — Birkhoff).

**(d) LIVE INTERACTIVE — "Two networks: a flow you can max out, and a match greedy gets wrong"**

*Panel A — max-flow / min-cut (Ford–Fulkerson).* A 4-node DAG drawn left→right: **Roastery (source)** → two hubs **HubN**, **HubS** → **City (sink)**. Edge capacities (freeze): Roastery→HubN = 12, Roastery→HubS = 8, HubN→HubS = 3, HubN→City = 6, HubS→City = 9. Animate the augmenting paths in order, each tube thickening as flow is pushed:
1. Roastery → HubN → City, bottleneck **6**
2. Roastery → HubS → City, bottleneck **8**
3. Roastery → HubN → HubS → City (cross-hub augment), bottleneck **1**

Running total **6 → 14 → 15**. Final **max-flow = 15**. Then reveal the **min-cut** in rose: the edges {HubN→City (6), HubS→City (9)} = **15** — the *delivery-into-city* capacity is the true bottleneck, NOT the source edges (which total 20). Caption: "max-flow = min-cut = 15; the constraint is the last mile, not the supply."
- Controls: **Step / Play / Reset** through the three augmenting paths; **toggle "show min-cut"** (draws the cut line separating {Roastery,HubN,HubS} from {City} and tallies 6+9=15); a small legend (HTML chips above the SVG): blue=capacity, emerald=flow, rose=cut.

*Panel B — min-cost assignment + the greedy trap.* A 3×3 bipartite graph: three roast batches {Espresso, Filter, Decaf} on the left, three routes {North, Central, South} on the right. Cost matrix (freeze):

| | North | Central | South |
|---|---|---|---|
| **Espresso** | 2 | 6 | 9 |
| **Filter** | 7 | 3 | 8 |
| **Decaf** | 5 | **1** | 4 |

- The **optimal matching** (verified unique): Espresso→North (2), Filter→Central (3), Decaf→South (4) = **$9**.
- **Greedy-cheapest-cell** trap: it grabs the global-cheapest cell first — Decaf→Central ($1) — which forces Espresso→North (2) and Filter→South (8), total **$11**. Greedy overshoots by **$2**.
- Animate: greedy lights cells in ascending cost (1, then 2, then forced 8), landing at $11 in rose; then the optimal matching draws in emerald at $9. Side readout: **Greedy $11 vs Optimal $9**.
- Controls: **toggle "greedy vs optimal"**; **"show LP-integral"** note — relaxing `x_{ij}∈{0,1}` to `≥0` and solving the LP returns the same permutation matrix (no fractional matching), the Birkhoff integrality magic.

Verified demo constants: max-flow 15, min-cut {6,9}=15, source edges total 20 (not the cut); assignment optimum $9 (unique, perm Espresso→N, Filter→C, Decaf→S), greedy-cheapest-cell $11.

**(e) Carry-this** (`<MinSchema>`):
> **Structure decides difficulty.** Network-flow and matching LPs return integers automatically (totally-unimodular / Birkhoff) — no B&B needed. Greedy is *provably* optimal on a matroid (e.g. minimum spanning tree) and *provably fallible* elsewhere (the assignment above: greedy $11, optimal $9).

**(f) Supporting blocks**

- `<Predict question="Greedy grabs the cheapest cell first: Decaf→Central at $1. Can it reach the $9 optimum?">` reveal: *No. Taking the $1 cell forces Espresso→North ($2) and Filter→South ($8) — total **$11**. The optimum routes Decaf→South ($4) instead, freeing Filter→Central ($3): total **$9**. The locally cheapest first move was a $2 mistake.*

- `<Misconception wrong="Greedy is a heuristic that's usually close but never guaranteed." right="On a matroid, greedy is EXACTLY optimal — provably. Off a matroid (like assignment), it can fail by any margin." because="The matroid exchange property guarantees that locally-best choices stay globally compatible; that's why Kruskal's MST greedy is optimal. Assignment constraints are not a matroid, so greedy-cheapest-cell breaks (here $11 vs $9).">`

- `<Worked title="Greedy MST — where greedy is law">`: A tiny network — warehouse **W** and cafes **1, 2, 3** — with link costs W–1 = 1, 1–2 = 2, 2–3 = 3, W–2 = 4, W–3 = 5, 1–3 = 6. Kruskal's greedy: sort edges ascending, add the cheapest that doesn't form a cycle → take W–1 (1), 1–2 (2), 2–3 (3); skip the rest. Total = **6**, and brute force over all spanning trees confirms 6 is optimal. Spanning trees form a **matroid**, so greedy here isn't lucky — it's guaranteed.

- `<Deeper title="Total unimodularity, Birkhoff, and the matroid condition">`: Why do flow and assignment LPs give integers for free? Their constraint matrices are **totally unimodular** (every square submatrix has determinant 0, ±1); with integer right-hand sides, every vertex of the polytope is integral, so the LP optimum is automatically integer — that's the integral-polytope magic. The assignment polytope (doubly-stochastic matrices) has exactly the **permutation matrices** as vertices (Birkhoff–von Neumann), so an LP relaxation never returns a fractional matching. **Greedy's guarantee:** a system is a *matroid* iff it satisfies the exchange property (if independent set A is smaller than independent set B, some element of B can be added to A keeping it independent); **greedy maximizes a weight function over independent sets if and only if the structure is a matroid** (Rado–Edmonds). Forests are a matroid → MST greedy works. Assignments are *not* a matroid → greedy-cheapest-cell fails. *Why/tradeoff:* recognizing the structure is the whole game — spotting that your problem is a flow or a matroid means you skip the exponential search entirely and trust a polynomial algorithm.

- `<QA items={[
  {q:"Why does the assignment LP give integers without integer constraints?", a:"Its constraint matrix is totally unimodular and the RHS is integral, so every polytope vertex is integral. The assignment polytope's vertices are exactly permutation matrices (Birkhoff)."},
  {q:"What's the min-cut and why does it equal the max-flow?", a:"Here the min-cut is {HubN→City (6), HubS→City (9)} = 15, equal to max-flow 15. By LP duality (max-flow/min-cut theorem) the cheapest disconnecting cut always equals the maximum flow."},
  {q:"When can I trust greedy?", a:"When the feasible structure is a matroid (e.g. spanning forests → Kruskal's MST). Then greedy is provably optimal. Off a matroid, like the assignment problem, greedy can be strictly worse ($11 vs $9 here)."}
]}/>`

- Glossary `<Term>`s: **Augmenting path** = "a source→sink path with spare capacity along every edge; pushing flow along it increases total flow." **Min-cut** = "the cheapest set of edges whose removal disconnects source from sink; its capacity equals the max-flow." **Totally unimodular** = "a matrix whose every square submatrix has determinant 0 or ±1 — guarantees integer LP vertices." **Matroid** = "a set system with the exchange property; the structure on which greedy is exactly optimal." **Assignment problem** = "min-cost perfect matching in a bipartite graph — match each left node to one right node."

- CrossLinks: `<CrossLink to="lp" recap="flow/matching are LPs whose vertices happen to be integral">linear programming</CrossLink>`; `<CrossLink to="ilp" recap="contrast — general integer programs DON'T round for free, hence B&B">branch-and-bound</CrossLink>`; `<CrossLink to="dp" recap="another polynomial conqueror of a discrete problem">dynamic programming</CrossLink>`; `<CrossLink to="duality" recap="max-flow/min-cut IS LP duality wearing a network costume">duality & shadow prices</CrossLink>`.

### Verified constants — discrete-ilp-dp-flows
## Verified constants — The Discrete Wing (Cards 13–15)

### Card 13 — Integer programming / Branch-and-bound (the Roastery)
- LP relaxation (root): **(16.25, 7.5)**, objective **198.75**.
- Integer optimum: **(15, 9)**, profit **198** — UNIQUE among feasible integer points (brute-force verified).
- round(LP) = (16, 8) is **INFEASIBLE**: 1.2·16 + 1·8 = **27.2 kg** beans > 27.
- Integrality gap root→integer = 198.75 − 198 = **0.75**.
- (15,9) resource usage: beans **27.0**, roaster **3.9**, labor **2.85**; profit 9·15 + 7·9 = **198**.
- Most-fractional branching at root: x₂=7.5 (dist 0.5) beats x₁=16.25 (dist 0.25) → branch x₂ first.
- **Verified 7-node B&B tree** (freeze exactly):

| # | Cuts | LP optimum | Bound z | Action |
|---|---|---|---|---|
| 0 | (root) | (16.25, 7.5) | 198.75 | fractional → branch x₂ |
| 1 | x₂≤7 | (16.5, 7) | 197.5 | fractional → branch x₁ |
| 2 | x₂≤7, x₁≤16 | (16, 7) | 193 | integer → incumbent 193 |
| 3 | x₂≤7, x₁≥17 | (17, 6) | 195 | integer → incumbent 195 |
| 4 | x₂≥8 | (15.8333, 8) | 198.5 | fractional → branch x₁ |
| 5 | x₂≥8, x₁≤15 | (15, 9) | 198 | integer → incumbent 198 (optimal) |
| 6 | x₂≥8, x₁≥16 | — empty — | — | infeasible (27.2 kg beans) → prune |

- LP shadow prices: green beans **$6.25**, roaster-hours **$7.50**, labor **$0.00**; dual objective 27·6.25 + 4·7.50 = **198.75** = LP primal.

### Card 14 — Dynamic programming (0/1 knapsack)
- Instance: capacity **C = 10**; items A(w5,v60), B(w3,v30), C(w4,v50), D(w2,v20), E(w5,v55).
- Ratios: A=12.0, B=10.0, **C=12.5**, D=10.0, E=11.0; descending **C > A > E > B > D**.
- Greedy-by-ratio = **$110** ({C, A}, weight 9, leftover cap 1; E/B/D all overflow).
- DP optimum = **$115** = {**A, E**}, weight 5+5 = 10. Greedy is suboptimal by **$5**.
- Decisive cell: V(5,10) = max(V(4,10)=110, V(4,5)+55=60+55=115) = **115**.
- V(3,7) = max(V(2,7)=60, V(2,3)+50=30+50=80) = **80**.
- Final row +E(5,55) across c=0..10: **[0,0,20,30,50,60,70,80,90,110,115]**.
- **CORRECTION — table size: 6 rows × 11 columns = 66 cells, NOT 55.** (6·11 = 66. The number 55 = 5·11 = n·C is a *different* count used in the complexity Deeper block and is fine there.) Brute force over 2⁵ = 32 subsets confirms optimum 115.

### Card 15 — Flows, matching & greedy
- Max-flow Roastery→City = **15**; capacities R→HubN 12, R→HubS 8, HubN→HubS 3, HubN→City 6, HubS→City 9.
- Augmenting paths: R-HubN-City (6), R-HubS-City (8), R-HubN-HubS-City (1); sum = **15**.
- Min-cut = {HubN→City (6), HubS→City (9)} = **15**; source-out edges total = 12+8 = **20** (≠ cut).
- Assignment cost [[2,6,9],[7,3,8],[5,1,4]]; min-cost = **$9** (Espresso→North 2, Filter→Central 3, Decaf→South 4), **UNIQUE** (2nd-best = $11).
- Greedy-cheapest-cell = **$11** (Decaf→Central 1, Espresso→North 2, Filter→South 8) — overshoots optimum by $2.
- MST edges W-1=1, 1-2=2, 2-3=3, W-2=4, W-3=5, 1-3=6; Kruskal MST = {W-1(1), 1-2(2), 2-3(3)} total **6** = brute-force optimum.


---

## Cluster: stochastic-nonconvex-global — cards 16 (Stochastic & SGD/Adam), 17 (Non-convexity & saddles), 18 (Global & black-box)
_verification: ALL CONFIRMED_

## Cluster V build spec — Cards 16, 17, 18 ("When the landscape fights back")

This cluster is the climax of the continuous story: the landscape stops being a clean static bowl. Card 16 *blurs* it (noisy gradients → SGD/Adam), Card 17 makes it *bumpy* (many minima, saddles dominate), Card 18 hands you a landscape you can't even differentiate (black-box → SA, BayesOpt). All three are accent **rose** (the "fights back" / non-convex / divergence color from the identity register). None carry the anchor flag (the Roastery anchor lives on cards 2/6/9/11/19); these three reference the Roastery only as a noisy-demand twist on the *same* shop, and otherwise use purpose-built demo functions.

Three module-scope frozen demo functions (all verified in Node, see riskyClaims):

```js
// FROZEN DEMO CONSTANTS (module scope)
// 1-D multi-well used in Card 17 opener + 1-D basin demo
const f1 = x => x**4 - 4*x**2 + 0.5*x;        // f'(x)=4x^3-8x+0.5, f''(x)=12x^2-8
//   minima: x=-1.444485 (f=-4.714754, GLOBAL), x=+1.381862 (f=-3.300886)
//   max(1-D saddle): x=+0.062623 (f=+0.015640)
// 2-D double-well used in Card 17 basins-of-attraction interactive
const f2 = (x,y) => (x*x-1)**2 + y*y + 0.3*x;  // fx=4x^3-4x+0.3, fy=2y
//   min A: (-1.035579, 0) f=-0.305428 (eigs 8.869, 2)  GLOBAL
//   min B: (+0.960150, 0) f=+0.294146 (eigs 7.063, 2)
//   saddle: (+0.075429, 0) f=+1.011282 (eigs -3.932, 2)
// 1-D black-box objective used in Card 18 SA + BayesOpt (minimization)
const fbb = x => Math.sin(3*x) + 0.5*x;        // on [0,5], several local minima + global trend
```

---

# CARD 16 — Stochastic optimization & SGD/Adam

**(a) Header.** `id="stochastic-sgd"` · icon `Waves` (lucide) · accent `rose` · `anchor={false}` · index 16. Subtitle: *"a blurred compass — and the optimizers that thrive on it."* Source: Ruder, "An overview of gradient descent optimization algorithms"; Kingma & Ba, "Adam" (arXiv:1412.6980). **One-line purpose:** when each step sees only a *noisy estimate* of the gradient, descent becomes a random walk that settles into a noise ball, not a point — and Adam is the trick that gives every coordinate its own self-tuned step.

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> Until now the compass pointed *exactly* downhill. But suppose you only get to read it on a foggy day — each glance gives the true direction plus a random kick. That is the world of machine learning: you never see the gradient of the *whole* dataset, only a noisy sample from one mini-batch. Descent stops being a clean glide and becomes a tipsy walk downhill: it still drifts toward the valley, but near the bottom it can't sit still — it rattles around inside a small "noise ball" whose radius is set by the learning rate. Surprisingly, that jitter is often a *feature*, not a bug.

**(c) Headline equations** (KaTeX strings, color macros; tex with apostrophes uses double quotes):

SGD with a noisy gradient sample:
```
<Block>{'\\dir{x_{t+1}} = \\dir{x_t} - \\eta\\,\\obj{\\hat g_t}, \\qquad \\obj{\\hat g_t} = \\nabla f(\\dir{x_t}) + \\inf{\\xi_t}, \\quad \\mathbb{E}[\\inf{\\xi_t}]=0,\\ \\operatorname{Var}[\\inf{\\xi_t}]=\\sigma^2'}</Block>
```
Read-as (`<ReadEq>`): "New point equals old point minus a step `η` along the *estimated* gradient `ĝ`. The estimate is the true gradient plus zero-mean noise `ξ` with variance `σ²` — on average we head downhill, but any single step can point partway uphill."

Adam (give the full rule — this is the load-bearing equation of the card):
```
<Block>{'\\dir{m_t} = \\beta_1 \\dir{m_{t-1}} + (1-\\beta_1)\\obj{\\hat g_t}, \\qquad \\dir{v_t} = \\beta_2 \\dir{v_{t-1}} + (1-\\beta_2)\\obj{\\hat g_t}^{\\,2}'}</Block>
<Block>{'\\hat{\\dir{m}}_t = \\frac{\\dir{m_t}}{1-\\beta_1^{\\,t}}, \\qquad \\hat{\\dir{v}}_t = \\frac{\\dir{v_t}}{1-\\beta_2^{\\,t}}, \\qquad \\dir{x_{t+1}} = \\dir{x_t} - \\eta\\,\\frac{\\hat{\\dir{m}}_t}{\\sqrt{\\hat{\\dir{v}}_t}+\\varepsilon}'}</Block>
```
Read-as: "`m` is an exponential moving average of the gradient (momentum); `v` is an EMA of the *squared* gradient (a running estimate of each coordinate's scale). Divide the bias-corrected mean `m̂` by the root of the bias-corrected scale `v̂`: big-gradient coordinates get *shrunk*, small-gradient coordinates get *boosted*. Every coordinate ends up taking a step of size roughly `η`." Defaults to state in prose: `β₁=0.9, β₂=0.999, ε=10⁻⁸`.

**(d) LIVE INTERACTIVE — "The noise ball & the optimizer race".** Two synced panels.

*Panel 1 — Noise ball (2-D contour + trajectory).* Plot the contour of the **Roastery concave objective recentred as a loss** — use the convex bowl `L(x₁,x₂)=½[(x₁−16.36)²·k₁ + (x₂−7.27)²·k₂]` with `k₁=0.36, k₂=0.03` (reuse the frozen Roastery eigen-curvatures `λ_max=0.360303, λ_min=0.029697` so it ties to the anchor's κ≈12 conditioning — cite κ=12.13). Axes: x₁∈[10,22], x₂∈[3,12], optimum marked at the frozen concave-constrained mix **(16.364, 7.273)**. Run plain SGD: `x_{t+1}=x_t − η(∇L + ξ_t)`, `ξ_t ~ N(0, σ²I)`. **Numerical scheme:** 300 iterations, draw a deterministic-seeded pseudo-random `ξ` (seed the RNG so the trace replays identically via `useReplayOnEnter`). After a burn-in of ~80 steps the iterate orbits a ball. Overlay a dashed circle of radius `r = sqrt(η·σ²/(2·λ̄))` where `λ̄` is the mean curvature — **the verified scalar law**: stationary `Var[x] = η²σ²/(1−(1−ηH)²) ≈ η·σ²/(2H)` for small `ηH`. Concrete check to surface as a `<Stat>`: with `H=1, σ²=1, η=0.1` the exact stationary variance is **0.052632**, the small-step approximation **0.050**; halving `η` shrinks the ball radius by **×0.7071** (= 1/√2).

*Panel 2 — Optimizer race on an ill-conditioned bowl.* Plot `f(x,y)=½(10x²+y²)` (curvature ratio 10:1), start at (1,1), optimum at origin. Three traces, same per-step noise injected: **(a) plain SGD** with `η=0.1`, **(b) SGD+momentum** (`β=0.9`), **(c) Adam** (`η=0.1, β₁=0.9, β₂=0.999, ε=1e-8`). **Verified behavior to reproduce:** under shared `η=0.1`, the stiff x-axis (curvature 10) contracts to ~0 in **1 step** while the soft y-axis (curvature 1) contracts by factor 0.9/step and needs **~66 steps** to reach 1e-3 — plain GD/SGD crawls along the soft axis. Adam *equalizes*: after 50 steps it reaches **(−0.00482, −0.00482)** (both coordinates within rounding of each other), after 100 steps **(0.00294, 0.00294)** — both axes descend at a comparable rate because per-coordinate `v̂` normalizes each step to ≈η.

*Controls:*
- Slider `η` (learning rate) 0.005–0.3 → resizes the noise ball (Panel 1) and changes the race (Panel 2). Above the stability bound `η > 2/λ_max` the trace diverges (color it rose, label "diverges") — concrete bound for Panel 2: `2/10 = 0.2`.
- Slider `σ` (noise scale) 0–2 → grows/shrinks the ball; `σ=0` collapses SGD to clean GD (the trace lands on a point).
- Toggle chips: SGD / +Momentum / Adam (show/hide each trace).
- Button "step schedule" → switches `η` to a decaying schedule `η_t = η₀/(1+0.01t)` and shows the ball *contracting over time* (the "anneal the learning rate to land the point" story).
- "Replay" button (also auto-replays on viewport entry via `RafGate`).

Legend = HTML chips ABOVE each svg (SGD = rose, Momentum = indigo, Adam = emerald, noise-ball circle = amber dashed). `useId()` on every arrowhead `<marker>`.

**(e) Carry-this** (`<MinSchema>`):
> A noisy gradient turns descent into a random walk that **drifts down but never stops** — it settles into a noise ball of radius ∝ √η. To land on a point, **shrink η over time**. Adam keeps a per-coordinate running scale (EMA of g²) and divides by it, so every coordinate self-tunes to a step of ≈η — that's why it just works on wildly anisotropic losses.

**(f) Supporting elements.**

`<Predict question="On the convex bowl, you halve the learning rate η. What happens to the radius of the noise ball SGD settles into?">` Reveal:
> It shrinks, but **not** by half — by **1/√2 ≈ 0.71**. The stationary variance scales like η, so the *radius* (a standard deviation) scales like √η. Halving η multiplies the ball radius by 1/√2 ≈ 0.707. This is exactly why learning-rate *decay* schedules work: each halving tightens the orbit by ~30%, slowly squeezing the iterate onto the minimum.

`<Misconception wrong="Adam adapts the learning rate, so I never have to tune it." right="Adam adapts the *per-coordinate scaling* of a single global step size η; you still choose η (and it still matters)." because="The v̂ term equalizes the relative step across coordinates by dividing out each coordinate's gradient magnitude — it makes every step ≈η in normalized units. But that base η is global; too large still diverges or rattles, too small still crawls. Adam removes the need to hand-tune per-coordinate, not the need to tune η.">`

`<Worked title="One Adam step by hand">`:
> Minimize `f(x)=½x²` (so `g=x`) from `x₀=1`, with `η=0.1, β₁=0.9, β₂=0.999, ε=1e-8`. Step 1: `g=1`. `m₁=0.9·0+0.1·1=0.1`; `v₁=0.999·0+0.001·1=0.001`. Bias-correct: `m̂=0.1/(1−0.9)=1.0`, `v̂=0.001/(1−0.999)=1.0`. Update: `x₁ = 1 − 0.1·(1.0/(√1.0+1e-8)) = 0.900000`. **The first step has magnitude ≈ η = 0.1, regardless of the gradient's size** — because `m̂/√v̂ = g/√(g²) = sign(g) = 1`. That self-normalization is the whole point of Adam. (Continuing: x₂=0.800412, x₃=0.701586, x₄=0.603939, x₅=0.507964.)

`<Deeper title="Why a little noise helps (and the SGD↔SDE picture)">`:
> SGD is a discretization of a *stochastic* gradient flow `dx = −∇f dt + √(η)·dW` — a Langevin-type SDE. The noise term `√η dW` is what prevents the iterate from sitting exactly at a minimum; its stationary distribution concentrates near minima but with spread ∝ √η. **Why/tradeoff:** the same noise that stops you from landing precisely is what lets you *escape* shallow traps and saddles (Card 17) — large η early = aggressive exploration that hops basins, small η late = fine convergence inside the chosen basin. This is the core tension a learning-rate schedule manages: warm up / hold high / decay. Full-batch GD would converge to a point but get stuck in the first basin it falls into; mini-batch noise buys basin-hopping for free. The catch: too much noise (huge η or tiny batch) and the iterate never localizes — the ball swallows the minimum.

`<QA items={[...]}/>`:
- q: "Why divide by √v̂ and not v̂?" — a: "Dimensional consistency: `v̂` estimates `E[g²]`, so `√v̂` estimates the *scale* (std) of the gradient. Dividing the mean gradient by its scale gives a unit-free, ≈O(1) step — like a per-coordinate z-score. Dividing by `v̂` itself would overcorrect and make the step shrink as the *square* of the gradient."
- q: "What does bias-correction fix?" — a: "`m` and `v` start at 0, so early EMAs are biased toward zero (e.g. `v₁=(1−β₂)g²` is tiny). Dividing by `(1−βᵗ)` rescales them to unbiased estimates. The correction is large at t=1 (`1/(1−0.999)=1000×` for v) and fades to 1 as t grows."
- q: "Mini-batch size vs noise?" — a: "Gradient-estimate variance scales like `σ²/B` for batch size B. Bigger batch = less noise = smaller ball but more compute per step. The practical sweet spot trades wall-clock against noise — and some noise is desirable for escaping saddles."

`<Term>` glossary entries: **mini-batch** ("a small random subset of the data; its average gradient is an unbiased, noisy estimate of the full-dataset gradient"), **noise ball** ("the small region around a minimum that a constant-step-size stochastic optimizer orbits but never exits; radius ∝ √η"), **bias correction** ("the `1/(1−βᵗ)` rescaling that removes the toward-zero bias of an EMA initialized at zero"), **EMA** ("exponential moving average: `s_t=βs_{t−1}+(1−β)x_t`, a leaky running mean with effective window ≈1/(1−β)").

CrossLinks: `<CrossLink to="momentum-acceleration" recap="heavy-ball momentum averages past gradients to power through ravines">momentum (Card 5)</CrossLink>` · `<CrossLink to="curvature-newton" recap="condition number κ measures how stretched the bowl is; Adam fakes per-axis curvature scaling without a Hessian">conditioning & Newton (Card 4)</CrossLink>` · `<CrossLink to="machine-learning" recap="training a neural net IS minimizing a noisy loss with SGD/Adam">machine-learning explainer</CrossLink>` · `<CrossLink to="nonconvex-saddles" recap="the noise that stops SGD from sitting still is what lets it escape saddles">non-convexity (Card 17)</CrossLink>`.

---

# CARD 17 — Non-convexity & saddle points

**(a) Header.** `id="nonconvex-saddles"` · icon `Mountain` (lucide) · accent `rose` · `anchor={false}` · index 17. Subtitle: *"many valleys, and a sea of saddles."* Source: Dauphin et al., "Identifying and attacking the saddle point problem in high-dimensional non-convex optimization" (arXiv:1406.2572). **One-line purpose:** drop convexity and "locally blocked" no longer means "globally best" — the landscape sprouts multiple minima and, in high dimensions, is dominated not by traps but by *saddles*, which is exactly what SGD's noise is good at escaping.

**(b) Intuition opener:**
> Convexity (Card 6) was the magic that made *downhill until blocked* equal *globally best*. Strip it away and the landscape grows multiple valleys of different depths, ridges between them, and — the real story in high dimensions — vast numbers of **saddle points**: places that are a minimum along some directions and a maximum along others, like a mountain pass. Your intuition, trained in 2-D, pictures getting stuck in a shallow valley. But in a million-dimensional loss, almost every flat point is a saddle, not a trap — and a saddle is *escapable* if you can find even one downhill direction.

**(c) Headline equations.**

A point is stationary when the gradient vanishes; its *type* is read off the Hessian's eigenvalues:
```
<Block>{'\\nabla f(\\dir{x^\\star}) = 0, \\qquad H = \\nabla^2 f(\\dir{x^\\star}): \\quad \\begin{cases} \\text{all } \\lambda_i > 0 & \\Rightarrow \\ \\obj{\\text{local min}} \\\\ \\text{all } \\lambda_i < 0 & \\Rightarrow \\ \\text{local max} \\\\ \\text{mixed signs} & \\Rightarrow \\ \\inf{\\text{saddle}} \\end{cases}'}</Block>
```
Read-as: "At a flat point, look at the Hessian's eigenvalues — the curvatures along its principal axes. All positive: a bowl, a minimum. All negative: a dome, a maximum. Mixed signs: a saddle — uphill some ways, downhill others."

The high-D prevalence heuristic (state as a model, label it a heuristic):
```
<Block>{'\\text{if each eigenvalue is }\\pm\\text{ with prob }\\tfrac12: \\quad \\mathbb{P}(\\obj{\\text{local min}}) = \\Big(\\tfrac12\\Big)^{n} \\ \\xrightarrow{n\\to\\infty}\\ 0'}</Block>
```
Read-as: "If a random flat point is equally likely to curve up or down along each of its n axes, the chance *all* n curve up — the chance it's a minimum — is `(½)ⁿ`, which collapses to nothing as dimension grows. Almost everything flat is a saddle."

**(d) LIVE INTERACTIVE — "Basins, saddles, and the curse of dimension".** Two panels + a counter.

*Panel 1 — 2-D basins of attraction (the main visual).* Plot the contour of the frozen 2-D double-well `f2(x,y)=(x²−1)²+y²+0.3x` over x∈[−2,2], y∈[−1.5,1.5]. Mark the three critical points (verified): **min A (−1.0356, 0), f=−0.305** (global, deeper); **min B (+0.9602, 0), f=+0.294**; **saddle (+0.0754, 0), f=+1.011** (eigenvalues −3.93 and +2 → genuine saddle). Shade the **basin of attraction** of each minimum by integrating gradient descent from a grid of start points and coloring by which minimum it reaches (basin A = emerald, basin B = cyan; the watershed runs through the saddle). **Scheme:** for a 60×40 grid of starts, run GD `x←x−0.02∇f2` for 400 steps, classify by nearest minimum. Let the user **click anywhere** to drop a ball; animate two trajectories from that point — a **plain GD** trace (rose, deterministic, follows −∇f) and an **SGD** trace (indigo, same start, with per-step noise σ). Show that GD started near the saddle stalls/creeps, while SGD's jitter kicks it off the ridge and down into a basin.

*Panel 2 — saddle prevalence vs dimension (bar/curve).* Plot `P(local min)=(½)ⁿ` and `P(saddle)=1−2·(½)ⁿ` against n. Verified table to render as labeled points: n=1 → P(min)=0.5, P(saddle)=0; n=2 → 0.25, **0.50**; n=5 → 0.03125, **0.9375**; n=10 → 9.77e-4, **0.998**; n=50 → 8.88e-16, **≈1**; n=100 → 7.89e-31, **≈1**. A `<Stat>` callout: "in 50 dimensions, fewer than 1 in 10¹⁵ flat points is a minimum."

*Controls:*
- Slider `σ` (SGD noise) 0–0.5 → controls the jitter of the indigo trace; at σ=0 both traces coincide (GD), large σ escapes the saddle reliably.
- Dimension slider n (1–200) for Panel 2 → moves the marker along the prevalence curve, updating the P(saddle) readout.
- Toggle "show basins" (the colored watershed shading on/off).
- Buttons "drop on ridge" (start near the saddle at (0.08, 0.05)) and "drop random", plus "Replay".

Legend chips ABOVE svg: min A (emerald), min B (cyan), saddle (rose ×), GD trace (rose), SGD trace (indigo). `useId()` on markers.

**(e) Carry-this:**
> Without convexity, **local-blocked ≠ globally-best**: there are many valleys and a watershed of ridges between them. The 2-D fear is getting stuck in a shallow valley; the high-D reality is a *sea of saddles* — `(½)ⁿ` of flat points are minima, so almost none are. Saddles only need **one** downhill direction to escape, and a little stochastic noise finds it. That's why SGD trains networks that "shouldn't" be optimizable.

**(f) Supporting elements.**

`<Predict question="A 100-dimensional loss has lots of points where the gradient is zero. Roughly what fraction of them are local minima (vs saddles or maxima), under the coin-flip heuristic?">` Reveal:
> Essentially **none** — about `(½)¹⁰⁰ ≈ 8×10⁻³¹`. Over **99.99...%** are saddles. The naive worry ("I'll get trapped in a bad local minimum") has it backwards: in high dimensions you almost never *hit* a minimum by accident; you spend your time near saddles, which are escapable. Empirically, the local minima you *do* reach tend to be nearly as good as the global one — bad minima are exponentially rare.

`<Misconception wrong="Deep learning works despite getting stuck in bad local minima." right="In high dimensions, bad local minima are exponentially rare; the real obstacle is slowdown near saddles, which noise escapes." because="The coin-flip heuristic and the Dauphin et al. result show that for a critical point to be a poor local minimum, *every* eigenvalue must be positive AND the value must be high — a doubly unlikely event in high-D. Most flat regions are saddles where the gradient is small but a descent direction still exists; plain GD crawls there, while SGD's noise (Card 16) provides the perturbation to slide off.">`

`<Worked title="Classifying the critical points of the double-well">`:
> For `f2(x,y)=(x²−1)²+y²+0.3x`: `∂f/∂x = 4x³−4x+0.3`, `∂f/∂y = 2y`. Stationary ⇒ y=0 and `4x³−4x+0.3=0`, whose three real roots are x = −1.0356, +0.0754, +0.9602. The Hessian is diagonal here: `∂²f/∂x² = 12x²−4`, `∂²f/∂y² = 2`. At x=−1.0356: eigenvalues (8.87, 2) — both positive ⇒ **minimum** (and it's the deepest, f=−0.305). At x=+0.9602: (7.06, 2) ⇒ **minimum** (f=+0.294). At x=+0.0754: (−3.93, 2) — mixed ⇒ **saddle** (f=+1.011). The +0.3x tilt is what makes the left well deeper and breaks the symmetry, so there's a unique *global* min.

`<Deeper title="Sharp vs flat minima, and why generalization cares">`:
> Two minima with the same loss value can differ in *curvature*: a **sharp** minimum sits in a narrow, steep-walled valley (large Hessian eigenvalues); a **flat** one in a wide basin (small eigenvalues). **Why/tradeoff:** flat minima are widely believed to generalize better — a small shift in the data (or in the parameters) barely changes the loss, so the model is robust; a sharp minimum can spike in loss under tiny perturbation. SGD's noise has a built-in bias toward flat minima: the noise ball (Card 16) of radius ∝√η can't sit in a basin narrower than the ball, so large-step SGD is repelled from sharp minima and pooled into flat ones. This is one mechanistic story for why the *same* network trained with small-batch SGD often generalizes better than with huge batches — bigger batch = less noise = smaller ball = can settle into sharper, worse-generalizing minima. The eigenvalue-sign picture (saddles) and the eigenvalue-*magnitude* picture (sharp/flat) are the two halves of reading a Hessian.

`<QA items={[...]}/>`:
- q: "Is a 1-D function ever a saddle?" — a: "Not in the strict sense — with one variable a stationary point is a min, a max, or an inflection. 'Saddle' needs ≥2 dimensions so it can curve up one way and down another. The +0.0626 critical point of the 1-D demo `x⁴−4x²+0.5x` is a local *maximum* (f''=−7.95)."
- q: "Why is escaping a saddle easier than escaping a minimum?" — a: "A saddle has at least one direction of negative curvature — a downhill escape route. A local minimum has *no* descent direction; you'd have to climb out. Noise that wouldn't budge you from a minimum will, sooner or later, push you along a saddle's downhill axis."
- q: "Does momentum help with saddles too?" — a: "Yes — momentum (Card 5) carries velocity through the flat region, so you don't grind to a halt the way plain GD does where the gradient is near zero. Momentum + noise is a strong saddle-escape combo."

`<Term>` glossary: **saddle point** ("a stationary point that is a minimum along some directions and a maximum along others; Hessian has mixed-sign eigenvalues"), **basin of attraction** ("the set of starting points from which gradient descent converges to a given minimum"), **sharp/flat minimum** ("a minimum with large/small Hessian eigenvalues — a narrow/wide valley; flat minima are thought to generalize better"), **watershed** ("the ridge separating two basins; it passes through a saddle").

CrossLinks: `<CrossLink to="convexity-watershed" recap="convexity guarantees one bowl so local=global; this card is what happens when that guarantee is gone">convexity (Card 6)</CrossLink>` · `<CrossLink to="optimality-conditions" recap="∇f=0 plus the Hessian's eigenvalue signs is the min/max/saddle test">optimality conditions (Card 7)</CrossLink>` · `<CrossLink to="stochastic-sgd" recap="SGD's √η noise ball is precisely what kicks the iterate off a saddle">SGD noise (Card 16)</CrossLink>` · `<CrossLink to="global-blackbox" recap="when there are many basins and no gradient, you need global search">global search (Card 18)</CrossLink>`.

---

# CARD 18 — Global & black-box optimization

**(a) Header.** `id="global-blackbox"` · icon `Telescope` (lucide) · accent `rose` · `anchor={false}` · index 18. Subtitle: *"no gradient, many basins — search smart, not steep."* Sources: Kirkpatrick et al., "Optimization by Simulated Annealing" (Science 1983); Shahriari et al., "Taking the Human Out of the Loop: A Review of Bayesian Optimization." **One-line purpose:** when you have no gradient and many basins — a noisy black box, a hyperparameter sweep — you trade steepest-descent for *search* that deliberately accepts uphill moves (simulated annealing) or models the objective and picks probes by an explore-vs-exploit score (Bayesian optimization).

**(b) Intuition opener:**
> Sometimes the landscape gives you nothing to grab: no formula, no gradient, just a box you feed an input and read an output — a simulation, a physical experiment, a hyperparameter sweep that takes an hour per evaluation. Steepest descent is useless; worse, with many basins, *any* greedy method just dives into the nearest valley and stops. The escape is counterintuitive: sometimes accept a step that goes *uphill*. **Simulated annealing** does this with a temperature that cools over time — wild early, picky late. **Bayesian optimization** instead builds a cheap statistical model of the box and spends each precious evaluation where the model says the payoff-or-information is highest.

**(c) Headline equations.**

Metropolis acceptance for simulated annealing (minimization; Δ = f_new − f_old):
```
<Block>{'P(\\text{accept}) = \\begin{cases} 1 & \\Delta \\le 0 \\ (\\obj{\\text{downhill}}) \\\\[4pt] e^{-\\Delta / T} & \\Delta > 0 \\ (\\inf{\\text{uphill}}) \\end{cases}, \\qquad T_{k+1} = \\alpha\\,T_k'}</Block>
```
Read-as: "Always take a downhill move. For an uphill move of size Δ, accept it with probability `e^{−Δ/T}` — high temperature T means even big uphill jumps get through; as T cools (geometric schedule `T←αT`, α<1), only tiny uphill moves survive and the search settles."

Bayesian-optimization acquisition — Expected Improvement and the UCB/LCB confidence rule (minimization, `f⁺` = best value so far, `z=(f⁺−μ−ξ)/σ`):
```
<Block>{'\\text{EI}(x) = (\\obj{f^{+}}-\\mu(x)-\\xi)\\,\\Phi(z) + \\sigma(x)\\,\\phi(z), \\qquad \\text{LCB}(x) = \\mu(x) - \\kappa\\,\\sigma(x)'}</Block>
```
Read-as: "Each candidate has a posterior mean `μ` and uncertainty `σ` from the surrogate. Expected Improvement weighs how much better than the current best `f⁺` you *expect* to do (the `Φ` term — exploitation) against how *uncertain* you are (the `σ·φ` term — exploration). LCB just subtracts κ standard deviations from the mean — optimism under uncertainty: probe where the model *could* be low."

**(d) LIVE INTERACTIVE — two tabs: "Simulated Annealing" and "Bayesian Optimization", over the same black-box objective.**

Shared objective: the frozen `fbb(x)=sin(3x)+0.5x` on x∈[0,5] (minimization). It has several local minima plus an upward trend, so the global min is in the left part of the domain — a clean multi-basin black box.

*Tab A — Simulated annealing.* Plot `fbb` as a curve; animate a single marker doing Metropolis moves. **Scheme:** propose `x' = x + N(0, step²)` (step=0.4), Δ=fbb(x')−fbb(x); accept if Δ≤0 or `rand() < exp(−Δ/T)`; geometric cooling `T←0.95·T` every 5 proposals from `T₀=10`. Run ~400 proposals (seeded RNG, replays identically). Show a live **acceptance-probability gauge** and a **temperature trace**. Verified acceptance probabilities to surface as a small table (`Δ=1`): T=10 → **0.905**, T=1 → **0.368**, T=0.5 → **0.135**, T=0.25 → **0.018**, T=0.1 → **0.000045**; for Δ=2: T=10 → **0.819**, T=1 → **0.135**, T=0.5 → **0.018**. Cooling facts to show: from T₀=10, α=0.95, after k=5 steps T=**7.738**, after k=100 steps T=**0.0592**; T halves every **≈13.5** cooling steps.

*Tab B — Bayesian optimization.* Plot the hidden truth `fbb` faint, the GP **posterior mean ±2σ band**, the observed points, and the **acquisition curve** below. **Scheme (RBF kernel, lengthscale ℓ=1, jitter 1e-6):** start with 2 seed observations at x=1 and x=4; each "Probe" click evaluates `fbb` at the argmax of the chosen acquisition, adds it, and refits the GP. Verified posterior with the 2 seeds (`f(1)=0.6411, f(4)=1.4634`): at x=2.5 the posterior is mean **0.676, sd 0.890** (largest uncertainty — midway between observations); at observed x=1,4 sd≈0.001 (pinned). So the first EI/UCB probe lands in the wide-uncertainty gap around x≈2.5, demonstrating exploration. Surface the EI worked numbers as a `<Stat>` / tooltip: with `f⁺=1.0, μ=0.8, σ=0.5, ξ=0` → z=0.4, Φ(0.4)=0.6554, φ(0.4)=0.3683, **EI = 0.2·0.6554 + 0.5·0.3683 = 0.3152**; a higher-mean-but-more-uncertain point `μ=1.1, σ=0.8` still scores **EI=0.2716** (uncertainty buys it relevance). LCB example: `μ=0.8,σ=0.5,κ=2` → **−0.20**; `μ=1.1,σ=0.8,κ=2` → **−0.50** (the more-uncertain point wins under LCB).

*Controls:*
- (Tab A) Sliders `T₀` (1–20), cooling `α` (0.80–0.99), step size (0.1–1.0); button "anneal" / "Replay". Show that α too small (fast cooling, e.g. 0.80) freezes into the nearest local min; α near 0.99 explores longer and finds the global basin.
- (Tab B) Toggle EI ↔ LCB; slider `κ` (0–3) for LCB (exploration weight); slider `ξ` (0–0.2) for EI (the exploration-margin / jitter); slider lengthscale ℓ (0.3–2) reshaping the surrogate; button "Probe next" and "Reset to 2 seeds".

Legend chips ABOVE svg: truth (faint gray), GP mean (emerald), ±2σ band (emerald/10), observations (amber dots), acquisition (indigo); SA marker (rose), temperature trace (amber). `useId()` on markers.

**(e) Carry-this:**
> When the box has no gradient and many basins, **don't be greedy.** Simulated annealing accepts uphill moves with probability `e^{−Δ/T}` and *cools* — hot = explore wildly, cold = settle precisely. Bayesian optimization models the box and probes where an **acquisition** score (EI / LCB) balances *exploit* (low predicted value) against *explore* (high uncertainty). Both are formal answers to the same question: where is it worth looking next?

**(f) Supporting elements.**

`<Predict question="In simulated annealing with an uphill move of size Δ=1, you cool from T=1 to T=0.25. By roughly what factor does the chance of accepting that uphill move drop?">` Reveal:
> From `e^{−1/1}=0.368` to `e^{−1/0.25}=e^{−4}=0.018` — a drop of about **20×** (0.368 → 0.0183). That's the whole mechanism: as T falls, the same uphill move goes from "often accepted" to "almost never," so the search transitions smoothly from exploring the whole landscape to committing to one basin. Cool too fast and you freeze before finding the deep valley.

`<Misconception wrong="Bayesian optimization just picks the point with the best predicted value." right="It picks the point with the best *acquisition* score, which deliberately rewards uncertainty, not just a low mean." because="Pure exploitation (probe the lowest posterior mean) gets stuck refining one basin and never discovers a better one elsewhere. EI adds the `σ·φ(z)` term and LCB subtracts `κσ` — both make a high-uncertainty point competitive even if its mean is mediocre. In the worked numbers, a point with the *worse* mean (μ=1.1 vs 0.8) but more uncertainty (σ=0.8 vs 0.5) scores HIGHER under LCB (−0.50 vs −0.20). That's exploration, by design.">`

`<Worked title="One Expected-Improvement evaluation">`:
> Current best observed value `f⁺=1.0`. A candidate has surrogate posterior mean `μ=0.8`, std `σ=0.5`, exploration margin `ξ=0`. The standardized improvement is `z=(f⁺−μ−ξ)/σ=(1.0−0.8)/0.5=0.4`. With Φ(0.4)=0.6554 and φ(0.4)=0.3683: `EI = (f⁺−μ)·Φ(z) + σ·φ(z) = 0.2·0.6554 + 0.5·0.3683 = 0.1311 + 0.1841 = 0.3152`. The first term is *exploitation* (we expect to beat 1.0 by 0.2 with decent confidence); the second is *exploration* (even if the mean is unremarkable, uncertainty σ buys upside). A point with worse mean μ=1.1 but bigger σ=0.8 still earns EI=0.2716 — proof that uncertainty alone is valuable.

`<Deeper title="No-free-lunch, GP cost, and why the explore/exploit dial matters">`:
> **Why simulated annealing converges (in theory):** with a slow-enough logarithmic schedule `T_k ∝ c/log(k)`, SA provably converges to the global optimum — but that schedule is impossibly slow in practice, so real SA uses fast geometric cooling and accepts being a good heuristic, not a guarantee. **Why Bayesian opt is for expensive boxes:** fitting a GP costs O(m³) for m observations (inverting the kernel matrix), and each acquisition optimization is itself a small inner optimization — so BayesOpt only pays off when each black-box evaluation is far more expensive than that overhead (training a model, running a wet-lab experiment). For cheap boxes, random search or SA wins. **The tradeoff dial:** κ (in LCB) and ξ (in EI) literally set the explore/exploit balance — κ=0 / ξ large = pure exploit (greedy, risks missing basins); large κ / ξ=0 with high σ = pure explore (probes the unknown, slow to refine). No method dodges the **no-free-lunch** theorem: averaged over *all* objectives, every search is equal — these methods win only because real objectives have structure (smoothness, few basins) the method exploits.

`<QA items={[...]}/>`:
- q: "Why accept uphill moves at all?" — a: "To escape local minima. A purely downhill search dives into the first valley and stays. Occasionally climbing out — more freely when hot — lets the search find a deeper valley it would otherwise never reach."
- q: "EI vs LCB — when to use which?" — a: "Both balance explore/exploit; LCB exposes the dial explicitly via κ (one intuitive knob), while EI auto-balances and needs no tuning beyond an optional margin ξ. EI can be too greedy when σ is small everywhere; LCB with large κ is more aggressively exploratory. In practice they perform similarly; EI is the more common default."
- q: "What is the surrogate, concretely?" — a: "Usually a Gaussian Process: it interpolates the observed points and, crucially, reports an *uncertainty* σ(x) that's zero at observed points and grows in the gaps between them. That uncertainty is what the acquisition function spends evaluations to reduce."
- q: "Where does this show up for a practitioner?" — a: "Hyperparameter tuning (learning rate, depth, regularization) is the canonical black-box: each evaluation is a full training run, the objective is noisy, and there's no gradient w.r.t. hyperparameters — exactly the BayesOpt regime."

`<Term>` glossary: **simulated annealing** ("a global search that accepts uphill moves with probability e^{−Δ/T} and cools T over time, mimicking metal annealing"), **temperature / cooling schedule** ("the control parameter T and the rule for lowering it, e.g. geometric T←αT; high T explores, low T exploits"), **surrogate model** ("a cheap statistical stand-in for the expensive black box, e.g. a Gaussian Process, that predicts both a mean and an uncertainty"), **acquisition function** ("the score (EI, LCB/UCB, PI) that ranks candidate probe points by trading expected payoff against uncertainty"), **Expected Improvement** ("the expected amount by which a probe beats the current best, integrated over the surrogate's posterior"), **explore/exploit** ("the tension between probing uncertain regions (might find something better) and refining the current best").

CrossLinks: `<CrossLink to="nonconvex-saddles" recap="many basins with no gradient is the regime that forces global search">non-convexity (Card 17)</CrossLink>` · `<CrossLink to="integer-programming" recap="branch-and-bound is exact global search for discrete problems; SA/BayesOpt are heuristics for continuous black boxes">branch-and-bound (Card 13)</CrossLink>` · `<CrossLink to="forecasters-craft" recap="hyperparameter optimization is the canonical Bayesian-optimization use case">forecaster's craft (HPO)</CrossLink>` · `<CrossLink to="optimization-anchor" recap="the 'which method when?' guide keys off problem structure: smooth/convex/discrete/noisy/black-box">the anchor scorecard (Card 19)</CrossLink>`.

---

### Cross-cluster narrative thread
The three cards form a single arc — *blurred → bumpy → opaque*: Card 16's noise (the thing that stops you landing on a point) is reframed in Card 17 as the thing that *escapes saddles*, and Card 17's "many basins, no gradient" is exactly the regime Card 18's global/black-box methods are built for. Keep the rose accent consistent and let each carry-this hand off to the next.

### Verified constants — stochastic-nonconvex-global
## Verified frozen constants — Cluster V (Cards 16, 17, 18)

All values below independently recomputed in hand-rolled Node (Newton/closed-form, no solver libs). Builder may hardcode these.

### Demo functions (module scope)
```js
const f1  = x => x**4 - 4*x**2 + 0.5*x;        // f'(x)=4x^3-8x+0.5, f''(x)=12x^2-8
const f2  = (x,y) => (x*x-1)**2 + y*y + 0.3*x; // fx=4x^3-4x+0.3, fy=2y, fxx=12x^2-4, fyy=2, fxy=0
const fbb = x => Math.sin(3*x) + 0.5*x;        // on [0,5]
```

### Card 17 — f1 (1-D multi-well) critical points
| x | f(x) | f''(x) | type |
|---|---|---|---|
| -1.444485 | -4.714754 | +17.04 | min (GLOBAL) |
| +0.062623 | +0.015640 | -7.95 | local max (1-D, NOT a saddle) |
| +1.381862 | -3.300886 | +14.91 | min |

### Card 17 — f2 (2-D double-well) critical points (all at y=0; Hessian diagonal so eigs = {fxx, 2})
| (x,y) | f | eigenvalues | type |
|---|---|---|---|
| (-1.035579, 0) | -0.305428 | (8.869, 2) | min (GLOBAL) |
| (+0.960150, 0) | +0.294146 | (7.063, 2) | min |
| (+0.075429, 0) | +1.011282 | (-3.932, 2) | saddle |

### Card 16 — Adam on f=½x², x0=1, η=0.1, β1=0.9, β2=0.999, ε=1e-8
- Step 1: m=0.1, v=0.001, m̂=1.0, v̂=1.0, step=0.1, **x1=0.900000**
- Iterates: x2=0.800412, x3=0.701586, x4=0.603939, x5=0.507964
- First-step magnitude = η = 0.1 exactly (m̂/√v̂ = sign(g) = 1 at t=1)

### Card 16 — Ill-conditioned bowl f=½(10x²+y²)
- GD η=0.1: x-axis factor 1-η·10 = 0 (converges in 1 step); y-axis factor 0.9, reaches 1e-3 in **66 steps** (exact 65.563)
- **GD stability bound: η < 2/10 = 0.2**
- Adam (η=0.1) from (1,1): after 50 steps **(-0.00482, -0.00482)**; after 100 steps **(0.00294, 0.00294)**

### Card 16 — SGD noise ball (scalar law)
- Stationary Var[x] = η²σ²/(1-(1-ηH)²); with H=1, σ²=1, η=0.1: **exact = 0.052632**, small-step approx η σ²/(2H) = **0.050**
- Halving η multiplies radius (std) by **1/√2 = 0.7071** (this is the small-step law; the exact-formula ratio at η=0.1 is ≈0.698 — quote the law, not the exact ratio)

### Card 18 — Simulated annealing acceptance p=exp(-Δ/T)
| T | Δ=1 | Δ=2 |
|---|---|---|
| 10 | 0.904837 | 0.818731 |
| 1 | 0.367879 | 0.135335 |
| 0.5 | 0.135335 | 0.018316 |
| 0.25 | 0.018316 | — |
| 0.1 | 0.000045 | — |
- Cool T=1→0.25 (Δ=1): 0.368 → e⁻⁴=0.018, **≈20× drop** (exact 20.09×)

### Card 18 — Geometric cooling T0=10, α=0.95
- k=5: T=7.737809; k=100: T=0.059205; half-life = ln0.5/ln0.95 = **13.513 steps**

### Card 17 — Saddle prevalence (coin-flip heuristic)
| n | P(min)=(½)ⁿ | P(saddle)=1-2(½)ⁿ |
|---|---|---|
| 2 | 0.25 | 0.500000 |
| 5 | 0.03125 | 0.937500 |
| 10 | 9.766e-4 | 0.998047 |
| 50 | 8.882e-16 | ≈1 |
| 100 | 7.889e-31 | ≈1 |

### Card 18 — Bayesian optimization
- **EI** = (f⁺-μ-ξ)Φ(z) + σφ(z), z=(f⁺-μ-ξ)/σ
  - f⁺=1.0, μ=0.8, σ=0.5, ξ=0: z=0.4, Φ=0.6554, φ=0.3683, **EI=0.3152**
  - f⁺=1.0, μ=1.1, σ=0.8, ξ=0: z=-0.125, **EI=0.2716**
- **LCB** = μ-κσ: (μ=0.8,σ=0.5,κ=2)→**-0.20**; (μ=1.1,σ=0.8,κ=2)→**-0.50**
- **fbb evaluations**: f(1)=0.6411, f(4)=1.4634
- **GP RBF posterior** (ℓ=1, jitter 1e-6, seeds at x=1,4): at x=2.5 mean=0.676, sd=0.890; at observed points sd≈0.001

### Roastery anchor references (frozen, match register)
- κ(Q)=12.13, λ_max=0.360303, λ_min=0.029697 (Q=[[0.03,0.01],[0.01,0.36]], det=0.0107)
- Noise-ball center (concave-constrained optimum) = **(16.364, 7.273)**


---

## Cluster: synthesis-autodiff-trails — cards 19 (Anchor — solved every way), 20 (Autodiff/backprop), 21 (Next trails)
_verification: ALL CONFIRMED_

All numbers below were re-derived in Node from the frozen anchor register and confirmed to match exactly (LP optimum, shadow prices, concave-constrained tangency, integer optimum, strong-duality value, GD-vs-Newton iteration counts, and the full autodiff sweep). A builder can implement directly.

---

# Card 19 ★ — Anchor: the Roastery, solved every way

**(a) Frame.** `id="anchor-solved"` · icon `Coffee` (lucide) · accent `fuchsia` · `anchor={true}` · `index={19}` · `source="Boyd & Vandenberghe; Bertsimas & Tsitsiklis"`. **Purpose:** the synthesis card — run the *same* Roastery through six lenses (unconstrained concave, LP/simplex, KKT, dual/shadow prices, integer/B&B, stochastic/SGD), each with a one-line verdict, then a "which method when?" decision guide keyed to problem structure. This is where the reader cashes in the whole trail on one plot and one scorecard.

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> One coffee shop. One 2-D plot of (Espresso `x₁`, Filter `x₂`) in kg/day. Every method you've met in this explainer is a different question asked of *this same picture*: "where's the peak if nothing stops me?", "where's the peak if I must stay inside the walls?", "what is one more roaster-hour worth?", "what if I can only make whole bags?", "what if tomorrow's demand is a guess?". The shop never changes — only the lens does. Watch the same optimum get re-found six ways.

**(c) Headline equations.** The card's spine is that all lenses share one stationarity picture. Display block:
```
<Block>{'\\nabla \\obj{f}(\\mathbf{x}^\\star) \\;=\\; \\sum_i \\con{\\mu_i}\\,\\nabla \\con{g_i}(\\mathbf{x}^\\star), \\qquad \\con{\\mu_i}\\,\\con{g_i}(\\mathbf{x}^\\star)=0,\\quad \\con{\\mu_i}\\ge 0'}</Block>
```
Read-as (`<ReadEq>`): "At the best mix, your pull uphill on profit is exactly balanced by the walls pushing back; each wall's push `μᵢ` is its shadow price; and any wall you're not leaning on (`gᵢ<0`, slack) pushes with zero force." Second, the anchor objective itself (freeze at module scope, fuchsia/emerald):
```
<Block>{'\\obj{\\text{profit}}(x_1,x_2)=\\,9x_1-\\tfrac12(0.03)x_1^2+7x_2-\\tfrac12(0.36)x_2^2-0.01\\,x_1x_2'}</Block>
```
with resource walls (amber):
```
<Block>{'\\con{1.2x_1+1.0x_2\\le 27},\\quad \\con{0.20x_1+0.10x_2\\le 4},\\quad \\con{0.10x_1+0.15x_2\\le 4},\\quad x_1,x_2\\ge0'}</Block>
```

**(d) LIVE INTERACTIVE — "The Roastery scoreboard."**
A single SVG contour plot of profit over the feasible region, with a **lens selector** (six radio chips / segmented control above the plot, HTML legend chips never SVG `<text>` at the edge). One shared coordinate system used by all lenses.

- **Axes & ranges:** x-axis `x₁` (Espresso) 0–22 kg; y-axis `x₂` (Filter) 0–14 kg. Pad 1 unit. Plot the feasible polygon (vertices computed below) as a filled emerald-tinted region; the three walls as amber lines labeled "beans", "roaster", "labor".
- **Contours:** draw `profit` level sets at $80, 120, 150, 170, 180, 183 using marching-squares on a 120×120 grid over the view box. Profit formula exactly as the block above.
- **Feasible polygon vertices** (compute live by enumerating wall-pair + axis intersections, keep feasible ones, convex-hull order): `(0,0)`, `(20,0)` (roaster∩x-axis at x₁=20... but beans cuts first), so the actual binding hull is `(0,0) → (16.25, 7.5) → (0,14.5)`-ish; **builder: compute by the enumeration in the verify note, do not hand-place.** The two interior binding vertices that matter are the LP vertex `(16.25, 7.5)` (beans∩roaster) and `(0, 14.5)`-region top. Mark the LP vertex with a fuchsia dot.

The six lenses overlay on this same plot:
1. **Unconstrained concave** — plot the true global peak marker at `x*=(296.26, 11.21)` *off-screen* with an arrow pointing right-and-up and a tag "peak is at (296, 11) — way outside the walls". Verdict chip: "*Ignore the walls and you'd roast 366.7 kg of beans you don't have.*"
2. **LP / simplex** — animate a dot walking polygon vertices `(0,0) → (16.25,7.5)` (or `(0,0) → (0, …) → (16.25,7.5)` depending on hull order) along edges, profit (linear `9x₁+7x₂`) rising at each vertex, stopping at `(16.25, 7.5)`, margin `$198.75`. Verdict: "*Linear profit ⇒ optimum is a corner; simplex walks edges to it.*"
3. **KKT (concave-constrained)** — show the profit contour *kissing* the roaster wall at `(16.364, 7.273)`; draw `∇f=(8.436, 4.218)` (indigo arrow) parallel to `∇g_roaster=(0.20,0.10)` (amber arrow); annotate `μ_roaster = 42.18`, profit `$183.45`. Verdict: "*Smooth profit ⇒ tangency on a single wall (roaster); beans/labor slack.*"
4. **Dual / shadow prices** — convert to a tiny HTML table (not SVG): beans `$6.25/kg`, roaster `$7.50/h`, labor `$0.00` (idle 1.25 h). Verdict: "*Resource stock priced from the other side sums to the same $198.75 — strong duality.*"
5. **Integer / B&B** — overlay the integer lattice points inside the polygon; highlight `(15,9)` (profit `$198`, the integer optimum) in fuchsia and `(16,8)` (= round(LP)) in rose with a strike showing it pokes outside beans (27.2 kg > 27). Verdict: "*Whole bags ⇒ round(LP) is infeasible; B&B finds (15,9).*"
6. **Stochastic / SGD** — animate a noisy descent path on the concave bowl jittering toward `(16.36, 7.27)` and settling in a "noise ball" of radius ≈0.5 around it. Verdict: "*Noisy demand ⇒ noisy gradient; SGD orbits the optimum in a noise ball.*"

- **Controls:** (i) six-way **lens selector** (segmented control) switching the overlay; (ii) a "**replay**" button per animated lens (LP walk, SGD orbit) wired to `useReplayOnEnter` + `RafGate`; (iii) a toggle "show shadow-price arrows" on the KKT lens. No sliders needed — the anchor numbers are frozen, the card's job is comparison not exploration.
- **Verified demo constants (freeze at module scope):**
  - `LP_OPT = [16.25, 7.5]`, `LP_MARGIN = 198.75`
  - `KKT_OPT = [16.364, 7.273]` (exact `x₂=0.52/0.0715`, `x₁=20−0.5x₂`), `KKT_PROFIT = 183.45`, `MU_ROASTER = 42.18`, `GRAD_F_AT_KKT = [8.4364, 4.2182]`
  - `SHADOW = {beans:6.25, roaster:7.50, labor:0.00}`, `DUAL_VALUE = 198.75` (= `27·6.25 + 4·7.50 + 4·0`)
  - `INT_OPT = [15, 9]`, `INT_PROFIT = 198`, `ROUND_LP = [16,8]` (infeasible: beans 27.2 > 27)
  - `UNC_MAX = [296.26, 11.21]`, beans needed `366.73`
  - `KAPPA = 12.13`

**(e) Carry-this** (`<MinSchema>`): "One shop, one stationarity picture (`∇f = Σμᵢ∇gᵢ`). Smooth→tangency, linear→corner, discrete→lattice, noisy→noise-ball. The method is dictated by the *shape of the landscape*, not by taste."

**(f) Supporting elements.**

- **Predict** (`<Predict question="Before any solve: where's the profit-max blend, and what's an extra roaster-hour worth?">`): reveal-body — "**Optimal mix ≈ (16.25, 7.5) kg** at $198.75/day (LP) or **(16.36, 7.27)** at $183.45/day (smooth-concave). An extra **roaster-hour is worth $7.50**, an extra **kg of green beans $6.25**, and an extra **labor-hour is worth $0.00** — because you already have 1.25 idle labor-hours. Did you guess labor was valuable? It isn't, and that surprise is complementary slackness."

- **Misconception** (`<Misconception>`): **wrong:** "More of every resource always raises profit, so every shadow price is positive." **right:** "Labor's shadow price here is exactly $0.00 — you only use 2.75 of 4 hours." **because:** "Complementary slackness: a constraint that isn't binding has multiplier zero. You can't profit from relieving a wall you aren't pressed against."

- **Worked** (`<Worked title="Why round(LP) fails">`): "LP says (16.25, 7.5). Round to the nearest feasible-looking integers (16, 8). Check beans: 1.2·16 + 1.0·8 = 27.2 kg > 27 — **infeasible**. The true integer optimum is (15, 9): beans 1.2·15+9 = 27.0 (tight), roaster 0.20·15+0.10·9 = 3.9 ≤ 4, profit 9·15+7·9 = $198. Naive rounding overshot a wall; branch-and-bound has to actually search."

- **Deeper** (`<Deeper>`): formalize the LP↔dual pair. Primal: max `cᵀx` s.t. `Ax≤b, x≥0`. Dual: min `bᵀy` s.t. `Aᵀy≥c, y≥0`. Here `c=(9,7)`, `b=(27,4,4)`. Strong duality: `cᵀx* = bᵀy* = 198.75` (verified: `27·6.25+4·7.50+4·0 = 198.75`). **Why/tradeoff:** the dual reframes "how much to produce" as "what is each resource worth", and the two answers must agree at the optimum (zero gap, since LP always satisfies Slater trivially / has no gap). The shadow price `yᵢ* = ∂(optimal profit)/∂bᵢ` is the sensitivity of the whole business to one more unit of resource `i` — the single most actionable number a manager gets out of optimization.

- **QA** (`<QA items={[...]}>`):
  - q: "The smooth optimum (16.36, 7.27) and the LP optimum (16.25, 7.5) disagree — which is right?" a: "Both, for different objectives. The LP uses fixed margins (9,7)/kg; the concave model lets margin soften as you flood the market, so it pulls the mix slightly toward more Espresso and stops earlier ($183.45 vs $198.75). Same shop, different profit model."
  - q: "Why does the unconstrained peak sit at (296, 11)?" a: "With no walls, the concave model's max is `Q⁻¹a`. It needs 366.7 kg of beans — you have 27. The walls are what make this an interesting problem; the peak is a fantasy."
  - q: "Is the integer gap big?" a: "$198 (integer) vs $198.75 (LP relaxation) — a 0.4% integrality gap here, but the rounded point is *infeasible*, which is the real lesson: small gap, hard feasibility."

- **Glossary `<Term>`s:** `shadow price` = "the increase in optimal profit per one-unit increase in a resource limit; the constraint's Lagrange multiplier." `complementary slackness` = "at the optimum, for each constraint either it's tight or its multiplier is zero — you only pay for walls you lean on." `integrality gap` = "the difference between the integer optimum and its LP relaxation."

- **"Which method when?" decision guide** (HTML, not SVG — a compact branching table). Each row: structure question → method → which card:
  - smooth + unconstrained → GD / Newton (→ card 3, 4)
  - smooth + convex + constrained, equality → Lagrange (→ card 9)
  - smooth + convex + constrained, inequality → KKT / interior-point (→ card 10)
  - linear objective + linear constraints → simplex / LP (→ card 12)
  - LP + integer variables → branch-and-bound (→ card 13)
  - sequential / stages → dynamic programming (→ card 14)
  - noisy / large-data gradient → SGD / Adam (→ card 16)
  - many basins, no gradient → simulated annealing / Bayesian opt (→ card 18)

- **CrossLinks:** `<CrossLink to="gradient-step" recap="η = how far you trust the local picture">step size</CrossLink>`; `<CrossLink to="duality-shadow-prices" recap="λ* = ∂(optimal value)/∂budget">shadow prices</CrossLink>`; `<CrossLink to="integer-bnb" recap="round(LP) was infeasible — B&B searches">branch & bound</CrossLink>`; forward `<CrossLink to="autodiff" recap="where the gradients in every smooth lens came from">autodiff (next)</CrossLink>`.

---

# Card 20 — Where do gradients come from? (Autodiff / backprop)

**(a) Frame.** `id="autodiff"` · icon `Workflow` (lucide; alt `GitBranch`) · accent `indigo` · `anchor={false}` · `index={20}` · `source="Baydin et al. 2018, Automatic Differentiation in ML: a Survey"`. **Purpose:** the engine under every smooth method in the explainer — how `∇f` is actually computed. Finite differences (slow, noisy) → symbolic (expression blow-up) → automatic differentiation; forward vs reverse mode; **reverse mode = backprop**; the gradient of a million-parameter loss for ~the cost of one forward evaluation.

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> Every method in this explainer asked for `∇f` and assumed it was free. It isn't — someone has to compute it. You have three options: nudge each input and watch `f` move (finite differences — `n+1` evaluations and roundoff noise), expand the derivative by hand into one giant formula (symbolic — explodes for deep compositions), or do the thing frameworks actually do: **walk the computation graph once forward to get values, once backward to get every partial.** That backward walk, on a neural net, *is* backpropagation.

**(c) Headline equations.** The chain rule on a graph (indigo). Display:
```
<Block>{'\\dir{\\bar v_i} \\;=\\; \\sum_{j\\,:\\,i\\to j} \\dir{\\bar v_j}\\,\\frac{\\partial v_j}{\\partial v_i}, \\qquad \\dir{\\bar v_{\\text{out}}}=1'}</Block>
```
Read-as (`<ReadEq>`): "Each node's *adjoint* `v̄ᵢ` — how much the output changes per unit change in this node — is the sum, over every child `j` it feeds, of the child's adjoint times the local derivative on that edge. Seed the output adjoint at 1 and sweep backward; every input's gradient falls out in one pass." Contrast the two modes (forward = derivatives ride *forward* with values; reverse = adjoints flow *back*):
```
<Block>{'\\text{forward: }\\dot v_j=\\sum_{i\\to j}\\frac{\\partial v_j}{\\partial v_i}\\dot v_i \\quad(\\text{one input at a time});\\qquad \\text{reverse: all gradients, one pass}'}</Block>
```

**(d) LIVE INTERACTIVE — "Sweep the computation graph."**
A bespoke SVG of the computation graph for **`f = x₁·x₂ + sin(x₁)`** evaluated at **`x₁ = 2`, `x₂ = 3`** (the verified demo), with an animated forward sweep and reverse sweep.

- **Graph layout (5 nodes, left→right):**
  - inputs: `v₋₁ = x₁` (left, value **2**), `v₀ = x₂` (left, value **3**)
  - `v₁ = v₋₁ · v₀` (mul node) → value **6**
  - `v₂ = sin(v₋₁)` (sin node) → value **0.909297**
  - `v₃ = v₁ + v₂` (add node, = output `f`) → value **6.909297**
  - Edges: `v₋₁→v₁`, `v₀→v₁`, `v₋₁→v₂`, `v₁→v₃`, `v₂→v₃`. **Use `useId()` for every arrowhead `<marker>`.**
- **Forward sweep animation (mode = "forward"):** highlight nodes left→right, writing the *value* and the *tangent* `v̇` beside each node. The user picks a seed via a toggle: **seed x₁** (`ẋ₁=1, ẋ₂=0`) or **seed x₂** (`ẋ₁=0, ẋ₂=1`). Exact tangents to display:
  - seed x₁: `v̇₁ = 1·3 + 2·0 = 3`, `v̇₂ = cos(2)·1 = −0.416147`, `v̇₃ = 3 + (−0.416147) = 2.583853` → **∂f/∂x₁ = 2.583853**
  - seed x₂: `v̇₁ = 0·3 + 2·1 = 2`, `v̇₂ = cos(2)·0 = 0`, `v̇₃ = 2 + 0 = 2` → **∂f/∂x₂ = 2**
  - Caption: "forward mode gives ONE column of the Jacobian per sweep — two inputs ⇒ two sweeps."
- **Reverse sweep animation (mode = "reverse"):** first a greyed forward pass to fill values, then highlight nodes right→left writing the *adjoint* `v̄` beside each:
  - `v̄₃ = 1` (seed) ; `v̄₁ = v̄₃·(∂v₃/∂v₁) = 1·1 = 1` ; `v̄₂ = 1·1 = 1`
  - `x̄₂ = v̄₁·(∂v₁/∂x₂) = 1·x₁ = 1·2 = 2` → **∂f/∂x₂ = 2**
  - `x̄₁ = v̄₁·(∂v₁/∂x₁) + v̄₂·(∂v₂/∂x₁) = 1·x₂ + 1·cos(2) = 3 + (−0.416147) = 2.583853` → **∂f/∂x₁ = 2.583853**
  - Caption: "reverse mode gives the WHOLE gradient in ONE sweep — `n` inputs, one output: this is why we backprop."
- **Finite-difference check panel (HTML, below graph):** show central-difference with `h=1e-6`: `∂f/∂x₁ ≈ 2.583853`, `∂f/∂x₂ ≈ 2.000000`, with a green check "matches autodiff to 6+ digits." Note "FD needs 2 extra evaluations here; for a million-parameter loss it needs a million — reverse mode needs one."
- **Controls:** (i) **mode toggle** forward / reverse; (ii) on forward, a **seed selector** (x₁ / x₂); (iii) **step / play / replay** buttons to advance the sweep node-by-node (wired to `useReplayOnEnter` + `RafGate`); (iv) optional **value sliders** for `x₁ ∈ [−3,3]`, `x₂ ∈ [−3,3]` — all node values, tangents, adjoints, and the FD check recompute live in JS (the formulas above are closed-form, so this is cheap). Default leaves them at (2, 3).
- **Verified demo constants (freeze):** `X = [2, 3]`, `V1=6`, `V2=0.909297`, `V3=6.909297`, `DF_DX1=2.583853`, `DF_DX2=2`, `COS2=−0.416147`.

**(e) Carry-this** (`<MinSchema>`): "Forward mode: derivatives ride along with values, one input per pass — cheap when inputs ≪ outputs. Reverse mode (= backprop): seed the output at 1, sweep adjoints backward, get *all* `n` input gradients in one pass — cheap when outputs ≪ inputs. A scalar loss over a million parameters is the second case, every time."

**(f) Supporting elements.**

- **Predict** (`<Predict question="A loss is one number computed from 1,000,000 parameters. How many backward sweeps to get the full gradient?">`): reveal — "**One.** Reverse mode computes the gradient of a scalar output w.r.t. *all* inputs in a single backward pass, at roughly 1–3× the cost of the forward evaluation — independent of the parameter count. Forward mode would need a million passes (one per parameter). That asymmetry is why deep learning is even possible."

- **Misconception** (`<Misconception>`): **wrong:** "Autodiff is just numerical/finite differences under the hood." **right:** "Autodiff is *exact* (to floating-point) — it applies the chain rule to the recorded operations, not difference quotients." **because:** "Finite differences approximate `f'` with `(f(x+h)−f(x))/h` and trade off truncation vs roundoff error (best ~`√ε ≈ 1e-8` accuracy). Autodiff carries analytic local derivatives (`d/dx sin = cos`, etc.) through the graph, so `∂f/∂x₁ = 2.583853…` is correct to full machine precision, not an estimate."

- **Worked** (`<Worked title="Reverse mode by hand on f = x₁x₂ + sin x₁ at (2,3)">`): full trace — forward: `v₁=6, v₂=0.909297, f=6.909297`. Backward: `v̄₃=1 → v̄₁=1, v̄₂=1 → x̄₂ = 1·x₁ = 2`, `x̄₁ = 1·x₂ + 1·cos(2) = 3 − 0.416147 = 2.583853`. Confirm against analytic `∂f/∂x₁ = x₂ + cos(x₁) = 3 + cos(2)`, `∂f/∂x₂ = x₁ = 2`. ✓.

- **Deeper** (`<Deeper>`): the **cost model.** Reverse mode costs `O(1)` forward-evaluations for the gradient of a scalar `f: ℝⁿ→ℝ` (the "cheap gradient principle", Baur–Strassen: gradient costs ≤ ~3–4× the function), at the price of storing all intermediate values (the *tape*) — memory `O(#ops)`, hence activation checkpointing in big nets. Forward mode costs `O(n)` for the full gradient but `O(1)` memory and is the right tool for `f: ℝ→ℝᵐ` (many outputs, few inputs — e.g. Jacobian-vector products). **Why/tradeoff:** forward mode computes Jacobian-*vector* products (`Jv`, push-forward), reverse computes *vector*-Jacobian products (`vᵀJ`, pull-back). Training picks reverse because the loss is one scalar and parameters are many; sensitivity analysis of a few-parameter ODE picks forward. The general rule: **forward when inputs ≪ outputs, reverse when outputs ≪ inputs.**

- **QA** (`<QA items={[...]}>`):
  - q: "Why is symbolic differentiation a bad idea for deep nets?" a: "The symbolic derivative of a deeply nested function expands combinatorially (expression swell) — repeated subexpressions get re-derived and the formula explodes. Autodiff reuses computed intermediates instead of re-expanding them."
  - q: "Is backprop the same as gradient descent?" a: "No — backprop *computes* the gradient (reverse-mode autodiff over the net's graph); gradient descent (or Adam) is what *uses* that gradient to update weights. Different jobs."
  - q: "Why does forward mode still exist if reverse gets all gradients at once?" a: "Memory and shape. Forward needs no tape (O(1) memory) and wins when you have few inputs and many outputs, like Jacobian-vector products or computing a directional derivative."

- **Glossary `<Term>`s:** `adjoint` = "v̄ᵢ = ∂(output)/∂vᵢ; how sensitive the final output is to node i, propagated backward." `tangent` = "v̇ᵢ = derivative of node i w.r.t. the chosen seed input, propagated forward." `the tape` = "the recorded sequence of operations and intermediate values that reverse mode replays backward." `expression swell` = "the combinatorial blow-up of a symbolic derivative formula under deep composition."

- **CrossLinks:** back `<CrossLink to="gradient-step" recap="x ← x − η∇f assumed ∇f was free; this is where it comes from">gradient descent</CrossLink>`; back `<CrossLink to="anchor-solved" recap="every smooth lens of the roastery needed a gradient">the roastery</CrossLink>`; sibling `<CrossLink to="machine-learning" recap="training = backprop + SGD on a non-convex loss">machine-learning</CrossLink>`.

---

# Card 21 — Next trails

**(a) Frame.** `id="next-trails"` · icon `Compass` (lucide; alt `Map`) · accent `fuchsia` · `anchor={false}` · `index={21}` · no `source` (it's a router). **Purpose:** close the explainer by showing where optimization powers the rest of the library — each link with the *specific* mathematical connection — plus an honest "what we skipped."

**(b) Intuition opener** (`<Intuition title="first, the picture">`):
> Optimization isn't a topic — it's the engine room under half this library. Training a model is descent on a loss. Steering a controller is optimization over a trajectory. Sizing a portfolio is a quadratic program. Picking an action is maximizing expected utility. Once you can read a problem as *"a landscape with walls"*, you'll see the same `∇f = Σμᵢ∇gᵢ` everywhere. Here's where each trail goes, and what we left out.

**(c) Headline equations.** A small gallery of "same idea, six costumes" (one-liners, color-coded). Display as stacked mini-blocks or a `<Worked>`-style list — each is the optimization heart of a sibling:
```
<Block>{'\\text{training: }\\;\\min_\\theta \\;\\tfrac1N\\textstyle\\sum_i \\obj{\\ell}(f_\\theta(x_i),y_i) \\;\\;\\text{(SGD on a non-convex loss)}'}</Block>
<Block>{'\\text{LQR: }\\;\\min_{u}\\;\\textstyle\\sum_t \\big(x_t^\\top Qx_t+u_t^\\top Ru_t\\big)\\;\\;\\text{(a QP over a trajectory)}'}</Block>
<Block>{'\\text{Markowitz: }\\;\\min_w\\; w^\\top\\Sigma w \\;\\;\\text{s.t.}\\;\\; \\mu^\\top w\\ge r,\\;\\mathbf 1^\\top w=1\\;\\;\\text{(convex QP)}'}</Block>
```
Read-as (`<ReadEq>`): "Same skeleton each time — an objective you push down, constraints that wall you in, a multiplier that prices each wall. Machine learning, control, and finance are just this picture with different letters."

**(d) LIVE INTERACTIVE — "The trail map."**
An SVG **hub-and-spoke diagram**: "Optimization" at the center (fuchsia), six spokes to sibling explainers. Hovering/tapping a spoke reveals the specific connection in a side panel (HTML). Lightweight — this is a router, not a sim, but make the reveal interactive.

- **Layout:** central node, six radial nodes at 60° spacing. Each spoke colored by destination. **`useId()` on any markers.** On hover/focus a spoke, it brightens and the side panel shows the connection text below. Keyboard-accessible (focusable spokes).
- **The six spokes (exact connection text for the side panel):**
  1. **machine-learning** — "Training *is* optimization: minimize average loss over data by SGD/Adam; the loss is non-convex, the gradient comes from backprop (card 20). Regularization (L1/L2) = adding a penalty term = a soft constraint."
  2. **control-theory** — "LQR is a quadratic program over a trajectory; its optimal feedback gain solves the Riccati equation. MPC = re-solving a constrained optimization every timestep. Bellman's equation (card 14) is the discrete cousin of the HJB equation."
  3. **decision-theory** — "Choosing an action = maximizing expected utility, `argmax_a E[u(a)]` — optimization under a probability measure. Bayesian decisions minimize expected loss."
  4. **retail-quant** — "Markowitz mean-variance portfolio = a convex QP (minimize variance `wᵀΣw` s.t. target return). Kelly sizing = maximizing expected log-growth, a concave program."
  5. **reinforcement-learning** — "Policy optimization = maximizing expected return over policy parameters (policy gradient = SGD with a sampled-return gradient estimator). Value iteration = a dynamic program (card 14)."
  6. **odes** — "Gradient descent is the forward-Euler discretization of the gradient-flow ODE `ẋ = −∇f`; momentum is a damped second-order ODE. Step size = time step."
- **Controls:** hover/tap to switch the active spoke + side panel; an "explore all" toggle that cycles through them on `RafGate` entry. No numeric sliders.

**(e) Carry-this** (`<MinSchema>`): "If you can write it as *minimize an objective subject to constraints*, the whole machine in this explainer is yours: read the geometry, pick the method by the structure, price the walls with the multipliers. That's most of applied math wearing one costume."

**(f) Supporting elements.**

- **"What we skipped" (honest)** — render as a `<Deeper>` or a dedicated muted panel listing the gaps with one line each:
  - **conic / semidefinite programming (SDP)** — "optimizing over cones (PSD matrices); powers relaxations of hard combinatorial problems and robust control."
  - **multi-objective / Pareto fronts** — "no single optimum when objectives conflict; you trace a frontier of non-dominated trade-offs."
  - **online / bandit optimization** — "decide before you see the data; regret minimization rather than a fixed optimum."
  - **mixed-integer nonlinear (MINLP)** — "discrete *and* curved at once — the hard union of branch-and-bound and nonlinear solvers."
  - **distributed / federated optimization** — "split the problem across machines/devices that can't share raw data (ADMM, federated averaging)."

- **Misconception** (`<Misconception>`): **wrong:** "Each of these fields needs its own bespoke solver theory." **right:** "They mostly reduce to a handful of canonical forms — LP, QP, convex program, MILP — that off-the-shelf solvers already handle." **because:** "The skill that transfers isn't a new algorithm per field; it's *modeling* — recognizing that LQR is a QP, Markowitz is a QP, training is unconstrained smooth minimization. Get the form right and the solver is a library call."

- **QA** (`<QA items={[...]}>`):
  - q: "If training is just optimization, why is it so hard?" a: "Non-convexity (many minima, saddles — card 17), scale (millions of parameters → reverse-mode autodiff is mandatory — card 20), and noise (stochastic gradients — card 16). The *idea* is descent; the *engineering* is everything else."
  - q: "What's the single most transferable skill from this explainer?" a: "Reading a problem's structure — smooth? convex? constrained? discrete? noisy? — and mapping it to the right canonical form and method (the card-19 decision guide)."

- **Glossary `<Term>`s:** `QP (quadratic program)` = "minimize a quadratic objective subject to linear constraints — convex if the quadratic matrix is PSD." `Pareto front` = "the set of solutions where you can't improve one objective without worsening another." `regret` = "in online optimization, the gap between your cumulative loss and the best fixed choice in hindsight."

- **`<NextSteps groups>`:** group the six siblings under headings — **"Optimization in action"**: machine-learning, control-theory, reinforcement-learning; **"Optimization in money & choice"**: retail-quant, decision-theory; **"The continuous limit"**: odes. Each item a `<CrossLink>` with the recap text from the spoke list above.

- **CrossLinks (within-explainer, closing the loop):** `<CrossLink to="autodiff" recap="the gradient engine under every training loop">autodiff</CrossLink>`; `<CrossLink to="anchor-solved" recap="the which-method-when guide that keys structure to method">the decision guide</CrossLink>`; `<CrossLink to="gradient-compass" recap="where it all started — ∇f is the compass">the gradient compass</CrossLink>`.

---

## Builder notes / cross-card consistency
- All `id`s used in CrossLinks above must match the scaffold's card ids. I used: `gradient-compass` (#2), `gradient-step` (#3), `convexity` (#6), `lagrange` (#9), `kkt` (#10), `duality-shadow-prices` (#11), `lp-simplex` (#12), `integer-bnb` (#13), `dp` (#14), `sgd` (#16), `nonconvex-saddle` (#17), `global-blackbox` (#18), `anchor-solved` (#19), `autodiff` (#20), `next-trails` (#21). Reconcile with the actual scaffold ids if they differ.
- Sibling slugs confirmed to exist as sibling directories: `machine-learning`, `control-theory`, `decision-theory`, `retail-quant`, `reinforcement-learning`, `odes`.
- Freeze every numeric constant listed under each card's "verified demo constants" at module scope; do not recompute in render.

### Verified constants — synthesis-autodiff-trails
## Verified constants — Card 19 (Roastery synthesis) + Card 20 (Autodiff)

All values independently recomputed in hand-rolled Node (vertex/KKT/box enumeration, no solver libs). Every spec claim CONFIRMED as-is; freeze these at module scope.

### Anchor objective & Q
- `profit(x1,x2) = 9x1 − 0.5·0.03·x1² + 7x2 − 0.5·0.36·x2² − 0.01·x1·x2`  ✓
- `Q = [[0.03,0.01],[0.01,0.36]]`, **det = 0.0107** (exact)
- **λ_min = 0.029697**, **λ_max = 0.360303**, **κ(Q) = 12.13** (12.1325…)

### Unconstrained concave max
- `x* = Q⁻¹a = (296.2617, 11.2150)` → display **(296.26, 11.21)**
- beans needed = **366.73 kg** (exact 366.729) ≫ 27; excess over limit = **339.73 kg** (the anchor register's "violates beans by 339.73 kg" is the right framing)

### LP optimum (max 9x1+7x2 s.t. walls)
- `LP_OPT = [16.25, 7.5]`, `LP_MARGIN = 198.75`
- binding: beans (27.0/27) and roaster (4.0/4); **labor slack = 1.25 h** (uses 2.75/4)
- `SHADOW = { beans: 6.25, roaster: 7.50, labor: 0.00 }`
- `DUAL_VALUE = 27·6.25 + 4·7.50 + 4·0 = 198.75` = primal margin (strong duality holds, zero gap)

### Concave-constrained optimum (single-wall tangency, roaster)
- `KKT_OPT = [16.3636, 7.2727]`, exact `x2 = 0.52/0.0715 = 2.6/0.3575`, `x1 = 20 − 0.5·x2`
- `GRAD_F_AT_KKT = [8.4364, 4.2182]`, `MU_ROASTER = 42.18` (42.1818)
- `KKT_PROFIT = 183.45` (183.4545)
- beans slack = **0.0909 kg** (26.909/27); labor slack = **1.2727 h** (2.7273/4); roaster tight
- Verified by independent single-wall sweep: roaster is the global constrained optimum (only feasible KKT tangency, highest profit)

### Integer optimum
- `INT_OPT = [15, 9]`, `INT_PROFIT = 198` — **unique** (no ties at 198 in [0..30]²)
- beans 1.2·15+9 = 27.0 (tight); roaster 0.20·15+0.10·9 = 3.9 ≤ 4
- `ROUND_LP = [16, 8]` is **infeasible**: beans 1.2·16+8 = **27.2 > 27** (roaster term = 4.0 exactly; it is beans, not roaster, that is violated)
- integrality gap = (198.75−198)/198.75 = **0.377% ≈ 0.4%**

### Autodiff demo — f = x₁x₂ + sin(x₁) at (x₁,x₂)=(2,3)
- `X = [2, 3]`, `V1 = 6`, `V2 = sin(2) = 0.909297`, `V3 = f = 6.909297`
- `COS2 = cos(2) = −0.416147`
- `DF_DX1 = x2 + cos(x1) = 2.583853`, `DF_DX2 = x1 = 2`
- Forward seed (1,0): v̇₁=3, v̇₂=−0.416147, v̇₃=2.583853 (= ∂f/∂x₁)
- Forward seed (0,1): v̇₁=2, v̇₂=0, v̇₃=2 (= ∂f/∂x₂)
- Reverse (v̄₃=1): v̄₁=1, v̄₂=1, x̄₂=2, x̄₁=2.583853 — full gradient in ONE backward pass
- Central FD h=1e-6: ∂f/∂x₁≈2.5838531634 (err 2.4e-11), ∂f/∂x₂≈2.0000000003 (err 2.8e-10) — matches to ≫6 digits

### GD vs Newton on the unconstrained quadratic
- η = 1/λ_max = 2.7754; from (0,0), **GD reaches ‖x−x*‖ ≤ 1e-3 in 147 iterations** (theoretical estimate 146.5, consistent); **Newton in exactly 1 step** (dist 5.7e-14)
- Caveat for builder: the "147" count assumes the convergence test is distance-to-minimizer ≤ 1e-3 (matches spec wording "within 1e-3 of the minimum"). A gradient-norm ≤ 1e-3 test instead gives 106. Keep the criterion as distance-to-x*.