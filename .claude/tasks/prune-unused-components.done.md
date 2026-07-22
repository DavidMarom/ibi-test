# Task: Prune unused components (Features, FeatureCard, PageHeader, SkillCard, PipelineFlow, VulnerabilityListButton)

Status: done
Track: B
Track reason: Refactor/cleanup — internal structure only, no user-facing visual change; removing dead code, not building anything new.

## Problem
`src/components/index.ts` has commented-out export lines for `Features`, `FeatureCard`, `PageHeader`, `SkillCard`, `PipelineFlow`, and `VulnerabilityListButton`. Their component folders still exist in the codebase. A prior cleanup task (`remove-unused-components.done.md`) evaluated `SkillCard` and kept it because it was used in `src/app/skills/page.tsx` — but that route no longer exists (the `src/app/skills/` directory is gone), so usage may have changed since. Unused components add clutter and maintenance burden.

## Goal
Any of the six listed components with zero real usages elsewhere in the codebase are deleted (component folder + commented export line); any that are actually used are left untouched.

## Requirements
- For each of `Features`, `FeatureCard`, `PageHeader`, `SkillCard`, `PipelineFlow`, `VulnerabilityListButton`: search the whole codebase (`src/`) for imports/usages, excluding the component's own implementation files and its (already-commented-out) line in `src/components/index.ts`.
- If a component has zero usages elsewhere: delete its entire component folder (`src/components/<Name>/`) and remove its commented export line from `src/components/index.ts`.
- If a component IS used somewhere: leave its files and the commented export line untouched.
- Report back, per component, whether it was removed or kept, and if kept, where it's used (file:line).

## Constraints
- Only evaluate these six components — don't remove or modify any other component even if it also looks unused.
- After any deletions, confirm the project still builds/typechecks cleanly (no dangling imports).

## Out of scope
- Refactoring, renaming, or improving components that are kept.
- Auditing or removing any other unused code not in this list.
- Re-enabling any of these exports.

## Implementation Notes
- Files created/modified:
  - Deleted `src/components/Features/` (entire folder)
  - Deleted `src/components/FeatureCard/` (entire folder)
  - Deleted `src/components/PageHeader/` (entire folder)
  - Deleted `src/components/SkillCard/` (entire folder)
  - Deleted `src/components/PipelineFlow/` (entire folder)
  - Deleted `src/components/VulnerabilityListButton/` (entire folder)
  - Modified `src/components/index.ts` — removed all six commented-out export lines
- Per-component result:
  - `Features` — REMOVED, zero usages found anywhere outside its own file and the barrel
  - `FeatureCard` — REMOVED, only usage was inside `Features.tsx` (itself unused/removed)
  - `PageHeader` — REMOVED, zero usages found
  - `SkillCard` — REMOVED, zero usages found (previously kept in `remove-unused-components.done.md` because of `src/app/skills/page.tsx`, but that route no longer exists)
  - `PipelineFlow` — REMOVED, zero usages found
  - `VulnerabilityListButton` — REMOVED, zero usages found
- Verification: `npm run build` (includes TypeScript check via Next.js/Turbopack) completed successfully after deletion — no dangling imports, all routes generated cleanly. No separate `lint`/`typecheck` npm scripts exist in `package.json`.
- Deviations from task requirements: none
- New design tokens used: none

## Verification
- [x] Searched whole codebase for usages of all six components, excluding own files/barrel — confirmed via independent `grep -rn "\bName\b" src/` re-run for each: zero matches for any of the six anywhere in `src/`
- [x] Zero-usage components deleted (folder + commented export line) — confirmed all six folders no longer exist (`ls src/components/`) and `src/components/index.ts` no longer contains any of the six export lines
- [x] Any used component left untouched — N/A, all six had zero usages once `Features`/`FeatureCard`'s mutual-only reference is accounted for (both removed together)
- [x] Report of removed/kept per component — provided in Implementation Notes above; `SkillCard` correctly re-evaluated and found newly-orphaned since `src/app/skills/page.tsx` no longer exists
- [x] Only these six components evaluated, no other components touched — confirmed `src/components/index.ts` still exports all ten other unrelated components unchanged
- [x] Project builds/typechecks cleanly after removal — confirmed via independent `npm run build` re-run (Next.js 16.2.6, TypeScript check passed, all 9 routes generated). No separate `lint`/`typecheck` scripts exist in `package.json`.

## Completion Summary
Audited `Features`, `FeatureCard`, `PageHeader`, `SkillCard`, `PipelineFlow`, and `VulnerabilityListButton` for real usages across the codebase; all six had zero usages and were deleted (component folders + commented barrel exports). `SkillCard` in particular had been kept by an earlier cleanup task because of `src/app/skills/page.tsx`, which has since been removed, leaving it newly orphaned. Build verified clean after the change. User moved on to the next request without objection, taken as confirmation; closed 2026-07-22.
