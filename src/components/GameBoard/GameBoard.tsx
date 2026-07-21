"use client";

import { useRef, useState } from "react";
import { DiceFace } from "@/components/DiceFace/DiceFace";
import { GameSetup } from "@/components/GameSetup/GameSetup";
import { NewGameModal } from "@/components/NewGameModal/NewGameModal";
import { PlayerBadge } from "@/components/PlayerBadge/PlayerBadge";
import { PlayerScoreCard } from "@/components/PlayerScoreCard/PlayerScoreCard";
import { createGame, holdTurn, resetGame, rollDice } from "@/lib/gameApi";
import type { GameStateResponse } from "@/types/game";
import styles from "./GameBoard.module.css";
import {
  BUST_MESSAGE,
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
import { findPublicPlayer, resolveActingPlayer } from "./GameBoard.utils";

export function GameBoard({ player1, player2 }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const newGameTriggerRef = useRef<HTMLButtonElement>(null);

  const isBusy = pendingAction !== null;

  async function handleCreate(winningScore: number) {
    setPendingAction("setup");
    setError(null);
    try {
      const [token, player2Token] = await Promise.all([
        player1.getIdToken(),
        player2.getIdToken(),
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
      const acting = gameState ? resolveActingPlayer(gameState, player1, player2) : player1;
      const token = await acting.getIdToken();
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
              {gameState.wasBust && <p className={styles.bustText}>{BUST_MESSAGE}</p>}
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
