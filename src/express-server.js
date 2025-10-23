import express from 'express';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

console.log('Starting Express server...');

const app = express();
const PORT = 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'A monolith event management application with authentication, user roles, and realtime features',
      contact: {
        name: 'API Support',
        email: 'support@eventapp.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/express-server.js'] // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(cors());
app.use(express.json());

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API status and timestamp
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Event Management API is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple in-memory user store for testing
const users = [];

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ORGANIZER, ATTENDEE]
 *                 default: ATTENDEE
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 */
app.post('/auth/signup', async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    
    const { email, password, role = 'ATTENDEE' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password,
      role,
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    console.log('User created:', user.email);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 */
app.post('/auth/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Simple token
    const token = `token-${user.id}-${Date.now()}`;
    
    console.log('User logged in:', user.email);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple in-memory event store
const events = [];

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all approved events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of approved events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                       location:
 *                         type: string
 *                       approved:
 *                         type: boolean
 */
app.get('/events', (req, res) => {
  // Return only approved events
  const approvedEvents = events.filter(event => event.approved);
  console.log(`Returning ${approvedEvents.length} approved events`);
  res.json({ events: approvedEvents });
});

/**
 * @swagger
 * /events/all:
 *   get:
 *     summary: Get all events (including unapproved - Admin only)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 */
app.get('/events/all', (req, res) => {
  console.log(`Returning all ${events.length} events`);
  res.json({ events });
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Organizer role required)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Missing required fields
 */
app.post('/events', (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    
    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const event = {
      id: Date.now().toString(),
      title,
      description,
      date,
      location,
      organizerId: 'demo-organizer', // In real app, get from auth token
      approved: false, // Events need admin approval
      createdAt: new Date().toISOString()
    };
    
    events.push(event);
    
    console.log('Event created:', event.title);
    
    res.status(201).json({
      message: 'Event created successfully. Waiting for admin approval.',
      event
    });
    
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /events/{id}/approve:
 *   put:
 *     summary: Approve an event (Admin role required)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event approved successfully
 *       404:
 *         description: Event not found
 */
app.put('/events/:id/approve', (req, res) => {
  try {
    const eventId = req.params.id;
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    event.approved = true;
    
    console.log('Event approved:', event.title);
    
    res.json({
      message: 'Event approved successfully',
      event
    });
    
  } catch (error) {
    console.error('Event approval error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Event Management API running on http://localhost:3000');
  console.log('📚 Swagger documentation available at http://localhost:3000/api-docs');
  console.log('Available endpoints:');
  console.log('  GET  /');
  console.log('  POST /auth/signup');
  console.log('  POST /auth/login');
  console.log('  GET  /events');
  console.log('  GET  /events/all');
  console.log('  POST /events');
  console.log('  PUT  /events/:id/approve');
});