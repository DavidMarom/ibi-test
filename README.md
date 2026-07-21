# Mabul Pipeline

> A marketing and documentation site for an AI-driven development workflow - four specialized agents (Product, Design, Engineering, Security) collaborate to take a feature idea from brief to shipped code.

**[Live Demo](https://www.mabul.online)** &nbsp;|&nbsp; [GitHub](https://github.com/DavidMarom/mabul-pipeline)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-000000?logo=css3)

---

## What it does

Mabul Pipeline presents a multi-agent AI workflow where four named personas - each with a distinct responsibility - handle software delivery end-to-end. Work is routed across three tracks depending on complexity: a full product → design → dev → security pass, a fast track for bug fixes, or a standalone security audit. The site showcases the concept, documents each agent's capabilities, and tracks live Claude API token usage in the navbar.

---

## Engineering highlights

- **Multi-agent orchestration model** - four personas (Noah, Naamah, Shem, Nehemiah) with explicit role contracts and track-based routing logic (A/B/C), documented as reusable Claude Code skills
- **Live API telemetry** - `/api/token-count` reads `~/.claude/projects/` JSONL logs at request time and surfaces aggregated token usage without a database or polling loop
- **Design system as code** - all spacing, color, and typography live as CSS custom properties in `globals.css`; components consume only tokens, no hardcoded values, enforced by a `DESIGN_SYSTEM.md` spec
- **Accessibility-first** - ARIA roles and labels throughout, 44×44px touch targets, visible focus rings, and `prefers-reduced-motion` support on all animated elements
- **Strong typing** - every component has a co-located `.types.ts` file; no `any` types; props and API shapes are fully typed with TypeScript 5

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | CSS Modules - no utility framework |
| Fonts | Geist Sans / Geist Mono (Next.js font system) |
| Image optimization | Sharp |
| API | Next.js Route Handlers |

---

## Architecture

```
src/
  app/
    page.tsx              # Homepage: Hero, Personas, Discord banner
    skills/page.tsx       # Skills catalog + Pipeline Flow diagram
    api/token-count/      # Claude JSONL log aggregation endpoint
    globals.css           # Design system tokens (single source of truth)
  components/
    Navbar/               # Token counter integrated into nav
    Hero/ Features/ Footer/
    SkillCard/ PipelineFlow/ Personas/
    icons/                # SVG components (typed, 16×18px)
docs/
  DESIGN_SYSTEM.md        # Full token & pattern reference
```

Each component lives in its own folder with a CSS Module and a TypeScript types file. State is minimal and local - no Redux or Zustand; the UI is driven by typed constants. Dark theme only, with elevation expressed through background-color layers rather than box shadows.

---

# Getting Started

```bash
git clone https://github.com/DavidMarom/mabul-pipeline.git
cd mabul-pipeline
bash setup.sh
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |

---
