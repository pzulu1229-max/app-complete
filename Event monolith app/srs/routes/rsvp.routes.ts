import Elysia from 'elysia';
import { rsvpController } from '../controllers/rsvp.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { handleError } from '../utils/errorHandler';

export const rsvpRoutes = new Elysia({ prefix: '/rsvp' })
  .use(authMiddleware)
  
  // RSVP to event
  .post('/events/:eventId', async ({ params: { eventId }, body, user, set }) => {
    try {
      const { status } = body as any;
      const result = await rsvpController.createRSVP(eventId, user.userId, status);
      set.status = 201;
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  
  // Get user's RSVPs
  .get('/my-rsvps', async ({ user, set }) => {
    try {
      const rsvps = await rsvpController.getUserRSVPs(user.userId);
      return { rsvps };
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  
  // Get event RSVPs (Organizer/Admin only)
  .get('/events/:eventId', async ({ params: { eventId }, user, set }) => {
    try {
      const rsvps = await rsvpController.getEventRSVPs(eventId);
      return { rsvps };
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  }, {
    beforeHandle: requireRole(['ORGANIZER', 'ADMIN'])
  });
