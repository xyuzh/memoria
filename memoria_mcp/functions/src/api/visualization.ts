import { Router } from 'express';
import { SimplifiedMemoryLayer } from '../memory/memoryLayer';

export const visualizationRouter = Router();

// Get memory visualization data for graph rendering
visualizationRouter.get('/visualize', async (req, res) => {
  try {
    const memoryLayer = (req as any).memoryLayer as SimplifiedMemoryLayer;
    const userId = (req as any).user?.uid;
    
    const {
      limit = 100,
      startDate,
      endDate,
      concepts,
    } = req.query;

    // Retrieve memories with filters
    const memories = await memoryLayer.getAllMemories({
      userId,
      limit: parseInt(limit as string),
      startDate: startDate as string,
      endDate: endDate as string,
      concepts: concepts ? (concepts as string).split(',') : undefined,
    });

    // Build graph structure for visualization
    const nodes: any[] = [];
    const edges: any[] = [];
    const conceptMap = new Map<string, number>();
    const memoryNodes = new Map<string, any>();

    // Create nodes for memories
    memories.forEach((memory: any, index: number) => {
      const node = {
        id: memory.id || `memory-${index}`,
        type: 'conversation',
        label: memory.userInput?.substring(0, 50) + '...',
        content: {
          userInput: memory.userInput,
          response: memory.response,
        },
        timestamp: memory.timestamp,
        episodeId: memory.episodeId,
        concepts: memory.concepts || [],
        size: 10,
        color: '#4A90E2',
      };
      nodes.push(node);
      memoryNodes.set(node.id, node);

      // Track concepts
      (memory.concepts || []).forEach((concept: string) => {
        conceptMap.set(concept, (conceptMap.get(concept) || 0) + 1);
      });
    });

    // Create concept nodes
    conceptMap.forEach((count, concept) => {
      nodes.push({
        id: `concept-${concept}`,
        type: 'concept',
        label: concept,
        size: Math.min(5 + count * 2, 20),
        color: '#50E3C2',
        count,
      });
    });

    // Create edges between memories and concepts
    memories.forEach((memory: any, index: number) => {
      const memoryId = memory.id || `memory-${index}`;
      (memory.concepts || []).forEach((concept: string) => {
        edges.push({
          id: `edge-${memoryId}-${concept}`,
          source: memoryId,
          target: `concept-${concept}`,
          type: 'has_concept',
          weight: 0.5,
        });
      });
    });

    // Create edges between related memories (same episode or temporal proximity)
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memory1 = memories[i];
        const memory2 = memories[j];
        
        // Link memories from same episode
        if (memory1.episodeId && memory1.episodeId === memory2.episodeId) {
          edges.push({
            id: `edge-episode-${i}-${j}`,
            source: memory1.id || `memory-${i}`,
            target: memory2.id || `memory-${j}`,
            type: 'same_episode',
            weight: 0.8,
            color: '#F5A623',
          });
        }
        
        // Link temporally close memories (within 1 hour)
        const time1 = new Date(memory1.timestamp).getTime();
        const time2 = new Date(memory2.timestamp).getTime();
        const hourInMs = 60 * 60 * 1000;
        
        if (Math.abs(time1 - time2) < hourInMs) {
          edges.push({
            id: `edge-temporal-${i}-${j}`,
            source: memory1.id || `memory-${i}`,
            target: memory2.id || `memory-${j}`,
            type: 'temporal_proximity',
            weight: 0.3,
            color: '#BD10E0',
          });
        }
      }
    }

    // Calculate statistics
    const stats = {
      totalMemories: memories.length,
      totalConcepts: conceptMap.size,
      uniqueEpisodes: new Set(memories.map((m: any) => m.episodeId)).size,
      dateRange: memories.length > 0 ? {
        start: memories[memories.length - 1].timestamp,
        end: memories[0].timestamp,
      } : null,
      topConcepts: Array.from(conceptMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([concept, count]) => ({ concept, count })),
    };

    res.json({
      nodes,
      edges,
      stats,
      metadata: {
        generatedAt: new Date().toISOString(),
        userId: userId || 'anonymous',
        filters: {
          limit,
          startDate,
          endDate,
          concepts,
        },
      },
    });
  } catch (error: any) {
    console.error('Visualization error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate visualization data',
        details: error.message,
      },
    });
  }
});

// List memories with pagination
visualizationRouter.get('/list', async (req, res) => {
  try {
    const memoryLayer = (req as any).memoryLayer as SimplifiedMemoryLayer;
    const userId = (req as any).user?.uid;
    
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'timestamp',
      order = 'desc',
      search,
    } = req.query;

    const memories = await memoryLayer.listMemories({
      userId,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      sortBy: sortBy as string,
      order: order as 'asc' | 'desc',
      search: search as string,
    });

    res.json(memories);
  } catch (error: any) {
    console.error('List memories error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to list memories',
        details: error.message,
      },
    });
  }
});

// Get memory statistics
visualizationRouter.get('/stats', async (req, res) => {
  try {
    const memoryLayer = (req as any).memoryLayer as SimplifiedMemoryLayer;
    const userId = (req as any).user?.uid;
    
    const stats = await memoryLayer.getMemoryStats(userId);
    
    res.json({
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get memory statistics',
        details: error.message,
      },
    });
  }
});

// Export memories
visualizationRouter.get('/export', async (req, res) => {
  try {
    const memoryLayer = (req as any).memoryLayer as SimplifiedMemoryLayer;
    const userId = (req as any).user?.uid;
    
    const { format = 'json' } = req.query;
    
    const memories = await memoryLayer.getAllMemories({ userId });
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(memories);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=memories.csv');
      res.send(csv);
    } else {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=memories.json');
      res.json({
        exportDate: new Date().toISOString(),
        userId: userId || 'anonymous',
        totalMemories: memories.length,
        memories,
      });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to export memories',
        details: error.message,
      },
    });
  }
});

// Delete a specific memory
visualizationRouter.delete('/:memoryId', async (req, res) => {
  try {
    const memoryLayer = (req as any).memoryLayer as SimplifiedMemoryLayer;
    const userId = (req as any).user?.uid;
    const { memoryId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        error: {
          message: 'Authentication required to delete memories',
        },
      });
      return;
    }
    
    await memoryLayer.deleteMemory(memoryId, userId);
    
    res.json({
      success: true,
      message: 'Memory deleted successfully',
      memoryId,
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete memory',
        details: error.message,
      },
    });
  }
});

// Helper function to convert memories to CSV
function convertToCSV(memories: any[]): string {
  if (memories.length === 0) return '';
  
  const headers = ['ID', 'User Input', 'Response', 'Concepts', 'Timestamp', 'Episode ID'];
  const rows = memories.map(m => [
    m.id || '',
    `"${(m.userInput || '').replace(/"/g, '""')}"`,
    `"${(m.response || '').replace(/"/g, '""')}"`,
    `"${(m.concepts || []).join(', ')}"`,
    m.timestamp || '',
    m.episodeId || '',
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}