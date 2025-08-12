"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedMemoryLayer = void 0;
const weaviate_client_1 = __importStar(require("weaviate-client"));
const uuid_1 = require("uuid");
class SimplifiedMemoryLayer {
    client = null;
    className = 'ConversationMemory';
    isInitialized = false;
    clientConfig;
    constructor(weaviateUrl, apiKey) {
        this.clientConfig = {
            scheme: 'https',
            host: weaviateUrl.replace('https://', '').replace('http://', ''),
        };
        if (apiKey) {
            this.clientConfig.apiKey = new weaviate_client_1.ApiKey(apiKey);
            // Also set OpenAI API key if available
            if (process.env.OPENAI_API_KEY) {
                this.clientConfig.headers = {
                    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
                };
            }
        }
        this.initializeClient();
    }
    async initializeClient() {
        try {
            this.client = await weaviate_client_1.default.client(this.clientConfig);
            await this.initializeSchema();
        }
        catch (error) {
            console.error('Failed to initialize Weaviate client:', error);
            // Fallback to sync client for older versions
            this.client = weaviate_client_1.default.client(this.clientConfig);
            this.initializeSchema();
        }
    }
    async initializeSchema() {
        if (this.isInitialized || !this.client)
            return;
        try {
            const schemaExists = await this.client.schema
                .classGetter()
                .withClassName(this.className)
                .do()
                .catch(() => null);
            if (!schemaExists) {
                await this.client.schema.classCreator().withClass({
                    class: this.className,
                    vectorizer: 'text2vec-openai',
                    properties: [
                        {
                            name: 'userInput',
                            dataType: ['text'],
                        },
                        {
                            name: 'response',
                            dataType: ['text'],
                        },
                        {
                            name: 'concepts',
                            dataType: ['text[]'],
                        },
                        {
                            name: 'timestamp',
                            dataType: ['date'],
                        },
                        {
                            name: 'episodeId',
                            dataType: ['string'],
                        },
                        {
                            name: 'userId',
                            dataType: ['string'],
                            indexInverted: true,
                        },
                        {
                            name: 'metadata',
                            dataType: ['text'],
                        },
                    ],
                }).do();
                console.log('Schema created successfully');
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Schema initialization error:', error);
            // Continue anyway - schema might already exist
            this.isInitialized = true;
        }
    }
    async retrieveContext(userInput, limit = 5, filters) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            let query = this.client.graphql
                .get()
                .withClassName(this.className)
                .withNearText({ concepts: [userInput] })
                .withLimit(limit)
                .withFields('userInput response concepts timestamp episodeId userId metadata');
            // Add where filters if provided
            if (filters?.userId) {
                query = query.withWhere({
                    path: ['userId'],
                    operator: 'Equal',
                    valueString: filters.userId,
                });
            }
            const result = await query.do();
            const memories = result.data.Get[this.className] || [];
            // Extract relevant information
            const recentConversations = memories.map((m) => ({
                id: m._additional?.id || (0, uuid_1.v4)(),
                userInput: m.userInput,
                response: m.response,
                concepts: m.concepts || [],
                timestamp: new Date(m.timestamp),
                episodeId: m.episodeId,
                userId: m.userId,
                metadata: m.metadata ? JSON.parse(m.metadata) : {},
            }));
            // Extract unique concepts and facts
            const allConcepts = new Set();
            const relevantFacts = [];
            const insights = [];
            memories.forEach((m) => {
                (m.concepts || []).forEach((c) => allConcepts.add(c));
                if (m.response) {
                    // Simple fact extraction
                    const sentences = m.response.split('. ');
                    relevantFacts.push(...sentences.slice(0, 2));
                }
            });
            // Generate simple insights
            if (memories.length > 0) {
                insights.push(`Found ${memories.length} relevant memories from past conversations`);
                if (allConcepts.size > 0) {
                    insights.push(`Related concepts: ${Array.from(allConcepts).slice(0, 5).join(', ')}`);
                }
            }
            return {
                recentConversations,
                relevantFacts: relevantFacts.slice(0, 10),
                relatedConcepts: Array.from(allConcepts),
                insights,
            };
        }
        catch (error) {
            console.error('Retrieval error:', error);
            return {
                recentConversations: [],
                relevantFacts: [],
                relatedConcepts: [],
                insights: [],
            };
        }
    }
    async storeMemory(userInput, response, concepts = [], userId, metadata) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            const episodeId = `episode-${Date.now()}`;
            await this.client.data
                .creator()
                .withClassName(this.className)
                .withProperties({
                userInput,
                response,
                concepts: concepts.length > 0 ? concepts : this.extractConcepts(userInput + ' ' + response),
                timestamp: new Date().toISOString(),
                episodeId,
                userId: userId || 'anonymous',
                metadata: metadata ? JSON.stringify(metadata) : null,
            })
                .do();
            console.log('Memory stored successfully');
        }
        catch (error) {
            console.error('Storage error:', error);
            throw error;
        }
    }
    extractConcepts(text) {
        // Simple concept extraction - enhance with NLP later
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'for', 'of', 'with', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'been']);
        const concepts = words
            .filter(w => w.length > 4 && !stopWords.has(w) && /^[a-z]+$/.test(w))
            .reduce((acc, word) => {
            acc.set(word, (acc.get(word) || 0) + 1);
            return acc;
        }, new Map());
        // Return top concepts by frequency
        return Array.from(concepts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
    buildEnhancedPrompt(userInput, context) {
        const { recentConversations, relevantFacts, relatedConcepts, insights } = context;
        let prompt = `System Memory Context:\n\n`;
        if (insights && insights.length > 0) {
            prompt += `Insights:\n`;
            insights.forEach(insight => {
                prompt += `- ${insight}\n`;
            });
            prompt += '\n';
        }
        if (recentConversations.length > 0) {
            prompt += `Recent Related Conversations:\n`;
            recentConversations.slice(0, 3).forEach(conv => {
                prompt += `- User: ${conv.userInput}\n  Assistant: ${conv.response.substring(0, 200)}...\n`;
            });
            prompt += '\n';
        }
        if (relevantFacts.length > 0) {
            prompt += `Relevant Facts:\n`;
            relevantFacts.slice(0, 5).forEach(fact => {
                prompt += `- ${fact}\n`;
            });
            prompt += '\n';
        }
        if (relatedConcepts.length > 0) {
            prompt += `Related Concepts: ${relatedConcepts.slice(0, 10).join(', ')}\n\n`;
        }
        prompt += `Current User Input: ${userInput}\n\n`;
        prompt += `Please provide a contextually aware response based on the conversation history and relevant information above.`;
        return prompt;
    }
    // Additional methods for visualization and management
    async getAllMemories(filters) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            let query = this.client.graphql
                .get()
                .withClassName(this.className)
                .withLimit(filters.limit || 100)
                .withFields('userInput response concepts timestamp episodeId userId metadata _additional { id }');
            if (filters.userId) {
                query = query.withWhere({
                    path: ['userId'],
                    operator: 'Equal',
                    valueString: filters.userId,
                });
            }
            const result = await query.do();
            const memories = result.data.Get[this.className] || [];
            return memories.map((m) => ({
                id: m._additional?.id || (0, uuid_1.v4)(),
                userInput: m.userInput,
                response: m.response,
                concepts: m.concepts || [],
                timestamp: m.timestamp,
                episodeId: m.episodeId,
                userId: m.userId,
                metadata: m.metadata ? JSON.parse(m.metadata) : {},
            }));
        }
        catch (error) {
            console.error('Get all memories error:', error);
            return [];
        }
    }
    async listMemories(params) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            const offset = (params.page - 1) * params.pageSize;
            let query = this.client.graphql
                .get()
                .withClassName(this.className)
                .withLimit(params.pageSize)
                .withOffset(offset)
                .withFields('userInput response concepts timestamp episodeId userId metadata _additional { id }');
            if (params.userId) {
                query = query.withWhere({
                    path: ['userId'],
                    operator: 'Equal',
                    valueString: params.userId,
                });
            }
            if (params.search) {
                query = query.withNearText({ concepts: [params.search] });
            }
            const result = await query.do();
            const memories = result.data.Get[this.className] || [];
            return {
                page: params.page,
                pageSize: params.pageSize,
                total: memories.length,
                memories: memories.map((m) => ({
                    id: m._additional?.id,
                    userInput: m.userInput,
                    response: m.response,
                    concepts: m.concepts || [],
                    timestamp: m.timestamp,
                    episodeId: m.episodeId,
                    userId: m.userId,
                })),
            };
        }
        catch (error) {
            console.error('List memories error:', error);
            return {
                page: params.page,
                pageSize: params.pageSize,
                total: 0,
                memories: [],
            };
        }
    }
    async searchMemories(searchTerm, searchType, limit, userId) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            let query = this.client.graphql
                .get()
                .withClassName(this.className)
                .withLimit(limit)
                .withFields('userInput response concepts timestamp episodeId userId metadata _additional { id certainty }');
            if (searchType === 'semantic' || searchType === 'hybrid') {
                query = query.withNearText({
                    concepts: [searchTerm],
                    certainty: 0.7,
                });
            }
            if (userId) {
                query = query.withWhere({
                    path: ['userId'],
                    operator: 'Equal',
                    valueString: userId,
                });
            }
            const result = await query.do();
            const memories = result.data.Get[this.className] || [];
            return memories.map((m) => ({
                id: m._additional?.id,
                userInput: m.userInput,
                response: m.response,
                concepts: m.concepts || [],
                timestamp: m.timestamp,
                episodeId: m.episodeId,
                userId: m.userId,
                certainty: m._additional?.certainty,
            }));
        }
        catch (error) {
            console.error('Search memories error:', error);
            return [];
        }
    }
    async getMemoryStats(userId) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            const memories = await this.getAllMemories({ userId, limit: 1000 });
            const conceptFrequency = new Map();
            const episodeCount = new Set();
            memories.forEach(m => {
                episodeCount.add(m.episodeId);
                (m.concepts || []).forEach(c => {
                    conceptFrequency.set(c, (conceptFrequency.get(c) || 0) + 1);
                });
            });
            return {
                totalMemories: memories.length,
                totalEpisodes: episodeCount.size,
                totalConcepts: conceptFrequency.size,
                topConcepts: Array.from(conceptFrequency.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20)
                    .map(([concept, count]) => ({ concept, count })),
                oldestMemory: memories.length > 0 ? memories[memories.length - 1].timestamp : null,
                newestMemory: memories.length > 0 ? memories[0].timestamp : null,
                averageConceptsPerMemory: memories.length > 0
                    ? memories.reduce((sum, m) => sum + (m.concepts?.length || 0), 0) / memories.length
                    : 0,
            };
        }
        catch (error) {
            console.error('Get stats error:', error);
            return {
                totalMemories: 0,
                totalEpisodes: 0,
                totalConcepts: 0,
                topConcepts: [],
            };
        }
    }
    async deleteMemory(memoryId, userId) {
        if (!this.client) {
            await this.initializeClient();
        }
        await this.initializeSchema();
        try {
            await this.client.data
                .deleter()
                .withClassName(this.className)
                .withId(memoryId)
                .do();
            console.log(`Memory ${memoryId} deleted successfully`);
        }
        catch (error) {
            console.error('Delete memory error:', error);
            throw error;
        }
    }
}
exports.SimplifiedMemoryLayer = SimplifiedMemoryLayer;
//# sourceMappingURL=memoryLayer.js.map