import type { PlayerProfile } from "./types";

const players = new Map<string, PlayerProfile>();

export function upsertPlayer(profile: PlayerProfile): void {
  players.set(profile.uid, profile);
}

export function getPlayer(uid: string): PlayerProfile | undefined {
  return players.get(uid);
}
