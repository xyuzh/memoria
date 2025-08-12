"use strict";
/**
 * Embedding utilities for generating and managing vector embeddings
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
class EmbeddingService {
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: config_1.config.openai.apiKey,
        });
    }
    /**
     * Generate embedding for a given text
     */
    async generateEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: config_1.config.openai.embeddingModel,
                input: text,
            });
            return response.data[0].embedding;
        }
        catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding');
        }
    }
    /**
     * Generate embeddings for multiple texts in batch
     */
    async generateBatchEmbeddings(texts) {
        try {
            const response = await this.openai.embeddings.create({
                model: config_1.config.openai.embeddingModel,
                input: texts,
            });
            return response.data.map(item => item.embedding);
        }
        catch (error) {
            console.error('Error generating batch embeddings:', error);
            throw new Error('Failed to generate batch embeddings');
        }
    }
    /**
     * Calculate cosine similarity between two embeddings
     */
    cosineSimilarity(a, b) {
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
    findMostSimilar(queryEmbedding, embeddings, topK = 5) {
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
    normalizeEmbedding(embedding) {
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / norm);
    }
}
exports.EmbeddingService = EmbeddingService;
//# sourceMappingURL=embeddings.js.map