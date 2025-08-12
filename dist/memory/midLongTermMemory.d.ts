/**
 * Mid-Term / Long-Term Memory (MTM/LTM) - Vector database interface for semantic retrieval
 */
import { Interaction, VectorSearchResult } from '../types/memory';
export declare class MidLongTermMemory {
    private client;
    private embeddingService;
    private className;
    constructor();
    /**
     * Initialize the vector database schema
     */
    initialize(): Promise<void>;
    /**
     * Store an interaction in long-term memory
     */
    storeInteraction(interaction: Interaction, importance?: number): Promise<void>;
    /**
     * Retrieve similar interactions based on semantic similarity
     */
    retrieveSimilarInteractions(query: string, limit?: number): Promise<VectorSearchResult[]>;
    /**
     * Retrieve interactions by time range
     */
    retrieveInteractionsByTimeRange(startTime: Date, endTime: Date, limit?: number): Promise<VectorSearchResult[]>;
    /**
     * Update interaction importance score
     */
    updateInteractionImportance(interactionId: string, importance: number): Promise<void>;
    /**
     * Delete old interactions based on retention policy
     */
    cleanupOldInteractions(retentionDays?: number): Promise<number>;
    /**
     * Get memory statistics
     */
    getMemoryStats(): Promise<{
        totalInteractions: number;
        averageImportance: number;
        oldestInteraction?: Date;
        newestInteraction?: Date;
    }>;
}
//# sourceMappingURL=midLongTermMemory.d.ts.map