import { AI_PLAYER_UID } from "@/lib/dice-game/aiPlayer";
import { playBustSound, playHoldSound, playRollSound, playWinSound } from "@/lib/sound";
import type { GameStateResponse, PublicPlayer } from "@/types/game";
import type { AuthedPlayer } from "@/types/player";

export function isAiTurn(gameState: GameStateResponse): boolean {
  return gameState.currentPlayerUid === AI_PLAYER_UID;
}

// A successful hold and a bust both reset roundScore to 0 — wasBust is what
// tells them apart. Applied the same way regardless of whether the human or
// the AI produced this state, so every fresh GameStateResponse (from a roll,
// a hold, or an AI move) can be routed through this one place.
export function playSoundForResult(state: GameStateResponse): void {
  if (state.wasBust) {
    playBustSound();
  } else if (state.status === "finished") {
    playWinSound();
  } else if (state.roundScore === 0) {
    playHoldSound();
  } else {
    playRollSound();
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveActingPlayer(
  gameState: GameStateResponse,
  player1: AuthedPlayer,
  player2: AuthedPlayer
): AuthedPlayer {
  return gameState.currentPlayerUid === player1.uid ? player1 : player2;
}

export function findPublicPlayer(gameState: GameStateResponse, uid: string): PublicPlayer {
  const player = gameState.players.find((p) => p.uid === uid);
  if (!player) {
    throw new Error("Player not found in game state.");
  }
  return player;
}
