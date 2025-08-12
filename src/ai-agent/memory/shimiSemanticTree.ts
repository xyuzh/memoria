/**
 * SHIMI Semantic Tree - Graph-like structure for concepts, relationships, and semantic embeddings
 */

import { v4 as uuidv4 } from 'uuid';
import { SemanticConcept, ConceptRelationship } from '../types/memory';
import { EmbeddingService } from '../utils/embeddings';
import { config } from '../config/config';

export class ShimiSemanticTree {
  private concepts: Map<string, SemanticConcept> = new Map();
  private embeddingService: EmbeddingService;
  private maxDepth: number;

  constructor(maxDepth: number = config.memory.semanticTreeMaxDepth) {
    this.embeddingService = new EmbeddingService();
    this.maxDepth = maxDepth;
  }

  /**
   * Add or update a concept in the semantic tree
   */
  async addConcept(
    name: string,
    description: string,
    parentConceptId?: string
  ): Promise<SemanticConcept> {
    // Check if concept already exists
    const existingConcept = this.findConceptByName(name);
    if (existingConcept) {
      existingConcept.accessCount++;
      existingConcept.lastAccessed = new Date();
      return existingConcept;
    }

    // Generate embedding for the concept
    const conceptText = `${name}: ${description}`;
    const embedding = await this.embeddingService.generateEmbedding(conceptText);

    const concept: SemanticConcept = {
      id: uuidv4(),
      name,
      description,
      embedding,
      relationships: [],
      strength: 1.0, // Start with full strength
      lastAccessed: new Date(),
      accessCount: 1,
    };

    // Add parent relationship if specified
    if (parentConceptId && this.concepts.has(parentConceptId)) {
      this.addRelationship(concept.id, parentConceptId, 'parent', 0.8);
      this.addRelationship(parentConceptId, concept.id, 'child', 0.8);
    }

    this.concepts.set(concept.id, concept);
    return concept;
  }

  /**
   * Find concept by name (case-insensitive)
   */
  findConceptByName(name: string): SemanticConcept | undefined {
    const lowerName = name.toLowerCase();
    for (const concept of this.concepts.values()) {
      if (concept.name.toLowerCase() === lowerName) {
        return concept;
      }
    }
    return undefined;
  }

  /**
   * Get concept by ID
   */
  getConcept(conceptId: string): SemanticConcept | undefined {
    return this.concepts.get(conceptId);
  }

  /**
   * Add relationship between two concepts
   */
  addRelationship(
    sourceConceptId: string,
    targetConceptId: string,
    relationshipType: ConceptRelationship['relationshipType'],
    strength: number = 0.5
  ): void {
    const sourceConcept = this.concepts.get(sourceConceptId);
    if (!sourceConcept) return;

    // Check if relationship already exists
    const existingRelationship = sourceConcept.relationships.find(
      rel => rel.targetConceptId === targetConceptId && rel.relationshipType === relationshipType
    );

    if (existingRelationship) {
      // Update strength (weighted average)
      existingRelationship.strength = (existingRelationship.strength + strength) / 2;
    } else {
      // Add new relationship
      sourceConcept.relationships.push({
        targetConceptId,
        relationshipType,
        strength,
      });
    }
  }

  /**
   * Find semantically similar concepts
   */
  async findSimilarConcepts(
    query: string,
    topK: number = 5,
    minSimilarity: number = 0.7
  ): Promise<Array<{ concept: SemanticConcept; similarity: number }>> {
    if (this.concepts.size === 0) return [];

    // Generate embedding for query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Calculate similarities
    const similarities: Array<{ concept: SemanticConcept; similarity: number }> = [];

    for (const concept of this.concepts.values()) {
      const similarity = this.embeddingService.cosineSimilarity(queryEmbedding, concept.embedding);
      
      if (similarity >= minSimilarity) {
        similarities.push({ concept, similarity });
      }
    }

    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Get related concepts through relationships
   */
  getRelatedConcepts(
    conceptId: string,
    relationshipTypes?: ConceptRelationship['relationshipType'][],
    maxDepth: number = 2
  ): SemanticConcept[] {
    const visited = new Set<string>();
    const related: SemanticConcept[] = [];

    const traverse = (currentId: string, depth: number) => {
      if (depth >= maxDepth || visited.has(currentId)) return;
      
      visited.add(currentId);
      const concept = this.concepts.get(currentId);
      if (!concept) return;

      for (const relationship of concept.relationships) {
        if (relationshipTypes && !relationshipTypes.includes(relationship.relationshipType)) {
          continue;
        }

        const relatedConcept = this.concepts.get(relationship.targetConceptId);
        if (relatedConcept && !visited.has(relatedConcept.id)) {
          related.push(relatedConcept);
          traverse(relatedConcept.id, depth + 1);
        }
      }
    };

    traverse(conceptId, 0);
    return related;
  }

  /**
   * Update concept strength based on usage and time decay
   */
  updateConceptStrengths(): void {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    for (const concept of this.concepts.values()) {
      // Time-based decay
      const daysSinceAccess = (now.getTime() - concept.lastAccessed.getTime()) / oneDay;
      const timeDecay = Math.exp(-daysSinceAccess / 30); // 30-day half-life

      // Usage-based boost
      const usageBoost = Math.min(concept.accessCount / 10, 1.0);

      // Update strength
      concept.strength = Math.max(0.1, timeDecay * usageBoost);
    }
  }

  /**
   * Prune weak concepts and relationships
   */
  pruneWeakConcepts(minStrength: number = 0.1): number {
    let prunedCount = 0;

    // Remove weak concepts
    for (const [conceptId, concept] of this.concepts.entries()) {
      if (concept.strength < minStrength) {
        this.concepts.delete(conceptId);
        prunedCount++;
      }
    }

    // Remove relationships to deleted concepts
    for (const concept of this.concepts.values()) {
      concept.relationships = concept.relationships.filter(
        rel => this.concepts.has(rel.targetConceptId)
      );
    }

    return prunedCount;
  }

  /**
   * Get concept hierarchy (tree structure)
   */
  getConceptHierarchy(rootConceptId?: string): any {
    const buildTree = (conceptId: string, visited: Set<string> = new Set()): any => {
      if (visited.has(conceptId)) return null;
      visited.add(conceptId);

      const concept = this.concepts.get(conceptId);
      if (!concept) return null;

      const children = concept.relationships
        .filter(rel => rel.relationshipType === 'child')
        .map(rel => buildTree(rel.targetConceptId, visited))
        .filter(child => child !== null);

      return {
        id: concept.id,
        name: concept.name,
        description: concept.description,
        strength: concept.strength,
        accessCount: concept.accessCount,
        children,
      };
    };

    if (rootConceptId) {
      return buildTree(rootConceptId);
    }

    // Find root concepts (concepts with no parent relationships)
    const rootConcepts: any[] = [];
    for (const concept of this.concepts.values()) {
      const hasParent = concept.relationships.some(rel => rel.relationshipType === 'parent');
      if (!hasParent) {
        const tree = buildTree(concept.id);
        if (tree) rootConcepts.push(tree);
      }
    }

    return rootConcepts;
  }

  /**
   * Export semantic tree data
   */
  exportTree(): {
    concepts: SemanticConcept[];
    metadata: {
      totalConcepts: number;
      averageStrength: number;
      lastUpdated: Date;
    };
  } {
    const concepts = Array.from(this.concepts.values());
    const averageStrength = concepts.length > 0 
      ? concepts.reduce((sum, c) => sum + c.strength, 0) / concepts.length 
      : 0;

    return {
      concepts,
      metadata: {
        totalConcepts: concepts.length,
        averageStrength,
        lastUpdated: new Date(),
      },
    };
  }

  /**
   * Import semantic tree data
   */
  importTree(data: { concepts: SemanticConcept[] }): void {
    this.concepts.clear();
    for (const concept of data.concepts) {
      this.concepts.set(concept.id, concept);
    }
  }

  /**
   * Get tree statistics
   */
  getTreeStats(): {
    totalConcepts: number;
    totalRelationships: number;
    averageStrength: number;
    maxDepth: number;
    strongestConcept?: SemanticConcept;
    mostAccessedConcept?: SemanticConcept;
  } {
    const concepts = Array.from(this.concepts.values());
    
    const totalRelationships = concepts.reduce(
      (sum, concept) => sum + concept.relationships.length, 
      0
    );

    const averageStrength = concepts.length > 0 
      ? concepts.reduce((sum, c) => sum + c.strength, 0) / concepts.length 
      : 0;

    const strongestConcept = concepts.reduce(
      (strongest, current) => 
        current.strength > (strongest?.strength || 0) ? current : strongest,
      undefined as SemanticConcept | undefined
    );

    const mostAccessedConcept = concepts.reduce(
      (mostAccessed, current) => 
        current.accessCount > (mostAccessed?.accessCount || 0) ? current : mostAccessed,
      undefined as SemanticConcept | undefined
    );

    return {
      totalConcepts: concepts.length,
      totalRelationships,
      averageStrength,
      maxDepth: this.maxDepth,
      strongestConcept,
      mostAccessedConcept,
    };
  }
}
