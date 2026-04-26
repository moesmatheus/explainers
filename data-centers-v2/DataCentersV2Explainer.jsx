import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import {
  Server, Cpu, HardDrive, Network, Zap, Droplet, Thermometer, Wind,
  Battery, Fuel, Activity, ChevronDown, FlaskConical, Shield, Building2,
  Cable, Globe2, Gauge, Scale, Layers, AlertTriangle, Flame, Sun,
  Rows3, MapPin, Radio, Waves, TrendingUp, CircuitBoard, Wrench,
  HelpCircle, Eye, EyeOff, Lightbulb, Link2, Ruler, Compass, CheckCircle2, XCircle,
} from 'lucide-react';

/* ============================================================================
   Data Centers — anatomy, energy, cooling, redundancy, networking, trends
   Single-file React component. Dark mode. Tailwind + lucide-react + framer-motion + KaTeX.
   ========================================================================== */

// --- math primitives --------------------------------------------------------

const KATEX_MACROS = {
  '\\num': '\\textcolor{##fbbf24}{#1}',
  '\\hi':  '\\textcolor{##fb7185}{#1}',
  '\\co':  '\\textcolor{##7dd3fc}{#1}',
  '\\gr':  '\\textcolor{##6ee7b7}{#1}',
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

const Chip = ({ children, color = 'sky' }) => (
  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-${color}-500/10 text-${color}-300 border border-${color}-400/20`}>{children}</span>
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

// --- Glossary + Term (hover-to-define) -------------------------------------

const GLOSS = {
  // Power
  'UPS': 'Uninterruptible Power Supply — batteries or a flywheel that carry the IT load for seconds to minutes during the hand-off from utility to generator.',
  'ATS': 'Automatic Transfer Switch — senses utility loss and switches the load over to the generator feed within ~10 s.',
  'PDU': 'Power Distribution Unit — a floor-standing cabinet that steps power down (e.g. 480 V → 415 V) and splits it into many circuits for racks.',
  'rack PDU': 'The vertical power strip inside each rack that distributes to individual server outlets (208–230 V). Two per rack for A/B feeds.',
  'rack PDUs': 'The vertical power strips inside each rack that distribute to individual server outlets. Two per rack for A/B feeds.',
  'RPDU': 'Rack PDU — vertical power strip inside the rack, splitting the busway feed into individual outlets.',
  'busway': 'Enclosed aluminum bus duct running along the top of each row. Racks tap off it with plug-in connectors instead of custom conduit.',
  'busways': 'Enclosed aluminum bus ducts above each row. Racks tap off with plug-in connectors.',
  'switchgear': 'Metal-clad cabinets housing breakers, protective relays, and bus bars. "MV switchgear" = medium voltage (13.8 kV class); "LV" = 480 V class.',
  'genset': 'Generator set — a diesel or gas engine coupled to an alternator. MW-class outdoor units with on-site fuel tanks.',
  'gensets': 'Generator sets — diesel/gas engines coupled to alternators, the last line of defense when utility is lost.',
  'VRLA': 'Valve-Regulated Lead-Acid — the classic data-center battery. Cheap (~$150/kWh) but short-lived (3–5 yr) and needs a ventilated battery room.',
  'Li-ion': 'Lithium-ion battery. ~2× the upfront cost of lead-acid but 10–15 yr life, half the footprint, and real-time state-of-charge telemetry.',
  'flywheel': 'Kinetic UPS — a massive spinning rotor in a vacuum. 10–20 s of ride-through, no chemistry to degrade, only useful with fast-starting gensets.',
  'Flywheels': 'Kinetic UPS — massive spinning rotors in vacuum. 10–20 s of ride-through, no chemistry to degrade, only useful with fast-starting gensets.',
  'flywheels': 'Kinetic UPS — massive spinning rotors in vacuum. 10–20 s of ride-through, no chemistry to degrade, only useful with fast-starting gensets.',
  'Double-conversion': 'UPS topology that runs AC → DC → AC, always on. Best isolation from the grid, ~3% loss.',
  'double-conversion': 'UPS topology that runs AC → DC → AC, always on. Best isolation from the grid, ~3% loss.',
  'line-interactive': 'UPS topology that passes grid through directly; batteries filter sags/surges. Lower loss (~1%) but less isolation.',
  '2N': 'Two fully independent power paths end-to-end. A full fault on one side drops zero IT load. The top redundancy tier.',
  'N+1': 'One spare copy of each critical component (one extra UPS module, one extra chiller, etc.).',
  'PSU': 'Power Supply Unit — the module inside each server converting AC (or DC) to 12 V DC for the motherboard. Hot-swap and dual-redundant in modern servers.',
  'PSUs': 'Power Supply Units — the AC→12 V DC modules inside each server; dual-redundant so one can fail without dropping the server.',
  'OCP': 'Open Compute Project — Meta-founded open-hardware consortium. Popularized 48 V DC distribution and vendor-neutral designs.',
  '48 V DC': 'Low-voltage DC distributed directly to the rack shelf, collapsing multiple AC↔DC conversions. Saves 3–6% of facility power.',
  '400 V DC': 'Microsoft\'s high-voltage DC distribution proposal — fewer conversions than AC but harsher arc behavior; niche so far.',

  // Cooling
  'CRAC': 'Computer Room Air Conditioner — self-contained AC with its own refrigerant cycle. The legacy data-hall cooler; inefficient vs chilled water.',
  'CRAH': 'Computer Room Air Handler — an air coil fed by central chilled water. Efficient, modular, the modern air-cooling default.',
  'chiller': 'The machine that makes chilled water (6–18 °C). Typically a big rooftop or yard unit; the single biggest non-IT load in the building.',
  'chillers': 'The machines that produce chilled water (6–18 °C). Big rooftop or yard units; the largest non-IT loads in a facility.',
  'cooling tower': 'Evaporative heat rejector — sprays warm water over slats; fans pull air through; evaporation dumps the heat to atmosphere.',
  'cooling towers': 'Evaporative heat rejectors — fans pull air through slats wetted by warm water; evaporation dumps the heat. Consume 1–2 L of water per kWh.',
  'economizer': '"Free cooling" mode — bypasses the chiller when outside air/water is cold enough to do the job alone. Huge PUE win in cool climates.',
  'rear-door heat exchanger': 'A water-cooled coil bolted to the back of a rack. Air still moves through the server but gets chilled by the door on the way out.',
  'direct-to-chip': 'Cold plates strapped onto the CPU/GPU die, with warm water flowing through them. Captures ~70–80% of heat to liquid; DIMMs still see air.',
  'Direct-to-chip': 'Cold plates strapped onto the CPU/GPU die, with warm water flowing through them. Captures ~70–80% of heat to liquid; DIMMs still see air.',
  'DTC': 'Direct-to-chip liquid cooling — cold plates on the hot silicon, warm water loop. ~70–80% of heat captured to liquid.',
  'immersion': 'Immersion cooling — whole servers submerged in a non-conductive dielectric fluid. Single-phase circulates it; two-phase lets it boil at ~50 °C.',
  'dielectric fluid': 'Electrically non-conductive liquid (mineral oil or synthetic fluorocarbons) — required for immersion so it doesn\'t short the electronics.',
  'PUE': 'Power Usage Effectiveness = total facility power / IT power. 1.0 = all power to compute; 2.0 = as much overhead as IT. Industry avg ~1.56.',
  'WUE': 'Water Usage Effectiveness = L of water / kWh of IT. Measures evaporative cooling\'s water footprint. Google averages ~1.0 L/kWh.',
  'CUE': 'Carbon Usage Effectiveness = kg CO₂ / kWh of IT. Follows grid carbon intensity; drops sharply with PPA-backed renewables.',
  'TUE': 'Total-usage Effectiveness = PUE × ITUE. Captures in-server losses (fans, PSU) that PUE misses — a more honest headline at low PUE.',
  'ITUE': 'IT-side Usage Effectiveness — how much rack-level power actually reaches the compute vs lost in fans and PSUs.',
  'PPA': 'Power Purchase Agreement — a 10–20 yr contract funding a specific wind/solar farm. Hyperscalers use them to decarbonize on paper and hedge energy costs.',
  'PPAs': 'Power Purchase Agreements — multi-decade contracts with a specific wind/solar farm. Used by hyperscalers for decarbonization and price hedging.',
  'Novec': '3M Novec-7000 series — two-phase immersion fluids that boil at ~50 °C. Under PFAS regulatory scrutiny; 3M announced PFAS exit.',
  'Fluorinert': '3M Fluorinert — a family of dielectric fluorocarbons used in immersion cooling. Also PFAS-regulated.',
  'PFAS': 'Per- and polyfluoroalkyl substances — "forever chemicals". EU/US regulators tightening rules; threatens two-phase immersion fluids.',

  // Networking
  'Clos': 'A non-blocking multi-stage switching topology (Charles Clos, 1953). "Spine-leaf" is its modern data-center form: every leaf connects to every spine.',
  'spine-leaf': 'Two-tier Clos fabric. Leaves host the racks; spines connect all leaves. Any leaf can reach any other at full line rate via equal-cost paths.',
  'ECMP': 'Equal-Cost Multipath — routing that load-balances traffic across all same-cost paths. Lets a leaf hash flows across every spine in a Clos.',
  'bisection bandwidth': 'Worst-case total bandwidth between the two halves of a network. "Full-bisection" means any partition can still hit full line rate.',
  'VXLAN': 'Virtual Extensible LAN — tunneling that stretches L2 domains across an L3 fabric. Backbone of multi-tenant cloud networking.',
  'EVPN': 'Ethernet VPN — BGP-based control plane for VXLAN. Advertises MAC addresses and IPs across the fabric.',
  'BGP': 'Border Gateway Protocol — the internet\'s routing language. Also runs inside modern DC fabrics for simplicity and predictable failure modes.',
  'SDN': 'Software-Defined Networking — separating the control plane (policy, routing decisions) from the forwarding plane (the silicon pushing packets).',
  'NOSes': 'Network Operating Systems — the software on a switch. SONiC and FBOSS are open, hyperscale-grown NOSes replacing vendor firmware.',
  'SONiC': 'Software for Open Networking in the Cloud — Microsoft\'s open-source NOS, now running on whitebox switches across the industry.',
  'FBOSS': 'Facebook Open Switching System — Meta\'s in-house Linux-based NOS. Runs on open-hardware switches inside Meta\'s DCs.',
  'InfiniBand': 'HPC-grade fabric from NVIDIA/Mellanox. Lossless by design, microsecond tail latency, single-vendor ecosystem. Dominant in the largest AI training clusters.',
  'RoCE v2': 'RDMA over Converged Ethernet v2 — RDMA semantics on standard Ethernet. Cheaper and multi-vendor, but needs PFC + ECN tuning to be lossless.',
  'RoCE': 'RDMA over Converged Ethernet — run RDMA semantics over an Ethernet fabric. Needs lossless tuning to perform well.',
  'RDMA': 'Remote Direct Memory Access — a NIC reads/writes remote memory without involving the remote CPU. Essential for GPU-to-GPU training traffic.',
  'PFC': 'Priority Flow Control (IEEE 802.1Qbb) — lets a congested switch pause specific traffic classes upstream. Required to make Ethernet "lossless".',
  'ECN': 'Explicit Congestion Notification — marks packets when a buffer is filling so endpoints slow down before loss. Core of modern DC congestion control.',
  'NVLink': 'NVIDIA\'s GPU-to-GPU interconnect (~900 GB/s per GPU). Shared within a rack; between racks you move to InfiniBand or Ethernet.',
  'NVSwitch': 'NVIDIA switch chip that bridges NVLink connections so every GPU in a domain (8 in an HGX, 72 in GB200 NVL72) appears as one memory fabric.',
  'BMC': 'Baseboard Management Controller — a tiny dedicated CPU on the server exposing out-of-band power/console/health even when the main OS is dead.',
  'IX': 'Internet Exchange — a neutral facility where many networks peer directly (AMS-IX, DE-CIX, LINX). Bypasses expensive transit for bulk traffic.',
  'meet-me rooms': 'Floors inside a carrier hotel where tenants interconnect cages via cross-connects. The physical "edge" of the internet.',
  'carrier hotels': 'Colo buildings where many telcos, ISPs, CDNs, and hyperscalers converge — e.g. 60 Hudson NYC, Equinix DC2 Ashburn.',
  'dark fiber': 'Unlit fiber strands leased between two endpoints. You light them with your own optics, so capacity is bounded by your gear, not the carrier\'s price sheet.',
  'IRU': 'Indefeasible Right of Use — a 20-year-plus lease on fiber strands. How hyperscalers lock in long-haul capacity at predictable cost.',
  'merchant silicon': 'Off-the-shelf switching ASICs (Broadcom Tomahawk, NVIDIA Spectrum) sold to anyone. Displaced custom silicon at Cisco/Juniper in the 2010s.',
  'whitebox': 'Generic switch hardware with no vendor software — you install your own NOS (SONiC, FBOSS). Cheaper and more flexible, operationally heavier.',
  'Tomahawk': 'Broadcom\'s hyperscale Ethernet ASIC line. Sets the bandwidth-per-dollar bar most merchant switches build on.',
  'Spectrum-X': 'NVIDIA\'s AI-optimized Ethernet ASIC line. Targets training fabrics as an alternative to InfiniBand.',
  'Silicon One': 'Cisco\'s unified ASIC line across routers and switches. Competes with Broadcom and NVIDIA merchant silicon.',
  'Spectrum': 'NVIDIA\'s Ethernet ASIC line (post-Mellanox). Spectrum-X is the AI-tuned variant.',

  // Servers / storage
  'NUMA': 'Non-Uniform Memory Access — in a multi-socket server, RAM attached to the other CPU is ~2× slower to reach. Software has to be NUMA-aware or pay the tax.',
  'UPI': 'Ultra Path Interconnect — Intel\'s link between two CPU sockets. Caps cross-socket bandwidth in a dual-socket box.',
  'Infinity Fabric': 'AMD\'s equivalent of Intel UPI — the inter-socket link tying two EPYC CPUs together.',
  'NVMe': 'Non-Volatile Memory Express — a flash-storage protocol riding directly on PCIe, vastly faster than the SATA/SAS it replaced.',
  'SAS': 'Serial Attached SCSI — 2000s/2010s storage protocol. An HBA fans out to dozens of drives; dual-port SAS lets two controllers share a drive for HA.',
  'SATA': 'The consumer/low-end drive interface. Simpler and cheaper than SAS; lives on in warm-storage HDDs.',
  'HBA': 'Host Bus Adapter — the PCIe card bridging the server to a SAS or Fibre Channel storage fabric.',
  'NVMe-over-Fabric': 'Running the NVMe protocol across a network (TCP, RoCE, FC) so a shelf of drives in one chassis appears local to many hosts.',
  'NVMe-over-Fabrics': 'Running the NVMe protocol across a network (TCP, RoCE, FC) so a shelf of drives in one chassis appears local to many hosts.',
  'NVMe/TCP': 'NVMe-over-Fabrics carried over plain TCP. The easiest to deploy — works on any Ethernet, though tuning for tail-latency is non-trivial.',
  'NVMe/RoCE': 'NVMe-over-Fabrics carried over RoCE — lowest latency, but the fabric must be lossless (PFC + ECN).',
  'erasure coding': 'A data-encoding scheme (Reed-Solomon etc.) that spreads a file across N disks so it survives any K failures, using ~1.5× storage vs 3× for replication.',
  'DIMM': 'Dual In-line Memory Module — a RAM stick. "DDR5 DIMM" = 5th-gen DDR DRAM stick.',
  'DIMMs': 'Dual In-line Memory Modules — the RAM sticks on a motherboard.',
  'NIC': 'Network Interface Card — the Ethernet or InfiniBand adapter in a server.',
  'NICs': 'Network Interface Cards — Ethernet or InfiniBand adapters in a server.',
  '42U': '42 rack units tall (1U = 1.75 in / 44.45 mm). The standard full rack height.',
  'HGX': 'NVIDIA\'s 8-GPU server baseboard — the backbone of most 2022–24 AI training boxes.',
  'GB200': 'NVIDIA\'s 2024 Grace-Blackwell superchip. "GB200 NVL72" = a rack of 72 GPUs acting like one giant GPU via NVLink.',
  'GB200 NVL72': 'A full NVIDIA rack of 72 Grace-Blackwell GPUs connected over NVLink into one coherent accelerator domain. ~120 kW per rack.',

  // Standards / ops
  'Tier I': 'Uptime Institute basic single-path design — no redundancy. Typical of old enterprise DCs.',
  'Tier II': 'Uptime Institute design with redundant components (extra UPS, extra chiller) but still a single path.',
  'Tier III': 'Uptime Institute "concurrently maintainable" — you can service any component without IT downtime. The colo sweet spot.',
  'Tier IV': 'Uptime Institute "fault-tolerant" — 2N everything. Any single failure is invisible to IT. Expensive and rare.',
  'availability zone': 'A ~Tier-III-equivalent facility (or small cluster) with its own power, cooling, and network. A cloud "region" is 3+ AZs, 1–100 km apart.',
  'AZ': 'Availability Zone — an independently powered, cooled, and networked facility. A cloud region is 3+ AZs separated by ~1–100 km.',
  'AZs': 'Availability Zones — independently powered, cooled, and networked facilities. A cloud region is 3+ AZs separated by ~1–100 km.',
  'AllReduce': 'The collective at the heart of distributed training: every worker sums its gradients with every other worker\'s. Dominates AI fabric traffic.',

  // Proper nouns with context
  'Stargate': 'The OpenAI/Oracle/SoftBank AI-infrastructure program announced 2024 — planned multi-GW data-center campuses, one of the largest buildouts ever.',
  'Colossus': 'xAI\'s Memphis AI training cluster — ~100k+ H100/H200 GPUs assembled in record time in 2024.',
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

// --- Pedagogy primitives (learning-throughput optimization) -----------------

// 5. Minimum-viable-schema header: the one sentence/pattern the reader
// should be able to redraw from memory after reading the card.
const MinSchema = ({ children }) => (
  <div className="mt-2 mb-4 rounded-md border border-sky-400/25 bg-sky-400/5 px-3 py-2 flex items-start gap-2">
    <Ruler className="w-3.5 h-3.5 mt-[2px] text-sky-300 shrink-0" />
    <div className="text-xs text-sky-100 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300 mr-2">carry this</span>
      {children}
    </div>
  </div>
);

// 6. "When does this matter / who cares" callout: attaches the concept
// to a decision context.
const WhenItMatters = ({ children }) => (
  <div className="mt-3 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 flex items-start gap-2">
    <Compass className="w-3.5 h-3.5 mt-[2px] text-amber-300 shrink-0" />
    <div className="text-xs text-amber-100/90 leading-snug">
      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300 mr-2">when it matters</span>
      {children}
    </div>
  </div>
);

// 4. "Equivalent to" grounding: ties a big number to a body-sized referent.
const Grounding = ({ children }) => (
  <span className="inline-flex items-baseline gap-1 rounded-sm border border-emerald-400/25 bg-emerald-400/5 px-1.5 py-0 text-[11px] text-emerald-200 align-baseline">
    <span className="text-[9px] uppercase tracking-wider text-emerald-400">≈</span>
    {children}
  </span>
);

// 8. Misconception box: "people think X; actually Y, because Z".
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

// 1. Predict-before-reveal: ask the reader to guess, then reveal.
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

// 7. Quick Q&A self-check block at the end of each topic.
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

// 3. Cross-card callback chip: links back to an earlier card's concept.
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

// 2. Worked numeric example — a running mini-calculator that sits under an equation.
// Generic shell; callers wire their own formula + inputs.
const Worked = ({ title = 'Worked example', children }) => (
  <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-3.5 h-3.5 text-sky-300" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-sky-300">{title}</span>
    </div>
    <div className="text-xs text-neutral-200 leading-snug space-y-2">{children}</div>
  </div>
);

// 9. NextSteps trail — curated onward reading at the end of the explainer.
// Each group is { title, note, items: [{ label, note, href?, external? }] }.
// If href starts with '#' and the target exists on the current page, scroll smoothly;
// external links open in a new tab; linkless items render as "find elsewhere" pointers.
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

// --- Sankey primitive (reused pattern from world-economy) -------------------

const Sankey = ({ nodes, links, colLabels, width = 620, height = 360, hover, setHover, format = (v) => v.toFixed(1), unit = '' }) => {
  const NODE_W = 10, NODE_GAP = 6, TOP = 26, BOT = 12;

  const model = useMemo(() => {
    const cols = [...new Set(nodes.map((n) => n.col))].sort((a, b) => a - b);
    const sidePad = 110;
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
    return { cols, colX, nodePos, paths, byId, size };
  }, [nodes, links, width, height]);

  const { cols, colX, nodePos, paths, size } = model;

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
        const lx = isFirst ? p.x - 6 : p.x + NODE_W + 6;
        const anchor = isFirst ? 'end' : 'start';
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={NODE_W} height={Math.max(p.h, 1)} fill={n.color} opacity={0.95} rx={2} />
            <text x={lx} y={p.y + p.h / 2 + 3}
                  fontSize="10.5" textAnchor={anchor} fill="#e5e5e5" fontFamily="ui-monospace">
              {n.label}
            </text>
            <text x={lx} y={p.y + p.h / 2 + 15}
                  fontSize="9" textAnchor={anchor} fill="#737373" fontFamily="ui-monospace">
              {format(size[n.id])}{unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ============================================================================
   HERO
   ============================================================================ */

const FlowField = () => {
  // subtle particle drift across hero — evokes flowing data
  const pts = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    x: (i * 37) % 100, y: (i * 53) % 100, d: 6 + (i % 5) * 2,
  })), []);
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={`${p.x}%`} cy={`${p.y}%`} r="1.2"
          fill="#7dd3fc"
          animate={{ cx: [`${p.x}%`, `${(p.x + 40) % 100}%`], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.d, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
        />
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
          <Server className="w-3.5 h-3.5" /> anatomy of the cloud · 2025–2026
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-fuchsia-200 bg-clip-text text-transparent">
          Data Centers
        </h1>
        <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
          The physical machinery behind the internet and AI. <span className="text-amber-300 font-mono">~500 TWh</span> of electricity, <span className="text-sky-300 font-mono">~60 million servers</span>, and rising — how a modern facility turns utility power into compute, keeps it alive through failures, and gets the heat back out.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] font-mono">
          <span className="text-sky-300">power</span>
          <span className="text-cyan-300">cooling</span>
          <span className="text-violet-300">redundancy</span>
          <span className="text-fuchsia-300">network</span>
          <span className="text-amber-300">ai era</span>
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
  { id: 'scale',       label: 'Scale & hierarchy', icon: Scale },
  { id: 'anatomy',     label: 'Anatomy',           icon: Building2 },
  { id: 'racks',       label: 'Racks & servers',   icon: Rows3 },
  { id: 'power',       label: 'Power',             icon: Zap },
  { id: 'cooling',     label: 'Cooling & PUE',     icon: Thermometer },
  { id: 'redundancy',  label: 'Redundancy · Tiers',icon: Shield },
  { id: 'network',     label: 'Networking',        icon: Network },
  { id: 'metrics',     label: 'Key metrics',       icon: Gauge },
  { id: 'trends',      label: 'The AI era',        icon: TrendingUp },
  { id: 'trails',      label: 'Next trails',       icon: Compass },
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
   01 — SCALE & HIERARCHY
   ============================================================================ */

const DC_TYPES = [
  { k: 'edge',       label: 'Edge',            desc: 'Small POP or micro-DC near users (cell tower, metro colo). Low latency to eyeballs.', rooms: '1–10 racks', power: '10 kW–1 MW', example: 'Cloudflare PoPs, Vapor IO micro-DCs', color: '#fb7185' },
  { k: 'enterprise', label: 'Enterprise',      desc: 'Company-owned on-prem or private. Shrinking — workloads have migrated to cloud/colo.', rooms: '10–500 racks', power: '0.2–5 MW', example: 'Bank, hospital, university DC', color: '#fbbf24' },
  { k: 'colo',       label: 'Colocation',      desc: 'Multi-tenant facility. Tenants rent cages/cabinets; operator provides power, cooling, network. Backbone of the "carrier hotel" ecosystem.', rooms: '500–5,000 racks', power: '5–60 MW', example: 'Equinix, Digital Realty, Coresite', color: '#7dd3fc' },
  { k: 'hyper',      label: 'Hyperscale',      desc: 'Single-operator campus built for one hyperscaler workload. Custom everything — servers, switches, power delivery.', rooms: '10k–100k+ racks', power: '50 MW–2+ GW', example: 'AWS us-east-1, Google The Dalles, Meta Prineville', color: '#c4b5fd' },
  { k: 'ai',         label: 'AI campus',       desc: 'Dedicated to model training. Liquid-cooled GPU pods, huge single-site power draw, often co-located with generation.', rooms: '100k+ GPUs', power: '100 MW–5 GW', example: 'Stargate Abilene, xAI Memphis, Meta Richland Parish', color: '#f0abfc' },
];

const ScaleHierarchy = () => {
  const [hover, setHover] = useState(null);
  return (
    <Card id="scale" icon={Scale} title="Scale & hierarchy" subtitle="From a closet to a gigawatt campus" accent="sky" index={1} source="IEA · Synergy Research">
      <p>
        A <strong>data center</strong> is any purpose-built space that houses computers, networking, storage, and the power + cooling they require. The spectrum is enormous: a broom-closet server room and a 2-gigawatt AI campus differ by a factor of <Eq>10^5</Eq> in power and by seven orders of magnitude in cost — but the underlying anatomy (racks, power, cooling, network) is the same.
      </p>

      <div className="grid md:grid-cols-5 gap-2">
        {DC_TYPES.map((t) => (
          <div key={t.k}
               onMouseEnter={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
               onMouseMove={(e) => setHover({ ...t, mx: e.clientX, my: e.clientY })}
               onMouseLeave={() => setHover(null)}
               className="rounded-lg border border-white/10 bg-white/[0.03] p-3 cursor-pointer hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
              <div className="text-xs uppercase tracking-wider font-mono" style={{ color: t.color }}>{t.label}</div>
            </div>
            <div className="mt-2 text-[11px] text-neutral-400 font-mono">{t.power}</div>
            <div className="text-[11px] text-neutral-500 font-mono">{t.rooms}</div>
          </div>
        ))}
      </div>

      <FloatingTip hover={hover} render={(h) => (
        <div>
          <div className="font-semibold" style={{ color: h.color }}>{h.label}</div>
          <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
          <div className="mt-1.5 text-[10px] text-neutral-500 font-mono">e.g. {h.example}</div>
        </div>
      )} />

      <div className="grid md:grid-cols-3 gap-3 pt-2">
        <Stat label="Global DC electricity (2024)" value="~460 TWh" sub="~1.7% of world power · IEA" color="text-amber-300" />
        <Stat label="Projected 2030" value="~1000 TWh" sub="roughly double, driven by AI" color="text-rose-300" />
        <Stat label="Hyperscale share" value="~60%" sub="and still rising — aws+msft+goog+meta" color="text-sky-300" />
      </div>

      <PowerBenchmarks />

      <Deeper>
        <p>
          <strong>The three-tier economy.</strong> Hyperscalers (AWS, Azure, GCP, Meta, Oracle, Alibaba, Tencent) own the compute and increasingly the buildings. Wholesale colos (Digital Realty, Equinix, QTS, Iron Mountain) build power-dense shells and lease them by the MW — often to the same hyperscalers. Retail colos lease by the cabinet to enterprises. The colo industry is worth $90B in revenue; the cloud-services layer riding on top is ~$700B.
        </p>
        <p>
          <strong>Why location matters.</strong> A site is chosen on four axes: (1) cheap <em>firm</em> power (baseload generation within 10–20 miles), (2) climate that allows air-side or evaporative cooling a large fraction of the year, (3) fiber — proximity to major backbones and peering, (4) regulatory + tax posture (property tax abatements, fast permitting, water rights). The classic US clusters all hit those: Northern Virginia (Ashburn) sits on the fiber backbone, the Pacific Northwest has cheap hydro and cool air, Dallas and Phoenix have huge land + grid capacity, Omaha has cheap power and cold winters.
        </p>
      </Deeper>
    </Card>
  );
};

const PowerBenchmarks = () => {
  // logarithmic scale 1kW → 10GW
  const REFS = [
    { v: 1, lab: '1 kW',       desc: 'a half-rack of laptops' },
    { v: 10, lab: '10 kW',     desc: 'a modern CPU rack' },
    { v: 100, lab: '100 kW',   desc: 'a GPU rack (H100/GB200)' },
    { v: 1000, lab: '1 MW',    desc: 'a small enterprise DC' },
    { v: 10000, lab: '10 MW',  desc: 'a large colo building' },
    { v: 100000, lab: '100 MW',desc: 'a typical hyperscale DC' },
    { v: 1000000, lab: '1 GW', desc: 'a full hyperscale campus' },
    { v: 5000000, lab: '5 GW', desc: 'Stargate ambition · NYC peak load' },
  ];
  const W = 640, H = 110, Lpad = 28, Rpad = 28;
  const lo = Math.log10(1), hi = Math.log10(5_000_000);
  const xOf = (v) => Lpad + ((Math.log10(v) - lo) / (hi - lo)) * (W - Lpad - Rpad);
  const [hov, setHov] = useState(null);
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-1">log-scale power reference · kW → GW</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHov(null)}>
        <line x1={Lpad} y1={54} x2={W - Rpad} y2={54} stroke="#ffffff30" strokeWidth="1" />
        {REFS.map((r, i) => {
          const cx = xOf(r.v);
          const descAnchor = i === 0 ? 'start' : i === REFS.length - 1 ? 'end' : 'middle';
          const descX = i === 0 ? Lpad - 4 : i === REFS.length - 1 ? W - Rpad + 4 : cx;
          const descY = 78 + (i % 2) * 14;
          return (
            <g key={r.lab}
               onMouseEnter={(e) => setHov({ ...r, mx: e.clientX, my: e.clientY })}
               onMouseMove={(e) => setHov({ ...r, mx: e.clientX, my: e.clientY })}
               style={{ cursor: 'pointer' }}>
              <line x1={cx} y1={46} x2={cx} y2={62} stroke="#7dd3fc" strokeWidth="1.2" />
              <circle cx={cx} cy={54} r={hov?.lab === r.lab ? 5 : 3} fill="#38bdf8" />
              <text x={cx} y={38} fontSize="9.5" textAnchor="middle" fill={hov?.lab === r.lab ? '#e5e5e5' : '#a3a3a3'} fontFamily="ui-monospace">{r.lab}</text>
              {descY > 80 && <line x1={cx} y1={62} x2={cx} y2={descY - 8} stroke="#ffffff15" strokeWidth="0.8" />}
              <text x={descX} y={descY} fontSize="8.5" textAnchor={descAnchor} fill="#737373" fontFamily="ui-monospace">{r.desc}</text>
            </g>
          );
        })}
      </svg>
      <FloatingTip hover={hov} render={(h) => (
        <div>
          <div className="font-semibold text-sky-300">{h.lab}</div>
          <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
        </div>
      )} />
    </div>
  );
};

/* ============================================================================
   02 — ANATOMY
   ============================================================================ */

const ANATOMY_ROOMS = [
  { id: 'white',  x: 150, y: 80,  w: 310, h: 180, label: 'Data hall (whitespace)',     color: '#38bdf8', desc: 'The compute floor. Rows of racks in hot/cold aisles, raised floor (or slab with overhead), containment curtains. Typically 10–40 MW per hall.' },
  { id: 'mech',   x: 150, y: 270, w: 170, h: 90,  label: 'Mechanical · CRAH/CRAC',    color: '#22d3ee', desc: 'Computer-room air handlers. Blow cold air into the cold aisle or cool the containment hot aisle. Chilled water from the chiller plant is the working fluid.' },
  { id: 'elec',   x: 330, y: 270, w: 130, h: 90,  label: 'Electrical · UPS / switchgear', color: '#fbbf24', desc: 'Medium-voltage switchgear, transformers, UPS strings (battery or flywheel), PDUs. Has its own room because of heat, noise, and arc-flash concerns.' },
  { id: 'bat',    x: 470, y: 80,  w: 110, h: 80,  label: 'Battery room',              color: '#fb923c', desc: 'Valve-regulated lead-acid or Li-ion strings. Bridges the seconds between utility loss and the gensets reaching full load.' },
  { id: 'gen',    x: 470, y: 170, w: 110, h: 90,  label: 'Generator yard',            color: '#fb7185', desc: 'Diesel (sometimes gas) gensets, typically 2.5–3.5 MW each, with day tanks + bulk fuel storage. Sized to carry full IT + cooling load for 48–72 hours.' },
  { id: 'cool',   x: 470, y: 270, w: 110, h: 90,  label: 'Chiller plant / cooling towers', color: '#7dd3fc', desc: 'Water-cooled chillers + cooling towers on the roof or yard, or dry coolers where water is scarce. Rejects IT heat to the atmosphere.' },
  { id: 'mmr',    x: 40,  y: 80,  w: 100, h: 110, label: 'Meet-me room',              color: '#c4b5fd', desc: 'Where carriers cross-connect with tenants. Dark fiber enters here; the "carrier neutrality" of a colo is what makes it valuable.' },
  { id: 'noc',    x: 40,  y: 200, w: 100, h: 80,  label: 'NOC / security',            color: '#a78bfa', desc: 'Network operations center + mantraps, biometric scanners, camera walls. Manned 24/7 at tier-III+ facilities.' },
  { id: 'load',   x: 40,  y: 290, w: 100, h: 70,  label: 'Loading · staging',         color: '#737373', desc: 'Where new servers arrive, get burned-in in a staging room, then are wheeled into the hall.' },
];

const AnatomyFloorplan = () => {
  const [hover, setHover] = useState(null);
  return (
    <Card id="anatomy" icon={Building2} title="Anatomy of a facility" subtitle="What's in the building" accent="violet" index={2}>
      <p>
        A modern data center is a <strong>one-story (sometimes multi-story) industrial building</strong> with a very specific layout: an airtight "whitespace" where the IT lives, flanked by mechanical and electrical rooms that keep it alive, and a fiber entrance + loading dock at the edges. The floor plan below is schematic — a real ~30 MW hall is roughly a football field in area.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4 relative">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">schematic floor plan · hover to learn</div>
        <svg viewBox="0 0 620 380" className="w-full h-auto" onMouseLeave={() => setHover(null)}>
          {/* building outline */}
          <rect x={20} y={60} width={580} height={310} fill="none" stroke="#ffffff20" strokeWidth="1.5" rx="6" />
          {/* rooms */}
          {ANATOMY_ROOMS.map((r) => {
            const active = hover?.id === r.id;
            return (
              <g key={r.id}
                 onMouseEnter={(e) => setHover({ ...r, mx: e.clientX, my: e.clientY })}
                 onMouseMove={(e) => setHover({ ...r, mx: e.clientX, my: e.clientY })}
                 style={{ cursor: 'pointer' }}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h}
                      fill={r.color} fillOpacity={active ? 0.35 : 0.12}
                      stroke={r.color} strokeOpacity={active ? 0.9 : 0.4}
                      strokeWidth={active ? 1.8 : 1.2} rx="4" />
                <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 2}
                      fontSize="10" textAnchor="middle" fill={active ? '#f5f5f5' : '#d4d4d4'} fontFamily="ui-monospace">
                  {r.label}
                </text>
              </g>
            );
          })}
          {/* rack rows inside whitespace */}
          {Array.from({ length: 10 }).map((_, i) => {
            const rx = 165 + i * 29;
            return (
              <g key={`rack-${i}`}>
                <rect x={rx} y={100} width={22} height={14} fill="#38bdf8" opacity="0.4" rx="1" />
                <rect x={rx} y={116} width={22} height={14} fill="#f97316" opacity="0.35" rx="1" />
                <rect x={rx} y={132} width={22} height={14} fill="#38bdf8" opacity="0.4" rx="1" />
                <rect x={rx} y={148} width={22} height={14} fill="#f97316" opacity="0.35" rx="1" />
                <rect x={rx} y={164} width={22} height={14} fill="#38bdf8" opacity="0.4" rx="1" />
              </g>
            );
          })}
          <text x={170} y={96} fontSize="7" fill="#bae6fd" fontFamily="ui-monospace">COLD</text>
          <text x={170} y={212} fontSize="7" fill="#bae6fd" fontFamily="ui-monospace">COLD</text>
          <text x={170} y={128} fontSize="7" fill="#fdba74" fontFamily="ui-monospace">HOT</text>
          <text x={170} y={160} fontSize="7" fill="#fdba74" fontFamily="ui-monospace">HOT</text>
          <text x={170} y={176} fontSize="7" fill="#bae6fd" fontFamily="ui-monospace">COLD</text>

          {/* arrows: fiber in, power in, heat out */}
          <g fontFamily="ui-monospace" fontSize="9">
            <path d="M 10 120 L 35 120" stroke="#c4b5fd" strokeWidth="1.4" markerEnd="url(#arrV)" />
            <text x={8} y={112} textAnchor="start" fill="#c4b5fd">fiber →</text>
            <path d="M 610 200 L 585 200" stroke="#fb7185" strokeWidth="1.4" markerEnd="url(#arrR)" />
            <text x={598} y={192} textAnchor="end" fill="#fb7185">← utility</text>
            <path d="M 525 50 L 525 70" stroke="#7dd3fc" strokeWidth="1.4" markerEnd="url(#arrC)" />
            <text x={526} y={46} textAnchor="start" fill="#7dd3fc">heat →</text>
          </g>
          <defs>
            <marker id="arrV" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#c4b5fd" />
            </marker>
            <marker id="arrR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#fb7185" />
            </marker>
            <marker id="arrC" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#7dd3fc" />
            </marker>
          </defs>
        </svg>
        <FloatingTip hover={hover} render={(h) => (
          <div>
            <div className="font-semibold" style={{ color: h.color }}>{h.label}</div>
            <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
          </div>
        )} />
      </div>

      <p className="text-sm text-neutral-400">
        Three flows cross the building envelope: <span className="text-violet-300">fiber</span> enters the meet-me room, <span className="text-rose-300">power</span> enters at the utility yard and generators, and <span className="text-sky-300">heat</span> exits via the cooling plant. Everything inside is a pipeline that takes those inputs and delivers clean, reliable, conditioned power + cold air to each rack — and takes the exhaust heat back out.
      </p>

      <Deeper>
        <p>
          <strong>Hot/cold aisle containment</strong> is the cheapest single efficiency lever a DC has. Without it, cold supply air mixes with hot return air and you're cooling air you already cooled, or worse, drawing hot air into a server intake. Containing the hot aisle (curtains, doors, ceilings) means every watt of cooling serves a watt of compute. This alone can move PUE from 1.8 to 1.3.
        </p>
        <p>
          <strong>Raised floor vs. slab.</strong> Raised floors used to be universal (you pushed cold air under the floor and it came up through perforated tiles). Modern high-density designs often skip the floor — cold air is ducted overhead, cables run overhead — because under-floor plenums can't move enough air for 50+ kW racks and the floor itself is expensive. Slab designs also let you pack racks closer to the ground and use heavier liquid-cooling hardware without bracing.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   03 — RACKS & SERVERS
   ============================================================================ */

const RACK_TIMELINE = [
  { y: 2005, kw: 4,   note: '1U pizza-box era · Xeon, spinning disks' },
  { y: 2010, kw: 6,   note: 'virtualization · blade servers' },
  { y: 2015, kw: 10,  note: 'cloud hyperscale · 2U densified' },
  { y: 2020, kw: 15,  note: 'air-cooled CPU + some inference GPU' },
  { y: 2022, kw: 30,  note: 'A100 GPU pods (8–16 GPU boxes)' },
  { y: 2024, kw: 60,  note: 'H100 · rear-door liquid, 72-GPU NVLink racks' },
  { y: 2025, kw: 120, note: 'GB200 NVL72 · direct-to-chip liquid mandatory' },
  { y: 2026, kw: 250, note: 'roadmap racks · 576-GPU pods (GB300, MI350X)' },
];

const RACK_COMPOSITION = [
  { k: 'cpu',   label: 'CPU server',       u: 2, watts: 700,  color: '#7dd3fc', desc: 'Dual-socket Xeon/EPYC, 1–2 TB RAM, 2×25–100 GbE. The workhorse — web, database, mid-train.' },
  { k: 'gpu',   label: 'GPU server',       u: 6, watts: 10500,color: '#f0abfc', desc: '8× H100/H200 SXM or 4× GB200 · NVLink or NVSwitch inside the box · 8× 400 Gb InfiniBand/RoCE out.' },
  { k: 'store', label: 'Storage JBOD',     u: 4, watts: 800,  color: '#fbbf24', desc: 'All-flash or hybrid · tens to hundreds of TB usable · serves the compute tier over NVMe-oF or S3-compat.' },
  { k: 'net',   label: 'ToR switch',       u: 1, watts: 450,  color: '#6ee7b7', desc: 'Top-of-rack leaf · typically 32×400 GbE or 64×100 GbE · uplinks to spine.' },
  { k: 'mgmt',  label: 'Mgmt / OOB',       u: 1, watts: 100,  color: '#a78bfa', desc: 'Out-of-band management switch · BMC network · terminal servers.' },
];

const RacksServers = () => {
  const [year, setYear] = useState(2024);
  const nearest = RACK_TIMELINE.reduce((a, b) => (Math.abs(b.y - year) < Math.abs(a.y - year) ? b : a));
  const [hovComp, setHovComp] = useState(null);

  return (
    <Card id="racks" icon={Rows3} title="Racks & servers" subtitle="The unit of physical compute" accent="cyan" index={3}>
      <p>
        Inside the whitespace, everything is measured in <strong>rack units</strong> (U) — slots 44.45 mm (1.75″) tall. A standard rack is 42U or 45U (≈2 m) tall, 600–800 mm wide, and 1000–1200 mm deep. Each rack has two PDUs at the back (A-feed + B-feed for redundancy), structured copper/fiber at the top, and cable management throughout. A rack is the <em>unit of everything</em>: power, cooling, network, deployment, failure domain.
      </p>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
        {/* Rack composition visual */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">typical hyperscale rack · hover to inspect</div>
          <svg viewBox="0 0 240 440" className="w-full h-auto" onMouseLeave={() => setHovComp(null)}>
            {/* rack frame */}
            <rect x={20} y={10} width={200} height={420} fill="none" stroke="#ffffff30" strokeWidth="1.5" rx="4" />
            <rect x={12} y={6} width={216} height={10} fill="#262626" rx="2" />
            <rect x={12} y={424} width={216} height={12} fill="#262626" rx="2" />
            {/* contents — fill from top */}
            {(() => {
              const items = [
                { ...RACK_COMPOSITION[4], count: 1 },  // mgmt 1U
                { ...RACK_COMPOSITION[3], count: 2 },  // ToR 2U (A+B)
                { ...RACK_COMPOSITION[1], count: 4 },  // GPU 4× 6U = 24U — demo GPU rack
                { ...RACK_COMPOSITION[2], count: 2 },  // storage 2× 4U = 8U
                { ...RACK_COMPOSITION[0], count: 4 },  // CPU 4× 2U = 8U (spare cap)
              ];
              const total = items.reduce((s, it) => s + it.u * it.count, 0);
              const uPx = (420 - 4) / 42;
              let yy = 14;
              const rects = [];
              items.forEach((it, idx) => {
                for (let i = 0; i < it.count; i++) {
                  const h = it.u * uPx;
                  rects.push(
                    <g key={`${idx}-${i}`}
                       onMouseEnter={(e) => setHovComp({ ...it, mx: e.clientX, my: e.clientY })}
                       onMouseMove={(e) => setHovComp({ ...it, mx: e.clientX, my: e.clientY })}
                       style={{ cursor: 'pointer' }}>
                      <rect x={26} y={yy} width={188} height={h - 1.2} fill={it.color} fillOpacity={hovComp?.k === it.k ? 0.55 : 0.22} stroke={it.color} strokeOpacity={0.6} strokeWidth={0.8} rx={1.5} />
                      {h > 14 && (
                        <text x={120} y={yy + h / 2 + 3} fontSize="9.5" textAnchor="middle" fill="#e5e5e5" fontFamily="ui-monospace">{it.label}</text>
                      )}
                    </g>
                  );
                  yy += h;
                }
              });
              return rects;
            })()}
            {/* U markings */}
            {[1, 10, 20, 30, 42].map((u) => {
              const y = 14 + (42 - u) * ((420 - 4) / 42);
              return <text key={u} x={18} y={y + 3} fontSize="7" fill="#737373" fontFamily="ui-monospace" textAnchor="end">{u}U</text>;
            })}
          </svg>
          <FloatingTip hover={hovComp} render={(h) => (
            <div>
              <div className="font-semibold" style={{ color: h.color }}>{h.label}</div>
              <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                <span className="text-neutral-500">height</span><span className="text-right font-mono">{h.u}U</span>
                <span className="text-neutral-500">power</span><span className="text-right font-mono">{(h.watts/1000).toFixed(h.watts<1000?2:1)} kW</span>
              </div>
            </div>
          )} />
        </div>

        {/* Density evolution */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">rack power density over time</div>
          <div className="mt-2 mb-4 flex items-baseline gap-3">
            <div className="font-mono text-4xl text-amber-300">{nearest.kw}<span className="text-lg text-neutral-500"> kW</span></div>
            <div className="text-xs text-neutral-400">{nearest.y} · {nearest.note}</div>
          </div>
          <svg viewBox="0 0 380 180" className="w-full h-auto">
            <line x1="30" y1="160" x2="370" y2="160" stroke="#ffffff20" />
            {[0, 50, 100, 150, 200, 250].map((g) => (
              <g key={g}>
                <line x1="28" y1={160 - g * 0.52} x2="370" y2={160 - g * 0.52} stroke="#ffffff08" />
                <text x="26" y={163 - g * 0.52} fontSize="8" textAnchor="end" fill="#737373" fontFamily="ui-monospace">{g}</text>
              </g>
            ))}
            {(() => {
              const xOf = (y) => 30 + ((y - 2005) / (2026 - 2005)) * 340;
              const yOf = (kw) => 160 - kw * 0.52;
              const pts = RACK_TIMELINE.map((p) => `${xOf(p.y)},${yOf(p.kw)}`).join(' ');
              return (
                <>
                  <polyline points={pts} fill="none" stroke="#fbbf24" strokeWidth="1.8" />
                  {RACK_TIMELINE.map((p) => {
                    const active = Math.abs(p.y - year) < 1;
                    return (
                      <g key={p.y}>
                        <circle cx={xOf(p.y)} cy={yOf(p.kw)} r={active ? 5 : 3} fill={active ? '#fbbf24' : '#fbbf24aa'} />
                        {active && (
                          <text x={xOf(p.y)} y={yOf(p.kw) - 10} fontSize="9" textAnchor="middle" fill="#fbbf24" fontFamily="ui-monospace">{p.kw} kW</text>
                        )}
                      </g>
                    );
                  })}
                  {[2005, 2010, 2015, 2020, 2025].map((y) => (
                    <text key={y} x={xOf(y)} y={175} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">{y}</text>
                  ))}
                  <text x={200} y={18} fontSize="9" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace">kW per rack (log-ish growth — then GPU cliff)</text>
                </>
              );
            })()}
          </svg>
          <input
            type="range" min="2005" max="2026" step="1" value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="w-full mt-2 accent-amber-400"
          />
          <div className="mt-1 text-[11px] text-neutral-500 font-mono text-center">scrub year</div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Rack unit" value="44.45 mm" sub="1U = 1.75 inches" />
        <Stat label="Standard rack" value="42U" sub="~2 m tall, 600–800 mm wide" />
        <Stat label="CPU server typical" value="2U / 0.7 kW" sub="dual-socket x86" color="text-sky-300" />
        <Stat label="GPU server typical" value="6U / 10.5 kW" sub="8× H100 SXM" color="text-fuchsia-300" />
      </div>

      <p className="text-sm text-neutral-400">
        The quiet revolution of the 2020s is <strong>power density</strong>. A CPU rack from 2015 drew ~10 kW; a full <Chip color="fuchsia">GB200 NVL72</Chip> rack in 2025 draws <strong>120 kW</strong> — same floor space, 12× the power. Air cooling stops working around 25–30 kW/rack; above that, the only way to get the heat out is with liquid in direct contact with the silicon. This is why liquid cooling went from exotic to default in ~3 years.
      </p>

      <Deeper>
        <p>
          <strong>Why 19"/<Term>42U</Term>?</strong> The width traces to 1922 AT&T relay racks, which in turn traced to railroad telegraph equipment. It has survived because every server vendor standardized on it, rails and <Term>PDU</Term>s assume it, and data hall aisles are planned around it. Changing the form factor is harder than changing the silicon.
        </p>
        <p>
          <strong>Server components.</strong> A modern 2U CPU server contains: 2 CPU sockets (64–128 cores each), 16–32 DDR5 <Term>DIMMs</Term> (1–2 TB), 6–10 <Term>NVMe</Term> drives (<Term def="A component you can pull out and replace without powering the system down — drives, PSUs, fans are typical.">hot-swap</Term> from the front), 2 <Term>NICs</Term> (25/100/400 Gb), a <Term>BMC</Term>/iDRAC/iLO for out-of-band management, 2 hot-swap <Term>PSUs</Term> (for A+B feeds), and ~6 fans at the front that pull cold air through. A GPU server (6U typical) has the same skeleton plus 8 accelerators on an <Term>HGX</Term> or NVL baseboard linked by <Term>NVLink</Term>/<Term>NVSwitch</Term>, and dramatically bigger power + cooling.
        </p>
        <p>
          <strong>Storage tiers.</strong> Local <Term>NVMe</Term> on the compute node (μs latency, TB scale); a disaggregated all-flash array for working set (tens of μs, 100s of TB); object storage on HDD with <Term>erasure coding</Term> for the warm/cold tier (ms latency, PB scale). For AI training, checkpoint writes dominate — a 1-trillion-parameter model checkpoint is ~4 TB and has to land every 15–30 minutes.
        </p>
        <p>
          <strong>Dual-socket vs single-socket.</strong> Dual-socket boxes used to be the default because they doubled cores and memory per U. But every cross-socket memory access pays a <em><Term>NUMA</Term></em> penalty (~2× the local-DRAM latency, often 100+ ns extra), and the <Term>UPI</Term>/<Term>Infinity Fabric</Term> link between the sockets caps cross-socket bandwidth. Modern core-dense CPUs (AMD EPYC with 96–128 cores, Ampere/ARM with 128–192) ship enough cores in a single socket that hyperscalers — Google, Meta, Azure — now build huge fleets of <em>single-socket</em> machines: simpler NUMA, more memory bandwidth per core, cheaper motherboard, and scheduling is trivial. Dual-socket persists where per-box RAM capacity is the hard constraint (big in-memory DBs, SAP HANA) or where a licensed workload prices per box.
        </p>
        <p>
          <strong>NVMe vs SAS/SATA.</strong> <Term>SAS</Term> dominated the 2010s because a single <Term>HBA</Term> could fan out to dozens of drives cheaply, and dual-port SAS let two controllers share a drive for HA arrays. <Term>NVMe</Term> tied the drive directly to the host's PCIe lanes, which collapsed the stack but also collapsed the <em>blast radius</em>: lose the host, lose the drives. <Term>NVMe-over-Fabrics</Term> (<Term>NVMe/TCP</Term>, <Term>NVMe/RoCE</Term>) puts back the disaggregation — a pool of drives in one chassis, served over the network with near-local latency (~20–50 μs added). The trade-off: you now need a lossless network (<Term>PFC</Term>, <Term>ECN</Term>) and careful congestion tuning, or tail latency blows up. Most serious all-flash arrays are NVMe/TCP in 2025; SAS lingers in cheaper warm storage and in hardware-RAID boxes that don't want to rearchitect.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   04 — POWER INFRASTRUCTURE
   ============================================================================ */

const PowerInfrastructure = () => {
  const [hover, setHover] = useState(null);

  // Energy flow for a typical 30 MW enterprise-grade DC. PUE ≈ 1.4.
  // Values are MW of power flow.
  const nodes = [
    { id: 'grid', label: 'Utility grid',  col: 0, color: '#a3a3a3' },
    { id: 'gen',  label: 'Generators',    col: 0, color: '#fb7185' },
    { id: 'sg',   label: 'Switchgear',    col: 1, color: '#fbbf24' },
    { id: 'ups',  label: 'UPS',           col: 2, color: '#f97316' },
    { id: 'pdu',  label: 'PDU / busway',  col: 3, color: '#fdba74' },
    { id: 'it',   label: 'IT load',       col: 4, color: '#7dd3fc' },
    { id: 'cool', label: 'Cooling',       col: 4, color: '#22d3ee' },
    { id: 'light',label: 'Lighting · misc',col: 4, color: '#a78bfa' },
    { id: 'heat', label: 'Heat / loss',   col: 5, color: '#525252' },
    { id: 'atmo', label: 'Atmosphere',    col: 5, color: '#737373' },
  ];
  const links = [
    { src: 'grid', dst: 'sg',   v: 29.9, meta: { note: 'normal path — utility feeds the primary bus' } },
    { src: 'gen',  dst: 'sg',   v: 0.1,  meta: { note: 'idle standby — bumps to full load on utility fail' } },
    { src: 'sg',   dst: 'ups',  v: 22,   meta: { note: 'A+B double-conversion UPS strings on IT feed' } },
    { src: 'sg',   dst: 'cool', v: 7.5,  meta: { note: 'chillers + CRAH + pumps from mechanical bus' } },
    { src: 'sg',   dst: 'light',v: 0.5,  meta: { note: 'lights, security, BMS — "house load"' } },
    { src: 'ups', dst: 'pdu',  v: 21.5, meta: { note: '~2.5% loss in UPS double conversion' } },
    { src: 'ups', dst: 'heat', v: 0.5,  meta: { note: 'UPS conversion loss (→ dissipated as heat)' } },
    { src: 'pdu', dst: 'it',   v: 21.2, meta: { note: '~1.5% PDU + cable loss' } },
    { src: 'pdu', dst: 'heat', v: 0.3,  meta: { note: 'PDU transformer + distribution loss' } },
    { src: 'it',  dst: 'heat', v: 21.2, meta: { note: 'every IT watt becomes heat — 1:1' } },
    { src: 'cool',dst: 'atmo', v: 7.5,  meta: { note: 'cooling power rejected + heat pumped out' } },
    { src: 'light',dst:'heat', v: 0.5,  meta: { note: 'also heat — captured by CRAHs' } },
    { src: 'heat',dst: 'atmo', v: 22.5, meta: { note: 'total thermal rejected through cooling towers' } },
  ];

  const totalIn = 30;
  const itLoad = 21.2;
  const pue = totalIn / itLoad;

  return (
    <Card id="power" icon={Zap} title="Power infrastructure" subtitle="From 138 kV to 12 V — and every joule of loss along the way" accent="amber" index={4}>
      <MinSchema>
        <strong>30 MW in → 21 MW compute + 9 MW overhead.</strong> Every stage (utility → switchgear → UPS → PDU → rack → server) has an A-path and a B-path so any single failure drops zero IT load. Every watt of loss becomes heat the cooling plant has to remove.
      </MinSchema>

      <p>
        The single largest engineering challenge in a DC is <strong>delivering clean, uninterrupted power at scale</strong>. A 30 MW facility <Grounding>draw of a town of ~25,000 homes</Grounding> pulls more than a small city's worth of electricity at a single meter, and every component from the utility interconnect to the server <Term>PSU</Term> (<CrossLink to="racks" recap="Power Supply Unit — the 12 V-converting module inside each server. Dual-redundant and hot-swap in modern boxes.">see Racks</CrossLink>) is designed around two principles: <em>no single failure takes the IT load down</em>, and <em>every watt of loss has to be cooled</em>. The flow looks like a funnel with built-in redundancy at each stage.
      </p>

      <WhenItMatters>
        Matters if you're picking colo tiers, budgeting for AI compute, or writing SLAs that assume 99.99%+ uptime. Can be skimmed if your whole deployment fits under a few kW and lives in a closet — home routers don't need <Term>ATS</Term>.
      </WhenItMatters>

      <Predict question="A 30 MW facility running at PUE 1.42. How much of that actually reaches the compute (vs. cooling + losses + lighting)?">
        <strong>~21.2 MW of the 30 MW input.</strong> The rest: 7.5 MW cooling, 0.5 MW lighting/BMS/security, and ~0.8 MW lost to UPS and PDU conversion (which also turns into heat the cooling plant has to remove). PUE = 30 / 21.2 = 1.42 — every useful compute watt costs ~0.42 W of overhead.
      </Predict>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4 relative">
        <div className="flex items-baseline justify-between">
          <div className="text-xs uppercase tracking-widest text-neutral-500">energy flow · typical 30 MW facility · pue 1.42</div>
          <div className="text-[10px] text-neutral-500 font-mono">all values MW</div>
        </div>
        <div className="mt-3">
          <Sankey nodes={nodes} links={links}
                  colLabels={['sources','switchgear','ups','distribution','loads','reject']}
                  width={640} height={380}
                  hover={hover} setHover={setHover}
                  format={(v) => v.toFixed(1)} unit=" MW" />
        </div>
        <FloatingTip hover={hover} render={(p) => (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: p.srcColor }}>{p.srcLabel}</span>
              <span className="text-neutral-500">→</span>
              <span className="font-semibold" style={{ color: p.dstColor }}>{p.dstLabel}</span>
            </div>
            <div className="mt-1 text-[11px]">
              <span className="font-mono text-amber-300">{p.v.toFixed(2)} MW</span>
              <span className="text-neutral-500"> · {((p.v / 30) * 100).toFixed(1)}% of input</span>
            </div>
            {p.meta?.note && <div className="mt-1 text-[11px] text-neutral-400">{p.meta.note}</div>}
          </div>
        )} />
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Input from grid" value="30 MW" sub="at 138 kV · site substation" color="text-amber-300" />
        <Stat label="IT load (compute)" value="21.2 MW" sub="the only useful work" color="text-sky-300" />
        <Stat label="Cooling load" value="7.5 MW" sub="25% of input" color="text-cyan-300" />
        <Stat label="PUE" value="1.42" sub="total / IT — industry avg ~1.56" color="text-emerald-300" />
      </div>

      <Worked title="PUE in numbers">
        <div><span className="text-neutral-400">formula:</span> <span className="font-mono text-sky-200">PUE = total facility power / IT power</span></div>
        <div><span className="text-neutral-400">plug in:</span> <span className="font-mono text-sky-200">PUE = 30.0 MW / 21.2 MW = 1.415</span></div>
        <div className="text-neutral-300">So every <span className="font-mono text-sky-200">1 W</span> of compute costs <span className="font-mono text-amber-300">0.42 W</span> of overhead. Push cooling from 7.5 → 4.5 MW (free cooling in winter) and PUE drops to <span className="font-mono text-emerald-300">27.0 / 21.2 = 1.27</span> — the same IT load, 10% less grid draw.</div>
      </Worked>

      <Misconception
        wrong={<>"PUE 1.0 = a perfect data center."</>}
        right={<>A facility-level PUE of 1.0 only means the <em>building</em> adds no overhead beyond the IT feed. The servers themselves still burn power on fans, PSU losses, and VRMs — invisible to PUE.</>}
        because={<>The honest metric is <Term>TUE</Term> (= PUE × <Term>ITUE</Term>), which captures in-server losses too. A "PUE 1.06" headline usually hides an ITUE of 1.15+.</>}
      />

      <PowerOneLine />

      <PowerChain />

      <Deeper>
        <p>
          <strong>The power chain in order.</strong> Utility medium-voltage (13.8–34.5 kV) enters at the <em>site substation</em>, steps up/down through transformers, and arrives at <em>medium-voltage <Term>switchgear</Term></em> — the automatic transfer switch (<Term>ATS</Term>) monitors the feed and, on loss, commands the <Term>gensets</Term> to start and transfers the load within 10–15 seconds. <em><Term>UPS</Term> strings</em> (batteries or <Term>flywheel</Term>s) carry the load during that transfer — they must ride through the generator startup, so they're sized for 5–15 minutes of full load. After the UPS, <em><Term>PDU</Term>s</em> (power distribution units) step down to 415 V three-phase and feed <em><Term>busways</Term></em> running above each row. At the rack, <em><Term>rack PDUs</Term></em> split to individual outlets at 208 V or 230 V, and each server <Term>PSU</Term> converts to 12 V DC internally. Modern hyperscale designs often skip the rack PDU and distribute <Term>48 V DC</Term> or <Term>400 V DC</Term> directly to the shelf — cleaner, fewer conversions, smaller losses.
        </p>
        <p>
          <strong>UPS topology.</strong> Three flavors dominate: <em><Term>Double-conversion</Term></em> (AC → DC → AC, always on, best isolation, ~3% loss); <em><Term>line-interactive</Term></em> (grid direct with battery filter, ~1% loss, less isolation); <em><Term>flywheel</Term></em> (kinetic, 10–20 seconds of ride-through, no chemistry to maintain, great for sites that flip to gensets fast). <Term>Li-ion</Term> has replaced <Term>VRLA</Term> batteries at most greenfield sites: 3× the cycle life, 50% the footprint, and online remote state-of-charge.
        </p>
        <p>
          <strong>Why redundant paths look like letters.</strong> An "N" design has one path from utility to rack. "<Term>N+1</Term>" has one spare of each component. "<Term>2N</Term>" has <em>two fully independent paths</em> — two utility feeds, two generator lineups, two UPS strings, two PDUs, two rack feeds (A and B on the left and right of the rack). Each server has dual power supplies, one plugged into each. A full-power fault on one side drops zero IT load. Hyperscalers often blend: 2N on critical power, N+1 on cooling, because fans fail more gracefully than transformers.
        </p>
        <p>
          <strong>UPS chemistry economics.</strong> <em><Term>VRLA</Term> lead-acid</em> is cheap (~$150/kWh installed), well-understood, and tolerates abuse — but lives 3–5 years, needs a dedicated battery room with hydrogen ventilation, and string-level failures are subtle until you discharge. <em><Term>Li-ion</Term></em> costs ~2× up front but lives 10–15 years, fits in the UPS cabinet itself (no battery room), weighs a third as much, and has online state-of-charge on every cell. Over a 15-year facility life, Li-ion's TCO is lower and it frees ~30% of the electrical room for more IT. <em><Term>Flywheels</Term></em> (kinetic, ~2 kWh per unit) give 10–20 seconds of ride-through with no chemistry to degrade and instant diagnostics, but only make sense at sites with fast-starting gensets (&lt;10 s) and where the genset startup is itself highly reliable — lose the start sequence and you've only got seconds before the load drops. Most AI-era greenfield builds are Li-ion; flywheels appear where floor space is priceless (Manhattan colos) and lead-acid persists only in retrofits.
        </p>
        <p>
          <strong>Why some hyperscalers bypass the rack PDU entirely.</strong> Every AC↔DC conversion costs 2–5%. A traditional chain does AC utility → AC UPS → AC PDU → AC rack PDU → AC PSU → DC 12V to the board — four conversions, ~10% total loss. <Term>OCP</Term>-style <em><Term>48 V DC</Term></em> at the rack (Meta, Google) and Microsoft's <em><Term>400 V DC</Term></em> bus collapse this to one or two conversions and save 3–6% at the building level, which at 100 MW is a few megawatts of free compute. The trade-off: DC arcs don't self-extinguish the way AC does (zero-crossings), so breakers, connectors, and procedures all have to be redesigned; the vendor ecosystem is thinner; and retrofitting a mixed AC/DC hall is operationally painful. That's why DC distribution is a hyperscale/greenfield pattern, not a universal default.
        </p>
      </Deeper>

      <QA items={[
        {
          q: "Utility power drops at 02:17 AM. In what order do the power sources take over, and on what timescales?",
          a: <>(1) <Term>UPS</Term> batteries/flywheels pick up the load <em>instantly</em> (millisecond switchover) and carry it for 5–15 min. (2) The <Term>ATS</Term> senses utility loss, signals the <Term>gensets</Term> to start, and transfers the load within ~10–15 s. (3) Once gensets are stable, UPS goes back to float-charge. If gensets fail to start, you've got only battery runtime before the IT drops.</>,
        },
        {
          q: "A colo advertises PUE 1.1. The customer's rack PDU shows 10 kW IT draw. What does the facility actually draw from the grid for that rack, and where does the gap go?",
          a: <>Facility draws <span className="font-mono text-sky-200">10 × 1.1 = 11 kW</span>. The extra 1 kW is cooling (fans, chilled water), UPS idle losses, PDU/transformer losses, and lighting/BMS overhead — prorated to this rack. At PUE 1.4 the same 10 kW IT rack would pull 14 kW from the grid.</>,
        },
        {
          q: "Why is 2N on power but only N+1 on cooling a common hyperscale pattern?",
          a: <>Power faults are <em>sudden</em> — lose a UPS string, the load drops <em>now</em>, so you want a fully independent duplicate path (<Term>2N</Term>). Cooling faults are <em>gradual</em> — lose a chiller and temperature rises over minutes, giving you time for a spare (<Term>N+1</Term>) to spin up. Matching the redundancy topology to the failure mode's time-constant saves a lot of capex.</>,
        },
        {
          q: "Why does converting to 48 V DC at the rack save 3–6% at the building level, not ~30%?",
          a: <>Each AC↔DC conversion loses only 2–5%, not 30%. You're collapsing a chain of four conversions (UPS, PDU, rack PDU, server PSU) down to one or two. The savings compound: ~3% per conversion × 2 fewer conversions ≈ 5–6%. At 100 MW, that's a few MW of free compute — huge at scale, invisible at one rack.</>,
        },
      ]} />
    </Card>
  );
};

// One-line electrical diagram — 2N distribution
const PowerOneLine = () => {
  const [hov, setHov] = useState(null); // 'A' | 'B' | 'genA' | 'genB' | null

  const C = {
    A:    '#fbbf24',  // amber
    B:    '#38bdf8',  // sky
    gen:  '#fb7185',  // rose
    util: '#a3a3a3',
    bat:  '#6ee7b7',  // emerald (charged batteries)
    dim:  '#737373',
  };

  // A-side x=170, B-side x=550, gensets at x=50 (A) and x=670 (B)
  const AX = 170, BX = 550, GAX = 50, GBX = 670;
  const isA = hov === 'A' || hov === 'genA';
  const isB = hov === 'B' || hov === 'genB';

  // Reusable Component box
  const Box = ({ x, y, w, h, color, active, children }) => (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h}
            fill={active ? `${color}30` : `${color}14`}
            stroke={active ? color : `${color}aa`}
            strokeWidth={active ? 1.8 : 1.1} rx={4} />
      {children}
    </g>
  );

  // Wire segment with animated flow
  const Wire = ({ d, color, active, reverse = false, width = 2 }) => (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity={active ? 0.35 : 0.22} strokeWidth={width + 2} />
      <path d={d} fill="none" stroke={color} strokeOpacity={active ? 1 : 0.7} strokeWidth={width} />
      <motion.path d={d} fill="none" stroke="#ffffff" strokeOpacity={active ? 0.95 : 0.55}
            strokeWidth={width - 0.5} strokeDasharray="3 14"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: reverse ? 17 : -17 }}
            transition={{ repeat: Infinity, duration: active ? 0.8 : 1.6, ease: 'linear' }} />
    </g>
  );

  // Small voltage tag
  const VTag = ({ x, y, text, color }) => (
    <g>
      <rect x={x - 22} y={y - 7} width={44} height={14} rx={2} fill="#0a0a0a" stroke={color} strokeOpacity={0.5} strokeWidth="0.8" />
      <text x={x} y={y + 3.5} fontSize="8.5" textAnchor="middle" fill={color} fontFamily="ui-monospace">{text}</text>
    </g>
  );

  // "3-phase" utility arrows
  const UtilitySymbol = ({ x, y, color, active }) => (
    <g>
      {/* 3-phase sine bundle */}
      <path d={`M ${x - 14} ${y - 3} Q ${x - 7} ${y - 10} ${x} ${y - 3} T ${x + 14} ${y - 3}`} fill="none" stroke={color} strokeOpacity={active ? 0.9 : 0.55} strokeWidth="1" />
      <path d={`M ${x - 14} ${y + 1} Q ${x - 7} ${y - 6} ${x} ${y + 1} T ${x + 14} ${y + 1}`} fill="none" stroke={color} strokeOpacity={active ? 0.9 : 0.55} strokeWidth="1" />
      <path d={`M ${x - 14} ${y + 5} Q ${x - 7} ${y - 2} ${x} ${y + 5} T ${x + 14} ${y + 5}`} fill="none" stroke={color} strokeOpacity={active ? 0.9 : 0.55} strokeWidth="1" />
    </g>
  );

  // Transformer — two touching coils
  const XFMRSymbol = ({ x, y, color, active }) => (
    <g stroke={color} strokeOpacity={active ? 0.95 : 0.65} fill="none" strokeWidth="1.2">
      <circle cx={x - 5} cy={y} r="6" />
      <circle cx={x + 5} cy={y} r="6" />
    </g>
  );

  // Switch inside switchgear cabinet
  const BreakerSymbol = ({ x, y, color, active }) => (
    <g stroke={color} strokeOpacity={active ? 0.95 : 0.65} fill="none" strokeWidth="1.2">
      <circle cx={x} cy={y - 6} r="1.6" fill={color} />
      <circle cx={x} cy={y + 6} r="1.6" fill={color} />
      <line x1={x} y1={y - 6} x2={x + 5} y2={y + 4} />
    </g>
  );

  // ATS symbol: two inputs merging into one output via a switch
  const ATSSymbol = ({ x, y, color, active }) => (
    <g stroke={color} strokeOpacity={active ? 0.95 : 0.7} fill="none" strokeWidth="1.2">
      <line x1={x - 10} y1={y - 5} x2={x} y2={y} />
      <line x1={x + 10} y1={y - 5} x2={x} y2={y} />
      <circle cx={x - 10} cy={y - 5} r="1.5" fill={color} />
      <circle cx={x + 10} cy={y - 5} r="1.5" fill={color} />
      <line x1={x} y1={y} x2={x} y2={y + 8} />
      <path d={`M ${x - 3} ${y + 8} L ${x + 3} ${y + 8}`} />
    </g>
  );

  // UPS with battery cells visible
  const UPSBatterySymbol = ({ x, y, color, active }) => (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x - 22 + i * 9} y={y - 4} width={6} height={8} rx={0.8}
              fill={C.bat} fillOpacity={active ? 0.9 : 0.55} stroke={C.bat} strokeOpacity={0.7} strokeWidth="0.5" />
      ))}
      {/* sine wave (inverter output) */}
      <path d={`M ${x - 10} ${y + 9} q 4 -4 8 0 t 8 0`} fill="none" stroke={color} strokeOpacity={active ? 0.9 : 0.6} strokeWidth="1" />
    </g>
  );

  // Generator — circle with G + fuel tank
  const GenSymbol = ({ x, y, color, active, tankSide }) => (
    <g>
      <circle cx={x} cy={y} r="11" fill={`${color}20`} stroke={color} strokeOpacity={active ? 1 : 0.7} strokeWidth="1.3" />
      <text x={x} y={y + 3.5} fontSize="11" textAnchor="middle" fill={color} fontFamily="ui-monospace" fontWeight="600">G</text>
      {/* fuel tank */}
      <rect x={tankSide === 'L' ? x - 38 : x + 16} y={y - 7} width={18} height={14} rx={2}
            fill="#1a1a1a" stroke={color} strokeOpacity={active ? 0.9 : 0.55} strokeWidth="1" />
      <text x={tankSide === 'L' ? x - 29 : x + 25} y={y + 2.5} fontSize="7.5" textAnchor="middle" fill={color} fontFamily="ui-monospace">FUEL</text>
    </g>
  );

  // PDU with breakers inside
  const PDUSymbol = ({ x, y, color, active }) => (
    <g>
      {[-1, 0, 1].map((i) => (
        <g key={i}>
          <circle cx={x + i * 12} cy={y - 4} r="1.6" fill={color} opacity={active ? 1 : 0.7} />
          <line x1={x + i * 12} y1={y - 4} x2={x + i * 12 + 4} y2={y + 4} stroke={color} strokeOpacity={active ? 0.95 : 0.65} strokeWidth="1" />
        </g>
      ))}
    </g>
  );

  // Busway horizontal bar
  const Busway = ({ y, color, active, label }) => (
    <g>
      {/* main channel */}
      <rect x={35} y={y - 5} width={650} height={10} fill={`${color}22`} stroke={color}
            strokeOpacity={active ? 0.95 : 0.6} strokeWidth="1.2" rx={2} />
      {/* mounting tabs */}
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x={50 + i * 52} y={y - 9} width={6} height={3} fill={color} opacity={active ? 0.9 : 0.55} />
      ))}
      {/* tap-off points every 2 tabs */}
      {Array.from({ length: 7 }).map((_, i) => (
        <circle key={i} cx={76 + i * 104} cy={y} r={1.8} fill="#f5f5f5" opacity={active ? 0.9 : 0.5} />
      ))}
      <text x={30} y={y + 3} fontSize="8.5" textAnchor="end" fill={color} fontFamily="ui-monospace" style={{ letterSpacing: '0.08em' }}>{label}</text>
    </g>
  );

  const W = 720, H = 620;

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4 overflow-hidden">
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 justify-between">
        <div className="text-xs uppercase tracking-widest text-neutral-500">one-line · 2N distribution · utility + genset → ups → pdu → busway → rack</div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: C.A }} /><span style={{ color: C.A }}>A-side</span></span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: C.B }} /><span style={{ color: C.B }}>B-side</span></span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: C.gen }} /><span style={{ color: C.gen }}>genset</span></span>
        </div>
      </div>

      <svg viewBox={`-30 0 ${W + 160} ${H}`} className="w-full h-auto mt-3" onMouseLeave={() => setHov(null)}>
        <defs>
          <pattern id="grid-oneline" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={C.A} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.A} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={C.B} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.B} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid-oneline)" />

        {/* Side labels */}
        <text x={170} y={22} fontSize="11" textAnchor="middle" fill={C.A} fontFamily="ui-monospace" style={{ letterSpacing: '0.25em' }}>A · SIDE</text>
        <text x={550} y={22} fontSize="11" textAnchor="middle" fill={C.B} fontFamily="ui-monospace" style={{ letterSpacing: '0.25em' }}>B · SIDE</text>

        {/* === A-SIDE PATH === */}
        <g onMouseEnter={() => setHov('A')}>
          {/* Utility → Transformer → MVSG → ATS → UPS → PDU */}
          <Wire d={`M ${AX} 58 L ${AX} 90`} color={C.A} active={isA} />
          <Wire d={`M ${AX} 120 L ${AX} 150`} color={C.A} active={isA} />
          <Wire d={`M ${AX} 180 L ${AX} 215`} color={C.A} active={isA} />
          <Wire d={`M ${AX} 245 L ${AX} 280`} color={C.A} active={isA} />
          <Wire d={`M ${AX} 310 L ${AX} 350`} color={C.A} active={isA} />
          {/* to busway A */}
          <Wire d={`M ${AX} 380 L ${AX} 430`} color={C.A} active={isA} />

          {/* Utility feed */}
          <Box x={AX} y={45} w={82} h={26} color={C.A} active={isA}>
            <UtilitySymbol x={AX - 22} y={45} color={C.A} active={isA} />
            <text x={AX + 6} y={48} fontSize="9.5" textAnchor="middle" fill="#f5f5f5" fontFamily="ui-monospace">UTIL A</text>
          </Box>
          <VTag x={AX + 48} y={75} text="138 kV" color={C.A} />

          {/* Transformer */}
          <Box x={AX} y={105} w={60} h={30} color={C.A} active={isA}>
            <XFMRSymbol x={AX} y={105} color={C.A} active={isA} />
          </Box>
          <VTag x={AX + 48} y={135} text="13.8 kV" color={C.A} />

          {/* MV Switchgear */}
          <Box x={AX} y={165} w={60} h={30} color={C.A} active={isA}>
            <BreakerSymbol x={AX - 12} y={165} color={C.A} active={isA} />
            <BreakerSymbol x={AX + 12} y={165} color={C.A} active={isA} />
            <text x={AX} y={186} fontSize="7.5" textAnchor="middle" fill={C.A} fontFamily="ui-monospace">MVSG</text>
          </Box>

          {/* ATS */}
          <Box x={AX} y={230} w={70} h={30} color={C.A} active={isA}>
            <ATSSymbol x={AX} y={226} color={C.A} active={isA} />
            <text x={AX} y={248} fontSize="8" textAnchor="middle" fill={C.A} fontFamily="ui-monospace">ATS</text>
          </Box>

          {/* UPS with batteries */}
          <Box x={AX} y={295} w={80} h={30} color={C.A} active={isA}>
            <UPSBatterySymbol x={AX} y={295} color={C.A} active={isA} />
            <text x={AX - 42} y={298} fontSize="7.5" textAnchor="end" fill={C.A} fontFamily="ui-monospace" transform={`rotate(-90, ${AX - 42}, 298)`}>UPS</text>
          </Box>
          <VTag x={AX + 58} y={325} text="480 V" color={C.A} />

          {/* PDU */}
          <Box x={AX} y={365} w={70} h={30} color={C.A} active={isA}>
            <PDUSymbol x={AX} y={363} color={C.A} active={isA} />
            <text x={AX} y={383} fontSize="8" textAnchor="middle" fill={C.A} fontFamily="ui-monospace">PDU-A</text>
          </Box>
          <VTag x={AX + 48} y={405} text="415 V" color={C.A} />
        </g>

        {/* Genset A with crossover to ATS A */}
        <g onMouseEnter={() => setHov('genA')}>
          <Wire d={`M ${GAX + 20} 230 L ${AX - 35} 230`} color={C.gen} active={isA} />
          <Box x={GAX} y={230} w={40} h={44} color={C.gen} active={isA}>
            <GenSymbol x={GAX - 3} y={228} color={C.gen} active={isA} tankSide="L" />
          </Box>
          <text x={GAX} y={265} fontSize="8" textAnchor="middle" fill={C.gen} fontFamily="ui-monospace">GENSET A</text>
          <text x={GAX} y={277} fontSize="7.5" textAnchor="middle" fill={C.dim} fontFamily="ui-monospace">2.5 MW · diesel</text>
        </g>

        {/* === B-SIDE PATH === (mirrored) === */}
        <g onMouseEnter={() => setHov('B')}>
          <Wire d={`M ${BX} 58 L ${BX} 90`} color={C.B} active={isB} />
          <Wire d={`M ${BX} 120 L ${BX} 150`} color={C.B} active={isB} />
          <Wire d={`M ${BX} 180 L ${BX} 215`} color={C.B} active={isB} />
          <Wire d={`M ${BX} 245 L ${BX} 280`} color={C.B} active={isB} />
          <Wire d={`M ${BX} 310 L ${BX} 350`} color={C.B} active={isB} />
          <Wire d={`M ${BX} 380 L ${BX} 450`} color={C.B} active={isB} />

          <Box x={BX} y={45} w={82} h={26} color={C.B} active={isB}>
            <UtilitySymbol x={BX - 22} y={45} color={C.B} active={isB} />
            <text x={BX + 6} y={48} fontSize="9.5" textAnchor="middle" fill="#f5f5f5" fontFamily="ui-monospace">UTIL B</text>
          </Box>
          <VTag x={BX + 48} y={75} text="138 kV" color={C.B} />

          <Box x={BX} y={105} w={60} h={30} color={C.B} active={isB}>
            <XFMRSymbol x={BX} y={105} color={C.B} active={isB} />
          </Box>
          <VTag x={BX + 48} y={135} text="13.8 kV" color={C.B} />

          <Box x={BX} y={165} w={60} h={30} color={C.B} active={isB}>
            <BreakerSymbol x={BX - 12} y={165} color={C.B} active={isB} />
            <BreakerSymbol x={BX + 12} y={165} color={C.B} active={isB} />
            <text x={BX} y={186} fontSize="7.5" textAnchor="middle" fill={C.B} fontFamily="ui-monospace">MVSG</text>
          </Box>

          <Box x={BX} y={230} w={70} h={30} color={C.B} active={isB}>
            <ATSSymbol x={BX} y={226} color={C.B} active={isB} />
            <text x={BX} y={248} fontSize="8" textAnchor="middle" fill={C.B} fontFamily="ui-monospace">ATS</text>
          </Box>

          <Box x={BX} y={295} w={80} h={30} color={C.B} active={isB}>
            <UPSBatterySymbol x={BX} y={295} color={C.B} active={isB} />
            <text x={BX + 42} y={298} fontSize="7.5" textAnchor="start" fill={C.B} fontFamily="ui-monospace" transform={`rotate(-90, ${BX + 42}, 298)`}>UPS</text>
          </Box>
          <VTag x={BX + 58} y={325} text="480 V" color={C.B} />

          <Box x={BX} y={365} w={70} h={30} color={C.B} active={isB}>
            <PDUSymbol x={BX} y={363} color={C.B} active={isB} />
            <text x={BX} y={383} fontSize="8" textAnchor="middle" fill={C.B} fontFamily="ui-monospace">PDU-B</text>
          </Box>
          <VTag x={BX + 48} y={405} text="415 V" color={C.B} />
        </g>

        {/* Genset B */}
        <g onMouseEnter={() => setHov('genB')}>
          <Wire d={`M ${GBX - 20} 230 L ${BX + 35} 230`} color={C.gen} active={isB} reverse />
          <Box x={GBX} y={230} w={40} h={44} color={C.gen} active={isB}>
            <GenSymbol x={GBX + 3} y={228} color={C.gen} active={isB} tankSide="R" />
          </Box>
          <text x={GBX} y={265} fontSize="8" textAnchor="middle" fill={C.gen} fontFamily="ui-monospace">GENSET B</text>
          <text x={GBX} y={277} fontSize="7.5" textAnchor="middle" fill={C.dim} fontFamily="ui-monospace">2.5 MW · diesel</text>
        </g>

        {/* === BUSWAY A === */}
        <g onMouseEnter={() => setHov('A')}>
          <Busway y={430} color={C.A} active={isA} label="BUSWAY A" />
          {/* horizontal connection from PDU-A */}
          <Wire d={`M ${AX} 408 L ${AX} 430`} color={C.A} active={isA} />
        </g>

        {/* === BUSWAY B === */}
        <g onMouseEnter={() => setHov('B')}>
          <Busway y={460} color={C.B} active={isB} label="BUSWAY B" />
          <Wire d={`M ${BX} 408 L ${BX} 460`} color={C.B} active={isB} />
        </g>

        {/* tap-off down to rack — center rack */}
        {/* Busway A → rack PDU A on left of rack */}
        <g onMouseEnter={() => setHov('A')}>
          <Wire d={`M 320 432 L 320 498`} color={C.A} active={isA} width={1.6} />
        </g>
        <g onMouseEnter={() => setHov('B')}>
          <Wire d={`M 400 462 L 400 498`} color={C.B} active={isB} width={1.6} />
        </g>

        {/* === RACK === */}
        <g>
          {/* rack outline */}
          <rect x={290} y={500} width={140} height={100} fill="#0d0d0d" stroke="#ffffff30" strokeWidth="1.3" rx={3} />
          <rect x={284} y={496} width={152} height={8} fill="#262626" rx={1.5} />
          <rect x={284} y={596} width={152} height={8} fill="#262626" rx={1.5} />
          <text x={360} y={614} fontSize="8.5" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace" style={{ letterSpacing: '0.12em' }}>SERVER RACK</text>

          {/* Rack PDU A (left side) */}
          <g onMouseEnter={() => setHov('A')}>
            <rect x={294} y={505} width={10} height={88} fill={`${C.A}20`} stroke={C.A} strokeOpacity={isA ? 0.95 : 0.55} strokeWidth={1.1} rx={1} />
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={299} cy={512 + i * 11} r={2} fill={C.A} opacity={isA ? 1 : 0.55} />
            ))}
            <text x={280} y={552} fontSize="8" textAnchor="middle" fill={C.A} fontFamily="ui-monospace" transform="rotate(-90, 280, 552)">RPDU-A</text>
          </g>
          {/* Rack PDU B (right side) */}
          <g onMouseEnter={() => setHov('B')}>
            <rect x={416} y={505} width={10} height={88} fill={`${C.B}20`} stroke={C.B} strokeOpacity={isB ? 0.95 : 0.55} strokeWidth={1.1} rx={1} />
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={421} cy={512 + i * 11} r={2} fill={C.B} opacity={isB ? 1 : 0.55} />
            ))}
            <text x={440} y={552} fontSize="8" textAnchor="middle" fill={C.B} fontFamily="ui-monospace" transform="rotate(-90, 440, 552)">RPDU-B</text>
          </g>

          {/* 3 servers with dual PSUs */}
          {[0, 1, 2].map((i) => {
            const sy = 513 + i * 26;
            return (
              <g key={i}>
                <rect x={308} y={sy} width={104} height={20} fill="#171717" stroke="#ffffff20" strokeWidth="0.8" rx={1.5} />
                {/* PSU-A */}
                <rect x={310} y={sy + 3} width={14} height={14} fill={`${C.A}28`} stroke={C.A} strokeOpacity={isA ? 1 : 0.6} strokeWidth="0.9" rx={1} />
                <text x={317} y={sy + 13} fontSize="7" textAnchor="middle" fill={C.A} fontFamily="ui-monospace">A</text>
                {/* PSU-B */}
                <rect x={396} y={sy + 3} width={14} height={14} fill={`${C.B}28`} stroke={C.B} strokeOpacity={isB ? 1 : 0.6} strokeWidth="0.9" rx={1} />
                <text x={403} y={sy + 13} fontSize="7" textAnchor="middle" fill={C.B} fontFamily="ui-monospace">B</text>
                {/* server body */}
                <text x={360} y={sy + 13} fontSize="8" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">server {i + 1}</text>
                {/* A feed line */}
                <path d={`M 304 ${sy + 10} L 310 ${sy + 10}`} stroke={C.A} strokeOpacity={isA ? 0.95 : 0.5} strokeWidth="1.2" />
                <path d={`M 410 ${sy + 10} L 416 ${sy + 10}`} stroke={C.B} strokeOpacity={isB ? 0.95 : 0.5} strokeWidth="1.2" />
              </g>
            );
          })}
        </g>

        {/* annotations pointing at key items */}
        <g fontFamily="ui-monospace" fontSize="9" fill="#737373">
          <text x={AX - 72} y={108} textAnchor="end">step-down</text>
          <text x={AX - 72} y={120} textAnchor="end">transformer</text>
          <path d={`M ${AX - 70} 114 L ${AX - 32} 108`} stroke="#525252" strokeWidth="0.8" fill="none" />

          <text x={BX + 72} y={168} textAnchor="start">medium-voltage</text>
          <text x={BX + 72} y={180} textAnchor="start">switchgear</text>
          <path d={`M ${BX + 70} 174 L ${BX + 32} 168`} stroke="#525252" strokeWidth="0.8" fill="none" />

          <text x={AX - 72} y={295} textAnchor="end">double-conversion</text>
          <text x={AX - 72} y={307} textAnchor="end">UPS · Li-ion string</text>
          <path d={`M ${AX - 70} 299 L ${AX - 42} 296`} stroke="#525252" strokeWidth="0.8" fill="none" />

          <text x={BX + 72} y={365} textAnchor="start">PDU transformer</text>
          <text x={BX + 72} y={377} textAnchor="start">480 → 415 V</text>
          <path d={`M ${BX + 70} 371 L ${BX + 38} 368`} stroke="#525252" strokeWidth="0.8" fill="none" />

          <text x={670} y={432} textAnchor="start" fill={C.A}>overhead busway · 415 V / 3φ</text>
          <text x={670} y={462} textAnchor="start" fill={C.B}>overhead busway · 415 V / 3φ</text>
        </g>
      </svg>

      {/* Caption with hover-aware explanation */}
      <div className="mt-3 text-[12px] text-neutral-300 leading-relaxed">
        {hov === 'A' && (
          <span><span className="font-mono uppercase tracking-wider" style={{ color: C.A }}>A-side:</span> utility A feeds transformer A → MVSG A → ATS A → UPS A → PDU A → overhead busway A → rack PDU A → PSU-A on every server. A single failure on this entire chain drops <em>zero</em> IT load because the B-side carries the rack on its own.</span>
        )}
        {hov === 'B' && (
          <span><span className="font-mono uppercase tracking-wider" style={{ color: C.B }}>B-side:</span> symmetric mirror of A. Two fully independent utility services, generators, UPS strings, PDUs and busways. Each server's two PSUs pull from different sides — one from RPDU-A, one from RPDU-B.</span>
        )}
        {hov === 'genA' && (
          <span><span className="font-mono uppercase tracking-wider" style={{ color: C.gen }}>Genset A:</span> diesel standby, typically 2.5 MW per unit. Runs continuously while utility A is lost; the ATS orders start on utility-loss detection and transfers within 10–15 s. 48–72 h of fuel on-site.</span>
        )}
        {hov === 'genB' && (
          <span><span className="font-mono uppercase tracking-wider" style={{ color: C.gen }}>Genset B:</span> identical standby unit dedicated to side B. Independent fuel supply, switchgear and ATS — a bad genset on one side never touches the other.</span>
        )}
        {!hov && (
          <span className="text-neutral-400">Hover a side to trace its path. Every component is duplicated — two utilities, two gensets, two UPS strings, two busways — so every server can lose an entire side and stay up through its second PSU.</span>
        )}
      </div>
    </div>
  );
};

// Power-chain visualization — horizontal strip with stages
const PowerChain = () => {
  const stages = [
    { k: 'grid',  label: 'Utility',        v: '138 kV',    icon: Zap,     color: '#a3a3a3', note: '3-phase, two feeds from separate substations for 2N' },
    { k: 'xf',    label: 'Transformer',    v: '13.8 kV',   icon: CircuitBoard, color: '#fbbf24', note: 'steps down to medium voltage on-site' },
    { k: 'ats',   label: 'ATS',            v: '—',         icon: Wrench,  color: '#fb923c', note: 'auto transfer switch: utility ↔ genset in 10–15 s' },
    { k: 'gen',   label: 'Genset',         v: '2.5 MW ea', icon: Fuel,    color: '#fb7185', note: 'diesel ~2.5 MW/unit, 48–72 h fuel, tested weekly' },
    { k: 'ups',   label: 'UPS',            v: '480 V AC',  icon: Battery, color: '#f97316', note: 'Li-ion or flywheel · 5–15 min ride-through' },
    { k: 'pdu',   label: 'PDU',            v: '415 V',     icon: CircuitBoard, color: '#fdba74', note: '3-phase to busways overhead each row' },
    { k: 'rpdu',  label: 'Rack PDU',       v: '208/230 V', icon: Cable,   color: '#d97706', note: 'A-side + B-side per rack, metered, per-outlet control' },
    { k: 'psu',   label: 'Server PSU',     v: '12 V DC',   icon: Server,  color: '#7dd3fc', note: 'dual hot-swap PSUs · converts to 12 V, then VRMs to 0.8 V @ CPU/GPU' },
  ];
  const [hov, setHov] = useState(null);
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">the power chain · utility → silicon</div>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const active = hov?.k === s.k;
          return (
            <React.Fragment key={s.k}>
              <div
                onMouseEnter={() => setHov(s)}
                onMouseLeave={() => setHov(null)}
                className="min-w-[84px] flex-1 rounded-lg border p-2 transition-all cursor-pointer"
                style={{
                  borderColor: active ? s.color : 'rgba(255,255,255,0.1)',
                  background: active ? `${s.color}22` : 'rgba(255,255,255,0.02)',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <div className="text-[11px] font-mono mt-1 text-neutral-200">{s.label}</div>
                <div className="text-[10px] font-mono text-neutral-500">{s.v}</div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center text-neutral-600 text-xs">→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {hov && (
        <div className="mt-2 text-[11px] text-neutral-400">
          <span className="font-mono uppercase tracking-wider" style={{ color: hov.color }}>{hov.label}:</span> {hov.note}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   05 — COOLING & PUE
   ============================================================================ */

const CoolingPUE = () => {
  const [hover, setHover] = useState(null);
  const [itLoad, setItLoad] = useState(21.2); // MW
  const [cooling, setCooling] = useState(7.5);
  const [other, setOther] = useState(0.8);
  const pue = useMemo(() => (itLoad + cooling + other) / itLoad, [itLoad, cooling, other]);

  // Heat flow — IT heat moves through cold air → hot air → chilled water → chilled-water plant → tower → atmosphere
  const heatNodes = [
    { id: 'cpu',   label: 'Silicon',        col: 0, color: '#fb7185' },
    { id: 'air',   label: 'Hot aisle',      col: 1, color: '#fb923c' },
    { id: 'liq',   label: 'Direct-liquid',  col: 1, color: '#f472b6' },
    { id: 'crah',  label: 'CRAH coil',      col: 2, color: '#fbbf24' },
    { id: 'cdu',   label: 'CDU heat exch.', col: 2, color: '#f0abfc' },
    { id: 'chw',   label: 'Chilled water',  col: 3, color: '#60a5fa' },
    { id: 'chill', label: 'Chiller',        col: 4, color: '#38bdf8' },
    { id: 'eco',   label: 'Free cooling',   col: 4, color: '#6ee7b7' },
    { id: 'cw',    label: 'Condenser water',col: 5, color: '#22d3ee' },
    { id: 'tower', label: 'Cooling tower',  col: 6, color: '#7dd3fc' },
    { id: 'atmo',  label: 'Atmosphere',     col: 7, color: '#a3a3a3' },
  ];
  const heatLinks = [
    { src: 'cpu', dst: 'air',  v: 14, meta: { note: 'air-cooled CPU racks · 12–20 kW/rack' } },
    { src: 'cpu', dst: 'liq',  v: 7,  meta: { note: 'liquid-cooled GPU racks · 60–120 kW/rack' } },
    { src: 'air', dst: 'crah', v: 14 },
    { src: 'liq', dst: 'cdu',  v: 7 },
    { src: 'crah',dst: 'chw',  v: 14, meta: { note: '45–65°F chilled water loop' } },
    { src: 'cdu', dst: 'chw',  v: 7,  meta: { note: 'facility-water loop · warmer (~90°F) · easier to reject' } },
    { src: 'chw', dst: 'chill',v: 14, meta: { note: 'mechanical refrigeration · compressor driven' } },
    { src: 'chw', dst: 'eco',  v: 7,  meta: { note: 'free cooling when outside air is cold enough' } },
    { src: 'chill',dst:'cw',   v: 14 },
    { src: 'eco', dst: 'cw',   v: 7 },
    { src: 'cw',  dst: 'tower',v: 21 },
    { src: 'tower',dst:'atmo', v: 21, meta: { note: 'evaporative cooling rejects heat as water vapor' } },
  ];

  return (
    <Card id="cooling" icon={Thermometer} title="Cooling &amp; PUE" subtitle="Every watt in has to leave as heat" accent="cyan" index={5}>
      <p>
        Cooling is the other half of the build. A 30 MW IT load is a 30 MW heater — every joule the CPUs and GPUs consume emerges as waste heat inside the building. Get it out quickly and the silicon runs cool; stall the loop for five minutes and a modern H100 rack hits 100°C and throttles. Modern facilities use a <strong>cascade of loops</strong>: cold air or water at the rack, picks up heat, gets rejected outside to atmosphere by a chiller or cooling tower — sometimes to a river, the ocean, or even back into a city's district-heat system.
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">heat flow · rack → atmosphere</div>
        <div className="mt-3">
          <Sankey nodes={heatNodes} links={heatLinks}
                  colLabels={['silicon','rack','heat ex.','facility','plant','cond.','tower','out']}
                  width={660} height={360}
                  hover={hover} setHover={setHover}
                  format={(v) => v.toFixed(1)} unit=" MW" />
        </div>
        <FloatingTip hover={hover} render={(p) => (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: p.srcColor }}>{p.srcLabel}</span>
              <span className="text-neutral-500">→</span>
              <span className="font-semibold" style={{ color: p.dstColor }}>{p.dstLabel}</span>
            </div>
            <div className="mt-1 text-[11px] font-mono text-amber-300">{p.v.toFixed(1)} MW</div>
            {p.meta?.note && <div className="mt-1 text-[11px] text-neutral-400">{p.meta.note}</div>}
          </div>
        )} />
      </div>

      <CoolingMethods />

      {/* Interactive PUE */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-5">
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 justify-between">
          <div className="text-xs uppercase tracking-widest text-neutral-500">pue calculator · scrub to rebuild</div>
          <div className="text-[10px] text-neutral-500 font-mono">lower is better · perfect = 1.00</div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div className="font-mono text-5xl" style={{ color: pue < 1.2 ? '#6ee7b7' : pue < 1.5 ? '#fbbf24' : '#fb7185' }}>{pue.toFixed(2)}</div>
          <div className="text-sm text-neutral-400">{pue < 1.2 ? 'hyperscale elite' : pue < 1.5 ? 'modern build' : pue < 1.8 ? 'older retail colo' : 'legacy enterprise'}</div>
        </div>
        <div className="mt-4 space-y-3">
          <SliderRow label="IT load" value={itLoad} min={1} max={50} step={0.1} set={setItLoad} unit=" MW" color="#7dd3fc" />
          <SliderRow label="Cooling power" value={cooling} min={0.3} max={25} step={0.1} set={setCooling} unit=" MW" color="#22d3ee" />
          <SliderRow label="Lighting · losses · misc" value={other} min={0} max={5} step={0.05} set={setOther} unit=" MW" color="#a78bfa" />
        </div>
        <Block>{`\\gr{\\text{PUE}} = \\frac{\\text{total facility power}}{\\text{IT power}} = \\frac{\\num{${(itLoad+cooling+other).toFixed(1)}}}{\\co{${itLoad.toFixed(1)}}} = ${pue.toFixed(2)}`}</Block>
        <div className="mt-3 grid md:grid-cols-4 gap-3">
          <Stat label="Google fleet avg" value="1.09" sub="2024 trailing 12 mo" color="text-emerald-300" />
          <Stat label="Meta" value="1.08" sub="outdoor-air designs" color="text-emerald-300" />
          <Stat label="AWS" value="1.15" sub="reported avg" color="text-emerald-300" />
          <Stat label="Industry avg" value="1.56" sub="Uptime 2024 survey" color="text-amber-300" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 pt-1">
        <Stat label="Water Usage (WUE)" value="1.8 L/kWh" sub="industry avg · Google 1.0 L/kWh" color="text-sky-300" />
        <Stat label="Carbon Usage (CUE)" value="0.4 kgCO₂/kWh" sub="grid-dependent · lower with PPAs" color="text-emerald-300" />
        <Stat label="Air-cooling ceiling" value="~30 kW/rack" sub="above this → liquid required" color="text-rose-300" />
      </div>

      <Deeper>
        <p>
          <strong>The four cooling regimes.</strong> (1) <em>Direct expansion / <Term>CRAC</Term></em>: refrigerant cycle on the unit, air in/out — legacy, cheap, poor efficiency. (2) <em>Chilled water / <Term>CRAH</Term></em>: central <Term>chiller</Term> chills water, distributed to coils at each unit — the modern default for air cooling. (3) <em>Free cooling / <Term>economizer</Term></em>: when outside air is cool enough, the chiller is bypassed and ambient air (direct) or ambient-air-cooled water (indirect) does all the work. Nordic countries get free cooling 95%+ of the year. (4) <em>Liquid cooling</em>: <Term>rear-door heat exchanger</Term> (water on a door, air pulled through), <Term>direct-to-chip</Term> (cold plates on the CPU/GPU, warm water loop), or <em><Term>immersion</Term></em> (whole server submerged in <Term>dielectric fluid</Term> — single-phase or two-phase boiling). GPU racks ≥ 60 kW are effectively always liquid-cooled now.
        </p>
        <p>
          <strong><Term>PUE</Term> is load-weighted.</strong> The formula looks simple, but it has to be annualized and measured at a consistent boundary. A DC in Dublin reports 1.1 average but 1.3 on the hottest day. A DC in Phoenix reports 1.35 average, 1.1 in winter, 1.55 in August. An "instantaneous PUE" lower than the annual average is pure marketing.
        </p>
        <p>
          <strong>Water.</strong> Evaporative <Term>cooling towers</Term> consume 1–2 L of water per kWh of IT load. A 100 MW DC running year-round can consume ~2 million m³/year — the water footprint of a town of 10,000 people. This is why hyperscalers moved toward closed-loop designs, air cooling in cold climates, and lately <em>warm-water liquid cooling</em> that needs far less water than a tower. <Term>WUE</Term> (water usage effectiveness) is increasingly reported alongside PUE.
        </p>
        <p>
          <strong>Direct-to-chip vs immersion.</strong> <Term>Direct-to-chip</Term> (<Term>DTC</Term>) straps cold plates onto the hot silicon, runs warm water (35–45 °C) through them, and leaves the rest of the server in air — ~70–80% of heat goes to liquid, the fans keep handling <Term>DIMMs</Term>, <Term>NICs</Term>, drives. Servicing is mostly the same as air: slide the tray out, swap the drive. <em><Term>Immersion</Term></em> submerges the whole server in a <Term>dielectric fluid</Term> — single-phase (oil-like, circulated) or two-phase (fluid boils at ~50 °C and condenses on a lid). Immersion captures essentially 100% of the heat, removes fans (another ~5–10% of rack power), and handles densities past 200 kW/tank. The trade-offs are real: you cannot just pull a fluid-soaked server out for a 2-minute DIMM swap, the dielectric fluid costs thousands of dollars per tank and can degrade around some plastics and labels, and two-phase fluorocarbons (3M <Term>Novec</Term>, <Term>Fluorinert</Term>) are under <Term>PFAS</Term> regulatory scrutiny in the EU. DTC is winning the 2024–26 cycle because it fits existing operational muscle; immersion is the escape valve for &gt;150 kW/rack.
        </p>
        <p>
          <strong>PUE tells you less the better you get.</strong> At PUE 2.0, cooling and overhead are the entire problem — a 10% efficiency win on the chiller plant moves the needle visibly. At PUE 1.1, there is almost nothing left to optimize in the facility; the remaining gap is transformer losses, <Term>UPS</Term> idle, lighting, and pumps that run regardless of load. The next gains don't come from a better chiller — they come from <em>doing more compute per watt</em> (higher silicon efficiency, higher utilization, liquid cooling letting the CPU run faster at the same temperature). This is why sophisticated operators have started reporting <em><Term>TUE</Term></em> (Total-usage Effectiveness = PUE × <Term>ITUE</Term>, where ITUE covers fans and <Term>PSUs</Term> inside the server) and "compute per MWh" as more honest headlines. "We hit 1.06 PUE" is increasingly a marketing statement, not an engineering one.
        </p>
      </Deeper>
    </Card>
  );
};

const SliderRow = ({ label, value, min, max, step, set, unit, color }) => (
  <div>
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono" style={{ color }}>{value.toFixed(step < 0.1 ? 2 : 1)}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
           onChange={(e) => set(+e.target.value)}
           className="w-full"
           style={{ accentColor: color }} />
  </div>
);

const COOLING_METHODS = [
  { k: 'crac',  label: 'CRAC · DX',            kw: 25,  pue: 1.7, desc: 'Refrigerant on the unit. Cheap, legacy, room-cooling. Reasonable for ≤10 kW racks.', color: '#737373' },
  { k: 'crah',  label: 'CRAH · chilled water', kw: 30,  pue: 1.4, desc: 'Central chiller + coils on room units. Modern default for air-cooled halls.',        color: '#38bdf8' },
  { k: 'cont',  label: 'Hot-aisle contained',  kw: 30,  pue: 1.3, desc: 'Same hardware + plastic/steel containment so no hot/cold air mixing. +15–25% efficiency.', color: '#22d3ee' },
  { k: 'eco',   label: 'Free-air economizer',  kw: 25,  pue: 1.1, desc: 'Outside air direct (or via heat exchanger). Works brilliantly in cold/temperate climates.', color: '#6ee7b7' },
  { k: 'rear',  label: 'Rear-door exchanger',  kw: 50,  pue: 1.15,desc: 'Water-cooled door pulls heat off the rack before it hits the room. Bridge to full liquid.', color: '#a78bfa' },
  { k: 'd2c',   label: 'Direct-to-chip liquid',kw: 150, pue: 1.1, desc: 'Cold plates on CPU/GPU silicon. Warm water loop (~30–45°C). Required above ~30 kW/rack.', color: '#f0abfc' },
  { k: 'imm',   label: 'Immersion',            kw: 250, pue: 1.03,desc: 'Servers submerged in dielectric fluid — single-phase or two-phase boiling. Tiny pumps, no fans.', color: '#fb7185' },
];

const CoolingMethods = () => {
  const [hov, setHov] = useState(null);
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4">
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">cooling methods · efficiency vs density ceiling</div>
      <svg viewBox="0 0 620 260" className="w-full h-auto" onMouseLeave={() => setHov(null)}>
        <line x1="50" y1="220" x2="600" y2="220" stroke="#ffffff20" />
        <line x1="50" y1="30" x2="50" y2="220" stroke="#ffffff20" />
        {[1.0, 1.2, 1.4, 1.6, 1.8].map((p) => {
          const y = 220 - (p - 1.0) * 220;
          return (
            <g key={p}>
              <line x1="48" y1={y} x2="600" y2={y} stroke="#ffffff08" />
              <text x="42" y={y + 3} fontSize="9" textAnchor="end" fill="#737373" fontFamily="ui-monospace">{p.toFixed(1)}</text>
            </g>
          );
        })}
        {[10, 50, 100, 150, 200, 250].map((g) => {
          const x = 50 + (g / 260) * 550;
          return (
            <g key={g}>
              <line x1={x} y1="220" x2={x} y2="224" stroke="#ffffff20" />
              <text x={x} y={238} fontSize="9" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">{g}</text>
            </g>
          );
        })}
        <text x="325" y="254" fontSize="9.5" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace">kW/rack cooling ceiling →</text>
        <text x="20" y="125" fontSize="9.5" textAnchor="middle" fill="#a3a3a3" fontFamily="ui-monospace" transform="rotate(-90 20 125)">PUE →</text>
        {COOLING_METHODS.map((m) => {
          const cx = 50 + (m.kw / 260) * 550;
          const cy = 220 - (m.pue - 1.0) * 220;
          const active = hov?.k === m.k;
          return (
            <g key={m.k}
               onMouseEnter={(e) => setHov({ ...m, mx: e.clientX, my: e.clientY })}
               onMouseMove={(e) => setHov({ ...m, mx: e.clientX, my: e.clientY })}
               style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r={active ? 10 : 7} fill={m.color} fillOpacity={active ? 0.55 : 0.35} stroke={m.color} strokeWidth={active ? 2 : 1.2} />
              <text x={cx} y={cy - 12} fontSize="9.5" textAnchor="middle" fill={active ? '#f5f5f5' : '#d4d4d4'} fontFamily="ui-monospace">{m.label}</text>
            </g>
          );
        })}
      </svg>
      <FloatingTip hover={hov} render={(h) => (
        <div>
          <div className="font-semibold" style={{ color: h.color }}>{h.label}</div>
          <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-neutral-500">density ceiling</span><span className="text-right font-mono">~{h.kw} kW/rack</span>
            <span className="text-neutral-500">typical PUE</span><span className="text-right font-mono">{h.pue.toFixed(2)}</span>
          </div>
        </div>
      )} />
    </div>
  );
};

/* ============================================================================
   06 — REDUNDANCY & TIERS
   ============================================================================ */

const TIERS = [
  { k: 'I',   name: 'Tier I',   uptime: 99.671, dh: 28.8,   cm: false, ft: false, desc: 'Basic — single non-redundant path. A single failure takes the load down. Downtime for maintenance is required.', color: '#fb7185' },
  { k: 'II',  name: 'Tier II',  uptime: 99.741, dh: 22,     cm: false, ft: false, desc: 'Redundant capacity components (N+1) but still a single path. One UPS can fail; a switchgear fault still stops the IT.', color: '#fb923c' },
  { k: 'III', name: 'Tier III', uptime: 99.982, dh: 1.6,    cm: true,  ft: false, desc: 'Concurrently maintainable — each component can be taken offline for maintenance without stopping the IT. Two paths, but normally one is active.', color: '#fbbf24' },
  { k: 'IV',  name: 'Tier IV',  uptime: 99.995, dh: 0.44,   cm: true,  ft: true,  desc: 'Fault tolerant — two fully independent, simultaneously-active paths. Any single failure (even a catastrophic one) is absorbed. Plus compartmentalization to survive fire or flood.', color: '#6ee7b7' },
];

const TierSimulator = () => {
  // A small animated topology: utility → ATS → UPS → PDU → rack
  // N vs N+1 vs 2N toggle + fail injection
  const [topo, setTopo] = useState('2N');
  const [failed, setFailed] = useState(null);

  // layout per topology
  const COMPONENTS = {
    N:   [{ k: 'util', x: 40,  y: 90 }, { k: 'ups', x: 170, y: 90 }, { k: 'pdu', x: 300, y: 90 }, { k: 'rack', x: 430, y: 90 }],
    'N+1': [
      { k: 'util', x: 40,  y: 90 },
      { k: 'ups', x: 170, y: 60 },
      { k: 'ups', x: 170, y: 120, id: 'ups2' },
      { k: 'pdu', x: 300, y: 90 },
      { k: 'rack', x: 430, y: 90 },
    ],
    '2N': [
      { k: 'util', x: 40, y: 50 }, { k: 'ups', x: 170, y: 50, id: 'upsA' }, { k: 'pdu', x: 300, y: 50, id: 'pduA' },
      { k: 'util', x: 40, y: 130, id: 'util2' }, { k: 'ups', x: 170, y: 130, id: 'upsB' }, { k: 'pdu', x: 300, y: 130, id: 'pduB' },
      { k: 'rack', x: 430, y: 90 },
    ],
  };

  const EDGES = {
    N:   [['util','ups'],['ups','pdu'],['pdu','rack']],
    'N+1': [['util','ups'],['util','ups2'],['ups','pdu'],['ups2','pdu'],['pdu','rack']],
    '2N': [['util','upsA'],['upsA','pduA'],['pduA','rack'],['util2','upsB'],['upsB','pduB'],['pduB','rack']],
  };

  const ids = COMPONENTS[topo].map((c, i) => c.id ?? c.k);
  const labelOf = { util: 'Utility', ups: 'UPS', pdu: 'PDU', rack: 'Rack' };
  const iconOf = { util: Zap, ups: Battery, pdu: CircuitBoard, rack: Server };

  // Reachability BFS — from any non-failed utility node, through non-failed intermediates, to the rack
  const alive = useMemo(() => {
    const adj = {};
    ids.forEach((id) => (adj[id] = []));
    EDGES[topo].forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const starts = ids.filter((id) => (id === 'util' || id === 'util2') && id !== failed);
    const queue = starts.slice();
    const seen = new Set(starts);
    while (queue.length) {
      const x = queue.shift();
      for (const n of adj[x]) {
        if (n !== failed && !seen.has(n)) { seen.add(n); queue.push(n); }
      }
    }
    return seen.has('rack');
  }, [topo, failed]);

  const tier = topo === '2N' ? TIERS[3] : topo === 'N+1' ? TIERS[2] : TIERS[0];

  return (
    <Card id="redundancy" icon={Shield} title="Redundancy &amp; Uptime Tiers" subtitle="N, N+1, 2N — and what each survives" accent="emerald" index={6}>
      <p>
        Reliability is the <strong>design deliverable</strong> of a DC. Every critical path — power, cooling, network — is engineered so that no single failure takes the IT load down. The shorthand is <em>N</em> (just enough to run), <em>N+1</em> (one spare), <em>2N</em> (two fully independent sides). The Uptime Institute's Tier certification formalizes these into I–IV, with progressively stricter requirements. "Five nines" (99.999%) is ~5 minutes of downtime per year — achievable only with Tier IV + well-run ops.
      </p>

      <div className="grid md:grid-cols-4 gap-3">
        {TIERS.map((t) => (
          <div key={t.k} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-baseline justify-between">
              <div className="font-semibold" style={{ color: t.color }}>{t.name}</div>
              <div className="text-[10px] font-mono text-neutral-500">{t.uptime.toFixed(3)}%</div>
            </div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.color }}>{t.dh < 1 ? `${Math.round(t.dh * 60)} min/yr` : `${t.dh.toFixed(1)} h/yr`}</div>
            <div className="text-[11px] text-neutral-400 mt-2 leading-snug">{t.desc}</div>
            <div className="flex gap-1 mt-2">
              {t.cm && <Chip color="emerald">concurrently maintainable</Chip>}
              {t.ft && <Chip color="emerald">fault tolerant</Chip>}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive simulator */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2 justify-between">
          <div className="text-xs uppercase tracking-widest text-neutral-500">failure simulator · click a component to fail it</div>
          <div className="flex gap-1 text-[11px]">
            {['N', 'N+1', '2N'].map((t) => (
              <button key={t} onClick={() => { setTopo(t); setFailed(null); }}
                      className={`px-2.5 py-1 rounded-md font-mono border transition-colors ${topo === t ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200' : 'border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 500 200" className="w-full h-auto mt-3">
          {/* edges */}
          {EDGES[topo].map(([a, b], i) => {
            const A = COMPONENTS[topo].find((c) => (c.id ?? c.k) === a);
            const B = COMPONENTS[topo].find((c) => (c.id ?? c.k) === b);
            const dead = failed === a || failed === b;
            return (
              <line key={i} x1={A.x + 30} y1={A.y + 20} x2={B.x + 30} y2={B.y + 20}
                    stroke={dead ? '#404040' : '#6ee7b7'} strokeWidth="2"
                    strokeDasharray={dead ? '4 3' : ''}
                    opacity={dead ? 0.5 : 0.8} />
            );
          })}
          {COMPONENTS[topo].map((c, i) => {
            const id = c.id ?? c.k;
            const Icon = iconOf[c.k];
            const isFailed = failed === id;
            const isRack = c.k === 'rack';
            const click = () => !isRack && setFailed(failed === id ? null : id);
            return (
              <g key={i} onClick={click} style={{ cursor: isRack ? 'default' : 'pointer' }}>
                <rect x={c.x} y={c.y} width={60} height={40}
                      fill={isFailed ? '#ef444420' : isRack ? (alive ? '#6ee7b725' : '#ef444425') : '#ffffff08'}
                      stroke={isFailed ? '#ef4444' : isRack ? (alive ? '#6ee7b7' : '#ef4444') : '#ffffff40'}
                      strokeWidth={isFailed ? 2 : 1.3}
                      strokeDasharray={isFailed ? '3 2' : ''}
                      rx={4} />
                <foreignObject x={c.x + 6} y={c.y + 5} width={16} height={16}>
                  <div style={{ color: isFailed ? '#ef4444' : '#e5e5e5' }}>
                    <Icon className="w-4 h-4" />
                  </div>
                </foreignObject>
                <text x={c.x + 30} y={c.y + 32} fontSize="10" textAnchor="middle" fill={isFailed ? '#fca5a5' : '#e5e5e5'} fontFamily="ui-monospace">{labelOf[c.k]}</text>
              </g>
            );
          })}
        </svg>

        <div className={`mt-3 rounded-md border px-3 py-2 text-sm ${alive ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' : 'bg-rose-500/10 border-rose-400/30 text-rose-200'}`}>
          {alive ? (
            <>Rack is <strong>up</strong>. {failed ? `The ${labelOf[COMPONENTS[topo].find((c) => (c.id ?? c.k) === failed).k]} failed, but the redundant path carries the load.` : 'No failures injected.'}</>
          ) : (
            <>Rack is <strong className="text-rose-100">DOWN</strong>. The failure has no redundant path around it — a single fault drops the IT load. This is exactly what {topo === 'N' ? 'Tier I' : 'insufficient redundancy'} looks like.</>
          )}
        </div>
        <div className="mt-2 text-[11px] text-neutral-500">
          current topology: <span className="text-emerald-300 font-mono">{topo}</span>
          {' · '} equivalent to <span className="font-mono" style={{ color: tier.color }}>{tier.name}</span>
          {' · '} target availability <span className="font-mono">{tier.uptime.toFixed(3)}%</span>
        </div>
      </div>

      <Deeper>
        <p>
          <strong>What the Tier rating covers — and doesn't.</strong> Uptime Institute Tiers are a <em>design + construction</em> certification of the physical plant: can a single component fail or be maintained without the IT going down? Tiers do <em>not</em> certify operations, software availability, or network redundancy — those are different frameworks (SAS 70, SOC 2, ISO 27001, ANSI/TIA-942). A <Term>Tier IV</Term> facility run by an incompetent NOC can still have more outages than a well-run <Term>Tier II</Term>.
        </p>
        <p>
          <strong>What breaks in practice.</strong> The Uptime Institute's annual outage survey has shown for a decade that ~70% of outages are caused by <em>humans</em> (mis-maintenance, wrong breaker, misconfigured change) and ~20% by <em>power</em> (<Term>UPS</Term> + battery failure, gen-start failure). Cooling accounts for ~5%. The pattern: the physical redundancy prevents the inevitable hardware failures; humans still find new ways to defeat it. This is why major operators require dual-sign-off on every <Term>switchgear</Term> operation and practice failovers monthly.
        </p>
        <p>
          <strong>Beyond the building — availability zones.</strong> The hyperscale answer is to stop trying to make one building perfect. Instead, an <em><Term>availability zone</Term></em> (<Term>AZ</Term>) is an independently-powered, independently-cooled, independently-networked facility (or small cluster) inside a region. A region contains 3+ <Term>AZs</Term> separated by ~1–100 km. Your database is replicated across AZs; a lightning strike on one AZ drops one replica and the others keep serving. "Three nines on each AZ" composed into a multi-AZ deployment reaches "five nines" without requiring <Term>Tier IV</Term> everywhere.
        </p>
        <p>
          <strong>The economics of <Term>2N</Term> vs multi-AZ.</strong> Going from <Term>Tier III</Term> (<Term>N+1</Term>, 99.982% ≈ 95 min/yr) to <Term>Tier IV</Term> (<Term>2N</Term>, 99.995% ≈ 26 min/yr) typically adds <em>25–40% to the construction cost</em> and ~20% to ongoing operations (more equipment to maintain, more tests to run). But two Tier-III buildings run as independent <Term>AZs</Term>, with software that fails over in seconds, gives you a system-level availability near "five nines" for roughly the same money as one Tier-IV — plus geographic separation (different substation, different flood zone, different fiber path), which 2N inside a single building simply cannot buy you. That is the architectural bet every hyperscaler made in the 2010s: invest in software that tolerates building-level loss instead of engineering buildings that never lose power. Enterprise colocation customers who can't rewrite their apps still pay the Tier-IV premium; cloud-native workloads don't.
        </p>
        <p>
          <strong>Why "70% of outages are human" is load-bearing.</strong> If hardware caused most outages, the answer would be more redundancy. But humans are the dominant failure mode, which flips the playbook: fewer hands on critical infrastructure (one-click-automation over bespoke CLI runs), <em>dual-signoff</em> on every <Term>switchgear</Term> operation, scripted rather than live-typed procedures, and a <em>"no heroes"</em> culture where engineers call for help instead of pushing through alone at 3 AM. Chaos-engineering exercises (randomly fail a <Term>UPS</Term> in production monthly) are counterintuitive — you deliberately cause small outages to prevent large ones, because redundancy that is never exercised rots quietly until the real failure arrives. Operators who skip monthly transfer tests eventually discover their <Term>gensets</Term> won't start the one time it matters.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   07 — NETWORKING
   ============================================================================ */

const NETWORK_TIERS = [
  { k: 'server', name: 'Server',    desc: '25/50/100/400 GbE NICs. GPU nodes use 8× 400G for training fabrics.', lat: '—',        color: '#7dd3fc' },
  { k: 'tor',    name: 'Leaf (ToR)',desc: 'Top-of-rack switch. 32–48 server downlinks, 4–8 uplinks to spine. ~300 ns switch latency.', lat: '1–5 μs',  color: '#6ee7b7' },
  { k: 'spine',  name: 'Spine',     desc: 'Every leaf connects to every spine (Clos / fat-tree). No oversubscription on hyperscale GPU fabrics.', lat: '5–15 μs', color: '#c4b5fd' },
  { k: 'border', name: 'Border',    desc: 'DC core / edge router. Peering with carriers, IXs, hyperscaler backbone, DDoS scrubbing.', lat: '50+ μs', color: '#f0abfc' },
];

const LATENCY_LADDER = [
  { k: 'l1',  lat: 1e-9*1,   label: 'L1 cache',       desc: '~1 ns · 4 CPU cycles' },
  { k: 'ram', lat: 1e-9*100, label: 'Main RAM',       desc: '~100 ns' },
  { k: 'rack',lat: 1e-6*2,   label: 'Same rack',      desc: '~1–5 μs (1 switch hop)' },
  { k: 'dc',  lat: 1e-6*50,  label: 'Same DC',        desc: '~50 μs (leaf → spine → leaf)' },
  { k: 'nvm', lat: 1e-6*100, label: 'NVMe flash',     desc: '~100 μs' },
  { k: 'az',  lat: 1e-3*1,   label: 'Adjacent AZ',    desc: '~1 ms (10–100 km fiber)' },
  { k: 'reg', lat: 1e-3*10,  label: 'Cross-region',   desc: '~10–80 ms (cont. fiber)' },
  { k: 'int', lat: 1e-3*80,  label: 'Transcontinental',desc: '~80–200 ms (submarine)' },
];

const Networking = () => {
  const [hover, setHover] = useState(null);
  const [hovLat, setHovLat] = useState(null);

  // spine-leaf visual
  const SPINES = 4, LEAVES = 8;
  const W = 640, H = 260;
  const spineY = 50, leafY = 170, serverY = 220;
  const spineX = (i) => 120 + (i / (SPINES - 1)) * (W - 240);
  const leafX = (i) => 60 + (i / (LEAVES - 1)) * (W - 120);

  return (
    <Card id="network" icon={Network} title="Networking" subtitle="Inside the DC · between DCs · to the internet" accent="fuchsia" index={7}>
      <p>
        The modern DC network is a <strong>Clos fabric</strong>: two tiers (leaf + spine) of high-radix switches, full mesh between tiers, with every server two hops from every other server. The legacy 3-tier design (access/aggregation/core) has been dead at scale for a decade — it couldn't handle east-west traffic, which now dominates (cache, replication, RPC, GPU gradients all flow server-to-server, not client-to-server).
      </p>

      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">spine-leaf fabric · every leaf connects to every spine</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
          {/* connections */}
          {Array.from({ length: SPINES }).map((_, si) =>
            Array.from({ length: LEAVES }).map((_, li) => (
              <line key={`${si}-${li}`}
                    x1={spineX(si)} y1={spineY + 10}
                    x2={leafX(li)} y2={leafY}
                    stroke="#7dd3fc" strokeWidth="0.6" opacity={hover?.li === li || hover?.si === si ? 0.55 : 0.18} />
            ))
          )}
          {/* spines */}
          {Array.from({ length: SPINES }).map((_, si) => (
            <g key={`sp-${si}`} onMouseEnter={() => setHover({ si })} onMouseLeave={() => setHover(null)}>
              <rect x={spineX(si) - 28} y={spineY - 10} width={56} height={20} fill="#c4b5fd30" stroke="#c4b5fd" rx={3} />
              <text x={spineX(si)} y={spineY + 3} fontSize="10" textAnchor="middle" fill="#e5e5e5" fontFamily="ui-monospace">Spine {si + 1}</text>
            </g>
          ))}
          {/* leaves */}
          {Array.from({ length: LEAVES }).map((_, li) => (
            <g key={`lf-${li}`} onMouseEnter={() => setHover({ li })} onMouseLeave={() => setHover(null)}>
              <rect x={leafX(li) - 22} y={leafY} width={44} height={16} fill="#6ee7b730" stroke="#6ee7b7" rx={2} />
              <text x={leafX(li)} y={leafY + 11} fontSize="9" textAnchor="middle" fill="#e5e5e5" fontFamily="ui-monospace">L{li + 1}</text>
              {/* servers */}
              {Array.from({ length: 3 }).map((_, xi) => (
                <rect key={xi} x={leafX(li) - 18 + xi * 12} y={serverY} width={9} height={14} fill="#7dd3fc60" stroke="#7dd3fc" rx={1} />
              ))}
            </g>
          ))}
          <text x={W - 20} y={spineY - 16} fontSize="9" textAnchor="end" fill="#a3a3a3" fontFamily="ui-monospace">every leaf ↔ every spine</text>
          <text x={10} y={leafY + 10} fontSize="9" textAnchor="start" fill="#a3a3a3" fontFamily="ui-monospace">leaf (ToR)</text>
          <text x={10} y={serverY + 10} fontSize="9" textAnchor="start" fill="#a3a3a3" fontFamily="ui-monospace">servers</text>
        </svg>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {NETWORK_TIERS.map((t) => (
          <div key={t.k} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
            <div className="font-semibold" style={{ color: t.color }}>{t.name}</div>
            <div className="text-[10px] font-mono text-neutral-500">latency {t.lat}</div>
            <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Latency ladder */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">the latency ladder · log scale</div>
        <svg viewBox="0 0 640 170" className="w-full h-auto" onMouseLeave={() => setHovLat(null)}>
          <line x1="30" y1="110" x2="620" y2="110" stroke="#ffffff20" />
          {LATENCY_LADDER.map((l, i) => {
            const lo = Math.log10(1e-9), hi = Math.log10(0.3);
            const x = 40 + ((Math.log10(l.lat) - lo) / (hi - lo)) * 570;
            const active = hovLat?.k === l.k;
            return (
              <g key={l.k}
                 onMouseEnter={(e) => setHovLat({ ...l, mx: e.clientX, my: e.clientY })}
                 onMouseMove={(e) => setHovLat({ ...l, mx: e.clientX, my: e.clientY })}
                 style={{ cursor: 'pointer' }}>
                <line x1={x} y1="96" x2={x} y2="124" stroke="#f0abfc" strokeWidth={active ? 2 : 1} />
                <circle cx={x} cy="110" r={active ? 5 : 3} fill="#f0abfc" />
                <text x={x} y={i % 2 === 0 ? 86 : 145} fontSize="9.5" textAnchor="middle" fill={active ? '#f5d0fe' : '#d4d4d4'} fontFamily="ui-monospace">{l.label}</text>
                <text x={x} y={i % 2 === 0 ? 74 : 157} fontSize="8.5" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">
                  {l.lat < 1e-6 ? `${(l.lat * 1e9).toFixed(0)} ns` : l.lat < 1e-3 ? `${(l.lat * 1e6).toFixed(0)} μs` : `${(l.lat * 1e3).toFixed(0)} ms`}
                </text>
              </g>
            );
          })}
          {[1e-9, 1e-6, 1e-3].map((t) => {
            const lo = Math.log10(1e-9), hi = Math.log10(0.3);
            const x = 40 + ((Math.log10(t) - lo) / (hi - lo)) * 570;
            return (
              <g key={t}>
                <line x1={x} y1="110" x2={x} y2="116" stroke="#ffffff40" />
                <text x={x} y="167" fontSize="8" textAnchor="middle" fill="#737373" fontFamily="ui-monospace">{t === 1e-9 ? '1 ns' : t === 1e-6 ? '1 μs' : '1 ms'}</text>
              </g>
            );
          })}
        </svg>
        <FloatingTip hover={hovLat} render={(h) => (
          <div>
            <div className="font-semibold text-fuchsia-300">{h.label}</div>
            <div className="mt-1 text-[11px] text-neutral-300">{h.desc}</div>
          </div>
        )} />
      </div>

      <p className="text-sm text-neutral-400">
        Speed of light sets a floor. Fiber propagates at ~2/3 c, so <strong>each 100 km adds 500 μs round-trip</strong> of irreducible latency — nothing in the hardware can fix it. A typical AZ-to-AZ link is ~1–2 ms, coast-to-coast US is ~60 ms, NY→London is ~70 ms, NY→Tokyo is ~180 ms. Real-time apps and synchronous replication both run into this wall.
      </p>

      <Deeper>
        <p>
          <strong>GPU fabric — the new thing.</strong> Training a large model means every step, every GPU exchanges gradients with every other GPU (<Term>AllReduce</Term>). The fabric has to move terabits per second with microsecond tail latency and zero loss. Two technologies dominate: <em><Term>InfiniBand</Term></em> (NVIDIA Mellanox · HDR 200G, NDR 400G, XDR 800G) and <em><Term>RoCE v2</Term></em> (<Term>RDMA</Term> over Converged Ethernet, 400/800 GbE) on Ethernet fabrics from Arista, Cisco, Juniper. On the newest <Term>GB200 NVL72</Term> racks, 72 GPUs are connected inside the rack over <em><Term>NVLink</Term></em> (Nvidia's own protocol, ~900 GB/s per GPU) — <em>between</em> racks is InfiniBand or <Term>Spectrum-X</Term> Ethernet. The rack has essentially become the new server.
        </p>
        <p>
          <strong>Outside the DC.</strong> Each region's DCs connect via <Term>dark fiber</Term> — often long-<Term>IRU</Term> leases on Level3/Lumen/Zayo — and over submarine cables for intercontinental paths. Hyperscalers own or lease cables outright (Google Dunant, Meta 2Africa, MSFT/FB Marea). <Term>meet-me rooms</Term> at big <Term>carrier hotels</Term> (60 Hudson NYC, Equinix DC2 Ashburn, Telehouse Docklands London, Equinix SG1) are where the internet physically interconnects — every major ISP, CDN, and hyperscaler has a cage there and peers directly to avoid the open internet. The <em>internet exchange</em> (<Term>IX</Term>) layer on top of this (AMS-IX, DE-CIX, LINX, Equinix IX) switches <Term>BGP</Term> peering traffic between thousands of networks.
        </p>
        <p>
          <strong>Software-defined everything.</strong> The control plane for all this is now overwhelmingly <Term>SDN</Term>: <Term>VXLAN</Term> overlays, <Term>EVPN</Term> for multi-tenant L2, <Term>BGP</Term> everywhere (even inside the fabric — the "BGP in the data center" pattern from Facebook's whitepaper). Network gear is increasingly <em><Term>merchant silicon</Term></em> (Broadcom <Term>Tomahawk</Term>, NVIDIA <Term>Spectrum</Term>, Cisco <Term>Silicon One</Term>) in <Term>whitebox</Term> chassis running open <Term>NOSes</Term> (<Term>SONiC</Term>, <Term>FBOSS</Term>).
        </p>
        <p>
          <strong>Why <Term>Clos</Term> (<Term>spine-leaf</Term>) won.</strong> The old three-tier core/aggregation/access topology oversubscribed aggressively (8:1 or 16:1 was normal) — cheap but with huge <em>east-west</em> traffic, the aggregation layer became the bottleneck. A <Term>Clos</Term> fabric with full-bandwidth spine-to-leaf connections gives you <em>non-blocking <Term>bisection bandwidth</Term></em>: any leaf can talk to any other leaf at full line rate. Equal-cost multipath (<Term>ECMP</Term>) over the spines means losing a single spine removes 1/N of the capacity rather than disconnecting anything, so the failure domain collapses from "a whole zone" to "a sliver of bandwidth." The cost trade-off is that you buy a lot more optics and ports — a 32-leaf, 4-spine pod uses 128 spine-facing links you'd never need in a traditional tree. Hyperscale east-west traffic patterns (microservices, distributed storage, training all-reduces) made the upgrade non-optional; enterprise data centers with mostly north-south traffic still often run three-tier because it's simpler.
        </p>
        <p>
          <strong><Term>InfiniBand</Term> vs <Term>RoCE v2</Term>.</strong> InfiniBand has been purpose-built for HPC/AI since 1999: lossless by design (credit-based flow control at L2), a single-vendor-ish ecosystem (NVIDIA/Mellanox), end-to-end tooling, and consistently the lowest microsecond-tail latency on the market. The cost is ecosystem lock-in — every switch, <Term>NIC</Term>, and subnet manager comes from essentially one vendor, and pricing reflects it. <em><Term>RoCE v2</Term></em> (<Term>RDMA</Term> over Ethernet) rides on commodity 400/800 GbE hardware from Arista, Cisco, Juniper, Celestica — much broader vendor pool, better per-port economics, reuses the operator's Ethernet expertise. The trade-off: Ethernet is <em>lossy</em> by default, so RoCE requires careful <Term>PFC</Term> + <Term>ECN</Term> tuning across every switch or you get head-of-line blocking, PFC storms, and tail latency that destroys training throughput. Meta's "Llama3 network" and NVIDIA's <Term>Spectrum-X</Term> are betting RoCE can close the gap with purpose-built ASICs + software; InfiniBand still wins the bake-off on the largest training clusters (xAI <Term>Colossus</Term>, OpenAI <Term>Stargate</Term>) where milliseconds of tail latency scale into days of training time.
        </p>
        <p>
          <strong><Term>Merchant silicon</Term> displaced custom ASICs.</strong> Cisco, Juniper, and Arista all spent the 2000s building proprietary switching ASICs; by the late 2010s Broadcom's <Term>Tomahawk</Term>/Jericho and later NVIDIA <Term>Spectrum</Term> were shipping more bandwidth per dollar than any in-house silicon could match, because the R&amp;D was amortized across the whole industry. Hyperscalers wrote their own software (<Term>SONiC</Term> at Microsoft, <Term>FBOSS</Term> at Meta) on <Term>whitebox</Term> hardware; incumbents bifurcated into "merchant-silicon chassis with their own software" and "ASIC-differentiated" lines. The dynamic is similar to how x86 ate proprietary UNIX silicon: differentiation moves up the stack from silicon to software once the commodity part becomes good enough.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   08 — KEY METRICS
   ============================================================================ */

const KEY_METRICS = [
  { k: 'pue', label: 'PUE',   name: 'Power usage effectiveness', formula: '\\text{PUE} = \\dfrac{\\text{total facility power}}{\\text{IT power}}', good: '< 1.20', avg: '1.56', best: '1.08', desc: 'The headline efficiency metric. Captures cooling + losses overhead. ≥ 1.0 by definition.' },
  { k: 'wue', label: 'WUE',   name: 'Water usage effectiveness', formula: '\\text{WUE} = \\dfrac{\\text{water (L)}}{\\text{IT energy (kWh)}}', good: '< 0.5 L/kWh', avg: '1.8 L/kWh', best: '0.1 L/kWh', desc: 'Water consumed per unit of IT energy. Evaporative towers push it up; closed-loop liquid pushes it down.' },
  { k: 'cue', label: 'CUE',   name: 'Carbon usage effectiveness', formula: '\\text{CUE} = \\dfrac{\\text{CO}_2\\,\\text{(kg)}}{\\text{IT energy (kWh)}}', good: '< 0.15', avg: '0.4', best: '0.03', desc: 'CO₂ intensity — mostly set by the grid; can be pushed down with PPAs, on-site solar, nuclear PPAs.' },
  { k: 'dens',label: 'kW/rack', name: 'Power density', formula: '\\rho = \\dfrac{P_{\\text{rack}}}{1\\,\\text{rack}}', good: 'workload-dependent', avg: '8 kW/rack', best: '120+ kW/rack (GPU)', desc: 'Defines whether air is enough. 30 kW is roughly the air-cooled ceiling.' },
  { k: 'sla', label: 'Uptime', name: 'Availability SLA', formula: 'A = \\dfrac{T_{\\text{up}}}{T_{\\text{total}}}', good: '99.995%', avg: '99.9%', best: '99.999%', desc: 'Downtime budget. Every 9 past three is ~10× harder than the last.' },
  { k: 'util',label: 'Utilization', name: 'Server utilization', formula: 'U = \\dfrac{\\text{work done}}{\\text{work capacity}}', good: '> 60%', avg: '25–40%', best: '> 80% (batch / AI training)', desc: 'How much useful compute you get for the power. Low utilization ≡ paying for idle silicon.' },
];

const KeyMetrics = () => (
  <Card id="metrics" icon={Gauge} title="Key metrics" subtitle="What operators watch" accent="orange" index={8}>
    <p>
      Running a DC is an endless optimization of half a dozen numbers. These are the ones that make it into the board deck.
    </p>
    <div className="grid md:grid-cols-2 gap-3">
      {KEY_METRICS.map((m) => (
        <div key={m.k} className="rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-0.5 justify-between">
            <div>
              <div className="font-semibold text-neutral-50">{m.label}</div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">{m.name}</div>
            </div>
          </div>
          <div className="mt-2"><Block>{m.formula}</Block></div>
          <div className="mt-2 text-[12px] text-neutral-300 leading-snug">{m.desc}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-[9px] uppercase text-neutral-500">industry avg</div>
              <div className="font-mono text-amber-300">{m.avg}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-neutral-500">target</div>
              <div className="font-mono text-sky-300">{m.good}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-neutral-500">best in class</div>
              <div className="font-mono text-emerald-300">{m.best}</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <Deeper>
      <p>
        <strong>Monitoring.</strong> A modern DC generates millions of data points per minute: temperature at every rack inlet/outlet, humidity, per-outlet power, per-server CPU/GPU power, airflow, chiller pressure, UPS state-of-charge, genset fuel level, every network link counter. A Building Management System (BMS) consolidates facility telemetry; a DCIM tool (EcoStruxure, Nlyte, SunBird) stitches it with IT inventory; Prometheus/Grafana or Splunk/Datadog eats the IT side. Operators watch for <em>rate-of-change</em> anomalies (a single inlet climbing 0.5°C/minute means a fan just died) more than absolute thresholds.
      </p>
      <p>
        <strong>Security.</strong> Physical: multi-factor access (badge + biometric), mantraps, cameras on every door, lockable cages and cabinets, rack-door sensors. Compliance: SOC 2, ISO 27001, PCI DSS (if tenants process cards), HIPAA (if health data), FedRAMP (if US government). Logical: zero-trust networking between tenant and operator planes, side-channel hardening on shared hardware, confidential computing enclaves (SGX, SEV, TDX) for tenants that need isolation from the host.
      </p>
    </Deeper>
  </Card>
);

/* ============================================================================
   09 — TRENDS (AI ERA)
   ============================================================================ */

const AI_CLUSTERS = [
  { name: 'GPT-4 training (est.)',  gpus: 25000,  power: 30,   year: 2023, color: '#7dd3fc' },
  { name: 'Llama 3 405B',           gpus: 16000,  power: 20,   year: 2024, color: '#6ee7b7' },
  { name: 'xAI Colossus 1 (Memphis)', gpus: 100000, power: 150, year: 2024, color: '#f0abfc' },
  { name: 'Microsoft AI Supercomputer', gpus: 200000, power: 300, year: 2025, color: '#c4b5fd' },
  { name: 'Meta Richland Parish (2026)',gpus: 300000, power: 500, year: 2026, color: '#fbbf24' },
  { name: 'Stargate Abilene (phase 1)', gpus: 400000, power: 1200,year: 2026, color: '#fb7185' },
  { name: 'Stargate full (ambition)',   gpus: 2000000,power: 5000,year: 2028, color: '#fb923c' },
];

const TRENDS_BULLETS = [
  { icon: Cpu,        title: 'Racks at 100+ kW are normal now', body: 'GB200 NVL72 racks are 120 kW standard; GB300 NVL576 racks (2026) are on track for 250+ kW. The industry bet on a 60 kW/rack ceiling and blew through it in 24 months.', color: 'fuchsia' },
  { icon: Droplet,    title: 'Direct-liquid cooling by default', body: 'Every hyperscale AI build from 2024+ ships with direct-to-chip cold plates. Rear-door exchangers are the bridge; immersion is an edge case but rising fast for HPC.', color: 'cyan' },
  { icon: Zap,        title: 'GW campuses · the grid is the bottleneck', body: 'AWS, Microsoft, Meta, Google are each announcing multiple 1+ GW campuses. In Virginia, Texas, Ohio, Arizona, Iowa, utility interconnect queues are now 5–7 years. Land is cheap; firm power is the binding constraint.', color: 'amber' },
  { icon: Fuel,       title: 'Nuclear PPAs · a comeback', body: 'Amazon–Talen (Susquehanna, 960 MW), Microsoft–Constellation (Three Mile Island restart, 835 MW), Google–Kairos (SMRs, 500 MW). Hyperscalers are signing 20-year PPAs to firm their clean-energy claims and jump the interconnect queue.', color: 'emerald' },
  { icon: CircuitBoard, title: 'Custom silicon everywhere', body: 'AWS Trainium/Inferentia, Google TPU v5/v6/v7 (Trillium / Ironwood), Microsoft Maia, Meta MTIA — every hyperscaler has in-house accelerators to chip away at Nvidia\'s margin and tune silicon to their own workloads.', color: 'violet' },
  { icon: Radio,      title: 'Fabric over NVLink domains', body: 'Rack-scale NVLink turned 72 GPUs into one "box." GB300 pushes that to 576. The fabric between racks is now the performance ceiling for frontier-model training.', color: 'sky' },
  { icon: Waves,      title: 'Water is now a siting constraint', body: 'Arizona, Texas, parts of Virginia are pushing back on cooling-tower permits. New builds are skewing to closed-loop liquid and dry coolers, despite slightly worse efficiency.', color: 'rose' },
  { icon: Flame,      title: 'Grid upgrades on the operator dime', body: 'Utilities are requiring hyperscalers to fund new transmission + substations as a condition of interconnection. Meta + Entergy in Louisiana, Microsoft + AEP in Ohio, AWS + Dominion in Virginia.', color: 'orange' },
];

const Trends = () => {
  const [hov, setHov] = useState(null);

  const maxPower = Math.max(...AI_CLUSTERS.map((c) => c.power));

  return (
    <Card id="trends" icon={TrendingUp} title="The AI era · current trends" subtitle="2024–2026: the biggest physical build-out in the history of computing" accent="rose" index={9}>
      <p>
        A generational change is underway. The "cloud" era (2010–2022) was about CPU-heavy, scale-out, stateless services with ~8 kW racks and PUE as the headline metric. The <strong>AI era</strong> (2023–) is about GPU-heavy, scale-up training fabrics with 100+ kW racks, where power availability, liquid cooling, and the interconnect fabric dominate the design. The numbers are not incremental — they're order-of-magnitude.
      </p>

      {/* AI cluster scale */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">AI training cluster scale · power (MW)</div>
        <div className="space-y-1.5 mt-3">
          {AI_CLUSTERS.map((c) => {
            const pct = (c.power / maxPower) * 100;
            return (
              <div key={c.name}
                   onMouseEnter={(e) => setHov({ ...c, mx: e.clientX, my: e.clientY })}
                   onMouseMove={(e) => setHov({ ...c, mx: e.clientX, my: e.clientY })}
                   onMouseLeave={() => setHov(null)}
                   className="grid grid-cols-[minmax(160px,1.2fr)_3fr_minmax(70px,auto)_minmax(70px,auto)] gap-3 items-center text-[11px] cursor-pointer hover:bg-white/[0.02] rounded px-1 py-0.5">
                <div className="text-neutral-200 truncate">{c.name}</div>
                <div className="relative h-4 bg-white/5 rounded-sm overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${pct}%`, background: `${c.color}80`, borderRight: `2px solid ${c.color}` }} />
                  {/* scale ticks at 100/500/1000/2000/5000 MW */}
                  {[100, 500, 1000, 2000, 5000].map((t) => {
                    const tp = (t / maxPower) * 100;
                    if (tp > 100) return null;
                    return <div key={t} className="absolute top-0 bottom-0 border-l border-white/15" style={{ left: `${tp}%` }} />;
                  })}
                </div>
                <div className="font-mono text-right text-neutral-200">{c.power >= 1000 ? `${(c.power / 1000).toFixed(1)} GW` : `${c.power} MW`}</div>
                <div className="font-mono text-right text-neutral-500">{c.year}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-neutral-500 font-mono">
          <span>ticks:</span>
          {[100, 500, 1000, 2000, 5000].map((t) => (
            <span key={t}>{t >= 1000 ? `${t/1000} GW` : `${t} MW`}</span>
          ))}
        </div>
      </div>
      <FloatingTip hover={hov} render={(h) => (
        <div>
          <div className="font-semibold" style={{ color: h.color }}>{h.name}</div>
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-neutral-500">GPUs</span><span className="text-right font-mono">{h.gpus.toLocaleString()}</span>
            <span className="text-neutral-500">power</span><span className="text-right font-mono">{h.power >= 1000 ? `${(h.power/1000).toFixed(1)} GW` : `${h.power} MW`}</span>
            <span className="text-neutral-500">year</span><span className="text-right font-mono">{h.year}</span>
          </div>
          <div className="mt-1 text-[10px] text-neutral-500">for context, a modern nuclear reactor is ~1 GW; NYC peak demand is ~11 GW.</div>
        </div>
      )} />

      {/* Trend bullets */}
      <div className="grid md:grid-cols-2 gap-3">
        {TRENDS_BULLETS.map((t, i) => {
          const Icon = t.icon;
          const a = accentMap[t.color];
          return (
            <motion.div key={t.title}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                        className={`rounded-lg bg-white/[0.03] border p-3 ${a.border}`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${a.text}`} />
                <div>
                  <div className={`text-sm font-semibold ${a.text}`}>{t.title}</div>
                  <div className="mt-1 text-[12px] text-neutral-300 leading-snug">{t.body}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="Nvidia data-center revenue Q4'25" value="$35B" sub="vs $4B in Q4'22" color="text-emerald-300" />
        <Stat label="DC capex 2025 (big 4)" value="$320B+" sub="AWS + MSFT + GOOG + META" color="text-amber-300" />
        <Stat label="Largest single campus (2026)" value="1.2 GW" sub="Stargate Abilene, phase 1" color="text-fuchsia-300" />
        <Stat label="US grid interconnect queue" value="~2,600 GW" sub="5–7 yr wait in key regions" color="text-rose-300" />
      </div>

      <Deeper>
        <p>
          <strong>The grid is the story.</strong> Every major region is now power-constrained, not land-constrained or capital-constrained. Dominion Energy (Virginia) has said it must double generation by 2030 to meet queued DC load. ERCOT (Texas) is seeing AI load added at 5–10 GW/year. PJM (mid-Atlantic) capacity auction prices hit all-time highs in 2024, driven almost entirely by DC demand. This changes siting decisions: the old playbook was "build near fiber and cheap power"; the new one is "build where we can get firm 500 MW in under 4 years," which is a much shorter list (West Texas, parts of the Midwest, the Mississippi River industrial belt).
        </p>
        <p>
          <strong>Behind-the-meter generation.</strong> To cut the interconnect wait, several hyperscalers and neoclouds are deploying <em>on-site generation</em>: gas turbines (Stargate, xAI Memphis), fuel cells (Equinix Bloom Energy deployments), and — the most consequential bet — small modular reactors. Three SMR PPAs were signed in 2024–25 alone; first commercial units are expected 2028–2030. If these land on schedule, the physical map of where AI gets trained is about to change.
        </p>
        <p>
          <strong>What could derail it.</strong> Three things are plausible blockers: (1) a sustained grid-reliability event that triggers political push-back on DC load (has already happened in Ireland, which paused new DC permits). (2) A meaningful step-change in model efficiency — if a future training run needs 1/10× the compute for the same capability, the extrapolated 5 GW campus is suddenly 500 MW. (3) Interest rates — the math on a 20-year PPA + $5B build depends on cheap capital. Any sustained high-rate regime shrinks the return on marginal sites. The industry bet is implicitly that none of these dominate.
        </p>
      </Deeper>
    </Card>
  );
};

/* ============================================================================
   10 — NEXT TRAILS (onward reading)
   ============================================================================ */

const NextTrails = () => (
  <Card id="trails" icon={Compass} title="Next trails" subtitle="Where to go from here — foundations, adjacent topics, and sibling explainers" accent="violet" index={10}>
    <MinSchema>
      Data centers sit at the intersection of <em>physics</em> (heat, electricity, light), <em>engineering</em> (networks, storage, reliability), and <em>systems</em> (economics, grid, geopolitics). Pick whichever vector would most expand your model.
    </MinSchema>

    <NextSteps groups={[
      {
        title: 'Sibling explainers',
        note: 'in this sandbox · clickable',
        items: [
          { label: 'Systems Thinking', href: '#systems-thinking', note: 'Stocks, flows, feedback, delays — the vocabulary for every capacity-planning and reliability decision in a DC.' },
          { label: 'The World Economy', href: '#world-economy', note: 'The macro backdrop to the gigawatt build-out — capex flows, trade corridors, and the 2025–26 regime.' },
          { label: 'Reinforcement Learning', href: '#reinforcement-learning', note: 'The workload these DCs were rebuilt for. How training runs turn MW into model weights.' },
          { label: 'Quantum Mechanics', href: '#quantum-mechanics', note: 'The far-future compute substrate — and a reminder of how much classical-DC physics we take for granted.' },
        ],
      },
      {
        title: 'Deepen inside the DC',
        note: 'the next layer of detail on things we only skimmed',
        items: [
          { label: 'Liquid cooling in depth', note: 'Two-phase immersion, CDU hydraulics, warm-water loops, and the materials-science edge cases.' },
          { label: 'AI training systems', note: 'Megatron / DeepSpeed / FSDP, pipeline vs tensor vs data parallel, checkpointing at PB scale.' },
          { label: 'Silicon photonics & CPO', note: 'Co-packaged optics — the post-copper endgame for intra-rack and intra-pod links.' },
          { label: 'Storage disaggregation', note: 'NVMe-over-Fabrics, composable pools, why local SSDs are disappearing.' },
          { label: 'Switch ASIC economics', note: 'Tomahawk vs Spectrum vs Silicon One — how merchant silicon priced out custom.' },
          { label: 'Submarine & long-haul optics', note: 'Subsea cables, ROADMs, DCI — how regions actually talk to each other.' },
        ],
      },
      {
        title: 'Upstream foundations',
        note: 'the sciences the whole building rests on',
        items: [
          { label: 'Thermodynamics & heat transfer', note: 'Conduction, convection, phase change — what actually sets the kW/rack ceiling.' },
          { label: 'Three-phase power & grid engineering', note: 'Transformers, fault currents, reactive power — the MW-class electrical world.' },
          { label: 'Semiconductor process nodes', note: 'Why W / mm² keeps rising and why Dennard scaling broke. The root cause behind liquid cooling.' },
          { label: 'TCP / RDMA / congestion control', note: 'How ECN, PFC, and DCQCN keep an Ethernet fabric lossless under AllReduce storms.' },
          { label: 'Reliability engineering (SRE)', note: 'Error budgets, chaos engineering, postmortems — the "humans cause outages" thread in rigorous form.' },
          { label: 'Optical fiber physics', note: 'Dispersion, modal losses, DWDM — why 100 km of fiber costs 500 μs round-trip regardless of the gear on each end.' },
        ],
      },
      {
        title: 'Zoom out',
        note: 'where DCs fit in the wider world',
        items: [
          { label: 'Electric grid & renewables', note: 'DC demand is already reshaping capacity markets. PPAs, grid interconnect queues, nuclear PPAs for AI.' },
          { label: 'Geopolitics of compute', note: 'Chip export controls, sovereign AI, where GPUs are allowed to land and why.' },
          { label: 'Water & environmental impact', note: 'WUE, aquifer drawdown, community politics — the externality side of hyperscale.' },
          { label: 'Economics of hyperscale capex', note: 'Build-vs-lease, depreciation schedules, why the industry consolidated to four operators.' },
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
        <span>sources:</span>
        <span className="text-sky-300">IEA · Electricity 2024</span>
        <span className="text-violet-300">Uptime Institute</span>
        <span className="text-emerald-300">Synergy Research</span>
        <span className="text-amber-300">ASHRAE TC 9.9</span>
        <span className="text-fuchsia-300">SemiAnalysis</span>
        <span className="text-rose-300">company filings</span>
      </div>
      <p className="max-w-xl mx-auto">
        Numbers reflect best-available public data through Q1 2026. Many hyperscale figures are estimates; project capacities are as-announced and subject to revision as interconnect queues and permits move.
      </p>
    </div>
  </footer>
);

/* ============================================================================
   TOP-LEVEL
   ============================================================================ */

export default function DataCentersV2Explainer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <style>{`
        .eq-inline .katex { font-size: 1em; }
        .keq-display .katex-display { margin: 0; }
      `}</style>

      <Hero />
      <SectionNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <ScaleHierarchy />
        <AnatomyFloorplan />
        <RacksServers />
        <PowerInfrastructure />
        <CoolingPUE />
        <TierSimulator />
        <Networking />
        <KeyMetrics />
        <Trends />
        <NextTrails />
      </main>

      <Footer />
    </div>
  );
}
