import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { generateToken, JWTPayload } from '../utils/jwt.utils';
import { AppError } from '../utils/errorHandler';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export const authController = {
  async signup(email: string, password: string, role?: string) {
    // Validate input
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any || 'ATTENDEE'
      }
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.email.split('@')[0]);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - email failure shouldn't prevent signup
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(tokenPayload);

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(tokenPayload);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }
};
