import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Activity, AppWindow, BarChart3, Bot, BookOpen, Boxes, BrainCircuit,
  Cable, ChevronDown, Cloud, Compass, Database, Eye, EyeOff, FlaskConical,
  GitFork, HelpCircle, KeyRound, Layers, Lightbulb, Link2, PlugZap,
  Quote, Ruler, Sparkles, Star, Table2, Telescope, Workflow,
  AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';

/* ============================================================================
   The Stack — production-grade AI-native SaaS, layer by layer
   Single-file React component. Dark mode. Tailwind + lucide-react +
   framer-motion + KaTeX. Stage-A scaffolding: primitives + Hero + nav + stubs.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

// Note: hex colors inside macros must double the '#' (KaTeX uses '#' for params).
const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',  // amber — numbers
  '\\hi':  '\\textcolor{##fb7185}{#1}',  // rose — emphasis / wrong
  '\\co':  '\\textcolor{##7dd3fc}{#1}',  // sky — concepts
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',  // emerald — good / right
  '\\vi':  '\\textcolor{##c4b5fd}{#1}',  // violet — operators
  '\\fu':  '\\textcolor{##f0abfc}{#1}',  // fuchsia — anchor / synthesis
};

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode, throwOnError: false, output: 'html', strict: 'ignore', macros: KATEX_MACROS,
    });
  } catch {
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
  orange:  'bg-orange-500/10 text-orange-300 border-orange-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  neutral: 'bg-white/[0.04] text-neutral-300 border-white/10',
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
  // Web framework / rendering
  'SSR': 'Server-Side Rendering — HTML rendered per-request on the server. Better TTFB and SEO than CSR; pays a server-CPU cost per page.',
  'CSR': 'Client-Side Rendering — empty HTML shipped, JS hydrates and renders. Cheap to host, slower first paint, weaker SEO.',
  'SSG': 'Static Site Generation — HTML pre-rendered at build time, served from CDN. Cheapest and fastest, but no per-request data.',
  'RSC': 'React Server Components — components that run only on the server, returning a serialized tree. Lets you fetch on the server without shipping the data-fetch JS to the browser. The Next.js App Router default.',
  'edge runtime': 'A V8-isolate runtime (Cloudflare Workers, Vercel Edge) that runs code at PoPs near the user. ~50ms cold start vs ~500ms for Lambda. No Node APIs; smaller bundles.',
  'hydration': 'When the browser takes the SSR-rendered HTML and attaches React event listeners. The "interactive" moment. Hydration cost grows with shipped JS.',

  // API shape
  'tRPC': 'TypeScript-end-to-end RPC — call your server functions from the client with full type inference, no schema layer. Best when both sides are TS and you control them.',
  'REST': 'Representational State Transfer — resource-oriented HTTP API. The portable, language-agnostic default. No type safety unless you bolt on OpenAPI + codegen.',
  'GraphQL': 'Query language where clients ask for the exact shape they want. Solves over-fetching for fat clients (mobile/web). Operational overhead — caching, persisted queries, N+1 protection.',
  'gRPC': 'Protocol-buffer RPC over HTTP/2. Strict schema, fast, polyglot. The internal-microservice default; rare for browser clients (needs gRPC-Web).',
  'Server Actions': 'Next.js / Remix mechanism: a function marked "use server" that the client calls like a local function but executes on the server. Like tRPC without the explicit RPC layer.',

  // Data layer
  'Postgres': 'PostgreSQL — open-source relational DB. The production default for SaaS: ACID, JSON support, full-text search, pgvector for embeddings, mature replication.',
  'SQLite': 'Embedded relational DB; the whole DB is one file. With Litestream/Turso it scales further than people think. The "boring choice that wins" for most B2B apps.',
  'Turso': 'Distributed SQLite (libSQL) with read-replicas at the edge. Postgres-shaped data semantics with edge latency.',
  'connection pool': 'Pool of warm DB connections shared across server requests. Without one, serverless functions exhaust the DB at concurrency. PgBouncer and Supabase pooler are the standard fixes.',
  'read replica': 'Read-only DB copy kept in sync with the primary. Routes read traffic away from the writer; usually behind a few hundred ms of replication lag.',
  'PITR': 'Point-In-Time Recovery — restore a DB to any past timestamp via WAL replay. The minimum backup discipline for production.',

  // ORM / migrations
  'ORM': 'Object-Relational Mapper — library that lets you read/write a DB through typed objects instead of raw SQL.',
  'query builder': 'Type-safe API that mirrors SQL ("select from where") rather than abstracting it. Drizzle and Kysely are the leading TS query builders.',
  'migration': 'Versioned, ordered change-set on the DB schema. Production-grade migration discipline = forward-only, expand-then-contract, zero-downtime, reviewed in PRs.',
  'expand-contract': 'Zero-downtime schema change pattern: (1) add new column / table without removing old, (2) deploy code that writes both, (3) backfill, (4) read from new, (5) remove old in a later release.',

  // Auth / multi-tenancy
  'multi-tenancy': 'Architecture where one app instance serves many isolated customer "tenants". The tenant id flows through every query and every authz check.',
  'RBAC': 'Role-Based Access Control — users have roles (admin/member/viewer), roles have permissions. The default authz model for SaaS.',
  'ABAC': 'Attribute-Based Access Control — permissions are computed from attributes of the user, resource, and context. More expressive than RBAC, harder to audit.',
  'SSO': 'Single Sign-On — sign in once with an identity provider (Okta, Azure AD), get access to all linked apps. The "we want enterprise customers" gate.',
  'SCIM': 'System for Cross-domain Identity Management — protocol for an IdP to provision/deprovision users in your app. Pairs with SSO; required for serious enterprise deals.',
  'OAuth': 'Delegation protocol: app gets a token to act on a user’s behalf at another service (e.g. "sign in with Google"). Not authentication by itself, despite common usage.',
  'OIDC': 'OpenID Connect — authentication layer on top of OAuth 2.0. Adds an ID token with user identity claims. The modern "sign in with X" stack.',
  'SAML': 'Older XML-based SSO protocol, still required by many enterprise IdPs. WorkOS / SSOReady abstract the per-customer SAML pain.',
  'WebAuthn': 'Browser API for hardware-backed credentials (passkeys, security keys). Phishing-resistant; replaces passwords on supporting devices.',

  // Hosting / infra
  'serverless': 'Per-request execution on managed infra. No idle cost; cold starts; constrained runtime. Lambda, Cloud Functions, Vercel Functions.',
  'cold start': 'The latency penalty when a serverless function spins up a new instance. ~50ms (edge), ~500ms (Lambda), ~2s+ (containerized cold container).',
  'container': 'Packaged image (Docker / OCI) that bundles app + deps + runtime. Runs the same on dev, CI, prod. The "always-on" alternative to serverless.',
  'Kubernetes': 'Container orchestrator. Powerful and operationally heavy; the wrong default for almost any SaaS under ~50 services.',
  'IaC': 'Infrastructure as Code — declarative config (Terraform, Pulumi, OpenTofu) that provisions cloud resources. The "review my prod change in a PR" discipline.',
  'CDN': 'Content Delivery Network — cached static assets served from edge PoPs near the user. Cloudflare, Fastly, CloudFront.',

  // Background jobs
  'queue': 'A persistent buffer between request producers and async workers. Lets you decouple slow / retryable / fan-out work from the request path.',
  'BullMQ': 'Redis-backed Node.js queue. Mature, fast, requires Redis. The default self-hosted option.',
  'Inngest': 'Event-driven workflow platform. Functions are typed, retryable, observable; no Redis. Multi-step workflows (sleep, fan-out) are first-class.',
  'Trigger.dev': 'Open-source workflow engine optimized for long-running AI tasks. Generous free tier; durable execution model.',
  'Temporal': 'Durable workflow engine — code runs as if synchronous but survives crashes and restarts. Heavier ops; the right call for complex multi-day workflows.',
  'idempotency': 'Property that running the same operation twice has the same effect as once. Required for retryable work; the absence of it is the #1 distributed-systems bug.',

  // Observability
  'observability': 'The ability to ask new questions about a system without redeploying it. Three pillars: logs, metrics, traces — plus errors as a fourth.',
  'OpenTelemetry': 'Vendor-neutral standard for emitting traces, metrics, and logs. Avoids vendor lock-in; most modern obs vendors ingest OTLP.',
  'tracing': 'Per-request flame graph showing every span across services. The single highest-leverage observability artifact for distributed systems.',
  'SLO': 'Service Level Objective — internal target (e.g. 99.9% of requests < 300ms over 30d). Drives error budgets and prioritization.',
  'error budget': '1 minus your SLO. The amount of "unreliability" you can spend before reliability work outranks features. Drives the dev/SRE tradeoff.',

  // LLM / AI infra
  'LLM': 'Large Language Model — transformer-based model (Claude, GPT, Gemini) that takes text in and produces text out. The substrate of AI-native features.',
  'token': 'The atomic unit a model consumes/emits — typically 3-4 characters of English. Pricing is per million tokens; a typical chat turn is 100-1000 tokens.',
  'context window': 'How many tokens the model can attend to at once. Frontier models are ~200K-2M today. Costs and latency grow with context length.',
  'prompt caching': 'Provider-side cache that lets repeated prefixes of a prompt skip re-tokenization and re-attention. Anthropic / OpenAI both ship this; cuts cost 5-10x for static-prefix workloads.',
  'tool calling': 'LLM mechanism for emitting structured calls to declared functions (with typed args). The substrate of agents. Also called function calling.',
  'streaming': 'Server-side-events response where the model emits tokens one at a time. Critical for UX — perceived latency drops 5-10x vs waiting for full completion.',
  'hallucination': 'When the model emits confident-sounding text that’s factually wrong. Mitigation = grounding (RAG, tools), constrained decoding, eval harness with golden refs.',

  // RAG / vector
  'RAG': 'Retrieval-Augmented Generation — fetch relevant docs at request time and stuff them into the prompt. The default way to get an LLM to "know about" your private data.',
  'embedding': 'Dense vector representation of text/image/audio. Two pieces of text are "similar" if their embeddings are close (cosine).',
  'cosine similarity': 'Dot product of unit-normalized vectors. Standard similarity measure for embeddings; ranges -1 to 1, almost always 0 to 1 for text embeddings.',
  'vector database': 'Storage + ANN-index over embeddings. pgvector, Pinecone, Turbopuffer, Qdrant, Weaviate, Milvus. Returns top-k similar items in <100ms.',
  'pgvector': 'Postgres extension that adds a `vector` column type and ANN indexes (HNSW/IVFFlat). Often beats dedicated vector DBs for SaaS-scale corpora; one less system to run.',
  'chunking': 'Splitting source documents into retrieve-able units. The most underrated RAG knob — chunk size and overlap drive recall more than the embedding model.',
  'reranker': 'A second-stage model that re-orders the top-k retrieved chunks by relevance to the query. Cohere Rerank, BGE Rerank, or an LLM-as-reranker. Bigger gain than swapping embedding models.',
  'HyDE': 'Hypothetical Document Embeddings — embed an LLM-generated *answer* to the query and search with that embedding. Often beats embedding the query directly.',

  // Agents
  'agent': 'A program where an LLM, in a loop, decides what to do next from a tool palette. The boundary with "workflow" is fuzzy — an agent is open-ended; a workflow follows a known DAG.',
  'ReAct': 'Reason + Act — agent loop pattern: Thought → Action → Observation → Thought ... Each turn the model both reasons in text and emits a tool call.',
  'MCP': 'Model Context Protocol — Anthropic’s standard for connecting LLM apps to data/tool servers. Lets one app expose its surface to many LLM clients without per-client glue.',
  'guardrails': 'Pre/post-hooks that filter agent inputs/outputs (block PII, classify harmful content, enforce schema). Llama Guard, OpenAI moderation, Anthropic safety filters.',

  // Eval / cost
  'eval': 'Programmatic test suite for LLM outputs. Inputs → outputs → scores (deterministic checks, LLM-as-judge, regression on a golden set). The infra that makes AI features production-grade.',
  'golden set': 'Hand-curated input/expected-output pairs that pin down the behavior you don’t want to regress. The minimum viable eval.',
  'LLM-as-judge': 'Pattern where one LLM grades another’s output against a rubric. Cheap, scalable, biased toward verbose answers; calibrate against human labels before trusting it.',
  'token budget': 'Cap on total tokens a feature is allowed to spend per request. Without one, an agent loop can run an unbounded bill on a single conversation.',

  // SaaS / production-grade
  'webhook': 'HTTP POST your service receives when an event happens upstream (Stripe charge, GitHub push). Inbound webhooks are surprisingly hard — retries, signature verification, replay protection.',
  'feature flag': 'Server-side switch that toggles a code path without redeploying. The substrate of progressive rollouts, A/B tests, kill switches.',
  'idempotency key': 'Client-supplied key that the server uses to dedupe retries of the same request. Stripe-style. The minimum required for anything that takes payment or sends mail.',
  'CSP': 'Content Security Policy — HTTP header that restricts which origins a page can load JS/styles/images from. The single highest-leverage XSS defense.',
  'rate limiting': 'Cap on requests per actor per window. Token bucket / leaky bucket / fixed window. Without it your API is one curl-loop from down.',
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

const Worked = ({ title = 'Worked example', children }) => (
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
   HERO + SECTION NAV
   ========================================================================== */

// Animated layer-stack background — horizontal lines materializing one above
// the next, suggesting "stack of layers being assembled". Sets the visual
// metaphor for the explainer.
const LayerStack = () => {
  const layers = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    y: 30 + i * 22,
    delay: i * 0.08,
    opacity: 0.25 + (i % 3) * 0.15,
    color: i < 9 ? '#7dd3fc' : '#f0abfc',
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 800 360">
      <defs>
        <linearGradient id="stack-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0a0a0a" stopOpacity="0" />
          <stop offset="0.15" stopColor="#0a0a0a" stopOpacity="0" />
          <stop offset="0.85" stopColor="#0a0a0a" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {layers.map((l, i) => (
        <motion.line
          key={i}
          x1="80" x2="720" y1={l.y} y2={l.y}
          stroke={l.color} strokeOpacity={l.opacity} strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: l.delay, ease: 'easeOut' }}
        />
      ))}
    </svg>
  );
};

const Hero = () => (
  <header className="relative overflow-hidden border-b border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-violet-500/5 to-transparent" />
    <LayerStack />
    <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/80 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-400/20">
          <Layers className="w-3.5 h-3.5" /> the production-grade ai-native stack
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
          The Stack
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base">What to pick when you&apos;re vibecoding production-grade AI-native SaaS.</p>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          A real product sits on{' '}
          <span className="text-cyan-300">~14 stack layers</span>, each with 3-5 plausible options.
          Most decisions are reversible in months; a few lock you in for years. This is a map of
          the layer, the options, the tradeoffs &mdash; ending in{' '}
          <span className="text-fuchsia-300">one opinionated default</span> and a{' '}
          <span className="text-fuchsia-300">deviation rubric</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-cyan-300">framework · api · db</span>
          <span className="text-violet-300">auth · hosting · jobs</span>
          <span className="text-emerald-300">obs · adjacent</span>
          <span className="text-amber-300">llm · rag · agents · eval</span>
          <span className="text-fuchsia-300">★ default stack · deviation map</span>
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10 flex justify-center text-neutral-500">
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  </header>
);

const SECTIONS = [
  { id: 'frame',     label: 'Frame',                  icon: Layers },
  { id: 'app',       label: 'App framework',          icon: AppWindow },
  { id: 'api',       label: 'Backend &amp; API',      icon: Cable },
  { id: 'db',        label: 'Database',               icon: Database },
  { id: 'orm',       label: 'ORM &amp; migrations',   icon: Table2 },
  { id: 'auth',      label: 'Auth &amp; tenancy',     icon: KeyRound },
  { id: 'host',      label: 'Hosting &amp; infra',    icon: Cloud },
  { id: 'jobs',      label: 'Jobs &amp; queues',      icon: Workflow },
  { id: 'obs',       label: 'Observability',          icon: Activity },
  { id: 'adjacent',  label: 'Adjacent · good to know',icon: PlugZap },
  { id: 'llm',       label: 'LLM provider',           icon: BrainCircuit },
  { id: 'rag',       label: 'RAG &amp; vectors',      icon: BookOpen },
  { id: 'agents',    label: 'Agents &amp; tools',     icon: Bot },
  { id: 'eval',      label: 'AI eval &amp; cost',     icon: BarChart3 },
  { id: 'stack',     label: 'The default stack',      icon: Boxes,    anchor: true },
  { id: 'deviation', label: 'The deviation map',      icon: GitFork,  anchor: true },
  { id: 'trails',    label: 'Next trails',            icon: Compass },
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
                  <span className="tracking-wide" dangerouslySetInnerHTML={{ __html: s.label }} />
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
                <span dangerouslySetInnerHTML={{ __html: s.label }} />
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
   STUB CARDS — placeholders during scaffolding stage. Each will be replaced
   in subsequent stages C-K. The id attribute must remain stable so SectionNav
   anchors continue to scroll-target the right card.
   ========================================================================== */

const StubCard = ({ id, icon, title, accent, index, anchor }) => (
  <Card id={id} icon={icon} title={title} accent={accent} index={index} anchor={anchor}
        subtitle="(card body lands in a later stage)">
    <div className="text-xs text-neutral-500 italic">scaffolded · content pending</div>
  </Card>
);

/* ============================================================================
   01 — FRAME
   The 14 layers of a production-grade AI-native SaaS, sorted by decision half-life
   crossed with how AI-native the layer is. Re-used as the mental TOC for the rest
   of the explainer.
   ========================================================================== */

const STACK_LAYERS = [
  { id: 'app',       label: 'App framework',     halfLife: 'long',  ai: 'low',  color: 'sky' },
  { id: 'api',       label: 'API shape',         halfLife: 'med',   ai: 'low',  color: 'sky' },
  { id: 'db',        label: 'Database',          halfLife: 'long',  ai: 'low',  color: 'violet' },
  { id: 'orm',       label: 'ORM / migrations',  halfLife: 'med',   ai: 'low',  color: 'violet' },
  { id: 'auth',      label: 'Auth & tenancy',    halfLife: 'long',  ai: 'low',  color: 'emerald' },
  { id: 'host',      label: 'Hosting',           halfLife: 'med',   ai: 'low',  color: 'emerald' },
  { id: 'jobs',      label: 'Jobs & queues',     halfLife: 'med',   ai: 'low',  color: 'amber' },
  { id: 'obs',       label: 'Observability',     halfLife: 'med',   ai: 'low',  color: 'amber' },
  { id: 'adjacent',  label: 'Adjacent (×12)',    halfLife: 'short', ai: 'low',  color: 'orange' },
  { id: 'llm',       label: 'LLM provider',      halfLife: 'short', ai: 'high', color: 'fuchsia' },
  { id: 'rag',       label: 'RAG / vectors',     halfLife: 'med',   ai: 'high', color: 'fuchsia' },
  { id: 'agents',    label: 'Agents / tools',    halfLife: 'short', ai: 'high', color: 'rose' },
  { id: 'eval',      label: 'Eval & cost',       halfLife: 'long',  ai: 'high', color: 'rose' },
];

const QUADRANTS = [
  {
    key: 'lock-low',
    title: 'Long half-life · low AI-native',
    sub: 'The 5-year decisions',
    color: 'violet',
    items: ['Database', 'Auth & tenancy', 'App framework'],
    note: 'Load-bearing. Hard to swap once you have customers. Decide carefully, then leave alone.',
  },
  {
    key: 'lock-high',
    title: 'Long half-life · high AI-native',
    sub: 'Eval infra outlives every prompt',
    color: 'fuchsia',
    items: ['Eval golden sets', 'Prompt history', 'Tool schemas'],
    note: 'Models churn quarterly; the eval and prompt-version archive is what makes them swappable.',
  },
  {
    key: 'rev-low',
    title: 'Short half-life · low AI-native',
    sub: 'Vendor-swappable',
    color: 'amber',
    items: ['Hosting tier', 'Queue vendor', 'Obs vendor', 'Email / file / search vendors'],
    note: 'Pick the cheapest one that meets the 90th-percentile need. Migrate when it bites.',
  },
  {
    key: 'rev-high',
    title: 'Short half-life · high AI-native',
    sub: 'Changes month-to-month',
    color: 'rose',
    items: ['LLM provider', 'Agent framework', 'Vector DB pick', 'Prompt content'],
    note: 'Optimize for being able to swap in 1 day. Abstract the call site, version the prompts.',
  },
];

const HALFLIFE_COLOR = { long: 'fuchsia', med: 'violet', short: 'sky' };
const AI_COLOR = { low: 'neutral', high: 'fuchsia' };

const FrameCard = () => {
  return (
    <Card id="frame" icon={Layers} title="The frame: stack as layers, decisions by half-life" accent="cyan" index={1}
          subtitle="A production app sits on ~14 layers. Two axes decide how to think about each: how long the decision lives, and how AI-native the layer is.">
      <MinSchema>
        Pick the <em>long-half-life · low-AI-native</em> layers first &mdash; database, framework, auth.
        Everything else is comparatively easy to swap, and the AI-native layers are designed to be swapped.
      </MinSchema>

      <p>
        The mistake is treating every layer as equally weighty. The DB you choose at week 1 is still
        with you at year 5 with 10× more data; the LLM provider you chose at week 1 has been
        replaced 3 times by then. Match the rigor of the choice to its{' '}
        <span className="text-fuchsia-300">half-life</span>, and remember the orthogonal axis &mdash;
        whether the layer churns with frontier models, or sits in classical SaaS territory.
      </p>

      <Predict question="Of the 13 stack layers, how many are 'long half-life · low AI-native' (the ones you have to get right at the start)?">
        Three: <Term>Postgres</Term> as your DB, your app framework (Next.js / Remix / Astro / SvelteKit /
        Nuxt), and your auth + multi-tenancy model. Every other layer is either swappable in days
        (vendor choices) or designed to be swapped (LLM provider, agent harness). Spend disproportionate
        thought on those three.
      </Predict>

      {/* 2x2 decision quadrant */}
      <div className="mt-4">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-[11px]">
          {/* header row */}
          <div />
          <div className="text-center text-[10px] uppercase tracking-[0.18em] text-neutral-500 pb-1">
            low AI-native <span className="text-neutral-600">(classical SaaS)</span>
          </div>
          <div className="text-center text-[10px] uppercase tracking-[0.18em] text-fuchsia-400/80 pb-1">
            high AI-native <span className="text-neutral-600">(LLM era)</span>
          </div>

          {/* row 1: long half-life */}
          <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-300 [writing-mode:vertical-rl] rotate-180 self-stretch">
            long half-life
          </div>
          {QUADRANTS.filter(q => q.key.startsWith('lock')).map(q => (
            <QuadrantTile key={q.key} q={q} />
          ))}

          {/* row 2: short half-life */}
          <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-[0.18em] text-sky-300 [writing-mode:vertical-rl] rotate-180 self-stretch">
            short half-life
          </div>
          {QUADRANTS.filter(q => q.key.startsWith('rev')).map(q => (
            <QuadrantTile key={q.key} q={q} />
          ))}
        </div>
      </div>

      {/* Layer ladder */}
      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">
          the 13 layers · click any chip to jump
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STACK_LAYERS.map(l => (
            <a key={l.id} href={`#${l.id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`group inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] no-underline transition-colors ${chipPalette[l.color]} hover:bg-white/10`}>
              <span className="font-mono">{l.label}</span>
              <span className="text-[9px] opacity-60">{l.halfLife === 'long' ? '5y' : l.halfLife === 'med' ? '~1y' : '<6mo'}</span>
              {l.ai === 'high' && <Sparkles className="w-2.5 h-2.5 opacity-80" />}
            </a>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-neutral-500">
          <Sparkles className="w-2.5 h-2.5 inline-block mr-1 align-baseline text-fuchsia-300" />
          high-AI-native &middot; <span className="text-neutral-400">5y</span> long half-life &middot;{' '}
          <span className="text-neutral-400">~1y</span> medium &middot;{' '}
          <span className="text-neutral-400">&lt;6mo</span> short
        </div>
      </div>

      <WhenItMatters>
        Always &mdash; every architecture decision is implicitly a bet on a half-life and an AI-nativeness.
        Naming them explicitly stops the failure mode of <em>treating the LLM provider like the database</em>
        (over-engineered abstraction layers) and <em>treating the database like the LLM provider</em>
        (locked-in for the wrong reasons).
      </WhenItMatters>

      <Misconception
        wrong="The best stack maximizes future flexibility — abstract every layer behind an interface so you can swap anything."
        right="The best stack matches cognitive load to team size. For 1-3 vibecoding devs, the cost of an abstraction layer (more code AI has to keep coherent) outweighs the option value of swapping a vendor you'll keep for years."
        because="Abstractions get tested by the swap that never happens. Most production-grade SaaS stays on its day-1 DB, framework, and auth provider for the entire life of the company. Pay the lock-in. Skip the wrappers. Save the cycles for the AI layer where churn IS expected."
      />

      <Deeper>
        <p>
          <strong>Cost of swapping a layer scales with</strong>{' '}
          <Eq>{'C \\sim L \\cdot \\log(N_{\\text{users}}) \\cdot k_{\\text{coupling}}'}</Eq>{' '}
          where <Eq>L</Eq> is lines of code that touch the layer, <Eq>N</Eq> is active users (data
          migration burden), and <Eq>k</Eq> captures how much downstream code depends on layer-specific
          semantics (Postgres-only features, framework-specific data fetching). The product is roughly{' '}
          <em>weeks-of-engineering</em> for a real swap; that&apos;s why long-half-life choices justify
          spending weeks at the start.
        </p>
        <p>
          <strong>The AI-native axis breaks the analogy.</strong>{' '}
          For the LLM provider layer the calculus inverts &mdash; the model itself is expected to be
          replaced quarterly, but the <em>eval set</em> and <em>prompt history</em> outlive every model.
          Optimize the call-site for swappability (one provider abstraction, one prompt-version table)
          and treat the model itself as ephemeral. That&apos;s a different shape of long-term commitment
          than choosing Postgres, and confusing the two is where most AI-native architecture goes wrong.
        </p>
        <p>
          <strong>Vibecoding adds a third axis: AI-codegen-friendliness.</strong>{' '}
          When AI is doing most of the typing, the stack&apos;s ecosystem mass and documentation depth
          dominate. Next.js + Postgres + Prisma is dramatically easier to vibecode than a novel stack
          even if the novel stack is technically better, because the AI has seen 100× more examples.
          We chip this on every option in later cards. <CrossLink to="app" recap="Coming next: app framework choice. Boring + popular wins under AI codegen.">app framework</CrossLink>.
        </p>
      </Deeper>

      <QA items={[
        { q: "Why isn't 'frontend framework' itself a long-half-life decision?",
          a: "It is — that's why 'app framework' sits in the long-half-life column. The point is that within the framework decision (Next vs Remix vs Astro), the option you pick is mostly a matter of fit; the harder lock-in is React vs Svelte vs Vue, which is the same axis as DB vendor choice." },
        { q: 'Where do hosting providers (Vercel / Fly / Railway) fit?',
          a: 'Medium-half-life — your app code is mostly portable across them, but containerizing or de-Vercelizing a Next.js app that uses platform-specific features (Edge Runtime, ISR, image optimization) takes ~1-2 weeks. Pick deliberately; switching is annoying but not catastrophic.' },
        { q: 'How do I decide if my product is "low" or "high" AI-native?',
          a: 'If your differentiation depends on an LLM call working reliably, you are high AI-native. If LLM features are bolted on (a copilot, a summarizer, a search-with-RAG), you are low AI-native. The eval card stops being optional in the high case.' },
      ]} />
    </Card>
  );
};

const QuadrantTile = ({ q }) => {
  const c = chipPalette[q.color];
  return (
    <div className={`rounded-lg border p-3 ${c.replace('bg-', 'bg-').replace('text-', '')} bg-white/[0.02]`}>
      <div className="flex items-baseline justify-between mb-1 gap-2">
        <div className={`text-[11px] font-semibold leading-tight ${chipPalette[q.color].split(' ').find(s => s.startsWith('text-'))}`}>
          {q.sub}
        </div>
      </div>
      <ul className="text-[11px] text-neutral-200 leading-snug space-y-0.5 mb-2">
        {q.items.map((it, i) => <li key={i}>· {it}</li>)}
      </ul>
      <div className="text-[10px] text-neutral-500 leading-snug italic">{q.note}</div>
    </div>
  );
};

/* ============================================================================
   02 — APP FRAMEWORK
   The "what render-and-route engine sits between requests and your DB" decision.
   Five plausible defaults; the sub-decision (CSR / SSR / RSC / SSG) is mostly
   subsumed by the framework choice today.
   ========================================================================== */

const FRAMEWORKS = [
  {
    id: 'next',
    name: 'Next.js',
    sub: 'App Router · RSC · TS',
    color: 'fuchsia',
    deploy: 'Vercel (best) · Cloudflare · self-host',
    ecosystem: 95,
    aiCodegen: 95,
    perf: 78,
    lockIn: 60,
    bullets: [
      'Default for production-grade React. RSC + Server Actions ship.',
      'Massive AI training data — codegen quality is the highest of any stack.',
      'Vercel-shaped APIs (ISR, Image, Edge) lock you in modestly; portable as containers.',
    ],
    when: 'The default unless you have a reason. Especially if you ship AI features.',
    devClass: 'sky',
  },
  {
    id: 'rr7',
    name: 'React Router 7 (Remix)',
    sub: 'loaders · actions · TS',
    color: 'sky',
    deploy: 'Cloudflare · Fly · self-host',
    ecosystem: 70,
    aiCodegen: 70,
    perf: 85,
    lockIn: 30,
    bullets: [
      'Loaders + actions = the cleanest data model in React. Less magic than RSC.',
      'Web-standard mindset (Request/Response). Plays well with Cloudflare Workers.',
      'Smaller AI training corpus than Next; codegen is fine but you babysit more.',
    ],
    when: 'When framework lock-in worries you and you want web-standards primitives.',
    devClass: 'sky',
  },
  {
    id: 'astro',
    name: 'Astro',
    sub: 'islands · MDX · TS',
    color: 'amber',
    deploy: 'Cloudflare · Vercel · static',
    ecosystem: 55,
    aiCodegen: 60,
    perf: 95,
    lockIn: 25,
    bullets: [
      'Ships ~0 KB JS by default; islands hydrate only what needs interactivity.',
      'Best fit for content-heavy products (docs, marketing, dashboards with light interactivity).',
      'Wrong default for app-shaped UI (heavy React state, real-time, complex forms).',
    ],
    when: 'Marketing site / docs / mostly-read product. Not your SaaS app shell.',
    devClass: 'amber',
  },
  {
    id: 'sveltekit',
    name: 'SvelteKit',
    sub: 'runes · TS',
    color: 'orange',
    deploy: 'Cloudflare · Vercel · self-host',
    ecosystem: 50,
    aiCodegen: 55,
    perf: 90,
    lockIn: 70,
    bullets: [
      'Smaller bundles, simpler reactivity model than React.',
      'Smaller AI codegen corpus — you write more by hand, AI helps less reliably.',
      'Hard pivot away later (full rewrite, not incremental migration).',
    ],
    when: 'Solo dev who likes Svelte and accepts smaller AI assist; rarely the right SaaS pick.',
    devClass: 'orange',
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    sub: 'Vue · TS',
    color: 'emerald',
    deploy: 'Vercel · Cloudflare · self-host',
    ecosystem: 60,
    aiCodegen: 65,
    perf: 82,
    lockIn: 70,
    bullets: [
      'Vue + Nitro server. Comfortable if your team already knows Vue.',
      'Solid AI codegen, smaller corpus than React but well-documented.',
      'Same lock-in shape as SvelteKit — you live in Vue-land.',
    ],
    when: 'Existing Vue team. Otherwise stay on the React side.',
    devClass: 'emerald',
  },
];

const AppFrameworkCard = () => {
  const [active, setActive] = useState('next');
  const f = FRAMEWORKS.find(x => x.id === active);
  const metrics = [
    { id: 'ecosystem', label: 'ecosystem mass',         hi: 'broader' },
    { id: 'aiCodegen', label: 'AI-codegen quality',     hi: 'better' },
    { id: 'perf',      label: 'runtime perf',           hi: 'faster' },
    { id: 'lockIn',    label: 'lock-in (lower is better)', hi: 'more portable', invert: true },
  ];

  return (
    <Card id="app" icon={AppWindow} title="App framework" accent="sky" index={2}
          subtitle="React framework still wins on ecosystem mass and AI codegen quality. Pick within React first; only escape if you have a reason.">
      <MinSchema>
        Default is <span className="text-fuchsia-300">Next.js (App Router)</span>. Deviate only when
        you have a concrete reason; ecosystem mass and AI-codegen quality dominate every other axis
        for production-grade SaaS.
      </MinSchema>

      <p>
        The framework decision is now bundled with rendering-mode decisions: <Term>SSR</Term>,{' '}
        <Term>CSR</Term>, <Term>SSG</Term>, <Term>RSC</Term>, and edge vs node runtime are{' '}
        all picked-once-per-route in modern frameworks rather than per-app. So the higher-order
        choice is which framework. Within React, three viable picks; outside React, two more for
        teams who deliberately want them.
      </p>

      <Predict question="Why is 'AI-codegen quality' load-bearing now? Wasn't framework choice always about ergonomics + ecosystem?">
        Because under vibecoding, the AI is generating most of the boilerplate. A framework with a
        massive training corpus (Next.js, Express patterns, Prisma) gets you correct first drafts;
        a niche framework gets you confidently wrong code. The AI can&apos;t tell you it doesn&apos;t
        know. This is a new selection axis that didn&apos;t exist 3 years ago and now sometimes
        outweighs raw runtime performance.
      </Predict>

      {/* tab buttons */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {FRAMEWORKS.map(fw => (
          <button key={fw.id} onClick={() => setActive(fw.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === fw.id
                ? `${chipPalette[fw.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {fw.name}
          </button>
        ))}
      </div>

      {/* active framework detail */}
      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <div>
            <div className={`text-base font-semibold ${chipPalette[f.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {f.name}
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">{f.sub}</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            deploy: <span className="text-neutral-300 normal-case tracking-normal">{f.deploy}</span>
          </div>
        </div>

        {/* metric bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
          {metrics.map(m => {
            const v = f[m.id];
            const display = m.invert ? 100 - v : v;
            return (
              <div key={m.id} className="flex items-center gap-2 text-[11px]">
                <span className="w-32 text-neutral-400">{m.label}</span>
                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    key={`${active}-${m.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${display}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className={`h-full ${chipPalette[f.color].split(' ').find(s => s.startsWith('bg-')).replace('/10', '/60')}`}
                  />
                </div>
                <span className="font-mono w-10 text-right text-neutral-300 tabular-nums">{display}</span>
              </div>
            );
          })}
        </div>

        <ul className="text-[12px] text-neutral-200 leading-snug space-y-1 mt-3">
          {f.bullets.map((b, i) => <li key={i}>· {b}</li>)}
        </ul>

        <div className={`mt-3 rounded border ${chipPalette[f.color].replace(/text-\S+/, '').replace('bg-', 'bg-').split(' ')[0]} bg-white/[0.02] px-3 py-2 text-[11px] text-neutral-300`}>
          <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mr-2">when to pick</span>
          {f.when}
        </div>
      </div>

      <Worked title="Walkthrough · Next.js App Router → Vercel">
        <div>
          A typical request lifecycle: browser hits Vercel edge → routes to nearest region →{' '}
          <Term>RSC</Term> tree starts rendering on the server → server components fetch from{' '}
          <Term>Postgres</Term> via Drizzle (with a pooled connection) → tree streams to the client →
          client components hydrate → <Term>Server Actions</Term> handle mutations without a custom API
          route. End-to-end TypeScript; one repo; one deploy. ~2 weeks from clone to first paying
          customer for a 1-dev team.
        </div>
      </Worked>

      <WhenItMatters>
        Day 1. The cost of switching frameworks at year 2 is a 6-12 week rewrite of every page and
        data-fetching call. Long-half-life choice; it deserves the most thinking-per-decision in the
        whole stack.
      </WhenItMatters>

      <Misconception
        wrong="React Server Components are an over-engineered Vercel power-grab; just SSR with React Query."
        right="RSC moves data-fetching to the server without shipping the fetch code or the data-shaping libraries to the browser. For SaaS dashboards (DB-heavy, low interactivity per page), it's a 30-60% reduction in shipped JS — material for AI-codegen-bloated apps."
        because="The 'just use React Query' alternative ships the full data-fetching layer and the schema-validation lib client-side, which scales badly under AI codegen that tends to over-fetch. RSC is the right default for new code; React Query is fine for the 10% of pages that need genuinely client-driven state."
      />

      <Deeper>
        <p>
          <strong>Why &ldquo;boring + popular&rdquo; wins under AI codegen.</strong>{' '}
          Frontier LLMs are trained on internet-scale code; the conditional probability of correct
          output for a given framework scales with the framework&apos;s share of the training set.
          Next.js is on the order of <Eq>{'10\\times'}</Eq> the corpus of SvelteKit, and the gap
          shows up as fewer hallucinated APIs and more idiomatic patterns. Treat ecosystem mass as
          a first-class selection criterion alongside ergonomics &mdash; this is new since ~2024.
        </p>
        <p>
          <strong>Edge vs Node runtime tradeoff.</strong> Edge functions cold-start in ~50ms vs Lambda&apos;s
          500ms, but lose Node APIs (no <code className="text-amber-300 font-mono">fs</code>, no native
          modules, smaller bundle limits). Default rule: edge for read-heavy public pages, node for
          anything that touches Postgres directly or runs heavyweight libs. RSC routes can mix both.
        </p>
        <p>
          <strong>Hydration cost is the real performance variable.</strong> Server-rendered HTML is fast;
          the slow part is the browser parsing and executing the JS that makes it interactive. A 200KB
          app bundle costs a budget Android phone ~400ms of main-thread time on first load. Astro&apos;s
          islands model wins here for content-heavy sites; RSC + selective client components wins for
          app-shaped sites. Plain SPA wins for nothing &mdash; it pays the full bundle cost on every
          first visit.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I pick a fullstack framework or split frontend + backend?',
          a: 'For 1-3 vibecoding devs on a SaaS / ERP product: bundle them. The split (Next frontend + FastAPI/NestJS backend) makes sense when (a) Python is mandatory for ML inference, (b) backend team and frontend team are different humans, or (c) you need to expose a public API as a primary product surface. None of these are usually true on day 1.' },
        { q: "Won't I outgrow Next.js / Vercel at scale?",
          a: 'You can run Next.js on any container host (Fly, Render, AWS App Runner) without rewriting code; you give up some platform-specific features (Edge, image optimization). The "outgrew Vercel" stories are almost all hosting-tier swaps, not framework rewrites. The framework lock-in is much weaker than people fear.' },
        { q: "What about HTMX / server-rendered HTML + minimal JS?",
          a: 'Genuinely viable for ERP-shaped products with mostly form-driven UI. The constraint is: AI codegen is much weaker for HTMX-shaped patterns than for React, so you trade runtime simplicity for codegen friction. For a vibecoding flow, that tradeoff usually goes the wrong way — but if you have a Rails/Phoenix/Django background and want to lean into it, htmx + Hotwire is a defensible pick.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   03 — BACKEND & API SHAPE
   What ships between the browser and the database. Type safety is the modern
   axis; "fullstack-bundled vs split" is the size-of-team axis.
   ========================================================================== */

const API_OPTIONS = [
  {
    id: 'srv-actions',
    name: 'Server Actions',
    sub: 'Next.js / Remix',
    color: 'fuchsia',
    typeSafety: 100,
    portability: 30,
    cognitiveLoad: 20,
    blurb: 'Function on the server, called like a local function from the client. No RPC layer. End-to-end TS for free, but tied to your framework.',
    when: 'Default for fullstack-bundled apps. Lowest cognitive load.',
    avoid: 'When you need a public API surface or non-browser clients.',
  },
  {
    id: 'trpc',
    name: 'tRPC',
    sub: 'TS RPC',
    color: 'sky',
    typeSafety: 100,
    portability: 50,
    cognitiveLoad: 35,
    blurb: 'Server functions in a typed router; client gets full inference. Framework-agnostic. The "RPC explicit" version of Server Actions.',
    when: 'Split frontend + backend, both TypeScript, monorepo.',
    avoid: 'Non-TS clients or public-facing API.',
  },
  {
    id: 'rest-zod',
    name: 'REST + Zod (Hono / Elysia)',
    sub: 'OpenAPI gen',
    color: 'violet',
    typeSafety: 75,
    portability: 95,
    cognitiveLoad: 50,
    blurb: 'Plain HTTP routes, Zod schemas at boundaries, OpenAPI generated. Hono on Cloudflare Workers / Bun is the modern incarnation.',
    when: 'Public API, polyglot clients, or edge-runtime backends.',
    avoid: 'Single-team fullstack apps where tRPC is strictly less code.',
  },
  {
    id: 'fastapi',
    name: 'FastAPI / NestJS',
    sub: 'Python / Node',
    color: 'emerald',
    typeSafety: 70,
    portability: 90,
    cognitiveLoad: 55,
    blurb: 'Heavyweight backend frameworks with built-in validation, DI, and OpenAPI. The "real backend" pick when ML inference or enterprise structure is mandatory.',
    when: 'Python ML in the request path, or large team wants opinionated structure.',
    avoid: 'Small team where the framework adds more ceremony than value.',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    sub: 'Apollo / Yoga',
    color: 'amber',
    typeSafety: 85,
    portability: 75,
    cognitiveLoad: 70,
    blurb: 'Query language; clients ask for the shape they want. Solves over-fetching for fat mobile/web clients. Heavy operational tax (caching, N+1).',
    when: 'Multiple consumer clients (web + mobile + partners) on the same schema.',
    avoid: 'Single web client. The complexity rarely earns its keep.',
  },
];

const BackendApiCard = () => {
  const [active, setActive] = useState('srv-actions');
  const o = API_OPTIONS.find(x => x.id === active);

  return (
    <Card id="api" icon={Cable} title="Backend & API shape" accent="sky" index={3}
          subtitle="Two questions: bundle frontend+backend, or split? And how strong is the type contract between them?">
      <MinSchema>
        For a 1-3 dev fullstack SaaS, default to <span className="text-fuchsia-300">Server Actions</span>{' '}
        (or <Term>tRPC</Term> if you split). Anything REST/<Term>GraphQL</Term> shaped is overhead unless
        you have a non-browser client.
      </MinSchema>

      <p>
        End-to-end <Term>TypeScript</Term> is the production-grade default; the API layer&apos;s job is
        to preserve it from server to client without a manual schema in between. Five plausible shapes,
        ranked by type-safety, portability, and cognitive load.
      </p>

      {/* tab selector */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {API_OPTIONS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <div>
            <div className={`text-base font-semibold ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {o.name}
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">{o.sub}</div>
          </div>
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>

        {/* radar-ish bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3">
          {[
            { id: 'typeSafety', label: 'type safety', color: 'emerald' },
            { id: 'portability', label: 'portability', color: 'sky' },
            { id: 'cognitiveLoad', label: 'cog. load (lower = better)', color: 'rose', invert: true },
          ].map(m => {
            const v = o[m.id];
            const display = m.invert ? 100 - v : v;
            return (
              <div key={m.id}>
                <div className="text-[10px] text-neutral-500 mb-1">{m.label}</div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    key={`${active}-${m.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${display}%` }}
                    transition={{ duration: 0.4 }}
                    className={`h-full ${chipPalette[m.color].split(' ').find(s => s.startsWith('bg-')).replace('/10', '/60')}`}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 font-mono tabular-nums">{display}/100</div>
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mb-0.5">when to pick</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.when}</div>
          </div>
          <div className="rounded border border-rose-400/20 bg-rose-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-rose-300 mb-0.5">when to avoid</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.avoid}</div>
          </div>
        </div>
      </div>

      <WhenItMatters>
        Whenever you&apos;re tempted to write a hand-rolled REST endpoint between your own frontend and
        backend. That&apos;s a sign you should be using <Term>Server Actions</Term> or <Term>tRPC</Term>
        instead &mdash; you&apos;re paying schema-maintenance tax for portability you don&apos;t need.
      </WhenItMatters>

      <Misconception
        wrong="REST is the safe choice — it's the most portable and AI knows it best."
        right="REST loses the type contract at the boundary. AI codegen will happily emit a frontend type that diverges from the backend Zod schema, and you find out at runtime. tRPC / Server Actions enforce alignment at compile time — fewer prod incidents under heavy AI codegen."
        because="The cost of a typed contract isn't paid by the dev — it's paid by the integration error that AI introduced when it confidently shaped the response wrong. That error budget is way bigger in vibecoded code than in hand-written code."
      />

      <Deeper>
        <p>
          <strong>Server Actions are tRPC with the RPC layer removed.</strong>{' '}
          A Server Action is a server-only function that React serializes a callable handle for.
          The browser calls it like <code className="text-amber-300 font-mono">{`await createOrder(args)`}</code>{' '}
          and React POSTs to a generated endpoint. tRPC is the same idea but with an explicit router
          object you reference by path. Server Actions wins on ceremony; tRPC wins on debuggability and
          framework portability.
        </p>
        <p>
          <strong>The split-backend case for production-grade SaaS.</strong>{' '}
          You usually want a split if (a) Python is mandatory in the request path (heavy ML inference,
          numerical workloads, scientific libs), (b) you need the backend to expose a public API as a
          first-class product surface, or (c) frontend and backend are owned by separate teams. None of
          these are usually true on day 1; many never become true. Premature splitting doubles your
          deploy targets, halves your dev velocity.
        </p>
        <p>
          <strong>GraphQL&apos;s role in 2026.</strong>{' '}
          Mostly inherited from a multi-client past. New green-field projects rarely pick GraphQL today
          unless they&apos;re Shopify-shaped (huge schema, many consumers). The operational cost
          (caching, N+1 detection, persisted queries) is higher than people remember.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Do I still need a separate "API" if I use Server Actions?',
          a: 'Not for first-party callers (your own frontend). You\'ll grow one when (a) a third party needs to integrate, (b) you build a mobile app, or (c) you sell webhooks. At that point add a thin REST surface with Hono — it composes fine alongside Server Actions.' },
        { q: 'Can I run FastAPI as a sidecar for ML inference but keep Next.js for everything else?',
          a: 'Yes — this is the most common "hybrid" shape. Next.js handles user requests + DB + auth; a FastAPI service handles ML inference, called from Next.js via fetch. Two deploy targets, but each one stays simple. tRPC and Hono can also do this with a Python sidecar.' },
        { q: 'How does AI codegen friendliness rank these?',
          a: 'tRPC > Server Actions > REST + Zod > FastAPI > GraphQL. tRPC has the cleanest patterns and a huge corpus; Server Actions is newer but well-documented. REST + Zod is fine but ad-hoc. GraphQL codegen is the most error-prone — schemas drift silently.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   04 — DATABASE
   The single most load-bearing 5-year decision. Postgres is correct for
   ~95% of production-grade SaaS; the hard part is internalizing why.
   ========================================================================== */

const DB_OPTIONS = [
  {
    id: 'pg',  name: 'Postgres',
    chips: ['ACID', 'JSON', 'pgvector', 'FTS'],
    score: { fit: 95, scale: 90, ergonomics: 80, ai: 95 },
    blurb: 'Relational, ACID, with native vector + full-text + JSONB. Replication, PITR, mature operationally. The default; deviations need a reason.',
    color: 'fuchsia',
    when: 'Default. SaaS / ERP / multi-tenant / vector-needing.',
    avoid: 'Edge-first (latency-critical reads from many regions) → consider Turso.',
  },
  {
    id: 'sqlite', name: 'SQLite + Litestream',
    chips: ['ACID', 'embedded', 'tiny ops'],
    score: { fit: 70, scale: 50, ergonomics: 95, ai: 75 },
    blurb: 'A file. Litestream replicates it to S3 continuously. Surprisingly good fit for many B2B SaaS up to 10k users on a single box.',
    color: 'emerald',
    when: 'Single-region B2B with modest concurrency. The "boring choice that wins" pick.',
    avoid: 'Concurrent writers > a few hundred per second; multi-region.',
  },
  {
    id: 'turso', name: 'Turso (libSQL)',
    chips: ['SQLite-compat', 'edge replicas'],
    score: { fit: 75, scale: 70, ergonomics: 85, ai: 65 },
    blurb: 'Distributed SQLite with read replicas at the edge. SQLite semantics with Postgres-class scaling for read-heavy workloads.',
    color: 'sky',
    when: 'Edge-first read-heavy apps; embedded read-only data per-tenant.',
    avoid: 'Heavy multi-statement transactions; pgvector-class workloads.',
  },
  {
    id: 'planetscale', name: 'PlanetScale / TiDB',
    chips: ['MySQL', 'horizontal'],
    score: { fit: 60, scale: 95, ergonomics: 70, ai: 75 },
    blurb: 'MySQL-compatible distributed SQL. Horizontal scaling without the Postgres pain. No FK constraints by default; loses some Postgres niceties.',
    color: 'violet',
    when: 'You\'re already at horizontal-scaling pain (rare) and want the managed path.',
    avoid: 'Day 1 — premature scaling. Postgres handles 5+ years for most SaaS.',
  },
  {
    id: 'mongo', name: 'MongoDB',
    chips: ['document', 'flexible'],
    score: { fit: 35, scale: 80, ergonomics: 65, ai: 70 },
    blurb: 'Document store; schemaless. Was the trendy default in 2015; rarely the right pick now. Multi-tenancy and joins are pain.',
    color: 'amber',
    when: 'Genuinely document-shaped data, no relational constraints.',
    avoid: 'Anything that looks like a SaaS / ERP — you will write your own join layer.',
  },
];

const DatabaseCard = () => {
  const [active, setActive] = useState('pg');
  const o = DB_OPTIONS.find(x => x.id === active);
  const dims = [
    { id: 'fit',        label: 'fit (B2B SaaS)',  c: 'fuchsia' },
    { id: 'scale',      label: 'horizontal scale', c: 'sky' },
    { id: 'ergonomics', label: 'ops ergonomics',   c: 'emerald' },
    { id: 'ai',         label: 'AI codegen',       c: 'violet' },
  ];

  return (
    <Card id="db" icon={Database} title="Database" accent="violet" index={4}
          subtitle="The 5-year decision. Postgres is correct ~95% of the time; the discipline is recognizing the 5% where it isn't.">
      <MinSchema>
        Default is <span className="text-fuchsia-300">PostgreSQL</span>. It has{' '}
        <Term>pgvector</Term> for embeddings, JSONB for flex schemas, full-text search, and 30 years
        of replication / backup / tooling. Deviations need a stated reason.
      </MinSchema>

      <p>
        DB choice is the only stack decision that compounds across every other decision &mdash;
        ORM, hosting, jobs, RAG layer, eval, multi-tenancy model all ride on it. Switching DB at year 2
        costs ~6-12 weeks of careful migration plus a high-risk cutover. Get it right; leave it alone.
      </p>

      <Predict question="Why does Postgres beat MongoDB for almost all SaaS, even document-flexible-schema apps?">
        Because <em>your data has relationships you don&apos;t fully see yet</em>. The first time
        you need to "give me all users in org X who triggered event Y in the last 7 days" without
        knowing org X has 10k users, MongoDB makes you write the join in app code. Postgres has
        JSONB columns when you genuinely want schemaless; you don&apos;t lose flexibility, you gain joins.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {DB_OPTIONS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <div>
            <div className={`text-base font-semibold ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {o.name}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {o.chips.map(c => <Chip key={c} color={o.color}>{c}</Chip>)}
            </div>
          </div>
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>

        {/* 4-dim radar */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 my-3">
          {dims.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-28 text-neutral-400">{d.label}</span>
              <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  key={`${active}-${d.id}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${o.score[d.id]}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full ${chipPalette[d.c].split(' ').find(s => s.startsWith('bg-')).replace('/10', '/60')}`}
                />
              </div>
              <span className="font-mono w-10 text-right text-neutral-300 tabular-nums">{o.score[d.id]}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mb-0.5">when to pick</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.when}</div>
          </div>
          <div className="rounded border border-rose-400/20 bg-rose-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-rose-300 mb-0.5">when to avoid</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.avoid}</div>
          </div>
        </div>
      </div>

      <Worked title="Managed Postgres providers">
        <div className="grid sm:grid-cols-2 gap-2">
          <div><Chip color="sky">Neon</Chip> &mdash; serverless Postgres, branchable. Best for preview-deploys.</div>
          <div><Chip color="emerald">Supabase</Chip> &mdash; Postgres + auth + realtime + storage in one console. Solid Day 1 pick.</div>
          <div><Chip color="violet">RDS / Aurora</Chip> &mdash; AWS native, expensive, mature. The enterprise default.</div>
          <div><Chip color="amber">Fly Postgres / Railway</Chip> &mdash; managed VM with Postgres, cheap, light ops.</div>
        </div>
      </Worked>

      <WhenItMatters>
        Day 1 of design. Schema choices made now propagate to every API, every cache invalidation, every
        report. Multi-tenancy especially &mdash; shared-schema with a <code className="text-amber-300 font-mono">tenant_id</code>{' '}
        column is the right default; per-tenant schema or per-tenant DB are operational nightmares
        masquerading as &ldquo;security&rdquo;. <CrossLink to="auth" recap="Auth & multi-tenancy: org-team-user model.">auth & tenancy</CrossLink> connects here.
      </WhenItMatters>

      <Misconception
        wrong="I'll start on MongoDB / Firestore because my schema isn't stable yet."
        right="Postgres with JSONB columns is more flexible than schemaless stores, because you can add real columns when the schema crystallizes — without rewriting consumers. Schemaless DBs trade upfront flexibility for late-stage rigidity."
        because="The schema always crystallizes. The question is whether you crystallize it inside the DB (constraints, indexes, FKs you can rely on) or in app code (validation scattered across files, drift between services). Postgres lets you defer crystallization without giving it up."
      />

      <Deeper>
        <p>
          <strong>pgvector changes the AI-native calculus.</strong>{' '}
          Three years ago, &ldquo;I need vector search&rdquo; meant adding Pinecone (a second system,
          separate auth, separate billing). Today, Postgres with the <code className="text-amber-300 font-mono">vector</code>{' '}
          extension and an HNSW index does <Eq>k</Eq>-NN over millions of embeddings in single-digit
          milliseconds. For most SaaS-scale RAG corpora it&apos;s strictly better than running a
          dedicated vector DB. <CrossLink to="rag" recap="RAG card: pgvector vs Pinecone vs Turbopuffer comparison.">deeper in RAG card</CrossLink>.
        </p>
        <p>
          <strong>Multi-tenancy patterns in one paragraph.</strong>{' '}
          Three options: (1) shared schema with <Eq>{'\\text{tenant\\_id}'}</Eq> on every row + RLS
          policies on Postgres &mdash; the default, works to ~10k tenants; (2) schema-per-tenant &mdash;
          isolation, but every migration runs N times; (3) DB-per-tenant &mdash; for genuinely huge
          tenants (legal/compliance), each gets their own RDS instance. Pick (1) until a customer pays
          you to do (3); never do (2).
        </p>
        <p>
          <strong>Postgres scaling story is calmer than people fear.</strong>{' '}
          Single-instance Postgres (with read replicas) handles ~10k QPS reads and ~1-2k QPS writes on
          modern hardware before you need to think hard. That&apos;s on the order of 1-10M MAU for a
          typical SaaS. By the time you outgrow it, you have the resources to migrate to Citus, AlloyDB,
          or shard at the app layer. &ldquo;Postgres won&apos;t scale&rdquo; is a 2010-vintage worry.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Should I use Supabase or just Postgres directly?',
          a: 'Supabase if you want auth + storage + realtime in one console (saves 1-2 weeks of setup). Postgres directly (Neon, RDS, Fly) if you already have those covered or want fewer vendor dependencies. Both are real Postgres — you can move between them.' },
        { q: 'What about a separate timeseries DB for metrics / event data?',
          a: 'Postgres + TimescaleDB extension covers most of it. Add ClickHouse only when (a) you\'re ingesting >10k events/sec sustained, (b) you need OLAP queries over billions of rows. Most SaaS analytics workloads fit comfortably in plain Postgres for the first few years.' },
        { q: 'Sqlite + Litestream — is that really viable for production SaaS?',
          a: 'Yes — for single-region B2B with moderate concurrency (Plausible Analytics is a public example). You give up: easy multi-region, easy multi-writer, mature replication tooling. You gain: ~$5/month hosting, near-zero ops. It\'s a real choice, not a toy.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   05 — ORM & MIGRATIONS
   How TS code talks to Postgres, and how schema changes ship to production.
   The "type-safety vs SQL-likeness" tradeoff and the "expand-contract" doctrine.
   ========================================================================== */

const ORM_OPTIONS = [
  {
    id: 'drizzle', name: 'Drizzle',
    color: 'fuchsia',
    abstraction: 30, typeSafety: 95, escape: 95, ai: 80,
    blurb: 'TypeScript query builder. Schema in TS, queries look like SQL, output types are inferred. The current sweet spot for fullstack TS apps.',
    when: 'Default for new TS projects. Especially with Postgres + edge runtime.',
    avoid: 'Team strongly prefers an "object" feel over a "query" feel.',
  },
  {
    id: 'prisma', name: 'Prisma',
    color: 'sky',
    abstraction: 75, typeSafety: 90, escape: 70, ai: 95,
    blurb: 'Schema-first ORM with generated client. Best DX, biggest training corpus. Heavier — generates a Rust query engine binary by default; pure-JS in newer versions.',
    when: 'Team is more comfortable with ORM-shaped APIs; AI codegen quality matters most.',
    avoid: 'Edge runtime constraints; hairy queries (joins-on-joins), where you fall through to raw SQL anyway.',
  },
  {
    id: 'kysely', name: 'Kysely',
    color: 'sky',
    abstraction: 25, typeSafety: 95, escape: 100, ai: 65,
    blurb: 'Pure TS query builder. SQL-shaped, fully typed from a generated DB schema. The "I want SQL, but typed" pick.',
    when: 'You like raw SQL; want types without abstraction.',
    avoid: 'Want migrations and seed-tooling out of the box (Kysely is bring-your-own).',
  },
  {
    id: 'sql', name: 'Raw SQL + types',
    color: 'amber',
    abstraction: 0, typeSafety: 70, escape: 100, ai: 70,
    blurb: 'Postgres.js / pg + hand-typed query results, or pgtyped to generate types from .sql files. Maximum control, minimum abstraction.',
    when: 'Senior backend team; complex queries; performance-critical hot paths.',
    avoid: 'Vibecoding without strong SQL expertise — typos compound.',
  },
];

const MIGRATION_TOOLS = [
  { name: 'Drizzle Kit',  blurb: 'auto-generated migrations from schema diffs · the default with Drizzle' },
  { name: 'Prisma Migrate',blurb: 'declarative schema, generated SQL, prod-grade' },
  { name: 'Atlas',        blurb: 'declarative schema, multi-DB; standalone (works with any ORM)' },
  { name: 'Sqitch',       blurb: 'imperative SQL migrations; deploys / reverts; favored by DBA-heavy shops' },
];

const OrmMigrationsCard = () => {
  const [active, setActive] = useState('drizzle');
  const o = ORM_OPTIONS.find(x => x.id === active);
  const dims = [
    { id: 'abstraction', label: 'abstraction depth', c: 'violet' },
    { id: 'typeSafety',  label: 'type safety',       c: 'emerald' },
    { id: 'escape',      label: 'escape hatch',      c: 'sky' },
    { id: 'ai',          label: 'AI codegen',        c: 'fuchsia' },
  ];

  return (
    <Card id="orm" icon={Table2} title="ORM & migrations" accent="violet" index={5}
          subtitle="The data-access layer + the discipline that ships schema changes safely.">
      <MinSchema>
        Default is <span className="text-fuchsia-300">Drizzle</span> for new TS projects;{' '}
        <Term>Prisma</Term> if AI-codegen quality is paramount. Migrations are <em>forward-only</em>{' '}
        and follow <Term>expand-contract</Term> &mdash; never destructive in one release.
      </MinSchema>

      <p>
        Two sub-decisions live here. The data-access library &mdash; query-builder vs ORM vs raw SQL
        &mdash; trades abstraction depth against type safety and escape-hatch availability. The migration
        tool decides how schema changes get reviewed, applied, and rolled forward.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ORM_OPTIONS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className={`text-base font-semibold mb-2 ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
          {o.name}
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 my-3">
          {dims.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-28 text-neutral-400">{d.label}</span>
              <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  key={`${active}-${d.id}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${o[d.id]}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full ${chipPalette[d.c].split(' ').find(s => s.startsWith('bg-')).replace('/10', '/60')}`}
                />
              </div>
              <span className="font-mono w-10 text-right text-neutral-300 tabular-nums">{o[d.id]}</span>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mb-0.5">when to pick</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.when}</div>
          </div>
          <div className="rounded border border-rose-400/20 bg-rose-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-rose-300 mb-0.5">when to avoid</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{o.avoid}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">migration tooling</div>
        <ul className="text-[12px] text-neutral-200 space-y-1.5">
          {MIGRATION_TOOLS.map(t => (
            <li key={t.name} className="flex items-baseline gap-2">
              <span className="font-mono text-violet-300 w-28 shrink-0">{t.name}</span>
              <span className="text-neutral-300 leading-snug">{t.blurb}</span>
            </li>
          ))}
        </ul>
      </div>

      <Worked title="Expand-contract migration · adding a NOT NULL column">
        <ol className="list-decimal pl-4 space-y-1">
          <li><span className="text-emerald-300">Expand:</span> add the column nullable. Deploy.</li>
          <li><span className="text-emerald-300">Backfill:</span> background job sets values for old rows. Idempotent, batched.</li>
          <li><span className="text-emerald-300">Dual-write:</span> code writes both old and new representation. Deploy.</li>
          <li><span className="text-emerald-300">Read-from-new:</span> code reads from new column. Deploy + monitor.</li>
          <li><span className="text-emerald-300">Contract:</span> drop old column, add NOT NULL. Deploy.</li>
        </ol>
        <div className="text-[11px] text-neutral-400 mt-2">
          Five deploys instead of one &mdash; but zero downtime, zero in-flight broken requests, fully reversible at every step.
        </div>
      </Worked>

      <WhenItMatters>
        Every schema change in production. The single-deploy &ldquo;just <code className="text-amber-300 font-mono">ALTER TABLE</code> it&rdquo;
        approach is fine on day 1 but corrupts data on day 200 when there are in-flight requests during deploy.
        Establish the discipline early.
      </WhenItMatters>

      <Misconception
        wrong="ORMs are an anti-pattern; you should always write raw SQL for production code."
        right="The 'never use ORMs' meme is from a 2010-era pain (slow N+1 queries, leaky abstractions). Modern TS query builders (Drizzle, Kysely) compile to readable SQL, are zero-runtime-cost, and produce correct types. The real anti-pattern is falling back to JS-side filtering when SQL would do it."
        because="The cost an ORM saves is hand-shaping return types. The cost it incurs is a learning curve and the occasional fight with hairy queries. For TS-end-to-end stacks, that trade is worth it 95% of the time. Keep the escape hatch (raw SQL with `sql` template tags) for the 5%."
      />

      <Deeper>
        <p>
          <strong>Why forward-only migrations.</strong> Reversible migrations look elegant but lie:
          you can&apos;t un-drop a column once data has flowed through it. The honest model is&nbsp;
          (i)&nbsp;every change is forward-only, (ii)&nbsp;destructive changes go through expand-contract,
          (iii)&nbsp;rollback is a forward migration that re-adds the dropped state, not a runtime
          undo. This pairs with feature flags &mdash; the flag controls when readers switch to the new
          column, independent of the migration deploy.
        </p>
        <p>
          <strong>Connection pooling is non-negotiable on serverless.</strong>{' '}
          Every Lambda invocation that opens a Postgres connection is a connection your DB has to
          maintain. At 1k concurrent invocations you exhaust Postgres&apos; default 100-connection
          limit immediately. Fix: a pooler (PgBouncer, Supabase Pooler, Neon&apos;s built-in) sits
          between Lambda and Postgres, multiplexes thousands of client connections onto dozens of
          server connections.
        </p>
        <p>
          <strong>The escape hatch matters more than people realize.</strong>{' '}
          Every ORM has a query that&apos;s painful in its DSL and trivial in raw SQL. Drizzle, Kysely,
          and Prisma all expose <code className="text-amber-300 font-mono">sql`...`</code> template
          tags that return typed results. Using them for the 5% of hard queries is fine, not a defeat.
          The library is a productivity tool, not a contract that bans SQL.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Drizzle vs Prisma — what actually decides it for me?',
          a: 'Drizzle if you (a) want edge-runtime support, (b) prefer SQL-shaped APIs, (c) value smaller bundles. Prisma if you (a) want the strongest AI-codegen support, (b) like schema-first DX with a generated client, (c) are on Node only. Both are correct picks; this is a taste decision, not a correctness one.' },
        { q: 'When should I write a raw SQL migration vs use the ORM\'s migration tool?',
          a: 'Use the ORM tool for schema-shape changes (add column, add table, add index). Drop to raw SQL for: data backfills, complex constraint changes, anything touching extensions (pgvector, pg_cron). Most migration tools accept hand-written SQL files alongside generated ones.' },
        { q: 'What\'s the actual cost of switching ORMs at year 2?',
          a: 'Roughly 1-3 weeks of focused work for a medium-sized codebase. Your queries port mechanically; the painful part is re-validating types and re-running the test suite. Much cheaper than switching DBs. So this is an "easy to revisit" choice — don\'t agonize.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   06 — AUTH & MULTI-TENANCY
   The "real customers" gate. Three sub-decisions: (1) auth provider,
   (2) tenancy data model, (3) authz enforcement layer.
   ========================================================================== */

const AUTH_PROVIDERS = [
  {
    id: 'clerk', name: 'Clerk',
    color: 'fuchsia',
    blurb: 'Hosted auth + UI components + B2B (orgs, invitations) + SSO add-on. The fastest day-1 pick.',
    cost: '$25/mo + per-MAU',
    pros: ['Drop-in <SignIn/> components', 'Org / team / role primitives built-in', 'SSO/SAML add-on for enterprise tier'],
    cons: ['Hosted (your users hit Clerk)', 'Per-MAU pricing scales painfully'],
    fit: 'B2B SaaS, ERP, day-1 to ~100k MAU.',
  },
  {
    id: 'workos', name: 'WorkOS',
    color: 'violet',
    blurb: 'Auth + SSO/SAML/SCIM as the headline product. The "we want enterprise customers" pick.',
    cost: 'free tier; SSO billed per connection',
    pros: ['Best SSO/SAML/SCIM story in the industry', 'AuthKit gives Clerk-like DX', 'Enterprise-shaped from day 1'],
    cons: ['Less polished consumer-auth flow', 'Pricing assumes you sell enterprise'],
    fit: 'B2B SaaS targeting mid-market+ from day 1.',
  },
  {
    id: 'supabase', name: 'Supabase Auth',
    color: 'emerald',
    blurb: 'Bundled with Supabase Postgres. Free, capable, integrates with Postgres RLS for tenant isolation.',
    cost: 'free; bundled with Supabase',
    pros: ['Free with the DB', 'RLS policies enforce tenancy at DB layer', 'OAuth / magic-link / passwords'],
    cons: ['Tied to Supabase', 'B2B org primitives are bring-your-own', 'SSO is paid tier'],
    fit: 'Already on Supabase. Consumer or simple B2B.',
  },
  {
    id: 'authjs', name: 'Auth.js (NextAuth)',
    color: 'sky',
    blurb: 'Open-source auth lib. Self-hosted; you own the user table. The "no vendor" pick.',
    cost: 'free (self-host)',
    pros: ['No vendor lock-in', 'Free', 'OAuth provider zoo'],
    cons: ['You build orgs / RBAC / SSO yourself', 'Production-hardening is your job', 'B2B story is weak out of box'],
    fit: 'Indie / consumer / OSS where vendor cost > engineering cost.',
  },
  {
    id: 'keycloak', name: 'Keycloak / Ory',
    color: 'amber',
    blurb: 'Self-hosted IDPs with full SSO/OIDC/SAML. Heaviest ops burden; most control.',
    cost: 'free + ops time',
    pros: ['Full enterprise feature set', 'Run in your VPC for compliance'],
    cons: ['Heavy ops', 'Slow to set up', 'Overkill for most SaaS'],
    fit: 'Compliance / data-residency-mandated; team has SRE capacity.',
  },
];

const TENANCY_PATTERNS = [
  { name: 'Shared schema + tenant_id',
    pros: 'Cheapest. One DB, one schema. RLS in Postgres enforces isolation.',
    cons: 'Noisy-neighbor risk; one giant tenant can hurt others.',
    when: 'Default. Up to ~10k tenants.', color: 'fuchsia' },
  { name: 'Schema per tenant',
    pros: 'Slightly stronger isolation; easy "give me this customer\'s data".',
    cons: 'Migrations run N times. Connection-pool gymnastics. Operational nightmare.',
    when: 'Almost never. Picked by accident, regretted later.', color: 'rose' },
  { name: 'DB per tenant',
    pros: 'Real isolation; per-customer compliance and backup posture.',
    cons: 'N RDS instances. N migrations. Costly per tenant.',
    when: 'Enterprise customer requires it (legal, residency).', color: 'violet' },
];

const AuthTenancyCard = () => {
  const [active, setActive] = useState('clerk');
  const p = AUTH_PROVIDERS.find(x => x.id === active);

  return (
    <Card id="auth" icon={KeyRound} title="Auth & multi-tenancy" accent="emerald" index={6}
          subtitle="The 'we want real customers' gate. Three sub-decisions: provider, tenancy model, authz layer.">
      <MinSchema>
        Default <span className="text-fuchsia-300">Clerk</span> if you want the fastest path to working
        B2B auth; <span className="text-violet-300">WorkOS</span> if you sell to enterprise from day 1;
        Supabase Auth if you&apos;re already on Supabase. <em>Tenancy</em>: shared schema with{' '}
        <code className="text-amber-300 font-mono">tenant_id</code> + Postgres RLS.
      </MinSchema>

      <p>
        Auth is the layer where deviations from the right default cost the most engineering. Three
        traps: (1) rolling your own (2× harder than it looks), (2) picking a tenancy pattern that
        scales worse than you expect, (3) treating <Term>SSO</Term>/<Term>SAML</Term> as &ldquo;we&apos;ll
        add it later&rdquo; when 60% of mid-market RFPs require it.
      </p>

      <Predict question="A B2B prospect asks 'do you support SSO?'. They're paying $40k/yr. How long does it take to ship if (a) you're on Clerk, (b) you're on Auth.js?">
        Clerk: a few hours (toggle SSO on the org, paste the IdP metadata). Auth.js: 2-4 weeks (parse
        SAML, support multiple IdPs per org, build the config UI, security review). The price of this
        feature is exactly the price of choosing the wrong auth provider on day 1.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {AUTH_PROVIDERS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <div className={`text-base font-semibold ${chipPalette[p.color].split(' ').find(s => s.startsWith('text-'))}`}>
            {p.name}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">{p.cost}</div>
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{p.blurb}</div>
        <div className="grid sm:grid-cols-2 gap-2">
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {p.pros.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {p.cons.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[11px] text-neutral-200">
          <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mr-2">fit</span>
          {p.fit}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">tenancy data model</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {TENANCY_PATTERNS.map(t => (
            <div key={t.name} className={`rounded-lg border ${chipPalette[t.color].split(' ').find(s => s.startsWith('border-'))} bg-white/[0.02] p-3`}>
              <div className={`text-[12px] font-semibold ${chipPalette[t.color].split(' ').find(s => s.startsWith('text-'))} mb-1`}>
                {t.name}
              </div>
              <div className="text-[10px] text-neutral-300 leading-snug mb-1"><span className="text-emerald-300">+</span> {t.pros}</div>
              <div className="text-[10px] text-neutral-300 leading-snug mb-1"><span className="text-rose-300">−</span> {t.cons}</div>
              <div className="text-[10px] text-neutral-500 italic mt-1">{t.when}</div>
            </div>
          ))}
        </div>
      </div>

      <WhenItMatters>
        Day 1. The cost of swapping auth providers at year 1 is one of the highest-leverage tasks in
        the whole stack &mdash; user IDs propagate everywhere, sessions break, billing tied to user-IDs
        breaks. Pick deliberately; this is a <span className="text-fuchsia-300">5-year decision</span>.
      </WhenItMatters>

      <Misconception
        wrong="Rolling our own auth is fine — Auth.js / Lucia is just a few hundred lines."
        right="Auth itself is a few hundred lines. The B2B feature surface (orgs, invitations, role transfer, SSO, SCIM, audit logs, MFA recovery, account deletion) is several thousand lines AND a security audit. That's what you're paying Clerk / WorkOS to maintain."
        because="The 'just write your own auth' Twitter takes don't count the production-grade tail. Edge cases there are the highest-stakes bugs you can ship — the cost of one auth bug at scale exceeds 5 years of Clerk's MAU bill."
      />

      <Deeper>
        <p>
          <strong>RBAC vs ABAC, in three sentences.</strong> <Term>RBAC</Term>: users get roles, roles
          get permissions. <Term>ABAC</Term>: permissions are computed from attributes (department,
          resource ownership, time of day) at request time. Default to RBAC for SaaS &mdash; auditable,
          AI-friendly, sufficient. Reach for ABAC only when the same role legitimately has different
          permissions on different resources (think Notion-style page permissions).
        </p>
        <p>
          <strong>Postgres Row-Level Security as the tenancy backbone.</strong>{' '}
          With shared-schema multi-tenancy, the foot-gun is &ldquo;forgot to filter by{' '}
          <code className="text-amber-300 font-mono">tenant_id</code>&rdquo;. Postgres RLS lets you
          declare that <em>every</em> query against a table must include a tenant predicate, enforced
          at the DB. Set <code className="text-amber-300 font-mono">SET LOCAL app.tenant_id = ...</code>{' '}
          per request; policies do the rest. Your application code can&apos;t accidentally leak data
          across tenants &mdash; the DB refuses.
        </p>
        <p>
          <strong>Centralized authz services (OPA, Cedar, Oso, OpenFGA).</strong>{' '}
          For ABAC-shaped products with complex authorization (Notion, Linear, GitHub) you eventually
          want to extract authz to a typed policy layer. AuthZed (SpiceDB / OpenFGA) implements Google&apos;s
          Zanzibar paper. Day 1 you don&apos;t need this; year 2 you might. Don&apos;t pre-build it.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Clerk vs WorkOS — how do I choose?',
          a: 'If your buyer is a person (PLG, SMB), default Clerk — better consumer flow, faster setup. If your buyer is procurement (enterprise, SOC 2 in their RFP), default WorkOS — SSO/SCIM are first-class. Both can power the same auth surface; the difference is which feature set is "free" and which costs you a tier upgrade.' },
        { q: 'Should I add SSO before or after I have an enterprise pipeline?',
          a: "Before, if you're using Clerk/WorkOS — it's a config flip, costs almost nothing. After, if you're on Auth.js — it's 2-4 weeks of work, do it when you have a paying enterprise customer in hand who'll close on it. The auth provider choice front-loads or back-loads this." },
        { q: 'How do I handle audit logs for SOC 2?',
          a: 'Two options: (1) emit structured events to a log pipeline (Axiom, Datadog) and query/export when auditors ask, (2) write to a dedicated audit_log table in your DB. Both work. (1) scales better for high-volume; (2) is easier to reason about. WorkOS / Vanta / Drata abstract the SOC 2 evidence collection on top.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   07 — HOSTING & INFRA
   PaaS vs container-host vs cloud-native. The "when you don't need K8s"
   discipline (almost always). Cost lines on a 2-axis log plot.
   ========================================================================== */

const HOSTING_OPTIONS = [
  {
    id: 'vercel', name: 'Vercel',
    color: 'fuchsia',
    layer: 'PaaS · framework-native',
    blurb: 'The Next.js company\'s cloud. Edge runtime, ISR, image optimization, preview deploys. Easiest day-1 deploy; pay-as-you-grow gets expensive at scale.',
    cost10: '$20', cost100: '$200', cost10k: '$2-5k',
    pros: ['Best Next.js DX', 'Zero-config edge functions', 'Preview URL per PR'],
    cons: ['Bandwidth pricing surprises', 'Function execution caps', 'Lock-in to Vercel APIs'],
  },
  {
    id: 'cloudflare', name: 'Cloudflare',
    color: 'amber',
    layer: 'edge-first PaaS',
    blurb: 'Workers + Pages + D1 + R2 + Durable Objects. Edge-runtime first; cheapest at scale. Constraints: no Node APIs, smaller bundle limits, V8-isolate runtime.',
    cost10: '$5', cost100: '$50', cost10k: '$500-1.5k',
    pros: ['Cheapest at scale', 'Global edge by default', 'R2 (S3-compatible) with no egress fees'],
    cons: ['No Node APIs (some libs incompatible)', 'D1 / KV are still maturing', 'Less framework-native than Vercel'],
  },
  {
    id: 'fly', name: 'Fly.io',
    color: 'violet',
    layer: 'container PaaS',
    blurb: 'Run any Docker image globally. Closer to AWS pricing, simpler than ECS. The "I want containers without K8s" pick.',
    cost10: '$10', cost100: '$80', cost10k: '$1-3k',
    pros: ['Real containers; runs anything', 'Multi-region deploys are first-class', 'Postgres add-on is solid'],
    cons: ['Less polish than Vercel', 'Manual scaling rules at high QPS', 'Not framework-native'],
  },
  {
    id: 'render', name: 'Render / Railway',
    color: 'sky',
    layer: 'managed container',
    blurb: 'Heroku-shaped PaaS for containers + DBs. Simple, predictable pricing, fast onboarding. The "cloud-native without learning AWS" pick.',
    cost10: '$15', cost100: '$120', cost10k: '$1.5-3k',
    pros: ['Heroku-style git-deploy', 'Bundled Postgres / Redis', 'No hidden bills'],
    cons: ['Less mature than Vercel/Fly', 'Fewer regions', 'Limited edge story'],
  },
  {
    id: 'aws', name: 'AWS / GCP',
    color: 'emerald',
    layer: 'cloud-native (ECS/CloudRun)',
    blurb: 'Full cloud control. Cheapest unit cost at scale, highest ops cost. ECS Fargate or Cloud Run avoid K8s; App Runner is the closest to a PaaS.',
    cost10: '$30', cost100: '$200', cost10k: '$1-2k',
    pros: ['Mature primitives', 'Compliance / data residency', 'Cheapest at huge scale'],
    cons: ['Highest ops burden', 'Slower iteration', 'AWS bill surprises'],
  },
];

const HostingCard = () => {
  const [active, setActive] = useState('vercel');
  const o = HOSTING_OPTIONS.find(x => x.id === active);

  return (
    <Card id="host" icon={Cloud} title="Hosting & infra" accent="emerald" index={7}
          subtitle="Where your code actually runs. Five plausible defaults. K8s is almost never the right answer.">
      <MinSchema>
        Default <span className="text-fuchsia-300">Vercel</span> if you&apos;re on Next.js;{' '}
        <span className="text-amber-300">Cloudflare</span> if you&apos;re edge-runtime tolerant;{' '}
        <span className="text-violet-300">Fly</span> if you need real containers. Don&apos;t reach
        for <Term>Kubernetes</Term> until you have ~50+ services.
      </MinSchema>

      <p>
        Hosting is a medium-half-life decision &mdash; your app code is mostly portable across
        these. The lock-in is in the platform-specific features (Vercel ISR, Cloudflare Durable
        Objects, AWS-native services) and they&apos;re each a 1-2 week migration.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {HOSTING_OPTIONS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
          <div className={`text-base font-semibold ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
            {o.name}
          </div>
          <Chip color={o.color}>{o.layer}</Chip>
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="@ 10k MAU" value={o.cost10} sub="ballpark / mo" color="text-emerald-300" />
          <Stat label="@ 100k MAU" value={o.cost100} sub="ballpark / mo" color="text-amber-300" />
          <Stat label="@ 10M MAU"  value={o.cost10k} sub="ballpark / mo" color="text-rose-300" />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {o.pros.map((b, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {o.cons.map((b, i) => <li key={i} className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
        </div>
      </div>

      <Worked title="The serverless vs always-on deciding question">
        <div>
          Ask: <em>does my workload have idle time</em>? If your traffic is bursty and you have hours
          of near-zero load (most B2B SaaS): serverless wins on cost. If you have steady QPS or
          long-lived connections (websockets, agent runs): always-on container wins. Most modern PaaS
          (Vercel, Cloudflare, Fly Machines) mix both &mdash; serverless for HTTP, container for
          background workers.
        </div>
      </Worked>

      <WhenItMatters>
        Hosting decisions matter most at the <em>boundary moments</em>: first deploy (pick fast),
        first paying enterprise (compliance / VPC requirements), 100k MAU (cost surprise). In between,
        leave it alone &mdash; "switching hosting providers" is rarely worth the engineering time.
      </WhenItMatters>

      <Misconception
        wrong="We should run Kubernetes from day 1 — it's the production-grade choice."
        right="Kubernetes is the right answer when you have 50+ services and a dedicated SRE team. Below that, it adds 10-20% engineering overhead for negative architectural value. Vercel + Fly + Render are production-grade; K8s is platform-grade."
        because="The 'K8s is production-grade' belief comes from FAANG-shaped orgs where it actually is. For a 1-3 dev SaaS, K8s is over-engineered: you spend cycles on cluster ops that should go into the product. Pick K8s when the alternative (your team-of-3 maintaining 30 services) becomes painful — which probably never happens."
      />

      <Deeper>
        <p>
          <strong>The hidden serverless cost: connection pooling.</strong>{' '}
          1k concurrent Lambdas opening Postgres connections = exhausted DB pool = 500 errors. This is
          the #1 way serverless deployments fail in production. Fixes: PgBouncer in front of Postgres,
          Supabase Pooler, Neon&apos;s built-in pooler, or Hyperdrive on Cloudflare. The fix exists; just
          don&apos;t skip it.
        </p>
        <p>
          <strong>Cold-start budget by runtime.</strong>{' '}
          V8-isolate (Cloudflare Workers, Vercel Edge): ~5-50ms. Lambda Node: ~200-700ms. Lambda Python:
          ~400-1000ms. Container cold-start: 2-10s. The first three are invisible to users; the last is
          a UX problem. If your hot path can run on edge, do it &mdash; cheaper AND faster.
        </p>
        <p>
          <strong>IaC for production-grade SaaS in 2026.</strong>{' '}
          Most of the &ldquo;need <Term>IaC</Term>&rdquo; pain is solved by PaaS-shaped hosting (Vercel
          config in <code className="text-amber-300 font-mono">vercel.json</code>, Fly in{' '}
          <code className="text-amber-300 font-mono">fly.toml</code>). When you reach for AWS-native,
          Terraform / Pulumi / OpenTofu earn their keep. Until then: the PaaS config file is your IaC.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Vercel\'s pricing scared me at $5k/mo for 100k MAU. Is that real?',
          a: 'It can be — the surprise is bandwidth + function-GB-seconds, not the base plan. Mitigations: cache more aggressively (Cache-Control headers, ISR), move static assets to R2/CloudFront, downgrade non-critical pages from edge to node. Or migrate the heavy paths to Cloudflare. Most teams hit $200-1k/mo at 100k MAU, not $5k — but it requires attention.' },
        { q: "What's the smallest production-grade setup?",
          a: 'Vercel (frontend + serverless backend) + Neon (Postgres) + Resend (email) + Sentry (errors). About $50/mo at low usage. Replaces a much heavier old-stack: Heroku + RDS + SendGrid + Sentry + half a SRE.' },
        { q: 'When DO I actually need Kubernetes?',
          a: 'When you genuinely have many independent services that need shared infrastructure (service mesh, distributed scheduling) and a team to run it. For ~95% of SaaS, that point never comes. The other 5% are mostly multi-product companies, not single-product SaaS.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   08 — BACKGROUND JOBS & QUEUES
   The async layer. Critical doubly for AI workflows: long-running, retryable,
   fan-out. Inngest / Trigger / BullMQ / Cloud Tasks / Temporal.
   ========================================================================== */

const JOB_TOOLS = [
  {
    id: 'inngest', name: 'Inngest',
    color: 'fuchsia',
    blurb: 'Event-driven typed functions. No Redis. Multi-step workflows are first-class — sleep, fan-out, wait-for-event are language features.',
    pros: ['No infra', 'Step-functions for AI workflows', 'Generous free tier', 'Local dev replays'],
    cons: ['Hosted (your data passes through them)', 'Newer; smaller community'],
    fit: 'Default for AI-heavy SaaS. The "I have an agent that needs to run for 30 minutes" pick.',
  },
  {
    id: 'trigger', name: 'Trigger.dev',
    color: 'sky',
    blurb: 'Open-source workflow engine. Durable execution, made for long-running AI tasks. Self-host or hosted cloud.',
    pros: ['Open source / self-hostable', 'Durable execution', 'Strong AI workflow primitives'],
    cons: ['Newer', 'Smaller library of integrations than Inngest'],
    fit: 'Same as Inngest, but you want to self-host for compliance.',
  },
  {
    id: 'bullmq', name: 'BullMQ',
    color: 'amber',
    blurb: 'Redis-backed Node queue. Mature, fast, requires Redis. The default for "I just need a queue, no workflow magic".',
    pros: ['Mature', 'Fast', 'Self-hosted'],
    cons: ['Requires Redis', 'No workflow primitives — you build them', 'Workers are your problem'],
    fit: 'Existing Redis; simple "do this job in 30s" use cases.',
  },
  {
    id: 'tasks', name: 'Cloud Tasks / SQS',
    color: 'violet',
    blurb: 'Cloud-native managed queues. Boring, reliable, scales to anything. No workflow features.',
    pros: ['Cheapest at scale', 'Cloud-native (SQS/Tasks/PubSub)', 'No infra'],
    cons: ['No workflow primitives', 'Cloud lock-in', 'Polling is your job'],
    fit: 'You\'re already AWS / GCP and want managed queues with no extra vendor.',
  },
  {
    id: 'temporal', name: 'Temporal',
    color: 'emerald',
    blurb: 'Durable workflow engine. Code runs as if synchronous but survives crashes. Heaviest ops; the right call for complex multi-day workflows.',
    pros: ['Durable execution model', 'Battle-tested at scale', 'Polyglot (Go, Java, TS, Python)'],
    cons: ['Heavy ops (Cassandra/Postgres+ES backend)', 'Steep learning curve', 'Overkill for most SaaS'],
    fit: 'Multi-day workflows; financial / regulated; real distributed system.',
  },
];

const JobsQueuesCard = () => {
  const [active, setActive] = useState('inngest');
  const t = JOB_TOOLS.find(x => x.id === active);

  return (
    <Card id="jobs" icon={Workflow} title="Background jobs & queues" accent="amber" index={8}
          subtitle="The async layer. Doubly critical for AI workflows — long-running, retryable, fan-out.">
      <MinSchema>
        Default <span className="text-fuchsia-300">Inngest</span> for AI-heavy SaaS &mdash; durable
        functions, no infra to run, retries are free. <span className="text-sky-300">Trigger.dev</span>{' '}
        if you self-host. <span className="text-amber-300">BullMQ</span> if you already have Redis
        and need just a queue.
      </MinSchema>

      <p>
        AI workflows expose every weakness of a queue layer. A single agent run might take 30 seconds
        to 30 minutes, fan out into parallel tool calls, retry on rate-limit errors, and write back
        intermediate state. The wrong queue layer turns this into a custom-built distributed system.
        The right one turns it into a typed function with <code className="text-amber-300 font-mono">await step.run(...)</code>.
      </p>

      <Predict question="What breaks first when you put an LLM call inside a synchronous request handler?">
        Three things, all at once: (1) the request times out at the platform&apos;s function-execution
        cap (10-60s on Vercel, 5min Lambda), (2) the user hits refresh and you double-charge tokens,
        (3) when the LLM provider rate-limits you, your handler errors instead of retrying. Moving the
        call to a queue solves all three with one architectural change.
      </Predict>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {JOB_TOOLS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className={`text-base font-semibold mb-2 ${chipPalette[t.color].split(' ').find(s => s.startsWith('text-'))}`}>
          {t.name}
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{t.blurb}</div>
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {t.pros.map((b, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {t.cons.map((b, i) => <li key={i} className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
        </div>
        <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[11px] text-neutral-200">
          <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mr-2">fit</span>
          {t.fit}
        </div>
      </div>

      <WhenItMatters>
        The moment you have any of: (1) work that takes &gt; 5 seconds, (2) an LLM call in the request
        path, (3) a webhook handler that does anything beyond write to DB, (4) a scheduled batch job.
        Without a queue you&apos;re doing the wrong thing in production; with one, async is a one-liner.
      </WhenItMatters>

      <Misconception
        wrong="A queue is overkill for a small app — I'll just use setTimeout / await."
        right="setTimeout doesn't survive a deploy. await blocks the request. Both fail in the cases that actually matter — retries, restarts, scheduled work, fan-out. The queue is the cheapest possible production-grade async layer; skipping it doesn't save complexity, it relocates it to your bug tracker."
        because="Async work that lives in process memory is invisible to your platform. If your app restarts (deploy, crash, autoscale), the work disappears. Queues are durable execution — they survive everything you don't control."
      />

      <Deeper>
        <p>
          <strong>Idempotency keys are non-negotiable for retries.</strong>{' '}
          Every job that mutates external state (sends an email, charges a card, calls a paid LLM)
          needs an <Term>idempotency key</Term>. The pattern: client generates a UUID per logical
          operation; server checks "have I seen this key?" before doing the work. Stripe-style.
          Without this, retries silently duplicate effects.
        </p>
        <p>
          <strong>Step functions vs simple queues.</strong>{' '}
          Inngest / Trigger / Temporal expose &ldquo;step.run(...)&rdquo; primitives that checkpoint
          intermediate results. If step 3 of an agent run fails, retry resumes from step 3, not step 1.
          For a long agent run with 10 LLM calls, this is the difference between a $2 retry and a $0.20 retry.
          BullMQ / SQS don&apos;t have this &mdash; you build it on top.
        </p>
        <p>
          <strong>Sequential vs parallel fan-out.</strong>{' '}
          Most agent workflows are <em>tree-shaped</em>: one root call fans out to N parallel sub-tasks,
          which each fan out further. Step-function frameworks (Inngest, Temporal) make this trivial
          (<code className="text-amber-300 font-mono">Promise.all(stepA, stepB, stepC)</code>). Queue-only
          tools force you to thread state through messages or external storage. For RAG-style and
          multi-agent workflows, the framework choice is the architecture choice.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Can I use my framework\'s built-in jobs (Next.js Route Handlers + cron)?',
          a: 'For very simple cases (one daily summary email), yes. The wheels come off when you need: (a) retries on failure, (b) more than ~10 minutes of execution, (c) fan-out across many items, (d) status visibility. The "DIY queue" path is a 1-month side-project disguised as a 1-week feature. Start with Inngest/Trigger.' },
        { q: 'Is there a serverless queue for my serverless app?',
          a: 'Inngest, Trigger.dev, and Cloud Tasks all qualify — your handlers run on serverless, the queue is managed. The "do I need a long-running worker?" question goes away. This is the right shape for vibecoding.' },
        { q: 'How does this interact with the LLM provider rate-limiting card?',
          a: 'Tightly. Without a queue, rate-limited LLM calls become user-visible errors. With a queue, they become retried-after-backoff events the user never sees. Your queue layer\'s retry behavior is your effective LLM reliability layer.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   09 — OBSERVABILITY & OPS MINIMUM
   The smallest stack that lets you sleep. Errors / logs / metrics / traces.
   ========================================================================== */

const OBS_PILLARS = [
  { name: 'Errors',  blurb: 'Stack traces grouped by fingerprint, with release tracking.', tools: 'Sentry · Bugsnag · Rollbar', color: 'rose' },
  { name: 'Logs',    blurb: 'Structured events. Searchable. Retention by tier.', tools: 'Axiom · Logtail · Datadog Logs · CloudWatch', color: 'sky' },
  { name: 'Metrics', blurb: 'Counters / gauges / histograms over time. Dashboards.', tools: 'Grafana Cloud · Datadog · Prometheus', color: 'emerald' },
  { name: 'Traces',  blurb: 'Per-request flame graph across services. Root-cause for distributed bugs.', tools: 'Sentry Traces · Datadog APM · Honeycomb', color: 'violet' },
  { name: 'Uptime',  blurb: 'External pinger that pages you when prod is dead.', tools: 'Better Stack · UptimeRobot · Cronitor', color: 'amber' },
  { name: 'Real-user perf', blurb: 'Browser-side performance + Core Web Vitals from real users.', tools: 'Vercel Speed Insights · Sentry Performance · SpeedCurve', color: 'fuchsia' },
];

const ObservabilityCard = () => {
  return (
    <Card id="obs" icon={Activity} title="Observability & ops minimum" accent="amber" index={9}
          subtitle="Six pillars. The smallest stack that lets you sleep at 3am.">
      <MinSchema>
        Day-1 minimum: <span className="text-fuchsia-300">Sentry</span> (errors + traces) +{' '}
        <span className="text-sky-300">Axiom</span> or <span className="text-sky-300">Logtail</span>{' '}
        (logs) + <span className="text-amber-300">Better Stack</span> (uptime + status page). Total cost
        ~$50/mo. Anything less and you&apos;re flying blind.
      </MinSchema>

      <p>
        <Term>Observability</Term> is the ability to ask new questions about a system without
        redeploying it. Six pillars cover the surface; you don&apos;t need separate vendors for each.
        The default starter stack folds errors, logs, traces, and RUM into 1-2 vendors.
      </p>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {OBS_PILLARS.map(p => (
          <div key={p.name} className={`rounded-lg border ${chipPalette[p.color].split(' ').find(s => s.startsWith('border-'))} bg-white/[0.02] p-3`}>
            <div className={`text-[12px] font-semibold ${chipPalette[p.color].split(' ').find(s => s.startsWith('text-'))} mb-1`}>
              {p.name}
            </div>
            <div className="text-[11px] text-neutral-300 leading-snug mb-2">{p.blurb}</div>
            <div className="text-[10px] text-neutral-500 font-mono">{p.tools}</div>
          </div>
        ))}
      </div>

      <Worked title="Day-1 stack and what it costs">
        <div className="grid sm:grid-cols-2 gap-2">
          <div><Chip color="rose">Sentry</Chip> errors + traces · ~$25/mo</div>
          <div><Chip color="sky">Axiom</Chip> structured logs · free tier covers most apps</div>
          <div><Chip color="amber">Better Stack</Chip> uptime + status page · ~$25/mo</div>
          <div><Chip color="fuchsia">Vercel Insights</Chip> RUM + Web Vitals · bundled</div>
        </div>
        <div className="text-[11px] text-neutral-400 mt-2">
          Total: ~$50/mo. Replaces a much heavier stack (Datadog at $500+/mo for similar coverage at small scale).
          You upgrade later when you outgrow Sentry/Axiom (rare for SaaS &lt;100k MAU).
        </div>
      </Worked>

      <WhenItMatters>
        Day 1. Errors that aren&apos;t in Sentry don&apos;t exist; logs you can&apos;t search are
        write-only. Without observability, every prod issue becomes "screen-share with the customer
        while we ssh into the box". With it, you fix it before they notice.
      </WhenItMatters>

      <Misconception
        wrong="Datadog is the production-grade default — it has everything in one console."
        right="Datadog is great at scale. At small scale it's $500-2000/mo for what Sentry + Axiom + Better Stack do for $50. The 'one vendor' value compounds when you have 30+ services; below that it's overpaying for unused breadth."
        because="The right vendor scales with your service count, not your headcount. A 3-person team with 4 services should pay 'lightweight obs' prices. They graduate to Datadog around 30+ services or 100k+ MAU when the integrated console actually saves debugging time."
      />

      <Deeper>
        <p>
          <strong>OpenTelemetry as the portability hedge.</strong>{' '}
          Emit telemetry as <Term>OpenTelemetry</Term> and any vendor (Datadog, Honeycomb, Grafana,
          Sentry) can ingest it. The old &ldquo;rip-and-replace&rdquo; pain of swapping APM vendors
          becomes a config change. Worth doing from day 1; the marginal cost is near zero.
        </p>
        <p>
          <strong>SLOs as a forcing function.</strong>{' '}
          A <Term>SLO</Term> ("99.9% of API requests &lt; 300ms over 30 days") tells you when reliability
          work outranks features. Without one, every prod incident feels equally urgent. With one, you
          know whether you have <Term>error budget</Term> to ship the next risky change. Establish
          SLOs around month 3 of customers, not before (you don&apos;t know what to measure yet).
        </p>
        <p>
          <strong>AI-feature observability is its own thing.</strong>{' '}
          Token counts, model latency, prompt versions, eval scores &mdash; standard APM doesn&apos;t
          cover it. <CrossLink to="eval" recap="Eval card: Braintrust / Langfuse / Helicone for AI-feature observability.">eval & cost card</CrossLink>{' '}
          covers the AI-native side. For the traditional stack, Sentry+Axiom is enough; for the AI
          stack, you bolt on a second tool.
        </p>
      </Deeper>

      <QA items={[
        { q: 'What\'s the minimum I can get away with on day 1?',
          a: 'Sentry alone. Errors are the smallest set of signals where blindness is unaffordable. Logs and metrics can be skipped for ~the first month; uptime can be a free tier. Adding Axiom + Better Stack at week 2 is a 30-min job.' },
        { q: 'Should I run my own Grafana / Prometheus stack?',
          a: 'No, until you can\'t use a SaaS for compliance reasons. Self-hosted obs is a 1-day setup that becomes a 1-week-per-year ops drag. The unit economics flip around the 50-engineer mark, not before.' },
        { q: 'What about distributed tracing — do I really need it?',
          a: 'For a single-service app: not really, errors+logs cover most cases. The moment you have 3+ services or async workflows (queues, agents), tracing pays for itself the first time it shows you which span ate 8s of latency. Sentry\'s built-in tracing is fine here.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   10 — FULLSTACK ADJACENT · GOOD TO KNOW
   12 capability tiles in a grid. Each tile: name + 2-3 default tools +
   one-liner. Hover for tradeoff detail. The "you'll bolt one of these on
   when a customer demands it" reference card.
   ========================================================================== */

const ADJACENT_TILES = [
  { name: 'Payments & billing', icon: 'card',   color: 'fuchsia',
    tools: 'Stripe · Paddle · Polar',
    blurb: 'Subscriptions, usage-based, tax.',
    when: 'You charge money. Day 1 if B2B SaaS.',
    pick: 'Stripe — biggest ecosystem, best AI codegen support.',
    deviate: 'Paddle / Lemon Squeezy as Merchant of Record (handles tax in 100+ countries) when you sell globally without an entity per region.' },
  { name: 'Email transactional', icon: 'mail',  color: 'sky',
    tools: 'Resend · Postmark · SES',
    blurb: 'Verification, password resets, alerts.',
    when: 'Day 1 for any SaaS with logins.',
    pick: 'Resend — modern DX, React Email integration.',
    deviate: 'Postmark for the highest deliverability + transactional/marketing split. SES if you live in AWS and tolerate the rough DX.' },
  { name: 'File / blob storage', icon: 'file',  color: 'emerald',
    tools: 'S3 · R2 · Uploadthing',
    blurb: 'User uploads, generated assets, exports.',
    when: 'Users upload anything heavier than form fields.',
    pick: 'R2 (no egress fees) or S3 (no infra surprises).',
    deviate: 'Uploadthing if you want signed-URL plumbing handled; Cloudflare Images if you need on-the-fly transforms.' },
  { name: 'Search', icon: 'search', color: 'violet',
    tools: 'Postgres FTS · Meilisearch · Typesense',
    blurb: 'Find-as-you-type / faceted search.',
    when: 'Users hunt across rows, not browse them.',
    pick: 'Postgres FTS until ~10M rows. Then Meilisearch.',
    deviate: 'Algolia for B2C with strict latency budgets. Elastic only at huge scale or for compliance reasons.' },
  { name: 'Realtime', icon: 'bolt',  color: 'amber',
    tools: 'Pusher · Ably · Liveblocks · Supabase Realtime',
    blurb: 'WS / SSE for live UI.',
    when: 'Multi-user collaboration; live dashboards.',
    pick: 'Supabase Realtime if on Supabase. Liveblocks for Notion-shaped multiplayer.',
    deviate: 'Roll-your-own SSE on Cloudflare for cost; Pusher / Ably for any "I need this in 2 hours" case.' },
  { name: 'Caching', icon: 'cache', color: 'rose',
    tools: 'Redis · Upstash · Cloudflare KV',
    blurb: 'Hot read paths, rate limits, sessions.',
    when: 'Hot read paths bottleneck or rate-limit needs persistence.',
    pick: 'Upstash Redis for serverless (HTTP API, pay-per-request).',
    deviate: 'Cloudflare KV for edge reads. Redis Cloud if always-on and high QPS.' },
  { name: 'Webhooks ingress', icon: 'webhook', color: 'orange',
    tools: 'Svix · Hookdeck · homegrown',
    blurb: 'Inbound HTTP from third parties.',
    when: 'Stripe, GitHub, Slack, ERP integrations land here.',
    pick: 'Svix when outbound; Hookdeck when inbound + you want replay/observability.',
    deviate: 'Homegrown if you only ingest 1-2 sources. Svix sends if you also EMIT webhooks to your customers.' },
  { name: 'Analytics', icon: 'bar', color: 'cyan',
    tools: 'PostHog · Mixpanel · Plausible',
    blurb: 'Product usage, funnels, retention.',
    when: 'You ship features and want to know if anyone uses them.',
    pick: 'PostHog (open-source, bundles flags + recordings + analytics).',
    deviate: 'Plausible for privacy-first marketing-site analytics. Amplitude for serious B2B funnel work.' },
  { name: 'Feature flags', icon: 'flag', color: 'sky',
    tools: 'PostHog · GrowthBook · LaunchDarkly',
    blurb: 'Toggle features without deploying.',
    when: 'You want progressive rollout, A/B, kill switches.',
    pick: 'PostHog Flags (bundled with analytics).',
    deviate: 'GrowthBook for OSS / self-host. LaunchDarkly if enterprise SDK and SLAs matter.' },
  { name: 'i18n', icon: 'globe', color: 'emerald',
    tools: 'next-intl · Lingui · i18next',
    blurb: 'Translation, date / currency / number locales.',
    when: 'Any non-English customer; especially ERP.',
    pick: 'next-intl (Next.js), Lingui (framework-agnostic).',
    deviate: 'Tolgee for a CMS-shaped translation workflow. i18next for legacy interop.' },
  { name: 'Admin panels', icon: 'panel', color: 'violet',
    tools: 'Retool · Refine · homegrown',
    blurb: 'Internal CRUD + ops dashboards.',
    when: 'Your support team needs to act on customer data without a deploy.',
    pick: 'Retool for ops-team-built panels. Refine if your devs want a code-shaped admin.',
    deviate: 'Homegrown is fine for the first 3-5 screens; cost flips at ~10 screens.' },
  { name: 'CDN / edge', icon: 'cloud', color: 'amber',
    tools: 'Cloudflare · Vercel Edge · Fastly',
    blurb: 'Cached static + edge functions globally.',
    when: 'You serve any public traffic. Day 1.',
    pick: 'Cloudflare (bundled with most hosting) or whatever your PaaS bundles.',
    deviate: 'Fastly for media-heavy / video-heavy. AWS CloudFront if you live in AWS.' },
];

const AdjacentCard = () => {
  const [hover, setHover] = useState(null);
  return (
    <Card id="adjacent" icon={PlugZap} title="Fullstack adjacent · good to know" accent="orange" index={10}
          subtitle="Twelve capability layers you'll add when a customer demands them. Pick none of them on day 1; pick them per-pain.">
      <MinSchema>
        These are <em>per-pain</em> picks, not day-1 picks. Each tile has a default that&apos;s
        right ~80% of the time and a deviation trigger for the other 20%. Hover any tile for detail.
      </MinSchema>

      <p>
        Production-grade SaaS accumulates a long tail of capabilities &mdash; payments, email, file
        storage, search, realtime, caching, webhooks, analytics, feature flags, i18n, admin panels,
        CDN. Each is its own decision-fork; none of them deserves a full card. The rule of thumb:
        <em> add when a customer demands it</em>, not in anticipation.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ADJACENT_TILES.map(t => (
          <div key={t.name}
            onMouseEnter={(e) => setHover({ tile: t, mx: e.clientX, my: e.clientY })}
            onMouseMove={(e) => setHover({ tile: t, mx: e.clientX, my: e.clientY })}
            onMouseLeave={() => setHover(null)}
            className={`rounded-lg border ${chipPalette[t.color].split(' ').find(s => s.startsWith('border-'))} bg-white/[0.02] hover:bg-white/[0.05] p-3 cursor-help transition-colors`}>
            <div className={`text-[11px] font-semibold ${chipPalette[t.color].split(' ').find(s => s.startsWith('text-'))} mb-1`}>
              {t.name}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mb-1">{t.tools}</div>
            <div className="text-[10px] text-neutral-300 leading-snug">{t.blurb}</div>
          </div>
        ))}
      </div>

      <FloatingTip
        hover={hover}
        width={320}
        render={(h) => (
          <div className="space-y-1.5">
            <div className={`text-[10px] uppercase tracking-wider ${chipPalette[h.tile.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {h.tile.name}
            </div>
            <div className="text-[11px] text-neutral-200 leading-snug">
              <span className="text-emerald-300">when:</span> {h.tile.when}
            </div>
            <div className="text-[11px] text-neutral-200 leading-snug">
              <span className="text-fuchsia-300">default:</span> {h.tile.pick}
            </div>
            <div className="text-[11px] text-neutral-300 leading-snug">
              <span className="text-amber-300">deviate:</span> {h.tile.deviate}
            </div>
          </div>
        )}
      />

      <WhenItMatters>
        These layers are <em>vendor-swappable</em> &mdash; short half-life. The cost of picking
        wrong on day 1 is ~1 week of migration when the pain becomes real. Don&apos;t agonize.
        Pick a default, ship, swap when the limit bites.
      </WhenItMatters>

      <Misconception
        wrong="Picking my whole adjacent stack at the start lets me move faster later."
        right="Each adjacent vendor adds dashboard sprawl, billing complexity, and another integration that AI codegen has to keep coherent. Most of these you won't need for 6-12 months. Day-1 picking 'just in case' is YAGNI tax — pay for utility you don't yet need."
        because="The cost of NOT having a vendor = a couple of hours integrating it when you actually need it. The cost of HAVING an unused vendor = a recurring monthly fee + cognitive overhead. The asymmetry favors lazy adoption."
      />

      <Deeper>
        <p>
          <strong>The PostHog consolidation pattern.</strong>{' '}
          PostHog bundles analytics + feature flags + session replays + experimentation. For most SaaS,
          this collapses three vendors into one. Worth knowing about even if you start with single-purpose
          tools &mdash; the migration to the bundle is cheap.
        </p>
        <p>
          <strong>Stripe + Merchant of Record decision.</strong>{' '}
          Stripe = best DX, you handle tax. MoR providers (Paddle, Lemon Squeezy, Polar) = they handle
          tax in 100+ countries, you pay ~2% extra. The tax handling alone justifies MoR for any
          early-stage product selling internationally; switch to Stripe direct when you have an entity
          per region and a tax accountant.
        </p>
        <p>
          <strong>Webhooks ingress is harder than it looks.</strong>{' '}
          Retries, signature verification, replay attacks, idempotency, rate limits, ordering. A
          webhook ingress pipeline that handles all of these is ~500 lines of careful code AND a queue
          (back to <CrossLink to="jobs" recap="Background jobs card.">jobs & queues</CrossLink>).
          Hookdeck / Svix do this for you.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Where do CI/CD, secrets management, and IaC fit on this list?',
          a: 'Adjacent but more "setup once, leave alone": GitHub Actions for CI, Doppler/Infisical/1Password for secrets, Terraform/Pulumi for AWS-native IaC. They\'re production-grade hardening, not feature additions; outside the per-pain rhythm of this card.' },
        { q: 'What\'s the biggest mistake people make in this layer?',
          a: 'Premature consolidation on Datadog or AWS-native services to "future-proof". You pay 5x cost for breadth you don\'t use. The opposite mistake — accumulating 15 free-tier vendors — is also bad. Land between: 1-2 obs vendors + 1-2 messaging + 1 each of the rest.' },
        { q: 'Are any of these legitimately optional for production-grade SaaS?',
          a: 'Yes — i18n (English-only is fine for most B2B SaaS), realtime (most apps don\'t need it), feature flags (until you have product-led growth motions), search (until your data outgrows nav). The non-optional ones: payments, email, file storage, analytics-of-some-form, CDN.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   11 — LLM PROVIDER
   Anthropic / OpenAI / Google / open-weights via Groq/Together/Bedrock.
   The "stick with one frontier provider" rule + cost shape.
   ========================================================================== */

// Approx public pricing per 1M tokens (input/output) for current frontier-tier as of late 2025/early 2026.
// Numbers are illustrative for the pricing visualization, not exact billing.
const LLM_PROVIDERS = [
  {
    id: 'anthropic', name: 'Anthropic',
    color: 'fuchsia',
    models: 'Claude Opus 4.7 · Sonnet 4.6 · Haiku 4.5',
    blurb: 'Frontier reasoning + tool use; the default for production agents in 2026. Strong prompt caching, batch API.',
    in: 3.0, out: 15.0, cacheRead: 0.3,
    pros: ['Best agent reliability', 'Long context with strong recall', 'Best prompt caching primitives'],
    cons: ['Higher per-token cost than OpenAI', 'No image generation'],
  },
  {
    id: 'openai', name: 'OpenAI',
    color: 'emerald',
    models: 'GPT-5 · GPT-5 mini · o4',
    blurb: 'Largest ecosystem; cheapest at scale on the cheap models. Fastest streaming; best STT/TTS/image bundle.',
    in: 2.5, out: 10.0, cacheRead: 0.25,
    pros: ['Cheapest cheap-model tier', 'Multimodal stack (TTS, image gen, Whisper)', 'Biggest community'],
    cons: ['Reliability of new releases is uneven', 'Function calling lags Anthropic on agents'],
  },
  {
    id: 'google', name: 'Google',
    color: 'sky',
    models: 'Gemini 2.5 Pro · Flash',
    blurb: 'Massive context window. Cheapest at the long-context tier. Tool use is improving but not at parity.',
    in: 1.25, out: 5.0, cacheRead: 0.125,
    pros: ['1-2M token context', 'Cheapest long-context', 'Native multimodal'],
    cons: ['Agent reliability behind Anthropic', 'Vendor maturity uneven'],
  },
  {
    id: 'openweights', name: 'Open weights',
    color: 'violet',
    models: 'Llama · Qwen · Mistral · DeepSeek',
    blurb: 'Self-host or via Together / Groq / Fireworks. Cheapest ceiling, most operational work.',
    in: 0.5, out: 1.5, cacheRead: 0.05,
    pros: ['Cheapest at scale', 'Run in your VPC for compliance', 'No rate limits if self-host'],
    cons: ['Capability gap (smaller, less reliable)', 'Ops burden if self-hosted', 'Slower iteration on new techniques'],
  },
];

const LlmProviderCard = () => {
  const [active, setActive] = useState('anthropic');
  const [calls, setCalls] = useState(100000);
  const [inTok, setInTok] = useState(2000);
  const [outTok, setOutTok] = useState(500);
  const [cacheRate, setCacheRate] = useState(0.6);
  const o = LLM_PROVIDERS.find(x => x.id === active);

  const cost = useMemo(() => {
    const monthlyIn = (calls * inTok) / 1e6;   // millions of input tokens
    const monthlyOut = (calls * outTok) / 1e6; // millions of output tokens
    const cachedIn = monthlyIn * cacheRate;
    const freshIn = monthlyIn * (1 - cacheRate);
    return freshIn * o.in + cachedIn * o.cacheRead + monthlyOut * o.out;
  }, [calls, inTok, outTok, cacheRate, o]);

  return (
    <Card id="llm" icon={BrainCircuit} title="LLM provider" accent="fuchsia" index={11}
          subtitle="Pick one frontier provider; abstract just the call site, not the API. Switch when the next model genuinely changes the calculus.">
      <MinSchema>
        Default <span className="text-fuchsia-300">Anthropic</span> for production agents and chat
        UX in 2026; fall back to <span className="text-emerald-300">OpenAI</span> for cheap-tier
        bulk work and multimodal. Resist the urge to abstract over both via LangChain &mdash;
        wrap your <em>own</em> call site instead.
      </MinSchema>

      <p>
        The right provider abstraction is &ldquo;one function in your code that takes a prompt and
        returns a response&rdquo;. That&apos;s the seam where you swap providers. Heavyweight
        abstraction layers (LangChain, LiteLLM-as-architecture) buy portability you rarely use and
        cost you the provider-specific features you actually need (Anthropic prompt caching,
        OpenAI streaming JSON, Google long context).
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {LLM_PROVIDERS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <div className={`text-base font-semibold ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
            {o.name}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">{o.models}</div>
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="$/1M in (fresh)"   value={`$${o.in.toFixed(2)}`}        sub="per request" color="text-amber-300" />
          <Stat label="$/1M in (cached)"  value={`$${o.cacheRead.toFixed(2)}`} sub="prompt cache hit" color="text-emerald-300" />
          <Stat label="$/1M out"          value={`$${o.out.toFixed(2)}`}       sub="generated tokens" color="text-rose-300" />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {o.pros.map((b, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 mt-[3px] text-emerald-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
          <ul className="text-[11px] text-neutral-200 space-y-1">
            {o.cons.map((b, i) => <li key={i} className="flex items-start gap-1.5"><XCircle className="w-3 h-3 mt-[3px] text-rose-400 shrink-0" /><span>{b}</span></li>)}
          </ul>
        </div>
      </div>

      {/* cost calculator */}
      <div className="mt-4 rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/5 p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-300 mb-2">monthly cost · interactive</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400 font-mono">calls / month</span><span className="text-neutral-200 font-mono tabular-nums">{(calls / 1000).toFixed(0)}k</span></div>
            <input type="range" min="1000" max="10000000" step="1000" value={calls} onChange={(e) => setCalls(parseInt(e.target.value))} className="as-range w-full" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400 font-mono">input tokens / call</span><span className="text-neutral-200 font-mono tabular-nums">{inTok.toLocaleString()}</span></div>
            <input type="range" min="100" max="20000" step="100" value={inTok} onChange={(e) => setInTok(parseInt(e.target.value))} className="as-range w-full" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400 font-mono">output tokens / call</span><span className="text-neutral-200 font-mono tabular-nums">{outTok.toLocaleString()}</span></div>
            <input type="range" min="50" max="5000" step="50" value={outTok} onChange={(e) => setOutTok(parseInt(e.target.value))} className="as-range w-full" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1"><span className="text-neutral-400 font-mono">cache hit rate</span><span className="text-neutral-200 font-mono tabular-nums">{(cacheRate * 100).toFixed(0)}%</span></div>
            <input type="range" min="0" max="0.95" step="0.05" value={cacheRate} onChange={(e) => setCacheRate(parseFloat(e.target.value))} className="as-range w-full" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <Stat label="estimated · monthly" value={`$${cost < 100 ? cost.toFixed(2) : Math.round(cost).toLocaleString()}`} sub={`${o.name} on the slider workload`} color="text-fuchsia-200" />
        </div>
        <div className="mt-2 text-[10px] text-neutral-500 leading-snug">
          Note: prompt-cache hit rate of 60-90% is realistic for chat / RAG workloads with stable system prompts.
          Caching is the largest cost lever in production &mdash; can reduce input cost by 80-90%.
        </div>
      </div>

      <WhenItMatters>
        Three moments: (1) day-1 pick &mdash; defaults to Anthropic for agents, OpenAI for everything
        else; (2) when costs cross ~$5k/mo &mdash; revisit cache rate, model tier, batch API; (3) when
        a frontier release moves the capability frontier (typically every 6-12 months). In between,
        leave it alone.
      </WhenItMatters>

      <Misconception
        wrong="I should abstract behind LiteLLM / LangChain so I can swap providers."
        right="Wrap your own thin function (`callLLM(prompt, opts)`). Provider abstractions add a dependency that lags every new provider feature by months. The provider lock-in is small (the wire format is JSON, the prompts are text); the abstraction lock-in is real (LangChain is a 100-file dependency)."
        because="The 'I want to swap providers' use case happens 1-2x in the life of an app. The 'I want to use this provider's new feature' happens monthly. Optimize for the common case — direct SDK calls behind a thin wrapper. Sw aps when needed are 1-2 days of work, not framework choices."
      />

      <Deeper>
        <p>
          <strong>Prompt caching is the biggest cost lever you control.</strong>{' '}
          Anthropic and OpenAI both offer prompt-prefix caching: a long static system prompt + tools
          schema gets cached after the first call; subsequent calls within the cache TTL pay 10% of
          the input cost for the cached portion. For chat UX (long system prompts, short user turns),
          this is a 5-10x cost reduction. Wire it up on day 1.
        </p>
        <p>
          <strong>Routing across model tiers.</strong>{' '}
          Within one provider, route easy work to the cheap model (Haiku, GPT-mini, Flash) and
          escalate to the frontier model only when needed. A typical pattern: classify the request
          shape with the cheap model, route to the right one, fall back to a stronger model on
          uncertain output. ~3-5x cost reduction, ~no quality loss for routine tasks.
        </p>
        <p>
          <strong>Batch APIs cut cost ~50%.</strong>{' '}
          Anthropic, OpenAI, and Google all have batch APIs that complete within ~24h at half price.
          Anything you don&apos;t need synchronously (overnight summaries, eval runs, bulk data
          extraction) should go through batch. The default mistake is using the synchronous API for
          everything, including jobs that don&apos;t need to be sync.
        </p>
        <p>
          <strong>Bedrock / Vertex / Azure as multi-tenant ceilings.</strong>{' '}
          AWS Bedrock, Google Vertex, Azure OpenAI all host frontier models with VPC deployment,
          BAA / DPA support, and customer-managed-keys. Required for healthcare / finance compliance.
          Slight cost premium and 1-2 release cycles behind the providers&apos; first-party APIs.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How do I split work between Anthropic, OpenAI, and Google?',
          a: 'Easiest: pick one. If you really want multi-provider, route by capability — Anthropic for agents and tool use, OpenAI for cheap classification + multimodal generation, Google for long-context (>200k tokens) work. Keep the routing decision in one file you can change.' },
        { q: 'Is open-source self-hosting (Llama, Qwen) a real option?',
          a: 'For hot paths: usually no — capability gap matters more than cost. For specific narrow tasks (extraction, classification, embedding) where a fine-tuned 7-13B model is good enough: yes, dramatically cheaper. The right shape is hybrid — frontier for the user-facing call, open-source for narrow internal tasks.' },
        { q: 'When does provider cost actually become a problem?',
          a: 'Around $2-5k/mo of LLM spend, the cost-per-feature lens starts to matter — does this $1k feature retain $5k of customers? Below that, model spend is rounding error. Above that, route to cheap models, batch what can wait, raise cache rate.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   12 — RAG & VECTOR LAYER
   pgvector vs Pinecone vs Turbopuffer vs Qdrant. When NOT to RAG.
   The chunking-and-reranking pipeline visualization.
   ========================================================================== */

const VECTOR_OPTIONS = [
  {
    id: 'pgvector', name: 'pgvector',
    color: 'fuchsia',
    chips: ['Postgres ext', 'HNSW', 'no extra system'],
    blurb: 'Postgres extension. Vector queries inside SQL. For SaaS-scale corpora (under ~10M vectors), often better than dedicated DBs.',
    when: 'Default. Especially when you already have Postgres.',
    avoid: '>50M vectors with frequent re-indexing; multi-tenant with vastly different corpus sizes.',
  },
  {
    id: 'turbopuffer', name: 'Turbopuffer',
    color: 'sky',
    chips: ['serverless', 'object-store backed', 'cheap'],
    blurb: 'Vector + full-text store backed by object storage. ~10x cheaper than Pinecone at scale; designed for many small tenant namespaces.',
    when: 'Multi-tenant SaaS with many namespaces; cost matters at scale.',
    avoid: 'Sub-10ms latency requirements (object-store fetch adds ms).',
  },
  {
    id: 'pinecone', name: 'Pinecone',
    color: 'emerald',
    chips: ['hosted', 'low-latency', 'mature'],
    blurb: 'The category-original. Most polished UX. Best at high-QPS low-latency reads. Most expensive.',
    when: 'Latency-critical; large team that wants no DB ops.',
    avoid: 'Cost-sensitive; SaaS-scale where pgvector is enough.',
  },
  {
    id: 'qdrant', name: 'Qdrant / Weaviate',
    color: 'violet',
    chips: ['self-host', 'OSS'],
    blurb: 'Open-source vector DBs you can self-host. Powerful, more ops work than pgvector / hosted.',
    when: 'Self-host requirement; compliance / VPC.',
    avoid: 'You already have Postgres and don\'t need standalone — pgvector wins.',
  },
];

const PIPELINE_STEPS = [
  { name: 'Source docs',     desc: 'PDFs, wikis, tickets, knowledge base',         color: 'sky' },
  { name: 'Chunking',        desc: '~512-1024 tokens, with overlap, by semantic boundary not character', color: 'amber' },
  { name: 'Embedding',       desc: 'voyage-3 / OpenAI text-embedding-3 / cohere · cosine-ready unit vectors', color: 'fuchsia' },
  { name: 'Storage',         desc: 'pgvector / Turbopuffer / Pinecone with HNSW or IVFFlat index',         color: 'violet' },
  { name: 'Query embed',     desc: 'embed user query (or HyDE-style hypothetical answer)',                 color: 'emerald' },
  { name: 'Top-k retrieval', desc: 'k=20-50 with metadata filters (tenant_id, date, type)',                color: 'sky' },
  { name: 'Rerank',          desc: 'Cohere Rerank / BGE / LLM-as-judge → top 5-10',                        color: 'rose' },
  { name: 'Stuff into prompt', desc: 'with citations, structured by section',                               color: 'amber' },
];

const RagVectorCard = () => {
  const [active, setActive] = useState('pgvector');
  const o = VECTOR_OPTIONS.find(x => x.id === active);

  return (
    <Card id="rag" icon={BookOpen} title="RAG & vector layer" accent="fuchsia" index={12}
          subtitle="When you need an LLM to know about your private data. The 8-step pipeline; the 4 viable vector DBs; the question of when not to RAG.">
      <MinSchema>
        Default <span className="text-fuchsia-300">pgvector</span> until you outgrow it (rare under
        10M chunks). The big knobs are <em>chunking</em> and <em>reranking</em> &mdash; bigger gains
        than swapping the vector DB or embedding model.
      </MinSchema>

      <p>
        <Term>RAG</Term> is the default way to ground an LLM in your private data. The pipeline is
        long and underrated &mdash; eight named steps, each with their own tradeoffs. The vector DB
        choice is one of those steps, not the whole conversation.
      </p>

      <Predict question="In a working RAG system, what improves recall more: swapping from text-embedding-3-small to a frontier embedding model, or adding a Cohere reranker after retrieval?">
        Reranking. Embedding-model upgrades give 1-3% NDCG improvements; rerankers give 10-25%.
        The first big knob is chunking strategy (semantic chunking + overlap). The second is rerank.
        The third is HyDE (embed a hypothetical answer, not the query). Embedding model swaps come fourth.
      </Predict>

      {/* pipeline visualization */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">the 8-step RAG pipeline</div>
        <ol className="space-y-1.5">
          {PIPELINE_STEPS.map((s, i) => (
            <li key={s.name} className="flex items-start gap-2">
              <div className={`shrink-0 mt-0.5 w-5 h-5 rounded ${chipPalette[s.color].replace('text-', 'text-').split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ')} flex items-center justify-center text-[10px] font-mono`}>
                {i + 1}
              </div>
              <div className="flex-1 text-[11px]">
                <span className={`${chipPalette[s.color].split(' ').find(s2 => s2.startsWith('text-'))} font-semibold`}>{s.name}</span>
                <span className="text-neutral-400"> &mdash; {s.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">vector DB choice</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {VECTOR_OPTIONS.map(x => (
            <button key={x.id} onClick={() => setActive(x.id)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
                active === x.id
                  ? `${chipPalette[x.color]} ring-1 ring-current/30`
                  : 'border-white/10 text-neutral-400 hover:bg-white/5'
              }`}>
              {x.name}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
            <div className={`text-base font-semibold ${chipPalette[o.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {o.name}
            </div>
            <div className="flex gap-1 flex-wrap">{o.chips.map(c => <Chip key={c} color={o.color}>{c}</Chip>)}</div>
          </div>
          <div className="text-[12px] text-neutral-200 leading-snug mb-3">{o.blurb}</div>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
              <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mb-0.5">when to pick</div>
              <div className="text-[11px] text-neutral-200 leading-snug">{o.when}</div>
            </div>
            <div className="rounded border border-rose-400/20 bg-rose-400/5 px-3 py-2">
              <div className="text-[9px] uppercase tracking-[0.18em] text-rose-300 mb-0.5">when to avoid</div>
              <div className="text-[11px] text-neutral-200 leading-snug">{o.avoid}</div>
            </div>
          </div>
        </div>
      </div>

      <WhenItMatters>
        When the LLM needs to reference your private data &mdash; product docs, customer history,
        ticket archive, knowledge base. <em>Not</em> when the data fits in the system prompt
        (under ~50k tokens) and changes rarely &mdash; long-context + caching often beats RAG there.
      </WhenItMatters>

      <Misconception
        wrong="The vector DB choice is the most important RAG decision."
        right="The chunking and reranking strategy moves recall by 25%+; the vector DB choice moves recall by ~0%. All four DBs run cosine ANN over the same embeddings — they differ in cost, latency, and ops, not retrieval quality."
        because="People compare DBs because the names are concrete and the docs are dense; chunking is messier and harder to benchmark. The asymmetric leverage means: spend a week on chunking + reranking before spending an hour comparing vector DBs."
      />

      <Deeper>
        <p>
          <strong>When NOT to RAG.</strong>{' '}
          If your private data fits in &lt;50k tokens and changes rarely (your product&apos;s
          documentation, your company&apos;s policies), put it in the system prompt + <Term>prompt caching</Term>.
          One paid system-prompt prefix beats a RAG pipeline for cost, latency, and reliability. RAG
          earns its keep when (a) data &gt; 100k tokens, (b) data changes hourly, (c) you need
          per-tenant data isolation in the prompt.
        </p>
        <p>
          <strong>Chunking is the underrated knob.</strong>{' '}
          Default character-count chunking (1000 chars, 200 overlap) is the easy mode and gets you
          ~70% of optimal recall. Semantic chunking (split on heading boundaries, paragraph breaks)
          and propositional chunking (one fact per chunk) get you the rest. Worth experimenting
          with on real eval data before you ship.
        </p>
        <p>
          <strong>HyDE often beats query embedding directly.</strong>{' '}
          User queries are short and ambiguous; documents are long and specific. Embedding the query
          as-is creates an alignment gap. HyDE: ask the LLM to generate a hypothetical answer first,
          embed that, search with it. Worse on the rare query that&apos;s already perfectly phrased;
          much better on the typical natural-language query.
        </p>
        <p>
          <strong>Hybrid search beats pure vector for many corpora.</strong>{' '}
          BM25 (keyword) + vector (semantic) combined via reciprocal-rank-fusion outperforms either
          alone, especially for queries with technical terms or product names that should match exactly.
          Postgres FTS + pgvector gets you both in one query. <CrossLink to="adjacent" recap="Search tile in adjacent layer card.">search tile</CrossLink>{' '}
          is also relevant.
        </p>
      </Deeper>

      <QA items={[
        { q: 'Do I need a separate vector DB if I\'m on Postgres?',
          a: 'Almost never. pgvector with HNSW indexes does k-NN over millions of embeddings in single-digit milliseconds. The cases where you legitimately need a separate vector DB are: >100M vectors, sub-5ms latency requirement, or per-tenant namespace counts in the thousands.' },
        { q: 'Which embedding model?',
          a: 'For English: OpenAI text-embedding-3-small ($0.02/1M tokens) is the cheap default; Cohere embed-english-v3 or voyage-3 are stronger but more expensive. The capability gap is 5-10% NDCG; for most apps, not worth the cost. Frontier embeddings matter more for multilingual.' },
        { q: 'How do I keep RAG fresh as data changes?',
          a: 'Background job per write: when source data changes, re-chunk + re-embed + upsert. <CrossLink to="jobs">Jobs & queues</CrossLink> handle this. Watch the embedding-cost line; for high-write apps, batch updates daily instead of per-write.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   13 — AGENTS & TOOL USE
   When you actually need an agent vs a workflow. The harness choices.
   The "do you need an agent?" gate.
   ========================================================================== */

const AGENT_HARNESS = [
  {
    id: 'vercel-ai', name: 'Vercel AI SDK',
    color: 'fuchsia',
    blurb: 'Streaming + tool calling + UI primitives. Fits inside your Next.js app — no separate service.',
    fit: 'Tool-calling chat UX in a fullstack app; Next.js / React.',
    avoid: 'Long-running multi-step agents (move to Inngest/Trigger steps).',
  },
  {
    id: 'agents-sdk', name: 'OpenAI Agents / Anthropic Agent SDK',
    color: 'sky',
    blurb: 'Provider-native loops with handoffs, guardrails, tracing. Tight integration with provider features.',
    fit: 'Single-provider production agents. Less framework, more SDK.',
    avoid: 'Multi-provider routing; want to stay model-agnostic.',
  },
  {
    id: 'mastra', name: 'Mastra',
    color: 'emerald',
    blurb: 'TS-first agent framework. Workflows, evals, RAG primitives bundled. Open source.',
    fit: 'TS-end-to-end shop wanting workflows + agents + evals together.',
    avoid: 'You want minimal deps; can build the seams yourself.',
  },
  {
    id: 'langgraph', name: 'LangGraph',
    color: 'violet',
    blurb: 'State-machine for agents. Python-first; TS port exists. Heaviest framework — earns it for complex DAGs.',
    fit: 'Multi-agent systems with non-trivial control flow.',
    avoid: 'Simple tool-calling chat; LangGraph is overkill.',
  },
  {
    id: 'roll', name: 'Roll your own',
    color: 'amber',
    blurb: 'A while-loop, a tool registry, JSON schema validation. ~200 lines.',
    fit: 'Domain-specific agent where you understand the loop you want.',
    avoid: 'You\'ll need observability + retries + handoffs — at which point reach for a framework.',
  },
];

const AgentsToolsCard = () => {
  const [active, setActive] = useState('vercel-ai');
  const h = AGENT_HARNESS.find(x => x.id === active);

  return (
    <Card id="agents" icon={Bot} title="Agents & tool use" accent="rose" index={13}
          subtitle="An agent is an LLM in a loop deciding what to do. Most products that ship 'agents' actually need workflows. Know the difference.">
      <MinSchema>
        Default <span className="text-fuchsia-300">Vercel AI SDK</span> for in-app chat with tools.
        Move to <span className="text-sky-300">Agent SDKs</span> or <span className="text-violet-300">LangGraph</span>{' '}
        only when control flow gets non-trivial. The first question is always: <em>do you actually
        need an agent</em>?
      </MinSchema>

      <p>
        The line between &ldquo;agent&rdquo; and &ldquo;workflow&rdquo; is fuzzy. A workflow is a
        known DAG with optional LLM steps. An <Term>agent</Term> is an LLM, in a loop, choosing
        from a tool palette &mdash; no fixed DAG. Workflows are reliable and cheap; agents are
        flexible and expensive. Most products that say &ldquo;we built an agent&rdquo; should have
        built a workflow.
      </p>

      <Predict question="A SaaS feature: 'summarize this customer's last 50 tickets and recommend a category.' Workflow or agent?">
        Workflow. The steps are known: fetch tickets → call LLM with summarization prompt → parse
        category → write back. No tool palette needed; one LLM call wrapped in deterministic code.
        If the customer asks &ldquo;and also draft a reply&rdquo; you add a step. If they ask &ldquo;decide
        which of these things to do based on the data,&rdquo; that&apos;s when you upgrade to an
        agent.
      </Predict>

      {/* the gate */}
      <div className="mt-4 rounded-lg border border-rose-400/25 bg-rose-400/5 p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-rose-300 mb-2">the &ldquo;do you need an agent&rdquo; gate</div>
        <ol className="space-y-1.5 text-[12px] text-neutral-200 leading-snug">
          <li>1. <span className="text-emerald-300">Can the steps be enumerated up front?</span> &rarr; workflow.</li>
          <li>2. <span className="text-emerald-300">Does the LLM need to decide which tool to call next?</span> &rarr; tool-calling, not necessarily an agent.</li>
          <li>3. <span className="text-fuchsia-300">Does the LLM need to decide whether to keep going?</span> &rarr; now you need an agent.</li>
          <li>4. <span className="text-rose-300">Does the LLM need to decide its own goals?</span> &rarr; this is research, not production yet.</li>
        </ol>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {AGENT_HARNESS.map(x => (
          <button key={x.id} onClick={() => setActive(x.id)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              active === x.id
                ? `${chipPalette[x.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className={`text-base font-semibold mb-2 ${chipPalette[h.color].split(' ').find(s => s.startsWith('text-'))}`}>
          {h.name}
        </div>
        <div className="text-[12px] text-neutral-200 leading-snug mb-3">{h.blurb}</div>
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mb-0.5">fit</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{h.fit}</div>
          </div>
          <div className="rounded border border-rose-400/20 bg-rose-400/5 px-3 py-2">
            <div className="text-[9px] uppercase tracking-[0.18em] text-rose-300 mb-0.5">avoid when</div>
            <div className="text-[11px] text-neutral-200 leading-snug">{h.avoid}</div>
          </div>
        </div>
      </div>

      <WhenItMatters>
        Whenever you say &ldquo;our product has an AI agent&rdquo;. Most of the time, what works is
        more constrained &mdash; tool-calling chat, or a multi-step workflow with LLM nodes. Reaching
        for an agent harness too early gives up reliability for flexibility you don&apos;t use.
      </WhenItMatters>

      <Misconception
        wrong="Agents are the future; workflows are legacy."
        right="In production today, workflows ship more reliably than agents. The 'agent' framing is right when the user genuinely can't predict the steps; otherwise it costs you control + cost + latency for flexibility you don't need."
        because="Agents fail in compounding ways: one wrong tool call cascades into a wrong-shape state, more tool calls trying to fix it, and silent budget burn. Workflows fail in localized ways: one step errors, you retry just that step. Production-grade SaaS prefers the latter unless the agent shape is genuinely required."
      />

      <Deeper>
        <p>
          <strong>The <Term>ReAct</Term> loop in code.</strong>{' '}
          Most agent harnesses implement the same loop: send messages → model emits tool calls →
          execute tools → append results → repeat until model emits a final answer. ~50 lines of TS.
          The framework choice is about what comes <em>around</em> the loop: durable execution,
          tracing, guardrails, handoffs, parallel tool calls.
        </p>
        <p>
          <strong>Tool calling vs structured output.</strong>{' '}
          If you just need the model to return a parsed object, use structured output / JSON mode &mdash;
          one call, no loop, deterministic. Use tool calling when the model needs to <em>do</em> something
          (read, write, search). Many &ldquo;agents&rdquo; are structured-output calls in a trench coat.
        </p>
        <p>
          <strong>Token budgets and the unbounded loop problem.</strong>{' '}
          Without a hard cap, an agent loop can spend $50 on one user request. Production-grade rules:
          (1) max steps per run (typically 10-30), (2) max tokens per run, (3) timeouts per tool call,
          (4) cost circuit breaker per user per day. <CrossLink to="eval" recap="Eval & cost card.">cost lever lives in the eval card</CrossLink>.
        </p>
        <p>
          <strong>MCP for tool standardization.</strong>{' '}
          Anthropic&apos;s <Term>MCP</Term> standardizes how an LLM client talks to a tool/data server.
          One implementation, many clients. Worth learning when you maintain tools used by multiple
          AI clients (your app + Claude desktop + Cursor); overkill when you have one client.
        </p>
      </Deeper>

      <QA items={[
        { q: 'When does an agent actually beat a workflow in production?',
          a: 'Three patterns hold up: (1) open-ended research / web browse / extraction tasks where the steps depend on what was just found, (2) multi-tool customer-support agents where the user request is unstructured, (3) coding agents (autonomous PR generation). For most B2B SaaS features, workflows ship more reliably.' },
        { q: 'How many tools should I expose to an agent?',
          a: 'Under 10 if at all possible; under 20 firmly. Above that, the model gets confused about which tool to use and accuracy drops. Patterns to keep tools low: namespace tools by sub-agent (handoffs), expose "list_actions" as a meta-tool with detailed help, use structured output to constrain to a sub-set per request.' },
        { q: 'What\'s the production-grade observability for an agent?',
          a: 'Per-run trace with: every message, every tool call, latency per step, tokens per step, total cost. Langfuse and Braintrust both ship this. <CrossLink to="eval">eval card</CrossLink> has more.' },
      ]} />
    </Card>
  );
};

/* ============================================================================
   14 — AI EVAL & COST CONTROL
   The infra that makes AI features production-grade. Braintrust / Langfuse /
   Helicone. Cost-per-feature lens. Token budgets.
   ========================================================================== */

const EVAL_TOOLS = [
  {
    id: 'braintrust', name: 'Braintrust',
    color: 'fuchsia',
    blurb: 'Eval-first. Datasets, scorers (deterministic + LLM-judge), regression on every PR. The "we test our prompts" pick.',
    fit: 'You ship AI features and want CI-style regression checks.',
    cost: 'free tier; pay-per-eval-run',
  },
  {
    id: 'langfuse', name: 'Langfuse',
    color: 'sky',
    blurb: 'Open-source observability + eval. Traces, prompt versioning, datasets. Self-hostable.',
    fit: 'Self-host requirement; want OSS; observability is the headline.',
    cost: 'free self-host; hosted tier',
  },
  {
    id: 'helicone', name: 'Helicone',
    color: 'emerald',
    blurb: 'Proxies your LLM calls and gives you observability + caching + rate-limiting. Lowest setup friction.',
    fit: 'You want zero-instrumentation logging; happy with a proxy.',
    cost: 'free tier; pay-per-request',
  },
  {
    id: 'logfire', name: 'Logfire / Datadog LLM Obs',
    color: 'violet',
    blurb: 'Generic APM with LLM-aware features. Fits if you already use Datadog / Sentry / Honeycomb.',
    fit: 'You want one observability vendor for both AI and traditional traces.',
    cost: 'tied to APM bill',
  },
  {
    id: 'roll', name: 'Roll your own',
    color: 'amber',
    blurb: 'Postgres table for prompt versions + a `golden_evals` table + a CI script. Smallest possible eval infra.',
    fit: 'Single LLM feature; small team; ~100 LoC of infra.',
    cost: 'effectively free',
  },
];

const EVAL_TYPES = [
  { name: 'Deterministic', color: 'emerald', desc: 'Regex match, JSON-schema valid, exact tool-call args. Fast, cheap, catches obvious regressions.' },
  { name: 'LLM-as-judge',  color: 'fuchsia', desc: 'A second LLM scores the first against a rubric. Calibrate vs human labels first; cheap at scale, biased toward verbose answers.' },
  { name: 'Human review',  color: 'sky',     desc: 'A human spot-checks N samples per release. The truth-meter; expensive; do at the start of each prompt change.' },
  { name: 'Online metrics',color: 'amber',   desc: 'Production telemetry: thumbs-up rate, regenerate rate, completion-of-task rate. Long feedback loop, real signal.' },
];

const AiEvalCostCard = () => {
  const [active, setActive] = useState('braintrust');
  const t = EVAL_TOOLS.find(x => x.id === active);

  return (
    <Card id="eval" icon={BarChart3} title="AI eval & cost control" accent="rose" index={14}
          subtitle="The infra that turns AI features from 'demo' into 'production'. Eval is where the maturity gap shows.">
      <MinSchema>
        Day 1: a <span className="text-fuchsia-300">golden set</span> of 20 hand-picked input/output
        pairs in a JSON file + a CI script that runs the model against them. Add{' '}
        <span className="text-fuchsia-300">Braintrust</span> or <span className="text-sky-300">Langfuse</span>{' '}
        when the test surface grows.
      </MinSchema>

      <p>
        AI features have a quiet failure mode: they work in the demo, work for the founder, work for
        the first 100 users, and then a model upgrade or a prompt tweak silently regresses 5% of
        responses. Without <Term>eval</Term>, you find out from a customer ticket. With eval, your
        CI catches it.
      </p>

      <Predict question="On a $500/mo LLM bill, what's the single highest-leverage move to cut it 60%?">
        Wire up <Term>prompt caching</Term>. Anthropic and OpenAI both cache static prefixes of your
        prompts at 10% of input cost. For chat workloads (long system prompt + tools schema, short
        user turn), the first ~80% of every request becomes cache-hit. Easy 5-10x reduction on
        input cost, no quality change. Most teams skip this because the docs aren&apos;t loud.
      </Predict>

      {/* eval types grid */}
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">four ways to score an LLM output</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {EVAL_TYPES.map(t => (
            <div key={t.name} className={`rounded-lg border ${chipPalette[t.color].split(' ').find(s => s.startsWith('border-'))} bg-white/[0.02] p-3`}>
              <div className={`text-[12px] font-semibold ${chipPalette[t.color].split(' ').find(s => s.startsWith('text-'))} mb-1`}>
                {t.name}
              </div>
              <div className="text-[11px] text-neutral-300 leading-snug">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">eval / observability tooling</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {EVAL_TOOLS.map(x => (
            <button key={x.id} onClick={() => setActive(x.id)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
                active === x.id
                  ? `${chipPalette[x.color]} ring-1 ring-current/30`
                  : 'border-white/10 text-neutral-400 hover:bg-white/5'
              }`}>
              {x.name}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
            <div className={`text-base font-semibold ${chipPalette[t.color].split(' ').find(s => s.startsWith('text-'))}`}>
              {t.name}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">{t.cost}</div>
          </div>
          <div className="text-[12px] text-neutral-200 leading-snug mb-2">{t.blurb}</div>
          <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[11px] text-neutral-200">
            <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 mr-2">fit</span>
            {t.fit}
          </div>
        </div>
      </div>

      <Worked title="Cost levers, ranked by impact">
        <ol className="list-decimal pl-4 space-y-1">
          <li><span className="text-fuchsia-300">Prompt caching</span> &mdash; 5-10× on input cost; 1 day of work</li>
          <li><span className="text-violet-300">Model routing</span> &mdash; cheap classifier picks cheap-vs-frontier model; 3-5×; 1 week</li>
          <li><span className="text-sky-300">Batch API</span> &mdash; 50% off for non-sync work; 1 day</li>
          <li><span className="text-emerald-300">Token budgets</span> &mdash; per-user-per-day caps stop runaway agents; 1 day</li>
          <li><span className="text-amber-300">Output structuring</span> &mdash; constrained decoding cuts retries; ~10-30%; 2 days</li>
        </ol>
      </Worked>

      <WhenItMatters>
        Two moments: (1) the moment your AI feature has more than ~50 daily users (you lose
        per-user oversight), (2) the moment your monthly LLM bill crosses ~$1k. Below those, eval
        is &ldquo;keep a JSON file of inputs&rdquo;. Above, you need the infra.
      </WhenItMatters>

      <Misconception
        wrong="Eval is something you add later, when the model starts misbehaving."
        right="Eval is the substrate that makes 'fix the model' possible. Without it, you can't tell whether your prompt change improved or regressed; without it, you can't safely upgrade to a new model. The day-1 cost is 1 hour for 20 golden examples; the day-100 cost of NOT having it is 'we changed a prompt and customers complained for two weeks'."
        because="Iteration speed on AI features is bottlenecked by your ability to know if a change helped. Eval is the iteration enabler, not a maturity-stage feature. Every successful AI product has eval; the unsuccessful ones don't, and didn't notice in time."
      />

      <Deeper>
        <p>
          <strong>The <Term>golden set</Term> minimum.</strong>{' '}
          Twenty inputs that span: easy / medium / hard, edge cases you&apos;ve hit in production,
          and the failure modes you most fear. Pair each with the expected output (or a rubric for
          LLM-as-judge). Run the model against the set on every prompt change; track the score over
          time. Adds ~1 hour to set up, saves weeks of debugging.
        </p>
        <p>
          <strong>LLM-as-judge calibration.</strong>{' '}
          <Term>LLM-as-judge</Term> scoring is the only thing that scales for nuanced quality
          (helpfulness, tone, factuality). It&apos;s also biased &mdash; toward longer answers, toward
          its own writing style, toward agreement with prefixes. Calibrate vs human labels on 50-100
          samples before trusting it. Re-calibrate when you change judge model.
        </p>
        <p>
          <strong>Token budgets save you from bill surprises.</strong>{' '}
          Hard cap per-user-per-day token spend in your gateway. When a user hits it, return a
          friendly &ldquo;please try again later&rdquo;. Without this, one looping agent or one
          adversarial user can cost you your monthly bill in an hour. <Term>Token budget</Term>
          enforcement lives at the call site or in a proxy (Helicone, your own).
        </p>
        <p>
          <strong>Cost-per-feature lens.</strong>{' '}
          For each AI feature: token cost per use × uses per month / paying customers using it.
          If a feature costs $5/customer/month and the customer pays $40/month, that&apos;s a 12.5%
          margin hit &mdash; check it&apos;s pulling its weight in retention or upsell. The exercise
          quietly reshapes which features survive.
        </p>
      </Deeper>

      <QA items={[
        { q: 'How big should my golden set be?',
          a: '20 to start, 100 by month 3, ~500 by month 12. Quality matters more than count — a hand-curated 50 beats a randomly-sampled 500. Augment with edge-cases pulled from production traces (Langfuse / Braintrust both auto-collect these).' },
        { q: 'Should I version my prompts?',
          a: 'Yes — at minimum a git-committed const string per prompt; ideally a Postgres table with a version, a name, the body, and a created_at. Then your eval runs reference a prompt version, and you can A/B test in production. Braintrust / Langfuse / Mastra all bundle this.' },
        { q: 'Is eval really worth it for my one AI feature?',
          a: "If the feature is non-critical (a 'try our AI summarizer' button), no — golden set in JSON is fine. If the feature is core (your product IS the AI feature), the eval infra IS your QA team. Building it later costs more than building it now." },
      ]} />
    </Card>
  );
};

/* ============================================================================
   15 — ★ THE DEFAULT STACK (anchor)
   The opinionated lineup. One row per layer; each row shows the pick, the
   ballpark cost @ 10k MAU, the ballpark setup time, and the AI-codegen-friendliness.
   The reader leaves with one stack memorized.
   ========================================================================== */

const DEFAULT_STACK = [
  { layer: 'App framework',   pick: 'Next.js (App Router) + TS', cost: 'free',      setup: '10 min', codegen: 'A',  link: 'app',      color: 'sky' },
  { layer: 'API shape',       pick: 'Server Actions',            cost: 'free',      setup: '0',      codegen: 'A',  link: 'api',      color: 'sky' },
  { layer: 'Database',        pick: 'Postgres (Neon)',           cost: '$0-20/mo',  setup: '5 min',  codegen: 'A+', link: 'db',       color: 'violet' },
  { layer: 'ORM',             pick: 'Drizzle + Drizzle Kit',     cost: 'free',      setup: '15 min', codegen: 'A',  link: 'orm',      color: 'violet' },
  { layer: 'Auth & tenancy',  pick: 'Clerk · shared schema + tenant_id + RLS', cost: '$25/mo + MAU', setup: '30 min', codegen: 'A', link: 'auth', color: 'emerald' },
  { layer: 'Hosting',         pick: 'Vercel',                    cost: '$0-20/mo',  setup: '5 min',  codegen: 'A+', link: 'host',     color: 'emerald' },
  { layer: 'Jobs / queues',   pick: 'Inngest',                   cost: 'free tier', setup: '20 min', codegen: 'A',  link: 'jobs',     color: 'amber' },
  { layer: 'Observability',   pick: 'Sentry + Axiom + Better Stack', cost: '~$50/mo', setup: '30 min', codegen: 'A', link: 'obs',      color: 'amber' },
  { layer: 'Adjacent',        pick: 'Stripe · Resend · R2 · PostHog',     cost: 'as-needed', setup: 'per-pain', codegen: 'A', link: 'adjacent', color: 'orange' },
  { layer: 'LLM provider',    pick: 'Anthropic (Claude Sonnet) + thin wrapper', cost: 'per use', setup: '5 min',  codegen: 'A',  link: 'llm',      color: 'fuchsia' },
  { layer: 'RAG / vectors',   pick: 'pgvector (in your existing Postgres)', cost: 'free',      setup: '15 min', codegen: 'A',  link: 'rag',      color: 'fuchsia' },
  { layer: 'Agents / tools',  pick: 'Vercel AI SDK',             cost: 'free',      setup: '30 min', codegen: 'A',  link: 'agents',   color: 'rose' },
  { layer: 'Eval & cost',     pick: 'JSON golden-set + CI · Braintrust at scale', cost: 'free → $50/mo', setup: '1 hr', codegen: 'A', link: 'eval', color: 'rose' },
];

const CODEGEN_COLOR = { 'A+': 'text-emerald-200', 'A': 'text-emerald-300', 'B': 'text-amber-300', 'C': 'text-rose-300' };

const DefaultStackCard = () => {
  return (
    <Card id="stack" icon={Boxes} title="The default stack" accent="fuchsia" index={15} anchor
          subtitle="One opinionated production-grade lineup for AI-native B2B SaaS by 1-3 vibecoding devs. Cost ballparks at 10k MAU.">
      <MinSchema>
        Thirteen layers, one pick each. Total day-1 cost ~<span className="text-fuchsia-300">$100/mo</span>{' '}
        plus per-MAU and per-LLM-use. Total setup time from a clean repo ~<span className="text-fuchsia-300">half a day</span>.
        Click any row to jump back to the layer card and see why this pick wins.
      </MinSchema>

      <p>
        This is the &ldquo;just tell me what to use&rdquo; answer. It is not the only correct
        answer, but it is the one that has the least chance of biting you in production for the
        broadest case (production-grade SaaS / ERP, AI-native, 1-3 devs, US/EU customers, no
        compliance mandates). Every deviation is real and has a trigger &mdash;{' '}
        <CrossLink to="deviation" recap="The deviation map: when to swap each layer.">covered next</CrossLink>.
      </p>

      {/* the table */}
      <div className="mt-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/[0.03] overflow-hidden">
        <div className="grid grid-cols-[1.2fr_2fr_0.8fr_0.7fr_0.5fr] gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-300 border-b border-fuchsia-400/20 bg-fuchsia-400/[0.05]">
          <div>layer</div>
          <div>pick</div>
          <div className="text-right">cost @ 10k MAU</div>
          <div className="text-right">setup</div>
          <div className="text-right">AI-cg</div>
        </div>
        {DEFAULT_STACK.map((r, i) => (
          <a key={i} href={`#${r.link}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(r.link)?.scrollIntoView({ behavior: 'smooth' }); }}
            className="grid grid-cols-[1.2fr_2fr_0.8fr_0.7fr_0.5fr] gap-2 px-4 py-2.5 text-[12px] border-t border-fuchsia-400/10 first:border-t-0 hover:bg-fuchsia-400/[0.05] transition-colors no-underline">
            <div className={`${chipPalette[r.color].split(' ').find(s => s.startsWith('text-'))} font-medium`}>{r.layer}</div>
            <div className="text-neutral-100">{r.pick}</div>
            <div className="text-right text-neutral-300 font-mono tabular-nums text-[11px]">{r.cost}</div>
            <div className="text-right text-neutral-400 font-mono text-[11px]">{r.setup}</div>
            <div className={`text-right font-mono font-semibold ${CODEGEN_COLOR[r.codegen]}`}>{r.codegen}</div>
          </a>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="day-1 fixed cost"  value="~$100/mo"  sub="Sentry + Axiom + Clerk + Better Stack" color="text-fuchsia-200" />
        <Stat label="@ 10k MAU"         value="~$300-600/mo" sub="add LLM + Stripe fees + Vercel"     color="text-fuchsia-200" />
        <Stat label="setup, end-to-end" value="~4 hours"  sub="from `npx create-next-app` to `git push`" color="text-fuchsia-200" />
      </div>

      <Worked title="What you get from this stack on day 1">
        <ul className="space-y-1">
          <li>· Multi-tenant auth with org/team/role primitives, SSO available with one toggle.</li>
          <li>· Postgres with pgvector for RAG and pg_cron for scheduled jobs.</li>
          <li>· One repo, one deploy target, end-to-end TypeScript.</li>
          <li>· Streaming AI chat with tool calling, durable background workflows.</li>
          <li>· Errors, traces, logs, uptime monitoring, status page.</li>
          <li>· LLM cost guardrails (token budgets, prompt caching, eval on PR).</li>
          <li>· Preview deploy per PR with isolated Postgres branch.</li>
        </ul>
      </Worked>

      <WhenItMatters>
        Day 1 of a new product. By committing to this default, you skip ~20-40 hours of stack
        bikeshedding and ship code instead. Every choice has a printed deviation trigger;
        you don&apos;t lose flexibility &mdash; you defer the decisions that don&apos;t need to
        happen yet.
      </WhenItMatters>

      <Deeper>
        <p>
          <strong>Why these picks &mdash; the through-line.</strong>{' '}
          Every choice optimizes for: (1) AI-codegen-friendliness (large training corpus, idiomatic
          patterns), (2) end-to-end TypeScript (one type system from DB to browser), (3) one vendor
          where it makes sense (Vercel for hosting, Clerk for auth, Sentry for errors), (4)
          escape hatches preserved (Postgres → portable, Drizzle → SQL when you need it, Anthropic
          SDK → swap providers in a day). It is opinionated about the seams, not the tools.
        </p>
        <p>
          <strong>The 10% of cases this is wrong for.</strong>{' '}
          Heavy ML inference in the request path (Python sidecar wins). Compliance / data-residency
          constraints (Bedrock / VPC). Mostly-static content sites (Astro). Existing Vue or Python
          team (Nuxt / FastAPI). Each is covered as a deviation in the next card.
        </p>
        <p>
          <strong>What this stack is NOT.</strong>{' '}
          It is not the cheapest at 10M MAU (Cloudflare + Postgres self-hosted is). It is not the
          most enterprise-ready (WorkOS + AWS + Datadog is). It is not the most flexible
          (a multi-cloud, K8s-based one is). It is the highest-leverage default for the specific
          shape declared in the subtitle: production-grade AI-native SaaS for 1-3 vibecoding devs.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   16 — ★ THE DEVIATION MAP (anchor)
   The operational deliverable. Filterable rubric of "if X, swap Y for Z".
   Categorized by trigger. Reader leaves with a concrete checklist.
   ========================================================================== */

const DEVIATIONS = [
  // Compliance / enterprise
  { trigger: 'compliance', triggerLabel: 'compliance / enterprise',
    when: 'Need SOC 2 / HIPAA / data residency / VPC deploy',
    swap: 'Hosting',
    from: 'Vercel',
    to: 'AWS App Runner / GCP Cloud Run + Bedrock / Vertex',
    why: 'Compliance auditors want VPC + KMS + audit trails Vercel doesn\'t expose.' },
  { trigger: 'compliance', triggerLabel: 'compliance / enterprise',
    when: 'Healthcare / regulated finance with BAA / DPA',
    swap: 'LLM provider',
    from: 'Anthropic direct',
    to: 'AWS Bedrock (Claude) or Azure OpenAI',
    why: 'Hyperscaler-hosted models include compliance paperwork; first-party APIs do not.' },
  { trigger: 'compliance', triggerLabel: 'compliance / enterprise',
    when: 'Enterprise RFP requires SSO/SAML/SCIM',
    swap: 'Auth provider',
    from: 'Clerk',
    to: 'WorkOS',
    why: 'WorkOS treats SSO/SAML/SCIM as the headline product; Clerk is a paid add-on.' },

  // Cost / scale
  { trigger: 'cost', triggerLabel: 'cost at scale',
    when: 'Vercel bill > $1k/mo at 100k MAU',
    swap: 'Hosting',
    from: 'Vercel',
    to: 'Cloudflare Workers + Pages',
    why: 'Cloudflare\'s pricing is ~10x cheaper at scale; bandwidth is free egress.' },
  { trigger: 'cost', triggerLabel: 'cost at scale',
    when: 'LLM bill > $5k/mo with high cache-miss rate',
    swap: 'LLM strategy',
    from: 'Single-provider direct',
    to: 'Provider routing + Anthropic prompt cache + batch API',
    why: '5-10x reduction available without changing user experience.' },
  { trigger: 'cost', triggerLabel: 'cost at scale',
    when: 'Pinecone / dedicated vector DB bill is meaningful',
    swap: 'Vector store',
    from: 'Pinecone / Qdrant Cloud',
    to: 'pgvector or Turbopuffer',
    why: 'pgvector is free with your DB; Turbopuffer is ~10x cheaper than Pinecone.' },

  // Specific app shape
  { trigger: 'shape', triggerLabel: 'app shape',
    when: 'Heavy ML / numerical inference in request path',
    swap: 'Backend split',
    from: 'Next.js Server Actions',
    to: 'Next.js (frontend) + FastAPI sidecar',
    why: 'Python ML libs in Node = pain; sidecar isolates the heavy lifting.' },
  { trigger: 'shape', triggerLabel: 'app shape',
    when: 'Mostly static content (docs, marketing, knowledge base)',
    swap: 'App framework',
    from: 'Next.js',
    to: 'Astro',
    why: 'Astro ships ~0 KB JS by default; islands hydrate per-component.' },
  { trigger: 'shape', triggerLabel: 'app shape',
    when: 'Multi-tenant with thousands of namespaces',
    swap: 'Vector store',
    from: 'pgvector',
    to: 'Turbopuffer',
    why: 'Turbopuffer is designed for many small tenant namespaces; pgvector struggles past a few hundred.' },
  { trigger: 'shape', triggerLabel: 'app shape',
    when: 'Long-running multi-day workflows',
    swap: 'Jobs platform',
    from: 'Inngest',
    to: 'Temporal',
    why: 'Temporal\'s durable execution survives multi-day workflows with strong consistency.' },

  // Team
  { trigger: 'team', triggerLabel: 'team / language',
    when: 'Existing Vue.js team + skills',
    swap: 'App framework',
    from: 'Next.js',
    to: 'Nuxt',
    why: 'Skills > defaults. Vue ecosystem is mature; reskilling is the larger cost.' },
  { trigger: 'team', triggerLabel: 'team / language',
    when: 'Backend team prefers Python; ML in request path',
    swap: 'API framework',
    from: 'Server Actions',
    to: 'FastAPI / NestJS backend + Next.js frontend',
    why: 'Type safety can still come via OpenAPI codegen; team velocity wins.' },

  // Vendor risk
  { trigger: 'vendor', triggerLabel: 'vendor risk',
    when: 'You want zero vendor lock-in',
    swap: 'Auth',
    from: 'Clerk',
    to: 'Auth.js (NextAuth)',
    why: 'Trade engineering cost for vendor independence; reasonable for OSS / indie.' },
  { trigger: 'vendor', triggerLabel: 'vendor risk',
    when: 'Open-source / self-host requirement',
    swap: 'Eval & obs',
    from: 'Braintrust',
    to: 'Langfuse (self-hosted)',
    why: 'Langfuse self-hosts; Braintrust is hosted-only.' },

  // AI-native intensity
  { trigger: 'ai-native', triggerLabel: 'AI-native intensity',
    when: 'AI is the product (not a feature)',
    swap: 'Eval / obs priority',
    from: 'JSON golden set (day 1)',
    to: 'Braintrust / Langfuse from day 1; eval as core team',
    why: 'Eval IS your QA team when AI is the product. Front-load the investment.' },
  { trigger: 'ai-native', triggerLabel: 'AI-native intensity',
    when: 'Agent runs > 10 minutes',
    swap: 'Jobs platform',
    from: 'Inline serverless',
    to: 'Trigger.dev or Temporal with step functions',
    why: 'Serverless function caps + LLM rate limits force durable execution.' },
];

const TRIGGER_GROUPS = [
  { key: 'compliance', label: 'compliance / enterprise', color: 'rose' },
  { key: 'cost',       label: 'cost at scale',           color: 'amber' },
  { key: 'shape',      label: 'app shape',               color: 'fuchsia' },
  { key: 'team',       label: 'team / language',         color: 'sky' },
  { key: 'vendor',     label: 'vendor risk',             color: 'violet' },
  { key: 'ai-native',  label: 'AI-native intensity',     color: 'emerald' },
];

const DeviationMapCard = () => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? DEVIATIONS : DEVIATIONS.filter(d => d.trigger === filter);
  const counts = useMemo(() => {
    const c = { all: DEVIATIONS.length };
    for (const g of TRIGGER_GROUPS) c[g.key] = DEVIATIONS.filter(d => d.trigger === g.key).length;
    return c;
  }, []);

  return (
    <Card id="deviation" icon={GitFork} title="The deviation map" accent="fuchsia" index={16} anchor
          subtitle="Sixteen rules of 'if X, swap Y for Z' across the 13 layers. The operational rubric — pin this somewhere.">
      <MinSchema>
        The default stack is right ~80% of the time. The other 20% has a named trigger.
        Filter by trigger, find your row, swap one component. Most deviations cost <em>days</em>{' '}
        of work, not weeks &mdash; the lock-in fear is bigger than the actual cost.
      </MinSchema>

      <p>
        Every row of this table is a rule a real team has hit. The pattern: a trigger appears (a
        compliance RFP, a cost spike, a Python lib mandate), one or two layers in the default need
        to swap. The rest of the stack is unchanged. This card is the deliverable &mdash; pin it
        somewhere.
      </p>

      {/* trigger filter */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <button onClick={() => setFilter('all')}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
            filter === 'all'
              ? 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100 ring-1 ring-fuchsia-400/30'
              : 'border-white/10 text-neutral-400 hover:bg-white/5'
          }`}>
          all <span className="opacity-60 ml-1">{counts.all}</span>
        </button>
        {TRIGGER_GROUPS.map(g => (
          <button key={g.key} onClick={() => setFilter(g.key)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors ${
              filter === g.key
                ? `${chipPalette[g.color]} ring-1 ring-current/30`
                : 'border-white/10 text-neutral-400 hover:bg-white/5'
            }`}>
            {g.label} <span className="opacity-60 ml-1">{counts[g.key]}</span>
          </button>
        ))}
      </div>

      {/* deviations table */}
      <div className="mt-3 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/[0.02] overflow-hidden">
        {filtered.map((d, i) => {
          const groupColor = TRIGGER_GROUPS.find(g => g.key === d.trigger)?.color || 'neutral';
          return (
            <div key={i} className="border-t border-fuchsia-400/10 first:border-t-0 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <Chip color={groupColor}>{d.triggerLabel}</Chip>
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">swap</span>
                <span className="text-[11px] text-neutral-300 font-mono">{d.swap}</span>
              </div>
              <div className="text-[12px] text-neutral-100 leading-snug mb-1">
                <span className="text-amber-300">if</span> {d.when}
              </div>
              <div className="text-[12px] text-neutral-200 leading-snug">
                <span className="text-rose-300">replace</span>{' '}
                <span className="font-mono text-neutral-300">{d.from}</span>
                {' → '}
                <span className="text-emerald-300">with</span>{' '}
                <span className="font-mono text-neutral-100">{d.to}</span>
              </div>
              <div className="text-[11px] text-neutral-400 leading-snug mt-1 italic">{d.why}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="rules total"            value={counts.all.toString()}            sub="across 13 layers"      color="text-fuchsia-200" />
        <Stat label="single-trigger swaps"   value={DEVIATIONS.filter(d => d.swap.indexOf('+') === -1).length.toString()} sub="one component changes" color="text-emerald-300" />
        <Stat label="default unchanged"      value="~80%"                              sub="of rows leave 12 of 13 layers alone" color="text-violet-300" />
      </div>

      <Worked title="How to use this in practice">
        <ol className="list-decimal pl-4 space-y-1">
          <li>Start a new project: ship the <CrossLink to="stack" recap="The default stack — one row per layer.">default stack</CrossLink>.</li>
          <li>When a constraint appears (RFP, cost line, Python need), find the matching trigger above.</li>
          <li>Swap the named component. Don&apos;t pre-swap others &mdash; deviations don&apos;t bundle.</li>
          <li>Keep the rest of the stack. The cost of changing one layer is days; changing the whole stack is weeks.</li>
          <li>Re-pin this card. Your team should know which deviations you&apos;ve already taken.</li>
        </ol>
      </Worked>

      <WhenItMatters>
        Whenever someone says &ldquo;but our stack is different because...&rdquo;. The right
        framing is: &ldquo;which row of the deviation map are we on?&rdquo;. If no row matches,
        deviating is probably premature. If one matches, swap that one component and move on.
      </WhenItMatters>

      <Misconception
        wrong="Customizing your stack signals technical depth and seriousness."
        right="Customizing without a printed trigger is over-engineering. The teams that ship fastest stay on the default until a customer-shaped force pushes them off it. Stack-divergence-without-purpose is a vibecoding-era anti-pattern that AI codegen amplifies."
        because="AI codegen rewards convergence with the training distribution. Every divergence from the default makes the AI a worse pair-programmer for that part of the stack. The compounding is invisible day-1, painful by month-6."
      />

      <Deeper>
        <p>
          <strong>Triggers come from outside, not inside.</strong>{' '}
          The most reliable deviation triggers are <em>customer-shaped</em>: an enterprise prospect
          requires SSO, a regulated industry requires VPC, a global prospect requires data residency.
          The least reliable triggers are <em>aesthetic</em>: &ldquo;I prefer Svelte&rdquo;, &ldquo;
          GraphQL is more modern&rdquo;. Treat customer-driven triggers as load-bearing; treat aesthetic
          triggers as bias to overcome.
        </p>
        <p>
          <strong>Deviations cost less than people fear.</strong>{' '}
          Most rows above can be executed in 1-3 days of focused work for a vibecoding dev. The
          framework lock-in stories are mostly anecdotes about teams who let their code grow tightly
          coupled to a vendor over years. With a clean call-site abstraction (one file per vendor
          touch), even &ldquo;swap auth provider&rdquo; takes ~1 week, not the months people expect.
        </p>
        <p>
          <strong>Compounding deviations are the actual risk.</strong>{' '}
          One deviation: fine. Three deviations: you&apos;re back to a custom stack, with all the
          lost AI-codegen quality and ecosystem mass. If you find yourself swapping more than 3 of
          13 layers, reconsider whether the broader default still fits &mdash; you may have
          drifted into a different reference shape (e.g.&nbsp;regulated-enterprise) that has its own
          default.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   17 — NEXT TRAILS
   Sibling explainers, deepen-here pointers, upstream foundations, zoom out.
   ========================================================================== */

const NextTrailsCard = () => {
  return (
    <Card id="trails" icon={Compass} title="Next trails" accent="violet" index={17}
          subtitle="Where to go from here.">
      <NextSteps groups={[
        {
          title: 'sibling explainers (in this collection)',
          items: [
            { label: 'Reading Code You Didn’t Write', href: '/#ai-code-onboarding',
              note: 'How to onboard to an AI-built codebase fast — the layer above this one.' },
            { label: 'Data Centers · v2', href: '/#data-centers-v2',
              note: 'What’s happening below the cloud you’re deploying to.' },
            { label: 'Forecasting Noisy Series', href: '/#statistical-forecasting',
              note: 'When your AI feature is forecasting, the loss function matters more than the framework.' },
          ],
        },
        {
          title: 'deepen inside the topic',
          items: [
            { label: 'Read AGENTS.md / CLAUDE.md conventions for AI codegen',
              note: 'Repo-level conventions that materially improve AI codegen quality. Not a tool — a discipline.' },
            { label: 'Run cost models monthly with the LLM calculator',
              note: 'The single highest-ROI ops practice for AI features. Surprise bills are avoidable.' },
            { label: 'Build your golden-set eval before the second prompt change',
              note: 'The discipline that makes prompt iteration safe. Adds 1 hour day-1; saves weeks at month 6.' },
          ],
        },
        {
          title: 'upstream foundations',
          items: [
            { label: 'CAP theorem / consistency models',
              note: 'Why Postgres + RLS scales further than people think. The DB choice is a CAP choice.' },
            { label: 'Operational definition of an SLO',
              note: 'Google SRE book, ch. 4. The forcing function for prioritizing reliability vs features.' },
            { label: 'Information theory of language models (next-token entropy)',
              note: 'Why caching works, why batching is cheap, why context length costs O(n^2).' },
          ],
        },
        {
          title: 'zoom out',
          items: [
            { label: 'The vibecoding-era stack is still settling',
              note: 'Frameworks (Mastra, OpenAI Agents SDK), eval tooling (Braintrust, Langfuse), MCP — all 2024-2026 inventions. Re-read this in 6 months.' },
            { label: 'Cost-per-feature as a product discipline',
              note: 'Most AI features look great until you do the unit economics. Bake the lens into product reviews.' },
          ],
        },
      ]} />
    </Card>
  );
};


/* ============================================================================
   FOOTER + TOP-LEVEL
   ========================================================================== */

const Footer = () => (
  <footer className="border-t border-white/5 mt-12">
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-xs text-neutral-500 space-y-3">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono">
        <span>compiled from:</span>
        <span className="text-cyan-300">Vercel · Cloudflare · Fly · Supabase docs</span>
        <span className="text-violet-300">PostgreSQL · Drizzle · Prisma</span>
        <span className="text-fuchsia-300">Anthropic · OpenAI · Vercel AI SDK</span>
        <span className="text-emerald-300">Inngest · Trigger.dev · Sentry</span>
        <span className="text-amber-300">pgvector · Turbopuffer · Pinecone</span>
      </div>
      <p className="max-w-xl mx-auto">
        Sibling: <em>Reading Code You Didn&apos;t Write</em> &mdash; how to onboard to an
        AI-built codebase fast (the layer above this one).
      </p>
    </div>
  </footer>
);

export default function AppStackExplainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
        input[type=range].as-range {
          -webkit-appearance: none; appearance: none;
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none;
        }
        input[type=range].as-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #f0abfc; border: 2px solid #0a0a0a; cursor: pointer;
          box-shadow: 0 0 0 1px rgba(240,171,252,0.4);
        }
        input[type=range].as-range::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #f0abfc; border: 2px solid #0a0a0a; cursor: pointer;
        }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <FrameCard />
        <AppFrameworkCard />
        <BackendApiCard />
        <DatabaseCard />
        <OrmMigrationsCard />
        <AuthTenancyCard />
        <HostingCard />
        <JobsQueuesCard />
        <ObservabilityCard />
        <AdjacentCard />
        <LlmProviderCard />
        <RagVectorCard />
        <AgentsToolsCard />
        <AiEvalCostCard />
        <DefaultStackCard />
        <DeviationMapCard />
        <NextTrailsCard />
      </main>

      <Footer />
    </div>
  );
}

// Exported for incremental authoring in subsequent stages.
export {
  Card, Deeper, Stat, Chip, FloatingTip, Term, GLOSS,
  MinSchema, WhenItMatters, Misconception, Predict, QA, CrossLink, Worked, NextSteps,
  Eq, Block, accentMap, chipPalette,
};
