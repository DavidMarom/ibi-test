import type { AuthedPlayer } from "@/types/player";

export interface GameBoardProps {
  player1: AuthedPlayer;
  player2: AuthedPlayer;
}

export type PendingAction = "setup" | "reset" | "roll" | "hold" | null;
