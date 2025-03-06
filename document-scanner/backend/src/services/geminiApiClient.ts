import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiApiClient {
  private genAI: any;
  private model: any;

  constructor(apiKey: string, apiUrl: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async getEmbeddings(text: string): Promise<{ values: number[] }> {
    const data = { text };
    this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });

    const embeddings = await this.model.embedContent(data.text);
    return embeddings?.embedding;
  }

  public async calculateSimilarity(embedding1: { values: number[] }, embedding2: { values: number[] }): Promise<number> {
    if (!embedding1 || !embedding2 || !embedding1.values || !embedding2.values || embedding1.values.length === 0 || embedding2.values.length === 0) {
      return 0; // Handle empty or null embeddings gracefully
    }
    if (embedding1.values.length !== embedding2.values.length) {
      throw new Error("Embeddings must have the same dimensions for similarity calculation.");
    }

    // Cosine Similarity Calculation
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.values.length; i++) {
      dotProduct += embedding1.values[i] * embedding2.values[i];
      magnitude1 += embedding1.values[i] * embedding1.values[i];
      magnitude2 += embedding2.values[i] * embedding2.values[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0; // Handle zero magnitude to avoid division by zero
    }

    const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
    
    // const normalizedSimilarity = (cosineSimilarity + 1) / 2 * 100;
    console.log('Cosine Similarity:', cosineSimilarity);

    return cosineSimilarity;
  }
}

export default GeminiApiClient;
