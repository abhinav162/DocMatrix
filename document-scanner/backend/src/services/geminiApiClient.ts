import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiApiClient {
  private genAI: any;
  private model: any;

  constructor(apiKey: string, apiUrl: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async getEmbeddings(text: string): Promise<number[]> {
    const data = { text };
    this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });

    const embeddings = await this.model.embedContent(data.text);
    return embeddings;
  }

  public async calculateSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    if (!embedding1 || !embedding2 || embedding1.length === 0 || embedding2.length === 0) {
      return 0; // Handle empty or null embeddings gracefully
    }
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same dimensions for similarity calculation.");
    }

    // Cosine Similarity Calculation
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0; // Handle zero magnitude to avoid division by zero
    }

    const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);

    return cosineSimilarity;
  }
}

export default GeminiApiClient;
