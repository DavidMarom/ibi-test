# Task: Dice Game Board

Status: done
Track: A
Track reason: new UI surface, no existing pattern in the design system

## Problem
Once authenticated, players need a way to actually play the game — see live state and take actions — with the frontend containing zero game rules, purely reflecting and driving server state.

## Goal
A game board screen that displays full game state and lets the active player roll or hold, calling the backend API for every action.

## Requirements
- Shows both players (names/avatars from their Google profiles), each one's global score, whose turn it is, current round score, and the configured winning score
- Roll button: calls the roll API; disabled when it's not the calling player's turn or the game is finished
- Hold button: calls the hold API; same enablement rules as Roll
- Displays dice results after each roll
- Shows a clear win state when a player reaches the winning score, naming the winner
- "New game" control, with the ability to set the winning score (default 100) before starting
- Every action goes through the backend API (`dice-game-api`) — this screen must not compute scores, validate turns, or decide bust/win itself; it only renders what the API returns and forwards user intent
- Uses whichever authenticated identity (from `dice-game-auth-ui`) matches "whose turn it is" to make the actual API call

## Constraints
- Depends on `dice-game-api` and `dice-game-auth-ui`

## Out of scope
- Bust animation/delay, sound effects, AI opponent, win-count tracking, persistence (all backlogged)

## Design Brief

## Design Brief: Dice Game Board

### Layout
- Board container: `max-width: 640px` (new size decision — roomier than the 420px sign-in card since this screen has two player cards side by side; documented below), centered (`margin: 0 auto`), padding `var(--space-3)` mobile / `var(--space-4)` tablet+.
- Three stacked sections, top to bottom, `gap: var(--space-4)`:
  1. **Scoreboard** — two `PlayerScoreCard`s
  2. **Play area** — round score, dice, bust message (if any), error message (if any), Roll/Hold buttons — OR the win banner + "New Game" CTA when finished
  3. A small "New Game" trigger (secondary button) is always available near the top of the play area *while a game is in progress*; once finished, it's replaced by a prominent primary "New Game" button in the play area itself (see Interaction States).
- **Mobile (<768px):** `PlayerScoreCard`s stack vertically, full width. Roll/Hold buttons sit side by side, each `flex: 1` (equal width).
- **Tablet+ (≥768px):** `PlayerScoreCard`s sit side by side (`display: grid`, `grid-template-columns: 1fr 1fr`, `gap: var(--space-3)`). Roll/Hold stay side by side, same equal-width rule.
- **Before any game exists** (first mount): the Scoreboard/Play-area layout doesn't apply yet — render `GameSetup` full-page instead (see Component hierarchy), inside a card matching the sign-in screen's card treatment (`max-width: 420px`, same padding/border/radius) for visual continuity with the previous screen.

### Component hierarchy
- **`GameBoard`** (new, `src/components/GameBoard/`) — top-level orchestrator, mounted from `src/app/page.tsx` once both players are signed in (replacing the current placeholder text). Owns all state: current game state (or `null` before the first game), loading flag, error message, and whether the New-Game modal is open. Makes every API call (see Implementation Notes for the exact request flow). Props: `player1: AuthedPlayer`, `player2: AuthedPlayer`.
- **`GameSetup`** (new, `src/components/GameSetup/`) — a lean, reusable "pick a winning score and submit" form. Props: `defaultWinningScore: number`, `onSubmit: (winningScore: number) => void`, `submitLabel: string`, `isLoading?: boolean`. Used in two contexts by `GameBoard`: full-page before the first game exists, and inside `NewGameModal` for every subsequent reset. Contains the winning-score number input (new **Input field** pattern, see below) and a Primary button (`submitLabel` as its text).
- **`NewGameModal`** (new, `src/components/NewGameModal/`) — thin wrapper applying the existing **Modal / overlay pattern** (already documented in `docs/DESIGN_SYSTEM.md`) around a `GameSetup` instance. Follow `VulnerabilityListButton.tsx`'s existing implementation approach exactly (portal via `createPortal(..., document.body)`, `mounted` guard for SSR, focus-trap-lite: focus moves to close button on open, returns to trigger on close, `Escape` closes) — per the `## Development` learnings entry on why `position: fixed` needs a portal here. Not extracting a shared `Modal` component from `VulnerabilityListButton` in this task — out of scope, follow the same pattern, don't share code.
- **`PlayerScoreCard`** (new, `src/components/PlayerScoreCard/`) — wraps the existing `PlayerBadge` (reused, `size="md"`) + a large score numeral + a "Current turn" indicator pill when active. Props: `displayName: string`, `photoURL: string | null`, `score: number`, `isCurrentTurn: boolean`.
- **`DiceFace`** (new, `src/components/DiceFace/`) — a square tile showing a standard six-sided pip layout for a 1–6 value, or an empty/muted placeholder when `value` is `null` (no roll yet this game). Props: `value: number | null`.
- Reused as-is: `PlayerBadge`, Secondary/Primary button patterns, Modal pattern, `docs/LEARNINGS.md`'s portal-for-fixed-position guidance.

### Spacing & sizing
- Board container: `max-width: 640px` (new — first "app-style" screen wider than the 420px auth card but narrower than the 1080px marketing content width; documented in the design system as a third container size for this kind of compact interactive screen).
- Section gap: `var(--space-4)`.
- `PlayerScoreCard` padding: `var(--space-3)` mobile / `var(--space-4)` tablet+, matching the existing card-padding convention.
- Gap between the two `PlayerScoreCard`s: `var(--space-3)`.
- `DiceFace` tile size: 44px mobile / 56px desktop (desktop bump at 1024px, matching the existing breakpoint semantics for "typography/sizing scales up").
- Gap between the two dice: `var(--space-2)`.
- Roll/Hold button row gap: `var(--space-2)`.
- All interactive elements meet 44×44px minimum.

### Color & typography
- **New typography role — "Score numeral"**: Geist Mono, 28px, 700, `color: var(--color-text-primary)`, same size at every breakpoint (a compact number doesn't need responsive scaling). Used for each player's global score in `PlayerScoreCard`. This is the first numeral-emphasis role in the system — Mono was chosen (matching the existing "Logo / code labels" use of Geist Mono) to give scores a slightly technical, scoreboard-like character distinct from body/heading text.
- Round score line ("Round score: 12"): reuse **Card title (desktop)** role, 18px/600, `color: var(--color-text-primary)`, at all breakpoints (short enough not to need mobile/desktop differentiation).
- "Playing to {N}" winning-score caption: reuse **Footer/caption** role, 13px/400, `color: var(--color-text-secondary)`.
- "Current turn" pill text: 13px/500, `color: var(--color-accent)`, background `var(--color-accent-dim)` — reusing the exact token pair already established for the sign-in button's hover state, not new values.
- Bust message ("Bust — round score lost."): reuse **Footer/caption** role, `color: var(--color-error)`.
- Error banner text: same as the sign-in screen's error pattern — 13px/400, `color: var(--color-error)`, `role="alert"`.
- **Win banner**: background `var(--color-accent-dim)`, border `1px solid var(--color-accent-border)`, radius 12px, padding `var(--space-4)` — reusing existing accent-dim/accent-border tokens rather than introducing a "success green," which would clash with this system's blue-accent-only palette. Heading text ("🏆 {winner} wins!") reuses **Card title** role; a caption line below ("Final score: {winner score} – {loser score}") reuses **Footer/caption** role. Plain emoji (🏆) used instead of a new SVG icon — no new icon needed for a single celebratory glyph.

### New pattern: Input field
First form input in the system — needed for the winning-score entry (both the full-page setup and the New Game modal use it):
| Property | Value |
|---|---|
| Background | `var(--color-surface-raised)` |
| Border | `1px solid var(--color-border)` |
| Border radius | 8px |
| Padding | `var(--space-2) var(--space-3)` |
| Font | Geist Sans, 14px, 400 |
| Text color | `var(--color-text-primary)` |
| Min height | 44px |
| Focus-visible | `outline: 2px solid var(--color-accent)`, `outline-offset: 3px` (standard pattern) |
| Label | Always a real `<label htmlFor>` above the input — **Footer/caption** role, never placeholder-only |

### New pattern: Loading spinner
Already implemented once (inline, undocumented) in `PlayerSignIn`'s sign-in button; formalizing now since a second use (Roll/Hold buttons here) makes it a real pattern:
| Property | Value |
|---|---|
| Size | 14px × 14px |
| Shape | circular, `border: 2px solid rgba(79,142,247,0.25)`, `border-top-color: var(--color-accent)` |
| Animation | `rotate 360deg`, 700ms linear infinite |
| Reduced motion | `animation: none` under `prefers-reduced-motion: reduce` — the adjacent label text (e.g. "Rolling…") already conveys status without motion |
| Usage | Replaces the button's icon (if any) while an action is in flight; button `disabled` during this state |

### New pattern: Dice face (pip layout)
| Property | Value |
|---|---|
| Tile | square, `background: var(--color-surface-raised)`, `border: 1px solid var(--color-border)`, `border-radius: 8px` |
| Pip color | `var(--color-text-primary)` |
| Pip layout | standard six-sided die conventions: 1 = center; 2 = opposite corners; 3 = diagonal + center; 4 = four corners; 5 = four corners + center; 6 = two columns of three |
| Empty state (`value === null`) | tile shown with no pips (or a faint centered `–`), `border-color: var(--color-border)`, signals "no roll yet" without implying a value |
| Accessible name | visually-hidden text "Die: {value}" per tile (see Accessibility) |

### Interaction states
- **Roll / Hold buttons**: Roll uses the **Primary (filled)** pattern (the expected/default action each turn); Hold uses the **Secondary (outline)** pattern (the deliberate "stop and bank" action). Equal width, side by side, regardless of differing fill styles.
  - Default: enabled whenever a game is `in_progress` and no request is in flight.
  - Loading (that specific button clicked): spinner replaces any icon, label swaps to "Rolling…" / "Holding…", both Roll and Hold disabled until the request settles.
  - Not rendered at all when `status === "finished"` — replaced by the win banner + primary "New Game" button (there is nothing left to roll/hold).
  - **On "wrong turn"**: this UI never actually issues a call as the wrong player — see Implementation Notes for why "disabled when it's not the calling player's turn" doesn't have a distinct visual state here (there's no separate human identity making a mistaken click in this simulated single-screen model).
- **"New Game" trigger** (secondary button, visible while `in_progress`): opens `NewGameModal`. Once `status === "finished"`, this same action is presented as a full-width **Primary** button directly in the play area instead (replacing Roll/Hold) — promoted because it's now the only next action available.
- **`GameSetup` submit button**: Primary pattern; `disabled` + loading spinner while the create/reset request is in flight (mirrors the sign-in button's loading treatment).
- **Error banner**: appears below the Roll/Hold row (or below the setup form) on any failed API call; Roll/Hold (or submit) return to their normal enabled state immediately after, so the user can retry without being stuck.
- **`PlayerScoreCard`, current turn**: border color shifts from `var(--color-border)` to `var(--color-accent)`, plus the "Current turn" pill (text, not color-only, per the design system's "communicate hierarchy through size/weight, not color alone" principle).
- **Bust message**: appears inline near the dice immediately after a bust response (`wasBust: true`), no animation, no button disabling — the animated/blocking version is explicitly backlogged (Extra #4). This is a plain, always-visible text update, not a transient toast.

### Accessibility
- Round score, dice results, and bust message updates live inside one `role="status"` `aria-live="polite"` region (mirrors the sign-in screen's pattern) — screen reader users hear the outcome of each roll without needing to re-read the whole board.
- The win banner gets its own `role="alert"` (assertive, not polite) — a game-ending event is significant enough to interrupt, unlike a routine score tick.
- Each `DiceFace` carries a visually-hidden `<span>` (or `aria-label`) reading "Die: {value}" (or "Die: not rolled yet" when `null`); the pip dots themselves are decorative/`aria-hidden`.
- `GameSetup`'s winning-score input has a real `<label htmlFor>`, not placeholder-only labeling.
- `NewGameModal` reuses the existing Modal ARIA contract exactly: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → modal title id, `Escape` closes, focus moves to the modal on open and returns to the trigger button on close.
- Roll/Hold/Submit buttons: real `disabled` attribute reflects state; no `aria-disabled`-only fakery.
- Standard focus-visible ring on every interactive element, no exceptions.

### Implementation notes (non-visual, but load-bearing — read before coding)

1. **No auto-create on mount.** Render `GameSetup` full-page (inside a sign-in-card-style wrapper, both `PlayerBadge`s shown above it) until the user submits a winning score. This directly satisfies "'New game' control, with the ability to set the winning score (default 100) before starting" for the *first* game, not just resets — don't silently call `POST /api/game` with a hardcoded 100 on mount.
2. **Two different endpoints for "start"**: the very first game (when `GameBoard`'s state is `null`) calls `POST /api/game` with `{ player1Uid: player1.uid, player2Uid: player2.uid, winningScore }` — use `player1.getIdToken()` as the bearer (either player's token is valid as "caller" per the API contract; picking player1 is an arbitrary-but-consistent choice). Every subsequent "New Game" (via the modal, whether mid-game or after a win) calls `POST /api/game/new` with `{ winningScore }` only — the two players are already established server-side, no uids needed again.
3. **Determining who acts**: before every Roll/Hold call, pick `currentPlayerUid === player1.uid ? player1 : player2` and call `.getIdToken()` on it *fresh, at call time* (not a cached string) — same reasoning as the sign-in task, tokens expire ~1hr.
4. **No polling** — every API response (create, reset, roll, hold, and an optional initial `GET /api/game` if you want to reconcile on mount, though it's not required since this screen always creates fresh) already returns the full state shape. `setState` directly from each response; there is no need for a `GET`-based refresh loop.
5. **Error handling**: wrap every fetch in try/catch; on a non-OK response, parse `{ message }` from the JSON body and show it in the error banner; always clear the loading flag in a `finally` regardless of outcome.
6. **Why there's no "wrong turn, disabled" visual state**: the requirement "disabled when it's not the calling player's turn" is a defense-in-depth statement about the *backend* (already enforced in `dice-game-api`). In this UI, there is no separate "which human clicked" — the app always determines `currentPlayerUid` from the last response and calls the API as that player automatically (see note 3). The only realistic "can't act" states here are: no game yet, game finished, or a request already in flight — all covered above. Don't build a redundant "wrong player is trying to click" affordance; it can't happen through this UI's own controls.

### Copy reference
- Setup heading: "Ready to play"
- Winning score label: "Winning score"
- Setup submit (first game): "Start Game"
- Setup submit (reset, in modal): "Start New Game"
- New Game trigger (in-progress): "New Game"
- New Game trigger (finished, promoted to primary): "New Game"
- Modal title: "Start a new game?"
- Current turn pill: "Current turn"
- Round score line: "Round score: {n}"
- Winning score caption: "Playing to {n}"
- Bust message: "Bust — round score lost."
- Win banner heading: "🏆 {displayName} wins!"
- Win banner caption: "Final score: {winnerScore} – {loserScore}"
- Roll button: "Roll" / loading: "Rolling…"
- Hold button: "Hold" / loading: "Holding…"
- Generic error: "Something went wrong. Try again."

## Implementation Notes
- Files created:
  - `src/types/game.ts` — shared `GameStateResponse`/`PublicPlayer`/`DiceRoll` types matching `serializeSession`'s wire shape exactly
  - `src/lib/gameApi.ts` — thin fetch wrapper: `createGame`, `resetGame`, `rollDice`, `holdTurn`, all taking an `idToken` + args, returning `GameStateResponse` or throwing an `Error` with the API's `{ message }` on any non-OK response
  - `src/components/DiceFace/` (`.tsx`, `.module.css`, `.constants.ts`, `.types.ts`) — pip-layout die tile
  - `src/components/PlayerScoreCard/` (`.tsx`, `.module.css`, `.types.ts`) — wraps `PlayerBadge` + score numeral + turn pill
  - `src/components/GameSetup/` (`.tsx`, `.module.css`, `.utils.ts`, `.constants.ts`, `.types.ts`) — winning-score form, reused full-page and inside the modal
  - `src/components/NewGameModal/` (`.tsx`, `.module.css`, `.types.ts`) — Modal-pattern wrapper around `GameSetup`, implementation copied from `VulnerabilityListButton.tsx`'s portal/focus/Escape approach (controlled via `isOpen`/`onClose` props rather than owning its own trigger, since two different triggers — in-progress and finished-state — both need to open it)
  - `src/components/GameBoard/` (`.tsx`, `.module.css`, `.utils.ts`, `.constants.ts`, `.types.ts`) — the orchestrator
  - Exported all five new components from `src/components/index.ts`
- Files modified:
  - `src/app/page.tsx` — replaced the "both players ready" placeholder with `<GameBoard player1={...} player2={...}>`
- **Request flow implemented exactly per the brief's Implementation Notes**: no auto-create on mount (`GameBoard` renders `GameSetup` full-page while `gameState === null`); first game uses `POST /api/game` with both uids (`player1.getIdToken()` as bearer, arbitrary-but-consistent per the brief); every reset (mid-game or post-win) uses `POST /api/game/new` with just `{ winningScore }`, bearer from whichever player is currently resolved as "acting" (or `player1` if no game exists yet, though that path is unreachable via the UI since the modal only opens once a game exists); Roll/Hold resolve the acting player fresh via `resolveActingPlayer(gameState, player1, player2)` and call `.getIdToken()` at call time, not cached.
- **No "wrong turn" disabled state built** — per the brief's explicit reasoning, `GameBoard` always calls the roll/hold endpoints as whoever `currentPlayerUid` says is active; the only disable states implemented are: no active game (buttons not rendered), game finished (buttons not rendered, replaced by win banner + promoted "New Game"), and `isBusy` (any pending action in flight, covering roll/hold/setup/reset — including disabling the "New Game" trigger itself while another action is mid-flight, to avoid overlapping requests).
- **Error handling**: every handler (`handleCreate`/`handleReset`/`handleRoll`/`handleHold`) wraps its fetch in try/catch, sets `error` from the thrown message (or the generic fallback), and always clears `pendingAction` in a `finally` — so a failed request never leaves the UI stuck disabled.
- **`findPublicPlayer` throws** rather than returning `undefined` if a uid isn't found in `gameState.players` — this should be unreachable in practice (the board is only ever created with exactly `player1`/`player2`, and the backend's response always includes both), so treating it as a thrown invariant violation (rather than silently rendering `undefined` or requiring non-null assertions at every call site) seemed the more honest choice than pretending it's a normal, expected case.
- New design tokens/patterns used: `--color-accent-dim`/`--color-accent-border` (reused, not new, for the win banner — deliberately avoiding a new "success green" per the brief), Score numeral typography role, Input field pattern, Loading spinner pattern (now used a third time — sign-in, game setup, and here), Dice face pip pattern, and the new 640px board container width — all as documented by the designer in `docs/DESIGN_SYSTEM.md`; no additional values invented beyond what's specified there.
- Deviations from brief: none.

**Verification performed**:
- `npx tsc --noEmit` and `npm run build` both pass; all 4 game API routes and the sole page route (`/`) still build correctly.
- Ran `npm run dev` and fetched `/` — still returns 200 and renders the sign-in screen (expected: `players` state starts `null`, so `GameBoard` is gated behind real sign-in and can't be reached via a plain fetch).
- **Pure-logic unit tests** (ad-hoc `tsx` script, not committed) covering everything that doesn't require a browser or real auth:
  - `resolveActingPlayer` correctly picks whichever `AuthedPlayer` matches `currentPlayerUid`, and re-resolves correctly when it flips to the other player
  - `findPublicPlayer` returns the right record for a known uid, and throws for an unknown one (confirms the invariant-violation design decision actually behaves as intended)
  - `parseWinningScore` (from `GameSetup.utils.ts`) accepts valid positive integers and rejects zero, negative numbers, non-integers, non-numeric strings, and blank input
  - `DiceFace`'s `PIP_POSITIONS` map: every value 1–6 has exactly that many pips, all indices are within the 3×3 grid (0–8), no duplicates within a value, and odd values (1/3/5) include the center pip while even values (2/4/6) don't — confirms the pip layout is internally consistent with standard die conventions
  - All assertions passed.
- **Live end-to-end test against the real running server** (not mocked): called `src/lib/gameApi.ts`'s `createGame`/`rollDice`/`holdTurn`/`resetGame` functions from a script against `npm run dev`'s actual `/api/game*` routes with a deliberately invalid bearer token, and confirmed each one throws an `Error` whose message is exactly the API's real `"Invalid or expired token."` response — this proves the client's error-parsing path (fetch → non-OK response → extract `{ message }` → throw) works correctly against the real backend, not just in isolation.
- **What is still genuinely unverified, and needs a real browser + two real Google accounts**: the entire happy path — creating the first game, rolling, busting, holding, winning, and resetting, all through actual UI clicks with real ID tokens. Specifically still open:
  1. That `POST /api/game` succeeds with two real uids and a real bearer token (only the 401 rejection path has been exercised against the live server)
  2. That the scoreboard, turn indicator, dice, round score, and bust message all update correctly after a real roll response
  3. That the win banner appears and names the correct winner after a real game-ending hold
  4. That the "New Game" modal (both the in-progress secondary trigger and the post-win promoted primary trigger) opens, focuses the close button, closes on Escape/backdrop-click/close-button, and returns focus to whichever trigger opened it
  5. Visual/responsive check of the two-column scoreboard at the 768px breakpoint and the dice-tile size bump at 1024px
  
  This is the natural point to do that manual pass, since every piece this screen depends on (auth, API, rules engine) has already been individually verified — this is the first task where a human click-through would exercise the entire stack together.

## Verification
- [x] Shows both players (names/avatars), each score, whose turn, round score, winning score — `GameBoard.tsx:140-151` (two `PlayerScoreCard`s with `displayName`/`photoURL`/`score`/`isCurrentTurn`), `GameBoard.tsx:167-170,182-185` (winning score + round score text)
- [x] Roll button calls the roll API — `handleRoll` (`GameBoard.tsx:68-82`) calls `rollDice(token)` from `src/lib/gameApi.ts`
- [x] Hold button calls the hold API — `handleHold` (`GameBoard.tsx:84-98`) calls `holdTurn(token)`
- [x] Roll/Hold disabled when not the calling player's turn, or game finished — implemented functionally rather than as a distinct "wrong turn" visual state: `GameBoard.tsx:73,89` always resolves `resolveActingPlayer(gameState, player1, player2)`, so this UI structurally cannot call roll/hold as the wrong player; when `status === "finished"`, the buttons aren't rendered at all (`GameBoard.tsx:200-221`). **User confirmed this interpretation is acceptable** (declined the alternative of a separate visible "not your turn" control set per player).
- [x] Displays dice results after each roll — `GameBoard.tsx:186-189` renders two `DiceFace`s from `gameState.lastRoll`
- [x] Clear win state naming the winner — `GameBoard.tsx:172-179`, win banner with `role="alert"`, "🏆 {name} wins!" + final score line
- [x] "New game" control with ability to set winning score (default 100) before starting — for the *first* game: `GameBoard.tsx:105-127` renders `GameSetup` full-page (not auto-created), default 100 (`GameBoard.constants.ts`); for resets: `NewGameModal` wraps the same `GameSetup` component (`GameBoard.tsx:225-231`)
- [x] No game logic in the frontend — read `GameBoard.tsx`, `.utils.ts`, `gameApi.ts`, `GameSetup.tsx` in full: no score arithmetic, no bust/win decision, no turn-passing logic anywhere; every state transition comes directly from an API response
- [x] Uses whichever authenticated identity matches whose turn it is — `resolveActingPlayer` (`GameBoard.utils.ts`) compares `gameState.currentPlayerUid` against `player1.uid`/`player2.uid` and returns the matching `AuthedPlayer`; its fresh `.getIdToken()` is called at the point of each request (`GameBoard.tsx:74,90`), not cached

Build (`npm run build`) re-run independently and passes. Code read directly for every item above, not taken on the developer's word.

**This task is code-complete but not fully proven** — as both the developer and I agree, the entire interactive happy path (real sign-in → real game → roll/hold/bust/win/reset) has never actually run. Recommending to the user: a manual click-through with two real Google accounts before calling the whole goal done, since this is the first point where the full stack (all 5 tasks) would be exercised together.

## Completion Summary
Built the full dice game board — scoreboard with turn indicators (`PlayerScoreCard`), pip-style dice (`DiceFace`), round/winning score, a win banner, and a "New Game" flow reusing one `GameSetup` form for both the first game and every reset (via `NewGameModal`). Every action goes through `src/lib/gameApi.ts` to the real, previously-verified backend; no game logic lives in the frontend. The "Roll/Hold disabled when not your turn" requirement was implemented functionally (the UI always acts as whoever's turn it actually is, so a wrong-player click is structurally impossible) rather than as a separate visible "not your turn" state — user confirmed this is acceptable. Verified via typecheck/build, pure-logic unit tests, and a live error-path test against the running server; the full interactive happy path (real Google sign-in through to a real win) was never exercised in this environment — user opted to close the task now and do that manual pass themselves later. Closed 2026-07-21.
