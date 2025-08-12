"use strict";
/**
 * Configuration management for the AI Agent Memory System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
    },
    weaviate: {
        url: process.env.WEAVIATE_URL || 'http://localhost:8080',
        apiKey: process.env.WEAVIATE_API_KEY,
    },
    pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        environment: process.env.PINECONE_ENVIRONMENT || '',
        indexName: process.env.PINECONE_INDEX_NAME || 'ai-agent-memory',
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        clientId: process.env.FIREBASE_CLIENT_ID || '',
        authUri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        tokenUri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    },
    memory: {
        stmBufferSize: parseInt(process.env.STM_BUFFER_SIZE || '50'),
        mtmRetrievalLimit: parseInt(process.env.MTM_RETRIEVAL_LIMIT || '10'),
        semanticTreeMaxDepth: parseInt(process.env.SEMANTIC_TREE_MAX_DEPTH || '5'),
        episodicRetentionDays: parseInt(process.env.EPISODIC_MEMORY_RETENTION_DAYS || '365'),
    },
    agent: {
        name: process.env.AGENT_NAME || 'AI-Agent-Memory',
        version: process.env.AGENT_VERSION || '1.0.0',
        debugMode: process.env.DEBUG_MODE === 'true',
    },
};
/**
 * Validate required configuration
 */
function validateConfig() {
    const requiredFields = [
        { key: 'OPENAI_API_KEY', value: exports.config.openai.apiKey },
    ];
    const missingFields = requiredFields.filter(field => !field.value);
    if (missingFields.length > 0) {
        throw new Error(`Missing required configuration: ${missingFields.map(f => f.key).join(', ')}`);
    }
}
//# sourceMappingURL=config.js.map