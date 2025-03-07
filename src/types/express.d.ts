import { User } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash' | 'salt'>;
    }
  }
}

// This is the correct way to extend the SessionData interface
declare module 'express-session' {
  interface Session {
    userId?: number;
    isAdmin?: boolean;
  }
}