import type { GameStateResponse, PublicPlayer } from "@/types/game";
import type { AuthedPlayer } from "@/types/player";

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
