# Roadmap — AI-Codebase Onboarding Generator (tool, not explainer)

> Status: **idea / roadmap**. Not implemented.
> Companion to the `ai-code-onboarding` explainer. The explainer teaches the
> workflow by hand; this tool would **run the workflow against a real repo**
> and produce a portable onboarding pack.

## Motivation

The explainer makes the moves concrete, but every new AI-built project still
costs the same 30–90 minutes of manual graph-building and pruning. That cost
grows every time a refactor scrambles the graph. A tool can amortize it.

Design premise: the tool does **not** replace reading the code. It produces
artifacts that shorten the "where do I even start" phase and flag the most
likely confabulations and dead ends.

## Shape of the tool

Point it at a repo (`ai-onboard ./my-app`) and it emits a `.onboard/` directory
next to the code:

```
.onboard/
  graph.json          # nodes + edges (import + runtime + ownership)
  graph.svg           # renderable three-view graph
  suspects.md         # likely-dead or likely-confabulated files
  trust-boundaries.md # where user input enters + where it exits to a sink
  ownership.md        # state-owning nodes and their readers
  entrypoints.md      # detected entry points (main, app.py, index.tsx...)
  tour.md             # a "read these files in this order" narrated tour
```

Every artifact includes **line-anchored citations** back to source so the
reader can jump straight to the code. No artifact is authoritative; each is a
hypothesis the reader confirms in 10 seconds.

## Pipeline

1. **Detect stacks.** `package.json`, `pyproject.toml`, `go.mod`, etc. → list
   of language roots.
2. **Static import graph.** Per-language:
   - JS/TS: `madge` or a ts-morph pass
   - Python: `pydeps` or an ast walk
   - Go: `go list -json`
   - Rust: `cargo metadata`
3. **Runtime call graph (shallow).** Start from each detected entrypoint,
   follow imports one hop, mark reachability. Nothing fancy — we just want
   "files the entrypoint can't possibly reach" as the dead-code heuristic.
4. **Cross-language edges.** Scan for HTTP clients (`fetch`, `axios`,
   `httpx`, `requests`) and match URL literals to server routes
   (`@app.get`, `FastAPI.add_api_route`, `express.Router`, etc.). These are
   the edges that matter most and are missed by every in-language tool.
5. **State ownership pass.** JS: `useState`, `createContext`, Zustand/Redux
   stores. Python: class fields on long-lived singletons, module-level
   globals. Emit a list of nodes that own state and who reads it.
6. **Trust boundaries.** Find request handlers (routes, form actions,
   message consumers), trace inputs one hop, flag any path that reaches a
   sink (DB query, shell, `eval`, file write) without an intervening
   validator.
7. **Confabulation suspects.** Heuristics:
   - Imported but symbols never referenced
   - Defined but never imported
   - Re-exports with no downstream reader
   - Duplicate utilities with >80% AST similarity
   - Try/catch that swallows without rethrow or log
   - `any`/`# type: ignore` clusters
8. **Tour generation.** Topological sort from entrypoints, pick the
   smallest reading path that touches: one state owner, one trust
   boundary, one cross-language edge. This is the "first 20 minutes"
   reading list.

## Non-goals

- **Not a code review tool.** No style opinions, no nitpicks.
- **Not a fixer.** It flags; it doesn't edit.
- **Not a security audit.** Trust-boundary pass is a smoke test, not SAST.
- **Not a replacement for reading the code.** Every output is a hypothesis.

## Open questions

- **Packaging.** CLI-first (Node binary that shells out to Python for the
  py pass) or separate per-language CLIs that share a JSON schema? Probably
  the latter — lets each stack evolve independently.
- **Graph rendering.** Reuse the same three-view SVG from the explainer
  (imports / runtime / ownership)? Worth extracting once the explainer
  primitive stabilizes.
- **Incremental mode.** After first run, detect which files changed since
  last run and only re-analyze their subgraph.
- **LLM role.** Keep the static passes deterministic; use an LLM only for
  the narrative `tour.md` and for grouping suspects by likely cause.
  Everything the LLM writes must cite a file:line that it read.
- **How much to trust heuristics.** A "likely dead" file should be a
  *suspect*, not a verdict. Output must make uncertainty legible.

## Nice-to-haves (not v1)

- Watch mode that regenerates `.onboard/` on save.
- VS Code extension that overlays graph/ownership info inline.
- "Diff the onboarding" — show how graph and suspects changed since last
  commit (catches when a refactor silently widens a trust boundary).
- Comparison across repos ("these three AI-built apps all have the same
  dead `utils/format.ts` — one human wrote it once, the model keeps
  recreating it").

## Success criterion

First-run time-to-first-useful-edit on an unfamiliar AI-built repo drops
from ~60 min to ~15 min. Measured by: reader can name the entrypoint,
one state owner, one trust boundary, and one dead file, without opening
the source tree manually.
