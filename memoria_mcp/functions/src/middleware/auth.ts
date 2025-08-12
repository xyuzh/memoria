import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
      memoryLayer?: any;
    }
  }
}

// Strict authentication middleware - requires valid Firebase token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    } catch (error: any) {
      console.error('Token verification error:', error);
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token',
        },
      });
      return;
    }
  } catch (error: any) {
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

// Optional authentication middleware - allows both authenticated and anonymous access
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for API key authentication (for visualization endpoints)
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      // Validate API key (you should store this securely)
      const validApiKey = process.env.VISUALIZATION_API_KEY;
      if (apiKey === validApiKey) {
        req.user = {
          uid: 'api-key-user',
          email: 'api@memoria.app',
        } as any;
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
    } catch (error) {
      // Token is invalid, but we allow anonymous access
      console.warn('Invalid token in optional auth, continuing as anonymous');
    }
    
    next();
  } catch (error: any) {
    console.error('Optional auth middleware error:', error);
    // Continue without authentication
    next();
  }
};

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 60000
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.user?.uid || req.ip || 'anonymous';
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

// CORS configuration middleware
export const configureCors = (allowedOrigins: string[] = ['*']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      userId: req.user?.uid,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });
  
  next();
};

// Validate request body middleware
export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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