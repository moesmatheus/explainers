import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Landmark, Building2, Users, Briefcase, Banknote, Coins, PiggyBank, Scale, Gavel,
  FileText, FileSignature, Handshake, Search, ShieldCheck, ShieldAlert, TrendingUp,
  TrendingDown, LineChart, CalendarDays, Clock, Route, Layers, Network, Compass,
  ChevronDown, FlaskConical, Lightbulb, Eye, EyeOff, Link2, HelpCircle, AlertTriangle,
  CheckCircle2, XCircle, Ruler, Calculator, Receipt, Percent, Globe2, DoorOpen, BookOpen,
  Star, Flag, ArrowRight, Wallet, Target, Sparkles, Hourglass, ClipboardList, Stamp,
  Filter, RotateCcw, Quote, Boxes, Workflow, Info, Factory, Plus, Minus, ArrowDown,
} from 'lucide-react';

/* ============================================================================
   Private Equity no Brasil — o manual de campo
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   Fio condutor: o FIP fictício "Horizonte IV" comprando a "Tucano S.A.".
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
  teal:    { text: 'text-teal-400',    border: 'border-teal-400/20',    from: 'from-teal-500/15' },
};

const Card = ({ id, icon: Icon, title, subtitle, accent = 'sky', index, source, anchor, children }) => {
  const a = accentMap[accent];
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative rounded-2xl bg-neutral-900/60 border backdrop-blur-sm p-6 md:p-8 shadow-xl shadow-black/30 overflow-hidden scroll-mt-24 ${anchor ? 'border-fuchsia-400/40 ring-1 ring-fuchsia-400/20' : 'border-white/10'}`}
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
            {anchor && <span className="text-[10px] normal-case tracking-normal text-fuchsia-300">★ âncora</span>}
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
  // veículo & fundo
  'FIP': 'Fundo de Investimento em Participações — o veículo-padrão do PE no Brasil. Um condomínio regulado pela CVM (RCVM 175, Anexo Normativo IV) que compra participações em empresas e precisa influir de fato na gestão delas.',
  'RCVM 175': 'Resolução CVM 175/2022 — o marco atual de fundos. Criou classes e subclasses de cotas, a responsabilidade limitada do cotista e a dupla de prestadores essenciais (administrador + gestor). Os FIPs ficam no Anexo Normativo IV.',
  'ICVM 578': 'A instrução que regulava os FIPs antes da RCVM 175 (2016–2023). Ainda aparece no corredor e em regulamentos antigos.',
  'administrador fiduciário': 'Instituição autorizada pela CVM (banco, DTVM) que responde pelo fundo perante o mundo: registro, contabilidade, informes, assembleias, contratação de auditor. Não decide investimentos.',
  'gestor': 'A gestora — a "casa de PE". Decide o que comprar, monitorar e vender. Na RCVM 175 é prestador essencial ao lado do administrador. Recebe a taxa de gestão e a taxa de performance (carry).',
  'custodiante': 'Guarda e concilia os ativos do fundo e liquida as operações. Em FIP os ativos são ações fechadas, então a custódia é mais escritural.',
  'cotista': 'O investidor do fundo (o LP). Detém cotas, vota em assembleia e, se a classe tiver responsabilidade limitada, responde só até o capital que subscreveu.',
  'LP': 'Limited Partner — no Brasil, o cotista do FIP: fundos de pensão, seguradoras, family offices, fundos de fundos, investidores estrangeiros, BNDESPar.',
  'GP': 'General Partner — a gestora. No FIP não existe "GP" como figura jurídica: o papel se divide entre gestor e administrador.',
  'regulamento': 'O "estatuto" do fundo: política de investimento, taxas, prazos, governança, direitos dos cotistas. Na RCVM 175: parte geral + anexo por classe + apêndice por subclasse.',
  'classe': 'Na RCVM 175, um fundo pode ter várias classes de cotas, cada uma com patrimônio segregado e política própria — funcionam como subfundos.',
  'responsabilidade limitada': 'Opção da RCVM 175 (herdada da Lei da Liberdade Econômica) em que o cotista responde só até o valor que subscreveu, mesmo se o patrimônio da classe ficar negativo.',
  'capital comprometido': 'O valor que o cotista se obriga a aportar ao longo da vida do fundo, conforme as chamadas. Formalizado no compromisso de investimento.',
  'chamada de capital': 'Notificação que pede aos cotistas para integralizar parte do capital comprometido (prazo típico de ~10 dias úteis) para um investimento ou para pagar despesas.',
  'compromisso de investimento': 'Contrato em que o cotista se obriga a integralizar cotas até um valor, quando chamado. Define as penalidades para quem não paga.',
  'integralização': 'A entrega efetiva do dinheiro ao fundo em troca das cotas subscritas.',
  'amortização': 'Devolução de capital e ganho ao cotista sem extinguir as cotas. É assim que o FIP distribui o dinheiro de uma venda.',
  'período de investimento': 'A janela (tipicamente 4–6 anos) em que o fundo pode fazer investimentos novos. Depois dela, só follow-ons e despesas.',
  'período de desinvestimento': 'A fase depois do período de investimento, em que a gestora vende as participações e devolve o capital. A assembleia pode prorrogar.',
  'assembleia de cotistas': 'Órgão máximo do fundo. Vota regulamento, prorrogações, conflitos de interesse, troca de gestor, contas anuais.',
  'taxa de gestão': 'Remuneração da gestora: tipicamente 1,5–2,0% a.a. sobre o capital comprometido no período de investimento e sobre o capital investido depois dele.',
  'taxa de administração': 'Na RCVM 175, a remuneração do administrador fiduciário, separada da taxa de gestão. Em FIP costuma ser pequena (centésimos a décimos de ponto) com piso mensal em reais.',
  'taxa de performance': 'Nome regulatório do carried interest: a parte do lucro (tipicamente 20%) que vai para a gestora depois que o cotista recebe o capital de volta mais o hurdle.',
  'carry': 'Carried interest — a participação da gestora no lucro do fundo (tipicamente 20%). No FIP é formalizada como taxa de performance.',
  'hurdle': 'Retorno preferencial mínimo do cotista antes de a gestora participar do lucro. No Brasil costuma ser indexado à inflação (IPCA + X% a.a.) ou, às vezes, ao CDI.',
  'catch-up': 'Faixa do waterfall, logo depois do hurdle, em que a gestora recebe a maior parte (ou 100%) do lucro até alcançar seus 20% sobre o lucro total.',
  'clawback': 'Obrigação de a gestora devolver o carry recebido a mais quando, no fim, o fundo como um todo não entrega o hurdle.',
  'waterfall': 'A ordem de distribuição do caixa: (1) devolve capital, (2) paga o hurdle, (3) catch-up da gestora, (4) divide 80/20.',
  'J-curve': 'O formato do fluxo acumulado do cotista: negativo nos primeiros anos (taxas e investimentos), só vira positivo quando as saídas começam.',
  'TVPI': 'Total Value to Paid-In — (distribuído + valor residual) ÷ capital integralizado. O múltiplo do fundo, parte em caixa e parte no papel.',
  'DPI': 'Distributions to Paid-In — distribuído ÷ integralizado. O único múltiplo que já virou caixa. Por isso os LPs dizem "DPI is the new TVPI".',
  'RVPI': 'Residual Value to Paid-In — valor dos ativos ainda no fundo ÷ integralizado. TVPI = DPI + RVPI.',
  'MOIC': 'Multiple on Invested Capital — quanto voltou ÷ quanto foi investido num ativo. Não considera o tempo.',
  'TIR': 'Taxa Interna de Retorno (IRR): a taxa que zera o valor presente dos fluxos. A TIR premia sair cedo; o MOIC premia ganhar muito.',
  'vintage': 'O ano do primeiro investimento (ou do first close) de um fundo. Fundos são comparados dentro da mesma safra.',
  'first close': 'O primeiro fechamento da captação: o fundo passa a existir e pode investir enquanto segue captando até o final close.',
  'side letter': 'Acordo bilateral entre gestora e um cotista com direitos específicos: desconto de taxa, co-investimento, relatórios extras, restrições setoriais.',
  'MFN': 'Most Favoured Nation — dá ao cotista o direito de receber os benefícios de side letters dados a cotistas de porte igual ou menor.',
  'key person': 'Cláusula que suspende o período de investimento se os sócios-chave da gestora deixarem de se dedicar ao fundo.',
  'comitê de investimentos': 'O colegiado da gestora que aprova (ou não) cada compra e venda a partir de um IC memo.',
  'IC memo': 'Memorando ao comitê de investimentos com tese, valuation, riscos, estrutura e plano de criação de valor.',
  'LPAC': 'Limited Partners Advisory Committee — comitê de cotistas (no Brasil, "comitê de acompanhamento" ou "consultivo") que delibera conflitos de interesse e metodologia de valuation.',
  'co-investimento': 'Investimento direto de um cotista ao lado do fundo num deal específico, em geral sem taxas ou com taxas reduzidas.',
  'dry powder': 'Capital comprometido que ainda não foi investido.',
  'valor justo': 'Fair value. A carteira do FIP é marcada a valor justo (o fundo é entidade de investimento), e é essa marcação que alimenta TVPI e RVPI.',
  'entidade de investimento': 'Classificação contábil (CPC 18/IFRS 10) e tributária (Lei 14.754/2023) do fundo que investe de fato para ganhar com valorização. Para o FIP ela garante o diferimento: o cotista só paga IR quando recebe.',
  // participantes
  'EFPC': 'Entidade Fechada de Previdência Complementar: o fundo de pensão (Previ, Petros, Funcef…). LP histórico do PE brasileiro, com limites de alocação dados pela Resolução CMN 4.994.',
  'Resolução CMN 4.994': 'Regras de aplicação dos fundos de pensão fechados. Limita quanto podem alocar em "estruturados" (FIP incluído) e exige requisitos da gestora e do fundo.',
  'DTVM': 'Distribuidora de Títulos e Valores Mobiliários — tipo de instituição que costuma atuar como administrador fiduciário ou custodiante.',
  'ANBIMA': 'Associação das entidades dos mercados financeiro e de capitais. Autorregula gestoras e administradores (códigos, certificações, classificação de fundos).',
  'ABVCAP': 'Associação Brasileira de Private Equity e Venture Capital: a entidade do setor. Publica dados de mercado, código de boas práticas e modelos de documentos.',
  'investidor qualificado': 'Investidor com pelo menos R$ 1 milhão em aplicações financeiras (ou certificação profissional). É o público típico de FIP.',
  'investidor profissional': 'Investidor com pelo menos R$ 10 milhões em aplicações (ou institucional). Acessa ofertas e fundos com menos proteção regulatória.',
  'BNDESPar': 'O braço de participações do BNDES. É cotista âncora de vários FIPs e co-investidor.',
  // deal
  'NDA': 'Acordo de confidencialidade assinado antes de receber qualquer informação da empresa-alvo. Costuma trazer non-solicit (não contratar os executivos da alvo).',
  'teaser': 'Resumo anônimo de 1–2 páginas que o assessor de M&A manda a potenciais compradores.',
  'CIM': 'Confidential Information Memorandum: o "book" da empresa, com histórico, mercado e números. Enviado depois do NDA.',
  'IOI': 'Indication of Interest: proposta não vinculante com faixa de valor e premissas. É a 1ª rodada do leilão.',
  'proposta vinculante': 'Oferta firme (binding offer) com preço, estrutura, markup do SPA e fontes de financiamento. Encerra a 2ª rodada.',
  'MoU': 'Memorando de entendimentos (ou term sheet): vinculante em exclusividade e confidencialidade, não no preço.',
  'VDR': 'Virtual Data Room — o repositório online com os documentos da empresa para a due diligence, com perguntas e respostas (Q&A) controladas.',
  'QoE': 'Quality of Earnings — due diligence financeira que "limpa" o EBITDA: tira não recorrentes, aplica ajustes pró-forma, testa a qualidade do capital de giro.',
  'SPA': 'Share Purchase Agreement: o contrato de compra e venda de ações (CCVA). Define preço, ajustes, declarações, indenização e condições para fechar.',
  'acordo de acionistas': 'Contrato entre os sócios (art. 118 da Lei 6.404) que regula voto, conselho, transferência de ações e saídas. Arquivado na sede, vincula a companhia.',
  'signing': 'Assinatura do SPA. Cria as obrigações, mas a transferência das ações só acontece no closing.',
  'closing': 'Fechamento: as condições precedentes foram cumpridas, o preço é pago e as ações mudam de dono.',
  'condições precedentes': 'CPs: eventos que precisam acontecer entre signing e closing, como aprovação do CADE, waivers de credores, reorganizações e consentimentos de contrapartes.',
  'locked box': 'Mecanismo de preço fixo com base num balanço passado. O vendedor promete não retirar valor da empresa (leakage) até o closing.',
  'completion accounts': 'Mecanismo em que o preço é ajustado depois do closing, pela dívida líquida e pelo capital de giro apurados na data de fechamento.',
  'leakage': 'Qualquer saída de valor para o vendedor entre a data do balanço e o closing num locked box: dividendos, bônus, pagamentos a partes relacionadas.',
  'earn-out': 'Parte do preço condicionada a metas futuras (EBITDA, receita). Serve de ponte quando comprador e vendedor discordam do valuation.',
  'escrow': 'Conta vinculada (conta garantia) em que parte do preço fica retida por anos para cobrir indenizações. No Brasil, 10–20% do preço não é raro.',
  'holdback': 'Parte do preço que o comprador simplesmente não paga no closing e retém para compensar indenizações futuras.',
  'basket': 'Franquia de indenização. Perdas somadas abaixo dela não são pagas (deductible) ou, se o limite é ultrapassado, são pagas desde o primeiro real (tipping).',
  'de minimis': 'Valor mínimo de cada reclamação para que ela conte para o basket.',
  'cap': 'Teto da responsabilidade do vendedor por indenizações, em % do preço.',
  'W&I': 'Warranty & Indemnity insurance: seguro que cobre violações das declarações e garantias do vendedor e substitui parte do escrow.',
  'R&W': 'Representations & Warranties — as declarações e garantias do vendedor sobre a empresa (balanços, impostos, contratos, litígios…).',
  'MAC': 'Material Adverse Change: cláusula que permite ao comprador desistir entre signing e closing se algo muito adverso acontecer.',
  'tag-along': 'Direito do minoritário de vender junto, nas mesmas condições, se o controlador vender. Lei 6.404 (art. 254-A): 80% do preço para ações com voto em companhia aberta. No Novo Mercado: 100%.',
  'drag-along': 'Direito do majoritário de obrigar os minoritários a vender junto. Essencial para o fundo entregar 100% da empresa ao comprador na saída.',
  'direito de preferência': 'Direito do sócio de comprar, nas mesmas condições, as ações que outro sócio quer vender a terceiros.',
  'lock-up': 'Período em que o sócio não pode vender suas ações.',
  'put': 'Opção de venda: o direito de obrigar a outra parte a comprar suas ações por um preço ou fórmula definidos.',
  'EV': 'Enterprise Value: o valor da empresa inteira, para todos os financiadores. EV − dívida líquida ± ajustes = valor das ações.',
  'equity value': 'Valor das ações, o que efetivamente vai para o vendedor.',
  'dívida líquida': 'Dívida bruta − caixa. No SPA a definição é negociada linha a linha.',
  'debt-like': 'Itens que parecem dívida e reduzem o preço: contingências prováveis, parcelamentos fiscais, dividendos declarados, FGTS atrasado, bônus a pagar.',
  'capital de giro': 'Contas a receber + estoques − fornecedores. O SPA fixa um nível "normal" (peg). O desvio no closing ajusta o preço real por real.',
  'peg': 'O nível normal de capital de giro acordado no SPA. Normalmente a média dos últimos 12 meses, para neutralizar sazonalidade.',
  'EBITDA': 'Lucro antes de juros, impostos, depreciação e amortização. É o motor de caixa que ancora o valuation e o tamanho da dívida.',
  'EBITDA ajustado': 'EBITDA depois de remover não recorrentes e somar ajustes pró-forma. Toda negociação começa brigando por ele.',
  'múltiplo': 'EV ÷ EBITDA. A régua de preço do PE.',
  'add-on': 'Aquisição menor que se pluga numa empresa da carteira (a plataforma). Base do buy-and-build.',
  'buy-and-build': 'Comprar uma plataforma e crescer comprando empresas menores, mais baratas (arbitragem de múltiplos + sinergias).',
  'carve-out': 'Compra de uma divisão de uma empresa maior, que precisa ser "descolada" (TSA, sistemas, pessoas, contratos).',
  'TSA': 'Transition Services Agreement: o vendedor segue prestando serviços (TI, folha, contabilidade) à unidade vendida por um período.',
  '100-day plan': 'Plano dos primeiros 100 dias depois do closing: governança, reporting, trocas de gestão, ganhos rápidos.',
  'MIP': 'Management Incentive Plan: plano de incentivo dos executivos (ações, opções, phantom), desenhado para pagar muito só se o fundo ganhar muito.',
  'phantom shares': 'Ações virtuais: bônus em dinheiro atrelado ao valor da ação, sem virar sócio. Simples, mas tributado como remuneração.',
  'sweet equity': 'Ações que os executivos compram barato numa estrutura em que o fundo entra majoritariamente via instrumento preferencial. Alavanca o retorno do management.',
  'laudo de avaliação': 'Relatório independente de valor, exigido em várias situações: aporte de ações em fundo, alocação do ágio, conflitos de interesse, incorporações.',
  // dívida
  'debênture': 'Título de dívida emitido por S.A. (Lei 6.404, arts. 52+), registrado na B3. O principal instrumento de dívida de aquisição no Brasil.',
  'nota comercial': 'Título de dívida escritural criado pela Lei 14.195/2021. Mais leve que a debênture, e pode ser emitido também por limitadas.',
  'CCB': 'Cédula de Crédito Bancário: o empréstimo bancário padrão em forma de título, bilateral e executável.',
  'CDI': 'Taxa dos depósitos interbancários de um dia. É a referência do crédito brasileiro e anda colada na Selic. A dívida corporativa é quase toda "CDI + spread".',
  'Selic': 'Taxa básica de juros, definida pelo Copom do Banco Central. O CDI anda colado nela.',
  'IPCA': 'O índice oficial de inflação (IBGE). Dívida longa de infraestrutura e hurdles de fundos costumam ser IPCA + X%.',
  'spread': 'Prêmio sobre o indexador (ex.: CDI + 2,5%). Reflete risco, prazo e garantias.',
  'covenant': 'Compromisso contratual de manter indicadores (ex.: dívida líquida/EBITDA ≤ 3,0x). Se quebrar: vencimento antecipado, salvo waiver.',
  'waiver': 'Perdão formal do credor a uma quebra de covenant ou a um evento (como mudança de controle). Costuma custar um fee.',
  'vencimento antecipado': 'Evento que torna a dívida exigível imediatamente: default, quebra de covenant, mudança de controle, cross-default.',
  'cross-default': 'Cláusula em que o default de outra dívida também dispara o vencimento desta.',
  'mudança de controle': 'Change of control: gatilho clássico de vencimento antecipado em debêntures, CCBs e contratos comerciais. Todo deal de PE esbarra nele.',
  'ICSD': 'Índice de Cobertura do Serviço da Dívida: geração de caixa ÷ (juros + amortização). Credores pedem ≥ 1,2–1,5x.',
  'agente fiduciário': 'Representante dos debenturistas (Lei 6.404, art. 66). Fiscaliza covenants e garantias e convoca a assembleia de debenturistas.',
  'AGD': 'Assembleia Geral de Debenturistas: onde se votam waivers, mudanças de covenant e repactuações.',
  'garantia firme': 'Compromisso do banco coordenador de comprar a parte da emissão que não for vendida aos investidores. Custa um fee extra e dá certeza de funding para o SPA.',
  'alienação fiduciária': 'Garantia em que a propriedade de um bem (ações, imóvel, equipamento) passa ao credor até a dívida ser paga. A garantia real mais usada.',
  'cessão fiduciária': 'Garantia sobre direitos creditórios (recebíveis, conta vinculada). O fluxo dos clientes vai para uma conta controlada pelo credor.',
  'fiança': 'Garantia pessoal em que um terceiro (controladora, sócio) responde pela dívida.',
  'FIDC': 'Fundo de Investimento em Direitos Creditórios: veículo de securitização de recebíveis. Capital de giro mais barato que CCB para quem tem carteira pulverizada.',
  'CRI': 'Certificado de Recebíveis Imobiliários: securitização de créditos imobiliários, inclusive aluguéis de built-to-suit e sale-leaseback.',
  'CRA': 'Certificado de Recebíveis do Agronegócio: securitização ligada à cadeia do agro.',
  'Lei 4.131': 'Empréstimo em moeda estrangeira tomado direto no exterior (Lei 4.131/1962), quase sempre com swap para CDI.',
  'BNDES': 'O banco federal de desenvolvimento. Financia expansão e capex (FINEM, FINAME) a TLP.',
  'debênture incentivada': 'Debênture de infraestrutura (Lei 12.431/2011) cujos juros são isentos de IR para pessoa física e estrangeiro. Por isso sai mais barata para o emissor.',
  'RCVM 160': 'Resolução CVM 160/2022, as regras de ofertas públicas. Rito automático (sem análise prévia da CVM, típico para profissionais e qualificados) ou rito ordinário. Substituiu a antiga ICVM 476.',
  'bookbuilding': 'Coleta de intenções de investimento que define a taxa final da emissão.',
  'dividend recap': 'Emitir dívida na empresa da carteira para pagar dividendos ao fundo. Devolve caixa ao cotista sem vender o ativo.',
  // regulação & impostos
  'CADE': 'Conselho Administrativo de Defesa Econômica. Aprova previamente fusões e aquisições acima dos limites de faturamento (Lei 12.529/2011).',
  'gun jumping': 'Consumar a operação, no todo ou em parte, antes da aprovação do CADE: integrar operações, trocar informação sensível, pagar o preço. Gera multa e nulidade dos atos.',
  'procedimento sumário': 'Rito simplificado do CADE para operações sem preocupação concorrencial. É onde cai a maioria dos deals de PE.',
  'ágio': 'Diferença entre o preço pago e o valor contábil do patrimônio adquirido. Uma parte vira mais-valia de ativos; o resto é goodwill.',
  'goodwill': '"Ágio por rentabilidade futura". Pode ser amortizado para fins fiscais em até 1/60 por mês depois que adquirente e adquirida se juntam por incorporação, fusão ou cisão (Lei 12.973/2014). Exige laudo e partes não dependentes.',
  'PPA': 'Purchase Price Allocation: laudo que distribui o preço entre ativos a valor justo, intangíveis e goodwill. É a base da amortização fiscal do ágio.',
  'incorporação reversa': 'A empresa operacional incorpora a holding que a comprou. Junta a dívida de aquisição e a geração de caixa no mesmo CNPJ e destrava a dedução do ágio.',
  'push-down': 'Levar a dívida de aquisição da holding para a empresa operacional (via incorporação), para que os juros sejam dedutíveis contra o lucro que os paga.',
  'JCP': 'Juros sobre Capital Próprio: remuneração ao acionista dedutível no IRPJ/CSLL da empresa (limitada pela TJLP aplicada ao patrimônio líquido), com IR retido na fonte de quem recebe.',
  'contingência': 'Passivo potencial (processo trabalhista, tributário, cível). Pelo CPC 25: provável (provisiona), possível (só divulga), remota (ignora).',
  'sucessão': 'Regra pela qual quem compra herda passivos da empresa adquirida (tributários, trabalhistas, anticorrupção), inclusive os que desconhecia.',
  'recuperação judicial': 'Reorganização de empresa em crise (Lei 11.101/2005, reformada pela Lei 14.112/2020). Credores votam um plano, e ativos podem ser vendidos em UPI.',
  'UPI': 'Unidade Produtiva Isolada: ativo vendido dentro de uma recuperação judicial, livre de sucessão das dívidas. Porta clássica de entrada do distressed.',
  'IED': 'Investimento Estrangeiro Direto: capital de não residente em empresa brasileira, declarado ao Banco Central sob o novo marco cambial (Lei 14.286/2021).',
  'Novo Mercado': 'Segmento da B3 com as regras de governança mais rígidas: só ações ordinárias, tag-along de 100%, conselheiros independentes.',
  'continuation fund': 'Veículo novo, criado pela própria gestora, que compra um ou mais ativos do fundo antigo. Dá liquidez a quem quer sair e mais tempo a quem quer ficar.',
  'secundário': 'Venda de cotas de fundo (LP-led) ou de ativos entre veículos da mesma gestora (GP-led). O mercado de liquidez do PE.',
  'CPC 25': 'Norma contábil de provisões e contingências: provável → provisiona; possível → divulga em nota; remota → nada.',
  'Lei 6.404': 'A Lei das S.A. (1976): debêntures, acordo de acionistas, conselho, tag-along, incorporações. A espinha dorsal societária de todo deal.',
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

// --- small controls ----------------------------------------------------------

const Slider = ({ label, value, min, max, step = 1, onChange, fmt = (v) => v, accent = 'accent-amber-400', hint }) => (
  <label className="block">
    <div className="flex items-baseline justify-between gap-2 text-[11px]">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{fmt(value)}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full mt-1 ${accent}`}
    />
    {hint && <div className="text-[10px] text-neutral-500 -mt-0.5">{hint}</div>}
  </label>
);

const Seg = ({ options, value, onChange, size = 'sm' }) => (
  <div className="inline-flex flex-wrap gap-1 rounded-lg bg-white/[0.03] border border-white/10 p-1">
    {options.map((o) => (
      <button
        key={o.id}
        onClick={() => onChange(o.id)}
        className={`rounded-md px-2.5 ${size === 'xs' ? 'py-0.5 text-[10px]' : 'py-1 text-[11px]'} transition-colors ${
          value === o.id
            ? 'bg-amber-400/15 text-amber-100 border border-amber-400/40'
            : 'text-neutral-400 border border-transparent hover:text-neutral-200 hover:bg-white/5'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Eyebrow = ({ children, color = 'text-neutral-500' }) => (
  <div className={`text-[10px] uppercase tracking-[0.2em] ${color}`}>{children}</div>
);

// --- running anchor: the FIP Horizonte IV buys Tucano S.A. ------------------
// Valores em R$ milhões. Empresa, gestora e fundo são fictícios.

const DEAL = {
  alvo: 'Tucano S.A.',
  setor: 'distribuidora de produtos médico-hospitalares no Sul e Sudeste',
  receita: 1200,
  ebitda: 100,
  multEntrada: 8.0,
  dividaBruta: 150,
  caixa: 30,
  debtLike: [
    { k: 'Parcelamento fiscal (REFIS/transação)', v: 18 },
    { k: 'Contingências trabalhistas prováveis', v: 12 },
    { k: 'Dividendos declarados e não pagos', v: 5 },
  ],
  alavancagem: 2.5, // dívida de aquisição, em x EBITDA
  spread: 2.75, // CDI + spread da debênture de aquisição
};
DEAL.ev = DEAL.ebitda * DEAL.multEntrada; // 800
DEAL.dl = DEAL.dividaBruta - DEAL.caixa; // 120
DEAL.debtLikeTotal = DEAL.debtLike.reduce((s, d) => s + d.v, 0); // 35

// Sources & Uses no closing (R$ M)
const SU = (() => {
  const precoAcoes = DEAL.ev - DEAL.dl - DEAL.debtLikeTotal; // 645
  const refi = DEAL.dividaBruta; // quita a dívida antiga (mudança de controle)
  const custos = 18; // DD, advogados, estruturação da dívida, CADE…
  const debenture = DEAL.ebitda * DEAL.alavancagem; // 250
  const rollover = 70; // fundador reinveste parte do preço
  const usos = precoAcoes + refi + custos;
  const equityFip = usos - debenture - rollover;
  const equityTotal = equityFip + rollover;
  return {
    precoAcoes, refi, custos, debenture, rollover, usos, equityFip, equityTotal,
    pctFip: equityFip / equityTotal,
  };
})();

const FUNDO = {
  nome: 'FIP Horizonte IV',
  gestora: 'Horizonte Capital',
  tamanho: 2500, // R$ M comprometidos
  taxaGestao: 0.02,
  carry: 0.2,
  hurdleReal: 0.06, // IPCA + 6%
};

const fmtM = (v, d = 0) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' M';
const fmtBi = (v, d = 1) => 'R$ ' + (v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' bi';
const fmtMB = (v) => (Math.abs(v) >= 1000 ? fmtBi(v) : fmtM(v));
const fmtX = (v, d = 1) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + 'x';
const fmtP = (v, d = 1) => (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';

/* ============================================================================
   HERO
   ============================================================================ */

const Drift = () => {
  const pts = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    x: (i * 37) % 100, y: (i * 53) % 100, d: 8 + (i % 5) * 2, c: i % 3,
  })), []);
  const col = ['bg-amber-300', 'bg-teal-300', 'bg-violet-300'];
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden opacity-40">
      {pts.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute w-1 h-1 rounded-full ${col[p.c]}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [0, 0.7, 0], x: [0, 140] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.07] via-teal-500/5 to-transparent" />
    <Drift />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-amber-200/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/20">
          <Briefcase className="w-3.5 h-3.5" /> manual de campo · 2026
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-amber-100 to-teal-200 bg-clip-text text-transparent">
          Private Equity no Brasil
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          O que a teoria de finanças não conta: o veículo (FIP), quem faz o quê, o cardápio de dívida com{' '}
          <span className="text-amber-300 font-mono">CDI</span> alto, custos, contratos, CADE, impostos e o vocabulário do corredor. Tudo amarrado num deal fictício, do teaser à saída:{' '}
          <span className="text-teal-300 font-mono">{FUNDO.nome}</span> compra a{' '}
          <span className="text-teal-300 font-mono">{DEAL.alvo}</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-amber-300">fundo</span>
          <span className="text-teal-300">deal</span>
          <span className="text-sky-300">dívida</span>
          <span className="text-violet-300">regulação</span>
          <span className="text-rose-300">rotina</span>
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
  { id: 'tabuleiro',   label: 'O tabuleiro',            icon: Network, anchor: true },
  { id: 'fip',         label: 'O FIP por dentro',       icon: Layers },
  { id: 'ciclo',       label: 'Vida do fundo',          icon: Hourglass },
  { id: 'economia',    label: 'Taxas e waterfall',      icon: Percent },
  { id: 'custos',      label: 'Onde o dinheiro vaza',   icon: Receipt },
  { id: 'processo',    label: 'Do teaser ao closing',   icon: Route },
  { id: 'dd',          label: 'Due diligence BR',       icon: Search },
  { id: 'ponte',       label: 'Do EV ao cheque',        icon: Calculator },
  { id: 'contratos',   label: 'SPA e acordo',           icon: FileSignature },
  { id: 'divida',      label: 'Cardápio de dívida',     icon: Banknote },
  { id: 'alavancagem', label: 'Quanto de dívida cabe',  icon: Scale },
  { id: 'estrutura',   label: 'Holding, ágio, IR',      icon: Boxes },
  { id: 'regulacao',   label: 'CADE e câmbio',          icon: Gavel },
  { id: 'rotina',      label: 'Depois do closing',      icon: CalendarDays },
  { id: 'saidas',      label: 'Saídas',                 icon: DoorOpen },
  { id: 'deal',        label: 'O deal inteiro',         icon: Star, anchor: true },
  { id: 'dicionario',  label: 'Dicionário de corredor', icon: BookOpen },
  { id: 'trilhas',     label: 'Próximas trilhas',       icon: Compass },
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
        <ul className="space-y-0.5 text-xs">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`group flex items-center gap-2 py-1 pl-2.5 pr-3 rounded-lg border transition-colors ${active === s.id ? 'bg-amber-500/10 border-amber-400/30 text-amber-200' : 'border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
                  <Icon className={`w-3.5 h-3.5 opacity-80 ${s.anchor ? 'text-fuchsia-300' : ''}`} />
                  <span className="font-mono tabular-nums text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="tracking-wide">{s.label}</span>
                  {s.anchor && <span className="text-[9px] text-fuchsia-300">★</span>}
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
              <a href={`#${s.id}`} className={`block px-3 py-1.5 rounded-md border ${active === s.id ? 'bg-amber-500/10 border-amber-400/30 text-amber-200' : 'border-transparent text-neutral-400'}`}>
                <span className="font-mono text-[9px] opacity-60 mr-1">{String(i + 1).padStart(2, '0')}</span>{s.label}{s.anchor ? ' ★' : ''}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

/* ============================================================================
   CARDS
   ============================================================================ */

const secIndex = (id) => SECTIONS.findIndex((s) => s.id === id) + 1;


/* ---------------------------------------------------------------- 01 · TABULEIRO */

const TONE = {
  amber:   { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.10)', text: '#fde68a' },
  violet:  { stroke: '#a78bfa', fill: 'rgba(167,139,250,0.10)', text: '#ddd6fe' },
  teal:    { stroke: '#2dd4bf', fill: 'rgba(45,212,191,0.10)', text: '#99f6e4' },
  sky:     { stroke: '#38bdf8', fill: 'rgba(56,189,248,0.10)', text: '#bae6fd' },
  rose:    { stroke: '#fb7185', fill: 'rgba(251,113,133,0.10)', text: '#fecdd3' },
  neutral: { stroke: '#737373', fill: 'rgba(255,255,255,0.04)', text: '#e5e5e5' },
};

const FLOW = {
  capital: { color: '#fbbf24', label: 'capital' },
  taxa:    { color: '#fb7185', label: 'taxas' },
  divida:  { color: '#38bdf8', label: 'dívida' },
  gov:     { color: '#a78bfa', label: 'governança / serviço' },
};

const TAB_NODES = [
  { id: 'lps', x: 360, y: 40, w: 270, h: 46, label: 'Cotistas (LPs)', sub: 'pensão · seguros · family offices · estrangeiros', tone: 'amber',
    info: {
      oque: 'Quem põe o dinheiro. Fundos de pensão (EFPCs), seguradoras, family offices, fundos de fundos, BNDESPar e estrangeiros, que em geral entram por um fundo offshore que investe no FIP.',
      ganha: 'Recebem capital + hurdle antes da gestora e ~80% do lucro acima disso. Pagam as taxas.',
      dia: 'Chamadas de capital, relatório trimestral, assembleias, comitê de cotistas (LPAC), questionários de due diligence sobre a gestora.',
      doc: 'Compromisso de investimento, boletim de subscrição, side letter.',
    } },
  { id: 'gestora', x: 120, y: 150, w: 180, h: 46, label: 'Gestora', sub: 'decide · o "GP"', tone: 'violet',
    info: {
      oque: 'A casa de PE: origina, analisa, compra, monitora e vende. Autorizada pela CVM a gerir carteira. Senta no conselho das investidas.',
      ganha: 'Taxa de gestão (~2% a.a.) para pagar o time; carry (~20% do lucro acima do hurdle) para enriquecer o time.',
      dia: 'Pipeline, modelos, due diligence, comitê de investimentos, conselhos, relatórios aos cotistas, captação do próximo fundo.',
      doc: 'IC memo, relatório trimestral, valuation da carteira.',
    } },
  { id: 'fip', x: 360, y: 150, w: 190, h: 52, label: FUNDO.nome, sub: 'o veículo · CNPJ próprio', tone: 'amber',
    info: {
      oque: 'Um condomínio de cotistas, com CNPJ próprio e sem funcionários. Juridicamente, quem "age" por ele são o administrador e a gestora.',
      ganha: 'Não ganha: é um cano. Recebe aportes, investe, recebe dividendos e vendas, amortiza cotas.',
      dia: 'Existe no papel: regulamento, atas de assembleia, demonstrações auditadas, informes à CVM.',
      doc: 'Regulamento (parte geral + anexo da classe).',
    } },
  { id: 'adm', x: 600, y: 150, w: 180, h: 46, label: 'Administrador', sub: 'formaliza · reporta', tone: 'violet',
    info: {
      oque: 'Instituição (banco ou DTVM) que responde pelo fundo perante CVM, Receita e cotistas: registro, contabilidade, informes, assembleias, chamadas de capital.',
      ganha: 'Taxa de administração, pequena, com piso mensal em reais.',
      dia: 'Você fala com ele para chamar capital, convocar assembleia, aprovar despesa do fundo, registrar um investimento.',
      doc: 'Convocações, atas, informes periódicos, demonstrações contábeis.',
    } },
  { id: 'prest', x: 600, y: 235, w: 180, h: 46, label: 'Custódia · auditoria', sub: 'controladoria · distribuição', tone: 'neutral',
    info: {
      oque: 'Custodiante (guarda e liquida ativos), auditor independente (parecer anual), controladoria, distribuidor que coloca as cotas.',
      ganha: 'Fees fixos, pagos pelo fundo como despesa (ou seja, pelos cotistas).',
      dia: 'Março e abril: auditoria das demonstrações e do valor justo da carteira.',
      doc: 'Parecer do auditor, laudos de valor justo.',
    } },
  { id: 'assess', x: 120, y: 235, w: 180, h: 46, label: 'Assessores', sub: 'M&A · advogados · Big Four', tone: 'neutral',
    info: {
      oque: 'Assessor de M&A (buy- ou sell-side), escritórios de advocacia, Big Four (QoE, fiscal), consultorias (comercial, ESG), corretoras de seguro (W&I).',
      ganha: 'Honorários por hora ou por projeto; o assessor de M&A ganha success fee sobre o valor da transação.',
      dia: 'Durante o deal, falam com você várias vezes por dia. Fora do deal, somem.',
      doc: 'Relatórios de due diligence, SPA, pareceres.',
    } },
  { id: 'holding', x: 360, y: 272, w: 190, h: 46, label: 'Holding (NewCo S.A.)', sub: 'compra + toma a dívida', tone: 'teal',
    info: {
      oque: 'Sociedade criada para a aquisição. Recebe o equity do FIP e do fundador e toma a dívida de aquisição. Depois pode ser incorporada pela Tucano (card de estrutura).',
      ganha: 'Nada operacional: seu caixa vem de dividendos/JCP da Tucano.',
      dia: 'Atas, livros societários, cumprimento dos covenants da debênture.',
      doc: 'Estatuto, escritura de debênture, acordo de acionistas.',
    } },
  { id: 'bancos', x: 600, y: 330, w: 180, h: 46, label: 'Bancos / debenturistas', sub: '+ agente fiduciário', tone: 'sky',
    info: {
      oque: 'Bancos estruturam e coordenam a debênture (muitas vezes com garantia firme) e a distribuem a fundos de crédito e tesourarias. O agente fiduciário representa os debenturistas.',
      ganha: 'Juros (CDI + spread), fee de estruturação, fee de garantia firme, waiver fees.',
      dia: 'Cálculo trimestral de covenants, pedidos de waiver, assembleias de debenturistas.',
      doc: 'Escritura de emissão, contratos de garantia.',
    } },
  { id: 'vendedor', x: 120, y: 330, w: 180, h: 46, label: 'Vendedor / fundador', sub: 'vende e pode reinvestir', tone: 'neutral',
    info: {
      oque: 'A família ou o fundador que vende. É comum ficar com 10–30% (rollover) e virar sócio do fundo.',
      ganha: 'O preço, menos o que fica retido em escrow. Com rollover, uma segunda mordida na saída.',
      dia: 'No pós-closing: membro do conselho, às vezes CEO por um período de transição.',
      doc: 'SPA, acordo de acionistas, contrato de não concorrência.',
    } },
  { id: 'tucano', x: 360, y: 400, w: 190, h: 52, label: DEAL.alvo, sub: 'a empresa investida', tone: 'teal',
    info: {
      oque: `A empresa investida: ${DEAL.setor}. Receita ${fmtM(DEAL.receita)}, EBITDA ${fmtM(DEAL.ebitda)}.`,
      ganha: 'Gera o caixa que paga tudo: juros, dividendos e, no fim, o preço de saída.',
      dia: 'Reporting mensal ao fundo, conselho, orçamento, plano de criação de valor.',
      doc: 'Pacote mensal de gestão, orçamento anual, atas de conselho.',
    } },
  { id: 'mgmt', x: 120, y: 420, w: 180, h: 46, label: 'Management', sub: 'executivos · MIP', tone: 'neutral',
    info: {
      oque: 'CEO, CFO e diretoria. O fundo não opera: aposta num time e o incentiva a pensar como dono.',
      ganha: 'Salário + bônus + MIP (ações ou phantom) que paga muito se o fundo sair bem.',
      dia: 'Reuniões de conselho, comitês, revisões mensais com a gestora.',
      doc: 'Plano de incentivo, contrato de trabalho com não concorrência.',
    } },
  { id: 'regs', x: 600, y: 420, w: 180, h: 46, label: 'Reguladores', sub: 'CVM · ANBIMA · CADE · RFB · BCB', tone: 'rose',
    info: {
      oque: 'CVM (fundos, gestoras, ofertas), ANBIMA (autorregulação), CADE (concorrência), Receita (impostos), Banco Central (capital estrangeiro), B3 (registro, IPO), além do regulador setorial da investida.',
      ganha: 'Taxas de fiscalização e processuais.',
      dia: 'Informes periódicos, notificação ao CADE, declarações de capital estrangeiro.',
      doc: 'Informes CVM, formulário do CADE, declarações ao Banco Central.',
    } },
];

const TAB_EDGES = [
  { id: 'e1', from: 'lps', to: 'fip', kind: 'capital', label: 'comprometem e integralizam', c: 26 },
  { id: 'e2', from: 'fip', to: 'lps', kind: 'capital', label: 'amortizações (o retorno)', c: 26 },
  { id: 'e3', from: 'gestora', to: 'fip', kind: 'gov', label: 'decide compras e vendas', c: 14 },
  { id: 'e4', from: 'fip', to: 'gestora', kind: 'taxa', label: 'taxa de gestão + carry', c: 14 },
  { id: 'e5', from: 'adm', to: 'fip', kind: 'gov', label: 'registra, contabiliza, reporta', c: 14 },
  { id: 'e6', from: 'fip', to: 'adm', kind: 'taxa', label: 'taxa de administração', c: 14 },
  { id: 'e7', from: 'prest', to: 'fip', kind: 'gov', label: 'custódia, auditoria', c: 0 },
  { id: 'e8', from: 'fip', to: 'holding', kind: 'capital', label: 'aporte de equity', c: 0 },
  { id: 'e9', from: 'bancos', to: 'holding', kind: 'divida', label: 'debênture de aquisição', c: 14 },
  { id: 'e10', from: 'holding', to: 'bancos', kind: 'divida', label: 'juros + garantias', c: 14 },
  { id: 'e11', from: 'holding', to: 'vendedor', kind: 'capital', label: 'paga o preço', c: 0 },
  { id: 'e12', from: 'holding', to: 'tucano', kind: 'gov', label: 'controle', c: 16 },
  { id: 'e13', from: 'tucano', to: 'holding', kind: 'capital', label: 'dividendos / JCP', c: 16 },
  { id: 'e14', from: 'mgmt', to: 'tucano', kind: 'gov', label: 'opera · MIP', c: 0 },
  { id: 'e15', from: 'assess', to: 'gestora', kind: 'gov', label: 'due diligence, contratos', c: 0 },
  { id: 'e16', from: 'vendedor', to: 'holding', kind: 'capital', label: 'rollover', c: 14 },
];

const TAB_STEPS = [
  { edges: ['e1'], t: 'Captação', d: `Cotistas assinam compromissos de ${fmtBi(FUNDO.tamanho)}. Nada é transferido ainda: o dinheiro fica com cada cotista, rendendo CDI, até ser chamado.` },
  { edges: ['e15', 'e3'], t: 'A tese', d: 'A gestora origina a Tucano, roda due diligence com os assessores e leva o IC memo ao comitê de investimentos.' },
  { edges: ['e1', 'e8'], t: 'Chamada de capital', d: `O administrador chama ${fmtM(SU.equityFip)} dos cotistas (prazo típico de ~10 dias úteis) e o FIP aporta na holding como equity.` },
  { edges: ['e9'], t: 'Dívida de aquisição', d: `Bancos coordenam uma debênture de ${fmtM(SU.debenture)} (${fmtX(DEAL.alavancagem)} o EBITDA) na holding, a CDI + ${DEAL.spread.toLocaleString('pt-BR')}%, com as ações da Tucano em alienação fiduciária.` },
  { edges: ['e11', 'e16', 'e12'], t: 'Closing', d: `A holding paga ${fmtM(SU.precoAcoes)} pelas ações. O fundador reinveste ${fmtM(SU.rollover)} (rollover) e vira sócio com ${fmtP(1 - SU.pctFip, 0)}; a holding assume o controle.` },
  { edges: ['e4', 'e6', 'e14'], t: 'Anos de gestão', d: `As taxas saem do fundo todo ano (2% × ${fmtBi(FUNDO.tamanho)} = ${fmtM(FUNDO.tamanho * FUNDO.taxaGestao)}/ano no período de investimento). O management opera; a gestora senta no conselho.` },
  { edges: ['e13', 'e10'], t: 'Caixa sobe', d: 'A Tucano gera caixa: paga juros e amortiza a debênture; o excedente sobe como dividendos ou JCP.' },
  { edges: ['e2', 'e4'], t: 'Saída e waterfall', d: 'Venda da Tucano → o FIP amortiza cotas → cotistas recebem capital + hurdle; o lucro acima disso é dividido ~80/20 com a gestora (carry).' },
];

const nodeById = Object.fromEntries(TAB_NODES.map((n) => [n.id, n]));

// point where the segment from the node center toward (tx,ty) leaves the node box
const boxExit = (n, tx, ty) => {
  const dx = tx - n.x, dy = ty - n.y;
  const sx = dx === 0 ? Infinity : (n.w / 2 + 3) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (n.h / 2 + 3) / Math.abs(dy);
  const s = Math.min(sx, sy);
  return [n.x + dx * s, n.y + dy * s];
};

const edgePath = (e) => {
  const a = nodeById[e.from], b = nodeById[e.to];
  // perpendicular offset for the control point (sign flips with direction → bidirectional pairs separate)
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * e.c, cy = my + (dx / len) * e.c;
  const [x1, y1] = boxExit(a, cx, cy);
  const [x2, y2] = boxExit(b, cx, cy);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
};

const TabuleiroDiagram = ({ sel, setSel, step, kinds }) => {
  const uid = React.useId().replace(/:/g, '');
  const activeEdges = step != null ? new Set(TAB_STEPS[step].edges) : null;
  const isOn = (e) => {
    if (!kinds[e.kind]) return false;
    if (activeEdges) return activeEdges.has(e.id);
    if (sel) return e.from === sel || e.to === sel;
    return true;
  };
  const dim = activeEdges || sel;
  return (
    <svg viewBox="0 0 720 460" className="w-full h-auto select-none pe-chart pe-chart-wide">
      <defs>
        {Object.entries(FLOW).map(([k, f]) => (
          <marker key={k} id={`tab-arr-${k}-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={f.color} />
          </marker>
        ))}
      </defs>
      {TAB_EDGES.map((e) => {
        const on = isOn(e);
        const d = edgePath(e);
        const col = FLOW[e.kind].color;
        return (
          <g key={e.id} style={{ transition: 'opacity 0.3s' }} opacity={on ? 1 : dim ? 0.08 : 0.35}>
            <path d={d} fill="none" stroke={col} strokeWidth={on && dim ? 2.2 : 1.4} strokeDasharray={e.kind === 'gov' ? '4 3' : undefined} markerEnd={`url(#tab-arr-${e.kind}-${uid})`} />
            {on && dim && (
              <circle r="3.5" fill={col}>
                <animateMotion dur="1.6s" repeatCount="indefinite" path={d} />
              </circle>
            )}
          </g>
        );
      })}
      {TAB_NODES.map((n) => {
        const t = TONE[n.tone];
        const active = sel === n.id;
        return (
          <g key={n.id} onClick={() => setSel(active ? null : n.id)} style={{ cursor: 'pointer' }}>
            <rect x={n.x - n.w / 2} y={n.y - n.h / 2} width={n.w} height={n.h} rx="10"
              fill={t.fill} stroke={t.stroke} strokeOpacity={active ? 1 : 0.55} strokeWidth={active ? 2 : 1} />
            <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="12.5" fontWeight="600" fill={t.text}>{n.label}</text>
            <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize="9.5" fill="#a3a3a3">{n.sub}</text>
          </g>
        );
      })}
    </svg>
  );
};

const TabuleiroCard = () => {
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(null);
  const [kinds, setKinds] = useState({ capital: true, taxa: true, divida: true, gov: true });
  const node = sel ? nodeById[sel] : null;
  const pickNode = (id) => { setStep(null); setSel(id); };
  const flowsOf = (id) => TAB_EDGES.filter((e) => e.from === id || e.to === id);
  return (
    <Card id="tabuleiro" icon={Network} title="O tabuleiro: quem é quem num deal de PE" subtitle="Doze participantes, quatro tipos de fluxo. Clique num bloco ou siga o dinheiro passo a passo." accent="amber" index={secIndex('tabuleiro')} anchor>
      <MinSchema>
        Cotistas <b>comprometem</b> capital num <Term>FIP</Term>; a <Term def={GLOSS['gestor']}>gestora</Term> decide e o <Term>administrador fiduciário</Term> formaliza; o FIP compra, via holding e com dívida, o controle de empresas; anos depois vende e devolve o caixa pelo <Term>waterfall</Term>.
      </MinSchema>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(FLOW).map(([k, f]) => (
          <button key={k} onClick={() => setKinds((s) => ({ ...s, [k]: !s[k] }))}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-opacity ${kinds[k] ? 'border-white/15 bg-white/[0.04] text-neutral-200' : 'border-white/5 text-neutral-500 opacity-50'}`}>
            <span className="w-3 h-0.5 rounded" style={{ background: f.color }} />{f.label}
          </button>
        ))}
        <span className="text-[10px] text-neutral-500 ml-1">filtrar fluxos</span>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-2">
        <TabuleiroDiagram sel={sel} setSel={pickNode} step={step} kinds={kinds} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => { setSel(null); setStep((s) => (s == null ? 0 : Math.max(0, s - 1))); }}
          className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-neutral-300 hover:bg-white/10">‹ anterior</button>
        <button onClick={() => { setSel(null); setStep((s) => (s == null ? 0 : Math.min(TAB_STEPS.length - 1, s + 1))); }}
          className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-100 hover:bg-amber-400/20 inline-flex items-center gap-1">
          <Route className="w-3 h-3" /> {step == null ? 'siga o dinheiro' : 'próximo ›'}
        </button>
        {step != null && (
          <button onClick={() => setStep(null)} className="rounded-md px-2 py-1 text-[11px] text-neutral-500 hover:text-neutral-300">
            <RotateCcw className="w-3 h-3 inline" /> ver tudo
          </button>
        )}
        <div className="flex gap-1 ml-auto">
          {TAB_STEPS.map((_, i) => (
            <button key={i} onClick={() => { setSel(null); setStep(i); }} aria-label={`passo ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full ${step === i ? 'bg-amber-300' : 'bg-white/15 hover:bg-white/30'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step != null ? (
          <motion.div key={`s${step}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-3">
            <Eyebrow color="text-amber-300">passo {step + 1} de {TAB_STEPS.length} · {TAB_STEPS[step].t}</Eyebrow>
            <p className="text-sm text-neutral-200 mt-1">{TAB_STEPS[step].d}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TAB_STEPS[step].edges.map((id) => {
                const e = TAB_EDGES.find((x) => x.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[10px] text-neutral-300">
                    <span className="w-2.5 h-0.5 rounded" style={{ background: FLOW[e.kind].color }} />
                    {nodeById[e.from].label} → {nodeById[e.to].label}: {e.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        ) : node ? (
          <motion.div key={node.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-sm font-semibold" style={{ color: TONE[node.tone].text }}>{node.label}</div>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs">
              <div><Eyebrow>o que faz</Eyebrow><div className="text-neutral-200 mt-0.5">{node.info.oque}</div></div>
              <div><Eyebrow>como ganha dinheiro</Eyebrow><div className="text-neutral-200 mt-0.5">{node.info.ganha}</div></div>
              <div><Eyebrow>no dia a dia</Eyebrow><div className="text-neutral-200 mt-0.5">{node.info.dia}</div></div>
              <div><Eyebrow>documento típico</Eyebrow><div className="text-neutral-200 mt-0.5">{node.info.doc}</div></div>
            </div>
            {flowsOf(node.id).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {flowsOf(node.id).map((e) => (
                  <span key={e.id} className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[10px] text-neutral-300">
                    <span className="w-2.5 h-0.5 rounded" style={{ background: FLOW[e.kind].color }} />
                    {e.from === node.id ? `→ ${nodeById[e.to].label}` : `← ${nodeById[e.from].label}`}: {e.label}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Clique num bloco para ver o que ele faz, como ganha dinheiro e quando você fala com ele.
          </motion.div>
        )}
      </AnimatePresence>

      <p>
        O fio condutor deste manual é um deal fictício: a <span className="text-amber-200">{FUNDO.gestora}</span>, com o <span className="text-amber-200">{FUNDO.nome}</span> ({fmtBi(FUNDO.tamanho)} comprometidos), compra o controle da <span className="text-teal-200">{DEAL.alvo}</span>, {DEAL.setor}, com EBITDA de {fmtM(DEAL.ebitda)}, por {fmtX(DEAL.multEntrada)} o EBITDA: <Grounding>EV {fmtM(DEAL.ev)}</Grounding>. Cada card revisita o mesmo deal por outro ângulo.
      </p>

      <Misconception
        wrong="o fundo é a gestora; o dinheiro é da gestora."
        right="o FIP é um condomínio separado, com CNPJ próprio. O dinheiro é dos cotistas e a gestora é uma prestadora de serviço contratada, que a assembleia pode destituir."
        because="por isso tanta coisa passa pelo administrador e pela assembleia: a gestora decide investimentos, mas não é dona do veículo."
      />
      <WhenItMatters>
        Saber quem é quem diz com quem falar: dúvida de cotista vai para relações com investidores; dúvida de regulamento, para o administrador e o jurídico; covenant, para o banco ou o agente fiduciário; conflito de interesse, para o comitê de cotistas.
      </WhenItMatters>
      <QA items={[
        { q: 'Quem assina a chamada de capital: a gestora ou o administrador?', a: 'O administrador, que é quem responde pelo fundo. A gestora pede (porque decidiu investir), o administrador executa e cobra.' },
        { q: 'Por que a dívida fica na holding e não no FIP?', a: 'FIP não se endivida para comprar empresas (a regra só admite exceções pontuais). A dívida de aquisição fica numa sociedade (a holding), com as ações da investida como garantia, e é paga com o caixa que sobe da operação.' },
        { q: 'O fundador vendeu. Por que ele continua aparecendo no conselho?', a: 'Porque reinvestiu parte do preço (rollover) e virou sócio minoritário da holding. O acordo de acionistas dá a ele assentos, vetos e regras de saída. O fundo quer o fundador com o mesmo incentivo que ele.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 02 · FIP */

const FIP_LAYERS = [
  { id: 'fundo', label: 'Fundo', doc: 'regulamento · parte geral', tone: 'amber',
    itens: ['Nome, prazo, foro, regras de assembleia geral', 'Quem são administrador e gestor (prestadores essenciais)', 'Regras comuns a todas as classes', 'CNPJ do fundo'] },
  { id: 'classe', label: 'Classe de cotas', doc: 'anexo da classe', tone: 'teal',
    itens: ['Patrimônio segregado: o problema de uma classe não contamina a outra', 'Política de investimento (a regra dos 90%, categoria do FIP)', 'Responsabilidade limitada ou ilimitada dos cotistas', 'Público-alvo (no FIP, só qualificados)', 'Tem CNPJ próprio e é o que efetivamente investe'] },
  { id: 'sub', label: 'Subclasse', doc: 'apêndice', tone: 'violet',
    itens: ['Diferenças de taxa, prazo de integralização ou público entre grupos de cotistas', 'Ex.: subclasse com desconto de taxa para um cotista âncora', 'Mesma carteira, direitos econômicos diferentes'] },
];

const FIP_CATS = [
  { id: 'semente', nome: 'Capital Semente', regra: 'investidas com receita bruta anual ≤ R$ 20 milhões', uso: 'venture capital em estágio inicial' },
  { id: 'emergentes', nome: 'Empresas Emergentes', regra: 'receita ≤ R$ 400 milhões (e grupo controlador abaixo de certos limites)', uso: 'growth e VC tardio' },
  { id: 'infra', nome: 'Infraestrutura (FIP-IE)', regra: 'projetos de infraestrutura; mín. 5 cotistas, nenhum com > 40%', uso: 'energia, transporte, saneamento, telecom' },
  { id: 'pdi', nome: 'PD&I', regra: 'produção econômica intensiva em pesquisa; mín. 5 cotistas, nenhum > 40%', uso: 'inovação, deep tech' },
  { id: 'multi', nome: 'Multiestratégia', regra: 'sem teto de porte; pode combinar estratégias', uso: 'buyout, a casa do PE de controle' },
];

const FipCheck = () => {
  const [acoes, setAcoes] = useState(84);
  const [deb, setDeb] = useState(8);
  const [influencia, setInfluencia] = useState(true);
  const caixa = Math.max(0, 100 - acoes - deb);
  const elegiveis = acoes + deb; // ações/conversíveis + debêntures simples entram no rol do art. 5
  const ok90 = elegiveis >= 90;
  const ok33 = deb <= 33;
  const okAll = ok90 && ok33 && influencia;
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Eyebrow color="text-amber-300">teste de enquadramento · carteira da classe</Eyebrow>
        <span className="text-[10px] text-neutral-500">arraste e veja o que o administrador veria</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="ações e títulos conversíveis de investidas" value={acoes} min={0} max={100} onChange={(v) => { setAcoes(v); if (v + deb > 100) setDeb(100 - v); }} fmt={(v) => v + '% do PL'} />
        <Slider label="debêntures simples / notas comerciais" value={deb} min={0} max={60} onChange={(v) => { setDeb(v); if (acoes + v > 100) setAcoes(100 - v); }} fmt={(v) => v + '%'} hint="aprox.: a regra mede este limite contra o capital subscrito" />
      </div>
      <div className="flex h-7 rounded-md overflow-hidden border border-white/10 text-[10px] font-mono">
        <div className="bg-amber-400/70 text-neutral-950 flex items-center justify-center" style={{ width: `${acoes}%` }}>{acoes >= 12 ? `ações ${acoes}%` : ''}</div>
        <div className="bg-sky-400/70 text-neutral-950 flex items-center justify-center" style={{ width: `${deb}%` }}>{deb >= 9 ? `dívida ${deb}%` : ''}</div>
        <div className="bg-white/10 text-neutral-300 flex items-center justify-center" style={{ width: `${caixa}%` }}>{caixa >= 9 ? `caixa ${caixa}%` : ''}</div>
      </div>
      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
        <input type="checkbox" checked={influencia} onChange={(e) => setInfluencia(e.target.checked)} className="accent-amber-400" />
        o fundo tem <b>influência efetiva</b> na gestão (assento no conselho, vetos em acordo de acionistas)
      </label>
      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        {[
          { ok: ok90, t: '≥ 90% em ativos elegíveis', v: `${elegiveis}%` },
          { ok: ok33, t: 'dívida não conversível ≤ 33%', v: `${deb}%` },
          { ok: influencia, t: 'participa das decisões', v: influencia ? 'sim' : 'não' },
        ].map((r, i) => (
          <div key={i} className={`rounded-md border px-2.5 py-2 ${r.ok ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-rose-400/40 bg-rose-400/10'}`}>
            <div className="flex items-center gap-1.5">
              {r.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <XCircle className="w-3.5 h-3.5 text-rose-300" />}
              <span className="text-neutral-200">{r.t}</span>
            </div>
            <div className="font-mono text-neutral-400 mt-0.5 pl-5">{r.v}</div>
          </div>
        ))}
      </div>
      <div className={`rounded-md px-3 py-2 text-xs ${okAll ? 'bg-emerald-400/10 text-emerald-100 border border-emerald-400/25' : 'bg-rose-400/10 text-rose-100 border border-rose-400/30'}`}>
        {okAll
          ? 'Enquadrado. A classe cumpre a política de FIP e segue candidata a entidade de investimento: o cotista só paga IR quando receber amortizações.'
          : 'Desenquadrado. O administrador precisa comunicar e o gestor precisa reenquadrar dentro do prazo. Se o problema for estrutural, a classe perde o tratamento de entidade de investimento e cai no come-cotas.'}
      </div>
    </div>
  );
};

const FipCard = () => {
  const [layer, setLayer] = useState('classe');
  const [cat, setCat] = useState('multi');
  const L = FIP_LAYERS.find((l) => l.id === layer);
  return (
    <Card id="fip" icon={Layers} title="O FIP por dentro (RCVM 175)" subtitle="O veículo que carrega quase todo o PE brasileiro: camadas, categorias e a regra dos 90%." accent="teal" index={secIndex('fip')}>
      <MinSchema>
        FIP = condomínio fechado, <b>só para investidores qualificados</b>, com <b>≥ 90%</b> do patrimônio em participações de empresas nas quais <b>influi de fato</b>. Desde a <Term>RCVM 175</Term>, o regulamento tem camadas: fundo → classe → subclasse.
      </MinSchema>

      <div className="grid md:grid-cols-[220px_1fr] gap-4 items-start">
        <div className="space-y-2">
          {FIP_LAYERS.map((l, i) => (
            <button key={l.id} onClick={() => setLayer(l.id)}
              className="w-full text-left rounded-lg border px-3 py-2 transition-colors"
              style={{
                marginLeft: i * 14, width: `calc(100% - ${i * 14}px)`,
                borderColor: layer === l.id ? TONE[l.tone].stroke : 'rgba(255,255,255,0.1)',
                background: layer === l.id ? TONE[l.tone].fill : 'rgba(255,255,255,0.02)',
              }}>
              <div className="text-sm font-semibold" style={{ color: TONE[l.tone].text }}>{l.label}</div>
              <div className="text-[10px] text-neutral-500 font-mono">{l.doc}</div>
            </button>
          ))}
          <div className="text-[10px] text-neutral-500 pl-1">prestadores essenciais: <span className="text-violet-300">administrador</span> + <span className="text-violet-300">gestor</span></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={L.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <Eyebrow color="text-teal-300">o que mora no {L.doc}</Eyebrow>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-200">
              {L.itens.map((it, i) => (
                <li key={i} className="flex gap-2"><ArrowRight className="w-3 h-3 mt-[3px] text-neutral-500 shrink-0" />{it}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      <p>
        O coração regulatório é o <Term>RCVM 175</Term> Anexo Normativo IV. Três regras definem se algo "é FIP":
      </p>
      <FipCheck />

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
          <Eyebrow color="text-teal-300">as 5 categorias</Eyebrow>
          <span className="text-[10px] text-neutral-500">clique numa categoria</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FIP_CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`rounded-md border px-2.5 py-1 text-[11px] ${cat === c.id ? 'border-teal-400/50 bg-teal-400/10 text-teal-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>
              {c.nome}
            </button>
          ))}
        </div>
        {(() => {
          const c = FIP_CATS.find((x) => x.id === cat);
          return (
            <div className="mt-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs grid sm:grid-cols-2 gap-2">
              <div><Eyebrow>regra</Eyebrow><div className="text-neutral-200 mt-0.5">{c.regra}</div></div>
              <div><Eyebrow>uso típico</Eyebrow><div className="text-neutral-200 mt-0.5">{c.uso}</div></div>
            </div>
          );
        })()}
        <Predict question={`A ${DEAL.alvo} fatura ${fmtBi(DEAL.receita)} por ano. Em qual categoria o ${FUNDO.nome} precisa estar para comprá-la?`}>
          Multiestratégia. A receita está acima do teto de R$ 400 milhões de Empresas Emergentes, e não é infraestrutura nem P&amp;D. É por isso que quase todo fundo de buyout de controle no Brasil é Multiestratégia.
        </Predict>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <Eyebrow color="text-amber-300">o que a RCVM 175 mudou no dia a dia</Eyebrow>
          <ul className="mt-2 space-y-1.5 text-xs text-neutral-300">
            <li>• <b className="text-neutral-100">Responsabilidade limitada</b> opcional: o cotista responde só até o que subscreveu.</li>
            <li>• Taxa de <b className="text-neutral-100">administração</b> e de <b className="text-neutral-100">gestão</b> viraram rubricas separadas.</li>
            <li>• Carry só pode ser pago quando há <b className="text-neutral-100">distribuição efetiva</b> ao cotista, nunca sobre ganho de valor justo não realizado.</li>
            <li>• Classes com patrimônio segregado permitem vários "fundos" sob um mesmo regulamento.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <Eyebrow color="text-violet-300">calendário regulatório do FIP</Eyebrow>
          <ul className="mt-2 space-y-1.5 text-xs text-neutral-300">
            <li>• Informe periódico <b className="text-neutral-100">quadrimestral</b>: até 15 dias após o quadrimestre.</li>
            <li>• Composição da carteira: semestral, até 150 dias.</li>
            <li>• Demonstrações contábeis <b className="text-neutral-100">auditadas</b>: anuais, até 150 dias.</li>
            <li>• Ata de assembleia: até 8 dias; mudança relevante de valor justo: relatório em 5 dias úteis.</li>
            <li>• Taxa de fiscalização da CVM: anual, por classe, por faixa de patrimônio (≈ R$ 3 mil a R$ 57 mil).</li>
          </ul>
        </div>
      </div>

      <Misconception
        wrong="FIP é isento de imposto."
        right="o FIP difere o imposto. Enquanto investe, nada é tributado; quando amortiza, o cotista pessoa física paga 15% sobre o ganho."
        because="a Lei 14.754/2023 só garante esse diferimento se a classe for entidade de investimento. Se não for, cai no come-cotas semestral e nas alíquotas regressivas (22,5% a 15%)."
      />
      <WhenItMatters>
        Quem lê regulamento no dia a dia: associado montando o cronograma de chamadas, jurídico checando se um investimento cabe na política, time de relações com investidores respondendo cotista. Um deal "fora da política" precisa de assembleia, e assembleia leva semanas.
      </WhenItMatters>

      <Deeper>
        <p>
          <b>Transição.</b> A RCVM 175 entrou em vigor em 2 de outubro de 2023 e substituiu a <Term>ICVM 578</Term> para FIPs. Os fundos existentes tiveram até 30 de junho de 2025 para se adaptar. Regulamentos antigos, anteriores a essa data, ainda circulam em data rooms e em due diligence de gestoras.
        </p>
        <p>
          <b>Por que FIP e não uma holding comum?</b> A holding S.A. paga IRPJ/CSLL (até 34%) sobre o ganho de capital quando vende uma investida, e o sócio ainda é tributado ao receber. No FIP-entidade de investimento, o ganho atravessa o fundo sem imposto e só é tributado no cotista, a 15% para pessoa física. Fundos de pensão são isentos. O preço é a burocracia: administrador, auditoria, informes, assembleias e as regras da CVM. Para uma única empresa familiar, muitas vezes não compensa; para um fundo com vinte cotistas institucionais, é o padrão.
        </p>
        <p>
          <b>Estrangeiro.</b> Investidor não residente fora de paraíso fiscal, entrando pelo regime de investimento de não residentes (Resolução Conjunta BCB/CVM nº 13/2024), tem IR de 0% sobre ganhos de FIP, desde que o FIP seja entidade de investimento. A Lei 14.711/2023 derrubou o antigo teste dos 40% de cotas. Por isso a estrutura clássica de captação internacional é o <b>fundo espelho</b>: um fundo offshore (Cayman, Delaware, Luxemburgo) que investe no FIP brasileiro.
        </p>
        <p>
          <b>Dívida dentro do FIP.</b> Títulos de dívida não conversíveis, como debêntures simples, contam para os 90%, mas ficam limitados a 33% do capital subscrito, exceto em Capital Semente, Infraestrutura e PD&amp;I. É o espaço regulatório de estratégias de "crédito estruturado com upside" dentro de um FIP.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Uma pessoa física com R$ 500 mil investidos pode entrar num FIP?', a: 'Não. Pelo Anexo IV, cotas de FIP são só para investidores qualificados (mais de R$ 1 milhão em aplicações, ou certificação). Não há exceção de varejo.' },
        { q: 'Por que o carry não pode ser pago quando o valor justo da carteira sobe?', a: 'Porque a RCVM 175 exige distribuição efetiva: a gestora só recebe performance quando o cotista recebe dinheiro. Isso evita pagar carry sobre uma marcação que pode nunca virar caixa.' },
        { q: 'O que muda para o cotista se a classe perde o status de entidade de investimento?', a: 'O IR deixa de ser diferido: passa a haver come-cotas semestral (maio e novembro) e as amortizações seguem a tabela regressiva. Para o investidor estrangeiro, o 0% deixa de valer.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 03 · CICLO */

const PACES = {
  lento:  [0.06, 0.16, 0.22, 0.24, 0.20, 0.12],
  normal: [0.12, 0.26, 0.26, 0.22, 0.14],
  rapido: [0.25, 0.38, 0.27, 0.10],
};

const PHASES = [
  { from: 0, to: 0, id: 'captacao', label: 'captação', color: '#a78bfa',
    txt: 'Roadshow com cotistas, first close, final close. Despesas de constituição: advogados, administrador, registro. A gestora ainda gasta mais do que recebe.' },
  { from: 1, to: 5, id: 'invest', label: 'período de investimento', color: '#fbbf24',
    txt: 'Chamadas de capital a cada deal, taxa sobre o capital comprometido, J-curve afundando. O time vive de originação e due diligence.' },
  { from: 6, to: 10, id: 'desinv', label: 'desinvestimento', color: '#2dd4bf',
    txt: 'Sem investimentos novos (só follow-ons). A taxa passa a incidir sobre o capital investido remanescente. Saídas viram amortizações; o DPI sobe.' },
  { from: 11, to: 12, id: 'prorrog', label: 'prorrogação', color: '#fb7185',
    txt: 'A assembleia aprova extensões (tipicamente 1 + 1 ano) para vender os ativos restantes, muitas vezes com desconto de taxa. A gestora já está captando o fundo seguinte.' },
];

const simFund = ({ moic, hold, pace }) => {
  const C = FUNDO.tamanho, Y = 13;
  const investable = 0.80 * C;
  const inv = Array(Y).fill(0);
  PACES[pace].forEach((p, i) => { inv[i + 1] = investable * p; });
  const g = Math.pow(moic, 1 / hold) - 1;
  const pieces = [];
  inv.forEach((A, v) => {
    if (!A) return;
    [[hold - 1, 0.3], [hold, 0.4], [hold + 1, 0.3]].forEach(([dt, sh]) => {
      const d = Math.max(1, dt);
      pieces.push({ v, amt: A * sh, exit: Math.min(Y - 1, v + d) });
    });
  });
  const rows = [];
  let PI = 0, D = 0;
  for (let y = 0; y < Y; y++) {
    const costUnreal = pieces.filter((p) => p.v <= y && p.exit > y).reduce((s, p) => s + p.amt, 0);
    const fee = y === 0 ? 0.006 * C : y <= 5 ? FUNDO.taxaGestao * C : FUNDO.taxaGestao * costUnreal;
    const call = inv[y] + fee;
    const dist = pieces.filter((p) => p.exit === y).reduce((s, p) => s + p.amt * Math.pow(1 + g, y - p.v), 0);
    const nav = pieces.filter((p) => p.v <= y && p.exit > y).reduce((s, p) => s + p.amt * Math.pow(1 + g, y - p.v), 0);
    const lpOf = (tot, pi) => (tot <= pi ? tot : pi + (1 - FUNDO.carry) * (tot - pi));
    const lpPrev = lpOf(D, PI);
    PI += call; D += dist;
    const lpCum = lpOf(D, PI);
    const netTotal = lpOf(D + nav, PI);
    rows.push({
      y, call, fee, dist: lpCum - lpPrev, lpCum, PI, nav,
      cum: lpCum - PI,
      dpi: lpCum / PI, tvpi: netTotal / PI, rvpi: (netTotal - lpCum) / PI,
    });
  }
  return rows;
};

const JCurveChart = ({ rows, cursor, phase }) => {
  const W = 640, H = 250, pl = 46, pr = 12, pt = 14, pb = 26;
  const Y = rows.length;
  const bw = (W - pl - pr) / Y;
  const lo = Math.min(...rows.map((r) => Math.min(-r.call, r.cum))) * 1.08;
  const hi = Math.max(...rows.map((r) => Math.max(r.dist, r.cum)), 200) * 1.08;
  const sy = (v) => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const sx = (i) => pl + bw * i + bw / 2;
  const ticks = [];
  const step = (hi - lo) > 4000 ? 1000 : 500;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  const line = rows.map((r, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(r.cum).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={sy(v)} y2={sy(v)} stroke={v === 0 ? '#737373' : '#262626'} strokeWidth={v === 0 ? 1 : 0.7} />
          <text x={pl - 6} y={sy(v) + 3} textAnchor="end" fontSize="9.5" fill="#8a8a8a">{(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</text>
        </g>
      ))}
      <rect x={pl + bw * cursor} y={pt} width={bw} height={H - pt - pb} fill="#ffffff" opacity="0.05" />
      {PHASES.map((p) => (
        <rect key={p.id} x={pl + bw * p.from + 2} y={3} width={bw * (p.to - p.from + 1) - 4} height={5} rx="2.5" fill={p.color} opacity={phase?.id === p.id ? 0.9 : 0.3} />
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          <rect x={sx(i) - bw * 0.32} width={bw * 0.64} y={sy(0)} height={Math.max(0, sy(-r.call) - sy(0))} fill="#fb7185" opacity="0.75" rx="2" />
          <rect x={sx(i) - bw * 0.32} width={bw * 0.64} y={sy(r.dist)} height={Math.max(0, sy(0) - sy(r.dist))} fill="#34d399" opacity="0.8" rx="2" />
          <text x={sx(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill={i === cursor ? '#fde68a' : '#8a8a8a'}>{i}</text>
        </g>
      ))}
      <path d={line} fill="none" stroke="#fbbf24" strokeWidth="2.2" />
      {rows.map((r, i) => (
        <circle key={i} cx={sx(i)} cy={sy(r.cum)} r={i === cursor ? 4.5 : 2.5} fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1" style={{ transition: 'r 0.2s' }} />
      ))}
    </svg>
  );
};

const CicloCard = () => {
  const [moic, setMoic] = useState(2.2);
  const [hold, setHold] = useState(5);
  const [pace, setPace] = useState('normal');
  const [cursor, setCursor] = useState(5);
  const rows = useMemo(() => simFund({ moic, hold, pace }), [moic, hold, pace]);
  const r = rows[cursor];
  const phase = PHASES.find((p) => cursor >= p.from && cursor <= p.to);
  const trough = rows.reduce((m, x) => (x.cum < m.cum ? x : m), rows[0]);
  const breakeven = rows.find((x, i) => i > trough.y && x.cum >= 0);
  const final = rows[rows.length - 1];
  return (
    <Card id="ciclo" icon={Hourglass} title="A vida de um fundo: 10+2 anos e a J-curve" subtitle="Captação → investimento → desinvestimento → prorrogação. O dinheiro entra em conta-gotas e volta em blocos." accent="amber" index={secIndex('ciclo')}>
      <MinSchema>
        O cotista promete o capital no dia 1, mas o entrega <b>aos poucos</b>, por <Term>chamada de capital</Term>. As taxas saem desde o início e as saídas só vêm depois de 4 a 6 anos. Resultado: o fluxo acumulado afunda antes de subir (a <Term>J-curve</Term>).
      </MinSchema>

      <div className="grid md:grid-cols-3 gap-4">
        <Slider label="múltiplo bruto dos deals (MOIC)" value={moic} min={1.0} max={3.5} step={0.1} onChange={setMoic} fmt={(v) => fmtX(v)} />
        <Slider label="holding médio por empresa" value={hold} min={3} max={7} step={1} onChange={setHold} fmt={(v) => `${v} anos`} />
        <div>
          <div className="text-[11px] text-neutral-400 mb-1">ritmo de investimento</div>
          <Seg value={pace} onChange={setPace} options={[{ id: 'lento', label: 'lento' }, { id: 'normal', label: 'normal' }, { id: 'rapido', label: 'rápido' }]} />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-400 mb-1">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400/80" />chamadas (investimento + taxas)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80" />amortizações ao cotista (após carry)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-400" />fluxo acumulado do cotista</span>
          <span className="ml-auto">R$ bi · eixo x = ano</span>
        </div>
        <JCurveChart rows={rows} cursor={cursor} phase={phase} />
        <Slider label="ano" value={cursor} min={0} max={12} onChange={setCursor} fmt={(v) => `ano ${v} · ${PHASES.find((p) => v >= p.from && v <= p.to).label}`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="integralizado" value={fmtBi(r.PI)} sub={`${fmtP(r.PI / FUNDO.tamanho, 0)} do comprometido`} />
        <Stat label="DPI" value={fmtX(r.dpi, 2)} sub="caixa devolvido" color="text-emerald-300" />
        <Stat label="RVPI" value={fmtX(r.rvpi, 2)} sub="ainda no papel" color="text-sky-300" />
        <Stat label="TVPI" value={fmtX(r.tvpi, 2)} sub="DPI + RVPI" color="text-amber-300" />
      </div>
      <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-neutral-300">
        <span className="font-semibold" style={{ color: phase.color }}>{phase.label}:</span> {phase.txt}
      </div>

      <Predict question="Com MOIC bruto de 2,2x e holding de 5 anos, em que ano o cotista recupera tudo o que colocou (fluxo acumulado volta a zero)? E qual o pior momento?">
        Com os parâmetros atuais, o fundo está {fmtBi(-trough.cum)} no negativo no ano {trough.y} (o fundo da J) e {breakeven ? <>volta a zero no <b>ano {breakeven.y}</b></> : <b>não recupera o capital</b>}. TVPI final líquido: {fmtX(final.tvpi, 2)}. Mexa no holding: cada ano a mais empurra o breakeven e derruba a TIR, mesmo com o múltiplo igual.
      </Predict>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <Eyebrow color="text-amber-300">anatomia de uma chamada de capital</Eyebrow>
          <ol className="mt-2 space-y-1 text-xs text-neutral-300 list-decimal pl-4">
            <li>Gestora pede ao administrador: valor, finalidade (deal ou despesas), data.</li>
            <li>Administrador notifica os cotistas, pro rata ao comprometido.</li>
            <li>Prazo típico de ~10 dias úteis: o cotista resgata o que estava no CDI e integraliza.</li>
            <li>Inadimplente: multa + juros, suspensão de voto e de amortizações, e no limite venda compulsória ou diluição das cotas.</li>
          </ol>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <Eyebrow color="text-teal-300">as três siglas do relatório trimestral</Eyebrow>
          <div className="mt-2 space-y-1.5 text-xs text-neutral-300">
            <div><Term>DPI</Term> = distribuído ÷ integralizado. <span className="text-neutral-500">Caixa na mão.</span></div>
            <div><Term>RVPI</Term> = valor residual ÷ integralizado. <span className="text-neutral-500">Promessa, marcada a valor justo.</span></div>
            <div><Term>TVPI</Term> = DPI + RVPI. <span className="text-neutral-500">O placar total.</span></div>
            <div className="text-neutral-500 pt-1">Num mercado com poucas saídas (Brasil 2022–25), o TVPI sobe no papel e o DPI empaca. Os cotistas passaram a cobrar DPI.</div>
          </div>
        </div>
      </div>

      <Misconception
        wrong="se o fundo tem R$ 2,5 bi, a gestora recebe R$ 2,5 bi no dia 1."
        right="o dinheiro fica com os cotistas até ser chamado. No fim do ano 2 de um fundo típico, só cerca de um terço do comprometido saiu do caixa deles."
        because="chamar sob demanda maximiza a TIR (o relógio só corre quando o dinheiro entra) e deixa o cotista rendendo CDI enquanto espera."
      />
      <WhenItMatters>
        Você vai calcular DPI/TVPI todo trimestre e montar o cronograma de chamadas de cada deal. Quem capta o próximo fundo precisa desses números: cotista brasileiro olha DPI antes de assinar de novo.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Por que a J-curve é mais funda no Brasil.</b> Com o CDI em dois dígitos, o custo de oportunidade do cotista é alto: cada ano de atraso numa saída é um ano rendendo abaixo da renda fixa. Um deal que dobra o capital em 6 anos rende ~12% a.a. nominais: abaixo do CDI de 2025–26. Por isso o hurdle costuma ser indexado (IPCA + 6–8%) e a conversa com cotista gira em torno da TIR em reais e do DPI, não do múltiplo.
        </p>
        <p>
          <b>Linhas de assinatura.</b> Lá fora, fundos tomam empréstimo-ponte garantido pelos compromissos dos cotistas (subscription line) para adiar chamadas. Isso melhora a TIR sem mudar o múltiplo. No Brasil é raro, porque a regra de endividamento do FIP é restritiva e o crédito em reais é caro. Quando aparecer em um relatório estrangeiro, desconte o efeito na TIR.
        </p>
        <p>
          <b>O modelo acima</b> simplifica: 80% do comprometido é investido e o resto cobre taxas e despesas; saídas espalhadas em ±1 ano do holding; carry de 20% sobre o lucro assim que o capital volta. O waterfall exato, com hurdle e catch-up, está no próximo card.
        </p>
      </Deeper>
      <QA items={[
        { q: 'O TVPI de um fundo no ano 6 é 1,6x e o DPI é 0,2x. É um bom fundo?', a: 'Ainda não se sabe: 1,4x está no papel (RVPI), marcado pela própria gestora a valor justo. O cotista vai olhar a metodologia de valuation, os múltiplos usados e quanto já virou caixa. Um DPI baixo no ano 6 é normal; no ano 10, é um problema.' },
        { q: 'Por que a taxa de gestão cai depois do período de investimento?', a: 'A base muda de capital comprometido para capital investido remanescente. Conforme as empresas são vendidas, a base encolhe. É o incentivo para a gestora captar um fundo novo.' },
        { q: 'O que acontece com o cotista que não paga uma chamada?', a: 'Depende do regulamento, mas o padrão é pesado: multa e juros, suspensão de direitos políticos e econômicos e, no limite, venda compulsória das cotas com desconto ou diluição. A lógica é proteger os outros cotistas e o deal que já foi assinado.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 04 · ECONOMIA */

const waterfall = ({ pi, dist, hurdle, years, carry, catchup }) => {
  const t1 = Math.min(dist, pi);
  let rem = dist - t1;
  const prefTarget = pi * (Math.pow(1 + hurdle, years) - 1);
  const t2 = Math.min(rem, prefTarget); rem -= t2;
  const cuNeed = catchup > carry ? (carry * t2) / (catchup - carry) : 0;
  const t3 = Math.min(rem, cuNeed); rem -= t3;
  const t4 = rem;
  const gp = catchup * t3 + carry * t4;
  return { t1, t2, t3, t4, gp, lp: dist - gp, prefTarget, t3gp: catchup * t3, t4gp: carry * t4 };
};

const TIERS = [
  { k: 't1', label: '1 · devolução do capital', color: '#a3a3a3', desc: 'Tudo o que o cotista integralizou (investimentos + taxas + despesas) volta primeiro, 100% para ele.' },
  { k: 't2', label: '2 · retorno preferencial (hurdle)', color: '#2dd4bf', desc: 'O cotista recebe a correção do capital pelo hurdle (ex.: IPCA + 6% a.a.) antes de a gestora ver um real.' },
  { k: 't3', label: '3 · catch-up da gestora', color: '#fb7185', desc: 'A gestora recebe (quase) tudo até "alcançar" 20% do lucro distribuído até ali.' },
  { k: 't4', label: '4 · divisão 80/20', color: '#fbbf24', desc: 'Daí em diante, cada real de lucro vai 80% para os cotistas e 20% para a gestora.' },
];

const EconomiaCard = () => {
  const [moic, setMoic] = useState(2.2);
  const [years, setYears] = useState(5);
  const [ipca, setIpca] = useState(4.5);
  const [real, setReal] = useState(6);
  const [cu, setCu] = useState('100');
  const invested = 0.8 * FUNDO.tamanho;
  const fees = 0.16 * FUNDO.tamanho;
  const pi = invested + fees;
  const dist = invested * moic;
  const hurdle = (1 + ipca / 100) * (1 + real / 100) - 1;
  const catchup = cu === '100' ? 1 : cu === '80' ? 0.8 : FUNDO.carry;
  const w = waterfall({ pi, dist, hurdle, years, carry: FUNDO.carry, catchup });
  const lucro = Math.max(0, dist - pi);
  const grossIrr = Math.pow(moic, 1 / years) - 1;
  const netIrr = Math.pow(Math.max(w.lp / pi, 0.0001), 1 / years) - 1;
  return (
    <Card id="economia" icon={Percent} title="Taxas e waterfall: quem recebe o quê, e em que ordem" subtitle="2 e 20 é o começo da conversa. O que decide o dinheiro é a ordem das cascatas." accent="rose" index={secIndex('economia')}>
      <MinSchema>
        <Term>taxa de gestão</Term> paga a operação da gestora; a <Term>taxa de performance</Term> (o <Term>carry</Term>) é a parte do lucro que a enriquece. O caixa das saídas desce em cascata: <b>capital de volta → <Term>hurdle</Term> → <Term>catch-up</Term> → 80/20</b>.
      </MinSchema>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
        <Slider label="MOIC bruto da carteira" value={moic} min={0.8} max={3.5} step={0.1} onChange={setMoic} fmt={(v) => fmtX(v)} />
        <Slider label="duração média do capital" value={years} min={3} max={8} step={0.5} onChange={setYears} fmt={(v) => `${v.toLocaleString('pt-BR')} anos`} />
        <Slider label="IPCA médio" value={ipca} min={2} max={8} step={0.5} onChange={setIpca} fmt={(v) => `${v.toLocaleString('pt-BR')}% a.a.`} />
        <Slider label="hurdle real (acima do IPCA)" value={real} min={0} max={10} step={0.5} onChange={setReal} fmt={(v) => `IPCA + ${v.toLocaleString('pt-BR')}%`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neutral-400">catch-up:</span>
        <Seg value={cu} onChange={setCu} options={[{ id: '100', label: '100% (full)' }, { id: '80', label: '80%' }, { id: 'none', label: 'sem catch-up' }]} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px]">
          <span className="text-neutral-400">distribuições totais: <span className="font-mono text-neutral-100">{fmtBi(dist, 2)}</span> sobre <span className="font-mono text-neutral-100">{fmtBi(pi, 2)}</span> integralizados</span>
          <span className="text-neutral-500">hurdle nominal ≈ {fmtP(hurdle)} a.a.</span>
        </div>
        <div className="flex h-9 rounded-md overflow-hidden border border-white/10">
          {TIERS.map((t) => {
            const v = w[t.k]; if (v <= 0) return null;
            const gpPart = t.k === 't3' ? w.t3gp : t.k === 't4' ? w.t4gp : 0;
            return (
              <div key={t.k} className="relative h-full" style={{ width: `${(v / dist) * 100}%`, background: t.color, opacity: 0.85, transition: 'width 0.3s' }} title={`${t.label}: ${fmtM(v)}`}>
                {gpPart > 0 && (
                  <div className="absolute right-0 top-0 h-full" style={{ width: `${(gpPart / v) * 100}%`, backgroundImage: 'repeating-linear-gradient(45deg, rgba(10,10,10,0.55) 0 3px, transparent 3px 7px)' }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-neutral-500">parte hachurada = vai para a gestora</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {TIERS.map((t) => {
            const v = w[t.k];
            const gpPart = t.k === 't3' ? w.t3gp : t.k === 't4' ? w.t4gp : 0;
            return (
              <div key={t.k} className={`rounded-md border px-2.5 py-2 text-xs ${v > 0 ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 opacity-50'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
                  <span className="text-neutral-200">{t.label}</span>
                  <span className="ml-auto font-mono text-neutral-100">{fmtM(v)}</span>
                </div>
                <div className="text-neutral-500 mt-1 leading-snug">{t.desc}</div>
                {gpPart > 0 && <div className="text-rose-300 mt-1 font-mono text-[11px]">gestora: {fmtM(gpPart)}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="carry total" value={fmtM(w.gp)} sub={lucro > 0 ? `${fmtP(w.gp / lucro)} do lucro` : 'sem lucro'} color="text-rose-300" />
        <Stat label="MOIC líquido cotista" value={fmtX(w.lp / pi, 2)} sub={`bruto ${fmtX(moic, 1)} sobre o investido`} color="text-teal-300" />
        <Stat label="TIR bruta ≈" value={fmtP(grossIrr)} sub="dos investimentos" />
        <Stat label="TIR líquida ≈" value={fmtP(netIrr)} sub="após taxas e carry" color="text-amber-300" />
      </div>

      <Predict question={`Arraste o MOIC bruto para 1,4x com hurdle de IPCA + 6%. Quanto a gestora recebe de carry?`}>
        Zero. Com 1,4x bruto sobre {fmtBi(invested)} investidos, as distribuições mal cobrem o capital integralizado mais o hurdle, porque as taxas também foram integralizadas e precisam voltar primeiro. É isso que o hurdle faz: separa "ganhou dinheiro" de "ganhou mais do que a inflação + 6%". A gestora vive só da taxa de gestão.
      </Predict>

      <Block>{String.raw`\underbrace{\text{hurdle}}_{\text{tier 2}} = PI\cdot\big[(1+\num{\text{IPCA}})(1+\num{6\%})\big]^{t} - PI \qquad \underbrace{\text{catch-up}}_{\text{tier 3}}:\ \ x=\frac{c\cdot T_2}{k-c}`}</Block>
      <p className="text-xs text-neutral-400">
        <Eq>{'PI'}</Eq> = capital integralizado, <Eq>{'c'}</Eq> = carry (20%), <Eq>{'k'}</Eq> = fração do catch-up que vai para a gestora (100% = full catch-up), <Eq>{'T_2'}</Eq> = o hurdle pago. Com catch-up de 100%, o fundo que passa do hurdle termina com a gestora tendo exatamente 20% de <i>todo</i> o lucro, não só do excesso.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-rose-300">a taxa de gestão, em reais</Eyebrow>
          <div>Anos 1–5: 2% × {fmtBi(FUNDO.tamanho)} = <b className="text-neutral-100">{fmtM(FUNDO.tamanho * 0.02)}/ano</b>.</div>
          <div>Anos 6–12: 2% sobre o capital investido que ainda não saiu, uma base que encolhe a cada venda.</div>
          <div>Vida inteira: ≈ 15% do fundo, <Grounding>≈ R$ 375–400 M</Grounding>, o tamanho de um deal médio da carteira.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-amber-300">termos que você vai ver no regulamento</Eyebrow>
          <div><b className="text-neutral-100">Europeu (whole fund):</b> carry só depois de todo o capital + hurdle do fundo voltar. Padrão no Brasil.</div>
          <div><b className="text-neutral-100">Americano (deal-by-deal):</b> carry a cada saída boa; exige <Term>clawback</Term> se os deals seguintes forem ruins.</div>
          <div><b className="text-neutral-100">GP commitment:</b> a gestora e os sócios investem 1–3% do fundo como cotistas.</div>
          <div><b className="text-neutral-100">Fee offset:</b> fees cobrados das investidas (conselho, monitoramento) abatem a taxa de gestão.</div>
        </div>
      </div>

      <Misconception
        wrong='"2 e 20" significa que a gestora fica com 20% do retorno.'
        right="fica com 20% do lucro, e só se o fundo passar do hurdle. E a taxa de gestão sai antes, sobre o capital comprometido, faça o fundo lucro ou não."
        because="por isso a diferença entre a TIR bruta (dos deals) e a líquida (do cotista) é de 4 a 7 pontos percentuais num fundo típico. Olhe as duas no relatório."
      />
      <WhenItMatters>
        Todo IC memo mostra TIR e MOIC brutos do deal; todo relatório a cotista mostra os líquidos. Quem capta o próximo fundo negocia exatamente estes botões: taxa, base da taxa, hurdle, catch-up, europeu × americano, key person.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>O hurdle indexado é uma particularidade brasileira.</b> Lá fora o padrão é 8% nominal em dólar. Aqui, com inflação e juros altos, um hurdle nominal fixo ficaria fácil demais em anos de IPCA alto e difícil demais nos de IPCA baixo. IPCA + 6% a 8% é a referência comum; alguns fundos usam o CDI. Sempre confira qual índice e se a capitalização é composta.
        </p>
        <p>
          <b>A RCVM 175 limitou a antecipação:</b> a performance só pode ser paga quando houver distribuição efetiva ao cotista, e nunca calculada sobre ganho de valor justo não realizado. Isso tira o incentivo de "marcar para cima" a carteira para receber carry.
        </p>
        <p>
          <b>Carry na pessoa física.</b> Nos EUA, o carry é tributado como ganho de capital. No Brasil, a taxa de performance chega à gestora como receita de prestação de serviço (PIS/COFINS, ISS, IRPJ/CSLL) e depois aos sócios como dividendos, que desde 2026 podem ter retenção de 10% acima de R$ 50 mil por mês (Lei 15.270/2025). Por isso muitas casas estruturam o carry dos sócios como participação num veículo cotista. O tratamento é assunto de tributarista, caso a caso.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Um fundo teve MOIC bruto de 2,0x. Por que o cotista viu só ~1,6x?', a: 'Porque o cotista integralizou também taxas e despesas (≈15–20% do fundo), que não viraram investimento; e depois pagou carry sobre o lucro. O bruto é medido sobre o capital investido; o líquido, sobre tudo o que saiu do bolso do cotista.' },
        { q: 'Para que serve o catch-up?', a: 'Para que, passado o hurdle, a gestora termine com 20% de todo o lucro e não só do excesso sobre o hurdle. Sem catch-up, o hurdle funciona como uma franquia; com catch-up de 100%, funciona como um gatilho.' },
        { q: 'O que é clawback e por que o cotista brasileiro se preocupa menos com ele?', a: 'É a devolução de carry pago a mais. Ele só é necessário quando o carry é pago deal a deal (modelo americano). No Brasil, o padrão é o modelo europeu, e a RCVM 175 exige distribuição efetiva, o que reduz o risco de pagar carry cedo demais.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 05 · CUSTOS */

const CUSTOS_DEAL = [
  { k: 'Estruturação da dívida + garantia firme', v: 4.5, quem: 'holding', cor: '#38bdf8', nota: '≈ 1,5–2,5% da emissão de R$ 250 M, pago ao banco coordenador. Sem garantia firme, sai mais barato, mas o SPA fica sem certeza de funding.' },
  { k: 'Advogados: estrutura, SPA, acordo', v: 3.0, quem: 'fundo/holding', cor: '#a78bfa', nota: 'Escritório do comprador: estrutura societária e fiscal, markup do SPA, acordo de acionistas, escritura da debênture.' },
  { k: 'DD financeira + QoE (Big Four)', v: 2.5, quem: 'fundo/holding', cor: '#fbbf24', nota: 'Quality of earnings, dívida líquida, capital de giro normalizado. Base do preço e dos covenants.' },
  { k: 'DD jurídica e trabalhista', v: 2.0, quem: 'fundo/holding', cor: '#c084fc', nota: 'Contratos, litígios, contingências trabalhistas e regulatórias (Anvisa, licenças). Onde mora o risco de sucessão.' },
  { k: 'DD comercial / operacional', v: 2.0, quem: 'fundo/holding', cor: '#2dd4bf', nota: 'Consultoria de estratégia: mercado, clientes, precificação, plano de criação de valor.' },
  { k: 'Assessor financeiro buy-side', v: 2.0, quem: 'fundo/holding', cor: '#f472b6', nota: 'Opcional em buyout. Muitas gestoras fazem internamente; quando contratado, retainer + success fee.' },
  { k: 'DD tributária', v: 1.0, quem: 'fundo/holding', cor: '#fb923c', nota: 'ICMS (créditos, substituição tributária), PIS/COFINS, planejamentos agressivos, parcelamentos.' },
  { k: 'ESG, ambiental, TI, seguros', v: 0.5, quem: 'fundo/holding', cor: '#34d399', nota: 'Passivo ambiental, cibersegurança, apólices. Em distribuidora de saúde, também rastreabilidade e armazenagem.' },
  { k: 'CADE (taxa + advogados)', v: 0.3, quem: 'comprador', cor: '#f87171', nota: 'Taxa processual de R$ 85 mil + advogados concorrenciais. O rito sumário levou em média ~15 dias em 2025.' },
  { k: 'Cartórios, B3, agente fiduciário, rating', v: 0.2, quem: 'holding', cor: '#94a3b8', nota: 'Registro da emissão, custódia na B3, agente fiduciário (anual), rating (quando exigido).' },
];

const CUSTOS_FUNDO = [
  { k: 'Taxa de gestão (2%)', v: 50.0, cor: '#fb7185', nota: 'O time, o escritório, as viagens, o salário do analista. Sobre o capital comprometido no período de investimento.' },
  { k: 'Deals que morreram (broken deals)', v: 2.0, cor: '#f97316', nota: 'DD e advogados de deals que não fecharam. Quem paga (fundo ou gestora) é negociado com os cotistas no regulamento.' },
  { k: 'Taxa de administração + controladoria', v: 2.0, cor: '#a78bfa', nota: 'Administrador fiduciário: centésimos de ponto com piso mensal em reais.' },
  { k: 'Auditoria + laudos de valor justo', v: 0.8, cor: '#fbbf24', nota: 'Auditor independente do fundo e avaliações anuais da carteira a valor justo.' },
  { k: 'Advogados do fundo, assembleias, relatórios', v: 0.8, cor: '#2dd4bf', nota: 'Consultas regulatórias, atas, alterações de regulamento, side letters.' },
  { k: 'Custódia', v: 0.3, cor: '#38bdf8', nota: 'Custódia e escrituração das cotas.' },
  { k: 'Seguros (D&O) e outros', v: 0.3, cor: '#94a3b8', nota: 'Responsabilidade de conselheiros indicados pelo fundo nas investidas, e despesas diversas.' },
  { k: 'Taxa de fiscalização CVM + ANBIMA', v: 0.1, cor: '#f87171', nota: 'CVM: anual, por classe, por faixa de patrimônio (≈ R$ 3 mil a R$ 57 mil). ANBIMA: registro e taxa de autorregulação.' },
];

const CostBar = ({ items, total, unit }) => {
  const [hover, setHover] = useState(null);
  return (
    <>
      <div className="flex h-10 rounded-md overflow-hidden border border-white/10">
        {items.map((it, i) => (
          <div key={it.k} style={{ width: `${(it.v / total) * 100}%`, background: it.cor, opacity: hover && hover.i !== i ? 0.35 : 0.85, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => setHover({ i, mx: e.clientX, my: e.clientY })}
            onMouseMove={(e) => setHover({ i, mx: e.clientX, my: e.clientY })}
            onMouseLeave={() => setHover(null)} />
        ))}
      </div>
      <FloatingTip hover={hover} width={300} render={(h) => {
        const it = items[h.i];
        return (
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: it.cor }}>{it.k}</div>
            <div className="font-mono text-neutral-100">{fmtM(it.v, 1)}{unit} · {fmtP(it.v / total, 0)} do total</div>
            {it.quem && <div className="text-neutral-400">quem paga: {it.quem}</div>}
            <div className="text-neutral-300 leading-snug">{it.nota}</div>
          </div>
        );
      }} />
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {items.map((it, i) => (
          <div key={it.k} className="flex items-center gap-2 text-[11px] text-neutral-300"
            onMouseEnter={(e) => setHover({ i, mx: e.clientX, my: e.clientY })} onMouseLeave={() => setHover(null)}>
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: it.cor }} />
            <span className="flex-1">{it.k}</span>
            <span className="font-mono text-neutral-400">{it.v.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const CustosCard = () => {
  const [view, setView] = useState('deal');
  const totDeal = CUSTOS_DEAL.reduce((s, x) => s + x.v, 0);
  const totFundo = CUSTOS_FUNDO.reduce((s, x) => s + x.v, 0);
  return (
    <Card id="custos" icon={Receipt} title="Onde o dinheiro vaza: o mapa de custos" subtitle="Custos de transação do deal Tucano e custos anuais de manter o fundo de pé." accent="orange" index={secIndex('custos')}>
      <MinSchema>
        Comprar uma empresa custa <b>~2–3% do EV</b> em assessores e dívida; manter um fundo custa <b>~2,3% a.a. do comprometido</b>, quase tudo taxa de gestão. Os dois saem do bolso do cotista antes de qualquer lucro.
      </MinSchema>
      <Seg value={view} onChange={setView} options={[{ id: 'deal', label: 'custos do deal (uma vez)' }, { id: 'fundo', label: 'custos do fundo (por ano)' }]} />
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        {view === 'deal' ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2 text-[11px]">
              <span className="text-neutral-400">comprador · deal {DEAL.alvo} · EV {fmtM(DEAL.ev)}</span>
              <span className="font-mono text-orange-200">{fmtM(totDeal)} · {fmtP(totDeal / DEAL.ev, 2)} do EV</span>
            </div>
            <CostBar items={CUSTOS_DEAL} total={totDeal} unit="" />
            <div className="text-[10px] text-neutral-500 mt-2">Do outro lado da mesa, o vendedor paga o assessor sell-side (tipicamente 1–3% do valor, em success fee) e seus advogados. Passe o mouse nas faixas.</div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2 text-[11px]">
              <span className="text-neutral-400">{FUNDO.nome} · {fmtBi(FUNDO.tamanho)} comprometidos · período de investimento</span>
              <span className="font-mono text-orange-200">{fmtM(totFundo, 1)}/ano · {fmtP(totFundo / FUNDO.tamanho, 2)}</span>
            </div>
            <CostBar items={CUSTOS_FUNDO} total={totFundo} unit="/ano" />
          </>
        )}
      </div>

      <Predict question="Dos R$ 18 milhões de custos do comprador no deal Tucano, qual linha é a maior? Chute antes de olhar a barra.">
        A estruturação da dívida (≈ R$ 4,5 M), não os advogados nem a Big Four. O fee do banco é um percentual da emissão, então cresce com a alavancagem; os assessores cobram por escopo. Em deals grandes e muito alavancados, a dívida costuma ser o maior custo de transação do comprador.
      </Predict>

      <div className="grid sm:grid-cols-3 gap-2">
        <Stat label="custos do comprador" value={fmtP(totDeal / DEAL.ev, 1)} sub="do EV · uma vez" color="text-orange-300" />
        <Stat label="custo anual do fundo" value={fmtP(totFundo / FUNDO.tamanho, 1)} sub="do comprometido" color="text-rose-300" />
        <Stat label="W&I no Brasil" value="≈ 2%" sub="do limite segurado (prêmio)" color="text-violet-300" />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
        <Eyebrow color="text-orange-300">o custo invisível: institucionalizar a investida</Eyebrow>
        <div>Depois do closing, a Tucano passa a pagar coisas que a família não pagava: auditoria Big Four, um CFO de mercado, controller, ERP decente, compliance e canal de denúncias, conselho com independentes, D&amp;O. É comum somar dezenas de pontos-base da receita no primeiro ano. Isso entra no plano de 100 dias e no EBITDA pró-forma, e costuma ser subestimado no modelo.</div>
      </div>

      <Misconception
        wrong="custo de transação é detalhe perto do preço."
        right={`2–3% do EV sai do equity no dia 1. Num deal com ${fmtM(SU.equityTotal)} de equity, os ${fmtM(SU.custos)} de custos são ~${fmtP(SU.custos / SU.equityTotal, 0)} do cheque: o deal precisa criar esse valor antes de empatar.`}
        because="custos de transação são pagos com equity (ou dívida que o equity garante) e não viram ativo."
      />
      <WhenItMatters>
        O analista monta a tabela de fontes e usos e o orçamento da due diligence; o sócio negocia escopo e fee com os assessores. E o cotista pergunta, na captação, quem paga os broken deals.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Quem paga o quê é negociável.</b> Custos de deals concluídos normalmente vão para a holding ou a investida (capitalizados na aquisição), o que tem efeito fiscal. Custos de deals que morreram (broken deals) vão para o fundo, isto é, para os cotistas, a menos que o regulamento diga o contrário. Cotistas sofisticados pedem teto de despesas de constituição e transparência total das despesas cobradas ao fundo.
        </p>
        <p>
          <b>Seguro de W&amp;I.</b> O seguro de declarações e garantias cresceu no Brasil (≈ +50% em apólices entre 2024 e 2025), mas custa caro: cerca de 2% do limite segurado, contra ~0,4% na Europa, porque contingências tributárias e trabalhistas brasileiras são difíceis de precificar e costumam ser excluídas. Ele troca escrow por prêmio. Faz sentido quando o vendedor é um fundo em fim de vida, que não quer deixar dinheiro preso por anos.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que o fee do banco cresce com a alavancagem?', a: 'Porque é um percentual da emissão (estruturação + garantia firme). Mais dívida no deal = fee maior, além de mais juros por ano.' },
        { q: 'Um deal morreu na due diligence. Quem paga os R$ 3 M de Big Four e advogados?', a: 'Em geral o fundo (os cotistas), como despesa de broken deal, se o regulamento permitir. Por isso as gestoras escalonam a DD: primeiro as frentes baratas e decisivas, e só depois as caras.' },
        { q: 'O que é "institucionalizar" a investida e por que pesa no EBITDA?', a: 'Levar a empresa ao padrão de governança do fundo: auditoria de primeira linha, CFO, controles, compliance, conselho. São custos recorrentes que a família não tinha, e reduzem o EBITDA que o fundo pagou para ter.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 06 · PROCESSO */

const STAGES = [
  { id: 'orig', label: 'Originação', a: -6, b: 0, cor: '#a78bfa',
    doc: 'teaser · NDA', voce: 'Triagem de dezenas de teasers por mês, primeira call com o assessor, screening memo de 2 páginas.',
    quem: 'sócios (relacionamento), assessores sell-side, o próprio fundador (deal proprietário)',
    pega: 'Deal proprietário (sem leilão) sai mais barato, mas é raro. A maioria vem de leilão organizado por um banco ou boutique.' },
  { id: 'r1', label: '1ª rodada', a: 0, b: 5, cor: '#818cf8',
    doc: 'CIM · IOI', voce: 'Modelo de LBO a partir do CIM, comparáveis, pré-comitê (IC 1) e proposta não vinculante com faixa de preço.',
    quem: 'time do deal, comitê de investimentos',
    pega: 'A IOI é um "ingresso" para a 2ª rodada. Faixa alta demais cria expectativa que vai custar caro depois.' },
  { id: 'r2', label: '2ª rodada + DD', a: 5, b: 14, cor: '#38bdf8',
    doc: 'VDR · management presentation · relatórios de DD', voce: 'Coordena Big Four, advogados e consultoria; lista de Q&A no data room; red flag report; refina o modelo com o QoE.',
    quem: 'assessores de DD, management da alvo, bancos (sondagem de dívida)',
    pega: 'Os achados da DD viram três coisas: ajuste de preço, escrow/indenização ou condição precedente. Anote cada um já com o destino.' },
  { id: 'bind', label: 'Proposta vinculante', a: 14, b: 15.5, cor: '#2dd4bf',
    doc: 'binding offer · markup do SPA · commitment letter', voce: 'IC memo final, fontes e usos, carta de compromisso dos bancos, comentários ao SPA do vendedor.',
    quem: 'comitê de investimentos, bancos, advogados',
    pega: 'Vendedor compara preço E certeza: quanto markup no SPA, se a dívida está garantida, quantas condições precedentes.' },
  { id: 'neg', label: 'Exclusividade', a: 15.5, b: 20, cor: '#34d399',
    doc: 'SPA · acordo de acionistas · disclosure schedules', voce: 'Rodadas de negociação do SPA, fechamento de pontos de DD, cronograma de closing, estrutura da holding.',
    quem: 'advogados das duas partes, sócios',
    pega: 'Exclusividade tem prazo (30–60 dias). Estourou, o vendedor volta ao mercado.' },
  { id: 'sign', label: 'Signing', a: 20, b: 20.6, cor: '#fbbf24',
    doc: 'SPA assinado · notificação ao CADE', voce: 'Checklist de assinaturas, comunicado, protocolo do CADE, plano de integração.',
    quem: 'todos',
    pega: 'A partir daqui vale o gun jumping: nada de mandar na empresa nem trocar informação sensível antes da aprovação do CADE.' },
  { id: 'cps', label: 'Condições precedentes', a: 20.6, b: 28, cor: '#fb923c',
    doc: 'CP tracker · waivers · aprovação CADE', voce: 'Rastreia cada CP: CADE, waiver dos credores da dívida antiga, consentimentos de clientes, reorganizações, licenças.',
    quem: 'advogados, bancos, credores atuais, CADE',
    pega: 'O CADE raramente é o gargalo (rito sumário ≈ 15 dias em 2025). O que atrasa são waivers de dívida antiga e reorganizações societárias.' },
  { id: 'close', label: 'Closing', a: 28, b: 28.6, cor: '#fb7185',
    doc: 'funds flow memo · chamada de capital · transferência das ações', voce: 'Planilha de funds flow (quem paga quem, que conta, que hora), chamada de capital, liquidação da debênture, posse do conselho.',
    quem: 'administrador, bancos, advogados, escriturador',
    pega: 'Closing é logística de TED em reais com hora marcada: o funds flow errado atrasa o fechamento inteiro.' },
  { id: 'pos', label: 'Pós-closing', a: 28.6, b: 40, cor: '#f472b6',
    doc: 'ajuste de preço · 100-day plan', voce: 'Apura dívida líquida e capital de giro do closing (se completion accounts), roda o plano de 100 dias, monta o reporting mensal.',
    quem: 'CFO da investida, Big Four, gestora',
    pega: 'O ajuste de preço gera briga em quase todo deal. Definições bem escritas no SPA evitam arbitragem.' },
];

const ProcessoCard = () => {
  const [sel, setSel] = useState('r2');
  const S = STAGES.find((s) => s.id === sel);
  const W = 640, pl = 150, pr = 24, rowH = 22, pt = 22;
  const lo = -6, hi = 40;
  const sx = (w) => pl + ((w - lo) / (hi - lo)) * (W - pl - pr);
  const H = pt + STAGES.length * rowH + 8;
  return (
    <Card id="processo" icon={Route} title="Do teaser ao closing: o processo de um deal" subtitle="Um leilão típico leva ~7 meses do CIM ao dinheiro na conta. Clique numa fase." accent="sky" index={secIndex('processo')}>
      <MinSchema>
        Leilão em duas rodadas (não vinculante → vinculante), DD no meio, <Term>SPA</Term> no <Term>signing</Term>, <Term>condições precedentes</Term> até o <Term>closing</Term>. Cada achado da DD vira <b>preço, garantia ou condição</b>.
      </MinSchema>
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
          {[0, 8, 16, 24, 32, 40].map((w) => (
            <g key={w}>
              <line x1={sx(w)} x2={sx(w)} y1={pt - 6} y2={H - 4} stroke="#262626" />
              <text x={sx(w)} y={12} textAnchor="middle" fontSize="9.5" fill="#8a8a8a">{w === 0 ? 'CIM' : `sem ${w}`}</text>
            </g>
          ))}
          {STAGES.map((s, i) => {
            const y = pt + i * rowH;
            const on = s.id === sel;
            return (
              <g key={s.id} onClick={() => setSel(s.id)} style={{ cursor: 'pointer' }}>
                <rect x={0} y={y} width={W} height={rowH} fill={on ? 'rgba(255,255,255,0.05)' : 'transparent'} />
                <text x={pl - 8} y={y + 14.5} textAnchor="end" fontSize="11" fill={on ? '#f5f5f5' : '#a3a3a3'} fontWeight={on ? 600 : 400}>{s.label}</text>
                <rect x={sx(s.a)} y={y + 5} width={Math.max(6, sx(s.b) - sx(s.a))} height={rowH - 10} rx="3" fill={s.cor} opacity={on ? 0.95 : 0.55} />
              </g>
            );
          })}
        </svg>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={S.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="rounded-lg border bg-white/[0.02] p-3 grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs" style={{ borderColor: S.cor + '55' }}>
          <div className="sm:col-span-2 flex flex-wrap items-baseline gap-x-3">
            <span className="text-sm font-semibold" style={{ color: S.cor }}>{S.label}</span>
            <span className="font-mono text-[10px] text-neutral-400">{S.doc}</span>
          </div>
          <div><Eyebrow>o que você faz</Eyebrow><div className="text-neutral-200 mt-0.5">{S.voce}</div></div>
          <div><Eyebrow>com quem</Eyebrow><div className="text-neutral-200 mt-0.5">{S.quem}</div></div>
          <div className="sm:col-span-2 rounded-md bg-amber-400/5 border border-amber-400/20 px-2.5 py-1.5 text-amber-100/90">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-300" />{S.pega}
          </div>
        </motion.div>
      </AnimatePresence>

      <Predict question="Entre signing e closing, o que tende a demorar mais no Brasil: a aprovação do CADE ou os waivers da dívida antiga da empresa?">
        Em geral, os waivers e as reorganizações. O rito sumário do CADE levou em média ~15 dias em 2025 e cobriu ~94% dos casos. Já a dívida antiga quase sempre tem cláusula de <Term>mudança de controle</Term>: ou se consegue waiver em assembleia de credores, ou ela é quitada no closing, o que exige que a dívida nova esteja pronta no mesmo dia.
      </Predict>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-sky-300">leilão × proprietário</Eyebrow>
          <div><b className="text-neutral-100">Leilão:</b> assessor sell-side organiza, cronograma rígido, vários compradores, SPA do vendedor. Preço alto, pouca proteção.</div>
          <div><b className="text-neutral-100">Proprietário:</b> conversa bilateral, muitas vezes com fundador. Mais tempo, mais proteção, preço menor. Exige relacionamento de anos.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-sky-300">os comitês internos</Eyebrow>
          <div><b className="text-neutral-100">IC 1 (pré-comitê):</b> vale gastar dinheiro com DD? Aprova a IOI.</div>
          <div><b className="text-neutral-100">IC final:</b> preço máximo, estrutura, dívida, riscos, plano de 100 dias. Aprova a proposta vinculante.</div>
          <div className="text-neutral-500">O IC memo é o documento mais importante que o associado escreve.</div>
        </div>
      </div>
      <WhenItMatters>
        Analistas e associados vivem as fases 2 a 8: modelo, Q&amp;A, CP tracker, funds flow. Saber em que fase o deal está diz o que é urgente (e o que não é) a cada manhã.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Signing e closing simultâneos</b> acontecem quando não há CADE nem condições relevantes: menos risco, porque ninguém fica "casado sem morar junto". Com CADE, há um intervalo, e o SPA precisa dizer quem suporta o risco da empresa nesse meio-tempo (covenants de condução ordinária dos negócios, MAC, ticking fee).
        </p>
        <p>
          <b>Funds flow.</b> No closing, dezenas de pagamentos precisam acontecer na ordem certa: cotistas → FIP → holding; bancos → holding; holding → vendedor (líquido do escrow) → conta escrow; holding → credores antigos (quitação) → liberação de garantias. Tudo em TED/STR em horário bancário. Uma planilha de funds flow revisada por todas as partes é o documento mais operacional do deal.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que a proposta vinculante vem com markup do SPA?', a: 'Porque o preço sozinho não compara propostas: um comprador que pede escrow de 20% e dez condições precedentes vale menos do que outro que paga um pouco menos com escrow de 5%. O vendedor compara valor e certeza.' },
        { q: 'O que você pode fazer entre signing e closing sem risco de gun jumping?', a: 'Planejar a integração com clean teams, fazer due diligence confirmatória e garantir que a empresa siga a condução ordinária prevista no SPA. Não pode: dar ordens à gestão, integrar operações, trocar informação concorrencial sensível fora do clean team, nem pagar o preço antes da aprovação.' },
        { q: 'O que é um CP tracker?', a: 'A planilha que lista cada condição precedente do SPA, o responsável, o prazo e o status. É a ferramenta do associado entre o signing e o closing.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 07 · DUE DILIGENCE */

const PROB = { provavel: 0.7, possivel: 0.3, remota: 0.05 };
const PROB_LABEL = { provavel: 'provável', possivel: 'possível', remota: 'remota' };
const TREAT = [
  { id: 'preco', label: 'no preço', tip: 'Tratado como debt-like: reduz o preço real por real.' },
  { id: 'escrow', label: 'escrow', tip: 'Parte do preço fica retida numa conta vinculada até o risco prescrever.' },
  { id: 'indeniz', label: 'indenização', tip: 'Indenização específica: o vendedor paga se o risco se materializar, fora do cap e do basket.' },
  { id: 'aceita', label: 'aceitar', tip: 'O comprador assume o risco e o embute no preço que ofereceu.' },
];

const CONTINGS = [
  { id: 'trab', area: 'trabalhista', t: '140 ações de motoristas (horas extras)', v: 12, p: 'provavel', def: 'preco', nota: 'Já provisionada no balanço. Entra na ponte EV → equity como debt-like.' },
  { id: 'icms', area: 'tributária', t: 'Autuação de ICMS-ST em SP', v: 25, p: 'possivel', def: 'indeniz', nota: 'Discussão sobre a base de cálculo da substituição tributária. Anos de processo administrativo e judicial.' },
  { id: 'pj', area: 'trabalhista', t: 'Representantes comerciais como PJ', v: 15, p: 'possivel', def: 'escrow', nota: 'Passivo oculto: não há processo ainda. Aparece por entrevista e amostragem de contratos, não no relatório de litígios.' },
  { id: 'pis', area: 'tributária', t: 'Créditos de PIS/COFINS agressivos', v: 10, p: 'possivel', def: 'indeniz', nota: 'Créditos sobre despesas que a Receita pode não aceitar como insumo. Prazo de 5 anos para autuar.' },
  { id: 'civel', area: 'cível', t: 'Ação de hospital cliente (entrega)', v: 6, p: 'remota', def: 'aceita', nota: 'Os advogados avaliam como remota. Normalmente fica no risco do comprador.' },
  { id: 'amb', area: 'ambiental', t: 'Solo do CD antigo (combustível)', v: 8, p: 'possivel', def: 'escrow', nota: 'Responsabilidade ambiental é objetiva e acompanha o imóvel: quem compra herda.' },
];

const DDCard = () => {
  const [tr, setTr] = useState(() => Object.fromEntries(CONTINGS.map((c) => [c.id, c.def])));
  const sum = (f) => CONTINGS.filter((c) => tr[c.id] === f).reduce((s, c) => s + c.v, 0);
  const ev = (c) => c.v * PROB[c.p];
  const retido = CONTINGS.filter((c) => tr[c.id] === 'aceita').reduce((s, c) => s + ev(c), 0);
  const total = CONTINGS.reduce((s, c) => s + ev(c), 0);
  return (
    <Card id="dd" icon={Search} title="Due diligence à brasileira: onde os esqueletos moram" subtitle="Trabalhista, tributário e sucessão. E como cada achado vira preço, escrow ou indenização." accent="violet" index={secIndex('dd')}>
      <MinSchema>
        No Brasil, o grosso do risco de uma empresa média está em <b>contingências trabalhistas e tributárias</b>, e quem compra <b>herda</b> (<Term>sucessão</Term>). A DD serve para achar, medir e <b>alocar</b> cada risco: no preço, em <Term>escrow</Term>, em indenização ou no colo do comprador.
      </MinSchema>
      <div className="text-xs text-neutral-400">
        Os advogados classificam cada <Term>contingência</Term> pelo <Term>CPC 25</Term>: <span className="text-rose-300">provável</span> (provisiona), <span className="text-amber-300">possível</span> (só nota explicativa), <span className="text-neutral-300">remota</span> (nada). Abaixo, os achados na Tucano. Escolha o tratamento de cada um, como faria no markup do SPA:
      </div>
      <div className="space-y-2">
        {CONTINGS.map((c) => (
          <div key={c.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-violet-300 w-20 shrink-0">{c.area}</span>
              <span className="text-xs text-neutral-100 flex-1 min-w-[180px]">{c.t}</span>
              <span className={`text-[10px] rounded px-1.5 py-0.5 border ${c.p === 'provavel' ? 'border-rose-400/40 text-rose-200' : c.p === 'possivel' ? 'border-amber-400/40 text-amber-200' : 'border-white/15 text-neutral-300'}`}>{PROB_LABEL[c.p]}</span>
              <span className="font-mono text-xs text-neutral-200 w-16 text-right">{fmtM(c.v)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Seg size="xs" value={tr[c.id]} onChange={(v) => setTr((s) => ({ ...s, [c.id]: v }))} options={TREAT.map((t) => ({ id: t.id, label: t.label }))} />
              <span className="text-[10px] text-neutral-500 flex-1 min-w-[160px]">{c.nota}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="reduz o preço" value={fmtM(sum('preco'))} sub="debt-like" color="text-rose-300" />
        <Stat label="escrow" value={fmtM(sum('escrow'))} sub="retido do vendedor" color="text-amber-300" />
        <Stat label="indenização específica" value={fmtM(sum('indeniz'))} sub="se materializar" color="text-violet-300" />
        <Stat label="risco que fica com você" value={fmtM(retido, 1)} sub={`valor esperado, de ${fmtM(total, 1)}`} color={retido > 5 ? 'text-rose-300' : 'text-emerald-300'} />
      </div>
      <div className="text-[10px] text-neutral-500">Valor esperado com probabilidades ilustrativas: provável 70%, possível 30%, remota 5%. Na vida real, cada um é negociado.</div>

      <Predict question="Por que a pejotização dos representantes vai para escrow e não para o preço?">
        Porque ainda não existe processo nem provisão: o valor e a probabilidade são incertos, e o vendedor jura que o risco é baixo. Tirar do preço seria cobrar como certo algo incerto; indenização pura depende de o vendedor ter dinheiro daqui a 4 anos. O escrow é o meio-termo: o dinheiro existe, mas fica preso até o risco prescrever (5 anos na esfera trabalhista, contados de cada contrato).
      </Predict>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-violet-300">o mapa de risco de uma empresa média brasileira</Eyebrow>
          <div><b className="text-neutral-100">Trabalhista:</b> horas extras, pejotização, terceirização, equiparação salarial, insalubridade.</div>
          <div><b className="text-neutral-100">Tributário:</b> ICMS (substituição tributária, créditos, guerra fiscal), PIS/COFINS (conceito de insumo), planejamentos agressivos, parcelamentos.</div>
          <div><b className="text-neutral-100">Regulatório:</b> licenças sanitárias, ambientais, AVCB dos bombeiros, alvarás.</div>
          <div><b className="text-neutral-100">Societário e patrimonial:</b> imóveis no nome dos sócios, contratos com partes relacionadas, acordos antigos.</div>
          <div><b className="text-neutral-100">Anticorrupção:</b> contratos com o poder público, despachantes, doações.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-violet-300">sucessão: o que o comprador herda</Eyebrow>
          <div><b className="text-neutral-100">Tributário e trabalhista:</b> quem compra ações compra a empresa com todo o passado dela. Não há como "deixar para trás".</div>
          <div><b className="text-neutral-100">Anticorrupção (Lei 12.846):</b> em incorporação ou fusão, a sucessora responde por multa e reparação até o limite do patrimônio transferido.</div>
          <div><b className="text-neutral-100">Ambiental:</b> responsabilidade objetiva que acompanha o imóvel.</div>
          <div><b className="text-neutral-100">A exceção:</b> ativos comprados como <Term>UPI</Term> dentro de uma <Term>recuperação judicial</Term> vêm sem sucessão das dívidas.</div>
        </div>
      </div>

      <Misconception
        wrong="a due diligence encontra todos os problemas."
        right="ela encontra o que está documentado. Passivo oculto (pejotização não reclamada, crédito fiscal ainda não autuado) aparece por entrevista e amostragem, e a proteção real é contratual: escrow, indenização e declarações do vendedor."
        because="por isso o SPA brasileiro tem escrows maiores e indenizações específicas mais longas do que o americano ou europeu."
      />
      <WhenItMatters>
        O associado consolida o red flag report num quadro "achado → valor → probabilidade → tratamento" que alimenta o markup do SPA e a ponte de preço. É a planilha que liga os advogados ao modelo.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Por que o Brasil é diferente.</b> O contencioso trabalhista brasileiro é um dos maiores do mundo em volume de processos, e a legislação tributária muda por decisão judicial (a "tese do século", que excluiu o ICMS da base do PIS/COFINS, criou créditos bilionários e, depois, discussões sobre como aproveitá-los). Uma distribuidora média pode ter centenas de processos ativos. O advogado não vai dizer se você ganha; vai dar a classificação provável/possível/remota, que é um julgamento, e o valor em risco. Leia as premissas.
        </p>
        <p>
          <b>Prazos que definem o escrow.</b> Tributos federais prescrevem, em regra, em 5 anos. Reclamações trabalhistas podem ser ajuizadas até 2 anos após o fim do contrato, cobrindo os 5 anos anteriores. Por isso escrows brasileiros duram 3 a 5 anos, com liberações parciais escalonadas, enquanto lá fora são 12 a 24 meses.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Uma contingência "possível" de R$ 25 M entra no balanço?', a: 'Não como provisão. Pelo CPC 25, só a provável é provisionada; a possível vai para a nota explicativa. Mas, na negociação, ela vira indenização específica ou escrow, porque o comprador herda o risco.' },
        { q: 'Por que comprar ativos numa recuperação judicial pode ser atraente?', a: 'Porque a venda de uma UPI aprovada no plano vem sem sucessão das dívidas do devedor. Você compra a operação limpa. Em troca, o processo é judicial, lento e competitivo.' },
        { q: 'O que é um red flag report?', a: 'O resumo executivo da DD: só os achados que mudam preço, estrutura ou a decisão de comprar, com valor e recomendação de tratamento. É o que o comitê lê.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 08 · PONTE */

const EXTRA_DL = [
  { id: 'refis', k: 'Parcelamento fiscal', v: 18, on: true, briga: 'Consenso: é dívida com a União, com juros. Entra.' },
  { id: 'trab', k: 'Contingências trabalhistas prováveis', v: 12, on: true, briga: 'Já provisionadas: entram. As possíveis vão para escrow ou indenização.' },
  { id: 'div', k: 'Dividendos declarados e não pagos', v: 5, on: true, briga: 'Dinheiro que já é do vendedor: entra.' },
  { id: 'bonus', k: 'Bônus de 2025 a pagar', v: 4, on: false, briga: 'Comprador: é dívida, foi gerado antes do closing. Vendedor: é custo operacional e já está no capital de giro.' },
  { id: 'adiant', k: 'Adiantamentos de clientes', v: 6, on: false, briga: 'Comprador: é caixa que já entrou por um serviço a entregar. Vendedor: é giro normal do negócio.' },
  { id: 'ifrs', k: 'Arrendamentos (IFRS 16)', v: 20, on: false, briga: 'Consistência: se o múltiplo foi aplicado sobre EBITDA pré-IFRS 16, o aluguel já saiu do EBITDA e o arrendamento não entra como dívida.' },
];

const BridgeChart = ({ steps }) => {
  const W = 640, H = 230, pl = 8, pr = 8, pt = 18, pb = 50;
  const n = steps.length;
  const bw = (W - pl - pr) / n;
  let run = 0;
  const bars = steps.map((s) => {
    let y0, y1;
    if (s.kind === 'total' || s.kind === 'start') { y0 = 0; y1 = s.v; run = s.v; }
    else { y0 = run; y1 = run + s.v; run = y1; }
    return { ...s, y0, y1 };
  });
  const hi = Math.max(...bars.map((b) => Math.max(b.y0, b.y1))) * 1.08;
  const sy = (v) => pt + (1 - v / hi) * (H - pt - pb);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
      <line x1={pl} x2={W - pr} y1={sy(0)} y2={sy(0)} stroke="#525252" />
      {bars.map((b, i) => {
        const x = pl + i * bw + bw * 0.14, w = bw * 0.72;
        const top = sy(Math.max(b.y0, b.y1)), bot = sy(Math.min(b.y0, b.y1));
        const col = b.kind === 'start' ? '#2dd4bf' : b.kind === 'total' ? (b.final ? '#34d399' : '#fbbf24') : b.v < 0 ? '#fb7185' : '#34d399';
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={Math.max(1.5, bot - top)} fill={col} opacity="0.85" rx="2" style={{ transition: 'all 0.3s' }} />
            {i < bars.length - 1 && bars[i + 1].kind === 'delta' && (
              <line x1={x + w} x2={x + bw} y1={sy(b.y1)} y2={sy(b.y1)} stroke="#737373" strokeDasharray="2 2" />
            )}
            <text x={x + w / 2} y={top - 4} textAnchor="middle" fontSize="9.5" fill="#e5e5e5" fontFamily="ui-monospace, monospace">
              {b.kind === 'delta' ? (b.v > 0 ? '+' : '−') + Math.abs(b.v).toFixed(0) : b.v.toFixed(0)}
            </text>
            {b.short.split('\n').map((ln, j) => (
              <text key={j} x={x + w / 2} y={H - pb + 13 + j * 11} textAnchor="middle" fontSize="9" fill="#a3a3a3">{ln}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const PonteCard = () => {
  const [mec, setMec] = useState('completion');
  const [dl, setDl] = useState(() => Object.fromEntries(EXTRA_DL.map((d) => [d.id, d.on])));
  const [wc, setWc] = useState(-8);
  const [escrow, setEscrow] = useState(23);
  const [dias, setDias] = useState(120);
  const cdi = 0.1365;
  const dlTot = EXTRA_DL.filter((d) => dl[d.id]).reduce((s, d) => s + d.v, 0);
  const wcAdj = mec === 'completion' ? wc : 0;
  const equity = DEAL.ev - DEAL.dividaBruta + DEAL.caixa - dlTot + wcAdj;
  const ticking = mec === 'locked' ? equity * (Math.pow(1 + cdi, dias / 365) - 1) : 0;
  const preco = equity + ticking;
  const naConta = preco - escrow - SU.rollover;
  const steps = [
    { short: 'EV', v: DEAL.ev, kind: 'start' },
    { short: 'dívida\nbruta', v: -DEAL.dividaBruta, kind: 'delta' },
    { short: 'caixa', v: DEAL.caixa, kind: 'delta' },
    { short: 'debt-\nlike', v: -dlTot, kind: 'delta' },
    ...(mec === 'completion' ? [{ short: 'Δ capital\nde giro', v: wcAdj, kind: 'delta' }] : [{ short: 'ticking\nfee', v: ticking, kind: 'delta' }]),
    { short: 'preço das\nações', v: preco, kind: 'total' },
    { short: 'escrow', v: -escrow, kind: 'delta' },
    { short: 'rollover', v: -SU.rollover, kind: 'delta' },
    { short: 'na conta', v: naConta, kind: 'total', final: true },
  ];
  return (
    <Card id="ponte" icon={Calculator} title="Do EV ao cheque: a ponte de preço" subtitle={`"Pagamos 8x" não é o que o vendedor recebe. Veja cada ajuste entre o EV de ${fmtM(DEAL.ev)} e o dinheiro na conta.`} accent="teal" index={secIndex('ponte')}>
      <MinSchema>
        Negocia-se <Term>EV</Term> (múltiplo × <Term>EBITDA</Term>); paga-se <Term>equity value</Term>. Entre os dois estão <Term>dívida líquida</Term>, itens <Term>debt-like</Term> e o ajuste de <Term>capital de giro</Term> contra o <Term>peg</Term>. Metade da negociação do SPA é a definição de cada uma dessas linhas.
      </MinSchema>
      <Block>{String.raw`\text{Equity} = \underbrace{\num{8{,}0x}\times \num{100}}_{EV=800} - \underbrace{(150-30)}_{\text{dívida líquida}} - \text{debt-like} \pm \Delta\text{capital de giro}`}</Block>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neutral-400">mecanismo de preço:</span>
        <Seg value={mec} onChange={setMec} options={[{ id: 'completion', label: 'completion accounts' }, { id: 'locked', label: 'locked box' }]} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <BridgeChart steps={steps} />
        <div className="text-[10px] text-neutral-500 text-right">R$ milhões</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Eyebrow color="text-teal-300">o que entra como debt-like? (clique)</Eyebrow>
          {EXTRA_DL.map((d) => (
            <label key={d.id} className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer ${dl[d.id] ? 'border-rose-400/30 bg-rose-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <input type="checkbox" checked={dl[d.id]} onChange={(e) => setDl((s) => ({ ...s, [d.id]: e.target.checked }))} className="mt-0.5 accent-rose-400" />
              <span className="flex-1">
                <span className="text-neutral-100">{d.k}</span> <span className="font-mono text-neutral-400">{fmtM(d.v)}</span>
                <span className="block text-[10px] text-neutral-500 leading-snug">{d.briga}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-3">
          {mec === 'completion' ? (
            <Slider label="capital de giro no closing vs peg" value={wc} min={-30} max={30} step={1} onChange={setWc}
              fmt={(v) => (v > 0 ? '+' : '') + v + ' M'} hint="abaixo do peg = o vendedor secou o giro antes de sair → o preço cai real por real" />
          ) : (
            <Slider label="dias entre o balanço de referência e o closing" value={dias} min={30} max={240} step={10} onChange={setDias}
              fmt={(v) => `${v} dias`} hint="ticking fee: o equity rende ~CDI até o closing, porque o caixa gerado já é do comprador" />
          )}
          <Slider label="escrow (conta vinculada)" value={escrow} min={0} max={100} step={1} onChange={setEscrow} fmt={(v) => `${fmtM(v)} · ${fmtP(v / preco, 0)} do preço`} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="preço das ações" value={fmtM(preco)} sub={`${fmtX(preco / DEAL.ebitda)} o EBITDA`} color="text-amber-300" />
            <Stat label="na conta no closing" value={fmtM(naConta)} sub={`${fmtP(naConta / DEAL.ev, 0)} do EV "negociado"`} color="text-emerald-300" />
          </div>
        </div>
      </div>

      <Predict question={`O fundador "vendeu por ${fmtM(DEAL.ev)}". Quanto você acha que caiu na conta dele no dia do closing?`}>
        Com os ajustes padrão: {fmtM(DEAL.ev - DEAL.dl - DEAL.debtLikeTotal - 8 - 23 - SU.rollover)}, ~{fmtP((DEAL.ev - DEAL.dl - DEAL.debtLikeTotal - 8 - 23 - SU.rollover) / DEAL.ev, 0)} do EV. Saem a dívida líquida (que o comprador quita ou assume), os debt-like, o giro abaixo do normal, o escrow (que pode voltar em 3–5 anos) e o rollover (que ele reinveste). O múltiplo é a manchete; a ponte é o dinheiro.
      </Predict>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-teal-300">completion accounts</Eyebrow>
          <div>Preço provisório no closing; em 60–90 dias, o comprador apura o balanço de fechamento e o preço é ajustado pela dívida líquida e pelo giro reais.</div>
          <div className="text-neutral-500">Protege o comprador; gera discussão pós-closing, às vezes resolvida por perito ou arbitragem.</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-teal-300">locked box</Eyebrow>
          <div>Preço fixo sobre um balanço passado auditado. O vendedor garante que não houve <Term>leakage</Term> desde então, e o comprador paga um ticking fee pelo caixa gerado no meio-tempo.</div>
          <div className="text-neutral-500">Preferido por vendedores (certeza de preço); exige balanço confiável.</div>
        </div>
      </div>
      <Misconception
        wrong="debt-like é tudo que o comprador conseguir enfiar na lista."
        right="é o que tem natureza de financiamento ou de obrigação passada fora do curso normal. O resto é capital de giro, que já é ajustado pelo peg. Contar a mesma coisa duas vezes é o erro clássico."
        because="se um bônus a pagar já está nos fornecedores/obrigações do giro, colocá-lo também como debt-like tira o mesmo real duas vezes do preço."
      />
      <WhenItMatters>
        Essa ponte está em todo IC memo, em toda proposta vinculante e na planilha de funds flow do closing. O associado que domina as definições de dívida líquida e capital de giro do SPA ganha milhões na mesa sem mexer no múltiplo.
      </WhenItMatters>
      <QA items={[
        { q: 'Por que o peg costuma ser a média dos últimos 12 meses?', a: 'Para neutralizar a sazonalidade. Se o peg fosse o giro de um mês baixo, o vendedor ganharia um ajuste artificial ao fechar num mês de giro alto (e vice-versa).' },
        { q: 'No locked box, o que impede o vendedor de tirar um dividendo gordo antes do closing?', a: 'A cláusula de leakage: qualquer valor que sair para o vendedor ou partes relacionadas depois da data do balanço, fora das exceções permitidas, é devolvido real por real.' },
        { q: 'O arrendamento do CD é dívida?', a: 'Depende de como o EBITDA do múltiplo foi medido. Se o EBITDA é pré-IFRS 16 (aluguel como despesa), o arrendamento não entra; se é pós-IFRS 16 (aluguel fora do EBITDA), deve entrar como dívida. A regra é consistência.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 09 · CONTRATOS */

const CLAUSES = {
  spa: [
    { k: 'Declarações e garantias (R&W)', o: 'O vendedor afirma fatos sobre a empresa: balanços, impostos, contratos, litígios, licenças, compliance.', pe: 'Declarações amplas, "de conhecimento" só onde for inevitável.', vend: 'Qualificar tudo por conhecimento e materialidade; anexos de exceções (disclosure schedules) longos.', br: 'Anexos de exceções detalhados são a principal defesa do vendedor: o que está divulgado deixa de ser indenizável.' },
    { k: 'Indenização: cap, basket, de minimis', o: 'Limita quanto e a partir de quando o vendedor paga por violação de declarações.', pe: 'Cap alto, basket baixo e de minimis pequeno; prazos longos.', vend: 'Cap baixo, basket alto, prazos curtos.', br: 'Cap de 10–30% do preço é comum para declarações gerais; tributário e trabalhista costumam ficar fora do cap até a prescrição.' },
    { k: 'Indenização específica', o: 'Cobertura para riscos conhecidos na DD, real por real, fora do cap e do basket.', pe: 'Para todo achado "possível" relevante.', vend: 'Só o que não foi precificado.', br: 'Onde vão os achados da DD que não viraram preço (card anterior).' },
    { k: 'Escrow / holdback', o: 'Garante que o dinheiro da indenização exista.', pe: '10–20% do preço, 3–5 anos, liberação escalonada.', vend: 'O mínimo possível, ou seguro W&I no lugar.', br: 'Mais alto que lá fora por causa dos prazos prescricionais tributários e trabalhistas.' },
    { k: 'Earn-out', o: 'Parte do preço depende de metas futuras.', pe: 'Usar para fechar a diferença de valuation sem pagar hoje.', vend: 'Métricas simples e protegidas contra decisões do comprador que derrubem o resultado.', br: 'Fonte clássica de litígio: defina EBITDA do earn-out com precisão contábil.' },
    { k: 'MAC e condução ordinária', o: 'Entre signing e closing: o que o vendedor pode fazer e quando o comprador pode desistir.', pe: 'MAC amplo; lista longa de atos que exigem consentimento.', vend: 'MAC estreito, com exclusões (crise geral, mudança de lei).', br: 'Consentimentos antes do closing precisam respeitar o gun jumping.' },
    { k: 'Não concorrência / não aliciamento', o: 'O vendedor não compete nem contrata os funcionários por um período.', pe: '5 anos, território amplo.', vend: 'Curto e restrito.', br: 'Precisa de limite de tempo, território e objeto razoáveis para valer.' },
    { k: 'Lei e foro: arbitragem', o: 'Como se resolve a briga.', pe: 'Arbitragem numa câmara reconhecida, sigilosa.', vend: 'Idem.', br: 'Praticamente todo SPA relevante no Brasil tem cláusula arbitral; o Judiciário fica para medidas de urgência.' },
  ],
  sha: [
    { k: 'Conselho de administração', o: 'Quem indica quantos conselheiros.', pe: 'Maioria do conselho e o chairman.', vend: 'Assentos proporcionais + um independente de consenso.', br: 'O fundo precisa de influência efetiva para enquadrar o FIP. O conselho é onde ela se materializa.' },
    { k: 'Matérias qualificadas (vetos)', o: 'Decisões que exigem o voto do minoritário.', pe: 'Poucas, para não travar a gestão.', vend: 'Muitas: orçamento, dívida, M&A, dividendos, partes relacionadas.', br: 'Quando o fundo é minoritário (growth), a lista de vetos é o investimento.' },
    { k: 'Tag-along', o: 'Minoritário vende junto se o controlador vender.', pe: 'Aceita (é o padrão).', vend: 'Exige 100% do preço e mesmas condições.', br: 'A lei dá 80% para ações com voto em companhia aberta; em fechada, é contratual. No Novo Mercado, 100%.' },
    { k: 'Drag-along', o: 'Controlador obriga o minoritário a vender junto.', pe: 'Indispensável: o comprador da saída quer 100%.', vend: 'Preço mínimo, prazo mínimo, só em dinheiro.', br: 'Sem drag, o fundador pode travar a saída do fundo e cobrar ágio para liberar.' },
    { k: 'Preferência e lock-up', o: 'Quem pode vender a quem, e quando.', pe: 'Lock-up longo para o fundador; liberdade para o fundo.', vend: 'Simetria.', br: 'Transferências a veículos afiliados do fundo costumam ser livres.' },
    { k: 'Put, call, good/bad leaver', o: 'Opções que forçam compra ou venda em eventos definidos.', pe: 'Call sobre ações do executivo que sai (bad leaver = preço baixo).', vend: 'Put para vender ao fundo se houver impasse.', br: 'Prêmio/desconto definido em fórmula (múltiplo ou valor justo por laudo).' },
    { k: 'Direito de saída do fundo', o: 'O que acontece se o fundo precisar vender e ninguém concordar.', pe: 'Após N anos, poder de iniciar venda de 100% ou IPO.', vend: 'Direito de preferência na compra da parte do fundo.', br: 'O prazo do FIP é finito: o acordo precisa garantir um caminho de saída antes do fim do fundo.' },
  ],
};

const IndemnityCalc = () => {
  const [perda, setPerda] = useState(20);
  const [modo, setModo] = useState('franquia');
  const preco = SU.precoAcoes;
  const basket = 0.01 * preco;
  const cap = 0.15 * preco;
  const bruto = modo === 'franquia' ? Math.max(0, perda - basket) : perda >= basket ? perda : 0;
  const pago = Math.min(bruto, cap);
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
      <Eyebrow color="text-violet-300">calculadora de indenização · declarações gerais</Eyebrow>
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Slider label="perdas por violação de declarações (somadas, acima do de minimis)" value={perda} min={0} max={150} step={1} onChange={setPerda} fmt={(v) => fmtM(v)} />
        <Seg value={modo} onChange={setModo} options={[{ id: 'franquia', label: 'basket = franquia' }, { id: 'gatilho', label: 'basket = gatilho (tipping)' }]} />
      </div>
      <div className="relative h-8 rounded-md bg-white/[0.04] border border-white/10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-violet-400/60" style={{ width: `${(pago / 150) * 100}%`, transition: 'width 0.25s' }} />
        <div className="absolute inset-y-0 bg-rose-400/30" style={{ left: `${(pago / 150) * 100}%`, width: `${(Math.max(0, perda - pago) / 150) * 100}%`, transition: 'all 0.25s' }} />
        <div className="absolute inset-y-0 border-l border-dashed border-amber-300" style={{ left: `${(basket / 150) * 100}%` }} />
        <div className="absolute inset-y-0 border-l border-dashed border-rose-300" style={{ left: `${(cap / 150) * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-400">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-400/60 mr-1 align-middle" />vendedor paga {fmtM(pago, 1)}</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400/30 mr-1 align-middle" />fica com o comprador {fmtM(Math.max(0, perda - pago), 1)}</span>
        <span className="text-amber-300">┆ basket 1% = {fmtM(basket, 1)}</span>
        <span className="text-rose-300">┆ cap 15% = {fmtM(cap, 1)}</span>
      </div>
    </div>
  );
};

const ContratosCard = () => {
  const [doc, setDoc] = useState('spa');
  const [i, setI] = useState(1);
  const list = CLAUSES[doc];
  const c = list[Math.min(i, list.length - 1)];
  return (
    <Card id="contratos" icon={FileSignature} title="Os dois contratos que você vai ler mil vezes" subtitle="SPA (quem compra de quem, por quanto, com que garantias) e acordo de acionistas (como os sócios convivem e saem)." accent="violet" index={secIndex('contratos')}>
      <MinSchema>
        O <Term>SPA</Term> olha para <b>trás</b>: o que o vendedor garante sobre o passado e quem paga se não for verdade. O <Term>acordo de acionistas</Term> olha para <b>frente</b>: quem manda, o que exige consenso e como cada sócio sai.
      </MinSchema>
      <Seg value={doc} onChange={(v) => { setDoc(v); setI(0); }} options={[{ id: 'spa', label: 'SPA (compra e venda)' }, { id: 'sha', label: 'acordo de acionistas' }]} />
      <div className="grid md:grid-cols-[230px_1fr] gap-3">
        <div className="space-y-1">
          {list.map((x, j) => (
            <button key={x.k} onClick={() => setI(j)}
              className={`w-full text-left rounded-md border px-2.5 py-1.5 text-xs ${j === i ? 'border-violet-400/50 bg-violet-400/10 text-violet-100' : 'border-white/10 bg-white/[0.02] text-neutral-300 hover:text-neutral-100'}`}>
              {x.k}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={doc + c.k} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2 text-xs">
            <div className="text-sm font-semibold text-violet-200">{c.k}</div>
            <div className="text-neutral-200">{c.o}</div>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-md border border-teal-400/25 bg-teal-400/5 p-2"><Eyebrow color="text-teal-300">o fundo quer</Eyebrow><div className="text-neutral-200 mt-0.5">{c.pe}</div></div>
              <div className="rounded-md border border-amber-400/25 bg-amber-400/5 p-2"><Eyebrow color="text-amber-300">o outro lado quer</Eyebrow><div className="text-neutral-200 mt-0.5">{c.vend}</div></div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-2 text-neutral-300"><span className="text-[10px] uppercase tracking-wider text-violet-300 mr-1.5">no Brasil</span>{c.br}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <IndemnityCalc />
      <Predict question={`Perdas de ${fmtM(6)} por declarações violadas, basket de 1% do preço (~${fmtM(0.01 * SU.precoAcoes, 1)}). Quanto o vendedor paga com franquia? E com gatilho?`}>
        Com franquia: nada, porque {fmtM(6)} não passa dos {fmtM(0.01 * SU.precoAcoes, 1)}. Com gatilho: também nada. Se as perdas forem de {fmtM(20)}, a franquia paga {fmtM(20 - 0.01 * SU.precoAcoes, 1)} e o gatilho paga os {fmtM(20)} inteiros. O vendedor prefere franquia; o comprador, gatilho. Teste na calculadora.
      </Predict>

      <Misconception
        wrong="o acordo de acionistas é um anexo burocrático do SPA."
        right="é o contrato que governa os próximos 4 a 7 anos, e o que garante a saída do fundo. Um drag-along mal escrito pode travar a venda da empresa inteira."
        because="na saída, o comprador quer 100%. Se o fundador de 12% não for obrigado a vender, ele vira o dono da negociação."
      />
      <WhenItMatters>
        O associado faz o "issues list" (tabela de pontos em aberto, posição de cada lado, proposta de acordo) a cada rodada de markup. Saber o que é padrão de mercado evita gastar capital de negociação no que não importa.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Arquivamento e eficácia.</b> O acordo de acionistas arquivado na sede obriga a companhia (art. 118 da <Term>Lei 6.404</Term>): o presidente da assembleia não computa voto contra o acordo, e ações vinculadas não podem ser negociadas fora dele. Em limitadas não há essa mesma força legal, e por isso deals de PE quase sempre convertem a empresa (ou a holding) em S.A.
        </p>
        <p>
          <b>Por que arbitragem.</b> Um litígio de SPA no Judiciário pode levar uma década e é público. A arbitragem é sigilosa, técnica e dura de 1 a 3 anos. O custo é alto, mas proporcional aos valores em jogo. As câmaras mais usadas ficam em São Paulo.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Uma contingência tributária foi listada no anexo de exceções do vendedor. O comprador pode pedir indenização se ela se materializar?', a: 'Pela declaração geral, não: o que foi divulgado deixa de ser violação. Por isso riscos conhecidos precisam de indenização específica, negociada à parte, que vale apesar da divulgação.' },
        { q: 'Por que o fundo quer drag-along mesmo tendo 88% das ações?', a: 'Porque o comprador da saída quase sempre exige 100%. Sem o drag, o minoritário pode se recusar a vender ou pedir prêmio.' },
        { q: 'O que é bad leaver?', a: 'O executivo que sai por justa causa ou para a concorrência. O acordo prevê que o fundo compre as ações dele a preço baixo (custo ou valor menor), para punir a saída e proteger o plano de incentivos.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 10 · DÍVIDA */

const USOS = [
  { id: 'todos', label: 'todos' },
  { id: 'aquisicao', label: 'aquisição' },
  { id: 'giro', label: 'capital de giro' },
  { id: 'capex', label: 'expansão / capex' },
  { id: 'infra', label: 'infraestrutura' },
  { id: 'imovel', label: 'imóveis' },
];

const INSTR = [
  { id: 'deb', nome: 'Debênture', usos: ['aquisicao', 'capex'], prazo: 5.5, custo: 2.4, idx: 'CDI + spread (às vezes IPCA +)',
    quem: 'bancos coordenam; fundos de crédito, tesourarias e family offices compram', garantia: 'alienação fiduciária de ações, cessão fiduciária de recebíveis, fiança da controladora', tempo: '4–8 semanas (rito automático)',
    lei: 'Lei 6.404 (arts. 52+) · RCVM 160', pro: 'O instrumento-padrão da dívida de aquisição: prazo longo, base ampla de investidores, negociada na B3.', contra: 'Só S.A.; exige agente fiduciário e covenants rígidos; waiver passa por assembleia de debenturistas.' },
  { id: 'nc', nome: 'Nota comercial', usos: ['aquisicao', 'giro'], prazo: 3, custo: 2.6, idx: 'CDI + spread',
    quem: 'bancos, fundos de crédito', garantia: 'as mesmas da debênture, em estruturas menores', tempo: '2–6 semanas',
    lei: 'Lei 14.195/2021 · RCVM 160', pro: 'Mais leve que a debênture e pode ser emitida por limitadas e cooperativas.', contra: 'Mercado menor; tende a prazos mais curtos.' },
  { id: 'ccb', nome: 'CCB bancária', usos: ['giro', 'aquisicao'], prazo: 2.5, custo: 2.8, idx: 'CDI + spread',
    quem: 'o banco, no próprio balanço', garantia: 'recebíveis, aval, aplicação financeira', tempo: '1–4 semanas',
    lei: 'Lei 10.931/2004', pro: 'Bilateral, rápida, flexível. Base do capital de giro e do empréstimo-ponte.', contra: 'Prazo curto; o banco concentra o risco e cobra por isso; costuma exigir reciprocidade (folha, cobrança).' },
  { id: 'ponte', nome: 'Empréstimo-ponte', usos: ['aquisicao'], prazo: 0.8, custo: 3.2, idx: 'CDI + spread crescente no tempo',
    quem: 'bancos que depois coordenam a emissão definitiva (takeout)', garantia: 'as ações da alvo', tempo: 'dias',
    lei: 'CCB', pro: 'Dá certeza de funding no signing, antes da debênture ficar pronta.', contra: 'Caro de propósito: o spread sobe a cada trimestre para forçar o refinanciamento.' },
  { id: 'fidc', nome: 'FIDC / antecipação', usos: ['giro'], prazo: 2, custo: 1.6, idx: 'CDI + spread (cotas sênior)',
    quem: 'investidores de cotas sênior; a empresa costuma reter a subordinada', garantia: 'os próprios recebíveis (cessão)', tempo: '2–4 meses para estruturar',
    lei: 'RCVM 175 (Anexo II)', pro: 'Financia a carteira de clientes com base no risco dos clientes, não da empresa. Barato quando os sacados são bons.', contra: 'Custo fixo de estrutura; exige carteira pulverizada e dados; conta como dívida para os covenants?' },
  { id: 'bndes', nome: 'BNDES (FINAME, FINEM)', usos: ['capex', 'infra'], prazo: 8, custo: 1.4, idx: 'TLP + spread (ou taxa fixa em linhas específicas)',
    quem: 'BNDES direto (projetos grandes) ou via banco repassador', garantia: 'o próprio bem financiado, fiança bancária', tempo: '2–6 meses',
    lei: 'normas do BNDES', pro: 'Prazo longo e custo competitivo para máquinas, veículos e projetos.', contra: 'Só para uso definido (não financia compra de empresa); burocracia; o banco repassador cobra spread.' },
  { id: 'incent', nome: 'Debênture incentivada / de infra', usos: ['infra'], prazo: 12, custo: 1.2, idx: 'IPCA + X%',
    quem: 'pessoas físicas (isentas de IR, Lei 12.431) ou investidores institucionais (Lei 14.801)', garantia: 'recebíveis do projeto, ações da SPE', tempo: '2–4 meses (inclui enquadramento do projeto)',
    lei: 'Lei 12.431/2011 · Lei 14.801/2024', pro: 'A isenção do investidor (12.431) ou o benefício fiscal do emissor (14.801, +30% de exclusão dos juros) barateiam a dívida longa.', contra: 'Só projetos de infraestrutura prioritários; indexada ao IPCA, o que exige receita também indexada.' },
  { id: 'cri', nome: 'CRI / sale-leaseback', usos: ['imovel', 'capex'], prazo: 10, custo: 1.8, idx: 'IPCA + X% ou CDI +',
    quem: 'securitizadora estrutura; fundos imobiliários e pessoas físicas compram', garantia: 'o imóvel e os aluguéis', tempo: '2–3 meses',
    lei: 'Lei 14.430/2022 (securitização)', pro: 'Monetiza os CDs da empresa: vende o imóvel e aluga de volta, liberando caixa para o equity.', contra: 'Troca dívida por aluguel de longo prazo, que vira passivo de arrendamento (IFRS 16).' },
  { id: '4131', nome: 'Lei 4.131 + swap', usos: ['aquisicao', 'giro'], prazo: 3, custo: 2.2, idx: 'SOFR + spread em USD, trocado por CDI',
    quem: 'bancos estrangeiros ou filiais', garantia: 'fiança da controladora, stand-by', tempo: '2–6 semanas',
    lei: 'Lei 4.131/1962 · marco cambial (Lei 14.286/2021)', pro: 'Acessa liquidez internacional; com swap, o custo final em CDI pode ficar abaixo do crédito local.', contra: 'Só para empresas grandes ou com matriz forte; custo do swap e risco de contraparte.' },
  { id: 'pc', nome: 'Crédito privado (direct lending)', usos: ['aquisicao', 'capex'], prazo: 4.5, custo: 4.3, idx: 'CDI + spread alto, às vezes com PIK ou warrant',
    quem: 'gestoras de crédito privado e fundos de crédito estruturado', garantia: 'as de sempre, às vezes subordinadas (mezanino)', tempo: '3–6 semanas',
    lei: 'debênture ou nota comercial privada', pro: 'Flexível: aceita alavancagem maior, carência, pagamento de juros capitalizados, estrutura sob medida.', contra: 'O mais caro dos instrumentos; covenants mais apertados e monitoramento próximo.' },
  { id: 'seller', nome: 'Seller financing / earn-out', usos: ['aquisicao'], prazo: 3, custo: 0.8, idx: 'CDI ou IPCA, às vezes sem juros',
    quem: 'o próprio vendedor', garantia: 'normalmente nenhuma (subordinado)', tempo: 'negociado no SPA',
    lei: 'SPA', pro: 'Barato e alinha o vendedor com o sucesso depois do closing.', contra: 'O vendedor só aceita se precisar vender ou acreditar muito no plano; pode virar briga.' },
  { id: 'bond', nome: 'Bond offshore (144A/Reg S)', usos: ['aquisicao', 'capex'], prazo: 7, custo: 2.0, idx: 'taxa fixa em USD',
    quem: 'investidores internacionais de renda fixa', garantia: 'normalmente sem garantia real', tempo: '2–4 meses (rating, prospecto)',
    lei: 'lei de Nova York', pro: 'Prazo longo, mercado profundo, poucos covenants de manutenção.', contra: 'Só a partir de centenas de milhões de dólares; risco cambial ou custo de hedge.' },
];

const USO_COL = { aquisicao: '#fbbf24', giro: '#38bdf8', capex: '#34d399', infra: '#a78bfa', imovel: '#f472b6' };

const DebtMap = ({ filtro, sel, setSel }) => {
  const W = 640, H = 300, pl = 42, pr = 16, pt = 16, pb = 34;
  const sx = (a) => pl + (Math.log(a / 0.5) / Math.log(16 / 0.5)) * (W - pl - pr);
  const sy = (c) => pt + (1 - (c - 0.5) / 4.5) * (H - pt - pb);
  const vis = INSTR.filter((d) => filtro === 'todos' || d.usos.includes(filtro));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
      {[0.5, 1, 2, 4, 8, 16].map((a) => (
        <g key={a}>
          <line x1={sx(a)} x2={sx(a)} y1={pt} y2={H - pb} stroke="#262626" />
          <text x={sx(a)} y={H - pb + 14} textAnchor="middle" fontSize="9.5" fill="#8a8a8a">{a < 1 ? '6 m' : `${a} a`}</text>
        </g>
      ))}
      {[1, 2, 3, 4, 5].map((c) => (
        <g key={c}>
          <line x1={pl} x2={W - pr} y1={sy(c)} y2={sy(c)} stroke="#262626" />
          <text x={pl - 6} y={sy(c) + 3} textAnchor="end" fontSize="9.5" fill="#8a8a8a">{'$'.repeat(c)}</text>
        </g>
      ))}
      {INSTR.map((d) => {
        const on = vis.includes(d);
        const active = sel === d.id;
        const col = USO_COL[d.usos[0]];
        return (
          <g key={d.id} onClick={() => setSel(d.id)} style={{ cursor: 'pointer', transition: 'opacity 0.3s' }} opacity={on ? 1 : 0.12}>
            <circle cx={sx(d.prazo)} cy={sy(d.custo)} r={active ? 9 : 6.5} fill={col} fillOpacity={active ? 0.95 : 0.7} stroke={active ? '#fff' : '#0a0a0a'} strokeWidth="1.2" />
            <text x={sx(d.prazo) + (d.prazo > 9 ? -11 : 11)} y={sy(d.custo) + 3.5} textAnchor={d.prazo > 9 ? 'end' : 'start'} fontSize="10" fill={active ? '#fafafa' : '#d4d4d4'} fontWeight={active ? 600 : 400}>{d.nome}</text>
          </g>
        );
      })}
    </svg>
  );
};

const DividaCard = () => {
  const [filtro, setFiltro] = useState('todos');
  const [sel, setSel] = useState('deb');
  const d = INSTR.find((x) => x.id === sel);
  return (
    <Card id="divida" icon={Banknote} title="O cardápio de dívida brasileiro" subtitle="Doze instrumentos, do empréstimo-ponte ao BNDES. Filtre pelo uso e clique para ver a ficha." accent="sky" index={secIndex('divida')}>
      <MinSchema>
        Quase toda dívida corporativa no Brasil é <b><Term>CDI</Term> + <Term>spread</Term></b>, flutuante. Aquisição se financia com <Term>debênture</Term> (ou ponte → debênture); giro, com <Term>CCB</Term> ou <Term>FIDC</Term>; capex, com <Term>BNDES</Term>; infraestrutura, com dívida incentivada em <Term>IPCA</Term> +.
      </MinSchema>
      <div className="flex flex-wrap items-center gap-2">
        <Seg value={filtro} onChange={setFiltro} options={USOS} />
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[10px] text-neutral-500 mb-1">
          <span>↑ custo relativo all-in (ilustrativo)</span>
          <span>prazo típico → (escala log)</span>
        </div>
        <DebtMap filtro={filtro} sel={sel} setSel={setSel} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-400 mt-1">
          {Object.entries(USO_COL).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{USOS.find((u) => u.id === k).label}</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="rounded-lg border border-sky-400/25 bg-sky-400/5 p-3 text-xs space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-sky-100">{d.nome}</span>
            <span className="font-mono text-[10px] text-sky-300">{d.idx}</span>
            <span className="text-[10px] text-neutral-500">{d.lei}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <div><Eyebrow>quem empresta</Eyebrow><div className="text-neutral-200 mt-0.5">{d.quem}</div></div>
            <div><Eyebrow>garantias típicas</Eyebrow><div className="text-neutral-200 mt-0.5">{d.garantia}</div></div>
            <div><Eyebrow>tempo para levantar</Eyebrow><div className="text-neutral-200 mt-0.5">{d.tempo}</div></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-[1px]" /><span className="text-neutral-200">{d.pro}</span></div>
            <div className="flex gap-1.5"><XCircle className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-[1px]" /><span className="text-neutral-200">{d.contra}</span></div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300">
        <Eyebrow color="text-sky-300">a estrutura de dívida da Tucano depois do closing</Eyebrow>
        <div className="mt-2 space-y-1.5">
          {[
            { n: 'Debênture de aquisição (holding)', v: SU.debenture, c: '#fbbf24', t: `CDI + ${DEAL.spread.toLocaleString('pt-BR')}%, 5 anos, amortização concentrada no fim, alienação fiduciária das ações` },
            { n: 'FIDC de recebíveis de hospitais', v: 60, c: '#38bdf8', t: 'CDI + ~1,5% na cota sênior; financia o prazo de 90 dias que os hospitais pagam' },
            { n: 'FINAME (frota de caminhões)', v: 25, c: '#34d399', t: 'via banco repassador, 7 anos, alienação fiduciária dos veículos' },
          ].map((x) => (
            <div key={x.n} className="grid grid-cols-[1fr_auto] gap-x-3 items-center">
              <div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm" style={{ background: x.c }} /><span className="text-neutral-100">{x.n}</span></div>
                <div className="text-[10px] text-neutral-500 pl-4">{x.t}</div>
              </div>
              <span className="font-mono text-neutral-200">{fmtM(x.v)}</span>
            </div>
          ))}
        </div>
      </div>

      <Predict question="A Tucano entra em recuperação judicial. Quais credores ficam fora do plano e podem executar suas garantias?">
        Os credores com <Term>alienação fiduciária</Term> ou <Term>cessão fiduciária</Term>: pela Lei 11.101 (art. 49, §3º), a propriedade fiduciária não se submete à recuperação judicial, ressalvada a retenção temporária de bens essenciais à atividade. É por isso que todo credor brasileiro pede garantia fiduciária e não hipoteca ou penhor: a garantia fiduciária é a que funciona na crise.
      </Predict>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-sky-300">o pacote de covenants típico</Eyebrow>
          <div>• <Term>dívida líquida</Term> / EBITDA ≤ 3,0–3,5x, medida trimestral ou anualmente</div>
          <div>• EBITDA / despesa financeira líquida ≥ 1,5–2,0x (em project finance e BNDES, <Term>ICSD</Term> ≥ 1,2–1,3x)</div>
          <div>• limites a dividendos, novas dívidas, venda de ativos</div>
          <div>• <Term>mudança de controle</Term>, <Term>cross-default</Term> e cross-acceleration</div>
          <div>• obrigações de informação: balanços, cálculo dos índices, certidões</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
          <Eyebrow color="text-sky-300">quem é quem numa debênture</Eyebrow>
          <div><b className="text-neutral-100">Coordenador líder:</b> o banco que estrutura, precifica e, com <Term>garantia firme</Term>, fica com o que não vender.</div>
          <div><b className="text-neutral-100">Agente fiduciário:</b> representa os debenturistas e fiscaliza covenants.</div>
          <div><b className="text-neutral-100">Escriturador e liquidante:</b> controlam titularidade e pagamentos na B3.</div>
          <div><b className="text-neutral-100">AGD:</b> onde se votam waivers, com quóruns da escritura.</div>
        </div>
      </div>
      <Misconception
        wrong="dá para financiar a compra da empresa com BNDES."
        right="o BNDES financia investimento produtivo (máquinas, projetos, inovação), não a compra de participação societária de um fundo. Dívida de aquisição é mercado de capitais e bancos."
        because="as linhas do BNDES têm destinação específica e fiscalização do uso dos recursos."
      />
      <WhenItMatters>
        Quem monta a estrutura de capital de um deal escolhe instrumento por uso, prazo, custo e garantias, e depois vive os covenants por anos. O associado calcula os índices todo trimestre e é o primeiro a ver uma quebra chegando.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Por que tudo é CDI +.</b> Depois de décadas de inflação alta, investidores e bancos brasileiros se financiam no overnight e querem ativos que acompanhem o CDI. Dívida prefixada longa é rara: quem empresta em taxa fixa corre risco de juros que o mercado local não quer carregar. A exceção é infraestrutura, com receita indexada ao IPCA e dívida idem. Para a empresa, isso significa que o custo da dívida sobe e desce com a Selic: um ciclo de alta de 5 pontos pode consumir todo o crescimento do EBITDA.
        </p>
        <p>
          <b>Dívida na holding × na operação.</b> A dívida de aquisição nasce na holding, mas quem gera caixa é a operação. Entre as duas há dividendos (sujeitos a limites legais e contratuais) e, para os credores, subordinação estrutural: os credores da operação recebem primeiro. Por isso os bancos pedem as ações da operacional em garantia e, muitas vezes, a incorporação da holding depois do closing (card de estrutura).
        </p>
        <p>
          <b>O mercado de 2024–26.</b> Emissões de debêntures bateram recordes, com spreads comprimidos, e cresceram as gestoras de crédito privado dispostas a financiar LBOs e add-ons. Para o PE, isso ampliou o cardápio: estruturas unitranche e mezanino, antes raras no Brasil, passaram a aparecer em deals de médio porte.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que a dívida de aquisição da Tucano amortiza quase tudo no fim?', a: 'Porque, com juros de ~16%, o caixa livre mal cobre os juros com folga. Nos primeiros anos, o caixa vai para o plano de criação de valor (capex, add-ons, institucionalização); o principal é pago com o crescimento, com refinanciamento ou na saída. Teste a amortização linear no próximo card: a cobertura cai abaixo de 1x.' },
        { q: 'Para que serve a garantia firme numa debênture de aquisição?', a: 'Para o vendedor ter certeza de que o dinheiro existe: o banco se compromete a ficar com o que não conseguir vender aos investidores. Custa um fee extra, mas é o que torna a proposta vinculante crível.' },
        { q: 'Um FIDC de recebíveis conta como dívida no covenant?', a: 'Depende da escritura. Se a empresa retém a cota subordinada e o risco, muitos credores exigem que conte. Essa definição, como a de dívida líquida no SPA, é negociada linha a linha.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 11 · ALAVANCAGEM */

const AlavancagemCard = () => {
  const [lev, setLev] = useState(DEAL.alavancagem);
  const [cdi, setCdi] = useState(13.65);
  const [spread, setSpread] = useState(DEAL.spread);
  const [conv, setConv] = useState(55);
  const [g, setG] = useState(8);
  const [amort, setAmort] = useState('bullet');
  const r = (cdi + spread) / 100;
  const D0 = DEAL.ebitda * lev;
  const years = [1, 2, 3, 4, 5].map((y) => {
    const ebitda = DEAL.ebitda * Math.pow(1 + g / 100, y);
    const fcf = ebitda * (conv / 100);
    return { y, ebitda, fcf };
  });
  let bal = D0;
  const rows = years.map((row) => {
    const juros = bal * r;
    let am = 0;
    if (amort === 'linear') am = D0 / 5;
    else if (amort === 'carencia') am = row.y >= 3 ? D0 / 3 : 0;
    else am = row.y === 5 ? 0 : 0;
    const icsd = row.fcf / (juros + am);
    bal = bal - am;
    return { ...row, juros, am, icsd, lev: bal / row.ebitda };
  });
  const minIcsd = Math.min(...rows.map((x) => x.icsd));
  const maxLevAt = (rate) => (conv / 100) / (1.3 * rate);
  const W = 640, H = 200, pl = 40, pr = 14, pt = 14, pb = 30;
  const sx = (v) => pl + ((v - 2) / 16) * (W - pl - pr);
  const sy = (v) => pt + (1 - v / 12) * (H - pt - pb);
  const curve = Array.from({ length: 65 }, (_, i) => 2 + i * 0.25).map((b, i) => `${i ? 'L' : 'M'}${sx(b).toFixed(1)},${sy(Math.min(12, maxLevAt((b + spread) / 100))).toFixed(1)}`).join(' ');
  const W2 = 640, H2 = 150;
  const bx = (i) => 60 + i * 115;
  const by = (v) => 14 + (1 - Math.min(v, 4) / 4) * (H2 - 40);
  return (
    <Card id="alavancagem" icon={Scale} title="Quanto de dívida cabe com CDI a 13,65%?" subtitle="A mesma empresa suporta metade da alavancagem de um LBO americano. O motivo cabe numa fração." accent="sky" index={secIndex('alavancagem')}>
      <MinSchema>
        Quem limita a dívida é a <b>cobertura</b>: o caixa livre tem de pagar juros (+ amortização) com folga. Com juro de ~16% a.a., cada 1x de EBITDA em dívida come ~16% do EBITDA só em juros. Por isso <b>LBO brasileiro vive em 2–3x</b>, não em 5–6x.
      </MinSchema>
      <Block>{String.raw`\text{alavancagem máx.} \approx \frac{\text{FCF}/\text{EBITDA}}{\text{ICSD}_{\min}\times(\num{\text{CDI}}+\text{spread})} = \frac{\num{0{,}55}}{1{,}3\times(\num{13{,}65\%}+2{,}75\%)} \approx \hi{2{,}6x}`}</Block>

      <div className="grid md:grid-cols-3 gap-x-5 gap-y-3">
        <Slider label="dívida / EBITDA na entrada" value={lev} min={0.5} max={6} step={0.25} onChange={setLev} fmt={(v) => fmtX(v, 2)} />
        <Slider label="CDI" value={cdi} min={2} max={16} step={0.25} onChange={setCdi} fmt={(v) => `${v.toLocaleString('pt-BR')}%`} hint="Selic 13,75% em set/2026 → CDI ≈ 13,65%" />
        <Slider label="spread" value={spread} min={0.5} max={6} step={0.25} onChange={setSpread} fmt={(v) => `+${v.toLocaleString('pt-BR')}%`} />
        <Slider label="conversão de caixa (FCF ÷ EBITDA)" value={conv} min={30} max={80} step={1} onChange={setConv} fmt={(v) => `${v}%`} hint="depois de capex, IR e capital de giro" />
        <Slider label="crescimento do EBITDA" value={g} min={-10} max={20} step={1} onChange={setG} fmt={(v) => `${v}% a.a.`} />
        <div>
          <div className="text-[11px] text-neutral-400 mb-1">amortização</div>
          <Seg size="xs" value={amort} onChange={setAmort} options={[{ id: 'bullet', label: 'só juros (bullet)' }, { id: 'carencia', label: '2 carência + 3' }, { id: 'linear', label: 'linear 5a' }]} />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[10px] text-neutral-500 mb-1">
          <span>cobertura do serviço da dívida por ano (FCF ÷ juros + amortização) · tracejado = folga mínima 1,3x</span>
          <span>abaixo da linha = waiver ou default</span>
        </div>
        <svg viewBox={`0 0 ${W2} ${H2}`} className="w-full h-auto pe-chart">
          <line x1={30} x2={W2 - 10} y1={by(1.3)} y2={by(1.3)} stroke="#fb7185" strokeDasharray="4 3" />
          <text x={W2 - 12} y={by(1.3) - 4} textAnchor="end" fontSize="9.5" fill="#fb7185">1,3x</text>
          {rows.map((x, i) => (
            <g key={x.y}>
              <rect x={bx(i) - 26} width={52} y={by(x.icsd)} height={Math.max(1, by(0) - by(x.icsd))} rx="3" fill={x.icsd >= 1.3 ? '#34d399' : '#fb7185'} opacity="0.8" style={{ transition: 'all 0.25s' }} />
              <text x={bx(i)} y={by(x.icsd) - 5} textAnchor="middle" fontSize="10" fill="#e5e5e5" fontFamily="ui-monospace, monospace">{x.icsd > 9.9 ? '>10' : x.icsd.toFixed(1)}x</text>
              <text x={bx(i)} y={H2 - 12} textAnchor="middle" fontSize="9.5" fill="#8a8a8a">ano {x.y} · DL/EBITDA {x.lev.toFixed(1)}x</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="dívida" value={fmtM(D0)} sub={`${fmtX(lev, 2)} EBITDA`} color="text-sky-300" />
        <Stat label="juros no ano 1" value={fmtM(rows[0].juros)} sub={`${fmtP(rows[0].juros / rows[0].ebitda, 0)} do EBITDA`} color="text-rose-300" />
        <Stat label="pior ICSD" value={fmtX(minIcsd, 2)} sub={minIcsd >= 1.3 ? 'cumpre' : 'quebra o covenant'} color={minIcsd >= 1.3 ? 'text-emerald-300' : 'text-rose-300'} />
        <Stat label="teto a 1,3x (só juros)" value={fmtX(maxLevAt(r), 1)} sub="alavancagem máxima" color="text-amber-300" />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="text-[10px] text-neutral-500 mb-1">alavancagem máxima suportada (ICSD 1,3x, só juros, conversão {conv}%) × taxa básica · spread +{spread.toLocaleString('pt-BR')}%</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
          {[0, 2, 4, 6, 8, 10, 12].map((v) => (
            <g key={v}>
              <line x1={pl} x2={W - pr} y1={sy(v)} y2={sy(v)} stroke="#262626" />
              <text x={pl - 6} y={sy(v) + 3} textAnchor="end" fontSize="9.5" fill="#8a8a8a">{v}x</text>
            </g>
          ))}
          {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((b) => (
            <text key={b} x={sx(b)} y={H - 10} textAnchor="middle" fontSize="9.5" fill="#8a8a8a">{b}%</text>
          ))}
          <path d={curve} fill="none" stroke="#38bdf8" strokeWidth="2" />
          {[{ b: 4.3, t: 'EUA · SOFR ~4,3%', dy: -10 }, { b: cdi, t: 'Brasil · CDI', dy: -10 }].map((p) => {
            const L = Math.min(12, maxLevAt((p.b + spread) / 100));
            return (
              <g key={p.t}>
                <circle cx={sx(p.b)} cy={sy(L)} r="5" fill="#fbbf24" stroke="#0a0a0a" />
                <text x={sx(p.b) + 8} y={sy(L) + p.dy} fontSize="10" fill="#fde68a">{p.t}: {L.toFixed(1)}x</text>
              </g>
            );
          })}
        </svg>
      </div>

      <Predict question="Com tudo o mais igual, qual é a alavancagem máxima da Tucano se o CDI cair de 13,65% para 9%? Arraste o slider de CDI e confira no 'teto'.">
        Sobe de ~2,6x para ~3,6x o EBITDA. Cada ponto de corte da Selic libera dívida e, portanto, capacidade de pagar mais pelo mesmo ativo. É por isso que o ciclo de juros move o valuation do PE brasileiro: juro alto não só encarece a dívida, derruba o múltiplo que o comprador consegue pagar.
      </Predict>
      <Misconception
        wrong="alavancagem é o motor do retorno em PE, como nos livros."
        right="no Brasil, com juros de dois dígitos, a alavancagem é coadjuvante. O retorno vem sobretudo de crescimento do EBITDA (orgânico e por add-ons) e de melhoria operacional."
        because="dívida a 16% só cria valor se o ativo render mais que 16% antes de impostos. Com juros de 7–8%, qualquer negócio mediano faz a conta fechar."
      />
      <WhenItMatters>
        Este é o cálculo que o banco faz antes de dar o term sheet e que o associado refaz todo trimestre para checar covenants. Numa rodada de alta de juros, é o que decide quais investidas precisam de waiver.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Juros dedutíveis.</b> Na empresa operacional (Lucro Real), juros reduzem a base de IRPJ/CSLL (34%): o custo efetivo de CDI + 2,75% cai para ~10,8% a.a. depois do benefício fiscal. Mas só se a dívida estiver onde está o lucro. Na holding, sem receita, os juros geram prejuízo fiscal que não abate nada. Daí a incorporação reversa (próximo card).
        </p>
        <p>
          <b>Hedge.</b> Uma dívida CDI + deixa a empresa exposta a alta de juros. Gestoras às vezes contratam swap CDI × pré para travar parte do custo, pagando o formato da curva de juros. Em ciclos como 2021–22 (Selic de 2% para 13,75%), quem não travou viu o custo da dívida triplicar.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Com EBITDA de R$ 100 M, conversão de 55% e CDI + 2,75%, por que a Tucano não aguenta 4x?', a: 'R$ 400 M a 16,4% = R$ 65,6 M de juros, contra ~R$ 55 M de caixa livre. O ICSD fica abaixo de 1,0x só com os juros: a empresa não paga a própria dívida sem crescer ou vender ativos.' },
        { q: 'Por que carência melhora o ICSD dos primeiros anos?', a: 'Porque o ICSD divide o caixa por juros + amortização. Sem amortizar nos anos 1–2, o denominador é só juros, e o EBITDA tem tempo de crescer antes das parcelas começarem.' },
        { q: 'O que acontece quando o ICSD fica abaixo do covenant?', a: 'Tecnicamente, evento de vencimento antecipado. Na prática, a empresa pede waiver em assembleia de debenturistas, paga um fee, às vezes aceita spread maior ou aporte de equity (equity cure) do fundo.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 12 · ESTRUTURA */

const ESTRUTS = [
  { id: 'direto', label: 'A · FIP compra direto',
    camadas: [{ n: FUNDO.nome, c: 'amber' }, { n: DEAL.alvo, c: 'teal' }],
    juros: false, agio: false,
    txt: 'Simples, mas sem dívida de aquisição (FIP não se alavanca) e sem aproveitamento fiscal do ágio: o fundo não é contribuinte e não se incorpora à empresa.' },
  { id: 'holding', label: 'B · holding com dívida',
    camadas: [{ n: FUNDO.nome, c: 'amber' }, { n: 'Holding S.A. + debênture', c: 'sky' }, { n: DEAL.alvo, c: 'teal' }],
    juros: false, agio: false,
    txt: 'A dívida fica na holding, que não tem receita tributável: os juros viram prejuízo fiscal inútil. O serviço da dívida depende de dividendos da Tucano, limitados por lei, contrato e covenants.' },
  { id: 'incorp', label: 'C · holding + incorporação',
    camadas: [{ n: FUNDO.nome, c: 'amber' }, { n: `${DEAL.alvo} (incorporou a holding)`, c: 'teal' }],
    juros: true, agio: true,
    txt: 'Depois do closing, a Tucano incorpora a holding (incorporação reversa). A dívida desce para onde está o lucro (juros dedutíveis a 34%) e o goodwill pago passa a ser amortizável fiscalmente em até 1/60 por mês.' },
];

const EstruturaCard = () => {
  const [est, setEst] = useState('incorp');
  const [pl, setPl] = useState(180);
  const [mv, setMv] = useState(90);
  const E = ESTRUTS.find((x) => x.id === est);
  const juros = SU.debenture * ((13.65 + DEAL.spread) / 100);
  const goodwill = Math.max(0, SU.precoAcoes - pl - mv);
  const escJuros = E.juros ? juros * 0.34 : 0;
  const escAgio = E.agio ? (goodwill / 5) * 0.34 : 0;
  const anual = escJuros + escAgio;
  const vp = [1, 2, 3, 4, 5].reduce((s, y) => s + anual / Math.pow(1.164, y), 0);
  const colMap = { amber: 'border-amber-400/40 bg-amber-400/10 text-amber-100', sky: 'border-sky-400/40 bg-sky-400/10 text-sky-100', teal: 'border-teal-400/40 bg-teal-400/10 text-teal-100' };
  return (
    <Card id="estrutura" icon={Boxes} title="Holding, ágio e impostos: onde a estrutura vira dinheiro" subtitle="A mesma compra, três desenhos societários, uma diferença de dezenas de milhões em imposto." accent="emerald" index={secIndex('estrutura')}>
      <MinSchema>
        O FIP compra por uma <b>holding</b> que toma a dívida; depois do closing, a holding e a empresa se juntam por <Term>incorporação reversa</Term>. Isso leva os juros para onde está o lucro (<Term>push-down</Term>) e destrava a amortização fiscal do <Term>goodwill</Term>: em até <b>1/60 por mês</b> (Lei 12.973/2014).
      </MinSchema>
      <Seg value={est} onChange={setEst} options={ESTRUTS.map((x) => ({ id: x.id, label: x.label }))} />
      <div className="grid md:grid-cols-[260px_1fr] gap-4 items-center">
        <div className="flex flex-col items-center gap-1">
          {E.camadas.map((c, i) => (
            <React.Fragment key={c.n}>
              {i > 0 && <ArrowDown className="w-4 h-4 text-neutral-500" />}
              <motion.div layout className={`w-full text-center rounded-lg border px-3 py-2 text-xs font-medium ${colMap[c.c]}`}>{c.n}</motion.div>
            </React.Fragment>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-neutral-300">{E.txt}</p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className={`rounded border px-2 py-0.5 ${E.juros ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-neutral-500 line-through'}`}>juros dedutíveis</span>
            <span className={`rounded border px-2 py-0.5 ${E.agio ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-neutral-500 line-through'}`}>amortização do ágio</span>
            <span className={`rounded border px-2 py-0.5 ${est !== 'direto' ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-neutral-500 line-through'}`}>dívida de aquisição</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <Eyebrow color="text-emerald-300">o laudo de alocação do preço (PPA) e o escudo fiscal</Eyebrow>
        <div className="grid sm:grid-cols-2 gap-4">
          <Slider label="patrimônio líquido contábil da Tucano" value={pl} min={50} max={400} step={5} onChange={setPl} fmt={(v) => fmtM(v)} />
          <Slider label="mais-valia de ativos (laudo PPA)" value={mv} min={0} max={250} step={5} onChange={setMv} fmt={(v) => fmtM(v)} hint="carteira de clientes, marca, imóveis a valor justo" />
        </div>
        <div className="flex h-8 rounded-md overflow-hidden border border-white/10 text-[10px] font-mono">
          {[{ v: pl, c: 'bg-neutral-500/60', t: 'PL contábil' }, { v: mv, c: 'bg-sky-400/60', t: 'mais-valia' }, { v: goodwill, c: 'bg-emerald-400/70', t: 'goodwill' }].map((x) => (
            <div key={x.t} className={`${x.c} flex items-center justify-center text-neutral-950`} style={{ width: `${(x.v / SU.precoAcoes) * 100}%`, transition: 'width 0.25s' }}>
              {x.v / SU.precoAcoes > 0.12 ? `${x.t} ${x.v.toFixed(0)}` : ''}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-neutral-500">preço das ações {fmtM(SU.precoAcoes)} = PL contábil + mais-valia + goodwill (ágio por rentabilidade futura)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="economia com juros" value={fmtM(escJuros, 1)} sub="por ano · 34% × juros" color="text-emerald-300" />
          <Stat label="economia com ágio" value={fmtM(escAgio, 1)} sub="por ano · 5 anos" color="text-emerald-300" />
          <Stat label="VP em 5 anos" value={fmtM(vp)} sub="descontado a 16,4%" color="text-amber-300" />
          <Stat label="em % do equity" value={fmtP(vp / SU.equityTotal, 0)} sub={`de ${fmtM(SU.equityTotal)}`} color="text-amber-300" />
        </div>
      </div>

      <Predict question="Na estrutura C, qual pesa mais no escudo fiscal: os juros da dívida ou a amortização do ágio?">
        Com os números padrão, o ágio: {fmtM(((SU.precoAcoes - 180 - 90) / 5) * 0.34, 1)}/ano contra {fmtM(juros * 0.34, 1)}/ano dos juros. Num país de juros altos, parece contraintuitivo; mas o goodwill de um buyout costuma ser a maior parte do preço, e 1/60 por mês o transforma em dedução de 20% ao ano. Por isso o laudo PPA é protocolado com tanto cuidado.
      </Predict>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs">
        <Eyebrow color="text-emerald-300">quem paga o quê quando o dinheiro sobe</Eyebrow>
        <div className="mt-2 grid grid-cols-[1.2fr_1fr] sm:grid-cols-[1.4fr_1fr_1.4fr] gap-x-3 gap-y-1.5 text-neutral-300">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">etapa</div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">imposto</div>
          <div className="hidden sm:block text-[10px] uppercase tracking-wider text-neutral-500">nota</div>
          {[
            ['Lucro da Tucano', 'IRPJ + CSLL até 34%', 'juros e ágio reduzem a base'],
            ['Dividendos Tucano → FIP', 'sem IR na regra geral', 'a retenção de 10% da Lei 15.270/2025 mira pessoa física e não residentes'],
            ['JCP Tucano → sócio', 'dedutível na Tucano; IRRF de 17,5%', 'alíquota elevada pela LC 224/2025, desde jan/2026'],
            ['Ganho na venda (dentro do FIP)', 'diferido', 'se a classe for entidade de investimento'],
            ['Amortização → PF residente', '15% sobre o ganho', 'retido pelo administrador'],
            ['Amortização → fundo de pensão', 'isento', 'EFPCs não pagam IR sobre aplicações'],
            ['Amortização → estrangeiro', '0%', 'fora de paraíso fiscal, regime de não residente, FIP entidade de investimento'],
          ].map((r, i) => (
            <React.Fragment key={i}>
              <div className="text-neutral-100">{r[0]}</div>
              <div className="font-mono text-emerald-200 text-[11px]">{r[1]}</div>
              <div className="hidden sm:block text-neutral-500">{r[2]}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Misconception
        wrong="todo ágio pago numa aquisição é dedutível."
        right="só o goodwill pago a partes independentes, com laudo protocolado na Receita (ou registrado em cartório de títulos e documentos) até o último dia útil do 13º mês após a aquisição, e depois da incorporação entre adquirente e adquirida."
        because="desde a Lei 12.973/2014, o ágio entre partes dependentes (o antigo ágio interno) não gera dedução, e holdings sem propósito real (empresa-veículo) são o alvo clássico de autuação."
      />
      <WhenItMatters>
        O time de deal decide a estrutura antes da proposta vinculante, com tributaristas. O escudo fiscal entra no modelo e pode justificar pagar mais. Se o laudo PPA perder o prazo de 13 meses, o benefício se perde: é o tipo de prazo que alguém do time precisa ter no calendário.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Por que incorporação reversa e não direta?</b> Na reversa, a operacional (que tem CNPJ, licenças, contratos, cadastro na Anvisa, histórico fiscal) sobrevive e a holding desaparece. Na direta, a holding absorveria a operação e seria preciso transferir licenças e contratos. Por isso quase sempre é a Tucano que incorpora a holding.
        </p>
        <p>
          <b>O que os credores acham.</b> Depois da incorporação, a dívida de aquisição passa a ser da empresa que gera caixa: acaba a subordinação estrutural, e os bancos gostam. A escritura costuma prever a incorporação como obrigação pós-closing, com prazo.
        </p>
        <p>
          <b>O que muda com a reforma do IR (Lei 15.270/2025).</b> A isenção de dividendos para pessoa física tem agora um limite: acima de R$ 50 mil por mês de uma mesma empresa, há retenção de 10%, e rendas acima de R$ 600 mil por ano entram no imposto mínimo. Para o FIP em si, não há regra específica; o impacto aparece no fundador que reinvestiu e nos executivos que recebem dividendos. Estruturas de incentivo desenhadas antes de 2026 merecem revisão.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que o FIP não compra a Tucano direto, se é mais simples?', a: 'Porque perderia a dívida de aquisição (FIP não se alavanca) e o aproveitamento fiscal do ágio (o fundo não é contribuinte nem pode ser incorporado). A holding é o veículo que torna os dois possíveis.' },
        { q: 'O que acontece se o laudo PPA for protocolado no 14º mês?', a: 'Perde-se o direito à dedução do goodwill. O prazo (último dia útil do 13º mês após a aquisição) é peremptório.' },
        { q: 'Um cotista estrangeiro paga 0% sobre o ganho do FIP. E se tivesse comprado ações da holding diretamente?', a: 'Pagaria IR sobre ganho de capital como não residente e, desde 2026, 10% sobre dividendos (Lei 15.270). O FIP entidade de investimento é, também, uma escolha tributária.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 13 · REGULAÇÃO */

const CARTEIRA = [
  { id: 'tuc', n: `${DEAL.alvo} (após o closing)`, pct: SU.pctFip, fat: DEAL.receita },
  { id: 'a', n: 'Cia. de logística', pct: 1.0, fat: 480 },
  { id: 'b', n: 'Rede de escolas', pct: 0.35, fat: 300 },
  { id: 'c', n: 'Empresa de software', pct: 0.15, fat: 250 },
  { id: 'd', n: 'Indústria de alimentos', pct: 0.6, fat: 220 },
];

const SETORES = [
  { s: 'Distribuição de produtos de saúde', r: 'Anvisa + vigilância sanitária local', o: 'Autorização de funcionamento (AFE) e licenças sanitárias ficam com o CNPJ; mudança societária e incorporações exigem atualização cadastral.', t: 'semanas' },
  { s: 'Planos de saúde', r: 'ANS', o: 'Aprovação prévia da transferência de controle de operadoras.', t: 'meses' },
  { s: 'Energia (concessões)', r: 'ANEEL', o: 'Anuência prévia para transferência de controle de concessionárias.', t: '1–3 meses' },
  { s: 'Telecom', r: 'Anatel', o: 'Anuência prévia para transferência de controle de prestadoras.', t: '1–3 meses' },
  { s: 'Instituições financeiras', r: 'Banco Central', o: 'Autorização prévia para aquisição de controle ou participação qualificada.', t: '6–12 meses' },
  { s: 'Terras rurais', r: 'Lei 5.709/1971 · INCRA', o: 'Empresas brasileiras controladas por estrangeiros têm limites para comprar terra rural.', t: 'estrutural' },
  { s: 'Mídia', r: 'Constituição, art. 222', o: 'Capital estrangeiro limitado a 30% em jornalismo e radiodifusão.', t: 'estrutural' },
];

const RegulacaoCard = () => {
  const [inc, setInc] = useState(() => Object.fromEntries(CARTEIRA.map((c) => [c.id, true])));
  const [alvo, setAlvo] = useState(90);
  const grupo = CARTEIRA.filter((c) => inc[c.id] && c.pct >= 0.2).reduce((s, c) => s + c.fat, 0);
  const notifica = (grupo >= 750 && alvo >= 75) || (alvo >= 750 && grupo >= 75);
  return (
    <Card id="regulacao" icon={Gavel} title="CADE, reguladores setoriais e capital estrangeiro" subtitle="As aprovações de fora do contrato: quando são exigidas, quanto demoram e o que acontece se você se adiantar." accent="violet" index={secIndex('regulacao')}>
      <MinSchema>
        Se um grupo faturou ≥ <b>R$ 750 M</b> no Brasil e o outro ≥ <b>R$ 75 M</b>, a operação precisa de aprovação prévia do <Term>CADE</Term>. Para um fundo, o "grupo" inclui as empresas da carteira em que ele tem <b>≥ 20%</b>. Consumar antes da aprovação é <Term>gun jumping</Term>.
      </MinSchema>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <Eyebrow color="text-violet-300">teste: o add-on da Tucano precisa de CADE?</Eyebrow>
        <div className="text-xs text-neutral-400">Um ano depois do closing, a Tucano quer comprar uma distribuidora regional. O grupo do comprador é o grupo do {FUNDO.nome}:</div>
        <div className="space-y-1">
          {CARTEIRA.map((c) => {
            const conta = c.pct >= 0.2;
            return (
              <label key={c.id} className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer ${inc[c.id] && conta ? 'border-violet-400/30 bg-violet-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
                <input type="checkbox" checked={inc[c.id]} onChange={(e) => setInc((s) => ({ ...s, [c.id]: e.target.checked }))} className="accent-violet-400" />
                <span className="flex-1 text-neutral-200">{c.n}</span>
                <span className="font-mono text-neutral-400 w-12 text-right">{fmtP(c.pct, 0)}</span>
                <span className={`font-mono w-20 text-right ${conta ? 'text-neutral-200' : 'text-neutral-500 line-through'}`}>{fmtM(c.fat)}</span>
              </label>
            );
          })}
        </div>
        <div className="text-[10px] text-neutral-500">Participações abaixo de 20% não entram. Se um cotista tivesse ≥ 50% das cotas, o grupo dele também entraria.</div>
        <Slider label="faturamento no Brasil da empresa-alvo do add-on" value={alvo} min={10} max={300} step={5} onChange={setAlvo} fmt={(v) => fmtM(v)} />
        <div className="grid sm:grid-cols-3 gap-2">
          <Stat label="grupo do comprador" value={fmtMB(grupo)} sub={grupo >= 750 ? '≥ R$ 750 M' : 'abaixo de R$ 750 M'} color={grupo >= 750 ? 'text-violet-300' : 'text-neutral-300'} />
          <Stat label="alvo" value={fmtM(alvo)} sub={alvo >= 75 ? '≥ R$ 75 M' : 'abaixo de R$ 75 M'} color={alvo >= 75 ? 'text-violet-300' : 'text-neutral-300'} />
          <div className={`rounded-lg border p-3 ${notifica ? 'border-rose-400/40 bg-rose-400/10' : 'border-emerald-400/30 bg-emerald-400/5'}`}>
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">veredito</div>
            <div className={`text-sm font-semibold mt-1 ${notifica ? 'text-rose-200' : 'text-emerald-200'}`}>{notifica ? 'notificação obrigatória' : 'não precisa notificar'}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{notifica ? 'não feche antes da aprovação' : 'o CADE ainda pode chamar em até 1 ano'}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="taxa processual" value="R$ 85 mil" sub="por notificação" />
        <Stat label="rito sumário" value="≈ 15 dias" sub="média em 2025 · ~94% dos casos" color="text-emerald-300" />
        <Stat label="prazo legal máx." value="240 + 90" sub="dias" />
        <Stat label="multa gun jumping" value="até R$ 60 M" sub="mín. R$ 60 mil + nulidade" color="text-rose-300" />
      </div>

      <Predict question="O fundo tem só 15% de uma empresa de software de R$ 250 M. Esse faturamento entra no grupo? E se a participação subir para 20%?">
        Com 15%, não entra: a Resolução CADE 33/2022 conta as empresas em que o fundo tem 20% ou mais (além das controladas e do grupo de cotistas com ≥ 50% das cotas). Com 20%, entra. Um follow-on pequeno pode mudar o grupo econômico do fundo e tornar notificáveis operações que antes não eram.
      </Predict>

      <div>
        <Eyebrow color="text-violet-300">reguladores setoriais: a segunda fila de aprovações</Eyebrow>
        <div className="mt-2 divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
          {SETORES.map((x) => (
            <div key={x.s} className="grid sm:grid-cols-[170px_120px_1fr_80px] gap-x-3 gap-y-0.5 px-3 py-2">
              <div className="text-neutral-100">{x.s}</div>
              <div className="text-violet-200">{x.r}</div>
              <div className="text-neutral-400">{x.o}</div>
              <div className="font-mono text-neutral-500 sm:text-right">{x.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
        <Eyebrow color="text-violet-300">capital estrangeiro: dois caminhos, dois tratamentos</Eyebrow>
        <div><b className="text-neutral-100">Via FIP (portfólio):</b> o cotista estrangeiro entra pelo regime de investidor não residente (Resolução Conjunta BCB/CVM nº 13/2024, em vigor desde jan/2025), com representante e custodiante no Brasil. Ganhos do FIP entidade de investimento: 0% de IR, se fora de paraíso fiscal.</div>
        <div><b className="text-neutral-100">Direto na empresa (<Term>IED</Term>):</b> o investimento é declarado ao Banco Central no SCE-IED (eventos a partir de US$ 100 mil em até 30 dias, mais declarações periódicas conforme o porte). Dividendos pagam 10% na fonte desde 2026; ganho de capital, IR de não residente.</div>
      </div>

      <Misconception
        wrong="até o CADE aprovar, dá para ir integrando: é só não pagar o preço."
        right="gun jumping é qualquer ato de consumação: dar ordens à gestão da alvo, integrar compras ou vendas, trocar informação comercial sensível, nomear diretores, além de pagar o preço."
        because="o CADE pune a consumação prematura em si, mesmo que a operação depois seja aprovada sem restrições."
      />
      <WhenItMatters>
        Todo add-on do plano de buy-and-build passa por este teste, e o cronograma do SPA depende da resposta. O associado checa o grupo econômico do fundo a cada novo investimento: a carteira muda e os limiares também.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>Os limiares são brutos e antigos.</b> Os valores de R$ 750 M e R$ 75 M são de 2012 e nunca foram corrigidos. Com a inflação acumulada, cada vez mais operações médias de PE ficam acima deles. O CADE também pode exigir a notificação de operações abaixo dos limiares em até um ano da consumação, o que acontece raramente.
        </p>
        <p>
          <b>Fundos com vários FIPs.</b> A regra conta o grupo do fundo que está comprando: suas investidas relevantes e os cotistas com metade ou mais das cotas. Na prática, o CADE tem excluído o faturamento da própria gestora. Quando dois fundos da mesma casa coinvestem, os advogados olham caso a caso.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que a compra da própria Tucano precisou de CADE?', a: 'A Tucano fatura R$ 1,2 bi (acima de R$ 750 M) e o grupo do fundo, com a carteira, passa de R$ 75 M. Os dois critérios bateram. O rito sumário resolveu em semanas, sem restrições.' },
        { q: 'Um add-on de R$ 60 M de faturamento precisa de notificação?', a: 'Não pelos limiares: a alvo está abaixo de R$ 75 M. O CADE poderia pedir a notificação em até um ano se enxergasse risco concorrencial, o que é raro num mercado pulverizado.' },
        { q: 'O que o associado pode fazer com dados da alvo antes da aprovação?', a: 'Usar em clean team (pessoas específicas, sob acordo, sem uso comercial) para planejar a integração. Preços, margens por cliente e estratégia comercial ficam fora do alcance do time de vendas do comprador até a aprovação.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 14 · ROTINA */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const CAMADAS = [
  { id: 'inv', label: 'Investida', cor: '#2dd4bf' },
  { id: 'fundo', label: 'Fundo', cor: '#fbbf24' },
  { id: 'gest', label: 'Gestora', cor: '#a78bfa' },
];
// eventos: [camada, meses(1-12), texto]
const EVENTOS = [
  ['inv', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'Pacote mensal de gestão (DRE, caixa, KPIs) até ~D+10–15'],
  ['inv', [2, 5, 8, 11], 'Reunião trimestral do conselho de administração'],
  ['inv', [1, 2, 3], 'Auditoria das demonstrações anuais (Big Four)'],
  ['inv', [4], 'Assembleia geral ordinária: até 4 meses após o fim do exercício (Lei 6.404)'],
  ['inv', [2, 5, 8, 11], 'Cálculo e envio dos covenants ao agente fiduciário'],
  ['inv', [10, 11, 12], 'Orçamento do ano seguinte, aprovado no conselho de dezembro'],
  ['fundo', [1, 5, 9], 'Informe periódico quadrimestral à CVM (até 15 dias após o quadrimestre)'],
  ['fundo', [2, 3], 'Valor justo da carteira para as demonstrações anuais do fundo'],
  ['fundo', [5], 'Demonstrações auditadas do fundo (até 150 dias) · taxa de fiscalização CVM'],
  ['fundo', [2, 5, 8, 11], 'Relatório trimestral aos cotistas (padrão ILPA): NAV, TVPI, DPI, investidas'],
  ['fundo', [6], 'Assembleia anual de cotistas'],
  ['gest', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'Toda semana: reunião de pipeline e, quando há deal, comitê de investimentos'],
  ['gest', [3, 6, 9, 12], 'Comitê de valuation: marcação trimestral da carteira'],
  ['gest', [4, 10], 'Comitê de cotistas (LPAC): conflitos, valuation, prorrogações'],
  ['gest', [9, 10], 'Reunião anual com cotistas (AGM) e início da captação do próximo fundo'],
];

const PLANO100 = [
  { g: 'governança', i: ['Novo conselho empossado, com um independente', 'Política de alçadas: o que o diretor aprova sozinho e o que sobe ao conselho', 'Comitê de auditoria e de pessoas'] },
  { g: 'finanças', i: ['Fechamento mensal em D+10', 'Projeção de caixa semanal (13 semanas)', 'Orçamento revisado com o plano de criação de valor', 'Rotina de cálculo de covenants'] },
  { g: 'pessoas', i: ['MIP assinado com o time-chave', 'Avaliação do time: quem fica, quem sai, quem falta (CFO?)'] },
  { g: 'compliance', i: ['Código de conduta e canal de denúncias', 'Programa anticorrupção e LGPD', 'Regularização dos achados da DD (licenças, contratos)'] },
  { g: 'valor', i: ['Quick wins de compras e preço', 'Projeto de capital de giro', 'Lista de alvos para add-ons'] },
];

const RotinaCard = () => {
  const [mes, setMes] = useState(4);
  const [feito, setFeito] = useState({});
  const [dso, setDso] = useState(90);
  const [dio, setDio] = useState(60);
  const total = PLANO100.reduce((s, x) => s + x.i.length, 0);
  const n = Object.values(feito).filter(Boolean).length;
  const ev = EVENTOS.filter((e) => e[1].includes(mes));
  const custoVendas = DEAL.receita * 0.8;
  const libera = (DEAL.receita * (90 - dso)) / 365 + (custoVendas * (60 - dio)) / 365;
  return (
    <Card id="rotina" icon={CalendarDays} title="Depois do closing: o ritmo do dia a dia" subtitle="Três relógios rodando ao mesmo tempo: o da investida, o do fundo e o da gestora." accent="rose" index={secIndex('rotina')}>
      <MinSchema>
        Comprar é um evento; ser dono é uma rotina. <b>Mensal</b>: pacote de gestão da investida. <b>Trimestral</b>: conselho, covenants, valuation, relatório aos cotistas. <b>Anual</b>: auditoria, assembleias, orçamento. E um <Term>100-day plan</Term> para começar.
      </MinSchema>
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(12, minmax(0, 1fr))' }}>
          <div />
          {MESES.map((m, i) => (
            <button key={m} onClick={() => setMes(i + 1)} className={`text-[10px] rounded py-0.5 ${mes === i + 1 ? 'bg-rose-400/20 text-rose-100' : 'text-neutral-500 hover:text-neutral-200'}`}>{m}</button>
          ))}
          {CAMADAS.map((c) => (
            <React.Fragment key={c.id}>
              <div className="text-[11px] self-center" style={{ color: c.cor }}>{c.label}</div>
              {MESES.map((m, i) => {
                const k = EVENTOS.filter((e) => e[0] === c.id && e[1].includes(i + 1)).length;
                return (
                  <button key={m} onClick={() => setMes(i + 1)} aria-label={`${c.label} ${m}`}
                    className={`h-7 rounded-sm border ${mes === i + 1 ? 'border-white/40' : 'border-transparent'}`}
                    style={{ background: c.cor, opacity: 0.12 + 0.2 * k }} />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <Eyebrow color="text-rose-300">{MESES[mes - 1]} · o que está na agenda</Eyebrow>
          {ev.map((e, i) => {
            const c = CAMADAS.find((x) => x.id === e[0]);
            return (
              <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                <span className="w-2 h-2 mt-1 rounded-sm shrink-0" style={{ background: c.cor }} />
                <span><span className="text-neutral-500">{c.label}:</span> {e[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <Eyebrow color="text-rose-300">plano de 100 dias da Tucano</Eyebrow>
          <span className="text-[11px] font-mono text-neutral-300">{n}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-rose-400" initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLANO100.map((b) => (
            <div key={b.g}>
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{b.g}</div>
              {b.i.map((it) => (
                <label key={it} className="flex items-start gap-2 text-xs text-neutral-200 py-0.5 cursor-pointer">
                  <input type="checkbox" checked={!!feito[it]} onChange={(e) => setFeito((s) => ({ ...s, [it]: e.target.checked }))} className="mt-0.5 accent-rose-400" />
                  <span className={feito[it] ? 'line-through text-neutral-500' : ''}>{it}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Worked title="a alavanca mais rápida: capital de giro">
        <div className="grid sm:grid-cols-2 gap-4">
          <Slider label="prazo médio de recebimento (DSO)" value={dso} min={60} max={110} step={1} onChange={setDso} fmt={(v) => `${v} dias`} hint="hoje: 90 dias (hospitais pagam devagar)" />
          <Slider label="dias de estoque (DIO)" value={dio} min={35} max={80} step={1} onChange={setDio} fmt={(v) => `${v} dias`} hint="hoje: 60 dias" />
        </div>
        <div>
          Receita {fmtBi(DEAL.receita)} → cada dia de recebimento vale {fmtM(DEAL.receita / 365, 1)}. Cortar o DSO de 90 para {dso} dias e o estoque de 60 para {dio} dias {libera >= 0 ? 'libera' : 'consome'}{' '}
          <b className={libera >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{fmtM(Math.abs(libera))}</b> de caixa, <Grounding>{fmtP(Math.abs(libera) / SU.debenture, 0)} da debênture de aquisição</Grounding>, sem vender um real a mais.
        </div>
      </Worked>

      <Misconception
        wrong="o fundo passa a tocar a empresa."
        right="o fundo governa: conselho, orçamento, alçadas, escolha do CEO e do CFO, incentivos. Quem opera é o management, e o bom PE interfere pouco no dia a dia e muito nas grandes decisões."
        because="o time da gestora acompanha 5 a 10 empresas; microgestão não escala, e a regra de influência efetiva do FIP é sobre governança, não operação."
      />
      <WhenItMatters>
        Metade da semana do associado depois do closing é portfólio: ler o pacote mensal, atualizar o modelo, preparar o material do conselho, recalcular covenants, responder a cotistas. Montar esse calendário no primeiro mês evita correrias.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>O plano de incentivos (MIP).</b> O padrão é reservar 5–10% do equity para o time-chave, com vesting ao longo de 4–5 anos ou no evento de liquidez, cláusulas de good/bad leaver e, às vezes, ratchets: a fatia do management sobe se o fundo passar de certas faixas de retorno (ex.: 2,5x ou 3x). O desenho tributário (opções, ações restritas, phantom, matching) decide se o ganho é salário (IR até 27,5% + encargos) ou ganho de capital (15–22,5%), e é tema quente com a Receita.
        </p>
        <p>
          <b>Por que o reporting mensal importa tanto.</b> Covenants são trimestrais, o valuation também, mas problemas de caixa aparecem mês a mês. Um pacote de gestão confiável em D+10 é a primeira entrega de um CFO de mercado e o melhor indicador antecedente de que a tese está funcionando.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Até quando a Tucano precisa fazer a assembleia geral ordinária?', a: 'Nos 4 primeiros meses após o fim do exercício (art. 132 da Lei 6.404): até 30 de abril para quem fecha em dezembro. Lá se aprovam as contas e a destinação do lucro.' },
        { q: 'Por que o capital de giro é "a alavanca mais rápida"?', a: 'Porque libera caixa em meses, sem investimento nem crescimento: cobrar mais rápido, reduzir estoque e negociar prazo com fornecedores. Numa distribuidora, cada dia de recebimento vale milhões.' },
        { q: 'Com que frequência a carteira é marcada a valor justo?', a: 'Na prática, trimestralmente, para o relatório aos cotistas, com a marcação anual auditada nas demonstrações do fundo. Uma mudança relevante no meio do caminho exige comunicação à CVM e aos cotistas.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 15 · SAÍDAS */

const IPOS = [
  { a: 2017, n: 10 }, { a: 2018, n: 3 }, { a: 2019, n: 5 }, { a: 2020, n: 28 }, { a: 2021, n: 46 },
  { a: 2022, n: 0 }, { a: 2023, n: 0 }, { a: 2024, n: 0 }, { a: 2025, n: 0 }, { a: 2026, n: 1 },
];

const EXITS = [
  { id: 'estrat', nome: 'Venda estratégica', tempo: '6–9 meses', val: 'mais alto (sinergias)', pro: 'Vende 100% de uma vez, à vista; o comprador paga parte das sinergias.', contra: 'Poucos compradores por setor; CADE mais delicado; o comprador pede escrow e indenizações.', br: 'A principal rota de saída no Brasil quando a bolsa fecha.' },
  { id: 'sec', nome: 'Secundária (para outro fundo)', tempo: '4–8 meses', val: 'médio', pro: 'Processo conhecido, comprador sofisticado, pouca indenização (fundo vende para fundo).', contra: 'Múltiplo limitado pelo retorno que o próximo fundo precisa; "pass the parcel" irrita cotistas comuns aos dois fundos.', br: 'Comum para ativos de crescimento que ainda têm uma segunda tese.' },
  { id: 'ipo', nome: 'IPO na B3', tempo: '9–18 meses', val: 'depende da janela', pro: 'Pode pagar o maior múltiplo e mantém upside no que o fundo não vende.', contra: 'O fundo sai aos poucos (lock-up, follow-ons); depende de janela; custo e exposição altos.', br: 'Janela fechada do fim de 2021 até maio/2026 (IPO da Compass).' },
  { id: 'recap', nome: 'Dividend recap', tempo: '2–3 meses', val: 'saída parcial', pro: 'Devolve caixa ao cotista (DPI) sem vender: nova dívida na empresa paga dividendos ao fundo.', contra: 'Reaumenta a alavancagem; com CDI alto, cabe pouco.', br: 'Viável quando o EBITDA cresceu e a dívida caiu: a empresa "cabe" outra vez 2,5x.' },
  { id: 'cont', nome: 'Continuation fund', tempo: '6–9 meses', val: 'preço de referência de terceiros', pro: 'A gestora fica com o ativo vencedor por mais tempo; quem quer sair, sai.', contra: 'Conflito de interesse: a gestora é compradora e vendedora. Exige fairness opinion e aprovação do comitê de cotistas.', br: 'Ainda incipiente no Brasil; o mercado local de secundários cresce.' },
  { id: 'recompra', nome: 'Recompra pelo fundador', tempo: 'variável', val: 'baixo', pro: 'Solução quando não há mercado; às vezes previsto em put/call.', contra: 'O fundador raramente tem o dinheiro; costuma ser saída de ativo fraco.', br: 'Plano B frequente em minoritárias de growth.' },
];

const SaidasCard = () => {
  const [sel, setSel] = useState('estrat');
  const X = EXITS.find((e) => e.id === sel);
  const W = 640, H = 170, pl = 30, pr = 10, pt = 16, pb = 24;
  const bw = (W - pl - pr) / IPOS.length;
  const sy = (v) => pt + (1 - v / 50) * (H - pt - pb);
  return (
    <Card id="saidas" icon={DoorOpen} title="Saídas: como o fundo transforma papel em DPI" subtitle="Seis rotas, uma pergunta: quem paga mais, mais rápido e com menos amarras?" accent="teal" index={secIndex('saidas')}>
      <MinSchema>
        O retorno de PE só existe na saída. No Brasil, com a bolsa fechada para IPOs de 2022 a 2025, a saída virou <b>venda estratégica ou secundária</b>. O <Term>drag-along</Term> e o prazo do fundo definem o poder de negociação.
      </MinSchema>
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[10px] text-neutral-500 mb-1">
          <span>IPOs na B3 por ano (≈)</span>
          <span>a janela que fechou e reabriu</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pe-chart">
          {[0, 25, 50].map((v) => (
            <g key={v}>
              <line x1={pl} x2={W - pr} y1={sy(v)} y2={sy(v)} stroke="#262626" />
              <text x={pl - 6} y={sy(v) + 3} textAnchor="end" fontSize="9.5" fill="#8a8a8a">{v}</text>
            </g>
          ))}
          {IPOS.map((d, i) => {
            const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
            return (
              <g key={d.a}>
                <rect x={x} y={sy(Math.max(d.n, 0.4))} width={w} height={Math.max(1.5, sy(0) - sy(Math.max(d.n, 0.4)))} rx="2" fill={d.a >= 2022 && d.a <= 2025 ? '#525252' : d.a === 2026 ? '#34d399' : '#2dd4bf'} opacity="0.85" />
                <text x={x + w / 2} y={sy(d.n) - 4} textAnchor="middle" fontSize="10" fill="#e5e5e5" fontFamily="ui-monospace, monospace">{d.n}</text>
                <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#8a8a8a">{d.a}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EXITS.map((e) => (
          <button key={e.id} onClick={() => setSel(e.id)}
            className={`rounded-md border px-2.5 py-1 text-[11px] ${sel === e.id ? 'border-teal-400/50 bg-teal-400/10 text-teal-100' : 'border-white/10 text-neutral-400 hover:text-neutral-200'}`}>{e.nome}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={X.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="rounded-lg border border-teal-400/25 bg-teal-400/5 p-3 text-xs space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-sm font-semibold text-teal-100">{X.nome}</span>
            <span className="text-neutral-400">tempo: <span className="font-mono text-neutral-200">{X.tempo}</span></span>
            <span className="text-neutral-400">valuation: <span className="text-neutral-200">{X.val}</span></span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-[1px]" /><span className="text-neutral-200">{X.pro}</span></div>
            <div className="flex gap-1.5"><XCircle className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-[1px]" /><span className="text-neutral-200">{X.contra}</span></div>
          </div>
          <div className="text-neutral-400"><span className="text-[10px] uppercase tracking-wider text-teal-300 mr-1.5">no Brasil</span>{X.br}</div>
        </motion.div>
      </AnimatePresence>

      <Predict question="O fundo está no ano 9 de 10, com a Tucano ainda na carteira. Quem tem mais poder na negociação da venda: o fundo ou o comprador?">
        O comprador. Todo mundo sabe que o fundo precisa vender antes do fim do prazo (ou pedir prorrogação aos cotistas). É por isso que gestoras começam a preparar a saída 18–24 meses antes (vendor due diligence, auditoria limpa, equipe completa) e por isso existem as prorrogações e os continuation funds: para não vender com pressa.
      </Predict>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-neutral-300 space-y-1.5">
        <Eyebrow color="text-teal-300">preparando a saída (vendor side)</Eyebrow>
        <div>• <b className="text-neutral-100">Vendor due diligence:</b> a gestora contrata a própria DD financeira e fiscal e entrega aos compradores. Acelera o leilão e reduz retrabalho.</div>
        <div>• <b className="text-neutral-100">Equity story:</b> o que foi feito, o que falta fazer (a tese do próximo dono).</div>
        <div>• <b className="text-neutral-100">Limpeza:</b> contingências resolvidas, contratos formalizados, imóveis regularizados; tudo o que virou escrow na compra, agora do outro lado.</div>
      </div>
      <Misconception
        wrong="com a bolsa fechada, fundos não conseguiram sair."
        right="saíram, mas por venda estratégica, secundárias e recaps, com múltiplos menores e prazos maiores. O que caiu foi o DPI: as saídas ficaram mais lentas que o previsto nas safras de 2015–2019."
        because="o IPO é a rota mais visível, não a mais frequente. Nos EUA, mais da metade das saídas de PE são vendas a estratégicos ou a outros fundos."
      />
      <WhenItMatters>
        A saída começa no IC memo de entrada: "quem compra de nós e por quê?". Toda decisão depois do closing (add-ons, governança, auditoria, sistemas) é também uma preparação para esse comprador.
      </WhenItMatters>
      <Deeper>
        <p>
          <b>IPO e o fundo.</b> Num IPO, o fundo raramente vende tudo: vende uma parte na oferta, fica com lock-up (tipicamente 180 dias) e depois sai em follow-ons ou blocos. Enquanto isso, a posição é marcada a mercado, e o DPI vem em parcelas. No Novo Mercado, o tag-along de 100% e as regras de governança passam a valer para todos.
        </p>
        <p>
          <b>Escrow do outro lado.</b> Quando o fundo vende, é a vez dele ser pressionado a deixar escrow por 3–5 anos, o que não combina com um fundo que precisa distribuir e se liquidar. Daí o interesse crescente por seguro de W&amp;I na saída: troca o escrow por um prêmio e permite distribuir tudo aos cotistas.
        </p>
      </Deeper>
      <QA items={[
        { q: 'Por que a secundária entre dois fundos da mesma gestora é delicada?', a: 'Porque a gestora está dos dois lados: define o preço de venda de um fundo e o de compra do outro. Exige aprovação do comitê de cotistas, avaliação independente e, idealmente, um investidor terceiro que valide o preço.' },
        { q: 'O que é vendor due diligence?', a: 'A DD contratada pelo vendedor e entregue aos compradores, geralmente com possibilidade de o comprador contar com o relatório (reliance). Acelera o processo e dá ao vendedor controle sobre a narrativa dos números.' },
        { q: 'Um dividend recap aumenta o DPI. Por que cotistas às vezes não gostam?', a: 'Porque devolve caixa cedo aumentando o risco da empresa (mais dívida), e pode ser usado para melhorar a TIR aparente de um fundo em captação. Bom quando a empresa tem folga real de caixa; ruim como maquiagem.' },
      ]} />
    </Card>
  );
};
/* ---------------------------------------------------------------- 16 · DEAL ★ */

const simDeal = ({ g, addE, mult, anos, cdi, agio, conv }) => {
  const r = (cdi + DEAL.spread) / 100;
  const ND0 = SU.debenture - DEAL.caixa + DEAL.debtLikeTotal; // 255: dívida + debt-like − caixa
  const addCost = addE * 6; // add-ons comprados a 6x no ano 2, com dívida
  let debt = SU.debenture, cash = -DEAL.caixa + DEAL.debtLikeTotal; // cash<0 = passivos debt-like líquidos
  let ebOrg = DEAL.ebitda;
  const escAgio = agio ? ((SU.precoAcoes - 180 - 90) / 5) * 0.34 : 0;
  for (let t = 1; t <= anos; t++) {
    ebOrg *= 1 + g / 100;
    if (t === 2) debt += addCost;
    const eb = ebOrg + (t >= 2 ? addE : 0) * (t === 2 ? 0.5 : 1);
    const juros = debt * r;
    const fcf = eb * (conv / 100) - juros * (1 - 0.34) + (t <= 5 ? escAgio : 0);
    cash -= fcf;
  }
  const ebExit = ebOrg + addE;
  const NDexit = debt + cash;
  const evExit = mult * ebExit;
  const custosSaida = 0.02 * evExit;
  const eqExit = evExit - NDexit - custosSaida;
  const E0 = SU.equityTotal;
  const mip = 0.06 * Math.max(0, eqExit - E0);
  const fip = (eqExit - mip) * SU.pctFip;
  const moic = fip / SU.equityFip;
  const tir = Math.pow(Math.max(moic, 0.0001), 1 / anos) - 1;
  const steps = [
    { short: 'equity\nentrada', v: E0, kind: 'start' },
    { short: 'EBITDA\norgânico', v: (ebOrg - DEAL.ebitda) * DEAL.multEntrada, kind: 'delta' },
    { short: 'add-ons', v: addE * (DEAL.multEntrada - 6), kind: 'delta' },
    { short: 'múltiplo', v: (mult - DEAL.multEntrada) * ebExit, kind: 'delta' },
    { short: 'caixa\ngerado', v: ND0 + addCost - NDexit, kind: 'delta' },
    { short: 'custos', v: -custosSaida - SU.custos, kind: 'delta' },
    { short: 'MIP', v: -mip, kind: 'delta' },
    { short: 'equity\nsaída', v: eqExit - mip, kind: 'total', final: true },
  ];
  return { ebExit, NDexit, evExit, eqExit, mip, fip, moic, tir, steps, levExit: NDexit / ebExit };
};

const SCORE = [
  ['tabuleiro', 'O tabuleiro', `FIP → holding → ${DEAL.alvo}; 12 participantes, 4 tipos de fluxo.`],
  ['fip', 'O FIP', 'Classe Multiestratégia (a Tucano passa do teto de R$ 400 M), enquadrada, entidade de investimento.'],
  ['ciclo', 'Vida do fundo', 'Investimento no ano 2 do fundo; saída no ano 7, dentro do prazo.'],
  ['economia', 'Waterfall', 'O MOIC do deal é bruto; o cotista vê o líquido depois de taxas e carry.'],
  ['custos', 'Custos', `${fmtM(SU.custos)} do comprador (~2,3% do EV), metade com dívida e DD.`],
  ['processo', 'Processo', '~7 meses do CIM ao closing; CADE não foi o gargalo.'],
  ['dd', 'Due diligence', 'Trabalhista no preço, PJ e solo em escrow, fiscal em indenização específica.'],
  ['ponte', 'Ponte de preço', `EV ${fmtM(DEAL.ev)} → ~R$ 544 M na conta do vendedor no closing.`],
  ['contratos', 'Contratos', 'Drag-along garante vender 100% na saída; o fundador acompanha.'],
  ['divida', 'Dívida', `Debênture de ${fmtM(SU.debenture)} a CDI + ${DEAL.spread.toLocaleString('pt-BR')}% com alienação fiduciária das ações.`],
  ['alavancagem', 'Alavancagem', '2,5x: perto do teto de ~2,6x que o CDI de 13,65% permite.'],
  ['estrutura', 'Estrutura', 'Incorporação reversa: ~R$ 128 M de escudo fiscal (VP), 23% do equity.'],
  ['regulacao', 'Regulação', 'CADE em rito sumário; add-ons acima de R$ 75 M também notificam.'],
  ['rotina', 'Rotina', 'Capital de giro: –10 dias de DSO libera ~R$ 33 M.'],
  ['saidas', 'Saídas', 'Venda estratégica ou secundária; IPO só se a janela seguir aberta.'],
];

const DealCard = () => {
  const [g, setG] = useState(8);
  const [addE, setAddE] = useState(20);
  const [mult, setMult] = useState(8);
  const [anos, setAnos] = useState(5);
  const [cdi, setCdi] = useState(12);
  const [agio, setAgio] = useState(true);
  const [dep, setDep] = useState(4);
  const [guess, setGuess] = useState(2.0);
  const [rev, setRev] = useState(false);
  const d = simDeal({ g, addE, mult, anos, cdi, agio, conv: 55 });
  const tirUsd = (1 + d.tir) / (1 + dep / 100) - 1;
  const cdiMult = Math.pow(1 + cdi / 100, anos);
  const usos = [
    { k: 'Compra das ações', v: SU.precoAcoes, c: '#2dd4bf' },
    { k: 'Quitação da dívida antiga', v: SU.refi, c: '#94a3b8' },
    { k: 'Custos de transação', v: SU.custos, c: '#fb923c' },
  ];
  const fontes = [
    { k: 'Debênture de aquisição', v: SU.debenture, c: '#38bdf8' },
    { k: `Equity ${FUNDO.nome}`, v: SU.equityFip, c: '#fbbf24' },
    { k: 'Rollover do fundador', v: SU.rollover, c: '#a78bfa' },
  ];
  const Stack = ({ items, title }) => (
    <div>
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-1 flex flex-col h-48 rounded-md overflow-hidden border border-white/10">
        {items.map((it) => (
          <div key={it.k} title={it.k} className="flex items-center justify-center px-2 text-[11px] text-neutral-950 font-medium" style={{ height: `${(it.v / SU.usos) * 100}%`, background: it.c, opacity: 0.85 }}>
            <span className="font-mono">{it.v / SU.usos > 0.07 ? it.v.toFixed(0) : ''}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 space-y-0.5">
        {items.map((it) => (
          <div key={it.k} className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="w-2 h-2 rounded-sm" style={{ background: it.c }} /><span className="flex-1">{it.k}</span><span className="font-mono">{fmtM(it.v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Card id="deal" icon={Star} title={`★ O deal inteiro: ${FUNDO.nome} × ${DEAL.alvo}`} subtitle="Fontes e usos no closing, cinco anos de gestão e a saída. Quanto o fundo multiplica?" accent="amber" index={secIndex('deal')} anchor>
      <MinSchema>
        Retorno de PE = <b>crescimento do EBITDA</b> + <b>múltiplo</b> (entrada × saída) + <b>caixa gerado</b> − <b>custos</b>. No Brasil, com juros altos, o primeiro termo carrega o deal; o múltiplo é bônus (ou castigo).
      </MinSchema>

      <div className="grid grid-cols-2 gap-4">
        <Stack items={usos} title={`usos · ${fmtM(SU.usos)}`} />
        <Stack items={fontes} title={`fontes · ${fmtM(SU.usos)}`} />
      </div>
      <div className="text-[11px] text-neutral-400">
        O FIP fica com <b className="text-amber-200">{fmtP(SU.pctFip)}</b> da holding; o fundador, com {fmtP(1 - SU.pctFip)}. Dívida de aquisição de {fmtX(SU.debenture / DEAL.ebitda)} o EBITDA; o equity paga {fmtP(SU.equityTotal / SU.usos, 0)} dos usos.
      </div>

      <div className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/5 p-4 space-y-3">
        <Eyebrow color="text-fuchsia-300">tenta prever · caso-base (8% a.a. orgânico, R$ 20 M de add-ons, saída a 8x no ano 5)</Eyebrow>
        <Slider label="seu palpite para o MOIC bruto do fundo" value={guess} min={1} max={4} step={0.05} onChange={(v) => { setGuess(v); setRev(false); }} fmt={(v) => fmtX(v, 2)} accent="accent-fuchsia-400" />
        <button onClick={() => setRev(true)} className="rounded-md border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1 text-[11px] text-fuchsia-100 hover:bg-fuchsia-400/20">revelar</button>
        {rev && (() => {
          const base = simDeal({ g: 8, addE: 20, mult: 8, anos: 5, cdi: 12, agio: true, conv: 55 });
          const delta = guess - base.moic;
          return (
            <div className="text-xs text-neutral-200">
              Caso-base: <b className="text-amber-200">{fmtX(base.moic, 2)}</b> e TIR de {fmtP(base.tir)} em reais. Seu palpite errou por <span className={Math.abs(delta) < 0.25 ? 'text-emerald-300' : 'text-rose-300'}>{delta > 0 ? '+' : ''}{delta.toFixed(2).replace('.', ',')}x</span>.
              Sem expansão de múltiplo e com só 2,5x de dívida, o ganho vem quase todo de EBITDA e caixa. Agora mexa nos botões abaixo.
            </div>
          );
        })()}
      </div>

      <div className="grid md:grid-cols-3 gap-x-5 gap-y-3">
        <Slider label="crescimento orgânico do EBITDA" value={g} min={-5} max={20} step={1} onChange={setG} fmt={(v) => `${v}% a.a.`} />
        <Slider label="EBITDA comprado em add-ons (a 6x)" value={addE} min={0} max={60} step={5} onChange={setAddE} fmt={(v) => fmtM(v)} />
        <Slider label="múltiplo de saída" value={mult} min={5} max={11} step={0.25} onChange={setMult} fmt={(v) => fmtX(v, 2)} hint="entrada: 8,0x" />
        <Slider label="anos até a saída" value={anos} min={3} max={8} step={1} onChange={setAnos} fmt={(v) => `${v} anos`} />
        <Slider label="CDI médio no período" value={cdi} min={6} max={16} step={0.5} onChange={setCdi} fmt={(v) => `${v.toLocaleString('pt-BR')}%`} />
        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer self-end pb-1">
          <input type="checkbox" checked={agio} onChange={(e) => setAgio(e.target.checked)} className="accent-emerald-400" />
          escudo fiscal do ágio (estrutura C)
        </label>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="text-[10px] text-neutral-500 mb-1">de onde vem o valor · equity total (FIP + fundador), R$ milhões</div>
        <BridgeChart steps={d.steps} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="MOIC bruto do FIP" value={fmtX(d.moic, 2)} sub={`${fmtM(d.fip)} sobre ${fmtM(SU.equityFip)}`} color="text-amber-300" />
        <Stat label="TIR em reais" value={fmtP(d.tir)} sub={`CDI acumulado: ${fmtX(cdiMult, 2)}`} color={d.moic > cdiMult ? 'text-emerald-300' : 'text-rose-300'} />
        <Stat label="EV de saída" value={fmtMB(d.evExit)} sub={`EBITDA ${fmtM(d.ebExit)}`} />
        <Stat label="alavancagem na saída" value={fmtX(Math.max(0, d.levExit), 1)} sub="dívida líquida / EBITDA" color="text-sky-300" />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 grid sm:grid-cols-[1fr_220px] gap-3 items-center">
        <div className="text-xs text-neutral-300">
          <b className="text-neutral-100">E para o cotista estrangeiro?</b> A TIR em dólar é a TIR em reais descontada da desvalorização do real. Com {dep}% a.a. de depreciação, os {fmtP(d.tir)} viram <b className={tirUsd > 0.15 ? 'text-emerald-300' : 'text-amber-300'}>{fmtP(tirUsd)}</b> em dólar, a métrica com que um LP americano compara o Brasil a um buyout nos EUA.
        </div>
        <Slider label="depreciação do real" value={dep} min={-3} max={12} step={0.5} onChange={setDep} fmt={(v) => `${v.toLocaleString('pt-BR')}% a.a.`} />
      </div>

      <div>
        <Eyebrow color="text-fuchsia-300">o deal visto por cada card</Eyebrow>
        <div className="mt-2 divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.02]">
          {SCORE.map(([id, nome, txt]) => (
            <div key={id} className="grid grid-cols-[130px_1fr] gap-3 px-3 py-1.5 text-xs items-baseline">
              <span><CrossLink to={id}>{nome}</CrossLink></span>
              <span className="text-neutral-300">{txt}</span>
            </div>
          ))}
        </div>
      </div>

      <Misconception
        wrong="PE ganha dinheiro comprando barato e vendendo caro."
        right="no Brasil de juros altos, ganha principalmente fazendo o EBITDA crescer (preço, compras, giro, add-ons) sem destruir caixa. Comprar barato ajuda; contar com múltiplo maior na saída é aposta."
        because="com a mesma saída a 8x, cada ponto de crescimento anual do EBITDA vale mais do que meia volta de múltiplo. Teste nos sliders."
      />
      <div className="mt-2 rounded-md border-l-4 border-fuchsia-400/50 bg-fuchsia-400/5 px-4 py-3">
        <div className="flex items-center gap-2 mb-1"><Quote className="w-3.5 h-3.5 text-fuchsia-300" /><span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">o fio da meada</span></div>
        <p className="text-sm text-neutral-200 italic">Dinheiro de cotista, comprometido por dez anos, entra num veículo regulado, compra o controle de uma empresa com a dívida que o CDI permitir, governa por cinco anos e volta em cascata. Todo o resto (contratos, CADE, laudos, covenants, siglas) serve para que cada real chegue a quem deve, na ordem combinada.</p>
      </div>
    </Card>
  );
};

/* ---------------------------------------------------------------- 17 · DICIONÁRIO */

const DIC_CATS = [
  { id: 'fundo', label: 'fundo', keys: ['FIP', 'RCVM 175', 'ICVM 578', 'administrador fiduciário', 'gestor', 'custodiante', 'cotista', 'LP', 'GP', 'regulamento', 'classe', 'responsabilidade limitada', 'capital comprometido', 'chamada de capital', 'compromisso de investimento', 'integralização', 'amortização', 'período de investimento', 'período de desinvestimento', 'assembleia de cotistas', 'taxa de gestão', 'taxa de administração', 'taxa de performance', 'carry', 'hurdle', 'catch-up', 'clawback', 'waterfall', 'J-curve', 'TVPI', 'DPI', 'RVPI', 'MOIC', 'TIR', 'vintage', 'first close', 'side letter', 'MFN', 'key person', 'comitê de investimentos', 'IC memo', 'LPAC', 'co-investimento', 'dry powder', 'valor justo', 'entidade de investimento', 'EFPC', 'investidor qualificado', 'investidor profissional', 'ANBIMA', 'ABVCAP', 'BNDESPar', 'continuation fund', 'secundário'] },
  { id: 'deal', label: 'deal', keys: ['NDA', 'teaser', 'CIM', 'IOI', 'proposta vinculante', 'MoU', 'VDR', 'QoE', 'SPA', 'acordo de acionistas', 'signing', 'closing', 'condições precedentes', 'locked box', 'completion accounts', 'leakage', 'earn-out', 'escrow', 'holdback', 'basket', 'de minimis', 'cap', 'W&I', 'R&W', 'MAC', 'tag-along', 'drag-along', 'direito de preferência', 'lock-up', 'put', 'EV', 'equity value', 'dívida líquida', 'debt-like', 'capital de giro', 'peg', 'EBITDA', 'EBITDA ajustado', 'múltiplo', 'add-on', 'buy-and-build', 'carve-out', 'TSA', '100-day plan', 'MIP', 'phantom shares', 'sweet equity', 'laudo de avaliação'] },
  { id: 'divida', label: 'dívida', keys: ['debênture', 'nota comercial', 'CCB', 'CDI', 'Selic', 'IPCA', 'spread', 'covenant', 'waiver', 'vencimento antecipado', 'cross-default', 'mudança de controle', 'ICSD', 'agente fiduciário', 'AGD', 'garantia firme', 'alienação fiduciária', 'cessão fiduciária', 'fiança', 'FIDC', 'CRI', 'CRA', 'Lei 4.131', 'BNDES', 'debênture incentivada', 'RCVM 160', 'bookbuilding', 'dividend recap'] },
  { id: 'reg', label: 'regulação e impostos', keys: ['CADE', 'gun jumping', 'procedimento sumário', 'ágio', 'goodwill', 'PPA', 'incorporação reversa', 'push-down', 'JCP', 'contingência', 'CPC 25', 'sucessão', 'recuperação judicial', 'UPI', 'IED', 'Novo Mercado', 'Lei 6.404', 'Resolução CMN 4.994', 'DTVM'] },
];

const CORREDOR = [
  ['"Circulou um teaser de uma distribuidora."', 'Um assessor mandou o resumo anônimo de uma empresa à venda.'],
  ['"Vamos assinar o NDA e pedir o book."', 'Assinar a confidencialidade e receber o CIM.'],
  ['"Passamos para a segunda rodada."', 'A proposta não vinculante foi aceita; agora vem data room e DD.'],
  ['"Tem red flag trabalhista."', 'A DD achou um risco relevante que muda preço ou estrutura.'],
  ['"Manda o markup do SPA até sexta."', 'Devolver a minuta do contrato com as nossas alterações.'],
  ['"Estamos em exclusividade."', 'O vendedor parou de negociar com outros por um prazo.'],
  ['"Assinamos; falta o CP de CADE."', 'O SPA foi assinado; o closing espera a aprovação do CADE.'],
  ['"Chama capital para o closing."', 'Pedir ao administrador a chamada de capital aos cotistas.'],
  ['"Precisamos de um waiver dos debenturistas."', 'Pedir perdão a uma quebra (ou mudança de controle) em assembleia.'],
  ['"O ativo está marcado a 1,6x."', 'O valor justo atual é 1,6 vez o custo.'],
  ['"O DPI do fundo III está baixo."', 'Pouco dinheiro já voltou aos cotistas daquele fundo.'],
  ['"É um add-on para a plataforma."', 'Uma aquisição menor para plugar numa empresa da carteira.'],
  ['"Ficou no escrow."', 'Parte do preço está retida na conta vinculada.'],
  ['"O IC é terça."', 'O comitê de investimentos se reúne terça para decidir.'],
];

const DicionarioCard = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('todos');
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const nq = norm(q.trim());
  const cats = cat === 'todos' ? DIC_CATS : DIC_CATS.filter((c) => c.id === cat);
  const entries = cats.flatMap((c) => c.keys.filter((k) => GLOSS[k]).map((k) => ({ k, c: c.label, d: GLOSS[k] })));
  const hits = nq ? entries.filter((e) => norm(e.k).includes(nq) || norm(e.d).includes(nq)) : entries;
  const frases = nq ? CORREDOR.filter(([a, b]) => norm(a).includes(nq) || norm(b).includes(nq)) : CORREDOR;
  return (
    <Card id="dicionario" icon={BookOpen} title="Dicionário de corredor" subtitle={`${entries.length} termos que você vai ouvir na primeira semana, e o que as frases realmente querem dizer.`} accent="violet" index={secIndex('dicionario')}>
      <MinSchema>
        O PE brasileiro fala <b>portuglês</b>: termo jurídico em português (cotista, escritura, alienação fiduciária) misturado com jargão de deal em inglês (teaser, markup, waiver). Os dois se referem às mesmas coisas.
      </MinSchema>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar: waiver, escrow, hurdle…"
            className="w-full rounded-md bg-white/[0.04] border border-white/10 pl-8 pr-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-violet-400/50" />
        </div>
        <Seg size="xs" value={cat} onChange={setCat} options={[{ id: 'todos', label: 'todos' }, ...DIC_CATS.map((c) => ({ id: c.id, label: c.label }))]} />
      </div>
      <div className="text-[10px] text-neutral-500">{hits.length} termos</div>
      <div className="grid sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {hits.map((e) => (
          <div key={e.k} className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-violet-200 font-medium">{e.k}</span>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500">{e.c}</span>
            </div>
            <div className="text-[11px] text-neutral-300 leading-snug mt-0.5">{e.d}</div>
          </div>
        ))}
      </div>
      {frases.length > 0 && (
        <div>
          <Eyebrow color="text-violet-300">frases de corredor, traduzidas</Eyebrow>
          <div className="mt-2 divide-y divide-white/5 rounded-lg border border-white/10 bg-white/[0.02]">
            {frases.map(([a, b]) => (
              <div key={a} className="grid sm:grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-1.5 text-xs">
                <span className="text-neutral-100 italic">{a}</span>
                <span className="text-neutral-400">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <QA items={[
        { q: 'Qual é a diferença entre taxa de performance e carry?', a: 'Nenhuma de substância: "taxa de performance" é o nome regulatório no FIP; "carry" (carried interest) é o jargão global. Ambos são a parte do lucro da gestora acima do hurdle.' },
        { q: 'Escrow, holdback e indenização específica: qual protege mais o comprador?', a: 'O holdback (o dinheiro nem sai do comprador), depois o escrow (dinheiro separado numa conta vinculada), depois a indenização (promessa de pagar, que depende de o vendedor ter dinheiro).' },
        { q: '"O ativo está marcado a 1,6x e o DPI é 0,3x." O que isso diz?', a: 'A carteira vale no papel 1,6 vez o custo, mas só 0,3 vez o capital integralizado voltou em dinheiro. O resto depende das saídas.' },
      ]} />
    </Card>
  );
};

/* ---------------------------------------------------------------- 18 · TRILHAS */

const TrilhasCard = () => (
  <Card id="trilhas" icon={Compass} title="Próximas trilhas" subtitle="Por onde seguir depois do manual de campo." accent="violet" index={secIndex('trilhas')}>
    <NextSteps groups={[
      {
        title: 'Explainers irmãos',
        note: 'no sandbox',
        items: [
          { label: 'Tributação Brasil · empresas', href: '#tributacao-brasil', note: 'Lucro Real × Presumido, PIS/COFINS, ICMS e a reforma: o pano de fundo da DD tributária e do escudo fiscal.' },
          { label: 'Data Centers · Brasil', href: '#data-centers-br', note: 'Um setor inteiro reorganizado por fundos de PE e infraestrutura: M&A, dívida e disclosure na prática.' },
          { label: 'Decision Theory', href: '#decision-theory', note: 'Árvores de decisão, valor da informação e risco: a matemática por trás do "vale gastar com DD?".' },
          { label: 'Retail Quant', href: '#retail-quant', note: 'Sharpe, alavancagem, drawdown e tributação do investidor brasileiro: o outro lado da mesa do cotista.' },
        ],
      },
      {
        title: 'Aprofundar no tema',
        note: 'próximos ganchos úteis',
        items: [
          { label: 'Modelo de LBO na planilha', note: 'Fontes e usos, cascata de dívida, cash sweep, retorno por cenário. Construa o da Tucano do zero.' },
          { label: 'Valuation para M&A', note: 'Comparáveis, transações precedentes, DCF com WACC em reais, e por que o PE ancora em múltiplo de EBITDA.' },
          { label: 'Contabilidade de combinação de negócios', note: 'CPC 15 (IFRS 3), PPA, intangíveis identificáveis, impairment de goodwill.' },
          { label: 'Venture capital no Brasil', note: 'Mútuo conversível, rodadas, preferências de liquidação, vesting: o PE dos estágios iniciais.' },
          { label: 'Crédito privado e estruturado', note: 'O outro lado da debênture: como os fundos de crédito precificam, monitoram e renegociam.' },
        ],
      },
      {
        title: 'Fontes primárias',
        note: 'para quando precisar da letra da regra',
        items: [
          { label: 'RCVM 175 · Anexo Normativo IV (FIP)', href: 'https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/resolucoes/anexos/100/resol175consolid_Anexo04.pdf', external: true, note: 'Texto consolidado da CVM: carteira, categorias, informes, taxa de performance.' },
          { label: 'Lei 6.404/1976 (Lei das S.A.)', href: 'https://www.planalto.gov.br/ccivil_03/leis/l6404consol.htm', external: true, note: 'Debêntures, acordo de acionistas, incorporações, tag-along.' },
          { label: 'Lei 12.973/2014 (ágio)', href: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12973.htm', external: true, note: 'Arts. 20–25: goodwill, laudo e amortização em 1/60 por mês.' },
          { label: 'ABVCAP · dados de mercado', href: 'https://abvcap.com.br/en/publicacao/consolidacao-de-dados-3o-trimestre-2025/', external: true, note: 'Volume investido por trimestre (R$ 13,3 bi em PE em 2024, em 72 deals).' },
        ],
      },
      {
        title: 'Ampliando a lente',
        note: 'onde o PE brasileiro se encaixa',
        items: [
          { label: 'Juros e valuation', note: 'Como o ciclo da Selic move múltiplos, alavancagem possível e janelas de saída.' },
          { label: 'PE global × Brasil', note: 'Alavancagem de 5–6x e hurdle de 8% em dólar lá; 2–3x e IPCA + 6–8% aqui. O que isso faz com as teses.' },
          { label: 'Mercado de capitais brasileiro', note: 'A reabertura dos IPOs, o boom de debêntures e o papel dos fundos de pensão.' },
          { label: 'Governança corporativa', note: 'Conselhos, independentes, conflitos: o que o PE leva para empresas familiares.' },
        ],
      },
    ]} />
  </Card>
);

/* ============================================================================
   FOOTER + TOP-LEVEL
   ============================================================================ */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>base:</span>
        <span className="text-amber-300">RCVM 175 · Anexo IV</span>
        <span className="text-teal-300">Lei 6.404</span>
        <span className="text-sky-300">RCVM 160</span>
        <span className="text-violet-300">Lei 12.529 (CADE)</span>
        <span className="text-rose-300">Lei 12.973 · Lei 14.754</span>
      </div>
      <p className="max-w-xl mx-auto">
        {FUNDO.nome}, {FUNDO.gestora} e {DEAL.alvo} são fictícios; os números do deal são ilustrativos, calibrados em ordens de grandeza típicas do mercado brasileiro. Regras e alíquotas mudam: material pedagógico, não aconselhamento jurídico, tributário ou de investimento.
      </p>
    </div>
  </footer>
);

export default function PrivateEquityBrasilExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        div:has(> svg.pe-chart) { overflow-x: auto; }
        @media (max-width: 640px) {
          svg.pe-chart { min-width: 560px; }
          svg.pe-chart-wide { min-width: 640px; }
        }
      `}</style>
      <Hero />
      <SectionNav />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <TabuleiroCard />
        <FipCard />
        <CicloCard />
        <EconomiaCard />
        <CustosCard />
        <ProcessoCard />
        <DDCard />
        <PonteCard />
        <ContratosCard />
        <DividaCard />
        <AlavancagemCard />
        <EstruturaCard />
        <RegulacaoCard />
        <RotinaCard />
        <SaidasCard />
        <DealCard />
        <DicionarioCard />
        <TrilhasCard />
      </main>
      <Footer />
    </div>
  );
}
