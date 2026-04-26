import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Network, Boxes, ShieldCheck, Scissors, MessageSquare, Timer,
  Compass, Play, Eye, EyeOff, Lightbulb, Link2, Ruler, CheckCircle2, XCircle,
  AlertTriangle, FlaskConical, Activity, HelpCircle, ChevronDown, ChevronRight,
  FileCode2, GitBranch, Search, Wrench, Map, BookOpen, Sparkles, Target,
  ArrowRight, ArrowLeftRight, CircleDot, Layers,
} from 'lucide-react';

/* ============================================================================
   Reading code you didn't write (yourself)
   A field guide to onboarding yourself to AI-built applications.
   Single-file React. Dark mode. Tailwind + lucide-react + framer-motion.
   ========================================================================== */

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
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

// --- Floating tooltip (portaled; survives transform ancestors) --------------

const FloatingTip = ({ hover, render, width = 300 }) => {
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

// --- Glossary + Term (hover-to-define) --------------------------------------

const GLOSS = {
  'AI-built code': 'Code generated in one or a few LLM passes, optimized for plausibility against a spec rather than for a human reader returning to it months later.',
  'AI-built app': 'An application whose code was primarily emitted by an LLM with light editing, vs. iterated by a human over time.',
  'load-bearing': 'A line (or function, or file) whose removal would change the program\'s observable behavior. The opposite of scaffolding.',
  'scaffolding': 'Code that was useful during generation — placeholders, logging, optional parameters never used, one-method classes — but is not load-bearing in production.',
  'defensive code': 'Guards against cases that cannot actually happen given the callers (null checks on internal arrays, try/catch that only re-throws). Protects the author\'s anxiety, not the program.',
  'confabulation': 'When an LLM answers a question about code it hasn\'t seen by inventing plausible-sounding details. The main failure mode of asking AI about its own code without grounding.',
  'trust boundary': 'A point in the system where data crosses from a less-trusted source to a more-trusted one (user → server, external API → your code). Where validation earns its keep.',
  'state ownership': 'The property of each piece of state being mutated from exactly one place, with everyone else reading. When ownership is diffuse, bugs compound.',
  'import graph': 'The static graph of which files import which. Tells you structural intent, not actual runtime behavior.',
  'runtime call graph': 'The graph of which functions actually call which at runtime for a given user action. Usually far smaller than the import graph.',
  'happy path': 'The most common successful trace through the system — e.g. "user logs in, creates a note, sees it in the list". Where you should always start reading.',
  'smoke test': 'A tiny test that asserts the happy path still works. One per feature, one line of signal — enough to catch most regressions instantly.',
  'optimistic update': 'A UI pattern where the client mutates local state immediately and reconciles with the server later. Common source of state-ownership confusion.',
  'madge': 'A Node.js tool that produces the static import graph of a JS/TS project as a diagram or text.',
  'pydeps': 'A Python tool that produces the static import graph of a Python project as a Graphviz diagram.',
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
  <div className="mt-2 mb-4 rounded-md border border-sky-400/25 bg-sky-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
    <div className="text-xs text-sky-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">carry this</span>
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
      <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">quick check</span>
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

const CrossLink = ({ to, children, recap }) => {
  const [hover, setHover] = useState(null);
  const track = (e) => setHover({ mx: e.clientX, my: e.clientY });
  const go = (e) => {
    e.preventDefault();
    const el = document.getElementById(to);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
      <a
        href={`#${to}`}
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

// New primitive — the user flagged "actionable" as a first-class constraint.
// Every card ends with a concrete 30s–5min action the reader can run on their own code.
const DoThisNow = ({ children, time }) => (
  <div className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-400/5 px-3 py-2.5 flex items-start gap-2">
    <Target className="w-3.5 h-3.5 mt-[2px] text-emerald-300 shrink-0" />
    <div className="flex-1 text-xs leading-snug">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300">do this now</span>
        {time && <span className="text-[9px] font-mono text-emerald-400/70">· {time}</span>}
      </div>
      <div className="text-neutral-100">{children}</div>
    </div>
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
              const isExternal = it.external || (isLink && !it.href.startsWith('#') && !it.href.startsWith('/#'));
              const Tag = isLink ? 'a' : 'div';
              const props = isLink
                ? { href: it.href, onClick: (e) => onClick(e, it.href),
                    target: isExternal ? '_blank' : undefined, rel: isExternal ? 'noopener noreferrer' : undefined }
                : {};
              return (
                <Tag key={j} {...props}
                  className={`group rounded-md border px-3 py-2 flex items-start gap-2 transition-colors no-underline ${
                    isLink
                      ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-400/30 cursor-pointer'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="mt-[3px] shrink-0 text-violet-300">
                    {isLink ? <Link2 className="w-3 h-3" /> : <Compass className="w-3 h-3 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs ${isLink ? 'text-neutral-100 group-hover:text-violet-200' : 'text-neutral-300'}`}>{it.label}</span>
                      {isExternal && <span className="text-[9px] text-neutral-500 font-mono">↗</span>}
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-600">find elsewhere</span>}
                    </div>
                    {it.note && <div className="text-[11px] text-neutral-400 leading-snug mt-0.5">{it.note}</div>}
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================================================================
   HERO
   ============================================================================ */

const FlowField = () => {
  const pts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: (i * 41) % 100, y: (i * 59) % 100, d: 7 + (i % 5) * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.x}%`} cy={`${p.y}%`} r="1.2"
          fill="#c4b5fd"
          initial={{ opacity: 0 }}
          animate={{ cx: [`${p.x}%`, `${(p.x + 50) % 100}%`], opacity: [0, 0.65, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.22, ease: 'linear' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-fuchsia-500/5 to-transparent" />
    <FlowField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-violet-200/80 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-400/20">
          <Code2 className="w-3.5 h-3.5" /> a field guide · for AI-built apps
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
          Reading code you didn't write
          <span className="block text-2xl md:text-3xl font-normal text-neutral-400 mt-2">(yourself)</span>
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          How to close the comprehension gap on an app an AI wrote for you —
          mental models for the first half, a workflow for every time you come back to it.
          Every card ends with something to do on <span className="text-emerald-300">your own code</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">gap</span>
          <span className="text-fuchsia-300">shape</span>
          <span className="text-rose-300">scaffolding</span>
          <span className="text-violet-300">connections</span>
          <span className="text-amber-300">ownership</span>
          <span className="text-emerald-300">trust</span>
          <span className="text-cyan-300">first pass</span>
          <span className="text-orange-300">interview</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

/* ============================================================================
   SECTION NAV
   ============================================================================ */

const SECTIONS = [
  { id: 'gap',        label: 'The gap',             icon: Layers },
  { id: 'shape',      label: 'Shape of AI code',    icon: Code2 },
  { id: 'scaffold',   label: 'Load-bearing vs. not',icon: Scissors },
  { id: 'connects',   label: 'What connects',       icon: Network },
  { id: 'ownership',  label: 'State ownership',     icon: Boxes },
  { id: 'trust',      label: 'Trust boundaries',    icon: ShieldCheck },
  { id: 'firstpass',  label: 'The 20-min first pass',icon: Timer },
  { id: 'interview',  label: 'Interviewing',        icon: MessageSquare },
  { id: 'pruning',    label: 'Pruning',             icon: Wrench },
  { id: 'safetynet',  label: 'Safety net',          icon: ShieldCheck },
  { id: 'trails',     label: 'Next trails',         icon: Compass },
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
      <nav className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20">
        <ul className="space-y-1 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tracking-wide">{s.label}</span>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-violet-500/10 border-violet-400/30 text-violet-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>{s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   01 — THE GAP
   ============================================================================ */

const GAP_LEFT = [
  { k: 'plaus',  text: 'Plausibility against the spec', note: 'Does this look like what was asked?' },
  { k: 'pass',   text: 'Passing the test as written',   note: 'Minimal edits to not break CI.' },
  { k: 'nosurp', text: 'Not surprising itself mid-stream', note: 'Stays on a consistent path once started.' },
  { k: 'cover',  text: 'Covering plausible edge cases',  note: 'Extra try/catch, extra null guards, "just in case".' },
];
const GAP_RIGHT = [
  { k: 'load',   text: 'What\'s load-bearing',          note: 'What breaks if I delete this line?' },
  { k: 'why',    text: 'Why this, not that',             note: 'What was considered and rejected?' },
  { k: 'constr', text: 'The real constraints',           note: 'Performance, security, legacy, team habit?' },
  { k: 'cut',    text: 'What I can cut without fear',    note: 'Which 30% can I safely delete?' },
];

const TheGap = () => {
  const [hov, setHov] = useState(null);
  return (
    <Card id="gap" icon={Layers} title="The gap" subtitle="AI writes code; you read code. Those are different jobs." accent="sky" index={1}>
      <MinSchema>
        An LLM optimizes the code it <em>writes</em>; a human optimizes the code they <em>live with</em>. Almost nothing that makes reading easier survives the generation step.
      </MinSchema>

      <p>
        When an AI writes code for you, the objective function running in its head is not
        "this will be easy to come back to in three months." It's{' '}
        <Term>plausibility</Term> — does this look like the thing that was asked,
        does it pass the tests, does it not embarrass the model mid-stream. That's
        a perfectly respectable objective. It's just not your objective when you open the
        file again.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-5 items-stretch">
          <div className="rounded-lg bg-sky-500/5 border border-sky-400/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300">what the AI optimizes for</div>
            </div>
            <ul className="space-y-1.5">
              {GAP_LEFT.map((it) => (
                <li key={it.k}
                    onMouseEnter={(e) => setHov({ ...it, side: 'L', mx: e.clientX, my: e.clientY })}
                    onMouseMove={(e) => setHov({ ...it, side: 'L', mx: e.clientX, my: e.clientY })}
                    onMouseLeave={() => setHov(null)}
                    className="text-xs text-sky-100 border border-sky-400/10 bg-sky-400/[0.03] rounded px-2 py-1.5 cursor-help hover:bg-sky-400/[0.08]">
                  {it.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center gap-3 text-neutral-500">
            <ArrowRight className="w-5 h-5 text-neutral-600" />
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 rotate-90 whitespace-nowrap">gap</div>
            <ArrowRight className="w-5 h-5 text-neutral-600" />
          </div>

          <div className="rounded-lg bg-fuchsia-500/5 border border-fuchsia-400/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-fuchsia-300" />
              <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">what you need 3 months later</div>
            </div>
            <ul className="space-y-1.5">
              {GAP_RIGHT.map((it) => (
                <li key={it.k}
                    onMouseEnter={(e) => setHov({ ...it, side: 'R', mx: e.clientX, my: e.clientY })}
                    onMouseMove={(e) => setHov({ ...it, side: 'R', mx: e.clientX, my: e.clientY })}
                    onMouseLeave={() => setHov(null)}
                    className="text-xs text-fuchsia-100 border border-fuchsia-400/10 bg-fuchsia-400/[0.03] rounded px-2 py-1.5 cursor-help hover:bg-fuchsia-400/[0.08]">
                  {it.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-neutral-500 leading-snug">
          What survives generation: <span className="text-emerald-300">working code</span>.
          What doesn't: <span className="text-rose-300">the reasoning trail, the rejected alternatives, the real constraints</span>.
          You can recover most of it — but only if you know it's missing.
        </div>

        <FloatingTip hover={hov} render={(h) => (
          <div>
            <div className="font-semibold text-neutral-100">{h.text}</div>
            <div className="mt-1 text-[11px] text-neutral-400">{h.note}</div>
          </div>
        )} />
      </div>

      <Misconception
        wrong={<>AI-written code is like human-written code, just <em>faster</em>.</>}
        right={<>It's code written toward a <em>different</em> objective. What looks like a stylistic choice is usually an artifact of one-pass generation.</>}
        because={<>The generator can't go back and prune. Every defensive check and extra layer it added survives into your repo as if you chose it.</>}
      />

      <DoThisNow time="2 min">
        Open any AI-built file. Find one comment. Ask: does it explain <em>why</em>, or just restate <em>what</em>?
        Scan 10 comments in the file. The WHAT/WHY ratio is a rough proxy for how much of the reasoning trail you lost.
      </DoThisNow>

      <Deeper>
        <p>
          <strong>Why this matters for you, specifically.</strong> The users who feel this gap
          most sharply are the ones shipping fastest — because the debt compounds at the
          rate you generate. One afternoon of AI-paired work = one afternoon of code to
          re-internalize later. Over a quarter, the surface area of code you've "written"
          dwarfs the surface area of code you've <em>understood</em>. Closing that gap isn't
          one cleanup session; it's a small recurring workflow (
          <CrossLink to="firstpass" recap="A structured 20-minute first-contact protocol for AI-built apps.">cards 7–10</CrossLink>
          ).
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   02 — THE SHAPE OF AI CODE
   ============================================================================ */

// Same feature — "save a user" — rendered two ways.
// Click a line to see the pathology attached to it.

const SHAPE_AI = [
  { t: '// Handles creating or updating a user with full validation.', p: 'over-comment',   note: 'Restates what the function name says.' },
  { t: '// Throws ValidationError on invalid input.', p: 'over-comment',   note: 'Already encoded in the types; Pydantic/Zod throws.' },
  { t: 'export class UserService {',                   p: 'over-abstract', note: 'One class, one method, one caller. A function would do.' },
  { t: '  private repo: UserRepository;',              p: 'over-abstract', note: 'Injected dependency used in exactly one place.' },
  { t: '  private logger: Logger;',                    p: 'scaffold',      note: 'Logger set up but only used for debug noise.' },
  { t: '  constructor(opts: UserServiceOptions = {}) {', p: 'param',       note: 'Premature parameterization — no caller passes opts.' },
  { t: '    this.repo = opts.repo ?? new UserRepository();', p: 'defensive', note: 'opts.repo is never set. The `??` branch is dead.' },
  { t: '    this.logger = opts.logger ?? new Logger("users");', p: 'scaffold', note: 'Same: the fallback is the only path taken.' },
  { t: '  }',                                          p: null,            note: null },
  { t: '  async save(input: unknown) {',               p: 'load',          note: 'The actual entrypoint.' },
  { t: '    if (!input) return null;',                 p: 'defensive',     note: 'Internal callers never pass null.' },
  { t: '    try {',                                    p: 'defensive',     note: 'Catches nothing it handles differently.' },
  { t: '      const user = UserSchema.parse(input);',  p: 'load',          note: 'The real validation — throws on bad input.' },
  { t: '      this.logger.debug("saving user", user);',p: 'scaffold',      note: 'Debug log nobody reads.' },
  { t: '      const saved = await this.repo.save(user);',p: 'load',        note: 'The real write.' },
  { t: '      return saved;',                          p: 'load',          note: null },
  { t: '    } catch (e) {',                            p: 'defensive',     note: null },
  { t: '      this.logger.error(e);',                  p: 'scaffold',      note: null },
  { t: '      throw e;',                               p: 'defensive',     note: 'Re-throws the same error. The try/catch achieves nothing.' },
  { t: '    }',                                        p: null,            note: null },
  { t: '  }',                                          p: null,            note: null },
  { t: '}',                                            p: null,            note: null },
];

const SHAPE_HUMAN = [
  { t: 'import { UserSchema } from "./schema";',       p: 'load',  note: 'One import.' },
  { t: 'import { db } from "./db";',                   p: 'load',  note: null },
  { t: '',                                             p: null,    note: null },
  { t: 'export async function saveUser(input: unknown) {', p: 'load', note: 'Flat function. One caller.' },
  { t: '  const user = UserSchema.parse(input);',      p: 'load',  note: 'Throws on bad input; no guard needed.' },
  { t: '  return db.users.upsert(user);',              p: 'load',  note: 'One write. Done.' },
  { t: '}',                                            p: null,    note: null },
];

const PATHOLOGY = {
  'load':        { label: 'Load-bearing',    color: '#6ee7b7' },
  'defensive':   { label: 'Defensive guard', color: '#fca5a5' },
  'scaffold':    { label: 'Scaffolding',     color: '#fcd34d' },
  'over-abstract': { label: 'Over-abstraction', color: '#c4b5fd' },
  'over-comment':{ label: 'Over-comment',    color: '#93c5fd' },
  'param':       { label: 'Premature param', color: '#f0abfc' },
};

const CodeLine = ({ line, i, onHover, hovered }) => {
  const p = line.p ? PATHOLOGY[line.p] : null;
  const isHover = hovered === i;
  return (
    <div
      onMouseEnter={(e) => line.p && onHover({ i, p: line.p, note: line.note, mx: e.clientX, my: e.clientY })}
      onMouseMove={(e) => line.p && onHover({ i, p: line.p, note: line.note, mx: e.clientX, my: e.clientY })}
      onMouseLeave={() => onHover(null)}
      className={`group flex items-center gap-2 pr-2 text-[12px] font-mono leading-[1.55rem] transition-colors ${
        line.p ? 'cursor-help' : ''
      } ${isHover ? 'bg-white/[0.06]' : line.p ? 'hover:bg-white/[0.04]' : ''}`}
    >
      <span className="w-6 text-right text-[10px] tabular-nums text-neutral-600 select-none">{i + 1}</span>
      <span className="w-[3px] self-stretch" style={{ background: p ? p.color + (isHover ? 'ff' : '88') : 'transparent' }} />
      <span className={`flex-1 whitespace-pre ${line.p ? 'text-neutral-100' : 'text-neutral-300'}`}>{line.t || '\u00A0'}</span>
    </div>
  );
};

const ShapeOfAICode = () => {
  const [hov, setHov] = useState(null);
  const [highlight, setHighlight] = useState(null);
  return (
    <Card id="shape" icon={Code2} title="The shape of AI code" subtitle="One-shot vs. iterated: the same feature, two widths" accent="fuchsia" index={2}>
      <MinSchema>
        One-shot code is <em>wider</em> and more defensive than necessary. Iterated code is <em>narrower</em> and more committed. The shape is a fingerprint.
      </MinSchema>

      <p>
        Same feature — save a user. Left panel is what a careful AI produces in one pass: extra layers,
        extra guards, extra logging "just in case." Right panel is the same feature after a human has
        trimmed it for a week. <strong>Hover any colored line</strong> to see what it's doing (or not doing).
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/50 border border-fuchsia-400/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-fuchsia-400/15 bg-fuchsia-400/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-200">one-shot AI</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">22 lines</span>
          </div>
          <div className="py-2">
            {SHAPE_AI.map((line, i) => (
              <CodeLine key={i} line={line} i={i} onHover={setHov} hovered={hov?.i} />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-black/50 border border-emerald-400/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-emerald-400/15 bg-emerald-400/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">iterated (human)</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">7 lines</span>
          </div>
          <div className="py-2">
            {SHAPE_HUMAN.map((line, i) => (
              <CodeLine key={i} line={line} i={i} onHover={setHov} hovered={null} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {Object.entries(PATHOLOGY).map(([k, v]) => (
          <button key={k}
            onClick={() => setHighlight(highlight === k ? null : k)}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded border transition-colors ${
              highlight === k ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
            }`}>
            <span className="w-2 h-2 rounded-sm" style={{ background: v.color }} />
            <span className="text-neutral-200">{v.label}</span>
          </button>
        ))}
      </div>

      <FloatingTip hover={hov} render={(h) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: PATHOLOGY[h.p].color }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: PATHOLOGY[h.p].color }}>{PATHOLOGY[h.p].label}</span>
          </div>
          {h.note && <div className="mt-1 text-[11px] text-neutral-300 leading-snug">{h.note}</div>}
        </div>
      )} />

      <Predict question="In a typical 20-line AI-generated function, what fraction of the lines do you think are load-bearing?">
        Usually <strong className="text-emerald-300">30–50%</strong>. The rest is scaffolding, defensive
        guards, and over-abstraction. This means you can often delete half the file on a good day.
      </Predict>

      <DoThisNow time="3 min">
        In one of your apps, find the longest function signature. If it has <strong>≥5 parameters</strong> or
        <strong> ≥3 optional flags</strong>, that's premature parameterization — check each flag's call-site.
        You'll typically find zero, one, or all callers pass the same value.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   03 — LOAD-BEARING VS SCAFFOLDING  (interactive labeling)
   ============================================================================ */

const LABEL_CYCLE = ['none', 'load', 'defensive', 'scaffold', 'dead'];
const LABEL_META = {
  none:      { color: '#444', label: '—',              text: 'text-neutral-600' },
  load:      { color: '#6ee7b7', label: 'Load-bearing', text: 'text-emerald-200' },
  defensive: { color: '#fca5a5', label: 'Defensive',    text: 'text-rose-200' },
  scaffold:  { color: '#fcd34d', label: 'Scaffolding',  text: 'text-amber-200' },
  dead:      { color: '#a1a1aa', label: 'Dead',         text: 'text-neutral-400' },
};

const SAMPLE = [
  { t: `import { db } from './db';`,                                 truth: 'load',      why: 'Used by save() below.' },
  { t: `import { Logger } from './logger';`,                         truth: 'scaffold',  why: 'Only consumed by noise-level debug logs.' },
  { t: `import { retry } from './utils';`,                           truth: 'dead',      why: 'Never referenced anywhere in this file.' },
  { t: ``,                                                            truth: null,        why: null },
  { t: `const logger = new Logger('notes');`,                        truth: 'scaffold',  why: 'Feeds only debug/error logs nobody reads.' },
  { t: ``,                                                            truth: null,        why: null },
  { t: `export class NotesService {`,                                truth: 'scaffold',  why: 'One-method class. A function would serve.' },
  { t: `  constructor(options = {}) {`,                              truth: 'scaffold',  why: 'Options never passed by any caller.' },
  { t: `    this.db = options.db || db;`,                            truth: 'defensive', why: 'options.db is always undefined.' },
  { t: `    this.logger = options.logger || logger;`,                truth: 'scaffold',  why: 'Logger chain — none of it runs in prod.' },
  { t: `  }`,                                                         truth: null,        why: null },
  { t: ``,                                                            truth: null,        why: null },
  { t: `  async save(note) {`,                                        truth: 'load',      why: 'The one real entry point.' },
  { t: `    if (!note) return null;`,                                 truth: 'defensive', why: 'No caller passes null; callers come from a typed API.' },
  { t: `    const validated = this.validate(note);`,                  truth: 'load',      why: 'Real validation happens here.' },
  { t: `    this.logger.debug('saving', validated);`,                 truth: 'scaffold',  why: 'Debug log — pure noise.' },
  { t: `    const result = await this.db.insert(validated);`,         truth: 'load',      why: 'The write.' },
  { t: `    return result;`,                                          truth: 'load',      why: null },
  { t: `  }`,                                                         truth: null,        why: null },
  { t: ``,                                                            truth: null,        why: null },
  { t: `  validate(note) {`,                                          truth: 'load',      why: null },
  { t: `    if (!note.text) throw new Error('text required');`,       truth: 'load',      why: 'Real contract check.' },
  { t: `    return note;`,                                            truth: 'load',      why: null },
  { t: `  }`,                                                         truth: null,        why: null },
  { t: ``,                                                            truth: null,        why: null },
  { t: `  _sanitize(text) {`,                                         truth: 'dead',      why: 'Never called.' },
  { t: `    return text.trim();`,                                     truth: 'dead',      why: null },
  { t: `  }`,                                                         truth: null,        why: null },
  { t: `}`,                                                           truth: null,        why: null },
];

const LoadBearingVsScaffolding = () => {
  const [labels, setLabels] = useState(() => SAMPLE.map(() => 'none'));
  const [revealed, setRevealed] = useState(false);
  const cycle = (i) => {
    if (revealed) return;
    if (SAMPLE[i].truth == null) return;
    setLabels((arr) => {
      const c = [...arr];
      const cur = c[i];
      const next = LABEL_CYCLE[(LABEL_CYCLE.indexOf(cur) + 1) % LABEL_CYCLE.length];
      c[i] = next;
      return c;
    });
  };
  const reset = () => { setLabels(SAMPLE.map(() => 'none')); setRevealed(false); };

  const score = useMemo(() => {
    let right = 0, total = 0;
    SAMPLE.forEach((ln, i) => {
      if (ln.truth) {
        total++;
        if (labels[i] === ln.truth) right++;
      }
    });
    return { right, total, pct: total ? Math.round((right / total) * 100) : 0 };
  }, [labels]);

  const counts = useMemo(() => {
    const c = { load: 0, defensive: 0, scaffold: 0, dead: 0 };
    SAMPLE.forEach((ln) => { if (ln.truth) c[ln.truth]++; });
    return c;
  }, []);

  return (
    <Card id="scaffold" icon={Scissors} title="Load-bearing vs. scaffolding" subtitle="Most lines in an AI file are not doing what you think" accent="rose" index={3}>
      <MinSchema>
        Learn to see <Term>scaffolding</Term> and you stop fearing the file. Deleting scaffolding is free; leaving it in compounds into a codebase you can't edit without anxiety.
      </MinSchema>

      <p>
        Below is an AI-generated <code className="text-rose-200">NotesService</code>. Click each highlighted line
        to cycle through labels — <span className="text-emerald-300">load-bearing</span>,{' '}
        <span className="text-rose-300">defensive</span>, <span className="text-amber-300">scaffolding</span>,{' '}
        <span className="text-neutral-400">dead</span>. When you're ready, hit <em>Reveal</em> to see the ground truth.
      </p>

      <div className="rounded-xl bg-black/50 border border-rose-400/20 overflow-hidden">
        <div className="px-3 py-2 border-b border-rose-400/15 bg-rose-400/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-[11px] font-mono text-rose-100">NotesService.js</span>
          </div>
          <div className="flex items-center gap-2">
            {!revealed && (
              <button onClick={() => setRevealed(true)}
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> reveal</span>
              </button>
            )}
            <button onClick={reset}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-white/15 bg-white/5 text-neutral-300 hover:bg-white/10">
              reset
            </button>
          </div>
        </div>
        <div className="py-2">
          {SAMPLE.map((ln, i) => {
            const userLabel = labels[i];
            const truth = ln.truth;
            const shown = revealed && truth ? truth : userLabel;
            const meta = LABEL_META[shown] || LABEL_META.none;
            const correct = revealed && truth && userLabel === truth;
            const wrong = revealed && truth && userLabel !== 'none' && userLabel !== truth;
            return (
              <button key={i} onClick={() => cycle(i)}
                disabled={!truth || revealed}
                className={`group w-full flex items-center gap-2 pr-2 text-[12px] font-mono leading-[1.55rem] transition-colors text-left ${
                  truth && !revealed ? 'cursor-pointer hover:bg-white/[0.04]' : 'cursor-default'
                }`}>
                <span className="w-6 text-right text-[10px] tabular-nums text-neutral-600 select-none">{i + 1}</span>
                <span className="w-[3px] self-stretch" style={{ background: truth ? meta.color : 'transparent' }} />
                <span className={`flex-1 whitespace-pre ${truth ? 'text-neutral-100' : 'text-neutral-500'}`}>{ln.t || '\u00A0'}</span>
                {truth && (
                  <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
                    correct ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' :
                    wrong   ? 'border-rose-400/40 bg-rose-400/10 text-rose-200' :
                    shown === 'none' ? 'border-white/10 bg-white/[0.02] text-neutral-500' :
                                       'border-white/15 bg-white/5 text-neutral-200'
                  }`}>
                    {correct && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {wrong && <XCircle className="w-2.5 h-2.5" />}
                    {LABEL_META[shown].label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-baseline gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">your score</div>
              <div className="text-2xl font-mono text-neutral-100">{score.right}<span className="text-neutral-500">/{score.total}</span>
                <span className="ml-2 text-sm text-neutral-400">({score.pct}%)</span>
              </div>
            </div>
            <div className="flex-1 min-w-[200px] grid grid-cols-4 gap-2">
              {Object.entries(counts).map(([k, v]) => (
                <div key={k} className="rounded border border-white/10 bg-black/30 px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: LABEL_META[k].color }} />
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400">{LABEL_META[k].label}</span>
                  </div>
                  <div className="text-sm font-mono text-neutral-100 mt-0.5">{v}<span className="text-neutral-500 text-[10px]"> lines</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-neutral-400 leading-snug">
            Out of {SAMPLE.filter(l => l.truth).length} labeled lines, {counts.load} are genuinely load-bearing.
            The rest ({counts.defensive + counts.scaffold + counts.dead}) can typically be removed without any user-visible change.
          </div>
        </motion.div>
      )}

      <Misconception
        wrong={<>Every <code>try/catch</code> protects production from a crash.</>}
        right={<>Most AI-written try/catches either re-throw (no-op) or swallow errors into a log nobody reads. Delete them; the program is better for it.</>}
        because={<>AI tends to add guards at the <em>first plausible seam</em>, not at the actual trust boundary. Without the reasoning trail, you can't tell which catches are load-bearing.</>}
      />

      <DoThisNow time="5 min">
        Pick a function you suspect is scaffolding. Delete it. Run the app through its{' '}
        <Term>happy path</Term>. If nothing breaks in 2 minutes of use, commit the deletion
        with a message like <code className="text-emerald-200">"remove unused NotesService wrapper"</code>. Repeat weekly.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   04 — WHAT CONNECTS TO WHAT  (HERO)
   ============================================================================ */

// Polyglot toy app: React frontend ↔ FastAPI backend, saving a note.
// Three views disagree: imports, runtime trace, state ownership.

const GRAPH_NODES = [
  // Frontend
  { id: 'App',       label: 'App.tsx',       side: 'fe', x: 60,  y: 40,  role: 'View',   desc: 'Top-level component — imports NoteList and NoteEditor.' },
  { id: 'Editor',    label: 'NoteEditor',    side: 'fe', x: 60,  y: 110, role: 'View',   desc: 'Textarea + save button. Calls useNotes().' },
  { id: 'List',      label: 'NoteList',      side: 'fe', x: 200, y: 110, role: 'View',   desc: 'Renders current notes. Calls useNotes().' },
  { id: 'useNotes',  label: 'useNotes',      side: 'fe', x: 130, y: 200, role: 'Hook',   desc: 'Wraps API + store. Mutates `notes` optimistically.' },
  { id: 'api',       label: 'api.ts',        side: 'fe', x: 60,  y: 290, role: 'Client', desc: 'fetch() wrapper — reads authToken from store to attach Bearer header.' },
  { id: 'store',     label: 'store.ts',      side: 'fe', x: 200, y: 290, role: 'Store',  desc: 'Zustand store — owns `notes` and `authToken`.' },
  // Backend
  { id: 'main',      label: 'main.py',       side: 'be', x: 430, y: 40,  role: 'Server', desc: 'FastAPI routes. Depends on auth, validators, db.' },
  { id: 'auth',      label: 'auth.py',       side: 'be', x: 550, y: 110, role: 'Server', desc: 'Bearer token → user lookup. Middleware.' },
  { id: 'validators',label: 'validators.py', side: 'be', x: 430, y: 110, role: 'Server', desc: 'Extra note validation — redundant with Pydantic.' },
  { id: 'models',    label: 'models.py',     side: 'be', x: 550, y: 200, role: 'Model',  desc: 'NoteIn/NoteOut Pydantic models.' },
  { id: 'db',        label: 'db.py',         side: 'be', x: 430, y: 200, role: 'Data',   desc: 'SQL insert/select. Returns dict rows.' },
];

const ROLE_COLOR = {
  View:   '#c4b5fd',
  Hook:   '#f0abfc',
  Client: '#93c5fd',
  Store:  '#fbbf24',
  Server: '#6ee7b7',
  Model:  '#7dd3fc',
  Data:   '#fca5a5',
};

// [from, to, { label? }]
const IMPORT_EDGES = [
  ['App', 'Editor'], ['App', 'List'],
  ['Editor', 'useNotes'], ['List', 'useNotes'],
  ['useNotes', 'api'], ['useNotes', 'store'],
  ['api', 'store'],
  ['main', 'auth'], ['main', 'validators'], ['main', 'db'],
  ['auth', 'models'], ['validators', 'models'], ['db', 'models'],
];

const RUNTIME_EDGES = [
  // trace: user hits Save in NoteEditor → note lands in DB
  ['Editor', 'useNotes',  { step: 1 }],
  ['useNotes', 'store',   { step: 2, note: 'optimistic insert' }],
  ['useNotes', 'api',     { step: 3 }],
  ['api', 'store',        { step: 4, note: 'read authToken' }],
  ['api', 'main',         { step: 5, cross: true, note: 'HTTP POST /notes' }],
  ['main', 'auth',        { step: 6 }],
  ['main', 'validators',  { step: 7, redundant: true }],
  ['validators', 'models',{ step: 8 }],
  ['main', 'db',          { step: 9 }],
  ['db', 'models',        { step: 10 }],
];

// Ownership edges: { from: owner, to: writer, state: 'xyz', cross: true/false }
const OWNERSHIP_EDGES = [
  { from: 'store', to: 'useNotes', state: 'notes',     cross: true,  note: '`notes` is owned by the store but `useNotes` writes to it directly via setNotes.' },
  { from: 'store', to: 'api',      state: 'authToken', cross: false, note: '`api.ts` reads authToken (read-only). OK.' },
  { from: 'db',    to: 'main',     state: 'note row',  cross: false, note: 'main.py receives a row returned by db.py. No shared mutation.' },
  { from: 'Editor',to: 'Editor',   state: 'draftText', cross: false, note: 'Local useState, owned by the component. Clean.' },
];

const nodeById = Object.fromEntries(GRAPH_NODES.map(n => [n.id, n]));

const TOY_FILES = {
  'App':       `// App.tsx\nimport { NoteEditor } from './components/NoteEditor';\nimport { NoteList } from './components/NoteList';\n\nexport default function App() {\n  return (\n    <div className="app">\n      <NoteList />\n      <NoteEditor />\n    </div>\n  );\n}`,
  'Editor':    `// NoteEditor.tsx\nimport { useState } from 'react';\nimport { useNotes } from '../hooks/useNotes';\n\nexport function NoteEditor() {\n  const { saveNote } = useNotes();\n  const [draft, setDraft] = useState('');\n  return (\n    <>\n      <textarea value={draft} onChange={e => setDraft(e.target.value)} />\n      <button onClick={() => { saveNote({ text: draft }); setDraft(''); }}>\n        Save\n      </button>\n    </>\n  );\n}`,
  'List':      `// NoteList.tsx\nimport { useNotes } from '../hooks/useNotes';\n\nexport function NoteList() {\n  const { notes } = useNotes();\n  return notes.map(n => <div key={n.id}>{n.text}</div>);\n}`,
  'useNotes':  `// useNotes.ts\nimport { useStore } from '../store/notes';\nimport { api } from '../lib/api';\n\nexport function useNotes() {\n  const notes = useStore(s => s.notes);\n  const setNotes = useStore(s => s.setNotes);\n\n  const saveNote = async (note) => {\n    // optimistic — writes the store's state from here\n    setNotes([...notes, { ...note, id: 'tmp', pending: true }]);\n    const saved = await api.post('/notes', note);\n    setNotes([...notes.filter(n => n.id !== 'tmp'), saved]);\n  };\n\n  return { notes, saveNote };\n}`,
  'api':       `// api.ts\nimport { useStore } from '../store/notes';\n\nexport const api = {\n  async post(url, body) {\n    const token = useStore.getState().authToken;\n    const res = await fetch(url, {\n      method: 'POST',\n      headers: { Authorization: \`Bearer \${token}\` },\n      body: JSON.stringify(body),\n    });\n    return res.json();\n  }\n};`,
  'store':     `// store/notes.ts\nimport { create } from 'zustand';\n\nexport const useStore = create((set) => ({\n  notes: [],\n  authToken: null,\n  setNotes: (notes) => set({ notes }),\n  setToken: (token) => set({ authToken: token }),\n}));`,
  'main':      `# main.py\nfrom fastapi import FastAPI, Depends\nfrom .auth import require_user\nfrom .models import NoteIn, NoteOut\nfrom .validators import validate_note\nfrom .db import insert_note\n\napp = FastAPI()\n\n@app.post("/notes", response_model=NoteOut)\ndef create_note(note: NoteIn, user = Depends(require_user)):\n    validate_note(note)   # redundant — NoteIn already parsed\n    return insert_note(user.id, note)`,
  'auth':      `# auth.py\nfrom fastapi import Header, HTTPException\nfrom .models import User\n\ndef require_user(authorization: str = Header(...)):\n    token = authorization.removeprefix("Bearer ")\n    user = lookup_user_by_token(token)\n    if not user:\n        raise HTTPException(401)\n    return user`,
  'validators':`# validators.py\n# kept "just in case" — the Pydantic model already enforces these.\ndef validate_note(note):\n    if not note.text:\n        raise ValueError("empty")\n    if len(note.text) > 10000:\n        raise ValueError("too long")\n    return True`,
  'models':    `# models.py\nfrom pydantic import BaseModel, Field\n\nclass NoteIn(BaseModel):\n    text: str = Field(min_length=1, max_length=10000)\n\nclass NoteOut(NoteIn):\n    id: int\n    user_id: int\n\nclass User(BaseModel):\n    id: int`,
  'db':        `# db.py\nimport sqlite3\nfrom .models import NoteIn, NoteOut\n\ndef insert_note(user_id: int, note: NoteIn) -> NoteOut:\n    row = { "user_id": user_id, **note.dict() }\n    # SQL INSERT ... RETURNING ...\n    return NoteOut(id=1, **row)`,
};

const VIEWS = [
  { id: 'imports', label: 'Imports',        icon: GitBranch,    tip: 'Static imports. Many edges. Looks clean and modular.' },
  { id: 'runtime', label: 'Runtime calls',  icon: Play,         tip: 'Trace of "save a note". Fewer edges — different shape. The HTTP boundary is the narrowest waist.' },
  { id: 'owner',   label: 'State ownership',icon: Boxes,        tip: 'Who writes each piece of state. Red = writer crosses a boundary it doesn\'t own.' },
];

const WhatConnectsToWhat = () => {
  const [view, setView] = useState('imports');
  const [hoverNode, setHoverNode] = useState(null);
  const [selected, setSelected] = useState('useNotes');
  const W = 660, H = 360;

  const edges = useMemo(() => {
    if (view === 'imports')   return IMPORT_EDGES.map(([a, b]) => ({ a, b }));
    if (view === 'runtime')   return RUNTIME_EDGES.map(([a, b, m]) => ({ a, b, ...m }));
    return OWNERSHIP_EDGES.filter(e => e.from !== e.to).map(e => ({ a: e.from, b: e.to, state: e.state, cross: e.cross, note: e.note }));
  }, [view]);

  const neighborsOf = (id) => {
    const s = new Set();
    edges.forEach(e => { if (e.a === id) s.add(e.b); if (e.b === id) s.add(e.a); });
    return s;
  };
  const neighbors = hoverNode ? neighborsOf(hoverNode) : null;

  const curvedPath = (a, b) => {
    const src = nodeById[a], dst = nodeById[b];
    const x0 = src.x + 50, y0 = src.y + 18;
    const x1 = dst.x, y1 = dst.y + 18;
    const mx = (x0 + x1) / 2;
    return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  };

  const edgeColor = (e) => {
    if (view === 'runtime') {
      if (e.redundant) return '#fca5a5';
      if (e.cross)     return '#f0abfc';
      return '#7dd3fc';
    }
    if (view === 'owner') {
      return e.cross ? '#fb7185' : '#6ee7b7';
    }
    return '#a1a1aa'; // imports
  };

  const selectedNode = nodeById[selected];

  return (
    <Card id="connects" icon={Network} title="What connects to what" subtitle="Three graphs of the same toy app — and they disagree" accent="violet" index={4}>
      <MinSchema>
        <strong>Imports</strong>, <strong>runtime calls</strong>, and <strong>ownership</strong> are three different graphs
        drawn from the same files. Where they disagree is where your mental model has to live.
      </MinSchema>

      <p>
        The example below is a minimal <strong>polyglot</strong> app: a React frontend (6 files) that saves notes to a
        Python/FastAPI backend (5 files). Toggle the views. Hover a node to isolate its neighbors. Click a node to see the real code.
      </p>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map(v => {
          const Icon = v.icon;
          return (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md border transition-colors ${
                view === v.id ? 'bg-violet-500/15 border-violet-400/40 text-violet-100' : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {v.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="text-[10px] text-neutral-500 self-center italic max-w-[260px] text-right">
          {VIEWS.find(v => v.id === view)?.tip}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-3">
        <div className="rounded-xl bg-black/50 border border-violet-400/20 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHoverNode(null)}>
            <defs>
              <marker id="arrhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#e5e5e5" opacity="0.7" />
              </marker>
              <marker id="arrhead-cross" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#fb7185" />
              </marker>
              <marker id="arrhead-runtime" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#7dd3fc" />
              </marker>
              <marker id="arrhead-boundary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#f0abfc" />
              </marker>
            </defs>

            {/* HTTP boundary divider */}
            <line x1={355} y1="10" x2={355} y2={H - 10} stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 4" />
            <text x={355} y={26} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.12em' }}>
              HTTP
            </text>
            <text x={120} y="24" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.15em' }}>
              FRONTEND · TS
            </text>
            <text x={510} y="24" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.15em' }}>
              BACKEND · PY
            </text>

            {edges.map((e, i) => {
              const color = edgeColor(e);
              const dim = hoverNode && e.a !== hoverNode && e.b !== hoverNode;
              const marker =
                view === 'owner' && e.cross ? 'url(#arrhead-cross)' :
                view === 'runtime' && e.cross ? 'url(#arrhead-boundary)' :
                view === 'runtime' ? 'url(#arrhead-runtime)' : 'url(#arrhead)';
              return (
                <g key={i} opacity={dim ? 0.15 : 1}>
                  <path d={curvedPath(e.a, e.b)}
                        fill="none" stroke={color}
                        strokeWidth={view === 'imports' ? 1.1 : 1.6}
                        strokeDasharray={view === 'runtime' && e.cross ? '5 3' : undefined}
                        markerEnd={marker}
                        opacity={view === 'imports' ? 0.5 : 0.85} />
                  {view === 'runtime' && e.step != null && (
                    <g>
                      {(() => {
                        const src = nodeById[e.a], dst = nodeById[e.b];
                        const mx = (src.x + 50 + dst.x) / 2;
                        const my = (src.y + dst.y) / 2 + 18;
                        return (
                          <>
                            <circle cx={mx} cy={my} r="8" fill="#0a0a0a" stroke={color} strokeWidth="1" />
                            <text x={mx} y={my + 3} fontSize="9" textAnchor="middle" fill={color} fontFamily="ui-monospace">{e.step}</text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                  {view === 'owner' && e.state && (
                    <g>
                      {(() => {
                        const src = nodeById[e.a], dst = nodeById[e.b];
                        const mx = (src.x + 50 + dst.x) / 2;
                        const my = (src.y + dst.y) / 2 + 12;
                        return (
                          <text x={mx} y={my} fontSize="9" textAnchor="middle"
                                fill={e.cross ? '#fca5a5' : '#a3a3a3'}
                                fontFamily="ui-monospace" style={{ letterSpacing: '0.04em' }}>
                            {e.state}
                          </text>
                        );
                      })()}
                    </g>
                  )}
                </g>
              );
            })}

            {GRAPH_NODES.map((n) => {
              const isHover = hoverNode === n.id;
              const isDim = hoverNode && hoverNode !== n.id && !(neighbors && neighbors.has(n.id));
              const isSelected = selected === n.id;
              const fill = ROLE_COLOR[n.role] || '#c4b5fd';
              return (
                <g key={n.id}
                   onMouseEnter={() => setHoverNode(n.id)}
                   onMouseMove={() => setHoverNode(n.id)}
                   onClick={() => setSelected(n.id)}
                   style={{ cursor: 'pointer' }}
                   opacity={isDim ? 0.3 : 1}>
                  <rect x={n.x} y={n.y} width={50} height={36} rx={6}
                        fill={isSelected ? fill : '#0a0a0a'}
                        stroke={fill}
                        strokeWidth={isHover || isSelected ? 2 : 1} />
                  <text x={n.x + 25} y={n.y + 16} fontSize="9.5" textAnchor="middle"
                        fill={isSelected ? '#0a0a0a' : fill}
                        fontFamily="ui-monospace" fontWeight="500">
                    {n.label.length > 10 ? n.label.slice(0, 10) : n.label}
                  </text>
                  <text x={n.x + 25} y={n.y + 28} fontSize="7.5" textAnchor="middle"
                        fill={isSelected ? '#0a0a0a99' : '#737373'}
                        fontFamily="ui-monospace" style={{ letterSpacing: '0.1em' }}>
                    {n.role.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap text-[10px] text-neutral-400">
              {view === 'imports' && (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-[2px] bg-neutral-400" /> static import
                </span>
              )}
              {view === 'runtime' && (
                <>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-[2px] bg-sky-300" /> local call</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-[2px] bg-fuchsia-300 border-dashed" style={{ borderTop: '2px dashed #f0abfc' }} /> crosses HTTP</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-[2px] bg-rose-300" /> redundant</span>
                </>
              )}
              {view === 'owner' && (
                <>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-[2px] bg-emerald-300" /> clean owner</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-[2px] bg-rose-400" /> crossing write</span>
                </>
              )}
            </div>
            <div className="text-[10px] font-mono text-neutral-500">{edges.length} edges · {GRAPH_NODES.length} files</div>
          </div>
        </div>

        <div className="rounded-xl bg-black/50 border border-white/10 overflow-hidden lg:max-h-[380px] flex flex-col">
          <div className="px-3 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode2 className="w-3.5 h-3.5 shrink-0" style={{ color: ROLE_COLOR[selectedNode.role] }} />
              <span className="text-[11px] font-mono text-neutral-100 truncate">{selectedNode.label}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-mono" style={{ color: ROLE_COLOR[selectedNode.role] }}>
              {selectedNode.role}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 px-3 py-2 border-b border-white/5 leading-snug">
            {selectedNode.desc}
          </div>
          <pre className="flex-1 overflow-auto text-[10.5px] font-mono text-neutral-200 px-3 py-2 leading-[1.5]">
            {TOY_FILES[selected]}
          </pre>
        </div>
      </div>

      <Misconception
        wrong={<>If the import graph looks clean, the system is probably clean.</>}
        right={<>The import graph is the easiest graph to keep clean, and the least informative. What hurts you is the <Term>runtime call graph</Term> and <Term>state ownership</Term>, which imports don't show.</>}
        because={<>AI-generated code tends to produce <em>pretty</em> import graphs — every module imports from its neighbor, nothing cyclic. Runtime and ownership can still be tangled underneath.</>}
      />

      <WhenItMatters>
        Every time you're about to add a feature to an AI-built app, draw the runtime trace for <em>one</em> existing feature
        before adding yours. If you can't, your change is more likely to cause regressions than the feature is to be delivered.
      </WhenItMatters>

      <DoThisNow time="10 min">
        Pick one of your apps. Run <code className="text-emerald-200">npx madge --image graph.png src/</code> (JS)
        or <code className="text-emerald-200">pydeps your_pkg</code> (Python). Open the image. Now close it, grab paper,
        and redraw the graph from memory. Diff the two. The delta is your blind spot.
      </DoThisNow>

      <Deeper>
        <p>
          <strong>Why three views isn't overkill.</strong> The three graphs catch three different failure modes.
          <em> Imports</em> catch structural rot (cycles, leaky abstractions). <em>Runtime</em> catches dead code and
          redundant layers — in this toy app, <code>validators.py</code> does work that <code>NoteIn</code> already did,
          which you only see when you trace the runtime path. <em>Ownership</em> catches "why is this state flickering"
          bugs — here, <code>useNotes</code> mutates the store's <code>notes</code> array directly instead of asking the store to do it,
          which means the store can't enforce invariants.
        </p>
        <p>
          <strong>Where AI code misleads most.</strong> One-shot code almost always produces a believable import graph
          because the generator works file-by-file with the surrounding file names in its context. It has no such pressure for the
          runtime or ownership views — those only get exercised when you actually run the thing, which the generator didn't.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   05 — STATE OWNERSHIP
   ============================================================================ */

const STATE_PIECES = [
  { id: 'notes',      label: 'notes[]',        owner: 'store',   writers: ['useNotes', 'api'],    note: 'useNotes mutates it directly via setNotes. api writes it after a successful POST. Three writers, one owner.', verdict: 'diffuse' },
  { id: 'authToken',  label: 'authToken',      owner: 'store',   writers: ['auth-callback'],      note: 'Only written in one place (post-login callback). Clean.', verdict: 'clean' },
  { id: 'draftText',  label: 'draftText',      owner: 'Editor',  writers: ['Editor'],             note: 'Local useState. One writer, one reader. Textbook.', verdict: 'clean' },
  { id: 'pendingSync',label: 'pendingSync',    owner: '(none)',  writers: ['useNotes', 'api', 'store'], note: 'Written from three places depending on which one sees the failure first. Classic no-owner bug.', verdict: 'orphan' },
  { id: 'user',       label: 'currentUser',    owner: 'store',   writers: ['auth-callback'],      note: 'Clean — set once on login, cleared on logout.', verdict: 'clean' },
  { id: 'dbRow',      label: 'note row (DB)',  owner: 'db.py',   writers: ['db.py'],              note: 'Only db.py writes SQL. Every other module uses the returned model.', verdict: 'clean' },
];

const MODULES = ['store', 'Editor', 'useNotes', 'api', 'db.py', '(none)'];

const VERDICT = {
  clean:   { color: '#6ee7b7', label: 'Clean',   note: 'One owner, writers only in the owner module.' },
  diffuse: { color: '#fbbf24', label: 'Diffuse', note: 'Writers span multiple modules. Fixable by routing all writes through the owner.' },
  orphan:  { color: '#fb7185', label: 'Orphan',  note: 'No single owner. Every writer assumes someone else is responsible. Always a bug source.' },
};

const StateOwnership = () => {
  const [picked, setPicked] = useState(null);
  const [guesses, setGuesses] = useState({});
  const assign = (moduleId) => {
    if (!picked) return;
    setGuesses(g => ({ ...g, [picked]: moduleId }));
    setPicked(null);
  };

  return (
    <Card id="ownership" icon={Boxes} title="State ownership" subtitle="Who is allowed to write this?" accent="amber" index={5}>
      <MinSchema>
        Every piece of state needs exactly <strong>one owner</strong>. Diffuse ownership is the ancestor of every "it's flickering / it's stale / it's racing" bug.
      </MinSchema>

      <p>
        Pick a piece of state below, then click the module you think should own it. The correct answer lights up
        with each writer of that state — and you'll see which writers are <em>not</em> the owner.
      </p>

      <div className="grid md:grid-cols-[1fr_1fr] gap-3">
        {/* State chips */}
        <div className="rounded-xl bg-black/40 border border-amber-400/20 p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-2 flex items-center gap-2">
            <CircleDot className="w-3.5 h-3.5" /> state pieces
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATE_PIECES.map(s => (
              <button key={s.id}
                onClick={() => setPicked(picked === s.id ? null : s.id)}
                className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                  picked === s.id
                    ? 'bg-amber-400/20 border-amber-400/60 text-amber-100'
                    : guesses[s.id]
                      ? 'bg-white/5 border-white/15 text-neutral-300'
                      : 'bg-white/[0.03] border-white/10 text-neutral-200 hover:bg-white/[0.07]'
                }`}>
                {s.label}
                {guesses[s.id] && <span className="ml-1 text-neutral-500">→ {guesses[s.id]}</span>}
              </button>
            ))}
          </div>
          {picked && (
            <div className="mt-3 text-[11px] text-amber-200">
              <span className="text-amber-300">picked:</span> <span className="font-mono">{STATE_PIECES.find(s => s.id === picked).label}</span> — click a module →
            </div>
          )}
        </div>

        {/* Module zones */}
        <div className="rounded-xl bg-black/40 border border-violet-400/20 p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300 mb-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> modules
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MODULES.map(m => (
              <button key={m}
                onClick={() => assign(m)}
                disabled={!picked}
                className={`text-[11px] font-mono px-2 py-2 rounded border text-left transition-colors ${
                  picked
                    ? 'bg-violet-400/5 border-violet-400/30 text-violet-100 hover:bg-violet-400/15'
                    : 'bg-white/[0.02] border-white/10 text-neutral-400'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict list */}
      <div className="rounded-xl bg-black/40 border border-white/10">
        <div className="px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-between">
          <span>verdicts</span>
          {Object.keys(guesses).length > 0 && (
            <button onClick={() => setGuesses({})} className="text-[10px] tracking-wider text-neutral-400 hover:text-neutral-100">reset</button>
          )}
        </div>
        <div className="divide-y divide-white/5">
          {STATE_PIECES.map(s => {
            const myGuess = guesses[s.id];
            const correct = myGuess && myGuess === s.owner;
            const v = VERDICT[s.verdict];
            return (
              <div key={s.id} className="px-3 py-2 flex items-center gap-3">
                <span className="w-1.5 h-8 rounded-sm shrink-0" style={{ background: v.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[12px] font-mono text-neutral-100">{s.label}</span>
                    <span className="text-[10px] text-neutral-500">owner:</span>
                    <span className="text-[11px] font-mono text-amber-200">{s.owner}</span>
                    {myGuess && (
                      <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
                        correct ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/40 bg-rose-400/10 text-rose-200'
                      }`}>
                        {correct ? 'matches' : 'you said ' + myGuess}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-snug mt-0.5">
                    writers: <span className="font-mono text-neutral-300">{s.writers.join(', ')}</span> — {s.note}
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-mono shrink-0" style={{ color: v.color }}>
                  {v.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Misconception
        wrong={<>If a piece of state is in a store (Zustand/Redux/Pinia), it's "owned" by the store.</>}
        right={<>A store is just a bag of mutable refs. Ownership is about <em>where writes happen</em>. A store with six files calling <code>setNotes</code> has six owners, not one.</>}
        because={<>The word "store" implies discipline the tool doesn't actually enforce. Ownership is a convention you maintain with grep and with code review, not with a framework.</>}
      />

      <DoThisNow time="4 min">
        In one of your apps: pick a piece of state that's misbehaved on you before. Grep every <em>write</em> site
        (<code className="text-emerald-200">setX</code>, <code className="text-emerald-200">x =</code>, <code className="text-emerald-200">UPDATE x</code>).
        If writes happen in <strong>more than 2 modules</strong>, that state has no owner. Rename the write to go through
        a single module. You just prevented a class of bugs.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   06 — TRUST BOUNDARIES
   ============================================================================ */

const VALIDATION_POINTS = [
  { id: 'frontend', label: 'Frontend form',  x: 90,  note: 'UX-level feedback — catches typos before submit. Not a real trust boundary (a hostile user skips this trivially).' },
  { id: 'api',      label: 'API entry',      x: 300, note: 'REAL boundary — user input crosses from untrusted to trusted. This is where validation earns its keep.' },
  { id: 'db',       label: 'DB-layer check', x: 500, note: 'Already-validated data re-checked. Redundant with API entry. Often pure defensiveness.' },
];

const PAYLOADS = [
  { id: 'good',   label: 'valid note',       outcome: 'saved',    threatens: [] },
  { id: 'empty',  label: 'empty text',       outcome: 'rejected', threatens: ['api'] },
  { id: 'xss',    label: '<script>alert(1)</script>', outcome: 'saved (escaped at render)', threatens: [] },
  { id: 'huge',   label: '11 MB blob',       outcome: 'rejected', threatens: ['api'] },
  { id: 'forged', label: 'stolen token',     outcome: 'rejected', threatens: ['api'] },
];

const TrustBoundaries = () => {
  const [active, setActive] = useState({ frontend: true, api: true, db: true });
  const [payload, setPayload] = useState(PAYLOADS[1]);
  const toggle = (id) => setActive(a => ({ ...a, [id]: !a[id] }));

  // derived: is this payload caught somewhere, or does it slip through?
  const caught = VALIDATION_POINTS.find(p => active[p.id] && payload.threatens.includes(p.id));
  const slip = !caught && payload.threatens.length > 0;

  return (
    <Card id="trust" icon={ShieldCheck} title="Trust boundaries" subtitle="Validate where trust changes, not where you're nervous" accent="emerald" index={6}>
      <MinSchema>
        Validation at a boundary where trust doesn't change is either scaffolding or defensiveness.
        The real boundary is usually exactly one place — the edge of your server.
      </MinSchema>

      <p>
        Three candidate validation points for a saved note. Toggle each on and off; pick different payloads
        to see what gets caught. The <strong>only</strong> one that can actually keep you safe is the one at a{' '}
        <Term>trust boundary</Term>.
      </p>

      <div className="rounded-xl bg-black/50 border border-emerald-400/20 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">payload</div>
          <div className="flex flex-wrap gap-1">
            {PAYLOADS.map(p => (
              <button key={p.id} onClick={() => setPayload(p)}
                className={`text-[11px] font-mono px-2 py-1 rounded border ${
                  payload.id === p.id ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-100' : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 620 160" className="w-full h-auto">
          {/* rail */}
          <line x1="40" y1="80" x2="580" y2="80" stroke="#ffffff22" strokeWidth="1" />

          {/* HTTP boundary label */}
          <line x1={195} y1="22" x2={195} y2="148" stroke="#ffffff15" strokeDasharray="3 3" />
          <text x={195} y="20" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.12em' }}>
            HTTP
          </text>

          {/* labels */}
          <text x={100} y="20" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.1em' }}>BROWSER</text>
          <text x={400} y="20" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.1em' }}>SERVER</text>

          {/* packet */}
          <motion.g
            key={payload.id + JSON.stringify(active)}
            initial={{ x: 40 }}
            animate={{ x: caught ? VALIDATION_POINTS.find(p => p.id === caught.id).x - 40 : 540 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          >
            <circle cx={40} cy={80} r="8" fill={slip ? '#fb7185' : caught ? '#fca5a5' : '#6ee7b7'} />
            <text x={40} y={72} fontSize="8" textAnchor="middle" fill="#e5e5e5" fontFamily="ui-monospace">{payload.label.length > 14 ? '·' : payload.label.slice(0, 12)}</text>
          </motion.g>

          {VALIDATION_POINTS.map((p) => {
            const on = active[p.id];
            const real = p.id === 'api';
            return (
              <g key={p.id}>
                {/* gate */}
                <motion.rect
                  x={p.x - 14} y={58} width={28} height={44} rx={4}
                  fill={on ? (real ? '#064e3b' : '#14532d88') : '#262626'}
                  stroke={on ? (real ? '#6ee7b7' : '#94d1a0') : '#737373'}
                  strokeWidth={real ? 1.5 : 1}
                  strokeDasharray={real ? undefined : '3 2'}
                />
                <text x={p.x} y={82} fontSize="8" textAnchor="middle"
                      fill={on ? '#f0fdf4' : '#a3a3a3'} fontFamily="ui-monospace">{on ? 'VAL' : 'off'}</text>
                <text x={p.x} y={124} fontSize="9" textAnchor="middle" fill="#d4d4d4" fontFamily="ui-monospace">
                  {p.label}
                </text>
                {real && (
                  <text x={p.x} y={140} fontSize="8" textAnchor="middle" fill="#6ee7b7" fontFamily="ui-monospace" style={{ letterSpacing: '0.1em' }}>
                    TRUST BOUNDARY
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-3 grid md:grid-cols-3 gap-2">
          {VALIDATION_POINTS.map(p => (
            <button key={p.id} onClick={() => toggle(p.id)}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                active[p.id] ? 'bg-emerald-400/5 border-emerald-400/30' : 'bg-white/[0.02] border-white/10'
              }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-neutral-100">{p.label}</span>
                <span className={`text-[9px] uppercase tracking-wider font-mono ${active[p.id] ? 'text-emerald-200' : 'text-neutral-500'}`}>
                  {active[p.id] ? 'on' : 'off'}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 leading-snug mt-1">{p.note}</div>
            </button>
          ))}
        </div>

        <div className="mt-3 text-[11px] leading-snug">
          <span className="text-neutral-400">outcome: </span>
          <span className={slip ? 'text-rose-300' : 'text-emerald-300'}>
            {slip ? 'slipped through — bug / security hole' : payload.outcome}
          </span>
          <span className="text-neutral-500"> {caught && <>· caught by {caught.label}</>}</span>
        </div>
      </div>

      <Misconception
        wrong={<>More validation is safer.</>}
        right={<>More validation in the <em>wrong place</em> is more code to maintain with no safety gain. Validation at the real boundary + nothing else is both safer and simpler.</>}
        because={<>A check inside the trusted zone can't reject anything the boundary let in, but it can get out of sync, raise spurious errors on legitimate data, and mask bugs in the real boundary check.</>}
      />

      <WhenItMatters>
        When an AI-built app has 15+ validation sites and a new type of input is still breaking things — the problem
        isn't "more validation," it's that the <em>single</em> boundary check is incomplete or in the wrong place.
      </WhenItMatters>

      <DoThisNow time="5 min">
        In one of your apps, find all <code className="text-emerald-200">zod</code>/<code className="text-emerald-200">pydantic</code>
        /manual <code className="text-emerald-200">if not x:</code> checks. Put a dot next to each that sits at a real trust boundary
        (network, user input, external API). The rest are candidates for deletion — mark them for the next{' '}
        <CrossLink to="pruning" recap="A pass dedicated to deleting scaffolding and defensive bloat.">pruning pass</CrossLink>.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   07 — THE 20-MINUTE FIRST PASS
   ============================================================================ */

const FIRST_PASS_STEPS = [
  { t: '0:00', label: 'Scan the README',          detail: 'Count the claims it makes about what the app does. Flag each as verified / unverified. 80% of AI-built app READMEs overstate or misstate something — note which one you suspect.' },
  { t: '2:00', label: 'Run the happy path locally', detail: 'Actually click through the one thing the app is supposed to do. If you can\'t, stop — you\'re not ready. Fix the dev loop first (missing env vars, dead service, etc.) before reading anything.' },
  { t: '5:00', label: 'Read the entrypoint top-to-bottom', detail: 'The file that gets hit first on startup (main.py, App.tsx, index.ts). No skipping. You need one end-to-end read before you start jumping.' },
  { t: '10:00', label: 'Find the first trust boundary', detail: 'Where does untrusted input enter? A handler, an API route, a form submit. This is usually your anchor for the whole system — the point around which everything else is organized.' },
  { t: '15:00', label: 'Find where data persists',    detail: 'DB call, write to disk, remote POST. If you can\'t find it in 2 minutes, the app has no real persistence and every feature is in-memory — important to know.' },
  { t: '18:00', label: 'Draw the shape on paper',    detail: 'Just boxes and arrows: input → [steps] → persistence. If you can\'t, you don\'t know the app yet. That\'s fine — now you know where to go back to.' },
  { t: '20:00', label: 'Decide',                      detail: 'Are you ready to make your first edit? If no: extend to 40 minutes, or write down the specific question that\'s blocking you. Don\'t start editing without an answer.' },
];

const FirstPass = () => {
  const [active, setActive] = useState(0);
  return (
    <Card id="firstpass" icon={Timer} title="The 20-minute first pass" subtitle="The protocol you run every time you return to an AI-built app" accent="cyan" index={7}>
      <MinSchema>
        Twenty minutes of disciplined first contact beats two hours of "let me just start editing." Predict the shape,
        then read to confirm — or surprise yourself, which is the part that compounds.
      </MinSchema>

      <p>
        Every time you reopen an AI-built app — yours or someone else's — before you touch anything, run this protocol.
        It trades 20 minutes of deliberate reading for the 2 hours you'd otherwise lose to "why is this not working the way I thought."
        Click each step.
      </p>

      <div className="grid md:grid-cols-[auto_1fr] gap-4">
        <div className="flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-visible">
          {FIRST_PASS_STEPS.map((s, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex items-center gap-2 md:gap-3 text-left px-3 py-2 rounded-lg border transition-colors min-w-[120px] md:min-w-0 ${
                active === i
                  ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-100'
                  : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]'
              }`}>
              <span className={`text-[10px] font-mono tabular-nums w-10 ${active === i ? 'text-cyan-300' : 'text-neutral-500'}`}>{s.t}</span>
              <span className="text-[11px] leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
        <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="rounded-xl bg-black/50 border border-cyan-400/20 p-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">step {active + 1}</span>
            <span className="text-[10px] font-mono text-neutral-500">{FIRST_PASS_STEPS[active].t}</span>
          </div>
          <h4 className="text-lg font-semibold text-neutral-50 mb-2">{FIRST_PASS_STEPS[active].label}</h4>
          <p className="text-sm text-neutral-300 leading-relaxed">{FIRST_PASS_STEPS[active].detail}</p>
        </motion.div>
      </div>

      <QA items={[
        { q: 'Why the README first, if I already know AI-written READMEs are unreliable?',
          a: 'Because what it overstates tells you what the generator thought it was building. That\'s useful context, even if untrue. You\'re calibrating, not trusting.' },
        { q: 'What if I can\'t run the app in 2 minutes?',
          a: 'Stop reading. Fix the dev loop first. No amount of static reading compensates for not being able to observe runtime. An unreachable app is an unreadable app.' },
        { q: 'What if 20 minutes isn\'t enough?',
          a: 'It often isn\'t. Extend to 40. The number isn\'t magic — the discipline is: read before you edit, always, for a bounded stretch you commit to up front.' },
      ]} />

      <DoThisNow time="20 min · right now">
        Set a real 20-minute timer. Pick the AI-built app of yours you dread touching most. Run the protocol above.
        When the timer fires, write down one sentence for the <Term>minimum viable schema</Term> of the app — the one
        thing you could redraw from memory. If you couldn't, you know what's next.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   08 — INTERVIEWING YOUR CODEBASE (with AI)
   ============================================================================ */

const PROMPT_EXAMPLES = [
  {
    q: 'What does saveNote() do?',
    bad:    { label: 'ungrounded', text: 'What does saveNote() do?', result: 'AI invents a plausible-sounding description. It might be mostly right. It might be wrong about state mutations, error paths, or anything else it guesses. You will not know which.' },
    better: { label: 'grounded by file', text: '[pastes useNotes.ts] What does saveNote() do in this file?', result: 'AI answers from the pasted code. Answer is accurate for this file, but still hallucinates about what saveNote\'s callers expect, because those aren\'t in context.' },
    best:   { label: 'grounded by trace', text: '[pastes useNotes.ts + grep of saveNote call sites] Here are all 3 call sites of saveNote. Given these, describe its contract — what callers expect, what it returns, what it mutates. Cite line numbers.', result: 'Answer is grounded end-to-end. The AI can\'t confabulate callers because the callers are in context. Cite-line-numbers forces it to point to real spots.' },
  },
  {
    q: 'Is this validation needed?',
    bad:    { label: 'ungrounded', text: 'Is the validate_note() call in main.py needed?', result: 'AI will say "yes, defensive validation is good practice" — the safe answer. Unhelpful.' },
    better: { label: 'grounded by file', text: '[pastes main.py + validators.py] Is validate_note() needed here?', result: 'AI starts to suspect redundancy but can\'t be sure without knowing what NoteIn does upstream.' },
    best:   { label: 'grounded by trace', text: '[pastes main.py, validators.py, models.py] NoteIn is a Pydantic model with the same constraints as validate_note(). Is validate_note() still doing any work that NoteIn doesn\'t already do? Quote the constraints from each.', result: 'AI has everything it needs to answer correctly ("no, validate_note is redundant — NoteIn already enforces min/max length"). Now you can delete with confidence.' },
  },
];

const Interviewing = () => {
  const [qIdx, setQIdx] = useState(0);
  const [level, setLevel] = useState('best');
  const example = PROMPT_EXAMPLES[qIdx];
  const shown = example[level];

  return (
    <Card id="interview" icon={MessageSquare} title="Interviewing your codebase" subtitle="Asking AI about AI-built code — without getting confabulation back" accent="orange" index={8}>
      <MinSchema>
        Ground every question in <em>real bytes</em> — files, grep output, line numbers. Ungrounded questions get plausible
        answers that feel right and aren't.
      </MinSchema>

      <p>
        The same AI that wrote your code can help you read it — but only if you force it to work from real code rather
        than from its imagination. Below: the same question at three grounding levels. Flip between them to see what AI answers.
      </p>

      <div className="flex flex-wrap gap-2">
        {PROMPT_EXAMPLES.map((e, i) => (
          <button key={i} onClick={() => setQIdx(i)}
            className={`text-[11px] px-3 py-1.5 rounded-md border transition-colors ${
              qIdx === i ? 'bg-orange-400/10 border-orange-400/40 text-orange-100' : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]'
            }`}>
            {e.q}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        {['bad', 'better', 'best'].map(lv => {
          const ex = example[lv];
          const active = level === lv;
          const accent = lv === 'bad' ? 'rose' : lv === 'better' ? 'amber' : 'emerald';
          const accentMap = { rose: 'border-rose-400/40 bg-rose-400/10 text-rose-100', amber: 'border-amber-400/40 bg-amber-400/10 text-amber-100', emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100' };
          return (
            <button key={lv} onClick={() => setLevel(lv)}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                active ? accentMap[accent] : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:bg-white/[0.05]'
              }`}>
              <div className="text-[9px] uppercase tracking-wider font-mono opacity-80">{ex.label}</div>
              <div className="text-[11px] leading-snug mt-0.5 line-clamp-2">{ex.text.slice(0, 80)}{ex.text.length > 80 ? '…' : ''}</div>
            </button>
          );
        })}
      </div>

      <motion.div key={qIdx + level} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-black/50 border border-orange-400/20 overflow-hidden">
        <div className="px-3 py-2 border-b border-orange-400/15 bg-orange-400/5 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-orange-300" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-200">prompt ({shown.label})</span>
        </div>
        <pre className="px-3 py-3 text-[11.5px] font-mono text-neutral-100 whitespace-pre-wrap leading-relaxed">{shown.text}</pre>
        <div className="px-3 py-2 border-t border-white/5 bg-black/40">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">what you typically get back</div>
          <div className="text-[12px] text-neutral-300 leading-relaxed">{shown.result}</div>
        </div>
      </motion.div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">the interviewing checklist</div>
        <ul className="space-y-1 text-[12px] text-neutral-200">
          <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-[3px] text-emerald-400 shrink-0" /><span>Paste files, not filenames. "What does <code>useNotes.ts</code> do" without the file content = pure invention.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-[3px] text-emerald-400 shrink-0" /><span>Include the callers, not just the callee. A function's contract lives where it's called from.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-[3px] text-emerald-400 shrink-0" /><span>Ask for line-number citations. Forces the model to point rather than vibe.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-[3px] text-emerald-400 shrink-0" /><span>Ask <em>what it does not do</em> — "are there cases this function doesn't handle?" Gets you the defensive-code intuition free.</span></li>
          <li className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-[3px] text-emerald-400 shrink-0" /><span>When the answer feels too clean, ask the same question a second way. Inconsistent answers mean the AI is guessing.</span></li>
        </ul>
      </div>

      <Misconception
        wrong={<>"Claude, explain my codebase to me" is a reasonable first prompt.</>}
        right={<>Without grounding, the AI will <Term>confabulate</Term> a plausible explanation that is partly wrong. You'll believe it, because it reads well.</>}
        because={<>LLMs don't have a "I don't know this file" mode by default. They'll fill in the gap with the most likely file given the name and context. Force them to work from real bytes.</>}
      />

      <DoThisNow time="5 min">
        Pick any function in one of your AI-built apps. Run{' '}
        <code className="text-emerald-200">rg "functionName\\("</code> to get call sites. Paste them + the function into Claude,
        and ask: <em>"given these callers, what's this function's real contract? Cite line numbers."</em>
        The answer is what the codebase actually expects — not what the name implies.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   09 — PRUNING PASS
   ============================================================================ */

const PRUNE_CANDIDATES = [
  { label: 'Comments that restate the code',           example: '// set x to 5\nx = 5', safety: 'safe',   why: 'No information content. Delete.' },
  { label: 'try/catch that only re-throws',            example: 'try { save(x) } catch(e) { throw e }', safety: 'safe', why: 'Identical behavior without the try/catch. Delete both lines.' },
  { label: 'Optional params never passed',             example: 'fn(x, opts = {}) — callers: fn(5)', safety: 'safe',   why: 'Drop the second param + every default-handling line. Rerun types.' },
  { label: 'Files never imported',                     example: 'utils/formatters.ts (grep import: 0 hits)', safety: 'safe',   why: 'Confirm across test files + string references, then delete.' },
  { label: '"utils" functions used once',              example: 'toTitleCase() — used only by UserHeader', safety: 'caution', why: 'Inline into its single caller. Keeps the file smaller and makes the caller self-contained.' },
  { label: 'Interfaces implemented once',              example: 'INotesService → NotesServiceImpl', safety: 'caution', why: 'Drop the interface; rename Impl to the real thing. Abstractions earn their keep at ≥2 implementations.' },
  { label: 'Defensive null checks on internal values', example: 'if (!this.db) return null', safety: 'caution', why: 'this.db is set in the constructor. Delete the check. If you\'re wrong, a crash tells you immediately.' },
  { label: 'Feature flags with one branch used',       example: 'if (useNewAuth) { … } else { /* unreachable */ }', safety: 'caution', why: 'Confirm the unused branch is truly unreached (logs, analytics). Then collapse.' },
  { label: 'Legacy API clients with new one live',     example: 'ApiClient + ApiV2Client', safety: 'careful', why: 'Migrate remaining callers first. Don\'t delete in the same PR as the migration.' },
];

const SAFETY = {
  safe:    { color: '#6ee7b7', label: 'Safe',    note: 'Delete now, run, commit.' },
  caution: { color: '#fcd34d', label: 'Caution', note: 'Verify zero usage, then delete.' },
  careful: { color: '#fca5a5', label: 'Careful', note: 'Multi-step; separate from the deletion commit.' },
};

const PruningPass = () => {
  const [expanded, setExpanded] = useState(null);
  return (
    <Card id="pruning" icon={Wrench} title="The pruning pass" subtitle="Deletion is cheaper than careful reading" accent="sky" index={9}>
      <MinSchema>
        You don't understand a file until you've tried to delete a line from it and seen whether anything notices.
        Scheduled, aggressive pruning builds the mental model faster than any amount of passive reading.
      </MinSchema>

      <p>
        Dedicate a recurring slot — say, 30 minutes a week — to deletion. Nothing else. The list below is ordered by
        safety: start at the top, work down. Click any item for the exact move.
      </p>

      <div className="rounded-xl bg-black/40 border border-sky-400/20 overflow-hidden">
        {PRUNE_CANDIDATES.map((c, i) => {
          const s = SAFETY[c.safety];
          const open = expanded === i;
          return (
            <div key={i} className="border-b border-white/5 last:border-0">
              <button onClick={() => setExpanded(open ? null : i)}
                className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
                <span className="w-1.5 h-6 rounded-sm shrink-0" style={{ background: s.color }} />
                <span className="flex-1 text-[12px] text-neutral-100">{c.label}</span>
                <span className="text-[9px] uppercase tracking-wider font-mono shrink-0" style={{ color: s.color }}>{s.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <div className="px-3 pb-3 grid md:grid-cols-[1fr_1fr] gap-3">
                      <pre className="text-[11px] font-mono text-neutral-300 bg-black/40 border border-white/10 rounded p-2 overflow-x-auto">{c.example}</pre>
                      <div className="text-[12px] text-neutral-300 leading-snug">
                        {c.why}
                        <div className="mt-1.5 text-[10px]" style={{ color: s.color }}>{s.note}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        {Object.entries(SAFETY).map(([k, v]) => (
          <div key={k} className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-sm" style={{ background: v.color }} />
              <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: v.color }}>{v.label}</span>
            </div>
            <div className="text-[11px] text-neutral-400 leading-snug">{v.note}</div>
          </div>
        ))}
      </div>

      <WhenItMatters>
        The right time to prune is right <em>before</em> a big feature. Your next feature will land in whatever mess
        remains — so 30 minutes of deletion is a 30-minute down payment on every hour you spend in the next feature.
      </WhenItMatters>

      <DoThisNow time="30 min">
        Block 30 minutes in your calendar. Pick an AI-built app. Work down the safety list above; aim for{' '}
        <strong>3 deletions</strong>. Commit each separately with a message like{' '}
        <code className="text-emerald-200">"delete unused NotesService options"</code>. The goal isn't perfection —
        it's a recurring habit that compounds.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   10 — SAFETY NET BEFORE CHANGES
   ============================================================================ */

const SafetyNet = () => {
  return (
    <Card id="safetynet" icon={ShieldCheck} title="Safety net before changes" subtitle="The minimum you build before your first real edit" accent="emerald" index={10}>
      <MinSchema>
        The first edit is the most dangerous — you know the least, and one-line mistakes bury themselves forever.
        Build a tiny safety net <em>before</em> you change anything.
      </MinSchema>

      <p>
        Don't over-build. You are not pausing to add a comprehensive test suite. You're building a floor under this
        one edit, so that when something breaks, the signal is immediate and specific.
      </p>

      <div className="grid md:grid-cols-3 gap-2">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CircleDot className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">step 1 · one test</span>
          </div>
          <div className="text-[12px] text-neutral-200 leading-relaxed">
            Pick the function you're about to edit. Write <strong>one</strong> integration test for its{' '}
            <Term>happy path</Term>. Not unit-isolated, not mocked — actually call it with real deps and assert the
            observable result. If the test is hard to write, the code has no seams; note that and keep going.
          </div>
        </div>
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CircleDot className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">step 2 · types at the edge</span>
          </div>
          <div className="text-[12px] text-neutral-200 leading-relaxed">
            Add or tighten the type signature of the <em>boundary</em> — function params + return, or API request/response.
            TypeScript: remove <code>any</code> from the target function. Python: add Pydantic models at the route.
            Just the one boundary, not the whole file.
          </div>
        </div>
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CircleDot className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">step 3 · commit</span>
          </div>
          <div className="text-[12px] text-neutral-200 leading-relaxed">
            Commit the test + types <em>before</em> you change logic. This is the key move: now the first real edit
            shows up as a clean diff against a known-green state. When something goes wrong, git bisect actually works.
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">typical first-pass test (JS/TS)</div>
        <pre className="text-[11.5px] font-mono text-neutral-200 leading-relaxed whitespace-pre overflow-x-auto">{`// Happy path. 1 test. 5 minutes. The floor under every future edit.
test('saveNote persists a note and returns an id', async () => {
  const saved = await saveNote({ text: 'hello' });
  expect(saved.id).toBeDefined();
  expect(saved.text).toBe('hello');
});`}</pre>
      </div>

      <Misconception
        wrong={<>Adding tests first is overkill for a small change.</>}
        right={<>Adding <em>one</em> test for the <em>one</em> function you're about to touch takes five minutes and pays for itself the first time your "small change" turns out to be less small than you thought.</>}
        because={<>The cost of the test is linear in one function. The cost of a silent regression is quadratic in the time since you shipped the mistake. The break-even is trivial.</>}
      />

      <DoThisNow time="5 min">
        Open one of your apps. Pick the function you're most likely to edit next. Write one test that exercises its
        happy path against real dependencies. Commit. You now have a floor you didn't have 5 minutes ago.
      </DoThisNow>
    </Card>
  );
};

/* ============================================================================
   11 — NEXT TRAILS
   ============================================================================ */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — sibling explainers, the roadmap, and adjacent skills" accent="violet" index={11}>
    <MinSchema>
      The principles in this explainer (gap, shape, load-bearing, connections, ownership, trust) apply to any
      AI-built codebase. The workflow cards (first-pass, interview, pruning, safety-net) are the repeatable part —
      re-open them each time you sit down with a new AI-built app.
    </MinSchema>

    <div className="rounded-xl border border-violet-400/25 bg-violet-400/5 p-3 mb-2">
      <div className="flex items-start gap-2">
        <Map className="w-4 h-4 mt-[2px] text-violet-300 shrink-0" />
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300">roadmap</div>
          <div className="text-sm text-neutral-200 mt-0.5">
            A planned companion tool: <strong>point this at one of your actual apps</strong> and it produces an
            interactive explainer page for it — file graph, hotspot map, runtime traces, project-specific glossary.
            See{' '}
            <code className="text-violet-200">docs/roadmap-ai-codebase-generator.md</code>
            {' '}in this repo for the design sketch.
          </div>
        </div>
      </div>
    </div>

    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'in this sandbox · clickable',
        items: [
          { label: 'Systems Thinking', href: '#systems-thinking', note: 'Stocks, flows, feedback, delays — the vocabulary for seeing the loops inside an AI-built app.' },
          { label: 'Machine Learning', href: '#machine-learning', note: 'How the models generating your code work. Good calibration for what they can and can\'t do on their own code.' },
          { label: 'Data Centers · v2', href: '#data-centers-v2', note: 'Same pedagogy rhythm — predict → reveal, Q&A, misconceptions. A different domain to see the techniques transfer.' },
          { label: 'Linear Algebra', href: '#linear-algebra', note: 'The substrate under how the models that wrote your code represent anything. Adjacent but foundational.' },
        ],
      },
      {
        title: 'Deepen the skill',
        note: 'the next layer',
        items: [
          { label: 'Call-graph tooling', note: 'madge, dependency-cruiser, pyan, pydeps, rust-analyzer\'s call hierarchy. Know the one for your stack and keep it one keystroke away.' },
          { label: 'Runtime tracing', note: 'node --trace, py-spy, chrome devtools performance, otel. Actual runtime traces close more comprehension gaps than any static tool.' },
          { label: 'AST-based grep', note: 'ast-grep, tree-sitter, srgn. When regex grep stops being enough for "find all call sites of X with Y".' },
          { label: 'Semantic diff', note: 'difftastic, semantic-release, jscpd. Read diffs by intent rather than by line.' },
          { label: 'Contract testing', note: 'Pact, Dredd, Schemathesis. Verify the frontend-backend contract actually matches — the #1 hidden bug in polyglot AI-built apps.' },
          { label: 'Observability minimums', note: 'Structured logs, OTel traces, one health endpoint. The instrumentation floor under any AI-built app you plan to keep.' },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the sciences under the skill',
        items: [
          { label: 'Reading code as craft', note: 'Code Reading (Spinellis), Beautiful Code, A Philosophy of Software Design (Ousterhout). Pre-AI but now more valuable, not less.' },
          { label: 'Refactoring discipline', note: 'Fowler\'s Refactoring catalog. A vocabulary for the small, safe transformations that turn AI-output into iterated code.' },
          { label: 'Software archaeology', note: 'Mining Software Repositories, git bisect, codemods. The techniques for reconstructing intent from artifacts.' },
          { label: 'Cognitive load theory', note: 'Sweller\'s CLT, Papert on mental models. Why a 22-line function takes longer than a 7-line one by more than 22/7×.' },
        ],
      },
      {
        title: 'Zoom out',
        note: 'where this skill fits',
        items: [
          { label: 'AI-assisted dev economics', note: 'Why the ratio of code-written to code-understood is the new developer productivity metric, not keystrokes or PRs.' },
          { label: 'Agent-driven development', note: 'Where the field is going — multi-agent pipelines, autonomous PRs. The comprehension gap doesn\'t go away; it moves.' },
          { label: 'Codebase evaluation benchmarks', note: 'SWE-bench, RepoBench, LiveCodeBench. How the field measures what models can and can\'t do on real code.' },
          { label: 'This repo\'s explainer design', note: 'Open AGENTS.md — the pedagogy defaults here (MinSchema, Predict, Misconception, DoThisNow) are reusable in any technical explainer you write.' },
        ],
      },
    ]} />
  </Card>
);

/* ============================================================================
   FOOTER
   ============================================================================ */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>influences:</span>
        <span className="text-sky-300">Ousterhout · A Philosophy of Software Design</span>
        <span className="text-violet-300">Spinellis · Code Reading</span>
        <span className="text-fuchsia-300">Fowler · Refactoring</span>
        <span className="text-emerald-300">Hickey · Simple Made Easy</span>
      </div>
      <p className="max-w-xl mx-auto">
        Every card ends with a "do this now" because a mental model that stays in this tab doesn't pay rent.
        Open one of your apps after each card.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ============================================================================ */

export default function AICodeOnboardingExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <TheGap />
        <ShapeOfAICode />
        <LoadBearingVsScaffolding />
        <WhatConnectsToWhat />
        <StateOwnership />
        <TrustBoundaries />
        <FirstPass />
        <Interviewing />
        <PruningPass />
        <SafetyNet />
        <NextTrails />
      </main>

      <Footer />
    </div>
  );
}
