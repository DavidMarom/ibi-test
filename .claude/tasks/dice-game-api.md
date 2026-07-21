# Task: Dice Game API Endpoints

Status: intake
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
