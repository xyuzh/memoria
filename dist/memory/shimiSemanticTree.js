"use strict";
/**
 * SHIMI Semantic Tree - Graph-like structure for concepts, relationships, and semantic embeddings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShimiSemanticTree = void 0;
const uuid_1 = require("uuid");
const embeddings_1 = require("../utils/embeddings");
const config_1 = require("../config/config");
class ShimiSemanticTree {
    concepts = new Map();
    embeddingService;
    maxDepth;
    constructor(maxDepth = config_1.config.memory.semanticTreeMaxDepth) {
        this.embeddingService = new embeddings_1.EmbeddingService();
        this.maxDepth = maxDepth;
    }
    /**
     * Add or update a concept in the semantic tree
     */
    async addConcept(name, description, parentConceptId) {
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
        const concept = {
            id: (0, uuid_1.v4)(),
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
    findConceptByName(name) {
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
    getConcept(conceptId) {
        return this.concepts.get(conceptId);
    }
    /**
     * Add relationship between two concepts
     */
    addRelationship(sourceConceptId, targetConceptId, relationshipType, strength = 0.5) {
        const sourceConcept = this.concepts.get(sourceConceptId);
        if (!sourceConcept)
            return;
        // Check if relationship already exists
        const existingRelationship = sourceConcept.relationships.find(rel => rel.targetConceptId === targetConceptId && rel.relationshipType === relationshipType);
        if (existingRelationship) {
            // Update strength (weighted average)
            existingRelationship.strength = (existingRelationship.strength + strength) / 2;
        }
        else {
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
    async findSimilarConcepts(query, topK = 5, minSimilarity = 0.7) {
        if (this.concepts.size === 0)
            return [];
        // Generate embedding for query
        const queryEmbedding = await this.embeddingService.generateEmbedding(query);
        // Calculate similarities
        const similarities = [];
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
    getRelatedConcepts(conceptId, relationshipTypes, maxDepth = 2) {
        const visited = new Set();
        const related = [];
        const traverse = (currentId, depth) => {
            if (depth >= maxDepth || visited.has(currentId))
                return;
            visited.add(currentId);
            const concept = this.concepts.get(currentId);
            if (!concept)
                return;
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
    updateConceptStrengths() {
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
    pruneWeakConcepts(minStrength = 0.1) {
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
            concept.relationships = concept.relationships.filter(rel => this.concepts.has(rel.targetConceptId));
        }
        return prunedCount;
    }
    /**
     * Get concept hierarchy (tree structure)
     */
    getConceptHierarchy(rootConceptId) {
        const buildTree = (conceptId, visited = new Set()) => {
            if (visited.has(conceptId))
                return null;
            visited.add(conceptId);
            const concept = this.concepts.get(conceptId);
            if (!concept)
                return null;
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
        const rootConcepts = [];
        for (const concept of this.concepts.values()) {
            const hasParent = concept.relationships.some(rel => rel.relationshipType === 'parent');
            if (!hasParent) {
                const tree = buildTree(concept.id);
                if (tree)
                    rootConcepts.push(tree);
            }
        }
        return rootConcepts;
    }
    /**
     * Export semantic tree data
     */
    exportTree() {
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
    importTree(data) {
        this.concepts.clear();
        for (const concept of data.concepts) {
            this.concepts.set(concept.id, concept);
        }
    }
    /**
     * Get tree statistics
     */
    getTreeStats() {
        const concepts = Array.from(this.concepts.values());
        const totalRelationships = concepts.reduce((sum, concept) => sum + concept.relationships.length, 0);
        const averageStrength = concepts.length > 0
            ? concepts.reduce((sum, c) => sum + c.strength, 0) / concepts.length
            : 0;
        const strongestConcept = concepts.reduce((strongest, current) => current.strength > (strongest?.strength || 0) ? current : strongest, undefined);
        const mostAccessedConcept = concepts.reduce((mostAccessed, current) => current.accessCount > (mostAccessed?.accessCount || 0) ? current : mostAccessed, undefined);
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
exports.ShimiSemanticTree = ShimiSemanticTree;
//# sourceMappingURL=shimiSemanticTree.js.map