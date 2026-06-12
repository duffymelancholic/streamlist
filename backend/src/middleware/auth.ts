import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Try to get token from Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. If not found, try to extract from Cookie header (token=<token>)
  if (!token && req.headers.cookie) {
    const parsedCookies = req.headers.cookie.split(';').reduce((acc, current) => {
      const parts = current.trim().split('=');
      const key = parts[0];
      const value = parts.slice(1).join('='); // Handles cases where token contains '=' character
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);
    
    token = parsedCookies['token'];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
