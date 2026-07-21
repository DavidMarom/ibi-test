"use client";

import { useEffect, useRef, useState } from "react";
import { DiceFace } from "@/components/DiceFace/DiceFace";
import { GameSetup } from "@/components/GameSetup/GameSetup";
import { NewGameModal } from "@/components/NewGameModal/NewGameModal";
import { PlayerBadge } from "@/components/PlayerBadge/PlayerBadge";
import { PlayerScoreCard } from "@/components/PlayerScoreCard/PlayerScoreCard";
import { AI_PLAYER_UID } from "@/lib/dice-game/aiPlayer";
import { createGame, holdTurn, resetGame, rollDice, triggerAiMove } from "@/lib/gameApi";
import type { GameStateResponse } from "@/types/game";
import styles from "./GameBoard.module.css";
import {
  AI_EMOJI,
  AI_THINKING_DELAY_MS,
  AI_THINKING_LABEL,
  BUST_MESSAGE,
  BUST_PAUSE_DELAY_MS,
  DEFAULT_WINNING_SCORE,
  GENERIC_ERROR,
  HOLD_LABEL,
  HOLD_LOADING_LABEL,
  NEW_GAME_TRIGGER_LABEL,
  ROLL_LABEL,
  ROLL_LOADING_LABEL,
  ROUND_SCORE_PREFIX,
  SETUP_HEADING,
  WINNING_SCORE_PREFIX,
  WIN_CAPTION_PREFIX,
} from "./GameBoard.constants";
import type { GameBoardProps, PendingAction } from "./GameBoard.types";
import {
  delay,
  findPublicPlayer,
  isAiTurn,
  playSoundForResult,
  resolveActingPlayer,
} from "./GameBoard.utils";

export function GameBoard({ player1, player2 }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bustKey, setBustKey] = useState(0);
  const newGameTriggerRef = useRef<HTMLButtonElement>(null);

  const isBusy = pendingAction !== null;

  async function handleCreate(winningScore: number) {
    setPendingAction("setup");
    setError(null);
    try {
      const isAiOpponent = player2.uid === AI_PLAYER_UID;
      const [token, player2Token] = await Promise.all([
        player1.getIdToken(),
        isAiOpponent ? Promise.resolve(undefined) : player2.getIdToken(),
      ]);
      const state = await createGame(token, player1.uid, player2.uid, winningScore, player2Token);
      setGameState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleReset(winningScore: number) {
    setPendingAction("reset");
    setError(null);
    try {
      // resetGame only requires the caller to be one of the two registered
      // players, not whoever's turn it currently is — so player1's own token
      // always works here, in both two-human and AI-opponent games (where
      // player2's synthetic AuthedPlayer has no real getIdToken to call).
      const token = await player1.getIdToken();
      const state = await resetGame(token, winningScore);
      setGameState(state);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRoll() {
    if (!gameState) return;
    setPendingAction("roll");
    setError(null);
    try {
      const acting = resolveActingPlayer(gameState, player1, player2);
      const token = await acting.getIdToken();
      const state = await rollDice(token);
      setGameState(state);
      playSoundForResult(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleHold() {
    if (!gameState) return;
    setPendingAction("hold");
    setError(null);
    try {
      const acting = resolveActingPlayer(gameState, player1, player2);
      const token = await acting.getIdToken();
      const state = await holdTurn(token);
      setGameState(state);
      playSoundForResult(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setPendingAction(null);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    newGameTriggerRef.current?.focus();
  }

  useEffect(() => {
    if (!gameState || gameState.status === "finished") return;
    if (pendingAction !== null) return;
    if (!gameState.wasBust && !isAiTurn(gameState)) return;

    let cancelled = false;

    // A bust pause and the AI's own "thinking" pause must always play in
    // sequence, never in parallel — e.g. a human busting into the AI's turn
    // shows the bust pause first, then the AI's thinking pause, then its
    // move. Driving both from one async effect (rather than two separate
    // effects that both depend on `gameState`) guarantees that ordering:
    // two independent effects can't see each other's setPendingAction call
    // within the same commit, so they'd otherwise race.
    (async () => {
      if (gameState.wasBust) {
        setBustKey((key) => key + 1);
        setPendingAction("bust");
        await delay(BUST_PAUSE_DELAY_MS);
        if (cancelled) return;
        setPendingAction(null);
      }

      if (!isAiTurn(gameState)) return;

      setPendingAction("ai");
      await delay(AI_THINKING_DELAY_MS);
      if (cancelled) return;

      try {
        const token = await player1.getIdToken();
        const state = await triggerAiMove(token);
        if (!cancelled) {
          setGameState(state);
          playSoundForResult(state);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : GENERIC_ERROR);
      } finally {
        if (!cancelled) setPendingAction(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  if (!gameState) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.setupCard}>
          <h1 className={styles.heading}>{SETUP_HEADING}</h1>
          <div className={styles.setupPlayers}>
            <PlayerBadge displayName={player1.displayName} photoURL={player1.photoURL} size="md" />
            <PlayerBadge displayName={player2.displayName} photoURL={player2.photoURL} size="md" />
          </div>
          <GameSetup
            defaultWinningScore={DEFAULT_WINNING_SCORE}
            onSubmit={handleCreate}
            submitLabel="Start Game"
            isLoading={pendingAction === "setup"}
          />
          {error && (
            <p className={styles.errorText} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const p1 = findPublicPlayer(gameState, player1.uid);
  const p2 = findPublicPlayer(gameState, player2.uid);
  const isFinished = gameState.status === "finished";
  const winner = isFinished ? (gameState.winnerUid === p1.uid ? p1 : p2) : null;
  const loser = winner === p1 ? p2 : p1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.board}>
        <div className={styles.scoreboard}>
          <PlayerScoreCard
            displayName={p1.displayName}
            photoURL={p1.photoURL}
            score={p1.score}
            wins={p1.wins}
            isCurrentTurn={!isFinished && gameState.currentPlayerUid === p1.uid}
          />
          <PlayerScoreCard
            displayName={p2.displayName}
            photoURL={p2.photoURL}
            score={p2.score}
            wins={p2.wins}
            isCurrentTurn={!isFinished && gameState.currentPlayerUid === p2.uid}
          />
        </div>

        {!isFinished && (
          <button
            ref={newGameTriggerRef}
            type="button"
            className={styles.newGameSecondary}
            disabled={isBusy}
            onClick={() => setIsModalOpen(true)}
          >
            {NEW_GAME_TRIGGER_LABEL}
          </button>
        )}

        <div className={styles.playArea}>
          <p className={styles.winningScoreCaption}>
            {WINNING_SCORE_PREFIX}
            {gameState.winningScore}
          </p>

          {isFinished && winner ? (
            <div className={styles.winBanner} role="alert">
              <p className={styles.winHeading}>🏆 {winner.displayName} wins!</p>
              <p className={styles.winCaption}>
                {WIN_CAPTION_PREFIX}
                {winner.score} – {loser.score}
              </p>
            </div>
          ) : (
            <div className={styles.liveStatus} role="status" aria-live="polite">
              <p className={styles.roundScore}>
                {ROUND_SCORE_PREFIX}
                {gameState.roundScore}
              </p>
              <div className={styles.dice}>
                <DiceFace value={gameState.lastRoll?.die1 ?? null} />
                <DiceFace value={gameState.lastRoll?.die2 ?? null} />
              </div>
              {gameState.wasBust && (
                <p key={bustKey} className={styles.bustText}>
                  {BUST_MESSAGE}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className={styles.errorText} role="alert">
              {error}
            </p>
          )}

          {isFinished ? (
            <button
              ref={newGameTriggerRef}
              type="button"
              className={styles.newGamePrimary}
              disabled={isBusy}
              onClick={() => setIsModalOpen(true)}
            >
              {NEW_GAME_TRIGGER_LABEL}
            </button>
          ) : pendingAction === "bust" ? (
            <div className={styles.bustPause} />
          ) : isAiTurn(gameState) ? (
            <div className={styles.aiThinking} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              <span aria-hidden="true">{AI_EMOJI}</span>
              {AI_THINKING_LABEL}
            </div>
          ) : (
            <div className={styles.actions}>
              <button type="button" className={styles.rollButton} disabled={isBusy} onClick={handleRoll}>
                {pendingAction === "roll" && <span className={styles.spinner} aria-hidden="true" />}
                {pendingAction === "roll" ? ROLL_LOADING_LABEL : ROLL_LABEL}
              </button>
              <button type="button" className={styles.holdButton} disabled={isBusy} onClick={handleHold}>
                {pendingAction === "hold" && <span className={styles.spinner} aria-hidden="true" />}
                {pendingAction === "hold" ? HOLD_LOADING_LABEL : HOLD_LABEL}
              </button>
            </div>
          )}
        </div>
      </div>

      <NewGameModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleReset}
        defaultWinningScore={gameState.winningScore}
        isLoading={pendingAction === "reset"}
      />
    </div>
  );
}
