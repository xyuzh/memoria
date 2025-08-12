/**
 * SHIMI Semantic Tree - Graph-like structure for concepts, relationships, and semantic embeddings
 */
import { SemanticConcept, ConceptRelationship } from '../types/memory';
export declare class ShimiSemanticTree {
    private concepts;
    private embeddingService;
    private maxDepth;
    constructor(maxDepth?: number);
    /**
     * Add or update a concept in the semantic tree
     */
    addConcept(name: string, description: string, parentConceptId?: string): Promise<SemanticConcept>;
    /**
     * Find concept by name (case-insensitive)
     */
    findConceptByName(name: string): SemanticConcept | undefined;
    /**
     * Get concept by ID
     */
    getConcept(conceptId: string): SemanticConcept | undefined;
    /**
     * Add relationship between two concepts
     */
    addRelationship(sourceConceptId: string, targetConceptId: string, relationshipType: ConceptRelationship['relationshipType'], strength?: number): void;
    /**
     * Find semantically similar concepts
     */
    findSimilarConcepts(query: string, topK?: number, minSimilarity?: number): Promise<Array<{
        concept: SemanticConcept;
        similarity: number;
    }>>;
    /**
     * Get related concepts through relationships
     */
    getRelatedConcepts(conceptId: string, relationshipTypes?: ConceptRelationship['relationshipType'][], maxDepth?: number): SemanticConcept[];
    /**
     * Update concept strength based on usage and time decay
     */
    updateConceptStrengths(): void;
    /**
     * Prune weak concepts and relationships
     */
    pruneWeakConcepts(minStrength?: number): number;
    /**
     * Get concept hierarchy (tree structure)
     */
    getConceptHierarchy(rootConceptId?: string): any;
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
    };
    /**
     * Import semantic tree data
     */
    importTree(data: {
        concepts: SemanticConcept[];
    }): void;
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
    };
}
//# sourceMappingURL=shimiSemanticTree.d.ts.map