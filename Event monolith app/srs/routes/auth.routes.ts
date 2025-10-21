import Elysia from 'elysia';
import { authController } from '../controllers/auth.controller';
import { handleError } from '../utils/errorHandler';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/signup', async ({ body, set }) => {
    try {
      const { email, password, role } = body as any;
      const result = await authController.signup(email, password, role);
      set.status = 201;
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  })
  .post('/login', async ({ body, set }) => {
    try {
      const { email, password } = body as any;
      const result = await authController.login(email, password);
      return result;
    } catch (error) {
      const { status, message } = handleError(error);
      set.status = status;
      return { error: message };
    }
  });
