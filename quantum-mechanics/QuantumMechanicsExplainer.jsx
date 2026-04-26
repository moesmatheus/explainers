import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Atom, Waves, Eye, EyeOff, Sparkles, Target, Layers,
  Zap, Link2, GitBranch, HelpCircle, Dice5, Play, Pause,
  RotateCcw, ChevronDown, Gauge, Compass, Infinity as InfIcon,
  Orbit, ArrowRight, ChevronRight, FlaskConical, Film,
} from 'lucide-react';
import tunnelingVideo from './manim/quantum_tunneling.mp4';

/* ============================================================================
   Quantum Mechanics — an interactive explainer
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives (KaTeX with semantic color macros) --------------------

// NOTE: inside macro bodies, '#' must be doubled to '##' to escape it
// (KaTeX treats a single '#' as the start of a parameter reference like #1).
const KATEX_MACROS = {
  '\\op':    '\\textcolor{##c4b5fd}{#1}',                                // operators (violet-300)
  '\\ket':   '\\textcolor{##7dd3fc}{\\lvert #1 \\rangle}',               // kets (sky-300)
  '\\bra':   '\\textcolor{##7dd3fc}{\\langle #1 \\rvert}',               // bras (sky-300)
  '\\bk':    '\\textcolor{##7dd3fc}{\\langle #1 \\vert #2 \\rangle}',    // bra-ket inner product
  '\\co':    '\\textcolor{##f9a8d4}{#1}',                                // coefficients/amplitudes (pink-300)
  '\\const': '\\textcolor{##fcd34d}{#1}',                                // physical constants (amber-300)
  '\\hbarc': '\\textcolor{##fcd34d}{\\hbar}',                            // colored ℏ shorthand
};

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: 'html',
      strict: 'ignore',
      macros: KATEX_MACROS,
    });
  } catch (e) {
    return `<span style="color:#f87171">${tex}</span>`;
  }
};

const Eq = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), false), [children]);
  return <span className="eq-inline" dangerouslySetInnerHTML={{ __html: html }} />;
};

const KeyEq = ({ children, note }) => {
  const html = useMemo(() => renderTex(String(children), true), [children]);
  return (
    <div className="my-5 flex flex-col items-center gap-2">
      <div className="keq-display max-w-full overflow-x-auto text-sky-100 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-fuchsia-500/10 px-6 py-4 rounded-xl border border-sky-400/20 shadow-lg shadow-sky-500/5">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {note && <div className="text-xs text-neutral-500 text-center max-w-md">{note}</div>}
    </div>
  );
};

const Block = ({ children }) => {
  const html = useMemo(() => renderTex(String(children), true), [children]);
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky: { text: 'text-sky-400', border: 'border-sky-400/20', from: 'from-sky-500/15' },
  violet: { text: 'text-violet-400', border: 'border-violet-400/20', from: 'from-violet-500/15' },
  amber: { text: 'text-amber-400', border: 'border-amber-400/20', from: 'from-amber-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  rose: { text: 'text-rose-400', border: 'border-rose-400/20', from: 'from-rose-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm p-6 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`}
      />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">
        {children}
      </div>
    </motion.section>
  );
};

const Button = ({ children, onClick, icon: Icon, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/25 text-sky-100',
    ghost: 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200',
    danger: 'bg-rose-500/10 border-rose-400/20 hover:bg-rose-500/20 text-rose-200',
  }[variant];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${styles}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
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

// --- hero -------------------------------------------------------------------

const ParticleField = () => {
  const dots = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.6 + 0.4,
        d: Math.random() * 5 + 4,
        dy: Math.random() * 8 + 4,
      })),
    []
  );
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="dotGlow">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d) => (
        <motion.circle
          key={d.id}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="url(#dotGlow)"
          initial={{ opacity: 0.2 }}
          animate={{ cy: [d.y, (d.y + d.dy) % 100, d.y], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: d.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <ParticleField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Atom className="w-3.5 h-3.5" /> an interactive explainer
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-transparent">
          Quantum Mechanics
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          The rules reality follows when you zoom in far enough. Weird, beautiful, and — against all
          intuition — the most precisely tested theory in science.
        </p>
        <div className="mt-6 flex justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">| ψ ⟩ states</span>
          <span className="text-violet-300">Ĥ operators</span>
          <span className="text-amber-300">ℏ constants</span>
          <span className="text-pink-300">α coefficients</span>
        </div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-10 flex justify-center text-neutral-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// --- 1. wave-particle duality ----------------------------------------------

const WaveParticle = () => {
  const [t, setT] = useState(0.3);
  const w = 560, h = 140, mid = h / 2;
  const sigma = 140 * (1 - t) + 10 * t;
  const path = useMemo(() => {
    const pts = [];
    for (let x = 0; x <= w; x += 2) {
      const env = Math.exp(-Math.pow((x - w / 2) / sigma, 2));
      const y = mid + 42 * env * Math.sin((x / 18) * Math.PI);
      pts.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [sigma]);
  const label = t < 0.25 ? 'wave-like' : t > 0.75 ? 'particle-like' : 'wave packet';

  const broglieRows = [
    `\\text{electron, } 1\\,\\text{eV} \\quad\\to\\quad \\lambda \\approx 1.23\\,\\text{nm}`,
    `\\text{proton, } 1\\,\\text{eV} \\quad\\to\\quad \\lambda \\approx 0.029\\,\\text{nm}`,
    `\\mathrm{C}_{60}\\text{ fullerene, } 200\\,\\text{m/s} \\quad\\to\\quad \\lambda \\approx 2.8\\,\\text{pm}`,
    `\\text{baseball, } 1\\,\\text{m/s} \\quad\\to\\quad \\lambda \\approx 10^{-34}\\,\\text{m}`,
  ];

  return (
    <Card
      id="wave-particle"
      index={1}
      icon={Waves}
      title="Wave-Particle Duality"
      subtitle="A quantum object is neither a wave nor a particle — it's one thing that behaves like both, depending on what you ask it."
      accent="sky"
    >
      <p>
        Light that makes interference fringes on a screen also arrives one <em>photon</em> at a
        time. Electrons that leave dots in a detector also diffract around obstacles. Einstein's
        1905 explanation of the photoelectric effect forced photons on us; in 1924{' '}
        <em>de Broglie</em> proposed the inverse — that <em>every</em> particle carries a wave —
        and in 1927 Davisson and Germer saw electrons diffract off a nickel crystal, confirming it.
      </p>

      <KeyEq note="E — energy, p — momentum, h — Planck's constant, f — frequency, λ — wavelength">{
        `E = h\\,f, \\qquad \\lambda = \\frac{h}{p}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <line x1="0" y1={mid} x2={w} y2={mid} stroke="#ffffff10" />
          <motion.path d={path} fill="none" stroke="url(#wpGrad)" strokeWidth="2.5" strokeLinecap="round" transition={{ duration: 0.3 }} />
          <defs>
            <linearGradient id="wpGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="text-neutral-400 text-xs w-16">spread-out</span>
          <input type="range" min="0" max="1" step="0.01" value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="flex-1 accent-sky-400" />
          <span className="text-neutral-400 text-xs w-16 text-right">localized</span>
        </div>
        <div className="mt-1 text-center text-xs uppercase tracking-widest text-sky-300/80">{label}</div>
      </div>

      <p className="text-sm text-neutral-400">
        A pure wave has a definite wavelength but no location; a pure particle has a location
        but no wavelength. Real quantum objects live on the continuum in between — a{' '}
        <em>wave packet</em> built by summing plane waves over a range of momenta.
      </p>

      <Deeper>
        <p>
          For a photon, <Eq>{`E = h\\,f = \\dfrac{hc}{\\lambda}`}</Eq>. For a non-relativistic
          massive particle, <Eq>{`\\lambda = \\dfrac{h}{p}`}</Eq> with{' '}
          <Eq>{`p = \\sqrt{2\\,m\\,E_k}`}</Eq>. Wavelength shrinks with mass and energy — which
          is why classical objects <em>look</em> classical:
        </p>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-4 space-y-2">
          {broglieRows.map((tex, i) => (
            <div
              key={i}
              className="text-[14px] text-neutral-200"
              dangerouslySetInnerHTML={{ __html: renderTex(tex, false) }}
            />
          ))}
        </div>
        <p>
          A localized packet of mean momentum <Eq>{`p_0`}</Eq> moves with <em>group velocity</em>
        </p>
        <Block>{`v_g = \\frac{\\partial \\omega}{\\partial k} = \\frac{p_0}{m}`}</Block>
        <p>
          matching classical motion. Its <em>phase velocity</em>{' '}
          <Eq>{`v_p = \\omega / k`}</Eq> can differ; the envelope is what carries probability.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 2. double slit ---------------------------------------------------------

function sampleInterference() {
  const k = Math.PI / 10;
  const sigma = 38;
  for (let i = 0; i < 64; i++) {
    const y = (Math.random() - 0.5) * 160;
    const I = Math.pow(Math.cos(k * y), 2) * Math.exp(-(y * y) / (2 * sigma * sigma));
    if (Math.random() < I) return y;
  }
  return (Math.random() - 0.5) * 30;
}
function sampleTwoBands() {
  const c = Math.random() < 0.5 ? -30 : 30;
  const y = c + (Math.random() + Math.random() + Math.random() - 1.5) * 12;
  return y;
}

const DoubleSlit = () => {
  const [observed, setObserved] = useState(false);
  const [running, setRunning] = useState(true);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setDots((prev) => {
        const y = observed ? sampleTwoBands() : sampleInterference();
        const next = prev.length > 420 ? prev.slice(1) : prev.slice();
        next.push({ id: Math.random(), y });
        return next;
      });
    }, 55);
    return () => clearInterval(id);
  }, [observed, running]);

  const reset = () => setDots([]);

  const w = 600, h = 260, mid = h / 2;
  const screenX = 500, barrierX = 220;

  return (
    <Card
      id="double-slit"
      index={2}
      icon={Target}
      title="The Double-Slit Experiment"
      subtitle="One particle at a time — interference from nothing."
      accent="violet"
    >
      <p>
        Fire electrons one-by-one at two slits. Without a which-path detector, the dots accumulate
        into a striped <em>interference pattern</em> — as if each electron passed through both
        slits and interfered with itself. Switch on the detector and the stripes vanish: two plain
        bands, one per slit. The act of extracting <em>information</em> about the path is what
        destroys the interference.
      </p>

      <KeyEq note="the cross-term is the interference — measurement zeros it out">{
        `P(y) = \\bigl| \\,\\psi_1(y) + \\psi_2(y)\\,\\bigr|^2`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] font-mono">
          <span className="text-amber-300">● source</span>
          <span className="text-neutral-400">▌ slits</span>
          <span className={observed ? 'text-rose-300' : 'text-neutral-500'}>👁 detector</span>
          <span className="text-sky-300">▓ screen</span>
        </div>

        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <defs>
            <filter id="dotGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="barrierGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          <g>
            <motion.circle cx="40" cy={mid} r="14" fill="#fbbf24" fillOpacity="0.15" animate={{ r: [10, 22, 10], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <circle cx="40" cy={mid} r="6" fill="#fbbf24" filter="url(#dotGlowFilter)" />
            <text x="40" y={mid + 34} fontSize="10" textAnchor="middle" fill="#fcd34d" fontFamily="ui-monospace, monospace">source</text>
          </g>

          <line x1="46" y1={mid} x2={barrierX} y2={mid - 22} stroke="#fbbf2444" strokeDasharray="3 3" />
          <line x1="46" y1={mid} x2={barrierX} y2={mid + 22} stroke="#fbbf2444" strokeDasharray="3 3" />

          <rect x={barrierX} y="10" width="10" height={mid - 32} fill="url(#barrierGrad)" stroke="#475569" />
          <rect x={barrierX} y={mid - 6} width="10" height="12" fill="url(#barrierGrad)" stroke="#475569" />
          <rect x={barrierX} y={mid + 32} width="10" height={mid - 32 - 10} fill="url(#barrierGrad)" stroke="#475569" />
          <text x={barrierX + 5} y={24} fontSize="10" textAnchor="middle" fill="#94a3b8" fontFamily="ui-monospace, monospace">barrier</text>

          <AnimatePresence>
            {observed && (
              <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                <circle cx={barrierX - 18} cy={mid - 6} r="10" fill="#f43f5e22" stroke="#f43f5e" />
                <text x={barrierX - 18} y={mid - 2} fontSize="12" textAnchor="middle" fill="#fecdd3">👁</text>
                <circle cx={barrierX - 18} cy={mid + 6} r="10" fill="#f43f5e22" stroke="#f43f5e" />
                <text x={barrierX - 18} y={mid + 10} fontSize="12" textAnchor="middle" fill="#fecdd3">👁</text>
              </motion.g>
            )}
          </AnimatePresence>

          <g opacity="0.12">
            {Array.from({ length: 60 }).map((_, i) => {
              const y = -120 + i * 4;
              let I;
              if (observed) {
                I = Math.exp(-Math.pow((y - 30) / 15, 2)) + Math.exp(-Math.pow((y + 30) / 15, 2));
              } else {
                I = Math.pow(Math.cos((Math.PI / 10) * y), 2) * Math.exp(-(y * y) / (2 * 38 * 38));
              }
              return (
                <rect key={i} x={screenX + 6} y={mid + y} width={Math.max(2, I * 80)} height="3.2" fill={observed ? '#f43f5e' : '#38bdf8'} />
              );
            })}
          </g>

          <rect x={screenX} y="10" width="5" height={h - 20} fill="#1e293b" stroke="#334155" />
          <text x={screenX + 14} y="22" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">screen</text>

          {dots.map((d) => (
            <motion.circle
              key={d.id}
              cx={screenX + 3}
              cy={mid + d.y}
              r="1.8"
              fill={observed ? '#f43f5e' : '#38bdf8'}
              filter="url(#dotGlowFilter)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </svg>

        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <Button
            onClick={() => {
              setObserved((o) => !o);
              setDots([]);
            }}
            icon={observed ? EyeOff : Eye}
            variant={observed ? 'danger' : 'ghost'}
          >
            {observed ? 'detector ON — bands' : 'detector OFF — fringes'}
          </Button>
          <Button onClick={() => setRunning((r) => !r)} icon={running ? Pause : Play} variant="ghost">
            {running ? 'pause' : 'resume'}
          </Button>
          <Button onClick={reset} icon={RotateCcw} variant="ghost">reset</Button>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Richard Feynman called this experiment "the only mystery" of quantum mechanics. Every
        strange feature — superposition, measurement, contextuality — is present here.
      </p>

      <Deeper>
        <p>
          For slit separation <Eq>d</Eq>, slit width <Eq>a</Eq>, and slits-to-screen distance{' '}
          <Eq>L</Eq>, the far-field intensity factors into <em>interference</em> (fringes from the
          two slits) times <em>diffraction</em> (envelope from each slit):
        </p>
        <Block>{
          `I(y) \\;\\propto\\; \\cos^2\\!\\left(\\frac{\\pi d y}{\\lambda L}\\right) \\cdot \\operatorname{sinc}^2\\!\\left(\\frac{\\pi a y}{\\lambda L}\\right)`
        }</Block>
        <p>
          Maxima sit where paths differ by an integer number of wavelengths; the fringe spacing on
          the screen is set by <Eq>{`\\lambda`}</Eq>, <Eq>L</Eq>, and <Eq>d</Eq>:
        </p>
        <Block>{
          `d\\,\\sin\\theta = m\\,\\lambda \\qquad \\Delta y = \\frac{\\lambda L}{d}`
        }</Block>
        <p>
          Pattern contrast is captured by the <em>visibility</em>:
        </p>
        <Block>{
          `\\mathcal{V} = \\frac{I_{\\max} - I_{\\min}}{I_{\\max} + I_{\\min}}`
        }</Block>
        <p>
          Full visibility (<Eq>{`\\mathcal{V}=1`}</Eq>) when path information is absent; it drops
          to zero as a detector learns which slit. A <em>quantum eraser</em> can restore the
          fringes by destroying that information after the fact.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 3. superposition -------------------------------------------------------

const Superposition = () => {
  const [alphaSq, setAlphaSq] = useState(0.6);
  const betaSq = 1 - alphaSq;
  const alpha = Math.sqrt(alphaSq);
  const beta = Math.sqrt(betaSq);
  return (
    <Card
      id="superposition"
      index={3}
      icon={Layers}
      title="Superposition"
      subtitle="Until measured, a quantum system is in all its compatible configurations at once — with complex weights that can interfere."
      accent="fuchsia"
    >
      <p>
        A qubit — the simplest quantum system — can be in state <Eq>{`\\ket{0}`}</Eq>, state{' '}
        <Eq>{`\\ket{1}`}</Eq>, or <em>any complex combination</em> of the two. The weights{' '}
        <Eq>{`\\co{\\alpha}`}</Eq> and <Eq>{`\\co{\\beta}`}</Eq> are <em>probability
        amplitudes</em>; their squared moduli give the probability of each outcome.
      </p>

      <KeyEq note="normalization: |α|² + |β|² = 1">{
        `\\ket{\\psi} = \\co{\\alpha}\\ket{0} + \\co{\\beta}\\ket{1}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-neutral-500 font-mono">|0⟩</div>
            <div className="w-full h-32 bg-white/5 rounded-lg overflow-hidden flex items-end border border-white/10">
              <motion.div className="w-full bg-gradient-to-t from-sky-500 to-sky-300" animate={{ height: `${alphaSq * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} />
            </div>
            <div className="text-sky-300 font-mono text-sm">{(alphaSq * 100).toFixed(0)}%</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-neutral-500 font-mono">|1⟩</div>
            <div className="w-full h-32 bg-white/5 rounded-lg overflow-hidden flex items-end border border-white/10">
              <motion.div className="w-full bg-gradient-to-t from-fuchsia-500 to-fuchsia-300" animate={{ height: `${betaSq * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} />
            </div>
            <div className="text-fuchsia-300 font-mono text-sm">{(betaSq * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="mt-5">
          <input type="range" min="0" max="1" step="0.01" value={alphaSq} onChange={(e) => setAlphaSq(parseFloat(e.target.value))} className="w-full accent-fuchsia-400" />
          <div className="mt-2 text-center text-xs font-mono text-neutral-400">
            α ≈ {alpha.toFixed(2)} &nbsp;·&nbsp; β ≈ {beta.toFixed(2)} &nbsp;·&nbsp;
            α² + β² = {(alphaSq + betaSq).toFixed(2)}
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Superposition is <em>not</em> "we don't know which state". The amplitudes themselves
        interfere — that's why the double-slit pattern exists. A classical probabilistic mixture
        can never do that.
      </p>

      <Deeper>
        <p>
          A general pure qubit state lives on the <em>Bloch sphere</em>:
        </p>
        <Block>{
          `\\ket{\\psi} = \\cos\\!\\frac{\\theta}{2}\\,\\ket{0} \\;+\\; e^{i\\varphi}\\sin\\!\\frac{\\theta}{2}\\,\\ket{1}`
        }</Block>
        <p>
          The <em>global</em> phase <Eq>{`e^{i\\delta}\\ket{\\psi}`}</Eq> has no observable
          effect — every prediction agrees with <Eq>{`\\ket{\\psi}`}</Eq>. The <em>relative</em>{' '}
          phase <Eq>{`\\varphi`}</Eq> between <Eq>{`\\ket{0}`}</Eq> and <Eq>{`\\ket{1}`}</Eq>{' '}
          absolutely matters: it shifts interference patterns. Superposition is also basis-dependent.
          The X-basis <Eq>{`\\{\\ket{+},\\ket{-}\\}`}</Eq> is built from
        </p>
        <Block>{
          `\\ket{+} = \\frac{\\ket{0} + \\ket{1}}{\\sqrt{2}} \\qquad \\ket{-} = \\frac{\\ket{0} - \\ket{1}}{\\sqrt{2}}`
        }</Block>
        <p>
          and a state that is "definite" in the Z-basis is "superposed" in the X-basis — and
          vice versa.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 4. schrödinger equation -----------------------------------------------

const SchrodingerEq = () => {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    let raf;
    const tick = () => {
      setPhase((p) => (p + 0.05) % (Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const w = 560, h = 140, mid = h / 2;
  const makePath = (shift) => {
    const pts = [];
    for (let x = 0; x <= w; x += 2) {
      const y = mid + 42 * Math.sin((x / 38) * Math.PI - phase + shift);
      pts.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <Card
      id="schrodinger"
      index={4}
      icon={InfIcon}
      title="The Schrödinger Equation"
      subtitle="The central equation of non-relativistic quantum mechanics — it tells the wavefunction how to evolve."
      accent="sky"
    >
      <p>
        The wavefunction <Eq>{`\\psi(x,t)`}</Eq> encodes everything knowable about a system. It is
        complex-valued; its squared magnitude <Eq>{`|\\psi|^2`}</Eq> gives the probability density
        of finding the particle at position <Eq>x</Eq>. Between measurements, evolution is
        perfectly deterministic and reversible — randomness only enters at measurement.
      </p>

      <KeyEq note="ℏ — reduced Planck constant, Ĥ — Hamiltonian (total-energy operator)">{
        `i\\,\\hbar\\,\\frac{\\partial}{\\partial t}\\,\\ket{\\psi(t)} \\;=\\; \\op{\\hat{H}}\\,\\ket{\\psi(t)}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <line x1="0" y1={mid} x2={w} y2={mid} stroke="#ffffff10" />
          <path d={makePath(Math.PI / 2)} fill="none" stroke="#c084fc99" strokeWidth="1.8" />
          <path d={makePath(0)} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        </svg>
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-4 font-mono">
            <span className="text-sky-300">— Re(ψ)</span>
            <span className="text-fuchsia-300">— Im(ψ)</span>
          </div>
          <Button onClick={() => setPaused((p) => !p)} icon={paused ? Play : Pause} variant="ghost">
            {paused ? 'play' : 'pause'}
          </Button>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        The real and imaginary parts dance π/2 out of phase. For a free particle, the solution is
        a plane wave <Eq>{`\\psi = e^{i(kx - \\omega t)}`}</Eq> — pure rotation in the complex
        plane.
      </p>

      <Deeper>
        <p>
          For a single non-relativistic particle in a potential <Eq>{`V(\\mathbf{r})`}</Eq>, the
          Hamiltonian splits into kinetic and potential parts:
        </p>
        <Block>{
          `\\op{\\hat{H}} = \\op{\\hat{T}} + \\op{\\hat{V}} = -\\frac{\\hbar^{2}}{2m}\\,\\nabla^{2} + V(\\mathbf{r})`
        }</Block>
        <p>
          When <Eq>{`\\op{\\hat{H}}`}</Eq> doesn't depend on time, separation of variables gives
          the <em>time-independent</em> form — an eigenvalue problem whose solutions are the
          allowed energies, evolving by a pure phase:
        </p>
        <Block>{
          `\\op{\\hat{H}}\\,\\ket{\\psi_n} = E_{n}\\,\\ket{\\psi_n} \\qquad \\ket{\\psi(t)} = \\sum_{n} c_{n}\\,e^{-i E_{n} t / \\hbar}\\,\\ket{\\psi_n}`
        }</Block>
        <p>
          Eigenstates of <Eq>{`\\op{\\hat{H}}`}</Eq> (<em>stationary states</em>) have static
          probability densities. Probability is locally conserved by the <em>continuity equation</em>:
        </p>
        <Block>{
          `\\frac{\\partial |\\psi|^{2}}{\\partial t} + \\nabla\\!\\cdot\\!\\mathbf{j} = 0, \\qquad \\mathbf{j} = \\frac{\\hbar}{2 m i}\\bigl(\\psi^{*}\\nabla\\psi - \\psi\\,\\nabla\\psi^{*}\\bigr)`
        }</Block>
      </Deeper>
    </Card>
  );
};

// --- 5. measurement & collapse ---------------------------------------------

const Measurement = () => {
  const [state, setState] = useState(null);
  const [count, setCount] = useState({ 0: 0, 1: 0 });

  const measure = () => {
    const outcome = Math.random() < 0.5 ? 0 : 1;
    setState(outcome);
    setCount((c) => ({ ...c, [outcome]: c[outcome] + 1 }));
  };
  const reset = () => {
    setState(null);
    setCount({ 0: 0, 1: 0 });
  };

  return (
    <Card
      id="measurement"
      index={5}
      icon={Eye}
      title="Measurement & Collapse"
      subtitle="Observing a quantum system changes it. The smooth wavefunction jumps to one outcome, weighted by Born's rule."
      accent="amber"
    >
      <p>
        Before measurement, the system is in a superposition. The <em>Born rule</em> says the
        probability of outcome <Eq>k</Eq> is the squared amplitude of the projection onto the
        corresponding eigenstate. Once measured, the wavefunction "collapses" into that eigenstate
        — repeat the same measurement and you'll get the same answer.
      </p>

      <KeyEq note="Born's rule — connects amplitudes to observable probabilities">{
        `P(k) \\;=\\; \\bigl| \\,\\bk{k}{\\psi}\\, \\bigr|^{2}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5 flex flex-col items-center gap-5">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === null ? (
              <motion.div
                key="super"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div className="absolute inset-0 rounded-full bg-sky-500/30 blur-2xl" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute inset-0 rounded-full bg-fuchsia-500/30 blur-2xl" animate={{ scale: [1.1, 0.9, 1.1] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="relative font-mono text-sm text-neutral-200 bg-black/50 px-3 py-1.5 rounded border border-white/10">
                  α |0⟩ + β |1⟩
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`out-${state}-${count[0] + count[1]}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                className={`relative w-28 h-28 rounded-2xl flex items-center justify-center font-mono text-3xl border-2 ${
                  state === 0 ? 'border-sky-400 bg-sky-500/15 text-sky-200' : 'border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-200'
                }`}
              >
                |{state}⟩
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <Button onClick={measure} icon={Dice5} variant="primary">measure</Button>
          <Button onClick={reset} icon={RotateCcw} variant="ghost">reset</Button>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 text-sm font-mono">
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-200 text-center">|0⟩ — {count[0]}×</div>
          <div className="p-3 rounded-lg bg-fuchsia-500/10 border border-fuchsia-400/20 text-fuchsia-200 text-center">|1⟩ — {count[1]}×</div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Run many trials and the histogram approaches <Eq>{`|\\co{\\alpha}|^{2}`}</Eq> vs{' '}
        <Eq>{`|\\co{\\beta}|^{2}`}</Eq>. Measurement is the only inherently random thing in the
        theory — between measurements, Schrödinger runs on pure rails.
      </p>

      <Deeper>
        <p>
          An observable is a Hermitian operator{' '}
          <Eq>{`\\op{\\hat{A}} = \\sum_{k} a_{k}\\,\\ket{k}\\bra{k}`}</Eq>. Measurement returns one
          of its eigenvalues <Eq>{`a_k`}</Eq> with probability <Eq>{`|\\bk{k}{\\psi}|^{2}`}</Eq>,
          and the state projects according to the <em>projection postulate</em>:
        </p>
        <Block>{
          `\\ket{\\psi} \\;\\longrightarrow\\; \\frac{\\op{\\hat{P}}_{k}\\,\\ket{\\psi}}{\\bigl\\lVert \\op{\\hat{P}}_{k}\\,\\ket{\\psi}\\bigr\\rVert}, \\qquad \\op{\\hat{P}}_{k} = \\ket{k}\\!\\bra{k}`
        }</Block>
        <p>
          Statistics over repeated trials give the expectation value and variance:
        </p>
        <Block>{
          `\\langle \\op{\\hat{A}} \\rangle = \\bra{\\psi}\\,\\op{\\hat{A}}\\,\\ket{\\psi} = \\sum_{k} a_{k}\\,P(k), \\qquad \\sigma_{A}^{2} = \\langle \\op{\\hat{A}}^{2}\\rangle - \\langle \\op{\\hat{A}}\\rangle^{2}`
        }</Block>
        <p>
          Modern accounts replace sharp "collapse" with <em>decoherence</em>: environmental
          entanglement drives off-diagonal elements of the reduced density matrix to zero
          exponentially fast, leaving what looks like a classical mixture of outcomes.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 6. heisenberg uncertainty ---------------------------------------------

const Uncertainty = () => {
  const [sigmaX, setSigmaX] = useState(26);
  const C = 720;
  const sigmaP = C / sigmaX;
  const w = 260, h = 120, mid = h / 2;

  const gaussPath = (sigma) => {
    const pts = [];
    for (let x = 0; x <= w; x += 2) {
      const dx = (x - w / 2) / sigma;
      const y = mid + 60 - 80 * Math.exp(-dx * dx / 2);
      pts.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <Card
      id="uncertainty"
      index={6}
      icon={Gauge}
      title="Heisenberg Uncertainty"
      subtitle="You cannot sharpen position and momentum at the same time. The trade-off is written into the wavefunction itself."
      accent="emerald"
    >
      <p>
        Position and momentum are <em>Fourier duals</em>. A wavefunction narrow in space is
        necessarily built from a wide range of wavelengths — and so a wide range of momenta.
        Squeeze one; the other blows up. This is a statement about waves, not about clumsy
        instruments.
      </p>

      <KeyEq note="Δx — standard deviation of position, Δp — of momentum">{
        `\\Delta x \\,\\cdot\\, \\Delta p \\;\\geq\\; \\frac{\\hbar}{2}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-neutral-500 mb-1 uppercase tracking-widest">position ψ(x)</div>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto bg-white/[0.02] rounded-md border border-white/5">
              <motion.path d={gaussPath(sigmaX)} fill="none" stroke="#34d399" strokeWidth="2.2" />
            </svg>
            <div className="mt-1 text-xs text-center text-emerald-300 font-mono">Δx ≈ {sigmaX.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1 uppercase tracking-widest">momentum φ(p)</div>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto bg-white/[0.02] rounded-md border border-white/5">
              <motion.path d={gaussPath(sigmaP)} fill="none" stroke="#fb923c" strokeWidth="2.2" />
            </svg>
            <div className="mt-1 text-xs text-center text-orange-300 font-mono">Δp ≈ {sigmaP.toFixed(0)}</div>
          </div>
        </div>

        <div className="mt-5">
          <input type="range" min="8" max="90" step="1" value={sigmaX} onChange={(e) => setSigmaX(parseFloat(e.target.value))} className="w-full accent-emerald-400" />
          <div className="mt-1 text-center text-xs text-neutral-400 font-mono">
            Δx · Δp ≈ {(sigmaX * sigmaP).toFixed(0)} &nbsp;(never below ≈ {C})
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        This isn't about disturbing the particle with light. It's about what "having a definite
        position and momentum" even <em>means</em> for a wave.
      </p>

      <Deeper>
        <p>
          The bound comes from a deeper algebraic fact — the canonical commutator:
        </p>
        <Block>{
          `[\\,\\op{\\hat{x}}, \\op{\\hat{p}}\\,] \\;=\\; \\op{\\hat{x}}\\op{\\hat{p}} - \\op{\\hat{p}}\\op{\\hat{x}} \\;=\\; i\\,\\hbar`
        }</Block>
        <p>
          The Robertson–Schrödinger relation generalizes the principle to any pair of observables:
        </p>
        <Block>{
          `\\sigma_{A}\\,\\sigma_{B} \\;\\geq\\; \\frac{1}{2}\\,\\bigl|\\langle\\,[\\op{\\hat{A}},\\op{\\hat{B}}]\\,\\rangle\\bigr|`
        }</Block>
        <p>
          Gaussian wave packets saturate the bound — they are minimum-uncertainty states. The
          energy-time relation <Eq>{`\\Delta E \\,\\Delta t \\geq \\hbar/2`}</Eq> looks similar
          but is a different beast: time is a parameter, not an operator, so{' '}
          <Eq>{`\\Delta t`}</Eq> is a characteristic timescale of change, not a standard deviation.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 7. quantization -------------------------------------------------------

const Quantization = () => {
  const levels = [1, 2, 3, 4, 5].map((n) => ({ n, E: -13.6 / (n * n) }));
  const [excited, setExcited] = useState(3);
  const [photon, setPhoton] = useState(null);

  const emit = (fromN, toN = 1) => {
    const key = Math.random();
    setExcited(toN);
    setPhoton({ fromN, toN, key });
    setTimeout(() => setPhoton(null), 1200);
    setTimeout(() => setExcited(fromN), 1600);
  };

  const w = 560, h = 260, pad = 40;
  const E_min = -13.6, E_max = 0;
  const yOf = (E) => pad + ((E - E_max) / (E_min - E_max)) * (h - 2 * pad);

  return (
    <Card
      id="quantization"
      index={7}
      icon={Orbit}
      title="Quantization"
      subtitle="Bound systems have discrete energy levels. Electrons jump; they don't slide."
      accent="violet"
    >
      <p>
        A free electron can have any energy. Trap it in an atom and only certain standing-wave
        patterns fit the boundary — so only certain energies are allowed. Transitions between
        levels absorb or emit photons of exactly the right frequency. This is why every element
        has its own fingerprint of spectral lines.
      </p>

      <KeyEq note="hydrogen bound-state energies — n = 1, 2, 3, ...">{
        `E_{n} \\;=\\; -\\,\\frac{13.6\\;\\text{eV}}{n^{2}}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`-24 0 ${w + 150} ${h}`} className="w-full h-auto">
          <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#ffffff20" />
          <text x={pad - 8} y={pad + 4} fontSize="10" fill="#94a3b8" textAnchor="end">0</text>
          <text x={pad - 8} y={h - pad + 4} fontSize="10" fill="#94a3b8" textAnchor="end">−13.6 eV</text>
          {(() => {
            // Labels for levels near E=0 can collide — stagger them downward with leader lines.
            const minGap = 14;
            const entries = levels.map(({ n, E }) => ({ n, E, y: yOf(E) }));
            const sorted = [...entries].sort((a, b) => a.y - b.y);
            const labelYByN = {};
            let prev = -Infinity;
            sorted.forEach((e) => {
              const ly = Math.max(e.y, prev + minGap);
              labelYByN[e.n] = ly;
              prev = ly;
            });
            return entries.map(({ n, E, y }) => {
              const active = excited === n;
              const labelY = labelYByN[n];
              const labelX = w - pad + 12;
              return (
                <g key={n} onClick={() => emit(n, Math.max(1, n - 1))} style={{ cursor: 'pointer' }}>
                  <line x1={pad} y1={y} x2={w - pad} y2={y} stroke={active ? '#c084fc' : '#475569'} strokeWidth={active ? 2.5 : 1.5} />
                  {labelY !== y && (
                    <line x1={w - pad} y1={y} x2={labelX - 4} y2={labelY} stroke={active ? '#c084fc80' : '#47556980'} strokeWidth="0.8" />
                  )}
                  <text x={labelX} y={labelY + 3} fontSize="11" fill={active ? '#e9d5ff' : '#94a3b8'} fontFamily="ui-monospace, monospace">
                    n={n} · {E.toFixed(2)} eV
                  </text>
                  {active && (
                    <motion.circle cx={pad + 40} cy={y} r="5" fill="#c084fc" animate={{ cx: [pad + 40, w - pad - 80, pad + 40] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
                  )}
                </g>
              );
            });
          })()}
          <AnimatePresence>
            {photon && (() => {
              const y1 = yOf(-13.6 / (photon.fromN * photon.fromN));
              const y2 = yOf(-13.6 / (photon.toN * photon.toN));
              return (
                <motion.g key={photon.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.line x1={pad + 40} x2={pad + 40} y1={y1} y2={y1} stroke="#fbbf24" strokeWidth="2" animate={{ y2: y2 }} transition={{ duration: 0.4 }} />
                  <motion.circle cx={pad + 40} cy={(y1 + y2) / 2} r="3" fill="#fbbf24" initial={{ cx: pad + 40, opacity: 1 }} animate={{ cx: w - pad, opacity: 0 }} transition={{ duration: 1.1, delay: 0.3 }} />
                </motion.g>
              );
            })()}
          </AnimatePresence>
        </svg>
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {levels.slice(1).map(({ n }) => (
            <Button key={n} onClick={() => emit(n, n - 1)} variant="ghost">{n} → {n - 1}</Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Click a transition. The drop in energy leaves as a photon with frequency{' '}
        <Eq>{`f = (E_{i} - E_{f})/h`}</Eq>. Hydrogen's Balmer series (transitions ending at{' '}
        <Eq>{`n = 2`}</Eq>) is why you can pick out its lines from across the galaxy.
      </p>

      <Deeper>
        <p>
          For hydrogen, the <em>Rydberg formula</em> (empirically found before QM existed, later
          derived from the Schrödinger equation):
        </p>
        <Block>{
          `\\frac{1}{\\lambda} \\;=\\; R_{\\infty}\\!\\left(\\,\\frac{1}{n_{f}^{2}} - \\frac{1}{n_{i}^{2}}\\,\\right), \\qquad R_{\\infty} \\approx 1.097\\times 10^{7}\\;\\text{m}^{-1}`
        }</Block>
        <p>
          Other canonical bound systems have other ladders — a particle in an infinite square well,
          and a harmonic oscillator:
        </p>
        <Block>{
          `E_{n}^{\\,\\text{box}} = \\frac{n^{2}\\pi^{2}\\hbar^{2}}{2 m L^{2}} \\qquad E_{n}^{\\,\\text{SHO}} = \\hbar\\,\\omega\\!\\left(n + \\tfrac{1}{2}\\right)`
        }</Block>
        <p>
          The <Eq>n=0</Eq> oscillator energy is nonzero — the <em>zero-point energy</em>. Bound
          electrons are labeled by four quantum numbers: principal <Eq>n</Eq>, orbital{' '}
          <Eq>{`\\ell`}</Eq>, magnetic <Eq>{`m_{\\ell}`}</Eq>, spin <Eq>{`m_{s}`}</Eq>. The Pauli
          exclusion principle forbids two identical fermions from sharing all four — which is why
          atoms have shells and chemistry exists.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 8. quantum tunneling --------------------------------------------------

const Tunneling = () => {
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  useEffect(() => {
    if (paused) return;
    let raf;
    const tick = () => {
      setT((v) => (v + 0.004 * speed) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed]);

  const w = 560, h = 180, mid = h / 2;
  const barrierX = 280, barrierW = 50;
  const incomingX = 60 + t * (barrierX - 60);
  const reflectedX = t > 0.33 ? barrierX - (t - 0.33) * 380 : barrierX;
  const transmittedX = t > 0.33 ? barrierX + barrierW + (t - 0.33) * 300 : barrierX + barrierW;

  const gauss = (cx, amp = 1) => {
    const pts = [];
    for (let x = 0; x <= w; x += 2) {
      const dx = (x - cx) / 22;
      const y = mid - 40 * amp * Math.exp(-dx * dx) * Math.cos(dx * 2.2);
      pts.push(`${x === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <Card
      id="tunneling"
      index={8}
      icon={ArrowRight}
      title="Quantum Tunneling"
      subtitle="Wavefunctions leak. A particle can cross a barrier it doesn't have the energy to climb over."
      accent="sky"
    >
      <p>
        Classically, a ball without enough energy to reach the top of a hill bounces back.
        Quantum-mechanically, the wavefunction penetrates into the forbidden region and decays
        exponentially — but a small amplitude can emerge on the other side, making{' '}
        <em>transmission through a wall</em> a real, measurable phenomenon.
      </p>

      <KeyEq note="thin-barrier approximation — κ depends on how 'underenergized' the particle is">{
        `T \\;\\approx\\; e^{-\\,2\\,\\kappa\\,L}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <rect x={barrierX} y={mid - 70} width={barrierW} height="140" fill="#c084fc15" stroke="#c084fc55" />
          <text x={barrierX + barrierW / 2} y={mid - 78} fontSize="10" textAnchor="middle" fill="#c084fc">barrier (V &gt; E)</text>
          <path
            d={(() => {
              const pts = [];
              for (let x = barrierX; x <= barrierX + barrierW; x += 2) {
                const decay = Math.exp(-(x - barrierX) / 15);
                const y = mid - 22 * decay * Math.cos((x - barrierX) / 3);
                pts.push(`${x === barrierX ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`);
              }
              return pts.join(' ');
            })()}
            fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 2" opacity={t > 0.3 ? 1 : 0.3}
          />
          {t < 0.35 && <path d={gauss(incomingX)} fill="none" stroke="#38bdf8" strokeWidth="2" />}
          {t > 0.33 && <path d={gauss(reflectedX, 0.75)} fill="none" stroke="#38bdf8" strokeWidth="2" />}
          {t > 0.33 && <path d={gauss(transmittedX, 0.22)} fill="none" stroke="#22d3ee" strokeWidth="2" />}
          <line x1="0" y1={mid + 50} x2={w} y2={mid + 50} stroke="#ffffff10" />
        </svg>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            <span className="text-sky-300">incoming/reflected</span> &nbsp;·&nbsp;
            <span className="text-cyan-300">transmitted (tunneled)</span>
          </div>
          <Button onClick={() => setPaused((p) => !p)} icon={paused ? Play : Pause} variant="ghost">
            {paused ? 'play' : 'pause'}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="text-neutral-400 text-xs w-12">slow</span>
          <input type="range" min="0.1" max="2" step="0.05" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="flex-1 accent-sky-400" />
          <span className="text-neutral-400 text-xs w-12 text-right">fast</span>
          <span className="text-sky-300 font-mono text-xs tabular-nums w-12 text-right">{speed.toFixed(2)}×</span>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Exactly how the sun shines: proton-proton fusion in its core requires tunneling through
        Coulomb repulsion. Also how flash memory is written, how scanning tunneling microscopes
        image single atoms, and how α-particles escape nuclei.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden">
        <div className="px-4 py-2 flex items-center gap-2 border-b border-white/10 text-xs">
          <Film className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-neutral-300 font-medium">Time-evolved Schrödinger solution</span>
          <span className="text-neutral-500">— split-step Fourier, ℏ = m = 1, rendered with Manim</span>
        </div>
        <video
          src={tunnelingVideo}
          autoPlay
          loop
          muted
          playsInline
          controls
          className="w-full block"
        />
      </div>

      <Deeper>
        <p>
          Inside the barrier, <Eq>{`\\psi \\propto e^{-\\kappa x}`}</Eq> with decay constant
        </p>
        <Block>{
          `\\kappa \\;=\\; \\frac{\\sqrt{\\,2\\,m\\,(V_{0} - E)\\,}}{\\hbar}`
        }</Block>
        <p>
          For a rectangular barrier of height <Eq>{`V_{0}`}</Eq> and width <Eq>L</Eq>, matching
          conditions yield the exact transmission coefficient:
        </p>
        <Block>{
          `T \\;=\\; \\dfrac{1}{\\,1 + \\dfrac{V_{0}^{\\,2}\\,\\sinh^{2}(\\kappa L)}{4\\,E\\,(V_{0}-E)}\\,}`
        }</Block>
        <p>
          For a smooth barrier, the WKB approximation integrates <Eq>{`\\kappa(x)`}</Eq> through
          the classically forbidden region:
        </p>
        <Block>{
          `T \\;\\approx\\; \\exp\\!\\left(-\\,2 \\int_{a}^{b} \\kappa(x)\\, dx\\right)`
        }</Block>
        <p>
          Gamow's 1928 application to α-decay gave the first quantitative QM prediction of nuclear
          lifetimes — and explained why some isotopes live nanoseconds while others outlast the
          age of the universe.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 9. spin ---------------------------------------------------------------

const Spin = () => {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 1600);
    return () => clearInterval(id);
  }, []);

  const w = 560, h = 200, mid = h / 2;
  return (
    <Card
      id="spin"
      index={9}
      icon={Compass}
      title="Spin"
      subtitle="Intrinsic angular momentum that isn't about anything actually spinning. Quantized by nature."
      accent="rose"
    >
      <p>
        Particles carry an intrinsic angular momentum called <em>spin</em>. Electrons, protons,
        neutrons, and neutrinos are all <em>spin-½</em>: along any axis, a measurement yields
        exactly two possible values, <Eq>{`+\\hbar/2`}</Eq> or <Eq>{`-\\hbar/2`}</Eq> — never
        a continuum. The 1922 Stern-Gerlach experiment found this while trying to measure the
        (classical) magnetic moment of silver atoms.
      </p>

      <KeyEq note="measurement along any axis — here the z-axis">{
        `S_{z} \\;=\\; \\pm\\,\\frac{\\hbar}{2}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <rect x="20" y={mid - 12} width="40" height="24" rx="3" fill="#1f2937" stroke="#475569" />
          <text x="40" y={mid + 40} fontSize="10" textAnchor="middle" fill="#94a3b8">oven</text>
          <rect x="220" y={mid - 40} width="100" height="80" fill="none" stroke="#f43f5e55" strokeDasharray="4 3" />
          <text x="270" y={mid - 48} fontSize="10" textAnchor="middle" fill="#fda4af">inhomogeneous B</text>
          <g fontFamily="ui-monospace, monospace" fontSize="12">
            <rect x={w - 60} y={mid - 70} width="50" height="26" rx="3" fill="#0c4a6e33" stroke="#38bdf8" />
            <text x={w - 35} y={mid - 52} textAnchor="middle" fill="#bae6fd">+ℏ/2</text>
            <rect x={w - 60} y={mid + 44} width="50" height="26" rx="3" fill="#7f1d1d33" stroke="#f43f5e" />
            <text x={w - 35} y={mid + 62} textAnchor="middle" fill="#fecaca">−ℏ/2</text>
          </g>
          {Array.from({ length: 8 }).map((_, i) => {
            const up = (pulse + i) % 2 === 0;
            const delay = (i * 0.18) % 2;
            return (
              <motion.g key={`${pulse}-${i}`}>
                <motion.circle
                  r="3.5"
                  fill={up ? '#38bdf8' : '#f43f5e'}
                  initial={{ cx: 60, cy: mid, opacity: 0 }}
                  animate={{
                    cx: [60, 220, 320, w - 60],
                    cy: [mid, mid, up ? mid - 30 : mid + 30, up ? mid - 56 : mid + 56],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'linear' }}
                />
              </motion.g>
            );
          })}
        </svg>
        <div className="text-center text-xs text-neutral-400">
          Stern-Gerlach: the beam doesn't smear — it splits <em>discretely</em> into two.
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Whichever axis you measure along, you always get two outcomes. Measuring{' '}
        <Eq>{`S_{x}`}</Eq> after <Eq>{`S_{z}`}</Eq> randomizes the result, because the operators
        don't commute. Spin is the cleanest qubit in nature.
      </p>

      <Deeper>
        <p>
          Spin-½ observables are built from the <em>Pauli matrices</em>:
        </p>
        <Block>{
          `\\op{\\hat{S}}_{i} = \\frac{\\hbar}{2}\\,\\sigma_{i} \\quad\\;\\; \\sigma_{x}=\\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix} \\;\\; \\sigma_{y}=\\begin{pmatrix}0 & -i\\\\ i & 0\\end{pmatrix} \\;\\; \\sigma_{z}=\\begin{pmatrix}1 & 0\\\\ 0 & -1\\end{pmatrix}`
        }</Block>
        <p>
          They obey the angular-momentum algebra (and cyclic permutations):
        </p>
        <Block>{
          `[\\,\\op{\\hat{S}}_{x},\\op{\\hat{S}}_{y}\\,] \\;=\\; i\\,\\hbar\\,\\op{\\hat{S}}_{z}`
        }</Block>
        <p>
          Integer-spin particles (photons, gluons, W/Z, Higgs) are <em>bosons</em>; half-integer
          spins (electrons, quarks, neutrinos) are <em>fermions</em>. The <em>spin-statistics
          theorem</em> forces fermion wavefunctions to be antisymmetric under exchange, generating
          the Pauli exclusion principle and giving matter its volume. Spin couples to magnetic
          fields via the magnetic moment{' '}
          <Eq>{`\\boldsymbol{\\mu} = g\\,\\frac{e}{2m}\\,\\mathbf{S}`}</Eq> — the basis of NMR,
          MRI, and EPR.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 10. entanglement ------------------------------------------------------

const Entanglement = () => {
  const [outcome, setOutcome] = useState(null);
  const [measuring, setMeasuring] = useState(false);

  const measure = () => {
    if (outcome !== null) return;
    setMeasuring(true);
    setTimeout(() => {
      setOutcome(Math.random() < 0.5 ? 0 : 1);
      setMeasuring(false);
    }, 500);
  };
  const reset = () => setOutcome(null);

  const color = outcome === 0 ? 'sky' : outcome === 1 ? 'fuchsia' : null;
  const Particle = ({ side }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-neutral-500 font-mono">{side}</div>
      <motion.div
        animate={outcome === null ? { rotate: [0, 360], scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
        transition={
          outcome === null
            ? { rotate: { duration: 6, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }
            : { type: 'spring', stiffness: 200, damping: 18 }
        }
        className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center font-mono text-2xl ${
          outcome === null
            ? 'border-white/20 bg-gradient-to-br from-sky-500/20 via-fuchsia-500/20 to-emerald-500/20 text-neutral-200'
            : outcome === 0
            ? 'border-sky-400 bg-sky-500/20 text-sky-100'
            : 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100'
        }`}
      >
        {outcome === null ? '?' : `|${outcome}⟩`}
      </motion.div>
    </div>
  );

  return (
    <Card
      id="entanglement"
      index={10}
      icon={Link2}
      title="Entanglement"
      subtitle="Two particles share one wavefunction. Measuring one instantly pins the other — even across a lab, or a galaxy."
      accent="emerald"
    >
      <p>
        Prepare two qubits in the Bell state below. Neither particle has a definite value on its
        own — but whatever you find for one, you're guaranteed to find the matching value for the
        other. The correlations are stronger than <em>any</em> local "hidden variable" theory can
        reproduce (Bell's theorem, 1964; experimentally verified by Aspect, Clauser, and Zeilinger
        — Nobel Prize 2022).
      </p>

      <KeyEq note="equal superposition of 'both 0' and 'both 1' — a maximally entangled Bell state">{
        `\\ket{\\Phi^{+}} \\;=\\; \\frac{\\ket{00} + \\ket{11}}{\\sqrt{2}}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="flex items-center justify-center gap-8">
          <Particle side="Alice" />
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="h-px w-20 bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400"
              animate={
                measuring ? { opacity: [1, 0.2, 1] } : outcome === null ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.25 }
              }
              transition={{ duration: measuring ? 0.2 : 2, repeat: outcome === null ? Infinity : 0 }}
            />
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">entangled</div>
          </div>
          <Particle side="Bob" />
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={measure} icon={Eye} variant="primary">measure Alice</Button>
          <Button onClick={reset} icon={RotateCcw} variant="ghost">reset</Button>
        </div>
        {outcome !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm text-neutral-300 font-mono">
            Alice got <span className={color === 'sky' ? 'text-sky-300' : 'text-fuchsia-300'}>|{outcome}⟩</span>
            &nbsp;→&nbsp; Bob is now{' '}
            <span className={color === 'sky' ? 'text-sky-300' : 'text-fuchsia-300'}>|{outcome}⟩</span>, guaranteed.
          </motion.div>
        )}
      </div>

      <p className="text-sm text-neutral-400">
        Nothing faster-than-light travels — Bob can't tell he's been measured until Alice
        calls — but the correlations are real. Entanglement is the resource behind quantum
        teleportation, dense coding, and quantum computing's edge over classical machines.
      </p>

      <Deeper>
        <p>
          An entangled state cannot be written as a product{' '}
          <Eq>{`\\ket{\\psi_{A}} \\otimes \\ket{\\psi_{B}}`}</Eq>. Tracing out Bob's side of{' '}
          <Eq>{`\\ket{\\Phi^{+}}`}</Eq> leaves Alice with a <em>maximally mixed</em> reduced
          density matrix — she has zero local information until she compares notes:
        </p>
        <Block>{
          `\\rho_{A} \\;=\\; \\operatorname{Tr}_{B}\\bigl(\\,\\ket{\\Phi^{+}}\\!\\bra{\\Phi^{+}}\\,\\bigr) \\;=\\; \\tfrac{1}{2}\\,\\mathbb{I}`
        }</Block>
        <p>
          The <em>CHSH inequality</em> bounds any local-realistic correlator at{' '}
          <Eq>{`|S| \\leq 2`}</Eq>; quantum mechanics reaches the Tsirelson bound and experiments
          match:
        </p>
        <Block>{
          `|S|_{\\,\\text{classical}} \\leq 2 \\qquad |S|_{\\,\\text{quantum}} = 2\\sqrt{2} \\approx 2.828`
        }</Block>
        <p>
          Entanglement also obeys <em>monogamy</em> (perfect entanglement with one party excludes
          it with a third) and the <em>no-cloning theorem</em> (you can't duplicate an unknown
          quantum state) — both crucial for quantum cryptography.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 11. interpretations ---------------------------------------------------

const Interpretations = () => {
  const items = [
    {
      title: 'Copenhagen',
      tag: 'shut up and calculate',
      color: 'sky',
      icon: Eye,
      body:
        'Measurement causes a real, physical collapse of the wavefunction. The formalism is a tool to predict outcomes; don\'t ask what it "really is" between measurements.',
    },
    {
      title: 'Many-Worlds',
      tag: 'the wavefunction is real',
      color: 'violet',
      icon: GitBranch,
      body:
        'There is no collapse. The universe branches: one Alice sees |0⟩, another Alice sees |1⟩. Born probabilities reflect how often "you" end up on each branch.',
    },
    {
      title: 'Pilot Wave',
      tag: 'particles on rails',
      color: 'emerald',
      icon: Sparkles,
      body:
        'Particles have definite positions at all times; a guiding wavefunction tells them where to go. Non-local but deterministic (de Broglie–Bohm).',
    },
    {
      title: 'QBism / Relational',
      tag: 'probabilities are beliefs',
      color: 'amber',
      icon: HelpCircle,
      body:
        'The wavefunction is an observer\'s catalog of expectations. Different observers can hold different, equally valid wavefunctions for the same system.',
    },
    {
      title: 'Objective Collapse',
      tag: 'collapse is physical',
      color: 'rose',
      icon: Zap,
      body:
        'Modify the Schrödinger equation so spontaneous, stochastic collapses happen rarely for single particles but rapidly for macroscopic superpositions (GRW, CSL).',
    },
    {
      title: 'Consistent Histories',
      tag: 'decoherence decides',
      color: 'fuchsia',
      icon: Layers,
      body:
        'Only certain sets of alternative histories are consistent (no interference between them). The theory assigns classical probabilities to these sets.',
    },
  ];
  return (
    <Card
      id="interpretations"
      index={11}
      icon={HelpCircle}
      title="Interpretations"
      subtitle="The math is unambiguous. What it means about reality is not."
      accent="amber"
    >
      <p>
        Everyone agrees on the predictions. Physicists have disagreed — politely, for a century —
        on what the wavefunction <em>is</em>. The <em>measurement problem</em> is the sharp
        question: if Schrödinger's equation is universal, what privileges measurements as moments
        of collapse? Each interpretation answers differently.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => {
          const a = accentMap[it.color];
          const Ic = it.icon;
          return (
            <motion.div
              key={it.title}
              whileHover={{ y: -2 }}
              className={`rounded-xl p-4 bg-white/[0.03] border ${a.border}`}
            >
              <div className="flex items-center gap-2">
                <Ic className={`w-4 h-4 ${a.text}`} />
                <div className="font-semibold text-neutral-100">{it.title}</div>
                <div className="ml-auto text-[10px] uppercase tracking-widest text-neutral-500">{it.tag}</div>
              </div>
              <p className="mt-2 text-sm text-neutral-300">{it.body}</p>
            </motion.div>
          );
        })}
      </div>
      <p className="text-sm text-neutral-400">
        No experiment has yet distinguished between these. The numbers on your instrument come out
        identical either way.
      </p>
    </Card>
  );
};

// --- section registry ------------------------------------------------------

const SECTIONS = [
  { slug: 'wave-particle', short: 'Duality', Component: WaveParticle },
  { slug: 'double-slit', short: 'Double-Slit', Component: DoubleSlit },
  { slug: 'superposition', short: 'Superposition', Component: Superposition },
  { slug: 'schrodinger', short: 'Schrödinger', Component: SchrodingerEq },
  { slug: 'measurement', short: 'Measurement', Component: Measurement },
  { slug: 'uncertainty', short: 'Uncertainty', Component: Uncertainty },
  { slug: 'quantization', short: 'Quantization', Component: Quantization },
  { slug: 'tunneling', short: 'Tunneling', Component: Tunneling },
  { slug: 'spin', short: 'Spin', Component: Spin },
  { slug: 'entanglement', short: 'Entanglement', Component: Entanglement },
  { slug: 'interpretations', short: 'Interpretations', Component: Interpretations },
];

// --- section nav -----------------------------------------------------------

const SectionNav = ({ sections }) => {
  const [active, setActive] = useState(sections[0].slug);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const anchor = window.innerHeight * 0.3;
        let best = null;
        let bestDist = Infinity;
        for (const e of visible) {
          const d = Math.abs(e.boundingClientRect.top - anchor);
          if (d < bestDist) {
            bestDist = d;
            best = e.target.id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const activeIdx = Math.max(0, sections.findIndex((s) => s.slug === active));
  const progress = sections.length > 1 ? activeIdx / (sections.length - 1) : 0;

  const scrollTo = (slug) => (e) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${slug}`);
    }
  };

  return (
    <>
      <nav aria-label="Sections" className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-mono">
            {String(activeIdx + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
          </div>
          <ul className="flex flex-col gap-2 items-end">
            {sections.map((s, i) => {
              const isActive = active === s.slug;
              return (
                <li key={s.slug}>
                  <a href={`#${s.slug}`} onClick={scrollTo(s.slug)} className="group flex items-center gap-3 justify-end">
                    <span
                      className={`font-mono text-[10.5px] uppercase tracking-[0.15em] whitespace-nowrap transition-opacity duration-200 ${
                        isActive ? 'text-sky-200 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-90'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')} · {s.short}
                    </span>
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-sky-400 w-7 h-1.5 shadow-[0_0_12px_rgba(56,189,248,0.6)]'
                          : 'bg-white/25 group-hover:bg-white/60 w-1.5 h-1.5'
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-0.5 bg-white/[0.04]">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 origin-left"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="lg:hidden fixed top-2 right-2 z-40 font-mono text-[10px] text-neutral-200 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
        <span className="text-neutral-500">
          {String(activeIdx + 1).padStart(2, '0')}/{String(sections.length).padStart(2, '0')}
        </span>
        <ChevronRight className="w-3 h-3 text-neutral-600" />
        <span className="text-sky-200">{sections[activeIdx]?.short}</span>
      </div>
    </>
  );
};

// --- outro ------------------------------------------------------------------

const Outro = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="relative max-w-4xl mx-auto px-4 py-20 text-center"
  >
    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
      <Zap className="w-3.5 h-3.5" /> that's the gist
    </div>
    <p className="mt-4 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
      Quantum mechanics refuses to answer "what's really there?" — but it answers "what will the
      detector show?" with astonishing precision. Every transistor in your pocket, every LED,
      every MRI scan is built on top of it.
    </p>
  </motion.section>
);

// --- root -------------------------------------------------------------------

export default function QuantumMechanicsExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-sky-500/30">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(192,132,252,0.08),transparent_60%)]"
      />
      <SectionNav sections={SECTIONS} />
      <div className="relative">
        <Hero />
        <main className="max-w-3xl mx-auto px-4 py-14 md:py-20 space-y-6 md:space-y-8">
          {SECTIONS.map(({ slug, Component }) => (
            <Component key={slug} />
          ))}
        </main>
        <Outro />
      </div>
    </div>
  );
}
