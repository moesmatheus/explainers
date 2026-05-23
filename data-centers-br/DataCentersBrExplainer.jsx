import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, BarChart3, Building2, Cable, ChevronDown, Cloud, Compass,
  Cpu, Database, DollarSign, Eye, EyeOff, FileText, Flag, GitBranch,
  Globe, HelpCircle, Layers, Lightbulb, Link2, MapPin, Network,
  Quote, Server, Shield, Sparkles, Star, Target, TrendingUp, Users,
  Zap, AlertTriangle, CheckCircle2, XCircle, Building, Briefcase,
  PieChart, Banknote, BookOpen, Map, Plug, ExternalLink, Crown,
} from 'lucide-react';

/* ============================================================================
   Mapa Competitivo — Data Centers Carrier-Neutral no Brasil
   Single-file React component. Dark mode. Tailwind + lucide-react +
   framer-motion. Stage-A scaffolding: primitives + Hero + nav + stubs.
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
            {anchor && <span className="text-fuchsia-300 inline-flex items-center gap-1"><Star className="w-3 h-3 fill-fuchsia-300" /> âncora</span>}
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
      <BookOpen className="w-3.5 h-3.5 text-violet-300" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">aprofundar</span>
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
  orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  neutral: 'bg-white/[0.04] text-neutral-300 border-white/10',
};
const Chip = ({ children, color = 'sky' }) => (
  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${chipPalette[color]}`}>{children}</span>
);

// --- Floating tooltip -------------------------------------------------------

const FloatingTip = ({ hover, render, width = 320 }) => {
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

// --- Glossário PT-BR -------------------------------------------------------

const GLOSS = {
  'carrier-neutral': 'Modelo de DC em que o operador não é uma operadora de telecom — diferentes carriers podem entrar e o cliente escolhe quem o conecta. Oposto: DC de telco (Embratel/Vivo) onde a conectividade vem amarrada.',
  'colocation': 'Aluguel de espaço (rack/m²/MW) dentro do DC do operador, com energia, refrigeração e segurança incluídos. O cliente coloca seus próprios servidores. Modelo dominante no Brasil.',
  'hyperscale': 'Operadores cloud globais que consomem dezenas a centenas de MW por região (AWS, Azure, GCP, Oracle, Meta, TikTok). Contratos build-to-suit de 10–15 anos com data halls dedicados.',
  'wholesale': 'Venda de capacidade em blocos grandes (1 MW+ por contrato), tipicamente para hyperscalers. Ticket alto, cliente único por data hall, contratos longos. Oposto: retail.',
  'retail colocation': 'Venda em blocos pequenos (½U a alguns racks) para muitos clientes enterprise. Ticket menor, mas margem por kW maior. Modelo da Equinix.',
  'cloud onramp': 'Conexão privada e dedicada do DC ao backbone de um cloud provider (AWS Direct Connect, Azure ExpressRoute, GCP Partner Interconnect, Oracle FastConnect). Faz o DC virar extensão do cloud.',
  'cross-connect': 'Cabo físico (cobre ou fibra) entre dois clientes dentro do mesmo DC. A receita-âncora da Equinix; cada cross-connect rende ~US$ 300–400/mês recorrente.',
  'IXP.br': 'Internet Exchange Point — onde redes trocam tráfego sem pagar trânsito. O IXP.br SP (no campus PTT-SP em Tamboré) é um dos 3 maiores do mundo em volume.',
  'PUE': 'Power Usage Effectiveness — energia total ÷ energia de TI. 1,0 é o ideal (100% para TI); BR médio fica em 1,5–1,6, novos campuses chegam a 1,3.',
  'liquid cooling': 'Refrigeração líquida direta-ao-chip, exigida por racks acima de ~30 kW (densidade típica de GPUs de IA). Substitui ou complementa CRAC tradicional baseado em ar.',
  'rack density': 'Potência elétrica por rack (kW). Enterprise tradicional: 5–10 kW. Cloud genérico: 10–20 kW. AI-ready: 30–100+ kW. Define se o DC roda IA ou não.',
  'data hall': 'Sala dentro de um campus de DC dedicada a um cliente ou tier de capacidade. Tipicamente 1–10 MW por sala. Pode ser fechada (cage) ou private suite.',
  'campus': 'Conjunto de prédios de DC no mesmo terreno, compartilhando subestação de energia, fibra e segurança. Exemplos BR: Tamboré (Scala), Vinhedo (Ascenty).',
  'subestação': 'Instalação elétrica que converte alta-tensão (transmissão, 138 kV+) em média-tensão para o DC. Subestação dedicada = energia garantida e independente da rede local; vira gargalo competitivo.',
  'I-REC': 'International Renewable Energy Certificate — certificado que prova que cada MWh foi gerado por fonte renovável. Obrigatório para o cliente declarar "100% renovável" globalmente.',
  'PPA': 'Power Purchase Agreement — contrato de longo prazo (10–20 anos) direto com gerador de energia (eólica, solar). Trava preço e fonte renovável, exigência de hyperscalers.',
  'REIDI': 'Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura — federal, suspende PIS/Cofins na compra de bens de infra durante a obra. Aplicável a parte de DCs.',
  'REDATA': 'Regime Especial de Tributação para Serviços de Datacenter — MP 1318/2025 → PL 278/26 (aprovado fev/2026). Suspende PIS/Cofins/IPI/II por 5 anos em equipamentos. Exige 100% renovável + 10% capacidade ao mercado doméstico + 2% em P&D.',
  'AUM': 'Assets Under Management — patrimônio gerenciado por uma gestora de fundos. Indicador de musculatura financeira ao avaliar um controlador (DigitalBridge ~US$ 90B, Stonepeak ~US$ 73B, I Squared ~US$ 38B).',
  'REIT': 'Real Estate Investment Trust — empresa listada que distribui ≥90% do lucro como dividendo e em troca tem regime tributário especial. Equinix (NASDAQ: EQIX) e Digital Realty (NYSE: DLR) são REITs de DC.',
  'build-to-suit': 'Construção sob medida para um cliente específico, com contrato de longo prazo (10–15 anos) já assinado antes da obra. Modelo padrão de hyperscale wholesale.',
  'pipeline': 'Capacidade anunciada ainda não construída/energizada. Diferenciar de "operacional" é crítico — o pipeline LATAM hoje é 3× maior que a base instalada.',
  'GW vs MW': '1 GW = 1.000 MW. 1 MW de IT alimenta ~1.500 racks de 0,7 kW médios (ou ~33 racks de 30 kW de IA). Brasil 2026: 1 GW operacional, +2,6 GW pipeline.',
  'tier III/IV': 'Classificação Uptime Institute por redundância. Tier III: redundância concorrente, 99,982% uptime. Tier IV: tolerante a falhas, 99,995%. Padrão de mercado BR é Tier III.',
  'cage': 'Espaço fisicamente cercado dentro de um data hall — racks do cliente isolados por gaiola metálica + biometria. Para clientes com requisitos de compliance.',
  'meet-me-room (MMR)': 'Sala neutra dentro do DC onde carriers entregam suas fibras e cross-connects são feitos. O coração do "carrier-neutral".',
  'edge data center': 'DC pequeno (poucos MW) próximo do usuário final, em cidades secundárias, para reduzir latência. Casos BR: Mega Lobster (Tecto, Fortaleza), DCs Elea no NE.',
  'cabo submarino': 'Fibra ótica que cruza o Atlântico (BR–EUA, BR–Europa, BR–África). Pontos de aterragem no Brasil: Fortaleza (Pecém, Praia do Futuro) e Praia Grande/SP. Atrai DCs.',
  'SIN': 'Sistema Interligado Nacional — rede elétrica brasileira. ~85% renovável (hidro + eólica + solar), o que torna o DC brasileiro estruturalmente "verde" sem PPAs caros.',
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
    <Target className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
    <div className="text-xs text-sky-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">leve isso</span>
      {children}
    </div>
  </div>
);

const WhenItMatters = ({ children }) => (
  <div className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 flex items-start gap-2">
    <Compass className="w-3.5 h-3.5 mt-[2px] text-amber-300 shrink-0" />
    <div className="text-xs text-amber-100/90 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 mr-2">quando importa</span>
      {children}
    </div>
  </div>
);

const Misconception = ({ wrong, right, because }) => (
  <div className="mt-3 rounded-md border border-rose-400/25 bg-rose-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-1">
      <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-rose-300">mito comum</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-1">
      <div className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><div><strong className="text-rose-200">Muita gente pensa:</strong> {wrong}</div></div>
      <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><div><strong className="text-emerald-200">Na verdade:</strong> {right}</div></div>
      {because && <div className="pl-4 text-neutral-400"><em>Por quê:</em> {because}</div>}
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
          <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300 mb-1">tenta prever</div>
          <div className="text-neutral-200">{question}</div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="ml-2 text-[10px] rounded border border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/20 text-violet-200 px-2 py-1 flex items-center gap-1 shrink-0"
        >
          {open ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {open ? 'esconder' : 'revelar'}
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
      <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">auto-checagem</span>
      <span className="text-[10px] text-neutral-500">· clique para revelar</span>
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
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300">callback · {to}</div>
              <div className="text-neutral-200 leading-snug">{recap}</div>
            </div>
          )}
        />
      )}
    </>
  );
};

const Worked = ({ title = 'Exemplo numérico', children }) => (
  <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">{title}</span>
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
              const isExternal = it.external || (isLink && !it.href.startsWith('#') && !it.href.startsWith('/#'));
              const Tag = isLink ? 'a' : 'div';
              const props = isLink
                ? {
                    href: it.href,
                    onClick: (e) => onClick(e, it.href),
                    target: isExternal ? '_blank' : undefined,
                    rel: isExternal ? 'noopener noreferrer' : undefined,
                  }
                : {};
              return (
                <Tag
                  key={j}
                  {...props}
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
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-600">ver fora</span>}
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
   PLAYERS — central data structure used across most cards
   ========================================================================== */

// Cores por player — uma cor distinta por operador, usada em barras / chips / filtros.
export const PLAYERS = [
  {
    id: 'scala',     name: 'Scala Data Centers', short: 'Scala',
    color: 'fuchsia',
    controller: 'DigitalBridge + CPPIB',
    foco: 'Hyperscale wholesale puro',
    dcs: 10, mw: 270, pipeline: 1500, capex: 'R$ 6,2B SP + R$ 500B potencial RS',
    investidor: 'DigitalBridge (NYSE: DBRG)', aum: 90,
  },
  {
    id: 'ascenty',   name: 'Ascenty', short: 'Ascenty',
    color: 'cyan',
    controller: 'Digital Realty + Brookfield (50/50)',
    foco: 'Híbrido — wholesale + enterprise',
    dcs: 28, mw: 250, pipeline: 250, capex: 'US$ 1B aprovado 2026',
    investidor: 'Digital Realty (DLR) + Brookfield', aum: null,
  },
  {
    id: 'odata',     name: 'ODATA · Aligned', short: 'ODATA',
    color: 'sky',
    controller: 'Aligned (Macquarie Asset Mgmt)',
    foco: 'Hyperscale AI-ready',
    dcs: 5, mw: 110, pipeline: 1300, capex: 'R$ 26B até 2026',
    investidor: 'Macquarie', aum: 600,
  },
  {
    id: 'equinix',   name: 'Equinix Brasil', short: 'Equinix',
    color: 'rose',
    controller: 'NASDAQ: EQIX (REIT) + GIC',
    foco: 'Retail interconnection',
    dcs: 8, mw: 80, pipeline: 250, capex: 'R$ 27B até 2026',
    investidor: 'Public REIT (EQIX)', aum: null,
  },
  {
    id: 'cirion',    name: 'Cirion Technologies', short: 'Cirion',
    color: 'emerald',
    controller: 'Stonepeak',
    foco: 'Network + colocation híbrido',
    dcs: 6, mw: 70, pipeline: 150, capex: 'US$ 350–500M (LATAM)',
    investidor: 'Stonepeak', aum: 73,
  },
  {
    id: 'elea',      name: 'Elea Digital', short: 'Elea',
    color: 'amber',
    controller: 'I Squared (67%) + Piemonte (33%)',
    foco: 'Enterprise + governo',
    dcs: 9, mw: 60, pipeline: 1500, capex: 'R$ 2,5B short / US$ 10B long',
    investidor: 'I Squared Capital', aum: 38,
  },
  {
    id: 'tecto',     name: 'Tecto · V.tal', short: 'Tecto',
    color: 'violet',
    controller: 'BTG + GIC + CPPIB (via V.tal)',
    foco: 'Hyperscale + edge sobre fibra',
    dcs: 0, mw: 0, pipeline: 220, capex: 'US$ 1B inicial',
    investidor: 'BTG / GIC / CPPIB', aum: null,
  },
  {
    id: 'takoda',    name: 'Takoda · Tivit', short: 'Takoda',
    color: 'orange',
    controller: 'Tivit (spin-off 2023)',
    foco: 'Enterprise + governo (legado Tivit)',
    dcs: 4, mw: 40, pipeline: 200, capex: 'R$ 1,2B em 5 anos',
    investidor: 'Tivit / Apax', aum: null,
  },
  {
    id: 'cloudhq',   name: 'CloudHQ', short: 'CloudHQ',
    color: 'neutral',
    controller: 'Berkshire Partners',
    foco: 'Hyperscale carrier-neutral global',
    dcs: 0, mw: 0, pipeline: 400, capex: 'n/d (US$ multi-bi)',
    investidor: 'Berkshire Partners', aum: null,
  },
];

const PLAYER_BY_ID = Object.fromEntries(PLAYERS.map(p => [p.id, p]));

/* ============================================================================
   HERO + SECTION NAV
   ========================================================================== */

// Animated rack-of-servers / heat-map background
const RackBackdrop = () => {
  const cells = useMemo(() => {
    const rows = 9, cols = 18;
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          r, c,
          delay: (r + c) * 0.04,
          opacity: 0.18 + ((r * 17 + c * 7) % 5) * 0.07,
        });
      }
    }
    return out;
  }, []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none" viewBox="0 0 800 360">
      {cells.map((cell, i) => (
        <motion.rect
          key={i}
          x={40 + cell.c * 40}
          y={30 + cell.r * 32}
          width="32"
          height="22"
          rx="2"
          fill={i % 11 === 0 ? '#f0abfc' : i % 7 === 0 ? '#7dd3fc' : '#34d399'}
          fillOpacity={cell.opacity}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: cell.delay, ease: 'easeOut' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-fuchsia-500/5 to-transparent" />
    <RackBackdrop />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/80 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-400/20">
          <Server className="w-3.5 h-3.5" /> mapa competitivo · data centers BR
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
          Quem é quem nos data centers do Brasil
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">9 players carrier-neutral, 9 dimensões. Lido pela ótica de quem opera um DC e precisa entender contra quem joga.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Brasil tem hoje <span className="text-cyan-300">~1 GW</span> de TI instalada e
          <span className="text-fuchsia-300"> +2,6 GW</span> em pipeline. Quase tudo em SP, controlado por
          <span className="text-fuchsia-300"> 6 fundos globais</span>. Este é um mapa para entender capacidade,
          dinheiro, clientes, geografia, estratégia e diferenciais — player por player.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-cyan-300">mercado · frame</span>
          <span className="text-fuchsia-300">★ tabela mestra</span>
          <span className="text-violet-300">capacidade · geografia</span>
          <span className="text-emerald-300">capital · estratégia · clientes</span>
          <span className="text-amber-300">diferenciais · m&a</span>
          <span className="text-fuchsia-300">★ posicionamento</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'mercado',     label: 'Mercado BR',                icon: Globe },
  { id: 'frame',       label: 'Frame · escala × foco',     icon: Layers },
  { id: 'tabela',      label: 'Tabela mestra',             icon: Database, anchor: true },
  { id: 'capacidade',  label: 'Capacidade & pipeline',     icon: Zap },
  { id: 'geografia',   label: 'Geografia',                 icon: MapPin },
  { id: 'capital',     label: 'Investidores & capital',    icon: Banknote },
  { id: 'financeiro',  label: 'Financeiro · receita & dívida', icon: DollarSign },
  { id: 'estrategia',  label: 'Estratégia comercial',      icon: Briefcase },
  { id: 'clientes',    label: 'Clientes-âncora',           icon: Users },
  { id: 'diferenciais',label: 'Diferenciais',              icon: Sparkles },
  { id: 'mna',         label: 'M&A & projetos',            icon: GitBranch },
  { id: 'posicionamento', label: 'Posicionamento',         icon: Target,    anchor: true },
  { id: 'fontes',      label: 'Fontes & documentos',       icon: FileText },
  { id: 'trails',      label: 'Próximas trilhas',          icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-100' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-100' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>
                <span>{s.label}</span>
                {s.anchor && ' ★'}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   STUB CARDS — placeholders during scaffolding stage. Replaced by real cards
   in stages C–I. The id attribute stays stable so SectionNav still anchors.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(corpo do card chega em estágio posterior)">
    <div className="text-xs text-neutral-500 italic">scaffolded · conteúdo pendente</div>
  </Card>
);

/* ============================================================================
   01 — MERCADO BR · números agregados
   ========================================================================== */

const MERCADO_REGIOES = [
  { name: 'São Paulo (Tamboré, Vinhedo, Hortolândia, Cotia, Osasco, Barueri, Paulínia)', share: 0.62, color: 'fuchsia' },
  { name: 'Rio de Janeiro (Lapa, Barra, S. João de Meriti)',                              share: 0.18, color: 'violet' },
  { name: 'Sul (Curitiba, Porto Alegre, Eldorado do Sul/RS futuro)',                       share: 0.10, color: 'emerald' },
  { name: 'Centro-Oeste (Brasília — governo)',                                             share: 0.06, color: 'amber' },
  { name: 'Nordeste (Fortaleza/Pecém, Salvador)',                                          share: 0.04, color: 'cyan' },
];

const HYPERSCALERS_BR = [
  { who: 'AWS',        ano: 2011, region: 'sa-east-1 SP · 3 AZs', plus: 'US$ 3,8B (2011–23) + US$ 1,8B até 2034' },
  { who: 'Microsoft Azure', ano: 2014, region: 'Brazil South Campinas · 3 AZs', plus: 'novos campuses em Hortolândia + Sumaré' },
  { who: 'Google Cloud',ano: 2017, region: 'southamerica-east1 SP', plus: 'âncora histórica em Vinhedo (Ascenty)' },
  { who: 'Oracle Cloud',ano: 2018, region: 'OCI sa-saopaulo-1', plus: 'região âncora em Vinhedo' },
  { who: 'TikTok',     ano: 2026, region: 'Pecém/CE — 1º DC LATAM', plus: 'maior em capacidade contratada do BR' },
];

const MercadoCard = () => (
  <Card id="mercado" icon={Globe} title="Mercado BR · onde o leitor está pisando" accent="cyan" index={1}
        subtitle="O Brasil concentra 83% da capacidade LATAM, ~1 GW operacional, +2,6 GW em pipeline. Quase tudo em SP. Energia ~85% renovável e regime tributário (REDATA) recém-aprovado.">
    <MinSchema>
      <strong>Brasil 2026 ≈ 1 GW de TI operacional</strong>, USD 3,38B de receita, +2,6 GW em pipeline anunciado.
      <strong> 80% da capacidade está em SP+RJ.</strong> O setor cresceu <strong>+600%</strong> em DCs nos últimos 10 anos.
    </MinSchema>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Stat label="Capacidade IT 2026" value="~1 GW" sub="USD 3,38B receita" color="text-cyan-200" />
      <Stat label="Pipeline anunciado" value="+2,6 GW" sub="3,2× a base atual" color="text-fuchsia-200" />
      <Stat label="Brasil / LATAM" value="83%" sub="hub do continente" color="text-emerald-200" />
      <Stat label="CAGR 2025–31" value="14,6%" sub="USD → 6,67B em 2031" color="text-amber-200" />
    </div>

    {/* concentração geográfica */}
    <div className="mt-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">concentração geográfica · % capacidade</span>
        <span className="text-[10px] text-neutral-500">SP domina por IXP.br + fibra + SIN limpo</span>
      </div>
      <div className="space-y-1.5">
        {MERCADO_REGIOES.map(r => (
          <div key={r.name} className="flex items-center gap-2 text-xs">
            <div className="w-44 text-neutral-300 truncate" title={r.name}>{r.name.split(' (')[0]}</div>
            <div className="flex-1 h-3 rounded bg-white/[0.04] border border-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${r.share * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`h-full ${chipPalette[r.color].split(' ')[0]} border-r ${chipPalette[r.color].split(' ')[2]}`}
              />
            </div>
            <div className="w-12 text-right font-mono text-neutral-300">{Math.round(r.share * 100)}%</div>
          </div>
        ))}
      </div>
    </div>

    <Predict question="Qual % do mercado está em São Paulo? E qual cidade vem em segundo lugar?">
      Aprox. <strong className="text-fuchsia-300">62% em SP</strong> — Tamboré (Barueri) sozinho concentra mais do que muitos países LATAM inteiros.
      A segunda cidade é o <strong className="text-violet-300">Rio</strong> (~18%), com clusters na Lapa (carrier hotel) e Barra. Sul + Centro-Oeste +
      Nordeste somados ainda não chegam a 20%, mas crescem mais rápido — Fortaleza por cabo submarino (TikTok/Pecém), RS por
      energia + clima e BSB por governo.
    </Predict>

    {/* timeline hyperscalers */}
    <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-baseline gap-2 mb-2">
        <Cloud className="w-3.5 h-3.5 text-sky-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">hyperscalers no brasil</span>
        <span className="text-[10px] text-neutral-500">— quem comprou de quem</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {HYPERSCALERS_BR.map(h => (
          <div key={h.who} className="grid grid-cols-[60px_60px_1fr_auto] gap-2 items-baseline">
            <span className="font-mono text-neutral-400">{h.ano}</span>
            <span className="font-semibold text-sky-300">{h.who}</span>
            <span className="text-neutral-300">{h.region}</span>
            <span className="text-[10px] text-neutral-500 hidden md:block">{h.plus}</span>
          </div>
        ))}
      </div>
    </div>

    <Misconception
      wrong='"Brasil é caro pro DC, então a gente fica atrás do México."'
      right='Brasil tem 83% da capacidade LATAM. SIN ~85% renovável + REDATA + cabos submarinos + IXP.br = vantagem estrutural.'
      because='O custo de energia ainda é maior que no PY/MX, mas a matriz já é "verde" sem PPAs caros — diferencial relevante para hyperscaler que paga prêmio por I-REC.' />

    <Deeper>
      <p>
        <strong>Por que SP é tão dominante?</strong> Três fatores compostos: <Term>IXP.br</Term> (3º maior do mundo em
        tráfego, fica em Tamboré), densidade de <Term>cabo submarino</Term> chegando em Praia Grande, e o
        <Term>SIN</Term> com energia barata em SP-Sul. Quem está em Tamboré paga ~3 ms de latência ao IXP.br
        e cross-connect direto com 200+ networks. Sair daí custa caro em latência ou em fibra dedicada.
      </p>
      <p>
        <strong>O <Term>REDATA</Term> mudou o jogo</strong>. PL 278/26 (aprovado fev/2026, ainda aguarda sanção)
        suspende PIS/Cofins/IPI/II por 5 anos em equipamentos. Custo fiscal estimado: R$ 5,2B só em 2026. Em troca,
        exige 100% renovável (já é dado no SP-Sul), 10% da capacidade ao mercado doméstico, e 2% do incentivo em P&D.
        Na prática, derruba ~15–20% do CAPEX em equipamento de TI — e por isso vimos R$ 500B em pipeline anunciado
        nas semanas seguintes (NeoFeed).
      </p>
      <p>
        <strong>O ranking do AUM por trás dos players</strong> é talvez o número mais importante: ~6 fundos globais
        controlam quase toda a capacidade carrier-neutral do BR. <Term>DigitalBridge</Term> (~US$ 90B AUM) controla
        a <CrossLink to="capital" recap="Scala = DigitalBridge + CPPIB. Maior pegada hyperscale do BR.">Scala</CrossLink>;
        Brookfield + Digital Realty controlam a Ascenty; Macquarie controla a ODATA; Stonepeak controla a Cirion;
        I Squared comprou a Elea em abr/2026. O capital é estrangeiro; o concreto, brasileiro.
      </p>
    </Deeper>

    <QA items={[
      { q: 'Qual o volume de receita do setor de DC carrier-neutral no Brasil em 2026?',
        a: 'USD 3,38B em 2026 (~R$ 17B), com projeção de USD 6,67B em 2031 (CAGR 14,6%) — Mordor Intelligence / Arizton.' },
      { q: 'Quem foi o primeiro hyperscaler a abrir região no Brasil?',
        a: 'AWS, em 2011 (sa-east-1 / São Paulo). Em 2026 anunciou novo aporte de US$ 1,8B até 2034, somando US$ 5,6B totais.' },
      { q: 'Qual a diferença prática entre os ~1 GW operacional e os +2,6 GW em pipeline?',
        a: 'O pipeline é capacidade contratada com fundos / acordos com governos / terreno + subestação garantidos, mas ainda não construída ou energizada. Tipicamente 2–4 anos de ramp. O risco do pipeline é que parte dele não vira realidade — depende de o REDATA segurar, da CTEEP entregar subestações, e dos hyperscalers manterem demanda.' },
    ]} />
  </Card>
);

/* ============================================================================
   02 — FRAME · escala × foco
   Mapa 2×2 que coloca cada player em um quadrante. Re-utilizado como TOC mental.
   ========================================================================== */

const QUADRANTS = [
  {
    key: 'big-wholesale',
    title: 'Grande escala · hyperscale wholesale',
    sub: 'data halls de 6–36 MW, contratos 10–15 anos',
    color: 'fuchsia',
    players: ['scala', 'odata', 'cloudhq', 'tecto'],
    note: 'Vendem MW para AWS/Azure/GCP/Oracle/Meta. Margem por kW menor, ticket gigante. Vence quem controla terreno + subestação + fibra próxima ao IXP.',
  },
  {
    key: 'big-hybrid',
    title: 'Grande escala · híbrido',
    sub: 'wholesale + retail no mesmo campus',
    color: 'cyan',
    players: ['ascenty'],
    note: 'Único player com escala de 250 MW combinando dois modelos. Vinhedo é wholesale puro; Tamboré e SP capital têm retail enterprise.',
  },
  {
    key: 'small-retail',
    title: 'Escala média · retail enterprise',
    sub: 'cross-connects + cloud onramp',
    color: 'rose',
    players: ['equinix'],
    note: 'Vende metro²/U + cross-connect ($/mês). Receita por kW é a maior do mercado, mas teto de capacidade é menor.',
  },
  {
    key: 'small-enterprise',
    title: 'Escala média · enterprise + governo',
    sub: 'colocation 100 kW–5 MW + serviços',
    color: 'amber',
    players: ['cirion', 'elea', 'takoda'],
    note: 'Sweet-spot 100 kW a 5 MW. Forte em setor público, BFSI brasileiro e telco. Cross-sell com rede / serviços gerenciados é a moeda.',
  },
];

const FrameCard = () => {
  const [focus, setFocus] = useState(null);
  return (
    <Card id="frame" icon={Layers} title="Frame · escala × foco comercial" accent="violet" index={2}
          subtitle="Os 9 players caem em 4 quadrantes. Eixo X: foco (wholesale hyperscale ↔ retail enterprise). Eixo Y: escala atual em MW. Onde você joga define contra quem joga.">
      <MinSchema>
        Não existe "concorrente único". Quem opera <em>hyperscale wholesale</em> joga contra Scala/ODATA/CloudHQ/Tecto.
        Quem opera <em>retail enterprise</em> joga contra Equinix/Cirion/Elea/Takoda. Ascenty é a única que disputa em ambos.
      </MinSchema>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-[11px] mt-4">
        <div />
        <div className="text-center text-[10px] uppercase tracking-[0.18em] text-rose-300/80 pb-1">
          retail / enterprise · ticket menor, margem por kW maior
        </div>
        <div className="text-center text-[10px] uppercase tracking-[0.18em] text-fuchsia-400/80 pb-1">
          wholesale / hyperscale · ticket gigante, margem por kW menor
        </div>

        <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-300 [writing-mode:vertical-rl] rotate-180 self-stretch">
          escala grande
        </div>
        {QUADRANTS.filter(q => q.key.startsWith('big')).slice().reverse().map(q => (
          <QuadrantTile key={q.key} q={q} focus={focus} setFocus={setFocus} />
        ))}

        <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-[0.18em] text-rose-300 [writing-mode:vertical-rl] rotate-180 self-stretch">
          escala média
        </div>
        {QUADRANTS.filter(q => q.key.startsWith('small')).slice().reverse().map(q => (
          <QuadrantTile key={q.key} q={q} focus={focus} setFocus={setFocus} />
        ))}
      </div>

      {/* Detalhe do quadrante focado */}
      <AnimatePresence mode="wait">
        {focus && (
          <motion.div
            key={focus.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className={`mt-4 rounded-lg border ${chipPalette[focus.color].split(' ')[2]} bg-white/[0.02] p-3`}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-[10px] uppercase tracking-[0.2em] ${chipPalette[focus.color].split(' ')[1]}`}>{focus.title}</span>
            </div>
            <p className="text-xs text-neutral-300 leading-snug">{focus.note}</p>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {focus.players.map(pid => {
                const p = PLAYER_BY_ID[pid];
                return (
                  <div key={pid} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                      <span className="text-[11px] text-neutral-100 font-semibold">{p.short}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{p.foco}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">{p.mw} MW · {p.dcs} DCs</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        {!focus && (
          <div className="mt-4 text-[11px] text-neutral-500 italic">Clique em um quadrante para ver os players.</div>
        )}
      </AnimatePresence>

      <WhenItMatters>
        Se você opera DC: o quadrante onde você está define <strong>contra quem você bate</strong>, qual venda
        média esperar e que time comercial montar. Mudar de quadrante (ex.: retail → wholesale) é uma tese de
        produto, não de obra civil — e quase ninguém faz bem ambos ao mesmo tempo.
      </WhenItMatters>
    </Card>
  );
};

/* ============================================================================
   03 — TABELA MESTRA · ★ ANCHOR
   9 players × 9 dimensões. Cliquei numa dimensão = realça e ordena. Cliquei
   num player = abre painel detalhado. Esta é a peça central do explainer.
   ========================================================================== */

const PLAYERS_FULL = [
  {
    id: 'scala', name: 'Scala Data Centers', short: 'Scala', color: 'fuchsia',
    mw_op: 270, mw_pipe: 1500, dcs: 10,
    geo: 'SP (Tamboré × 17 prédios), RS (Eldorado AI City), Fortaleza',
    clientes: 'AWS · Azure · Oracle · Meta',
    estrategia: 'Hyperscale wholesale puro · build-to-suit 10–15 anos · halls 6–36 MW',
    canal: 'Direto via DigitalBridge global; integradores enterprise',
    capex: 'R$ 6,2 B SP · US$ 500M inicial RS · US$ 5 B+ acumulado LATAM',
    investidor: 'DigitalBridge (US$ 90B AUM) + CPPIB (US$ 600M, 2023)',
    pipeline: 'Tamboré → 600 MW · AI City Eldorado RS → 4,75 GW potencial',
    diferencial: 'Maior carrier hotel BR · subestação CTEEP dedicada · racks 30–100 kW liquid cooling',
  },
  {
    id: 'ascenty', name: 'Ascenty', short: 'Ascenty', color: 'cyan',
    mw_op: 250, mw_pipe: 250, dcs: 28,
    geo: 'SP capital (8) + interior (17) + Vinhedo (61 MW maior LATAM) + RJ + Fortaleza',
    clientes: 'AWS · Azure · GCP · Oracle · grandes bancos · TIM',
    estrategia: 'Híbrido — wholesale + enterprise no mesmo grupo',
    canal: 'Direto + parcerias com integradores; cross-sell com fibra própria',
    capex: 'US$ 1B aprovado 2026 (BR + MX + CL)',
    investidor: 'JV 50/50 Digital Realty (NYSE: DLR) + Brookfield Infrastructure',
    pipeline: 'SPO05 47 MW (R$ 300M) · SPO07 + SPO08 40 MW (R$ 1,5B)',
    diferencial: '5.000 km de fibra própria conectando DCs · pegada LATAM mais larga',
  },
  {
    id: 'odata', name: 'ODATA · Aligned', short: 'ODATA', color: 'sky',
    mw_op: 110, mw_pipe: 1300, dcs: 5,
    geo: 'SP (Santana de Parnaíba, Hortolândia, Barueri, Osasco) + RJ',
    clientes: '2 hyperscalers no RJ01 · grandes corps em SP02',
    estrategia: 'Hyperscale AI-ready puro · ramp rápido (meses) · halls de alta densidade',
    canal: 'Direto via Aligned global',
    capex: 'R$ 26 B até 2026 (R$ 14B já alocado) · 1,3 GW LATAM target',
    investidor: 'Aligned (Macquarie Asset Mgmt ~US$ 600B) — desde 2024',
    pipeline: 'SP04 Osasco 48 MW (US$ 450M, abr/2025) + 2–3 sites BR até fim/2026',
    diferencial: 'Aligned Delta³ Cube (cooling adaptive ar) · "AI-by-design" · ramp 4–6 meses',
  },
  {
    id: 'equinix', name: 'Equinix Brasil', short: 'Equinix', color: 'rose',
    mw_op: 80, mw_pipe: 250, dcs: 8,
    geo: 'SP (SP1–SP6 Tamboré + Barueri + Santana de Parnaíba) + RJ (RJ1–RJ3 Lapa)',
    clientes: '200+ networks (carriers, ISPs, clouds, enterprise) · 1000+ deployments',
    estrategia: 'Retail interconnection ("network as a fabric") · cross-connects + IX + Fabric NaaS',
    canal: 'Direto + canal global (Equinix Partner Program) · cloud onramp 5 hyperscalers',
    capex: 'R$ 1B/ano em média · R$ 27 B comprometidos até 2026',
    investidor: 'NASDAQ: EQIX (REIT) · GIC (Singapura) co-investor SP5x',
    pipeline: 'SP6 (US$ 114M, 1.125 racks) ativo · SP7 + 2 lotes anunciados',
    diferencial: 'Maior densidade de cross-connects do BR · receita por kW recorde do mercado · Equinix Metal',
  },
  {
    id: 'cirion', name: 'Cirion Technologies', short: 'Cirion', color: 'emerald',
    mw_op: 70, mw_pipe: 150, dcs: 6,
    geo: 'SP (SAO1 Tamboré · SAO2 Cotia · Sumaré) + RJ (RIO1) + Brasília + Curitiba',
    clientes: '+5.500 LATAM · governo federal · BFSI (Bradesco/Santander) · telcos',
    estrategia: 'Híbrida network + DC · colocation 1–10 MW · cross-sell com backbone',
    canal: 'Direto + canais herdados Lumen (revendas, MSPs, integradores)',
    capex: 'US$ 350–500M LATAM até 2026 (Cotia foco)',
    investidor: 'Stonepeak (US$ 73B AUM) — comprou LATAM da Lumen por US$ 2,7B em 2022',
    pipeline: 'RIO2 60 MW (terreno garantido) · expansão Cotia 60+ MW',
    diferencial: '80.000+ km de fibra LATAM · cabos submarinos · Cirion AI Factory (GPUaaS) com NVIDIA',
  },
  {
    id: 'elea', name: 'Elea Digital', short: 'Elea', color: 'amber',
    mw_op: 60, mw_pipe: 1500, dcs: 9,
    geo: 'SP + RJ (Lapa carrier hotel + Barra) + Brasília + Fortaleza + Curitiba + POA',
    clientes: 'TOTVS · Locaweb · B3 · Petrobras (R$ 2,3B / 17 anos) · governo federal',
    estrategia: 'Enterprise retail + wholesale médio · sweet-spot 100 kW–5 MW',
    canal: 'Direto + canais (revendas, MSPs) · 30+ provedores carrier-neutral por DC',
    capex: 'R$ 2,5B short term + US$ 10B comprometidos pela I Squared (longo)',
    investidor: 'I Squared Capital 67% (US$ 38B AUM) + Piemonte Holding 33% (desde abr/2026)',
    pipeline: 'Rio AI City 1,5 GW (Parque Olímpico) · meta 400 MW até 2030',
    diferencial: 'Maior nº de cidades · DC Lapa = carrier hotel mais denso do RJ · "campeão nacional"',
  },
  {
    id: 'tecto', name: 'Tecto · V.tal', short: 'Tecto', color: 'violet',
    mw_op: 0, mw_pipe: 220, dcs: 0,
    geo: 'SP (Santana de Parnaíba 200 MW, 2027) + Fortaleza Praia do Futuro (Mega Lobster 20 MW)',
    clientes: 'Demanda firme do principal (não-divulgado) já assegurada para SP · clientes V.tal/Globenet',
    estrategia: 'Hyperscale + edge sobre fibra · build-to-suit + sítios edge nos PoPs V.tal',
    canal: 'Direto via V.tal + BTG · cross-sell com rede',
    capex: 'US$ 1B inicial · R$ 1,5B só no Ceará',
    investidor: 'V.tal: BTG Pactual + GIC + CPP Investments · liderança Tecto = Pedro H. Fragoso (BTG)',
    pipeline: 'SP 200 MW online 2027 · Mega Lobster 20 MW Fortaleza',
    diferencial: 'V.tal = 26.000 km de cabos submarinos + 450.000 km de fibra terrestre — espinha dorsal do BR',
  },
  {
    id: 'takoda', name: 'Takoda · Tivit', short: 'Takoda', color: 'orange',
    mw_op: 40, mw_pipe: 200, dcs: 4,
    geo: 'SP + RJ + Bogotá (Colômbia)',
    clientes: '65 na largada — Petrobras · TIM · BNDES · setor financeiro',
    estrategia: 'Enterprise + governo retail · 100% renovável · hosts SOC Tivit',
    canal: 'Direto via Tivit + integrador interno (cross-sell ao portfólio Tivit)',
    capex: 'R$ 1,2B em 5 anos para quintuplicar capacidade',
    investidor: 'Tivit (spin-off 2023) · Tivit historicamente Apax + Pátria',
    pipeline: 'Quintuplicar capacidade dos 4 sites; expansão SP + Bogotá',
    diferencial: 'Profundidade enterprise BR de 20+ anos · clientes legados · 100% renovável end-to-end',
  },
  {
    id: 'cloudhq', name: 'CloudHQ', short: 'CloudHQ', color: 'neutral',
    mw_op: 0, mw_pipe: 400, dcs: 0,
    geo: 'GRU Technology Campus (Paulínia, 200.000 m²) + GIG Campus (São João de Meriti/RJ)',
    clientes: 'Hyperscalers globais (clientes diretos do portfólio CloudHQ EUA/EU)',
    estrategia: 'Hyperscale carrier-neutral global · campus build-to-suit',
    canal: 'Direto via CloudHQ global',
    capex: 'n/d (US$ multi-bi acumulado global)',
    investidor: 'Berkshire Partners (US, private equity) · player global em DC',
    pipeline: '2 campuses BR (Paulínia + São João de Meriti) em construção',
    diferencial: 'Entrante "deep-pocket" puro hyperscale · design AI-first · escala global',
  },
];

const PLAYER_FULL_BY_ID = Object.fromEntries(PLAYERS_FULL.map(p => [p.id, p]));

const DIMENSIONS = [
  { id: 'mw_op',       label: 'MW operacional',     icon: Zap,       color: 'fuchsia',
    fmt: (p) => p.mw_op === 0 ? '— (em obra)' : `${p.mw_op} MW`, sortVal: (p) => -p.mw_op },
  { id: 'mw_pipe',     label: 'Pipeline anunciado', icon: TrendingUp, color: 'cyan',
    fmt: (p) => `${p.mw_pipe >= 1000 ? (p.mw_pipe/1000).toFixed(1).replace('.0','') + ' GW' : p.mw_pipe + ' MW'}`, sortVal: (p) => -p.mw_pipe },
  { id: 'dcs',         label: 'DCs no Brasil',      icon: Server,    color: 'sky',
    fmt: (p) => p.dcs === 0 ? '0 (em obra)' : `${p.dcs} DCs`, sortVal: (p) => -p.dcs },
  { id: 'geo',         label: 'Geografia',          icon: MapPin,    color: 'emerald',
    fmt: (p) => p.geo, sortVal: () => 0 },
  { id: 'clientes',    label: 'Clientes-âncora',    icon: Users,     color: 'orange',
    fmt: (p) => p.clientes, sortVal: () => 0 },
  { id: 'estrategia',  label: 'Estratégia comercial', icon: Briefcase, color: 'rose',
    fmt: (p) => p.estrategia, sortVal: () => 0 },
  { id: 'canal',       label: 'Canais de venda',    icon: Network,   color: 'violet',
    fmt: (p) => p.canal, sortVal: () => 0 },
  { id: 'capex',       label: 'Capex anunciado',    icon: DollarSign, color: 'amber',
    fmt: (p) => p.capex, sortVal: () => 0 },
  { id: 'investidor',  label: 'Investidores',       icon: Banknote,  color: 'fuchsia',
    fmt: (p) => p.investidor, sortVal: () => 0 },
  { id: 'pipeline',    label: 'Projetos futuros',   icon: GitBranch, color: 'cyan',
    fmt: (p) => p.pipeline, sortVal: () => 0 },
  { id: 'diferencial', label: 'Diferenciais',       icon: Sparkles,  color: 'rose',
    fmt: (p) => p.diferencial, sortVal: () => 0 },
];

const TabelaMestraCard = () => {
  const [dim, setDim] = useState(DIMENSIONS[0]);
  const [openPlayer, setOpenPlayer] = useState(null);

  const sorted = useMemo(() => {
    const arr = [...PLAYERS_FULL];
    arr.sort((a, b) => dim.sortVal(a) - dim.sortVal(b));
    return arr;
  }, [dim]);

  const maxNumeric = useMemo(() => {
    if (dim.id === 'mw_op')   return Math.max(...PLAYERS_FULL.map(p => p.mw_op));
    if (dim.id === 'mw_pipe') return Math.max(...PLAYERS_FULL.map(p => p.mw_pipe));
    if (dim.id === 'dcs')     return Math.max(...PLAYERS_FULL.map(p => p.dcs));
    return null;
  }, [dim]);

  const numericVal = (p) => (dim.id === 'mw_op' ? p.mw_op : dim.id === 'mw_pipe' ? p.mw_pipe : dim.id === 'dcs' ? p.dcs : null);

  return (
    <Card id="tabela" icon={Database} title="Tabela mestra · 9 players × 9 dimensões"
          accent="fuchsia" index={3} anchor
          subtitle="Cada coluna é uma dimensão competitiva. Clique numa dimensão → ordena por ela. Clique num player → expande perfil completo. Use isso como o mapa de combate.">
      <MinSchema>
        Esta é a peça central do explainer. <strong>Tudo que vem depois decompõe colunas dela.</strong>
        Volte aqui sempre que quiser cruzar dimensões.
      </MinSchema>

      {/* Filtro por dimensão */}
      <div className="flex flex-wrap gap-1.5">
        {DIMENSIONS.map(d => {
          const Icon = d.icon;
          const isOn = d.id === dim.id;
          return (
            <button
              key={d.id}
              onClick={() => setDim(d)}
              className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                isOn
                  ? `${chipPalette[d.color]} ring-1 ring-${d.color}-400/40`
                  : 'bg-white/[0.02] text-neutral-400 border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-[150px_1fr] text-[11px] uppercase tracking-wider text-neutral-500 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
          <div>player</div>
          <div className="flex items-center gap-1.5">
            <dim.icon className={`w-3 h-3 ${chipPalette[dim.color].split(' ')[1]}`} />
            <span>{dim.label}</span>
            {maxNumeric !== null && <span className="text-neutral-600 normal-case ml-1">— ordenado por valor</span>}
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {sorted.map((p, i) => {
            const isOpen = openPlayer === p.id;
            const v = numericVal(p);
            return (
              <div key={p.id}>
                <button
                  onClick={() => setOpenPlayer(isOpen ? null : p.id)}
                  className="w-full text-left px-3 py-2.5 grid grid-cols-[150px_1fr] gap-2 items-center hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-[10px] text-neutral-500 w-4">{i + 1}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                    <span className="text-neutral-100 font-semibold text-[13px]">{p.short}</span>
                    <ChevronDown className={`w-3 h-3 text-neutral-600 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                  </div>
                  <div className="text-xs text-neutral-300 leading-snug">
                    {maxNumeric !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-32 md:w-48 h-2 rounded bg-white/[0.04] border border-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${maxNumeric ? (v / maxNumeric) * 100 : 0}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full ${chipPalette[p.color].split(' ')[0]}`}
                          />
                        </div>
                        <span className="font-mono text-neutral-200">{dim.fmt(p)}</span>
                      </div>
                    ) : (
                      <span>{dim.fmt(p)}</span>
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        <div className="text-[12px] font-semibold text-neutral-100 mb-2">{p.name}</div>
                        <div className="grid md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          {DIMENSIONS.map(d => (
                            <div key={d.id} className="flex items-baseline gap-2">
                              <span className={`text-[10px] uppercase tracking-wider ${chipPalette[d.color].split(' ')[1]} w-32 shrink-0`}>{d.label}</span>
                              <span className="text-neutral-300 leading-snug flex-1">{d.fmt(p)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <Predict question="Pelo MW operacional, quem está no top-3? E pelo MW de pipeline?">
        <div className="space-y-1.5">
          <div><strong className="text-fuchsia-300">Operacional:</strong> Scala (~270 MW) → Ascenty (~250) → ODATA (~110). Equinix vem em 4º apesar de ser a marca mais reconhecida — porque o modelo retail dela tem teto de capacidade menor.</div>
          <div><strong className="text-fuchsia-300">Pipeline:</strong> Scala (1.500 MW, AI City RS) → Elea (1.500 MW, Rio AI City) → ODATA (1.300 MW LATAM). O pipeline da Elea pulou após o I Squared comprar em abr/2026 — antes era ~200 MW.</div>
        </div>
      </Predict>

      <WhenItMatters>
        <strong>Se você opera DC:</strong> a coluna que importa é onde você joga.
        Vendendo 5 MW para um banco? Você bate em <Chip color="emerald">Cirion</Chip> <Chip color="amber">Elea</Chip> <Chip color="rose">Equinix</Chip>.
        Vendendo 30 MW para hyperscaler? Você bate em <Chip color="fuchsia">Scala</Chip> <Chip color="cyan">Ascenty</Chip> <Chip color="sky">ODATA</Chip>.
        Cada bater pede um pricing, deal model, time comercial e tipo de concreto diferente.
      </WhenItMatters>
    </Card>
  );
};

/* ============================================================================
   04 — CAPACIDADE & PIPELINE
   Bar chart duplo: cada player tem uma barra de "operacional" + uma barra
   sombreada de "pipeline anunciado". O delta visual entre as duas mostra
   quem está crescendo agressivamente vs. quem é só presente operacional.
   ========================================================================== */

const CapacidadeCard = () => {
  const sorted = useMemo(() => [...PLAYERS_FULL].sort((a, b) => (b.mw_op + b.mw_pipe) - (a.mw_op + a.mw_pipe)), []);
  const max = useMemo(() => Math.max(...PLAYERS_FULL.map(p => p.mw_op + p.mw_pipe)), []);
  const totalOp = PLAYERS_FULL.reduce((s, p) => s + p.mw_op, 0);
  const totalPipe = PLAYERS_FULL.reduce((s, p) => s + p.mw_pipe, 0);

  return (
    <Card id="capacidade" icon={Zap} title="Capacidade & pipeline · operacional + anunciado"
          accent="amber" index={4}
          subtitle="Cada player tem uma barra sólida (MW operacional hoje) + uma barra translúcida (pipeline anunciado). O delta mostra quem está em modo defesa × ataque.">

      <div className="grid grid-cols-3 gap-2">
        <Stat label="MW operacional · 9 players" value={`~${totalOp.toLocaleString('pt-BR')}`} sub="≈ 80% do mercado BR" color="text-amber-200" />
        <Stat label="MW em pipeline · anunciado" value={`~${(totalPipe/1000).toFixed(1)} GW`} sub="6,5× a base operacional" color="text-fuchsia-200" />
        <Stat label="Operacional / pipeline" value={`${Math.round(totalOp/(totalOp+totalPipe)*100)}%`} sub="só 13% do tudo já está construído" color="text-rose-200" />
      </div>

      <div className="mt-5 space-y-2">
        {sorted.map(p => {
          const opPct = max ? (p.mw_op / max) * 100 : 0;
          const pipePct = max ? (p.mw_pipe / max) * 100 : 0;
          return (
            <div key={p.id} className="grid grid-cols-[100px_1fr_140px] items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                <span className="text-neutral-100 font-semibold">{p.short}</span>
              </div>
              <div className="relative h-5 rounded bg-white/[0.03] border border-white/10 overflow-hidden">
                {/* pipeline (mais claro) */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pipePct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
                  className={`absolute inset-y-0 left-0 ${chipPalette[p.color].split(' ')[0]} opacity-30`}
                  style={{ left: `${opPct}%` }}
                />
                {/* operacional (sólido) */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${opPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${chipPalette[p.color].split(' ')[0]}`}
                />
              </div>
              <div className="text-right font-mono text-[11px] text-neutral-300 tabular-nums">
                <span className="text-neutral-100">{p.mw_op === 0 ? '—' : `${p.mw_op}`}</span>
                <span className="text-neutral-600 mx-0.5">+</span>
                <span className="text-neutral-400">{p.mw_pipe >= 1000 ? `${(p.mw_pipe/1000).toFixed(1).replace('.0','')}G` : `${p.mw_pipe}`}</span>
                <span className="text-neutral-600 ml-0.5 text-[10px]">MW</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[10px] text-neutral-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-white/30" /> operacional</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded bg-white/10" /> pipeline anunciado</span>
      </div>

      <Misconception
        wrong='"O ranking de MW operacional é o ranking competitivo."'
        right='Em 2026 vale mais o pipeline. Quem entrega 200 MW novos em 18 meses ganha hyperscaler que pagaria 5 anos de retail.'
        because='O mercado está em ramp; capacidade já vendida é commodity, capacidade futura com energia garantida é o ativo escasso. Por isso a Elea (60 MW op + 1,5 GW pipeline pós-I Squared) virou competidora real da Scala mesmo não estando no top-3 operacional.' />

      <Deeper>
        <p>
          <strong>Como ler o delta op → pipeline.</strong> Equinix, Cirion e Takoda têm pipeline pequeno relativo —
          são jogadores que escalam por margem por kW, não por volume. Scala, Elea, ODATA e Tecto/V.tal são
          jogadores de capacidade — vão dobrar/triplicar a base nos próximos 24 meses se a obra
          civil + subestação aguentarem. CloudHQ é só pipeline (entrante), e Ascenty está com expansão
          medida (~1× a base atual em 2 anos).
        </p>
        <p>
          <strong>O gap "anunciado vs energizado" é o gargalo real.</strong> Anunciar 4,75 GW como Scala fez no
          Eldorado/RS depende de a CTEEP entregar a subestação dedicada e da CCEE/ANEEL liberarem TUST/TUSD
          competitivos. Pipeline hyperscaler vira realidade ~50–60% das vezes nos prazos prometidos —
          o resto desliza 1–3 anos. Quem opera DC deveria ler "1,5 GW pipeline" como "300–600 MW certos
          em 24 meses + opcionalidade".
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   05 — GEOGRAFIA · MAPA do Brasil com clusters
   SVG outline do BR + círculos por cluster (raio = soma de MW operacional do
   cluster). Hover/click no círculo abre breakdown por player.
   ========================================================================== */

// Outline simplificada do Brasil (~30 vértices). Sistema SVG 360 × 400.
// Projeção linear: x = (lon + 75) * 8, y = (8 - lat) * 9.52
const BRAZIL_PATH = "M 38 50 L 76 53 L 100 38 L 124 35 L 156 48 L 184 53 L 220 67 L 250 75 L 284 88 L 308 105 L 318 122 L 326 142 L 318 168 L 304 195 L 305 222 L 313 245 L 322 263 L 318 285 L 296 312 L 270 318 L 250 305 L 238 308 L 230 322 L 222 335 L 215 348 L 205 360 L 192 372 L 180 360 L 168 338 L 152 318 L 132 290 L 114 268 L 100 240 L 80 215 L 64 188 L 50 160 L 36 130 L 30 100 L 28 78 L 30 62 Z";

const MAP_CLUSTERS = [
  {
    id: 'sp-metro', label: 'Grande São Paulo',
    detail: 'Tamboré · Barueri · Vinhedo · Hortolândia · Cotia · Paulínia · Osasco · Santana de Parnaíba · SP capital',
    x: 215, y: 285, labelDx: -10, labelDy: 20,
    sites: [
      { player: 'scala',   mw: 270, where: 'Campus Tamboré (17 prédios, 600 MW potencial)' },
      { player: 'ascenty', mw: 250, where: 'Vinhedo 61 MW · SP capital · interior · Tamboré' },
      { player: 'odata',   mw: 110, where: 'Hortolândia 36 MVA · Osasco 48 MW · Santana · Barueri' },
      { player: 'equinix', mw: 80,  where: 'SP1–SP6 Tamboré + Barueri + Santana de Parnaíba' },
      { player: 'cirion',  mw: 50,  where: 'SAO1 Tamboré · Cotia · Sumaré' },
      { player: 'elea',    mw: 30,  where: 'Tamboré + Santana (ex-HostDime)' },
      { player: 'takoda',  mw: 20,  where: 'SP capital' },
      { player: 'tecto',   mw: 0,   where: 'Santana de Parnaíba 200 MW (online 2027)', future: true },
      { player: 'cloudhq', mw: 0,   where: 'Paulínia 200.000 m² (em construção)', future: true },
    ],
  },
  {
    id: 'rj-metro', label: 'Rio de Janeiro',
    detail: 'Lapa · Barra · São João de Meriti · Cidade Nova',
    x: 270, y: 305, labelDx: 30, labelDy: 4,
    sites: [
      { player: 'elea',    mw: 25, where: 'Lapa carrier hotel + Barra · pipeline Rio AI City 1,5 GW (Olímpico)' },
      { player: 'odata',   mw: 24, where: 'RJ01 (2 hyperscalers ancorados)' },
      { player: 'equinix', mw: 15, where: 'RJ1 Lapa + RJ2 + RJ3' },
      { player: 'ascenty', mw: 10, where: 'Barra · Z. Oeste' },
      { player: 'cirion',  mw: 8,  where: 'Barra/Cidade Nova · novo RIO2 60 MW' },
      { player: 'takoda',  mw: 8,  where: 'RJ' },
      { player: 'cloudhq', mw: 0,  where: 'GIG Campus São João de Meriti', future: true },
    ],
  },
  {
    id: 'fortaleza', label: 'Fortaleza · Pecém',
    detail: 'Praia do Futuro · Pecém · cabos submarinos (EllaLink, Firmina, Globenet, EulaLink)',
    x: 308, y: 116, labelDx: -8, labelDy: 0,
    sites: [
      { player: 'ascenty', mw: 25, where: 'DC industrial Pecém · cabos submarinos' },
      { player: 'elea',    mw: 5,  where: 'Cabos submarinos · futura fase 2' },
      { player: 'scala',   mw: 0,  where: 'AI Hub Fortaleza (anunciado)', future: true },
      { player: 'tecto',   mw: 0,  where: 'Mega Lobster 20 MW Praia do Futuro · R$ 1,5B', future: true },
    ],
  },
  {
    id: 'brasilia', label: 'Brasília',
    detail: 'DF · governo federal · soberania de dados',
    x: 217, y: 232, labelDx: 0, labelDy: 0,
    sites: [
      { player: 'cirion', mw: 8, where: 'DC para clientes governo (Serpro/Dataprev/Ministérios)' },
      { player: 'elea',   mw: 5, where: 'Brasília federal' },
    ],
  },
  {
    id: 'curitiba', label: 'Curitiba',
    detail: 'PR · enterprise sul · backup',
    x: 200, y: 330, labelDx: -55, labelDy: 4,
    sites: [
      { player: 'cirion', mw: 5, where: 'CUR1 Curitiba' },
      { player: 'elea',   mw: 3, where: 'DC Sul' },
    ],
  },
  {
    id: 'rs-cluster', label: 'Porto Alegre + Eldorado do Sul',
    detail: 'POA · RS · futuro Scala AI City (4,75 GW potencial)',
    x: 192, y: 362, labelDx: 0, labelDy: 22,
    sites: [
      { player: 'elea',  mw: 3, where: 'POA · DC sul' },
      { player: 'scala', mw: 0, where: 'AI City Eldorado · 54 MW iniciais → 4,75 GW potencial · R$ 3B fase 1', future: true },
    ],
  },
];

const GeografiaCard = () => {
  const [hover, setHover] = useState(null);
  const [activeCluster, setActiveCluster] = useState(null);

  const maxClusterMW = useMemo(() => Math.max(
    ...MAP_CLUSTERS.map(c => c.sites.reduce((s, x) => s + x.mw, 0))
  ), []);

  const radiusOf = (cluster) => {
    const total = cluster.sites.reduce((s, x) => s + x.mw, 0);
    if (total === 0) return 8;
    return 8 + 22 * Math.sqrt(total / maxClusterMW);
  };

  const presencePerPlayer = useMemo(() => {
    const out = {};
    PLAYERS_FULL.forEach(p => {
      const cities = MAP_CLUSTERS.filter(c => c.sites.some(s => s.player === p.id));
      const totalMW = cities.reduce((s, c) => s + (c.sites.find(x => x.player === p.id)?.mw || 0), 0);
      out[p.id] = { cities: cities.length, totalMW };
    });
    return out;
  }, []);

  return (
    <Card id="geografia" icon={MapPin} title="Geografia · onde cada player está no Brasil"
          accent="emerald" index={5}
          subtitle="6 clusters geográficos. Círculo proporcional a √(MW operacional). Cinza = só pipeline (sem operação ainda). Clique → breakdown por player.">

      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-950/40 to-neutral-950/60 p-4">
        <div className="flex justify-center">
          <svg viewBox="0 0 360 420" className="w-full max-w-md h-auto" aria-label="Mapa do Brasil">
            <defs>
              <radialGradient id="mapBgFade" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            <path d={BRAZIL_PATH} fill="url(#mapBgFade)" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.4" />

            <text x="160" y="195" textAnchor="middle" fontSize="7" fill="#525252" letterSpacing="0.18em">NORTE / CENTRO</text>
            <text x="280" y="80"  textAnchor="middle" fontSize="7" fill="#525252" letterSpacing="0.18em">NORDESTE</text>

            {MAP_CLUSTERS.map(c => {
              const r = radiusOf(c);
              const totalMW = c.sites.reduce((s, x) => s + x.mw, 0);
              const isActive = activeCluster === c.id;
              const isFuture = totalMW === 0;

              return (
                <g key={c.id} style={{ cursor: 'pointer' }}
                   onMouseEnter={(e) => setHover({ mx: e.clientX, my: e.clientY, cluster: c })}
                   onMouseMove={(e) => setHover(h => h ? { ...h, mx: e.clientX, my: e.clientY } : h)}
                   onMouseLeave={() => setHover(null)}
                   onClick={() => setActiveCluster(isActive ? null : c.id)}
                >
                  <circle cx={c.x} cy={c.y} r={r + 4}
                          fill={isFuture ? '#525252' : '#34d399'} fillOpacity={isActive ? 0.18 : 0.10} />

                  <circle cx={c.x} cy={c.y} r={r}
                          fill={isFuture ? '#a3a3a3' : '#34d399'}
                          fillOpacity={isFuture ? 0.35 : 0.55}
                          stroke={isFuture ? '#737373' : '#10b981'}
                          strokeWidth={isActive ? 2 : 1}
                          strokeOpacity={isActive ? 1 : 0.7}
                  />

                  {totalMW > 0 && (
                    <text x={c.x} y={c.y + 3} textAnchor="middle" fontSize={Math.max(8, r * 0.4)} fontWeight="600" fill="#0a0a0a">
                      {totalMW}
                    </text>
                  )}

                  {c.sites.filter(s => s.mw > 0).slice(0, 4).map((s, i) => {
                    const player = PLAYER_FULL_BY_ID[s.player];
                    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                    const px = c.x + Math.cos(angle) * (r + 8);
                    const py = c.y + Math.sin(angle) * (r + 8);
                    const colorMap = { fuchsia:'#f0abfc', cyan:'#67e8f9', sky:'#7dd3fc', rose:'#fda4af', emerald:'#6ee7b7', amber:'#fcd34d', violet:'#c4b5fd', orange:'#fdba74', neutral:'#a3a3a3' };
                    return <circle key={s.player} cx={px} cy={py} r="3" fill={colorMap[player.color]} stroke="#0a0a0a" strokeWidth="0.5" />;
                  })}

                  <text x={c.x + (c.labelDx ?? 0)} y={c.y + r + 12 + (c.labelDy ?? 0)} textAnchor="middle" fontSize="9" fill="#e5e7eb" fontWeight="500">
                    {c.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-2 flex justify-center flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-400/55 border border-emerald-500/70" /> operacional · raio &prop; &radic;MW
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-neutral-400/35 border border-neutral-500" /> só pipeline (em obra)
          </span>
        </div>
      </div>

      <FloatingTip
        hover={hover}
        width={320}
        render={(h) => {
          const totalMW = h.cluster.sites.reduce((s, x) => s + x.mw, 0);
          return (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300">{h.cluster.label}</div>
              <div className="text-neutral-300 text-[11px] leading-snug">{h.cluster.detail}</div>
              <div className="text-[10px] text-neutral-500">
                {totalMW} MW operacional · {h.cluster.sites.length} player(s)
              </div>
            </div>
          );
        }}
      />

      <AnimatePresence mode="wait">
        {activeCluster && (() => {
          const c = MAP_CLUSTERS.find(c => c.id === activeCluster);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3"
            >
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">cluster ativo</div>
                  <div className="text-base font-semibold text-neutral-100">{c.label}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{c.detail}</div>
                </div>
                <button onClick={() => setActiveCluster(null)} className="text-[10px] text-neutral-500 hover:text-neutral-300">
                  fechar &times;
                </button>
              </div>
              <div className="space-y-1.5">
                {c.sites.map(s => {
                  const p = PLAYER_FULL_BY_ID[s.player];
                  return (
                    <div key={s.player} className={`grid grid-cols-[100px_1fr_auto] gap-2 items-baseline text-xs px-2 py-1.5 rounded ${s.future ? 'bg-neutral-900/40 opacity-70' : 'bg-white/[0.03]'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                        <span className="text-neutral-100 font-semibold">{p.short}</span>
                      </div>
                      <span className="text-neutral-300 leading-snug">{s.where}</span>
                      <span className="font-mono text-[10px] text-neutral-400 tabular-nums">{s.mw === 0 ? '— pipeline' : `${s.mw} MW`}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}
        {!activeCluster && (
          <div className="text-[11px] text-neutral-500 italic">
            Clique num círculo do mapa para ver os players daquele cluster.
          </div>
        )}
      </AnimatePresence>

      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">pegada por player · cidades brasileiras</div>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-1">
          {PLAYERS_FULL.map(p => {
            const pres = presencePerPlayer[p.id];
            return (
              <div key={p.id} className="rounded border border-white/10 bg-white/[0.02] p-1.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                  <span className="text-[10px] text-neutral-300">{p.short}</span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{pres.cities} cidade{pres.cities === 1 ? '' : 's'}</div>
                <div className="text-[9px] text-neutral-500">{pres.totalMW} MW</div>
              </div>
            );
          })}
        </div>
      </div>

      <WhenItMatters>
        <strong>Single-tenant cidade ≠ monopólio.</strong> Estar sozinho em Eldorado/RS (Scala futuro) ou em Paulínia (CloudHQ futuro)
        protege margem só enquanto o cluster não atrai um segundo carrier-neutral. Quando atrai, o cliente novo trava
        multi-DC + multi-vendor desde o dia 1 — e a vantagem de estar primeiro vira "desconto na fibra".
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Por que SP-metro é o único cluster com 9 players?</strong> Tamboré sozinho hospeda 5 carrier-neutrals
          (Scala, Ascenty, Cirion, Equinix, Elea) — única região do BR onde isso acontece. O motivo é estrutural: <Term>IXP.br</Term>{' '}
          fica lá, fibra de longa distância converge em Tamboré, e o SIN entrega energia barata na região metropolitana
          de SP-Sul. Tentar montar carrier-neutral fora de SP é começar 3 ms acima dos competidores em latência.
        </p>
        <p>
          <strong>Fortaleza é a aposta atrás de SP em 5 anos.</strong> Cabos submarinos (EllaLink, Firmina, Globenet,
          EulaLink) chegam todos lá; latência ao Atlântico Norte é melhor que de SP. Já tem Ascenty + Elea operacionais
          e Scala + Tecto/V.tal anunciaram nova capacidade. Se a tese de "data sovereignty da AI training na América do
          Sul" se confirmar, Fortaleza vira o cluster #2.
        </p>
        <p>
          <strong>Eldorado do Sul/RS é a aposta de hyperscale do hyperscale.</strong> 4,75 GW de potencial em 7 milhões de
          m² é mais do que toda capacidade BR atual. Depende de a CTEEP entregar a subestação dedicada e do clima
          cooperar (zoneamento de risco pós-enchentes 2024). Risco/upside altíssimo.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   06 — INVESTIDORES & CAPITAL
   Bubble chart por AUM do controlador. Quanto maior a bolha, mais musculatura
   financeira o controlador tem para sustentar capex de longo prazo.
   ========================================================================== */

const FUNDOS = [
  { id: 'macquarie',    name: 'Macquarie Asset Mgmt',   aum: 600, color: 'sky',    players: ['odata'],          via: 'Aligned Data Centers · controla ODATA desde 2024' },
  { id: 'digitalbridge',name: 'DigitalBridge Group',     aum: 90,  color: 'fuchsia',players: ['scala'],          via: 'NYSE: DBRG · Scala desde 2021 (+CPPIB co-invest US$ 600M 2023)' },
  { id: 'stonepeak',    name: 'Stonepeak',              aum: 73,  color: 'emerald',players: ['cirion'],         via: 'Comprou LATAM da Lumen por US$ 2,7B em ago/2022' },
  { id: 'isq',          name: 'I Squared Capital',      aum: 38,  color: 'amber',  players: ['elea'],           via: 'Comprou 67% da Elea em abr/2026; commit US$ 10B' },
  { id: 'eqix',         name: 'Equinix (NASDAQ: EQIX)', aum: null,        color: 'rose',   players: ['equinix'],         via: 'REIT listado · GIC co-investidor SP5x · valuation ~US$ 100B' },
  { id: 'dlrbf',        name: 'Digital Realty + Brookfield', aum: null,    color: 'cyan',   players: ['ascenty'],         via: 'JV 50/50 desde 2018 · DLR é REIT NYSE · Brookfield ~US$ 1T AUM consolidado' },
  { id: 'btg',          name: 'BTG + GIC + CPPIB (V.tal)', aum: null,      color: 'violet', players: ['tecto'],           via: 'V.tal controla a Tecto · BTG lidera, GIC + CPPIB co-investidores' },
  { id: 'tivit',        name: 'Tivit (Apax / Pátria histórico)', aum: null, color: 'orange', players: ['takoda'],         via: 'Tivit é portfolio de Apax/Pátria; spun off Takoda em 2023' },
  { id: 'berkshire',    name: 'Berkshire Partners',     aum: null,        color: 'neutral',players: ['cloudhq'],         via: 'Private equity US · controla CloudHQ globalmente' },
];

const CapitalCard = () => (
  <Card id="capital" icon={Banknote} title="Investidores & capital · quem banca o concreto"
        accent="sky" index={6}
        subtitle="6 fundos globais e 3 estruturas BR/listadas controlam toda a capacidade carrier-neutral. Macquarie (US$ 600 B AUM) é a maior; I Squared é o entrante mais agressivo dos últimos 12 meses.">

    <MinSchema>
      O capital é estrangeiro; o concreto, brasileiro. <strong>9 players, 9 controladores diferentes</strong>.
      Mudança de controle em 2024–2026: ODATA → Aligned/Macquarie · Elea → I Squared · Tecto criada via V.tal/BTG.
    </MinSchema>

    <div className="space-y-3">
      {FUNDOS.sort((a, b) => (b.aum || 0) - (a.aum || 0)).map(f => {
        const players = f.players.map(pid => PLAYER_FULL_BY_ID[pid]);
        const aumW = f.aum != null ? Math.min(100, Math.sqrt(f.aum) * 4) : 30;
        return (
          <div key={f.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${chipPalette[f.color].split(' ')[0]}`} />
                <span className="text-neutral-100 font-semibold text-[13px]">{f.name}</span>
              </div>
              {f.aum != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">AUM</span>
                  <span className={`font-mono font-semibold ${chipPalette[f.color].split(' ')[1]}`}>US$ {f.aum} B</span>
                </div>
              )}
              {f.aum == null && <Chip color="neutral">público / consolidado</Chip>}
              <div className="flex items-center gap-1 ml-auto">
                {players.map(p => (
                  <Chip key={p.id} color={p.color}>{p.short}</Chip>
                ))}
              </div>
            </div>
            {f.aum != null && (
              <div className="mt-2 h-1.5 rounded bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${aumW}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className={`h-full ${chipPalette[f.color].split(' ')[0]}`}
                />
              </div>
            )}
            <div className="mt-2 text-[11px] text-neutral-400 leading-snug">{f.via}</div>
          </div>
        );
      })}
    </div>

    <Worked title="Por que AUM importa para um operador de DC">
      <p>
        Um campus de 100 MW custa US$ 500–800M para construir (subestação + civil + chillers + redundância
        + UPS + fibra). Outro tanto em equipamentos de TI quando o cliente chega. <strong>O ciclo de cash
        é 4–6 anos.</strong> Quem tem AUM grande pode segurar duas coisas que mata operadores menores:
      </p>
      <ul className="list-disc pl-4 space-y-0.5">
        <li>Construir <em>antes</em> de ter cliente fechado, e ainda tolerar 12–18 meses de occupancy ramp.</li>
        <li>Cobrir 1–2 anos de margem comprimida quando os concorrentes derrubam preço para encher capacidade.</li>
      </ul>
      <p>
        Por isso a Macquarie (US$ 600B) consegue rodar a ODATA com R$ 26B comprometidos sem suor. E por isso
        a I Squared comprou a Elea — não pela base atual de 60 MW, mas porque tem capital para escalar para 1 GW.
      </p>
    </Worked>

    <Deeper>
      <p>
        <strong>Como ler o "AUM == capacidade de aguentar guerra de preço".</strong> Se Scala (DigitalBridge US$ 90B)
        decidir derrubar o preço wholesale por 18 meses para asfixiar a Tecto, ela consegue. Se a Tecto
        responder, BTG + GIC + CPPIB tem que abrir reservas. Esse é exatamente o jogo que o REDATA (que
        derruba CAPEX 15–20%) deve disparar — quem tem AUM grande aproveita o desconto fiscal para crescer
        mais agressivo do que a curva natural de demanda permitiria.
      </p>
      <p>
        <strong>O lado oposto: REIT vs PE.</strong> Equinix e Digital Realty são REITs, distribuem ≥90% do lucro
        como dividendo. Capex livre é menor — eles dependem mais de emissões de equity/dívida do que
        de "saco infinito do fundo". Em troca, têm caps mais previsíveis e payback explícito por cross-connect.
        Para um competidor brasileiro, REIT é o cara que faz "preço de tabela"; PE-controlado é o cara
        que "abre a torneira quando convém".
      </p>
    </Deeper>

    <QA items={[
      { q: 'Quem é o maior controlador por AUM no setor de DC carrier-neutral BR?',
        a: 'Macquarie Asset Management (~US$ 600 B), via Aligned Data Centers, controla a ODATA. DigitalBridge (US$ 90 B) controla a Scala — o segundo maior. I Squared (US$ 38 B) é o entrante recente da Elea (abr/2026).' },
      { q: 'Quais foram os 3 grandes movimentos de capital nos últimos 24 meses?',
        a: '(1) Aligned/Macquarie comprou ODATA da DigitalBridge em 2024. (2) V.tal criou a Tecto como subsidiária de DC com US$ 1B em 2025. (3) I Squared comprou 67% da Elea em abr/2026 com commit de US$ 10B.' },
      { q: 'A Equinix é REIT — isso ajuda ou atrapalha competitivamente no BR?',
        a: 'Atrapalha em ataque rápido: REIT distribui ≥90% do lucro. Mas ajuda na previsibilidade — o Brasil dela é apenas 8/85 DCs Americas, e o capex anual é ~R$ 1B/ano, suficiente para crescer 1 DC/ano sem stress. Em retail interconnection (cross-connect), o modelo REIT casa bem com receita recorrente e capex incremental.' },
    ]} />
  </Card>
);

/* ============================================================================
   06b — FINANCEIRO · profundidade por player
   Para cada player: receita, EBITDA, margem, crescimento, capex anunciado,
   endividamento (debêntures), alavancagem (ND/EBITDA), caixa/PL.
   Onde a empresa é privada e não publica balanço, valores marcados N/D.
   ========================================================================== */

const FIN_DATA = {
  scala: {
    transp: 'média', transpNote: 'Demonstrações 2023 publicadas + debêntures CVM',
    receita_2023: 'R$ 513,5M (líquida)', receita_2022: 'R$ 350,5M', cresc: '+46,5% YoY',
    ebitda: 'R$ ~119M (est.)', margem: '~23% (estimada)',
    capex: 'R$ 6,2B SP + R$ 3B RS (fase 1) · potencial R$ 500B',
    debentures: 'R$ 1,37B green debêntures (2024) + US$ 803M acumulado ESG · BNDES R$ 180M (2025, 1ª op DC)',
    alavancagem: 'ND/EBITDA = 4,3x (2023, divulgado)',
    caixa_pl: 'ND específico — emissões de US$ 803M ESG sustentam liquidez',
    extra: 'Investidores: DigitalBridge + CPPIB + Coatue + IMCO Ontario',
  },
  ascenty: {
    transp: 'média', transpNote: 'Resultados operacionais divulgados, balanço completo na Digital Realty consolidado',
    receita_2024: '+54% YoY (vendas)', receita_2025: '+30% receita enterprise', cresc: '+54% (2024) · +26% MW contratado',
    ebitda: 'ND BR', margem: 'ND BR (DLR consolidado: 49%)',
    capex: 'US$ 1B aprovado 2026 (BR+MX+CL)',
    debentures: 'US$ 860M em 8 emissões (2024) · US$ 1,025B funding cumulativo',
    alavancagem: 'ND BR · DLR consolidado: 5,9x ND/EBITDA',
    caixa_pl: 'ND BR — US$ 1,025B funding levantado sustenta capex',
    extra: '600 clientes (+119 em 2024 · +149 em 2025) · Cross-connect +62%, IP bandwidth +160%',
  },
  odata: {
    transp: 'baixa', transpNote: 'Sem demonstrações públicas BR; disclosure só via comunicados de funding',
    receita_2024: 'ND', receita_2023: 'ND', cresc: 'ND',
    ebitda: 'ND', margem: 'ND',
    capex: 'R$ 26B até 2026 (R$ 14B alocados) · meta 1,3 GW LATAM',
    debentures: 'US$ 1,02B green financing 2024 · US$ 2,25B total contratado',
    alavancagem: 'ND',
    caixa_pl: 'ND · respaldo Macquarie (US$ 600B AUM) + Aligned',
    extra: 'Sob Aligned/Macquarie desde 2024',
  },
  equinix: {
    transp: 'alta (global)', transpNote: 'NASDAQ: EQIX · 10-K SEC · BR não isolado',
    receita_2024: 'US$ 8,75B (global) · ~US$ 350–400M BR (est.)', receita_2023: 'US$ 8,19B (global)', cresc: '+7% (2024 reported) · +8% normalizado const.',
    ebitda: 'US$ 4,39–4,47B (2025 guidance global)', margem: '49% adj. EBITDA (2025 guide, +190 bps YoY)',
    capex: 'R$ 1B/ano em média · R$ 27B comprometidos até 2026 (BR)',
    debentures: 'Dívida pública (REIT) · senior notes USD-denominated',
    alavancagem: '~4,3x ND/EBITDA consolidado (typical REIT)',
    caixa_pl: '2025 guidance: AFFO ~US$ 35–37/share · valuation ~US$ 100B',
    extra: 'GIC co-investidor SP5x (US$ 116,4M)',
  },
  cirion: {
    transp: 'média', transpNote: 'Stonepeak portfolio · sustainability report 2024 · não publica DRE detalhada BR',
    receita_2024: 'BR ~US$ 500–550M (est.) · LATAM 2022 ~US$ 1,2B', receita_2023: 'ND', cresc: 'ND',
    ebitda: 'Margem >50% (highlight setor telecom)', margem: '>50% (declarada, ESG report 2024)',
    capex: 'US$ 350–500M plurianual LATAM até 2026 (Cotia + RIO2)',
    debentures: 'Dívida estruturada via Stonepeak · refinanciamento 2024 (Bloomberg)',
    alavancagem: 'ND (2024 reforço de equity Stonepeak para business unit splits)',
    caixa_pl: 'ND · Stonepeak (US$ 73B AUM) backstop',
    extra: 'Compra Lumen LATAM por Stonepeak: US$ 2,7B (ago/2022)',
  },
  elea: {
    transp: 'média-baixa', transpNote: 'Debêntures CVM trazem alguma transparência; balanço consolidado privado',
    receita_2024: 'ND', receita_2023: 'ND', cresc: 'ND',
    ebitda: 'ND', margem: 'ND',
    capex: 'R$ 2,5B short term (I Squared 2026) · US$ 10B long term · meta 400 MW até 2030',
    debentures: 'R$ 790M (5ª, ago/2025) · R$ 570M (4ª, jan/2024) · US$ 150M ESG-linked (set/2025) · ~R$ 2,2B+ total',
    alavancagem: 'ND · debêntures atreladas a covenant ND/EBITDA',
    caixa_pl: 'Contrato Petrobras R$ 2,3B/17 anos = receita travada',
    extra: 'I Squared (US$ 38B AUM) controla 67% desde abr/2026',
  },
  tecto: {
    transp: 'baixa (DC)', transpNote: 'Tecto = subsidiária V.tal · números só via V.tal consolidado',
    receita_2024: 'R$ 0 (operações iniciam 2027)', receita_2023: 'R$ 0', cresc: '—',
    ebitda: 'R$ 0', margem: '—',
    capex: 'US$ 1B inicial · 200 MW SP + 20 MW Fortaleza',
    debentures: 'Funding via V.tal (BTG) · não isolado',
    alavancagem: 'V.tal 2024: positiva · 2025: prejuízo R$ 13,8B (impairment)',
    caixa_pl: 'V.tal 2024 EBITDA R$ 4,3B · 2025 colapso para R$ 1,16B',
    extra: 'V.tal 2024 receita: R$ 7,7B (+33%) · BTG agora 100% (compra Oi 2026)',
  },
  takoda: {
    transp: 'alta (BR)', transpNote: 'Demonstrações 2023 publicadas no site Takoda',
    receita_2024: 'ND · 2024 projeção Tivit total R$ 2,1B', receita_2023: 'R$ 227,3M (consolidada) · R$ 208,7M (bruta)', cresc: 'parcial 10 meses 2023',
    ebitda: 'R$ 31,2M (mar–dez/2023, parcial)', margem: '~14% (estimada anualizada)',
    capex: 'R$ 1,2B em 5 anos · meta 5× capacidade',
    debentures: 'Capital via Tivit · não emite isoladamente',
    alavancagem: 'ND',
    caixa_pl: 'Tivit 2023 caixa gerado R$ 122M · Lucro líquido Takoda 2023: R$ 27,1M',
    extra: 'Tivit (controladora): R$ 1,9B receita, R$ 282M EBITDA (15% margem) · 2024 estima R$ 2,1B · à venda novamente',
  },
  cloudhq: {
    transp: 'mínima', transpNote: 'Privada US (Berkshire Partners) · sem disclosure BR',
    receita_2024: 'R$ 0 (em construção)', receita_2023: 'R$ 0', cresc: '—',
    ebitda: 'R$ 0', margem: '—',
    capex: 'ND público (US$ multi-bi acumulado global)',
    debentures: 'ND',
    alavancagem: 'ND',
    caixa_pl: 'ND · Berkshire Partners é PE',
    extra: 'GRU Technology Campus 200.000 m² Paulínia + GIG São João de Meriti em construção',
  },
};

const FIN_FIELDS = [
  { id: 'receita_2024',  label: 'Receita 2024',          icon: DollarSign, color: 'emerald' },
  { id: 'receita_2023',  label: 'Receita 2023 (ref.)',   icon: BarChart3,  color: 'cyan' },
  { id: 'cresc',         label: 'Crescimento YoY',       icon: TrendingUp, color: 'fuchsia' },
  { id: 'ebitda',        label: 'EBITDA',                icon: Activity,   color: 'amber' },
  { id: 'margem',        label: 'Margem EBITDA',         icon: PieChart,   color: 'violet' },
  { id: 'capex',         label: 'Capex anunciado',       icon: Building2,  color: 'sky' },
  { id: 'debentures',    label: 'Endividamento (deb./funding)', icon: Banknote, color: 'rose' },
  { id: 'alavancagem',   label: 'Alavancagem (ND/EBITDA)', icon: Target,    color: 'orange' },
  { id: 'caixa_pl',      label: 'Caixa & PL',            icon: Crown,      color: 'fuchsia' },
];

const TRANSP_COLOR = { 'alta (BR)': 'emerald', 'alta (global)': 'emerald', 'média': 'amber', 'média-baixa': 'orange', 'baixa': 'rose', 'baixa (DC)': 'rose', 'mínima': 'rose' };

const FinanceiroCard = () => {
  const [activePid, setActivePid] = useState('scala');
  // sort default: by transparência (alta primeiro) then by Scala/conhecimento
  const sortedPlayers = useMemo(() => {
    const order = { 'alta (BR)': 0, 'alta (global)': 1, 'média': 2, 'média-baixa': 3, 'baixa': 4, 'baixa (DC)': 5, 'mínima': 6 };
    return [...PLAYERS_FULL].sort((a, b) => order[FIN_DATA[a.id].transp] - order[FIN_DATA[b.id].transp]);
  }, []);
  const active = PLAYER_FULL_BY_ID[activePid];
  const fin = FIN_DATA[activePid];

  // resumo agregado
  const totalCapex = 'R$ 27B (Equinix) + R$ 26B (ODATA) + R$ 6,2B SP Scala + US$ 10B Elea + ~R$ 25B+ outros';
  const totalDebentures = 'US$ 803M (Scala) + US$ 1,025B (Ascenty) + US$ 2,25B (ODATA) + R$ 2,2B (Elea) ≈ US$ 4,7B';

  return (
    <Card id="financeiro" icon={DollarSign} title="Financeiro · receita, EBITDA, dívida, capex, alavancagem"
          accent="emerald" index={7}
          subtitle="9 players, 9 níveis de disclosure. Empresas listadas (Equinix) abrem tudo; PE-controladas (Scala, Ascenty, Elea) divulgam só via debêntures CVM; CloudHQ é privada US sem disclosure BR.">

      <MinSchema>
        Capex BR anunciado agregado: <strong>~R$ 90B+ até 2026</strong>. Debêntures emitidas agregadas:
        <strong>~US$ 4,7B</strong>. Receitas BR: maioria privada — a transparência <em>melhora</em> à medida que o player
        precisa do mercado de capitais brasileiro (Scala, Elea, Ascenty).
      </MinSchema>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Stat label="Capex anunciado · agregado" value="R$ 90B+" sub="acumulado até 2026" color="text-sky-200" />
        <Stat label="Debêntures emitidas · agregado" value="~US$ 4,7B" sub="2023–2026 nos players com CVM" color="text-rose-200" />
        <Stat label="AUM dos controladores" value="~US$ 800B" sub="Macquarie + DigitalBridge + Stonepeak + ISq + …" color="text-fuchsia-200" />
      </div>

      {/* tabela compacta resumo */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden mt-4">
        <div className="grid grid-cols-[100px_1fr_90px] text-[10px] uppercase tracking-wider text-neutral-500 px-3 py-2 border-b border-white/10 bg-white/[0.02]">
          <div>player</div>
          <div>receita · EBITDA · capex (resumo)</div>
          <div>transp.</div>
        </div>
        <div className="divide-y divide-white/5">
          {sortedPlayers.map(p => {
            const f = FIN_DATA[p.id];
            const tColor = TRANSP_COLOR[f.transp];
            const isActive = activePid === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePid(p.id)}
                className={`w-full text-left grid grid-cols-[100px_1fr_90px] gap-2 items-start px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors ${isActive ? 'bg-white/[0.05]' : ''}`}
              >
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                  <span className="text-neutral-100 font-semibold">{p.short}</span>
                </div>
                <div className="text-neutral-300 leading-snug space-y-0.5">
                  <div><span className="text-neutral-400 text-[10px] uppercase tracking-wider mr-1">rec</span>{f.receita_2024}</div>
                  <div><span className="text-neutral-400 text-[10px] uppercase tracking-wider mr-1">ebitda</span>{f.ebitda}</div>
                  <div><span className="text-neutral-400 text-[10px] uppercase tracking-wider mr-1">capex</span>{f.capex.split('·')[0].trim()}</div>
                </div>
                <div className="pt-0.5"><Chip color={tColor}>{f.transp}</Chip></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* tab buttons */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {PLAYERS_FULL.map(p => {
          const isOn = p.id === activePid;
          return (
            <button
              key={p.id}
              onClick={() => setActivePid(p.id)}
              className={`text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-all ${
                isOn ? `${chipPalette[p.color]} ring-1 ring-${p.color}-400/50` : 'bg-white/[0.02] text-neutral-400 border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
              {p.short}
            </button>
          );
        })}
      </div>

      {/* painel detalhado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePid}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          <div className={`rounded-lg border-l-4 ${chipPalette[active.color].split(' ')[2].replace('border-', 'border-l-')} ${chipPalette[active.color].split(' ')[2]} bg-white/[0.02] p-3`}>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">player</div>
                <div className={`text-base font-semibold ${chipPalette[active.color].split(' ')[1]}`}>{active.name}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">{active.controller}</div>
              </div>
              <div className="text-right">
                <Chip color={TRANSP_COLOR[fin.transp]}>transparência {fin.transp}</Chip>
                <div className="text-[10px] text-neutral-500 mt-1 max-w-xs">{fin.transpNote}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            {FIN_FIELDS.map(field => {
              const Icon = field.icon;
              const val = fin[field.id];
              const isND = !val || val === 'ND' || val === '—';
              return (
                <div key={field.id} className={`rounded-md border p-3 ${isND ? 'border-white/5 bg-neutral-950/40 opacity-60' : `${chipPalette[field.color].split(' ')[2]} bg-white/[0.02]`}`}>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <Icon className={`w-3.5 h-3.5 ${chipPalette[field.color].split(' ')[1]}`} />
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500">{field.label}</span>
                  </div>
                  <div className={`text-xs leading-snug ${isND ? 'text-neutral-500 italic' : 'text-neutral-200'}`}>
                    {isND ? 'N/D · não disclose público' : val}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">contexto adicional</div>
            <div className="text-xs text-neutral-300 leading-snug">{fin.extra}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Misconception
        wrong='"Como são todos privados, os números são opacos."'
        right='Quem precisa do mercado de capitais BR (Scala, Elea, Ascenty) abre cada vez mais. Quem é portfolio puro de PE estrangeiro (CloudHQ, ODATA) abre o mínimo legal.'
        because='Debêntures CVM exigem covenant de ND/EBITDA, fact sheets, ESG report. A transparência é proporcional à dependência do funding doméstico — não à propriedade.' />

      <Deeper>
        <p>
          <strong>Por que a alavancagem 4,3x da Scala (2023) é estruturalmente alta para BR.</strong> Telecom/infra
          BR opera tipicamente em 2–3,5x ND/EBITDA. Acima de 4x já é um vetor de stress se o ramp atrasar.
          A Scala compensa porque (i) tem hyperscaler ancorando o ramp, (ii) dívida é majoritariamente
          em USD via swap, (iii) DigitalBridge + CPPIB injetam equity quando precisa. Player BR sem essa
          backstop estrangeira não consegue carregar essa estrutura.
        </p>
        <p>
          <strong>O ciclo de cash de DC carrier-neutral.</strong> Capex pesado (~US$ 7M/MW para infra +
          equipamento) entra antes do cliente fechar. Occupancy ramp ~12–18 meses. EBITDA positivo a
          partir de ~70% ocupação. Payback consolidado: 5–7 anos para wholesale, 8–10 para retail.
          Isso explica por que o setor concentrou em 6 fundos com AUM agregado &gt; US$ 800B — só esse
          tipo de capital tolera o ciclo.
        </p>
        <p>
          <strong>O que a V.tal nos ensina sobre o risco.</strong> Em 2024, V.tal reportou EBITDA de R$ 4,3B
          (margem 67% no 1S). Em 2025, EBITDA caiu para R$ 1,16B (-73%) e o prejuízo contábil bateu R$ 13,8B
          via impairment. A causa: revisão dos planos de fibra atado à crise da Oi. Para a Tecto isso pode
          ou não importar — depende de o BTG segregar os ativos digitais (DC) dos legados (fibra).
        </p>
      </Deeper>

      <QA items={[
        { q: 'Qual player tem o disclosure financeiro mais transparente do mercado BR?',
          a: 'Empate entre Equinix (NASDAQ: EQIX, full SEC filings, mas BR não isolado) e Takoda (publica DRE consolidada no site BR). Os PE-controlados ficam num meio-termo: Scala publica balanço auditado, Elea só via prospecto de debênture, ODATA basicamente nada.' },
        { q: 'Como a Cirion mantém EBITDA margin >50% sendo network + DC ao mesmo tempo?',
          a: 'Base instalada de 5.500 clientes herdada da Lumen com churn baixo + cross-sell forte (rede vende DC, DC vende rede). Margem de telecom legacy é >50% se a operação for matura — o ponto é a Cirion não está crescendo agressivo, está colhendo. O risco é cloud onramp comoditizar a parte de rede em 3–5 anos.' },
        { q: 'Por que a Scala consegue 4,3x ND/EBITDA e a maioria das infra-BR não?',
          a: 'DigitalBridge (US$ 90B AUM) + CPPIB são equity backstop. O que num player BR puro seria covenant breach é confortável aqui porque o equity check do controlador é credível. A I Squared comprando Elea trouxe a mesma lógica para o "campeão nacional".' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — ESTRATÉGIA COMERCIAL · tabbed por modelo de negócio
   3 abas: Hyperscale wholesale / Retail interconnection / Enterprise híbrido.
   Cada aba lista os players desse modelo e o que define a margem deles.
   ========================================================================== */

const ESTRATEGIAS = [
  {
    id: 'wholesale', label: 'Hyperscale wholesale', color: 'fuchsia',
    icon: Building2,
    players: ['scala', 'odata', 'cloudhq', 'tecto'],
    sub: 'Build-to-suit. Halls 6–36 MW. Contratos 10–15 anos. AWS/Azure/GCP/Meta/Oracle/TikTok pagam.',
    pricing: 'US$ 130–180 / kW / mês para hyperscaler (commit ≥10 MW)',
    margem: 'EBITDA 50–60% pós-ramp · payback 5–7 anos',
    venceQuem: 'tem terreno + subestação + fibra + I-REC garantidos primeiro',
    perdeQuem: 'comprime preço para encher capacidade pre-vendida',
    timeComercial: 'Pequeno (5–10 pessoas globais), key-account com hyperscalers · pouca conversão de canal',
    risco: 'Concentração de cliente — 1 hyperscaler pode ser 30–50% do site',
  },
  {
    id: 'retail', label: 'Retail interconnection', color: 'rose',
    icon: Cable,
    players: ['equinix'],
    sub: 'Cross-connects + IX + Fabric NaaS. Muitos clientes (1.000+/DC). Receita recorrente por porta.',
    pricing: 'US$ 300–400 / cross-connect / mês · multiplicado por 50.000+ ativos no BR',
    margem: 'EBITDA 45–55% · receita recorrente alta · payback 6–8 anos',
    venceQuem: 'tem mais networks no MMR (efeito de rede)',
    perdeQuem: 'atrasou cloud onramp ou perdeu carrier-de-trânsito anchor',
    timeComercial: 'Grande (50+ pessoas BR) · forte channel program · cloud-onramp partner managers',
    risco: 'Comoditização de cross-connect via NaaS (Fabric, Megaport) — receita pode migrar para SDN',
  },
  {
    id: 'enterprise', label: 'Enterprise + governo + híbrido', color: 'amber',
    icon: Briefcase,
    players: ['ascenty', 'cirion', 'elea', 'takoda'],
    sub: 'Sweet-spot 100 kW–5 MW. Banco, indústria, telco, governo. Cross-sell com fibra/serviços.',
    pricing: 'R$ 30–80 mil/mês por cliente típico · contratos 3–5 anos',
    margem: 'EBITDA 40–50% · cross-sell aumenta LTV',
    venceQuem: 'tem rede própria + presença em BSB + cabo submarino + cloud onramp',
    perdeQuem: 'depende de canal só (revendedor cobra spread, derruba margem)',
    timeComercial: 'Médio (20–40 pessoas BR) · forte canal + BFSI + governo verticais',
    risco: 'AWS/Azure/GCP devorando carga "core" para nuvem — DC privado migrando para colocation híbrido',
  },
];

const EstrategiaCard = () => {
  const [activeId, setActiveId] = useState(ESTRATEGIAS[0].id);
  const active = ESTRATEGIAS.find(e => e.id === activeId);
  return (
    <Card id="estrategia" icon={Briefcase} title="Estratégia comercial · 3 modelos de negócio"
          accent="rose" index={8}
          subtitle="Os 9 players caem em 3 modelos com economias unitárias muito diferentes. Pricing, margem, time comercial, e risco mudam tudo conforme o modelo.">

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 -mx-2 px-2 overflow-x-auto">
        {ESTRATEGIAS.map(e => {
          const Icon = e.icon;
          const isOn = e.id === activeId;
          return (
            <button
              key={e.id}
              onClick={() => setActiveId(e.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                isOn
                  ? `${chipPalette[e.color].split(' ')[1]} border-${e.color}-400`
                  : 'text-neutral-500 border-transparent hover:text-neutral-300'
              }`}
              style={isOn ? { borderColor: undefined } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{e.label}</span>
              <span className="text-[9px] text-neutral-500 font-mono">({e.players.length})</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <div className="text-xs text-neutral-300 leading-snug mb-3">{active.sub}</div>

          {/* Players nesta estratégia */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {active.players.map(pid => {
              const p = PLAYER_FULL_BY_ID[pid];
              return (
                <div key={pid} className={`inline-flex items-center gap-2 rounded border px-2 py-1.5 ${chipPalette[p.color]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                  <span className="text-[12px] font-semibold">{p.short}</span>
                  <span className="text-[10px] opacity-70 font-mono">{p.mw_op === 0 ? 'em obra' : `${p.mw_op} MW`}</span>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <Stat label="Pricing típico" value={active.pricing.split(' ')[0] + ' ' + active.pricing.split(' ')[1] + ' ' + active.pricing.split(' ')[2]} sub={active.pricing} color="text-neutral-100" />
            <Stat label="Margem EBITDA" value={active.margem.split(' ')[1]} sub={active.margem} color="text-emerald-200" />
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-emerald-400/30 bg-emerald-400/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> vence quem…
              </div>
              <div className="text-neutral-200 leading-snug">{active.venceQuem}</div>
            </div>
            <div className="rounded-md border border-rose-400/30 bg-rose-400/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-rose-300 mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> perde quem…
              </div>
              <div className="text-neutral-200 leading-snug">{active.perdeQuem}</div>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-violet-300 mb-1">time comercial</div>
              <div className="text-neutral-300 leading-snug">{active.timeComercial}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 mb-1">risco principal</div>
              <div className="text-neutral-300 leading-snug">{active.risco}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Misconception
        wrong='"Carrier-neutral significa todos vendem igual."'
        right='Carrier-neutral é só o atributo de não-amarrado-com-carrier. O modelo de negócio é wholesale, retail ou enterprise — três economias unitárias diferentes.'
        because='Equinix faz US$ 350/cross-connect/mês × 50.000 conexões. Scala faz US$ 150/kW/mês × 30 MW. Os dois são "carrier-neutral", mas a primeira tem 200 SKUs e a segunda tem 1 SKU.' />
    </Card>
  );
};

/* ============================================================================
   08 — CLIENTES-ÂNCORA · matriz hyperscaler × DC operator
   Quem hospeda quem. Linhas = âncoras (hyperscalers, governo, BFSI),
   colunas = operadores. Célula colorida = relação confirmada.
   ========================================================================== */

const CLIENTES_ANCHORS = [
  { id: 'aws',      label: 'AWS',                        kind: 'hyperscaler', hosts: ['scala', 'ascenty'] },
  { id: 'azure',    label: 'Microsoft Azure',            kind: 'hyperscaler', hosts: ['scala', 'ascenty'] },
  { id: 'gcp',      label: 'Google Cloud',               kind: 'hyperscaler', hosts: ['ascenty'] },
  { id: 'oracle',   label: 'Oracle Cloud',               kind: 'hyperscaler', hosts: ['ascenty', 'scala'] },
  { id: 'meta',     label: 'Meta',                       kind: 'hyperscaler', hosts: ['scala'] },
  { id: 'tiktok',   label: 'TikTok / ByteDance',         kind: 'hyperscaler', hosts: ['tecto'], note: 'Pecém/CE futuro — Tecto/V.tal' },
  { id: 'odataclient', label: '2 hyperscalers (RJ01)',   kind: 'hyperscaler', hosts: ['odata'], note: 'Não divulgados; 2 dos top-5 globais' },
  { id: 'petrobras',label: 'Petrobras',                  kind: 'governo',     hosts: ['elea', 'takoda'], note: 'Elea: R$ 2,3B/17 anos · Takoda: legado Tivit' },
  { id: 'bndes',    label: 'BNDES',                      kind: 'governo',     hosts: ['takoda'] },
  { id: 'serpro',   label: 'Serpro / Dataprev',          kind: 'governo',     hosts: ['cirion'], note: 'Base herdada Lumen/CenturyLink' },
  { id: 'ministerios', label: 'Ministérios federais',    kind: 'governo',     hosts: ['cirion', 'elea'] },
  { id: 'b3',       label: 'B3',                         kind: 'bfsi',        hosts: ['elea'] },
  { id: 'bradesco', label: 'Bradesco',                   kind: 'bfsi',        hosts: ['cirion'] },
  { id: 'santander',label: 'Santander',                  kind: 'bfsi',        hosts: ['cirion'] },
  { id: 'itau',     label: 'Itaú',                       kind: 'bfsi',        hosts: ['scala'], note: 'Cloud onramp via Tamboré' },
  { id: 'tim',      label: 'TIM',                        kind: 'telco',       hosts: ['takoda', 'ascenty'] },
  { id: 'totvs',    label: 'TOTVS',                      kind: 'enterprise',  hosts: ['elea'] },
  { id: 'locaweb',  label: 'Locaweb',                    kind: 'enterprise',  hosts: ['elea'] },
  { id: 'networks', label: '200+ networks',              kind: 'cross',       hosts: ['equinix'], note: 'Carriers, ISPs, NaaS, IXPs' },
];

const KIND_COLOR = {
  hyperscaler: 'fuchsia',
  governo: 'amber',
  bfsi: 'sky',
  telco: 'violet',
  enterprise: 'emerald',
  cross: 'rose',
};

const ClientesCard = () => {
  const players = PLAYERS_FULL;
  const [hover, setHover] = useState(null);
  const [filterKind, setFilterKind] = useState(null);
  const [view, setView] = useState('byPlayer'); // 'byPlayer' | 'matrix'

  const visible = filterKind ? CLIENTES_ANCHORS.filter(c => c.kind === filterKind) : CLIENTES_ANCHORS;

  // Por player: quais clientes hospeda
  const clientsPerPlayer = useMemo(() => {
    const out = {};
    PLAYERS_FULL.forEach(p => {
      out[p.id] = visible.filter(c => c.hosts.includes(p.id));
    });
    return out;
  }, [visible]);

  return (
    <Card id="clientes" icon={Users} title="Clientes-âncora · quem hospeda quem"
          accent="orange" index={9}
          subtitle="Hyperscalers concentram em Scala + Ascenty. Governo + BFSI espalha entre Cirion/Elea/Takoda. Equinix vive de cross-connects, não de carga.">

      {/* Filtro por tipo + Toggle de visão */}
      <div className="flex flex-wrap items-center gap-1.5 justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterKind(null)}
            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
              !filterKind ? 'bg-white/10 text-neutral-100 border-white/20' : 'bg-white/[0.02] text-neutral-500 border-white/10'
            }`}
          >
            todos · {CLIENTES_ANCHORS.length}
          </button>
          {Object.entries({ hyperscaler: 'hyperscaler', governo: 'governo', bfsi: 'BFSI', telco: 'telco', enterprise: 'enterprise', cross: 'cross-connect' }).map(([k, lbl]) => {
            const count = CLIENTES_ANCHORS.filter(c => c.kind === k).length;
            const isOn = filterKind === k;
            return (
              <button
                key={k}
                onClick={() => setFilterKind(isOn ? null : k)}
                className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                  isOn ? `${chipPalette[KIND_COLOR[k]]} ring-1 ring-${KIND_COLOR[k]}-400/40` : 'bg-white/[0.02] text-neutral-500 border-white/10 hover:text-neutral-300'
                }`}
              >
                {lbl} · {count}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 rounded border border-white/10 bg-white/[0.02] p-0.5">
          <button onClick={() => setView('byPlayer')} className={`text-[10px] px-2 py-1 rounded transition-colors ${view === 'byPlayer' ? 'bg-orange-400/15 text-orange-200' : 'text-neutral-500'}`}>por player</button>
          <button onClick={() => setView('matrix')}   className={`text-[10px] px-2 py-1 rounded transition-colors ${view === 'matrix'   ? 'bg-orange-400/15 text-orange-200' : 'text-neutral-500'}`}>matriz</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'byPlayer' && (
          <motion.div key="bp" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="space-y-2">
            {PLAYERS_FULL.map(p => {
              const list = clientsPerPlayer[p.id];
              if (list.length === 0) return null;
              return (
                <div key={p.id} className={`rounded-lg border ${chipPalette[p.color].split(' ')[2]} bg-white/[0.02] p-3`}>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                      <span className={`text-[13px] font-semibold ${chipPalette[p.color].split(' ')[1]}`}>{p.short}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{list.length} âncora{list.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map(c => (
                      <span
                        key={c.id}
                        onMouseEnter={(e) => setHover({ mx: e.clientX, my: e.clientY, anchor: c, player: p })}
                        onMouseMove={(e) => setHover(h => h ? { ...h, mx: e.clientX, my: e.clientY } : h)}
                        onMouseLeave={() => setHover(null)}
                        className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded border ${chipPalette[KIND_COLOR[c.kind]]} cursor-help`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[KIND_COLOR[c.kind]].split(' ')[0]}`} />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Players sem hospedagem */}
            {PLAYERS_FULL.filter(p => clientsPerPlayer[p.id].length === 0).length > 0 && (
              <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3 opacity-70">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">sem âncora pública divulgada (filtros aplicados)</div>
                <div className="flex flex-wrap gap-1">
                  {PLAYERS_FULL.filter(p => clientsPerPlayer[p.id].length === 0).map(p => (
                    <Chip key={p.id} color={p.color}>{p.short}</Chip>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'matrix' && (
          <motion.div key="mx" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[200px_repeat(9,minmax(0,1fr))] gap-1 text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  <div></div>
                  {players.map(p => (
                    <div key={p.id} className="flex flex-col items-center">
                      <span className={`w-2 h-2 rounded-full ${chipPalette[p.color].split(' ')[0]} mb-0.5`} />
                      <span className="text-[9px] text-neutral-400">{p.short.slice(0, 7)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-0.5">
                  {visible.map(c => (
                    <div key={c.id} className="grid grid-cols-[200px_repeat(9,minmax(0,1fr))] gap-1 items-center">
                      <div className="text-[11px] text-neutral-300 truncate flex items-center gap-1.5" title={c.label}>
                        <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[KIND_COLOR[c.kind]].split(' ')[0]}`} />
                        <span>{c.label}</span>
                      </div>
                      {players.map(p => {
                        const present = c.hosts.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onMouseEnter={(e) => present && setHover({ mx: e.clientX, my: e.clientY, anchor: c, player: p })}
                            onMouseMove={(e) => present && setHover(h => h ? { ...h, mx: e.clientX, my: e.clientY } : h)}
                            onMouseLeave={() => setHover(null)}
                            className={`h-5 rounded transition-all ${
                              present
                                ? `${chipPalette[p.color].split(' ')[0]} hover:opacity-90 cursor-pointer`
                                : 'bg-white/[0.02] border border-white/5'
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingTip
        hover={hover}
        width={300}
        render={(h) => (
          <div className="space-y-1">
            <div className={`text-[10px] uppercase tracking-wider ${chipPalette[h.player.color].split(' ')[1]}`}>
              {h.player.short} · hosts {h.anchor.label}
            </div>
            <div className="text-neutral-200 leading-snug text-xs">
              {h.anchor.note || `Relação confirmada publicamente.`}
            </div>
          </div>
        )}
      />

      <Predict question="Quem é o player com a base de hyperscalers MAIS concentrada (e isso é bom ou ruim)?">
        <div className="space-y-1.5">
          <div><strong className="text-fuchsia-300">Scala</strong> tem 4–5 hyperscalers (AWS, Azure, Oracle, Meta, Itaú cloud-onramp). Ascenty tem 4. ODATA tem 2 (não divulgados).</div>
          <div>É bom curto prazo (receita estável, alto ticket) mas concentração ≥30% por cliente vira risco no recontract — o hyperscaler exige preço + condições de mercado.</div>
          <div>Por isso a Tecto, com US$ 1B + 200 MW ainda em obra, está montando "demanda firme do principal" — para diluir esse risco antes de virar realidade.</div>
        </div>
      </Predict>

      <WhenItMatters>
        <strong>Receita por cliente vs receita por kW.</strong> Equinix tem 1.000+ clientes recorrentes na base BR.
        Scala tem ~10. Os dois faturam em magnitude parecida (~R$ 1,5–2 B/ano) — modelos opostos. Operador
        que está crescendo precisa decidir <em>por qual ângulo</em> escalar: mais clientes (retail) ou mais kW por cliente (wholesale).
      </WhenItMatters>
    </Card>
  );
};

/* ============================================================================
   09 — DIFERENCIAIS · hover-tile reference card
   12 capabilities × 9 players (cell mark = "tem"). Hover na célula → tooltip
   com a especificidade desse player nesse vetor.
   ========================================================================== */

const CAPABILITIES = [
  { id: 'fibra-propria',    label: 'Fibra própria intercampus',  icon: Cable,
    leaders: { ascenty: '5.000 km dedicada', cirion: '80.000 km LATAM', tecto: '450.000 km via V.tal' } },
  { id: 'cabo-submarino',   label: 'Cabo submarino conectado',   icon: Globe,
    leaders: { ascenty: 'Fortaleza', cirion: 'SAm-1, Mistral', tecto: '26.000 km submarino', elea: 'Fortaleza', scala: 'Fortaleza' } },
  { id: 'cross-connect',    label: 'Cross-connect denso',         icon: Network,
    leaders: { equinix: '50.000+ ativos', cirion: 'carrier hotel Tamboré + Cotia', elea: 'Lapa carrier hotel' } },
  { id: 'ix-ixp',           label: 'IXP.br / IX direto',          icon: Plug,
    leaders: { equinix: 'sede do IXP.br SP', scala: 'Tamboré adjacente', cirion: 'Tamboré', ascenty: 'Tamboré' } },
  { id: 'cloud-onramp',     label: 'Cloud onramp (5 hyperscalers)', icon: Cloud,
    leaders: { equinix: 'AWS DX, Azure ER, GCP PI, Oracle FC, Alibaba', cirion: '4 hyperscalers', ascenty: '4 hyperscalers', elea: '4 hyperscalers' } },
  { id: 'subestacao',       label: 'Subestação dedicada',         icon: Zap,
    leaders: { scala: 'CTEEP em Eldorado RS · 4,75 GW', ascenty: 'Vinhedo', odata: 'Hortolândia + Osasco' } },
  { id: 'liquid-cooling',   label: 'Liquid cooling AI-ready',     icon: Cpu,
    leaders: { scala: 'racks 30–100 kW', odata: 'AI-by-design Aligned Delta³', ascenty: 'novos campuses', equinix: 'SP5x + SP6' } },
  { id: 'i-rec-ppa',        label: '100% renovável (I-REC + PPA)', icon: Sparkles,
    leaders: { scala: 'I-REC · Tamboré + RS hidro/eólico', takoda: 'end-to-end 100%', tecto: 'PPA Santana de Parnaíba', odata: 'Brasil grid' } },
  { id: 'tier-iii-iv',      label: 'Tier III/IV Uptime',          icon: Shield,
    leaders: { scala: 'Tier III campos novos', ascenty: 'Tier III maioria', equinix: 'Tier III/IV mix', odata: 'Tier III' } },
  { id: 'governo',          label: 'BSB / governo federal',       icon: Flag,
    leaders: { cirion: 'base herdada Lumen', elea: 'base nacional · Petrobras R$ 2,3B', takoda: 'BNDES / Petrobras' } },
  { id: 'gpuaas',           label: 'GPU-as-a-service / AI-stack', icon: BarChart3,
    leaders: { cirion: 'AI Factory · NVIDIA partnership', scala: 'AI City RS roadmap' } },
  { id: 'edge',             label: 'Edge / cidades secundárias',  icon: MapPin,
    leaders: { tecto: 'Mega Lobster Fortaleza', elea: 'Brasília + Fortaleza + POA + Curitiba', cirion: 'Brasília + Curitiba' } },
];

const DiferenciaisCard = () => {
  const [hover, setHover] = useState(null);

  // Ranking: capabilities ordenadas por uniqueness (1 owner = moat 5★, 9 owners = commodity 1★)
  const ranked = useMemo(() => {
    return CAPABILITIES
      .map(cap => ({ ...cap, ownerCount: Object.keys(cap.leaders).length }))
      .sort((a, b) => a.ownerCount - b.ownerCount);
  }, []);

  // Score por player: quantas das 12 capabilities ele tem
  const scoreByPlayer = useMemo(() => {
    const out = {};
    PLAYERS_FULL.forEach(p => {
      const owned = CAPABILITIES.filter(c => p.id in c.leaders);
      const moats = owned.filter(c => Object.keys(c.leaders).length <= 2);
      out[p.id] = { total: owned.length, moats: moats.length, moatList: moats.map(c => c.label) };
    });
    return out;
  }, []);

  // Estrelas por uniqueness
  const moatStars = (count) => {
    if (count === 1) return { stars: 5, label: 'moat raro', color: 'fuchsia' };
    if (count === 2) return { stars: 4, label: 'duopólio',  color: 'rose' };
    if (count === 3) return { stars: 3, label: 'oligopólio', color: 'amber' };
    if (count <= 5)  return { stars: 2, label: 'mainstream', color: 'sky' };
    return            { stars: 1, label: 'commodity',  color: 'neutral' };
  };

  return (
    <Card id="diferenciais" icon={Sparkles} title="Diferenciais · ranking de moats"
          accent="violet" index={10}
          subtitle="12 capacidades ordenadas por exclusividade. Quem tem capacidade que &le;2 players têm com profundidade tem moat real. O resto vira tabela em 24 meses.">

      <MinSchema>
        Moat = capacidade <em>escassa</em>. Em 2026 BR, só <strong>5 capacidades</strong> têm 1–2 owners (★★★★ ou ★★★★★).
        O resto está caminhando para commodity. Saber em qual moat você está define se você compete por preço ou por cliente.
      </MinSchema>

      {/* Ranking visual */}
      <div className="space-y-2">
        {ranked.map((cap, i) => {
          const Icon = cap.icon;
          const ownersList = Object.entries(cap.leaders);
          const moat = moatStars(cap.ownerCount);
          return (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`rounded-lg border p-3 ${cap.ownerCount <= 2 ? `${chipPalette[moat.color].split(' ')[2]} bg-fuchsia-500/[0.04]` : 'border-white/10 bg-white/[0.02]'}`}
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Icon className={`w-4 h-4 ${chipPalette[moat.color].split(' ')[1]}`} />
                <span className="text-[13px] font-semibold text-neutral-100">{cap.label}</span>
                <span className="text-[11px] font-mono tabular-nums text-amber-300">{'★'.repeat(moat.stars)}<span className="text-neutral-700">{'★'.repeat(5 - moat.stars)}</span></span>
                <Chip color={moat.color}>{moat.label} · {cap.ownerCount} owner{cap.ownerCount > 1 ? 's' : ''}</Chip>
              </div>

              <div className="grid md:grid-cols-2 gap-1.5">
                {ownersList.map(([pid, detail]) => {
                  const p = PLAYER_FULL_BY_ID[pid];
                  return (
                    <div
                      key={pid}
                      onMouseEnter={(e) => setHover({ mx: e.clientX, my: e.clientY, cap, player: p, detail })}
                      onMouseMove={(e) => setHover(h => h ? { ...h, mx: e.clientX, my: e.clientY } : h)}
                      onMouseLeave={() => setHover(null)}
                      className="text-xs px-2 py-1.5 rounded bg-white/[0.03] border border-white/10 cursor-help flex items-baseline gap-2"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]} mt-1 shrink-0`} />
                      <span className={`font-semibold ${chipPalette[p.color].split(' ')[1]} shrink-0`}>{p.short}</span>
                      <span className="text-neutral-300 leading-snug">{detail}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <FloatingTip
        hover={hover}
        width={320}
        render={(h) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] uppercase tracking-wider ${chipPalette[h.player.color].split(' ')[1]}`}>{h.player.short}</span>
              <span className="text-[10px] text-neutral-500">·</span>
              <span className="text-[10px] uppercase tracking-wider text-violet-300">{h.cap.label}</span>
            </div>
            <div className="text-neutral-200 leading-snug text-xs">{h.detail}</div>
          </div>
        )}
      />

      {/* Score por player */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">moat score por player &middot; capacidades exclusivas (&le;2 owners)</div>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-1">
          {PLAYERS_FULL.map(p => {
            const sc = scoreByPlayer[p.id];
            return (
              <div key={p.id} className="rounded border border-white/10 bg-white/[0.02] p-2 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                  <span className="text-[10px] text-neutral-300">{p.short}</span>
                </div>
                <div className={`text-base font-mono ${sc.moats >= 2 ? 'text-fuchsia-300' : 'text-neutral-300'}`}>{sc.moats}</div>
                <div className="text-[9px] text-neutral-500">moats / {sc.total} caps</div>
              </div>
            );
          })}
        </div>
      </div>

      <Misconception
        wrong='"Vou competir com Equinix em cross-connect."'
        right='Equinix tem 50.000+ cross-connects ativos no BR — é efeito de rede acumulado em 15 anos. Substituir é construir uma rede inteira.'
        because='Capacidade física (terreno + concreto + chiller) é replicável. Rede de relacionamentos entre clientes (todos querem que TODOS estejam aqui) não é replicável em prazo curto. Quem tenta empata em valor e perde em margem.' />

      <Deeper>
        <p>
          <strong>Por que moats raros (★★★★★) são mais defensáveis que oligopólios (★★★).</strong> Mostly-1
          owner = capability exige asset adjacente que ninguém vai construir só para competir nessa
          dimensão. <em>Subestação dedicada de 4,75 GW</em> só faz sentido se você tem o pipeline da Scala.
          <em>26.000 km de cabo submarino</em> só faz sentido se você é V.tal/Globenet. Já oligopólios em
          PUE 1,3 ou Tier III são compráveis com obra civil.
        </p>
        <p>
          <strong>Quem tem mais moats raros é quem ataca em mais frentes.</strong> Cirion (backbone + AI
          Factory + governo) tem 3 moats; Scala (subestação + carrier hotel) tem 2; Equinix (cross-connect)
          tem 1 mas vale por 5 — esse 1 cobre o jogo todo dela. CloudHQ entra com zero moats e precisa
          construir um (provavelmente "AI-first by design", mas Aligned/ODATA já está lá).
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   10 — M&A · timeline + pipeline de projetos
   Linha do tempo de eventos de capital + grid de projetos futuros por player.
   ========================================================================== */

const MNA_EVENTS = [
  { date: '2018',     player: 'ascenty', kind: 'M&A',     headline: 'Digital Realty + Brookfield criam JV 50/50 da Ascenty', amt: 'US$ 1,8B' },
  { date: '2021',     player: 'scala',   kind: 'M&A',     headline: 'DigitalBridge controla a Scala (saída IPI Brasil + GIC parcial)', amt: 'n/d' },
  { date: 'ago/2022', player: 'cirion',  kind: 'M&A',     headline: 'Stonepeak compra LATAM da Lumen → renomeia Cirion', amt: 'US$ 2,7B' },
  { date: '2023',     player: 'scala',   kind: 'capital', headline: 'CPPIB co-investe na Scala', amt: 'US$ 600M' },
  { date: '2023',     player: 'takoda',  kind: 'M&A',     headline: 'Tivit cria Takoda como spin-off de DC + R$ 1,2B em 5 anos', amt: 'R$ 1,2B' },
  { date: '2024',     player: 'odata',   kind: 'M&A',     headline: 'Aligned (Macquarie) compra ODATA da DigitalBridge', amt: 'n/d' },
  { date: '2024',     player: 'scala',   kind: 'projeto', headline: 'Scala anuncia AI City Eldorado/RS · 4,75 GW potencial · R$ 3B fase 1', amt: 'R$ 3B' },
  { date: '2024',     player: 'aws-ext', kind: 'projeto', headline: 'AWS commit US$ 1,8B novos no BR até 2034', amt: 'US$ 1,8B' },
  { date: 'jan/2025', player: 'tecto',   kind: 'projeto', headline: 'V.tal lança Tecto · 200 MW Santana de Parnaíba (online 2027)', amt: 'US$ 1B' },
  { date: 'abr/2025', player: 'odata',   kind: 'projeto', headline: 'ODATA SP04 Osasco online · 48 MW · US$ 450M', amt: 'US$ 450M' },
  { date: 'jul/2025', player: 'ascenty', kind: 'projeto', headline: 'Ascenty SPO05 anunciado · 47 MW · R$ 300M', amt: 'R$ 300M' },
  { date: 'out/2025', player: 'elea',    kind: 'contrato', headline: 'Elea vence Petrobras · DC estratégico SP · 17 anos', amt: 'R$ 2,3B' },
  { date: 'set/2025', player: 'redata',  kind: 'regulação', headline: 'MP 1318/2025 cria REDATA — suspende PIS/Cofins/IPI/II 5 anos', amt: 'R$ 5,2B isenção' },
  { date: 'fev/2026', player: 'redata',  kind: 'regulação', headline: 'PL 278/26 (REDATA) aprovado pela Câmara', amt: '' },
  { date: 'abr/2026', player: 'elea',    kind: 'M&A',     headline: 'I Squared compra 67% da Elea + commit US$ 10B', amt: 'US$ 10B' },
];

const KIND_PALETTE = {
  'M&A':       'fuchsia',
  'capital':   'violet',
  'projeto':   'cyan',
  'contrato':  'emerald',
  'regulação': 'amber',
};

const MnACard = () => (
  <Card id="mna" icon={GitBranch} title="M&A & projetos · timeline 2018→2026"
        accent="cyan" index={11}
        subtitle="15 eventos que reorganizaram o tabuleiro. Os 24 meses recentes (out/2025 → abr/2026) concentram 6 movimentos — REDATA + I Squared + Petrobras + Tecto + AI City lockaram a década.">

    <div className="space-y-1.5">
      {MNA_EVENTS.map((e, i) => {
        const player = PLAYER_FULL_BY_ID[e.player];
        const color = KIND_PALETTE[e.kind] || 'neutral';
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.025 }}
            className="grid grid-cols-[80px_90px_1fr_auto] gap-2 items-baseline text-xs px-2.5 py-1.5 rounded border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <span className="font-mono text-neutral-400 text-[11px]">{e.date}</span>
            <Chip color={color}>{e.kind}</Chip>
            <span className="text-neutral-200 leading-snug">
              {player && <span className={`font-semibold ${chipPalette[player.color].split(' ')[1]}`}>{player.short} </span>}
              {e.headline}
            </span>
            {e.amt && <span className="font-mono text-[11px] text-neutral-300 tabular-nums">{e.amt}</span>}
          </motion.div>
        );
      })}
    </div>

    <Predict question="Qual evento, retroativamente, mais reorganizou o tabuleiro competitivo?">
      Argumentável: <strong className="text-fuchsia-300">REDATA (set/2025 → fev/2026)</strong>. Por quê — pré-REDATA, o
      ranking projetado em 2030 era ~3 GW operacional liderado por Scala/Ascenty. Pós-REDATA, o pipeline anunciado
      saltou para +2,6 GW (Mordor) — porque o desconto de PIS/Cofins/IPI/II em 5 anos derruba CAPEX
      de equipamento ~15–20%. Isso disparou o aporte da I Squared na Elea (abr/2026) e o commitment
      adicional da Aligned/Macquarie (R$ 26B). O tabuleiro passou de "consolidado" para "todos correndo".
    </Predict>

    <Misconception
      wrong='"Pipeline anunciado é compromisso firme."'
      right='Pipeline é um anúncio com terreno + acordos pré-contratuais. ~50–60% chega no prazo. O resto desliza 1–3 anos ou some.'
      because='Histórico LATAM 2018–2024 mostra que projetos que dependem de subestação dedicada (4,75 GW Eldorado) ou aprovação ambiental específica (Pecém/CE) atrasam mais. Projetos de expansão de campus existente (Tamboré, Vinhedo, Cotia) entregam mais perto do anunciado.' />
  </Card>
);

/* ============================================================================
   11 — POSICIONAMENTO COMPETITIVO · ★ ANCHOR DOIS
   Síntese final: "se eu sou o player X, contra quem eu jogo em qual segmento,
   e qual minha jogada defensiva/ofensiva". Predict + reveal por player.
   ========================================================================== */

const POSITIONING = {
  scala: {
    youAre: 'Scala',
    fightsFor: ['ascenty', 'odata', 'tecto', 'cloudhq'],
    inSegment: 'Hyperscale wholesale (≥10 MW deals)',
    moat: 'Subestação dedicada CTEEP em Eldorado (4,75 GW potencial), maior carrier hotel BR (Tamboré), AUM DigitalBridge (US$ 90B) + CPPIB',
    threat: 'Tecto está fechando hyperscaler "principal" no SP200 MW; CloudHQ entrando em Paulínia com US$ deep-pockets',
    play: 'Manter ramp Eldorado — 54 MW iniciais → 450 MW em 2027 → roadmap 4,75 GW. Não entrar em retail; deixar Equinix e Cirion brigarem entre si',
  },
  ascenty: {
    youAre: 'Ascenty',
    fightsFor: ['scala', 'odata', 'cirion', 'elea'],
    inSegment: 'Híbrido — wholesale (Vinhedo, Tamboré) + enterprise (SP capital)',
    moat: '5.000 km de fibra própria intercampus, Vinhedo (61 MW maior LATAM), JV Brookfield + Digital Realty',
    threat: 'Brookfield buscando sócio para diluir (2025–2026) sinaliza pressão por capital fresco. Scala e ODATA escalam pipeline mais agressivo',
    play: 'Defender Vinhedo como hub Oracle/AWS · escalar enterprise em SP capital com cross-sell de fibra · talvez vender 50% para fundo soberano (GIC/CPPIB?) para destravar capex',
  },
  odata: {
    youAre: 'ODATA',
    fightsFor: ['scala', 'ascenty', 'cloudhq', 'tecto'],
    inSegment: 'Hyperscale AI-ready (alta densidade)',
    moat: 'Aligned Delta³ Cube (cooling adaptive ar), ramp 4–6 meses, Macquarie AUM (US$ 600B — maior do setor)',
    threat: 'Pequena no operacional (110 MW) vs pipeline (1,3 GW LATAM) — execução é o gargalo. Scala já entrega; ODATA tem que provar',
    play: 'Acelerar SP05/SP06 + RJ02 com AI-by-design · capturar workloads de inference que liquid cooling Tier-1 não pega ainda · usar Macquarie para preço agressivo',
  },
  equinix: {
    youAre: 'Equinix',
    fightsFor: ['cirion', 'elea'],
    inSegment: 'Retail interconnection (cross-connect, IX, NaaS)',
    moat: '50.000+ cross-connects ativos · 200+ networks · 5 cloud onramps · 15 anos de efeito de rede',
    threat: 'NaaS (Megaport, PCCW Console, próprio Fabric) comoditiza cross-connect físico. Hyperscale wholesale rouba "core" enterprise para nuvem',
    play: 'Continuar empilhando cross-connects · evoluir Fabric para SDN-only (preço sem fronteira física) · não tentar wholesale (atrapalha REIT model). Empacotar Equinix Metal + xScale para ataques pontuais',
  },
  cirion: {
    youAre: 'Cirion',
    fightsFor: ['equinix', 'elea', 'takoda'],
    inSegment: 'Enterprise + governo + cross-sell de rede',
    moat: '80.000 km de fibra LATAM + cabos submarinos + base 5.500 clientes herdada Lumen + AI Factory NVIDIA (1ª BR)',
    threat: 'Stonepeak pode reciclar para outro veículo em 2027–2028. Cotia atrasou; Tamboré tem competição direta',
    play: 'Defender governo federal (Serpro/Dataprev/Ministérios) — base sticky · escalar AI Factory antes da Scala virar competitiva · cross-sell de fibra em Cotia para BFSI',
  },
  elea: {
    youAre: 'Elea',
    fightsFor: ['cirion', 'equinix', 'takoda', 'ascenty'],
    inSegment: 'Enterprise + governo + retail médio (100 kW–5 MW)',
    moat: 'Maior pegada nacional (9 cidades), DC Lapa carrier hotel RJ, contrato Petrobras R$ 2,3B/17 anos, I Squared US$ 10B commit',
    threat: 'Pulou de 60 MW operacional → 1,5 GW pipeline em 1 ano. Execução é tudo. Rio AI City depende de zoneamento + subestação no Parque Olímpico',
    play: 'Capitalizar contrato Petrobras como prova social federal · escalar Rio AI City antes da Scala/Ascenty entrarem · "campeão nacional" como narrativa para grandes BFSI brasileiros',
  },
  tecto: {
    youAre: 'Tecto · V.tal',
    fightsFor: ['scala', 'odata', 'ascenty'],
    inSegment: 'Hyperscale wholesale + edge sobre fibra V.tal',
    moat: '26.000 km de cabo submarino + 450.000 km de fibra terrestre BR (espinha dorsal nacional) + BTG/GIC/CPPIB',
    threat: 'Zero capacidade operacional até 2027. "Demanda firme do principal" depende de 1 hyperscaler — se não fechar/atrasar, US$ 1B fica idle',
    play: 'Entregar SP 200 MW dentro do prazo · usar Mega Lobster para edge cases (CDN, gaming, Pecém latência) · diversificar âncoras antes de 2027',
  },
  takoda: {
    youAre: 'Takoda · Tivit',
    fightsFor: ['cirion', 'elea', 'equinix'],
    inSegment: 'Enterprise + governo (legado Tivit)',
    moat: '20+ anos de operação Tivit · Petrobras + TIM + BNDES como base · 100% renovável end-to-end',
    threat: 'Capex menor (R$ 1,2B) vs concorrentes (US$ multi-bi). Risco de virar nicho se não acelerar pipeline',
    play: 'Quintuplicar capacidade nos 4 sites antes de 2028 · explorar SOC + serviços gerenciados como diferencial · talvez levantar capital adicional via Apax/Pátria',
  },
  cloudhq: {
    youAre: 'CloudHQ',
    fightsFor: ['scala', 'odata', 'tecto'],
    inSegment: 'Hyperscale carrier-neutral (entrante deep-pocket)',
    moat: 'Berkshire Partners + portfólio global (EUA + EU + ME) · campus Paulínia 200.000 m² · "AI-first by design"',
    threat: 'Late entrant — Scala já tem Eldorado/RS, ODATA tem AI-by-design. Sem âncora hyperscaler ainda divulgada publicamente',
    play: 'Fechar 1 hyperscaler grande (AWS/Azure/Meta) para ancora Paulínia · usar GIG (RJ) como complemento DR/burst · capitalizar AI capacity-crunch global para preço premium',
  },
};

const PosicionamentoCard = () => {
  const [activePid, setActivePid] = useState('scala');
  const [revealed, setRevealed] = useState(false);
  const active = POSITIONING[activePid];
  const player = PLAYER_FULL_BY_ID[activePid];
  const fights = active.fightsFor.map(pid => PLAYER_FULL_BY_ID[pid]);

  return (
    <Card id="posicionamento" icon={Target} title="Posicionamento competitivo · contra quem você joga"
          accent="fuchsia" index={12} anchor
          subtitle="A síntese. Para cada player, contra quem ele bate em qual segmento, qual moat ele tem, qual ameaça ele enfrenta, e qual a jogada defensiva/ofensiva. Predict your own first.">

      <MinSchema>
        Não existe "Scala vs todo mundo". Existe <strong>Scala vs Ascenty/ODATA/Tecto/CloudHQ no wholesale</strong>;
        <strong> Equinix vs Cirion/Elea no retail enterprise</strong>; <strong>Cirion vs Elea/Takoda no governo + BFSI</strong>.
        Três jogos em paralelo no mesmo país.
      </MinSchema>

      {/* Player picker */}
      <div className="flex flex-wrap gap-1.5">
        {PLAYERS_FULL.map(p => {
          const isOn = p.id === activePid;
          return (
            <button
              key={p.id}
              onClick={() => { setActivePid(p.id); setRevealed(false); }}
              className={`text-[11px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-all ${
                isOn
                  ? `${chipPalette[p.color]} ring-1 ring-${p.color}-400/50 scale-105`
                  : 'bg-white/[0.02] text-neutral-400 border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
              {p.short}
            </button>
          );
        })}
      </div>

      {/* Predict step */}
      {!revealed && (
        <div className="rounded-md border border-violet-400/25 bg-violet-400/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">tente prever antes de revelar</span>
          </div>
          <p className="text-xs text-neutral-200 leading-snug mb-2">
            Se você é a <strong>{player.name}</strong>, em qual segmento você joga? Quem são seus 3–4 competidores
            diretos? Qual sua moat estrutural? Qual a jogada que faz sentido em 2026–2027?
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="text-[11px] rounded border border-fuchsia-400/40 bg-fuchsia-400/10 hover:bg-fuchsia-400/20 text-fuchsia-200 px-3 py-1.5 inline-flex items-center gap-1.5"
          >
            <Eye className="w-3 h-3" /> revelar análise
          </button>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className={`rounded-lg border-l-4 ${chipPalette[player.color].split(' ')[2].replace('border-', 'border-l-')} ${chipPalette[player.color].split(' ')[2]} bg-white/[0.02] p-3`}>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">você é</div>
              <div className={`text-base font-semibold ${chipPalette[player.color].split(' ')[1]}`}>{active.youAre}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Segmento principal: {active.inSegment}</div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-rose-300 mb-2">você bate diretamente em</div>
              <div className="flex flex-wrap gap-1.5">
                {fights.map(p => (
                  <div key={p.id} className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 ${chipPalette[p.color]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${chipPalette[p.color].split(' ')[0]}`} />
                    <span className="text-[12px] font-semibold">{p.short}</span>
                    <span className="text-[10px] opacity-70 font-mono">{p.mw_op === 0 ? 'em obra' : `${p.mw_op}MW`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-emerald-400/30 bg-emerald-400/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> sua moat estrutural
                </div>
                <div className="text-neutral-200 leading-snug">{active.moat}</div>
              </div>
              <div className="rounded-md border border-rose-400/30 bg-rose-400/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-rose-300 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ameaça principal
                </div>
                <div className="text-neutral-200 leading-snug">{active.threat}</div>
              </div>
            </div>

            <div className="rounded-md border border-fuchsia-400/30 bg-fuchsia-400/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> jogada 2026–2027
              </div>
              <div className="text-neutral-100 text-xs leading-snug">{active.play}</div>
            </div>

            <button
              onClick={() => setRevealed(false)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 inline-flex items-center gap-1"
            >
              <EyeOff className="w-3 h-3" /> esconder análise · próximo player
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 rounded-lg border-l-4 border-fuchsia-400/50 bg-white/[0.02] p-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300 mb-1.5 flex items-center gap-1.5">
          <Quote className="w-3 h-3" /> síntese
        </div>
        <p className="text-sm text-neutral-200 leading-snug italic">
          "O Brasil não tem 9 competidores. Tem 3 mercados — wholesale hyperscale, retail interconnection,
          enterprise/governo — e em cada um existem 3–4 competidores reais. O resto é ruído. Saber
          em qual mercado você está define o resto: time, pricing, capex, cliente-âncora, e contra quem
          se prepara para a próxima década."
        </p>
      </div>

      <CrossLink to="tabela" recap="A tabela mestra (card 03) tem todas as 9 dimensões — volte para conferir cada eixo competitivo.">volte à tabela mestra</CrossLink>
      <span className="text-neutral-500"> · </span>
      <CrossLink to="frame" recap="O frame escala × foco (card 02) coloca cada player num quadrante.">volte ao frame escala × foco</CrossLink>
    </Card>
  );
};

/* ============================================================================
   12 — FONTES & DOCUMENTOS
   Card final referenciando todos os documentos consultados. Pasta docs/
   tem o material salvo localmente.
   ========================================================================== */

const FONTES_GROUPS = [
  {
    title: 'Relatórios de mercado',
    items: [
      { label: 'Estudo Mercado de Data Centers no Brasil (TeleSíntese, set/2024 PDF)', href: 'https://telesintese.com.br/wp-content/uploads/2024/09/Data_Center_V_Final.pdf', external: true },
      { label: 'Setor Data Centers no Brasil — Moody\'s Local (abr/2025 PDF)', href: 'https://moodyslocal.com.br/wp-content/uploads/2025/04/3.1_MLBR_Research_DataCenters_01042025_v3-Final.pdf', external: true },
      { label: 'Brazil Data Center Market — Mordor Intelligence (2026)', href: 'https://www.mordorintelligence.com/industry-reports/brazil-data-center-market', external: true },
      { label: 'Brazil Colocation 2025–2029 — Arizton', href: 'https://www.globenewswire.com/news-release/2026/01/07/3214334/0/en/Brazil-Colocation-Data-Center-Portfolio-Analysis-Report-Database-2025-2029.html', external: true },
      { label: 'R$ 500B / stress no sistema elétrico — NeoFeed', href: 'https://neofeed.com.br/negocios/por-tras-dos-aportes-de-r-500-bilhoes-em-data-centers-no-brasil-um-teste-de-estresse-para-o-setor-eletrico/en/', external: true },
      { label: 'Mercado deve dobrar em 3 anos — Oliver Wyman', href: 'https://teletime.com.br/27/10/2025/mercado-de-data-center-deve-dobrar-no-brasil-em-tres-anos-aponta-oliver-wyman/', external: true },
    ],
  },
  {
    title: 'Regulação & política pública',
    items: [
      { label: 'REDATA · MP 1318/2025 (Casa Civil)', href: 'https://www.gov.br/casacivil/pt-br/assuntos/noticias/2025/setembro/governo-federal-edita-mp-para-instituir-regime-especial-de-tributacao-para-servicos-de-datacenter', external: true },
      { label: 'PL 278/26 (REDATA) aprovado — Câmara fev/2026', href: 'https://www.camara.leg.br/noticias/1247282-CAMARA-APROVA-INCENTIVO-FISCAL-PARA-INVESTIMENTOS-EM-CENTROS-DE-PROCESSAMENTO-DE-DADOS', external: true },
      { label: 'Mattos Filho — REDATA primer (legal)', href: 'https://www.mattosfilho.com.br/en/unico/data-center-infrastructure-brazil/', external: true },
    ],
  },
  {
    title: 'Releases por player',
    items: [
      { label: 'Equinix · Newsroom oficial', href: 'https://newsroom.equinix.com/', external: true },
      { label: 'Ascenty · DCD: +30% receita enterprise 2025', href: 'https://www.datacenterdynamics.com/br/notícias/ascenty-cresce-mais-de-30-em-receita-enterprise-em-2025/', external: true },
      { label: 'ODATA / Aligned · Brasil', href: 'https://aligneddc.com/brazil-data-centers/', external: true },
      { label: 'Scala · R$ 6,2B com Tarcísio (SP)', href: 'https://scaladatacenters.com/com-presenca-do-governador-tarcisio-de-freitas-scala-data-centers-inaugura-expansao-do-campus-tambore-com-investimentos-comprometidos-de-r-62-bilhoes-no-estado/', external: true },
      { label: 'Scala AI City RS · R$ 3B inicial', href: 'https://www.estado.rs.gov.br/com-investimento-inicial-de-r-3-bilhoes-governo-do-rs-e-scala-data-centers-assinam-acordo-para-o-maior-projeto-de-infraestrutu', external: true },
      { label: 'Cirion Press · BR', href: 'https://press.ciriontechnologies.com/pt-br/category/brasil/', external: true },
      { label: 'Elea · I Squared compra 67% (DCD)', href: 'https://www.datacenterdynamics.com/br/notícias/elea-data-centers-é-adquirida-pela-i-squared-capital/', external: true },
      { label: 'Elea Petrobras · R$ 2,3B / 17 anos', href: 'https://teletime.com.br/01/10/2025/elea-vence-licitacao-da-petrobras-para-construir-data-center-em-sao-paulo/', external: true },
      { label: 'Tecto · V.tal lança subsidiária US$ 1B', href: 'https://tecto.com/launches_the_tecto_data_centers/', external: true },
      { label: 'Tecto · 200 MW Santana de Parnaíba (DCD)', href: 'https://www.datacenterdynamics.com/en/news/vtals-tecto-to-build-200mw-data-center-in-são-paulo-brazil/', external: true },
      { label: 'Takoda · Tivit spin-off (DCD)', href: 'https://www.datacenterdynamics.com/en/news/brazils-tivit-spins-off-takoda-as-data-center-focused-company/', external: true },
      { label: 'CloudHQ · institucional', href: 'https://cloudhq.com/', external: true },
    ],
  },
  {
    title: 'Hyperscalers no Brasil',
    items: [
      { label: 'AWS · R$ 10,1B até 2034 (oficial)', href: 'https://www.aboutamazon.com.br/noticias/aws/aws-investira-mais-de-r10-bilhoes-para-expandir-infraestrutura-no-brasil', external: true },
      { label: 'DCD · Principais projetos DC 2025', href: 'https://www.datacenterdynamics.com/br/análises/os-principais-projetos-de-data-centers-em-2025/', external: true },
    ],
  },
  {
    title: 'Imprensa especializada (continuous reading)',
    items: [
      { label: 'Datacenter Dynamics LATAM', href: 'https://www.datacenterdynamics.com/br/', external: true },
      { label: 'TeleSíntese', href: 'https://telesintese.com.br/', external: true },
      { label: 'Convergência Digital', href: 'https://convergenciadigital.com.br/', external: true },
      { label: 'TeleTime', href: 'https://teletime.com.br/', external: true },
      { label: 'Mobile Time', href: 'https://www.mobiletime.com.br/', external: true },
      { label: 'BNamericas (paywall)', href: 'https://www.bnamericas.com/', external: true },
    ],
  },
];

const FontesCard = () => (
  <Card id="fontes" icon={FileText} title="Fontes & documentos · base da pesquisa"
        accent="emerald" index={13}
        subtitle="Tudo que sustenta este explainer. Os relatórios PDF e releases oficiais foram consultados em abr/2026; cópias salvas localmente em data-centers-br/docs/.">

    <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-3 text-[12px] text-neutral-200 leading-snug">
      <div className="flex items-baseline gap-2 mb-1.5">
        <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">arquivos locais</span>
      </div>
      Pasta <code className="text-[11px] bg-white/5 px-1 py-0.5 rounded font-mono text-emerald-200">data-centers-br/docs/</code> contém:
      <ul className="mt-2 space-y-1 ml-2 text-[12px]">
        <li className="flex items-start gap-1.5"><FileText className="w-3 h-3 mt-[3px] text-emerald-300 shrink-0" /><span><code className="text-[11px] font-mono">research-consolidado.md</code> — pesquisa completa por player + mercado, com todas as URLs</span></li>
        <li className="flex items-start gap-1.5"><FileText className="w-3 h-3 mt-[3px] text-emerald-300 shrink-0" /><span><code className="text-[11px] font-mono">fontes-chave.md</code> — curadoria de relatórios, releases e regulação organizados por categoria</span></li>
      </ul>
    </div>

    <NextSteps groups={FONTES_GROUPS} />

    <Deeper>
      <p>
        <strong>O que NÃO conseguimos confirmar publicamente</strong> e ficou em estimativa de mercado:
        receita BR específica de Scala/Elea/Cirion (todas privadas, números são triangulação de mercado);
        valuation atual da Scala pós-CPPIB; capacidade exata operacional de Takoda (Tivit não divulga
        MW por DC); valor da transação ODATA → Aligned em 2024; ticket médio enterprise da Cirion.
      </p>
      <p>
        <strong>Atualização recomendada</strong>: este explainer é uma foto de abr/2026. Em 6 meses
        Tecto/V.tal deve ter SP 200 MW saindo do papel; CloudHQ deve ter anunciado âncora; o REDATA
        deve estar regulamentado em decreto operacional. Sugerimos refazer a tabela mestra a cada 6
        meses — DCD LATAM e TeleSíntese cobrem os anúncios que mais movem números.
      </p>
    </Deeper>
  </Card>
);

/* ============================================================================
   13 — NEXT TRAILS
   ========================================================================== */

const TrailsCard = () => (
  <Card id="trails" icon={Compass} title="Próximas trilhas" accent="violet" index={14}
        subtitle="Por onde seguir, dependendo de qual ângulo você quer aprofundar.">
    <NextSteps groups={[
      {
        title: 'Trilhas internas',
        note: 'outros explainers do repo que conversam',
        items: [
          { label: 'Data Centers · v1', href: '/#data-centers',
            note: 'A física por trás de todo DC: energia, refrigeração, redundância, NUMA, fabric. Esse explainer trata de "quem"; o v1 trata do "como".' },
          { label: 'Data Centers · v2', href: '/#data-centers-v2',
            note: 'Mesmo conteúdo do v1 reformatado para throughput pedagógico — predict + reveal, Q&A, misconception boxes.' },
          { label: 'Tributação Brasil · empresas', href: '/#tributacao-brasil',
            note: 'O caso "DC: locação vs serviço" no contexto da reforma 2026–2033. Casa naturalmente com o REDATA aqui.' },
          { label: 'The World Economy', href: '/#world-economy',
            note: 'Para enxergar a posição BR no fluxo global de capital (Brookfield, DigitalBridge, I Squared etc.) e GDP regional.' },
        ],
      },
      {
        title: 'Aprofundar dentro do tema',
        items: [
          { label: 'Acompanhar mensalmente', note: 'Datacenter Dynamics LATAM + TeleSíntese + Convergência Digital cobrem todos os anúncios com latência ~24h.' },
          { label: 'Modelo financeiro por player', note: 'Construir um modelo de cash flow simplificado para um campus de 100 MW (capex US$ 700M, occupancy ramp 18m, EBITDA 50%, payback ~6 anos).' },
          { label: 'Pipeline real vs anunciado', note: 'Manter um spreadsheet com data anunciada × data energizada × data online. Histórico mostra ~50% chega no prazo.' },
        ],
      },
      {
        title: 'Zoom out',
        items: [
          { label: 'AI capacity crunch global', note: 'O que está acontecendo no BR é uma versão regional do ramp 2024–2026 mundial. Stargate (US), Project IndiAI, Saudi PIF DCs, Nordics.' },
          { label: 'O sistema elétrico aguenta?', note: 'O ponto cego nos anúncios de pipeline. SIN brasileiro tem folga térmica/hídrica média, mas a CTEEP/ANEEL viraram gargalo de subestação dedicada.' },
          { label: 'Soberania digital + LGPD', note: 'A geografia BR distribuída (Elea em 9 cidades, governo BSB) é em parte resposta regulatória, não escolha técnica.' },
        ],
      },
    ]} />
  </Card>
);

const QuadrantTile = ({ q, focus, setFocus }) => {
  const isOn = focus?.key === q.key;
  return (
    <button
      onClick={() => setFocus(isOn ? null : q)}
      className={`text-left rounded-lg border p-3 transition-all ${
        isOn
          ? `${chipPalette[q.color].split(' ')[2]} bg-white/[0.04] ring-1 ring-${q.color}-400/30`
          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <div className={`text-[11px] uppercase tracking-[0.18em] mb-1 ${chipPalette[q.color].split(' ')[1]}`}>{q.title}</div>
      <div className="text-[10px] text-neutral-500 leading-snug">{q.sub}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {q.players.map(pid => {
          const p = PLAYER_BY_ID[pid];
          return <Chip key={pid} color={p.color}>{p.short}</Chip>;
        })}
      </div>
    </button>
  );
};

/* ============================================================================
   DEFAULT EXPORT
   ========================================================================== */

export default function DataCentersBrExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <Hero />
      <SectionNav />
      <main className="relative max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <MercadoCard />
        <FrameCard />
        <TabelaMestraCard />
        <CapacidadeCard />
        <GeografiaCard />
        <CapitalCard />
        <FinanceiroCard />
        <EstrategiaCard />
        <ClientesCard />
        <DiferenciaisCard />
        <MnACard />
        <PosicionamentoCard />
        <FontesCard />
        <TrailsCard />
      </main>
      <footer className="border-t border-white/5 mt-16 py-12 text-center text-[11px] text-neutral-500">
        Mapa Competitivo · Data Centers BR · 2026
      </footer>
    </div>
  );
}
