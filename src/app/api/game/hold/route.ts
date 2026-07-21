import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { holdForPlayer } from "@/lib/dice-game";
import { statusForSessionError } from "../errors";
import { serializeSession } from "../serialize";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const result = holdForPlayer(auth.profile.uid);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: statusForSessionError(result.error) }
    );
  }

  return NextResponse.json(serializeSession(result.session));
}
