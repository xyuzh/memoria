import { Router } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  JSONRPCRequest,
  JSONRPCResponse,
} from '@modelcontextprotocol/sdk/types.js';

export const mcpRouter = Router();

// Initialize MCP Server
const mcpServer = new Server(
  {
    name: 'firebase-memory-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: 'enhance_prompt',
    description: 'Enhance a user prompt with relevant memory context',
    inputSchema: {
      type: 'object',
      properties: {
        userInput: {
          type: 'string',
          description: 'The user input to enhance',
        },
        maxContextLength: {
          type: 'number',
          description: 'Maximum context length in tokens',
          default: 2000,
        },
      },
      required: ['userInput'],
    },
  },
  {
    name: 'store_conversation',
    description: 'Store a conversation turn in memory',
    inputSchema: {
      type: 'object',
      properties: {
        userInput: {
          type: 'string',
          description: 'The user input',
        },
        response: {
          type: 'string',
          description: 'The assistant response',
        },
        concepts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Extracted concepts (optional)',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata',
          properties: {
            sessionId: { type: 'string' },
            model: { type: 'string' },
            temperature: { type: 'number' },
          },
        },
      },
      required: ['userInput', 'response'],
    },
  },
  {
    name: 'retrieve_context',
    description: 'Retrieve relevant context for a query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The query to search for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 5,
        },
        filters: {
          type: 'object',
          description: 'Optional filters',
          properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            concepts: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_memories',
    description: 'Search memories with advanced filters',
    inputSchema: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'Search term or phrase',
        },
        searchType: {
          type: 'string',
          enum: ['semantic', 'keyword', 'hybrid'],
          default: 'hybrid',
        },
        limit: {
          type: 'number',
          default: 10,
        },
      },
      required: ['searchTerm'],
    },
  },
  {
    name: 'get_memory_stats',
    description: 'Get statistics about stored memories',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID for scoped stats',
        },
      },
    },
  },
];

// Setup MCP handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;
  const memoryLayer = (extra as any).memoryLayer;
  const userId = (extra as any).userId;

  try {
    switch (name) {
      case 'enhance_prompt': {
        const context = await memoryLayer.retrieveContext(args?.userInput || '', 5);
        const enhancedPrompt = memoryLayer.buildEnhancedPrompt(args?.userInput || '', context);
        return {
          content: [
            {
              type: 'text',
              text: enhancedPrompt,
            },
          ],
        };
      }

      case 'store_conversation': {
        await memoryLayer.storeMemory(
          args?.userInput || '',
          args?.response || '',
          args?.concepts || [],
          userId,
          args?.metadata
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Conversation stored successfully',
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        };
      }

      case 'retrieve_context': {
        const context = await memoryLayer.retrieveContext(
          args?.query || '',
          args?.limit || 5,
          args?.filters
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(context, null, 2),
            },
          ],
        };
      }

      case 'search_memories': {
        const results = await memoryLayer.searchMemories(
          args?.searchTerm || '',
          args?.searchType || 'hybrid',
          args?.limit || 10,
          userId
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get_memory_stats': {
        const stats = await memoryLayer.getMemoryStats(args?.userId || userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Tool execution error for ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: error.message,
            tool: name,
          }),
        },
      ],
    };
  }
});

// Main MCP endpoint
mcpRouter.post('/', async (req, res) => {
  try {
    const request: JSONRPCRequest = req.body;
    const userId = (req as any).user?.uid;
    const memoryLayer = (req as any).memoryLayer;

    // Log the request for debugging
    console.log('MCP Request:', {
      method: request.method,
      id: request.id,
      userId,
    });

    // Handle the request based on method
    let response: JSONRPCResponse;

    switch (request.method) {
      case 'tools/list':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: { tools },
        };
        break;

      case 'tools/call': {
        const callRequest = request as any;
        const toolName = callRequest.params?.name;
        const args = callRequest.params?.arguments || {};
        
        // Execute tool directly
        try {
          let toolResult: any;
          switch (toolName) {
            case 'enhance_prompt':
              const context = await memoryLayer.retrieveContext(args.userInput || '', 5);
              const enhancedPrompt = memoryLayer.buildEnhancedPrompt(args.userInput || '', context);
              toolResult = {
                content: [{ type: 'text', text: enhancedPrompt }],
              };
              break;
            
            case 'store_conversation':
              await memoryLayer.storeMemory(
                args.userInput || '',
                args.response || '',
                args.concepts || [],
                userId,
                args.metadata
              );
              toolResult = {
                content: [{ type: 'text', text: 'Conversation stored successfully' }],
              };
              break;
            
            case 'retrieve_context':
              const retrievedContext = await memoryLayer.retrieveContext(
                args.query || '',
                args.limit || 5,
                args.filters
              );
              toolResult = {
                content: [{ type: 'text', text: JSON.stringify(retrievedContext, null, 2) }],
              };
              break;
            
            default:
              toolResult = {
                content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
              };
          }
          
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: toolResult,
          };
        } catch (err: any) {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: { 
              content: [{ 
                type: 'text', 
                text: `Tool execution failed: ${err.message}` 
              }] 
            },
          };
        }
        break;
      }

      case 'initialize':
        response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '1.0.0',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'firebase-memory-mcp',
              version: '1.0.0',
            },
          },
        };
        break;

      default:
        res.status(404).json({
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`,
          },
        });
        return;
    }

    res.json(response);
  } catch (error: any) {
    console.error('MCP processing error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message,
      },
    });
  }
});

// List tools endpoint
mcpRouter.get('/tools', (req, res) => {
  res.json({ tools });
});

// Server info endpoint
mcpRouter.get('/info', (req, res) => {
  res.json({
    name: 'firebase-memory-mcp',
    version: '1.0.0',
    protocolVersion: '1.0.0',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
  });
});