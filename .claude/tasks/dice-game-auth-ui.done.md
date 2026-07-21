# Task: Sign-In Screen (Google, Two Players)

Status: done
Track: A
Track reason: new UI surface, no existing pattern in the design system

## Problem
Players must authenticate before playing, but the assignment simulates both players on one page/browser rather than across devices — the UI needs a way for two people to each sign in with their own Google account, sequentially, in the same browser session, without losing either identity once the game starts.

## Goal
A sign-in screen where Player 1 and Player 2 each authenticate via Google Sign-In (one after another), after which the app holds both authenticated identities and lets the user proceed to the game board.

## Requirements
- "Sign in with Google" flow for Player 1, then a second "Sign in with Google" flow for Player 2, in the same browser tab/session
- Both players' identities (uid, display name/avatar, ID token) are retained client-side simultaneously so gameplay can alternate turns without re-authenticating each turn
- Clear indication of which player still needs to sign in, and a way to proceed to the game once both have
- No game logic here — this screen only handles authentication and identity display

## Constraints
- Use the Firebase client SDK (Google provider), matching the backend verification approach from `dice-game-auth-backend`
- Depends on `dice-game-auth-backend`'s token contract

## Out of scope
- Game board, gameplay actions, persistence across page reloads (re-auth on refresh is acceptable for this assignment)

## Design Brief

## Design Brief: Two-Player Google Sign-In Screen

### Layout
- Full-viewport wrapper: `min-height: 100dvh`, `display: flex`, `align-items: center`, `justify-content: center`, `background: var(--color-bg)`, outer padding `var(--space-3)` mobile / `var(--space-4)` tablet+. This screen **is** `src/app/page.tsx`'s content for now (the page currently renders an empty `<main>`) — replace it with this screen.
- Card: `max-width: 420px`, `width: 100%`, `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 12px`, `padding: var(--space-4)`. Internal vertical stack, `gap: var(--space-4)`.
- Card contents, top to bottom: heading → caption → player slot list (`gap: var(--space-3)` between the two slots) → primary CTA.
- **PlayerSlot row, mobile (<768px):** stacks vertically — badge/placeholder row, then the action element (button or status) full-width below it, `gap: var(--space-2)`.
- **PlayerSlot row, tablet+ (≥768px):** single row — badge/placeholder on the left, action element on the right, `display: flex`, `justify-content: space-between`, `align-items: center`, `gap: var(--space-3)`.
- No desktop-specific layout change beyond the tablet breakpoint — this is a small, centered card at every size, consistent with the modal pattern's max-width philosophy even though this isn't a modal.

### Component hierarchy
- **`PlayerSignIn`** (new, `src/components/PlayerSignIn/`) — owns the two-slot sign-in flow. Renders the card, heading, caption, two `PlayerSlot`s (internal, not their own component — thin enough to stay inline in `PlayerSignIn.tsx`), and the `StartGame` button. Props: `onReady: (player1: AuthedPlayer, player2: AuthedPlayer) => void`.
- **`PlayerBadge`** (new, `src/components/PlayerBadge/`) — reusable avatar + display name, used inside a signed-in `PlayerSlot` here and reusable by `dice-game-board-ui` later (e.g. to show whose turn it is). Props: `displayName: string`, `photoURL: string | null`, `size?: "sm" | "md"` (sm = 40px mobile default, md = 48px desktop — component picks its own default per breakpoint via CSS, `size` prop is an override for later reuse, not required here).
- Icons: add a Google "G" mark and a checkmark icon to `src/components/icons/index.tsx`, following the existing icon file's pattern.
- Shared type: `AuthedPlayer` goes in a new top-level `src/types/player.ts` (per the "types shared across components → top-level `types/`" rule), since both this task and `dice-game-board-ui` need it:
  ```ts
  export interface AuthedPlayer {
    uid: string;
    displayName: string;
    email: string | null;
    photoURL: string | null;
    getIdToken: () => Promise<string>;
  }
  ```
  `getIdToken` is a bound method, not a captured string — see Implementation Notes below for why this matters.
- `src/app/page.tsx` — becomes the orchestrator: holds `player1`/`player2` state (`AuthedPlayer | null` each), renders `<PlayerSignIn onReady={...}>` until both are set. Once both are set, render a minimal placeholder (e.g. "Both players ready — game board coming in the next task") rather than attempting to fake `dice-game-board-ui`'s UI. Do not build any game board here.

### Spacing & sizing
- Card padding: `var(--space-4)` (24px) at all breakpoints — matches the existing "card padding" token usage.
- Outer wrapper padding: `var(--space-3)` mobile, `var(--space-4)` tablet+.
- Gap between card sections: `var(--space-4)`.
- Gap between the two player slots: `var(--space-3)`.
- PlayerSlot internal padding: `var(--space-3)` mobile, `var(--space-4)` tablet+.
- Avatar size: 40px mobile, 48px desktop (≥1024px is fine as the breakpoint for this bump, or tablet — designer's call left to whichever is simpler to implement alongside the row-layout breakpoint at 768px; using 768px for both is simplest).
- All interactive elements meet the 44×44px minimum touch target (buttons already do via padding + min-height).

### Color & typography
- Heading ("Sign in to play"): reuse **Card title** role — 16px/600/1.3 mobile, 18px/600/1.3 desktop, `color: var(--color-text-primary)`. No new token.
- Caption ("Both players sign in with their own Google account to start."): reuse **Footer/caption** role — 13px/400/1.5, `color: var(--color-text-secondary)`.
- Signed-in player name (inside `PlayerBadge`): reuse **Nav link** role — 14px/500, `color: var(--color-text-primary)`.
- "Player 1" / "Player 2" placeholder label (before sign-in) and "Signed in" status text: **Footer/caption** role, 13px/400, `color: var(--color-text-secondary)`.
- Error text: **Footer/caption** role, 13px/400, `color: var(--color-error)` (**new token**, added to `globals.css` and documented below).
- **New color tokens** (added to `globals.css` and the Color tokens table — no error/danger token existed before this):
  - `--color-error: #ff6b6b` — inline sign-in error text. Contrast-checked against both `--color-bg` (#0d0d0d) and `--color-surface` (#161616): comfortably AA-compliant for normal text.
  - `--color-error-dim: rgba(255, 107, 107, 0.12)` — reserved for a subtle error background if ever needed (parallels `--color-accent-dim`); not required for this screen's current design but documented for consistency.

### New pattern: Secondary (outline) button
Not previously a documented system pattern, but it already exists in code (`VulnerabilityListButton`'s `.vulnButton`) — formalizing it here as **the** pattern for "Sign in with Google" and any future outline-style action button, so it doesn't get reinvented differently next time:
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
| Disabled (e.g. mid sign-in) | `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`, label replaced with a small inline spinner + "Signing in…" |

Use this exact pattern for the "Sign in with Google" buttons (icon + label: Google "G" mark at 18×18px, `aria-hidden="true"`, then the text).

### New pattern: Primary (filled) button
First filled/CTA button in the system — needed for "Start Game":
| Property | Value |
|---|---|
| Background | `var(--color-accent)` |
| Text color | `var(--color-bg)` (**not** white — see rationale below) |
| Border | none |
| Border radius | 8px |
| Padding | `var(--space-3) var(--space-4)` |
| Font | Geist Sans, 15px, 600 |
| Min height | 44px |
| Width | 100% (full-width CTA) |
| Hover | `background: var(--color-accent-hover)` |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` |
| Disabled (until both players signed in) | `background: var(--color-surface-raised)`, `color: var(--color-text-secondary)`, `cursor: not-allowed` |

**Rationale for `--color-bg` text instead of white**: `--color-accent` (#4f8ef7) is a mid-brightness blue — white text on it sits close to the AA contrast floor for normal-weight text. Near-black text (`--color-bg`, #0d0d0d) on that same blue gives a much larger, safely-AA contrast margin. Document this in the design system so future filled buttons on `--color-accent` follow the same choice rather than defaulting to white.

### Interaction states
- **Sign-in button, default:** see Secondary button pattern above.
- **Sign-in button, loading:** disabled, inline spinner + "Signing in…", per pattern above.
- **Sign-in button, error:** button re-enabled (so the player can retry), an inline error message appears below the row using the error color/role above. Two distinct messages needed (see Accessibility/copy below): generic failure, and "same account used twice."
- **Slot, signed in:** button is replaced entirely by a checkmark icon (`--color-accent`, 18px, `aria-hidden="true"`) + "Signed in" caption text; the `PlayerBadge` (avatar + name) replaces the "Player N" placeholder on the left.
- **Start Game button, disabled → enabled:** transitions the moment the second slot reports signed-in; no confirmation step needed, per pattern above.
- **Start Game button, hover/focus/disabled:** per Primary button pattern above.

### Accessibility
- Each sign-in button gets an explicit `aria-label` disambiguating which player it's for: `"Sign in with Google — Player 1"` / `"Sign in with Google — Player 2"` (the visible label alone, "Sign in with Google," doesn't say which slot).
- Wrap each slot's status area (placeholder → loading → signed-in / error) in `aria-live="polite"` so screen reader users hear when a sign-in completes, mirroring the existing pill pattern's `role="status"` approach.
- Error messages use `role="alert"` so they interrupt and announce immediately (a failed sign-in is time-sensitive feedback, unlike the polite status update).
- Google "G" icon and the checkmark icon are decorative (`aria-hidden="true"`) — the accessible name comes from the button's `aria-label` or the adjacent "Signed in" text, never from the icon.
- `Start Game` button: reflects real `disabled` state; add `aria-describedby` pointing to a visually-hidden hint ("Both players must sign in first") while disabled, so screen reader users understand why it's inert rather than assuming it's broken.
- Standard focus-visible ring (`2px solid var(--color-accent)`, `3px` offset) on every interactive element — no custom outline removal.
- Tab order: Player 1 button/status → Player 2 button/status → Start Game button. All native `<button>` elements, so this is the default DOM order — no `tabindex` overrides needed.
- Avatars (`PlayerBadge` images) get `alt=""` (decorative — the adjacent name text already conveys identity) with a graceful fallback (initials on `--color-surface-raised`) when `photoURL` is null or fails to load.

### Implementation notes (non-visual, but load-bearing — read before coding)

1. **Env var fix required first**: `.env.local`'s Firebase config (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`) is server-only (not `NEXT_PUBLIC_`-prefixed). Add `NEXT_PUBLIC_FIREBASE_*` duplicates for the six values (don't rename the existing ones — `src/lib/auth` already reads the unprefixed versions server-side) so the Firebase **client** SDK can read them in the browser.

2. **Two simultaneous Google sessions require two Firebase App instances — this is the trickiest part of this task.** The Firebase JS Auth SDK normally holds exactly one active session per `Auth` instance in a browser tab; calling `signInWithPopup` a second time on the same default `Auth()` would sign Player 1 back out when Player 2 signs in. To have both genuinely signed in at once, initialize **two named Firebase apps** (Firebase explicitly supports this for exactly this multi-account-in-one-tab scenario):
   ```ts
   // one Auth instance per player slot, not the default app
   const player1App = initializeApp(firebaseConfig, "player1");
   const player2App = initializeApp(firebaseConfig, "player2");
   const player1Auth = getAuth(player1App);
   const player2Auth = getAuth(player2App);
   ```
   Each slot's "Sign in with Google" button calls `signInWithPopup` against its own instance. This guarantees both stay independently signed in and refreshable for the lifetime of the page, satisfying "retained client-side simultaneously... without re-authenticating each turn."
3. **Retain the live capability to fetch a fresh token, not a frozen string.** Firebase ID tokens expire after ~1 hour. Map each `signInWithPopup` result to `AuthedPlayer` by keeping `getIdToken: () => user.getIdToken()` (bound to that specific `User` object from that player's own `Auth` instance) rather than capturing today's token as a static string. This costs nothing extra now, and saves `dice-game-board-ui` from a silent expired-token bug in a longer game session.
4. **Guard against the same Google account signing in as both players**: after Player 2's popup resolves, compare `uid` to Player 1's `uid`; if equal, reject it (sign that instance back out, show the "already Player 1" error from Interaction States above) rather than letting `onReady` fire with two identical players — the backend's `POST /api/game` would reject this anyway (`player1Uid === player2Uid` → 400), but catching it in the UI gives a much clearer message than a generic API error.
5. Use `signInWithPopup` (not redirect) for both slots — keeps everything on one page/tab, matching "simulate on one page."

### Copy reference
- Heading: "Sign in to play"
- Caption: "Both players sign in with their own Google account to start."
- Sign-in button label: "Sign in with Google"
- Loading label: "Signing in…"
- Signed-in status: "Signed in"
- Generic error: "Sign-in failed. Try again."
- Duplicate-account error: "This Google account is already Player 1. Use a different account for Player 2."
- Start Game button: "Start Game"
- Disabled-state hint (visually hidden, for `aria-describedby`): "Both players must sign in first."

## Implementation Notes
- Files created:
  - `src/types/player.ts` — shared `AuthedPlayer` type
  - `src/lib/firebase/client.ts` — `getPlayerAuth(slot)`, resolving/initializing one named Firebase app + `Auth` instance per player slot (dual-app pattern from the brief), reading config from `NEXT_PUBLIC_FIREBASE_*` env vars
  - `src/components/PlayerSignIn/` (`.tsx`, `.module.css`, `.utils.ts`, `.constants.ts`, `.types.ts`) — the two-slot sign-in screen
  - `src/components/PlayerBadge/` (`.tsx`, `.module.css`, `.utils.ts`, `.types.ts`) — reusable avatar + name
  - Extended `src/components/icons/index.tsx` with `GoogleIcon` (official 4-color mark, not `currentColor`) and `CheckIcon` (`currentColor`, per the existing icon spec)
  - Exported both new components from `src/components/index.ts`
- Files modified:
  - `src/app/page.tsx` — replaced the empty shell with the orchestrator: holds `[player1, player2] | null` state, renders `<PlayerSignIn onReady={...}>` until both are set, then a minimal placeholder text naming both players (explicitly not a game board — that's `dice-game-board-ui`)
  - `.env.local` — added `NEXT_PUBLIC_FIREBASE_API_KEY`/`AUTH_DOMAIN`/`PROJECT_ID`/`STORAGE_BUCKET`/`MESSAGING_SENDER_ID`/`APP_ID`, duplicating the existing server-only values (not renaming them — `src/lib/auth` still reads the unprefixed versions)
  - `package.json`/`package-lock.json` — added `firebase` (client SDK) dependency
- **Dual Firebase app pattern implemented exactly as specified**: `getPlayerAuth(slot)` in `src/lib/firebase/client.ts` looks up an existing named app via `getApps().find(app => app.name === slot)` before calling `initializeApp(config, slot)`, so it's safe to call repeatedly (guards against React re-render/double-invocation re-initializing and throwing "app already exists"). Each slot's `signInWithPopup` runs against its own `Auth` instance, so both players stay independently signed in.
- **Duplicate-account guard**: implemented in `PlayerSignIn.tsx`'s `handleSignIn` — after a popup resolves, compares the new uid against whichever *other* slot already has a signed-in player (order-independent, not hardcoded to "player2 checks against player1"), and if they match, signs that instance back out and shows the duplicate-account error instead of accepting it.
- **`getIdToken` is a bound method, not a captured string** — `PlayerSignIn.utils.ts`'s `signInSlotWithGoogle` returns `getIdToken: () => user.getIdToken()`, closing over the actual Firebase `User` object from that slot's popup result, exactly per the brief's token-freshness note.
- Used a plain `<img>` (not `next/image`) for the avatar in `PlayerBadge` — Google profile photo URLs are on `lh3.googleusercontent.com`, which would need a `remotePatterns` entry in `next.config.ts` to work with `next/image`; a plain `<img>` with an `onError` fallback to initials avoids adding that config surface for one avatar image. No ESLint is configured in this project (checked — no `eslint.config.*`/`.eslintrc*`, no lint script in `package.json`), so this isn't a build-breaking concern either way.
- New design tokens/patterns used: `--color-error` (error token), Secondary/outline button pattern (sign-in buttons), Primary/filled button pattern (Start Game) — all as added to `docs/DESIGN_SYSTEM.md` by the designer; no additional new tokens invented.
- Deviations from brief: none. One layout clarification made while implementing — the brief left the avatar-size breakpoint (768px vs 1024px) as "designer's call, whichever's simpler"; used 768px (same breakpoint as the row-layout switch) since it avoids a second breakpoint just for avatar sizing.

**Verification performed**:
- `npx tsc --noEmit` and `npm run build` both pass; `/` still builds as a static-eligible route, all existing API routes unaffected.
- Ran `npm run dev` and fetched `/` — confirmed 200 response, and the server-rendered HTML contains the expected content ("Sign in to play", two "Player 1"/"Player 2" labels, four occurrences of "Sign in with Google" text — 2 visible button labels + 2 `aria-label`s, one per player — and the "Start Game" button).
- Confirmed the `NEXT_PUBLIC_FIREBASE_*` values are actually inlined into the client JS bundle (grepped the compiled chunk for the API key and project ID) — the Firebase client SDK will receive real config in the browser, not `undefined`.
- **Could not test the actual interactive flow** (clicking "Sign in with Google," completing Google's real OAuth popup, confirming two simultaneous sessions truly stay independent, confirming the duplicate-account guard fires against a real second account, confirming `POST /api/game` accepts the resulting tokens) — this requires a real browser with real Google accounts, which isn't available in this environment. This is the same category of gap flagged in `dice-game-auth-backend` and `dice-game-api`: the individual pieces (dual-app initialization logic, token-binding, duplicate-uid comparison, bundle config) are verified as far as static analysis and server-rendering allow; the first real end-to-end run (two actual Google sign-ins → `POST /api/game` succeeding) still needs to happen, ideally as part of closing this task or early in `dice-game-board-ui`.

## Verification
- [x] "Sign in with Google" flow for Player 1, then Player 2, same tab — `PlayerSignIn.tsx:69-70` renders both slots; each independently calls `signInSlotWithGoogle(slot)` (`PlayerSignIn.utils.ts:5-17`) via `signInWithPopup`, no navigation/redirect
- [x] Both players' identities retained client-side simultaneously, no re-auth per turn — confirmed via code read: `getPlayerAuth(slot)` (`client.ts:15-23`) initializes a *named* Firebase app per slot and looks up the existing one on repeat calls (`getApps().find(...)`), so Player 1's session isn't overwritten when Player 2 signs in on a different named app; `AuthedPlayer.getIdToken` (`types/player.ts`) is a bound closure over the real `User` object (`PlayerSignIn.utils.ts:15`), not a snapshot, so tokens stay fetchable later without re-auth. **Not yet confirmed with a real second Google account** — see the gap noted above.
- [x] Clear indication of which player still needs to sign in, way to proceed once both have — `PlayerSlotRow` shows the "Player N" placeholder before sign-in and the `PlayerBadge` + "Signed in" + checkmark after (`PlayerSignIn.tsx:104-134`); `Start Game` button `disabled={!bothSignedIn}` (`PlayerSignIn.tsx:76`) with an `aria-describedby` hint while disabled
- [x] No game logic in this screen — read through `PlayerSignIn.tsx`/`.utils.ts`/`PlayerBadge.tsx`: no score/turn/dice concepts anywhere, only auth state (idle/loading/signed_in/error) and identity display
- [x] Uses Firebase client SDK (Google provider), matches backend token contract — `GoogleAuthProvider` + `signInWithPopup` (`PlayerSignIn.utils.ts:1,7-8`); `AuthedPlayer.getIdToken()` produces the same Firebase ID token shape `src/lib/auth/verifyRequest.ts` expects as a bearer token (uid/displayName/email/photoURL align with `PlayerProfile`)

Every Design Brief requirement (layout, component hierarchy, new button patterns, accessibility contract, copy) also checked against the code and matches — not re-listing line-by-line here since the brief itself is long, but spot-checked: `aria-label` disambiguation (`PlayerSignIn.tsx:123`), `role="status"`/`aria-live="polite"` on slot content (`PlayerSignIn.tsx:103`), `role="alert"` on errors (`PlayerSignIn.tsx:138`), Secondary/Primary button CSS matches the documented token values (`PlayerSignIn.module.css`).

## Completion Summary
Built a two-player Google sign-in screen using two independently-named Firebase app instances (the documented fix for Firebase Auth's one-session-per-instance limitation), with a duplicate-account guard and identities that retain a live `getIdToken()` closure rather than a frozen token. Verified by code inspection and server-rendering checks; the real interactive OAuth flow (two live Google accounts) was not exercised in this environment — user opted to skip a manual test now and combine it with the game board's manual test later instead. User confirmed. Closed 2026-07-21.

Build (`npm run build`) re-run independently and passes. Independently re-fetched `/` and re-confirmed the expected server-rendered content and that `NEXT_PUBLIC_FIREBASE_*` values are inlined in the client bundle (not just trusting the developer's grep — ran it myself).

**One requirement not fully verifiable at this stage, flagged rather than silently passed**: "Both players' identities... retained client-side simultaneously so gameplay can alternate turns without re-authenticating each turn" — the code is correct by inspection (dual named Firebase apps is the documented, intentional fix for exactly this requirement), but there is no environment here to actually click through two real Google sign-ins and confirm it holds at runtime. Recommend a manual smoke test (two real Google accounts, one browser tab) before/alongside closing `dice-game-board-ui`, since that's the first task that will actually exercise this end-to-end.
