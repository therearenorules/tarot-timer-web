import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
    trialEndDate: Date;
  };
}

// JWT token generation
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// JWT token verification
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid access token'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      subscriptionStatus: 'trial', // Will be populated from database
      trialEndDate: new Date() // Will be populated from database
    };
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
}

// Optional authentication (for endpoints that work with or without auth)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        subscriptionStatus: 'trial',
        trialEndDate: new Date()
      };
    } catch (error) {
      // Token is invalid, but continue without user
      console.log('Invalid token in optional auth, continuing without user');
    }
  }
  
  next();
}

// Trial status checker
export function isInTrial(trialEndDate: Date): boolean {
  return new Date() < trialEndDate;
}

// Feature access checker
export function canAccessFeature(subscriptionStatus: string, trialEndDate: Date, feature: string): boolean {
  // During trial, all features are available
  if (isInTrial(trialEndDate)) {
    return true;
  }
  
  // Premium users have access to all features
  if (subscriptionStatus === 'active') {
    return true;
  }
  
  // Free users have limited access
  const freeFeatures = ['basic_spreads', 'limited_saves'];
  return freeFeatures.includes(feature);
}