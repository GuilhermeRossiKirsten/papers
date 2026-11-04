import "server-only";
import { MongoClient, type Db } from "mongodb";

type Cache = { client?: MongoClient; promise?: Promise<Db>; indexes?: Promise<unknown> };
const g = globalThis as unknown as { _mongo?: Cache };
const cache: Cache = (g._mongo ??= {});

export function getDb(): Promise<Db> {
  if (!cache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI não configurada");
    cache.client = new MongoClient(uri, { appName: "openpapers" });
    cache.promise = cache.client
      .connect()
      .then((c) => c.db(process.env.MONGODB_DB || "openpapers"))
      .catch((err) => {
        cache.promise = undefined;
        throw err;
      });
  }
  return cache.promise.then(async (db) => {
    cache.indexes ??= Promise.all([
      db.collection("turmas").createIndex({ slug: 1 }, { unique: true }),
      db.collection("inscricoes").createIndex({ turmaId: 1, githubId: 1 }, { unique: true }),
      db.collection("mensagens").createIndex({ turmaId: 1, _id: -1 }),
      db.collection("mensagens").createIndex({ githubId: 1, _id: -1 }),
    ]).catch((err) => {
      cache.indexes = undefined;
      throw err;
    });
    await cache.indexes;
    return db;
  });
}
