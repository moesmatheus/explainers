import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AlertTriangle, ArrowRight, ChevronDown, Compass, Crosshair, Eye,
  EyeOff, FlaskConical, FunctionSquare, Gauge, GitFork, HelpCircle, Layers,
  Lightbulb, Link2, LineChart, Quote, RotateCw, Ruler, ShieldAlert, Shuffle,
  Sigma, Sliders, Sparkles, Split, Star, Target, Telescope, Waves, Wand2,
  CheckCircle2, XCircle, Zap,
} from 'lucide-react';

/* ============================================================================
   Ordinary Differential Equations · intuition + the numerical-methods story
   A practitioner's survey across three lenses — geometric (vector fields,
   phase planes, stability), numerical (Euler → RK4 → stiffness → symplectic),
   and analytical (separable, integrating factors, Laplace). The pendulum is the
   running anchor: linear → nonlinear → damped → driven → chaotic.
   Foundations layer beneath the control-theory explainer; cross-links to it.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- KaTeX ------------------------------------------------------------------

const KATEX_MACROS = {
  '\\sol': '\\textcolor{##c4b5fd}{#1}',  // violet  · solution / flow y(t)
  '\\st':  '\\textcolor{##67e8f9}{#1}',  // cyan    · state / vector field
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber   · numerical / step h
  '\\un':  '\\textcolor{##fb7185}{#1}',  // rose    · instability / chaos
  '\\co':  '\\textcolor{##fbbf24}{#1}',  // amber   · constants
  '\\an':  '\\textcolor{##f0abfc}{#1}',  // fuchsia · anchors
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

// --- numeric helpers + integrators ------------------------------------------

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const fmtN = (v, d = 2) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d);

// Generic explicit integrators for a first-order vector system ẋ = f(x, t).
// f takes (x:array, t:number) and returns dx/dt as an array of the same length.
const vstep = (x, k, s) => x.map((xi, i) => xi + s * k[i]);

const eulerStep = (f, x, t, h) => vstep(x, f(x, t), h);

const rk2Step = (f, x, t, h) => {
  const k1 = f(x, t);
  const k2 = f(vstep(x, k1, h), t + h);
  return x.map((xi, i) => xi + (h / 2) * (k1[i] + k2[i]));
};

const rk4Step = (f, x, t, h) => {
  const k1 = f(x, t);
  const k2 = f(vstep(x, k1, h / 2), t + h / 2);
  const k3 = f(vstep(x, k2, h / 2), t + h / 2);
  const k4 = f(vstep(x, k3, h), t + h);
  return x.map((xi, i) => xi + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
};

// Roll out a system from x0 for N steps of size h with a chosen stepper.
const integrate = (f, x0, t0, h, N, stepper = rk4Step) => {
  const xs = [x0.slice()]; let x = x0.slice(); let t = t0;
  for (let i = 0; i < N; i++) { x = stepper(f, x, t, h); t += h; xs.push(x.slice()); }
  return xs;
};

// --- the pendulum · the running anchor --------------------------------------
// state s = [θ, ω]  (angle from straight-down, angular velocity).
//   θ'' = −(g/L) sinθ − c·ω + A·cos(Ω t)
// c = damping, A = drive amplitude, Ω = drive frequency. g/L sets the natural
// frequency ω₀ = √(g/L). Defaults give ω₀ = 1 (g = L = 1) for clean numbers.
const PEND = { g: 1, L: 1, c: 0, A: 0, Om: 0 };

const pendDeriv = (s, p, t = 0) => {
  const [th, om] = s;
  return [om, -(p.g / p.L) * Math.sin(th) - p.c * om + p.A * Math.cos(p.Om * t)];
};
// Total energy per unit (mL²): kinetic ½ω² + potential −(g/L)cosθ.
const pendEnergy = (th, om, p) => 0.5 * om * om - (p.g / p.L) * Math.cos(th);
// Curried derivative usable by the generic integrators / PhasePortrait.
const pendF = (p) => (s, t) => pendDeriv(s, p, t);

// Symplectic integrators for the undamped pendulum (Hamiltonian, c = A = 0).
// Semi-implicit (symplectic) Euler: update momentum first, then position with it.
const symplecticEulerStep = (p, s, h) => {
  const om = s[1] - h * (p.g / p.L) * Math.sin(s[0]);
  return [s[0] + h * om, om];
};
// Velocity Verlet / leapfrog — second-order and symplectic.
const leapfrogStep = (p, s, h) => {
  const a0 = -(p.g / p.L) * Math.sin(s[0]);
  const th = s[0] + s[1] * h + 0.5 * a0 * h * h;
  const a1 = -(p.g / p.L) * Math.sin(th);
  return [th, s[1] + 0.5 * (a0 + a1) * h];
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

const Card = ({ id, icon: Icon, title, subtitle, accent = 'violet', index, source, anchor = false, children }) => {
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
const Chip = ({ children, color = 'violet' }) => (
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
  'ODE': 'Ordinary Differential Equation — an equation relating a function of ONE variable to its derivatives. "Ordinary" distinguishes it from a PDE, which involves partial derivatives in several variables.',
  'order': 'The highest derivative that appears. y′ = f is first-order; the pendulum θ″ + … = 0 is second-order. Any order-n ODE rewrites as n coupled first-order equations.',
  'autonomous': 'An ODE whose right-hand side does not depend on t explicitly: ẋ = f(x). Its vector field is frozen in time, so the phase-plane picture tells the whole story. Adding a periodic drive makes it non-autonomous.',
  'linear': 'An ODE is linear if the unknown and its derivatives appear only to the first power and are not multiplied together: y′ + p(t)y = q(t). Linear systems superpose; nonlinear ones (sin θ) generally do not.',
  'initial value problem': 'An ODE plus enough initial data (y(t₀), and y′(t₀)… up to order−1) to pin down a unique solution. Abbreviated IVP. Contrast a boundary value problem, which fixes data at two endpoints.',
  'equilibrium': 'A state where the vector field vanishes, f(x*) = 0, so the system can sit there forever. Also called a fixed point, steady state, or critical point. The pendulum has them at hanging-down and standing-up.',
  'fixed point': 'A point x* with f(x*) = 0 — the system, placed exactly there, never moves. Stability asks what happens to nearby states. Synonym for equilibrium.',
  'Lipschitz': 'A function f is Lipschitz if |f(a)−f(b)| ≤ K|a−b| for some constant K — its slope is bounded. Picard–Lindelöf guarantees a unique solution when f is Lipschitz in the state; the cube-root y^{1/3} fails it at 0, and uniqueness breaks.',
  'integrating factor': 'A multiplier μ(t) = e^{∫p dt} that turns a linear first-order ODE into the derivative of a product, (μy)′ = μq, so you can integrate both sides directly.',
  'characteristic equation': 'For a constant-coefficient linear ODE, substituting y = e^{rt} gives a polynomial in r whose roots r determine the solution: real roots → exponentials, complex roots → oscillations, repeated roots → t·e^{rt} terms.',
  'eigenvalue': 'A scalar λ with Av = λv for a nonzero eigenvector v. For ẋ = Ax the eigenvalues of A are the growth/decay rates and oscillation frequencies; their signs and imaginary parts classify the phase portrait.',
  'phase plane': 'The plane of the state (e.g. (θ, ω)) where each point carries the velocity vector f(x). Solutions are curves flowing along the arrows — the whole behavior of a 2-D autonomous system is one picture.',
  'phase portrait': 'The phase plane drawn with its vector field plus representative trajectories and fixed points — a complete qualitative map of the dynamics.',
  'separatrix': 'A special trajectory that divides the phase plane into regions of qualitatively different motion. For the pendulum it separates back-and-forth swinging from full over-the-top rotation.',
  'nullcline': 'The curve where one component of the vector field is zero (ẋ = 0 or ẏ = 0). Fixed points sit at nullcline intersections; nullclines sketch the flow direction by hand.',
  'Jacobian': 'The matrix of partial derivatives of f, evaluated at a fixed point. It is the local linearization: near the fixed point the nonlinear flow looks like ẋ = J·x.',
  'Lyapunov function': 'A scalar "energy-like" V(x) ≥ 0 that decreases along trajectories (V̇ ≤ 0). Finding one proves stability without solving the ODE. Mechanical energy is the natural choice for the pendulum.',
  'limit cycle': 'An isolated closed trajectory that nearby solutions spiral onto — a self-sustained oscillation with its own amplitude, set by the dynamics rather than the initial condition. The Van der Pol oscillator is the classic example.',
  'separable': 'A first-order ODE that factors as dy/dx = g(x)h(y), so you can move all y to one side and all x to the other and integrate each independently.',
  'Laplace transform': 'An integral transform F(s) = ∫₀^∞ f(t)e^{−st}dt that turns differentiation into multiplication by s. It converts a linear ODE with initial conditions into an algebra problem, then inverts back.',
  'transfer function': 'For a linear time-invariant system, the Laplace-domain ratio G(s) = output/input. Its poles (roots of the denominator) are exactly the characteristic roots and set the system’s behavior.',
  'resonance': 'The large response that occurs when a system is driven near its natural frequency. With light damping the steady-state amplitude peaks sharply; with none it grows without bound.',
  'local truncation error': 'The error a numerical method makes in a single step, assuming the previous value was exact. Euler’s is O(h²) per step; accumulated over 1/h steps it gives O(h) global error.',
  'global error': 'The total error of a numerical solution at a fixed final time, accumulated over all steps. Euler is first-order (O(h)); RK4 is fourth-order (O(h⁴)) — halving h cuts RK4 error ~16×.',
  'Runge–Kutta': 'A family of one-step integrators that sample the slope at several points within a step and combine them. RK4 — four slope evaluations per step — is the everyday workhorse for non-stiff problems.',
  'stiffness': 'A system with widely separated timescales — a fast-decaying mode alongside slow dynamics. Explicit methods must take tiny steps for stability even after the fast mode has died, making them brutally slow; implicit methods escape this.',
  'stability region': 'The set of complex values hλ for which a numerical method keeps the test equation y′ = λy bounded. Explicit Euler’s is a small disk; implicit (backward) Euler is stable over the entire left half-plane.',
  'implicit method': 'A scheme where the unknown next value appears on both sides (e.g. backward Euler yₙ₊₁ = yₙ + h·f(yₙ₊₁)), requiring an equation solve each step but buying large, unconditional stability for stiff problems.',
  'adaptive step': 'Choosing the step size on the fly from an error estimate — small steps where the solution moves fast, large where it is smooth. Embedded Runge–Kutta pairs (RKF45, Dormand–Prince) compute the estimate almost for free.',
  'symplectic': 'An integrator that exactly preserves the geometric structure (phase-space area / a nearby "shadow" energy) of a Hamiltonian system. Energy stays bounded for billions of steps, so orbits don’t spiral in or out — why physics and orbital simulations use them.',
  'Hamiltonian': 'The total-energy function H(q, p) of a conservative mechanical system. Its level sets are the trajectories, and the flow preserves phase-space volume (Liouville’s theorem).',
  'Poincaré section': 'A lower-dimensional snapshot of a trajectory taken once per drive cycle (a strobe). Periodic motion shows as a few fixed dots; chaos fills out a fractal cloud — the cleanest fingerprint of chaos.',
  'bifurcation': 'A qualitative change in the dynamics (a fixed point appearing, splitting, or losing stability) as a parameter crosses a critical value. Period-doubling cascades are a famous route to chaos.',
  'attractor': 'A set that nearby trajectories converge onto as t → ∞ — a point, a limit cycle, or a fractal "strange attractor" for chaotic systems.',
  'sensitive dependence': 'The hallmark of chaos: two initial conditions a hair apart diverge exponentially, so long-term prediction becomes impossible even though the equations are deterministic.',
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

const Intuition = ({ children, title = 'first, the picture' }) => (
  <div className="mt-2 mb-3 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.04] px-4 py-3">
    <div className="flex items-center gap-2 mb-2">
      <Lightbulb className="w-3.5 h-3.5 text-cyan-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{title}</span>
    </div>
    <div className="text-[14px] leading-relaxed text-neutral-200 space-y-2">{children}</div>
  </div>
);

const ReadEq = ({ children }) => (
  <div className="mt-1 mb-3 pl-3 border-l-2 border-cyan-400/40 text-[13px] text-neutral-300 leading-relaxed">
    <span className="text-[9px] uppercase tracking-[0.22em] text-cyan-300 mr-2 font-mono">read as</span>
    {children}
  </div>
);

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

/* ---- shared: phase portrait (vector field + animated trajectories) --------
   Pass a `phase` config:
     { deriv(x,y) -> [dx,dy], xRange:[lo,hi], yRange:[lo,hi], xLabel, yLabel,
       initials:[[x0,y0],...], dt?, eigenLines?:[{slope,color,label}],
       fixedPoints?:[{x,y,kind}], curves?:[{pts:[[x,y]],color,dash}],
       verdict?, verdictColor?, sliceNote? }
   Reused by the vector-field, phase-plane, eigenvalue, linearization,
   limit-cycle and chaos cards. ----------------------------------------------*/

const PhasePortrait = ({ phase, width = 380, height = 280, framesPerTraj = 110 }) => {
  const dt = phase.dt ?? 0.04;
  const uid = React.useId().replace(/:/g, '');

  const trajectories = useMemo(() => {
    return phase.initials.map(([x0, y0]) => {
      const xs = [[x0, y0]];
      let x = x0, y = y0;
      for (let t = 0; t < framesPerTraj; t++) {
        const [k1x, k1y] = phase.deriv(x, y);
        const [k2x, k2y] = phase.deriv(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
        const [k3x, k3y] = phase.deriv(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
        const [k4x, k4y] = phase.deriv(x + dt * k3x, y + dt * k3y);
        x = x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        y = y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
        const [xmin, xmax] = phase.xRange;
        const [ymin, ymax] = phase.yRange;
        if (x < xmin * 1.5 - 1 || x > xmax * 1.5 + 1 || y < ymin * 1.5 - 1 || y > ymax * 1.5 + 1) {
          for (let pad = t; pad < framesPerTraj; pad++) xs.push([xs[xs.length - 1][0], xs[xs.length - 1][1]]);
          break;
        }
        xs.push([x, y]);
      }
      return xs;
    });
  }, [phase, framesPerTraj, dt]);

  const grid = useMemo(() => {
    const NX = 13, NY = 11;
    const [xmin, xmax] = phase.xRange;
    const [ymin, ymax] = phase.yRange;
    const dx = (xmax - xmin) / (NX - 1);
    const dy = (ymax - ymin) / (NY - 1);
    const cells = [];
    let maxMag = 1e-6;
    for (let i = 0; i < NX; i++) {
      for (let j = 0; j < NY; j++) {
        const x = xmin + i * dx;
        const y = ymin + j * dy;
        const [vx, vy] = phase.deriv(x, y);
        const mag = Math.hypot(vx, vy);
        if (mag > maxMag) maxMag = mag;
        cells.push({ x, y, vx, vy, mag });
      }
    }
    return { cells, maxMag };
  }, [phase]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => { setIdx(0); }, [phase]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIdx(i => (i + 1) % framesPerTraj), Math.max(20, 1000 * dt / speed));
    return () => clearInterval(id);
  }, [playing, speed, phase, framesPerTraj, dt]);

  const W = width, H = height;
  const padL = 38, padR = 14, padT = 14, padB = 28;
  const [xmin, xmax] = phase.xRange;
  const [ymin, ymax] = phase.yRange;
  const sx = (x) => padL + ((x - xmin) / (xmax - xmin)) * (W - padL - padR);
  const sy = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * (H - padT - padB);
  const ARR_LEN = 13;
  const trajColors = ['#c4b5fd', '#67e8f9', '#f0abfc', '#fde68a', '#6ee7b7', '#fb923c'];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => setPlaying(p => !p)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">{playing ? 'pause' : 'play'}</button>
        <button onClick={() => setIdx(0)} className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/[0.04] text-neutral-300">reset</button>
        <label className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
          speed
          <input type="range" min="0.25" max="3" step="0.25" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="ode-range w-16" />
          <span className="tabular-nums">{speed.toFixed(2)}×</span>
        </label>
        <span className="text-[10px] text-neutral-500 font-mono ml-2">t = {(idx * dt).toFixed(2)}</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id={`ph-arrow-${uid}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.55)" />
          </marker>
        </defs>
        <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke="rgba(255,255,255,0.20)" />
        <line x1={sx(0)} y1={padT} x2={sx(0)} y2={H - padB} stroke="rgba(255,255,255,0.20)" />
        <text x={W - padR + 2} y={sy(0) - 4} fontSize="9" fill="rgba(255,255,255,0.45)" textAnchor="end" fontFamily="ui-monospace, monospace">{phase.xLabel}</text>
        <text x={sx(0) + 4} y={padT + 9} fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{phase.yLabel}</text>

        {/* extra static curves (e.g. separatrix) drawn beneath everything */}
        {phase.curves && phase.curves.map((cu, i) => (
          <polyline key={`cu-${i}`} fill="none" stroke={cu.color} strokeOpacity={cu.opacity ?? 0.8}
            strokeWidth={cu.width ?? 1.5} strokeDasharray={cu.dash || undefined}
            points={cu.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} />
        ))}

        {/* eigenvector / asymptote lines */}
        {phase.eigenLines && phase.eigenLines.map((ev, i) => {
          let y1 = ev.slope * xmin, y2 = ev.slope * xmax;
          y1 = clamp(y1, ymin, ymax); y2 = clamp(y2, ymin, ymax);
          return (
            <g key={`ev-${i}`}>
              <line x1={sx(xmin)} y1={sy(y1)} x2={sx(xmax)} y2={sy(y2)} stroke={ev.color} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="5 3" />
              {ev.label && <text x={sx(xmax * 0.85)} y={sy(y2 * 0.85) - 4} fontSize="9" fill={ev.color} textAnchor="end" fontFamily="ui-monospace, monospace">{ev.label}</text>}
            </g>
          );
        })}

        {/* vector field */}
        {grid.cells.map((c, i) => {
          const x0 = sx(c.x), y0 = sy(c.y);
          const u = c.vx / Math.max(1e-9, grid.maxMag);
          const v = c.vy / Math.max(1e-9, grid.maxMag);
          const norm = Math.hypot(u, v);
          const len = ARR_LEN * (0.35 + 0.65 * norm);
          const ux = u / Math.max(1e-9, norm);
          const uy = v / Math.max(1e-9, norm);
          const x1 = x0 + ux * len, y1 = y0 - uy * len;
          return (
            <line key={`arr-${i}`} x1={x0} y1={y0} x2={x1} y2={y1}
              stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" opacity={0.35 + 0.45 * norm}
              markerEnd={`url(#ph-arrow-${uid})`} />
          );
        })}

        {/* trajectories animated up to idx */}
        {trajectories.map((traj, ti) => {
          const upTo = Math.min(idx + 1, traj.length);
          const pts = traj.slice(0, upTo).map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ');
          const head = traj[upTo - 1];
          const c = phase.trajColor || trajColors[ti % trajColors.length];
          return (
            <g key={`tj-${ti}`}>
              <polyline fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" points={pts} opacity="0.9" />
              <circle cx={sx(traj[0][0])} cy={sy(traj[0][1])} r="2" fill={c} opacity="0.4" />
              {head && <circle cx={sx(head[0])} cy={sy(head[1])} r="3" fill={c} />}
            </g>
          );
        })}

        {/* fixed points */}
        {phase.fixedPoints && phase.fixedPoints.map((fp, i) => {
          const stable = fp.kind === 'stable';
          const col = stable ? '#6ee7b7' : fp.kind === 'saddle' ? '#fb7185' : '#fbbf24';
          return (
            <circle key={`fp-${i}`} cx={sx(fp.x)} cy={sy(fp.y)} r="3.5"
              fill={stable ? col : 'none'} stroke={col} strokeWidth="1.5" />
          );
        })}
      </svg>
      <div className="flex items-center justify-between mt-1">
        <div className="text-[10px] font-mono" style={{ color: phase.verdictColor }}>{phase.verdict}</div>
        {phase.sliceNote && <div className="text-[10px] text-neutral-500 font-mono">{phase.sliceNote}</div>}
      </div>
    </div>
  );
};

/* ---- shared: a swinging pendulum, drawn from its angle θ ------------------ */

const PendulumSVG = ({ theta, width = 190, height = 180, accent = '#c4b5fd',
                       trail = [], Lpx = 78, caption }) => {
  const cx = width / 2, py = height * 0.26;
  const bx = cx + Lpx * Math.sin(theta), by = py + Lpx * Math.cos(theta);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block mx-auto">
      {/* ceiling */}
      <line x1={cx - 26} y1={py} x2={cx + 26} y2={py} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <line x1={cx} y1={py} x2={cx} y2={py + Lpx + 14} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
      {trail.length > 1 && (
        <polyline fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="1"
          points={trail.map(t => `${cx + Lpx * Math.sin(t)},${py + Lpx * Math.cos(t)}`).join(' ')} />
      )}
      <line x1={cx} y1={py} x2={bx} y2={by} stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={py} r="3" fill="white" />
      <circle cx={bx} cy={by} r="9" fill={accent} stroke="#0a0a0a" strokeWidth="1.5" />
      {caption && (
        <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="10"
          fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{caption}</text>
      )}
    </svg>
  );
};

// Live pendulum integrator. Advances state = [θ, ω] in real time via RK4.
// `params` should be memoized by the caller; `x0` resets the sim when it changes.
const usePendulum = (params, x0, { dt = 0.02, sub = 2, running = true, trailLen = 0 } = {}) => {
  const [state, setState] = useState(x0);
  const [trail, setTrail] = useState([]);
  const sRef = useRef(x0); const tRef = useRef(0);
  useEffect(() => { sRef.current = x0.slice(); tRef.current = 0; setState(x0.slice()); setTrail([]); }, [x0[0], x0[1]]);
  useEffect(() => {
    if (!running) return;
    const f = (s, t) => pendDeriv(s, params, t);
    const id = setInterval(() => {
      let s = sRef.current, t = tRef.current;
      for (let i = 0; i < sub; i++) { s = rk4Step(f, s, t, dt); t += dt; }
      sRef.current = s; tRef.current = t; setState(s);
      if (trailLen) setTrail(tr => [...tr.slice(-trailLen), s[0]]);
    }, dt * sub * 1000);
    return () => clearInterval(id);
  }, [params, running, dt, sub, trailLen]);
  return { state, trail };
};

// --- Hero -------------------------------------------------------------------

const HeroField = () => {
  // a faint decorative slope field in the background
  const arrows = useMemo(() => {
    const out = [];
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 9; j++) {
        const x = (i + 0.5) / 16, y = (j + 0.5) / 9;
        // a swirl field for visual interest
        const vx = Math.sin(y * Math.PI * 2) * 0.5;
        const vy = Math.cos(x * Math.PI * 2) * 0.5;
        const ang = Math.atan2(vy, vx);
        out.push({ x: x * 100, y: y * 100, ang: (ang * 180) / Math.PI });
      }
    }
    return out;
  }, []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      {arrows.map((a, i) => (
        <line key={i} x1={a.x} y1={a.y}
          x2={a.x + 2.4 * Math.cos((a.ang * Math.PI) / 180)}
          y2={a.y + 2.4 * Math.sin((a.ang * Math.PI) / 180)}
          stroke="#67e8f9" strokeWidth="0.18" opacity="0.5" />
      ))}
    </svg>
  );
};

/* ---- shared: lightweight multi-line time-series plot ----------------------
   series: [{ pts:[[x,y],...], color, width?, dash?, label? }]
   hlines/vlines: [{ at, color, label?, dash? }]   dots: [{ x, y, color, r? }] */
const MultiLinePlot = ({ series, xRange, yRange, xLabel, yLabel, width = 380, height = 240,
                         hlines = [], vlines = [], dots = [], legend = true, yTicks }) => {
  const padL = 40, padR = 14, padT = 12, padB = 26;
  const [xmin, xmax] = xRange, [ymin, ymax] = yRange;
  const sx = (x) => padL + ((x - xmin) / (xmax - xmin)) * (width - padL - padR);
  const sy = (y) => padT + (1 - (y - ymin) / (ymax - ymin)) * (height - padT - padB);
  const ticks = yTicks ?? [ymin, (ymin + ymax) / 2, ymax];
  const clampPt = ([x, y]) => `${sx(x)},${sy(clamp(y, ymin - (ymax - ymin), ymax + (ymax - ymin)))}`;
  return (
    <div>
      {legend && series.some(s => s.label) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-1 text-[10px] font-mono text-neutral-400">
          {series.filter(s => s.label).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span style={{ background: s.color }} className="inline-block w-3 h-[2px]" />{s.label}
            </span>
          ))}
        </div>
      )}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="rgba(255,255,255,0.18)" />
        <line x1={padL} y1={sy(clamp(0, ymin, ymax))} x2={width - padR} y2={sy(clamp(0, ymin, ymax))} stroke="rgba(255,255,255,0.18)" />
        {ticks.map((t, i) => (
          <g key={`yt-${i}`}>
            <line x1={padL - 3} y1={sy(t)} x2={padL} y2={sy(t)} stroke="rgba(255,255,255,0.3)" />
            <text x={padL - 5} y={sy(t) + 3} fontSize="8" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{Number.isInteger(t) ? t : t.toFixed(1)}</text>
          </g>
        ))}
        <text x={padL - 4} y={padT + 8} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{yLabel}</text>
        <text x={width - padR} y={height - 8} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">{xLabel}</text>
        {hlines.map((h, i) => (
          <g key={`hl-${i}`}>
            <line x1={padL} y1={sy(h.at)} x2={width - padR} y2={sy(h.at)} stroke={h.color} strokeOpacity="0.6" strokeDasharray={h.dash ?? '4 3'} strokeWidth="1" />
            {h.label && <text x={width - padR} y={sy(h.at) - 3} fontSize="8" textAnchor="end" fill={h.color} fontFamily="ui-monospace, monospace">{h.label}</text>}
          </g>
        ))}
        {vlines.map((v, i) => (
          <line key={`vl-${i}`} x1={sx(v.at)} y1={padT} x2={sx(v.at)} y2={height - padB} stroke={v.color} strokeOpacity="0.6" strokeDasharray={v.dash ?? '4 3'} strokeWidth="1" />
        ))}
        {series.map((s, i) => (
          <polyline key={`s-${i}`} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.8}
            strokeDasharray={s.dash || undefined} strokeLinecap="round" strokeLinejoin="round"
            points={s.pts.map(clampPt).join(' ')} opacity={s.opacity ?? 1} />
        ))}
        {dots.map((d, i) => <circle key={`d-${i}`} cx={sx(d.x)} cy={sy(d.y)} r={d.r ?? 3} fill={d.color} stroke="#0a0a0a" strokeWidth="1" />)}
      </svg>
    </div>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-cyan-500/5 to-transparent" />
    <HeroField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <Waves className="w-3.5 h-3.5" /> ordinary differential equations
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-cyan-200 bg-clip-text text-transparent">
          Differential Equations
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">An ODE is a rule for change. A solution is the path that obeys it. The whole subject is reading that path three ways.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Give the world a rule — <span className="text-cyan-300">an arrow at every point</span> — and ask what path threads
          through them. Sometimes you can <span className="text-violet-300">solve it in closed form</span>; usually you
          can only <span className="text-cyan-300">see its shape</span> in the phase plane or
          <span className="text-amber-300"> march it forward numerically</span>. One pendulum carries the whole story —
          from a tidy sine wave to <span className="text-rose-300">deterministic chaos</span>.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-cyan-300">vector fields · phase planes</span>
          <span className="text-violet-300">separable · linear · Laplace</span>
          <span className="text-amber-300">Euler · RK4 · stiffness · symplectic</span>
          <span className="text-rose-300">limit cycles · chaos</span>
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
  { id: 'whatis',     label: 'What is an ODE?',          icon: FunctionSquare },
  { id: 'field',      label: 'The vector-field view',    icon: Waves, anchor: true },
  { id: 'separable',  label: 'Separable equations',      icon: Split },
  { id: 'linear1',    label: 'Linear & integrating factor', icon: LineChart },
  { id: 'exist',      label: 'Existence & uniqueness',   icon: ShieldAlert },
  { id: 'second',     label: 'Second-order linear',      icon: Activity },
  { id: 'resonance',  label: 'Resonance & forcing',      icon: Zap },
  { id: 'laplace',    label: 'Laplace transforms',       icon: Sigma },
  { id: 'phaseplane', label: 'Systems & the phase plane', icon: GitFork, anchor: true },
  { id: 'eigen',      label: 'Linear systems & eigenvalues', icon: Layers },
  { id: 'tracedet',   label: 'Trace–determinant plane',  icon: Crosshair },
  { id: 'linearize',  label: 'Linearization & Jacobian', icon: Telescope },
  { id: 'lyapunov',   label: 'Stability & Lyapunov',     icon: Target },
  { id: 'limitcycle', label: 'Limit cycles',             icon: RotateCw },
  { id: 'euler',      label: "Euler's method",           icon: Ruler, anchor: true },
  { id: 'rk4',        label: 'Runge–Kutta (RK4)',        icon: Gauge },
  { id: 'stiff',      label: 'Stability & stiffness',    icon: AlertTriangle },
  { id: 'adaptive',   label: 'Adaptive stepping',        icon: Sliders },
  { id: 'symplectic', label: 'Symplectic & conservation', icon: Sparkles },
  { id: 'chaos',      label: 'Driven pendulum → chaos',  icon: Wand2, anchor: true },
  { id: 'trails',     label: 'Next trails',              icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-100' : 'border-transparent text-neutral-400'}`}>
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
   CONTENT CARDS
   ========================================================================== */

const WhatIsCard = () => {
  const params = useMemo(() => ({ g: 1, L: 1, c: 0, A: 0, Om: 0 }), []);
  const x0 = useMemo(() => [1.1, 0], []);
  const { state, trail } = usePendulum(params, x0, { trailLen: 60 });
  return (
    <Card id="whatis" icon={FunctionSquare} title="What is an ODE?" accent="violet" index={1}
          subtitle="A rule for change — and the path that obeys it">
      <Intuition>
        <p>
          You rarely know <em>where</em> something will be. But you often know the <em>rule for how it
          changes</em> right now: a cooling coffee loses heat in proportion to how much hotter it is than
          the room; a pendulum is pulled back toward straight-down ever harder the further it swings. An{' '}
          <Term>ODE</Term> packages exactly that — <strong>given the current state, here is its rate of
          change</strong>. A <em>solution</em> is then the entire path that threads through those rules.
        </p>
      </Intuition>

      <p>The general first-order form is just "rate = some function of where and when you are":</p>
      <Block>{'\\frac{d\\sol{y}}{dt} = \\st{f}(t, \\sol{y}), \\qquad \\sol{y}(t_0) = \\sol{y_0}'}</Block>
      <ReadEq>
        the slope of the solution <Eq>{'\\sol{y}(t)'}</Eq> at any instant is dictated by the field{' '}
        <Eq>{'\\st{f}'}</Eq> — pin down one starting point <Eq>{'\\sol{y_0}'}</Eq> and the future is
        determined.
      </ReadEq>

      <p>
        Three labels you'll reach for constantly: the <Term>order</Term> is the highest derivative present;
        an equation is <Term>linear</Term> if <Eq>{'\\sol{y}'}</Eq> and its derivatives never multiply each
        other or pass through a nonlinear function; it is <Term>autonomous</Term> if{' '}
        <Eq>{'\\st{f}'}</Eq> has no explicit <Eq>t</Eq>. A rule plus a starting condition is an{' '}
        <Term>initial value problem</Term>.
      </p>

      <div className="grid md:grid-cols-2 gap-4 items-center my-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <PendulumSVG theta={state[0]} trail={trail}
            caption={`θ = ${(state[0] * 180 / Math.PI).toFixed(0)}°   ω = ${state[1].toFixed(2)}`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm">
            Our running example is the <strong className="text-cyan-200">pendulum</strong>. Newton's law gives
            a single <strong>second-order</strong> equation for the angle <Eq>{'\\sol{\\theta}'}</Eq>:
          </p>
          <Block>{'\\ddot{\\sol{\\theta}} + \\frac{g}{L}\\,\\sin\\sol{\\theta} = 0'}</Block>
          <p className="text-sm">
            The restoring pull <Eq>{'-\\tfrac{g}{L}\\sin\\theta'}</Eq> is what bends the path back. That{' '}
            <Eq>{'\\sin'}</Eq> is the whole drama of this explainer: it makes the equation{' '}
            <strong>nonlinear</strong>, so there's no tidy formula — only geometry and numerics.
          </p>
        </div>
      </div>

      <p>
        Here is the move that makes everything downstream possible. A second-order equation becomes a{' '}
        <strong>system of two first-order equations</strong> by naming the velocity{' '}
        <Eq>{'\\st{\\omega} = \\dot\\theta'}</Eq> as its own variable:
      </p>
      <Block>{'\\frac{d}{dt}\\begin{pmatrix}\\sol{\\theta}\\\\[2pt]\\st{\\omega}\\end{pmatrix} = \\begin{pmatrix}\\st{\\omega}\\\\[2pt]-\\frac{g}{L}\\sin\\sol{\\theta}\\end{pmatrix}'}</Block>
      <ReadEq>
        the state is now the <em>pair</em> <Eq>{'(\\theta, \\omega)'}</Eq>; angle changes at rate{' '}
        <Eq>{'\\omega'}</Eq>, and <Eq>{'\\omega'}</Eq> changes at the rate gravity dictates. Any order-<Eq>n</Eq>{' '}
        ODE flattens to <Eq>n</Eq> coupled first-order ones this way.
      </ReadEq>

      <MinSchema>
        an ODE says <em>state → rate of change</em>; a solution is the whole trajectory that obeys it. Every
        higher-order equation is secretly a first-order <em>system</em> in a bigger state — which is why the
        rest of this explainer can speak one language: <Eq>{'\\dot{\\st{x}} = \\st{f}(\\st{x})'}</Eq>.
      </MinSchema>

      <Misconception
        wrong={'"Solving an ODE gives you a number — the answer."'}
        right={'A solution is a function — a whole path y(t) (or a family of them, one per initial condition).'}
        because={'The unknown in an ODE is a function, not a scalar. That is exactly why a single initial condition is needed to select one path out of the family.'}
      />

      <Deeper>
        <p>
          <strong>Why first-order systems are the universal form.</strong> Numerical solvers, existence
          theorems, and the phase-plane picture all assume <Eq>{'\\dot x = f(x)'}</Eq> with <Eq>x</Eq> a
          vector. The flattening trick — introduce a new variable for each derivative up to order{' '}
          <Eq>{'n-1'}</Eq> — means we never need separate machinery for higher order. The cost is dimension:
          the pendulum lives in a 2-D state; adding a periodic drive (later) needs a third coordinate, and
          that extra dimension is precisely what unlocks chaos.
        </p>
        <p>
          <strong>Autonomous vs not.</strong> The undriven pendulum is autonomous — its rule doesn't depend
          on the clock, so the same state always produces the same motion and we can draw one static{' '}
          <Term>phase portrait</Term>. Switch on a periodic push <Eq>{'A\\cos(\\Omega t)'}</Eq> and the field
          breathes with time; that's what forces us to a stroboscopic <Term>Poincaré section</Term> to see
          structure.
        </p>
      </Deeper>
    </Card>
  );
};
const FIELD_EXAMPLES = [
  { id: 'logistic', label: "y' = y(1−y)", f: (t, y) => y * (1 - y), tRange: [0, 6], yRange: [-0.35, 1.7],
    note: 'Logistic growth. Every start funnels to the carrying capacity y = 1 — except the knife-edge start at exactly 0.' },
  { id: 'linear', label: "y' = t − y", f: (t, y) => t - y, tRange: [0, 6], yRange: [-1.2, 5.2],
    note: 'A moving target: every curve is drawn toward the line y = t − 1 and then rides alongside it.' },
  { id: 'forced', label: "y' = sin t − y", f: (t, y) => Math.sin(t) - y, tRange: [0, 13], yRange: [-1.7, 1.7],
    note: 'The transient decays and leaves a forced oscillation — a first taste of the resonance card.' },
];

const SlopeFieldPlot = ({ f, tRange, yRange, start, onPick, width = 380, height = 270 }) => {
  const padL = 32, padR = 12, padT = 12, padB = 26;
  const [tmin, tmax] = tRange, [ymin, ymax] = yRange;
  const scaleX = (width - padL - padR) / (tmax - tmin);
  const scaleY = (height - padT - padB) / (ymax - ymin);
  const sx = (t) => padL + (t - tmin) * scaleX;
  const sy = (y) => padT + (ymax - y) * scaleY;

  const segs = useMemo(() => {
    const NX = 17, NY = 12, half = 7, out = [];
    for (let i = 0; i < NX; i++) {
      for (let j = 0; j < NY; j++) {
        const t = tmin + ((i + 0.5) / NX) * (tmax - tmin);
        const y = ymin + ((j + 0.5) / NY) * (ymax - ymin);
        const slope = f(t, y);
        let dx = scaleX, dy = -scaleY * slope;       // screen-space direction
        const n = Math.hypot(dx, dy) || 1;
        dx = (dx / n) * half; dy = (dy / n) * half;
        const X = sx(t), Y = sy(y);
        out.push({ x1: X - dx, y1: Y - dy, x2: X + dx, y2: Y + dy, m: Math.abs(slope) });
      }
    }
    return out;
  }, [f, tmin, tmax, ymin, ymax, scaleX, scaleY]);

  const curve = useMemo(() => {
    const F = (s, t) => [f(t, s[0])];
    const h = 0.02;
    const fwd = [[start[0], start[1]]];
    let s = [start[1]], t = start[0];
    while (t < tmax) { s = rk4Step(F, s, t, h); t += h; if (s[0] < ymin - 2 || s[0] > ymax + 2) break; fwd.push([t, s[0]]); }
    const back = [];
    s = [start[1]]; t = start[0];
    while (t > tmin) { s = rk4Step(F, s, t, -h); t -= h; if (s[0] < ymin - 2 || s[0] > ymax + 2) break; back.push([t, s[0]]); }
    return back.reverse().concat(fwd);
  }, [f, start, tmin, tmax, ymin, ymax]);

  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) * (width / r.width);
    const py = (e.clientY - r.top) * (height / r.height);
    const t = clamp(tmin + (px - padL) / scaleX, tmin, tmax);
    const y = clamp(ymax - (py - padT) / scaleY, ymin, ymax);
    onPick([t, y]);
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full cursor-crosshair" onClick={pick}>
      {sy(0) > padT && sy(0) < height - padB &&
        <line x1={padL} y1={sy(0)} x2={width - padR} y2={sy(0)} stroke="rgba(255,255,255,0.16)" />}
      <line x1={padL} y1={padT} x2={padL} y2={height - padB} stroke="rgba(255,255,255,0.16)" />
      <text x={width - padR} y={sy(0) - 4 > padT ? sy(0) - 4 : padT + 9} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">t</text>
      <text x={padL + 4} y={padT + 9} fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">y</text>
      {segs.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#67e8f9" strokeOpacity={0.28 + 0.32 * Math.min(1, s.m)} strokeWidth="1.1" strokeLinecap="round" />
      ))}
      <polyline fill="none" stroke="#c4b5fd" strokeWidth="2.2" strokeLinecap="round"
        points={curve.map(([t, y]) => `${sx(t)},${sy(clamp(y, ymin - 1, ymax + 1))}`).join(' ')} />
      <circle cx={sx(start[0])} cy={sy(clamp(start[1], ymin, ymax))} r="4.5" fill="#c4b5fd" stroke="#0a0a0a" strokeWidth="1.5" />
    </svg>
  );
};

const FieldCard = () => {
  const [exId, setExId] = useState('logistic');
  const ex = FIELD_EXAMPLES.find(e => e.id === exId);
  const [start, setStart] = useState([0.4, 0.15]);
  useEffect(() => {
    const e = FIELD_EXAMPLES.find(x => x.id === exId);
    setStart([e.tRange[0] + 0.4, (e.yRange[0] + e.yRange[1]) / 2 + 0.1]);
  }, [exId]);
  return (
    <Card id="field" icon={Waves} title="The vector-field view" accent="cyan" index={2} anchor
          subtitle="An arrow at every point; the solution is the curve that follows them">
      <Intuition>
        <p>
          Here is the single most useful picture in the whole subject. Don't think of an ODE as something to{' '}
          <em>solve</em> — think of it as a <strong className="text-cyan-200">field of arrows</strong>. At
          every point <Eq>{'(t, \\sol{y})'}</Eq> the equation hands you a slope <Eq>{'\\st{f}(t,\\sol{y})'}</Eq>:
          which way the path must head if it passes through there. A solution is then nothing more than a curve
          that stays <strong>tangent to the arrows everywhere</strong> — like a leaf carried by a current.
        </p>
      </Intuition>

      <p>
        That reframes "solving" entirely. You don't need a formula to know what the solutions look like — you
        just <em>follow the field</em>. Drop a starting point anywhere and a unique curve threads forward (and
        backward) through the arrows. <strong className="text-cyan-200">Click anywhere on the plot</strong> to
        place an initial condition and watch the trajectory it generates.
      </p>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {FIELD_EXAMPLES.map(e => (
            <button key={e.id} onClick={() => setExId(e.id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${exId === e.id ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
              {e.label}
            </button>
          ))}
        </div>
        <SlopeFieldPlot f={ex.f} tRange={ex.tRange} yRange={ex.yRange} start={start} onPick={setStart} />
        <div className="text-[12px] text-neutral-400 mt-1 leading-snug"><span className="text-cyan-300 font-mono text-[10px] uppercase tracking-wider mr-2">field</span>{ex.note}</div>
      </div>

      <Predict question="On the logistic field y′ = y(1−y), start your point anywhere above 0. Where does every curve end up as t grows?">
        They all flatten onto <Eq>{'\\sol{y}=1'}</Eq>, the stable equilibrium where the arrows go flat (<Eq>{'f=1\\cdot 0=0'}</Eq>). Start <em>exactly</em> at 0 and you stay — but it's a knife-edge: the tiniest nudge upward grows away. That's the difference between a stable and an unstable <Term>fixed point</Term>, read straight off the arrows.
      </Predict>

      <p>
        For our pendulum the state is two-dimensional, so its field of arrows lives in the{' '}
        <Eq>{'(\\theta, \\omega)'}</Eq> plane rather than over time — that's the{' '}
        <CrossLink to="phaseplane" recap="The pendulum's vector field drawn in the (θ, ω) plane: centers, saddles, and the separatrix.">phase plane</CrossLink>, and it's the same idea one dimension up.
      </p>

      <MinSchema>
        an ODE <em>is</em> a vector field; a solution is a curve everywhere tangent to it. You can read off
        equilibria, stability, and long-run fate by looking at the arrows — before solving anything.
      </MinSchema>

      <Deeper>
        <p>
          <strong>Why the curves never cross.</strong> Through each point the field specifies exactly one
          direction, so two distinct solution curves can't pass through the same point going different ways —
          if they touched, they'd have to merge. This "no-crossing" property is the geometric face of the{' '}
          <CrossLink to="exist" recap="Picard–Lindelöf: a Lipschitz field gives exactly one solution through each point.">existence-and-uniqueness theorem</CrossLink>, and it's why a slope field organizes into clean, nested families.
        </p>
        <p>
          <strong>Autonomous fields are even simpler.</strong> When <Eq>{'\\st{f}'}</Eq> has no explicit{' '}
          <Eq>t</Eq>, the arrows don't change as the clock ticks — the picture is frozen, and you can collapse
          it onto the state space alone. That's exactly why the autonomous pendulum gets one timeless phase
          portrait while the driven one (later) does not.
        </p>
      </Deeper>
    </Card>
  );
};
const SeparableCard = () => {
  const [k, setK] = useState(0.8);
  const inits = [0.5, 1.0, 1.5, 2.0];
  const tMax = 5;
  const series = inits.map((y0, i) => ({
    pts: Array.from({ length: 80 }, (_, n) => { const t = (n / 79) * tMax; return [t, y0 * Math.exp(-k * t)]; }),
    color: ['#6ee7b7', '#67e8f9', '#c4b5fd', '#fbbf24'][i],
    label: i === 0 ? 'y₀ = 0.5 … 2.0' : null,
  }));
  return (
    <Card id="separable" icon={Split} title="Separable equations" accent="emerald" index={3}
          subtitle="When x and y come apart, integrate each side on its own">
      <Intuition>
        <p>
          The luckiest kind of first-order ODE is one where the rule <em>factors</em> — everything about{' '}
          <Eq>x</Eq> sits on one side, everything about <Eq>y</Eq> on the other. Then you don't need any
          cleverness: <strong>shovel the y's left, the x's right, and integrate each pile separately.</strong>
        </p>
      </Intuition>

      <Block>{'\\frac{d\\sol{y}}{dx} = g(x)\\,h(\\sol{y}) \\;\\;\\Longrightarrow\\;\\; \\int \\frac{d\\sol{y}}{h(\\sol{y})} = \\int g(x)\\,dx + C'}</Block>
      <ReadEq>
        divide by <Eq>{'h(y)'}</Eq>, multiply by <Eq>dx</Eq>, and the two variables never meet again. The
        constant <Eq>C</Eq> is where your initial condition enters.
      </ReadEq>

      <Worked title="Decay — cooling coffee, discharging capacitor, radioactive atoms">
        <p>All obey the same separable law "rate of loss ∝ how much is left":</p>
        <Block>{'\\frac{d\\sol{y}}{dt} = -k\\,\\sol{y} \\;\\Rightarrow\\; \\int\\frac{d\\sol{y}}{\\sol{y}} = -\\int k\\,dt \\;\\Rightarrow\\; \\ln \\sol{y} = -kt + C \\;\\Rightarrow\\; \\sol{y}(t) = \\sol{y_0}\\,e^{-kt}'}</Block>
        <p>
          One rule, a whole <em>family</em> of curves — one per starting value <Eq>{'\\sol{y_0}'}</Eq>, all
          sliding down to the ambient zero. Drag the decay rate:
        </p>
      </Worked>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          decay rate k = <span className="text-emerald-300 tabular-nums">{k.toFixed(2)}</span>
          <input type="range" min="0.2" max="2" step="0.05" value={k} onChange={e => setK(parseFloat(e.target.value))} className="ode-range w-40" />
          <span className="text-neutral-500">half-life ≈ {(Math.LN2 / k).toFixed(2)}</span>
        </label>
        <MultiLinePlot series={series} xRange={[0, tMax]} yRange={[0, 2.1]} xLabel="t" yLabel="y" yTicks={[0, 1, 2]} height={210} />
      </div>

      <p>
        Don't mistake "separable" for "linear." The <strong>logistic</strong> equation from the last card is
        nonlinear, yet still separable — partial fractions do the integral:
      </p>
      <Block>{'\\frac{d\\sol{y}}{dt} = \\sol{y}(1-\\sol{y}) \\;\\Rightarrow\\; \\int\\!\\Big(\\tfrac{1}{\\sol{y}}+\\tfrac{1}{1-\\sol{y}}\\Big)d\\sol{y} = \\!\\int\\! dt \\;\\Rightarrow\\; \\sol{y}(t) = \\frac{1}{1 + C e^{-t}}'}</Block>
      <ReadEq>
        the famous S-curve — and the very field you clicked through on the{' '}
        <CrossLink to="field" recap="The logistic slope field: all positive starts funnel to y = 1.">vector-field card</CrossLink>, now in closed form.
      </ReadEq>

      <Misconception
        wrong={'"Separable means the equation is simple or linear."'}
        right={'Separability is about structure — that the right-hand side factors as g(x)·h(y). Plenty of nonlinear ODEs (logistic, y′ = y²) are separable; plenty of linear ones are not.'}
        because={'It is a lucky algebraic shape, independent of linearity. It just means the integral splits cleanly into two single-variable integrals.'}
      />

      <Deeper>
        <p>
          <strong>Implicit solutions are still solutions.</strong> Often the antiderivative of{' '}
          <Eq>{'1/h(y)'}</Eq> can't be inverted to give <Eq>{'y'}</Eq> explicitly. That's fine — an implicit
          relation <Eq>{'G(y) = F(x) + C'}</Eq> fully determines the curve; you just read it as a level set
          rather than a formula. This is the same move that turns the undamped pendulum's energy into its
          trajectories on the <CrossLink to="lyapunov" recap="Pendulum energy E = ½ω² − cosθ is conserved; its level sets are the orbits.">Lyapunov card</CrossLink>.
        </p>
        <p>
          <strong>The constant is the initial condition.</strong> Each value of <Eq>C</Eq> picks one member
          of the solution family; the data <Eq>{'y(t_0)=y_0'}</Eq> solves for it. No initial condition → a
          one-parameter family, not a single curve — which is exactly the "where do I start?" freedom the
          slope field made visible.
        </p>
      </Deeper>
    </Card>
  );
};
const Linear1Card = () => {
  const [tau, setTau] = useState(1.0);   // time constant
  const [y0, setY0] = useState(0.0);
  const tMax = 6, target = 1;
  const k = 1 / tau;
  // y' + y/τ = 1/τ  →  y(t) = 1 + (y0 − 1) e^{-t/τ}
  const yt = (t) => target + (y0 - target) * Math.exp(-k * t);
  const series = [{
    pts: Array.from({ length: 90 }, (_, n) => { const t = (n / 89) * tMax; return [t, yt(t)]; }),
    color: '#7dd3fc', width: 2.2, label: 'response y(t)',
  }];
  return (
    <Card id="linear1" icon={LineChart} title="Linear first-order & integrating factors" accent="sky" index={4}
          subtitle="A multiplier that turns the left side into a perfect derivative">
      <Intuition>
        <p>
          Most first-order equations aren't separable but <em>are</em> linear: the unknown and its derivative
          appear plainly, scaled by known functions and driven by a known source. The trick is almost
          magical — multiply by just the right factor <Eq>{'\\mu(t)'}</Eq> and the entire left side collapses
          into the derivative of a single product. Then you integrate once and you're done.
        </p>
      </Intuition>

      <Block>{'\\dot{\\sol{y}} + p(t)\\,\\sol{y} = q(t), \\qquad \\mu(t) = e^{\\int p(t)\\,dt}'}</Block>
      <ReadEq>
        <Eq>{'p'}</Eq> is the natural decay/growth rate, <Eq>{'q'}</Eq> the external drive. The{' '}
        <Term>integrating factor</Term> <Eq>{'\\mu'}</Eq> is chosen so that <Eq>{'\\mu\\dot y + \\mu p y'}</Eq>{' '}
        equal to <Eq>{"(\\mu \\sol{y})'"}</Eq>.
      </ReadEq>

      <Block>{"(\\mu \\sol{y})' = \\mu\\, q \\;\\;\\Longrightarrow\\;\\; \\sol{y}(t) = \\frac{1}{\\mu(t)}\\left(\\int \\mu(t)\\,q(t)\\,dt + C\\right)"}</Block>
      <ReadEq>
        the product <Eq>{'\\mu y'}</Eq> has a trivial derivative, so a single integral recovers <Eq>y</Eq>.
        The <Eq>{'1/\\mu'}</Eq> out front is the decaying memory of the initial condition.
      </ReadEq>

      <Worked title="Charging an RC circuit (or filling a leaky tank)">
        <p>
          With constant <Eq>{'p = 1/\\tau'}</Eq> and a constant drive toward 1, the solution splits into a
          <strong> particular</strong> part (the steady state it's pulled to) plus a <strong>homogeneous</strong>{' '}
          part (the transient that decays):
        </p>
        <Block>{'\\dot{\\sol{y}} + \\tfrac{1}{\\tau}\\sol{y} = \\tfrac{1}{\\tau} \\;\\Rightarrow\\; \\sol{y}(t) = \\underbrace{1}_{\\text{steady}} + \\underbrace{(\\sol{y_0}-1)\\,e^{-t/\\tau}}_{\\text{transient}}'}</Block>
      </Worked>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            τ = <span className="text-sky-300 tabular-nums">{tau.toFixed(2)}</span>
            <input type="range" min="0.3" max="3" step="0.05" value={tau} onChange={e => setTau(parseFloat(e.target.value))} className="ode-range w-32" />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            y₀ = <span className="text-sky-300 tabular-nums">{y0.toFixed(1)}</span>
            <input type="range" min="-1" max="2.5" step="0.1" value={y0} onChange={e => setY0(parseFloat(e.target.value))} className="ode-range w-32" />
          </label>
        </div>
        <MultiLinePlot series={series} xRange={[0, tMax]} yRange={[-1.2, 2.6]} xLabel="t" yLabel="y"
          yTicks={[-1, 0, 1, 2]} height={210}
          hlines={[{ at: 1, color: '#6ee7b7', label: 'steady state' }]}
          vlines={[{ at: tau, color: '#fbbf24' }]} />
        <div className="text-[11px] text-neutral-500 mt-1">After one time-constant τ (amber line) the transient has shrunk to 1/e ≈ 37% — the universal "63% of the way there" rule.</div>
      </div>

      <p>
        The split into transient + steady state is the seed of two big later ideas:{' '}
        <strong>superposition</strong> (linear responses add) powers the{' '}
        <CrossLink to="laplace" recap="Laplace turns y′ + py = q into algebra: multiply by s, solve, invert.">Laplace</CrossLink> method, and the steady forced response is what blows up at{' '}
        <CrossLink to="resonance" recap="Driving a lightly-damped oscillator near its natural frequency makes the steady amplitude peak.">resonance</CrossLink>.
      </p>

      <MinSchema>
        every linear first-order ODE is solved in one shot by <Eq>{'\\mu = e^{\\int p}'}</Eq>. The answer is
        always <em>transient (decaying memory of <Eq>y_0</Eq>) + steady forced response</em> — a decomposition
        that survives all the way up to systems and control.
      </MinSchema>

      <Deeper>
        <p>
          <strong>Why linearity is worth so much.</strong> Because the equation is linear, the general
          solution is "any particular solution + all homogeneous solutions," and responses to several drives
          simply add. That superposition is what lets us decompose a complicated input into simple pieces
          (steps, sinusoids, impulses), solve each, and sum — the entire logic of transfer functions and
          frequency response. Nonlinear equations like the pendulum forfeit this, which is why we'll switch
          from formulas to geometry and numerics once <Eq>{'\\sin\\theta'}</Eq> arrives in force.
        </p>
        <p>
          <strong>Variation of parameters</strong> generalizes the integrating factor to systems{' '}
          <Eq>{'\\dot{\\st{x}} = A\\st{x} + \\st{b}(t)'}</Eq>, giving{' '}
          <Eq>{'\\st{x}(t) = e^{At}\\st{x_0} + \\int_0^t e^{A(t-s)}\\st{b}(s)\\,ds'}</Eq> — the matrix{' '}
          <Eq>{'e^{At}'}</Eq> is just <Eq>{'1/\\mu'}</Eq> grown up, and it reappears on the{' '}
          <CrossLink to="eigen" recap="Solution of ẋ = Ax is x(t) = e^{At}x₀; eigenvalues of A set the modes.">eigenvalue card</CrossLink>.
        </p>
      </Deeper>
    </Card>
  );
};
const ExistCard = () => {
  const [n, setN] = useState(2);
  const fact = [1, 1, 2, 6, 24, 120, 720];
  const picard = useMemo(() => {
    const tMax = 2;
    const iterates = [];
    for (let m = 0; m <= n; m++) {
      iterates.push({
        pts: Array.from({ length: 60 }, (_, i) => {
          const t = (i / 59) * tMax;
          let v = 0; for (let k = 0; k <= m; k++) v += Math.pow(t, k) / fact[k];
          return [t, v];
        }),
        color: `hsl(${260 - m * 18}, 70%, ${60 + m * 3}%)`,
        width: 1.3, label: m === n ? `φ${n} (current)` : null,
      });
    }
    iterates.push({ pts: Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 2; return [t, Math.exp(t)]; }), color: '#6ee7b7', width: 2, dash: '5 3', label: 'true eᵗ' });
    return iterates;
  }, [n]);

  const [tab, setTab] = useState('nonunique');
  const cube = (x) => Math.sign(x) * Math.pow(Math.abs(x), 3);
  const PATHO = {
    unique: { xRange: [0, 2], yRange: [0, 8], yTicks: [0, 4, 8], series: [
      { pts: Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 2; return [t, Math.exp(t)]; }), color: '#6ee7b7', width: 2.2, label: 'unique solution eᵗ' },
    ], note: "y′ = y is Lipschitz everywhere (slope of the field is bounded). Picard guarantees exactly one solution through y(0)=1 — the slope field has clean, non-crossing curves." },
    nonunique: { xRange: [0, 2], yRange: [-0.3, 8], yTicks: [0, 4, 8], series: [
      { pts: [[0, 0], [2, 0]], color: '#fb7185', width: 2, label: 'y ≡ 0' },
      { pts: Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 2; return [t, t * t * t]; }), color: '#c4b5fd', width: 2, label: 'y = t³' },
      { pts: Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 2; return [t, t > 0.7 ? Math.pow(t - 0.7, 3) : 0]; }), color: '#67e8f9', width: 1.6 },
      { pts: Array.from({ length: 60 }, (_, i) => { const t = (i / 59) * 2; return [t, t > 1.2 ? Math.pow(t - 1.2, 3) : 0]; }), color: '#fbbf24', width: 1.6 },
    ], note: "y′ = 3y^{2/3}, y(0)=0. The field's slope is infinite at y=0 (not Lipschitz), so uniqueness breaks: y≡0, y=t³, and a whole funnel of 'wait, then launch' solutions all satisfy the same initial condition." },
    blowup: { xRange: [0, 1.4], yRange: [0, 8], yTicks: [0, 4, 8], series: [
      { pts: Array.from({ length: 80 }, (_, i) => { const t = (i / 79) * 1.4; return [t, t < 0.98 ? 1 / (1 - t) : 50]; }), color: '#fb7185', width: 2.2, label: 'y = 1/(1−t)' },
    ], vlines: [{ at: 1, color: '#fb7185' }], note: "y′ = y², y(0)=1. A unique solution exists — but only on [0, 1). It races to +∞ in finite time and simply ceases to exist past t=1. Existence is local, not global." },
  };
  const p = PATHO[tab];

  return (
    <Card id="exist" icon={ShieldAlert} title="Existence & uniqueness" accent="rose" index={5}
          subtitle="When does a solution exist, and is it the only one? — why your solver misbehaves">
      <Intuition>
        <p>
          Before computing a solution it's worth asking whether one <em>exists</em>, and whether it's the{' '}
          <em>only</em> one. For a practitioner this isn't pedantry: it's exactly the situations where these
          guarantees fail that your numerical solver stalls, forks, or blows up. The good news is there's a
          clean sufficient condition — and a constructive recipe that doubles as the proof.
        </p>
      </Intuition>

      <p>
        <strong>Picard–Lindelöf.</strong> If <Eq>{'\\st{f}(t,\\sol{y})'}</Eq> is continuous and{' '}
        <Term>Lipschitz</Term> in <Eq>{'\\sol{y}'}</Eq> (its slope in <Eq>y</Eq> is bounded), then through
        each initial point there is <strong>exactly one</strong> solution, at least for a while. The proof is
        a fixed-point iteration you can actually watch converge:
      </p>
      <Block>{'\\sol{y}_{m+1}(t) = \\sol{y_0} + \\int_{t_0}^{t} \\st{f}\\big(s, \\sol{y}_m(s)\\big)\\,ds'}</Block>
      <ReadEq>
        start from a guess, plug it into the integral to get a better one, repeat. For{' '}
        <Eq>{'\\dot y = y,\\ y(0)=1'}</Eq> each pass adds the next term of <Eq>{'e^t = \\sum t^k/k!'}</Eq>.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          Picard iterates: n = <span className="text-violet-300 tabular-nums">{n}</span>
          <input type="range" min="0" max="6" step="1" value={n} onChange={e => setN(parseInt(e.target.value))} className="ode-range w-40" />
        </label>
        <MultiLinePlot series={picard} xRange={[0, 2]} yRange={[0, 8]} yTicks={[0, 4, 8]} xLabel="t" yLabel="y" height={200} />
        <div className="text-[11px] text-neutral-500 mt-1">Each iterate adds one Taylor term; the successive approximations close in on the true exponential. This convergence <em>is</em> the existence proof.</div>
      </div>

      <p>Now the failure modes — the part worth burning into memory:</p>
      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[['unique', 'Lipschitz → unique'], ['nonunique', 'not Lipschitz → many'], ['blowup', 'finite-time blowup']].map(([id, lab]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${tab === id ? 'bg-rose-500/15 border-rose-400/40 text-rose-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>{lab}</button>
          ))}
        </div>
        <MultiLinePlot series={p.series} xRange={p.xRange} yRange={p.yRange} yTicks={p.yTicks} vlines={p.vlines || []} xLabel="t" yLabel="y" height={210} />
        <div className="text-[12px] text-neutral-400 mt-1 leading-snug"><span className="text-rose-300 font-mono text-[10px] uppercase tracking-wider mr-2">case</span>{p.note}</div>
      </div>

      <MinSchema>
        a bounded slope in the state (<Term>Lipschitz</Term>) buys you one and only one solution — locally.
        Lose Lipschitz and uniqueness can shatter; even when unique, the solution may exist only up to a
        finite blow-up time. Existence is a <em>local</em> promise.
      </MinSchema>

      <Misconception
        wrong={'"A well-posed ODE has a solution for all time."'}
        right={'Smoothness only guarantees a solution on some interval around the start. y′ = y² is perfectly smooth yet escapes to infinity at t = 1.'}
        because={'The Lipschitz constant can grow with the solution itself; once it does, the existence interval can be finite. This is why adaptive solvers grind their step size to zero near a blow-up.'}
      />

      <Deeper>
        <p>
          <strong>What this means at the keyboard.</strong> When <Eq>{'\\texttt{solve\\_ivp}'}</Eq> returns a
          status of "step size too small" or the trajectory shoots to <Eq>{'\\pm\\infty'}</Eq>, you are
          usually near a non-Lipschitz point or a finite-time singularity — not seeing a bug. The cure is
          modeling, not a smaller tolerance: regularize the field, switch to an implicit method, or accept
          that the solution genuinely ends there. Our pendulum is globally fine — its field{' '}
          <Eq>{'-\\tfrac{g}{L}\\sin\\theta - c\\omega'}</Eq> is smooth and bounded-slope in the state — so it
          exists for all time, which is what lets us integrate it for thousands of steps on later cards.
        </p>
      </Deeper>
    </Card>
  );
};
const SecondCard = () => {
  const [zeta, setZeta] = useState(0.25);
  const tMax = 16, h = 0.02, N = Math.round(tMax / h);
  // small-angle pendulum (ω₀ = 1):  θ'' + 2ζθ' + θ = 0
  const lin = (s) => [s[1], -s[0] - 2 * zeta * s[1]];
  const series = useMemo(() => {
    const xs = integrate((s) => lin(s), [1, 0], 0, h, N, rk4Step);
    return [{ pts: xs.map((s, i) => [i * h, s[0]]), color: '#67e8f9', width: 2, label: 'θ(t)' }];
  }, [zeta]);
  const disc = zeta * zeta - 1;
  const regime = zeta < 0.999 ? 'underdamped' : zeta > 1.001 ? 'overdamped' : 'critically damped';
  const regimeColor = zeta < 0.999 ? '#67e8f9' : zeta > 1.001 ? '#fbbf24' : '#6ee7b7';
  const roots = disc < 0
    ? `−${zeta.toFixed(2)} ± ${Math.sqrt(-disc).toFixed(2)}i`
    : `${(-zeta + Math.sqrt(disc)).toFixed(2)}, ${(-zeta - Math.sqrt(disc)).toFixed(2)}`;
  const phase = useMemo(() => ({
    deriv: (x, y) => [y, -x - 2 * zeta * y],
    xRange: [-1.5, 1.5], yRange: [-1.5, 1.5], xLabel: 'θ', yLabel: 'ω',
    initials: [[1, 0], [-1, 0.5], [0.3, 1.2]], dt: 0.05,
    fixedPoints: [{ x: 0, y: 0, kind: zeta > 0 ? 'stable' : 'saddle' }],
    verdict: `${regime} · roots ${roots}`, verdictColor: regimeColor,
  }), [zeta]);
  return (
    <Card id="second" icon={Activity} title="Second-order linear · the pendulum" accent="cyan" index={6}
          subtitle="Characteristic roots, and the three faces of damping">
      <Intuition>
        <p>
          For small swings, <Eq>{'\\sin\\theta \\approx \\theta'}</Eq> and the pendulum becomes the most
          important linear ODE in engineering: a mass pulled back toward center and slowed by friction. Add a
          dashpot (damping <Eq>{'c=2\\zeta'}</Eq>, with <Eq>{'\\zeta'}</Eq> the damping ratio) and you get the
          textbook oscillator whose behavior splits cleanly into three regimes.
        </p>
      </Intuition>

      <Block>{'\\ddot{\\sol{\\theta}} + 2\\zeta\\,\\dot{\\sol{\\theta}} + \\sol{\\theta} = 0 \\;\\;\\xrightarrow{\\;\\sol{\\theta}=e^{rt}\\;}\\;\\; r^2 + 2\\zeta r + 1 = 0'}</Block>
      <ReadEq>
        guessing <Eq>{'\\sol{\\theta}=e^{rt}'}</Eq> turns the differential equation into a quadratic — the{' '}
        <Term>characteristic equation</Term>. Its roots <Eq>{'r = -\\zeta \\pm \\sqrt{\\zeta^2-1}'}</Eq> are
        the entire story.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          damping ratio ζ = <span className="tabular-nums" style={{ color: regimeColor }}>{zeta.toFixed(2)}</span>
          <input type="range" min="0" max="2" step="0.01" value={zeta} onChange={e => setZeta(parseFloat(e.target.value))} className="ode-range w-40" />
          <span className="font-mono" style={{ color: regimeColor }}>{regime}</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <MultiLinePlot series={series} xRange={[0, tMax]} yRange={[-1.1, 1.1]} yTicks={[-1, 0, 1]} xLabel="t" yLabel="θ" height={200} />
          <PhasePortrait phase={phase} width={330} height={200} framesPerTraj={120} />
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">roots r = {roots}. Complex (ζ&lt;1) → decaying oscillation + spiral; real (ζ&gt;1) → two exponentials + node; equal (ζ=1) → fastest return without overshoot.</div>
      </div>

      <div className="grid md:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 px-2 py-1.5"><strong className="text-cyan-200">ζ &lt; 1 underdamped</strong> — complex roots <Eq>{'-\\zeta\\pm i\\omega_d'}</Eq>; rings down at <Eq>{'\\omega_d=\\sqrt{1-\\zeta^2}'}</Eq>.</div>
        <div className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2 py-1.5"><strong className="text-emerald-200">ζ = 1 critical</strong> — repeated root <Eq>{'-1'}</Eq>; solution <Eq>{'(a+bt)e^{-t}'}</Eq>, fastest with no overshoot.</div>
        <div className="rounded-md border border-amber-400/25 bg-amber-400/5 px-2 py-1.5"><strong className="text-amber-200">ζ &gt; 1 overdamped</strong> — two real negative roots; sluggish double-exponential creep.</div>
      </div>

      <MinSchema>
        a constant-coefficient linear ODE is solved by its <Term>characteristic equation</Term>: complex
        roots oscillate, real roots are pure exponentials, the real part sets growth/decay. Damping moves the
        roots, and the phase portrait morphs spiral → node accordingly.
      </MinSchema>

      <Deeper>
        <p>
          <strong>The roots are the eigenvalues.</strong> Writing the system as{' '}
          <Eq>{'\\dot{\\st{x}} = A\\st{x}'}</Eq> with{' '}
          <Eq>{'A=\\left(\\begin{smallmatrix}0&1\\\\-1&-2\\zeta\\end{smallmatrix}\\right)'}</Eq>, the characteristic roots
          are exactly the <Term>eigenvalue</Term>s of <Eq>A</Eq> — same quadratic. So "second-order linear
          ODE" and "2-D linear system" are two views of one object, the bridge to the{' '}
          <CrossLink to="eigen" recap="ẋ = Ax solved by eigenvalues; their signs and imaginary parts set the portrait.">eigenvalue card</CrossLink>.
        </p>
        <p>
          <strong>Why the small-angle lie is worth telling.</strong> Linearizing throws away the{' '}
          <Eq>{'\\sin'}</Eq>, so this model misses the period lengthening at large swings, the unstable
          standing-up equilibrium, and chaos. But near the bottom it's superb — and it's the exact thing the{' '}
          <CrossLink to="linearize" recap="The Jacobian linearizes any flow near a fixed point.">Jacobian</CrossLink> recovers automatically when we linearize the full nonlinear pendulum.
        </p>
      </Deeper>
    </Card>
  );
};
const ResonanceCard = () => {
  const [zeta, setZeta] = useState(0.1);
  const [Om, setOm] = useState(1.0);
  const H = (w) => 1 / Math.sqrt((1 - w * w) ** 2 + (2 * zeta * w) ** 2);
  const respCurve = Array.from({ length: 120 }, (_, i) => { const w = (i / 119) * 2.5; return [w, H(w)]; });
  const Hnow = H(Om);
  const phi = Math.atan2(2 * zeta * Om, 1 - Om * Om);
  const wPeak = zeta < 1 / Math.SQRT2 ? Math.sqrt(1 - 2 * zeta * zeta) : 0;
  const tMax = 40;
  const steady = Array.from({ length: 200 }, (_, i) => { const t = (i / 199) * tMax; return [t, Hnow * Math.cos(Om * t - phi)]; });
  return (
    <Card id="resonance" icon={Zap} title="Resonance & forcing" accent="amber" index={7}
          subtitle="Push an oscillator near its natural frequency and the response explodes">
      <Intuition>
        <p>
          Stop letting the pendulum swing freely and start <em>pushing</em> it periodically. If you push at
          just the right rhythm — near its natural frequency — tiny pushes accumulate into enormous swings.
          That's resonance: the same effect that shatters a wine glass, collapses a bridge, and tunes a radio.
          The driven linear oscillator captures it exactly.
        </p>
      </Intuition>

      <Block>{'\\ddot{\\sol{\\theta}} + 2\\zeta\\dot{\\sol{\\theta}} + \\sol{\\theta} = \\co{A}\\cos(\\Omega t) \\;\\Rightarrow\\; \\text{steady amplitude } |H(\\Omega)| = \\frac{1}{\\sqrt{(1-\\Omega^2)^2 + (2\\zeta\\Omega)^2}}'}</Block>
      <ReadEq>
        the steady response is a sinusoid at the <em>drive</em> frequency <Eq>{'\\Omega'}</Eq>, scaled by the
        gain <Eq>{'|H(\\Omega)|'}</Eq>. That denominator is smallest — so the gain is largest — when{' '}
        <Eq>{'\\Omega'}</Eq> sits near the natural frequency 1.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            damping ζ = <span className="text-amber-300 tabular-nums">{zeta.toFixed(2)}</span>
            <input type="range" min="0.04" max="1" step="0.02" value={zeta} onChange={e => setZeta(parseFloat(e.target.value))} className="ode-range w-32" />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            drive Ω = <span className="text-amber-300 tabular-nums">{Om.toFixed(2)}</span>
            <input type="range" min="0.1" max="2.5" step="0.02" value={Om} onChange={e => setOm(parseFloat(e.target.value))} className="ode-range w-32" />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">amplitude response |H(Ω)|</div>
            <MultiLinePlot series={[{ pts: respCurve, color: '#fbbf24', width: 2 }]}
              xRange={[0, 2.5]} yRange={[0, 6]} yTicks={[0, 3, 6]} xLabel="Ω" yLabel="|H|" height={180}
              vlines={[{ at: Om, color: '#67e8f9' }, ...(wPeak ? [{ at: wPeak, color: '#fb7185', dash: '2 3' }] : [])]}
              dots={[{ x: Om, y: Math.min(Hnow, 6), color: '#67e8f9' }]} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">steady response θ(t)</div>
            <MultiLinePlot series={[{ pts: steady, color: '#67e8f9', width: 1.6 }]}
              xRange={[0, tMax]} yRange={[-6, 6]} yTicks={[-6, 0, 6]} xLabel="t" yLabel="θ" height={180} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Stat label="gain |H(Ω)|" value={Hnow.toFixed(2)} color="text-amber-200" />
          <Stat label="phase lag" value={`${(phi * 180 / Math.PI).toFixed(0)}°`} sub="output trails drive" color="text-cyan-200" />
          <Stat label="peak at Ω" value={wPeak ? wPeak.toFixed(2) : '—'} sub={wPeak ? 'resonant freq' : 'no peak (ζ large)'} color="text-rose-200" />
        </div>
      </div>

      <Predict question="With ζ = 0.1, roughly how much bigger is the swing when you drive at resonance versus very slowly (Ω → 0)?">
        About <Eq>{'1/(2\\zeta) = 5\\times'}</Eq> larger. The low-frequency gain is 1 (the pendulum just follows the slow push); at resonance the gain peaks near <Eq>{'1/(2\\zeta)'}</Eq>. Halve the damping and the peak doubles — which is why lightly-damped structures are dangerous.
      </Predict>

      <MinSchema>
        a linear system driven at frequency <Eq>{'\\Omega'}</Eq> answers at the <em>same</em> frequency,
        scaled by <Eq>{'|H(\\Omega)|'}</Eq> and lagged by a phase. The gain peaks near the natural frequency;
        less damping → taller, sharper peak. As <Eq>{'\\zeta\\to 0'}</Eq> the amplitude diverges.
      </MinSchema>

      <Misconception
        wrong={'"Resonance happens exactly at the natural frequency ω₀."'}
        right={'The amplitude peak sits slightly below, at Ω = √(1−2ζ²), and only exists for ζ < 1/√2. Heavily damped systems have no peak at all.'}
        because={'Damping shifts and eventually erases the peak. The undamped natural frequency, the damped ring-down frequency, and the peak-response frequency are three different numbers that only coincide as ζ → 0.'}
      />

      <Deeper>
        <p>
          <strong>Why undamped resonance is unbounded.</strong> Set <Eq>{'\\zeta=0'}</Eq> and drive exactly
          at <Eq>{'\\Omega=1'}</Eq>: the particular solution is no longer a bounded sinusoid but{' '}
          <Eq>{'\\tfrac{t}{2}\\sin t'}</Eq> — amplitude growing linearly forever. The forcing pumps energy in
          every cycle with nothing to dissipate it. Real systems escape this either through damping or by
          going nonlinear (the swing's period drifts off resonance as it grows — the pendulum's saving grace).
        </p>
        <p>
          <strong>The gain function is the transfer function on the imaginary axis.</strong>{' '}
          <Eq>{'|H(\\Omega)| = |G(i\\Omega)|'}</Eq> where <Eq>{'G(s)=1/(s^2+2\\zeta s+1)'}</Eq> — which the{' '}
          <CrossLink to="laplace" recap="Laplace gives G(s); evaluating on s = iΩ is the frequency response.">Laplace card</CrossLink> derives next, and which the{' '}
          <CrossLink to="#control-theory" external recap="Bode/Nyquist read this same G(iΩ) to design feedback.">control-theory explainer</CrossLink> turns into Bode plots.
        </p>
      </Deeper>
    </Card>
  );
};
const SPlanePlot = ({ poles, width = 200, height = 200, maxAbs = 2 }) => {
  const cx = (re) => width / 2 + (re / maxAbs) * (width / 2 - 16);
  const cy = (im) => height / 2 - (im / maxAbs) * (height / 2 - 16);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block mx-auto">
      <rect x="0" y="0" width={width / 2} height={height} fill="rgba(110,231,183,0.06)" />
      <rect x={width / 2} y="0" width={width / 2} height={height} fill="rgba(251,113,133,0.06)" />
      <line x1="8" y1={height / 2} x2={width - 8} y2={height / 2} stroke="rgba(255,255,255,0.28)" />
      <line x1={width / 2} y1="8" x2={width / 2} y2={height - 8} stroke="rgba(255,255,255,0.28)" />
      <text x={width - 10} y={height / 2 - 5} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">Re s</text>
      <text x={width / 2 + 5} y="14" fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">Im s</text>
      <text x={cx(-maxAbs * 0.6)} y={height - 7} fontSize="8" textAnchor="middle" fill="rgba(110,231,183,0.7)" fontFamily="ui-monospace, monospace">stable</text>
      <text x={cx(maxAbs * 0.6)} y={height - 7} fontSize="8" textAnchor="middle" fill="rgba(251,113,133,0.7)" fontFamily="ui-monospace, monospace">unstable</text>
      {poles.map((p, i) => (
        <g key={i} stroke="#c4b5fd" strokeWidth="2">
          <line x1={cx(p.re) - 5} y1={cy(p.im) - 5} x2={cx(p.re) + 5} y2={cy(p.im) + 5} />
          <line x1={cx(p.re) - 5} y1={cy(p.im) + 5} x2={cx(p.re) + 5} y2={cy(p.im) - 5} />
        </g>
      ))}
    </svg>
  );
};

const LaplaceCard = () => {
  const [zeta, setZeta] = useState(0.3);
  const poles = zeta < 1
    ? [{ re: -zeta, im: Math.sqrt(1 - zeta * zeta) }, { re: -zeta, im: -Math.sqrt(1 - zeta * zeta) }]
    : [{ re: -zeta + Math.sqrt(zeta * zeta - 1), im: 0 }, { re: -zeta - Math.sqrt(zeta * zeta - 1), im: 0 }];
  const impulse = useMemo(() => {
    const xs = integrate((s) => [s[1], -s[0] - 2 * zeta * s[1]], [0, 1], 0, 0.02, 800, rk4Step);
    return [{ pts: xs.map((s, i) => [i * 0.02, s[0]]), color: '#c4b5fd', width: 2, label: 'impulse response h(t)' }];
  }, [zeta]);
  return (
    <Card id="laplace" icon={Sigma} title="Laplace transforms" accent="violet" index={8}
          subtitle="Turn calculus into algebra — and read behavior off the poles">
      <Intuition>
        <p>
          Logarithms turn multiplication into addition. The <Term>Laplace transform</Term> does the analogous
          magic for calculus: it turns <strong>differentiation into multiplication by <Eq>s</Eq></strong>. A
          linear ODE with initial conditions becomes a plain algebra problem in <Eq>s</Eq>; you solve for{' '}
          <Eq>{'Y(s)'}</Eq> with arithmetic, then transform back. The initial conditions ride in for free.
        </p>
      </Intuition>

      <Block>{'\\mathcal{L}\\{\\sol{y}\\} = Y(s) = \\int_0^\\infty \\sol{y}(t)\\,e^{-st}\\,dt, \\qquad \\mathcal{L}\\{\\dot{\\sol{y}}\\} = sY(s) - \\sol{y}(0)'}</Block>
      <ReadEq>
        each time derivative becomes a factor of <Eq>s</Eq> (minus the initial value). So an order-2 ODE
        becomes a quadratic-in-<Eq>s</Eq> algebra problem.
      </ReadEq>

      <Worked title="The driven oscillator, solved by algebra">
        <p>Transform <Eq>{'\\ddot\\theta + 2\\zeta\\dot\\theta + \\theta = u(t)'}</Eq> (zero initial state) and just divide:</p>
        <Block>{'(s^2 + 2\\zeta s + 1)\\,\\Theta(s) = U(s) \\;\\Rightarrow\\; \\Theta(s) = \\underbrace{\\frac{1}{s^2+2\\zeta s+1}}_{G(s)}\\,U(s)'}</Block>
        <p>
          The multiplier <Eq>{'G(s)'}</Eq> is the <Term>transfer function</Term>: divide output by input in the
          <Eq>s</Eq>-domain. Its denominator is the characteristic polynomial, so its{' '}
          <strong>poles are exactly the characteristic roots / eigenvalues</strong> from the second-order card.
        </p>
      </Worked>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          damping ζ = <span className="text-violet-300 tabular-nums">{zeta.toFixed(2)}</span>
          <input type="range" min="0" max="2" step="0.02" value={zeta} onChange={e => setZeta(parseFloat(e.target.value))} className="ode-range w-40" />
        </label>
        <div className="grid md:grid-cols-2 gap-3 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">poles of G(s)</div>
            <SPlanePlot poles={poles} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">⟶ impulse response</div>
            <MultiLinePlot series={impulse} xRange={[0, 16]} yRange={[-0.7, 0.7]} yTicks={[-0.5, 0, 0.5]} xLabel="t" yLabel="h" height={180} legend={false} />
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Pole position dictates the time response: imaginary part = oscillation frequency, (negative) real part = decay rate. Complex pair → ringing; real poles → smooth decay; the closer to the imaginary axis, the slower the settling.</div>
      </div>

      <MinSchema>
        Laplace trades a differential equation for an algebraic one by sending <Eq>{'\\tfrac{d}{dt}\\to s'}</Eq>.
        The transfer function <Eq>{'G(s)'}</Eq> packages the whole linear system; its <strong>poles</strong>{' '}
        (denominator roots) sit in the left half-plane for stable systems and set the response shape.
      </MinSchema>

      <Misconception
        wrong={'"Laplace is just a different way to get the same formula — no new insight."'}
        right={'The pole–zero map in the s-plane is a geometric design language: you read stability, speed, and oscillation off pole locations at a glance, and place poles to shape behavior.'}
        because={'Moving poles left speeds decay; moving them toward the imaginary axis slows it; pushing them across into the right half-plane makes the system unstable. This is the foundation of classical control.'}
      />

      <Deeper>
        <p>
          <strong>Partial fractions = superposition.</strong> Inverting <Eq>{'Y(s)'}</Eq> means splitting it
          into simple pole terms, each of which inverts to an exponential or damped sinusoid. The full response
          is their sum — the <Eq>s</Eq>-domain face of the transient-plus-steady decomposition from the{' '}
          <CrossLink to="linear1" recap="Linear responses split into a decaying transient plus a forced steady state.">integrating-factor card</CrossLink>. Evaluating <Eq>{'G(s)'}</Eq> on the imaginary axis{' '}
          <Eq>{'s=i\\Omega'}</Eq> recovers exactly the <CrossLink to="resonance" recap="|G(iΩ)| is the amplitude-response curve that peaks at resonance.">resonance gain</CrossLink>.
        </p>
        <p>
          <strong>The bridge to control.</strong> Everything classical control does — Bode plots, Nyquist
          stability, root locus, PID tuning — lives in this <Eq>s</Eq>-plane. The{' '}
          <CrossLink to="#control-theory" external recap="State-space, transfer functions, and pole placement for feedback design.">control-theory explainer</CrossLink> picks up exactly here, treating pole placement as a design knob.
        </p>
      </Deeper>
    </Card>
  );
};
const PhasePlaneCard = () => {
  const sepTop = Array.from({ length: 80 }, (_, i) => { const th = -Math.PI + (i / 79) * 2 * Math.PI; return [th, 2 * Math.cos(th / 2)]; });
  const sepBot = sepTop.map(([th, w]) => [th, -w]);
  const phase = useMemo(() => ({
    deriv: (th, w) => [w, -Math.sin(th)],
    xRange: [-3.4, 3.4], yRange: [-2.7, 2.7], xLabel: 'θ', yLabel: 'ω', dt: 0.045,
    initials: [[0, 0.7], [0, 1.4], [0, 2.4], [0, -2.4], [-3, 0.3]],
    curves: [
      { pts: sepTop, color: '#fb7185', width: 1.6, dash: '5 3', opacity: 0.9 },
      { pts: sepBot, color: '#fb7185', width: 1.6, dash: '5 3', opacity: 0.9 },
    ],
    fixedPoints: [{ x: 0, y: 0, kind: 'center' }, { x: Math.PI, y: 0, kind: 'saddle' }, { x: -Math.PI, y: 0, kind: 'saddle' }],
    verdict: 'centers at θ=0 (swinging) · saddles at θ=±π (balanced upright)',
    verdictColor: '#67e8f9', sliceNote: 'undamped · separatrix in rose',
  }), []);
  return (
    <Card id="phaseplane" icon={GitFork} title="Systems & the phase plane" accent="cyan" index={9} anchor
          subtitle="The whole pendulum, drawn as one timeless map">
      <Intuition>
        <p>
          Now we cash in the vector-field idea for the real pendulum. Its state is the pair{' '}
          <Eq>{'(\\sol{\\theta}, \\st{\\omega})'}</Eq>, so the field of arrows lives in a 2-D plane — the{' '}
          <Term>phase plane</Term>. Because the undamped pendulum is autonomous, this map never changes with
          time: <strong>every possible motion the pendulum can make is a curve somewhere on this single
          picture.</strong> No formula required — the geometry tells you everything.
        </p>
      </Intuition>

      <Block>{'\\frac{d}{dt}\\begin{pmatrix}\\sol{\\theta}\\\\\\st{\\omega}\\end{pmatrix} = \\begin{pmatrix}\\st{\\omega}\\\\-\\sin\\sol{\\theta}\\end{pmatrix}'}</Block>
      <ReadEq>
        rightward motion (<Eq>{'\\dot\\theta=\\omega'}</Eq>) wherever <Eq>{'\\omega>0'}</Eq>; the vertical pull{' '}
        <Eq>{'-\\sin\\theta'}</Eq> always points back toward <Eq>{'\\theta=0'}</Eq>. <strong>Click play</strong> and
        watch the trajectories trace out.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 flex justify-center">
        <PhasePortrait phase={phase} width={460} height={300} framesPerTraj={150} />
      </div>

      <p>Three features carry the whole story, and each is a concept you'll reuse everywhere:</p>
      <div className="grid md:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2 py-1.5"><strong className="text-emerald-200">Centers</strong> at <Eq>{'\\theta=0,\\pm2\\pi'}</Eq> — the hanging-down rest points. Nearby motions are closed loops: <em>back-and-forth swinging</em> (libration).</div>
        <div className="rounded-md border border-rose-400/25 bg-rose-400/5 px-2 py-1.5"><strong className="text-rose-200">Saddles</strong> at <Eq>{'\\theta=\\pm\\pi'}</Eq> — the pendulum balanced straight up. Unstable: come in along one direction, fly out along another.</div>
        <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 px-2 py-1.5"><strong className="text-cyan-200">Separatrix</strong> (rose) — the knife-edge orbit through the saddles. It divides <em>swinging</em> (inside) from <em>full rotation</em> (the wavy curves outside, going over the top).</div>
      </div>

      <Predict question="Pick the initial condition that sits exactly on the separatrix. How long does that motion take to reach the upright position?">
        Forever. The separatrix is the <strong>homoclinic orbit</strong>: it approaches the upright saddle asymptotically, taking infinite time to arrive. It's the boundary case between "doesn't quite make it over" (swings back) and "makes it over with speed to spare" (keeps rotating) — which is exactly why pendulum swing-up control is delicate.
      </Predict>

      <MinSchema>
        a 2-D autonomous system is <em>one</em> phase portrait: <Term>fixed point</Term>s where the field
        vanishes, trajectories flowing between them, and special curves (<Term>separatrix</Term>) partitioning
        qualitatively different fates. You read the dynamics off the picture before solving anything.
      </MinSchema>

      <Deeper>
        <p>
          <strong>Why curves can't cross (again).</strong> Two trajectories never intersect — uniqueness
          forbids it — so the separatrix is an impassable wall: a swinging start can never spontaneously
          become a rotating one. Damping breaks this story gently: it makes the centers into{' '}
          <em>spirals</em> that slowly wind inward, so every motion eventually decays to hanging straight down
          (the <CrossLink to="linearize" recap="Linearizing at θ=0 gives a stable spiral; at θ=π a saddle.">linearization card</CrossLink> makes this precise).
        </p>
        <p>
          <strong>The energy reading.</strong> Each closed loop is a level set of the conserved energy{' '}
          <Eq>{'E=\\tfrac12\\omega^2-\\cos\\theta'}</Eq>; the separatrix is the special level{' '}
          <Eq>{'E=1'}</Eq> that passes through the saddles. That conserved quantity is the{' '}
          <CrossLink to="lyapunov" recap="Energy E is a Lyapunov function; its level sets are the orbits.">Lyapunov function</CrossLink>, and preserving it numerically is what the{' '}
          <CrossLink to="symplectic" recap="Symplectic integrators keep the energy level sets closed for millions of steps.">symplectic card</CrossLink> is all about.
        </p>
      </Deeper>
    </Card>
  );
};
const EIGEN_TYPES = [
  { id: 'snode', label: 'stable node', A: [[-1.2, 0.4], [0.4, -1.8]], inits: [[1.6, 1.6], [-1.6, -1.4], [1.7, -0.3], [-1.5, 0.5]] },
  { id: 'unode', label: 'unstable node', A: [[1.2, 0.4], [0.4, 1.8]], inits: [[0.2, 0.1], [-0.15, 0.1], [0.1, -0.2], [-0.1, -0.1]] },
  { id: 'saddle', label: 'saddle', A: [[1, 1], [1, -1]], inits: [[1.7, 1.3], [-1.7, -1.3], [1.5, -1.7], [-1.5, 1.7], [0.1, 0.05]] },
  { id: 'center', label: 'center', A: [[0, 1], [-1, 0]], inits: [[0.6, 0], [1.2, 0], [1.8, 0]] },
  { id: 'sspiral', label: 'stable spiral', A: [[-0.3, 1], [-1, -0.3]], inits: [[1.8, 0], [-1.6, 0.6]] },
  { id: 'uspiral', label: 'unstable spiral', A: [[0.3, 1], [-1, 0.3]], inits: [[0.25, 0], [-0.2, 0.15]] },
];

const eigenInfo = (A) => {
  const [[a, b], [c, d]] = A;
  const T = a + d, D = a * d - b * c, disc = T * T - 4 * D;
  if (disc >= 0) {
    const r = Math.sqrt(disc), l1 = (T + r) / 2, l2 = (T - r) / 2;
    const slope = (l) => (Math.abs(b) > 1e-6 ? (l - a) / b : (Math.abs(c) > 1e-6 ? c / (l - d) : 0));
    return { real: true, l1, l2, T, D, lines: [{ slope: slope(l1), color: '#7dd3fc', label: `λ=${l1.toFixed(1)}` }, { slope: slope(l2), color: '#fbbf24', label: `λ=${l2.toFixed(1)}` }] };
  }
  return { real: false, re: T / 2, im: Math.sqrt(-disc) / 2, T, D };
};

const EigenCard = () => {
  const [typeId, setTypeId] = useState('saddle');
  const t = EIGEN_TYPES.find(x => x.id === typeId);
  const info = eigenInfo(t.A);
  const evText = info.real ? `λ = ${info.l1.toFixed(2)}, ${info.l2.toFixed(2)}` : `λ = ${info.re.toFixed(2)} ± ${info.im.toFixed(2)}i`;
  const phase = useMemo(() => ({
    deriv: (x, y) => [t.A[0][0] * x + t.A[0][1] * y, t.A[1][0] * x + t.A[1][1] * y],
    xRange: [-2, 2], yRange: [-2, 2], xLabel: 'x₁', yLabel: 'x₂', dt: 0.04,
    initials: t.inits, eigenLines: info.real ? info.lines : null,
    verdict: `${t.label} · ${evText}`, verdictColor: '#7dd3fc',
  }), [typeId]);
  return (
    <Card id="eigen" icon={Layers} title="Linear systems & eigenvalues" accent="sky" index={10}
          subtitle="Six portraits, all decided by two eigenvalues">
      <Intuition>
        <p>
          Near any equilibrium, the world looks linear: <Eq>{'\\dot{\\st{x}} = A\\st{x}'}</Eq>. And a linear
          system hides no surprises — its entire behavior is dictated by the <Term>eigenvalue</Term>s of{' '}
          <Eq>A</Eq>. Each eigenvector is a direction the flow can't rotate out of, only stretch or shrink
          along; the eigenvalue is the rate. Real or complex, positive or negative — those two bits sort
          every 2-D linear system into just six pictures.
        </p>
      </Intuition>

      <Block>{'\\dot{\\st{x}} = A\\st{x} \\;\\Rightarrow\\; \\st{x}(t) = c_1 e^{\\lambda_1 t}\\,v_1 + c_2 e^{\\lambda_2 t}\\,v_2'}</Block>
      <ReadEq>
        the solution is a blend of <em>modes</em> <Eq>{'e^{\\lambda_i t} v_i'}</Eq>. Real <Eq>{'\\lambda'}</Eq>{' '}
        → exponential along an eigenvector; complex pair → spiral; sign of the real part → grow or decay.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {EIGEN_TYPES.map(x => (
            <button key={x.id} onClick={() => setTypeId(x.id)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${typeId === x.id ? 'bg-sky-500/15 border-sky-400/40 text-sky-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>{x.label}</button>
          ))}
        </div>
        <div className="flex justify-center"><PhasePortrait phase={phase} width={400} height={290} framesPerTraj={130} /></div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Stat label="eigenvalues" value={info.real ? '2 real' : 'complex pair'} sub={evText} color="text-sky-200" />
          <Stat label="trace T" value={info.T.toFixed(2)} sub="= λ₁+λ₂" color="text-violet-200" />
          <Stat label="det D" value={info.D.toFixed(2)} sub="= λ₁·λ₂" color="text-amber-200" />
        </div>
      </div>

      <p>
        The pattern is mechanical: <strong>real eigenvalues</strong> give nodes (same sign) or a saddle
        (opposite signs), with the dashed eigenvector lines as the flow's "rails"; a{' '}
        <strong>complex pair</strong> gives spirals (or a pure center when the real part is exactly zero). The
        sign of the real part is stability — negative pulls in, positive pushes out.
      </p>

      <MinSchema>
        a 2-D linear system is its two eigenvalues. Sign of the real part = stable/unstable; real vs complex =
        node/saddle vs spiral/center. Everything else is rotation and scaling of these six templates.
      </MinSchema>

      <Misconception
        wrong={'"You need the eigenvectors to know the type of equilibrium."'}
        right={'Just the trace T = λ₁+λ₂ and determinant D = λ₁λ₂ are enough to classify it — eigenvectors only orient the picture.'}
        because={'T and D determine the eigenvalues via λ = (T ± √(T²−4D))/2, and their signs fix the type. That two-number summary is exactly the trace–determinant plane next.'}
      />

      <Deeper>
        <p>
          <strong>The matrix exponential.</strong> The compact solution is{' '}
          <Eq>{'\\st{x}(t)=e^{At}\\st{x_0}'}</Eq>, where <Eq>{'e^{At}=\\sum_k (At)^k/k!'}</Eq> generalizes the
          scalar <Eq>{'e^{\\lambda t}'}</Eq>. In the eigenbasis it's diagonal — just{' '}
          <Eq>{'e^{\\lambda_i t}'}</Eq> down the diagonal — which is why eigenvalues <em>are</em> the modes.
          This is the same <Eq>{'e^{At}'}</Eq> that appeared in variation of parameters on the{' '}
          <CrossLink to="linear1" recap="x(t)=e^{At}x₀ + ∫e^{A(t−s)}b(s)ds.">linear card</CrossLink>.
        </p>
        <p>
          <strong>Repeated eigenvalues</strong> (the parabola <Eq>{'T^2=4D'}</Eq>) are the knife-edge: a
          single eigenvector gives a degenerate/improper node with a <Eq>{'t\\,e^{\\lambda t}'}</Eq> term — the
          critically-damped pendulum from the second-order card lives exactly here.
        </p>
      </Deeper>
    </Card>
  );
};
const classifyTD = (T, D) => {
  if (D < -0.02) return { name: 'saddle', color: '#fb7185' };
  if (Math.abs(D) < 0.02 && Math.abs(T) < 0.02) return { name: 'degenerate', color: '#a3a3a3' };
  const above = D > T * T / 4 + 0.02;
  if (above) {
    if (T < -0.02) return { name: 'stable spiral', color: '#6ee7b7' };
    if (T > 0.02) return { name: 'unstable spiral', color: '#fb7185' };
    return { name: 'center', color: '#67e8f9' };
  }
  if (Math.abs(D - T * T / 4) <= 0.02) return { name: T < 0 ? 'degenerate stable node' : 'degenerate unstable node', color: '#fbbf24' };
  if (T < 0) return { name: 'stable node', color: '#6ee7b7' };
  return { name: 'unstable node', color: '#fbbf24' };
};

const TDPlane = ({ T, D, onPick, width = 250, height = 250 }) => {
  const Tmin = -3, Tmax = 3, Dmin = -1.6, Dmax = 3;
  const padL = 26, padR = 10, padT = 10, padB = 24;
  const sx = (t) => padL + ((t - Tmin) / (Tmax - Tmin)) * (width - padL - padR);
  const sy = (d) => padT + (1 - (d - Dmin) / (Dmax - Dmin)) * (height - padT - padB);
  const parab = []; for (let t = Tmin; t <= Tmax; t += 0.1) parab.push(`${sx(t)},${sy(t * t / 4)}`);
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) * (width / r.width), py = (e.clientY - r.top) * (height / r.height);
    onPick(clamp(Tmin + (px - padL) / (width - padL - padR) * (Tmax - Tmin), Tmin, Tmax),
           clamp(Dmin + (1 - (py - padT) / (height - padT - padB)) * (Dmax - Dmin), Dmin, Dmax));
  };
  const cls = classifyTD(T, D);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full cursor-crosshair" onClick={pick}>
      <line x1={padL} y1={sy(0)} x2={width - padR} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />
      <line x1={sx(0)} y1={padT} x2={sx(0)} y2={height - padB} stroke="rgba(255,255,255,0.25)" />
      <polyline fill="none" stroke="#f0abfc" strokeWidth="1.6" strokeOpacity="0.8" points={parab.join(' ')} />
      <text x={sx(2.4)} y={sy(2.6)} fontSize="8" fill="rgba(240,171,252,0.7)" fontFamily="ui-monospace, monospace">D=T²/4</text>
      <text x={width - padR} y={sy(0) - 3} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">T</text>
      <text x={sx(0) + 4} y={padT + 8} fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace">D</text>
      {/* region labels */}
      <text x={sx(-1.6)} y={sy(2.3)} fontSize="7.5" textAnchor="middle" fill="#6ee7b7" fontFamily="ui-monospace, monospace">stable spiral</text>
      <text x={sx(1.6)} y={sy(2.3)} fontSize="7.5" textAnchor="middle" fill="#fb7185" fontFamily="ui-monospace, monospace">unstable spiral</text>
      <text x={sx(-1.9)} y={sy(0.55)} fontSize="7.5" textAnchor="middle" fill="#6ee7b7" fontFamily="ui-monospace, monospace">stable node</text>
      <text x={sx(1.9)} y={sy(0.55)} fontSize="7.5" textAnchor="middle" fill="#fbbf24" fontFamily="ui-monospace, monospace">unstable node</text>
      <text x={sx(0)} y={sy(-1.1)} fontSize="7.5" textAnchor="middle" fill="#fb7185" fontFamily="ui-monospace, monospace">saddle (D&lt;0)</text>
      <line x1={sx(0) - 14} y1={sy(0)} x2={sx(0) + 14} y2={sy(0)} stroke="#67e8f9" strokeWidth="0" />
      <circle cx={sx(T)} cy={sy(D)} r="5" fill={cls.color} stroke="#0a0a0a" strokeWidth="1.5" />
    </svg>
  );
};

const TraceDetCard = () => {
  const [T, setT] = useState(-1);
  const [D, setD] = useState(1.5);
  const cls = classifyTD(T, D);
  // companion matrix with trace T, det D:  [[0,1],[-D,T]]
  const A = [[0, 1], [-D, T]];
  const info = eigenInfo(A);
  const phase = useMemo(() => ({
    deriv: (x, y) => [y, -D * x + T * y],
    xRange: [-2, 2], yRange: [-2, 2], xLabel: 'x₁', yLabel: 'x₂', dt: 0.04,
    initials: [[1.6, 1.6], [-1.6, -1.6], [1.7, -0.6], [-1.7, 0.6], [0.1, 0.05]],
    eigenLines: info.real ? info.lines : null,
    verdict: cls.name, verdictColor: cls.color,
  }), [T, D]);
  return (
    <Card id="tracedet" icon={Crosshair} title="The trace–determinant plane" accent="fuchsia" index={11}
          subtitle="One map that classifies every 2-D linear system">
      <Intuition>
        <p>
          The last card needed six separate pictures. Here they collapse into <strong>one</strong>. Since a
          2-D system's type depends only on the trace <Eq>{'T=\\lambda_1+\\lambda_2'}</Eq> and determinant{' '}
          <Eq>{'D=\\lambda_1\\lambda_2'}</Eq>, we can plot a single point <Eq>{'(T,D)'}</Eq> and read off the
          behavior. The parabola <Eq>{'D=T^2/4'}</Eq> is the great divide — real eigenvalues below it, complex
          above. <strong className="text-fuchsia-200">Click anywhere</strong> in the map to morph the system.
        </p>
      </Intuition>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="grid md:grid-cols-2 gap-3 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">the (T, D) map — click to place</div>
            <TDPlane T={T} D={D} onPick={(t, d) => { setT(t); setD(d); }} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">resulting portrait</div>
            <PhasePortrait phase={phase} width={320} height={235} framesPerTraj={120} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Stat label="trace T" value={fmtN(T, 2)} color="text-violet-200" />
          <Stat label="det D" value={fmtN(D, 2)} color="text-amber-200" />
          <Stat label="type" value={cls.name.split(' ').pop()} sub={cls.name} color="text-fuchsia-200" />
        </div>
      </div>

      <p>The whole zoo, organized by two coordinates:</p>
      <div className="grid md:grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-rose-400/25 bg-rose-400/5 px-2 py-1.5"><strong className="text-rose-200">D &lt; 0</strong> → always a <strong>saddle</strong> (eigenvalues of opposite sign), regardless of T.</div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5"><strong>D &gt; 0, below parabola</strong> → real same-sign roots: <strong>node</strong> (stable if T&lt;0).</div>
        <div className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5"><strong>above parabola</strong> → complex roots: <strong>spiral</strong> (stable if T&lt;0), or a <strong>center</strong> on the T=0 axis.</div>
        <div className="rounded-md border border-fuchsia-400/25 bg-fuchsia-400/5 px-2 py-1.5"><strong className="text-fuchsia-200">stability boundary</strong> is the positive D-axis (T=0, D&gt;0): cross it and a stable spiral becomes unstable — a <strong>Hopf bifurcation</strong>.</div>
      </div>

      <MinSchema>
        trace and determinant alone classify any 2-D linear system. <Eq>{'D<0'}</Eq> = saddle;{' '}
        <Eq>{'D>T^2/4'}</Eq> = spiral/center; else node. Stability is just the sign of <Eq>{'T'}</Eq> (when{' '}
        <Eq>{'D>0'}</Eq>). One picture replaces the case analysis.
      </MinSchema>

      <Deeper>
        <p>
          <strong>Why this is the right summary.</strong> The eigenvalues solve{' '}
          <Eq>{'\\lambda^2 - T\\lambda + D = 0'}</Eq>, so <Eq>{'(T,D)'}</Eq> contains everything that matters
          for the linearized flow. As a parameter in your model drifts, the point <Eq>{'(T,D)'}</Eq> traces a
          path; the moment it crosses a boundary, the dynamics change qualitatively — that crossing is a{' '}
          <Term>bifurcation</Term>, and the trace–determinant plane is where you watch for them.
        </p>
        <p>
          <strong>The pendulum's fixed points live here too.</strong> Linearize the damped pendulum (next
          card): at hanging-down you land in the stable-spiral region; at standing-up you land at{' '}
          <Eq>{'D<0'}</Eq> — a saddle. The same map that classifies abstract matrices classifies the real
          nonlinear system, one fixed point at a time.
        </p>
      </Deeper>
    </Card>
  );
};
const LinearizeCard = () => {
  const [fp, setFp] = useState('down');   // 'down' (θ=0) or 'up' (θ=π)
  const [c, setC] = useState(0.3);
  const thStar = fp === 'down' ? 0 : Math.PI;
  // Jacobian of [ω, −sinθ − cω] at (θ*,0):  [[0,1],[−cosθ*, −c]]
  const J = [[0, 1], [-Math.cos(thStar), -c]];
  const info = eigenInfo(J);
  const evText = info.real ? `${info.l1.toFixed(2)}, ${info.l2.toFixed(2)}` : `${info.re.toFixed(2)} ± ${info.im.toFixed(2)}i`;
  const cls = fp === 'down' ? (c > 0 ? 'stable spiral (sink)' : 'center') : 'saddle (unstable)';
  const clsColor = fp === 'down' ? (c > 0 ? '#6ee7b7' : '#67e8f9') : '#fb7185';
  const phase = useMemo(() => ({
    deriv: (th, w) => [w, -Math.sin(th) - c * w],
    xRange: [thStar - 1.3, thStar + 1.3], yRange: [-1.3, 1.3], xLabel: 'θ', yLabel: 'ω', dt: 0.045,
    initials: fp === 'down'
      ? [[0.9, 0], [-0.9, 0.3], [0.3, 0.9], [-0.3, -0.9]]
      : [[Math.PI + 0.05, 0.02], [Math.PI - 0.05, -0.02], [Math.PI - 1.1, 1.0], [Math.PI + 1.1, -1.0]],
    fixedPoints: [{ x: thStar, y: 0, kind: fp === 'up' ? 'saddle' : (c > 0 ? 'stable' : 'center') }],
    verdict: `${cls} · λ = ${evText}`, verdictColor: clsColor,
  }), [fp, c]);
  return (
    <Card id="linearize" icon={Telescope} title="Linearization & the Jacobian" accent="violet" index={12}
          subtitle="Near a fixed point, the nonlinear flow wears a linear mask">
      <Intuition>
        <p>
          The pendulum is nonlinear, but zoom in close to any equilibrium and the curvature flattens out — the
          flow there looks just like a linear system. The <Term>Jacobian</Term> (the matrix of partial
          derivatives) <em>is</em> that linear system. <strong>Hartman–Grobman</strong> makes it rigorous: as
          long as no eigenvalue sits on the imaginary axis, the nonlinear portrait near the fixed point is a
          gently warped copy of its linearization.
        </p>
      </Intuition>

      <Block>{'\\dot{\\st{x}} = \\st{f}(\\st{x}),\\quad \\st{x}\\approx\\st{x}^* + \\delta \\;\\Rightarrow\\; \\dot{\\delta} \\approx J\\,\\delta, \\quad J = \\left.\\frac{\\partial \\st{f}}{\\partial \\st{x}}\\right|_{\\st{x}^*}'}</Block>
      <ReadEq>
        a small displacement <Eq>{'\\delta'}</Eq> from the fixed point evolves, to first order, by the constant
        matrix <Eq>J</Eq> — so the <CrossLink to="eigen" recap="Eigenvalues of J classify the local portrait.">eigenvalue</CrossLink> machinery applies locally.
      </ReadEq>

      <p>For the damped pendulum <Eq>{'\\dot\\theta=\\omega,\\ \\dot\\omega=-\\sin\\theta-c\\omega'}</Eq> the Jacobian is</p>
      <Block>{'J = \\begin{pmatrix}0 & 1\\\\ -\\cos\\theta^* & -c\\end{pmatrix} \\;\\;\\Longrightarrow\\;\\; \\lambda^2 + c\\lambda + \\cos\\theta^* = 0'}</Block>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-3 mb-2 items-center">
          <div className="flex gap-1.5">
            {[['down', 'hang down · θ*=0'], ['up', 'stand up · θ*=π']].map(([id, lab]) => (
              <button key={id} onClick={() => setFp(id)}
                className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${fp === id ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>{lab}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            damping c = <span className="text-violet-300 tabular-nums">{c.toFixed(2)}</span>
            <input type="range" min="0" max="1.2" step="0.05" value={c} onChange={e => setC(parseFloat(e.target.value))} className="ode-range w-28" />
          </label>
        </div>
        <div className="flex justify-center"><PhasePortrait phase={phase} width={400} height={250} framesPerTraj={130} /></div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Stat label="cos θ* (the spring)" value={Math.cos(thStar).toFixed(0)} sub={fp === 'down' ? '+1 → restoring' : '−1 → repelling'} color="text-cyan-200" />
          <Stat label="eigenvalues of J" value={info.real ? 'real' : 'complex'} sub={`λ = ${evText} · ${cls}`} color={info.real ? 'text-amber-200' : 'text-emerald-200'} />
        </div>
      </div>

      <p>
        The sign of <Eq>{'\\cos\\theta^*'}</Eq> flips everything. At the bottom it's <Eq>{'+1'}</Eq> — a genuine
        restoring force, so eigenvalues are a damped complex pair: a <strong className="text-emerald-200">stable
        spiral</strong> winding into rest. At the top it's <Eq>{'-1'}</Eq> — an anti-restoring force, so the
        eigenvalues are real and opposite-signed: a <strong className="text-rose-200">saddle</strong>. That
        single sign is why balancing a pendulum upright is hard and letting it hang is effortless.
      </p>

      <MinSchema>
        to understand a nonlinear system, find its <Term>fixed point</Term>s and linearize: the{' '}
        <Term>Jacobian</Term>'s eigenvalues classify each one (away from the imaginary-axis knife-edge).
        Global behavior is then these local portraits stitched together by the separatrix.
      </MinSchema>

      <Misconception
        wrong={'"Linearization tells you everything about the nonlinear system."'}
        right={'It is faithful only locally and only when the fixed point is hyperbolic (no eigenvalue with zero real part). Centers are the dangerous case — damping decides their true fate.'}
        because={'At θ=0 with c=0 the linearization is a center (purely imaginary eigenvalues). The tiniest nonlinearity or damping can turn that into a slow spiral — Hartman–Grobman explicitly excludes this borderline, which is why the undamped pendulum needs the energy argument, not just the Jacobian.'}
      />

      <Deeper>
        <p>
          <strong>This is the backbone of nonlinear analysis.</strong> Find equilibria → compute the Jacobian
          → read eigenvalues → place each fixed point on the <CrossLink to="tracedet" recap="(T,D) of the Jacobian classifies each fixed point.">trace–determinant map</CrossLink>. It's also exactly how controllers are designed for nonlinear plants: linearize about the operating point and apply linear tools — the move the{' '}
          <CrossLink to="#control-theory" external recap="Cart-pole is linearized about upright before LQR/Kalman design.">control-theory explainer</CrossLink> makes when it linearizes the cart-pole about upright (that explainer's plant is exactly our saddle).
        </p>
      </Deeper>
    </Card>
  );
};
const LyapunovCard = () => {
  const [c, setC] = useState(0.25);
  const tMax = 30, h = 0.02, N = Math.round(tMax / h);
  const traj = useMemo(() => integrate((s) => [s[1], -Math.sin(s[0]) - c * s[1]], [2.4, 0], 0, h, N, rk4Step), [c]);
  const Vseries = [{ pts: traj.map((s, i) => [i * h, 0.5 * s[1] * s[1] + (1 - Math.cos(s[0]))]), color: '#6ee7b7', width: 2, label: 'V(t) = ½ω² + (1−cos θ)' }];
  const phase = useMemo(() => ({
    deriv: (th, w) => [w, -Math.sin(th) - c * w],
    xRange: [-3.4, 3.4], yRange: [-2.7, 2.7], xLabel: 'θ', yLabel: 'ω', dt: 0.05,
    initials: [[2.4, 0], [-2, 1.2], [0.5, 2.2]],
    fixedPoints: [{ x: 0, y: 0, kind: c > 0 ? 'stable' : 'center' }],
    verdict: c > 0 ? 'V̇ = −cω² < 0 → spirals to rest' : 'V̇ = 0 → energy conserved, closed orbits',
    verdictColor: c > 0 ? '#6ee7b7' : '#67e8f9',
  }), [c]);
  return (
    <Card id="lyapunov" icon={Target} title="Stability & Lyapunov" accent="emerald" index={13}
          subtitle="Prove stability with energy — without ever solving the ODE">
      <Intuition>
        <p>
          You often can't solve a nonlinear ODE, yet you can still <em>prove</em> it settles down — by tracking
          an energy. If you can find a bowl-shaped function <Eq>{'V(\\st{x})'}</Eq> that is positive everywhere
          except zero at the equilibrium, and that <strong>never increases</strong> along the motion, then the
          state has nowhere to go but downhill toward the bottom. That's a <Term>Lyapunov function</Term>, and
          for mechanical systems the obvious candidate is the actual energy.
        </p>
      </Intuition>

      <p>For the pendulum, total energy (shifted to vanish at the bottom) is the natural choice:</p>
      <Block>{'V(\\sol{\\theta},\\st{\\omega}) = \\tfrac12\\st{\\omega}^2 + (1-\\cos\\sol{\\theta}) \\;\\ge 0, \\qquad \\dot V = -c\\,\\st{\\omega}^2 \\;\\le 0'}</Block>
      <ReadEq>
        kinetic plus potential energy, always non-negative. Its rate of change along the damped motion is{' '}
        <Eq>{'-c\\omega^2'}</Eq> — friction can only <em>remove</em> energy, never add it.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          damping c = <span className="text-emerald-300 tabular-nums">{c.toFixed(2)}</span>
          <input type="range" min="0" max="1" step="0.05" value={c} onChange={e => setC(parseFloat(e.target.value))} className="ode-range w-40" />
          <span className="text-neutral-500">{c === 0 ? 'conservative — V constant' : 'dissipative — V decreasing'}</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">energy along the trajectory</div>
            <MultiLinePlot series={Vseries} xRange={[0, tMax]} yRange={[0, 3.5]} yTicks={[0, 1.75, 3.5]} xLabel="t" yLabel="V" height={195} legend={false} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">phase portrait</div>
            <PhasePortrait phase={phase} width={320} height={195} framesPerTraj={150} />
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">With c = 0 the energy is flat — the orbits are exactly its level sets (closed curves). With c &gt; 0 it ratchets down monotonically and the orbit spirals into the bottom.</div>
      </div>

      <p>
        When <Eq>{'\\dot V<0'}</Eq> strictly, the equilibrium is asymptotically stable. The pendulum is the
        subtle case: <Eq>{'\\dot V=-c\\omega^2'}</Eq> is only <em>zero-or-negative</em> (it vanishes whenever{' '}
        <Eq>{'\\omega=0'}</Eq>). <strong>LaSalle's invariance principle</strong> rescues it — the only place
        the system can linger with <Eq>{'\\omega\\equiv0'}</Eq> is the bottom, so it still converges there.
      </p>

      <MinSchema>
        a positive-definite <Term>Lyapunov function</Term> with <Eq>{'\\dot V\\le 0'}</Eq> proves stability
        directly from the vector field — no solution needed. For mechanical systems, use energy; dissipation
        makes <Eq>{'\\dot V<0'}</Eq> and forces decay to rest.
      </MinSchema>

      <Deeper>
        <p>
          <strong>Conserved quantities organize the undamped phase plane.</strong> With <Eq>{'c=0'}</Eq>,{' '}
          <Eq>{'\\dot V=0'}</Eq> means <Eq>V</Eq> is constant along motion — so every trajectory is a level set
          of <Eq>V</Eq>. That's why the undamped <CrossLink to="phaseplane" recap="Closed orbits are energy level sets; the separatrix is the level through the saddle.">phase portrait</CrossLink> is a family of nested closed curves, and the separatrix is one special energy level. Preserving this <Eq>V</Eq>{' '}
          numerically is the entire point of <CrossLink to="symplectic" recap="Symplectic integrators conserve a shadow energy, keeping orbits closed.">symplectic integrators</CrossLink>.
        </p>
        <p>
          <strong>Beyond mechanics.</strong> Lyapunov functions aren't limited to energy — any certifying{' '}
          <Eq>V</Eq> works, and finding one is a craft. Control engineers <em>design</em> a controller to make
          a chosen <Eq>V</Eq> decrease (control-Lyapunov functions); the{' '}
          <CrossLink to="#control-theory" external recap="Lyapunov stability and energy-shaping swing-up control.">control-theory explainer</CrossLink> uses exactly this to swing the pendulum up.
        </p>
      </Deeper>
    </Card>
  );
};
const LimitCycleCard = () => {
  const [mu, setMu] = useState(1.0);
  const phase = useMemo(() => ({
    deriv: (x, y) => [y, mu * (1 - x * x) * y - x],
    xRange: [-3, 3], yRange: [-4, 4], xLabel: 'x', yLabel: 'ẋ', dt: 0.03,
    initials: [[0.1, 0.1], [2.8, 0], [-2.8, 0], [0, 3.6]],
    verdict: `μ = ${mu.toFixed(2)} · all trajectories → one limit cycle`, verdictColor: '#fb7185',
  }), [mu]);
  return (
    <Card id="limitcycle" icon={RotateCw} title="Limit cycles & nonlinear oscillation" accent="rose" index={14}
          subtitle="An oscillation that sets its own amplitude — and why 2-D can't be chaotic">
      <Intuition>
        <p>
          A linear oscillator's amplitude is whatever you start it with — a center is a ring of orbits, each
          frozen at its own size. Nonlinearity can do something a linear system never can: create an{' '}
          <strong>isolated</strong> closed orbit that <em>attracts</em> everything nearby. Start big and you
          decay onto it; start tiny and you grow onto it. The amplitude is set by the dynamics, not the
          initial push. That's a <Term>limit cycle</Term> — the math of heartbeats, neurons firing, and
          self-sustained vibrations.
        </p>
      </Intuition>

      <p>The canonical example is the Van der Pol oscillator — a pendulum-like equation with <em>state-dependent</em> damping:</p>
      <Block>{'\\ddot{\\sol{x}} - \\mu(1-\\sol{x}^2)\\dot{\\sol{x}} + \\sol{x} = 0'}</Block>
      <ReadEq>
        when <Eq>{'|x|<1'}</Eq> the damping term is <em>negative</em> (it pumps energy in); when{' '}
        <Eq>{'|x|>1'}</Eq> it's positive (it bleeds energy out). The system can't rest small or grow large — it
        settles onto the balance in between.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          nonlinearity μ = <span className="text-rose-300 tabular-nums">{mu.toFixed(2)}</span>
          <input type="range" min="0.1" max="4" step="0.1" value={mu} onChange={e => setMu(parseFloat(e.target.value))} className="ode-range w-40" />
          <span className="text-neutral-500">{mu < 0.4 ? 'nearly sinusoidal' : mu > 2 ? 'sharp relaxation oscillation' : 'rounded cycle'}</span>
        </label>
        <div className="flex justify-center"><PhasePortrait phase={phase} width={420} height={290} framesPerTraj={170} /></div>
        <div className="text-[11px] text-neutral-500 mt-1">Watch both the inside-out spiral (from near the origin) and the outside-in spiral (from the edges) wind onto the <em>same</em> closed loop. Crank μ up and the cycle stiffens into a fast-slow "relaxation" oscillation.</div>
      </div>

      <p>
        Limit cycles are also where the 2-D world hits its ceiling. The{' '}
        <strong>Poincaré–Bendixson theorem</strong> says a bounded trajectory in the plane that avoids fixed
        points must approach a closed orbit — so the richest thing a 2-D autonomous system can do is cycle. No
        chaos is possible. To get chaos you need a third dimension, which is exactly what driving the pendulum
        will buy us.
      </p>

      <MinSchema>
        a <Term>limit cycle</Term> is an isolated periodic orbit that nearby trajectories converge to — a
        self-selected amplitude, impossible in a linear system. In 2-D autonomous flows
        (Poincaré–Bendixson) cycles are the end of the line: <strong>chaos needs ≥ 3 dimensions.</strong>
      </MinSchema>

      <Misconception
        wrong={'"A nonlinear oscillator is just a linear one with a different frequency."'}
        right={'A limit cycle has a fixed, dynamics-determined amplitude and (for large μ) a richly non-sinusoidal waveform with two timescales. Its existence is a genuinely nonlinear phenomenon.'}
        because={'Linear systems give you a one-parameter family of orbits (any amplitude). Isolation — nearby orbits converging to one — requires the nonlinear term that makes damping change sign with state.'}
      />

      <Deeper>
        <p>
          <strong>Relaxation oscillations.</strong> For large <Eq>{'\\mu'}</Eq> the Van der Pol cycle splits
          into slow crawls along stable branches punctuated by fast jumps — the prototype for neuron spiking
          (FitzHugh–Nagumo) and many biological clocks. The two timescales here are the same phenomenon that
          makes a system <CrossLink to="stiff" recap="Widely separated timescales make explicit solvers crawl.">stiff</CrossLink>, foreshadowing the numerics section.
        </p>
        <p>
          <strong>The dimension count is the headline.</strong> Poincaré–Bendixson is why the autonomous
          pendulum (2-D) can only swing, rotate, or decay — never wander chaotically. Add a periodic drive and
          the non-autonomous system is effectively 3-D <Eq>{'(\\theta,\\omega,t\\bmod T)'}</Eq>, and the ceiling
          lifts — see the <CrossLink to="chaos" recap="Drive + damping + gravity = 3 dimensions = room for chaos.">chaos card</CrossLink>.
        </p>
      </Deeper>
    </Card>
  );
};
// global error at T of a stepper on the small-angle oscillator [θ,ω]'=[ω,−θ], θ(0)=1 (exact cos t)
const oscErr = (stepper, h, T = 6) => {
  const f = (s) => [s[1], -s[0]];
  let s = [1, 0], t = 0; const N = Math.round(T / h);
  for (let i = 0; i < N; i++) { s = stepper(f, s, t, h); t += h; }
  return Math.abs(s[0] - Math.cos(T));
};
const HS = [0.5, 0.25, 0.125, 0.0625, 0.03125];

const EulerCard = () => {
  const [h, setH] = useState(0.3);
  const tMax = 14;
  const f = (s) => [s[1], -s[0]];
  const eulerTraj = useMemo(() => {
    const xs = [[0, 1]]; let s = [1, 0], t = 0; const N = Math.round(tMax / h);
    for (let i = 0; i < N; i++) { s = eulerStep(f, s, t, h); t += h; xs.push([t, s[0]]); }
    return xs;
  }, [h]);
  const exact = Array.from({ length: 160 }, (_, i) => { const t = (i / 159) * tMax; return [t, Math.cos(t)]; });
  const errPts = HS.map(hh => [Math.log10(hh), Math.log10(oscErr(eulerStep, hh))]);
  const ref = [[Math.log10(HS[HS.length - 1]), Math.log10(oscErr(eulerStep, HS[HS.length - 1]))]];
  const slope1 = HS.map(hh => [Math.log10(hh), ref[0][1] + 1 * (Math.log10(hh) - ref[0][0])]);
  return (
    <Card id="euler" icon={Ruler} title="Euler's method" accent="amber" index={15} anchor
          subtitle="The simplest solver — follow the tangent and hope">
      <Intuition>
        <p>
          If an ODE is a field of arrows, the most obvious way to "follow" it is brute force: read the arrow
          where you are, take a small straight step in that direction, read the new arrow, step again. That's{' '}
          <strong>Euler's method</strong> — replace the curve by a sequence of tiny tangent lines. It's the
          conceptual atom of every numerical solver, and watching it fail is the best way to understand why
          better methods exist.
        </p>
      </Intuition>

      <Block>{'\\sol{y}_{n+1} = \\sol{y}_n + \\num{h}\\,\\st{f}(t_n, \\sol{y}_n)'}</Block>
      <ReadEq>
        new value = old value + step size <Eq>{'\\num{h}'}</Eq> times the slope right now. Geometrically: walk
        along the tangent for a time <Eq>{'\\num{h}'}</Eq>, then re-aim.
      </ReadEq>

      <p>
        Each step's <Term>local truncation error</Term> is <Eq>{'O(\\num{h}^2)'}</Eq> (the curve bends away from
        the tangent); accumulated over <Eq>{'\\sim 1/\\num{h}'}</Eq> steps the <Term>global error</Term> is{' '}
        <Eq>{'O(\\num{h})'}</Eq> — Euler is a <strong>first-order</strong> method. Halve the step, halve the
        error. Watch it on the harmonic oscillator (exact answer: <Eq>{'\\cos t'}</Eq>):
      </p>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          step size h = <span className="text-amber-300 tabular-nums">{h.toFixed(3)}</span>
          <input type="range" min="0.02" max="0.6" step="0.01" value={h} onChange={e => setH(parseFloat(e.target.value))} className="ode-range w-40" />
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Euler vs exact</div>
            <MultiLinePlot
              series={[{ pts: exact, color: '#6ee7b7', width: 1.6, dash: '4 3', label: 'exact cos t' }, { pts: eulerTraj, color: '#fbbf24', width: 1.8, label: 'Euler' }]}
              xRange={[0, tMax]} yRange={[-2.2, 2.2]} yTicks={[-2, 0, 2]} xLabel="t" yLabel="θ" height={195} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">global error vs step (log–log)</div>
            <MultiLinePlot
              series={[{ pts: slope1, color: '#67e8f9', width: 1.4, dash: '4 3', label: 'slope 1 reference' }, { pts: errPts, color: '#fbbf24', width: 2, label: 'Euler error' }]}
              xRange={[-1.6, -0.2]} yRange={[-3, 0.5]} yTicks={[-3, -1.5, 0]} xLabel="log₁₀ h" yLabel="err" height={195}
              dots={errPts.map(p => ({ x: p[0], y: p[1], color: '#fbbf24' }))} />
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">The error points lie on a line of slope 1 — the signature of a first-order method. Note Euler's amplitude <em>grows</em>: on an oscillator it spuriously injects energy, a stability problem the stiffness card explains.</div>
      </div>

      <MinSchema>
        Euler steps along the tangent: <Eq>{'\\sol{y}_{n+1}=\\sol{y}_n+\\num{h}\\st{f}'}</Eq>. Global error is{' '}
        <Eq>{'O(\\num{h})'}</Eq> — first order. Simple and universal, but you pay in accuracy and (worse) in
        stability. It's the baseline every other method beats.
      </MinSchema>

      <Misconception
        wrong={'"Just make h tiny and Euler is fine."'}
        right={'Shrinking h cuts truncation error but multiplies the number of steps — so round-off accumulates and runtime explodes. And on oscillatory or stiff problems Euler is unstable at any practical h, drifting no matter how small you go.'}
        because={'Accuracy and stability are different axes. The next cards fix accuracy (RK4) and stability (implicit methods) separately, because no single small-h knob fixes both.'}
      />

      <Deeper>
        <p>
          <strong>Why an oscillator is the cruel test.</strong> Explicit Euler maps the harmonic oscillator's
          state by a matrix whose eigenvalues have magnitude <Eq>{'\\sqrt{1+h^2}>1'}</Eq> — every step
          multiplies the amplitude by slightly more than one, so energy grows without bound regardless of{' '}
          <Eq>{'h'}</Eq>. That's not truncation error, it's <em>instability</em>: the discrete map has the
          wrong qualitative behavior. The <CrossLink to="stiff" recap="Stability regions: where a method keeps y′=λy bounded.">stiffness card</CrossLink> makes this precise, and the{' '}
          <CrossLink to="symplectic" recap="Symplectic Euler fixes the energy drift by preserving phase-space area.">symplectic card</CrossLink> shows the one-line fix.
        </p>
      </Deeper>
    </Card>
  );
};
const RK4Card = () => {
  const methods = [
    { name: 'Euler', step: eulerStep, color: '#fb7185', order: 1 },
    { name: 'RK2 (midpoint)', step: rk2Step, color: '#fbbf24', order: 2 },
    { name: 'RK4', step: rk4Step, color: '#6ee7b7', order: 4 },
  ];
  const errSeries = methods.map(m => {
    const pts = HS.map(hh => [Math.log10(hh), Math.log10(Math.max(1e-16, oscErr(m.step, hh)))]);
    return { pts, color: m.color, width: 2, label: `${m.name} · O(h^${m.order})`, dots: true };
  });
  // accuracy at one shared, fairly large step
  const hShared = 0.4;
  const errAt = methods.map(m => ({ name: m.name, color: m.color, err: oscErr(m.step, hShared) }));
  return (
    <Card id="rk4" icon={Gauge} title="Runge–Kutta · RK4" accent="amber" index={16}
          subtitle="Sample the slope four times — the everyday workhorse">
      <Intuition>
        <p>
          Euler trusts the slope at the <em>start</em> of the step, but the slope changes as you cross the
          interval. Runge–Kutta's idea: take some exploratory probes, see how the slope evolves, and step with
          a cleverly weighted average. <strong>RK4</strong> uses four probes — start, two at the midpoint, one
          at the end — and the errors cancel to an astonishing degree. Same number of lines of code as Euler;
          dramatically more accuracy per step.
        </p>
      </Intuition>

      <Block>{'\\begin{aligned} k_1 &= \\st{f}(t_n, \\sol{y}_n), & k_2 &= \\st{f}(t_n+\\tfrac{\\num{h}}{2}, \\sol{y}_n+\\tfrac{\\num{h}}{2}k_1)\\\\ k_3 &= \\st{f}(t_n+\\tfrac{\\num{h}}{2}, \\sol{y}_n+\\tfrac{\\num{h}}{2}k_2), & k_4 &= \\st{f}(t_n+\\num{h}, \\sol{y}_n+\\num{h}\\,k_3) \\end{aligned}'}</Block>
      <Block>{'\\sol{y}_{n+1} = \\sol{y}_n + \\tfrac{\\num{h}}{6}\\left(k_1 + 2k_2 + 2k_3 + k_4\\right)'}</Block>
      <ReadEq>
        a weighted average of four slope samples, midpoints counted double. The weights are tuned to match the
        Taylor series through <Eq>{'\\num{h}^4'}</Eq> — so the <Term>global error</Term> is{' '}
        <Eq>{'O(\\num{h}^4)'}</Eq>.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">global error vs step size (log–log)</div>
        <MultiLinePlot series={errSeries} xRange={[-1.6, -0.2]} yRange={[-13, 1]} yTicks={[-12, -6, 0]}
          xLabel="log₁₀ h" yLabel="err" height={230}
          dots={errSeries.flatMap(s => s.pts.map(p => ({ x: p[0], y: p[1], color: s.color, r: 2.5 })))} />
        <div className="text-[11px] text-neutral-500 mt-1">Steeper slope = higher order = error falls off faster as you refine h. RK4's line plunges; by h ≈ 0.03 it's already near machine precision while Euler is still at ~1%.</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {errAt.map(m => (
          <Stat key={m.name} label={m.name} value={m.err < 1e-4 ? m.err.toExponential(1) : m.err.toFixed(4)}
            sub={`error at h=${hShared}`} color="" />
        ))}
      </div>
      <p className="text-[12px] text-neutral-400">
        At one coarse step <Eq>{'h=0.4'}</Eq> the methods span orders of magnitude: RK4's four evaluations buy
        roughly <Eq>{'10^{4}\\times'}</Eq> the accuracy of Euler's one. That's why RK4 (and its adaptive
        cousins) is the default in every scientific library.
      </p>

      <Predict question="RK4 costs 4 function evaluations per step vs Euler's 1. If you give Euler 4× as many steps to equalize the cost, does it catch up to RK4?">
        Not remotely. With 4× the steps Euler's error drops by ~4× (it's <Eq>{'O(h)'}</Eq>). RK4's error at the original step is already smaller by a factor of <Eq>{'\\sim(1/h)^3'}</Eq>. Higher <em>order</em> beats more <em>steps</em> by a margin that grows as you demand more accuracy — the whole reason order matters.
      </Predict>

      <MinSchema>
        RK4 averages four slope samples per step to reach <Eq>{'O(\\num{h}^4)'}</Eq> accuracy — halving{' '}
        <Eq>{'\\num{h}'}</Eq> cuts error ~16×. For smooth, non-stiff problems it's the right default: cheap,
        accurate, robust. (It does <em>not</em> fix stiffness — that's a separate axis.)
      </MinSchema>

      <Deeper>
        <p>
          <strong>Order vs stability, again.</strong> RK4 is wildly more accurate but it's still an{' '}
          <em>explicit</em> method, so it inherits a bounded <CrossLink to="stiff" recap="Each explicit method has a finite stability region in the complex hλ-plane.">stability region</CrossLink> — on a stiff problem it too is forced to take tiny steps. Order improves the
          accuracy-for-effort tradeoff in the well-behaved regime; it doesn't change which problems are
          well-behaved.
        </p>
        <p>
          <strong>Why stop at four?</strong> Higher-order RK schemes exist, but the number of required slope
          evaluations grows faster than the order beyond 4 (the Butcher barriers), so the accuracy-per-cost
          sweet spot for general use sits right around RK4 — which is also why production solvers build their{' '}
          <CrossLink to="adaptive" recap="Embedded RK pairs (RK45) estimate error to adapt the step.">adaptive pairs</CrossLink> on order-4/5 cores.
        </p>
      </Deeper>
    </Card>
  );
};
const StabRegion = ({ hl, width = 190, height = 170 }) => {
  const maxR = 3.2;
  const cx = (re) => width / 2 + (re / maxR) * (width / 2 - 12);
  const cy = (im) => height / 2 - (im / maxR) * (height / 2 - 12);
  const inside = Math.abs(1 + hl) <= 1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block mx-auto">
      {/* explicit-Euler stability disk |1+z|≤1 : centre (−1,0) radius 1 */}
      <circle cx={cx(-1)} cy={cy(0)} r={(1 / maxR) * (width / 2 - 12)} fill="rgba(110,231,183,0.14)" stroke="#6ee7b7" strokeWidth="1.2" />
      <line x1="6" y1={height / 2} x2={width - 6} y2={height / 2} stroke="rgba(255,255,255,0.25)" />
      <line x1={width / 2} y1="6" x2={width / 2} y2={height - 6} stroke="rgba(255,255,255,0.25)" />
      <text x={cx(-1)} y={cy(0) + 3} fontSize="7.5" textAnchor="middle" fill="#6ee7b7" fontFamily="ui-monospace, monospace">stable</text>
      <text x={width - 8} y={height / 2 - 4} fontSize="8" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">Re(hλ)</text>
      <circle cx={cx(clamp(hl, -maxR, maxR))} cy={cy(0)} r="4.5" fill={inside ? '#6ee7b7' : '#fb7185'} stroke="#0a0a0a" strokeWidth="1.5" />
    </svg>
  );
};

const StiffCard = () => {
  const [lam, setLam] = useState(25);
  const [h, setH] = useState(0.06);
  const tMax = 1;
  const N = Math.round(tMax / h);
  const expl = []; const impl = []; const exact = [];
  let ye = 1, yi = 1;
  for (let i = 0; i <= N; i++) {
    const t = i * h;
    expl.push([t, ye]); impl.push([t, yi]); exact.push([t, Math.exp(-lam * t)]);
    ye = ye * (1 - lam * h);
    yi = yi / (1 + lam * h);
  }
  const hl = -lam * h;
  const stableExplicit = h < 2 / lam;
  return (
    <Card id="stiff" icon={AlertTriangle} title="Stability & stiffness" accent="rose" index={17}
          subtitle="When fast and slow collide — and explicit methods break">
      <Intuition>
        <p>
          A problem is <Term>stiff</Term> when it mixes wildly different timescales — a component that decays in
          microseconds riding alongside one that evolves over seconds. The fast part dies almost immediately,
          so you'd love to take big steps afterward. But an <em>explicit</em> method won't let you: to stay
          stable it must keep its step smaller than the <strong>fastest</strong> timescale, long after that
          mode is gone. You crawl for no accuracy reason — purely to avoid blowing up.
        </p>
      </Intuition>

      <p>The cleanest case is pure fast decay <Eq>{'\\dot{\\sol{y}} = -\\lambda \\sol{y}'}</Eq> with large <Eq>{'\\lambda'}</Eq>. Compare explicit and implicit (backward) Euler:</p>
      <Block>{'\\underbrace{\\sol{y}_{n+1} = \\sol{y}_n(1-\\lambda \\num{h})}_{\\text{explicit · stable only if }\\num{h}<2/\\lambda} \\qquad\\quad \\underbrace{\\sol{y}_{n+1} = \\frac{\\sol{y}_n}{1+\\lambda \\num{h}}}_{\\text{implicit · stable for any }\\num{h}}'}</Block>
      <ReadEq>
        explicit Euler multiplies by <Eq>{'(1-\\lambda \\num{h})'}</Eq> each step — bigger than 1 in magnitude
        once <Eq>{'\\num{h}>2/\\lambda'}</Eq>, so it oscillates and explodes. <Term>implicit method</Term>s
        divide instead, shrinking the answer for any step.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-4 mb-2">
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            stiffness λ = <span className="text-rose-300 tabular-nums">{lam}</span>
            <input type="range" min="5" max="60" step="1" value={lam} onChange={e => setLam(parseFloat(e.target.value))} className="ode-range w-28" />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            step h = <span className="text-rose-300 tabular-nums">{h.toFixed(3)}</span>
            <input type="range" min="0.01" max="0.16" step="0.005" value={h} onChange={e => setH(parseFloat(e.target.value))} className="ode-range w-28" />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-3 items-center">
          <MultiLinePlot
            series={[
              { pts: exact, color: '#a3a3a3', width: 1.4, dash: '3 3', label: 'exact' },
              { pts: impl, color: '#6ee7b7', width: 1.8, label: 'implicit (backward)' },
              { pts: expl, color: '#fb7185', width: 1.8, label: 'explicit' },
            ]}
            xRange={[0, tMax]} yRange={[-1.5, 1.5]} yTicks={[-1, 0, 1]} xLabel="t" yLabel="y" height={195} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">explicit-Euler stability region</div>
            <StabRegion hl={hl} />
            <div className="text-[11px] mt-1 font-mono" style={{ color: stableExplicit ? '#6ee7b7' : '#fb7185' }}>
              hλ = {hl.toFixed(2)} · {stableExplicit ? 'inside disk → explicit OK' : 'outside disk → explicit blows up'}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Push h past 2/λ = {(2 / lam).toFixed(3)} and the green dot leaves the disk: explicit Euler oscillates with growing amplitude while implicit Euler tracks the (boring, already-decayed) solution perfectly.</div>
      </div>

      <MinSchema>
        stiffness = a fast mode dictating a tiny stable step long after it's irrelevant. Explicit methods have
        a bounded <Term>stability region</Term> (the disk), so <Eq>{'\\num{h}\\lesssim 2/\\lambda_{\\max}'}</Eq>;{' '}
        <Term>implicit method</Term>s are stable for any step (the whole left half-plane), at the cost of an
        equation solve per step. Match the method to the problem, not the tolerance.
      </MinSchema>

      <Misconception
        wrong={'"My solver is slow / blowing up — I need a smaller tolerance."'}
        right={'On a stiff problem an explicit solver is step-limited by stability, not accuracy. The fix is a stiff (implicit) solver — BDF, Radau, backward Euler — not a tighter tolerance.'}
        because={'A tighter tolerance just forces even smaller steps. Switching to an implicit method (e.g. solve_ivp method="BDF" / "Radau") removes the stability ceiling entirely, often speeding things up 100×.'}
      />

      <Deeper>
        <p>
          <strong>The cost of going implicit.</strong> Backward Euler needs <Eq>{'\\sol{y}_{n+1}'}</Eq> on both
          sides, so each step solves an algebraic (generally nonlinear) equation — a Newton iteration using the{' '}
          <CrossLink to="linearize" recap="The Jacobian linearizes f — implicit solvers need it each step.">Jacobian</CrossLink>. That's more work per step, but the steps can be enormous, so for stiff systems it
          wins overwhelmingly. This is the same trick the <CrossLink to="#control-theory" external recap="Riccati/MPC solves rely on stable implicit integration of stiff dynamics.">control-theory explainer</CrossLink> leans on when integrating stiff closed-loop dynamics.
        </p>
        <p>
          <strong>A-stability.</strong> Backward Euler is <em>A-stable</em>: its stability region is the entire
          left half-plane, so any genuinely decaying mode stays bounded at any step. No explicit Runge–Kutta
          method can be A-stable (Dahlquist's barrier) — which is exactly why stiff solvers are a separate
          family, not just RK4 with smaller steps.
        </p>
      </Deeper>
    </Card>
  );
};
const AdaptiveCard = () => {
  const [logTol, setLogTol] = useState(-4);
  const tol = Math.pow(10, logTol);
  const recs = useMemo(() => {
    const f = (s) => [s[1], 5 * (1 - s[0] * s[0]) * s[1] - s[0]];
    let x = [2, 0.1], t = 0, h = 0.01; const tEnd = 20;
    const out = [{ t: 0, h: 0.01, x: [2, 0.1] }];
    let iter = 0;
    while (t < tEnd && iter < 40000) {
      iter++;
      if (t + h > tEnd) h = tEnd - t;
      const big = rk4Step(f, x, t, h);
      const mid = rk4Step(f, x, t, h / 2);
      const two = rk4Step(f, mid, t + h / 2, h / 2);
      const err = Math.hypot(big[0] - two[0], big[1] - two[1]) + 1e-13;
      if (err < tol || h <= 1e-4) { x = two; t += h; out.push({ t, h, x: x.slice() }); }
      const fac = 0.9 * Math.pow(tol / err, 0.2);
      h = clamp(h * clamp(fac, 0.2, 4), 1e-4, 0.6);
    }
    return out;
  }, [tol]);
  const minH = Math.min(...recs.map(r => r.h));
  const maxH = Math.max(...recs.map(r => r.h));
  const uniform = Math.round(20 / minH);
  const xt = recs.map(r => [r.t, r.x[0]]);
  const ht = recs.map(r => [r.t, r.h]);
  return (
    <Card id="adaptive" icon={Sliders} title="Adaptive stepping" accent="sky" index={18}
          subtitle="Let the solver choose the step — tiny where it's hard, huge where it's easy">
      <Intuition>
        <p>
          A fixed step size is always wrong: too big across the hard parts, wastefully small across the easy
          ones. Real solvers (<Eq>{'\\texttt{ode45}'}</Eq>, <Eq>{'\\texttt{solve\\_ivp}'}</Eq>) instead{' '}
          <strong>estimate their own error each step and resize</strong>: shrink <Eq>{'\\num{h}'}</Eq> when the
          solution is changing fast, grow it when things are smooth — all to hold a user tolerance with the
          fewest steps.
        </p>
      </Intuition>

      <p>
        The trick is a cheap error estimate. Step once at <Eq>{'\\num{h}'}</Eq> and twice at{' '}
        <Eq>{'\\num{h}/2'}</Eq>; their difference estimates the local error. (Production codes use{' '}
        <strong>embedded pairs</strong> — RKF45, Dormand–Prince — that get a 4th- and 5th-order answer from{' '}
        <em>one</em> set of evaluations.) Then accept or retry, and rescale:
      </p>
      <Block>{'\\num{h}_{\\text{new}} = \\num{h}\\cdot\\left(\\frac{\\text{tol}}{\\text{err}}\\right)^{1/(p+1)}'}</Block>
      <ReadEq>
        if the error came in under tolerance, push the step up; if it overshot, pull it down. The exponent uses
        the method order <Eq>p</Eq> so the correction lands in one or two tries.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          tolerance = <span className="text-sky-300 tabular-nums">1e{logTol}</span>
          <input type="range" min="-7" max="-2" step="1" value={logTol} onChange={e => setLogTol(parseInt(e.target.value))} className="ode-range w-40" />
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Van der Pol x(t) · step marks</div>
            <MultiLinePlot series={[{ pts: xt, color: '#7dd3fc', width: 1.6 }]}
              xRange={[0, 20]} yRange={[-3, 3]} yTicks={[-2, 0, 2]} xLabel="t" yLabel="x" height={195}
              dots={recs.filter((_, i) => i % 2 === 0).map(r => ({ x: r.t, y: r.x[0], color: '#c4b5fd', r: 1.6 }))} legend={false} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">chosen step size h(t)</div>
            <MultiLinePlot series={[{ pts: ht, color: '#fbbf24', width: 1.8 }]}
              xRange={[0, 20]} yRange={[0, Math.max(0.6, maxH * 1.1)]} yTicks={[0, 0.3, 0.6]} xLabel="t" yLabel="h" height={195} legend={false} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Stat label="adaptive steps" value={recs.length} color="text-sky-200" />
          <Stat label="step range" value={`${minH.toFixed(3)}–${maxH.toFixed(2)}`} sub={`${(maxH / minH).toFixed(0)}× spread`} color="text-amber-200" />
          <Stat label="uniform would need" value={uniform.toLocaleString('en-US')} sub="at the smallest step" color="text-rose-200" />
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">The dots bunch up — and h dips sharply — exactly at the fast "jumps" of the relaxation oscillation, then stretch out along the slow crawls. A uniform grid fine enough for the jumps would waste {(uniform / recs.length).toFixed(0)}× the work.</div>
      </div>

      <MinSchema>
        adaptive solvers estimate local error (step-doubling or an <strong>embedded pair</strong>) and resize{' '}
        <Eq>{'\\num{h}'}</Eq> to hold a tolerance — small steps in fast regions, big steps in smooth ones. This
        is what <Eq>{'\\texttt{ode45}'}</Eq> / <Eq>{'\\texttt{solve\\_ivp}'}</Eq> do by default; you specify
        accuracy, not step size.
      </MinSchema>

      <Misconception
        wrong={'"Adaptive means the solver is approximate / less trustworthy than fixed-step."'}
        right={'Adaptive stepping targets a controlled error bound — it is usually more accurate and far cheaper than a fixed step, because effort follows difficulty.'}
        because={'You set rtol/atol; the controller spends steps where they buy accuracy and coasts elsewhere. Fixed-step is the blunt instrument — adaptive is the calibrated one.'}
      />

      <Deeper>
        <p>
          <strong>What the tolerance really controls.</strong> Tightening tol lowers the <em>local</em> error
          per step, but global error accumulates, so you don't get the tolerance verbatim at the final time —
          you get proportional control over it. Drag the tolerance above and watch the step count climb roughly
          geometrically as you demand more digits.
        </p>
        <p>
          <strong>Stiffness still bites.</strong> Adaptivity manages <em>accuracy</em>; it does not rescue an
          explicit method from a <CrossLink to="stiff" recap="Explicit stability caps the step regardless of accuracy.">stiff</CrossLink> stability limit. On a stiff problem an adaptive explicit solver drives its step to the
          stability ceiling and stays pinned there — which is why libraries ship separate stiff (implicit)
          integrators with their own adaptive control.
        </p>
      </Deeper>
    </Card>
  );
};
const SymplecticCard = () => {
  const [h, setH] = useState(0.25);
  const P = { g: 1, L: 1, c: 0, A: 0, Om: 0 };
  const x0 = [2.0, 0];
  const E0 = pendEnergy(x0[0], x0[1], P);
  const tMax = 400;
  const data = useMemo(() => {
    const N = Math.round(tMax / h);
    const f = (s) => [s[1], -Math.sin(s[0])];
    let eu = x0.slice(), se = x0.slice(), lf = x0.slice();
    const eEu = [], eSe = [], eLf = [];
    for (let i = 0; i <= N; i++) {
      const t = i * h;
      eEu.push([t, pendEnergy(eu[0], eu[1], P) - E0]);
      eSe.push([t, pendEnergy(se[0], se[1], P) - E0]);
      eLf.push([t, pendEnergy(lf[0], lf[1], P) - E0]);
      eu = eulerStep(f, eu, t, h);
      se = symplecticEulerStep(P, se, h);
      lf = leapfrogStep(P, lf, h);
    }
    return { eEu, eSe, eLf, errEu: eEu[eEu.length - 1][1], ampSe: Math.max(...eSe.map(p => Math.abs(p[1]))), ampLf: Math.max(...eLf.map(p => Math.abs(p[1]))) };
  }, [h]);
  return (
    <Card id="symplectic" icon={Sparkles} title="Symplectic integrators & conservation" accent="emerald" index={19}
          subtitle="Why orbit and physics sims don't use RK4">
      <Intuition>
        <p>
          RK4 is the accuracy champion — yet run an undamped pendulum (or a planet) for a million steps and
          something subtle goes wrong: its energy slowly <strong>drifts</strong>, so the orbit creeps inward or
          outward instead of closing. The conserved quantity that organizes the whole phase plane is quietly
          violated. <Term>Symplectic</Term> integrators fix this by construction: they preserve phase-space
          geometry, so energy stays <em>bounded forever</em> — even though each step is less accurate than RK4.
        </p>
      </Intuition>

      <p>
        The simplest fix is one transposition. Plain (explicit) Euler updates position and velocity from the{' '}
        <em>old</em> state; <strong>symplectic Euler</strong> updates the velocity first, then uses the{' '}
        <em>new</em> velocity for the position:
      </p>
      <Block>{'\\underbrace{\\st{\\omega}_{n+1} = \\st{\\omega}_n - \\num{h}\\sin\\sol{\\theta}_n,\\quad \\sol{\\theta}_{n+1} = \\sol{\\theta}_n + \\num{h}\\,\\st{\\omega}_{n+1}}_{\\text{symplectic Euler — preserves phase-space area}}'}</Block>
      <ReadEq>
        a one-character change from explicit Euler (<Eq>{'\\omega_{n+1}'}</Eq> instead of{' '}
        <Eq>{'\\omega_n'}</Eq> in the second line), yet it turns an energy-pumping disaster into a stable orbit.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          step size h = <span className="text-emerald-300 tabular-nums">{h.toFixed(2)}</span>
          <input type="range" min="0.05" max="0.5" step="0.01" value={h} onChange={e => setH(parseFloat(e.target.value))} className="ode-range w-40" />
          <span className="text-neutral-500">energy error over {tMax} time units</span>
        </label>
        <MultiLinePlot
          series={[
            { pts: data.eEu, color: '#fb7185', width: 1.8, label: 'explicit Euler — energy pumps up' },
            { pts: data.eSe, color: '#67e8f9', width: 1.4, label: 'symplectic Euler — bounded' },
            { pts: data.eLf, color: '#6ee7b7', width: 1.6, label: 'leapfrog — bounded & tiny' },
          ]}
          xRange={[0, tMax]} yRange={[-0.3, 0.7]} yTicks={[-0.2, 0.2, 0.6]} xLabel="t" yLabel="E − E₀" height={210}
          hlines={[{ at: 0, color: '#a3a3a3', dash: '2 4' }]} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Stat label="explicit Euler error" value={fmtN(data.errEu, 2)} sub="climbs without bound — orbit spirals out" color="text-rose-200" />
          <Stat label="leapfrog max error" value={data.ampLf.toFixed(3)} sub="bounded — oscillates, never drifts" color="text-emerald-200" />
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Same first-order cost, opposite fate: explicit Euler's energy error climbs off the top of the chart (the orbit unwinds outward), while symplectic Euler and leapfrog stay in a flat band forever — the orbit stays closed for as long as you integrate.</div>
      </div>

      <Predict question="Explicit and symplectic Euler are both first-order and cost the same one evaluation per step. Why does one conserve energy and the other detonate it?">
        It's <em>which</em> state each uses. Explicit Euler advances position with the <em>old</em> velocity; symplectic Euler uses the <em>just-updated</em> velocity. That one change makes the discrete map preserve phase-space area exactly, so it conserves a nearby "shadow" energy — its error stays bounded forever. Explicit Euler preserves nothing, so its energy ratchets up every step. Same order, same cost, opposite long-term fate.
      </Predict>

      <MinSchema>
        for <Term>Hamiltonian</Term> (conservative) systems, use a <Term>symplectic</Term> integrator
        (symplectic Euler, leapfrog/Verlet). They preserve phase-space structure exactly, so energy stays
        bounded and orbits stay closed over astronomically long runs — something no fixed amount of accuracy
        from a non-symplectic method can guarantee.
      </MinSchema>

      <Misconception
        wrong={'"Accuracy is all that matters — pick the highest-order method."'}
        right={'For conservative long-time dynamics, structure-preservation matters more than order. A 1st-order symplectic method keeps energy bounded forever; even 4th-order RK4 drifts monotonically (just slowly), eventually unwinding the orbit.'}
        because={'Order controls short-term error; symplecticity controls long-term qualitative behavior. They are different goals — molecular dynamics, orbital mechanics, and accelerator physics all pick symplectic for exactly this reason.'}
      />

      <Deeper>
        <p>
          <strong>The shadow Hamiltonian.</strong> A symplectic method doesn't conserve the true energy{' '}
          <Eq>H</Eq> exactly, but it <em>does</em> exactly conserve a nearby <Eq>{'\\tilde H = H + O(\\num{h}^p)'}</Eq> — a
          slightly perturbed energy. Since the trajectory rides a level set of <Eq>{'\\tilde H'}</Eq>, and{' '}
          <Eq>{'\\tilde H'}</Eq> stays within <Eq>{'O(\\num{h}^p)'}</Eq> of <Eq>H</Eq> forever, the true energy
          error can wobble but never drift. This is exactly the energy <CrossLink to="lyapunov" recap="E = ½ω² − cosθ; its level sets are the undamped orbits.">level-set</CrossLink> picture, kept intact numerically.
        </p>
        <p>
          <strong>Damping breaks the premise.</strong> Symplectic methods are for <em>conservative</em>
          systems. Add friction or a drive and energy genuinely isn't conserved — there's nothing to preserve,
          and a good adaptive RK solver is the right tool again. Which is precisely the regime of the final
          card, where we switch the drive on and chase chaos.
        </p>
      </Deeper>
    </Card>
  );
};
const wrapPi = (a) => { let x = (a + Math.PI) % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return x - Math.PI; };

const PoincareScatter = ({ pts, width = 320, height = 240 }) => {
  const padL = 30, padR = 10, padT = 10, padB = 24;
  const ymax = Math.max(2.2, ...pts.map(p => Math.abs(p[1]))) * 1.05;
  const sx = (x) => padL + ((x + Math.PI) / (2 * Math.PI)) * (width - padL - padR);
  const sy = (y) => padT + (1 - (y + ymax) / (2 * ymax)) * (height - padT - padB);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <line x1={padL} y1={sy(0)} x2={width - padR} y2={sy(0)} stroke="rgba(255,255,255,0.16)" />
      <line x1={sx(0)} y1={padT} x2={sx(0)} y2={height - padB} stroke="rgba(255,255,255,0.16)" />
      <text x={width - padR} y={sy(0) - 3} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">θ</text>
      <text x={sx(0) + 4} y={padT + 8} fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace, monospace">ω</text>
      {pts.map((p, i) => <circle key={i} cx={sx(wrapPi(p[0]))} cy={sy(p[1])} r="1" fill="#f0abfc" opacity="0.8" />)}
    </svg>
  );
};

const ChaosCard = () => {
  const [A, setA] = useState(1.15);
  const P = { g: 1, L: 1, c: 0.5, Om: 2 / 3 };
  const result = useMemo(() => {
    const p = { ...P, A };
    const f = (s, t) => pendDeriv(s, p, t);
    const T = 2 * Math.PI / p.Om;
    const stepsPer = 120, h = T / stepsPer;
    // sensitive dependence: two starts 1e-3 apart, track unwrapped separation
    let a = [0.2, 0], b = [0.2 + 1e-3, 0], t = 0;
    const sep = []; const tDiv = 90; const Nd = Math.round(tDiv / h);
    for (let i = 0; i <= Nd; i++) {
      if (i % 4 === 0) sep.push([t, Math.log10(Math.max(1e-12, Math.hypot(a[0] - b[0], a[1] - b[1])))]);
      a = rk4Step(f, a, t, h); b = rk4Step(f, b, t, h); t += h;
    }
    // Poincaré section: strobe once per drive period after a transient
    let s = [0.2, 0]; t = 0;
    const transient = 40, collect = 320;
    const pts = [];
    for (let k = 0; k < transient + collect; k++) {
      for (let i = 0; i < stepsPer; i++) { s = rk4Step(f, s, t, h); t += h; }
      if (k >= transient) pts.push([s[0], s[1]]);
    }
    const finalSep = Math.pow(10, sep[sep.length - 1][1]);
    return { sep, pts, chaotic: finalSep > 0.2, finalSep };
  }, [A]);

  return (
    <Card id="chaos" icon={Wand2} title="The driven pendulum → chaos" accent="fuchsia" index={20} anchor
          subtitle="Gravity + damping + a periodic push = deterministic unpredictability">
      <Intuition>
        <p>
          Now switch on all three forces at once: the nonlinear restoring pull, friction, and a periodic
          push. The equation is still deterministic — no randomness anywhere — yet its solutions become{' '}
          <strong>unpredictable</strong>. Because the drive depends on the clock, the system is effectively{' '}
          <em>three-dimensional</em> <Eq>{'(\\theta,\\omega,t)'}</Eq>, and the{' '}
          <CrossLink to="limitcycle" recap="Poincaré–Bendixson forbids chaos in 2-D; you need a third dimension.">2-D no-chaos ceiling</CrossLink> lifts. This is the payoff the whole pendulum arc was building toward.
        </p>
      </Intuition>

      <Block>{'\\ddot{\\sol{\\theta}} + \\co{c}\\,\\dot{\\sol{\\theta}} + \\sin\\sol{\\theta} = \\co{A}\\cos(\\Omega t), \\qquad \\co{c}=0.5,\\ \\Omega=\\tfrac23'}</Block>
      <ReadEq>
        the same pendulum, now forced. Sweep the drive strength <Eq>{'\\co{A}'}</Eq> and the motion passes from
        tame periodic swinging through period-doublings into chaos.
      </ReadEq>

      <div className="my-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mb-2">
          drive amplitude A = <span className="text-fuchsia-300 tabular-nums">{A.toFixed(3)}</span>
          <input type="range" min="0.5" max="1.5" step="0.005" value={A} onChange={e => setA(parseFloat(e.target.value))} className="ode-range w-44" />
          <span className="font-mono" style={{ color: result.chaotic ? '#fb7185' : '#6ee7b7' }}>{result.chaotic ? 'CHAOTIC' : 'periodic'}</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">separation of two near-identical starts</div>
            <MultiLinePlot series={[{ pts: result.sep, color: '#fb7185', width: 1.8 }]}
              xRange={[0, 90]} yRange={[-4, 1]} yTicks={[-3, -1, 1]} xLabel="t" yLabel="Δ" height={200} legend={false} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Poincaré section (strobed once per drive cycle)</div>
            <PoincareScatter pts={result.pts} />
          </div>
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Two starts a <strong>thousandth of a radian</strong> apart: in the chaotic regime their separation climbs the log axis as a straight line — exponential divergence (a positive Lyapunov exponent). The strobe on the right shows a few dots for periodic motion, but a delicate fractal cloud — a <em>strange attractor</em> — once chaos sets in.</div>
      </div>

      <Predict question="The system is fully deterministic — same equation, no noise. So why can't we predict it far ahead?">
        <Term>Sensitive dependence</Term>: nearby states separate exponentially, so any uncertainty in the initial condition (and your float has ~16 digits) is amplified until prediction is worthless. Determinism guarantees the <em>next</em> instant, not the distant future. This is Lorenz's "butterfly effect" — and it lives in a single forced pendulum, not just the weather.
      </Predict>

      <MinSchema>
        a damped, <strong>driven</strong> pendulum is effectively 3-D, so it can be chaotic: deterministic yet
        unpredictable, with exponential <Term>sensitive dependence</Term>. The fingerprints are a positive
        Lyapunov exponent (diverging neighbors) and a fractal <Term>Poincaré section</Term> — a{' '}
        <Term>attractor</Term> that is neither a point nor a cycle.
      </MinSchema>

      <Misconception
        wrong={'"Chaos means the system is random or the model is incomplete."'}
        right={'Chaos is a property of simple deterministic equations. The unpredictability is real and intrinsic — it comes from exponential sensitivity, not from noise or missing physics.'}
        because={'The very same equation integrated from the very same state gives the very same trajectory. What fails is long-range prediction from imperfectly known initial data — a fundamental horizon, not a modeling gap.'}
      />

      <Deeper>
        <p>
          <strong>The route in: period-doubling.</strong> As <Eq>{'A'}</Eq> rises, a period-1 orbit becomes
          period-2, then period-4, 8, … in a cascade that accumulates (at a universal Feigenbaum rate) onto
          chaos — visible as the Poincaré dots splitting 1 → 2 → 4 before smearing into the cloud. Nudge{' '}
          <Eq>A</Eq> slowly through the interactive to catch the doublings; this is a{' '}
          <Term>bifurcation</Term> sequence, the same one the <CrossLink to="tracedet" recap="A parameter crossing a stability boundary changes the dynamics qualitatively.">trace–determinant</CrossLink> view anticipated.
        </p>
        <p>
          <strong>Why the Poincaré strobe is the right lens.</strong> The full trajectory is a tangle in 3-D{' '}
          <Eq>{'(\\theta,\\omega,t)'}</Eq>. Sampling once per drive period collapses time and reveals the
          attractor's hidden geometry — periodic motion lands on the same few points each cycle; chaos paints a
          self-similar fractal. It's the cleanest experimental signature of chaos, and it works on real lab
          pendulums too. From here the trail runs to nonlinear dynamics proper — Lorenz, strange attractors,
          and the <CrossLink to="trails" recap="Where ODEs lead next: PDEs, delay, stochastic, neural ODEs.">wider map</CrossLink>.
        </p>
      </Deeper>
    </Card>
  );
};
const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Next trails" accent="cyan" index={21}
        subtitle="One pendulum, three lenses — and where the road runs from here">
    <Intuition>
      <p>
        We met a single physical system — the pendulum — and read it three ways. <strong className="text-violet-300">Analytically</strong>:
        separable and linear equations, integrating factors, Laplace, the characteristic roots of the
        small-angle oscillator. <strong className="text-cyan-300">Geometrically</strong>: an ODE as a vector
        field, phase portraits, fixed points and the trace–determinant map, linearization, Lyapunov energy,
        limit cycles. <strong className="text-amber-300">Numerically</strong>: Euler, RK4, the stiffness and
        symplectic distinctions that decide which solver to trust. The same pendulum carried all of it, from a
        tidy sine wave to deterministic chaos.
      </p>
    </Intuition>

    <div className="grid md:grid-cols-3 gap-2 text-xs my-2">
      <div className="rounded-md border border-violet-400/25 bg-violet-400/5 px-3 py-2"><strong className="text-violet-200">analytical</strong><div className="text-neutral-400 mt-1">when the structure is special (linear, separable), a formula exists — and superposition + Laplace make it routine.</div></div>
      <div className="rounded-md border border-cyan-400/25 bg-cyan-400/5 px-3 py-2"><strong className="text-cyan-200">geometric</strong><div className="text-neutral-400 mt-1">when it isn't, the phase portrait still tells you fixed points, stability, and fate — no formula needed.</div></div>
      <div className="rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2"><strong className="text-amber-200">numerical</strong><div className="text-neutral-400 mt-1">and you can always march it forward — if you match the method (RK4 / implicit / symplectic) to the problem.</div></div>
    </div>

    <NextSteps groups={[
      { title: 'where ODEs lead', note: 'lift an assumption, get a new field', items: [
        { label: 'Partial differential equations (PDEs)', note: 'let the state vary in space too: heat, waves, diffusion. The vector field becomes an operator; method-of-lines turns a PDE back into a big system of ODEs.' },
        { label: 'Stochastic differential equations (SDEs)', note: 'add a noise term dW: dx = f dt + g dW. Euler becomes Euler–Maruyama; "solutions" become distributions. The bridge from determinism to probability.' },
        { label: 'Delay differential equations (DDEs)', note: 'let the rate depend on the past, ẋ(t)=f(x(t−τ)). The state is now a whole history — infinite-dimensional, and a fresh route to oscillation.' },
        { label: 'Neural ODEs', note: 'parameterize f with a neural network and learn it from data; backprop through an adaptive solver. Continuous-depth deep learning, built on exactly this machinery.' },
      ]},
      { title: 'in this sandbox', note: 'the natural sequel', items: [
        { label: '→ Control Theory', href: '#control-theory', note: "Now that you can read and steer a flow, learn to bend it: feedback, PID, LQR, Kalman, MPC. Its plant is our saddle — the cart-pole — linearized about upright." },
      ]},
      { title: 'what we skipped', note: 'honest gaps worth a follow-up', items: [
        { label: 'Boundary value problems & series solutions', note: 'data fixed at two ends (not one start): shooting, finite differences; power-series and Frobenius methods for variable coefficients.' },
        { label: 'Sturm–Liouville & special functions', note: 'eigenvalue problems for ODEs — Bessel, Legendre, Hermite — the bridge to PDE separation of variables.' },
        { label: 'Bifurcation theory proper', note: 'saddle-node, transcritical, pitchfork, Hopf; normal forms and the Feigenbaum cascade we only glimpsed on the chaos card.' },
        { label: 'Geometric & structure-preserving integration', note: 'beyond leapfrog: higher-order symplectic, variational integrators, methods that conserve momentum and other invariants.' },
      ]},
    ]} />

    <div className="mt-6 border-l-4 border-cyan-400/50 pl-4 py-1">
      <div className="flex items-center gap-2 mb-1"><Quote className="w-3.5 h-3.5 text-cyan-300" /><span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">carry this out the door</span></div>
      <p className="italic text-neutral-300">
        An ODE is a rule for change; a solution is the path that obeys it. When you can't write that path down,
        you can still see its shape and march it forward — and knowing <em>which</em> of those three moves to
        reach for is most of the skill.
      </p>
    </div>
  </Card>
);

// --- Footer -----------------------------------------------------------------

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono uppercase tracking-[0.18em] text-[10px]">
        <span className="text-cyan-300">Strogatz · Nonlinear Dynamics</span>
        <span className="text-violet-300">Hairer · Geometric Numerical Integration</span>
        <span className="text-amber-300">Press et al. · Numerical Recipes</span>
      </div>
      <p className="max-w-xl mx-auto">
        The pendulum is normalized to g = L = 1 so the natural frequency is ω₀ = 1 and
        the numbers stay clean. Trajectories are integrated live in the browser with the
        same RK4 / symplectic schemes the cards describe. Foundations layer beneath the
        sibling <em>Control Theory</em> explainer in this sandbox.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ========================================================================== */

export default function ODEsExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].ode-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].ode-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(196,181,253,0.4);
        }
        input[type=range].ode-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #c4b5fd; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <WhatIsCard />
        <FieldCard />
        <SeparableCard />
        <Linear1Card />
        <ExistCard />
        <SecondCard />
        <ResonanceCard />
        <LaplaceCard />
        <PhasePlaneCard />
        <EigenCard />
        <TraceDetCard />
        <LinearizeCard />
        <LyapunovCard />
        <LimitCycleCard />
        <EulerCard />
        <RK4Card />
        <StiffCard />
        <AdaptiveCard />
        <SymplecticCard />
        <ChaosCard />
        <TrailsCard />
      </main>

      <Footer />
    </div>
  );
}
