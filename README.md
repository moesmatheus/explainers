# explainers-claude

A sandbox of interactive, single-file concept explainers. One React
component per topic, shared deps, shared home page, deployed together.

Live topics so far: AI-code onboarding, data centers (v1 & v2), DeepSeek-V4,
linear algebra, machine learning, quantum mechanics, reinforcement learning,
systems thinking, world economy, and Brazilian corporate tax.

## Running the dev server

```bash
# once
npm install

# every day
npm run dev
```

Vite starts on **<http://localhost:5173>**. The home page lists every
explainer; each one lives at `#<slug>` — e.g.
<http://localhost:5173/#deepseek-v4>.

Hot-reload is on. Edit any `*Explainer.jsx` and the page refreshes.

## Building for production

```bash
npm run build      # outputs to /dist
npm run preview    # serves /dist on http://localhost:4173
```

The whole app builds to a static bundle — no server needed at runtime.
Drop `/dist` behind any CDN.

## Repo layout

```
explainers-claude/
├── <topic>/                     # one folder per explainer
│   └── <Topic>Explainer.jsx     # single-file React component
├── src/
│   ├── explainers.js            # registry — import + entry per explainer
│   ├── App.jsx                  # home page + hash-based router
│   ├── main.jsx                 # mount
│   └── index.css                # Tailwind v4 + small globals
├── docs/                        # notes on conventions
├── AGENTS.md                    # rules + detector suite for AI contributors
├── PREFERENCES.md               # accumulated taste / patterns
├── index.html
├── vite.config.js
└── package.json
```

Routing is **hash-based**, so anything at `/#<slug>` works without server
config. The `App.jsx` reads `window.location.hash` and mounts the
matching component from the registry.

## Adding a new explainer

1. Create a new kebab-case folder at the repo root, e.g.
   `my-topic/`.
2. Drop a single `MyTopicExplainer.jsx` inside. Use an existing one
   (e.g. `data-centers-v2/`) as a template — single-file React, Tailwind
   dark mode, `lucide-react` icons, `framer-motion` animations, `katex`
   for equations.
3. Register it in **`src/explainers.js`**:

   ```js
   import MyTopicExplainer from '../my-topic/MyTopicExplainer.jsx';

   export const explainers = [
     // …existing entries…
     {
       slug: 'my-topic',
       title: 'My Topic',
       blurb: 'One line describing the explainer.',
       tags: ['ML', 'interactive'],
       component: MyTopicExplainer,
     },
   ];
   ```

No other wiring needed — the home page picks it up automatically.

See `AGENTS.md` for the full authoring rules, the default component
template, the pedagogy primitives (QA, Deeper, MinSchema, CrossLink,
Term…), and the detector suite used to catch layout/KaTeX/contrast
issues before they ship.

See `PREFERENCES.md` for accumulated stylistic decisions (color palette,
hover tooltips, header patterns, etc.) — read this before starting a
new explainer.

## Shared dependencies

All explainers pull from the same root `node_modules/` — **never** add
a sub-`package.json`. If a new shared dep is needed, install it at the
root:

- `react`, `react-dom` — app runtime
- `framer-motion` — animations
- `lucide-react` — icons
- `katex` — equations (import CSS per component)
- `tailwindcss` v4 + `@tailwindcss/vite` — styling
- `vite` + `@vitejs/plugin-react` — dev server / bundler

## Useful commands

| command | what it does |
| --- | --- |
| `npm run dev` | dev server on :5173 |
| `npm run build` | production bundle in `/dist` |
| `npm run preview` | serve built bundle on :4173 |

## Conventions at a glance

- Dark mode is the default (and currently the only) theme.
- Every card has an anchor id so deep links like `/#data-centers-v2`
  followed by in-page `#<section>` jumps work.
- Numbers are formatted with a stable helper — no locale dependencies.
- Equations use KaTeX (not MathJax) for fast synchronous rendering.
- Keep each explainer **self-contained** in one file. Shared primitives
  are duplicated across explainers on purpose — each one is a
  standalone artifact.
