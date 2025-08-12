"use strict";
/**
 * Short-Term Memory (STM) Buffer - In-memory queue for recent interactions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortTermMemory = void 0;
const uuid_1 = require("uuid");
const config_1 = require("../config/config");
class ShortTermMemory {
    buffer;
    constructor(maxSize = config_1.config.memory.stmBufferSize) {
        this.buffer = {
            interactions: [],
            maxSize,
            currentSize: 0,
        };
    }
    /**
     * Add a new interaction to the STM buffer
     */
    addInteraction(input, output, context, embedding) {
        const interaction = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date(),
            input,
            output,
            context,
            embedding,
        };
        // Add to buffer
        this.buffer.interactions.push(interaction);
        this.buffer.currentSize++;
        // Remove oldest if buffer exceeds max size
        if (this.buffer.currentSize > this.buffer.maxSize) {
            this.buffer.interactions.shift();
            this.buffer.currentSize--;
        }
        return interaction;
    }
    /**
     * Get recent interactions from STM buffer
     */
    getRecentInteractions(count) {
        const limit = count || this.buffer.currentSize;
        return this.buffer.interactions.slice(-limit);
    }
    /**
     * Get all interactions in STM buffer
     */
    getAllInteractions() {
        return [...this.buffer.interactions];
    }
    /**
     * Search interactions by text content
     */
    searchInteractions(query) {
        const lowerQuery = query.toLowerCase();
        return this.buffer.interactions.filter(interaction => interaction.input.toLowerCase().includes(lowerQuery) ||
            interaction.output.toLowerCase().includes(lowerQuery));
    }
    /**
     * Get interactions within a time range
     */
    getInteractionsInTimeRange(startTime, endTime) {
        return this.buffer.interactions.filter(interaction => interaction.timestamp >= startTime && interaction.timestamp <= endTime);
    }
    /**
     * Get buffer statistics
     */
    getBufferStats() {
        const stats = {
            currentSize: this.buffer.currentSize,
            maxSize: this.buffer.maxSize,
            utilizationPercentage: (this.buffer.currentSize / this.buffer.maxSize) * 100,
            oldestInteractionTime: undefined,
            newestInteractionTime: undefined,
        };
        if (this.buffer.interactions.length > 0) {
            stats.oldestInteractionTime = this.buffer.interactions[0].timestamp;
            stats.newestInteractionTime = this.buffer.interactions[this.buffer.interactions.length - 1].timestamp;
        }
        return stats;
    }
    /**
     * Clear the STM buffer
     */
    clear() {
        this.buffer.interactions = [];
        this.buffer.currentSize = 0;
    }
    /**
     * Get interactions that should be promoted to long-term memory
     * Based on recency, importance, or other criteria
     */
    getInteractionsForPromotion(criteria) {
        let candidates = this.buffer.interactions;
        if (criteria?.maxAge) {
            const cutoffTime = new Date(Date.now() - criteria.maxAge * 60 * 1000);
            candidates = candidates.filter(interaction => interaction.timestamp >= cutoffTime);
        }
        if (criteria?.includeContext) {
            candidates = candidates.filter(interaction => interaction.context && Object.keys(interaction.context).length > 0);
        }
        // For now, return the most recent interactions
        // In a more sophisticated system, this could use ML to determine importance
        return candidates.slice(-Math.min(5, candidates.length));
    }
}
exports.ShortTermMemory = ShortTermMemory;
//# sourceMappingURL=shortTermMemory.js.map