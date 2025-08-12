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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.requestLogger = exports.configureCors = exports.rateLimit = exports.optionalAuth = exports.authenticate = void 0;
const admin = __importStar(require("firebase-admin"));
// Strict authentication middleware - requires valid Firebase token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing or invalid authorization header',
                },
            });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        }
        catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired authentication token',
                },
            });
            return;
        }
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication processing error',
            },
        });
        return;
    }
};
exports.authenticate = authenticate;
// Optional authentication middleware - allows both authenticated and anonymous access
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Check for API key authentication (for visualization endpoints)
        const apiKey = req.headers['x-api-key'];
        if (apiKey) {
            // Validate API key (you should store this securely)
            const validApiKey = process.env.VISUALIZATION_API_KEY;
            if (apiKey === validApiKey) {
                req.user = {
                    uid: 'api-key-user',
                    email: 'api@memoria.app',
                };
                return next();
            }
        }
        // If no auth header, continue as anonymous
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
        }
        catch (error) {
            // Token is invalid, but we allow anonymous access
            console.warn('Invalid token in optional auth, continuing as anonymous');
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        // Continue without authentication
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Rate limiting middleware
const requestCounts = new Map();
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        var _a;
        const identifier = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid) || req.ip || 'anonymous';
        const now = Date.now();
        const userLimit = requestCounts.get(identifier);
        if (!userLimit || now > userLimit.resetTime) {
            requestCounts.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            next();
            return;
        }
        if (userLimit.count >= maxRequests) {
            res.status(429).json({
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests, please try again later',
                    retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
                },
            });
            return;
        }
        userLimit.count++;
        next();
    };
};
exports.rateLimit = rateLimit;
// CORS configuration middleware
const configureCors = (allowedOrigins = ['*']) => {
    return (req, res, next) => {
        const origin = req.headers.origin;
        if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        if (req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
    };
};
exports.configureCors = configureCors;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        var _a;
        const duration = Date.now() - start;
        console.log({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    });
    next();
};
exports.requestLogger = requestLogger;
// Validate request body middleware
const validateBody = (schema) => {
    return (req, res, next) => {
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Invalid request body',
                    details: validation.error.errors,
                },
            });
            return;
        }
        req.body = validation.data;
        next();
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=auth.js.map