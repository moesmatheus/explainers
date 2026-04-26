import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Network, Waves, Gauge, RefreshCw, Scale, Clock, TrendingUp, TrendingDown,
  Repeat, Target, Layers, Eye, Lightbulb, AlertTriangle, Flame, Leaf,
  Hourglass, Zap, GitBranch, Users, Ship, Trees, ChevronDown, ChevronRight,
  FlaskConical, Play, Pause, RotateCcw, Plus, Minus, ArrowDown, ArrowUp,
  CircleDot, Compass, ListChecks, BookOpen, Sparkles, Activity, Droplet,
  Thermometer, Brain, MousePointerClick,
} from 'lucide-react';

/* ============================================================================
   Systems Thinking — an interactive overview
   Single-file React component. Dark. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives (KaTeX with a systems-thinking color palette) ---------
// NOTE: inside macro bodies, '#' must be doubled to '##' to escape it.
const KATEX_MACROS = {
  '\\sk':  '\\textcolor{##7dd3fc}{#1}',   // stocks — sky
  '\\fw':  '\\textcolor{##f9a8d4}{#1}',   // flows — pink
  '\\rf':  '\\textcolor{##fcd34d}{#1}',   // reinforcing — amber
  '\\bl':  '\\textcolor{##6ee7b7}{#1}',   // balancing — emerald
  '\\dl':  '\\textcolor{##c4b5fd}{#1}',   // delays — violet
  '\\nl':  '\\textcolor{##fda4af}{#1}',   // nonlinearity — rose
  '\\lv':  '\\textcolor{##f0abfc}{#1}',   // leverage — fuchsia
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
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/20',    from: 'from-cyan-500/15' },
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

const Button = ({ children, onClick, icon: Icon, variant = 'primary', disabled, active }) => {
  const styles = {
    primary: 'bg-sky-500/15 border-sky-400/30 hover:bg-sky-500/25 text-sky-100',
    ghost:   'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-200',
    danger:  'bg-rose-500/10 border-rose-400/20 hover:bg-rose-500/20 text-rose-200',
    good:    'bg-emerald-500/10 border-emerald-400/20 hover:bg-emerald-500/20 text-emerald-200',
    warm:    'bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/20 text-amber-200',
  }[variant];
  const activeCls = active ? 'ring-2 ring-offset-0 ring-sky-400/40' : '';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${activeCls}`}
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
  const accentClass = { sky: 'accent-sky-400', violet: 'accent-violet-400', amber: 'accent-amber-400', emerald: 'accent-emerald-400', fuchsia: 'accent-fuchsia-400', rose: 'accent-rose-400', cyan: 'accent-cyan-400' }[accent];
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-neutral-400 text-xs w-24 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className={`flex-1 ${accentClass}`} />
      <span className="text-neutral-300 text-xs w-16 text-right font-mono">{fmt ? fmt(value) : value}</span>
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

// Small list primitive used everywhere
const ListRow = ({ icon: Icon, title, children, accent = 'sky' }) => {
  const a = accentMap[accent];
  return (
    <li className="flex gap-3 items-start">
      {Icon && <span className={`shrink-0 mt-0.5 inline-flex items-center justify-center rounded-md w-6 h-6 bg-white/5 border ${a.border}`}><Icon className={`w-3.5 h-3.5 ${a.text}`} /></span>}
      <div className="flex-1">
        {title && <span className={`font-medium ${a.text}`}>{title}</span>}
        {title && children && <span className="text-neutral-300"> — {children}</span>}
        {!title && <span className="text-neutral-300">{children}</span>}
      </div>
    </li>
  );
};

// --- hero field: interconnected pulsing nodes -------------------------------

const NodeField = () => {
  const nodes = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      r: Math.random() * 1.2 + 0.6,
      d: Math.random() * 4 + 3,
    })), []);
  const edges = useMemo(() => {
    const es = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < 25) es.push([i, j]);
      }
    }
    return es;
  }, [nodes]);
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="stGlow">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([i, j], k) => (
        <motion.line
          key={k}
          x1={nodes[i].x} y1={nodes[i].y}
          x2={nodes[j].x} y2={nodes[j].y}
          stroke="#7dd3fc"
          strokeOpacity="0.12"
          strokeWidth="0.15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 + (k % 3), delay: k * 0.1 }}
        />
      ))}
      {nodes.map((n) => (
        <motion.circle
          key={n.id}
          cx={n.x} cy={n.y} r={n.r}
          fill="url(#stGlow)"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: n.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
};

// --- hero + nav -------------------------------------------------------------

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <NodeField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Network className="w-3.5 h-3.5" /> an interactive overview
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-transparent">
          Systems Thinking
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          The world is not a chain of events. It is a web of stocks, flows, and loops — and most of what surprises you is the structure you didn't see.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">stocks</span>
          <span className="text-pink-300">flows</span>
          <span className="text-amber-300">reinforcing</span>
          <span className="text-emerald-300">balancing</span>
          <span className="text-violet-300">delays</span>
          <span className="text-rose-300">nonlinearity</span>
          <span className="text-fuchsia-300">leverage</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const ACTS = [
  { id: 'act-1', label: 'Seeing systems' },
  { id: 'act-2', label: 'Feedback loops' },
  { id: 'act-3', label: 'Reading systems' },
  { id: 'act-4', label: 'Changing systems' },
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
      <nav className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1.5 text-xs">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`group flex items-center gap-2 py-1 pl-3 pr-3 rounded-lg border transition-colors ${active === a.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                <span className="font-mono tabular-nums text-[10px] opacity-60">0{i + 1}</span>
                <span className="tracking-wide">{a.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="lg:hidden sticky top-0 z-20 backdrop-blur-md bg-neutral-950/70 border-b border-white/10 overflow-x-auto">
        <ul className="flex gap-1 px-3 py-2 text-[11px] whitespace-nowrap">
          {ACTS.map((a, i) => (
            <li key={a.id}>
              <a href={`#${a.id}`} className={`block px-3 py-1.5 rounded-md border ${active === a.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-400'}`}>
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
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-sky-300/80 font-mono">
      <span>act {n}</span>
      <span className="h-px w-10 bg-sky-400/30" />
    </div>
    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-50">{title}</h2>
    {blurb && <p className="text-neutral-400 max-w-2xl">{blurb}</p>}
  </div>
);

/* =============================================================================
   ACT 1 — SEEING SYSTEMS
   ============================================================================= */

// --- 1. Linear vs circular (HEADLINE) ---------------------------------------

const LinearVsCircular = () => {
  const [mode, setMode] = useState('linear');
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 5), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <Card id="linear-vs-circular" index={1} icon={Network} title="Linear vs Circular Causation" subtitle="The mental shift that starts everything." accent="sky">
      <p>
        Most of us are taught to think in <em>chains</em>: cause <Eq>{`\\to`}</Eq> effect, problem <Eq>{`\\to`}</Eq> fix, input <Eq>{`\\to`}</Eq> output. That works for billiard balls. It fails for almost everything interesting: economies, ecosystems, organizations, bodies, minds. In those, effects loop back and become causes. <strong>Systems thinking is the discipline of tracking those loops.</strong>
      </p>

      <div className="flex gap-2">
        <Button variant={mode === 'linear' ? 'primary' : 'ghost'} onClick={() => setMode('linear')} icon={ArrowUp}>linear view</Button>
        <Button variant={mode === 'systems' ? 'primary' : 'ghost'} onClick={() => setMode('systems')} icon={RefreshCw}>systems view</Button>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 600 240" className="w-full h-auto">
          <defs>
            <marker id="lvcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#7dd3fc" />
            </marker>
            <marker id="lvcArrW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
          </defs>

          <AnimatePresence mode="wait">
            {mode === 'linear' ? (
              <motion.g key="linear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {['cause', 'A', 'B', 'C', 'effect'].map((lbl, i) => (
                  <g key={i}>
                    <rect x={20 + i * 115} y="95" width="90" height="50" rx="10" fill={i === pulse ? '#0c4a6e' : '#0f172a'} stroke="#7dd3fc" strokeOpacity={i === pulse ? 1 : 0.4} strokeWidth="1.5" />
                    <text x={65 + i * 115} y="125" textAnchor="middle" fontSize="12" fill="#7dd3fc" fontFamily="ui-monospace, monospace">{lbl}</text>
                    {i < 4 && <line x1={110 + i * 115} y1="120" x2={135 + i * 115} y2="120" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#lvcArrW)" />}
                  </g>
                ))}
                <text x="300" y="45" textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="ui-monospace, monospace">each arrow fires once, then it's over</text>
                <text x="300" y="200" textAnchor="middle" fontSize="11" fill="#f87171">works for: a falling domino, a thrown ball, a recipe</text>
              </motion.g>
            ) : (
              <motion.g key="systems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                {/* Four nodes in a loop with cross-links */}
                {[
                  { x: 150, y: 70,  label: 'A' },
                  { x: 450, y: 70,  label: 'B' },
                  { x: 450, y: 180, label: 'C' },
                  { x: 150, y: 180, label: 'D' },
                ].map((n, i) => (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r="28" fill={i === pulse % 4 ? '#0c4a6e' : '#0f172a'} stroke="#7dd3fc" strokeWidth="1.5" />
                    <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="14" fill="#7dd3fc" fontFamily="ui-monospace, monospace">{n.label}</text>
                  </g>
                ))}
                {/* loop arrows */}
                <path d="M 178 70 Q 300 40 422 70"   fill="none" stroke="#7dd3fc" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#lvcArr)" />
                <path d="M 450 98 Q 480 125 450 152" fill="none" stroke="#7dd3fc" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#lvcArr)" />
                <path d="M 422 180 Q 300 210 178 180" fill="none" stroke="#7dd3fc" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#lvcArr)" />
                <path d="M 150 152 Q 120 125 150 98" fill="none" stroke="#7dd3fc" strokeOpacity="0.6" strokeWidth="1.5" markerEnd="url(#lvcArr)" />
                {/* cross links */}
                <path d="M 178 85 Q 300 140 422 165"  fill="none" stroke="#c4b5fd" strokeOpacity="0.35" strokeWidth="1" markerEnd="url(#lvcArrW)" />
                <path d="M 178 165 Q 300 140 422 85"  fill="none" stroke="#c4b5fd" strokeOpacity="0.35" strokeWidth="1" markerEnd="url(#lvcArrW)" />
                <text x="300" y="30"  textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="ui-monospace, monospace">effects return as causes</text>
                <text x="300" y="225" textAnchor="middle" fontSize="11" fill="#6ee7b7">works for: bodies, markets, cities, teams, climates</text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <ListRow icon={ArrowUp}   title="Linear"   accent="sky">     good for simple, isolated causes. "If I push, it moves."</ListRow>
        <ListRow icon={RefreshCw} title="Circular" accent="violet"> good for coupled, ongoing causes. "If I push, it pushes back."</ListRow>
        <ListRow icon={Eye}       title="Stock-aware" accent="cyan">    asks "what is accumulating?" — water, debt, trust, anger, carbon.</ListRow>
        <ListRow icon={Target}    title="Structure-first" accent="fuchsia">blames the wiring, not the people. Same wiring → same pattern.</ListRow>
      </ul>

      <Deeper>
        <p>
          A <em>system</em> is a set of interconnected elements organized to achieve a function. Three tests tell you whether you're looking at one rather than a mere collection:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-neutral-300">
          <li>Does the behavior persist if you swap an element? (car with a new tire is still the car)</li>
          <li>Does changing one element alter the behavior of the others? (cutting one neuron changes nearby activity)</li>
          <li>Does the whole produce behavior <em>not present in the parts</em>? (neurons don't have opinions; brains do)</li>
        </ol>
        <p>
          If all three are yes, you are inside a system, and linear reasoning will betray you.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 2. The Iceberg ---------------------------------------------------------

const IcebergModel = () => {
  const layers = [
    {
      key: 'events',
      label: 'Events',
      color: 'rose',
      depth: 'what just happened',
      q: 'What?',
      examples: ['The server crashed at 3am.', 'Quarterly revenue missed target.', 'A team lead quit.'],
      action: 'React — the visible tip. Most time is spent here.',
    },
    {
      key: 'patterns',
      label: 'Patterns',
      color: 'amber',
      depth: 'over time',
      q: 'What keeps happening?',
      examples: ['Servers crash every release week.', 'Revenue dips every Q3.', 'Leads quit ~18 months in.'],
      action: 'Anticipate — forecast the next occurrence.',
    },
    {
      key: 'structure',
      label: 'Structure',
      color: 'emerald',
      depth: 'the wiring',
      q: 'What produces the pattern?',
      examples: ['No staging env → risky deploys → crashes.', 'Sales cycle is seasonal.', 'No growth path → ceiling hit.'],
      action: 'Redesign — change the loops that generate the pattern.',
    },
    {
      key: 'models',
      label: 'Mental models',
      color: 'violet',
      depth: 'deepest',
      q: 'What beliefs built the structure?',
      examples: ['"Speed > safety."', '"Sales is magic, not a process."', '"Leaders manage, they don\'t grow."'],
      action: 'Transform — shift the beliefs that made those choices feel obvious.',
    },
  ];
  const [open, setOpen] = useState('structure');

  return (
    <Card id="iceberg" index={2} icon={Layers} title="The Iceberg Model" subtitle="Most people react to events. Systems thinkers operate three layers down." accent="violet">
      <p>
        The visible 10% of a system — its <em>events</em> — is what makes the news, the standup, the dashboard alert. The 90% underneath is where leverage lives. The iceberg is a habit of descent: when something happens, ask <em>four questions</em>, not one.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4 overflow-hidden">
        <svg viewBox="0 0 600 280" className="w-full h-auto">
          <defs>
            <linearGradient id="waterLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
              <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="60" x2="600" y2="60" stroke="url(#waterLine)" strokeWidth="1.5" />
          <text x="580" y="52" textAnchor="end" fontSize="10" fill="#7dd3fc80" fontFamily="ui-monospace, monospace">— waterline —</text>
          {layers.map((l, i) => {
            const y = 20 + i * 58;
            const w = 400 - i * 40;
            const x = (600 - w) / 2;
            const active = open === l.key;
            const a = accentMap[l.color];
            return (
              <g key={l.key} style={{ cursor: 'pointer' }} onClick={() => setOpen(l.key)}>
                <rect x={x} y={y} width={w} height="44" rx="6"
                      fill={active ? (l.color === 'rose' ? '#7f1d1d40' : l.color === 'amber' ? '#78350f40' : l.color === 'emerald' ? '#064e3b40' : '#4c1d9540') : '#0a0a0a'}
                      stroke={active ? (l.color === 'rose' ? '#fda4af' : l.color === 'amber' ? '#fcd34d' : l.color === 'emerald' ? '#6ee7b7' : '#c4b5fd') : '#ffffff25'}
                      strokeWidth={active ? 2 : 1} />
                <text x={x + 16} y={y + 20} fontSize="13" fill={l.color === 'rose' ? '#fda4af' : l.color === 'amber' ? '#fcd34d' : l.color === 'emerald' ? '#6ee7b7' : '#c4b5fd'} fontFamily="ui-sans-serif" fontWeight="600">{l.label}</text>
                <text x={x + 16} y={y + 36} fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">{l.q}</text>
                <text x={x + w - 16} y={y + 28} textAnchor="end" fontSize="10" fill="#737373" fontFamily="ui-monospace, monospace">{l.depth}</text>
              </g>
            );
          })}
        </svg>

        <AnimatePresence mode="wait">
          {layers.filter((l) => l.key === open).map((l) => (
            <motion.div key={l.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="mt-3 rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">examples at this layer</div>
              <ul className="list-disc list-inside space-y-1 text-neutral-200">
                {l.examples.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
              <div className="mt-2 text-xs text-neutral-400"><span className="text-neutral-500">action →</span> {l.action}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-sm text-neutral-400">
        The higher you intervene, the cheaper the action — and the smaller the effect. The deeper you intervene, the harder the action — and the larger, more lasting the effect. Most organizations live in "events" not because events matter most, but because descent is uncomfortable.
      </p>
    </Card>
  );
};

// --- 3. Stocks and Flows ----------------------------------------------------

const StockFlow = () => {
  const [inflow, setInflow]   = useState(3);
  const [outflow, setOutflow] = useState(2);
  const [level, setLevel]     = useState(40);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed]     = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setLevel((L) => Math.max(0, Math.min(100, L + (inflow - outflow) * 0.8)));
    }, 120 / speed);
    return () => clearInterval(id);
  }, [playing, inflow, outflow, speed]);

  const net = inflow - outflow;
  const netColor = net > 0 ? 'text-amber-300' : net < 0 ? 'text-rose-300' : 'text-neutral-300';

  return (
    <Card id="stock-flow" index={3} icon={Droplet} title="Stocks and Flows" subtitle="The only grammar you need for modeling change." accent="cyan">
      <p>
        A <Eq>{`\\sk{\\text{stock}}`}</Eq> is anything that accumulates: water in a bathtub, money in an account, CO₂ in the atmosphere, trust in a team, unread email. A <Eq>{`\\fw{\\text{flow}}`}</Eq> is a rate that moves things in or out. <strong>Every dynamic system is some configuration of these two primitives.</strong>
      </p>

      <KeyEq note="the fundamental accounting identity of every dynamical system">{
        `\\frac{d\\sk{S}}{dt} = \\sum \\fw{\\text{inflows}} \\;-\\; \\sum \\fw{\\text{outflows}}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 600 260" className="w-full h-auto">
          <defs>
            <linearGradient id="waterG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>
            <marker id="sfArrIn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#f9a8d4" />
            </marker>
            <marker id="sfArrOut" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#f9a8d4" />
            </marker>
          </defs>

          {/* Cloud source */}
          <text x="60" y="60" fontSize="32" fill="#525252">☁</text>
          <text x="60" y="85" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">source</text>

          {/* Inflow pipe + flow particles */}
          <path d="M 100 70 L 260 70 L 260 110" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeOpacity="0.4" markerEnd="url(#sfArrIn)" />
          {[0, 1, 2].map((k) => (
            <motion.circle key={`in-${k}`} r="4" fill="#f9a8d4"
              animate={{
                cx: [100, 260, 260],
                cy: [70, 70, 110],
                opacity: inflow > 0 ? [0, 1, 0] : 0,
              }}
              transition={{ duration: (1.6 / Math.max(0.3, inflow / 3)) / speed, repeat: Infinity, delay: k * (0.5 / speed) }}
            />
          ))}
          <text x="180" y="60" textAnchor="middle" fontSize="11" fill="#f9a8d4" fontFamily="ui-monospace, monospace">inflow = {inflow}</text>

          {/* Tub */}
          <g>
            <rect x="200" y="110" width="200" height="120" rx="8" fill="none" stroke="#7dd3fc" strokeWidth="2" />
            <rect x="204" y={114 + (120 - (level / 100) * 116)} width="192" height={(level / 100) * 116 - 2}
                  fill="url(#waterG)" />
            {/* water shimmer */}
            <motion.line
              x1="204" x2="396"
              y1={114 + (120 - (level / 100) * 116)}
              y2={114 + (120 - (level / 100) * 116)}
              stroke="#bae6fd" strokeWidth="1"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <text x="300" y="100" textAnchor="middle" fontSize="12" fill="#7dd3fc" fontFamily="ui-sans-serif">STOCK: S</text>
            <text x="300" y="250" textAnchor="middle" fontSize="11" fill="#7dd3fc" fontFamily="ui-monospace, monospace">level = {level.toFixed(0)}</text>
          </g>

          {/* Outflow pipe + particles */}
          <path d="M 340 230 L 340 210 L 500 210" fill="none" stroke="#f9a8d4" strokeWidth="3" strokeOpacity="0.4" markerEnd="url(#sfArrOut)" />
          {[0, 1, 2].map((k) => (
            <motion.circle key={`out-${k}`} r="4" fill="#f9a8d4"
              animate={{
                cx: [340, 340, 500],
                cy: [230, 210, 210],
                opacity: outflow > 0 && level > 0 ? [0, 1, 0] : 0,
              }}
              transition={{ duration: (1.6 / Math.max(0.3, outflow / 3)) / speed, repeat: Infinity, delay: k * (0.5 / speed) }}
            />
          ))}
          <text x="430" y="200" textAnchor="middle" fontSize="11" fill="#f9a8d4" fontFamily="ui-monospace, monospace">outflow = {outflow}</text>

          {/* Sink */}
          <text x="530" y="220" fontSize="20" fill="#525252">▽</text>
          <text x="530" y="240" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">sink</text>
        </svg>

        <div className="mt-3 space-y-2">
          <Slider label="inflow" value={inflow} onChange={setInflow} min={0} max={8} step={0.5} fmt={(v) => v.toFixed(1)} accent="rose" />
          <Slider label="outflow" value={outflow} onChange={setOutflow} min={0} max={8} step={0.5} fmt={(v) => v.toFixed(1)} accent="rose" />
          <div className="flex justify-between text-xs font-mono pt-1">
            <span className="text-neutral-500">dS/dt = <span className={netColor}>{net >= 0 ? '+' : ''}{net.toFixed(1)}</span></span>
            <span className="text-neutral-500">{net > 0 ? 'rising' : net < 0 ? 'falling' : 'at equilibrium'}</span>
          </div>
          <PlayCtl playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setLevel(40)} speed={speed} setSpeed={setSpeed} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-2">things that are stocks</div>
          <ul className="text-sm text-neutral-200 space-y-1">
            <li>• population, money, inventory</li>
            <li>• reputation, trust, knowledge</li>
            <li>• CO<sub>2</sub> in atmosphere, forests, fish</li>
            <li>• technical debt, unread tickets</li>
          </ul>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-pink-300 mb-2">things that are flows</div>
          <ul className="text-sm text-neutral-200 space-y-1">
            <li>• births/deaths, income/spending</li>
            <li>• hires/attrition, sales/returns</li>
            <li>• emissions/absorption, growth/harvest</li>
            <li>• bugs filed/fixed, tickets opened/closed</li>
          </ul>
        </div>
      </div>

      <ul className="mt-2 space-y-2 text-sm">
        <ListRow icon={Hourglass} title="Stocks give systems memory" accent="sky">the tub still holds water even if you close the tap.</ListRow>
        <ListRow icon={Clock}     title="Stocks change slowly"       accent="cyan">a stock's inertia is what creates delays — see next section.</ListRow>
        <ListRow icon={Scale}     title="Flows can only be balanced, not 'solved'" accent="pink">you control a stock by managing its flows, not by wishing at the level.</ListRow>
        <ListRow icon={AlertTriangle} title="Humans confuse stocks with flows" accent="rose">a classic mistake: "if we slow emissions, CO₂ falls." No — CO₂ keeps rising until <em>outflow &gt; inflow</em>.</ListRow>
      </ul>

      <Deeper>
        <p>
          This integration step <Eq>{`\\sk{S(t)} = \\sk{S_0} + \\int_0^t (\\fw{\\text{in}} - \\fw{\\text{out}})\\, d\\tau`}</Eq> is the one calculation the human mind is <em>bad</em> at. In the classic "CO₂ bathtub" study (Sterman), MIT grad students were shown emissions flattening and asked when CO₂ would stabilize; most answered <em>immediately</em>. CO₂ is a stock. It keeps rising as long as emissions exceed absorption.
        </p>
      </Deeper>
    </Card>
  );
};

/* =============================================================================
   ACT 2 — FEEDBACK LOOPS
   ============================================================================= */

// --- 4. Reinforcing loops ---------------------------------------------------

const ReinforcingLoop = () => {
  const [rate, setRate] = useState(0.08);
  const maxT = 60;
  const pts = useMemo(() => {
    const arr = [];
    let v = 10;
    for (let t = 0; t <= maxT; t++) {
      arr.push({ t, v });
      v = v * (1 + rate);
    }
    return arr;
  }, [rate]);
  const W = 560, H = 180, padL = 40, padR = 10, padT = 10, padB = 20;
  const maxV = pts[pts.length - 1].v;
  const x = (t) => padL + (t / maxT) * (W - padL - padR);
  const y = (v) => H - padB - (v / maxV) * (H - padT - padB);
  const doublingTime = rate > 0 ? Math.log(2) / Math.log(1 + rate) : Infinity;

  return (
    <Card id="reinforcing" index={4} icon={Flame} title="Reinforcing Loops (R)" subtitle="A loop that multiplies itself. Growth or collapse — never equilibrium." accent="amber">
      <p>
        A <strong className="text-amber-300">reinforcing loop</strong> is one where more of <em>X</em> leads to more of <em>X</em> (or less of <em>X</em> to even less). These are the engines of compound growth — and of runaway collapse. In a causal loop diagram we mark them with an <Eq>{`\\rf{R}`}</Eq> in the center.
      </p>

      <KeyEq note="exponential solution to a pure reinforcing loop">{
        `\\frac{d\\sk{S}}{dt} = \\rf{r}\\cdot \\sk{S} \\quad\\Longrightarrow\\quad \\sk{S(t)} = \\sk{S_0}\\, e^{\\rf{r}\\, t}`
      }</KeyEq>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-amber-300 mb-2">the loop</div>
          <svg viewBox="0 0 300 180" className="w-full h-auto">
            <defs>
              <marker id="rArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#fcd34d" />
              </marker>
            </defs>
            <circle cx="80"  cy="90" r="36" fill="#78350f40" stroke="#fcd34d" strokeWidth="1.5" />
            <text x="80"  y="94" textAnchor="middle" fontSize="12" fill="#fcd34d" fontFamily="ui-monospace, monospace">bank</text>
            <text x="80"  y="78" textAnchor="middle" fontSize="9"  fill="#fde68a">balance</text>
            <circle cx="220" cy="90" r="36" fill="#78350f40" stroke="#fcd34d" strokeWidth="1.5" />
            <text x="220" y="94" textAnchor="middle" fontSize="12" fill="#fcd34d" fontFamily="ui-monospace, monospace">interest</text>
            <path d="M 116 75 Q 150 40 184 75" fill="none" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#rArr)" />
            <path d="M 184 105 Q 150 140 116 105" fill="none" stroke="#fcd34d" strokeWidth="1.5" markerEnd="url(#rArr)" />
            <text x="150" y="35"  textAnchor="middle" fontSize="10" fill="#fde68a" fontFamily="ui-monospace, monospace">+</text>
            <text x="150" y="155" textAnchor="middle" fontSize="10" fill="#fde68a" fontFamily="ui-monospace, monospace">+</text>
            <motion.text x="150" y="98" textAnchor="middle" fontSize="18" fill="#fcd34d" fontFamily="ui-sans-serif" fontWeight="700"
              animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '150px 90px' }}>R</motion.text>
          </svg>
          <p className="mt-2 text-[11px] text-neutral-500 text-center">both arrows "+": more balance → more interest → more balance</p>
        </div>

        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-amber-300 mb-2">the behavior</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#ffffff20" />
            <line x1={padL} y1={padT}     x2={padL}     y2={H - padB} stroke="#ffffff20" />
            <path d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t)} ${y(p.v)}`).join(' ')}
                  fill="none" stroke="#fcd34d" strokeWidth="2" />
            <text x={padL} y={padT + 10} fontSize="10" fill="#fcd34d80" fontFamily="ui-monospace, monospace">S(t)</text>
            <text x={W - padR} y={H - padB - 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">t</text>
          </svg>
          <div className="mt-2 space-y-2">
            <Slider label="rate r" value={rate} onChange={setRate} min={-0.04} max={0.2} step={0.005} fmt={(v) => v.toFixed(3)} accent="amber" />
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>doubling time ≈ {isFinite(doublingTime) ? doublingTime.toFixed(1) : '∞'} steps</span>
              <span className={rate < 0 ? 'text-rose-300' : 'text-amber-300'}>{rate < 0 ? 'decay' : rate > 0 ? 'growth' : 'flat'}</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <ListRow icon={TrendingUp} title="Compound interest" accent="amber">money makes interest makes money.</ListRow>
        <ListRow icon={Sparkles}   title="Viral spread"       accent="amber">infected people infect more people.</ListRow>
        <ListRow icon={Users}      title="Network effects"    accent="amber">more users → more value → more users.</ListRow>
        <ListRow icon={TrendingDown} title="Bank runs / panic selling" accent="rose">fear of collapse causes collapse.</ListRow>
        <ListRow icon={Flame}      title="Wildfire"           accent="rose">heat dries fuel, fuel feeds fire, fire makes heat.</ListRow>
      </ul>

      <p className="text-sm text-neutral-400">
        Every reinforcing loop in a finite world eventually meets a balancing loop — you can't double forever. The next section is what stops it.
      </p>

      <Deeper>
        <p>
          Rule of <Eq>{`70`}</Eq>: if a quantity grows at <Eq>{`\\rf{r}\\%`}</Eq> per period, it doubles in roughly <Eq>{`70/\\rf{r}`}</Eq> periods. 7% growth doubles in 10 years. 2% growth doubles in 35. This is why small compounded rates compound to huge numbers — and why CO₂ ppm, a 0.5%/yr flow problem, is a civilization-scale stock problem.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 5. Balancing loops -----------------------------------------------------

const BalancingLoop = () => {
  const [target, setTarget] = useState(60);
  const [gain, setGain]     = useState(0.25);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed]     = useState(1);
  const [series, setSeries]   = useState([20]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setSeries((s) => {
        const cur = s[s.length - 1];
        const next = cur + gain * (target - cur);
        const arr = [...s, next];
        if (arr.length > 120) arr.shift();
        return arr;
      });
    }, 80 / speed);
    return () => clearInterval(id);
  }, [playing, target, gain, speed]);

  const W = 560, H = 170, padL = 32, padT = 10, padB = 22, padR = 8;
  const maxV = 100;
  const x = (i) => padL + (i / Math.max(1, series.length - 1)) * (W - padL - padR);
  const y = (v) => H - padB - (v / maxV) * (H - padT - padB);

  return (
    <Card id="balancing" index={5} icon={Scale} title="Balancing Loops (B)" subtitle="A loop that opposes change. Goal-seeking — the source of stability." accent="emerald">
      <p>
        A <strong className="text-emerald-300">balancing loop</strong> has an odd number of negative arrows: change in one direction triggers a response that pushes the system back. These are the loops that produce <em>targets, thermostats, homeostasis, market equilibrium</em>. Marked with a <Eq>{`\\bl{B}`}</Eq>.
      </p>

      <KeyEq note="exponential approach to a goal — the archetypal B-loop behavior">{
        `\\frac{d\\sk{S}}{dt} = \\bl{g}\\cdot(\\sk{S^\\star} - \\sk{S}) \\quad\\Longrightarrow\\quad \\sk{S(t)} = \\sk{S^\\star} - (\\sk{S^\\star} - \\sk{S_0})\\, e^{-\\bl{g}\\, t}`
      }</KeyEq>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">the loop</div>
          <svg viewBox="0 0 300 180" className="w-full h-auto">
            <defs>
              <marker id="bArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#6ee7b7" />
              </marker>
            </defs>
            <circle cx="80" cy="60" r="30" fill="#064e3b40" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x="80" y="64" textAnchor="middle" fontSize="11" fill="#6ee7b7" fontFamily="ui-monospace, monospace">room</text>
            <text x="80" y="78" textAnchor="middle" fontSize="9" fill="#a7f3d0">temp</text>
            <circle cx="220" cy="60" r="30" fill="#064e3b40" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x="220" y="64" textAnchor="middle" fontSize="10" fill="#6ee7b7" fontFamily="ui-monospace, monospace">gap</text>
            <text x="220" y="78" textAnchor="middle" fontSize="8" fill="#a7f3d0">(target − room)</text>
            <circle cx="150" cy="145" r="30" fill="#064e3b40" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x="150" y="149" textAnchor="middle" fontSize="11" fill="#6ee7b7" fontFamily="ui-monospace, monospace">heater</text>
            <path d="M 108 55 Q 150 30 192 55" fill="none" stroke="#6ee7b7" strokeWidth="1.5" markerEnd="url(#bArr)" />
            <text x="150" y="28" textAnchor="middle" fontSize="12" fill="#fda4af" fontFamily="ui-monospace, monospace">−</text>
            <path d="M 210 88 Q 195 130 172 132" fill="none" stroke="#6ee7b7" strokeWidth="1.5" markerEnd="url(#bArr)" />
            <text x="212" y="115" fontSize="12" fill="#a7f3d0" fontFamily="ui-monospace, monospace">+</text>
            <path d="M 130 132 Q 90 115 92 90" fill="none" stroke="#6ee7b7" strokeWidth="1.5" markerEnd="url(#bArr)" />
            <text x="94" y="128" fontSize="12" fill="#a7f3d0" fontFamily="ui-monospace, monospace">+</text>
            <motion.text x="150" y="85" textAnchor="middle" fontSize="18" fill="#6ee7b7" fontFamily="ui-sans-serif" fontWeight="700"
              animate={{ rotate: [0, -360] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '150px 80px' }}>B</motion.text>
          </svg>
          <p className="mt-2 text-[11px] text-neutral-500 text-center">one "−": room warms → gap shrinks → heater slows → warming slows</p>
        </div>

        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">the behavior</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)} stroke="#fcd34d" strokeDasharray="3 3" strokeOpacity="0.7" />
            <text x={W - padR} y={y(target) - 4} textAnchor="end" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">target S* = {target}</text>
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#ffffff20" />
            <line x1={padL} y1={padT}     x2={padL}     y2={H - padB} stroke="#ffffff20" />
            <path d={series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')}
                  fill="none" stroke="#6ee7b7" strokeWidth="2" />
            <text x={padL} y={padT + 10} fontSize="10" fill="#6ee7b780" fontFamily="ui-monospace, monospace">S(t)</text>
          </svg>
          <div className="mt-2 space-y-2">
            <Slider label="target S*" value={target} onChange={setTarget} min={0} max={100} step={1} accent="amber" />
            <Slider label="gain g"    value={gain}   onChange={setGain}   min={0.02} max={0.9} step={0.02} fmt={(v) => v.toFixed(2)} accent="emerald" />
            <PlayCtl playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => setSeries([20])} speed={speed} setSpeed={setSpeed} />
          </div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <ListRow icon={Thermometer} title="Thermostats, cruise control" accent="emerald">tight goal-seeking.</ListRow>
        <ListRow icon={Activity}    title="Body homeostasis"            accent="emerald">temperature, glucose, blood pressure.</ListRow>
        <ListRow icon={TrendingDown}title="Predator / prey"             accent="emerald">more rabbits → more foxes → fewer rabbits.</ListRow>
        <ListRow icon={Scale}       title="Supply & demand"             accent="emerald">price rises → demand falls → price falls.</ListRow>
        <ListRow icon={AlertTriangle} title="Diet plateau, addiction tolerance" accent="rose">your target you can't see is quietly balancing you back.</ListRow>
      </ul>

      <p className="text-sm text-neutral-400">
        Reinforcing loops drive change. Balancing loops resist it. Every system is a tug-of-war between <Eq>{`\\rf{R}`}</Eq>'s and <Eq>{`\\bl{B}`}</Eq>'s, and its behavior at any moment is a function of which is stronger <em>right now</em>.
      </p>

      <Deeper>
        <p>
          When balancing loops act with <em>perfect information and no delay</em>, they converge smoothly (the graph above). Real loops don't. With delay they <em>oscillate</em>, and if strong enough, <em>diverge</em>. That's the next card.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 6. Delays and oscillation ----------------------------------------------

const DelayOscillation = () => {
  const [delay, setDelay] = useState(10);
  const [gain, setGain]   = useState(0.45);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed]     = useState(1);

  // simulate a B loop with a transport delay on the sensed value
  const stateRef = useRef({ S: 20, hist: Array.from({ length: 50 }).map(() => 20), series: [] });
  const [, tick] = useState(0);

  useEffect(() => {
    stateRef.current = { S: 20, hist: Array.from({ length: Math.max(1, Math.round(delay)) + 2 }).map(() => 20), series: [] };
    tick((n) => n + 1);
  }, [delay]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const st = stateRef.current;
      const sensed = st.hist[0];                         // value from <delay> steps ago
      const target = 70;
      const dS = gain * (target - sensed);
      st.S = st.S + dS;
      st.hist = [...st.hist.slice(1), st.S];
      st.series = [...st.series, st.S];
      if (st.series.length > 240) st.series.shift();
      tick((n) => n + 1);
    }, 80 / speed);
    return () => clearInterval(id);
  }, [playing, gain, speed]);

  const series = stateRef.current.series;
  const W = 560, H = 180, padL = 32, padR = 10, padT = 10, padB = 22;
  const minV = 0, maxV = 140;
  const x = (i) => padL + (i / Math.max(1, series.length - 1)) * (W - padL - padR);
  const y = (v) => H - padB - ((v - minV) / (maxV - minV)) * (H - padT - padB);
  const targetY = y(70);

  const regime = delay * gain;
  const regimeLabel =
    regime < 0.6 ? 'smooth approach'
    : regime < 1.5 ? 'damped oscillation'
    : regime < 2.5 ? 'sustained oscillation'
    : 'runaway';
  const regimeColor =
    regime < 0.6 ? 'text-emerald-300'
    : regime < 1.5 ? 'text-amber-300'
    : regime < 2.5 ? 'text-rose-300'
    : 'text-red-400';

  return (
    <Card id="delays" index={6} icon={Clock} title="Delays & Oscillation" subtitle="The single most common cause of systems behaving 'weirdly'." accent="violet">
      <p>
        Delay is the gap between a cause and its sensed effect. Every real system has them: shipping times, hiring ramps, climate inertia, hormonal lag, a shower's plumbing. When a balancing loop contains a delay, it <strong>overshoots</strong>. Push more loop gain in — harder-working policy — and it oscillates. Push further and it diverges.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest text-violet-300">
          <Hourglass className="w-3.5 h-3.5" /> the shower: twist knob → water reacts τ seconds later
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke="#fcd34d" strokeDasharray="3 3" strokeOpacity="0.7" />
          <text x={W - padR} y={targetY - 4} textAnchor="end" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">target = 70</text>
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#ffffff20" />
          <line x1={padL} y1={padT}     x2={padL}     y2={H - padB} stroke="#ffffff20" />
          <path d={series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')}
                fill="none" stroke="#c4b5fd" strokeWidth="2" />
          <text x={padL} y={padT + 10} fontSize="10" fill="#c4b5fd80" fontFamily="ui-monospace, monospace">S(t)</text>
        </svg>
        <div className="mt-2 space-y-2">
          <Slider label="delay τ" value={delay} onChange={setDelay} min={1} max={30} step={1} accent="violet" />
          <Slider label="gain g"  value={gain}  onChange={setGain}  min={0.05} max={1.2} step={0.05} fmt={(v) => v.toFixed(2)} accent="rose" />
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-neutral-500">τ × g ≈ {regime.toFixed(2)}</span>
            <span className={regimeColor}>{regimeLabel}</span>
          </div>
          <PlayCtl playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={() => { stateRef.current.series = []; stateRef.current.S = 20; stateRef.current.hist = stateRef.current.hist.map(() => 20); }} speed={speed} setSpeed={setSpeed} />
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <ListRow icon={Thermometer} title="Shower knob" accent="violet">you scalded yourself because hot water took 8 seconds to arrive.</ListRow>
        <ListRow icon={Users}       title="Hiring cycles" accent="violet">need engineers now → hire 30 → they arrive after demand is gone → layoff in 18 months.</ListRow>
        <ListRow icon={Ship}        title="Supply chains (the 'bullwhip' effect)" accent="violet">small demand wiggle upstream becomes huge production swing downstream.</ListRow>
        <ListRow icon={Leaf}        title="Climate" accent="violet">ocean heat lag means today's emissions are felt in 30 years.</ListRow>
        <ListRow icon={AlertTriangle} title="Monetary policy" accent="violet">rate change takes 12–18 months to bite; by then conditions have flipped.</ListRow>
      </ul>

      <div className="rounded-lg bg-violet-500/5 border border-violet-400/20 p-3 text-sm">
        <span className="text-violet-200 font-medium">Policy rule of thumb:</span> the stronger your reaction and the longer the delay, the worse you make things. <em>Slow your correction until the delay clears.</em>
      </div>

      <Deeper>
        <p>
          For a first-order negative feedback <Eq>{`\\dot{\\sk{S}} = -\\bl{g}(\\sk{S}(t - \\dl{\\tau}) - \\sk{S^\\star})`}</Eq>, the critical delay-gain product where oscillation begins is <Eq>{`\\bl{g}\\,\\dl{\\tau} \\approx \\pi/2`}</Eq>. Beyond that, the loop is no longer stabilizing — it's an oscillator.
        </p>
      </Deeper>
    </Card>
  );
};

// --- 7. Nonlinearity --------------------------------------------------------

const Nonlinearity = () => {
  const [k, setK] = useState(8);
  const [x0, setX0] = useState(0.5);
  const W = 560, H = 170, padL = 34, padR = 10, padT = 10, padB = 24;
  const x = (u) => padL + u * (W - padL - padR);
  const y = (v) => H - padB - v * (H - padT - padB);
  const sigmoid = (u) => 1 / (1 + Math.exp(-k * (u - x0)));
  const pts = Array.from({ length: 101 }, (_, i) => i / 100);

  return (
    <Card id="nonlinearity" index={7} icon={Zap} title="Nonlinearity & Thresholds" subtitle="Why systems seem to change mind without warning." accent="rose">
      <p>
        Linear thinking assumes <em>dose and effect scale together</em>: twice the push, twice the result. Real systems are riddled with <strong className="text-rose-300">nonlinearities</strong>: saturation, diminishing returns, thresholds, tipping points, phase transitions. Below a threshold nothing moves; above it, everything moves at once.
      </p>

      <KeyEq note="a prototypical nonlinearity — the sigmoid">{
        `\\nl{f(x)} = \\frac{1}{1 + e^{-k(x - x_0)}}`
      }</KeyEq>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#ffffff20" />
          <line x1={padL} y1={padT}     x2={padL}     y2={H - padB} stroke="#ffffff20" />
          {/* reference linear */}
          <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="#94a3b830" strokeDasharray="3 3" />
          {/* threshold */}
          <line x1={x(x0)} y1={padT} x2={x(x0)} y2={H - padB} stroke="#fda4af60" strokeDasharray="2 3" />
          <text x={x(x0)} y={padT + 10} fontSize="10" fill="#fda4af" textAnchor="middle" fontFamily="ui-monospace, monospace">x₀</text>
          <path d={pts.map((u, i) => `${i === 0 ? 'M' : 'L'} ${x(u)} ${y(sigmoid(u))}`).join(' ')}
                fill="none" stroke="#fda4af" strokeWidth="2" />
          <text x={W - padR} y={H - padB + 14} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">input x</text>
          <text x={padL - 4}  y={padT + 10}    textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">f(x)</text>
        </svg>
        <div className="mt-2 space-y-2">
          <Slider label="steepness k" value={k}  onChange={setK}  min={1} max={50} step={1}    accent="rose" />
          <Slider label="threshold x₀" value={x0} onChange={setX0} min={0.1} max={0.9} step={0.01} fmt={(v) => v.toFixed(2)} accent="fuchsia" />
          <p className="text-[11px] text-neutral-500">dashed gray is a linear reference. As <em>k</em> grows, the world looks more like a switch than a dial.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">physical / ecological</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• lake eutrophication (clear → algal)</li>
            <li>• ice sheet collapse</li>
            <li>• forest → savanna regime shift</li>
            <li>• ignition of combustion</li>
          </ul>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">human / organizational</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• viral adoption (critical mass)</li>
            <li>• trust collapse after one scandal</li>
            <li>• burnout (cumulative then sudden)</li>
            <li>• bank run / market crash</li>
          </ul>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <ListRow icon={AlertTriangle} title="'More of the same' stops working" accent="rose">past the knee of the curve, inputs vanish into nothing, or trigger avalanches.</ListRow>
        <ListRow icon={Hourglass}     title="Hysteresis"                      accent="violet">once a system flips, pulling the input <em>back</em> to where it was often doesn't flip it back. The past matters.</ListRow>
        <ListRow icon={Eye}           title="Early warnings"                  accent="sky">critical slowing down, rising variance, flickering between states — systems whisper before they tip.</ListRow>
      </ul>

      <Deeper>
        <p>
          The logistic equation <Eq>{`\\dot{\\sk{P}} = \\rf{r}\\sk{P}(1 - \\sk{P}/\\nl{K})`}</Eq> combines a reinforcing loop (<Eq>{`\\rf{r}\\sk{P}`}</Eq>) with a nonlinear balancing term (<Eq>{`-\\rf{r}\\sk{P}^2/\\nl{K}`}</Eq>) to produce the famous S-curve: exponential early, saturating as the carrying capacity <Eq>{`\\nl{K}`}</Eq> is approached. Most "growth stories" in the real world are fragments of this curve.
        </p>
      </Deeper>
    </Card>
  );
};

/* =============================================================================
   ACT 3 — READING SYSTEMS
   ============================================================================= */

// --- 8. Causal Loop Diagrams ------------------------------------------------

const CLDiagramCard = () => {
  const [edges, setEdges] = useState([
    { from: 0, to: 1, sign: +1 },  // births → pop
    { from: 1, to: 0, sign: +1 },  // pop → births
    { from: 1, to: 2, sign: +1 },  // pop → deaths
    { from: 2, to: 1, sign: -1 },  // deaths → pop
  ]);

  const nodes = [
    { label: 'births', x: 90,  y: 60 },
    { label: 'population', x: 280, y: 140 },
    { label: 'deaths', x: 470, y: 60 },
  ];

  const flip = (i) =>
    setEdges((es) => es.map((e, j) => (j === i ? { ...e, sign: e.sign * -1 } : e)));

  // count loops
  const loopSign = (indices) => indices.reduce((acc, i) => acc * edges[i].sign, 1);
  const Rloop = loopSign([0, 1]) > 0; // births ↔ population
  const Bloop = loopSign([2, 3]) < 0; // population → deaths → population

  return (
    <Card id="cld" index={8} icon={GitBranch} title="Causal Loop Diagrams (CLDs)" subtitle="A universal notation for the wiring of a system." accent="sky">
      <p>
        A CLD is a graph of variables connected by signed arrows. A <Eq>{`+`}</Eq> means "moves in the same direction" — if the source goes up, the target goes up (or, if the source goes down, the target goes down). A <Eq>{`-`}</Eq> means "moves in the opposite direction". Feedback loops are read by tracing the cycles and counting the minuses.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-amber-300 mb-2">rules for reading</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• <strong>even # of minuses</strong> in a loop → <span className="text-amber-300">reinforcing (R)</span></li>
            <li>• <strong>odd # of minuses</strong> in a loop → <span className="text-emerald-300">balancing (B)</span></li>
            <li>• label delays with <Eq>{`\\dl{\\|}`}</Eq> on the arrow that's slow</li>
            <li>• name variables as <em>nouns that can move up or down</em></li>
          </ul>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3 text-sm">
          <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">gotchas</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• a "+" arrow means <em>same direction</em>, not "is good"</li>
            <li>• pick one quantity per node; don't bundle "mood & sleep"</li>
            <li>• if you can't find a sign for an arrow, the variable is ambiguous</li>
            <li>• CLDs are for insight, not simulation — use stocks & flows for that</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-3">click an arrow to flip its sign</div>
        <svg viewBox="0 0 600 240" className="w-full h-auto">
          <defs>
            <marker id="cldArrP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#7dd3fc" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const A = nodes[e.from], B = nodes[e.to];
            const mx = (A.x + B.x) / 2;
            const my = (A.y + B.y) / 2 + (i % 2 === 0 ? -30 : 30);
            const color = e.sign > 0 ? '#7dd3fc' : '#fda4af';
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => flip(i)}>
                <path d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`} fill="none" stroke={color} strokeOpacity="0.6" strokeWidth="2" markerEnd="url(#cldArrP)" />
                <circle cx={mx} cy={my} r="11" fill="#0a0a0a" stroke={color} strokeWidth="1.5" />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize="13" fill={color} fontFamily="ui-monospace, monospace">{e.sign > 0 ? '+' : '−'}</text>
              </g>
            );
          })}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r="38" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fill="#7dd3fc" fontFamily="ui-monospace, monospace">{n.label}</text>
            </g>
          ))}
          {/* loop labels */}
          <g>
            <rect x="140" y="100" width="36" height="24" rx="6" fill={Rloop ? '#78350f60' : '#064e3b60'} stroke={Rloop ? '#fcd34d' : '#6ee7b7'} />
            <text x="158" y="117" textAnchor="middle" fontSize="12" fill={Rloop ? '#fcd34d' : '#6ee7b7'} fontWeight="700" fontFamily="ui-sans-serif">{Rloop ? 'R' : 'B'}</text>
          </g>
          <g>
            <rect x="400" y="100" width="36" height="24" rx="6" fill={Bloop ? '#064e3b60' : '#78350f60'} stroke={Bloop ? '#6ee7b7' : '#fcd34d'} />
            <text x="418" y="117" textAnchor="middle" fontSize="12" fill={Bloop ? '#6ee7b7' : '#fcd34d'} fontWeight="700" fontFamily="ui-sans-serif">{Bloop ? 'B' : 'R'}</text>
          </g>
        </svg>
        <p className="mt-2 text-[11px] text-neutral-500 text-center">
          A population has a natural R-loop (more people → more births → more people) and a natural B-loop (more people → more deaths → fewer people). Flip an arrow to see the loop change character.
        </p>
      </div>

      <div className="rounded-lg bg-sky-500/5 border border-sky-400/20 p-3 text-sm">
        <span className="text-sky-200 font-medium">When to draw a CLD:</span> not when you want to compute anything — when you want to <em>argue about structure</em>. A CLD on a whiteboard, disagreed on, fixed, and agreed on, is the most important deliverable of most systems work.
      </div>
    </Card>
  );
};

// --- 9. System archetypes ---------------------------------------------------

const ARCHETYPES = [
  {
    key: 'lgr',
    name: 'Limits to Growth',
    loops: 'R + B',
    icon: TrendingUp,
    color: 'amber',
    story: 'A reinforcing loop drives growth until a balancing loop (a resource ceiling, a limit) kicks in.',
    symptoms: ['Growth stalls unexpectedly.', 'Doing more of what worked stops working.', 'S-curved trajectory.'],
    fix: "Don't push harder on the R loop. Find the dominant limit and relax it — or accept the ceiling.",
    ex: 'Startups, infections, algal blooms, ad spend ROI.',
  },
  {
    key: 'stb',
    name: 'Shifting the Burden',
    loops: '2 B-loops (symptomatic vs fundamental)',
    icon: RefreshCw,
    color: 'violet',
    story: 'A quick fix soothes a symptom but atrophies the capacity to solve the real problem.',
    symptoms: ['Same problem keeps returning, bigger.', 'Dependence on the quick fix grows.', 'Root cause is never actually addressed.'],
    fix: 'Invest in the slow, fundamental solution even while the symptom burns.',
    ex: 'Painkillers for chronic pain. Outsourcing hard engineering. Caffeine for sleep debt.',
  },
  {
    key: 'tcp',
    name: 'Tragedy of the Commons',
    loops: 'Many R + a shared B',
    icon: Trees,
    color: 'emerald',
    story: "Each actor's individual gain increases a shared cost, until the shared resource collapses.",
    symptoms: ['Everyone "rational," outcome terrible.', 'Shared resource quality falls.', 'No single villain.'],
    fix: 'Change the feedback — visible shared cost, quotas, ownership, or cooperation infrastructure.',
    ex: 'Fisheries, traffic, shared Slack channels, groundwater, open-source maintainers.',
  },
  {
    key: 'ftf',
    name: 'Fixes That Fail',
    loops: 'B (fast) + R (slow, unintended)',
    icon: AlertTriangle,
    color: 'rose',
    story: 'An intervention reduces the symptom in the short run but triggers a delayed side-effect that makes it worse.',
    symptoms: ['Short-term win, long-term loss.', 'Side effects appear after a lag.', 'Applying the fix more aggressively makes things worse.'],
    fix: 'Anticipate the delayed side-effect; add it to the diagram before acting.',
    ex: 'Antibiotic overuse → resistance. Hiring to ship faster → onboarding cost tanks velocity.',
  },
  {
    key: 'sts',
    name: 'Success to the Successful',
    loops: 'Two R-loops competing for a shared resource',
    icon: Sparkles,
    color: 'fuchsia',
    story: 'Whoever gets ahead gets more of the resource and pulls further ahead.',
    symptoms: ['Winner-take-most outcomes.', 'Small early advantages → durable dominance.', 'Talent/capital/attention clusters.'],
    fix: 'Separate the resource pools, or explicitly subsidize the lagging loop.',
    ex: 'Platform monopolies. Top students & top teachers. Featured products on marketplaces.',
  },
  {
    key: 'esc',
    name: 'Escalation',
    loops: 'Two coupled R-loops',
    icon: Flame,
    color: 'rose',
    story: 'Each side responds to the other\'s threat by increasing its own, so both keep rising.',
    symptoms: ['Arms race.', 'Ad spend wars.', 'Mutual mistrust spiral.'],
    fix: 'Unilaterally reveal a cap; negotiate; change what "threat" means.',
    ex: 'Cold war, airline fare wars, feature-matching between competing apps.',
  },
  {
    key: 'drg',
    name: 'Drifting Goals / Eroding Goals',
    loops: 'B with a slipping target',
    icon: Target,
    color: 'violet',
    story: 'Under pressure, the goal is quietly lowered to meet current performance instead of improving performance.',
    symptoms: ['Standards gently decline.', '"That\'s the new normal" heard often.', 'Old targets mocked as unrealistic.'],
    fix: 'Anchor the goal externally (benchmarks, standards) so it can\'t drift.',
    ex: 'Deadline slippage, code quality, customer SLAs, fitness goals.',
  },
  {
    key: 'gth',
    name: 'Growth and Underinvestment',
    loops: 'R + B + a capacity investment loop that atrophies',
    icon: Layers,
    color: 'amber',
    story: 'Success strains capacity; under pressure, the org under-invests in capacity, which ends growth.',
    symptoms: ['Service quality dips just as demand grows.', 'Team is always "busy firefighting."', 'Capital expenditure deferred repeatedly.'],
    fix: 'Invest in capacity ahead of need, not in response to failure.',
    ex: 'Scaling companies, health systems, utilities, city infrastructure.',
  },
];

const Archetypes = () => {
  const [active, setActive] = useState('lgr');
  const cur = ARCHETYPES.find((a) => a.key === active);
  return (
    <Card id="archetypes" index={9} icon={BookOpen} title="System Archetypes" subtitle="A small set of recurring shapes. Once you see them, you see them everywhere." accent="amber">
      <p>
        Archetypes are <em>reusable patterns of loop interaction</em>. They are not systems themselves; they are the story-shapes systems repeatedly fall into. Learning eight of them gives you diagnostic X-ray vision for most organizational, ecological, and personal dynamics.
      </p>

      <div className="flex flex-wrap gap-2">
        {ARCHETYPES.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.key}
                    onClick={() => setActive(a.key)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-[12px] rounded-lg border transition-colors ${active === a.key ? 'bg-sky-500/15 border-sky-400/40 text-sky-100' : 'bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/10'}`}>
              <Icon className="w-3.5 h-3.5" /> {a.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {cur && (
          <motion.div key={cur.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="rounded-xl bg-black/40 border border-white/10 p-5 space-y-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-semibold text-neutral-50">{cur.name}</h3>
              <span className="text-[11px] uppercase tracking-widest text-neutral-500">{cur.loops}</span>
            </div>
            <p className="text-sm text-neutral-200">{cur.story}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-1">symptoms</div>
                <ul className="text-sm text-neutral-200 space-y-1">
                  {cur.symptoms.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-1">leverage</div>
                <p className="text-sm text-neutral-200">{cur.fix}</p>
              </div>
            </div>
            <div className="text-xs text-neutral-500">
              <span className="uppercase tracking-widest mr-2">examples</span>{cur.ex}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-neutral-400">
        Donella Meadows wrote that the first skill of a systems thinker is <em>to recognize which archetype you're living inside</em>. Half the leverage is naming it.
      </p>
    </Card>
  );
};

// --- 10. Emergence (boids) --------------------------------------------------

const Emergence = () => {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed]     = useState(1);
  const [align, setAlign]     = useState(0.06);
  const [cohere, setCohere]   = useState(0.004);
  const [separate, setSep]    = useState(0.9);

  const canvasRef = useRef(null);
  const boidsRef = useRef(null);
  const rafRef   = useRef();

  const init = () => {
    const N = 60;
    boidsRef.current = Array.from({ length: N }).map(() => ({
      x: Math.random() * 600,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
  };
  useEffect(() => { init(); }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(50, now - last) * speed; last = now;
      if (playing) {
        const b = boidsRef.current;
        const maxV = 3.2;
        for (let i = 0; i < b.length; i++) {
          let ax = 0, ay = 0, cx = 0, cy = 0, sx = 0, sy = 0, nN = 0, nS = 0;
          for (let j = 0; j < b.length; j++) {
            if (i === j) continue;
            const dx = b[j].x - b[i].x, dy = b[j].y - b[i].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 60 * 60) {
              ax += b[j].vx; ay += b[j].vy;
              cx += b[j].x;  cy += b[j].y;
              nN++;
            }
            if (d2 < 22 * 22 && d2 > 0) {
              sx -= dx / d2; sy -= dy / d2; nS++;
            }
          }
          if (nN > 0) {
            b[i].vx += align * ((ax / nN) - b[i].vx);
            b[i].vy += align * ((ay / nN) - b[i].vy);
            b[i].vx += cohere * ((cx / nN) - b[i].x);
            b[i].vy += cohere * ((cy / nN) - b[i].y);
          }
          if (nS > 0) {
            b[i].vx += separate * sx * 6;
            b[i].vy += separate * sy * 6;
          }
          const v = Math.hypot(b[i].vx, b[i].vy);
          if (v > maxV) { b[i].vx = b[i].vx / v * maxV; b[i].vy = b[i].vy / v * maxV; }
          b[i].x += b[i].vx * (dt / 16);
          b[i].y += b[i].vy * (dt / 16);
          if (b[i].x < 0) b[i].x += 600; if (b[i].x > 600) b[i].x -= 600;
          if (b[i].y < 0) b[i].y += 300; if (b[i].y > 300) b[i].y -= 300;
        }
      }
      // draw
      ctx.fillStyle = 'rgba(10,10,10,0.35)';
      ctx.fillRect(0, 0, 600, 300);
      const b = boidsRef.current;
      for (const p of b) {
        const a = Math.atan2(p.vy, p.vx);
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(a) * 6, p.y + Math.sin(a) * 6);
        ctx.lineTo(p.x + Math.cos(a + 2.5) * 4, p.y + Math.sin(a + 2.5) * 4);
        ctx.lineTo(p.x + Math.cos(a - 2.5) * 4, p.y + Math.sin(a - 2.5) * 4);
        ctx.closePath();
        ctx.fillStyle = '#c4b5fd';
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, align, cohere, separate]);

  return (
    <Card id="emergence" index={10} icon={Users} title="Emergence" subtitle="Simple rules. No leader. Behavior that is nowhere in any single part." accent="violet">
      <p>
        A boid is a stripped-down bird with three local rules: <em>align</em> with neighbors, <em>cohere</em> toward their average position, <em>separate</em> from any that are too close. No boid knows what a flock is. The flock exists anyway.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto rounded-md bg-black" />
        <div className="mt-3 space-y-2">
          <Slider label="align"    value={align}    onChange={setAlign}  min={0}    max={0.2}   step={0.005} fmt={(v) => v.toFixed(3)} accent="sky" />
          <Slider label="cohere"   value={cohere}   onChange={setCohere} min={0}    max={0.02}  step={0.0005} fmt={(v) => v.toFixed(4)} accent="violet" />
          <Slider label="separate" value={separate} onChange={setSep}    min={0}    max={2.5}   step={0.05} fmt={(v) => v.toFixed(2)} accent="rose" />
          <PlayCtl playing={playing} onToggle={() => setPlaying((p) => !p)} onReset={init} speed={speed} setSpeed={setSpeed} />
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <ListRow icon={Sparkles}  title="'The whole is greater than the sum of the parts'" accent="violet">not mystical — just a consequence of the parts being <em>coupled</em>.</ListRow>
        <ListRow icon={CircleDot} title="No central plan is needed" accent="sky">markets set prices, ant colonies find food, neurons think — with only local rules.</ListRow>
        <ListRow icon={Brain}     title="Irreducibility" accent="fuchsia">you can't predict the flock from a neuron. You simulate it, or you watch.</ListRow>
        <ListRow icon={AlertTriangle} title="Cuts both ways" accent="rose">traffic jams, stampedes, bubbles, riots — also emergent, also from local rules.</ListRow>
      </ul>

      <div className="rounded-lg bg-violet-500/5 border border-violet-400/20 p-3 text-sm">
        <span className="text-violet-200 font-medium">Implication for intervention:</span> if behavior is emergent, changing a global target rarely helps — change the <em>local rules</em> agents follow, or the <em>medium</em> through which they interact.
      </div>
    </Card>
  );
};

/* =============================================================================
   ACT 4 — CHANGING SYSTEMS
   ============================================================================= */

// --- 11. Leverage points (Meadows' 12) --------------------------------------

const LEVERAGE = [
  { n: 12, label: 'Constants, parameters, numbers', note: 'Tax rates, minimum wage, subsidies. Easy to tweak; rarely changes the system\'s shape.' },
  { n: 11, label: 'Size of buffers and stocks',     note: 'Inventory, reserves, safety margins. Bigger buffers stabilize but slow response.' },
  { n: 10, label: 'Structure of stocks and flows',  note: 'Pipes, roads, org charts. Hard to change once built; shapes what\'s possible.' },
  { n: 9,  label: 'Lengths of delays',              note: 'Slower delays → more overshoot. Often the dominant tunable.' },
  { n: 8,  label: 'Strength of balancing loops',    note: 'Corrective response relative to impact; the gain on the thermostat.' },
  { n: 7,  label: 'Gain of reinforcing loops',      note: 'Slowing growth loops (interest, virality) is often more leveraged than strengthening B-loops.' },
  { n: 6,  label: 'Information flows',              note: 'Who sees what, when. New feedback to actors that didn\'t have it changes everything.' },
  { n: 5,  label: 'Rules (incentives, constraints)',note: 'Laws, incentives, contracts. The rules decide what loops can even form.' },
  { n: 4,  label: 'Self-organization',              note: 'The ability of the system to add, delete, or change its own structure.' },
  { n: 3,  label: 'Goals of the system',            note: 'What the system is trying to achieve — profit? health? growth? survival?' },
  { n: 2,  label: 'Paradigm the system arises from', note: 'The shared worldview: "growth is good", "nature is a resource", "markets know best".' },
  { n: 1,  label: 'Power to transcend paradigms',   note: 'Knowing no paradigm is true. Choosing which to use for which purpose.' },
];

const LeveragePoints = () => {
  const [open, setOpen] = useState(6);
  return (
    <Card id="leverage" index={11} icon={Target} title="Leverage Points (Meadows' 12)" subtitle="Where to intervene in a system — ranked from weakest to strongest." accent="fuchsia">
      <p>
        Donella Meadows' best-known insight: in any system, some intervention points are <em>orders of magnitude</em> more leveraged than others — and we almost always pick the wrong ones. We tune numbers when we should change rules; we change rules when we should question the paradigm. Here's the ladder, from most tempting (12) to most powerful (1).
      </p>

      <ul className="rounded-xl bg-black/40 border border-white/10 divide-y divide-white/5 overflow-hidden">
        {LEVERAGE.map((p) => {
          const strength = (13 - p.n) / 12;
          const isOpen = open === p.n;
          return (
            <li key={p.n}>
              <button
                onClick={() => setOpen(isOpen ? -1 : p.n)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                <span className="text-[10px] font-mono text-neutral-500 w-6 text-right">#{p.n}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400" style={{ width: `${strength * 100}%` }} />
                </div>
                <span className="text-sm text-neutral-200 flex-[2]">{p.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="px-4 pb-3 text-sm text-neutral-400">
                    {p.note}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-rose-300 mb-2">common low-leverage moves</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• nudging a KPI target up 5%</li>
            <li>• adding more budget to the failing team</li>
            <li>• raising/lowering an interest rate by 25bp</li>
            <li>• asking people to "try harder"</li>
          </ul>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2">common high-leverage moves</div>
          <ul className="space-y-1 text-neutral-200">
            <li>• giving a previously-blind actor new feedback (#6)</li>
            <li>• changing the incentive that creates the loop (#5)</li>
            <li>• letting the system restructure itself (#4)</li>
            <li>• changing what "success" means (#3, #2)</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-fuchsia-500/5 border border-fuchsia-400/20 p-3 text-sm">
        <span className="text-fuchsia-200 font-medium">Meadows' humility clause:</span> high-leverage points are often <em>counterintuitive</em>, and the system will resist. She warned that the deeper the point, the more it will "tear up the equipment" — including your own career.
      </div>
    </Card>
  );
};

// --- 12. Policy resistance / counterintuitive behavior ----------------------

const PolicyResistance = () => {
  const [push, setPush] = useState(0);
  // system has target 50; each actor resists being pushed away from their own preferred operating point
  const series = useMemo(() => {
    const N = 60;
    const actors = [30, 45, 50, 55, 70];
    const res = [];
    for (let t = 0; t < N; t++) {
      // your policy pushes the mean up by `push`
      // each actor counter-adjusts proportional to its distance from 50 (its anchor)
      const target = 50 + push;
      const pulled = actors.map((a) => a + (target - a) * 0.35);
      const counter = pulled.map((p, i) => p - (p - actors[i]) * 0.95 * (t / N));
      const mean = counter.reduce((s, v) => s + v, 0) / counter.length;
      res.push(mean);
    }
    return res;
  }, [push]);

  const W = 560, H = 170, padL = 34, padR = 10, padT = 10, padB = 22;
  const x = (i) => padL + (i / (series.length - 1)) * (W - padL - padR);
  const y = (v) => H - padB - ((v - 0) / 100) * (H - padT - padB);

  return (
    <Card id="policy-resistance" index={12} icon={Compass} title="Policy Resistance" subtitle="Why pushing harder often moves the system less, not more." accent="rose">
      <p>
        In systems with multiple actors — each with their own goals — a top-down push in one direction is partly neutralized by the reactions of the others. This is <strong className="text-rose-300">policy resistance</strong>: the harder a central policy pushes, the more the other loops compensate, until the net change on the stock is smaller than expected.
      </p>

      <ul className="space-y-2 text-sm">
        <ListRow icon={AlertTriangle} title="Prohibition → black markets" accent="rose">alcohol bans, drug wars, and price controls all reroute the flow elsewhere.</ListRow>
        <ListRow icon={AlertTriangle} title="Road building → more traffic" accent="rose">new lanes reduce friction; demand rises to consume them. Net commute time barely moves.</ListRow>
        <ListRow icon={AlertTriangle} title="Welfare traps, low-information taxation" accent="rose">actors adjust around the policy until its intended effect is half-lost.</ListRow>
      </ul>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={padL} y1={y(50)} x2={W - padR} y2={y(50)} stroke="#ffffff30" strokeDasharray="2 3" />
          <text x={W - padR} y={y(50) - 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="ui-monospace, monospace">baseline 50</text>
          {push !== 0 && (
            <>
              <line x1={padL} y1={y(50 + push)} x2={W - padR} y2={y(50 + push)} stroke="#fcd34d80" strokeDasharray="3 3" />
              <text x={W - padR} y={y(50 + push) - 4} textAnchor="end" fontSize="10" fill="#fcd34d" fontFamily="ui-monospace, monospace">your goal = {50 + push}</text>
            </>
          )}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#ffffff20" />
          <line x1={padL} y1={padT}     x2={padL}     y2={H - padB} stroke="#ffffff20" />
          <path d={series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')}
                fill="none" stroke="#fda4af" strokeWidth="2" />
          <text x={padL} y={padT + 10} fontSize="10" fill="#fda4af80" fontFamily="ui-monospace, monospace">achieved S(t)</text>
        </svg>
        <div className="mt-2 space-y-2">
          <Slider label="policy push" value={push} onChange={setPush} min={-30} max={30} step={1} accent="amber" />
          <div className="text-[11px] text-neutral-500">
            as <em>push</em> grows, the achieved level falls short of the goal — the other actors' loops snap the system back toward their own operating points.
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-rose-500/5 border border-rose-400/20 p-3 text-sm">
        <span className="text-rose-200 font-medium">Instead of pushing harder:</span> find the <em>shared goal</em> all actors can align on, and redesign incentives around it. Policy resistance is not stubbornness — it's other people's B-loops doing their jobs.
      </div>
    </Card>
  );
};

// --- 13. Habits of the systems thinker --------------------------------------

const Habits = () => {
  const rows = [
    { icon: Eye,          title: 'Look for stocks',            body: 'Ask "what is accumulating here?" before asking "what happened?"' },
    { icon: Clock,        title: 'Account for delays',         body: 'Always ask "how long until this acts?" Most arguments are about time lags in disguise.' },
    { icon: RefreshCw,    title: 'Close every loop',           body: "Whenever you draw an arrow A → B, ask if B → A exists. If it does, you haven't found the system until you've drawn it." },
    { icon: Users,        title: 'Respect the other actors',   body: 'Every "irrational" actor is usually a rational actor optimizing a different objective than yours.' },
    { icon: GitBranch,    title: 'Find the structure, not the villain', body: "When the same thing keeps happening, you're looking for a loop, not a person." },
    { icon: Target,       title: 'Intervene deeper than you want to', body: 'Event-level fixes are cheap and satisfying and rarely stick.' },
    { icon: Hourglass,    title: 'Go slow to go fast',         body: 'With delays, a smaller correction applied sooner beats a big correction applied later.' },
    { icon: Lightbulb,    title: 'Change mental models out loud', body: 'Paradigms shift by being named. Write down what you assume; notice what breaks.' },
    { icon: Scale,        title: 'Honor balancing loops',      body: "They're not obstacles; they're what has kept the system alive so far." },
    { icon: Sparkles,     title: 'Expect surprises, not failures', body: "If the system surprised you, you had a bad model. Update it — don't blame the system." },
  ];
  return (
    <Card id="habits" index={13} icon={ListChecks} title="Habits of a Systems Thinker" subtitle="Ten small questions that change how you think." accent="emerald">
      <p>
        Systems thinking is less a toolbox than a set of reflexes. None of these require a whiteboard; all of them are <em>habits of attention</em>. Adopting even three or four will dramatically shift the kinds of decisions you make.
      </p>
      <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
        {rows.map((r, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
              <r.icon className="w-3.5 h-3.5 text-emerald-300" />
            </span>
            <div>
              <div className="text-sm text-emerald-200 font-medium">{r.title}</div>
              <div className="text-sm text-neutral-300">{r.body}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-gradient-to-br from-sky-500/10 via-violet-500/10 to-fuchsia-500/10 border border-white/10 p-4 text-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-sky-200/80 mb-2">
          <BookOpen className="w-3.5 h-3.5" /> further reading
        </div>
        <ul className="space-y-1 text-neutral-200">
          <li>• Donella Meadows — <em>Thinking in Systems: A Primer</em> (the canonical intro)</li>
          <li>• Peter Senge — <em>The Fifth Discipline</em> (organizational application, archetypes)</li>
          <li>• Jay Forrester — <em>Industrial Dynamics</em> (founding text of system dynamics)</li>
          <li>• John Sterman — <em>Business Dynamics</em> (the rigorous, simulation-first treatment)</li>
          <li>• Meadows — <em>"Leverage Points: Places to Intervene in a System"</em> (the original essay)</li>
        </ul>
      </div>
    </Card>
  );
};

/* =============================================================================
   FOOTER — deep-dive index
   ============================================================================= */

const DEEP_DIVES = [
  { slug: 'linear-vs-circular', label: 'Linear vs circular causation' },
  { slug: 'iceberg',            label: 'The iceberg model' },
  { slug: 'stock-flow',         label: 'Stocks & flows (and calculus)' },
  { slug: 'reinforcing',        label: 'Reinforcing loops & exponentials' },
  { slug: 'balancing',          label: 'Balancing loops & goal-seeking' },
  { slug: 'delays',             label: 'Delays, overshoot, oscillation' },
  { slug: 'nonlinearity',       label: 'Nonlinearity, thresholds, hysteresis' },
  { slug: 'cld',                label: 'Causal loop diagrams in practice' },
  { slug: 'archetypes',         label: 'System archetypes (full library)' },
  { slug: 'emergence',          label: 'Emergence & agent-based models' },
  { slug: 'leverage',           label: 'Leverage points deep-dive' },
  { slug: 'policy-resistance',  label: 'Policy resistance & counterintuition' },
  { slug: 'habits',             label: 'Habits & further reading' },
];

const Footer = () => (
  <div className="max-w-3xl mx-auto mt-16 mb-24 px-4">
    <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 via-violet-500/10 to-fuchsia-500/10 border border-white/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-sky-300/80 mb-3">
        <ListChecks className="w-4 h-4" />
        <span>want to go deeper?</span>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-neutral-50 mb-4">Per-concept deep dives</h3>
      <p className="text-sm text-neutral-400 mb-6">
        Each concept on this page gets its own dedicated explainer, on demand — with full interactive toys, historical examples, and working dynamical models.
      </p>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {DEEP_DIVES.map((d) => (
          <li key={d.slug} className="flex items-center justify-between text-sm">
            <a href={`#${d.slug}`} className="text-neutral-200 hover:text-sky-200 transition-colors flex items-center gap-2">
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

export default function SystemsThinkingExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <ActHeader id="act-1" n="I" title="Seeing Systems" blurb="The mental shift: from chains of events to webs of accumulation and feedback." />
        <LinearVsCircular />
        <IcebergModel />
        <StockFlow />

        <ActHeader id="act-2" n="II" title="Feedback Loops" blurb="The atomic units of every dynamic system — and the sources of everything weird it does." />
        <ReinforcingLoop />
        <BalancingLoop />
        <DelayOscillation />
        <Nonlinearity />

        <ActHeader id="act-3" n="III" title="Reading Systems" blurb="How to draw, name, and recognize the shapes you meet in the wild." />
        <CLDiagramCard />
        <Archetypes />
        <Emergence />

        <ActHeader id="act-4" n="IV" title="Changing Systems" blurb="If you want to intervene: where to push, and how not to fool yourself." />
        <LeveragePoints />
        <PolicyResistance />
        <Habits />
      </main>

      <Footer />
    </div>
  );
}
