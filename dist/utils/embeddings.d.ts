/**
 * Embedding utilities for generating and managing vector embeddings
 */
export declare class EmbeddingService {
    private openai;
    constructor();
    /**
     * Generate embedding for a given text
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts in batch
     */
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(a: number[], b: number[]): number;
    /**
     * Find most similar embeddings from a collection
     */
    findMostSimilar(queryEmbedding: number[], embeddings: Array<{
        id: string;
        embedding: number[];
        metadata?: any;
    }>, topK?: number): Array<{
        id: string;
        similarity: number;
        metadata?: any;
    }>;
    /**
     * Normalize embedding vector
     */
    normalizeEmbedding(embedding: number[]): number[];
}
//# sourceMappingURL=embeddings.d.ts.map