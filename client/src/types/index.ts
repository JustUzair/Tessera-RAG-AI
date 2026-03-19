export type Citation = {
  source: string;
  chunkId: number;
  preview: string;
  readablePreview: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  ts: Date;
};

export type UploadResponse = {
  ok: boolean;
  namespace: string;
  totalChunks: number;
  sources: string[];
  message?: string;
};
