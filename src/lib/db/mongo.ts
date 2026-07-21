import { MongoClient, type Db } from "mongodb";

const DB_NAME = "ibi_dice_game";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set.");
  }

  // Cached on `globalThis` so hot-reloads in dev and repeated invocations of
  // this module (Next.js can execute route handler modules many times) reuse
  // a single connection instead of opening a new one per call.
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri).connect();
  }

  return globalThis._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
