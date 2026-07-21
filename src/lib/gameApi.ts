import type { GameStateResponse } from "@/types/game";

async function parseGameResponse(res: Response): Promise<GameStateResponse> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data.message === "string" ? data.message : "Something went wrong. Try again.";
    throw new Error(message);
  }
  return data as GameStateResponse;
}

async function postJson(path: string, idToken: string, body?: unknown): Promise<GameStateResponse> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseGameResponse(res);
}

export async function createGame(
  idToken: string,
  player1Uid: string,
  player2Uid: string,
  winningScore: number
): Promise<GameStateResponse> {
  return postJson("/api/game", idToken, { player1Uid, player2Uid, winningScore });
}

export async function resetGame(idToken: string, winningScore: number): Promise<GameStateResponse> {
  return postJson("/api/game/new", idToken, { winningScore });
}

export async function rollDice(idToken: string): Promise<GameStateResponse> {
  return postJson("/api/game/roll", idToken);
}

export async function holdTurn(idToken: string): Promise<GameStateResponse> {
  return postJson("/api/game/hold", idToken);
}
