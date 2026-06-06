# Optimization Explainer — Alignment & Content Doc

This doc aligns *who the explainer is for* with *what it covers*, before any code. It is the contract the build executes against. Numbers tagged **[verify]** are candidates to be hardened by the numerical-verification workflow before the build.

---

## Audience

A **practitioner** who has trained a model, tuned a controller, sized a portfolio, or written a `scipy.optimize` / solver call and wants the **intuition + the methods story**: *why* optimizers work, where they break, how to read a problem geometrically, and how the zoo of methods (gradient descent, Newton, simplex, Lagrange multipliers, SGD, branch-and-bound, simulated annealing) is really **one idea wearing many costumes**. Comfortable with calculus and basic linear algebra; rigor (convergence rates, KKT proof, strong duality) appears in **Deeper** folds as *intuition for why methods behave as they do*, not as theorem–proof scaffolding.

## Scope & angle — the full panorama, geometry-first

A **broad survey** of the whole field, not just the smooth-and-convex corner. Two visual languages:
- **Landscapes** (contours, gradients, descent trajectories) carry the continuous story.
- **Polytopes / trees / tables** carry the discrete story.

Three lenses, woven throughout: **geometric** (the load-bearing intuition — you are descending a surface), **algorithmic** (what the method actually computes each step), **economic** (the multiplier is a price; duality is the market value of your constraints).

## The spine — *three questions*

The reader's mental table-of-contents. Everything routes back to one of these:

> **You are standing on a landscape.** Optimization is *follow the gradient downhill as far as you trust the local picture, until every direction down is blocked.* **Convexity** is the magic property that makes "locally blocked" mean "globally best." A **constraint** is a wall: at the optimum your urge to descend is exactly canceled by the wall's push-back, `∇f = Σλᵢ∇gᵢ`, and the multiplier `λ` *is* how hard the wall pushes — the shadow price. Lagrange, KKT, and duality are all that one picture.

1. **Which way is down?** — gradient as compass; step size = *how far you trust the local picture*; momentum; curvature/Newton; conditioning.
2. **Am I at the bottom?** — stationarity `∇f=0`; convexity as the watershed; constrained optimality (Lagrange → KKT); duality & shadow prices.
3. **What if the landscape fights back?** — it gets *blurred* (stochastic/SGD), *bumpy* (non-convex, saddles, global search), or *shatters* into isolated points (discrete: LP → ILP → DP → flows).

## The anchor — **The Roastery**

One concrete problem, re-solved by every method, numbers fixed once at module scope (like decision-theory's `BOLD[]`).

> You run a micro coffee roaster. Choose kilos/day of two blends — **Espresso** `x₁` and **Filter** `x₂` — to **maximize profit**, limited by three resources: **green beans**, **roaster-hours**, and **labor/packaging**. Everything lives on **one 2-D plot** in `(x₁, x₂)` space: profit as contour lines, resource limits as straight walls cutting a feasible polygon.

The anchor shape-shifts to carry the whole field while the numbers barely change:

| Twist | Unlocks |
|---|---|
| Profit **smooth & concave** (price softens as you flood the market) | curved landscape — GD, Newton, convexity, Lagrange/KKT, duality |
| Its **linear shadow** (fixed price/kg) | LP, polytope, simplex walking vertices |
| Only **whole bags / which lines to run** | integer programming, branch-and-bound |
| **Uncertain daily demand** | stochastic optimization, SGD |
| **Setup cost / economies of scale** | non-convexity, multiple optima, global search |

`λ` reads as a literal **shadow price** — "one more roaster-hour is worth \$X of profit." KKT complementary slackness = "a resource you don't fully use is worth nothing." Duality = "what is the whole resource stock worth, priced from the other side?"

### Anchor numbers — candidate parameterization **[verify]**

**Concave (real) objective** — diminishing returns:
`profit(x₁,x₂) = a₁x₁ − ½q₁₁x₁² + a₂x₂ − ½q₂₂x₂² − q₁₂x₁x₂`
with `a = (a₁,a₂)` the base margins and `Q = [[q₁₁,q₁₂],[q₁₂,q₂₂]]` SPD curvature.
Candidate `a=(9,7)`, `Q=[[0.04,0.01],[0.01,0.20]]` → tilted elliptical contours, condition number `κ(Q)≈5–6`; bump anisotropy to **κ≈12** so the GD-zigzag / momentum / Newton contrast is dramatic.

**Linear (LP) shadow** — fixed margins `c=(9,7)`, maximize `cᵀx`.

**Resources** (non-parallel walls so the polytope is interesting):
- green beans:  `1.2 x₁ + 1.0 x₂ ≤ G`
- roaster-hrs:  `0.20 x₁ + 0.10 x₂ ≤ T`
- labor/pack:   `0.10 x₁ + 0.15 x₂ ≤ L`
- `x₁, x₂ ≥ 0`

**Tune `(G,T,L)` in the workflow so that:**
1. the unconstrained concave max `x* = Q⁻¹a` is **infeasible** (forces a boundary optimum → non-trivial Lagrange/KKT);
2. the **LP optimum sits at the intersection of exactly two binding constraints** (a vertex), with the third **slack** (its shadow price = 0 → clean complementary-slackness demo);
3. both binding shadow prices are **positive and "round-ish"**;
4. the **integer optimum ≠ round(LP optimum)** (so naive rounding fails and branch-and-bound earns its place);
5. the concave-constrained optimum is a clean tangency on an active wall.

All of {optimal mix, optimal profit, the three shadow prices, the dual solution, the B&B tree, GD/Newton/momentum trajectories, Adam path, SA/BayesOpt traces} are computed in Node and frozen as verified constants.

## Card lineup (~21 cards)

★ = spine/anchor. Primary spines: **the gradient compass** (#2) and **the anchor** (#19). Secondary anchors: convexity (#6), Lagrange (#9), duality (#11).

**I · Frame — the landscape**
1. **What is optimization?** — objective, decision variables, feasible set, min vs `argmin`, local vs global, "minimize = maximize the negative." Roastery introduced. The standing-on-a-landscape picture.
2. ★ **The gradient is a compass** — f as contours; `∇f` = steepest ascent, `−∇f` = downhill; directional derivative; the gradient ⟂ contour lines. *The* load-bearing visual: drag a point, watch the arrow.

**II · Which way is down? (unconstrained descent)**
3. **Gradient descent & step size** — `x ← x − η∇f`; too-small crawls, too-big diverges/oscillates; line search & Armijo; the trust theme. *Deeper:* GD = forward-Euler on the gradient-flow ODE `ẋ = −∇f` → cross-link `odes`.
4. **Curvature & Newton's method** — local quadratic model; the Hessian; Newton jumps to the min of the model (one step on a quadratic!); Newton vs GD on an ill-conditioned valley; the condition number `κ`. → `linear-algebra`.
5. **Momentum & acceleration** — heavy-ball, Nesterov; ravines; why momentum beats plain GD on ill-conditioned bowls; the damped-oscillator ODE analogy.

**III · Am I at the bottom? (optimality, convexity, constraints, duality)**
6. ★ **Convexity — the great watershed** — convex set, convex function (chord above graph), the operations that preserve it; **local = global**; the single property that decides whether optimization is easy or a research problem.
7. **Optimality conditions** — first order `∇f=0` (stationarity), second order Hessian PSD; minimum vs maximum vs **saddle**; why "flat" isn't enough.
8. **Non-smooth & subgradients** — kinks (|x|, ReLU, hinge); the subdifferential; L1 → sparsity (the diamond corner); proximal / projected-gradient step. Practical and modern.
9. ★ **Constraints & Lagrange multipliers** — the wall; equality constraint; `∇f = λ∇g` at the tangency where the objective contour **kisses** the constraint; `λ` = shadow price. The anchor's heart, drawn on the roastery contour plot.
10. **The KKT conditions** — inequality constraints; stationarity + primal feasibility + dual feasibility (`λ≥0`) + **complementary slackness** (`λᵢgᵢ=0`); the master optimality test; active vs inactive constraints on the roastery.
11. ★ **Duality & shadow prices** — the Lagrangian; the dual function (a lower bound for every `λ`); weak vs strong duality, the duality gap, Slater's condition; the dual as **pricing the roastery's resources** from the other side; `λ*` = ∂(optimal value)/∂(budget).

**IV · When the landscape shatters — the discrete wing**
12. **Linear programming & the simplex** — the linearized roastery; feasible **polytope**; the optimum is always at a **vertex**; simplex walks edges vertex-to-vertex; LP duality = the same shadow prices; a word on interior-point.
13. **Integer programming & branch-and-bound** — whole bags / which lines (binary "run this line?"); the LP relaxation as a **bound**; the B&B tree (branch, bound, prune); why integrality jumps from easy (P) to NP-hard.
14. **Dynamic programming** — optimal substructure + overlapping subproblems; the Bellman equation; a concrete DP (0/1 knapsack: which standing orders to accept under a capacity cap); memo table fills in. → `control-theory` (Bellman = HJB), `reinforcement-learning`.
15. **Network flows, matching & greedy** — min-cost flow / assignment as the roastery's delivery routing; the integral-polytope magic (LP gives integers for free); **when greedy is provably optimal** (matroids) and when it stalls.

**V · When the landscape fights back — stochastic, non-convex, global**
16. **Stochastic optimization & SGD** — uncertain demand → noisy gradient; mini-batch; SGD → momentum → **Adam** (per-coordinate step sizes); the noise ball around the optimum; learning-rate schedules; why a little noise *helps*. → `machine-learning`.
17. **Non-convexity & saddle points** — many minima, saddles dominate in high dimensions, sharp vs flat minima, basins of attraction; what SGD's noise buys you (escaping saddles); the loss landscape of a net. → `machine-learning`.
18. **Global & black-box optimization** — no gradient, many basins: **simulated annealing** (accept-uphill-with-prob `e^{−Δ/T}`, cooling), **evolutionary** methods, **Bayesian optimization** (surrogate + acquisition function — explore vs exploit); Nelder–Mead. The explore/exploit tension. → `forecasters-craft` (HPO).

**VI · Synthesis**
19. ★ **Anchor — the roastery, solved every way** — predict-then-reveal the optimal mix + the three shadow prices; a **scorecard** running the *same* shop through LP / KKT / dual / integer / stochastic lenses with a one-line verdict each; a "which method when?" decision guide keyed to the problem's structure (smooth? convex? constrained? discrete? noisy? black-box?).
20. **Where do gradients come from? (autodiff)** — the engine under everything: finite differences (slow, noisy) → symbolic (blows up) → **automatic differentiation**; forward vs reverse mode; reverse mode = **backprop**; `∇` of a million-parameter loss for ~the cost of one evaluation. The under-appreciated practitioner card. → `machine-learning`.
21. **Next trails** — where optimization powers the rest: `machine-learning` (training *is* optimization), `control-theory` (LQR/MPC = optimization over trajectories; the Riccati ODE), `decision-theory` (max expected utility), `retail-quant` (Markowitz = a QP, Kelly = log-growth optimization), `reinforcement-learning` (policy optimization), `odes` (gradient flow). Honest "what we skipped": conic/semidefinite programming, multi-objective/Pareto fronts, online/bandit optimization, mixed-integer nonlinear, distributed/federated.

*(During the build I may fold #15 into #14, or split a heavy card; final count ~20–23.)*

## Pedagogical pattern (repo house style)

Each card follows the established rhythm: **Intuition** opener ("first, the picture") → the **equation** (KaTeX, color macros) with a **read-as** narration → a **live interactive** (SVG/canvas, no backend) → a **carry-this** takeaway. Plus, where earned: **Predict→reveal** (commit a guess before the data lands), **Misconception** (✗ common belief / ✓ actually / why), **Worked example**, **Deeper** fold (extra formalism + why/trade-offs), **glossary hovers** (`Term` + `GLOSS`). Cross-links knit the cards into a trail. Auto-playing sims gate to the viewport (`RafGate`) and replay on entry (`useReplayOnEnter`).

## Visual identity

Distinct from neighbors (decision = emerald/amber/fuchsia; control = sky/emerald; pde = indigo/cyan/orange; ode = violet/cyan/amber):
- **emerald** = objective / the descent / downhill · **indigo** = gradient & descent direction (and the abstract dual) · **amber** = constraints, walls, multipliers, shadow prices · **rose** = infeasible / divergence / non-convex traps · **cyan** = curvature / Newton / the Hessian · **fuchsia** = spine, anchor, cross-links.
- Hero gradient `from-emerald-500/5 via-indigo-500/5 to-transparent`.
- KaTeX color macros: `\obj` emerald (objective), `\dir` indigo (gradient/step), `\con` amber (constraints/multipliers/prices), `\inf` rose (infeasible/divergence), `\dual` violet (dual), `\an` fuchsia (anchor). (Hex colors **doubled `##`** inside macro bodies.)

---

## Researched illustrations + sources

Canonical teaching visuals at the heart of each card:
- **Contour plot + gradient arrows** — gradient ⟂ level set; steepest descent.
- **GD step-size phase diagram** — crawl / converge / oscillate / diverge as `η` grows.
- **Newton vs GD on an ill-conditioned bowl** — GD zigzags, Newton goes straight; Rosenbrock valley.
- **Momentum on a ravine** — heavy-ball vs GD trajectories.
- **Convex vs non-convex** — chord-above-graph test; one bowl vs many basins.
- **Lagrange tangency** — objective contour kisses the constraint curve; gradients parallel.
- **KKT** — active/inactive constraints; complementary slackness.
- **Lagrangian dual** — dual lower-bound curve under the primal; the gap.
- **LP polytope** — feasible polygon, objective sweep, optimum at a vertex; simplex edge-walk.
- **Branch-and-bound tree** — LP-relaxation bounds prune subtrees.
- **DP memo table** — knapsack grid filling in; shortest-path relaxation.
- **Min-cost flow / bipartite matching** — augmenting structure.
- **SGD noise ball** — full-gradient path vs stochastic jitter; Adam's per-axis scaling.
- **Saddle / loss landscape** — high-D saddle prevalence; sharp vs flat minima.
- **Simulated annealing** — accept-uphill probability vs temperature; cooling schedule.
- **Bayesian optimization** — GP surrogate + acquisition (EI/UCB) picking the next probe.
- **Autodiff computation graph** — forward vs reverse sweep.

### Sources
- Boyd & Vandenberghe, *Convex Optimization* (free PDF): https://web.stanford.edu/~boyd/cvxbook/
- Nocedal & Wright, *Numerical Optimization* (2e) — Newton, line search, trust region, SQP.
- Stephen Boyd, EE364a lecture slides: https://web.stanford.edu/class/ee364a/lectures.html
- Sebastian Ruder, "An overview of gradient descent optimization algorithms": https://www.ruder.io/optimizing-gradient-descent/
- distill.pub, "Why Momentum Really Works" (Goh): https://distill.pub/2017/momentum/
- Bertsimas & Tsitsiklis, *Introduction to Linear Optimization* — simplex, LP duality.
- Dantzig simplex method — Wikipedia: https://en.wikipedia.org/wiki/Simplex_algorithm
- Land–Doig branch and bound — Wikipedia: https://en.wikipedia.org/wiki/Branch_and_bound
- Bellman, dynamic programming / principle of optimality — Wikipedia: https://en.wikipedia.org/wiki/Dynamic_programming
- Edmonds, matroids & the greedy algorithm — Wikipedia: https://en.wikipedia.org/wiki/Matroid
- Kingma & Ba, "Adam": https://arxiv.org/abs/1412.6980
- Dauphin et al., "Identifying and attacking the saddle point problem...": https://arxiv.org/abs/1406.2572
- Kirkpatrick et al., "Optimization by Simulated Annealing" (Science 1983).
- Shahriari et al., "Taking the Human Out of the Loop: A Review of Bayesian Optimization": https://ieeexplore.ieee.org/document/7352306
- Baydin et al., "Automatic Differentiation in Machine Learning: a Survey": https://arxiv.org/abs/1502.05767
