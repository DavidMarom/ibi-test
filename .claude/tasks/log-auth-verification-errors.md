# Task: Log the real cause of ID token verification failures

Status: reviewing
Track: B
Track reason: Bug fix / observability — no user-facing behavior or visual change, just server-side logging.

## Problem
Production is throwing `401 Invalid or expired token.` on `POST /api/game` (and any other authenticated route). `verifyIdToken` in `src/lib/auth/verifyRequest.ts:23-37` wraps `jwtVerify` in a `try/catch` that swallows the real error and always returns the same generic message on any failure — expired token, wrong audience, wrong issuer, or a malformed token all look identical from the outside. This just cost a long manual diagnosis cycle for a `PROJECT_ID` misconfiguration, and the underlying cause is still unconfirmed because nothing was logged server-side to check in Vercel's function logs.

## Goal
The next time ID token verification fails in production, the actual `jose` error (and enough context to diagnose it — e.g. the expected vs. actual issuer/audience where available) is visible in Vercel's function logs, without changing the response returned to the client.

## Requirements
- In `verifyIdToken`'s `catch` block (`src/lib/auth/verifyRequest.ts:35-37`), log the caught error server-side (e.g. `console.error`) before returning the existing generic `{ ok: false, message: "Invalid or expired token." }` response.
- Include enough detail in the log to distinguish failure modes at a glance (the error's name/message from `jose` — e.g. `JWTExpired`, `JWTClaimValidationFailed` for a bad `aud`/`iss` — is sufficient; no need to hand-roll custom diagnostics).
- Do not change the response body, status code, or message returned to the client — this is server-side-only observability.
- Do not log the raw token itself (sensitive).

## Constraints
- Keep the change scoped to this one catch block — don't add logging elsewhere or refactor `verifyRequest.ts` beyond this.
- No new dependencies — use the existing `jose` error shape and plain `console.error`.

## Out of scope
- Actually diagnosing/fixing the current production `PROJECT_ID` mismatch — that's a separate manual verification step the user is doing directly in the Vercel dashboard.
- Structured logging / external log aggregation service — plain `console.error` is enough for Vercel's built-in function logs.
- Changing the generic client-facing error message.

## Implementation Notes
- Files created/modified:
  - `src/lib/auth/verifyRequest.ts` — `verifyIdToken`'s catch block now logs before returning the existing generic response
- The catch block changed from `catch { return ... }` to `catch (err) { ... }`, logging `` `ID token verification failed (issuer=..., audience=...): ${err.name}: ${err.message}` `` via `console.error` — includes the expected issuer/audience (server config, not sensitive) and the underlying `jose` error's name/message (e.g. `JWTExpired`, `JWTClaimValidationFailed`, `JWSInvalid`), which is enough to distinguish an expired token from a wrong `PROJECT_ID` from a malformed token at a glance. The raw token itself is never logged.
- Client-facing response (`{ ok: false, message: "Invalid or expired token." }`, status, etc.) is byte-for-byte unchanged.
- Smoke-tested directly (via `tsx`, calling `verifyIdToken` with a malformed token string) — confirmed the log line prints `JWSInvalid: Invalid Compact JWS` while the returned result is unchanged.
- Deviations from task requirements: none
- New design tokens used: none — server-side only, no UI touched

## Verification
- [x] Log the caught error server-side before returning the generic response — confirmed `src/lib/auth/verifyRequest.ts:35-38`: `console.error(...)` runs, then the same `return { ok: false, message: "Invalid or expired token." }`
- [x] Enough detail to distinguish failure modes — confirmed via independent re-run of the smoke test: `console.error` printed `ID token verification failed (issuer=https://securetoken.google.com/ibi-proj, audience=ibi-proj): JWSInvalid: Invalid Compact JWS` for a malformed token; the `err.name`/`err.message` pattern (`verifyRequest.ts:36`) will equally surface `JWTExpired`, `JWTClaimValidationFailed`, etc. for other `jose` failure modes
- [x] Response body/status/message unchanged — confirmed `verifyRequest.ts:38` still returns the identical object as before the change; independent smoke-test result was `{"ok":false,"message":"Invalid or expired token."}`, byte-identical to pre-change behavior
- [x] Raw token never logged — confirmed by reading `verifyRequest.ts:35-38`: only `err.name`/`err.message` and the (non-secret) expected issuer/audience are logged, `token` itself never appears in the log statement
- [x] Change scoped to the one catch block, no other refactoring — confirmed via reading the full file: only lines 35-38 differ from before, rest of `verifyRequest.ts` untouched
- [x] No new dependencies — confirmed `package.json` unchanged, only `jose`'s existing `Error` shape and plain `console.error` used
- [x] Build passes — confirmed via independent `npm run build` re-run, completed successfully, all 9 routes generated
