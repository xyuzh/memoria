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
    client;
    className = 'ConversationMemory';
    constructor(weaviateUrl, apiKey) {
        const config = {
            scheme: 'https',
            host: weaviateUrl,
        };
        if (apiKey) {
            config.apiKey = new weaviate_client_1.ApiKey(apiKey);
        }
        this.client = weaviate_client_1.default.client(config);
        this.initializeSchema();
    }
    async initializeSchema() {
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
                    ],
                }).do();
            }
        }
        catch (error) {
            console.error('Schema initialization error:', error);
        }
    }
    async retrieveContext(userInput, limit = 5) {
        try {
            // Semantic search for relevant memories
            const result = await this.client.graphql
                .get()
                .withClassName(this.className)
                .withNearText({ concepts: [userInput] })
                .withLimit(limit)
                .withFields('userInput response concepts timestamp episodeId')
                .do();
            const memories = result.data.Get[this.className] || [];
            // Extract relevant information
            const recentConversations = memories.map((m) => ({
                id: m._additional?.id || (0, uuid_1.v4)(),
                userInput: m.userInput,
                response: m.response,
                concepts: m.concepts || [],
                timestamp: new Date(m.timestamp),
                episodeId: m.episodeId,
            }));
            // Extract unique concepts and facts
            const allConcepts = new Set();
            const relevantFacts = [];
            memories.forEach((m) => {
                (m.concepts || []).forEach((c) => allConcepts.add(c));
                if (m.response) {
                    // Simple fact extraction - you can enhance this
                    const sentences = m.response.split('. ');
                    relevantFacts.push(...sentences.slice(0, 2));
                }
            });
            return {
                recentConversations,
                relevantFacts: relevantFacts.slice(0, 10),
                relatedConcepts: Array.from(allConcepts),
            };
        }
        catch (error) {
            console.error('Retrieval error:', error);
            return {
                recentConversations: [],
                relevantFacts: [],
                relatedConcepts: [],
            };
        }
    }
    async storeMemory(userInput, response, concepts = []) {
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
            })
                .do();
        }
        catch (error) {
            console.error('Storage error:', error);
        }
    }
    extractConcepts(text) {
        // Simple concept extraction - enhance with NLP later
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
        return words
            .filter(w => w.length > 4 && !stopWords.has(w))
            .slice(0, 10);
    }
    buildEnhancedPrompt(userInput, context) {
        const { recentConversations, relevantFacts, relatedConcepts } = context;
        let prompt = `System Memory Context:\n\n`;
        if (recentConversations.length > 0) {
            prompt += `Recent Conversations:\n`;
            recentConversations.forEach(conv => {
                prompt += `- User: ${conv.userInput}\n  Assistant: ${conv.response}\n`;
            });
            prompt += '\n';
        }
        if (relevantFacts.length > 0) {
            prompt += `Relevant Facts:\n`;
            relevantFacts.forEach(fact => {
                prompt += `- ${fact}\n`;
            });
            prompt += '\n';
        }
        if (relatedConcepts.length > 0) {
            prompt += `Related Concepts: ${relatedConcepts.join(', ')}\n\n`;
        }
        prompt += `Current User Input: ${userInput}\n\n`;
        prompt += `Please provide a contextually aware response based on the conversation history and relevant information above.`;
        return prompt;
    }
}
exports.SimplifiedMemoryLayer = SimplifiedMemoryLayer;
//# sourceMappingURL=memoryLayer.js.map