import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback for development
let supabase: any = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' && process.env.SUPABASE_URL !== 'https://example.supabase.co') {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Auth middleware: Supabase client initialized');
    } else {
      console.warn('⚠️ Auth middleware: Missing Supabase credentials, using JWT-only authentication');
    }
  } catch (error) {
    console.warn('⚠️ Auth middleware: Supabase initialization failed, using JWT-only authentication');
  }
} else {
  console.log('ℹ️ Auth middleware: Running in development mode with JWT-only authentication');
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret);

    if ((decoded as any).type !== 'access') {
      return res.status(401).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Get user from database to ensure they still exist and are active
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_status, trial_end_date')
      .eq('id', (decoded as any).userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user info to request
    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(500).json({
      error: 'Authentication failed',
      code: 'INTERNAL_ERROR'
    });
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret);

    if ((decoded as any).type === 'access') {
      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, subscription_status, trial_end_date')
        .eq('id', (decoded as any).userId)
        .single();

      if (!userError && user) {
        req.userId = user.id;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // If optional auth fails, continue without authentication
    next();
  }
};