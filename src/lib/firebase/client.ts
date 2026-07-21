import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export type PlayerSlot = "player1" | "player2";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getPlayerApp(slot: PlayerSlot): FirebaseApp {
  const existing = getApps().find((app) => app.name === slot);
  if (existing) return existing;
  return initializeApp(firebaseConfig, slot);
}

export function getPlayerAuth(slot: PlayerSlot): Auth {
  return getAuth(getPlayerApp(slot));
}
