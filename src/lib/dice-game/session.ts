import { createGame, hold as engineHold, rollDice } from "./engine";
import type {
  GameActionResult,
  GameSession,
  PlayerId,
  SessionResult,
} from "./types";

let activeSession: GameSession | null = null;

function resolvePlayerId(session: GameSession, uid: string): PlayerId | null {
  if (session.playerUids.player1 === uid) return "player1";
  if (session.playerUids.player2 === uid) return "player2";
  return null;
}

function applyEngineResult(result: GameActionResult): SessionResult {
  if (!result.ok) {
    return { ok: false, error: result.error, message: result.message };
  }
  if (!activeSession) {
    return { ok: false, error: "NO_ACTIVE_GAME", message: "No active game." };
  }
  activeSession = { ...activeSession, state: result.state };
  return { ok: true, session: activeSession };
}

export function startGame(
  callerUid: string,
  player1Uid: string,
  player2Uid: string,
  winningScore?: number
): SessionResult {
  if (callerUid !== player1Uid && callerUid !== player2Uid) {
    return {
      ok: false,
      error: "NOT_A_PLAYER",
      message: "You must be one of the two players to start a game.",
    };
  }

  const result = createGame(winningScore);
  if (!result.ok) {
    return { ok: false, error: result.error, message: result.message };
  }

  activeSession = {
    state: result.state,
    playerUids: { player1: player1Uid, player2: player2Uid },
  };
  return { ok: true, session: activeSession };
}

export function resetGame(
  callerUid: string,
  winningScore?: number
): SessionResult {
  if (!activeSession) {
    return {
      ok: false,
      error: "NO_ACTIVE_GAME",
      message: "No active game to reset. Start one first.",
    };
  }
  if (!resolvePlayerId(activeSession, callerUid)) {
    return {
      ok: false,
      error: "NOT_A_PLAYER",
      message: "You are not a player in the active game.",
    };
  }

  const result = createGame(winningScore ?? activeSession.state.winningScore);
  if (!result.ok) {
    return { ok: false, error: result.error, message: result.message };
  }

  activeSession = { state: result.state, playerUids: activeSession.playerUids };
  return { ok: true, session: activeSession };
}

export function rollForPlayer(callerUid: string): SessionResult {
  if (!activeSession) {
    return {
      ok: false,
      error: "NO_ACTIVE_GAME",
      message: "No active game. Start one first.",
    };
  }
  const playerId = resolvePlayerId(activeSession, callerUid);
  if (!playerId) {
    return {
      ok: false,
      error: "NOT_A_PLAYER",
      message: "You are not a player in the active game.",
    };
  }
  if (activeSession.state.currentPlayer !== playerId) {
    return { ok: false, error: "NOT_YOUR_TURN", message: "It is not your turn." };
  }

  return applyEngineResult(rollDice(activeSession.state));
}

export function holdForPlayer(callerUid: string): SessionResult {
  if (!activeSession) {
    return {
      ok: false,
      error: "NO_ACTIVE_GAME",
      message: "No active game. Start one first.",
    };
  }
  const playerId = resolvePlayerId(activeSession, callerUid);
  if (!playerId) {
    return {
      ok: false,
      error: "NOT_A_PLAYER",
      message: "You are not a player in the active game.",
    };
  }
  if (activeSession.state.currentPlayer !== playerId) {
    return { ok: false, error: "NOT_YOUR_TURN", message: "It is not your turn." };
  }

  return applyEngineResult(engineHold(activeSession.state));
}

export function getActiveSession(): GameSession | null {
  return activeSession;
}
