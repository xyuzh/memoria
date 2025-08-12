"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpMemoryServer = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const memoryLayer_1 = require("./memory/memoryLayer");
const auth_1 = require("./middleware/auth");
const mcpServer_1 = require("./server/mcpServer");
const visualization_1 = require("./api/visualization");
// Initialize Firebase Admin
admin.initializeApp();
// Create Express app
const app = (0, express_1.default)();
// Configure CORS
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
// Parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Initialize memory layer
let memoryLayer;
const initializeMemoryLayer = () => {
    var _a, _b;
    if (!memoryLayer) {
        const config = functions.config();
        memoryLayer = new memoryLayer_1.SimplifiedMemoryLayer(((_a = config.weaviate) === null || _a === void 0 ? void 0 : _a.url) || process.env.WEAVIATE_URL || '', ((_b = config.weaviate) === null || _b === void 0 ? void 0 : _b.api_key) || process.env.WEAVIATE_API_KEY);
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
app.use('/mcp', auth_1.authenticate, (req, res, next) => {
    req.memoryLayer = initializeMemoryLayer();
    next();
}, mcpServer_1.mcpRouter);
// Visualization API endpoints (optional auth for public viewing)
app.use('/api/memories', auth_1.optionalAuth, (req, res, next) => {
    req.memoryLayer = initializeMemoryLayer();
    next();
}, visualization_1.visualizationRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            code: err.code || 'INTERNAL_ERROR'
        }
    });
});
// Export the Express app as a Firebase Function
exports.mcpMemoryServer = functions.https.onRequest(app);
// Note: Scheduled functions removed for simplicity
// You can add them back using Firebase v2 functions syntax if needed
//# sourceMappingURL=index.js.map