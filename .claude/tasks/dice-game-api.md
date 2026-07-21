# Task: Dice Game API Endpoints

Status: reviewing
Track: B
Track reason: backend/API-only, no UI involvement

## Problem
The rules engine and auth verification need to be wired into actual HTTP endpoints so the frontend can drive gameplay purely through API calls, with zero game logic on the client.

## Goal
A set of authenticated Next.js API routes that fully manage game creation, turn actions (roll/hold), and state retrieval, enforcing every rule from the assignment server-side.

## Requirements
- Every endpoint requires a valid authenticated caller (via the `dice-game-auth-backend` helper); unauthenticated requests get 401
- Create/start a new game: accepts the two player identities (from authenticated sessions) and an optional winning score (default 100)
- Roll endpoint: only the current-turn player may call it; performs a roll via the engine, returns updated round/turn state, applies bust-on-6&6 automatically
- Hold endpoint: only the current-turn player may call it; banks the round score, passes the turn
- New game endpoint: resets state, callable at any time by either player
- Get-state endpoint: returns the full current game state (scores, whose turn, round score, winning score, finished/winner)
- Enforce turn ownership and game-finished checks at the API layer using the authenticated uid — reject illegal actions with a clear error rather than silently ignoring them
- Game state kept in-memory server-side (no persistence yet, per backlog decision)

## Constraints
- Read `node_modules/next/dist/docs/` for this Next.js version's route handler conventions before implementing (AGENTS.md warns this version has breaking API changes vs. training data)
- Depends on `dice-game-engine` and `dice-game-auth-backend` being implemented first

## Out of scope
- Frontend UI, persistence, AI opponent, win-count tracking

## Implementation Notes

**Design decision — game-identity model**: implemented as a single in-memory active game (module-level singleton in `src/lib/dice-game/session.ts`), not a multi-room system. This matches "simulate 2 players on one page, no live updates between browsers/machines" — there's only ever one game in play at a time, server-wide. Starting a new game always overwrites whatever was active.

**Design decision — uid ↔ PlayerId mapping**: each session stores `playerUids: Record<PlayerId, string>` alongside the engine's `GameState`. All session-mutating functions (`startGame`, `resetGame`, `rollForPlayer`, `holdForPlayer`) take the caller's `uid` and internally resolve/verify their `PlayerId` — route handlers never touch `PlayerId` directly, they just pass the authenticated uid through and get back either a session or a typed error.

- Files created:
  - `src/lib/dice-game/session.ts` — `startGame(callerUid, player1Uid, player2Uid, winningScore?)`, `resetGame(callerUid, winningScore?)`, `rollForPlayer(callerUid)`, `holdForPlayer(callerUid)`, `getActiveSession()`. All but `getActiveSession` return a `SessionResult`.
  - `src/lib/dice-game/types.ts` (extended) — added `GameSession`, `SessionErrorCode` (`GAME_FINISHED | INVALID_WINNING_SCORE | NO_ACTIVE_GAME | NOT_A_PLAYER | NOT_YOUR_TURN`), `SessionResult`
  - `src/lib/dice-game/index.ts` (extended) — exports the session functions/types alongside the existing engine exports
  - `src/app/api/game/route.ts` — `POST` (create game), `GET` (get state)
  - `src/app/api/game/new/route.ts` — `POST` (reset, same two players)
  - `src/app/api/game/roll/route.ts` — `POST`
  - `src/app/api/game/hold/route.ts` — `POST`
  - `src/app/api/game/serialize.ts` — maps a `GameSession` to the wire response, enriching each player with their profile (`displayName`/`photoURL`) via `getPlayer()` from `dice-game-auth-backend`'s player store
  - `src/app/api/game/errors.ts` — maps `SessionErrorCode` → HTTP status (`INVALID_WINNING_SCORE`→400, `NOT_A_PLAYER`→403, `NO_ACTIVE_GAME`/`NOT_YOUR_TURN`/`GAME_FINISHED`→409)
  - `src/app/api/game/parseBody.ts` — shared JSON body parser (returns `null` on invalid JSON, `{}` on empty body)

**API shape** (for `dice-game-board-ui` to consume):
- `POST /api/game` — body `{ player1Uid, player2Uid, winningScore? }`. Caller must be one of the two uids (403 `NOT_A_PLAYER` otherwise). Always starts a fresh game, overwriting any active one.
- `GET /api/game` — returns current state; any authenticated user can read it (not restricted to participants); 409 if no game is active.
- `POST /api/game/new` — body `{ winningScore? }`. Resets the *existing* session's scores/turn/round while keeping the same two players; caller must be one of them; 409 if no game is active yet (use `POST /api/game` for the very first game).
- `POST /api/game/roll` / `POST /api/game/hold` — no body. Caller must be the current-turn player (403 `NOT_A_PLAYER` if not in the game at all, 409 `NOT_YOUR_TURN` if it's the other player's turn, 409 `GAME_FINISHED` if the game is already over).
- All five success responses share one shape: `{ status, winningScore, roundScore, lastRoll, wasBust, currentPlayerUid, winnerUid, players: [{ id, uid, displayName, photoURL, score }, { ... }] }` — deliberately keyed by `uid`, not `player1`/`player2`, so the frontend never needs to know the internal `PlayerId` concept; it just compares `currentPlayerUid` to its own signed-in uid.

**Verification performed**:
- Wrote an ad-hoc `tsx` script (not committed) exercising `session.ts` directly: no-active-game rejection on roll/hold/reset, non-participant rejected from starting/resetting/rolling/holding, wrong-turn rejection, successful roll accumulating round score, hold banking score and passing turn, reset preserving the same two players and prior winning score, and driving a game to completion — confirmed `winnerUid` resolves back to the correct uid and further roll/hold calls return `GAME_FINISHED`. All assertions passed.
- Started `npm run dev` and confirmed all 5 endpoints (`POST /api/game`, `GET /api/game`, `POST /api/game/roll`, `POST /api/game/hold`, `POST /api/game/new`) return `401 {"message":"Missing bearer token."}` with no `Authorization` header, before any game logic executes.
- Could not exercise the authenticated HTTP path end-to-end (no real Google ID token available without `dice-game-auth-ui`); the session-layer logic that HTTP path delegates to is covered by the script above.
- `npx tsc --noEmit` and `npm run build` both pass; all 4 new routes show up in the build's route table.

- Deviations from task requirements: none. One scope note — "New game endpoint... callable at any time by either player" is implemented as a *separate* endpoint (`/api/game/new`) from initial creation (`/api/game`), since the first game has no existing players to preserve, while a mid-game reset should keep the same two players rather than requiring them to be re-supplied.
- New design tokens used: none (backend-only, no UI)

## Verification
- [x] Every endpoint requires a valid authenticated caller; unauthenticated → 401 — every route's `POST`/`GET` calls `authenticateRequest(request)` first and returns before touching any session/body logic if it fails (`route.ts:11-14,50-53`, `new/route.ts:11-14`, `roll/route.ts:11-14`, `hold/route.ts:11-14`); independently re-tested with `curl` (no `Authorization` header) against all 5 endpoints — all returned `401`
- [x] Create/start a new game: accepts both player identities + optional winning score, default 100 — `route.ts:21,38` reads `player1Uid`/`player2Uid`/`winningScore` from the body and passes to `startGame`, which calls the engine's `createGame(winningScore)`; default-100 behavior confirmed already in `dice-game-engine`'s tested `DEFAULT_WINNING_SCORE`
- [x] Roll endpoint: only current-turn player, applies bust-on-6&6 via engine, returns updated state — `session.ts:90-102` resolves the caller's `PlayerId`, checks `currentPlayer !== playerId` → `NOT_YOUR_TURN`, then delegates to `rollDice` (bust logic lives in the already-verified engine); independently re-ran the developer's `tsx` session script and confirmed wrong-turn/non-participant rejection and round-score accumulation
- [x] Hold endpoint: only current-turn player, banks round score, passes turn — `session.ts:113-125`, same ownership guard, delegates to `hold`
- [x] New game endpoint: resets state, callable at any time by either (existing) player — `session.ts:54-80`; requires the caller to be one of the *current* session's two players (`resolvePlayerId` check at `session.ts:65`), keeps `playerUids`, calls `createGame` fresh
- [x] Get-state endpoint: returns full state (scores, turn, round score, winning score, finished/winner) — `serialize.ts:16-31` returns `status`, `winningScore`, `roundScore`, `lastRoll`, `wasBust`, `currentPlayerUid`, `winnerUid`, and both `players[]` with per-player `score`
- [x] Turn ownership + game-finished checks enforced at the API layer via authenticated uid, clear errors not silent ignoring — `session.ts` returns typed `SessionResult` failures (`NOT_A_PLAYER`/`NOT_YOUR_TURN`/`GAME_FINISHED`/`NO_ACTIVE_GAME`) mapped to HTTP status via `errors.ts`; re-verified via the session-layer script (stranger rejected, wrong-turn rejected, post-win actions rejected with `GAME_FINISHED`)
- [x] Game state kept in-memory server-side — `session.ts:9` (`let activeSession: GameSession | null`), no DB/file writes anywhere in the new code

One open item carried forward rather than a gap in this task: the authenticated HTTP path (real Google token → 200 with correct game state) is unverified end-to-end, since no real token exists without `dice-game-auth-ui`. The logic that path depends on (session ownership/turn rules) is independently verified; the auth-verification logic itself was independently verified in task 2. Flagging this as the first thing to smoke-test once sign-in exists, not blocking this task's closure.

Build (`npm run build`) re-run independently and passes; all 4 new routes appear in the route table.
