"use strict";
/**
 * Main entry point for the AI Agent Memory System
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgent = void 0;
const agent_1 = require("./agent/agent");
const config_1 = require("./config/config");
async function main() {
    try {
        console.log('🤖 Starting AI Agent Memory System...');
        // Validate configuration
        (0, config_1.validateConfig)();
        console.log('✅ Configuration validated');
        // Initialize the agent
        const agent = new agent_1.AIAgent();
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
    }
    catch (error) {
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
var agent_2 = require("./agent/agent");
Object.defineProperty(exports, "AIAgent", { enumerable: true, get: function () { return agent_2.AIAgent; } });
__exportStar(require("./types/memory"), exports);
__exportStar(require("./memory/shortTermMemory"), exports);
__exportStar(require("./memory/midLongTermMemory"), exports);
__exportStar(require("./memory/shimiSemanticTree"), exports);
__exportStar(require("./memory/episodicMemory"), exports);
__exportStar(require("./utils/embeddings"), exports);
//# sourceMappingURL=index.js.map