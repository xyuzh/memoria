interface MemoryEntry {
    id: string;
    userInput: string;
    response: string;
    concepts: string[];
    timestamp: Date;
    episodeId: string;
}
interface RetrievalContext {
    recentConversations: MemoryEntry[];
    relevantFacts: string[];
    relatedConcepts: string[];
}
export declare class SimplifiedMemoryLayer {
    private client;
    private className;
    constructor(weaviateUrl: string, apiKey?: string);
    private initializeSchema;
    retrieveContext(userInput: string, limit?: number): Promise<RetrievalContext>;
    storeMemory(userInput: string, response: string, concepts?: string[]): Promise<void>;
    private extractConcepts;
    buildEnhancedPrompt(userInput: string, context: RetrievalContext): string;
}
export {};
//# sourceMappingURL=memoryLayer.d.ts.map