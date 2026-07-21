import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  return NextResponse.json({ profile: auth.profile });
}
