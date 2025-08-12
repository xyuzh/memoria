# AI Agent with Multi-Tier Memory System

A sophisticated TypeScript-based AI Agent that implements a comprehensive multi-tier memory system for enhanced context awareness and intelligent responses.

## 🧠 Memory Architecture

### 1. Short-Term Memory (STM Buffer)
- **Purpose**: In-memory ring buffer for the most recent N interactions
- **Implementation**: `/src/memory/shortTermMemory.ts`
- **Features**: 
  - Configurable buffer size (default: 50 interactions)
  - Automatic oldest-item eviction
  - Fast retrieval of recent context
  - Search and time-range filtering

### 2. Mid-Term / Long-Term Memory (MTM/LTM)
- **Purpose**: Vector database storage for semantic retrieval and context injection
- **Implementation**: `/src/memory/midLongTermMemory.ts`
- **Features**:
  - Weaviate vector database integration
  - Semantic similarity search
  - Automatic embedding generation
  - Importance-based storage and retrieval

### 3. SHIMI Semantic Tree
- **Purpose**: Graph-like structure for concepts, relationships, and semantic embeddings
- **Implementation**: `/src/memory/shimiSemanticTree.ts`
- **Features**:
  - Concept extraction and relationship mapping
  - Strength-based concept weighting
  - Hierarchical concept organization
  - Automatic pruning of weak concepts

### 4. Episodic Memory
- **Purpose**: Firestore-based storage for significant events and milestones
- **Implementation**: `/src/memory/episodicMemory.ts`
- **Features**:
  - Timestamped event storage
  - Importance scoring
  - Concept tagging
  - Retention policy management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- Weaviate instance (local or cloud)
- Firebase/Firestore project (optional, for episodic memory)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd ai-agent-memory
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Set up Weaviate** (choose one):
   
   **Option A: Local Weaviate with Docker**
   ```bash
   docker run -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e PERSISTENCE_DATA_PATH=/var/lib/weaviate semitechnologies/weaviate:latest
   ```
   
   **Option B: Weaviate Cloud Service**
   - Sign up at [Weaviate Cloud Service](https://console.weaviate.cloud/)
   - Create a cluster and use the provided URL/API key

4. **Configure Firebase** (optional):
   - Create a Firebase project
   - Generate service account credentials
   - Add credentials to `.env` file

### Running the Agent

```bash
# Development mode
npm run dev

# Build and run
npm run build
npm start

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── agent/
│   └── agent.ts              # Core AI Agent orchestrating all memory layers
├── memory/
│   ├── shortTermMemory.ts    # STM buffer implementation
│   ├── midLongTermMemory.ts  # Vector DB interface (Weaviate)
│   ├── shimiSemanticTree.ts  # Semantic concept graph
│   └── episodicMemory.ts     # Firestore event storage
├── utils/
│   └── embeddings.ts         # Embedding generation and similarity
├── types/
│   └── memory.ts             # TypeScript interfaces and types
├── config/
│   └── config.ts             # Configuration management
└── index.ts                  # Main entry point
```

## 🔧 Configuration

### Required Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=your_weaviate_api_key_here

# Firebase Configuration (optional)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
# ... other Firebase credentials

# Memory Configuration
STM_BUFFER_SIZE=50
MTM_RETRIEVAL_LIMIT=10
SEMANTIC_TREE_MAX_DEPTH=5
EPISODIC_MEMORY_RETENTION_DAYS=365
```

## 💡 How It Works

### Memory Flow
1. **Input Processing**: User input triggers memory retrieval from all layers
2. **Context Assembly**: Relevant context is gathered from STM, MTM/LTM, semantic tree, and episodic memory
3. **Response Generation**: OpenAI generates response using assembled context
4. **Memory Updates**: 
   - Interaction stored in STM
   - Concepts extracted and added to semantic tree
   - Important interactions promoted to MTM/LTM
   - Significant events stored in episodic memory

### Memory Retrieval Strategy
- **STM**: Recent conversation context (last 5 interactions)
- **MTM/LTM**: Semantically similar past interactions
- **Semantic Tree**: Related concepts and their relationships
- **Episodic Memory**: Relevant past events and milestones

### Automatic Maintenance
- **Concept Pruning**: Weak concepts automatically removed
- **Retention Policies**: Old data cleaned up based on configured retention periods
- **Strength Updates**: Concept and relationship strengths updated based on usage

## 🧪 Usage Examples

### Basic Interaction
```typescript
import { AIAgent } from './src/agent/agent';

const agent = new AIAgent();
await agent.initialize();

const response = await agent.processInput(
  "Tell me about machine learning",
  { sessionId: 'user-123' }
);
console.log(response);
```

### Memory Search
```typescript
const searchResults = await agent.searchMemory('neural networks');
console.log(searchResults.concepts); // Related concepts
console.log(searchResults.interactions); // Past interactions
console.log(searchResults.events); // Relevant events
```

### Memory Statistics
```typescript
const stats = await agent.getMemoryStats();
console.log(stats.stm.currentSize); // STM buffer usage
console.log(stats.semanticTree.totalConcepts); // Concept count
console.log(stats.episodicMemory.totalEvents); // Event count
```

## 🔍 Key Features

- **Contextual Awareness**: Multi-layer memory provides rich context for responses
- **Semantic Understanding**: Vector embeddings enable semantic similarity matching
- **Concept Learning**: Automatic extraction and relationship mapping of concepts
- **Event Tracking**: Important milestones and events are preserved
- **Scalable Architecture**: Modular design supports easy extension and customization
- **Maintenance Automation**: Self-cleaning memory systems with configurable retention
- **TypeScript Safety**: Full type safety with comprehensive interfaces

## 🛠️ Development

### Testing
```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
```

### Linting
```bash
npm run lint           # Check code style
```

### Building
```bash
npm run build          # Compile TypeScript
npm run clean          # Clean build directory
```

## 📊 Memory System Details

### Short-Term Memory
- **Capacity**: Configurable (default: 50 interactions)
- **Eviction**: FIFO (First In, First Out)
- **Access Time**: O(1) for recent items
- **Use Case**: Immediate conversation context

### Mid/Long-Term Memory
- **Storage**: Weaviate vector database
- **Retrieval**: Semantic similarity search
- **Indexing**: Automatic vector embedding
- **Use Case**: Historical context and knowledge retrieval

### Semantic Tree
- **Structure**: Directed graph with weighted edges
- **Concepts**: Automatically extracted from interactions
- **Relationships**: Parent/child, related, synonym, antonym
- **Maintenance**: Strength-based pruning and updates

### Episodic Memory
- **Storage**: Firebase Firestore
- **Events**: Timestamped significant interactions
- **Metadata**: Importance scores, concept tags, context
- **Queries**: Time-based, importance-based, semantic similarity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**"OPENAI_API_KEY is required"**
- Ensure your OpenAI API key is set in the `.env` file

**Weaviate connection errors**
- Verify Weaviate is running on the specified URL
- Check API key configuration for cloud instances

**Firebase/Firestore errors**
- Verify all Firebase credentials are correctly set
- Ensure the Firebase project has Firestore enabled

**Memory not persisting**
- Check database connections and credentials
- Verify write permissions for the configured services

### Performance Tips

- Adjust `STM_BUFFER_SIZE` based on your use case
- Set appropriate retention periods to manage storage costs
- Use concept pruning to maintain semantic tree performance
- Monitor memory statistics to optimize configuration
