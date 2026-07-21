import { AI_HOLD_THRESHOLD } from "./constants";
import type { GameState } from "./types";

export type AiAction = "roll" | "hold";

export function decideAiAction(state: GameState): AiAction {
  const potentialTotal = state.scores[state.currentPlayer] + state.roundScore;

  if (potentialTotal >= state.winningScore) return "hold";
  if (state.roundScore >= AI_HOLD_THRESHOLD) return "hold";
  return "roll";
}
