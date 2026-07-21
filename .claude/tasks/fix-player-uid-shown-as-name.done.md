# Task: Fix opponent player showing raw UID instead of display name on first run

Status: done
Track: B
Track reason: Bug fix — broken behavior (server has no name to serve yet), not a design/appearance change; no new UI surface.

## Problem
On the first run of a new game, the second (opponent) player's badge shows their raw Firebase UID (e.g. `MpfxfxLPMvOCZpWQfeamx7NngtD2`) instead of a human-readable display name, while player1 correctly shows their name. Confusing and unprofessional-looking for whoever is watching the board.

Root cause: `src/lib/auth/playerStore.ts` is an in-memory `Map` populated only by `upsertPlayer`, which runs inside `authenticateRequest` (`src/lib/auth/verifyRequest.ts:58`) — i.e. only once that specific player's own browser session makes an authenticated request to the server. `serializePlayer` in `src/app/api/game/serialize.ts:9` looks up `getPlayer(uid)` and falls back to the raw `uid` string when no profile is found yet. If player2 hasn't made any authenticated call of their own before the game/board first renders, their name is simply not in the store yet.

## Goal
Both players' badges show a human-readable display name from the very first render of a new game — never a raw UID — regardless of which player's browser has made a server request so far.

## Requirements
- Fix the flow so a player's display name reaches the server (and thus `serializePlayer`) before or at the moment a new game including them is created/rendered, not only after they personally take an in-game action (roll/hold/etc).
- Applies symmetrically to both player1 and player2 — the fix shouldn't special-case "whoever creates the game."
- Preserve the existing fallback-to-uid behavior for the genuine edge case where a token truly has no `name` claim — this should no longer be the common first-run case, just a last-resort fallback.

## Constraints
- Keep the existing in-memory player store approach (`src/lib/auth/playerStore.ts`) unless there's a strong reason to change it — don't introduce a new persistence layer for this.
- Don't break the "two named Firebase apps per browser tab" auth pattern already in place for two simultaneous local sessions (see `docs/LEARNINGS.md` Development section).

## Out of scope
- Persisting player profiles beyond in-memory/server-lifetime storage
- Any other bugs or cleanup unrelated to this display-name issue

## Implementation Notes
- Files created/modified:
  - `src/lib/auth/verifyRequest.ts` — extracted the token-verification + `upsertPlayer` logic out of `authenticateRequest` into a new exported `verifyIdToken(token: string)` helper, so it can be called on a token that didn't arrive as the request's own `Authorization` header. `authenticateRequest` is now a thin wrapper around it (unchanged behavior).
  - `src/lib/auth/index.ts` — export `verifyIdToken` alongside `authenticateRequest`.
  - `src/app/api/game/route.ts` (`POST`) — accepts an optional `player2IdToken` field in the body; if present, verifies it via `verifyIdToken`, which registers that player's profile (uid/displayName/photoURL) in the store as a side effect, before `startGame`/`serializeSession` run.
  - `src/lib/gameApi.ts` — `createGame` takes an optional 5th arg `otherPlayerIdToken`, sent as `player2IdToken` in the request body.
  - `src/components/GameBoard/GameBoard.tsx` (`handleCreate`) — fetches both `player1.getIdToken()` and `player2.getIdToken()` (in parallel) before calling `createGame`, so the second local session's token is available to register that player's profile at game-creation time — client already holds both tokens locally per the two-named-Firebase-apps pattern, they just weren't both being sent.
- Root cause confirmed: `POST /api/game` only ran `authenticateRequest` on the caller's (player1's) token; `player2Uid` arrived as a bare string with no accompanying token, so `verifyIdToken`/`upsertPlayer` never ran for player2 until *they* made their own authenticated call (first roll/hold) — before that, `serializePlayer` fell back to the raw uid.
- Symmetry: player1 is registered via the existing `Authorization` header on the same request (unchanged); player2 is now registered via the new optional body token on the very same request. Both profiles are in the store before the first `serializeSession` response is returned, regardless of who initiates.
- Fallback-to-uid in `serializePlayer` is untouched — still applies only if a token truly has no `name` claim.
- Verification: `npm run build` (includes TypeScript check) passes cleanly.
- Deviations from task requirements: none
- New design tokens used: none

## Verification
- [x] Player display name reaches the server before/at game creation, not only after their own first action — confirmed in `src/app/api/game/route.ts:38-44`: `verifyIdToken(player2IdToken)` runs (and upserts the profile) before `startGame`/`serializeSession` are called
- [x] Applies symmetrically to both players, no special-casing "whoever creates the game" — confirmed: player1 is registered via the pre-existing `authenticateRequest` call at the top of the same `POST` handler (`src/app/api/game/route.ts:11`), player2 via the new inline `verifyIdToken` call — both resolve before the single response is built
- [x] Existing fallback-to-uid preserved for a token truly missing a `name` claim — confirmed `src/app/api/game/serialize.ts` (`serializePlayer`) was not modified; `displayName: readStringClaim(payload.name) ?? uid` in `src/lib/auth/verifyRequest.ts:44` (inside the extracted `verifyIdToken`) is untouched logic, just relocated
- [x] Existing in-memory player store kept, no new persistence layer — confirmed `src/lib/auth/playerStore.ts` has no diff
- [x] Two-named-Firebase-apps pattern not broken — confirmed `GameBoard.tsx` still uses the same `player1`/`player2` `AuthedPlayer` objects and their own `getIdToken()`, just calls both instead of one (`src/components/GameBoard/GameBoard.tsx:41-45`)
- [x] Build/typecheck — `npm run build` passes cleanly (TypeScript check included, all routes generated)

Note: this is an OAuth-dependent flow (real Google sign-in, two live sessions) — per `docs/LEARNINGS.md` Product section, this class of bug hits a hard verification ceiling in this environment. Code-level checks above confirm the fix is structurally correct, but the actual happy path (two real accounts, fresh game, checking the badge on first render) still needs a manual pass in a real browser.

## Completion Summary
Root cause: `POST /api/game` only verified the game-creator's own bearer token, so the second player's display name never reached the server's in-memory `playerStore` until they personally made their own authenticated call — until then their badge showed the raw Firebase UID. Fixed by extracting a reusable `verifyIdToken` helper (`src/lib/auth/verifyRequest.ts`) and having the client send both players' ID tokens on game creation (`GameBoard.tsx`, `gameApi.ts`), with the server verifying and registering both before returning the first game state (`src/app/api/game/route.ts`). Build/typecheck verified clean. Confirmed done by the user on 2026-07-21.
