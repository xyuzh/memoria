interface MemoryEntry {
    id: string;
    userInput: string;
    response: string;
    concepts: string[];
    timestamp: Date;
    episodeId: string;
    userId?: string;
    metadata?: Record<string, any>;
}
interface RetrievalContext {
    recentConversations: MemoryEntry[];
    relevantFacts: string[];
    relatedConcepts: string[];
    insights?: string[];
}
interface MemoryFilters {
    userId?: string;
    startDate?: string;
    endDate?: string;
    concepts?: string[];
    limit?: number;
}
interface ListMemoriesParams {
    userId?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    order: 'asc' | 'desc';
    search?: string;
}
export declare class SimplifiedMemoryLayer {
    private client;
    private className;
    private isInitialized;
    private clientConfig;
    constructor(weaviateUrl: string, apiKey?: string);
    private initializeClient;
    private initializeSchema;
    retrieveContext(userInput: string, limit?: number, filters?: MemoryFilters): Promise<RetrievalContext>;
    storeMemory(userInput: string, response: string, concepts?: string[], userId?: string, metadata?: Record<string, any>): Promise<void>;
    private extractConcepts;
    buildEnhancedPrompt(userInput: string, context: RetrievalContext): string;
    getAllMemories(filters: MemoryFilters): Promise<MemoryEntry[]>;
    listMemories(params: ListMemoriesParams): Promise<any>;
    searchMemories(searchTerm: string, searchType: 'semantic' | 'keyword' | 'hybrid', limit: number, userId?: string): Promise<MemoryEntry[]>;
    getMemoryStats(userId?: string): Promise<any>;
    deleteMemory(memoryId: string, userId: string): Promise<void>;
}
export {};
//# sourceMappingURL=memoryLayer.d.ts.map