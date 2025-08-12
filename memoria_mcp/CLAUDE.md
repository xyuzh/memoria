# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies
npm install

# Run TypeScript compiler
npx tsc

# Run TypeScript files directly
npx tsx src/[file].ts

# Watch mode for development (if main entry exists)
npx nodemon --exec tsx src/index.ts
```

### Type Checking
```bash
# Type check without building
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

## Architecture

### Memory System Design
The core architecture revolves around the `SimplifiedMemoryLayer` class which provides semantic memory capabilities through Weaviate vector database integration.

**Key Components:**
- **SimplifiedMemoryLayer** (`src/memory/memoryLayer.ts`): Central memory orchestrator that handles storage, retrieval, and context management
- **Weaviate Integration**: Uses text2vec-openai for embeddings and semantic search
- **MCP Protocol**: Built on @modelcontextprotocol/sdk for Model Context Protocol compliance

### Data Flow
1. Conversations are stored as `MemoryEntry` objects with episodes and timestamps
2. Concepts are extracted from conversations (currently basic keyword extraction)
3. Vector embeddings enable semantic search across stored memories
4. `RetrievalContext` aggregates relevant memories, concepts, and facts

### Key Interfaces
- `MemoryEntry`: Stores conversation data with episode grouping
- `RetrievalContext`: Aggregates memories, concepts, facts, and insights
- Memory operations: `storeMemory()`, `retrieveMemories()`, `getRelevantContext()`

## Development Considerations

### Environment Setup
Requires environment variables for:
- Weaviate connection URL and API key
- OpenAI API key for vectorization
- Firebase configuration (if using Firebase features)

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Target: ES2022 with Node.js module resolution
- Source maps and declarations generated
- Enhanced checks: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`

### Dependencies Structure
- **Core**: MCP SDK, Weaviate clients, OpenAI
- **Web**: Express, CORS for API endpoints
- **Firebase**: Admin SDK and Functions for cloud deployment
- **Development**: TypeScript, tsx, nodemon for hot reloading

## Project Status Notes
This is an early-stage MCP memory layer implementation. When developing:
1. Check if main entry point (index.ts/server.ts) exists before running
2. Verify Weaviate instance is accessible before testing memory operations
3. Consider that MCP protocol handlers may need implementation
4. Be aware that testing framework is not yet configured