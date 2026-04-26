import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Globe2, Map, Factory, ShoppingCart, Vault, Ship, Banknote,
  Zap, Activity, ChevronDown, FlaskConical, Info, Cpu, Sun,
  Battery, Car, Plane, Pill, Droplet, Flame, Wheat, Smartphone,
  Building2, Hammer, Briefcase, TrendingUp, TrendingDown,
  AlertTriangle, Users, Calendar, Anchor, ArrowRight, Scale,
} from 'lucide-react';

/* ============================================================================
   The World Economy — a data atlas, 2024–2026
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',
  '\\hi':  '\\textcolor{##fb7185}{#1}',
  '\\co':  '\\textcolor{##7dd3fc}{#1}',
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
    <div className="rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 overflow-x-auto text-neutral-100">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

// --- card primitives --------------------------------------------------------

const accentMap = {
  sky:     { text: 'text-sky-400',     border: 'border-sky-400/20',     from: 'from-sky-500/15' },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/20',  from: 'from-violet-500/15' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/20', from: 'from-emerald-500/15' },
  amber:   { text: 'text-amber-400',   border: 'border-amber-400/20',   from: 'from-amber-500/15' },
  fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-400/20', from: 'from-fuchsia-500/15' },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/20',    from: 'from-rose-500/15' },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/20',  from: 'from-orange-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, children }) => {
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

// --- Floating tooltip (follows mouse; rendered via fixed positioning) -------

const FloatingTip = ({ hover, render, width = 260 }) => {
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

// --- Sankey primitive -------------------------------------------------------

const Sankey = ({ nodes, links, colLabels, width = 620, height = 360, hover, setHover, format = (v) => v.toFixed(1) }) => {
  const NODE_W = 10, NODE_GAP = 6, TOP = 26, BOT = 12;

  const model = useMemo(() => {
    const cols = [...new Set(nodes.map((n) => n.col))].sort((a, b) => a - b);
    const sidePad = 100;
    const colX = {};
    cols.forEach((c, i) => { colX[c] = sidePad + (i / (cols.length - 1 || 1)) * (width - 2 * sidePad); });
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const inSum = {}, outSum = {};
    nodes.forEach((n) => { inSum[n.id] = 0; outSum[n.id] = 0; });
    links.forEach((l) => { outSum[l.src] += l.v; inSum[l.dst] += l.v; });
    const size = Object.fromEntries(nodes.map((n) => [n.id, Math.max(inSum[n.id], outSum[n.id])]));
    const nodeByCol = {};
    cols.forEach((c) => (nodeByCol[c] = nodes.filter((n) => n.col === c)));
    const avail = height - TOP - BOT;
    const maxColTotal = Math.max(...cols.map((c) => nodeByCol[c].reduce((s, n) => s + size[n.id], 0)));
    const maxColCount = Math.max(...cols.map((c) => nodeByCol[c].length));
    const scale = (avail - (maxColCount - 1) * NODE_GAP) / Math.max(maxColTotal, 1);

    const nodePos = {};
    cols.forEach((c) => {
      const cn = nodeByCol[c];
      const total = cn.reduce((s, n) => s + size[n.id], 0);
      const h = total * scale + (cn.length - 1) * NODE_GAP;
      let y = TOP + (avail - h) / 2;
      cn.forEach((n) => {
        const nh = size[n.id] * scale;
        nodePos[n.id] = { x: colX[c], y, h: nh, col: c };
        y += nh + NODE_GAP;
      });
    });

    const outCur = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    const inCur = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    const paths = links
      .slice()
      .map((l, idx) => ({ ...l, __idx: idx }))
      .sort((a, b) => b.v - a.v)
      .map((l) => {
        const src = nodePos[l.src], dst = nodePos[l.dst];
        const th = l.v * scale;
        const sy = src.y + outCur[l.src];
        const dy = dst.y + inCur[l.dst];
        outCur[l.src] += th;
        inCur[l.dst] += th;
        const x0 = src.x + NODE_W, x1 = dst.x, mx = (x0 + x1) / 2;
        const d = `M ${x0} ${sy} C ${mx} ${sy} ${mx} ${dy} ${x1} ${dy} L ${x1} ${dy + th} C ${mx} ${dy + th} ${mx} ${sy + th} ${x0} ${sy + th} Z`;
        return {
          id: `${l.src}__${l.dst}__${l.__idx}`,
          d, th, v: l.v,
          src: l.src, dst: l.dst,
          srcLabel: byId[l.src].label, dstLabel: byId[l.dst].label,
          srcColor: byId[l.src].color, dstColor: byId[l.dst].color,
          meta: l.meta,
        };
      });
    return { cols, colX, nodePos, paths, byId };
  }, [nodes, links, width, height]);

  const { cols, colX, nodePos, paths } = model;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseLeave={() => setHover && setHover(null)}>
      <defs>
        {paths.map((p) => (
          <linearGradient id={`sk-${p.id}`} key={p.id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.srcColor} />
            <stop offset="100%" stopColor={p.dstColor} />
          </linearGradient>
        ))}
      </defs>
      {colLabels && cols.map((c, i) => (
        <text key={c} x={colX[c] + NODE_W / 2} y={14}
              fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace"
              style={{ letterSpacing: '0.12em' }}>
          {colLabels[i]?.toUpperCase()}
        </text>
      ))}
      {paths.map((p) => {
        const dim = hover && hover.id !== p.id;
        return (
          <path key={p.id} d={p.d}
                fill={`url(#sk-${p.id})`}
                fillOpacity={dim ? 0.08 : 0.55}
                onMouseEnter={(e) => setHover && setHover({ ...p, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHover && setHover({ ...p, mx: e.clientX, my: e.clientY })}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }} />
        );
      })}
      {nodes.map((n) => {
        const p = nodePos[n.id];
        const isFirst = p.col === cols[0], isLast = p.col === cols[cols.length - 1];
        const lx = isFirst ? p.x - 6 : isLast ? p.x + NODE_W + 6 : p.x + NODE_W + 6;
        const anchor = isFirst ? 'end' : 'start';
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={NODE_W} height={p.h} fill={n.color} fillOpacity="0.95"
                  onMouseEnter={(e) => setHover && setHover({ id: `node-${n.id}`, isNode: true, node: n, v: n.__v ?? null, mx: e.clientX, my: e.clientY })}
                  onMouseMove={(e) => setHover && setHover({ id: `node-${n.id}`, isNode: true, node: n, v: n.__v ?? null, mx: e.clientX, my: e.clientY })}
                  style={{ cursor: 'pointer' }} />
            <text x={lx} y={p.y + p.h / 2 + 3} textAnchor={anchor}
                  fontSize="10.5" fill={n.color} fontFamily="ui-sans-serif" fontWeight="600"
                  style={{ paintOrder: 'stroke', stroke: '#0a0a0a', strokeWidth: 2.5, strokeLinejoin: 'round' }}>
              {n.label}
            </text>
            {n.sub && p.h >= 14 && (
              <text x={lx} y={p.y + p.h / 2 + 14} textAnchor={anchor}
                    fontSize="9" fill="#737373" fontFamily="ui-monospace"
                    style={{ paintOrder: 'stroke', stroke: '#0a0a0a', strokeWidth: 2.5, strokeLinejoin: 'round' }}>
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// --- shared country palette -------------------------------------------------

const C = {
  China:        '#fb7185', cn: '#fb7185',
  US:           '#7dd3fc', us: '#7dd3fc',
  EU:           '#c4b5fd', eu: '#c4b5fd',
  Germany:      '#a78bfa', de: '#a78bfa',
  Japan:        '#fcd34d', jp: '#fcd34d',
  Korea:        '#f0abfc', kr: '#f0abfc',
  Taiwan:       '#6ee7b7', tw: '#6ee7b7',
  India:        '#fb923c', in: '#fb923c',
  Russia:       '#cbd5e1', ru: '#cbd5e1',
  Saudi:        '#a3e635', sa: '#a3e635',
  Qatar:        '#34d399',
  UAE:          '#fde68a',
  Australia:    '#22d3ee', au: '#22d3ee',
  Brazil:       '#84cc16', br: '#84cc16',
  Argentina:    '#67e8f9',
  Iraq:         '#facc15',
  Canada:       '#fda4af', ca: '#fda4af',
  Mexico:       '#fb7185', mx: '#fb7185',
  Vietnam:      '#5eead4',
  Switzerland:  '#fef3c7', ch: '#fef3c7',
  UK:           '#93c5fd', gb: '#93c5fd',
  France:       '#a78bfa', fr: '#a78bfa',
  Italy:        '#86efac', it: '#86efac',
  Spain:        '#fcd34d', es: '#fcd34d',
  Indonesia:    '#fda4af', id: '#fda4af',
  Turkey:       '#f87171', tr: '#f87171',
  Netherlands:  '#fbbf24', nl: '#fbbf24',
  Poland:       '#f0abfc', pl: '#f0abfc',
  Norway:       '#67e8f9', no: '#67e8f9',
  Singapore:    '#a3e635', sg: '#a3e635',
  Nigeria:      '#34d399', ng: '#34d399',
  Pakistan:     '#22d3ee', pk: '#22d3ee',
  Egypt:        '#fcd34d',
  Ireland:      '#86efac', ie: '#86efac',
  Israel:       '#67e8f9',
  Philippines:  '#fda4af',
  ASEAN:        '#5eead4',
  Other:        '#737373',
  default:      '#737373',
};
const colorOf = (k) => C[k] || (k.includes('US') ? C.US : k.includes('EU') ? C.EU : C.default);

const Flag = ({ code, size = 'text-base' }) => {
  const flags = {
    us:'🇺🇸', cn:'🇨🇳', de:'🇩🇪', jp:'🇯🇵', in:'🇮🇳', gb:'🇬🇧', fr:'🇫🇷', it:'🇮🇹',
    br:'🇧🇷', ca:'🇨🇦', ru:'🇷🇺', mx:'🇲🇽', kr:'🇰🇷', au:'🇦🇺', es:'🇪🇸', id:'🇮🇩',
    tr:'🇹🇷', nl:'🇳🇱', sa:'🇸🇦', ch:'🇨🇭', pl:'🇵🇱', ie:'🇮🇪', no:'🇳🇴', sg:'🇸🇬',
    ng:'🇳🇬', pk:'🇵🇰', tw:'🇹🇼', ar:'🇦🇷', vn:'🇻🇳', il:'🇮🇱', za:'🇿🇦', th:'🇹🇭',
    ph:'🇵🇭', bd:'🇧🇩', ae:'🇦🇪', qa:'🇶🇦', ir:'🇮🇷', eg:'🇪🇬', se:'🇸🇪', be:'🇧🇪',
  };
  return <span className={size}>{flags[code] || '🏳️'}</span>;
};

// --- hero -------------------------------------------------------------------

const FlowField = () => {
  const lines = useMemo(
    () => Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      y: 5 + i * 4.4 + Math.random() * 2,
      d: 6 + Math.random() * 5,
      delay: Math.random() * 4,
      opacity: 0.06 + Math.random() * 0.10,
    })), []);
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((l) => (
        <motion.line key={l.id} x1="0" y1={l.y} x2="100" y2={l.y} stroke="url(#flowGrad)" strokeWidth="0.4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, l.opacity, 0] }}
          transition={{ duration: l.d, delay: l.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-violet-500/5 to-transparent" />
    <FlowField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
          <Globe2 className="w-3.5 h-3.5" /> a data atlas · 2024–2026
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-fuchsia-200 bg-clip-text text-transparent">
          The World Economy
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Where the world's <span className="text-amber-300 font-mono">$110 trillion</span> of output is produced, who consumes it, where the resulting wealth is parked, and the forces redrawing the map right now.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">production</span>
          <span className="text-violet-300">consumption</span>
          <span className="text-amber-300">wealth</span>
          <span className="text-fuchsia-300">flows</span>
          <span className="text-rose-300">drivers</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

// --- section nav ------------------------------------------------------------

const SECTIONS = [
  { id: 'output',      label: 'Output map',         icon: Map },
  { id: 'production',  label: 'Who makes what',     icon: Factory },
  { id: 'size',        label: 'How big is what',    icon: Scale },
  { id: 'consumption', label: 'Who consumes what',  icon: ShoppingCart },
  { id: 'wealth',      label: 'Where wealth is',    icon: Vault },
  { id: 'trade',       label: 'Trade flows',        icon: Ship },
  { id: 'capital',     label: 'Capital flows',      icon: Banknote },
  { id: 'drivers',     label: 'The drivers',        icon: Zap },
  { id: 'future',      label: 'Where it\'s going',  icon: Activity },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">0{i + 1}</span>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-sky-500/10 border-sky-400/30 text-sky-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">0{i + 1}</span>{s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   01 — THE OUTPUT MAP (treemap)
   ============================================================================ */

// 2024 nominal GDP, $T (IMF/World Bank).
// Sector composition (services, manufacturing, agriculture, mining/energy, construction)
// — sourced from World Bank WDI value-added shares; rounded.
const COUNTRIES = [
  { code:'us', name:'United States',   gdp:29.2, sec:[78,11, 1, 2, 4] },
  { code:'cn', name:'China',           gdp:18.5, sec:[54,27, 7, 3, 7] },
  { code:'de', name:'Germany',         gdp: 4.7, sec:[63,19, 1, 2, 5] },
  { code:'jp', name:'Japan',           gdp: 4.2, sec:[70,20, 1, 1, 5] },
  { code:'in', name:'India',           gdp: 4.0, sec:[50,14,17, 3, 8] },
  { code:'gb', name:'UK',              gdp: 3.6, sec:[72, 9, 1, 4, 6] },
  { code:'fr', name:'France',          gdp: 3.2, sec:[70,10, 2, 1, 5] },
  { code:'it', name:'Italy',           gdp: 2.4, sec:[65,16, 2, 2, 5] },
  { code:'br', name:'Brazil',          gdp: 2.2, sec:[60,11, 7, 4, 4] },
  { code:'ca', name:'Canada',          gdp: 2.2, sec:[67,10, 2, 8, 7] },
  { code:'ru', name:'Russia',          gdp: 2.2, sec:[54,13, 4,18, 6] },
  { code:'mx', name:'Mexico',          gdp: 2.0, sec:[60,17, 4, 6, 7] },
  { code:'kr', name:'Korea',           gdp: 1.9, sec:[57,25, 2, 1, 6] },
  { code:'au', name:'Australia',       gdp: 1.8, sec:[66, 6, 2,12, 7] },
  { code:'es', name:'Spain',           gdp: 1.7, sec:[68,13, 3, 1, 6] },
  { code:'id', name:'Indonesia',       gdp: 1.5, sec:[45,19,13, 9,11] },
  { code:'tr', name:'Turkey',          gdp: 1.3, sec:[55,22, 6, 1, 7] },
  { code:'nl', name:'Netherlands',     gdp: 1.2, sec:[70,11, 2, 1, 5] },
  { code:'sa', name:'Saudi Arabia',    gdp: 1.1, sec:[50,12, 3,30, 5] },
  { code:'ch', name:'Switzerland',     gdp: 1.0, sec:[73,18, 1, 0, 5] },
  { code:'pl', name:'Poland',          gdp: 0.9, sec:[58,17, 3, 3, 7] },
  { code:'ie', name:'Ireland',         gdp: 0.6, sec:[60,32, 1, 0, 3] },
];

const SECTORS = [
  { k:0, label:'Services',       color:'#7dd3fc' },
  { k:1, label:'Manufacturing',  color:'#c4b5fd' },
  { k:2, label:'Agriculture',    color:'#86efac' },
  { k:3, label:'Mining/energy',  color:'#fcd34d' },
  { k:4, label:'Construction',   color:'#fb923c' },
];

const OutputMap = () => {
  const [hovered, setHovered] = useState(null);
  const selected = COUNTRIES.find((c) => c.code === hovered) || COUNTRIES[0];

  // Hand-tuned rows (height fraction, country codes)
  const rows = [
    { h: 0.42, items: ['us','cn'] },
    { h: 0.24, items: ['de','jp','in','gb','fr'] },
    { h: 0.18, items: ['it','br','ca','ru','mx','kr','au','es'] },
    { h: 0.16, items: ['id','tr','nl','sa','ch','pl','ie'] },
  ];

  const totalGDP = COUNTRIES.reduce((s, c) => s + c.gdp, 0);
  const restGDP = 110 - totalGDP;
  const W = 600, H = 420;

  let yCursor = 0;
  const placed = [];
  rows.forEach((row) => {
    const items = row.items.map((code) => COUNTRIES.find((c) => c.code === code));
    const sum = items.reduce((s, c) => s + c.gdp, 0);
    let xCursor = 0;
    const rh = row.h * H;
    items.forEach((c) => {
      const w = (c.gdp / sum) * W;
      placed.push({ ...c, x: xCursor, y: yCursor, w, h: rh });
      xCursor += w;
    });
    yCursor += rh;
  });

  return (
    <Card
      id="output"
      index={1}
      icon={Map}
      title="The Output Map"
      subtitle="Where the world's $110T of output is produced. Each rectangle scales with the country's GDP; the inner stripe is its sector composition."
      accent="sky"
      source="IMF · World Bank · 2024"
    >
      <p>
        Five economies — the US, China, Germany, Japan, India — produce <span className="text-amber-300 font-mono">~55%</span> of world GDP. The next twenty produce most of the rest. But scale alone hides the story: a country's <em>shape</em> (services-heavy? manufacturing? extraction?) determines how it interacts with the rest of the world. The treemap below sizes each country by output and codes its sector composition by color.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[10px] uppercase tracking-widest font-mono">
          {SECTORS.map((s) => (
            <span key={s.k} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
              <span style={{ color: s.color }}>{s.label}</span>
            </span>
          ))}
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {placed.map((c) => {
            const isHover = hovered === c.code;
            const isSel = selected.code === c.code;
            const totalSec = c.sec.reduce((s, v) => s + v, 0);
            // bottom strip = sector composition
            const stripH = Math.min(10, Math.max(4, c.h * 0.10));
            let sx = c.x;
            return (
              <g key={c.code}
                 onMouseEnter={() => setHovered(c.code)}
                 onClick={() => setHovered(c.code)}
                 style={{ cursor: 'pointer' }}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h}
                      fill="#0a0a0a" stroke={isHover ? '#7dd3fc' : '#262626'} strokeWidth={isHover ? 2 : 1} />
                {/* sector strip */}
                {c.sec.map((v, i) => {
                  const sw = (v / totalSec) * c.w;
                  const r = <rect key={i} x={sx} y={c.y + c.h - stripH} width={sw} height={stripH} fill={SECTORS[i].color} fillOpacity={isHover ? 1 : 0.85} />;
                  sx += sw;
                  return r;
                })}
                {/* labels */}
                {c.w > 60 && c.h > 30 && (
                  <>
                    <text x={c.x + 7} y={c.y + 18} fontSize={c.w > 200 ? 14 : 11} fill="#e5e5e5" fontFamily="ui-sans-serif" fontWeight="600">
                      {c.name}
                    </text>
                    <text x={c.x + 7} y={c.y + 18 + (c.w > 200 ? 18 : 14)} fontSize={c.w > 200 ? 12 : 10} fill="#a3a3a3" fontFamily="ui-monospace">
                      ${c.gdp}T
                    </text>
                  </>
                )}
                {c.w <= 60 && c.h > 24 && (
                  <text x={c.x + c.w / 2} y={c.y + 14} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace">
                    {c.code.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="mt-2 text-[11px] text-neutral-500 text-center">
          shown: top 22 economies · ~$94T · plus another <span className="text-amber-300 font-mono">~${restGDP.toFixed(0)}T</span> from the rest of the world
        </div>
      </div>

      {/* Detail panel */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Flag code={selected.code} size="text-2xl" />
            <div>
              <div className="text-base font-semibold">{selected.name}</div>
              <div className="text-[11px] text-neutral-500 font-mono">${selected.gdp}T · {((selected.gdp / 110) * 100).toFixed(1)}% of world output</div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest">click any country</div>
        </div>
        <div className="space-y-1.5">
          {SECTORS.map((s, i) => (
            <div key={s.k} className="grid grid-cols-[110px_1fr_50px] items-center gap-2 text-xs">
              <span style={{ color: s.color }}>{s.label}</span>
              <div className="h-3 bg-white/[0.03] rounded">
                <motion.div
                  layout transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                  style={{ width: `${selected.sec[i]}%`, background: s.color, opacity: 0.85 }}
                  className="h-full rounded"
                />
              </div>
              <span className="text-right font-mono text-neutral-300">{selected.sec[i]}%</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Read across the top row: the US is overwhelmingly services (78%), China is the most manufacturing-heavy major economy (27%), India still has 17% in agriculture (the only top-10 economy where farming is double-digit), and Saudi Arabia gets 30% of its GDP from oil and gas. Each shape implies a different exposure: services economies care about wages and rates; manufacturing economies care about FX and tariffs; resource economies care about commodity prices.
      </p>

      <Deeper>
        <p>
          Some structural anomalies worth knowing. <strong>Ireland's</strong> 32% manufacturing share is mostly contract pharma and chip packaging routed through Dublin for tax reasons — the GDP per capita of $110k overstates Irish prosperity by roughly 2x; modified GNI is the cleaner measure. <strong>China's</strong> 27% manufacturing is the largest single chunk of the world's industrial base — equal to the US, Japan, Germany, India, and Korea <em>combined</em>. <strong>Russia's</strong> 18% mining/energy share (oil + gas + metals) is what sanctions are trying to constrain; revenues largely re-route through India and China at a discount.
        </p>
        <Block>{`\\text{world output 2024} \\;\\approx\\; \\num{110}\\,\\text{T USD nominal} \\;\\approx\\; \\num{170}\\,\\text{T PPP}`}</Block>
        <p>
          PPP shares are quite different from nominal: by purchasing-power parity China is already <span className="text-amber-300 font-mono">~19%</span> of world output (vs the US at <span className="text-amber-300 font-mono">~15%</span>). Which measure you use depends on the question. For trade and finance, nominal. For comparing living standards or military spending, PPP.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   02 — WHO MAKES WHAT
   ============================================================================ */

const PRODUCTION = [
  // shares = [[country, %], ...] summing ~100. Sorted within rendering by HHI.
  { good:'Advanced semiconductors (≤7nm)', icon: Cpu,
    note:'TSMC fabs in Hsinchu and Tainan; Samsung trailing.',
    shares:[['Taiwan',92],['Korea',5],['US',2],['Other',1]] },
  { good:'AI accelerators (data-center GPUs)', icon: Cpu,
    note:'NVIDIA designs, TSMC manufactures, Samsung/SK Hynix supply HBM.',
    shares:[['US',96],['Other',4]] },
  { good:'Refined rare earths', icon: FlaskConical,
    note:'Mining is more diverse; refining is the chokepoint.',
    shares:[['China',87],['US',8],['Other',5]] },
  { good:'Solar panels', icon: Sun,
    note:'Polysilicon → wafers → cells → modules. China dominates every step.',
    shares:[['China',80],['SE Asia (CN-owned)',12],['Other',8]] },
  { good:'Lithium-ion batteries', icon: Battery,
    note:'CATL + BYD alone are >50% of world.',
    shares:[['China',75],['Korea',12],['Japan',8],['Other',5]] },
  { good:'Electric vehicles', icon: Car,
    note:'BYD passed Tesla in 2023; Chinese EVs now exporting in volume.',
    shares:[['China',60],['EU',18],['US',13],['Other',9]] },
  { good:'Large aircraft', icon: Plane,
    note:'Duopoly. COMAC C919 just starting commercial flights.',
    shares:[['US (Boeing)',50],['EU (Airbus)',50]] },
  { good:'Pharmaceuticals (value)', icon: Pill,
    note:'Generic API production is much more concentrated in China & India.',
    shares:[['US',35],['EU',20],['China',11],['Switzerland',8],['Japan',7],['Other',19]] },
  { good:'Steel', icon: Hammer,
    shares:[['China',53],['India',8],['Japan',5],['US',4],['Russia',4],['Korea',4],['Other',22]] },
  { good:'Cars (production)', icon: Car,
    shares:[['China',31],['US',11],['Japan',9],['India',6],['Korea',4],['Germany',4],['Other',35]] },
  { good:'LNG exports', icon: Flame,
    note:'US grew from 0 to #1 in a decade after the shale boom.',
    shares:[['US',22],['Qatar',20],['Australia',18],['Russia',8],['Other',32]] },
  { good:'Crude oil', icon: Droplet,
    shares:[['US',13],['Saudi',11],['Russia',10],['Canada',6],['Iraq',5],['China',5],['Other',50]] },
  { good:'Smartphones (assembly)', icon: Smartphone,
    note:'India now #2; Apple now assembles ~15% of iPhones outside China.',
    shares:[['China',67],['India',13],['Vietnam',11],['Korea',4],['Other',5]] },
  { good:'Soybeans', icon: Wheat,
    note:'Brazil-US duopoly; Argentina the consistent #3.',
    shares:[['Brazil',36],['US',32],['Argentina',12],['Other',20]] },
];

// Herfindahl-Hirschman Index ∈ [0, 10000]. Higher = more concentrated.
const hhi = (shares) => shares.reduce((s, [, v]) => s + v * v, 0);

const ProductionAtlas = () => {
  const sorted = useMemo(() => [...PRODUCTION].sort((a, b) => hhi(b.shares) - hhi(a.shares)), []);
  const [highlight, setHighlight] = useState(null);

  return (
    <Card
      id="production"
      index={2}
      icon={Factory}
      title="Who Makes What — The Chokepoint Map"
      subtitle="For each strategic good, the world's productive capacity sorted by concentration. The most concentrated rows are also the most fragile."
      accent="violet"
      source="USGS · IEA · BloombergNEF · WSA · Statista"
    >
      <p>
        The world economy isn't just countries with sectors; it's <em>specific goods made in specific places</em>. Some are almost monopolized — TSMC alone makes ~92% of leading-edge chips, China refines 87% of the world's rare earths, NVIDIA designs ~96% of AI accelerators. Others (oil, steel, cars) are diffuse. Concentration is what makes a supply chain strategic. Below: each row's bar shows world-output shares; the rows are sorted top-to-bottom by Herfindahl concentration index.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-2.5">
        {sorted.map((row) => {
          const Icon = row.icon;
          const h = hhi(row.shares);
          const concBucket = h > 7000 ? 'rose' : h > 4000 ? 'amber' : h > 2000 ? 'sky' : 'emerald';
          const concColor = { rose: '#fb7185', amber: '#fbbf24', sky: '#7dd3fc', emerald: '#6ee7b7' }[concBucket];
          const concLabel = h > 7000 ? 'monopolistic' : h > 4000 ? 'highly concentrated' : h > 2000 ? 'concentrated' : 'diffuse';
          const isHi = highlight === row.good;
          return (
            <div key={row.good}
                 onMouseEnter={() => setHighlight(row.good)}
                 onMouseLeave={() => setHighlight(null)}
                 className={`rounded-lg p-2.5 transition-colors ${isHi ? 'bg-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: concColor }} />
                <span className="text-sm text-neutral-200 font-medium flex-1 truncate">{row.good}</span>
                <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: concColor }}>
                  HHI {h.toLocaleString()} · {concLabel}
                </span>
              </div>
              <div className="flex h-5 rounded overflow-hidden border border-white/5">
                {row.shares.map(([c, v]) => (
                  <div
                    key={c}
                    title={`${c}: ${v}%`}
                    style={{ width: `${v}%`, background: colorOf(c), opacity: 0.9 }}
                    className="flex items-center justify-center text-[9px] font-mono text-neutral-900 font-semibold"
                  >
                    {v >= 8 ? `${c.replace(/\(.*\)/, '').trim()} ${v}%` : ''}
                  </div>
                ))}
              </div>
              {row.note && isHi && (
                <div className="mt-1.5 text-[11px] text-neutral-500 italic">{row.note}</div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-neutral-400">
        The top of the list is the modern equivalent of "control the seas." Whoever holds Taiwan's fabs, China's rare-earth refiners, and NVIDIA's GPU pipeline controls the substrate of every other industry. This is why the US restricts chip-making equipment exports to China, why China restricts rare-earth exports to the US, and why every G7 government is now subsidizing domestic semiconductor and battery capacity. The middle of the list (steel, cars, pharma) is where ordinary trade happens. The bottom (oil, basic foods) is so diffuse that it tends to be priced and traded globally.
      </p>

      <Deeper>
        <p>
          The Herfindahl index <Eq>{`H = \\sum_i s_i^2`}</Eq> ranges from 0 (perfect competition) to 10,000 (pure monopoly). Antitrust regulators flag <Eq>{`H > 2500`}</Eq> as concentrated; the top three rows here are at <Eq>{`H > 8000`}</Eq>. For comparison: global oil production sits at <Eq>{`H \\approx 600`}</Eq> — wildly diffuse — which is exactly why oil is so liquid as a market and so hard to weaponize.
        </p>
        <p>
          What's <em>not</em> on this list is interesting too. Software, by economic value, runs through US/Israel/EU/India/China but with no single chokepoint. Cloud compute (AWS+Azure+GCP) is ~65% US-controlled but the underlying hardware is back to the chokepoints above. Fertilizer (urea, potash, phosphate) is a quietly important one — Russia + Belarus + Canada + China dominate, and 2022 fertilizer disruptions caused most of the 2022–23 EM food inflation.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   03 — HOW BIG IS WHAT
   ============================================================================ */

// Industries by global gross output in $T (approximate, 2024 value added + GO blend).
// "share" = share of world GDP (% of ~$110T, rounded to context). "note" = one-liner.
const INDUSTRIES = [
  { name:'Real estate & rentals',     v:16.0, growth:3.5, top:['US','China','EU'],       note:'Housing services + commercial rent, ~14% of world GDP.' },
  { name:'Manufacturing',             v:16.0, growth:2.8, top:['China','US','EU'],       note:'China ≈31% of world manufacturing value-added.' },
  { name:'Wholesale & retail',        v:13.0, growth:3.2, top:['US','China','EU'],       note:'E-commerce now ~22% of retail (Alibaba, Amazon lead).' },
  { name:'Government services',       v:11.0, growth:2.0, top:['US','EU','China'],       note:'Defense, admin, public education — counted at cost.' },
  { name:'Finance & insurance',        v: 9.0, growth:4.0, top:['US','EU','China'],       note:'US ~40%; Wall St + City of London dominate wholesale.' },
  { name:'Construction',               v: 8.0, growth:2.5, top:['China','US','India'],    note:'China alone pours ~half the world\u2019s cement each year.' },
  { name:'Professional services',      v: 7.0, growth:4.5, top:['US','EU','UK'],          note:'Law, consulting, accounting — Big Four + MBB on top.' },
  { name:'Healthcare',                 v: 7.0, growth:4.2, top:['US','EU','China'],       note:'US alone ~$4.9T, ~17% of its GDP — the global outlier.' },
  { name:'IT & software services',     v: 6.0, growth:8.0, top:['US','India','China'],    note:'Hyperscaler capex alone ~$400B in 2025.' },
  { name:'Transport & logistics',      v: 5.0, growth:3.0, top:['China','US','EU'],       note:'Maersk + MSC + CMA CGM ≈ 45% of ocean container volume.' },
  { name:'Agriculture',                v: 4.0, growth:2.0, top:['China','India','US'],    note:'4% of GDP; still ~27% of global employment.' },
  { name:'Education',                  v: 4.0, growth:2.5, top:['US','EU','China'],       note:'Public + private; US higher-ed is a $700B sub-market.' },
  { name:'Utilities (power/water)',    v: 3.0, growth:3.0, top:['China','US','EU'],       note:'Electric power alone ~$2.8T in billed revenue.' },
  { name:'Hospitality & food svc',     v: 3.0, growth:5.0, top:['US','China','EU'],       note:'Travel+tourism back above 2019 after COVID trough.' },
  { name:'Mining & quarrying',         v: 3.0, growth:1.5, top:['China','Australia','US'], note:'Ex-energy; iron ore + copper + rare earths dominate value.' },
  { name:'Energy (oil+gas+coal)',      v: 5.5, growth:0.5, top:['US','Saudi','Russia'],   note:'Upstream revenue ≈ $5T; volatile with price.' },
  { name:'Telecom',                    v: 2.0, growth:2.5, top:['China','US','EU'],       note:'Consolidating: 3 carriers per market is now typical.' },
  { name:'Media & entertainment',      v: 2.5, growth:4.0, top:['US','China','EU'],       note:'Streaming + gaming + ads; Disney/Netflix/Tencent lead.' },
];

// Individual commodities / products by annual global production value, $B.
// Ordered here in no particular order; the component sorts them.
const COMMODITIES = [
  { name:'Electricity',              v:2800, growth:3.0, top:['China','US','India'],      unit:'~30 PWh',        note:'By far the largest single commodity by value.' },
  { name:'Cars (new)',               v:2800, growth:3.5, top:['China','Japan','Germany'], unit:'~85M units',     note:'Avg $33k globally; China now 1/3 of volume.' },
  { name:'Crude oil',                v:2500, growth:0.5, top:['US','Saudi','Russia'],     unit:'~100 mb/d',      note:'At $75/bbl. Still the single biggest traded commodity.' },
  { name:'Pharma (Rx + OTC)',         v:1500, growth:6.0, top:['US','EU','China'],        unit:'~$1.5T',         note:'GLP-1s alone expected to hit $150B by 2030.' },
  { name:'Steel (crude)',             v:1200, growth:1.5, top:['China','India','Japan'],  unit:'~1.9 Bt',        note:'China makes ~53%; a textbook chronic-surplus market.' },
  { name:'Natural gas',                v: 900, growth:2.0, top:['US','Russia','Iran'],     unit:'~4.2 tcm',       note:'LNG trade is the fastest-growing slice.' },
  { name:'Coal',                       v: 800, growth:1.0, top:['China','India','Indonesia'], unit:'~8.5 Bt',     note:'Still ~27% of primary energy — peak not clearly passed.' },
  { name:'Semiconductors',             v: 620, growth:10.0, top:['Taiwan','Korea','US'],   unit:'~$620B',         note:'NVIDIA alone ~$120B; TSMC fabs ~92% leading-edge.' },
  { name:'Smartphones',                v: 500, growth:2.0, top:['China','India','Vietnam'], unit:'~1.2B units',   note:'Apple + Samsung = ~70% of revenue even though <40% of units.' },
  { name:'Beef',                       v: 470, growth:2.5, top:['US','Brazil','EU'],       unit:'~75 Mt',         note:'Highest $/kg of the major meats.' },
  { name:'Milk & dairy',               v: 450, growth:2.5, top:['EU','US','India'],       unit:'~930 Mt',        note:'India is the largest producer by volume.' },
  { name:'Pork',                       v: 420, growth:1.5, top:['China','EU','US'],       unit:'~115 Mt',        note:'China consumes ~half of global pork output.' },
  { name:'Poultry',                    v: 370, growth:3.0, top:['US','China','Brazil'],   unit:'~140 Mt',        note:'Fastest-growing meat category; feed-efficient.' },
  { name:'Luxury goods',               v: 390, growth:3.0, top:['France','Italy','Switzerland'], unit:'~$390B',   note:'LVMH alone ~$90B revenue.' },
  { name:'Aluminum',                   v: 250, growth:2.5, top:['China','India','Russia'], unit:'~70 Mt',         note:'Very electricity-intensive; smelters follow cheap power.' },
  { name:'Copper',                     v: 250, growth:3.0, top:['Chile','Peru','DRC'],    unit:'~22 Mt',         note:'Electrification bellwether; structural deficit forecast.' },
  { name:'Wheat',                      v: 230, growth:1.5, top:['China','India','Russia'], unit:'~800 Mt',        note:'Russia is the #1 exporter despite being #3 producer.' },
  { name:'Corn (maize)',               v: 220, growth:2.0, top:['US','China','Brazil'],   unit:'~1.2 Gt',        note:'Mostly feed + ethanol, not direct food.' },
  { name:'Rice',                       v: 340, growth:1.5, top:['China','India','Indonesia'], unit:'~520 Mt',    note:'~90% of production is in Asia; thin export market.' },
  { name:'Cement',                     v: 330, growth:1.0, top:['China','India','Vietnam'], unit:'~4.2 Gt',      note:'China pours ~half the world\u2019s cement; peaked 2020.' },
  { name:'Gold (mined)',               v: 230, growth:1.5, top:['China','Australia','Russia'], unit:'~3,000 t',  note:'At ~$2,400/oz; a record mining year in value terms.' },
  { name:'Solar panels',               v: 150, growth:12.0, top:['China','Vietnam','Malaysia'], unit:'~600 GW',  note:'China makes ≥80% of polysilicon, wafer, cell, and module.' },
  { name:'EV batteries',               v: 130, growth:25.0, top:['China','Korea','Japan'], unit:'~1.1 TWh',      note:'CATL + BYD ≈ 55% of world cell shipments.' },
  { name:'Soybeans',                   v: 170, growth:2.5, top:['Brazil','US','Argentina'], unit:'~400 Mt',       note:'Brazil is now the dominant exporter post-2022.' },
  { name:'Coffee',                     v: 100, growth:4.0, top:['Brazil','Vietnam','Colombia'], unit:'~10 Mt',   note:'Brazil + Vietnam ≈ 55% of world supply.' },
  { name:'Lithium (carbonate eq.)',    v:  40, growth:15.0, top:['Australia','Chile','China'], unit:'~1.3 Mt',   note:'Price cycle sharp; demand driven by EV batteries.' },
  { name:'Rare earths',                v:  15, growth:8.0, top:['China','US','Myanmar'],   unit:'~350 kt',        note:'Small by value, but upstream of magnets, motors, lasers.' },
];

// World industries rolled up into the five classical aggregates.
// `v` in $T (value-added-ish); totals are roughly consistent with INDUSTRIES above (~$125T world GDP basis).
// `producers`: top-producer country shares, used in the hover tooltip.
const SECTOR_TREE = [
  { group: 'Services', color: '#38bdf8', accent: '#0ea5e9', items: [
    { name: 'Real estate & rentals',  v: 16.0, producers: [['US',22],['China',18],['EU',17],['Japan',6]], note: 'Housing services + commercial rent, ~14% of world GDP.' },
    { name: 'Wholesale & retail',     v: 13.0, producers: [['US',22],['China',21],['EU',17],['Japan',6]], note: 'E-commerce ≈22% of retail (Amazon, Alibaba, JD).' },
    { name: 'Government services',    v: 11.0, producers: [['US',27],['EU',20],['China',16],['Japan',6]], note: 'Defense, admin, public education — counted at cost.' },
    { name: 'Finance & insurance',    v:  9.0, producers: [['US',40],['EU',20],['China',15],['UK',8]],    note: 'NYC + London dominate wholesale; HK/Singapore in Asia.' },
    { name: 'Healthcare',             v:  7.0, producers: [['US',45],['EU',20],['China',12],['Japan',8]], note: 'US ~$4.9T alone — ~17% of its GDP, a global outlier.' },
    { name: 'Professional services',  v:  7.0, producers: [['US',40],['EU',25],['UK',10],['China',10]],   note: 'Law, consulting, accounting. Big Four + MBB on top.' },
    { name: 'IT & software',          v:  6.0, producers: [['US',55],['India',12],['China',10],['EU',10]], note: 'Hyperscaler capex ≈$400B in 2025.' },
    { name: 'Transport & logistics',  v:  5.0, producers: [['China',20],['US',18],['EU',16],['Japan',5]], note: 'Top 3 carriers (MSC+Maersk+CMA) ≈45% of ocean volume.' },
    { name: 'Education',              v:  4.0, producers: [['US',26],['EU',22],['China',20],['Japan',5]], note: 'Public + private; US higher-ed is a $700B slice.' },
    { name: 'Hospitality & food svc', v:  3.0, producers: [['US',25],['EU',22],['China',18],['Japan',5]], note: 'Travel+tourism back above 2019 post-COVID.' },
    { name: 'Media & entertainment',  v:  2.5, producers: [['US',42],['China',18],['EU',15],['Japan',8]], note: 'Streaming + gaming + ads; Disney, Netflix, Tencent lead.' },
    { name: 'Telecom',                v:  2.0, producers: [['China',24],['US',20],['EU',18],['India',6]], note: '3 carriers per market is typical after consolidation.' },
    { name: 'Other services',         v:  3.0, isOther: true,
      producers: [['US',28],['EU',22],['China',20],['Japan',6],['India',6]],
      top: [['Business services n.e.c.',1.1],['Personal care services',0.7],['Repair & maintenance',0.5],['Admin & support',0.4],['Postal & courier',0.3]],
      note: 'Catch-all for miscellaneous service activities.' },
  ]},
  { group: 'Manufacturing', color: '#fbbf24', accent: '#f59e0b', items: [
    { name: 'Cars & transport eq.',   v: 3.5, producers: [['China',30],['Japan',11],['Germany',10],['US',10],['Korea',5]], note: '~85M units/yr; China now 1/3 of global volume.' },
    { name: 'Electronics',            v: 2.8, producers: [['China',38],['Taiwan',14],['Korea',12],['US',10],['Japan',8]],  note: 'Phones, TVs, PCBs, assemblies.' },
    { name: 'Machinery',              v: 2.2, producers: [['China',28],['Germany',16],['US',12],['Japan',11],['Italy',6]], note: 'Industrial + agricultural + construction equipment.' },
    { name: 'Food & beverage',        v: 2.0, producers: [['China',20],['EU',18],['US',17],['India',6],['Brazil',5]],     note: 'Processed food value-added — farm gate is separate.' },
    { name: 'Chemicals',              v: 2.0, producers: [['China',35],['US',16],['EU',14],['Japan',6],['Korea',5]],       note: 'Petrochem dominates; specialty chem is ~1/3.' },
    { name: 'Metals & products',      v: 1.6, producers: [['China',50],['India',7],['Japan',5],['US',5],['Russia',4]],    note: 'Primary (steel, aluminum) + fabricated metal.' },
    { name: 'Pharmaceuticals',        v: 1.5, producers: [['US',40],['EU',25],['China',12],['India',8],['Japan',6]],       note: 'GLP-1s alone forecast to hit $150B by 2030.' },
    { name: 'Textiles & apparel',     v: 0.4, producers: [['China',50],['Bangladesh',8],['Vietnam',8],['India',7],['EU',6]], note: 'Fast-fashion reshuffling: CN → SE Asia.' },
    { name: 'Other manufacturing',    v: 1.6, isOther: true,
      producers: [['China',40],['EU',15],['US',12],['Japan',7],['India',6]],
      top: [['Rubber & plastics',0.6],['Wood & paper',0.4],['Non-metallic minerals (glass, cement)',0.3],['Furniture',0.2],['Printing & packaging',0.1]],
      note: 'Rubber, plastics, wood, paper, glass, furniture.' },
  ]},
  { group: 'Construction', color: '#c4b5fd', accent: '#a78bfa', items: [
    { name: 'Residential',            v: 3.5, producers: [['China',32],['US',14],['India',8],['EU',12]],                   note: 'China residential cycle has broken down post-2021.' },
    { name: 'Commercial',             v: 2.5, producers: [['China',25],['US',20],['EU',18],['Japan',6]],                   note: 'Office + retail + hotels.' },
    { name: 'Infrastructure',         v: 2.0, producers: [['China',35],['US',15],['India',10],['EU',12]],                  note: 'BRI + US IIJA + EU Green Deal all pushing.' },
    { name: 'Other construction',     v: 0.8, isOther: true,
      producers: [['China',30],['US',18],['EU',16],['India',10],['Japan',6]],
      top: [['Specialized trades (plumbing, electrical)',0.3],['Demolition & site prep',0.2],['Finishing & fit-out',0.15],['Landscaping & civil',0.1],['Land development',0.05]],
      note: 'Specialized trades — plumbing, electrical, finishing.' },
  ]},
  { group: 'Mining & Energy', color: '#fb923c', accent: '#f97316', items: [
    { name: 'Oil & gas',              v: 4.7, producers: [['US',20],['Saudi',13],['Russia',12],['Canada',6],['China',6]], note: 'Upstream revenue; swings with price (volatile).' },
    { name: 'Utilities (power/water)',v: 3.0, producers: [['China',30],['US',18],['EU',15],['India',6]],                   note: 'Electric power alone ≈$2.8T billed revenue.' },
    { name: 'Mining (metals/min.)',   v: 3.0, producers: [['China',30],['Australia',15],['Chile',8],['Brazil',6],['US',5]], note: 'Iron, copper, bauxite, rare earths, lithium.' },
    { name: 'Coal',                   v: 0.8, producers: [['China',51],['India',12],['Indonesia',10],['US',7],['Australia',6]], note: '≈27% of primary energy; peak not clearly passed.' },
    { name: 'Other extractive',       v: 0.7, isOther: true,
      producers: [['China',22],['US',16],['EU',14],['Russia',10],['Middle East',12]],
      top: [['Renewables services (wind/solar O&M)',0.25],['Nuclear fuel cycle',0.15],['Quarrying (sand, gravel, stone)',0.12],['Mining support activities',0.1],['Oil & gas support',0.08]],
      note: 'Renewables ops, nuclear fuel, quarrying, oilfield services.' },
  ]},
  { group: 'Agriculture', color: '#86efac', accent: '#4ade80', items: [
    { name: 'Crops',                  v: 2.2, producers: [['China',22],['India',18],['US',14],['Brazil',7],['EU',10]],    note: 'Grains + oilseeds + cash crops at farm gate.' },
    { name: 'Livestock',              v: 1.4, producers: [['China',25],['US',18],['Brazil',12],['EU',12],['India',8]],    note: 'Cattle, pigs, poultry, dairy at farm gate.' },
    { name: 'Fishing & forestry',     v: 0.4, producers: [['China',30],['Indonesia',10],['EU',14],['US',8],['India',6]],  note: 'Catch + aquaculture + timber.' },
    { name: 'Other agriculture',      v: 0.4, isOther: true,
      producers: [['China',25],['India',18],['US',12],['Brazil',10],['EU',12]],
      top: [['Aquaculture (separate)',0.15],['Agricultural support services',0.1],['Hunting & trapping',0.05],['Logging support',0.05],['Horticulture & nursery',0.05]],
      note: 'Aquaculture, ag services, support activities.' },
  ]},
];

// Squarified treemap layout (Bruls, Huijing, van Wijk 2000).
// Given items with positive `v` and a rectangle, returns each item with {x0,y0,x1,y1}.
function squarifyTiles(items, x0, y0, x1, y1) {
  const sorted = [...items].sort((a, b) => b.v - a.v).filter((i) => i.v > 0);
  const total = sorted.reduce((s, i) => s + i.v, 0) || 1;
  const W = x1 - x0, H = y1 - y0;
  const scale = (W * H) / total;
  const scaled = sorted.map((i) => ({ ...i, _area: i.v * scale }));

  const worst = (row, w) => {
    if (!row.length) return Infinity;
    const s = row.reduce((a, r) => a + r._area, 0);
    let rmax = -Infinity, rmin = Infinity;
    for (const r of row) {
      if (r._area > rmax) rmax = r._area;
      if (r._area < rmin) rmin = r._area;
    }
    const w2 = w * w, s2 = s * s;
    return Math.max((w2 * rmax) / s2, s2 / (w2 * rmin));
  };

  const out = [];
  let cx0 = x0, cy0 = y0, cx1 = x1, cy1 = y1;
  let queue = scaled;

  while (queue.length) {
    const w = Math.min(cx1 - cx0, cy1 - cy0);
    const row = [queue[0]];
    let best = worst(row, w);
    let take = 1;
    for (let i = 1; i < queue.length; i++) {
      const trial = [...row, queue[i]];
      const tw = worst(trial, w);
      if (tw > best) break;
      best = tw;
      row.push(queue[i]);
      take++;
    }
    const rowArea = row.reduce((s, r) => s + r._area, 0);
    const horizontal = (cx1 - cx0) >= (cy1 - cy0); // long side is horizontal → row is vertical strip on left
    if (horizontal) {
      const thickness = rowArea / (cy1 - cy0);
      let y = cy0;
      for (const r of row) {
        const h = r._area / thickness;
        out.push({ ...r, x0: cx0, y0: y, x1: cx0 + thickness, y1: y + h });
        y += h;
      }
      cx0 = cx0 + thickness;
    } else {
      const thickness = rowArea / (cx1 - cx0);
      let x = cx0;
      for (const r of row) {
        const wd = r._area / thickness;
        out.push({ ...r, x0: x, y0: cy0, x1: x + wd, y1: cy0 + thickness });
        x += wd;
      }
      cy0 = cy0 + thickness;
    }
    queue = queue.slice(take);
  }
  return out;
}

const SizeMap = () => {
  const [view, setView] = useState('industries'); // 'industries' | 'commodities' | 'sector'
  const [hover, setHover] = useState(null);

  const isBars = view === 'industries' || view === 'commodities';
  const rows = view === 'industries' ? INDUSTRIES : view === 'commodities' ? COMMODITIES : [];
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.v - a.v),
    [rows]
  );
  const max = sorted[0]?.v ?? 1;
  const fmt = view === 'commodities'
    ? (n) => `$${n >= 1000 ? (n / 1000).toFixed(1) + 'T' : n + 'B'}`
    : (n) => `$${n.toFixed(1)}T`;

  // reference tick values
  const refs = view === 'industries' ? [4, 8, 12, 16] : [500, 1000, 2000, 2800];

  // Sector treemap layout — computed once when the `sector` tab is active.
  const tree = useMemo(() => {
    const W = 620, H = 440, pad = 3;
    // Step 1: squarify the 5 top-level groups into the main rectangle.
    const groupItems = SECTOR_TREE.map((g) => ({
      key: g.group, v: g.items.reduce((s, it) => s + it.v, 0), g,
    }));
    const groupRects = squarifyTiles(groupItems, 0, 0, W, H);
    // Step 2: squarify the items inside each group's rectangle.
    const tiles = [];
    for (const gr of groupRects) {
      const ix0 = gr.x0 + pad, iy0 = gr.y0 + pad;
      const ix1 = gr.x1 - pad, iy1 = gr.y1 - pad;
      if (ix1 <= ix0 || iy1 <= iy0) continue;
      const inner = squarifyTiles(gr.g.items, ix0, iy0, ix1, iy1);
      for (const it of inner) {
        tiles.push({ ...it, group: gr.g.group, color: gr.g.color, accent: gr.g.accent, groupRect: gr });
      }
    }
    return { W, H, groups: groupRects, tiles };
  }, []);

  return (
    <Card
      id="size"
      index={3}
      icon={Scale}
      title="How Big Is What — The Size Map"
      subtitle="The world economy, ranked. Which industries and which individual commodities are biggest — and how fast they're growing."
      accent="amber"
      source="World Bank · UN · IEA · USGS · Statista · BloombergNEF"
    >
      <p>
        "Who makes what" tells you <em>concentration</em>; this tells you <em>size</em>. A monopoly over a $20B market is less load-bearing than a duopoly over a $2T one. The chart below ranks the world economy three ways: the top-level industries that sum to global GDP, the individual commodities or product categories by global production value, and a treemap rolling the whole thing up into the five classical sectors. Hover anything for the top producers and growth rate.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { k:'industries',  label:'Industries ($T)' },
              { k:'commodities', label:'Commodities ($B)' },
              { k:'sector',      label:'By sector (treemap)' },
            ].map((opt) => (
              <button key={opt.k}
                      onClick={() => { setView(opt.k); setHover(null); }}
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                        view === opt.k
                          ? 'bg-amber-500/15 border-amber-400/40 text-amber-100'
                          : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-neutral-200'
                      }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            {view === 'industries'
              ? `${sorted.length} sectors · Σ ≈ $${sorted.reduce((s,r)=>s+r.v,0).toFixed(0)}T`
              : view === 'commodities'
              ? `${sorted.length} commodities`
              : `5 groups · ${tree.tiles.length} items · Σ ≈ $${tree.groups.reduce((s,g)=>s+g.v,0).toFixed(0)}T`}
          </span>
        </div>

        {isBars && (
        <>
        {/* reference ticks */}
        <div className="relative pl-[150px] pr-2 mb-1 h-3">
          {refs.map((r) => (
            <div key={r}
                 className="absolute top-0 bottom-0 border-l border-white/10"
                 style={{ left: `calc(150px + ${(r / max) * 100}% * (100% - 150px) / 100%)` }} />
          ))}
        </div>

        <div className="space-y-1.5">
          {sorted.map((row, i) => {
            const pct = (row.v / max) * 100;
            const isHi = hover && hover.name === row.name;
            return (
              <div key={row.name}
                   onMouseEnter={(e) => setHover({ ...row, mx: e.clientX, my: e.clientY })}
                   onMouseMove={(e) => setHover({ ...row, mx: e.clientX, my: e.clientY })}
                   onMouseLeave={() => setHover(null)}
                   className={`flex items-center gap-3 rounded px-2 py-1 transition-colors ${isHi ? 'bg-white/[0.04]' : ''}`}>
                <span className="w-[6px] text-[10px] font-mono text-neutral-600 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="w-[132px] text-[11px] text-neutral-300 truncate shrink-0">
                  {row.name}
                </span>
                <div className="relative flex-1 h-5 rounded bg-white/[0.03] overflow-visible">
                  <div className="h-full rounded"
                       style={{
                         width: `${Math.max(pct, 1.5)}%`,
                         background: `linear-gradient(90deg, ${isHi ? '#fbbf24' : '#f59e0b'} 0%, ${isHi ? '#f97316' : '#d97706'} 100%)`,
                         boxShadow: isHi ? '0 0 0 1px rgba(251,191,36,0.5)' : 'none',
                         transition: 'box-shadow 120ms',
                       }} />
                </div>
                <span className="w-[56px] text-[11px] font-mono text-neutral-200 text-right shrink-0">
                  {fmt(row.v)}
                </span>
                <span className={`w-[42px] text-[10px] font-mono text-right shrink-0 ${row.growth >= 6 ? 'text-emerald-300' : row.growth >= 3 ? 'text-sky-300' : 'text-neutral-500'}`}>
                  {row.growth >= 0 ? '+' : ''}{row.growth.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* reference legend */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] font-mono text-neutral-500">
          <span className="text-neutral-600">scale:</span>
          {refs.map((r) => (
            <span key={r} className="flex items-center gap-1">
              <span className="inline-block h-2 rounded bg-amber-500/60"
                    style={{ width: `${Math.max(8, (r / max) * 80)}px` }} />
              <span>{fmt(r)}</span>
            </span>
          ))}
          <span className="ml-auto text-neutral-600">growth = CAGR</span>
        </div>
        </>
        )}

        {view === 'sector' && (
          <div>
            <svg viewBox={`0 0 ${tree.W} ${tree.H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* tiles */}
              {tree.tiles.map((t) => {
                const w = t.x1 - t.x0, h = t.y1 - t.y0;
                const isHi = hover && hover.name === t.name && hover.group === t.group;
                const atTop = (t.y0 - t.groupRect.y0) < 4;
                const atLeft = (t.x0 - t.groupRect.x0) < 4;
                const underHeader = atTop && atLeft;
                const labelY = underHeader ? t.y0 + 32 : t.y0 + 13;
                const valueY = underHeader ? t.y0 + 44 : t.y0 + 25;
                const showLabel = w > 52 && h > (underHeader ? 42 : 22);
                const showValue = w > 52 && h > (underHeader ? 54 : 34);
                const baseOpacity = t.isOther ? 0.4 : 0.7;
                return (
                  <g key={`${t.group}-${t.name}`}
                     onMouseEnter={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
                     onMouseMove={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
                     onMouseLeave={() => setHover(null)}
                     style={{ cursor: 'default' }}>
                    <rect x={t.x0} y={t.y0} width={w} height={h}
                          fill={t.color} fillOpacity={isHi ? 0.95 : baseOpacity}
                          stroke="#0a0a0a" strokeWidth={1} />
                    {showLabel ? (
                      <text x={t.x0 + 5} y={labelY}
                            fill={t.isOther ? '#e5e5e5' : '#0a0a0a'} fontSize="10"
                            fontWeight="600"
                            fontStyle={t.isOther ? 'italic' : 'normal'}
                            style={{ pointerEvents: 'none' }}>
                        {(w < 100) ? t.name.split(' & ')[0].slice(0, 14) : t.name}
                      </text>
                    ) : null}
                    {showValue ? (
                      <text x={t.x0 + 5} y={valueY}
                            fill={t.isOther ? '#a3a3a3' : '#0a0a0a'} fontSize="9" opacity="0.85"
                            style={{ pointerEvents: 'none' }}>
                        ${t.v.toFixed(1)}T
                      </text>
                    ) : null}
                  </g>
                );
              })}
              {/* group headers */}
              {tree.groups.map((gr) => {
                const gw = gr.x1 - gr.x0, gh = gr.y1 - gr.y0;
                const labelW = Math.min(gw - 4, Math.max(100, gr.key.length * 7 + 48));
                return (
                  <g key={gr.key} style={{ pointerEvents: 'none' }}>
                    <rect x={gr.x0 + 2} y={gr.y0 + 2} width={labelW} height={16}
                          fill="#0a0a0a" fillOpacity="0.85" rx="2" />
                    <text x={gr.x0 + 6} y={gr.y0 + 13}
                          fill={gr.g.accent} fontSize="10" fontWeight="700"
                          style={{ letterSpacing: '0.06em' }}>
                      {gr.key.toUpperCase()} · ${gr.v.toFixed(0)}T
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-500">
              <span className="text-neutral-600">groups:</span>
              {SECTOR_TREE.map((g) => (
                <span key={g.group} className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: g.color, opacity: 0.85 }} />
                  <span className="text-neutral-400">{g.group}</span>
                </span>
              ))}
              <span className="ml-auto text-neutral-600">area ∝ $ value-added</span>
            </div>
          </div>
        )}

        <FloatingTip
          hover={hover}
          width={280}
          render={(h) => (
            <div className="space-y-1.5">
              {h.group && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: h.color }} />
                  <span style={{ color: h.accent }}>{h.group}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-neutral-100 font-medium">{h.name}</span>
                <span className="font-mono text-amber-300">{fmt(h.v)}</span>
              </div>
              {h.unit && (
                <div className="text-[10px] font-mono text-neutral-500">{h.unit}</div>
              )}
              {h.isOther && Array.isArray(h.top) ? (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-neutral-500">top industries inside</div>
                  {h.top.slice(0, 5).map(([n, v]) => {
                    const maxV = Math.max(...h.top.map(([,vv]) => vv));
                    return (
                      <div key={n} className="flex items-center gap-2 text-[11px]">
                        <span className="flex-1 text-neutral-300 truncate">{n}</span>
                        <div className="w-14 h-1 rounded bg-white/5 overflow-hidden">
                          <div className="h-full rounded" style={{ width: `${(v / maxV) * 100}%`, background: h.accent || '#fbbf24' }} />
                        </div>
                        <span className="w-10 text-right font-mono text-neutral-400">${v.toFixed(1)}T</span>
                      </div>
                    );
                  })}
                </div>
              ) : h.producers ? (
                <div className="space-y-0.5">
                  <div className="text-[10px] text-neutral-500">top producers</div>
                  {h.producers.map(([c, s]) => (
                    <div key={c} className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-neutral-300 truncate">{c}</span>
                      <div className="flex-1 h-1 rounded bg-white/5 overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${Math.min(100, s * 1.8)}%`, background: h.accent || '#fbbf24' }} />
                      </div>
                      <span className="w-8 text-right font-mono text-neutral-400">{s}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-neutral-500">top producers:</span>
                  <span className="text-neutral-200">{h.top?.join(' · ')}</span>
                </div>
              )}
              {h.growth !== undefined && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-neutral-500">growth:</span>
                  <span className={h.growth >= 6 ? 'text-emerald-300' : h.growth >= 3 ? 'text-sky-300' : 'text-neutral-400'}>
                    {h.growth >= 0 ? '+' : ''}{h.growth.toFixed(1)}% /yr
                  </span>
                </div>
              )}
              {h.note && (
                <div className="pt-1 border-t border-white/10 text-[11px] text-neutral-400 italic leading-snug">
                  {h.note}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <p className="text-sm text-neutral-400">
        {view === 'industries'
          ? 'The ranking flattens a common misconception: "the economy" is not mostly manufacturing. Real estate services, wholesale/retail, and government together dwarf it. But the tail — IT services, pharma, finance — is where growth concentrates, which is why investor attention and productive headcount both lean there even as the sectors remain mid-sized.'
          : view === 'commodities'
          ? 'Electricity and cars tie for the single biggest commodities by revenue — both ~$2.8T/yr. Oil is a close third. Below them, the list is strikingly long-tailed: you need to add up dozens of commodities to match one big industry category, which is why most geopolitical "chokepoint" talk is about the top 10 here (energy, chips, steel, pharma, key metals).'
          : 'Rolled up into the five classical aggregates, services dominate — roughly two-thirds of world output — with manufacturing, construction, and mining & energy each a roughly $10–15T band, and agriculture a thin slice at the bottom. The per-country leadership inside each tile is where the geopolitics lives: US in services, China in manufacturing and construction, and a scatter of resource producers in mining & energy.'}
      </p>

      <Deeper>
        <p>
          Industry figures here are <em>gross output</em> where consistent, and value-added where not (true world-GDP comparisons use value-added, which is about 45–60% of gross output depending on the sector). Commodities are <em>production value</em> = global output × average spot price — not the same as the tradable market size, which is smaller (most cement, electricity, and agriculture is consumed domestically, never crossing a border).
        </p>
        <p>
          A useful rule of thumb: at current prices, a commodity cracks the global top 10 only above ~$500B/yr. Everything above that is economically load-bearing; everything below it matters mostly where its supply chain is fragile (rare earths, lithium) or where it sits upstream of something much larger (cobalt, gallium, helium).
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   04 — WHO CONSUMES WHAT
   ============================================================================ */

// For each commodity, paired production and consumption shares.
const CONSUMPTION = [
  { good:'Crude oil',          unit:'~100 mb/d',
    prod:[['US',13],['Saudi',11],['Russia',10],['Canada',6],['Iraq',5],['China',5],['Other',50]],
    cons:[['US',19],['China',16],['EU',13],['India',5],['Japan',4],['Other',43]] },
  { good:'Coal',               unit:'~8.5 Bt',
    prod:[['China',51],['India',12],['Indonesia',10],['US',7],['Australia',6],['Other',14]],
    cons:[['China',56],['India',12],['US',5],['EU',3],['Other',24]] },
  { good:'Electricity',        unit:'~30 PWh',
    prod:[['China',31],['US',16],['India',6],['EU',9],['Russia',4],['Other',34]],
    cons:[['China',30],['US',16],['India',6],['EU',9],['Other',39]] },
  { good:'Cars (sold)',        unit:'~85M units',
    prod:[['China',31],['US',11],['Japan',9],['India',6],['Other',43]],
    cons:[['China',32],['US',16],['EU',12],['India',6],['Japan',5],['Other',29]] },
  { good:'Steel',              unit:'~1.9 Bt',
    prod:[['China',53],['India',8],['Japan',5],['US',4],['Russia',4],['Korea',4],['Other',22]],
    cons:[['China',49],['India',8],['EU',8],['US',5],['Other',30]] },
  { good:'Smartphones',        unit:'~1.2B units',
    prod:[['China',67],['India',13],['Vietnam',11],['Korea',4],['Other',5]],
    cons:[['China',23],['India',11],['US',10],['EU',8],['Other',48]] },
  { good:'Semiconductors (value)', unit:'~$600B',
    prod:[['Taiwan',22],['Korea',19],['US',12],['China',17],['Japan',8],['Other',22]],
    cons:[['China',26],['Americas',23],['EU',11],['Japan',7],['Other',33]] },
  { good:'Beef',               unit:'~75 Mt',
    prod:[['US',18],['Brazil',17],['EU',11],['China',8],['Other',46]],
    cons:[['US',17],['China',19],['EU',12],['Brazil',10],['Other',42]] },
  { good:'Luxury goods',       unit:'~$390B',
    prod:[['EU',60],['US',15],['Other',25]],
    cons:[['China',35],['US',24],['EU',18],['Japan',8],['Other',15]] },
  { good:'Wheat',              unit:'~800 Mt',
    prod:[['China',17],['India',14],['Russia',10],['US',6],['EU',16],['Other',37]],
    cons:[['China',17],['India',13],['EU',14],['Russia',5],['US',4],['Other',47]] },
];

const ConsumptionAtlas = () => {
  const [view, setView] = useState(CONSUMPTION[0].good);
  const [hover, setHover] = useState(null);

  const c = CONSUMPTION.find((x) => x.good === view) || CONSUMPTION[0];

  const sankey = useMemo(() => {
    const prodTotal = c.prod.reduce((s, [, v]) => s + v, 0) || 100;
    const producers = c.prod.map(([name, v]) => ({
      id: 'p:' + name, label: name, col: 0, color: colorOf(name), __v: v,
      sub: `${v}%`,
    }));
    const consumers = c.cons.map(([name, v]) => ({
      id: 'c:' + name, label: name, col: 1, color: colorOf(name), __v: v,
      sub: `${v}%`,
    }));
    const links = [];
    producers.forEach((p) => {
      consumers.forEach((cc) => {
        const v = (p.__v * cc.__v) / prodTotal;
        if (v >= 0.4) links.push({ src: p.id, dst: cc.id, v });
      });
    });
    return { nodes: [...producers, ...consumers], links };
  }, [c]);

  return (
    <Card
      id="consumption"
      index={4}
      icon={ShoppingCart}
      title="Who Consumes What"
      subtitle="A flow view — producers on the left, consumers on the right. Hover any ribbon for the share; pick any commodity."
      accent="fuchsia"
      source="IEA · USDA · Bain · WSA"
    >
      <p>
        The world's commodity flows are easiest to read as ribbons. Each Sankey below partitions <em>one</em> commodity's global volume by who produces it (left) and who consumes it (right). Where the left and right are the same color, the country is roughly balanced; where the left side bulges (China in steel, Brazil in soybeans) the country exports the surplus; where the right side bulges (US in oil, China in semis) the country imports it. The ribbons are sized using the gravity model — useful as an upper-bound visual guide but not a literal bilateral flow.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CONSUMPTION.map((co) => (
            <button key={co.good} onClick={() => { setView(co.good); setHover(null); }}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                      view === co.good
                        ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-neutral-200'
                    }`}>
              {co.good}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
          <span className="text-sm text-neutral-200 font-medium">{c.good}</span>
          <span className="text-[10px] text-neutral-500 font-mono">global ≈ {c.unit}</span>
        </div>
        <Sankey
          nodes={sankey.nodes}
          links={sankey.links}
          colLabels={['Produced by', 'Consumed by']}
          width={620}
          height={Math.max(280, 36 * Math.max(c.prod.length, c.cons.length) + 40)}
          hover={hover}
          setHover={setHover}
        />
        <FloatingTip hover={hover} render={(h) => h.isNode ? (
          <div>
            <div className="font-semibold" style={{ color: h.node.color }}>{h.node.label}</div>
            <div className="mt-0.5 text-neutral-300">
              {h.node.id.startsWith('p:') ? 'Produces' : 'Consumes'}
              {' '}<span className="font-mono text-fuchsia-300">{h.v}%</span> of world {c.good.toLowerCase()}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-neutral-300">
              <span style={{ color: h.srcColor }}>{h.srcLabel}</span>
              <span className="text-neutral-500"> produces → </span>
              <span style={{ color: h.dstColor }}>{h.dstLabel}</span>
              <span className="text-neutral-500"> consumes</span>
            </div>
            <div className="mt-1 font-mono text-fuchsia-300">{h.v.toFixed(2)}% of world flow</div>
            <div className="mt-1 text-[10px] text-neutral-500">gravity-model allocation (illustrative)</div>
          </div>
        )} />
      </div>

      {/* compact production-vs-consumption gap table */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">net export / import position · {c.good}</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {(() => {
            const allCountries = [...new Set([...c.prod.map((x) => x[0]), ...c.cons.map((x) => x[0])])];
            const prodMap = Object.fromEntries(c.prod);
            const consMap = Object.fromEntries(c.cons);
            const rows = allCountries.map((name) => ({
              name, prod: prodMap[name] || 0, cons: consMap[name] || 0,
              net: (prodMap[name] || 0) - (consMap[name] || 0),
            })).sort((a, b) => b.net - a.net);
            return rows.map((r) => {
              const isExp = r.net > 0;
              const isImp = r.net < 0;
              return (
                <div key={r.name} className="flex items-center justify-between text-[11px] gap-2">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: colorOf(r.name) }} />
                    <span>{r.name}</span>
                  </span>
                  <span className={`font-mono ${isExp ? 'text-emerald-300' : isImp ? 'text-rose-300' : 'text-neutral-500'}`}>
                    {isExp ? '+' : ''}{r.net}%
                  </span>
                </div>
              );
            });
          })()}
        </div>
        <div className="mt-2 text-[11px] text-neutral-500">
          <span className="text-emerald-300">positive</span> = net exporter ·
          <span className="text-rose-300"> negative</span> = net importer · the gap is the <em>real</em> trade flow this commodity creates.
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Two patterns dominate. <strong>China is now the world's #1 consumer of physical goods</strong> — coal (56%), steel (49%), cars (32%), beef (19%), luxury (35%) — even though per-capita it's still ~one-third of US levels. <strong>The US remains the world's #1 consumer of energy and digital goods</strong> per dollar — oil (19%), semis (23% of Americas), software, cloud, smartphones. The third pattern is gaps that imply huge cross-border flows: oil from Gulf → Asia, semis from Taiwan/Korea → US/China, cars from China/Japan/Germany → US, beef from Brazil → China.
      </p>

      <Deeper>
        <p>
          A useful frame: the world has two consumption engines and they are very different. The <strong>American consumer</strong> has ~$19T of annual spending — roughly 30% of world household consumption from <em>4% of world population</em>. The <strong>Chinese consumer</strong> has ~$7T — half the US level despite four times the people, but rising fast. The big macro question of the 2020s: does China's consumption converge upward (rebalancing), or does it stay capped by the high savings rate driven by aging, weak safety nets, and property losses?
        </p>
        <p>
          Per-capita is where the inequality is loudest. The US uses ~17 barrels of oil per person per year; the EU ~9; China ~4; India ~1.4. If India and Africa converge toward Chinese intensities by 2050, world oil demand goes up, not down — even with the EV transition. This is the central uncertainty in long-run energy modeling.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   04 — WHERE WEALTH IS PARKED
   ============================================================================ */

// Household wealth by country, $T (UBS Global Wealth Report 2024 estimates)
const WEALTH = [
  { code:'us', name:'United States', total:148, parts:[['Real estate',30],['Equities',30],['Pensions/Insurance',25],['Cash/Deposits',10],['Other',5]] },
  { code:'cn', name:'China',         total: 85, parts:[['Real estate',60],['Cash/Deposits',25],['Equities',5],['Pensions/Insurance',5],['Other',5]] },
  { code:'jp', name:'Japan',         total: 26, parts:[['Cash/Deposits',50],['Real estate',25],['Pensions/Insurance',15],['Equities',7],['Other',3]] },
  { code:'de', name:'Germany',       total: 20, parts:[['Real estate',50],['Cash/Deposits',25],['Pensions/Insurance',15],['Equities',6],['Other',4]] },
  { code:'gb', name:'UK',            total: 17, parts:[['Real estate',40],['Pensions/Insurance',30],['Equities',15],['Cash/Deposits',10],['Other',5]] },
  { code:'fr', name:'France',        total: 17, parts:[['Real estate',55],['Pensions/Insurance',20],['Cash/Deposits',15],['Equities',7],['Other',3]] },
  { code:'ca', name:'Canada',        total: 13, parts:[['Real estate',40],['Pensions/Insurance',25],['Equities',20],['Cash/Deposits',10],['Other',5]] },
  { code:'it', name:'Italy',         total: 12, parts:[['Real estate',55],['Cash/Deposits',25],['Pensions/Insurance',10],['Equities',7],['Other',3]] },
  { code:'in', name:'India',         total: 12, parts:[['Real estate',50],['Cash/Deposits',15],['Equities',10],['Gold',20],['Other',5]] },
  { code:'kr', name:'Korea',         total:  9, parts:[['Real estate',60],['Cash/Deposits',20],['Equities',12],['Pensions/Insurance',6],['Other',2]] },
];
const ASSET_COLORS = {
  'Real estate':         '#fb923c',
  'Equities':            '#7dd3fc',
  'Pensions/Insurance':  '#c4b5fd',
  'Cash/Deposits':       '#5eead4',
  'Gold':                '#facc15',
  'Other':               '#737373',
};

const SWFS = [
  { name:'Norway GPFG',                country:'no', aum:1700 },
  { name:'China Investment Corp',       country:'cn', aum:1330 },
  { name:'Abu Dhabi Investment Auth.',  country:'ae', aum:1100 },
  { name:'Kuwait Investment Auth.',     country:'kw', aum: 950 },
  { name:'Saudi Public Investment Fund',country:'sa', aum: 930 },
  { name:'GIC Singapore',               country:'sg', aum: 800 },
  { name:'Qatar Investment Authority',  country:'qa', aum: 530 },
  { name:'HKMA Exchange Fund',          country:'hk', aum: 510 },
  { name:'Mubadala (UAE)',              country:'ae', aum: 320 },
  { name:'Temasek (Singapore)',         country:'sg', aum: 290 },
  { name:'Korea Investment Corp',       country:'kr', aum: 200 },
  { name:'Russia NWF',                  country:'ru', aum: 150 },
];

const TREASURIES = [
  { name:'Japan',              v:1080 },
  { name:'China',              v: 770 },
  { name:'UK',                 v: 720 },
  { name:'Luxembourg',         v: 410 },
  { name:'Cayman Islands',     v: 400 },
  { name:'Belgium',            v: 380 },
  { name:'Canada',             v: 360 },
  { name:'France',             v: 330 },
  { name:'Ireland',            v: 320 },
  { name:'Switzerland',        v: 290 },
  { name:'Taiwan',             v: 280 },
  { name:'Singapore',          v: 220 },
];

const SwfBubbles = () => {
  const [hover, setHover] = useState(null);
  const W = 620, H = 240;
  const maxA = SWFS[0].aum;
  // simple horizontal pack into 2 rows
  const placed = useMemo(() => {
    const items = SWFS.map((s) => ({ ...s, r: Math.sqrt(s.aum / maxA) * 48 + 10 }));
    const out = [];
    const rowGap = 8;
    let row = 0;
    let cursor = 24;
    items.forEach((s) => {
      if (cursor + s.r * 2 > W - 16) {
        row += 1;
        cursor = 24;
      }
      out.push({ ...s, cx: cursor + s.r, cy: row === 0 ? H * 0.32 : H * 0.72 });
      cursor += s.r * 2 + rowGap;
    });
    return out;
  }, []);
  const totalAum = SWFS.reduce((s, x) => s + x.aum, 0);
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-5 relative">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
        <span>sovereign wealth funds · AUM</span>
        <span className="font-mono normal-case tracking-normal text-neutral-400">total ≈ ${(totalAum / 1000).toFixed(1)}T</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
        {placed.map((s) => {
          const c = colorOf(s.country === 'kw' ? 'Other' : s.country === 'hk' ? 'cn' : s.country);
          const isH = hover && hover.name === s.name;
          return (
            <g key={s.name}
               onMouseEnter={(e) => setHover({ ...s, color: c, mx: e.clientX, my: e.clientY })}
               onMouseMove={(e) => setHover({ ...s, color: c, mx: e.clientX, my: e.clientY })}
               style={{ cursor: 'pointer' }}>
              <circle cx={s.cx} cy={s.cy} r={s.r}
                      fill={c} fillOpacity={isH ? 0.35 : 0.18}
                      stroke={c} strokeWidth={isH ? 2 : 1.2} />
              <text x={s.cx} y={s.cy + 3} fontSize="11" textAnchor="middle"
                    fill={c} fontFamily="ui-monospace" fontWeight="600">
                ${s.aum}B
              </text>
            </g>
          );
        })}
      </svg>
      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className="font-semibold" style={{ color: h.color }}>{h.name}</div>
          <div className="mt-0.5 font-mono text-amber-300">${h.aum}B AUM</div>
          <div className="mt-0.5 text-[10px] text-neutral-500">{(h.aum / totalAum * 100).toFixed(1)}% of global SWF AUM</div>
        </div>
      )} />
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-neutral-400">
        {SWFS.map((s) => (
          <div key={s.name} className="truncate">
            <span style={{ color: colorOf(s.country === 'hk' ? 'cn' : s.country) }}>●</span> {s.name} <span className="text-neutral-600">${s.aum}B</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-neutral-500">
        SWFs are governments acting like asset managers. <span className="text-emerald-300">Norway</span> from oil; <span className="text-fuchsia-300">CIC</span>/<span className="text-fuchsia-300">SAFE</span> from China's FX surplus; <span className="text-lime-300">Saudi PIF</span>, <span className="text-amber-300">ADIA</span>, <span className="text-emerald-300">QIA</span>, <span className="text-emerald-300">KIA</span> from oil. They own meaningful slices of public equity worldwide and increasingly do private deals (PIF in tech, Mubadala in chips, Norway in literally everything).
      </div>
    </div>
  );
};

const TreasuryBars = () => {
  const [hover, setHover] = useState(null);
  const total = TREASURIES.reduce((s, t) => s + t.v, 0);
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-5 relative">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
        <span>foreign holders of US Treasuries · $B</span>
        <span className="font-mono normal-case tracking-normal text-neutral-400">foreign ≈ $8.5T of $36T total</span>
      </div>
      <div className="space-y-1.5">
        {TREASURIES.map((t) => {
          const isH = hover && hover.name === t.name;
          return (
            <div key={t.name}
                 onMouseEnter={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
                 onMouseMove={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
                 onMouseLeave={() => setHover(null)}
                 className={`grid grid-cols-[110px_1fr_60px] items-center gap-2 text-xs px-2 py-0.5 rounded transition-colors ${isH ? 'bg-white/[0.04]' : ''}`}>
              <span>{t.name}</span>
              <div className="h-3 bg-white/[0.03] rounded">
                <div className="h-full rounded" style={{ width: `${(t.v / 1100) * 100}%`, background: '#7dd3fc', opacity: isH ? 1 : 0.8 }} />
              </div>
              <span className="text-right font-mono text-sky-300">${t.v}B</span>
            </div>
          );
        })}
      </div>
      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className="font-semibold text-sky-200">{h.name}</div>
          <div className="mt-0.5 font-mono text-sky-300">${h.v}B in US Treasuries</div>
          <div className="mt-0.5 text-[10px] text-neutral-500">{(h.v / total * 100).toFixed(1)}% of foreign holdings · {(h.v / 36000 * 100).toFixed(1)}% of total federal debt</div>
        </div>
      )} />
      <div className="mt-2 text-[11px] text-neutral-500">
        Note: <span className="text-amber-300">Cayman Islands / Luxembourg / Belgium / Ireland</span> aren't really sovereign holders — they're booking domiciles for hedge funds and bank conduits. The real owners are partly private US investors abroad.
      </div>
    </div>
  );
};

const WealthAtlas = () => {
  const [hhHover, setHhHover] = useState(null);
  return (
    <Card
      id="wealth"
      index={5}
      icon={Vault}
      title="Where the Wealth Is Parked"
      subtitle="$470T of household wealth, $9T in sovereign wealth funds, and the foreign-government holders of US debt."
      accent="amber"
      source="UBS GWR 2024 · SWFI · US Treasury TIC"
    >
      <p>
        Output is a flow ($110T per year). Wealth is the stock — the accumulated net worth of households, governments, and institutions. Total household wealth worldwide is estimated at <span className="text-amber-300 font-mono">~$470T</span>, or roughly <span className="text-amber-300 font-mono">4.3×</span> annual world GDP. Where it sits — by country, and by asset class — determines who owns the world's productive capital and who is exposed to which kinds of crashes.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
          <span>household wealth · top 10 · $T</span>
          <span className="font-mono normal-case tracking-normal text-neutral-400">world ≈ $470T</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[10px] uppercase tracking-widest font-mono">
          {Object.entries(ASSET_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
              <span style={{ color: c }}>{k}</span>
            </span>
          ))}
        </div>
        <div className="space-y-2" onMouseLeave={() => setHhHover(null)}>
          {WEALTH.map((w) => {
            const widthPct = (w.total / 150) * 100;
            const isRow = hhHover && hhHover.code === w.code;
            return (
              <div key={w.code} className={`grid grid-cols-[120px_1fr_60px] items-center gap-2 text-xs rounded transition-colors ${isRow ? 'bg-white/[0.04]' : ''}`}>
                <span className="flex items-center gap-1.5"><Flag code={w.code} /> <span>{w.name}</span></span>
                <div className="h-4 bg-white/[0.02] rounded">
                  <div className="flex h-full rounded overflow-hidden" style={{ width: `${widthPct}%` }}>
                    {w.parts.map(([k, v]) => (
                      <div key={k}
                           onMouseEnter={(e) => setHhHover({ ...w, part: k, pct: v, color: ASSET_COLORS[k] || '#737373', mx: e.clientX, my: e.clientY })}
                           onMouseMove={(e) => setHhHover({ ...w, part: k, pct: v, color: ASSET_COLORS[k] || '#737373', mx: e.clientX, my: e.clientY })}
                           style={{ width: `${v}%`, background: ASSET_COLORS[k] || '#737373', opacity: isRow && hhHover.part === k ? 1 : (isRow ? 0.5 : 0.9), cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <span className="text-right font-mono text-amber-300">${w.total}T</span>
              </div>
            );
          })}
        </div>
        <FloatingTip hover={hhHover} render={(h) => (
          <div>
            <div className="flex items-center gap-2">
              <Flag code={h.code} />
              <span className="font-semibold">{h.name}</span>
              <span className="font-mono text-amber-300">${h.total}T</span>
            </div>
            <div className="mt-1.5 text-[11px] grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
              {h.parts.map(([k, v]) => (
                <React.Fragment key={k}>
                  <span className="flex items-center gap-1.5" style={{ color: k === h.part ? ASSET_COLORS[k] : '#a3a3a3' }}>
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ background: ASSET_COLORS[k] }} />
                    {k}
                  </span>
                  <span className="text-right font-mono" style={{ color: k === h.part ? ASSET_COLORS[k] : '#e5e5e5', fontWeight: k === h.part ? 600 : 400 }}>
                    {v}% · ${((v / 100) * h.total).toFixed(1)}T
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )} />
        <div className="mt-2 text-[11px] text-neutral-500">
          width = total wealth (proportional) · color split = asset composition. Hover any segment to see the full breakdown. China and Japan have ~75% of wealth in real estate or cash. The US has ~55% in equities + pensions — by far the most financialized.
        </div>
      </div>

      {/* SWF bubbles */}
      <SwfBubbles />

      {/* Treasuries */}
      <TreasuryBars />

      <Deeper>
        <p>
          Wealth-to-GDP ratios are a quiet macro signal. The world's <Eq>{`W/Y \\approx 4.3`}</Eq> is the highest ever measured, driven by 30 years of rising asset prices on slow real growth. In the US, <Eq>{`W/Y \\approx 5.1`}</Eq> (2024). When this ratio is high, asset returns mechanically have to be lower (more wealth chasing the same cashflows) — a well-documented headwind for forward equity returns.
        </p>
        <p>
          The Chinese household balance sheet is the world's most concentrated bet on a single asset: <span className="text-amber-300 font-mono">~60%</span> of wealth in residential real estate. The 2021–24 property correction wiped out an estimated $18T of paper wealth — comparable in size to the 2008 US housing wipeout — but with much less leverage in the system, so the second-round effects play out differently (slowly, through consumption restraint, rather than as a banking panic).
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   05 — TRADE FLOWS
   ============================================================================ */

// Major bilateral trade corridors, $B 2024 (goods). Order matters for layout.
const NODES = [
  { id:'us',    label:'United States', angle: -90 },
  { id:'cn',    label:'China',         angle:  -10 },
  { id:'eu',    label:'EU',            angle: -150 },
  { id:'jp',    label:'Japan',         angle:   30 },
  { id:'kr',    label:'Korea',         angle:   55 },
  { id:'asean', label:'ASEAN',         angle:   80 },
  { id:'in',    label:'India',         angle:  110 },
  { id:'mx',    label:'Mexico',        angle:  170 },
  { id:'ca',    label:'Canada',        angle: -120 },
  { id:'gulf',  label:'Gulf',          angle:  140 },
  { id:'br',    label:'Brazil',        angle: -160 },
  { id:'ru',    label:'Russia',        angle:    5 },
];

const LINKS = [
  // bilateral directional goods trade in $B, 2024 approx. aToB = a's exports to b.
  { a:'us',    b:'mx',    aToB: 320, bToA: 520 },  // Mexico surplus $200B
  { a:'us',    b:'ca',    aToB: 350, bToA: 410 },
  { a:'cn',    b:'eu',    aToB: 520, bToA: 260 },  // China surplus $260B
  { a:'cn',    b:'us',    aToB: 440, bToA: 140 },  // China surplus $300B
  { a:'cn',    b:'asean', aToB: 580, bToA: 400 },
  { a:'us',    b:'eu',    aToB: 370, bToA: 610 },  // EU surplus $240B
  { a:'cn',    b:'jp',    aToB: 180, bToA: 140 },
  { a:'cn',    b:'kr',    aToB: 140, bToA: 160 },
  { a:'us',    b:'jp',    aToB:  80, bToA: 150 },
  { a:'us',    b:'kr',    aToB:  70, bToA: 130 },
  { a:'cn',    b:'in',    aToB: 100, bToA:  30 },
  { a:'us',    b:'in',    aToB:  40, bToA:  90 },
  { a:'cn',    b:'ru',    aToB: 115, bToA: 125 },
  { a:'cn',    b:'br',    aToB:  60, bToA: 100 },
  { a:'eu',    b:'gulf',  aToB: 140, bToA: 100 },
  { a:'cn',    b:'gulf',  aToB: 140, bToA: 180 },
  { a:'jp',    b:'asean', aToB: 160, bToA: 120 },
  { a:'kr',    b:'asean', aToB: 130, bToA:  90 },
  { a:'in',    b:'gulf',  aToB:  70, bToA: 130 },
];

const CHOKEPOINTS = [
  { name:'Strait of Hormuz',  share:'20% of oil · 20% of LNG', risk:'Iran tensions, periodic threats',           color:'#fb7185' },
  { name:'Strait of Malacca', share:'30% of trade · 25% of oil', risk:'piracy historically; China bypass attempts', color:'#fbbf24' },
  { name:'Suez Canal',        share:'12% of trade',              risk:'Houthi attacks 2024 cut traffic ~50%',     color:'#f87171' },
  { name:'Panama Canal',      share:'5% of trade',               risk:'2023–24 drought cut throughput ~36%',      color:'#22d3ee' },
  { name:'Bab el-Mandeb',     share:'10% of oil',                risk:'connected to Houthi/Red Sea risk',         color:'#a78bfa' },
];

const TradeFlows = () => {
  const cx = 300, cy = 300, R = 230;
  const nodes = NODES.map((n) => {
    const rad = (n.angle * Math.PI) / 180;
    return { ...n, x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  });
  const nMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const maxDir = Math.max(...LINKS.flatMap((l) => [l.aToB, l.bToA]));
  const totalWorldTrade = LINKS.reduce((s, l) => s + l.aToB + l.bToA, 0);
  const [hover, setHover] = useState(null);
  const colorFor = (id) => colorOf(id === 'eu' ? 'EU' : id === 'asean' ? 'ASEAN' : id === 'gulf' ? 'Saudi' : id);

  // build the two directional arcs per corridor, with a perpendicular offset so both are visible
  const arcs = LINKS.flatMap((l) => {
    const a = nMap[l.a], b = nMap[l.b];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len, py = dx / len; // perpendicular unit vector
    const SEP = 14;
    return [
      { id: `${l.a}>${l.b}`, src: l.a, dst: l.b, v: l.aToB, total: l.aToB + l.bToA, other: l.bToA,
        ax: a.x, ay: a.y, bx: b.x, by: b.y,
        cpx: cx + px * SEP, cpy: cy + py * SEP,
        srcLabel: a.label, dstLabel: b.label },
      { id: `${l.b}>${l.a}`, src: l.b, dst: l.a, v: l.bToA, total: l.aToB + l.bToA, other: l.aToB,
        ax: b.x, ay: b.y, bx: a.x, by: a.y,
        cpx: cx - px * SEP, cpy: cy - py * SEP,
        srcLabel: b.label, dstLabel: a.label },
    ];
  });

  // scale reference arcs for the legend
  const SCALE_REFS = [100, 300, 600];
  const swFor = (v) => Math.max(0.8, (v / maxDir) * 9);

  return (
    <Card
      id="trade"
      index={6}
      icon={Ship}
      title="Trade Flows — The Corridors"
      subtitle="Bilateral goods trade between the world's major economies, plus the chokepoints all of it sails through."
      accent="emerald"
      source="UN Comtrade · IMF DOTS · 2024"
    >
      <p>
        Total world goods trade was about <span className="text-emerald-300 font-mono">$24T</span> in 2024. Almost all of it moves through about a dozen bilateral corridors. Each corridor is drawn as <strong>two arcs</strong> — one per direction — with thickness proportional to the flow that way. Where the two arcs are visibly unequal, the corridor is running a surplus. Hover any arc.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <svg viewBox="0 0 600 620" className="w-full h-auto">
          {arcs.map((arc) => {
            const c = colorFor(arc.src);
            const isH = hover && hover.id === arc.id;
            const isDim = hover && !isH;
            return (
              <path
                key={arc.id}
                d={`M ${arc.ax} ${arc.ay} Q ${arc.cpx} ${arc.cpy} ${arc.bx} ${arc.by}`}
                fill="none"
                stroke={c}
                strokeWidth={swFor(arc.v)}
                strokeOpacity={isDim ? 0.12 : (isH ? 1 : 0.72)}
                strokeLinecap="round"
                onMouseEnter={(e) => setHover({ ...arc, color: c, mx: e.clientX, my: e.clientY })}
                onMouseMove={(e) => setHover((h) => h && h.id === arc.id ? { ...h, mx: e.clientX, my: e.clientY } : h)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer', transition: 'stroke-opacity .15s' }}
              />
            );
          })}
          {nodes.map((n) => {
            const c = colorFor(n.id);
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="22" fill="#0a0a0a" stroke={c} strokeWidth="1.5" />
                <text x={n.x} y={n.y - 28} fontSize="11" textAnchor="middle" fill={c} fontFamily="ui-sans-serif" fontWeight="600">{n.label}</text>
              </g>
            );
          })}

          {/* scale reference — arc thickness ↔ $B/yr */}
          <g transform="translate(18, 534)">
            <text x="0" y="0" fontSize="9" fill="#737373" fontFamily="ui-monospace" style={{ letterSpacing: '0.05em' }}>SCALE · $B/YR (ONE DIRECTION)</text>
            {SCALE_REFS.map((v, i) => {
              const y = 14 + i * 14;
              return (
                <g key={v}>
                  <line x1="4" y1={y} x2="70" y2={y} stroke="#a3a3a3" strokeWidth={swFor(v)} strokeLinecap="round" strokeOpacity="0.72" />
                  <text x="78" y={y + 3} fontSize="10" fill="#a3a3a3" fontFamily="ui-monospace">${v}</text>
                </g>
              );
            })}
          </g>
        </svg>
        <FloatingTip hover={hover} width={280} render={(h) => {
          const total = h.total;
          const surplusAbs = Math.abs(h.v - h.other);
          const srcIsBigger = h.v > h.other;
          const imbalancePct = ((h.v - h.other) / total) * 100;
          return (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: h.color }}>{h.srcLabel}</span>
                <span className="text-neutral-500">→</span>
                <span className="font-semibold">{h.dstLabel}</span>
              </div>
              <div className="mt-1.5 text-[11px] grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                <span className="text-neutral-400">this direction</span>
                <span className="text-right font-mono font-semibold" style={{ color: h.color }}>${h.v}B</span>
                <span className="text-neutral-400">return flow</span>
                <span className="text-right font-mono text-neutral-300">${h.other}B</span>
                <span className="text-neutral-500 border-t border-white/10 pt-1 mt-0.5">two-way total</span>
                <span className="text-right font-mono text-emerald-300 border-t border-white/10 pt-1 mt-0.5">${total}B</span>
                <span className="text-neutral-500">surplus</span>
                <span className="text-right font-mono text-amber-300">
                  ${surplusAbs}B → {srcIsBigger ? h.dstLabel : h.srcLabel}
                </span>
                <span className="text-neutral-500">imbalance</span>
                <span className="text-right font-mono text-neutral-300">{Math.abs(imbalancePct).toFixed(0)}% of total</span>
              </div>
            </div>
          );
        }} />
        <div className="text-[11px] text-neutral-500 text-center -mt-2">
          each corridor = two arcs (one per direction) · thickness ≈ directional flow · {LINKS.length} largest corridors · ~${(totalWorldTrade/1000).toFixed(1)}T of goods shown
        </div>
      </div>

      <p className="text-sm text-neutral-400">
        Three things stand out. <strong>The North American block</strong> (US-Mexico-Canada at $1.6T two-way) now exceeds China-US trade — the historic decoupling story is real. <strong>China-ASEAN at $980B</strong> is now the world's #1 bilateral corridor; the ASEAN bloc has quietly become China's largest trading partner. <strong>EU internal trade</strong> (not shown — would dwarf everything at ~$5T) is its own self-contained universe.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
          <Anchor className="w-3 h-3" /> chokepoints — where most of it physically passes
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {CHOKEPOINTS.map((c) => (
            <div key={c.name} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: c.color }}>{c.name}</span>
                <span className="text-[10px] font-mono text-neutral-400">{c.share}</span>
              </div>
              <div className="mt-1 text-[11px] text-neutral-400">{c.risk}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-neutral-500">
          The Houthi attacks (Nov 2023 →) cut Red Sea / Suez container traffic ~50%, rerouting ships around Africa (+10–14 days, +30% fuel costs). Panama drought (2023–24) cut throughput by ~36%. Two of the world's five chokepoints have been impaired simultaneously since 2024 — the most stressed shipping environment since WWII.
        </div>
      </div>

      <Deeper>
        <p>
          Container ports are the other physical chokepoint. The world's <strong>top 10 container ports moved 280M TEUs in 2023</strong>; 7 of those 10 are in China + Singapore + Korea. Shanghai alone moved 49M TEUs, ten times Los Angeles. The maritime infrastructure of world trade is overwhelmingly concentrated in East and Southeast Asia, mostly built or expanded in the last 25 years.
        </p>
        <p>
          Trade in <em>services</em> (~$8T globally) is a different map: US, UK, Germany, India, China lead. India alone exports ~$340B in IT/BPO services — more than its goods trade with the US. Services trade is also more dollar-invoiced than goods, less affected by tariffs, and harder to measure.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   06 — CAPITAL FLOWS
   ============================================================================ */

const NIIP = [
  { c:'United States', v: -24.0 },
  { c:'Spain',         v:  -1.0 },
  { c:'Brazil',        v:  -0.9 },
  { c:'UK',            v:  -0.6 },
  { c:'Australia',     v:  -0.7 },
  { c:'India',         v:  -0.4 },
  { c:'Mexico',        v:  -0.6 },
  { c:'France',        v:  -0.9 },
  { c:'Switzerland',   v:  +0.9 },
  { c:'Norway',        v:  +1.4 },
  { c:'Singapore',     v:  +1.0 },
  { c:'Hong Kong',     v:  +1.3 },
  { c:'Taiwan',        v:  +1.5 },
  { c:'China',         v:  +3.0 },
  { c:'Germany',       v:  +3.0 },
  { c:'Japan',         v:  +3.5 },
];

const FDI_INFLOWS = [
  { c:'us', name:'United States', v: 350 },
  { c:'cn', name:'China',         v: 110 },
  { c:'gb', name:'UK',            v:  90 },
  { c:'sg', name:'Singapore',     v:  80 },
  { c:'br', name:'Brazil',        v:  65 },
  { c:'in', name:'India',         v:  50 },
  { c:'mx', name:'Mexico',        v:  45 },
  { c:'fr', name:'France',        v:  42 },
  { c:'de', name:'Germany',       v:  35 },
  { c:'ae', name:'UAE',           v:  31 },
];

const REMITTANCES = [
  { c:'in', name:'India',        v: 130 },
  { c:'mx', name:'Mexico',       v:  67 },
  { c:'cn', name:'China',        v:  50 },
  { c:'ph', name:'Philippines',  v:  40 },
  { c:'pk', name:'Pakistan',     v:  30 },
  { c:'eg', name:'Egypt',        v:  25 },
  { c:'bd', name:'Bangladesh',   v:  23 },
  { c:'ng', name:'Nigeria',      v:  20 },
];

// Cash-flow Sankey: where the world's annual surplus savings go (~$1.25T net flow, 2024).
// Sources → instruments → destinations. Approximate, BIS / IMF BoP / US TIC.
const CASH_FLOW = {
  nodes: [
    // col 0 — sources of net savings
    { id:'src-cn',   col:0, label:'China',         color: C.China,    sub:'$300B' },
    { id:'src-eu',   col:0, label:'Germany + EU',  color: C.Germany,  sub:'$250B' },
    { id:'src-gulf', col:0, label:'Gulf states',   color: C.Saudi,    sub:'$250B' },
    { id:'src-jp',   col:0, label:'Japan',         color: C.Japan,    sub:'$200B' },
    { id:'src-twkr', col:0, label:'Taiwan + Korea',color: C.Taiwan,   sub:'$150B' },
    { id:'src-sghk', col:0, label:'Singapore + HK',color: C.Singapore,sub:'$100B' },
    // col 1 — instruments
    { id:'inst-res', col:1, label:'Reserves & SWFs',  color:'#c4b5fd' },
    { id:'inst-bnd', col:1, label:'Foreign bonds',    color:'#7dd3fc' },
    { id:'inst-eq',  col:1, label:'Equity & FDI',     color:'#34d399' },
    // col 2 — destinations
    { id:'dst-ust',   col:2, label:'US Treasuries',   color:'#fbbf24' },
    { id:'dst-ucorp', col:2, label:'US Corp debt',    color:'#fde68a' },
    { id:'dst-ueq',   col:2, label:'US Equities',     color:'#7dd3fc' },
    { id:'dst-upriv', col:2, label:'US Private / RE', color:'#fb923c' },
    { id:'dst-eu',    col:2, label:'EU & DM bonds',   color:'#a78bfa' },
    { id:'dst-em',    col:2, label:'EM & other',      color:'#fb7185' },
  ],
  links: [
    // sources → instruments
    { src:'src-cn',   dst:'inst-res', v:180 }, { src:'src-cn',   dst:'inst-bnd', v: 80 }, { src:'src-cn',   dst:'inst-eq', v: 40 },
    { src:'src-gulf', dst:'inst-res', v:170 }, { src:'src-gulf', dst:'inst-bnd', v: 40 }, { src:'src-gulf', dst:'inst-eq', v: 40 },
    { src:'src-jp',   dst:'inst-res', v: 10 }, { src:'src-jp',   dst:'inst-bnd', v:150 }, { src:'src-jp',   dst:'inst-eq', v: 40 },
    { src:'src-eu',                                                                       dst:'inst-bnd', v:120 }, { src:'src-eu',   dst:'inst-eq', v:130 },
    { src:'src-twkr', dst:'inst-res', v: 40 }, { src:'src-twkr', dst:'inst-bnd', v: 70 }, { src:'src-twkr', dst:'inst-eq', v: 40 },
    { src:'src-sghk', dst:'inst-res', v: 30 }, { src:'src-sghk', dst:'inst-bnd', v: 30 }, { src:'src-sghk', dst:'inst-eq', v: 40 },
    // instruments → destinations
    { src:'inst-res', dst:'dst-ust',   v:280 }, { src:'inst-res', dst:'dst-ucorp', v: 30 },
    { src:'inst-res', dst:'dst-ueq',   v: 60 }, { src:'inst-res', dst:'dst-upriv', v: 40 },
    { src:'inst-res', dst:'dst-eu',    v: 10 }, { src:'inst-res', dst:'dst-em',    v: 10 },
    { src:'inst-bnd', dst:'dst-ust',   v:180 }, { src:'inst-bnd', dst:'dst-ucorp', v:180 },
    { src:'inst-bnd', dst:'dst-eu',    v: 80 }, { src:'inst-bnd', dst:'dst-em',    v: 50 },
    { src:'inst-eq',  dst:'dst-ueq',   v:200 }, { src:'inst-eq',  dst:'dst-upriv', v: 60 },
    { src:'inst-eq',  dst:'dst-eu',    v: 50 }, { src:'inst-eq',  dst:'dst-em',    v: 20 },
  ],
};

const CapitalFlows = () => {
  const sortedNIIP = [...NIIP].sort((a, b) => a.v - b.v);
  const maxAbs = Math.max(...NIIP.map((n) => Math.abs(n.v)));
  const [niipHover, setNiipHover] = useState(null);
  const [fdiHover, setFdiHover] = useState(null);
  const [remHover, setRemHover] = useState(null);
  const [cfHover, setCfHover] = useState(null);
  const totalNiipPos = NIIP.filter((n) => n.v > 0).reduce((s, n) => s + n.v, 0);

  return (
    <Card
      id="capital"
      index={7}
      icon={Banknote}
      title="Capital Flows — Who Owes Whom"
      subtitle="The annual flow of surplus savings, who owes whom on the stock side, and the underrated remittance economy."
      accent="rose"
      source="IMF BoP · BIS · UNCTAD · US Treasury TIC · 2024"
    >
      <p>
        Trade flows show what gets shipped this year. Capital flows show who is accumulating claims on whom. Below: first the <strong>annual cash-flow Sankey</strong> tracing how the world's net surplus savings (~$1.25T/yr) get recycled from surplus economies, through specific instruments, into specific destinations; then the <strong>stock</strong> view — net international investment positions — and the FDI / remittance flows that round out the picture.
      </p>

      {/* Cash flows Sankey */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4 relative">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-2">
          <span>annual cash-flow recycling · $B 2024</span>
          <span className="font-mono normal-case tracking-normal text-neutral-400">net flow ≈ $1.25T / yr</span>
        </div>
        <Sankey
          nodes={CASH_FLOW.nodes}
          links={CASH_FLOW.links}
          colLabels={['Source of surplus', 'Instrument', 'Destination']}
          width={620}
          height={460}
          hover={cfHover}
          setHover={setCfHover}
        />
        <FloatingTip hover={cfHover} render={(h) => h.isNode ? (
          <div>
            <div className="font-semibold" style={{ color: h.node.color }}>{h.node.label}</div>
            {h.node.sub && <div className="mt-0.5 font-mono text-amber-300">{h.node.sub}</div>}
          </div>
        ) : (
          <div>
            <div className="text-neutral-300">
              <span style={{ color: h.srcColor }}>{h.srcLabel}</span>
              <span className="text-neutral-500"> → </span>
              <span style={{ color: h.dstColor }}>{h.dstLabel}</span>
            </div>
            <div className="mt-1 font-mono text-rose-300">${h.v}B / yr</div>
          </div>
        )} />
        <div className="mt-2 text-[11px] text-neutral-500">
          Read left-to-right: surplus economies (China, Gulf, Japan, EU…) save more than they invest at home; the surplus moves through instruments (FX reserves & SWFs, foreign bonds, equity / FDI); and ends up parked overwhelmingly in <span className="text-amber-300">US Treasuries</span>, <span className="text-sky-300">US equities</span> and <span className="text-orange-300">US private assets</span>. This is the <strong>"global savings glut"</strong> that funds the US current-account deficit and pushes the dollar to be the world's reserve currency.
        </div>
      </div>

      {/* NIIP — stock view */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-5 relative">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
          <span>net international investment position · $T 2024</span>
          <span className="font-mono normal-case tracking-normal text-neutral-400">creditors ≈ ${totalNiipPos.toFixed(1)}T</span>
        </div>
        <div className="space-y-1">
          {sortedNIIP.map((n) => {
            const w = (Math.abs(n.v) / maxAbs) * 50;
            const isPos = n.v >= 0;
            const isH = niipHover && niipHover.c === n.c;
            return (
              <div key={n.c}
                   onMouseEnter={(e) => setNiipHover({ ...n, mx: e.clientX, my: e.clientY })}
                   onMouseMove={(e) => setNiipHover({ ...n, mx: e.clientX, my: e.clientY })}
                   onMouseLeave={() => setNiipHover(null)}
                   className={`grid grid-cols-[110px_1fr_70px] items-center gap-2 text-xs px-2 py-0.5 rounded transition-colors ${isH ? 'bg-white/[0.04]' : ''}`}>
                <span className="truncate">{n.c}</span>
                <div className="relative h-4 bg-white/[0.02] rounded">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                  <div className="absolute top-0 bottom-0 rounded"
                       style={{
                         left: isPos ? '50%' : `${50 - w}%`,
                         width: `${w}%`,
                         background: isPos ? '#34d399' : '#fb7185',
                         opacity: isH ? 1 : 0.85,
                       }} />
                </div>
                <span className={`text-right font-mono ${isPos ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isPos ? '+' : ''}{n.v.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
        <FloatingTip hover={niipHover} render={(h) => (
          <div>
            <div className="font-semibold text-neutral-100">{h.c}</div>
            <div className={`mt-0.5 font-mono ${h.v >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {h.v >= 0 ? '+' : ''}${h.v.toFixed(1)}T net foreign position
            </div>
            <div className="mt-0.5 text-[10px] text-neutral-500">
              {h.v >= 0 ? 'net creditor to the world' : 'net debtor to the world'}
            </div>
          </div>
        )} />
        <div className="mt-2 text-[11px] text-neutral-500">
          green = creditor to the world · rose = debtor. The US at <span className="text-rose-300 font-mono">−$24T</span> is the largest single financial position in human history. Japan, Germany, China, Taiwan, HK and the petrostates are the offsetting creditors.
        </div>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-5 grid md:grid-cols-2 gap-5 relative">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
            <span>FDI inflows · $B</span>
            <span className="font-mono normal-case tracking-normal text-neutral-400">2024</span>
          </div>
          <div className="space-y-1">
            {FDI_INFLOWS.map((f) => {
              const isH = fdiHover && fdiHover.c === f.c;
              return (
                <div key={f.c}
                     onMouseEnter={(e) => setFdiHover({ ...f, mx: e.clientX, my: e.clientY })}
                     onMouseMove={(e) => setFdiHover({ ...f, mx: e.clientX, my: e.clientY })}
                     onMouseLeave={() => setFdiHover(null)}
                     className={`grid grid-cols-[1fr_3fr_50px] items-center gap-2 text-xs px-2 py-0.5 rounded transition-colors ${isH ? 'bg-white/[0.04]' : ''}`}>
                  <span className="flex items-center gap-1.5"><Flag code={f.c} /> {f.name}</span>
                  <div className="h-3 bg-white/[0.03] rounded">
                    <div className="h-full rounded" style={{ width: `${(f.v / 350) * 100}%`, background: colorOf(f.c), opacity: isH ? 1 : 0.85 }} />
                  </div>
                  <span className="text-right font-mono text-neutral-300">${f.v}B</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            China FDI inflows have collapsed from <span className="text-amber-300 font-mono">$290B (2022)</span> to <span className="text-rose-300 font-mono">$110B</span> — foreign investors are pulling out faster than new ones arrive.
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-neutral-500 mb-3">
            <span>remittance receipts · $B</span>
            <span className="font-mono normal-case tracking-normal text-neutral-400">2024</span>
          </div>
          <div className="space-y-1">
            {REMITTANCES.map((r) => {
              const isH = remHover && remHover.c === r.c;
              return (
                <div key={r.c}
                     onMouseEnter={(e) => setRemHover({ ...r, mx: e.clientX, my: e.clientY })}
                     onMouseMove={(e) => setRemHover({ ...r, mx: e.clientX, my: e.clientY })}
                     onMouseLeave={() => setRemHover(null)}
                     className={`grid grid-cols-[1fr_3fr_50px] items-center gap-2 text-xs px-2 py-0.5 rounded transition-colors ${isH ? 'bg-white/[0.04]' : ''}`}>
                  <span className="flex items-center gap-1.5"><Flag code={r.c} /> {r.name}</span>
                  <div className="h-3 bg-white/[0.03] rounded">
                    <div className="h-full rounded" style={{ width: `${(r.v / 130) * 100}%`, background: '#fb7185', opacity: isH ? 1 : 0.85 }} />
                  </div>
                  <span className="text-right font-mono text-rose-300">${r.v}B</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Total global remittances ≈ <span className="text-rose-300 font-mono">$830B/yr</span> — bigger than all FDI to developing economies and ~3× development aid.
          </div>
        </div>
        <FloatingTip hover={fdiHover} render={(h) => (
          <div>
            <div className="font-semibold" style={{ color: colorOf(h.c) }}>{h.name}</div>
            <div className="mt-0.5 font-mono text-neutral-200">${h.v}B FDI inflow (2024)</div>
            <div className="mt-0.5 text-[10px] text-neutral-500">~{(h.v / 1300 * 100).toFixed(1)}% of global FDI</div>
          </div>
        )} />
        <FloatingTip hover={remHover} render={(h) => (
          <div>
            <div className="font-semibold" style={{ color: colorOf(h.c) }}>{h.name}</div>
            <div className="mt-0.5 font-mono text-rose-300">${h.v}B inbound remittances</div>
            <div className="mt-0.5 text-[10px] text-neutral-500">~{(h.v / 830 * 100).toFixed(1)}% of global remittances</div>
          </div>
        )} />
      </div>

      <p className="text-sm text-neutral-400">
        Capital flows are the part of globalization that didn't reverse after 2008 or 2020. Goods trade has flatlined as a share of GDP since 2008; <em>cross-border financial claims have kept growing</em>. The world is more financially integrated than ever — which is also why a US rate hike, or a Treasury sell-off, or a Japanese carry-trade unwind, transmits to every market within hours.
      </p>

      <Deeper>
        <p>
          The US NIIP of <Eq>{`-\\,\\$24T`}</Eq> sounds catastrophic but the sustainability story has two saving graces. First, the US borrows in dollars and lends in foreign currency, so a weaker dollar <em>improves</em> its NIIP (the assets get more valuable when translated back). Second, US investors abroad earn higher returns than foreigners earn in the US — the so-called "exorbitant privilege." Net investment income has stayed roughly zero or positive for decades despite the giant negative position.
        </p>
        <p>
          The reverse story for the surplus economies (Japan, Germany, China): they have accumulated huge foreign assets but their <em>returns on those assets</em> are mediocre. Japan's GPIF and BOJ hold trillions in foreign bonds; Germany's surpluses funded TARGET2 imbalances and EU periphery crises; China's reserves funded US Treasuries earning ~4% while their own banking system charges 4.5–5%. Surplus countries get the goods deficit; they don't always get good returns.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   07 — THE DRIVERS (six concurrent forces)
   ============================================================================ */

const Drivers = () => {
  const aiCapex = [
    { c:'us', v: 320, label:'US' },
    { c:'cn', v:  80, label:'China' },
    { c:'eu', v:  35, label:'EU' },
    { c:'gb', v:  18, label:'UK' },
    { c:'jp', v:  10, label:'Japan' },
    { c:'kr', v:   8, label:'Korea' },
  ];
  const renewables = [
    { c:'no', v: 99, label:'Norway' },
    { c:'br', v: 89, label:'Brazil' },
    { c:'ca', v: 68, label:'Canada' },
    { c:'de', v: 52, label:'Germany' },
    { c:'gb', v: 43, label:'UK' },
    { c:'cn', v: 32, label:'China' },
    { c:'us', v: 23, label:'US' },
    { c:'in', v: 22, label:'India' },
    { c:'jp', v: 22, label:'Japan' },
  ];
  const evShare = [
    { c:'no', v: 90 },
    { c:'cn', v: 35 },
    { c:'de', v: 22 },
    { c:'gb', v: 19 },
    { c:'fr', v: 18 },
    { c:'us', v: 10 },
    { c:'in', v:  7 },
    { c:'jp', v:  3 },
  ];
  const defense = [
    { c:'ru', v: 7.0 },
    { c:'il', v: 6.5 },
    { c:'sa', v: 6.2 },
    { c:'pl', v: 4.2 },
    { c:'us', v: 3.4 },
    { c:'gb', v: 2.3 },
    { c:'de', v: 2.1 },
    { c:'fr', v: 2.1 },
    { c:'jp', v: 1.9 },
    { c:'cn', v: 1.7 },
  ];
  const debt = [
    { c:'jp', v: 250 },
    { c:'it', v: 137 },
    { c:'us', v: 123 },
    { c:'fr', v: 110 },
    { c:'gb', v: 100 },
    { c:'cn', v:  88 },
    { c:'in', v:  82 },
    { c:'br', v:  77 },
    { c:'de', v:  63 },
    { c:'kr', v:  56 },
    { c:'ru', v:  20 },
  ];
  const median = [
    { c:'jp', v:49, label:'Japan' },
    { c:'de', v:47, label:'Germany' },
    { c:'it', v:47, label:'Italy' },
    { c:'kr', v:45, label:'Korea' },
    { c:'cn', v:39, label:'China' },
    { c:'us', v:39, label:'US' },
    { c:'br', v:33, label:'Brazil' },
    { c:'in', v:28, label:'India' },
    { c:'ph', v:25, label:'Philippines' },
    { c:'ng', v:19, label:'Nigeria' },
  ];

  const TileBars = ({ rows, max, unit, color = '#fbbf24' }) => (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.c} className="grid grid-cols-[80px_1fr_50px] items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 truncate"><Flag code={r.c} /> <span className="truncate">{r.label || r.c.toUpperCase()}</span></span>
          <div className="h-2.5 bg-white/[0.03] rounded">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(r.v / max) * 100}%` }} transition={{ duration: 0.7, delay: 0.05 }} className="h-full rounded" style={{ background: color, opacity: 0.85 }} />
          </div>
          <span className="text-right font-mono" style={{ color }}>{r.v}{unit}</span>
        </div>
      ))}
    </div>
  );

  const Tile = ({ icon: Icon, title, color, sub, children }) => (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>{title}</span>
      </div>
      {sub && <div className="text-[11px] text-neutral-400 mb-3">{sub}</div>}
      {children}
    </div>
  );

  return (
    <Card
      id="drivers"
      index={8}
      icon={Zap}
      title="The Drivers — Six Forces Operating Right Now"
      subtitle="What's actually moving the world economy in 2025–26. Each tile is the same chart in a different domain."
      accent="orange"
      source="company filings · IEA · SIPRI · IMF · UN"
    >
      <p>
        The structural map (output, production, consumption, wealth, flows) tells you the playing field. But the score is being driven right now by a small number of concurrent forces. Below: six of them, each as a multi-country comparison.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <Tile icon={Cpu} title="AI capex 2025" color="#7dd3fc" sub="hyperscaler + government spending on data centers, GPUs, energy infrastructure">
          <TileBars rows={aiCapex} max={350} unit="B" color="#7dd3fc" />
          <div className="mt-2 text-[10px] text-neutral-500">Microsoft, Google, Meta, Amazon alone ≈ $320B. ~1% of US GDP.</div>
        </Tile>

        <Tile icon={Sun} title="Electricity from renewables · 2024" color="#34d399" sub="% of grid generation; large hydro counts">
          <TileBars rows={renewables} max={100} unit="%" color="#34d399" />
          <div className="mt-2 text-[10px] text-neutral-500">Adding ~500 GW of solar in 2024 alone — China 2/3 of installations.</div>
        </Tile>

        <Tile icon={Car} title="EV market share · 2024" color="#fb923c" sub="% of new passenger-car sales (BEV + PHEV)">
          <TileBars rows={evShare} max={100} unit="%" color="#fb923c" />
          <div className="mt-2 text-[10px] text-neutral-500">Norway is fully electrified. China ~35%, US still ~10%. Massive divergence.</div>
        </Tile>

        <Tile icon={Briefcase} title="Defense spending · % GDP" color="#fb7185" sub="2024 SIPRI figures; Russia & Israel inflated by active conflict">
          <TileBars rows={defense} max={8} unit="%" color="#fb7185" />
          <div className="mt-2 text-[10px] text-neutral-500">European NATO members all hiking. Japan committed to 2% by 2027. Era of "peace dividend" is over.</div>
        </Tile>

        <Tile icon={Users} title="Median age · 2024" color="#c4b5fd" sub="demographic trajectory locked in for the next 30 years">
          <TileBars rows={median} max={50} unit="" color="#c4b5fd" />
          <div className="mt-2 text-[10px] text-neutral-500">Japan + Korea + S. Europe aging fastest; India + Africa still very young. China crossed median 39 in 2024.</div>
        </Tile>

        <Tile icon={AlertTriangle} title="Government debt · % GDP" color="#fcd34d" sub="general government gross debt (IMF), 2024">
          <TileBars rows={debt} max={250} unit="%" color="#fcd34d" />
          <div className="mt-2 text-[10px] text-neutral-500">G7 average ≈ 125%. Almost all DM governments are now running large deficits at full employment — a first.</div>
        </Tile>
      </div>

      <p className="text-sm text-neutral-400">
        Read the six together and a single picture forms: <strong>the developed world is rearming, aging, and borrowing</strong>; <strong>the emerging world (especially India, ASEAN, Africa) is youthful but capital-poor</strong>; <strong>energy is bifurcating between Western grids that are decarbonizing slowly and Chinese manufacturing scaling renewables faster than anyone</strong>; and <strong>AI capex is a uniquely American (with Chinese second) phenomenon at a scale that overwhelms most other line items</strong>. These aren't competing trends — they're happening simultaneously and they interact (AI capex drives electricity demand drives the energy transition; aging drives defense spending; debt limits government response to all of the above).
      </p>

      <Deeper>
        <p>
          The single most under-priced driver in this list is probably <strong>working-age population trajectory</strong>. Between 2020 and 2050, China loses ~23% of its working-age population, Japan ~28%, Germany ~10%, Korea ~30%. India gains ~18%, Indonesia ~12%, sub-Saharan Africa more than doubles. Long-run GDP growth is ≈ productivity growth + working-age growth, so demographics alone imply that India will pass China in GDP somewhere in the late 2050s and Africa will be a serious aggregate economic power by 2060.
        </p>
        <p>
          The most over-priced driver in the headlines (relative to actual numbers) is probably "decoupling." US-China two-way trade is still <span className="text-amber-300 font-mono">$580B</span>; cross-border investment flows are still huge (CN→US in Treasuries; US→CN in equities, even after delistings). What's actually happening is more like rerouting through Mexico, Vietnam, and India than a clean break.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   08 — WHERE THIS IS GOING
   ============================================================================ */

// Population, millions. UN World Population Prospects 2024 medium variant.
const POP = [
  { c:'in', name:'India',      pts:[1417,1450,1530,1620,1670,1690] },
  { c:'cn', name:'China',      pts:[1426,1410,1370,1310,1230,1160] },
  { c:'us', name:'US',         pts:[ 335, 345, 355, 370, 380, 390] },
  { c:'id', name:'Indonesia',  pts:[ 278, 285, 305, 320, 320, 320] },
  { c:'pk', name:'Pakistan',   pts:[ 240, 250, 290, 340, 380, 410] },
  { c:'ng', name:'Nigeria',    pts:[ 224, 230, 280, 330, 380, 430] },
  { c:'br', name:'Brazil',     pts:[ 215, 215, 220, 225, 220, 215] },
  { c:'jp', name:'Japan',      pts:[ 124, 124, 117, 110, 105,  98] },
];
const POP_YEARS = [2023, 2025, 2035, 2045, 2050, 2060];

// PPP GDP shares 2025 → 2050 (Goldman Sachs / PwC consensus)
const GDP_SHARE = [
  { c:'cn', name:'China',     pts:[19, 19, 21, 22, 21, 20] },
  { c:'us', name:'US',        pts:[15, 15, 14, 13, 12, 12] },
  { c:'in', name:'India',     pts:[ 8,  9, 11, 13, 14, 15] },
  { c:'eu', name:'EU',        pts:[14, 13, 12, 11, 10,  9] },
  { c:'jp', name:'Japan',     pts:[ 4,  4,  3,  3,  3,  3] },
  { c:'id', name:'Indonesia', pts:[ 2.4,2.6,3.3,3.8,4.2,4.5] },
  { c:'br', name:'Brazil',    pts:[ 2.5,2.5,2.6,2.7,2.7,2.6] },
];

// Energy mix as % of world primary, 2025 vs 2050 IEA STEPS vs IEA NZE
const ENERGY = {
  '2025':       { Oil:32, Coal:26, Gas:24, Hydro:6, Nuclear:4, Renewables:8 },
  '2050 STEPS': { Oil:27, Coal:17, Gas:22, Hydro:7, Nuclear:5, Renewables:22 },
  '2050 NZE':   { Oil:14, Coal: 4, Gas:10, Hydro:8, Nuclear:9, Renewables:55 },
};
const ENERGY_COLORS = {
  Oil:'#a3a3a3', Coal:'#525252', Gas:'#fbbf24', Hydro:'#22d3ee', Nuclear:'#c4b5fd', Renewables:'#34d399',
};

// Fragility: external debt / FX reserves
const FRAGILITY = [
  { c:'ar', name:'Argentina',   x: 5.5, y: 9, gdp: 0.6 },
  { c:'tr', name:'Turkey',      x: 4.2, y: 6, gdp: 1.3 },
  { c:'eg', name:'Egypt',       x: 3.5, y: 4, gdp: 0.4 },
  { c:'pk', name:'Pakistan',    x: 4.8, y: 3, gdp: 0.4 },
  { c:'za', name:'S. Africa',   x: 2.0, y: 3, gdp: 0.4 },
  { c:'ng', name:'Nigeria',     x: 2.3, y: 4, gdp: 0.5 },
  { c:'br', name:'Brazil',      x: 1.0, y: 2, gdp: 2.2 },
  { c:'in', name:'India',       x: 0.6, y: 1, gdp: 4.0 },
  { c:'mx', name:'Mexico',      x: 0.9, y: 1.5, gdp: 2.0 },
  { c:'cn', name:'China',       x: 0.4, y: 0.5, gdp: 18.5 },
  { c:'kr', name:'Korea',       x: 0.3, y: 1, gdp: 1.9 },
];

const Future = () => {
  const [view, setView] = useState('pop');
  const [fragHover, setFragHover] = useState(null);

  // chart helpers
  const W = 600, H = 220, pad = { l: 38, r: 56, t: 8, b: 22 };
  const xs = (i, n) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const ys = (v, max) => pad.t + ((max - v) / max) * (H - pad.t - pad.b);

  const renderLines = (data, years, max, formatY = (v) => v) => (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={pad.l} y1={ys(g * max, max)} x2={W - pad.r} y2={ys(g * max, max)} stroke="#ffffff10" />
          <text x={pad.l - 6} y={ys(g * max, max) + 3} fontSize="9" textAnchor="end" fill="#737373" fontFamily="ui-monospace">{formatY(g * max)}</text>
        </g>
      ))}
      {years.map((y, i) => (
        <text key={y} x={xs(i, years.length)} y={H - 6} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">{y}</text>
      ))}
      {(() => {
        // Stagger endpoint labels so they don't stack — bidirectional relaxation keeps them
        // close to their true y while enforcing a minimum gap, clamped to chart bounds.
        const minGap = 10;
        const yMin = pad.t + 4;
        const yMax = H - pad.b - 4;
        const entries = data.map((d) => ({ d, endY: ys(d.pts[d.pts.length - 1], max) }));
        const sorted = [...entries].sort((a, b) => a.endY - b.endY);
        const ys2 = sorted.map((e) => e.endY);
        for (let i = 1; i < ys2.length; i++) ys2[i] = Math.max(ys2[i], ys2[i - 1] + minGap);
        for (let i = ys2.length - 2; i >= 0; i--) ys2[i] = Math.min(ys2[i], ys2[i + 1] - minGap);
        for (let i = 0; i < ys2.length; i++) ys2[i] = Math.max(yMin, Math.min(yMax, ys2[i]));
        // Re-relax after clamp in case clamping re-introduces overlap
        for (let i = 1; i < ys2.length; i++) ys2[i] = Math.max(ys2[i], ys2[i - 1] + minGap);
        for (let i = ys2.length - 2; i >= 0; i--) ys2[i] = Math.min(ys2[i], ys2[i + 1] - minGap);
        const labelY = {};
        sorted.forEach((e, i) => { labelY[e.d.c] = ys2[i]; });
        return data.map((d) => {
          const c = colorOf(d.c === 'eu' ? 'EU' : d.c);
          const endX = xs(d.pts.length - 1, d.pts.length);
          const endY = ys(d.pts[d.pts.length - 1], max);
          const ly = labelY[d.c];
          return (
            <g key={d.c}>
              <path
                d={d.pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i, d.pts.length)} ${ys(v, max)}`).join(' ')}
                fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"
              />
              {d.pts.map((v, i) => (
                <circle key={i} cx={xs(i, d.pts.length)} cy={ys(v, max)} r="2" fill={c} />
              ))}
              {Math.abs(ly - endY) > 0.5 && (
                <line x1={endX} y1={endY} x2={W - pad.r + 2} y2={ly} stroke={c} strokeOpacity="0.4" strokeWidth="0.6" />
              )}
              <text x={W - pad.r + 4} y={ly + 3} fontSize="9" fill={c} fontFamily="ui-monospace">
                {d.name}
              </text>
            </g>
          );
        });
      })()}
    </svg>
  );

  return (
    <Card
      id="future"
      index={9}
      icon={Activity}
      title="Where This Is Going — 2025 → 2050"
      subtitle="Three projections (UN, Goldman/PwC, IEA) and one fragility map. Demographics is the most certain; energy mix the most contested."
      accent="violet"
      source="UN WPP · Goldman 2050 · IEA WEO 2024"
    >
      <p>
        Most of the future is already in the data. UN demographic projections are remarkably accurate ~25 years out (the people who'll be working in 2050 are already born). GDP-share projections compound demographic + productivity assumptions and are noisier. Energy mix is the most contested — depending on policy ambition, 2050 looks very different.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            ['pop',    'Population (M)',     Users],
            ['gdp',    'PPP GDP share (%)',  Globe2],
            ['energy', 'Energy mix (%)',     Flame],
          ].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setView(k)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${view === k ? 'bg-violet-500/15 border-violet-400/30 text-violet-100' : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
        {view === 'pop' && renderLines(POP, POP_YEARS, 1800, (v) => `${(v / 1000).toFixed(1)}B`)}
        {view === 'gdp' && renderLines(GDP_SHARE, [2025, 2030, 2035, 2040, 2045, 2050], 25, (v) => `${v.toFixed(0)}%`)}
        {view === 'energy' && (
          <div className="space-y-3 mt-2">
            {Object.entries(ENERGY).map(([scen, mix]) => (
              <div key={scen}>
                <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1 font-mono">{scen}</div>
                <div className="flex h-6 rounded overflow-hidden border border-white/5">
                  {Object.entries(mix).map(([k, v]) => (
                    <div key={k} title={`${k}: ${v}%`} style={{ width: `${v}%`, background: ENERGY_COLORS[k], opacity: 0.9 }}
                         className="flex items-center justify-center text-[9px] font-mono text-neutral-900 font-semibold">
                      {v >= 8 ? `${k} ${v}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-[11px] text-neutral-500 mt-2">
              <span className="text-emerald-300">STEPS</span> = current policy momentum. <span className="text-emerald-300">NZE</span> = the path consistent with 1.5°C. The gap between them is the policy choice the world is making this decade.
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-neutral-400">
        The trajectories tell three intersecting stories. <strong>Population:</strong> India ascends, China collapses (already passed peak), Africa explodes. <strong>GDP share:</strong> the China + EU decline and the India + Indonesia + ASEAN ascent are the dominant trends; the US holds remarkably steady. <strong>Energy:</strong> by 2050, renewables will be either the largest source (NZE) or roughly tied with oil (STEPS). The realistic range across scenarios is narrower than headlines suggest because investment lead times are long and grid build-out is the binding constraint.
      </p>

      {/* Fragility scatter */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-5 relative">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">EM fragility map · external debt vs reserves vs CA deficit</div>
        <svg viewBox="0 0 600 320" className="w-full h-auto" onMouseLeave={() => setFragHover(null)}>
          {/* danger-zone shading */}
          <rect x={50 + 3 * 88} y={20} width={600 - (50 + 3 * 88) - 20} height={5 * 28} fill="#fb718510" />
          <line x1="50" y1="280" x2="580" y2="280" stroke="#ffffff20" />
          <line x1="50" y1="20" x2="50" y2="280" stroke="#ffffff20" />
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <g key={`x-${g}`}>
              <line x1={50 + g * 88} y1="278" x2={50 + g * 88} y2="282" stroke="#ffffff20" />
              <text x={50 + g * 88} y="298" fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">{g}×</text>
            </g>
          ))}
          {[2, 4, 6, 8].map((g) => (
            <g key={`y-${g}`}>
              <line x1="48" y1={280 - g * 28} x2="52" y2={280 - g * 28} stroke="#ffffff20" />
              <text x="42" y={283 - g * 28} fontSize="9" textAnchor="end" fill="#737373" fontFamily="ui-monospace">{g}%</text>
            </g>
          ))}
          <text x="320" y="316" fontSize="10" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace">external debt / FX reserves →</text>
          <text x="14" y="150" fontSize="10" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace" transform="rotate(-90 14 150)">current-account deficit (% GDP) →</text>
          <text x={50 + 3 * 88 + 6} y={32} fontSize="9" fill="#fb7185" fontFamily="ui-monospace" style={{letterSpacing:'0.1em'}}>DANGER ZONE</text>
          {FRAGILITY.map((f) => {
            const cx = 50 + f.x * 88, cy = 280 - f.y * 28, r = Math.max(5, Math.sqrt(f.gdp) * 8);
            const c = colorOf(f.c);
            const danger = f.x > 3 || f.y > 5;
            const isH = fragHover && fragHover.c === f.c;
            return (
              <g key={f.c}
                 onMouseEnter={(e) => setFragHover({ ...f, color: c, danger, mx: e.clientX, my: e.clientY })}
                 onMouseMove={(e) => setFragHover({ ...f, color: c, danger, mx: e.clientX, my: e.clientY })}
                 style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r={r}
                        fill={c} fillOpacity={isH ? 0.5 : 0.25}
                        stroke={c} strokeWidth={isH ? 2.2 : 1.4} />
                <text x={cx} y={cy + r + 11} fontSize="10" textAnchor="middle" fill={danger ? '#fb7185' : '#e5e5e5'} fontFamily="ui-monospace">{f.name}</text>
              </g>
            );
          })}
        </svg>
        <FloatingTip hover={fragHover} render={(h) => (
          <div>
            <div className="font-semibold" style={{ color: h.color }}>{h.name}</div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <span className="text-neutral-500">debt / reserves</span>
              <span className={`text-right font-mono ${h.x > 3 ? 'text-rose-300' : 'text-emerald-300'}`}>{h.x.toFixed(1)}×</span>
              <span className="text-neutral-500">CA deficit</span>
              <span className={`text-right font-mono ${h.y > 5 ? 'text-rose-300' : 'text-emerald-300'}`}>{h.y.toFixed(1)}%</span>
              <span className="text-neutral-500">GDP</span>
              <span className="text-right font-mono text-neutral-200">${h.gdp}T</span>
            </div>
            {h.danger && <div className="mt-1 text-[10px] text-rose-300">⚠ likely needs IMF support if liquidity tightens</div>}
          </div>
        )} />
        <div className="mt-2 text-[11px] text-neutral-500">
          x-axis: external debt / reserves (the IMF's main solvency gauge — &gt;3× is danger). y-axis: current-account deficit. Bubble = GDP. Top-right corner = countries most likely to need IMF support if global liquidity tightens (<span className="text-rose-300">Argentina, Pakistan, Turkey, Egypt</span>). Bottom-left = financially robust (<span className="text-emerald-300">China, India, Korea</span>).
        </div>
      </div>

      <Deeper>
        <p>
          The single most likely "surprise" of the next 25 years is <strong>not</strong> in this chart and is genuinely uncertain: AI productivity. If AI delivers even 1 percentage point of additional total-factor productivity growth (the high end of credible estimates) compounded for 25 years, the GDP-share projections above are wrong by a wide margin in favor of whoever captures the AI surplus — currently the US. If it delivers nothing measurable (the bear case, given how generic-purpose technologies historically take 20+ years to show up in productivity statistics), the trajectories above are roughly right.
        </p>
        <p>
          The second-most-likely surprise is climate-related disruption to the trajectories themselves: a major Indian heat-wave year cutting wheat output, a Middle East oil-supply event, a major flood disruption to Asian manufacturing. None of these show up cleanly in trend projections but they reshape the year-to-year path.
        </p>
        <p>
          The third: <strong>conflict</strong>. The drivers card shows defense spending rising; the trade card shows chokepoints stressed; the wealth card shows huge cross-border claims that depend on stable property rights. None of those is an extrapolation; they're current state. Where this is going, in plain terms, depends on whether the post-1945 institutional scaffolding holds — and whether the dollar system, alliance system, and trade system can be repaired without breaking first.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   FOOTER
   ============================================================================ */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>data sources:</span>
        <span className="text-sky-300">IMF WEO + DOTS</span>
        <span className="text-violet-300">World Bank WDI</span>
        <span className="text-emerald-300">UN WPP 2024</span>
        <span className="text-amber-300">IEA WEO 2024</span>
        <span className="text-fuchsia-300">UNCTAD</span>
        <span className="text-rose-300">UBS GWR · SWFI</span>
        <span>USGS · BIS · SIPRI · USDA · WSA · BloombergNEF</span>
      </div>
      <p className="max-w-xl mx-auto">
        Numbers reflect the latest available data through Q1 2026; some 2025 / 2026 figures are early estimates and will be revised. Projections to 2050 represent consensus medium-variant assumptions and are subject to wide uncertainty.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL LAYOUT
   ============================================================================ */

export default function WorldEconomyExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <OutputMap />
        <ProductionAtlas />
        <SizeMap />
        <ConsumptionAtlas />
        <WealthAtlas />
        <TradeFlows />
        <CapitalFlows />
        <Drivers />
        <Future />
      </main>

      <Footer />
    </div>
  );
}
