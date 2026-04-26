# AGENTS.md

This repository is a sandbox for personal explainer pages. Each explainer explores a single concept through an interactive visual page.

## Repository layout

A single shared Vite + React + Tailwind v4 app lives at the repo root. Each explainer is one folder at the repo root containing its single-file component. Dependencies are shared across all explainers — install new ones at the root.

```
/                              ← shared Vite app
├── AGENTS.md
├── PREFERENCES.md
├── package.json               ← shared deps
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                ← hash-router + home page
│   ├── explainers.js          ← registry — add new explainers here
│   └── index.css              ← @import "tailwindcss";
├── quantum-mechanics/
│   └── QuantumMechanicsExplainer.jsx
└── <next-concept>/            ← kebab-case folder per concept
    └── <Concept>Explainer.jsx
```

**Adding a new explainer:**
1. Create a kebab-case folder at the repo root (e.g. `diffusion-models/`).
2. Write the component as a single `.jsx` file using the default template below.
3. Import it in `src/explainers.js` and add a registry entry (`slug`, `title`, `blurb`, `tags`, `component`). No other wiring needed.
4. `npm run dev` picks it up immediately.

**Rules:**
- One concept = one folder. Do not mix explainers.
- Do not duplicate deps per folder. Install at the root with `npm install <pkg>`.
- Keep explainer components self-contained — no internal imports between folders.

## Default explainer template

Unless the user specifies otherwise, every new explainer is:

- **A single-file React component** (`.jsx` or `.tsx`) that stands alone — no build setup required beyond pasting into a typical React + Tailwind environment.
- **Styled with Tailwind CSS**, using utility classes directly on JSX.
- **Dark mode by default** — assume a dark background (`bg-neutral-950` / `bg-zinc-900` family) with high-contrast text. Do not ship a light-mode toggle unless requested.
- **Card-based layout** — content is organized into distinct cards/sections with clear visual grouping, generous padding, rounded corners, subtle borders or gradients.
- **Mobile-responsive** — stack cards vertically on small screens, use responsive Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- **Icons via `lucide-react`** — import only the icons actually used.
- **Animations via `framer-motion`** — use for entry animations, hover states, transitions between steps, and drawing attention to key ideas. Animations should feel purposeful, not decorative.
- **Heavily visual** — favor diagrams, interactive controls, animated flows, charts, and annotated illustrations over walls of text. When a concept can be shown, show it. Be creative: sliders, step-throughs, before/after, live previews, hover-to-reveal, etc.
- **Clean UI** — consistent spacing, a small color palette, readable typography, clear hierarchy.

The file should be self-contained and drop-in usable as the default export of a React component.

## Pedagogy defaults (learning-throughput optimization)

The goal of every explainer is to maximize *useful · grounded · generalizable · efficient* mental-model formation per minute of reader effort. Apply these techniques by default — especially on technical subjects. Don't apply all of them to every card mechanically; pick the ones that most serve the concept.

1. **Prediction prompts before reveal.** Before showing a quantitative answer or chart, ask the reader to guess. "Drag the slider to where you think PUE should land, then press Reveal." Active recall ≈ 2× passive reading for retention at near-zero cost.
2. **Worked numeric examples inside every equation.** Don't just show the formula — show it with real numbers plugged in, and let the reader change the inputs. A running calculator, not a static formula.
3. **Cross-card callbacks.** When a concept depends on an earlier one, inline a small link chip (e.g. "⟵ NUMA, from Racks") that on hover shows a 1-sentence recap and on click scrolls back. Learning compounds when cards reference each other instead of living in silos.
4. **"Equivalent to" grounding.** Every big number gets a familiar referent. "100 MW ≈ Seattle's midday draw ≈ 80,000 homes." Translates abstract scale into body-sized intuition.
5. **Minimum-viable-schema header.** Each card opens with the one sentence (or small diagram) a reader should be able to redraw from memory after reading. Gives the reader a distillation target and is the retention anchor.
6. **"When does this matter / who cares" callout.** One line per concept naming who uses this knowledge and under what decision. "Matters if you're sizing a fabric ≥ 1k GPUs; irrelevant below 100." Concepts stick when attached to a decision context.
7. **Quick Q&A self-check after each topic.** 2–3 questions with toggleable answers (click question → expand answer). Forces the reader to *do* something; catches drift before it compounds. Short, specific, not trivia.
8. **Misconception boxes.** "People usually think X; actually Y, because Z." Naming the trap explicitly makes retention much higher — the brain has something concrete to push against.
9. **Next-trails card at the end.** A closing "where to go from here" card, grouped into *sibling explainers* (internal links), *deepen inside the topic*, *upstream foundations* (the sciences/disciplines underneath), and *zoom out* (where the topic fits in the wider world). 1-line note per item. Gives the reader a branching map instead of a dead end and anchors the new mental model to what's adjacent.

**Reusable primitives** (define once per explainer file, use everywhere):
`Predict`, `Worked`, `CrossLink`, `Grounding`, `MinSchema`, `WhenItMatters`, `QA`, `Misconception`, `NextSteps`, plus the `Term` glossary tooltip (see `data-centers-v2/`).

**Signal-to-noise discipline:**
- Each addition should be 1–3 lines max. If these become paragraphs, they defeat the "efficient" pillar.
- Prefer dropping a technique on a given card over stuffing all eight in.
- Underlines, colored chips, and callouts are costly — budget them per card.

## Automated QA: the "every bug becomes a detector" principle

**Rule: any bug class that survives visual review once becomes a permanent automated check.** If you fix a rendering or layout issue by eye and then can imagine the same class of bug happening again (in a different chart, a different explainer, after a future refactor), write a detector snippet for it *in this file* before closing out the fix.

The cost of writing one detector: ~10 minutes. The benefit: every future PR gets the check for free, and you stop burning cognitive energy re-eyeballing the same failure modes. Visual review scales badly; detectors scale linearly in code.

**Required before calling any explainer done** — run all three detectors below, and fix until every count is 0. Each is one `preview_eval` call. All three together are faster than a careful visual review and catch far more.

### 1. Layout: text overlaps + SVG-edge clipping

Visually eyeballing charts for label collisions and viewBox overflow is slow and unreliable. Run this snippet in the browser (via `preview_eval` or pasted into the console) after any change that touches SVG layout — it checks every `<text>` in the page against two common failure modes and returns a structured report.

```js
(() => {
  const overlaps = [], overflows = [];
  document.querySelectorAll('svg').forEach(svg => {
    const cardId = svg.closest('[id^="c-"]')?.id || '(none)';
    const texts = Array.from(svg.querySelectorAll('text'))
      .filter(t => (t.textContent || '').trim());
    const boxes = texts.map(t => { try { const b = t.getBBox();
      return { text: t.textContent.trim().slice(0,50), x:b.x, y:b.y, w:b.width, h:b.height };
    } catch { return null; } }).filter(Boolean);
    // 1. pairwise bbox overlap within each svg (substantive overlap only)
    for (let i=0; i<boxes.length; i++) for (let j=i+1; j<boxes.length; j++) {
      const a=boxes[i], b=boxes[j];
      const ix = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
      const iy = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
      const ratio = (ix*iy) / Math.min(a.w*a.h, b.w*b.h);
      if (ix>1 && iy>1 && ratio>0.15)
        overlaps.push({ cardId, a:a.text, b:b.text, ratio:+ratio.toFixed(2) });
    }
    // 2. text clipped by its own svg container (viewBox / negative-x / right-edge)
    const sR = svg.getBoundingClientRect();
    texts.forEach(t => {
      const r = t.getBoundingClientRect(); if (!r.width) return;
      if (r.left < sR.left-1 || r.right > sR.right+1)
        overflows.push({ cardId, text:t.textContent.trim().slice(0,40),
          side: r.left < sR.left ? 'L' : 'R',
          delta: Math.round(r.left < sR.left ? sR.left-r.left : r.right-sR.right) });
    });
  });
  return { overlapCount: overlaps.length, overflowCount: overflows.length, overlaps, overflows };
})()
```

**How to read the output:**
- `overlapCount > 0`: two `<text>` elements sit on top of each other. Typical causes: axis title placed inside the data-plot area, two data labels too close horizontally, a legend chip over a tick. Fix by repositioning one of them (stagger `dy`, shift an anchor, increase margins).
- `overflowCount > 0`: a label renders past its SVG's left/right edge. Typical causes: `x={10}` with `textAnchor="end"` on a word wider than 10 px, or a chart's `sx()` mapping the last datapoint into the right margin. Fix by widening the viewBox padding, clamping `x`, or swapping `textAnchor` near edges.

**Caught real bugs** in `machine-learning` (GPT-2 label colliding with the x-axis title; attention row labels rendered outside their SVG with `x={10}` + `textAnchor="end"`) and in `world-economy` (endpoint labels for US/Indonesia/Pakistan/Nigeria stacking — solved with bidirectional label relaxation + leader lines — pattern lives in `WorldEconomyExplainer.jsx` `renderLines`).

### 2. KaTeX: un-rendered math

KaTeX is configured with `throwOnError: false`, so malformed TeX silently renders as `<span class="katex-error">` in the DOM (colored red with the raw source shown). Silent breakage is easy to miss when scrolling.

```js
(() => {
  const errs = Array.from(document.querySelectorAll('.katex-error'));
  return errs.map(e => ({
    msg: (e.getAttribute('title') || e.textContent || '').slice(0, 200),
    // climb to the nearest card id for localization
    cardId: e.closest('[id]')?.id || '(none)'
  }));
})()
```

**How to read the output:** a non-empty array means one or more `<Eq>` / `<KeyEq>` / `<Block>` calls failed to parse. The `msg` usually includes the ParseError with position and the offending token. Common causes in this repo:
- Subscripts on macros without braces (`\arg\min_\w{w}` — wrap as `\arg\min_{\w{w}}`).
- `#` inside macro bodies needs escaping as `##` when declared in `KATEX_MACROS`.
- Apostrophe inside a JS single-quoted string terminating the TeX string early — use a template literal or `\prime`.
- Stray `}` left over from refactoring (e.g., `\\rf{r}\\sk{P}}`).

### 3. Contrast: WCAG-ish luminance check across HTML and SVG text

Flags every visible text element whose color has ≤3.0 contrast ratio against its effective background. Handles: 8-digit hex alpha (`#rrggbbaa`), element `opacity` / `fill-opacity` alpha-blending against the card background, `tspan`-colored text whose parent `<text>` has no fill, and `bg-clip-text` gradient titles (skipped as false positives).

```js
(() => {
  const parseColor = (s) => {
    if (!s || s === 'none' || s === 'transparent') return null;
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map(x => parseFloat(x.trim()));
      return { r: p[0], g: p[1], b: p[2], a: p[3] !== undefined ? p[3] : 1 }; }
    if (/^#[0-9a-f]{3,8}$/i.test(s)) {
      const h = s.replace('#', ''); let hex, a = 1;
      if (h.length === 3) hex = h.split('').map(c => c + c).join('');
      else if (h.length === 4) { hex = h.slice(0,3).split('').map(c => c + c).join(''); a = parseInt(h[3]+h[3],16)/255; }
      else if (h.length === 6) hex = h;
      else if (h.length === 8) { hex = h.slice(0,6); a = parseInt(h.slice(6),16)/255; }
      else return null;
      return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16), a };
    }
    return null;
  };
  const blend = (fg, bg) => ({ r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a), b: fg.b*fg.a + bg.b*(1-fg.a), a: 1 });
  const lum = (c) => { const tl = v => { v=v/255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); };
    return 0.2126*tl(c.r) + 0.7152*tl(c.g) + 0.0722*tl(c.b); };
  const contrast = (a, b) => { const L1=Math.max(lum(a),lum(b)), L2=Math.min(lum(a),lum(b)); return (L1+0.05)/(L2+0.05); };
  const bgOf = (el) => { let cur=el; while (cur) { const c=parseColor(getComputedStyle(cur).backgroundColor); if (c && c.a>0.5) return c; cur=cur.parentElement; } return { r:10, g:10, b:10, a:1 }; };
  const isGrad = (el) => { const cs=getComputedStyle(el); return cs.backgroundClip==='text' || cs.webkitBackgroundClip==='text' || cs.getPropertyValue('-webkit-background-clip')==='text'; };
  const decorative = (t) => { const s=t.trim(); return s.length<2 || /^[\u2190-\u21FF\u2700-\u27BF\u2600-\u26FF\u2B00-\u2BFF➜•·→←↑↓↔⇄⇆▲▼◆◇★☆]+$/.test(s); };
  const low = [];
  // HTML
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set(); let n;
  while ((n = walker.nextNode())) {
    const txt = (n.nodeValue||'').trim(); if (!txt || decorative(txt)) continue;
    const el = n.parentElement; if (!el || seen.has(el) || el.closest('svg')) continue; seen.add(el);
    const r = el.getBoundingClientRect(); if (r.width<2 || r.height<2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility==='hidden' || cs.display==='none' || parseFloat(cs.opacity)<0.3 || isGrad(el)) continue;
    const col = parseColor(cs.color); if (!col || col.a<0.3) continue;
    const c = contrast(col, bgOf(el));
    if (c < 3.0) low.push({ kind:'html', text: txt.slice(0,40), contrast:+c.toFixed(2), fs: cs.fontSize, color: cs.color });
  }
  // SVG — precompute filled shapes per svg, alpha-blend against card bg
  document.querySelectorAll('svg').forEach(svg => {
    const cardBg = bgOf(svg.parentElement);
    const rects = Array.from(svg.querySelectorAll('rect, circle, path, polygon')).map(r => {
      try { const bb = r.getBoundingClientRect(); if (bb.width<4 || bb.height<4) return null;
        const c = parseColor(r.getAttribute('fill') || getComputedStyle(r).fill); if (!c) return null;
        const fo = parseFloat(r.getAttribute('fill-opacity') || getComputedStyle(r).fillOpacity || '1');
        const op = parseFloat(r.getAttribute('opacity') || getComputedStyle(r).opacity || '1');
        const eff = c.a * fo * op; if (eff < 0.15) return null;
        return { bb, fill: blend({ r:c.r, g:c.g, b:c.b, a:eff }, cardBg), area: bb.width * bb.height };
      } catch { return null; }
    }).filter(Boolean).sort((a,b) => a.area - b.area);
    svg.querySelectorAll('text').forEach(t => {
      const tspans = t.querySelectorAll('tspan');
      const nodes = tspans.length ? Array.from(tspans) : [t];
      nodes.forEach(node => {
        const txt = (node.textContent||'').trim(); if (!txt || decorative(txt)) return;
        const bb = node.getBoundingClientRect(); if (bb.width<2 || bb.height<2) return;
        const cs = getComputedStyle(node); if (parseFloat(cs.opacity)<0.3) return;
        const col = parseColor(node.getAttribute('fill') || cs.fill); if (!col || col.a<0.3) return;
        const cx = bb.x + bb.width/2, cy = bb.y + bb.height/2;
        let bg = cardBg;
        for (const r of rects) if (cx>=r.bb.left && cx<=r.bb.right && cy>=r.bb.top && cy<=r.bb.bottom) { bg = r.fill; break; }
        const c = contrast(col, bg);
        if (c < 3.0) low.push({ kind:'svg', text: txt.slice(0,40), contrast:+c.toFixed(2), fs: cs.fontSize || node.getAttribute('font-size'), color: node.getAttribute('fill') || cs.fill });
      });
    });
  });
  return { count: low.length, samples: low.slice(0, 20) };
})()
```

**How to read the output:** a non-empty `samples` array lists low-contrast text. Fixes tend to fall into three buckets:
- **Dim gray tick/axis labels** (`#525252` on `#0a0a0a` → 2.53): bump to `#737373` (neutral-500, contrast 3.54). Visually near-identical, passes the check.
- **Light text on pastel rect** (white/`#e5e7eb` on emerald/rose at high fill-alpha → ≤2): switch text color based on cell fill alpha — e.g. `fill={Math.abs(v) >= 0.55 ? '#0a0a0a' : '#e5e7eb'}`. Threshold matters: too low and you get dark text on a mid-dark bg.
- **Text-color == category-color on a filled badge** (e.g., `$1700B` in `#67e8f9` inside a `#67e8f9` donut segment): change the badge's text to dark or to the theme's inverse color.

**False positives to watch for** (and the filters that handle them):
- Gradient titles with `bg-clip-text text-transparent` report `color: rgba(0,0,0,0)`. Filtered by `isGrad()`.
- `<text>` with `<tspan>` children has no fill on the parent → computed `fill` is SVG-default black. Filtered by checking tspans first.
- Low-alpha hex (`#6ee7b725` = 14% alpha) rendered to look nearly transparent but full-opacity to a naive parser. Filtered by parsing 8-digit hex correctly and skipping effective-alpha < 0.15.

**Caught real bugs:** 10 dim tick labels in `data-centers` / `data-centers-v2` (`#525252` → `#737373`); 4 unreadable V-grid cell labels in `reinforcement-learning` (white text on saturated emerald — switched to value-conditional text color); 3 low-contrast hits in `world-economy` (fixed at the `Other` color-map entry).

### 4. Console errors + warnings

Silent runtime warnings pile up invisibly — React key collisions, unhandled promise rejections, framer-motion animate-from-undefined, dev-only prop-type violations, KaTeX parse warnings that render ok-ish. Harvest them from the preview console.

```js
// In a fresh session: reload, mark a timestamp, navigate, then fetch console logs.
console.warn('__AFTER_MARK__');  // drop a marker
location.hash = '#foo'; setTimeout(()=>location.hash='#<slug>', 80);
// then, after ~2.5s render, use preview_console_logs with level:'warn'
// anything between __AFTER_MARK__ and end of buffer is new.
```

**How to read the output:** any warning — one or many — should be triaged. Common ones seen here:
- `animate X from "undefined" to "N"` — framer-motion `animate={{ foo: 17 }}` without an `initial={{ foo: 0 }}`. Fix: add an `initial` prop. (Caught in `data-centers` + `data-centers-v2` — 400+ warnings from one missing `initial` on the animated `Wire` path.)
- `Each child in a list should have a unique "key"` — duplicate keys in a `.map()`. Find by searching for the repeated key.
- `Cannot update a component ... while rendering` — a set-state during render. Wrap in `useEffect`.

### 5. Numeric format consistency

Raw numbers of 5+ digits (`100000`, `$1234567`) read worse than their formatted versions (`100,000`, `$1.2M`). 4-digit numbers are fine — they're almost always years.

```js
(() => {
  const RE = /(?<![\d.,])\d{5,}(?![\d.,])/g;
  const hiddenAncestor = el => { let c=el; while(c){const s=getComputedStyle(c); if(s.display==='none'||s.visibility==='hidden')return true; c=c.parentElement;} return false; };
  const hits = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.nodeValue; if (!t) continue;
    const m = t.match(RE); if (!m) continue;
    const el = n.parentElement; if (!el || hiddenAncestor(el)) continue;
    const cs = getComputedStyle(el);
    const font = (cs.fontFamily||'').toLowerCase();
    if (font.includes('mono') || el.closest('code, pre, .katex, [data-numeric-ok]')) continue;
    hits.push({ nums: m, snippet: t.trim().slice(0,80), card: el.closest('[id]')?.id });
  }
  return { count: hits.length, samples: hits.slice(0,20) };
})()
```

**How to read the output:** each hit is a text node with an unformatted big number. Fix by:
- Adding commas: `100000` → `100,000`.
- Or better, collapse to a shorter unit: `$1500000` → `$1.5M`.
- Or mark the surrounding element `data-numeric-ok` if it's a genuine raw display (hash, ID, timestamp) the reader should copy-paste.

Decimals like `3.14159` are unaffected (the lookbehind skips digits preceded by `.`), and formatted `10,000` passes because no 5+ digit run is contiguous.

### 6. HTML text truncation

Any element with Tailwind `truncate` or `text-overflow: ellipsis` that has `scrollWidth > clientWidth` is silently clipping its label. The `…` is easy to miss in a dense layout.

```js
(() => {
  const hiddenAncestor = el => { let c=el; while(c){const s=getComputedStyle(c); if(s.display==='none'||s.visibility==='hidden')return true; c=c.parentElement;} return false; };
  const hits = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.textOverflow !== 'ellipsis' && !el.classList.contains('truncate')) return;
    if (hiddenAncestor(el)) return;
    if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      hits.push({ text: el.textContent.trim().slice(0,60), sw: el.scrollWidth, cw: el.clientWidth, card: el.closest('[id]')?.id });
  });
  return { count: hits.length, samples: hits.slice(0,10) };
})()
```

**How to read the output:** `sw - cw` is the pixel overflow. Fixes:
- Shorten the label (`"United States"` → `"US"`, `"Hospitality & food service"` → `"Hospitality & food svc"`). Caught two of these in `world-economy` bar-chart rows.
- Widen the column (`w-[132px]` → `w-[148px]`). Watch for responsive breakage at narrower viewports.
- Drop `truncate` if the row can wrap — but first check that the layout actually tolerates wrap.

### 7. Duplicate SVG `<defs>` IDs

Each `<linearGradient id="x">` and `<filter id="y">` needs a unique id across the whole document. A duplicate silently last-wins — whichever mounts second steals the reference for any `url(#x)` on the page. Easy to introduce by copy-pasting a gradient into a new chart.

```js
(() => {
  const m = new Map();
  document.querySelectorAll('svg defs [id]').forEach(el => m.set(el.id, (m.get(el.id)||0)+1));
  const dup = [...m.entries()].filter(([,v]) => v > 1);
  return { count: dup.length, samples: dup.slice(0,20) };
})()
```

**How to read the output:** each entry is `[id, instanceCount]`. Fix by renaming one of them to include the component name (e.g., `flowGrad` → `flowGradHero`, `flowGradChart`).

### 8. Zero-size SVGs (missing lucide icons)

A misspelled `lucide-react` icon name imports `undefined`, which renders as a `<svg>` with zero width/height and no content. Looks like nothing rendered; also catches any other SVG that accidentally shrank to 0.

```js
(() => {
  const hiddenAncestor = el => { let c=el; while(c){const s=getComputedStyle(c); if(s.display==='none'||s.visibility==='hidden')return true; c=c.parentElement;} return false; };
  const hits = [];
  document.querySelectorAll('svg').forEach(svg => {
    if (hiddenAncestor(svg)) return;
    const r = svg.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) hits.push({ cls: svg.className.baseVal||'', card: svg.closest('[id]')?.id });
  });
  return { count: hits.length, samples: hits.slice(0,10) };
})()
```

**How to read the output:** for each hit, check the `cls` — if it's `lucide lucide-<name>`, the named icon doesn't exist (typo or removed from the library). If it's unnamed, check the surrounding component for a CSS issue (`w-0`, `flex-shrink` collapsing it).

### 9. Dead clickables

An element with `cursor: pointer` but no click/hover/touch handler on itself or any ancestor promises interactivity it can't deliver. Usually a stale `className` after ripping out a handler, or `cursor-pointer` copy-pasted onto a label.

```js
(() => {
  const hiddenAncestor = el => { let c=el; while(c){const s=getComputedStyle(c); if(s.display==='none'||s.visibility==='hidden')return true; c=c.parentElement;} return false; };
  const HANDLERS = ['onClick','onMouseDown','onPointerDown','onTouchStart','onMouseEnter','onMouseOver','onMouseMove','onMouseLeave','onChange','onInput'];
  const hasHandler = el => { let c=el; while(c){ const k=Object.keys(c).find(x=>x.startsWith('__reactProps$')); if(k&&c[k])for(const h of HANDLERS)if(c[k][h])return true; c=c.parentElement;} return false; };
  const hits = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.cursor !== 'pointer') return;
    if (hiddenAncestor(el)) return;
    if (['A','BUTTON','INPUT','SELECT','TEXTAREA','LABEL'].includes(el.tagName)) return;
    if (el.closest('a, button, [role=button]')) return;
    const role = el.getAttribute('role');
    if (['button','link','checkbox','radio','tab'].includes(role)) return;
    if (hasHandler(el)) return;
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    hits.push({ tag: el.tagName.toLowerCase(), snippet: (el.textContent||'').trim().slice(0,60), card: el.closest('[id]')?.id });
  });
  return { count: hits.length, samples: hits.slice(0,10) };
})()
```

**How to read the output:** either remove the `cursor-pointer` class (if the element is decorative) or wire up the missing handler. Note the handler walk checks the full ancestor chain, so group-level delegation doesn't trigger false positives.

**False positives to watch for** (all handled by the filters above):
- Chart segments whose parent has `onMouseEnter` for a tooltip — the handler walk climbs up.
- Elements inside a `hidden xl:block` sidebar — `hiddenAncestor()` catches this.

### 10. Child-out-of-parent (HTML)

The SVG-edge clip check from detector 1, but for HTML — any descendant whose bounding rect extends past its containing `Card`. Catches absolute-positioned elements that drift, badges that overflow their corner, and icons that poke outside a container.

```js
(() => {
  const hits = [];
  const cards = document.querySelectorAll('[class*="rounded-"][class*="border"], [id^="c-"]');
  cards.forEach(card => {
    const cs = getComputedStyle(card);
    if (cs.overflow === 'hidden' || cs.overflow === 'scroll' || cs.overflow === 'auto') return;
    const cr = card.getBoundingClientRect(); if (cr.width < 10 || cr.height < 10) return;
    card.querySelectorAll('*').forEach(child => {
      const ccs = getComputedStyle(child);
      if (ccs.display==='none' || ccs.visibility==='hidden' || parseFloat(ccs.opacity)<0.1) return;
      if (ccs.position === 'fixed' || ccs.position === 'absolute') return;
      const r = child.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      const esc = Math.max(cr.left-r.left, r.right-cr.right, cr.top-r.top, r.bottom-cr.bottom);
      if (esc > 2) hits.push({ esc: Math.round(esc), text: (child.textContent||'').trim().slice(0,40), tag: child.tagName.toLowerCase(), card: card.closest('[id]')?.id });
    });
  });
  const seen = new Set(); const u = [];
  for (const h of hits) { const k = h.card+'|'+h.text; if (seen.has(k)) continue; seen.add(k); u.push(h); }
  return { count: u.length, samples: u.sort((a,b)=>b.esc-a.esc).slice(0,10) };
})()
```

**How to read the output:** `esc` is the pixel overflow past the card edge. Fix by adding padding to the card, moving the element inside, or (if intentional) adding `overflow-hidden` to the card.

### Workflow

1. Navigate to the explainer under test: `window.location.hash = '#<slug>'`, wait ~2.5 s for render.
2. Run detectors 1–3 (layout / KaTeX / contrast) and detectors 5–10 (rules-based sweep). Optionally detector 4 (console scanner) via `preview_console_logs`.
3. Fix each reported issue in source.
4. Re-run until every count is 0.
5. Token-efficiency note: you don't need to run every detector across every explainer on every change — run the full suite on the one you just touched, and rely on the detectors remaining in AGENTS.md as the cross-repo net.
6. Take a screenshot of any visually-ambiguous fix for a final sanity check.

### Extensions worth adding when a bug class repeats

- **Interactive-state reachability:** for every element with `onClick`, check a visible hover/focus state actually renders.
- **Keyboard-focusable controls:** every `<button>`/`<a>` has a visible focus ring (`:focus-visible` styles).
- **Narrow-viewport smoke test:** `preview_resize` to 375 px and re-run detectors 1, 3, 6, 10 — most regressions happen on mobile.
- **Reduced-motion compliance:** set `prefers-reduced-motion: reduce`, verify framer-motion animations shorten/skip.
- **Tooltip / popover clipping:** hover → check tooltip rect is in-viewport and not clipped by ancestor `overflow:hidden`.

Add these when you catch the same class of bug twice.

## Preferences log (required)

Keep a file named `PREFERENCES.md` at the repo root. It is the living memory of what this specific user likes in their explainers.

**When to update it:**
- After finishing an explainer, note any choices the user praised ("I love this animation", "keep doing this").
- Any time the user gives direct feedback ("don't do X", "prefer Y", "the palette was too loud").
- When the user picks between options you proposed — record which they chose and, if they said why, the reason.

**Structure:**

```markdown
# Preferences

## Liked (keep doing)
- [YYYY-MM-DD] Short description — which explainer it came from.

## Disliked (avoid)
- [YYYY-MM-DD] Short description — which explainer it came from.

## What worked well
- [YYYY-MM-DD] Pattern, component style, interaction, or visual approach that landed.

## Open questions / to try
- Ideas the user has mentioned wanting to explore but hasn't yet.
```

**Rules for the log:**
- One bullet per entry, dated.
- Be concrete: "animated arrows between cards using framer-motion `layoutId`" beats "nice animations".
- Prune entries that are later contradicted — don't let the log grow stale.
- Read `PREFERENCES.md` before starting any new explainer, so defaults reflect accumulated taste rather than the blank-slate template above.
