import { getDb } from "@/lib/db/mongo";

const COLLECTION_NAME = "playerWins";

interface PlayerWinsDocument {
  uid: string;
  wins: number;
}

export async function incrementWins(uid: string): Promise<number> {
  const db = await getDb();
  const result = await db
    .collection<PlayerWinsDocument>(COLLECTION_NAME)
    .findOneAndUpdate(
      { uid },
      { $inc: { wins: 1 } },
      { upsert: true, returnDocument: "after" }
    );

  return result?.wins ?? 1;
}

export async function getWins(uid: string): Promise<number> {
  const db = await getDb();
  const doc = await db
    .collection<PlayerWinsDocument>(COLLECTION_NAME)
    .findOne({ uid });

  return doc?.wins ?? 0;
}
