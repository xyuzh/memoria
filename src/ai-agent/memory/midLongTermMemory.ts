/**
 * Mid-Term / Long-Term Memory (MTM/LTM) - Vector database interface for semantic retrieval
 */

import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { Interaction, VectorSearchResult } from '../types/memory';
import { config } from '../config/config';
import { EmbeddingService } from '../utils/embeddings';

export class MidLongTermMemory {
  private client: WeaviateClient;
  private embeddingService: EmbeddingService;
  private className = 'Interaction';

  constructor() {
    this.client = weaviate.client({
      scheme: config.weaviate.url.startsWith('https') ? 'https' : 'http',
      host: config.weaviate.url.replace(/^https?:\/\//, ''),
      apiKey: config.weaviate.apiKey ? new weaviate.ApiKey(config.weaviate.apiKey) : undefined,
    });
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Initialize the vector database schema
   */
  async initialize(): Promise<void> {
    try {
      // Check if class exists
      const exists = await this.client.schema.exists(this.className);
      
      if (!exists) {
        // Create schema for interactions
        await this.client.schema.classCreator()
          .withClass({
            class: this.className,
            description: 'AI Agent interactions for long-term memory',
            properties: [
              {
                name: 'interactionId',
                dataType: ['text'],
                description: 'Unique identifier for the interaction',
              },
              {
                name: 'input',
                dataType: ['text'],
                description: 'User input text',
              },
              {
                name: 'output',
                dataType: ['text'],
                description: 'Agent output text',
              },
              {
                name: 'timestamp',
                dataType: ['date'],
                description: 'When the interaction occurred',
              },
              {
                name: 'context',
                dataType: ['text'],
                description: 'Serialized context information',
              },
              {
                name: 'importance',
                dataType: ['number'],
                description: 'Importance score (0-1)',
              },
            ],
            vectorizer: 'none', // We'll provide our own vectors
          })
          .do();
      }
    } catch (error) {
      console.error('Error initializing MTM/LTM:', error);
      throw new Error('Failed to initialize vector database');
    }
  }

  /**
   * Store an interaction in long-term memory
   */
  async storeInteraction(interaction: Interaction, importance: number = 0.5): Promise<void> {
    try {
      // Generate embedding if not provided
      let embedding = interaction.embedding;
      if (!embedding) {
        const text = `${interaction.input} ${interaction.output}`;
        embedding = await this.embeddingService.generateEmbedding(text);
      }

      // Store in vector database
      await this.client.data.creator()
        .withClassName(this.className)
        .withProperties({
          interactionId: interaction.id,
          input: interaction.input,
          output: interaction.output,
          timestamp: interaction.timestamp.toISOString(),
          context: JSON.stringify(interaction.context || {}),
          importance,
        })
        .withVector(embedding)
        .do();

    } catch (error) {
      console.error('Error storing interaction:', error);
      throw new Error('Failed to store interaction in long-term memory');
    }
  }

  /**
   * Retrieve similar interactions based on semantic similarity
   */
  async retrieveSimilarInteractions(
    query: string,
    limit: number = config.memory.mtmRetrievalLimit
  ): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search for similar interactions
      const result = await this.client.graphql.get()
        .withClassName(this.className)
        .withFields('interactionId input output timestamp context importance')
        .withNearVector({
          vector: queryEmbedding,
        })
        .withLimit(limit)
        .do();

      // Transform results
      const interactions = result.data?.Get?.[this.className] || [];
      
      return interactions.map((item: any) => ({
        id: item.interactionId,
        score: item._additional?.certainty || 0,
        metadata: {
          timestamp: item.timestamp,
          importance: item.importance,
          context: JSON.parse(item.context || '{}'),
        },
        content: `Input: ${item.input}\nOutput: ${item.output}`,
      }));

    } catch (error) {
      console.error('Error retrieving similar interactions:', error);
      throw new Error('Failed to retrieve similar interactions');
    }
  }

  /**
   * Retrieve interactions by time range
   */
  async retrieveInteractionsByTimeRange(
    startTime: Date,
    endTime: Date,
    limit: number = 50
  ): Promise<VectorSearchResult[]> {
    try {
      const result = await this.client.graphql.get()
        .withClassName(this.className)
        .withFields('interactionId input output timestamp context importance')
        .withWhere({
          operator: 'And',
          operands: [
            {
              path: ['timestamp'],
              operator: 'GreaterThanEqual',
              valueDate: startTime.toISOString(),
            },
            {
              path: ['timestamp'],
              operator: 'LessThan',
              valueDate: endTime.toISOString(),
            },
          ],
        })
        .withLimit(limit)
        .do();

      const interactions = result.data?.Get?.[this.className] || [];
      
      return interactions.map((item: any) => ({
        id: item.interactionId,
        score: 1.0, // No similarity score for time-based queries
        metadata: {
          timestamp: item.timestamp,
          importance: item.importance,
          context: JSON.parse(item.context || '{}'),
        },
        content: `Input: ${item.input}\nOutput: ${item.output}`,
      }));

    } catch (error) {
      console.error('Error retrieving interactions by time range:', error);
      throw new Error('Failed to retrieve interactions by time range');
    }
  }

  /**
   * Update interaction importance score
   */
  async updateInteractionImportance(interactionId: string, importance: number): Promise<void> {
    try {
      // First, find the object by interactionId
      const result = await this.client.graphql.get()
        .withClassName(this.className)
        .withFields('interactionId')
        .withWhere({
          path: ['interactionId'],
          operator: 'Equal',
          valueText: interactionId,
        })

        .do();

      const objects = result.data?.Get?.[this.className] || [];
      
      if (objects.length > 0) {
        const objectId = objects[0]._additional.id;
        
        await this.client.data.updater()
          .withClassName(this.className)
          .withId(objectId)
          .withProperties({
            importance,
          })
          .do();
      }

    } catch (error) {
      console.error('Error updating interaction importance:', error);
      throw new Error('Failed to update interaction importance');
    }
  }

  /**
   * Delete old interactions based on retention policy
   */
  async cleanupOldInteractions(retentionDays: number = config.memory.episodicRetentionDays): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      // Find old interactions
      const result = await this.client.graphql.get()
        .withClassName(this.className)
        .withFields('interactionId')
        .withWhere({
          path: ['timestamp'],
          operator: 'LessThan',
          valueDate: cutoffDate.toISOString(),
        })

        .do();

      const oldInteractions = result.data?.Get?.[this.className] || [];
      
      // Delete old interactions
      let deletedCount = 0;
      for (const interaction of oldInteractions) {
        try {
          await this.client.data.deleter()
            .withClassName(this.className)
            .withId(interaction._additional.id)
            .do();
          deletedCount++;
        } catch (deleteError) {
          console.warn(`Failed to delete interaction ${interaction._additional.id}:`, deleteError);
        }
      }

      return deletedCount;

    } catch (error) {
      console.error('Error cleaning up old interactions:', error);
      throw new Error('Failed to cleanup old interactions');
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(): Promise<{
    totalInteractions: number;
    averageImportance: number;
    oldestInteraction?: Date;
    newestInteraction?: Date;
  }> {
    try {
      const result = await this.client.graphql.aggregate()
        .withClassName(this.className)
        .withFields('meta { count } importance { mean } timestamp { minimum maximum }')
        .do();

      const stats = result.data?.Aggregate?.[this.className]?.[0] || {};
      
      return {
        totalInteractions: stats.meta?.count || 0,
        averageImportance: stats.importance?.mean || 0,
        oldestInteraction: stats.timestamp?.minimum ? new Date(stats.timestamp.minimum) : undefined,
        newestInteraction: stats.timestamp?.maximum ? new Date(stats.timestamp.maximum) : undefined,
      };

    } catch (error) {
      console.error('Error getting memory stats:', error);
      return {
        totalInteractions: 0,
        averageImportance: 0,
      };
    }
  }
}
