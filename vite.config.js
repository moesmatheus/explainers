import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Mode-aware base path:
// - dev (`npm run dev`)    → '/'                       — keep the local URL clean.
// - build (`npm run build`)→ '/explainers-claude/'     — matches GitHub Pages
//                                                        project-site path
//                                                        github.io/<repo>/.
// Override either via VITE_BASE env var if you fork to a differently-named repo.
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  const base = process.env.VITE_BASE ?? (isBuild ? '/explainers/' : '/');
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      // Honor a PORT env var when set (the preview harness assigns a free port
      // this way); otherwise default to 5173 for a clean local `npm run dev`.
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
      host: true,
      // .tools/ holds shared developer tooling (e.g. the Manim venv + render
      // cache). Excluding it keeps Vite's watcher and CSS asset resolver from
      // tripping over Manim's intermediate LaTeX→SVG files, which previously
      // crashed Tailwind v4's CSS analysis with ENOENT.
      watch: { ignored: ['**/.tools/**'] },
    },
  };
});
