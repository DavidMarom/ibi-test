# Task: Brief pause + animation on a bust (rolling double-6)

Status: done
Track: A
Track reason: Introduces a new animation (attention-grabbing entrance for the bust message) and a new turn-pause interaction — neither exists in `docs/DESIGN_SYSTEM.md` yet, so this needs a Design Brief before implementation.

## Problem
Right now, when a player rolls a bust (double-6), the turn silently flips to the other player and the "Bust — round score lost." text just appears as static text — the next player can act immediately. The moment isn't noticeable enough; players can miss that a bust just happened.

## Goal
When a bust occurs, the game briefly pauses (actions disabled) and the bust message gets a noticeable animated entrance, before control hands to whoever's turn it is next — consistently whether the bust was the human's or the AI opponent's.

## Requirements
- On any bust (`gameState.wasBust === true` in a freshly-received game state), disable all player actions — Roll/Hold buttons for a human's turn, and the AI's own auto-triggered next move — for **~1.2 seconds** before the next turn's controls become available/active.
- During that pause, the existing "Bust — round score lost." message gets a brief, noticeable animated entrance (e.g. a shake or flash) rather than appearing as static text — reuse existing color/spacing tokens, no new colors.
- Applies uniformly regardless of who busted: a human's own bust and the AI's bust both get the same pause + animation before the next player (human or AI) can act.
- Respect `prefers-reduced-motion: reduce` — suppress the transform/shake animation per the existing reduced-motion policy in `docs/DESIGN_SYSTEM.md`, while still giving the message *some* noticeable treatment (e.g. a plain color pulse, or simply appearing — consistent with how the existing Loading spinner pattern falls back to a text label under reduced motion).

## Constraints
- Don't change the actual bust/turn-flip game logic (`src/lib/dice-game/engine.ts`'s `rollDice`) — this is purely a presentation-layer pause + animation on top of the existing `wasBust`/turn-flip behavior, which already works correctly.
- The pause must not stack awkwardly with the AI's existing "AI is thinking…" pause (`src/components/GameBoard/GameBoard.tsx`'s effect, `AI_THINKING_DELAY_MS`) — after a human busts and hands to the AI, the bust pause plays once, then the AI's normal thinking pause plays before its move, rather than trying to merge the two into one non-obvious combined delay.
- No new colors — reuse `var(--color-error)` (already the bust text's color) for any flash/emphasis treatment.

## Out of scope
- Sound effects (separate backlog item)
- Changing how often busts occur or any other game-balance change
- A different bust message/copy — the existing "Bust — round score lost." text stays, just gets an entrance animation

## Design Brief

## Design Brief: Bust pause + animation

### Layout
- No structural/layout change to `GameBoard`. Two existing slots change behavior for a transient ~1.2s window whenever a freshly-received game state has `wasBust: true`:
  1. The existing `.liveStatus` block (`src/components/GameBoard/GameBoard.tsx`) — `.bustText` gets an entrance animation instead of appearing as static text. No new element.
  2. The actions-row slot (currently `isFinished ? <NewGame/> : isAiTurn(gameState) ? <aiThinking/> : <actions/>`) — during the bust pause, this slot renders **empty** (same `width: 100%; min-height: 44px` footprint as `.actions`/`.aiThinking`, so nothing shifts layout), regardless of whose turn is coming up next. Once the pause elapses, the existing three-way logic resumes exactly as today.
- Breakpoints: no change — this reuses the existing `.playArea`/`.liveStatus` container at all sizes, mobile through desktop.

### Component hierarchy
- No new components. Everything is new CSS + a small state addition inside the existing `GameBoard.tsx`.
- New leaf: a `.bustPausePlaceholder` (or similarly named) empty `<div>` with `role="status" aria-live="polite"` is **not** needed — the bust message itself (in `.liveStatus`, already `role="status" aria-live="polite"`) is the single source of the "what just happened" announcement. The actions-row slot's emptiness is purely visual, not informational, so it needs no ARIA role of its own (an empty status region would be redundant/confusing for screen reader users — one announcement, not two).

### Spacing & sizing
- No new spacing values. The empty actions-row placeholder reuses the exact box model already defined for `.actions`/`.aiThinking` (`width: 100%`, `min-height: 44px`) so the layout doesn't jump when this slot's content disappears and reappears.
- Shake amplitude uses the existing spacing scale rather than an arbitrary pixel value: `var(--space-1)` (4px) as the translateX distance.

### Color & typography
- No new colors. `.bustText` keeps its existing `color: var(--color-error)`, Geist Sans 13px/400 — only the entrance treatment is new, not the color or type.
- Animation: a short shake — `translateX` oscillating by `var(--space-1)` (4px) either side of center, `500ms ease`, running once on entrance. This finishes well inside the ~1.2s pause, giving the message time to register before it's cleared away.

```css
@keyframes bustShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(calc(var(--space-1) * -1)); }
  40% { transform: translateX(var(--space-1)); }
  60% { transform: translateX(calc(var(--space-1) * -0.75)); }
  80% { transform: translateX(calc(var(--space-1) * 0.75)); }
}

.bustText {
  /* existing declarations unchanged */
  animation: bustShake 500ms ease;
}
```

### Interaction states
- **Motion allowed (default):** `.bustText` plays `bustShake` once on mount (React already only renders this `<p>` when `gameState.wasBust` is true, so the animation naturally plays once per bust — no JS-driven animation restart needed. If the developer finds React reuses the same DOM node across busts without remounting it, e.g. because a fresh `<p>` isn't guaranteed each time, add a `key` derived from something that changes per bust — e.g. `key={gameState.lastRoll ? gameState.lastRoll.die1 + gameState.lastRoll.die2 : undefined}` or similar — so the animation is guaranteed to restart on every new bust rather than only the first).
- **Reduced motion:** `animation: none` — the message simply appears, no shake, no transform, matching the existing Loading spinner pattern's precedent exactly ("suppress `transform` transitions; keep color transitions" — here there's no separate color to transition, so it falls back to plain static appearance, same as the spinner's text-label fallback conveys status without motion).
- **Actions-row emptiness during the pause:** purely visual, no interactive states of its own (nothing to hover/focus/click — it's an absence, not a control).
- **Everything else already disabled correctly by existing `isBusy` wiring** — `New Game` (`.newGameSecondary`/`.newGamePrimary`) already disables via `disabled={isBusy}`; as long as the bust-pause window is represented by *some* non-null `pendingAction` value (implementation detail, developer's call — e.g. a new `"bust"` value alongside the existing `"roll" | "hold" | "ai" | "reset" | "setup"`), `New Game` is automatically disabled for the same window with zero new code in that button.

### Accessibility
- `.liveStatus`'s existing `role="status" aria-live="polite"` wrapper already announces "Bust — round score lost." — no change needed there, and no second live region for the empty actions-row slot (would double-announce or announce nothing useful).
- Reduced motion handled per the existing documented policy — no new carve-out language needed, this is a straightforward application of it.
- No new focus targets are introduced (the actions-row slot has nothing focusable during the pause), so no new focus-management concerns.

### Implementation note (non-visual, for the developer)
The ~1.2s pause needs to fire **once per bust event**, not re-trigger on every re-render while `wasBust` stays `true` (it stays `true` in the response until the next roll happens) — same class of one-shot-per-state-change concern already solved for the AI's "thinking" delay in this same file. Reuse that pattern: a `useEffect` keyed on `gameState`, gated so it only starts the pause when this specific bust hasn't already been paused-for. The AI turn's own effect must not fire until the bust pause has cleared (so a human bust handing off to the AI shows: bust pause (~1.2s, empty actions slot) → then the AI's own existing "AI is thinking…" pause (800ms) → then its move) — the two pauses play in sequence, never merged into one, per the task's Constraints.

## Design system updates
- **Component inventory**: no new components; `GameBoard` stays "Stable," extended in place.
- **New pattern documented**: "Bust shake" animation — see `docs/DESIGN_SYSTEM.md`'s updated Interaction states / motion section. First transform-based attention animation in the system that isn't a spinner rotation or hover lift; establishes the `var(--space-N)` as the amplitude unit for any future shake-style animation, rather than a raw pixel value.

## Implementation Notes

- Files modified:
  - `src/components/GameBoard/GameBoard.constants.ts` — new `BUST_PAUSE_DELAY_MS = 1200`.
  - `src/components/GameBoard/GameBoard.types.ts` — added `"bust"` to `PendingAction`.
  - `src/components/GameBoard/GameBoard.utils.ts` — new `delay(ms)` helper (small promise-based sleep, shared by both pauses).
  - `src/components/GameBoard/GameBoard.module.css` — `.bustText` gets the `bustShake` keyframe animation (exact CSS from the Design Brief); new `.bustPause` class (`width: 100%; min-height: 44px`, same footprint as `.actions`/`.aiThinking`, no visible content); reduced-motion block extended with `.bustText { animation: none; }`.
  - `src/components/GameBoard/GameBoard.tsx` — new `bustKey` state (bumped once per bust, used as `<p key={bustKey}>`'s key so the shake animation reliably restarts even if two busts happen back-to-back without the element ever unmounting in between — the edge case the brief specifically flagged). Actions-row ternary gets a new `pendingAction === "bust"` branch rendering `<div className={styles.bustPause} />` (empty, no ARIA role — the existing `.liveStatus` region already announces the bust message once).
- **Deviation from the brief, with reasoning:** the brief described the bust pause and the AI's "thinking" pause as effectively two separate concerns; I merged them into **one** `useEffect` (still keyed on `[gameState]`) rather than keeping the AI-turn effect and adding a second, independent bust-pause effect alongside it. Reason: two separate effects both depending on `[gameState]` would both fire in the *same* commit whenever a human bust hands the turn to the AI. Neither effect can observe the other's `setPendingAction` call within that same commit (each effect's closure only sees the `pendingAction` value from the render that scheduled it) — so the AI-turn effect would incorrectly see `pendingAction` as still `null` and start its own 800ms timer *in parallel* with the bust pause's 1200ms timer, violating the "must play in sequence, never merged" constraint. A single async effect that awaits the bust pause before ever checking `isAiTurn` makes the sequencing structurally guaranteed rather than dependent on timing luck. Behavior matches the brief's intent exactly (bust pause → then AI thinking pause → then AI move, or bust pause → then normal human buttons if next turn is human); only the internal wiring differs from the literal two-effect description.
- New design tokens used: none — `bustShake`'s amplitude reuses `var(--space-1)`; no new colors.

## Manual/automated verification

- `npm run build` (TypeScript check) passes cleanly.
- **Reaching an actual bust in a live game requires playing through a full game to roll double-6** (or several games, since it's random), which itself requires completing real Google OAuth sign-in — the same headless-environment limitation documented for every OAuth-gated feature in this project (`docs/LEARNINGS.md` Product section). Attempting to mock around it (e.g. intercepting network requests to fake a bust game state) doesn't help here specifically, because the blocker is the Firebase Auth **popup** on the sign-in screen itself, before any game API calls happen at all — there's no way past that boundary without a real account in this environment.
- To still get confidence without a live bust, traced the logic by hand against the actual code for the three cases the brief calls out:
  - Human busts, two-human game → `isAiTurn` false both before and after → only the bust pause plays (1.2s, empty actions row), then normal Roll/Hold buttons for the new current player. Correct.
  - Human busts, AI game (hands to AI) → bust pause plays first (1.2s), *then* `isAiTurn` is checked and is now true → AI thinking pause (800ms) → AI's move. Sequential, never parallel, by construction (single `await` chain). Correct.
  - AI busts (hands back to human) → bust pause plays (1.2s), then `isAiTurn` is now false (current player is the human) → effect ends, normal Roll/Hold buttons appear. Correct.
- Recommend a manual pass in a real browser (play until a double-6 comes up, in both a two-human and an AI game) before treating this as fully confirmed end-to-end — flagging this explicitly rather than claiming full verification.

## Verification

- [x] Bust disables actions for ~1.2s before the next turn's controls activate — confirmed `GameBoard.tsx:118-162`: the effect sets `pendingAction("bust")` and `await delay(BUST_PAUSE_DELAY_MS)` (1200, `GameBoard.constants.ts`) before clearing it; `isBusy` (hence `New Game`'s disabled state) and the actions-row all key off `pendingAction`
- [x] Bust message gets a noticeable animated entrance, existing tokens only — confirmed `GameBoard.module.css:149-176`: `.bustText` has `animation: bustShake 500ms ease`; the keyframes use `var(--space-1)` exclusively, no raw px, no new color (still `var(--color-error)`, untouched)
- [x] Applies uniformly to human and AI busts — confirmed the effect checks `gameState.wasBust` unconditionally, before any check of whose turn is next; independently traced all three cases (two-human bust, human bust → AI turn, AI bust → human turn) against the actual code and all three correctly play the bust pause first
- [x] Reduced motion suppresses the shake, message still appears — confirmed `GameBoard.module.css:347-350`, `.bustText { animation: none; }` added to the existing `prefers-reduced-motion: reduce` block; the paragraph still renders unconditionally on `gameState.wasBust`, just without the animation
- [x] `engine.ts`/`rollDice` untouched — confirmed no diff in `src/lib/dice-game/engine.ts`
- [x] Bust pause and AI thinking pause never merge — confirmed structurally: single `useEffect` with one `await` chain (bust delay resolves and clears before the AI-turn branch is even reached), not two independent effects; this is provably sequential, not just usually-sequential
- [x] No new colors — confirmed via diff, only `var(--space-1)` (spacing, not color) is new usage
- [x] Build/typecheck — `npm run build` passes cleanly, re-run independently

Live-browser confirmation of an actual bust (in both a two-human and an AI game) is still outstanding — this is the one requirement in this task that genuinely can't be verified any other way in this environment (no server-side bypass exists here, unlike prior OAuth-gated features), so it's a real gap, not just a formality. Recommend the user do a quick manual playtest before considering this fully done.

## Completion Summary
Added a ~1.2s pause and a shake-animated entrance for the existing bust message whenever a player rolls double-6, applying identically whether the human or the AI busts, with the two sequential pauses (bust, then AI-thinking) made structurally impossible to overlap. Verified at the code level (build + hand-traced all three turn-handoff cases); user confirmed working via manual playtest. Closed 2026-07-21.
