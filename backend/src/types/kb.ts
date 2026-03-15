import { Document } from "@langchain/core/documents";
import z from "zod";

export interface KBChunk {
  namespace: string; // logical grouping for chunks
  source: string; // source file
  chunkId: number;
  text: string;
  embeddings: number[];
}

export type SupportedMime = "application/pdf" | "text/markdown" | "text/plain";
export interface LoadFileArgs {
  buffer: Buffer;
  mimeType: SupportedMime;
  originalName: string;
}

export const DEFAULT_CHUNK_SIZE = 800;
export const DEFAULT_CHUNK_OVERLAP = 200;
export interface IngestSummary {
  ok: boolean;
  namespace: string;
  totalChunks: number;
  sources: string[];
  message?: string;
}

export interface RetrieverResult {
  docs: Document[];
  confidence: number;
}

export const UploadFormDataSchema = z.object({
  namespace: z.string().default("default"),
  source: z.string().optional().default(""),
});

export type UploadFormData = z.infer<typeof UploadFormDataSchema>;
