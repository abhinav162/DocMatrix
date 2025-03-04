import axios from 'axios';
import Bottleneck from 'bottleneck';
import { CacheUtil } from '../utils/cacheUtil';

class GeminiApiClient {
  private apiKey: string;
  private apiUrl: string;
  private rateLimiter: Bottleneck;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.rateLimiter = new Bottleneck({
      minTime: 200, // 5 requests per second
    });
  }

  private async request(endpoint: string, data: any) {
    const cachedResponse = CacheUtil.get(endpoint);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.rateLimiter.schedule(() =>
      axios.post(`${this.apiUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
    );

    CacheUtil.set(endpoint, response.data);
    return response.data;
  }

  public async getEmbeddings(text: string): Promise<number[]> {
    const data = { text };
    const response = await this.request('/embeddings', data);
    return response.embeddings;
  }

  public async calculateSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    const data = { embedding1, embedding2 };
    const response = await this.request('/similarity', data);
    return response.similarity;
  }
}

export default GeminiApiClient;
