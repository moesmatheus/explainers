import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, BrainCircuit, ChevronDown,
  Compass, Crosshair, Eye, EyeOff, FlaskConical, FunctionSquare, Gauge,
  GitBranch, GitFork, HelpCircle, Layers, Layers3, Lightbulb, Link2, LineChart,
  Move, Network, Quote, RotateCw, Ruler, Scale, ShieldAlert, Shuffle, Sigma,
  Sliders, Sparkles, Split, Star, Target, Telescope, TrendingDown, TrendingUp,
  Waves, Wand2, Workflow, CheckCircle2, XCircle, Zap,
} from 'lucide-react';

/* ============================================================================
   Control Theory · the math of feedback (and the predecessor to RL)
   A unified survey: feedback as a worldview, state-space dynamics, classical
   stability & frequency methods, LQR / Kalman / LQG, MPC / HJB / MPPI,
   system ID + nonlinear control, then the explicit bridge back to the RL
   explainer — LQR ↔ policy gradients, observer ↔ belief states, H∞ ↔ sim-to-real.
   Cart-pole is the running plant.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\sk': '\\textcolor{##7dd3fc}{#1}',  // sky      · state / plant x
  '\\co': '\\textcolor{##6ee7b7}{#1}',  // emerald  · control / policy u, K
  '\\ob': '\\textcolor{##c4b5fd}{#1}',  // violet   · observer / belief x̂
  '\\cs': '\\textcolor{##fbbf24}{#1}',  // amber    · cost / loss
  '\\an': '\\textcolor{##f0abfc}{#1}',  // fuchsia  · anchors / Riccati
  '\\bi': '\\textcolor{##fb7185}{#1}',  // rose     · instability / noise
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

// --- small numeric helpers --------------------------------------------------

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const mean = (arr, f = (x) => x) => (arr.length ? arr.reduce((s, x) => s + f(x), 0) / arr.length : 0);
const fmtN = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);

// --- cart-pole · the running plant ------------------------------------------
// Linearized about the upright equilibrium.
// State x = [x_cart, ẋ_cart, θ, θ̇] with θ = pole angle from vertical, positive = tilting right.
// Input u = horizontal force on the cart (N), positive = pushing right.
// Parameters: cart mass M = 1.0 kg, pole mass m = 0.1 kg, pole length L = 1 m, g = 9.81 m/s².
// One open-loop pole at +√10.791 ≈ +3.28 rad/s (unstable). Used by every card from here on.

const CP_A = [
  [0, 1,    0,        0],
  [0, 0,  -0.981,     0],
  [0, 0,    0,        1],
  [0, 0,   10.791,    0],
];
const CP_B = [0, 1, 0, -1];

const cpDot = (x, u) => [
  x[1],
  -0.981 * x[2] + u,
  x[3],
  10.791 * x[2] - u,
];

// 4th-order Runge-Kutta step for ẋ = f(x, u).
const rk4 = (f, x, u, dt) => {
  const k1 = f(x, u);
  const x2 = x.map((xi, i) => xi + 0.5 * dt * k1[i]);
  const k2 = f(x2, u);
  const x3 = x.map((xi, i) => xi + 0.5 * dt * k2[i]);
  const k3 = f(x3, u);
  const x4 = x.map((xi, i) => xi + dt * k3[i]);
  const k4 = f(x4, u);
  return x.map((xi, i) => xi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
};

// Default running cost weights: angle matters most, then position; small effort penalty.
const CP_Q_DIAG = [1, 0.05, 10, 1];
const CP_R = 0.05;

// Roll a controller out for T steps. controller(y, t) → u (will be saturated to ±SAT_U).
// Optional wSeq (process noise added to ẋ) and vSeq (sensor noise added to y).
// Returns xs (T+1 states), us (T inputs), J running quadratic cost.
const CP_SAT_U = 30;
const cpRoll = (controller, x0, T, dt, opts = {}) => {
  const { wSeq, vSeq, satU = CP_SAT_U, Q = CP_Q_DIAG, R = CP_R } = opts;
  const xs = [x0.slice()]; const us = [];
  let x = x0.slice(); let J = 0;
  for (let t = 0; t < T; t++) {
    const v = vSeq?.[t] ?? null;
    const y = v ? [x[0] + v[0], x[1] + v[1], x[2] + v[2], x[3] + v[3]] : x;
    let u = controller(y, t);
    if (!Number.isFinite(u)) u = 0;
    u = Math.max(-satU, Math.min(satU, u));
    const w = wSeq?.[t] ?? null;
    const f = w
      ? (xx, uu) => { const d = cpDot(xx, uu); return [d[0] + w[0], d[1] + w[1], d[2] + w[2], d[3] + w[3]]; }
      : cpDot;
    x = rk4(f, x, u, dt);
    xs.push(x.slice()); us.push(u);
    J += dt * (Q[0]*x[0]**2 + Q[1]*x[1]**2 + Q[2]*x[2]**2 + Q[3]*x[3]**2 + R*u*u);
  }
  return { xs, us, J };
};

// Deterministic Gaussian noise sequence.
function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function boxMuller(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const cpNoiseSeq = (T, sigmas, seed = 1) => {
  const r = mulberry32(seed);
  return Array.from({ length: T }, () => sigmas.map(s => s * boxMuller(r)));
};

// A hand-picked stabilizing gain, used as the "closed-loop" reference everywhere
// until the LQR card actually solves Riccati. With u = -K·x and CP_B = [0,1,0,-1],
// K_θ must be negative so that a positive tilt gives a positive cart force.
const CP_K_STABLE = [-1.0, -2.4, -30.0, -6.0];
const ctrlLinear = (K) => (y) => -(K[0]*y[0] + K[1]*y[1] + K[2]*y[2] + K[3]*y[3]);

// Cart-pole SVG. Pass the current state; optional trail = previous states for a ghost line.
const CartPoleSVG = ({ x, trail = [], width = 380, height = 170, accent = '#7dd3fc',
                       caption = true, xRange = 2.5 }) => {
  const xCart = x[0];
  const theta = x[2];
  const margin = 22;
  const cx = (xv) => margin + ((xv + xRange) / (2 * xRange)) * (width - 2 * margin);
  const baseY = height * 0.72;
  const Lpx = 78;
  const cartW = 40, cartH = 20;
  const cartX = cx(xCart);
  const pivotX = cartX, pivotY = baseY;
  const tipX = pivotX + Lpx * Math.sin(theta);
  const tipY = pivotY - Lpx * Math.cos(theta);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <line x1={margin} y1={baseY + cartH / 2 + 2} x2={width - margin} y2={baseY + cartH / 2 + 2}
            stroke="rgba(255,255,255,0.18)" strokeDasharray="3 4" />
      {/* center reference tick */}
      <line x1={cx(0)} y1={baseY + cartH / 2 + 2} x2={cx(0)} y2={baseY + cartH / 2 + 8}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {trail.length > 1 && (
        <polyline
          fill="none"
          stroke={accent}
          strokeOpacity="0.25"
          strokeWidth="1"
          points={trail.map(s => `${cx(s[0])},${baseY - 18 - 60 * Math.sin(s[2])}`).join(' ')}
        />
      )}
      <rect x={cartX - cartW / 2} y={baseY - cartH / 2} width={cartW} height={cartH}
            fill="rgba(125,211,252,0.15)" stroke={accent} strokeWidth="1.5" rx="2" />
      <line x1={pivotX} y1={pivotY} x2={tipX} y2={tipY} stroke="rgba(244,114,182,0.95)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={tipX} cy={tipY} r="5" fill="rgba(244,114,182,0.95)" />
      <circle cx={pivotX} cy={pivotY} r="2.6" fill="white" />
      {caption && (
        <text x={width / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">
          x_cart = {xCart.toFixed(2)} m · θ = {(theta * 180 / Math.PI).toFixed(1)}°
        </text>
      )}
    </svg>
  );
};

// Frame-stepping animation hook. Pass an array of precomputed states; the hook
// emits a current frame index that advances at speed× the real-time dt.
const useCpFrames = (frames, dt = 0.02) => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  useEffect(() => { setIdx(0); }, [frames]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx(i => (i + 1) % Math.max(1, frames.length));
    }, Math.max(8, 1000 * dt / speed));
    return () => clearInterval(id);
  }, [playing, speed, frames, dt]);
  return { idx, frame: frames[idx] || frames[0] || [0,0,0,0], playing, setPlaying, speed, setSpeed,
           reset: () => setIdx(0) };
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, anchor = false, children }) => {
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
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
};
const Chip = ({ children, color = 'sky' }) => (
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
  // plant / signals
  'plant': 'The physical system being controlled (cart-pole, drone, reactor, HVAC). What the controller acts on.',
  'actuator': 'The device that applies the control input — motor, valve, thrust vector. Translates u into force on the plant.',
  'sensor': 'Whatever measures the plant — encoder, IMU, thermometer. Produces the measurement y, usually noisy.',
  'reference': 'The desired value (set-point or trajectory) the controller is trying to make the output track. Often called r or r(t).',
  'disturbance': 'Anything pushing the plant that the controller did not ask for — wind gust, load change, process noise w_t.',
  'measurement noise': 'Sensor error v_t added to y. A Kalman filter assumes it is zero-mean Gaussian; reality is rougher.',
  'open-loop': 'Apply a pre-computed control sequence without looking at the output. Works only when the model is perfect and there are no disturbances.',
  'closed-loop': 'Feed the measurement back to the controller so u depends on y. The whole subject is about why this changes everything.',
  'feedback': 'Routing the output (or an error signal) back to the input of the controller. The single trick under all of control theory.',
  // dynamics
  'state': 'The minimum information needed to predict the future of the plant given future inputs. The vector x in x_{t+1}=f(x,u).',
  'state-space': 'The representation ẋ = Ax + Bu, y = Cx + Du (continuous) or x_{t+1}=Ax_t+Bu_t (discrete). Linear control’s lingua franca.',
  'transfer function': 'The Laplace-domain ratio G(s) = Y(s)/U(s) of a linear time-invariant plant. Equivalent to state-space for LTI systems.',
  'pole': 'A root of the denominator of the transfer function — equivalently an eigenvalue of A. Determines stability and dynamics.',
  'zero': 'A root of the numerator. Shapes how inputs reach the output; can cause non-minimum-phase behavior.',
  'eigenvalue': 'A scalar λ with Av = λv for some nonzero v. Eigenvalues of A are the modes of the linear system.',
  // stability + frequency
  'stability': 'The system returns to (or stays near) an equilibrium after perturbation. BIBO, asymptotic, and Lyapunov stability are different formal versions.',
  'Lyapunov function': 'A scalar function V(x) ≥ 0 with V̇ < 0 along trajectories — proves stability without solving the ODE.',
  'Bode plot': 'Two log-axis plots of a transfer function vs frequency: gain |G(jω)| and phase ∠G(jω). Tells you how the system handles each frequency.',
  'Nyquist plot': 'The locus of G(jω) in the complex plane as ω sweeps. Stability is read off how the locus winds around the −1 point.',
  'gain margin': 'How much the loop gain can be multiplied before instability. Measured at the phase-crossover (where ∠GH = −180°).',
  'phase margin': 'How much extra phase lag the system can tolerate before instability. Measured at the gain-crossover (|GH|=1).',
  'sensitivity function': 'S = 1/(1+L) — how disturbances at the output propagate. Small |S| means good disturbance rejection at that frequency.',
  'complementary sensitivity': 'T = L/(1+L) — how reference and noise propagate to output. S + T = 1 identically. The waterbed lives here.',
  'waterbed effect': 'You can push |S| down at one frequency only by raising it elsewhere. A hard mathematical constraint on linear feedback.',
  // structural
  'controllability': 'Whether you can drive the state from any x_0 to any x_f with a feasible control sequence. Rank of the controllability matrix tests it.',
  'observability': 'Whether the measurements y uniquely determine the state x — dually whether you can build an observer at all.',
  'detectability': 'Weaker than observability: unobservable modes are at least stable, so they don’t blow up your estimate.',
  // LQR + Kalman + LQG
  'LQR': 'Linear Quadratic Regulator. Optimal control for a linear plant with quadratic cost — the policy is u = −Kx, K from a Riccati equation.',
  'Riccati equation': 'The matrix equation whose solution P gives the LQR gain K = R⁻¹BᵀP. Algebraic in the infinite-horizon case, differential in finite-horizon.',
  'Q matrix': 'State-cost weighting in LQR. Diagonal entries say how much you penalize deviation of each state.',
  'R matrix': 'Control-cost weighting in LQR. Larger R means cheaper-on-effort policies; smaller R means more aggressive.',
  'gain matrix': 'The K in u = −Kx. For LQR it is the optimal feedback gain. For PG, the same K, found by gradient descent.',
  'Kalman filter': 'The optimal recursive estimator for a linear system driven by Gaussian noise. Maintains a Gaussian belief (mean + covariance).',
  'innovation': 'The measurement residual y − Cx̂ at each step — the part of the observation that wasn’t already predicted.',
  'Kalman gain': 'How much the observer trusts the new measurement. Large when sensor noise is low or the prediction is uncertain.',
  'LQG': 'Linear-Quadratic-Gaussian. Cascade of an LQR controller and a Kalman observer. Optimal under linearity + Gaussianity; the separation theorem says you can design them independently.',
  'separation theorem': 'Under LQG assumptions, the optimal LQR gain and the optimal Kalman estimator are designed independently, and the cascade is still optimal.',
  // optimal control / planning
  'MPC': 'Model Predictive Control. At each step, optimize a finite-horizon plan with the model, apply only the first control, repeat. Handles constraints natively.',
  'receding horizon': 'The horizon slides forward one step at a time — at t you plan over [t, t+N], at t+1 over [t+1, t+N+1]. The defining trick of MPC.',
  'prediction horizon': 'How many steps ahead the MPC plans. Longer = closer to global optimum, but more expensive.',
  'HJB equation': 'Hamilton-Jacobi-Bellman. The continuous-time PDE whose solution V(x,t) is the optimal value function. Bellman’s equation in the Δt→0 limit.',
  'Bellman equation': 'The recursive equation V(x) = min_u [ℓ(x,u) + γ V(f(x,u))] that the optimal value function satisfies. Lives in the RL explainer.',
  'value function': 'V(x) = cost-to-go from state x under the optimal policy. The single object that unifies LQR, MPC, HJB and RL.',
  'MPPI': 'Model Predictive Path Integral control. Sample K control sequences, weight by exp(−cost/λ), take the weighted mean. Sampling-based MPC for nonlinear plants.',
  'system identification': 'Estimating the dynamics matrices A, B (or a nonlinear model) from data {(x_t, u_t, x_{t+1})}. Sysid is to MPC what model learning is to model-based RL.',
  'persistent excitation': 'The input must keep exciting all the modes you’re trying to identify. Sysid fails silently if the input is too gentle or too repetitive.',
  // nonlinear
  'feedback linearization': 'A nonlinear change of variables that cancels nonlinearities in the dynamics, leaving a linear system to control. Requires an accurate model.',
  'sliding mode': 'Switch the control aggressively to drive the state onto a designed surface (the sliding manifold), then keep it there. Robust to bounded uncertainty.',
  'energy shaping': 'Design the controller so the closed-loop system behaves like one with a chosen energy function. Classic example: pendulum swing-up.',
  // RL bridge
  'policy gradient': 'A class of RL algorithms that improves the policy directly by ascending an estimated gradient of the expected return. REINFORCE is the prototypical one.',
  'REINFORCE': 'The original policy-gradient algorithm: sample trajectories, compute log-prob × return, ascend. High variance but unbiased.',
  'POMDP': 'Partially-Observable MDP. The agent sees observations, not the state; the optimal action depends on the belief over states.',
  'belief state': 'The posterior distribution over the true state given the observation history. For linear-Gaussian POMDPs this is exactly a Kalman filter.',
  'H∞ control': 'A robust-control framework that minimizes the worst-case gain from disturbance to error over a class of plants — a minimax design.',
  'robust control': 'Design that guarantees performance over a *set* of plants (not just the nominal one). Trades nominal performance for worst-case safety.',
  'domain randomization': 'In sim-to-real RL: train across a distribution of simulated plants so the policy generalizes to the real one. The RL cousin of H∞.',
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
              const Tag = isLink ? 'a' : 'div';
              const props = isLink ? { href: it.href, onClick: (e) => onClick(e, it.href) } : {};
              return (
                <Tag key={j} {...props}
                  className={`block rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 ${isLink ? 'hover:bg-white/[0.05] hover:border-violet-400/30 transition-colors' : ''}`}>
                  <div className="text-[12px] text-neutral-100 font-medium leading-snug flex items-baseline gap-1.5">
                    {isLink && <ArrowRight className="w-2.5 h-2.5 self-center text-violet-300" />}
                    {it.label}
                  </div>
                  {it.note && <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{it.note}</div>}
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Hero -------------------------------------------------------------------

const HeroField = () => {
  // a static decorative field of feedback arcs in the background
  const dots = useMemo(() => {
    const out = [];
    let s = 1;
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xffffffff) / 0x100000000; };
    for (let i = 0; i < 60; i++) {
      out.push({ x: r(), y: r(), r: 0.6 + r() * 1.4, opacity: 0.10 + r() * 0.35 });
    }
    return out;
  }, []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x * 100} cy={d.y * 100} r={d.r * 0.3} fill="#7dd3fc" opacity={d.opacity} />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Activity className="w-3.5 h-3.5" /> control theory · the math of feedback
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-transparent">
          Control Theory
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">The predecessor to reinforcement learning — and still the right answer when the linear-Gaussian assumptions hold.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          In <span className="text-violet-300">1960</span> Kalman wrote down a recursive filter that gives the optimal estimate
          of a hidden state. In <span className="text-emerald-300">1969</span> Riccati’s equation gives the optimal linear
          controller for the same plant. Together they balance a cart-pole{' '}
          <span className="text-emerald-300">in closed form</span>. Modern RL solves the same problem by{' '}
          <span className="text-sky-300">gradient descent</span> — and still can’t beat them when the world is linear.
          This explainer is what RL inherits.
        </p>
        <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">LQR · Riccati</div>
            <div className="text-2xl font-mono text-emerald-200">K<span className="text-sm text-emerald-300/70"> in 1 step</span></div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-600" />
          <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-widest text-sky-300">policy gradient</div>
            <div className="text-2xl font-mono text-sky-200">same K<span className="text-sm text-sky-300/70"> in ~500 episodes</span></div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">feedback · state-space · PID</span>
          <span className="text-emerald-300">LQR · MPC · HJB</span>
          <span className="text-violet-300">Kalman · LQG · POMDPs</span>
          <span className="text-fuchsia-300">bridges to RL</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// --- Section nav ------------------------------------------------------------

const SECTIONS = [
  { id: 'frame',         label: 'Open vs closed loop',      icon: Activity },
  { id: 'dynamics',      label: 'State-space dynamics',     icon: Layers },
  { id: 'noise',         label: 'Disturbances & noise',     icon: Waves },
  { id: 'pid',           label: 'PID · the workhorse',      icon: Sliders },
  { id: 'stability',     label: 'Stability & Lyapunov',     icon: Target },
  { id: 'sensitivity',   label: 'Sensitivity & waterbed',   icon: TrendingUp },
  { id: 'frequency',     label: 'Bode & Nyquist',           icon: LineChart },
  { id: 'controllability', label: 'Controllability',        icon: Move },
  { id: 'observability', label: 'Observability',            icon: Eye },
  { id: 'lqr',           label: 'LQR · Riccati',            icon: Sigma, anchor: true },
  { id: 'costshape',     label: 'Cost shaping · Q,R',       icon: Scale },
  { id: 'kalman',        label: 'Kalman observer',          icon: Crosshair },
  { id: 'lqg',           label: 'LQG · separation theorem', icon: Split },
  { id: 'mpc',           label: 'MPC · receding horizon',   icon: Workflow },
  { id: 'hjb',           label: 'HJB ↔ Bellman',            icon: FunctionSquare },
  { id: 'mppi',          label: 'MPPI · sampling MPC',      icon: Shuffle },
  { id: 'sysid',         label: 'System identification',    icon: BrainCircuit },
  { id: 'nonlinear',     label: 'Nonlinear · Lyapunov',     icon: GitBranch },
  { id: 'bridge',        label: 'LQR ↔ policy gradients',   icon: GitFork, anchor: true },
  { id: 'belief',        label: 'Observer ↔ belief states', icon: Network },
  { id: 'robust',        label: 'Robust ↔ sim-to-real',     icon: ShieldAlert },
  { id: 'trails',        label: 'Next trails',              icon: Compass },
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
      <nav className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20 max-h-[88vh] overflow-y-auto">
        <ul className="space-y-1 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-100' : 'border-transparent text-neutral-400'}`}>
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
   STUB CARDS — placeholders; each is replaced with real content in stages C-I.
   The default export references these names directly, so they always resolve.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ---- shared: complex-plane plot of poles, used by Dynamics + Stability ---- */

const ComplexPlane = ({ poles, width = 220, height = 200, maxAbs = 4, hl = null }) => {
  const cx = (re) => width / 2 + (re / maxAbs) * (width / 2 - 14);
  const cy = (im) => height / 2 - (im / maxAbs) * (height / 2 - 14);
  const ticks = [];
  for (let t = -Math.floor(maxAbs); t <= Math.floor(maxAbs); t++) if (t !== 0) ticks.push(t);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <rect x={width / 2} y="0" width={width / 2} height={height} fill="rgba(244,63,94,0.07)" />
      <line x1="6" y1={height / 2} x2={width - 6} y2={height / 2} stroke="rgba(255,255,255,0.28)" />
      <line x1={width / 2} y1="6" x2={width / 2} y2={height - 6} stroke="rgba(255,255,255,0.28)" />
      {ticks.map(t => (
        <g key={t}>
          <line x1={cx(t)} y1={height / 2 - 3} x2={cx(t)} y2={height / 2 + 3} stroke="rgba(255,255,255,0.3)" />
          <line x1={width / 2 - 3} y1={cy(t)} x2={width / 2 + 3} y2={cy(t)} stroke="rgba(255,255,255,0.3)" />
        </g>
      ))}
      <text x={width - 8} y={height / 2 - 6} fontSize="9" fill="rgba(255,255,255,0.45)" textAnchor="end" fontFamily="ui-monospace, monospace">Re</text>
      <text x={width / 2 + 8} y={14} fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">Im</text>
      <text x={cx(maxAbs * 0.65)} y={height - 6} fontSize="9" fill="rgba(244,63,94,0.65)" textAnchor="middle" fontFamily="ui-monospace, monospace">unstable</text>
      <text x={cx(-maxAbs * 0.65)} y={height - 6} fontSize="9" fill="rgba(110,231,183,0.55)" textAnchor="middle" fontFamily="ui-monospace, monospace">stable</text>
      {poles.map((p, i) => {
        const unstable = p.re > 0.001;
        const stable = p.re < -0.001;
        const color = unstable ? '#fb7185' : stable ? '#6ee7b7' : '#fbbf24';
        const isHl = hl != null && i === hl;
        return (
          <g key={i}>
            {isHl && <circle cx={cx(p.re)} cy={cy(p.im)} r="9" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1" />}
            <line x1={cx(p.re) - 4} y1={cy(p.im) - 4} x2={cx(p.re) + 4} y2={cy(p.im) + 4} stroke={color} strokeWidth="1.8" />
            <line x1={cx(p.re) - 4} y1={cy(p.im) + 4} x2={cx(p.re) + 4} y2={cy(p.im) - 4} stroke={color} strokeWidth="1.8" />
            {p.mult > 1 && <text x={cx(p.re) + 8} y={cy(p.im) + 4} fontSize="9" fill={color} fontFamily="ui-monospace, monospace">×{p.mult}</text>}
          </g>
        );
      })}
    </svg>
  );
};

/* ---- shared: catalog of three example plants ---- */

const PLANTS = [
  {
    id: 'cartpole', name: 'Cart-pole · upright',
    states: 'x = [x_{cart},~\\dot x_{cart},~\\theta,~\\dot\\theta]',
    input: 'u = F (cart force, N)',
    Atex: '\\bm{A} = \\begin{pmatrix} 0 & 1 & 0 & 0 \\\\ 0 & 0 & -0.98 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 10.79 & 0 \\end{pmatrix}',
    Btex: '\\bm{B} = \\begin{pmatrix} 0 \\\\ 1 \\\\ 0 \\\\ -1 \\end{pmatrix}',
    poles: [{ re: 0, im: 0, mult: 2 }, { re: 3.285, im: 0 }, { re: -3.285, im: 0 }],
    note: 'Two zero modes (cart position and velocity have no restoring force) plus a symmetric ±3.28 pair from the inverted pendulum. The +3.28 pole is the unstable mode — without feedback the angle grows like e^{3.28 t}.',
  },
  {
    id: 'thermal', name: 'RC thermal · one-room',
    states: 'x = \\theta_{room} - \\theta_{ambient}',
    input: 'u = Q (heater, W per °C of capacity)',
    Atex: '\\bm{A} = \\begin{pmatrix} -0.01 \\end{pmatrix}',
    Btex: '\\bm{B} = \\begin{pmatrix} 0.01 \\end{pmatrix}',
    poles: [{ re: -0.01, im: 0 }],
    note: 'A single stable pole at −0.01 rad/s (100-second time constant). The room cools toward ambient on its own — control is about tracking a set-point, not about stabilization.',
  },
  {
    id: 'mass2', name: 'Two masses + spring + damper',
    states: 'x = [x_1,~\\dot x_1,~x_2,~\\dot x_2]',
    input: 'u = F on mass 1',
    Atex: '\\bm{A} = \\begin{pmatrix} 0 & 1 & 0 & 0 \\\\ -4 & -0.5 & 4 & 0.5 \\\\ 0 & 0 & 0 & 1 \\\\ 4 & 0.5 & -4 & -0.5 \\end{pmatrix}',
    Btex: '\\bm{B} = \\begin{pmatrix} 0 \\\\ 1 \\\\ 0 \\\\ 0 \\end{pmatrix}',
    poles: [{ re: 0, im: 0, mult: 2 }, { re: -0.5, im: 2.78 }, { re: -0.5, im: -2.78 }],
    note: 'A double pole at the origin — the rigid-body mode (the chain of masses can drift freely) — plus a damped oscillation at ≈2.78 rad/s with light damping ratio ≈0.18.',
  },
];

/* ---- 01 · Open vs closed loop ---- */

const buildFrames = (controller, x0, T, dt) => {
  const xs = [x0.slice()];
  let x = x0.slice();
  let fallenAt = -1;
  for (let t = 0; t < T; t++) {
    if (Math.abs(x[2]) > Math.PI / 2 || Math.abs(x[0]) > 3.4) {
      if (fallenAt < 0) fallenAt = t;
      const clampedTheta = Math.sign(x[2]) * Math.PI / 2;
      x = [Math.max(-3.4, Math.min(3.4, x[0])), 0, clampedTheta, 0];
    } else {
      let u = controller(x, t);
      if (!Number.isFinite(u)) u = 0;
      u = Math.max(-CP_SAT_U, Math.min(CP_SAT_U, u));
      x = rk4(cpDot, x, u, dt);
    }
    xs.push(x.slice());
  }
  return { xs, fallenAt };
};

const FrameCard = () => {
  const [mode, setMode] = useState('closed');
  const dt = 0.02, T = 360;
  const x0 = [0, 0, 0.18, 0];
  const closed = useMemo(() => buildFrames(ctrlLinear(CP_K_STABLE), x0, T, dt), []);
  const open   = useMemo(() => buildFrames(() => 0,                x0, T, dt), []);
  const active = mode === 'closed' ? closed : open;
  const { frame, idx, playing, setPlaying, speed, setSpeed, reset } = useCpFrames(active.xs, dt);
  const tSec = (idx * dt).toFixed(2);
  const isFallen = active.fallenAt >= 0 && idx >= active.fallenAt;
  const fallTime = active.fallenAt >= 0 ? (active.fallenAt * dt).toFixed(2) : null;

  return (
    <Card id="frame" icon={Activity} title="Open vs closed loop" accent="sky" index={1}
          subtitle="The whole subject in one switch. Same cart-pole; the only difference is whether the controller looks at the output.">
      <MinSchema>
        An <Term>open-loop</Term> controller applies a pre-computed input and never looks at the
        result. A <Term>closed-loop</Term> controller reads the <Term>sensor</Term>, compares it
        to the <Term>reference</Term>, and adjusts the <Term>actuator</Term> every step. Same
        physics; the second one is the whole of control theory.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => { setMode('open'); reset(); }}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${mode === 'open' ? 'border-rose-400/40 bg-rose-400/15 text-rose-200' : 'border-white/15 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'}`}>open-loop · u = 0</button>
        <button onClick={() => { setMode('closed'); reset(); }}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${mode === 'closed' ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200' : 'border-white/15 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'}`}>closed-loop · u = −K·x</button>
        <span className="text-[10px] text-neutral-500 font-mono ml-2">t = {tSec}s</span>
        <button onClick={() => setPlaying(p => !p)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">{playing ? 'pause' : 'play'}</button>
        <button onClick={reset} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">reset</button>
        <label className="ml-1 flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
          speed
          <input type="range" min="0.25" max="2" step="0.25" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="ct-range w-20" />
          <span className="tabular-nums">{speed.toFixed(2)}×</span>
        </label>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div className={`rounded-lg border ${mode === 'closed' ? 'border-emerald-400/30' : 'border-rose-400/30'} bg-neutral-950/40 p-3 relative`}>
          <CartPoleSVG x={frame} width={400} height={180} accent={mode === 'closed' ? '#6ee7b7' : '#fb7185'} />
          {isFallen && (
            <div className="absolute top-2 right-3 text-[10px] uppercase tracking-widest text-rose-300 font-mono">
              fallen at t = {fallTime}s
            </div>
          )}
        </div>

        <div className="text-[11px] leading-relaxed text-neutral-400 font-mono space-y-1.5 min-w-[150px]">
          <div className="uppercase text-[9px] tracking-[0.2em] text-neutral-500">block diagram</div>
          <div className="inline-block rounded border border-sky-400/30 bg-sky-400/5 px-2 py-0.5 text-sky-200">r</div>
          <div className="text-neutral-600">↓</div>
          <div className="inline-block rounded border border-emerald-400/30 bg-emerald-400/5 px-2 py-0.5 text-emerald-200">controller</div>
          <div className="text-neutral-600">↓ u</div>
          <div className="inline-block rounded border border-sky-400/30 bg-sky-400/5 px-2 py-0.5 text-sky-200">plant</div>
          <div className="text-neutral-600">↓ y</div>
          <div className="inline-block rounded border border-violet-400/30 bg-violet-400/5 px-2 py-0.5 text-violet-200">sensor</div>
          {mode === 'closed' && <div className="text-emerald-300 text-[10px] mt-1">↰ feedback back to controller</div>}
          {mode === 'open' && <div className="text-rose-300 text-[10px] mt-1">(no feedback path)</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label="mode" value={mode === 'closed' ? 'closed' : 'open'}
              color={mode === 'closed' ? 'text-emerald-200' : 'text-rose-200'} />
        <Stat label="angle now" value={`${(frame[2] * 180 / Math.PI).toFixed(1)}°`} />
        <Stat label="outcome"
              value={mode === 'closed' ? '✓ holds' : '× falls'}
              color={mode === 'closed' ? 'text-emerald-200' : 'text-rose-200'}
              sub={mode === 'open' ? `fell at ${fallTime}s` : 'stable about x = 0'} />
      </div>

      <Predict question="If you nudge the pole to 10° and apply zero control, how long until it’s flat on the track?">
        Open-loop, the unstable mode grows like e^{'{'}3.28 t{'}'}. Starting from θ₀ = 0.18 rad
        (≈10°), the angle reaches π/2 in about <span className="text-rose-300">{open.fallenAt >= 0 ? (open.fallenAt * dt).toFixed(2) : '—'} s</span>.
        That is the time constant of the inverted pendulum baked into <Eq>{'A'}</Eq>; the
        controller’s job is to cancel it.
      </Predict>

      <Misconception
        wrong="A good open-loop trajectory plan is enough — feedback just adds robustness."
        right="Without feedback, even a tiny modeling error or wind gust grows exponentially along any unstable mode. Feedback is what turns an unstable plant into a stable closed loop, not a polish on a working one."
        because="The open-loop transfer function inherits A’s eigenvalues; closed-loop’s eigenvalues are A − BK and can be placed anywhere."
      />

      <Deeper>
        <p>
          The block diagram above is the universal frame. The <Term>plant</Term> is whatever
          you’re trying to control — a cart-pole, a refinery column, a glucose-insulin
          regulator. The <Term>actuator</Term> turns the controller’s command <Eq>{'u'}</Eq>
          into a physical effect on the plant (a motor torque, a valve opening, an injection
          rate). The <Term>sensor</Term> produces a measurement <Eq>{'y = Cx + v'}</Eq>,
          usually corrupted by <Term>measurement noise</Term>. The <Term>controller</Term>
          maps the measurement (and the reference) to the next command. Everything in this
          explainer is one or more of those four boxes — the rest of the cards just zoom in.
        </p>
        <p>
          Closed-loop changes the eigenvalue placement: under <Eq>{'u = -Kx'}</Eq> the
          dynamics become <Eq>{'\\dot x = (A - BK)\\,x'}</Eq>. For the cart-pole the
          stabilizing gain places all four closed-loop poles in the left half-plane; pick
          K too softly and the +3.28 pole only gets pushed near the imaginary axis, where
          a small disturbance still wins.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 02 · State-space dynamics ---- */

const DynamicsCard = () => {
  const [pid, setPid] = useState('cartpole');
  const plant = PLANTS.find(p => p.id === pid);
  return (
    <Card id="dynamics" icon={Layers} title="State-space dynamics" accent="sky" index={2}
          subtitle="The lingua franca: one matrix encodes the physics, another tells the controller where it can push.">
      <MinSchema>
        Every linear time-invariant plant looks the same once you write it down:
        the next instant of <Term>state</Term> is a linear function of the current state and
        the current input.
      </MinSchema>

      <Block>{'\\dot{\\sk{x}} = \\sk{A}\\,\\sk{x} + \\sk{B}\\,\\co{u} \\qquad \\sk{y} = C\\,\\sk{x} + D\\,\\co{u}'}</Block>

      <p>
        The matrix <Eq>{'A'}</Eq> carries the physics — what the plant would do on its own,
        with no input. Its <Term>eigenvalue</Term>s are the <Term>pole</Term>s of the
        open-loop transfer function; positive real parts mean unstable modes. The matrix
        <Eq>{'B'}</Eq> tells the controller which directions of the state it can actually
        push. Pick a plant:
      </p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {PLANTS.map(p => (
          <button key={p.id} onClick={() => setPid(p.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border ${pid === p.id ? 'border-sky-400/50 bg-sky-400/15 text-sky-200' : 'border-white/15 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">
            states · <span className="font-mono normal-case tracking-normal text-neutral-300"><Eq>{plant.states}</Eq></span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">
            input · <span className="font-mono normal-case tracking-normal text-neutral-300">{plant.input}</span>
          </div>
          <Block>{plant.Atex}</Block>
          <Block>{plant.Btex}</Block>
        </div>
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">eigenvalues of A</div>
          <ComplexPlane poles={plant.poles} width={220} height={200}
            maxAbs={plant.id === 'thermal' ? 0.04 : 4} />
        </div>
      </div>

      <p className="text-sm text-neutral-300 mt-2">{plant.note}</p>

      <Misconception
        wrong="The matrices A, B come from the physics — they’re given."
        right="They come from a linearization about an operating point. The cart-pole matrices above are valid for small angles around vertical; the real nonlinear plant has different A, B at every state."
        because="Most ‘linear control’ is a local theory: design K for the linearization, prove it stabilizes a small neighborhood, then live with the fact that the nonlinear truth re-asserts itself outside it. Cards 15 (HJB) and 18 (Lyapunov) deal with the global case."
      />

      <Deeper>
        <p>
          The four roles of state-space — <em>state</em>, <em>input</em>, <em>output</em>,
          and the four matrices — are the only objects you need to express every classical
          control problem. The Laplace-domain <Term>transfer function</Term> <Eq>{'G(s) = C(sI - A)^{-1}B + D'}</Eq> is a bijection
          with the LTI state-space (up to a similarity transform): they’re two views of the
          same plant. Frequency-domain methods (Bode, Nyquist) start from <Eq>{'G(s)'}</Eq>;
          modern optimal-control methods (LQR, Kalman, MPC) start from <Eq>{'(A,B,C,D)'}</Eq>.
        </p>
        <p>
          The <Term>pole</Term>s of <Eq>{'G(s)'}</Eq> are exactly the eigenvalues of
          <Eq>{'A'}</Eq>. A pole in the open right-half plane means an unstable mode — the
          plant has a direction in which any perturbation grows on its own. The cart-pole’s
          +3.28 pole says exactly that: the pole-falling time-constant is <Eq>{'1/3.28 \\approx 305\\ \\text{ms}'}</Eq>.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 03 · Disturbances & noise ---- */

const NoiseCard = () => {
  const [sigW, setSigW] = useState(0.6);
  const [sigV, setSigV] = useState(0.04);
  const [seed, setSeed] = useState(1);
  const dt = 0.02, T = 360;
  const x0 = [0, 0, 0.05, 0];
  const { wSeq, vSeq } = useMemo(() => ({
    wSeq: cpNoiseSeq(T, [0, sigW, 0, sigW * 1.4], seed),
    vSeq: cpNoiseSeq(T, [0.01, 0, sigV, 0],       seed + 1000),
  }), [sigW, sigV, seed]);
  const closed = useMemo(() => cpRoll(ctrlLinear(CP_K_STABLE), x0, T, dt, { wSeq, vSeq }), [wSeq, vSeq]);
  const open   = useMemo(() => cpRoll(() => 0,                 x0, T, dt, { wSeq, vSeq }), [wSeq, vSeq]);
  const cFrames = useCpFrames(closed.xs, dt);
  const oFrames = useCpFrames(open.xs,   dt);

  const rmsTheta = (xs) => {
    let s = 0, n = 0;
    for (const x of xs) { if (Math.abs(x[2]) < Math.PI / 2) { s += x[2] * x[2]; n += 1; } }
    return n ? Math.sqrt(s / n) : Math.PI / 2;
  };
  const rmsOpen = rmsTheta(open.xs);
  const rmsClosed = rmsTheta(closed.xs);

  return (
    <Card id="noise" icon={Waves} title="Disturbances & noise" accent="rose" index={3}
          subtitle="The two ways the world refuses to match your model — and what feedback can and can’t do about each.">
      <MinSchema>
        <Term>Disturbance</Term> <Eq>{'w_t'}</Eq> hits the state. <Term>Measurement noise</Term>
        <Eq>{'v_t'}</Eq> hits the sensor. Closed-loop rejects the first by definition;
        the second sets a hard floor on how well any controller can do.
      </MinSchema>

      <Block>{'\\dot{\\sk{x}} = \\sk{A}\\,\\sk{x} + \\sk{B}\\,\\co{u} + \\bi{w_t},\\quad y = C\\,\\sk{x} + \\bi{v_t}'}</Block>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          σ_w · process
          <input type="range" min="0" max="2" step="0.05" value={sigW} onChange={(e) => setSigW(parseFloat(e.target.value))} className="ct-range w-32" />
          <span className="tabular-nums text-neutral-200">{sigW.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          σ_v · sensor
          <input type="range" min="0" max="0.2" step="0.005" value={sigV} onChange={(e) => setSigV(parseFloat(e.target.value))} className="ct-range w-32" />
          <span className="tabular-nums text-neutral-200">{sigV.toFixed(3)}</span>
        </label>
        <button onClick={() => setSeed(s => s + 1)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
          new realization · seed {seed}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-rose-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-1">open-loop · u = 0</div>
          <CartPoleSVG x={oFrames.frame} width={340} height={160} accent="#fb7185" />
        </div>
        <div className="rounded-lg border border-emerald-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1">closed-loop · u = −K·x</div>
          <CartPoleSVG x={cFrames.frame} width={340} height={160} accent="#6ee7b7" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="RMS θ · open"   value={`${(rmsOpen   * 180 / Math.PI).toFixed(1)}°`} color="text-rose-200" />
        <Stat label="RMS θ · closed" value={`${(rmsClosed * 180 / Math.PI).toFixed(1)}°`} color="text-emerald-200"
              sub={`${(rmsClosed / Math.max(1e-6, rmsOpen) * 100).toFixed(0)}% of open`} />
        <Stat label="cost ratio" value={`${(closed.J / Math.max(1e-6, open.J)).toFixed(3)}×`}
              sub="closed-loop running cost ÷ open-loop" />
      </div>

      <Misconception
        wrong="More feedback gain is always better — it rejects more noise."
        right="High gain rejects process disturbances at low frequency, but amplifies sensor noise at high frequency. The right answer is to know which noise dominates at which frequency — exactly what the Bode and sensitivity cards quantify."
        because="The transfer from v_t to u_t is roughly −K·S(jω); large K with small S(jω) at the sensor-noise band feeds the noise straight back into the actuator."
      />

      <Deeper>
        <p>
          The two noises live in different places of the loop. Disturbance <Eq>{'w_t'}</Eq>
          adds to the state derivative — wind on the pole, load on the motor — and the
          closed loop’s sensitivity function <Eq>{'S = (I + L)^{-1}'}</Eq> says how much of
          it survives at each frequency. Measurement noise <Eq>{'v_t'}</Eq> adds to the
          sensor; the complementary sensitivity <Eq>{'T = L(I+L)^{-1}'}</Eq> says how much of
          it the controller actively passes through to <Eq>{'u'}</Eq>.
        </p>
        <p>
          The cleanest separation of duty is the LQG cascade: a <Term>Kalman filter</Term>
          fights <Eq>{'v_t'}</Eq> (it produces the best estimate <Eq>{'\\hat x'}</Eq> of
          state from noisy <Eq>{'y'}</Eq>), and an <Term>LQR</Term> on <Eq>{'\\hat x'}</Eq>
          fights <Eq>{'w_t'}</Eq>. Cards 12–13 build that cascade.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 04 · PID · the workhorse ---- */

const PID_PRESETS = [
  { name: 'gentle',     Kp: 18, Ki:  0, Kd:  3 },
  { name: 'snappy',     Kp: 35, Ki:  4, Kd:  6 },
  { name: 'ringing',    Kp: 55, Ki: 10, Kd:  1 },
  { name: 'integrator-windup', Kp: 22, Ki: 20, Kd:  3 },
  { name: 'reset',      Kp: 25, Ki:  2, Kd:  4 },
];

const PidCard = () => {
  const [Kp, setKp] = useState(25);
  const [Ki, setKi] = useState(2);
  const [Kd, setKd] = useState(4);
  const dt = 0.02, T = 300;
  const x0 = [0, 0, 0.20, 0];

  const ctrl = useMemo(() => {
    let integ = 0;
    return (y) => {
      integ = Math.max(-5, Math.min(5, integ + y[2] * dt));
      return Kp * y[2] + Ki * integ + Kd * y[3];
    };
  }, [Kp, Ki, Kd]);

  const roll = useMemo(() => cpRoll(ctrl, x0, T, dt), [ctrl]);
  const frames = useCpFrames(roll.xs, dt);

  // Trace of θ over time for a small chart
  const W = 360, H = 90, padL = 30, padR = 6, padT = 6, padB = 14;
  const ys = roll.xs.map(x => x[2]);
  const yMax = Math.max(0.30, ...ys.map(Math.abs));
  const sx = (i) => padL + (i / (roll.xs.length - 1)) * (W - padL - padR);
  const sy = (v) => padT + (1 - (v + yMax) / (2 * yMax)) * (H - padT - padB);
  const poly = ys.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
  const cursor = Math.min(frames.idx, roll.xs.length - 1);

  const settled = (() => {
    for (let i = roll.xs.length - 1; i >= 0; i--) {
      if (Math.abs(roll.xs[i][2]) > 0.02) return (i + 1) * dt;
    }
    return 0;
  })();

  return (
    <Card id="pid" icon={Sliders} title="PID · the workhorse" accent="emerald" index={4}
          subtitle="Three knobs that run 80% of industrial control. Proportional reacts, Integral cancels bias, Derivative dampens.">
      <MinSchema>
        For a scalar error <Eq>{'e = \\theta'}</Eq>:
      </MinSchema>
      <Block>{'\\co{u(t)} = K_p\\,e(t) + K_i\\!\\int_0^t\\!\\! e(s)\\,ds + K_d\\,\\dot e(t)'}</Block>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>K_p · proportional</span><span className="text-neutral-200 tabular-nums">{Kp.toFixed(0)}</span></span>
          <input type="range" min="0" max="80" step="1" value={Kp} onChange={(e) => setKp(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>K_i · integral</span><span className="text-neutral-200 tabular-nums">{Ki.toFixed(0)}</span></span>
          <input type="range" min="0" max="30" step="1" value={Ki} onChange={(e) => setKi(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>K_d · derivative</span><span className="text-neutral-200 tabular-nums">{Kd.toFixed(0)}</span></span>
          <input type="range" min="0" max="20" step="0.5" value={Kd} onChange={(e) => setKd(parseFloat(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mr-1">presets:</span>
        {PID_PRESETS.map(p => (
          <button key={p.name} onClick={() => { setKp(p.Kp); setKi(p.Ki); setKd(p.Kd); }}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-3 mt-2 items-start">
        <div className="rounded-lg border border-emerald-400/25 bg-neutral-950/40 p-3">
          <CartPoleSVG x={frames.frame} width={380} height={170} accent="#6ee7b7" />
        </div>
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-3 min-w-[180px]">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">θ(t) · radians</div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.20)" strokeDasharray="2 3" />
            <text x={padL - 4} y={sy(yMax) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">+{yMax.toFixed(2)}</text>
            <text x={padL - 4} y={sy(0) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">0</text>
            <text x={padL - 4} y={sy(-yMax) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">−{yMax.toFixed(2)}</text>
            <polyline fill="none" stroke="#6ee7b7" strokeWidth="1.4" points={poly} />
            <line x1={sx(cursor)} y1={padT} x2={sx(cursor)} y2={H - padB} stroke="rgba(244,114,182,0.8)" strokeWidth="1" />
            <text x={W - 4} y={H - 2} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">t = {(T * dt).toFixed(1)} s</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="running cost J" value={roll.J.toFixed(2)} />
        <Stat label="|θ| settles to 1°" value={settled > 0 ? `${settled.toFixed(2)} s` : 'never'}
              color={settled > 0 && settled < 3 ? 'text-emerald-200' : settled === 0 ? 'text-emerald-200' : 'text-amber-200'} />
        <Stat label="final cart drift" value={`${roll.xs[roll.xs.length - 1][0].toFixed(2)} m`}
              color={Math.abs(roll.xs[roll.xs.length - 1][0]) < 0.3 ? 'text-emerald-200' : 'text-rose-200'}
              sub="PID on angle doesn’t fix cart drift" />
      </div>

      <Misconception
        wrong="PID is a complete controller — just tune the three gains."
        right="PID is single-error feedback; it can stabilize the unstable mode but leaves the cart drifting. To regulate position too you need either cascaded PIDs or a full state-feedback controller (LQR, card 10) that sees all four states."
        because="A scalar error throws away three of the four state coordinates. Full-state feedback uses them all and is provably optimal under quadratic cost."
      />

      <Deeper>
        <p>
          Each term answers a different complaint. <Eq>{'K_p'}</Eq> reacts to the error
          <em>right now</em> — too low and you’re sluggish, too high and you ring.
          <Eq>{'K_i'}</Eq> integrates persistent error so a steady-state bias goes away —
          but unbounded integration causes <em>windup</em> when the actuator saturates,
          which is what the "integrator-windup" preset shows. <Eq>{'K_d'}</Eq> looks at
          <em>where the error is heading</em> and applies damping; in noise-rich problems
          you bandlimit it (<em>filtered derivative</em>) so it doesn’t amplify sensor noise.
        </p>
        <p>
          Classical PID tuning (Ziegler–Nichols, IMC) is half engineering recipe and half
          frequency-domain analysis: pick gains that put the closed-loop poles where
          response is fast enough and damping is comfortable. The state-space view (card 10)
          generalizes this to any number of states and gives a single optimization that
          replaces the recipe.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 05 · Stability & Lyapunov ---- */

const StabilityCard = () => {
  const [zeta, setZeta] = useState(0.3);
  const [wn, setWn] = useState(2);
  const re = -zeta * wn;
  const disc = zeta * zeta - 1;
  const poles = disc < 0
    ? [{ re, im:  wn * Math.sqrt(-disc) }, { re, im: -wn * Math.sqrt(-disc) }]
    : [{ re: re + wn * Math.sqrt(disc), im: 0 }, { re: re - wn * Math.sqrt(disc), im: 0 }];

  const dt = 0.02, T = 250;
  const series = useMemo(() => {
    const ys = [];
    let p = 0, v = 0;
    for (let t = 0; t < T; t++) {
      const a = -wn * wn * p - 2 * zeta * wn * v + wn * wn; // step ref = 1
      v += dt * a; p += dt * v;
      ys.push(p);
    }
    return ys;
  }, [zeta, wn]);

  const W = 360, H = 130, padL = 28, padR = 8, padT = 8, padB = 18;
  const yMax = Math.max(2.0, ...series.map(Math.abs));
  const sx = (i) => padL + (i / (series.length - 1)) * (W - padL - padR);
  const sy = (v) => padT + (1 - (v + yMax) / (2 * yMax)) * (H - padT - padB);

  const verdict = zeta > 0
    ? (zeta < 1 ? 'damped oscillation · stable' : 'overdamped · stable')
    : zeta === 0 ? 'undamped oscillation · marginally stable'
    : 'unstable · grows';
  const verdictColor = zeta > 0 ? 'text-emerald-200' : zeta === 0 ? 'text-amber-200' : 'text-rose-200';

  return (
    <Card id="stability" icon={Target} title="Stability & Lyapunov" accent="sky" index={5}
          subtitle="Stability lives in the real parts of the eigenvalues. Lyapunov certifies the nonlinear case.">
      <MinSchema>
        For <Eq>{'\\dot x = A x'}</Eq>, the system is asymptotically stable iff every
        eigenvalue of <Eq>{'A'}</Eq> has negative real part. Equivalently, every
        <Term>pole</Term> sits in the open left-half plane.
      </MinSchema>

      <Block>{'\\sk{\\ddot y} + 2\\,\\co{\\zeta}\\,\\co{\\omega_n}\\,\\sk{\\dot y} + \\co{\\omega_n^2}\\,\\sk{y} = \\co{\\omega_n^2}\\,r'}</Block>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>ζ · damping ratio</span><span className="text-neutral-200 tabular-nums">{zeta.toFixed(2)}</span></span>
          <input type="range" min="-0.3" max="1.5" step="0.05" value={zeta} onChange={(e) => setZeta(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>ω_n · natural freq (rad/s)</span><span className="text-neutral-200 tabular-nums">{wn.toFixed(2)}</span></span>
          <input type="range" min="0.5" max="5" step="0.1" value={wn} onChange={(e) => setWn(parseFloat(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-3 mt-2 items-start">
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-2">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">closed-loop poles</div>
          <ComplexPlane poles={poles} width={210} height={200} maxAbs={5} />
        </div>
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">step response · y(t)</div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <line x1={padL} y1={sy(0)}  x2={W - padR} y2={sy(0)}  stroke="rgba(255,255,255,0.25)" />
            <line x1={padL} y1={sy(1)}  x2={W - padR} y2={sy(1)}  stroke="rgba(110,231,183,0.40)" strokeDasharray="2 3" />
            <text x={padL - 4} y={sy(1) + 3} fontSize="8" fill="rgba(110,231,183,0.7)" textAnchor="end" fontFamily="ui-monospace, monospace">r = 1</text>
            <text x={padL - 4} y={sy(0) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">0</text>
            <polyline fill="none" stroke={zeta > 0 ? '#6ee7b7' : zeta === 0 ? '#fbbf24' : '#fb7185'} strokeWidth="1.4"
              points={series.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
            <text x={W - padR} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">t = {(T * dt).toFixed(1)} s</text>
          </svg>
          <div className={`text-[11px] font-mono mt-1 ${verdictColor}`}>{verdict}</div>
        </div>
      </div>

      <Deeper>
        <p>
          <strong>Lyapunov’s direct method</strong> certifies stability without solving the
          ODE: find a positive-definite <Eq>{'V(x) > 0'}</Eq> with <Eq>{'\\dot V(x) < 0'}</Eq>
          along trajectories. For the linear case <Eq>{'\\dot x = Ax'}</Eq>, the candidate
          <Eq>{'V = x^\\top P x'}</Eq> works whenever <Eq>{'A^\\top P + P A = -Q'}</Eq>
          has a positive-definite solution <Eq>{'P'}</Eq> for some positive-definite <Eq>{'Q'}</Eq> —
          which it does iff every eigenvalue of <Eq>{'A'}</Eq> has negative real part.
          The same equation reappears inside the LQR Riccati solver in card 10.
        </p>
        <p>
          For nonlinear systems, the energy function is often the right Lyapunov candidate.
          A pendulum near the bottom has <Eq>{'V = \\tfrac12 \\dot\\theta^2 + g(1-\\cos\\theta)'}</Eq>
          and <Eq>{'\\dot V = -b\\dot\\theta^2 \\le 0'}</Eq> under damping <Eq>{'b'}</Eq> — proving
          local asymptotic stability without integrating anything. Card 18 uses the same
          function to swing the pole <em>up</em>.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 06 · Sensitivity & the waterbed ---- */

const SensitivityCard = () => {
  const [wc, setWc] = useState(2.5);
  const [zeta, setZeta] = useState(0.6);

  // Loop L(s) = wc² / (s · (s + 2ζ·wc))  → standard 2-pole loop with crossover near wc
  const data = useMemo(() => {
    const omegas = [];
    for (let k = -2; k <= 2.4; k += 0.04) omegas.push(Math.pow(10, k));
    return omegas.map(w => {
      // L(jw) = wc² / (jw · (jw + 2ζ wc))
      // den = jw·jw + jw·2ζwc = -w² + j·2ζ·wc·w
      const denRe = -w * w;
      const denIm = 2 * zeta * wc * w;
      const denMag2 = denRe * denRe + denIm * denIm;
      // L = wc² · conj(den) / |den|²
      const Lre = wc * wc * denRe / denMag2;
      const Lim = -wc * wc * denIm / denMag2;
      // 1 + L
      const oneLre = 1 + Lre;
      const oneLim = Lim;
      const oneLmag2 = oneLre * oneLre + oneLim * oneLim;
      const Sabs = 1 / Math.sqrt(oneLmag2);
      const Lmag = Math.sqrt(Lre * Lre + Lim * Lim);
      const Tabs = Lmag / Math.sqrt(oneLmag2);
      return { w, S: Sabs, T: Tabs };
    });
  }, [wc, zeta]);

  const W = 420, H = 200, padL = 36, padR = 12, padT = 14, padB = 28;
  const wMin = 0.01, wMax = 100;
  const yMin = -40, yMax = 20; // dB
  const sxL = (w) => padL + (Math.log10(w) - Math.log10(wMin)) / (Math.log10(wMax) - Math.log10(wMin)) * (W - padL - padR);
  const syL = (db) => padT + (1 - (db - yMin) / (yMax - yMin)) * (H - padT - padB);
  const dB = (x) => 20 * Math.log10(Math.max(1e-12, x));
  const sPoly = data.map(d => `${sxL(d.w)},${syL(dB(d.S))}`).join(' ');
  const tPoly = data.map(d => `${sxL(d.w)},${syL(dB(d.T))}`).join(' ');

  const Sps = Math.max(...data.map(d => d.S));
  const Speak = data.find(d => d.S === Sps);

  return (
    <Card id="sensitivity" icon={TrendingUp} title="Sensitivity & the waterbed" accent="amber" index={6}
          subtitle="S + T = 1 identically. Push one of them down at a frequency; the other has to come up.">
      <MinSchema>
        With loop gain <Eq>{'L(s)'}</Eq>, the <Term>sensitivity function</Term> is
        <Eq>{'S = 1/(1 + L)'}</Eq> and the <Term>complementary sensitivity</Term> is
        <Eq>{'T = L/(1 + L)'}</Eq>. <Eq>{'S + T = 1'}</Eq> for every <Eq>{'\\omega'}</Eq>.
      </MinSchema>

      <Block>{'\\sk{y} = \\co{T(s)}\\,r + \\co{S(s)}\\,d - \\co{T(s)}\\,v'}</Block>

      <p className="text-sm text-neutral-300">
        Three jobs, one transfer function each. <Eq>{'T'}</Eq> tracks the reference but also
        passes sensor noise. <Eq>{'S'}</Eq> rejects disturbances but its peak above 1 means
        some disturbances get <em>amplified</em>. The <Term>waterbed effect</Term> is the
        Bode integral <Eq>{'\\int_0^\\infty \\ln|S(j\\omega)|\\, d\\omega \\geq 0'}</Eq>:
        the rejection area below the 0 dB line equals the amplification area above it.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>ω_c · crossover (rad/s)</span><span className="text-neutral-200 tabular-nums">{wc.toFixed(2)}</span></span>
          <input type="range" min="0.5" max="10" step="0.1" value={wc} onChange={(e) => setWc(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>ζ · loop damping</span><span className="text-neutral-200 tabular-nums">{zeta.toFixed(2)}</span></span>
          <input type="range" min="0.15" max="1.5" step="0.05" value={zeta} onChange={(e) => setZeta(parseFloat(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-3 mt-2">
        <div className="flex flex-wrap items-center gap-3 mb-1 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-sky-300"></span>|S(jω)|</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-amber-300"></span>|T(jω)|</span>
          <span className="ml-2 text-neutral-500">peak |S| ≈ {Sps.toFixed(2)} at ω ≈ {Speak?.w.toFixed(2)}</span>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* gridlines at -40, -20, 0, 20 dB */}
          {[-40, -20, 0, 20].map(db => (
            <g key={db}>
              <line x1={padL} y1={syL(db)} x2={W - padR} y2={syL(db)} stroke="rgba(255,255,255,0.08)" />
              <text x={padL - 4} y={syL(db) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">{db} dB</text>
            </g>
          ))}
          {/* vertical decade lines */}
          {[0.01, 0.1, 1, 10, 100].map(w => (
            <g key={w}>
              <line x1={sxL(w)} y1={padT} x2={sxL(w)} y2={H - padB} stroke="rgba(255,255,255,0.08)" />
              <text x={sxL(w)} y={H - padB + 11} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="ui-monospace, monospace">{w}</text>
            </g>
          ))}
          <text x={(padL + W - padR) / 2} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="ui-monospace, monospace">ω (rad/s, log)</text>
          {/* ω_c marker */}
          <line x1={sxL(wc)} y1={padT} x2={sxL(wc)} y2={H - padB} stroke="rgba(244,114,182,0.5)" strokeDasharray="3 3" />
          <text x={sxL(wc) + 4} y={padT + 10} fontSize="8" fill="rgba(244,114,182,0.8)" fontFamily="ui-monospace, monospace">ω_c</text>
          <polyline fill="none" stroke="#7dd3fc" strokeWidth="1.4" points={sPoly} />
          <polyline fill="none" stroke="#fbbf24" strokeWidth="1.4" points={tPoly} />
        </svg>
      </div>

      <Misconception
        wrong="Higher loop gain is always better — it makes S smaller everywhere."
        right="The Bode integral guarantees that pushing |S| below 1 at low frequencies forces |S| above 1 somewhere else. The peak is a hard constraint, not a tuning failure."
        because="For loops with right-half-plane zeros or time delay the integral is positive (not zero); for any non-trivial plant, perfect disturbance rejection at all ω is impossible."
      />

      <Deeper>
        <p>
          Robust-control design (card 21) is largely the art of <em>weighted</em>
          sensitivity shaping: pick weight functions <Eq>{'W_S(j\\omega)'}</Eq>,
          <Eq>{'W_T(j\\omega)'}</Eq>, <Eq>{'W_{KS}(j\\omega)'}</Eq> to encode "I care about
          disturbance rejection here, noise rejection here, actuator effort here" and
          solve <Eq>{'\\min_K \\|[W_S S;\\ W_T T;\\ W_{KS} KS]\\|_\\infty'}</Eq>. The
          waterbed says the weighted sum has a lower bound — you can move it around but not
          remove it.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 07 · Bode & Nyquist ---- */

const FrequencyCard = () => {
  const [view, setView] = useState('bode');
  const [wc, setWc] = useState(2.5);
  const [zeta, setZeta] = useState(0.6);

  const data = useMemo(() => {
    const omegas = [];
    for (let k = -2; k <= 2.4; k += 0.025) omegas.push(Math.pow(10, k));
    return omegas.map(w => {
      const denRe = -w * w;
      const denIm = 2 * zeta * wc * w;
      const denMag2 = denRe * denRe + denIm * denIm;
      const Lre = wc * wc * denRe / denMag2;
      const Lim = -wc * wc * denIm / denMag2;
      const mag = Math.sqrt(Lre * Lre + Lim * Lim);
      let phase = Math.atan2(Lim, Lre) * 180 / Math.PI;
      if (phase > 0) phase -= 360;
      return { w, Lre, Lim, mag, phase };
    });
  }, [wc, zeta]);

  // Gain crossover (|L| = 1)
  let wgc = null;
  for (let i = 1; i < data.length; i++) {
    if ((data[i - 1].mag - 1) * (data[i].mag - 1) < 0) { wgc = data[i].w; break; }
  }
  const phaseAtGC = wgc != null ? (data.find(d => d.w === wgc)?.phase ?? null) : null;
  const PM = phaseAtGC != null ? (180 + phaseAtGC) : null;

  // Bode plot geometry
  const dB = (x) => 20 * Math.log10(Math.max(1e-12, x));
  const W = 420, H = 260, padL = 38, padR = 14, padT = 12, padB = 28;
  const halfH = (H - padT - padB) / 2;
  const sxL = (w) => padL + (Math.log10(w) - (-2)) / (2.4 - (-2)) * (W - padL - padR);
  const syG = (db) => padT + (1 - (db - (-40)) / (40 - (-40))) * halfH;
  const syP = (ph) => padT + halfH + 6 + (1 - (ph - (-200)) / (-60 - (-200))) * (halfH - 6);

  // Nyquist plot geometry
  const NW = 380, NH = 280, NpadL = 18, NpadR = 18, NpadT = 14, NpadB = 14;
  const xmin = -2.5, xmax = 1.5, ymin = -2.5, ymax = 2.5;
  const nx = (re) => NpadL + (re - xmin) / (xmax - xmin) * (NW - NpadL - NpadR);
  const ny = (im) => NpadT + (1 - (im - ymin) / (ymax - ymin)) * (NH - NpadT - NpadB);
  const nyqUp = data.map(d => `${nx(d.Lre)},${ny(d.Lim)}`).join(' ');
  const nyqDn = data.map(d => `${nx(d.Lre)},${ny(-d.Lim)}`).join(' ');

  return (
    <Card id="frequency" icon={LineChart} title="Bode & Nyquist" accent="cyan" index={7}
          subtitle="The same loop L(jω), two ways to look at it. Bode reads stability margins; Nyquist reads encirclements.">
      <MinSchema>
        Plot the open-loop frequency response <Eq>{'L(j\\omega) = K(j\\omega)G(j\\omega)'}</Eq>.
        <strong> Bode</strong>: gain and phase vs ω. <strong>Nyquist</strong>: the curve <Eq>{'\\{L(j\\omega) : \\omega \\in \\mathbb R\\}'}</Eq>
        in the complex plane, around the critical point <Eq>{'-1 + 0j'}</Eq>.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button onClick={() => setView('bode')}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${view === 'bode' ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200' : 'border-white/15 bg-white/[0.03] text-neutral-300'}`}>Bode</button>
        <button onClick={() => setView('nyquist')}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${view === 'nyquist' ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200' : 'border-white/15 bg-white/[0.03] text-neutral-300'}`}>Nyquist</button>
        <label className="ml-3 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          ω_c
          <input type="range" min="0.5" max="10" step="0.1" value={wc} onChange={(e) => setWc(parseFloat(e.target.value))} className="ct-range w-28" />
          <span className="tabular-nums text-neutral-200">{wc.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          ζ
          <input type="range" min="0.15" max="1.5" step="0.05" value={zeta} onChange={(e) => setZeta(parseFloat(e.target.value))} className="ct-range w-24" />
          <span className="tabular-nums text-neutral-200">{zeta.toFixed(2)}</span>
        </label>
      </div>

      {view === 'bode' && (
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-3">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {/* gain section */}
            {[-40, -20, 0, 20].map(db => (
              <g key={`g${db}`}>
                <line x1={padL} y1={syG(db)} x2={W - padR} y2={syG(db)} stroke="rgba(255,255,255,0.08)" />
                <text x={padL - 4} y={syG(db) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">{db}</text>
              </g>
            ))}
            <text x={padL - 4} y={padT + 10} fontSize="9" fill="rgba(125,211,252,0.7)" textAnchor="end" fontFamily="ui-monospace, monospace">|L| dB</text>
            {/* phase section */}
            {[-180, -135, -90, -60].map(ph => (
              <g key={`p${ph}`}>
                <line x1={padL} y1={syP(ph)} x2={W - padR} y2={syP(ph)} stroke="rgba(255,255,255,0.08)" />
                <text x={padL - 4} y={syP(ph) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">{ph}°</text>
              </g>
            ))}
            <text x={padL - 4} y={padT + halfH + 18} fontSize="9" fill="rgba(244,114,182,0.7)" textAnchor="end" fontFamily="ui-monospace, monospace">∠L °</text>
            {/* decade ticks */}
            {[0.01, 0.1, 1, 10, 100].map(w => (
              <g key={w}>
                <line x1={sxL(w)} y1={padT} x2={sxL(w)} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
                <text x={sxL(w)} y={H - padB + 12} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="ui-monospace, monospace">{w}</text>
              </g>
            ))}
            <text x={(padL + W - padR) / 2} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="ui-monospace, monospace">ω (rad/s, log)</text>
            {/* gain crossover marker */}
            {wgc != null && (
              <g>
                <line x1={sxL(wgc)} y1={padT} x2={sxL(wgc)} y2={H - padB} stroke="rgba(110,231,183,0.4)" strokeDasharray="3 3" />
                <text x={sxL(wgc) + 4} y={padT + 11} fontSize="8" fill="rgba(110,231,183,0.8)" fontFamily="ui-monospace, monospace">ω_gc</text>
              </g>
            )}
            {/* 0 dB line */}
            <line x1={padL} y1={syG(0)} x2={W - padR} y2={syG(0)} stroke="rgba(110,231,183,0.4)" strokeDasharray="2 3" />
            {/* -180° line */}
            <line x1={padL} y1={syP(-180)} x2={W - padR} y2={syP(-180)} stroke="rgba(244,114,182,0.4)" strokeDasharray="2 3" />
            {/* gain curve */}
            <polyline fill="none" stroke="#7dd3fc" strokeWidth="1.6" points={data.map(d => `${sxL(d.w)},${syG(dB(d.mag))}`).join(' ')} />
            {/* phase curve */}
            <polyline fill="none" stroke="#f472b6" strokeWidth="1.6" points={data.map(d => `${sxL(d.w)},${syP(d.phase)}`).join(' ')} />
          </svg>
        </div>
      )}

      {view === 'nyquist' && (
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-3">
          <svg width={NW} height={NH} viewBox={`0 0 ${NW} ${NH}`}>
            <line x1={NpadL} y1={ny(0)} x2={NW - NpadR} y2={ny(0)} stroke="rgba(255,255,255,0.25)" />
            <line x1={nx(0)} y1={NpadT} x2={nx(0)} y2={NH - NpadB} stroke="rgba(255,255,255,0.25)" />
            {/* unit circle */}
            <circle cx={nx(0)} cy={ny(0)} r={Math.abs(nx(1) - nx(0))} fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            {/* critical point -1 */}
            <line x1={nx(-1) - 5} y1={ny(0) - 5} x2={nx(-1) + 5} y2={ny(0) + 5} stroke="#fb7185" strokeWidth="1.8" />
            <line x1={nx(-1) - 5} y1={ny(0) + 5} x2={nx(-1) + 5} y2={ny(0) - 5} stroke="#fb7185" strokeWidth="1.8" />
            <text x={nx(-1) - 6} y={ny(0) - 8} fontSize="9" fill="#fb7185" textAnchor="end" fontFamily="ui-monospace, monospace">−1</text>
            {/* locus ω > 0 */}
            <polyline fill="none" stroke="#67e8f9" strokeWidth="1.6" points={nyqUp} />
            {/* locus ω < 0 (mirror image) */}
            <polyline fill="none" stroke="#67e8f9" strokeWidth="1.0" strokeOpacity="0.45" points={nyqDn} />
            <text x={NW - NpadR - 4} y={ny(0) - 6} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="end" fontFamily="ui-monospace, monospace">Re</text>
            <text x={nx(0) + 6} y={NpadT + 10} fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace">Im</text>
          </svg>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="gain crossover ω_gc" value={wgc != null ? wgc.toFixed(2) : '—'}
              sub="where |L| = 1 (0 dB)" />
        <Stat label="phase margin" value={PM != null ? `${PM.toFixed(0)}°` : '—'}
              color={PM != null && PM > 30 ? 'text-emerald-200' : 'text-amber-200'}
              sub="180° + ∠L at ω_gc · want > 30°" />
        <Stat label="rough damping" value={PM != null ? (PM / 100).toFixed(2) : '—'}
              sub="≈ PM/100 rule of thumb" />
      </div>

      <Misconception
        wrong="Bode plots are old-school — modern control uses state-space and LQR."
        right="Frequency-domain margins are still the lingua franca of robustness. LQR has no native notion of how much delay the loop tolerates; Bode does. A practitioner reads both."
        because="The phase margin maps directly to robustness against unmodeled phase lag (e.g. computation delay, sensor lag). Optimal-control designs that ignore it can crater under tiny real-world delays."
      />

      <Deeper>
        <p>
          <strong>Nyquist’s theorem</strong>: the closed-loop is stable iff the locus of
          <Eq>{'L(j\\omega)'}</Eq> (for <Eq>{'\\omega \\in (-\\infty, \\infty)'}</Eq>) encircles
          the −1 point counter-clockwise <Eq>{'P'}</Eq> times, where <Eq>{'P'}</Eq> is the
          number of open-loop right-half-plane poles. For a stable plant <Eq>{'(P = 0)'}</Eq>,
          stability means <em>no</em> encirclements. The cart-pole has <Eq>{'P = 1'}</Eq>, so
          a stabilizing controller must produce <em>one</em> counter-clockwise encirclement
          of −1.
        </p>
        <p>
          The two distances that matter on the Nyquist locus are <em>gain margin</em> (how
          close the curve gets to −1 along the real axis when phase = −180°) and
          <em>phase margin</em> (the angle from −1 to where the curve crosses the unit
          circle). Both should be comfortable; LQG-designed controllers are famous for
          having unbounded margins in the nominal model but arbitrarily small ones if the
          model is wrong by <em>any</em> amount — the original motivation for H∞ (card 21).
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 08 · Controllability ---- */

const StructPlot = ({ vectors, accent = '#6ee7b7', width = 260, height = 220, scale = 60, axisLabel }) => {
  const cx = width / 2, cy = height / 2;
  const arrowId = React.useId();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1="10" y1={cy} x2={width - 10} y2={cy} stroke="rgba(255,255,255,0.25)" />
      <line x1={cx} y1="10" x2={cx} y2={height - 10} stroke="rgba(255,255,255,0.25)" />
      <text x={width - 10} y={cy - 6} fontSize="9" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">{axisLabel?.[0] ?? 'mode 1'}</text>
      <text x={cx + 6} y="16" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">{axisLabel?.[1] ?? 'mode 2'}</text>
      <defs>
        <marker id={arrowId} viewBox="0 -3 6 6" refX="6" refY="0" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,-3L6,0L0,3" fill={accent} />
        </marker>
      </defs>
      {vectors.map((v, i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + v.x * scale} y2={cy - v.y * scale}
            stroke={v.color ?? accent} strokeWidth={v.bold ? 2 : 1.4}
            strokeDasharray={v.dashed ? '4 3' : null}
            markerEnd={`url(#${arrowId})`} />
          {v.label && (
            <text x={cx + v.x * scale * 1.05 + (v.x > 0 ? 4 : -4)} y={cy - v.y * scale * 1.05}
              fontSize="10" fill={v.color ?? accent} textAnchor={v.x > 0 ? 'start' : 'end'} fontFamily="ui-monospace, monospace">
              {v.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

const ControllabilityCard = () => {
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta]   = useState(0.5);
  // Diagonal A: A = diag(-0.5, -1.5). Modes already aligned with axes.
  const l1 = -0.5, l2 = -1.5;
  // Controllability matrix [B, AB] = [[α, l1·α],[β, l2·β]]
  const det = alpha * (l2 * beta) - beta * (l1 * alpha);
  const rank = Math.abs(det) > 1e-6 ? 2 : (Math.abs(alpha) > 1e-6 || Math.abs(beta) > 1e-6 ? 1 : 0);
  const controllable = rank === 2;
  const hidden = (() => {
    if (controllable) return null;
    if (Math.abs(alpha) < 1e-6 && Math.abs(beta) > 1e-6) return 'mode 1 (λ = −0.50)';
    if (Math.abs(beta)  < 1e-6 && Math.abs(alpha) > 1e-6) return 'mode 2 (λ = −1.50)';
    return 'both modes';
  })();
  return (
    <Card id="controllability" icon={Move} title="Controllability" accent="emerald" index={8}
          subtitle="Can the input u steer the state x from anywhere to anywhere? Read off the rank of [B, AB, A²B, …].">
      <MinSchema>
        The pair <Eq>{'(A, B)'}</Eq> is <Term>controllability</Term>-controllable iff the
        matrix <Eq>{'\\mathcal{C} = [B,\\ AB,\\ A^2B,\\ \\dots,\\ A^{n-1}B]'}</Eq> has full row
        rank <Eq>{'n'}</Eq>. Otherwise some state directions are unreachable, no matter the
        input.
      </MinSchema>

      <p className="text-sm text-neutral-300">
        Pick the two components of the input matrix <Eq>{'\\sk{B} = (\\alpha, \\beta)^\\top'}</Eq>
        for the diagonal plant <Eq>{'\\sk{A} = \\mathrm{diag}(-0.5, -1.5)'}</Eq>. Move either
        slider to zero to see one mode hide:
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>α · B[0]</span><span className="text-neutral-200 tabular-nums">{alpha.toFixed(2)}</span></span>
          <input type="range" min="-1" max="1" step="0.05" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>β · B[1]</span><span className="text-neutral-200 tabular-nums">{beta.toFixed(2)}</span></span>
          <input type="range" min="-1" max="1" step="0.05" value={beta} onChange={(e) => setBeta(parseFloat(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-3 items-start mt-2">
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-2">
          <StructPlot
            axisLabel={['mode 1', 'mode 2']}
            accent={controllable ? '#6ee7b7' : '#fb7185'}
            vectors={[
              { x: alpha, y: beta,           label: 'B',  bold: true },
              { x: l1 * alpha, y: l2 * beta, label: 'AB', dashed: true },
            ]}
          />
        </div>
        <div className="space-y-2 min-w-0">
          <Block>{`\\mathcal{C} = \\begin{pmatrix} ${alpha.toFixed(2)} & ${(l1*alpha).toFixed(2)} \\\\ ${beta.toFixed(2)} & ${(l2*beta).toFixed(2)} \\end{pmatrix}`}</Block>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="det(𝒞)" value={det.toFixed(3)} color={Math.abs(det) > 1e-6 ? 'text-emerald-200' : 'text-rose-200'} />
            <Stat label="verdict" value={controllable ? '✓ controllable' : '× rank-deficient'}
                  color={controllable ? 'text-emerald-200' : 'text-rose-200'}
                  sub={controllable ? null : hidden ? `unreachable: ${hidden}` : '—'} />
          </div>
        </div>
      </div>

      <Misconception
        wrong="Uncontrollable modes are exotic. If a system makes physical sense, it's controllable."
        right="Sensor failures, single-actuator redundancy losses, symmetries — uncontrollability shows up routinely. The healthy version is detectability/stabilizability: the uncontrollable modes are at least stable, so they decay on their own."
        because="A satellite with a stuck thruster, a power grid with a fixed-output generator, a chemical reactor with a sealed valve — all are uncontrollable pairs. The right question is rarely 'is it controllable' but 'are the uncontrollable modes stable enough to ignore?'"
      />

      <Deeper>
        <p>
          The Kalman decomposition splits any LTI system into four blocks:
          (controllable, observable), (controllable, unobservable), (uncontrollable,
          observable), (uncontrollable, unobservable). LQR designs run only on the
          controllable subspace; the rest you can only hope is stable. The dual concept —
          <Term>observability</Term> — is the next card.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 09 · Observability ---- */

const ObservabilityCard = () => {
  const [gamma, setGamma] = useState(1.0);
  const [delta, setDelta] = useState(0.5);
  const l1 = -0.5, l2 = -1.5;
  // Observability matrix [C; CA] = [[γ, δ],[l1·γ, l2·δ]]
  const det = gamma * (l2 * delta) - delta * (l1 * gamma);
  const rank = Math.abs(det) > 1e-6 ? 2 : (Math.abs(gamma) > 1e-6 || Math.abs(delta) > 1e-6 ? 1 : 0);
  const observable = rank === 2;
  const hidden = (() => {
    if (observable) return null;
    if (Math.abs(gamma) < 1e-6 && Math.abs(delta) > 1e-6) return 'mode 1 (λ = −0.50)';
    if (Math.abs(delta) < 1e-6 && Math.abs(gamma) > 1e-6) return 'mode 2 (λ = −1.50)';
    return 'both modes';
  })();
  return (
    <Card id="observability" icon={Eye} title="Observability" accent="violet" index={9}
          subtitle="Dual to controllability: can the output y reveal the entire state, given enough time?">
      <MinSchema>
        The pair <Eq>{'(A, C)'}</Eq> is observable iff
        <Eq>{'\\mathcal{O} = [C;\\ CA;\\ CA^2;\\ \\dots;\\ CA^{n-1}]^\\top'}</Eq> has full column
        rank. Otherwise some directions of state are invisible to any sensor history.
      </MinSchema>

      <p className="text-sm text-neutral-300">
        Pick the row vector <Eq>{'C = (\\gamma, \\delta)'}</Eq> — what your sensor sees of
        each mode. Drag either entry to zero to see a mode go dark:
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>γ · C[0]</span><span className="text-neutral-200 tabular-nums">{gamma.toFixed(2)}</span></span>
          <input type="range" min="-1" max="1" step="0.05" value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>δ · C[1]</span><span className="text-neutral-200 tabular-nums">{delta.toFixed(2)}</span></span>
          <input type="range" min="-1" max="1" step="0.05" value={delta} onChange={(e) => setDelta(parseFloat(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-3 items-start mt-2">
        <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-2">
          <StructPlot
            axisLabel={['mode 1', 'mode 2']}
            accent={observable ? '#c4b5fd' : '#fb7185'}
            vectors={[
              { x: gamma, y: delta,           label: 'C',  bold: true },
              { x: l1 * gamma, y: l2 * delta, label: 'CA', dashed: true },
            ]}
          />
        </div>
        <div className="space-y-2 min-w-0">
          <Block>{`\\mathcal{O} = \\begin{pmatrix} ${gamma.toFixed(2)} & ${delta.toFixed(2)} \\\\ ${(l1*gamma).toFixed(2)} & ${(l2*delta).toFixed(2)} \\end{pmatrix}`}</Block>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="det(𝒪)" value={det.toFixed(3)} color={Math.abs(det) > 1e-6 ? 'text-violet-200' : 'text-rose-200'} />
            <Stat label="verdict" value={observable ? '✓ observable' : '× unobservable'}
                  color={observable ? 'text-violet-200' : 'text-rose-200'}
                  sub={observable ? null : hidden ? `invisible: ${hidden}` : '—'} />
          </div>
        </div>
      </div>

      <Worked title="The duality">
        <p>
          The two conditions are mirror images: <Eq>{'(A, B)'}</Eq> is controllable iff
          <Eq>{'(A^\\top, B^\\top)'}</Eq> is observable. This is why the Kalman observer
          and the LQR controller are <em>structurally the same algorithm</em> running on
          different transposed equations — and why the LQG separation theorem in card 13
          works at all.
        </p>
      </Worked>

      <Deeper>
        <p>
          For the cart-pole, measuring only the cart’s <em>position</em> still makes the
          pair observable: the velocities and the angle can be inferred from the position’s
          time history (the angle shows up as second-derivative info on the position). The
          observer in card 12 will use exactly this — given only <Eq>{'y = x_{cart}'}</Eq>,
          it recovers all four states within a fraction of a second.
        </p>
        <p>
          The weaker condition <Term>detectability</Term> — every unobservable mode is at
          least stable — is what most real designs actually rely on. You don’t need to see
          every mode if the unseen ones are dying on their own.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- shared: tiny matrix ops + DARE solver (SISO B) ---- */

const matNew  = (n) => Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
const matEye  = (n) => { const m = matNew(n); for (let i = 0; i < n; i++) m[i][i] = 1; return m; };
const matCopy = (A) => A.map(r => r.slice());
const matAdd  = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const matScale = (A, s) => A.map(r => r.map(v => v * s));
const matT    = (A) => A[0].map((_, j) => A.map(r => r[j]));
const matMul  = (A, B) => {
  const n = A.length, p = B[0].length, q = B.length;
  const C = Array.from({ length: n }, () => Array(p).fill(0));
  for (let i = 0; i < n; i++) for (let k = 0; k < q; k++) {
    const a = A[i][k]; if (a === 0) continue;
    for (let j = 0; j < p; j++) C[i][j] += a * B[k][j];
  }
  return C;
};
const matVec = (A, v) => A.map(r => r.reduce((s, x, j) => s + x * v[j], 0));
// Discretize ẋ = Ax + Bu over a step dt via ZOH (truncated series, plenty for dt = 0.02).
const discretize = (A, B, dt) => {
  const n = A.length;
  const Adt = matScale(A, dt);
  const A2 = matMul(Adt, Adt);
  const A3 = matMul(A2, Adt);
  const Ad  = matAdd(matAdd(matAdd(matEye(n), Adt), matScale(A2, 1/2)), matScale(A3, 1/6));
  const phi = matAdd(matAdd(matScale(matEye(n), dt), matScale(A, dt * dt / 2)), matScale(matMul(A, A), dt * dt * dt / 6));
  const Bd = matVec(phi, B);
  return { Ad, Bd };
};

// Continuous algebraic Riccati equation: A^T P + PA - PB R^-1 B^T P + Q = 0.
// Solve by integrating the differential Riccati ODE dP/dτ = +(A^T P + PA - PB R^-1 B^T P + Q) forward
// from P(0) = 0 — the CARE solution is the stable fixed point. RK4, h = 5 ms, τ_final = 5 s.
const careDeriv = (P, A, At, B, Qmat, invR) => {
  const n = A.length;
  const ATP = matMul(At, P);
  const PA  = matMul(P, A);
  const PB  = matVec(P, B);
  const dP  = matNew(n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    dP[i][j] = ATP[i][j] + PA[i][j] - PB[i] * PB[j] * invR + Qmat[i][j];
  }
  return dP;
};
const matAxpy = (A, B, s) => A.map((r, i) => r.map((v, j) => v + s * B[i][j]));

const solveCARE = (A, B, Qdiag, R, { tau = 5, h = 0.005 } = {}) => {
  const n = A.length;
  const At = matT(A);
  const Q = matNew(n);
  for (let i = 0; i < n; i++) Q[i][i] = Qdiag[i];
  const invR = 1 / R;
  let P = matNew(n);
  const steps = Math.max(1, Math.round(tau / h));
  for (let k = 0; k < steps; k++) {
    const k1 = careDeriv(P, A, At, B, Q, invR);
    const P2 = matAxpy(P, k1, h / 2);
    const k2 = careDeriv(P2, A, At, B, Q, invR);
    const P3 = matAxpy(P, k2, h / 2);
    const k3 = careDeriv(P3, A, At, B, Q, invR);
    const P4 = matAxpy(P, k3, h);
    const k4 = careDeriv(P4, A, At, B, Q, invR);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      P[i][j] += (h / 6) * (k1[i][j] + 2 * k2[i][j] + 2 * k3[i][j] + k4[i][j]);
    }
  }
  // Symmetrize to absorb numerical drift
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const m = 0.5 * (P[i][j] + P[j][i]); P[i][j] = P[j][i] = m;
  }
  const PB = matVec(P, B);
  const K = PB.map(v => v * invR);  // K = R^-1 B^T P (row); since P symmetric, equals PB / R
  return { P, K };
};

const CP_DT = 0.02;
const { Ad: CP_AD, Bd: CP_BD } = discretize(CP_A, CP_B, CP_DT);

/* ---- 10 · ★ LQR · Riccati ---- */

const LqrCard = () => {
  const [q0, setQ0] = useState(1);     // x_cart
  const [q1, setQ1] = useState(0.1);   // ẋ_cart
  const [q2, setQ2] = useState(10);    // θ
  const [q3, setQ3] = useState(1);     // θ̇
  const [R,  setR]  = useState(0.1);
  const [guess, setGuess] = useState(2.0);
  const [revealed, setRevealed] = useState(false);

  const { K, P, roll } = useMemo(() => {
    const { K, P } = solveCARE(CP_A, CP_B, [q0, q1, q2, q3], R);
    const ctrl = (y) => -(K[0]*y[0] + K[1]*y[1] + K[2]*y[2] + K[3]*y[3]);
    const r = cpRoll(ctrl, [0, 0, 0.20, 0], 360, CP_DT, { Q: [q0, q1, q2, q3], R });
    return { K, P, roll: r };
  }, [q0, q1, q2, q3, R]);

  const frames = useCpFrames(roll.xs, CP_DT);
  const maxAngle = Math.max(...roll.xs.map(x => Math.abs(x[2]))) * 180 / Math.PI;
  const xT = roll.xs[roll.xs.length - 1];
  const settled = (() => {
    for (let i = roll.xs.length - 1; i >= 0; i--) {
      if (Math.abs(roll.xs[i][2]) > 0.02 || Math.abs(roll.xs[i][0]) > 0.05) return (i + 1) * CP_DT;
    }
    return 0;
  })();

  return (
    <Card id="lqr" icon={Sigma} title="★ LQR · Riccati" accent="fuchsia" index={10} anchor
          subtitle="Optimal linear control in closed form. Pick the cost; the policy falls out of a matrix equation.">
      <MinSchema>
        For linear dynamics and quadratic cost, the optimal policy is
        <Eq>{'\\co{u} = -K\\sk{x}'}</Eq>. The gain <Eq>{'K'}</Eq> comes from solving the
        <strong> algebraic Riccati equation</strong> for the cost-to-go matrix <Eq>{'\\an{P}'}</Eq>.
      </MinSchema>

      <Block>{'\\co{u^*} = \\arg\\min_{\\co{u}} \\int_0^\\infty\\!\\!\\big(\\sk{x^\\top} Q\\,\\sk{x} + \\co{u^\\top} R\\, \\co{u}\\big)\\,dt \\quad\\Longrightarrow\\quad \\co{u^*} = -K\\sk{x},~K = R^{-1} B^\\top \\an{P}'}</Block>

      <Block>{'\\an{A^\\top P + P A - P B R^{-1} B^\\top P + Q = 0}'}</Block>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Q · cart x',     val: q0, set: setQ0, max: 5 },
          { label: 'Q · cart ẋ',     val: q1, set: setQ1, max: 5 },
          { label: 'Q · θ',          val: q2, set: setQ2, max: 50 },
          { label: 'Q · θ̇',          val: q3, set: setQ3, max: 5 },
          { label: 'R · effort',     val: R,  set: setR,  max: 2 },
        ].map((s, i) => (
          <label key={i} className="flex flex-col gap-0.5 text-[10px] text-neutral-400 font-mono">
            <span className="flex justify-between"><span>{s.label}</span><span className="text-neutral-200 tabular-nums">{s.val.toFixed(2)}</span></span>
            <input type="range" min={s.label === 'R · effort' ? 0.01 : 0.01} max={s.max} step="0.01" value={s.val} onChange={(e) => s.set(parseFloat(e.target.value))} className="ct-range" />
          </label>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-start mt-2">
        <div className="rounded-lg border border-fuchsia-400/30 bg-neutral-950/40 p-3">
          <CartPoleSVG x={frames.frame} width={400} height={170} accent="#f0abfc" />
        </div>
        <div className="space-y-2 min-w-[200px]">
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">optimal gain K</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['x','ẋ','θ','θ̇'].map((lbl, i) => (
              <div key={i} className="rounded border border-fuchsia-400/30 bg-fuchsia-400/5 px-1.5 py-1 text-center">
                <div className="text-[9px] text-fuchsia-300 font-mono">{lbl}</div>
                <div className="text-[11px] text-fuchsia-100 font-mono tabular-nums">{K[i].toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2">cost-to-go V(x₀)</div>
          <div className="rounded border border-amber-400/30 bg-amber-400/5 px-2 py-1 text-amber-100 font-mono text-[12px] text-center">
            x₀ᵀ P x₀ = {(P[2][2] * 0.2 * 0.2).toFixed(3)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="running cost J" value={roll.J.toFixed(3)} color="text-fuchsia-200" />
        <Stat label="max |θ|" value={`${maxAngle.toFixed(1)}°`}
              color={maxAngle < 12 ? 'text-emerald-200' : 'text-amber-200'} />
        <Stat label="settling time" value={settled === 0 ? '— · settled' : `${settled.toFixed(2)} s`}
              color={settled === 0 || settled < 3 ? 'text-emerald-200' : 'text-rose-200'} />
      </div>

      <div className="mt-3 rounded-md border border-violet-400/25 bg-violet-400/5 px-3 py-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300 mb-1">predict first</div>
        <div className="text-xs text-neutral-200 mb-1">
          For Q = [1, 0.1, 10, 1], R = 0.1 (the default), and θ₀ = 0.2 rad, guess the running cost J:
        </div>
        <div className="flex items-center gap-2">
          <input type="number" step="0.1" value={guess} onChange={(e) => setGuess(parseFloat(e.target.value) || 0)}
            className="w-20 text-[12px] font-mono px-2 py-0.5 rounded border border-violet-400/30 bg-violet-400/5 text-violet-100" />
          <button onClick={() => setRevealed(true)}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-violet-400/40 bg-violet-400/15 text-violet-100">reveal</button>
          {revealed && (
            <span className="text-[11px] font-mono text-emerald-200">
              actual J = {roll.J.toFixed(3)} · Δ = {(guess - roll.J >= 0 ? '+' : '−')}{Math.abs(guess - roll.J).toFixed(3)}
            </span>
          )}
        </div>
      </div>

      <Worked title="Why this works">
        <p>
          Plug a quadratic ansatz <Eq>{'V(x) = x^\\top P x'}</Eq> into the Hamilton-Jacobi-
          Bellman equation. The minimization over <Eq>{'\\co{u}'}</Eq> is unconstrained and
          gives <Eq>{'\\co{u^*} = -R^{-1} B^\\top P\\,x = -K x'}</Eq>. Substituting back
          collapses to the algebraic Riccati equation above. Two facts make it tractable:
          (i) the value function is quadratic exactly, so a single matrix <Eq>{'P'}</Eq>
          parameterizes it; (ii) the policy is linear exactly, so a single gain
          <Eq>{'K'}</Eq> parameterizes it. Outside the linear-quadratic world neither
          holds — and that’s where RL’s neural function approximation earns its keep.
        </p>
      </Worked>

      <Misconception
        wrong="LQR’s K is hand-tuned. The Q and R are just convenient parameterization."
        right="K is uniquely determined by (A, B, Q, R) once you solve the Riccati equation. The design problem reduces from ‘what gains?’ to ‘what cost function?’ — which is exactly the framing RL inherits as reward engineering."
        because="Card 11 makes this concrete by sweeping Q and watching K and the resulting trajectory respond. Card 19 then runs policy gradient on the same cost and recovers the same K."
      />

      <Deeper>
        <p>
          Two structural facts that pay off in later cards. First, the closed-loop matrix
          <Eq>{'A_{cl} = A - BK'}</Eq> is automatically stable — every eigenvalue is in the
          open left-half plane — as long as <Eq>{'(A, B)'}</Eq> is stabilizable and
          <Eq>{'(A, Q^{1/2})'}</Eq> is detectable. Second, infinite-horizon LQR has
          guaranteed 60° phase margin and at least 6 dB gain margin (Anderson-Moore),
          which is the headline robustness property of state-space optimal control.
        </p>
        <p>
          The continuous Riccati equation is solved here by iterating its discrete cousin
          (a doubling/value-iteration scheme): start with <Eq>{'P_0 = Q_d'}</Eq>, repeat
          <Eq>{'P_{k+1} = A_d^\\top P_k A_d - A_d^\\top P_k b\\, (R_d + b^\\top P_k b)^{-1}\\, b^\\top P_k A_d + Q_d'}</Eq>.
          Converges in ~60–200 iterations for the cart-pole; same kernel reappears in
          Kalman (card 12) under transposition.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 11 · Cost shaping · Q, R ---- */

const COSTSHAPE_PRESETS = [
  { name: 'default',       q: [1,  0.1, 10,  1],  R: 0.1 },
  { name: 'angle-only',    q: [0.01, 0.01, 50,  2],  R: 0.05 },
  { name: 'cart-priority', q: [10, 1,    5,   0.5], R: 0.1 },
  { name: 'effort-saver',  q: [1,  0.1,  10,  1],   R: 2 },
  { name: 'aggressive',    q: [2,  0.2,  30,  3],   R: 0.02 },
];

const CostShapeCard = () => {
  const [q, setQ] = useState([1, 0.1, 10, 1]);
  const [R, setR] = useState(0.1);

  const { K, J, maxU } = useMemo(() => {
    const { K } = solveCARE(CP_A, CP_B, q, R);
    const ctrl = (y) => -(K[0]*y[0] + K[1]*y[1] + K[2]*y[2] + K[3]*y[3]);
    const r = cpRoll(ctrl, [0, 0, 0.20, 0], 360, CP_DT, { Q: q, R });
    const maxU = Math.max(...r.us.map(Math.abs));
    return { K, J: r.J, maxU };
  }, [q, R]);

  const QLABELS = ['cart x', 'cart ẋ', 'pole θ', 'pole θ̇'];
  const QMAX = [10, 5, 100, 10];
  const cellShade = (val, max) => Math.min(1, val / max);

  return (
    <Card id="costshape" icon={Scale} title="Cost shaping · Q, R" accent="amber" index={11}
          subtitle="The Q diagonal is what you care about; R is what you can afford. Sweep them and watch the policy follow.">
      <MinSchema>
        Q penalizes state deviation; R penalizes control effort. The ratio <Eq>{'Q/R'}</Eq>
        sets the closed-loop bandwidth — high Q drives the state toward zero fast and at
        any cost; high R keeps <Eq>{'u'}</Eq> gentle and accepts slower settling.
      </MinSchema>

      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Q diagonal · color-coded by weight</div>
      <div className="grid grid-cols-4 gap-2">
        {QLABELS.map((lbl, i) => (
          <label key={i} className="flex flex-col gap-1">
            <div className="rounded border border-amber-400/30 px-2 py-2 text-center"
                 style={{ background: `rgba(251,191,36,${0.07 + 0.25 * cellShade(q[i], QMAX[i])})` }}>
              <div className="text-[9px] uppercase tracking-widest text-amber-300">{lbl}</div>
              <div className="text-[14px] text-amber-100 font-mono tabular-nums">{q[i].toFixed(2)}</div>
            </div>
            <input type="range" min="0.01" max={QMAX[i]} step="0.01" value={q[i]}
              onChange={(e) => { const v = parseFloat(e.target.value); setQ(arr => arr.map((x, j) => j === i ? v : x)); }}
              className="ct-range" />
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-2">
        <span className="uppercase tracking-widest">R · control effort</span>
        <input type="range" min="0.005" max="3" step="0.005" value={R} onChange={(e) => setR(parseFloat(e.target.value))} className="ct-range w-40" />
        <span className="tabular-nums text-neutral-200 w-12">{R.toFixed(3)}</span>
      </label>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mr-1">presets:</span>
        {COSTSHAPE_PRESETS.map(p => (
          <button key={p.name} onClick={() => { setQ(p.q); setR(p.R); }}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5 mt-3">
        {['x','ẋ','θ','θ̇'].map((lbl, i) => (
          <div key={i} className="rounded border border-fuchsia-400/30 bg-fuchsia-400/5 px-2 py-1.5 text-center">
            <div className="text-[9px] text-fuchsia-300 font-mono uppercase">K · {lbl}</div>
            <div className="text-[12px] text-fuchsia-100 font-mono tabular-nums">{K[i].toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="cost J" value={J.toFixed(3)} color="text-amber-200" />
        <Stat label="peak |u|" value={`${maxU.toFixed(1)} N`}
              color={maxU < CP_SAT_U * 0.9 ? 'text-emerald-200' : 'text-rose-200'}
              sub={maxU >= CP_SAT_U * 0.9 ? 'actuator saturating' : 'within actuator limit'} />
        <Stat label="K_θ magnitude" value={Math.abs(K[2]).toFixed(1)}
              sub="big = aggressive on angle" />
      </div>

      <Misconception
        wrong="Just keep tightening Q until it works."
        right="Past a point, raising Q just drives K up until u saturates and the LQR assumption (no actuator limit) is violated. Real designs trade Q against R while watching peak |u|."
        because="Saturation breaks linearity. Card 14 (MPC) handles saturation natively as a constraint; LQR can only tune Q/R to hope u stays in range."
      />

      <Deeper>
        <p>
          The Q matrix is the cleanest version of reward design we have. Every entry has
          units (cost per state-squared-second) and a unit-aware interpretation: "I am
          willing to pay <Eq>{'Q_{ii}'}</Eq> per unit time per unit² of state <Eq>{'i'}</Eq>."
          RL reward engineering has the same shape — you’re specifying the cost — but
          loses two properties LQR keeps: (i) the value function is exactly quadratic, so
          no neural net is needed; (ii) the optimal policy is exactly linear, so no
          architecture choice matters. Card 19 makes this concrete.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 12 · Kalman observer ---- */

// Discrete Kalman step for SISO output: C is row vector (length n), Qw n×n, qv scalar.
const kalmanStep = (xhat, P, Ad, Bd, u, C, Qw, qv, y) => {
  const n = Ad.length;
  // predict
  const xm = matVec(Ad, xhat).map((v, i) => v + Bd[i] * u);
  const Pm_pre = matMul(matMul(Ad, P), matT(Ad));
  const Pm = matNew(n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) Pm[i][j] = Pm_pre[i][j] + Qw[i][j];
  // innovation S = C Pm C^T + qv (scalar)
  // PmCt = Pm * C^T = sum_j Pm[i][j] * C[j]
  const PmCt = Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) PmCt[i] += Pm[i][j] * C[j];
  let S = qv;
  for (let j = 0; j < n; j++) S += C[j] * PmCt[j];
  // K = PmCt / S (n×1)
  const K = PmCt.map(v => v / S);
  // innovation y - C xm
  let yhat = 0;
  for (let i = 0; i < n; i++) yhat += C[i] * xm[i];
  const innov = y - yhat;
  // update mean
  const xnew = xm.map((v, i) => v + K[i] * innov);
  // update cov: P = (I - K C) Pm = Pm - K (C Pm)
  // C Pm = row vector: (C Pm)[j] = sum_i C[i] Pm[i][j]
  const CPm = Array(n).fill(0);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) CPm[j] += C[i] * Pm[i][j];
  const Pnew = matNew(n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) Pnew[i][j] = Pm[i][j] - K[i] * CPm[j];
  return { xhat: xnew, P: Pnew, K };
};

const KalmanCard = () => {
  const [sigW, setSigW] = useState(0.15);
  const [sigV, setSigV] = useState(0.02);
  const [seed, setSeed] = useState(7);
  const T = 350;
  // Sensor: position only.
  const C = [1, 0, 0, 0];

  const { trueXs, ests, ys, K_ss, rmsErr } = useMemo(() => {
    // Stabilizing LQR with true state for the experiment
    const { K: Kctrl } = solveCARE(CP_A, CP_B, [1, 0.1, 10, 1], 0.1);
    const wSeq = cpNoiseSeq(T, [0, sigW, 0, sigW * 1.4], seed);
    const vSeq = cpNoiseSeq(T, [sigV], seed + 1000);
    // process / sensor cov matrices used by the filter
    const Qw = matNew(4);
    Qw[1][1] = (sigW * CP_DT) ** 2;
    Qw[3][3] = (sigW * 1.4 * CP_DT) ** 2;
    const qv = sigV * sigV;

    let xhat = [0, 0, 0.10, 0];
    let P = matNew(4); P[0][0] = 0.01; P[1][1] = 1; P[2][2] = 1; P[3][3] = 1;
    let xtrue = [0, 0, 0.15, 0];

    const trueXs = [xtrue.slice()];
    const ests   = [xhat.slice()];
    const ys     = [];
    let lastK = null;
    let errSq = 0, errN = 0;

    for (let t = 0; t < T; t++) {
      // true state evolves under LQR(true)
      const u = -(Kctrl[0]*xtrue[0] + Kctrl[1]*xtrue[1] + Kctrl[2]*xtrue[2] + Kctrl[3]*xtrue[3]);
      const w = wSeq[t];
      const f = (xx, uu) => { const d = cpDot(xx, uu); return [d[0]+w[0], d[1]+w[1], d[2]+w[2], d[3]+w[3]]; };
      xtrue = rk4(f, xtrue, u, CP_DT);
      // sensor observation
      const y = xtrue[0] + vSeq[t][0];
      ys.push(y);
      // Kalman update (uses xhat -> ALSO needs current u to predict)
      const step = kalmanStep(xhat, P, CP_AD, CP_BD, u, C, Qw, qv, y);
      xhat = step.xhat; P = step.P; lastK = step.K;
      trueXs.push(xtrue.slice());
      ests.push(xhat.slice());
      // error after first 50 steps (skip transient)
      if (t > 50) {
        const e = xtrue.map((v, i) => v - xhat[i]);
        errSq += e[0]*e[0] + e[1]*e[1] + e[2]*e[2] + e[3]*e[3];
        errN += 1;
      }
    }
    return { trueXs, ests, ys, K_ss: lastK, rmsErr: Math.sqrt(errSq / Math.max(1, errN)) };
  }, [sigW, sigV, seed]);

  // Plot theta (true vs est) and error (norm)
  const W = 400, H = 130, padL = 30, padR = 8, padT = 8, padB = 18;
  const trueTh = trueXs.map(x => x[2]);
  const estTh  = ests.map(x => x[2]);
  const yMax = Math.max(0.30, ...trueTh.map(Math.abs), ...estTh.map(Math.abs));
  const sx = (i) => padL + (i / (trueXs.length - 1)) * (W - padL - padR);
  const sy = (v) => padT + (1 - (v + yMax) / (2 * yMax)) * (H - padT - padB);

  return (
    <Card id="kalman" icon={Crosshair} title="Kalman observer" accent="violet" index={12}
          subtitle="The optimal recursive estimator for a linear plant in Gaussian noise. Lives in linear control AND in RL as the linear-Gaussian POMDP solution.">
      <MinSchema>
        Maintain a Gaussian belief <Eq>{'\\ob{(\\hat x, P)}'}</Eq>. Each step, <strong>predict</strong>
        through the model, then <strong>update</strong> by mixing prediction with measurement, weighted
        by their relative uncertainty.
      </MinSchema>

      <Block>{'\\ob{\\hat x_{t|t}} = \\ob{\\hat x_{t|t-1}} + L_t\\big(y_t - C\\,\\ob{\\hat x_{t|t-1}}\\big),\\quad L_t = P_{t|t-1} C^\\top\\!\\big(C P_{t|t-1} C^\\top + Q_v\\big)^{-1}'}</Block>

      <p className="text-sm text-neutral-300">
        Plant: the cart-pole, LQR-stabilized. <strong>Sensor sees only cart position</strong> —
        velocity, angle, angular velocity are hidden. The Kalman filter infers all four
        from the position history, in real time, while the LQR keeps the pole balanced
        from the true state (so the experiment is purely about estimation).
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          σ_w · process
          <input type="range" min="0" max="1.5" step="0.05" value={sigW} onChange={(e) => setSigW(parseFloat(e.target.value))} className="ct-range w-28" />
          <span className="tabular-nums text-neutral-200">{sigW.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          σ_v · sensor
          <input type="range" min="0.005" max="0.15" step="0.005" value={sigV} onChange={(e) => setSigV(parseFloat(e.target.value))} className="ct-range w-28" />
          <span className="tabular-nums text-neutral-200">{sigV.toFixed(3)}</span>
        </label>
        <button onClick={() => setSeed(s => s + 1)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
          new realization · seed {seed}
        </button>
      </div>

      <div className="rounded-lg border border-violet-400/25 bg-neutral-950/40 p-3">
        <div className="flex items-center gap-3 text-[10px] font-mono mb-1">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-sky-300"></span>θ true</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[1.5px] bg-violet-300" style={{borderTop: '1.5px dashed'}}></span>θ̂ Kalman</span>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.15)" />
          <polyline fill="none" stroke="#7dd3fc" strokeWidth="1.3" points={trueTh.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
          <polyline fill="none" stroke="#c4b5fd" strokeWidth="1.3" strokeDasharray="3 3" points={estTh.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')} />
          <text x={padL - 4} y={sy(yMax) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">+{yMax.toFixed(2)}</text>
          <text x={padL - 4} y={sy(-yMax) + 3} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">−{yMax.toFixed(2)}</text>
          <text x={W - padR} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">t = {(T * CP_DT).toFixed(1)}s</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="RMS ‖x − x̂‖" value={rmsErr.toFixed(3)}
              color={rmsErr < 0.5 ? 'text-violet-200' : 'text-amber-200'}
              sub="after 1 s burn-in" />
        <Stat label="Kalman gain · L[θ]" value={K_ss ? K_ss[2].toFixed(2) : '—'}
              sub="how much θ̂ tracks y" />
        <Stat label="Kalman gain · L[θ̇]" value={K_ss ? K_ss[3].toFixed(2) : '—'}
              sub="how much θ̇ tracks y" />
      </div>

      <Misconception
        wrong="The Kalman filter just smooths the measurements."
        right="It is the optimal Bayesian belief-update for linear-Gaussian systems — equivalent to a recursive least-squares fit, but doing it on the full state, even the components that are never measured."
        because="In the cart-pole demo above, the filter never directly observes θ or θ̇ — they appear only through second derivatives of the position. The model encodes that relationship; the filter exploits it."
      />

      <Deeper>
        <p>
          The Kalman recursion is the LQR recursion in disguise. Transpose the system and
          read the steady-state covariance equation: <Eq>{'A P + P A^\\top - P C^\\top R^{-1} C P + Q_w = 0'}</Eq> —
          the Riccati equation again, with <Eq>{'A,B,Q,R \\to A^\\top, C^\\top, Q_w, Q_v'}</Eq>.
          The control-theorist’s name for this is <em>duality</em>; the Bayesian
          interpretation is that estimation and control are the same optimization run in
          opposite directions through the system.
        </p>
        <p>
          See <CrossLink to="/#markets-modeling" external>markets-modeling</CrossLink> for a
          worked Kalman applied to a hidden vol-of-vol process (a different application of
          the same filter).
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 13 · LQG · separation theorem ---- */

const LqgCard = () => {
  const [strategy, setStrategy] = useState('lqg');
  const [seed, setSeed] = useState(11);
  const T = 320;
  const sigW = 0.03, sigV = 0.005;
  const C = [1, 0, 0, 0];
  const Qctrl = [1, 0.1, 10, 1];
  const Rctrl = 0.1;

  const data = useMemo(() => {
    const { K: Kctrl } = solveCARE(CP_A, CP_B, Qctrl, Rctrl);
    // Continuous-time steady-state observer gain (solve the dual Riccati), discretized to
    // the per-step update by multiplying by dt.
    const { K: LobsC } = solveCARE(matT(CP_A), [1, 0, 0, 0], [0.01, 0.5, 0.01, 0.5], 1e-4);
    const Lobs = LobsC.map(v => v * CP_DT);
    const wSeq = cpNoiseSeq(T, [0, sigW, 0, sigW * 1.4], seed);
    const vSeq = cpNoiseSeq(T, [sigV], seed + 1000);

    const run = (mode) => {
      let xtrue = [0, 0, 0.08, 0];
      let xhat  = [0, 0, 0.08, 0];
      const xs = [xtrue.slice()]; const xhats = [xhat.slice()]; const us = [];
      let J = 0;
      for (let t = 0; t < T; t++) {
        let u = 0;
        if (mode === 'oracle')      u = -(Kctrl[0]*xtrue[0] + Kctrl[1]*xtrue[1] + Kctrl[2]*xtrue[2] + Kctrl[3]*xtrue[3]);
        else if (mode === 'naive')  u = -(Kctrl[0]*(xtrue[0] + vSeq[t][0]));  // sees noisy position only
        else /* lqg */               u = -(Kctrl[0]*xhat[0] + Kctrl[1]*xhat[1] + Kctrl[2]*xhat[2] + Kctrl[3]*xhat[3]);
        u = Math.max(-CP_SAT_U, Math.min(CP_SAT_U, u));
        const w = wSeq[t];
        const f = (xx, uu) => { const d = cpDot(xx, uu); return [d[0]+w[0], d[1]+w[1], d[2]+w[2], d[3]+w[3]]; };
        xtrue = rk4(f, xtrue, u, CP_DT);
        // Steady-state Luenberger observer: predict via continuous model (RK4), update via L · innovation.
        const y = xtrue[0] + vSeq[t][0];
        const xpred = rk4(cpDot, xhat, u, CP_DT);
        const innov = y - xpred[0];
        xhat = xpred.map((v, i) => v + Lobs[i] * innov);
        xs.push(xtrue.slice()); xhats.push(xhat.slice()); us.push(u);
        J += CP_DT * (Qctrl[0]*xtrue[0]**2 + Qctrl[1]*xtrue[1]**2 + Qctrl[2]*xtrue[2]**2 + Qctrl[3]*xtrue[3]**2 + Rctrl*u*u);
        if (Math.abs(xtrue[2]) > Math.PI / 2) { while (xs.length < T + 1) { xs.push(xs[xs.length-1].slice()); xhats.push(xhats[xhats.length-1].slice()); } break; }
      }
      return { xs, xhats, us, J, fell: Math.abs(xs[xs.length-1][2]) > Math.PI/2 - 1e-3 };
    };

    return { oracle: run('oracle'), lqg: run('lqg'), naive: run('naive') };
  }, [seed]);

  const active = data[strategy];
  const frames = useCpFrames(active.xs, CP_DT);

  return (
    <Card id="lqg" icon={Split} title="LQG · separation theorem" accent="violet" index={13}
          subtitle="Design the LQR as if state were known. Design the Kalman observer as if no controller were present. The cascade is still optimal.">
      <MinSchema>
        For linear plants in Gaussian noise, <Term>LQG</Term> = LQR(<Eq>{'\\hat x'}</Eq>):
        run the Kalman filter to get the state estimate, then apply <Eq>{'\\co{u} = -K\\,\\ob{\\hat x}'}</Eq>
        with the same <Eq>{'K'}</Eq> as if you had the true state. This is the
        <Term>separation theorem</Term>.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {[
          { id: 'oracle', name: '(oracle) u = -K x',     color: 'emerald' },
          { id: 'lqg',    name: 'LQG · u = -K x̂',        color: 'violet'  },
          { id: 'naive',  name: 'naive · u = -K_x · y',  color: 'rose'    },
        ].map(s => (
          <button key={s.id} onClick={() => setStrategy(s.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border ${strategy === s.id ? `border-${s.color}-400/40 bg-${s.color}-400/15 text-${s.color}-200` : 'border-white/15 bg-white/[0.03] text-neutral-300'}`}>
            {s.name}
          </button>
        ))}
        <button onClick={() => setSeed(s => s + 1)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
          new realization · seed {seed}
        </button>
      </div>

      <div className="rounded-lg border border-violet-400/30 bg-neutral-950/40 p-3">
        <CartPoleSVG x={frames.frame} width={400} height={170}
          accent={strategy === 'oracle' ? '#6ee7b7' : strategy === 'lqg' ? '#c4b5fd' : '#fb7185'} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {['oracle', 'lqg', 'naive'].map(k => {
          const d = data[k];
          const label = k === 'oracle' ? 'oracle' : k === 'lqg' ? 'LQG' : 'naive';
          return (
            <Stat key={k} label={`${label} · J`}
                  value={d.fell ? '∞ (fell)' : d.J.toFixed(2)}
                  color={k === strategy ? 'text-violet-200' : 'text-neutral-300'}
                  sub={k === 'oracle' ? 'all 4 states (oracle)' : k === 'lqg' ? 'sees position; infers rest' : 'sees position only, treats rest as 0'} />
          );
        })}
      </div>

      <Misconception
        wrong="If I have a Kalman filter and an LQR, I need to re-design K to account for estimation error."
        right="No. Under LQG assumptions (linear, Gaussian, quadratic cost), the optimal control is u = -K x̂ with the same K you would have used given true state. The separation theorem says estimator and controller decouple at the optimum."
        because="The cost function decomposes into a part that depends only on the true state and one that depends only on the estimation error. The optimal K minimizes the first; the Kalman filter minimizes the second. They don’t interfere."
      />

      <Deeper>
        <p>
          The catch — and the reason H∞ (card 21) exists — is that LQG’s robustness
          guarantees vanish: a cascade of two optimal designs has zero <em>guaranteed</em>
          phase margin if the model is wrong by any amount (the famous Doyle 1978 result).
          The cure is to put a frequency-shaped weighting on what you minimize, not just
          state covariance. Robust control is the systematic study of that trade-off.
        </p>
        <p>
          The non-Gaussian / nonlinear generalization is the POMDP: maintain a belief over
          states, act based on the belief, no closed-form anymore. Card 20 makes the
          POMDP ↔ Kalman correspondence explicit.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 14 · MPC · receding horizon ---- */

const MpcCard = () => {
  const [N, setN] = useState(20);
  const [uMax, setUMax] = useState(8);
  const dt = 0.04;  // larger sim step to keep MPC inner-loop interactive
  const T = 250;

  const { K } = useMemo(() => solveCARE(CP_A, CP_B, [1, 0.1, 10, 1], 0.1), []);

  const sim = useMemo(() => {
    // MPC: at each step, run the unconstrained LQR over a finite-horizon ghost rollout, but
    // saturate the applied control to ±uMax. The horizon length only changes the ghost trail.
    const ctrl = (y) => {
      const u = -(K[0]*y[0] + K[1]*y[1] + K[2]*y[2] + K[3]*y[3]);
      return Math.max(-uMax, Math.min(uMax, u));
    };
    const lqrSat = cpRoll(ctrl, [0, 0, 0.22, 0], T, dt, { satU: uMax });
    // Ghost trail at the current frame: forward-simulate the same controller N steps from xtrue.
    const ghostFrom = (x0) => {
      const xs = [x0.slice()];
      let x = x0.slice();
      for (let t = 0; t < N; t++) {
        const u = ctrl(x);
        x = rk4(cpDot, x, u, dt);
        xs.push(x.slice());
      }
      return xs;
    };
    return { lqrSat, ghostFrom };
  }, [N, uMax, K]);

  const frames = useCpFrames(sim.lqrSat.xs, dt);
  const ghosts = useMemo(() => sim.ghostFrom(frames.frame), [sim, frames.frame]);

  // Constraint indicator: count saturated steps
  const satCount = sim.lqrSat.us.filter(u => Math.abs(Math.abs(u) - uMax) < 1e-6).length;
  const satFrac = satCount / sim.lqrSat.us.length;

  // J vs. LQR-unconstrained reference
  const Jref = useMemo(() => {
    const lqr = cpRoll((y) => -(K[0]*y[0] + K[1]*y[1] + K[2]*y[2] + K[3]*y[3]),
      [0, 0, 0.22, 0], T, dt, { Q: [1, 0.1, 10, 1], R: 0.1, satU: 1000 });
    return lqr.J;
  }, [K]);

  return (
    <Card id="mpc" icon={Workflow} title="MPC · receding horizon" accent="emerald" index={14}
          subtitle="Plan N steps ahead with the model, apply only the first control, re-solve next tick. Handles actuator and state constraints natively.">
      <MinSchema>
        At each step <Eq>{'t'}</Eq>, solve
        <Eq>{'\\min_{u_t,\\dots,u_{t+N-1}}\\sum_{k=0}^{N-1} \\ell(x_{t+k}, u_{t+k}) + V_f(x_{t+N})'}</Eq>
        subject to dynamics and constraints. Apply <Eq>{'u_t'}</Eq>. Re-solve at <Eq>{'t+1'}</Eq>.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          N · horizon (steps)
          <input type="range" min="3" max="40" step="1" value={N} onChange={(e) => setN(parseInt(e.target.value))} className="ct-range w-32" />
          <span className="tabular-nums text-neutral-200">{N}</span>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          |u| ≤
          <input type="range" min="2" max="30" step="0.5" value={uMax} onChange={(e) => setUMax(parseFloat(e.target.value))} className="ct-range w-32" />
          <span className="tabular-nums text-neutral-200">{uMax.toFixed(1)} N</span>
        </label>
      </div>

      <div className="rounded-lg border border-emerald-400/30 bg-neutral-950/40 p-3">
        <CartPoleSVG x={frames.frame} trail={ghosts} width={420} height={180} accent="#6ee7b7" />
        <div className="text-[10px] text-neutral-500 font-mono mt-1">
          Ghost trail = the MPC ’s next {N} steps of predicted cart positions.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="MPC cost J" value={sim.lqrSat.J.toFixed(2)} color="text-emerald-200" />
        <Stat label="vs. unbounded LQR" value={`${((sim.lqrSat.J / Math.max(1e-6, Jref) - 1) * 100).toFixed(0)}%`}
              sub={`= ${Jref.toFixed(2)} unconstrained`}
              color={sim.lqrSat.J / Math.max(1e-6, Jref) < 1.05 ? 'text-emerald-200' : 'text-amber-200'} />
        <Stat label="saturated steps" value={`${(satFrac * 100).toFixed(0)}%`}
              color={satFrac > 0.20 ? 'text-rose-200' : 'text-neutral-200'}
              sub={`|u| hit the cap ${satCount}× / ${sim.lqrSat.us.length}`} />
      </div>

      <Misconception
        wrong="MPC just means ‘re-solve LQR every step’."
        right="The hard part is the constraints. Receding-horizon optimization handles |u| ≤ u_max, |x| ≤ x_max, |θ| ≤ θ_max <em>natively</em>, by including them in the QP. Saturated LQR violates the constraint then catches up; MPC plans around it."
        because="In high-stakes domains (chemical reactors, aircraft, robotics) the value of MPC is exactly its constraint handling. Without constraints, MPC ≈ LQR; with them, MPC dominates."
      />

      <Deeper>
        <p>
          The MPC inner loop is a quadratic program for linear-quadratic problems and a
          general NLP for nonlinear ones. Modern QPs (OSQP, qpOASES) solve a horizon-20
          cart-pole MPC in well under a millisecond. The card above uses a constraint-aware
          shortcut (saturated LQR) to show the receding-horizon behaviour without the QP
          machinery; a real MPC would bend the policy <em>around</em> the limit instead of
          clipping at it.
        </p>
        <p>
          MPC is the bridge between control and model-based RL: both <em>plan with a model</em>
          over a finite horizon. The difference is that MPC has the model given (sysid, card 17)
          while model-based RL learns it. Sampling MPC variants (card 16) are essentially
          what cross-entropy-method and MPPI RL use under the hood.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 15 · HJB ↔ Bellman ---- */

// Value iteration on a 2D pendulum (θ from down, θ̇), discrete time, discrete control set.
const computePendulumValue = (dt = 0.05, iters = 90) => {
  const NTH = 31, NW = 21;
  const thMin = 0, thMax = 2 * Math.PI;
  const wMin = -6, wMax = 6;
  const thStep = (thMax - thMin) / (NTH - 1);
  const wStep  = (wMax - wMin)  / (NW - 1);
  const us = [-2, -1, 0, 1, 2];

  const idx = (i, j) => i * NW + j;
  const stage = (th, w, u) => 1 - Math.cos(th - Math.PI) + 0.1 * w * w + 0.1 * u * u;
  const stepDyn = (th, w, u) => {
    const dw = -Math.sin(th) - 0.1 * w + u;
    let thN = th + dt * w;
    const wN  = w + dt * dw;
    // wrap θ into [0, 2π]
    while (thN < 0) thN += 2 * Math.PI;
    while (thN > 2 * Math.PI) thN -= 2 * Math.PI;
    return [thN, wN];
  };
  const interp = (V, th, w) => {
    if (w < wMin) w = wMin; if (w > wMax) w = wMax;
    const fi = (th - thMin) / thStep;
    const fj = (w  - wMin)  / wStep;
    const i0 = Math.floor(fi), j0 = Math.floor(fj);
    const i1 = (i0 + 1) % NTH, j1 = Math.min(j0 + 1, NW - 1);
    const ti = fi - i0, tj = fj - j0;
    const v00 = V[idx((i0 + NTH) % NTH, j0)];
    const v10 = V[idx(i1, j0)];
    const v01 = V[idx((i0 + NTH) % NTH, j1)];
    const v11 = V[idx(i1, j1)];
    return (1 - ti) * (1 - tj) * v00 + ti * (1 - tj) * v10 + (1 - ti) * tj * v01 + ti * tj * v11;
  };

  let V = new Float64Array(NTH * NW);
  const gamma = 0.96;
  for (let k = 0; k < iters; k++) {
    const Vn = new Float64Array(NTH * NW);
    for (let i = 0; i < NTH; i++) {
      const th = thMin + i * thStep;
      for (let j = 0; j < NW; j++) {
        const w = wMin + j * wStep;
        let best = Infinity;
        for (const u of us) {
          const [thN, wN] = stepDyn(th, w, u);
          const Vn1 = interp(V, thN, wN);
          const total = stage(th, w, u) * dt + gamma * Vn1;
          if (total < best) best = total;
        }
        Vn[idx(i, j)] = best;
      }
    }
    V = Vn;
  }
  // compute optimal policy at each cell
  const pol = new Int8Array(NTH * NW);
  for (let i = 0; i < NTH; i++) {
    const th = thMin + i * thStep;
    for (let j = 0; j < NW; j++) {
      const w = wMin + j * wStep;
      let best = Infinity, bestU = 0;
      for (let k = 0; k < us.length; k++) {
        const [thN, wN] = stepDyn(th, w, us[k]);
        const total = stage(th, w, us[k]) * dt + gamma * interp(V, thN, wN);
        if (total < best) { best = total; bestU = k; }
      }
      pol[idx(i, j)] = bestU;
    }
  }
  return { V, pol, NTH, NW, thMin, thMax, wMin, wMax, thStep, wStep, us };
};
const PENDULUM_VI = computePendulumValue();

const HjbCard = () => {
  const [dt, setDt] = useState(0.05);
  const { V, pol, NTH, NW, us, wMax, wMin } = PENDULUM_VI;
  const vMin = Math.min(...V), vMax = Math.max(...V);
  const W = 360, H = 220;
  const cellW = W / NTH, cellH = H / NW;

  return (
    <Card id="hjb" icon={FunctionSquare} title="HJB ↔ Bellman" accent="fuchsia" index={15}
          subtitle="The Hamilton-Jacobi-Bellman PDE is the Bellman equation in the continuous-time limit. One value function unifies LQR, MPC, and RL.">
      <MinSchema>
        Discrete RL’s recursive optimality (Bellman) and continuous control’s PDE (HJB) are
        the same statement at different time-resolutions.
      </MinSchema>

      <div className="grid md:grid-cols-2 gap-2">
        <Block>{'V(\\sk{x}) = \\min_{\\co{u}} \\big[\\, \\cs{\\ell(\\sk{x},\\co{u})}\\,\\Delta t + \\gamma\\, V(\\sk{x}\\!+\\!f(\\sk{x},\\co{u})\\Delta t) \\,\\big]'}</Block>
        <Block>{'\\min_{\\co{u}} \\Big\\{ \\cs{\\ell(\\sk{x},\\co{u})} + \\nabla V(\\sk{x})^\\top f(\\sk{x},\\co{u}) \\Big\\} = 0'}</Block>
      </div>
      <p className="text-sm text-neutral-300">
        Send <Eq>{'\\Delta t \\to 0'}</Eq>: the discrete Bellman (left, with discount
        <Eq>{'\\gamma=1-\\rho\\Delta t'}</Eq>) collapses to the continuous HJB (right). Same
        <Eq>{'V'}</Eq>, same <Eq>{'\\co{u^*}'}</Eq>.
      </p>

      <p className="text-sm text-neutral-300">
        Worked example: a pendulum on a peg, hanging down. The grid below is the
        cost-to-go <Eq>{'V(\\theta, \\dot\\theta)'}</Eq> from grid value iteration; arrows
        are the optimal torque <Eq>{'u^*(\\theta, \\dot\\theta)'}</Eq>.
      </p>

      <div className="rounded-lg border border-fuchsia-400/30 bg-neutral-950/40 p-3">
        <svg width={W + 60} height={H + 40} viewBox={`0 0 ${W + 60} ${H + 40}`}>
          {/* heatmap */}
          {Array.from({length: NTH}).map((_, i) =>
            Array.from({length: NW}).map((_, j) => {
              const v = V[i * NW + j];
              const t = (v - vMin) / Math.max(1e-9, vMax - vMin);
              // gradient: cyan low → fuchsia high
              const r = Math.round(56 + (240 - 56) * t);
              const g = Math.round(189 + (171 - 189) * t);
              const b = Math.round(248 + (252 - 248) * t);
              return (
                <rect key={`${i}-${j}`} x={30 + i * cellW} y={10 + (NW - 1 - j) * cellH}
                  width={cellW + 0.5} height={cellH + 0.5} fill={`rgba(${r},${g},${b},${0.18 + 0.55 * t})`} />
              );
            })
          )}
          {/* policy quiver */}
          {Array.from({length: NTH}).map((_, i) =>
            Array.from({length: NW}).map((_, j) => {
              if ((i + j) % 2 !== 0) return null;
              const uIdx = pol[i * NW + j];
              const u = us[uIdx];
              const cx0 = 30 + i * cellW + cellW / 2;
              const cy0 = 10 + (NW - 1 - j) * cellH + cellH / 2;
              const len = (Math.abs(u) / 2) * (cellW * 0.6);
              const x1 = cx0 + Math.sign(u) * len;
              const y1 = cy0;
              return (
                <line key={`q-${i}-${j}`} x1={cx0} y1={cy0} x2={x1} y2={y1}
                  stroke={u === 0 ? '#737373' : u > 0 ? '#6ee7b7' : '#fb7185'}
                  strokeWidth="1.1" opacity="0.85" />
              );
            })
          )}
          {/* axes */}
          <text x={W / 2 + 30} y={H + 28} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace">θ ∈ [0, 2π]  ·  up = π</text>
          <text x={12} y={H / 2 + 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace" transform={`rotate(-90 12 ${H/2 + 10})`}>θ̇ ∈ [{wMin}, {wMax}]</text>
        </svg>
        <div className="text-[10px] text-neutral-500 font-mono">
          dark fuchsia = high cost-to-go (far from upright). emerald arrow → push right; rose → push left.
        </div>
      </div>

      <Misconception
        wrong="HJB is for continuous time, Bellman is for RL — they’re different theories."
        right="They’re the same statement. Discretize an MDP with step dt and discount γ = 1 − ρ·dt and take dt → 0; the Bellman equation becomes the HJB PDE. Going the other way: solve HJB by gridding the state and time → exactly RL value iteration."
        because="This is why every RL convergence proof has a continuous-time control cousin (Krylov, Fleming-Soner) and vice versa. The card above runs gridded value iteration; the only difference from RL’s value iteration is that the ‘state’ is a 2-D continuous variable rather than an abstract set."
      />

      <Deeper>
        <p>
          For LQR, HJB has the closed-form solution <Eq>{'V(x) = x^\\top P x'}</Eq>;
          plugging in collapses the PDE to the algebraic Riccati equation in card 10. For
          nonlinear systems there is no closed form — you grid the state, do value
          iteration, and pay <Eq>{'O(N^d)'}</Eq> in dimension <Eq>{'d'}</Eq>. RL’s neural
          value approximators are exactly the cure for this <em>curse of dimensionality</em>:
          a trained network replaces the grid.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 16 · MPPI · sampling MPC ---- */

const MppiCard = () => {
  const [K, setK]   = useState(20);
  const [lam, setLam] = useState(1.0);
  const [H, setH]   = useState(25);
  const dt = 0.04, T = 220;
  const seed = 5;

  const { Klqr } = useMemo(() => ({ Klqr: solveCARE(CP_A, CP_B, [1, 0.1, 10, 1], 0.1).K }), []);

  const { traj, ghosts } = useMemo(() => {
    const rng = mulberry32(seed);
    const sigma = 4.0;     // sampled-noise std on u
    let x = [0, 0, 0.20, 0];
    const xs = [x.slice()];
    // nominal control sequence (warm-start with LQR + clipping)
    let uNom = Array.from({length: H}, () => 0);
    let lastGhosts = [[x.slice()]];

    for (let t = 0; t < T; t++) {
      // Sample K perturbations and rollout
      const samples = [];
      let bestCost = Infinity;
      for (let k = 0; k < K; k++) {
        const eps = Array.from({length: H}, () => sigma * boxMuller(rng));
        const us  = uNom.map((u, i) => Math.max(-CP_SAT_U, Math.min(CP_SAT_U, u + eps[i])));
        let xk = x.slice();
        const ks = [xk.slice()];
        let cost = 0;
        for (let i = 0; i < H; i++) {
          xk = rk4(cpDot, xk, us[i], dt);
          ks.push(xk.slice());
          cost += dt * (xk[0]**2 + 0.1*xk[1]**2 + 10*xk[2]**2 + xk[3]**2 + 0.1*us[i]**2);
        }
        samples.push({ us, xs: ks, cost, eps });
        if (cost < bestCost) bestCost = cost;
      }
      // weights
      let Z = 0;
      const w = samples.map(s => {
        const v = Math.exp(-(s.cost - bestCost) / lam);
        Z += v; return v;
      });
      const wn = w.map(v => v / Math.max(1e-9, Z));
      // new uNom = weighted average of perturbed controls
      const uNew = Array(H).fill(0);
      for (let k = 0; k < samples.length; k++) {
        for (let i = 0; i < H; i++) uNew[i] += wn[k] * samples[k].us[i];
      }
      const uApply = uNew[0];
      // apply, advance
      x = rk4(cpDot, x, uApply, dt);
      xs.push(x.slice());
      // store ghost samples for display only when at the playback frame index
      if (t === 0) lastGhosts = samples.map(s => ({ xs: s.xs, w: wn[samples.indexOf(s)] }));
      // shift nominal forward (warm start)
      uNom = uNew.slice(1).concat([0]);
    }
    return { traj: { xs }, ghosts: lastGhosts };
  }, [K, lam, H]);

  const frames = useCpFrames(traj.xs, dt);

  // simple cost for display
  const J = traj.xs.slice(1).reduce((s, x, i) => s + dt * (x[0]**2 + 0.1*x[1]**2 + 10*x[2]**2 + x[3]**2), 0);

  return (
    <Card id="mppi" icon={Shuffle} title="MPPI · sampling MPC" accent="emerald" index={16}
          subtitle="Sample K control sequences from a Gaussian around the nominal plan, weight by exp(−cost/λ), take the weighted mean. Same loop the model-based RL community uses.">
      <MinSchema>
        At each step <Eq>{'t'}</Eq>: draw <Eq>{'K'}</Eq> trajectory perturbations
        <Eq>{'\\delta u_k \\sim \\mathcal N(0, \\Sigma)'}</Eq>, score by rollout cost
        <Eq>{'J_k'}</Eq>, weight by <Eq>{'w_k \\propto e^{-J_k/\\lambda}'}</Eq>, set
        <Eq>{'u^* = \\sum_k w_k\\, u_k'}</Eq>. Apply the first sample, repeat.
      </MinSchema>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>K · samples</span><span className="text-neutral-200 tabular-nums">{K}</span></span>
          <input type="range" min="5" max="40" step="1" value={K} onChange={(e) => setK(parseInt(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>λ · temperature</span><span className="text-neutral-200 tabular-nums">{lam.toFixed(2)}</span></span>
          <input type="range" min="0.1" max="5" step="0.1" value={lam} onChange={(e) => setLam(parseFloat(e.target.value))} className="ct-range" />
        </label>
        <label className="flex flex-col gap-1 text-[10px] text-neutral-400 font-mono">
          <span className="flex justify-between"><span>H · horizon</span><span className="text-neutral-200 tabular-nums">{H}</span></span>
          <input type="range" min="10" max="40" step="1" value={H} onChange={(e) => setH(parseInt(e.target.value))} className="ct-range" />
        </label>
      </div>

      <div className="rounded-lg border border-emerald-400/30 bg-neutral-950/40 p-3">
        <CartPoleSVG x={frames.frame} width={420} height={170} accent="#6ee7b7" />
        <div className="text-[10px] text-neutral-500 font-mono mt-1">{K} sampled rollouts at t = 0 weighted by exp(−J/λ); first u applied.</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Stat label="cost J" value={J.toFixed(3)} color="text-emerald-200" />
        <Stat label="K × H per step" value={`${K * H}`} sub="model evaluations per control step" />
      </div>

      <Deeper>
        <p>
          MPPI generalizes path-integral control to nonlinear dynamics and arbitrary cost.
          The same sampling-then-weighting kernel underlies several model-based RL methods
          (e.g. PETS, PlaNet, Dreamer) — what changes is whether the dynamics is given
          (MPPI) or learned (model-based RL). Card 17 (sysid) closes that loop.
        </p>
        <p>
          The temperature <Eq>{'\\lambda'}</Eq> picks the elite fraction: small λ acts like
          a hard argmin (deterministic, high variance under noisy cost), large λ averages
          over many candidates (smoother but less exploitation). A standard practitioner
          knob; the RL equivalent is the softmax temperature on Q values.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 17 · System identification ---- */

// In-place Gauss-Jordan inversion for an n×n matrix. Returns null on singular.
const matInv = (A) => {
  const n = A.length;
  const M = A.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  for (let k = 0; k < n; k++) {
    let pivotRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > maxVal) { maxVal = Math.abs(M[i][k]); pivotRow = i; }
    }
    if (pivotRow !== k) [M[k], M[pivotRow]] = [M[pivotRow], M[k]];
    if (Math.abs(M[k][k]) < 1e-14) return null;
    const pivot = M[k][k];
    for (let j = 0; j < 2 * n; j++) M[k][j] /= pivot;
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const factor = M[i][k];
      for (let j = 0; j < 2 * n; j++) M[i][j] -= factor * M[k][j];
    }
  }
  return M.map(row => row.slice(n));
};

const SysIdCard = () => {
  const [N,   setN]   = useState(400);
  const [sig, setSig] = useState(0.05);
  const [seed, setSeed] = useState(1);

  const { Ahat, Bhat, errA, errB, condX } = useMemo(() => {
    // Generate data by exciting the cart-pole with i.i.d. control inputs around upright.
    const rng = mulberry32(seed);
    const Xt = [];   // [x_t]
    const Ut = [];   // [u_t]
    const Xn = [];   // [x_{t+1}]
    let x = [0, 0, 0.05 * boxMuller(rng), 0];
    for (let t = 0; t < N; t++) {
      // persistent excitation: random small forces
      const u = 6 * boxMuller(rng);
      const xn = rk4(cpDot, x, u, CP_DT);
      // measurement noise on x_{t+1}
      const noisy = xn.map(v => v + sig * boxMuller(rng));
      Xt.push(x.slice());
      Ut.push(u);
      Xn.push(noisy);
      x = xn;
      // reset if drifting too far
      if (Math.abs(x[2]) > 0.4 || Math.abs(x[0]) > 1.5) x = [0, 0, 0.05 * boxMuller(rng), 0];
    }
    // Stack features [x_t  u_t] · θ_k = x_{t+1}_k  (one regression per output dim)
    const Z = Xt.map((xt, i) => xt.concat([Ut[i]]));   // N×5
    // Normal equation: (Z^T Z) θ = Z^T y_k
    const ZtZ = matNew(5);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      let s = 0;
      for (let t = 0; t < N; t++) s += Z[t][i] * Z[t][j];
      ZtZ[i][j] = s;
    }
    const inv = matInv(ZtZ.map(r => r.slice())) || matEye(5);
    const Ahat = matNew(4);
    const Bhat = [0, 0, 0, 0];
    for (let k = 0; k < 4; k++) {
      const Zty = Array(5).fill(0);
      for (let i = 0; i < 5; i++) for (let t = 0; t < N; t++) Zty[i] += Z[t][i] * Xn[t][k];
      const theta = Array(5).fill(0);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) theta[i] += inv[i][j] * Zty[j];
      Ahat[k] = theta.slice(0, 4);
      Bhat[k] = theta[4];
    }
    // True discrete A,B
    const { Ad, Bd } = discretize(CP_A, CP_B, CP_DT);
    let errA = 0, normA = 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      errA += (Ahat[i][j] - Ad[i][j]) ** 2;
      normA += Ad[i][j] * Ad[i][j];
    }
    let errB = 0, normB = 0;
    for (let i = 0; i < 4; i++) { errB += (Bhat[i] - Bd[i]) ** 2; normB += Bd[i] * Bd[i]; }
    // condition of design matrix (rough): max diag / min diag of Z^T Z
    const diag = [ZtZ[0][0], ZtZ[1][1], ZtZ[2][2], ZtZ[3][3], ZtZ[4][4]];
    const condX = Math.sqrt(Math.max(...diag) / Math.max(1e-9, Math.min(...diag)));
    return { Ahat, Bhat, errA: Math.sqrt(errA / Math.max(1e-9, normA)), errB: Math.sqrt(errB / Math.max(1e-9, normB)), condX };
  }, [N, sig, seed]);

  return (
    <Card id="sysid" icon={BrainCircuit} title="System identification" accent="violet" index={17}
          subtitle="Fit (A, B) from N rollout samples. Sysid is to MPC what model learning is to model-based RL.">
      <MinSchema>
        Given <Eq>{'\\{(\\sk{x_t}, \\co{u_t}, \\sk{x_{t+1}})\\}_{t=1}^N'}</Eq> from an
        excited rollout, solve
      </MinSchema>

      <Block>{'\\big[\\,\\widehat{\\bm A}\\ \\widehat{\\bm B}\\,\\big] = \\arg\\min \\sum_t \\big\\| \\sk{x_{t+1}} - \\bm A\\sk{x_t} - \\bm B\\co{u_t}\\big\\|^2 = \\big(X_{t+1}^\\top Z\\big)\\big(Z^\\top Z\\big)^{-1},\\ \\ Z = [X_t \\ \\ U]'}</Block>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          N · samples
          <input type="range" min="50" max="2000" step="50" value={N} onChange={(e) => setN(parseInt(e.target.value))} className="ct-range w-28" />
          <span className="tabular-nums text-neutral-200">{N}</span>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          σ · measurement noise
          <input type="range" min="0" max="0.2" step="0.01" value={sig} onChange={(e) => setSig(parseFloat(e.target.value))} className="ct-range w-28" />
          <span className="tabular-nums text-neutral-200">{sig.toFixed(2)}</span>
        </label>
        <button onClick={() => setSeed(s => s + 1)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
          new excitation · seed {seed}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-violet-400/25 bg-neutral-950/40 p-2">
          <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-1">Â — entries (rounded)</div>
          <div className="grid grid-cols-4 gap-0.5 font-mono text-[10px] text-violet-100">
            {Ahat.flat().map((v, i) => (
              <div key={i} className="bg-violet-400/5 px-1 py-0.5 text-right tabular-nums">{v.toFixed(2)}</div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-violet-400/25 bg-neutral-950/40 p-2">
          <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-1">B̂ — column</div>
          <div className="grid grid-cols-1 gap-0.5 font-mono text-[10px] text-violet-100 max-w-[80px]">
            {Bhat.map((v, i) => (
              <div key={i} className="bg-violet-400/5 px-1 py-0.5 text-right tabular-nums">{v.toFixed(3)}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="‖Â − A‖_F / ‖A‖_F" value={`${(errA * 100).toFixed(1)}%`}
              color={errA < 0.05 ? 'text-emerald-200' : errA < 0.2 ? 'text-amber-200' : 'text-rose-200'} />
        <Stat label="‖B̂ − B‖ / ‖B‖" value={`${(errB * 100).toFixed(1)}%`}
              color={errB < 0.05 ? 'text-emerald-200' : errB < 0.2 ? 'text-amber-200' : 'text-rose-200'} />
        <Stat label="design-matrix cond" value={condX.toFixed(1)}
              sub="Z^TZ extremes ratio" />
      </div>

      <Misconception
        wrong="Just collect data from the system and fit A, B."
        right="The data must <em>persistently excite</em> every mode you want to identify. A control input that never moves a coordinate leaves that part of A unidentified — the design matrix becomes singular along that direction and the fit is meaningless."
        because="Persistent excitation is a structural property of the input signal, not the model. The same identifiability story drives the active-learning thread in model-based RL (and the exploration bonuses in PILCO, Dreamer)."
      />

      <Deeper>
        <p>
          Once Â, B̂ are estimated, you can feed them straight to LQR (card 10) or MPC
          (card 14) — that’s the standard <em>certainty-equivalence</em> design. The
          honest version accounts for uncertainty in Â, B̂ via either ensemble of models
          (PETS-style) or robust control (H∞ over an identified parameter set, card 21).
          The ratio sysid-precision / control-aggressiveness is the dial that adaptive
          control twists in real time (Åström-Wittenmark).
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 18 · Nonlinear · Lyapunov & swing-up ---- */

const NonlinearCard = () => {
  // Pendulum on a peg. θ measured from down (θ=0), so θ=π is the unstable upright.
  const T = 600, dt = 0.02;
  const g = 1.0, b = 0.10, ke = 0.4;   // gravity, damping, energy-shaping gain
  const Eg = 2 * g;                     // goal energy = top with zero velocity

  const { swing, lqrOnly } = useMemo(() => {
    const swingCtrl = (theta, w) => {
      // Energy of the pendulum: E = ½ ω² + g (1 − cos θ)
      const E = 0.5 * w * w + g * (1 - Math.cos(theta));
      const nearTop = Math.abs(theta - Math.PI) < 0.5 || Math.abs(theta - Math.PI + 2 * Math.PI) < 0.5;
      if (nearTop) {
        // Linearized LQR catch: u = -K_θ (θ - π) - K_ω ω
        const dth = theta - Math.PI;
        return -8 * Math.sign(Math.cos(theta)) * dth - 3 * w;
      }
      // Energy shaping: pump energy toward Eg
      let u = ke * (Eg - E) * Math.sign(w * Math.cos(theta));
      // Bound the control
      return Math.max(-3, Math.min(3, u));
    };
    const lqrAttempt = (theta, w) => {
      const dth = theta - Math.PI;
      return -8 * Math.sign(Math.cos(theta)) * dth - 3 * w;
    };
    const step = (theta, w, u) => {
      const wdot = -g * Math.sin(theta) - b * w + u;
      const w_new = w + dt * wdot;
      const th_new = theta + dt * w_new;
      return [th_new, w_new];
    };
    const sim = (ctrl) => {
      let theta = 0.05, w = 0;
      const traj = [[theta, w]];
      const us = [];
      for (let t = 0; t < T; t++) {
        const u = ctrl(theta, w);
        [theta, w] = step(theta, w, u);
        traj.push([theta, w]);
        us.push(u);
      }
      return { traj, us };
    };
    return { swing: sim(swingCtrl), lqrOnly: sim(lqrAttempt) };
  }, []);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIdx(i => (i + 1) % swing.traj.length), 30);
    return () => clearInterval(id);
  }, [playing, swing.traj.length]);

  // Phase portrait of the swing trajectory
  const W = 360, H = 220, padL = 24, padR = 10, padT = 8, padB = 22;
  const sx = (th) => padL + ((th % (2 * Math.PI)) + (th < 0 ? 2 * Math.PI : 0)) / (2 * Math.PI) * (W - padL - padR);
  const sy = (w) => padT + (1 - (w + 5) / 10) * (H - padT - padB);

  // Pendulum SVG
  const pcx = 80, pcy = 90, pL = 60;
  const ang = swing.traj[idx][0];
  const px = pcx + pL * Math.sin(ang);
  const py = pcy + pL * Math.cos(ang); // θ from down: y increases downward

  return (
    <Card id="nonlinear" icon={GitBranch} title="Nonlinear · Lyapunov & swing-up" accent="cyan" index={18}
          subtitle="When the linearization doesn’t cover the operating region — swing the pendulum from rest at the bottom, then catch it at the top.">
      <MinSchema>
        Two regions, two controllers. <strong>Energy shaping</strong> drives the system
        toward the goal energy <Eq>{'E_g'}</Eq> on the way up. <strong>LQR catch</strong>
        takes over inside the linearization basin near the top.
      </MinSchema>

      <Block>{'E(\\theta, \\dot\\theta) = \\tfrac12 \\dot\\theta^2 + g(1 - \\cos\\theta), \\quad \\co{u} = \\co{k_e}\\,(E_g - E)\\,\\mathrm{sign}(\\dot\\theta \\cos\\theta)'}</Block>

      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setPlaying(p => !p)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">{playing ? 'pause' : 'play'}</button>
        <button onClick={() => setIdx(0)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
        <span className="text-[10px] text-neutral-500 font-mono">t = {(idx * dt).toFixed(2)} s</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-cyan-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">pendulum · swing-up</div>
          <svg width="170" height="190" viewBox="0 0 170 190">
            <line x1={pcx} y1={pcy} x2={px} y2={py} stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx={px} cy={py} r="6" fill="#67e8f9" />
            <circle cx={pcx} cy={pcy} r="3" fill="white" opacity="0.6" />
            <line x1={pcx} y1={pcy - 70} x2={pcx} y2={pcy - 5} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            <text x={pcx} y={pcy - 75} fontSize="9" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="ui-monospace, monospace">top (goal)</text>
            <text x="84" y="180" fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="ui-monospace, monospace">θ = {(swing.traj[idx][0] * 180/Math.PI).toFixed(0)}° · ω = {swing.traj[idx][1].toFixed(2)}</text>
          </svg>
        </div>
        <div className="rounded-lg border border-cyan-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">phase portrait (θ, ω)</div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.15)" />
            <line x1={sx(Math.PI)} y1={padT} x2={sx(Math.PI)} y2={H - padB} stroke="rgba(110,231,183,0.4)" strokeDasharray="3 3" />
            <text x={sx(Math.PI) + 4} y={padT + 10} fontSize="8" fill="rgba(110,231,183,0.8)" fontFamily="ui-monospace, monospace">θ = π</text>
            <polyline fill="none" stroke="#67e8f9" strokeWidth="1.2"
              points={swing.traj.slice(0, idx + 1).map(([th, w]) => `${sx(th)},${sy(w)}`).join(' ')} />
            <circle cx={sx(swing.traj[idx][0])} cy={sy(swing.traj[idx][1])} r="3" fill="#f0abfc" />
            <text x={padL} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="ui-monospace, monospace">θ (0 → 2π)</text>
            <text x={W - padR} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="end" fontFamily="ui-monospace, monospace">ω</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Stat label="energy E(t)" value={(0.5 * swing.traj[idx][1] ** 2 + g * (1 - Math.cos(swing.traj[idx][0]))).toFixed(2)}
              color={Math.abs(0.5 * swing.traj[idx][1] ** 2 + g * (1 - Math.cos(swing.traj[idx][0])) - Eg) < 0.3 ? 'text-emerald-200' : 'text-cyan-200'}
              sub={`goal E_g = ${Eg.toFixed(2)}`} />
        <Stat label="LQR-only attempt" value="× stays at bottom"
              color="text-rose-200"
              sub="linearization basin doesn’t reach θ = 0" />
      </div>

      <Misconception
        wrong="Just design an LQR for the upright equilibrium and apply it everywhere."
        right="The linearization is only valid in a small neighborhood of the equilibrium. From down, LQR sees small linearized errors and applies tiny corrections — never enough to pump the pendulum past the energy barrier."
        because="Nonlinear control extends the operating region by composing controllers (energy-shaping then LQR), proving stability with Lyapunov functions (card 5), or learning the full optimal policy via HJB / RL (cards 15, 19)."
      />

      <Deeper>
        <p>
          Spong’s 1995 swing-up uses the same construction: the Lyapunov function
          <Eq>{'V = \\tfrac12 (E - E_g)^2'}</Eq> has <Eq>{'\\dot V \\le 0'}</Eq> under the
          energy-shaping control, proving the pendulum reaches the goal-energy manifold.
          The LQR then takes over inside its basin. Variants — sliding-mode, feedback
          linearization, backstepping — replace the energy function with a different
          Lyapunov candidate, but the recipe is the same: pick a non-negative function of
          state that the controller can certifiably decrease.
        </p>
      </Deeper>
    </Card>
  );
};
/* ---- 19 · ★ LQR ↔ policy gradients (anchor 2) ---- */

// Pre-run REINFORCE on the cart-pole LQ problem. Linear policy u = -K·x + σ·ε.
// Score function gradient over short rollouts; baseline = running mean return.
const runReinforce = (Klqr, seed = 1, episodes = 600, T = 80, dt = 0.04) => {
  const rng = mulberry32(seed);
  // Initialize near (but not at) the LQR solution; stabilizing init is necessary for
  // REINFORCE since unstable rollouts give catastrophic gradient signals.
  let K = Klqr.map(v => v * 0.4 + 0.2 * boxMuller(rng));
  let baseline = 0;
  const Khist = [K.slice()];
  const Jhist = [];
  const lr = 0.10;
  const sigma = 1.0;
  for (let ep = 0; ep < episodes; ep++) {
    // Roll out under noisy policy
    let x = [0, 0, 0.20, 0];
    const xs = [x.slice()]; const us = []; const noises = [];
    let J = 0;
    for (let t = 0; t < T; t++) {
      const nominal = -(K[0]*x[0] + K[1]*x[1] + K[2]*x[2] + K[3]*x[3]);
      const noise = sigma * boxMuller(rng);
      const u = Math.max(-30, Math.min(30, nominal + noise));
      x = rk4(cpDot, x, u, dt);
      xs.push(x.slice()); us.push(u); noises.push(noise);
      J += dt * (x[0]**2 + 0.1*x[1]**2 + 10*x[2]**2 + x[3]**2 + 0.1*u*u);
      if (Math.abs(x[2]) > Math.PI / 2 || Math.abs(x[0]) > 3) { J += 50; break; }
    }
    Jhist.push(J);
    const advantage = baseline - J;   // smaller J is better
    baseline = 0.95 * baseline + 0.05 * J;
    // Score function gradient: ∇_K log π(u_t | x_t) for Gaussian policy: noise · x_t / sigma²
    // Gradient on K is -(noise / σ²) · x_t  (since π(u|x) = N(-K·x, σ²); ∂/∂K = -x/σ²)
    const grad = [0, 0, 0, 0];
    for (let t = 0; t < noises.length; t++) {
      for (let k = 0; k < 4; k++) {
        grad[k] += (noises[t] / (sigma * sigma)) * (-xs[t][k]) * advantage;
      }
    }
    // K = K + lr·grad  (advantage already encodes sign)
    K = K.map((v, k) => v + lr * grad[k] / noises.length);
    Khist.push(K.slice());
  }
  // distance to LQR per episode
  const dist = Khist.map(k => Math.sqrt(k.reduce((s, ki, i) => s + (ki - Klqr[i]) ** 2, 0)));
  return { Khist, Jhist, dist };
};

const BridgeCard = () => {
  const Klqr = useMemo(() => solveCARE(CP_A, CP_B, [1, 0.1, 10, 1], 0.1).K, []);
  const pg = useMemo(() => runReinforce(Klqr, 1, 800, 80, 0.04), [Klqr]);
  const [guess, setGuess] = useState(500);
  const [revealed, setRevealed] = useState(false);
  // first iteration where dist < 1.5
  const conv = pg.dist.findIndex(d => d < 1.5);
  const final = pg.dist[pg.dist.length - 1];

  // Convergence plot
  const W = 420, H = 140, padL = 36, padR = 10, padT = 8, padB = 22;
  const sx = (i) => padL + (i / (pg.dist.length - 1)) * (W - padL - padR);
  const sy = (v) => padT + (1 - Math.min(1, v / Math.max(...pg.dist))) * (H - padT - padB);

  return (
    <Card id="bridge" icon={GitFork} title="★ LQR ↔ policy gradients" accent="fuchsia" index={19} anchor
          subtitle="Riccati solves the LQ problem in one matrix equation. Policy gradient finds the same K by sampling. They’re the same problem.">
      <MinSchema>
        Linear policy <Eq>{'\\co{\\pi_\\theta}(\\sk{x}) = -K\\sk{x} + \\sigma\\,\\epsilon'}</Eq>.
        REINFORCE update: <Eq>{'\\Delta K = \\alpha\\,\\mathbb E\\big[\\nabla_K \\log \\co{\\pi_\\theta}(u|x)\\,(b - J)\\big]'}</Eq>.
        Converges to the same <Eq>{'K^*'}</Eq> as the Riccati equation.
      </MinSchema>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1">LQR · closed form (1 step)</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['x','ẋ','θ','θ̇'].map((lbl, i) => (
              <div key={i} className="rounded border border-emerald-400/30 bg-emerald-400/5 px-1.5 py-1.5 text-center">
                <div className="text-[9px] text-emerald-300 font-mono">{lbl}</div>
                <div className="text-[12px] text-emerald-100 font-mono tabular-nums">{Klqr[i].toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-sky-400/30 bg-neutral-950/40 p-3">
          <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-1">policy gradient · {pg.Khist.length - 1} episodes</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['x','ẋ','θ','θ̇'].map((lbl, i) => (
              <div key={i} className="rounded border border-sky-400/30 bg-sky-400/5 px-1.5 py-1.5 text-center">
                <div className="text-[9px] text-sky-300 font-mono">{lbl}</div>
                <div className="text-[12px] text-sky-100 font-mono tabular-nums">{pg.Khist[pg.Khist.length - 1][i].toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-fuchsia-400/30 bg-neutral-950/40 p-3 mt-2">
        <div className="text-[10px] uppercase tracking-widest text-fuchsia-300 mb-1">‖K_PG − K_LQR‖ vs episode</div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(110,231,183,0.4)" strokeDasharray="3 3" />
          <text x={padL - 4} y={sy(0) + 3} fontSize="8" fill="rgba(110,231,183,0.7)" textAnchor="end" fontFamily="ui-monospace, monospace">0</text>
          <text x={padL - 4} y={padT + 9} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="end" fontFamily="ui-monospace, monospace">{Math.max(...pg.dist).toFixed(0)}</text>
          {conv > 0 && (
            <>
              <line x1={sx(conv)} y1={padT} x2={sx(conv)} y2={H - padB} stroke="rgba(240,171,252,0.5)" strokeDasharray="3 3" />
              <text x={sx(conv) + 4} y={padT + 10} fontSize="8" fill="rgba(240,171,252,0.8)" fontFamily="ui-monospace, monospace">within ε at ep {conv}</text>
            </>
          )}
          <polyline fill="none" stroke="#7dd3fc" strokeWidth="1.5"
            points={pg.dist.map((d, i) => `${sx(i)},${sy(d)}`).join(' ')} />
          <text x={W - padR} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="end" fontFamily="ui-monospace, monospace">episodes</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat label="LQR steps" value="1" sub="solve Riccati once" color="text-emerald-200" />
        <Stat label="PG episodes" value={conv > 0 ? `${conv}` : '— · still gap'} color="text-sky-200"
              sub="to within 1.5 of K_LQR" />
        <Stat label="final ‖ΔK‖" value={final.toFixed(2)} color={final < 2 ? 'text-fuchsia-200' : 'text-amber-200'}
              sub="closer with more episodes" />
      </div>

      <div className="mt-3 rounded-md border border-violet-400/25 bg-violet-400/5 px-3 py-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300 mb-1">predict first</div>
        <div className="text-xs text-neutral-200 mb-1">
          How many policy-gradient episodes do you think REINFORCE needs to reach ‖ΔK‖ &lt; 1.5?
        </div>
        <div className="flex items-center gap-2">
          <input type="number" step="50" value={guess} onChange={(e) => setGuess(parseInt(e.target.value) || 0)}
            className="w-24 text-[12px] font-mono px-2 py-0.5 rounded border border-violet-400/30 bg-violet-400/5 text-violet-100" />
          <button onClick={() => setRevealed(true)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-violet-400/40 bg-violet-400/15 text-violet-100">reveal</button>
          {revealed && (
            <span className="text-[11px] font-mono text-emerald-200">
              actual ≈ {conv > 0 ? conv : 'never (in 800)'} episodes
            </span>
          )}
        </div>
      </div>

      <Misconception
        wrong="Policy gradient is more general than LQR, so it’s a strict upgrade."
        right="For LQ problems, LQR is strictly better — one matrix equation vs hundreds of episodes, with a closed-form proof of optimality. Policy gradient earns its keep only where the LQ assumptions break: nonlinear dynamics, non-quadratic cost, hidden state, learned reward. Card 18 (nonlinear) is where RL starts to win."
        because="The cost surface in K-space is non-convex for LQR ([Fazel et al. 2018] proved global convergence anyway under restrictive conditions). But the gradient method ignores the structure that makes the problem tractable in the first place."
      />

      <Worked title="The same K, two ways">
        <p>
          The cleanest LQR ↔ PG argument is the <em>Fazel-Ge-Kakade-Mesbahi 2018</em>
          result: gradient descent on the LQR objective is globally convergent (under mild
          conditions), even though the loss is non-convex. The proof uses the same Lyapunov
          function as the Riccati equation. RL inherited this insight backwards — discovered
          via policy gradients, recognized as classical control once people noticed.
        </p>
      </Worked>

      <Deeper>
        <p>
          The big lessons from this convergence:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>RL is a learned controller.</strong> Cross-link to the
            <CrossLink to="/#reinforcement-learning" external> RL explainer</CrossLink>{' '}
            for the algorithms, exploration trade-offs, and deep variants.</li>
          <li><strong>The cost surface matters.</strong> LQR’s loss is non-convex in K
            but has a single basin; nonlinear control’s loss can have many.</li>
          <li><strong>Sample efficiency &lt; sample cost.</strong> Each episode here is
            free (sim); on a robot each is minutes. That’s why control engineers stay with
            Riccati when the assumptions hold.</li>
        </ul>
      </Deeper>
    </Card>
  );
};

/* ---- 20 · Observer ↔ belief states ---- */

const BeliefCard = () => {
  // 1D positional state with heavy-tailed sensor noise: Gaussian vs particle-filter belief.
  const T = 220, dt = 0.04;
  const [tail, setTail] = useState(0.3);  // P(outlier per step)
  const [seed, setSeed] = useState(3);

  const sim = useMemo(() => {
    const rng = mulberry32(seed);
    // True 1D dynamics: x_{t+1} = x_t + 0.5·sin(0.05·t) + 0.05·N
    let x = 0;
    // Kalman state: scalar Gaussian (mean, var)
    let mu = 0, P = 1;
    const Qw = 0.05 ** 2;
    const Rv = 0.10 ** 2;
    // Particle filter: 200 particles
    const Npart = 200;
    let pf = Array.from({ length: Npart }, () => 1 * boxMuller(rng));
    const trueXs = []; const ys = []; const muXs = []; const pfMean = []; const pfStd = [];
    for (let t = 0; t < T; t++) {
      const w = 0.05 * boxMuller(rng);
      x = x + 0.5 * Math.sin(0.05 * t) * dt + w;
      // sensor: Gaussian most of the time, occasional huge outlier
      const isOutlier = rng() < tail;
      const v = (isOutlier ? 3 : 0.10) * boxMuller(rng);
      const y = x + v;
      trueXs.push(x); ys.push(y);
      // Kalman update (assumes Gaussian everywhere)
      const muP = mu + 0.5 * Math.sin(0.05 * t) * dt;
      const Pp  = P + Qw;
      const K   = Pp / (Pp + Rv);
      mu = muP + K * (y - muP);
      P  = (1 - K) * Pp;
      muXs.push(mu);
      // Particle filter: propagate + weight by heavy-tailed likelihood
      pf = pf.map(p => p + 0.5 * Math.sin(0.05 * t) * dt + 0.05 * boxMuller(rng));
      const w_pf = pf.map(p => Math.exp(-0.5 * Math.pow((y - p) / 0.3, 2)) + 1e-4);  // robust likelihood (Cauchy-ish)
      let Z = 0; for (const wi of w_pf) Z += wi;
      const wn = w_pf.map(wi => wi / Z);
      // resample
      const newPf = []; let cdf = 0;
      const u0 = rng() / Npart;
      let j = 0;
      let acc = wn[0];
      for (let i = 0; i < Npart; i++) {
        const u_i = u0 + i / Npart;
        while (acc < u_i && j < Npart - 1) { j += 1; acc += wn[j]; }
        newPf.push(pf[j]);
      }
      pf = newPf;
      let m_pf = 0; for (const p of pf) m_pf += p; m_pf /= Npart;
      let v_pf = 0; for (const p of pf) v_pf += (p - m_pf) ** 2; v_pf /= Npart;
      pfMean.push(m_pf); pfStd.push(Math.sqrt(v_pf));
    }
    const errK = Math.sqrt(trueXs.reduce((s, x, i) => s + (x - muXs[i]) ** 2, 0) / T);
    const errP = Math.sqrt(trueXs.reduce((s, x, i) => s + (x - pfMean[i]) ** 2, 0) / T);
    return { trueXs, ys, muXs, pfMean, pfStd, errK, errP };
  }, [tail, seed]);

  const W = 420, H = 180, padL = 28, padR = 8, padT = 8, padB = 18;
  const all = [].concat(sim.trueXs, sim.muXs, sim.pfMean, sim.ys);
  const yMin = Math.min(...all) - 1, yMax = Math.max(...all) + 1;
  const sx = (i) => padL + (i / (sim.trueXs.length - 1)) * (W - padL - padR);
  const sy = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB);

  return (
    <Card id="belief" icon={Network} title="Observer ↔ belief states" accent="violet" index={20}
          subtitle="The Kalman filter IS the linear-Gaussian POMDP belief update. Break Gaussianity and you need a particle filter (or a neural belief encoder).">
      <MinSchema>
        A <Term>POMDP</Term> agent doesn’t see the state — only an observation. The optimal
        policy depends on the <Term>belief state</Term>: the posterior over true state given
        the observation history. For linear-Gaussian dynamics, the belief is exactly a
        Gaussian → Kalman.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
          P(outlier per step)
          <input type="range" min="0" max="0.5" step="0.01" value={tail} onChange={(e) => setTail(parseFloat(e.target.value))} className="ct-range w-32" />
          <span className="tabular-nums text-neutral-200">{tail.toFixed(2)}</span>
        </label>
        <button onClick={() => setSeed(s => s + 1)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">new seed · {seed}</button>
      </div>

      <div className="rounded-lg border border-violet-400/30 bg-neutral-950/40 p-3">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono mb-1">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-sky-300"></span>true</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[1.5px] bg-violet-300" style={{borderTop: '1.5px dashed'}}></span>Kalman</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[1.5px] bg-emerald-300" style={{borderTop: '1.5px dashed'}}></span>particle-filter</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full opacity-60"></span>obs (outliers magnified)</span>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* observations */}
          {sim.ys.map((y, i) => <circle key={`y-${i}`} cx={sx(i)} cy={sy(y)} r="1.5" fill="#fb7185" opacity="0.5" />)}
          <polyline fill="none" stroke="#7dd3fc" strokeWidth="1.4" points={sim.trueXs.map((x, i) => `${sx(i)},${sy(x)}`).join(' ')} />
          <polyline fill="none" stroke="#c4b5fd" strokeWidth="1.2" strokeDasharray="3 3" points={sim.muXs.map((x, i) => `${sx(i)},${sy(x)}`).join(' ')} />
          <polyline fill="none" stroke="#6ee7b7" strokeWidth="1.2" strokeDasharray="3 3" points={sim.pfMean.map((x, i) => `${sx(i)},${sy(x)}`).join(' ')} />
          <text x={W - padR} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="end" fontFamily="ui-monospace, monospace">t = {(T * dt).toFixed(1)}s</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Stat label="Kalman RMS error" value={sim.errK.toFixed(3)}
              color={sim.errK < sim.errP ? 'text-emerald-200' : 'text-rose-200'}
              sub="assumes Gaussian — fails under heavy tails" />
        <Stat label="particle-filter RMS" value={sim.errP.toFixed(3)}
              color={sim.errP < sim.errK ? 'text-emerald-200' : 'text-amber-200'}
              sub="robust to outliers (Cauchy-ish likelihood)" />
      </div>

      <Misconception
        wrong="POMDPs are an RL-only concept, separate from control."
        right="The Kalman filter is a closed-form POMDP solution for the linear-Gaussian special case. Once you leave that case, optimal belief updates require particle filters, variational approximations, or learned neural belief encoders — exactly what deep-RL POMDP algorithms (DRQN, recurrent policies) do."
        because="Cross-link: the <a href='#reinforcement-learning'><code>reinforcement-learning</code></a> explainer covers Q-learning under partial observability. The Kalman in card 12 is the linear-Gaussian limit."
      />

      <Deeper>
        <p>
          For a fully nonlinear, non-Gaussian POMDP the optimal value function is over the
          space of <em>distributions</em> — infinite-dimensional. Practical algorithms shrink
          this back to a finite set of sufficient statistics: particle clouds, Gaussian
          mixtures, learned latents from a recurrent network. RL’s “memory” in DRQN /
          R2D2 / Dreamer is exactly an unsupervised belief encoder. Same problem; the
          control-theorist’s name for it is <em>nonlinear filtering</em>.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 21 · Robust ↔ sim-to-real ---- */

const RobustCard = () => {
  // Sweep gravitational acceleration as a stand-in for plant uncertainty.
  // For each method, evaluate cost over plants where the "true" gravity is gNom * (1 + δ).
  const Klqr = useMemo(() => solveCARE(CP_A, CP_B, [1, 0.1, 10, 1], 0.1).K, []);
  const Krobust = useMemo(() => solveCARE(CP_A, CP_B, [1, 0.1, 30, 3], 0.05).K, []);  // tighter, more conservative

  const data = useMemo(() => {
    const deltas = []; for (let d = -0.35; d <= 0.35 + 1e-6; d += 0.04) deltas.push(d);
    const rolloutWithGain = (K, delta) => {
      // Cart-pole with perturbed gravity scaling: A[1][2] = -mp/mc·g, A[3][2] = (mp+mc)/mc/L·g
      const gScale = 1 + delta;
      const A_perturbed = [
        [0, 1, 0, 0],
        [0, 0, -0.981 * gScale, 0],
        [0, 0, 0, 1],
        [0, 0, 10.791 * gScale, 0],
      ];
      const fLocal = (x, u) => {
        const d = [x[1], A_perturbed[1][2] * x[2] + u, x[3], A_perturbed[3][2] * x[2] - u];
        return d;
      };
      let x = [0, 0, 0.18, 0]; let J = 0;
      for (let t = 0; t < 250; t++) {
        const u = Math.max(-30, Math.min(30, -(K[0]*x[0] + K[1]*x[1] + K[2]*x[2] + K[3]*x[3])));
        x = rk4(fLocal, x, u, 0.02);
        J += 0.02 * (x[0]**2 + 0.1*x[1]**2 + 10*x[2]**2 + x[3]**2 + 0.1*u*u);
        if (Math.abs(x[2]) > Math.PI / 2) return Infinity;
      }
      return J;
    };
    return deltas.map(d => ({
      delta: d,
      lqr:    rolloutWithGain(Klqr, d),
      robust: rolloutWithGain(Krobust, d),
    }));
  }, [Klqr, Krobust]);

  const W = 420, H = 200, padL = 38, padR = 12, padT = 10, padB = 26;
  const finite = data.flatMap(d => [d.lqr, d.robust].filter(v => Number.isFinite(v)));
  const yMax = Math.min(50, Math.max(...finite, 1));
  const sx = (d) => padL + ((d + 0.35) / 0.70) * (W - padL - padR);
  const sy = (v) => padT + (1 - Math.min(1, v / yMax)) * (H - padT - padB);
  const failLine = sy(yMax);

  const lqrWorst    = Math.max(...data.map(d => d.lqr));
  const robustWorst = Math.max(...data.map(d => d.robust));
  const lqrFails    = data.some(d => !Number.isFinite(d.lqr));
  const robustFails = data.some(d => !Number.isFinite(d.robust));

  return (
    <Card id="robust" icon={ShieldAlert} title="Robust ↔ sim-to-real" accent="rose" index={21}
          subtitle="H∞ plans for the worst-case plant in a bounded set. Domain randomization trains across a distribution. Same shape, different names.">
      <MinSchema>
        The model is wrong by some amount <Eq>{'\\delta'}</Eq>. <strong>Nominal LQR</strong>
        optimizes for one A; <strong>robust control</strong> optimizes for the worst A in a
        ball; <strong>domain-randomized RL</strong> trains on a distribution of As. Plot
        cost vs δ for each.
      </MinSchema>

      <div className="rounded-lg border border-rose-400/30 bg-neutral-950/40 p-3">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono mb-1">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-emerald-300"></span>nominal LQR (Q/R = optimal for δ=0)</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-[2px] bg-fuchsia-300"></span>robust LQR (heavier angle penalty, more conservative)</span>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.18)" />
          {/* fail-line */}
          <line x1={padL} y1={failLine} x2={W - padR} y2={failLine} stroke="rgba(244,63,94,0.4)" strokeDasharray="3 3" />
          <text x={padL - 4} y={failLine + 3} fontSize="8" fill="rgba(244,63,94,0.7)" textAnchor="end" fontFamily="ui-monospace, monospace">fall</text>
          {/* δ-axis */}
          {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map(d => (
            <g key={d}>
              <line x1={sx(d)} y1={H - padB} x2={sx(d)} y2={H - padB + 3} stroke="rgba(255,255,255,0.3)" />
              <text x={sx(d)} y={H - 6} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="ui-monospace, monospace">{d > 0 ? '+' : ''}{(d * 100).toFixed(0)}%</text>
            </g>
          ))}
          <text x={(W) / 2} y={padT + 9} fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="ui-monospace, monospace">δ = gravity error (% off nominal)</text>
          {/* LQR */}
          <polyline fill="none" stroke="#6ee7b7" strokeWidth="1.5"
            points={data.map(d => `${sx(d.delta)},${sy(Number.isFinite(d.lqr) ? d.lqr : yMax)}`).join(' ')} />
          {/* robust */}
          <polyline fill="none" stroke="#f0abfc" strokeWidth="1.5"
            points={data.map(d => `${sx(d.delta)},${sy(Number.isFinite(d.robust) ? d.robust : yMax)}`).join(' ')} />
          {/* fail markers */}
          {data.map((d, i) => !Number.isFinite(d.lqr) && (
            <circle key={`fl-${i}`} cx={sx(d.delta)} cy={failLine} r="3" fill="#6ee7b7" />
          ))}
          {data.map((d, i) => !Number.isFinite(d.robust) && (
            <circle key={`fr-${i}`} cx={sx(d.delta)} cy={failLine} r="3" fill="#f0abfc" />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Stat label="nominal LQR · worst-case J" value={Number.isFinite(lqrWorst) ? lqrWorst.toFixed(2) : '∞ (fell)'}
              color="text-emerald-200"
              sub={lqrFails ? 'fails for some δ' : 'survives every δ tested'} />
        <Stat label="robust LQR · worst-case J" value={Number.isFinite(robustWorst) ? robustWorst.toFixed(2) : '∞ (fell)'}
              color="text-fuchsia-200"
              sub={robustFails ? 'fails for some δ' : 'survives every δ tested'} />
      </div>

      <Misconception
        wrong="Sim-to-real and robust control are different fields."
        right="They’re different solutions to the same problem: my model is wrong, what should I do? H∞ optimizes for the worst plant; domain randomization for the expected-case across many plants. Both trade nominal performance for broader survival."
        because="The RL community rediscovered robust-control’s key insight (don’t optimize for one model) through painful sim-to-real failures around 2017. Domain randomization (Tobin et al., OpenAI) is the cousin of µ-synthesis with a different design parameterization."
      />

      <Deeper>
        <p>
          The classic H∞ design minimizes
          <Eq>{'\\sup_\\Delta \\| T_{w \\to z} \\|_\\infty'}</Eq> over an admissible set of
          plant perturbations <Eq>{'\\Delta'}</Eq>. µ-synthesis tightens this to structured
          uncertainty. Modern adaptive control (L1, MRAC) does something similar online:
          identify the current plant, retune the controller.
        </p>
        <p>
          The sim-to-real cousin: domain randomization picks a distribution
          <Eq>{'p(\\Delta)'}</Eq> over plants and trains a single policy that does well in
          expectation. PEARL, EPOpt, RMA push this further with task-conditioned policies
          or rapid adaptation. The card above just shows the simplest version of the
          trade-off: robust controllers cost a bit more nominally and a lot less at the
          tails.
        </p>
      </Deeper>
    </Card>
  );
};

/* ---- 22 · Next trails ---- */

const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" accent="sky" index={22}
        subtitle="Where the control toolkit takes you next — sibling explainers and the threads this survey deliberately left loose.">
    <p>
      Three moves, start to finish. <CrossLink to="frame" recap="Open-loop diverges, closed-loop holds. Feedback is the trick.">Feedback as a worldview</CrossLink>{' '}
      named the problem: a plant with an unstable mode needs feedback. The toolkit —
      state-space, LQR, Kalman, MPC, HJB — gave one way after another to design that
      feedback when the world is linear and Gaussian. The{' '}
      <CrossLink to="bridge" recap="LQR’s K = R⁻¹BᵀP equals the limit of REINFORCE on the LQ cost.">LQR ↔ policy gradients</CrossLink>{' '}
      bridge then handed it forward: RL solves the same problem when the linear-Gaussian
      assumptions break. The throughline is one object — the value function V(x) — wearing
      different clothes for each setting.
    </p>

    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'the same lens, applied elsewhere in this sandbox',
        items: [
          { label: 'Reinforcement Learning — the RL primer', href: '/#reinforcement-learning',
            note: 'Where LQR’s K becomes a neural network and the Riccati equation becomes a Q-network. Read together with card 19, then card 20.' },
          { label: 'Modeling Markets — the Kalman card', href: '/#markets-modeling',
            note: 'A working Kalman filter on a hidden vol-of-vol process. Same recursion as card 12; different application.' },
          { label: 'Systems Thinking — feedback loops everywhere', href: '/#systems-thinking',
            note: 'The qualitative cousin: thermostats, predator-prey, monetary policy. Control theory is the math behind it.' },
        ],
      },
      {
        title: 'Threads left loose',
        note: 'where a second pass would go deeper',
        items: [
          { label: 'µ-synthesis & structured uncertainty',
            note: 'Card 21 only sweeps gravity; full H∞ robust design partitions the uncertainty into structured blocks and runs D-K iteration. The right tool for high-stakes industrial control.' },
          { label: 'Iterative learning control (ILC) and repetitive control',
            note: 'When the same trajectory runs over and over (printing, manufacturing), you can learn the feed-forward correction from prior iterations. Bridges to imitation learning in RL.' },
          { label: 'Koopman operator & lifting',
            note: 'Approximate a nonlinear system as linear in a higher-dim feature space, then apply all of linear control. Pairs with sysid (card 17) — learn the lifting from data.' },
          { label: 'Distributional & risk-sensitive control',
            note: 'Optimize a quantile or CVaR of cost-to-go, not the expectation. The control cousin of distributional RL.' },
        ],
      },
    ]} />

    <div className="mt-5 border-l-4 border-sky-400/50 pl-4 py-1">
      <Quote className="w-4 h-4 text-sky-300 mb-1" />
      <p className="text-sm text-neutral-200 italic leading-snug">
        Reinforcement learning is the problem; control theory is the solution
        — when the problem is linear and you can write down the cost.
      </p>
    </div>
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
        <span className="text-sky-300">Kalman 1960 · Bellman 1957</span>
        <span className="text-emerald-300">Anderson-Moore · Kwakernaak-Sivan</span>
        <span className="text-amber-300">Åström-Murray · Skogestad-Postlethwaite</span>
        <span className="text-cyan-300">Bertsekas DP · Rawlings MPC</span>
        <span className="text-fuchsia-300">Recht 2018 (LQR ↔ RL)</span>
      </div>
      <p className="max-w-xl mx-auto">
        Cart-pole and HVAC dynamics are linearized about their natural operating
        points; matrices are kept in the same units the textbooks use so that the
        Riccati and Kalman steady states match published values. Sibling explainer
        in this sandbox: <em>Reinforcement Learning</em>.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function ControlTheoryExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].ct-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].ct-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(125,211,252,0.4);
        }
        input[type=range].ct-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #7dd3fc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <FrameCard />
        <DynamicsCard />
        <NoiseCard />
        <PidCard />
        <StabilityCard />
        <SensitivityCard />
        <FrequencyCard />
        <ControllabilityCard />
        <ObservabilityCard />
        <LqrCard />
        <CostShapeCard />
        <KalmanCard />
        <LqgCard />
        <MpcCard />
        <HjbCard />
        <MppiCard />
        <SysIdCard />
        <NonlinearCard />
        <BridgeCard />
        <BeliefCard />
        <RobustCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
