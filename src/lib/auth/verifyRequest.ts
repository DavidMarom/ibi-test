import { createRemoteJWKSet, jwtVerify } from "jose";
import { FIREBASE_ISSUER_PREFIX, GOOGLE_JWK_URL } from "./constants";
import { upsertPlayer } from "./playerStore";
import type { AuthResult, PlayerProfile } from "./types";

const jwks = createRemoteJWKSet(new URL(GOOGLE_JWK_URL));

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

function readStringClaim(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

type TokenVerifyResult =
  | { ok: true; profile: PlayerProfile }
  | { ok: false; message: string };

export async function verifyIdToken(token: string): Promise<TokenVerifyResult> {
  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    return { ok: false, message: "Server auth is not configured (missing PROJECT_ID)." };
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer: `${FIREBASE_ISSUER_PREFIX}${projectId}`,
      audience: projectId,
    }));
  } catch {
    return { ok: false, message: "Invalid or expired token." };
  }

  const uid = readStringClaim(payload.sub);
  if (!uid) {
    return { ok: false, message: "Token is missing a subject." };
  }

  const profile: PlayerProfile = {
    uid,
    displayName: readStringClaim(payload.name) ?? uid,
    email: readStringClaim(payload.email),
    photoURL: readStringClaim(payload.picture),
  };

  upsertPlayer(profile);

  return { ok: true, profile };
}

export async function authenticateRequest(
  request: Request
): Promise<AuthResult> {
  const token = extractBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Missing bearer token." };
  }

  const result = await verifyIdToken(token);
  if (!result.ok) {
    return { ok: false, status: 401, message: result.message };
  }

  return { ok: true, profile: result.profile };
}
