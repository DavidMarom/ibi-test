# Task: Dice Game Board

Status: intake
Track: A
Track reason: new UI surface, no existing pattern in the design system

## Problem
Once authenticated, players need a way to actually play the game — see live state and take actions — with the frontend containing zero game rules, purely reflecting and driving server state.

## Goal
A game board screen that displays full game state and lets the active player roll or hold, calling the backend API for every action.

## Requirements
- Shows both players (names/avatars from their Google profiles), each one's global score, whose turn it is, current round score, and the configured winning score
- Roll button: calls the roll API; disabled when it's not the calling player's turn or the game is finished
- Hold button: calls the hold API; same enablement rules as Roll
- Displays dice results after each roll
- Shows a clear win state when a player reaches the winning score, naming the winner
- "New game" control, with the ability to set the winning score (default 100) before starting
- Every action goes through the backend API (`dice-game-api`) — this screen must not compute scores, validate turns, or decide bust/win itself; it only renders what the API returns and forwards user intent
- Uses whichever authenticated identity (from `dice-game-auth-ui`) matches "whose turn it is" to make the actual API call

## Constraints
- Depends on `dice-game-api` and `dice-game-auth-ui`

## Out of scope
- Bust animation/delay, sound effects, AI opponent, win-count tracking, persistence (all backlogged)
