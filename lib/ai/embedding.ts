import { embedMany } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const API = process.env.GEMINI_API_KEY

const google = createGoogleGenerativeAI({
    apiKey: API
})

const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
    outputDimensionality: 512
})

const generateChunks = (input: string): string[] => {
    return input
        .trim()
        .split('.')
        .filter(i => i !== '');
};

export const generateEmbeddings = async (
    value: string,
  ): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
  };