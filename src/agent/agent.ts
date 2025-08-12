/**
 * Core AI Agent - Orchestrates all memory layers and provides intelligent responses
 */

import OpenAI from 'openai';
import { ShortTermMemory } from '../memory/shortTermMemory';
import { MidLongTermMemory } from '../memory/midLongTermMemory';
import { ShimiSemanticTree } from '../memory/shimiSemanticTree';
import { EpisodicMemory } from '../memory/episodicMemory';
import { EmbeddingService } from '../utils/embeddings';
import { Interaction, MemoryRetrievalResult, SemanticConcept, EpisodicEvent } from '../types/memory';
import { config } from '../config/config';

export class AIAgent {
  private openai: OpenAI;
  private stm: ShortTermMemory;
  private mtlm: MidLongTermMemory;
  private semanticTree: ShimiSemanticTree;
  private episodicMemory: EpisodicMemory;
  private embeddingService: EmbeddingService;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    this.stm = new ShortTermMemory();
    this.mtlm = new MidLongTermMemory();
    this.semanticTree = new ShimiSemanticTree();
    this.episodicMemory = new EpisodicMemory();
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Initialize the agent and all memory systems
   */
  async initialize(): Promise<void> {
    try {
      await this.mtlm.initialize();
      console.log('AI Agent initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Agent:', error);
      throw error;
    }
  }

  /**
   * Process user input and generate response using all memory layers
   */
  async processInput(input: string, context?: Record<string, any>): Promise<string> {
    try {
      // 1. Retrieve relevant context from all memory layers
      const memoryContext = await this.retrieveRelevantMemory(input);

      // 2. Generate response using OpenAI with memory context
      const response = await this.generateResponse(input, memoryContext, context);

      // 3. Store interaction in STM
      const interaction = this.stm.addInteraction(input, response, context);

      // 4. Update semantic concepts
      await this.updateSemanticConcepts(input, response);

      // 5. Determine if this interaction should be stored in long-term memory
      await this.evaluateForLongTermStorage(interaction);

      // 6. Check if this is a significant event for episodic memory
      await this.evaluateForEpisodicStorage(input, response, context);

      return response;
    } catch (error) {
      console.error('Error processing input:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }

  /**
   * Retrieve relevant context from all memory layers
   */
  private async retrieveRelevantMemory(input: string): Promise<MemoryRetrievalResult> {
    const result: MemoryRetrievalResult = {
      interactions: [],
      concepts: [],
      episodes: [],
      relevanceScore: 0,
    };

    try {
      // Get recent interactions from STM
      result.interactions = this.stm.getRecentInteractions(5);

      // Get similar interactions from MTM/LTM
      const similarInteractions = await this.mtlm.retrieveSimilarInteractions(input, 3);
      
      // Get relevant concepts from semantic tree
      const similarConcepts = await this.semanticTree.findSimilarConcepts(input, 3);
      result.concepts = similarConcepts.map(item => item.concept);

      // Get relevant episodic events
      const similarEvents = await this.episodicMemory.searchEventsBySimilarity(input, 2);
      result.episodes = similarEvents.map(item => item.event);

      // Calculate overall relevance score
      result.relevanceScore = this.calculateRelevanceScore(similarInteractions, similarConcepts, similarEvents);

    } catch (error) {
      console.error('Error retrieving memory context:', error);
    }

    return result;
  }

  /**
   * Generate response using OpenAI with memory context
   */
  private async generateResponse(
    input: string,
    memoryContext: MemoryRetrievalResult,
    userContext?: Record<string, any>
  ): Promise<string> {
    // Build context prompt from memory
    let contextPrompt = 'You are an AI assistant with access to your memory systems. ';
    
    if (memoryContext.interactions.length > 0) {
      contextPrompt += '\n\nRecent conversation context:\n';
      memoryContext.interactions.slice(-3).forEach(interaction => {
        contextPrompt += `User: ${interaction.input}\nAssistant: ${interaction.output}\n`;
      });
    }

    if (memoryContext.concepts.length > 0) {
      contextPrompt += '\n\nRelevant concepts from your knowledge:\n';
      memoryContext.concepts.forEach(concept => {
        contextPrompt += `- ${concept.name}: ${concept.description}\n`;
      });
    }

    if (memoryContext.episodes.length > 0) {
      contextPrompt += '\n\nRelevant past events:\n';
      memoryContext.episodes.forEach(episode => {
        contextPrompt += `- ${episode.title}: ${episode.description}\n`;
      });
    }

    contextPrompt += '\n\nBased on this context, please respond to the user\'s current input.';

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }

  /**
   * Update semantic concepts based on the interaction
   */
  private async updateSemanticConcepts(input: string, response: string): Promise<void> {
    try {
      // Extract key concepts from input and response
      const concepts = await this.extractConcepts(input + ' ' + response);
      
      for (const conceptName of concepts) {
        await this.semanticTree.addConcept(
          conceptName,
          `Concept extracted from user interaction: ${conceptName}`,
        );
      }

      // Update concept strengths based on usage
      this.semanticTree.updateConceptStrengths();
    } catch (error) {
      console.error('Error updating semantic concepts:', error);
    }
  }

  /**
   * Extract key concepts from text (simplified implementation)
   */
  private async extractConcepts(text: string): Promise<string[]> {
    // This is a simplified concept extraction
    // In a production system, you might use NLP libraries or LLMs for better extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can'].includes(word));

    // Return unique concepts
    return [...new Set(words)].slice(0, 5); // Limit to top 5 concepts
  }

  /**
   * Evaluate if interaction should be stored in long-term memory
   */
  private async evaluateForLongTermStorage(interaction: Interaction): Promise<void> {
    try {
      // Simple heuristics for determining importance
      const importance = this.calculateInteractionImportance(interaction);
      
      if (importance > 0.6) {
        await this.mtlm.storeInteraction(interaction, importance);
      }
    } catch (error) {
      console.error('Error evaluating for long-term storage:', error);
    }
  }

  /**
   * Evaluate if this should be stored as an episodic event
   */
  private async evaluateForEpisodicStorage(
    input: string,
    response: string,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // Check for significant event indicators
      const eventIndicators = [
        'important', 'milestone', 'achievement', 'problem', 'error', 'success',
        'learned', 'discovered', 'created', 'completed', 'failed', 'breakthrough'
      ];

      const text = (input + ' ' + response).toLowerCase();
      const hasEventIndicator = eventIndicators.some(indicator => text.includes(indicator));

      if (hasEventIndicator || (context && context.isSignificant)) {
        const importance = this.calculateEventImportance(input, response, context);
        
        if (importance > 0.7) {
          await this.episodicMemory.storeEvent(
            `Interaction: ${input.substring(0, 50)}...`,
            `User: ${input}\nAgent: ${response}`,
            context || {},
            await this.extractConcepts(input + ' ' + response),
            importance
          );
        }
      }
    } catch (error) {
      console.error('Error evaluating for episodic storage:', error);
    }
  }

  /**
   * Calculate interaction importance score
   */
  private calculateInteractionImportance(interaction: Interaction): number {
    let score = 0.5; // Base score

    // Length-based scoring
    const totalLength = interaction.input.length + interaction.output.length;
    if (totalLength > 200) score += 0.1;
    if (totalLength > 500) score += 0.1;

    // Context-based scoring
    if (interaction.context && Object.keys(interaction.context).length > 0) {
      score += 0.2;
    }

    // Question-based scoring (questions often indicate learning)
    if (interaction.input.includes('?')) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate event importance score
   */
  private calculateEventImportance(input: string, response: string, context?: Record<string, any>): number {
    let score = 0.7; // Base score for events

    // High-importance keywords
    const highImportanceWords = ['error', 'problem', 'success', 'milestone', 'breakthrough', 'learned'];
    const text = (input + ' ' + response).toLowerCase();
    
    highImportanceWords.forEach(word => {
      if (text.includes(word)) score += 0.1;
    });

    // Context-based importance
    if (context?.isSignificant) score += 0.2;
    if (context?.priority === 'high') score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate overall relevance score for memory retrieval
   */
  private calculateRelevanceScore(
    interactions: any[],
    concepts: any[],
    events: any[]
  ): number {
    let score = 0;
    
    if (interactions.length > 0) score += 0.3;
    if (concepts.length > 0) score += 0.4;
    if (events.length > 0) score += 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * Get comprehensive memory statistics
   */
  async getMemoryStats(): Promise<{
    stm: any;
    mtlm: any;
    semanticTree: any;
    episodicMemory: any;
  }> {
    try {
      const [mtlmStats, semanticTreeStats, episodicStats] = await Promise.all([
        this.mtlm.getMemoryStats(),
        Promise.resolve(this.semanticTree.getTreeStats()),
        this.episodicMemory.getMemoryStats(),
      ]);

      return {
        stm: this.stm.getBufferStats(),
        mtlm: mtlmStats,
        semanticTree: semanticTreeStats,
        episodicMemory: episodicStats,
      };
    } catch (error) {
      console.error('Error getting memory stats:', error);
      throw error;
    }
  }

  /**
   * Perform memory maintenance tasks
   */
  async performMaintenance(): Promise<{
    prunedConcepts: number;
    deletedOldInteractions: number;
    deletedOldEvents: number;
  }> {
    try {
      const [prunedConcepts, deletedInteractions, deletedEvents] = await Promise.all([
        this.semanticTree.pruneWeakConcepts(0.1),
        this.mtlm.cleanupOldInteractions(),
        this.episodicMemory.cleanupOldEvents(),
      ]);

      return {
        prunedConcepts,
        deletedOldInteractions: deletedInteractions,
        deletedOldEvents: deletedEvents,
      };
    } catch (error) {
      console.error('Error performing maintenance:', error);
      throw error;
    }
  }

  /**
   * Export all memory data
   */
  async exportMemory(): Promise<{
    stm: any;
    semanticTree: any;
    timestamp: Date;
  }> {
    return {
      stm: this.stm.getAllInteractions(),
      semanticTree: this.semanticTree.exportTree(),
      timestamp: new Date(),
    };
  }

  /**
   * Search across all memory systems
   */
  async searchMemory(query: string): Promise<{
    interactions: any[];
    concepts: any[];
    events: any[];
  }> {
    try {
      const [stmResults, mtlmResults, conceptResults, eventResults] = await Promise.all([
        this.stm.searchInteractions(query),
        this.mtlm.retrieveSimilarInteractions(query, 10),
        this.semanticTree.findSimilarConcepts(query, 10),
        this.episodicMemory.searchEventsBySimilarity(query, 10),
      ]);

      return {
        interactions: [...stmResults, ...mtlmResults],
        concepts: conceptResults,
        events: eventResults,
      };
    } catch (error) {
      console.error('Error searching memory:', error);
      throw error;
    }
  }
}
