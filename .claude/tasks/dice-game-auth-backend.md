# Task: Google Sign-In Backend Verification

Status: intake
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
