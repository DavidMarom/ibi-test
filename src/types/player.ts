export interface AuthedPlayer {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  getIdToken: () => Promise<string>;
}
