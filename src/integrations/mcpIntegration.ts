/**
 * MCP Integration for AI Agent Memory System
 * Enhances the agent with external data sources and tools via MCP servers
 */

import { MCPClient } from './mcpClient';
import { AIAgent } from '../agent/agent';
import { EmbeddingService } from '../utils/embeddings';

export class MCPIntegration {
  private mcpClient: MCPClient;
  private agent: AIAgent;
  private embeddingService: EmbeddingService;

  constructor(agent: AIAgent, mcpServerUrl: string) {
    this.agent = agent;
    this.mcpClient = new MCPClient(mcpServerUrl);
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Populate memory system with MCP resources
   */
  async populateMemoryFromMCP(): Promise<void> {
    try {
      console.log('🔗 Populating memory from MCP server...');
      
      const resources = await this.mcpClient.listResources();
      
      for (const resource of resources) {
        const content = await this.mcpClient.readResource(resource.uri);
        
        if (content) {
          // Store as interaction in long-term memory
          const interaction = {
            id: `mcp-${resource.uri}`,
            timestamp: new Date(),
            input: `MCP Resource: ${resource.name}`,
            output: content,
            context: {
              source: 'mcp',
              resourceUri: resource.uri,
              resourceName: resource.name,
              mimeType: resource.mimeType
            }
          };

          // Generate embedding and store
          const embedding = await this.embeddingService.generateEmbedding(
            `${resource.name}: ${content}`
          );
          interaction.embedding = embedding;

          // Store in memory system (this would need to be exposed from agent)
          console.log(`📚 Stored MCP resource: ${resource.name}`);
        }
      }
    } catch (error) {
      console.error('Error populating memory from MCP:', error);
    }
  }

  /**
   * Get contextual information from MCP server based on user input
   */
  async getMCPContext(input: string): Promise<{
    resources: any[];
    toolSuggestions: string[];
  }> {
    try {
      // Search for relevant MCP resources
      const relevantResources = await this.mcpClient.searchResources(input);
      
      // Get available tools that might be relevant
      const availableTools = await this.mcpClient.listTools();
      const toolSuggestions = availableTools
        .filter(tool => 
          tool.description.toLowerCase().includes(input.toLowerCase()) ||
          input.toLowerCase().includes(tool.name.toLowerCase())
        )
        .map(tool => tool.name);

      return {
        resources: relevantResources,
        toolSuggestions
      };
    } catch (error) {
      console.error('Error getting MCP context:', error);
      return { resources: [], toolSuggestions: [] };
    }
  }

  /**
   * Execute MCP tools based on agent's decision
   */
  async executeMCPTool(toolName: string, parameters: any): Promise<any> {
    try {
      console.log(`🔧 Executing MCP tool: ${toolName}`);
      const result = await this.mcpClient.callTool(toolName, parameters);
      
      // Store tool execution as episodic event
      await this.agent.processInput(
        `Executed MCP tool: ${toolName}`,
        `Tool result: ${JSON.stringify(result)}`,
        {
          toolExecution: true,
          toolName,
          parameters,
          result,
          timestamp: new Date().toISOString()
        }
      );

      return result;
    } catch (error) {
      console.error(`Error executing MCP tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced agent processing with MCP integration
   */
  async processInputWithMCP(input: string, context?: Record<string, any>): Promise<{
    response: string;
    mcpActions?: any[];
    toolsUsed?: string[];
  }> {
    try {
      // Get MCP context
      const mcpContext = await this.getMCPContext(input);
      
      // Process with regular agent (with MCP context added)
      const enhancedContext = {
        ...context,
        mcpResources: mcpContext.resources,
        availableTools: mcpContext.toolSuggestions
      };

      const response = await this.agent.processInput(input, enhancedContext);

      // Determine if any MCP tools should be executed based on response
      const toolsToExecute = this.determineMCPToolsToExecute(input, response, mcpContext.toolSuggestions);
      const toolResults = [];

      for (const toolName of toolsToExecute) {
        try {
          const toolParams = this.extractToolParameters(input, toolName);
          const result = await this.executeMCPTool(toolName, toolParams);
          toolResults.push({ toolName, result });
        } catch (error) {
          console.warn(`Failed to execute tool ${toolName}:`, error);
        }
      }

      return {
        response,
        mcpActions: toolResults,
        toolsUsed: toolsToExecute
      };

    } catch (error) {
      console.error('Error processing input with MCP:', error);
      return {
        response: await this.agent.processInput(input, context)
      };
    }
  }

  /**
   * Determine which MCP tools should be executed based on context
   */
  private determineMCPToolsToExecute(input: string, response: string, availableTools: string[]): string[] {
    const toolsToExecute: string[] = [];
    
    // Simple heuristics - in production, this could use LLM reasoning
    const lowerInput = input.toLowerCase();
    const lowerResponse = response.toLowerCase();

    for (const tool of availableTools) {
      const lowerTool = tool.toLowerCase();
      
      // Execute tool if mentioned in input or response suggests it
      if (lowerInput.includes(lowerTool) || 
          lowerResponse.includes(lowerTool) ||
          (lowerInput.includes('send') && lowerTool.includes('email')) ||
          (lowerInput.includes('search') && lowerTool.includes('search')) ||
          (lowerInput.includes('create') && lowerTool.includes('create'))) {
        toolsToExecute.push(tool);
      }
    }

    return toolsToExecute.slice(0, 3); // Limit to 3 tools max
  }

  /**
   * Extract parameters for tool execution from user input
   */
  private extractToolParameters(input: string, toolName: string): any {
    // Simple parameter extraction - in production, this could be more sophisticated
    const params: any = {};
    
    // Extract common parameters
    const emailMatch = input.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch && toolName.toLowerCase().includes('email')) {
      params.email = emailMatch[0];
    }

    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (urlMatch && toolName.toLowerCase().includes('fetch')) {
      params.url = urlMatch[0];
    }

    // Extract quoted strings as potential parameters
    const quotedStrings = input.match(/"([^"]+)"/g);
    if (quotedStrings) {
      params.query = quotedStrings[0].replace(/"/g, '');
    }

    return params;
  }

  /**
   * Sync MCP resources with memory system periodically
   */
  async syncMCPResources(): Promise<void> {
    try {
      console.log('🔄 Syncing MCP resources with memory...');
      await this.populateMemoryFromMCP();
      console.log('✅ MCP sync completed');
    } catch (error) {
      console.error('Error syncing MCP resources:', error);
    }
  }
}
