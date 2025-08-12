/**
 * Core memory system types and interfaces for the AI Agent
 */

export interface Interaction {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  context?: Record<string, any>;
  embedding?: number[];
}

export interface STMBuffer {
  interactions: Interaction[];
  maxSize: number;
  currentSize: number;
}

export interface SemanticConcept {
  id: string;
  name: string;
  description: string;
  embedding: number[];
  relationships: ConceptRelationship[];
  strength: number; // 0-1 relevance score
  lastAccessed: Date;
  accessCount: number;
}

export interface ConceptRelationship {
  targetConceptId: string;
  relationshipType: 'related' | 'parent' | 'child' | 'synonym' | 'antonym';
  strength: number; // 0-1 relationship strength
}

export interface EpisodicEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  context: Record<string, any>;
  conceptTags: string[];
  importance: number; // 0-1 importance score
  summary?: string;
  embedding?: number[];
}

export interface MemoryRetrievalResult {
  interactions: Interaction[];
  concepts: SemanticConcept[];
  episodes: EpisodicEvent[];
  relevanceScore: number;
}

export interface MemoryConfig {
  stmBufferSize: number;
  mtmRetrievalLimit: number;
  semanticTreeMaxDepth: number;
  episodicRetentionDays: number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content: string;
}
