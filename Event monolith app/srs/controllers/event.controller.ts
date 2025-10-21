import { prisma } from '../utils/database';
import { AppError } from '../utils/errorHandler';
import { webSocketService } from '../services/websocket.service';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export const eventController = {
  async getAllEvents(userId: string) {
    const events = await prisma.event.findMany({
      where: {
        approved: true
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return events;
  },

  async createEvent(
    title: string, 
    description: string, 
    date: string, 
    location: string, 
    organizerId: string
  ) {
    if (!title || !description || !date || !location) {
      throw new AppError(400, 'All fields are required');
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      throw new AppError(400, 'Invalid date format');
    }

    if (eventDate < new Date()) {
      throw new AppError(400, 'Event date cannot be in the past');
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        location,
        organizerId,
        approved: false // Events need admin approval
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Notify all connected clients about new event
    webSocketService.broadcast({
      type: 'EVENT_CREATED',
      data: event
    });

    return {
      message: 'Event created successfully. Waiting for admin approval.',
      event
    };
  },

  async updateEvent(
    eventId: string,
    title: string,
    description: string,
    date: string,
    location: string,
    userId: string,
    userRole: string
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Check permissions
    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new AppError(403, 'Not authorized to update this event');
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    
    if (date) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new AppError(400, 'Invalid date format');
      }
      updateData.date = eventDate;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Notify subscribers about event update
    webSocketService.notifyEventSubscribers(eventId, {
      type: 'EVENT_UPDATED',
      data: updatedEvent
    });

    return {
      message: 'Event updated successfully',
      event: updatedEvent
    };
  },

  async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Check permissions
    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new AppError(403, 'Not authorized to delete this event');
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    // Notify all connected clients about event deletion
    webSocketService.broadcast({
      type: 'EVENT_DELETED',
      data: { id: eventId }
    });

    return {
      message: 'Event deleted successfully'
    };
  },

  async approveEvent(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const approvedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { approved: true },
      include: {
        organizer: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Send notification to organizer
    try {
      await emailService.sendEventNotification(
        event.organizerId, // In real app, get organizer email
        event.title,
        'approved'
      );
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }

    // Notify all connected clients about event approval
    webSocketService.broadcast({
      type: 'EVENT_APPROVED',
      data: approvedEvent
    });

    return {
      message: 'Event approved successfully',
      event: approvedEvent
    };
  }
};
