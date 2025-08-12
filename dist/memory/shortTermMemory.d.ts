/**
 * Short-Term Memory (STM) Buffer - In-memory queue for recent interactions
 */
import { Interaction } from '../types/memory';
export declare class ShortTermMemory {
    private buffer;
    constructor(maxSize?: number);
    /**
     * Add a new interaction to the STM buffer
     */
    addInteraction(input: string, output: string, context?: Record<string, any>, embedding?: number[]): Interaction;
    /**
     * Get recent interactions from STM buffer
     */
    getRecentInteractions(count?: number): Interaction[];
    /**
     * Get all interactions in STM buffer
     */
    getAllInteractions(): Interaction[];
    /**
     * Search interactions by text content
     */
    searchInteractions(query: string): Interaction[];
    /**
     * Get interactions within a time range
     */
    getInteractionsInTimeRange(startTime: Date, endTime: Date): Interaction[];
    /**
     * Get buffer statistics
     */
    getBufferStats(): {
        currentSize: number;
        maxSize: number;
        utilizationPercentage: number;
        oldestInteractionTime?: Date;
        newestInteractionTime?: Date;
    };
    /**
     * Clear the STM buffer
     */
    clear(): void;
    /**
     * Get interactions that should be promoted to long-term memory
     * Based on recency, importance, or other criteria
     */
    getInteractionsForPromotion(criteria?: {
        minImportance?: number;
        maxAge?: number;
        includeContext?: boolean;
    }): Interaction[];
}
//# sourceMappingURL=shortTermMemory.d.ts.map