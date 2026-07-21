# Design System

> Living document. Updated by the `/designer` skill after each design session.
> Source of truth for tokens, patterns, and decisions — if it's here, use it; if you're adding something new, add it here.

---

## Color tokens

Defined in `src/app/globals.css` as CSS custom properties.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0d0d0d` | Page background |
| `--color-surface` | `#161616` | Card, navbar, panel backgrounds |
| `--color-surface-raised` | `#1e1e1e` | Hover state for surfaces |
| `--color-border` | `#2a2a2a` | All borders and dividers |
| `--color-text-primary` | `#f0f0f0` | Body text, headings |
| `--color-text-secondary` | `#888888` | Captions, metadata, muted labels |
| `--color-accent` | `#4f8ef7` | CTAs, links, focus rings, icons |
| `--color-accent-dim` | `rgba(79,142,247,0.12)` | Icon badge backgrounds, subtle highlights |
| `--color-accent-hover` | `#3a7de0` | Accent on hover |
| `--color-discord` | `#5865F2` | Discord brand CTA background — purposefully off-palette to signal "leaves the app" |
| `--color-discord-hover` | `#4752c4` | Discord CTA hover state |
| `--color-accent-border` | `rgba(79, 142, 247, 0.25)` | Border on accent-tinted elements (e.g. token counter pill) — more visible than `--color-accent-dim` bg alone |
| `--color-error` | `#ff6b6b` | Inline error/failure text (e.g. failed sign-in) — first error token in the system |
| `--color-error-dim` | `rgba(255, 107, 107, 0.12)` | Reserved for subtle error backgrounds, parallels `--color-accent-dim` |

**Theme:** dark only (`color-scheme: dark` on `html`).

---

## IBI brand palette (parallel token set)

A second, **namespaced** palette (`--color-ibi-*`) exists alongside the tokens above — introduced for the IBI brand refresh, not a replacement. The original tokens above are untouched and keep serving every existing component; nothing was restyled as a side effect of adding these. A future task may migrate a specific component from the old tokens to these, deliberately, one at a time.

**Values are eyeballed from two reference images (a homepage mockup + a button close-up crop) — no formal brand guideline document was supplied.** Treat as close approximations, not certified brand colors; if exact hex values surface later, update them here and in `globals.css` and everything using them updates at once.

| Token | Value | Usage |
|---|---|---|
| `--color-ibi-navbar` | `#0d1526` | Darkest navy — navbar background in the reference |
| `--color-ibi-surface` | `#12213b` | Slightly lighter navy — hero/section background in the reference |
| `--color-ibi-accent` | `#35c5e3` | Cyan — border/text/icon color on the new secondary button |
| `--color-ibi-accent-dim` | `rgba(53, 197, 227, 0.12)` | Hover background for the new button, parallels `--color-accent-dim`'s convention |
| `--color-ibi-text-primary` | `#ffffff` | Headline text in the reference |
| `--color-ibi-text-muted` | `#b9c4d3` | Muted body-copy color in the reference (kept for future use; this project stays English/LTR for now) |

---

## Spacing scale

Base unit: **4px**. All spacing uses these tokens — no raw px values in components.

| Token | Value | Common use |
|---|---|---|
| `--space-1` | 4px | Tiny gaps (icon + label) |
| `--space-2` | 8px | Tight internal padding |
| `--space-3` | 16px | Default component padding (mobile) |
| `--space-4` | 24px | Default component padding (desktop), card padding |
| `--space-5` | 32px | Section gaps |
| `--space-6` | 48px | Section padding (footer, features) |
| `--space-8` | 64px | Large section separators |
| `--space-10` | 80px | Hero / page-level padding |

---

## Typography

Fonts loaded via Next.js font system (`var(--font-geist-sans)`, `var(--font-geist-mono)`).

| Role | Font | Size | Weight | Line height |
|---|---|---|---|---|
| Logo / code labels | Geist Mono | 15px | 600 | — |
| Nav links | Geist Sans | 14px | 500 | — |
| Card title (mobile) | Geist Sans | 16px | 600 | 1.3 |
| Card title (desktop) | Geist Sans | 18px | 600 | 1.3 |
| Card description (mobile) | Geist Sans | 14px | 400 | 1.6 |
| Card description (desktop) | Geist Sans | 15px | 400 | 1.6 |
| Footer / captions | Geist Sans | 13px | 400 | 1.5 |
| Score numeral | Geist Mono | 28px | 700 | — |
| Display headline (IBI) | Geist Sans | 40px mobile / 72px desktop | 800 | 1.05 |

Score numeral is fixed at 28px across every breakpoint (a compact number doesn't need responsive scaling) — first numeral-emphasis role in the system; Mono was chosen to match "Logo / code labels" for a scoreboard-like character distinct from body/heading text.

Display headline is by far the largest role in the system, introduced for the IBI brand refresh's hero-scale headlines (e.g. "CREATING WEALTH" in the reference mockup). Also uses `text-transform: uppercase` and `letter-spacing: -0.01em`, `color: var(--color-ibi-text-primary)`. No new font family — reuses Geist Sans at a much bolder weight/size rather than introducing a brand typeface, since none was supplied.

---

## Breakpoints

Mobile-first. All components start at mobile and layer up.

| Name | Min-width | Notes |
|---|---|---|
| mobile | — | Default (no media query) |
| tablet | 768px | Navbar grows to 64px; padding shifts to `--space-4` |
| desktop | 1024px | Typography scales up; grid columns increase |

Max content width: **1080px**, centered with `margin: 0 auto` — for marketing/content pages (homepage, skills).

Compact app-screen container widths (auth/interactive screens, not marketing content):
- **420px** — single-card screens (e.g. sign-in)
- **640px** — screens with a two-column layout at tablet+ (e.g. the dice game board's two-player scoreboard)

Both centered the same way; pick whichever fits the content, don't stretch a single-card screen to 640px or squeeze a two-column layout into 420px.

---

## Border radius

| Context | Radius |
|---|---|
| Cards | 12px |
| Icon badges | 10px |
| Focus ring offset elements | 2–4px |
| Buttons | 8px — consistent with Hero implementation; softer than card radius to feel actionable |
| Pill badges (stat chips, counters) | 100px (`--radius-pill`) — full pill; distinguishes read-only metadata from interactive buttons |

---

## Interaction states

Consistent patterns across all interactive elements:

| State | Pattern |
|---|---|
| Hover (text links) | `color: var(--color-text-primary)`, `transition: color 150ms ease` |
| Hover (cards) | `background: --color-surface-raised`, border shifts to `rgba(79,142,247,0.3)`, `translateY(-2px)` |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` |
| Reduced motion | Suppress `transform` transitions; keep color transitions |

Touch targets: minimum **44×44px** on mobile.

---

## Elevation model

No box shadows. Elevation is expressed through background color steps:

```
bg → surface → surface-raised
#0d0d0d  →  #161616  →  #1e1e1e
```

---

## Component inventory

| Component | Location | Status |
|---|---|---|
| Navbar | `src/components/Navbar/` | Stable |
| Footer | `src/components/Footer/` | Stable |
| FeatureCard | `src/components/FeatureCard/` | Stable |
| Features (grid) | `src/components/Features/` | Stable |
| Hero | `src/components/Hero/` | Stable |
| Icons | `src/components/icons/` | Stable |
| PageHeader | `src/components/PageHeader/` | Planned — inner-page eyebrow + h1 + tagline pattern |
| SkillCard | `src/components/SkillCard/` | Planned — command badge + persona + responsibilities |
| PipelineFlow | `src/components/PipelineFlow/` | Planned — Track A / Track B visual flow |
| DiscordBanner | `src/components/DiscordBanner/` | Planned — community invite strip between Personas and Footer |
| VulnerabilityListButton | `src/components/VulnerabilityListButton/` | Planned — trigger button + modal for Nehemiah's 24 vulnerability classes |
| TokenCounter | `src/components/TokenCounter/` | Stable — pill badge in Navbar showing Claude Code tokens since last reset; includes inline reset button |
| PlayerSignIn | `src/components/PlayerSignIn/` | Stable — two-player Google sign-in gate for the dice game; `player2` slot also offers a "Play vs AI" choice (Secondary outline button pattern) that skips sign-in entirely |
| PlayerBadge | `src/components/PlayerBadge/` | Stable — reusable avatar + display name; used by PlayerSignIn and PlayerScoreCard |
| GameBoard | `src/components/GameBoard/` | Stable — dice game orchestrator: state, all API calls; during an AI opponent's turn, the `.actions` row (Roll/Hold) is temporarily replaced by a spinner + "AI is thinking…" status row (Loading spinner pattern), one action at a time |
| GameSetup | `src/components/GameSetup/` | Stable — winning-score form, reused for first game and every reset |
| NewGameModal | `src/components/NewGameModal/` | Stable — Modal-pattern wrapper around GameSetup for mid-game resets |
| PlayerScoreCard | `src/components/PlayerScoreCard/` | Stable — per-player scoreboard card (PlayerBadge + score numeral + turn indicator) |
| DiceFace | `src/components/DiceFace/` | Stable — pip-layout die display |
| IbiSecondaryButton | `src/components/IbiSecondaryButton/` | In progress — IBI-brand pill CTA (cyan outline + leading arrow); not yet used on any page |

---

## Pill with inline action pattern

First established for the TokenCounter reset button. Use when a read-only stat chip needs a single destructive-or-reset action without becoming a full button.

| Property | Value | Rationale |
|---|---|---|
| Outer element | `<div role="status">` | `<span>` cannot validly host a `<button>`; `<div>` preserves the live region |
| Action button visible size | 16×16px | Small enough to not overpower the metric |
| Action button hit area | 44×44px via `::after` with `inset: -14px` | Meets touch target minimum without layout impact |
| Action icon | `×` character, Geist Mono 12px weight 400 | No SVG needed; character is universally understood as "clear" |
| Action color (default) | `var(--color-text-secondary)` | Muted — does not compete with the primary metric value |
| Action color (hover) | `var(--color-text-primary)` | Brightens on hover to signal interactivity |
| Action color (active) | `var(--color-accent)` | Brief flash to confirm the tap registered |
| Action background | none | Transparent within the pill — no extra visual weight |
| Focus ring | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` | Standard pattern |

**ARIA contract:** outer `<div>` carries `role="status"` + `aria-live="polite"` + `aria-label` (updates after reset). The `<button>` carries `aria-label="Reset token counter"`.

---

## Modal / overlay pattern

First established for the Nehemiah vulnerability list popup. Use for all future modal dialogs.

| Property | Value | Rationale |
|---|---|---|
| Backdrop | `rgba(0,0,0,0.6)` fixed inset-0 | Sufficient contrast to focus attention without full black-out |
| Panel background | `var(--color-surface)` | Sits one step above page bg — elevation via color |
| Panel border | `1px solid var(--color-border)` | Consistent with card border |
| Panel radius | `12px` | Matches card radius |
| Panel max-width | `480px` (tablet+) | Comfortably lists text content; full-width minus margins on mobile |
| Panel max-height | `80dvh` with `overflow-y: auto` | Prevents overflow on short viewports |
| Panel padding | `var(--space-4)` | Standard card padding |
| Close button size | 44×44px min | Touch target rule |
| z-index | `100` | Above all page content |

**ARIA contract:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → modal title id. Focus moves to close button on open; returns to trigger on close. `Escape` closes.

---

## Secondary (outline) button pattern

First established implicitly in `VulnerabilityListButton`'s trigger; formalized here as *the* pattern for outline-style action buttons (e.g. "Sign in with Google") so future components reuse it instead of drifting.

| Property | Value |
|---|---|
| Background | transparent |
| Border | `1px solid var(--color-border)` |
| Text color | `var(--color-accent)` |
| Border radius | 8px |
| Padding | `var(--space-2) var(--space-3)` |
| Font | Geist Sans, 13px, 500 |
| Min height | 44px |
| Hover | `background: var(--color-accent-dim)`, `border-color: rgba(79,142,247,0.3)` |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` |
| Active | `opacity: 0.8` |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none` |

---

## IBI secondary button pattern (`IbiSecondaryButton`)

A **separate, brand-scoped** pattern from the one above — not a variant of it. Introduced for the IBI refresh, matching a reference mockup's pill CTA exactly. Deliberately kept distinct rather than merged into the pattern above, since the two differ in radius, color source, size, and always-visible-accent-border vs. neutral-until-hover — merging them would have meant changing the existing pattern's look wherever it's already used (e.g. `PlayerSignIn`), which this task explicitly ruled out. The two patterns will coexist until a future task decides to consolidate them on purpose.

| Property | Value |
|---|---|
| Background | transparent (composites over any dark background, not tied to one specific surface token) |
| Border | `1px solid var(--color-ibi-accent)` |
| Text color | `var(--color-ibi-accent)` |
| Border radius | `var(--radius-pill)` (100px — reused, not a new radius token) |
| Padding | `var(--space-3) var(--space-5)` |
| Icon | `ArrowLeftIcon` (18×18px, `stroke="currentColor"`, `aria-hidden="true"`), leading the label, gap `var(--space-2)` |
| Font | Geist Sans, 15px, 600 |
| Min height | 52px |
| Hover | `background: var(--color-ibi-accent-dim)` |
| Focus-visible | `outline: 2px solid var(--color-ibi-accent)`, `outline-offset: 3px` |
| Active | `opacity: 0.8` |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none` |

Renders as a real `<a>` when given an `href`, otherwise a real `<button>`.

---

## Primary (filled) button pattern

First filled/CTA button in the system, established for the dice game's "Start Game" action.

| Property | Value |
|---|---|
| Background | `var(--color-accent)` |
| Text color | `var(--color-bg)` — **not white**; see rationale below |
| Border | none |
| Border radius | 8px |
| Padding | `var(--space-3) var(--space-4)` |
| Font | Geist Sans, 15px, 600 |
| Min height | 44px |
| Hover | `background: var(--color-accent-hover)` |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` |
| Disabled | `background: var(--color-surface-raised)`, `color: var(--color-text-secondary)`, `cursor: not-allowed` |

**Text color rationale:** `--color-accent` (#4f8ef7) is a mid-brightness blue — white text on it sits close to the AA contrast floor for normal-weight text. Near-black text (`--color-bg`) on that same blue gives a much larger, safely-AA contrast margin. All future filled buttons on `--color-accent` should use `--color-bg` text, not white.

---

## Input field pattern

First form input in the system, established for the dice game's winning-score entry.

| Property | Value |
|---|---|
| Background | `var(--color-surface-raised)` |
| Border | `1px solid var(--color-border)` |
| Border radius | 8px |
| Padding | `var(--space-2) var(--space-3)` |
| Font | Geist Sans, 14px, 400 |
| Text color | `var(--color-text-primary)` |
| Min height | 44px |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` |
| Label | Always a real `<label htmlFor>` above the input (Footer/caption role) — never placeholder-only |

---

## Loading spinner pattern

First used inline (undocumented) in `PlayerSignIn`'s sign-in button; formalized after a second use (the dice game's Roll/Hold buttons) confirmed it as a real pattern, not a one-off.

| Property | Value |
|---|---|
| Size | 14×14px |
| Shape | circular, `border: 2px solid rgba(79,142,247,0.25)`, `border-top-color: var(--color-accent)` |
| Animation | `rotate(360deg)`, 700ms linear infinite |
| Reduced motion | `animation: none` under `prefers-reduced-motion: reduce` — pair with a text label (e.g. "Rolling…") so status is conveyed without motion |
| Usage | Replaces a button's icon while its action is in flight; button `disabled` for the duration |

---

## Dice face (pip layout) pattern

Established for the dice game board.

| Property | Value |
|---|---|
| Tile | square, `background: var(--color-surface-raised)`, `border: 1px solid var(--color-border)`, `border-radius: 8px` |
| Pip color | `var(--color-text-primary)` |
| Pip layout | standard six-sided die convention: 1 = center; 2 = opposite corners; 3 = diagonal + center; 4 = four corners; 5 = four corners + center; 6 = two columns of three |
| Empty state | no roll yet (`value` unset) — tile with no pips, `border-color: var(--color-border)`, doesn't imply any value |
| Accessible name | visually-hidden text "Die: {value}" per tile; pips themselves `aria-hidden` |

---

## Attribution pattern

For portfolio/author attribution on landing pages:

- **Primary placement:** Hero byline — `<p class="byline">Built by <a>Name</a></p>` inserted after the headline, before any code/demo block. "Built by " in `--color-text-secondary`, name in `--color-accent` with underline on hover.
- **Secondary placements:** Navbar external link (icon + label, same style as GitHub link); Footer second line.
- **Icon spec:** External-platform icons (GitHub, LinkedIn) live in `src/components/icons/index.tsx`, 18×18px SVG, `fill="currentColor"`, `aria-hidden="true"`.
- **LinkedIn icon:** Added alongside GitHub in the icons file. Navbar label hidden on mobile (`display: none`), visible on tablet+ (`display: inline`).
- **Contrast note:** `--color-accent` (#4f8ef7) on `--color-bg` (#0d0d0d) is WCAG AA compliant (~4.9:1).
