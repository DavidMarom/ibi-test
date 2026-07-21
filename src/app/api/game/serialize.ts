import { getPlayer } from "@/lib/auth";
import { AI_PLAYER_PROFILE, AI_PLAYER_UID, getWins } from "@/lib/dice-game";
import type { GameSession, PlayerId } from "@/lib/dice-game";

async function serializePlayer(uid: string, id: PlayerId, score: number) {
  // The AI opponent has no real Firebase account, so it never goes through
  // upsertPlayer/playerStore — resolve its profile from the fixed constant
  // instead of falling back to the raw uid (see docs/LEARNINGS.md).
  const profile = uid === AI_PLAYER_UID ? AI_PLAYER_PROFILE : getPlayer(uid);
  return {
    id,
    uid,
    displayName: profile?.displayName ?? uid,
    photoURL: profile?.photoURL ?? null,
    score,
    wins: await getWins(uid),
  };
}

export async function serializeSession(session: GameSession) {
  const { state, playerUids } = session;

  return {
    status: state.status,
    winningScore: state.winningScore,
    roundScore: state.roundScore,
    lastRoll: state.lastRoll,
    wasBust: state.wasBust,
    currentPlayerUid: playerUids[state.currentPlayer],
    winnerUid: state.winner ? playerUids[state.winner] : null,
    players: await Promise.all([
      serializePlayer(playerUids.player1, "player1", state.scores.player1),
      serializePlayer(playerUids.player2, "player2", state.scores.player2),
    ]),
  };
}
