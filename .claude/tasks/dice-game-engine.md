# Task: Dice Game Rules Engine

Status: intake
Track: B
Track reason: pure logic module, no UI, no framework wiring

## Problem
All game rules must be enforced server-side (the assignment explicitly forbids game logic in the frontend). Without a well-defined, isolated rules module, the API layer would be tempted to scatter logic inline, making it hard to test and easy to get subtly wrong (e.g. bust vs. hold interactions, win-condition edge cases).

## Goal
A pure, framework-agnostic module that fully implements the dice game's turn/round/scoring rules and can be unit tested in isolation, ready for the API layer to wrap.

## Requirements
- 2-player game; exactly one player's turn is active at a time
- On a turn: roll 2 dice, add the sum to the current round score, repeat any number of times
- Rolling double six (6 & 6) on a roll: round score is lost (reset to 0), turn passes to the other player
- Hold action: current round score is added to the acting player's global score, turn passes to the other player
- Winning score is configurable per game, default 100
- First player to reach or exceed the winning score wins; game enters a "finished" state — no further roll/hold actions allowed, only starting a new game
- New game can be started at any time, resetting scores/turn/round state (default winning score to 100 unless the caller specifies one)
- Module must not depend on Next.js, HTTP, or auth — plain functions/classes operating on a game-state object/type, so it can be reused by API route handlers and unit tested directly
- Every state-mutating action must validate legality (e.g. reject roll/hold if the game is already finished) and return a clear result/error for illegal calls rather than mutating silently

## Constraints
- This module itself is framework-agnostic and doesn't touch Next.js APIs directly, but per AGENTS.md this project's Next.js version has breaking changes vs. training data — check `node_modules/next/dist/docs/` before writing any framework-touching code in later tasks that consume this module

## Out of scope
- HTTP endpoints, authentication, persistence, React UI — handled in `dice-game-api`, `dice-game-auth-backend`, `dice-game-auth-ui`, `dice-game-board-ui`
