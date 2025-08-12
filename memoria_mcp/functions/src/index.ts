import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { SimplifiedMemoryLayer } from './memory/memoryLayer';
import { authenticate, optionalAuth } from './middleware/auth';
import { mcpRouter } from './server/mcpServer';
import { visualizationRouter } from './api/visualization';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Configure CORS
app.use(cors({ 
  origin: true,
  credentials: true 
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize memory layer
let memoryLayer: SimplifiedMemoryLayer;

const initializeMemoryLayer = () => {
  if (!memoryLayer) {
    const config = functions.config();
    memoryLayer = new SimplifiedMemoryLayer(
      config.weaviate?.url || process.env.WEAVIATE_URL || '',
      config.weaviate?.api_key || process.env.WEAVIATE_API_KEY
    );
  }
  return memoryLayer;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'firebase-mcp-memory',
    timestamp: new Date().toISOString()
  });
});

// MCP endpoints (authenticated)
app.use('/mcp', authenticate, (req, res, next) => {
  req.memoryLayer = initializeMemoryLayer();
  next();
}, mcpRouter);

// Visualization API endpoints (optional auth for public viewing)
app.use('/api/memories', optionalAuth, (req, res, next) => {
  req.memoryLayer = initializeMemoryLayer();
  next();
}, visualizationRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// Export the Express app as a Firebase Function
export const mcpMemoryServer = functions.https.onRequest(app);

// Note: Scheduled functions removed for simplicity
// You can add them back using Firebase v2 functions syntax if needed