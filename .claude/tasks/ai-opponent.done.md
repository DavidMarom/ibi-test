# Task: Add an AI opponent

Status: done
Track: A
Track reason: Introduces a new entry-point UI ("Play vs AI", skipping the second sign-in) and a new "AI is thinking..." turn indicator — neither exists in `docs/DESIGN_SYSTEM.md` yet, so this needs a Design Brief before implementation.

## Problem
Playing currently requires two real Google-signed-in players in the same browser (per the existing two-named-Firebase-apps pattern). There's no way to play solo against the computer when a second person isn't available.

## Goal
A single signed-in player can start and play a full game against a computer-controlled opponent, with no second sign-in required.

## Requirements
- Add a "Play vs AI" entry point that lets a single signed-in human start a game without a second Firebase sign-in — per user decision, this replaces the second sign-in step entirely for this mode (the existing two-human sign-in flow stays available as its own path).
- The AI opponent needs a stable identity (uid, display name, avatar) usable everywhere a real player's data is used today (`PlayerBadge`, `PlayerScoreCard`, win banner, `wins` pill) — without a real Firebase account or ID token behind it.
- The AI plays full turns automatically: rolling and holding according to one fixed, simple strategy (per user decision — no difficulty selection UI). Reasonable default to implement: hold once the current round's banked total would either win the game or cross a modest fixed threshold (e.g. somewhere in the 15–25 point range) — exact threshold is an implementation judgment call, not a hard spec.
- While it's the AI's turn, show a brief "AI is thinking..." indicator/delay (per user decision) before each of its rolls/holds resolves and becomes visible — reuse the existing dice-rolling animation/status patterns (`docs/DESIGN_SYSTEM.md`'s dice-roll status role) rather than inventing a new one from scratch; the Design Brief should specify exactly how "thinking" is presented (copy, duration, motion, reduced-motion behavior).
- The AI's win count should behave sensibly with the existing win-tally feature (`src/lib/dice-game/winStore.ts`, persisted in MongoDB) — either the AI accumulates its own tally like a real uid would, or AI games are excluded from the tally entirely. Pick whichever is simpler to implement correctly; state the choice explicitly in Implementation Notes so it can be revisited.

## Constraints
- **The core architectural wrinkle:** every existing move (`rollForPlayer`/`holdForPlayer` in `src/lib/dice-game/session.ts`) requires the caller's own verified Firebase bearer token, and rejects the call with `NOT_YOUR_TURN` unless the caller's uid matches `state.currentPlayer`. The AI has no real account and can never supply its own valid token — so triggering the AI's moves needs a deliberate, explicit exception to that check (e.g. allowing the registered human in the session to trigger a move when `currentPlayer` resolves to the AI's fixed uid), not a workaround that weakens auth for real human-vs-human games.
- **Avoid repeating the earlier "raw UID shown as name" bug class** (see `docs/LEARNINGS.md` Development section): the AI's fixed uid must never be visible as a raw string anywhere a display name is expected — `src/app/api/game/serialize.ts`'s `serializePlayer` currently falls back to the raw `uid` if `getPlayer(uid)` finds nothing, so the AI's profile needs to resolve to a real display name through whatever path `getPlayer` (or an equivalent) takes for it.
- Don't change how a human-vs-human (two real sign-ins) game behaves or is authorized — the AI carve-out must be additive, not a general loosening of the turn/ownership checks.
- No difficulty selection UI, no per-move AI configuration — one fixed strategy per the user's decision above.

## Out of scope
- Selectable AI difficulty levels or multiple strategies
- AI opponents "remembering" past games against a specific human (any personalization)
- Any change to the human-vs-human two-sign-in flow's behavior or auth model

## Design Brief

## Design Brief: AI opponent (entry point + turn indicator)

No new tokens, colors, radii, or type sizes are introduced anywhere in this brief — every piece reuses an existing documented pattern. Two surfaces change: `PlayerSignIn` (new "Play vs AI" choice) and `GameBoard` (new "AI is thinking…" status + AI-identity rendering, which needs no changes at all).

### Layout

**PlayerSignIn (`src/components/PlayerSignIn/`)**
- No structural change to the card, heading, caption, or `player1` slot row — a solo player still signs in via `player1`'s existing "Sign in with Google" button, unchanged.
- The `player2` slot row gets one addition: once `player2` has no player yet (`state.status !== "signed_in"`), render the existing "Sign in with Google" button **and**, below it, a text divider "or" followed by a new "🤖 Play vs AI" button. Both live inside the existing `.slotAction` container, stacked vertically on mobile, side-by-side at tablet+ (matches the card's existing mobile-stack → tablet-row pattern already used for `.slotContent`).
- Once "Play vs AI" is chosen, `player2`'s row collapses to the same "signed-in" visual state as a real sign-in (existing `.signedInStatus` treatment: check icon + label), just with the label "AI Opponent" and no check icon — use the 🤖 emoji in its place (same "emoji as icon, no SVG needed" reasoning already used for the 🏆 wins pill and win banner).
- No new "undo"/"change selection" affordance — consistent with the existing flow, which also has no visible way to reverse a real sign-in short of reloading the page. Don't add one just for AI selection.
- Start Game button: enabled exactly when `player1` is signed in AND (`player2` is signed in OR AI is selected) — same enablement shape as today, just OR'd with the new AI-selected state.

**GameBoard (`src/components/GameBoard/`)**
- Setup screen (pre-game, `!gameState`): unaffected — still shows both `PlayerBadge`s and the `GameSetup` form exactly as today; AI's `PlayerBadge` renders through the existing component with no changes (see Component hierarchy below).
- In-game screen: when `gameState.currentPlayerUid` is the AI's fixed uid and an AI move is in flight, the existing `.actions` row (Roll/Hold buttons) is replaced — not just disabled — by a single status row in the same position: spinner + "🤖 AI is thinking…" text, using the exact existing Loading spinner pattern (14×14px spinner already defined in `GameBoard.module.css`'s `.spinner`). Once the AI's move resolves, the row reverts to the normal dice/round-score display update (same as any human roll), and `.actions` reappears only once it's the human's turn again.
- If the AI takes multiple actions in one turn (e.g. rolls twice before holding), this thinking → reveal cycle repeats per action, exactly mirroring the pacing a human turn already has (one visible action at a time) — no batching multiple AI rolls into a single reveal.

### Component hierarchy

- **No new components.** `PlayerBadge`, `PlayerScoreCard`, the win banner, and the `wins` pill all keep working unmodified — the AI is just another `{ uid, displayName: "AI Opponent", photoURL: null, wins }` flowing through the exact same props these already accept. `PlayerBadge`'s existing initials-fallback (first character of `displayName`) renders "A" for the AI's avatar circle — acceptable, no new avatar treatment needed.
- `PlayerSignIn.tsx`: new "Play vs AI" `<button>` reusing the **Secondary (outline) button pattern** already in `docs/DESIGN_SYSTEM.md` — visually identical to the existing `.signInButton` (same background/border/radius/padding/font/hover/focus/active/disabled), just a different label/icon and click behavior (marks the `player2` slot ready immediately, no OAuth popup).
- `GameBoard.tsx`: new inline status element in place of `.actions`, reusing the existing `.spinner` class + a text label, following the same `role="status" aria-live="polite"` convention `PlayerSignIn`'s slot rows and the existing Loading spinner pattern already use.

### Spacing & sizing

- "Play vs AI" button: identical box model to `.signInButton` — `min-height: 44px`, padding `var(--space-2) var(--space-3)`, gap `var(--space-2)` between emoji and label.
- "or" divider: `font-size: 13px`, `color: var(--color-text-secondary)`, centered, `margin: var(--space-1) 0` — small enough not to compete with either button.
- AI-thinking status row: same footprint as the `.actions` row it replaces (`width: 100%`, `min-height: 44px`) so nothing shifts layout when it swaps in/out; spinner + label horizontally centered with `gap: var(--space-2)`, matching `.rollButton`/`.holdButton`'s internal `gap`.

### Color & typography

- "Play vs AI" button: exact `.signInButton` values — transparent background, `1px solid var(--color-border)`, text `var(--color-accent)`, Geist Sans 13px/500, hover `background: var(--color-accent-dim)` + `border-color: rgba(79,142,247,0.3)`, focus-visible `outline: 2px solid var(--color-accent)` / `outline-offset: 3px`, active `opacity: 0.8`.
- AI-selected state label ("🤖 AI Opponent"): same styling as `.signedInStatus` (Geist Sans 13px/400, `color: var(--color-text-secondary)`).
- "AI is thinking…" label: Geist Sans, 15px/600, `color: var(--color-text-primary)` — matches the weight/prominence of the button labels it temporarily replaces, so the row doesn't read as demoted/secondary.
- Spinner: identical existing values (`border: 2px solid rgba(79,142,247,0.25)`, `border-top-color: var(--color-accent)`, 700ms linear rotation).

### Interaction states

- "Play vs AI" button: default / hover / focus-visible / active — identical to `.signInButton`'s existing states (see Color & typography). No disabled state needed (it's always available until `player2` is filled, same lifecycle as the sign-in button it sits beside).
- Once selected, no interaction remains on that row (same as a completed real sign-in — no hover/click affordance on the "signed in" label).
- AI-thinking row: non-interactive (no button, no focus target) — it's a status display, not a control, for the duration it's shown.
- Roll/Hold buttons: unchanged for human turns; simply absent (not disabled-and-visible) while the AI-thinking row occupies that space, avoiding a dead/disabled button sitting next to a spinner.

### Accessibility

- "Play vs AI" button: real `<button>`, accessible name "Play vs AI" (visible text + emoji is `aria-hidden`, matching how `GoogleIcon`/`CheckIcon` are already treated as decorative alongside their text labels).
- AI-selected slot row: keep the existing `role="status" aria-live="polite"` wrapper (`.slotContent`) so screen readers announce the change the same way a real sign-in completion is already announced.
- AI-thinking row: `role="status" aria-live="polite"`, so screen reader users get "AI is thinking…" announced same as any other live status change already in this component (matches `.liveStatus`'s existing `role="status" aria-live="polite"`).
- Reduced motion: spinner `animation: none` under `prefers-reduced-motion: reduce` (already the global rule for `.spinner`) — the text label carries the meaning regardless, per the existing documented reduced-motion guidance for this pattern.
- Touch targets: "Play vs AI" button keeps the 44×44px minimum, consistent with every other interactive element in this design system.

## Design system updates
- **Component inventory**: no new components added — `PlayerSignIn` and `GameBoard` both remain "Stable," extended in place rather than forked into AI-specific variants.
- No new tokens, patterns, or interaction states were needed — this feature is a pure composition of already-documented patterns (Secondary outline button, Loading spinner + status role, PlayerBadge initials fallback, emoji-as-icon). Recording this here mainly so a future reader doesn't go looking for an "AI opponent pattern" section that doesn't exist by design.

## Implementation Notes

- Files created:
  - `src/lib/dice-game/aiPlayer.ts` — zero-dependency constants: `AI_PLAYER_UID` (`"ai-opponent"`, never a valid Firebase uid), `AI_PLAYER_DISPLAY_NAME`, `AI_PLAYER_PROFILE`. Deliberately has no imports at all, so it's safe to import from both server and client code (see gotcha below).
  - `src/lib/dice-game/aiStrategy.ts` — pure `decideAiAction(state): "roll" | "hold"`. Fixed strategy: hold once the round score would either win the game outright or has reached `AI_HOLD_THRESHOLD` (new constant in `constants.ts`, set to 20 — inside the suggested 15–25 range).
  - `src/app/api/game/ai-move/route.ts` — new `POST` endpoint. Authenticates the caller normally (must be a real registered player), then calls the new `playAiTurn(callerUid)`.
- Files modified:
  - `src/lib/dice-game/session.ts` — new `playAiTurn(callerUid)`: requires the caller to be a registered player in the session (any registered player, not specifically whoever's turn it is), requires `currentPlayer`'s uid to actually be `AI_PLAYER_UID` (else `NOT_AI_TURN`), then runs `decideAiAction` and applies the result through the existing `applyEngineResult` — so win-tracking (`incrementWins`) fires identically to a human's turn, no special-casing needed.
  - `src/lib/dice-game/types.ts` — added `"NOT_AI_TURN"` to `SessionErrorCode`.
  - `src/app/api/game/errors.ts` — maps `NOT_AI_TURN` to 409, alongside the other conflict-style errors.
  - `src/app/api/game/serialize.ts` — `serializePlayer` resolves `AI_PLAYER_UID` to the fixed `AI_PLAYER_PROFILE` before falling back to `getPlayer`/raw uid — avoids repeating the earlier "raw UID shown as name" bug for the AI specifically.
  - `src/lib/dice-game/index.ts` — exports `playAiTurn`, `AI_HOLD_THRESHOLD`, and the AI identity constants for server-side consumers (`serialize.ts`).
  - `src/lib/gameApi.ts` — new `triggerAiMove(idToken)` client wrapper for `POST /api/game/ai-move`.
  - `src/components/PlayerSignIn/` (constants/utils/tsx/module.css) — added the "Play vs AI" button and AI-ready status to player2's slot row, exactly per the Design Brief (reusing `.signInButton`/`.signedInStatus` styling, only a new `.slotChoices`/`.orDivider` layout wrapper). New `createAiPlayer()` in `.utils.ts` builds the synthetic `AuthedPlayer` — its `getIdToken` deliberately **throws** if ever called, as a loud guard against a future call site mistakenly trying to authenticate as the AI.
  - `src/components/GameBoard/` (types/constants/utils/tsx/module.css) — new `isAiTurn(gameState)` helper; a `useEffect` that, whenever it becomes the AI's turn, waits `AI_THINKING_DELAY_MS` (800ms) then calls `triggerAiMove` using **player1's** token (the human is always player1 in AI mode) and applies the result — repeating automatically for multi-action AI turns since the effect re-fires on every `gameState` change. The `.actions` (Roll/Hold) row is replaced by a `.aiThinking` status row (spinner + "AI is thinking…") while this is in flight, reusing the existing `.spinner` class and its reduced-motion handling as-is.

- **Two real bugs found and fixed while wiring this up**, both from call sites that unconditionally called `.getIdToken()` on `player2` without accounting for it possibly being the synthetic AI player (which throws by design):
  1. `handleCreate` — was awaiting `player2.getIdToken()` unconditionally; now skips it (`player2Token: undefined`) when `player2.uid === AI_PLAYER_UID`.
  2. `handleReset` — was using `resolveActingPlayer(...)` (whichever of player1/player2 matches the current turn) to pick a token; in AI mode, if reset was clicked during the AI's turn, this would have resolved to the AI and thrown. Fixed by using `player1`'s token unconditionally — verified safe by reading `resetGame` in `session.ts`, which only checks that the caller is *a* registered player, never that they match `currentPlayer`, so this is not a behavior change for two-human games (either player's token already worked equally well there).

- **Win-tally decision**: the AI accumulates its own win count under `AI_PLAYER_UID`, exactly like a real player, with zero special-casing — `incrementWins`/`getWins` don't know or care that this uid belongs to an AI. Chosen because it was strictly simpler than adding exclusion logic, and isn't harmful (worst case, a curious human sees how many times "AI Opponent" has beaten them).

- Deviations from Design Brief: none.
- New design tokens used: none.

## Manual/automated verification

- **Entry point (screenshot-verified)**: started the dev server and drove it with Playwright (no `chromium-cli` available in this environment, adapted the fallback pattern per the `run` skill). Confirmed visually: the sign-in screen renders Player 2's row with "Sign in with Google", an "or" divider, and "🤖 Play vs AI" side-by-side; clicking "Play vs AI" correctly shows the AI's `PlayerBadge` (initials "A"), name "AI Opponent", and the "🤖 AI Opponent" ready status — with `Start Game` correctly still disabled until Player 1 signs in. Zero console errors during this flow.
- **Full OAuth sign-in → actual gameplay against the AI is untestable headlessly** (same limitation already documented in `docs/LEARNINGS.md`'s Product section — no real Google account available in this environment). To still get real confidence in the core game logic, exercised the actual exported server-side functions directly (via `tsx`, bypassing the HTTP/auth layer, same technique used for the MongoDB persistence task):
  - Confirmed `playAiTurn` correctly rejects with `NOT_AI_TURN` when called while it's the human's turn.
  - Simulated a human busting (rolling until a double-6), confirmed the turn correctly passed to the AI (`currentPlayer` → `"player2"`).
  - Drove the AI's full turn via repeated `playAiTurn` calls: round score climbed 9 → 14 → 18 → 20, then the AI correctly held once it reached `AI_HOLD_THRESHOLD` (banking 20 points), and turn correctly returned to the human.
  - Ran a second scenario with a very low `winningScore` so the AI's first held turn won the game outright — confirmed `status` became `"finished"`, `winner` was `"player2"`, and the AI's win tally in MongoDB went from 0 → 1 (same `incrementWins` hook used for humans, no special-casing).
  - All verification scripts and their test documents were deleted afterward — nothing left behind in the repo or the database.
- `npm run build` (TypeScript check across all new/changed files) passes cleanly.

## Verification

- [x] "Play vs AI" entry point skips the second sign-in — confirmed in `src/components/PlayerSignIn/PlayerSignIn.tsx` (`handlePlayVsAi`, `createAiPlayer()`) and independently re-verified visually: screenshotted the sign-in screen and clicking "Play vs AI" (dev server + Playwright, since `chromium-cli` wasn't available) — Player 2's row correctly shows the AI's `PlayerBadge`, name, and ready status, with zero console errors; `Start Game` correctly stays disabled until Player 1 also signs in
- [x] AI has a stable identity usable everywhere real player data flows — confirmed `src/lib/dice-game/aiPlayer.ts` (fixed `uid`/`displayName`/`photoURL`), and `serialize.ts:8` resolves it before the `getPlayer`/raw-uid fallback; `PlayerBadge`/`PlayerScoreCard`/win banner/`wins` pill were **not** modified at all — confirmed via `git diff` — so the AI genuinely flows through the same generic props as a real player
- [x] AI plays full turns via one fixed strategy, no difficulty UI — confirmed `src/lib/dice-game/aiStrategy.ts` (`decideAiAction`, threshold 20, within the requested 15–25 range) and `session.ts:137-159` (`playAiTurn`); no difficulty-related code or UI anywhere in the diff
- [x] "AI is thinking…" indicator/delay before each action resolves — confirmed `GameBoard.tsx`'s `useEffect` (800ms `setTimeout` via `AI_THINKING_DELAY_MS`) and the `.aiThinking` status row replacing `.actions`; confirmed the effect re-fires per `gameState` change, so multi-action AI turns get the delay repeated rather than batched
- [x] AI win count behaves sensibly, decision documented — confirmed: AI accumulates its own tally under `AI_PLAYER_UID` via the same `incrementWins` hook as humans (`session.ts`'s `applyEngineResult`, unchanged), no special-casing; decision documented in Implementation Notes. Independently re-verified the actual increment fires on an AI win (see below)
- [x] Auth carve-out is additive, doesn't loosen human-vs-human checks — confirmed `playAiTurn` is a **new**, separate function; `rollForPlayer`/`holdForPlayer` (the human-vs-human turn-check path) are byte-for-byte unchanged in the diff — the exception only exists in the new function, gated on `currentPlayerUid === AI_PLAYER_UID`, a constant that can never equal a real Firebase uid
- [x] AI's raw uid never shown as a display name — confirmed `serialize.ts`'s `AI_PLAYER_UID` special-case; re-verified live via the AI-turn simulation (all logged output showed `"AI Opponent"`-shaped data, never the raw uid string, and the screenshot shows "AI Opponent" text, not "ai-opponent")
- [x] No difficulty UI, no per-move config — confirmed, nothing in the diff introduces either
- [x] Build/typecheck — `npm run build` passes cleanly, independently re-run
- [x] Two `getIdToken()` bugs found & fixed (`handleCreate`, `handleReset`) — independently re-verified: the `handleReset` fix's safety claim (that `resetGame` doesn't check turn ownership, only membership) checked directly against `session.ts:63-79` — confirmed correct, not just taken on the developer's word
- [x] Core AI-turn logic (not just the UI) — independently re-ran the developer's described verification technique myself is not necessary since the developer's own transcript already exercised the real exported functions (not a mock); spot-checked the exact code paths (`playAiTurn`, `decideAiAction`, `aiPlayer.ts`) referenced in that verification and confirmed they match what's actually in the repo

Manual browser gameplay against a real AI opponent (full OAuth sign-in → play a complete game) remains untested, per the same environment limitation already documented for every OAuth-gated feature in this project (`docs/LEARNINGS.md` Product section) — recommend a quick manual pass before considering this fully done end-to-end.

## Manual test (user)
User played a full game against the AI through real Google sign-in. AI won 103–99 (winning score was 100). User flagged the overshoot as a possible bug — confirmed it's not: `hold()` in `src/lib/dice-game/engine.ts:87` wins on `bankedScore >= winningScore` (reach-or-exceed, standard "Pig"-style dice rule), which predates this task and applies identically to human players. Nothing in this task touched `engine.ts`. No code changes needed.

## Completion Summary
Added a "Play vs AI" option that lets a single signed-in player start and complete a full game against a computer opponent, with a fixed roll/hold strategy, an "AI is thinking…" pacing indicator between its actions, and its own win tally — all built from existing design-system patterns (no new tokens). User confirmed via a real played game (AI won 103–99) that the full flow works end-to-end, including win tracking and the score-overshoot rule (pre-existing, not a bug). Closed 2026-07-21.
