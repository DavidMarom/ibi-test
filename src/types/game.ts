export type GameStatus = "in_progress" | "finished";

export interface DiceRoll {
  die1: number;
  die2: number;
}

export interface PublicPlayer {
  id: "player1" | "player2";
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
}

export interface GameStateResponse {
  status: GameStatus;
  winningScore: number;
  roundScore: number;
  lastRoll: DiceRoll | null;
  wasBust: boolean;
  currentPlayerUid: string;
  winnerUid: string | null;
  players: [PublicPlayer, PublicPlayer];
}
