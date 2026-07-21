# Task: Sign-In Screen (Google, Two Players)

Status: intake
Track: A
Track reason: new UI surface, no existing pattern in the design system

## Problem
Players must authenticate before playing, but the assignment simulates both players on one page/browser rather than across devices — the UI needs a way for two people to each sign in with their own Google account, sequentially, in the same browser session, without losing either identity once the game starts.

## Goal
A sign-in screen where Player 1 and Player 2 each authenticate via Google Sign-In (one after another), after which the app holds both authenticated identities and lets the user proceed to the game board.

## Requirements
- "Sign in with Google" flow for Player 1, then a second "Sign in with Google" flow for Player 2, in the same browser tab/session
- Both players' identities (uid, display name/avatar, ID token) are retained client-side simultaneously so gameplay can alternate turns without re-authenticating each turn
- Clear indication of which player still needs to sign in, and a way to proceed to the game once both have
- No game logic here — this screen only handles authentication and identity display

## Constraints
- Use the Firebase client SDK (Google provider), matching the backend verification approach from `dice-game-auth-backend`
- Depends on `dice-game-auth-backend`'s token contract

## Out of scope
- Game board, gameplay actions, persistence across page reloads (re-auth on refresh is acceptable for this assignment)
