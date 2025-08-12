# Memoria MCP Server - Firebase Deployment

A remote MCP (Model Context Protocol) server for semantic memory management, deployed on Firebase Functions with a web-based visualization interface.

## 🚀 Features

- **Semantic Memory Storage**: Store and retrieve conversation memories using Weaviate vector database
- **MCP Protocol Support**: Full implementation of Model Context Protocol for Claude Desktop integration
- **Firebase Deployment**: Scalable cloud deployment with Firebase Functions
- **Memory Visualization**: Interactive web interface for visualizing memory graphs
- **Authentication**: Firebase Auth integration with optional API key support
- **RESTful API**: Additional endpoints for memory management and export

## 📋 Prerequisites

- Node.js 18 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Weaviate instance (cloud or self-hosted)
- OpenAI API key (for text2vec-openai vectorizer)
- Firebase project with Functions and Hosting enabled

## 🔧 Setup

### 1. Clone and Install Dependencies

```bash
# Install main dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install
cd ..
```

### 2. Configure Weaviate

Create a Weaviate instance at [Weaviate Cloud](https://console.weaviate.cloud) or self-host.

### 3. Configure Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Functions (TypeScript)
# - Hosting
# - Use existing project or create new
```

Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 4. Set Environment Variables

#### For Firebase Functions:
```bash
# Set Firebase Functions config
firebase functions:config:set \
  weaviate.url="your-weaviate-cluster.weaviate.network" \
  weaviate.api_key="your-weaviate-api-key" \
  openai.api_key="your-openai-api-key" \
  visualization.api_key="optional-api-key-for-public-access"
```

#### For Local Development:
Create `functions/.env`:
```env
WEAVIATE_URL=your-weaviate-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
VISUALIZATION_API_KEY=optional-api-key
```

### 5. Configure Claude Desktop

Add to Claude Desktop's MCP settings (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "firebase-memory": {
      "command": "node",
      "args": ["/path/to/memoria_mcp/mcp-client-adapter.js"],
      "env": {
        "FIREBASE_ENDPOINT": "https://your-project.cloudfunctions.net/mcpMemoryServer",
        "FIREBASE_API_KEY": "your-firebase-web-api-key",
        "FIREBASE_AUTH_DOMAIN": "your-project.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

## 🚀 Deployment

### Deploy Everything
```bash
npm run firebase:deploy
```

### Deploy Functions Only
```bash
npm run firebase:deploy:functions
```

### Deploy Hosting Only
```bash
npm run firebase:deploy:hosting
```

### Local Testing
```bash
# Start Firebase emulators
npm run firebase:serve

# In another terminal, run MCP adapter
npm run mcp:local
```

## 📡 API Endpoints

### MCP Endpoints (Authenticated)
- `POST /mcp` - Main MCP protocol endpoint
- `GET /mcp/tools` - List available tools
- `GET /mcp/info` - Server information

### Visualization API (Optional Auth)
- `GET /api/memories/visualize` - Get graph visualization data
- `GET /api/memories/list` - List memories with pagination
- `GET /api/memories/stats` - Get memory statistics
- `GET /api/memories/export` - Export memories (JSON/CSV)
- `DELETE /api/memories/:id` - Delete specific memory

### Health Check
- `GET /health` - Server health status

## 🛠️ Available MCP Tools

### enhance_prompt
Enhance a user prompt with relevant memory context.
```json
{
  "userInput": "string",
  "maxContextLength": 2000
}
```

### store_conversation
Store a conversation turn in memory.
```json
{
  "userInput": "string",
  "response": "string",
  "concepts": ["string"],
  "metadata": {}
}
```

### retrieve_context
Retrieve relevant context for a query.
```json
{
  "query": "string",
  "limit": 5,
  "filters": {
    "startDate": "date",
    "endDate": "date",
    "concepts": ["string"]
  }
}
```

### search_memories
Search memories with advanced filters.
```json
{
  "searchTerm": "string",
  "searchType": "semantic|keyword|hybrid",
  "limit": 10
}
```

### get_memory_stats
Get statistics about stored memories.
```json
{
  "userId": "string"
}
```

## 🎨 Memory Visualization

Access the visualization interface at:
```
https://your-project.web.app/visualize.html
```

Features:
- Interactive force-directed graph
- Memory and concept nodes
- Temporal and semantic relationships
- Search and filter capabilities
- Export functionality
- Real-time statistics

## 🔐 Authentication

### Firebase Authentication
The server supports Firebase Auth tokens for user-specific memory storage.

### API Key Authentication
For visualization endpoints, you can use API key authentication:
```bash
curl -H "X-API-Key: your-api-key" \
  https://your-project.cloudfunctions.net/mcpMemoryServer/api/memories/stats
```

## 📊 Monitoring

### View Logs
```bash
npm run firebase:logs
```

### Firebase Console
Monitor usage, errors, and performance at:
```
https://console.firebase.google.com/project/your-project-id
```

## 🧪 Testing

### Test MCP Connection
```bash
# With the server running, test MCP tools
curl -X POST https://your-project.cloudfunctions.net/mcpMemoryServer/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Test Visualization API
```bash
curl https://your-project.cloudfunctions.net/mcpMemoryServer/api/memories/stats \
  -H "X-API-Key: your-api-key"
```

## 🏗️ Project Structure

```
memoria_mcp/
├── functions/              # Firebase Functions
│   ├── src/
│   │   ├── index.ts       # Main entry point
│   │   ├── server/        # MCP server implementation
│   │   ├── api/           # REST API endpoints
│   │   ├── middleware/    # Auth and middleware
│   │   └── memory/        # Memory layer
│   ├── package.json
│   └── tsconfig.json
├── public/                 # Firebase Hosting
│   └── visualize.html     # Visualization interface
├── mcp-client-adapter.js  # Local MCP adapter
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project config
└── claude-config.json    # Claude Desktop config example
```

## 🐛 Troubleshooting

### Weaviate Connection Issues
- Verify Weaviate URL doesn't include protocol (use `cluster.weaviate.network` not `https://cluster.weaviate.network`)
- Check API key is correct
- Ensure OpenAI API key is set for text2vec-openai

### Firebase Deployment Issues
- Run `firebase login` to authenticate
- Verify project ID in `.firebaserc`
- Check Functions runtime is Node.js 18
- Ensure billing is enabled for Firebase Functions

### MCP Connection Issues
- Check Firebase endpoint URL in Claude config
- Verify authentication tokens
- Monitor adapter logs with `npm run mcp:local`

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please submit pull requests or issues on GitHub.

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.