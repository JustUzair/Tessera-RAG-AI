import { Document } from "@langchain/core/documents";
import { RetrieverResult } from "../types/kb.js";
import { getVectorStore } from "./03_vector_store.js";

export async function retrieveRelevantChunks(
  query: string,
  namespace: string = "default",
  k: number = 2,
): Promise<RetrieverResult> {
  if (!query.trim()) {
    return {
      docs: [],
      confidence: 0,
    };
  }
  const vectorStore = await getVectorStore();
  const results = await vectorStore.similaritySearchWithScore(query, k, {
    namespace,
  });

  if (!results.length) {
    return {
      docs: [],
      confidence: 0,
    };
  }
  const [docs, scores] = results.reduce<[Document[], number[]]>(
    (acc, [document, score]) => {
      acc[0].push(document);
      acc[1].push(score);
      return acc;
    },
    [[], []],
  );

  const topScore = Math.max(...scores);
  const normalized = Math.max(0, Math.min(1, topScore));
  const confidence = Number(normalized.toFixed(2));

  return {
    docs,
    confidence,
  };
}
