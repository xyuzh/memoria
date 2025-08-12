/**
 * Configuration management for the AI Agent Memory System
 */
export declare const config: {
    openai: {
        apiKey: string;
        model: string;
        embeddingModel: string;
    };
    weaviate: {
        url: string;
        apiKey: string | undefined;
    };
    pinecone: {
        apiKey: string;
        environment: string;
        indexName: string;
    };
    firebase: {
        projectId: string;
        privateKeyId: string;
        privateKey: string;
        clientEmail: string;
        clientId: string;
        authUri: string;
        tokenUri: string;
    };
    memory: {
        stmBufferSize: number;
        mtmRetrievalLimit: number;
        semanticTreeMaxDepth: number;
        episodicRetentionDays: number;
    };
    agent: {
        name: string;
        version: string;
        debugMode: boolean;
    };
};
/**
 * Validate required configuration
 */
export declare function validateConfig(): void;
//# sourceMappingURL=config.d.ts.map