#!/usr/bin/env node

/**
 * Local test script for the MCP Memory Server
 */

const express = require('express');
const cors = require('cors');
const { SimplifiedMemoryLayer } = require('./functions/lib/memory/memoryLayer');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize memory layer with your Weaviate configuration
const memoryLayer = new SimplifiedMemoryLayer(
  '9oz1ed95tskztd3voauqa.c0.us-west3.gcp.weaviate.cloud',
  'MkpEWWFBOFM4ZW0wQzJTQ19ZMDZxZzYzaEpydU1nU2YyT05BenNKWVFsdm4rNUJzbmZJUjN4ZWVOU1g4PV92MjAw'
);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'local-mcp-memory',
    timestamp: new Date().toISOString()
  });
});

// Test store memory
app.post('/test/store', async (req, res) => {
  try {
    const { userInput, response, concepts } = req.body;
    await memoryLayer.storeMemory(
      userInput || 'Test user input',
      response || 'Test response',
      concepts || ['test', 'memory']
    );
    res.json({ success: true, message: 'Memory stored successfully' });
  } catch (error) {
    console.error('Store error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test retrieve context
app.post('/test/retrieve', async (req, res) => {
  try {
    const { query } = req.body;
    const context = await memoryLayer.retrieveContext(query || 'test', 5);
    res.json(context);
  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test visualization data
app.get('/test/visualize', async (req, res) => {
  try {
    const memories = await memoryLayer.getAllMemories({ limit: 100 });
    
    // Build simple visualization structure
    const nodes = memories.map((m, i) => ({
      id: `memory-${i}`,
      label: m.userInput?.substring(0, 50),
      type: 'memory',
      timestamp: m.timestamp
    }));
    
    res.json({
      nodes,
      edges: [],
      stats: {
        totalMemories: memories.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Visualize error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local MCP Memory Server running on http://localhost:${PORT}`);
  console.log('\nTest endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/test/store`);
  console.log(`  POST http://localhost:${PORT}/test/retrieve`);
  console.log(`  GET  http://localhost:${PORT}/test/visualize`);
  console.log('\nExample test commands:');
  console.log(`  curl http://localhost:${PORT}/health`);
  console.log(`  curl -X POST http://localhost:${PORT}/test/store -H "Content-Type: application/json" -d '{"userInput":"Hello","response":"Hi there!"}'`);
});