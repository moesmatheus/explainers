# PDE explainer — verified numerics (adversarial Node checks)

## C1-spine · greenlit=true · confidence=high

**Node results:** All schemes integrated in Node (v24.13). HEAT FTCS (N=120, high-freq+checkerboard seed, 20k steps): r=0.40 -> decays to 2.7e-14 (stable); r=0.49 stable; r=0.50 marginal (final max 3.6e-4, stays bounded); r=0.5001 marginal-bounded (1.07); r=0.51 BLOWS UP at step 383 (1.0e6); r=0.55 blows at step 82. Threshold r<=1/2 CONFIRMED exactly. WAVE leapfrog/CTCS (N=120, zero-velocity u^{-1}=u^0 seed, 20k steps): C=0.70 stable (0.53), C=0.99 stable, C=1.00 marginal bounded forever (0.71), C=1.0001 BLOWS UP at step 1564, C=1.01 blows at step 57. Courant C<=1 CONFIRMED exactly. 2D explicit relaxation u+=alpha*(uE+uW+uN+uS-4u) (48x48, checkerboard seed): alpha=0.20/0.24/0.25 bounded; alpha=0.25 marginal (stays at 1.498, neither grows nor converges = persistent checkerboard mode); alpha=0.26 BLOWS UP at step ~189-250; alpha=0.30 blows at step 43-56. Threshold alpha<=1/4 CONFIRMED. von Neumann algebra checked: 2D g=1-8alpha at p=q=pi gives g=-1 at alpha=0.25 (marginal), -1.08 at 0.26; 1D g=1-4alpha gives -1 at alpha=0.5; heat g=1-4r gives -1 at r=0.5, -1.04 at r=0.51. HARMONIC CONVERGENCE: 1D relax (a=2,b=4) converged in 8950 steps to straight line, maxErr 1.3e-5, u[mid]=3.008 (=expected); 2D relax to harmonic u=x converged 1426 steps, maxErr 4.6e-5. D'ALEMBERT 1/2 SPLIT (N=400, C=0.7): bump splits into two travelers each h=0.4999 (=0.5), at correct positions x=N/2 +/- ct. CONFIRMED. WORKED EXAMPLES: laplacian Delta u=2+4-20=-14, neighbor avg=3, relax step 10+0.2*(-14)=7.2 all exact; e^{-pi^2}=5.172e-5 (matches "~0.000052"). WHATIS SURFACE: each cosine mode satisfies u_t=nu*u_xx exactly (valid heat soln); t=0 value range [-0.768,1.147] fits clamp [-1.2,1.2]; decay factors at t=0.06,nu=0.12: k1=0.931,k2=0.753,k3=0.528,k4=0.321 (high/low amplitude ratio 0.20->0.069, ~3x wrinkle suppression = visible smoothing). PER-FRAME COST: Laplacian 48x48 x2steps=0.018ms; heat 1D N=120 x6=0.003ms; wave 1D N=120 x4=0.002ms — all far under 16ms/60fps budget. No Gray-Scott/Turing card present in this cluster (it is in a later cluster); nothing to integrate here.

- **laplacian**: // 2D explicit Jacobi relaxation (5-point), unnormalized form matching headline:
// u_new[i][j] = u[i][j] + alpha*(uE+uW+uN+uS - 4*u[i][j])
const ALPHA = 0.20;          // safely below 2D ceiling 1/4; converges to harmonic
const ALPHA_2D_STABILITY_MAX = 0.25;   // marginal (checkerboard mode persists, |g|=1); >0.25 diverges
const ALPHA_1D_STABILITY_MAX = 0.50;
const GRID = 48;             // 48x48
const STEPS_PER_FRAME = 2;   // ~4600 cell-updates/frame, 0.018 ms
const ALPHA_SLIDER = [0.05, 0.30];     // crosses 0.25 ceiling so user can trigger blowup (erupts at >=0.26)
const BC = 'Dirichlet';      // edge cells pinned at seeded values -> nontrivial harmonic equilibrium
// 1D inset curvature sign: sign(u[i+1]+u[i-1]-2*u[i])
- **bigthree**: // HEAT — FTCS: u_i^{n+1} = u_i^n + r*(u_{i+1}-2u_i+u_{i-1})
const HEAT_R = 0.40;         // r = nu*dt/dx^2; stable iff r<=1/2 (0.50 marginal, 0.51 blows at step 383)
const HEAT_STEPS_PER_FRAME = 6;
// WAVE — leapfrog/CTCS: u_i^{n+1} = 2u_i^n - u_i^{n-1} + C^2*(u_{i+1}-2u_i+u_{i-1})
const WAVE_C = 0.70;         // C = c*dt/dx; stable iff C<=1 (1.00 marginal, 1.0001 blows)
const WAVE_STEPS_PER_FRAME = 4;
// first step seed for zero initial velocity (clean symmetric d'Alembert split):
// u_i^1 = u_i^0 + 0.5*C^2*(u_{i+1}^0 - 2u_i^0 + u_{i-1}^0)   [equivalently u^{-1}=u^0]
// LAPLACE — Jacobi: u += 0.20*(uE+uW+uN+uS-4u) toward residual max|Delta u| < 1e-4
const LAPLACE_ALPHA = 0.20;
const LAPLACE_SWEEPS_PER_FRAME = 3;
const N_1D = 120;           // 48x48 in 2D toggle
const BC = 'Dirichlet pinned ends';
// 'push it unstable' button: allow r>0.5 / C>1 to show checkerboard eruption
- **whatis**: // PRECOMPUTED (not live-stepped) exact heat solution, 64(x) x 64(t) grid:
// u(x,t) = SUM_{k=1..4} a_k * exp(-(k*pi)^2 * nu * t) * cos(k*pi*x + phi_k)
const NU = 0.12;
const A   = [1, 0.5, 0.35, 0.2];
const PHI = [0, 1.1, 2.3, 0.7];
const X_RANGE = [0, 1];
const T_RANGE = [0, 0.06];
const COLOR_CLAMP = [-1.2, 1.2];   // actual t=0 range is [-0.77, 1.15] -> fits
// satisfies u_t = nu*u_xx exactly. Slice slopes u_t,u_x via central difference on the grid.
// ODE-mode dot: y(t)=u(x0,t) by table lookup (no solver).

**Corrections:**
- [whatis] predictReveal prompt says "The rod starts as a smooth single bump" and answer (b) is "spreads and flattens," but the actual seeded surface u(x,0)=Sum a_k cos(k*pi*x+phi_k) with the given a/phi is a multi-mode wiggle (numerically: 2 interior maxima + 2 interior minima over x in [0,1], values ranging -0.77 to +1.15), NOT a single bump. The diffusive smoothing IS real and visible (high/low mode amplitude ratio drops 0.20->0.069, ~3x wrinkle suppression over t in [0,0.06]), so the (b) answer's physics is correct — only the word "single bump" is wrong. → Either (a) reword the prompt to "a wrinkly profile (a few bumps and dips)" and the answer to "the wrinkles spread and smooth out, the profile flattens" (matches the actual 4-mode surface), OR (b) change the precomputed surface seed to a genuine single Gaussian bump if you want the literal "single bump" framing. Option (a) is cheaper and keeps the heat-solution exactness. Note also cos modes have Neumann (zero-slope) ends, while laplacian/bigthree use Dirichlet pinned ends — harmless for whatis but worth a consistent caption ("profile of a rod" not "pinned rod").
- [laplacian] Minor wording: design says at alpha=0.26 it "diverges within ~400 steps" and "alpha=0.25 marginally stable." Numerically alpha=0.26 diverges by step ~189-250 (well within 400, so claim holds) and alpha=0.25 is marginal in the strict sense that the checkerboard mode neither grows nor decays (|g|=1) — so a field seeded with that mode will NOT converge to flat at exactly 0.25, it stalls. The card text "alpha=0.25 it is marginally stable" is correct; just ensure the demo default stays at 0.20 (which converges) so the "relax to harmonic" payoff actually completes. → No numeric change needed. Keep default alpha=0.20. If you want the slider to visibly converge at its quoted upper-safe value, cap the convergence demo at alpha<=0.24; reserve 0.25-0.30 strictly for the 'watch it stall/erupt' demonstration.

## C2-parabolic · greenlit=true · confidence=high

**Node results:** classify: discriminant B^2-AC with convention A u_xx+2B u_xy+C u_yy — Heat (A=1,B=0,C=0)=0 parabolic; Wave (A=1,B=0,C=-1)=+1 hyperbolic; Laplace (A=1,B=0,C=1)=-1 elliptic. All correct. Conic dial parametrization A=1,C=-s,B=0 gives disc=s exactly for s in {-1,-0.5,0,0.5,1}, so the dragged dial value literally equals the discriminant — and s<0 yields an ellipse (A,C>0), s>0 a hyperbola (C<0), s=0 degenerate. Self-consistent.

heatkernel: kernel K=exp(-x^2/4Dt)/sqrt(4 pi D t) numerically integrates to mass=1.000000 for (D,t)=(1,0.5),(1,2),(0.2,1),(0.5,1); variance matches 2Dt exactly (e.g. D=1,t=2 -> var=4.00000, std=2.00000; D=0.2,t=1 -> var=0.40000, std=0.63246). Random walk: ±1 step var=1, after n steps Monte-Carlo var = 101.7/405.1/595.7 for n=100/400/600 (predict n), and D=step^2/(2dt)=0.5 gives 2Dt=n so kernel std sqrt(2Dt)=sqrt(n) coincides with walk std. Predict-reveal: 1cm@10s -> 2cm@40s confirmed (sqrt(t): 4x time). 'half time -> 1/sqrt2 width' = 0.70711 confirmed. Conv grid dx=0.0471 at tmin=0.02 gives sigma=0.20 = 4.25 grid pts, well resolved.

heat: r=D*dt/dx^2=0.2 with D=0.2,dt=1,dx=1. True 2D FTCS bound is r<=1/4 (von Neumann worst-case g=1-8r): swept r -> r=0.20/0.24/0.25 stay bounded (|max|~0.1 after 300 steps), r=0.26 blows to 1.0e8, r=0.30/0.50 -> Infinity. So r=0.2 is safely stable. Forward run on 96x96, 2000 steps: interior max / initial max never exceeded 0.9934 (<=1, maximum principle holds), field decays to 6.7e-2. Backward (sign=-1) with 0.02 checkerboard seed: per-step growth of grid-Nyquist mode g=1+8r=2.6, |max| exceeds 4 by step 5 (theory ~6) and -> Infinity by step 200 — backward heat blows up exactly as intended. Cost: 4 steps/frame x 9216 cells = 36864 updates/frame, trivial for rAF.

- **classify**: Convention A u_xx + 2B u_xy + C u_yy. Heat: A=1,B=0,C=0 -> disc 0 (parabolic). Wave (u_xx - u_tt): A=1,B=0,C=-1 -> disc +1 (hyperbolic). Laplace: A=1,B=0,C=1 -> disc -1 (elliptic). Conic inset: render A x^2+2B xy+C y^2=1 with A=1, B=0, C=-s, dial s in [-1,1] => B^2-AC=s. ellipse s<0, parabola |s|<0.04, hyperbola s>0.
- **heat**: const N=96, dx=1, D=0.2, dt=1; const r = D*dt/dx*dx; // = 0.2, satisfies 2D bound r<=1/4. STEPS_PER_FRAME=4. 5-point stencil: lap = u[i+1][j]+u[i-1][j]+u[i][j+1]+u[i][j-1]-4*u[i][j]; u_next = u + sign*r*lap (sign=+1 forward, -1 backward). Dirichlet: rows/cols 0 and 95 pinned to 0. IC: u0 = exp(-(((x-40)^2)+((y-48)^2))/120), amp 1. Backward blows up ~step 5-6; clamp display to [-4,4]. Noise eps in [0,0.05] checkerboard.
- **heatkernel**: Kernel: K(x,t)=exp(-x*x/(4*D*t))/Math.sqrt(4*Math.PI*D*t). Normalization integral = 1; variance = 2*D*t; std = Math.sqrt(2*D*t). Random walk: M=4000 walkers, 201 sites, ±1 steps, S=2 steps/frame, cap n=600. Walk var(n)=n; with step=1,dt=1 -> D=step^2/(2*dt)=0.5 so 2Dt=n, std=sqrt(n)=sqrt(2Dt). Conv demo: 256 samples on x in [-6,6] (dx=0.0471), D=1, t in [0.02,2], renormalize sum(K)*dx=1.

**Corrections:**
- [heat] Deeper/scheme text states the stability margin as 'total per-axis update 4r = 0.8 < 1 (stable, comfortably inside the 2D bound r <= 1/4)'. The '4r < 1' phrasing is a loose/misleading framing: the operative 2D FTCS bound is r <= 1/4 (equivalently 8r <= 2), not 4r < 1. It happens not to change the verdict (r=0.2 passes), but stating the bound as '4r<1' could mislead a reader into thinking r up to ~0.25-0.5 is fine in 2D. → Drop the '4r=0.8<1' clause and state only the correct bound: r = D*dt/dx^2 = 0.2 <= 1/4 (the 2D FTCS stability limit; the 1D limit r<=1/2 is looser and does NOT apply here). Optionally note von Neumann worst-case amplification g=1-8r=-0.6, |g|<=1. Numerically verified: r=0.25 bounded, r=0.26 diverges.

## C3-hyperbolic · greenlit=false · confidence=high

**Node results:** WAVE (leapfrog u_tt=c^2 u_xx, N=257, dx=1/256=0.003906):
- lambda=0.5, c=0.5: dt=3.906e-3, 51 steps to t=0.199; maxAbs=0.997 (bounded); max|leapfrog - dAlembert| = 7.81e-3 (naive u_old=u start). With proper Taylor first step: 1.16e-3.
- Half-amplitude split: right-mover peak height = 0.4993 (expect 0.5). CONFIRMED.
- CFL blowup sweep (300 steps, fixed BC): lambda=0.5->0.997, 0.9->1.001, 1.0->1.000 (all STABLE); lambda=1.01->7.7e18, 1.05->1.1e65, 1.2->6.2e144 (BLOWUP). Threshold lambda<=1 confirmed; just-over (1.01) explodes.
- "Magic" lambda=1 exactness: with the card's u_old=u start, err vs dAlembert = 1.68e-2 (NOT exact). With correct from-rest first step u1[i]=u[i]+0.5*lambda^2*(u[i+1]-2u[i]+u[i-1]) (=0.5(f0[i+1]+f0[i-1]) at lambda=1): err = 6.0e-16 (machine-exact). So the deeper-block 'EXACT at lambda=1' claim holds ONLY with the corrected startup.
- Reflection signs (run to reflection): Fixed BC (u[0]=0) -> returning pulse min=-0.500 (INVERTED). Free BC (u[0]=u[1]) -> max=0.500, stays UPRIGHT. CONFIRMED.

CHARACTERISTICS (N=200, dx=1/199=0.00503 — matches card):
- Linear upwind, c=1, nu=0.8: dt=4.02e-3, 50 steps to t=0.201; maxAbs=0.996 (bounded, monotone); peak landed at x=0.503 vs exact shift 0.501; max|upwind-exact|=0.072 (expected numerical-diffusion smearing, fine for a 'ghost overlay matches' demo).
- Upwind CFL sweep (400 steps): nu=0.8->0.997, 1.0->0.997 (STABLE); 1.05->3.76 (growing); 1.2->2.2e42 (BLOWUP). 0<nu<=1 confirmed.
- Naive CENTERED explicit advection nu=0.8 -> 4.0e26 (UNSTABLE) — confirms the deeper-block 'centered is unconditionally unstable, must upwind' claim.
- Burgers Godunov (flux u^2/2, CFL=0.8, dt=CFL*dx/max|u| each step): worked-example u0=1+0.5*exp(-((x-0.4)/0.08)^2): grid min(u0')=-5.346 at x=0.457; ANALYTIC min(u0')=-5.361, t*=-1/min(u0')=0.1865. Card's stated min~-4.6 and t*~0.22 are WRONG.
- Burgers boundedness: 2000 steps -> maxAbs=1.4994 (stays <= max(u0)=1.5, bounded). R-H shock speed uL=1.5,uR=1: s=(uL+uR)/2=1.25.
- step-down(1->0): maxAbs=1.000, shock s=0.5; ramp-up(0->1): maxAbs=1.000, rarefaction. Both bounded, entropy-correct.

COST: wave sim sub=4 x 257 cells ~1k flops/frame + 257-px raster row; characteristics sub=3 x 200 cells. Both trivially interactive at 60fps.

- **wave**: // Leapfrog u_tt = c^2 u_xx, VERIFIED
const N = 257;            // dx = 1/(N-1) = 0.0039063
const dx = 1/(N-1);
let c = 0.5;              // slider [0.2, 1.0]
const LAMBDA = 0.5;       // Courant c*dt/dx, pinned (CFL bound <= 1; blows up at 1.01)
const dt = LAMBDA*dx/c;   // = 0.5*dx/c
const SUB = 4;            // leapfrog steps per frame
// from-rest FIRST step (use this, NOT u_old=u):
// u1[i] = u0[i] + 0.5*LAMBDA*LAMBDA*(u0[i+1]-2*u0[i]+u0[i-1])
// thereafter: u_new[i] = 2*u[i] - u_old[i] + LAMBDA*LAMBDA*(u[i+1]-2*u[i]+u[i-1])
// Fixed BC: u[0]=u[N-1]=0 (reflects INVERTED). Free BC: u[0]=u[1], u[N-1]=u[N-2] (reflects UPRIGHT)
// exact overlay: u=0.5*(f(x-c*t)+f(x+c*t)), t = stepCount*dt
- **characteristics**: // VERIFIED
const N = 200;            // dx = 1/(N-1) = 0.0050251
const dx = 1/(N-1);
// LINEAR upwind (c>0): u_new[i] = u[i] - NU*(u[i]-u[i-1])
let c = 1.0;              // slider [0.2, 1.5]
const NU = 0.8;           // Courant c*dt/dx, pinned (0<NU<=1; blows up by NU=1.2)
const dt_lin = NU*dx/c;
const SUB = 3;
// BURGERS Godunov, f(u)=u^2/2, CFL=0.8, dt = 0.8*dx/max|u| recomputed each step
// Godunov flux: if uL<=uR: (uL<=0<=uR? 0 : min(f(uL),f(uR)));  else max(f(uL),f(uR))
// u_new[i] = u[i] - (dt/dx)*(F[i+1]-F[i])
// shock time t* = -1/min_x(u0'); R-H shock speed s=(uL+uR)/2

**Corrections:**
- [wave] The stated zero-initial-velocity startup 'u_old = u (equivalently u[i] at t=-dt equals u[i] at t=+dt by symmetry)' is only FIRST-ORDER accurate. With this start, max|leapfrog - dAlembert| = 1.68e-2 at lambda=1 and 7.8e-3 at lambda=0.5, and it FALSIFIES the deeper-block claim that lambda=1 is 'non-dissipative and EXACT'. → Use the correct second-order from-rest first step: u1[i] = u0[i] + 0.5*lambda^2*(u0[i+1] - 2*u0[i] + u0[i-1]) (this is the Taylor/half-step that bakes in u_t(x,0)=0). At lambda=1 it makes the scheme machine-exact (err 6e-16), and at lambda=0.5 it tightens the d'Alembert overlay agreement to 1.2e-3. Keep using lambda=0.5 for the default visual (mild dispersion is fine), but the startup must be the half-step, not u_old=u.
- [wave] Deeper-block states lambda=1 leapfrog is 'EXACT for this 1D constant-c problem (the magic time step)'. This is only true with the correct first step AND when c*dt is an integer multiple of dx; with the card's u_old=u start it is NOT exact (err 1.7e-2). → Either (a) adopt the corrected Taylor first step above so the claim becomes literally true, or (b) soften the wording to 'non-dissipative (no amplitude decay); with a proper from-rest start it is exact at lambda=1'. Recommend (a).
- [characteristics] Worked example claims 'min(u0') ~ -4.6, so the shock forms at t* = -1/min(u0') ~ 0.22' for u0 = 1 + 0.5*exp(-((x-0.4)/0.08)^2). Both numbers are wrong. → For A=0.5, w=0.08 the exact minimum slope is min(u0') = -(2A/w)*(1/sqrt2)*e^(-1/2) = -5.36, giving t* = 0.187 (grid estimate -5.35, t*=0.187). Replace '-4.6' with '-5.36' and '~0.22' with '~0.187'. (If you specifically want t*~0.22 you must widen the bump to w~0.093.)

## C4-elliptic-analytical · greenlit=true · confidence=high

**Node results:** LAPLACE (relaxation, N=40 interior, top edge=1 other 3=0): Jacobi 2410 sweeps to max-change<1e-6 (claim ~2410 MATCH); Gauss-Seidel 1315 sweeps (claim ~1315 MATCH); GS speedup measured 1.833x (claim ~1.85x, slightly optimistic); center settles to 0.239491 (claim 0.2395 MATCH); interior max 0.9508 < boundary max 1.0 so maximum principle holds; mean-value residual at center 9.97e-7. Continuous-exact center = 0.250000 exactly (4-rotation symmetry; grid converges to it from below, N=60 gives 0.2424). Poisson discrete update u=0.25(nbsum+dx^2 f) correctly solves Delta u = -f. The ACTUAL viz grid is N=60: Jacobi 4739, GS 2617, center 0.2424.
FOURIER: half-range sine coeffs of step/const-1 are b_k=4/(k*pi) odd -> 1.2732, 0.4244, 0.2546 CORRECT. Gibbs partial-sum peak = 1.17898 (limit), i.e. overshoot = 8.949% of the full jump -> '~9% overshoot' CORRECT. Heat decay rate ratio k=20 vs k=1 = 400x CORRECT. Optional explicit FTCS stepper at r=0.4: numerical amp 0.610497 vs exact e^{-pi^2 t}=0.610503, 0.0009% diff -> 'matches to 4 digits' CONFIRMED. FTCS stability razor-sharp: r=0.50 bounded, r=0.501 grows (4e-10), r=0.51 blows up (8e+51), r=0.55 overflows -> threshold r<=1/2 confirmed, chosen r=0.4 SAFE. Wave period 2L/(ck): k=1->2.0, k=2->1.0, k=5->0.4 all MATCH.
GREENS: 2D Newtonian -(1/2pi)ln r and 3D 1/(4pi r) both give Gauss flux -1 over any enclosing surface => Delta G=-delta CORRECT. Heat kernel (4*pi*D*t)^{-n/2} exp(-r^2/4Dt) integrates to 1.000000 in 1D/2D/3D; 2D <r^2>=2.0=4Dt, per-axis variance=1.0=2Dt CORRECT. Transform transfer 1/(k^2+1) for -u''+u=f reproduces exact u to 4.2e-15 max error. Field recompute cost 120x120x30=432k ops, debounced per change (not per frame) -> browser-safe.

- **laplace**: N=60 interior, grid (N+2)x(N+2)=62x62, dx=1/(N+1). Jacobi: u_new[i,j]=0.25*(u[i+1,j]+u[i-1,j]+u[i,j+1]+u[i,j-1]); GS: same but in-place. Dirichlet BC re-imposed each sweep. Poisson source: u_new=0.25*(nbsum + dx*dx*f[i,j]) solving Delta u=-f. tol=1e-6. STEPS_PER_FRAME=20. Reference convergence on N=40: Jacobi 2410 sweeps, GS 1315 sweeps (1.83x), center 0.2395, interior max 0.9508. On the actual N=60 grid: Jacobi 4739, GS 2617, center 0.2424. Continuous exact center = 0.25.
- **fourier**: L=1, P=256 samples, M up to 40 modes. b_k = (2/P)*sum_p u(x_p)*sin(k*pi*x_p/L). Step/const-1 -> b_k=4/(k*pi) odd, 0 even. Heat: a_k(t)=b_k*exp(-D*(k*pi/L)^2*t). Wave: a_k(t)=b_k*cos(c*k*pi/L*t), period 2L/(ck). Laplace: frozen. Frame dt: heat 0.0006, wave 0.004. Optional direct heat stepper: r=D*dt/dx^2=0.4 (STABLE, r<=0.5), matches analytics to 4 digits. Gibbs overshoot = 8.949% of the full jump.
- **greens**: Field grid G=120x120, K<=30 sources. Newtonian2D(r)=-(1/(2*pi))*log(max(r,r0)), r0=1.5*dx. HeatKernel2D(r,t)=(1/(4*pi*D*t))*exp(-r^2/(4*D*t)), D=1. u(x)=sum_m q_m*kernel(|x-x_m|); recompute on add/move/drag (debounced), not per-frame. Symmetric colormap range [-A,A], A=running max|u|. Transform panel: f sampled at 64 pts, DFT to f_hat, multiply each bin by 1/(k^2+1), inverse-transform. All sub-millisecond.

**Corrections:**
- [laplace] The worked example, predict-reveal, and scheme all quote the calibration run on a 40x40 INTERIOR grid (2410/1315 sweeps, center 0.2395), but the actual visualization grid is N=60 (62x62). On N=60 the real numbers are Jacobi ~4739 sweeps, GS ~2617, center ~0.2424 -- so the live iteration counter and badge will show different values than the prose claims. → Either (a) state explicitly that 2410/1315/0.2395 are the N=40 reference figures while the live N=60 plate shows ~4739/~2617/~0.2424, or (b) standardize all prose on N=60. Numerically both are correct; just make the quoted numbers match whichever grid actually renders.
- [laplace] GS-vs-Jacobi speedup is stated as ~1.85x in the visualization 'what' text but measured 1.833x (N=40) / 1.811x (N=60). → Say 'about 1.8x faster' (or '~1.83x'); 1.85x is slightly optimistic and the live sparkline will show ~1.8x.
- [fourier] Deeper block says the partial sum 'peaks at ~1.0895x the half-jump (8.95% overshoot)'. The 1.0895 multiplier is of the FULL jump (peak measured from the far/low side), not the half-jump. Relative to the half-jump (amplitude) the peak is 1.179x. The 8.95%-of-jump and ~9% figures are correct; only the '1.0895x the half-jump' phrasing is off. → Change to 'peaks ~8.95% of the jump above the limiting value (the partial sum reaches ~1.0895x the full jump measured across it)', or drop the 1.0895 multiplier and keep just '~8.95% of the jump'.
- [fourier] Minor UX/animation note (not a math error): wave closed form uses dt=0.004/frame, giving only ~12.5 frames per period for the fastest kept mode k=40 (period 2/40=0.05). The top-3 fastest mode bars will visibly flicker/alias. → Optional: cap the wave animation's effective highest oscillating mode, or note that the analytics are exact (closed form) and only the on-screen sampling is coarse for the top modes. No change to formulas needed.

## C5-numerical · greenlit=true · confidence=high

**Node results:** STENCILS: central 2nd-diff of sin(x) at x0=1 gave err-ratios 3.937/3.984/3.996/3.999/4.000 as h halves over {0.8..0.025} (exact O(dx^2)); forward 1st-diff ratios 2.078/2.062/2.037/2.020/2.010 (O(dx)). Leading-error constant (D2-true)/h^2 -> 0.07012 = sin(1)/12 = u''''/12 (confirms +dx^2/12 u'''' term). 2D 5-point Laplacian N=8 -> 64x64, nonzero offsets exactly {0,+-1,+-8}, symmetric, nnz=288. 1D discrete eigenvalue formula -4/dx^2 sin^2(kdx/2) matches direct (e^{ikdx}-2+e^{-ikdx})/dx^2 to 1e-9; checkerboard kdx=pi -> -4/dx^2 (so g=1-4r).

CFL (risky): heat FTCS g_min=1-4r at checkerboard: r=0.4->-0.60(stable), r=0.5->-1.0000(marginal), r=0.51->-1.04(UNSTABLE), r=0.6->-1.40, r=0.75->-2.0. k-scan confirms worst mode is ALWAYS k=pi once r>0.5. Real 128-pt 2000-step FTCS sim with gaussian+1e-3 checkerboard seed: r=0.4 max|u|=0.14, r=0.5 max|u|=0.13 (bounded), r=0.51 max|u|=1.17e31, r=0.6 max|u|=1.8e289 (blew up). r=0.51 needs 176 steps to grow 1000x (design ~170 OK). Worked example exact: D=1,dx=0.1->dt_max=0.005; dx=0.05->dt_max=0.00125 (4x cut). WAVE leapfrog 128-pt 3000-step sim: C=0.9->0.49, C=1.0->6.5 (bounded), C=1.01->Inf, C=1.1->Inf (blew up); condition |1-2C^2 sin^2|<=1 gives off-circle at C=1.01 (|.|=1.0402). 2D heat g=1-8r -> r<=1/4 (r=0.25 marginal, r=0.26 unstable). Backward Euler g=1/(1+4r)<=1 for all r (unconditionally stable) confirmed.

FEM (conceptual): hat/barycentric partition of unity sum=1 to 1e-12. Convergence-curve INCONSISTENCY found: scheme uses N^(-1.0) (log-log slope = -1.000) but 'what'+'deeper' text say FD/FEM slope ~ -2 (N^{-2}, slope -2.000). N^(-2.0) gives slope -2.000. Corrected teaching constants: errFD=2.0 N^-2, errFEM=0.8 N^-2, errSpec=0.05 exp(-0.30 N), errKink=0.8 N^-1.5 -> spectral below FEM for ALL N in [4,64], spans 8.7 decades, slopes verified -2/-2/-1.5 and spectral local slope steepens (-4.7 near N=16, signature of exponential). Note: there is NO Gray-Scott/heat-kernel/Burgers/drum card in this cluster (C5 = stencils/cfl/fem only), so those briefs do not apply here.

- **stencils**: // Convergence panel (pure arithmetic, recompute on slider only)
const f = Math.sin, x0 = 1.0;
const trueSecond = -Math.sin(x0); // = -0.841471
const trueFirst  =  Math.cos(x0); // =  0.540302
const hList = [0.8,0.4,0.2,0.1,0.05,0.025];
const D2 = (h)=>(f(x0+h)-2*f(x0)+f(x0-h))/(h*h); // err ratio -> 4.00
const D1 = (h)=>(f(x0+h)-f(x0))/h;               // err ratio -> 2.00
// Sparsity: N in {4,8,12}; 2D 5-point Laplacian, n=N*N, idx=(i,j)=>j*N+i
// diag=-4, four neighbors=+1, offsets {0,+-1,+-N}, symmetric, negative-definite
// N=8 => 64x64, nnz=288
- **cfl**: // Heat FTCS (1D, dx=1, periodic), r set directly by slider in [0.1,0.75]
const N = 128;
function step(u, r){ const un=new Float64Array(N);
  for(let i=0;i<N;i++){const im=(i-1+N)%N, ip=(i+1)%N;
    un[i]=u[i]+r*(u[im]-2*u[i]+u[ip]);} return un; }
// init: gaussian bump + tiny checkerboard seed so instability is visible
// u[i]=Math.exp(-((i-N/2)/8)**2) + 1e-3*((i%2)?1:-1)
const STEPS_PER_FRAME = 4;            // ~60fps fine for N=128
const BLOWUP_RESET = 1e6;             // auto-reset when any |u|>1e6
// Growth factor plot (pure arithmetic, ~200 k samples):
const g = (k,r)=>1 - 4*r*Math.sin(k*1/2)**2;   // k in [0, pi]; worst at k=pi
const gMin = (r)=>1-4*r;              // r=0.5 -> -1 (marginal); r=0.51 -> -1.04
const STABLE = (r)=> r<=0.5;
// Wave leapfrog (Courant C set by slider in [0.1,1.2]):
// unext[i]=2*u[i]-uprev[i]+C*C*(u[im]-2*u[i]+u[ip]); stable iff C<=1
// 2D heat (if used): r<=1/4 (g=1-8r). Backward Euler: g=1/(1+4r) unconditionally stable.
- **fem**: // Convergence chart — CORRECTED exponents (FD/FEM second-order => slope -2):
const errFD    = (N)=> 2.0 * Math.pow(N,-2.0);   // slope -2
const errFEM   = (N)=> 0.8 * Math.pow(N,-2.0);   // slope -2 (just below FD)
const errSpec  = (N)=> 0.05 * Math.exp(-0.30*N); // exponential, below FEM for all N in [4,64]
const errKink  = (N)=> 0.8 * Math.pow(N,-1.5);   // spectral degraded to algebraic, slope -1.5
const Nrange = []; for(let N=4;N<=64;N++) Nrange.push(N); // ~40+ pts, log-log polyline
// Static arithmetic, recompute only on smooth/corner toggle. Spans ~8.7 decades; clamp y-axis floor (e.g. 1e-9) if too tall.

**Corrections:**
- [fem] Convergence-curve formula is internally inconsistent. The 'scheme' block defines err_FD(N)=a*N^(-1.0) and err_FEM(N)=b*N^(-1.0) (log-log slope -1, numerically verified), but the 'what' text says 'FD slope ~ -2 (N^{-2})' and the 'deeper' block says 'algebraic error ~ h^2 ~ N^{-p}'. The bracketed note '[slope -2 in error-per-side terms]' does not rescue it: N^(-1.0) plots as slope -1 on log-log under any axis interpretation; the reader will see -1, not the -2 the prose promises. → Change both curves to second order: err_FD(N)=2.0*N^(-2.0), err_FEM(N)=0.8*N^(-2.0). Verified log-log slope = -2.00, matching the headline/deeper text. Keep the kink curve at N^(-1.5).
- [fem] With the originally-implied small/unit spectral constant (c~1 or 2), the spectral curve starts ABOVE the FD/FEM curves for small N and only crosses below around N>=16-24, which reads as 'spectral is worse at low resolution' and muddies the intended 'spectral plunges below everything' message. → Use err_spectral(N)=0.05*Math.exp(-0.30*N). Verified to sit strictly below err_FEM for every N in [4,64] while still showing the dramatic exponential plunge (steepening local slope). Optionally clamp the y-axis floor (~1e-9) since the full range spans ~8.7 decades.
- [cfl] Minor: the 'scheme' note caps the demo with 'auto-reset when any |u_i|>1e6' but also lists a blow-up tint threshold of 1e3. With r=0.6 the field reaches ~1e289 within 2000 steps and r=0.51 reaches ~1e31 — both overflow well before any frame budget concern, but the reset MUST fire on a per-frame max-scan (not per-step) to avoid a frame where values already went non-finite. → In the animation loop, after each batch of STEPS_PER_FRAME, scan max|u|; if >1e6 (or any !isFinite) reseed the gaussian+checkerboard. This is already implied; just ensure the check is every frame, not every N frames. No math change.

## C6-famous-nonlinear · greenlit=false · confidence=high

**Node results:** BURGERS (risky): Verified u0=A*exp(-x^2/2w^2), A=1,w=1 -> numeric min slope = -0.606531 at x=1.000 (= -A/(w*sqrt e), exact). t* = -1/minSlope = 1.648721 = w*sqrt(e)/A (matches card's 1.65). Characteristic first-fold time = 1.648721 (lines cross at t* exactly). EO conservative flux solver on N=200, dx=0.05025, CFL=0.4: stable for nu in {0,0.005,0.01,0.04}, mass conserved at 2.5066 (= A*w*sqrt(2pi)) to 4 decimals in every case, peak/max-slope decrease monotonically with nu (8.7 -> 1.8) = correct shock smoothing. RH speed (uL=1,uR=0) = (uL+uR)/2 = 0.5 = [[f]]/[[u]]. CFL sweep: 0.4/0.9/1.1 stable (decaying hump lowers max|u|), 1.6 shows overshoot artifact (mx=1.95). Parabolic cap: explicit-diffusion limit dt<=0.5*dx^2/nu=0.0316 for nu=0.04; dt=2x cap BLOWS UP at iter 33; card's cap 0.25*dx^2/nu is 2x conservative = safe.

GALLERY Black-Scholes->heat: BS PDE residual for a transformed heat solution = 1.5e-7 (machine/FD precision) ONLY with tau=(sigma^2/2)(T-t). With tau=T-t (as written in headline+predictReveal) residual = 1.5e-1 (NONZERO -> wrong). alpha=-(k-1)/2=-0.0556, beta=-(k+1)^2/4=-1.1142, k=2r/sigma^2=1.111 confirmed correct. Heat morph strip N=128, dx=0.04724, r=0.30: stable, maxAbs stays 3.0 over 240 steps; control r=0.6 blows to 8.2e29 (confirms r<=0.5). Conic discriminant b^2-ac: Laplace=-1(elliptic), heat=0(parabolic), wave=+1(hyperbolic) all correct.

NAVIER-STOKES (risky): 64x64 spectral vorticity solver (FFT Poisson + semi-Lagrangian advect + spectral dissipation) is STABLE and BOUNDED (max|omega| decays 1.00->0.66 over 400 steps, enstrophy decays, all finite). Cost: 0.44 ms/step; one 64x64 FFT2 = 0.068 ms; ~6 FFT2/displayed frame = ~0.4ms + ~0.3ms advect = ~0.7ms/frame -> runs interactively. Spectrum formula E(k)=shell-avg |omega_hat|^2/k^2 is CORRECT (|u_hat|^2 = |omega_hat|^2/k^2 verified). BUT the -5/3 SLOPE CLAIM FAILS: measured slope with proposed nu=1e-3,nuHyper=2e-4 is -7 to -14 (way too steep). Broadband IC + weak dissipation: k=2..8 slope ~ -2.4 to -2.6 (near 2D enstrophy -3, NOT -5/3). Forced (k=3-6) run 600 steps: k=6..14 slope=-9.6, low-k=1..4 slope=+1.8. No regime on a 64-point grid yields a recognizable -5/3 (or clean -3): only ~10 wavenumbers exist between forcing scale and Nyquist, so the dissipation range starts immediately and there is no inertial range to fit.

- **burgers**: // VERIFIED Burgers. Domain x in [-4,6], N=200, dx=10/199=0.050251
const A=1.0, w=1.0;            // hump u0 = A*exp(-x^2/(2w^2))
const tStar = w*Math.sqrt(Math.E)/A;  // = 1.648721  (display this; char marker lands here)
const minSlope = -A/(w*Math.sqrt(Math.E)); // = -0.606531 at x = w = 1
// Engquist-Osher flux on f=u^2/2 (entropy-correct shock speed):
const fp = u => { const m=Math.max(u,0); return 0.5*m*m; };
const fm = u => { const m=Math.min(u,0); return 0.5*m*m; };
// F_{i+1/2} = fp(u_i) + fm(u_{i+1}); update u_i += dt*( -(F_{i+1/2}-F_{i-1/2})/dx + nu*(lap)/dx^2 )
const CFL = 0.4;              // dt = CFL*dx/max|u|  (stable; tested to CFL~1.0)
// parabolic cap when nu>0: dt = min(dt, 0.25*dx*dx/nu)   // 2x safety vs 0.5 limit; REQUIRED, blowup confirmed if violated
// nu slider 0 -> 0.04. RH shock speed s=(uL+uR)/2. mass A*w*sqrt(2pi)=2.5066 conserved.
// 3-4 steps/frame, Neumann (copy-end) BCs since hump ~0 at boundaries.
- **gallery**: // VERIFIED Black-Scholes -> heat. REQUIRES the sigma^2/2 time rescale:
const k     = 2*r/(sigma*sigma);
const alpha = -(k-1)/2;        // e.g. r=0.05,sigma=0.3 -> -0.0556
const beta  = -((k+1)*(k+1))/4; //                        -> -1.1142
const tau   = (sigma*sigma/2)*(T - t);  // <-- NOT just (T-t); this is mandatory
// V = exp(alpha*x + beta*tau) * u(x,tau), x = ln S  =>  u_tau = u_xx  (residual 1.5e-7)
// Heat morph strip: N=128, x in [-3,3], dx=6/127=0.047244, r=0.30 (<=0.5 stable)
// u_i += r*(u_{i+1}-2u_i+u_{i-1}); 2 steps/frame, ~120 frames; ping-pong Float32Array.
// Diverging colormap: normalize u to [-1,1] before mapping (ramp spans [0,~3], so rescale).
- **navierstokes**: // VERIFIED-STABLE-AND-CHEAP (but DROP the -5/3 fit). 64x64 periodic, domain 2pi, h=2pi/64.
const dt = 0.02;
const nu = 1e-3;               // slider 2e-4 .. 4e-3
const nuHyper = 2e-4;         // k^4 hyperviscosity, keeps grid clean
// Per step: (1) FFT2(omega); psi_hat = omega_hat/k^2 (zero k=0); u_hat=i*ky*psi_hat, v_hat=-i*kx*psi_hat; IFFT2.
// (2) semi-Lagrangian backtrace x - u*dt/h, bilinear sample (unconditionally stable).
// (3) spectral dissipation: omega_hat *= exp(-(nu*k^2 + nuHyper*k^4)*dt).
// Spectrum (CORRECT formula): E(k) = shell-average over |k|~b of |omega_hat|^2 / k^2.
// Cost ~0.7 ms/frame (1 step/frame). Bounded: max|omega| decays, stays finite.
// k = i<=N/2 ? i : i-N for FFT wavenumber ordering.

**Corrections:**
- [gallery] The headlineEquation '...=> u_tau=u_xx' and the predictReveal answer both state tau = T - t. Numerically that is WRONG: with tau=T-t the Black-Scholes residual is 1.5e-1 (nonzero). The collapse to u_tau=u_xx only holds with the additional time-rescale tau=(sigma^2/2)(T-t), which is buried as an afterthought ('plus rescaling tau by sigma^2/2') only in the deeper block. → State the rescaled time variable consistently everywhere the substitution appears. Use tau = (sigma^2/2)(T - t) in the headline derivation chain and in the predictReveal answer, not tau = T - t. Keep alpha=-(k-1)/2, beta=-(k+1)^2/4, k=2r/sigma^2 (those are correct). Alternatively, if you keep tau=T-t for narrative simplicity, you must say the resulting equation is u_tau = (sigma^2/2) u_xx (heat with diffusion constant sigma^2/2), not the bare u_xx.
- [navierstokes] CRITICAL for the visual claim: the right panel overlays a dashed -5/3 reference line and the 'what' + predictReveal assert 'the measured spectrum settles toward that slope.' On a 64x64 grid this is FALSE. Measured slopes: proposed nu=1e-3/hyper=2e-4 gives -7 to -14; weak dissipation gives ~-2.4 to -2.6 (near the 2D enstrophy -3, never -5/3); forced runs give -9.6 above forcing and +1.8 below. There are only ~10 usable wavenumbers between the forcing/energy scale and Nyquist (32), so no inertial range can form and the dissipation range begins immediately. The dashed -5/3 line will visibly NOT match the measured curve in the browser. → Do not draw a -5/3 reference line on the measured 64x64 spectrum and do not claim the demo's spectrum approaches it. Options: (a) draw a SCHEMATIC/illustrative power-law cartoon clearly separated from the live measured curve, labeled 'idealized 3D cascade'; (b) overlay the 2D-appropriate -3 (enstrophy) reference instead, and even then label it 'qualitative — too few decades on a 64^2 grid for a clean fit'; (c) bump to 128x128 (still ~0.7-1.5 ms/frame, FFT2 cost ~4x) to widen the range, though even 128 gives a marginal fit. The deeper block is already honest that this is a toy and that 2D cascades differently; the VISUAL and predictReveal must match that honesty rather than promise a -5/3 fit the scheme cannot deliver.
- [navierstokes] Minor consistency: the spectrum is computed from |omega_hat|^2/k^2 binned to ~20 radial bins, but a 64x64 grid only has integer k up to 32, and the high-k bins are dominated by the dissipation range, making any slope fit unstable frame-to-frame. → Restrict any displayed/fitted range to roughly k=2..10 and time-average the spectrum over several frames (exponential moving average of E(k)) before plotting, so the live curve is not jittery. State the fit window on the plot.

## C7-frontier-closer · greenlit=true · confidence=high

**Node results:** DRUM (Node-verified): lambda_{mn}=m^2+n^2 confirmed; finite-difference Laplacian of the mixed mode gives Delta u / u = -50.000 exactly (any cos(c)*sin(x)sin(7y)+sin(c)*sin(5x)sin(5y) is a true -50 eigenmode for all c). Accidental degeneracies (>=2 distinct {m<=n} reps) for m,n<=10 are EXACTLY lambda=50:{1,7}&{5,5}, 65:{1,8}&{4,7}, 85:{2,9}&{6,7} — all three design claims match. Sums: 1+49=25+25=50; 1+64=16+49=65; 4+81=36+49=85. sqrt(50)=7.0711.

TURING / Gray-Scott (Node-integrated, N=96, Du=0.16, Dv=0.08, dt=1.0, dx=1, 5-pt periodic Laplacian, seeded 16x16 block at u=0.5/v=0.25 +-0.01 noise). Diffusion stability number Du*4*dt = 0.640 < 1 (stable). All five presets stay BOUNDED with NO NaN and form real spatial structure:
  Spots (0.035,0.065): v in [0,0.397] std 0.054@2k -> 0.113@8k, highVfrac 23.1%, gradEnergy 3.3e-3
  Stripes (0.022,0.051): v in [0.016,0.379] std 0.086@2k -> 0.074@8k, highVfrac 38.9%, gradEnergy 1.5e-3
  Maze (0.029,0.057): v in [0.002,0.361] std 0.097@2k -> 0.098@8k, highVfrac 39.6%, gradEnergy 2.8e-3
  Mitosis (0.0367,0.0649): v in [0,0.403] std 0.061@2k -> 0.119@8k, highVfrac 25.2%, gradEnergy 4.2e-3
  Coral (0.0545,0.062): v in [0,0.417] std 0.124@2k -> 0.126@8k, highVfrac 42.8%, gradEnergy 4.7e-3
COST (this machine, Node JIT): 0.053 ms/96x96 step -> 0.64 ms/frame @12 steps; 0.097 ms/128x128 step -> 1.17 ms/frame @12 steps. (Design's conservative browser estimate 0.13-0.23 ms/step -> 1.5-2.8 ms/frame is the right order and still trivially 60fps.) dt BLOWUP confirmed: dt=1.0 maxV=0.346 ok, dt=1.5 maxV=0.385 ok, dt>=2.0 -> NaN (diverges). So the 'do NOT raise dt above ~1.5' warning is exactly right. Timing arithmetic: 2000 steps @12/frame @60fps = 2.78 s (matches '~3s to visible structure').

NEURALPDE (Node-verified DFT demo): full 64-pt DFT roundtrip RMS error 5.3e-15 (exact); spectral truncation monotonically blurs (RMS vs original: K=16 ->0.062, K=5 ->0.181, K=2 ->0.325); cost = N^2 = 4096 mults, matching the design's '~4k mults, instant'.

TRAILS: no numerical scheme (static layout) — nothing to compute.

- **drum**: // Closed-form, no solve. Field on 120x120 of [0,pi]^2:
// u(x,y)=cos(c)*sin(m*x)*sin(n*y)+sin(c)*sin(p*x)*sin(q*y)
lambda_mn = m*m + n*n;            // VERIFIED
pitch_mn  = Math.sqrt(m*m + n*n); // sqrt(50)=7.0711
// Accidental degenerate pairs (m<=n), VERIFIED:
//   lambda=50: {1,7} & {5,5}
//   lambda=65: {1,8} & {4,7}
//   lambda=85: {2,9} & {6,7}
// Diverging colormap: t<0 lerp white->#22d3ee by -t; t>0 lerp white->#f97316 by t.
// Nodal lines = marching-squares zero-contour at level 0.
- **turing**: // Gray-Scott, explicit forward-Euler, 5-point PERIODIC Laplacian, dx=1
const N = 96;            // 128 also fine on desktop (~0.1ms/step)
const Du = 0.16, Dv = 0.08, dt = 1.0;   // Du*4*dt = 0.64 < 1 (stable)
const STEPS_PER_FRAME = 12;             // ~0.6-1.2 ms/frame, 60fps easily
// u_t = Du*lap(u) - u*v^2 + F*(1-u)
// v_t = Dv*lap(v) + u*v^2 - (F+k)*v
// VERIFIED PRESETS (F,k): all bounded v in [0,~0.42], no NaN, real patterns:
const PRESETS = {
  Spots:   {F:0.035,  k:0.065 },
  Stripes: {F:0.022,  k:0.051 },
  Maze:    {F:0.029,  k:0.057 },
  Mitosis: {F:0.0367, k:0.0649},
  Coral:   {F:0.0545, k:0.062 },
};
// init: u=1, v=0 everywhere; seed central 16x16 to u=0.5,v=0.25 with +-0.01 uniform noise.
// ping-pong two Float64Array(N*N) buffers. Click-to-seed: set v=0.5 in small disk.
// HARD LIMIT: dt<=1.5 (dt>=2.0 -> NaN). Keep seed noise <=0.01.
- **neuralpde**: // Purely illustrative; only real compute is the truncation demo.
const N = 64;                 // hand-rolled DFT, ~N^2=4096 mults, instant
// keep lowest-K modes (and conjugate N-k), zero the rest, inverse-DFT.
// roundtrip is exact (RMS ~1e-15); smaller K -> blurrier (RMS K=16:0.06, K=5:0.18, K=2:0.32).
// PINN curve (precomputed): u(x,t)=sum_k a_k * exp(-k^2 * t) * sin(k*x), ~4 modes.
// All other fields are precomputed constants / SVG paths.
- **trails**: // No numerical scheme. Static SVG/flexbox + framer-motion whileInView. Zero per-frame cost.
// Headline identities (display only, all correct):
//   Delta u = (avg of neighbors) - u  [up to the dx^2 scaling of the 5-pt stencil]
//   Delta sin(kx) = -k^2 sin(kx)

**Corrections:**
- [turing] The scheme text states 'Du*4*dt=0.64<1, comfortably stable' and frames Du as the binding species. That is the correct stability number, but note the standard heat-FTCS-style bound for a single species on a periodic grid is D*4*dt/dx^2 <= 1; with Du=0.16 the margin is 0.64, fine. No fix to parameters needed — but if anyone later bumps dt toward 2 to 'speed it up', it WILL NaN (verified). Keep the dt<=1.5 guard explicit in code, not just prose. → Hard-clamp dt to <=1.5 in any user-facing step-rate control, and clamp the (F,k) phase-pad pin to the verified region (F in ~[0.01,0.06], k in ~[0.045,0.07]); far outside this box the uniform state can persist (no pattern) or v can collapse to 0 — not a blowup, but a blank canvas that looks broken.
- [turing] Design's MEASURED COST cites '~0.13-0.23 ms per 96x96 step'. My Node measurement is ~0.053 ms/step (faster due to JIT). This is not an error — the design's number is a conservative upper bound and a real browser (JS engine, ImageData write) lands between the two. The conclusion (trivially 60fps) is correct either way. → No change required. Optionally soften the prose to 'roughly 0.05-0.2 ms/96x96 step depending on engine' so the claim can't be nitpicked; the ~1.5-2.8 ms/frame budget figure is safe to keep.
- [neuralpde] The 'learned operator discovers something close to e^{-k^2 T}' line in the worked example is a fair intuition for the heat-equation FNO, but it is a heuristic claim (an FNO weight is a learned complex multiplier, not provably the heat kernel). It is presented in the Deeper/worked block, which is acceptable. → No math fix. Keep the existing hedge ('close to', 'discovers something like') so it reads as intuition, not a theorem.

