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

    console.log("Embeddings:", embeddings);
    return embeddings;
  }

  public async calculateSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    // TODO: Implement similarity calculation

    return 0.5;
  }
}

export default GeminiApiClient;
