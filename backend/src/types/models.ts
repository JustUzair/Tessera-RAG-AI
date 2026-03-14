import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import z from "zod";

export type ModelOptions = {
  temperature?: number;
  maxTokens?: number;
};
export type Model = ChatGoogleGenerativeAI | ChatGroq | ChatOpenAI;
export const EmbeddingsModelSchema = z.object({
  model: z.string().min(1, "Embeddings model is required"),
  apiKey: z.string().min(1, "Embeddings API key is required"),
});

export type EmbeddingsModel = z.infer<typeof EmbeddingsModelSchema>;

export type MakeModel = {
  model: BaseChatModel;
  embeddings_model: EmbeddingsModel;
};
