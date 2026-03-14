import { Collection as MongoDBCollection } from "mongodb";
import {
  MongoDBAtlasVectorSearch,
  MongoDBCache,
  MongoDBStore,
} from "@langchain/mongodb";
import { getDb } from "../utils/mongo-client.js";
import { env } from "../utils/env.js";
import { makeEmbeddingsModel } from "../utils/models.js";
import { CacheBackedEmbeddings } from "@langchain/classic/embeddings/cache_backed";

const db = getDb();
let collectionPromise: Promise<MongoDBCollection> | null = null;
let cachePromise: Promise<MongoDBCollection> | null = null;
let vectorStorePromise: Promise<MongoDBAtlasVectorSearch> | null = null;

export async function getKbCollection(): Promise<MongoDBCollection> {
  if (!collectionPromise) {
    collectionPromise = (async () => {
      const collection = db.collection(env.MONGODB_COLLECTION_NAME);
      // ── Dedup lookup index ──
      await collection.createIndex(
        { "metadata.namespace": 1, "metadata.source": 1 },
        { background: true },
      );
      return collection;
    })();
  }
  return collectionPromise;
}
export async function getKbCacheCollection(): Promise<MongoDBCollection> {
  if (!cachePromise) {
    cachePromise = (async () => {
      const collection = db.collection(
        env.MONGODB_KB_CACHE_COLLECTION_NAME,
        {},
      );
      await collection.createIndex(
        {
          key: 1,
        },
        {
          unique: true,
          sparse: true,
          background: true,
        },
      );
      return collection;
    })();
  }
  return cachePromise;
}

export async function getVectorStore(): Promise<MongoDBAtlasVectorSearch> {
  if (!vectorStorePromise) {
    vectorStorePromise = (async () => {
      const [kbCacheCollection, collection] = await Promise.all([
        getKbCacheCollection(),
        getKbCollection(),
      ]);
      const mongoCacheStore = new MongoDBStore({
        collection: kbCacheCollection as any,
        namespace: "kb_cache_store",
      });

      const embeddings = makeEmbeddingsModel();
      const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
        embeddings,
        mongoCacheStore,
        {
          namespace: "kb_cache",
        },
      );
      const vectorStore = new MongoDBAtlasVectorSearch(cacheBackedEmbeddings, {
        collection: collection as any,
        indexName: env.MONGODB_INDEX_NAME,
        textKey: "text",
        embeddingKey: "embedding",
      });

      return vectorStore;
    })();
  }
  return vectorStorePromise;
}
