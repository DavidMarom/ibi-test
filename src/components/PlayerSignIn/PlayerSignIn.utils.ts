import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { AI_PLAYER_PROFILE } from "@/lib/dice-game/aiPlayer";
import { getPlayerAuth, type PlayerSlot } from "@/lib/firebase/client";
import type { AuthedPlayer } from "@/types/player";

export async function signInSlotWithGoogle(slot: PlayerSlot): Promise<AuthedPlayer> {
  const auth = getPlayerAuth(slot);
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);

  return {
    uid: user.uid,
    displayName: user.displayName ?? "Player",
    email: user.email,
    photoURL: user.photoURL,
    getIdToken: () => user.getIdToken(),
  };
}

export async function signOutSlot(slot: PlayerSlot): Promise<void> {
  await signOut(getPlayerAuth(slot));
}

export function createAiPlayer(): AuthedPlayer {
  return {
    ...AI_PLAYER_PROFILE,
    getIdToken: () => {
      throw new Error("The AI opponent has no ID token — its moves are triggered via /api/game/ai-move using the human player's own token.");
    },
  };
}
