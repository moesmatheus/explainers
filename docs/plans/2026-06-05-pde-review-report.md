# PDE Explainer — Consolidated Lead-Editor Action List

File: `/Users/matheus/Documents/GitHub/explainers-claude/pde/PDEsExplainer.jsx` (3352 lines)

**Adjudication note.** Three reviewer "correctness" flags were refuted by the numericist after Node verification and I have confirmed each against the source — they are DROPPED:
- **turing (C7) — Du/Dv "contradiction":** No contradiction exists. Line 3081 says `D_u>D_v`, line 3091 says "fast inhibitor plus a slow activator," code line 3002 has `Du=0.16 > Dv=0.08`. The activator is v (autocatalytic `u·v²`, slow), inhibitor is u (fast). The reviewer misread the prose ("u is slow") — the prose never says that. Adopting the reviewer's fix would be a no-op or introduce an error. **No change.**
- **cfl (C5) — "2D bound r≤¼ is just a conservative practical bound below the true r≤½ edge":** Wrong. The numericist's von Neumann check (g(π,π)=1−8r) shows r≤¼ is the *true* 2D stability edge. Card lines 2466–2467 are correct as written. The "r=½ undamped → r≈0.4" sentence refers to 1D and is fine. **No change.**
- **fem (C5) — "N^(-1.5) corner exponent is wrong, should be N^(-0.5)":** Wrong. For a kink (C⁰, jump in 1st derivative) the L2 truncation error is genuinely ∝ N^(-3/2); coded value `0.8*N^(-1.5)` (line 2490) is correct. N^(-0.5) would be a value-discontinuity (shock), not a corner. Only a minor label tweak survives (see P2).

Everything else below is deduplicated across the 7 clusters + global critic, with confirmed-correct numerics removed.

---

## P0 — CORRECTNESS BUGS (must fix)

### P0-1 · `gallery` — Schrödinger misclassified as "hyperbolic" (3 places, fix in lockstep)
Flagged by both the C6 reviewer and the global critic; numericist confirmed it is a genuine internal inconsistency: the card's OWN rule ("sort by the discriminant of its top-order terms," MinSchema line 2634) makes Schrödinger **parabolic** (single time-derivative ⇒ B²−4AC = 0, same signature as heat), not hyperbolic. It has no real characteristics and no finite propagation speed. The chip text even contradicts itself, with the Misconception box (line 2643) correctly calling it a "heat/wave HYBRID … diffusion in IMAGINARY time."

Three mutually-reinforcing spots must change together or they will contradict each other:
- **Line 2564** (FAMOUS array): `char: 'hyperbolic'` for `id: 'sch'`.
- **Line 2628** (intro prose): "Hyperbolic = ring (waves, Maxwell, sound, **Schrödinger**)."
- **Line 3253** (Trails cross-link recap) reinforces the hybrid framing — keep consistent.

**Correction (preferred, per global critic + numericist):** Introduce a distinct tag for Schrödinger rather than forcing it into the big-three. The glossary already has a `dispersion` entry (line 498) and the wave card calls Schrödinger dispersive, so a **`char: 'dispersive'`** chip with its own tone is the cleanest. Reword `why` to: *"a heat/wave hybrid — Δ with a single time-derivative like heat, but the factor i swaps decay for oscillation, so it rings unitarily and never smooths; dispersive, with no real characteristics."* Remove "Schrödinger" from the hyperbolic list at line 2628 and instead name it as the dispersive/hybrid special case.
**Acceptable lower-effort alternative:** set `char: 'parabolic'` (matches the discriminant rule the card teaches) and keep the behavior caveat in `why`. Do NOT keep `'hyperbolic'` — that leaves the filter chip and the discriminant MinSchema mutually contradictory.

### P0-2 · `fourier` — `cos(ckt)` wave evolution silently assumes zero initial velocity
The prose (line 2137 "waves spin each by cos(ckt)"), the panel caption (line 2118 "wave spins each by cos(ckt)"), and the code (line 2092 `bk[k] * Math.cos(w * t)`) all bake in ∂u/∂t(·,0)=0 without saying so. The general per-mode solution is âₖ(t) = âₖ(0)cos(ckt) + (v̂ₖ/ck)sin(ckt). Numericist confirmed cos(ckt) alone requires vₖ=0 for every mode.
**Correction:** In the line-2137 prose and line-2118 caption write `âₖ(t)=âₖ(0)cos(ckt)+(v̂ₖ/ck)sin(ckt)` or add the caveat "(assuming zero initial velocity)." Strongest fix: add an "initial velocity" slider to FourierLab's wave mode so users watch the sin term shift the phase.
**Do NOT** add "this assumes ∂u/∂t=0" to the separation-of-variables Worked example (lines 2128–2132) — that example is the **heat** equation (first order in time, no uₜ IC), so the caveat would be false there. The C4 reviewer's second sub-fix is misdirected and is dropped.

---

## P1 — CLARITY FIXES (rewrite for correctness-of-exposition)

### P1-1 · GLOBAL `TrailsCard` SPINE_NODES — recap inverts the spine order
**Lines 3205–3211.** SPINE_NODES lists `local rule → Laplacian → Fourier → three fates → numerics`, but the actual card order is whatis(1) → laplacian(2) → **bigthree/three-fates(3)** → … → **fourier(10)**, and the hero + file-header spine both say `… three fates → Fourier`. The closing recap is exactly where the reader consolidates the through-line, so the inversion is maximally damaging.
**Fix:** Swap lines 3208 and 3209 so the order reads `… the Laplacian → three fates → Fourier → numerics & frontier`. (Keep each node's `tone`/`to` with its label.)

### P1-2 · `laplace` — mean-value property stated as definition, not consequence
The prose presents "every interior point exactly equals the average of its neighbors — the mean-value property" as if it defines harmonicity; it is a *consequence* of Δu=0.
**Fix:** Lead with the cause: *"The condition Δu = 0 forces every interior point to equal the average of its neighbors — this is the mean-value property. Because of it, there are no interior hot-spots…"* (Numbers in MinSchema/Predict are already correct — center ≈ 0.243 → limit ¼; only the lead sentence needs reordering.)

### P1-3 · `classify` — wave operator dimensionally loose + "time-flipped" undefined
Deeper writes □ = ∂ₜₜ − Δ. Strictly this needs a c² (or a declared c=1). Numericist notes the explainer already uses natural units (CHAR_COLS writes wave as uₜₜ=Δu; WaveString sets c=1), so it's internally consistent, not a true error — downgrade from the reviewer's "high/essential."
**Fix:** Write □ = ∂ₜₜ − c²Δ **or** add "(natural units, c=1)," and clarify that "time-flipped" means the spacetime **signature** flip (diag(+1,+1) → diag(+1,−1)), not merely dropping Δ.

### P1-4 · `classify` — Predict word "boundary" collides with spatial-boundary usage
"Where does heat land — and why on the boundary (disc = 0)?" reads ambiguously next to the heavy spatial-"boundary" usage two cards over.
**Fix:** *"Where does heat land in the classification — and why exactly on the parabola, the threshold disc = 0 between elliptic and hyperbolic?"*

### P1-5 · `heat` — "immeasurably faintly" mis-frames exponential decay as a measurement limit
Numericist: at x=1 km the kernel is positive but underflows double precision; the smallness is mathematical, not instrumental.
**Fix:** *"A thermometer a kilometre away responds immediately — with an amplitude exponentially small in x²/(4Dt), but instantly."* (Avoid quoting a bare `exp(−x²/4Dt)` as "the amplitude" — the 1/√(4πDt) prefactor matters; "exponentially small in x²/(4Dt)" is precise and gentle.)

### P1-6 · `heatkernel` — random-walk → D=½ identification is too terse
Numbers all verified (±1 step var=1, var after n=n, kernel var=2Dt, match ⇒ D=½). Only exposition is the gap (silent t=n, Δx=Δt=1).
**Fix:** Expand to spell out the matching and cross-reference the Deeper relation already on the card: *"…variance n. The heat kernel has variance 2Dt; matching n = 2Dt (one tick = one time unit, unit step) gives D = ½. In general D = Δx²/(2Δt)."*

### P1-7 · `characteristics` — three buried intuitions need surfacing
(a) Add a "read as" for transport: *"u doesn't change (du/dt = 0) as you ride a curve moving at speed c, so u(x,t)=u₀(x−ct)."* (b) Add one line to the Worked example explaining the shock-time formula: *"the steepest descending gradient falls behind and collides first, at t* = −1/(steepest slope)"* (numbers min u₀'≈−5.36, t*≈0.187 verified correct). (c) Gloss the entropy condition: *"u_L > u_R means the shock is compressive (fast fluid crashes into slow), ruling out the unphysical rarefaction shock."* (d) Show the R–H derivation in Deeper: `s = Δf/Δu = [(u_R²−u_L²)/2]/(u_R−u_L) = (u_R+u_L)/2` (verified). (e) One line on why conservative schemes matter: a non-conservative scheme can converge to the *wrong* shock speed (Lax–Wendroff).

### P1-8 · `fourier` — bridge sentence for the decoupling step
The jump from "sines are eigenfunctions of Δ" to "the coupled PDE decouples into independent ODEs" skips the linearity premise.
**Fix:** Insert: *"Because the Laplacian is linear — Δ(u+v) = Δu + Δv — applying it to a sum of sines acts mode-by-mode, so each mode evolves by its own ODE."*

### P1-9 · `greens` — convolution notation conflates G(x,x₀) with G(x−x₀)
The main Block writes a bare `∫G f(x₀)dx₀ = (G*f)`, which only holds for a translation-invariant kernel, while the same Block defines the PDE with the general two-point G. (The Predict box and Deeper are already correct.)
**Fix:** Write the Block integral with explicit arguments `∫G(x,x₀)f(x₀)dx₀`, collapsing to `(G*f)` only when noting translation invariance — or use `∫G(x−x₀)f(x₀)dx₀` for the unbounded case.

### P1-10 · `greens` — "turns ∂/∂x into ×ik" needs its one-line why
**Fix:** *"a Fourier/Laplace transform turns ∂/∂x into ×ik (because the derivative of e^{ikx} is ik·e^{ikx})"* — grounds it in the eigenfunction property, reinforcing the card's own "Δ is diagonal in Fourier" spine.

### P1-11 · `greens` — "Boundaries are handled by the method of images" undersells the jump
**Fix:** *"With boundaries, the Green's function gains image sources that enforce the BC; the simple r-formula breaks and G becomes shape-dependent, G(x,x₀). Images close simple geometries (half-spaces, spheres); arbitrary domains fall to boundary-element numerics."*

### P1-12 · `gallery` — "diffusion in IMAGINARY time" is ungrounded jargon
Numericist confirmed the mechanism (i rotates real decay e^{−k²t} into unitary e^{−ik²t}). Make the Misconception `right` mechanistic and demote Wick rotation to the `because`/Deeper (where it already lives, lines 2644/2649): *"The factor i flips the sign inside the exponent: heat's real, decaying e^{−k²t} becomes the pure rotation e^{−ik²t}. Same Δ, same single time-derivative — but i exchanges dissipation for oscillation, so probability is conserved and it rings instead of smoothing."*

### P1-13 · `burgers` — vanishing-viscosity Misconception muddles the order
All claims verified (s=(u_L+u_R)/2, entropy u_L>u_R). Tighten so temporal order (nature → limit) and selection logic read in one breath, and do NOT over-correct to "discontinuities are a fiction": *"Nature solves the viscous problem; the sharp shock is what that viscous front becomes as ν→0. Among the many discontinuous weak solutions, viscosity selects the single admissible one obeying the entropy condition u_L>u_R, with speed s=(u_L+u_R)/2."*

### P1-14 · `navierstokes` — "inverse-cascades" jargon + Poisson-solve jump
(a) Replace "inverse-cascades energy to large scales" with the mechanism (verified): *"energy runs backward through wavenumbers (toward small k / larger vortices) while enstrophy cascades forward to small scales with a steeper k⁻³ slope; the reversal happens because 2D lacks 3D vortex-stretching, so energy can't shred down to dissipation."* Keep the existing correct enstrophy↔k⁻³ pairing. (b) Bridge the streamfunction Poisson solve: *"Working with vorticity lets pressure vanish; ∇·u=0 is satisfied automatically by u=(ψ_y,−ψ_x), giving ω=−Δψ, so ψ̂=ω̂/|k|² inverts that one elliptic relation each step"* (matches code line 2781).

### P1-15 · `turing` — CFL phrasing makes one bound look like two
Numbers correct (4·Du·dt/dx² = 0.64). But `4 D dt/dx² < 1` and `r ≤ ¼` are the *same* bound (4r ≤ 1 ⇔ r ≤ ¼), not loose vs strict.
**Fix (line 3110 + ReadEq area):** *"the 5-point stencil is stable when r = D dt/dx² ≤ ¼, i.e. 4 D dt/dx² ≤ 1; here 4(0.16)(1)/1 = 0.64 < 1."* Do not call ¼ "more conservative."

### P1-16 · `stencils` — link artificial diffusion to stability
**Fix:** After "a forward difference keeps an O(Δx) term that acts like artificial diffusion," add: *"this diffusive smoothing is why forward/upwind differences are more stable than centered ones even though less accurate — stability and accuracy are distinct properties."*

### P1-17 · `cfl` — show the Δt-quartering step
**Fix:** *"Refine to Δx=0.05: Δt ≤ ½·(0.05)²/1 = ½·0.0025 = 0.00125 — ¼ of the original 0.005, a 4× tightening; same physical time needs 4× more steps."* (All numbers verified.)

### P1-18 · `neuralpde` — FNO definition understates channel-mixing
The glossary "multiply each low mode by a learned weight" is a defensible scalar simplification, but the code's R_θ (line 3180) mixes channels.
**Fix:** *"apply a learned spectral convolution (per-mode weights mixing channels), then transform back — a trainable generalization of diagonalizing the Laplacian."* Do NOT call the spectral step "nonlinear" (the C7 reviewer's wording) — the spectral multiply is linear; the nonlinearity is σ and the skip W·v.

### P1-19 · `neuralpde` — Predict per-mode multipliers strip D and c
**Fix (low priority):** Write `e^{−Dk²t}` (heat) and `cos(ckt)` (wave), and note "sum back" = inverse Fourier transform reconstructing u(x,t). Honest D=c=1 simplification, not an error.

### P1-20 · `whatis` — Misconception should make "BOTH IC and BC" explicit
No factual error (verified), but a reader skimming only the Misconception card could misread "ALSO … not just" as "BC instead of IC."
**Fix:** Put the requirement inside the Misconception `right` field rather than relying on the Deeper block: *"…requiring TWO kinds of data — an initial condition at t=0 AND boundary conditions on the spatial edges for all t≥0. (Pure-equilibrium Laplace needs only BCs.)"*

---

## P2 — ENHANCEMENTS (ordered by value/effort)

### P2-1 · **BOLD — "One mode, three fates" unified panel** (global critic's highest-leverage idea; echoes C1 bigthree)
The spine's central claim ("same operator, three couplings to time; Fourier makes them one family of per-mode ODEs") is asserted across bigthree/fourier/drum/neuralpde but never shown in one picture. **Add a panel** (in bigthree, or as the climax of fourier) showing a single sin(kx) and three synchronized traces of âₖ(t): heat e^{−k²t} decaying, wave cos(kt) oscillating, Laplace flat at 0. A k-slider makes "high pitch dies fastest" (heat) and "higher pitch rings faster" (wave) visceral in ONE view. Highest value/effort ratio in the whole list — welds the two anchor cards into the single insight.

### P2-2 · GLOBAL — fix dead-ending external cross-links
External CrossLinks are bare anchors with no host page on a standalone deploy: `#odes`, `#quantum-mechanics`, `#control-theory`, `#linear-algebra` (lines 3252–3255) and the `to="control-theory"`/`to="linear-algebra"` links (lines 2259, 2989). The siblings exist as repo directories but the bare `#anchor` form dead-ends a single-file deploy, breaking the "trail never dead-ends" promise.
**Fix:** Gate them behind a prop that renders plain text when no sibling host is present, OR point at real URLs, OR style as visible "coming soon."

### P2-3 · GLOBAL — add a D-convention signpost (heatkernel demo self-contradiction)
The same heatkernel demo shows `theoryStd = √n` ("√(2Dt) = √n," D=½, line 1611) and `widthMark = √(2·tk)` ("√2Dt," D=1, line 1633) with no flag — looks contradictory.
**Fix:** Add one line where D first carries a value: *"we take D=1 in the sims unless noted; the random-walk picture uses D=½ so 2Dt=n."*

### P2-4 · GLOBAL — weld `greens` to the Fourier spine
greens' headline "two superpowers of linearity" never says the spine word.
**Fix:** Add one sentence: *"Ĝ = 1/|k|² is just the reciprocal of Δ's eigenvalue −|k|² — the Green's function is what 'invert the diagonal operator' looks like back in space."*

### P2-5 · `cfl` — animate the checkerboard mode with its growth factor (C5, high-value)
Add a small animation of the spatial checkerboard (alternating ±1) growing/shrinking as the r-slider crosses ¼, with a `g(π)` multiplier label. Or a text box: *"At r=0.51 the checkerboard grows |g(π)|=1.04× per step — doubling in ~18 steps."* (Numericist: doubling time = ln2/ln1.04 = 17.7, so "~18" is exact; "~17" acceptable.)

### P2-6 · `fem` — Fourier-coefficient-spectrum subplot (smooth vs corner)
Show a smooth bump (coeffs decay faster than any power — straight line on **log-Y/semilog**) vs a kink (∝k⁻², straight line on **log-LOG**). Implementation note: the two reference axes differ, so label each subplot's axes — don't share one scale.

### P2-7 · `classify` — add a Predict before DiscriminantDial
*"If you flip the sign of one of A, B, C, does the type always change? What if you flip two?"* Make the answer surface the two surprising invariances the numericist flagged: **flipping B alone never changes type** (only B² enters), and **flipping A and C together leaves −AC unchanged** (type unchanged).

### P2-8 · `gallery` — Black–Scholes gauge-exponent Deeper note
Numericist verified α,β are load-bearing (zeroing α breaks the reduction). Add: *"e^{αx} and e^{βτ} are a gauge transformation: α kills the drift term rSV_S, β kills the −rV discount term; strip both and only diffusion u_τ=u_xx survives."*

### P2-9 · `heatkernel` — multi-time spike overlay with √t vs linear reference
Show the same spike at t=0.02/0.1/0.5/2 with ±1σ/±2σ markers; put the √t and linear references on a **width-vs-t** plot (not the field plot) so parabola-vs-line is the visual payload. Annotate "width ×10 needs time ×100." Reuses the existing t-slider/widthMark.

### P2-10 · `fourier` — color equalizer bars by per-mode rate/phase
The bars already shrink/oscillate over live `amps`; the new part is shading heat bars cyan→black by k² (decay rate) and wave bars by oscillation phase, turning "high pitch dies first" into a visual fact.

### P2-11 · `greens` — promote the inverse-operator insight
Elevate "G = L⁻¹ acting on δ" from the Misconception sub-box into MinSchema/main prose. Caveat: phrase so it doesn't over-claim convolution universally (u=G*f needs translation invariance; on bounded domains it's ∫G(x,x₀)f(x₀)dx₀).

### P2-12 · `bigthree` — reframe Misconception as affirmative insight
"Heat/wave/Laplace are three unrelated equations" presumes a misconception a first-time reader doesn't yet hold. Reframe: *"Why is it clever that these three are one operator? Because Δ sin(kx) = −k² sin(kx), so in mode space all three reduce to the same scalar ODE per mode — only the time coupling changes."*

### P2-13 · `laplacian` — explain WHY the checkerboard breaks first
Add: *"The checkerboard alternates ±1, so all four neighbors have the opposite sign — the four-neighbor average flips sign, maximizing 2−cos p−cos q = 4 and making this pattern easiest to amplify."*

### P2-14 · `laplacian` — sharpen the "straight ramp" example + LaplacianProbe overlay
(a) Append "(it's a straight line — zero curvature; diffusion sees curvature, not tilt)." Note: the reviewer's framing "u=x is the only linear ramp" is itself too narrow — *every* affine function is harmonic; just append the parenthetical, don't adopt the reviewer's narrowing. (b) Optionally overlay a neighbor-average guide line in LaplacianProbe/CurvatureStrip to make "pulled toward the average" visceral.

### P2-15 · `characteristics` — label the shock-birth geometry in CharacteristicsDemo
Annotate the first characteristic intersection ("steepest slope meets → shock born") and label the merging families "u_L (faster, behind)" / "u_R (slower, ahead)" with "characteristics run INTO the shock ⇒ entropy-admissible." Scope down the C6 reviewer's admissible/inadmissible *toggle*: the demo's Gaussian-hump data only ever forms admissible (u_L>u_R) shocks, so there is no inadmissible case on-screen to contrast — reserve that for a Deeper aside.

### P2-16 · `wave` — Courant slider; energy-vs-heat contrast; Huygens to Deeper
(a) Add a Courant slider (currently fixed C=0.5) so learners cross the verified C=1 boundary — at C=1 leapfrog is *exact* (machine epsilon), above it detonates. (b) Add the energy contrast E=½∫(u_t²+c²u_x²) conserved (wave) vs heat's monotone dissipation — the parabolic/hyperbolic divide. (c) Add a ReadEq grounding the d'Alembert ½ factor (zero initial velocity ⇒ equal-amplitude movers that must reconstruct the initial shape ⇒ each is ½). (d) Move the 2D/3D Huygens line to Deeper with one sentence of context; numericist caveat: strong Huygens is rigorously odd-n≥3 (a 1D *velocity* IC leaves a constant tail), so for this card frame it as "sharp wavefront, no spreading wake."

### P2-17 · `navierstokes` — live Reynolds readout
Compute U from the field's own rms speed (uR/vR), L≈2π (domain), so Re ≈ U·2π/ν updates with the slider. Label "Re (order of magnitude)" since a 64² toy can't resolve a true inertial range. Caption: "Low Re: smooth, few scales. High Re: chaotic, many scales."

### P2-18 · `stencils` — slope annotations on the convergence plot
Verified slopes: central=2, forward=1. Add a callout "central (cyan) = 2 → error ∝ Δx²; forward (amber) = 1 → error ∝ Δx," teaching readers to read log-log plots as power laws.

### P2-19 · `fem` — narrow the "corner / shock" checkbox label
Minor consistency tweak (the only surviving piece of the refuted fem finding): the checkbox says "corner / shock" but the coded rate N⁻¹·⁵ is the **kink** (corner) rate; a true shock would be N⁻⁰·⁵. Either relabel to "corner / kink" so the N⁻¹·⁵ is unambiguous, or switch to N⁻⁰·⁵ to actually depict a shock. The math as coded is right for a corner.

### P2-20 · `whatis` — pacing: trim card-1 boxes
Card 1 front-loads its hardest content (infinite-dimensional function space, Hadamard well-posedness, ill-posed backward heat, verifying a field obeys the heat equation — which isn't defined until bigthree). Defer the function-space/BC nuance to a forward reference; move linearity/superposition to fourier and well-posedness to heat (both re-stated there anyway). The Worked "verify it obeys the heat equation" lands better after bigthree introduces uₜ=Δu.

### P2-21 · GLOBAL — define "reversible" once
classify's CHAR_COLS labels hyperbolic "reversible," parabolic "irreversible," but "reversible" is never defined. Add a half-sentence in the wave card or classify table: *"reversible = the equation is unchanged under t→−t (run a recorded wave backward and it's still a valid solution); heat's t→−t flips Δu's sign and breaks well-posedness."*

### P2-22 · GLOBAL (low) — amber-vs-orange color convention
Amber = time, orange = heat, but several prose spans (e.g. bigthree "first time-derivative" in orange) blur them. Add one line to the color key distinguishing amber = time variable/axis from orange = the heat equation/fate, or reserve a single hue for heat.

### P2-23 · `drum` — three small clarity additions (low)
(a) Isospectral: add "you can SEE these two shapes aren't congruent, yet they share every frequency — the spectrum fixes area/perimeter/holes (Weyl) but leaves geometric freedom." (b) Chladni: caption the visualization "White lines: nodal set (u=0), no motion; colors: eigenfunction amplitude." (c) Tie degeneracy to the spine: "diagonalizing Δ is exactly splitting modes by eigenvalue — the same per-mode decoupling the heat/wave cards use." (All eigenvalue numbers — 50=1²+7²=5²+5², √50≈7.07, family 50/65/85, Weyl (Area/4π)Λ — verified correct.)

### P2-24 · **BOLD — Trails decision-tree flowchart**
Turn the prose-only "Which lens, in 30 seconds" (3 parallel decision paths) into a small clickable branching diagram: "What PDE? → classify → choose lens → recipe." Pushes the interface design; makes the crown-jewel summary scannable.