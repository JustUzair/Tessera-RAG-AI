import { Document } from "@langchain/core/documents";
import { IngestSummary } from "./../types/kb.js";
import { getKbCollection, getVectorStore } from "./03_vector_store.js";

export async function ingestDocuments(
  namespace: string,
  chunks: Document[],
): Promise<IngestSummary> {
  try {
    if (!namespace) {
      throw new Error("Namespace is needed!");
    }
    if (!chunks.length) {
      return {
        ok: false,
        namespace,
        totalChunks: 0,
        sources: [],
        message: "No chunks to ingest",
      };
    }

    const vectorStore = await getVectorStore();
    const collection = await getKbCollection();
    // >>> Dedup check: look for any existing doc with the same source + namespace ──
    const incomingSources = Array.from(
      new Set(chunks.map(c => (c.metadata?.source ?? "unknown") as string)),
    );
    const existingDocs = await collection
      .find({
        namespace,
        source: { $in: incomingSources },
      })
      .limit(1)
      .toArray();

    if (existingDocs.length > 0) {
      return {
        ok: true,
        namespace,
        totalChunks: chunks.length,
        sources: incomingSources,
        message: "Document(s) already ingested (cache hit)",
      };
    }
    // New Ingestion
    let currentId = 0;
    const docsWithMetadata = chunks.map(chunk => {
      const source = (chunk?.metadata?.source ?? "unknown_source") as string;
      const doc = new Document({
        pageContent: chunk.pageContent,
        metadata: {
          namespace,
          source,
          chunkId: currentId++,
        },
      });
      return doc;
    });
    await vectorStore.addDocuments(docsWithMetadata);
    const sources = Array.from(
      new Set(docsWithMetadata.map(doc => doc.metadata.source as string)),
    );
    return {
      ok: true,
      namespace,
      totalChunks: docsWithMetadata.length,
      sources,
      message: "Documents ingested successfully",
    };
  } catch (err) {
    if ((err as any).code === 11000) {
      // duplicate cache key, document already embedded, this is expected
      return {
        ok: true,
        namespace,
        totalChunks: chunks.length,
        sources: Array.from(
          new Set(chunks.map(c => (c.metadata?.source ?? "unknown") as string)),
        ),
        message: "Document(s) already ingested (cache hit)",
      };
    }

    console.error("Ingestion failed:", err);
    throw err;
  }
}
