# Task: Write a public-facing README.md

Status: done
Track: B
Track reason: Copy/content change — a documentation file, no app UI or visual pattern involved.

## Problem
`README.md` currently contains only a single `# IBI` heading — no description, setup instructions, or context. The repo (`github.com/DavidMarom/ibi-test`) is going to be public, and a bare heading gives visitors no reason to understand or run the project.

## Goal
A visitor landing on the public GitHub repo can, from the README alone, understand what the app is, see it's a real working project (not a stub), and get it running locally.

## Requirements
- Describe the actual app: a two-player dice game (push-your-luck "Pig"-style: roll and bank points, but two 6s in one roll busts the round to zero) with:
  - Google Sign-In for both players (Firebase Auth)
  - A single-player mode against a fixed-strategy AI opponent (holds at 20 round points, per `src/lib/dice-game/constants.ts`)
  - Procedurally-generated sound effects with a persistent mute toggle
  - Persistent win-tally tracking backed by MongoDB
- Add badges near the top (Next.js, React, TypeScript — reflect actual versions from `package.json`).
- Add a "Getting Started" / setup section: clone, `npm install`, required env vars, `npm run dev`.
  - List only the env vars actually read by the code (grepped `process.env.*` usages): `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `MONGO_URI`, `PROJECT_ID` — placeholder values only, never real secrets from `.env.local`.
- Mention the tech stack (Next.js App Router, TypeScript, CSS Modules, Firebase Auth, MongoDB) at a high level.
- Tone: appealing/polished for a public repo, but accurate — don't invent features that don't exist.

## Constraints
- No real secret values anywhere in the README — env var section uses placeholders only (e.g. `your-project-id`).
- No screenshot/GIF section (user opted out — no way to generate a real one).
- No LICENSE section or file (user opted out).
- Don't touch `PRODUCT_KNOWLEDGE.md` — out of scope for this task even though it's similarly generic.

## Out of scope
- Adding a LICENSE file.
- Screenshots, GIFs, or any image assets.
- CI/build-status badges (no CI pipeline exists in this repo).
- Updating `PRODUCT_KNOWLEDGE.md`'s "home assignment" description.

## Implementation Notes
- Files created/modified:
  - Rewrote `README.md` (was a single `# IBI` heading, 1 line)
- Content sourced from actual code, not invented:
  - Bust rule (double sixes, not double ones) confirmed from `src/lib/dice-game/constants.ts` (`BUST_DIE_VALUE = 6`, checked in `engine.ts`'s `rollDice`)
  - AI hold-at-20 strategy confirmed from `AI_HOLD_THRESHOLD = 20` in `src/lib/dice-game/constants.ts`
  - "Play vs AI" button copy confirmed verbatim from `PLAY_VS_AI_LABEL` in `src/components/PlayerSignIn/PlayerSignIn.constants.ts`
  - Env var list built from `grep -rohE 'process\.env\.[A-Z_0-9]+' src` — only vars actually read by the app are documented; `OPEN_AI` (present in `.env.local` but never referenced in `src/`) was deliberately excluded
  - Badge versions taken from `package.json` (Next.js 16.2.6 → "16.2", React 19.2.4 → "19.2", TypeScript `^5` → "5", MongoDB `^7.5.0` → "7")
  - App title "IBI Dice Roller" taken from `src/app/layout.tsx`'s `metadata.title`
- Deviations from task requirements: none
- New design tokens used: none — plain Markdown, no app UI touched

## Verification
- [x] Describes the actual app (rules, Google Sign-In, AI opponent, sound effects, MongoDB win tally) — confirmed in `README.md:1-3,11-17` (rules and features), cross-checked against `constants.ts` (`BUST_DIE_VALUE=6`, `AI_HOLD_THRESHOLD=20`)
- [x] Badges near the top reflecting actual `package.json` versions — confirmed `README.md:5-9`: Next.js 16.2, React 19.2, TypeScript 5, MongoDB 7 all match installed versions
- [x] "Getting Started" section: clone, install, env vars, `npm run dev` — confirmed `README.md:26-68`
- [x] Env var list matches only vars actually read in `src/` — confirmed `README.md:48-59` lists exactly the 8 vars found via `grep -rohE 'process\.env\.[A-Z_0-9]+' src`; `OPEN_AI` (present in `.env.local`, unused in code) correctly excluded
- [x] Tech stack mentioned (Next.js App Router, TypeScript, CSS Modules, Firebase Auth, MongoDB) — confirmed `README.md:19-24`
- [x] Tone appealing/polished but accurate, no invented features — confirmed by reading full file; every feature claim traces to real code (verified above and in Implementation Notes)
- [x] No real secret values anywhere — confirmed `README.md:48-59` uses only placeholder strings (`your-api-key`, `your-project-id`, etc.); grepped README for stray key patterns, none found
- [x] No screenshot/GIF section — confirmed absent
- [x] No LICENSE section or file — confirmed absent, no `LICENSE` file created
- [x] `PRODUCT_KNOWLEDGE.md` untouched — confirmed via `git diff --stat PRODUCT_KNOWLEDGE.md` (empty diff)
- [x] Build still passes — confirmed via independent `npm run build` re-run, completed successfully

## Completion Summary
Rewrote `README.md` into a full public-facing readme covering the real app (rules, features, tech stack) and a working Getting Started guide with only the actually-used env vars (placeholders only, no secrets). All content verified against source code before writing. User moved on to the next request without objection, taken as confirmation; closed 2026-07-22.
