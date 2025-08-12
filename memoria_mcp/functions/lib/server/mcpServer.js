"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpRouter = void 0;
const express_1 = require("express");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
exports.mcpRouter = (0, express_1.Router)();
// Initialize MCP Server
const mcpServer = new index_js_1.Server({
    name: 'firebase-memory-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
const tools = [
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
mcpServer.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools,
}));
mcpServer.setRequestHandler(types_js_1.CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    const memoryLayer = extra.memoryLayer;
    const userId = extra.userId;
    try {
        switch (name) {
            case 'enhance_prompt': {
                const context = await memoryLayer.retrieveContext((args === null || args === void 0 ? void 0 : args.userInput) || '', 5);
                const enhancedPrompt = memoryLayer.buildEnhancedPrompt((args === null || args === void 0 ? void 0 : args.userInput) || '', context);
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
                await memoryLayer.storeMemory((args === null || args === void 0 ? void 0 : args.userInput) || '', (args === null || args === void 0 ? void 0 : args.response) || '', (args === null || args === void 0 ? void 0 : args.concepts) || [], userId, args === null || args === void 0 ? void 0 : args.metadata);
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
                const context = await memoryLayer.retrieveContext((args === null || args === void 0 ? void 0 : args.query) || '', (args === null || args === void 0 ? void 0 : args.limit) || 5, args === null || args === void 0 ? void 0 : args.filters);
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
                const results = await memoryLayer.searchMemories((args === null || args === void 0 ? void 0 : args.searchTerm) || '', (args === null || args === void 0 ? void 0 : args.searchType) || 'hybrid', (args === null || args === void 0 ? void 0 : args.limit) || 10, userId);
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
                const stats = await memoryLayer.getMemoryStats((args === null || args === void 0 ? void 0 : args.userId) || userId);
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
    }
    catch (error) {
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
exports.mcpRouter.post('/', async (req, res) => {
    var _a, _b, _c;
    try {
        const request = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        const memoryLayer = req.memoryLayer;
        // Log the request for debugging
        console.log('MCP Request:', {
            method: request.method,
            id: request.id,
            userId,
        });
        // Handle the request based on method
        let response;
        switch (request.method) {
            case 'tools/list':
                response = {
                    jsonrpc: '2.0',
                    id: request.id,
                    result: { tools },
                };
                break;
            case 'tools/call': {
                const callRequest = request;
                const toolName = (_b = callRequest.params) === null || _b === void 0 ? void 0 : _b.name;
                const args = ((_c = callRequest.params) === null || _c === void 0 ? void 0 : _c.arguments) || {};
                // Execute tool directly
                try {
                    let toolResult;
                    switch (toolName) {
                        case 'enhance_prompt':
                            const context = await memoryLayer.retrieveContext(args.userInput || '', 5);
                            const enhancedPrompt = memoryLayer.buildEnhancedPrompt(args.userInput || '', context);
                            toolResult = {
                                content: [{ type: 'text', text: enhancedPrompt }],
                            };
                            break;
                        case 'store_conversation':
                            await memoryLayer.storeMemory(args.userInput || '', args.response || '', args.concepts || [], userId, args.metadata);
                            toolResult = {
                                content: [{ type: 'text', text: 'Conversation stored successfully' }],
                            };
                            break;
                        case 'retrieve_context':
                            const retrievedContext = await memoryLayer.retrieveContext(args.query || '', args.limit || 5, args.filters);
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
                }
                catch (err) {
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
    }
    catch (error) {
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
exports.mcpRouter.get('/tools', (req, res) => {
    res.json({ tools });
});
// Server info endpoint
exports.mcpRouter.get('/info', (req, res) => {
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
//# sourceMappingURL=mcpServer.js.map