import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        subscriptionStatus?: string;
        trialEndDate?: Date;
        [key: string]: any;
      };
      userId?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
    trialEndDate: Date;
  };
  userId?: string;
}