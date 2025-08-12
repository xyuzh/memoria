/**
 * Example: AI Agent with MCP Integration
 * Shows how to use your teammate's MCP server with the memory system
 */

import { AIAgent } from '../agent/agent';
import { MCPIntegration } from '../integrations/mcpIntegration';
import { config, validateConfig } from '../config/config';

async function runMCPEnhancedAgent() {
  try {
    console.log('🤖 Starting MCP-Enhanced AI Agent Memory System...');
    
    // Validate configuration
    validateConfig();
    
    // Initialize the base agent
    const agent = new AIAgent();
    await agent.initialize();
    
    // Initialize MCP integration with your teammate's server
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
    const mcpIntegration = new MCPIntegration(agent, mcpServerUrl);
    
    console.log(`🔗 Connecting to MCP server at: ${mcpServerUrl}`);
    
    // Populate memory from MCP resources
    await mcpIntegration.populateMemoryFromMCP();
    
    // Example interactions with MCP enhancement
    const testInputs = [
      "What documentation do we have about API endpoints?",
      "Send an email to the team about our progress",
      "Search for information about user authentication",
      "Create a new task for the sprint planning",
      "What are the latest metrics from our monitoring system?"
    ];

    for (const input of testInputs) {
      console.log(`\n👤 User: ${input}`);
      
      // Process with MCP enhancement
      const result = await mcpIntegration.processInputWithMCP(input, {
        sessionId: 'mcp-demo-session',
        timestamp: new Date().toISOString()
      });
      
      console.log(`🤖 Agent: ${result.response}`);
      
      if (result.toolsUsed && result.toolsUsed.length > 0) {
        console.log(`🔧 Tools used: ${result.toolsUsed.join(', ')}`);
      }
      
      if (result.mcpActions && result.mcpActions.length > 0) {
        console.log(`⚡ MCP actions executed:`, result.mcpActions);
      }
      
      // Small delay between interactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display enhanced memory statistics
    console.log('\n📊 Enhanced Memory Statistics:');
    const stats = await agent.getMemoryStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n✅ MCP-Enhanced demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running MCP-Enhanced AI Agent:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        console.log('\n💡 Please set your OPENAI_API_KEY in the .env file');
      }
      if (error.message.includes('MCP')) {
        console.log('\n💡 Please ensure your MCP server is running and accessible');
      }
    }
    
    process.exit(1);
  }
}

// Run the MCP-enhanced agent
if (require.main === module) {
  runMCPEnhancedAgent();
}

export { runMCPEnhancedAgent };
