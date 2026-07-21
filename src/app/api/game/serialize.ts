import { getPlayer } from "@/lib/auth";
import type { GameSession, PlayerId } from "@/lib/dice-game";

function serializePlayer(uid: string, id: PlayerId, score: number) {
  const profile = getPlayer(uid);
  return {
    id,
    uid,
    displayName: profile?.displayName ?? uid,
    photoURL: profile?.photoURL ?? null,
    score,
  };
}

export function serializeSession(session: GameSession) {
  const { state, playerUids } = session;

  return {
    status: state.status,
    winningScore: state.winningScore,
    roundScore: state.roundScore,
    lastRoll: state.lastRoll,
    wasBust: state.wasBust,
    currentPlayerUid: playerUids[state.currentPlayer],
    winnerUid: state.winner ? playerUids[state.winner] : null,
    players: [
      serializePlayer(playerUids.player1, "player1", state.scores.player1),
      serializePlayer(playerUids.player2, "player2", state.scores.player2),
    ],
  };
}
