# Task: Dice Game Rules Engine

Status: done
Track: B
Track reason: pure logic module, no UI, no framework wiring

## Problem
All game rules must be enforced server-side (the assignment explicitly forbids game logic in the frontend). Without a well-defined, isolated rules module, the API layer would be tempted to scatter logic inline, making it hard to test and easy to get subtly wrong (e.g. bust vs. hold interactions, win-condition edge cases).

## Goal
A pure, framework-agnostic module that fully implements the dice game's turn/round/scoring rules and can be unit tested in isolation, ready for the API layer to wrap.

## Requirements
- 2-player game; exactly one player's turn is active at a time
- On a turn: roll 2 dice, add the sum to the current round score, repeat any number of times
- Rolling double six (6 & 6) on a roll: round score is lost (reset to 0), turn passes to the other player
- Hold action: current round score is added to the acting player's global score, turn passes to the other player
- Winning score is configurable per game, default 100
- First player to reach or exceed the winning score wins; game enters a "finished" state — no further roll/hold actions allowed, only starting a new game
- New game can be started at any time, resetting scores/turn/round state (default winning score to 100 unless the caller specifies one)
- Module must not depend on Next.js, HTTP, or auth — plain functions/classes operating on a game-state object/type, so it can be reused by API route handlers and unit tested directly
- Every state-mutating action must validate legality (e.g. reject roll/hold if the game is already finished) and return a clear result/error for illegal calls rather than mutating silently

## Constraints
- This module itself is framework-agnostic and doesn't touch Next.js APIs directly, but per AGENTS.md this project's Next.js version has breaking changes vs. training data — check `node_modules/next/dist/docs/` before writing any framework-touching code in later tasks that consume this module

## Out of scope
- HTTP endpoints, authentication, persistence, React UI — handled in `dice-game-api`, `dice-game-auth-backend`, `dice-game-auth-ui`, `dice-game-board-ui`

## Implementation Notes
- Files created: `src/lib/dice-game/types.ts`, `src/lib/dice-game/constants.ts`, `src/lib/dice-game/engine.ts`, `src/lib/dice-game/index.ts`
- Public API: `createGame(winningScore?)`, `rollDice(state, rng?)`, `hold(state)` — all pure, all return a `GameActionResult` (`{ ok: true, state }` or `{ ok: false, error, message }`). No `newGame` function — the API layer starts a new game by calling `createGame()` again, since a reset never depends on prior state.
- `rollDice` accepts an optional `rng: () => number` (defaults to `Math.random`) purely so it's deterministically testable; production callers never need to pass it.
- Design decision not explicit in requirements: `hold()` clears `lastRoll`/`wasBust` back to their initial values, since the round is over and displaying a stale last roll for the next player would be misleading. Flagging in case the frontend task expects otherwise.
- Verified with an ad-hoc script (`tsx`, not committed) covering: invalid winning score rejected, round score accumulation across multiple rolls, double-six bust (score lost, turn passes, `wasBust` flag set), hold (banks score, resets round, passes turn), win detection at/above winning score, and that both `rollDice`/`hold` are rejected with `GAME_FINISHED` once the game is over. All passed.
- `npx tsc --noEmit` passes with no errors.
- Deviations from task requirements: none
- New design tokens used: none (backend-only, no UI)

## Verification
- [x] 2-player game; exactly one player's turn is active at a time — `currentPlayer: PlayerId` (`"player1" | "player2"`) in `types.ts:1,10`
- [x] Roll adds sum to round score, repeatable — `engine.ts:69` (`roundScore: state.roundScore + roll.die1 + roll.die2` when not bust), no cap on call count
- [x] Double six busts: round score lost, turn passes — `engine.ts:60-72` (`isBust` check, `roundScore: 0`, `currentPlayer: otherPlayer(...)`)
- [x] Hold banks round score to global score, turn passes — `engine.ts:86,93,97-99`
- [x] Winning score configurable, default 100 — `constants.ts:3` (`DEFAULT_WINNING_SCORE = 100`), `engine.ts:22-23` (`createGame(winningScore = DEFAULT_WINNING_SCORE)`)
- [x] First to reach/exceed winning score wins; finished state blocks further roll/hold — `engine.ts:87,100-101` (`hasWon = bankedScore >= winningScore`, `status: "finished"`); `engine.ts:52-58,78-84` reject with `GAME_FINISHED` once finished
- [x] New game startable at any time, resets state, defaults winning score to 100 unless specified — `createGame()` produces a fresh state unconditionally (`engine.ts:22-46`); confirmed the API layer is expected to call this directly rather than a separate `newGame`, since it doesn't depend on prior state
- [x] Framework-agnostic, no Next.js/HTTP/auth dependency — `engine.ts` imports only from local `./constants` and `./types`, no Next.js/fetch/auth imports
- [x] Illegal state-mutating actions return clear result/error rather than mutating silently — `GameActionResult` union (`types.ts:23-33`) forces every caller to check `.ok`; `INVALID_WINNING_SCORE` and `GAME_FINISHED` cases confirmed above

## Completion Summary
Built the pure dice-game rules engine at `src/lib/dice-game/` (`types.ts`, `constants.ts`, `engine.ts`, `index.ts`), exposing `createGame`, `rollDice`, and `hold` — all pure functions returning a typed result, with no Next.js/HTTP/auth dependency. Covers round-score accumulation, double-six bust, hold-to-bank, configurable winning score (default 100), win detection, and rejection of illegal actions on a finished game. User confirmed the `createGame()`-as-reset design (no separate `newGame`) satisfies "start a new game at any time." Closed 2026-07-21.
