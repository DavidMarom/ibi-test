export interface GameSetupProps {
  defaultWinningScore: number;
  onSubmit: (winningScore: number) => void;
  submitLabel: string;
  isLoading?: boolean;
}
