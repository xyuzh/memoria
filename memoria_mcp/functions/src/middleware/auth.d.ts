import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
            memoryLayer?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimit: (maxRequests?: number, windowMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const configureCors: (allowedOrigins?: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBody: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map