# Learnings

> Living document. Cross-task knowledge that should outlive a single task file.
> Append short, skimmable bullet points only — deviations, pitfalls, and patterns worth reusing.
> Do not duplicate what belongs in `DESIGN_SYSTEM.md` (tokens/patterns) or in a task's own `## Implementation Notes` / `## Design Brief` (that task's history).

---

## Product

<!-- /product appends entries here when it learns something during intake, classification, or close-out that should inform future tasks. -->

## Design

<!-- /designer appends entries here: tokens that turned out wrong, patterns that worked well, recurring brief gaps. -->

## Development

- **CSS transform breaks position:fixed on children** — any parent with `transform` (including hover animations like `translateY`) creates a new stacking context, making `position: fixed` descendants scroll with the page instead of the viewport. Fix: render modals/overlays via `ReactDOM.createPortal(..., document.body)`. Guard with a `mounted` state to avoid SSR issues in Next.js App Router.
- **Firebase config in `.env.local` isn't `NEXT_PUBLIC_`-prefixed** (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`) — fine for server-side use (e.g. verifying tokens), but any task that needs the Firebase **client** SDK in the browser will need those values exposed some other way (rename with `NEXT_PUBLIC_` prefix, or serve via a small API route) since unprefixed env vars aren't in the client bundle.
- **Verifying Firebase/Google ID tokens without a service account**: no `FIREBASE_*` service-account credentials exist in this project, so `firebase-admin` can't initialize normally. Instead, verify the JWT directly with `jose`'s `createRemoteJWKSet` against Google's public JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`), checking `issuer: https://securetoken.google.com/<PROJECT_ID>` and `audience: PROJECT_ID`. Implemented in `src/lib/auth/verifyRequest.ts`.
