import express from 'express';
import cors from 'cors';

console.log('Starting Event Management API...');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Event Management API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple in-memory user store for testing
const users = [];

// Auth routes
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

// Event routes
app.get('/events', (req, res) => {
  // Return only approved events
  const approvedEvents = events.filter(event => event.approved);
  console.log(`Returning ${approvedEvents.length} approved events`);
  res.json({ events: approvedEvents });
});

app.get('/events/all', (req, res) => {
  console.log(`Returning all ${events.length} events`);
  res.json({ events });
});

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
      organizerId: 'demo-organizer',
      approved: false,
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
  console.log(`🚀 Event Management API running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /');
  console.log('  POST /auth/signup');
  console.log('  POST /auth/login');
  console.log('  GET  /events');
  console.log('  GET  /events/all');
  console.log('  POST /events');
  console.log('  PUT  /events/:id/approve');
});