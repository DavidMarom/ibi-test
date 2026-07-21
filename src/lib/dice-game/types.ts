export type PlayerId = "player1" | "player2";

export type GameStatus = "in_progress" | "finished";

export interface DiceRoll {
  die1: number;
  die2: number;
}

export interface GameState {
  winningScore: number;
  scores: Record<PlayerId, number>;
  currentPlayer: PlayerId;
  roundScore: number;
  lastRoll: DiceRoll | null;
  wasBust: boolean;
  status: GameStatus;
  winner: PlayerId | null;
}

export type GameActionErrorCode =
  | "GAME_FINISHED"
  | "INVALID_WINNING_SCORE";

export interface GameActionFailure {
  ok: false;
  error: GameActionErrorCode;
  message: string;
}

export interface GameActionSuccess {
  ok: true;
  state: GameState;
}

export type GameActionResult = GameActionSuccess | GameActionFailure;

export type RandomFn = () => number;

export interface GameSession {
  state: GameState;
  playerUids: Record<PlayerId, string>;
}

export type SessionErrorCode =
  | GameActionErrorCode
  | "NO_ACTIVE_GAME"
  | "NOT_A_PLAYER"
  | "NOT_YOUR_TURN";

export interface SessionFailure {
  ok: false;
  error: SessionErrorCode;
  message: string;
}

export interface SessionSuccess {
  ok: true;
  session: GameSession;
}

export type SessionResult = SessionSuccess | SessionFailure;
