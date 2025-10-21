import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { rsvpRoutes } from './routes/rsvp.routes';
import { webSocketService } from './services/websocket.service';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Event Management API',
        version: '1.0.0',
        description: 'A monolith event management application with realtime features'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Events', description: 'Event management endpoints' },
        { name: 'RSVP', description: 'RSVP management endpoints' }
      ]
    }
  }))
  
  // Health check
  .get('/', () => ({ 
    message: 'Event Management API is running!',
    timestamp: new Date().toISOString()
  }))
  
  // WebSocket endpoint for realtime updates
  .ws('/ws', {
    open(ws) {
      const observer = {
        id: ws.id,
        send: (data: any) => ws.send(data)
      };
      webSocketService.subscribe(observer);
    },
    close(ws) {
      webSocketService.unsubscribe(ws.id);
    },
    message(ws, message: any) {
      try {
        const { type, eventId } = JSON.parse(message as string);
        
        if (type === 'SUBSCRIBE_EVENT' && eventId) {
          webSocketService.subscribeToEvent(ws.id, eventId);
          ws.send(JSON.stringify({ 
            type: 'SUBSCRIBED', 
            eventId,
            message: `Subscribed to event ${eventId} updates` 
          }));
        }
        
        if (type === 'UNSUBSCRIBE_EVENT' && eventId) {
          webSocketService.unsubscribeFromEvent(ws.id, eventId);
          ws.send(JSON.stringify({ 
            type: 'UNSUBSCRIBED', 
            eventId,
            message: `Unsubscribed from event ${eventId} updates` 
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    }
  })
  
  // Register routes
  .use(authRoutes)
  .use(eventRoutes)
  .use(rsvpRoutes)
  
  // Global error handler
  .onError(({ code, error, set }) => {
    console.error('Global error:', error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation error', details: error.message };
    }
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Route not found' };
    }
    
    set.status = 500;
    return { error: 'Internal server error' };
  });

const PORT = process.env.PORT || 3000;

console.log(`🚀 Event Management API starting on port ${PORT}`);
console.log(`📚 Swagger documentation available at http://localhost:${PORT}/swagger`);
console.log(`🔌 WebSocket endpoint available at ws://localhost:${PORT}/ws`);

app.listen(PORT);
