# Goal: Dice Game (2-player, backend-enforced rules, Google auth)

Status: done

Full-stack dice game per take-home assignment: backend owns all game rules/state, React frontend only displays state and calls the API. Google Sign-In (Firebase) authenticates both players, simulated on one page/browser.

## Tasks
- [x] .claude/tasks/dice-game-engine.done.md
- [x] .claude/tasks/dice-game-auth-backend.done.md
- [x] .claude/tasks/dice-game-api.done.md
- [x] .claude/tasks/dice-game-auth-ui.done.md
- [x] .claude/tasks/dice-game-board-ui.done.md

## Plan
1. **dice-game-engine** — pure rules module, no dependencies. Needed first so every other piece enforces the same rule logic instead of reimplementing it.
2. **dice-game-auth-backend** — Firebase Google ID-token verification, no dependency on the engine. Needed before any API route can check "who is calling."
3. **dice-game-api** — wires engine + auth into real Next.js endpoints; depends on 1 and 2.
4. **dice-game-auth-ui** — Google sign-in screen for both players; depends on 2 for the token contract, can be built alongside 3.
5. **dice-game-board-ui** — the actual gameplay screen; depends on 3 (API) and 4 (needs authenticated identities to call the API as).
