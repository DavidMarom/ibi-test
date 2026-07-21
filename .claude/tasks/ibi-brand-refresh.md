# Task: IBI Brand Visual Language — Design Tokens & Secondary Button

Status: reviewing
Track: A
Track reason: new color palette, typography treatment, and button pattern not covered by any existing design system token

## Problem
The project's current design system (dark tech-blue palette: `#0d0d0d` background, `#4f8ef7` accent) doesn't match IBI's actual brand identity — a dark navy financial aesthetic with a distinct cyan accent and a specific outlined-pill secondary button pattern, per two reference mockups the user provided. Without an updated system to draw from, any future UI work would keep producing off-brand components.

## Goal
The design system's foundational tokens (color palette, a large-display headline typography role) and a new "Secondary button" pattern reflect the IBI mockups — plus a real, reusable button component implementing that pattern — ready for future work to use. No existing pages are touched in this task.

## Requirements
- New color tokens matching the IBI navy/cyan palette, added to `globals.css` and documented in `docs/DESIGN_SYSTEM.md`: a dark navbar navy, a slightly lighter hero/section navy, a cyan accent (border + text on the secondary button), and a muted light body-text color for Hebrew/long-form copy in the reference (even though this project stays English, the token itself should exist for future use)
- A new "Secondary button" pattern matching the reference button image: pill-radius, transparent/matching-background fill, cyan border, cyan text, a leading arrow icon, proportions/spacing matching the reference as closely as reasonably achievable — documented in `docs/DESIGN_SYSTEM.md`
- A real, reusable button component (not just documentation) implementing that pattern, so future tasks can use it directly
- A new "Display headline" typography role matching the large bold uppercase "CREATING WEALTH" hero treatment in the reference, documented alongside the existing type scale
- Color/spacing values are extracted by eye from the reference screenshots (no formal brand guideline doc or exact hex codes were provided) — flag them explicitly as best-effort approximations so they're easy to correct later if exact brand values surface

## Constraints
- Do not restyle any existing pages or components (Navbar, Hero, Footer, dice game, etc.) — this task only adds new tokens/patterns and the new button component; applying them to existing pages is explicitly separate, future work
- Keep the site English/LTR — do not add Hebrew content or RTL layout support; borrow only the visual language (colors, typography, button shape) from the mockups, not the content or reading direction
- Reference material: two images the user attached — a full homepage mockup ("IBI בית השקעות" investment house site, dark navy header/hero, "CREATING WEALTH" headline, Hebrew body copy, "השאירו פרטים" pill CTA) and a close-up crop of that same button. Treat these as the source of truth for color/shape/spacing.

## Out of scope
- Restyling existing components/pages to the new palette (separate future task)
- RTL/Hebrew content or layout
- Any button variant other than the secondary/outline one shown (e.g. no primary button redesign — no reference was provided for it)

## Design Brief

## Design Brief: IBI Brand Visual Language — Tokens & Secondary Button

### Key architectural decision (read first)
The existing system tokens (`--color-bg`, `--color-accent`, etc.) stay exactly as they are — **nothing gets overwritten**. Every existing component (Navbar, Hero, dice game, all of it) currently reads those tokens, so changing their values would restyle the whole site instantly, which the task explicitly rules out. Instead, this brief introduces a **parallel, namespaced token set** (`--color-ibi-*`) that coexists with the current palette. Future "restyle X to the new brand" tasks will migrate specific components from the old tokens to the new ones, one at a time, on purpose — not as a side effect of this task.

For the same reason, the new button is a **new, separately-named component** (`IbiSecondaryButton`), not a modification of the existing "Secondary (outline) button" pattern already documented in `docs/DESIGN_SYSTEM.md`. That existing pattern (neutral gray border until hover, 8px radius, compact size) stays exactly as-is and keeps serving existing components (e.g. `PlayerSignIn`'s Google button). The two patterns will visually coexist in the codebase until/unless a future task consolidates them — flagging that explicitly rather than quietly deprecating something without a task authorizing it.

### Values are eyeballed, not brand-guide-sourced
I read these directly from the two reference images (a full homepage mockup and a close-up crop of the CTA button) — there's no formal brand guideline document, so every hex value below is a close visual estimate, not a certified brand color. Documented as such in the tokens table. If exact brand hex values surface later, update the `--color-ibi-*` values in one place (`globals.css`) and everything using them updates automatically.

### New color tokens
| Token | Value | Usage | Source |
|---|---|---|---|
| `--color-ibi-navbar` | `#0d1526` | Darkest navy — navbar background in the reference | Eyeballed |
| `--color-ibi-surface` | `#12213b` | Slightly lighter navy — hero/section background in the reference | Eyeballed |
| `--color-ibi-accent` | `#35c5e3` | Cyan — the secondary button's border, text, and icon color | Eyeballed |
| `--color-ibi-accent-dim` | `rgba(53, 197, 227, 0.12)` | Hover background for the new button — parallels the existing `--color-accent-dim` convention | Derived (same alpha convention as the existing dim tokens) |
| `--color-ibi-text-primary` | `#ffffff` | Headline text color in the reference | Eyeballed |
| `--color-ibi-text-muted` | `#b9c4d3` | Muted light gray-blue body-copy color in the reference (kept for future use even though this project stays English) | Eyeballed |

### Component hierarchy
- **`IbiSecondaryButton`** (new, `src/components/IbiSecondaryButton/`) — self-contained: renders the leading arrow icon + label. Renders as a real `<a>` when an `href` prop is given, otherwise a real `<button>` — never a clickable `<div>`. Props: `children: React.ReactNode` (the label), `href?: string`, `onClick?: () => void`, `type?: "button" | "submit"` (default `"button"`, ignored if `href` is set), `disabled?: boolean`.
- **`ArrowLeftIcon`** (new, added to `src/components/icons/index.tsx`) — 18×18px, `stroke="currentColor"` (matching `CheckIcon`'s stroke-based style, not `fill`), `aria-hidden="true"`. A plain left-pointing arrow; the direction is fixed regardless of page text direction (this project stays LTR, so it renders exactly as in the reference — no RTL mirroring logic needed here).
- Background is **not** baked into the button — it's `background: transparent`, so it composites correctly over either the existing `--color-bg` or the new `--color-ibi-surface`/`--color-ibi-navbar`, wherever a future task ends up placing it.

### Spacing & sizing
- Padding: `var(--space-3) var(--space-5)` (16px vertical / 32px horizontal) — a generous, hero-CTA scale, distinctly larger than the existing compact Secondary button.
- `min-height: 52px` (exceeds the 44px touch-target floor; matches the reference's visibly taller pill).
- Gap between arrow icon and label: `var(--space-2)` (8px).
- Border width: `1px` — kept consistent with every other bordered element in the system rather than guessing a thicker stroke off a screenshot; a 1px cyan border on dark navy reads clearly at this size.
- Border radius: reuse the **existing `--radius-pill` token (100px)** — no new radius token needed, this is exactly the full-pill shape already established for stat/metric pills, just applied to a button for the first time.

### Color & typography
- Button: `background: transparent`; `border: 1px solid var(--color-ibi-accent)`; `color: var(--color-ibi-accent)` (icon inherits via `currentColor`); font Geist Sans, 15px, 600.
- **New typography role — "Display headline"**: Geist Sans, 40px mobile / 72px desktop (bump at the existing 1024px breakpoint), weight 800, uppercase (`text-transform: uppercase`), `line-height: 1.05`, `letter-spacing: -0.01em`, `color: var(--color-ibi-text-primary)`. This is a large jump from the current largest role (Card title desktop, 18px) — intentional, matching the mockup's oversized "CREATING WEALTH" treatment. No new font family introduced; reusing Geist Sans at a much bolder weight/size keeps the token footprint small unless the user supplies an actual brand typeface later.

### Interaction states
| State | Treatment |
|---|---|
| Default | As above |
| Hover | `background: var(--color-ibi-accent-dim)`; border/text stay `--color-ibi-accent` |
| Focus-visible | `outline: 2px solid var(--color-ibi-accent)`, `outline-offset: 3px` — same ring geometry as every other focusable element in the system, just using the new accent token |
| Active | `opacity: 0.8` — reused exactly from the existing Secondary button pattern, no reason to diverge |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none` — same as the existing pattern |

### Accessibility
- Real `<a>` (with `href`) or real `<button>` — never a non-semantic clickable element.
- `ArrowLeftIcon` is `aria-hidden="true"`; the accessible name comes entirely from the button/link's visible text (`children`), so callers must always pass real label text (no icon-only usage of this component).
- Contrast: a bright, light-saturated cyan (`#35c5e3`) against a near-black navy background is a very large luminance gap — qualitatively well past the AA 4.5:1 floor for text this size. Flagging for a real contrast check once/if exact brand hex values replace the eyeballed ones, since "looks fine" isn't a substitute for a computed ratio.
- Focus-visible ring required, no exceptions — matches system-wide standard.
- Min 52px touch target, comfortably exceeds the 44px minimum.

## Implementation Notes
- Files created:
  - `src/components/IbiSecondaryButton/` (`.tsx`, `.module.css`, `.types.ts`) — the new button component
  - `docs/DESIGN_SYSTEM.md` and `src/app/globals.css` were already updated by the designer before handoff (new `--color-ibi-*` tokens, "Display headline" typography role, "IBI secondary button pattern" doc section) — no further token/doc changes needed from me
- Files modified:
  - `src/components/icons/index.tsx` — added `ArrowLeftIcon` (stroke-based, matches `CheckIcon`'s style exactly: `fill="none"`, `stroke="currentColor"`, `strokeLinecap`/`strokeLinejoin="round"`)
  - `src/components/index.ts` — exported `IbiSecondaryButton`
- **No existing component, page, or token was touched** — verified via `git status --short` showing only the two files above modified plus the new component folder; `npm run build`'s route table is byte-for-byte identical to before this task (no new routes, since nothing consumes the component yet).
- **`IbiSecondaryButton` renders a real `<a>` when `href` is given, otherwise a real `<button>`**, per the brief. Handled the disabled case for both: `<button disabled>` uses the native attribute (and the CSS `:disabled` pseudo-class); `<a>` has no native `disabled`, so it gets `aria-disabled="true"`, `tabIndex={-1}` (removes it from tab order), a `.disabled` CSS class applying the same visual treatment as `:disabled`, and the `onClick` handler itself calls `e.preventDefault()` and skips the callback when `disabled` is true — `aria-disabled` alone doesn't stop click/keyboard activation, so this closes that gap.
- **"Display headline" typography role**: left as documentation-only in `docs/DESIGN_SYSTEM.md` (already done by the designer) — did not build a dedicated `Headline` component or a shared global CSS utility class for it, per the brief's explicit "don't build a whole component unless clearly necessary" guidance, since nothing consumes it yet and this project doesn't have a precedent for global typography utility classes (every existing typography treatment is defined inline within whichever component's own CSS Module uses it). Whoever picks up the first component that needs this role can copy the exact values from the design system table into their own `.module.css`.
- **Verification approach for a component nothing else uses yet**: created a temporary preview route (`src/app/dev-preview-ibi-button/`, note: NOT prefixed with `_` — learned during this task that Next.js App Router treats `_`-prefixed folders as private/excluded from routing, so an underscore-prefixed attempt silently 404'd first), rendered both the link and disabled-button variants against `--color-ibi-surface`, confirmed via `curl` against `npm run dev` that both render with correct classes/attributes (inspected the raw HTML: icon SVG present, `aria-hidden="true"`, disabled `<button>` has the native `disabled=""` attribute, non-disabled `<a>` correctly omits both the `.disabled` class and `aria-disabled`). Deleted the entire preview route afterward — confirmed via `git status` it left no trace, and cleared a stale `.next` dev-cache artifact that briefly referenced the deleted route's generated types (a harmless build-cache leftover, not a real error — `rm -rf .next` and a clean `tsc --noEmit`/`npm run build` afterward confirmed nothing was actually broken).
- Deviations from brief: none.
- New design tokens used: `--color-ibi-accent`, `--color-ibi-accent-dim`, `--radius-pill` (reused, not new) — all pre-existing by the time I started, added by the designer.

## Verification
- [x] New color tokens (navbar navy, hero navy, cyan accent, muted text), added to `globals.css` and documented in `docs/DESIGN_SYSTEM.md` — `globals.css:19-25` (`--color-ibi-navbar`, `--color-ibi-surface`, `--color-ibi-accent`, `--color-ibi-accent-dim`, `--color-ibi-text-primary`, `--color-ibi-text-muted`), documented in `docs/DESIGN_SYSTEM.md`'s new "IBI brand palette" section with each value's source flagged as "Eyeballed"
- [x] New "Secondary button" pattern matching the reference (pill, transparent/matching-bg, cyan border+text, leading arrow icon) — `IbiSecondaryButton.module.css:1-17` (`border-radius: var(--radius-pill)`, `border: 1px solid var(--color-ibi-accent)`, `color: var(--color-ibi-accent)`, transparent background), `IbiSecondaryButton.tsx:25` (`<ArrowLeftIcon />` leading `<span>{children}</span>`); documented in `docs/DESIGN_SYSTEM.md`'s "IBI secondary button pattern" section
- [x] Real, reusable button component (not just documentation) — `src/components/IbiSecondaryButton/IbiSecondaryButton.tsx`, exported from `src/components/index.ts:19`; read the code directly, not just the developer's description
- [x] New "Display headline" typography role documented — `docs/DESIGN_SYSTEM.md` Typography table, "Display headline (IBI)" row (Geist Sans, 40px mobile/72px desktop, weight 800, line-height 1.05) plus the uppercase/letter-spacing/color notes below the table. Confirmed the developer's call not to build a dedicated component for this is reasonable — the requirement was for the role to exist and be documented, which it is; no consumer needs it yet
- [x] Values flagged as best-effort/eyeballed approximations — confirmed in three places independently: the color token table ("Eyeballed" column), the pattern doc's "Values are eyeballed, not brand-guide-sourced" note, and the task file's own Design Brief section
- [x] Does not restyle any existing page/component — confirmed independently via `git status --short` and `git diff src/components/icons/index.tsx` (purely additive) and `git status --short src/components/VulnerabilityListButton src/components/PlayerSignIn` (no output — genuinely untouched, not just claimed)
- [x] Stays English/LTR, no Hebrew/RTL content or layout — confirmed by reading every new file; no `dir="rtl"`, no Hebrew strings, no locale/i18n code anywhere in the diff

Build (`npm run build`) re-run independently and passes; `git status` re-run independently and confirms the diff is exactly what was claimed — new component folder plus four purely-additive edits (icons file, barrel export, and the designer's earlier `globals.css`/`docs/DESIGN_SYSTEM.md` changes), nothing else.
