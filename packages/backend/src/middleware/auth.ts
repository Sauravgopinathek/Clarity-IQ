import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

type AuthenticatedUser = {
  sub: string;
  email?: string;
};

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Initialize Supabase client for auth verification
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Demo mode bypass
  if (token === 'demo-token') {
    req.user = { sub: 'demo-user-id', email: 'demo@clarityiq.ai' };
    return next();
  }

  try {
    // Let Supabase handle the exact algorithmic verification (ECC vs Shared Secret)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase JWT verification failed:', error?.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach the user object (we map user.id to sub for backward compatibility)
    req.user = { sub: user.id, email: user.email ?? undefined };
    next();
  } catch (error) {
    console.error('Unexpected error during auth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
