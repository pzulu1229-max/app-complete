import Elysia from 'elysia';
import { verifyToken } from '../utils/jwt.utils';
import { AppError } from '../utils/errorHandler';

export const authMiddleware = new Elysia()
  .derive({ as: 'scoped' }, async ({ request, set }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token required');
    }

    const token = authHeader.slice(7);
    
    try {
      const decoded = verifyToken(token);
      return { user: decoded };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired token');
    }
  });

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return new Elysia().derive({ as: 'scoped' }, (context: any) => {
    if (!user || !allowedRoles.includes(user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }
    return { user };
  });
};
