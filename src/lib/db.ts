import "server-only";
import { MongoClient, type Db } from "mongodb";

type Cache = { client?: MongoClient; promise?: Promise<Db>; indexes?: Promise<unknown> };
const g = globalThis as unknown as { _mongo?: Cache };
const cache: Cache = (g._mongo ??= {});

export function getDb(): Promise<Db> {
  if (!cache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI não configurada");
    cache.client = new MongoClient(uri, { appName: "clube-do-paper" });
    cache.promise = cache.client
      .connect()
      .then((c) => c.db(process.env.MONGODB_DB || "clube-do-paper"))
      .catch((err) => {
        cache.promise = undefined;
        throw err;
      });
  }
  return cache.promise.then(async (db) => {
    cache.indexes ??= Promise.all([
      db.collection("turmas").createIndex({ slug: 1 }, { unique: true }),
      db.collection("inscricoes").createIndex({ turmaId: 1, githubId: 1 }, { unique: true }),
    ]).catch((err) => {
      cache.indexes = undefined;
      throw err;
    });
    await cache.indexes;
    return db;
  });
}
