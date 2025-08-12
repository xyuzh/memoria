"use strict";
/**
 * Episodic Memory - Simplified in-memory implementation for demo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodicMemory = void 0;
const uuid_1 = require("uuid");
const embeddings_1 = require("../utils/embeddings");
class EpisodicMemory {
    embeddingService;
    events = new Map();
    constructor() {
        this.embeddingService = new embeddings_1.EmbeddingService();
        console.log('EpisodicMemory: Using in-memory storage for demo');
    }
    async storeEvent(title, description, context, conceptTags = [], importance = 0.5) {
        try {
            const eventText = `${title}: ${description}`;
            const embedding = await this.embeddingService.generateEmbedding(eventText);
            const event = {
                id: (0, uuid_1.v4)(),
                timestamp: new Date(),
                title,
                description,
                context,
                conceptTags,
                importance,
                embedding,
            };
            this.events.set(event.id, event);
            return event;
        }
        catch (error) {
            console.error('Error storing episodic event:', error);
            throw new Error('Failed to store episodic event');
        }
    }
    async getEventsByTimeRange(startTime, endTime, limit = 50) {
        const events = Array.from(this.events.values())
            .filter(event => event.timestamp >= startTime && event.timestamp <= endTime)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
        return events;
    }
    async getEventsByConceptTags(conceptTags, limit = 50) {
        const events = Array.from(this.events.values())
            .filter(event => event.conceptTags.some(tag => conceptTags.includes(tag)))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
        return events;
    }
    async getEventsByImportance(minImportance, limit = 50) {
        const events = Array.from(this.events.values())
            .filter(event => event.importance >= minImportance)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, limit);
        return events;
    }
    async searchEventsBySimilarity(query, limit = 10, minSimilarity = 0.7) {
        try {
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);
            const similarities = [];
            for (const event of this.events.values()) {
                if (event.embedding) {
                    const similarity = this.embeddingService.cosineSimilarity(queryEmbedding, event.embedding);
                    if (similarity >= minSimilarity) {
                        similarities.push({ event, similarity });
                    }
                }
            }
            return similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        }
        catch (error) {
            console.error('Error searching events by similarity:', error);
            return [];
        }
    }
    async updateEventImportance(eventId, importance) {
        const event = this.events.get(eventId);
        if (event) {
            event.importance = importance;
        }
    }
    async addEventSummary(eventId, summary) {
        const event = this.events.get(eventId);
        if (event) {
            event.summary = summary;
        }
    }
    async cleanupOldEvents(retentionDays = 365) {
        const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        for (const [id, event] of this.events.entries()) {
            if (event.timestamp < cutoffDate) {
                this.events.delete(id);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async getRecentSignificantEvents(days = 7, minImportance = 0.7, limit = 20) {
        const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const events = Array.from(this.events.values())
            .filter(event => event.timestamp >= startTime && event.importance >= minImportance)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, limit);
        return events;
    }
    async getMemoryStats() {
        const events = Array.from(this.events.values());
        const totalEvents = events.length;
        const averageImportance = totalEvents > 0
            ? events.reduce((sum, event) => sum + event.importance, 0) / totalEvents
            : 0;
        const eventsByImportanceRange = {
            'low (0.0-0.3)': 0,
            'medium (0.3-0.7)': 0,
            'high (0.7-1.0)': 0,
        };
        events.forEach(event => {
            if (event.importance < 0.3) {
                eventsByImportanceRange['low (0.0-0.3)']++;
            }
            else if (event.importance < 0.7) {
                eventsByImportanceRange['medium (0.3-0.7)']++;
            }
            else {
                eventsByImportanceRange['high (0.7-1.0)']++;
            }
        });
        const sortedByTime = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return {
            totalEvents,
            averageImportance,
            eventsByImportanceRange,
            oldestEvent: sortedByTime.length > 0 ? sortedByTime[0].timestamp : undefined,
            newestEvent: sortedByTime.length > 0 ? sortedByTime[sortedByTime.length - 1].timestamp : undefined,
        };
    }
    async getEventById(eventId) {
        return this.events.get(eventId) || null;
    }
    async deleteEvent(eventId) {
        this.events.delete(eventId);
    }
}
exports.EpisodicMemory = EpisodicMemory;
//# sourceMappingURL=episodicMemory.js.map