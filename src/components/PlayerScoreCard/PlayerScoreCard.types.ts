export interface PlayerScoreCardProps {
  displayName: string;
  photoURL: string | null;
  score: number;
  wins: number;
  isCurrentTurn: boolean;
}
