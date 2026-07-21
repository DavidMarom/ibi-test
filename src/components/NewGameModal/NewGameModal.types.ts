export interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (winningScore: number) => void;
  defaultWinningScore: number;
  isLoading: boolean;
}
