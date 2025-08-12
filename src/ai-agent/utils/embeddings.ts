/**
 * Embedding utilities for generating and managing vector embeddings
 */

import OpenAI from 'openai';
import { config } from '../config/config';

export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Generate embedding for a given text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw new Error('Failed to generate batch embeddings');
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find most similar embeddings from a collection
   */
  findMostSimilar(
    queryEmbedding: number[],
    embeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
    topK: number = 5
  ): Array<{ id: string; similarity: number; metadata?: any }> {
    const similarities = embeddings.map(item => ({
      id: item.id,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
      metadata: item.metadata,
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Normalize embedding vector
   */
  normalizeEmbedding(embedding: number[]): number[] {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }
}
