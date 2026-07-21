"use client";

import { useState } from "react";
import { GoogleIcon, CheckIcon } from "@/components/icons";
import { PlayerBadge } from "@/components/PlayerBadge/PlayerBadge";
import type { PlayerSlot } from "@/lib/firebase/client";
import type { AuthedPlayer } from "@/types/player";
import styles from "./PlayerSignIn.module.css";
import {
  CAPTION,
  DUPLICATE_ACCOUNT_ERROR,
  GENERIC_ERROR,
  HEADING,
  LOADING_LABEL,
  PLAYER_LABELS,
  SIGNED_IN_LABEL,
  SIGN_IN_LABEL,
  START_GAME_DISABLED_HINT,
  START_GAME_LABEL,
} from "./PlayerSignIn.constants";
import { IDLE_SLOT_STATE, type SlotState } from "./PlayerSignIn.types";
import { signInSlotWithGoogle, signOutSlot } from "./PlayerSignIn.utils";

export interface PlayerSignInProps {
  onReady: (player1: AuthedPlayer, player2: AuthedPlayer) => void;
}

export function PlayerSignIn({ onReady }: PlayerSignInProps) {
  const [player1, setPlayer1] = useState<SlotState>(IDLE_SLOT_STATE);
  const [player2, setPlayer2] = useState<SlotState>(IDLE_SLOT_STATE);

  async function handleSignIn(slot: PlayerSlot) {
    const isPlayer1 = slot === "player1";
    const setSlot = isPlayer1 ? setPlayer1 : setPlayer2;
    const otherPlayer = isPlayer1 ? player2.player : player1.player;

    setSlot({ status: "loading", player: null, errorMessage: null });

    try {
      const authedPlayer = await signInSlotWithGoogle(slot);

      if (otherPlayer && authedPlayer.uid === otherPlayer.uid) {
        await signOutSlot(slot);
        setSlot({ status: "error", player: null, errorMessage: DUPLICATE_ACCOUNT_ERROR });
        return;
      }

      setSlot({ status: "signed_in", player: authedPlayer, errorMessage: null });
    } catch {
      setSlot({ status: "error", player: null, errorMessage: GENERIC_ERROR });
    }
  }

  const bothSignedIn = player1.player !== null && player2.player !== null;

  function handleStartGame() {
    if (player1.player && player2.player) {
      onReady(player1.player, player2.player);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.heading}>{HEADING}</h1>
        <p className={styles.caption}>{CAPTION}</p>

        <div className={styles.slots}>
          <PlayerSlotRow slot="player1" state={player1} onSignIn={handleSignIn} />
          <PlayerSlotRow slot="player2" state={player2} onSignIn={handleSignIn} />
        </div>

        <button
          type="button"
          className={styles.startButton}
          disabled={!bothSignedIn}
          aria-describedby={bothSignedIn ? undefined : "start-game-hint"}
          onClick={handleStartGame}
        >
          {START_GAME_LABEL}
        </button>
        {!bothSignedIn && (
          <span id="start-game-hint" className={styles.visuallyHidden}>
            {START_GAME_DISABLED_HINT}
          </span>
        )}
      </div>
    </div>
  );
}

interface PlayerSlotRowProps {
  slot: PlayerSlot;
  state: SlotState;
  onSignIn: (slot: PlayerSlot) => void;
}

function PlayerSlotRow({ slot, state, onSignIn }: PlayerSlotRowProps) {
  const label = PLAYER_LABELS[slot];

  return (
    <div className={styles.slotRow}>
      <div className={styles.slotContent} role="status" aria-live="polite">
        <div className={styles.slotIdentity}>
          {state.player ? (
            <PlayerBadge displayName={state.player.displayName} photoURL={state.player.photoURL} />
          ) : (
            <span className={styles.placeholderLabel}>{label}</span>
          )}
        </div>

        <div className={styles.slotAction}>
          {state.status === "signed_in" ? (
            <span className={styles.signedInStatus}>
              <CheckIcon />
              {SIGNED_IN_LABEL}
            </span>
          ) : (
            <button
              type="button"
              className={styles.signInButton}
              disabled={state.status === "loading"}
              aria-label={`${SIGN_IN_LABEL} — ${label}`}
              onClick={() => onSignIn(slot)}
            >
              {state.status === "loading" ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              {state.status === "loading" ? LOADING_LABEL : SIGN_IN_LABEL}
            </button>
          )}
        </div>
      </div>

      {state.status === "error" && state.errorMessage && (
        <p className={styles.errorText} role="alert">
          {state.errorMessage}
        </p>
      )}
    </div>
  );
}
