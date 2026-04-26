import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { explainers } from './explainers.js';

function useHash() {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash.slice(1)
  );
  useEffect(() => {
    const onHash = () => setHash(window.location.hash.slice(1));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [hash, (next) => (window.location.hash = next)];
}

function Home() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(192,132,252,0.10),transparent_55%)]"
      />
      <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/80 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
            <Sparkles className="w-3.5 h-3.5" /> explainers
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-white via-sky-100 to-violet-200 bg-clip-text text-transparent">
            Visual explainers
          </h1>
          <p className="mt-5 text-neutral-300 text-base md:text-lg max-w-2xl mx-auto">
            A personal sandbox for interactive, one-page deep-dives into concepts
            worth understanding deeply.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          {explainers.map((e, i) => (
            <motion.a
              key={e.slug}
              href={`#${e.slug}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -3 }}
              className="group relative rounded-2xl bg-neutral-900/60 border border-white/10 p-6 overflow-hidden hover:border-sky-400/30 transition-colors"
            >
              <div className="pointer-events-none absolute -inset-px bg-gradient-to-br from-sky-500/0 via-violet-500/0 to-fuchsia-500/0 group-hover:from-sky-500/10 group-hover:via-violet-500/10 group-hover:to-fuchsia-500/10 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500">
                  {e.tags?.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-neutral-50">{e.title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{e.blurb}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-sky-300">
                  open <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <a
      href="#"
      className="fixed top-4 left-4 z-50 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-300 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 hover:bg-black/60 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> all explainers
    </a>
  );
}

export default function App() {
  const [hash] = useHash();
  const matched = explainers.find((e) => e.slug === hash);

  // Track the last mounted explainer so in-page anchor links (e.g. side-nav
  // hrefs like `#calibration`) don't kick the router back to <Home/>. When the
  // hash is non-empty and matches no slug, we assume it's an in-page section
  // ID for the last-mounted explainer and keep rendering it.
  const lastSlugRef = useRef(null);
  if (matched) lastSlugRef.current = matched.slug;
  if (hash === '') lastSlugRef.current = null;

  const slugToRender =
    matched?.slug ?? (hash !== '' ? lastSlugRef.current : null);

  if (slugToRender) {
    const explainer = explainers.find((e) => e.slug === slugToRender);
    if (explainer) {
      const Component = explainer.component;
      return (
        <>
          <BackButton />
          <Component />
        </>
      );
    }
  }
  return <Home />;
}
