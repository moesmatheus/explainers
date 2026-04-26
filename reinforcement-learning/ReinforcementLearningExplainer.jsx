import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Bot, Gamepad2, Coins, Gauge, Target, Network, Compass, Layers,
  Shuffle, GitBranch, Brain, Sparkles, Trophy, Swords, Box,
  Cloud, Users, Rewind, MessageSquare, Play, Pause, RotateCcw,
  ChevronDown, ChevronRight, FlaskConical, ArrowRight, Zap, Dice5,
  Scale, Database, TrendingUp, ListChecks, Activity,
} from 'lucide-react';

/* ============================================================================
   Reinforcement Learning — an interactive overview
   Single-file React component. Dark. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives (KaTeX with a semantic RL color palette) --------------
// NOTE: inside macro bodies, '#' must be doubled to '##' to escape it.
const KATEX_MACROS = {
  '\\st':  '\\textcolor{##7dd3fc}{#1}',   // state — sky
  '\\ac':  '\\textcolor{##f9a8d4}{#1}',   // action — pink
  '\\rw':  '\\textcolor{##fcd34d}{#1}',   // reward — amber
  '\\vl':  '\\textcolor{##6ee7b7}{#1}',   // value V,Q — emerald
  '\\pl':  '\\textcolor{##c4b5fd}{#1}',   // policy π, θ — violet
  '\\hp':  '\\textcolor{##f0abfc}{#1}',   // hyperparams γ, α, ε — fuchsia
  '\\E':   '\\mathbb{E}',
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
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  pink:    { text: 'text-pink-400',    border: 'border-pink-400/20',    from: 'from-pink-500/15' },
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
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${a.from} to-transparent blur-2xl opacity-60`} />
      <div className="relative flex items-start gap-4">
        <div className={`shrink-0 rounded-xl p-2.5 bg-white/5 border ${a.border}`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
            {index != null && <span>{String(index).padStart(2, '0')}</span>}
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      <div className="relative mt-5 text-neutral-200 text-[15px] leading-relaxed space-y-4">{children}</div>
    </motion.section>
  );
};

const Button = ({ children, onClick, icon: Icon, variant = 'primary', disabled }) => {
  const styles = {
    primary: 'bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/25 text-sky-100',
    ghost:   'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200',
    danger:  'bg-rose-500/10 border-rose-400/20 hover:bg-rose-500/20 text-rose-200',
    good:    'bg-emerald-500/10 border-emerald-400/20 hover:bg-emerald-500/20 text-emerald-200',
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles}`}
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

const Slider = ({ label, value, onChange, min, max, step, fmt, accent = 'sky' }) => {
  const accentClass = { sky: 'accent-sky-400', violet: 'accent-violet-400', amber: 'accent-amber-400', emerald: 'accent-emerald-400', fuchsia: 'accent-fuchsia-400' }[accent];
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-neutral-400 text-xs w-20 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className={`flex-1 ${accentClass}`} />
      <span className="text-neutral-300 text-xs w-14 text-right font-mono">{fmt ? fmt(value) : value}</span>
    </label>
  );
};

const PlayCtl = ({ playing, onToggle, onReset, speed, setSpeed }) => (
  <div className="flex items-center gap-3">
    <Button icon={playing ? Pause : Play} onClick={onToggle} variant="ghost">
      {playing ? 'pause' : 'play'}
    </Button>
    <Button icon={RotateCcw} onClick={onReset} variant="ghost">reset</Button>
    <div className="flex items-center gap-2 ml-auto text-xs text-neutral-400">
      <Gauge className="w-3.5 h-3.5" />
      <input type="range" min="0.25" max="3" step="0.05" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-24 accent-fuchsia-400" />
      <span className="w-10 text-right font-mono text-neutral-300">{speed.toFixed(2)}×</span>
    </div>
  </div>
);

// --- particle-ish hero background (subtle dots drifting) ------------------

const DotField = () => {
  const dots = useMemo(
    () => Array.from({ length: 38 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.6 + 0.4,
      d: Math.random() * 5 + 4,
      dy: Math.random() * 8 + 4,
    })), []);
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="rlDotGlow">
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="1" />
          <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d) => (
        <motion.circle
          key={d.id}
          cx={d.x} cy={d.y} r={d.r}
          fill="url(#rlDotGlow)"
          initial={{ opacity: 0.2 }}
          animate={{ cy: [d.y, (d.y + d.dy) % 100, d.y], opacity: [0.2, 0.85, 0.2] }}
          transition={{ duration: d.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
};

// --- hero + nav -------------------------------------------------------------

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-violet-500/5 to-transparent" />
    <DotField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <Bot className="w-3.5 h-3.5" /> an interactive overview
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-emerald-100 to-violet-200 bg-clip-text text-transparent">
          Reinforcement Learning
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          An agent, an environment, a reward. That's the whole setup — and almost the whole story of how machines learn by trial and error.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">s states</span>
          <span className="text-pink-300">a actions</span>
          <span className="text-amber-300">r rewards</span>
          <span className="text-emerald-300">V,Q values</span>
          <span className="text-violet-300">π policy</span>
          <span className="text-fuchsia-300">γ,α,ε hyperparams</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const ACTS = [
  { id: 'act-1', label: 'Setup' },
  { id: 'act-2', label: 'Value & optimality' },
  { id: 'act-3', label: 'Learning dynamics' },
  { id: 'act-4', label: 'Algorithm families' },
  { id: 'act-5', label: 'Deep & frontier' },
];

const SectionNav = () => {
  const [active, setActive] = useState('act-1');
  useEffect(() => {
    const onScroll = () => {
      let current = ACTS[0].id;
      for (const a of ACTS) {
        const el = document.getElementById(a.id);
        if (el && el.getBoundingClientRect().top - 100 <= 0) current = a.id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      {/* Desktop: vertical pane on left */}
      <nav className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1.5 text-xs">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`group flex items-center gap-2 py-1 pl-3 pr-3 rounded-lg border transition-colors ${active === a.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                <span className="font-mono tabular-nums text-[10px] opacity-60">0{i + 1}</span>
                <span className="tracking-wide">{a.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Mobile: sticky top bar */}
      <nav className="lg:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/70 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`block px-3 py-1.5 rounded-md border ${active === a.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">0{i + 1}</span>{a.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

const ActHeader = ({ id, n, title, blurb }) => (
  <div id={id} className="scroll-mt-24 flex flex-col items-start gap-2 pt-4 pb-2">
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-emerald-300/80 font-mono">
      <span>act {n}</span>
      <span className="h-px w-10 bg-emerald-400/30" />
    </div>
    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-50">{title}</h2>
    {blurb && <p className="text-neutral-400 max-w-2xl">{blurb}</p>}
  </div>
);

/* =============================================================================
   ACT 1 — SETUP
   ============================================================================= */

// --- 1. agent–environment loop (HEADLINE INTERACTIVE) -----------------------

const AgentLoop = () => {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [totalReward, setTotalReward] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((x) => x + 1), 1100 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);

  useEffect(() => {
    if (t === 0) return;
    const r = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 0 : -1);
    setTotalReward((s) => s + r);
    setHistory((h) => [...h.slice(-11), r]);
  }, [t]);

  const reset = () => { setT(0); setTotalReward(0); setHistory([]); setPlaying(true); };

  const phase = t % 4; // 0: agent thinks, 1: action out, 2: env updates, 3: reward back
  const w = 560, h = 260;
  const agentX = 90, envX = 470, cy = h / 2;

  return (
    <Card id="agent-loop" index={1} icon={Bot} title="The Agent–Environment Loop" subtitle="The whole setup in four arrows." accent="emerald">
      <p>
        An <em>agent</em> observes a <Eq>{`\\st{s_t}`}</Eq> from the <em>environment</em>, picks an <Eq>{`\\ac{a_t}`}</Eq>, and receives back a new <Eq>{`\\st{s_{t+1}}`}</Eq> and a scalar <Eq>{`\\rw{r_{t+1}}`}</Eq>. Repeat. The agent's only job is to choose actions that make the stream of rewards, over time, as large as possible.
      </p>

      <KeyEq note="the cycle: observe, act, receive, update.">{
        `\\st{s_t} \\;\\xrightarrow{\\;\\pl{\\pi}\\;}\\; \\ac{a_t} \\;\\longrightarrow\\; \\text{env} \\;\\longrightarrow\\; (\\st{s_{t+1}}, \\rw{r_{t+1}})`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
          <defs>
            <linearGradient id="agentFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="envFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
            </linearGradient>
            <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#f9a8d4" />
            </marker>
            <marker id="arrB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#7dd3fc" />
            </marker>
            <marker id="arrC" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#fcd34d" />
            </marker>
          </defs>

          {/* Agent */}
          <g>
            <rect x={agentX - 60} y={cy - 50} width="120" height="100" rx="16" fill="url(#agentFill)" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x={agentX} y={cy - 22} textAnchor="middle" fontSize="13" fill="#6ee7b7" fontFamily="ui-sans-serif">agent</text>
            <text x={agentX} y={cy - 4} textAnchor="middle" fontSize="10" fill="#a7f3d0" fontFamily="ui-monospace, monospace">π(a | s)</text>
            <motion.circle cx={agentX} cy={cy + 20} r="5" fill="#6ee7b7" animate={{ scale: phase === 0 ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.4 }} />
          </g>

          {/* Env */}
          <g>
            <rect x={envX - 60} y={cy - 50} width="120" height="100" rx="16" fill="url(#envFill)" stroke="#c4b5fd" strokeWidth="1.5" />
            <text x={envX} y={cy - 22} textAnchor="middle" fontSize="13" fill="#c4b5fd" fontFamily="ui-sans-serif">environment</text>
            <text x={envX} y={cy - 4} textAnchor="middle" fontSize="10" fill="#ddd6fe" fontFamily="ui-monospace, monospace">p(s' | s, a)</text>
            <motion.circle cx={envX} cy={cy + 20} r="5" fill="#c4b5fd" animate={{ scale: phase === 2 ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.4 }} />
          </g>

          {/* Top arrow: action */}
          <g>
            <path d={`M ${agentX + 60} ${cy - 20} Q ${(agentX + envX) / 2} ${cy - 70} ${envX - 60} ${cy - 20}`} fill="none" stroke="#f9a8d4" strokeOpacity="0.25" strokeWidth="2" markerEnd="url(#arrA)" />
            <text x={(agentX + envX) / 2} y={cy - 72} textAnchor="middle" fontSize="11" fill="#f9a8d4" fontFamily="ui-monospace, monospace">action aₜ</text>
            {phase === 1 && (
              <circle r="7" fill="#f9a8d4" cx={agentX + 60} cy={cy - 20}>
                <animateMotion dur={`${0.9 / speed}s`} fill="freeze"
                  path={`M 0 0 Q ${(envX - agentX - 120) / 2} -50 ${envX - agentX - 120} 0`} />
              </circle>
            )}
          </g>

          {/* Bottom arrow: state + reward */}
          <g>
            <path d={`M ${envX - 60} ${cy + 20} Q ${(agentX + envX) / 2} ${cy + 70} ${agentX + 60} ${cy + 20}`} fill="none" stroke="#7dd3fc" strokeOpacity="0.25" strokeWidth="2" markerEnd="url(#arrB)" />
            <text x={(agentX + envX) / 2 - 40} y={cy + 80} textAnchor="middle" fontSize="11" fill="#7dd3fc" fontFamily="ui-monospace, monospace">state sₜ₊₁</text>
            <text x={(agentX + envX) / 2 + 40} y={cy + 80} textAnchor="middle" fontSize="11" fill="#fcd34d" fontFamily="ui-monospace, monospace">reward rₜ₊₁</text>
            {phase === 3 && (
              <circle r="7" fill="#7dd3fc" cx={envX - 60} cy={cy + 20}>
                <animateMotion dur={`${0.9 / speed}s`} fill="freeze"
                  path={`M 0 0 Q -${(envX - agentX - 120) / 2} 50 -${envX - agentX - 120} 0`} />
              </circle>
            )}
          </g>

          {/* t counter */}
          <text x="20" y="24" fontSize="11" fill="#737373" fontFamily="ui-monospace, monospace">t = {t}</text>
          <text x={w - 20} y="24" textAnchor="end" fontSize="11" fill="#fcd34d" fontFamily="ui-monospace, monospace">Σr = {totalReward}</text>
        </svg>

        <div className="mt-3 flex items-center gap-1">
          {history.map((r, i) => (
            <div key={i} className={`w-5 h-5 rounded text-[10px] font-mono flex items-center justify-center ${r > 0 ? 'bg-amber-500/30 text-amber-100' : r < 0 ? 'bg-rose-500/30 text-rose-100' : 'bg-white/5 text-neutral-500'}`}>
              {r > 0 ? '+1' : r < 0 ? '−1' : '0'}
            </div>
          ))}
          <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-500">recent rewards</span>
        </div>

        <div className="mt-3">
          <PlayCtl playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={reset} speed={speed} setSpeed={setSpeed} />
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        No labels, no teachers — the scalar reward is the <em>only</em> feedback. Every concept in the rest of the page is a way to answer: given only this loop, how should the agent choose?
      </p>

      <Deeper>
        <p>
          Formally the setup is a Markov decision process <Eq>{`(\\st{S}, \\ac{A}, p, \\rw{r}, \\hp{\\gamma})`}</Eq>. The agent's goal is to maximize the <em>expected return</em>
        </p>
        <Block>{`\\pl{J(\\pi)} = \\E_{\\tau \\sim \\pl{\\pi}} \\Big[ \\sum_{t=0}^{\\infty} \\hp{\\gamma}^t \\, \\rw{r_{t+1}} \\Big]`}</Block>
        <p>
          where <Eq>{`\\tau = (\\st{s_0}, \\ac{a_0}, \\rw{r_1}, \\st{s_1}, \\dots)`}</Eq> is a trajectory. The whole field is techniques for computing, approximating, or gradient-ascending this objective.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 2. MDP -----------------------------------------------------------------

const MDPCard = () => {
  const [hover, setHover] = useState(null);
  const nodes = [
    { id: 'A', x: 120, y: 70, label: 's₀' },
    { id: 'B', x: 320, y: 50, label: 's₁' },
    { id: 'C', x: 480, y: 150, label: 's₂' },
    { id: 'D', x: 260, y: 210, label: 's₃' },
  ];
  const edges = [
    { from: 'A', to: 'B', p: 0.7, r: 0,  curve: -30 },
    { from: 'A', to: 'D', p: 0.3, r: -1, curve:  30 },
    { from: 'B', to: 'C', p: 0.9, r: +1, curve: -20 },
    { from: 'B', to: 'A', p: 0.1, r: 0,  curve:  40 },
    { from: 'C', to: 'B', p: 0.5, r: 0,  curve:  30 },
    { from: 'C', to: 'D', p: 0.5, r: -1, curve: -20 },
    { from: 'D', to: 'A', p: 1.0, r: +2, curve:  20 },
  ];
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <Card id="mdp" index={2} icon={Network} title="Markov Decision Process" subtitle="The formal object behind everything." accent="sky">
      <p>
        An MDP is a set of <Eq>{`\\st{\\text{states}}`}</Eq>, a set of <Eq>{`\\ac{\\text{actions}}`}</Eq>, a <em>transition</em> law <Eq>{`p(\\st{s'} \\mid \\st{s}, \\ac{a})`}</Eq>, and a <em>reward</em> function <Eq>{`\\rw{r(\\st{s}, \\ac{a})}`}</Eq>. The <em>Markov property</em>: the future depends only on the present state, not on how you got there.
      </p>

      <KeyEq>{`p(\\st{s_{t+1}}, \\rw{r_{t+1}} \\mid \\st{s_t}, \\ac{a_t}, \\st{s_{t-1}}, \\ldots) = p(\\st{s_{t+1}}, \\rw{r_{t+1}} \\mid \\st{s_t}, \\ac{a_t})`}</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 600 280" className="w-full h-auto">
          <defs>
            <marker id="mdpArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const A = getNode(e.from), B = getNode(e.to);
            const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + e.curve;
            const d = `M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`;
            const active = hover === e.from;
            return (
              <g key={i} opacity={hover == null ? 1 : active ? 1 : 0.2}>
                <path d={d} fill="none" stroke={active ? '#7dd3fc' : '#94a3b8'} strokeOpacity={active ? 0.9 : 0.35} strokeWidth={active ? 2 : 1.2} markerEnd="url(#mdpArr)" />
                <text x={mx} y={my + 2} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">
                  <tspan fill="#cbd5e1">p={e.p}</tspan>
                  <tspan fill="#64748b">{' · '}</tspan>
                  <tspan fill={e.r > 0 ? '#fcd34d' : e.r < 0 ? '#fda4af' : '#64748b'}>r={e.r > 0 ? '+' : ''}{e.r}</tspan>
                </text>
              </g>
            );
          })}
          {nodes.map((n) => (
            <g key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <circle cx={n.x} cy={n.y} r="26" fill={hover === n.id ? '#0c4a6e' : '#0f172a'} stroke="#7dd3fc" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="13" fill="#7dd3fc" fontFamily="ui-monospace, monospace">{n.label}</text>
            </g>
          ))}
        </svg>
        <div className="mt-2 text-[11px] text-neutral-500 text-center">hover a state to spotlight its outgoing transitions</div>
      </div>

      <p className="text-sm text-neutral-400">
        If the state doesn't carry enough info to make the Markov property hold — say, the agent can only see a partial view — you have a <em>POMDP</em>, and the agent has to keep a memory or a belief over true states.
      </p>
    </Card>
  );
};

// --- 3. Return & γ ----------------------------------------------------------

const ReturnGamma = () => {
  const [gamma, setGamma] = useState(0.9);
  const rewards = [1, 1, -0.5, 2, 0, 1, 0.5, 1.5, 0, 1, 2, 0.5];
  const bars = rewards.map((r, t) => ({ r, t, disc: r * Math.pow(gamma, t) }));
  const total = bars.reduce((s, b) => s + b.disc, 0);
  const undisc = bars.reduce((s, b) => s + b.r, 0);
  const maxAbs = 2.0;
  return (
    <Card id="return-gamma" index={3} icon={Coins} title="Return & Discount Factor" subtitle="How to sum future rewards into a single number." accent="amber">
      <p>
        The <em>return</em> <Eq>{`G_t`}</Eq> is the total reward from time <Eq>{`t`}</Eq> onward. Pure sums blow up for infinite tasks, so we discount: rewards further in the future count less, by a factor <Eq>{`\\hp{\\gamma} \\in [0,1)`}</Eq>.
      </p>

      <KeyEq note="γ near 0 = myopic; γ near 1 = far-sighted">{
        `G_t = \\rw{r_{t+1}} + \\hp{\\gamma}\\,\\rw{r_{t+2}} + \\hp{\\gamma}^2\\rw{r_{t+3}} + \\cdots = \\sum_{k=0}^{\\infty} \\hp{\\gamma}^k\\,\\rw{r_{t+k+1}}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 600 180" className="w-full h-auto">
          <line x1="30" y1="130" x2="580" y2="130" stroke="#ffffff20" />
          {bars.map((b, i) => {
            const x = 40 + i * 45;
            const rawH = (b.r / maxAbs) * 80;
            const discH = (b.disc / maxAbs) * 80;
            return (
              <g key={i}>
                <rect x={x} y={130 - Math.max(rawH, 0)} width="14" height={Math.abs(rawH)} fill="#fcd34d20" stroke="#fcd34d40" />
                <rect x={x + 16} y={130 - Math.max(discH, 0)} width="14" height={Math.abs(discH)} fill="#fcd34d" fillOpacity="0.85" />
                <text x={x + 15} y="150" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="ui-monospace, monospace">t{b.t}</text>
              </g>
            );
          })}
          <text x="40" y="20" fontSize="10" fill="#fcd34d80" fontFamily="ui-monospace, monospace">raw rₜ</text>
          <text x="40" y="34" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">γᵗ · rₜ</text>
        </svg>
        <div className="space-y-2">
          <Slider label="γ" value={gamma} onChange={setGamma} min={0} max={0.99} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <div className="flex justify-between text-xs font-mono">
            <span className="text-neutral-500">raw sum = <span className="text-neutral-200">{undisc.toFixed(2)}</span></span>
            <span className="text-amber-300">discounted return = {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Discounting also reflects uncertainty: the further out a reward is, the more that could change before you get it. A <Eq>{`\\hp{\\gamma}`}</Eq> of <Eq>{`0.99`}</Eq> has an "effective horizon" of roughly <Eq>{`1/(1-\\hp{\\gamma}) = 100`}</Eq> steps.
      </p>
    </Card>
  );
};

// --- 4. Policy --------------------------------------------------------------

const PolicyCard = () => {
  const states = ['s₀', 's₁', 's₂', 's₃'];
  const detArrows = ['↑', '→', '↓', '→'];
  const stoch = [
    [0.7, 0.1, 0.1, 0.1],
    [0.1, 0.7, 0.1, 0.1],
    [0.2, 0.2, 0.5, 0.1],
    [0.15, 0.35, 0.35, 0.15],
  ];
  const actLabels = ['↑', '→', '↓', '←'];
  return (
    <Card id="policy" index={4} icon={Compass} title="Policy — π(a | s)" subtitle="How the agent chooses." accent="violet">
      <p>
        A <em>policy</em> maps states to actions. <em>Deterministic</em>: one action per state. <em>Stochastic</em>: a probability distribution over actions. Stochastic policies are essential for exploration and for smooth optimization.
      </p>

      <KeyEq>{`\\pl{\\pi}(\\ac{a} \\mid \\st{s}) = \\Pr[\\,\\ac{A_t} = \\ac{a} \\mid \\st{S_t} = \\st{s}\\,]`}</KeyEq>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-3">deterministic</div>
          <div className="grid grid-cols-4 gap-2">
            {states.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 py-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-sky-300 font-mono">{s}</span>
                <span className="text-2xl text-pink-300">{detArrows[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-neutral-500">π(s) = single action</p>
        </div>

        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-3">stochastic</div>
          <div className="space-y-2">
            {states.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="text-xs text-sky-300 font-mono w-8">{s}</span>
                <div className="flex-1 flex gap-1 h-6">
                  {stoch[i].map((p, j) => (
                    <div key={j} className="flex-1 bg-pink-500/20 border border-pink-400/30 rounded flex items-center justify-center relative overflow-hidden" title={`${actLabels[j]} : ${p}`}>
                      <div className="absolute inset-x-0 bottom-0 bg-pink-400/60" style={{ height: `${p * 100}%` }} />
                      <span className="relative text-[10px] text-pink-100 font-mono">{actLabels[j]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-neutral-500">π(a|s) = distribution</p>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        The <em>optimal</em> policy <Eq>{`\\pl{\\pi^\\star}`}</Eq> is one that maximizes expected return from every state. Proving it exists (and is deterministic in finite MDPs) is one of the first wins of RL theory.
      </p>
    </Card>
  );
};

/* =============================================================================
   ACT 2 — VALUE & OPTIMALITY
   ============================================================================= */

// --- 5. Value functions V & Q ----------------------------------------------

const ValueFunctions = () => {
  const size = 5;
  // Precomputed example V(s) shaded toward (0,4) and away from (2,2)
  const V = useMemo(() => {
    const goal = [0, 4], trap = [2, 2];
    const v = Array.from({ length: size }, () => Array(size).fill(0));
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const dG = Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
      const dT = Math.abs(r - trap[0]) + Math.abs(c - trap[1]);
      v[r][c] = Math.max(-0.5, Math.min(1, 1 - 0.2 * dG - 0.05 * Math.max(0, 3 - dT)));
    }
    v[0][4] = 1.0; v[2][2] = -1.0;
    return v;
  }, []);
  const Qdirs = useMemo(() => {
    // rough Q(s,a) — up, right, down, left — prefer moves that reduce dist to goal
    const goal = [0, 4];
    const q = Array.from({ length: size }, () => Array.from({ length: size }, () => [0, 0, 0, 0]));
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const moves = [[-1,0],[0,1],[1,0],[0,-1]];
      moves.forEach((m, i) => {
        const nr = r + m[0], nc = c + m[1];
        if (nr < 0 || nc < 0 || nr >= size || nc >= size) { q[r][c][i] = -0.5; return; }
        const d = Math.abs(nr - goal[0]) + Math.abs(nc - goal[1]);
        q[r][c][i] = Math.max(-0.3, 1 - 0.18 * d);
      });
      if (r === 0 && c === 4) q[r][c] = [1, 1, 1, 1];
      if (r === 2 && c === 2) q[r][c] = [-1, -1, -1, -1];
    }
    return q;
  }, []);

  const cellColor = (v) => {
    if (v > 0) return `rgba(110,231,183,${Math.min(0.9, v)})`;
    if (v < 0) return `rgba(253,164,175,${Math.min(0.9, -v)})`;
    return 'rgba(255,255,255,0.03)';
  };

  return (
    <Card id="values" index={5} icon={Gauge} title="Value Functions — V(s) and Q(s, a)" subtitle="'How good is this?' — two versions of the same question." accent="emerald">
      <p>
        <Eq>{`\\vl{V^{\\pl{\\pi}}(\\st{s})}`}</Eq> is the expected return from state <Eq>{`\\st{s}`}</Eq> if you follow policy <Eq>{`\\pl{\\pi}`}</Eq>. <Eq>{`\\vl{Q^{\\pl{\\pi}}(\\st{s}, \\ac{a})}`}</Eq> goes one step further: take <Eq>{`\\ac{a}`}</Eq> now, follow <Eq>{`\\pl{\\pi}`}</Eq> after. <Eq>{`\\vl{Q}`}</Eq> is more useful for control — it tells you which action is best.
      </p>

      <KeyEq>{
        `\\vl{V^{\\pl{\\pi}}(\\st{s})} = \\E_{\\pl{\\pi}}\\!\\bigl[G_t \\mid \\st{S_t}\\!=\\!\\st{s}\\bigr], \\quad \\vl{Q^{\\pl{\\pi}}(\\st{s},\\ac{a})} = \\E_{\\pl{\\pi}}\\!\\bigl[G_t \\mid \\st{S_t}\\!=\\!\\st{s},\\ac{A_t}\\!=\\!\\ac{a}\\bigr]`
      }</KeyEq>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-3">V(s) — one number per cell</div>
          <svg viewBox="0 0 220 220" className="w-full h-auto">
            {V.map((row, r) => row.map((v, c) => (
              <g key={`${r}-${c}`}>
                <rect x={c * 42 + 5} y={r * 42 + 5} width="40" height="40" fill={cellColor(v)} stroke="#ffffff10" />
                <text x={c * 42 + 25} y={r * 42 + 29} textAnchor="middle" fontSize="10" fill={Math.abs(v) >= 0.55 ? '#0a0a0a' : '#e5e7eb'} fontFamily="ui-monospace, monospace">{v.toFixed(1)}</text>
              </g>
            )))}
          </svg>
        </div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-3">Q(s, a) — four per cell</div>
          <svg viewBox="0 0 220 220" className="w-full h-auto">
            {Qdirs.map((row, r) => row.map((qs, c) => {
              const cx = c * 42 + 25, cy = r * 42 + 25;
              // four triangles: up, right, down, left
              const tri = [
                `M ${cx - 17} ${cy - 17} L ${cx + 17} ${cy - 17} L ${cx} ${cy} Z`,
                `M ${cx + 17} ${cy - 17} L ${cx + 17} ${cy + 17} L ${cx} ${cy} Z`,
                `M ${cx - 17} ${cy + 17} L ${cx + 17} ${cy + 17} L ${cx} ${cy} Z`,
                `M ${cx - 17} ${cy - 17} L ${cx - 17} ${cy + 17} L ${cx} ${cy} Z`,
              ];
              return (
                <g key={`${r}-${c}`}>
                  {qs.map((q, i) => (
                    <path key={i} d={tri[i]} fill={cellColor(q)} stroke="#ffffff10" strokeWidth="0.5" />
                  ))}
                </g>
              );
            }))}
          </svg>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        If you know <Eq>{`\\vl{Q^\\star}`}</Eq>, the optimal policy is free: <Eq>{`\\pl{\\pi^\\star}(\\st{s}) = \\arg\\max_{\\ac{a}} \\vl{Q^\\star(\\st{s}, \\ac{a})}`}</Eq>. A huge slice of RL is just "estimate Q, then act greedy".
      </p>

      <Deeper>
        <p>They relate by:</p>
        <Block>{`\\vl{V^{\\pl{\\pi}}(\\st{s})} = \\sum_{\\ac{a}} \\pl{\\pi}(\\ac{a} \\mid \\st{s}) \\, \\vl{Q^{\\pl{\\pi}}(\\st{s}, \\ac{a})}`}</Block>
        <p>and <Eq>{`\\vl{V^\\star(\\st{s})} = \\max_{\\ac{a}} \\vl{Q^\\star(\\st{s}, \\ac{a})}`}</Eq>.</p>
      </Deeper>
    </Card>
  );
};

// --- 6. Bellman / Value Iteration (HEADLINE) --------------------------------

const SIZE = 5;
const GOAL = [0, 4];
const TRAP = [2, 2];
const ACTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // up right down left
const ACT_LABELS = ['↑', '→', '↓', '←'];

function stepEnv(r, c, a) {
  const [dr, dc] = ACTIONS[a];
  let nr = r + dr, nc = c + dc;
  if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) { nr = r; nc = c; }
  let reward = -0.04;
  let done = false;
  if (nr === GOAL[0] && nc === GOAL[1]) { reward = 1; done = true; }
  if (nr === TRAP[0] && nc === TRAP[1]) { reward = -1; done = true; }
  return { nr, nc, reward, done };
}

const shadeValue = (v) => {
  if (v > 0.02) return `rgba(110,231,183,${Math.min(0.85, Math.abs(v))})`;
  if (v < -0.02) return `rgba(253,164,175,${Math.min(0.85, Math.abs(v))})`;
  return 'rgba(255,255,255,0.03)';
};

const BellmanViz = () => {
  const [V, setV] = useState(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
  const [sweep, setSweep] = useState(0);
  const [gamma, setGamma] = useState(0.9);
  const [delta, setDelta] = useState(null);

  const step = () => {
    const nV = V.map((row) => row.slice());
    let maxDelta = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (r === GOAL[0] && c === GOAL[1]) { nV[r][c] = 1; continue; }
        if (r === TRAP[0] && c === TRAP[1]) { nV[r][c] = -1; continue; }
        let best = -Infinity;
        for (let a = 0; a < 4; a++) {
          const { nr, nc, reward } = stepEnv(r, c, a);
          const q = reward + gamma * V[nr][nc];
          if (q > best) best = q;
        }
        nV[r][c] = best;
        maxDelta = Math.max(maxDelta, Math.abs(best - V[r][c]));
      }
    }
    setV(nV); setSweep((s) => s + 1); setDelta(maxDelta);
  };

  const reset = () => {
    setV(Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
    setSweep(0); setDelta(null);
  };

  // greedy policy arrows
  const arrows = useMemo(() => {
    return V.map((row, r) => row.map((_, c) => {
      if ((r === GOAL[0] && c === GOAL[1]) || (r === TRAP[0] && c === TRAP[1])) return -1;
      let best = -Infinity, bi = 0;
      for (let a = 0; a < 4; a++) {
        const { nr, nc, reward } = stepEnv(r, c, a);
        const q = reward + gamma * V[nr][nc];
        if (q > best) { best = q; bi = a; }
      }
      return bi;
    }));
  }, [V, gamma]);

  return (
    <Card id="bellman" index={6} icon={Layers} title="Bellman Equation & Value Iteration" subtitle="One recursive identity that organizes the whole field." accent="emerald">
      <p>
        The Bellman equation writes the value of a state in terms of the values of its successors. Run it as an assignment (sweep) and you get <em>value iteration</em> — the value of the goal propagates outward one step at a time until the table converges.
      </p>

      <KeyEq note="the optimal Bellman backup — max over actions instead of expectation under π">{
        `\\vl{V^\\star(\\st{s})} = \\max_{\\ac{a}} \\; \\E\\bigl[\\rw{r} + \\hp{\\gamma}\\,\\vl{V^\\star(\\st{s'})} \\mid \\st{s}, \\ac{a}\\bigr]`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
          {V.map((row, r) => row.map((v, c) => {
            const x = c * 60 + 10, y = r * 60 + 10;
            const isGoal = r === GOAL[0] && c === GOAL[1];
            const isTrap = r === TRAP[0] && c === TRAP[1];
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width="58" height="58" fill={shadeValue(v)} stroke={isGoal ? '#fcd34d' : isTrap ? '#f43f5e' : '#ffffff14'} strokeWidth={isGoal || isTrap ? 2 : 1} />
                {!isGoal && !isTrap && arrows[r][c] >= 0 && (
                  <text x={x + 29} y={y + 22} textAnchor="middle" fontSize="18" fill="#c4b5fd" opacity="0.9">{ACT_LABELS[arrows[r][c]]}</text>
                )}
                <text x={x + 29} y={y + 46} textAnchor="middle" fontSize="11" fill={isGoal ? '#fcd34d' : isTrap ? '#fda4af' : '#d1fae5'} fontFamily="ui-monospace, monospace">
                  {isGoal ? '+1' : isTrap ? '−1' : v.toFixed(2)}
                </text>
              </g>
            );
          }))}
        </svg>

        <div className="mt-3 space-y-3">
          <Slider label="γ" value={gamma} onChange={setGamma} min={0.1} max={0.99} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <div className="flex items-center gap-3 text-sm">
            <Button icon={Play} onClick={step} variant="primary">sweep</Button>
            <Button icon={RotateCcw} onClick={reset} variant="ghost">reset</Button>
            <span className="ml-auto text-xs font-mono text-neutral-400">
              sweep = <span className="text-emerald-300">{sweep}</span>
              {delta != null && <> · Δ = <span className="text-emerald-300">{delta.toFixed(4)}</span></>}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Each sweep, every cell grabs the best <Eq>{`\\rw{r} + \\hp{\\gamma}\\,\\vl{V}`}</Eq> from its neighbors. You're watching a fixed-point iteration — the map is a contraction under <Eq>{`\\hp{\\gamma} < 1`}</Eq>, so it always converges to the unique <Eq>{`\\vl{V^\\star}`}</Eq>.
      </p>

      <Deeper>
        <p>Bellman <em>expectation</em> equation (for a fixed policy π):</p>
        <Block>{`\\vl{V^{\\pl{\\pi}}(\\st{s})} = \\sum_{\\ac{a}} \\pl{\\pi}(\\ac{a}|\\st{s}) \\sum_{\\st{s'},\\rw{r}} p(\\st{s'},\\rw{r}|\\st{s},\\ac{a}) \\bigl[\\rw{r} + \\hp{\\gamma}\\,\\vl{V^{\\pl{\\pi}}(\\st{s'})}\\bigr]`}</Block>
        <p>Two close cousins: <em>policy iteration</em> alternates evaluating π and greedy-improving it; <em>value iteration</em> just runs the optimal backup to convergence, then reads off π. Both solve the MDP exactly when you know <Eq>{`p`}</Eq> and <Eq>{`\\rw{r}`}</Eq>.</p>
      </Deeper>
    </Card>
  );
};

/* =============================================================================
   ACT 3 — LEARNING DYNAMICS
   ============================================================================= */

// --- 7. Exploration vs exploitation (HEADLINE) ------------------------------

const BanditExplorer = () => {
  const K = 10;
  const trueMeansRef = useRef(null);
  if (!trueMeansRef.current) {
    trueMeansRef.current = Array.from({ length: K }, () => 1 + Math.random() * 2 - 1);
  }
  const trueMeans = trueMeansRef.current;
  const bestArm = trueMeans.indexOf(Math.max(...trueMeans));
  const bestMean = trueMeans[bestArm];

  const [algo, setAlgo] = useState('eps');
  const [eps, setEps] = useState(0.1);
  const [pulls, setPulls] = useState(Array(K).fill(0));
  const [Qhat, setQhat] = useState(Array(K).fill(0));
  const [step, setStep] = useState(0);
  const [regret, setRegret] = useState([0]);

  const run = (n) => {
    let p = pulls.slice(), q = Qhat.slice(), s = step, reg = regret.slice();
    const R = reg[reg.length - 1];
    let curReg = R;
    for (let i = 0; i < n; i++) {
      s += 1;
      let arm;
      if (algo === 'eps') {
        arm = Math.random() < eps ? Math.floor(Math.random() * K) : q.indexOf(Math.max(...q));
      } else {
        // UCB1
        const c = 2;
        const ucb = q.map((qi, k) => p[k] === 0 ? Infinity : qi + Math.sqrt(c * Math.log(s) / p[k]));
        arm = ucb.indexOf(Math.max(...ucb));
      }
      const r = trueMeans[arm] + (Math.random() * 2 - 1) * 0.5;
      p[arm] += 1;
      q[arm] += (r - q[arm]) / p[arm];
      curReg += bestMean - trueMeans[arm];
      if (s % 2 === 0) reg.push(curReg);
    }
    setPulls(p); setQhat(q); setStep(s); setRegret(reg);
  };

  const reset = () => { setPulls(Array(K).fill(0)); setQhat(Array(K).fill(0)); setStep(0); setRegret([0]); };

  const maxPull = Math.max(1, ...pulls);
  const maxReg = Math.max(1, ...regret);

  return (
    <Card id="exploration" index={7} icon={Dice5} title="Exploration vs Exploitation" subtitle="Try new things, or cash in on what you know?" accent="fuchsia">
      <p>
        Before the agent has explored enough, the best-looking action might not be the best action. ε-greedy picks randomly with probability <Eq>{`\\hp{\\varepsilon}`}</Eq> and greedily otherwise. UCB adds a "how sure are we?" bonus proportional to <Eq>{`\\sqrt{\\log t / n_a}`}</Eq>.
      </p>

      <KeyEq>{`\\pl{\\pi_{\\varepsilon}}(\\ac{a}|\\st{s}) = \\begin{cases}1 - \\hp{\\varepsilon} & \\ac{a} = \\arg\\max_{\\ac{a'}} \\vl{Q(\\st{s},\\ac{a'})} \\\\ \\hp{\\varepsilon} / |\\ac{A}| & \\text{else}\\end{cases}`}</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 text-xs">
            {['eps', 'ucb'].map((k) => (
              <button key={k} onClick={() => { setAlgo(k); reset(); }}
                className={`px-3 py-1 rounded-md transition ${algo === k ? 'bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-400/30' : 'text-neutral-400 hover:text-neutral-100'}`}>
                {k === 'eps' ? 'ε-greedy' : 'UCB1'}
              </button>
            ))}
          </div>
          {algo === 'eps' && (
            <div className="flex-1 min-w-48">
              <Slider label="ε" value={eps} onChange={setEps} min={0} max={0.5} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
            </div>
          )}
        </div>

        {/* arms */}
        <svg viewBox="0 0 560 180" className="w-full h-auto">
          {trueMeans.map((m, k) => {
            const x = 30 + k * 52;
            const h = (Qhat[k] + 1) * 40;
            const hTrue = (m + 1) * 40;
            return (
              <g key={k}>
                <line x1={x + 14} y1={140 - hTrue} x2={x + 30} y2={140 - hTrue} stroke={k === bestArm ? '#fcd34d' : '#64748b'} strokeDasharray="3 3" strokeWidth="1.5" />
                <rect x={x + 6} y={140 - Math.max(h, 0)} width="32" height={Math.abs(h)} fill={k === bestArm ? '#fcd34d' : '#d946ef'} fillOpacity="0.55" stroke={k === bestArm ? '#fcd34d' : '#d946ef'} />
                <text x={x + 22} y="160" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">arm {k}</text>
                <text x={x + 22} y="173" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="ui-monospace, monospace">n={pulls[k]}</text>
              </g>
            );
          })}
          <text x="30" y="20" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">— — true mean</text>
          <text x="150" y="20" fontSize="10" fill="#d946ef" fontFamily="ui-monospace, monospace">▌ estimated Q̂</text>
        </svg>

        {/* regret */}
        <div className="mt-3">
          <svg viewBox={`0 0 560 70`} className="w-full h-16">
            <line x1="30" y1="55" x2="550" y2="55" stroke="#ffffff20" />
            {regret.length > 1 && (
              <polyline fill="none" stroke="#fcd34d" strokeWidth="1.8"
                points={regret.map((r, i) => `${30 + (i / (regret.length - 1)) * 520},${55 - (r / maxReg) * 45}`).join(' ')} />
            )}
            <text x="30" y="12" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">cumulative regret</text>
            <text x="550" y="12" textAnchor="end" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">{regret[regret.length - 1].toFixed(2)}</text>
          </svg>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button icon={Play} onClick={() => run(50)}>+50 pulls</Button>
          <Button icon={Play} onClick={() => run(200)} variant="ghost">+200</Button>
          <Button icon={RotateCcw} onClick={reset} variant="ghost">reset</Button>
          <span className="ml-auto text-xs font-mono text-neutral-400">t = <span className="text-neutral-100">{step}</span></span>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Flat regret = the agent found the best arm and stays there. Linear regret = it's still exploring too much. Sublinear regret (like UCB's <Eq>{`O(\\log t)`}</Eq>) is the gold standard.
      </p>
    </Card>
  );
};

// --- 8. Model-free vs model-based ------------------------------------------

const ModelFreeVsBased = () => (
  <Card id="model-free-based" index={8} icon={Brain} title="Model-Free vs Model-Based" subtitle="Learn to act directly, or learn how the world works first?" accent="violet">
    <p>
      <em>Model-free</em> methods map experience → policy (or values) without ever modeling the environment. <em>Model-based</em> methods learn an approximate <Eq>{`\\hat{p}(\\st{s'}|\\st{s},\\ac{a})`}</Eq> and <Eq>{`\\hat{\\rw{r}}(\\st{s},\\ac{a})`}</Eq>, then <em>plan</em> inside the model.
    </p>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-3">model-free</div>
        <svg viewBox="0 0 260 160" className="w-full h-auto">
          <rect x="10" y="60" width="80" height="40" rx="8" fill="#6ee7b725" stroke="#6ee7b7" />
          <text x="50" y="85" textAnchor="middle" fontSize="11" fill="#6ee7b7">experience</text>
          <path d="M 90 80 L 170 80" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#mfArr)" />
          <defs>
            <marker id="mfArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker>
          </defs>
          <rect x="170" y="60" width="80" height="40" rx="8" fill="#c4b5fd25" stroke="#c4b5fd" />
          <text x="210" y="85" textAnchor="middle" fontSize="11" fill="#c4b5fd">π, Q</text>
          <motion.circle cx="50" cy="80" r="4" fill="#6ee7b7" animate={{ cx: [90, 170, 170], opacity: [1, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">Q-learning, SARSA, REINFORCE, PPO, SAC…</p>
        <p className="text-[11px] text-neutral-500">Sample-hungry, but simple and robust.</p>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mb-3">model-based</div>
        <svg viewBox="0 0 260 160" className="w-full h-auto">
          <rect x="10" y="60" width="80" height="40" rx="8" fill="#6ee7b725" stroke="#6ee7b7" />
          <text x="50" y="85" textAnchor="middle" fontSize="11" fill="#6ee7b7">experience</text>
          <rect x="110" y="20" width="70" height="36" rx="8" fill="#7dd3fc25" stroke="#7dd3fc" />
          <text x="145" y="42" textAnchor="middle" fontSize="11" fill="#7dd3fc">model p̂</text>
          <rect x="110" y="100" width="70" height="36" rx="8" fill="#fcd34d25" stroke="#fcd34d" />
          <text x="145" y="122" textAnchor="middle" fontSize="11" fill="#fcd34d">planner</text>
          <rect x="200" y="60" width="52" height="40" rx="8" fill="#c4b5fd25" stroke="#c4b5fd" />
          <text x="226" y="85" textAnchor="middle" fontSize="11" fill="#c4b5fd">π</text>

          <path d="M 90 80 L 110 50" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M 90 80 L 110 118" stroke="#94a3b8" strokeWidth="1.2" />
          <path d="M 145 56 L 145 100" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M 180 120 L 200 85" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#mfArr)" />
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">Dyna-Q, MPC, world models, MuZero…</p>
        <p className="text-[11px] text-neutral-500">Fewer real samples, but the model can lie.</p>
      </div>
    </div>
  </Card>
);

// --- 9. Monte Carlo vs TD ---------------------------------------------------

const MCvsTD = () => (
  <Card id="mc-vs-td" index={9} icon={GitBranch} title="Monte Carlo vs Temporal Difference" subtitle="Wait for the real return, or bootstrap from the next guess?" accent="sky">
    <p>
      MC updates <Eq>{`\\vl{V(\\st{s})}`}</Eq> using the actual return <Eq>{`G_t`}</Eq> — high variance, unbiased, has to wait until the end of the episode. TD(0) updates from the next step's estimate — lower variance, biased, updates every step.
    </p>

    <KeyEq note="TD error δ drives the update">{
      `\\vl{V(\\st{s_t})} \\leftarrow \\vl{V(\\st{s_t})} + \\hp{\\alpha}\\,\\underbrace{\\bigl[\\rw{r_{t+1}} + \\hp{\\gamma}\\vl{V(\\st{s_{t+1}})} - \\vl{V(\\st{s_t})}\\bigr]}_{\\hp{\\delta_t}}`
    }</KeyEq>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-3">Monte Carlo</div>
        <svg viewBox="0 0 260 120" className="w-full h-auto">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle cx={20 + i * 42} cy="60" r="10" fill={i === 5 ? '#fcd34d55' : '#0f172a'} stroke={i === 5 ? '#fcd34d' : '#7dd3fc'} />
              <text x={20 + i * 42} y="64" textAnchor="middle" fontSize="10" fill={i === 5 ? '#fcd34d' : '#7dd3fc'} fontFamily="ui-monospace, monospace">s{i}</text>
              {i < 5 && <path d={`M ${30 + i * 42} 60 L ${52 + i * 42} 60`} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#mcArr)" />}
            </g>
          ))}
          <defs>
            <marker id="mcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker>
          </defs>
          <motion.path d="M 230 50 Q 125 0 20 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3 3"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }} />
          <text x="125" y="16" textAnchor="middle" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">G₀ pushed back to s₀</text>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500">one big update at episode end</p>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-3">TD(0)</div>
        <svg viewBox="0 0 260 120" className="w-full h-auto">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <circle cx={20 + i * 42} cy="60" r="10" fill={i === 5 ? '#fcd34d55' : '#0f172a'} stroke={i === 5 ? '#fcd34d' : '#7dd3fc'} />
              <text x={20 + i * 42} y="64" textAnchor="middle" fontSize="10" fill={i === 5 ? '#fcd34d' : '#7dd3fc'} fontFamily="ui-monospace, monospace">s{i}</text>
              {i < 5 && <path d={`M ${30 + i * 42} 60 L ${52 + i * 42} 60`} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#mcArr)" />}
            </g>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.path key={i} d={`M ${62 + i * 42} 50 Q ${45 + i * 42} 30 ${28 + i * 42} 50`} fill="none" stroke="#c4b5fd" strokeWidth="1.2"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity }} />
          ))}
          <text x="125" y="20" textAnchor="middle" fontSize="10" fill="#c4b5fd" fontFamily="ui-monospace, monospace">δ pushed one step back, every step</text>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500">many small updates, online</p>
      </div>
    </div>

    <p className="text-sm text-neutral-400">
      The full spectrum is <Eq>{`n`}</Eq>-step TD and <em>eligibility traces</em> (TD(<Eq>{`\\hp{\\lambda}`}</Eq>)), which interpolate between the two ends. Nearly all modern algorithms are TD-style.
    </p>
  </Card>
);

// --- 10. On-policy vs off-policy -------------------------------------------

const OnOffPolicy = () => (
  <Card id="on-off-policy" index={10} icon={Shuffle} title="On-Policy vs Off-Policy" subtitle="Learn from your own behaviour, or from someone else's?" accent="rose">
    <p>
      <em>On-policy</em>: the data you learn from was generated by the policy you're improving (SARSA, REINFORCE, PPO). <em>Off-policy</em>: the behaviour policy <Eq>{`\\pl{\\mu}`}</Eq> that collected the data can differ from the target policy <Eq>{`\\pl{\\pi}`}</Eq> you're learning about (Q-learning, DQN, SAC). Off-policy methods can recycle old data — at the cost of importance-sampling or stability tricks.
    </p>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-3">on-policy</div>
        <svg viewBox="0 0 280 130" className="w-full h-auto">
          <rect x="20" y="45" width="70" height="40" rx="8" fill="#c4b5fd25" stroke="#c4b5fd" />
          <text x="55" y="70" textAnchor="middle" fontSize="11" fill="#c4b5fd">π (target)</text>
          <rect x="180" y="45" width="80" height="40" rx="8" fill="#7dd3fc25" stroke="#7dd3fc" />
          <text x="220" y="70" textAnchor="middle" fontSize="11" fill="#7dd3fc">env</text>
          <motion.path d="M 90 55 Q 135 20 180 55" fill="none" stroke="#f9a8d4" strokeWidth="1.5" markerEnd="url(#onArr)"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.path d="M 180 75 Q 135 110 90 75" fill="none" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#onArr)"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: 1, repeat: Infinity }} />
          <defs><marker id="onArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker></defs>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500">learn about π using data <em>from</em> π</p>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-3">off-policy</div>
        <svg viewBox="0 0 280 130" className="w-full h-auto">
          <rect x="20" y="8" width="80" height="36" rx="8" fill="#fda4af25" stroke="#fda4af" />
          <text x="60" y="30" textAnchor="middle" fontSize="11" fill="#fda4af">μ (behaviour)</text>
          <rect x="20" y="88" width="80" height="36" rx="8" fill="#c4b5fd25" stroke="#c4b5fd" />
          <text x="60" y="110" textAnchor="middle" fontSize="11" fill="#c4b5fd">π (target)</text>
          <rect x="150" y="48" width="80" height="36" rx="8" fill="#6ee7b725" stroke="#6ee7b7" />
          <text x="190" y="70" textAnchor="middle" fontSize="11" fill="#6ee7b7">buffer</text>
          <path d="M 100 26 L 150 56" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#offArr)" />
          <path d="M 150 76 L 100 106" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#offArr)" strokeDasharray="3 2" />
          <defs><marker id="offArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker></defs>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500">learn about π using data from anyone</p>
      </div>
    </div>
  </Card>
);

/* =============================================================================
   ACT 4 — ALGORITHM FAMILIES
   ============================================================================= */

// --- 11. Q-learning (HEADLINE) ----------------------------------------------

const makeEmptyQ = () => Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => [0, 0, 0, 0]));
const QLearningGrid = () => {
  const [alpha, setAlpha] = useState(0.4);
  const [gamma, setGamma] = useState(0.9);
  const [eps, setEps] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [state, setState] = useState(() => ({
    Q: makeEmptyQ(),
    pos: [SIZE - 1, 0],
    episode: 0,
    trail: [],
    returns: [],
  }));
  const { Q, pos, episode, trail, returns } = state;

  const reset = () => {
    setState({ Q: makeEmptyQ(), pos: [SIZE - 1, 0], episode: 0, trail: [], returns: [] });
    setPlaying(false);
  };
  const resetPosOnly = () => setState((s) => ({ ...s, pos: [SIZE - 1, 0], trail: [] }));

  // Keep params in a ref so stepOnce (used in setInterval closure) always reads fresh values.
  const paramsRef = useRef({ alpha, gamma, eps });
  useEffect(() => { paramsRef.current = { alpha, gamma, eps }; }, [alpha, gamma, eps]);

  const stepOnce = useCallback(() => {
    const { alpha: a_, gamma: g_, eps: e_ } = paramsRef.current;
    // Random numbers pulled *outside* the updater so StrictMode's double-invoke
    // doesn't re-sample and change the outcome between invocations.
    const u = Math.random();
    const uAct = Math.random();
    setState((s) => {
      const [r, c] = s.pos;
      let a;
      if (u < e_) {
        a = Math.floor(uAct * 4);
      } else {
        const qs = s.Q[r][c];
        let best = -Infinity, bi = 0;
        qs.forEach((v, i) => { if (v > best) { best = v; bi = i; } });
        a = bi;
      }
      const { nr, nc, reward, done } = stepEnv(r, c, a);
      const nextMax = Math.max(...s.Q[nr][nc]);
      const target = done ? reward : reward + g_ * nextMax;
      const newQ = s.Q.map((row, ri) => ri === r
        ? row.map((cell, ci) => ci === c
          ? cell.map((v, ai) => ai === a ? v + a_ * (target - v) : v)
          : cell)
        : row);
      return {
        Q: newQ,
        pos: done ? [SIZE - 1, 0] : [nr, nc],
        episode: s.episode + (done ? 1 : 0),
        trail: [...s.trail.slice(-40), [r, c]],
        returns: done ? [...s.returns.slice(-99), reward] : s.returns,
      };
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(stepOnce, 180 / speed);
    return () => clearInterval(id);
  }, [playing, speed, stepOnce]);

  return (
    <Card id="q-learning" index={11} icon={Target} title="Q-Learning" subtitle="Bellman, but sampled — the canonical off-policy algorithm." accent="emerald">
      <p>
        Instead of sweeping every cell like value iteration, Q-learning samples a transition <Eq>{`(\\st{s}, \\ac{a}, \\rw{r}, \\st{s'})`}</Eq> from experience and nudges <Eq>{`\\vl{Q(\\st{s},\\ac{a})}`}</Eq> toward the optimal Bellman target. It's off-policy because the update uses <Eq>{`\\max_{\\ac{a'}}`}</Eq>, independent of the behaviour.
      </p>

      <KeyEq>{
        `\\vl{Q(\\st{s}, \\ac{a})} \\leftarrow \\vl{Q(\\st{s}, \\ac{a})} + \\hp{\\alpha}\\bigl[\\rw{r} + \\hp{\\gamma}\\,\\max_{\\ac{a'}}\\vl{Q(\\st{s'}, \\ac{a'})} - \\vl{Q(\\st{s}, \\ac{a})}\\bigr]`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
          {Q.map((row, r) => row.map((qs, c) => {
            const x = c * 60 + 10, y = r * 60 + 10;
            const isGoal = r === GOAL[0] && c === GOAL[1];
            const isTrap = r === TRAP[0] && c === TRAP[1];
            const best = Math.max(...qs);
            const tri = [
              `M ${x + 5} ${y + 5} L ${x + 53} ${y + 5} L ${x + 29} ${y + 29} Z`,
              `M ${x + 53} ${y + 5} L ${x + 53} ${y + 53} L ${x + 29} ${y + 29} Z`,
              `M ${x + 5} ${y + 53} L ${x + 53} ${y + 53} L ${x + 29} ${y + 29} Z`,
              `M ${x + 5} ${y + 5} L ${x + 5} ${y + 53} L ${x + 29} ${y + 29} Z`,
            ];
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width="58" height="58" fill="#0f172a" stroke={isGoal ? '#fcd34d' : isTrap ? '#f43f5e' : '#ffffff10'} strokeWidth={isGoal || isTrap ? 2 : 1} />
                {!isGoal && !isTrap && qs.map((q, i) => (
                  <path key={i} d={tri[i]} fill={shadeValue(q)} stroke="#ffffff10" strokeWidth="0.5" />
                ))}
                {isGoal && <text x={x + 29} y={y + 34} textAnchor="middle" fontSize="14" fill="#fcd34d">+1</text>}
                {isTrap && <text x={x + 29} y={y + 34} textAnchor="middle" fontSize="14" fill="#fda4af">−1</text>}
                {!isGoal && !isTrap && best !== 0 && (
                  <text x={x + 29} y={y + 34} textAnchor="middle" fontSize="10" fill="#e5e7eb" fontFamily="ui-monospace, monospace">{best.toFixed(1)}</text>
                )}
              </g>
            );
          }))}
          {/* trail */}
          {trail.map(([r, c], i) => (
            <circle key={i} cx={c * 60 + 39} cy={r * 60 + 39} r="3" fill="#a78bfa" opacity={i / trail.length} />
          ))}
          {/* agent */}
          <motion.circle cx={pos[1] * 60 + 39} cy={pos[0] * 60 + 39} r="7" fill="#f9a8d4" stroke="#f472b6" strokeWidth="2"
            animate={{ cx: pos[1] * 60 + 39, cy: pos[0] * 60 + 39 }} transition={{ duration: 0.12 }} />
        </svg>

        <div className="mt-3 space-y-2">
          <Slider label="α" value={alpha} onChange={setAlpha} min={0.05} max={1} step={0.05} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <Slider label="ε" value={eps} onChange={setEps} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <Slider label="γ" value={gamma} onChange={setGamma} min={0.5} max={0.99} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button icon={Play} onClick={() => { for (let i = 0; i < 1; i++) stepOnce(); }}>step</Button>
          <Button icon={playing ? Pause : Play} onClick={() => setPlaying((p) => !p)} variant="ghost">{playing ? 'pause' : 'run'}</Button>
          <Button icon={RotateCcw} onClick={reset} variant="danger">reset</Button>
          <Button icon={RotateCcw} onClick={resetPosOnly} variant="ghost">restart ep</Button>
          <span className="ml-auto text-xs font-mono text-neutral-400">ep = <span className="text-emerald-300">{episode}</span></span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
          <Gauge className="w-3.5 h-3.5" />
          <input type="range" min="0.25" max="6" step="0.05" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-24 accent-fuchsia-400" />
          <span className="w-10 text-right font-mono text-neutral-300">{speed.toFixed(2)}×</span>
          <span className="ml-auto text-[10px]">wins: {returns.filter((r) => r > 0).length} / deaths: {returns.filter((r) => r < 0).length}</span>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Crank α, and updates overshoot. Drop ε to zero early, and the agent locks onto the first half-decent path. Running long enough with a decaying ε gets you almost exactly the <Eq>{`\\vl{V^\\star}`}</Eq> from the Bellman card — this is the same optimization, just <em>sampled</em>.
      </p>
    </Card>
  );
};

// --- 12. Policy gradient / REINFORCE (HEADLINE) -----------------------------

const REINFORCEDemo = () => {
  const K = 4;
  // arm rewards (means)
  const trueMeans = useMemo(() => [0.2, 0.5, 1.2, 0.8], []);
  const [theta, setTheta] = useState([0, 0, 0, 0]);
  const [lr, setLr] = useState(0.15);
  const [returns, setReturns] = useState([]);
  const [episode, setEpisode] = useState(0);

  const softmax = (t) => {
    const m = Math.max(...t);
    const ex = t.map((x) => Math.exp(x - m));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map((e) => e / s);
  };
  const probs = softmax(theta);

  const runEpisodes = (n) => {
    let t = theta.slice(); let rs = returns.slice(); let ep = episode;
    for (let i = 0; i < n; i++) {
      const p = softmax(t);
      // sample
      const u = Math.random(); let cum = 0, a = 0;
      for (let k = 0; k < K; k++) { cum += p[k]; if (u < cum) { a = k; break; } }
      const r = trueMeans[a] + (Math.random() * 2 - 1) * 0.3;
      // baseline = running average
      const b = rs.length ? rs.reduce((x, y) => x + y, 0) / rs.length : 0;
      const adv = r - b;
      // ∇θ log π(a|s) for softmax: (1{k=a} - p_k)
      for (let k = 0; k < K; k++) {
        const grad = (k === a ? 1 : 0) - p[k];
        t[k] += lr * adv * grad;
      }
      rs = [...rs.slice(-199), r];
      ep += 1;
    }
    setTheta(t); setReturns(rs); setEpisode(ep);
  };

  const reset = () => { setTheta([0, 0, 0, 0]); setReturns([]); setEpisode(0); };
  const bestArm = trueMeans.indexOf(Math.max(...trueMeans));
  const avgReturn = returns.length ? returns.slice(-40).reduce((a, b) => a + b, 0) / Math.min(40, returns.length) : 0;

  return (
    <Card id="policy-gradient" index={12} icon={TrendingUp} title="Policy Gradient — REINFORCE" subtitle="Nudge the policy in the direction that paid off." accent="pink">
      <p>
        Instead of estimating values, we parameterize the policy <Eq>{`\\pl{\\pi_\\theta}(\\ac{a}|\\st{s})`}</Eq> directly and ascend its expected return. The estimator is stunningly simple: scale the log-prob gradient by the return.
      </p>

      <KeyEq note="REINFORCE — an unbiased estimator of ∇J(θ)">{
        `\\nabla_\\theta \\pl{J(\\theta)} = \\E_{\\pl{\\pi_\\theta}}\\!\\bigl[\\,\\nabla_\\theta \\log \\pl{\\pi_\\theta}(\\ac{a}|\\st{s})\\,(G_t - b)\\,\\bigr]`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 400 160" className="w-full h-auto">
          {probs.map((p, k) => {
            const x = 40 + k * 90;
            const h = p * 110;
            return (
              <g key={k}>
                <rect x={x} y={140 - h} width="60" height={h} fill={k === bestArm ? '#fcd34d' : '#f9a8d4'} fillOpacity="0.7" stroke={k === bestArm ? '#fcd34d' : '#f9a8d4'} />
                <text x={x + 30} y="152" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="ui-monospace, monospace">a{k} · μ={trueMeans[k]}</text>
                <text x={x + 30} y={135 - h} textAnchor="middle" fontSize="11" fill={k === bestArm ? '#fcd34d' : '#f9a8d4'} fontFamily="ui-monospace, monospace">{(p * 100).toFixed(0)}%</text>
              </g>
            );
          })}
          <text x="10" y="20" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">π(a)</text>
        </svg>

        <div className="mt-3 space-y-2">
          <Slider label="lr" value={lr} onChange={setLr} min={0.01} max={0.5} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button icon={Play} onClick={() => runEpisodes(20)}>+20 eps</Button>
          <Button icon={Play} onClick={() => runEpisodes(200)} variant="ghost">+200</Button>
          <Button icon={RotateCcw} onClick={reset} variant="danger">reset</Button>
          <span className="ml-auto text-xs font-mono text-neutral-400">ep = <span className="text-pink-300">{episode}</span> · avg R = <span className="text-pink-300">{avgReturn.toFixed(2)}</span></span>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        The baseline <Eq>{`b`}</Eq> reduces variance without introducing bias — subtracting a state-only number from the return leaves <Eq>{`\\E[\\nabla \\log \\pl{\\pi}\\cdot b] = 0`}</Eq>. Using <Eq>{`\\vl{V(\\st{s})}`}</Eq> as the baseline takes you to actor-critic.
      </p>
    </Card>
  );
};

// --- 13. Actor–Critic -------------------------------------------------------

const ActorCritic = () => (
  <Card id="actor-critic" index={13} icon={Scale} title="Actor–Critic" subtitle="A policy head and a value head, coupled by the TD error." accent="fuchsia">
    <p>
      An <em>actor</em> parameterizes the policy <Eq>{`\\pl{\\pi_\\theta}`}</Eq>; a <em>critic</em> parameterizes a value estimate <Eq>{`\\vl{V_\\phi}`}</Eq>. The TD error <Eq>{`\\hp{\\delta} = \\rw{r} + \\hp{\\gamma}\\vl{V_\\phi(\\st{s'})} - \\vl{V_\\phi(\\st{s})}`}</Eq> acts as the critic's loss <em>and</em> as the advantage term in the actor's policy-gradient update.
    </p>

    <KeyEq>{`\\theta \\leftarrow \\theta + \\hp{\\alpha_\\pi}\\,\\hp{\\delta}\\,\\nabla_\\theta \\log \\pl{\\pi_\\theta}(\\ac{a}|\\st{s}), \\qquad \\phi \\leftarrow \\phi + \\hp{\\alpha_V}\\,\\hp{\\delta}\\,\\nabla_\\phi \\vl{V_\\phi(\\st{s})}`}</KeyEq>

    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <svg viewBox="0 0 520 200" className="w-full h-auto">
        <rect x="40" y="70" width="90" height="60" rx="10" fill="#7dd3fc25" stroke="#7dd3fc" />
        <text x="85" y="95" textAnchor="middle" fontSize="11" fill="#7dd3fc">state</text>
        <text x="85" y="112" textAnchor="middle" fontSize="11" fill="#7dd3fc">s</text>

        <rect x="200" y="20" width="110" height="50" rx="10" fill="#f9a8d425" stroke="#f9a8d4" />
        <text x="255" y="42" textAnchor="middle" fontSize="11" fill="#f9a8d4">actor π_θ</text>
        <text x="255" y="58" textAnchor="middle" fontSize="11" fill="#f9a8d4">a ~ π(·|s)</text>

        <rect x="200" y="130" width="110" height="50" rx="10" fill="#6ee7b725" stroke="#6ee7b7" />
        <text x="255" y="152" textAnchor="middle" fontSize="11" fill="#6ee7b7">critic V_φ</text>
        <text x="255" y="168" textAnchor="middle" fontSize="11" fill="#6ee7b7">V(s)</text>

        <rect x="390" y="70" width="110" height="60" rx="10" fill="#fcd34d25" stroke="#fcd34d" />
        <text x="445" y="94" textAnchor="middle" fontSize="11" fill="#fcd34d">TD error</text>
        <text x="445" y="112" textAnchor="middle" fontSize="11" fill="#fcd34d">δ = r + γV′ − V</text>

        <path d="M 130 95 L 200 45" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#acArr)" />
        <path d="M 130 105 L 200 155" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#acArr)" />
        <path d="M 310 155 L 390 115" stroke="#94a3b8" strokeWidth="1.2" markerEnd="url(#acArr)" />

        <motion.path d="M 390 95 Q 340 60 310 45" fill="none" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#acArrGold)" strokeDasharray="4 3"
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M 390 105 Q 340 140 310 155" fill="none" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#acArrGold)" strokeDasharray="4 3"
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
        <text x="350" y="22" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">update θ (policy grad)</text>
        <text x="350" y="196" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">update φ (value loss)</text>

        <defs>
          <marker id="acArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker>
          <marker id="acArrGold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#fcd34d" /></marker>
        </defs>
      </svg>
    </div>

    <p className="text-sm text-neutral-400">
      <em>A2C / A3C</em> are synchronous and asynchronous variants. <em>PPO</em> adds a clipped surrogate objective so each update can't move <Eq>{`\\pl{\\pi}`}</Eq> too far. <em>GAE</em> smooths <Eq>{`\\hp{\\delta}`}</Eq> across time. All are actor-critic at the core.
    </p>
  </Card>
);

/* =============================================================================
   ACT 5 — DEEP & FRONTIER
   ============================================================================= */

// --- 14. Deep RL leap -------------------------------------------------------

const DeepRLLeap = () => {
  const [rep, setRep] = useState('net');
  return (
    <Card id="deep-rl" index={14} icon={Sparkles} title="The Deep RL Leap" subtitle="From tabular Q(s,a) to a neural network that generalizes." accent="sky">
      <p>
        Tabular Q-learning dies when <Eq>{`|\\st{S}|`}</Eq> explodes — Atari has <Eq>{`\\sim 10^{70{,}000}`}</Eq> possible screens. Deep RL replaces the table with a function approximator <Eq>{`\\vl{Q_\\theta(\\st{s}, \\ac{a})}`}</Eq> or <Eq>{`\\pl{\\pi_\\theta(\\ac{a}|\\st{s})}`}</Eq>. DQN added two stabilizers: a <em>replay buffer</em> breaks correlation in samples, and a <em>target network</em> slows the moving bootstrap target.
      </p>

      <KeyEq note="DQN's squared TD loss, evaluated on mini-batches from the replay buffer">{
        `\\mathcal{L}(\\theta) = \\E_{(\\st{s},\\ac{a},\\rw{r},\\st{s'}) \\sim \\mathcal{D}}\\bigl[\\bigl(\\rw{r} + \\hp{\\gamma}\\max_{\\ac{a'}} \\vl{Q_{\\theta^-}}(\\st{s'},\\ac{a'}) - \\vl{Q_\\theta(\\st{s},\\ac{a})}\\bigr)^2\\bigr]`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/5 border border-white/10 w-max text-xs">
          {[['table', 'tabular Q'], ['net', 'neural Q']].map(([k, l]) => (
            <button key={k} onClick={() => setRep(k)} className={`px-3 py-1 rounded-md ${rep === k ? 'bg-sky-500/20 text-sky-100 border border-sky-400/30' : 'text-neutral-400'}`}>{l}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {rep === 'table' ? (
            <motion.svg key="t" viewBox="0 0 400 160" className="w-full h-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => (
                <rect key={`${r}-${c}`} x={40 + c * 60} y={10 + r * 16} width="56" height="14" fill={`rgba(110,231,183,${0.1 + Math.random() * 0.5})`} stroke="#ffffff15" />
              )))}
              <text x="20" y="30" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace" transform="rotate(-90,20,30)">states</text>
              <text x="200" y="158" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">actions</text>
            </motion.svg>
          ) : (
            <motion.svg key="n" viewBox="0 0 400 160" className="w-full h-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[4, 6, 6, 4].map((n, layer) => Array.from({ length: n }).map((_, i) => {
                const x = 50 + layer * 100;
                const y = 80 + (i - (n - 1) / 2) * 22;
                return <circle key={`${layer}-${i}`} cx={x} cy={y} r="7" fill="#7dd3fc33" stroke="#7dd3fc" />;
              }))}
              {[4, 6, 6, 4].map((n, layer) => {
                if (layer === 3) return null;
                const nxt = [4, 6, 6, 4][layer + 1];
                const x1 = 50 + layer * 100, x2 = 50 + (layer + 1) * 100;
                return Array.from({ length: n }).map((_, i) => Array.from({ length: nxt }).map((_, j) => {
                  const y1 = 80 + (i - (n - 1) / 2) * 22, y2 = 80 + (j - (nxt - 1) / 2) * 22;
                  return <line key={`${layer}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7dd3fc" strokeOpacity="0.12" />;
                }));
              })}
              <text x="50" y="155" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">s</text>
              <text x="350" y="155" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">Q(s,·)</text>
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      <p className="text-sm text-neutral-400">
        PPO, A3C, SAC, MuZero, AlphaZero — every modern headline is "classical RL + deep net + stability trick". The deep part is, mostly, an engineering layer on top of the math we've already seen.
      </p>
    </Card>
  );
};

// --- 15. SAC ---------------------------------------------------------------

const SACCard = () => {
  const [temp, setTemp] = useState(0.5);
  // policy halo: spread by temp
  return (
    <Card id="sac" index={15} icon={Activity} title="SAC — Soft Actor-Critic" subtitle="Maximize reward and entropy. Keep options open." accent="emerald">
      <p>
        SAC adds an entropy bonus to the objective: act to gather reward <em>and</em> keep the policy as uncertain as possible. The tradeoff is controlled by a temperature <Eq>{`\\hp{\\alpha}`}</Eq>. Works great on continuous control (MuJoCo, robots), sample-efficient, and less brittle than deterministic policy gradients.
      </p>

      <KeyEq>{`\\pl{J(\\pi)} = \\E\\!\\left[\\sum_t \\rw{r_t} + \\hp{\\alpha}\\,\\mathcal{H}\\bigl(\\pl{\\pi}(\\cdot|\\st{s_t})\\bigr)\\right]`}</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 400 160" className="w-full h-auto">
          {Array.from({ length: 7 }).map((_, k) => {
            const x = 30 + k * 52;
            // true policy would be peaked around k=3
            const center = 3;
            const spread = 0.4 + temp * 2.0;
            const p = Math.exp(-Math.pow((k - center) / spread, 2));
            const h = p * 110;
            return (
              <g key={k}>
                <rect x={x} y={140 - h} width="34" height={h} fill="#6ee7b7" fillOpacity="0.8" />
                <motion.rect x={x - 3} y={140 - h - 6} width="40" height={h + 12} fill="#6ee7b7" fillOpacity={0.25 * temp} animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 2, repeat: Infinity }} />
                <text x={x + 17} y="155" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="ui-monospace, monospace">a{k}</text>
              </g>
            );
          })}
          <text x="10" y="20" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">π(a|s) — halo ∝ entropy bonus</text>
        </svg>
        <div className="mt-2">
          <Slider label="α (temp)" value={temp} onChange={setTemp} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} accent="emerald" />
          <p className="mt-2 text-[11px] text-neutral-500">low α → sharp, greedy · high α → spread, exploratory</p>
        </div>
      </div>
    </Card>
  );
};

// --- 16. Offline RL ---------------------------------------------------------

const OfflineRL = () => (
  <Card id="offline-rl" index={16} icon={Database} title="Offline RL" subtitle="Learn from a frozen dataset. No new interactions allowed." accent="rose">
    <p>
      Sometimes you <em>can't</em> let the agent run wild — medicine, industrial control, recommendation logs. Offline RL learns <Eq>{`\\pl{\\pi}`}</Eq> from a fixed buffer <Eq>{`\\mathcal{D}`}</Eq>. The core challenge is <em>distribution shift</em>: the learned policy may query actions the data never covered, where <Eq>{`\\vl{Q}`}</Eq>-estimates are wildly wrong. Solutions (CQL, BCQ, IQL) constrain the policy to stay near the data.
    </p>

    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <svg viewBox="0 0 480 150" className="w-full h-auto">
        <rect x="30" y="45" width="110" height="60" rx="10" fill="#6ee7b725" stroke="#6ee7b7" />
        <text x="85" y="72" textAnchor="middle" fontSize="11" fill="#6ee7b7">fixed buffer</text>
        <text x="85" y="89" textAnchor="middle" fontSize="11" fill="#6ee7b7">𝒟</text>
        <path d="M 140 75 L 220 75" stroke="#94a3b8" markerEnd="url(#offRlArr)" />
        <rect x="220" y="45" width="110" height="60" rx="10" fill="#c4b5fd25" stroke="#c4b5fd" />
        <text x="275" y="72" textAnchor="middle" fontSize="11" fill="#c4b5fd">learner</text>
        <text x="275" y="89" textAnchor="middle" fontSize="11" fill="#c4b5fd">π*, Q*</text>
        {/* env crossed out */}
        <rect x="360" y="45" width="110" height="60" rx="10" fill="#1f293740" stroke="#f43f5e" strokeDasharray="4 3" />
        <text x="415" y="80" textAnchor="middle" fontSize="11" fill="#fda4af">no env access</text>
        <line x1="360" y1="45" x2="470" y2="105" stroke="#f43f5e" strokeWidth="1.5" />
        <line x1="470" y1="45" x2="360" y2="105" stroke="#f43f5e" strokeWidth="1.5" />
        <defs><marker id="offRlArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker></defs>
      </svg>
    </div>
  </Card>
);

// --- 17. World models -------------------------------------------------------

const WorldModels = () => {
  // Imagined rollout tree — branching futures inside the model.
  // Real rollout — a single chain.
  const imag = useMemo(() => {
    const nodes = [{ id: 'r0', x: 80, y: 95, depth: 0, parent: null }];
    const add = (parent, depth, yOff) => {
      const id = `n${nodes.length}`;
      const px = parent.x + 52, py = parent.y + yOff;
      nodes.push({ id, x: px, y: py, depth, parent: parent.id });
      return nodes[nodes.length - 1];
    };
    const lvl1 = [add(nodes[0], 1, -34), add(nodes[0], 1, -6), add(nodes[0], 1, 22), add(nodes[0], 1, 50)];
    lvl1.forEach((n, i) => {
      const offs = [-14, 14];
      offs.forEach((o) => add(n, 2, o));
    });
    return nodes;
  }, []);
  const real = [0, 1, 2, 3].map((i) => ({ x: 80 + i * 52, y: 95 }));

  return (
    <Card id="world-models" index={17} icon={Cloud} title="World Models" subtitle="Dream inside a learned simulator. One real step, a hundred imagined ones." accent="violet">
      <p>
        A world model is a learned dynamics function <Eq>{`\\hat{p}(\\st{s_{t+1}}|\\st{s_t},\\ac{a_t})`}</Eq>. The agent can generate many cheap rollouts inside its head, updating <Eq>{`\\pl{\\pi}`}</Eq> from imagined experience, and only occasionally spends a real interaction. The payoff is sample efficiency: one real step "costs" as much as thousands of imagined ones. Dreamer, PlaNet, MuZero.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 560 230" className="w-full h-auto">
          <defs>
            <marker id="wmArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L10,5 L0,10" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Imagined side (left) */}
          <g>
            <motion.rect x="20" y="20" width="260" height="190" rx="18" fill="#c4b5fd12" stroke="#c4b5fd" strokeDasharray="4 4"
              animate={{ opacity: [0.55, 0.95, 0.55] }} transition={{ duration: 3, repeat: Infinity }} />
            <text x="40" y="38" fontSize="11" fill="#c4b5fd" fontFamily="ui-monospace, monospace">imagined in p̂ (cheap)</text>

            {/* edges */}
            {imag.map((n) => {
              if (!n.parent) return null;
              const p = imag.find((m) => m.id === n.parent);
              return <path key={`e-${n.id}`} d={`M ${p.x} ${p.y} L ${n.x} ${n.y}`} stroke="#c4b5fd" strokeOpacity="0.45" strokeWidth="1" />;
            })}
            {/* nodes */}
            {imag.map((n) => (
              <motion.circle key={n.id} cx={n.x} cy={n.y} r={n.depth === 0 ? 8 : 4}
                fill={n.depth === 0 ? '#c4b5fd' : '#c4b5fd88'} stroke="#c4b5fd"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, delay: n.depth * 0.25, repeat: Infinity }} />
            ))}
            <text x="80" y="180" fontSize="9" fill="#a78bfa" fontFamily="ui-monospace, monospace" textAnchor="middle">ŝ₀ (current)</text>
            <text x="240" y="180" fontSize="9" fill="#a78bfa" fontFamily="ui-monospace, monospace" textAnchor="middle">hypothetical futures</text>
          </g>

          {/* Real side (right) */}
          <g>
            <rect x="300" y="20" width="240" height="190" rx="18" fill="#6ee7b710" stroke="#6ee7b755" />
            <text x="320" y="38" fontSize="11" fill="#6ee7b7" fontFamily="ui-monospace, monospace">real env (expensive)</text>

            {real.map((n, i) => (
              <g key={i}>
                <circle cx={n.x + 240} cy={n.y} r={i === 0 ? 8 : 6} fill={i === 0 ? '#6ee7b7' : '#6ee7b788'} stroke="#6ee7b7" />
                {i < real.length - 1 && (
                  <path d={`M ${n.x + 240 + 8} ${n.y} L ${real[i + 1].x + 240 - 8} ${real[i + 1].y}`} stroke="#6ee7b7" strokeWidth="1.4" markerEnd="url(#wmArr)" />
                )}
              </g>
            ))}
            <text x="320" y="180" fontSize="9" fill="#6ee7b7" fontFamily="ui-monospace, monospace">one trajectory per real step</text>
          </g>

          {/* sync arrow */}
          <motion.path d="M 100 112 Q 290 20 360 95" fill="none" stroke="#fcd34d" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#wmArr)"
            animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
          <text x="230" y="60" fontSize="9" fill="#fcd34d" fontFamily="ui-monospace, monospace" textAnchor="middle">occasionally step the real world</text>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500 text-center">hundreds of imagined rollouts fan out for every real interaction</p>
      </div>
    </Card>
  );
};

// --- 18. Multi-agent --------------------------------------------------------

const MultiAgent = () => {
  const GRID = 6;
  const CELL = 40;
  const [state, setState] = useState({
    pred: [0, 0],
    prey: [GRID - 1, GRID - 1],
    catches: 0,
    flash: null, // null | 'caught'
  });

  useEffect(() => {
    const id = setInterval(() => {
      const r = [Math.random(), Math.random(), Math.random(), Math.random()];
      setState((s) => {
        // after a catch frame, reset to fresh random positions
        if (s.flash === 'caught') {
          let pr = [Math.floor(r[0] * GRID), Math.floor(r[1] * GRID)];
          let py = [Math.floor(r[2] * GRID), Math.floor(r[3] * GRID)];
          // avoid spawning overlapping
          if (pr[0] === py[0] && pr[1] === py[1]) py = [(py[0] + 2) % GRID, (py[1] + 3) % GRID];
          return { pred: pr, prey: py, catches: s.catches, flash: null };
        }
        const { pred, prey } = s;

        // predator: greedy step toward prey (Manhattan)
        const dr = prey[0] - pred[0];
        const dc = prey[1] - pred[1];
        let newPred;
        if (Math.abs(dr) > Math.abs(dc)) newPred = [pred[0] + Math.sign(dr), pred[1]];
        else if (Math.abs(dc) > Math.abs(dr)) newPred = [pred[0], pred[1] + Math.sign(dc)];
        else newPred = r[0] < 0.5 ? [pred[0] + Math.sign(dr || 1), pred[1]] : [pred[0], pred[1] + Math.sign(dc || 1)];

        if (newPred[0] === prey[0] && newPred[1] === prey[1]) {
          return { ...s, pred: newPred, catches: s.catches + 1, flash: 'caught' };
        }

        // prey: pick neighbour that maximises Manhattan distance to (new) predator
        const cands = [[-1, 0], [1, 0], [0, -1], [0, 1], [0, 0]]
          .map(([a, b]) => [prey[0] + a, prey[1] + b])
          .filter(([a, b]) => a >= 0 && a < GRID && b >= 0 && b < GRID);
        const dists = cands.map(([a, b]) => Math.abs(a - newPred[0]) + Math.abs(b - newPred[1]));
        const best = Math.max(...dists);
        const bestMoves = cands.filter((_, i) => dists[i] === best);
        const newPrey = bestMoves[Math.floor(r[1] * bestMoves.length)];

        return { ...s, pred: newPred, prey: newPrey };
      });
    }, 520);
    return () => clearInterval(id);
  }, []);

  const size = GRID * CELL;
  const cx = (c) => c * CELL + CELL / 2;
  const cy = (r) => r * CELL + CELL / 2;

  return (
    <Card id="multi-agent" index={18} icon={Users} title="Multi-Agent RL" subtitle="When the environment has other minds in it." accent="amber">
      <p>
        With multiple agents, the environment is non-stationary from each agent's point of view — everyone else is also learning. Cooperative (team reward), competitive (zero-sum), or mixed. Solution concepts shift from "optimal policy" to <em>Nash equilibria</em>, correlated equilibria, or self-play fixed points. AlphaStar, Dota-2 OpenAI Five, Diplomacy, emergent communication — all MARL.
      </p>
      <div className="rounded-xl bg-black/40 border border-white/10 p-4 flex flex-col items-center">
        <div className="flex items-center gap-5 mb-3 text-[11px] font-mono flex-wrap justify-center">
          <span className="text-fuchsia-300">● predator  r = +1 on catch</span>
          <span className="text-sky-300">● prey  r = −1 on caught</span>
          <span className="text-amber-300">catches: {state.catches}</span>
        </div>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] h-auto">
          {/* grid */}
          {Array.from({ length: GRID }).map((_, r) =>
            Array.from({ length: GRID }).map((_, c) => (
              <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL}
                fill={(r + c) % 2 === 0 ? '#ffffff05' : 'transparent'} stroke="#ffffff12" />
            ))
          )}
          {/* tension line between the two */}
          <line
            x1={cx(state.pred[1])} y1={cy(state.pred[0])}
            x2={cx(state.prey[1])} y2={cy(state.prey[0])}
            stroke={state.flash === 'caught' ? '#fcd34d' : '#ffffff20'}
            strokeWidth={state.flash === 'caught' ? 3 : 1}
            strokeDasharray="2 4"
          />
          {/* prey */}
          <motion.circle
            r={CELL * 0.24}
            fill="#7dd3fc30"
            stroke="#7dd3fc"
            strokeWidth="2"
            initial={false}
            animate={{
              cx: cx(state.prey[1]),
              cy: cy(state.prey[0]),
              scale: state.flash === 'caught' ? [1, 1.6, 0] : 1,
              opacity: state.flash === 'caught' ? [1, 1, 0] : 1,
            }}
            transition={{ duration: 0.4 }}
          />
          {/* predator */}
          <motion.circle
            r={CELL * 0.3}
            fill="#f0abfc35"
            stroke="#f0abfc"
            strokeWidth="2"
            initial={false}
            animate={{ cx: cx(state.pred[1]), cy: cy(state.pred[0]) }}
            transition={{ duration: 0.4 }}
          />
        </svg>
        <p className="mt-3 text-[11px] text-neutral-500 text-center max-w-md">
          zero-sum pursuit: predator chases, prey flees. each treats the other as part of its environment — but that environment is <em>also a policy learning to beat you</em>. the ground keeps moving.
        </p>
      </div>
    </Card>
  );
};

// --- 19. Inverse RL ---------------------------------------------------------

const InverseRL = () => (
  <Card id="inverse-rl" index={19} icon={Rewind} title="Inverse RL" subtitle="Reverse the arrow — infer the reward from the behaviour." accent="pink">
    <p>
      Normal RL: given <Eq>{`\\rw{r}`}</Eq>, find <Eq>{`\\pl{\\pi^\\star}`}</Eq>. Inverse RL: given expert trajectories <Eq>{`\\tau^*`}</Eq>, infer a reward function <Eq>{`\\rw{\\hat r}`}</Eq> that makes the expert optimal. Useful when the task is easy to <em>demonstrate</em> but hard to specify numerically: driving, manipulation, ethics-laden choices. GAIL / AIRL blend IRL with adversarial training.
    </p>
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <svg viewBox="0 0 460 150" className="w-full h-auto">
        <rect x="20" y="45" width="100" height="60" rx="10" fill="#f9a8d425" stroke="#f9a8d4" />
        <text x="70" y="70" textAnchor="middle" fontSize="11" fill="#f9a8d4">expert τ*</text>
        <text x="70" y="87" textAnchor="middle" fontSize="11" fill="#f9a8d4">trajectories</text>
        <path d="M 120 75 L 180 75" stroke="#94a3b8" markerEnd="url(#irlArr)" />
        <rect x="180" y="45" width="100" height="60" rx="10" fill="#fcd34d25" stroke="#fcd34d" />
        <text x="230" y="72" textAnchor="middle" fontSize="11" fill="#fcd34d">reward r̂</text>
        <text x="230" y="89" textAnchor="middle" fontSize="11" fill="#fcd34d">(inferred)</text>
        <path d="M 280 75 L 340 75" stroke="#94a3b8" markerEnd="url(#irlArr)" />
        <rect x="340" y="45" width="100" height="60" rx="10" fill="#c4b5fd25" stroke="#c4b5fd" />
        <text x="390" y="80" textAnchor="middle" fontSize="11" fill="#c4b5fd">policy π</text>
        <motion.path d="M 340 120 Q 230 150 120 120" fill="none" stroke="#94a3b880" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#irlArr)"
          animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2.6, repeat: Infinity }} />
        <text x="230" y="140" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="ui-monospace, monospace">reverse of standard RL</text>
        <defs><marker id="irlArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker></defs>
      </svg>
    </div>
  </Card>
);

// --- 20. RLHF ---------------------------------------------------------------

const RLHFCard = () => {
  const [kl, setKl] = useState(0.3);
  const [rm, setRm] = useState(0.8);
  // policy drift vs reference, affected by kl and rm
  const drift = (1 - kl) * rm * 0.85;
  return (
    <Card id="rlhf" index={20} icon={MessageSquare} title="RLHF" subtitle="Turn human preferences into a scalar reward, then PPO." accent="fuchsia">
      <p>
        The dominant post-training recipe for LLMs. Collect preference pairs (A vs B), train a <em>reward model</em> <Eq>{`\\rw{r_\\phi}(\\st{s})`}</Eq> to score completions, then fine-tune the policy with PPO, plus a KL penalty back to the reference model so it doesn't forget how to speak.
      </p>

      <KeyEq note="the KL term is the leash that prevents reward-hacking drift">{
        `\\max_{\\pl{\\pi}}\\; \\E_{\\st{s}\\sim\\pl{\\pi}}\\bigl[\\,\\rw{r_\\phi(\\st{s})}\\,\\bigr] \\;-\\; \\hp{\\beta}\\,\\mathrm{KL}\\!\\left(\\pl{\\pi}\\,\\Vert\\,\\pl{\\pi_{\\text{ref}}}\\right)`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 520 170" className="w-full h-auto">
          <defs>
            <marker id="rlhfArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10" fill="#94a3b8" /></marker>
          </defs>
          <rect x="10" y="60" width="70" height="50" rx="8" fill="#7dd3fc25" stroke="#7dd3fc" />
          <text x="45" y="82" textAnchor="middle" fontSize="10" fill="#7dd3fc">prompts</text>
          <text x="45" y="98" textAnchor="middle" fontSize="10" fill="#7dd3fc">𝒟</text>
          <path d="M 80 85 L 110 85" stroke="#94a3b8" markerEnd="url(#rlhfArr)" />
          <rect x="110" y="40" width="70" height="90" rx="8" fill="#c4b5fd25" stroke="#c4b5fd" />
          <text x="145" y="62" textAnchor="middle" fontSize="10" fill="#c4b5fd">policy</text>
          <text x="145" y="76" textAnchor="middle" fontSize="10" fill="#c4b5fd">π_θ</text>
          <text x="145" y="100" textAnchor="middle" fontSize="9" fill="#a78bfa">A / B</text>
          <path d="M 180 70 L 215 55" stroke="#94a3b8" markerEnd="url(#rlhfArr)" />
          <path d="M 180 100 L 215 115" stroke="#94a3b8" markerEnd="url(#rlhfArr)" />
          <rect x="215" y="25" width="80" height="50" rx="8" fill="#f9a8d425" stroke="#f9a8d4" />
          <text x="255" y="50" textAnchor="middle" fontSize="10" fill="#f9a8d4">human</text>
          <text x="255" y="64" textAnchor="middle" fontSize="10" fill="#f9a8d4">prefers A</text>
          <rect x="215" y="95" width="80" height="50" rx="8" fill="#fcd34d25" stroke="#fcd34d" />
          <text x="255" y="120" textAnchor="middle" fontSize="10" fill="#fcd34d">reward r_φ</text>
          <text x="255" y="134" textAnchor="middle" fontSize="10" fill="#fcd34d">(trained)</text>
          <path d="M 295 55 L 295 95" stroke="#94a3b8" strokeDasharray="3 2" markerEnd="url(#rlhfArr)" />
          <path d="M 295 120 L 420 90" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#rlhfArr)" />
          <rect x="420" y="60" width="90" height="50" rx="8" fill="#6ee7b725" stroke="#6ee7b7" />
          <text x="465" y="82" textAnchor="middle" fontSize="10" fill="#6ee7b7">PPO update</text>
          <text x="465" y="98" textAnchor="middle" fontSize="10" fill="#6ee7b7">π_θ</text>
          <motion.path d="M 420 100 Q 290 160 145 130" fill="none" stroke="#f472b6" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#rlhfArr)"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <text x="270" y="162" textAnchor="middle" fontSize="9" fill="#f472b6" fontFamily="ui-monospace, monospace">gradient flow</text>
        </svg>

        <div className="mt-3 space-y-2">
          <Slider label="β (KL)" value={kl} onChange={setKl} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <Slider label="r_φ conf" value={rm} onChange={setRm} min={0} max={1} step={0.01} fmt={(v) => v.toFixed(2)} accent="amber" />
          <div className="mt-2 rounded-lg bg-white/[0.03] border border-white/10 p-3">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1">
              <span>π_ref</span>
              <span>π_θ</span>
            </div>
            <div className="relative h-4 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 bg-sky-400/50" style={{ width: '8px' }} />
              <motion.div className="absolute top-0 bottom-0 bg-fuchsia-400" style={{ width: '8px' }}
                animate={{ left: `${8 + drift * 85}%` }} transition={{ type: 'spring', stiffness: 80 }} />
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">
              {kl > 0.7 ? 'heavy KL — policy barely moves' : kl < 0.15 ? 'weak KL — policy can reward-hack' : 'balanced — learns without drift'}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Cousins: <em>DPO</em> (skips the reward model; optimizes preferences directly), <em>RLAIF</em> (AI-rated preferences), <em>Constitutional AI</em> (rule-based self-critique). Same conceptual skeleton, different places to put the human.
      </p>
    </Card>
  );
};

/* =============================================================================
   FOOTER — deep-dive index
   ============================================================================= */

const DEEP_DIVES = [
  { slug: 'agent-loop', label: 'Agent–environment loop' },
  { slug: 'mdp', label: 'MDPs & POMDPs' },
  { slug: 'return-gamma', label: 'Return & discount' },
  { slug: 'policy', label: 'Policies' },
  { slug: 'values', label: 'Value functions' },
  { slug: 'bellman', label: 'Bellman / value iteration' },
  { slug: 'exploration', label: 'Exploration (bandits, UCB, Thompson)' },
  { slug: 'model-free-based', label: 'Model-free vs model-based' },
  { slug: 'mc-vs-td', label: 'Monte Carlo vs TD' },
  { slug: 'on-off-policy', label: 'On-policy vs off-policy' },
  { slug: 'q-learning', label: 'Q-learning & SARSA' },
  { slug: 'policy-gradient', label: 'Policy gradient' },
  { slug: 'actor-critic', label: 'Actor-critic, A2C, PPO' },
  { slug: 'deep-rl', label: 'Deep RL & DQN' },
  { slug: 'sac', label: 'SAC & entropy regularization' },
  { slug: 'offline-rl', label: 'Offline RL' },
  { slug: 'world-models', label: 'World models, Dreamer, MuZero' },
  { slug: 'multi-agent', label: 'Multi-agent RL' },
  { slug: 'inverse-rl', label: 'Inverse RL & GAIL' },
  { slug: 'rlhf', label: 'RLHF, DPO, RLAIF' },
];

const Footer = () => (
  <div className="max-w-3xl mx-auto mt-16 mb-24 px-4">
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-violet-500/10 to-fuchsia-500/10 border border-white/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-emerald-300/80 mb-3">
        <ListChecks className="w-4 h-4" />
        <span>want to go deeper?</span>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-neutral-50 mb-4">Per-concept deep dives</h3>
      <p className="text-sm text-neutral-400 mb-6">
        Each concept on this page gets its own dedicated explainer, on demand — with full interactive toys, proofs, and working algorithmic playgrounds.
      </p>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {DEEP_DIVES.map((d) => (
          <li key={d.slug} className="flex items-center justify-between text-sm">
            <a href={`#${d.slug}`} className="text-neutral-200 hover:text-emerald-200 transition-colors flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              {d.label}
            </a>
            <span className="text-[10px] uppercase tracking-widest text-neutral-600">coming soon</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/* =============================================================================
   TOP-LEVEL LAYOUT
   ============================================================================= */

export default function ReinforcementLearningExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <ActHeader id="act-1" n="I" title="The Setup" blurb="Agent, environment, reward. The minimum viable world." />
        <AgentLoop />
        <MDPCard />
        <ReturnGamma />
        <PolicyCard />

        <ActHeader id="act-2" n="II" title="Value & Optimality" blurb="Scoring states and actions, and the equation that ties them together." />
        <ValueFunctions />
        <BellmanViz />

        <ActHeader id="act-3" n="III" title="Learning Dynamics" blurb="How the agent actually gets better — the dimensions every RL algorithm lives on." />
        <BanditExplorer />
        <ModelFreeVsBased />
        <MCvsTD />
        <OnOffPolicy />

        <ActHeader id="act-4" n="IV" title="Algorithm Families" blurb="Three canonical shapes: value, policy, and both at once." />
        <QLearningGrid />
        <REINFORCEDemo />
        <ActorCritic />

        <ActHeader id="act-5" n="V" title="Deep & Frontier" blurb="Where the field is right now. Most of your reading will live here." />
        <DeepRLLeap />
        <SACCard />
        <OfflineRL />
        <WorldModels />
        <MultiAgent />
        <InverseRL />
        <RLHFCard />
      </main>

      <Footer />
    </div>
  );
}
