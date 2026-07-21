export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}k`;
  return count.toString();
}

export function readBaseline(key: string): number {
  const stored = localStorage.getItem(key);
  return stored !== null ? Number(stored) : 0;
}

export function writeBaseline(key: string, value: number): void {
  localStorage.setItem(key, String(value));
}
