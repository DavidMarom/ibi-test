# Task: Track how many times each player has won

Status: reviewing
Track: B
Track reason: The design system already documents a "pill badges (stat chips, counters)" pattern (`docs/DESIGN_SYSTEM.md` — Radius table) and a fixed Mono score-numeral style used by `PlayerScoreCard`; this reuses that existing pattern for a second small numeral rather than introducing a new visual pattern.

## Problem
Players have no way to see who's won more games across a play session. Right now the app only shows the score of the *current* game — once a game ends and a new one starts, there's no record of the running head-to-head tally.

## Goal
Each player's badge/scoreboard shows how many games they've won so far this session, and that count keeps accumulating across "New Game" starts (not reset per game).

## Requirements
- Track a per-player win count, incremented exactly once when a game transitions to `status: "finished"`, attributed to `state.winner`'s uid.
- Display the win count next to each player's badge (per user decision: next to `PlayerBadge`/`PlayerScoreCard`, visible throughout — not only on the win banner).
- Win count must persist across "New Game"/reset within the current server session (per user decision) — starting a new game must NOT zero out the tally, only the round/game score resets.
- Win count is in-memory only, scoped to the current server process lifetime (per user decision) — no database or localStorage persistence; that's covered by the separate "Persist game/player data" backlog item, out of scope here.

## Constraints
- **Do not store the win count inside `PlayerProfile`/`src/lib/auth/playerStore.ts`.** `upsertPlayer` fully overwrites a player's profile from JWT claims on *every* authenticated request (every roll/hold/new-game call re-verifies the token and rebuilds the profile object from scratch) — adding a `wins` field there would get silently reset to its default on the very next API call. Use a separate store keyed by uid (e.g. a new module alongside `playerStore.ts`) that isn't touched by `upsertPlayer`.
- The natural place to detect "a game just finished" exactly once is `src/lib/dice-game/session.ts` — compare the previous `activeSession.state.status` against the new state's status inside `applyEngineResult` (or equivalent), rather than re-deriving it from `GameState` alone, since re-serializing an already-finished game's state on every request must not double-count.
- Reuse the existing pill-badge/counter styling pattern from `docs/DESIGN_SYSTEM.md` — no new colors, radii, or typography.

## Out of scope
- Any persistence beyond the current server process (database, localStorage, cookies)
- Historical game log / match history (dates, scores of past games) — just a running count
- Resetting or manually editing the win tally

## Implementation Notes
- Files created/modified:
  - `src/lib/dice-game/winStore.ts` (new) — in-memory `Map<uid, number>` with `incrementWins(uid)` and `getWins(uid)`.
  - `src/lib/dice-game/index.ts` — export `getWins`.
  - `src/lib/dice-game/session.ts` — `applyEngineResult` now captures `wasFinished` before overwriting `activeSession.state`, then calls `incrementWins(activeSession.playerUids[result.state.winner])` only on the `in_progress → finished` transition (never on repeat serializations of an already-finished game).
  - `src/app/api/game/serialize.ts` — `serializePlayer` now includes `wins: getWins(uid)`.
  - `src/types/game.ts` — `PublicPlayer.wins: number`.
  - `src/components/PlayerBadge/PlayerBadge.types.ts` / `.tsx` / `.module.css` — new optional `wins?: number` prop; renders a `🏆 N` pill next to the name (only when `wins !== undefined`), styled with the same pill recipe as `TokenCounter`/`turnPill` (`--color-accent-dim` bg, `--color-accent-border`, `--radius-pill`, Geist Mono 12px/600).
  - `src/components/PlayerScoreCard/PlayerScoreCard.types.ts` / `.tsx` — new required `wins: number` prop, passed through to `PlayerBadge`.
  - `src/components/GameBoard/GameBoard.tsx` — passes `p1.wins`/`p2.wins` (from the serialized `PublicPlayer`) into each `PlayerScoreCard`.
- Deviations from task requirements:
  - **Store location:** put the new store at `src/lib/dice-game/winStore.ts` rather than "alongside `playerStore.ts`" (`src/lib/auth/`) as suggested in the Constraints. Reasoning: win counts are a game-outcome concern (incremented from `session.ts`, which already owns detecting the finish transition), not an identity concern — keeping `src/lib/auth/` scoped to authentication/identity only felt cleaner than importing game-domain logic into it. The hard constraint (never touched by `upsertPlayer`, keyed separately by uid) is fully satisfied either way.
  - **Display scope:** wins are shown on the persistent in-game `PlayerScoreCard` (visible for the whole game, before and after it finishes) but *not* on the pre-game setup screen's bare `PlayerBadge` (`GameBoard.tsx`'s `!gameState` branch). Before a game starts there's no `GameStateResponse` yet, so there's no server round-trip carrying win counts at that point — showing them there would require a new endpoint (e.g. extending `/api/auth/me`) purely to prefetch wins, which felt like scope creep beyond "visible throughout [the game]" as clarified. Flagging this so product/the user can confirm it's acceptable or ask for the setup-screen version too.
- New design tokens used: none — reused `--color-accent-dim`, `--color-accent-border`, `--color-accent`, `--radius-pill`, and Geist Mono 12px/600 (all pre-existing, per the `TokenCounter`/`turnPill` pill pattern).

## Verification
- [x] Win count incremented exactly once on `in_progress → finished`, attributed to `state.winner`'s uid — confirmed `src/lib/dice-game/session.ts:24-28` (`applyEngineResult` captures `wasFinished` before overwrite, only calls `incrementWins` on the transition); `winStore.ts` itself only increments, never called elsewhere
- [x] Win count displayed next to each player's badge, not only on the win banner — confirmed `PlayerScoreCard.tsx` passes `wins` into `PlayerBadge`, which renders a `🏆 N` pill (`PlayerBadge.tsx:27-30`); shown for the entire duration of gameplay (in progress and after finishing), independent of the win banner
- [x] Win count persists across "New Game"/reset, not zeroed by a new game — confirmed `resetGame`/`startGame` (`session.ts:54`, `:85`) construct `activeSession` directly and never call `applyEngineResult`, so `incrementWins` never fires from them and the `winStore` Map is untouched by a reset
- [x] In-memory only, no persistence beyond server process — confirmed `winStore.ts` is a plain in-memory `Map`, no file/DB/localStorage I/O
- [x] Win count not stored in `PlayerProfile`/`playerStore.ts` — confirmed `src/lib/auth/playerStore.ts` has no diff; wins live in the separate `src/lib/dice-game/winStore.ts`
- [x] Reuses existing pill/counter styling, no new tokens — confirmed `PlayerBadge.module.css`'s `.winsPill` only references pre-existing custom properties (`--color-accent-dim`, `--color-accent-border`, `--color-accent`, `--radius-pill`) and the existing Geist Mono 12px/600 numeral role
- [x] Build/typecheck — `npm run build` passes cleanly

Note on the developer's "display scope" deviation: wins show throughout actual gameplay (including after the game finishes and through subsequent resets) but not on the one-time pre-game setup screen before a player's very first game. This reasonably satisfies the "visible throughout, not just the win banner" requirement — flagging the setup-screen gap to the user below in case they want it covered too, but not treating it as a blocking gap.
