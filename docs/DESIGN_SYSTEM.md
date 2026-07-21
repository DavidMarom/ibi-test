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

**Theme:** dark only (`color-scheme: dark` on `html`).

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

---

## Breakpoints

Mobile-first. All components start at mobile and layer up.

| Name | Min-width | Notes |
|---|---|---|
| mobile | — | Default (no media query) |
| tablet | 768px | Navbar grows to 64px; padding shifts to `--space-4` |
| desktop | 1024px | Typography scales up; grid columns increase |

Max content width: **1080px**, centered with `margin: 0 auto`.

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

## Attribution pattern

For portfolio/author attribution on landing pages:

- **Primary placement:** Hero byline — `<p class="byline">Built by <a>Name</a></p>` inserted after the headline, before any code/demo block. "Built by " in `--color-text-secondary`, name in `--color-accent` with underline on hover.
- **Secondary placements:** Navbar external link (icon + label, same style as GitHub link); Footer second line.
- **Icon spec:** External-platform icons (GitHub, LinkedIn) live in `src/components/icons/index.tsx`, 18×18px SVG, `fill="currentColor"`, `aria-hidden="true"`.
- **LinkedIn icon:** Added alongside GitHub in the icons file. Navbar label hidden on mobile (`display: none`), visible on tablet+ (`display: inline`).
- **Contrast note:** `--color-accent` (#4f8ef7) on `--color-bg` (#0d0d0d) is WCAG AA compliant (~4.9:1).
