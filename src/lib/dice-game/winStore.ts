const wins = new Map<string, number>();

export function incrementWins(uid: string): number {
  const next = (wins.get(uid) ?? 0) + 1;
  wins.set(uid, next);
  return next;
}

export function getWins(uid: string): number {
  return wins.get(uid) ?? 0;
}
