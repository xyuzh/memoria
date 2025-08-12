/**
 * Core AI Agent - Orchestrates all memory layers and provides intelligent responses
 */
export declare class AIAgent {
    private openai;
    private stm;
    private mtlm;
    private semanticTree;
    private episodicMemory;
    private embeddingService;
    constructor();
    /**
     * Initialize the agent and all memory systems
     */
    initialize(): Promise<void>;
    /**
     * Process user input and generate response using all memory layers
     */
    processInput(input: string, context?: Record<string, any>): Promise<string>;
    /**
     * Retrieve relevant context from all memory layers
     */
    private retrieveRelevantMemory;
    /**
     * Generate response using OpenAI with memory context
     */
    private generateResponse;
    /**
     * Update semantic concepts based on the interaction
     */
    private updateSemanticConcepts;
    /**
     * Extract key concepts from text (simplified implementation)
     */
    private extractConcepts;
    /**
     * Evaluate if interaction should be stored in long-term memory
     */
    private evaluateForLongTermStorage;
    /**
     * Evaluate if this should be stored as an episodic event
     */
    private evaluateForEpisodicStorage;
    /**
     * Calculate interaction importance score
     */
    private calculateInteractionImportance;
    /**
     * Calculate event importance score
     */
    private calculateEventImportance;
    /**
     * Calculate overall relevance score for memory retrieval
     */
    private calculateRelevanceScore;
    /**
     * Get comprehensive memory statistics
     */
    getMemoryStats(): Promise<{
        stm: any;
        mtlm: any;
        semanticTree: any;
        episodicMemory: any;
    }>;
    /**
     * Perform memory maintenance tasks
     */
    performMaintenance(): Promise<{
        prunedConcepts: number;
        deletedOldInteractions: number;
        deletedOldEvents: number;
    }>;
    /**
     * Export all memory data
     */
    exportMemory(): Promise<{
        stm: any;
        semanticTree: any;
        timestamp: Date;
    }>;
    /**
     * Search across all memory systems
     */
    searchMemory(query: string): Promise<{
        interactions: any[];
        concepts: any[];
        events: any[];
    }>;
}
//# sourceMappingURL=agent.d.ts.map