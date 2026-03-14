import { Document } from "@langchain/core/documents";
import { LoadFileArgs, SupportedMime } from "../types/kb.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { Blob } from "buffer";

export async function loadFileAsDocuments(
  args: LoadFileArgs,
): Promise<Document[]> {
  const { buffer, mimeType, originalName } = args;
  const extension = getExtension(originalName);

  const isMarkdown =
    mimeType === "text/markdown" ||
    extension === "md" ||
    extension === "markdown";
  const isText = mimeType === "text/plain" || extension === "txt";
  const isPDF = mimeType === "application/pdf" || extension === "pdf";

  if (isPDF) {
    const blob = new Blob([buffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob as any);
    const docs = await loader.load();
    return docs.map(doc => ({
      ...doc,
      metadata: { ...doc.metadata, source: originalName },
    }));
  }

  if (isMarkdown || isText) {
    // TextLoader needs a string, decode the buffer
    const text = buffer.toString("utf-8");
    return [
      new Document({
        pageContent: text,
        metadata: { source: originalName },
      }),
    ];
  }

  return [];
}

function getExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1);
}
