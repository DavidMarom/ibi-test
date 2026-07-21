import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { getActiveSession, startGame } from "@/lib/dice-game";
import { statusForSessionError } from "./errors";
import { parseJsonBody } from "./parseBody";
import { serializeSession } from "./serialize";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const body = await parseJsonBody(request);
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { player1Uid, player2Uid, winningScore } = body;
  if (typeof player1Uid !== "string" || !player1Uid || typeof player2Uid !== "string" || !player2Uid) {
    return NextResponse.json(
      { message: "player1Uid and player2Uid (strings) are required." },
      { status: 400 }
    );
  }
  if (player1Uid === player2Uid) {
    return NextResponse.json(
      { message: "player1Uid and player2Uid must be two different players." },
      { status: 400 }
    );
  }
  if (winningScore !== undefined && typeof winningScore !== "number") {
    return NextResponse.json({ message: "winningScore must be a number." }, { status: 400 });
  }

  const result = startGame(auth.profile.uid, player1Uid, player2Uid, winningScore);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForSessionError(result.error) }
    );
  }

  return NextResponse.json(serializeSession(result.session));
}

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const session = getActiveSession();
  if (!session) {
    return NextResponse.json({ message: "No active game." }, { status: 409 });
  }

  return NextResponse.json(serializeSession(session));
}
