import type { SessionErrorCode } from "@/lib/dice-game";

export function statusForSessionError(error: SessionErrorCode): number {
  switch (error) {
    case "INVALID_WINNING_SCORE":
      return 400;
    case "NOT_A_PLAYER":
      return 403;
    case "NO_ACTIVE_GAME":
    case "NOT_YOUR_TURN":
    case "NOT_AI_TURN":
    case "GAME_FINISHED":
      return 409;
  }
}
