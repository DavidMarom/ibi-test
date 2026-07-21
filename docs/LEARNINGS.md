# Learnings

> Living document. Cross-task knowledge that should outlive a single task file.
> Append short, skimmable bullet points only — deviations, pitfalls, and patterns worth reusing.
> Do not duplicate what belongs in `DESIGN_SYSTEM.md` (tokens/patterns) or in a task's own `## Implementation Notes` / `## Design Brief` (that task's history).

---

## Product

<!-- /product appends entries here when it learns something during intake, classification, or close-out that should inform future tasks. -->

- **Auth/OAuth-heavy goals hit a hard verification ceiling in this environment.** Across the dice-game goal (Google Sign-In backend, API, sign-in UI, game board), every task's real interactive path — an actual Google OAuth popup, a real ID token reaching the backend — was un-testable without a human in a real browser with real accounts. Code-level verification (typecheck, build, unit tests on pure logic, live error-path checks against the running server) can go far, but the happy path always needs a manual pass at the end. When scoping a similar goal, plan for that manual checkpoint explicitly rather than treating "all tasks verified" as equivalent to "actually works" — and prefer bundling that manual test at the *end* of the goal (once the full stack is wired) rather than per-task, since intermediate tasks (e.g. a bare API route) often have nothing a human can click through yet.

## Design

<!-- /designer appends entries here: tokens that turned out wrong, patterns that worked well, recurring brief gaps. -->

## Development

- **CSS transform breaks position:fixed on children** — any parent with `transform` (including hover animations like `translateY`) creates a new stacking context, making `position: fixed` descendants scroll with the page instead of the viewport. Fix: render modals/overlays via `ReactDOM.createPortal(..., document.body)`. Guard with a `mounted` state to avoid SSR issues in Next.js App Router.
- **Firebase config in `.env.local` isn't `NEXT_PUBLIC_`-prefixed** (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`) — fine for server-side use (e.g. verifying tokens), but any task that needs the Firebase **client** SDK in the browser will need those values exposed some other way (rename with `NEXT_PUBLIC_` prefix, or serve via a small API route) since unprefixed env vars aren't in the client bundle.
- **Verifying Firebase/Google ID tokens without a service account**: no `FIREBASE_*` service-account credentials exist in this project, so `firebase-admin` can't initialize normally. Instead, verify the JWT directly with `jose`'s `createRemoteJWKSet` against Google's public JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`), checking `issuer: https://securetoken.google.com/<PROJECT_ID>` and `audience: PROJECT_ID`. Implemented in `src/lib/auth/verifyRequest.ts`.
- **Two simultaneous Firebase-authenticated users in one browser tab need two named Firebase apps.** The Firebase JS Auth SDK holds exactly one active session per `Auth` instance — signing in a second Google account on the default `Auth()` silently signs the first one back out. Fix: `initializeApp(config, "player1")` / `initializeApp(config, "player2")`, each with its own `getAuth(app)`. Guard against re-initialization on re-render with `getApps().find(app => app.name === slot)` before calling `initializeApp` again. Implemented in `src/lib/firebase/client.ts`. Also: Firebase ID tokens expire (~1hr) — retain the live `User` object (or a bound `getIdToken` closure) per session rather than a captured token string, so callers can always fetch a fresh token instead of hitting a stale one later.
