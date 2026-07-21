# Task: Google Sign-In Backend Verification

Status: done
Track: B
Track reason: backend/API-only, no UI involvement

## Problem
Only authenticated users may create or play games. The user has already provisioned a Firebase project for this — config keys are present in `.env.local` (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`) — and wants Google Sign-In as the auth method.

## Goal
The backend can verify a Firebase-issued Google Sign-In ID token sent by the frontend and resolve it to a stable player identity (uid + profile info) usable by the game API.

## Requirements
- Use Firebase Authentication with the Google provider — env config already present in `.env.local`; use the `firebase` skill (firebase-auth-basics) for setup guidance
- Provide a reusable server-side helper that any API route can call to authenticate a request (verify the bearer/ID token) and obtain the caller's Firebase uid + profile (display name, email/avatar)
- Requests without a valid token must be rejected with 401 before any game logic runs
- No database persistence needed (persistence is backlogged) — an in-memory map from uid to player profile, populated on first authenticated request, is sufficient

## Constraints
- Read `node_modules/next/dist/docs/` (per AGENTS.md) for this Next.js version's conventions on route handlers/middleware before implementing — this version has breaking changes vs. training data
- Full ID-token verification via Firebase Admin SDK needs service-account credentials; if none are available in `.env.local`, use a lighter-weight verification approach (e.g. Google's public JWK endpoint) instead and note the tradeoff in this file's Implementation Notes

## Out of scope
- Frontend sign-in UI (`dice-game-auth-ui`), game rules (`dice-game-engine`), route wiring (`dice-game-api`)

## Implementation Notes
- Files created:
  - `src/lib/auth/types.ts` — `PlayerProfile`, `AuthResult` (`AuthSuccess | AuthFailure`)
  - `src/lib/auth/constants.ts` — Google's public JWK endpoint URL, Firebase issuer prefix
  - `src/lib/auth/playerStore.ts` — in-memory `Map<uid, PlayerProfile>` with `upsertPlayer`/`getPlayer`
  - `src/lib/auth/verifyRequest.ts` — `authenticateRequest(request)`, the reusable helper
  - `src/lib/auth/index.ts` — barrel export
  - `src/app/api/auth/me/route.ts` — minimal `GET` route so the helper is exercised end-to-end (returns the authenticated profile, or 401); not part of the game API, just a verification/integration point for this task and for the frontend auth task to check "did sign-in work"
- Verification approach taken (per the constraint's suggested fallback): **no service-account credentials exist in `.env.local`** (only the public web config: `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` — no `FIREBASE_*` private key). Rather than `firebase-admin` (which needs a service account to initialize), I used the `jose` library (new dependency, added via `npm install jose`) to verify the Firebase-issued Google ID token directly against Google's public JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`), checking signature, `issuer` (`https://securetoken.google.com/<PROJECT_ID>`), and `audience` (`PROJECT_ID`) — this is the same verification Firebase Admin does internally, just without the admin SDK's extra features (e.g. token revocation checks), which aren't needed here.
- `authenticateRequest(request: Request)` reads the `Authorization: Bearer <idToken>` header, verifies it, and returns `{ ok: true, profile }` or `{ ok: false, status: 401, message }`. On success it also calls `upsertPlayer(profile)` so the in-memory store is populated automatically — no extra wiring needed by callers.
- `PLAYER_STORE` caveat: the in-memory map is process-local module state — it resets on server restart and wouldn't be shared across multiple serverless instances in a real deployment. Acceptable per this task's persistence-is-backlogged scope; flagging for `dice-game-api` since it'll read from this same store.
- **Env var caveat for the frontend task**: `.env.local`'s Firebase keys (`API_KEY`, `AUTH_DOMAIN`, etc.) are *not* `NEXT_PUBLIC_`-prefixed, so they are currently only readable server-side. `dice-game-auth-ui` will need the Firebase **client** SDK config in the browser to sign in — it'll either need those vars renamed/duplicated with a `NEXT_PUBLIC_` prefix, or a small endpoint to hand them to the client. Left as-is here since renaming existing env vars is outside this task's scope; flagging explicitly for whoever picks up `dice-game-auth-ui`.
- Verified locally: ran `npm run dev` and hit `GET /api/auth/me` — no `Authorization` header → `401 {"message":"Missing bearer token."}`; malformed bearer token → `401 {"message":"Invalid or expired token."}`. Also confirmed Google's JWK endpoint is reachable (`curl` → `200`). Could not exercise the full success path (valid profile returned) without a real Google sign-in flow, since that requires `dice-game-auth-ui`.
- `npx tsc --noEmit` and `npm run build` both pass.
- Deviations from task requirements: none
- New design tokens used: none (backend-only, no UI)

## Verification
- [x] Use Firebase Authentication with the Google provider, env config from `.env.local` — token verification is scoped to this project's Firebase tenant via `issuer`/`audience` checks against `PROJECT_ID` in `verifyRequest.ts:22,38-41`
- [x] Reusable server-side helper any API route can call, returns uid + profile (display name, email/avatar) — `authenticateRequest` exported from `src/lib/auth/index.ts:1`, returns `PlayerProfile { uid, displayName, email, photoURL }` (`types.ts:1-6`); wired into `src/app/api/auth/me/route.ts:7`
- [x] Requests without a valid token rejected with 401 before any game logic runs — re-verified independently (not just re-running the developer's script): `curl` with no `Authorization` header, a garbage bearer token, and a wrong-scheme (`Basic`) header all returned `401` with no downstream logic executed (`verifyRequest.ts:23-34,42-44`)
- [x] In-memory uid→profile map, populated on first authenticated request, no DB — `playerStore.ts:3` (`Map<string, PlayerProfile>`), populated via `upsertPlayer(profile)` inside `authenticateRequest` on every successful verification (`verifyRequest.ts:58`)

Build (`npm run build`) re-run independently and passes. Full success-path (valid Google-signed token → profile returned) not testable yet without a real sign-in flow — acceptable at this stage since `dice-game-auth-ui` is what will produce real tokens; flagging that this should get an end-to-end check once that task lands.

## Completion Summary
Built a reusable backend auth helper (`src/lib/auth/authenticateRequest`) that verifies Firebase/Google-issued ID tokens against Google's public JWKS (no service-account key available, so `jose`-based verification was used instead of `firebase-admin`), auto-populates an in-memory `uid → profile` store, and rejects unauthenticated requests with 401 — proven via a minimal `/api/auth/me` route and independently re-tested 401 cases. Env-var exposure for the browser (Firebase client config not `NEXT_PUBLIC_`-prefixed) and full end-to-end token verification remain open, explicitly deferred to `dice-game-auth-ui`. User confirmed. Closed 2026-07-21.
