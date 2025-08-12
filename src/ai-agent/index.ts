/**
 * AI Agent Memory System - Entry Point for Unified Memoria
 * 
 * This module provides the main entry point for the AI Agent Memory System
 * within the unified memoria project. It demonstrates the multi-tier memory architecture with:
 * - Short-Term Memory (STM)
 * - Mid/Long-Term Memory (MTM/LTM) 
 * - SHIMI Semantic Tree
 * - Episodic Memory
 * - MCP Integration
 */

import { config } from './config/config';
import { AIAgent } from './agent/agent';

/**
 * Main demo function for the AI Agent Memory System
 * This function is called from the unified memoria entry point
 */
export async function runAIAgentDemo() {
  console.log('🤖 AI Agent Memory System Starting...\n');
  
  // Display configuration
  console.log('📋 AI Agent Configuration:');
  console.log(`   Agent Name: ${config.agent.name}`);
  console.log(`   STM Buffer Size: ${config.memory.stmBufferSize}`);
  console.log(`   MTM Retrieval Limit: ${config.memory.mtmRetrievalLimit}`);
  console.log(`   Debug Mode: ${config.agent.debugMode}`);
  console.log(`   Weaviate URL: ${config.weaviate.url}`);
  console.log('');

  try {
    // Initialize the AI Agent
    console.log('🚀 Initializing AI Agent...');
    const agent = new AIAgent();
    await agent.initialize();
    console.log('✅ AI Agent initialized successfully\n');

    // Run demo interactions
    console.log('🎭 Running AI Agent Demo Interactions...\n');
    
    const demoInputs = [
      "Hello, I'm working on integrating memoria systems. Can you help me understand multi-tier memory?",
      "What are the key differences between STM, MTM, and LTM in AI agents?",
      "How does semantic memory work with vector databases like Weaviate?",
      "Can you explain how MCP integration enhances memory systems?",
      "What are the benefits of episodic memory in AI agents?"
    ];

    for (let i = 0; i < demoInputs.length; i++) {
      const input = demoInputs[i];
      console.log(`👤 User: ${input}`);
      
      const response = await agent.processInput(input, { 
        sessionId: 'unified-memoria-demo',
        timestamp: new Date().toISOString(),
        interactionNumber: i + 1,
        system: 'ai-agent'
      });
      
      console.log(`🤖 AI Agent: ${response}\n`);
      
      // Add a small delay between interactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display memory statistics
    console.log('📊 AI Agent Memory Statistics:');
    const stats = await agent.getMemoryStats();
    console.log(`   STM Interactions: ${stats.stm.totalInteractions}`);
    console.log(`   MTM Interactions: ${stats.mtlm.totalInteractions}`);
    console.log(`   Semantic Concepts: ${stats.semanticTree.totalConcepts}`);
    console.log(`   Episodic Events: ${stats.episodicMemory.totalEvents}`);
    console.log('');

    // Perform maintenance
    console.log('🔧 Performing AI Agent Memory Maintenance...');
    await agent.performMaintenance();
    console.log('✅ AI Agent memory maintenance completed\n');

    console.log('🎉 AI Agent Memory System Demo Completed Successfully!');
    console.log('💡 The AI agent has learned about memoria integration and stored relevant memories.');

  } catch (error) {
    console.error('❌ Error running AI Agent Memory System:', error);
    console.log('\n💡 AI Agent Troubleshooting Tips:');
    console.log('   1. Make sure your .env file is configured with valid API keys');
    console.log('   2. Ensure Weaviate is running and accessible');
    console.log('   3. Check your OpenAI API key and quota');
    console.log('   4. Verify network connectivity');
    
    if (config.agent.debugMode) {
      console.log('\n🐛 Debug Information:');
      console.log(error);
    }
    
    throw error; // Re-throw to let unified system handle it
  }
}

/**
 * Legacy main function for standalone execution
 */
async function main() {
  await runAIAgentDemo();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down AI Agent Memory System...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down AI Agent Memory System...');
  process.exit(0);
});

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export * from './memory/shortTermMemory';
export * from './memory/midLongTermMemory';
export * from './memory/shimiSemanticTree';
export * from './memory/episodicMemory';
export * from './utils/embeddings';
