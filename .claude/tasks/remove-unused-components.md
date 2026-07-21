# Task: Remove unused components (Navbar, CodeBlock, SkillCard, Footer)

Status: reviewing
Track: B
Track reason: Refactor/cleanup — internal structure only, no user-facing visual change; removing dead code, not building anything new.

## Problem
`src/components/index.ts` exports `Navbar`, `CodeBlock`, `SkillCard`, and `Footer`. It's unclear whether any of these four are actually referenced elsewhere in the codebase. Unused components add clutter and maintenance burden.

## Goal
Any of the four components with zero real usages elsewhere in the codebase are deleted (files + export); any that are actually used are left untouched.

## Requirements
- For each of `Navbar`, `CodeBlock`, `SkillCard`, `Footer`: search the whole codebase for imports/usages of it, excluding the component's own implementation file and its line in `src/components/index.ts`.
- If a component has zero usages elsewhere: delete its entire component folder (`src/components/<Name>/`) and remove its export line from `src/components/index.ts`.
- If a component IS used somewhere: leave its files and export untouched.
- Report back, per component, whether it was removed or kept, and if kept, where it's used (file:line).

## Constraints
- Only evaluate these four components — don't remove or modify any other component even if it also looks unused.
- After any deletions, confirm the project still builds/typechecks cleanly (no dangling imports).

## Out of scope
- Refactoring, renaming, or improving components that are kept.
- Auditing or removing any other unused code not in this list.

## Implementation Notes
- Files created/modified:
  - Deleted `src/components/CodeBlock/` (entire folder: `CodeBlock.tsx`, `CodeBlock.module.css`)
  - Modified `src/components/index.ts` — removed the `CodeBlock` export line
- Per-component result:
  - `Navbar` — KEPT, used in `src/app/skills/page.tsx:9` (`<Navbar />`), imported line 1
  - `CodeBlock` — REMOVED, no usages found anywhere outside its own file and the barrel export
  - `SkillCard` — KEPT, used in `src/app/skills/page.tsx:18` (`<SkillCard ... />`); its prop type `SkillCardProps` is also imported in `src/app/skills/constants.ts:1`
  - `Footer` — KEPT, used in `src/app/skills/page.tsx:31` (`<Footer />`)
- Verification: `npm run build` (includes TypeScript check) completed successfully after the deletion — no dangling imports.
- Deviations from task requirements: none
- New design tokens used: none

## Verification
- [x] Searched whole codebase for usages of Navbar, CodeBlock, SkillCard, Footer excluding own files/barrel — confirmed via grep: Navbar/SkillCard/Footer used in `src/app/skills/page.tsx`, CodeBlock had zero matches anywhere
- [x] CodeBlock had zero usages elsewhere → deleted — confirmed `src/components/CodeBlock/` no longer exists and no remaining references in `src/**/*.ts(x)`
- [x] Navbar used elsewhere → left untouched — confirmed `src/components/index.ts:1` still exports it, used at `src/app/skills/page.tsx:9`
- [x] SkillCard used elsewhere → left untouched — confirmed `src/components/index.ts:7` still exports it, used at `src/app/skills/page.tsx:18` (and its type in `src/app/skills/constants.ts:1`)
- [x] Footer used elsewhere → left untouched — confirmed `src/components/index.ts:5` still exports it, used at `src/app/skills/page.tsx:31`
- [x] Report of removed/kept per component — provided in Implementation Notes above
- [x] Only these four components evaluated, no other components touched — confirmed via diff, only `CodeBlock` deletion and `index.ts` edit
- [x] Project builds/typechecks cleanly after removal — confirmed via `npm run build` (Next.js 16.2.6, TypeScript check passed, all routes generated)
