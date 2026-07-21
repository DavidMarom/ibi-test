import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

interface UsageEntry {
  input_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
}

interface JsonlLine {
  message?: {
    id?: string;
    usage?: UsageEntry;
  };
}

export async function GET(): Promise<NextResponse> {
  const dir = path.join(
    os.homedir(),
    '.claude',
    'projects',
    '-Users-david-mabul-pipeline'
  );

  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
  } catch {
    return NextResponse.json({ total: 0 });
  }

  const seen = new Set<string>();
  let total = 0;

  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(path.join(dir, file), 'utf-8');
    } catch {
      continue;
    }

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line) as JsonlLine;
        const msg = entry.message;
        if (!msg?.usage) continue;

        const id = msg.id;
        if (id) {
          if (seen.has(id)) continue;
          seen.add(id);
        }

        const u = msg.usage;
        total +=
          (u.input_tokens ?? 0) +
          (u.cache_creation_input_tokens ?? 0) +
          (u.cache_read_input_tokens ?? 0) +
          (u.output_tokens ?? 0);
      } catch {
        // skip malformed lines
      }
    }
  }

  return NextResponse.json({ total });
}
