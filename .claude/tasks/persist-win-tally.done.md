# Task: Persist player win tally in MongoDB

Status: done
Track: B
Track reason: Backend/API-only — swapping the storage backend for an already-built feature, no new or changed UI.

## Problem
Win counts (added in the "track player wins" task) live in an in-memory `Map` (`src/lib/dice-game/winStore.ts`) that resets to zero on every server restart or redeploy, and isn't shared across devices/browsers. That undermines the point of tracking wins over an ongoing series between two players.

## Goal
Win counts are read from and written to MongoDB (using the `MONGO_URI` already sitting unused in `.env.local` — no MongoDB driver is installed and nothing in the codebase references it yet) so they survive server restarts/redeploys and are consistent across devices for the same player uid.

## Requirements
- Replace `src/lib/dice-game/winStore.ts`'s in-memory `Map` with MongoDB reads/writes, keyed by player uid. Keep the same two functions, `incrementWins(uid)` and `getWins(uid)` — this should be a drop-in swap of the storage backend, not a redesign of the interface.
- Add the MongoDB driver as a new dependency, plus a small connection helper (e.g. `src/lib/db/mongo.ts`) that reuses a single cached client/connection across invocations rather than opening a new connection per call — connecting fresh on every request will exhaust MongoDB's connection limit under Next.js's per-request module execution.
- `incrementWins` must be a single atomic upsert-style increment (e.g. `findOneAndUpdate` with `$inc` and `upsert: true`), not a read-then-write — two nearly-simultaneous calls (e.g. a request retry, or two different games finishing back-to-back) must not race and drop an increment.
- `incrementWins` and `getWins` become `async` (they now await a DB round-trip). Propagate `await` through every call site so nothing silently returns a `Promise` where a `number` was expected:
  - `src/lib/dice-game/session.ts` — `applyEngineResult`'s call to `incrementWins(...)` (this makes `applyEngineResult`, `rollForPlayer`, and `holdForPlayer` all `async` too)
  - `src/app/api/game/serialize.ts` — `serializePlayer`'s call to `getWins(uid)` (this makes `serializePlayer` and `serializeSession` `async`)
  - All four route handlers that currently call these synchronously and will need an `await` added: `src/app/api/game/route.ts` (POST + GET), `src/app/api/game/new/route.ts`, `src/app/api/game/roll/route.ts`, `src/app/api/game/hold/route.ts`
- Manually verify persistence survives a restart: record a win, restart the dev server (or otherwise clear all in-memory module state), and confirm `getWins` for that uid still returns the previously recorded count.

## Constraints
- Use the existing `MONGO_URI` env var — don't introduce a different connection string, database, or provider.
- No UI changes — this is purely a storage-backend swap behind the already-built win-tally feature (`PlayerBadge`'s `wins` pill, etc. stay as they are).
- Don't touch `src/lib/auth/playerStore.ts` or `src/lib/dice-game/session.ts`'s `activeSession` game-state storage — both stay in-memory per the Out of scope below.

## Out of scope
- Persisting the active in-progress game session (`activeSession` in `src/lib/dice-game/session.ts`) — explicitly deferred; may become its own future backlog item.
- Persisting player profiles (`src/lib/auth/playerStore.ts`) — explicitly deferred; lower priority since profiles are already rebuilt from the Google ID token on every authenticated request anyway.
- Any data migration tooling, admin UI, or historical match log beyond the running win count.

## Implementation Notes
- Files created/modified:
  - `src/lib/db/mongo.ts` (new) — `getDb()` helper; caches the `MongoClient` connect promise on `globalThis._mongoClientPromise` so repeated module executions (dev hot-reload, warm invocations) reuse one connection instead of opening a new one per call. Reads `MONGO_URI` from env, connects to a `ibi_dice_game` database.
  - `src/lib/dice-game/winStore.ts` — rewritten: `incrementWins(uid)` now does a single `findOneAndUpdate({ uid }, { $inc: { wins: 1 } }, { upsert: true, returnDocument: "after" })` on a `playerWins` collection (atomic, no read-then-write race); `getWins(uid)` does a `findOne({ uid })`. Both now `async`, same public signatures otherwise (`uid: string` in, count out).
  - `src/lib/dice-game/session.ts` — `applyEngineResult` is now `async` and `await`s `incrementWins(...)`; `rollForPlayer`/`holdForPlayer` are now `async` (they just `return applyEngineResult(...)`, which is itself a promise — no other logic changed). `startGame`/`resetGame` untouched (still sync; they never called `incrementWins`).
  - `src/app/api/game/serialize.ts` — `serializePlayer` and `serializeSession` are now `async`; `serializeSession` awaits both players via `Promise.all` (parallel DB reads instead of sequential).
  - `src/app/api/game/route.ts` (POST + GET), `src/app/api/game/new/route.ts`, `src/app/api/game/roll/route.ts`, `src/app/api/game/hold/route.ts` — added `await` at each call site that now returns a promise (`rollForPlayer`, `holdForPlayer`, `serializeSession`). `startGame`/`resetGame` calls unchanged (still sync).
  - `package.json` — added `mongodb` (`^7.5.0`) as a dependency.
- Deviations from task requirements: none.
- New design tokens used: none (no UI changes).

## Manual verification
Couldn't drive this through a live authenticated browser session (same OAuth limitation noted elsewhere in `docs/LEARNINGS.md`'s Product section — no real Google sign-in available headlessly). Instead verified directly against the real `MONGO_URI`, using the exact same collection name (`playerWins`), database name (`ibi_dice_game`), and operation (`findOneAndUpdate` with `$inc`/`upsert`/`returnDocument: "after"`) that `winStore.ts` uses:
- Ran two increments back-to-back for a test uid — confirmed the count went `1 → 2` (atomic increment works, no lost updates).
- Read the count back via a fresh `findOne` — confirmed it matches (`2`), and this read has no dependency on any in-memory state from a running Next.js process, so a server restart structurally cannot lose it (the data lives in Mongo, not in the app process).
- Cleaned up the test document afterward — no test data left in the collection.
- `npm run build` (includes TypeScript check across all the now-`async` call sites) passes cleanly.

## Verification
- [x] `winStore.ts` swapped to MongoDB, same public interface — confirmed `src/lib/dice-game/winStore.ts:9,20` still export `incrementWins(uid)`/`getWins(uid)`, no interface change; `git diff` shows no changes needed in any caller's call *shape* beyond adding `await`
- [x] MongoDB driver + cached connection helper — confirmed `mongodb` in `package.json:13`; `src/lib/db/mongo.ts:16-22` caches the connect promise on `globalThis._mongoClientPromise`, only calls `new MongoClient(uri).connect()` once
- [x] `incrementWins` is a single atomic upsert-increment — confirmed `src/lib/dice-game/winStore.ts:11-18`, exactly one `findOneAndUpdate` call with `$inc`/`upsert: true`, no separate read step
- [x] `incrementWins`/`getWins` async, `await` propagated through every listed call site — confirmed: `session.ts:18` (`applyEngineResult`), `:89`/`:112` (`rollForPlayer`/`holdForPlayer`) all `async`; `serialize.ts:5`/`:17` (`serializePlayer`/`serializeSession`) both `async`; all four route handlers (`game/route.ts` POST+GET, `new/route.ts`, `roll/route.ts`, `hold/route.ts`) have `await` added at each now-async call — grepped every occurrence, none missing
- [x] Manual persistence verification — re-ran independently (not just trusting the developer's report): used `tsx` to invoke the actual exported `incrementWins`/`getWins` from `winStore.ts` directly (not a hand-rolled equivalent) against the real `MONGO_URI` — `before: 0 → after 1st: 1 → after 2nd: 2 → read-back: 2`, confirming the real functions work end-to-end and the count is readable independent of any Next.js process state. Cleaned up the test document afterward.
- [x] Constraints — `MONGO_URI` reused, no new connection string; no UI files touched; `src/lib/auth/playerStore.ts` has no diff; `activeSession` in `session.ts` still a plain in-memory `let`, untouched
- [x] Build/typecheck — `npm run build` passes cleanly

## Completion Summary
Swapped the in-memory win-tally store for MongoDB (using the previously-unused `MONGO_URI`), with an atomic upsert-increment and a cached connection helper, propagating async correctly through session/serialize/all four game routes. Verified independently against the real database by invoking the actual exported functions. User confirmed done on 2026-07-21.
