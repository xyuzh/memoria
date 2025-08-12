/**
 * Episodic Memory - Simplified in-memory implementation for demo
 */
import { EpisodicEvent } from '../types/memory';
export declare class EpisodicMemory {
    private embeddingService;
    private events;
    constructor();
    storeEvent(title: string, description: string, context: Record<string, any>, conceptTags?: string[], importance?: number): Promise<EpisodicEvent>;
    getEventsByTimeRange(startTime: Date, endTime: Date, limit?: number): Promise<EpisodicEvent[]>;
    getEventsByConceptTags(conceptTags: string[], limit?: number): Promise<EpisodicEvent[]>;
    getEventsByImportance(minImportance: number, limit?: number): Promise<EpisodicEvent[]>;
    searchEventsBySimilarity(query: string, limit?: number, minSimilarity?: number): Promise<Array<{
        event: EpisodicEvent;
        similarity: number;
    }>>;
    updateEventImportance(eventId: string, importance: number): Promise<void>;
    addEventSummary(eventId: string, summary: string): Promise<void>;
    cleanupOldEvents(retentionDays?: number): Promise<number>;
    getRecentSignificantEvents(days?: number, minImportance?: number, limit?: number): Promise<EpisodicEvent[]>;
    getMemoryStats(): Promise<{
        totalEvents: number;
        averageImportance: number;
        eventsByImportanceRange: Record<string, number>;
        oldestEvent?: Date;
        newestEvent?: Date;
    }>;
    getEventById(eventId: string): Promise<EpisodicEvent | null>;
    deleteEvent(eventId: string): Promise<void>;
}
//# sourceMappingURL=episodicMemory.d.ts.map