import { BUST_DIE_VALUE, DEFAULT_WINNING_SCORE, DIE_MAX, DIE_MIN } from "./constants";
import type {
  DiceRoll,
  GameActionResult,
  GameState,
  PlayerId,
  RandomFn,
} from "./types";

function otherPlayer(player: PlayerId): PlayerId {
  return player === "player1" ? "player2" : "player1";
}

function rollDie(rng: RandomFn): number {
  return Math.floor(rng() * (DIE_MAX - DIE_MIN + 1)) + DIE_MIN;
}

function isValidWinningScore(winningScore: number): boolean {
  return Number.isInteger(winningScore) && winningScore > 0;
}

export function createGame(
  winningScore: number = DEFAULT_WINNING_SCORE
): GameActionResult {
  if (!isValidWinningScore(winningScore)) {
    return {
      ok: false,
      error: "INVALID_WINNING_SCORE",
      message: `winningScore must be a positive integer, got ${winningScore}`,
    };
  }

  return {
    ok: true,
    state: {
      winningScore,
      scores: { player1: 0, player2: 0 },
      currentPlayer: "player1",
      roundScore: 0,
      lastRoll: null,
      wasBust: false,
      status: "in_progress",
      winner: null,
    },
  };
}

export function rollDice(
  state: GameState,
  rng: RandomFn = Math.random
): GameActionResult {
  if (state.status === "finished") {
    return {
      ok: false,
      error: "GAME_FINISHED",
      message: "Cannot roll — the game has already finished.",
    };
  }

  const roll: DiceRoll = { die1: rollDie(rng), die2: rollDie(rng) };
  const isBust = roll.die1 === BUST_DIE_VALUE && roll.die2 === BUST_DIE_VALUE;

  return {
    ok: true,
    state: {
      ...state,
      lastRoll: roll,
      wasBust: isBust,
      roundScore: isBust ? 0 : state.roundScore + roll.die1 + roll.die2,
      currentPlayer: isBust
        ? otherPlayer(state.currentPlayer)
        : state.currentPlayer,
    },
  };
}

export function hold(state: GameState): GameActionResult {
  if (state.status === "finished") {
    return {
      ok: false,
      error: "GAME_FINISHED",
      message: "Cannot hold — the game has already finished.",
    };
  }

  const bankedScore = state.scores[state.currentPlayer] + state.roundScore;
  const hasWon = bankedScore >= state.winningScore;

  return {
    ok: true,
    state: {
      ...state,
      scores: { ...state.scores, [state.currentPlayer]: bankedScore },
      roundScore: 0,
      lastRoll: null,
      wasBust: false,
      currentPlayer: hasWon
        ? state.currentPlayer
        : otherPlayer(state.currentPlayer),
      status: hasWon ? "finished" : "in_progress",
      winner: hasWon ? state.currentPlayer : null,
    },
  };
}
