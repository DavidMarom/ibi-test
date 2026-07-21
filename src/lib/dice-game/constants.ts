import type { PlayerId } from "./types";

export const DEFAULT_WINNING_SCORE = 100;
export const BUST_DIE_VALUE = 6;
export const DIE_MIN = 1;
export const DIE_MAX = 6;
export const PLAYER_IDS: readonly PlayerId[] = ["player1", "player2"];

// Fixed AI opponent strategy: hold once the round score reaches this many
// points (or once holding now would win the game, whichever comes first).
export const AI_HOLD_THRESHOLD = 20;
