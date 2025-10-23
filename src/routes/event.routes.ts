import Elysia from 'elysia';
import { eventController } from '../controllers/event.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { handleError } from '../utils/errorHandler';

export const eventRoutes = new Elysia({ prefix: '/events' })
  .use(authMiddleware)
  
  // Get all approved events
  .get('/', async ({ user, set }) => {
    try {
      const events = await eventController.getAllEvents(user.userId);
      return { events };
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  
  // Create event (Organizer role required)
  .post('/', async ({ body, user, set }) => {
    try {
      const { title, description, date, location } = body as any;
      const result = await eventController.createEvent(
        title, 
        description, 
        date, 
        location, 
        user.userId
      );
      set.status = 201;
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  .onBeforeHandle((context) => requireRole(['ORGANIZER', 'ADMIN'])(context))
  
  // Update event
  .put('/:id', async ({ params: { id }, body, user, set }) => {
    try {
      const { title, description, date, location } = body as any;
      const result = await eventController.updateEvent(
        id, title, description, date, location, user.userId, user.role
      );
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  
  // Delete event
  .delete('/:id', async ({ params: { id }, user, set }) => {
    try {
      const result = await eventController.deleteEvent(id, user.userId, user.role);
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  
  // Approve event (Admin only)
  .put('/:id/approve', async ({ params: { id }, set }) => {
    try {
      const result = await eventController.approveEvent(id);
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  .onBeforeHandle((context) => requireRole(['ADMIN'])(context));
