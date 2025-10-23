import Elysia from 'elysia';
import { rsvpController } from '../controllers/rsvp.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { handleError } from '../utils/errorHandler';

export const rsvpRoutes = new Elysia({ prefix: '/rsvp' })
  .use(authMiddleware)
  
  // RSVP to event
  .post('/events/:eventId', async (context: any) => {
    try {
      const { status } = context.body as any;
      const result = await rsvpController.createRSVP(
        context.params.eventId, 
        context.user.userId, 
        status
      );
      context.set.status = 201;
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      context.set.status = status;
      return { error: message };
    }
  })
  
  // Get user's RSVPs
  .get('/my-rsvps', async (context: any) => {
    try {
      const rsvps = await rsvpController.getUserRSVPs(context.user.userId);
      return { rsvps };
    } catch (error) {
      const { status, message } = handleError(error);
      context.set.status = status;
      return { error: message };
    }
  })
  
  // Get event RSVPs (Organizer/Admin only)
  .get('/events/:eventId', async (context: any) => {
    try {
      const rsvps = await rsvpController.getEventRSVPs(context.params.eventId);
      return { rsvps };
    } catch (error) {
      const { status, message } = handleError(error);
      context.set.status = status;
      return { error: message };
    }
  })
  .onBeforeHandle((context: any) => { requireRole(['ORGANIZER', 'ADMIN'])(context) });
