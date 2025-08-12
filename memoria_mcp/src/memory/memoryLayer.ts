import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';
import { v4 as uuidv4 } from 'uuid';

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

export class SimplifiedMemoryLayer {
  private client: WeaviateClient;
  private className = 'ConversationMemory';

  constructor(weaviateUrl: string, apiKey?: string) {
    const config: any = {
      scheme: 'https',
      host: weaviateUrl,
    };

    if (apiKey) {
      config.apiKey = new ApiKey(apiKey);
    }

    this.client = weaviate.client(config);
    this.initializeSchema();
  }

  private async initializeSchema() {
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
    } catch (error) {
      console.error('Schema initialization error:', error);
    }
  }

  async retrieveContext(userInput: string, limit: number = 5): Promise<RetrievalContext> {
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
      const recentConversations: MemoryEntry[] = memories.map((m: any) => ({
        id: m._additional?.id || uuidv4(),
        userInput: m.userInput,
        response: m.response,
        concepts: m.concepts || [],
        timestamp: new Date(m.timestamp),
        episodeId: m.episodeId,
      }));

      // Extract unique concepts and facts
      const allConcepts = new Set<string>();
      const relevantFacts: string[] = [];

      memories.forEach((m: any) => {
        (m.concepts || []).forEach((c: string) => allConcepts.add(c));
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
    } catch (error) {
      console.error('Retrieval error:', error);
      return {
        recentConversations: [],
        relevantFacts: [],
        relatedConcepts: [],
      };
    }
  }

  async storeMemory(userInput: string, response: string, concepts: string[] = []): Promise<void> {
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
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  private extractConcepts(text: string): string[] {
    // Simple concept extraction - enhance with NLP later
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
    
    return words
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 10);
  }

  buildEnhancedPrompt(userInput: string, context: RetrievalContext): string {
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