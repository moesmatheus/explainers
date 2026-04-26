import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Landmark, Scale, Factory, Cloud, Building2, MapPin, Zap, Receipt,
  Users, Calculator, Server, Network, Compass, ChevronDown, FlaskConical,
  Lightbulb, Eye, EyeOff, Link2, HelpCircle, AlertTriangle, CheckCircle2,
  XCircle, Ruler, TrendingUp, Flag, Globe2, FileText, Coins, ArrowRight,
  Handshake, Percent, PiggyBank, Briefcase, Package, Banknote, Gavel,
  Sparkles, GitBranch, Split,
} from 'lucide-react';

/* ============================================================================
   Tributação no Brasil — um panorama com foco em empresas (e data centers)
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',   // amber — números
  '\\hi':  '\\textcolor{##fb7185}{#1}',   // rose — destaque
  '\\co':  '\\textcolor{##7dd3fc}{#1}',   // sky — consumo
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',   // emerald — "verde" (crédito/ganho)
  '\\vi':  '\\textcolor{##c4b5fd}{#1}',   // violet — fórmula/variável
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

// --- formatters -------------------------------------------------------------

const brl = (v, opts = {}) => {
  const { compact = false } = opts;
  if (compact) {
    if (Math.abs(v) >= 1_000_000_000) return 'R$ ' + (v / 1_000_000_000).toFixed(1) + ' bi';
    if (Math.abs(v) >= 1_000_000) return 'R$ ' + (v / 1_000_000).toFixed(1) + ' M';
    if (Math.abs(v) >= 1_000) return 'R$ ' + (v / 1_000).toFixed(1) + ' k';
    return 'R$ ' + v.toFixed(0);
  }
  return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
};

const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';

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
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">mais fundo</span>
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

// --- Floating tooltip (portal, edge-aware) ---------------------------------

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

// --- Glossary + Term (hover-to-define) -------------------------------------

const GLOSS = {
  'ICMS': 'Imposto sobre Circulação de Mercadorias e Serviços — estadual, não-cumulativo, incide sobre venda de mercadorias, energia elétrica, comunicação e transporte interestadual. Alíquota cheia 17–20% conforme o estado. Extingue em 2033.',
  'ISS': 'Imposto Sobre Serviços de qualquer natureza — municipal, 2% a 5%, incide sobre os serviços listados na Lei Complementar 116/2003. Extingue em 2033.',
  'IPI': 'Imposto sobre Produtos Industrializados — federal, seletivo (mais alto em produtos "supérfluos"), incide sobre a saída do estabelecimento industrial. Tabela TIPI.',
  'PIS': 'Programa de Integração Social — contribuição federal sobre a receita. 0,65% cumulativo (Presumido) ou 1,65% não-cumulativo (Real, com direito a crédito).',
  'COFINS': 'Contribuição para Financiamento da Seguridade Social — federal sobre a receita. 3% cumulativo ou 7,6% não-cumulativo. Somada ao PIS: 3,65% ou 9,25%.',
  'PIS/COFINS': 'As duas contribuições federais sobre receita. Somam 3,65% no cumulativo (Presumido, sem crédito) ou 9,25% no não-cumulativo (Real, com direito a crédito sobre insumos).',
  'IRPJ': 'Imposto de Renda da Pessoa Jurídica — federal, 15% sobre o lucro + adicional de 10% sobre o que exceder R$ 20 mil por mês (R$ 240 mil por ano).',
  'CSLL': 'Contribuição Social sobre o Lucro Líquido — federal, 9% sobre o lucro. Somada ao IRPJ dá 34% na alíquota-teto do Lucro Real.',
  'INSS patronal': 'Contribuição previdenciária do empregador — 20% sobre a folha de salários. Soma RAT (1–3%) + Terceiros (Sistema S, ~5,8%).',
  'FGTS': 'Fundo de Garantia do Tempo de Serviço — 8% sobre a folha, depositado em conta vinculada do empregado.',
  'Simples Nacional': 'Regime unificado para pequenas empresas. Receita bruta anual até R$ 4,8 milhões. Alíquotas progressivas por faixa (Anexos I–V), recolhimento em guia única (DAS).',
  'Lucro Presumido': 'Regime opcional para receita até R$ 78 milhões/ano. A base do IRPJ/CSLL é uma presunção fixa sobre a receita (32% para serviços, 8% para comércio, 1,6% para revenda de combustíveis). PIS/COFINS são cumulativos (3,65%).',
  'Lucro Real': 'Regime obrigatório acima de R$ 78M ou para certas atividades (bancos, seguradoras). Tributa o lucro contábil efetivo. PIS/COFINS não-cumulativos (9,25%, com crédito).',
  'não-cumulatividade': 'Direito de abater da tributação o valor já pago nas etapas anteriores da cadeia. Aplica-se a PIS/COFINS no Real, ICMS, IPI — e, na reforma, a CBS/IBS em forma plena.',
  'cumulativo': 'Sistema sem direito a crédito: o tributo incide em cada etapa sobre o valor cheio, sem descontar o que já foi pago antes. É o caso de PIS/COFINS no Lucro Presumido.',
  'substituição tributária': 'Mecanismo do ICMS em que o fabricante/importador recolhe antecipadamente o imposto devido por toda a cadeia até o consumidor. Comum em bebidas, combustíveis, autopeças, eletrônicos.',
  'ICMS-ST': 'ICMS-Substituição Tributária — o fabricante/importador recolhe antecipadamente o ICMS que seria devido em todas as etapas seguintes. Bom para fisco (arrecada cedo), ruim para fluxo de caixa de quem compra.',
  'Fator R': 'Regra do Simples: se a folha de pagamento (+ pró-labore) dos últimos 12 meses for maior ou igual a 28% da receita, a empresa de serviços usa o Anexo III (alíquotas menores); senão, Anexo V (mais pesado).',
  'Súmula Vinculante 31': 'Entendimento vinculante do STF (2010): "É inconstitucional a incidência do ISS sobre operações de locação de bens móveis". Protege contratos de aluguel puro de rack/equipamento da tributação municipal.',
  'obrigação de dar': 'No direito civil, a obrigação em que o devedor entrega uma coisa — inclusive cedê-la em uso (locação). O STF usou essa categoria para excluir locação da lista de "serviços" tributáveis.',
  'obrigação de fazer': 'Obrigação em que o devedor presta uma atividade (serviço). É sobre essa categoria que o ISS incide — e é o cerne da disputa "locação vs serviço" em data centers.',
  'base de cálculo': 'O valor sobre o qual se aplica a alíquota. No Presumido, é uma fração presumida da receita; no Real, é o lucro efetivo; no ICMS, é o valor da operação.',
  'alíquota efetiva': 'Percentual do tributo sobre a receita final, depois de todos os ajustes (bases, créditos, adicionais). Métrica mais útil que a alíquota nominal para comparar regimes.',
  'CBS': 'Contribuição sobre Bens e Serviços — novo tributo federal da reforma. Substitui PIS + COFINS. Não-cumulatividade plena. Entra plena em 2027.',
  'IBS': 'Imposto sobre Bens e Serviços — novo tributo estadual+municipal da reforma. Substitui ICMS + ISS. Cobrado no destino. Substitui totalmente ICMS/ISS em 2033.',
  'IS': 'Imposto Seletivo — novo tributo federal sobre bens "prejudiciais à saúde ou ao meio ambiente" (tabaco, álcool, bebidas açucaradas, veículos, minérios extraídos, etc.). Entra em 2027.',
  'split payment': 'Mecanismo de recolhimento automático: quando o cliente paga a fatura, a parcela correspondente à CBS/IBS é segregada e enviada direto para o fisco, sem passar pelo caixa do fornecedor.',
  'Ex-Tarifário': 'Redução temporária do Imposto de Importação (de 14–16% para 0–2%) em bens de capital sem similar nacional. Concedida por resolução da CAMEX/Gecex.',
  'RECAP': 'Regime Especial de Aquisição de Bens de Capital para Empresas Preponderantemente Exportadoras — suspende PIS/COFINS na compra de máquinas/equipamentos para quem tem ≥50% da receita em exportação.',
  'Lei do Bem': 'Lei 11.196/2005 — principal incentivo federal a P&D. Permite deduzir na base do IRPJ/CSLL 60% a 100% dos gastos com inovação tecnológica. Exige Lucro Real.',
  'ACL': 'Ambiente de Contratação Livre — mercado livre de energia. Consumidores acima de 500 kW (ou menos, em 2024+) podem comprar direto de geradoras em contratos bilaterais, reduzindo custo e tendo tratamento fiscal específico de ICMS.',
  'colocation': 'Serviço em que o data center aluga espaço de rack, energia e refrigeração — o cliente traz seus próprios servidores. É o arranjo comercial no centro do debate "locação vs serviço".',
  'LC 116/2003': 'Lei Complementar 116 — define a lista nacional dos serviços sujeitos a ISS, os limites de alíquota (2–5%) e a competência municipal. Foi alterada pela LC 157/2016 e LC 175/2020.',
  'LC 214/2025': 'Lei Complementar que regulamentou a Reforma Tributária (EC 132/2023). Detalha CBS, IBS, IS, regras de transição, créditos e split payment.',
  'EC 132/2023': 'Emenda Constitucional 132/2023 — a reforma tributária sobre o consumo. Criou CBS, IBS e IS, e estabeleceu o cronograma de transição 2026–2033.',
  'REIDI': 'Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura — suspende PIS/COFINS na compra de bens e serviços para projetos de infraestrutura aprovados (energia, transporte, saneamento). Debate se data centers entram.',
  'guerra fiscal': 'Prática dos entes (estados ou municípios) de oferecer renúncias fiscais para atrair empresas. No ISS, o teto é 2% e municípios como Barueri/Poá usam esse piso para atrair sedes de serviço.',
  'pró-labore': 'Remuneração paga ao sócio que trabalha na empresa. Sobre ele incide INSS e IRRF. Diferente da distribuição de lucros, que é isenta.',
  'distribuição de lucros': 'Pagamento ao sócio a título de participação no resultado. Hoje isenta de IR na pessoa física. Em discussão voltar a ser tributada.',
  'TIPI': 'Tabela de Incidência do IPI — lista milhares de produtos com suas alíquotas. Segue a Nomenclatura Comum do Mercosul (NCM).',
  'IOF': 'Imposto sobre Operações Financeiras — federal, sobre crédito, câmbio, seguro e títulos. Para empresa, relevante em empréstimos (IOF-crédito) e câmbio (IOF-câmbio em importação).',
  'ITCMD': 'Imposto sobre Transmissão Causa Mortis e Doação — estadual, sobre heranças e doações. 4–8% conforme o estado.',
  'IPTU': 'Imposto Predial e Territorial Urbano — municipal, sobre imóveis urbanos.',
  'ITBI': 'Imposto sobre Transmissão de Bens Imóveis inter vivos — municipal, sobre compra/venda de imóveis. 2–3% conforme o município.',
  'CPRB': 'Contribuição Previdenciária sobre a Receita Bruta — alternativa à contribuição de 20% sobre a folha (INSS patronal). Originalmente "desoneração da folha" de 2011. Foi reaberta pela Lei 14.973/2024 para alguns setores, em desligamento gradual até 2027.',
  'Tema 745': 'Julgamento do STF (2021) que declarou inconstitucional ICMS de energia elétrica e telecomunicações em alíquota superior à alíquota modal do estado. Obrigou os estados a baixar ICMS-energia de 25–30% para 17–18%.',
  'SPED': 'Sistema Público de Escrituração Digital — conjunto de obrigações acessórias digitais (NF-e, EFD, ECF, eSocial). Infraestrutura do fisco brasileiro.',
  'NF-e': 'Nota Fiscal eletrônica — documento fiscal digital que substitui a nota em papel. Obrigatória para a maioria das operações com mercadorias.',
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
        width={360}
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

// --- Pedagogy primitives -----------------------------------------------------

const MinSchema = ({ children }) => (
  <div className="mt-2 mb-4 rounded-md border border-sky-400/25 bg-sky-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
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

const Grounding = ({ children }) => (
  <span className="inline-flex items-baseline gap-1 rounded-sm border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0 text-[11px] text-emerald-200 align-baseline">
    <span className="text-[9px] uppercase tracking-wider text-emerald-400">≈</span>
    {children}
  </span>
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
          width={320}
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

const Worked = ({ title = 'exemplo numérico', children }) => (
  <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Calculator className="w-3.5 h-3.5 text-sky-300" />
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
                      {!isLink && <span className="text-[9px] uppercase tracking-wider text-neutral-600">buscar em outro lugar</span>}
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
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.x}%`} cy={`${p.y}%`} r="1.2"
          fill="#6ee7b7"
          initial={{ opacity: 0 }}
          animate={{ cx: [`${p.x}%`, `${(p.x + 35) % 100}%`], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.25, ease: 'linear' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-sky-500/5 to-transparent" />
    <FlowField />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <Landmark className="w-3.5 h-3.5" /> tributação · empresas · 2026
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-emerald-100 to-sky-200 bg-clip-text text-transparent">
          Sistema tributário brasileiro
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          Como o Brasil tributa uma empresa — das três esferas e dos três regimes à grande reforma de 2026–2033. Com um fio condutor: um <span className="text-sky-300 font-mono">data center de colocation</span> e o dilema{' '}
          <span className="text-amber-300 font-mono">locação vs serviço</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">tributos</span>
          <span className="text-emerald-300">regimes</span>
          <span className="text-amber-300">reforma</span>
          <span className="text-fuchsia-300">data center</span>
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
  { id: 'panorama',     label: 'Panorama',              icon: Scale },
  { id: 'bolo',         label: 'A carga tributária',    icon: PiggyBank },
  { id: 'mapa',         label: 'Mapa federativo',       icon: MapPin },
  { id: 'icms',         label: 'ICMS',                  icon: Zap },
  { id: 'iss',          label: 'ISS',                   icon: Building2 },
  { id: 'pis-cofins',   label: 'PIS / COFINS',          icon: Receipt },
  { id: 'irpj',         label: 'IRPJ + CSLL',           icon: Coins },
  { id: 'folha',        label: 'Folha',                 icon: Users },
  { id: 'regimes',      label: 'Os 3 regimes',          icon: Calculator },
  { id: 'dc-loc-serv',  label: 'Locação vs serviço',    icon: Split },
  { id: 'dc-alavancas', label: 'Alavancas do DC',       icon: Sparkles },
  { id: 'reforma',      label: 'Reforma 2026–2033',     icon: GitBranch },
  { id: 'pos-reforma',  label: 'DC pós-reforma',        icon: TrendingUp },
  { id: 'trails',       label: 'Próximas trilhas',      icon: Compass },
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
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1.5 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'border-transparent text-neutral-400'}`}>
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
   CARD STUBS — filled in subsequent edits
   ============================================================================ */

const Panorama = () => {
  const [hover, setHover] = useState(null);
  // 3 esferas (rows) × 3 bases (cols)
  // Pre-resolved Tailwind classes (JIT needs literals)
  const palette = {
    emerald: {
      head: 'text-emerald-300',
      chip: 'text-emerald-200 bg-emerald-500/10',
      activeBg: 'bg-emerald-500/15',
      activeBorder: 'border-emerald-400/40',
    },
    amber: {
      head: 'text-amber-300',
      chip: 'text-amber-200 bg-amber-500/10',
      activeBg: 'bg-amber-500/15',
      activeBorder: 'border-amber-400/40',
    },
    fuchsia: {
      head: 'text-fuchsia-300',
      chip: 'text-fuchsia-200 bg-fuchsia-500/10',
      activeBg: 'bg-fuchsia-500/15',
      activeBorder: 'border-fuchsia-400/40',
    },
  };
  const esferas = [
    { key: 'U', label: 'União', color: 'emerald', sub: 'federal' },
    { key: 'E', label: 'Estados', color: 'amber', sub: '26 + DF' },
    { key: 'M', label: 'Municípios', color: 'fuchsia', sub: '5.570' },
  ];
  const bases = [
    { key: 'C', label: 'Consumo', hint: 'o que circula' },
    { key: 'R', label: 'Renda / Lucro', hint: 'o que se ganha' },
    { key: 'P', label: 'Patrimônio / Folha', hint: 'o que se tem / paga' },
  ];
  const matrix = {
    'U-C': ['IPI', 'PIS', 'COFINS', 'II'],
    'U-R': ['IRPJ', 'CSLL'],
    'U-P': ['INSS patronal', 'FGTS', 'IOF'],
    'E-C': ['ICMS'],
    'E-R': ['—'],
    'E-P': ['IPVA', 'ITCMD'],
    'M-C': ['ISS'],
    'M-R': ['—'],
    'M-P': ['IPTU', 'ITBI'],
  };
  return (
    <Card id="panorama" icon={Scale} title="Panorama" subtitle="3 esferas × 3 bases — um mapa mental" accent="emerald" index={1}>
      <MinSchema>
        O sistema tributário brasileiro é um emaranhado de ~90 tributos, mas cabe em uma matriz 3×3:
        quem cobra (<b className="text-emerald-300">União</b> · <b className="text-amber-300">Estado</b> · <b className="text-fuchsia-300">Município</b>)
        × sobre o que (<b>Consumo</b> · <b>Renda</b> · <b>Patrimônio/Folha</b>). Toda a complexidade restante é <i>dentro</i> de cada célula.
      </MinSchema>

      <p>
        A Constituição é ciumenta: cada ente só pode tributar as bases que o art. 145–162 lhe atribui.
        <Term>ICMS</Term> é dos estados; <Term>ISS</Term> é dos municípios; <Term>IRPJ</Term> e <Term>CSLL</Term> são da União.
        A sobreposição — e o atrito quando bases se encavalam — é o que gera disputa judicial e conflito federativo.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 mt-1">
        <div className="grid grid-cols-[110px_1fr_1fr_1fr] gap-2 text-xs">
          <div />
          {bases.map((b) => (
            <div key={b.key} className="text-center">
              <div className="font-semibold text-neutral-200">{b.label}</div>
              <div className="text-[10px] text-neutral-500">{b.hint}</div>
            </div>
          ))}
          {esferas.map((e) => (
            <React.Fragment key={e.key}>
              <div className="flex flex-col justify-center items-end pr-2">
                <div className={`font-semibold ${palette[e.color].head}`}>{e.label}</div>
                <div className="text-[10px] text-neutral-500">{e.sub}</div>
              </div>
              {bases.map((b) => {
                const cell = `${e.key}-${b.key}`;
                const items = matrix[cell];
                const active = hover === cell;
                const p = palette[e.color];
                return (
                  <div
                    key={cell}
                    onMouseEnter={() => setHover(cell)}
                    onMouseLeave={() => setHover(null)}
                    className={`rounded-lg p-2 text-center transition-colors border ${active ? `${p.activeBg} ${p.activeBorder}` : 'bg-white/5 border-white/10'}`}
                  >
                    <div className="flex flex-wrap justify-center gap-1">
                      {items.map((t) => (
                        <span
                          key={t}
                          className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${t === '—' ? 'text-neutral-600' : p.chip}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p>
        Note duas assimetrias relevantes: (i) <b>Estados e Municípios não tributam renda</b> — só a União —, o que concentra a disputa
        federativa no consumo (ICMS vs ISS); (ii) <b>consumo pesa muito mais que renda</b> na arrecadação total (~50% vs ~20%),
        efeito regressivo conhecido do sistema brasileiro.
      </p>

      <Deeper>
        A matriz acima ignora a <i>terceira dimensão</i>: o <b>regime</b> de apuração — Simples Nacional, Lucro Presumido, Lucro Real —
        que redefine alíquotas e créditos para quase todos os tributos federais da empresa. Por isso "3 esferas × 3 bases × 3 regimes".
        A Reforma Tributária não mexe nas esferas (cada ente ainda arrecada sua parte via comitê gestor) nem nas bases (segue sobre consumo),
        mas <b>unifica cinco tributos de consumo em dois</b> (<Term>CBS</Term> + <Term>IBS</Term>) e migra a tributação
        da <b>origem</b> para o <b>destino</b> — o que redesenha completamente a "guerra fiscal" que você conhece.
      </Deeper>

      <CrossLink to="bolo" recap="a seguir">
        A matriz acima diz <i>quem cobra</i>. O próximo card mostra <i>quanto</i> cai no seu preço, em 3 setores bem diferentes.
      </CrossLink>
    </Card>
  );
};

const Bolo = () => {
  // Where R$100 of revenue goes. Order-of-magnitude figures for a Lucro Real
  // company, pre-reforma. Rough but defensible.
  const setores = [
    {
      key: 'saas',
      label: 'SaaS · Lucro Real',
      note: 'São Paulo · 30% margem bruta',
      items: [
        { k: 'iss', label: 'ISS', v: 2.9, color: 'bg-fuchsia-500/80' },
        { k: 'pc', label: 'PIS/COFINS', v: 9.25, color: 'bg-sky-500/80' },
        { k: 'ircs', label: 'IRPJ+CSLL', v: 8.5, color: 'bg-emerald-500/80' },
        { k: 'folha', label: 'Encargos folha', v: 10.5, color: 'bg-rose-500/80' },
        { k: 'resto', label: 'Sobra (margem + custos s/ tributo)', v: 68.85, color: 'bg-neutral-600/70' },
      ],
    },
    {
      key: 'ind',
      label: 'Indústria · Lucro Real',
      note: 'SP → cliente SP · não-exportadora',
      items: [
        { k: 'icms', label: 'ICMS (líq. crédito)', v: 10, color: 'bg-amber-500/80' },
        { k: 'ipi', label: 'IPI (líq.)', v: 4, color: 'bg-orange-500/80' },
        { k: 'pc', label: 'PIS/COFINS (líq.)', v: 6.5, color: 'bg-sky-500/80' },
        { k: 'ircs', label: 'IRPJ+CSLL', v: 5, color: 'bg-emerald-500/80' },
        { k: 'folha', label: 'Encargos folha', v: 8, color: 'bg-rose-500/80' },
        { k: 'resto', label: 'Sobra', v: 66.5, color: 'bg-neutral-600/70' },
      ],
    },
    {
      key: 'dc',
      label: 'Data center · Lucro Real',
      note: 'colocation, dúvida: ISS ou locação?',
      items: [
        { k: 'iss', label: 'ISS (se caracterizado como serviço)', v: 4.6, color: 'bg-fuchsia-500/80' },
        { k: 'icms', label: 'ICMS-energia (50% do custo!)', v: 12, color: 'bg-amber-500/80' },
        { k: 'pc', label: 'PIS/COFINS', v: 7.5, color: 'bg-sky-500/80' },
        { k: 'ircs', label: 'IRPJ+CSLL', v: 6, color: 'bg-emerald-500/80' },
        { k: 'folha', label: 'Encargos folha', v: 3.5, color: 'bg-rose-500/80' },
        { k: 'resto', label: 'Sobra', v: 66.4, color: 'bg-neutral-600/70' },
      ],
    },
  ];

  return (
    <Card id="bolo" icon={PiggyBank} title="A carga, por setor" subtitle="Onde vai cada R$ 100 de receita" accent="sky" index={2}>
      <Predict question="Qual dos três paga mais imposto sobre a receita: SaaS, Indústria ou Data Center?">
        <p>
          A resposta mais comum é <b>Indústria</b> — e está errada. Na ponta (alíquota efetiva sobre receita),
          <b> SaaS paga mais</b> (~31% em Lucro Real, porque PIS/COFINS é não-cumulativo sobre base cheia e ele tem <i>pouquíssimo crédito</i>).
          Indústria chega a parecer similar (~33%), mas grande parte dela é recuperada em créditos de ICMS e IPI na cadeia.
          Data center fica no meio (~33%), com um twist: metade do "imposto" não é nominal, é o <b>ICMS embutido na conta de luz</b>.
        </p>
      </Predict>

      <div className="space-y-4 mt-2">
        {setores.map((s) => {
          const tributo = s.items.filter((i) => i.k !== 'resto').reduce((a, i) => a + i.v, 0);
          return (
            <div key={s.key} className="rounded-xl border border-white/10 bg-neutral-900/60 p-3">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-neutral-100">{s.label}</div>
                  <div className="text-[11px] text-neutral-500">{s.note}</div>
                </div>
                <div className="text-xs font-mono text-sky-300">{tributo.toFixed(1)}% tributos / receita</div>
              </div>
              <div className="h-6 w-full flex rounded-md overflow-hidden border border-white/5">
                {s.items.map((i) => (
                  <div
                    key={i.k}
                    className={`${i.color} h-full flex items-center justify-center`}
                    style={{ width: `${i.v}%` }}
                    title={`${i.label} — ${i.v}%`}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                {s.items.filter((i) => i.k !== 'resto').map((i) => (
                  <div key={i.k} className="inline-flex items-center gap-1 text-neutral-300">
                    <span className={`${i.color} inline-block w-2.5 h-2.5 rounded-sm`} />
                    {i.label} · <span className="font-mono text-neutral-400">{i.v}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Grounding>
        Totais não são aditivos direto com a alíquota contábil porque muitos tributos têm crédito (o número acima já é líquido).
        Ordem de grandeza para um ano típico; mudam com regime, município, estado e perfil de crédito.
      </Grounding>

      <p>
        A lição do gráfico não é o total. É a <b>composição</b>. Em SaaS o peso se concentra em <Term>PIS/COFINS</Term> e <Term>IRPJ</Term>+<Term>CSLL</Term>.
        Na indústria, em <Term>ICMS</Term> e <Term>IPI</Term>. Num <b>data center</b>, o item mais pesado <i>nem é tributo direto da empresa</i> —
        é o <Term>Tema 745</Term> aplicado à energia: o ICMS embutido na tarifa pode chegar a 18% sobre ~50% do custo do serviço.
        Muda a energia, muda a margem.
      </p>

      <Deeper>
        Por que SaaS é tributariamente caro no Brasil? Porque <b>PIS/COFINS não-cumulativo</b> (Real) tem alíquota cheia de 9,25%,
        mas empresa de software tem <b>pouco insumo tributado a abater</b> (salário, pró-labore e aluguel não geram crédito).
        No <Term>Lucro Presumido</Term>, PIS/COFINS caem para 3,65% mas a base do IRPJ/CSLL sobe a presunção de 32% — e paga-se imposto sobre lucro presumido,
        não efetivo. Um dos maiores arrependimentos de founders em crescimento é não ter migrado de Presumido para Real no momento em que a margem efetiva caiu abaixo de 32%.
      </Deeper>

      <CrossLink to="dc-loc-serv" recap="card ★">
        O caso do data center merece um card próprio — a caracterização de <i>locação</i> vs <i>serviço</i> muda ~5% da receita.
      </CrossLink>
    </Card>
  );
};

const MapaFederativo = () => {
  const Tier = ({ title, color, bar, share, items }) => (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
      <div className="flex items-baseline justify-between mb-1">
        <div className={`text-sm font-semibold ${color}`}>{title}</div>
        <div className="text-[11px] text-neutral-500 font-mono">{share}</div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded">
        <div className={`h-full rounded ${bar}`} style={{ width: share }} />
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i.t} className="flex items-start gap-2">
            <span className="mt-0.5 text-neutral-500">·</span>
            <span>
              <b className="text-neutral-200 font-mono text-[12px]">{i.t}</b>
              <span className="text-neutral-400"> — {i.d}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Card id="mapa" icon={MapPin} title="Mapa federativo" subtitle="Quem cobra o quê, e por quê importa" accent="violet" index={3}>
      <p>
        Cada tributo pertence a <i>um único</i> ente da federação. Isso define quem você briga judicialmente,
        para onde o dinheiro vai, e — crucial — <b>onde sua empresa deve instalar a sede para pagar menos</b>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        <Tier
          title="União (federal)"
          color="text-emerald-300"
          bar="bg-emerald-500/70"
          share="68%"
          items={[
            { t: 'IRPJ + CSLL', d: 'lucro da empresa' },
            { t: 'PIS + COFINS', d: 'receita' },
            { t: 'IPI', d: 'saída de produto industrializado' },
            { t: 'II', d: 'importação' },
            { t: 'INSS patronal + FGTS', d: 'folha' },
            { t: 'IOF', d: 'operações financeiras' },
          ]}
        />
        <Tier
          title="Estados (26 + DF)"
          color="text-amber-300"
          bar="bg-amber-500/70"
          share="25%"
          items={[
            { t: 'ICMS', d: 'circulação de mercadoria, energia, comunicação, transporte interestadual' },
            { t: 'IPVA', d: 'veículos' },
            { t: 'ITCMD', d: 'herança e doação' },
          ]}
        />
        <Tier
          title="Municípios (5.570)"
          color="text-fuchsia-300"
          bar="bg-fuchsia-500/70"
          share="7%"
          items={[
            { t: 'ISS', d: 'serviços listados na LC 116' },
            { t: 'IPTU', d: 'imóveis urbanos' },
            { t: 'ITBI', d: 'compra e venda de imóvel' },
          ]}
        />
      </div>

      <Misconception
        wrong="Se minha sede é em SP, eu pago ISS em SP."
        right="Em regra sim, mas há exceções que colocam o fato gerador no município do tomador (construção civil, vigilância, leasing, cartão, planos de saúde — LC 116, art. 3º). E há municípios — Barueri, Poá, Santana de Parnaíba — que disputam sua sede oferecendo o piso constitucional de 2%."
        because="O ISS é o tributo mais 'escolhível' geograficamente. Montar sede jurídica num município com alíquota de 2% em vez de 5% em uma empresa de R$ 50 M de receita vale R$ 1,5 M/ano. É legal; é o que quase toda agência, software house e consultoria de médio porte faz."
      />

      <Deeper>
        A "fatia" do bolo acima é arrecadação <i>primária</i>, antes das transferências constitucionais.
        A União arrecada ~68% mas repassa ~23 pontos aos estados e municípios via FPE/FPM (fundo de participação), e alguns
        estados ricos (SP, RJ, MG) são credores líquidos enquanto os do Norte/Nordeste são receptores. Isso explica por que
        na reforma tributária o <b>rateio do IBS</b> (novo ICMS+ISS) virou uma negociação tão política —
        o dinheiro agora migra do <i>estado de produção</i> para o <i>estado de consumo</i>, e alguns estados perdem caixa no dia 1.
      </Deeper>

      <CrossLink to="icms" recap="a seguir, coluna por coluna">
        Começamos pelo mais pesado e mais temido — o ICMS, onde a guerra fiscal ainda acontece.
      </CrossLink>
    </Card>
  );
};

const ICMSCard = () => {
  // Cumulative vs non-cumulative demo for a 3-stage chain
  const [cum, setCum] = useState(false);
  const aliq = 0.18;
  const preco1 = 100;
  const preco2 = 150;
  const preco3 = 220;
  const icms1 = preco1 * aliq;
  const icms2 = preco2 * aliq - (cum ? 0 : icms1);
  const icms3 = preco3 * aliq - (cum ? 0 : (preco2 * aliq));
  const totalIcms = icms1 + Math.max(icms2, 0) + Math.max(icms3, 0);
  const effective = totalIcms / preco3;
  return (
    <Card id="icms" icon={Zap} title="ICMS" subtitle="Estadual, não-cumulativo, ~18% cheio" accent="amber" index={4}>
      <MinSchema>
        <Term>ICMS</Term> é estadual, incide sobre mercadoria, energia, comunicação e transporte interestadual.
        Alíquota cheia 17–20% conforme o estado. É <Term>não-cumulativo</Term>: o que você paga ao comprar vira crédito,
        que você abate na hora de vender. Sem esse mecanismo, o imposto empilharia em cadeia longa.
      </MinSchema>

      <p>
        O efeito da não-cumulatividade só fica visível num exemplo com 2–3 elos.
        Troque o switch e veja o que muda para uma alíquota única de 18% numa cadeia minério → peça → produto.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <label className="inline-flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
          <input type="checkbox" checked={cum} onChange={(e) => setCum(e.target.checked)} className="accent-amber-400" />
          Simular como se fosse <b>cumulativo</b> (sem crédito)
        </label>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          {[
            { etapa: 'Mineradora', preco: preco1, icms: icms1 },
            { etapa: 'Indústria', preco: preco2, icms: cum ? preco2 * aliq : icms2 },
            { etapa: 'Distribuidora', preco: preco3, icms: cum ? preco3 * aliq : icms3 },
          ].map((e, i) => (
            <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500">Elo {i + 1}</div>
              <div className="text-neutral-200 font-semibold">{e.etapa}</div>
              <div className="mt-2 text-neutral-400">preço {brl(e.preco)}</div>
              <div className="text-amber-300 font-mono">
                ICMS {brl(e.icms)}
                {i > 0 && !cum && <span className="text-neutral-500"> = 18% · preço − crédito</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat label="ICMS total recolhido" value={brl(totalIcms)} color="text-amber-300" />
          <Stat label="% sobre o preço final" value={pct(effective, 1)} color={cum ? 'text-rose-300' : 'text-emerald-300'} />
        </div>
        {cum && (
          <p className="mt-3 text-xs text-rose-300/90">
            Sem crédito, a alíquota de 18% empilha até {pct(effective, 1)} — é o "efeito cascata" que a reforma busca eliminar para sempre.
          </p>
        )}
      </div>

      <Misconception
        wrong="Vou para um estado com ICMS menor e pago menos."
        right="Desde 2015 (EC 87), o ICMS em venda interestadual para consumidor final é dividido entre o estado de origem e o de destino (DIFAL). Além disso, o ICMS do meu insumo é crédito que eu já tenho — mudar de estado muda a logística, não magicamente a alíquota efetiva."
        because="A guerra fiscal funcionava quando o destino 'reconhecia' integralmente o crédito de origem apesar do benefício fiscal. A LC 160/2017 + convênios do CONFAZ fecharam a maior parte desses loopholes. O IBS da reforma encerra definitivamente essa estratégia."
      />

      <Deeper>
        O ICMS tem uma peculiaridade exótica: a <b>alíquota interestadual</b>. Se vendo de SP para o NE, não pago 18% (interna SP);
        pago 7% (alíquota interestadual) na origem, e o comprador no NE paga a diferença para chegar à alíquota interna dele.
        Isso gera acúmulo crônico de crédito nos estados exportadores (SP, MG) e financia a <i>guerra fiscal</i>: um estado pobre
        dá desconto extra sobre os 7% e atrai a indústria. A reforma resolve pela migração da tributação para o <b>destino</b> —
        quem consome, cobra, e a alíquota vira uniforme nacionalmente (embora com sub-alíquotas estaduais de calibração).
      </Deeper>

      <QA items={[
        {
          q: 'Por que uma mercadoria com ICMS de 18% não tem 18% de imposto embutido no preço final?',
          a: 'Porque o ICMS compõe a base dele mesmo ("por dentro"). Para destacar R$ 18 de ICMS num preço líquido de R$ 82, a alíquota efetiva sobre o custo é ~22%. Essa inclusão na base é um clássico brasileiro — e é o que a reforma promete eliminar com IBS "por fora".',
        },
        {
          q: 'Data center paga ICMS?',
          a: 'Diretamente, não — serviço de TI não é mercadoria. Mas data center é o segundo maior consumidor industrial de energia elétrica do país, e ICMS-energia é o tributo mais pesado do CAPEX/OPEX. Via Tema 745, a alíquota caiu para a modal do estado (17–18%), mas continua sendo a maior linha de tributo no P&L.',
        },
      ]} />
    </Card>
  );
};

const ISSCard = () => {
  const cidades = [
    { nome: 'São Paulo (SP)', aliq: 5, nota: 'serviços de TI em regra 2,9–5% a depender do código' },
    { nome: 'Barueri (SP)', aliq: 2, nota: 'piso constitucional — atrai sedes de serviço' },
    { nome: 'Poá (SP)', aliq: 2, nota: 'outra clássica da "guerra fiscal" do ISS' },
    { nome: 'Santana de Parnaíba (SP)', aliq: 2, nota: 'piso constitucional para muitos códigos' },
    { nome: 'Rio de Janeiro (RJ)', aliq: 5, nota: 'teto constitucional' },
    { nome: 'Curitiba (PR)', aliq: 5, nota: 'TI em 2,5–5% conforme código' },
  ];
  return (
    <Card id="iss" icon={Building2} title="ISS" subtitle="Municipal, 2–5%, cumulativo, geografia importa" accent="fuchsia" index={5}>
      <MinSchema>
        <Term>ISS</Term> é municipal, cumulativo (sem crédito), alíquota 2% (piso) a 5% (teto) — tetos definidos na Constituição.
        Incide sobre os serviços listados na <Term>LC 116/2003</Term>. Para serviços <i>fora</i> dessa lista, não há ISS — nem ICMS.
        Essa zona é exatamente o centro do debate do data center.
      </MinSchema>

      <p>
        A característica mais estranha do ISS para quem vem de fora é a <b>escolha geográfica</b>. A regra geral do
        art. 3º da LC 116 diz: ISS é devido no município do <i>estabelecimento prestador</i> (a sede). Para um SaaS ou consultoria,
        basta instalar a PJ num município de 2% para reduzir a alíquota pela metade. É legal, e é o que praticamente
        todas as empresas de serviço fazem depois de certo porte.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="text-xs text-neutral-500 mb-2">Alíquota típica (serviços de TI/SaaS) em municípios selecionados</div>
        <div className="space-y-2">
          {cidades.map((c) => (
            <div key={c.nome} className="flex items-center gap-3">
              <div className="w-48 text-xs text-neutral-300 flex-shrink-0">{c.nome}</div>
              <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                <div
                  className={`h-full rounded ${c.aliq <= 2 ? 'bg-emerald-500/70' : c.aliq <= 3 ? 'bg-amber-500/70' : 'bg-rose-500/70'}`}
                  style={{ width: `${(c.aliq / 5) * 100}%` }}
                />
              </div>
              <div className="w-12 text-xs text-neutral-400 font-mono text-right">{c.aliq}%</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-neutral-500 leading-snug">
          A diferença entre 2% e 5% sobre R$ 50 M de receita é R$ 1,5 M/ano. Em empresa de serviço, isso é 1–3% de margem.
        </div>
      </div>

      <p>
        A LC 157/2016 tentou combater a "guerra fiscal" do ISS e criou exceções: para <b>cartões</b>, <b>leasing</b>,
        <b> planos de saúde</b> e alguns outros códigos, o ISS é devido no município do <i>tomador</i>, não do prestador.
        Mas a regra geral permanece — para a maioria dos códigos, incluindo TI em boa parte dos municípios, a sede define.
      </p>

      <Misconception
        wrong="Todo serviço tem ISS."
        right="Só tem ISS quem está na lista anexa à LC 116. A locação de bem móvel, por exemplo, foi declarada inconstitucional pela Súmula Vinculante 31 do STF. Consultoria em bens não expressamente listados também pode escapar."
        because="O ISS tributa 'obrigação de fazer' (serviço). Contratos que entregam um 'bem' em uso (locação) ou que meramente transferem dinheiro (empréstimo) não são serviço, juridicamente. Foi essa doutrina que gerou a Súmula 31 — e que sustenta o argumento de muitos data centers hoje."
      />

      <Deeper>
        O ISS é <i>cumulativo</i> — empresa de serviço não tem direito a crédito. Se você consome R$ 30 de consultoria no meio
        da cadeia, os R$ 1,50 de ISS (5%) viram custo, não crédito, e embutem no seu preço. Em cadeias de B2B longas (ex: consultoria +
        integrador + marketplace + cliente), o ISS se acumula como cascata invisível. A <Term>CBS</Term> + <Term>IBS</Term> da reforma
        trocam essa lógica por <b>não-cumulatividade plena</b>: todo gasto que gerar crédito reduz o imposto devido. Prestador de serviço que vende para outro CNPJ
        tende a ficar <i>neutro</i>; quem vende para consumidor final (B2C) provavelmente paga mais, porque não há cadeia para abater.
      </Deeper>

      <CrossLink to="dc-loc-serv" recap="card ★">
        O "mapa" do ISS importa por si só, mas também porque é a arma do fisco municipal na disputa com os data centers — detalhe no card dedicado.
      </CrossLink>
    </Card>
  );
};

const PisCofinsCard = () => {
  const [insumo, setInsumo] = useState(40); // % de insumos que geram crédito
  const receita = 100;
  const cum = receita * 0.0365; // 3,65% sobre receita bruta
  const debito = receita * 0.0925;
  const credito = insumo * 0.0925;
  const naoCum = Math.max(debito - credito, 0);
  return (
    <Card id="pis-cofins" icon={Receipt} title="PIS + COFINS" subtitle="Dois regimes, decisão crítica" accent="sky" index={6}>
      <MinSchema>
        <Term>PIS</Term> + <Term>COFINS</Term> somados são <b>3,65%</b> (cumulativo, Lucro Presumido) ou <b>9,25%</b> (não-cumulativo, Lucro Real).
        A alíquota alta parece pior — mas no não-cumulativo você abate crédito sobre insumos. A decisão depende de <i>quanto da sua receita é insumo tributado</i>.
      </MinSchema>

      <p>
        O cálculo é direto: você tem crédito se seu fornecedor cobrou PIS/COFINS. Energia, locação, serviço listado,
        frete, insumo industrial — sim. Folha de pagamento, pró-labore, serviços de profissionais autônomos, importação sem PIS/COFINS — não.
        Empresa de serviço tem <b>pouco crédito</b>; indústria tem <b>muito</b>. Isso muda o regime ótimo.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs text-neutral-400">
            Insumos <b>com crédito</b> / receita: <b className="text-sky-300 font-mono">{insumo}%</b>
          </div>
          <div className="text-[10px] text-neutral-500">receita base R$ 100</div>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          value={insumo}
          onChange={(e) => setInsumo(Number(e.target.value))}
          className="w-full accent-sky-400"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Cumulativo · Presumido</div>
            <div className="text-neutral-300 text-xs mt-1">3,65% × 100</div>
            <div className="mt-2 text-lg font-semibold text-sky-300">{brl(cum)}</div>
            <div className="text-[11px] text-neutral-500">não tem crédito · não depende do insumo</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Não-cumulativo · Real</div>
            <div className="text-neutral-300 text-xs mt-1">9,25% × 100 − 9,25% × {insumo}</div>
            <div className="mt-2 text-lg font-semibold text-sky-300">{brl(naoCum)}</div>
            <div className="text-[11px] text-neutral-500">crédito: {brl(credito)}</div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-center font-mono">
          {naoCum < cum ? (
            <span className="text-emerald-300">Com {insumo}% de crédito, o Real vence por {brl(cum - naoCum)}/R$100</span>
          ) : (
            <span className="text-rose-300">Com {insumo}% de crédito, o Presumido vence por {brl(naoCum - cum)}/R$100</span>
          )}
          <span className="text-neutral-500"> · ponto de equilíbrio ≈ {Math.round((1 - 0.0365 / 0.0925) * 100)}% de insumo tributado</span>
        </div>
      </div>

      <Worked title="Exemplo numérico · SaaS B2B em SP">
        <p>
          Um SaaS com R$ 20 M de receita, 65% de margem bruta (custo = 35%). Desse custo, 20 pontos são folha (sem crédito) e 15 pontos são
          infra AWS (<i>tributada em jurisdição do PJ no exterior, sem crédito brasileiro em regra</i>). Crédito potencial: ~0%.
        </p>
        <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1 mt-1">
          <li>Cumulativo: 3,65% × 20M = <b className="text-sky-300">R$ 730 mil</b></li>
          <li>Não-cumulativo: 9,25% × 20M − 9,25% × 0 = <b className="text-rose-300">R$ 1,85 M</b></li>
          <li>Diferença a favor do Presumido: <b>R$ 1,12 M/ano</b> em PIS/COFINS</li>
        </ul>
        <p>
          Por isso quase todo SaaS B2B até R$ 78M opta por Presumido — até o lucro <i>efetivo</i> cair abaixo da presunção de 32% sobre receita,
          quando o Real começa a vencer no IRPJ/CSLL (veja card seguinte).
        </p>
      </Worked>

      <Misconception
        wrong="AWS / Azure geram crédito de PIS/COFINS como qualquer serviço."
        right="Em regra, não. Importação de serviço tem PIS/COFINS-Importação (9,25%), mas dedutibilidade depende de caracterização — e quando o contrato é com empresa do grupo no exterior, o tema vira planejamento fiscal complexo. Muitas empresas acabam sem crédito de facto."
        because="A não-cumulatividade pressupõe que o elo anterior pagou PIS/COFINS no Brasil. Quando o contrato original é com a AWS Inc. (EUA), o PIS/COFINS-Importação é pago pelo tomador no Brasil e só gera crédito quando o insumo é aplicado em atividade tributada no país."
      />

      <Deeper>
        PIS/COFINS é o tributo mais contencioso da União — trilhões em disputa sobre o que é "insumo".
        O <b>STJ</b>, no Tema 779 (REsp 1.221.170), fixou o conceito de "essencialidade e relevância" — insumo é o que é essencial ou relevante ao processo produtivo,
        não só o que se incorpora ao produto. Isso liberou crédito sobre EPI, vale-transporte, treinamento, propaganda direta — coisas impensáveis antes.
        A <Term>CBS</Term> da reforma elimina essa discussão: <i>todo gasto empresarial</i> gera crédito, com exceções expressas.
      </Deeper>
    </Card>
  );
};

const IrpjCard = () => {
  const [margem, setMargem] = useState(25); // margem líquida real %
  const receita = 1000; // R$ 1000 de receita para facilitar
  const lucroReal = receita * (margem / 100);
  const presuncao = 0.32; // serviço
  const baseP = receita * presuncao;
  const totalAliq = 0.24; // IRPJ 15 + CSLL 9
  const irpjPresumido = baseP * totalAliq;
  const irpjReal = lucroReal * 0.34; // 15+9+10 adicional (simplificação)
  return (
    <Card id="irpj" icon={Coins} title="IRPJ + CSLL" subtitle="Impostos federais sobre o lucro" accent="emerald" index={7}>
      <MinSchema>
        <Term>IRPJ</Term> = 15% sobre o lucro, + 10% adicional sobre o que exceder R$ 240 mil/ano.
        <br />
        <Term>CSLL</Term> = 9% sobre o lucro.
        <br />
        Juntos: alíquota marginal máxima <b>34%</b> do lucro no Lucro Real, para empresas fora do setor financeiro (bancos pagam 45%).
      </MinSchema>

      <p>
        Nominalmente 34% é alto — próximo da média OCDE. A sutileza: no <Term>Lucro Presumido</Term>, a base não é o lucro contábil,
        é uma <i>presunção</i> fixa sobre a receita — 32% para serviço, 8% para comércio, 1,6% para revenda de combustível.
        A alíquota então vira efetiva sobre receita.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs text-neutral-400">
            Margem líquida real (lucro / receita): <b className="text-emerald-300 font-mono">{margem}%</b>
          </div>
          <div className="text-[10px] text-neutral-500">receita base R$ {receita}</div>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          value={margem}
          onChange={(e) => setMargem(Number(e.target.value))}
          className="w-full accent-emerald-400"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Presumido (serviço · 32%)</div>
            <div className="text-neutral-300 text-xs mt-1">
              base presumida = R$ {receita} × 32% = R$ {baseP}
            </div>
            <div className="mt-2 text-lg font-semibold text-emerald-300">{brl(irpjPresumido)}</div>
            <div className="text-[11px] text-neutral-500">≈ {pct(irpjPresumido / receita, 1)} sobre a receita</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Real (34% sobre lucro)</div>
            <div className="text-neutral-300 text-xs mt-1">
              lucro real = R$ {receita} × {margem}% = R$ {lucroReal}
            </div>
            <div className="mt-2 text-lg font-semibold text-emerald-300">{brl(irpjReal)}</div>
            <div className="text-[11px] text-neutral-500">≈ {pct(irpjReal / receita, 1)} sobre a receita</div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-center font-mono">
          {irpjReal < irpjPresumido ? (
            <span className="text-emerald-300">Real ganha — margem &lt; 32%, então o lucro efetivo é menor que a presunção.</span>
          ) : (
            <span className="text-rose-300">Presumido ganha — margem &gt; 32%, você é mais lucrativo que o fisco presume.</span>
          )}
          <span className="text-neutral-500"> · ponto de equilíbrio em 32% (presunção · serviços)</span>
        </div>
      </div>

      <p>
        Regra prática, do lado do lucro só: empresa de serviço com margem líquida <b>abaixo de 32%</b> deveria estar no Real;
        <b> acima</b>, o Presumido é mais leve (você paga sobre uma base menor que seu lucro efetivo). Isso se combina com a decisão de PIS/COFINS do card anterior — e por isso escolher regime é uma <i>otimização em duas dimensões</i>.
      </p>

      <Deeper>
        A "distribuição de lucros" é hoje <b>isenta</b> na pessoa física — só o pró-labore paga IR. Isso é um dos maiores benefícios
        do sistema brasileiro para sócios de PJ: se a empresa paga IRPJ/CSLL de 34%, a pessoa física recebe o restante líquido.
        Há 15 anos esse arranjo tributa sócio a taxa efetiva entre 15 e 34% — contra 27,5% da alíquota máxima da tabela do IRPF.
        O governo Lula apresentou em 2025 projeto para tributar dividendos acima de R$ 50 mil/mês em 10% na fonte — ainda em tramitação.
        Se passar, toda a aritmética do "sou PJ" muda.
      </Deeper>

      <QA items={[
        {
          q: 'Por que a alíquota efetiva de IRPJ+CSLL num Presumido parece baixa (~7,7%)?',
          a: 'Porque 32% × 24% = 7,68%. Você só paga sobre 32% da receita (base presumida), então a alíquota efetiva sobre receita cai para ~7,7%. Se seu lucro real for maior que 32%, você é beneficiado; se for menor, está pagando a mais que deveria.',
        },
      ]} />
    </Card>
  );
};

const FolhaCard = () => {
  const componentes = [
    { k: 'inss', label: 'INSS patronal', aliq: 20, color: 'bg-rose-500/80', nota: 'contribuição previdenciária sobre salários' },
    { k: 'rat', label: 'RAT / GIIL-RAT', aliq: 2, color: 'bg-rose-400/80', nota: '1–3% conforme grau de risco da atividade' },
    { k: 'terceiros', label: 'Terceiros (Sistema S)', aliq: 5.8, color: 'bg-orange-500/80', nota: 'SENAI, SESC, SESI, SEBRAE, INCRA, salário-educação' },
    { k: 'fgts', label: 'FGTS', aliq: 8, color: 'bg-amber-500/80', nota: 'conta vinculada do empregado' },
  ];
  const total = componentes.reduce((a, c) => a + c.aliq, 0);
  return (
    <Card id="folha" icon={Users} title="Folha" subtitle="Encargos patronais · ~35,8% sobre o salário" accent="rose" index={8}>
      <MinSchema>
        Para cada R$ 100 de salário bruto pago ao funcionário, a empresa desembolsa cerca de <b>R$ {(100 + total).toFixed(1)}</b> —
        o restante vai em tributos e depósitos obrigatórios. É por isso que o custo real de um engenheiro CLT de R$ 15 mil/mês
        passa de R$ 20 mil para a empresa.
      </MinSchema>

      <p>
        A folha de pagamento é uma das bases mais pesadas do sistema — e a maior fonte de elusão via PJ no Brasil.
        A transferência de um CLT para "PJ consultor" economiza 35,8% de encargos + o IR do sócio via distribuição de lucros isenta.
        É um dos buracos estruturais que nenhum governo fecha completamente.
      </p>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="text-xs text-neutral-500 mb-3">Encargos patronais, típico Lucro Real / Presumido · sem desoneração</div>
        <div className="space-y-2">
          {componentes.map((c) => (
            <div key={c.k} className="flex items-center gap-3">
              <div className="w-48 text-xs text-neutral-300">
                {c.label}
                <div className="text-[10px] text-neutral-500">{c.nota}</div>
              </div>
              <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
                <div className={`h-full ${c.color}`} style={{ width: `${(c.aliq / 20) * 100}%` }} />
              </div>
              <div className="w-14 text-right text-xs text-neutral-400 font-mono">{c.aliq}%</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-baseline">
          <div className="text-sm text-neutral-200 font-semibold">Total sobre salário bruto</div>
          <div className="text-lg font-semibold text-rose-300 font-mono">{total}%</div>
        </div>
      </div>

      <Worked title="Exemplo · engenheiro CLT R$ 15.000">
        <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1">
          <li>Salário bruto: <b className="text-neutral-200">R$ 15.000</b></li>
          <li>INSS patronal (20%): R$ 3.000</li>
          <li>RAT (2%) + Terceiros (5,8%): R$ 1.170</li>
          <li>FGTS (8%): R$ 1.200</li>
          <li>13º + férias (1/12 × 13 + 1/12 × 15/12 acumulado) ≈ R$ 1.875</li>
          <li>Custo mensal total ≈ <b className="text-rose-300">R$ 22.245</b> — 48% acima do salário bruto</li>
        </ul>
        <p className="mt-2">
          Mesmo funcionário como PJ simples MEI em TI (Anexo III): R$ 15.000 × 6% = <b className="text-emerald-300">R$ 900</b> de tributo mensal.
          Delta de R$ 6.345/mês, R$ 76 mil/ano por pessoa. Num time de 20, R$ 1,5 M/ano.
        </p>
      </Worked>

      <Misconception
        wrong="Desoneração da folha (CPRB) extinguiu os 20% de INSS patronal."
        right="Nunca extinguiu — apenas ofereceu alternativa: 1–4,5% sobre a receita bruta em troca dos 20% sobre folha. E para certos setores. A Lei 14.973/2024 reabriu parcialmente a CPRB até 2027 com desligamento gradual."
        because="A desoneração é seletiva por CNAE — setores intensivos em folha (TI, comunicação, transporte, construção, têxtil) foram os beneficiados. Para empresa com muita gente e pouca receita unitária, CPRB compensa; para SaaS com poucos engenheiros muito caros, a folha ganha."
      />

      <Deeper>
        A folha <i>não</i> muda com a reforma tributária — o foco da EC 132 é consumo, não trabalho. Mas há <b>PEC da Reforma Tributária II</b>
        em discussão para 2026–28 que trata exatamente de renda e folha. O desenho provável: unificação de IRPJ+CSLL em tributo único,
        tributação de dividendos, e possível realinhamento da contribuição patronal. Isso foi deliberado — o governo Lula quis fazer primeiro
        a reforma mais madura (consumo) antes da mais contenciosa (renda+folha).
      </Deeper>
    </Card>
  );
};

const RegimesCard = () => {
  const [receita, setReceita] = useState(5); // em R$ milhões
  const [margem, setMargem] = useState(25); // %
  const [tipo, setTipo] = useState('servico'); // servico | comercio | industria

  const receitaR$ = receita * 1_000_000;
  const lucro = receitaR$ * (margem / 100);

  // Simples Nacional — simplificação grande: usando alíquotas efetivas médias do Anexo III (serviço com Fator R) ou I (comércio)
  const simplesAliq = tipo === 'servico'
    ? (receita < 0.18 ? 0.06 : receita < 0.36 ? 0.112 : receita < 0.72 ? 0.135 : receita < 1.8 ? 0.16 : receita < 3.6 ? 0.21 : 0.33)
    : (receita < 0.18 ? 0.04 : receita < 0.36 ? 0.073 : receita < 0.72 ? 0.095 : receita < 1.8 ? 0.107 : receita < 3.6 ? 0.143 : 0.19);
  const simplesDisponivel = receita <= 4.8;
  const simplesTotal = simplesDisponivel ? receitaR$ * simplesAliq : null;

  // Presumido
  const presuncao = tipo === 'servico' ? 0.32 : tipo === 'industria' ? 0.08 : 0.08;
  const baseIRCS = receitaR$ * presuncao;
  const irpjP = baseIRCS * 0.15 + Math.max(baseIRCS - 240000, 0) * 0.10;
  const csllP = baseIRCS * 0.09;
  const pcP = receitaR$ * 0.0365;
  const issP = tipo === 'servico' ? receitaR$ * 0.03 : 0; // estimativa ISS médio
  const icmsP = tipo !== 'servico' ? receitaR$ * 0.12 : 0; // ICMS líq crédito estimado
  const presumidoDisponivel = receita <= 78;
  const presumidoTotal = presumidoDisponivel ? irpjP + csllP + pcP + issP + icmsP : null;

  // Real
  const irpjR = lucro * 0.15 + Math.max(lucro - 240000, 0) * 0.10;
  const csllR = lucro * 0.09;
  // não-cumulativo sem crédito (pior caso, serviço)
  const pcR = tipo === 'servico' ? receitaR$ * 0.0925 : receitaR$ * 0.06; // com crédito parcial para comércio/indústria
  const issR = tipo === 'servico' ? receitaR$ * 0.03 : 0;
  const icmsR = tipo !== 'servico' ? receitaR$ * 0.10 : 0;
  const realTotal = irpjR + csllR + pcR + issR + icmsR;

  const regimes = [
    { nome: 'Simples Nacional', total: simplesTotal, aliq: simplesAliq, note: simplesDisponivel ? `alíquota efetiva ~${(simplesAliq * 100).toFixed(1)}%` : 'receita > R$ 4,8M · não elegível', color: 'text-sky-300' },
    { nome: 'Lucro Presumido', total: presumidoTotal, note: presumidoDisponivel ? 'IRPJ/CSLL sobre base presumida · PIS/COFINS cumulativo' : 'receita > R$ 78M · não elegível', color: 'text-violet-300' },
    { nome: 'Lucro Real', total: realTotal, note: 'IRPJ/CSLL sobre lucro efetivo · PIS/COFINS não-cumulativo', color: 'text-emerald-300' },
  ];
  const validos = regimes.filter((r) => r.total !== null);
  const min = Math.min(...validos.map((r) => r.total));

  return (
    <Card id="regimes" icon={Calculator} title="Os 3 regimes" subtitle="Simples · Presumido · Real — calculadora" accent="violet" index={9}>
      <MinSchema>
        Toda empresa brasileira escolhe um de três regimes por ano-calendário:
        <br/>
        <b>Simples</b> (até R$ 4,8 M/ano · DAS única, alíquota progressiva) ·
        <b> Presumido</b> (até R$ 78 M · base IRPJ/CSLL presumida · PIS/COFINS cumulativos) ·
        <b> Real</b> (obrigatório &gt; R$ 78M · lucro efetivo · PIS/COFINS não-cumulativos).
        A escolha certa vale 2 a 10% da receita em diferença.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Tipo de atividade</div>
            <div className="inline-flex rounded-md border border-white/10 overflow-hidden">
              {['servico', 'comercio', 'industria'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`px-2 py-1 text-[11px] ${tipo === t ? 'bg-violet-500/30 text-violet-200' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  {t === 'servico' ? 'Serviço' : t === 'comercio' ? 'Comércio' : 'Indústria'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Receita anual (R$ M)</div>
            <input type="range" min={0.3} max={100} step={0.1} value={receita} onChange={(e) => setReceita(Number(e.target.value))} className="w-full accent-violet-400" />
            <div className="text-[11px] text-violet-300 font-mono">{brl(receitaR$, { compact: true })}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Margem líquida real (%)</div>
            <input type="range" min={3} max={60} value={margem} onChange={(e) => setMargem(Number(e.target.value))} className="w-full accent-violet-400" />
            <div className="text-[11px] text-violet-300 font-mono">{margem}% · lucro {brl(lucro, { compact: true })}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-2">
          {regimes.map((r) => {
            const elegivel = r.total !== null;
            const isMin = elegivel && r.total === min;
            return (
              <div key={r.nome} className={`rounded-lg p-3 ${isMin ? 'bg-emerald-500/10 border border-emerald-400/30' : 'bg-white/5 border border-white/10'}`}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className={`text-sm font-semibold ${r.color}`}>{r.nome} {isMin && <span className="text-[10px] text-emerald-300 ml-1">menor carga</span>}</div>
                    <div className="text-[11px] text-neutral-500">{r.note}</div>
                  </div>
                  <div className={`text-lg font-mono ${elegivel ? 'text-neutral-100' : 'text-neutral-600'}`}>
                    {elegivel ? brl(r.total, { compact: true }) : '—'}
                  </div>
                </div>
                {elegivel && (
                  <div className="mt-2 h-1.5 bg-white/5 rounded overflow-hidden">
                    <div className={`h-full ${r.color === 'text-sky-300' ? 'bg-sky-500/70' : r.color === 'text-violet-300' ? 'bg-violet-500/70' : 'bg-emerald-500/70'}`} style={{ width: `${(r.total / Math.max(...validos.map((v) => v.total))) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p>
        Números têm ordem de grandeza — cada regime tem mil nuances (Fator R no Simples, exclusões do Presumido, ajustes do LALUR no Real).
        Mas a forma do gráfico é real: <b>serviço com margem alta</b> favorece Presumido; <b>serviço com margem baixa ou comércio com estoque</b> favorece Real;
        <b> pequeno e simples</b> favorece Simples até o limite de R$ 4,8 M.
      </p>

      <Deeper>
        A <b>reforma tributária elimina</b> PIS, COFINS, IPI, ICMS e ISS — mas <b>Simples continua existindo</b> com pequenas adaptações,
        para não inviabilizar micro e pequena empresa. IRPJ e CSLL também permanecem (são sobre renda, não consumo).
        Para quem está fora do Simples, a escolha "Presumido vs Real" <b>vai perder relevância</b> até 2033, porque a decisão principal de
        PIS/COFINS (que hoje varia entre regimes) deixa de existir — vira CBS não-cumulativo puro para todos.
        A última batalha da escolha de regime é entre 2026–2032, na transição.
      </Deeper>
    </Card>
  );
};

const DCLocServ = () => {
  // slider: quanto da receita é "espaço + energia + refrigeração" (locação) vs "gestão + monitoramento + suporte" (serviço)
  const [servicoPct, setServicoPct] = useState(50);
  const receita = 100;
  const locacao = receita * (1 - servicoPct / 100);
  const servico = receita * (servicoPct / 100);

  // Cenário A: contrato único como SERVIÇO → ISS sobre 100%
  const aliqIss = 0.05;
  const issCheio = receita * aliqIss;
  const pcCheio = receita * 0.0925;

  // Cenário B: contrato SEGREGADO — locação (sem ISS pela Súm. Vinc. 31) + serviço acessório
  const issSegregado = servico * aliqIss;
  const pcSegregado = receita * 0.0925; // PIS/COFINS federal incide nos dois ainda
  const economiaIss = issCheio - issSegregado;

  return (
    <Card
      id="dc-loc-serv"
      icon={Split}
      title="Data center ★ locação vs serviço"
      subtitle="A decisão tributária mais cara do setor"
      accent="fuchsia"
      index={10}
      source="STF · Súmula Vinculante 31 · LC 116/2003"
    >
      <MinSchema>
        Um contrato de <b>colocation</b> pode ser caracterizado de duas formas — e isso muda a carga municipal (ISS):
        <br/>
        <b>(A) Serviço puro</b> (contrato único de "hospedagem de TI"): ISS incide sobre 100% da receita · 2–5%.
        <br/>
        <b>(B) Contratos segregados</b> (locação de rack/energia + serviço acessório de gestão): a <Term>Súmula Vinculante 31</Term> do STF
        diz que locação de bem móvel não é serviço, então <b>ISS só incide na parcela de serviço</b>.
      </MinSchema>

      <Predict question="Num contrato de colocation de R$ 100, com 50% sendo 'aluguel de rack + energia' e 50% 'gestão e monitoramento', qual a diferença de ISS entre as duas caracterizações?">
        <p>
          No <b>contrato único</b>: ISS de 5% × R$ 100 = <b className="text-rose-300">R$ 5</b>.
          No <b>segregado</b>: ISS de 5% × R$ 50 = <b className="text-emerald-300">R$ 2,50</b>.
          Diferença de <b>R$ 2,50 a cada R$ 100 de receita</b>, ou <b>2,5% da receita anual</b>. Para um data center de R$ 500 M,
          isso é R$ 12,5 M/ano — margem de EBITDA inteira de uma operação média.
        </p>
      </Predict>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs text-neutral-400">
            Parcela de <b>serviço</b> no contrato: <b className="text-fuchsia-300 font-mono">{servicoPct}%</b>
          </div>
          <div className="text-xs text-neutral-500">
            Parcela de <b>locação</b>: <span className="text-emerald-300 font-mono">{100 - servicoPct}%</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={servicoPct}
          onChange={(e) => setServicoPct(Number(e.target.value))}
          className="w-full accent-fuchsia-400"
        />
        <div className="h-4 mt-2 flex rounded overflow-hidden border border-white/10">
          <div className="bg-emerald-500/70 h-full flex items-center justify-center text-[10px] font-mono text-emerald-50" style={{ width: `${100 - servicoPct}%` }}>
            {100 - servicoPct >= 10 && 'LOCAÇÃO'}
          </div>
          <div className="bg-fuchsia-500/70 h-full flex items-center justify-center text-[10px] font-mono text-fuchsia-50" style={{ width: `${servicoPct}%` }}>
            {servicoPct >= 10 && 'SERVIÇO'}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-rose-500/10 border border-rose-400/20 p-3">
            <div className="text-[10px] uppercase tracking-widest text-rose-300">Contrato único "serviço"</div>
            <div className="text-neutral-300 text-xs mt-1">ISS 5% × 100</div>
            <div className="mt-2 text-xl font-semibold text-rose-300 font-mono">{brl(issCheio)}</div>
            <div className="text-[11px] text-neutral-500">PIS/COFINS federal: {brl(pcCheio)}</div>
          </div>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 p-3">
            <div className="text-[10px] uppercase tracking-widest text-emerald-300">Segregado · locação + serviço</div>
            <div className="text-neutral-300 text-xs mt-1">ISS 5% × {servicoPct} (parcela serviço)</div>
            <div className="mt-2 text-xl font-semibold text-emerald-300 font-mono">{brl(issSegregado)}</div>
            <div className="text-[11px] text-neutral-500">PIS/COFINS federal (nos dois): {brl(pcSegregado)}</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-center font-mono text-emerald-300/90">
          Economia: {brl(economiaIss)}/R$100 · {pct(economiaIss / receita, 2)} da receita
        </div>
      </div>

      <p>
        A base jurídica da caracterização "locação" é a <b>obrigação de dar</b> × <b>obrigação de fazer</b> do Código Civil.
        Quando você aluga uma ferramenta, o locador <i>entrega a coisa em uso</i> — é obrigação de <Term>obrigação de dar</Term>,
        não há "serviço" prestado. O STF cristalizou esse entendimento em 2010 com a <b>Súmula Vinculante 31</b>:
      </p>

      <blockquote className="border-l-2 border-fuchsia-400/40 pl-4 py-1 italic text-fuchsia-100/90">
        "É inconstitucional a incidência do Imposto sobre Serviços — ISS — sobre operações de locação de bens móveis."
      </blockquote>

      <p>
        Um rack é bem móvel. Um bloco de energia contratado dentro do rack é fornecimento, não serviço. A caracterização da
        colocation pura como locação de bem móvel é, portanto, tese defensável. O fisco municipal, por sua vez, argumenta que
        o contrato "não é locação porque exige operação contínua" — e o debate vai para o Judiciário.
      </p>

      <Misconception
        wrong="Se eu escrever no contrato que é 'locação', economizo ISS."
        right="Não. A caracterização é por natureza, não por rótulo. O fisco pode requalificar. O que sustenta a tese é a arquitetura contratual: contratos separados, formação de preço segregada, ausência de obrigação de fazer no contrato de locação (o data center dá acesso ao rack energizado e climatizado; o cliente opera)."
        because="Em tributário brasileiro vale a 'interpretação econômica' (CTN art. 118). Contrato chamado de 'locação' mas que descreve obrigação de fazer (gestão, monitoramento 24×7, SLA de uptime) será tratado como serviço. Por isso a solução é quase sempre dois contratos: um de locação (espaço, rack, energia, refrigeração) e outro de serviço (NOC, smart hands, backup)."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-400/20 p-3">
          <div className="text-xs font-semibold text-emerald-300 mb-1 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Sinais de locação</div>
          <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
            <li>Cliente detém os servidores (não há "trazer seu hardware e nós operamos")</li>
            <li>Preço formado por espaço (kW ou rack-U) e por consumo de energia, não por "serviço gerenciado"</li>
            <li>Obrigação do data center é entregar espaço energizado e climatizado — não operar a TI</li>
            <li>Contrato traz cláusula de posse, não de SLA de aplicação</li>
            <li>Jurisprudência: STJ REsp 2.009.389/MG; STF RE 1.294.969 (pendente, repercussão geral)</li>
          </ul>
        </div>
        <div className="rounded-lg bg-rose-500/5 border border-rose-400/20 p-3">
          <div className="text-xs font-semibold text-rose-300 mb-1 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Sinais de serviço</div>
          <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
            <li>Contrato com SLA de aplicação, disponibilidade, processamento</li>
            <li>Equipe do data center opera os servidores do cliente (managed services)</li>
            <li>Contrato prevê atividades de "suporte técnico", "monitoramento ativo", "backup gerenciado"</li>
            <li>Consta como item 1.03 ("processamento de dados") ou 1.07 ("suporte técnico") da LC 116</li>
            <li>Preço formado em torno de uma obrigação de fazer, não de dar</li>
          </ul>
        </div>
      </div>

      <Deeper>
        Por que isso <b>importa agora</b>, se a reforma vai extinguir ISS em 2033? Três razões:
        (i) o contrato de colocation feito hoje provavelmente dura 5–10 anos, cruzando a transição;
        (ii) durante a transição (2026–2032), ISS + IBS convivem, e a disputa ISS continua relevante;
        (iii) existe passivo histórico — data centers brasileiros têm autuações do fisco municipal cobrando anos anteriores;
        a tese de locação é a única defesa contra autuações retroativas. Mesmo em 2033, a caracterização afeta benefícios
        específicos (REIDI, Ex-Tarifário) e a lógica de cálculo do IBS, que preserva a distinção mercadoria/serviço em regras de creditamento.
      </Deeper>

      <CrossLink to="dc-alavancas" recap="a seguir">
        Outras alavancas fiscais específicas de data center — Ex-Tarifário, RECAP, REIDI, Lei do Bem, ACL de energia.
      </CrossLink>
    </Card>
  );
};

const DCAlavancas = () => {
  const alavancas = [
    {
      nome: 'Ex-Tarifário',
      tributo: 'II (Imposto de Importação)',
      efeito: '14–16% → 0–2%',
      como: 'Reduz II na importação de servidores, GPUs, chillers, sistemas de UPS quando não há similar nacional. Concedido por resolução da CAMEX/Gecex, pleiteado setor a setor.',
      quando: 'Sempre que o equipamento importado não tiver similar nacional produzido — hoje 95% dos componentes críticos (chips NVIDIA, racks específicos, PDU inteligentes).',
      delta: '−12 a −14 pts',
      accent: 'sky',
    },
    {
      nome: 'RECAP',
      tributo: 'PIS/COFINS-Importação + PIS/COFINS',
      efeito: 'suspenso (alíquota zero)',
      como: 'Suspende PIS/COFINS na compra de bens de capital para empresa com ≥50% da receita em exportação. Um DC que exporta serviço de nuvem (consumidor fora do Brasil) pode pleitear.',
      quando: 'Regulamentado pelo Decreto 5.649/2005. Aplicação a data centers exige caracterização da receita internacional como "exportação de serviço" — terreno controverso com a Receita.',
      delta: '−9,25 pts no CAPEX',
      accent: 'emerald',
    },
    {
      nome: 'REIDI',
      tributo: 'PIS/COFINS',
      efeito: 'suspenso na aquisição',
      como: 'Regime Especial de Incentivos para Infraestrutura — suspende PIS/COFINS na compra de bens para projetos de infra aprovados.',
      quando: 'Historicamente para energia, transporte, saneamento. Há PL em discussão para incluir data centers estrategicamente relevantes (dados governamentais, soberania).',
      delta: '−9,25 pts no CAPEX',
      accent: 'violet',
    },
    {
      nome: 'Lei do Bem',
      tributo: 'IRPJ + CSLL',
      efeito: 'dedução 60–100% dos gastos com P&D',
      como: 'Lei 11.196/2005 — permite deduzir na base do IRPJ/CSLL os gastos com inovação tecnológica. Exige Lucro Real e projeto caracterizado como P&D (conforme Manual Frascati).',
      quando: 'Desenvolvimento de orquestração de carga, otimização de resfriamento, P&D em software interno. Mais aplicável a cloud/PaaS que a colocation puro.',
      delta: '−34 pts sobre o gasto de P&D',
      accent: 'amber',
    },
    {
      nome: 'ACL de energia',
      tributo: 'ICMS + tarifa',
      efeito: 'mercado livre',
      como: 'Ambiente de Contratação Livre — compra direto de gerador. Tarifa menor, ICMS calculado sobre valor do contrato (não da tarifa regulada), previsibilidade.',
      quando: 'Consumidor acima de 500 kW (reduzido em 2024 para 3 MW depois para 500 kW). Data center sempre se qualifica.',
      delta: '−15 a −25% na conta de luz',
      accent: 'rose',
    },
    {
      nome: 'Município-sede',
      tributo: 'ISS',
      efeito: 'alíquota 2% vs 5%',
      como: 'Incorporar a PJ em município de alíquota 2% (ex: Barueri, Poá, Santana de Parnaíba) reduz ISS pela metade para serviços em geral — desde que haja estabelecimento prestador real ali.',
      quando: 'Exige substância econômica: endereço real, funcionários locais, atividade comprovável. Não pode ser "caixa postal".',
      delta: '−3 pts sobre a receita ISS-sujeita',
      accent: 'fuchsia',
    },
    {
      nome: 'PADIS / Lei de Informática',
      tributo: 'II + IPI + PIS/COFINS',
      efeito: 'redução a zero',
      como: 'Programa de Apoio ao Desenvolvimento Tecnológico — reduz a zero tributos na importação e produção de semicondutores, displays e dispositivos de TIC. Exige contrapartidas em P&D.',
      quando: 'Aplicável a data centers que também produzam/montam equipamento. Menor aplicabilidade a DC só-serviço, mas relevante para OEMs brasileiros de rack e cooling.',
      delta: 'até −30% no insumo tributado',
      accent: 'cyan',
    },
  ];

  const palette = {
    sky: 'border-sky-400/20 bg-sky-500/5',
    emerald: 'border-emerald-400/20 bg-emerald-500/5',
    violet: 'border-violet-400/20 bg-violet-500/5',
    amber: 'border-amber-400/20 bg-amber-500/5',
    rose: 'border-rose-400/20 bg-rose-500/5',
    fuchsia: 'border-fuchsia-400/20 bg-fuchsia-500/5',
    cyan: 'border-cyan-400/20 bg-cyan-500/5',
  };
  const dotPalette = {
    sky: 'text-sky-300',
    emerald: 'text-emerald-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
    fuchsia: 'text-fuchsia-300',
    cyan: 'text-cyan-300',
  };

  return (
    <Card id="dc-alavancas" icon={Sparkles} title="Alavancas fiscais do data center" subtitle="Onde buscar pontos de margem sem mudar o negócio" accent="cyan" index={11}>
      <p>
        Colocation é um negócio de margem fina. A carga tributária explica boa parte da diferença entre um DC brasileiro e um americano.
        Mas há <b>sete alavancas legais</b> que, combinadas, podem recuperar 15–25% de receita:
      </p>

      <div className="space-y-2 mt-2">
        {alavancas.map((a) => (
          <div key={a.nome} className={`rounded-xl border p-4 ${palette[a.accent]}`}>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div className={`text-sm font-semibold ${dotPalette[a.accent]}`}>{a.nome}</div>
              <div className="text-[11px] text-neutral-400 font-mono">{a.tributo}</div>
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              efeito: <span className="text-neutral-100">{a.efeito}</span>
              <span className="text-neutral-500"> · </span>
              delta: <span className={dotPalette[a.accent]}>{a.delta}</span>
            </div>
            <div className="mt-2 text-sm text-neutral-300 leading-snug">{a.como}</div>
            <div className="mt-2 text-[11px] text-neutral-500 italic leading-snug">
              <span className="not-italic text-neutral-400">Quando aplica:</span> {a.quando}
            </div>
          </div>
        ))}
      </div>

      <Worked title="Stack hipotético · DC de R$ 200M investindo R$ 500M em CAPEX">
        <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1">
          <li>Ex-Tarifário em 80% dos R$ 500M importados (−14 pts): <b className="text-sky-300">−R$ 56M</b></li>
          <li>RECAP ou REIDI em 50% do CAPEX (−9,25 pts): <b className="text-violet-300">−R$ 23M</b></li>
          <li>ACL de energia (−20% na conta de luz, ~R$ 60M/ano · 10 anos): <b className="text-rose-300">−R$ 12M/ano</b></li>
          <li>Município de ISS 2% em vez de 5% (R$ 200M receita): <b className="text-fuchsia-300">−R$ 6M/ano</b></li>
          <li>Lei do Bem em R$ 30M de P&D: <b className="text-amber-300">−R$ 10,2M/ano</b></li>
        </ul>
        <p className="mt-2">
          Impacto anual consolidado: <b className="text-neutral-100">R$ 28M/ano</b> em OPEX + <b className="text-neutral-100">R$ 79M</b> no CAPEX.
          Num IRR de 10 anos, isso é ~6 pts de TIR.
        </p>
      </Worked>

      <Deeper>
        As alavancas <b>não são "planejamento tributário agressivo"</b> — são regimes legais com contrapartida (P&D, exportação, infraestrutura, soberania).
        O risco é de <i>forma</i> (documentação insuficiente, não-cumprimento de contrapartida) mais que de <i>substância</i>.
        É por isso que grandes DCs brasileiros têm equipes de ~8–12 pessoas dedicadas só a manter esses regimes — o CFO por si só não consegue.
        A <b>reforma tributária preservou</b> os regimes setoriais de infraestrutura (Anexo XV da LC 214/2025), mas <b>extinguiu</b> a maioria dos regimes genéricos.
        Ex-Tarifário, RECAP e REIDI vão sobreviver; já o benefício de "município ISS 2%" morre junto com o ISS em 2033.
      </Deeper>
    </Card>
  );
};

const ReformaCard = () => {
  const anos = [
    { ano: 2026, cbs: 0.9, ibs: 0.1, legados: 100, nota: 'Ano-teste · CBS/IBS compensáveis contra PIS/COFINS · legados intactos' },
    { ano: 2027, cbs: 8.8, ibs: 0.1, legados: 92, nota: 'CBS cheia (~8,8%) · PIS/COFINS extintos · IPI zerado (exceto ZFM) · IS estreia' },
    { ano: 2028, cbs: 8.8, ibs: 0.1, legados: 92, nota: 'Estabilidade · reforma inicia efeito sobre ICMS/ISS' },
    { ano: 2029, cbs: 8.8, ibs: 1.0, legados: 90, nota: 'IBS começa escalada · ICMS/ISS reduzem 10%' },
    { ano: 2030, cbs: 8.8, ibs: 4.0, legados: 80, nota: 'ICMS/ISS em 80%' },
    { ano: 2031, cbs: 8.8, ibs: 8.0, legados: 60, nota: 'ICMS/ISS em 60% · ponto de virada' },
    { ano: 2032, cbs: 8.8, ibs: 12.0, legados: 40, nota: 'Último ano de ICMS/ISS (em 40%)' },
    { ano: 2033, cbs: 8.8, ibs: 17.7, legados: 0, nota: 'ICMS/ISS extintos · sistema novo pleno' },
  ];
  const maxAliq = 26.5; // CBS + IBS máximo ≈ 26,5%

  return (
    <Card id="reforma" icon={GitBranch} title="Reforma Tributária" subtitle="EC 132/2023 · LC 214/2025 · CBS + IBS + IS" accent="orange" index={12} source="Ministério da Fazenda · cronograma oficial">
      <MinSchema>
        A reforma substitui <b>5 tributos sobre consumo</b> (PIS, COFINS, IPI, ICMS, ISS) por <b>3 novos</b>:
        <br/>
        <Term>CBS</Term> (federal, 8,8%, substitui PIS+COFINS+IPI) ·
        <Term>IBS</Term> (estadual+municipal, 17,7%, substitui ICMS+ISS) ·
        <Term>IS</Term> (seletivo, sobre "pecados"). <br/>
        Alíquota-padrão final ≈ <b>26,5%</b> — uma das mais altas do mundo, mas <b>plenamente não-cumulativa</b>, cobrada no <b>destino</b>, transparente na nota fiscal.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 overflow-x-auto">
        <div className="text-xs text-neutral-500 mb-3">Cronograma de transição · alíquota do novo sistema (CBS+IBS) vs % dos tributos legados</div>

        {/* Grid of years */}
        <div className="space-y-1.5 min-w-[560px]">
          {anos.map((a) => {
            const novoTotal = a.cbs + a.ibs;
            return (
              <div key={a.ano} className="flex items-center gap-3">
                <div className="w-12 text-xs font-mono text-neutral-300">{a.ano}</div>
                {/* novo */}
                <div className="w-1/3 relative h-6 bg-white/5 rounded overflow-hidden">
                  <div className="absolute left-0 top-0 h-full flex">
                    <div className="bg-sky-500/70 h-full" style={{ width: `${(a.cbs / maxAliq) * 100}%` }} />
                    <div className="bg-violet-500/70 h-full" style={{ width: `${(a.ibs / maxAliq) * 100}%` }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/90">
                    {novoTotal > 0.1 ? `${novoTotal.toFixed(1)}%` : ''}
                  </div>
                </div>
                {/* legados */}
                <div className="w-1/3 relative h-6 bg-white/5 rounded overflow-hidden">
                  <div className="bg-rose-500/60 h-full" style={{ width: `${a.legados}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/90">
                    {a.legados > 0 ? `${a.legados}%` : 'extintos'}
                  </div>
                </div>
                <div className="flex-1 text-[11px] text-neutral-400 leading-tight">{a.nota}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-[10px]">
          <span className="inline-flex items-center gap-1 text-sky-300"><span className="w-3 h-3 bg-sky-500/70 rounded-sm" /> CBS</span>
          <span className="inline-flex items-center gap-1 text-violet-300"><span className="w-3 h-3 bg-violet-500/70 rounded-sm" /> IBS</span>
          <span className="inline-flex items-center gap-1 text-rose-300"><span className="w-3 h-3 bg-rose-500/60 rounded-sm" /> PIS/COFINS/IPI/ICMS/ISS (% que ainda resta)</span>
        </div>
      </div>

      <p>
        Cinco mudanças de arquitetura importam mais que os números:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        {[
          { t: 'Não-cumulatividade plena', d: 'Todo gasto empresarial gera crédito, com exceções. Acaba o contencioso de "o que é insumo" que ocupou o STJ por 20 anos.' },
          { t: 'Tributação no destino', d: 'IBS cobrado onde o cliente está, não onde o fornecedor. Fim da guerra fiscal estadual; redistribuição de receita entre estados.' },
          { t: 'Split payment', d: 'Na hora do pagamento, o tributo é automaticamente segregado e enviado ao fisco. Menos caixa passando pela empresa, menos fraude.' },
          { t: 'IBS por dentro → não: por fora', d: 'Diferente do ICMS. Nota fiscal de R$ 100 + 26,5% de IBS/CBS = R$ 126,50. A alíquota é literal, não escondida.' },
          { t: 'Split de IVA dual', d: 'Mundo inteiro tem IVA único; Brasil teve que dividir CBS (federal) + IBS (subnacional) por pressão federativa. Comitê gestor coordena.' },
          { t: 'Cashback para baixa renda', d: 'Famílias CadÚnico recebem devolução automática de CBS/IBS sobre energia, gás, água. Primeiro programa do mundo a ter cashback estrutural.' },
        ].map((x) => (
          <div key={x.t} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-xs font-semibold text-orange-300">{x.t}</div>
            <div className="text-xs text-neutral-400 mt-1 leading-snug">{x.d}</div>
          </div>
        ))}
      </div>

      <Misconception
        wrong="A reforma vai reduzir a carga tributária total."
        right="Não foi esse o objetivo. A reforma é neutra em arrecadação por desenho (art. 130, ADCT). O valor cai para SaaS e indústria pesada; sobe para serviços gerais e alimentação fora de casa. No total, o país continua tributando ~33% do PIB."
        because="Os ganhos vêm de simplificação (Brasil lidera compliance cost do Doing Business) e neutralidade (fim do efeito-cascata) — não de redução nominal. A promessa do governo é que isso gera +0,5 a +2 pts de PIB em crescimento de longo prazo via eficiência alocativa."
      />

      <Deeper>
        A <b>LC 214/2025</b> tem 499 artigos e cobre quase toda a mecânica. Pontos que o card não cabe:
        regimes específicos preservados (Zona Franca de Manaus até 2073, Simples adaptado, regimes setoriais para combustíveis, financeiro, planos de saúde, cooperativas);
        <b> ativo fiscal de transição</b> — estados recebem até 2098 indenização pelo efeito da mudança;
        <b> comitê gestor do IBS</b> — órgão técnico intergovernamental para arrecadação e redistribuição; e
        <b> mecanismo de ajuste de alíquota</b> — a alíquota-padrão de 26,5% é teto, pode cair se a arrecadação exceder a calibração.
      </Deeper>

      <CrossLink to="pos-reforma" recap="a seguir">
        Fecho a seção traduzindo o impacto esperado para um <b>data center Netco 2033</b> — números, delta por linha.
      </CrossLink>
    </Card>
  );
};

const PosReforma = () => {
  // Hypothetical DC of R$300M revenue, pre vs post 2033
  // Pre:
  const linhasPre = [
    { label: 'ISS (serviço)', v: 15, pre: true },
    { label: 'ICMS-energia (embutido na luz)', v: 36, pre: true },
    { label: 'PIS/COFINS líq. crédito', v: 25, pre: true },
    { label: 'IRPJ+CSLL', v: 20, pre: true },
    { label: 'Encargos folha', v: 11, pre: true },
    { label: 'Outros tributos', v: 5, pre: true },
  ];
  const linhasPos = [
    { label: 'IBS + CBS ao cliente (neutro p/ B2B)', v: 0, pos: true, nota: 'cliente PJ credita integralmente — neutro' },
    { label: 'IBS + CBS efetivo (parcela B2C)', v: 12, pos: true, nota: '25% da receita B2C; 26,5% com parcial crédito' },
    { label: 'ICMS-energia → IBS-energia (com crédito)', v: 8, pos: true, nota: 'energia vira IBS e o DC credita — grande ganho' },
    { label: 'IRPJ+CSLL', v: 20, pos: true },
    { label: 'Encargos folha (inalterado)', v: 11, pos: true },
    { label: 'Outros tributos', v: 4, pos: true },
  ];
  const totalPre = linhasPre.reduce((a, l) => a + l.v, 0);
  const totalPos = linhasPos.reduce((a, l) => a + l.v, 0);

  return (
    <Card id="pos-reforma" icon={TrendingUp} title="Netco 2033" subtitle="O data center pós-reforma · ganha ou perde?" accent="emerald" index={13}>
      <MinSchema>
        Para um data center <b>B2B puro</b> (clientes PJ, cloud providers, big techs, bancos), a reforma é <b>benéfica</b>:
        neutraliza a maior parte do ISS+PIS/COFINS, libera crédito de IBS sobre energia (o maior custo), e encerra a disputa "locação vs serviço".
        Para um DC que sirva <b>B2C</b> (edge, streaming, gaming local), o efeito é quase neutro.
      </MinSchema>

      <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="text-xs text-neutral-500 mb-3">Carga efetiva · DC hipotético R$ 300M receita · 70% B2B / 30% B2C · Lucro Real</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-rose-300 mb-2">Pré-reforma (hoje)</div>
            <div className="space-y-1">
              {linhasPre.map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs">
                  <div className="flex-shrink-0 w-40 text-neutral-400 text-[11px] leading-tight" title={l.label}>{l.label}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-rose-500/70 rounded" style={{ width: `${(l.v / 40) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right font-mono text-neutral-300">{l.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-xs">
              <span className="text-neutral-300">Total / R$300</span>
              <span className="font-mono text-rose-300">{totalPre}</span>
            </div>
            <div className="text-[10px] text-neutral-500 text-right">{pct(totalPre / 300, 1)} efetiva</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-emerald-300 mb-2">Pós-reforma (2033)</div>
            <div className="space-y-1">
              {linhasPos.map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs">
                  <div className="flex-shrink-0 w-40 text-neutral-400 text-[11px] leading-tight" title={`${l.label}${l.nota ? ' · ' + l.nota : ''}`}>{l.label}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500/70 rounded" style={{ width: `${(l.v / 40) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right font-mono text-neutral-300">{l.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-xs">
              <span className="text-neutral-300">Total / R$300</span>
              <span className="font-mono text-emerald-300">{totalPos}</span>
            </div>
            <div className="text-[10px] text-neutral-500 text-right">{pct(totalPos / 300, 1)} efetiva</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <div className="text-xs text-neutral-400">Economia anual pós-reforma · DC B2B típico</div>
          <div className="text-xl font-semibold text-emerald-300 font-mono mt-1">R$ {totalPre - totalPos}M / ano</div>
          <div className="text-[11px] text-neutral-500">em R$ 300M de receita · +{pct((totalPre - totalPos) / 300, 1)} pts de margem</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-400/20 p-3">
          <div className="text-xs font-semibold text-emerald-300 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ganhos</div>
          <ul className="mt-1 text-xs text-neutral-300 space-y-1 list-disc list-inside">
            <li>Crédito de IBS sobre energia elétrica (hoje ICMS-energia não gera crédito)</li>
            <li>Neutralidade em B2B — cliente PJ credita integralmente</li>
            <li>Fim da disputa "locação vs serviço"</li>
            <li>Simplificação de compliance (NF-e unificada)</li>
          </ul>
        </div>
        <div className="rounded-lg bg-rose-500/5 border border-rose-400/20 p-3">
          <div className="text-xs font-semibold text-rose-300 inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Perdas</div>
          <ul className="mt-1 text-xs text-neutral-300 space-y-1 list-disc list-inside">
            <li>Fim do regime de ISS 2% em município-sede</li>
            <li>Incerteza sobre sobrevivência de RECAP/REIDI/Ex-Tarifário (provavelmente mantidos)</li>
            <li>Efeito caixa inverso: split payment reduz flutuação</li>
            <li>B2C (edge, streaming): alíquota cheia de 26,5%, sem cadeia</li>
          </ul>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-400/20 p-3">
          <div className="text-xs font-semibold text-amber-300 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> A observar</div>
          <ul className="mt-1 text-xs text-neutral-300 space-y-1 list-disc list-inside">
            <li>ReDATA / REIC — regime setorial em tramitação para DCs</li>
            <li>PEC II (renda e folha) — impacto provável em custo de pessoal 2027+</li>
            <li>Tributação de dividendos (PL 1.087/2025) muda aritmética de sócios</li>
            <li>Definição de "exportação de serviço de nuvem" — ainda aberta na Receita</li>
          </ul>
        </div>
      </div>

      <Deeper>
        O <b>viés B2B</b> da reforma explica parte do boom de DCs no Brasil em 2025–26: investidores anteciparam que,
        sob a reforma, DC brasileiro serve <i>hyperscalers</i> em pé de igualdade (em tributos) com EUA e Chile.
        Antes, carga tributária + fim do ACL aberto + tarifa de energia competitiva eram trade-offs difíceis; a reforma alinhou os incentivos.
        O risco-país — câmbio, judiciário, regulação de dados — permanece. Mas o tributário, a partir de 2033, deixa de ser o fator determinante
        <i> contra</i> um investimento em DC no Brasil. Ao contrário: a combinação de energia barata (hidro + eólica + solar),
        clima não-tropical no Sul e Sudeste, IBS creditável e "soberania de dados" pode, pela primeira vez, fazer o Brasil vencer o leilão de AI colocation.
      </Deeper>

      <p className="text-sm text-neutral-400 italic">
        A reforma não resolve tudo — renda e folha seguem pesadas, dividendos podem ser tributados, e complexidade de compliance
        durante a transição (2026–2032) é alta. Mas, pela primeira vez em 30 anos, o sistema tributário brasileiro tem direção clara e convergente.
      </p>
    </Card>
  );
};

const Trails = () => (
  <Card id="trails" icon={Compass} title="Próximas trilhas" subtitle="Por onde seguir" accent="violet" index={14}>
    <NextSteps groups={[
      {
        title: 'Explainers irmãos',
        note: 'o que já está no sandbox',
        items: [
          { label: 'Data Centers · v2', href: '#data-centers-v2', note: 'A anatomia física do data center — racks, energia, refrigeração, rede. O substrato do card "colocation".' },
          { label: 'The World Economy', href: '#world-economy', note: 'Fluxos, PIB, balanças — onde a carga tributária do Brasil se compara ao resto do mundo.' },
        ],
      },
      {
        title: 'Aprofundar no tema',
        note: 'próximos ganchos úteis',
        items: [
          { label: 'SPED e obrigações acessórias', note: 'NF-e, EFD, ECF, eSocial — a infraestrutura digital do fisco e o custo de conformidade.' },
          { label: 'Preço de transferência', note: 'Lei 14.596/2023 alinhou o Brasil ao padrão OCDE (arm\'s length). Crucial para DC subsidiária de grupo estrangeiro.' },
          { label: 'Planejamento tributário setorial', note: 'Holdings patrimoniais, offshore em PIS/COFINS, reorganizações societárias.' },
          { label: 'Regime especial para data centers', note: 'O ReDATA / REIC em discussão — benefícios propostos, contrapartidas, estado legislativo.' },
        ],
      },
      {
        title: 'Fundações',
        note: 'de onde as regras vêm',
        items: [
          { label: 'Direito tributário constitucional', note: 'Competência tributária, princípios (legalidade, anterioridade, capacidade contributiva).' },
          { label: 'Teoria da incidência tributária', note: 'Regra-matriz, hipótese de incidência, fato gerador, base, alíquota.' },
          { label: 'Economia pública', note: 'Por que tributar consumo vs renda vs riqueza — eficiência, equidade, progressividade.' },
          { label: 'Economia política da tributação', note: 'Por que o Brasil tributa pouco riqueza e muito consumo. O que a reforma não resolve.' },
        ],
      },
      {
        title: 'Ampliando a lente',
        note: 'onde tributação se encontra com o mundo',
        items: [
          { label: 'Carga tributária Brasil × OCDE', note: 'Brasil 33% do PIB ≈ média OCDE, mas com incidência muito mais concentrada em consumo (regressiva).' },
          { label: 'Competitividade de data centers', note: 'Comparativo de carga Brasil × EUA × Chile × Irlanda — por que o Brasil perde leilões de cloud.' },
          { label: 'Guerra fiscal e federação', note: 'ICMS foi o motor da desindustrialização de algumas regiões e da atração de outras. IBS-destino muda esse jogo.' },
          { label: 'Neutralidade e complexidade', note: 'Brasil lidera o ranking global de horas gastas em compliance tributário (Doing Business). A reforma reduz drasticamente.' },
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
        <span>fontes:</span>
        <span className="text-emerald-300">CF/88 · CTN</span>
        <span className="text-sky-300">LC 116/2003</span>
        <span className="text-violet-300">EC 132/2023</span>
        <span className="text-amber-300">LC 214/2025</span>
        <span className="text-fuchsia-300">jurisprudência STF/STJ</span>
        <span className="text-rose-300">Receita Federal</span>
      </div>
      <p className="max-w-xl mx-auto">
        Números refletem a legislação vigente em abr/2026, no "ano-teste" da reforma (CBS 0,9% / IBS 0,1%, ambos compensáveis). Este material é pedagógico — planejamento tributário real exige um contador e um advogado tributarista.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ============================================================================ */

export default function TributacaoBrasilExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <Panorama />
        <Bolo />
        <MapaFederativo />
        <ICMSCard />
        <ISSCard />
        <PisCofinsCard />
        <IrpjCard />
        <FolhaCard />
        <RegimesCard />
        <DCLocServ />
        <DCAlavancas />
        <ReformaCard />
        <PosReforma />
        <Trails />
      </main>

      <Footer />
    </div>
  );
}
