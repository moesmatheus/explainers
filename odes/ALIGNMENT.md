# ODEs Explainer — Alignment & Content Doc

This doc aligns *who the explainer is for* with *what it covers*, before any code. It's the contract the build executes against.

---

## Audience

A **practitioner** who has already used ODEs in code or engineering and wants **intuition + the numerical-methods story** — *why* solvers work, where they break (error, stiffness, energy drift), and how to read a system geometrically. **Not** a proofs-first course: rigor (Picard–Lindelöf, Lipschitz) appears as *intuition for why solvers misbehave*, not as theorem-proof scaffolding. Comfortable with calculus; linear algebra is reintroduced where needed (eigenvalues, `e^{At}`).

## Scope & angle

A **broad survey** blending three lenses, in this order of emphasis:

1. **Geometric / qualitative** — the load-bearing intuition. An ODE is a *vector field*; a solution is a curve that flows along it. Phase planes, fixed points, stability, separatrices, limit cycles.
2. **Numerical** — the practitioner core. Euler → RK4 → stiffness/implicit → adaptive stepping → symplectic. Why `solve_ivp`/`ode45` do what they do.
3. **Analytical** — the classic solving toolkit (separable, integrating factors, characteristic equation, Laplace) kept tight, mainly to ground the geometry and to seed the s-plane → control-theory bridge.

## Anchor

**The pendulum**, threaded through every card, getting richer each step:

`linear (small-angle SHM) → nonlinear (full sinθ) → damped → driven → chaotic`

One physical system, extremely visual. It naturally produces: a 2nd-order→system reduction, a beautiful phase portrait (centers, saddles, separatrix), an energy/Lyapunov function, an honest stiff/conservation case for numerics, and a spectacular chaos payoff (Poincaré section, period-doubling, sensitive dependence).

## Relationship to `control-theory`

This explainer is the **foundations layer beneath** the existing `control-theory` explainer (which covers feedback, PID, LQR, Kalman, Riccati ODEs, Lyapunov). Overlap is handled by **cross-linking, not repeating**: the s-plane/poles card, the Lyapunov card, and the phase-plane card each link forward to their control-theory counterparts. ODEs = "what the system does"; control-theory = "how to steer it."

---

## Card lineup (~21 cards)

★ = spine/anchor. Primary spines: **the vector-field view** (intuition) and **damped-driven chaos** (payoff). Secondary anchors: phase plane, Euler's method.

**I. Frame & the geometric lens**
1. What is an ODE? — order, linearity, autonomous, IVP; pendulum introduced; 2nd-order → first-order system.
2. ★ The vector-field view — slope/direction fields; solution = curve tangent to the arrows.

**II. Analytical solving (first-order)**
3. Separable equations — RC discharge / Newton cooling; family of curves.
4. Linear first-order & integrating factors — `y' + p(t)y = q(t)`.
5. Existence & uniqueness — Picard iteration; non-uniqueness funnel; finite-time blowup. *Why your solver misbehaves.*

**III. Second-order & the linear pendulum**
6. Second-order linear — `θ'' + 2ζω θ' + ω²θ = 0`; under/critical/over-damped.
7. Resonance & forcing — amplitude-response curve, resonance peak.
8. Laplace transforms — `d/dt → ×s`; transfer function; poles in the s-plane. → control-theory.

**IV. Systems & qualitative theory**
9. ★ Systems & the phase plane — nonlinear pendulum portrait; centers, saddles, separatrix.
10. Linear systems & eigenvalues — `ẋ = Ax`, `e^{At}`; six canonical portraits.
11. Trace–determinant plane — master classification map; `D = T²/4` parabola.
12. Linearization & the Jacobian — Hartman–Grobman; pendulum at (0,0) vs (π,0).
13. Stability & Lyapunov — pendulum energy as Lyapunov function. → control-theory.
14. Limit cycles & nonlinear oscillation — Van der Pol; Poincaré–Bendixson (no chaos in 2D).

**V. Numerical methods**
15. ★ Euler's method — tangent-following; O(h) error.
16. Runge–Kutta (RK4) — sample the slope 4×; O(h⁴); Euler vs RK2 vs RK4.
17. Stability & stiffness — stability region in `hλ`; explicit blows up; backward Euler unconditionally stable.
18. Adaptive stepping — RKF45 / Dormand–Prince; step density adapts.
19. Symplectic integrators & conservation — RK4 energy drift vs leapfrog/Verlet on the undamped pendulum.

**VI. Chaos payoff & exits**
20. ★ Damped-driven pendulum → chaos — sensitive dependence; Poincaré section; period-doubling; strange attractor.
21. Next trails — PDEs, delay DEs, SDEs, neural ODEs; cross-links + honest "what we skipped."

---

## Pedagogical pattern (repo house style)

Each card follows the established rhythm: an **Intuition** opener ("first, the picture") → the **equation** (KaTeX with color macros) with a **read-as** narration → a **live interactive** (SVG, no backend) → a **carry-this** takeaway. Plus, where they earn their place: **Predict→reveal** (commit a guess before the data lands), **Misconception** (✗ common belief / ✓ actually / why), **Worked example**, **Deeper** fold (extra formalism + why/trade-offs), and **glossary hovers** (`Term` + `GLOSS`) for technical vocabulary. Cross-links knit the cards into a trail.

## Visual identity

Distinct from control-theory (sky/emerald) and decision-theory (emerald/amber/fuchsia):
- **violet** = solutions / flow · **cyan** = vector field / state space · **amber** = numerical methods / error · **rose** = instability & chaos · **emerald** = takeaways · **fuchsia** = spine/anchors/cross-links.
- Hero gradient: `from-violet-500/5 via-cyan-500/5 to-transparent`.

---

## Researched illustrations + sources

The interactive heart of each card draws on these canonical teaching visuals:

- **Slope/direction field** as the master intuition — arrows everywhere; solution tangent to them.
- **Pendulum phase portrait** — centers, saddles at (±π,0), the separatrix.
- **Trace–determinant plane** — `D = T²/4` parabola partitioning eigenvalue types.
- **Six canonical linear portraits** (node/saddle/spiral/center/star).
- **Picard iteration converging** + **non-uniqueness funnel** (`y'=y^{1/3}`) + **finite-time blowup** (`y'=y²`).
- **Euler vs RK2 vs RK4 error** at equal `h`; error-vs-`h` log-log.
- **Stability region** in the complex `hλ`-plane; **stiffness**; backward Euler unconditionally stable.
- **Adaptive stepping** — embedded-pair error control; step density follows the trajectory.
- **Symplectic integrators & energy drift** — RK4 spirals in vs leapfrog/Verlet stays on orbit.
- **Damped-driven pendulum → chaos** — sensitive dependence, Poincaré section, period-doubling, strange attractor.
- **Lyapunov / energy function** — `E = ½ω² − (g/L)cosθ`; level sets = undamped trajectories.
- **Limit cycle** — Van der Pol with `μ` slider.

### Sources
- Math Insight — phase plane / direction fields: https://mathinsight.org/phase_plane_visualize_differential_equation
- Monroe CC — visualizing differential equations (MIT-style tools): https://sites.monroecc.edu/multivariablecalculus/visualizing-differential-equations/
- SFASU — The Trace-Determinant Plane (ODE Project): https://faculty.sfasu.edu/judsontw/ode/html-20200801/linear07.html
- Chalmers — Linear/nonlinear 2D flows (Strogatz Ch. 5–6): https://fy.chalmers.se/~f99krgu/dynsys/DynSysLecture3.pdf
- UNL — Existence & Uniqueness (ODE Project): https://mathbooks.unl.edu/DifferentialEquations/firstlook06.html
- Picard–Lindelöf theorem — Wikipedia: https://en.wikipedia.org/wiki/Picard%E2%80%93Lindel%C3%B6f_theorem
- Euler method — Wikipedia: https://en.wikipedia.org/wiki/Euler_method
- UWaterloo — Stiff differential equations: https://ece.uwaterloo.ca/~dwharder/NumericalAnalysis/14IVPs/stiff/complete.html
- NTNU — Absolute stability of ODE methods: https://leifh.folk.ntnu.no/teaching/tkt4140/._main025.html
- LibreTexts — The Damped, Driven Pendulum (Chasnov): https://math.libretexts.org/Bookshelves/Scientific_Computing_Simulations_and_Modeling/Scientific_Computing_(Chasnov)/II:_Dynamical_Systems_and_Chaos/11:_The_Damped,_Driven_Pendulum
- Physics LibreTexts — The Road to Chaos (Fowler): https://phys.libretexts.org/Bookshelves/Classical_Mechanics/Graduate_Classical_Mechanics_(Fowler)/23:_Damped_Driven_Pendulum-_Period_Doubling_and_Chaos/23.02:_The_Road_to_Chaos
- Laplace transform — Wikipedia: https://en.wikipedia.org/wiki/Laplace_transform
