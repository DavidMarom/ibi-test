export async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}
