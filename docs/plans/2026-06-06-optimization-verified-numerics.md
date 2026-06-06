# Optimization explainer — verified numerics register

Every falsifiable numerical claim, checked in Node by an adversarial numericist.

## Anchor (Roastery)
confirmed: true
mismatches: No mismatches. I independently re-derived every quantity in hand-rolled Node (vertex enumeration for the LP, dual via A_B^T y = c on the binding rows, KKT active-set enumeration with a hand-coded 3x3 Gaussian elimination for the single-wall QP, and full brute-force box enumeration for the integer optimum) and every number agrees to full precision:

- Q eigenvalues 0.360303 / 0.029697, condition number kappa = 12.132530 (matches 12.132530233063973).
- Unconstrained concave max x* = Q^-1 a = (296.261682, 11.214953), INFEASIBLE: needs 366.729 kg beans vs G=27 (violated by 339.729). Q is SPD (Q11>0, det=0.0107>0) so this is the true global concave max. P1 holds.
- LP optimum (16.25, 7.5), cTx = 198.75, exactly at the beans+roaster intersection (verified by exact rational solve x1 = 13/0.8 = 16.25). Labor slack = 1.25 h; beans and roaster both bind exactly. Exactly 2 binding, 1 slack. P2 holds.
- Shadow prices beans = 6.25, roaster = 7.5 (the claimed 7.499999999999994 is just floating-point for 7.5; exact rational solve confirms 7.5), labor = 0. Both binding prices positive and round; slack resource priced at 0. P3 holds.
- Integer optimum (15, 9) with profit 198, UNIQUE (no other feasible integer point reaches 198, brute scan to 60x60). round(LP) = (16, 8) is INFEASIBLE (uses 1.2*16+1*8 = 27.2 kg beans > 27). differsFromRound = true. P4 holds.
- Concave constrained optimum (16.363636, 7.272727), profit 183.454545, active on the ROASTER wall alone (beans slack 0.0909, labor slack), multiplier mu = 42.181818 >= 0. KKT stationarity verified exactly: grad f = (8.436364, 4.218182) = mu * grad_g_roaster = (8.436364, 4.218182). Clean single-wall tangency. P5 holds.

allPropertiesHold = true is correct.

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

---

## frame-gradient-gd — cards 1 (What is optimization?), 2 (The gradient is a compass), 3 (Gradient descent & step size)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] Q = [[0.03,0.01],[0.01,0.36]] has det(Q) = 0.0107
- [confirmed] Q = [[0.03,0.01],[0.01,0.36]] has eigenvalue lambda_max = 0.360303
- [confirmed] Q = [[0.03,0.01],[0.01,0.36]] has eigenvalue lambda_min = 0.029697
- [confirmed] condition number kappa(Q) = lambda_max/lambda_min = 12.1325 (approx 12.13)
- [confirmed] L = lambda_max(Q) = 0.3603 (the smoothness/curvature constant of the demo bowl)
- [confirmed] Gradient descent monotone-convergence threshold for the demo bowl: eta < 1/L = 2.7754
- [confirmed] Gradient descent convergence (possibly oscillating) threshold: 0 < eta < 2/L = 5.5509
- [confirmed] Gradient descent diverges for eta > 2/L = 5.5509
- [confirmed] Fastest constant step size eta* = 2/(lambda_max + lambda_min) = 5.1282
- [confirmed] Asymptotic per-step contraction at eta*: rho* = (kappa-1)/(kappa+1) = 0.8477
- [confirmed] Unconstrained concave profit max x* = Q^-1 a = (296.26, 11.21) with a=(9,7)
- [confirmed] At x*=(296.26,11.21) green beans required = 1.2*296.26 + 1.0*11.21 = 366.73 kg (>> G=27, infeasible)
- [confirmed] Concave-constrained optimum is (16.364, 7.273) kg with profit $183.45/day
- [confirmed] LP optimum is (16.25, 7.5) kg with margin $198.75/day
- [confirmed] Shadow prices: green beans $6.25/kg, roaster $7.50/hr, labor $0.00
- [confirmed] Demo bowl f(x)=0.5(x-x*)^T Q (x-x*) with x*=(16.364,7.273); gradient gradDemo(x)=Q(x-x*)
- [confirmed] At p=(6,14): grad f = (-0.2437, 2.3181), so downhill -grad f = (0.2437, -2.3181)
- [confirmed] At p=(6,14): |grad f| = 2.3308
- [confirmed] At p=(6,14): contour tangent = rot90(grad) = (-2.3181, -0.2437) and grad . tangent = 0 (perpendicular)
- [confirmed] At p=(6,14): directional derivative grad.u for u at 70 degrees = 2.095 (= |grad|cos(theta), grad angle = 96.0 deg)
- [confirmed] Gradient downhill -grad at (2,18) = (0.324, -3.718), |grad| = 3.732
- [confirmed] Gradient downhill -grad at (10,10) = (0.164, -0.918), |grad| = 0.933
- [confirmed] Gradient at (16.364,7.273) = (0,0), |grad| = 0
- [confirmed] Gradient downhill -grad at (20,12) = (-0.156, -1.738), |grad| = 1.745
- [confirmed] Gradient downhill -grad at (25,2) = (-0.206, 1.812), |grad| = 1.824
- [confirmed] GD from x0=(2,18) with eta=0.5 (N=60): ||x20-x*||=10.9, ||x60-x*||=5.98
- [confirmed] GD from x0=(2,18) with eta=2.0 (N=60): ||x20-x*||=4.31, ||x60-x*||=0.373
- [confirmed] GD from x0=(2,18) with eta=4.0 (N=60): ||x20-x*||=1.17, ||x60-x*||=0.0074
- [confirmed] GD from x0=(2,18) with eta=5.128 (N=60): ||x20-x*||=0.658, ||x60-x*||=8.9e-4
- [confirmed] GD from x0=(2,18) with eta=5.4 (N=60): ||x20-x*||=3.39, ||x60-x*||=0.360
- [confirmed] GD from x0=(2,18) with eta=5.7 (N=60): diverges, ||x20-x*||=29.3, ||x60-x*||=238
- [confirmed] Iterations to ||x-x*||<0.01 from x0=(2,18): eta=0.5 -> 488, eta=2.0 -> 120, eta=5.128 -> 46
- [confirmed] GD iterates for eta=2.0 from x0=(2,18): k1=(2.6473,10.5638), k2=(3.4045,8.4688), k3=(4.1581,7.8670), k4=(4.8786,7.6834), k5=(5.5595,7.6176), k6=(6.2009,7.5856)
- [confirmed] Gradient descent equals forward-Euler integration of the ODE x-dot=-grad f with time step h=eta (iterates identical to machine precision)
- [confirmed] Forward Euler on linear ODE x-dot=-Qx is stable iff h < 2/lambda_max, the same 2/L threshold as GD
- [confirmed] Level value f at p=(6,14) on demo bowl = 9.06
- [confirmed] Error recursion for quadratic GD: e_{k+1}=(I - eta*Q) e_k, contracts iff |1-eta*lambda_i|<1 for all eigenvalues

<details><summary>node output</summary>

```
=== /tmp/opt_verify_frame.mjs ===
CLAIM1 det(Q) = 0.0107
CLAIM2 lambda_max = 0.360303 full: 0.3603027525481654
CLAIM3 lambda_min = 0.029697 full: 0.029697247451834607
CLAIM4 kappa = 12.132530233063973 approx: 12.1325
CLAIM5 L = lambda_max = 0.3603
CLAIM6 1/L = 2.7754436870873462 = 2.7754
CLAIM7/8 2/L = 5.5508873741746925 = 5.5509
CLAIM9 eta* = 2/(lmax+lmin) = 5.128205128205128 = 5.1282
CLAIM10 rho* = 0.8477064233239251 = 0.8477
CLAIM11 x*_unc = Q^-1 a = 296.26 11.21 full: 296.2616822429906 11.214953271028035
CLAIM12 beans at unc max = 366.73 (using rounded: 366.72 )

=== /tmp/opt_verify_frame2.mjs ===
CLAIM13 profit at concave-constrained opt = 183.46 full: 183.45876361999998
  roaster usage 0.2*16.364+0.1*7.273 = 4.0001
  recomputed tangency: x1 = 16.3636 x2 = 7.2727
  mu_roaster = 42.18
  profit at recomputed = 183.45
CLAIM14 LP opt = 16.2500 7.5000 margin = 198.75 binding: beans+roaster
  labor slack = 1.2500
CLAIM15 shadow beans = 6.25 roaster = 7.50 labor = 0.00 (slack)

=== /tmp/opt_verify_frame3.mjs ===
CLAIM16 gradDemo(x*) = 0.000000, 0.000000 (should be ~0)
CLAIM17 grad f at (6,14) = -0.2437 2.3181   -grad = 0.2437 -2.3181
CLAIM18 |grad| at (6,14) = 2.3308
CLAIM19 tangent rot90(grad) = -2.3181 -0.2437  grad.tangent = 0.00000000
CLAIM20 Du (u at 70deg) = grad.u = 2.0949
  grad angle = 96.0 deg; |grad|cos(angle between) check:
  |grad|*cos(gradAngle-70) = 2.0949
  p=(2,18) -grad=(0.324, -3.718) |grad|=3.732
  p=(10,10) -grad=(0.164, -0.918) |grad|=0.933
  p=(16.364,7.273) -grad=(0.000, 0.000) |grad|=0.000
  p=(20,12) -grad=(-0.156, -1.738) |grad|=1.745
  p=(25,2) -grad=(-0.206, 1.812) |grad|=1.824

=== /tmp/opt_verify_frame4.mjs ===
eta=0.5: ||x20-x*||=10.8872  ||x60-x*||=5.9836
eta=2: ||x20-x*||=4.3146  ||x60-x*||=0.3726
eta=4: ||x20-x*||=1.1705  ||x60-x*||=0.0074
eta=5.128: ||x20-x*||=0.6580  ||x60-x*||=0.0009
eta=5.4: ||x20-x*||=3.3927  ||x60-x*||=0.3595
eta=5.7: ||x20-x*||=29.3015  ||x60-x*||=237.6623
CLAIM32 iters to tol 0.01, eta=0.5: 488
CLAIM32 iters to tol 0.01, eta=2: 120
CLAIM32 iters to tol 0.01, eta=5.128: 46
  k=0 (2.0000, 18.0000)
  k=1 (2.6473, 10.5638)
  k=2 (3.4045, 8.4688)
  k=3 (4.1581, 7.8670)
  k=4 (4.8786, 7.6834)
  k=5 (5.5595, 7.6176)
  k=6 (6.2009, 7.5856)

=== /tmp/opt_verify_frame5.mjs ===
CLAIM34 GD vs forward-Euler max coordinate diff over 40 steps = 0
  2/lambda_max threshold = 5.5509
  h=5: ||x_200|| = 5.29e-14 (stable)
  h=5.5508: ||x_200|| = 5.12e+0 (stable)
  h=5.551: ||x_200|| = 5.19e+0 (stable)
  h=5.6: ||x_200|| = 1.72e+2 (DIVERGES)
  h=6: ||x_200|| = 5.49e+13 (DIVERGES)
CLAIM36 f(6,14) = 9.06 full: 9.05945638
CLAIM37 max diff between actual GD error and (I-eta Q)e_k over 20 steps = 1.7763568394002505e-15
  |1-2.0*lambda_max|= 0.2794  |1-2.0*lambda_min|= 0.9406 (both <1 => contracts)
```
</details>

---

## newton-momentum — cards 4 (Curvature & Newton), 5 (Momentum & acceleration)
allConfirmed: false

### Verified constants
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

### Per-claim verdicts
- [confirmed] Anchor Q=[[0.03,0.01],[0.01,0.36]] has det = 0.0107.
- [confirmed] Eigenvalues of anchor Q are lambda_max = 0.360303 and lambda_min = 0.029697.
- [confirmed] Condition number kappa(Q) = lambda_max/lambda_min = 12.13 (12.1325).
- [confirmed] sqrt(kappa) = 3.4832 for kappa = 12.13.
- [confirmed] Q inverse = [[33.6449, -0.9346],[-0.9346, 2.8037]].
- [confirmed] Unconstrained concave max x* = Q^{-1} a = (296.26, 11.21) for a=(9,7).
- [confirmed] Newton from any start lands on x* = (296.26, 11.21) in exactly one step on the anchor quadratic (x1 = x0 - Q^{-1}(Q x0 - a) = Q^{-1} a).
- [confirmed] Green beans needed at x* = 1.2*296.26 + 1.0*11.21 = 366.7 kg, exceeding budget G=27 kg (infeasible).
- [confirmed] GD optimal fixed step eta_opt = 2/(lambda_min+lambda_max) = 5.1282.
- [confirmed] GD stability edge eta_max = 2/lambda_max = 5.5509; GD diverges for eta > eta_max.
- [confirmed] GD with eta_opt: error (distance to optimum) contracts by exactly (kappa-1)/(kappa+1) = 0.8477 per step.
- [confirmed] GD with eta_opt: objective gap contracts by [(kappa-1)/(kappa+1)]^2 = 0.7186 per step.
- [confirmed] At eta_opt the steep (lambda_max) coordinate factor is 1 - eta_opt*lambda_max = -0.8477 (sign flips each step = zigzag).
- [confirmed] At eta_opt the flat (lambda_min) coordinate factor is 1 - eta_opt*lambda_min = +0.8477 (monotone crawl).
- [confirmed] Heavy-ball / Nesterov accelerated rate = (sqrt(kappa)-1)/(sqrt(kappa)+1) = 0.5539.
- [confirmed] Heavy-ball optimal alpha = (2/(sqrt(lambda_min)+sqrt(lambda_max)))^2 = 6.7015.
- [confirmed] Heavy-ball optimal beta = ((sqrt(kappa)-1)/(sqrt(kappa)+1))^2 = 0.30679.
- [confirmed] GD steps to reach within 1% of optimum on demo bowl (start (10,1), eta_opt) = 28.
- [confirmed] Heavy-ball steps to reach within 1% of optimum on demo bowl (start (10,1)) = 11.
- [confirmed] Steps to cut error 10x: GD = log(0.1)/log(0.8477) = 13.9; momentum = log(0.1)/log(0.5539) = 3.9.
- [confirmed] GD demo path from (10,1) at eta_opt: (10,1) -> (8.477,-0.848) -> (7.186,0.719) -> (6.092,-0.609) -> (5.164,0.516) -> (4.378,-0.438).
- [confirmed] Heavy-ball demo path from (10,1): (10,1) -> (8.01,-1.415) -> (5.805,1.260) -> (3.973,-0.962) -> (2.621,0.679) -> (1.684,-0.457).
- [confirmed] Newton on demo bowl g=0.5(lambda_min u^2 + lambda_max v^2) from (10,1) lands at (0,0) in one step.
- [confirmed] Contour ellipse axis ratio for the demo bowl = sqrt(kappa) = 3.483.
- [confirmed] Rosenbrock f(x,y)=(1-x)^2+100(y-x^2)^2 has global min at (1,1) with f=0 and gradient (0,0) there.
- [confirmed] Rosenbrock Hessian at (1,1) = [[802,-400],[-400,200]] with eigenvalues 1001.6 and 0.399, kappa = 2508.
- [corrected] Newton on Rosenbrock from (-1.2,1) converges to (1,1) in about 8 iterations. -> Pure Newton needs ~6 iterations (5-6 depending on tolerance), not 8. The ~8 figure corresponds to MODIFIED Newton (line search / trust region / Hessian modification), which the spec text invokes ('Newton with the modifications above'); damped/safeguarded variants typically take a few extra iterations. State '~6 iterations (pure Newton); a safeguarded/line-search Newton takes ~8' to be precise. The order-of-magnitude contrast with GD's thousands is unaffected.
- [confirmed] Plain GD on Rosenbrock from (-1.2,1) with eta=2e-3 needs about 8500 iterations to reach within 1e-3 of (1,1).
- [confirmed] At kappa=1 (round bowl) GD with optimal step reaches the bottom in one step, same as Newton.
- [confirmed] Newton step cost is O(n^3) to solve H*Delta = -grad and O(n^2) memory to store H.

<details><summary>node output</summary>

```
=== Claim 1: det Q ===
det = 0.0107
=== Claim 2: eigenvalues ===
lambda_max = 0.3603027525481654
lambda_min = 0.029697247451834607
=== Claim 3: kappa ===
kappa = 12.132530233063973
=== Claim 4: sqrt(kappa) ===
sqrt(kappa) = 3.4831781799190193
=== Claim 5: Q inverse ===
Qinv = [[33.64485981308411,-0.9345794392523366],[-0.9345794392523366,2.803738317757009]]
=== Claim 6: x* = Qinv a ===
x* = [ 296.2616822429906, 11.214953271028035 ]
=== Claim 7: Newton one step from arbitrary start ===
from x0 = [ 123.456, -78.9 ] -> x1 = [ 296.2616822429907, 11.214953271028037 ]
matches x* ? true
=== Claim 8: green beans at x* ===
beans = 366.72897196261675 budget G=27, infeasible? true
=== Claim 9: eta_opt ===
eta_opt = 5.128205128205128
=== Claim 10: eta_max ===
eta_max = 5.5508873741746925
=== Claim 11: GD error contraction ===
(kappa-1)/(kappa+1) = 0.8477064233239251
=== Claim 12: objective gap contraction ===
[(kappa-1)/(kappa+1)]^2 = 0.7186061801446417
=== Claim 13: steep factor ===
1 - eta_opt*lmax = -0.8477064233239251
=== Claim 14: flat factor ===
1 - eta_opt*lmin = 0.8477064233239251
=== Claim 15: accelerated rate ===
(sqrt(k)-1)/(sqrt(k)+1) = 0.5538879072533035
=== Claim 16: heavy-ball alpha ===
alpha = 6.701496481033048
=== Claim 17: heavy-ball beta ===
beta = 0.30679181380144416

=== Claim 18: GD steps to within 1% (eta_opt) ===
d0 = 10.04987562112089 tol = 0.1004987562112089 GD steps = 28
=== Claim 19: Heavy-ball steps to within 1% ===
HB steps = 11
=== Claim 20: steps to cut error 10x ===
GD: log(0.1)/log(gdRate) = 13.9364031096828
momentum: log(0.1)/log(accRate) = 3.897448518746705
=== Claim 21: GD demo path (eta_opt) ===
  step 0: (10.000, 1.000)
  step 1: (8.477, -0.848)
  step 2: (7.186, 0.719)
  step 3: (6.092, -0.609)
  step 4: (5.164, 0.516)
  step 5: (4.378, -0.438)
=== Claim 22: Heavy-ball demo path ===
  step 0: (10.000, 1.000)
  step 1: (8.010, -1.415)
  step 2: (5.805, 1.260)
  step 3: (3.973, -0.962)
  step 4: (2.621, 0.679)
  step 5: (1.684, -0.457)
=== Claim 23: Newton on demo bowl ===
  Newton step from (10,1) -> (0, 1.1102230246251565e-16)
=== Claim 24: contour ellipse axis ratio ===
  sqrt(kappa) = 3.4831781799190193
  sqrt(lmax/lmin) = 3.4831781799190193

=== Claim 25: Rosenbrock global min ===
f(1,1) = 0
grad(1,1) = [ -0, 0 ]
=== Claim 26: Rosenbrock Hessian at (1,1) ===
H = [[802,-400],[-400,200]]
eigenvalues: 1001.6006392325123 0.3993607674876216
kappa = 2508.0096012775152
=== Claim 27: Newton on Rosenbrock from (-1.2,1) ===
  tol=0.000001: iterations = 6
  tol=1e-8: iterations = 6
  tol=1e-10: iterations = 6
  iteration history (tol 1e-8):
    iter 1: x=-1.175281 y=1.380674 dist=2.208e+0
    iter 2: x=0.763115 y=-3.175034 dist=4.182e+0
    iter 3: x=0.763430 y=0.582825 dist=4.796e-1
    iter 4: x=0.999995 y=0.944027 dist=5.597e-2
    iter 5: x=0.999996 y=0.999991 dist=9.625e-6
    iter 6: x=1.000000 y=1.000000 dist=1.853e-11
=== Claim 28: Plain GD on Rosenbrock eta=2e-3, within 1e-3 ===
  eta=2e-3, tol=1e-3: iters=8500, diverged=false, final=(0.9995535542836977,0.9991055209049671)
=== Claim 29: kappa=1 round bowl, GD optimal step ===
  L=0.1, eta_opt=1/L=10, after one GD step from (10,1) -> (0, 0)
  factor 1 - eta*L = 0
=== Claim 30: Newton step cost ===
  Dense Cholesky/LU solve of n x n system H d = -g is O(n^3) flops; storing H is n^2 entries = O(n^2) memory.

--- Newton iteration counts under various criteria (start (-1.2,1)) ---
dist<1e-6: 6
gradnorm<1e-6: 6
f<1e-8: 5
f<1e-12: 6
dist<1e-3: 5

--- GD on Rosenbrock eta=2e-3, iterations vs tol (start (-1.2,1)) ---
  tol=0.01: 5624 iters
  tol=0.005: 6489 iters
  tol=0.001: 8500 iters
  tol=0.0005: 9367 iters
  tol=0.0001: 11381 iters

--- GD eta=2e-3, stop on f<tol ---
  f<0.000001: 7493 iters
  f<1e-8: 10373 iters

--- Rounding cross-check ---
kappa rounded 2dp: 12.13 | 12.1325
sqrt(kappa) 4dp: 3.4832
eta_opt: 5.1282
eta_max: 5.5509
gdRate 4dp: 0.8477
gdRate^2 4dp: 0.7186
accRate 4dp: 0.5539
alpha: 6.7015
beta: 0.30679
Qinv[0][0]: 33.6449  Qinv[1][1]: 2.
```
</details>

---

## convexity-optimality-subgrad — cards 6 (Convexity — the watershed), 7 (Optimality conditions), 8 (Non-smooth & subgradients)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] Q = [[0.03,0.01],[0.01,0.36]] has det = 0.0107
- [confirmed] Q eigenvalues are lambda_min = 0.0296972 and lambda_max = 0.3603028
- [confirmed] condition number kappa(Q) = 12.1325
- [confirmed] Hessian of profit = -Q has eigenvalues -0.3603028 and -0.0296972 (both negative, strictly concave)
- [confirmed] Hessian of -profit = Q has eigenvalues 0.0296972 and 0.3603028 (both positive, strictly convex)
- [confirmed] leading minor Q11 = 0.03 > 0 and det Q = 0.03*0.36 - 0.01^2 = 0.0107 > 0
- [confirmed] unconstrained concave max x* = Q^{-1} a = (296.26, 11.21)
- [confirmed] concave-constrained optimum (16.3636, 7.2727) gives profit = 183.4545
- [confirmed] gradient of profit at (16.3636,7.2727) = (8.4364, 4.2182)
- [confirmed] KKT multiplier mu_roaster = 42.1818 from both components
- [confirmed] roaster usage 0.2*16.3636 + 0.1*7.2727 = 4 (binding)
- [confirmed] beans slack at concave optimum = 27 - 26.9091 = 0.0909
- [confirmed] labor usage at concave optimum = 0.1*16.3636 + 0.15*7.2727 = 2.7273 (slack)
- [confirmed] soft-threshold prox_{t|.|}(v)=sign(v)max(|v|-t,0): prox_1(3)=2
- [confirmed] prox_1(0.4)=0
- [confirmed] prox_1(-2.5)=-1.5
- [confirmed] prox_2(5)=3
- [confirmed] prox_0.5(1.2)=0.7
- [confirmed] Jensen chord for f(x)=x^2 with A=(-1.5,2.25), B=(3.5,12.25): theta=0.5 gives x=1.0, f=1.0, chord=7.25, gap=6.25
- [confirmed] Jensen gap at theta=0.25 is 4.688 and at theta=0.75 is 4.688, endpoints gap=0
- [confirmed] saddle f=x^2-y^2 has gradient (2x,-2y)=0 at origin, Hessian [[2,0],[0,-2]] eigenvalues 2 and -2
- [confirmed] f=x^2+y^2 Hessian [[2,0],[0,2]] eigenvalues 2,2 -> minimum
- [confirmed] f=-(x^2+y^2) Hessian [[-2,0],[0,-2]] eigenvalues -2,-2 -> maximum
- [confirmed] f=x^2 (trough) Hessian [[2,0],[0,0]] eigenvalues 2,0 -> inconclusive
- [confirmed] directional second derivative d^T H d for saddle: d=(1,0) gives +2, d=(0,1) gives -2
- [confirmed] subdifferential of |x| at 0 is the interval [-1,1], at x>0 is {1}, at x<0 is {-1}
- [confirmed] L1-ball (diamond, tau=1) projection of b=(2.2,0.6) is (1, 0) -- x2 exactly zero
- [confirmed] L2-ball (disk, radius 1) projection of b=(2.2,0.6) is (0.9648, 0.2631) -- both nonzero
- [confirmed] 1D lasso min 0.5(x-3)^2 + 1*|x| has minimizer soft(3,1)=2, reached in one ISTA step from x=0 with t=1
- [confirmed] ISTA step from x=0: gradient step 0-(0-3)=3, prox_1(3)=2
- [confirmed] L1 norm penalty toll pulls smooth minimizer 3 down by t*lambda=1 to give 2
- [confirmed] pointwise max(x^2,(x-2)^2) is convex while min is non-convex (min=1,0,1,0,1 at x=-1,0,1,2,3)

<details><summary>node output</summary>

```
=== CLAIM 1: Q det ===
det Q = 0.0107  (0.03*0.36 - 0.01^2)
0.03*0.36 = 0.010799999999999999  0.01^2 = 0.0001

=== CLAIM 2: Q eigenvalues ===
lambda_min = 0.0296972
lambda_max = 0.3603028

=== CLAIM 3: condition number ===
kappa = 12.1325

=== CLAIM 4: Hessian of profit = -Q eigenvalues ===
eig(-Q) ascending = -0.3603028 -0.0296972  both negative: true

=== CLAIM 5: Hessian of -profit = Q eigenvalues ===
eig(Q) = 0.0296972 0.3603028  both positive: true

=== CLAIM 6: leading minors ===
Q11 = 0.03 >0: true
det = 0.0107 >0: true

=== CLAIM 7: unconstrained max x* = Q^{-1} a ===
x* = 296.2617 11.2150
beans needed 1.2*x1 + 1.0*x2 = 366.73

=== CLAIM 8: concave-constrained optimum profit ===
profit(16.3636,7.2727) = 183.4541
exact x = (180/11, 80/11) = 16.3636 7.2727
profit exact = 183.4545

=== CLAIM 9: gradient of profit at optimum ===
grad at exact = 8.4364 4.2182
grad at rounded = 8.4364 4.2182

=== CLAIM 10: KKT mu_roaster ===
mu from comp1 = 42.1818  mu from comp2 = 42.1818

=== CLAIM 11: roaster usage binding ===
0.2*x1 + 0.1*x2 = 4.000000  (limit 4)

=== CLAIM 12: beans slack ===
beans used = 26.9091  slack = 27 - 26.9091 = 0.0909

=== CLAIM 13: labor usage slack ===
labor used = 2.7273  (limit 4) slack = 1.2727

=== CLAIMS 14-18: soft-threshold prox ===
prox_1(3) = 2
prox_1(0.4) = 0
prox_1(-2.5) = -1.5
prox_2(5) = 3
prox_0.5(1.2) = 0.7000

=== CLAIM 19: Jensen chord f=x^2 ===
theta=0.5: x = 1.0000  f = 1.0000  chord = 7.2500  gap = 6.2500

=== CLAIM 20: Jensen gaps at 0.25, 0.75, endpoints ===
theta=0.25 gap = 4.688  x= 2.250 chord= 9.750 f= 5.063
theta=0.75 gap = 4.688  x= -0.250
theta=0 gap = 0.0000  theta=1 gap = 0.0000

=== CLAIM 21: saddle f=x^2-y^2 ===
grad at origin = (2*0, -2*0) = (0,0)
Hessian [[2,0],[0,-2]] eig = -2 2

=== CLAIM 22: f=x^2+y^2 ===
eig = 2 2  min (both >0): true

=== CLAIM 23: f=-(x^2+y^2) ===
eig = -2 -2  max (both <0): true

=== CLAIM 24: f=x^2 trough ===
eig = 0 2  inconclusive (a zero eig): true

=== CLAIM 25: directional second deriv saddle ===
d=(1,0): 2  d=(0,1): -2

=== CLAIM 26: subdifferential |x| ===
at x=0: [-1,1]; at x>0: {1}; at x<0: {-1} (definitional)

=== CLAIM 27: L1-ball projection of b=(2.2,0.6), tau=1 ===
projL1((2.2,0.6),1) = 1.0000 0.0000

=== CLAIM 28: L2-ball projection of b=(2.2,0.6), radius 1 ===
projL2((2.2,0.6),1) = 0.9648 0.2631
norm of b = 2.2804

=== CLAIM 29: 1D lasso min 0.5(x-3)^2 + |x| ===
soft(3,1) = 2
scan minimizer x = 2.0000  obj = 2.5000
ISTA gradient step from 0 = 3  prox_1 = 2

=== CLAIM 30: ISTA gradient step detail ===
0 - (0-3) = 3  prox_1(3) = 2

=== CLAIM 31: L1 toll pulls 3 down by t*lambda=1 ===
3 - 1 = 2  = prox_1(3) = 2

=== CLAIM 32: pointwise max vs min of x^2,(x-2)^2 ===
min values at x=-1,0,1,2,3: 1.000,0.000,1.000,0.000,1.000
max values at x=-1,0,1,2,3: 9.000,4.000,1.000,4.000,9.000
max(x^2,(x-2)^2) convex (random chord test): true
min(x^2,(x-2)^2) convex (random chord test): false
SPEC claim min=1,0,1,0,1 at x=-1,0,1,2,3 -> actual: 1,0,1,0,1

=== EXTRA CHECKS ===
L1 ball constrained min of ||x-b||^2 ~ ( 1.000 -0.000 ) -> expect (1,0)
L2 proj exact: 0.9648 0.2631
gap(0.25)= 4.68750  gap(0.75)= 4.68750
lmin= 0.02969724745  lmax= 0.3603027525  kappa= 12.13253023
beans overage = 1.2*296.2617+11.2150 - 27 = 339.73
profit(180/11,80/11) full = 183.4545455
grid concave-constrained max ~ ( 16.365 7.270 ) profit 183.455
```
</details>

---

## lagrange-kkt-duality — cards 9 (Lagrange multipliers), 10 (KKT), 11 (Duality & shadow prices)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] Q=[[0.03,0.01],[0.01,0.36]] is SPD with det(Q)=0.0107, eigenvalues λ_min=0.029697 and λ_max=0.360303, condition number κ(Q)=12.13
- [confirmed] Unconstrained concave max x*=Q^{-1}a = (296.26, 11.21) kg
- [confirmed] The unconstrained max requires 1.2*296.26+1.0*11.21 = 366.73 kg of beans, which is 339.73 kg over the 27 kg limit (infeasible)
- [confirmed] Concave-constrained optimum is x*=(16.364, 7.273) = (180/11, 80/11)
- [confirmed] Concave optimal profit = profit(16.364,7.273) = 183.45 $/day
- [confirmed] At the concave optimum gradf = (8.4364, 4.2182)
- [confirmed] Roaster multiplier μ_roaster = 42.18, and 8.4364/0.20 = 4.2182/0.10 = 42.1818 (both gradient ratios agree)
- [confirmed] Stationarity check: μ_roaster * (0.20,0.10) = (8.4364, 4.2182) equals gradf at the concave optimum
- [confirmed] At the concave optimum beans slack = 27 - (1.2*16.364+1.0*7.273) = 0.0909 kg, so μ_beans = 0
- [confirmed] At the concave optimum labor slack = 4 - (0.10*16.364+0.15*7.273) = 1.2727 h, so μ_labor = 0
- [confirmed] At the concave optimum roaster usage = 0.20*16.364+0.10*7.273 = 4.0000 (binds exactly)
- [confirmed] LP optimum (maximize 9x1+7x2) = (16.25, 7.50) at the intersection of the beans and roaster walls
- [confirmed] LP optimal margin c·x = 9*16.25+7*7.5 = 198.75 $/day
- [confirmed] At LP optimum beans usage = 27 (binds), roaster usage = 4 (binds), labor usage = 2.75 with slack 1.25 h
- [confirmed] LP shadow prices: beans = 6.25 $/kg, roaster = 7.50 $/h, labor = 0.00
- [confirmed] LP shadow prices solve 1.2*y1+0.2*y2 = 9 and 1.0*y1+0.1*y2 = 7 giving y=(6.25,7.50)
- [confirmed] Integer optimum (maximize 9x1+7x2 over integers) = (15, 9) with profit 198, unique
- [confirmed] round(LP)=(16,8) is infeasible: uses 1.2*16+1.0*8 = 27.2 kg beans > 27
- [confirmed] Concave value-function sensitivity: dV/dT (finite difference, ε=1e-4) = 42.1818 = μ_roaster exactly
- [confirmed] LP finite-difference shadow prices (ε=1e-3): dV/dG=6.2500, dV/dT=7.5000, dV/dL=0.0000
- [confirmed] LP strong duality: primal c·x = 198.75 equals dual b·y = 27*6.25+4*7.50+4*0 = 198.75
- [confirmed] Concave dual function g(μ) minimized at μ=42.18 with value 183.45, matching the primal profit
- [confirmed] Concave dual samples: g(0)=1372.43, g(10)=875.51, g(20)=512.24, g(30)=282.62, g(42.18)=183.45, g(50)=224.30, g(60)=395.61, g(80)=1139.16
- [confirmed] LP discrete +1 perturbations: +1 kg beans gives profit 205.00 (+6.25); +1 roaster-h gives 202.50 (+3.75, NOT +7.50 because binding set changes); +1 labor-h gives 198.75 (+0.00)
- [confirmed] LP optimum after +1 beans (G=28) moves to (15,10); after +1 roaster (T=5) moves to (22.5,0)
- [confirmed] LP shadow price for roaster $7.50 is the marginal rate valid for T in roughly [3.0, 4.5]; at T=4.5 the optimum reaches (22.5,0) and beyond the slope drops to 3.75 then 0
- [confirmed] LP shadow price for beans $6.25 is stable over G in [25,29] (optimum stays co-binding beans+roaster, slope constant)
- [confirmed] Weak duality demo: a feasible non-optimal LP dual y=(7.5,0,0) gives dual objective 27*7.5 = 202.50 >= 198.75 (gap 3.75)
- [confirmed] LP optimal dual y*=(6.25,7.50,0) makes both dual constraints tight: 1.2*6.25+0.2*7.5+0.1*0 = 9 and 1.0*6.25+0.1*7.5+0.15*0 = 7

<details><summary>node output</summary>

```
=== CLAIM 1: Q SPD/det/eig/kappa ===
det(Q) = 0.0107
lambda_min = 0.029697247451834607   lambda_max = 0.3603027525481654
kappa = 12.132530233063973  rounded: 12.13
SPD? Q11>0: true det>0: true

=== CLAIM 2: unconstrained max Q^{-1} a ===
x_unconstrained = ( 296.2616822429906 , 11.214953271028035 )  rounded ( 296.26 , 11.21 )
gradf at x_u = [ 1.3600232051658168e-15, 1.7763568394002505e-15 ]

=== CLAIM 3: beans at unconstrained ===
beans needed = 366.72897196261675  rounded: 366.73
overage = 339.72897196261675  rounded: 339.73

=== CLAIM 4: concave-constrained optimum ===
180/11 = 16.363636363636363   80/11 = 7.2727272727272725
derived concave* = ( 16.363636363636363 , 7.272727272727273 )
diff from (180/11,80/11): 0 8.881784197001252e-16

=== CLAIM 5: concave optimal profit ===
profit(180/11,80/11) = 183.45454545454547  rounded: 183.45

=== CLAIM 6: gradf at concave* ===
gradf = [ 8.436363636363637, 4.218181818181818 ]  rounded: 8.4364 4.2182

=== CLAIM 7: mu_roaster ===
gradf1/0.20 = 42.18181818181819   gradf2/0.10 = 42.18181818181817
mu_roaster = 42.18181818181819  rounded: 42.18

=== CLAIM 8: stationarity ===
mu*(0.2,0.1) = ( 8.436363636363637 , 4.218181818181819 )
gradf = [ 8.436363636363637, 4.218181818181818 ]

=== CLAIM 9: beans slack at concave* ===
beans usage = 26.90909090909091
beans slack = 0.09090909090908994  rounded: 0.0909

=== CLAIM 10: labor slack at concave* ===
labor usage = 2.7272727272727275
labor slack = 1.2727272727272725  rounded: 1.2727

=== CLAIM 11: roaster usage at concave* ===
roaster usage = 4

=== CLAIM 12: LP optimum ===
LP optimum = ( 16.249999999999993 , 7.500000000000005 )  binding cons idx: [ 0, 1 ]

=== CLAIM 13: LP margin ===
c.x = 198.74999999999997

=== CLAIM 14: LP usages ===
beans = 26.999999999999993  roaster = 3.999999999999999  labor = 2.75  labor slack = 1.25

=== CLAIM 15/16: LP shadow prices ===
y(beans,roaster) = [ 6.25, 7.499999999999994 ]   labor=0

=== CLAIM 17: integer optimum ===
integer opt = [ 15, 9 ]  profit = 198  #optima at that value = 1

=== CLAIM 18: round(LP)=(16,8) feasibility ===
beans(16,8) = 27.2  <=27? false
roaster(16,8) = 4  labor(16,8) = 2.8

=== CLAIM 19: concave dV/dT ===
dV/dT (eps=1e-4) = 42.18181818188782  rounded: 42.1818

=== CLAIM 20: LP FD shadow prices (eps=1e-3) ===
dV/dG = 6.25  dV/dT = 7.5  dV/dL = 0

=== CLAIM 21: LP strong duality ===
primal = 198.74999999999997
dual b.y = 27*6.25+4*7.50+4*0 = 198.75

=== CLAIM 22/23: concave dual g(mu) [x free] ===
g(0) = 1372.43
g(10) = 875.51
g(20) = 512.24
g(30) = 282.62
g(42.18) = 183.45
g(50) = 224.30
g(60) = 395.61
g(80) = 1139.16
argmin g(mu) = 42.18  min value = 183.45
[clamped x>=0 alt: g(50)=205.56, g(60)=241.39, g(80)=320.00; identical to free for mu<=42.18]

=== CLAIM 24: LP discrete +1 perturbations ===
base = 198.74999999999997
+1 beans (G=28) val = 205  delta = 6.250000000000028
+1 roaster (T=5) val = 202.5  delta = 3.7500000000000284
+1 labor (L=5) val = 198.74999999999997  delta = 0

=== CLAIM 25: LP opt after +1 perturbations ===
G=28 opt = [ 14.999999999999993, 10.000000000000007 ]
T=5 opt = [ 22.5, -0 ]

=== CLAIM 26: roaster range / T=4.5 ===
T | V* | opt | local slope (FD eps=1e-4)
3 | V*= 191.25 | x=( 3.75 , 22.5 ) | slope 7.5
3.5 | V*= 195 | x=( 10 , 15 ) | slope 7.5
4 | V*= 198.75 | x=( 16.25 , 7.5 ) | slope 7.5
4.25 | V*= 200.625 | x=( 19.37 , 3.75 ) | slope 7.5
4.4 | V*= 201.75 | x=( 21.25 , 1.5 ) | slope 7.5
4.5 | V*= 202.5 | x=( 22.5 , 0 ) | slope 3.75
4.6 | V*= 202.5 | x=( 22.5 , 0 ) | slope 0
5 | V*= 202.5 | x=( 22.5 , 0 ) | slope 0
6 | V*= 202.5 | x=( 22.5 , 0 ) | slope 0
discrete: V*(T=5)-V*(T=4) = 3.7500000000000284
T=2.75 x=( 0.62 , 26.25 ) slope 20 ; T=3 x=( 3.75 , 22.5 ) slope 7.5

=== CLAIM 27: beans range [25,29] ===
G=25 opt= [ 18.75, 2.5 ]  val= 186.25
G=26 opt= [ 17.5, 5 ]  val= 192.5
G=27 opt= [ 16.25, 7.5 ]  val= 198.75
G=28 opt= [ 15, 10 ]  val= 205
G=29 opt= [ 13.75, 12.5 ]  val= 211.25
slope 25->29: 6.25

=== CLAIM 28: weak duality y=(7.5,0,0) ===
dual obj = 27*7
```
</details>

---

## lp-simplex — cards 12 (Linear programming & the simplex)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] LP objective is maximize 9*x1 + 7*x2 with c=(9,7).
- [confirmed] Constraints: beans 1.2*x1+1.0*x2<=27, roaster 0.20*x1+0.10*x2<=4, labor 0.10*x1+0.15*x2<=4, x1>=0, x2>=0.
- [confirmed] The feasible region has exactly 5 vertices (a pentagon): O=(0,0), A=(20,0), B=(16.25,7.5), C=(0.625,26.25), D=(0,26.6667).
- [confirmed] Vertex O=(0,0) has objective $0.00.
- [confirmed] Vertex A=(20,0) has objective $180.00 and binds the roaster wall and x2=0.
- [confirmed] Vertex B=(16.25,7.5) has objective $198.75 and binds beans + roaster; it is the LP optimum.
- [confirmed] Vertex C=(0.625,26.25) has objective $189.375 and binds beans + labor.
- [confirmed] Vertex D=(0,26.6667) i.e. (0, 80/3) has objective $186.667 i.e. 560/3 and binds labor + x1=0.
- [confirmed] LP optimum is (16.25, 7.5) with objective $198.75.
- [confirmed] At the LP optimum, beans slack = 0, roaster slack = 0, labor slack = 1.25 (2.75 of 4 hours used).
- [confirmed] Shadow prices: beans $6.25/kg, roaster $7.50/hr, labor $0.00.
- [confirmed] Dual objective = 27*6.25 + 4*7.50 + 4*0 = 168.75 + 30 = $198.75, equal to primal (duality gap = 0).
- [confirmed] Dual equations with y_labor=0: 1.2*y_beans + 0.20*y_roaster = 9 and 1.0*y_beans + 0.10*y_roaster = 7 solve to y_beans=6.25, y_roaster=7.50.
- [confirmed] Iso-profit line slope = -9/7 = -1.2857, which lies strictly between beans wall slope -1.2 and roaster wall slope -2.0.
- [confirmed] Constraint wall slopes (dx2/dx1): beans -1.2, roaster -2.0, labor -0.6667 (=-0.1/0.15).
- [confirmed] Iso-profit slope -9/7 is not parallel to any of the three walls, so the LP optimum is a unique vertex (not an edge of ties).
- [confirmed] Dantzig simplex path O -> A -> B has 2 pivots with objectives $0 -> $180 -> $198.75, monotonically increasing.
- [confirmed] Alternative simplex path O -> D -> C -> B has 3 pivots with objectives $0 -> $186.667 -> $189.375 -> $198.75, monotonically increasing.
- [confirmed] Ratio test from origin entering x1 (x2=0): roaster 4/0.20=20, beans 27/1.2=22.5, labor 4/0.10=40; minimum is 20 (roaster binds), moving to A=(20,0).
- [confirmed] From optimum B, moving to neighbor A changes objective by -$18.75; moving to neighbor C changes objective by -$9.375 (both decrease).
- [confirmed] The smooth concave-constrained optimum was (16.36, 7.27) on the roaster wall alone with beans slack ~0.09; the LP optimum (16.25, 7.5) differs and binds both beans and roaster.
- [confirmed] Number of pairwise constraint intersections checked = C(5,2) = 10; exactly 5 are feasible vertices.
- [confirmed] The naive rounding of the LP optimum to (16, 8) is infeasible (used as a forward tease to card 13), and the integer optimum is (15, 9) at profit 198.

<details><summary>node output</summary>

```
=== VERTEX ENUMERATION ===
pairwise intersections checked (C(5,2)): 10
feasible vertices found: 5
  (16.250000, 7.500000)  obj=198.750000  binds=[beans,roaster]
  (0.625000, 26.250000)  obj=189.375000  binds=[beans,labor]
  (20.000000, 0.000000)  obj=180.000000  binds=[roaster,x2>=0]
  (0.000000, 26.666667)  obj=186.666667  binds=[labor,x1>=0]
  (0.000000, 0.000000)  obj=0.000000  binds=[x1>=0,x2>=0]

=== NAMED VERTEX CHECK ===
O=(0, 0.000000)  obj=0.000000  feasible=true
    binds=[x1>=0,x2>=0]
A=(20, 0.000000)  obj=180.000000  feasible=true
    binds=[roaster,x2>=0]
B=(16.25, 7.500000)  obj=198.750000  feasible=true
    binds=[beans,roaster]
C=(0.625, 26.250000)  obj=189.375000  feasible=true
    binds=[beans,labor]
D=(0, 26.666667)  obj=186.666667  feasible=true
    binds=[labor,x1>=0]
560/3 = 186.666667
80/3 = 26.666667

=== LP OPTIMUM ===
optimum = (16.249999999999993, 7.500000000000005)  obj=198.74999999999997

=== SLACK AT OPTIMUM B=(16.25,7.5) ===
  beans: used=27.000000 limit=27 slack=0.000000
  roaster: used=4.000000 limit=4 slack=0.000000
  labor: used=2.750000 limit=4 slack=1.250000

=== SHADOW PRICES (DUAL) ===
det = -0.08000000000000002
y_beans = 6.25
y_roaster = 7.499999999999994
y_labor = 0

=== DUAL OBJECTIVE / DUALITY GAP ===
dual = 27*6.25 + 4*7.499999999999994 + 4*0 = 168.75 + 29.999999999999975 = 198.74999999999997
primal = 198.75
gap = -2.842e-14
dual constraint x1: 8.999999999999998 (>=9?)
dual constraint x2: 6.999999999999999 (>=7?)

=== SLOPES (dx2/dx1) ===
iso-profit slope = -9/7 = -1.285714
beans slope = -1.2/1.0 = -1.200000
roaster slope = -0.20/0.10 = -2.000000
labor slope = -0.10/0.15 = -0.666667
between beans and roaster? true
iso parallel to any wall? beans:false roaster:false labor:false

=== RATIO TEST FROM ORIGIN, ENTER x1 (x2=0) ===
  roaster: 20
  beans: 22.5
  labor: 40
  min = 20 (roaster binds) -> A=(20,0)

=== SIMPLEX PATHS ===
Dantzig O->A->B objectives: 0 -> 180 -> 198.75
Alt O->D->C->B objectives: 0 -> 186.66666666666669 -> 189.375 -> 198.75
Dantzig monotone increasing? true
Alt monotone increasing? true

=== DELTAS FROM B TO NEIGHBORS ===
B->A: -18.75
B->C: -9.375

=== ROUNDING & INTEGER ===
round(LP)=(16,8) feasible? false
  beans: used=27.2000 limit=27 VIOLATED
  roaster: used=4.0000 limit=4 ok
  labor: used=2.8000 limit=4 ok
(15,9) feasible? true obj=198
integer optimum brute force = (15,9) profit=198
integer optima at that value: [[15,9]] (count=1)

=== CONCAVE-CONSTRAINED OPTIMUM (for Predict claim) ===
spec says smooth optimum ~ (16.36,7.27) on roaster wall alone, beans slack ~0.09
at (16.364,7.273): beans used=26.9098 slack=0.0902 roaster used=4.0001
```
</details>

---

## discrete-ilp-dp-flows — cards 13 (Integer programming & branch-and-bound), 14 (Dynamic programming), 15 (Network flows, matching & greedy)
allConfirmed: false

### Verified constants
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

### Per-claim verdicts
- [confirmed] B&B root LP relaxation of max 9x1+7x2 over the three Roastery walls is (16.25, 7.5) with objective 198.75.
- [confirmed] B&B node #1 (x2<=7): LP optimum (16.5, 7), bound 197.5.
- [confirmed] B&B node #2 (x2<=7, x1<=16): LP optimum (16, 7), bound 193, integer-feasible, becomes incumbent 193.
- [confirmed] B&B node #3 (x2<=7, x1>=17): LP optimum (17, 6), bound 195, integer-feasible, incumbent 195.
- [confirmed] B&B node #4 (x2>=8): LP optimum (15.8333, 8), bound 198.5, fractional.
- [confirmed] B&B node #5 (x2>=8, x1<=15): LP optimum (15, 9), bound 198, integer-feasible, optimal incumbent 198.
- [confirmed] B&B node #6 (x2>=8, x1>=16) is infeasible: 1.2*16 + 1*8 = 27.2 > 27 kg beans, pruned.
- [confirmed] Integer optimum of the Roastery is (15, 9) with profit 198, and it is unique among feasible integer points.
- [confirmed] round(LP) = (16, 8) is infeasible because 1.2*16 + 1*8 = 27.2 kg beans > 27 kg available.
- [confirmed] (15,9) resource usage: beans 27.0, roaster 3.9, labor 2.85; profit 9*15+7*9 = 198.
- [confirmed] Root branching uses most-fractional rule: x2=7.5 (distance 0.5 to integer) is branched before x1=16.25 (distance 0.25).
- [confirmed] B&B integrality gap root-to-integer is 198.75 - 198 = 0.75.
- [confirmed] LP shadow prices: green beans $6.25, roaster-hours $7.50, labor $0.00; dual objective 27*6.25 + 4*7.50 = 198.75 = LP primal.
- [confirmed] Knapsack instance C=10; items A(w5,v60), B(w3,v30), C(w4,v50), D(w2,v20), E(w5,v55).
- [confirmed] Knapsack value-per-weight ratios: A=12.0, B=10.0, C=12.5, D=10.0, E=11.0; descending order C>A>E>B>D.
- [confirmed] Greedy-by-ratio knapsack picks C then A (weight 9, value 110), then E/B/D all overflow remaining capacity 1; greedy total = 110.
- [confirmed] DP optimal knapsack value is 115, achieved by set {A, E} with weight 5+5 = 10.
- [confirmed] Greedy knapsack is suboptimal by 5 (110 vs 115) on this instance.
- [confirmed] DP cell V(5,10) = max(V(4,10)=110, V(4,5)+55 = 60+55 = 115) = 115.
- [confirmed] DP cell V(3,7) = max(V(2,7)=60, V(2,3)+50 = 30+50 = 80) = 80.
- [confirmed] Full DP knapsack table row +E(5,55) = [0,0,20,30,50,60,70,80,90,110,115] across c=0..10.
- [corrected] DP table is 6 rows x 11 columns = 55 cells; brute force over 2^5=32 subsets confirms optimum 115. -> The DP table is 6 rows x 11 columns = 66 cells (not 55). 6*11=66. (The figure 55 corresponds to 5*11 = n*C with n=5 orders, which is a different count used elsewhere in the Deeper block; the table itself including the i=0 'none' row has 6 rows = 66 cells.) Brute force over 2^5=32 subsets confirms optimum 115 — that part is correct.
- [confirmed] Max-flow network capacities: Roastery->HubN 12, Roastery->HubS 8, HubN->HubS 3, HubN->City 6, HubS->City 9.
- [confirmed] Max-flow from Roastery to City equals 15.
- [confirmed] Augmenting paths: Roastery-HubN-City (bottleneck 6), Roastery-HubS-City (bottleneck 8), Roastery-HubN-HubS-City (bottleneck 1), summing to 15.
- [confirmed] Min-cut equals {HubN->City (6), HubS->City (9)} = 15; total capacity out of source = 12+8 = 20 (not the cut).
- [confirmed] Assignment cost matrix [[2,6,9],[7,3,8],[5,1,4]] (rows Espresso/Filter/Decaf, cols North/Central/South).
- [confirmed] Min-cost assignment is Espresso->North(2), Filter->Central(3), Decaf->South(4) = $9, and it is the unique optimum (second-best is $11).
- [confirmed] Greedy-cheapest-cell assignment picks Decaf->Central($1) first, forcing Espresso->North($2) and Filter->South($8), total $11 > optimal $9.
- [confirmed] MST example edges W-1=1, W-2=4, 1-2=2, 1-3=6, 2-3=3, W-3=5; Kruskal greedy MST = {W-1(1), 1-2(2), 2-3(3)} total 6, matching brute-force optimum 6.

<details><summary>node output</summary>

```
=== /tmp/opt_verify_lp_bb.mjs ===
ROOT LP: (16.25, 7.5) val=198.75
NODE1 (x2<=7): (16.5, 7) val=197.5
NODE2 (x2<=7,x1<=16): (16, 7) val=193
NODE3 (x2<=7,x1>=17): (17, 6) val=195
NODE4 (x2>=8): (15.8333, 8) val=198.5
NODE5 (x2>=8,x1<=15): (15, 9) val=198
NODE6 (x2>=8,x1>=16): INFEASIBLE
  beans at (16,8): 27.2
INTEGER OPT: { i: 15, j: 9, v: 198 } all maximizers: [[15,9]] unique: true
round(LP)=(16,8) feasible? false beans: 27.2
(15,9) beans: 27 roaster: 3.9 labor: 2.8499999999999996 profit: 198
root x2 frac dist: 0.5  x1 frac dist: 0.25
gap root-to-int: 0.75

=== /tmp/opt_verify_dual.mjs ===
shadow beans y1: 6.25 shadow roaster y2: 7.499999999999994
dual objective 27*y1 + 4*y2 + 4*0 = 198.74999999999997
LP primal 9*16.25+7*7.5 = 198.75

=== /tmp/opt_verify_knapsack.mjs ===
ratios: A=12.00, B=10.00, C=12.50, D=10.00, E=11.00
descending ratio order: C(12.50) > A(12.00) > E(11.00) > B(10.00) > D(10.00)
greedy picks: C,A weight used: 9 value: 110 leftover cap: 1
        c:   0  1  2  3  4  5  6  7  8  9 10
none       0  0  0  0  0  0  0  0  0  0  0
+A(5,60)   0  0  0  0  0 60 60 60 60 60 60
+B(3,30)   0  0  0 30 30 60 60 60 90 90 90
+C(4,50)   0  0  0 30 50 60 60 80 90 110 110
+D(2,20)   0  0 20 30 50 60 70 80 90 110 110
+E(5,55)   0  0 20 30 50 60 70 80 90 110 115
V(5,10)= 115
DP cell V(5,10) = max(V(4,10)= 110 , V(4,5)+55= 60 +55= 115 ) = 115
DP cell V(3,7) = max(V(2,7)= 60 , V(2,3)+50= 30 +50= 80 ) = 80
Row +E (i=5): [0,0,20,30,50,60,70,80,90,110,115]
Table dims: 6 rows x 11 cols = 66 cells
DP optimal set: A,E value: 115
brute force subsets: 32 best value: 115 set: A,E
gap greedy vs DP: 5
{A,E} weight: 10 value: 115

=== /tmp/opt_verify_flows.mjs ===
MAX FLOW: 15
MIN CUT edges: HubN->City(6), HubS->City(9) = total 15
source out edges total: 20
path R-N-City min(12,6)= 6
path R-S-City min(8,9)= 8
path R-N-S-City after first two: residual R-N= 6 N-S= 3 S-City= 1 -> bottleneck 1
sum 6+8+1= 15
ASSIGNMENT best: 9 Espresso->North(2), Filter->Central(3), Decaf->South(4)
ASSIGNMENT 2nd-best: 11 Espresso->North(2), Filter->South(8), Decaf->Central(1)
best unique? true
GREEDY-cheapest-cell: 11 Decaf->Central(1), Espresso->North(2), Filter->South(8)
KRUSKAL MST: W-1(1), 1-2(2), 2-3(3) total 6
brute-force MST optimum: 6

=== /tmp/opt_verify_misc.mjs ===
6*11 = 66
5*11 = 55
198.5 > 195? true
0.5 > 0.25 (x2 more fractional)? true
(17,6) beans: 26.4 roaster: 4 labor: 2.6
(16,7) beans: 26.2 roaster: 3.9000000000000004 labor: 2.6500000000000004
(16.5,7) beans: 26.8 roaster: 4
(15.8333,8) beans: 26.999959999999998 roaster: 3.96666 obj: 198.4997
```
</details>

---

## stochastic-nonconvex-global — cards 16 (Stochastic & SGD/Adam), 17 (Non-convexity & saddles), 18 (Global & black-box)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] 1-D demo f(x)=x^4-4x^2+0.5x has exactly three critical points: x=-1.444485 (min, f=-4.714754, f''=17.04), x=+0.062623 (local max, f=+0.015640, f''=-7.95), x=+1.381862 (min, f=-3.300886, f''=14.91)
- [confirmed] Global minimum of f(x)=x^4-4x^2+0.5x is at x=-1.444485 with value f=-4.714754
- [confirmed] 2-D demo f(x,y)=(x^2-1)^2+y^2+0.3x has critical points only at y=0 where 4x^3-4x+0.3=0, with roots x=-1.035579, +0.075429, +0.960150
- [confirmed] For f2, min A at (-1.035579,0) f=-0.305428 with Hessian eigenvalues (8.869, 2); min B at (0.960150,0) f=0.294146 with eigenvalues (7.063,2); saddle at (0.075429,0) f=1.011282 with eigenvalues (-3.932, 2)
- [confirmed] f2 partials: fx=4x^3-4x+0.3, fy=2y, fxx=12x^2-4, fyy=2, fxy=0
- [confirmed] Adam on f=0.5x^2 from x0=1 (lr=0.1,b1=0.9,b2=0.999,eps=1e-8): step1 m=0.1, v=0.001, mhat=1.0, vhat=1.0, step=0.1, x1=0.900000
- [confirmed] Adam subsequent iterates: x2=0.800412, x3=0.701586, x4=0.603939, x5=0.507964
- [confirmed] Adam first-step magnitude equals lr alpha=0.1 because mhat/sqrt(vhat)=g/sqrt(g^2)=sign(g)=1
- [confirmed] On f=0.5(10x^2+y^2) with lr eta=0.1: x-axis (curvature 10) contraction factor 1-eta*10=0 so converges in 1 step; y-axis (curvature 1) factor 0.9/step, reaches 1e-3 in ~66 steps
- [confirmed] Adam (alpha=0.1) on f=0.5(10x^2+y^2) from (1,1): after 50 steps reaches (-0.00482,-0.00482); after 100 steps (0.00294,0.00294)
- [confirmed] GD stability bound on f=0.5(10x^2+y^2) is eta < 2/10 = 0.2
- [confirmed] SGD scalar stationary variance Var[x]=eta^2*sigma^2/(1-(1-eta*H)^2); with H=1,sigma^2=1,eta=0.1 exact=0.052632, small-step approx eta*sigma^2/(2H)=0.050
- [confirmed] Halving learning rate eta multiplies SGD noise-ball radius (std) by 1/sqrt(2)=0.7071
- [confirmed] SA acceptance p=exp(-Delta/T): Delta=1 gives p=0.904837 at T=10, 0.367879 at T=1, 0.135335 at T=0.5, 0.018316 at T=0.25, 0.000045 at T=0.1
- [confirmed] SA acceptance Delta=2: p=0.818731 at T=10, 0.135335 at T=1, 0.018316 at T=0.5
- [confirmed] Cooling from T=1 to T=0.25 drops accept prob for Delta=1 from 0.368 to e^{-4}=0.018, a ~20x drop
- [confirmed] Geometric cooling T0=10, alpha=0.95: T=7.737809 at k=5, T=0.059205 at k=100; T halves every ~13.5 steps (ln0.5/ln0.95=13.513)
- [confirmed] Saddle-prevalence coin-flip heuristic P(local min)=(1/2)^n: n=2 P(saddle)=0.50, n=5 P(saddle)=0.9375, n=10 P(saddle)=0.998047, n=50 P(min)=8.88e-16, n=100 P(min)=7.89e-31
- [confirmed] Expected Improvement EI=(fbest-mu-xi)*Phi(z)+sigma*phi(z) with z=(fbest-mu-xi)/sigma; for fbest=1.0,mu=0.8,sigma=0.5,xi=0: z=0.4, Phi(0.4)=0.6554, phi(0.4)=0.3683, EI=0.3152
- [confirmed] EI for mu=1.1,sigma=0.8,fbest=1.0,xi=0 equals 0.2716
- [confirmed] LCB=mu-kappa*sigma: for mu=0.8,sigma=0.5,kappa=2 gives -0.20; for mu=1.1,sigma=0.8,kappa=2 gives -0.50
- [confirmed] GP RBF posterior (lengthscale 1, jitter 1e-6) with observations f(1)=0.6411, f(4)=1.4634 for fbb(x)=sin(3x)+0.5x: at x=2.5 posterior mean=0.676, sd=0.890; at observed points sd~0.001
- [confirmed] fbb(x)=sin(3x)+0.5x evaluated: f(1)=0.6411, f(4)=1.4634
- [confirmed] Roastery condition number kappa(Q)=12.13 with eigenvalues lambda_max=0.360303, lambda_min=0.029697
- [confirmed] Roastery concave-constrained optimum used as noise-ball center is (16.364, 7.273)

<details><summary>node output</summary>

```
=== PART 1 (f1, f2 critical points) ===
=== CLAIM 1 & 2: f1 critical points ===
x=-1.444485  f=-4.714754  f''=17.04  f'=0.00000000
x=0.062623  f=0.015640  f''=-7.95  f'=0.00000000
x=1.381862  f=-3.300886  f''=14.91  f'=-0.00000000
global min candidate: x=-1.444485 f=-4.714754 vs x=1.381862 f=-3.300886

=== CLAIM 3,4,5: f2(x,y)=(x^2-1)^2+y^2+0.3x ===
x=-1.035579 y=0  f=-0.305428  fxx(eig)=8.869  fyy(eig)=2  f2x=0.00000000
x=0.075429 y=0  f=1.011282  fxx(eig)=-3.932  fyy(eig)=2  f2x=0.00000000
x=0.960150 y=0  f=0.294146  fxx(eig)=7.063  fyy(eig)=2  f2x=0.00000000

=== PART 2 (Adam, GD) ===
=== CLAIM 6,7,8: Adam on f=0.5x^2 ===
step1: m=0.100000 v=0.001000 mhat=1.000000 vhat=1.000000 step=0.100000 x1=0.900000
x2=0.800412
x3=0.701586
x4=0.603939
x5=0.507964
first-step magnitude check: mhat/sqrt(vhat) at t=1 with g=1 = 1.000000 (=sign(g)=1), so step=lr=0.1

=== CLAIM 9: GD on 0.5(10x^2+y^2), eta=0.1 ===
x contraction factor 1-eta*10 = 0.000000 (converges 1 step)
y factor per step = 0.9; steps to reach 1e-3 = ln(1e-3)/ln(0.9) = 65.5630 -> ceil 66

=== CLAIM 10: Adam on 0.5(10x^2+y^2) from (1,1) ===
after 50 steps: (-0.00482, -0.00482)
after 100 steps: (0.00294, 0.00294)

=== CLAIM 11: GD stability bound on 0.5(10x^2+y^2) ===
eta < 2/L, L=10 (max curvature) -> 2/10 = 0.2000

=== PART 3 (SGD variance, SA, cooling, saddles) ===
=== CLAIM 12: SGD stationary variance ===
exact Var = eta^2 sig^2/(1-(1-eta H)^2) = 0.052632
small-step approx eta sig^2/(2H) = 0.050

=== CLAIM 13: halving eta -> radius factor ===
1/sqrt(2) = 0.707107
exact-formula ratio r(eta/2)/r(eta) = 0.697982 (approx law says 0.7071)

=== CLAIM 14: Delta=1 acceptance ===
T=10: p=0.904837
T=1: p=0.367879
T=0.5: p=0.135335
T=0.25: p=0.018316
T=0.1: p=0.000045
=== CLAIM 15: Delta=2 acceptance ===
T=10: p=0.818731
T=1: p=0.135335
T=0.5: p=0.018316
=== CLAIM 16: cooling T=1 -> T=0.25 for Delta=1 ===
p(T=1)=0.367879 p(T=0.25)=0.018316=e^-4; ratio=20.09x

=== CLAIM 17: geometric cooling T0=10 alpha=0.95 ===
T at k=5 = 7.737809
T at k=100 = 0.059205
half-life = ln(0.5)/ln(0.95) = 13.513

=== CLAIM 18: P(local min)=(1/2)^n ===
n=2: P(min)=2.5000e-1 P(saddle)=1-2*(1/2)^n=0.500000
n=5: P(min)=3.1250e-2 P(saddle)=1-2*(1/2)^n=0.937500
n=10: P(min)=9.7656e-4 P(saddle)=1-2*(1/2)^n=0.998047
n=50: P(min)=8.8818e-16 P(saddle)=1-2*(1/2)^n=1.000000
n=100: P(min)=7.8886e-31 P(saddle)=1-2*(1/2)^n=1.000000

=== PART 4 (EI, LCB, GP, fbb, Roastery) ===
=== CLAIM 19: EI for fbest=1.0,mu=0.8,sigma=0.5,xi=0 ===
z=0.400000 Phi(z)=0.6554 phi(z)=0.3683 EI=0.3152

=== CLAIM 20: EI for mu=1.1,sigma=0.8,fbest=1.0,xi=0 ===
z=-0.125000 Phi(z)=0.4503 phi(z)=0.3958 EI=0.2716

=== CLAIM 21: LCB=mu-kappa*sigma ===
mu=0.8,sigma=0.5,kappa=2 -> -0.20
mu=1.1,sigma=0.8,kappa=2 -> -0.50

=== CLAIM 23: fbb(x)=sin(3x)+0.5x ===
f(1)=0.6411  f(4)=1.4634

=== CLAIM 22: GP RBF posterior, lengthscale 1, jitter 1e-6 ===
at x=2.5: mean=0.676 sd=0.890
at x=1: mean=0.6411 sd=0.0010
at x=4: mean=1.4634 sd=0.0010

=== CLAIM 24: Roastery Q eigenvalues + condition number ===
det=0.010700 lambda_max=0.360303 lambda_min=0.029697 kappa=12.13

=== CLAIM 25: noise-ball center (concave-constrained optimum) ===
concave-constrained optimum = (16.364, 7.273)

=== PART 5 (precision edge-cases) ===
=== CLAIM 18 precision check ===
n=50 P(min)=(1/2)^50 = 8.882e-16  (claim 8.88e-16)
n=100 P(min)=(1/2)^100 = 7.889e-31 (claim 7.89e-31)

=== CLAIM 13 approx-law check ===
approx std ratio r(eta/2)/r(eta) = 0.707107 = 1/sqrt(2) = 0.707107
(the claim's 0.7071 is the small-step law; exact-formula ratio at eta=0.1 is 0.698, claim is about the law)

=== CLAIM 22 observed-point sd ===
sqrt(jitter) baseline ~ 0.0010 = 0.001 -> consistent with sd~0.001

=== CLAIM 23 fbb full precision ===
f(1)=sin(3)+0.5 = 0.641120
f(4)=sin(12)+2 = 1.463427
```
</details>

---

## synthesis-autodiff-trails — cards 19 (Anchor — solved every way), 20 (Autodiff/backprop), 21 (Next trails)
allConfirmed: true

### Verified constants
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

### Per-claim verdicts
- [confirmed] Anchor concave objective: profit(x1,x2)=9x1 - 0.5*0.03*x1^2 + 7x2 - 0.5*0.36*x2^2 - 0.01*x1*x2
- [confirmed] Q=[[0.03,0.01],[0.01,0.36]] has det = 0.0107
- [confirmed] Q eigenvalues lambda_min=0.029697, lambda_max=0.360303, condition number kappa = 12.13
- [confirmed] Unconstrained concave max x* = Q^-1 a = (296.26, 11.21) kg
- [confirmed] At unconstrained max, green beans needed = 1.2*296.26 + 1.0*11.21 = 366.73 kg, which exceeds limit 27
- [confirmed] LP optimum (maximize 9x1+7x2) is at (16.25, 7.5) kg
- [confirmed] LP optimal margin c^T x = 198.75 $/day
- [confirmed] At LP optimum, beans wall binds (uses 27.0 of 27) and roaster wall binds (uses 4.0 of 4)
- [confirmed] At LP optimum, labor wall is slack: uses 2.75 of 4, slack = 1.25 labor-hours
- [confirmed] LP shadow price on green beans = 6.25 $/kg
- [confirmed] LP shadow price on roaster-hours = 7.50 $/hour
- [confirmed] LP shadow price on labor = 0.00
- [confirmed] Strong duality: dual value 27*6.25 + 4*7.50 + 4*0 = 198.75 equals primal margin 198.75
- [confirmed] Concave-constrained optimum is (16.364, 7.273) kg on the roaster wall (0.20x1+0.10x2=4); exact x2=0.52/0.0715, x1=20-0.5*x2
- [confirmed] Gradient of profit at concave-constrained optimum = (8.4364, 4.2182)
- [confirmed] Lagrange multiplier mu_roaster = 42.18 (= 8.4364/0.20 = 4.2182/0.10)
- [confirmed] Concave optimal profit = 183.45 $/day
- [confirmed] At concave-constrained optimum, beans slack = 0.0909 kg (uses 26.909 of 27), labor slack = 1.2727 hours (uses 2.7273 of 4)
- [confirmed] Integer optimum (maximize 9x1+7x2 over integers) is (15, 9) bags, unique, with profit 198
- [confirmed] round(LP) = (16, 8) is infeasible: beans 1.2*16+1.0*8 = 27.2 kg > 27
- [confirmed] round(LP) = (16,8) uses exactly 4.0 roaster-hours (0.20*16+0.10*8=4.0)
- [confirmed] Integer optimum (15,9): beans 1.2*15+9=27.0 (tight), roaster 0.20*15+0.10*9=3.9, profit 9*15+7*9=198
- [confirmed] Integrality gap: 198 (integer) vs 198.75 (LP) approx 0.4%
- [confirmed] Autodiff demo f = x1*x2 + sin(x1) at x1=2, x2=3 gives f = 6.909297
- [confirmed] Autodiff intermediate values: v1 = x1*x2 = 6, v2 = sin(2) = 0.909297, v3 = f = 6.909297
- [confirmed] Analytic partials: df/dx1 = x2 + cos(x1) = 3 + cos(2) = 2.583853; df/dx2 = x1 = 2
- [confirmed] cos(2) = -0.416147
- [confirmed] Forward mode seed (dx1=1,dx2=0): v_dot1=3, v_dot2=cos(2)= -0.416147, v_dot3 = df/dx1 = 2.583853
- [confirmed] Forward mode seed (dx1=0,dx2=1): v_dot1=2, v_dot2=0, v_dot3 = df/dx2 = 2
- [confirmed] Reverse mode seed v3bar=1: v1bar=1, v2bar=1, x2bar = v1bar*x1 = 2, x1bar = v1bar*x2 + v2bar*cos(2) = 3 + (-0.416147) = 2.583853
- [confirmed] Central finite difference with h=1e-6 gives df/dx1 approx 2.583853 and df/dx2 approx 2.000000, matching autodiff to 6+ digits
- [confirmed] GD with step eta=1/lambda_max takes 147 iterations from (0,0) to reach within 1e-3 of the unconstrained quadratic minimum; Newton reaches it in exactly 1 step
- [confirmed] Reverse-mode autodiff computes the full gradient of a scalar loss over n parameters in one backward pass (cost O(1) forward evaluations, independent of n); forward mode needs n passes

<details><summary>node output</summary>

```
=== CLAIM: Q det ===
det(Q) = 0.0107

=== CLAIM: Q eigenvalues / condition number ===
lambda_min = 0.029697247451834607
lambda_max = 0.3603027525481654
kappa = 12.132530233063973

=== CLAIM: Unconstrained max x* = Q^-1 a ===
x* = [ 296.2616822429906, 11.214953271028035 ]
check grad at x* (should be ~0): [ 1.3600232051658168e-15, 1.7763568394002505e-15 ]

=== CLAIM: beans needed at unconstrained max ===
beans needed = 366.72897196261675  (limit 27)
beans at (296.26,11.21) = 366.722
excess over 27 = 339.72897196261675

=== CLAIM: LP optimum (max 9x1+7x2) ===
feasible vertices: [ [ 16.25, 7.5 ], [ 0.625, 26.25 ], [ 20, 0 ], [ 0, 26.6667 ], [ 0, 0 ] ]
LP optimum = [ 16.249999999999993, 7.500000000000005 ]  margin = 198.74999999999997  binding rows: [ 0, 1 ]

=== CLAIM: LP wall usage at optimum ===
beans: uses 26.999999999999993 of 27, slack=7.105427357601002e-15
roaster: uses 3.999999999999999 of 4, slack=8.881784197001252e-16
labor: uses 2.75 of 4, slack=1.25

=== CLAIM: LP shadow prices (dual) ===
y_beans = 6.25  y_roaster = 7.499999999999994  y_labor = 0

=== CLAIM: strong duality ===
dual value 27*y_beans + 4*y_roaster + 4*0 = 198.74999999999997  primal margin = 198.74999999999997

=== CLAIM: Concave-constrained optimum on roaster wall ===
x2 = 7.272727272727273  x1 = 16.363636363636363  mu = 42.18181818181818
spec exact form x2 = 0.52/0.0715 = 7.272727272727273
spec x1 = 20 - 0.5*x2 = 16.363636363636363
grad f at KKT = [ 8.436363636363637, 4.218181818181818 ]
mu from grad/0.20 = 42.18181818181819  from grad/0.10 = 42.18181818181817
profit at KKT = 183.45454545454547

=== concave KKT wall slacks ===
beans: uses 26.90909090909091 of 27, slack=0.09090909090908994
roaster: uses 4 of 4, slack=0
labor: uses 2.7272727272727275 of 4, slack=1.2727272727272725

=== verify concave-constrained is global (check candidates) ===
tangency on roaster: (16.3636,7.2727) mu=42.182 profit=183.455
best single-wall constrained max: { X1: 16.363636363636367, X2: 7.2727272727272725, P: 183.4545454545455, wall: 'roaster' }

=== CLAIM: integer optimum (max 9x1+7x2 over feasible integers) ===
integer optimum = { X1: 15, X2: 9, v: 198 }  ties at this value: [ [ 15, 9 ] ]

=== CLAIM: round(LP)=(16,8) feasibility ===
beans 1.2*16+1.0*8 = 27.2  > 27 ? true
roaster 0.20*16+0.10*8 = 4
(16,8) feasible? false

=== CLAIM: integer (15,9) checks ===
beans 1.2*15+9 = 27
roaster 0.20*15+0.10*9 = 3.9
profit 9*15+7*9 = 198
(15,9) feasible? true

=== CLAIM: integrality gap ===
gap = 198.74999999999997 (LP) vs 198 (int) => 0.377%

=== CLAIM: f value and intermediates ===
v1 = x1*x2 = 6
v2 = sin(2) = 0.9092974268256817
v3 = f = 6.909297426825682
f formatted = 6.909297

=== CLAIM: analytic partials ===
df/dx1 = x2 + cos(2) = 2.5838531634528574 => 2.583853
df/dx2 = x1 = 2

=== CLAIM: cos(2) ===
cos(2) = -0.4161468365471424 => -0.416147

=== CLAIM: forward mode seed (1,0) ===
vdot1 = 3  vdot2 = -0.4161468365471424 => -0.416147  vdot3 = 2.5838531634528574 => 2.583853

=== CLAIM: forward mode seed (0,1) ===
vdot1 = 2  vdot2 = -0  vdot3 = 2

=== CLAIM: reverse mode ===
v1bar = 1  v2bar = 1
x2bar = v1bar*x1 = 2
x1bar = v1bar*x2 + v2bar*cos(2) = 2.5838531634528574 => 2.583853
  components: 3 + ( -0.416147 ) = 2.5838531634528574

=== CLAIM: central finite difference h=1e-6 ===
FD df/dx1 = 2.5838531634292394  (analytic 2.5838531634528574 , err 2.36e-11)
FD df/dx2 = 2.000000000279556  (analytic 2 , err 2.80e-10)
matches to 6+ digits? true

=== CLAIM: GD with eta=1/lambda_max takes 147 iters; Newton 1 step ===
GD eta=1/lmax: iters to within 1e-3 = 147  final dist = 9.54e-4
x* = [ 296.2616822429907, 11.214953271028037 ]  eta = 2.7754436870873462  lmax = 0.3603027525481654  lmin = 0.029697247451834607  kappa = 12.132530233063973
Newton 1 step from (0,0): [ 296.2616822429906, 11.214953271028035 ]  dist = 5.69e-14

=== GD robustness check ===
iters (dist to x* <= 1e-3): 147
iters (grad norm <= 1e-3): 106
contraction factor rho = 1-lmin/lmax = 0.9175769620359349  kappa = 12.1325302330639
```
</details>
