/**
 * Main entry point for the AI Agent Memory System
 */

import { AIAgent } from './agent/agent';
import { config, validateConfig } from './config/config';

async function main() {
  try {
    console.log('🤖 Starting AI Agent Memory System...');
    
    // Validate configuration
    validateConfig();
    console.log('✅ Configuration validated');

    // Initialize the agent
    const agent = new AIAgent();
    await agent.initialize();
    console.log('✅ AI Agent initialized');

    // Example interaction
    console.log('\n🧠 Testing memory systems...');
    
    const testInputs = [
      "Hello, I'm learning about artificial intelligence and machine learning.",
      "Can you explain how neural networks work?",
      "I'm working on a project that involves natural language processing.",
      "What are the key concepts in deep learning?",
      "I just completed my first AI model training successfully!"
    ];

    for (const input of testInputs) {
      console.log(`\n👤 User: ${input}`);
      const response = await agent.processInput(input, { 
        sessionId: 'demo-session',
        timestamp: new Date().toISOString()
      });
      console.log(`🤖 Agent: ${response}`);
      
      // Small delay between interactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display memory statistics
    console.log('\n📊 Memory Statistics:');
    const stats = await agent.getMemoryStats();
    console.log(JSON.stringify(stats, null, 2));

    // Demonstrate memory search
    console.log('\n🔍 Searching memory for "neural networks":');
    const searchResults = await agent.searchMemory('neural networks');
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));

    // Perform maintenance
    console.log('\n🧹 Performing memory maintenance...');
    const maintenanceResults = await agent.performMaintenance();
    console.log('Maintenance Results:', maintenanceResults);

    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running AI Agent:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        console.log('\n💡 Please set your OPENAI_API_KEY in the .env file');
      }
      if (error.message.includes('Firebase') || error.message.includes('Firestore')) {
        console.log('\n💡 Please configure your Firebase credentials in the .env file');
      }
      if (error.message.includes('Weaviate')) {
        console.log('\n💡 Please ensure Weaviate is running and configured properly');
      }
    }
    
    process.exit(1);
  }
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

// Run the main function
if (require.main === module) {
  main();
}

export { AIAgent } from './agent/agent';
export * from './types/memory';
export * from './memory/shortTermMemory';
export * from './memory/midLongTermMemory';
export * from './memory/shimiSemanticTree';
export * from './memory/episodicMemory';
export * from './utils/embeddings';
